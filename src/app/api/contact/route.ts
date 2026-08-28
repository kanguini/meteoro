import { NextResponse } from 'next/server';
import { site } from '@/lib/site';

/**
 * Recebe o formulário de contacto e encaminha por email via Resend.
 *
 * Requer duas variáveis de ambiente:
 *   RESEND_API_KEY  — chave da conta Resend
 *   CONTACT_TO      — destinatário interno (por omissão, site.email)
 *   CONTACT_FROM    — remetente verificado no domínio (ex.: site@meteoro24.ao)
 *
 * Sem RESEND_API_KEY a rota devolve 503 com code "not_configured" e o
 * formulário mostra o email directo — nunca finge que a mensagem seguiu.
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
  const message = String(payload.message ?? '').trim();
  const phone = String(payload.phone ?? '').trim();
  const subject = String(payload.subject ?? '').trim();

  if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ code: 'invalid' }, { status: 422 });
  }

  if (name.length > 120 || email.length > 200 || message.length > 5000) {
    return NextResponse.json({ code: 'too_long' }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? site.email;
  const from = process.env.CONTACT_FROM;

  if (!apiKey || !from) {
    return NextResponse.json({ code: 'not_configured' }, { status: 503 });
  }

  const lines = [
    `Nome: ${name}`,
    `Email: ${email}`,
    phone ? `Telefone: ${phone}` : null,
    subject ? `Assunto: ${subject}` : null,
    '',
    message,
  ].filter(Boolean);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[Site] ${subject || 'Novo contacto'} — ${name}`,
        text: lines.join('\n'),
      }),
    });

    if (!response.ok) {
      console.error('[contact] Resend respondeu', response.status, await response.text());
      return NextResponse.json({ code: 'send_failed' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[contact] falha ao contactar o Resend', error);
    return NextResponse.json({ code: 'send_failed' }, { status: 502 });
  }
}
