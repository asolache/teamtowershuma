/* «Leemos tu web» · /cliente/, amb el sí del client
   ─────────────────────────────────────────────────────────────────────────
   Backlog del 23/10/2026, punt 12: el client escriu la seva adreça, marca que
   és seva i que ens deixa llegir-la, i en traiem la «foto d'abans» (el format
   `sos-foto-web` v1 acordat amb «Revisión UX de SOS», que llegeix el
   generador per replicar la web sense perdre Google): cada pàgina amb el seu
   títol, la descripció, el H1, el text i el lloc al menú.

   · `POST …/llegeix-web-background` {sessio, web, si:true, llengua}. És una
     funció de fons (Netlify torna 202 de seguida): llegir amb educació porta
     temps. El resultat va al magatzem `fitxes` sota l'empremta de qui ha entrat
     (`foto/<empremta>`), i la pàgina el llegeix amb fitxa.mjs {sessio, foto:true}.

   El que no es negocia:
   · **Identificat i amb el seu sí**, desat amb la data: sense, no es llegeix res.
   · **Només aquell lloc**, amb el rastrejador de l'importador (SOS/lib/importa.js,
     el bloc VS-IMPORTA): robots.txt, una petició cada cop amb pausa, i com a
     molt MAX_PAGINES pàgines. Res d'adreces internes: ni IP, ni noms locals, ni
     un nom que resolgui a una xarxa privada.
   · **Cap dada personal**: correus i telèfons del text s'amaguen (amagaPersonal).
   · Com a molt LECTURES_DIA lectures per persona i dia. */
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { secret, llegeix, empremta } from '../lib/signatura.mjs';
import { magatzem } from '../lib/magatzem.mjs';
import IMP from '../../SOS/lib/importa.js';

const net = v => (v == null ? '' : String(v)).trim();
export const MAX_PAGINES = 12, LECTURES_DIA = 3;
export const clau = id => 'foto/' + empremta(id);

/* ─── On es pot anar ─── */
export function hostBo(h) {
  const x = net(h).toLowerCase().replace(/\.$/, '');
  return !!x && x.includes('.') && !isIP(x.replace(/^\[|\]$/g, '')) && !/(^|\.)(localhost|local|internal|intranet|lan|home|corp|arpa|test|invalid)$/.test(x);
}
export const privada = a => /^(0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|22[4-9]\.|2[3-5]\d\.)/.test(a)
  || /^(::1?$|f[cd]|fe[89ab]|ff|::ffff:)/i.test(a);
const resol = h => lookup(h, { all: true }).then(l => l.map(x => x.address));
/* El `fetch` que rep el rastrejador: abans de cada petició (també les redireccions), mira on va. */
export const segur = (fetchFn, resolFn = resol) => async (url, opts) => {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol) || !hostBo(u.hostname) || (u.port && !['80', '443'].includes(u.port))) throw new Error('adreça no permesa');
  const ad = await resolFn(u.hostname);
  if (!ad.length || ad.some(privada)) throw new Error('adreça no permesa');
  return fetchFn(url, opts);
};
export function web(v) {
  try { const u = new URL(/^https?:\/\//i.test(net(v)) ? net(v) : 'https://' + net(v)); return /^https?:$/.test(u.protocol) && hostBo(u.hostname) ? u : null; } catch (e) { return null; }
}

/* ─── La foto d'abans (sos-foto-web v1) ─── */
/* El menú: els enllaços del primer <nav> (o de la capçalera) de la portada, en ordre. */
export function menuDe(html, base) {
  const h = String(html || ''), b = (/<nav\b[\s\S]*?<\/nav>/i.exec(h) || /<header\b[\s\S]*?<\/header>/i.exec(h) || [''])[0], vist = [];
  (b.match(/<a\b[^>]*\bhref\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi) || []).forEach(a => {
    const v = a.replace(/^[\s\S]*?\bhref\s*=\s*/i, '').replace(/^["']|["']$/g, '');
    try { const u = new URL(v, base); if (u.hostname.replace(/^www\./, '') !== new URL(base).hostname.replace(/^www\./, '')) return; const r = ruta(u); if (!vist.includes(r)) vist.push(r); } catch (e) { /* enllaç trencat */ }
  });
  return vist;
}
const ruta = u => (u.pathname.replace(/\/+$/, '') || '/') + u.search;
/* Les adreces del lloc que no s'han llegit (robots, error, tope), com a rutes: el
   generador les porta a la portada amb un 301 perquè Google no les perdi. */
export function foraDe(res, origen) {
  const h = origen.hostname.replace(/^www\./, ''), llegides = (res.pagines || []).map(p => { try { return ruta(new URL(p.url)); } catch (e) { return ''; } }), v = [];
  (res.fora || []).forEach(f => {
    try { const u = new URL(f.font, origen); const r = ruta(u); if (/^https?:$/.test(u.protocol) && u.hostname.replace(/^www\./, '') === h && !llegides.includes(r) && !v.includes(r)) v.push(r); } catch (e) { /* no és una adreça */ }
  });
  return v.slice(0, 50);
}
export function foto(res, origen, ara = new Date()) {
  const ps = res.pagines || [], menu = ps.length ? menuDe(ps[0].html, ps[0].url) : [];
  return { tipus: 'sos-foto-web', v: 1, origen: origen.origin, data: ara.toISOString().slice(0, 10),
    pagines: ps.map(p => {
      const h = IMP.htmlAText(p.html, p.url), u = new URL(p.url), r = ruta(u), t = IMP.amagaPersonal(h.text || '').text;
      const h1 = (/^# (.+)$/m.exec(t) || [])[1] || '';
      return { url: r, titol: net(h.titol).slice(0, 200), descripcio: net(h.descripcio).slice(0, 400), h1: net(h1).slice(0, 200),
        text: t.slice(0, 6000), menu: menu.indexOf(r) >= 0 ? menu.indexOf(r) : null,
        /* Opcional (no trenca la v1): les imatges, com a referència per a la sessió. */
        imatges: (h.imatges || []).slice(0, 8).map(i => ({ src: net(i.src).slice(0, 400), alt: net(i.alt).slice(0, 160) })),
        /* Opcional: l'idioma de la pàgina (el seu lang), perquè el document de disseny no barregi idiomes. */
        llengua: net(h.llengua).toLowerCase().slice(0, 8) };
    }),
    llengua: net(ps.length ? IMP.htmlAText(ps[0].html, ps[0].url).llengua : '').slice(0, 8), fora: foraDe(res, origen) };
}

export async function llegeixWeb(cos, env, reg, fetchFn = globalThis.fetch, ara = new Date(), resolFn) {
  const qui = llegeix(cos && cos.sessio, secret(env), ara.getTime());
  if (!qui || !qui.id) return { estat: 'identifica' };
  if (!reg) return { estat: 'sense-config' };
  if (cos.si !== true) return { estat: 'error', motiu: 'Sin tu permiso no leemos nada.' };
  const k = clau(qui.id), abans = (await reg.get(k)) || {}, dia = ara.toISOString().slice(0, 10);
  /* Un «no» también se desa (sense tocar la lectura d'abans): la pàgina, que espera, el veu. */
  const no = async motiu => { await reg.set(k, Object.assign({}, abans, { rebuig: { motiu, data: ara.toISOString() } })); return { estat: 'error', motiu }; };
  const u = web(cos.web);
  if (!u) return no('Esa dirección no parece una web.');
  if (abans.estat === 'llegint' && ara - new Date(abans.inici) < 20 * 60e3) return { estat: 'llegint' };
  const n = abans.dia === dia ? abans.n || 0 : 0;
  if (n >= LECTURES_DIA) return no('Hoy ya hemos leído tu web varias veces. Mañana, otra.');
  /* El sí, amb la data i el lloc: és el que diu que la podíem llegir. */
  const si = { data: ara.toISOString(), via: qui.via || '', domini: u.hostname.replace(/^www\./, '') };
  await reg.set(k, { estat: 'llegint', inici: ara.toISOString(), origen: u.origin, si, dia, n: n + 1 });
  let r;
  try {
    const res = await IMP.rastreja(u.href, { fetch: segur(fetchFn, resolFn), autoritzat: si.domini, max: MAX_PAGINES, espera: cos.espera, dormir: cos.dormir,
      llengua: cos.llengua === 'ca' ? 'ca' : 'es', agent: 'TeamTowers-cliente/1 (+https://teamtowershuma.com/cliente/)' });
    const f = foto(res, u, ara);
    r = f.pagines.length ? { estat: 'fet', foto: f } : { estat: 'error', motiu: 'No hemos podido leer ninguna página de tu web.' };
  } catch (e) { console.log('[llegeix-web] error', String((e && e.message) || e).slice(0, 200)); r = { estat: 'error', motiu: 'No hemos podido leer tu web ahora.' }; }
  await reg.set(k, Object.assign({ origen: u.origin, si, dia, n: n + 1, acabada: new Date().toISOString() }, r));
  return { estat: r.estat, pagines: r.foto ? r.foto.pagines.length : 0 };
}

export const handler = async (event) => {
  let cos = {}; try { cos = JSON.parse(event.body || '{}'); } catch (e) { /* cos buit */ }
  /* Les pauses i els temps són els de debò: el client no els tria. */
  delete cos.espera; delete cos.dormir;
  const r = await llegeixWeb(cos, process.env, magatzem(event, 'fitxes')).catch(() => ({ estat: 'error' }));
  console.log('[llegeix-web]', JSON.stringify({ estat: r.estat, pagines: r.pagines }));
  return { statusCode: 202, body: '' };
};
