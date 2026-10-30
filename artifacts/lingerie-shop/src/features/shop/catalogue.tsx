import { Link, useLocation, useRoute } from 'wouter';
import { useEffect, useState } from 'react';
import { editorial, EditorialSections } from './editorial';
import { DeliveryNote, SizeHelp } from './services';
import { SEO } from '@/lib/seo';
import { useShop, money, type Product } from './cart';

export function ProductCard({ product }: { product: Product }) {
  const price = Math.min(...product.variants.map(v => v.priceCents));
  return <article className="stocking-card"><Link href={`/produit/${product.slug}`}>
    <div className="stocking-picture"><img src={product.images[0]} alt={product.name} loading="lazy" width="600" height="800" /></div>
    <p className="stocking-eyebrow">{product.brand}</p><h2>{product.name}</h2><p>{money(price)}</p><small>Livraison standard offerte à domicile</small>
  </Link><Link className="stocking-button" href={`/produit/${product.slug}`}>Choisir ma taille →</Link></article>;
}
export function Catalogue() {
  const { products } = useShop(); const [location] = useLocation();
  const [color, setColor] = useState('');
  const category = location === '/bas-autofixants' ? 'autofixants' : location === '/bas-porte-jarretelles' ? 'porte-jarretelles' : '';
  const page=editorial.categories.find(c=>c.path===location);
  const resille=location==='/bas-resille';
  useEffect(()=>setColor(''),[location]);
  const filtered = products.filter(p => resille ? p.details.Aspect==='Résille ajourée' : !category || p.category === category);
  const colors = [...new Set(filtered.flatMap(p => p.variants.map(v => v.color)).filter(Boolean))];
  const title = page?.title || 'Bas pour femme : voile, dentelle et résille';
  return <><SEO title={title} canonical={location} description={page?.description || "Découvrez nos bas de lingerie pour femme : modèles autofixants noirs ou beiges, résille et bas pour porte-jarretelles. Tailles et finitions détaillées."} />
    <main className="stocking-page">
      <nav aria-label="Fil d’Ariane" className="stocking-note"><Link href="/">Accueil</Link> · {page ? <><Link href="/boutique">Tous nos bas</Link> · {page.title}</> : 'Tous nos bas'}</nav>
      <p className="stocking-eyebrow">LA MAISON DES DESSOUS · LE SENS DU DÉTAIL</p><h1>{title}</h1>
      <p className="stocking-intro">{page?.intro || 'Découvrez nos bas de lingerie pour femme : bas autofixants en dentelle, voile 20 deniers et bas résille à porter avec ou sans porte-jarretelles.'}</p>
      <nav className="stocking-filters" aria-label="Collections"><Link href="/boutique">Tous les bas</Link><Link href="/bas-autofixants">Autofixants</Link><Link href="/bas-porte-jarretelles">Pour porte-jarretelles</Link><Link href="/bas-resille">Résille</Link></nav>
      <label className="stocking-select">Couleur <select value={color} onChange={e=>setColor(e.target.value)}><option value="">Toutes</option>{colors.map(c=><option key={c}>{c}</option>)}</select></label>
      <div className="stocking-grid">{filtered.filter(p=>!color || p.variants.some(v=>v.color===color)).map(p=><ProductCard key={p.id} product={p}/>)}</div>
      {page && <EditorialSections sections={page.sections} links={page.links}/>}
      {resille && <p className="stocking-note">Pour choisir entre les modèles noirs et beiges, découvrez <Link href="/conseils/comment-porter-bas-resille">comment porter des bas résille</Link>. Vous pouvez également <Link href="/guide-des-tailles">prendre vos mesures pour choisir une taille</Link>.</p>}
      {!page && <p className="stocking-note">Commencez par <Link href="/bas-autofixants">les bas autofixants noirs en dentelle</Link>, <Link href="/bas-resille">les bas résille pour femme</Link> ou <Link href="/bas-porte-jarretelles">les bas pour porte-jarretelles</Link>, selon le maintien que vous recherchez.</p>}
      <p className="stocking-note">Vous hésitez ? <Link href="/guide-des-bas">Consultez notre guide des bas.</Link></p>
    </main></>;
}
export function ProductPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/produit/:slug'); const { products, add } = useShop();
  const product = products.find(p=>p.slug===params?.slug);
  const [ean,setEan] = useState(''); const [photo,setPhoto] = useState(0); const [added,setAdded] = useState(false);
  if (!product) return <main className="stocking-page"><SEO title="Produit introuvable"><meta name="robots" content="noindex"/></SEO><h1>Produit introuvable</h1><Link href="/boutique">Retour aux bas</Link></main>;
  const copy=editorial.products[product.id as keyof typeof editorial.products];
  const variant = product.variants.find(v=>v.ean===ean);
  const price = variant?.priceCents ?? Math.min(...product.variants.map(v=>v.priceCents));
  const related = products.filter(p => p.id !== product.id && (
    p.category === product.category || (p.details.Aspect === 'Résille ajourée' && product.details.Aspect === 'Résille ajourée')
  )).slice(0,3);
  const productSchema = {
    '@context':'https://schema.org',
    '@type':'Product',
    name:product.name,
    image:product.images.map(src => new URL(src,window.location.origin).href),
    description:product.description,
    brand:{'@type':'Brand',name:product.brand},
    sku:product.id,
    offers:{
      '@type':'Offer',
      url:window.location.origin+'/produit/'+product.slug,
      price:(price/100).toFixed(2),
      priceCurrency:'EUR',
      itemCondition:'https://schema.org/NewCondition'
    }
  };
  return <><SEO title={product.name} description={product.description} canonical={`/produit/${product.slug}`} image={product.images[0]} type="product">
    <script type="application/ld+json">{JSON.stringify(productSchema).replace(/</g,'\\u003c')}</script>
  </SEO><main className="stocking-page">
    <nav aria-label="Fil d’Ariane" className="stocking-note"><Link href="/">Accueil</Link> · <Link href="/boutique">Bas pour femme</Link> · <Link href={product.category==='autofixants'?'/bas-autofixants':'/bas-porte-jarretelles'}>{product.category==='autofixants'?'Bas autofixants':'Bas pour porte-jarretelles'}</Link></nav>
    <div className="stocking-product">
    <section><div className="stocking-picture"><a href={product.images[photo] || product.images[0]} target="_blank" rel="noreferrer" aria-label="Agrandir la photo du produit"><img src={product.images[photo] || product.images[0]} alt={`${product.name} — vue ${photo+1}`}/></a></div><p>Cliquez sur la photo pour l’agrandir.</p><div className="stocking-thumbs">{product.images.map((src,i)=><button key={src} aria-label={`Photo ${i+1}`} onClick={()=>setPhoto(i)}><img src={src} alt=""/></button>)}</div></section>
    <section><p className="stocking-eyebrow">{product.brand} · {product.category==='autofixants'?'AUTOFIXANTS':'POUR PORTE-JARRETELLES'}</p><h1>{product.name}</h1><p className="stocking-price">{money(price)}</p><p>Livraison standard offerte à domicile en France métropolitaine</p><p className="stocking-intro">{product.description}</p>
      <fieldset><legend>Choisissez votre taille</legend><div className="stocking-sizes">{product.variants.map(v=><button key={v.ean} disabled={v.stock<1} aria-pressed={ean===v.ean} onClick={()=>{setEan(v.ean);setAdded(false);}}>{v.size==='TU'?'Taille unique':v.size || 'Taille unique'}{v.color ? ` · ${v.color}` : ''}{v.stock<1?' — indisponible':''}</button>)}</div></fieldset>
      <p className="stocking-size-help">{variant ? `Taille choisie : ${variant.size || 'Taille unique'}` : 'Sélectionnez une taille pour commander.'}</p><a href="#guide-taille">Un doute sur la taille ?</a>
      <button className="stocking-button" disabled={!variant || variant.stock<1} onClick={()=>{if(variant){add(variant.ean);setAdded(true);}}}>Ajouter au panier</button>
      <button className="stocking-button secondary" disabled={!variant || variant.stock<1} onClick={()=>{if(variant){add(variant.ean);navigate('/commande/attention');}}}>Commander maintenant</button>
      <p role="status">{added && <>Ajouté à votre panier. <Link href="/panier">Voir mon panier →</Link></>}</p>
      <div className="stocking-details">{copy && <EditorialSections sections={copy.sections} links={copy.links}/>}<h2>Les détails</h2><dl className="stocking-specs">{Object.entries(product.details).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><h2>La matière</h2><p>{product.composition}</p><h2>Le maintien</h2><p>{product.category==='autofixants'?'Jarretière avec silicone. À porter sur une peau propre et sèche, sans crème sous la bande.':'À fixer à un porte-jarretelles, non fourni.'}</p><h2>Prendre soin de vos bas</h2><p>Enfilez-les délicatement, sans tirer sur la dentelle. Pour le lavage, suivez les indications de l’étiquette du fabricant.</p><DeliveryNote/><div id="guide-taille"><SizeHelp brand={product.brand} reference={product.name}/></div></div>
    </section></div>
    <section className="stocking-editorial" aria-label="Autres bas et conseils">
      <h2>À découvrir dans notre sélection</h2>
      <p>{product.details.Aspect === 'Résille ajourée' ?
        <>Envie de comparer d’autres finitions ? Retrouvez <Link href="/bas-resille">tous les bas résille pour femme</Link>, avec ou sans porte-jarretelles.</> :
        <>Vous cherchez un autre modèle ? Parcourez nos <Link href="/bas-autofixants">bas autofixants pour femme</Link>, en voile ou en dentelle.</>}</p>
      <ul>{related.map(p=><li key={p.id}><Link href={'/produit/'+p.slug}>{p.name}</Link></li>)}</ul>
      <p><Link href="/conseils/comment-porter-bas-resille">Comment porter des bas résille ?</Link> · <Link href="/guide-des-tailles">Guide des tailles</Link></p>
    </section>
    </main></>;
}
