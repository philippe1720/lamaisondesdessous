import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SEO } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { SITE_CONFIG, STRIPE_PAYMENT_LINK } from '@/lib/config';

export default function Produit() {
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePurchase = () => {
    if (!selectedSize) {
      alert('Veuillez sélectionner une taille.');
      return;
    }
    window.open(STRIPE_PAYMENT_LINK, '_blank');
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <>
      <SEO
        title="Ensemble Lingerie Dentelle 'Nuit Parisienne'"
        description="Achetez notre ensemble de lingerie de luxe. Soutien-gorge et culotte en dentelle brodée pour un confort et une élégance incomparables."
        keywords="soutien-gorge dentelle, culotte brodée, ensemble lingerie, sous-vêtements femme, lingerie de luxe"
        canonical="/produit"
        type="product"
        image="/images/product-1.png"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "Ensemble Lingerie 'Nuit Parisienne'",
            "image": [
              `${SITE_CONFIG.url}/images/product-1.png`,
              `${SITE_CONFIG.url}/images/product-2.png`
            ],
            "description": "Ensemble de lingerie en dentelle et soie.",
            "sku": "NP-01",
            "brand": {
              "@type": "Brand",
              "name": SITE_CONFIG.name
            },
            "offers": {
              "@type": "Offer",
              "url": `${SITE_CONFIG.url}/produit`,
              "priceCurrency": "EUR",
              "price": "89.00",
              "itemCondition": "https://schema.org/NewCondition",
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
      </SEO>

      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Flash Sale Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/30 rounded p-4 mb-12 flex flex-col sm:flex-row items-center justify-between shadow-[0_0_20px_rgba(212,175,55,0.1)]"
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <span className="relative flex h-3 w-3 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
            <span className="font-serif font-semibold text-secondary tracking-wider uppercase text-sm">
              Vente Flash Exculsive
            </span>
          </div>
          <div className="font-mono text-xl md:text-2xl font-bold text-foreground">
            Se termine dans : <span className="text-primary">{formatTime(timeLeft)}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <div className="space-y-6">
            <div className="aspect-[3/4] relative bg-muted overflow-hidden">
              <img 
                src="/images/product-1.png" 
                alt="Ensemble lingerie féminine de luxe blanc et or" 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="aspect-square relative bg-muted overflow-hidden">
                <img 
                  src="/images/product-2.png" 
                  alt="Détail dentelle lingerie de luxe" 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="aspect-square relative bg-muted overflow-hidden flex items-center justify-center p-8 text-center bg-card border border-primary/20">
                <p className="font-serif text-lg italic text-primary">"Le raffinement absolu dans chaque détail."</p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">L'Ensemble "Nuit Parisienne"</h1>
            
            <div className="flex items-baseline space-x-4 mb-6">
              <span className="text-3xl font-semibold text-secondary">89€</span>
              <span className="text-xl text-muted-foreground line-through">149€</span>
              <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded font-medium ml-2">-40%</span>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8 font-light">
              Une création signature qui incarne l'essence même de notre maison. Cet ensemble de lingerie luxueux associe une dentelle délicate brodée à la main et des touches de soie pure. Le soutien-gorge offre un maintien parfait tout en légèreté, tandis que la culotte assortie sculpte délicatement la silhouette. L'habillage de nuit idéal pour se sentir exceptionnelle.
            </p>

            {/* Size Selection */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-sm tracking-wide">SÉLECTIONNER LA TAILLE</span>
                <button className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">Guide des tailles</button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 border transition-all duration-200 flex items-center justify-center font-medium
                      ${selectedSize === size 
                        ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_10px_rgba(212,175,55,0.3)]' 
                        : 'border-border bg-transparent text-foreground hover:border-primary/50'
                      }`}
                    data-testid={`btn-size-${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 mb-12">
              <Button 
                onClick={handlePurchase}
                size="lg" 
                className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none text-lg tracking-wider font-semibold transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-primary/50"
                data-testid="btn-checkout"
              >
                AJOUTER AU PANIER
              </Button>
              <div className="flex items-center justify-center text-xs text-muted-foreground space-x-6">
                <span className="flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> Paiement sécurisé</span>
                <span className="flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg> Retours sous 30 jours</span>
              </div>
            </div>

            {/* Details Accordion */}
            <div className="border-t border-border pt-8 space-y-6">
              <div>
                <h3 className="font-serif text-xl font-medium mb-3">Détails du Produit</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4 font-light">
                  <li>85% Polyamide (Dentelle), 15% Élasthanne</li>
                  <li>Doublure gousset 100% coton</li>
                  <li>Détails métalliques dorés à l'or fin sans nickel</li>
                  <li>Bretelles réglables satinées</li>
                  <li>Fermeture agrafes au dos</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-xl font-medium mb-3">Entretien</h3>
                <p className="text-sm text-muted-foreground font-light">
                  Lavage à la main recommandé ou en machine à 30°C maximum dans un filet de protection. Ne pas sécher en machine. Repassage interdit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-32 border-t border-border/50 pt-20">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">L'Avis de nos Clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sophie M.", rating: 5, comment: "Absolument magnifique. La dentelle est d'une douceur incroyable et le maintien est parfait. Je me sens si élégante quand je le porte." },
              { name: "Claire D.", rating: 5, comment: "Un véritable bijou. La qualité est au rendez-vous, on sent vraiment que c'est de la lingerie de luxe. La taille correspond parfaitement." },
              { name: "Juliette L.", rating: 5, comment: "J'ai profité de la vente flash et je ne regrette pas ! L'ensemble est sublime, la livraison était très soignée. Une belle expérience d'achat." }
            ].map((review, i) => (
              <div key={i} className="bg-card p-8 border border-border/50 shadow-sm relative">
                <div className="text-primary flex space-x-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm font-light italic mb-6 leading-relaxed">"{review.comment}"</p>
                <div className="text-sm font-medium">{review.name}</div>
                <div className="text-xs text-muted-foreground mt-1">Achat vérifié</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
