import { priceCents } from './core';
export type Relay = { id: string; name: string; address: string; postcode: string; city: string };
// Populate from carrier-verified points only. An arbitrary customer-entered address is not a relay ID.
export function relayPoints(): Relay[] {
  try {
    const points = JSON.parse(process.env.PICKUP_POINTS_JSON || '[]');
    if (!Array.isArray(points)) return [];
    return points.filter(p => p && ['id','name','address','postcode','city'].every(k => typeof p[k] === 'string' && p[k].trim().length > 0)).slice(0, 500);
  } catch { return []; }
}
export function upsellProduct(rows: Record<string,string>[]) {
  const ean = process.env.UPSELL_EAN ?? '3479228260621';
  if (!ean) return null;
  const row = rows.find(r=>r.EAN13===ean);
  if (!row || !/^\d{13}$/.test(ean) || Number(row.Stock) < 1 || !Number.isInteger(Number(row.Stock))) return null;
  const cost = Math.round(Number((row['Prix unitaire HT'] || '').replace(',','.'))*100);
  if (!Number.isSafeInteger(cost) || cost <= 0 || !row.Libel || !row['ID du produit'] || !(row['URL image'] || '').startsWith('https://www.busyx.com/')) return null;
  const description = ean === '3479228260621'
    ? 'Une mini bougie de massage à la vanille, format 35 ml, pour accompagner votre moment de détente. Utiliser selon les instructions du fabricant.'
    : 'Une petite attention pour compléter votre commande.';
  return {ean, name:row.Libel, description:process.env.UPSELL_DESCRIPTION || description, image:row['URL image'], priceCents:priceCents(cost,0), stock:Number(row.Stock), supplierId:row['ID du produit']};
}
