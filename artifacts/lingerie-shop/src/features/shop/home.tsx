import { Link } from 'wouter';
import { SEO } from '@/lib/seo';
import matterhorn from '@/data/matterhorn-preview.json';
import { useShop } from './cart';
import { GuideLinks } from './editorial';
import { ProductCard } from './catalogue';

/** Visuels authentiques des modèles de nos sélections, sans retouche. */
export default function StockingHome() {
  const { products } = useShop();
  const look = (id: string, fallback: string) => products.find(p => p.id === id)?.images[0] || fallback;
  const basPhoto = look('20985', '/images/bas/20985-1.jpg');
  const autoPhoto = look('20985', '/images/bas/20985-1.jpg');
  const attachesPhoto = look('20988', '/images/bas/20988-1.jpg');
  const resillePhoto = look('20990', '/images/bas/20990-1.jpg');
  const collantsPhoto = matterhorn.products.find(p => p.id === '220114')?.images[0] || '';
  const socksPhoto = matterhorn.products.find(p => p.id === '191180')?.images[0] || '';
  // Mettre en avant les deux nouveautés, puis un modèle à porte-jarretelles
  // plutôt que trois coloris voisins. Une fiche n'apparaît que si sa taille est disponible.
  const featuredIds = ['22811', '12451', '20988', '22289', '20985'];
  const selection = featuredIds
    .map(id => products.find(p => p.id === id && p.variants.some(v => v.stock > 0)))
    .filter((p): p is (typeof products)[number] => Boolean(p))
    .slice(0, 3);

  return <><SEO
    title="Bas pour femme, collants et chaussettes"
    canonical="/"
    description="La Maison des Dessous accompagne votre féminité : bas autofixants, résille et porte-jarretelles en boutique ; collants et chaussettes à découvrir bientôt. Livraison standard incluse dans les prix des bas."
  />
  <main>
    <section className="stocking-hero lmd-home-hero" aria-labelledby="lmd-home-title">
      <div>
        <p className="stocking-eyebrow">LA FEMME EST L'AVENIR DE LA FEMME</p>
        <h1 id="lmd-home-title">Un style pour chaque moment. Toujours vous.</h1>
        <p>La Maison des Dessous vous accompagne dans votre féminité : une tenue pour le travail, un détail pour une soirée, ou le simple plaisir de choisir pour vous.</p>
        <p className="lmd-hero-prompt">Quel type de bas recherchez-vous ?</p>
        <nav className="lmd-hero-shortcuts" aria-label="Choisir directement une catégorie de bas">
          <Link href="/bas-autofixants">Bas autofixants →</Link>
          <Link href="/bas-porte-jarretelles">Pour porte-jarretelles →</Link>
          <Link href="/bas-resille">Bas résille →</Link>
        </nav>
        <a className="lmd-explore-link" href="#nos-univers">Ou découvrir les 5 catégories de la Maison ↓</a>
        <small>Bas vendus avec livraison standard comprise dans le prix en France métropolitaine. Collants et chaussettes en préparation.</small>
      </div>
      <img src={basPhoto} alt="Bas noirs à couture et dentelle, modèle actuellement présenté dans la boutique" fetchPriority="high" width="800" height="1000" />
    </section>

    <section id="nos-univers" className="stocking-page lmd-home-universes" aria-labelledby="lmd-universe-heading">
      <p className="stocking-eyebrow">LE CHOIX VOUS APPARTIENT</p>
      <h2 id="lmd-universe-heading" className="stocking-section-title">Choisissez votre catégorie.</h2>
      <p className="stocking-intro">Cinq façons d'accompagner votre quotidien. Les bas sont disponibles en boutique ; les collants et les chaussettes arrivent dans notre sélection.</p>
      <div className="lmd-universe-grid">
        <Link className="lmd-universe-tile" href="/bas-autofixants">
          <div className="lmd-universe-image"><img src={autoPhoto} alt="Bas autofixants noirs à jarretière en dentelle, portés sans porte-jarretelles" loading="lazy" width="480" height="600"/><span className="lmd-universe-status">En boutique</span></div>
          <div className="lmd-universe-copy"><p className="stocking-eyebrow">SANS ATTACHES</p><h3>Bas autofixants</h3><p>Une jarretière siliconée, pour porter vos bas sans porte-jarretelles.</p><strong>Voir les modèles →</strong></div>
        </Link>
        <Link className="lmd-universe-tile" href="/bas-porte-jarretelles">
          <div className="lmd-universe-image"><img src={attachesPhoto} alt="Bas résille noirs à jarretière lacée, modèle à fixer avec porte-jarretelles" loading="lazy" width="480" height="600"/><span className="lmd-universe-status">En boutique</span></div>
          <div className="lmd-universe-copy"><p className="stocking-eyebrow">AVEC ATTACHES</p><h3>Bas pour porte-jarretelles</h3><p>Le choix des attaches pour un maintien à votre façon.</p><strong>Voir les modèles →</strong></div>
        </Link>
        <Link className="lmd-universe-tile" href="/bas-resille">
          <div className="lmd-universe-image"><img src={resillePhoto} alt="Bas résille noirs à maille ajourée, modèle de la boutique" loading="lazy" width="480" height="600"/><span className="lmd-universe-status">En boutique</span></div>
          <div className="lmd-universe-copy"><p className="stocking-eyebrow">MAILLE AJOURÉE</p><h3>Bas résille</h3><p>Des lignes graphiques et différents types de maintien, à vérifier sur chaque fiche.</p><strong>Voir les modèles →</strong></div>
        </Link>
        <Link className="lmd-universe-tile" href="/collants-femme">
          <div className="lmd-universe-image"><img src={collantsPhoto} alt="Éléonore, collants opaques noirs riches en coton, notre future sélection féminine" loading="lazy" width="480" height="600"/><span className="lmd-universe-status lmd-status-soon">Collection en préparation</span></div>
          <div className="lmd-universe-copy"><p className="stocking-eyebrow">POUR LES JOURNÉES ACTIVES</p><h3>Collants femme</h3><p>Éléonore, Apolline, Ophélie : des collants pour les moments que vous choisissez.</p><strong>Découvrir la sélection en préparation →</strong></div>
        </Link>
        <Link className="lmd-universe-tile" href="/chaussettes-femme">
          <div className="lmd-universe-image"><img src={socksPhoto} alt="Nina, chaussettes noires en coton à motif ourson, notre future sélection féminine" loading="lazy" width="480" height="600"/><span className="lmd-universe-status lmd-status-soon">Collection en préparation</span></div>
          <div className="lmd-universe-copy"><p className="stocking-eyebrow">CONFORT ET FANTAISIE</p><h3>Chaussettes femme</h3><p>Nina, Louise, Zélie : les petits détails qui donnent du caractère à vos journées.</p><strong>Découvrir la sélection en préparation →</strong></div>
        </Link>
      </div>
      <p className="stocking-note">Vous hésitez sur le maintien ? <Link href="/guide-des-bas">Comprendre la différence entre autofixants et porte-jarretelles →</Link></p>
    </section>

    <section className="stocking-page" aria-labelledby="lmd-available">
      <p className="stocking-eyebrow">DÉCOUVRIR LES MODÈLES ACTUELS</p>
      <h2 id="lmd-available" className="stocking-section-title">Notre sélection de bas.</h2>
      <p className="stocking-intro">De vraies fiches produits avec choix de taille, détails de maintien et prix comprenant la livraison standard en France métropolitaine.</p>
      <div className="stocking-grid">{selection.map(p => <ProductCard key={p.id} product={p}/>)}</div>
      <p className="stocking-note"><Link href="/boutique">Voir tous nos bas de lingerie pour femme →</Link></p>
    </section>

    <section className="stocking-page lmd-home-reassurance" aria-label="Informations utiles pour acheter">
      <h2 className="stocking-section-title">Pour choisir en confiance.</h2>
      <div className="lmd-trust-grid">
        <div><h3>Votre taille</h3><p>Bas, collants et chaussettes : les bonnes mesures ne sont pas les mêmes. Un guide dédié pour chaque famille.</p><Link href="/guide-des-tailles">Voir tous les guides de tailles →</Link><div className="lmd-home-guide-links"><Link href="/guide-tailles-collants">Pour les collants</Link><Link href="/guide-tailles-chaussettes">Pour les chaussettes</Link></div></div>
        <div><h3>Livraison et retours</h3><p>La livraison standard de nos bas est comprise dans le prix affiché. Conditions détaillées avant achat.</p><Link href="/livraison-retours">Lire les conditions →</Link></div>
        <div><h3>Une question ?</h3><p>Besoin d'un renseignement sur un modèle ou son maintien ?</p><a href="mailto:contact@lamaisondesdessous.fr">Nous écrire →</a></div>
      </div>
    </section>

    <section className="stocking-manifesto">
      <p className="stocking-eyebrow">NOTRE CONVICTION</p>
      <h2>La femme est l'avenir de la femme.</h2>
      <p>Une féminité libre, quotidienne, sensuelle quand vous le souhaitez et simplement vous-même le reste du temps. La Maison des Dessous ne vous transforme pas : elle vous accompagne.</p>
      <Link href="/qui-sommes-nous">Découvrir l'esprit de la Maison →</Link>
    </section>
    <section className="stocking-page">
      <section className="stocking-guide-callout">
        <h2>Pour choisir sans hésiter.</h2>
        <p>Comment prendre ses mesures ? Quelle différence entre autofixants et porte-jarretelles ? Découvrez nos conseils.</p>
        <Link href="/guide-des-bas">Lire le guide des bas →</Link>
        <GuideLinks />
        <p>Vous aimez les motifs ? <Link href="/bas-resille">Explorer les bas résille</Link> illustrés par de vrais produits de la boutique.</p>
      </section>
    </section>
  </main></>;
}

export function Guide() {
  return <main className="stocking-page stocking-reading"><SEO title="Comment choisir ses bas pour femme" canonical="/guide-des-bas" description="Autofixants ou porte-jarretelles, taille et deniers : nos repères pour choisir vos bas."/><p className="stocking-eyebrow">LES CONSEILS DE LA MAISON</p><h1>Bien choisir ses bas.</h1><GuideLinks/><h2>Autofixants ou porte-jarretelles ?</h2><p>Les autofixants tiennent grâce à une bande de silicone à l’intérieur de la jarretière. Les bas non autofixants se fixent aux attaches d’un porte-jarretelles. Vérifiez toujours le maintien indiqué sur la fiche : la dentelle seule ne permet pas de le deviner.</p><Link href="/bas-autofixants">Découvrir les autofixants →</Link><h2>Choisir la taille</h2><Link href="/guide-des-tailles">Consulter les tableaux et prendre mes mesures →</Link><p>Les tailles changent selon la marque. Une taille unique ne convient pas à toutes les morphologies. Si vous hésitez, contactez-nous avec la référence, votre taille en centimètres et vos mesures : nous vérifierons le tableau du fabricant avant votre achat.</p><h2>Comprendre les deniers</h2><p>Le denier mesure la masse du fil. Pour un voile, une valeur faible correspond généralement à un rendu plus fin et transparent. Le rendu dépend aussi du tissage et de la couleur. La résille se distingue par sa maille ajourée.</p><h2>Les enfiler avec soin</h2><p>Retirez vos bijoux, rassemblez délicatement le bas, placez la pointe puis déroulez sur la jambe. Évitez de tirer uniquement sur la jarretière. Suivez l’étiquette pour l’entretien.</p><Link href="/bas-porte-jarretelles">Découvrir les bas pour porte-jarretelles →</Link><h2>Vous aimez la résille ?</h2><p>Les bas résille peuvent être autofixants, avec une bande siliconée, ou nécessiter des attaches. Découvrez les modèles noirs et beiges de notre sélection.</p><Link href="/bas-resille">Comparer les bas résille pour femme →</Link><p><Link href="/conseils/comment-porter-bas-resille">Lire nos conseils pour porter des bas résille →</Link></p></main>;
}
