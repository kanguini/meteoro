'use client';

import { useActionState, useRef, useState } from 'react';
import { Field, Panel, TextArea, type ActionState } from '../../ui';
import { SaveBar } from '../../SaveBar';
import { deleteJob, saveJob } from '../actions';

type JobSection = { title: string; items: string[] };
type Translation = {
  title: string;
  department: string;
  type: string;
  location: string;
  intro: string;
  sections: JobSection[];
  profile: string;
};

export type JobFormData = {
  id: string;
  slug: string;
  position: number;
  published: boolean;
  pt: Translation;
  en: Translation;
};

/** Secções da vaga (o que irá fazer / requisitos / valorizamos), em número variável. */
function Sections({ locale, initial }: { locale: 'pt' | 'en'; initial: JobSection[] }) {
  const seed = initial.length > 0 ? initial : [{ title: '', items: [] as string[] }];
  const [rows, setRows] = useState(seed.map((row, index) => ({ key: `s${index}`, ...row })));
  const nextKey = useRef(seed.length);
  const makeKey = () => `s${nextKey.current++}`;

  const update = (key: string, field: 'title' | 'items', value: string) =>
    setRows((current) =>
      current.map((row) =>
        row.key === key
          ? { ...row, [field]: field === 'items' ? value.split('\n') : value }
          : row,
      ),
    );

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {rows.map((row, index) => (
        <div key={row.key} style={{ border: '1px solid var(--admin-line)', borderRadius: '3px', padding: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              className="adm-input"
              name={`seccoes.${locale}.${index}.title`}
              value={row.title}
              onChange={(event) => update(row.key, 'title', event.target.value)}
              placeholder="Título da secção (ex.: Requisitos)"
            />
            <button
              type="button"
              className="adm-btn adm-btn--danger adm-btn--small"
              onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
            >
              Remover
            </button>
          </div>
          <textarea
            className="adm-textarea"
            name={`seccoes.${locale}.${index}.items`}
            value={Array.isArray(row.items) ? row.items.join('\n') : ''}
            onChange={(event) => update(row.key, 'items', event.target.value)}
            rows={4}
            placeholder="Um item por linha"
          />
        </div>
      ))}
      <button
        type="button"
        className="adm-btn adm-btn--ghost adm-btn--small"
        onClick={() => setRows((current) => [...current, { key: makeKey(), title: '', items: [] }])}
        style={{ justifySelf: 'start' }}
      >
        Acrescentar secção
      </button>
    </div>
  );
}

function LocalePanel({ locale, data }: { locale: 'pt' | 'en'; data: Translation }) {
  return (
    <Panel title={locale === 'pt' ? 'Português' : 'English'}>
      <div className="admin-grid">
        <Field label="Título" name={`${locale}.title`} defaultValue={data.title} required />
        <div className="admin-grid admin-grid--3">
          <Field label="Departamento" name={`${locale}.department`} defaultValue={data.department} />
          <Field label="Tipo" name={`${locale}.type`} defaultValue={data.type} placeholder="Tempo inteiro" />
          <Field label="Local" name={`${locale}.location`} defaultValue={data.location} placeholder="Luanda, Angola" />
        </div>
        <TextArea label="Introdução" name={`${locale}.intro`} defaultValue={data.intro} rows={3} />

        <div className="adm-field">
          <span className="adm-field__label">Secções</span>
          <Sections locale={locale} initial={data.sections} />
        </div>

        <TextArea
          label="Perfil"
          name={`${locale}.profile`}
          defaultValue={data.profile}
          rows={2}
          hint="Uma linha a resumir o perfil ideal."
        />
      </div>
    </Panel>
  );
}

export function JobForm({ data }: { data: JobFormData }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveJob, {});

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="id" value={data.id} />

        <Panel title="Identificação">
          <div className="admin-grid admin-grid--2">
            <Field label="Endereço (slug)" name="slug" defaultValue={data.slug} hint="Vazio = gerado do título." />
            <Field label="Posição" name="position" type="number" defaultValue={String(data.position)} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <input type="checkbox" name="published" defaultChecked={data.published} />
            <span className="adm-field__label" style={{ margin: 0 }}>
              Publicada (visível e a aceitar candidaturas)
            </span>
          </label>
        </Panel>

        <LocalePanel locale="pt" data={data.pt} />
        <LocalePanel locale="en" data={data.en} />

        <SaveBar state={state} />
      </form>

      {data.id && (
        <form action={deleteJob} className="adm-actions">
          <input type="hidden" name="id" value={data.id} />
          <button type="submit" className="adm-btn adm-btn--danger">
            Eliminar vaga
          </button>
          <span className="adm-field__hint">As candidaturas recebidas ficam guardadas.</span>
        </form>
      )}
    </>
  );
}
