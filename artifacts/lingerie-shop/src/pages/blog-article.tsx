import React from 'react';
import { Link, useRoute } from 'wouter';
import { SEO } from '@/lib/seo';
import { SITE_CONFIG } from '@/lib/config';

export default function BlogArticle() {
  const [, params] = useRoute('/blog/:slug');
  const slug = params?.slug;

  const article = {
    title: "Comment bien choisir son habillage de nuit",
    content: `
      La nuit est un moment privilégié pour prendre soin de soi. L'habillage de nuit que l'on choisit joue un rôle crucial dans la qualité de notre repos, mais aussi dans la perception de notre féminité. Qu'il s'agisse d'une nuisette en soie délicate ou d'une combinaison satinée, la lingerie de nuit est un art à part entière.

      ## La matière avant tout
      Pour des nuits douces, privilégiez les matières nobles et respirantes. La soie reste la reine incontestée : thermorégulatrice, elle est fraîche en été et chaude en hiver. Un ensemble lingerie de nuit en soie caresse la peau et offre une sensation de luxe absolu.

      ## Adapter la coupe à sa morphologie
      Une belle nuisette doit épouser vos formes sans les contraindre. Si vous aimez le confort sans compromis sur l'élégance, une combinaison fluide ornée de détails en dentelle est un choix idéal.

      ## L'impact sur la confiance en soi
      Se glisser dans un beau vêtement de nuit, même juste pour soi, est un geste d'amour-propre. C'est l'essence même de notre boutique : proposer des dessous féminins qui célèbrent votre beauté naturelle, à toute heure du jour et de la nuit.
    `,
    image: "/images/blog-2.png",
    date: "12 Octobre 2023",
    author: "Sophie, Créatrice"
  };

  return (
    <>
      <SEO
        title={article.title}
        description="Découvrez nos conseils pour choisir votre habillage de nuit. Nuisette en soie, combinaison satinée : trouvez l'ensemble parfait pour des nuits élégantes."
        keywords="habillage de nuit, nuisette soie, combinaison satinée, lingerie de nuit, dessous féminin"
        canonical={`/blog/${slug}`}
        type="article"
        image={article.image}
      >
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": article.title,
            "image": [`${SITE_CONFIG.url}${article.image}`],
            "datePublished": "2023-10-12T08:00:00+08:00",
            "author": [{
              "@type": "Person",
              "name": article.author
            }]
          })}
        </script>
      </SEO>
      
      <article className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <Link href="/blog" className="text-primary text-sm tracking-widest uppercase hover:underline underline-offset-4">
            &larr; Retour au blog
          </Link>
        </div>
        
        <header className="text-center mb-16">
          <div className="text-sm text-muted-foreground font-medium tracking-widest uppercase mb-4">
            {article.date} • par {article.author}
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8 leading-tight">{article.title}</h1>
          <div className="aspect-[21/9] overflow-hidden w-full relative">
            <img 
              src={article.image} 
              alt="Lingerie de nuit luxueuse" 
              className="object-cover w-full h-full"
            />
          </div>
        </header>

        <div className="prose prose-lg prose-p:font-light prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-bold prose-headings:text-foreground prose-a:text-primary max-w-none">
          <p>
            La nuit est un moment privilégié pour prendre soin de soi. L'habillage de nuit que l'on choisit joue un rôle crucial dans la qualité de notre repos, mais aussi dans la perception de notre féminité. Qu'il s'agisse d'une nuisette en soie délicate ou d'une combinaison satinée, la lingerie de nuit est un art à part entière.
          </p>
          <h2 className="text-3xl mt-12 mb-6">La matière avant tout</h2>
          <p>
            Pour des nuits douces, privilégiez les matières nobles et respirantes. La soie reste la reine incontestée : thermorégulatrice, elle est fraîche en été et chaude en hiver. Un ensemble de nuit en soie caresse la peau et offre une sensation de luxe absolu, transformant le simple fait de dormir en une véritable expérience sensorielle.
          </p>
          <h2 className="text-3xl mt-12 mb-6">Adapter la coupe à sa morphologie</h2>
          <p>
            Une belle nuisette doit épouser vos formes sans les contraindre. Si vous aimez le confort sans compromis sur l'élégance, une combinaison fluide ornée de détails en dentelle est un choix idéal. Le secret réside dans les finitions : des bretelles finement ajustables, une dentelle de Calais subtilement placée au niveau du décolleté.
          </p>
          <h2 className="text-3xl mt-12 mb-6">L'impact sur la confiance en soi</h2>
          <p>
            Se glisser dans un beau vêtement de nuit, même juste pour soi, est un geste d'amour-propre. C'est l'essence même de notre boutique : proposer des dessous féminins qui célèbrent votre beauté naturelle, à toute heure du jour et de la nuit. Car la confiance acquise dans l'intimité de sa chambre rayonne tout au long de la journée.
          </p>
        </div>
      </article>
    </>
  );
}
