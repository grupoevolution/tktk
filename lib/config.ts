export const hasBunny = !!process.env.BUNNY_CDN_HOSTNAME;

export function getSettings() {
  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME || "TKTK P🔞RN",
    freeLimit: Number(process.env.FREE_LIMIT || 3),
    loginBlur: (process.env.LOGIN_BLUR || "true") === "true",
  };
}

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";
export const KIRVANO_WEBHOOK_SECRET = process.env.KIRVANO_WEBHOOK_SECRET || "";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// E-mails com acesso premium (sem precisar comprar)
// Defina no EasyPanel: PREMIUM_EMAILS=email1@gmail.com,email2@gmail.com
export function isPremiumEmail(email: string): boolean {
  const raw = process.env.PREMIUM_EMAILS || "";
  if (!raw.trim()) return false;
  const list = raw.split(",").map((e) => e.trim().toLowerCase());
  return list.includes(email.toLowerCase().trim());
}
