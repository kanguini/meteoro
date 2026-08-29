import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { media } from '@/db/schema';
import { requireUser } from '@/lib/auth/guard';
import { storageConfigured } from '@/lib/storage';
import { AdminHead, Empty, Panel } from '../ui';
import { UploadForm } from './UploadForm';
import { removeMedia } from './actions';

export const dynamic = 'force-dynamic';

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function ImagensPage() {
  await requireUser();

  const items = await db.select().from(media).orderBy(desc(media.createdAt));
  const configured = storageConfigured();

  return (
    <>
      <AdminHead
        title="Imagens"
        description="As imagens carregadas aqui ficam disponíveis para a capa, os serviços e as obras."
      />

      {!configured && (
        <p className="adm-note adm-note--warn" style={{ marginBottom: '1.25rem' }}>
          O armazenamento de imagens ainda não está configurado. Defina SUPABASE_URL, SUPABASE_SERVICE_KEY e
          SUPABASE_BUCKET para poder carregar ficheiros. As imagens que já estão em /images continuam a funcionar.
        </p>
      )}

      <Panel title="Carregar">
        <UploadForm disabled={!configured} />
      </Panel>

      <Panel title={`Biblioteca (${items.length})`}>
        {items.length === 0 ? (
          <Empty>Ainda não há imagens carregadas.</Empty>
        ) : (
          <div className="adm-media">
            {items.map((item) => (
              <figure className="adm-media__item" key={item.id} style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="adm-media__thumb" src={item.url} alt="" loading="lazy" />
                <figcaption className="adm-media__body">
                  <div className="adm-media__name">{item.filename}</div>
                  <div className="adm-media__meta">
                    {humanSize(item.bytes)} ·{' '}
                    {item.createdAt.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </figcaption>
                <div className="adm-media__actions">
                  <a
                    className="adm-btn adm-btn--ghost adm-btn--small"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir
                  </a>
                  <form action={removeMedia}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="adm-btn adm-btn--danger adm-btn--small">
                      Apagar
                    </button>
                  </form>
                </div>
              </figure>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
