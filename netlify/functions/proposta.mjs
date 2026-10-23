/* La teva proposta · el preu, només per a qui l'ha de veure · /cliente/
   ─────────────────────────────────────────────────────────────────────────
   L'Àlvar (22/10/2026): «todo sin precios» a la web pública. Les tarifes de
   formació i mentoria (els tres nivells) no es publiquen: cada client veu el
   seu preu al seu espai, quan s'ha identificat (identitat.mjs), com el pack de
   la María. El repositori és públic, així que el preu no hi és mai: viu a
   Netlify Blobs (magatzem `propostes`), sota l'empremta de la persona.

   · `POST …/proposta` {sessio}         la proposta de qui ha entrat, o cap.
   · `PUT  …/proposta?per=<correu|gh:id>` amb `Authorization: Bearer
     IA_CIERRE_TOKEN` (el testimoni de gestió, el mateix del tancament) i la
     proposta al cos. La carrega el repositori d'estratègia o l'Àlvar:
       curl -X PUT 'https://teamtowershuma.com/.netlify/functions/proposta?per=maria@exemple.cat' \
         -H 'Authorization: Bearer …' -H 'Content-Type: application/json' \
         -d '{"titol":"Mapa de valor + web","linies":[{"que":"Sessió de mapa","nivell":3,"hores":1,"import":80}],"total":950}'
   · `DELETE …/proposta?per=…` amb el mateix testimoni, l'esborra.
   Sense el testimoni (o curt), 404, com si no hi fos.

   Al registre (console) només l'estat, mai el preu ni qui és. */
import { secret, llegeix, empremta } from '../lib/signatura.mjs';
import { magatzem } from '../lib/magatzem.mjs';

const net = v => (v == null ? '' : String(v)).trim();
const json = (statusCode, o) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(o) });
const xifra = v => { const n = Number(v); return isFinite(n) && n >= 0 && n < 1e6 ? Math.round(n * 100) / 100 : null; };

/* La mateixa identitat que fa servir identitat.mjs: `mail:<empremta>` o `gh:<id>`. */
export function idDe(per) {
  const p = net(per).toLowerCase();
  if (/^gh:\d{1,12}$/.test(p)) return p;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p)) return 'mail:' + empremta(p);
  return null;
}
export const clau = id => 'proposta/' + empremta(id);

/* Només el que es pot ensenyar, net i tallat. */
export function neteja(p, ara = new Date()) {
  if (!p || typeof p !== 'object') return null;
  const linies = (Array.isArray(p.linies) ? p.linies : []).slice(0, 30).map(l => ({
    que: net(l && l.que).slice(0, 160),
    nivell: [1, 2, 3].includes(Number(l && l.nivell)) ? Number(l.nivell) : null,
    hores: xifra(l && l.hores),
    import: xifra(l && l.import)
  })).filter(l => l.que);
  const total = xifra(p.total);
  if (!linies.length && total == null) return null;
  return {
    titol: net(p.titol).slice(0, 120) || 'Tu propuesta',
    linies,
    total: total != null ? total : +linies.reduce((s, l) => s + (l.import || 0), 0).toFixed(2),
    iva: p.iva === true,
    nota: net(p.nota).slice(0, 600),
    valida: /^\d{4}-\d{2}-\d{2}$/.test(net(p.valida)) ? net(p.valida) : '',
    actualitzada: ara.toISOString().slice(0, 10)
  };
}

export async function veure(cos, env, reg, ara = Date.now()) {
  const qui = llegeix(cos && cos.sessio, secret(env), ara);
  if (!qui || !qui.id) return { estat: 'identifica' };
  if (!reg) return { estat: 'sense-config' };
  const p = await reg.get(clau(qui.id));
  return p ? { estat: 'fet', proposta: p } : { estat: 'cap' };
}

export async function gestiona(metode, per, autoritzacio, cos, env, reg, ara = new Date()) {
  const tok = net(env.IA_CIERRE_TOKEN);
  if (tok.length < 24 || !reg || autoritzacio !== 'Bearer ' + tok) return null;
  const id = idDe(per);
  if (!id) return { estat: 'error', motiu: 'per=<correu|gh:id>' };
  if (metode === 'DELETE') { await reg.del(clau(id)); return { estat: 'esborrada' }; }
  const p = neteja(cos, ara);
  if (!p) return { estat: 'error', motiu: 'Falten les línies o el total.' };
  await reg.set(clau(id), p);
  return { estat: 'desada', proposta: p };
}

export const handler = async (event) => {
  const env = process.env, q = event.queryStringParameters || {}, reg = magatzem(event, 'propostes');
  let cos = {}; try { cos = JSON.parse(event.body || '{}'); } catch (e) { /* cos buit */ }
  let r;
  if (event.httpMethod === 'PUT' || event.httpMethod === 'DELETE') {
    r = await gestiona(event.httpMethod, q.per, (event.headers || {}).authorization, cos, env, reg).catch(() => ({ estat: 'error', motiu: 'blobs' }));
    console.log('[proposta]', JSON.stringify({ metode: event.httpMethod, estat: r ? r.estat : 'no' }));
    return r ? json(r.estat === 'error' ? 400 : 200, r) : json(404, {});
  }
  if (event.httpMethod !== 'POST') return json(405, { estat: 'error' });
  r = await veure(cos, env, reg).catch(() => ({ estat: 'error' }));
  console.log('[proposta]', JSON.stringify({ metode: 'POST', estat: r.estat }));
  return json({ identifica: 401, 'sense-config': 503, error: 500 }[r.estat] || 200, r);
};
