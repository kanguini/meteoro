import type { Content } from './types';
import { pt } from './pt';
import { en } from './en';
import type { Locale } from './config';

const dictionaries: Record<Locale, Content> = { pt, en };

export function getContent(locale: Locale): Content {
  return dictionaries[locale];
}

export * from './config';
export type { Content } from './types';
