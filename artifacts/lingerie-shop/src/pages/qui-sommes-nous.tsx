import React from 'react';
import { SEO } from '@/lib/seo';
export default function QuiSommesNous() {
  return (
    <>
      <SEO
        title="Qui Sommes-Nous | Notre Histoire"
        description="Découvrez l'histoire de La Maison des Dessous. Une marque française fondée sur la passion, l'exigence et le bien-être des femmes."
        keywords="histoire lingerie, marque lingerie française, qualité, féminité, confort lingerie"
        canonical="/qui-sommes-nous"
      />
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Notre Histoire</h1>
          <p className="text-lg text-muted-foreground font-light leading-relaxed">
            La Maison des Dessous est née d'un projet mûri pendant plusieurs années : celui de créer une lingerie qui ne fait aucun compromis entre élégance et confort réel.
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
            <h2 className="font-serif text-3xl font-bold mb-6">Une Passion Devenue Projet</h2>
            <p className="text-muted-foreground mb-6 font-light leading-relaxed">
              Je m'appelle Philippe, et derrière La Maison des Dessous, il y a une passion pour la mode et le beau vêtement que je porte depuis de nombreuses années. Ce n'est pas un projet improvisé : c'est une idée que j'ai longtemps mûrie avant de la concrétiser, avec la conviction que la lingerie méritait la même exigence que n'importe quelle pièce d'exception.
            </p>
            <p className="text-muted-foreground font-light leading-relaxed">
              Basé en Normandie, je porte aujourd'hui ce projet seul, avec la liberté que cela permet : choisir chaque pièce avec soin, sans compromis dicté par une logique de volume ou de rentabilité à tout prix.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-24">
          <h2 className="font-serif text-3xl font-bold mb-6 text-center">Notre Exigence</h2>
          <p className="text-muted-foreground mb-6 font-light leading-relaxed">
            Chaque pièce proposée sur La Maison des Dessous passe par un même filtre : est-ce que je l'offrirais moi-même ? Cette question simple guide la sélection de chaque ensemble, chaque matière, chaque finition. Je travaille avec des fournisseurs choisis pour la qualité réelle de leurs matières — dentelle véritable, tulle fin, finitions soignées — plutôt que pour le prix le plus bas.
          </p>
          <p className="text-muted-foreground font-light leading-relaxed">
            Ce qui compte le plus pour moi, avant même l'esthétique, c'est le confort et le bien-être de celles qui porteront ces pièces. Une lingerie belle mais inconfortable n'a pas sa place dans cette sélection : le vrai luxe, c'est de pouvoir la porter toute une journée sans jamais y penser.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-24 bg-card p-8 md:p-12 rounded border border-border/50">
          <h2 className="font-serif text-3xl font-bold mb-6 text-center">Une Jeune Marque, Une Vraie Exigence</h2>
          <p className="text-muted-foreground font-light leading-relaxed">
            La Maison des Dessous est une marque récente, et je ne cherche pas à le cacher. Ce que je peux vous promettre, en revanche, c'est une attention réelle portée à chaque détail : de la sélection des matières jusqu'au service après-vente, en passant par la manière dont chaque commande est préparée. Une marque à taille humaine, où chaque retour compte vraiment et où chaque cliente peut me joindre directement.
          </p>
        </div>

        <div className="bg-card py-16 px-8 text-center rounded border border-border/50">
          <h2 className="font-serif text-3xl font-bold mb-12">Nos Valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-primary">L'Excellence</h3>
              <p className="text-sm text-muted-foreground font-light">Une sélection exigeante de matériaux nobles pour une lingerie qui dure dans le temps.</p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-primary">Le Confort</h3>
              <p className="text-sm text-muted-foreground font-light">Des coupes pensées pour sublimer tous les corps sans jamais sacrifier le bien-être.</p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-primary">La Proximité</h3>
              <p className="text-sm text-muted-foreground font-light">Un projet à taille humaine, où chaque cliente compte et chaque retour est entendu.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
