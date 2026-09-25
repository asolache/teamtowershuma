/* El SOS, sense tornar a baixar-lo cada vegada
 * ─────────────────────────────────────────────────────────────────────────────
 * El SOS pesa 508 KB en gzip i fins ara **es baixava sencer a cada visita**. A
 * la xarxa d'un poble això són 10 segons amb 3G lent i 2,5 amb 3G normal, i
 * són 10 segons **cada cop**, no el primer dia.
 *
 * Aquest fitxer ho arregla i, de passada, canvia el sentit del sostre de pes:
 * mentre el fitxer es baixava sempre, cada KB era un KB de la tarifa de dades
 * de qui l'obre; amb la còpia local, el pes és una qüestió de claredat del codi
 * i no de la butxaca de ningú.
 *
 * ── L'estratègia, i per què aquesta ─────────────────────────────────────────
 * **Còpia primer, i refresc a sota** (*stale-while-revalidate*). Es serveix el
 * que hi ha guardat —instantani— i alhora es demana la versió nova per a la
 * pròxima vegada.
 *
 * Les dues alternatives es van descartar amb motiu:
 *
 * · **Xarxa primer** seria correcte però no resol res: online segueixes baixant
 *   508 KB cada visita, que és justament el problema.
 * · **Només còpia** et deixa amb una versió antiga per sempre si el refresc
 *   falla, i aquesta és una eina que canvia sovint.
 *
 * El preu de l'escollida és que **la primera càrrega després d'un canvi serveix
 * la versió anterior**. Per això, quan el refresc porta res de nou, s'avisa la
 * pestanya i la pàgina ho diu discretament. Un avís és honest; quedar-se
 * callat amb codi vell, no.
 *
 * ── El que aquest fitxer no fa, i no farà ───────────────────────────────────
 * **No toca cap dada.** El registre, les hores, les identitats i les claus
 * viuen a IndexedDB i al localStorage del navegador, i això és una còpia de
 * *fitxers*, no de dades. Si demà s'esborra aquesta memòria cau, no es perd res
 * de ningú: es tornen a baixar uns HTML.
 *
 * **No intercepta res que vagi a fora.** L'API d'Anthropic, els relés i les
 * fonts de Google passen de llarg: una resposta d'IA guardada i servida més
 * tard seria una resposta a una pregunta que ja no es va fer.
 */
const CAU = 'sos-v1';

/* Només el que és nostre i és estàtic. Es demana de fons en instal·lar perquè
   la segona pàgina que obri algú ja hi sigui, i si alguna falla no es cancel·la
   la instal·lació: una pàgina que encara no existeix no ha de deixar l'app
   sense memòria cau. */
const PORTA = [
  './', './index.html', './vna.html', './matriu.html', './diagnostic.html',
  './banc-temps.html', './biblioteca.html', './compra.html', './energia.html',
  './habitatge.html', './formacio.html', './intro.html', './molekulandia.html'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CAU).then(c => Promise.allSettled(PORTA.map(u => c.add(u)))));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const noms = await caches.keys();
    await Promise.all(noms.filter(n => n !== CAU).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

/* Avisar les pestanyes obertes que el que tenen a la pantalla ja no és
   l'última versió. La pàgina decideix què en fa; aquí només es diu. */
async function avisa() {
  const cl = await self.clients.matchAll({ type: 'window' });
  cl.forEach(c => c.postMessage({ sos: 'versio-nova' }));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Res que no sigui d'aquest origen. L'API d'IA i els relés, sobretot.
  if (url.origin !== self.location.origin) return;
  // Només documents i coses estàtiques nostres.
  if (!/\.(html|js|css|svg|png|webmanifest)$/.test(url.pathname) && !url.pathname.endsWith('/')) return;

  e.respondWith((async () => {
    const cau = await caches.open(CAU);
    const guardat = await cau.match(req, { ignoreSearch: true });

    const refresc = fetch(req).then(async res => {
      if (res && res.ok) {
        /* Es compara el que arriba amb el que hi havia. Només s'avisa si de
           debò ha canviat: un avís a cada visita seria soroll i deixaria
           d'avisar de res. */
        const nou = res.clone();
        if (guardat) {
          const [a, b] = await Promise.all([guardat.clone().text(), nou.clone().text()]);
          if (a !== b) avisa();
        }
        await cau.put(req, nou);
      }
      return res;
    }).catch(() => null);

    if (guardat) { e.waitUntil(refresc); return guardat; }
    const xarxa = await refresc;
    if (xarxa) return xarxa;
    // Sense còpia i sense xarxa. Es diu el que passa en comptes d'un error del navegador.
    return new Response(
      '<!doctype html><meta charset="utf-8"><title>Sense connexió</title>' +
      '<body style="font-family:system-ui;background:#0a0a0f;color:#f5f5f7;padding:2rem;line-height:1.6">' +
      '<h1 style="font-size:1.2rem">Sense connexió</h1>' +
      '<p style="color:#9a9aa6;font-size:.9rem">Aquesta pàgina encara no s\'havia obert mai en aquest aparell, ' +
      'i per això no n\'hi ha còpia. Les que ja has obert segueixen funcionant sense cobertura.</p></body>',
      { headers: { 'content-type': 'text/html; charset=utf-8' }, status: 503 });
  })());
});
