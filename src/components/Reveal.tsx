import type { CSSProperties, ElementType, ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  /** atraso da animação, em milissegundos (só tem efeito no modo "load") */
  delay?: number;
  /**
   * "scroll" anima quando o bloco entra no viewport (omissão).
   * "load"   anima ao carregar a página — para conteúdo acima da dobra.
   */
  mode?: 'scroll' | 'load';
  className?: string;
};

/**
 * Bloco com animação de entrada. É um componente de servidor: a animação é
 * puramente CSS, não envia JavaScript para o cliente e o conteúdo continua
 * legível em browsers sem suporte a scroll timelines.
 */
export function Reveal({ children, as: Tag = 'div', delay = 0, mode = 'scroll', className = '' }: RevealProps) {
  const style = delay ? ({ ['--reveal-delay' as string]: `${delay}ms` } as CSSProperties) : undefined;

  return (
    <Tag className={['reveal', `reveal--${mode}`, className].filter(Boolean).join(' ')} style={style}>
      {children}
    </Tag>
  );
}
