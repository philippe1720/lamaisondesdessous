import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { SEO } from '@/lib/seo';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <>
      <SEO
        title="Accueil"
        description="Découvrez La Maison des Dessous, une boutique de lingerie féminine d'exception. Lingerie de luxe, habillage de nuit, et ensembles raffinés."
        keywords="lingerie, dessous féminin, habillage de nuit, ensemble lingerie, lingerie de luxe"
        canonical="/"
      />
      <div className="flex flex-col w-full">
        {/* Hero Section */}
        <section className="relative h-[90vh] w-full overflow-hidden bg-background">
          <div className="absolute inset-0 bg-black/30 z-10" />
          <img
            src="/images/hero.png"
            alt="Ambiance élégante d'atelier parisien de lingerie féminine"
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
          />
          <div className="relative z-20 container mx-auto h-full flex flex-col justify-center items-center text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-bold tracking-wider mb-6 max-w-4xl"
            >
              L'Élégance à Fleur de Peau
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="text-lg md:text-xl text-white/90 font-light mb-10 max-w-2xl"
            >
              Découvrez notre collection exclusive d'ensembles de lingerie et d'habillage de nuit. Une soie délicate, une dentelle précieuse, pour révéler la femme qui est en vous.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/produit">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8 py-6 text-lg font-medium tracking-wide transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.5)] border border-primary/50" data-testid="btn-discover-product">
                  Découvrir la Collection
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feature Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl text-primary font-semibold mb-4 tracking-wide">L'élégance Européenne</h2>
              <div className="w-16 h-px bg-primary mx-auto opacity-50"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mb-6 text-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h3 className="font-serif text-xl font-medium mb-3">Qualité d'Exception</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Chaque pièce est confectionnée avec soin, utilisant les soies les plus pures et les dentelles les plus fines pour un confort absolu.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mb-6 text-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <h3 className="font-serif text-xl font-medium mb-3">Sensualité Raffinée</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Des coupes pensées pour sublimer chaque courbe. Notre lingerie célèbre la beauté naturelle avec élégance et discrétion.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center mb-6 text-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 10-4 4-4-4"/></svg>
                </div>
                <h3 className="font-serif text-xl font-medium mb-3">Service Sur-Mesure</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Livraison discrète et élégante. Un accompagnement personnalisé pour vous aider à trouver la pièce parfaite.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <section className="py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:w-1/2 relative"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src="/images/product-photo1.jpg"
                    alt="Parure de charme rose Intimari - soutien-gorge ouvert dentelle romantique"
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-primary/20 pointer-events-none"></div>
                </div>
                <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground text-xs px-3 py-1.5 font-medium tracking-wider">
                  VENTE FLASH — 40%
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:w-1/2 flex flex-col justify-center"
              >
                <span className="text-primary font-serif uppercase tracking-[0.2em] text-sm mb-4">Vente Flash Exclusive</span>
                <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-6 text-foreground">Parure Intimari Rose</h2>
                <p className="text-muted-foreground text-lg font-light mb-4 leading-relaxed">
                  Un soutien-gorge ouvert en dentelle romantique et sa culotte en tulle fluide, pensés pour la femme qui célèbre sa féminité avec audace et élégance.
                </p>
                <div className="flex items-baseline space-x-3 mb-8">
                  <span className="text-3xl font-semibold text-secondary">79,99€</span>
                  <span className="text-lg text-muted-foreground line-through">130€</span>
                  <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 font-medium">-40%</span>
                </div>
                <ul className="space-y-4 mb-10 text-sm">
                  <li className="flex items-center text-foreground/80">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                    Soutien-gorge ouvert dentelle romantique
                  </li>
                  <li className="flex items-center text-foreground/80">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                    Culotte tulle fluide légèrement transparente
                  </li>
                  <li className="flex items-center text-foreground/80">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                    Bijoux métalliques dorés inclus
                  </li>
                </ul>
                <div>
                  <Link href="/produit">
                    <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-none px-8 font-medium tracking-wide transition-all" data-testid="btn-view-details">
                      Voir les détails
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
