'use client';

import { useActionState, useRef, useState } from 'react';
import { Field, Panel, TextArea, type ActionState } from '../../ui';
import { SaveBar } from '../../SaveBar';
import { ImagePicker } from '../../ImagePicker';
import { deleteProject, saveProject } from '../actions';

type Translation = { title: string; summary: string; body: string[] };
type GalleryItem = { url: string; altPt: string; altEn: string };

export type ProjectFormData = {
  id: string;
  slug: string;
  position: number;
  published: boolean;
  year: string;
  client: string;
  location: string;
  coverImage: string;
  gallery: GalleryItem[];
  serviceSlugs: string[];
  pt: Translation;
  en: Translation;
};

/**
 * Galeria da obra. Estado totalmente controlado com id estável por linha: com
 * `key={index}` e campos alt não controlados, remover uma imagem do meio deixava
 * a descrição de uma linha colada a outra imagem e gravava o par trocado.
 */
function Gallery({ initial, library }: { initial: GalleryItem[]; library: { url: string; filename: string }[] }) {
  const [rows, setRows] = useState<(GalleryItem & { key: string })[]>(() =>
    initial.map((row, index) => ({ key: `g${index}`, ...row })),
  );
  const nextKey = useRef(initial.length);
  const makeKey = () => `g${nextKey.current++}`;

  const update = (key: string, field: keyof GalleryItem, value: string) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, [field]: value } : row)));

  return (
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      {rows.map((row, index) => (
        <div
          key={row.key}
          style={{ display: 'grid', gap: '0.5rem', border: '1px solid var(--admin-line)', borderRadius: '3px', padding: '0.75rem' }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="adm-picker__preview" src={row.url} alt="" />
            <div style={{ flex: 1, display: 'grid', gap: '0.5rem', minWidth: 0 }}>
              <input
                className="adm-input"
                name={`galeria.${index}.url`}
                value={row.url}
                onChange={(event) => update(row.key, 'url', event.target.value)}
                placeholder="Endereço da imagem"
              />
              <input
                className="adm-input"
                name={`galeria.${index}.altPt`}
                value={row.altPt}
                onChange={(event) => update(row.key, 'altPt', event.target.value)}
                placeholder="Descrição (PT)"
              />
              <input
                className="adm-input"
                name={`galeria.${index}.altEn`}
                value={row.altEn}
                onChange={(event) => update(row.key, 'altEn', event.target.value)}
                placeholder="Descrição (EN)"
              />
            </div>
            <button
              type="button"
              className="adm-btn adm-btn--danger adm-btn--small"
              onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
            >
              Remover
            </button>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="adm-btn adm-btn--ghost adm-btn--small"
          onClick={() => setRows((current) => [...current, { key: makeKey(), url: '', altPt: '', altEn: '' }])}
        >
          Acrescentar imagem
        </button>

        {library.length > 0 && (
          <select
            className="adm-select"
            value=""
            style={{ maxWidth: '18rem' }}
            onChange={(event) => {
              if (!event.target.value) return;
              const url = event.target.value;
              setRows((current) => [...current, { key: makeKey(), url, altPt: '', altEn: '' }]);
            }}
            aria-label="Acrescentar da biblioteca"
          >
            <option value="">Acrescentar da biblioteca...</option>
            {library.map((item) => (
              <option key={item.url} value={item.url}>
                {item.filename}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

export function ProjectForm({
  data,
  library,
  serviceOptions,
}: {
  data: ProjectFormData;
  library: { url: string; filename: string }[];
  serviceOptions: { slug: string; title: string }[];
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveProject, {});

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="id" value={data.id} />

        <Panel title="Identificação">
          <div className="admin-grid admin-grid--3">
            <Field label="Endereço (slug)" name="slug" defaultValue={data.slug} hint="Vazio = gerado do título." />
            <Field label="Ano" name="year" defaultValue={data.year} placeholder="2026" />
            <Field label="Posição" name="position" type="number" defaultValue={String(data.position)} />
            <Field label="Cliente" name="client" defaultValue={data.client} />
            <Field label="Local" name="location" defaultValue={data.location} placeholder="Luanda" />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <input type="checkbox" name="published" defaultChecked={data.published} />
            <span className="adm-field__label" style={{ margin: 0 }}>
              Publicada no site
            </span>
          </label>
        </Panel>

        {serviceOptions.length > 0 && (
          <Panel title="Serviços envolvidos">
            <div className="admin-grid admin-grid--2">
              {serviceOptions.map((option) => (
                <label key={option.slug} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    name="serviceSlugs"
                    value={option.slug}
                    defaultChecked={data.serviceSlugs.includes(option.slug)}
                  />
                  <span style={{ fontSize: '0.875rem' }}>{option.title}</span>
                </label>
              ))}
            </div>
          </Panel>
        )}

        <Panel title="Imagem principal">
          <ImagePicker name="coverImage" label="Fotografia de capa" defaultValue={data.coverImage} library={library} />
        </Panel>

        <Panel title="Galeria">
          <Gallery initial={data.gallery} library={library} />
        </Panel>

        {(['pt', 'en'] as const).map((locale) => (
          <Panel key={locale} title={locale === 'pt' ? 'Português' : 'English'}>
            <div className="admin-grid">
              <Field label="Título" name={`${locale}.title`} defaultValue={data[locale].title} required />
              <TextArea label="Resumo" name={`${locale}.summary`} defaultValue={data[locale].summary} rows={2} />
              <TextArea
                label="Descrição"
                name={`${locale}.body`}
                defaultValue={data[locale].body.join('\n')}
                rows={5}
                hint="Uma linha por parágrafo."
              />
            </div>
          </Panel>
        ))}

        <SaveBar state={state} />
      </form>

      {data.id && (
        <form action={deleteProject} className="adm-actions">
          <input type="hidden" name="id" value={data.id} />
          <button type="submit" className="adm-btn adm-btn--danger">
            Eliminar obra
          </button>
        </form>
      )}
    </>
  );
}
