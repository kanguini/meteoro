import Image from 'next/image';
import { isExternal, isVideo } from '@/lib/media';
import Link from 'next/link';
import { Reveal } from './Reveal';
import { ArrowRight } from './Icons';
import type { Pillar, Step } from '@/i18n/types';

/** Hero com fotografia de fundo e escurecimento em duas direcções. */
export function ImageHero({
  eyebrow,
  title,
  statement,
  lead,
  image,
  poster,
  imagePosition,
  actions,
  meta,
  large = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  /** linha de posicionamento sob o título — usada quando o H1 é o slogan da marca */
  statement?: React.ReactNode;
  lead?: string;
  image: { src: string; alt: string };
  /** imagem mostrada enquanto o vídeo carrega e quando ele não pode tocar */
  poster?: string;
  /** `object-position` da fotografia, para afastar o motivo principal do texto */
  imagePosition?: string;
  actions?: React.ReactNode;
  meta?: [string, string];
  large?: boolean;
}) {
  return (
    <section className={['hero', large ? '' : 'hero--page'].join(' ')}>
      <div className="hero__media">
        {isVideo(image.src) ? (
          /*
            Vídeo de fundo: sem som, em ciclo e sem controlos. O `playsInline` é
            o que impede o iOS de o abrir em ecrã inteiro. O `poster` aparece
            enquanto carrega e fica quando o browser recusa tocar sozinho — é o
            caso de quem tem "reduzir movimento" ligado ou está a poupar dados.
          */
          <video
            className="hero__video"
            src={image.src}
            poster={poster || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={image.alt || undefined}
            style={{ objectPosition: imagePosition ?? 'center' }}
          />
        ) : (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            // Endereços externos não passam pelo optimizador: evita ter de
            // autorizar domínios um a um e de servir de proxy a terceiros.
            unoptimized={isExternal(image.src)}
            style={{ objectFit: 'cover', objectPosition: imagePosition ?? 'center' }}
          />
        )}
      </div>
      <div className="hero__scrim" />
      <div className="container hero__inner">
        <Reveal mode="load">
          <span className="eyebrow eyebrow--marked">{eyebrow}</span>
        </Reveal>
        <Reveal mode="load" delay={100}>
          <h1 className={large ? 'display hero__title' : 'h1 hero__title'}>{title}</h1>
        </Reveal>
        {statement && (
          <Reveal mode="load" delay={160}>
            <p className="hero__statement">{statement}</p>
          </Reveal>
        )}
        {lead && (
          <Reveal mode="load" delay={200}>
            <p className="lead hero__lead">{lead}</p>
          </Reveal>
        )}
        {actions && (
          <Reveal mode="load" delay={300}>
            <div className="hero__actions">{actions}</div>
          </Reveal>
        )}
        {meta && (
          <Reveal mode="load" delay={400}>
            <div>
              <div className="hero__rule" />
              <div className="hero__meta">
                <span>{meta[0]}</span>
                <span>{meta[1]}</span>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/** Hero tipográfico, sem fotografia. */
export function PlainHero({
  eyebrow,
  title,
  lead,
  aside,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  aside?: React.ReactNode;
}) {
  return (
    <section className="hero hero--light hero--plain">
      <div className="container hero__inner">
        <Reveal mode="load">
          <span className="eyebrow eyebrow--marked eyebrow--red">{eyebrow}</span>
        </Reveal>
        <Reveal mode="load" delay={100}>
          <h1 className="h1 hero__title">{title}</h1>
        </Reveal>
        {lead && (
          <Reveal mode="load" delay={200}>
            <p className="lead hero__lead">{lead}</p>
          </Reveal>
        )}
        {aside && <Reveal mode="load" delay={300}>{aside}</Reveal>}
      </div>
    </section>
  );
}

export function Keywords({ items }: { items: string[] }) {
  return (
    <ul className="keywords">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function Pillars({ items }: { items: Pillar[] }) {
  return (
    <div className="pillars">
      {items.map((pillar, index) => (
        <Reveal key={pillar.key} className="pillar" delay={index * 90}>
          <h3 className="pillar__label">{pillar.label}</h3>
          <p className="pillar__text">{pillar.text}</p>
        </Reveal>
      ))}
    </div>
  );
}

export function ValueGrid({ items }: { items: Step[] }) {
  return (
    <div className="value-grid">
      {items.map((item, index) => (
        <Reveal key={item.number} className="value-card" delay={index * 90}>
          <span className="value-card__num">{item.number}</span>
          <h3 className="value-card__title">{item.title}</h3>
          <p className="value-card__text">{item.text}</p>
        </Reveal>
      ))}
    </div>
  );
}

export function Steps({ items }: { items: Step[] }) {
  return (
    <div className="steps">
      {items.map((step, index) => (
        <Reveal key={step.number} className="step" delay={index * 70}>
          <span className="step__num">{step.number}</span>
          <h3 className="step__title">{step.title}</h3>
          <p className="step__text">{step.text}</p>
        </Reveal>
      ))}
    </div>
  );
}

export function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="arrow-link">
      {children}
      <ArrowRight />
    </Link>
  );
}
