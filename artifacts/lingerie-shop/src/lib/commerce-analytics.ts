/**
 * GA4 ecommerce events for actual shopper actions.
 * Never send sandbox purchases; purchase is emitted only after the order API
 * confirms a paid live Stripe Checkout session.
 * Client-side tracking is best effort and does not replace Stripe reconciliation.
 */
export type CommerceItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

type CommerceEvent = 'add_to_cart' | 'begin_checkout' | 'purchase';
type GtagWindow = Window & {
  gtag?: (command: 'event', name: CommerceEvent, params: Record<string, unknown>) => void;
};

function sandboxActive(): boolean {
  try { return sessionStorage.getItem('lmd-sandbox-mode') === 'active'; }
  catch { return true; } // Conservative: don't count unverified sessions.
}

function send(name: CommerceEvent, params: Record<string, unknown>): boolean {
  if (sandboxActive()) return false;
  const gtag = (window as GtagWindow).gtag;
  if (typeof gtag !== 'function') return false;
  try { gtag('event', name, params); return true; }
  catch { return false; }
}

export function commerceItem(ean: string, name: string, priceCents: number, quantity: number): CommerceItem {
  return { item_id: ean, item_name: name, price: priceCents / 100, quantity };
}

export function trackAddToCart(item: CommerceItem): boolean {
  if (!item.item_id || item.quantity <= 0 || !Number.isFinite(item.price)) return false;
  return send('add_to_cart', {
    currency: 'EUR',
    value: Number((item.price * item.quantity).toFixed(2)),
    items: [item],
  });
}

export function trackBeginCheckout(items: CommerceItem[], totalCents: number): boolean {
  if (!items.length || !Number.isFinite(totalCents) || totalCents < 0) return false;
  // Re-entering checkout or switching from offer to delivery is not a new checkout.
  const signature = JSON.stringify(items.map(i => [i.item_id, i.quantity]).sort((a,b) => String(a[0]).localeCompare(String(b[0]))));
  const key = 'lmd-ga4-begin-checkout-v1';
  try {
    if (sessionStorage.getItem(key) === signature) return false;
    if (!send('begin_checkout', { currency: 'EUR', value: totalCents / 100, items })) return false;
    sessionStorage.setItem(key, signature);
    return true;
  } catch { return false; }
}

export type ConfirmedOrder = {
  id: string;
  paid: boolean;
  test: boolean;
  status: string;
  amount: number;
  items: { ean: string; name: string; quantity: number; total: number }[];
};

export function trackPurchase(order: ConfirmedOrder): boolean {
  if (!order.paid || order.test || !order.id.startsWith('cs_live_')) return false;
  if (!['paid', 'shipped'].includes(order.status)) return false;
  if (!Number.isFinite(order.amount) || order.amount < 0 || !order.items.length) return false;
  const key = 'lmd-ga4-purchase:' + order.id;
  try {
    if (localStorage.getItem(key)) return false;
    const items = order.items
      .filter(i => i.quantity > 0 && Number.isFinite(i.total))
      .map(i => commerceItem(i.ean, i.name, i.total / i.quantity, i.quantity));
    if (!items.length) return false;
    if (!send('purchase', {
      transaction_id: order.id,
      currency: 'EUR',
      value: order.amount / 100,
      items,
    })) return false;
    localStorage.setItem(key, '1');
    return true;
  } catch { return false; }
}
