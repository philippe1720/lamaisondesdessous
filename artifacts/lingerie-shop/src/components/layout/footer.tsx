import React from 'react';
import { Link } from 'wouter';
import { SITE_CONFIG } from '@/lib/config';

export function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <span className="font-serif text-2xl font-bold tracking-widest text-primary mb-4 block">
              {SITE_CONFIG.name}
            </span>
            <p className="text-muted-foreground text-sm max-w-sm mt-4">
              {SITE_CONFIG.description}
            </p>
          </div>
          
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-primary">Liens Utiles</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/qui-sommes-nous" className="hover:text-primary transition-colors">Qui sommes-nous</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/cgv" className="hover:text-primary transition-colors">CGV & Mentions Légales</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif text-lg font-semibold mb-4 text-primary">Nous Suivre</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Pinterest</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {SITE_CONFIG.name}. Tous droits réservés.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link href="/cgv" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
