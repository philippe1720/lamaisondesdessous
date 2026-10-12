import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import path from "path";
import { existsSync, readFileSync } from 'node:fs';

import { stripeWebhook, orderRouter } from "./commerce/orders";

const app: Express = express();

app.use(cors());
app.post("/api/stripe/webhook", express.raw({type:"application/json",limit:"1mb"}), stripeWebhook);
app.use(express.json());
app.use("/api", orderRouter);

// 1. Routes API
app.use("/api", router);

// 2. Sert les fichiers statiques (le front-end)
app.get('/*splat', (req, res, next) => {
  if(req.path.startsWith('/api/')) return next();
  if(req.path.startsWith('/commande/') || req.path==='/suivi-commande') {
    const file=path.join(process.cwd(),'artifacts/lingerie-shop/dist/public/index.html');
    if(!existsSync(file))return next();
    const html=readFileSync(file,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,tag=>/googletagmanager|gtag\(/.test(tag)?'':tag).replace(/<meta\s+name="robots"[^>]*>/gi,'').replace('</head>','<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"></head>');
    res.set({'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow'}).type('html').send(html);return;
  }
  const file=path.join(process.cwd(),'artifacts/lingerie-shop/dist/public/seo',encodeURIComponent(req.path)+'.html');
  if(existsSync(file)) return res.sendFile(file);
  if(req.path.startsWith('/commande/') || req.path==='/panier') res.setHeader('X-Robots-Tag','noindex, follow');
  return next();
});
app.use(express.static(path.join(process.cwd(), "artifacts/lingerie-shop/dist/public")));

// 3. Fallback SPA : toutes les routes non-API et non-fichiers renvoient index.html
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(process.cwd(), "artifacts/lingerie-shop/dist/public/index.html"));
});

export default app;
