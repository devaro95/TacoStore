import Stripe from "stripe";
import { db } from "./_lib/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const SHIP_CENTS = 395;
const FREE_SHIP_CENTS = 5000;
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
  if (!Array.isArray(items) || !items.length || items.length > 50) return json({ error: "El carrito está vacío" }, 400);

  // Precio y stock reales desde Supabase: el navegador solo envía id + cantidad
  const ids = [...new Set(items.map((i) => String(i.id)))];
  if (ids.some((id) => !/^[a-z0-9-]{1,64}$/.test(id))) return json({ error: "Producto no válido" }, 400);
  let rows;
  try {
    rows = await db(`products?select=id,name,price,stock_qty,active&id=in.(${ids.join(",")})`);
  } catch (err) {
    console.error("Error leyendo productos:", err.message);
    return json({ error: "No se pudo iniciar el pago" }, 500);
  }
  const byId = Object.fromEntries(rows.map((r) => [r.id, r]));

  const line_items = [];
  const cart = [];
  let subtotal = 0;
  for (const { id, qty } of items) {
    const p = byId[id];
    const q = Math.floor(Number(qty));
    if (!p || !p.active || p.stock_qty < 1) return json({ error: `Producto agotado: ${p?.name || id}` }, 400);
    if (!(q >= 1 && q <= MAX_QTY)) return json({ error: `Cantidad no válida: ${p.name}` }, 400);
    if (q > p.stock_qty) return json({ error: `Solo quedan ${p.stock_qty} de ${p.name}` }, 400);
    const cents = Math.round(Number(p.price) * 100);
    subtotal += cents * q;
    cart.push([id, q]);
    line_items.push({
      quantity: q,
      price_data: { currency: "eur", unit_amount: cents, product_data: { name: p.name, metadata: { id } } },
    });
  }

  const shipCents = subtotal >= FREE_SHIP_CENTS ? 0 : SHIP_CENTS;
  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      // Sin payment_method_types: Stripe muestra los métodos activados en el Dashboard (tarjeta, Link, Apple/Google Pay…)
      // España y resto de la Unión Europea (mismas tarifas de envío por ahora)
      shipping_address_collection: { allowed_countries: ["ES", "PT", "FR", "IT", "DE", "AT", "BE", "NL", "LU", "IE", "DK", "SE", "FI", "PL", "CZ", "SK", "SI", "HR", "HU", "RO", "BG", "GR", "CY", "MT", "EE", "LV", "LT"] },
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
      metadata: { cart: JSON.stringify(cart) },
      success_url: `${origin}/?pedido=ok&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?pedido=cancelado`,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err.message);
    return json({ error: "No se pudo iniciar el pago" }, 500);
  }
}
