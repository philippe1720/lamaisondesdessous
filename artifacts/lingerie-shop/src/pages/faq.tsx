import React from 'react';
import { SEO } from '@/lib/seo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {question: "Comment choisir la taille de mes bas ?", answer: "Consultez les variantes de la fiche et le guide des tailles par marque. Les correspondances changent selon le fabricant et le modèle. Nous ne conseillons pas de prendre systématiquement une taille au-dessus. Lorsque des mesures ne sont pas confirmées, le guide le précise."},
  {question: "Quelle différence entre autofixants et bas pour porte-jarretelles ?", answer: "Les autofixants possèdent une bande de silicone à l’intérieur de la jarretière. Les autres bas se fixent aux attaches d’un porte-jarretelles, à prévoir séparément s’il n’est pas inclus dans la fiche produit."},
  {question: "Comment entretenir mes bas ?", answer: "Suivez les instructions de l’étiquette du fabricant. Pour les enfiler, retirez les bijoux qui pourraient accrocher le fil et déroulez doucement le bas, sans tirer uniquement sur la dentelle. Évitez la chaleur directe pour le séchage."},
  {question: "Quels sont les frais et délais de livraison ?", answer: "La livraison standard est offerte en France métropolitaine. Le délai indicatif affiché est de 3 à 5 jours ouvrés à compter de la commande. Le point Pickup peut être choisi lorsque la recherche de relais est disponible. Chronopost est payant et proposé sur demande, après confirmation du tarif et du délai avant achat."},
  {question: "Comment se passe le paiement ?", answer: "Après le récapitulatif, le bouton de paiement ouvre la page sécurisée de Stripe. Vous y renseignez vos coordonnées et votre moyen de paiement. La boutique ne reçoit pas votre numéro de carte. Si un mode test est signalé, aucun paiement réel ni envoi n’a lieu."},
  {question: "Où retrouver ma commande ?", answer: "Après paiement, conservez votre lien privé de confirmation. Il donne accès aux articles, aux tailles, à l’adresse et à l’état du paiement. Le suivi du colis apparaît lorsque son numéro a été renseigné après expédition. Ce lien contient des informations personnelles : ne le partagez pas."},
  {question: "Puis-je retourner un article ?", answer: "Vous disposez d’un droit de rétractation de 14 jours après réception. Le délai commercial de 30 jours s’applique sous les conditions décrites sur la page Livraison et retours. Cette page précise aussi les frais de retour et les exceptions ; un défaut ou une erreur de commande relève d’une procédure distincte."},
];

export default function FAQ() {
  return (
    <>
      <SEO
        title="Foire Aux Questions | Aide & Service Client"
        description="Trouvez les réponses à vos questions concernant l’achat de bas, les tailles, l'entretien, la livraison et les retours."
        canonical="/faq"
      />
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-center">Foire Aux Questions</h1>
        <p className="text-center text-muted-foreground font-light mb-12">
          Tailles, maintien, paiement et livraison : les réponses pour préparer votre commande.
        </p>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border bg-card px-6 rounded">
              <AccordionTrigger className="font-serif text-lg hover:text-primary hover:no-underline text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-16 text-center border-t border-border pt-12">
          <h2 className="font-serif text-2xl font-bold mb-4">Vous n'avez pas trouvé votre réponse ?</h2>
          <p className="text-muted-foreground font-light mb-6">Notre service client est à votre disposition pour vous accompagner dans votre choix.</p>
          <a href="mailto:contact@lamaisondesdessous.fr" className="text-primary font-medium tracking-wide uppercase text-sm hover:underline underline-offset-4">
            Contactez-nous
          </a>
        </div>
      </div>
    </>
  );
}
