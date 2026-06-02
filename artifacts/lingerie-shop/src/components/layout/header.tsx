import React from 'react';
import { Link, useLocation } from 'wouter';
import { SITE_CONFIG } from '@/lib/config';

export function Header() {
  const [location] = useLocation();

  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/produit', label: 'Notre Produit' },
    { href: '/blog', label: 'Blog' },
    { href: '/faq', label: 'FAQ' },
    { href: '/qui-sommes-nous', label: 'Qui sommes-nous' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <span className="font-serif text-xl font-bold tracking-widest text-primary">
            {SITE_CONFIG.name}
          </span>
        </Link>
        <nav className="flex flex-1 items-center justify-end space-x-6 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-primary ${
                location === link.href ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
