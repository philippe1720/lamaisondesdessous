import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import './header.css';

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
    { href: '/bas-resille', label: 'Résille' },
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
      <div className="shop-header-inner container mx-auto flex max-w-screen-2xl items-center justify-between gap-6 px-4 py-2 md:px-8">
        <Link href="/" className="shrink-0" aria-label="La Maison des Dessous — accueil">
          <img className="shop-header-logo" src="/images/brand/logo-lm.webp" alt="La Maison des Dessous" width="189" height="189" fetchPriority="high" />
        </Link>

        <nav aria-label="Navigation principale" className="shop-desktop-nav items-center justify-end gap-x-5 gap-y-3 text-sm font-medium">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`whitespace-nowrap py-2 transition-colors hover:text-primary ${
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
          className="shop-menu-toggle h-10 w-10 items-center justify-center"
          aria-controls="shop-mobile-nav"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <nav id="shop-mobile-nav" aria-label="Navigation mobile" className="shop-mobile-nav border-t border-border bg-background px-4 py-4">
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
