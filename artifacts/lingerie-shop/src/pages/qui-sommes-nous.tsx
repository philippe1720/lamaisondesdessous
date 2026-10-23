import { Link } from 'wouter';
import { SEO } from '@/lib/seo';

export default function QuiSommesNous() {
  return <main className="stocking-page stocking-reading">
    <SEO title="Une boutique consacrée aux bas pour femme" description="Philippe présente La Maison des Dessous : une sélection de bas autofixants et pour porte-jarretelles, en voile et en résille." canonical="/qui-sommes-nous"/>
    <p className="stocking-eyebrow">LA MAISON DES DESSOUS</p>
    <h1>Les jambes, jusque dans le détail.</h1>
    <p>Une couture derrière la jambe, un voile léger, une jarretière en dentelle : les bas changent une tenue avec peu de chose. C’est ce détail qui m’a donné envie de leur consacrer une boutique.</p>
    <h2>Pourquoi seulement des bas ?</h2>
    <p>Je m’appelle Philippe. Avec La Maison des Dessous, je souhaite construire une adresse où l’on vient choisir ses bas, comprendre ce qui les différencie et trouver une paire que l’on a envie de porter.</p>
    <p>La sélection réunit des bas autofixants et des bas à fixer à un porte-jarretelles. Voile noir, beige ou rouge, résille, couture arrière : chaque modèle a sa place selon la tenue et l’effet recherché.</p>
    <h2>Choisir avec des repères concrets</h2>
    <p>La dentelle ne dit pas tout. Le maintien, la taille et la composition comptent aussi. Sur chaque fiche, vous trouverez les informations disponibles auprès du fabricant, les variantes et les photos du modèle. Les deniers sont indiqués lorsque cette donnée est connue.</p>
    <p>Les tailles varient d’une marque à l’autre. Notre guide distingue les mesures confirmées des correspondances qui restent à obtenir : une taille unique ne convient pas forcément à toutes les jambes.</p>
    <Link href="/guide-des-tailles">Consulter le guide des tailles →</Link>
    <h2>Une boutique qui commence par une sélection</h2>
    <p>Nous proposons aujourd’hui des modèles de marques partenaires. Nous ne fabriquons pas ces bas ; les commandes sont expédiées par notre fournisseur. La Maison des Dessous reste votre interlocuteur pour les questions sur votre achat et son suivi.</p>
    <p>Pour une soirée, sous une robe ou simplement pour soi : à vous de choisir la façon de les porter.</p>
    <Link className="stocking-button" href="/boutique">Voir les bas</Link>
  </main>;
}
