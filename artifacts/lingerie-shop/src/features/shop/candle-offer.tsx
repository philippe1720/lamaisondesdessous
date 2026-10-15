import { useEffect, useRef, useState } from 'react';
import { money, type Line } from './cart';

type OfferResponse = {
  offer: {ean:string;name:string;description:string;image:string;priceCents:number} | null;
  expiresAt?:number; serverNow?:number; accepted?:boolean;
};
export function CandleOffer({lines,onChoose}:{lines:Line[];onChoose:(value:boolean)=>void}) {
  const [data,setData]=useState<OfferResponse|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const accepting=useRef<AbortController|null>(null);
  useEffect(()=>()=>accepting.current?.abort(),[]);
  function skip(){accepting.current?.abort();onChoose(false);}
  const [deadline,setDeadline]=useState(0);
  const [remaining,setRemaining]=useState(0);
  const cartKey=JSON.stringify(lines);
  useEffect(()=>{
    const controller=new AbortController();
    setData(null);setError('');
    fetch('/api/commerce/offer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lines:JSON.parse(cartKey)}),signal:controller.signal})
      .then(async r=>{if(!r.ok)throw new Error();return r.json() as Promise<OfferResponse>;})
      .then(value=>{if(controller.signal.aborted)return;setData(value);const ms=Math.max(0,(value.expiresAt || 0)-(value.serverNow || 0));setDeadline(Date.now()+ms);setRemaining(Math.ceil(ms/1000));})
      .catch(()=>{if(!controller.signal.aborted)setData({offer:null});});
    return ()=>controller.abort();
  },[cartKey]);
  useEffect(()=>{
    if(!deadline || data?.accepted)return;
    const timer=window.setInterval(()=>setRemaining(Math.max(0,Math.ceil((deadline-Date.now())/1000))),250);
    return ()=>window.clearInterval(timer);
  },[deadline,data?.accepted]);
  async function accept(){
    setBusy(true);setError('');
    const controller=new AbortController();accepting.current=controller;
    const timeout=window.setTimeout(()=>controller.abort(),30000);
    try {
      const r=await fetch('/api/commerce/offer',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lines,accept:true}),signal:controller.signal});
      const value=await r.json();
      if(!r.ok || !value.offer || !value.accepted)throw new Error(value.error || 'La bougie n’est plus disponible. Continuez sans ajouter.');
      if(!controller.signal.aborted)onChoose(true);
    } catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Impossible d’ajouter la bougie. Vous pouvez continuer sans ajouter.');}
    finally{window.clearTimeout(timeout);setBusy(false);}
  }
  const expired=Boolean(data?.offer && !data.accepted && remaining===0);
  return <section className="stocking-offer stocking-candle-offer" aria-label="Bougie facultative">
    {data?.offer?<>
      <img src={data.offer.image} alt={data.offer.name} width="240" height="240"/>
      <p className="stocking-eyebrow">POUR PROLONGER VOTRE MOMENT À VOUS</p>
      <h2>{data.offer.name}</h2>
      <p>{data.offer.description}</p>
      <p className="stocking-candle-price">{money(data.offer.priceCents)}</p>
      <p>Une bougie avec votre commande de bas. Aucun supplément de livraison standard.</p>
      {data.accepted?<p>Vous avez déjà choisi cette offre. Vous pouvez poursuivre votre commande.</p>:expired?<p role="status">Le délai pour ajouter cette offre est terminé. Votre panier de bas reste disponible.</p>:<>
        <p>Vous avez deux minutes pour ajouter cette offre. Une fois ajoutée, vous pourrez finaliser votre commande tranquillement, dans les 24 heures.</p>
        <div className="stocking-offer-clock" role="timer" aria-live="off" aria-label="Temps restant pour ajouter la bougie">{Math.floor(remaining/60).toString().padStart(2,'0')}:{(remaining%60).toString().padStart(2,'0')}</div>
      </>}
    </>:<p role="status">{data?'Vous pouvez poursuivre directement vers la livraison.':'Vérification de la disponibilité de la bougie…'}</p>}
    <div className="stocking-choice stocking-offer-actions">
      {data?.offer && <button type="button" className="stocking-button stocking-offer-yes" disabled={busy || expired} onClick={()=>void accept()}>{busy?'Ajout en cours…':`Oui, ajouter la bougie — ${money(data.offer.priceCents)}`}</button>}
      <button type="button" className="stocking-button secondary stocking-offer-no" onClick={skip}>Non, continuer sans ajouter</button>
    </div>
    {error && <p role="alert">{error}</p>}
  </section>;
}
