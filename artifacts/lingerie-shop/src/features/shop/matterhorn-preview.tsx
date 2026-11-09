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
    intro: 'Une robe pour travailler, une promenade ou un dîner improvisé : il existe mille façons de choisir ses collants. Découvrez notre sélection de collants opaques, riches en coton ou à motifs, et laissez chaque détail raconter votre façon de vivre.',
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
      <aside className="lmd-guide-cta" aria-label="Conseil pour choisir votre taille">
        <div><strong>Choisir la bonne taille avant tout.</strong><p>{kind === 'collants'
          ? 'Stature, tour de hanches et lecture des tailles S à XL : toutes les étapes pour vous repérer.'
          : 'Mesurez vos pieds et apprenez à lire les pointures 35/38, 38/41 ou la taille universelle.'}</p></div>
        <Link className="stocking-button secondary" href={kind === 'collants' ? '/guide-tailles-collants' : '/guide-tailles-chaussettes'}>Voir le guide pratique →</Link>
      </aside>
      <p className="stocking-note" role="status">Nos prix sont affichés, livraison standard comprise. Commande en préparation jusqu’à la confirmation des disponibilités.</p>
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
            <p className="lmd-preview-excerpt">{p.description.split('\n\n')[0]}</p>
            <small>{p.color} · Tailles présentées : {p.variants.map(v => v.size).join(', ')}</small><p className="stocking-price">{p.priceEur.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p><small>Livraison standard incluse dans le prix</small>
          </Link>
          <Link className="stocking-button secondary" href={productUrl(p)}>Découvrir son histoire →</Link>
        </article>)}
      </div>
      <p className="stocking-note">Besoin d'aide ? <Link href={kind === 'collants' ? '/guide-tailles-collants' : '/guide-tailles-chaussettes'}>Lire le guide des tailles adapté à cette collection →</Link></p>
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
          <div className="stocking-picture"><img src={p.images[photoIndex] || p.images[0]} width="600" height="800" alt={p.name + ', vue ' + (photoIndex + 1)}/></div>
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
            <div><dt>Tailles indiquées pour le modèle (non garanties en stock)</dt><dd>{p.variants.map(v => v.size.replace(/^EU /, '')).join(' · ')}</dd></div>
          </dl>
          <aside className="lmd-guide-cta" aria-label="Guide des tailles pour ce modèle"><div><strong>Quelle taille choisir pour {p.name.split(' — ')[0]} ?</strong><p>Les étiquettes ci-dessus ne sont pas une correspondance de mensurations. Notre guide vous aide à mesurer et à demander confirmation si nécessaire.</p></div><Link className="stocking-button secondary" href={p.category === 'collants' ? '/guide-tailles-collants' : '/guide-tailles-chaussettes'}>Comprendre les tailles de ce modèle →</Link></aside>
          <p className="stocking-price">{p.priceEur.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p><p>Livraison standard comprise dans le prix affiché.</p><p className="stocking-note" role="status">Disponible prochainement à la commande, sous réserve de confirmation du stock fournisseur.</p>
          <p>Découvrez <Link href={collection.url}>les autres modèles de cette collection</Link> ou <Link href="/guide-des-tailles">l'ensemble de nos conseils de tailles</Link>.</p>
          <h2>À découvrir dans le même univers</h2>
          <ul>{products.filter(other => other.id !== p.id && other.category === p.category).slice(0, 3).map(other => <li key={other.id}><Link href={productUrl(other)}>{other.name}</Link></li>)}</ul>
        </section>
      </div>
    </main>
  </>;
}
