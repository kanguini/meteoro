/**
 * Tipos partilhados de carreiras. Vivem à parte de content.ts para que os
 * componentes de cliente os possam importar sem arrastar a camada de base de
 * dados para o bundle do browser.
 */
import type { Content as FullContent } from '@/i18n/types';

export type JobEntry = {
  slug: string;
  title: string;
  department: string;
  type: string;
  location: string;
  intro: string;
  sections: { title: string; items: string[] }[];
  profile: string;
};

export type Content = FullContent;
