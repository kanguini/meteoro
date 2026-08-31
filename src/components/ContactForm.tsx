'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from './Icons';
import type { Content } from '@/i18n/types';

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;
type Status = 'idle' | 'sending' | 'success' | 'error' | 'not_configured';

export function ContactForm({ content, fallbackEmail }: { content: Content; fallbackEmail: string }) {
  const t = content.contact.form;
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    const nextErrors: Errors = {};
    if (!name) nextErrors.name = t.required;
    if (!email) nextErrors.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = t.invalidEmail;
    if (!message) nextErrors.message = t.required;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      form.querySelector<HTMLElement>('[data-invalid="true"] input, [data-invalid="true"] textarea')?.focus();
      return;
    }

    setStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          phone: String(data.get('phone') ?? '').trim(),
          subject: String(data.get('subject') ?? '').trim(),
          locale: document.documentElement.lang.startsWith('pt') ? 'pt' : 'en',
        }),
      });

      if (response.ok) {
        setStatus('success');
        form.reset();
        return;
      }

      const payload = (await response.json().catch(() => null)) as { code?: string } | null;
      setStatus(payload?.code === 'not_configured' ? 'not_configured' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div>
      <h2 className="h3">{t.title}</h2>

      <form className="form" onSubmit={handleSubmit} noValidate style={{ marginTop: '2rem' }}>
        <div className="form__row">
          <div className="field" data-invalid={Boolean(errors.name)}>
            <label className="field__label" htmlFor="name">
              {t.name} *
            </label>
            <input
              className="field__input"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span className="field__error" id="name-error">
                {errors.name}
              </span>
            )}
          </div>

          <div className="field" data-invalid={Boolean(errors.email)}>
            <label className="field__label" htmlFor="email">
              {t.email} *
            </label>
            <input
              className="field__input"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span className="field__error" id="email-error">
                {errors.email}
              </span>
            )}
          </div>
        </div>

        <div className="form__row">
          <div className="field">
            <label className="field__label" htmlFor="phone">
              {t.phone}
            </label>
            <input className="field__input" id="phone" name="phone" type="tel" autoComplete="tel" />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="subject">
              {t.subject}
            </label>
            <select className="field__select" id="subject" name="subject" defaultValue={t.subjectOptions[0]}>
              {t.subjectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field" data-invalid={Boolean(errors.message)}>
          <label className="field__label" htmlFor="message">
            {t.message} *
          </label>
          <textarea
            className="field__textarea"
            id="message"
            name="message"
            rows={6}
            required
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && (
            <span className="field__error" id="message-error">
              {errors.message}
            </span>
          )}
        </div>

        <div className="form__footer">
          <button type="submit" className="btn btn--red" disabled={status === 'sending'}>
            {status === 'sending' ? t.sending : t.submit}
            <ArrowRight />
          </button>
          <p className="form__privacy">{t.privacy}</p>
        </div>

        <div aria-live="polite">
          {status === 'success' && (
            <p className="form__status" data-tone="success">
              {t.success}
            </p>
          )}
          {status === 'error' && <p className="form__status">{t.error}</p>}
          {status === 'not_configured' && (
            <p className="form__status">
              {t.error}{' '}
              <a href={`mailto:${fallbackEmail}`} style={{ textDecoration: 'underline' }}>
                {fallbackEmail}
              </a>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
