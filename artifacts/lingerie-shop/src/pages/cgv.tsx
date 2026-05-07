import React from 'react';
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

          <h2>4. Droit de rétractation et Retours</h2>
          <p>Conformément à la législation, vous disposez d'un délai de 30 jours pour changer d'avis. Cependant, pour des raisons évidentes d'hygiène, les articles de lingerie (soutien-gorge, culotte, nuisette) ne pourront être retournés ou échangés que s'ils n'ont jamais été portés, non lavés, avec leurs étiquettes d'origine attachées et dans leur emballage intact.</p>

          <h2>5. Propriété intellectuelle</h2>
          <p>L'ensemble des éléments édités sur ce site, incluant les photographies, textes et design, sont la propriété exclusive de La Maison des Dessous.</p>
        </div>
      </div>
    </>
  );
}
