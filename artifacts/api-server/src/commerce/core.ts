// All amounts are integer cents. 30% margin on sale price, before payment fees.
export function priceCents(buyCentsHT: number, shippingCents = 570) {
  if (!Number.isSafeInteger(buyCentsHT) || buyCentsHT <= 0) throw new Error('Invalid supplier price');
  return Math.ceil((buyCentsHT * 120 + shippingCents * 100) / 70);
}
export function parseCsv(input: string): Record<string, string>[] {
  const rows: string[][] = []; let row: string[] = [], field = '', quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '"') {
      if (quoted && input[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted;
    } else if (!quoted && char === ';') { row.push(field); field = ''; }
    else if (!quoted && char === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += char;
  }
  if (quoted) throw new Error('Incomplete CSV');
  if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  const header = rows.shift()?.map(h => h.replace(/^\uFEFF/, ''));
  if (!header?.includes('EAN13') || !header.includes('Prix unitaire HT') || !header.includes('Stock')) throw new Error('Unexpected CSV columns');
  return rows.filter(r => r.length === header.length).map(r => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}
export function validateLines(value: unknown): {ean: string; quantity: number}[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 30) throw new Error('Panier invalide.');
  const seen = new Set<string>();
  for (const line of value) {
    if (!line || !/^\d{13}$/.test(line.ean) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 10 || seen.has(line.ean)) throw new Error('Panier invalide.');
    seen.add(line.ean);
  }
  return value;
}
