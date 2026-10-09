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
  ['/', 'Bas pour femme : autofixants, voile et résille','Une maison entièrement dédiée aux bas pour femme.',list(products)],
  ['/boutique','Tous nos bas','Découvrez notre sélection de bas pour femme.',list(products)],
  ['/bas-autofixants','Bas autofixants','Des bas à jarretière siliconée pour un port sans porte-jarretelles.',list(products.filter(p=>p.category==='autofixants'))],
  ['/bas-porte-jarretelles','Bas pour porte-jarretelles','Des bas à fixer aux attaches d’un porte-jarretelles, non fourni.',list(products.filter(p=>p.category==='porte-jarretelles'))],
  ['/guide-des-bas','Bien choisir ses bas','Maintien, taille et deniers : les repères pour choisir vos bas.', '<h2>Autofixants ou porte-jarretelles ?</h2><p>Les autofixants possèdent une bande de silicone. Les autres bas nécessitent des attaches.</p><h2>La taille</h2><p>Consultez les correspondances du fabricant. Une taille unique ne convient pas à toutes les morphologies.</p>'],
  ...products.map(p=>[`/produit/${p.slug}`,p.name,p.description,`<img src="${esc(p.images[0])}" alt="${esc(p.name)}" width="300"><p>Composition : ${esc(p.composition)}</p><p>Marque : ${esc(p.brand)}</p><p>Tailles : ${p.variants.map(v=>esc(v.size)).join(', ')}</p><p>À partir de ${(Math.min(...p.variants.map(v=>v.priceCents))/100).toFixed(2)} € — Pickup offert.</p>`])
];
await mkdir(path.join(out,'seo'),{recursive:true});
for(const [url,title,description,body] of pages){
  const head=`<title>${esc(title)} | La Maison des Dessous</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="https://lamaisondesdessous.fr${url}">`;
  const html=template.replace(/<title>[\s\S]*?<\/title>/i,'').replace(/<meta\s+name="description"[^>]*>/gi,'').replace('</head>',head+'</head>').replace('<div id="root"></div>',`<div id="root">${navigation}<main><h1>${esc(title)}</h1><p>${esc(description)}</p>${body}</main></div>`);
  await writeFile(path.join(out,'seo',encodeURIComponent(url)+'.html'),html);
  if(url==='/') await writeFile(path.join(out,'index.html'),html);
}
const urls=[...pages.map(p=>p[0]),'/blog','/faq','/qui-sommes-nous','/cgv'];
await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>`<url><loc>https://lamaisondesdessous.fr${u}</loc></url>`).join('')+'</urlset>');
console.log(`Generated ${pages.length} indexable HTML pages and sitemap.`);
