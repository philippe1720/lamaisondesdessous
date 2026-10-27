// Node 18+ : exemple à brancher après vérification du paiement côté boutique.
// Pas branché automatiquement au site par cette livraison.
// Utiliser l'ID stable Stripe (evt_...) : même événement, même ID à chaque relance.
import crypto from "node:crypto";
export async function notifyAI(eventId, type, data = {}) {
  const url = new URL(process.env.AI_WEBHOOK_URL);
  if (url.protocol !== "https:") throw new Error("HTTPS requis");
  const secret = process.env.AI_WEBHOOK_SECRET;
  if (!secret || secret.length < 32) throw new Error("Secret IA manquant");
  const body = JSON.stringify({ id: eventId, type, data });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = crypto.createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  const res = await fetch(new URL("/webhooks/shop", url), {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(10000),
    headers: {"Content-Type":"application/json", "X-Timestamp":timestamp, "X-Signature":signature}, body
  });
  if (!res.ok) throw new Error(`Webhook IA refusé : HTTP ${res.status}`);
  return res.json();
}
// await notifyAI(stripeEvent.id, "order.paid", {checkout_session_id: session.id, total_cents: session.amount_total});
// Ne pas envoyer d'adresse, carte ou email client. Retenter via une outbox durable en cas d'échec.
// Ne jamais conditionner la confirmation cliente au succès de l'analyse IA.
