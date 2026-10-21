import { Router, type Request, type Response } from 'express';
import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { stripeRequest } from './orders';

export const managementRouter = Router();
const COOKIE = 'lmd_management';
const SESSION_MS = 8 * 3600_000;
const attempts = new Map<string, { count: number; until: number }>();
const authReady = () => (process.env.ADMIN_PASSWORD || '').length >= 16 &&
  (process.env.ADMIN_SESSION_SECRET || '').length >= 32;
const secure = () => process.env.SITE_URL?.startsWith('https://') ?? false;
const clean = (s: unknown, max = 200) => typeof s === 'string' ? s.trim().slice(0, max) : '';
const digest = (s: string) => createHash('sha256').update(s).digest();
const same = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));
const mac = (s: string) => createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '').update(s).digest('hex');
const validId = (id: string) => /^cs_(test_|live_)?[A-Za-z0-9_]{10,250}$/.test(id);
const sameOrigin = (req: Request) => {
  const origin = req.get('origin');
  if (!origin) return req.get('sec-fetch-site') !== 'cross-site';
  try { return new URL(origin).origin === new URL(process.env.SITE_URL || '').origin; }
  catch { return false; }
};
const signedCookie = () => {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_MS, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  return payload + '.' + mac(payload);
};
const loggedIn = (req: Request) => {
  if (!authReady()) return false;
  const value = (req.get('cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  if (!value || value.length > 500) return false;
  const [data, signature] = value.split('.');
  if (!data || !/^[a-f0-9]{64}$/.test(signature || '') || !same(signature, mac(data))) return false;
  try { const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')); return Number.isSafeInteger(parsed.exp) && parsed.exp > Date.now() && parsed.exp <= Date.now() + SESSION_MS; }
  catch { return false; }
};
const responseHeaders = (_req: Request, res: Response, next: () => void) => {
  res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' });
  next();
};
managementRouter.use('/gestion', responseHeaders);
managementRouter.get('/gestion/session', (req, res) => {
  res.json({ authenticated: loggedIn(req), setupNeeded: !authReady(), emailsConfigured: Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM && process.env.MERCHANT_NOTIFY_EMAIL) });
});
managementRouter.post('/gestion/login', (req, res) => {
  if (!sameOrigin(req)) { res.sendStatus(403); return; }
  if (!authReady()) { res.status(503).json({ error: 'Configurez ADMIN_PASSWORD et ADMIN_SESSION_SECRET dans Render.' }); return; }
  const ip = req.ip || 'unknown', now = Date.now();
  const item = attempts.get(ip) || { count: 0, until: now + 15 * 60_000 };
  if (item.until < now) { item.count = 0; item.until = now + 15 * 60_000; }
  if (item.count >= 8) { res.status(429).json({ error: 'Trop de tentatives. Réessayez dans quinze minutes.' }); return; }
  const password = clean(req.body?.password, 300);
  if (!same(password, process.env.ADMIN_PASSWORD || '')) {
    item.count += 1; attempts.set(ip, item);
    res.status(401).json({ error: 'Mot de passe incorrect.' }); return;
  }
  attempts.delete(ip);
  res.cookie(COOKIE, signedCookie(), { httpOnly: true, secure: secure(), sameSite: 'strict', path: '/api/gestion', maxAge: SESSION_MS });
  res.json({ authenticated: true });
});
managementRouter.post('/gestion/logout', (req, res) => {
  if (!sameOrigin(req)) { res.sendStatus(403); return; }
  res.clearCookie(COOKIE, { path: '/api/gestion', secure: secure(), sameSite: 'strict' });
  res.json({ authenticated: false });
});
managementRouter.use('/gestion', (req, res, next) => {
  if (!loggedIn(req)) { res.status(401).json({ error: 'Connexion requise.' }); return; }
  if (req.method !== 'GET' && !sameOrigin(req)) { res.sendStatus(403); return; }
  next();
});

const orderStatus = (s: any) => s.metadata?.tracking_number ? 'shipped'
  : s.metadata?.supplier_ordered_at ? 'supplier_ordered' : 'to_process';
const toOrder = (s: any) => ({
  id: s.id, created: s.created, amount: s.amount_total || 0, currency: s.currency,
  paid: s.payment_status === 'paid', test: !s.livemode,
  email: s.customer_details?.email || s.customer_email || '',
  name: s.customer_details?.name || '', phone: s.customer_details?.phone || '',
  address: s.collected_information?.shipping_details?.address || s.shipping_details?.address || s.customer_details?.address || null,
  delivery: s.metadata?.delivery || 'home', pickup: s.metadata?.pickup_address || '',
  status: orderStatus(s), supplierOrderedAt: s.metadata?.supplier_ordered_at || '',
  trackingNumber: s.metadata?.tracking_number || '', carrier: s.metadata?.tracking_carrier || 'colissimo',
  note: s.metadata?.fulfillment_note || '', merchantNotified: Boolean(s.metadata?.merchant_notified_at),
  customerNotified: Boolean(s.metadata?.customer_notified_at),
  shippingNotified: Boolean(s.metadata?.shipping_notified_at),
  articles: Object.entries(s.metadata || {}).filter(([k]) => /^item_\d+$/.test(k)).map(([, v]) => String(v)),
});
const ownedOrder = async (id: string) => {
  if (!validId(id)) throw new Error('Identifiant invalide.');
  const s = await stripeRequest('checkout/sessions/' + id);
  if (s.metadata?.store !== 'lmd' || s.payment_status !== 'paid') throw new Error('Commande introuvable ou non payée.');
  return s;
};
const update = (id: string, fields: Record<string, string>) => {
  const data = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) data.set('metadata[' + key + ']', value);
  return stripeRequest('checkout/sessions/' + id, data);
};

managementRouter.post('/gestion/test-email', async (_req, res) => {
  try {
    const { testMerchantNotification } = await import('./management-mail');
    const ok = await testMerchantNotification();
    if (!ok) { res.status(503).json({ error: 'Échec du test. Vérifiez votre adresse de réception et la validation du domaine e-mail.' }); return; }
    res.json({ sent: true });
  } catch { res.status(503).json({ error: 'Service e-mail indisponible.' }); }
});

managementRouter.get('/gestion/orders', async (_req, res) => {
  try {
    // Consults Stripe directly: no false "orders" generated from a browser visit.
    const result = await stripeRequest('checkout/sessions?limit=100');
    const orders = (result.data || []).filter((s: any) => s.metadata?.store === 'lmd' && s.payment_status === 'paid').map(toOrder);
    res.json({ orders, hasMore: Boolean(result.has_more), retrievedAt: new Date().toISOString() });
  } catch { res.status(503).json({ error: 'Stripe indisponible. Impossible de consulter les commandes.' }); }
});
managementRouter.post('/gestion/orders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (typeof id !== 'string') { res.sendStatus(400); return; }
    const s = await ownedOrder(id);
    const action = clean(req.body?.action, 40);
    let updated: any;
    if (action === 'supplier') {
      updated = await update(id, { supplier_ordered_at: s.metadata?.supplier_ordered_at || new Date().toISOString() });
    } else if (action === 'note') {
      updated = await update(id, { fulfillment_note: clean(req.body?.note, 200) });
    } else if (action === 'tracking') {
      const number = clean(req.body?.number, 35).toUpperCase();
      const carrier = clean(req.body?.carrier, 20);
      if (!/^[A-Z0-9]{8,30}$/.test(number) || !['colissimo', 'chronopost'].includes(carrier)) {
        res.status(400).json({ error: 'Numéro ou transporteur incorrect.' }); return;
      }
      updated = await update(id, { tracking_number: number, tracking_carrier: carrier, shipped_at: new Date().toISOString() });
      // Save shipment first; failure of an optional email must never erase tracking.
      try { const { notifyCustomerShipping } = await import('./management-mail');
        if (await notifyCustomerShipping(updated)) updated = await ownedOrder(id);
      } catch { /* Retry notification from the management dashboard. */ }
    } else if (action === 'notify_customer') {
      const { notifyCustomerShipping } = await import('./management-mail');
      const ok = await notifyCustomerShipping(s);
      if (!ok) { res.status(503).json({ error: 'Notification non envoyée. Vérifiez les paramètres du service e-mail et le suivi.' }); return; }
      updated = await ownedOrder(id);
    } else if (action === 'notify_paid') {
      if (!process.env.RESEND_API_KEY || !process.env.MAIL_FROM || !process.env.MERCHANT_NOTIFY_EMAIL) {
        res.status(503).json({ error: 'Configurez le service e-mail avant de relancer la confirmation.' }); return;
      }
      const { notifyPaidCheckout } = await import('./management-mail');
      await notifyPaidCheckout(s);
      updated = await ownedOrder(id);
    } else { res.sendStatus(400); return; }
    res.json({ order: toOrder(updated) });
  } catch { res.status(503).json({ error: 'Action indisponible. Aucun nouvel ordre fournisseur n’a été déclenché.' }); }
});
