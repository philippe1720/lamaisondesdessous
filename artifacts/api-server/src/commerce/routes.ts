import { Router } from 'express';
import { randomUUID, randomBytes } from 'node:crypto';
import { liveCatalog, snapshot, type Product } from './catalog';
import { validateLines } from './core';
import { relayPoints } from './options';
import { offerRouter, currentUpsell, acceptedOffer } from './offer';


import { pickupAvailable, searchRelays } from './relay';

import { paymentConfiguration, stripeSecretKey } from './payment-config';

export const commerceRouter = Router();
commerceRouter.use(offerRouter);
const enabled = () => paymentConfiguration().checkoutEnabled;
commerceRouter.get('/commerce/config', async (_req, res) => {
  res.set('Cache-Control','no-store');
  const {paymentMode}=paymentConfiguration();
  let upsell = null;
  try { upsell=await currentUpsell(); } catch { /* Optional offer is omitted when not verifiable. */ }
  const points=pickupAvailable()?relayPoints():[];
  res.json({ checkoutEnabled: enabled(), paymentMode, pickupEnabled: pickupAvailable(), points, welcomeCode: process.env.STRIPE_WELCOME_CODE || null, upsell });
});
commerceRouter.get('/pickup-points',async(req,res)=>{
  res.set('Cache-Control','no-store');
  if(!pickupAvailable()){res.status(503).json({error:'La recherche de relais est momentanément indisponible. La livraison à domicile reste offerte.'});return;}
  const postcode=String(req.query.postcode || ''),city=String(req.query.city || '');
  if(!/^\d{5}$/.test(postcode) || /^(97|98)/.test(postcode) || city.length>100){res.status(400).json({error:'Saisissez un code postal de France métropolitaine.'});return;}
  try{res.json({points:await searchRelays(postcode,city)});}catch{res.status(503).json({error:'Impossible de rechercher les relais. Réessayez ou choisissez la livraison à domicile offerte.'});}
});
commerceRouter.get('/catalog', async (_req, res) => {
  try {
    if (process.env.BUSYX_FEED_URL) { const {products,updatedAt}=await liveCatalog(); res.json({products,updatedAt,live:true}); }
    else res.json({...await snapshot(),live:false});
  } catch { res.status(503).json({error:'Disponibilités momentanément indisponibles.'}); }
});

// Stripe stores the chosen EAN/size in line-item metadata; orders are fulfilled manually initially.
commerceRouter.post('/checkout', async (req, res) => {
  if (!enabled()) { res.status(503).json({error:'Le paiement est en cours de configuration.'}); return; }
  const origin = process.env.SITE_URL!.trim().replace(/\/+$/, '');
  if (req.headers.origin && req.headers.origin !== new URL(origin).origin) { res.status(403).json({error:'Origine non autorisée.'}); return; }
  let lines: ReturnType<typeof validateLines>;
  try { lines = validateLines(req.body?.lines); }
  catch { res.status(400).json({error:'Panier invalide.'}); return; }
  const delivery=req.body.delivery;
  let point;
  if(delivery==='pickup' && !pickupAvailable()) {res.status(409).json({code:'pickup_unavailable',error:'La livraison en relais n’est pas proposée pour le moment. Choisissez la livraison à domicile offerte.'});return;}
  if(delivery==='pickup') {
    try{point=(await searchRelays(String(req.body.pickupPostcode || ''),String(req.body.pickupCity || ''))).find(p=>p.id===req.body.pickup);}catch{res.status(503).json({error:'Impossible de vérifier ce relais. Relancez la recherche ou choisissez la livraison à domicile.'});return;}
  }
  if (!['home','pickup'].includes(delivery) || (delivery==='pickup' && !point)) { res.status(400).json({error:'Choisissez un mode de livraison et un point de retrait valide.'}); return; }
  let stage: 'stock' | 'payment' = 'stock';
  try {
    const {products,rows} = await liveCatalog();
    const chosen: {product:Product; variant:Product['variants'][number]; quantity:number}[] = [];
    for(const line of lines) {
      const product=products.find(p=>p.variants.some(v=>v.ean===line.ean));
      const variant=product?.variants.find(v=>v.ean===line.ean);
      if(!product || !variant || variant.stock<line.quantity) {res.status(409).json({code:'stock_changed',error:'Une taille n’est plus disponible dans la quantité demandée. Revenez au panier et actualisez la page.'});return;}
      chosen.push({product,variant,quantity:line.quantity});
    }
    if(req.body.upsell) {
      const offer=await currentUpsell(rows);
      if(!offer || offer.ean!==req.body.upsell || !acceptedOffer(req,offer.ean,offer.priceCents) || lines.some(l=>l.ean===offer.ean)) {res.status(409).json({code:'offer_expired',error:'Veuillez confirmer à nouveau l’ajout de la bougie, ou la retirer pour continuer.'});return;}
      chosen.push({product:{id:offer.supplierId,slug:'',name:offer.name,description:offer.description,composition:'',category:'complement',brand:'',images:[offer.image],variants:[]},variant:{ean:offer.ean,size:'',color:'',stock:offer.stock,priceCents:offer.priceCents},quantity:1});
    }
    const shipping=0;
    const total=chosen.reduce((s,l)=>s+l.variant.priceCents*l.quantity,0)+shipping;
    if(req.body.expectedTotal!==total) {res.status(409).json({code:'price_changed',error:'Un prix a changé. Vérifiez le total actualisé avant de continuer.'});return;}
    const access=randomBytes(32).toString('hex');
    const params=new URLSearchParams({mode:'payment',success_url:`${origin}/commande/confirmation?session_id={CHECKOUT_SESSION_ID}#access=${access}`,cancel_url:`${origin}/panier`,locale:'fr',customer_creation:'always','shipping_address_collection[allowed_countries][0]':'FR','phone_number_collection[enabled]':'true','metadata[delivery]':'colissimo_home','payment_intent_data[metadata][delivery]':'colissimo_home','shipping_options[0][shipping_rate_data][type]':'fixed_amount','shipping_options[0][shipping_rate_data][fixed_amount][amount]':'0','shipping_options[0][shipping_rate_data][fixed_amount][currency]':'eur','shipping_options[0][shipping_rate_data][display_name]':'Colissimo domicile offert'});
    params.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]',String(shipping));
    params.set('shipping_options[0][shipping_rate_data][display_name]',delivery==='home'?'Colissimo domicile offert':'Colissimo Pickup offert');
    params.set('metadata[delivery]',delivery);
    params.set('metadata[store]','lmd');
    params.set('metadata[order_access]',access);
    params.set('custom_text[after_submit][message]','Conservez votre lien de confirmation pour retrouver votre récapitulatif et le suivi de votre colis.');
    params.set('payment_intent_data[metadata][delivery]',delivery);
    if(point) {
      params.set('metadata[pickup_id]',point.id);
      params.set('metadata[pickup_address]',`${point.name}, ${point.address}, ${point.postcode} ${point.city}`.slice(0,500));
      params.set('payment_intent_data[metadata][pickup_id]',point.id);
    }
    if(process.env.STRIPE_WELCOME_CODE) params.set('allow_promotion_codes','true');
    for(const [i,{product,variant,quantity}] of chosen.entries()) {
      const prefix=`line_items[${i}]`;
      params.set(`${prefix}[quantity]`,String(quantity));
      params.set(`${prefix}[price_data][currency]`,'eur');
      params.set(`${prefix}[price_data][unit_amount]`,String(variant.priceCents));
      params.set(`${prefix}[price_data][product_data][name]`,[product.name,[variant.size,variant.color].filter(Boolean).join(' ')].filter(Boolean).join(' — '));
      params.set(`${prefix}[price_data][product_data][metadata][ean]`,variant.ean);
      params.set(`${prefix}[price_data][product_data][metadata][supplier_id]`,product.id);
      params.set(`metadata[item_${i}]`,`${variant.ean}:${quantity}`);
    }
    stage = 'payment';
    const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${stripeSecretKey()}`,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':randomUUID()},body:params,signal:AbortSignal.timeout(20000)});
    const session=await response.json() as {url?:string;id?:string;error?:{code?:string;type?:string}};
    if(!response.ok) {
      // Keep raw Stripe messages (which can contain credentials) out of logs and responses.
      const safeCode=(value:unknown)=>typeof value==='string' && /^[a-z_]{1,80}$/.test(value)?value:undefined;
      console.error('Stripe checkout rejected', {status:response.status,code:safeCode(session.error?.code),type:safeCode(session.error?.type),requestId:response.headers.get('request-id')});
      res.status(503).json({error:'Le service de paiement est momentanément indisponible. Votre panier est conservé et aucun paiement n’a été effectué.'});return;
    }
    if(!session.url?.startsWith('https://checkout.stripe.com/')) throw new Error('Stripe unavailable');
    res.json({url:session.url,sessionId:session.id});
  } catch { res.status(503).json({error:stage==='stock'?'Nous ne pouvons pas vérifier les disponibilités pour le moment. Votre panier est conservé. Réessayez dans quelques instants.':'Impossible d’ouvrir le paiement Stripe pour le moment. Votre panier est conservé et aucun paiement n’a été effectué.'}); }
});
