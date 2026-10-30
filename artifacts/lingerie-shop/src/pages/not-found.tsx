import { Link } from "wouter";
import { SEO } from "@/lib/seo";
export default function NotFound() {
  return <main className="stocking-page stocking-reading">
    <SEO title="Page introuvable" noindex />
    <h1>Cette page n’existe pas</h1>
    <p>Retrouvez notre sélection de bas ou les conseils pour choisir votre paire.</p>
    <p><Link href="/boutique">Voir les bas</Link> · <Link href="/guide-des-bas">Consulter les guides</Link></p>
  </main>;
}
