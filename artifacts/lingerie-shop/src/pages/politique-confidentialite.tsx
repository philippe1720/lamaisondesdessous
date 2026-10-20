import { Link } from 'wouter';
import { SEO } from '@/lib/seo';
import { LEGAL_DETAILS as legal } from '@/lib/legal-details';

/**
 * Projet de politique de confidentialité : auditer les cookies et durées réelles
 * avant publication. Ne pas prétendre que des outils de mesure sont désactivés
 * sans avoir contrôlé la configuration de la boutique.
 */
export default function PolitiqueConfidentialite() {
  return <main className="container mx-auto px-4 py-16 max-w-4xl">
    <SEO title="Politique de confidentialité" description="Comment La Maison des Dessous protège et utilise les données nécessaires aux commandes et à la navigation." canonical="/politique-de-confidentialite"/>
    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">Politique de confidentialité</h1>
    <div className="prose prose-sm md:prose-base prose-p:font-light prose-headings:font-serif max-w-none text-muted-foreground">
      <h2>1. Responsable du traitement</h2>
      <p>Le responsable du traitement des données est {legal.legalName}, pour la boutique {legal.shopName}. Adresse professionnelle : {legal.businessAddress}. Contact : <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>.</p>
      <h2>2. Données traitées et finalités</h2>
      <p>Pour les commandes, nous utilisons les coordonnées de contact et de livraison, les références et quantités achetées, le montant payé et les informations utiles au traitement du service après-vente. Ces traitements reposent principalement sur l'exécution du contrat et, selon les données, sur des obligations légales, notamment de facturation et de comptabilité.</p>
      <p>Les échanges avec le service client sont traités pour répondre aux demandes et assurer le suivi des commandes, selon leur objet. Les données nécessaires à la sécurité et à la prévention de la fraude peuvent être utilisées lorsque cela est justifié.</p>
      <h2>3. Destinataires et prestataires</h2>
      <p>Des données strictement nécessaires peuvent être communiquées au prestataire de paiement Stripe, au fournisseur et prestataire d'expédition chargé de préparer les colis, aux transporteurs et à l'hébergeur technique Render. Chaque intervenant reçoit les informations utiles à sa mission.</p>
      <p>Les informations de paiement saisies dans l'interface sécurisée Stripe sont traitées par Stripe. La boutique n'a pas vocation à conserver directement les numéros complets des cartes bancaires.</p>
      <h2>4. Mesure d'audience, traceurs et cookies</h2>
      <p>Des outils de mesure d'audience, notamment ceux de Google lorsqu'ils sont activés, peuvent traiter des informations de navigation. L'usage des traceurs qui nécessitent un consentement est soumis au choix préalable de l'internaute. Les paramètres de cookies, leurs durées de vie et le mécanisme de gestion du consentement doivent être vérifiés sur la version réellement déployée du site.</p>
      <p>Les informations liées au panier peuvent être conservées localement dans le navigateur pour permettre de retrouver une sélection pendant la navigation et la commande.</p>
      <h2>5. Durées de conservation</h2>
      <p>Les données de commande sont conservées pendant la durée nécessaire à la gestion de l'achat, du service après-vente et au respect des délais légaux de conservation des pièces comptables et contractuelles. Les échanges de support et les données de navigation ne sont pas destinés à être conservés indéfiniment. Les durées exactes par catégorie doivent être documentées lors de l'audit des services réellement utilisés.</p>
      <h2>6. Droits des personnes</h2>
      <p>Selon les cas prévus par le RGPD, vous disposez de droits d'accès, de rectification, d'effacement, d'opposition, de limitation et de portabilité. Pour les exercer, écrivez à <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>. Vous pouvez également déposer une réclamation auprès de la <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noreferrer">CNIL</a>.</p>
      <h2>7. Transferts hors de l'Espace économique européen</h2>
      <p>Certains prestataires techniques sont établis en dehors de l'Espace économique européen. Les transferts éventuels et les garanties correspondantes doivent être précisés après vérification des contrats et configurations de ces prestataires.</p>
      <h2>8. Informations complémentaires</h2>
      <p>Consultez nos <Link href="/mentions-legales">mentions légales</Link> et <Link href="/cgv">conditions générales de vente</Link>. Cette politique sera mise à jour si les services, finalités ou durées de traitement évoluent.</p>
    </div>
  </main>;
}
