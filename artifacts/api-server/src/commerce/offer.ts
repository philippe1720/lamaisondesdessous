import { Router, type Request, type Response } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { validateLines } from './core';
import { snapshot, supplierRows } from './catalog';
import { upsellProduct } from './options';

const COOKIE = 'lmd-candle-offer';
const DAY = 24 * 60 * 60 * 1000;
type OfferState = { ean:string; price:number; deadline:number; until:number; accepted:boolean };
const secret = () => process.env.SESSION_SECRET || '';
const signature = (value:string) => createHmac('sha256',secret()).update(value).digest('hex');
export function readOffer(req:Request, now=Date.now()):OfferState|null {
  if(!secret()) return null;
  const value=(req.headers.cookie || '').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
  if(!value || value.length>1500)return null;
  const [payload,mac]=value.split('.');
  if(!payload || !/^[a-f0-9]{64}$/.test(mac || '') || !timingSafeEqual(Buffer.from(mac),Buffer.from(signature(payload))))return null;
  try {
    const state=JSON.parse(Buffer.from(payload,'base64url').toString()) as OfferState;
    return /^\d{13}$/.test(state.ean) && Number.isSafeInteger(state.price) && state.price>0 && Number.isSafeInteger(state.deadline) && Number.isSafeInteger(state.until) && state.until>now && typeof state.accepted==='boolean'?state:null;
  } catch { return null; }
}
function writeOffer(res:Response,state:OfferState) {
  const payload=Buffer.from(JSON.stringify(state)).toString('base64url');
  res.cookie(COOKIE,payload+'.'+signature(payload),{httpOnly:true,secure:process.env.SITE_URL?.startsWith('https://'),sameSite:'strict',path:'/api',maxAge:Math.max(0,state.until-Date.now())});
}
export async function currentUpsell(rows?:Record<string,string>[]) {
  const separate=process.env.BUSYX_UPSELL_FEED_URL;
  return upsellProduct(separate?await supplierRows(separate):rows || await supplierRows());
}
export function acceptedOffer(req:Request,ean:string,price:number) {
  const state=readOffer(req);
  return Boolean(state?.accepted && state.ean===ean && state.price===price);
}
export const offerRouter=Router();
offerRouter.post('/commerce/offer',async(req,res)=>{
  res.set('Cache-Control','no-store');
  try {
    if(req.headers.origin && req.headers.origin!==new URL(process.env.SITE_URL || '').origin){res.sendStatus(403);return;}
    const lines=validateLines(req.body?.lines);
    const catalog=await snapshot();
    if(!lines.every(l=>catalog.products.some(p=>p.variants.some(v=>v.ean===l.ean)))){res.status(400).json({error:'Ajoutez une paire de bas au panier pour profiter de cette offre.'});return;}
  } catch {res.status(400).json({error:'Panier invalide.'});return;}
  if(!secret()){res.json({offer:null});return;}
  try {
    const offer=await currentUpsell();
    if(!offer){res.json({offer:null});return;}
    const now=Date.now();
    let state=readOffer(req,now);
    // A reload never restarts an existing offer. The signed cookie lives for 24 hours.
    if(!state) state={ean:offer.ean,price:offer.priceCents,deadline:now+120000,until:now+DAY,accepted:false};
    if(req.body.accept===true){
      if(state.ean!==offer.ean || state.price!==offer.priceCents || (!state.accepted && now>=state.deadline)){
        res.status(409).json({error:'Cette offre a expiré. Vous pouvez continuer votre commande sans la bougie.'});return;
      }
      state={...state,accepted:true};
    }
    writeOffer(res,state);
    res.json({offer:{ean:offer.ean,name:offer.name,description:offer.description,image:offer.image,priceCents:offer.priceCents},expiresAt:state.deadline,serverNow:now,accepted:state.accepted});
  } catch {res.json({offer:null});}
});
