import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseCsv, priceCents } from './core';

type Variant = { ean: string; size: string; color: string; stock: number; priceCents: number };
export type Product = { id: string; slug: string; name: string; description: string; composition: string; category: string; brand: string; images: string[]; variants: Variant[] };
export async function snapshot(): Promise<{updatedAt: string; products: Product[]}> {
  return JSON.parse(await readFile(path.resolve(process.cwd(), 'artifacts/lingerie-shop/src/data/catalog.json'), 'utf8'));
}
export async function supplierRows(feedUrl = process.env.BUSYX_FEED_URL || '') {
  const url = new URL(feedUrl);
  if (url.protocol !== 'https:' || url.hostname !== 'www.busyx.com' || url.pathname !== '/csv_generator.php') throw new Error('Supplier configuration missing');
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'error' });
  if (!response.ok) throw new Error('Supplier unavailable');
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > 20_000_000) throw new Error('Supplier response too large');
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { text = new TextDecoder('windows-1252').decode(bytes); }
  return parseCsv(text);
}
export async function liveCatalog() {
  const [base, rows] = await Promise.all([snapshot(), supplierRows()]);
  const byEan = new Map(rows.map(r => [r.EAN13, r]));
  const products = base.products.map(p => ({...p, variants: p.variants.map(v => {
    const row = byEan.get(v.ean);
    if (!row || row['ID du produit'] !== p.id) return {...v, stock: 0};
    const stock = Number(row.Stock), amount = Math.round(Number(row['Prix unitaire HT'].replace(',', '.')) * 100);
    if (!Number.isInteger(stock) || stock < 0 || !Number.isSafeInteger(amount) || amount <= 0) throw new Error('Invalid supplier data');
    return {...v, stock, priceCents: priceCents(amount)};
  })}));
  return { products, updatedAt: new Date().toISOString(), rows };
}


// Matterhorn option IDs are valid internal identifiers even when not EAN13.
type MatterhornEntry={id:string;name:string;slug:string;description:string;composition:string;category:string;brand:string;color:string;images:string[];priceEur:number;variants:{size:string;supplierOptionId:string;declaredStockAtSource:number}[]};
export async function matterhornCatalog() {
  const source=JSON.parse(await readFile(path.resolve(process.cwd(),'artifacts/lingerie-shop/src/data/matterhorn-preview.json'),'utf8')) as {products:MatterhornEntry[]};
  // Historical XML stock is NOT sufficient for live checkout.
  const confirmedAt=Date.parse(process.env.MATTERHORN_STOCK_CONFIRMED_AT || '');
  const fresh=process.env.MATTERHORN_SELL_ENABLED==='true' && Number.isFinite(confirmedAt) && Date.now()-confirmedAt>=0 && Date.now()-confirmedAt<12*60*60*1000;
  return source.products.map(p=>({
    id:'matterhorn-'+p.id,slug:p.slug,name:p.name,description:p.description,composition:p.composition,
    category:p.category,brand:p.brand,images:p.images,
    variants:p.variants.map(v=>({ean:v.supplierOptionId,size:v.size,color:p.color,stock:fresh?Math.max(0,Math.min(10,v.declaredStockAtSource)):0,priceCents:Math.round(p.priceEur*100)}))
  })) as Product[];
}
