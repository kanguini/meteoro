import { NextResponse } from 'next/server';
import { db, hasDatabase } from '@/db';
import { messages } from '@/db/schema';
import { getSettings } from '@/lib/content';
import { isLocale } from '@/i18n/config';

/**
 * Recebe o formulário de contacto.
 *
 * A mensagem é gravada primeiro e só depois se tenta enviar o email. Se o envio
 * falhar, a mensagem continua no painel marcada como "email não enviado" — o
 * contacto do cliente nunca se perde por causa de uma chave de API em falta.
 *
 * Variáveis opcionais para o email:
 *   RESEND_API_KEY, CONTACT_FROM (remetente verificado), CONTACT_TO (destino)
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;

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
      const [row] = await db
        .insert(messages)
        .values({ name, email, phone, subject, body, locale })
        .returning({ id: messages.id });
      messageId = row.id;
    } catch (error) {
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

async function sendNotification(data: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  locale: 'pt' | 'en';
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  if (!apiKey || !from) return false;

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

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `[Site] ${data.subject || 'Novo contacto'} — ${data.name}`,
        text: lines.join('\n'),
      }),
    });

    if (!response.ok) {
      console.error('[contact] Resend respondeu', response.status, await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('[contact] falha de rede ao enviar', error);
    return false;
  }
}
