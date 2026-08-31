import { NextResponse } from 'next/server';
import { db, hasDatabase } from '@/db';
import { messages } from '@/db/schema';
import { getSettings } from '@/lib/content';
import { newId } from '@/lib/id';
import { mailerConfigured, sendMail } from '@/lib/mailer';
import { isLocale } from '@/i18n/config';
import { clientIp, hit } from '@/lib/rate-limit';

/**
 * Recebe o formulário de contacto.
 *
 * A mensagem é gravada primeiro e só depois se tenta enviar o email. Se o envio
 * falhar, a mensagem continua no painel marcada como "email não enviado" — o
 * contacto do cliente nunca se perde por causa de uma chave de API em falta.
 *
 * O email sai pelo SMTP da Hostinger — ver src/lib/mailer.ts.
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  // No máximo 5 mensagens por IP em 10 minutos — trava spam e inundação da tabela.
  const ip = await clientIp();
  const gate = hit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!gate.ok) {
    return NextResponse.json({ code: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(gate.retryAfterSeconds) } });
  }

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ code: 'bad_request' }, { status: 400 });
  }

  const name = String(payload.name ?? '').trim();
  const email = String(payload.email ?? '').trim();
  const body = String(payload.message ?? '').trim();
  const phone = String(payload.phone ?? '').trim();
  const subject = String(payload.subject ?? '').trim();
  const rawLocale = String(payload.locale ?? 'pt');
  const locale = isLocale(rawLocale) ? rawLocale : 'pt';

  if (!name || !email || !body || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ code: 'invalid' }, { status: 422 });
  }

  if (name.length > 120 || email.length > 200 || body.length > 5000) {
    return NextResponse.json({ code: 'too_long' }, { status: 422 });
  }

  const stored = hasDatabase();
  let messageId: string | null = null;

  if (stored) {
    try {
      messageId = newId();
      await db.insert(messages).values({ id: messageId, name, email, phone, subject, body, locale });
    } catch (error) {
      messageId = null;
      console.error('[contact] falha a gravar a mensagem', error);
      // Sem base de dados a funcionar, o email passa a ser a única via —
      // continuamos para o envio em vez de desistir.
    }
  }

  const emailed = await sendNotification({ name, email, phone, subject, body, locale });

  if (messageId && emailed) {
    try {
      const { eq } = await import('drizzle-orm');
      await db.update(messages).set({ emailed: true }).where(eq(messages.id, messageId));
    } catch (error) {
      console.error('[contact] mensagem enviada mas não foi possível marcar como tal', error);
    }
  }

  // Só é erro para quem preencheu se nem gravámos nem enviámos.
  if (!messageId && !emailed) {
    return NextResponse.json({ code: 'not_configured' }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}

/** Remove quebras de linha: impede injeção de cabeçalhos no assunto do email. */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').slice(0, 200);
}

async function sendNotification(data: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  locale: 'pt' | 'en';
}): Promise<boolean> {
  if (!mailerConfigured()) return false;

  const settings = await getSettings(data.locale);
  const to = process.env.CONTACT_TO ?? settings.email;

  const lines = [
    `Nome: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Telefone: ${data.phone}` : null,
    data.subject ? `Assunto: ${data.subject}` : null,
    '',
    data.body,
  ].filter(Boolean);

  return sendMail({
    to,
    replyTo: data.email,
    subject: oneLine(`[Site] ${data.subject || 'Novo contacto'} — ${data.name}`),
    text: lines.join('\n'),
  });
}
