mport React from 'react';
import { SEO } from '@/lib/seo';
export default function QuiSommesNous() {
  return (
    <>
      <SEO
        title="Qui Sommes-Nous | Notre Histoire"
        description="Découvrez l'histoire de La Maison des Dessous. Nos valeurs, notre engagement pour la féminité et la sélection de lingerie de luxe."
        keywords="histoire lingerie, marque lingerie française, qualité, féminité"
        canonical="/qui-sommes-nous"
      />
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Notre Histoire</h1>
          <p className="text-lg text-muted-foreground font-light leading-relaxed">
            La Maison des Dessous est née d'une passion personnelle pour la mode et la lingerie, portée avec la conviction que ce vêtement mérite le même soin que n'importe quelle pièce d'exception.
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
            <h2 className="font-serif text-3xl font-bold mb-6">Une Aventure Solo, en Normandie</h2>
            <p className="text-muted-foreground mb-6 font-light leading-relaxed">
              Je m'appelle Philippe, et La Maison des Dessous est mon projet : une boutique de lingerie française, pensée et portée par une seule personne, basée en Normandie. Je sélectionne avec exigence chaque pièce auprès de fournisseurs de confiance, en privilégiant toujours la qualité des matières et le soin des finitions.
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
              <p className="text-sm text-muted-foreground font-light">Une sélection exigeante de matériaux nobles pour une lingerie qui dure dans le temps.</p>
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-primary">La Féminité</h3>
              <p className="text-sm text-muted-foreground font-light">Des coupes pensées pour sublimer tous les corps, avec respect et bienveillance.</p>
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
