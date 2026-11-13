// This flag exists only in the merchant's current tab. Test checkout API additionally
// requires the server-side owner login and a dedicated sk_test_ Stripe key.
export const sandboxActive = () => {
  try { return sessionStorage.getItem('lmd-sandbox-mode') === 'active'; }
  catch { return false; }
};
export function exitSandbox() {
  try {
    sessionStorage.removeItem('lmd-sandbox-mode');
    sessionStorage.removeItem('lmd-upsell');
  } catch { /* No session storage. */ }
  window.location.assign('/gestion');
}
