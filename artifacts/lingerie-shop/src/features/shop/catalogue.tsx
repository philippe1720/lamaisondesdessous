import { Link, useLocation, useRoute } from 'wouter';
import { useState } from 'react';
import { SEO } from '@/lib/seo';
import { useShop, money, type Product } from './cart';

export function ProductCard({ product }: { product: Product }) {
  const price = Math.min(...product.variants.map(v => v.priceCents));
  return <article className="stocking-card"><Link href={`/produit/${product.slug}`}>
    <div className="stocking-picture"><img src={product.images[0]} alt={product.name} loading="lazy" width="600" height="800" /></div>
    <p className="stocking-eyebrow">{product.brand}</p><h2>{product.name}</h2><p>{money(price)}</p><small>Livraison Pickup offerte</small>
  </Link></article>;
}
export function Catalogue() {
  const { products } = useShop(); const [location] = useLocation();
  const [color, setColor] = useState('');
  const category = location === '/bas-autofixants' ? 'autofixants' : location === '/bas-porte-jarretelles' ? 'porte-jarretelles' : '';
  const filtered = products.filter(p => !category || p.category === category);
  const colors = [...new Set(filtered.flatMap(p => p.variants.map(v => v.color)).filter(Boolean))];
  const title = category === 'autofixants' ? 'Les bas autofixants' : category ? 'Les bas pour porte-jarretelles' : 'Tous nos bas';
  return <><SEO title={title} canonical={location} description="Découvrez notre sélection de bas en voile et en résille : autofixants ou à porter avec un porte-jarretelles. Livraison Pickup offerte." />
    <main className="stocking-page"><p className="stocking-eyebrow">LA MAISON DES DESSOUS · LE SENS DU DÉTAIL</p><h1>{title}</h1>
      <p className="stocking-intro">{category === 'autofixants' ? 'Une jarretière siliconée pour porter vos bas sans attaches. Voile délicat ou résille, trouvez votre finition.' : category ? 'Des bas conçus pour se fixer à un porte-jarretelles. Celui-ci est vendu séparément et n’est pas inclus dans notre sélection.' : 'Le voile, la résille, la dentelle. Une sélection entièrement consacrée aux bas pour femme.'}</p>
      <nav className="stocking-filters" aria-label="Collections"><Link href="/boutique">Tous les bas</Link><Link href="/bas-autofixants">Autofixants</Link><Link href="/bas-porte-jarretelles">Pour porte-jarretelles</Link></nav>
      <label className="stocking-select">Couleur <select value={color} onChange={e=>setColor(e.target.value)}><option value="">Toutes</option>{colors.map(c=><option key={c}>{c}</option>)}</select></label>
      <div className="stocking-grid">{filtered.filter(p=>!color || p.variants.some(v=>v.color===color)).map(p=><ProductCard key={p.id} product={p}/>)}</div>
      <p className="stocking-note">Vous hésitez ? <Link href="/guide-des-bas">Consultez notre guide des bas.</Link></p>
    </main></>;
}
export function ProductPage() {
  const [, params] = useRoute('/produit/:slug'); const { products, add } = useShop();
  const product = products.find(p=>p.slug===params?.slug);
  const [ean,setEan] = useState(''); const [photo,setPhoto] = useState(0); const [added,setAdded] = useState(false);
  if (!product) return <main className="stocking-page"><SEO title="Produit introuvable"><meta name="robots" content="noindex"/></SEO><h1>Produit introuvable</h1><Link href="/boutique">Retour aux bas</Link></main>;
  const variant = product.variants.find(v=>v.ean===ean);
  const price = variant?.priceCents ?? Math.min(...product.variants.map(v=>v.priceCents));
  return <><SEO title={product.name} description={product.description} canonical={`/produit/${product.slug}`} image={product.images[0]} type="product">
    <script type="application/ld+json">{JSON.stringify({'@context':'https://schema.org','@type':'Product',name:product.name,image:product.images,description:product.description,brand:{'@type':'Brand',name:product.brand},sku:product.id})}</script>
  </SEO><main className="stocking-page"><Link href="/boutique">← Tous les bas</Link><div className="stocking-product">
    <section><div className="stocking-picture"><img src={product.images[photo] || product.images[0]} alt={product.name}/></div><div className="stocking-thumbs">{product.images.map((src,i)=><button key={src} aria-label={`Photo ${i+1}`} onClick={()=>setPhoto(i)}><img src={src} alt=""/></button>)}</div></section>
    <section><p className="stocking-eyebrow">{product.brand} · {product.category==='autofixants'?'AUTOFIXANTS':'POUR PORTE-JARRETELLES'}</p><h1>{product.name}</h1><p className="stocking-price">{money(price)}</p><p>Livraison Pickup offerte en France métropolitaine</p><p className="stocking-intro">{product.description}</p>
      <fieldset><legend>Choisissez votre taille</legend><div className="stocking-sizes">{product.variants.map(v=><button key={v.ean} disabled={v.stock<1} aria-pressed={ean===v.ean} onClick={()=>{setEan(v.ean);setAdded(false);}}>{v.size}{v.color ? ` · ${v.color}` : ''}{v.stock<1?' — indisponible':''}</button>)}</div></fieldset>
      <Link href="/guide-des-bas">Un doute sur la taille ?</Link>
      <button className="stocking-button" disabled={!variant || variant.stock<1} onClick={()=>{if(variant){add(variant.ean);setAdded(true);}}}>Ajouter au panier</button>
      <p role="status">{added && <>Ajouté à votre panier. <Link href="/panier">Voir mon panier →</Link></>}</p>
      <div className="stocking-details"><h2>La matière</h2><p>{product.composition}</p><h2>Le maintien</h2><p>{product.category==='autofixants'?'Jarretière avec silicone. À porter sur une peau propre et sèche, sans crème sous la bande.':'À fixer à un porte-jarretelles, non fourni.'}</p><h2>Prendre soin de vos bas</h2><p>Enfilez-les délicatement, sans tirer sur la dentelle. Pour le lavage, suivez les indications de l’étiquette du fabricant.</p><h2>La livraison</h2><p>Pickup offert. Domicile : supplément de 2,58 €. Express : sur demande, après confirmation de disponibilité et du délai.</p></div>
    </section></div></main></>;
}
