'use client';

import { useRef, useState } from 'react';
import { isVideo } from '@/lib/media';

type LibraryItem = { url: string; filename: string };

/**
 * Escolhe a capa por três vias: carregar do computador, escolher da biblioteca
 * ou colar um endereço externo. Aceita imagem e vídeo.
 *
 * O upload é feito por fetch a /api/admin/upload em vez de uma server action:
 * este selector vive dentro do formulário das definições e não se podem
 * aninhar formulários.
 */
export function MediaPicker({
  name,
  label,
  defaultValue,
  library,
  hint,
  allowVideo = false,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  library: LibraryItem[];
  hint?: string;
  allowVideo?: boolean;
}) {
  const [value, setValue] = useState(defaultValue ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement | null>(null);

  const accept = allowVideo
    ? 'image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime'
    : 'image/jpeg,image/png,image/webp,image/avif';

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);

    try {
      const body = new FormData();
      body.append('file', file);

      const response = await fetch('/api/admin/upload', { method: 'POST', body });
      const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (!response.ok || !payload?.url) {
        setError(payload?.error ?? 'Não foi possível carregar o ficheiro.');
        return;
      }

      setValue(payload.url);
    } catch {
      setError('Falha de rede ao carregar o ficheiro.');
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  return (
    <div className="adm-field">
      <span className="adm-field__label">{label}</span>

      <div className="adm-picker">
        {value ? (
          isVideo(value) ? (
            <video className="adm-picker__preview" src={value} muted playsInline preload="metadata" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="adm-picker__preview" src={value} alt="" />
          )
        ) : (
          <span className="adm-picker__preview" aria-hidden="true" />
        )}

        <div style={{ display: 'grid', gap: '0.6rem', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="adm-btn adm-btn--small"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
            >
              {busy ? 'A carregar...' : 'Carregar do computador'}
            </button>

            {library.length > 0 && (
              <select
                className="adm-select"
                value=""
                style={{ maxWidth: '16rem' }}
                onChange={(event) => {
                  if (event.target.value) setValue(event.target.value);
                }}
                aria-label="Escolher da biblioteca"
              >
                <option value="">Escolher da biblioteca...</option>
                {library.map((item) => (
                  <option key={item.url} value={item.url}>
                    {item.filename}
                  </option>
                ))}
              </select>
            )}

            {value && (
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--small" onClick={() => setValue('')}>
                Limpar
              </button>
            )}
          </div>

          <input
            ref={fileInput}
            type="file"
            accept={accept}
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          {/* O campo real do formulário. Aceita também um endereço colado à mão. */}
          <input
            className="adm-input"
            id={name}
            name={name}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="/uploads/ficheiro.jpg ou https://..."
          />
        </div>
      </div>

      {error && (
        <span className="adm-field__hint" style={{ color: 'var(--admin-red)' }} role="alert">
          {error}
        </span>
      )}

      {hint && <span className="adm-field__hint">{hint}</span>}
    </div>
  );
}
