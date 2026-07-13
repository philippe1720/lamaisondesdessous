import React from 'react';
import { Link, useRoute } from 'wouter';
import { SEO } from '@/lib/seo';
import { SITE_CONFIG } from '@/lib/config';
import { ARTICLES } from './blog';

type ArticleContent = {
  title: string;
  description: string;
  keywords: string;
  image: string;
  date: string;
  author: string;
  dateISO: string;
  body: React.ReactNode;
};

const CONTENT: Record<string, ArticleContent> = {
  "comment-laver-sa-lingerie-delicate-2026": {
    title: "Comment laver sa lingerie délicate sans l'abîmer",
    description: "Guide complet pour entretenir votre lingerie en dentelle, soie et tulle. Lavage à la main, machine, séchage : tous les conseils pour des dessous toujours impeccables.",
    keywords: "comment laver lingerie, entretien soutien-gorge dentelle, laver lingerie soie, nettoyer dessous féminins, entretien culotte dentelle",
    image: "/images/blog-3.png",
    date: "14 Mars 2026",
    dateISO: "2026-03-14T08:00:00+01:00",
    author: "Sophie, Styliste Lingerie",
    body: (
      <>
        <p>
          Votre lingerie est une investissement dans votre féminité. Une parure en dentelle ou un soutien-gorge en soie mérite une attention toute particulière. Pourtant, beaucoup de femmes font les mêmes erreurs qui abîment irrémédiablement leurs plus belles pièces. Voici le guide ultime pour entretenir vos <strong>dessous féminins</strong> comme une experte.
        </p>

        <h2>Lire les étiquettes : la règle d'or</h2>
        <p>
          Avant tout, prenez l'habitude de lire les étiquettes d'entretien cousues dans chaque pièce. Un pictogramme représentant une cuve avec la main signifie "lavage à la main uniquement". Un triangle barré indique qu'aucun agent de blanchiment ne doit être utilisé. Ces indications ne sont pas de simples recommandations : elles conditionnent la durée de vie de votre <strong>lingerie féminine</strong>.
        </p>

        <h2>Le lavage à la main : la méthode royale</h2>
        <p>
          Pour toute lingerie en dentelle, soie ou broderie délicate, le lavage à la main reste la méthode la plus douce et la plus sûre. Voici comment procéder :
        </p>
        <ul>
          <li><strong>Eau tiède à 30°C maximum</strong> — jamais d'eau chaude qui dégrade les fibres et détend les élastiques.</li>
          <li><strong>Lessive spéciale lingerie</strong> ou shampoing doux — quelques gouttes suffisent.</li>
          <li><strong>Immerger et presser délicatement</strong> sans frotter ni tordre — les frottements déchirent la dentelle.</li>
          <li><strong>Rincer abondamment</strong> à l'eau froide jusqu'à ce que l'eau soit parfaitement claire.</li>
          <li><strong>Essorer en pressant doucement</strong> dans une serviette éponge — ne jamais tordre.</li>
        </ul>

        <h2>La machine à laver : possible mais avec précautions</h2>
        <p>
          Si vous ne pouvez pas vous passer de la machine, voici les règles absolues pour ne pas sacrifier vos <strong>soutiens-gorge en dentelle</strong> :
        </p>
        <ul>
          <li>Utilisez toujours un <strong>filet de protection</strong> — c'est non négociable. Il protège la dentelle des frottements et empêche les bonnets de se déformer.</li>
          <li>Sélectionnez le programme <strong>"délicat" ou "laine"</strong> à 30°C maximum.</li>
          <li>Utilisez un <strong>essorage faible</strong> (400 tours/minute au maximum).</li>
          <li>Fermez tous les agrafes avant de mettre en machine pour éviter qu'elles n'accrochent d'autres pièces.</li>
          <li>Ne jamais mélanger lingerie et jeans ou vêtements rugueux.</li>
        </ul>

        <h2>Le séchage : l'étape la plus critique</h2>
        <p>
          Le sèche-linge est l'ennemi numéro un de votre lingerie. La chaleur détend les élastiques, rétrécit les fibres et déforme les bonnets des soutiens-gorge. La règle est simple : <strong>jamais de sèche-linge pour la lingerie délicate</strong>.
        </p>
        <p>
          Faites sécher vos pièces à plat sur une serviette ou suspendues à l'horizontale, à l'abri du soleil direct qui décolore les teintes. Pour les bonnets de soutien-gorge, remettez-les en forme à la main pendant qu'ils sont encore humides.
        </p>

        <h2>Ranger sa lingerie intelligemment</h2>
        <p>
          Un bon rangement prolonge la vie de vos pièces. Rangez vos soutiens-gorge debout, bonnets emboîtés l'un dans l'autre plutôt que repliés en deux — cela préserve la forme. Plier un bonnet en deux crée des plis permanents dans le tissu. Pour les culottes et strings, pliez-les simplement ou enroulez-les délicatement.
        </p>

        <h2>À quelle fréquence laver sa lingerie ?</h2>
        <p>
          Les <strong>culottes et tangas</strong> : après chaque port, c'est une question d'hygiène. Les <strong>soutiens-gorge</strong> : après 2 à 3 ports maximum, ou dès qu'ils semblent moins frais. Les <strong>nuisettes et habillages de nuit</strong> : après 2 ou 3 nuits. Évitez de laver inutilement — chaque lavage use les fibres.
        </p>

        <blockquote>
          Une lingerie bien entretenue dure des années. C'est le secret des femmes qui portent toujours des dessous impeccables.
        </blockquote>
      </>
    )
  },

  "morphologie-quelle-lingerie-pour-vous-2026": {
    title: "Quelle lingerie selon votre morphologie ?",
    description: "Guide complet pour choisir sa lingerie selon sa morphologie : sablier, poire, rectangle, pomme. Sublimez votre silhouette avec les bons dessous féminins.",
    keywords: "lingerie morphologie, choisir lingerie silhouette, soutien-gorge morphologie, lingerie femme ronde, lingerie poitrine généreuse",
    image: "/images/blog-1.png",
    date: "02 Février 2026",
    dateISO: "2026-02-02T08:00:00+01:00",
    author: "Camille, Conseil en Image",
    body: (
      <>
        <p>
          La lingerie n'est pas universelle. Ce qui sublime une silhouette peut en déséquilibrer une autre. Connaître votre morphologie est la clé pour choisir des <strong>dessous féminins</strong> qui vous mettent en valeur naturellement et vous donnent une confiance absolue.
        </p>

        <h2>La morphologie Sablier : courbes généreuses et proportionnées</h2>
        <p>
          Vous avez des épaules et des hanches à peu près de la même largeur, avec une taille bien marquée ? Vous avez la morphologie sablier — considérée comme la plus "classique" pour la lingerie. Presque tout vous va !
        </p>
        <ul>
          <li><strong>Soutien-gorge</strong> : tous les styles s'adaptent. Favorisez les modèles à armatures pour un maintien optimal si votre poitrine est généreuse.</li>
          <li><strong>Culotte</strong> : les culottes taille haute mettent encore davantage en valeur votre taille marquée. Les strings et tangas subliment vos hanches.</li>
          <li><strong>À éviter</strong> : les brassières sans maintien si vous avez une forte poitrine.</li>
        </ul>

        <h2>La morphologie Poire : hanches plus larges que les épaules</h2>
        <p>
          Vos hanches sont plus larges que vos épaules et vous avez une taille fine ? Cette morphologie très féminine demande une attention particulière pour équilibrer la silhouette.
        </p>
        <ul>
          <li><strong>Soutien-gorge</strong> : optez pour des modèles avec un beau décolleté, des bretelles larges ou des détails au niveau du décolleté pour élargir visuellement le buste. Les balconnets sont parfaits.</li>
          <li><strong>Culotte</strong> : les culottes brésiliennes et les tangas qui couvrent partiellement les hanches sont vos alliées. Évitez les culottes taille très haute qui accentuent la largeur des hanches.</li>
          <li><strong>Ensemble lingerie</strong> : jouez sur les contrastes — soutien-gorge à motifs et culotte unie.</li>
        </ul>

        <h2>La morphologie Rectangle : silhouette athlétique et droite</h2>
        <p>
          Épaules, taille et hanches sont à peu près de la même largeur. Votre silhouette est droite et sportive. L'objectif est de créer l'illusion de courbes.
        </p>
        <ul>
          <li><strong>Soutien-gorge</strong> : les push-up et les modèles rembourrés créent du galbe. Les balconnets avec dentelle froncée ajoutent du volume à la poitrine.</li>
          <li><strong>Culotte</strong> : les strings brésiliens aux découpes latérales créent une illusion de courbes au niveau des hanches. Les culottes à volants ou avec des détails côté hanche sont excellentes.</li>
          <li><strong>À privilégier</strong> : les ensembles à motifs all-over qui créent du mouvement sur l'ensemble de la silhouette.</li>
        </ul>

        <h2>La morphologie Pomme : buste plus développé que les hanches</h2>
        <p>
          Votre buste, poitrine et ventre sont plus développés que vos hanches et vos jambes. La lingerie doit valoriser vos atouts — vos jolies jambes et vos épaules — tout en apportant du confort.
        </p>
        <ul>
          <li><strong>Soutien-gorge</strong> : les grandes tailles avec armatures offrent un maintien essentiel. Les modèles minimiseurs existent si vous souhaitez affiner visuellement la poitrine.</li>
          <li><strong>Culotte</strong> : les culottes gainantes légères et les bodies flattent la silhouette. Les shorties couvrants sont confortables et élégants.</li>
          <li><strong>Tissu</strong> : privilégiez les matières qui "respirent" comme le coton et la microfibre pour un confort optimal.</li>
        </ul>

        <h2>La morphologie Triangle inversé : épaules larges, hanches étroites</h2>
        <p>
          Vos épaules sont plus larges que vos hanches. Votre silhouette rappelle celle des athlètes.
        </p>
        <ul>
          <li><strong>Soutien-gorge</strong> : évitez les modèles trop structurés qui élargissent davantage les épaules. Préférez les brassières légères ou les soutiens-gorge à bretelles fines.</li>
          <li><strong>Culotte</strong> : les culottes taille haute à volants et les shortys avec détails ajoutent du volume aux hanches pour équilibrer la silhouette.</li>
        </ul>

        <h2>Le conseil universel</h2>
        <p>
          Au-delà de la morphologie, la lingerie qui vous rend belle est avant tout celle dans laquelle vous vous sentez belle. Portez ce qui vous fait vibrer, ce qui vous donne envie de vous regarder dans un miroir et de sourire. Votre <strong>soutien-gorge en dentelle romantique</strong>, votre culotte préférée — ce sont des choix émotionnels autant que pratiques.
        </p>

        <blockquote>
          La plus belle lingerie est celle que l'on porte avec confiance. Toutes les morphologies méritent des dessous d'exception.
        </blockquote>
      </>
    )
  },

  "tendances-lingerie-printemps-2025": {
    title: "Les tendances lingerie du printemps 2025",
    description: "Dentelles florales, tons corail et coupes audacieuses : découvrez les tendances lingerie incontournables du printemps 2025 pour sublimer votre féminité.",
    keywords: "tendances lingerie 2025, lingerie printemps 2025, mode dessous féminins, lingerie dentelle florale, tendances sous-vêtements femme",
    image: "/images/blog-2.png",
    date: "18 Avril 2025",
    dateISO: "2025-04-18T08:00:00+01:00",
    author: "Léa, Rédactrice Mode",
    body: (
      <>
        <p>
          Le printemps 2025 marque un tournant dans l'univers de la <strong>lingerie féminine</strong>. Après des années de minimalisme, les créateurs redécouvrent l'ornement, la couleur et l'audace. Voici les tendances qui font battre le cœur des femmes cette saison.
        </p>

        <h2>Le rose dans tous ses états</h2>
        <p>
          Du blush poudré au rose vibrant, le rose s'impose comme la couleur de la saison. Les <strong>parures de lingerie rose</strong> envahissent les collections avec une féminité assumée et joyeuse. Loin des clichés, ce rose 2025 est celui des femmes fortes qui revendiquent leur sensualité sans complexe.
        </p>

        <h2>La dentelle florale en relief</h2>
        <p>
          La dentelle ne se contente plus d'être un motif plat. Cette saison, elle se sculpte en trois dimensions — fleurs en relief, broderies qui débordent du tissu, pétales appliqués. Ces <strong>soutiens-gorge en dentelle romantique</strong> transforment chaque pièce de lingerie en véritable œuvre d'art que l'on ose parfois porter visible sous un vêtement transparent.
        </p>

        <h2>Les coupes ouvertes et audacieuses</h2>
        <p>
          Le soutien-gorge à bonnets ouverts — longtemps cantonné à la lingerie "spéciale" — entre dans le mainstream. Il révèle, suggère, libère. Associé à un tulle fluide et à des bijoux métalliques, il incarne parfaitement l'esprit de la saison : <strong>audacieuse mais raffinée</strong>.
        </p>

        <h2>Le confort comme luxe suprême</h2>
        <p>
          La tendance comfort-luxe s'affirme en 2025. Les femmes refusent de choisir entre beauté et confort. Les marques répondent avec des <strong>ensembles lingerie</strong> alliant dentelle exquise et maintien parfait, microfibre ultra-douce et finitions luxueuses. Le confort devient le nouveau luxe.
        </p>

        <h2>Les bijoux incorporés</h2>
        <p>
          Petits pendentifs métalliques, chaînettes délicates, strass discrets — la lingerie se bijoutise. Ces détails captent la lumière et transforment une simple parure en accessoire de glamour. Le détail qui fait toute la différence.
        </p>

        <blockquote>
          En 2025, la lingerie n'est plus cachée — elle est célébrée.
        </blockquote>
      </>
    )
  },

  "choisir-son-soutien-gorge-taille-confort": {
    title: "Bien choisir son soutien-gorge : taille, forme et confort",
    description: "80% des femmes portent la mauvaise taille de soutien-gorge. Guide complet pour trouver votre taille exacte et choisir le modèle adapté à votre poitrine et morphologie.",
    keywords: "choisir taille soutien-gorge, soutien-gorge confort, guide taille soutien-gorge, bonnets soutien-gorge, soutien-gorge morphologie",
    image: "/images/photo4.jpg",
    date: "07 Janvier 2025",
    dateISO: "2025-01-07T08:00:00+01:00",
    author: "Marie, Experte Lingerie",
    body: (
      <>
        <p>
          Selon les études, environ 80% des femmes portent un <strong>soutien-gorge</strong> qui ne correspond pas à leur vraie taille. Ce chiffre est vertigineux — et ses conséquences se font sentir au quotidien : douleurs dans le dos, bretelles qui glissent, bonnets qui débordent ou au contraire qui flottent. Voici comment enfin trouver la pièce parfaite.
        </p>

        <h2>Comment mesurer sa vraie taille ?</h2>
        <p>
          Vous aurez besoin d'un mètre ruban souple. Réalisez vos mesures en sous-vêtements ou torse nu, idéalement debout et naturellement.
        </p>
        <ul>
          <li><strong>Tour de dessous de poitrine</strong> : mesurez juste sous la poitrine, à plat contre la peau. Notez le chiffre en centimètres — c'est votre tour de poitrine (65, 70, 75, 80, 85, 90...).</li>
          <li><strong>Tour de poitrine</strong> : mesurez au niveau des pointes des seins, sans tirer. Notez ce chiffre.</li>
          <li><strong>Calcul du bonnet</strong> : soustrayez le tour de dessous de poitrine du tour de poitrine. Chaque tranche de 2,5 cm correspond à une taille de bonnet (A, B, C, D, E...).</li>
        </ul>

        <h2>Les signes que votre soutien-gorge ne vous va pas</h2>
        <ul>
          <li>L'armature creuse dans la peau ou s'éloigne du corps — taille trop petite ou bonnet trop grand.</li>
          <li>Les bonnets débordent — bonnet trop petit.</li>
          <li>Les bonnets flottent — bonnet trop grand.</li>
          <li>Les bretelles tombent constamment — tour de dos trop grand ou bretelles mal ajustées.</li>
          <li>Le dos remonte — tour de dos trop grand, passez à une taille en dessous.</li>
        </ul>

        <h2>Quel modèle selon la forme de votre poitrine ?</h2>
        <p>
          <strong>Poitrine ronde et généreuse</strong> : l'armature est votre alliée. Elle maintient et soulève sans douleur. Optez pour des bonnets profonds et des bretelles larges qui répartissent le poids.
        </p>
        <p>
          <strong>Poitrine menue</strong> : le push-up crée du galbe et du volume. Le balconnet sublime la décolleté. La brassière en dentelle apporte une touche romantic.
        </p>
        <p>
          <strong>Poitrine asymétrique</strong> (très fréquent !) : ajustez toujours à la poitrine la plus grande. Certains soutiens-gorge proposent des bonnets légèrement rembourrés pour compenser.
        </p>
        <p>
          <strong>Poitrine tombante</strong> : l'armature et les bonnets profonds offrent le meilleur maintien. Évitez les brassières sans structure.
        </p>

        <h2>Quand remplacer son soutien-gorge ?</h2>
        <p>
          Un <strong>soutien-gorge de qualité</strong> dure en moyenne 6 à 12 mois avec un entretien soigneux. Les signes qu'il est temps d'en changer : l'élastique du dos s'est détendu même sur l'agrafe la plus serrée, les bretelles ne tiennent plus malgré les ajustements, les bonnets ont perdu leur forme. N'attendez pas — un soutien-gorge usé ne vous soutient plus et peut causer des douleurs.
        </p>

        <blockquote>
          Trouver sa vraie taille de soutien-gorge est une révélation. C'est le moment où l'on comprend à quel point on s'était habituée à l'inconfort.
        </blockquote>
      </>
    )
  },

  "rituel-beaute-et-confiance-en-soi": {
    title: "Rituel beauté : l'importance de la belle lingerie",
    description: "La confiance en soi commence par la lingerie que l'on porte. Découvrez comment les dessous féminins transforment votre posture, votre humeur et votre regard sur vous-même.",
    keywords: "lingerie confiance en soi, belle lingerie bien-être, dessous féminins beauté, lingerie luxe rituel beauté, sous-vêtements femme confiance",
    image: "/images/femmelingerierouge.jpeg",
    date: "28 Octobre 2024",
    dateISO: "2024-10-28T08:00:00+01:00",
    author: "Sophie, Créatrice",
    body: (
      <>
        <p>
          Il y a quelque chose de presque magique dans le fait d'enfiler une belle lingerie. Quelque chose qui se passe avant même de vous regarder dans un miroir — un changement subtil dans la façon dont vous vous tenez, dont vous marchez, dont vous souriez. La <strong>lingerie féminine de qualité</strong> est bien plus qu'un vêtement. C'est un état d'esprit.
        </p>

        <h2>La science derrière le sentiment</h2>
        <p>
          Des études en psychologie du vêtement montrent que ce que nous portons contre notre peau influence directement notre humeur et notre comportement. Ce phénomène, appelé "enclothed cognition", démontre que nos vêtements — y compris ceux que personne ne voit — modifient notre posture corporelle et notre façon de nous percevoir. Porter une belle <strong>parure de lingerie</strong> agit comme un signal envoyé à votre cerveau : tu mérites le meilleur.
        </p>

        <h2>Le rituel du matin</h2>
        <p>
          Incorporer le choix de votre lingerie à votre rituel matinal est l'une des habitudes les plus puissantes que vous pouvez adopter. Prenez deux minutes le matin pour choisir consciemment vos dessous en fonction de comment vous voulez vous sentir :
        </p>
        <ul>
          <li><strong>Une réunion importante</strong> ? Choisissez une parure sophistiquée qui vous donnera un sentiment d'autorité et de confiance.</li>
          <li><strong>Une journée créative</strong> ? Optez pour des couleurs vives qui stimulent l'énergie.</li>
          <li><strong>Un moment pour vous</strong> ? La <strong>nuisette en soie</strong> ou l'ensemble romantique qui vous fait vous sentir précieuse.</li>
        </ul>

        <h2>S'offrir de la belle lingerie : un acte d'amour-propre</h2>
        <p>
          Combien de fois repoussez-vous l'achat d'une belle lingerie en vous disant que ce n'est "pas nécessaire", que vous attendrez "une occasion spéciale" ? C'est une erreur. Chaque journée est une occasion spéciale. Vous méritez de porter des <strong>dessous féminins</strong> qui vous rendent belle aujourd'hui, pas dans un futur hypothétique.
        </p>
        <p>
          S'acheter une belle parure de lingerie, c'est se dire : je suis importante, mon confort compte, ma féminité mérite d'être célébrée. C'est l'un des gestes d'amour-propre les plus accessibles et les plus puissants.
        </p>

        <h2>La lingerie comme secret entre vous et vous</h2>
        <p>
          Il y a une beauté particulière dans le fait que votre belle lingerie n'est visible que pour vous (et pour qui vous choisissez de la montrer). C'est un secret que vous portez toute la journée — un rappel constant de votre valeur, de votre sensualité, de votre soin envers vous-même. Sous le tailleur de bureau ou le jean du week-end, vous savez ce que vous portez. Et ça change tout.
        </p>

        <blockquote>
          La lingerie la plus luxueuse n'est pas celle qui coûte le plus cher — c'est celle qui vous fait vous sentir exactement comme vous méritez de vous sentir.
        </blockquote>
      </>
    )
  },
  "lingerie-haut-de-gamme-pourquoi-investir-qualite": {
  title: "Lingerie haut de gamme : pourquoi investir dans la qualité",
  description: "Découvrez pourquoi la lingerie haut de gamme est un investissement durable. Matières nobles, finitions soignées, confort longue durée : on vous explique tout.",
  keywords: "lingerie haut de gamme, qualité lingerie, investir lingerie, matières nobles lingerie, durabilité sous-vêtements",
  image: "/images/soutiengorgesexy.jpg",
  date: "28 Juin 2026",
  dateISO: "2026-06-28T08:00:00+01:00",
  author: "Sophie, Créatrice",
  body: (
    <>
      <p>
        On a tous déjà craqué pour un ensemble à petit prix, séduit par une promotion. Et on a tous, aussi, connu la déception : une dentelle qui gratte dès le premier lavage, des bretelles qui se détendent en quelques semaines, des coutures qui lâchent. La lingerie bon marché a un coût caché : celui de devoir la racheter, encore et encore.
      </p>
      <p>
        Investir dans une lingerie haut de gamme, c'est changer complètement de logique. Voici pourquoi cette différence se ressent dès le premier port, et pourquoi elle compte sur la durée.
      </p>

      <h2>Des matières qui font toute la différence</h2>
      <p>
        La première chose qui distingue une lingerie de qualité, c'est ce qui la compose. Le coton biologique, le tulle fin, la dentelle véritable ou la soie ne se comportent pas comme leurs équivalents synthétiques bas de gamme : ils respirent, épousent la peau sans la marquer, et conservent leur élasticité lavage après lavage.
      </p>
      <p>
        Les matières nobles ont aussi un atout souvent oublié : elles sont hypoallergéniques et beaucoup plus douces au contact direct de la peau, un critère essentiel pour un vêtement porté à même le corps toute une journée.
      </p>

      <h2>La durabilité, un investissement plus malin qu'il n'y paraît</h2>
      <p>
        Un ensemble de lingerie bon marché se déforme généralement après quelques dizaines de lavages : les bonnets perdent leur forme, les bretelles s'élargissent, la dentelle se détend. Résultat, on le remplace en moyenne deux à trois fois plus vite qu'une pièce haut de gamme.
      </p>
      <p>
        Une lingerie de qualité, à l'inverse, est pensée pour durer. Les finitions soignées, les coutures renforcées et les matières résistantes au lavage permettent à une pièce de conserver sa forme et son éclat largement plus longtemps. Sur une année, voire plusieurs, l'écart de prix initial se trouve largement compensé par cette longévité : on achète moins souvent, mais on achète mieux.
      </p>

      <h2>Le confort, fondement de la confiance en soi</h2>
      <p>
        Au-delà de l'esthétique, le vrai luxe d'une lingerie haut de gamme, c'est de ne plus y penser une fois qu'on la porte. Une pièce mal coupée ou dans une matière de mauvaise qualité se rappelle à vous toute la journée : ça gratte, ça comprime, ça glisse.
      </p>
      <p>
        Une lingerie pensée avec soin, à l'inverse, épouse vos formes sans jamais les contraindre. Ce confort invisible a un effet direct sur la posture, l'aisance et la confiance en soi — bien plus qu'un simple détail technique.
      </p>

      <h2>Des finitions qui se voient et qui se sentent</h2>
      <p>
        C'est souvent dans les détails que se niche la vraie qualité : une dentelle finement travaillée plutôt qu'imprimée, des bretelles réglables qui ne se vrillent pas, des fermoirs métalliques plutôt qu'en plastique fragile. Ces choix de fabrication, invisibles au premier coup d'œil, sont précisément ce qui distingue une pièce d'exception d'un produit jetable.
      </p>

      <h2>Un choix qui a aussi du sens</h2>
      <p>
        Privilégier la qualité, c'est également s'inscrire dans une consommation plus réfléchie. Moins de pièces achetées dans l'année, mais des pièces qui durent réellement : c'est un choix à la fois économique et plus respectueux, loin de la logique du renouvellement permanent.
      </p>

      <p>
        Chez <strong>La Maison des Dessous</strong>, chaque pièce est pensée dans cet esprit : des matières nobles, des finitions soignées, et un souci du détail qui se ressent dès le premier port.
      </p>
    </>
  ),
},

  "comment-choisir-sa-lingerie-de-nuit": {
    title: "Comment bien choisir son habillage de nuit",
    description: "Nuisette en soie ou combinaison satinée ? Guide complet pour choisir votre habillage de nuit selon vos envies, votre morphologie et la saison.",
    keywords: "habillage de nuit, nuisette soie, combinaison satinée, lingerie de nuit, choisir pyjama femme, dessous féminins nuit",
    image: "/images/lingeriedenuit.jpg",
    date: "12 Juin 2024",
    dateISO: "2024-06-12T08:00:00+01:00",
    author: "Sophie, Créatrice",
    body: (
      <>
        <p>
          La nuit représente un tiers de notre vie. Pourtant, combien d'entre nous accordent à l'<strong>habillage de nuit</strong> la même attention qu'aux tenues du jour ? Un vêtement de nuit soigneusement choisi transforme le simple fait de dormir en une expérience sensorielle — et les quelques minutes du coucher en un rituel de douceur et de féminité.
        </p>

        <h2>La matière, fondement du choix</h2>
        <p>
          Le contact de la matière avec votre peau durant toute la nuit est primordial. Voici les meilleures options pour votre <strong>lingerie de nuit</strong> :
        </p>
        <ul>
          <li><strong>La soie naturelle</strong> : incomparable. Thermorégulatrice, elle est fraîche en été et garde la chaleur en hiver. Elle caresse la peau, limite les frottements (excellent pour les cheveux et la peau) et offre un tombé luxueux. C'est le nec plus ultra.</li>
          <li><strong>La satin de polyester</strong> : l'alternative accessible à la soie. Aspect similaire, prix plus doux. Moins respirant que la soie mais très agréable.</li>
          <li><strong>La dentelle</strong> : pour les pièces de nuit romantiques. Associée à une doublure en jersey doux, elle est à la fois belle et confortable.</li>
          <li><strong>Le jersey et la modal</strong> : pour les femmes qui privilégient avant tout le confort. Doux, extensible, ils épousent le corps sans contrainte.</li>
        </ul>

        <h2>Nuisette, combinaison ou chemise de nuit ?</h2>
        <p>
          <strong>La nuisette</strong> (longueur mi-cuisse) est l'option la plus polyvalente. Féminine et élégante, elle convient à presque toutes les morphologies. Elle est idéale si vous avez chaud la nuit.
        </p>
        <p>
          <strong>La combinaison longue</strong> apporte une élégance digne des héroïnes de films noirs. Elle couvre sans alourdir et est parfaite si vous souffrez du froid la nuit.
        </p>
        <p>
          <strong>La chemise de nuit</strong> romantique, avec ses volants et sa dentelle, évoque un boudoir d'antan. C'est le choix de celles qui veulent sentir l'esprit du luxe même dans leur sommeil.
        </p>

        <h2>Adapter son habillage de nuit à la saison</h2>
        <p>
          En <strong>été</strong> : privilégiez les matières légères et respirantes. Une nuisette courte en soie ou en satin léger vous gardera fraîche. Évitez la dentelle épaisse qui retient la chaleur.
        </p>
        <p>
          En <strong>hiver</strong> : la combinaison longue en jersey ou en modal sera votre alliée. Vous pouvez la compléter d'un déshabillé en dentelle pour le glamour et d'une liseuse en cachemire pour la chaleur.
        </p>

        <h2>L'habillage de nuit comme rituel de beauté</h2>
        <p>
          Choisir un bel <strong>habillage de nuit</strong> fait partie du rituel du soir au même titre que le démaquillage ou le soin de nuit. C'est un signal envoyé à votre corps : le temps de la récupération commence. Ce glissement du vêtement de la journée vers la lingerie de nuit est une transition douce entre deux états — l'action et le repos, le monde extérieur et votre espace intime.
        </p>

        <blockquote>
          Vos nuits méritent autant de soin que vos journées. La belle lingerie de nuit est le luxe le plus intime qui soit.
        </blockquote>
      </>
    )
  },
  "lingerie-ete-vacances-conseils-matieres": {
  title: "Lingerie d'été : comment rester fraîche et élégante en vacances",
  description: "Quelles matières privilégier pour votre lingerie en été ? Nos conseils pour rester au frais tout en restant élégante, à la plage comme en voyage.",
  keywords: "lingerie été, lingerie vacances, matières respirantes lingerie, lingerie chaleur, dentelle été",
  image: "/images/blog-4.jpg",
  date: "1 Juillet 2026",
  dateISO: "2026-07-01T08:00:00+01:00",
  author: "Sophie, Créatrice",
  body: (
    <>
      <p>
        Les beaux jours arrivent, la valise se prépare, et un détail échappe souvent à l'attention jusqu'au dernier moment : la lingerie. Pourtant, c'est elle qui conditionne tout le reste. Le confort sous une robe légère, la liberté de mouvement en plein soleil, l'aisance pendant les longues journées de chaleur. Voici comment bien choisir sa lingerie pour traverser l'été sans y penser.
      </p>

      <h2>Pourquoi la matière compte plus que tout en été</h2>
      <p>
        L'hiver pardonne beaucoup : une matière un peu épaisse, une doublure synthétique, tout cela passe inaperçu sous plusieurs couches de vêtements. L'été est bien plus exigeant. La peau transpire davantage et frotte plus directement contre le tissu. Une lingerie inadaptée se rappelle alors à vous toute la journée, alors qu'une pièce bien choisie se fait complètement oublier.
      </p>
      <p>
        Le problème n'est jamais la transpiration en elle-même, c'est naturel et sain. Ce qui pose souci, c'est une matière qui ne sait pas l'évacuer : l'humidité reste prisonnière contre la peau, la pièce colle, et les irritations ne sont jamais loin.
      </p>

      <h2>Les matières à privilégier quand il fait chaud</h2>
      <p>
        La dentelle fine et le tulle léger restent d'excellents choix estivaux : contrairement aux idées reçues, une dentelle de qualité laisse largement mieux respirer la peau qu'une microfibre synthétique. C'est d'ailleurs tout l'intérêt d'une lingerie haut de gamme : les matières nobles sont pensées pour épouser la peau sans jamais l'étouffer.
      </p>
      <p>
        À l'inverse, mieux vaut éviter les doublures plastifiées et les matières trop brillantes, qui emprisonnent la chaleur et retiennent l'humidité contre la peau bien plus longtemps qu'il n'est confortable.
      </p>

      <h2>Le confort avant tout, même en vacances</h2>
      <p>
        En été, on a naturellement envie de légèreté : des bretelles fines mais bien réglables, des coupes qui ne compriment pas, des matières qui suivent chaque mouvement. C'est aussi le moment idéal pour redécouvrir des pièces plus délicates, moins couvrantes, que l'on garde parfois de côté le reste de l'année.
      </p>

      <h2>Une lingerie qui voyage bien</h2>
      <p>
        Autre avantage des matières fines comme la dentelle et le tulle : elles se froissent très peu et reprennent leur forme presque instantanément, même roulées au fond d'une valise. C'est un vrai atout pour les vacances, où l'on n'a ni le temps ni l'envie de repasser sa lingerie avant de la porter.
      </p>

      <p>
        Chez <strong>La Maison des Dessous</strong>, nos pièces en dentelle et tulle léger ont justement été pensées pour accompagner chaque saison, été compris. Découvrez notre <a href="/produit">collection Intimari Rose</a> et préparez votre valise l'esprit tranquille.
      </p>
    </>
  )
},
  "soutien-gorge-mal-ajuste-signes-solutions": {
    title: "Soutien-gorge mal ajusté : 5 signes qui ne trompent pas",
    description: "Bretelles qui glissent, dos qui remonte ou poitrine qui déborde ? Découvrez les signes d'un soutien-gorge mal ajusté et les solutions pour retrouver du confort.",
    keywords: "soutien-gorge mal ajusté, soutien-gorge qui remonte, bretelles qui glissent, bonnet trop petit, choisir soutien-gorge",
    image: "/images/soutiengorge.jpeg",
    date: "13 Juillet 2026",
    dateISO: "2026-07-13T08:00:00+02:00",
    author: "Sophie, Créatrice",
    body: (
      <>
        <p>
          Un soutien-gorge ne devrait jamais être une source d'inconfort. Pourtant, il suffit d'une taille ou d'une coupe mal adaptée pour provoquer des bretelles qui tombent, des bonnets qui débordent ou une bande qui remonte dans le dos. Voici les signes à reconnaître pour retrouver une lingerie agréable à porter.
        </p>

        <h2>La bande remonte dans le dos</h2>
        <p>
          La bande sous la poitrine assure l'essentiel du maintien. Si elle remonte dans le dos, le tour est probablement trop grand ou l'élastique s'est détendu. Essayez un réglage plus serré ou un tour de dos inférieur.
        </p>

        <h2>La poitrine déborde des bonnets</h2>
        <p>
          Un débordement au-dessus ou sur les côtés indique généralement que les bonnets sont trop petits. Essayez un bonnet supérieur tout en conservant le même tour de dos afin de donner davantage de place à la poitrine.
        </p>

        <h2>Les bonnets forment des plis</h2>
        <p>
          Des bonnets qui bâillent ne signifient pas toujours qu'ils sont trop grands. La forme du modèle peut simplement ne pas correspondre à votre poitrine. Un balconnet, un triangle ou un soutien-gorge plus souple peut offrir un meilleur ajustement.
        </p>

        <h2>Les bretelles glissent constamment</h2>
        <p>
          Commencez par régler leur longueur. Si elles continuent de tomber, le tour de dos peut être trop large ou les bretelles trop écartées pour vos épaules. Un modèle à bretelles rapprochées ou croisées sera souvent plus adapté.
        </p>

        <h2>Les armatures deviennent douloureuses</h2>
        <p>
          Les armatures doivent entourer la poitrine sans la piquer ni l'écraser. Une gêne persistante peut signaler un bonnet trop petit, une armature trop étroite ou une coupe inadaptée à votre morphologie.
        </p>

        <h2>Le bon soutien-gorge se fait oublier</h2>
        <p>
          La bande doit rester horizontale, les bonnets doivent envelopper toute la poitrine et les bretelles doivent tenir sans creuser les épaules. N'hésitez pas à essayer plusieurs formes : deux soutiens-gorge affichant la même taille peuvent offrir un résultat très différent.
        </p>

        <p>
          Chez <strong>La Maison des Dessous</strong>, nous sélectionnons des ensembles qui associent féminité et confort. Découvrez notre <a href="/produit">collection de lingerie</a> et trouvez la pièce qui saura mettre votre silhouette en valeur.
        </p>

        <blockquote>
          Un soutien-gorge bien choisi ne comprime pas votre corps : il accompagne naturellement chacun de vos mouvements.
        </blockquote>
      </>
    )
  },
};

export default function BlogArticle() {
  const [, params] = useRoute('/blog/:slug');
  const slug = params?.slug ?? '';
  const article = CONTENT[slug];
  const meta = ARTICLES.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-serif text-3xl font-bold mb-6">Article introuvable</h1>
        <Link href="/blog" className="text-primary underline underline-offset-4">
          Retour au blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={article.title}
        description={article.description}
        keywords={article.keywords}
        canonical={`/blog/${slug}`}
        type="article"
        image={article.image}
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": article.title,
            "description": article.description,
            "image": [`${SITE_CONFIG.url}${article.image}`],
            "datePublished": article.dateISO,
            "author": [{
              "@type": "Person",
              "name": article.author
            }],
            "publisher": {
              "@type": "Organization",
              "name": SITE_CONFIG.name,
              "url": SITE_CONFIG.url
            }
          })}
        </script>
      </SEO>

      <article className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-10">
          <Link href="/blog" className="text-primary text-sm tracking-widest uppercase hover:underline underline-offset-4">
            &larr; Retour au blog
          </Link>
        </div>

        <header className="mb-16">
          {meta && (
            <span className="inline-block bg-primary/10 text-primary text-xs px-3 py-1 font-medium tracking-wider uppercase mb-6">
              {meta.category}
            </span>
          )}
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 leading-tight">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10">
            <span>{article.date}</span>
            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
            <span>par {article.author}</span>
            {meta && (
              <>
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                <span>{meta.readTime} de lecture</span>
              </>
            )}
          </div>
          <div className="aspect-[21/9] overflow-hidden w-full relative">
            <img
              src={article.image}
              alt={article.title}
              className="object-cover w-full h-full"
              width={1200}
              height={514}
            />
          </div>
        </header>

        <div className="prose prose-lg prose-p:font-light prose-p:leading-relaxed prose-p:text-muted-foreground prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground prose-li:text-muted-foreground prose-li:font-light prose-blockquote:border-l-primary prose-blockquote:text-foreground prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-xl prose-strong:text-foreground prose-strong:font-semibold max-w-none">
          {article.body}
        </div>

        <div className="mt-20 pt-12 border-t border-border">
          <h2 className="font-serif text-2xl font-bold mb-8 text-center">Lire aussi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ARTICLES.filter(a => a.slug !== slug).slice(0, 2).map(related => (
              <Link href={`/blog/${related.slug}`} key={related.slug}>
                <div className="group flex gap-4 cursor-pointer" data-testid={`related-${related.slug}`}>
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                    <img
                      src={related.image}
                      alt={related.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-primary uppercase tracking-widest mb-1">{related.date}</div>
                    <h3 className="font-serif font-bold leading-snug group-hover:text-primary transition-colors">{related.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}
