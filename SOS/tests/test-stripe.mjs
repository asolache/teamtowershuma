/* El pagament de l'alta · Stripe Checkout, provat sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   `netlify/functions/checkout.mjs` i `checkout-completat.mjs` es proven en
   Node pur, amb un `fetch` fals: no toquen Stripe de debò. El que es prova:

   · Sense claus, o amb una clau de producció sense permís, no es cobra res.
   · La sessió es crea amb el preu de l'entorn i les tornades de la web.
   · Només s'accepta una adreça de pagament de Stripe.
   · L'estat diu si s'ha pagat, i un id estrany no surt de la funció.
   · L'avís de Stripe es rebutja si la signatura no quadra o és vella.
   · El registre no porta cap clau ni cap correu. */
import { createHmac } from 'node:crypto';
import { config, tornades, creaSessio, estatSessio, cobra, handler } from '../../netlify/functions/checkout.mjs';
import { verificaSignatura, processa, handler as handlerAvis } from '../../netlify/functions/checkout-completat.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const ENV = { STRIPE_SECRET_KEY: 'sk_test_abc123', STRIPE_PRICE_ID: 'price_1Alta', URL: 'https://teamtowers.example/' };
const fals = (respostes) => {
  const crides = [];
  const f = async (url, opts) => {
    crides.push({ url, opts });
    const r = respostes[crides.length - 1];
    return { ok: r.status < 400, status: r.status, json: async () => r.json };
  };
  f.crides = crides;
  return f;
};

console.log('\n1 · Quan no es cobra res');
{
  ok(!config({}).ok && /STRIPE_SECRET_KEY, STRIPE_PRICE_ID/.test(config({}).motiu), 'sense claus diu què falta');
  ok(!config({ ...ENV, STRIPE_SECRET_KEY: 'pk_test_abc' }).ok, 'una clau publicable no serveix');
  ok(!config({ ...ENV, STRIPE_SECRET_KEY: 'sk_live_abc' }).ok, 'una clau de producció sense STRIPE_LIVE=1 es rebutja');
  ok(config({ ...ENV, STRIPE_SECRET_KEY: 'sk_live_abc', STRIPE_LIVE: '1' }).ok, 'i amb STRIPE_LIVE=1, s\'accepta');
  ok(!config({ ...ENV, STRIPE_PRICE_ID: '2400' }).ok, 'el preu ha de ser un price_ de Stripe, no un import');
  ok(config(ENV).prova === true, 'una sk_test_ és mode de prova');
  ok(cobra(ENV).estat === 'cobra' && cobra(ENV).prova && cobra({ ...ENV, URL: '' }).estat === 'sense-config' && cobra({}).estat === 'sense-config', 'l\'editor pot saber si la web cobra, sense crear res');
  ok(tornades({ URL: 'http://x.example' }) === null && tornades({}) === null, 'sense una URL https no hi ha tornades');
  const f = fals([]);
  const r = await creaSessio({}, f);
  ok(r.estat === 'sense-config' && !f.crides.length, 'sense config no crida Stripe');
  const r2 = await creaSessio({ ...ENV, URL: '' }, f);
  ok(r2.estat === 'sense-config' && /URL/.test(r2.motiu) && !f.crides.length, 'sense URL tampoc');
}

console.log('\n2 · Crear la sessió');
{
  const f = fals([{ status: 200, json: { id: 'cs_test_1', url: 'https://checkout.stripe.com/c/pay/cs_test_1' } }]);
  const r = await creaSessio(ENV, f);
  ok(r.estat === 'creat' && r.url === 'https://checkout.stripe.com/c/pay/cs_test_1' && r.prova, 'torna l\'adreça de Checkout');
  const c = f.crides[0], p = new URLSearchParams(c.opts.body);
  ok(c.url === 'https://api.stripe.com/v1/checkout/sessions' && c.opts.method === 'POST', 'POST a l\'API de sessions');
  ok(c.opts.headers.Authorization === 'Bearer sk_test_abc123', 'amb la clau secreta, al servidor');
  ok(p.get('mode') === 'payment' && p.get('line_items[0][price]') === 'price_1Alta' && p.get('line_items[0][quantity]') === '1', 'un pagament, amb el preu de l\'entorn');
  ok(p.get('success_url') === 'https://teamtowers.example/SOS/vna-suport.html?alta={CHECKOUT_SESSION_ID}#editor', 'torna a l\'editor amb l\'id de la sessió');
  ok(p.get('cancel_url') === 'https://teamtowers.example/SOS/vna-suport.html?alta=cancel#editor', 'i si es cancel·la, també');
  const f2 = fals([{ status: 200, json: { url: 'https://dolent.example/pay' } }]);
  ok((await creaSessio(ENV, f2)).estat === 'error', 'una adreça que no és de Stripe es rebutja');
  const f3 = fals([{ status: 400, json: { error: { code: 'resource_missing' } } }]);
  const r3 = await creaSessio(ENV, f3);
  ok(r3.estat === 'error' && /resource_missing/.test(r3.motiu), 'un error de Stripe torna «error» amb el codi');
}

console.log('\n3 · Saber si s\'ha pagat');
{
  const f = fals([{ status: 200, json: { payment_status: 'paid', livemode: false } }, { status: 200, json: { payment_status: 'unpaid', livemode: false } }]);
  const r = await estatSessio('cs_test_abc', ENV, f);
  ok(r.estat === 'llegit' && r.pagat && r.prova, 'pagat, en mode de prova');
  ok(f.crides[0].url === 'https://api.stripe.com/v1/checkout/sessions/cs_test_abc' && !f.crides[0].opts.method, 'un GET de la sessió');
  ok((await estatSessio('cs_test_abc', ENV, f)).pagat === false, 'sense pagar diu que no');
  const f2 = fals([]);
  ok((await estatSessio('../customers', ENV, f2)).estat === 'error' && !f2.crides.length, 'un id que no és cs_ no surt de la funció');
}

console.log('\n4 · L\'avís de Stripe');
{
  const SECRET = 'whsec_prova', ara = 1760000000;
  const ev = { type: 'checkout.session.completed', livemode: false, data: { object: { id: 'cs_test_1', payment_status: 'paid', amount_total: 100, currency: 'eur', customer_details: { email: 'algu@example.org' } } } };
  const cos = JSON.stringify(ev);
  const sig = (c, t = ara, s = SECRET) => createHmac('sha256', s).update(t + '.' + c).digest('hex');
  const cap = `t=${ara},v1=${sig(cos)}`;
  ok(verificaSignatura(cos, cap, SECRET, ara).ok, 'una signatura bona passa');
  ok(verificaSignatura(cos, `t=${ara},v1=00,v1=${sig(cos)}`, SECRET, ara).ok, 'amb diverses v1, n\'hi ha prou amb una');
  ok(!verificaSignatura(cos + ' ', cap, SECRET, ara).ok, 'un cos tocat es rebutja');
  ok(!verificaSignatura(cos, `t=${ara},v1=${sig(cos, ara, 'whsec_altre')}`, SECRET, ara).ok, 'un altre secret es rebutja');
  ok(/temps/.test(verificaSignatura(cos, cap, SECRET, ara + 301).motiu), 'un avís de fa més de cinc minuts es rebutja');
  ok(!verificaSignatura(cos, cap, '', ara).ok, 'sense secret no s\'accepta res');
  ok(!verificaSignatura(cos, 'v1=' + sig(cos), SECRET, ara).ok, 'sense t es rebutja');
  const r = processa(cos, cap, { STRIPE_WEBHOOK_SECRET: SECRET }, ara);
  ok(r.estat === 'pagat' && r.sessio === 'cs_test_1' && r.pagat && r.prova && r.import === 100, 'checkout.session.completed es llegeix');
  ok(!JSON.stringify(r).includes('algu@example.org'), 'i no en treu el correu');
  const altre = JSON.stringify({ type: 'charge.refunded' });
  ok(processa(altre, `t=${ara},v1=${sig(altre)}`, { STRIPE_WEBHOOK_SECRET: SECRET }, ara).estat === 'ignorat', 'un altre esdeveniment s\'ignora');
  ok(processa(cos, 't=1,v1=00', { STRIPE_WEBHOOK_SECRET: SECRET }, ara).estat === 'rebutjat', 'una signatura dolenta, rebutjat');
}

console.log('\n5 · Les funcions i el registre');
{
  const vell = console.log, linies = [];
  console.log = (...a) => linies.push(a.join(' '));
  const guarda = {};
  ['STRIPE_SECRET_KEY', 'STRIPE_PRICE_ID', 'STRIPE_WEBHOOK_SECRET', 'URL'].forEach(k => { guarda[k] = process.env[k]; delete process.env[k]; });
  const r1 = await handler({ httpMethod: 'POST' });
  const r2 = await handler({ httpMethod: 'GET', queryStringParameters: { session_id: 'cs_test_1' } });
  const r3 = await handler({ httpMethod: 'DELETE' });
  const r0 = await handler({ httpMethod: 'GET' });
  Object.assign(process.env, ENV);
  const r6 = await handler({ httpMethod: 'GET' });
  ['STRIPE_SECRET_KEY', 'STRIPE_PRICE_ID', 'URL'].forEach(k => delete process.env[k]);
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_prova';
  const t = Math.floor(Date.now() / 1000), cos = JSON.stringify({ type: 'checkout.session.completed', livemode: false, data: { object: { id: 'cs_test_9', payment_status: 'paid', customer_details: { email: 'algu@example.org' } } } });
  const v1 = createHmac('sha256', 'whsec_prova').update(t + '.' + cos).digest('hex');
  const r4 = await handlerAvis({ body: Buffer.from(cos).toString('base64'), isBase64Encoded: true, headers: { 'stripe-signature': `t=${t},v1=${v1}` } });
  const r5 = await handlerAvis({ body: cos, headers: { 'stripe-signature': `t=${t},v1=00` } });
  console.log = vell;
  Object.entries(guarda).forEach(([k, v]) => { if (v === undefined) delete process.env[k]; else process.env[k] = v; });
  ok(r1.statusCode === 503 && r2.statusCode === 503, 'sense claus, 503: l\'editor publica sense pagar');
  ok(r3.statusCode === 502, 'un altre mètode no fa res');
  ok(r0.statusCode === 503 && r6.statusCode === 200 && JSON.parse(r6.body).cobra === true && !/sk_test|price_/.test(r6.body), 'el GET sol diu si cobra, sense ensenyar claus ni preu');
  ok(/no-store/.test(r1.headers['Cache-Control']), 'la resposta no es desa a cap memòria cau');
  ok(r4.statusCode === 200 && /"pagat"/.test(r4.body), 'l\'avís en base64 es llegeix i respon 200');
  ok(r5.statusCode === 400, 'l\'avís mal signat respon 400');
  const txt = linies.join('\n');
  ok(!/algu@example|whsec_|sk_test/.test(txt), 'el registre no porta cap correu ni cap clau');
}

console.log(`\n${fail ? '❌' : '✅'} ${pass} correctes, ${fail} errors`);
process.exit(fail ? 1 : 0);
