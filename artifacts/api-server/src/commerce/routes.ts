import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { liveCatalog, snapshot, type Product } from './catalog';
import { validateLines } from './core';
import { relayPoints, upsellProduct } from './options';
import { supplierRows } from './catalog';

export const commerceRouter = Router();
const enabled = () => process.env.CHECKOUT_ENABLED === 'true' && Boolean(process.env.STRIPE_SECRET_KEY && process.env.BUSYX_FEED_URL && process.env.SITE_URL);
commerceRouter.get('/commerce/config', async (_req, res) => {
  let upsell = null;
  try { if(process.env.BUSYX_FEED_URL) upsell=upsellProduct(await supplierRows()); } catch { /* Optional offer is omitted when not verifiable. */ }
  const points=relayPoints();
  res.json({ checkoutEnabled: enabled(), pickupEnabled: points.length>0, points, welcomeCode: process.env.STRIPE_WELCOME_CODE || null, upsell });
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
  const origin = process.env.SITE_URL!;
  if (req.headers.origin && req.headers.origin !== new URL(origin).origin) { res.status(403).json({error:'Origine non autorisée.'}); return; }
  let lines: ReturnType<typeof validateLines>;
  try { lines = validateLines(req.body?.lines); }
  catch { res.status(400).json({error:'Panier invalide.'}); return; }
  const delivery=req.body.delivery;
  const point=delivery==='pickup'?relayPoints().find(p=>p.id===req.body.pickup):undefined;
  if (!['home','pickup'].includes(delivery) || (delivery==='pickup' && !point)) { res.status(400).json({error:'Choisissez un mode de livraison et un point de retrait valide.'}); return; }
  try {
    const {products,rows} = await liveCatalog();
    const chosen: {product:Product; variant:Product['variants'][number]; quantity:number}[] = [];
    for(const line of lines) {
      const product=products.find(p=>p.variants.some(v=>v.ean===line.ean));
      const variant=product?.variants.find(v=>v.ean===line.ean);
      if(!product || !variant || variant.stock<line.quantity) {res.status(409).json({error:'Une taille n’est plus disponible dans la quantité demandée. Revenez au panier et actualisez la page.'});return;}
      chosen.push({product,variant,quantity:line.quantity});
    }
    if(req.body.upsell) {
      const offer=upsellProduct(rows);
      if(!offer || offer.ean!==req.body.upsell || lines.some(l=>l.ean===offer.ean)) {res.status(409).json({error:'L’offre complémentaire n’est plus disponible. Continuez sans cet article.'});return;}
      chosen.push({product:{id:offer.supplierId,slug:'',name:offer.name,description:offer.description,composition:'',category:'complement',brand:'',images:[offer.image],variants:[]},variant:{ean:offer.ean,size:'',color:'',stock:offer.stock,priceCents:offer.priceCents},quantity:1});
    }
    const shipping=delivery==='home'?258:0;
    const total=chosen.reduce((s,l)=>s+l.variant.priceCents*l.quantity,0)+shipping;
    if(req.body.expectedTotal!==total) {res.status(409).json({error:'Un prix a changé. Revenez au panier et actualisez la page avant de continuer.'});return;}
    const params=new URLSearchParams({mode:'payment',success_url:`${origin}/commande/confirmation`,cancel_url:`${origin}/panier`,locale:'fr',customer_creation:'always','shipping_address_collection[allowed_countries][0]':'FR','phone_number_collection[enabled]':'true','metadata[delivery]':'colissimo_home','payment_intent_data[metadata][delivery]':'colissimo_home','shipping_options[0][shipping_rate_data][type]':'fixed_amount','shipping_options[0][shipping_rate_data][fixed_amount][amount]':'258','shipping_options[0][shipping_rate_data][fixed_amount][currency]':'eur','shipping_options[0][shipping_rate_data][display_name]':'Colissimo domicile — supplément'});
    params.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]',String(shipping));
    params.set('shipping_options[0][shipping_rate_data][display_name]',delivery==='home'?'Colissimo domicile — supplément':'Colissimo Pickup offert');
    params.set('metadata[delivery]',delivery);
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
      params.set(`${prefix}[price_data][product_data][name]`,`${product.name} — ${variant.size} ${variant.color}`);
      params.set(`${prefix}[price_data][product_data][metadata][ean]`,variant.ean);
      params.set(`${prefix}[price_data][product_data][metadata][supplier_id]`,product.id);
      params.set(`metadata[item_${i}]`,`${variant.ean}:${quantity}`);
    }
    const response=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':randomUUID()},body:params,signal:AbortSignal.timeout(20000)});
    const session=await response.json() as {url?:string};
    if(!response.ok || !session.url?.startsWith('https://checkout.stripe.com/')) throw new Error('Stripe unavailable');
    res.json({url:session.url});
  } catch { res.status(503).json({error:'Nous ne pouvons pas vérifier le stock ou ouvrir le paiement pour le moment. Réessayez dans quelques instants.'}); }
});
