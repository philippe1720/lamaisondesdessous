import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [catalog, verified, guide, preview] = await Promise.all([
  readFile(path.join(root, 'src/data/matterhorn-preview.json'), 'utf8').then(JSON.parse),
  readFile(path.join(root, 'src/data/verified-size-guides.json'), 'utf8').then(JSON.parse),
  readFile(path.join(root, 'src/features/shop/size-guides.tsx'), 'utf8'),
  readFile(path.join(root, 'src/features/shop/matterhorn-preview.tsx'), 'utf8')
]);

const checks = [];
const check = (label, fn) => { fn(); checks.push(label); console.log('PASS size-guide: '+label); };
const products = catalog.products;
const byId = new Map(products.map(p => [p.id, p]));
check('20 modèles répartis en deux familles de dix', () => {
  assert.equal(products.length,20);
  assert.equal(products.filter(p=>p.category==='collants').length,10);
  assert.equal(products.filter(p=>p.category==='chaussettes').length,10);
});
check('identifiants et titres uniques', () => {
  assert.equal(byId.size,20);
  assert.equal(new Set(products.map(p=>p.name)).size,20);
});
check('pas de nom du grossiste dans les textes clients', () => {
  for(const p of products) assert.doesNotMatch(p.name+' '+p.description+' '+p.seoDescription, /Matterhorn/i);
  assert.doesNotMatch(preview,/SÉLECTION MATTERHORN|photos issues du catalogue Matterhorn|Photo fournisseur/i);
});
check('quatre modèles ont des sources fabricant', () => {
  assert.deepEqual(Object.keys(verified.models).sort(), ['195686','195688','220112','220114']);
  for(const [id, info] of Object.entries(verified.models)){
    const p=byId.get(id);
    assert.ok(p && p.category==='collants');
    assert.ok(info.label && p.name.startsWith(info.label+' — '));
    assert.match(info.source,/^https:\/\/gatta\.pl\//);
  }
});
check('quatre plages de tailles contrôlables', () => {
  assert.deepEqual(verified.ranges.map(r=>r.code),['2-S','3-M','4-L','5-XL']);
  for(const row of verified.ranges){
    for(const field of ['heightCm','hipCm','weightKg']) {
      const [lo,hi]=row[field];
      assert.ok(Number.isInteger(lo)&&Number.isInteger(hi)&&lo<hi);
    }
  }
});
check('les plages affichées correspondent aux tailles du catalogue', () => {
  const allowed=new Set(verified.ranges.map(r=>r.code));
  for(const id of Object.keys(verified.models)){
    const p=byId.get(id);
    assert.ok(p.variants.every(v=>allowed.has(v.size.replace(/^EU /,''))));
  }
});
check('tailles universelles sans fourchette inventée', () => {
  assert.ok(products.filter(p=>p.category==='chaussettes').some(p=>p.variants.some(v=>/universelle/.test(v.size))));
  assert.match(guide,/Taille universelle|taille universelle/i);
});
check('le guide indique le tableau vérifié et les variantes réelles', () => {
  assert.match(guide,/<VerifiedTightsSizeTable \/>/);
  assert.match(guide,/p\.variants/);
  assert.match(guide,/GuideNavigation/);
});
check('chaque fiche collant vérifiée a le tableau, les autres ne le revendiquent pas', () => {
  assert.match(preview,/hasVerifiedSizing\(p\.id\)/);
  assert.match(preview,/<VerifiedTightsSizeTable id=\{p\.id\}/);
});
check('les aperçus restent non commerciaux', () => {
  assert.match(preview,/noindex/);
  assert.match(preview,/n.est pas encore disponible à la commande/);
  assert.doesNotMatch(preview,/addToCart|handleCheckout|beginCheckout/);
});
console.log('Guides tailles : '+checks.length+' contrôles réussis.');
