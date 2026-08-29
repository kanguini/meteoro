'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login, type LoginState } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="adm-btn" disabled={pending} style={{ width: '100%' }}>
      {pending ? 'A entrar...' : 'Entrar'}
    </button>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} style={{ display: 'grid', gap: '1rem' }}>
      <input type="hidden" name="seguinte" value={next ?? '/admin'} />

      <div className="adm-field">
        <label className="adm-field__label" htmlFor="email">
          Email
        </label>
        <input
          className="adm-input"
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
        />
      </div>

      <div className="adm-field">
        <label className="adm-field__label" htmlFor="password">
          Password
        </label>
        <input
          className="adm-input"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state.error && (
        <p className="adm-note adm-note--error" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
