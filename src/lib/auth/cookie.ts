/**
 * Nome do cookie de sessão, isolado num módulo sem dependências.
 *
 * O middleware corre no runtime edge, onde `node:crypto` não existe. Se
 * importasse isto de `session.ts`, arrastava o módulo inteiro e o build falhava
 * com "Reading from node:crypto is not handled by plugins".
 */
export const SESSION_COOKIE = 'meteoro_session';
