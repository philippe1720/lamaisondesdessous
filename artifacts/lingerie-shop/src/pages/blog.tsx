import React, { useState } from 'react';
import { Link } from 'wouter';
import { SEO } from '@/lib/seo';
import { GuideLinks } from '@/features/shop/editorial';

export const ARTICLES = [
  {
    slug: "comment-laver-sa-lingerie-delicate-2026",
    title: "Comment laver sa lingerie délicate sans l'abîmer",
    excerpt: "Dentelle, soie, tulle : chaque matière a ses secrets d'entretien. Le guide complet pour que votre lingerie reste aussi belle que le premier jour.",
    image: "/images/blog-3.png",
    date: "14 Mars 2026",
    year: 2026,
    category: "Entretien",
    readTime: "6 min"
  },
  {
    slug: "morphologie-quelle-lingerie-pour-vous-2026",
    title: "Quelle lingerie selon votre morphologie ?",
    excerpt: "Sablier, poire, rectangle, pomme... Découvrez comment choisir des dessous qui subliment votre silhouette naturelle et vous font vous sentir irrésistible.",
    image: "/images/blog-1.png",
    date: "02 Février 2026",
    year: 2026,
    category: "Guide",
    readTime: "8 min"
  },
  {
    slug: "tendances-lingerie-printemps-2025",
    title: "Les tendances lingerie du printemps 2025",
    excerpt: "Dentelles florales, tons corail et coupes audacieuses : ce printemps, la lingerie féminine s'épanouit. Décryptage des pièces incontournables de la saison.",
    image: "/images/blog-2.png",
    date: "18 Avril 2025",
    year: 2025,
    category: "Tendances",
    readTime: "5 min"
  },
  {
    slug: "choisir-son-soutien-gorge-taille-confort",
    title: "Bien choisir son soutien-gorge : taille, forme et confort",
    excerpt: "80% des femmes portent la mauvaise taille de soutien-gorge. Comment trouver la pièce parfaite pour votre poitrine, votre morfologie et votre mode de vie.",
    image: "/images/photo4.jpg",
    date: "07 Janvier 2025",
    year: 2025,
    category: "Guide",
    readTime: "7 min"
  },
  {
    slug: "rituel-beaute-et-confiance-en-soi",
    title: "Rituel beauté : l'importance de la belle lingerie",
    excerpt: "La confiance en soi commence par les vêtements que l'on porte contre sa peau. Comment une belle lingerie transforme votre posture et votre regard sur vous-même.",
    image: "/images/femmelingerierouge.jpeg",
    date: "28 Octobre 2024",
    year: 2024,
    category: "Bien-être",
    readTime: "5 min"
  },
  {
    slug: "comment-choisir-sa-lingerie-de-nuit",
    title: "Comment bien choisir son habillage de nuit",
    excerpt: "Nuisette en soie ou combinaison satinée ? Nos conseils pour des nuits douces et élégantes, en harmonie avec vos envies et votre morphologie.",
    image: "/images/lingeriedenuit.jpg",
    date: "12 Juin 2024",
    year: 2024,
    category: "Guide",
    readTime: "6 min"
  },
  {
  slug: "lingerie-haut-de-gamme-pourquoi-investir-qualite",
  title: "Lingerie haut de gamme : pourquoi investir dans la qualité",
  excerpt: "Matières nobles, finitions soignées, confort longue durée : découvrez pourquoi la lingerie haut de gamme est un investissement qui change tout.",
  image: "/images/soutiengorgesexy.jpg",
  date: "28 Juin 2026",
  year: 2026,
  category: "Conseils",
  readTime: "5 min"
},
  {
  slug: "lingerie-ete-vacances-conseils-matieres",
  title: "Lingerie d'été : comment rester fraîche et élégante en vacances",
  excerpt: "Quelles matières privilégier pour votre lingerie en été ? Nos conseils pour rester au frais tout en restant élégante, à la plage comme en voyage.",
  image: "/images/blog-4.jpg",
  date: "1 Juillet 2026",
  year: 2026,
  category: "Conseils",
  readTime: "4 min"
},
    {
    slug: "soutien-gorge-mal-ajuste-signes-solutions",
    title: "Soutien-gorge mal ajusté : 5 signes qui ne trompent pas",
    excerpt: "Dos qui remonte, bretelles qui glissent ou poitrine qui déborde : découvrez comment reconnaître un soutien-gorge mal ajusté et retrouver enfin du confort.",
    image: "/images/soutiengorge.jpeg",
    date: "13 Juillet 2026",
    year: 2026,
    category: "Guide",
    readTime: "3 min"
  },
];

const CATEGORIES = ["Tous", "Guide", "Entretien", "Tendances", "Bien-être"];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filtered = activeCategory === "Tous"
    ? ARTICLES
    : ARTICLES.filter(a => a.category === activeCategory);

  return (
    <>
      <SEO
        title="Conseils sur les bas pour femme et leur entretien"
        description="Comment choisir, porter et entretenir vos bas : nos guides sur les autofixants, les porte-jarretelles, la résille et les deniers."
        keywords="blog lingerie, conseils lingerie, comment laver lingerie, morphologie lingerie, tendances dessous féminins, entretien soutien-gorge dentelle"
        canonical="/blog"
      />
      <div className="container mx-auto px-4 py-16 md:py-24">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-primary font-serif uppercase tracking-[0.2em] text-sm mb-4 block">Le Journal Intime</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Conseils pour choisir et porter vos bas</h1>
          <p className="text-muted-foreground text-lg font-light">
            Autofixants ou porte-jarretelles, voile ou résille : retrouvez nos repères pour choisir vos bas et en prendre soin.
          </p>
        </div>

        <section className="mb-12"><h2 className="font-serif text-2xl mb-4">Les guides des bas</h2><GuideLinks /></section>
        <h2 className="font-serif text-2xl mb-6">Nos autres articles sur la lingerie</h2>
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-xs tracking-widest uppercase font-medium transition-all border ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-foreground border-border hover:border-primary/50 hover:text-primary'
              }`}
              data-testid={`filter-${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((article) => (
            <article key={article.slug} className="group cursor-pointer" data-testid={`article-${article.slug}`}>
              <Link href={`/blog/${article.slug}`}>
                <div className="block">
                  <div className="aspect-[4/3] overflow-hidden mb-6 relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      width={400}
                      height={300}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                    <span className="absolute top-4 left-4 bg-primary/90 text-primary-foreground text-xs px-3 py-1 font-medium tracking-wider uppercase">
                      {article.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-primary font-medium tracking-widest uppercase">{article.date}</span>
                    <span className="text-xs text-muted-foreground">{article.readTime} de lecture</span>
                  </div>
                  <h2 className="font-serif text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-snug">{article.title}</h2>
                  <p className="text-muted-foreground text-sm font-light leading-relaxed mb-4">{article.excerpt}</p>
                  <span className="text-sm border-b border-primary/30 text-primary pb-1 uppercase tracking-wider font-medium group-hover:border-primary transition-colors">
                    Lire l'article
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <p className="font-serif text-xl">Aucun article dans cette catégorie pour le moment.</p>
          </div>
        )}


      </div>
    </>
  );
}
