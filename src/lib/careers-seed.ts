/**
 * Vagas iniciais da Meteoro 24, bilingues. Servem de semente para a base de
 * dados (scripts/seed.ts e scripts/export-sql.ts). Depois de semeadas, são
 * geridas no painel — este ficheiro deixa de ser a fonte de verdade.
 */

export type SeedJobTranslation = {
  title: string;
  department: string;
  type: string;
  location: string;
  intro: string;
  sections: { title: string; items: string[] }[];
  profile: string;
};

export type SeedJob = {
  slug: string;
  pt: SeedJobTranslation;
  en: SeedJobTranslation;
};

export const SEED_JOBS: SeedJob[] = [
  {
    slug: 'engenheiro-civil-direccao-de-obra',
    pt: {
      title: 'Engenheiro(a) Civil — Direcção de Obra',
      department: 'Produção & Obra',
      type: 'Tempo inteiro',
      location: 'Luanda, Angola',
      intro:
        'A Meteoro 24 procura um(a) Engenheiro(a) Civil para dirigir obra no terreno, coordenar as frentes e garantir que o que foi planeado é o que se executa.',
      sections: [
        {
          title: 'O que irá fazer',
          items: [
            'Coordenar as frentes de trabalho e as equipas em obra',
            'Controlar prazos, custos e qualidade contra o plano de execução',
            'Acompanhar medições, autos e mapas de quantidades',
            'Fazer a ligação entre projecto, fornecedores e fiscalização',
            'Reportar o avanço e antecipar desvios',
          ],
        },
        {
          title: 'Requisitos',
          items: [
            'Licenciatura em Engenharia Civil',
            'Mínimo de 3 anos de experiência em direcção ou acompanhamento de obra',
            'Domínio de leitura de projecto e de cronogramas',
            'Conhecimento de AutoCAD e de folha de cálculo',
            'Carta de condução',
          ],
        },
        {
          title: 'Valorizamos',
          items: ['Experiência em estruturas metálicas', 'Inglês técnico', 'MS Project ou equivalente'],
        },
      ],
      profile: 'Rigor, liderança de equipas, organização e capacidade de decidir no terreno.',
    },
    en: {
      title: 'Civil Engineer — Site Management',
      department: 'Production & Site',
      type: 'Full-time',
      location: 'Luanda, Angola',
      intro:
        'Meteoro 24 is looking for a Civil Engineer to run works on site, coordinate the work fronts and make sure what was planned is what gets built.',
      sections: [
        {
          title: 'What you will do',
          items: [
            'Coordinate work fronts and site teams',
            'Control schedule, cost and quality against the execution plan',
            'Follow measurements, progress records and bills of quantities',
            'Bridge design, suppliers and supervision',
            'Report progress and anticipate deviations',
          ],
        },
        {
          title: 'Requirements',
          items: [
            'Degree in Civil Engineering',
            'Minimum 3 years of site management or supervision experience',
            'Fluent reading of drawings and programmes',
            'Command of AutoCAD and spreadsheets',
            "Driver's licence",
          ],
        },
        {
          title: 'Nice to have',
          items: ['Experience with steel structures', 'Technical English', 'MS Project or equivalent'],
        },
      ],
      profile: 'Rigour, team leadership, organisation and the ability to decide on site.',
    },
  },
  {
    slug: 'tecnico-de-orcamentacao-e-medicoes',
    pt: {
      title: 'Técnico(a) de Orçamentação e Medições',
      department: 'Estudos & Orçamentação',
      type: 'Tempo inteiro',
      location: 'Luanda, Angola',
      intro:
        'Procuramos um(a) técnico(a) meticuloso(a) para medir, orçamentar e preparar mapas de quantidades que tornem o investimento transparente antes de a obra começar.',
      sections: [
        {
          title: 'O que irá fazer',
          items: [
            'Fazer medições e levantamentos a partir de projecto',
            'Elaborar mapas de quantidades e estimativas de custo',
            'Consultar fornecedores e consolidar preços',
            'Apoiar a preparação de propostas',
          ],
        },
        {
          title: 'Requisitos',
          items: [
            'Formação em Engenharia Civil, Construção ou área técnica',
            'Experiência em medições e orçamentação',
            'Domínio de Excel e de leitura de projecto',
            'Método e atenção ao detalhe',
          ],
        },
        {
          title: 'Valorizamos',
          items: ['Conhecimento de software de orçamentação', 'AutoCAD', 'Inglês funcional'],
        },
      ],
      profile: 'Atenção ao detalhe, método, honestidade nos números.',
    },
    en: {
      title: 'Cost Estimating & Quantities Technician',
      department: 'Studies & Estimating',
      type: 'Full-time',
      location: 'Luanda, Angola',
      intro:
        'We are looking for a meticulous technician to measure, estimate and prepare bills of quantities that make the investment transparent before the build starts.',
      sections: [
        {
          title: 'What you will do',
          items: [
            'Take measurements and surveys from drawings',
            'Prepare bills of quantities and cost estimates',
            'Consult suppliers and consolidate prices',
            'Support proposal preparation',
          ],
        },
        {
          title: 'Requirements',
          items: [
            'Training in Civil Engineering, Construction or a technical field',
            'Experience in measurements and estimating',
            'Command of Excel and reading of drawings',
            'Method and attention to detail',
          ],
        },
        {
          title: 'Nice to have',
          items: ['Knowledge of estimating software', 'AutoCAD', 'Functional English'],
        },
      ],
      profile: 'Attention to detail, method, honesty with numbers.',
    },
  },
];
