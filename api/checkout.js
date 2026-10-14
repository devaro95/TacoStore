import Stripe from "stripe";
import { CATALOG, SHIP_CENTS, FREE_SHIP_CENTS } from "./_lib/catalog.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const MAX_QTY = 20;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export async function POST(request) {
  let items;
  try {
    ({ items } = await request.json());
  } catch {
    return json({ error: "Petición no válida" }, 400);
  }
  if (!Array.isArray(items) || !items.length) return json({ error: "El carrito está vacío" }, 400);

  const line_items = [];
  let subtotal = 0;
  for (const { id, qty } of items) {
    const p = CATALOG[id];
    const q = Math.floor(Number(qty));
    if (!p || !p.stock) return json({ error: `Producto no disponible: ${id}` }, 400);
    if (!(q >= 1 && q <= MAX_QTY)) return json({ error: `Cantidad no válida: ${id}` }, 400);
    subtotal += p.cents * q;
    line_items.push({
      quantity: q,
      price_data: { currency: "eur", unit_amount: p.cents, product_data: { name: p.name, metadata: { id } } },
    });
  }

  const shipCents = subtotal >= FREE_SHIP_CENTS ? 0 : SHIP_CENTS;
  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      // Sin payment_method_types: Stripe muestra los métodos activados en el Dashboard (tarjeta, Link, Apple/Google Pay…)
      shipping_address_collection: { allowed_countries: ["ES"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: shipCents ? "Envío estándar" : "Envío gratis",
            fixed_amount: { amount: shipCents, currency: "eur" },
            delivery_estimate: { minimum: { unit: "business_day", value: 2 }, maximum: { unit: "business_day", value: 5 } },
          },
        },
      ],
      phone_number_collection: { enabled: true },
      locale: "es",
      metadata: { cart: JSON.stringify(items.map(({ id, qty }) => [id, Math.floor(qty)])) },
      success_url: `${origin}/?pedido=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?pedido=cancelado`,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    return json({ error: "No se pudo iniciar el pago" }, 500);
  }
}
