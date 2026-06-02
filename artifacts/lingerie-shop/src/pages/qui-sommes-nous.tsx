import React from 'react';
import { SEO } from '@/lib/seo';

export default function QuiSommesNous() {
  return (
    <>
      <SEO
        title="Qui Sommes-Nous | Notre Histoire"
        description="Découvrez l'histoire de La Maison des Dessous. Nos valeurs, notre engagement pour la féminité et la création de lingerie de luxe."
        keywords="histoire lingerie, marque lingerie française, qualité, féminité"
        canonical="/qui-sommes-nous"
      />
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Notre Histoire</h1>
          <p className="text-lg text-muted-foreground font-light leading-relaxed">
            La Maison des Dessous est née d'une vision simple : redonner à la lingerie ses lettres de noblesse, en créant des pièces qui célèbrent la féminité dans toute son élégance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
          <div className="aspect-[4/5] relative">
            <img 
              src="/images/blog-1.png" 
              alt="L'esprit de notre marque de lingerie" 
              className="object-cover w-full h-full rounded-sm"
            />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold mb-6">L'Atelier Parisien</h2>
            <p className="text-muted-foreground mb-6 font-light leading-relaxed">
              Inspirés par l'héritage de la haute couture française, nous imaginons chaque soutien-gorge, chaque culotte brodée et chaque nuisette comme une œuvre d'art. Notre obsession pour les détails se traduit par le choix méticuleux de nos matières : soies délicates et dentelles précieuses.
            </p>
            <p className="text-muted-foreground font-light leading-relaxed">
              Nous croyons que le vrai luxe réside dans l'intimité. Un ensemble lingerie ne doit pas seulement être beau à regarder, il doit être divin à porter, procurant un sentiment de confiance inébranlable.
            </p>
          </div>
        </div>

        <div className="bg-card py-16 px-8 text-center rounded border border-border/50">
          <h2 className="font-serif text-3xl font-bold mb-12">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-primary">L'Excellence</h3>
              <p className="text-sm text-muted-foreground font-light">Une confection irréprochable et des matériaux nobles pour une lingerie qui dure dans le temps.</p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-primary">La Féminité</h3>
              <p className="text-sm text-muted-foreground font-light">Des coupes pensées pour sublimer tous les corps, avec respect et bienveillance.</p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-primary">L'Éthique</h3>
              <p className="text-sm text-muted-foreground font-light">Une production raisonnée, transparente et respectueuse de ceux qui fabriquent nos pièces.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
