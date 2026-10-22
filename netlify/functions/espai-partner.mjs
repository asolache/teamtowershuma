/* L'espai de cada agència · les seves propostes i el seu acord, llegits de Zoho
   ─────────────────────────────────────────────────────────────────────────
   Demanat per l'Àlvar el 21/10/2026: que els partners de TeamTowers, que en
   general són agències d'esdeveniments, tinguin el seu espai propi per veure i
   gestionar les propostes i els acords. Va triar l'accés per **enllaç privat**:
   cada agència rep un enllaç seu i, si es filtra, es canvia a Zoho i el vell
   deixa de servir.

   És un servei de la casa en mode gestionat (veda 171): les claus de Zoho viuen
   aquí i la web de la marca (teamtowers.eu/agencias/) només hi parla. Les dades
   no surten mai de Zoho cap a cap repositori.

   Les tres accions, totes per POST perquè la clau no quedi a cap registre:

   · `llegeix`  · el nom de l'agència, el seu acord i les seves propostes.
   · `demana`   · una proposta nova per a un client seu: un deal a Zoho, a la
                  primera fase, lligat a l'agència.
   · `accepta`  · una nota al deal que diu que l'agència l'accepta. No en canvia
                  la fase: això ho fa una persona.

   El que no es negocia:

   · **La clau és l'única porta.** Es busca a Zoho pel camp de l'agència i ha de
     coincidir exacta (Zoho compara sense majúscules). Una clau que no hi és, o
     que hi és dues vegades, no obre res, i la resposta no diu quin dels dos.
   · **Cada agència veu només el seu.** Els deals surten de la llista lligada a
     l'agència; per acceptar-ne un, es comprova que sigui seu.
   · **Cap dada al registre.** Ni la clau, ni noms, ni imports: l'acció i el
     resultat.

   Variables d'entorn: les de Zoho de `submission-created.mjs` (el token ha de
   poder llegir comptes i deals, i crear deals i notes). Opcionals: els noms
   dels camps de Zoho, si no són els de `CAMPS`. */
import { config } from './submission-created.mjs';

export const CAMPS = {
  clau: 'Clave_espacio',          // Comptes · línia única: la clau de l'enllaç
  comissio: 'Comision',           // Comptes · percentatge
  condicions: 'Condiciones_agencia', // Comptes · text llarg: el que s'ha pactat
  proposta: 'Enlace_propuesta'    // Deals · URL: el document de la proposta
};
const FASE_NOVA = 'Clasificación';

const ORIGENS = [
  'https://www.teamtowers.eu', 'https://teamtowers.eu', 'https://teamtowershuma.com',
  /^https:\/\/deploy-preview-\d+--teamtowers\.netlify\.app$/,
  /^https:\/\/deploy-preview-\d+--teamtowershuma\.netlify\.app$/
];
export const origenBo = o => typeof o === 'string' && ORIGENS.some(x => (typeof x === 'string' ? x === o : x.test(o)));

const net = v => (v == null ? '' : String(v)).trim();
const tall = (v, n) => { const s = net(v); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
export const clauBona = c => /^[A-Za-z0-9_-]{24,64}$/.test(net(c));
const nomCamp = v => (/^[A-Za-z0-9_]{1,60}$/.test(net(v)) ? net(v) : '');

export function camps(env) {
  return {
    clau: nomCamp(env.ZOHO_CAMP_CLAU) || CAMPS.clau,
    comissio: nomCamp(env.ZOHO_CAMP_COMISSIO) || CAMPS.comissio,
    condicions: nomCamp(env.ZOHO_CAMP_CONDICIONS) || CAMPS.condicions,
    proposta: nomCamp(env.ZOHO_CAMP_PROPOSTA) || CAMPS.proposta
  };
}

/* Del deal de Zoho al que veu l'agència: una llista tancada de camps. */
export function aProposta(d, k) {
  const url = net(d[k.proposta]);
  return {
    id: net(d.id), nom: tall(d.Deal_Name, 200), fase: tall(d.Stage, 80), data: net(d.Closing_Date).slice(0, 10),
    import: typeof d.Amount === 'number' ? d.Amount : null,
    proposta: /^https:\/\/[^\s"<>]+$/.test(url) ? url : ''
  };
}

/* El que l'agència demana, net i curt. Torna null si falta el que Zoho exigeix. */
export function aDeal(dades, compte) {
  const x = dades && typeof dades === 'object' ? dades : {};
  const client = tall(x.client, 120), data = net(x.data), persones = parseInt(x.persones, 10);
  if (!client || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return null;
  return {
    Deal_Name: tall(client + ' · Fent Pinya · ' + data, 120),
    Stage: FASE_NOVA,
    Closing_Date: data,
    Account_Name: { id: compte },
    Description: tall([
      'Origen: espacio de la agencia (web)',
      persones > 0 && 'Personas: ' + persones,
      net(x.lloc) && 'Lugar: ' + tall(x.lloc, 200),
      net(x.notes) && 'Notas: ' + tall(x.notes, 2000)
    ].filter(Boolean).join('\n'), 32000)
  };
}

const PROVA = {
  nom: 'Agencia de prueba', acord: { comissio: 10, condicions: 'Ejemplo: la comisión se paga al cobrar el taller.' },
  propostes: [{ id: '1', nom: 'Cliente de ejemplo · Fent Pinya · 2026-11-20', fase: 'Cotización de propuesta/precio', data: '2026-11-20', import: null, proposta: '' }]
};

/* Una petició, de cap a peus. `fetchFn` i `env` s'injecten per als tests. */
export async function processa(body, env, fetchFn = globalThis.fetch) {
  let p;
  try { p = JSON.parse(body || '{}'); } catch (e) { return { estat: 'dolenta', motiu: 'cos que no és JSON' }; }
  const accio = net(p.accio);
  if (!['llegeix', 'demana', 'accepta'].includes(accio)) return { estat: 'dolenta', motiu: 'acció desconeguda' };
  if (!clauBona(p.clau)) return { estat: 'tancat', accio, motiu: 'clau amb forma estranya' };
  const c = config(env);
  if (!c.ok) return { estat: 'sense-config', accio, motiu: c.motiu };
  if (c.dryRun) {
    if (accio === 'llegeix') return { estat: 'prova', accio, dades: PROVA };
    if (accio === 'demana') return aDeal(p.dades, '0') ? { estat: 'prova', accio } : { estat: 'dolenta', accio, motiu: 'falten el client o la data' };
    return { estat: 'prova', accio };
  }
  const k = camps(env), clau = net(p.clau);

  const tok = await fetchFn(c.accounts + '/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: env.ZOHO_REFRESH_TOKEN, client_id: env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET, grant_type: 'refresh_token'
    }).toString()
  });
  const tj = await tok.json().catch(() => ({}));
  if (!tok.ok || !tj.access_token) return { estat: 'error', accio, motiu: 'token: ' + (tj.error || tok.status) };
  const H = { 'Authorization': 'Zoho-oauthtoken ' + tj.access_token };
  /* Zoho torna 204 sense cos quan no hi ha res: això és una llista buida. */
  const llegeix = async url => {
    const r = await fetchFn(url, { headers: H });
    if (r.status === 204) return { ok: true, data: [] };
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, data: Array.isArray(j.data) ? j.data : [], codi: j.code || r.status };
  };

  const cerca = await llegeix(c.api + '/crm/v2/Accounts/search?criteria=' + encodeURIComponent('(' + k.clau + ':equals:' + clau + ')'));
  if (!cerca.ok) return { estat: 'error', accio, motiu: 'compte: ' + cerca.codi };
  const comptes = cerca.data.filter(a => net(a[k.clau]) === clau);
  if (comptes.length !== 1) return { estat: 'tancat', accio, motiu: comptes.length ? 'clau repetida' : 'clau que no hi és' };
  const compte = comptes[0], id = net(compte.id);

  if (accio === 'llegeix') {
    const ds = await llegeix(c.api + '/crm/v2/Accounts/' + encodeURIComponent(id) + '/Deals');
    if (!ds.ok) return { estat: 'error', accio, motiu: 'deals: ' + ds.codi };
    const pct = Number(compte[k.comissio]);
    return {
      estat: 'llegit', accio, dades: {
        nom: tall(compte.Account_Name, 200),
        acord: { comissio: Number.isFinite(pct) && compte[k.comissio] != null ? pct : null, condicions: tall(compte[k.condicions], 4000) },
        propostes: ds.data.map(d => aProposta(d, k)).sort((a, b) => (b.data > a.data ? 1 : b.data < a.data ? -1 : 0))
      }
    };
  }

  if (accio === 'demana') {
    const deal = aDeal(p.dades, id);
    if (!deal) return { estat: 'dolenta', accio, motiu: 'falten el client o la data' };
    const r = await fetchFn(c.api + '/crm/v2/Deals', {
      method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [deal], trigger: ['workflow'] })
    });
    const rj = await r.json().catch(() => ({}));
    const fila = rj.data && rj.data[0];
    if (!r.ok || !fila || fila.status !== 'success') return { estat: 'error', accio, motiu: 'deal: ' + ((fila && fila.code) || rj.code || r.status) };
    return { estat: 'creat', accio, id: fila.details && fila.details.id };
  }

  /* accepta: només un deal de la seva llista. */
  const deal = net(p.id);
  if (!/^\d{5,25}$/.test(deal)) return { estat: 'dolenta', accio, motiu: 'deal amb forma estranya' };
  const d = await llegeix(c.api + '/crm/v2/Deals/' + deal);
  const seu = d.ok && d.data[0] && d.data[0].Account_Name && net(d.data[0].Account_Name.id) === id;
  if (!seu) return { estat: 'tancat', accio, motiu: 'deal que no és seu' };
  const r = await fetchFn(c.api + '/crm/v2/Deals/' + deal + '/Notes', {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: [{ Note_Title: 'Aceptada por la agencia', Note_Content: 'La agencia acepta esta propuesta desde su espacio (' + new Date().toISOString().slice(0, 10) + ').' }] })
  });
  const rj = await r.json().catch(() => ({}));
  const fila = rj.data && rj.data[0];
  if (!r.ok || !fila || fila.status !== 'success') return { estat: 'error', accio, motiu: 'nota: ' + ((fila && fila.code) || rj.code || r.status) };
  return { estat: 'acceptat', accio };
}

const HTTP = { llegit: 200, prova: 200, creat: 200, acceptat: 200, dolenta: 400, tancat: 403, 'sense-config': 503, error: 502 };

export const handler = async (event) => {
  const origen = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const cap = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'Vary': 'Origin' };
  if (origenBo(origen)) Object.assign(cap, { 'Access-Control-Allow-Origin': origen, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cap, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cap, body: JSON.stringify({ estat: 'dolenta' }) };
  const r = await processa(event.body, process.env);
  /* Al registre, mai la clau ni el que es llegeix: només què ha passat. */
  console.log('[espai-partner]', JSON.stringify({ estat: r.estat, accio: r.accio, motiu: r.motiu }));
  /* A fora, cap motiu: «tancat» no diu si la clau no hi és o està repetida. */
  const sortida = { estat: r.estat };
  if (r.dades) sortida.dades = r.dades;
  return { statusCode: HTTP[r.estat] || 500, headers: cap, body: JSON.stringify(sortida) };
};
