import { Link, useLocation, useRoute } from 'wouter';
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
  const selection = products.filter(p => p.category === kind);

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
    <div className="stocking-grid">
      {selection.map(p => <article className="stocking-card" key={p.id}>
        <Link href={'/selection-matterhorn/' + p.slug}>
          <div className="stocking-picture"><img loading="lazy" width="600" height="800" src={p.images[0]} alt={'Photo fournisseur : ' + p.name} /></div>
          <p className="stocking-eyebrow">{p.brand}</p>
          <h2>{p.name}</h2>
          <p>{p.color} · {p.sizes.join(', ')}</p>
        </Link>
        <Link className="stocking-button secondary" href={'/selection-matterhorn/' + p.slug}>Découvrir la fiche</Link>
      </article>)}
    </div>
    <p className="stocking-note">Pour choisir votre style, consultez aussi <Link href="/guide-des-bas">notre guide des bas</Link> et <Link href="/guide-des-tailles">nos conseils de tailles</Link>.</p>
  </main></>;
}

export function MatterhornPreviewProduct() {
  const [, params] = useRoute('/selection-matterhorn/:slug');
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
        <div className="stocking-picture"><img src={p.images[0]} width="600" height="800" alt={'Photo originale Matterhorn : ' + p.name}/></div>
        {p.images.length > 1 && <div className="stocking-thumbs">{p.images.slice(1).map(src => <a key={src} href={src} target="_blank" rel="noreferrer"><img src={src} alt={'Autre vue de ' + p.name} loading="lazy"/></a>)}</div>}
        <p className="stocking-note">Photographies originales fournies par Matterhorn, sans retouche.</p>
      </section>
      <section>
        <p className="stocking-intro">{p.description}</p>
        <h2>Composition</h2><p>{p.composition}.</p>
        <h2>Coloris</h2><p>{p.color}</p>
        <h2>Tailles au catalogue fournisseur</h2><p>{p.sizes.join(' · ')}</p>
        <p className="stocking-note" role="status">Ce modèle n'est pas encore disponible à la commande. Prix, stock en temps réel, délai et logistique fournisseur à valider.</p>
        <p>En attendant, découvrez <Link href={collection.url}>les autres modèles de cette collection</Link>.</p>
        <p><Link href="/guide-des-tailles">Consulter le guide des tailles</Link>.</p>
      </section>
    </div>
  </main></>;
}
