/**
 * Offline unit checks for GA4 commerce-analytics.
 * No browser, network calls, Stripe charges, or Google Analytics requests.
 * Run from repository root: node artifacts/lingerie-shop/scripts/verify-commerce-analytics.mjs
 * Requires the repository's TypeScript dev dependency (pnpm install).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const folder = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(folder, '../src/lib/commerce-analytics.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics ?? []).filter(d => d.category === ts.DiagnosticCategory.Error);
assert.equal(errors.length, 0, 'TypeScript transpilation errors');

function storage() {
  const memory = new Map();
  return {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: key => memory.delete(key),
  };
}
function session({ sandbox = false, tag = true } = {}) {
  const events = [];
  const sessionStorage = storage();
  const localStorage = storage();
  if (sandbox) sessionStorage.setItem('lmd-sandbox-mode', 'active');
  const window = {};
  if (tag) window.gtag = (command, name, params) => events.push({ command, name, params });
  const exports = {};
  runInNewContext(compiled.outputText, { exports, window, sessionStorage, localStorage });
  return { api: exports, window, events, sessionStorage, localStorage };
}
const item = { item_id: 'EAN123', item_name: 'Bas test', price: 23.40, quantity: 1 };
const live = {
  id: 'cs_live_test_reference', paid: true, test: false, status: 'paid',
  amount: 2340, items: [{ ean: 'EAN123', name: 'Bas test', quantity: 1, total: 2340 }],
};

let checks = 0;
function check(name, fn) {
  fn();
  checks++;
  process.stdout.write('PASS ' + name + '\n');
}
check('add_to_cart contains GA4 ecommerce fields', () => {
  const s = session();
  assert.equal(s.api.trackAddToCart(item), true);
  assert.equal(s.events.length, 1);
  assert.equal(s.events[0].name, 'add_to_cart');
  assert.equal(s.events[0].params.currency, 'EUR');
  assert.equal(s.events[0].params.value, 23.4);
  assert.equal(s.events[0].params.items[0].item_id, 'EAN123');
});
check('sandbox never emits commerce events, including purchase', () => {
  const s = session({ sandbox: true });
  assert.equal(s.api.trackAddToCart(item), false);
  assert.equal(s.api.trackBeginCheckout([item], 2340), false);
  assert.equal(s.api.trackPurchase(live), false);
  assert.equal(s.events.length, 0);
});
check('begin_checkout prevents repeats for the same cart', () => {
  const s = session();
  assert.equal(s.api.trackBeginCheckout([item], 2340), true);
  assert.equal(s.api.trackBeginCheckout([item], 2340), false);
  assert.equal(s.events.length, 1);
  assert.equal(s.events[0].name, 'begin_checkout');
  assert.equal(s.api.trackBeginCheckout([{ ...item, quantity: 2 }], 4680), true);
  assert.equal(s.events.length, 2);
});
check('missing gtag does not block a later retry', () => {
  const s = session({ tag: false });
  assert.equal(s.api.trackBeginCheckout([item], 2340), false);
  assert.equal(s.sessionStorage.getItem('lmd-ga4-begin-checkout-v1'), null);
  s.window.gtag = (command, name, params) => s.events.push({ command, name, params });
  assert.equal(s.api.trackBeginCheckout([item], 2340), true);
  assert.equal(s.events.length, 1);
});
check('purchase requires a paid, non-test, live Stripe session', () => {
  const s = session();
  assert.equal(s.api.trackPurchase({ ...live, paid: false }), false);
  assert.equal(s.api.trackPurchase({ ...live, test: true }), false);
  assert.equal(s.api.trackPurchase({ ...live, id: 'cs_test_123' }), false);
  assert.equal(s.api.trackPurchase({ ...live, status: 'pending' }), false);
  assert.equal(s.events.length, 0);
});
check('purchase emits once with transaction_id and amount', () => {
  const s = session();
  assert.equal(s.api.trackPurchase(live), true);
  assert.equal(s.api.trackPurchase(live), false);
  assert.equal(s.events.length, 1);
  assert.equal(s.events[0].name, 'purchase');
  assert.equal(s.events[0].params.transaction_id, live.id);
  assert.equal(s.events[0].params.value, 23.4);
});
check('failed purchase emission may be retried after gtag becomes available', () => {
  const s = session({ tag: false });
  assert.equal(s.api.trackPurchase(live), false);
  assert.equal(s.localStorage.getItem('lmd-ga4-purchase:' + live.id), null);
  s.window.gtag = (command, name, params) => s.events.push({ command, name, params });
  assert.equal(s.api.trackPurchase(live), true);
  assert.equal(s.events.length, 1);
});

check('private checkout URLs are removed from GA4 events', () => {
  const s = session();
  s.window.location = {
    origin: 'https://lamaisondesdessous.fr',
    pathname: '/commande/confirmation',
    search: '?session_id=PRIVATE_STRIPE_SESSION',
    hash: '#access=PRIVATE_ACCESS',
  };
  assert.equal(s.api.trackPurchase(live), true);
  assert.equal(s.events[0].params.page_location, 'https://lamaisondesdessous.fr/commande/confirmation');
  assert.equal(s.events[0].params.page_referrer, '');
  assert.equal(JSON.stringify(s.events).includes('PRIVATE_STRIPE_SESSION'), false);
  assert.equal(JSON.stringify(s.events).includes('PRIVATE_ACCESS'), false);
});
check('GA4 initializes only on the real store and masks confirmation page URLs', () => {
  const html = readFileSync(join(folder, '../index.html'), 'utf8');
  const marker = html.indexOf('<!-- Production-only analytics');
  assert(marker >= 0, 'Expected GA4 bootstrap comment');
  const start = html.indexOf('<script>', marker) + '<script>'.length;
  const end = html.indexOf('</script>', start);
  assert(start >= '<script>'.length && end > start);
  const code = html.slice(start, end);
  const scripts = [];
  const window = {
    location: {
      hostname: 'lamaisondesdessous.fr',
      origin: 'https://lamaisondesdessous.fr',
      pathname: '/commande/confirmation',
      search: '?session_id=PRIVATE_STRIPE_SESSION',
      hash: '#access=PRIVATE_ACCESS',
    },
  };
  const document = {
    createElement: () => ({}),
    head: { appendChild: s => scripts.push(s) },
  };
  runInNewContext(code, { window, document, Date });
  const config = window.dataLayer.map(x => Array.from(x)).find(x => x[0] === 'config');
  assert(config, 'Missing gtag config');
  assert.equal(config[2].send_page_view, false);
  assert.equal(config[2].page_location, 'https://lamaisondesdessous.fr/commande/confirmation');
  assert.equal(config[2].page_referrer, '');
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].async, true);
  assert.equal(JSON.stringify(config).includes('PRIVATE_STRIPE_SESSION'), false);
  const preview = { location: { hostname: 'lmd-seo-recette.onrender.com', pathname: '/' } };
  runInNewContext(code, { window: preview, document, Date });
  assert.equal(preview.gtag, undefined, 'Staging must not load the real GA4 tag');
  assert.equal(scripts.length, 1, 'Staging must not add scripts');
});

process.stdout.write('Commerce GA4: ' + checks + ' checks passed (mock only).\n');
