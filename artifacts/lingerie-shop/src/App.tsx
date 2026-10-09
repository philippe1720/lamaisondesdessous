import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from "@/components/layout/layout";

import Home, { Guide } from "@/features/shop/home";
import { Catalogue, ProductPage } from "@/features/shop/catalogue";
import { Basket, Checkout, Confirmation } from "@/features/shop/basket";
import { ShopProvider } from "@/features/shop/cart";
import "@/features/shop/shop.css";
import Blog from "@/pages/blog";
import BlogArticle from "@/pages/blog-article";
import CGV from "@/pages/cgv";
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
        <Route path="/bas-autofixants" component={Catalogue} />
        <Route path="/bas-porte-jarretelles" component={Catalogue} />
        <Route path="/produit/:slug">{params => <ProductPage key={params.slug} />}</Route>
        <Route path="/produit" component={Catalogue} />
        <Route path="/panier" component={Basket} />
        <Route path="/commande/confirmation" component={Confirmation} />
        <Route path="/commande/:step" component={Checkout} />
        <Route path="/guide-des-bas" component={Guide} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogArticle} />
        <Route path="/cgv" component={CGV} />
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
