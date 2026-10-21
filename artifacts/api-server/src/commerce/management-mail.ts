import { stripeRequest } from './orders';

const validEmail = (s: unknown): s is string => typeof s === 'string' && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const mailConfig = () => ({
  key: process.env.RESEND_API_KEY || '',
  from: process.env.MAIL_FROM || '',
  owner: process.env.MERCHANT_NOTIFY_EMAIL || '',
});
const updateMarker = (id: string, field: string) =>
  stripeRequest('checkout/sessions/' + id,
    new URLSearchParams({ ['metadata[' + field + ']']: new Date().toISOString() }));
async function send(to: string, subject: string, text: string) {
  const config = mailConfig();
  if (!config.key || !validEmail(config.from) || !validEmail(to)) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + config.key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: config.from, to: [to], subject, text }),
    signal: AbortSignal.timeout(12000),
    redirect: 'error'
  });
  return response.ok;
}
const customerLink = (s: any) => {
  const site = process.env.SITE_URL || 'https://lamaisondesdessous.fr';
  const access = s.metadata?.order_access;
  return /^https:\/\//.test(site) && /^[a-f0-9]{64}$/.test(access || '')
    ? site.replace(/\/$/, '') + '/commande/confirmation?session_id=' + encodeURIComponent(s.id) + '#access=' + access
    : '';
};
const orderRef = (s: any) => String(s.id || '').slice(-12).toUpperCase();

export async function notifyPaidCheckout(s: any) {
  if (s?.metadata?.store !== 'lmd' || s.payment_status !== 'paid' || !s.livemode) return;
  const config = mailConfig();
  if (!config.key || !validEmail(config.from)) return;
  const items = Object.entries(s.metadata || {}).filter(([k]) => /^item_\d+$/.test(k)).map(([, value]) => String(value)).join(', ');
  const amount = ((s.amount_total || 0) / 100).toFixed(2).replace('.', ',');
  if (validEmail(config.owner) && !s.metadata?.merchant_notified_at) {
    if (await send(config.owner, 'La Maison des Dessous — nouvelle commande ' + orderRef(s),
      'Une commande PAYÉE vient d’être enregistrée.\nRéférence Stripe : ' + s.id + '\nMontant : ' + amount + ' €\nArticles (EAN:quantité) : ' + items + '\nOuvrez votre Centre de pilotage pour préparer et expédier la commande.')) {
      await updateMarker(s.id, 'merchant_notified_at');
    }
  }
  const customer = s.customer_details?.email || s.customer_email;
  if (validEmail(customer) && !s.metadata?.customer_notified_at) {
    const link = customerLink(s);
    if (await send(customer, 'La Maison des Dessous — votre commande est confirmée',
      'Bonjour,\n\nVotre paiement a été confirmé. Nous préparons votre commande.\nRéférence : ' + s.id +
      '\nMontant : ' + amount + ' €\n\n' +
      (link ? 'Votre confirmation et suivi privé :\n' + link + '\n\n' : '') +
      'Vous recevrez des informations sur l’expédition lorsque votre colis sera pris en charge.\n\nLa Maison des Dessous')) {
      await updateMarker(s.id, 'customer_notified_at');
    }
  }
}
export async function notifyCustomerShipping(s: any) {
  if (s?.metadata?.store !== 'lmd' || s.payment_status !== 'paid') return false;
  const customer = s.customer_details?.email || s.customer_email;
  const number = s.metadata?.tracking_number;
  const carrier = s.metadata?.tracking_carrier;
  if (!s.livemode || !validEmail(customer) || !/^[A-Za-z0-9]{8,30}$/.test(number || '') ||
      !['colissimo', 'chronopost'].includes(carrier)) return false;
  if (s.metadata?.shipping_notified_at) return true;
  const url = carrier === 'chronopost'
    ? 'https://www.chronopost.fr/fr/chrono_suivi_search?listeNumerosLT=' + number
    : 'https://www.laposte.fr/outils/suivre-vos-envois?code=' + number;
  const link = customerLink(s);
  const ok = await send(customer, 'La Maison des Dessous — votre commande a été expédiée',
    'Bonjour,\n\nVotre commande ' + orderRef(s) + ' est en chemin.\nTransporteur : ' +
    (carrier === 'colissimo' ? 'Colissimo' : 'Chronopost') + '\nNuméro de suivi : ' +
    number + '\nSuivre votre colis : ' + url + (link ? '\nVotre espace de suivi privé : ' + link : '') +
    '\n\nMerci pour votre confiance.\nLa Maison des Dessous');
  if (ok) await updateMarker(s.id, 'shipping_notified_at');
  return ok;
}

export async function testMerchantNotification() {
  const config=mailConfig();
  return validEmail(config.owner) && await send(config.owner,
    'La Maison des Dessous — test du centre de pilotage',
    'Votre notification de commande est configurée. Ce message est un test : aucune commande n’a été créée.');
}
