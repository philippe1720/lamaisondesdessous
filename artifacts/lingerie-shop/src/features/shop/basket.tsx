import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { SEO } from '@/lib/seo';
import { findVariant, money, useShop } from './cart';

type CheckoutConfig = { checkoutEnabled: boolean; pickupEnabled: boolean; points: {id:string;name:string;address:string;postcode:string;city:string}[]; welcomeCode: string | null; upsell: { ean:string; name:string; description:string; image:string; priceCents:number } | null };
export function Basket() {
  const { products, lines, setQuantity, total } = useShop();
  return <main className="stocking-page"><SEO title="Votre panier"><meta name="robots" content="noindex,follow"/></SEO><h1>Votre panier</h1>{!lines.length ? <p>Votre panier est vide. <Link href="/boutique">Découvrir les bas →</Link></p> : <><div className="stocking-basket">{lines.map(line=>{
    const item=findVariant(products,line.ean);
    if(!item) return <div key={line.ean}>Référence indisponible <button onClick={()=>setQuantity(line.ean,0)}>Retirer</button></div>;
    return <article key={line.ean}><img src={item.product.images[0]} alt=""/><div><Link href={`/produit/${item.product.slug}`}>{item.product.name}</Link><p>{item.variant.size} · {item.variant.color}</p><label>Quantité <input aria-label={`Quantité pour ${item.product.name}, ${item.variant.size}`} type="number" min="0" max={Math.min(10,item.variant.stock)} value={line.quantity} onChange={e=>setQuantity(line.ean,Number(e.target.value))}/></label><button onClick={()=>setQuantity(line.ean,0)}>Retirer</button>{line.quantity>item.variant.stock && <p role="alert">La disponibilité a changé. Ajustez la quantité.</p>}</div><strong>{money(item.variant.priceCents*line.quantity)}</strong></article>;
  })}</div><section className="stocking-summary"><h2>Sous-total : {money(total)}</h2><p>Pickup offert · Domicile : +2,58 €</p><p>Les disponibilités et les prix seront vérifiés avant paiement.</p><Link className="stocking-button" href="/commande/attention">Continuer ma commande →</Link></section></>}</main>;
}
export function Checkout() {
  const { products, lines, total } = useShop();
  const [location,navigate]=useLocation();
  const [config,setConfig]=useState<CheckoutConfig | null>(null);
  const [delivery,setDelivery]=useState('home'); const [pickup,setPickup]=useState('');
  const [upsell,setUpsell]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  useEffect(()=>{fetch('/api/commerce/config').then(r=>r.ok?r.json():Promise.reject()).then(setConfig).catch(()=>setError('Le service de paiement est momentanément indisponible.'));},[]);
  if(!lines.length) return <main className="stocking-page"><SEO title="Commande"><meta name="robots" content="noindex,follow"/></SEO><h1>Votre panier est vide</h1><Link href="/boutique">Découvrir les bas</Link></main>;
  const isOffer=location==='/commande/attention';
  const extra=upsell && config?.upsell ? config.upsell.priceCents : 0;
  async function pay() {
    setBusy(true);setError('');
    try {
      const response=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lines,delivery,pickup:delivery==='pickup'?pickup:undefined,upsell:upsell?config?.upsell?.ean:undefined,expectedTotal:total+extra+(delivery==='home'?258:0)})});
      const data=await response.json(); if(!response.ok) throw new Error(data.error || 'Paiement indisponible.');
      window.location.assign(data.url);
    } catch(e){setError(e instanceof Error?e.message:'Une erreur est survenue.');setBusy(false);}
  }
  return <main className="stocking-page stocking-reading"><SEO title={isOffer?'Une petite attention':'Finaliser ma commande'}><meta name="robots" content="noindex,follow"/></SEO><p className="stocking-eyebrow">PANIER · LIVRAISON · PAIEMENT</p>
    {isOffer ? <><h1>{config?.upsell?'Une petite attention en plus ?':'Tout est prêt pour la suite.'}</h1>{config?.upsell && <section className="stocking-offer"><img src={config.upsell.image} alt={config.upsell.name}/><h2>{config.upsell.name}</h2><p>{config.upsell.description}</p><strong>{money(config.upsell.priceCents)}</strong><p>Ajouté au même panier, sans supplément de livraison standard.</p><button className="stocking-button" onClick={()=>{setUpsell(true);navigate('/commande/livraison');}}>Ajouter à ma commande</button></section>}<button className="stocking-button secondary" onClick={()=>{setUpsell(false);navigate('/commande/livraison');}}>{config?.upsell?'Continuer sans ajouter':'Choisir ma livraison →'}</button></> : <><h1>Votre livraison</h1><fieldset className="stocking-delivery"><legend>France métropolitaine</legend><label><input type="radio" name="delivery" checked={delivery==='pickup'} disabled={!config?.pickupEnabled} onChange={()=>setDelivery('pickup')}/> Colissimo Pickup — offert</label>{!config?.pickupEnabled && <small>Le choix des points de retrait est en cours de configuration.</small>}{delivery==='pickup' && <label>Votre point de retrait<select value={pickup} onChange={e=>setPickup(e.target.value)} required><option value="">Choisir un point</option>{config?.points.map(p=><option key={p.id} value={p.id}>{p.name} — {p.address}, {p.postcode} {p.city}</option>)}</select></label>}<label><input type="radio" name="delivery" checked={delivery==='home'} onChange={()=>setDelivery('home')}/> Colissimo à domicile — +2,58 €</label></fieldset><p>Besoin d’un envoi urgent ? <a href="mailto:contact@lamaisondesdessous.fr?subject=Demande%20Chronopost">Contactez-nous pour Chronopost</a>. Le tarif et le délai seront confirmés avant commande.</p>
      {upsell && config?.upsell && <p>{config.upsell.name} : {money(extra)} <button onClick={()=>setUpsell(false)}>Retirer</button></p>}
      {config?.welcomeCode && <p>Première commande : saisissez <strong>{config.welcomeCode}</strong> au paiement pour bénéficier de l’offre de bienvenue, sous réserve d’éligibilité.</p>}
      <h2>Total avant remise : {money(total+extra+(delivery==='home'?258:0))}</h2><p>Votre adresse et vos coordonnées seront demandées sur le paiement sécurisé Stripe.</p><button className="stocking-button" disabled={busy || !config?.checkoutEnabled || (delivery==='pickup' && !pickup)} onClick={pay}>{busy?'Vérification du panier…':'Passer au paiement sécurisé'}</button>{config && !config.checkoutEnabled && <p>Le paiement est en cours de configuration.</p>}</>}
      <p role="alert">{error}</p><Link href="/panier">← Revenir au panier</Link></main>;
}
export function Confirmation() {
  return <main className="stocking-page stocking-reading"><SEO title="Retour du paiement"><meta name="robots" content="noindex,follow"/></SEO><h1>Merci de votre visite.</h1><p>Si votre paiement a abouti, votre reçu Stripe fait foi. Conservez-le pour le suivi de votre commande.</p><p>Une question ? contact@lamaisondesdessous.fr</p><Link href="/boutique">Retour à la boutique</Link></main>;
}
