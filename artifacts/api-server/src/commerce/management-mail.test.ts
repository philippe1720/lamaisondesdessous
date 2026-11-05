import {test} from 'node:test';
import assert from 'node:assert/strict';
import {notifyPaidCheckout} from './management-mail';
test('Paid emails include purchased sizes and address; provider failure retries with stable keys',async()=>{
 const old={...process.env},native=globalThis.fetch;const mails:any[]=[];let fail=true;
 Object.assign(process.env,{RESEND_API_KEY:'fixture',MAIL_FROM:'shop@example.com',MERCHANT_NOTIFY_EMAIL:'owner@example.com',STRIPE_SECRET_KEY:'sk_test_fixture'});
 globalThis.fetch=async(input:any,init:any)=>{
  if(String(input).startsWith('https://api.resend.com/')){mails.push({body:JSON.parse(init.body),key:init.headers['Idempotency-Key']});return new Response('{}',{status:fail?503:200});}
  if(String(input).includes('/line_items'))return Response.json({data:[{description:'Bas — M Noir',quantity:1,amount_total:2340}]});
  if(String(input).startsWith('https://api.stripe.com/'))return Response.json({});
  throw new Error('Unexpected request');
 };
 const s={id:'cs_live_fixture',livemode:true,payment_status:'paid',amount_total:2340,metadata:{store:'lmd',order_access:'a'.repeat(64)},customer_details:{email:'customer@example.com'},collected_information:{shipping_details:{name:'Cliente',address:{line1:'1 rue du Test',postal_code:'75001',city:'Paris',country:'FR'}}}};
 try{
  await assert.rejects(notifyPaidCheckout(s),/Service email/);fail=false;await notifyPaidCheckout(s);
  assert.equal(mails[0].key,mails[1].key);assert.equal(mails.length,3);
  for(const m of mails.slice(1)){assert.match(m.body.text,/Bas — M Noir/);assert.match(m.body.text,/1 rue du Test/);}
 }finally{globalThis.fetch=native;process.env=old;}
});
