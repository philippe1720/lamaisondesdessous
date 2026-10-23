import http from "node:http";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {randomBytes,createHmac,timingSafeEqual,scryptSync} from "node:crypto";
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||10000);
const PASS=process.env.ADMIN_PASSWORD;
const SECRET=process.env.SESSION_SECRET;
if(!PASS||PASS.length<16||!SECRET||SECRET.length<32)throw Error("ADMIN_PASSWORD and SESSION_SECRET must be configured");
const hpass=scryptSync(PASS,"sandrine-preview",64);
const origin=process.env.APP_ORIGIN||"";
const agents=[
{id:"clara",name:"Clara",role:"Community management"},
{id:"maya",name:"Maya",role:"Recherche fournisseurs"},
{id:"seo",name:"Léo",role:"SEO et contenu"},
{id:"finance",name:"Thomas",role:"Chiffres et gestion"},
{id:"sav",name:"Sophie",role:"Service client"},
{id:"commercial",name:"Antoine",role:"Marketing commercial"}];
const state={tasks:[],approvals:[],notes:[],chat:[],events:[]};
const limiter=new Map();
const clean=(v,n=400)=>String(v??"").trim().slice(0,n);
const uid=()=>randomBytes(9).toString("hex");
const stamp=()=>new Date().toISOString();
function reply(res,status,data,extras={}){res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...extras});res.end(JSON.stringify(data));}
function validCookie(req){const raw=(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("sd_session="))?.slice(11);if(!raw)return false;const [until,nonce,sig]=raw.split(".");if(!until||!nonce||!sig||Date.now()>Number(until))return false;const check=createHmac("sha256",SECRET).update(until+"."+nonce).digest("hex");return sig.length===check.length&&timingSafeEqual(Buffer.from(sig),Buffer.from(check));}
function createCookie(){const until=String(Date.now()+7*86400000);const nonce=randomBytes(12).toString("hex");const sig=createHmac("sha256",SECRET).update(until+"."+nonce).digest("hex");return "sd_session="+until+"."+nonce+"."+sig+"; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=604800";}
function limit(req,bucket,n=30){const key=bucket+":"+(req.headers["x-forwarded-for"]||req.socket.remoteAddress||"").toString().split(",")[0];const item=limiter.get(key)||{n:0,at:Date.now()};if(Date.now()-item.at>60000){item.n=0;item.at=Date.now();}item.n++;limiter.set(key,item);return item.n<=n;}
async function parse(req){let s="";for await(const chunk of req){s+=chunk;if(s.length>16000)throw Error("too large");}return s?JSON.parse(s):{};}
function addTask(title,agent="sandrine",due=null){const task={id:uid(),title:clean(title,180),agent,createdAt:stamp(),due:clean(due,10),status:"todo"};state.tasks.unshift(task);state.events.unshift({date:stamp(),msg:"Nouvelle mission : "+task.title});return task;}
function addApproval(desc){const item={id:uid(),description:clean(desc,240),status:"pending",createdAt:stamp()};state.approvals.unshift(item);return item;}
function infer(message){const msg=clean(message,1200),low=msg.toLowerCase();let answer="",action=null;
if(/publie|publication|envoyer|envoie|rembours|paiement|ach[eè]te|d[eé]pense|prix|communiquer aux clients/.test(low)){
 const x=addApproval(msg);answer="J'ai préparé une demande de validation : "+x.description+". Aucune action externe n'a été effectuée.";action="approval";
}else if(/rappel|rappelle|pense [àa]|t[âa]che|mission|demande [àa]|pr[eé]pare/.test(low)){
 let agent="sandrine";if(/instagram|r[eé]seaux|publication|reel|clara/.test(low))agent="clara";else if(/seo|google|fiche produit|r[eé]f[eé]rencement/.test(low))agent="seo";else if(/fournisseur|bas|maya|stock/.test(low))agent="maya";else if(/stripe|budget|chiffre|vente|marge/.test(low))agent="finance";else if(/cliente|sav|retour/.test(low))agent="sav";
 const due=(msg.match(/20\d{2}-\d{2}-\d{2}/)||[])[0]||null;
 const t=addTask(msg,agent,due);answer="J'ai enregistré la mission pour "+(agents.find(a=>a.id===agent)?.name||"Sandrine")+". Je ne prétends pas qu'un agent connecté l'a déjà exécutée.";action="task";
}else if(/vente|chiffre|commande|stripe|tr[eé]sorerie/.test(low)){answer="Pour te donner les vrais chiffres, il faudra relier Sandrine aux données de la boutique et à Stripe en lecture seule. Cette version de test ne fabrique aucun résultat.";}
else if(/jour|priorit[eé]|bilan|rapport|point/.test(low)){answer="Point du jour : "+state.tasks.filter(x=>x.status!=="done").length+" mission(s) en cours, "+state.approvals.filter(x=>x.status==="pending").length+" décision(s) en attente. Les chiffres commerciaux réels ne sont pas encore connectés.";}
else{answer="Je suis Sandrine, ton assistante de direction. Dans cette version d'essai, je peux enregistrer une mission, préparer une validation et te présenter les priorités. Les agents, la boutique et le moteur IA avancé ne sont pas encore connectés. Essaie : « Rappelle-moi d'améliorer le SEO ».";}
state.chat.push({id:uid(),role:"user",text:msg},{id:uid(),role:"sandrine",text:answer});
return {reply:answer,action};
}
const server=http.createServer(async(req,res)=>{
 try{
 const u=new URL(req.url,"http://localhost");
 const p=u.pathname;
 res.setHeader("X-Content-Type-Options","nosniff");
 res.setHeader("X-Frame-Options","DENY");
 res.setHeader("Referrer-Policy","no-referrer");
 res.setHeader("Content-Security-Policy","default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'");
 if(p==="/health")return reply(res,200,{ok:true,mode:"preview",storage:"temporary"});
 if(p==="/api/login"&&req.method==="POST"){
 if(!limit(req,"login",5))return reply(res,429,{error:"Trop de tentatives"});
 const d=await parse(req);const h=scryptSync(clean(d.password,200),"sandrine-preview",64);if(!timingSafeEqual(h,hpass))return reply(res,401,{error:"Mot de passe incorrect"});
 return reply(res,200,{ok:true},{"Set-Cookie":createCookie()});
 }
 if(p.startsWith("/api/")){
 if(!validCookie(req))return reply(res,401,{error:"Connecte-toi pour accéder à Sandrine."});
 if(req.method!=="GET"&&origin&&req.headers.origin!==origin)return reply(res,403,{error:"Origine refusée"});
 if(p==="/api/logout"&&req.method==="POST")return reply(res,200,{ok:true},{"Set-Cookie":"sd_session=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Strict"});
 if(p==="/api/dashboard"&&req.method==="GET")return reply(res,200,{...state,agents,mode:"preview",temporary:true,stats:{tasks:state.tasks.filter(t=>t.status!=="done").length,approvals:state.approvals.filter(t=>t.status==="pending").length,tickets:0,shopConnected:false}});
 if(p==="/api/chat"&&req.method==="POST"){if(!limit(req,"chat"))return reply(res,429,{error:"Ralentis un peu"});const d=await parse(req);if(!clean(d.message))return reply(res,400,{error:"Message vide"});return reply(res,200,infer(d.message));}
 if(p==="/api/tasks"&&req.method==="POST"){const d=await parse(req);if(!clean(d.title))return reply(res,400,{error:"Titre nécessaire"});const agent=agents.some(a=>a.id===d.agent)?d.agent:"sandrine";return reply(res,201,addTask(d.title,agent,d.due));}
 if(p.startsWith("/api/tasks/")&&req.method==="PATCH"){const d=await parse(req);const t=state.tasks.find(x=>x.id===p.split("/")[3]);if(!t)return reply(res,404,{error:"Mission introuvable"});if(!["todo","doing","done"].includes(d.status))return reply(res,400,{error:"Statut incorrect"});t.status=d.status;return reply(res,200,t);}
 if(p.startsWith("/api/approvals/")&&req.method==="PATCH"){const d=await parse(req);const a=state.approvals.find(x=>x.id===p.split("/")[3]);if(!a)return reply(res,404,{error:"Décision introuvable"});if(a.status!=="pending")return reply(res,409,{error:"Déjà traitée"});if(!["approved","rejected"].includes(d.status))return reply(res,400,{error:"Statut incorrect"});a.status=d.status;return reply(res,200,{...a,notice:"Aucune publication ni dépense exécutée."});}
 if(p==="/api/report"&&req.method==="POST"){const n={id:uid(),date:stamp(),title:"Rapport de test",text:state.tasks.filter(x=>x.status!=="done").length+" missions ouvertes · "+state.approvals.filter(x=>x.status==="pending").length+" validations en attente. Chiffres réels non connectés."};state.notes.unshift(n);return reply(res,201,n);}
 if(p==="/api/agents"&&req.method==="POST"){const d=await parse(req);if(!agents.some(a=>a.id===d.id))return reply(res,404,{error:"Agent inconnu"});const name=agents.find(a=>a.id===d.id).name;const n={id:uid(),date:stamp(),title:"Demande de rapport : "+name,text:"Agent "+name+" non connecté. Mission d'intégration ajoutée à la liste."};state.notes.unshift(n);addTask("Connecter "+name+" pour produire un vrai rapport","sandrine");return reply(res,201,n);}
 return reply(res,404,{error:"Fonction indisponible dans cette démo"});
 }
 if(req.method!=="GET")return reply(res,405,{error:"Méthode non autorisée"});
 const assets={"/":{file:"index.html",mime:"text/html; charset=utf-8"},"/app.js":{file:"app.js",mime:"application/javascript; charset=utf-8"},"/style.css":{file:"style.css",mime:"text/css; charset=utf-8"}};
 const a=assets[p];if(!a)return reply(res,404,{error:"Page introuvable"});
 const data=await readFile(path.join(ROOT,"public",a.file));res.writeHead(200,{"Content-Type":a.mime,"Cache-Control":"no-store"});res.end(data);
 }catch(e){console.error(e);reply(res,500,{error:"Erreur serveur de test"});}
});
server.listen(PORT,"0.0.0.0",()=>console.log("Sandrine preview on "+PORT));
