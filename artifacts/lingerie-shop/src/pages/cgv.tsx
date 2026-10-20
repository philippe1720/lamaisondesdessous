import { Link } from 'wouter';
import { SEO } from '@/lib/seo';
import { LEGAL_DETAILS as legal } from '@/lib/legal-details';

/**
 * PROJET DE CGV 2026 : faire confirmer les données juridiques de legal-details.ts
 * et le médiateur conventionné avant fusion sur la branche de production.
 */
export default function CGV() {
  return <main className="container mx-auto px-4 py-16 max-w-4xl">
    <SEO
      title="Conditions générales de vente"
      description="Conditions générales de vente de La Maison des Dessous : commande de bas pour femme, paiement, livraison, rétractation, retours et garanties légales."
      canonical="/cgv"
    />
    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">Conditions générales de vente</h1>
    <p className="text-sm text-muted-foreground mb-6">La Maison des Dessous — version préparatoire du 20 octobre 2026. Les informations d'identification du vendeur doivent être confirmées avant publication.</p>
    <div className="prose prose-sm md:prose-base prose-p:font-light prose-headings:font-serif max-w-none text-muted-foreground">
      <section>
        <h2>1. Vendeur et champ d'application</h2>
        <p>Les présentes conditions générales de vente (CGV) régissent les achats effectués par des consommateurs sur <a href="https://lamaisondesdessous.fr/">lamaisondesdessous.fr</a>, auprès de {legal.legalName} ({legal.legalStatus}), à l'adresse professionnelle suivante : {legal.businessAddress}.</p>
        <p>Pour contacter le vendeur : <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a> — {legal.businessPhone}. Les autres renseignements figurent dans les <Link href="/mentions-legales">mentions légales</Link>.</p>
        <p>Avant le paiement, l'acheteuse ou l'acheteur peut consulter les caractéristiques de sa commande et corriger les quantités et choix de livraison. Les CGV sont accessibles depuis le site avant toute commande.</p>
      </section>
      <section>
        <h2>2. Produits et caractéristiques</h2>
        <p>La boutique est spécialisée dans les bas pour femme : bas autofixants, bas destinés à un porte-jarretelles, modèles en voile et en résille. Certaines offres complémentaires facultatives, notamment une bougie de massage, peuvent être proposées au cours de la commande.</p>
        <p>Chaque fiche précise, dans la limite des données confirmées par le fabricant, le modèle, la composition, les tailles ou variantes, le type de maintien et les éventuels deniers. Les accessoires visibles sur les photographies ne sont pas inclus, sauf indication expresse. Les photographies illustrent les articles vendus ; les caractéristiques figurant sur la fiche font référence.</p>
        <p>Les articles sont commercialisés par La Maison des Dessous, qui reste l'interlocuteur contractuel de la clientèle, même lorsque l'expédition est réalisée par un partenaire logistique.</p>
      </section>
      <section>
        <h2>3. Prix, frais de livraison et promotions</h2>
        <p>Les prix sont indiqués en euros, toutes taxes comprises lorsque celles-ci sont applicables. Le montant total dû, ainsi que toute remise ou option payante, est présenté avant la validation définitive du paiement.</p>
        <p>La livraison standard est annoncée comme offerte en France métropolitaine, à domicile ou en point Pickup lorsque ce mode de livraison est disponible pour la commande. Une prestation express Chronopost peut être proposée, moyennant un supplément communiqué et accepté préalablement.</p>
        <p>Les offres promotionnelles et codes de réduction ne sont applicables que dans les conditions indiquées lors de leur présentation ou au moment du paiement.</p>
      </section>
      <section>
        <h2>4. Commande et paiement</h2>
        <p>La commande se prépare dans le panier. Une éventuelle offre complémentaire de bougie peut être acceptée ou refusée librement ; refuser cette offre n'empêche pas de poursuivre l'achat des bas. Le client sélectionne ensuite le mode de livraison puis accède au paiement sécurisé.</p>
        <p>Le règlement est effectué en ligne par les moyens proposés à l'étape de paiement, via Stripe. Les informations de carte bancaire sont traitées par le prestataire de paiement, et non conservées directement dans le code du site marchand.</p>
        <p>La commande est confirmée après validation du paiement. Un récapitulatif et un accès privé au suivi de la commande sont proposés après paiement. Le commerçant reste joignable par e-mail pour toute question concernant la commande.</p>
      </section>
      <section>
        <h2>5. Disponibilité et impossibilité d'exécution</h2>
        <p>Les disponibilités sont contrôlées auprès du fournisseur avant l'étape de paiement. Ce contrôle ne constitue pas une réservation définitive de stock chez le fournisseur. Si un article devient exceptionnellement indisponible après confirmation, le client est informé dans les meilleurs délais ; une solution appropriée lui est proposée, ou les sommes concernées lui sont remboursées conformément à ses droits.</p>
      </section>
      <section>
        <h2>6. Livraison</h2>
        <p>Les commandes sont destinées à la France métropolitaine. Les modes de livraison proposés et leur disponibilité effective sont affichés avant le paiement : livraison standard à domicile et, lorsque le service le permet, livraison en point Pickup choisi par le client. La livraison Chronopost express n'est proposée qu'après confirmation du prix et du délai.</p>
        <p>Un délai indicatif de trois à cinq jours ouvrés est annoncé pour la livraison standard, sous réserve des délais de préparation et de prise en charge. La date ou le délai de livraison applicable à une commande doit être communiqué avant validation. En cas de retard, le client conserve les droits que lui reconnaît le Code de la consommation, notamment en matière de demande de livraison et de résolution du contrat.</p>
        <p>Les risques de perte ou d'endommagement sont transférés au consommateur lorsqu'il prend physiquement possession du colis, dans les conditions prévues par la loi. Pour une difficulté de livraison, contactez <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a> ; le vendeur reste responsable de la bonne exécution de la commande, même lorsqu'un tiers réalise l'expédition.</p>
        <p>Les informations pratiques sont disponibles sur la page <Link href="/livraison-retours">Livraison et retours</Link>.</p>
      </section>
      <section>
        <h2>7. Droit légal de rétractation : 14 jours</h2>
        <p>Pour un achat à distance éligible, le consommateur dispose de quatorze jours à compter de la réception du bien pour notifier sa décision de se rétracter, sans avoir à justifier de motif. En cas de livraison de plusieurs biens séparément, le délai se calcule conformément aux règles légales applicables à la dernière réception.</p>
        <p>La décision peut être adressée par une déclaration claire à <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a> ou par courrier à {legal.businessAddress}. Un modèle de formulaire figure en fin de page ; son utilisation n'est pas obligatoire.</p>
        <p>Le consommateur renvoie les biens au plus tard quatorze jours après avoir notifié sa rétractation. Les frais directs du retour pour simple changement d'avis sont à sa charge lorsqu'il en a été informé. L'adresse pratique de retour est communiquée par le vendeur ; elle peut différer de son adresse professionnelle.</p>
        <p>Le remboursement des sommes dues, y compris les frais de livraison standard le cas échéant, intervient dans les quatorze jours suivant l'information du vendeur de la décision de rétractation, par le moyen de paiement initial sauf accord exprès contraire. Le vendeur peut légalement différer le remboursement jusqu'à récupération du bien ou présentation d'une preuve de son expédition, selon le premier de ces événements. Les suppléments correspondant à un mode de livraison plus coûteux choisi par le client ne sont pas nécessairement remboursés au-delà de la livraison standard.</p>
        <p>L'exception liée à l'hygiène ou à la protection de la santé ne concerne que les biens effectivement livrés scellés puis descellés après livraison et ne pouvant être renvoyés pour ces raisons. Elle ne s'applique pas automatiquement à toutes les paires de bas. Elle ne limite jamais les droits liés à un défaut ou à une non-conformité.</p>
      </section>
      <section>
        <h2>8. Retour commercial de 30 jours</h2>
        <p>En complément du droit légal de rétractation, La Maison des Dessous annonce un délai commercial de retour de trente jours à compter de la réception, pour les articles non portés, non lavés, avec les étiquettes et emballages intacts, sous réserve des modalités communiquées par le vendeur. Cette faculté supplémentaire n'enlève aucun droit légal au consommateur.</p>
        <p>Pour organiser un retour, écrire à <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a> en indiquant la commande concernée. Les frais directs de retour pour changement d'avis sont à la charge du client dans les conditions annoncées avant achat. Pour un bien défectueux ou non conforme, les garanties légales décrites ci-après restent pleinement applicables.</p>
      </section>
      <section>
        <h2>9. Garanties légales</h2>
        <p>Le consommateur bénéficie de la garantie légale de conformité dans les conditions des articles L. 217-3 et suivants du Code de la consommation. Pour un bien neuf, cette garantie peut être exercée pendant deux ans à compter de sa délivrance. Selon les conditions légales, le client peut notamment demander la réparation ou le remplacement du bien, puis, dans les cas prévus, une réduction du prix ou la résolution de la vente, sans frais injustifiés.</p>
        <p>Il bénéficie également de la garantie légale des vices cachés des articles 1641 et suivants du Code civil, qui peut être mise en œuvre dans les deux ans à compter de la découverte du vice. Les recours et conditions prévus par les textes s'appliquent.</p>
        <p>Pour une demande de garantie, contactez le vendeur à <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>. Ces garanties s'appliquent indépendamment d'une éventuelle garantie commerciale et de la politique de retour volontaire de trente jours.</p>
      </section>
      <section>
        <h2>10. Réclamations, médiation et litiges</h2>
        <p>En cas de difficulté, adressez d'abord une réclamation à <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>, en précisant la commande et le problème rencontré.</p>
        <p>À défaut de résolution amiable, le consommateur peut recourir gratuitement au médiateur de la consommation dont relève le vendeur, dans les conditions légales : {legal.mediatorName}, {legal.mediatorAddress}. Site du médiateur : {legal.mediatorWebsite}.</p>
        <p>Le recours à la médiation ne prive pas le consommateur de son droit de saisir la juridiction compétente. Les dispositions protectrices impératives du droit de la consommation s'appliquent.</p>
      </section>
      <section>
        <h2>11. Données personnelles et propriété intellectuelle</h2>
        <p>Les informations nécessaires à la commande sont utilisées pour le paiement, la livraison, l'assistance et le respect des obligations légales, selon les conditions indiquées dans notre <Link href="/politique-de-confidentialite">politique de confidentialité</Link>.</p>
        <p>Les textes, logos, photographies de fournisseurs et autres contenus restent protégés par les droits de leurs titulaires respectifs. Leur présence sur ce site n'emporte pas transfert de propriété intellectuelle au client.</p>
      </section>
      <section>
        <h2>12. Modèle de formulaire de rétractation</h2>
        <p>À l'attention de : {legal.legalName}, {legal.businessAddress}, {legal.contactEmail}.</p>
        <p>Je vous notifie par la présente ma rétractation du contrat portant sur la vente du ou des biens suivants : [désignation des biens].</p>
        <p>Commandé(s) le : [date] ; reçu(s) le : [date].</p>
        <p>Nom du consommateur : [nom]. Adresse du consommateur : [adresse]. Date : [date]. Signature : [uniquement pour un envoi sur papier].</p>
        <p>Vous pouvez utiliser ce modèle en l'adressant à <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>, ou transmettre toute autre déclaration non équivoque de rétractation.</p>
      </section>
    </div>
  </main>;
}
