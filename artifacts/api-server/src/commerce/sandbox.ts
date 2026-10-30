import { Router } from 'express';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { validateLines } from './core';
import { liveCatalog, type Product } from './catalog';
import { currentUpsell, acceptedOffer } from './offer';
import { pickupAvailable, searchRelays } from './relay';

export const sandboxRouter = Router();

const testKey = () => {
  const value = (process.env.STRIPE_TEST_SECRET_KEY || '').trim();
  // Fail closed. A live-mode key can never be used for sandbox payments.
  return /^sk_test_[A-Za-z0-9]{12,}$/.test(value) ? value : '';
};
export const sandboxReady = () => Boolean(testKey());
const validId = (id: unknown): id is string =>
  typeof id === 'string' && /^cs_test_[A-Za-z0-9_]{10,250}$/.test(id);
const safeEqual = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const site = () => {
  const url = new URL(process.env.SITE_URL || '');
  if (url.protocol !== 'https:') throw new Error('SITE_URL must be HTTPS');
  return url.origin;
};
export async function stripeSandboxRequest(path: string, data?: URLSearchParams): Promise<any> {
  if (!testKey()) throw new Error('Stripe sandbox non configuré');
  const response = await fetch('https://api.stripe.com/v1/' + path, {
    method: data ? 'POST' : 'GET',
    headers: {
      Authorization: 'Bearer ' + testKey(),
      ...(data ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': randomUUID() } : {})
    },
    body: data,
    redirect: 'error',
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error('Stripe Test indisponible');
  return response.json();
}
sandboxRouter.get('/sandbox/config', async (_req, res) => {
  let upsell = null;
  try { if (sandboxReady() && process.env.BUSYX_FEED_URL) upsell = await currentUpsell(); } catch {}
  res.json({
    checkoutEnabled: sandboxReady(), paymentMode: 'test',
    pickupEnabled: pickupAvailable(), points: [], welcomeCode: null, upsell
  });
});
sandboxRouter.post('/sandbox/checkout', async (req, res) => {
  if (!sandboxReady()) { res.status(503).json({ error: 'Mode test désactivé : configurez STRIPE_TEST_SECRET_KEY sur Render.' }); return; }
  let lines: ReturnType<typeof validateLines>;
  try { lines = validateLines(req.body?.lines); }
  catch { res.status(400).json({ error: 'Panier de test invalide.' }); return; }
  const delivery = req.body.delivery;
  if (delivery !== 'home' && delivery !== 'pickup') {
    res.status(400).json({ error: 'Mode de livraison incorrect.' }); return;
  }
  let point;
  if (delivery === 'pickup') {
    if (!pickupAvailable()) { res.status(503).json({ error: 'Les relais ne sont pas disponibles.' }); return; }
    try {
      const postcode = String(req.body.pickupPostcode || ''), city = String(req.body.pickupCity || '');
      if (!/^\d{5}$/.test(postcode) || !city || city.length > 100) throw new Error();
      point = (await searchRelays(postcode, city)).find(p => p.id === req.body.pickup);
    } catch { res.status(503).json({ error: 'Impossible de vérifier le relais sélectionné.' }); return; }
    if (!point) { res.status(400).json({ error: 'Sélectionnez un relais valide.' }); return; }
  }
  try {
    const origin = site();
    const { products, rows } = await liveCatalog();
    const chosen: { product: Product; variant: Product['variants'][number]; quantity: number }[] = [];
    for (const line of lines) {
      const product = products.find(p => p.variants.some(v => v.ean === line.ean));
      const variant = product?.variants.find(v => v.ean === line.ean);
      if (!product || !variant || variant.stock < line.quantity) {
        res.status(409).json({ error: 'Cette taille est indisponible. Actualisez le panier.' }); return;
      }
      chosen.push({ product, variant, quantity: line.quantity });
    }
    if (req.body.upsell) {
      const offer = await currentUpsell(rows);
      if (!offer || offer.ean !== req.body.upsell || !acceptedOffer(req, offer.ean, offer.priceCents) ||
          lines.some(l => l.ean === offer.ean)) {
        res.status(409).json({ error: 'L’offre de bougie a expiré. Continuez sans elle.' }); return;
      }
      chosen.push({
        product: { id: offer.supplierId, slug: '', name: offer.name, description: offer.description,
          composition: '', category: 'complement', brand: '', images: [offer.image], variants: [] },
        variant: { ean: offer.ean, size: '', color: '', stock: offer.stock, priceCents: offer.priceCents },
        quantity: 1
      });
    }
    const total = chosen.reduce((sum, x) => sum + x.variant.priceCents * x.quantity, 0);
    if (!Number.isSafeInteger(total) || total <= 0 || total !== req.body.expectedTotal) {
      res.status(409).json({ error: 'Le total a changé. Actualisez le panier.' }); return;
    }
    const access = randomBytes(32).toString('hex');
    const p = new URLSearchParams({
      mode: 'payment',
      success_url: origin + '/commande/confirmation?session_id={CHECKOUT_SESSION_ID}#access=' + access,
      cancel_url: origin + '/panier',
      locale: 'fr', customer_creation: 'always',
      'shipping_address_collection[allowed_countries][0]': 'FR',
      'phone_number_collection[enabled]': 'true',
      'shipping_options[0][shipping_rate_data][type]': 'fixed_amount',
      'shipping_options[0][shipping_rate_data][fixed_amount][amount]': '0',
      'shipping_options[0][shipping_rate_data][fixed_amount][currency]': 'eur',
      'shipping_options[0][shipping_rate_data][display_name]': delivery === 'home' ? 'Colissimo domicile — TEST' : 'Colissimo Pickup — TEST',
      'metadata[store]': 'lmd-sandbox',
      'metadata[order_access]': access,
      'metadata[delivery]': delivery,
      'payment_intent_data[metadata][delivery]': delivery,
      'custom_text[after_submit][message]': 'COMMANDE FICTIVE : aucune somme encaissée et aucune expédition.'
    });
    if (point) {
      p.set('metadata[pickup_id]', point.id);
      p.set('metadata[pickup_address]', (point.name + ', ' + point.address + ', ' + point.postcode + ' ' + point.city).slice(0, 500));
    }
    chosen.forEach(({ product, variant, quantity }, i) => {
      const prefix = 'line_items[' + i + ']';
      p.set(prefix + '[quantity]', String(quantity));
      p.set(prefix + '[price_data][currency]', 'eur');
      p.set(prefix + '[price_data][unit_amount]', String(variant.priceCents));
      p.set(prefix + '[price_data][product_data][name]', product.name + ' — ' + variant.size + ' ' + variant.color + ' (TEST)');
      p.set(prefix + '[price_data][product_data][metadata][ean]', variant.ean);
      p.set(prefix + '[price_data][product_data][metadata][supplier_id]', product.id);
      p.set('metadata[item_' + i + ']', variant.ean + ':' + quantity);
    });
    const result = await stripeSandboxRequest('checkout/sessions', p);
    if (!validId(result.id) || result.livemode !== false || !result.url?.startsWith('https://checkout.stripe.com/')) {
      throw new Error('Stripe a refusé le paiement fictif.');
    }
    res.json({ url: result.url, sessionId: result.id });
  } catch {
    res.status(503).json({ error: 'Impossible de préparer le paiement fictif. Aucun paiement réel n’a été lancé.' });
  }
});
sandboxRouter.post('/sandbox/order', async (req, res) => {
  const { sessionId, access } = req.body || {};
  if (!validId(sessionId) || typeof access !== 'string' || !/^[a-f0-9]{64}$/.test(access)) {
    res.status(400).json({ error: 'Lien de test incomplet.' }); return;
  }
  try {
    const s = await stripeSandboxRequest('checkout/sessions/' + sessionId);
    if (s.livemode !== false || s.metadata?.store !== 'lmd-sandbox' ||
        !safeEqual(String(s.metadata?.order_access || ''), access)) {
      res.status(404).json({ error: 'Commande fictive introuvable.' }); return;
    }
    const items = await stripeSandboxRequest('checkout/sessions/' + sessionId +
      '/line_items?limit=100&expand[]=data.price.product');
    const paid = s.payment_status === 'paid';
    res.json({
      id: s.id, paid, test: true, status: paid ? 'paid' : s.status === 'expired' ? 'expired' : 'pending',
      amount: s.amount_total || 0, currency: s.currency, refunded: 0,
      delivery: s.metadata?.delivery || 'home', pickup: s.metadata?.pickup_address || null,
      shipping: s.collected_information?.shipping_details || s.shipping_details || s.customer_details,
      tracking: null,
      items: items.data.map((item: any) => ({
        name: item.description, quantity: item.quantity, total: item.amount_total,
        ean: item.price?.product?.metadata?.ean || ''
      }))
    });
  } catch { res.status(503).json({ error: 'Impossible de récupérer cette commande fictive dans Stripe Test.' }); }
});
