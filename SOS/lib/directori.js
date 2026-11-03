/* El directori de TeamTowers /online, llegit des de l'app
 * ─────────────────────────────────────────────────────────────────────────────
 * Qui ja té fitxa a /online (SOS/online.html) i entra a l'app en un altre
 * aparell porta la seva identitat (el fitxer sos-identitat-…) i, amb el seu
 * did, l'app li llegeix la fitxa per omplir-li el perfil. Només llegeix: la
 * fitxa la publica i la signa la persona a /online.
 *
 * La clau és publicable per disseny (vegeu online.html i
 * SOS/sql/001_online_fitxes.sql). `check-online.js` comprova que URL, clau i
 * taula són les mateixes que a online.html, perquè no se separin mai.
 *
 *   Directori.fitxaDe(did) → Promise<{nom, nick, municipi, pais, ofereix, busca} | null>
 */
(function (arrel) {
  var URL = 'https://grkgrceioxktmbwdhvmm.supabase.co';
  var KEY = 'sb_publishable_xsEfyOqJ5tJwaxcoH_CiNg_SlsqDZb1';
  var TAULA = 'online_fitxes';
  function fitxaDe(did) {
    if (!did) return Promise.resolve(null);
    var u = URL + '/rest/v1/' + TAULA + '?select=fitxa,creat&did=eq.' + encodeURIComponent(did) + '&order=creat.desc&limit=5';
    return fetch(u, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } })
      .then(function (r) { if (!r.ok) throw new Error('El directori no respon (' + r.status + ')'); return r.json(); })
      .then(function (files) {
        /* La més nova que sigui d'aquest did; una retirada vol dir que no n'hi ha. */
        var f = (files || []).map(function (x) { return x && x.fitxa; }).filter(function (x) { return x && x.did === did; })[0];
        if (!f || f.retirada) return null;
        return { nom: f.nom || '', nick: f.nick || '', municipi: f.municipi || '', pais: f.pais || '',
          ofereix: Array.isArray(f.ofereix) ? f.ofereix : [], busca: Array.isArray(f.busca) ? f.busca : [] };
      });
  }
  arrel.Directori = { URL: URL, KEY: KEY, TAULA: TAULA, fitxaDe: fitxaDe };
  if (typeof module !== 'undefined' && module.exports) module.exports = arrel.Directori;
})(typeof window !== 'undefined' ? window : globalThis);
