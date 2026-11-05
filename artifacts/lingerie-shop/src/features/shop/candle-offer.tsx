import { useEffect, useRef, useState } from 'react';
import { money, type Line } from './cart';

const CANDLE_EAN = '3479228260621';
const DISPLAY_PRICE = 490; // Montant voulu pour l'upsell. Le serveur reste seul maître du prix réellement facturé.
type OfferResponse = {
  offer: {ean:string;name:string;description:string;image:string;priceCents:number} | null;
  expiresAt?:number; serverNow?:number; accepted?:boolean;
};
export function CandleOffer({lines,onChoose}:{lines:Line[];onChoose:(value:boolean)=>void}) {
  const [data,setData]=useState<OfferResponse|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const accepting=useRef<AbortController|null>(null);
  const cartKey=JSON.stringify(lines);

  useEffect(()=>()=>accepting.current?.abort(),[]);
  useEffect(()=>{
    const controller=new AbortController();
    const timeout=window.setTimeout(()=>controller.abort(),9000);
    setData(null);setError('');
    fetch('/api/commerce/offer',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({lines:JSON.parse(cartKey)}),signal:controller.signal
    }).then(async r=>{if(!r.ok)throw new Error('Offre indisponible');return r.json() as Promise<OfferResponse>;})
      .then(value=>{
        if(controller.signal.aborted)return;
        setData(value);
      }).catch(()=>{setData({offer:null});setError('Impossible de charger la bougie. Actualisez la page pour réessayer.');})
      .finally(()=>window.clearTimeout(timeout));
    return ()=>{controller.abort();window.clearTimeout(timeout);};
  },[cartKey]);

  function skip(){accepting.current?.abort();onChoose(false);}
  async function accept(){
    if(busy)return;
    if(data?.offer===null){
      setError('La bougie n’est actuellement pas disponible chez notre fournisseur. Vous pouvez continuer avec vos bas.');
      return;
    }
    setBusy(true);setError('');
    const controller=new AbortController();accepting.current=controller;
    const timeout=window.setTimeout(()=>controller.abort(),15000);
    try {
      const response=await fetch('/api/commerce/offer',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({lines,accept:true}),signal:controller.signal
      });
      const value=await response.json() as OfferResponse & {error?:string};
      if(!response.ok || !value.offer || !value.accepted || value.offer.ean!==CANDLE_EAN ||
          value.offer.priceCents!==DISPLAY_PRICE){
        throw new Error(value.error || 'La bougie n’est plus disponible. Vous pouvez poursuivre avec vos bas.');
      }
      if(!controller.signal.aborted)onChoose(true);
    } catch(e){
      setError(controller.signal.aborted?'La demande a pris trop de temps. Réessayez.':e instanceof Error?e.message:'La bougie ne peut pas être ajoutée. Réessayez.');
    } finally {window.clearTimeout(timeout);setBusy(false);}
  }
  const unavailable=data?.offer===null;
  return <section className="stocking-offer stocking-candle-offer" aria-label="Offre complémentaire facultative : mini bougie de massage vanille">
    <div className="stocking-candle-product">
      <div className="stocking-candle-photo">
        <img src="/images/upsell/bougie-massage-vanille-plaisir-secret.webp" width={800} height={1200} alt="Bougie de massage Plaisir Secret à la vanille, 35 ml, dans sa boîte en forme de cœur" />
      </div>
      <div className="stocking-candle-info">
        <p className="stocking-eyebrow">UNE ATTENTION POUR VOUS</p>
        <h2>Mini bougie de massage à la vanille — 35 ml</h2>
        <p>Une bougie spécialement conçue pour le massage, au parfum de vanille et à la texture douce et soyeuse.</p>
        <p>Plaisir Secret · 35 ml · Fabriquée en France</p>
        <p className="stocking-candle-footnote">Présentée dans une boîte en forme de cœur. Pour l’utilisation, suivez les indications du fabricant sur l’emballage.</p>
        <p className="stocking-candle-price">{money(DISPLAY_PRICE)}</p>
        <p className="stocking-candle-footnote">Une seule bougie par commande. Aucun supplément de livraison standard.</p>
        {unavailable && <p role="status">Le chargement de la bougie a échoué. Actualisez la page pour réessayer.</p>}
        <div className="stocking-choice stocking-offer-actions">
          <button type="button" className="stocking-button stocking-offer-yes" disabled={busy || unavailable} onClick={()=>void accept()}>
            {busy?'Ajout de la bougie…':`Oui, j'ajoute la bougie — ${money(DISPLAY_PRICE)}`}
          </button>
          <button type="button" className="stocking-button secondary stocking-offer-no" onClick={skip}>Non merci, continuer ma commande</button>
        </div>
        {error && <p role="alert">{error}</p>}
        <small>Offre facultative : votre achat de bas n’en dépend pas.</small>
      </div>
    </div>
  </section>;
}
