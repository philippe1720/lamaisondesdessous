import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { pathToFileURL } from 'node:url';
const root=path.dirname(new URL(import.meta.url).pathname);
const {products}=JSON.parse(await readFile(path.join(root,'src/data/catalog.json'),'utf8'));
const editorial=JSON.parse(await readFile(path.join(root,'src/data/editorial.json'),'utf8'));
const out=path.join(root,'dist/public');
const template=(await readFile(path.join(out,'index.html'),'utf8'))
  .replace(/<title>[\s\S]*?<\/title>/gi,'')
  .replace(/<meta\b[^>]*(?:name=["'](?:description|robots|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi,'')
  .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const navigation='<nav><a href="/">Accueil</a> · <a href="/boutique">Tous les bas</a> · <a href="/bas-autofixants">Autofixants</a> · <a href="/bas-porte-jarretelles">Pour porte-jarretelles</a> · <a href="/bas-resille">Résille</a> · <a href="/guide-des-bas">Guide des bas</a></nav>';
const list=items=>'<ul>'+items.map(p=>`<li><a href="/produit/${p.slug}">${esc(p.name)}</a><p>${esc(p.description)}</p></li>`).join('')+'</ul>';
const related=links=>'<ul>'+links.map(l=>`<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')+'</ul>';
const blocks=entry=>entry.sections.map(s=>`<section><h2>${esc(s.title)}</h2>${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join('')+'<nav aria-label="Pour poursuivre votre lecture"><h2>Pour vous aider à choisir</h2>'+related(entry.links)+'</nav>';
const guideLinks=()=>'<h2>Nos conseils pour choisir et porter vos bas</h2>'+related(editorial.guides.map(g=>({href:g.path,label:g.title})));
const inCategory=(p,url)=>url==='/bas-resille'?p.details.Aspect==='Résille ajourée':p.category===(url==='/bas-autofixants'?'autofixants':'porte-jarretelles');
const pages=[
  ['/qui-sommes-nous','Une boutique consacrée aux bas pour femme','Philippe présente La Maison des Dessous : une sélection de bas autofixants et pour porte-jarretelles, en voile et en résille.','<h2>Les jambes, jusque dans le détail.</h2><p>Une couture derrière la jambe, un voile léger, une jarretière en dentelle : les bas changent une tenue avec peu de chose. C’est ce détail qui m’a donné envie de leur consacrer une boutique.</p><h2>Pourquoi seulement des bas ?</h2><p>Je m’appelle Philippe. Avec La Maison des Dessous, je souhaite construire une adresse où l’on vient choisir ses bas, comprendre ce qui les différencie et trouver une paire que l’on a envie de porter.</p><p>Nous proposons aujourd’hui des modèles de marques partenaires. Nous ne fabriquons pas ces bas ; les commandes sont expédiées par notre fournisseur.</p><a href="/boutique">Voir les bas</a>'],
  ['/faq','Questions sur les bas et les commandes','Tailles, maintien, paiement et livraison : les réponses pour préparer votre commande.','<h2>Comment choisir la taille de mes bas ?</h2><p>Les correspondances changent selon le fabricant et le modèle. Consultez les variantes de la fiche et le <a href="/guide-des-tailles">guide des tailles par marque</a>.</p><h2>Quels sont les frais de livraison ?</h2><p>La livraison standard est offerte en France métropolitaine. Le point Pickup peut être choisi lorsque la recherche de relais est disponible. Chronopost est payant, sur demande.</p><a href="/livraison-retours">Livraison et retours</a><h2>Où retrouver ma commande ?</h2><p>Conservez votre lien privé de confirmation. Le suivi du colis apparaît lorsque son numéro a été renseigné après expédition.</p>'],
  ['/guide-des-tailles','Guide des tailles par marque','Prenez vos mesures en centimètres et consultez les repères disponibles pour Cottelli, Daring Intimates et Ohyeah.','<p>Pour des bas, relevez votre hauteur, le tour de cuisse et la hauteur talon–jarretière. Les correspondances dépendent du modèle ; les tailles uniques ne conviennent pas à toutes les morphologies.</p>'],
  ['/livraison-retours','Livraison et retours','Livraison standard offerte à domicile et en Pickup en France métropolitaine.','<p>Délai indicatif : 3 à 5 jours ouvrés. Chronopost payant sur demande, tarif et délai à confirmer avant commande.</p><p>Rétractation : 14 jours. Délai commercial de retour : 30 jours sous conditions. Contact : contact@lamaisondesdessous.fr.</p>'],
  ['/', 'Bas pour femme : autofixants, voile et résille','La Maison des Dessous se consacre aux bas pour femme. Découvrez nos bas autofixants et pour porte-jarretelles. Livraison standard offerte à domicile et en Pickup.',list(products)+guideLinks()],
  ['/boutique','Tous nos bas','Découvrez notre sélection de bas pour femme.',list(products)],
  ...editorial.categories.map(c=>[c.path,c.title,c.description,`<p>${esc(c.intro)}</p>${list(products.filter(p=>inCategory(p,c.path)))}${blocks(c)}`]),
  ...editorial.guides.map(g=>[g.path,g.title,g.description,`<p>${esc(g.intro)}</p>${blocks(g)}${guideLinks()}`]),
  ['/guide-des-bas','Bien choisir ses bas','Maintien, taille et deniers : les repères pour choisir vos bas.', '<h2>Autofixants ou porte-jarretelles ?</h2><p>Les autofixants possèdent une bande de silicone. Les autres bas nécessitent des attaches.</p><h2>La taille</h2><p>Consultez les correspondances du fabricant. Une taille unique ne convient pas à toutes les morphologies.</p>'+guideLinks()],
  ...products.map(p=>[`/produit/${p.slug}`,p.name,p.description,`<img src="${esc(p.images[0])}" alt="${esc(p.name)}" width="300"><p>Composition : ${esc(p.composition)}</p><p>Marque : ${esc(p.brand)}</p><p>Tailles : ${p.variants.map(v=>esc(v.size)).join(', ')}</p><p>À partir de ${(Math.min(...p.variants.map(v=>v.priceCents))/100).toFixed(2)} € — Livraison standard offerte à domicile et en Pickup.</p>${blocks(editorial.products[p.id])}<h2>Les détails du modèle</h2><dl>${Object.entries(p.details).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><p><a href="/guide-des-tailles">Guide des tailles par marque</a> · <a href="/livraison-retours">Livraison et retours</a></p>`])
];
await mkdir(path.join(out,'seo'),{recursive:true});
for(const [url,title,description,body] of pages){
  const product=products.find(p=>url===`/produit/${p.slug}`);
  const productSchema=product?'<script data-seo-prerender="true" type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@type':'Product',name:product.name,image:product.images.map(src=>new URL(src,'https://lamaisondesdessous.fr').href),description:product.description,brand:{'@type':'Brand',name:product.brand},sku:product.id}).replace(/</g,'\\u003c')+'</script>':'';
  const head=`${productSchema}<meta data-seo-prerender="true" name="robots" content="index, follow"><title data-seo-prerender="true">${esc(title)} | La Maison des Dessous</title><meta data-seo-prerender="true" name="description" content="${esc(description)}"><link data-seo-prerender="true" rel="canonical" href="https://lamaisondesdessous.fr${url}">`;
  const html=template.replace(/<title>[\s\S]*?<\/title>/i,'').replace(/<meta\s+name="description"[^>]*>/gi,'').replace('</head>',head+'</head>').replace('<div id="root"></div>',`<div id="root">${navigation}<main><h1>${esc(title)}</h1><p>${esc(description)}</p>${body}</main></div>`);
  await writeFile(path.join(out,'seo',encodeURIComponent(url)+'.html'),html);
  if(url==='/') await writeFile(path.join(out,'index.html'),html);
}
// Render existing React pages so crawlers and visitors receive the same content.
await build({configFile:false, root, logLevel:'warn',
  resolve:{alias:{'@':path.join(root,'src')}}, esbuild:{jsx:'automatic'},
  build:{ssr:path.join(root,'seo-render.tsx'),outDir:path.join(root,'dist/seo-render'),
    emptyOutDir:true,rollupOptions:{output:{entryFileNames:'render.mjs'}}}});
const { renderPages }=await import(pathToFileURL(path.join(root,'dist/seo-render/render.mjs')).href);
const rendered=renderPages();
for(const page of rendered){
  await writeFile(path.join(out,'seo',encodeURIComponent(page.url)+'.html'),
    template.replace('</head>',page.head+'</head>').replace('<div id="root"></div>',`<div id="root">${navigation}${page.html}</div>`));
}
const urls=[...pages.map(p=>p[0]),...rendered.map(p=>p.url)];
await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>`<url><loc>https://lamaisondesdessous.fr${u}</loc></url>`).join('')+'</urlset>');
console.log(`Generated ${urls.length} indexable HTML pages and sitemap.`);
