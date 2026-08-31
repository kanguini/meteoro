'use client';

/**
 * Rede de segurança do painel. Sem isto, uma exceção não apanhada numa página
 * do painel mostrava o ecrã cru "This page couldn't load" do Next, sem pista
 * do que correu mal. As falhas de base de dados conhecidas já são explicadas
 * antes de aqui chegar (ver src/lib/db-health.ts); isto apanha o resto.
 */
export default function PainelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ maxWidth: '42rem' }}>
      <h1 className="admin-head__title" style={{ marginBottom: '0.75rem' }}>
        Algo correu mal
      </h1>
      <p className="adm-note adm-note--error" role="alert">
        Esta secção do painel encontrou um erro inesperado. O site público não é afectado.
      </p>
      <p className="adm-field__hint" style={{ marginTop: '1rem' }}>
        {error.message || 'Erro sem mensagem.'}
        {error.digest ? ` (ref. ${error.digest})` : ''}
      </p>
      <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
        <button type="button" className="adm-btn" onClick={reset}>
          Tentar de novo
        </button>
        <a href="/admin" className="adm-btn adm-btn--ghost">
          Voltar ao resumo
        </a>
      </div>
    </div>
  );
}
