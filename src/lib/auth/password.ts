import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from 'node:crypto';
import { promisify } from 'node:util';

// O promisify perde a sobrecarga que aceita opções — daí o tipo explícito.
const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options?: ScryptOptions,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;

/**
 * Hash de password com scrypt — vem no Node, não precisa de módulo nativo.
 * (bcrypt e argon2 exigem compilação; depois do problema do Turbopack na
 * Hostinger, tudo o que precisa de binários nativos fica de fora.)
 *
 * Formato guardado: scrypt$N$r$p$salt$hash — os parâmetros seguem no registo
 * para se poderem endurecer no futuro sem invalidar as passwords existentes.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, SCRYPT_PARAMS);
  const { N, r, p } = SCRYPT_PARAMS;
  return ['scrypt', N, r, p, salt.toString('base64'), derived.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, n, r, p, saltB64, hashB64] = parts;
  const salt = Buffer.from(saltB64, 'base64');
  const expected = Buffer.from(hashB64, 'base64');

  let derived: Buffer;
  try {
    derived = await scrypt(password.normalize('NFKC'), salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
  } catch {
    return false;
  }

  // timingSafeEqual rebenta com comprimentos diferentes — daí a verificação antes.
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

/** Regras mínimas de password. Devolve null quando está aceitável. */
export function validatePassword(password: string): string | null {
  if (password.length < 10) return 'A password tem de ter pelo menos 10 caracteres.';
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'A password tem de incluir letras e números.';
  }
  return null;
}

/**
 * Compara duas strings em tempo constante. Para segredos curtos (tokens de
 * setup) evita que o tempo de resposta revele quantos caracteres coincidem.
 */
export function safeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Compara na mesma contra um buffer do mesmo tamanho para não denunciar o
    // comprimento pelo tempo; o resultado é sempre falso.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}
