import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/config';

import { useShop } from '@/features/shop/cart';

export function Header() {
  const { count } = useShop();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/boutique', label: 'Boutique' },
    { href: '/bas-autofixants', label: 'Autofixants' },
    { href: '/bas-porte-jarretelles', label: 'Pour porte-jarretelles' },
    { href: '/guide-des-bas', label: 'Guide' },
    { href: '/panier', label: `Panier (${count})` },
    { href: '/qui-sommes-nous', label: 'À propos' },
  ];

  const isActive = (href: string) => {
    if (href === '/boutique') {
      return location === '/boutique' || location.startsWith('/produit/');
    }
    return location === href;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center">
          <span className="font-serif text-base font-bold tracking-widest text-primary sm:text-xl">
            {SITE_CONFIG.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-primary ${
                isActive(link.href) ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center lg:hidden"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <div className="container mx-auto grid gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-3 text-sm font-medium transition-colors hover:bg-card hover:text-primary ${
                  isActive(link.href) ? 'bg-card text-primary' : 'text-foreground/80'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
