'use client';

import { useFormStatus } from 'react-dom';
import type { ActionState } from './ui';

/**
 * Barra de gravação com o estado da última tentativa.
 * Fica colada ao fundo para não obrigar a percorrer formulários longos.
 */
export function SaveBar({ state, label = 'Guardar alterações' }: { state: ActionState; label?: string }) {
  const { pending } = useFormStatus();

  return (
    <div className="adm-savebar">
      <button type="submit" className="adm-btn" disabled={pending}>
        {pending ? 'A guardar...' : label}
      </button>

      {!pending && state.ok && (
        <span className="adm-note adm-note--ok" role="status">
          {state.message ?? 'Guardado.'}
        </span>
      )}

      {!pending && state.error && (
        <span className="adm-note adm-note--error" role="alert">
          {state.error}
        </span>
      )}
    </div>
  );
}
