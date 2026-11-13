import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import path from "path";
import { existsSync, readFileSync } from 'node:fs';

import { stripeWebhook, orderRouter } from "./commerce/orders";
import { managementRouter } from "./commerce/management";

const app: Express = express();

app.use(cors());
app.post("/api/stripe/webhook", express.raw({type:"application/json",limit:"1mb"}), stripeWebhook);
app.use(express.json());
app.use("/api", orderRouter);
app.use("/api", managementRouter);

// 1. Routes API
app.use("/api", router);

// Dashboard application is served separately from the customer shopping routes.
app.get('/gestion', (_req, res) => {
  res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'" });
  res.sendFile(path.join(process.cwd(), 'artifacts/lingerie-shop/dist/public/gestion.html'));
});

// 2. Sert les fichiers statiques (le front-end)
app.get('/*splat', (req, res, next) => {
  if(req.path.startsWith('/api/')) return next();
  if(req.path.startsWith('/commande/') || req.path==='/suivi-commande' || req.path==='/panier') {
    const file=path.join(process.cwd(),'artifacts/lingerie-shop/dist/public/index.html');
    if(!existsSync(file))return next();
    const html=readFileSync(file,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,tag=>/googletagmanager|gtag\(/.test(tag)?'':tag).replace(/<meta\b[^>]*name="robots"[^>]*>/gi,'').replace(/<link\b[^>]*rel="canonical"[^>]*>/gi,'').replace('</head>','<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"></head>');
    res.set({'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow'}).type('html').send(html);return;
  }
  if(req.path==='/produit') return res.redirect(301,'/boutique');
  if(req.path.endsWith('/') && req.path!=='/') return res.redirect(301,req.path.replace(/\/+$/,'') + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''));
  const file=path.join(process.cwd(),'artifacts/lingerie-shop/dist/public/seo',encodeURIComponent(req.path)+'.html');
  if(existsSync(file)) return res.sendFile(file);
  return next();
});
app.use(express.static(path.join(process.cwd(), "artifacts/lingerie-shop/dist/public")));

// 3. Unknown URLs must return 404, including nonexistent product and article slugs.
app.get("/*splat", (req, res) => {
  if(req.path.startsWith('/api/')) { res.status(404).json({error:'Route introuvable.'}); return; }
  const file=path.join(process.cwd(), "artifacts/lingerie-shop/dist/public/index.html");
  const html=readFileSync(file,'utf8')
    .replace(/<meta\b[^>]*name="robots"[^>]*>/gi,'')
    .replace(/<link\b[^>]*rel="canonical"[^>]*>/gi,'')
    .replace(/<title[^>]*>[\s\S]*?<\/title>/i,'<title>Page introuvable | La Maison des Dessous</title>')
    .replace(/<div id="root">[\s\S]*?<\/main><\/div>/,'<div id="root"><main><h1>Cette page n’existe pas</h1><a href="/boutique">Voir les bas</a></main></div>')
    .replace('</head>','<meta name="robots" content="noindex, follow"></head>');
  res.setHeader('X-Robots-Tag','noindex, follow');
  res.status(404).type('html').send(html);
});

export default app;
