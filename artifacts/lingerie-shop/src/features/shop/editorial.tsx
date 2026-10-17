import { Link, useRoute } from 'wouter';
import { SEO } from '@/lib/seo';
import content from '@/data/editorial.json';

export { content as editorial };
type Section = { title: string; paragraphs: string[] };
type RelatedLink = { href: string; label: string };
export function EditorialSections({ sections, links = [] }: { sections: Section[]; links?: RelatedLink[] }) {
  return <div className="stocking-editorial">{sections.map(section => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map(p => <p key={p}>{p}</p>)}</section>)}{links.length>0 && <nav aria-label="Pour poursuivre votre lecture"><h2>Pour vous aider à choisir</h2><ul>{links.map(l=><li key={l.href}><Link href={l.href}>{l.label} →</Link></li>)}</ul></nav>}</div>;
}
export function GuideLinks() {
  return <nav className="stocking-guide-links" aria-label="Conseils sur les bas"><h2>Nos conseils pour choisir et porter vos bas</h2><ul>{content.guides.map(g=><li key={g.path}><Link href={g.path}>{g.title}</Link></li>)}</ul></nav>;
}
export function AdvicePage() {
  const [,params]=useRoute('/conseils/:slug');
  const guide=content.guides.find(g=>g.path===`/conseils/${params?.slug}`);
  if(!guide)return <main className="stocking-page"><SEO title="Conseil introuvable"><meta name="robots" content="noindex"/></SEO><h1>Ce conseil n’existe pas</h1><Link href="/guide-des-bas">Voir les guides</Link></main>;
  return <main className="stocking-page stocking-reading"><SEO title={guide.title} description={guide.description} canonical={guide.path} type="article"/><nav aria-label="Fil d’Ariane"><Link href="/">Accueil</Link> · <Link href="/guide-des-bas">Guide des bas</Link></nav><p className="stocking-eyebrow">LES CONSEILS DE LA MAISON</p><h1>{guide.title}</h1><p className="stocking-intro">{guide.intro}</p><EditorialSections sections={guide.sections} links={guide.links}/><GuideLinks/></main>;
}
