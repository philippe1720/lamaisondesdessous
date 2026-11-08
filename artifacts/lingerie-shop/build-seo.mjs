import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'vite';
import { pathToFileURL } from 'node:url';
const root=path.dirname(new URL(import.meta.url).pathname);
const {products}=JSON.parse(await readFile(path.join(root,'src/data/catalog.json'),'utf8'));
const editorial=JSON.parse(await readFile(path.join(root,'src/data/editorial.json'),'utf8'));
const upcoming=JSON.parse(await readFile(path.join(root,'src/data/matterhorn-preview.json'),'utf8')).products;
const out=path.join(root,'dist/public');
const template=(await readFile(path.join(out,'index.html'),'utf8'))
  .replace(/<title>[\s\S]*?<\/title>/gi,'')
  .replace(/<meta\b[^>]*(?:name=["'](?:description|robots|twitter:[^"']+)["']|property=["']og:[^"']+["'])[^>]*>/gi,'')
  .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const navigation='<nav aria-label="Les collections de bas pour femme"><a href="/">Accueil</a> · <a href="/boutique">Tous les bas pour femme</a> · <a href="/bas-autofixants">Bas autofixants</a> · <a href="/bas-porte-jarretelles">Bas pour porte-jarretelles</a> · <a href="/bas-resille">Bas résille femme</a> · <a href="/guide-des-bas">Comment choisir ses bas</a></nav>';
const list=items=>'<ul>'+items.map(p=>`<li><a href="/produit/${p.slug}">${esc(p.name)}</a><p>${esc(p.description)}</p></li>`).join('')+'</ul>';
const related=links=>'<ul>'+links.map(l=>`<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')+'</ul>';
const blocks=entry=>entry.sections.map(s=>`<section><h2>${esc(s.title)}</h2>${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join('')+'<nav aria-label="Pour poursuivre votre lecture"><h2>Pour vous aider à choisir</h2>'+related(entry.links)+'</nav>';
const guideLinks=()=>'<h2>Nos conseils pour choisir et porter vos bas</h2>'+related(editorial.guides.map(g=>({href:g.path,label:g.title})));
const inCategory=(p,url)=>url==='/bas-resille'?p.details.Aspect==='Résille ajourée':p.category===(url==='/bas-autofixants'?'autofixants':'porte-jarretelles');
const manifesto='<section><h2>La femme est l’avenir de la femme.</h2><p>Une féminité libre, quotidienne, sensuelle quand vous le souhaitez et simplement vous-même le reste du temps. La Maison des Dessous ne vous transforme pas : elle vous accompagne.</p><a href="/qui-sommes-nous">Découvrir l’esprit de la Maison</a></section>';
const pages=[
  ['/qui-sommes-nous','Habiller les jambes féminines au quotidien','La Maison des Dessous accompagne les femmes dans tous leurs moments : bas de lingerie, collants et chaussettes, à leur façon.',manifesto+'<h2>Les jambes, jusque dans le détail.</h2><p>Une couture derrière la jambe, un voile léger, une jarretière en dentelle : les bas changent une tenue avec peu de chose.</p><h2>Pour toutes ses journées.</h2><p>Nous imaginons une adresse attentive aux jambes féminines : bas pour un rendez-vous, collants pour les journées bien remplies, chaussettes pour les moments à soi. Nos bas sont déjà en boutique ; les collants et chaussettes sont en préparation.</p><h2>Notre rôle, votre liberté de choisir.</h2><p>Nous sélectionnons des articles de marques partenaires pour leurs caractéristiques et leur style. Nous sommes votre interlocuteur pour le choix, les tailles, votre commande et son suivi.</p><a href="/boutique">Voir les bas</a>'],
  ['/faq','Questions sur les bas et les commandes','Tailles, maintien, paiement et livraison : les réponses pour préparer votre commande.','<h2>Comment choisir la taille de mes bas ?</h2><p>Les correspondances changent selon le fabricant et le modèle. Consultez les variantes de la fiche et le <a href="/guide-des-tailles">guide des tailles par marque</a>.</p><h2>Quels sont les frais de livraison ?</h2><p>La livraison standard est offerte en France métropolitaine. Le point Pickup peut être choisi lorsque la recherche de relais est disponible. Chronopost est payant, sur demande.</p><a href="/livraison-retours">Livraison et retours</a><h2>Où retrouver ma commande ?</h2><p>Conservez votre lien privé de confirmation. Le suivi du colis apparaît lorsque son numéro a été renseigné après expédition.</p>'],
  ['/guide-des-tailles','Guide des tailles par marque','Prenez vos mesures en centimètres et consultez les repères disponibles pour Cottelli, Daring Intimates et Ohyeah.','<p>Pour des bas, relevez votre hauteur, le tour de cuisse et la hauteur talon–jarretière. Les correspondances dépendent du modèle ; les tailles uniques ne conviennent pas à toutes les morphologies.</p>'],
  ['/livraison-retours','Livraison et retours','Livraison standard offerte à domicile en France métropolitaine.','<p>Délai indicatif : 3 à 5 jours ouvrés. Chronopost payant sur demande, tarif et délai à confirmer avant commande.</p><p>Rétractation : 14 jours. Délai commercial de retour : 30 jours sous conditions. Contact : contact@lamaisondesdessous.fr.</p>'],
  ['/', 'Bas pour femme, collants et chaussettes',
    'La Maison des Dessous accompagne votre féminité : bas autofixants, résille et porte-jarretelles en boutique ; collants et chaussettes à découvrir bientôt. Livraison standard incluse dans les prix des bas.',
    '<p>Un style pour chaque moment. Toujours vous. Nos bas de lingerie pour vos rendez-vous, vos journées et les moments que vous choisissez.</p>'+
    '<h2>Choisissez votre catégorie.</h2><ul>'+
    '<li><a href="/bas-autofixants">Bas autofixants — en boutique</a>, avec jarretière siliconée, sans attaches.</li>'+
    '<li><a href="/bas-porte-jarretelles">Bas pour porte-jarretelles — en boutique</a>, à fixer avec des attaches.</li>'+
    '<li><a href="/bas-resille">Bas résille — en boutique</a>, maille ajourée, maintien détaillé par modèle.</li>'+
    '<li><a href="/collants-femme">Collants pour femme — sélection en préparation, non commandable</a>.</li>'+
    '<li><a href="/chaussettes-femme">Chaussettes pour femme — sélection en préparation, non commandable</a>.</li></ul>'+
    '<h2>Autofixants ou porte-jarretelles ?</h2>'+
    '<p>Pour comparer les deux maintiens, consultez <a href="/guide-des-bas">notre guide des bas</a>.</p>'+
    '<p><a href="/bas-autofixants">Les bas autofixants, sans attaches</a> · <a href="/bas-porte-jarretelles">Les bas pour porte-jarretelles, avec attaches</a> · <a href="/bas-resille">Les bas résille femme</a>.</p>'+
    '<h2>Les bas en boutique</h2>'+list(products.filter(p=>p.variants.some(v=>v.stock>0)).slice(0,3))+
    '<h2>Choisir en confiance</h2><p><a href="/guide-des-tailles">Conseils tailles</a> · <a href="/livraison-retours">Livraison et retours</a> · <a href="mailto:contact@lamaisondesdessous.fr">Nous contacter</a>.</p>'+
    manifesto+guideLinks()],
  ['/boutique','Bas pour femme : voile, dentelle et résille','Découvrez nos bas de lingerie pour femme : modèles autofixants noirs ou beiges, résille et bas pour porte-jarretelles. Tailles et finitions détaillées.',list(products)],
  ...editorial.categories.map(c=>[c.path,c.title,c.description,`<p>${esc(c.intro)}</p>${list(products.filter(p=>inCategory(p,c.path)))}${blocks(c)}`]),
  ...editorial.guides.map(g=>[g.path,g.title,g.description,`<p>${esc(g.intro)}</p>${blocks(g)}${guideLinks()}`]),
  ['/guide-des-bas','Comment choisir ses bas pour femme','Autofixants ou porte-jarretelles, taille et deniers : nos repères pour choisir vos bas.', '<h2>Autofixants ou porte-jarretelles ?</h2><p>Les autofixants possèdent une bande de silicone. Les autres bas nécessitent des attaches.</p><h2>La taille</h2><p>Consultez les correspondances du fabricant. Une taille unique ne convient pas à toutes les morphologies.</p><p><a href="/bas-resille">Comparer les bas résille femme</a> · <a href="/conseils/comment-porter-bas-resille">Conseils pour porter des bas résille</a></p>'+guideLinks()],
  ...products.map(p=>[`/produit/${p.slug}`,p.name,p.description,`<img src="${esc(p.images[0])}" alt="${esc(p.name)}" width="300"><p>Composition : ${esc(p.composition)}</p><p>Marque : ${esc(p.brand)}</p><p>Tailles : ${p.variants.map(v=>esc(v.size)).join(', ')}</p><p>À partir de ${(Math.min(...p.variants.map(v=>v.priceCents))/100).toFixed(2)} € — Livraison standard offerte à domicile.</p>${editorial.products[p.id] ? blocks(editorial.products[p.id]) : ''}<h2>Comparer avec d'autres bas pour femme</h2><ul>${products.filter(other=>other.id!==p.id && (other.category===p.category || (other.details.Aspect==="Résille ajourée" && p.details.Aspect==="Résille ajourée"))).slice(0,3).map(other=>`<li><a href="/produit/${other.slug}">${esc(other.name)}</a></li>`).join("")}</ul><p><a href="${p.details.Aspect==="Résille ajourée"?"/bas-resille":p.category==="autofixants"?"/bas-autofixants":"/bas-porte-jarretelles"}">Retrouver la collection correspondante</a> · <a href="/conseils/comment-porter-bas-resille">Comment porter des bas résille ?</a></p><h2>Les détails du modèle</h2><dl>${Object.entries(p.details).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><p><a href="/guide-des-tailles">Guide des tailles par marque</a> · <a href="/livraison-retours">Livraison et retours</a></p>`])
];
// Préviews éditoriales non vendables : HTTP 200 pour les liens directs,
// mais ni Offer/Product marchand, ni inclusion sitemap, ni indexation Google.
const upcomingPath=p=>`/${p.category}-femme/${p.slug}`;
const upcomingCollections=[
  ['/collants-femme','Collants pour femme — coton, opaques et fantaisie',
    'Collants femme opaques en coton, modèles beiges, finition dentelle et motifs à pois, chevrons ou géométriques.',
    'Une robe pour le bureau, une promenade ou un dîner : nos modèles de collants accompagnent chaque instant, à votre façon.'],
  ['/chaussettes-femme','Chaussettes pour femme — coton, fantaisie et modèles longs',
    'Chaussettes femme en coton, socquettes à motifs, modèles fins fantaisie et chaussettes longues en différentes couleurs.',
    'Les petits détails racontent aussi votre style : chaussettes en coton, motifs, modèles longs et coloris du quotidien.']
];
const previewPages=[
  ...upcomingCollections.map(([url,title,description,intro])=>{
    const category=url==='/collants-femme'?'collants':'chaussettes';
    const entries=upcoming.filter(p=>p.category===category);
    const links='<ul>'+entries.map(p=>`<li><a href="${esc(upcomingPath(p))}">${esc(p.name)}</a> — ${esc(p.color)}</li>`).join('')+'</ul>';
    return [url,title,description,`<p>${esc(intro)}</p><p>Notre sélection est en préparation, les produits ne sont pas encore commandables.</p>${links}`];
  }),
  ...upcoming.map(p=>[upcomingPath(p),p.name,p.seoDescription,
    `<img src="${esc(p.images[0])}" alt="${esc(p.name)}" width="300" height="400"><h2>Une histoire à porter</h2>`+
    p.description.split('\n\n').map(par=>`<p>${esc(par)}</p>`).join('')+
    `<h2>Les détails de ce modèle</h2><p>Composition : ${esc(p.composition)}. Coloris : ${esc(p.color)}.</p>`+
    `<p>Tailles de cette sélection : ${p.variants.map(v=>esc(v.size)).join(', ')}.</p>`+
    `<p>Ce modèle est en préparation et n'est pas disponible à la commande.</p>`+
    `<p><a href="/${p.category}-femme">Découvrir la collection</a></p>`
  ])
];
const previewUrls=new Set(previewPages.map(entry=>entry[0]));
await mkdir(path.join(out,'seo'),{recursive:true});
for(const [url,title,description,body] of [...pages,...previewPages]){
  const preview=previewUrls.has(url);
  const product=products.find(p=>url===`/produit/${p.slug}`);
  // Only structured attributes that are true for a snapshot of this catalog are used.
  // Real-time supplier stock is not included in static markup because it may change.
  const offer=product?{
    '@type':'Offer',
    url:'https://lamaisondesdessous.fr/produit/'+product.slug,
    price:(Math.min(...product.variants.map(v=>v.priceCents))/100).toFixed(2),
    priceCurrency:'EUR',
    itemCondition:'https://schema.org/NewCondition'
  }:null;
  const productSchema=product?'<script data-seo-prerender="true" type="application/ld+json">'+JSON.stringify({
    '@context':'https://schema.org','@type':'Product',
    name:product.name,
    image:product.images.map(src=>new URL(src,'https://lamaisondesdessous.fr').href),
    description:product.description,
    brand:{'@type':'Brand',name:product.brand},sku:product.id,
    offers:offer
  }).replace(/</g,'\\u003c')+'</script>':'';
  // Structured breadcrumbs for collections, guides and product pages.
  const crumb=url.startsWith('/conseils/')
    ? [{name:'Accueil',url:'/'},{name:'Guide des bas',url:'/guide-des-bas'},{name:title,url}]
    : url.startsWith('/produit/')
    ? [{name:'Accueil',url:'/'},{name:'Tous nos bas',url:'/boutique'},
       {name:product?.category==='autofixants'?'Bas autofixants':'Bas pour porte-jarretelles',
        url:product?.category==='autofixants'?'/bas-autofixants':'/bas-porte-jarretelles'},
       {name:title,url}]
    : ['/bas-resille','/bas-autofixants','/bas-porte-jarretelles'].includes(url)
    ? [{name:'Accueil',url:'/'},{name:'Tous nos bas',url:'/boutique'},{name:title,url}]
    : [];
  const breadcrumbSchema=crumb.length
    ? '<script data-seo-prerender="true" type="application/ld+json">'+
      JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',
        itemListElement:crumb.map((c,i)=>({'@type':'ListItem',position:i+1,
          name:c.name,item:'https://lamaisondesdessous.fr'+c.url}))})
        .replace(/</g,'\\u003c')+'</script>'
    : '';
  const socialImage=product
    ? new URL(product.images[0],'https://lamaisondesdessous.fr').href
    : 'https://lamaisondesdessous.fr/opengraph.jpg';
  const socialMeta='<meta data-seo-prerender="true" property="og:type" content="'+
    (url.startsWith('/conseils/')?'article':product?'product':'website')+'">'+
    '<meta data-seo-prerender="true" property="og:title" content="'+esc(title)+' | La Maison des Dessous">'+
    '<meta data-seo-prerender="true" property="og:description" content="'+esc(description)+'">'+
    '<meta data-seo-prerender="true" property="og:url" content="https://lamaisondesdessous.fr'+url+'">'+
    '<meta data-seo-prerender="true" property="og:image" content="'+esc(socialImage)+'">'+
    '<meta data-seo-prerender="true" name="twitter:card" content="summary_large_image">';
  const head=`${productSchema}${breadcrumbSchema}${socialMeta}<meta data-seo-prerender="true" name="robots" content="${preview?'noindex, follow':'index, follow'}"><title data-seo-prerender="true">${esc(title)} | La Maison des Dessous</title><meta data-seo-prerender="true" name="description" content="${esc(description)}"><link data-seo-prerender="true" rel="canonical" href="https://lamaisondesdessous.fr${url}">`;
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
const urls=[...new Set([...pages.map(p=>p[0]),...rendered.map(p=>p.url)])];
await writeFile(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(u=>`<url><loc>https://lamaisondesdessous.fr${u}</loc></url>`).join('')+'</urlset>');
console.log(`Generated ${urls.length} indexable HTML pages, ${previewPages.length} non-indexable previews and sitemap.`);
