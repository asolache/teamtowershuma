/* Els nicks reservats del Comando · un convit que no publica res per tu
   ─────────────────────────────────────────────────────────────────────────
   L'encàrrec era «crea els usuaris al directori de tots els fundadors». Fet
   literalment seria publicar dotze fitxes a nom de dotze persones reals,
   firmades per una clau que no és la seva — i això trenca l'única cosa que fa
   que aquest directori valgui res.

   El que es prova aquí és, sobretot, **el que el convit no fa**: que obrir-lo
   no publiqui res, que no bloquegi el nick a ningú, que el camp es pugui
   canviar, i que la fitxa que en surti la firmi la clau de qui l'ha feta i no
   una altra. Que el nick es posi al camp és el detall fàcil; la resta és el
   disseny.

   La normalització la comparteixen el generador i el directori: si divergissin,
   el convit obriria el formulari amb un nick que no és el reservat i tothom
   veuria un nom que hi és, només que un altre. Això ho vigila
   `build-convits.js`; aquí es prova el camí sencer. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const F = p => 'file://' + join(DIR, p);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

/* Un codi de mentida i el seu hash: no cal cap secret real al repositori per
   provar el camí, i posar-n'hi un el faria públic. S'injecta a `CONVITS` abans
   d'aplicar el hash. */
const CODI = 'a1b2c3d4e5f60718';
const HASH = createHash('sha256').update(CODI, 'utf8').digest('hex');

const nova = async () => {
  const ctx = await b.newContext({ viewport: { width: 900, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  return { ctx, p, errs };
};

console.log('\n1 · Les reserves són dels fundadors i estan normalitzades');
{
  const gen = readFileSync(join(DIR, 'tools', 'build-convits.js'), 'utf8');
  const app = readFileSync(join(DIR, 'index.html'), 'utf8');
  const fundadors = [...(app.match(/^const COMANDO_FOUNDERS=\[[\s\S]*?\n\];/m) || [''])[0]
    .matchAll(/hero:'((?:[^'\\]|\\.)*)'/g)].map(m => m[1].replace(/\\'/g, "'"));
  const reserves = [...(gen.match(/^const RESERVES = \[[\s\S]*?\n\];/m) || [''])[0]
    .matchAll(/heroi: '((?:[^'\\]|\\.)*)', *nick: '([^']*)'/g)]
    .map(m => ({ heroi: m[1].replace(/\\'/g, "'"), nick: m[2] }));
  ok(reserves.length === fundadors.length,
    `${reserves.length} reserves per als ${fundadors.length} fundadors del Comando`);
  const forans = reserves.filter(r => !fundadors.includes(r.heroi)).map(r => r.heroi);
  ok(!forans.length, 'i totes són per a un fundador declarat' + (forans.length ? ': ' + forans.join(', ') : ''));
  /* Al repositori no hi pot haver cap codi en clar: seria un codi públic, i
     llavors no identificaria ningú. Només el seu hash. */
  ok(!/codi: *'[0-9a-f]{8,}'/.test(gen), 'i cap codi d\'invitació en clar al generador');
}

console.log('\n2 · Amb el convit, el nick hi és — i no s\'ha publicat res');
{
  const { ctx, p, errs } = await nova();
  await p.goto(F('online.html'));
  await p.waitForFunction(() => window.__ONLINE && window.__ONLINE.convitDe);
  const r = await p.evaluate(async ([codi, hash]) => {
    const O = window.__ONLINE;
    /* S'hi posa una reserva de prova: la de debò encara no té codi encunyat,
       i encunyar-ne un per a un test el faria públic. */
    O.CONVITS.push({ nick: 'provador', heroi: 'Mazinguer', h: hash });
    location.hash = 'convit=' + codi;
    await O.entradaPerHash();
    await new Promise(x => setTimeout(x, 120));
    return {
      nick: document.querySelector('#fNick').value,
      obert: document.querySelector('#dlgAlta').open,
      bloquejat: document.querySelector('#fNick').disabled || document.querySelector('#fNick').readOnly,
      avis: (document.querySelector('#convitAvis').hidden ? '' : document.querySelector('#convitAvis').textContent),
      /* El que compta: al directori no hi ha d'haver res a nom d'aquest nick. */
      publicades: (O.S.fitxes || []).filter(f => f && f.nick === 'provador').length
    };
  }, [CODI, HASH]);
  ok(r.obert, 'el convit obre el formulari');
  ok(r.nick === 'provador', 'amb el nick reservat ja posat: @' + r.nick);
  ok(!r.bloquejat, 'i el camp es pot canviar: un convit no és una assignació');
  ok(r.publicades === 0, 'i al directori no hi ha cap fitxa amb aquell nick: no s\'ha publicat res');
  ok(/no el bloqueja a ningú|no hi ha registre/i.test(r.avis),
    'el cartell diu que reservar no bloqueja el nick a ningú');
  ok(/firmar|firma/i.test(r.avis), 'i que la fitxa la firmarà la seva clau');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · Un codi que no és, no obre res');
{
  const { ctx, p, errs } = await nova();
  await p.goto(F('online.html'));
  await p.waitForFunction(() => window.__ONLINE && window.__ONLINE.convitDe);
  const r = await p.evaluate(async ([hash]) => {
    const O = window.__ONLINE;
    O.CONVITS.push({ nick: 'provador', heroi: 'Mazinguer', h: hash });
    const dolent = await O.convitDe('0000000000000000');
    const buit = await O.convitDe('');
    const rar = await O.convitDe('<script>alert(1)</script>');
    /* Una reserva sense codi encunyat no s'ha de poder obrir amb un hash buit:
       seria una porta oberta a totes les que encara no tenen codi. */
    O.CONVITS.push({ nick: 'sensecodi', heroi: 'Purpleman', h: '' });
    const senseCodi = await O.convitDe('');
    return { dolent: !!dolent, buit: !!buit, rar: !!rar, senseCodi: !!senseCodi };
  }, [HASH]);
  ok(!r.dolent, 'un codi que no correspon a cap reserva no obre res');
  ok(!r.buit && !r.rar, 'ni un codi buit ni un que no és hexadecimal');
  ok(!r.senseCodi, 'i una reserva sense codi encunyat no s\'obre amb un codi buit');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · La fitxa que en surt la firma la clau de qui la fa');
{
  const { ctx, p, errs } = await nova();
  await p.goto(F('online.html'));
  await p.waitForFunction(() => window.__ONLINE && window.__ONLINE.bastirFitxa);
  const r = await p.evaluate(async () => {
    const O = window.__ONLINE;
    const f = await O.bastirFitxa({ nom: 'Qui sigui', nick: 'provador', municipi: 'Vilafranca del Penedès',
      pais: 'cat', ofereix: [{ cat: 'altres', txt: 'una cosa' }], busca: [], did: O.S.jo.did });
    /* El mateix que fa `publica()`: bastir i firmar. Es firma aquí perquè el
       que es prova és justament que la firma sigui la d'aquest navegador. */
    await O.signRecord(f);
    /* I l'intent lleig: la mateixa fitxa amb el did d'un altre. Ha de caure. */
    const robada = await O.bastirFitxa({ nom: 'Qui sigui', nick: 'provador', municipi: 'Vilafranca del Penedès',
      pais: 'cat', ofereix: [{ cat: 'altres', txt: 'una cosa' }], busca: [], did: 'did:sos:ed25519:0000' });
    await O.signRecord(robada);
    return { did: f.did, meu: O.S.jo.did, nick: f.nick,
      valida: await O.fitxaValida(f), robada: await O.fitxaValida(robada) };
  });
  ok(r.did === r.meu, 'la fitxa va a nom del did d\'aquest navegador, no d\'un altre');
  ok(r.nick === 'provador', 'amb el nick del convit');
  ok(r.valida && r.valida.ok === true,
    'i la firma la valida el navegador que la llegeix'
    + (r.valida && !r.valida.ok ? ': ' + r.valida.reason : ''));
  ok(r.robada && r.robada.ok === false,
    'i una fitxa amb el nick reservat i el did d\'un altre no passa: ' + (r.robada || {}).reason);
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await b.close();
console.log(`\n${fail ? '❌' : '✅'} ${pass} bé, ${fail} malament`);
process.exit(fail ? 1 : 0);
