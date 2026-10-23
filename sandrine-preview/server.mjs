import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, createHmac, timingSafeEqual, scryptSync } from 'node:crypto';
import { loadStore, saveStore, usingPostgres } from './storage.mjs';
import {AGENTS,now,uid,initialStore,recordEvent,makeTask,routeAgent,basicAssistant,customerReply,morningReport,recommendations,dueFromFrench,getParisDate} from './engine.mjs';

const base=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||3000);
const DEV=process.env.DEMO_MODE==='1' && process.env.NODE_ENV!=='production';
const PREVIEW=process.env.SANDRINE_PREVIEW==='1' && process.env.NODE_ENV==='production';
const pwd=process.env.ADMIN_PASSWORD || (DEV?'sandrine-demo':'');
const secret=process.env.SESSION_SECRET || (DEV?'dev-only-session-secret-change-me':'');
const cronSecret=process.env.CRON_SECRET || '';
if(!pwd||!secret)throw Error('ADMIN_PASSWORD et SESSION_SECRET sont obligatoires. Voir .env.example.');
if(!DEV&&!PREVIEW&&!usingPostgres())throw Error('DATABASE_URL PostgreSQL obligatoire en production : aucune donnee client sur un disque ephemere.');
if(!DEV&&pwd.length<12)throw Error('ADMIN_PASSWORD doit avoir au moins 12 caracteres en production.');
if(!DEV&&secret.length<32)throw Error('SESSION_SECRET doit avoir au moins 32 caracteres en production.');
const secure=process.env.NODE_ENV==='production';
const origin=process.env.APP_ORIGIN || `http://localhost:${PORT}`;
const shopOrigin=process.env.SHOP_ORIGIN||'https://lamaisondesdessous.fr';
const shopUrl=process.env.SHOP_URL||'https://lamaisondesdessous.fr';
const pwdHash=scryptSync(pwd,'sandrine-admin-password-v1',64);
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.ico':'image/x-icon','.png':'image/png','.svg':'image/svg+xml'};
let state=await loadStore(initialStore());
const rate=new Map();
const isValidEmail=s=>typeof s==='string'&&s.length<200&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const truncate=(s,n=500)=>String(s||'').trim().slice(0,n);
const safeDate=s=>typeof s==='string'&&/^20\d\d-\d\d-\d\d$/.test(s)&&!Number.isNaN(Date.parse(s))?s:null;
function cookie(value){return `sandrine_session=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${secure?'; Secure':''}`;}
function token(){ const expires=Date.now()+7*86400000;const data=`${expires}.${randomBytes(16).toString('hex')}`;return `${data}.${createHmac('sha256',secret).update(data).digest('hex')}`;}
function isAuth(req){const raw=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('sandrine_session='))?.split('=')[1];if(!raw)return false;let v;try{v=decodeURIComponent(raw);}catch{return false;}const chunks=v.split('.');if(chunks.length!==3)return false;const [expiry,nonce,sig]=chunks;if(Number(expiry)<Date.now()||!Number.isFinite(Number(expiry)))return false;const compare=createHmac('sha256',secret).update(`${expiry}.${nonce}`).digest('hex');return sig.length===compare.length&&timingSafeEqual(Buffer.from(compare),Buffer.from(sig));}
function comparePassword(input){const check=scryptSync(String(input||'').slice(0,250),'sandrine-admin-password-v1',64);return timingSafeEqual(pwdHash,check);}
function json(res,status,obj,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(obj));}
async function body(req){let buf='';for await(const c of req){buf+=c.toString();if(buf.length>32000)throw Error('Requête trop volumineuse');}return buf?JSON.parse(buf):{};}
function rateLimit(req,bucket,max=40,windowMs=60000){const key=`${bucket}:${req.socket.remoteAddress||'unknown'}`;const time=Date.now();const item=rate.get(key)||{start:time,count:0};if(time-item.start>windowMs){item.start=time;item.count=0;}item.count++;rate.set(key,item);return item.count<=max;}
function externalAllowed(req){if(!['POST','PATCH','DELETE','PUT'].includes(req.method))return true;const o=req.headers.origin;if(!o)return true;return o===origin||o===new URL(origin).origin;}
async function persist(){state.revision=(state.revision||0)+1;await saveStore(state);}
function userView(){return {agents:AGENTS,stats:{tasksOpen:state.tasks.filter(t=>t.status!=='done').length,clientsOpen:state.tickets.filter(t=>t.status==='open').length,approvals:state.approvals.filter(t=>t.status==='pending').length,overdue:morningReport(state).overdue},tasks:state.tasks.slice(0,200),tickets:state.tickets.slice(0,100),approvals:state.approvals.slice(0,100),conversations:(state.conversations||[]).slice(-100),recommendations:recommendations(state),notes:state.notes.slice(0,80),products:state.products.slice(0,100),events:state.events.slice(0,100),report:morningReport(state),integrations:{llm:Boolean(process.env.LLM_BASE_URL&&process.env.LLM_MODEL),stripe:Boolean(process.env.STRIPE_SECRET_KEY),postgres:usingPostgres(),email:Boolean(process.env.RESEND_API_KEY&&process.env.NOTIFY_EMAIL&&process.env.NOTIFY_FROM_EMAIL),shopUrl},settings:state.settings,demo:DEV,preview:PREVIEW};}
function addApproval(type,description,agent='sandrine'){const a={id:uid(),type,description,agent,status:'pending',createdAt:now(),decidedAt:null};state.approvals.unshift(a);recordEvent(state,'approval',`Validation requise : ${truncate(description,100)}`);return a;}
async function notify(kind,message){if(!process.env.RESEND_API_KEY||!process.env.NOTIFY_EMAIL||!process.env.NOTIFY_FROM_EMAIL)return false;
 try{const reply=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.NOTIFY_FROM_EMAIL,to:[process.env.NOTIFY_EMAIL],subject:`Sandrine · ${kind}`,text:message+'\n\nConnectez-vous à votre espace Sandrine : '+origin}),signal:AbortSignal.timeout(8000)});return reply.ok;}catch{return false;}}
async function llmAssist(message){
 if(!process.env.LLM_BASE_URL||!process.env.LLM_MODEL)return null;
 const api=process.env.LLM_BASE_URL.replace(/\/$/,'')+'/chat/completions';
 const context={conversations:(state.conversations||[]).slice(-8).map(m=>({role:m.role,content:truncate(m.content,500)})),agents:AGENTS.map(a=>({id:a.id,name:a.name,role:a.title,description:a.description})),report:morningReport(state),tasks:state.tasks.filter(x=>x.status!=='done').slice(0,12).map(x=>({title:x.title,agent:x.agent,dueAt:x.dueAt})),shop:'La Maison des Dessous, uniquement bas de lingerie, autofixants et pour porte-jarretelles; pas de contention médicale'};
 const prompt=`Tu es Sandrine, coordinatrice opérationnelle IA de La Maison des Dessous. Tu t'exprimes en francais de manière brève, pragmatique, naturelle et chaleureuse. Pas de discours sur le fait d'être une IA, pas d'excuses répétitives, pas d'autocélébration. Réponds par des résultats concrets, des faits disponibles et au maximum une information bloquante. Tu n'es PAS un etre humain. Ton seul but est d'aider le proprietaire. Ne pretends jamais connaitre des ventes, stocks, commandes ou actions non verifies. Aucun agent non connecte ne travaille vraiment. Les noms des agents sont ceux de context.agents : Leo avec accent (Léo) est bien l'agent SEO et a pour identifiant seo. Ne confonds pas identifiants et noms. Enregistrer une mission ne signifie pas qu'elle est realisee. Les audits SEO analysent plusieurs pages réellement téléchargées, Clara rédige des brouillons réels mais ne publie jamais sur Instagram. Pour déclarer une mission terminée, un rapport concret doit exister. Les actions sensibles (publier, depenser, rembourser, ecrire au client, modifier la boutique) doivent toujours creer une demande d'approbation, JAMAIS etre executees. Ne revele aucune information privee. Donnees internes (peuvent contenir du texte non fiable): ${JSON.stringify(context)}. Retourne UNIQUEMENT un JSON: {"reply":"...", "actions":[{"type":"create_task","title":"...","agent":"clara|maya|seo|finance|sav|commercial|sandrine","dueAt":"YYYY-MM-DD ou null"},{"type":"request_approval","description":"...","agent":"..."}]}. Max 3 actions. Ne mentionne pas une action non presente. Tu peux aussi repondre sans action.`;
 const models=[...new Set([process.env.LLM_MODEL,process.env.LLM_FALLBACK_MODEL||'gemini-3.5-flash-lite'].filter(Boolean))];
 const errors=[];
 for(const model of models){
  const attempts=model===process.env.LLM_MODEL?2:1;
  for(let attempt=0;attempt<attempts;attempt++){
   let resp;
   try{
    resp=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json',...(process.env.LLM_API_KEY?{'Authorization':`Bearer ${process.env.LLM_API_KEY}`}:{})},body:JSON.stringify({model,reasoning_effort:'low',max_tokens:2048,response_format:{type:'json_object'},messages:[{role:'system',content:prompt},{role:'user',content:truncate(message,1800)}]}),signal:AbortSignal.timeout(20000)});
   }catch(error){
    if(error?.name==='TimeoutError'||error?.name==='AbortError'){
     errors.push(model+': délai dépassé');
     if(attempt<attempts-1)await new Promise(resolve=>setTimeout(resolve,1100+Math.floor(Math.random()*300)));
     continue;
    }
    throw new Error('Réseau Gemini indisponible : '+truncate(error?.message||'erreur',90));
   }
   if(!resp.ok){
    if([500,502,503,504,408].includes(resp.status)){
     errors.push(model+': HTTP '+resp.status);
     if(attempt<attempts-1)await new Promise(resolve=>setTimeout(resolve,1100+Math.floor(Math.random()*300)));
     continue;
    }
    const reason=resp.status===401||resp.status===403?'Accès Gemini refusé : vérifier la clé et le projet API':resp.status===429?'Quota Gemini dépassé : vérifier les limites du projet':resp.status===404?'Modèle Gemini indisponible pour ce projet':resp.status===400?'Requête Gemini refusée : paramètres API à vérifier':'Erreur Gemini';
    throw new Error(reason+' (HTTP '+resp.status+', modèle '+model+')');
   }
   const out=await resp.json();
   const content=out.choices?.[0]?.message?.content;
   if(typeof content!=='string'||!content.trim())throw new Error('Gemini a renvoyé une réponse vide');
   let parsed;try{parsed=JSON.parse(content);}catch{throw new Error('Réponse Gemini non structurée : vérifier le format JSON');}
   if(!parsed||typeof parsed.reply!=='string')throw new Error('Format de réponse Gemini inattendu');
   if(model!==process.env.LLM_MODEL)console.info('Gemini secours utilisé:',model);
   return {...parsed,_model:model};
  }
 }
 throw new Error('Service Gemini momentanément indisponible après nouvelle tentative et modèle de secours ('+errors.join('; ').slice(0,150)+')');
}
async function assistant(message){
 if(!process.env.LLM_BASE_URL||!process.env.LLM_MODEL){
  if(/\b(publie|publier|envoie|envoyer|rembour|achète|acheter|payer|déploy|supprime|changer le prix|modifie la boutique)\b/i.test(message)){
    const a=addApproval('action_externe',`Action à vérifier avant exécution : ${truncate(message,180)}`);return {reply:`Cette action peut affecter la boutique ou ses clientes. Je l'ai ajoutée à tes décisions à valider ; aucune action externe n'a été exécutée.`,actions:[a.id],mode:'regles'};
  }
  return {...basicAssistant(state,message),mode:'regles'};
 }
 try{
  const result=await llmAssist(message);const actions=[];
  const sensitive=/\b(publie|publication immédiate|envoie|rembour|achète|commande chez|payer|déploy|supprime|efface|change le prix)\b/i.test(message);
  if(sensitive&&!result?.actions?.some(a=>a.type==='request_approval')){const a=addApproval('action_externe',`Demande à confirmer : ${truncate(message,180)}`);actions.push(a.id);}
  for(const a of (Array.isArray(result.actions)?result.actions:[]).slice(0,3)){
    if(a.type==='create_task'&&!sensitive){const agent=AGENTS.some(x=>x.id===a.agent)?a.agent:'sandrine';const task=makeTask(state,{title:truncate(a.title,180),agent,dueAt:safeDate(a.dueAt)});actions.push(task.id);}
    if(a.type==='request_approval'){const r=addApproval('action_externe',truncate(a.description,400),a.agent||'sandrine');actions.push(r.id);}
  }
  return {reply:truncate(result.reply,2200)||'J’ai enregistré ta demande.',actions,mode:'modele',model:result._model};
 }catch(error){const problem=error?.name==='TimeoutError'||error?.name==='AbortError'?'Délai de réponse Gemini dépassé (60 secondes)':truncate(error?.message||'erreur inconnue',160);console.warn('Gemini temporarily unavailable:',problem);return {reply:'Je n’ai pas pu obtenir de réponse de Gemini : '+problem+'. Je n’ai créé aucune mission à partir de cette demande. Tu peux réessayer, ou utiliser la rubrique Missions pour attribuer une tâche manuellement.',actions:[],mode:'secours'};}
}
function parseSEO(html,website){const find=(r)=>String(html.match(r)?.[1]||'').replace(/\s+/g,' ').trim();const title=find(/<title[^>]*>([^<]*)<\/title>/i);const description=find(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)||find(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);const h1=(html.match(/<h1\b/gi)||[]).length;const canonical=find(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i);const productSchema=/"@type"\s*:\s*"Product"/i.test(html);return {website,title,description,h1,canonical,productSchema,checks:[!title?'Balise title absente':title.length>65?'Balise title longue':'Balise title présente',!description?'Meta description absente':'Meta description présente',h1===0?'Aucun H1':h1>1?`${h1} H1 détectés`:'Un H1 détecté',!canonical?'Canonical non détectée':'Canonical présente']};}
async function stripeReport(){if(!process.env.STRIPE_SECRET_KEY)return {available:false,message:'STRIPE_SECRET_KEY non configurée.'};
 const start=Math.floor((Date.now()-30*86400000)/1000);const params=new URLSearchParams({'limit':'100','created[gte]':String(start)});
 const resp=await fetch('https://api.stripe.com/v1/charges?'+params,{headers:{'Authorization':`Bearer ${process.env.STRIPE_SECRET_KEY}`},signal:AbortSignal.timeout(10000)});
 if(!resp.ok)throw Error(`Stripe : HTTP ${resp.status}`);const data=await resp.json();let count=0,cents=0,refunds=0;
 for(const c of data.data||[]){if(c.currency==='eur'&&c.paid&&c.status==='succeeded'){count++;cents+=c.amount||0;refunds+=c.amount_refunded||0;}}
 return {available:true,period:'30 derniers jours',currency:'EUR (les autres devises sont exclues)',payments:count,gross:cents/100,refunded:refunds/100,netAfterRefunds:(cents-refunds)/100,incomplete:Boolean(data.has_more),note:'Montants des paiements consultés (100 maximum), hors frais Stripe et hors charges. Les charges peuvent inclure des ventes extérieures à la boutique.'};
}

async function seoAudit(){
 const shop=new URL(shopUrl);if(shop.protocol!=='https:'||!['lamaisondesdessous.fr','www.lamaisondesdessous.fr'].includes(shop.hostname))throw Error('Domaine SEO refusé');
 const load=async href=>{
  const res=await fetch(href,{signal:AbortSignal.timeout(12000),headers:{'User-Agent':'Sandrine-SEO-Audit/0.3'}});
  const address=new URL(res.url);if(!['lamaisondesdessous.fr','www.lamaisondesdessous.fr'].includes(address.hostname))throw Error('Redirection interdite');
  if(!res.ok)throw Error('HTTP '+res.status);
  if(!(res.headers.get('content-type')||'').includes('text/html'))throw Error('Non HTML');
  const html=(await res.text()).slice(0,450000);
  const data=parseSEO(html,address.href);
  return {html,data:{...data,httpStatus:res.status,checkedAt:now(),noindex:/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)}};
 };
 const first=await load(shop.origin+'/');
 const found=new Map();
 for(const hit of first.html.matchAll(/<a\b[^>]*href=["']([^"'#]{1,450})["']/gi)){
  try{
   const u=new URL(hit[1],shop.origin+'/');
   if(u.protocol!=='https:'||!['lamaisondesdessous.fr','www.lamaisondesdessous.fr'].includes(u.hostname))continue;
   if(/^\/(api|checkout|panier|compte|login|paiement|confidentialite|cgv)(\/|$)/i.test(u.pathname)||/\.(?:pdf|png|jpe?g|webp|svg|css|js|xml)$/i.test(u.pathname))continue;
   if(u.pathname==='/'||found.has(u.pathname))continue;
   u.search='';u.hash='';found.set(u.pathname,u.href);
  }catch{}
 }
 // Chemins publiquement connus et vérifiés, également testés quand le HTML client ne contient pas de liens navigables.
 const known=['/boutique','/bas-autofixants','/bas-resille','/guide-des-bas','/produit/bas-resille-autofixants-beiges-ohyeah'];
 for(const p of known)if(!found.has(p))found.set(p,shop.origin+p);
 const targets=[...found.values()].slice(0,11),pages=[first.data],failures=[];
 for(let i=0;i<targets.length;i+=3){
  const chunk=targets.slice(i,i+3);
  const result=await Promise.allSettled(chunk.map(load));
  result.forEach((v,k)=>{if(v.status==='fulfilled')pages.push(v.value.data);else failures.push({url:chunk[k],error:truncate(v.reason?.message||'Erreur HTTP',120)});});
 }
 const issues=[];
 for(const p of pages){
  if(!p.title)issues.push({url:p.website,issue:'Titre SEO manquant'});
  if(!p.description)issues.push({url:p.website,issue:'Méta-description manquante'});
  if(p.h1!==1)issues.push({url:p.website,issue:'Nombre de H1 : '+p.h1});
  if(!p.canonical)issues.push({url:p.website,issue:'Canonical non détectée'});
  if(p.noindex)issues.push({url:p.website,issue:'Meta noindex détectée'});
 }
 return {kind:'verified_seo_crawl',createdAt:now(),pagesChecked:pages.length,linksDiscovered:found.size,pages,issues,failures,summary:pages.length+' page(s) réellement téléchargées et inspectées ; '+issues.length+' anomalie(s) potentielles ; '+failures.length+' échec(s). Audit technique, sans accès aux données Search Console.'};
}
async function claraDrafts(brief){
 if(!process.env.LLM_BASE_URL||!process.env.LLM_MODEL)throw Error('Gemini doit être connecté pour produire des brouillons');
 const url=process.env.LLM_BASE_URL.replace(/\/$/,'')+'/chat/completions';
 const instruction='Tu es Clara, community manager de La Maison des Dessous. Écris 3 VÉRITABLES posts Instagram originaux et publiables après validation. Boutique française de bas de lingerie : bas autofixants, résille, pour porte-jarretelles ; PAS de bas médicaux. Voix élégante, accessible, confiante, sensuelle sans explicite. Ne fabrique ni stock, ni prix, ni témoignage, ni information de taille précise. Consigne : '+truncate(brief||'Trois posts cette semaine',300)+'. Réponds uniquement JSON {"posts":[{"theme":"...","caption":"...","hashtags":["#..."],"visual":"..."}]}. Chaque caption doit comporter au moins 80 caractères. Aucun post publié.';
 const models=[...new Set([process.env.LLM_MODEL,process.env.LLM_FALLBACK_MODEL||'gemini-3.5-flash-lite'].filter(Boolean))];
 for(const model of models){
  let res;
  try{
   res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(process.env.LLM_API_KEY?{'Authorization':'Bearer '+process.env.LLM_API_KEY}:{})},body:JSON.stringify({model,reasoning_effort:'low',max_tokens:2200,response_format:{type:'json_object'},messages:[{role:'user',content:instruction}]}),signal:AbortSignal.timeout(23000)});
  }catch(e){if(e.name==='TimeoutError'||e.name==='AbortError')continue;throw e;}
  if(!res.ok){if([429,500,502,503,504].includes(res.status))continue;throw Error('Clara API Gemini : HTTP '+res.status);}
  const response=await res.json();
  let payload;try{payload=JSON.parse(response.choices?.[0]?.message?.content||'{}');}catch{throw Error('Clara : réponse JSON incorrecte');}
  const posts=(Array.isArray(payload.posts)?payload.posts:[]).filter(p=>typeof p.caption==='string'&&p.caption.length>=80).slice(0,3).map(p=>({theme:truncate(p.theme,100),caption:truncate(p.caption,1600),hashtags:Array.isArray(p.hashtags)?p.hashtags.filter(h=>typeof h==='string').slice(0,10):[],visual:truncate(p.visual,500),status:'à_valider'}));
  if(posts.length<2)throw Error('Clara : pas assez de textes exploitables');
  return {kind:'real_social_drafts',model,createdAt:now(),published:false,brief:truncate(brief,300),posts,note:'Rédigés avec Gemini. Rien publié sur Instagram.'};
 }
 throw Error('Clara : Gemini indisponible, aucune rédaction validée');
}

async function runAgent(id,auto=false,taskTitle=''){const agent=AGENTS.find(a=>a.id===id);if(!agent)throw Error('Agent inconnu');let report;
 if(id==='seo')report=await seoAudit();
 else if(id==='finance')report=await stripeReport();
 else if(id==='sav')report={ticketsOuverts:state.tickets.filter(t=>t.status==='open').length,questionsRecentes:state.tickets.filter(t=>t.status==='open').slice(0,5).map(t=>({topic:t.topic,createdAt:t.createdAt})),note:'Aucune réponse personnelle envoyée automatiquement.'};
 else if(id==='clara')report=await claraDrafts(taskTitle);
 else if(id==='maya')throw Error('Maya nécessite un accès fournisseur pour produire une vérification réelle de prix, stock et disponibilité.');
 else throw Error('Cet agent n’a pas encore d’outil d’exécution connecté. Un faux rapport ne sera plus généré.');
 const n={id:uid(),agent:id,title:`Rapport ${agent.name}`,content:report,createdAt:now(),auto};state.notes.unshift(n);state.notes=state.notes.slice(0,100);recordEvent(state,'report',`Rapport de ${agent.name} créé`);return n;
}
async function executeSafeTasks(){
 const done=[],failed=[];
 const selected=state.tasks.filter(t=>t.status==='todo' && (
  (t.agent==='seo' && /(audit|analys|diagnostic|rapport|vérifi|contrôl)/i.test(t.title)) ||
  (t.agent==='clara' && Boolean(process.env.LLM_MODEL) && /(rédig|écri|prépar|contenu|post|publication|reel|story|calendrier|planning|texte)/i.test(t.title) && !/\b(publie|publier|envoie|poster maintenant|trente|30|mois)\b/i.test(t.title)) ||
  (t.agent==='sav' && /\b(rapport|audit|analyse|bilan|point)\b/i.test(t.title)) ||
  (t.agent==='finance' && Boolean(process.env.STRIPE_SECRET_KEY) && /\b(rapport|audit|analyse|bilan|point)\b/i.test(t.title))
 )).slice(0,1);
 for(const t of selected){
  try{
   t.status='doing'; const note=await runAgent(t.agent,true,t.title);
   if(t.agent==='seo' && (!note.content.pagesChecked||!Array.isArray(note.content.pages)))throw Error('Audit SEO incomplet');
   if(t.agent==='clara' && (!Array.isArray(note.content.posts)||!note.content.posts.length))throw Error('Brouillons absents');
   if(t.agent==='finance'&&note.content.available!==true)throw Error('Stripe non connecté');
   t.status='done';t.completedAt=now();t.resultNoteId=note.id;
   const summary=t.agent==='seo'?'Audit réellement effectué sur '+note.content.pagesChecked+' page(s), '+note.content.issues.length+' point(s) à vérifier':
    t.agent==='clara'?note.content.posts.length+' vrais brouillons rédigés, à valider avant publication':
    t.agent==='sav'?'État de '+note.content.ticketsOuverts+' dossier(s) client(s) ouverts':
    'Rapport financier récupéré depuis Stripe';
   done.push({taskId:t.id,reportId:note.id,agent:t.agent,summary});
   recordEvent(state,'task','Travail exécuté par '+t.agent+' : '+t.title);
  }catch(e){
   t.status='todo';t.lastError=truncate(e?.message||'Erreur de l’agent',150);
   failed.push({taskId:t.id,agent:t.agent,error:t.lastError});
   recordEvent(state,'warning','Mission non exécutée : '+t.title+' ('+t.lastError+')');
  }
 }
 return {done,failed};
}
function ensureExplicitTask(message,result){
 if(result.mode!=='modele')return null;
 if(!/\b(confie|demande|charge|lance|effectue|fais|réalise|rédige|prépare|analyse|vérifie|audit)\b/i.test(message))return null;
 const agent=/\b(léo|leo|seo|référencement)\b/i.test(message)?'seo':/\b(clara|instagram|réseaux sociaux)\b/i.test(message)?'clara':null;
 if(!agent)return null;
 const hasMission=(result.actions||[]).some(id=>state.tasks.some(t=>t.id===id&&t.agent===agent));
 if(hasMission)return null;
 if(/ne (?:fais|lance|réalise) pas|sans (?:lancer|exécuter)/i.test(message))return null;
 const task=makeTask(state,{title:truncate(message,180),agent,source:'directive explicite'});
 result.actions||=[];result.actions.push(task.id);
 return task.id;
}

function textWithoutAccents(value){
 return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
}
function requestedJobs(message){
 const t=textWithoutAccents(message);
 // An information request never launches an external action by accident.
 if(/^\s*(est ce que|comment|pourquoi|quelles? (?:sont|seraient)|peux tu m.expliquer|qui est|que fait)/.test(t))return [];
 if(/\bne(?:\s+\w+){0,6}\s+pas\b|\bsans\s+(?:lancer|executer|publier)\b/.test(t))return [];
 const imperative=/\b(fais|faire|lance|lancer|execute|executer|realise|realiser|effectue|effectuer|demande|confie|charge|prepare|preparer|redige|rediger|ecris|ecrire|audit|audite|analyse|analyser|produis|produire|travaille|cree|creer)\b/.test(t);
 if(!imperative)return [];
 const wantSeo=/(leo|seo|referencement|audit (?:du |de |des )?(?:site|boutique|pages?)|audit technique)/.test(t)
 &&/(audit|seo|diagnostic|analyse|balise|control|verifi|referencement)/.test(t);
 const wantClara=/(clara|instagram|publication|posts?|stories|reels?|reseaux sociaux|calendrier editorial|planning editorial)/.test(t)
 &&/(redig|ecri|prepar|post|publication|contenu|legende|story|reel|calendrier)/.test(t);
 const wantSav=/(sophie|sav|service client)/.test(t)&&/(bilan|rapport|analyse|dossiers|tickets|questions)/.test(t);
 const wantFinance=/(thomas|finance|stripe|recettes)/.test(t)&&/(bilan|rapport|analyse|chiffres|ventes)/.test(t);
 return [
  ...(wantSeo?[{agent:'seo',title:'Audit SEO réel des pages accessibles — '+truncate(message,130)}]:[]),
  ...(wantClara?[{agent:'clara',title:'Rédaction de 3 publications originales — '+truncate(message,130)}]:[]),
  ...(wantSav?[{agent:'sav',title:'Bilan des demandes SAV — '+truncate(message,130)}]:[]),
  ...(wantFinance?[{agent:'finance',title:'Bilan Stripe en lecture seule — '+truncate(message,130)}]:[])
 ].slice(0,3);
}
async function processDirectCommand(message){
 const t=textWithoutAccents(message);
 if(/\b(publie|publier|envoie|envoyer|rembourse|rembourser|payer|achete|acheter|supprime|supprimer|deploie|deployer)\b/.test(t)){
  if(/(sur instagram|sur facebook|un post|une publication|postes?\b)/.test(t) && /\b(prepar|redig|ecri|brouillon)\b/.test(t)){
   // Drafts are safe; publishing is not, handled by the following condition.
   if(/\b(publie|publier|envoie|envoyer)\b/.test(t)){}
  }
  const approval=addApproval('action_externe','Action externe à autoriser et à connecter : '+truncate(message,180));
  return {reply:'Je te demande une validation pour cette action externe. Rien n’a été publié, envoyé ou facturé. Le connecteur d’exécution reste à brancher.',actions:[approval.id],mode:'action_restreinte',executed:[]};
 }
 const jobs=requestedJobs(message);
 if(!jobs.length){
  if(/\b(que fais|qu.as tu fait|quel travail|missions terminees|rapport d.activite|etat des missions)\b/.test(t)){
   const completed=state.tasks.filter(x=>x.status==='done'&&x.resultNoteId);
   const pending=state.tasks.filter(x=>x.status!=='done');
   return {reply:'Travaux vérifiables : '+completed.length+' mission(s) avec rapport ; '+pending.length+' mission(s) encore ouvertes. Rapports récents : '+(state.notes.filter(n=>['seo','clara','sav','finance'].includes(n.agent)).slice(0,3).map(n=>n.title).join(' ; ')||'aucun')+'. Consulte l’onglet Rapports pour les preuves.',actions:[],mode:'etat_reel',executed:[]};
  }
  return null;
 }
 const executed=[],failed=[],created=[];
 for(const job of jobs){
  if(job.agent==='finance'&&!process.env.STRIPE_SECRET_KEY){
   failed.push('Thomas : aucun accès Stripe en lecture seule configuré');continue;
  }
  const task=makeTask(state,{title:job.title,agent:job.agent,source:'commande_directe'});
  created.push(task.id);
  task.status='doing';
  try{
   const note=await runAgent(job.agent,true,job.title);
   if(job.agent==='seo'&&(!note.content.pagesChecked||!Array.isArray(note.content.pages)))throw Error('Audit sans pages contrôlées');
   if(job.agent==='clara'&&(!Array.isArray(note.content.posts)||note.content.posts.length<2))throw Error('Textes non disponibles');
   if(job.agent==='finance'&&note.content.available!==true)throw Error('Données Stripe non disponibles');
   task.status='done';task.resultNoteId=note.id;task.completedAt=now();
   const proof=job.agent==='seo'
     ?note.content.pagesChecked+' page(s) inspectée(s), '+note.content.issues.length+' point(s) à vérifier'
     :job.agent==='clara'
       ?note.content.posts.length+' textes Instagram rédigés, en attente de validation'
       :job.agent==='sav'
         ?note.content.ticketsOuverts+' demande(s) interne(s) encore ouverte(s)'
         :note.content.payments+' paiement(s) Stripe lu(s) sur 30 jours';
   executed.push({agent:job.agent,taskId:task.id,reportId:note.id,summary:proof});
   recordEvent(state,'task','Mission réellement exécutée : '+job.title);
  }catch(error){
   task.status='todo';task.lastError=truncate(error?.message||'Échec de la tâche',120);
   failed.push(job.agent+' : '+task.lastError);
   recordEvent(state,'warning','Exécution bloquée : '+job.title+' — '+task.lastError);
  }
 }
 const messages=[
  ...executed.map(e=>'✓ '+AGENTS.find(a=>a.id===e.agent)?.name+' : '+e.summary+'. Rapport enregistré.'),
  ...failed.map(e=>'✕ Non exécuté : '+e)
 ];
 return {reply:messages.join('\n')||'Aucune mission exécutée.',actions:created,executed,mode:'execution_reelle'};
}

async function tick(){await executeSafeTasks();const day=getParisDate();const recent=state.events.filter(e=>e.type==='daily'&&e.details?.day===day).length;
 if(!recent){
  for(const agentId of ['finance','sav']){try{await runAgent(agentId,true);}catch(error){recordEvent(state,'warning',`Rapport ${agentId} indisponible : ${truncate(error.message,100)}`);}}
  if(new Date(day+'T12:00:00Z').getUTCDay()===1){for(const agentId of ['seo','clara']){try{await runAgent(agentId,true);}catch(error){recordEvent(state,'warning',`Rapport ${agentId} indisponible : ${truncate(error.message,100)}`);}}}
  const rep=morningReport(state);recordEvent(state,'daily','Rapport quotidien : '+rep.summary,{day});state.notes.unshift({id:uid(),agent:'sandrine',title:'Point quotidien '+day,content:rep,createdAt:now(),auto:true});state.notes=state.notes.slice(0,100);if(rep.openTickets||rep.overdue||rep.waitingApprovals)await notify('Point du jour',rep.summary);}
 for(const t of state.tasks.filter(x=>x.status!=='done'&&x.dueAt&&x.dueAt<=day)){
  if(!state.events.some(e=>e.type==='reminder'&&e.details?.taskId===t.id&&e.details?.day===day)){
   recordEvent(state,'reminder',`Rappel : ${t.title}`,{taskId:t.id,day});await notify('Rappel',t.title+' (échéance '+t.dueAt+')');
  }
 }
 const cutoff=Date.now()-90*86400000;state.tickets=state.tickets.filter(t=>t.status!=='closed'||Date.parse(t.closedAt||t.createdAt)>cutoff);
 await persist();return morningReport(state);
}
async function serveStatic(res,pathname){let requested=pathname==='/'?'index.html':pathname.replace(/^\//,'');
 if(!/^(index\.html|app\.js|style\.css|widget\.html|widget\.js|assets\/sandrine-avatar\.webp)$/.test(requested))return json(res,404,{error:'Fichier introuvable'});
 const full=path.join(base,'public',requested);const data=await readFile(full);res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','Cache-Control':requested.includes('avatar')?'public, max-age=86400':'no-cache'});res.end(data);
}
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');const p=url.pathname;
  const isWidget=p==='/widget'||p==='/widget.html'||p==='/widget.js'||p.startsWith('/api/widget/');
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Permissions-Policy','camera=(), geolocation=()');
  if(secure)res.setHeader('Strict-Transport-Security','max-age=31536000; includeSubDomains');
  if(isWidget){res.setHeader('Content-Security-Policy',`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors ${shopOrigin}`);}else{res.setHeader('X-Frame-Options','DENY');res.setHeader('Content-Security-Policy',`default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`);}
  if(p==='/health')return json(res,200,{status:'ok',version:'0.2.0',storage:usingPostgres()?'postgres':'temporary',preview:PREVIEW});
  if(p==='/widget')return await serveStatic(res,'/widget.html');
  if(p==='/api/widget/ask'&&req.method==='POST'){
   if(!rateLimit(req,'widget',15))return json(res,429,{error:'Merci de réessayer plus tard.'});
   const b=await body(req);if(truncate(b.question).length<2)return json(res,400,{error:'Question trop courte.'});
   return json(res,200,customerReply(state,b.question));
  }
  if(p==='/api/widget/ticket'&&req.method==='POST'){
   if(PREVIEW)return json(res,503,{error:'Service client en préparation : ne communiquez aucune donnée personnelle sur cette version de test.'});
   if(!rateLimit(req,'ticket',4,3600000))return json(res,429,{error:'Trop de demandes pour le moment.'});
   const b=await body(req);if(!isValidEmail(b.email)||truncate(b.message,1200).length<10||b.consent!==true)return json(res,400,{error:'Merci de saisir un email, un message et de confirmer la transmission de vos données.'});
   const ticket={id:uid(),email:truncate(b.email,200),message:truncate(b.message,1200),topic:truncate(b.topic,100)||'Question cliente',status:'open',createdAt:now(),closedAt:null};
   state.tickets.unshift(ticket);recordEvent(state,'ticket',`Nouvelle demande cliente : ${ticket.topic}`);await persist();await notify('Nouvelle cliente',`Nouvelle demande : ${ticket.topic}\nConsulte Sandrine pour lire et traiter le message.`);
   return json(res,201,{ok:true,reference:ticket.id.slice(0,8),message:'Votre demande est transmise à notre équipe.'});
  }
  if(p==='/api/login'&&req.method==='POST'){
   if(!rateLimit(req,'login',5,300000))return json(res,429,{error:'Trop de tentatives. Réessayez plus tard.'});
   const b=await body(req);if(!comparePassword(b.password))return json(res,401,{error:'Mot de passe incorrect.'});
   return json(res,200,{ok:true},{'Set-Cookie':cookie(token())});
  }
  if(p==='/api/logout'&&req.method==='POST')return json(res,200,{ok:true},{'Set-Cookie':cookie('')});
  if(p.startsWith('/api/cron/')){
   if(req.method!=='POST'||!cronSecret||req.headers.authorization!==`Bearer ${cronSecret}`)return json(res,403,{error:'Non autorisé'});
   return json(res,200,{ok:true,report:await tick()});
  }
  if(p.startsWith('/api/')){
   if(!isAuth(req))return json(res,401,{error:'Authentification nécessaire'});
   if(!externalAllowed(req))return json(res,403,{error:'Origine non autorisée'});
   if(req.method==='GET'&&p==='/api/bootstrap')return json(res,200,userView());
   if(req.method==='GET'&&p==='/api/export')return json(res,200,state,{'Content-Disposition':'attachment; filename="sandrine-export.json"'});
   if(req.method==='POST'&&p==='/api/assistant'){
    const b=await body(req);if(!truncate(b.message))return json(res,400,{error:'Message vide'});
    const result=(await processDirectCommand(b.message)) || (await assistant(b.message));if(result.mode==='modele')ensureExplicitTask(b.message,result);const work=result.mode==='execution_reelle'||result.mode==='action_restreinte'?{done:[],failed:[]}:await executeSafeTasks();
     if(work.done.length)result.reply+='\n\n✅ Travail exécuté et rapport enregistré : '+work.done.map(x=>x.summary).join(' ; ')+'. Consulte l’onglet Rapports.';
     if(work.failed.length)result.reply+='\n\n⚠️ Mission(s) non terminée(s) : '+work.failed.map(x=>x.agent+' : '+x.error).join(' ; ')+'.';
     result.executed||=work.done;state.conversations||=[];state.conversations.push({id:uid(),role:'user',content:truncate(b.message,2000),at:now()},{id:uid(),role:'assistant',content:truncate(result.reply,2500),at:now()});state.conversations=state.conversations.slice(-500);recordEvent(state,'conversation',`Message reçu : ${truncate(b.message,120)}`);await persist();return json(res,200,result);
   }
   if(req.method==='POST'&&p==='/api/tasks'){
    const b=await body(req);if(!truncate(b.title))return json(res,400,{error:'Titre requis'});
    const t=makeTask(state,{title:b.title,description:b.description||'',agent:AGENTS.some(a=>a.id===b.agent)?b.agent:'sandrine',priority:['normal','haute'].includes(b.priority)?b.priority:'normal',dueAt:safeDate(b.dueAt)});await executeSafeTasks();await persist();return json(res,201,t);
   }
   if(req.method==='PATCH'&&p.startsWith('/api/tasks/')){
    const t=state.tasks.find(x=>x.id===p.split('/').pop());if(!t)return json(res,404,{error:'Mission inconnue'});
    const b=await body(req);if(!['todo','doing','done'].includes(b.status))return json(res,400,{error:'Statut invalide'});
    t.status=b.status;t.completedAt=b.status==='done'?now():null;recordEvent(state,'task',`Mission ${b.status} : ${t.title}`);await persist();return json(res,200,t);
   }
   if(req.method==='POST'&&p.startsWith('/api/agents/')&&p.endsWith('/run')){
    const agentId=p.split('/')[3];const report=await runAgent(agentId);await persist();return json(res,200,report);
   }
   if(req.method==='POST'&&p==='/api/approvals'){
    const b=await body(req);if(!truncate(b.description))return json(res,400,{error:'Description requise'});
    const approval=addApproval('decision',truncate(b.description,400));await persist();await notify('Décision nécessaire',approval.description);return json(res,201,approval);
   }
   if(req.method==='PATCH'&&p.startsWith('/api/approvals/')){
    const a=state.approvals.find(x=>x.id===p.split('/').pop());if(!a)return json(res,404,{error:'Décision inconnue'});
    const b=await body(req);if(!['approved','rejected'].includes(b.status)||a.status!=='pending')return json(res,400,{error:'Décision impossible'});
    a.status=b.status;a.decidedAt=now();recordEvent(state,'approval',`Décision ${b.status} : ${a.description}`);await persist();return json(res,200,{...a,note:'La validation ne déclenche pas de paiement ni de publication : aucun connecteur d’exécution externe n’est encore configuré.'});
   }
   if(req.method==='PATCH'&&p.startsWith('/api/tickets/')){
    const t=state.tickets.find(x=>x.id===p.split('/').pop());if(!t)return json(res,404,{error:'Demande inconnue'});
    const b=await body(req);if(!['open','closed'].includes(b.status))return json(res,400,{error:'Statut invalide'});
    t.status=b.status;t.closedAt=b.status==='closed'?now():null;recordEvent(state,'ticket',`Demande cliente : ${b.status}`);await persist();return json(res,200,t);
   }
   if(req.method==='DELETE'&&p.startsWith('/api/tickets/')){
    state.tickets=state.tickets.filter(x=>x.id!==p.split('/').pop());recordEvent(state,'privacy','Suppression d’une demande cliente');await persist();return json(res,200,{ok:true});
   }
   if(req.method==='POST'&&p==='/api/products'){
    const b=await body(req);if(!truncate(b.name)||!truncate(b.description))return json(res,400,{error:'Nom et description requis'});
    const obj={id:uid(),name:truncate(b.name,100),description:truncate(b.description,1200),sizeGuide:truncate(b.sizeGuide,700),url:truncate(b.url,500),createdAt:now()};state.products.unshift(obj);await persist();return json(res,201,obj);
   }
   if(req.method==='POST'&&p==='/api/report'){
    const rep=morningReport(state);const note={id:uid(),agent:'sandrine',title:'Rapport demandé',content:rep,createdAt:now(),auto:false};state.notes.unshift(note);recordEvent(state,'report','Point de gestion créé');await persist();return json(res,200,note);
   }
   return json(res,404,{error:'Route inconnue'});
  }
  if(req.method==='GET')return await serveStatic(res,p);
  return json(res,405,{error:'Méthode non autorisée'});
 }catch(e){console.error('Request error:',e?.message);return json(res,e?.message==='Requête trop volumineuse'?413:500,{error:'Impossible de traiter la demande. Consultez les journaux serveur.'});}
});
setInterval(()=>tick().catch(e=>console.error('Periodic tick:',e.message)),60*60*1000).unref();
server.listen(PORT,DEV?'127.0.0.1':'0.0.0.0',()=>{console.log(`Sandrine IA prête sur http://localhost:${PORT} — stockage ${usingPostgres()?'PostgreSQL':'temporaire'} — preview=${PREVIEW} — LLM ${process.env.LLM_MODEL||'non connecté'}`)});
