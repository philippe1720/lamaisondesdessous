import { Router, type Request, type Response } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
const validId = (id:unknown):id is string => typeof id==='string' && /^cs_(test_|live_)?[a-zA-Z0-9_]{10,250}$/.test(id);
const same=(a:string,b:string)=>a.length===b.length && timingSafeEqual(Buffer.from(a),Buffer.from(b));
export async function stripeRequest(path:string, body?:URLSearchParams, idempotency?:string):Promise<any> {
  if(!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe non configuré');
  const response=await fetch('https://api.stripe.com/v1/'+path,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`,...(body?{'Content-Type':'application/x-www-form-urlencoded'}:{}),...(idempotency?{'Idempotency-Key':idempotency}:{})},body,signal:AbortSignal.timeout(15000)});
  if(!response.ok) throw new Error('Stripe indisponible');
  return response.json();
}
export function verifyStripeSignature(body:Buffer, header:string, secret:string, now=Date.now()) {
  const parts=header.split(',').map(p=>p.trim().split('='));
  const timestamp=parts.find(p=>p[0]==='t')?.[1];
  if(!timestamp || !/^\d+$/.test(timestamp) || Math.abs(now/1000-Number(timestamp))>300) return false;
  const expected=createHmac('sha256',secret).update(timestamp+'.').update(body).digest('hex');
  return parts.some(([k,v])=>k==='v1' && /^[a-f0-9]{64}$/.test(v || '') && same(v,expected));
}
export async function stripeWebhook(req:Request,res:Response) {
  const secret=process.env.STRIPE_WEBHOOK_SECRET;
  if(!secret || !process.env.STRIPE_SECRET_KEY){res.sendStatus(503);return;}
  if(!Buffer.isBuffer(req.body) || !verifyStripeSignature(req.body,req.get('stripe-signature') || '',secret)){res.sendStatus(400);return;}
  let event:any;try{event=JSON.parse(req.body.toString('utf8'));}catch{res.sendStatus(400);return;}
  if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)){res.sendStatus(200);return;}
  const id=event.data?.object?.id;if(!validId(id)){res.sendStatus(400);return;}
  try {
    const session=await stripeRequest(`checkout/sessions/${id}`);
    if(session.metadata?.store==='lmd' && session.mode==='payment' && session.payment_status==='paid' && session.metadata?.payment_verified!=='true') {
      // Stripe is the durable order ledger. Repeated events only write the same flag;
      // they never trigger a second shipment or supplier purchase.
      await stripeRequest(`checkout/sessions/${id}`,new URLSearchParams({'metadata[payment_verified]':'true'}),`lmd-confirm-${id}`);
    }
    res.sendStatus(200);
  } catch {res.sendStatus(503);}
}
export const orderRouter=Router();
orderRouter.post('/order',async(req,res)=>{
  res.set({'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});
  const {sessionId,access}=req.body || {};
  if(!validId(sessionId) || typeof access!=='string' || !/^[a-f0-9]{64}$/.test(access)){res.status(400).json({error:'Lien de commande incomplet.'});return;}
  try {
    const s=await stripeRequest(`checkout/sessions/${sessionId}?expand[]=payment_intent.latest_charge`);
    if(s.metadata?.store!=='lmd' || !same(s.metadata?.order_access || '',access)){res.status(404).json({error:'Commande introuvable.'});return;}
    const items=await stripeRequest(`checkout/sessions/${sessionId}/line_items?limit=100&expand[]=data.price.product`);
    const charge=s.payment_intent?.latest_charge;
    const refunded=typeof charge==='object'?Number(charge?.amount_refunded)||0:0;
    const paid=s.payment_status==='paid';
    const trackingNumber=s.payment_intent?.metadata?.tracking_number || s.metadata?.tracking_number || '';
    const carrier=s.payment_intent?.metadata?.tracking_carrier || s.metadata?.tracking_carrier || 'colissimo';
    const tracking=paid && !charge?.refunded && /^[a-zA-Z0-9]{8,30}$/.test(trackingNumber) && ['colissimo','chronopost'].includes(carrier) ? {number:trackingNumber,carrier,url:carrier==='chronopost'?`https://www.chronopost.fr/fr/chrono_suivi_search?listeNumerosLT=${trackingNumber}`:`https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`}:null;
    const shipping=s.collected_information?.shipping_details || s.shipping_details || s.customer_details;
    res.json({id:s.id,paid,test:!s.livemode,status:charge?.refunded?'refunded':paid?(tracking?'shipped':'paid'):s.status==='expired'?'expired':'pending',amount:s.amount_total,currency:s.currency,refunded,delivery:s.metadata.delivery,pickup:s.metadata.pickup_address || null,shipping,tracking,items:items.data.map((i:any)=>({name:i.description,quantity:i.quantity,total:i.amount_total,ean:i.price?.product?.metadata?.ean || ''}))});
  } catch {res.status(503).json({error:'La vérification est momentanément indisponible. Réessayez sans repasser commande.'});}
});
