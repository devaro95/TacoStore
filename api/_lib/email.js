// Emails de pedido vía Resend (https://resend.com/docs/api-reference/emails/send-email)
// Variables: RESEND_API_KEY, EMAIL_FROM (opcional), STORE_EMAIL (aviso a la tienda, opcional)
// Sin dominio verificado, Resend solo permite enviar desde onboarding@resend.dev y solo al email de tu cuenta.
// Saca el email limpio aunque la variable de Vercel traiga espacios, comillas, "STORE_EMAIL=" u otros restos
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const pickEmail = (v) => (String(v || "").match(EMAIL_RE) || [""])[0];
const RAW_FROM = String(process.env.EMAIL_FROM || "").trim();
const FROM = RAW_FROM && pickEmail(RAW_FROM)
  ? (RAW_FROM.includes("<") ? RAW_FROM.replace(/^[\s"'`]+|[\s"'`]+$/g, "") : pickEmail(RAW_FROM))
  : "TacoStore <onboarding@resend.dev>";
const STORE_EMAIL = pickEmail(process.env.STORE_EMAIL);
// Para diagnóstico: cómo llega la variable (longitud y caracteres raros visibles)
export const STORE_EMAIL_DEBUG = JSON.stringify(String(process.env.STORE_EMAIL ?? "(no definida)"));

const eur = (n) => Number(n).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function addressLines(a) {
  if (!a) return "";
  return [a.line1, a.line2, `${a.postal_code ?? ""} ${a.city ?? ""}`.trim(), a.state].filter(Boolean).map(esc).join("<br>");
}

function orderHTML(order, { title, intro }) {
  const rows = order.items
    .map((i) => `<tr><td style="padding:8px 0">${esc(i.name)} × ${i.qty}</td><td style="padding:8px 0;text-align:right">${eur(i.total)}</td></tr>`)
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:8px;padding:28px">
<tr><td>
  <h1 style="margin:0 0 4px;font-size:22px">${esc(title)}</h1>
  <p style="margin:0 0 20px;color:#52525b">${intro}</p>
  <p style="margin:0 0 6px;font-size:13px;color:#71717a">Pedido nº ${order.id}</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;font-size:14px">${rows}</table>
  <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:8px">
    <tr><td style="padding:4px 0;color:#71717a">Envío</td><td style="text-align:right">${order.shipping ? eur(order.shipping) : "Gratis"}</td></tr>
    <tr><td style="padding:4px 0;font-weight:bold">Total (IVA incl.)</td><td style="text-align:right;font-weight:bold">${eur(order.total)}</td></tr>
  </table>
  <h2 style="font-size:15px;margin:24px 0 6px">Envío a</h2>
  <p style="margin:0;font-size:14px;line-height:1.5">${esc(order.name)}<br>${addressLines(order.address)}${order.phone ? `<br>${esc(order.phone)}` : ""}</p>
</td></tr></table>
<p style="font-size:12px;color:#a1a1aa;margin-top:16px">TacoStore · Producto sellado de Dragon Ball Super Card Game · Envíos desde Madrid</p>
</td></tr></table></body></html>`;
}

async function send(payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: FROM, ...payload }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

// Nunca lanza: un fallo de email no debe hacer que Stripe reintente el webhook (el pedido ya está guardado).
// Devuelve un resumen legible del resultado ("cliente: ok · tienda: Resend 403 …") para guardarlo en el pedido.
export async function sendOrderEmails(order) {
  if (!process.env.RESEND_API_KEY) return "RESEND_API_KEY no configurada";
  const jobs = [], labels = [];
  if (order.email) {
    labels.push("cliente");
    jobs.push(send({
      to: order.email,
      subject: `Pedido nº ${order.id} confirmado · TacoStore`,
      html: orderHTML(order, { title: "¡Gracias por tu pedido!", intro: "Hemos recibido tu pago. Te avisaremos cuando salga el envío." }),
      ...(STORE_EMAIL && { reply_to: STORE_EMAIL }),
    }));
  }
  if (STORE_EMAIL) {
    labels.push("tienda");
    jobs.push(send({
      to: STORE_EMAIL,
      subject: `Nuevo pedido nº ${order.id} · ${eur(order.total)}`,
      html: orderHTML(order, { title: "Nuevo pedido", intro: `Cliente: ${esc(order.email)}` }),
      ...(order.email && { reply_to: order.email }),
    }));
  }
  if (!jobs.length) return "sin destinatarios (falta STORE_EMAIL y email del cliente)";
  const results = await Promise.allSettled(jobs);
  const summary = results
    .map((r, i) => `${labels[i]}: ${r.status === "fulfilled" ? "ok" : r.reason.message.slice(0, 300)}`)
    .join(" · ") + (results.some((r) => r.status === "rejected") ? ` · [v4 STORE_EMAIL=${STORE_EMAIL_DEBUG} → ${STORE_EMAIL}]` : "");
  console.log("Emails:", summary);
  return summary;
}
