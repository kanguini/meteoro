'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SECTIONS = [
  { href: '/admin', label: 'Resumo', exact: true },
  { href: '/admin/definicoes', label: 'Definições' },
  { href: '/admin/paginas', label: 'Textos das páginas' },
  { href: '/admin/servicos', label: 'Serviços' },
  { href: '/admin/obras', label: 'Obras' },
  { href: '/admin/mensagens', label: 'Mensagens', badge: true },
  { href: '/admin/imagens', label: 'Imagens' },
];

export function AdminNav({ unread, isOwner }: { unread: number; isOwner: boolean }) {
  const pathname = usePathname();

  const items = isOwner
    ? [...SECTIONS, { href: '/admin/utilizadores', label: 'Utilizadores' }]
    : SECTIONS;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav>
      <p className="admin-side__label">Site</p>
      <div className="admin-side__nav">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={['admin-side__link', isActive(item.href, item.exact) ? 'is-active' : ''].join(' ')}
          >
            {item.label}
            {'badge' in item && item.badge && unread > 0 && <span className="admin-side__count">{unread}</span>}
          </Link>
        ))}
      </div>
    </nav>
  );
}
