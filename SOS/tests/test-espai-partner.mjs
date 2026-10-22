/* L'espai de cada agència · provat sense xarxa
   ─────────────────────────────────────────────────────────────────────────
   `netlify/functions/espai-partner.mjs` es prova en Node pur, amb un `fetch`
   fals: així corre a la CI i no toca cap CRM de debò. El que es prova:

   · Sense clau bona, sense credencials o amb una acció estranya, no crida res.
   · Una clau que no hi és, que Zoho troba amb altres majúscules o que hi és
     dues vegades no obre res.
   · Llegir torna el nom, l'acord i les propostes, i res més del compte.
   · Demanar crea un deal lligat a l'agència; acceptar, només un deal seu.
   · Fora, la resposta no diu per què està tancat; al registre, ni la clau.
   · Només les webs de la casa hi poden parlar des del navegador. */
import { processa, aDeal, aProposta, CAMPS, camps, clauBona, origenBo, handler } from '../../netlify/functions/espai-partner.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ✓ ' + m); } else { fail++; console.log('  ✗ ' + m); } };

const CLAU = 'Ab12Cd34Ef56Gh78Ij90Kl12Mn34';
const ENV = { ZOHO_CLIENT_ID: 'id', ZOHO_CLIENT_SECRET: 'secret', ZOHO_REFRESH_TOKEN: 'refresh' };
const cos = o => JSON.stringify(Object.assign({ clau: CLAU }, o));
const COMPTE = { id: '900', Account_Name: 'Agència Exemple', [CAMPS.clau]: CLAU, [CAMPS.comissio]: 10,
  [CAMPS.condicions]: 'Es paga en cobrar.', Description: 'NIF i adreça: no han de sortir', Phone: '600000000' };
const DEAL = { id: '55501', Deal_Name: 'Client · Fent Pinya · 2026-11-20', Stage: 'Clasificación', Closing_Date: '2026-11-20',
  Amount: 2800, Account_Name: { id: '900' }, [CAMPS.proposta]: 'https://exemple.org/p.pdf', Description: 'notes internes' };

const fals = (respostes) => {
  const crides = [];
  const f = async (url, opts) => {
    crides.push({ url, opts: opts || {} });
    const r = respostes[crides.length - 1];
    return { ok: r.status < 400, status: r.status, json: async () => (r.json === undefined ? Promise.reject(new Error('sense cos')) : r.json) };
  };
  f.crides = crides;
  return f;
};
const TOK = { status: 200, json: { access_token: 'tok' } };

console.log('\n1 · Què no crida res');
{
  const f = fals([]);
  let r = await processa('no és json', ENV, f);
  ok(r.estat === 'dolenta', 'un cos que no és JSON');
  r = await processa(cos({ accio: 'esborra' }), ENV, f);
  ok(r.estat === 'dolenta', 'una acció que no és de la llista');
  for (const c of ['', 'curta', CLAU + ')', CLAU.slice(0, 20) + ' or 1', 'x'.repeat(65)]) {
    r = await processa(JSON.stringify({ clau: c, accio: 'llegeix' }), ENV, f);
    ok(r.estat === 'tancat', 'clau rebutjada abans de Zoho: «' + c.slice(0, 24) + '»');
  }
  r = await processa(cos({ accio: 'llegeix' }), {}, f);
  ok(r.estat === 'sense-config' && /ZOHO_CLIENT_ID/.test(r.motiu), 'sense credencials diu què falta');
  r = await processa(cos({ accio: 'llegeix' }), { ...ENV, ZOHO_DRY_RUN: '1' }, f);
  ok(r.estat === 'prova' && r.dades.propostes.length === 1, 'en mode prova torna dades d\'exemple');
  ok(!f.crides.length, 'i en cap d\'aquests casos s\'ha cridat res');
  ok(clauBona(CLAU) && !clauBona('a b'), 'la forma de la clau');
}

console.log('\n2 · La clau obre una sola agència');
{
  let f = fals([TOK, { status: 204 }]);
  let r = await processa(cos({ accio: 'llegeix' }), ENV, f);
  ok(r.estat === 'tancat' && f.crides.length === 2, 'una clau que no hi és no obre res');
  ok(decodeURIComponent(f.crides[1].url).endsWith('/crm/v2/Accounts/search?criteria=(Clave_espacio:equals:' + CLAU + ')'), 'es busca pel camp de la clau');
  f = fals([TOK, { status: 200, json: { data: [{ ...COMPTE, [CAMPS.clau]: CLAU.toLowerCase() }] } }]);
  r = await processa(cos({ accio: 'llegeix' }), ENV, f);
  ok(r.estat === 'tancat', 'Zoho compara sense majúscules; aquí ha de coincidir exacta');
  f = fals([TOK, { status: 200, json: { data: [COMPTE, { ...COMPTE, id: '901' }] } }]);
  r = await processa(cos({ accio: 'llegeix' }), ENV, f);
  ok(r.estat === 'tancat' && r.motiu === 'clau repetida', 'una clau repetida no obre cap de les dues');
  ok(camps({ ZOHO_CAMP_CLAU: 'Clau_propia' }).clau === 'Clau_propia' && camps({ ZOHO_CAMP_CLAU: 'x:equals:y' }).clau === CAMPS.clau,
    'el nom del camp es pot canviar, però no amb caràcters de consulta');
}

console.log('\n3 · Llegir');
{
  const f = fals([TOK, { status: 200, json: { data: [COMPTE] } },
    { status: 200, json: { data: [DEAL, { ...DEAL, id: '55502', Closing_Date: '2027-01-10', Amount: null, [CAMPS.proposta]: 'javascript:alert(1)' }] } }]);
  const r = await processa(cos({ accio: 'llegeix' }), ENV, f);
  ok(r.estat === 'llegit' && r.dades.nom === 'Agència Exemple', 'torna el nom de l\'agència');
  ok(r.dades.acord.comissio === 10 && r.dades.acord.condicions === 'Es paga en cobrar.', 'i el seu acord');
  ok(f.crides[2].url.endsWith('/crm/v2/Accounts/900/Deals'), 'els deals surten de la llista lligada a l\'agència');
  ok(r.dades.propostes[0].data === '2027-01-10' && r.dades.propostes.length === 2, 'les propostes, la més nova primer');
  ok(r.dades.propostes[1].proposta === 'https://exemple.org/p.pdf' && r.dades.propostes[0].proposta === '', 'l\'enllaç de la proposta, només si és https');
  const txt = JSON.stringify(r.dades);
  ok(!/NIF|600000000|notes internes|Description|Phone/.test(txt), 'res del compte ni del deal que no sigui de la llista');
  ok(Object.keys(aProposta(DEAL, CAMPS)).join() === 'id,nom,fase,data,import,proposta', 'la llista tancada de camps d\'una proposta');
  const f2 = fals([TOK, { status: 200, json: { data: [{ ...COMPTE, [CAMPS.comissio]: null }] } }, { status: 204 }]);
  const r2 = await processa(cos({ accio: 'llegeix' }), ENV, f2);
  ok(r2.estat === 'llegit' && r2.dades.acord.comissio === null && r2.dades.propostes.length === 0, 'sense comissió ni deals, buit i sense rebentar');
}

console.log('\n4 · Demanar una proposta');
{
  ok(aDeal({ client: 'Client' }, '900') === null && aDeal({ data: '2026-11-20' }, '900') === null, 'sense client o sense data no hi ha deal');
  const d = aDeal({ client: 'Client', data: '2026-11-20', persones: '40', lloc: 'Girona', notes: 'a l\'aire lliure' }, '900');
  ok(d.Deal_Name === 'Client · Fent Pinya · 2026-11-20' && d.Stage === 'Clasificación' && d.Account_Name.id === '900', 'el deal porta nom, primera fase i l\'agència');
  ok(/Personas: 40/.test(d.Description) && /Lugar: Girona/.test(d.Description) && /Origen: espacio de la agencia/.test(d.Description), 'i la descripció, d\'on ve');
  const f = fals([TOK, { status: 200, json: { data: [COMPTE] } }, { status: 201, json: { data: [{ status: 'success', details: { id: '777' } }] } }]);
  const r = await processa(cos({ accio: 'demana', dades: { client: 'Client', data: '2026-11-20', Account_Name: { id: '1' } } }), ENV, f);
  ok(r.estat === 'creat' && r.id === '777', 'crea el deal');
  ok(JSON.parse(f.crides[2].opts.body).data[0].Account_Name.id === '900', 'lligat a l\'agència de la clau, no al que digui la petició');
}

console.log('\n5 · Acceptar una proposta');
{
  let f = fals([TOK, { status: 200, json: { data: [COMPTE] } }, { status: 200, json: { data: [{ ...DEAL, Account_Name: { id: '123' } }] } }]);
  let r = await processa(cos({ accio: 'accepta', id: '55501' }), ENV, f);
  ok(r.estat === 'tancat' && f.crides.length === 3, 'un deal d\'una altra agència no s\'accepta');
  f = fals([TOK, { status: 200, json: { data: [COMPTE] } }]);
  r = await processa(cos({ accio: 'accepta', id: '../Accounts' }), ENV, f);
  ok(r.estat === 'dolenta' && f.crides.length === 2, 'un id que no és un número no arriba a Zoho');
  f = fals([TOK, { status: 200, json: { data: [COMPTE] } }, { status: 200, json: { data: [DEAL] } }, { status: 201, json: { data: [{ status: 'success' }] } }]);
  r = await processa(cos({ accio: 'accepta', id: '55501' }), ENV, f);
  ok(r.estat === 'acceptat' && f.crides[3].url.endsWith('/crm/v2/Deals/55501/Notes'), 'el seu, s\'hi afegeix una nota');
  ok(!f.crides.some(c => c.opts.method === 'PUT'), 'i no se\'n canvia la fase');
}

console.log('\n6 · Els errors no rebenten');
{
  let f = fals([{ status: 400, json: { error: 'invalid_code' } }]);
  let r = await processa(cos({ accio: 'llegeix' }), ENV, f);
  ok(r.estat === 'error' && /invalid_code/.test(r.motiu), 'un token dolent');
  f = fals([TOK, { status: 400, json: { code: 'INVALID_QUERY' } }]);
  r = await processa(cos({ accio: 'llegeix' }), ENV, f);
  ok(r.estat === 'error' && /INVALID_QUERY/.test(r.motiu), 'un camp que no existeix a Zoho diu el codi');
}

console.log('\n7 · La resposta i el registre');
{
  ok(origenBo('https://www.teamtowers.eu') && origenBo('https://deploy-preview-9--teamtowers.netlify.app'), 'teamtowers.eu i les seves previews hi parlen');
  ok(!origenBo('https://teamtowers.eu.evil.com') && !origenBo('https://deploy-preview-9--teamtowers.netlify.app.evil.com') && !origenBo(undefined), 'cap altra web');
  const vell = console.log, linies = [];
  console.log = (...a) => linies.push(a.join(' '));
  Object.assign(process.env, ENV, { ZOHO_DRY_RUN: '1' });
  const res = await handler({ httpMethod: 'POST', headers: { origin: 'https://www.teamtowers.eu' }, body: cos({ accio: 'llegeix' }) });
  const tancat = await handler({ httpMethod: 'POST', headers: { origin: 'https://evil.example' }, body: JSON.stringify({ clau: 'x', accio: 'llegeix' }) });
  const get = await handler({ httpMethod: 'GET', headers: {}, body: '' });
  console.log = vell;
  ['ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN', 'ZOHO_DRY_RUN'].forEach(k => delete process.env[k]);
  ok(res.statusCode === 200 && res.headers['Access-Control-Allow-Origin'] === 'https://www.teamtowers.eu' && res.headers['Cache-Control'] === 'no-store', 'respon a la web de la casa, sense memòria cau');
  ok(tancat.statusCode === 403 && !tancat.headers['Access-Control-Allow-Origin'] && JSON.parse(tancat.body).motiu === undefined, 'tancat, sense dir per què, i sense obrir-se a una altra web');
  ok(get.statusCode === 405, 'per GET no es llegeix res: la clau no ha d\'anar a l\'adreça');
  ok(!linies.join('\n').includes(CLAU), 'el registre no porta la clau');
}

console.log(`\n${fail ? '❌' : '✅'} ${pass} correctes, ${fail} errors`);
process.exit(fail ? 1 : 0);
