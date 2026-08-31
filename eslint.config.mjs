import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/** Config plana do ESLint (Next 16). O `next lint` foi removido; corre-se `eslint .`. */
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'drizzle/**', 'next-env.d.ts'] },
  ...coreWebVitals,
  ...typescript,
];

export default config;
