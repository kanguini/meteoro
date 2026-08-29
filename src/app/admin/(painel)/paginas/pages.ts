/** Grupos de conteúdo editáveis, pela ordem em que fazem sentido para quem edita. */
export const CONTENT_PAGES = [
  { key: 'home', label: 'Página inicial', description: 'Destaque, pilares, resumo dos serviços, método e chamada final.' },
  { key: 'about', label: 'Sobre', description: 'História da empresa, princípio de actuação e pilares.' },
  { key: 'method', label: 'Método', description: 'As cinco etapas do processo e o valor que entregam.' },
  { key: 'projects', label: 'Projectos', description: 'Introdução da página de obras e aviso de portefólio.' },
  { key: 'contact', label: 'Contacto', description: 'Textos da página e etiquetas do formulário.' },
  { key: 'nav', label: 'Navegação', description: 'Nomes dos itens do menu.' },
  { key: 'common', label: 'Textos comuns', description: 'Botões e ligações repetidos em várias páginas.' },
  { key: 'footer', label: 'Rodapé', description: 'Títulos das colunas e linha final.' },
  { key: 'meta', label: 'SEO', description: 'Título e descrição usados por motores de busca e redes sociais.' },
] as const;

export type ContentPageKey = (typeof CONTENT_PAGES)[number]['key'];

export function isContentPage(value: string): value is ContentPageKey {
  return CONTENT_PAGES.some((page) => page.key === value);
}
