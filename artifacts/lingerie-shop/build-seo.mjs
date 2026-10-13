import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const root=path.dirname(new URL(import.meta.url).pathname);
const {products}=JSON.parse(await readFile(path.join(root,'src/data/catalog.json'),'utf8'));
const out=path.join(root,'dist/public');
const template=await readFile(path.join(out,'index.html'),'utf8');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const navigation='<nav><a href="/">Accueil</a> · <a href="/boutique">Tous les bas</a> · <a href="/bas-autofixants">Autofixants</a> · <a href="/bas-porte-jarretelles">Pour porte-jarretelles</a> · <a href="/guide-des-bas">Guide des bas</a></nav>';
const list=items=>'<ul>'+items.map(p=>`<li><a href="/produit/${p.slug}">${esc(p.name)}</a><p>${esc(p.description)}</p></li>`).join('')+'</ul>';
const pages=[
  ['/qui-sommes-nous','Une boutique consacrée aux bas pour femme','Philippe présente La Maison des Dessous : une sélection de bas autofixants et pour porte-jarretelles, en voile et en résille.','<h2>Les jambes, jusque dans le détail.</h2><p>Une couture derrière la jambe, un voile léger, une jarretière en dentelle : les bas changent une tenue avec peu de chose. C’est ce détail qui m’a donné envie de leur consacrer une boutique.</p><h2>Pourquoi seulement des bas ?</h2><p>Je m’appelle Philippe. Avec La Maison des Dessous, je souhaite construire une adresse où l’on vient choisir ses bas, comprendre ce qui les différencie et trouver une paire que l’on a envie de porter.</p><p>Nous proposons aujourd’hui des modèles de marques partenaires. Nous ne fabriquons pas ces bas ; les commandes sont expédiées par notre fournisseur.</p><a href="/boutique">Voir les bas</a>'],
  ['/faq','Questions sur les bas et les commandes','Tailles, maintien, paiement et livraison : les réponses pour préparer votre commande.','<h2>Comment choisir la taille de mes bas ?</h2><p>Les correspondances changent selon le fabricant et le modèle. Consultez les variantes de la fiche et le <a href="/guide-des-tailles">guide des tailles par marque</a>.</p><h2>Quels sont les frais de livraison ?</h2><p>La livraison standard est offerte en France métropolitaine. Le point Pickup peut être choisi lorsque la recherche de relais est disponible. Chronopost est payant, sur demande.</p><a href="/livraison-retours">Livraison et retours</a><h2>Où retrouver ma commande ?</h2><p>Conservez votre lien privé de confirmation. Le suivi du colis apparaît lorsque son numéro a été renseigné après expédition.</p>'],
  ['/guide-des-tailles','Guide des tailles par marque','Prenez vos mesures en centimètres et consultez les repères disponibles pour Cottelli, Daring Intimates et Ohyeah.','<p>Pour des bas, relevez votre hauteur, le tour de cuisse et la hauteur talon–jarretière. Les correspondances dépendent du modèle ; les tailles uniques ne conviennent pas à toutes les morphologies.</p>'],
  ['/livraison-retours','Livraison et retours','Livraison standard offerte à domicile et en Pickup en France métropolitaine.','<p>Délai indicatif : 3 à 5 jours ouvrés. Chronopost payant sur demande, tarif et délai à confirmer avant commande.</p><p>Rétractation : 14 jours. Délai commercial de retour : 30 jours sous conditions. Contact : contact@lamaisondesdessous.fr.</p>'],
  ['/', 'Bas pour femme : autofixants, voile et résille','Une maison entièrement dédiée aux bas pour femme.',list(products)],
  ['/boutique','Tous nos bas','Découvrez notre sélection de bas pour femme.',list(products)],
  ['/bas-autofixants','Bas autofixants','Des bas à jarretière siliconée pour un port sans porte-jarretelles.',list(products.filter(p=>p.category==='autofixants'))],
  ['/bas-porte-jarretelles','Bas pour porte-jarretelles','Des bas à fixer aux attaches d’un porte-jarretelles, non fourni.',list(products.filter(p=>p.category==='porte-jarretelles'))],
  ['/guide-des-bas','Bien choisir ses bas','Maintien, taille et deniers : les repères pour choisir vos bas.', '<h2>Autofixants ou porte-jarretelles ?</h2><p>Les autofixants possèdent une bande de silicone. Les autres bas nécessitent des attaches.</p><h2>La taille</h2><p>Consultez les correspondances du fabricant. Une taille unique ne convient pas à toutes les morphologies.</p>'],
  ...products.map(p=>[`/produit/${p.slug}`,p.name,p.description,`<img src="${esc(p.images[0])}" alt="${esc(p.name)}" width="300"><p>Composition : ${esc(p.composition)}</p><p>Marque : ${esc(p.brand)}</p><p>Tailles : ${p.variants.map(v=>esc(v.size)).join(', ')}</p><p>À partir de ${(Math.min(...p.variants.map(v=>v.priceCents))/100).toFixed(2)} € — Livraison standard offerte à domicile et en Pickup.</p>`])
];
await mkdir(path.join(out,'seo'),{recursive:true});
for(const [url,title,description,body] of pages){
  const head=`<title>${esc(title)} | La Maison des Dessous</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="https://lamaisondesdessous.fr${url}">`;
  const html=template.replace(/<title>[\s\S]*?<\/title>/i,'').replace(/<meta\s+name="description"[^>]*>/gi,'').replace('</head>',head+'</head>').replace('<div id="root"></div>',`<div id="root">${navigation}<main><h1>${esc(title)}</h1><p>${esc(description)}</p>${body}</main></div>`);
  await writeFile(path.join(out,'seo',encodeURIComponent(url)+'.html'),html);
  if(url==='/') await writeFile(path.join(out,'index.html'),html);
}
const urls=[...pages.map(p=>p[0]),'/blog','/cgv'];
await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>`<url><loc>https://lamaisondesdessous.fr${u}</loc></url>`).join('')+'</urlset>');
console.log(`Generated ${pages.length} indexable HTML pages and sitemap.`);
