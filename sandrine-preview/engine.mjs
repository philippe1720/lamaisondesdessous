import { randomUUID } from 'node:crypto';
export const AGENTS = [
  {id:'clara',name:'Clara',title:'Réseaux sociaux',emoji:'📣',description:'Contenus et calendrier éditorial'},
  {id:'maya',name:'Maya',title:'Achats & produits',emoji:'🛍️',description:'Catalogue et besoins produits'},
  {id:'seo',name:'Léo',title:'Référencement SEO',emoji:'🔎',description:'Audit technique et recommandations'},
  {id:'finance',name:'Thomas',title:'Finances',emoji:'📊',description:'Tableau de bord et chiffres Stripe'},
  {id:'sav',name:'Sophie',title:'Service client',emoji:'💬',description:'Questions, retours et escalades'},
  {id:'commercial',name:'Antoine',title:'Développement commercial',emoji:'📈',description:'Offres et développement des ventes'}
];
export const now = ()=>new Date().toISOString();
export const uid = ()=>randomUUID();
export function initialStore(){return {revision:1,conversations:[],tasks:[],tickets:[],notes:[],products:[],approvals:[],events:[],settings:{shopName:'La Maison des Dessous',voiceEnabled:true},createdAt:now()};}
export function recordEvent(state,type,message,details={}){
 state.events.unshift({id:uid(),type,message,at:now(),details});
 state.events=state.events.slice(0,150);
}
export function makeTask(state,{title,agent='sandrine',dueAt=null,priority='normal',source='manual',description=''}){
 const task={id:uid(),title:String(title).slice(0,180),description:String(description).slice(0,1000),agent,priority,dueAt,status:'todo',source,createdAt:now(),completedAt:null};
 state.tasks.unshift(task);recordEvent(state,'task',`Mission confiée à ${agent} : ${task.title}`);return task;
}
export function getParisDate(offset=0){
 const f=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'});
 const p=f.format(new Date(Date.now()+offset*86400000));return p;
}
export function dueFromFrench(text){
 const t=text.toLowerCase();
 const match=t.match(/\b(20\d{2}-\d{2}-\d{2})\b/);if(match)return match[1];
 if(/après.demain/.test(t))return getParisDate(2);
 if(/\bdemain\b/.test(t))return getParisDate(1);
 if(/\baujourd.hui\b|\bce soir\b/.test(t))return getParisDate();
 const map={dimanche:0,lundi:1,mardi:2,mercredi:3,jeudi:4,vendredi:5,samedi:6};
 const day=Object.keys(map).find(k=>new RegExp('\\b'+k+'\\b').test(t));
 if(day){const current=new Date(getParisDate()+'T12:00:00Z').getUTCDay();return getParisDate((map[day]-current+7)%7 || 7);}
 return null;
}
export function routeAgent(text){
 const t=text.toLowerCase();
 if(/instagram|facebook|reel|publication|story|réseau|post |contenu social/.test(t))return 'clara';
 if(/google|seo|l[eé]o|référencement|indexation|mots.clés|balise|trafic organique/.test(t))return 'seo';
 if(/stock|fournisseur|produit|catalogue|nouveaux bas|tailles/.test(t))return 'maya';
 if(/comptab|bilan|marge|chiffre|stripe|trésorerie|recette|facture/.test(t))return 'finance';
 if(/cliente|sav|retour|livraison|réclamation|commande/.test(t))return 'sav';
 if(/vente|promotion|remise|conversion|commercial|panier moyen/.test(t))return 'commercial';
 return 'sandrine';
}
export function basicAssistant(state,input){
 const text=String(input||'').trim(); if(!text)return {reply:'Quelle mission souhaites-tu me confier ?',actions:[]};
 const lower=text.toLowerCase(); const agent=routeAgent(text);
 if(/\b(rappelle|rappel|n.oublie pas|pense à)\b/.test(lower)){
  const date=dueFromFrench(text);
  const title=text.replace(/^.*?(rappelle.moi(?: de)?|rappel(?: de)?|n.oublie pas(?: de)?|pense à)\s*/i,'').replace(/\b(demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|aujourd.hui)\b/gi,'').trim()||text;
  const task=makeTask(state,{title,agent:'sandrine',dueAt:date,priority:'haute'});
  return {reply:`C'est noté : « ${task.title} »${date?' pour le '+date:''}. Le rappel est enregistré. Pour une notification hors de l'application, il faudra connecter un canal d'alerte et une tâche planifiée.`,actions:[task.id]};
 }
 if(/\b(mission|demande à|charge|confie|prépare|analyse|vérifie|audit|fais un rapport|planifie|organise)\b/.test(lower)){
  const task=makeTask(state,{title:text,agent});
  return {reply:`Mission enregistrée pour ${AGENTS.find(a=>a.id===agent)?.name||'Sandrine'} : « ${task.title} ». Elle figure au tableau des tâches. L'exécution automatique dépend des outils réellement connectés à cet agent.`,actions:[task.id]};
 }
 if(/\b(bonjour|salut|coucou)\b/.test(lower)) return {reply:'Bonjour ! Je suis Sandrine, ton assistante pour La Maison des Dessous. Je peux organiser tes missions et tes rappels. Certains agents et les données commerciales demandent encore une connexion. Que souhaites-tu prioriser ?',actions:[]};
 if(/\b(bilan|point|priorité|aujourd.hui|tableau de bord)\b/.test(lower)){
  const pending=state.tasks.filter(t=>t.status!=='done');const open=state.tickets.filter(t=>t.status!=='closed');
  return {reply:`Point actuel : ${pending.length} mission(s) ouverte(s), ${open.length} demande(s) client à traiter et ${state.approvals.filter(a=>a.status==='pending').length} décision(s) en attente. Les ventes ne sont affichées qu'après connexion Stripe.`,actions:[]};
 }
 return {reply:`Je peux transformer ta demande en mission, créer un rappel ou t'aider à organiser le travail. Pour une réponse d'IA avancée, connecte un modèle dans les paramètres du serveur. Je ne vais pas inventer une réponse ni prétendre avoir exécuté une action.`,actions:[]};
}
export function customerReply(state,input){
 const t=String(input||'').toLowerCase().slice(0,1000);
 if(/suivi|où.*commande|colis|numéro.*commande/.test(t))return {answer:"Pour protéger vos informations, je ne peux pas consulter votre commande dans ce chat. Laissez une demande au service client avec votre numéro de commande, sans communiquer vos coordonnées bancaires.",escalate:true,topic:'Suivi de commande'};
 if(/retour|rembours|échange|défectueux/.test(t))return {answer:"Je peux transmettre votre demande de retour ou d'échange à notre équipe. Les conditions précises sont indiquées dans les informations de retour de notre boutique. Je préfère vérifier plutôt que vous donner un délai incorrect.",escalate:true,topic:'Retour ou échange'};
 if(/taille|mesure|grand|petit|pointure/.test(t))return {answer:"Pour bien choisir vos bas, consultez le guide des tailles de la fiche produit. Les mesures varient selon les modèles et les marques. Indiquez-moi la référence qui vous intéresse et je pourrai transmettre votre question à notre équipe.",escalate:true,topic:'Choix de taille'};
 if(/livraison|chronopost|relay|relais|expédi/.test(t))return {answer:"La boutique propose une livraison standard à domicile ou en point relais, ainsi qu'une option express payante selon les conditions affichées à la commande. Les délais exacts sont indiqués au moment du paiement.",escalate:false,topic:'Livraison'};
 if(/autofixant|porte.jarretelle|résille|dentelle/.test(t))return {answer:"Nous sommes spécialisés dans les bas de lingerie : autofixants et modèles pour porte-jarretelles, notamment en résille. Pour vous recommander une référence précise, notre équipe pourra vous orienter selon vos envies et la taille recherchée.",escalate:false,topic:'Conseil produit'};
 if(/contact|humain|conseill|réclamation/.test(t))return {answer:"Bien sûr. Utilisez le formulaire ci-dessous pour laisser votre demande à notre équipe. Évitez d'envoyer des informations bancaires.",escalate:true,topic:'Conseiller'};
 return {answer:"Bienvenue chez La Maison des Dessous ! Je peux vous aider sur les bas autofixants, les modèles pour porte-jarretelles, les tailles, la livraison et les retours. Pour une demande personnelle, vous pouvez contacter notre équipe.",escalate:false,topic:'Question générale'};
}
export function recommendations(state){
 const day=getParisDate();const tips=[];
 const urgent=state.tickets.filter(t=>t.status==='open' && Date.now()-Date.parse(t.createdAt)>24*3600000);
 if(urgent.length)tips.push(`${urgent.length} demande(s) cliente(s) attendent depuis plus de 24 h : à traiter en priorité.`);
 if(state.approvals.some(a=>a.status==='pending'))tips.push('Une décision attend ton accord : consulte les validations.');
 if(state.tasks.some(t=>t.status!=='done' && t.dueAt && t.dueAt<day))tips.push('Des tâches ont dépassé leur échéance : replanifier ou terminer.');
 if(!state.products.length)tips.push('Le catalogue conseillé à Sandrine est encore vide : importer des fiches vérifiées avant des conseils précis.');
 if(!tips.length)tips.push('Aucune urgence dans les missions et demandes enregistrées.');
 return tips.slice(0,5);
}
export function morningReport(state){
 const today=getParisDate();const overdue=state.tasks.filter(t=>t.status!=='done'&&t.dueAt&&t.dueAt<=today);
 const tickets=state.tickets.filter(t=>t.status==='open');const approval=state.approvals.filter(a=>a.status==='pending');
 return {date:today,openTasks:state.tasks.filter(t=>t.status!=='done').length,overdue:overdue.length,openTickets:tickets.length,waitingApprovals:approval.length,summary:`${overdue.length} échéance(s) à traiter, ${tickets.length} demande(s) client et ${approval.length} validation(s) en attente.`};
}
