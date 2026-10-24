const $=(selector)=>document.querySelector(selector);
const $$=(selector)=>[...document.querySelectorAll(selector)];
let data=null,voiceOn=true,currentPage='dashboard',speechRecognition=null,activeAgent=null,agentSending=false;
const formatDate=(s)=>s?new Date(s.length===10?s+'T12:00:00':s).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'}):'Sans échéance';
const localDate=()=>new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const msg=(text,isUser=false)=>{const el=document.createElement('div');el.className='message '+(isUser?'user':'assistant');if(!isUser){let avatar=document.createElement('img');avatar.src='/assets/sandrine-avatar.webp';avatar.alt='';el.appendChild(avatar);}let bubble=document.createElement('div');bubble.textContent=text;el.appendChild(bubble);$('#messages').appendChild(el);$('#messages').scrollTop=$('#messages').scrollHeight;};
function toast(t){const el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,4200);}
async function api(p,options={}){const res=await fetch(p,{headers:{'Content-Type':'application/json'},credentials:'same-origin',...options});let j=await res.json().catch(()=>({error:'Réponse invalide'}));if(res.status===401&&p!=='/api/login'){showLogin();throw Error('Session expirée');}if(!res.ok)throw Error(j.error||'Erreur '+res.status);return j;}
async function refresh(){data=await api('/api/bootstrap');$('#app').hidden=false;$('#login').hidden=true;renderAll();if(currentPage==='agent-chat')renderAgentChat();}
function showLogin(){$('#app').hidden=true;$('#login').hidden=false;}
function navigate(page,{updateUrl=true}={}){
 currentPage=page;
 $$('.page').forEach(p=>p.hidden=p.id!==page);
 $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===(page==='agent-chat'?'agents':page)));
 const labels={dashboard:'DIRECTION',chat:'ASSISTANTE',missions:'MISSIONS',agents:'MES AGENTS', 'agent-chat':'MON SPÉCIALISTE',clients:'CLIENTES',approvals:'VALIDATIONS',reports:'RAPPORTS',settings:'CONNEXIONS'};
 $('#breadcrumb').textContent=labels[page]||'BUREAU';
 $('#page-title').textContent=page==='dashboard'?'Bonjour, Philippe ✦':({'agent-chat':activeAgent?((data?.agents||[]).find(a=>a.id===activeAgent)?.name||'Mon agent'):'Mon agent',chat:'Ton bureau avec Sandrine',missions:'Organisation',agents:'Tes spécialistes en accès direct',clients:'Relation clientèle',approvals:'Les décisions importantes',reports:'Les analyses',settings:'Paramètres'}[page]||'Sandrine');
 $('#sidebar').classList.remove('open');
 if(page==='chat')$('#chat-input').focus();
 if(page==='agent-chat')renderAgentChat();
 if(updateUrl&&page!=='agent-chat'&&location.pathname!=='/')history.pushState({},'','/');
}
function openAgentChat(agentId,{updateUrl=true}={}){
 if(!data?.agents.some(a=>a.id===agentId)){toast('Agent introuvable');return;}
 activeAgent=agentId;
 navigate('agent-chat',{updateUrl:false});
 const desired='/agents/'+agentId;
 if(updateUrl&&location.pathname!==desired)history.pushState({},'',desired);
 $('#agent-chat-input').focus();
}
function renderAgentChat(){
 if(!activeAgent||!data)return;
 const agent=data.agents.find(a=>a.id===activeAgent);if(!agent)return;
 $('#agent-chat-title').textContent='Travailler avec '+agent.name;
 $('#agent-chat-subtitle').textContent=agent.title+' · '+agent.description;
 $('#agent-chat-name').textContent=agent.name;
 $('#agent-chat-avatar').textContent=agent.emoji||'✦';
 $('#agent-chat-provider').textContent=(data.ai?.provider||'Modèle non connecté')+' · '+(data.ai?.model||'à configurer')+' · mémoire individuelle';
 const history=data.agentChats?.[activeAgent]||[];
 $('#agent-messages').innerHTML=history.length?history.map(m=>
   '<div class="agent-message '+(m.role==='user'?'from-user':'from-agent')+'"><div class="agent-message-meta">'+escapeHTML(m.role==='user'?'Toi':agent.name)+'</div><div>'+escapeHTML(m.content)+'</div>'+ (m.reportId?'<small class="muted">Livrable enregistré dans Rapports</small>':'')+'</div>'
 ).join(''):'<div class="agent-message from-agent"><div class="agent-message-meta">'+escapeHTML(agent.name)+'</div><div>Bonjour ! Dis-moi sur quel travail nous allons avancer. Je suis spécialisé dans '+escapeHTML(agent.title.toLowerCase())+'.</div></div>';
 $('#agent-messages').scrollTop=$('#agent-messages').scrollHeight;
}
function empty(t){return `<div class="empty">${escapeHTML(t)}</div>`;}

function displayReport(n){
 const c=n.content;
 if(c&&c.kind==='real_social_drafts'&&Array.isArray(c.posts)){
  return '<div class="report-block"><p><strong>'+c.posts.length+' brouillons rédigés — aucune publication effectuée</strong></p>'+c.posts.map((p,i)=>'<div style="margin-top:16px"><b>Publication '+(i+1)+' · '+escapeHTML(p.theme)+'</b><p style="white-space:pre-wrap">'+escapeHTML(p.caption)+'</p><small>'+escapeHTML((p.hashtags||[]).join(' '))+'</small><p><small>Visuel conseillé : '+escapeHTML(p.visual)+'</small></p></div>').join('')+'</div>';
 }
 if(c&&c.kind==='verified_seo_crawl'&&Array.isArray(c.pages)){
  return '<div class="report-block"><p><strong>'+escapeHTML(c.summary)+'</strong></p><p>Pages contrôlées :</p>'+c.pages.map(p=>'<p>• '+escapeHTML(p.website)+' — '+escapeHTML(p.title||'Titre absent')+' (H1 : '+Number(p.h1||0)+')</p>').join('')+'<p><b>Points à vérifier :</b></p>'+(c.issues||[]).slice(0,30).map(i=>'<p>• '+escapeHTML(i.issue)+' — '+escapeHTML(i.url)+'</p>').join('')+(c.failures?.length?'<p><b>Pages non vérifiées : </b>'+c.failures.length+'</p>':'')+'</div>';
 }
 return '<div class="report-block"><pre>'+escapeHTML(typeof c==='string'?c:JSON.stringify(c,null,2))+'</pre></div>';
}
function eventRow(e){return `<div class="list-row"><div class="row-icon">${e.type==='ticket'?'♡':e.type==='approval'?'◇':e.type==='report'?'▤':'✦'}</div><div class="row-main"><b>${escapeHTML(e.message)}</b><small>${formatDate(e.at)}</small></div></div>`;}
function taskRow(t){const a=data.agents.find(a=>a.id===t.agent);return `<div class="list-row"><div class="row-icon">${t.status==='done'?'✓':t.agent==='sandrine'?'✦':escapeHTML(a?.emoji||'☷')}</div><div class="row-main"><b>${escapeHTML(t.title)}</b><small>${escapeHTML(a?.name||'Sandrine')} • ${formatDate(t.dueAt)} • ${t.status==='done'?(t.resultNoteId?'Exécutée avec rapport':'Clôturée manuellement'):t.status==='doing'?'En cours':'À faire'}</small></div><div class="row-actions">${t.status==='done'?(t.resultNoteId?'<span class="badge success">Rapport créé</span>':'<span class="badge neutral">Clôturée</span>'):`<button data-task="${t.id}" data-status="${t.status==='doing'?'done':'doing'}">${t.status==='doing'?'Terminer':'Démarrer'}</button>`}</div></div>`;}
function renderAll(){const s=data.stats; if(data.preview){const notice=document.querySelector('#dashboard .notice p');if(notice)notice.textContent=`VERSION DE TEST : ${data.integrations.postgres?'mémoire PostgreSQL connectée':'stockage temporaire'}. Léo peut auditer des pages du site et Clara rédiger des brouillons à valider. Publication, service client réel et transactions non connectés.`;}$('#today').textContent=localDate();$('#kpi-tasks').textContent=s.tasksOpen;$('#kpi-tickets').textContent=s.clientsOpen;$('#kpi-approvals').textContent=s.approvals;$('#kpi-overdue').textContent=s.overdue;
 $('#nav-task-badge').textContent=s.tasksOpen||'';$('#nav-ticket-badge').textContent=s.clientsOpen||'';$('#nav-approval-badge').textContent=s.approvals||'';
 $('#recent-tasks').innerHTML=data.tasks.filter(t=>t.status!=='done').slice(0,5).map(taskRow).join('')||empty('Aucune mission en attente. Confie une tâche à Sandrine !');
 $('#recent-events').innerHTML=(data.recommendations||[]).map(t=>`<div class="list-row"><div class="row-icon">✦</div><div class="row-main"><b>${escapeHTML(t)}</b></div></div>`).join('')+data.events.slice(0,3).map(eventRow).join('');
 const histories=data.conversations||[];$('#messages').innerHTML='';if(!histories.length)msg('Bonjour ! Je suis prête à organiser tes missions, et à te rappeler les échéances.');else histories.forEach(m=>msg(m.content,m.role==='user'));
 $('#task-count').textContent=data.tasks.length+' au total';$('#tasks-list').innerHTML=data.tasks.map(taskRow).join('')||empty('Aucune mission enregistrée.');
 $('#task-agent').innerHTML='<option value="sandrine">Sandrine · coordination</option>'+data.agents.map(a=>`<option value="${a.id}">${escapeHTML(a.name)} · ${escapeHTML(a.title)}</option>`).join('');
 $('#agents-grid').innerHTML=data.agents.map(a=>{
   const runnable=a.id==='seo'||a.id==='clara'||a.id==='sav'||a.id==='finance'&&data.integrations.stripe;
   const action={seo:'Lancer un audit réel',clara:'Rédiger 3 publications',sav:'Analyser les demandes',finance:'Lire les chiffres Stripe'}[a.id]||'';
   const note=runnable?'Un outil spécifique est disponible.':'Tu peux échanger et travailler sur des livrables, mais les outils externes restent à raccorder.';
   return '<article class="agent-card"><div class="agent-icon">'+escapeHTML(a.emoji)+'</div><h3>'+escapeHTML(a.name)+'</h3><small>'+escapeHTML(a.title)+'</small><p>'+escapeHTML(a.description)+'</p><p style="font-size:12px;opacity:.8">'+escapeHTML(note)+'</p><button class="btn primary" data-agent-open="'+escapeHTML(a.id)+'">Parler directement à '+escapeHTML(a.name)+' ↗</button>'+(runnable?'<button class="btn outline" data-agent-run="'+escapeHTML(a.id)+'">'+escapeHTML(action)+'</button>':'')+'</article>';
 }).join('');
 $('#tickets-count').textContent=data.tickets.filter(t=>t.status==='open').length+' en attente';$('#tickets-list').innerHTML=data.tickets.map(t=>`<div class="list-row"><div class="row-icon">♡</div><div class="row-main"><b>${escapeHTML(t.topic)} • ${escapeHTML(t.email)}</b><small>${formatDate(t.createdAt)}</small><div class="report-block">${escapeHTML(t.message)}</div></div><div class="row-actions">${t.status==='open'?`<button data-ticket="${t.id}" data-ticket-status="closed">Clôturer</button>`:'<span class="badge success">Clôturée</span>'}<button data-ticket-delete="${t.id}" title="Supprimer définitivement">Effacer</button></div></div>`).join('')||empty('Aucune demande cliente reçue.');
 $('#approvals-list').innerHTML=data.approvals.map(a=>`<div class="list-row"><div class="row-icon">◇</div><div class="row-main"><b>${escapeHTML(a.description)}</b><small>${formatDate(a.createdAt)} · ${a.status==='pending'?'En attente':a.status==='approved'?'Validée':'Refusée'}</small></div><div class="row-actions">${a.status==='pending'?`<button data-approval="${a.id}" data-decision="approved">Valider</button><button data-approval="${a.id}" data-decision="rejected">Refuser</button>`:`<span class="badge neutral">${a.status==='approved'?'Validée':'Refusée'}</span>`}</div></div>`).join('')||empty('Aucune décision à prendre.');
 $('#reports-list').innerHTML=data.notes.map(n=>`<div class="list-row"><div class="row-icon">▤</div><div class="row-main"><b>${escapeHTML(n.title)}</b><small>${formatDate(n.createdAt)} • ${escapeHTML(n.agent)} ${n.auto?'• Automatique':''}</small>${displayReport(n)}</div></div>`).join('')||empty('Demande un rapport à un agent pour commencer.');
 const inte=[[`Cerveau IA : ${data.ai?.provider||'non connecté'}${data.ai?.model?' ('+data.ai.model+')':''}`,data.integrations.llm,'GPT est prioritaire si OPENAI_API_KEY est configurée sur Render, sinon Gemini est conservé.'],['Données Stripe',data.integrations.stripe,'Lecture uniquement : aucune transaction possible'],['Base PostgreSQL',data.integrations.postgres,'Stockage durable des missions et demandes'],['Notifications email',data.integrations.email,'Notifications si un service email est configuré'],['Boutique',true,'Adresse de la boutique connue ; connexion au catalogue à compléter']];
 $('#integration-list').innerHTML=inte.map(([n,ok,desc])=>`<div class="integration-row"><div><b>${escapeHTML(n)}</b><p>${escapeHTML(desc)}</p></div><span class="badge ${ok?'success':'warn'}">${ok?'Configuré':'À connecter'}</span></div>`).join('');
}
async function chatSend(text){const input=$('#chat-input');const send=$('#send-button');if(!text?.trim())return;input.value='';send.disabled=true;msg(text,true);try{const out=await api('/api/assistant',{method:'POST',body:JSON.stringify({message:text})});msg(out.reply);if(voiceOn&&'speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(out.reply);u.lang='fr-FR';u.rate=1.03;speechSynthesis.speak(u);}await refresh();}catch(e){msg('Je rencontre un problème de connexion : '+e.message);}finally{send.disabled=false;input.focus();}}
$('#agent-chat-form').addEventListener('submit',async e=>{
 e.preventDefault();
 if(!activeAgent||agentSending)return;
 const agent=activeAgent, input=$('#agent-chat-input'),message=input.value.trim();
 if(!message)return;
 agentSending=true;$('#agent-send').disabled=true;
 input.value='';
 $('#agent-messages').insertAdjacentHTML('beforeend','<div class="agent-message from-user"><div class="agent-message-meta">Toi</div><div>'+escapeHTML(message)+'</div></div>');
 $('#agent-messages').insertAdjacentHTML('beforeend','<div class="agent-message from-agent" id="agent-loading"><div class="agent-message-meta">En cours</div><div>'+escapeHTML(data.agents.find(a=>a.id===agent)?.name||'Agent')+' prépare sa réponse…</div></div>');
 $('#agent-messages').scrollTop=$('#agent-messages').scrollHeight;
 try{
  await api('/api/agents/'+agent+'/chat',{method:'POST',body:JSON.stringify({message})});
  await refresh();
 }catch(error){
  $('#agent-loading')?.remove();
  $('#agent-messages').insertAdjacentHTML('beforeend','<div class="agent-message from-agent"><div class="agent-message-meta">Connexion</div><div>'+escapeHTML(error.message)+'</div></div>');
 }finally{
  $('#agent-loading')?.remove();
  agentSending=false;$('#agent-send').disabled=false;
  if(activeAgent===agent)$('#agent-chat-input').focus();
 }
});
$('#agent-back').addEventListener('click',()=>navigate('agents'));
$('#agent-chat-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){$('#agent-chat-form').requestSubmit();}});
window.addEventListener('popstate',()=>{
 const m=location.pathname.match(/^\/agents\/(clara|maya|seo|finance|sav|commercial)$/);
 if(m&&data)openAgentChat(m[1],{updateUrl:false});else navigate('agents',{updateUrl:false});
});
$('#login-form').addEventListener('submit',async(e)=>{e.preventDefault();try{await api('/api/login',{method:'POST',body:JSON.stringify({password:$('#password').value})});$('#password').value='';$('#login-error').textContent='';await refresh();const route=location.pathname.match(/^\/agents\/(clara|maya|seo|finance|sav|commercial)$/);if(route)openAgentChat(route[1],{updateUrl:false});else navigate('agents');}catch(e){$('#login-error').textContent=e.message;}});
$('#logout').addEventListener('click',async()=>{try{await api('/api/logout',{method:'POST'});}catch{}showLogin();});
$('#refresh').addEventListener('click',async()=>{try{await refresh();toast('Données actualisées.');}catch(e){toast(e.message);}});
$('#menu-toggle').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.goto)));
$('#nav').addEventListener('click',e=>{const t=e.target.closest('[data-page]');if(t)navigate(t.dataset.page);});
$('#chat-form').addEventListener('submit',async e=>{e.preventDefault();await chatSend($('#chat-input').value);});
$$('[data-message]').forEach(b=>b.addEventListener('click',()=>chatSend(b.dataset.message)));
$('#brief-button').addEventListener('click',async()=>{navigate('chat');await chatSend('Fais-moi le point sur la boutique');});
$('#toggle-speech').addEventListener('click',()=>{voiceOn=!voiceOn;$('#toggle-speech').textContent=voiceOn?'🔊 Réponses vocales':'🔇 Voix désactivée';if(!voiceOn&&'speechSynthesis'in window)speechSynthesis.cancel();toast(voiceOn?'Voix activée':'Voix désactivée');});
$('#mic').addEventListener('click',()=>{const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Recognition){toast('Dictée non disponible dans ce navigateur. Utilise le clavier.');return;}if(speechRecognition){speechRecognition.stop();return;}speechRecognition=new Recognition();speechRecognition.lang='fr-FR';speechRecognition.interimResults=false;speechRecognition.onresult=e=>{$('#chat-input').value=e.results[0][0].transcript;$('#chat-input').focus();};speechRecognition.onend=()=>{$('#mic').classList.remove('listening');speechRecognition=null;};speechRecognition.onerror=()=>toast('Micro inaccessible ou dictée indisponible.');$('#mic').classList.add('listening');speechRecognition.start();});
$('#task-form').addEventListener('submit',async(e)=>{e.preventDefault();const form=new FormData(e.target);try{await api('/api/tasks',{method:'POST',body:JSON.stringify(Object.fromEntries(form))});e.target.reset();await refresh();toast('Mission enregistrée.');}catch(err){toast(err.message);}});
$('#report-button').addEventListener('click',async()=>{try{await api('/api/report',{method:'POST'});await refresh();toast('Rapport enregistré.');}catch(e){toast(e.message);}});
document.body.addEventListener('click',async e=>{const t=e.target.closest('[data-agent-open],[data-task],[data-agent-run],[data-ticket],[data-ticket-delete],[data-approval]');if(!t)return;if(t.dataset.agentOpen){openAgentChat(t.dataset.agentOpen);return;}t.disabled=true;try{
 if(t.dataset.task){await api('/api/tasks/'+t.dataset.task,{method:'PATCH',body:JSON.stringify({status:t.dataset.status})});toast('Mission mise à jour.');}
 if(t.dataset.agentRun){const r=await api('/api/agents/'+t.dataset.agentRun+'/run',{method:'POST'});toast('Rapport de '+r.agent+' créé.');navigate('reports');}
 if(t.dataset.ticket){await api('/api/tickets/'+t.dataset.ticket,{method:'PATCH',body:JSON.stringify({status:t.dataset.ticketStatus})});toast('Demande clôturée.');}
 if(t.dataset.ticketDelete){if(!confirm('Supprimer définitivement cette demande cliente ?'))return;await api('/api/tickets/'+t.dataset.ticketDelete,{method:'DELETE'});toast('Demande supprimée.');}
 if(t.dataset.approval){await api('/api/approvals/'+t.dataset.approval,{method:'PATCH',body:JSON.stringify({status:t.dataset.decision})});toast('Décision enregistrée (aucune action externe exécutée).');}
 await refresh();}catch(err){toast(err.message);}finally{t.disabled=false;}});
(async()=>{try{await refresh();const route=location.pathname.match(/^\/agents\/(clara|maya|seo|finance|sav|commercial)$/);if(route)openAgentChat(route[1],{updateUrl:false});else navigate('agents');}catch{showLogin();}})();
