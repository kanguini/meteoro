import { headers } from 'next/headers';

/**
 * Limitador de tentativas em memória.
 *
 * A aplicação corre num único processo Node na Hostinger, por isso um Map em
 * memória é suficiente e não precisa de Redis. Perde o estado num redeploy —
 * aceitável para travar força bruta e spam, que são rajadas curtas.
 *
 * Janela deslizante simples: guarda os instantes das tentativas por chave e
 * conta as que caem dentro da janela.
 */

type Bucket = number[]; // timestamps (ms)

const store = new Map<string, Bucket>();

// Limpeza periódica para o Map não crescer sem fim. Corre no máximo a cada
// minuto, na primeira chamada após esse intervalo.
let lastSweep = 0;
function sweep(now: number, windowMs: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hits] of store) {
    const alive = hits.filter((t) => now - t < windowMs);
    if (alive.length === 0) store.delete(key);
    else store.set(key, alive);
  }
}

export type RateResult = { ok: true } | { ok: false; retryAfterSeconds: number };

/**
 * Regista uma tentativa para `key` e diz se excedeu `limit` numa janela de
 * `windowMs`. Cada chamada conta como uma tentativa.
 */
export function hit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now, windowMs);

  const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  store.set(key, hits);

  if (hits.length > limit) {
    const oldest = hits[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    return { ok: false, retryAfterSeconds };
  }

  return { ok: true };
}

/** Anula as tentativas de uma chave — usar após um login bem-sucedido. */
export function reset(key: string): void {
  store.delete(key);
}

/**
 * IP do cliente a partir dos cabeçalhos do proxy. A Hostinger (hcdn) põe o IP
 * real em x-forwarded-for; o primeiro valor da lista é o cliente. Sem cabeçalho
 * fica 'unknown' — nesse caso o limite passa a ser global, o que é conservador.
 */
export async function clientIp(): Promise<string> {
  const store = await headers();
  const forwarded = store.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return store.get('x-real-ip') ?? 'unknown';
}
