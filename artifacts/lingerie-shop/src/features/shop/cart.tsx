import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import snapshot from '@/data/catalog.json';

export type Product = typeof snapshot.products[number];
export type Line = { ean: string; quantity: number };
export const money = (cents: number) => (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
export const initialCatalog = snapshot.products;
export function findVariant(products: Product[], ean: string) {
  for (const product of products) {
    const variant = product.variants.find(v => v.ean === ean);
    if (variant) return { product, variant };
  }
  return undefined;
}
type ShopState = {
  products: Product[]; lines: Line[]; setQuantity: (ean: string, quantity: number) => void;
  completeOrder: (id:string, items:{ean:string;quantity:number}[]) => void; add: (ean: string) => void; total: number; count: number; loading: boolean; refreshCatalog: () => Promise<boolean>;
};
const ShopContext = createContext<ShopState | null>(null);
export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState(initialCatalog);
  const [loading, setLoading] = useState(true);
  const [lines, setLines] = useState<Line[]>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('lmd-cart-v1') || '[]');
      if (!Array.isArray(saved)) return [];
      return saved.filter((l): l is Line => l && typeof l.ean === 'string' && Number.isInteger(l.quantity) && l.quantity > 0 && l.quantity <= 10).slice(0, 30);
    } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem('lmd-cart-v1', JSON.stringify(lines)); } catch { /* Private mode */ } }, [lines]);
  const refreshCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const response=await fetch('/api/catalog',{cache:'no-store',signal:AbortSignal.timeout(25000)});
      if(!response.ok)throw new Error();
      const data=await response.json();
      if(!Array.isArray(data.products))throw new Error();
      setProducts(data.products);return true;
    }catch{return false;}finally{setLoading(false);}
  },[]);
  useEffect(()=>{void refreshCatalog();},[refreshCatalog]);
  const setQuantity = (ean: string, quantity: number) => {
    const item = findVariant(products, ean);
    const qty = item ? Math.max(0, Math.min(10, item.variant.stock, Math.floor(quantity))) : 0;
    setLines(previous => [...previous.filter(l => l.ean !== ean), ...(qty ? [{ ean, quantity: qty }] : [])]);
  };
  const add = (ean: string) => setLines(previous => {
    const item = findVariant(products, ean);
    if (!item || item.variant.stock < 1) return previous;
    const quantity = Math.min(10, item.variant.stock, (previous.find(l => l.ean === ean)?.quantity || 0) + 1);
    return [...previous.filter(l => l.ean !== ean), { ean, quantity }];
  });
  const completeOrder=(id:string,items:{ean:string;quantity:number}[])=>{
    try {
      const pending=JSON.parse(sessionStorage.getItem('lmd-pending-checkout') || 'null');
      if(pending?.id!==id)return;
      const ids:string[]=JSON.parse(localStorage.getItem('lmd-completed-orders') || '[]');
      if(ids.includes(id))return;
      localStorage.setItem('lmd-completed-orders',JSON.stringify([...ids,id].slice(-100)));
      setLines(previous=>previous.map(line=>({...line,quantity:Math.max(0,line.quantity-(items.find(i=>i.ean===line.ean)?.quantity || 0))})).filter(line=>line.quantity>0));
      sessionStorage.removeItem('lmd-upsell');
      sessionStorage.removeItem('lmd-pending-checkout');
    }catch{/* Keep the basket if storage is unavailable; never clear unrelated items. */}
  };
  const total = lines.reduce((sum, l) => sum + (findVariant(products, l.ean)?.variant.priceCents || 0) * l.quantity, 0);
  return <ShopContext.Provider value={{ products, lines, setQuantity, add, completeOrder, total, count: lines.reduce((s,l) => s+l.quantity,0), loading, refreshCatalog }}>{children}</ShopContext.Provider>;
}
export function useShop() {
  const state = useContext(ShopContext);
  if (!state) throw new Error('ShopProvider missing');
  return state;
}
