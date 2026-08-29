import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import './admin.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Painel · Meteoro 24',
  // O painel nunca deve aparecer em motores de busca.
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-AO" className={archivo.variable}>
      <body style={{ margin: 0, fontFamily: 'var(--font-archivo), system-ui, sans-serif' }}>{children}</body>
    </html>
  );
}
