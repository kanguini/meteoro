export type Pillar = {
  key: string;
  label: string;
  text: string;
};

export type Step = {
  number: string;
  title: string;
  text: string;
};

export type ServicePoint = {
  title: string;
  text: string;
};

export type Service = {
  slug: string;
  number: string;
  title: string;
  short: string;
  lead: string;
  body: string[];
  points: ServicePoint[];
  keywords: string[];
  image?: { src: string; alt: string };
};

export type Content = {
  meta: {
    siteName: string;
    titleTemplate: string;
    defaultTitle: string;
    defaultDescription: string;
  };
  nav: {
    home: string;
    about: string;
    services: string;
    method: string;
    projects: string;
    contact: string;
    menu: string;
    close: string;
    skipToContent: string;
  };
  common: {
    scroll: string;
    readMore: string;
    allServices: string;
    talkToUs: string;
    nextService: string;
    previousService: string;
    backHome: string;
    languageLabel: string;
  };
  home: {
    hero: { eyebrow: string; statement: string[]; lead: string; ctaPrimary: string; ctaSecondary: string };
    intro: { eyebrow: string; title: string; lead: string; pillars: Pillar[] };
    about: { eyebrow: string; title: string; body: string[]; keywords: string[]; cta: string };
    services: { eyebrow: string; title: string; lead: string; cta: string };
    method: { eyebrow: string; title: string; note: string; cta: string };
    value: { eyebrow: string; title: string; items: Step[] };
    cta: { eyebrow: string; title: string; lead: string; button: string };
  };
  about: {
    hero: { eyebrow: string; title: string; lead: string };
    story: { title: string; body: string[] };
    principle: { title: string; body: string[]; keywords: string[] };
    pillars: { title: string; items: Pillar[] };
  };
  method: {
    hero: { eyebrow: string; title: string; lead: string };
    steps: Step[];
    note: string;
    value: { title: string; items: Step[] };
  };
  services: {
    hero: { eyebrow: string; title: string; lead: string };
    items: Service[];
  };
  projects: {
    hero: { eyebrow: string; title: string; lead: string };
    notice: { title: string; body: string };
    typologies: { title: string; lead: string };
  };
  contact: {
    hero: { eyebrow: string; title: string; lead: string };
    details: { title: string; phoneLabel: string; emailLabel: string; addressLabel: string; hoursLabel: string };
    form: {
      title: string;
      name: string;
      email: string;
      phone: string;
      subject: string;
      subjectOptions: string[];
      message: string;
      submit: string;
      sending: string;
      success: string;
      error: string;
      required: string;
      invalidEmail: string;
      privacy: string;
    };
  };
  footer: {
    sections: { company: string; services: string; contact: string };
    rights: string;
    country: string;
  };
};
