'use client';

import { useActionState, useState } from 'react';
import { Field, Panel, TextArea, type ActionState } from '../../ui';
import { SaveBar } from '../../SaveBar';
import { ImagePicker } from '../../ImagePicker';
import { deleteService, saveService } from '../actions';

type Translation = {
  title: string;
  short: string;
  lead: string;
  body: string[];
  points: { title: string; text: string }[];
  keywords: string[];
};

export type ServiceFormData = {
  id: string;
  slug: string;
  number: string;
  position: number;
  published: boolean;
  image: string;
  imageAltPt: string;
  imageAltEn: string;
  pt: Translation;
  en: Translation;
};

/** Pontos do serviço: título curto + explicação, em número variável. */
function Points({ locale, initial }: { locale: 'pt' | 'en'; initial: { title: string; text: string }[] }) {
  const [rows, setRows] = useState(initial.length > 0 ? initial : [{ title: '', text: '' }]);

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {rows.map((row, index) => (
        <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.5rem' }}>
          <input
            className="adm-input"
            name={`pontos.${locale}.${index}.title`}
            defaultValue={row.title}
            placeholder="Título"
          />
          <input
            className="adm-input"
            name={`pontos.${locale}.${index}.text`}
            defaultValue={row.text}
            placeholder="Explicação"
          />
          <button
            type="button"
            className="adm-btn adm-btn--danger adm-btn--small"
            onClick={() => setRows(rows.filter((_, position) => position !== index))}
            aria-label={`Remover ponto ${index + 1}`}
          >
            Remover
          </button>
        </div>
      ))}

      <button
        type="button"
        className="adm-btn adm-btn--ghost adm-btn--small"
        onClick={() => setRows([...rows, { title: '', text: '' }])}
        style={{ justifySelf: 'start' }}
      >
        Acrescentar ponto
      </button>
    </div>
  );
}

function LocalePanel({ locale, data }: { locale: 'pt' | 'en'; data: Translation }) {
  return (
    <Panel title={locale === 'pt' ? 'Português' : 'English'}>
      <div className="admin-grid">
        <Field label="Título" name={`${locale}.title`} defaultValue={data.title} required />
        <TextArea
          label="Resumo"
          name={`${locale}.short`}
          defaultValue={data.short}
          rows={2}
          hint="Aparece na lista de serviços e no menu."
        />
        <Field label="Frase de entrada" name={`${locale}.lead`} defaultValue={data.lead} />
        <TextArea
          label="Parágrafos"
          name={`${locale}.body`}
          defaultValue={data.body.join('\n')}
          rows={5}
          hint="Uma linha por parágrafo."
        />

        <div className="adm-field">
          <span className="adm-field__label">Pontos</span>
          <Points locale={locale} initial={data.points} />
        </div>

        <TextArea
          label="Palavras-chave"
          name={`${locale}.keywords`}
          defaultValue={data.keywords.join('\n')}
          rows={3}
          hint="Uma por linha. Aparecem separadas por pontos vermelhos."
        />
      </div>
    </Panel>
  );
}

export function ServiceForm({
  data,
  library,
}: {
  data: ServiceFormData;
  library: { url: string; filename: string }[];
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveService, {});

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="id" value={data.id} />

        <Panel title="Identificação">
          <div className="admin-grid admin-grid--3">
            <Field
              label="Endereço (slug)"
              name="slug"
              defaultValue={data.slug}
              hint="Deixe vazio para gerar a partir do título."
            />
            <Field label="Número" name="number" defaultValue={data.number} hint="Mostrado no site: 01, 02..." />
            <Field label="Posição" name="position" type="number" defaultValue={String(data.position)} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <input type="checkbox" name="published" defaultChecked={data.published} />
            <span className="adm-field__label" style={{ margin: 0 }}>
              Publicado no site
            </span>
          </label>
        </Panel>

        <Panel title="Imagem">
          <ImagePicker
            name="image"
            label="Fotografia da página do serviço"
            defaultValue={data.image}
            library={library}
            hint="Opcional. Sem imagem, a página usa um cabeçalho tipográfico com o número em grande."
          />
          <div className="admin-grid admin-grid--2" style={{ marginTop: '1rem' }}>
            <TextArea label="Descrição da imagem (PT)" name="imageAltPt" defaultValue={data.imageAltPt} rows={2} />
            <TextArea label="Descrição da imagem (EN)" name="imageAltEn" defaultValue={data.imageAltEn} rows={2} />
          </div>
        </Panel>

        <LocalePanel locale="pt" data={data.pt} />
        <LocalePanel locale="en" data={data.en} />

        <SaveBar state={state} />
      </form>

      {data.id && (
        <form action={deleteService} className="adm-actions">
          <input type="hidden" name="id" value={data.id} />
          <button type="submit" className="adm-btn adm-btn--danger">
            Eliminar serviço
          </button>
          <span className="adm-field__hint">
            Remove o serviço e as duas traduções. A página pública deixa de existir.
          </span>
        </form>
      )}
    </>
  );
}
