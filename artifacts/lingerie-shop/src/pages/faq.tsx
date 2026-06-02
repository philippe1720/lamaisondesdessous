import React from 'react';
import { SEO } from '@/lib/seo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "Comment choisir ma taille de lingerie ?",
    answer: "Nous taillons normalement. Vous pouvez vous référer à notre guide des tailles détaillé sur la page produit. En cas de doute entre deux tailles, nous vous conseillons de prendre la taille supérieure pour les modèles en dentelle."
  },
  {
    question: "Comment entretenir mes dessous en dentelle et soie ?",
    answer: "Nous recommandons fortement un lavage à la main à l'eau tiède (max 30°C) avec un savon doux. Si vous utilisez la machine, placez toujours votre lingerie de luxe dans un filet de protection, sélectionnez un cycle délicat sans essorage. Le séchage doit se faire à l'air libre, à plat."
  },
  {
    question: "Acceptez-vous les retours ?",
    answer: "Oui, vous disposez de 30 jours pour retourner votre article. Attention, pour des raisons d'hygiène, la lingerie (culotte, string, tanga) doit être renvoyée non portée, non lavée, avec l'étiquette d'origine intacte et le sceau d'hygiène en place."
  },
  {
    question: "Quels sont les délais de livraison ?",
    answer: "Pour la France métropolitaine, la livraison standard prend 3 à 5 jours ouvrés. Une livraison express en 24-48h est également disponible lors du paiement."
  },
  {
    question: "Le paiement est-il sécurisé ?",
    answer: "Absolument. Nous utilisons Stripe, l'un des leaders mondiaux du paiement en ligne. Vos données bancaires sont cryptées et ne sont jamais stockées sur nos serveurs."
  },
  {
    question: "Les emballages sont-ils discrets ?",
    answer: "Oui, toutes nos commandes sont expédiées dans des cartons neutres sans mention de la marque à l'extérieur. À l'intérieur, votre ensemble lingerie est soigneusement emballé dans du papier de soie luxueux."
  },
];

export default function FAQ() {
  return (
    <>
      <SEO
        title="Foire Aux Questions | Aide & Service Client"
        description="Trouvez les réponses à vos questions concernant l'achat de notre lingerie, les tailles, l'entretien, la livraison et les retours."
        canonical="/faq"
      />
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-center">Foire Aux Questions</h1>
        <p className="text-center text-muted-foreground font-light mb-12">
          Tout ce que vous devez savoir sur nos ensembles de lingerie, l'entretien et nos services.
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
