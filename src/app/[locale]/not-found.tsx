import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="section" style={{ paddingTop: '12rem', minHeight: '70vh' }}>
      <div className="container">
        <span className="eyebrow eyebrow--red">404</span>
        <h1 className="h1">Página não encontrada.</h1>
        <p className="lead" style={{ marginTop: '1.5rem' }}>
          O endereço que procura não existe ou foi movido.
        </p>
        <p style={{ marginTop: '2.5rem' }}>
          <Link href="/pt" className="btn">
            Voltar ao início
          </Link>
        </p>
      </div>
    </main>
  );
}
