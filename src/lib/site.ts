/**
 * Dados institucionais da Meteoro 24.
 *
 * Contactos confirmados pelo cliente em Ago/2026. Falta ainda o NIF e as redes
 * sociais. O domínio em `url` é provisório — actualizar quando estiver definido.
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
  url: 'https://meteoro24.com',
  founded: '2024',

  phone: '+244 927 635 946',
  phoneHref: '+244927635946',
  email: 'geral@inovholding.com',
  address: {
    street: 'Avenida Comandante Gika, 241, 1C',
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

