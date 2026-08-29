'use client';

import { useActionState } from 'react';
import { labelFor, type LeafKind } from '@/lib/json-form';
import { Panel, type ActionState } from '../../ui';
import { SaveBar } from '../../SaveBar';
import { savePageContent } from '../actions';

type Row = { path: string; kind: LeafKind; pt: string; en: string };

/** Um texto longo merece caixa alta; um título de duas palavras não. */
function rowsFor(kind: LeafKind, value: string): number {
  if (kind === 'stringList') return Math.min(8, Math.max(3, value.split('\n').length + 1));
  if (value.length > 160) return 4;
  if (value.length > 70) return 3;
  return 2;
}

export function PageContentForm({ page, rows }: { page: string; rows: Row[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(savePageContent, {});

  return (
    <form action={formAction}>
      <input type="hidden" name="__page" value={page} />

      <Panel>
        {rows.map((row) => (
          <div className="adm-pair" key={row.path}>
            <p className="adm-pair__key">
              {labelFor(row.path)}
              <span className="adm-pair__path">{row.path}</span>
              {row.kind === 'stringList' && (
                <span className="adm-field__hint" style={{ display: 'block', fontWeight: 400 }}>
                  Uma linha por parágrafo. Linhas vazias são ignoradas.
                </span>
              )}
            </p>

            <input type="hidden" name={`kind::${row.path}`} value={row.kind} />

            <div>
              <span className="adm-locale-tag">Português</span>
              <textarea
                className="adm-textarea"
                name={`pt::${row.path}`}
                defaultValue={row.pt}
                rows={rowsFor(row.kind, row.pt)}
              />
            </div>

            <div>
              <span className="adm-locale-tag">English</span>
              <textarea
                className="adm-textarea"
                name={`en::${row.path}`}
                defaultValue={row.en}
                rows={rowsFor(row.kind, row.en)}
              />
            </div>
          </div>
        ))}
      </Panel>

      <SaveBar state={state} />
    </form>
  );
}
