import { Link, useLocation, useRoute } from 'wouter';
import { useEffect, useState } from 'react';
import matterhorn from '@/data/matterhorn-preview.json';
import { SEO } from '@/lib/seo';

/**
 * Prévisualisation isolée : aucun prix public, aucun stock temps réel,
 * aucun ajout au panier et aucun Product/Offer JSON-LD.
 * Les produits Matterhorn ne doivent PAS être ajoutés au catalogue achetable
 * avant validation des prix, du transport, du stock et du checkout multi-fournisseurs.
 */
const products = matterhorn.products;
const collectionCopy = {
  collants: {
    title: 'Collants pour femme — opaques, fantaisie et coton',
    intro: 'Pour une journée de travail, une promenade ou une soirée choisie : découvrez notre sélection de collants pour femme, du coton majoritaire aux motifs graphiques. Une garde-robe féminine se construit selon vos envies et vos journées.',
    seo: 'Collants pour femme : modèles opaques, riches en coton, à pois ou à motifs. Sélection Gatta, Fiore et Annes en préparation.',
    url: '/collants-femme'
  },
  chaussettes: {
    title: 'Chaussettes pour femme — coton, fantaisie et modèles longs',
    intro: 'Des chaussettes riches en coton aux modèles fantaisie, composez vos tenues jusque dans les détails. Voici des créations Gabriella, Fiore et Step in Style pour vos différents moments du quotidien.',
    seo: 'Chaussettes pour femme : coton, modèles longs, motifs ourson, léopard et pois. Sélection en préparation.',
    url: '/chaussettes-femme'
  }
} as const;

export function MatterhornCollection() {
  const [path] = useLocation();
  const kind = path === '/collants-femme' ? 'collants' : 'chaussettes';
  const copy = collectionCopy[kind];
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  useEffect(() => { setColor(''); setBrand(''); setSize(''); }, [path]);
  const categoryProducts = products.filter(p => p.category === kind);
  const colors = [...new Set(categoryProducts.map(p => p.color))].sort();
  const brands = [...new Set(categoryProducts.map(p => p.brand))].sort();
  const sizes = [...new Set(categoryProducts.flatMap(p => p.variants.map(v => v.size)))].sort();
  const selection = categoryProducts.filter(p => (!color || p.color === color) && (!brand || p.brand === brand) && (!size || p.variants.some(v => v.size === size)));

  return <><SEO title={copy.title} description={copy.seo}>
    <meta name="robots" content="noindex,nofollow" />
  </SEO><main className="stocking-page">
    <nav className="stocking-note" aria-label="Fil d'Ariane"><Link href="/">Accueil</Link> · <Link href="/boutique">Boutique</Link> · {kind === 'collants' ? 'Collants' : 'Chaussettes'}</nav>
    <p className="stocking-eyebrow">LA MAISON DES DESSOUS · SÉLECTION EN PRÉPARATION</p>
    <h1>{copy.title}</h1>
    <p className="stocking-intro">{copy.intro}</p>
    <p className="stocking-note" role="status">Aperçu de collection : références et photos issues du catalogue Matterhorn. Les prix, disponibilités et délais sont en cours de validation. Aucune commande possible sur cette page.</p>
    <nav className="stocking-filters" aria-label="Nos collections">
      <Link href="/bas-autofixants">Bas autofixants</Link>
      <Link href="/bas-resille">Bas résille</Link>
      <Link href="/collants-femme">Collants</Link>
      <Link href="/chaussettes-femme">Chaussettes</Link>
    </nav>
    <div className="stocking-filters" aria-label="Filtrer la sélection de préparation">
      <label className="stocking-select">Couleur
        <select value={color} onChange={e => setColor(e.target.value)}>
          <option value="">Toutes les couleurs</option>{colors.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="stocking-select">Marque
        <select value={brand} onChange={e => setBrand(e.target.value)}>
          <option value="">Toutes les marques</option>{brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </label>
      <label className="stocking-select">Taille
        <select value={size} onChange={e => setSize(e.target.value)}>
          <option value="">Toutes les tailles</option>{sizes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
    </div>
    <p className="stocking-note" role="status">{selection.length} modèle{selection.length > 1 ? 's' : ''} en aperçu, sans commande possible.</p>
    <div className="stocking-grid">
      {selection.map(p => <article className="stocking-card" key={p.id}>
        <Link href={'/selection-matterhorn/' + p.slug}>
          <div className="stocking-picture"><img loading="lazy" width="600" height="800" src={p.images[0]} alt={'Photo fournisseur : ' + p.name} /></div>
          <p className="stocking-eyebrow">{p.brand}</p>
          <h2>{p.name}</h2>
          <p>{p.color} · {p.variants.map(v => v.size).join(', ')}</p>
        </Link>
        <Link className="stocking-button secondary" href={'/selection-matterhorn/' + p.slug}>Découvrir la fiche</Link>
      </article>)}
    </div>
    <p className="stocking-note">Pour choisir votre style, consultez aussi <Link href="/guide-des-bas">notre guide des bas</Link> et <Link href="/guide-des-tailles">nos conseils de tailles</Link>.</p>
  </main></>;
}

export function MatterhornPreviewProduct() {
  const [, params] = useRoute('/selection-matterhorn/:slug');
  const [photoIndex, setPhotoIndex] = useState(0);
  const p = products.find(item => item.slug === params?.slug);
  if (!p) return <main className="stocking-page"><SEO title="Fiche en préparation"><meta name="robots" content="noindex,nofollow"/></SEO><h1>Modèle introuvable</h1><Link href="/collants-femme">Retour aux collants</Link></main>;
  const collection = collectionCopy[p.category as keyof typeof collectionCopy];
  return <><SEO title={p.name} description={p.seoDescription}>
    <meta name="robots" content="noindex,nofollow"/>
  </SEO><main className="stocking-page">
    <nav className="stocking-note" aria-label="Fil d'Ariane"><Link href="/">Accueil</Link> · <Link href={collection.url}>{collection.title}</Link> · {p.name}</nav>
    <p className="stocking-eyebrow">{p.brand} · SÉLECTION MATTERHORN EN PRÉPARATION</p>
    <h1>{p.name}</h1>
    <div className="stocking-product">
      <section>
        <div className="stocking-picture"><a href={p.images[photoIndex] || p.images[0]} target="_blank" rel="noreferrer" aria-label="Agrandir la photo fournisseur dans un nouvel onglet"><img src={p.images[photoIndex] || p.images[0]} width="600" height="800" alt={'Photo originale Matterhorn : ' + p.name + ', vue ' + (photoIndex + 1)}/></a></div>
        {p.images.length > 1 && <div className="stocking-thumbs">{p.images.map((src, i) => <button type="button" key={src} onClick={() => setPhotoIndex(i)} aria-label={'Afficher la vue ' + (i + 1)} aria-pressed={photoIndex === i}><img src={src} alt="" loading="lazy"/></button>)}</div>}
        <p className="stocking-note">Photographies originales fournies par Matterhorn, sans retouche.</p>
      </section>
      <section>
        <p className="stocking-intro">{p.description}</p>
        <h2>Composition</h2><p>{p.composition}.</p>
        <h2>Coloris</h2><p>{p.color}</p>
        <h2>Tailles au catalogue fournisseur</h2><p>{p.variants.map(v => v.size).join(' · ')}</p>
        <p className="stocking-note" role="status">Ce modèle n'est pas encore disponible à la commande. Prix, stock en temps réel, délai et logistique fournisseur à valider.</p>
        <p>En attendant, découvrez <Link href={collection.url}>les autres modèles de cette collection</Link>.</p>
        <p><Link href="/guide-des-tailles">Consulter le guide des tailles</Link>.</p>
        <h2>D'autres pièces à découvrir</h2>
        <ul>{products.filter(other => other.id !== p.id && other.category === p.category).slice(0, 3).map(other => <li key={other.id}><Link href={'/selection-matterhorn/' + other.slug}>{other.name}</Link></li>)}</ul>
      </section>
    </div>
  </main></>;
}
