// Post-build checks: test what search crawlers actually receive, not only React source.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname,'..','dist','public');
const read = p => readFile(path.join(root,p),'utf8');
const sitemap = await read('sitemap.xml');
const paths = [...sitemap.matchAll(/<loc>https:\/\/lamaisondesdessous\.fr([^<]*)<\/loc>/g)].map(m=>m[1]);
assert.ok(paths.length>=30,'Le sitemap devrait contenir les pages SEO');
assert.equal(new Set(paths).size,paths.length,'URLs en doublon dans le sitemap');

const required = ['/', '/boutique','/bas-autofixants','/bas-resille','/bas-porte-jarretelles',
  '/conseils/comment-porter-bas-resille','/produit/bas-resille-autofixants-noirs',
  '/produit/bas-autofixants-satin-touch-20-deniers'];
for (const p of required) assert.ok(paths.includes(p),'Page manquante : '+p);
assert.ok(!paths.some(p=>/^\/(gestion|commande|panier|suivi-commande)/.test(p)), 'Les URLs privées ne doivent pas figurer dans le sitemap');

const mustContain = [
  ['/bas-autofixants', /Bas autofixants femme/i, ['/produit/bas-autofixants-satin-touch-20-deniers']],
  ['/bas-resille', /Bas résille femme/i, ['/produit/bas-resille-autofixants-noirs','/conseils/comment-porter-bas-resille']],
  ['/bas-porte-jarretelles', /Bas pour porte-jarretelles femme/i, ['/bas-resille']],
  ['/conseils/comment-porter-bas-resille', /Comment porter des bas résille/i, ['/bas-resille','/bas-porte-jarretelles']],
  ['/', /Bas pour femme/i, ['/bas-resille', '/bas-autofixants']]
];
for (const [url,keyword,links] of mustContain) {
  const html = await read('seo/'+encodeURIComponent(url)+'.html');
  assert.match(html,keyword,'Mot-clé important manquant : '+url);
  assert.ok(html.includes('rel="canonical" href="https://lamaisondesdessous.fr'+url+'"'),'Canonical incorrect : '+url);
  for (const href of links) assert.ok(html.includes('href="'+href+'"'),'Lien interne absent de '+url+' vers '+href);
}
const products=JSON.parse(await readFile(path.resolve(import.meta.dirname,'..','src','data','catalog.json'),'utf8')).products;
for (const product of products) {
  const url='/produit/'+product.slug;
  assert.ok(paths.includes(url),'Produit absent du sitemap : '+url);
  const html=await read('seo/'+encodeURIComponent(url)+'.html');
  const match=html.match(/<script data-seo-prerender="true" type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match,'JSON-LD absent sur '+url);
  const obj=JSON.parse(match[1]);
  assert.equal(obj['@type'],'Product');
  assert.equal(obj.offers?.['@type'],'Offer');
  assert.equal(obj.offers?.priceCurrency,'EUR');
  assert.equal(obj.offers?.url,'https://lamaisondesdessous.fr'+url);
  const expected=(Math.min(...product.variants.map(v=>v.priceCents))/100).toFixed(2);
  assert.equal(obj.offers?.price,expected,'Prix incohérent pour '+url);
  assert.ok(!('availability' in obj.offers),'Stock fournisseur variable : ne pas inventer de disponibilité');
  assert.ok(html.includes('href="/guide-des-tailles"'),'Lien vers taille manquant : '+url);
  assert.ok(html.includes('rel="canonical" href="https://lamaisondesdessous.fr'+url+'"'),'Canonical manquant : '+url);
}
const robots=await read('robots.txt');
assert.ok(robots.includes('Sitemap: https://lamaisondesdessous.fr/sitemap.xml'));
console.log('SEO verified: '+paths.length+' pages, categories, internal links, 10 priced product offers, clean sitemap.');
