import nodemailer from 'nodemailer';

/**
 * Envio de email pelo SMTP da Hostinger, usando a caixa de correio do domínio.
 *
 *   SMTP_HOST=smtp.hostinger.com
 *   SMTP_PORT=465
 *   SMTP_SECURE=true
 *   SMTP_USER=geral@meteoro24.ao
 *   SMTP_PASS=...
 *   SMTP_FROM=Site Meteoro 24 <geral@meteoro24.ao>
 *   CONTACT_TO=geral@inovholding.com
 *
 * Sem estas variáveis o formulário continua a funcionar: a mensagem fica
 * guardada no painel, apenas ninguém é avisado por email.
 */

export function mailerConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  if (!mailerConfigured()) return false;

  const port = Number(process.env.SMTP_PORT ?? '465');

  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // A porta 465 é TLS implícito; a 587 começa em claro e faz STARTTLS.
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: {
        user: process.env.SMTP_USER as string,
        pass: process.env.SMTP_PASS as string,
      },
    });

    await transport.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
    });

    return true;
  } catch (error) {
    console.error('[mailer] falha a enviar', error);
    return false;
  }
}
