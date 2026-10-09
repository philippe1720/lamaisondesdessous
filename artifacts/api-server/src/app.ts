import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";
import path from "path";
import { existsSync } from 'node:fs';

const app: Express = express();

app.use(cors());
app.use(express.json());

// 1. Routes API
app.use("/api", router);

// 2. Sert les fichiers statiques (le front-end)
app.get('/*splat', (req, res, next) => {
  if(req.path.startsWith('/api/')) return next();
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
