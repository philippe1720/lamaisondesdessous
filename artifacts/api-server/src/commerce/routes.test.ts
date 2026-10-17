import {test} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {once} from 'node:events';
import {commerceRouter} from './routes';
import {snapshot} from './catalog';
import {priceCents} from './core';

test('Checkout validates supplier stock, price, delivery and builds a single Stripe payment',async()=>{
 const base=await snapshot(), product=base.products[0], variant=product.variants[0];
 const nativeFetch=globalThis.fetch; let stock=3; let captured:URLSearchParams|undefined; let stripeCalls=0; let stripeStatus=200; let authorization='';
 const old={...process.env};
 Object.assign(process.env,{CHECKOUT_ENABLED:'true',STRIPE_SECRET_KEY:'sk_test_fixture',BUSYX_FEED_URL:'https://www.busyx.com/csv_generator.php?token=fixture',SITE_URL:'https://shop.example',PICKUP_POINTS_JSON:JSON.stringify([{id:'relay-1',name:'Relais',address:'1 rue du Test',postcode:'75001',city:'Paris'}])});
 globalThis.fetch=async (input:any,init:any)=>{
  const url=String(input);
  if(url.startsWith('https://www.busyx.com/')) return new Response(`ID du produit;EAN13;Prix unitaire HT;Stock\n${product.id};${variant.ean};8,90;${stock}\n`,{status:200});
  if(url==='https://api.stripe.com/v1/checkout/sessions'){stripeCalls++;authorization=init.headers.Authorization;if(stripeStatus!==200)return Response.json({error:{type:'authentication_error',code:'api_key_expired',message:'SECRET SHOULD NOT LEAK'}},{status:stripeStatus});captured=new URLSearchParams(init.body);return Response.json({url:'https://checkout.stripe.com/c/pay/cs_test_fixture'});}
  return nativeFetch(input,init);
 };
 const server=express().use(express.json()).use('/api',commerceRouter).listen(0); await once(server,'listening');
 const address=server.address() as {port:number};const origin=`http://localhost:${address.port}`;
 const valid={lines:[{ean:variant.ean,quantity:1}],delivery:'home',expectedTotal:priceCents(890)};
 const send=(body:unknown)=>nativeFetch(origin+'/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 try{
  const configResponse=await nativeFetch(origin+'/api/commerce/config');
  assert.equal(configResponse.headers.get('cache-control'),'no-store');
  assert.equal(((await configResponse.json()) as {paymentMode:string}).paymentMode,'test');
  process.env.STRIPE_SECRET_KEY='sk_live_fixture';
  assert.equal(((await (await nativeFetch(origin+'/api/commerce/config')).json()) as {paymentMode:string}).paymentMode,'live');
  process.env.STRIPE_SECRET_KEY='pk_live_fixture';
  const badConfig=await (await nativeFetch(origin+'/api/commerce/config')).json() as any;
  assert.equal(badConfig.checkoutEnabled,false);assert.equal(badConfig.paymentMode,null);
  assert.equal((await send(valid)).status,503);assert.equal(stripeCalls,0);
  process.env.STRIPE_SECRET_KEY='  sk_live_fixture  ';
  assert.equal((await send(valid)).status,200);assert.equal(authorization,'Bearer sk_live_fixture');
  stripeStatus=401;
  const rejected=await send(valid);assert.equal(rejected.status,503);
  const rejection=await rejected.text();assert.match(rejection,/panier est conservé/);assert.ok(!rejection.includes('SECRET'));
  stripeStatus=200;stripeCalls=0;
  process.env.STRIPE_SECRET_KEY='sk_test_fixture';
  assert.equal((await send({...valid,lines:[...valid.lines,...valid.lines]})).status,400);
  assert.equal((await send({...valid,expectedTotal:1})).status,409);
  assert.equal((await send({...valid,delivery:'pickup',pickupPostcode:'75001',pickupCity:'Paris',pickup:'untrusted'})).status,400);
  stock=0;assert.equal((await send(valid)).status,409);assert.equal(stripeCalls,0);
  stock=3;assert.equal((await send(valid)).status,200);assert.equal(stripeCalls,1);assert.equal(captured?.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'),'0');
  assert.equal(captured?.get('mode'),'payment');assert.match(captured?.get('success_url') || '',/session_id=\{CHECKOUT_SESSION_ID\}#access=[a-f0-9]{64}/);assert.equal(captured?.get('metadata[store]'),'lmd');assert.equal(captured?.get('line_items[0][price_data][unit_amount]'),String(priceCents(890)));
  assert.equal(captured?.get('line_items[0][price_data][product_data][metadata][ean]'),variant.ean);
  assert.equal((await send({...valid,delivery:'pickup',pickupPostcode:'75001',pickupCity:'Paris',pickup:'relay-1',expectedTotal:priceCents(890)})).status,200);
  assert.equal(captured?.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'),'0');
  assert.equal(captured?.get('metadata[pickup_id]'),'relay-1');
  process.env.CHECKOUT_ENABLED='false';assert.equal((await send(valid)).status,503);
 }finally{globalThis.fetch=nativeFetch;for(const key of Object.keys(process.env)) if(!(key in old)) delete process.env[key];Object.assign(process.env,old);server.close();}
});
