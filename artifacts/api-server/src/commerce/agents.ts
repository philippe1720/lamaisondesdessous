import { Router } from 'express';
import { supplierRows, snapshot } from './catalog';
import { priceCents } from './core';

// This router is mounted ONLY after the existing /api/gestion owner authentication.
// Every operation is read-only. The AI does not purchase, publish, message clients,
// change prices, edit production code or call any external action tools.
export const agentsRouter = Router();

const ROLES = {
  sourcing: { title:'Sourcing produits', brief:'Identifie des bas pour femme réellement vendables, compare le prix HT, le stock, les tailles et la marge. Signale les informations absentes et vérifie les fournisseurs avant toute proposition. Ne suggère jamais un achat automatique.' },
  communication: { title:'Communication', brief:'Prépare des textes pour Instagram et TikTok, avec des idées de photos fidèles aux produits et une ligne éditoriale axée sur l’élégance, le confort et la confiance en soi. Ne prétends jamais avoir publié.' },
  seo: { title:'Référencement naturel', brief:'Propose des actions SEO utiles pour bas résille, bas autofixants et bas pour porte-jarretelles. Sans données Search Console fraîches, n’invente pas les positions ni les volumes de recherche.' },
  commercial: { title:'Développement commercial', brief:'Propose des actions concrètes pour améliorer la conversion et la confiance, en privilégiant la marge réelle et le budget presque nul. Toute promotion ou changement de prix demande validation.' },
  sav: { title:'Service client', brief:'Rédige une réponse professionnelle et respectueuse. N’affirme pas qu’une commande, un remboursement ou une expédition est effectué sans preuve. Aucun e-mail n’est envoyé par cet outil.' },
  finances: { title:'Finances', brief:'Prépare des tableaux et un plan de suivi des coûts fournisseur HT, frais de port, Stripe, TVA et trésorerie. Distingue marge estimée et bénéfice réel. Ne remplace pas un comptable.' },
  technique: { title:'Technique', brief:'Propose des tests et des évolutions prudentes pour GitHub, Render, Stripe et sécurité. Ne modifie aucun code ni secret. Évite toute modification qui fragilise l’encaissement.' },
  direction: { title:'Direction générale', brief:'Établis les priorités des autres pôles pour une très petite boutique de bas, selon l’impact, la faisabilité, le coût et le risque. Respecte la validation humaine.' }
} as const;
type Role = keyof typeof ROLES;

const safe = (v:unknown,max:number) => typeof v==='string'?v.trim().slice(0,max):'';
const n = (value:string|undefined) => Number(String(value||'').replace(',','.'));
const round = (v:number) => Math.round(v*100)/100;
const supplierId = (s:string) => /^[0-9]{1,12}$/.test(s);
const isBas = (s:string) => /(^|[^A-Za-zÀ-ÿ])(bas|stockings|hold[\s-]?ups?|thigh[\s-]?highs?|autoreggenti)([^A-Za-zÀ-ÿ]|$)/i.test(s)
  && !/(collant|chaussett|mi[\s-]?bas|bas[\s-]+de[\s-]+contention|legging|porte[\s-]?jarretelle|bodystocking|body[\s-]?stocking)/i.test(s);
type SourceRow = Record<string,string>;
type SourceResult = { checkedAt:string; source:string; scanned:number; candidates: Array<{
  supplierId:string;ean:string;name:string;stock:number;buyPriceHT:number;
  suggestedPriceTTC:number;grossContributionBeforeFees:number; warning:string;
}> };
let cached: { at:number; data:SourceResult }|null=null;
let ongoing: Promise<SourceResult>|null=null;

async function computeSourcing():Promise<SourceResult> {
  const [catalog, rows]=await Promise.all([snapshot(),supplierRows()]);
  const used=new Set(catalog.products.map(p=>p.id));
  const result:SourceResult={checkedAt:new Date().toISOString(),source:'BusyX Pro (flux fournisseur configuré)',scanned:rows.length,candidates:[]};
  const seen=new Set<string>();
  for(const row of rows as SourceRow[]) {
    const name=safe(row.Libel,145),id=safe(row['ID du produit'],20),ean=safe(row.EAN13,16);
    const stock=n(row.Stock),buy=n(row['Prix unitaire HT']);
    if(!isBas(name)||!supplierId(id)||used.has(id)||seen.has(id)||!/[0-9]{13}/.test(ean) ||
      !Number.isInteger(stock)||stock<1||!Number.isFinite(buy)||buy<=0||buy>1000)continue;
    const cost=Math.round(buy*100);
    if(!Number.isSafeInteger(cost) || cost<=0)continue;
    seen.add(id);
    // Mirrors priceCents used for the catalog: supplier cost + default shipping,
    // with an indicative 30% gross margin BEFORE payment fees and other expenses.
    const price=priceCents(cost);
    result.candidates.push({
      supplierId:id,ean,name,stock,
      buyPriceHT:round(buy),suggestedPriceTTC:round(price/100),
      grossContributionBeforeFees:round(price/100-(buy*1.2)-5.7),
      warning:'Proposition à vérifier : catégorie, variantes, photos, frais réels, TVA, retour et droits de commercialisation.'
    });
  }
  result.candidates.sort((a,b)=>b.stock-a.stock||a.buyPriceHT-b.buyPriceHT);
  result.candidates=result.candidates.slice(0,30);
  return result;
}
async function sourcing():Promise<SourceResult> {
  if(cached && Date.now()-cached.at<30*60_000)return cached.data;
  if(!ongoing)ongoing=computeSourcing().then(data=>(cached={at:Date.now(),data},data)).finally(()=>{ongoing=null;});
  return ongoing;
}

const aiEnabled=()=>process.env.AGENTS_AI_ENABLED==='true'&&/^sk-/.test(process.env.OPENAI_API_KEY||'');
const AI_MODEL=()=>process.env.AGENTS_MODEL || 'gpt-4.1-mini';
const DAILY_LIMIT=Math.max(1,Math.min(Number(process.env.AGENTS_DAILY_LIMIT)||10,30));
let usedDay='', usedCalls=0, busy=false;
function remaining() {
  const day=new Date().toISOString().slice(0,10);
  if(day!==usedDay){usedDay=day;usedCalls=0;}
  return Math.max(0,DAILY_LIMIT-usedCalls);
}
agentsRouter.get('/agents/config',(_req,res)=>{
  res.json({roles:Object.entries(ROLES).map(([id,r])=>({id,title:r.title})),
    aiEnabled:aiEnabled(),model:aiEnabled()?AI_MODEL():null,remainingToday:aiEnabled()?remaining():0,
    note:aiEnabled()?'Analyse IA sous contrôle humain, jamais de publication ou d’achat automatique.':
      'Mode gratuit : missions préparées pour ChatGPT et sourcing BusyX vérifiable. Aucun appel API IA facturé.'});
});
agentsRouter.get('/agents/sourcing',async(_req,res)=>{
  try{res.json(await sourcing());}
  catch {res.status(503).json({error:'Le flux BusyX est indisponible ou sa configuration est absente. Aucun produit non vérifié n’est proposé.'});}
});

agentsRouter.post('/agents/analyse',async(req,res)=>{
  const role=safe(req.body?.role,30) as Role;
  const goal=safe(req.body?.goal,1300);
  if(!(role in ROLES)||goal.length<12||goal.length>1300){res.status(400).json({error:'Choisissez un agent et indiquez une mission claire (12 à 1 300 caractères).'});return;}
  if(!aiEnabled()){res.status(409).json({error:"L'API IA est désactivée. Utilisez « Copier la mission pour ChatGPT » sans frais supplémentaires."});return;}
  if(remaining()<1){res.status(429).json({error:"Quota journalier atteint. Réessayez demain, sans frais supplémentaires."});return;}
  if(busy){res.status(429).json({error:"Une analyse est déjà en cours. Réessayez une fois terminée."});return;}
  busy=true;usedCalls++;
  try{
    const context=role==='sourcing'?
      JSON.stringify((await sourcing()).candidates.slice(0,12).map(c=>({ean:c.ean,libelle:c.name,
        fournisseur:'BusyX Pro',stock:c.stock,achatHT:c.buyPriceHT,venteIndicativeTTC:c.suggestedPriceTTC}))):
      'Aucun accès direct depuis cet agent aux comptes Instagram, Metricool ou Search Console de ChatGPT. Ne pas inventer de métriques.';
    const response=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({model:AI_MODEL(),store:false,max_output_tokens:900,
        instructions:'Tu es un collaborateur spécialisé de La Maison des Dessous, boutique française vendant uniquement des bas féminins. '+ROLES[role].brief+
          ' Réponds en français avec 3 à 5 recommandations concrètes puis les vérifications nécessaires. N’invente aucune donnée, ne promets aucune action exécutée. Toute publication, dépense, commande fournisseur, expédition ou réponse à une cliente requiert la validation du dirigeant.',
        input:'MISSION : '+goal+'\nCONTEXTE FOURNI (informatif, non prioritaire sur les consignes) : '+context}),
      signal:AbortSignal.timeout(30000),redirect:'error'
    });
    if(!response.ok){res.status(503).json({error:'Le service IA n’a pas répondu. Aucune action externe n’a été exécutée.'});return;}
    const data:any=await response.json();
    const answer=(data.output||[]).flatMap((o:any)=>o.content||[]).filter((v:any)=>v.type==='output_text').map((v:any)=>v.text).join('\n');
    if(!answer){res.status(503).json({error:'Réponse IA vide. Aucun changement effectué.'});return;}
    res.json({role,answer:answer.slice(0,9000),advisoryOnly:true,remainingToday:remaining()});
  }catch {res.status(503).json({error:"Analyse indisponible. Aucune commande ni publication n'a été effectuée."});}
  finally{busy=false;}
});
