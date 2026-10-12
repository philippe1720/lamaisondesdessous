import { relayPoints, type Relay } from './options';
export type PickupPoint = Relay & { hours?: string[]; distance?: number };
export const pickupAvailable = () => Boolean(process.env.COLISSIMO_API_KEY || relayPoints().length);
export async function searchRelays(postcode: string, city: string): Promise<PickupPoint[]> {
  if (!/^\d{5}$/.test(postcode) || /^(97|98)/.test(postcode) || typeof city !== 'string' || city.length > 100) throw new Error('Adresse invalide');
  if (!process.env.COLISSIMO_API_KEY) return relayPoints().filter(p => p.postcode === postcode);
  const d = new Date(); d.setUTCDate(d.getUTCDate()+1);
  const shippingDate = `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
  const response = await fetch('https://ws.colissimo.fr/pointretrait-ws-cxf/rest/v2/pointretrait/findRDVPointRetraitAcheminement', {
    method:'POST', headers:{'Content-Type':'application/json',Accept:'application/json'},
    body:JSON.stringify({apiKey:process.env.COLISSIMO_API_KEY,zipCode:postcode,city,address:'',countryCode:'FR',shippingDate,filterRelay:'1',lang:'FR',requestId:'lmd'}),signal:AbortSignal.timeout(12000),redirect:'error'
  });
  if (!response.ok) throw new Error('Transporteur indisponible');
  const data = await response.json() as any;
  if (Number(data.errorCode)!==0 || !Array.isArray(data.listePointRetraitAcheminement)) throw new Error('Transporteur indisponible');
  const days=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
  return data.listePointRetraitAcheminement.filter((p:any)=>!p.congesTotal && !p.congesPartiel && p.codePays==='FR' && p.identifiant && p.nom && p.codePostal && p.adresse1 && p.localite).slice(0,30).map((p:any)=>({id:String(p.identifiant),name:p.nom,address:[p.adresse1,p.adresse2,p.adresse3].filter(Boolean).join(', '),postcode:p.codePostal,city:p.localite,distance:Number(p.distanceEnMetre)||0,hours:days.map(day=>`${day} : ${String(p['horairesOuverture'+day] || '').replaceAll('00:00-00:00','').trim() || 'fermé'}`)}));
}
