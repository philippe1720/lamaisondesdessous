import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from "@/components/layout/layout";

import Home from "@/pages/home";
import Produit from "@/pages/produit";
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
        <Route path="/produit" component={Produit} />
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
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
