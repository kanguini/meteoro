'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';
import { Chevron } from './Icons';
import { href, paths, serviceHref } from '@/lib/routes';
import { localeShortNames, locales, type Locale } from '@/i18n/config';
import type { Content } from '@/i18n/types';

type HeaderProps = {
  locale: Locale;
  content: Content;
  /** true quando a página começa com um hero escuro de imagem cheia */
  transparent?: boolean;
};

export function Header({ locale, content, transparent = false }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha os menus ao mudar de página. Ajuste de estado durante o render (o
  // padrão recomendado do React para reagir a uma mudança de valor), em vez de
  // um efeito com setState — mais direto e sem re-render extra.
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setMenuOpen(false);
    setServicesOpen(false);
  }

  // Bloqueia o scroll do body com o painel móvel aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      setServicesOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const openServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };

  const scheduleCloseServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setServicesOpen(false), 140);
  };

  const isActive = (path: string) => {
    const target = href(locale, path);
    if (path === paths.home) return pathname === target || pathname === `/${locale}`;
    return pathname === target || pathname.startsWith(`${target}/`);
  };

  // Troca de idioma mantendo a página actual
  const swapLocale = (target: Locale) => {
    const rest = pathname.split('/').slice(2).join('/');
    return rest ? `/${target}/${rest}` : `/${target}`;
  };

  const links = [
    { path: paths.about, label: content.nav.about },
    { path: paths.method, label: content.nav.method },
    { path: paths.projects, label: content.nav.projects },
    { path: paths.careers, label: content.nav.careers },
    { path: paths.contact, label: content.nav.contact },
  ];

  const solid = !transparent || scrolled;

  return (
    <>
      <header
        className={['header', solid ? 'is-solid' : '', menuOpen ? 'is-open' : ''].filter(Boolean).join(' ')}
      >
        <div className="container header__inner">
          <Link href={href(locale, paths.home)} aria-label={content.meta.siteName}>
            <Logo />
          </Link>

          <nav className="nav" aria-label={content.nav.menu}>
            <Link
              href={href(locale, paths.about)}
              className={['nav__link', isActive(paths.about) ? 'is-active' : ''].join(' ')}
              aria-current={isActive(paths.about) ? 'page' : undefined}
            >
              {content.nav.about}
            </Link>

            <div
              className="nav__group"
              data-open={servicesOpen}
              ref={groupRef}
              onMouseEnter={openServices}
              onMouseLeave={scheduleCloseServices}
              onFocus={openServices}
              onBlur={(event) => {
                // Só fecha quando o foco sai mesmo do grupo — navegar entre os
                // itens do menu por teclado mantém-no aberto.
                if (!groupRef.current?.contains(event.relatedTarget as Node | null)) {
                  scheduleCloseServices();
                }
              }}
            >
              <button
                type="button"
                className={['nav__link', 'nav__trigger', isActive(paths.services) ? 'is-active' : ''].join(' ')}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                onClick={() => setServicesOpen((open) => !open)}
              >
                {content.nav.services}
                <Chevron />
              </button>

              <div className="megamenu" role="menu">
                {content.services.items.map((service) => (
                  <Link
                    key={service.slug}
                    href={serviceHref(locale, service.slug)}
                    className="megamenu__item"
                    role="menuitem"
                  >
                    <span className="megamenu__num">{service.number}</span>
                    <span>
                      <span className="megamenu__title">{service.title}</span>
                      <span className="megamenu__desc">{service.short}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {links.slice(1).map((link) => (
              <Link
                key={link.path}
                href={href(locale, link.path)}
                className={['nav__link', isActive(link.path) ? 'is-active' : ''].join(' ')}
                aria-current={isActive(link.path) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <div className="lang" aria-label={content.common.languageLabel}>
              {locales.map((code, index) => (
                <span key={code} style={{ display: 'contents' }}>
                  {index > 0 && <span className="lang__sep" aria-hidden="true">/</span>}
                  <Link
                    href={swapLocale(code)}
                    className={['lang__item', code === locale ? 'is-active' : ''].join(' ')}
                    hrefLang={code}
                    aria-current={code === locale ? 'true' : undefined}
                  >
                    {localeShortNames[code]}
                  </Link>
                </span>
              ))}
            </div>

            <button
              type="button"
              className="burger"
              aria-expanded={menuOpen}
              aria-controls="mobile-panel"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="burger__lines" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              {menuOpen ? content.nav.close : content.nav.menu}
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-panel" className={['mobile-panel', menuOpen ? 'is-open' : ''].join(' ')} hidden={!menuOpen}>
        <Link
          href={href(locale, paths.about)}
          className={['mobile-panel__link', isActive(paths.about) ? 'is-active' : ''].join(' ')}
        >
          {content.nav.about}
        </Link>

        <Link
          href={href(locale, paths.services)}
          className={['mobile-panel__link', isActive(paths.services) ? 'is-active' : ''].join(' ')}
        >
          {content.nav.services}
        </Link>
        <div className="mobile-panel__sub">
          {content.services.items.map((service) => (
            <Link key={service.slug} href={serviceHref(locale, service.slug)} className="mobile-panel__sublink">
              <span>{service.number}</span>
              {service.title}
            </Link>
          ))}
        </div>

        {links.slice(1).map((link) => (
          <Link
            key={link.path}
            href={href(locale, link.path)}
            className={['mobile-panel__link', isActive(link.path) ? 'is-active' : ''].join(' ')}
          >
            {link.label}
          </Link>
        ))}

        <div className="lang" style={{ marginTop: '2rem' }}>
          {locales.map((code, index) => (
            <span key={code} style={{ display: 'contents' }}>
              {index > 0 && <span className="lang__sep" aria-hidden="true">/</span>}
              <Link href={swapLocale(code)} className={['lang__item', code === locale ? 'is-active' : ''].join(' ')}>
                {localeShortNames[code]}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
