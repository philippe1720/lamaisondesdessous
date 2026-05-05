import React from 'react';
import { Link } from 'wouter';
import { SEO } from '@/lib/seo';

const ARTICLES = [
  {
    slug: "comment-choisir-sa-lingerie-de-nuit",
    title: "Comment bien choisir son habillage de nuit",
    excerpt: "Nuisette en soie ou combinaison satinée ? Découvrez nos conseils pour des nuits douces et élégantes, en harmonie avec vos envies.",
    image: "/images/blog-2.png",
    date: "12 Octobre 2023"
  },
  {
    slug: "rituel-beaute-et-confiance-en-soi",
    title: "Rituel beauté : l'importance de la belle lingerie",
    excerpt: "La confiance en soi commence par les vêtements que l'on porte contre sa peau. Explorez comment une belle lingerie transforme votre posture.",
    image: "/images/blog-1.png",
    date: "28 Septembre 2023"
  },
  {
    slug: "entretien-lingerie-luxe",
    title: "Le guide d'entretien de votre lingerie de luxe",
    excerpt: "Dentelle délicate et soie requièrent des soins particuliers. Apprenez à laver et préserver la beauté de vos dessous féminins.",
    image: "/images/blog-3.png",
    date: "05 Septembre 2023"
  }
];

export default function Blog() {
  return (
    <>
      <SEO
        title="Blog & Conseils Lingerie"
        description="Nos articles et conseils sur la lingerie, la beauté, l'habillage de nuit et la confiance en soi."
        keywords="blog beauté, conseils lingerie, habillage de nuit, confiance en soi, nuisette soie"
        canonical="/blog"
      />
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Le Journal Intime</h1>
          <p className="text-muted-foreground text-lg font-light">
            Conseils, inspirations et réflexions autour de l'univers de la lingerie féminine et du bien-être.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {ARTICLES.map((article) => (
            <article key={article.slug} className="group cursor-pointer">
              <Link href={`/blog/${article.slug}`}>
                <div className="block">
                  <div className="aspect-[4/3] overflow-hidden mb-6 relative">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                  </div>
                  <div className="text-xs text-primary font-medium tracking-widest uppercase mb-3">{article.date}</div>
                  <h2 className="font-serif text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{article.title}</h2>
                  <p className="text-muted-foreground text-sm font-light leading-relaxed mb-4">{article.excerpt}</p>
                  <span className="text-sm border-b border-primary/30 text-primary pb-1 uppercase tracking-wider font-medium group-hover:border-primary transition-colors">Lire l'article</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
