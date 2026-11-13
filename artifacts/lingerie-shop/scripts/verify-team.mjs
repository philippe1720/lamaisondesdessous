import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..','..','..');
const html=await readFile(path.join(root,'artifacts/lingerie-shop/public/gestion.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
assert.equal(scripts.length,1,'Le centre de pilotage doit conserver un script principal interne unique');
new Script(scripts[0],{filename:'gestion-agent-dashboard.js'});
assert.ok(html.includes('src="/agents-avatars.js"'), 'Le module avatar doit être chargé');
const avatars=await readFile(path.join(root,'artifacts/lingerie-shop/public/agents-avatars.js'),'utf8');
new Script(avatars,{filename:'agents-avatars.js'});
for(const name of ['direction','sourcing','communication','seo','commercial','sav','finances','technique'])assert.ok(avatars.includes("id:'"+name+"'"),'Avatar manquant : '+name);
assert.ok(avatars.includes('Copier pour ChatGPT'),'Le mode gratuit doit rester explicite');
assert.ok(avatars.includes('sessionStorage'),'Les dialogues doivent rester dans cet onglet');
assert.ok(avatars.includes('allowedAuto'),'Les actions sont limitées aux diagnostics');
assert.ok(html.includes('id="avatar-hub"'),'Conteneur des avatars manquant');
for(const id of ['equipe','agent-role','agent-goal','agent-copy','agent-run','agent-save','agent-output',
 'sourcing-load','sourcing-body','sourcing-copy','agent-missions','agent-mode']){
 assert.ok(html.includes('id="'+id+'"'), 'Contrôle manquant : '+id);
}
const management=await readFile(path.join(root,'artifacts/api-server/src/commerce/management.ts'),'utf8');
const auth=management.indexOf("managementRouter.use('/gestion', (req, res, next) => {");
const mount=management.indexOf("managementRouter.use('/gestion', agentsRouter)");
assert.ok(auth>=0 && mount>auth,'Les agents ne sont pas sous authentification propriétaire');
const source=await readFile(path.join(root,'artifacts/api-server/src/commerce/agents.ts'),'utf8');
assert.ok(source.includes("AGENTS_AI_ENABLED==='true'"),'API IA doit rester opt-in');
assert.ok(source.includes("store:false"),'Réponses API sans stockage');
assert.ok(source.includes("DAILY_LIMIT"),'Quotas API requis');
assert.ok(!html.includes('OPENAI_API_KEY'),'Aucune clé API dans la page publique');
assert.ok(source.includes('supplierRows()'),'Le sourcing doit s’appuyer sur des données fournisseur');
assert.ok(source.includes("'/agents/chat'"),'Dialogue API manquant');
assert.ok(source.includes("'/agents/diagnostic'"),'Diagnostic gratuit manquant');
assert.ok(source.includes('redirect:\'error\''),'Ne pas suivre les redirections API externes');
console.log('Team IA: interface JS valide, routage privé, sourcing connecté, aucun appel API IA par défaut.');
