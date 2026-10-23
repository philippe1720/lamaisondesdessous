import {test} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {once} from 'node:events';
import {createHmac} from 'node:crypto';
import {orderRouter,stripeWebhook,verifyStripeSignature} from './orders';
import {searchRelays} from './relay';
test('Signed webhook rejects tampering/replay; order details require private token; tracking and refunds follow Stripe',async()=>{
 const old={...process.env},native=globalThis.fetch;const id='cs_test_12345678901234567890',access='a'.repeat(64),secret='whsec_fixture';let paid=false,verified=false,refund=false,tracking='',writes=0;
 Object.assign(process.env,{STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:secret});
 const session=()=>({id,metadata:{store:'lmd',order_access:access,payment_verified:String(verified),tracking_number:tracking,delivery:'home'},mode:'payment',payment_status:paid?'paid':'unpaid',status:'complete',livemode:false,amount_total:2000,payment_intent:{latest_charge:{refunded:refund,amount_refunded:refund?2000:0}},collected_information:{shipping_details:{name:'Cliente',address:{line1:'1 rue du Test',postal_code:'75001',city:'Paris',country:'FR'}}}});
 globalThis.fetch=async(input:any,init:any)=>{if(String(input).startsWith('https://api.stripe.com/')){if(init?.method==='POST'){writes++;verified=true;return Response.json(session())}if(String(input).includes('/line_items'))return Response.json({data:[{description:'Bas — M Noir',quantity:1,amount_total:2000,price:{product:{metadata:{ean:'1234567890123'}}}}]});return Response.json(session())}return native(input,init)};
 const app=express().post('/webhook',express.raw({type:'application/json'}),stripeWebhook).use(express.json()).use('/api',orderRouter);const server=app.listen(0);await once(server,'listening');const url=`http://localhost:${(server.address() as any).port}`;
 const payload=JSON.stringify({type:'checkout.session.completed',data:{object:{id}}}),timestamp=Math.floor(Date.now()/1000);
 const sign=(t:number,body=payload)=>`t=${t},v1=${createHmac('sha256',secret).update(t+'.'+body).digest('hex')}`;
 const hook=(signature:string,body=payload)=>native(url+'/webhook',{method:'POST',headers:{'Content-Type':'application/json','Stripe-Signature':signature},body});
 const order=(token=access)=>native(url+'/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:id,access:token})});
 try{
  assert.equal(verifyStripeSignature(Buffer.from(payload),sign(timestamp-600),secret),false);
  assert.equal((await hook(sign(timestamp),payload+' ')).status,400);
  assert.equal((await hook(sign(timestamp))).status,200);assert.equal(writes,0);
  paid=true;assert.equal((await hook(sign(timestamp))).status,200);assert.equal((await hook(sign(timestamp))).status,200);assert.equal(writes,1);
  assert.equal((await order('b'.repeat(64))).status,404);
  let r=await order();assert.equal(r.headers.get('cache-control'),'no-store');let data:any=await r.json();assert.equal(data.status,'paid');assert.equal(data.shipping.address.city,'Paris');assert.equal(data.items[0].name,'Bas — M Noir');
  tracking='6A12345678901';data=await (await order()).json();assert.equal(data.status,'shipped');assert.match(data.tracking.url,/^https:\/\/www.laposte.fr\//);
  refund=true;data=await (await order()).json();assert.equal(data.status,'refunded');assert.equal(data.tracking,null);
 }finally{globalThis.fetch=native;for(const k of Object.keys(process.env))if(!(k in old))delete process.env[k];Object.assign(process.env,old);server.close();}
});
test('Relay adapter uses authenticated carrier data and excludes closed points',async()=>{
 const old=process.env.COLISSIMO_API_KEY,native=globalThis.fetch;process.env.COLISSIMO_API_KEY='fixture';let request:any;
 globalThis.fetch=async(_input:any,init:any)=>{request=JSON.parse(init.body);return Response.json({errorCode:0,listePointRetraitAcheminement:[{identifiant:'123',nom:'Relais',adresse1:'Rue',localite:'Paris',codePostal:'75001',codePays:'FR',horairesOuvertureLundi:'09:00-18:00 00:00-00:00'},{identifiant:'closed',nom:'Fermé',codePays:'FR',congesTotal:true}]})};
 try{const points=await searchRelays('75001','Paris');assert.equal(points.length,1);assert.equal(points[0].id,'123');assert.equal(request.apiKey,'fixture');assert.equal(request.zipCode,'75001');assert.equal(points[0].hours?.[0],'Lundi : 09:00-18:00');assert.ok(!JSON.stringify(points).includes('fixture'));await assert.rejects(()=>searchRelays('97100','Guadeloupe'));}finally{globalThis.fetch=native;if(old===undefined)delete process.env.COLISSIMO_API_KEY;else process.env.COLISSIMO_API_KEY=old;}
});
