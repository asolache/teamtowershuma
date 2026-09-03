/* El directori públic · /SOS/online
   ─────────────────────────────────
   És l'única pantalla del SOS on una persona publica el seu nom cap enfora, i
   per això el que es prova aquí no és que «funcioni» sinó les tres coses que
   la fan legítima:

   · **La firma mana, no el permís.** La taula és oberta a escriure. La defensa
     no és que ningú hi pugui inserir —hi pot— sinó que el que insereixi no
     verifiqui i no es pinti. Es proven quatre maneres d'intentar colar una
     fitxa a nom d'un altre, inclosa la que sembla que hauria de funcionar:
     firmar-la de debò amb la teva pròpia clau posant-hi el `did` d'un altre.
   · **El que surt s'ensenya abans de sortir.** El que es publica ha de ser
     exactament el que la previsualització deia, i res més.
   · **Retirar-se ha de funcionar** encara que la fila antiga segueixi a la
     taula, perquè no se n'esborra cap mai.

   I el pitjor cas: sense credencials, què veu la persona. Una pantalla buida
   s'assembla massa a «no hi ha ningú apuntat», i això seria mentida. */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';

const APP = 'file://' + join(dirname(fileURLToPath(import.meta.url)), '..', 'online.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const b = await chromium.launch(Object.assign({ args: ['--no-sandbox'] },
  process.env.SOS_CHROMIUM ? { executablePath: process.env.SOS_CHROMIUM } : {}));

const nova = async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(APP);
  await p.waitForFunction(() => window.__ONLINE && window.__ONLINE.S.jo);
  return { ctx, p, errs };
};

console.log('\n1 · Sense credencials, la pàgina diu què li falta');
{
  /* Aquesta prova mirava el fitxer publicat i donava per fet que no tenia
     credencials. El dia que el directori es va connectar de debò, va fallar
     —i el que havia canviat no era el codi, era el món—. Ara es prova **el
     camí**, no l'estat del fitxer: es carrega una còpia amb les credencials
     tretes, que és exactament la situació de qui es clona el repositori i
     encara no té projecte. */
  const cru = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'online.html'), 'utf8');
  const buida = join(tmpdir(), 'online-sense-credencials-' + Date.now() + '.html');
  writeFileSync(buida, cru
    .replace(/const SUPA_URL = '[^']*';/, "const SUPA_URL = '';")
    .replace(/const SUPA_KEY = '[^']*';/, "const SUPA_KEY = '';"));
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  try {
    await p.goto('file://' + buida);
    await p.waitForFunction(() => window.__ONLINE && window.__ONLINE.S.jo);
    const r = await p.evaluate(() => ({
      configurat: window.__ONLINE.configurat(),
      estat: document.querySelector('#estat').innerText.replace(/\s+/g, ' '),
      buit: document.querySelector('#fitxes').innerText.replace(/\s+/g, ' '),
      did: window.__ONLINE.S.jo.did
    }));
    ok(!r.configurat && /no està connectat/i.test(r.estat),
      'sense credencials diu que el directori no està connectat, en comptes de semblar buit');
    ok(/SUPA_URL/.test(r.estat) && /001_online_fitxes\.sql/.test(r.estat),
      'i diu exactament què cal fer perquè funcioni');
    ok(!/no hi ha ningú apuntat/i.test(r.buit),
      'i NO diu «no hi ha ningú apuntat», que seria mentida');
    ok(/^did:sos:/.test(r.did), 'la identitat es crea sola en entrar: ' + r.did.slice(0, 28) + '…');
    ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  } finally {
    await ctx.close();
    try { unlinkSync(buida); } catch (e) { /* ja no hi és */ }
  }
}

console.log('\n1b · I amb credencials, apunta a un projecte de debò');
{
  /* El que es pot comprovar sense sortir a la xarxa: que la configuració que
     porta el fitxer tingui la forma bona i que la clau **no** sigui mai la de
     servei. Que el projecte respongui no ho pot dir una prova d'aquí. */
  const cru = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'online.html'), 'utf8');
  const url = (cru.match(/const SUPA_URL = '([^']*)'/) || [])[1];
  const key = (cru.match(/const SUPA_KEY = '([^']*)'/) || [])[1];
  if (!url && !key) {
    ok(true, 'aquest clon encara no té directori connectat, i la pàgina ho diu (prova 1)');
  } else {
    ok(/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url), `la URL té la forma d'un projecte: ${url}`);
    ok(/^(sb_publishable_|eyJ)/.test(key), 'i la clau és de les publicables');
    ok(!/^sb_secret_/.test(key) && !/service_role/.test(key),
      'i NO és la de servei: aquella dona accés a tot i no pot viure en un fitxer que es publica');
  }
}

console.log('\n══ El que importa: la firma mana, no el permís ══');

console.log('\n2 · Quatre maneres d\'intentar colar una fitxa que no és teva');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const O = window.__ONLINE;
    const jo = await O.getIdentity();
    /* La bona, per tenir referència. */
    const bona = await O.signRecord(O.bastirFitxa({
      nom: 'Marta Vidal', municipi: 'Torrelles de Foix', did: jo.did,
      ofereix: [{ cat: 'cuina', txt: 'Cuino per a colles' }], busca: [],
      exPub: jo.exchange.pubJwk }));

    const out = {};
    out.bona = (await O.fitxaValida(bona)).ok;

    // a) Sense firma.
    const a = JSON.parse(JSON.stringify(bona)); delete a.sig; delete a.signer;
    out.sense = await O.fitxaValida(a);

    // b) Firmada de debò, però canviant el text DESPRÉS de firmar.
    const c = JSON.parse(JSON.stringify(bona));
    c.nom = 'Ajuntament de Torrelles';
    out.tocada = await O.fitxaValida(c);

    // c) El `did` de la fitxa diu una cosa i el de qui firma en diu una altra.
    const d = JSON.parse(JSON.stringify(bona));
    d.did = 'did:sos:ed25519:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
    out.didFals = await O.fitxaValida(d);

    /* d) La que sembla que hauria de colar: es firma de debò, amb una clau
          pròpia i vàlida, però posant-hi el did d'una altra persona a TOTS DOS
          llocs. La firma quadra amb la clau que porta. El que la tomba és que
          el did no és el hash d'aquella clau. */
    const victima = 'did:sos:ed25519:BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
    const e = O.bastirFitxa({ nom: 'Marta Vidal', municipi: 'Torrelles', did: victima,
      ofereix: [{ cat: 'cuina', txt: 'Suplantació' }], busca: [], exPub: jo.exchange.pubJwk });
    await O.signRecord(e);
    e.signer.did = victima;
    out.suplanta = await O.fitxaValida(e);
    out.suplantaFirmaOk = (await O.verifyRecord(e)).ok;
    return out;
  });
  ok(r.bona, 'una fitxa firmada per qui diu ser, passa');
  ok(!r.sense.ok && /firma/i.test(r.sense.reason), 'sense firma no passa: «' + r.sense.reason + '»');
  ok(!r.tocada.ok, 'tocar el nom després de firmar la invalida: «' + r.tocada.reason + '»');
  ok(!r.didFals.ok, 'un did que no és el de qui firma no passa: «' + r.didFals.reason + '»');
  ok(r.suplantaFirmaOk && !r.suplanta.ok,
    'i la difícil: firma VÀLIDA amb clau pròpia i did d\'un altre — cau perquè «' + r.suplanta.reason + '»');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n3 · El sedàs deixa passar la vàlida més nova, i prou');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const O = window.__ONLINE;
    const jo = await O.getIdentity();
    const fer = async (nom, at, extra) => {
      const f = O.bastirFitxa(Object.assign({ nom, municipi: 'Torrelles', did: jo.did,
        ofereix: [{ cat: 'cuina', txt: 'Cuino' }], busca: [], exPub: jo.exchange.pubJwk }, extra || {}));
      f.at = at; return await O.signRecord(f);
    };
    const vella = await fer('Marta (vella)', '2026-01-01T00:00:00.000Z');
    const nova = await fer('Marta (nova)', '2026-08-01T00:00:00.000Z');
    const falsa = JSON.parse(JSON.stringify(nova));
    falsa.nom = 'Marta (falsificada)'; falsa.at = '2026-12-31T00:00:00.000Z';

    const r1 = await O.tamisar([{ did: jo.did, fitxa: vella }, { did: jo.did, fitxa: nova },
      { did: jo.did, fitxa: falsa }]);
    /* Retirar-se: la fila vella hi segueix, perquè no se n'esborra cap mai. */
    const baixa = await fer('Marta', '2026-09-01T00:00:00.000Z', { retirada: true });
    const r2 = await O.tamisar([{ did: jo.did, fitxa: nova }, { did: jo.did, fitxa: baixa }]);
    return { n1: r1.fitxes.length, nom1: r1.fitxes[0] && r1.fitxes[0].nom, desc: r1.descartades.length,
      n2: r2.fitxes.length, retirades: r2.retirades };
  });
  ok(r.n1 === 1 && r.nom1 === 'Marta (nova)',
    'de tres files en surt una: la vàlida més nova (' + r.nom1 + ')');
  ok(r.desc === 1, 'i la falsificada més nova cau abans de competir: no guanya per ser posterior');
  ok(r.n2 === 0 && r.retirades === 1,
    'retirar-se funciona encara que la fitxa anterior segueixi a la taula');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n4 · El que es publica és el que s\'ha ensenyat, i res més');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const O = window.__ONLINE;
    const jo = await O.getIdentity();
    /* S'hi cola de tot el que un formulari podria arrossegar sense voler. */
    const f = O.bastirFitxa({ nom: 'Marta Vidal', municipi: 'Torrelles', did: jo.did,
      ofereix: [{ cat: 'cuina', txt: 'Cuino' }], busca: [], exPub: jo.exchange.pubJwk,
      correu: 'marta@exemple.cat', telefon: '600000000', adreca: 'Carrer Major 3',
      lat: 41.4, lon: 1.6, notesInternes: 'no ho ensenyis' });
    return { claus: Object.keys(f).sort(), permeses: O.CAMPS.slice().sort() };
  });
  const cola = r.claus.filter(k => !r.permeses.includes(k));
  ok(!cola.length, 'cap camp que no sigui de la llista arriba a la fitxa' + (cola.length ? ': ' + cola : ''));
  ok(!r.claus.includes('correu') && !r.claus.includes('telefon') && !r.claus.includes('adreca'),
    'ni correu, ni telèfon, ni adreça, encara que se li passin explícitament');
  ok(!r.claus.includes('lat') && !r.claus.includes('lon'),
    'ni coordenades: el municipi és tot el que se sap del lloc');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n5 · La previsualització diu la veritat, i el formulari no demana el que no publica');
{
  const { ctx, p, errs } = await nova();
  await p.evaluate(() => {
    const O = window.__ONLINE;
    document.querySelector('#fNom').value = 'Marta Vidal';
    document.querySelector('#fMuni').value = 'Torrelles de Foix';
    O.S.esborrany = { ofereix: [{ cat: 'cuina', txt: 'Cuino per a colles' }],
      busca: [{ cat: 'transport', txt: 'Portar caixes' }] };
    O.pintaPrevi();
  });
  const r = await p.evaluate(() => ({
    previ: document.querySelector('#previ').innerText.replace(/\s+/g, ' '),
    camps: [...document.querySelectorAll('#formAlta input,#formAlta textarea')]
      .map(e => (e.id || '') + ':' + (e.type || '')),
  }));
  ok(/Marta Vidal/.test(r.previ) && /Torrelles de Foix/.test(r.previ) && /Cuino per a colles/.test(r.previ),
    'la previsualització ensenya el que s\'ha escrit');
  ok(/Ni correu, ni telèfon, ni adreça/i.test(r.previ),
    'i diu explícitament el que NO se\'n publica');
  const sospitosos = r.camps.filter(c => /mail|tel|phone|adre|address/i.test(c));
  ok(!sospitosos.length,
    'el formulari no té cap camp de correu ni de telèfon' + (sospitosos.length ? ': ' + sospitosos : ''));
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n6 · El cercador busca alhora pel nom, el lloc, la categoria i el text');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const O = window.__ONLINE;
    const jo = await O.getIdentity();
    O.S.fitxes = [
      { did: 'd1', nom: 'Marta Vidal', municipi: 'Torrelles de Foix',
        ofereix: [{ cat: 'cuina', txt: 'Cuino per a colles' }], busca: [] },
      { did: 'd2', nom: 'Pau Ferrer', municipi: 'Vilafranca',
        ofereix: [], busca: [{ cat: 'transport', txt: 'Portar caixes' }] },
      { did: jo.did, nom: 'Jo mateix', municipi: 'Torrelles de Foix',
        ofereix: [{ cat: 'jardineria', txt: 'Podar' }], busca: [] }
    ];
    const prova = (q, dir, meu) => { O.S.q = q; O.S.dir = dir || ''; O.S.nomesMeu = !!meu;
      return O.filtrar().map(f => f.nom); };
    const out = {
      nom: prova('marta'), lloc: prova('torrelles'), cat: prova('transport'),
      lliure: prova('caixes'), dues: prova('torrelles podar'),
      soloOf: prova('', 'ofereix'), soloBu: prova('', 'busca'), meu: prova('', '', true),
      res: prova('inexistent')
    };
    O.S.q = ''; O.S.dir = ''; O.S.nomesMeu = false;
    return out;
  });
  ok(r.nom.length === 1 && r.nom[0] === 'Marta Vidal', 'pel nom');
  ok(r.lloc.length === 2, 'pel municipi (' + r.lloc.length + ' de Torrelles)');
  ok(r.cat.length === 1 && r.cat[0] === 'Pau Ferrer', 'per la categoria, encara que no s\'hagi escrit');
  ok(r.lliure.length === 1 && r.lliure[0] === 'Pau Ferrer', 'pel text lliure');
  ok(r.dues.length === 1 && r.dues[0] === 'Jo mateix', 'dues paraules filtren per totes dues');
  ok(r.soloOf.length === 2 && r.soloBu.length === 1, 'els filtres d\'ofertes i demandes separen bé');
  ok(r.meu.length === 1 && r.meu[0] === 'Jo mateix', '«la meva fitxa» ensenya la meva');
  ok(r.res.length === 0, 'i el que no hi és, no hi és');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n7 · La sala és la mateixa per tots dos, i el que hi passa va xifrat');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const O = window.__ONLINE;
    const jo = await O.getIdentity();
    const altre = 'did:sos:ed25519:ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ';
    /* Cada banda calcula la sala pel seu compte, en l'ordre que li toca. */
    const salaA = await O.salaEntre(jo.did, altre);
    const salaB = await O.salaEntre(altre, jo.did);
    /* Xifrar contra la meva pròpia clau d'intercanvi: prova el camí sencer
       (derivació ECDH → AES-GCM → tornar-ho a llegir) sense un segon navegador. */
    const clau = await O.clauEntre(jo.exchange.pubJwk, jo.exchange.pubJwk);
    const blob = await O.xifra(clau, 'Que sí, que et porto les caixes dissabte');
    const clar = await O.desxifra(clau, blob);
    let altraClau = null, falla = false;
    try {
      const p2 = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']);
      altraClau = await crypto.subtle.deriveKey(
        { name: 'ECDH', public: await crypto.subtle.importKey('jwk', jo.exchange.pubJwk,
          { name: 'ECDH', namedCurve: 'P-256' }, true, []) },
        p2.privateKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      await O.desxifra(altraClau, blob);
    } catch (e) { falla = true; }
    return { salaA, salaB, blob, clar, falla };
  });
  ok(r.salaA === r.salaB && r.salaA.length === 32,
    'les dues bandes calculen la mateixa sala sense parlar-ne: ' + r.salaA.slice(0, 12) + '…');
  ok(!/caixes/.test(r.blob), 'el que viatja no porta el text a dins');
  ok(r.clar === 'Que sí, que et porto les caixes dissabte', 'i qui té la clau ho llegeix sencer');
  ok(r.falla, 'i una tercera clau NO ho pot desxifrar: qui allotja el relé no hi arriba');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n8 · La identitat és la mateixa que la de l\'aplicació');
/* Mateix origen, mateixa IndexedDB. Si aquesta pàgina es fes la seva pròpia
   identitat, qui ja fa servir el SOS seria dues persones diferents per al
   sistema i el que publiqui aquí no el reconeixeria mai la seva app. */
{
  const { ctx, p, errs } = await nova();
  const primer = await p.evaluate(() => window.__ONLINE.S.jo.did);
  await p.reload();
  await p.waitForFunction(() => window.__ONLINE && window.__ONLINE.S.jo);
  const segon = await p.evaluate(() => window.__ONLINE.S.jo.did);
  const rec = await p.evaluate(() => new Promise(res => {
    const r = indexedDB.open('SOS_MVP', 1);
    r.onsuccess = e => { const db = e.target.result;
      const g = db.transaction('nodes', 'readonly').objectStore('nodes').get('__identity');
      g.onsuccess = () => res(g.result ? { id: g.result.id, did: g.result.did, alg: g.result.alg } : null);
      g.onerror = () => res(null); };
    r.onerror = () => res(null);
  }));
  ok(primer === segon, 'recarregar no en fa una de nova: ' + primer.slice(0, 28) + '…');
  ok(rec && rec.id === '__identity' && rec.did === primer,
    'i és el mateix registre `__identity` de la base de dades del SOS (' + (rec && rec.alg) + ')');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n8b · La fitxa segueix valent quan torna amb les claus desordenades');
/* Aquesta és la prova de l'avaria que va deixar el directori en blanc amb una
   sola fitxa publicada, la del propi autor. Tot verificava —la firma Ed25519
   quadrava amb els bytes desats— i tot i així el sedàs la descartava dient «el
   did no surt d'aquesta clau».

   El motiu: el `did` es derivava del hash de `JSON.stringify(jwk)`, i això no
   és un hash de la clau sinó de **com l'ha escrit qui l'hagi escrit**. El
   navegador exporta el JWK alfabèticament; Postgres el torna com a `jsonb`,
   que ordena les claus per longitud i després pel seu byte. Mateixa clau, dos
   textos, dos dids.

   Aquí es reprodueix el viatge: es firma una fitxa i se li reordenen les claus
   del JWK **tal com ho fa `jsonb`** abans de tornar-la a passar pel sedàs. Si
   algun dia algú torna a posar `JSON.stringify` a `_didFromJwk`, aquesta
   asserció cau i diu per què. */
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const O = window.__ONLINE;
    const jo = await O.getIdentity();
    const f = O.bastirFitxa({ nom: 'Marta Vidal', municipi: 'Torrelles', did: jo.did,
      ofereix: [{ cat: 'cuina', txt: 'Cuino per a colles' }], busca: [], exPub: jo.exchange.pubJwk });
    await O.signRecord(f);
    const abans = await O.fitxaValida(f);
    /* L'ordre que retorna `jsonb`: primer per longitud de la clau, després
       byte a byte. No és una invenció de la prova, és el que fa Postgres. */
    const comJsonb = o => {
      const out = {};
      Object.keys(o).sort((a, c) => a.length - c.length || (a < c ? -1 : a > c ? 1 : 0))
        .forEach(k => { out[k] = o[k]; });
      return out;
    };
    const tornada = JSON.parse(JSON.stringify(f));
    tornada.signer.pubJwk = comJsonb(tornada.signer.pubJwk);
    const despres = await O.fitxaValida(tornada);
    /* I la prova que l'ordre canviava de debò: la derivació vella. */
    const _te = new TextEncoder();
    const vell = 'did:sos:' + jo.alg.toLowerCase() + ':' +
      (await O.sha256(_te.encode(JSON.stringify(tornada.signer.pubJwk)))).slice(0, 32);
    const nou = await O._didFromJwk(jo.alg, tornada.signer.pubJwk);
    return { abans: abans.ok, despres, ordreCanviat: Object.keys(tornada.signer.pubJwk).join(',')
      !== Object.keys(f.signer.pubJwk).join(','), vell, nou, did: jo.did,
      cru: Object.keys(f.signer.pubJwk).join(','), jsonb: Object.keys(tornada.signer.pubJwk).join(',') };
  });
  ok(r.abans, 'la fitxa acabada de firmar val');
  ok(r.ordreCanviat, 'i en tornar de la taula les claus arriben en un altre ordre: ' + r.cru + ' → ' + r.jsonb);
  ok(r.despres.ok, 'i **segueix valent**, que és el que abans no passava: ' + r.despres.reason);
  ok(r.vell !== r.did, 'la derivació vella li hauria donat un did diferent (' + r.vell.slice(9, 30) + '…) i l\'hauria descartada');
  ok(r.nou === r.did, 'i la canònica li dona el seu: ' + r.nou.slice(0, 26) + '…');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n8c · El cartell de descartades diu el motiu, i no acusa quan la fitxa és teva');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const O = window.__ONLINE, S = O.S;
    const jo = await O.getIdentity();
    /* Una fitxa meva que no quadra (li toquem el nom després de firmar) i una
       d'un desconegut que ve directament sense firma. */
    const meva = O.bastirFitxa({ nom: 'Jo', municipi: 'Foix', did: jo.did, ofereix: [{ cat: 'cuina', txt: 'x' }], busca: [] });
    await O.signRecord(meva);
    meva.nom = 'Un altre';
    const seva = { '@type': O.FITXA_TIPUS, v: 1, did: 'did:sos:ed25519:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      nom: 'Ningú', municipi: 'Enlloc', ofereix: [], busca: [], at: new Date().toISOString() };
    const t = await O.tamisar([{ did: meva.did, fitxa: meva }, { did: seva.did, fitxa: seva }], jo.did);
    S.descartades = t.descartades; S.fitxes = t.fitxes;
    O.pintaEstat();
    return { motius: t.descartades.map(d => d.motiu), meus: t.descartades.filter(d => d.meu).length,
      txt: document.querySelector('#estat').innerText.replace(/\s+/g, ' ') };
  });
  ok(r.motius.includes('firma que no quadra') && r.motius.includes('sense firma'),
    'el sedàs guarda el motiu de cadascuna: ' + r.motius.join(' · '));
  ok(r.meus === 1, 'i sap quina de les dues és teva');
  ok(/firma que no quadra/.test(r.txt) && /sense firma/.test(r.txt),
    'el cartell diu els motius reals en comptes d\'un de sol per a tot');
  ok(/una de les descartades és la teva/i.test(r.txt) && /no és cap intrús/i.test(r.txt),
    'i quan una és teva no acusa ningú: diu que és aquest navegador');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n8d · «Porta el meu perfil del SOS» llegeix el que ja tens, i no publica res');
/* El perfil no s'importa de cap lloc: viu a la mateixa IndexedDB. El que es
   prova és que s'hi arriba pel `did` —no pel nom, que dos veïns poden
   compartir— i que omplir el formulari no és publicar. */
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const O = window.__ONLINE;
    const jo = await O.getIdentity();
    /* Se sembra un node com el que deixaria l'app: dues persones, una amb el
       meu did, ofertes i demandes, i una oferta retirada que no ha de sortir. */
    await O.dbPut({ id: 'n1', type: 'node', name: 'Banc de temps de Foix', municipi: 'Torrelles de Foix',
      members: [{ id: 'm1', name: 'Marta Vidal', did: jo.did }, { id: 'm2', name: 'Un altre' }],
      offers: [
        { id: 'o1', memberId: 'm1', kind: 'oferta', category: 'cuina', title: 'Cuino per a colles — Marta Vidal', status: 'activa' },
        { id: 'o2', memberId: 'm1', kind: 'demanda', category: 'transport', title: 'Algú que em porti caixes', status: 'activa' },
        { id: 'o3', memberId: 'm1', kind: 'oferta', category: 'costura', title: 'Cosir — Marta Vidal', status: 'retirada' },
        { id: 'o4', memberId: 'm2', kind: 'oferta', category: 'idiomes', title: 'Anglès — Un altre', status: 'activa' },
        /* Un títol amb guionet propi: no s'ha de retallar per la meitat. */
        { id: 'o5', memberId: 'm1', kind: 'oferta', category: 'idiomes', title: 'Classes de reforç – matemàtiques', status: 'activa' }
      ] });
    await O.dbPut({ id: 'dossier:marta-vidal', type: 'dossier', personKey: 'marta-vidal',
      name: 'Marta Vidal', municipi: 'Sant Quintí de Mediona' });
    const perfil = await O.perfilDelSOS();
    O.obreAlta();
    await O.portaPerfil();
    const previ = document.querySelector('#previ').innerText.replace(/\s+/g, ' ');
    return { perfil, nom: document.querySelector('#fNom').value,
      muni: document.querySelector('#fMuni').value,
      avis: document.querySelector('#perfilAvis').textContent, previ,
      meva: O.S.meva };
  });
  ok(r.perfil.nom === 'Marta Vidal', 'troba el teu nom pel did, no pel nom: ' + r.perfil.nom);
  ok(r.perfil.ofereix.length === 2 && r.perfil.ofereix[0].txt === 'Cuino per a colles',
    'i li treu el sufix del nom que l\'app hi enganxa: «' + r.perfil.ofereix[0].txt + '»');
  ok(r.perfil.ofereix.some(x => x.txt === 'Classes de reforç – matemàtiques'),
    'però un títol amb guionet propi arriba sencer, no retallat pel primer guionet');
  ok(r.perfil.ofereix[0].cat === 'cuina' && r.perfil.busca[0].cat === 'transport',
    'les categories creuen directament amb les del banc de temps');
  ok(!r.perfil.ofereix.some(x => /Cosir/.test(x.txt)), 'una oferta retirada no torna a sortir sola');
  ok(!r.perfil.ofereix.concat(r.perfil.busca).some(x => /Anglès/.test(x.txt)),
    'i el que és d\'un altre soci no és teu');
  ok(r.muni === 'Sant Quintí de Mediona', 'el municipi surt del teu dossier, no del node: ' + r.muni);
  ok(r.nom === 'Marta Vidal' && /Cuino per a colles/.test(r.previ),
    'el formulari queda ple i la previsualització ja ho ensenya');
  ok(/no s'ha publicat res/i.test(r.avis), 'i es diu que encara no s\'ha publicat res: «' + r.avis.slice(-46) + '»');
  ok(!r.meva, 'perquè de fet no s\'ha publicat: no hi ha cap fitxa teva al directori');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n8e · Entrar amb la identitat del SOS, que és un fitxer i una contrasenya');
{
  const { ctx, p, errs } = await nova();
  const r = await p.evaluate(async () => {
    const O = window.__ONLINE;
    const original = (await O.getIdentity()).did;
    const copia = await O.exportaIdentitat('una-frase-llarga');
    const out = { original, tipus: copia.type, iters: copia.iters, teCt: !!copia.ct,
      claueEnClar: /privJwk|"x":/.test(JSON.stringify(copia).replace(/"ct":"[^"]*"/, '')) };
    /* Contrasenya equivocada: no entra, i ho diu pel seu nom. */
    try { await O.entraAmbIdentitat(copia, 'una-altra-frase'); out.malament = 'ha entrat!'; }
    catch (e) { out.malament = e.code + ' · ' + e.message; }
    /* Una identitat diferent no es substitueix sense dir-ho. */
    const altra = JSON.parse(JSON.stringify(copia));
    altra.did = 'did:sos:ed25519:BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
    try { await O.entraAmbIdentitat(altra, 'una-frase-llarga'); out.sensePermis = 'ha entrat!'; }
    catch (e) { out.sensePermis = e.code; }
    out.encaraSoc = (await O.getIdentity()).did;
    /* I amb la contrasenya bona, entra. */
    const r2 = await O.entraAmbIdentitat(copia, 'una-frase-llarga');
    out.tornat = r2.did;
    return out;
  });
  ok(r.tipus === 'sos-identity-backup' && r.iters === 210000 && r.teCt,
    'la còpia té el format i els paràmetres de l\'app (' + r.tipus + ', ' + r.iters + ' iteracions)');
  ok(!r.claueEnClar, 'i la clau privada només hi és xifrada: fora del `ct` no hi ha res de la clau');
  ok(/bad_pass/.test(r.malament), 'amb la contrasenya equivocada no entra: «' + r.malament + '»');
  ok(r.sensePermis === 'exists', 'i una identitat diferent no substitueix la que hi ha sense confirmar-ho');
  ok(r.encaraSoc === r.original, 'després dels dos intents segueixes sent qui eres');
  ok(r.tornat === r.original, 'amb la còpia bona, hi entres: ' + r.tornat.slice(0, 26) + '…');
  ok(errs.length === 0, 'sense errors de pàgina' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

console.log('\n9 · A 390 px no es desborda i tot es pot prémer');
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  await p.goto(APP);
  await p.waitForFunction(() => window.__ONLINE && window.__ONLINE.S.jo);
  const r = await p.evaluate(() => {
    const visible = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      petits: [...document.querySelectorAll('button,input,select')].filter(visible)
        .filter(e => e.getBoundingClientRect().height < 32)
        .map(e => (e.id || e.textContent.trim()).slice(0, 20)) };
  });
  ok(r.sw <= r.cw + 1, 'sense desbordament horitzontal (' + r.sw + ' ≤ ' + r.cw + ')');
  ok(!r.petits.length, 'cap control minúscul' + (r.petits.length ? ': ' + r.petits.join(' · ') : ''));
  await ctx.close();
}

await b.close();
console.log('\n' + (fail ? '❌ ' + fail + ' fallen de ' + (pass + fail) : '✅ ' + pass + ' assercions, totes verdes'));
process.exit(fail ? 1 : 0);
