// Never return or log the key itself. A recognized format is not proof of account activation.
export const stripeSecretKey = () => (process.env.STRIPE_SECRET_KEY || '').trim();
export function paymentConfiguration() {
  const key = stripeSecretKey();
  const match = /^(sk|rk)_(live|test)_[A-Za-z0-9]+$/.exec(key);
  const paymentMode = (match?.[2] as 'live' | 'test' | undefined) || null;
  let siteValid = false;
  try { siteValid = ['https:', 'http:'].includes(new URL(process.env.SITE_URL || '').protocol); } catch { /* Incomplete deployment configuration. */ }
  const checkoutEnabled = process.env.CHECKOUT_ENABLED === 'true' && Boolean(paymentMode && process.env.BUSYX_FEED_URL && siteValid);
  return { paymentMode, checkoutEnabled };
}
