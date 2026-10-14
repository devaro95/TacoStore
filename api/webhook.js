import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// Idempotente: stripe_session_id es único, un reenvío del mismo evento no duplica el pedido.
async function fulfillOrder(sessionId) {
  const s = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
  const ship = s.collected_information?.shipping_details;
  const order = {
    stripe_session_id: s.id,
    payment_intent: typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id,
    email: s.customer_details?.email,
    name: ship?.name ?? s.customer_details?.name,
    phone: s.customer_details?.phone,
    address: ship?.address ?? s.customer_details?.address,
    items: s.line_items.data.map((li) => ({
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

  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?on_conflict=stripe_session_id`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      authorization: `Bearer ${SUPABASE_KEY}`,
      "content-type": "application/json",
      prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  console.log("Pedido guardado:", s.id);
  // TODO: email de confirmación al cliente y aviso a la tienda.
}
