import { cookies } from "next/headers";
import { parseSession, isValidAdmin, SESSION_COOKIE, ADMIN_COOKIE } from "./session";

// E-mail do usuário logado (lido do cookie de sessão). Server-side apenas.
export function currentEmail(): string | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return parseSession(token)?.email ?? null;
}

// Verifica se o admin está autenticado (cookie de admin). Server-side apenas.
export function isAdmin(): boolean {
  return isValidAdmin(cookies().get(ADMIN_COOKIE)?.value);
}
