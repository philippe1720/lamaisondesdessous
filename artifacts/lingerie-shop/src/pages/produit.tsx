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
       title="Ensemble Lingerie Dentelle Rose | Élégance & Confort"
description="Découvrez notre parure de charme rose. Un ensemble de lingerie fine en dentelle conçu pour sublimer votre silhouette en alliant raffinement, maintien et confiance en soi."
keywords="ensemble lingerie dentelle, parure rose femme, lingerie fine élégante, sous-vêtements dentelle confort"
        canonical="/produit"
        type="product"
        image="/images/product-1.png"
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "Parure de charme rose - Ensemble Intimari Rose - Soutien-gorge ouvert dentelle romantique",
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
          <div className="space-y-4">
            <div className="aspect-[3/4] relative bg-muted overflow-hidden">
              <img 
                src="/images/product-photo1.jpg" 
                alt="Parure de charme rose Intimari - soutien-gorge ouvert dentelle romantique vue de face" 
                className="object-cover w-full h-full"
                width={600}
                height={800}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] relative bg-muted overflow-hidden">
                <img 
                  src="/images/product-photo2.jpg" 
                  alt="Parure Intimari rose - dos réglable soutien-gorge dentelle féminine" 
                  className="object-cover w-full h-full"
                  width={300}
                  height={400}
                  loading="lazy"
                />
              </div>
              <div className="aspect-[3/4] relative bg-muted overflow-hidden">
                <img 
                  src="/images/product-photo3.jpg" 
                  alt="Détail ensemble lingerie rose - soutien-gorge ouvert et culotte tulle" 
                  className="object-cover w-full h-full"
                  width={300}
                  height={400}
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-foreground">Ensemble Lingerie Haut de Gamme en Dentelle — Collection Intimari Rose</h1>
            
            <div className="flex items-baseline space-x-4 mb-6">
              <span className="text-3xl font-semibold text-secondary">79,99€</span>
              <span className="text-xl text-muted-foreground line-through">130€</span>
              <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded font-medium ml-2">-40%</span>
            </div>

            <div className="text-muted-foreground leading-relaxed mb-8 font-light space-y-5">
              <p>
                Fermez les yeux un instant. Imaginez la douceur infinie d'un voile léger qui se pose délicatement sur votre peau. Vous vous glissez dans ce vêtement intime féminin et, instantanément, votre posture change. Vous vous sentez belle, audacieuse, irrésistible. Ce n'est plus seulement de la lingerie, c'est une véritable célébration de votre corps.
              </p>
              <p>
                Avec son rose vibrant qui illumine le teint, cet ensemble sous-vêtement a été pensé pour les femmes qui refusent de choisir entre le frisson de la séduction et le besoin absolu de confort.
              </p>
              <h2 className="font-serif text-xl font-medium text-foreground mt-6">Un décolleté spectaculaire, un maintien sur-mesure</h2>
              <p>
                Laissez-vous envoûter par la coupe audacieuse de son soutien-gorge. Libéré des coques traditionnelles, il dévoile subtilement la courbe de vos seins, simplement caressés par une délicate bande de dentelle froncée. Le résultat ? Un effet visuel époustouflant qui sublime votre poitrine avec une élégance rare. Grâce à son dos et ses bretelles entièrement réglables, ce soutien-gorge s'adapte parfaitement à votre morphologie pour vous offrir un maintien rassurant et un confort qui vous accompagnera tout au long de vos moments les plus intimes.
              </p>
              <h2 className="font-serif text-xl font-medium text-foreground">Une douceur qui se fond sur la peau</h2>
              <p>
                La culotte assortie, confectionnée dans un tulle fluide et légèrement transparent, épouse vos hanches sans jamais les marquer. Elle se fait oublier au porter pour ne laisser place qu'à une sensation de légèreté absolue.
              </p>
              <h2 className="font-serif text-xl font-medium text-foreground">Le détail qui fait la différence</h2>
              <p>
                Parce que vous méritez ce qu'il y a de plus précieux, deux petits bijoux métalliques viennent capter la lumière : l'un niché au creux de votre décolleté, l'autre délicatement posé sur le devant de la culotte. Une touche finale de glamour pour une parure d'exception.
              </p>
              <p className="font-serif italic text-foreground text-lg">
                Ne rêvez plus de la femme fatale et confiante que vous êtes... Incarnez-la.
              </p>
            </div>

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
