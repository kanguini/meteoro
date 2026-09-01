import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, hasDatabase } from '@/db';
import { applications, jobs, jobTranslations } from '@/db/schema';
import { getSettings } from '@/lib/content';
import { newId } from '@/lib/id';
import { mailerConfigured, sendMail } from '@/lib/mailer';
import { uploadCv } from '@/lib/storage';
import { clientIp, hit } from '@/lib/rate-limit';
import { isLocale } from '@/i18n/config';

/**
 * Recebe uma candidatura: dados + CV, numa única submissão multipart.
 *
 * A candidatura é gravada primeiro (com o CV já em disco) e só depois se tenta
 * o email — se o SMTP falhar, a candidatura fica na mesma no painel. O envio de
 * dados pessoais (CV) exige base de dados: sem ela, recusa-se com clareza em vez
 * de aceitar um ficheiro que ninguém veria.
 */
export async function POST(request: Request) {
  // 5 candidaturas por IP por hora — trava spam e enchimento do disco com CVs.
  const ip = await clientIp();
  const gate = hit(`carreiras:${ip}`, 5, 60 * 60 * 1000);
  if (!gate.ok) {
    return NextResponse.json(
      { code: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(gate.retryAfterSeconds) } },
    );
  }

  if (!hasDatabase()) {
    return NextResponse.json({ code: 'not_configured' }, { status: 503 });
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ code: 'bad_request' }, { status: 400 });
  }

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const phone = String(form.get('phone') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();
  const jobSlug = String(form.get('jobSlug') ?? '').trim();
  const rawLocale = String(form.get('locale') ?? 'pt');
  const locale = isLocale(rawLocale) ? rawLocale : 'pt';
  const file = form.get('cv');

  if (name.length < 2 || name.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ code: 'invalid' }, { status: 422 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ code: 'cv_required' }, { status: 422 });
  }

  // Resolve a vaga (se houver): confirma que existe e apanha o título para o
  // histórico. jobSlug vazio = candidatura espontânea.
  let jobId: string | null = null;
  let jobTitle = '';

  if (jobSlug) {
    const [job] = await db
      .select({ id: jobs.id, title: jobTranslations.title })
      .from(jobs)
      .leftJoin(jobTranslations, eq(jobTranslations.jobId, jobs.id))
      .where(eq(jobs.slug, jobSlug))
      .limit(1);

    if (job) {
      jobId = job.id;
      jobTitle = job.title ?? jobSlug;
    } else {
      jobTitle = jobSlug;
    }
  }

  const cv = await uploadCv(file);
  if (!cv.ok) {
    return NextResponse.json({ code: 'cv_invalid', error: cv.error }, { status: 422 });
  }

  const id = newId();
  try {
    await db.insert(applications).values({
      id,
      jobId,
      jobTitle: jobTitle.slice(0, 200),
      name: name.slice(0, 160),
      email: email.slice(0, 200),
      phone: phone.slice(0, 60),
      message: message.slice(0, 2000),
      cvPath: cv.path,
      cvFilename: cv.filename,
      locale,
    });
  } catch (error) {
    console.error('[carreiras] falha a gravar a candidatura', error);
    return NextResponse.json({ code: 'save_failed' }, { status: 500 });
  }

  // Notifica a equipa, com o CV em anexo. A candidatura já está guardada, por
  // isso uma falha de email não a perde.
  void notify({ name, email, phone, message, jobTitle, locale, cvPath: cv.path, cvFilename: cv.filename });

  return NextResponse.json({ ok: true });
}

async function notify(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
  jobTitle: string;
  locale: 'pt' | 'en';
  cvPath: string;
  cvFilename: string;
}): Promise<void> {
  if (!mailerConfigured()) return;

  try {
    const settings = await getSettings(data.locale);
    const to = process.env.CONTACT_TO ?? settings.email;
    const position = data.jobTitle || 'Candidatura espontânea';

    const lines = [
      `Vaga: ${position}`,
      `Nome: ${data.name}`,
      `Email: ${data.email}`,
      data.phone ? `Telefone: ${data.phone}` : null,
      '',
      data.message || '(sem mensagem)',
    ].filter(Boolean);

    // Lê o CV para anexar. Import dinâmico para não carregar o fs no caminho comum.
    const { readCv } = await import('@/lib/storage');
    const cv = await readCv(data.cvPath);

    await sendMail({
      to,
      replyTo: data.email,
      subject: oneLine(`[Carreiras] ${data.name} — ${position}`),
      text: lines.join('\n'),
      attachments: cv ? [{ filename: data.cvFilename || 'cv.pdf', content: cv.buffer, contentType: cv.contentType }] : undefined,
    });
  } catch (error) {
    console.error('[carreiras] falha a notificar por email', error);
  }
}

function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').slice(0, 200);
}
