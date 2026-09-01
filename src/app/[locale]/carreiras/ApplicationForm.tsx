'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight } from '@/components/Icons';
import type { Content, JobEntry } from '@/lib/careers-types';
import type { Locale } from '@/i18n/config';

type Errors = Partial<Record<'name' | 'email' | 'cv', string>>;
type Status = 'idle' | 'sending' | 'success' | 'error';

export function ApplicationForm({
  careers,
  jobs,
  locale,
}: {
  careers: Content['careers'];
  jobs: JobEntry[];
  locale: Locale;
}) {
  const t = careers.form;
  const [selected, setSelected] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [fileName, setFileName] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);

  // O botão "Candidatar-me" de uma vaga pré-selecciona-a aqui.
  useEffect(() => {
    const onApply = (event: Event) => {
      const slug = (event as CustomEvent<string>).detail ?? '';
      setSelected(slug);
      formRef.current?.querySelector<HTMLInputElement>('#ap-name')?.focus();
    };
    window.addEventListener('meteoro:apply', onApply);
    return () => window.removeEventListener('meteoro:apply', onApply);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const cv = data.get('cv');

    const next: Errors = {};
    if (!name) next.name = t.required;
    if (!email) next.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t.invalidEmail;
    if (!(cv instanceof File) || cv.size === 0) next.cv = t.cvRequired;

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    data.set('locale', locale);

    setStatus('sending');
    try {
      const response = await fetch('/api/carreiras', { method: 'POST', body: data });
      if (response.ok) {
        setStatus('success');
        form.reset();
        setSelected('');
        setFileName('');
        return;
      }
      const payload = (await response.json().catch(() => null)) as { code?: string; error?: string } | null;
      if (payload?.code === 'cv_invalid' && payload.error) {
        setErrors({ cv: payload.error });
        setStatus('idle');
        return;
      }
      setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <form className="form" ref={formRef} onSubmit={handleSubmit} noValidate>
      <div className="form__row">
        <div className="field" data-invalid={Boolean(errors.name)}>
          <label className="field__label" htmlFor="ap-name">
            {t.name} *
          </label>
          <input
            className="field__input"
            id="ap-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'ap-name-error' : undefined}
          />
          {errors.name && (
            <span className="field__error" id="ap-name-error">
              {errors.name}
            </span>
          )}
        </div>

        <div className="field" data-invalid={Boolean(errors.email)}>
          <label className="field__label" htmlFor="ap-email">
            {t.email} *
          </label>
          <input
            className="field__input"
            id="ap-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'ap-email-error' : undefined}
          />
          {errors.email && (
            <span className="field__error" id="ap-email-error">
              {errors.email}
            </span>
          )}
        </div>
      </div>

      <div className="form__row">
        <div className="field">
          <label className="field__label" htmlFor="ap-phone">
            {t.phone}
          </label>
          <input className="field__input" id="ap-phone" name="phone" type="tel" autoComplete="tel" />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="ap-position">
            {t.position}
          </label>
          <select
            className="field__select"
            id="ap-position"
            name="jobSlug"
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            <option value="">{t.spontaneousOption}</option>
            {jobs.map((job) => (
              <option key={job.slug} value={job.slug}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field" data-invalid={Boolean(errors.cv)}>
        <label className="field__label" htmlFor="ap-cv">
          {t.cv} *
        </label>
        <input
          className="field__file"
          id="ap-cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          aria-invalid={Boolean(errors.cv)}
          aria-describedby={errors.cv ? 'ap-cv-error' : 'ap-cv-hint'}
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
        />
        {fileName && <span className="field__hint">{fileName}</span>}
        <span className="field__hint" id="ap-cv-hint">
          {t.cvHint}
        </span>
        {errors.cv && (
          <span className="field__error" id="ap-cv-error">
            {errors.cv}
          </span>
        )}
      </div>

      <div className="field">
        <label className="field__label" htmlFor="ap-message">
          {t.message}
        </label>
        <textarea className="field__textarea" id="ap-message" name="message" rows={5} />
        <span className="field__hint">{t.messageHint}</span>
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
      </div>
    </form>
  );
}
