import selection from '@/data/matterhorn-preview.json';
import sizing from '@/data/verified-size-guides.json';

/**
 * Correspondances fabricant confirmées pour les gammes correspondantes.
 * Les URLs sources sont conservées dans les métadonnées internes ; l'interface
 * publique n'indique ni grossiste, ni identifiant de catalogue externe.
 */
type VerifiedModel = { family: string; source: string; label: string };
const models: Record<string, VerifiedModel | undefined> = sizing.models;
const ranges = sizing.ranges;
const modelById = (id: string) => selection.products.find(p => p.id === id);

export function hasVerifiedSizing(id: string): boolean {
  return Boolean(models[id]);
}

export function VerifiedTightsSizeTable({ id }: { id?: string }) {
  if (id && !models[id]) return null;
  const product = id ? modelById(id) : undefined;
  const available = product ? new Set(product.variants.map(v => v.size.replace(/^EU /, ''))) : null;
  const shown = ranges.filter(r => !available || available.has(r.code));
  if (shown.length === 0) return null;

  return <section className="lmd-verified-sizing" aria-labelledby={id ? 'verified-size-'+id : 'verified-size-all'}>
    <h2 id={id ? 'verified-size-'+id : 'verified-size-all'}>
      {id && models[id] ? 'Tailles vérifiées pour ' + models[id]?.label : 'Un tableau de mensurations vérifié pour quatre collants'}
    </h2>
    {id
      ? <p>Pour ce modèle, nous avons recoupé les codes de taille disponibles avec les mesures publiées par son fabricant. Le tableau n'indique pas le stock actuel et les limites de coupe peuvent varier d'une personne à l'autre.</p>
      : <p>Pour <strong>Éléonore, Apolline, Victoire et Célestine</strong>, les tableaux officiels de leurs gammes permettent de donner les repères ci-dessous. Les autres modèles de notre collection peuvent suivre des tableaux différents : ne leur appliquez pas ces valeurs automatiquement.</p>}
    <div className="lmd-sizing-scroll" role="region" aria-label="Correspondances en centimètres et kilogrammes" tabIndex={0}>
      <table className="lmd-sizing-table">
        <caption>Mensurations indicatives du fabricant, relevées le 9 novembre 2026</caption>
        <thead><tr><th scope="col">Taille</th><th scope="col">Stature (cm)</th><th scope="col">Hanches (cm)</th><th scope="col">Poids (kg)</th></tr></thead>
        <tbody>{shown.map(r => <tr key={r.code}>
          <th scope="row">{r.code}</th>
          <td>{r.heightCm[0]}–{r.heightCm[1]}</td>
          <td>{r.hipCm[0]}–{r.hipCm[1]}</td>
          <td>{r.weightKg[0]}–{r.weightKg[1]}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="stocking-note">Ces repères concernent uniquement les quatre modèles cités et leurs tailles indiquées. Si vos mesures ne concordent pas dans une même ligne, ou si vous êtes à une limite, demandez-nous un conseil avant de choisir.</p>
  </section>;
}
