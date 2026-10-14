import Stripe from "stripe";

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

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.payment_status === "paid") await fulfillOrder(session);
      break;
    }
    case "checkout.session.async_payment_failed":
      console.warn("Pago asíncrono fallido:", event.data.object.id);
      break;
  }

  return new Response("ok");
}

// Idempotente por session.id: Stripe puede reenviar el mismo evento.
async function fulfillOrder(session) {
  const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items"] });
  const order = {
    id: full.id,
    email: full.customer_details?.email,
    name: full.collected_information?.shipping_details?.name,
    address: full.collected_information?.shipping_details?.address,
    phone: full.customer_details?.phone,
    total: full.amount_total / 100,
    items: full.line_items.data.map((li) => ({ name: li.description, qty: li.quantity })),
  };
  // TODO: guardar el pedido (p. ej. Supabase), descontar stock y enviar email de confirmación.
  console.log("Pedido pagado:", JSON.stringify(order));
}
