import { cookies } from "next/headers";
import { parseSession, isValidAdmin, SESSION_COOKIE, ADMIN_COOKIE } from "./session";
import { isPremiumEmail } from "./config";
import { isBuyer } from "./db";

export function currentEmail(): string | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return parseSession(token)?.email ?? null;
}

export function isAdmin(): boolean {
  return isValidAdmin(cookies().get(ADMIN_COOKIE)?.value);
}

// Verifica se o e-mail tem acesso completo (comprou OU é premium)
export async function hasFullAccess(email: string): Promise<boolean> {
  if (isPremiumEmail(email)) return true;
  return isBuyer(email);
}
