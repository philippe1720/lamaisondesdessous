import { Link } from 'wouter';
import { SEO } from '@/lib/seo';
import matterhorn from '@/data/matterhorn-preview.json';
import { useShop } from './cart';
import { GuideLinks } from './editorial';
import { ProductCard } from './catalogue';

/** Visuels de vrais modèles : produits présents dans le catalogue et photos originales Matterhorn. */
export default function StockingHome() {
  const { products } = useShop();
  const look = (id: string, fallback: string) => products.find(p => p.id === id)?.images[0] || fallback;
  const basPhoto = look('20985', '/images/bas/20985-1.jpg');
  const autoPhoto = look('20985', '/images/bas/20985-1.jpg');
  const attachesPhoto = look('20988', '/images/bas/20988-1.jpg');
  const collantsPhoto = matterhorn.products.find(p => p.id === '220114')?.images[0] || '';
  const socksPhoto = matterhorn.products.find(p => p.id === '191180')?.images[0] || '';
  const selection = products.filter(p => p.variants.some(v => v.stock > 0)).slice(0, 3);

  return <><SEO
    title="Bas pour femme, collants et chaussettes"
    canonical="/"
    description="La Maison des Dessous accompagne votre féminité : bas autofixants, résille et porte-jarretelles en boutique ; collants et chaussettes à découvrir bientôt. Livraison standard incluse dans les prix des bas."
  />
  <main>
    <section className="stocking-hero lmd-home-hero" aria-labelledby="lmd-home-title">
      <div>
        <p className="stocking-eyebrow">LA MAISON DES DESSOUS · POUR TOUTES SES VIES</p>
        <h1 id="lmd-home-title">Un style pour chaque moment. Toujours vous.</h1>
        <p>Les bas pour les rendez-vous que vous choisissez. Les collants pour vos journées bien remplies. Les chaussettes pour les petits plaisirs du quotidien. Une Maison qui accompagne votre féminité, sans vous dire comment la vivre.</p>
        <div className="lmd-home-actions">
          <Link className="stocking-button" href="/choisir-ses-bas">Trouver mes bas</Link>
          <a className="stocking-button secondary" href="#nos-univers">Découvrir nos univers</a>
        </div>
        <small>Nos bas sont proposés à la vente, livraison standard comprise dans le prix. Collants et chaussettes : collections en préparation.</small>
      </div>
      <img src={basPhoto} alt="Bas noirs à couture et dentelle : modèle présent dans la boutique La Maison des Dessous" fetchPriority="high" width="800" height="1000" />
    </section>

    <section id="nos-univers" className="stocking-page lmd-home-universes" aria-labelledby="lmd-universe-heading">
      <p className="stocking-eyebrow">VOTRE STYLE, VOTRE JOURNÉE</p>
      <h2 id="lmd-universe-heading" className="stocking-section-title">Trois univers. Une seule femme : vous.</h2>
      <p className="stocking-intro">Un rendez-vous, un matin pressé, une promenade d'hiver : choisissez ce qui vous ressemble, sans changer qui vous êtes.</p>
      <div className="lmd-universe-grid">
        <Link className="lmd-universe-tile" href="/boutique">
          <div className="lmd-universe-image"><img src={basPhoto} alt="Bas de lingerie noirs à couture et dentelle" loading="lazy" width="480" height="600"/><span className="lmd-universe-status">Collection en boutique</span></div>
          <div className="lmd-universe-copy"><p className="stocking-eyebrow">01 · LE GLAMOUR À VOTRE FAÇON</p><h3>Les bas</h3><p>Autofixants, résille ou attaches : à vous de décider.</p><strong>Choisir mes bas →</strong></div>
        </Link>
        <Link className="lmd-universe-tile" href="/collants-femme">
          <div className="lmd-universe-image"><img src={collantsPhoto} alt="Collants Gatta Celia noirs riches en coton, photo originale du fournisseur" loading="lazy" width="480" height="600"/><span className="lmd-universe-status lmd-status-soon">En préparation</span></div>
          <div className="lmd-universe-copy"><p className="stocking-eyebrow">02 · LES JOURNÉES QUI VOUS APPARTIENNENT</p><h3>Les collants</h3><p>Coton, opaques ou fantaisie pour renouveler vos tenues.</p><strong>Découvrir l'aperçu →</strong></div>
        </Link>
        <Link className="lmd-universe-tile" href="/chaussettes-femme">
          <div className="lmd-universe-image"><img src={socksPhoto} alt="Chaussettes Step in Style à motif ourson, photo originale du fournisseur" loading="lazy" width="480" height="600"/><span className="lmd-universe-status lmd-status-soon">En préparation</span></div>
          <div className="lmd-universe-copy"><p className="stocking-eyebrow">03 · LE CONFORT ET LA FANTAISIE</p><h3>Les chaussettes</h3><p>Coton, motifs discrets et petits plaisirs de saison.</p><strong>Découvrir l'aperçu →</strong></div>
        </Link>
      </div>
    </section>

    <section className="stocking-page lmd-choose-section" aria-labelledby="lmd-bas-choice">
      <p className="stocking-eyebrow">VOUS CHERCHEZ DES BAS ?</p>
      <h2 id="lmd-bas-choice" className="stocking-section-title">Autofixants ou porte-jarretelles ?</h2>
      <p className="stocking-intro">Deux façons de porter vos bas. Quelques secondes suffisent pour trouver la collection adaptée à votre préférence.</p>
      <div className="lmd-choice-grid">
        <Link className="lmd-choice-tile" href="/bas-autofixants">
          <img src={autoPhoto} loading="lazy" alt="Bas autofixants noirs avec jarretière siliconée, modèle de la boutique" width="640" height="760"/>
          <div><h3>Je choisis les autofixants</h3><p>Le maintien par une jarretière siliconée, sans porte-jarretelles.</p><strong>Voir les bas autofixants →</strong></div>
        </Link>
        <Link className="lmd-choice-tile" href="/bas-porte-jarretelles">
          <img src={attachesPhoto} loading="lazy" alt="Bas résille noirs à jarretière lacée, à porter avec porte-jarretelles" width="640" height="760"/>
          <div><h3>Je préfère les porte-jarretelles</h3><p>Des bas conçus pour être fixés à des attaches, à choisir séparément.</p><strong>Voir les bas pour porte-jarretelles →</strong></div>
        </Link>
      </div>
      <p className="stocking-note">Vous aimez la maille ajourée ? <Link href="/bas-resille">Découvrez également les bas résille noirs et beiges.</Link></p>
      <p className="stocking-note"><Link href="/choisir-ses-bas">Comparer les deux maintiens en quelques instants →</Link></p>
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
        <div><h3>Votre taille</h3><p>Les correspondances changent selon les marques et les modèles.</p><Link href="/guide-des-tailles">Consulter les guides de tailles →</Link></div>
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

export function ChooseStockingsLanding() {
  const { products } = useShop();
  const photo = (id: string, fallback: string) => products.find(p => p.id === id)?.images[0] || fallback;
  return <><SEO title="Autofixants ou porte-jarretelles : trouvez vos bas" description="Choisir ses bas : autofixants sans attaches ou bas pour porte-jarretelles. Deux collections expliquées, avec modèles, tailles et livraison standard comprise." noindex>
    <meta name="robots" content="noindex,follow" />
  </SEO><main className="stocking-page lmd-landing" aria-labelledby="lmd-landing-title">
    <nav className="stocking-note" aria-label="Fil d'Ariane"><Link href="/">Accueil</Link> · Choisir mes bas</nav>
    <p className="stocking-eyebrow">UN STYLE POUR SOI · LA MAISON DES DESSOUS</p>
    <h1 id="lmd-landing-title">Autofixants ou porte-jarretelles ? Choisissez votre façon de porter vos bas.</h1>
    <p className="stocking-intro">Vous aimez la lingerie qui vous ressemble. Deux maintiens, deux sensations de style : il n'y a pas de bon choix universel, seulement le vôtre.</p>
    <div className="lmd-choice-grid">
      <Link href="/bas-autofixants" className="lmd-choice-tile">
        <img src={photo('20985','/images/bas/20985-1.jpg')} loading="eager" alt="Bas autofixants noirs à couture et jarretière siliconée" width="640" height="760"/>
        <div><p className="stocking-eyebrow">SANS PORTE-JARRETELLES</p><h2>Les autofixants</h2><p>Une jarretière siliconée maintient les bas sur la cuisse. Vous les portez sans attaches supplémentaires.</p><strong>Découvrir les modèles autofixants →</strong></div>
      </Link>
      <Link href="/bas-porte-jarretelles" className="lmd-choice-tile">
        <img src={photo('20988','/images/bas/20988-1.jpg')} loading="eager" alt="Bas résille noirs à jarretière lacée, nécessitant des porte-jarretelles" width="640" height="760"/>
        <div><p className="stocking-eyebrow">AVEC ATTACHES</p><h2>Pour porte-jarretelles</h2><p>Ces bas sont conçus pour être fixés à un porte-jarretelles. Celui-ci est à choisir séparément.</p><strong>Découvrir les modèles à attaches →</strong></div>
      </Link>
    </div>
    <div className="lmd-landing-help">
      <p>Vous préférez la résille ? <Link href="/bas-resille">Comparer les modèles résille.</Link></p>
      <p>Vous hésitez sur une taille ? <Link href="/guide-des-tailles">Consulter le guide de tailles.</Link></p>
      <p>Livraison standard comprise dans le prix des bas, en France métropolitaine. <Link href="/livraison-retours">Voir les délais et les retours.</Link></p>
      <p>Envie de découvrir l'ensemble de la Maison ? <Link href="/">Retourner à l'accueil.</Link></p>
    </div>
  </main></>;
}

export function Guide() {
  return <main className="stocking-page stocking-reading"><SEO title="Comment choisir ses bas pour femme" canonical="/guide-des-bas" description="Autofixants ou porte-jarretelles, taille et deniers : nos repères pour choisir vos bas."/><p className="stocking-eyebrow">LES CONSEILS DE LA MAISON</p><h1>Bien choisir ses bas.</h1><GuideLinks/><h2>Autofixants ou porte-jarretelles ?</h2><p>Les autofixants tiennent grâce à une bande de silicone à l’intérieur de la jarretière. Les bas non autofixants se fixent aux attaches d’un porte-jarretelles. Vérifiez toujours le maintien indiqué sur la fiche : la dentelle seule ne permet pas de le deviner.</p><Link href="/bas-autofixants">Découvrir les autofixants →</Link><h2>Choisir la taille</h2><Link href="/guide-des-tailles">Consulter les tableaux et prendre mes mesures →</Link><p>Les tailles changent selon la marque. Une taille unique ne convient pas à toutes les morphologies. Si vous hésitez, contactez-nous avec la référence, votre taille en centimètres et vos mesures : nous vérifierons le tableau du fabricant avant votre achat.</p><h2>Comprendre les deniers</h2><p>Le denier mesure la masse du fil. Pour un voile, une valeur faible correspond généralement à un rendu plus fin et transparent. Le rendu dépend aussi du tissage et de la couleur. La résille se distingue par sa maille ajourée.</p><h2>Les enfiler avec soin</h2><p>Retirez vos bijoux, rassemblez délicatement le bas, placez la pointe puis déroulez sur la jambe. Évitez de tirer uniquement sur la jarretière. Suivez l’étiquette pour l’entretien.</p><Link href="/bas-porte-jarretelles">Découvrir les bas pour porte-jarretelles →</Link><h2>Vous aimez la résille ?</h2><p>Les bas résille peuvent être autofixants, avec une bande siliconée, ou nécessiter des attaches. Découvrez les modèles noirs et beiges de notre sélection.</p><Link href="/bas-resille">Comparer les bas résille pour femme →</Link><p><Link href="/conseils/comment-porter-bas-resille">Lire nos conseils pour porter des bas résille →</Link></p></main>;
}
