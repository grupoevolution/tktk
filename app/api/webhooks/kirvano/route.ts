import { NextResponse } from "next/server";
import { upsertBuyer } from "@/lib/db";
import { KIRVANO_WEBHOOK_SECRET } from "@/lib/config";

// Eventos da Kirvano que liberam / revogam acesso.
const APPROVED = ["SALE_APPROVED", "APPROVED", "PURCHASE_APPROVED", "PAID"];
const REVOKED = ["SALE_REFUNDED", "REFUNDED", "CHARGEBACK", "SALE_CHARGEBACK", "REFUND"];

function extractEmail(body: any): string | null {
  return (
    body?.customer?.email ||
    body?.customer_email ||
    body?.email ||
    body?.buyer?.email ||
    null
  );
}

function extractEvent(body: any): string {
  return String(body?.event || body?.status || body?.type || "").toUpperCase();
}

export async function POST(req: Request) {
  // Validação do secret (configurado no painel da Kirvano).
  if (KIRVANO_WEBHOOK_SECRET) {
    const url = new URL(req.url);
    const provided =
      req.headers.get("security-token") ||
      req.headers.get("x-kirvano-token") ||
      url.searchParams.get("secret");
    if (provided !== KIRVANO_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Payload inválido" }, { status: 400 });

  const email = extractEmail(body);
  if (!email) return NextResponse.json({ error: "Sem e-mail no payload" }, { status: 422 });

  const event = extractEvent(body);
  const orderId = body?.order_id || body?.sale_id || body?.id || undefined;

  if (APPROVED.includes(event)) {
    await upsertBuyer(email, "active", orderId);
  } else if (REVOKED.includes(event)) {
    await upsertBuyer(email, "refunded", orderId);
  }
  // Outros eventos são ignorados (200 para a Kirvano não reenviar).

  return NextResponse.json({ ok: true });
}
