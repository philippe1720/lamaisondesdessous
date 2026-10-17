import React from 'react';
import { Link } from 'wouter';
import { SEO } from '@/lib/seo';

export default function CGV() {
  return (
    <>
      <SEO
        title="Conditions Générales de Vente & Mentions Légales"
        description="Consultez nos conditions générales de vente, nos mentions légales et notre politique de retours et remboursements."
        canonical="/cgv"
      />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-12 text-center">Mentions Légales & CGV</h1>
        
        <div className="prose prose-sm md:prose-base prose-p:font-light prose-headings:font-serif prose-headings:font-bold max-w-none text-muted-foreground">
          <h2>1. Mentions Légales</h2>
          <p>Le site "La Maison des Dessous" est édité par la société <strong>Niard Philippe</strong>, immatriculée au RCS de Caen sous le numéro <strong>882 907 116 00017</strong>.</p>
          <p>Siège social : 14 rue de Hambourhen, 14790 Verson, France.<br/>
          Contact : contact@lamaisondesdessous.fr</p>

          <h2>2. Prix et Paiement</h2>
          <p>Les prix de nos ensembles lingerie et dessous féminins sont indiqués en euros toutes taxes comprises (TTC). Le paiement est exigible immédiatement à la commande, via le système sécurisé Stripe.</p>

          <h2>3. Livraison</h2>
          <p>La livraison de nos produits de lingerie de luxe s'effectue en France métropolitaine dans un délai de 3 à 5 jours ouvrés. Chaque commande est préparée avec le plus grand soin dans un emballage discret et élégant.</p>

          <p>La livraison standard à domicile et en Pickup est offerte. Chronopost est payant et disponible sur demande, après confirmation du tarif et du délai. <Link href="/livraison-retours">Voir les modalités de livraison et de retour.</Link></p>
          <h2>4. Droit de rétractation et Retours</h2>
          <p>Vous disposez du droit de rétractation de 14 jours à compter de la réception, ainsi que de notre délai commercial de retour de 30 jours pour les articles non portés, non lavés, avec étiquettes et emballage intacts. Les frais de retour pour changement d’avis sont à votre charge. L’exclusion pour hygiène ne concerne que les biens scellés, descellés après livraison et ne pouvant être renvoyés pour des raisons d’hygiène ou de santé ; elle ne supprime pas vos droits en cas de défaut ou de non-conformité. <Link href="/livraison-retours">Procédure de retour et modalités de remboursement.</Link></p>

          <h2>5. Propriété intellectuelle</h2>
          <p>L'ensemble des éléments édités sur ce site, incluant les photographies, textes et design, sont la propriété exclusive de La Maison des Dessous.</p>
        </div>
      </div>
    </>
  );
}
