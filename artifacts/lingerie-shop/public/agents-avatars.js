'use strict';
// Espace de conversation privé des agents virtuels de La Maison des Dessous.
// Sans clé API, aucune réponse fictive n'est produite : la mission est copiée
// pour être traitée dans le compte ChatGPT déjà payé par le dirigeant.
(() => {
 const $ = id => document.getElementById(id);
 const faces=[
  {id:'direction',name:'Élise',role:'Directrice générale',face:'👩🏻‍💼',tone:'#f0d8e4'},
  {id:'sourcing',name:'Maya',role:'Sourcing & fournisseurs',face:'👩🏽‍💼',tone:'#f2e0c8'},
  {id:'communication',name:'Clara',role:'Communication & publicité',face:'👩🏾‍🎨',tone:'#e6d8f1'},
  {id:'seo',name:'Nora',role:'Référencement SEO',face:'👩🏻‍💻',tone:'#d6e7e9'},
  {id:'commercial',name:'Louis',role:'Direction commerciale',face:'👨🏼‍💼',tone:'#e5dde8'},
  {id:'sav',name:'Léa',role:'Relations clientes',face:'👩🏿‍💼',tone:'#f3e0da'},
  {id:'finances',name:'Hugo',role:'Finances & comptabilité',face:'👨🏽‍💻',tone:'#dbe9e2'},
  {id:'technique',name:'Alex',role:'Responsable technique',face:'👨🏻‍💻',tone:'#dae2f0'}
 ];
 const allowedAuto=new Set(['sourcing','seo','technique','commercial','finances','direction']);
 const instructions={
  direction:'Coordonne les pôles IA, arbitre par valeur, risque et coût ; ne prend pas de décision engageante sans accord.',
  sourcing:'Recherche des bas féminins à vendre, vérifie stocks, fournisseurs, marges, tailles et conformité avant toute proposition. N’achète jamais.',
  communication:'Prépare des publications Instagram et TikTok naturelles et des idées de publicité sans publier ni dépenser.',
  seo:'Améliore les mots-clés des catégories bas résille, bas autofixants et porte-jarretelles sans inventer les positions Google.',
  commercial:'Analyse les ventes réellement payées sans inclure les transactions de test et propose des actions commerciales.',
  sav:'Prépare des réponses SAV courtoises sans accéder aux informations de clientes ni envoyer de message sans accord.',
  finances:'Distingue ventes brutes, dépenses, marges théoriques et bénéfices réellement constatés. Aucune déclaration automatique.',
  technique:'Contrôle le site, ses pages et son fonctionnement sans déployer, corriger ni toucher à Stripe sans validation.'
 };
 let current='sourcing',ai=false,quota=0,running=false;
 const conversations={};
 const el=(tag,cl='',text)=>{const x=document.createElement(tag);if(cl)x.className=cl;if(text!==undefined)x.textContent=text;return x};
 const getProfile=()=>faces.find(f=>f.id===current)||faces[0];
 const load=role=>{
  try{
   const raw=sessionStorage.getItem('lmd-avatar-conversation-'+role)||'[]';
   const rows=JSON.parse(raw);
   return Array.isArray(rows)?rows.filter(m=>m && ['user','assistant','report'].includes(m.role)&&typeof m.content==='string').slice(-14):[];
  }catch{return conversations[role]||[];}
 };
 const save=(role,rows)=>{
  conversations[role]=rows.slice(-14).map(m=>({role:m.role,content:String(m.content).slice(0,3500)}));
  try{sessionStorage.setItem('lmd-avatar-conversation-'+role,JSON.stringify(conversations[role]));}catch{/*session only*/}
 };
 const add=(role,who,content)=>{
  const list=load(role);
  list.push({role:who,content:String(content).slice(0,3500)});
  save(role,list);
  if(role===current)renderDialogue();
 };
 const view=$('avatar-hub');
 if(!view)return;
 const shell=el('div','avatar-main');
 const top=el('div','panel avatar-panel');
 const h=el('h3','', 'Rencontre ton équipe virtuelle');top.append(h);
 top.append(el('p','help','Choisis un avatar, discute avec lui ou lance son diagnostic disponible. Ce sont des agents numériques, pas des salariés réels.'));
 const deck=el('div','avatar-grid');deck.id='avatar-grid';top.append(deck);
 const columns=el('div','avatar-columns');
 const conv=el('article','panel avatar-conversation');
 const header=el('div','avatar-chat-header');const face=el('div','avatar-face');face.id='avatar-face';
 const who=el('div');const name=el('h3');name.id='avatar-name';const role=el('p','help');role.id='avatar-role';who.append(name,role);header.append(face,who);conv.append(header);
 const pills=el('div','row-actions');const badge=el('span','status');badge.id='avatar-chat-status';
 const remaining=el('span','help');remaining.id='avatar-chat-quota';pills.append(badge,remaining);conv.append(pills);
 const messages=el('div','avatar-messages');messages.id='avatar-messages';messages.setAttribute('aria-live','polite');conv.append(messages);
 const label=el('label','field','Ton message ou ta consigne');label.htmlFor='avatar-message';conv.append(label);
 const input=el('textarea');input.id='avatar-message';input.rows=3;input.maxLength=1250;input.placeholder='Ex. Maya, cherche des bas noirs autofixants qui pourraient intéresser nos clientes et explique-moi leur marge potentielle.';conv.append(input);
 const buttons=el('div','row-actions');
 const send=el('button','button','Copier pour ChatGPT');send.id='avatar-send';send.type='button';
 const paste=el('button','button light','Copier l’échange');paste.type='button';
 const reset=el('button','button ghost small','Effacer la conversation');reset.type='button';
 buttons.append(send,paste,reset);conv.append(buttons);
 conv.append(el('p','help','En mode gratuit, le message est copié pour notre conversation ChatGPT : aucune réponse n’est inventée sur cette page. Les échanges enregistrés ici ne durent que pendant cet onglet. Ne colle jamais de clé secrète ni de données personnelles de clientes.'));
 const mission=el('article','panel avatar-mission');
 mission.append(el('h3','','Une mission réellement exécutée'));
 const desc=el('p','', 'Chaque agent dispose de droits précis. Les diagnostics gratuits disponibles ne modifient rien dans la boutique.');
 const run=el('button','button','Lancer le diagnostic');run.id='avatar-run';run.type='button';
 const status=el('span','status');status.id='avatar-run-status';status.textContent='En attente';
 const bar=el('div','row-actions');bar.append(run,status);mission.append(desc,bar);
 const report=el('pre','avatar-report');report.id='avatar-report';report.textContent='Choisis un agent pour découvrir ses vérifications réalisables.';mission.append(report);
 mission.append(el('p','help','Les tâches de diagnostic s’exécutent sur demande. Pour continuer à travailler après la fermeture du navigateur et conserver durablement les missions, un stockage/ordonnanceur indépendant sera nécessaire.'));
 columns.append(conv,mission);shell.append(top,columns);view.append(shell);

 const summaries={
  sourcing:'Examine le flux de produits BusyX : nouveaux modèles de bas, stock déclaré, achat HT et prix TTC indicatif. Aucun achat ni mise en ligne.',
  seo:'Contrôle automatiquement les pages SEO réellement compilées pour Google : titres, descriptions, URL canoniques et sitemap. Ne mesure pas la position Google.',
  technique:'Contrôle sans modification le serveur, le catalogue et les pages essentielles. Il ne redéploie rien.',
  commercial:'Dresse un état des commandes réellement payées déjà chargées depuis Stripe, sans les données personnelles.',
  finances:'Calcule les encaissements bruts de l’échantillon de commandes Stripe : sans frais ni bénéfice inventés.',
  direction:'Regroupe un bilan des commandes déjà chargées et propose des priorités générales à faire vérifier.',
  communication:'La lecture automatique des performances et la publication via Metricool restent à connecter au moteur d’agents. Tu peux déjà donner une mission à Clara dans ChatGPT.',
  sav:'La boîte e-mail et les échanges SAV ne sont pas encore connectés à cet agent. Tu peux déjà demander à Léa de préparer des réponses dans ChatGPT.'
 };
 const fmtMoney=cents=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format((cents||0)/100);
 const stats=()=>{
  const xs=(typeof state==='object'&&Array.isArray(state.orders)?state.orders:[]).filter(o=>!o.test);
  const recent=xs.filter(o=>o.created>=Date.now()/1000-30*86400);
  const turnover=recent.reduce((n,o)=>n+(o.amount||0),0);
  return { count:recent.length,turnover,pending:xs.filter(o=>o.status==='to_process').length,
   shipped:xs.filter(o=>o.status==='shipped').length,all:xs.length};
 };
 function renderDialogue(){
  messages.replaceChildren();
  const list=load(current);
  if(!list.length){
   const intro=el('div','avatar-bubble assistant','Bonjour, je suis '+getProfile().name+', ton agent '+getProfile().role.toLowerCase()+
    '. Confie-moi une mission. '+(ai?'Je peux te répondre ici grâce à l’API activée.':'Tu peux copier ta consigne dans ChatGPT avec ton abonnement actuel.'));
   messages.append(intro);
  }
  for(const m of list){
   const row=el('div','avatar-bubble '+(m.role==='user'?'user':m.role==='report'?'report':'assistant'));
   row.textContent=m.content;messages.append(row);
  }
  messages.scrollTop=messages.scrollHeight;
 }
 function draw(){
  const p=getProfile();deck.replaceChildren();
  for(const a of faces){
   const b=el('button','avatar-tile'+(a.id===current?' chosen':''));b.type='button';b.setAttribute('aria-pressed',String(a.id===current));
   const head=el('span','avatar-face',a.face);head.style.background=a.tone;
   const text=el('span','avatar-label');text.append(el('strong','',a.name),el('small','',a.role));
   b.append(head,text);b.onclick=()=>{current=a.id;draw();};deck.append(b);
  }
  face.textContent=p.face;face.style.background=p.tone;
  name.textContent=p.name;role.textContent=p.role;
  badge.textContent=ai?'Dialogue IA activé · usage API payant':'Dialogue direct non activé · mode ChatGPT';
  badge.classList.toggle('good',ai);
  remaining.textContent=ai?'Analyses disponibles aujourd’hui : '+quota:'Aucun nouvel abonnement nécessaire';
  send.textContent=ai?'Envoyer à '+p.name+' (API)':'Copier pour ChatGPT';
  desc.textContent=summaries[current];
  run.disabled=!allowedAuto.has(current);
  run.textContent=allowedAuto.has(current)?'Exécuter le diagnostic':'À connecter ultérieurement';
  status.textContent=allowedAuto.has(current)?'Diagnostic disponible':'Aucune exécution indépendante';
  report.textContent=allowedAuto.has(current)?'Clique sur « Exécuter le diagnostic » pour obtenir un vrai compte rendu.':'Utilise ton ChatGPT actuel pour préparer une mission. Aucun accès direct aux comptes tiers n’est encore installé.';
  renderDialogue();
 }
 const context=()=>{
  const p=getProfile(),list=load(current);
  const lines=list.map(m=>(m.role==='user'?'Dirigeant':m.role==='report'?'Diagnostic':'Agent')+' : '+m.content).join('\n\n');
  return 'Tu représentes '+p.name+', agent virtuel '+p.role+' de La Maison des Dessous (lamaisondesdessous.fr), spécialisée dans les bas pour femme.\n'+
   'Ta mission : '+instructions[current]+'\nBudget minimal. Réponds en français avec des actions concrètes. N’affirme jamais qu’une action a été exécutée sans preuve. Aucune dépense, publication, commande ni e-mail sans validation humaine.\n\n'+lines;
 };
 const copy=async value=>{
  try{await navigator.clipboard.writeText(value);flash('Conversation copiée. Colle-la dans notre discussion ChatGPT.',true);}
  catch{
   const fallback=$('agent-output');
   if(fallback)fallback.textContent=value;
   flash('Copie indisponible : le texte est affiché dans la rubrique de missions.');}
 };
 send.onclick=async()=>{
  if(running)return;
  const prompt=input.value.trim();
  if(prompt.length<12){flash('Écris au moins 12 caractères pour donner une instruction claire.');return;}
  if(!ai){add(current,'user',prompt);input.value='';await copy(context());return;}
  if(!confirm('Envoyer ton message à l’API OpenAI ? Cette conversation peut être facturée sur ton compte API. Aucune publication ni dépense publicitaire ne sera déclenchée.'))return;
  const roleId=current;const old=load(roleId).filter(m=>m.role==='user'||m.role==='assistant');
  const history=old.slice(-8).map(m=>({role:m.role,content:m.content}));history.push({role:'user',content:prompt});
  running=true;send.disabled=true;send.textContent='Réponse en cours…';
  try{
   const d=await api('/api/gestion/agents/chat','POST',{role:roleId,messages:history});
   add(roleId,'user',prompt);add(roleId,'assistant',d.reply);input.value='';
   quota=d.remainingToday;draw();flash('L’avatar a répondu. Aucune action externe effectuée.',true);
  }catch(e){flash(e.message);}
  finally{running=false;send.disabled=false;draw();}
 };
 paste.onclick=()=>copy(context());
 reset.onclick=()=>{if(confirm('Effacer la conversation de cet avatar sur cet onglet ?')){
  save(current,[]);renderDialogue();flash('Conversation effacée.',true);
 }};
 async function mission(roleId){
  if(roleId==='sourcing'){
   const d=await api('/api/gestion/agents/sourcing');
   const top=d.candidates.slice(0,8);
   return 'Recherche BusyX : '+d.scanned+' références parcourues, '+d.candidates.length+' pistes de nouveaux bas (maximum 30). Vérification : '+new Date(d.checkedAt).toLocaleString('fr-FR')+
    '.\n\n'+(top.length?top.map((c,i)=>(i+1)+'. '+c.name+' — EAN '+c.ean+' — stock '+c.stock+' — achat '+c.buyPriceHT.toFixed(2)+' € HT — prix TTC indicatif '+c.suggestedPriceTTC.toFixed(2)+' €').join('\n'):'Aucune nouvelle référence correspondant aux filtres.')+
    '\n\nValidation indispensable : vérification humaine des tailles, visuels, composition, marge, frais de livraison et droits de commercialisation. Aucun produit ajouté ni acheté.';
  }
  if(roleId==='seo'||roleId==='technique'){
   const d=await api('/api/gestion/agents/diagnostic?kind='+roleId);
   return (roleId==='seo'?'Audit SEO':'Audit technique')+' — '+new Date(d.checkedAt).toLocaleString('fr-FR')+'\n'+d.summary+
    '\n\n'+d.checks.map(x=>(x.status==='ok'?'✓ ':'⚠ ')+x.label+' : '+x.detail).join('\n')+
    '\n\n'+d.alerts+' point(s) à examiner. Aucun fichier modifié.';
  }
  const d=stats();
  if(roleId==='finances')return 'État des encaissements Stripe (30 derniers jours, échantillon chargé)\n'+
   'Commandes réelles payées : '+d.count+'\nMontant brut encaissé : '+fmtMoney(d.turnover)+
   '\n\nIl manque les achats HT BusyX, la TVA applicable, l’expédition, les commissions Stripe, les remboursements et les cotisations pour calculer un bénéfice. Aucune donnée de test incluse. Aucun paiement réalisé.';
  if(roleId==='commercial')return 'Bilan commercial du Centre de pilotage\n'+
    'Commandes réelles (30 jours) : '+d.count+'\nVentes brutes : '+fmtMoney(d.turnover)+
    '\nCommandes à transmettre à BusyX : '+d.pending+'\nExpéditions suivies : '+d.shipped+
    '\n\nActions proposées : 1) sécuriser les commandes à préparer, 2) contrôler les fiches les plus visibles, 3) renforcer les liens Instagram vers les catégories. Les données Stripe sont limitées aux sessions chargées. Aucune promotion appliquée.';
  if(roleId==='direction')return 'Synthèse de direction — rapport automatisé non génératif\n'+
    'Ventes réelles sur 30 jours (sessions chargées) : '+d.count+', montant brut '+fmtMoney(d.turnover)+
    '\nCommandes à traiter : '+d.pending+
    '\n\nPriorités : 1) fiabiliser le SAV et le suivi client ; 2) concentrer le SEO et la communication sur les modèles en stock ; 3) approfondir les fournisseurs sans engager de dépenses. Validations humaines nécessaires.';
  throw Error('Aucun diagnostic gratuit indépendant disponible pour ce rôle.');
 }
 run.onclick=async()=>{
  if(running||!allowedAuto.has(current))return;
  const roleId=current;run.disabled=true;status.textContent='Mission en cours…';
  try{const result=await mission(roleId);
    add(roleId,'report',result);
    if(current===roleId){report.textContent=result;status.textContent='Diagnostic terminé ✓';}
    flash('Diagnostic terminé par '+(faces.find(x=>x.id===roleId)?.name||'l’agent')+'. Aucune action engageante réalisée.',true);
  }catch(e){if(current===roleId)status.textContent='Échec';flash(e.message);}
  finally{if(current===roleId)run.disabled=false;}
 };
 async function refresh(){
  try{const d=await api('/api/gestion/agents/config');ai=Boolean(d.aiEnabled);quota=d.remainingToday||0;}
  catch{ai=false;quota=0;}
  draw();
 }
 // Refresh after session login, including pages opened via the sidebar.
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-page="equipe"],[data-go="equipe"]'))refresh();
 });
 const observer=new MutationObserver(()=>{if(!$('equipe').hidden)refresh();});
 observer.observe($('equipe'),{attributes:true,attributeFilter:['hidden']});
 draw();
})();
