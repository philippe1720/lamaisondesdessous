import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceCents, parseCsv, validateLines } from './core';

test('Ohyeah: VAT, Pickup and 30 percent margin rounded upwards',()=>{
  assert.equal(priceCents(377),1461);
  assert.ok((1461-(377*1.2+570))/1461 >= .30);
  assert.equal(priceCents(650,0),1115);
  assert.throws(()=>priceCents(-1));
});
test('Supplier CSV keeps multiline descriptions and escaped quotes',()=>{
  const rows=parseCsv('\uFEFFEAN13;Description;Prix unitaire HT;Stock\r\n1234567890123;"Voile; doux\navec ""dentelle""";3,77;7\r\n');
  assert.equal(rows.length,1);assert.equal(rows[0].Description,'Voile; doux\navec "dentelle"');
  assert.equal(rows[0].Stock,'7');assert.throws(()=>parseCsv('invalid'));
});
test('Cart rejects duplicate variants, negative/fractional quantities and excessive quantity',()=>{
  const good={ean:'3760343975874',quantity:1};
  assert.deepEqual(validateLines([good]),[good]);
  for(const value of [[],[good,good],[{...good,quantity:-1}],[{...good,quantity:1.5}],[{...good,quantity:11}],null]) assert.throws(()=>validateLines(value));
});
