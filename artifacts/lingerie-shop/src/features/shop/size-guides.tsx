import { useState } from 'react';
import { Link } from 'wouter';
import { SEO } from '@/lib/seo';
import selection from '@/data/matterhorn-preview.json';
import { VerifiedTightsSizeTable, hasVerifiedSizing } from './verified-sizing';

/**
 * Conseils pratiques, sans conversion inventée des tailles :
 * les codes inscrits dans le flux ne donnent pas à eux seuls les
 * mensurations garanties par modèle. Ces guides n'affirment jamais
 * une correspondance individuelle non vérifiée.
 */
const items = selection.products;
const forCategory = (category: 'collants' | 'chaussettes') =>
  items.filter(p => p.category === category);
const linkFor = (p: (typeof items)[number]) => `/${p.category}-femme/${p.slug}`;
const displayedSizes = (p: (typeof items)[number]) =>
  [...new Set(p.variants.map(v => v.size.replace(/^EU /, '')))].join(' · ');

function GuideNavigation() {
  return <nav className="lmd-size-guide-nav" aria-label="Choisir un guide de tailles">
    <Link href="/guide-des-tailles">Bas de lingerie</Link>
    <Link href="/guide-tailles-collants">Collants</Link>
    <Link href="/guide-tailles-chaussettes">Chaussettes</Link>
  </nav>;
}

function AdviceContact({ category }: {category: 'collants' | 'chaussettes'}) {
  const [reference, setReference] = useState('');
  const [measureA, setMeasureA] = useState('');
  const [measureB, setMeasureB] = useState('');
  const isTights = category === 'collants';
  const subject = 'Conseil taille — ' + (isTights ? 'collants' : 'chaussettes');
  const body = [
    'Bonjour, je souhaite choisir la taille d’un modèle de ' + category + '.',
    'Modèle qui m’intéresse : ' + (reference || 'à préciser'),
    isTights ? 'Stature (cm) : ' + (measureA || 'à mesurer') : 'Pointure EU habituelle : ' + (measureA || 'à préciser'),
    isTights ? 'Tour de hanches (cm) : ' + (measureB || 'à mesurer') : 'Longueur du pied le plus grand (cm) : ' + (measureB || 'à mesurer'),
    'Pouvez-vous confirmer les correspondances exactes de ce modèle avant que je commande ?',
    'Merci.'
  ].join('\n');
  const mailto = 'mailto:contact@lamaisondesdessous.fr?subject=' + encodeURIComponent(subject)
    + '&body=' + encodeURIComponent(body);

  return <section className="lmd-sizing-contact" aria-labelledby={'contact-' + category}>
    <h2 id={'contact-' + category}>Encore une hésitation ? Nous vous accompagnons.</h2>
    <p>Vous n'avez pas à deviner votre taille. Préparez votre message avec vos mesures et le prénom du modèle choisi ; nous vous répondrons selon les informations vérifiées pour cette référence.</p>
    <div className="lmd-sizing-fields">
      <label>Nom du modèle (ex. {isTights ? 'Éléonore' : 'Nina'})
        <input value={reference} onChange={e => setReference(e.target.value)} placeholder={isTights ? 'Éléonore' : 'Nina'} />
      </label>
      <label>{isTights ? 'Votre stature (cm)' : 'Votre pointure européenne habituelle'}
        <input type="number" min={isTights ? 120 : 20} max={isTights ? 220 : 55} step={1} value={measureA} onChange={e => setMeasureA(e.target.value)} placeholder={isTights ? 'Ex. 168' : 'Ex. 39'} />
      </label>
      <label>{isTights ? 'Votre tour de hanches (cm)' : 'Longueur du pied (cm)'}
        <input type="number" min={isTights ? 50 : 10} max={isTights ? 180 : 40} step="0.5" value={measureB} onChange={e => setMeasureB(e.target.value)} placeholder={isTights ? 'Ex. 104' : 'Ex. 24,5'} />
      </label>
    </div>
    <a className="stocking-button" href={mailto}>Préparer mon e-mail de conseil →</a>
    <p className="stocking-note">Votre messagerie s'ouvre avec le texte prérempli. Aucune mesure n'est envoyée automatiquement depuis ce site. Nous ne calculons pas de taille à partir de données incomplètes.</p>
  </section>;
}

function ModelsAndSizes({ category }: {category:'collants'|'chaussettes'}) {
  const products = forCategory(category);
  return <section aria-labelledby={'models-'+category}>
    <h2 id={'models-'+category}>Les tailles indiquées pour nos modèles</h2>
    <p>Voici les étiquettes de taille relevées pour les {products.length} références de notre sélection en préparation. Ce sont des <strong>tailles annoncées pour chaque modèle</strong>, pas un tableau universel de mensurations ni une confirmation de disponibilité en stock.</p>
    <div className="lmd-size-list">
      {products.map(p => <article key={p.id} className="lmd-size-item">
        <h3><Link href={linkFor(p)}>{p.name}</Link></h3>
        <p><strong>Tailles au catalogue :</strong> {displayedSizes(p)}</p>
        {p.category === 'collants' && hasVerifiedSizing(p.id) && <p className="lmd-sizing-verified-note">Tableau de mensurations confirmé pour ce modèle.</p>}
        <Link href={linkFor(p)}>Voir les détails du modèle →</Link>
      </article>)}
    </div>
  </section>;
}

export function TightsSizeGuide() {
  return <main className="stocking-page stocking-reading lmd-size-guide">
    <SEO title="Guide des tailles collants femme : bien mesurer et choisir"
      canonical="/guide-tailles-collants"
      description="Comment choisir sa taille de collants femme ? Mesurer sa stature et son tour de hanches, lire les tailles 2-S à 5-XL et éviter les erreurs." />
    <nav aria-label="Fil d'Ariane" className="stocking-note"><Link href="/">Accueil</Link> · <Link href="/collants-femme">Collants</Link> · Guide des tailles</nav>
    <p className="stocking-eyebrow">LA MAISON DES DESSOUS · NOS CONSEILS</p>
    <h1>Bien choisir la taille de ses collants.</h1>
    <p className="stocking-intro">Un collant agréable à porter commence par une taille adaptée à votre silhouette. Pas besoin de connaître par cœur les codes S, M ou 3/4 : nous vous expliquons comment prendre vos mesures et lire la taille du modèle qui vous plaît.</p>
    <GuideNavigation />

    <section>
      <h2>1. Prenez deux mesures, sans serrer.</h2>
      <ol className="lmd-sizing-steps">
        <li><strong>Votre stature :</strong> debout, sans chaussures, dos droit contre un mur. Mesurez en centimètres du sol au sommet de la tête.</li>
        <li><strong>Votre tour de hanches :</strong> faites passer un mètre ruban souple à l'endroit le plus large des hanches et des fesses, en gardant le ruban horizontal. Ne rentrez pas le ventre et ne serrez pas.</li>
        <li><strong>En complément :</strong> relevez le tour de taille si le modèle possède une ceinture particulière. Certaines grilles utilisent aussi le poids, mais seulement lorsque cette donnée figure dans le tableau du modèle concerné.</li>
      </ol>
      <p>Notez ces mesures. La taille de vêtement que vous achetez habituellement n'est pas forcément celle de vos collants : les coupes et les tableaux changent selon les modèles.</p>
    </section>

    <section>
      <h2>2. Que signifient 2-S, 3-M, 4-L et 5-XL ?</h2>
      <div className="lmd-size-terms">
        <div><strong>2-S</strong><span>Repère de taille S sur l'étiquette du modèle</span></div>
        <div><strong>3-M</strong><span>Repère de taille M sur l'étiquette du modèle</span></div>
        <div><strong>4-L</strong><span>Repère de taille L sur l'étiquette du modèle</span></div>
        <div><strong>5-XL</strong><span>Repère de taille XL sur l'étiquette du modèle</span></div>
      </div>
      <p><strong>Attention :</strong> ces correspondances expliquent les <em>étiquettes</em> présentes dans notre sélection. Elles ne disent pas, à elles seules, qu'une taille S convient à une stature ou à un tour de hanches donné. Nous disposons désormais d'un tableau vérifié pour quatre modèles, présenté ci-dessous ; pour les autres, une correspondance précise reste à confirmer.</p>
    </section>

    <section>
      <h2>3. Comment vérifier que la taille vous conviendra ?</h2>
      <p>Repérez d'abord votre stature et votre tour de hanches dans le tableau propre au modèle. Les deux doivent entrer dans la plage prévue. Si l'une des deux mesures est à la limite, ou si les tableaux sont absents, demandez-nous une confirmation avant de choisir.</p>
      <p>Un collant trop court peut tirer à l'entrejambe ou descendre pendant la marche ; une ceinture qui roule ou comprime peut indiquer une coupe inadaptée. À l'inverse, des plis excessifs peuvent signaler un mauvais ajustement. La bonne réponse n'est pas toujours de prendre automatiquement une taille au-dessus : il faut tenir compte de la coupe et des mesures.</p>
    </section>

    <VerifiedTightsSizeTable />

    <ModelsAndSizes category="collants" />

    <section>
      <h2>4. Opaques, 20 ou 60 deniers : cela change-t-il la taille ?</h2>
      <p>Les <strong>deniers décrivent la masse du fil</strong>, pas une taille de corps. Un collant de 20 deniers et un de 60 deniers peuvent employer la même étiquette de taille, mais cela ne garantit pas la même coupe ni la même extensibilité. Regardez toujours la grille propre au modèle.</p>
      <p>Pour préserver la maille, enfilez vos collants délicatement, après avoir retiré les bijoux qui accrochent. Remontez progressivement de la pointe vers la taille, sans tirer d'un seul coup sur la ceinture.</p>
    </section>

    <AdviceContact category="collants" />
    <p className="lmd-sizing-return"><Link href="/collants-femme">Découvrir nos collants en préparation →</Link> · <Link href="/guide-tailles-chaussettes">Voir le guide des tailles de chaussettes →</Link></p>
  </main>;
}

export function SocksSizeGuide() {
  return <main className="stocking-page stocking-reading lmd-size-guide">
    <SEO title="Guide des tailles chaussettes femme : pointure et pied"
      canonical="/guide-tailles-chaussettes"
      description="Choisir la bonne taille de chaussettes femme : mesurer son pied, comprendre les pointures 35/38, 38/41 et 39/42 et vérifier les tailles uniques." />
    <nav aria-label="Fil d'Ariane" className="stocking-note"><Link href="/">Accueil</Link> · <Link href="/chaussettes-femme">Chaussettes</Link> · Guide des tailles</nav>
    <p className="stocking-eyebrow">LA MAISON DES DESSOUS · NOS CONSEILS</p>
    <h1>Comment choisir la bonne taille de chaussettes ?</h1>
    <p className="stocking-intro">Une jolie paire de chaussettes doit d'abord convenir à vos pieds. Entre une pointure 35/38, un 38/41 et une taille dite « universelle », voici les repères pour faire votre choix en connaissance de cause.</p>
    <GuideNavigation />

    <section>
      <h2>1. Mesurez la longueur de vos pieds.</h2>
      <ol className="lmd-sizing-steps">
        <li><strong>Préparez une feuille, un crayon et une règle :</strong> placez la feuille au sol contre un mur.</li>
        <li><strong>Tenez-vous debout :</strong> posez le talon nu contre le mur, le pied bien à plat sur la feuille. Marquez l'extrémité de l'orteil le plus long.</li>
        <li><strong>Mesurez en centimètres :</strong> de l'arrière du talon à la marque de l'orteil. Recommencez avec l'autre pied ; conservez la mesure la plus grande pour demander conseil.</li>
      </ol>
      <p>La mesure du pied est utile si vous hésitez entre deux pointures. Elle ne permet cependant pas de convertir automatiquement des centimètres en taille de chaussettes sans connaître la grille du modèle.</p>
    </section>

    <section>
      <h2>2. Comprendre les tailles proposées.</h2>
      <div className="lmd-size-terms">
        <div><strong>35/38</strong><span>Fourchette de pointures européennes annoncée : 35 à 38</span></div>
        <div><strong>38/41</strong><span>Fourchette de pointures européennes annoncée : 38 à 41</span></div>
        <div><strong>39/42</strong><span>Fourchette de pointures européennes annoncée : 39 à 42</span></div>
        <div><strong>Universelle</strong><span>Taille unique annoncée, sans plage de pointures confirmée</span></div>
      </div>
      <p><strong>Exemple :</strong> une personne chaussant du 37 peut regarder les modèles étiquetés 35/38. Pour une pointure 38, deux plages se chevauchent ; vérifiez la coupe, la longueur du pied et la grille du modèle avant de trancher.</p>
      <p><strong>« Taille universelle » ne signifie pas « convient à toutes ».</strong> Lorsque la plage de pointures exacte n'est pas documentée, nous ne pouvons pas affirmer qu'elle vous ira. Contactez-nous pour une correspondance vérifiée avant de commander.</p>
    </section>

    <section>
      <h2>3. La bonne hauteur et le bon maintien.</h2>
      <p>Les <strong>socquettes</strong> arrivent généralement plus bas sur la cheville, alors que des <strong>chaussettes longues</strong> montent davantage sur la jambe. Le terme « longues » ne signifie pas automatiquement « jusqu'au genou » : la hauteur exacte doit être vérifiée pour chaque référence.</p>
      <p>Une chaussette trop petite peut comprimer les orteils ou glisser du talon ; une trop grande peut former des plis dans la chaussure. Le bord doit tenir sans serrer excessivement. Si vous avez un mollet fort ou si vous êtes sensible à la pression du bord, demandez-nous les mesures du haut de tige lorsque celles-ci sont disponibles.</p>
      <p>La composition compte aussi pour le toucher et le style : du coton majoritaire pour certaines de nos références, du polyamide et de l'élasthanne pour d'autres. <strong>Le pourcentage de coton ne remplace jamais un guide de pointures.</strong></p>
    </section>

    <ModelsAndSizes category="chaussettes" />

    <section>
      <h2>4. Vous êtes entre deux tailles ?</h2>
      <p>Relevez votre pointure habituelle, la longueur du pied le plus grand et le prénom du modèle qui vous intéresse. Si deux plages se chevauchent, une recommandation doit tenir compte du modèle lui-même ; évitez de choisir au hasard en pensant que tous les tricots s'étirent de la même manière.</p>
      <p>Pour faire durer vos chaussettes, suivez les symboles d'entretien de leur étiquette. Ne déduisez pas une température de lavage uniquement de leur composition.</p>
    </section>

    <AdviceContact category="chaussettes" />
    <p className="lmd-sizing-return"><Link href="/chaussettes-femme">Découvrir nos chaussettes en préparation →</Link> · <Link href="/guide-tailles-collants">Voir le guide des tailles de collants →</Link></p>
  </main>;
}
