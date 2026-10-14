import { db } from "./_lib/db.js";
import { sendShippedEmail } from "./_lib/email.js";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

// POST { id, force? } con Authorization: Bearer <token de sesión del panel>
// Envía al cliente el email "Tu pedido va en camino" (una sola vez salvo force).
export async function POST(request) {
  // 1. Solo admins: validamos el token con Supabase Auth y miramos app_metadata.role
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "No autorizado" }, 401);
  const authRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${token}` },
  });
  const user = authRes.ok ? await authRes.json() : null;
  if (user?.app_metadata?.role !== "admin") return json({ error: "No autorizado" }, 403);

  let id, force;
  try {
    ({ id, force } = await request.json());
  } catch {
    return json({ error: "Petición no válida" }, 400);
  }
  if (!Number.isInteger(id)) return json({ error: "Pedido no válido" }, 400);

  const [order] = await db(`orders?id=eq.${id}&select=*`);
  if (!order) return json({ error: "Pedido no encontrado" }, 404);
  if (order.status !== "enviado") return json({ error: "El pedido no está marcado como enviado" }, 400);
  if (!order.tracking) return json({ error: "Falta el número de seguimiento" }, 400);
  if (order.shipped_email_at && !force) return json({ ok: true, skipped: true, shipped_email_at: order.shipped_email_at });

  try {
    await sendShippedEmail(order);
  } catch (err) {
    console.error("Email de envío:", err.message);
    return json({ error: `No se pudo enviar el email (${err.message.slice(0, 160)})` }, 502);
  }
  const [saved] = await db(`orders?id=eq.${id}`, {
    method: "PATCH",
    body: { shipped_email_at: new Date().toISOString() },
    prefer: "return=representation",
  });
  return json({ ok: true, shipped_email_at: saved.shipped_email_at });
}
