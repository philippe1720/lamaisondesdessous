import { Link } from 'wouter';
import { SEO } from '@/lib/seo';

export default function QuiSommesNous() {
  return <main className="stocking-page stocking-reading">
    <SEO title="Habiller les jambes féminines au quotidien" description="La Maison des Dessous accompagne les femmes dans tous leurs moments : bas de lingerie, collants et chaussettes, à leur façon." canonical="/qui-sommes-nous"/>
    <p className="stocking-eyebrow">LA MAISON DES DESSOUS</p>
    <h1>La femme est l’avenir de la femme.</h1><p>Une femme peut aimer son indépendance, sa vie de famille, son travail et les moments à deux. Elle peut prendre sa place et construire avec l’autre. Ici, nous aimons cette liberté de choisir sa vie et sa façon de se sentir belle.</p><p>Nos bas accompagnent une envie, une tenue, un moment à soi ou partagé. La séduction peut être un plaisir pour soi et une complicité à deux, à votre rythme.</p><h2>Les jambes, jusque dans le détail.</h2>
    <p>Une couture derrière la jambe, un voile léger, une jarretière en dentelle : les bas changent une tenue avec peu de chose. C’est ce détail qui m’a donné envie de leur consacrer une boutique.</p>
    <h2>Pourquoi cette attention portée aux jambes féminines ?</h2>
    <p>Je m’appelle Philippe. Avec La Maison des Dessous, je souhaite proposer une adresse attentive aux jambes féminines et aux envies de celles qui les habillent. Des bas pour un rendez-vous, des collants pour une journée bien remplie, des chaussettes pour les petits moments à soi : notre univers s’élargit avec vous.</p>
    <p>La boutique propose aujourd’hui des bas autofixants et des bas pour porte-jarretelles, en voile, résille et différentes finitions. Une sélection de collants et de chaussettes se prépare : elle sera présentée à la vente lorsque les conditions nécessaires seront vérifiées.</p>
    <h2>Choisir avec des repères concrets</h2>
    <p>La dentelle ne dit pas tout. Le maintien, la taille et la composition comptent aussi. Sur chaque fiche, vous trouverez les informations disponibles auprès du fabricant, les variantes et les photos du modèle. Les deniers sont indiqués lorsque cette donnée est connue.</p>
    <p>Les tailles varient d’une marque à l’autre. Notre guide distingue les mesures confirmées des correspondances qui restent à obtenir : une taille unique ne convient pas forcément à toutes les jambes.</p>
    <Link href="/guide-des-tailles">Consulter le guide des tailles →</Link>
    <h2>Une boutique qui commence par une sélection</h2>
    <p>Nous sélectionnons des articles de marques partenaires pour leur style et leurs caractéristiques documentées. La Maison des Dessous est votre interlocuteur pour le choix des modèles, votre commande, les questions de livraison et le suivi de votre achat.</p>
    <p>Pour une soirée, sous une robe ou simplement pour soi : à vous de choisir la façon de les porter.</p>
    <Link className="stocking-button" href="/boutique">Voir les bas</Link>
  </main>;
}
