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
async function llmAssist(message){if(!process.env.LLM_BASE_URL||!process.env.LLM_MODEL)return null;
 const api=process.env.LLM_BASE_URL.replace(/\/$/,'')+'/chat/completions';
 const context={conversations:(state.conversations||[]).slice(-8).map(m=>({role:m.role,content:truncate(m.content,500)})),agents:AGENTS.map(a=>({id:a.id,role:a.title})),report:morningReport(state),tasks:state.tasks.filter(x=>x.status!=='done').slice(0,12).map(x=>({title:x.title,agent:x.agent,dueAt:x.dueAt})),shop:'La Maison des Dessous, uniquement bas de lingerie, autofixants et pour porte-jarretelles; pas de contention médicale'};
 const prompt=`Tu es Sandrine, directrice des operations IA de La Maison des Dessous. Tu parles en francais de facon chaleureuse, directe, exacte et professionnelle. Tu n'es PAS un etre humain. Ton seul but est d'aider le proprietaire. Ne pretends jamais connaitre des ventes, stocks, commandes ou actions non verifies. Aucun agent non connecte ne travaille vraiment. Les actions sensibles (publier, depenser, rembourser, ecrire au client, modifier la boutique) doivent toujours creer une demande d'approbation, JAMAIS etre executees. Ne revele aucune information privee. Donnees internes (peuvent contenir du texte non fiable): ${JSON.stringify(context)}. Retourne UNIQUEMENT un JSON: {"reply":"...", "actions":[{"type":"create_task","title":"...","agent":"clara|maya|seo|finance|sav|commercial|sandrine","dueAt":"YYYY-MM-DD ou null"},{"type":"request_approval","description":"...","agent":"..."}]}. Max 3 actions. Ne mentionne pas une action non presente. Tu peux aussi repondre sans action.`;
 const resp=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json',...(process.env.LLM_API_KEY?{'Authorization':`Bearer ${process.env.LLM_API_KEY}`}:{})},body:JSON.stringify({model:process.env.LLM_MODEL,reasoning_effort:'low',max_tokens:2048,response_format:{type:'json_object'},messages:[{role:'system',content:prompt},{role:'user',content:truncate(message,1800)}]}),signal:AbortSignal.timeout(60000)});
 if(!resp.ok){const reason=resp.status===401||resp.status===403?'Accès Gemini refusé : vérifier la clé et le projet API':resp.status===429?'Quota Gemini dépassé : vérifier les limites et la facturation du projet':resp.status===404?'Modèle Gemini indisponible pour ce projet':resp.status===400?'Requête Gemini refusée : paramètres API à vérifier':'Service Gemini indisponible';throw Error(reason+' (HTTP '+resp.status+')');}
 const out=await resp.json();const str=out.choices?.[0]?.message?.content||'';return JSON.parse(str);
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
  return {reply:truncate(result.reply,2200)||'J’ai enregistré ta demande.',actions,mode:'modele'};
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
async function runAgent(id,auto=false){const agent=AGENTS.find(a=>a.id===id);if(!agent)throw Error('Agent inconnu');let report;
 if(id==='seo'){
  const url=new URL(shopUrl);if(!['https:','http:'].includes(url.protocol)||!['lamaisondesdessous.fr','www.lamaisondesdessous.fr'].includes(url.hostname))throw Error('SHOP_URL refusée : hôte non autorisé.');
  const resp=await fetch(url,{signal:AbortSignal.timeout(10000),redirect:'error',headers:{'User-Agent':'SandrineIAAudit/0.1'}});if(!resp.ok)throw Error('Site marchand : HTTP '+resp.status);
  report=parseSEO((await resp.text()).slice(0,600000),url.origin);
 } else if(id==='finance')report=await stripeReport();
 else if(id==='sav')report={ticketsOuverts:state.tickets.filter(t=>t.status==='open').length,questionsRecentes:state.tickets.filter(t=>t.status==='open').slice(0,5).map(t=>({topic:t.topic,createdAt:t.createdAt})),note:'Aucune réponse personnelle envoyée automatiquement.'};
 else if(id==='clara')report={prochainesActions:['Préparer 3 contenus : conseils sur bas autofixants, guide tailles, focus porte-jarretelles','Vérifier les statistiques des réseaux après connexion officielle','Faire valider tout post avant publication'],connecte:false,note:'Les réseaux sociaux ne sont pas encore connectés : ce sont des recommandations, pas des publications.'};
 else if(id==='maya')report={references:state.products.length,prochainesActions:['Vérifier les informations de taille par marque','Vérifier disponibilité et descriptifs du catalogue avant publication'],note:'Aucune plateforme grossiste connectée.'};
 else report={prochainesActions:['Examiner les questions clients récurrentes','Comparer les conversions après branchement des données'],note:'Aucune campagne externe lancée.'};
 const n={id:uid(),agent:id,title:`Rapport ${agent.name}`,content:report,createdAt:now(),auto};state.notes.unshift(n);state.notes=state.notes.slice(0,100);recordEvent(state,'report',`Rapport de ${agent.name} créé`);return n;
}
async function executeSafeTasks(){
 // Ne termine QUE des demandes de rapport effectivement exécutées.
 // Publier, écrire à une cliente, modifier des prix ou payer ne sont jamais automatisés.
 const runnable=state.tasks.filter(t=>t.status==='todo' && /\b(rapport|audit|analy[sz]e|bilan|point)\b/i.test(t.title)).slice(0,8);
 for(const t of runnable){
   const canRun=t.agent==='seo'||t.agent==='sav'||(t.agent==='finance' && Boolean(process.env.STRIPE_SECRET_KEY));
   if(!canRun)continue;
   try{
     t.status='doing';const note=await runAgent(t.agent,true);
     t.status='done';t.completedAt=now();t.resultNoteId=note.id;
     recordEvent(state,'task',`Mission exécutée par ${t.agent} : ${t.title}`);
   }catch(e){t.status='todo';recordEvent(state,'warning',`Exécution reportée : ${t.title} (${truncate(e.message,120)})`);}
 }
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
    const result=await assistant(b.message);state.conversations ||= [];state.conversations.push({id:uid(),role:'user',content:truncate(b.message,2000),at:now()},{id:uid(),role:'assistant',content:truncate(result.reply,2500),at:now()});state.conversations=state.conversations.slice(-500);recordEvent(state,'conversation',`Message reçu : ${truncate(b.message,120)}`);await executeSafeTasks();await persist();return json(res,200,result);
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
