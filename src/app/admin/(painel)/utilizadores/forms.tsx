'use client';

import { useActionState } from 'react';
import { Field, type ActionState } from '../ui';
import { SaveBar } from '../SaveBar';
import { createUser, resetUserPassword } from './actions';

export function NewUserForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(createUser, {});

  return (
    <form action={formAction}>
      <div className="admin-grid admin-grid--2">
        <Field label="Nome" name="name" required />
        <Field label="Email" name="email" type="email" required />
        <Field
          label="Password inicial"
          name="password"
          type="password"
          required
          hint="Mínimo 10 caracteres, com letras e números."
        />
        <div className="adm-field">
          <label className="adm-field__label" htmlFor="role">
            Papel
          </label>
          <select className="adm-select" id="role" name="role" defaultValue="editor">
            <option value="editor">Editor — edita o conteúdo do site</option>
            <option value="owner">Dono — edita o conteúdo e gere as contas</option>
          </select>
        </div>
      </div>

      <SaveBar state={state} label="Criar conta" />
    </form>
  );
}

export function PasswordResetForm({ userId }: { userId: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(resetUserPassword, {});

  return (
    <form action={formAction} style={{ display: 'grid', gap: '0.4rem' }}>
      <input type="hidden" name="id" value={userId} />
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <input
          className="adm-input"
          name="password"
          type="password"
          placeholder="Nova password"
          autoComplete="new-password"
        />
        <button type="submit" className="adm-btn adm-btn--ghost adm-btn--small">
          Alterar
        </button>
      </div>
      {state.error && <span className="adm-field__hint" style={{ color: 'var(--admin-red)' }}>{state.error}</span>}
      {state.ok && <span className="adm-field__hint" style={{ color: 'var(--admin-green)' }}>{state.message}</span>}
    </form>
  );
}
