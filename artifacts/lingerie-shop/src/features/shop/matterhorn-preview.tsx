import { Link, useLocation, useRoute } from 'wouter';
import { useEffect, useState } from 'react';
import selectionData from '@/data/matterhorn-preview.json';
import { SEO } from '@/lib/seo';

/**
 * Données fournisseur conservées pour usage interne : option_id, marque,
 * EAN vérifiés, images originales non retouchées. Jamais de vente fictive.
 * Le contenu public met en avant La Maison des Dessous et ses sélections,
 * sans exposer l'identité du grossiste.
 */
const products = selectionData.products;
type PreviewProduct = (typeof products)[number];
const productUrl = (p: PreviewProduct) => `/${p.category}-femme/${p.slug}`;
const mainMaterial = (p: PreviewProduct) => p.composition.split(',')[0].replace(/^\d+\s*%\s*/, '').trim();

const collectionCopy = {
  collants: {
    title: 'Collants pour femme — coton, opaques et fantaisie',
    intro: 'Une robe pour travailler, une promenade ou un dîner improvisé : il existe mille façons de choisir ses collants. Découvrez des pièces aux prénoms féminins, avec leurs particularités, leurs matières et les histoires que vous leur donnerez.',
    seo: 'Collants pour femme : collants noirs opaques en coton, collants beiges, dentelle à la taille, motifs à pois et chevrons 60 deniers.',
    url: '/collants-femme'
  },
  chaussettes: {
    title: 'Chaussettes pour femme — coton, fantaisie et modèles longs',
    intro: 'Les petits détails du quotidien racontent aussi notre style. Des chaussettes riches en coton aux motifs ourson, léopard ou pois, découvrez des modèles féminins sélectionnés pour leurs couleurs, leurs formes et leur caractère.',
    seo: 'Chaussettes femme en coton, socquettes à motifs, chaussettes fines fantaisie et modèles longs, noirs, beiges ou blancs.',
    url: '/chaussettes-femme'
  }
} as const;

export function MatterhornCollection() {
  const [path] = useLocation();
  const kind = path === '/collants-femme' ? 'collants' : 'chaussettes';
  const copy = collectionCopy[kind];
  const [color, setColor] = useState('');
  const [material, setMaterial] = useState('');
  const [size, setSize] = useState('');
  useEffect(() => { setColor(''); setMaterial(''); setSize(''); }, [path]);
  const categoryProducts = products.filter(p => p.category === kind);
  const colors = [...new Set(categoryProducts.map(p => p.color))].sort();
  const materials = [...new Set(categoryProducts.map(mainMaterial))].sort();
  const sizes = [...new Set(categoryProducts.flatMap(p => p.variants.map(v => v.size)))].sort();
  const visible = categoryProducts.filter(p =>
    (!color || p.color === color) &&
    (!material || mainMaterial(p) === material) &&
    (!size || p.variants.some(v => v.size === size))
  );

  return <><SEO title={copy.title} description={copy.seo} noindex />
    <main className="stocking-page">
      <nav className="stocking-note" aria-label="Fil d'Ariane"><Link href="/">Accueil</Link> · <Link href="/boutique">Boutique</Link> · {kind === 'collants' ? 'Collants' : 'Chaussettes'}</nav>
      <p className="stocking-eyebrow">LA MAISON DES DESSOUS · POUR VOS JAMBES, À VOTRE FAÇON</p>
      <h1>{copy.title}</h1>
      <p className="stocking-intro">{copy.intro}</p>
      <p className="stocking-note" role="status">Notre sélection se prépare : ces modèles ne sont pas encore proposés à la vente. Nous vous présenterons les prix, tailles disponibles et conditions de livraison lors de leur ouverture à la commande.</p>
      <nav className="stocking-filters" aria-label="Nos collections">
        <Link href="/bas-autofixants">Bas autofixants</Link>
        <Link href="/bas-porte-jarretelles">Bas pour porte-jarretelles</Link>
        <Link href="/bas-resille">Bas résille</Link>
        <Link href="/collants-femme">Collants</Link>
        <Link href="/chaussettes-femme">Chaussettes</Link>
      </nav>
      <div className="stocking-filters" aria-label="Filtrer les modèles présentés">
        <label className="stocking-select">Couleur
          <select value={color} onChange={e => setColor(e.target.value)}>
            <option value="">Toutes les couleurs</option>{colors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="stocking-select">Matière principale
          <select value={material} onChange={e => setMaterial(e.target.value)}>
            <option value="">Toutes les matières</option>{materials.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <label className="stocking-select">Taille
          <select value={size} onChange={e => setSize(e.target.value)}>
            <option value="">Toutes les tailles</option>{sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <p className="stocking-note" role="status">{visible.length} modèle{visible.length > 1 ? 's' : ''} à découvrir dans notre sélection à venir.</p>
      <div className="stocking-grid">
        {visible.map(p => <article className="stocking-card" key={p.id}>
          <Link href={productUrl(p)}>
            <div className="stocking-picture"><img loading="lazy" width="600" height="800" src={p.images[0]} alt={p.name} /></div>
            <p className="stocking-eyebrow">LA SÉLECTION DE LA MAISON</p>
            <h2>{p.name}</h2>
            <p>{p.description.split('\n\n')[0]}</p>
            <small>{p.color} · Tailles présentées : {p.variants.map(v => v.size).join(', ')}</small>
          </Link>
          <Link className="stocking-button secondary" href={productUrl(p)}>Découvrir son histoire →</Link>
        </article>)}
      </div>
      <p className="stocking-note">Vous hésitez sur les tailles ou les styles ? <Link href="/guide-des-tailles">Consultez nos conseils de tailles</Link> et <Link href="/guide-des-bas">notre guide des bas</Link>.</p>
    </main>
  </>;
}

export function MatterhornPreviewProduct() {
  const [, tightsParams] = useRoute('/collants-femme/:slug');
  const [, socksParams] = useRoute('/chaussettes-femme/:slug');
  const [photoIndex, setPhotoIndex] = useState(0);
  const slug = tightsParams?.slug || socksParams?.slug;
  const kind = tightsParams ? 'collants' : 'chaussettes';
  const p = products.find(item => item.slug === slug && item.category === kind);
  if (!p) return <main className="stocking-page"><SEO title="Modèle introuvable" noindex/><h1>Modèle introuvable</h1><Link href="/boutique">Retour à la boutique</Link></main>;
  const collection = collectionCopy[p.category as keyof typeof collectionCopy];
  return <><SEO title={p.name} description={p.seoDescription} noindex />
    <main className="stocking-page">
      <nav className="stocking-note" aria-label="Fil d'Ariane"><Link href="/">Accueil</Link> · <Link href={collection.url}>{collection.title}</Link> · {p.name}</nav>
      <p className="stocking-eyebrow">LA MAISON DES DESSOUS · UNE HISTOIRE À PORTER</p>
      <h1>{p.name}</h1>
      <div className="stocking-product">
        <section>
          <div className="stocking-picture"><a href={p.images[photoIndex] || p.images[0]} target="_blank" rel="noreferrer" aria-label="Agrandir la photographie du modèle dans un nouvel onglet"><img src={p.images[photoIndex] || p.images[0]} width="600" height="800" alt={p.name + ', vue ' + (photoIndex + 1)}/></a></div>
          {p.images.length > 1 && <div className="stocking-thumbs">{p.images.map((src, i) => <button type="button" key={src} onClick={() => setPhotoIndex(i)} aria-label={'Afficher la vue ' + (i + 1)} aria-pressed={photoIndex === i}><img src={src} alt="" loading="lazy"/></button>)}</div>}
          <p className="stocking-note">Découvrez les détails de ce modèle à travers ses différentes vues.</p>
        </section>
        <section>
          <h2>Une histoire à porter</h2>
          <div className="lmd-product-story">{p.description.split('\n\n').map((paragraph, i) => <p className="stocking-intro" key={i}>{paragraph}</p>)}</div>
          <h2>Les détails de ce modèle</h2>
          <dl className="stocking-specs">
            <div><dt>Matière</dt><dd>{p.composition}</dd></div>
            <div><dt>Coloris</dt><dd>{p.color}</dd></div>
            <div><dt>Tailles proposées dans cette sélection</dt><dd>{p.variants.map(v => v.size).join(' · ')}</dd></div>
          </dl>
          <p className="stocking-note" role="status">Collection en préparation. Ce modèle n'est pas encore disponible à la commande. Son prix, sa disponibilité réelle et les conditions de livraison seront précisés avant l'ouverture des ventes.</p>
          <p>Découvrez <Link href={collection.url}>les autres modèles de cette collection</Link> et <Link href="/guide-des-tailles">notre guide des tailles</Link>.</p>
          <h2>À découvrir dans le même univers</h2>
          <ul>{products.filter(other => other.id !== p.id && other.category === p.category).slice(0, 3).map(other => <li key={other.id}><Link href={productUrl(other)}>{other.name}</Link></li>)}</ul>
        </section>
      </div>
    </main>
  </>;
}
