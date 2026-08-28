/**
 * Dados institucionais da Meteoro 24.
 *
 * ATENÇÃO: os contactos abaixo são PLACEHOLDERS. A apresentação institucional
 * não inclui telefone, email, morada nem NIF. Substituir antes de publicar —
 * este é o único ficheiro que precisa de ser editado para isso.
 */
export const site = {
  name: 'Meteoro 24',
  legalName: 'Meteoro 24',
  /** Slogan da marca. Não se traduz — aparece igual em PT e EN. */
  slogan: 'Projects Build Future',
  descriptor: {
    pt: 'Construção e Gestão de Projectos',
    en: 'Construction and Project Management',
  },
  url: 'https://meteoro24.ao',
  founded: '2024',

  // TODO: substituir pelos contactos reais
  phone: '+244 900 000 000',
  phoneHref: '+244900000000',
  email: 'geral@meteoro24.ao',
  address: {
    street: 'Luanda',
    city: 'Luanda',
    country: {
      pt: 'Angola',
      en: 'Angola',
    },
  },
  hours: {
    pt: 'Segunda a sexta, 08h00 – 17h00',
    en: 'Monday to Friday, 08:00 – 17:00',
  },
  social: {
    linkedin: '',
    instagram: '',
    facebook: '',
  },
} as const;

/** true enquanto os contactos forem os de exemplo. */
export const contactsArePlaceholders = site.phoneHref === '+244900000000';
