import Stripe from "stripe";
import { sendOrderEmails } from "./_lib/email.js";
import { db } from "./_lib/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text(); // cuerpo sin parsear: necesario para verificar la firma

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Firma de webhook no válida:", err.message);
    return new Response("Bad signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session.payment_status === "paid") await fulfillOrder(session.id);
        break;
      }
      case "checkout.session.async_payment_failed":
        console.warn("Pago asíncrono fallido:", event.data.object.id);
        break;
    }
  } catch (err) {
    // 500 => Stripe reintenta el evento más tarde
    console.error("Error procesando pedido:", err.message);
    return new Response("Error", { status: 500 });
  }

  return new Response("ok");
}

// Idempotente: stripe_session_id es único, un reenvío del mismo evento no duplica el pedido ni el descuento de stock.
async function fulfillOrder(sessionId) {
  const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items.data.price.product"] });
  const ship = s.collected_information?.shipping_details;
  const order = {
    stripe_session_id: s.id,
    payment_intent: typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id,
    email: s.customer_details?.email,
    name: ship?.name ?? s.customer_details?.name,
    phone: s.customer_details?.phone,
    address: ship?.address ?? s.customer_details?.address,
    items: s.line_items.data.map((li) => ({
      id: li.price?.product?.metadata?.id,
      name: li.description,
      qty: li.quantity,
      unit: li.price?.unit_amount / 100,
      total: li.amount_total / 100,
    })),
    subtotal: s.amount_subtotal / 100,
    shipping: (s.shipping_cost?.amount_total ?? 0) / 100,
    total: s.amount_total / 100,
    currency: s.currency,
    livemode: s.livemode,
  };

  const [saved] = await db("orders?on_conflict=stripe_session_id", {
    method: "POST",
    body: order,
    prefer: "resolution=ignore-duplicates,return=representation",
  }); // vacío si el pedido ya existía (evento reenviado)
  if (!saved) return console.log("Pedido ya registrado:", s.id);
  console.log("Pedido guardado:", saved.id);

  // Descontar stock (solo la primera vez que se guarda el pedido)
  const cart = order.items.filter((i) => i.id).map((i) => [i.id, i.qty]);
  await db("rpc/decrement_stock", { method: "POST", body: { items: cart } })
    .catch((e) => console.error("No se pudo descontar stock:", e.message));

  const email_status = await sendOrderEmails(saved);
  await db(`orders?id=eq.${saved.id}`, { method: "PATCH", body: { email_status } })
    .catch((e) => console.error("No se pudo guardar email_status:", e.message));
}
