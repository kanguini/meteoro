'use client';

import { useActionState } from 'react';
import type { ActionState } from '../ui';
import { SaveBar } from '../SaveBar';
import { uploadMedia } from './actions';

export function UploadForm({ disabled }: { disabled: boolean }) {
  const [state, formAction] = useActionState<ActionState, FormData>(uploadMedia, {});

  return (
    <form action={formAction}>
      <div className="adm-field">
        <label className="adm-field__label" htmlFor="files">
          Ficheiros
        </label>
        <input
          className="adm-input"
          id="files"
          name="files"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={disabled}
        />
        <span className="adm-field__hint">JPG, PNG, WebP ou AVIF, até 8 MB cada.</span>
      </div>

      <SaveBar state={state} label="Carregar" />
    </form>
  );
}
