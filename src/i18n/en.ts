import type { Content } from './types';

export const en: Content = {
  meta: {
    siteName: 'Meteoro 24',
    titleTemplate: '%s · Meteoro 24',
    defaultTitle: 'Meteoro 24 · Construction and Project Management',
    defaultDescription:
      'We plan, control and deliver construction projects in Angola. Construction with method. Management with rigour.',
  },
  nav: {
    home: 'Home',
    about: 'About',
    services: 'Services',
    method: 'Method',
    projects: 'Projects',
    contact: 'Contact',
    menu: 'Menu',
    close: 'Close',
    skipToContent: 'Skip to content',
  },
  common: {
    scroll: 'Scroll',
    readMore: 'Read more',
    allServices: 'All services',
    talkToUs: 'Talk to us',
    nextService: 'Next service',
    previousService: 'Previous service',
    backHome: 'Back to home',
    languageLabel: 'Language',
  },
  home: {
    hero: {
      eyebrow: 'Angola · Construction and Project Management',
      statement: ['Construction with method.', 'Management with rigour.'],
      lead: 'We plan, control and deliver projects across the construction sector.',
      ctaPrimary: 'Talk to us',
      ctaSecondary: 'View services',
    },
    intro: {
      eyebrow: 'The build starts before the site does',
      title: 'Building well starts with well-structured decisions.',
      lead: 'Every choice made before and during execution has a direct effect on cost, schedule, quality and how long the result lasts.',
      pillars: [
        { key: 'clareza', label: 'Clarity', text: 'about what will be built' },
        { key: 'controlo', label: 'Control', text: 'over resources and execution' },
        { key: 'confianca', label: 'Confidence', text: 'in the result delivered' },
      ],
    },
    about: {
      eyebrow: 'Meteoro 24',
      title: 'Delivery and management under a single responsibility.',
      body: [
        'We do not work on the site alone. We structure the project, organise the resources, follow the execution and keep the client informed at every stage.',
      ],
      keywords: ['Plan', 'Coordinate', 'Control', 'Deliver'],
      cta: 'About the company',
    },
    services: {
      eyebrow: 'What we do',
      title: 'Six services. One integrated view.',
      lead: 'From the first measurement to final handover, each service feeds the next with verified information.',
      cta: 'View all services',
    },
    method: {
      eyebrow: 'How we work',
      title: 'A clear process from start to handover.',
      note: 'Each stage produces the information the next one needs, and leaves less room for improvisation.',
      cta: 'See the full method',
    },
    value: {
      eyebrow: 'Value for the client',
      title: 'More control over the build. Less uncertainty in decisions.',
      items: [
        {
          number: '01',
          title: 'Predictability',
          text: 'Planning and monitoring that anticipate schedule and cost deviations.',
        },
        {
          number: '02',
          title: 'Transparency',
          text: 'Information organised so you can follow progress and understand each decision.',
        },
        {
          number: '03',
          title: 'Accountability',
          text: 'A team set up to coordinate, verify and deliver with rigour.',
        },
      ],
    },
    cta: {
      eyebrow: 'Your next project',
      title: 'Let us turn your requirement into a concrete plan.',
      lead: 'Well considered. Well managed. Well built.',
      button: 'Start a conversation',
    },
  },
  about: {
    hero: {
      eyebrow: 'Meteoro 24',
      title: 'Delivery and management under a single responsibility.',
      lead: 'Construction and project management in Angola, held to the same standard before, during and after the build.',
    },
    story: {
      title: 'The build starts before the site does',
      body: [
        'Building well starts with well-structured decisions. Every choice made before and during execution has a direct effect on cost, schedule, quality and how long the result lasts.',
        'That is why we treat planning as part of the build rather than as a document filed away. The plan is the instrument used to decide, to correct and to respond when something unexpected happens.',
      ],
    },
    principle: {
      title: 'We do not work on the site alone.',
      body: [
        'We structure the project, organise the resources, follow the execution and keep the client informed at every stage.',
        'Holding delivery and management under the same responsibility removes the grey area where schedules usually slip, costs accumulate and accountability dissolves.',
      ],
      keywords: ['Plan', 'Coordinate', 'Control', 'Deliver'],
    },
    pillars: {
      title: 'What the client gets on every project',
      items: [
        { key: 'clareza', label: 'Clarity', text: 'about what will be built' },
        { key: 'controlo', label: 'Control', text: 'over resources and execution' },
        { key: 'confianca', label: 'Confidence', text: 'in the result delivered' },
      ],
    },
  },
  method: {
    hero: {
      eyebrow: 'How we work',
      title: 'A clear process from start to handover.',
      lead: 'Five linked stages. Each one produces the information the next stage depends on.',
    },
    steps: [
      {
        number: '01',
        title: 'Understand',
        text: 'Requirements and constraints. Before proposing solutions we establish what the project demands and what limits it — site, budget, schedule, permitting and client expectations.',
      },
      {
        number: '02',
        title: 'Structure',
        text: 'Scope, resources and plan. We define what is in and what is out, which resources are needed and in what sequence the work fronts advance.',
      },
      {
        number: '03',
        title: 'Execute',
        text: 'Coordination of work fronts. Teams, suppliers and trades work to a shared plan, with responsibilities assigned.',
      },
      {
        number: '04',
        title: 'Control',
        text: 'Quality, cost and schedule. We measure what was built against what was planned and act on the deviation while it can still be corrected.',
      },
      {
        number: '05',
        title: 'Deliver',
        text: 'Completion and continuity. The build is closed out with the information organised for whoever will use and maintain it.',
      },
    ],
    note: 'Each stage produces the information the next one needs, and leaves less room for improvisation.',
    value: {
      title: 'What this process delivers',
      items: [
        {
          number: '01',
          title: 'Predictability',
          text: 'Planning and monitoring that anticipate schedule and cost deviations.',
        },
        {
          number: '02',
          title: 'Transparency',
          text: 'Information organised so you can follow progress and understand each decision.',
        },
        {
          number: '03',
          title: 'Accountability',
          text: 'A team set up to coordinate, verify and deliver with rigour.',
        },
      ],
    },
  },
  services: {
    hero: {
      eyebrow: 'What we do',
      title: 'Six services. One integrated view.',
      lead: 'They can be engaged separately or together. Taken together, information moves between them without getting lost.',
    },
    items: [
      {
        slug: 'planeamento-e-controlo-de-obras',
        number: '01',
        title: 'Works planning and control',
        short: 'Sequencing of stages, resources and priorities, with continuous monitoring of execution.',
        lead: 'The plan is not a document. It is the instrument you decide with while the work is running.',
        body: [
          'We structure the build before it starts and keep that plan alive while it runs. The aim is not a good-looking programme, but a defensible answer, at any moment, to "where are we" and "what happens next".',
        ],
        points: [
          {
            title: 'Execution plan',
            text: 'Sequencing of stages, resources, dependencies and priorities.',
          },
          {
            title: 'Monitored programme',
            text: 'Progress tracking and early identification of deviations.',
          },
          {
            title: 'Informed decisions',
            text: 'Clear information to respond to risk and change during the build.',
          },
        ],
        keywords: ['Plan', 'Monitor', 'Decide'],
        image: { src: '/images/equipa-gabinete.jpg', alt: 'Two engineers reviewing drawings and a programme in a site office' },
      },
      {
        slug: 'orcamentacao',
        number: '02',
        title: 'Cost estimating',
        short: 'Measurements, bills of quantities and estimates that make the investment transparent before execution.',
        lead: 'Cost forecast. Execution verified.',
        body: [
          'Measurements, bills of quantities and estimates that make the investment more transparent before execution begins.',
          'A budget exists to support a decision, not just to be approved. We work from measured quantities and stated assumptions, so whoever reads the estimate can see where each figure comes from and what changes if the solution changes.',
        ],
        points: [
          { title: 'Measure', text: 'Survey and measurement of what the build requires, item by item.' },
          { title: 'Estimate', text: 'Rates and outputs applied to real quantities, with assumptions written down.' },
          { title: 'Consolidate', text: 'Bill of quantities and budget organised for comparison and decision.' },
        ],
        keywords: ['Measure', 'Estimate', 'Consolidate'],
      },
      {
        slug: 'fiscalizacao',
        number: '03',
        title: 'Site supervision',
        short: 'Monitoring of quality, compliance, quantities, schedule and the conditions agreed for the works.',
        lead: 'Checking at the right moment costs less than correcting afterwards.',
        body: [
          'Monitoring of quality, compliance, quantities, schedule and the conditions agreed for the works.',
          'Supervision represents the interest of whoever is paying for the build. We verify what is being executed against what was contracted and record what we find, so decisions are documented rather than remembered.',
        ],
        points: [
          { title: 'Monitor', text: 'Presence on site and verification of execution against the design.' },
          { title: 'Validate', text: 'Technical compliance, quantities executed and contractual conditions.' },
          { title: 'Report', text: 'Periodic reports covering status, deviations and recommendations.' },
        ],
        keywords: ['Monitor', 'Validate', 'Report'],
        image: { src: '/images/hero-obra.jpg', alt: 'Engineer reading drawings in front of a building under construction' },
      },
      {
        slug: 'reforma-e-manutencao',
        number: '04',
        title: 'Refurbishment and preventive maintenance',
        short: 'Planned works to adapt spaces, correct defects and extend the service life of buildings.',
        lead: 'Refurbishment recovers value. Maintenance protects the investment.',
        body: [
          'Planned works to adapt spaces, correct defects and extend the service life of buildings.',
          'A building deteriorates predictably. Treating that deterioration early, to a plan, costs a fraction of reacting to a defect that has already taken hold.',
        ],
        points: [
          { title: 'Refurbishment', text: 'Adaptation of spaces and correction of existing defects.' },
          { title: 'Preventive maintenance', text: 'Scheduled works before the problem becomes a construction job.' },
          { title: 'Continuity', text: 'Ongoing monitoring, with a record of what has been done.' },
        ],
        keywords: ['Refurbishment', 'Preventive maintenance', 'Continuity'],
      },
      {
        slug: 'estruturas-metalicas',
        number: '05',
        title: 'Steel structures',
        short: 'Design, fabrication and erection coordinated to achieve safety, performance and quality in the details.',
        lead: 'Steel structures built to precision.',
        body: [
          'Design, fabrication and erection coordinated to achieve safety, performance and quality in the details.',
          'In a steel structure, an error cannot be corrected with mortar. Coordination between design, fabrication and erection is what separates a frame that fits first time from one that consumes weeks in adjustments.',
        ],
        points: [
          { title: 'Design', text: 'Structural solution and detailing coordinated with the wider project.' },
          { title: 'Fabrication', text: 'Controlled production, with dimensional checks before it leaves for site.' },
          { title: 'Erection', text: 'A planned erection sequence, with safety conditions defined.' },
        ],
        keywords: ['Design', 'Fabrication', 'Erection'],
        image: { src: '/images/estrutura-metalica.jpg', alt: 'Steel frame erected on a building under construction at sunset' },
      },
      {
        slug: 'piscinas',
        number: '06',
        title: 'Swimming pool construction',
        short: 'From the technical solution to finishes and plant, we coordinate every stage.',
        lead: 'Pools designed as part of the architecture.',
        body: [
          'From the technical solution to the finishes and operating systems, we coordinate every stage to deliver quality, integration and durability.',
          'A pool is an engineering work with an exposed finish. Structure, waterproofing, hydraulics and finishes have to be decided together — that is where durability is won or lost.',
        ],
        points: [
          { title: 'Design', text: 'A technical solution integrated with the architecture and the site.' },
          { title: 'Construction', text: 'Structure, waterproofing and hydraulic systems executed under control.' },
          { title: 'Finishing', text: 'Finishes, equipment and commissioning tests before handover.' },
        ],
        keywords: ['Design', 'Construction', 'Finishing'],
        image: { src: '/images/piscina.jpg', alt: 'Swimming pool integrated into the architecture of a house at dusk' },
      },
    ],
  },
  projects: {
    hero: {
      eyebrow: 'Projects',
      title: 'Types of work.',
      lead: 'The areas we work in and the kind of build we coordinate.',
    },
    notice: {
      title: 'Portfolio in preparation',
      body: 'We are organising the photographic and technical record of completed works. Until then, this page presents the types of work we take on. For references on builds similar to yours, get in touch.',
    },
    typologies: {
      title: 'Where we work',
      lead: 'Each type of work calls for a different combination of our services.',
    },
  },
  contact: {
    hero: {
      eyebrow: 'Your next project',
      title: 'Let us turn your requirement into a concrete plan.',
      lead: 'Tell us what you need. We reply with an initial framing and the next steps.',
    },
    details: {
      title: 'Direct contacts',
      phoneLabel: 'Phone',
      emailLabel: 'Email',
      addressLabel: 'Address',
      hoursLabel: 'Hours',
    },
    form: {
      title: 'Send a message',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      subject: 'Subject',
      subjectOptions: [
        'Works planning and control',
        'Cost estimating',
        'Site supervision',
        'Refurbishment and maintenance',
        'Steel structures',
        'Swimming pool construction',
        'Other',
      ],
      message: 'Message',
      submit: 'Send message',
      sending: 'Sending...',
      success: 'Message sent. We will be in touch shortly.',
      error: 'The message could not be sent. Please try again or contact us directly.',
      required: 'Required field',
      invalidEmail: 'Enter a valid email address',
      privacy: 'The data you send is used only to reply to your enquiry.',
    },
  },
  footer: {
    sections: { company: 'Company', services: 'Services', contact: 'Contact' },
    rights: 'All rights reserved.',
    country: 'Angola',
  },
};
