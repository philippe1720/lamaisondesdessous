import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from "@/components/layout/layout";

import Home, { Guide } from "@/features/shop/home";
import { Catalogue, ProductPage } from "@/features/shop/catalogue";
import { AdvicePage } from '@/features/shop/editorial';
import { Basket, Checkout } from "@/features/shop/basket";
import { OrderConfirmation } from "@/features/shop/order";
import { DeliveryReturns, SizeGuide } from "@/features/shop/services";
import { ShopProvider } from "@/features/shop/cart";
import "@/features/shop/shop.css";
import Blog from "@/pages/blog";
import BlogArticle from "@/pages/blog-article";
import CGV from "@/pages/cgv";
import MentionsLegales from "@/pages/mentions-legales";
import PolitiqueConfidentialite from "@/pages/politique-confidentialite";
import QuiSommesNous from "@/pages/qui-sommes-nous";
import FAQ from "@/pages/faq";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/boutique" component={Catalogue} />
        <Route path="/bas-resille" component={Catalogue} />
        <Route path="/conseils/:slug" component={AdvicePage} />
        <Route path="/bas-autofixants" component={Catalogue} />
        <Route path="/bas-porte-jarretelles" component={Catalogue} />
        <Route path="/produit/:slug">{params => <ProductPage key={params.slug} />}</Route>
        <Route path="/produit" component={Catalogue} />
        <Route path="/panier" component={Basket} />
        <Route path="/commande/confirmation" component={OrderConfirmation} />
        <Route path="/commande/:step" component={Checkout} />
        <Route path="/livraison-retours" component={DeliveryReturns} />
        <Route path="/guide-des-tailles" component={SizeGuide} />
        <Route path="/suivi-commande" component={OrderConfirmation} />
        <Route path="/guide-des-bas" component={Guide} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogArticle} />
        <Route path="/cgv" component={CGV} />
        <Route path="/mentions-legales" component={MentionsLegales} />
        <Route path="/politique-de-confidentialite" component={PolitiqueConfidentialite} />
        <Route path="/qui-sommes-nous" component={QuiSommesNous} />
        <Route path="/faq" component={FAQ} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ShopProvider><Router /></ShopProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
