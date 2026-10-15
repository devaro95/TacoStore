import { sendContactEmail } from "./_lib/email.js";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const TOPICS = ["Un pedido", "Producto o stock", "Preventas", "Otro"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// POST { name, email, topic, order?, message, website? } — "website" es un campo trampa para bots
export async function POST(request) {
  let b;
  try {
    b = await request.json();
  } catch {
    return json({ error: "Petición no válida" }, 400);
  }
  if (b.website) return json({ ok: true }); // bot: fingimos éxito
  const name = String(b.name || "").trim().slice(0, 80);
  const email = String(b.email || "").trim().slice(0, 120);
  const topic = TOPICS.includes(b.topic) ? b.topic : "Otro";
  const order = String(b.order || "").trim().slice(0, 40);
  const message = String(b.message || "").trim().slice(0, 3000);
  if (!name) return json({ error: "Escribe tu nombre" }, 400);
  if (!EMAIL_RE.test(email)) return json({ error: "Escribe un correo válido" }, 400);
  if (message.length < 10) return json({ error: "Cuéntanos un poco más en el mensaje" }, 400);
  try {
    await sendContactEmail({ name, email, topic, order, message });
  } catch (err) {
    console.error("Contacto:", err.message);
    return json({ error: "No se pudo enviar el mensaje. Inténtalo de nuevo en un rato." }, 502);
  }
  return json({ ok: true });
}
