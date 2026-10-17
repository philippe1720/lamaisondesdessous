import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {once} from 'node:events';
import express from 'express';
import {commerceRouter} from './routes';
import {snapshot} from './catalog';
import {priceCents} from './core';

test('Candle offer: verified stock, fixed price, persistent deadline, signed acceptance and optional checkout',async()=>{
 const old={...process.env};const nativeFetch=globalThis.fetch;let candleStock=4;let stripe:URLSearchParams|undefined;
 const base=await snapshot(),p=base.products[0],v=p.variants[0];
 Object.assign(process.env,{SESSION_SECRET:'offer-test-secret',CHECKOUT_ENABLED:'true',SITE_URL:'https://shop.example',STRIPE_SECRET_KEY:'sk_test_fixture',BUSYX_FEED_URL:'https://www.busyx.com/csv_generator.php?token=fixture',UPSELL_EAN:'3479228260621'});
 delete process.env.BUSYX_UPSELL_FEED_URL;
 globalThis.fetch=async(input:any,init:any)=>{
  if(String(input).startsWith('https://www.busyx.com/'))return new Response(`ID du produit;EAN13;Prix unitaire HT;Stock;Libel;URL image\n${p.id};${v.ean};8,90;5;Bas;https://www.busyx.com/bas.jpg\ncandle;3479228260621;2,50;${candleStock};Bougie vanille;https://www.busyx.com/candle.jpg\n`);
  if(String(input).startsWith('https://api.stripe.com/')){stripe=new URLSearchParams(init.body);return Response.json({id:'cs_test_fixture',url:'https://checkout.stripe.com/c/pay/cs_test_fixture'});}
  return nativeFetch(input,init);
 };
 const server=express().use(express.json()).use('/api',commerceRouter).listen(0);await once(server,'listening');
 const root=`http://localhost:${(server.address() as any).port}/api`;
 const lines=[{ean:v.ean,quantity:1}];
 const post=(path:string,body:any,cookie='')=>nativeFetch(root+path,{method:'POST',headers:{'Content-Type':'application/json',cookie},body:JSON.stringify(body)});
 const signed=(state:any)=>{const payload=Buffer.from(JSON.stringify(state)).toString('base64url');return 'lmd-candle-offer='+payload+'.'+createHmac('sha256','offer-test-secret').update(payload).digest('hex');};
 try {
  const start=await post('/commerce/offer',{lines});const offer=await start.json() as any;const cookie=start.headers.get('set-cookie')!.split(';')[0];
  assert.equal(offer.offer.priceCents,490);assert.equal(offer.expiresAt-offer.serverNow,120000);assert.equal(offer.accepted,false);
  const reload=await (await post('/commerce/offer',{lines},cookie)).json() as any;assert.equal(reload.expiresAt,offer.expiresAt);
  const expired=signed({ean:'3479228260621',price:490,deadline:Date.now()-1,until:Date.now()+100000,accepted:false});
  assert.equal((await post('/commerce/offer',{lines,accept:true},expired)).status,409);
  const expiredReload=await (await post('/commerce/offer',{lines},expired)).json() as any;assert.ok(expiredReload.expiresAt<expiredReload.serverNow);
  const checkout={lines,delivery:'home',upsell:'3479228260621',expectedTotal:priceCents(890)+490};
  assert.equal((await post('/checkout',checkout)).status,409);
  const accept=await post('/commerce/offer',{lines,accept:true},cookie);assert.equal(accept.status,200);assert.equal(((await accept.json()) as any).accepted,true);
  const accepted=accept.headers.get('set-cookie')!.split(';')[0];
  assert.equal((await post('/checkout',checkout,accepted)).status,200);
  assert.equal(stripe!.get('line_items[1][price_data][unit_amount]'),'490');assert.equal(stripe!.get('line_items[1][quantity]'),'1');assert.equal(stripe!.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'),'0');
  const lateAccepted=signed({ean:'3479228260621',price:490,deadline:Date.now()-10000,until:Date.now()+100000,accepted:true});
  assert.equal((await post('/checkout',checkout,lateAccepted)).status,200);
  assert.equal((await post('/checkout',checkout,accepted.slice(0,-1)+'z')).status,409);
  assert.equal((await post('/checkout',{...checkout,expectedTotal:1},accepted)).status,409);
  candleStock=0;
  assert.equal((await post('/checkout',checkout,accepted)).status,409);
  assert.equal(((await (await post('/commerce/offer',{lines})).json()) as any).offer,null);
  assert.equal((await post('/checkout',{lines,delivery:'home',expectedTotal:priceCents(890)},expired)).status,200);
 } finally {globalThis.fetch=nativeFetch;for(const k of Object.keys(process.env))if(!(k in old))delete process.env[k];Object.assign(process.env,old);server.close();}
});
