import { Link } from 'wouter';
import { SEO } from '@/lib/seo';
import { LEGAL_DETAILS as legal } from '@/lib/legal-details';

/** Projet : ne pas publier avant vérification des données d'identification du vendeur. */
export default function MentionsLegales() {
  return <main className="container mx-auto px-4 py-16 max-w-4xl">
    <SEO title="Mentions légales" description="Identité de l'éditeur, coordonnées et hébergeur de la boutique La Maison des Dessous." canonical="/mentions-legales"/>
    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">Mentions légales</h1>
    <div className="prose prose-sm md:prose-base prose-p:font-light prose-headings:font-serif max-w-none text-muted-foreground">
      <h2>Éditeur du site et vendeur</h2>
      <p>Nom commercial : {legal.shopName}</p>
      <p>Éditeur et responsable de la vente : {legal.legalName}</p>
      <p>Forme juridique : {legal.legalStatus}</p>
      <p>Immatriculation : {legal.registration}</p>
      <p>Adresse professionnelle : {legal.businessAddress}</p>
      <p>Numéro de téléphone : {legal.businessPhone}</p>
      <p>Courriel : <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a></p>
      <p>Identification à la TVA : {legal.vat}</p>
      <h2>Hébergement</h2>
      <p>Le site est hébergé par {legal.hostName}, {legal.hostAddress}. Téléphone : {legal.hostPhone}. Site : <a href={legal.hostWebsite} target="_blank" rel="noreferrer">{legal.hostWebsite}</a>.</p>
      <h2>Propriété intellectuelle</h2>
      <p>Les marques, logos, textes, photographies et autres éléments visibles sur le site sont protégés par les droits de leurs titulaires respectifs. Les photographies de produits peuvent notamment être fournies par les marques ou partenaires fournisseurs. Aucune reproduction non autorisée n'est permise, sous réserve des exceptions légales.</p>
      <h2>Données personnelles</h2>
      <p>Les traitements liés à la navigation et aux commandes sont décrits dans la <Link href="/politique-de-confidentialite">politique de confidentialité</Link>. Pour exercer vos droits ou poser une question : <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.</p>
      <h2>Conditions de vente et réclamations</h2>
      <p>Consultez nos <Link href="/cgv">conditions générales de vente</Link> et notre page <Link href="/livraison-retours">livraison et retours</Link>. Une réclamation peut être adressée au service client à l'adresse e-mail ci-dessus.</p>
      <p>Le médiateur de la consommation conventionné : {legal.mediatorName}, {legal.mediatorAddress} — {legal.mediatorWebsite}.</p>
    </div>
  </main>;
}
