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
