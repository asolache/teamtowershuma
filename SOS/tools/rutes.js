/* On va una adreça interna · la mateixa resposta per a totes les guardes
 * ─────────────────────────────────────────────────────────────────────────
 * El 04/10/2026 la barra única va passar a **rutes absolutes** (`/SOS/vna.html`,
 * `/cataleg.html`, `/SOS/`), perquè el mateix marcatge ha de valer a l'arrel i
 * a `/SOS/` i abans eren dos blocs de codi amb dos modes de ruta.
 *
 * Tres guardes resolien els `href` **relatius al fitxer** i prou
 * —`check-comuns.js`, `check-comando.js`, `check-ia.js`—, i amb la barra nova
 * van declarar morts vint-i-sis destins que existeixen tots. Tres còpies d'un
 * resolutor de rutes que s'han de posar d'acord és exactament el que aquesta
 * casa no deixa duplicar: es declara aquí i se'n fa `require`.
 *
 * Les tres formes que hi ha al lloc, i cap més:
 *   /SOS/vna.html   absoluta · des de la raíz del lloc
 *   /SOS/           absoluta · una carpeta és el seu `index.html`
 *   ../index.html   relativa · un nivell amunt, des de `SOS/`
 *   vna.html        relativa · al costat del fitxer que l'escriu
 */
const { existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');

/* El fitxer al disc que serveix una adreça, o `null` si no és interna.
   `base` és la carpeta del fitxer que porta l'enllaç. */
function fitxerDe(href, base) {
  if (/^(https?:|mailto:|tel:|data:|#)/.test(href)) return null;
  const net = href.split('#')[0].split('?')[0];
  if (!net) return null;
  /* Una adreça que acaba en `/` és l'`index.html` d'aquella carpeta. Sense
     això, `/SOS/` —que és el destí de l'acció de la barra a 27 pàgines— es
     comprova com un fitxer i surt mort. */
  const amb = net.replace(/\/$/, '/index.html');
  return amb.startsWith('/') ? join(ARREL, amb.slice(1)) : join(base, amb);
}

/* Les adreces internes d'un text que no porten a cap fitxer. */
function morts(text, base) {
  const tots = [...new Set([...text.matchAll(/href="([^"]+)"/g)].map(m => m[1]))];
  return tots.filter(h => { const f = fitxerDe(h, base); return f && !existsSync(f); });
}

/* I quantes n'hi havia d'internes, per poder dir «les N existeixen totes». */
const internes = text => [...new Set([...text.matchAll(/href="([^"]+)"/g)].map(m => m[1]))]
  .filter(h => fitxerDe(h, ARREL) !== null);

module.exports = { ARREL, fitxerDe, morts, internes };
