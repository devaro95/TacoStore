import Stripe from "stripe";
import { db } from "./_lib/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

// Resumen del pedido para la pantalla de "pedido realizado".
// El session_id de Stripe es secreto y solo lo conoce quien acaba de pagar (viene en la success_url).
export async function GET(request) {
  const sid = new URL(request.url).searchParams.get("session_id") || "";
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(sid)) return json({ error: "Pedido no válido" }, 400);

  let s;
  try {
    s = await stripe.checkout.sessions.retrieve(sid, { expand: ["line_items"] });
  } catch {
    return json({ error: "Pedido no encontrado" }, 404);
  }
  if (s.payment_status !== "paid") return json({ error: "El pago no se ha completado" }, 402);

  // Nº de pedido interno (lo crea el webhook; puede tardar unos segundos)
  let number = null;
  try {
    const [row] = await db(`orders?select=id&stripe_session_id=eq.${encodeURIComponent(s.id)}`);
    number = row?.id ?? null;
  } catch (err) {
    console.error("Error leyendo pedido:", err.message);
  }

  const ship = s.collected_information?.shipping_details;
  const a = ship?.address ?? s.customer_details?.address ?? {};
  return json({
    number,
    ref: s.id.slice(-10).toUpperCase(),
    date: new Date(s.created * 1000).toISOString(),
    email: s.customer_details?.email,
    name: ship?.name ?? s.customer_details?.name,
    phone: s.customer_details?.phone,
    address: [a.line1, a.line2, [a.postal_code, a.city].filter(Boolean).join(" "), a.state].filter(Boolean),
    items: s.line_items.data.map((li) => ({ name: li.description, qty: li.quantity, total: li.amount_total / 100 })),
    subtotal: s.amount_subtotal / 100,
    shipping: (s.shipping_cost?.amount_total ?? 0) / 100,
    total: s.amount_total / 100,
  });
}
