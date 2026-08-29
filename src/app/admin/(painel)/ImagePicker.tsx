'use client';

import { useState } from 'react';

/**
 * Escolhe uma imagem da biblioteca ou aceita um caminho escrito à mão
 * (as imagens originais do site vivem em /images e não estão na biblioteca).
 */
export function ImagePicker({
  name,
  label,
  defaultValue,
  library,
  hint,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  library: { url: string; filename: string }[];
  hint?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? '');

  return (
    <div className="adm-field">
      <label className="adm-field__label" htmlFor={name}>
        {label}
      </label>

      <div className="adm-picker">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="adm-picker__preview" src={value} alt="" />
        ) : (
          <span className="adm-picker__preview" aria-hidden="true" />
        )}

        <div style={{ display: 'grid', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          <input
            className="adm-input"
            id={name}
            name={name}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="/images/hero-obra.jpg"
          />

          {library.length > 0 && (
            <select
              className="adm-select"
              value=""
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
            <button
              type="button"
              className="adm-btn adm-btn--ghost adm-btn--small"
              onClick={() => setValue('')}
              style={{ justifySelf: 'start' }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {hint && <span className="adm-field__hint">{hint}</span>}
    </div>
  );
}
