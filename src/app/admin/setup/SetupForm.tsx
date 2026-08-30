'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createFirstUser, type SetupState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="adm-btn" disabled={pending} style={{ width: '100%' }}>
      {pending ? 'A criar...' : 'Criar conta e entrar'}
    </button>
  );
}

export function SetupForm() {
  const [state, formAction] = useActionState<SetupState, FormData>(createFirstUser, {});

  return (
    <form action={formAction} style={{ display: 'grid', gap: '1rem' }}>
      <div className="adm-field">
        <label className="adm-field__label" htmlFor="token">
          Código de instalação
        </label>
        <input className="adm-input" id="token" name="token" type="password" required autoFocus />
        <span className="adm-field__hint">O valor que pôs em SETUP_TOKEN nas variáveis de ambiente.</span>
      </div>

      <div className="adm-field">
        <label className="adm-field__label" htmlFor="name">
          Nome
        </label>
        <input className="adm-input" id="name" name="name" type="text" required />
      </div>

      <div className="adm-field">
        <label className="adm-field__label" htmlFor="email">
          Email
        </label>
        <input className="adm-input" id="email" name="email" type="email" autoComplete="username" required />
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
          autoComplete="new-password"
          required
        />
        <span className="adm-field__hint">Pelo menos 10 caracteres, com letras e números.</span>
      </div>

      <div className="adm-field">
        <label className="adm-field__label" htmlFor="confirmation">
          Confirmar password
        </label>
        <input
          className="adm-input"
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
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
