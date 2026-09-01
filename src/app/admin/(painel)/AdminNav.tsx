'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SECTIONS = [
  { href: '/admin', label: 'Resumo', exact: true },
  { href: '/admin/definicoes', label: 'Definições' },
  { href: '/admin/paginas', label: 'Textos das páginas' },
  { href: '/admin/servicos', label: 'Serviços' },
  { href: '/admin/obras', label: 'Obras' },
  { href: '/admin/vagas', label: 'Vagas' },
  { href: '/admin/candidaturas', label: 'Candidaturas', badge: 'applications' },
  { href: '/admin/mensagens', label: 'Mensagens', badge: 'messages' },
  { href: '/admin/imagens', label: 'Imagens' },
];

export function AdminNav({
  unreadMessages,
  unreadApplications,
  isOwner,
}: {
  unreadMessages: number;
  unreadApplications: number;
  isOwner: boolean;
}) {
  const pathname = usePathname();

  const items = isOwner
    ? [...SECTIONS, { href: '/admin/utilizadores', label: 'Utilizadores' }]
    : SECTIONS;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const badgeCount = (badge?: string) =>
    badge === 'messages' ? unreadMessages : badge === 'applications' ? unreadApplications : 0;

  return (
    <nav>
      <p className="admin-side__label">Site</p>
      <div className="admin-side__nav">
        {items.map((item) => {
          const count = 'badge' in item ? badgeCount(item.badge as string) : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={['admin-side__link', isActive(item.href, item.exact) ? 'is-active' : ''].join(' ')}
            >
              {item.label}
              {count > 0 && <span className="admin-side__count">{count}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
