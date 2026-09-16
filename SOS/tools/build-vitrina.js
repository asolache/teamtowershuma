#!/usr/bin/env node
/* La vitrina · una portada que ensenya què en surt
 * ─────────────────────────────────────────────────────────────────────────────
 * La portada d'avui explica **com treballem**: el repte, el mètode, els quatre
 * passos, el catàleg amb el seu preu i d'on surt cada xifra. Està bé i no es
 * toca — però respon una pregunta que qui arriba encara no s'ha fet.
 *
 * La primera pregunta és més tonta i més important: **què és, exactament, el
 * que em donareu?** I això la portada actual només ho diu amb paraules.
 *
 * Aquesta pàgina ho ensenya. La regla que l'ordena tota és una:
 *
 *     Cap eina es presenta pel que és. Cada eina es presenta per
 *     **què hi entra** i **què en surt**, i el que en surt té nom d'objecte.
 *
 * «Un banc de temps és una xarxa d'intercanvi de serveis» no ven res: ho pot
 * dir qualsevol i no es pot comprovar. «En surt el saldo de cadascú i la
 * distància mitjana al zero, que és la xifra que diu si el banc està sa» és una
 * cosa que existeix, que es pot mirar, i que ningú més t'està oferint.
 *
 * ── L'ordre, i per què ──────────────────────────────────────────────────────
 * No és l'ordre del catàleg ni l'alfabètic: és **l'ordre en què un projecte
 * necessita les coses**.
 *
 *   1. `actius`     — el que la comunitat **ja té** i no sap que té: hores i
 *                     objectes. Són les dues dinàmiques per on comença tothom,
 *                     i les que necessiten menys permís per arrencar.
 *   2. `fluxos`     — el que **ja es mou**: compra, energia, sostre. Aquí ja hi
 *                     ha diners i calen acords.
 *   3. `estructura` — quan ja hi ha projecte i cal saber **qui sosté què**: el
 *                     mapa de valor i la MATRIU.
 *   4. `gent`       — el que fa que algú hi entri i es quedi. No calcula res, i
 *                     per això es presenta diferent: sense entrada ni sortida.
 *
 * ── Per què generat ─────────────────────────────────────────────────────────
 * Cada fitxa apunta a una pàgina del SOS. Una portada escrita a mà amb dotze
 * enllaços és una portada amb dotze enllaços que un dia deixaran d'existir, i
 * un enllaç mort a la pàgina d'entrada és el pitjor lloc possible per tenir-lo.
 * La guarda comprova que **tota pàgina citada existeixi** i que **cada capa
 * tingui alguna cosa a dins**.
 *
 * ── Estat ───────────────────────────────────────────────────────────────────
 * **És una proposta.** Encara no substitueix res, no és al menú i és només en
 * català: traduir-la abans que el contingut estigui tancat seria fer dues
 * vegades una feina que encara ha de canviar.
 *
 *   node SOS/tools/build-vitrina.js            escriu home-nova.html
 *   node SOS/tools/build-vitrina.js --check    falla si està vella
 */
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const SOS = join(ARREL, 'SOS');
const CHECK = process.argv.includes('--check');

/* ══ ELS DOS MAPES ═══════════════════════════════════════════════════════════
   El mapa de valor és la peça central i té dues cares que la portada actual no
   distingeix: **dins d'una organització** i **damunt d'un territori**. És el
   mateix mètode i no és el mateix encàrrec —ni el mateix comprador, ni el
   mateix entregable—, i qui arriba ha de saber de seguida quin dels dos és el
   seu. Per això són el primer que es veu, un al costat de l'altre. */
const MAPES = [
  { id: 'org', ic: '🏢', nom: 'El mapa de valor d\'una organització',
    qui: 'Empresa, cooperativa, consell rector, equip de govern',
    q: 'Qui dona què a qui dins de casa. No l\'organigrama: el que passa de debò quan algú necessita una cosa i va a buscar-la.',
    surt: ['Els rols reals, no els del paper',
      'El que es factura i el que sosté sense facturar-se',
      'On tot depèn d\'una sola persona'],
    on: 'SOS/vna.html' },
  { id: 'terr', ic: '🗺', nom: 'El mapa de valor d\'un territori',
    qui: 'Ajuntament, consell comarcal, ateneu, xarxa d\'entitats',
    q: 'Qui sosté el teixit d\'un poble o d\'una comarca, i per on es trenca. Entitats, administració, empreses i veïnat al mateix full.',
    surt: ['Els actors i els seus intercanvis',
      'Els nodes fràgils, dits pel seu nom',
      'Un pla amb qui fa què i quan'],
    on: 'SOS/vna.html' }
];

/* ══ LES EINES ═══════════════════════════════════════════════════════════════
   `entra` i `surt` són el cor d'aquesta pàgina, i no són sinònims del que fa
   l'eina: `entra` és **el que has de posar-hi tu** i `surt` és **l'objecte que
   te'n endús**. Si una fitxa no pot omplir les dues coses, no és una eina: és
   una intenció, i va a la capa `gent`. */
const EINES = [
  { capa: 'actius', ic: '⏳', nom: 'El Banc de Temps', pag: 'SOS/banc-temps.html',
    entra: 'Les hores que la gent ja es dona',
    unitat: 'hores',
    regla: 'Una hora val una hora',
    surt: ['El saldo de cada persona',
      'La distància mitjana al zero — la xifra que diu si el banc està sa',
      'Qui el sosté, i qui no ha tornat mai res'] },
  { capa: 'actius', ic: '🧰', nom: 'La Biblioteca de les Coses', pag: 'SOS/biblioteca.html',
    entra: 'Els objectes que ja són als tràsters',
    unitat: 'objectes',
    regla: 'L\'accés val més que la propietat',
    surt: ['El valor de cada préstec, amb el seu desgast',
      'El patrimoni comú, comptat',
      'El valor d\'accés — i el que **no** demostra'] },

  { capa: 'fluxos', ic: '🥬', nom: 'La Compra', pag: 'SOS/compra.html',
    entra: 'El que cada llar necessita',
    unitat: 'comandes',
    regla: 'Agregar demanda canvia el preu',
    surt: ['La comanda tancada, a punt d\'enviar',
      'El compte de cada llar',
      'L\'estalvi, mesurat i no estimat'] },
  { capa: 'fluxos', ic: '⚡', nom: 'L\'Energia', pag: 'SOS/energia.html',
    entra: 'El consum i el sostre disponible',
    unitat: 'kWh',
    regla: 'L\'excedent d\'un és l\'estalvi d\'un altre',
    surt: ['Els coeficients de repartiment',
      'El que estalvia cada soci, al mes',
      'Quan es paga la instal·lació'] },
  { capa: 'fluxos', ic: '🏘', nom: 'L\'Habitatge', pag: 'SOS/habitatge.html',
    entra: 'El cost de l\'edifici i les unitats',
    unitat: 'quotes',
    regla: 'Cessió d\'ús: s\'hi viu, no s\'especula',
    surt: ['La quota d\'ús mensual',
      'L\'entrada, i què se n\'endú qui marxa',
      'El fons de reserva que cal'] },

  { capa: 'estructura', ic: '🕸', nom: 'El mapa de valor', pag: 'SOS/vna.html',
    entra: 'Qui hi és i què es dona',
    unitat: 'rols i intercanvis',
    regla: 'El que no es veu decideix si allò aguanta',
    surt: ['El graf sencer, tangible i intangible',
      'Els rols sobrecarregats',
      'El que caldria per no dependre de ningú'] },
  { capa: 'estructura', ic: '🌱', nom: 'La MATRIU', pag: 'SOS/matriu.html',
    entra: 'Idees que encara no són projecte',
    unitat: 'ventures',
    regla: 'Una porta no es passa per antiguitat',
    surt: ['Etapes i portes, amb la seva evidència',
      'Qui té què: la propietat repartida',
      'Quan una venture es gradua — o es tanca'] }
];

/* La capa `gent`. Aquestes no calculen res i seria mentida posar-hi una
   sortida: el que donen és **un motiu per entrar-hi**, que no és un objecte.
   Es pinten diferent a posta. */
const GENT = [
  { ic: '🏘', nom: 'Molekulandia', pag: 'SOS/molekulandia.html',
    q: 'El poble sencer en una pantalla: onze edificis on entrar i nou professions. El bar és el banc de temps i la ferreteria, la biblioteca.' },
  { ic: '🎬', nom: 'El Comando Molekulon', pag: 'SOS/comando.html',
    q: 'Un còmic, una banda i una pel·lícula que farem 150.000 persones. El teu personatge és el que ja fas, i els crèdits són el registre.' },
  { ic: '🎓', nom: 'La Fàbrica de Superherois', pag: 'SOS/escola.html',
    q: 'El mateix relat, de 6 a 13 anys. Cap nom real surt de l\'aula.' },
  { ic: '🌐', nom: 'El directori', pag: 'SOS/online.html',
    q: 'Qui hi ha al territori, per municipi, amb cada fitxa signada per qui la publica.' },
  { ic: '📚', nom: 'La formació', pag: 'SOS/formacio.html',
    q: 'Setze mòduls de N0 a N3, per si el que voleu és portar-ho vosaltres.' },
  { ic: '🤖', nom: 'Fluxos amb IA', pag: 'SOS/ia.html',
    q: 'Automatitzar el tangible i valorar l\'intangible. L\'IA proposa; res entra sense que una persona ho comprovi.' }
];

const CAPES = [
  { id: 'actius', n: '01', t: 'Primer: el que ja teniu i no compta',
    d: 'Abans de demanar res a ningú, hi ha dues coses que un barri o una plantilla <strong>ja tenen</strong> i que no surten a cap balanç: <strong>hores</strong> i <strong>objectes</strong>. Mapejar-les és el començament més barat que existeix, i el que dona la primera xifra defensable.' },
  { id: 'fluxos', n: '02', t: 'Després: el que ja es mou',
    d: 'Compra, energia i sostre. Aquí ja hi ha diners pel mig, i per tant calen acords escrits. El que aporta l\'eina no és la idea —la idea ja la teniu— sinó <strong>el número que fa que l\'acord es pugui signar</strong>.' },
  { id: 'estructura', n: '03', t: 'Quan ja hi ha projecte: qui sosté què',
    d: 'És el moment en què un projecte es trenca sense avisar. Les dues eines d\'aquesta capa serveixen per veure-ho abans: <strong>el mapa</strong> diu de qui depèn tot, i <strong>la MATRIU</strong> diu qui té què i quan es passa de fase.' }
];

/* ══ LECTURA I COMPROVACIONS ═════════════════════════════════════════════════ */
let fails = 0;
const bad = m => { fails++; console.log('  ✗ ' + m); };

const totes = MAPES.concat(EINES, GENT);
totes.forEach(x => {
  const f = (x.on || x.pag).split('#')[0];
  if (!existsSync(join(ARREL, f))) bad(`«${x.nom}» apunta a ${f}, que no existeix`);
});
CAPES.forEach(c => {
  if (!EINES.some(e => e.capa === c.id)) bad(`la capa «${c.t}» no té cap eina a dins: seria un titular sobre un buit`);
});
EINES.forEach(e => {
  if (!CAPES.some(c => c.id === e.capa)) bad(`l'eina «${e.nom}» és de la capa «${e.capa}», que no està declarada`);
  /* Una fitxa amb entrada i sense sortida seria exactament el que aquesta
     pàgina ve a evitar: presentar una eina pel que és i no pel que en surt. */
  if (!e.entra || !e.surt || e.surt.length < 2)
    bad(`l'eina «${e.nom}» no diu què hi entra i què en surt: si no ho pot dir, va a la capa de gent`);
});
if (fails) { console.log(`\n❌ ${fails} ${fails === 1 ? 'problema' : 'problemes'} a la declaració de la vitrina.`); process.exit(1); }

/* ══ EL MARCATGE ═════════════════════════════════════════════════════════════ */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* Els asteriscs de `surt` són èmfasi, no marcatge: es converteixen aquí perquè
   la declaració es pugui llegir com un text i no com HTML. */
const neg = s => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

const htmlMapes = () => MAPES.map(m => `
      <article class="mapa" id="mapa-${m.id}">
        <div class="mapa-viz">${m.id === 'org' ? VIZ_ORG : VIZ_TERR}</div>
        <div class="mapa-cos">
          <div class="mapa-qui">${esc(m.qui)}</div>
          <h3>${m.ic} ${esc(m.nom)}</h3>
          <p class="mapa-q">${esc(m.q)}</p>
          <div class="surt-lbl">Què t'endús</div>
          <ul class="surt">${m.surt.map(s => `<li>${neg(s)}</li>`).join('')}</ul>
          <a class="mapa-go" href="${m.on}">Veure com es fa →</a>
        </div>
      </article>`).join('\n');

const htmlEina = e => `
        <article class="eina">
          <div class="eina-cap"><span class="eina-ic">${e.ic}</span>
            <h4>${esc(e.nom)}</h4>
            <div class="eina-regla">${esc(e.regla)}</div>
          </div>
          <div class="flux">
            <div class="flux-in">
              <div class="flux-lbl">Hi poses</div>
              <div class="flux-txt">${esc(e.entra)}</div>
              <div class="flux-unit">${esc(e.unitat)}</div>
            </div>
            <div class="flux-fl" aria-hidden="true">→</div>
            <div class="flux-out">
              <div class="flux-lbl">En surt</div>
              <ul class="surt">${e.surt.map(s => `<li>${neg(s)}</li>`).join('')}</ul>
            </div>
          </div>
          <a class="eina-go" href="${e.pag}">Obre-la →</a>
        </article>`;

const htmlCapes = () => CAPES.map(c => `
      <section class="capa" id="capa-${c.id}">
        <div class="capa-cap">
          <div class="capa-n">${c.n}</div>
          <div>
            <h3>${esc(c.t)}</h3>
            <p>${c.d}</p>
          </div>
        </div>
        <div class="eines">${EINES.filter(e => e.capa === c.id).map(htmlEina).join('')}
        </div>
      </section>`).join('\n');

const htmlGent = () => GENT.map(g => `
        <a class="gent-c" href="${g.pag}">
          <span class="gent-ic">${g.ic}</span>
          <span class="gent-n">${esc(g.nom)}</span>
          <span class="gent-q">${esc(g.q)}</span>
        </a>`).join('');

/* La taula final. És la mateixa informació que les fitxes, i hi és a posta:
   qui ha baixat fins aquí ja no vol descobrir res, vol comparar. Una graella
   densa es llegeix en deu segons i una pantalla de targetes, no. */
const htmlTaula = () => `
        <table class="resum">
          <thead><tr><th>Eina</th><th>Hi poses</th><th>En surt</th></tr></thead>
          <tbody>
${EINES.map(e => `            <tr><td><a href="${e.pag}">${e.ic} ${esc(e.nom)}</a></td>` +
    `<td class="r-in">${esc(e.entra)}</td>` +
    `<td class="r-out">${e.surt.map(s => neg(s)).join(' · ')}</td></tr>`).join('\n')}
          </tbody>
        </table>`;

/* ══ ELS DOS DIBUIXOS ════════════════════════════════════════════════════════
   Dins d'una organització els nodes són rols i el graf és dens i tancat; en un
   territori són cases senceres i el graf és obert i amb forats. Dibuixar-los
   diferents no és decoració: és **la diferència entre els dos encàrrecs**, i
   es veu abans de llegir res. */
const VIZ_ORG = `<svg viewBox="0 0 260 170" role="img" aria-label="Graf dens de rols dins d'una organització">
            <g fill="none" stroke="#6366f1" stroke-opacity=".45" stroke-width="1.2">
              <path d="M130,30 L60,80"/><path d="M130,30 L200,80"/><path d="M60,80 L200,80"/>
              <path d="M60,80 L95,135"/><path d="M200,80 L165,135"/><path d="M95,135 L165,135"/>
              <path d="M130,30 L95,135"/><path d="M130,30 L165,135"/>
            </g>
            <g fill="none" stroke="#ff9100" stroke-opacity=".5" stroke-width="1" stroke-dasharray="3 4">
              <path d="M60,80 L165,135"/><path d="M200,80 L95,135"/>
            </g>
            <g fill="#0a0a0f" stroke="#6366f1" stroke-width="1.6">
              <circle cx="130" cy="30" r="13"/><circle cx="60" cy="80" r="13"/>
              <circle cx="200" cy="80" r="13"/><circle cx="95" cy="135" r="13"/>
              <circle cx="165" cy="135" r="13"/>
            </g>
            <circle cx="60" cy="80" r="20" fill="none" stroke="#ff9100" stroke-opacity=".7" stroke-width="1.4"/>
            <text x="60" y="46" text-anchor="middle" fill="#ff9100" font-family="JetBrains Mono,monospace" font-size="8" opacity=".85">ho sosté tot</text>
          </svg>`;

const VIZ_TERR = `<svg viewBox="0 0 260 184" role="img" aria-label="Graf obert d'actors d'un territori, amb un forat">
            <g fill="none" stroke="#00b0ff" stroke-opacity=".45" stroke-width="1.2">
              <path d="M40,45 L120,35"/><path d="M120,35 L215,55"/><path d="M40,45 L70,110"/>
              <path d="M120,35 L140,105"/><path d="M70,110 L140,105"/><path d="M215,55 L205,125"/>
            </g>
            <g fill="none" stroke="#ff9100" stroke-opacity=".45" stroke-width="1" stroke-dasharray="3 4">
              <path d="M140,105 L205,125"/>
            </g>
            <g fill="#0a0a0f" stroke="#00b0ff" stroke-width="1.6">
              <rect x="27" y="33" width="26" height="24" rx="3"/><rect x="107" y="23" width="26" height="24" rx="3"/>
              <rect x="202" y="43" width="26" height="24" rx="3"/><rect x="57" y="98" width="26" height="24" rx="3"/>
              <rect x="127" y="93" width="26" height="24" rx="3"/><rect x="192" y="113" width="26" height="24" rx="3"/>
            </g>
            <g stroke="#82828d" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="2 4" fill="none">
              <circle cx="120" cy="146" r="14"/>
            </g>
            <text x="120" y="150" text-anchor="middle" fill="#82828d" font-family="JetBrains Mono,monospace" font-size="9">?</text>
            <text x="120" y="176" text-anchor="middle" fill="#82828d" font-family="JetBrains Mono,monospace" font-size="7.5">ningú ho fa</text>
          </svg>`;

/* ══ LA PÀGINA ═══════════════════════════════════════════════════════════════ */
const pagina = () => `<!DOCTYPE html>
<html lang="ca">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Què en surt · TeamTowers Humà</title>
<meta name="description" content="Les eines de TeamTowers Humà, ordenades pel que un projecte necessita: què hi poses i què te'n endús de cada una.">
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg-dark:#050507; --bg-panel:#0a0a0f; --bg-elevated:#111118;
  --border:rgba(255,255,255,.07);
  --accent-indigo:#6366f1; --accent-blue:#00b0ff; --accent-green:#00e676;
  --accent-orange:#ff9100; --accent-purple:#e040fb;
  --white:#f5f5f7; --muted:#82828d; --light:#c7c7d1;
  --sans:'Space Grotesk',system-ui,sans-serif; --mono:'JetBrains Mono',monospace;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;scroll-behavior:smooth}
body{background:var(--bg-dark);color:var(--white);font-family:var(--sans);line-height:1.7;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:inherit}
.container{max-width:1160px;margin:0 auto;padding:0 2rem;position:relative;z-index:1}
.eyebrow{font-family:var(--mono);font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent-indigo);display:flex;align-items:center;gap:.7rem}
.eyebrow::before{content:'';display:block;width:30px;height:1px;background:var(--accent-indigo)}

/* ── L'avís de proposta. Va a dalt de tot i no s'amaga: una pàgina que es
      revisa ha de dir que s'està revisant, o el primer que hi arribi la
      llegirà com si fos la casa. ── */
.avis{background:rgba(255,145,0,.1);border-bottom:1px solid rgba(255,145,0,.3);
  font-family:var(--mono);font-size:.72rem;color:var(--accent-orange);padding:.6rem 0;text-align:center}
.avis a{color:var(--white)}

/* ── Hero ── */
.hero{padding:5rem 0 3.5rem;border-bottom:1px solid var(--border)}
.hero h1{font-size:clamp(2rem,4.6vw,3.6rem);font-weight:700;line-height:1.08;letter-spacing:-.025em;margin:1.4rem 0 1.2rem;max-width:16ch}
.hero h1 em{font-style:normal;color:var(--accent-blue)}
.hero-sub{font-size:1.1rem;color:var(--light);max-width:60ch;line-height:1.65}
.hero-sub strong{color:var(--white);font-weight:600}

/* ── Els dos mapes ── */
.mapes{padding:4.5rem 0 1rem}
.sec-cap{max-width:760px;margin-bottom:3rem}
.sec-cap h2{font-size:clamp(1.5rem,2.7vw,2.2rem);font-weight:700;letter-spacing:-.02em;margin:1rem 0 .8rem;line-height:1.2}
.sec-cap h2 em{font-style:normal;color:var(--accent-blue)}
.sec-cap p{color:var(--light);font-size:1rem}
.mapa-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);border:1px solid var(--border)}
.mapa{background:var(--bg-panel);padding:2rem 1.8rem;display:flex;flex-direction:column;gap:1.2rem}
.mapa-viz{background:var(--bg-dark);border:1px solid var(--border);padding:.6rem}
.mapa-viz svg{display:block;width:100%;height:auto}
.mapa-qui{font-family:var(--mono);font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.mapa h3{font-size:1.15rem;font-weight:700;margin:.35rem 0 .6rem;line-height:1.3}
.mapa-q{color:var(--light);font-size:.92rem;line-height:1.65}
.mapa-go{display:inline-block;margin-top:auto;padding-top:.6rem;font-family:var(--mono);font-size:.76rem;color:var(--accent-blue);text-decoration:none}
.mapa-go:hover{color:var(--white)}

/* ── «En surt»: la llista que fa la feina de tota la pàgina ── */
.surt-lbl{font-family:var(--mono);font-size:.63rem;letter-spacing:.16em;text-transform:uppercase;color:var(--accent-green);margin-bottom:.45rem}
ul.surt{list-style:none;display:flex;flex-direction:column;gap:.4rem}
ul.surt li{position:relative;padding-left:1.15rem;font-size:.88rem;color:var(--light);line-height:1.55}
ul.surt li::before{content:'';position:absolute;left:0;top:.6em;width:6px;height:6px;background:var(--accent-green);border-radius:1px}
ul.surt li b{color:var(--white);font-weight:600}

/* ── Capes i eines ── */
.capes{padding:4.5rem 0}
.capa{margin-bottom:3.5rem}
.capa-cap{display:flex;gap:1.6rem;align-items:flex-start;margin-bottom:1.6rem;max-width:820px}
.capa-n{font-family:var(--mono);font-size:2rem;font-weight:700;color:var(--border);line-height:1;flex-shrink:0}
.capa-cap h3{font-size:1.35rem;font-weight:700;letter-spacing:-.01em;margin-bottom:.5rem}
.capa-cap p{color:var(--light);font-size:.95rem}
.capa-cap p strong{color:var(--white);font-weight:600}
.eines{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1px;background:var(--border);border:1px solid var(--border)}
.eina{background:var(--bg-panel);padding:1.6rem 1.5rem;display:flex;flex-direction:column;gap:1.1rem}
.eina-cap{display:grid;grid-template-columns:auto 1fr;gap:.3rem .8rem;align-items:center}
.eina-ic{font-size:1.5rem;grid-row:span 2}
.eina-cap h4{font-size:1.02rem;font-weight:700;align-self:end}
.eina-regla{font-family:var(--mono);font-size:.68rem;color:var(--accent-indigo);align-self:start}
.flux{display:grid;grid-template-columns:1fr auto 1.35fr;gap:.9rem;align-items:start}
.flux-lbl{font-family:var(--mono);font-size:.63rem;letter-spacing:.16em;text-transform:uppercase;margin-bottom:.45rem}
.flux-in .flux-lbl{color:var(--muted)}
.flux-out .flux-lbl{color:var(--accent-green)}
.flux-txt{font-size:.86rem;color:var(--light);line-height:1.5}
.flux-unit{font-family:var(--mono);font-size:.66rem;color:var(--accent-blue);margin-top:.5rem;
  border:1px solid rgba(0,176,255,.3);border-radius:20px;padding:.1rem .55rem;display:inline-block}
.flux-fl{color:var(--border);font-size:1.3rem;line-height:1;padding-top:1.1rem}
.eina-go{margin-top:auto;font-family:var(--mono);font-size:.74rem;color:var(--accent-blue);text-decoration:none}
.eina-go:hover{color:var(--white)}

/* ── La capa de gent: sense entrada ni sortida, i es nota ── */
.gent{padding:0 0 4.5rem}
.gent-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1px;background:var(--border);border:1px solid var(--border)}
.gent-c{background:var(--bg-panel);padding:1.4rem 1.3rem;text-decoration:none;display:flex;flex-direction:column;gap:.4rem;transition:background .2s}
.gent-c:hover{background:var(--bg-elevated)}
.gent-ic{font-size:1.3rem}
.gent-n{font-weight:700;font-size:.95rem}
.gent-q{color:var(--muted);font-size:.82rem;line-height:1.55}

/* ── La taula resum ── */
.resum-sec{padding:0 0 5rem}
.resum{width:100%;border-collapse:collapse;font-size:.85rem;border:1px solid var(--border)}
.resum th{text-align:left;font-family:var(--mono);font-size:.64rem;letter-spacing:.14em;text-transform:uppercase;
  color:var(--muted);padding:.8rem 1rem;border-bottom:1px solid var(--border);background:var(--bg-panel)}
.resum td{padding:.9rem 1rem;border-bottom:1px solid var(--border);vertical-align:top;color:var(--light)}
.resum tr:last-child td{border-bottom:none}
.resum a{color:var(--white);text-decoration:none;font-weight:600;white-space:nowrap}
.resum a:hover{color:var(--accent-blue)}
.r-in{color:var(--muted)}
.r-out b{color:var(--white)}
.taula-wrap{overflow-x:auto}

/* ── CTA ── */
.cta{padding:5rem 0;border-top:1px solid var(--border);text-align:center}
.cta h2{font-size:clamp(1.6rem,3vw,2.4rem);font-weight:700;letter-spacing:-.02em;margin-bottom:1rem;line-height:1.2}
.cta h2 em{font-style:normal;color:var(--accent-blue)}
.cta p{color:var(--light);max-width:56ch;margin:0 auto 2rem}
.btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.btn-p{background:var(--accent-indigo);color:#fff;font-weight:600;font-size:.86rem;padding:.9rem 2rem;text-decoration:none;
  clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))}
.btn-p:hover{background:var(--accent-blue)}
.btn-g{border:1px solid var(--border);color:var(--light);font-size:.86rem;padding:.9rem 2rem;text-decoration:none}
.btn-g:hover{border-color:var(--accent-indigo);color:var(--white)}
footer{border-top:1px solid var(--border);padding:2.5rem 0;text-align:center;color:var(--muted);font-size:.8rem}

@media(max-width:900px){
  .mapa-grid{grid-template-columns:1fr}
  .flux{grid-template-columns:1fr;gap:.7rem}
  .flux-fl{display:none}
  .flux-out{border-top:1px solid var(--border);padding-top:.8rem}
}
@media(max-width:640px){
  .container{padding:0 1.2rem}
  .hero{padding:3rem 0 2.5rem}
  .capa-cap{gap:1rem}
  .capa-n{font-size:1.5rem}
}
</style>
</head>
<body>

<div class="avis">Proposta de portada nova · en revisió · la portada d'avui és a <a href="index.html">teamtowershuma.com</a></div>

<header class="hero">
  <div class="container">
    <div class="eyebrow">Les eines, i què en surt</div>
    <h1>No us expliquem un mètode. Us <em>donem l'objecte</em>.</h1>
    <p class="hero-sub">Cada eina d'aquesta pàgina diu <strong>què hi heu de posar</strong> i <strong>què us n'endureu</strong>: un saldo, uns coeficients, una quota, un mapa amb els noms. Totes són lliures, funcionen al navegador i no demanen cap compte. <strong>El que es paga és l'acompanyament</strong>, i com es fa ho explica <a href="index.html" style="color:var(--accent-blue)">l'altra pàgina</a>.</p>
  </div>
</header>

<section class="mapes">
  <div class="container">
    <div class="sec-cap">
      <div class="eyebrow">Per on es comença</div>
      <h2>El mateix mètode, <em>dos encàrrecs diferents</em></h2>
      <p>Mapejar els fluxos de valor és el que fem servir a tot arreu. Però no és el mateix encàrrec dins d'una organització que damunt d'un territori: canvia qui el compra, què s'hi mira i què s'endú. Els dos dibuixos de sota són la diferència.</p>
    </div>
    <div class="mapa-grid">${htmlMapes()}
    </div>
  </div>
</section>

<section class="capes">
  <div class="container">
    <div class="sec-cap">
      <div class="eyebrow">Les eines</div>
      <h2>Ordenades pel que <em>un projecte necessita</em>, no per catàleg</h2>
      <p>Totes són pantalles reals que podeu obrir ara mateix, sense demanar-nos permís i sense crear cap compte.</p>
    </div>
${htmlCapes()}
  </div>
</section>

<section class="gent">
  <div class="container">
    <div class="sec-cap">
      <div class="eyebrow">I perquè algú hi entri</div>
      <h2>El que no calcula res <em>i és el que fa que duri</em></h2>
      <p>Cap d'aquestes peces us donarà una xifra. Serveixen per a l'altra meitat del problema, que és sempre la difícil: que la gent hi entri, s'hi trobi i es quedi.</p>
    </div>
    <div class="gent-grid">${htmlGent()}
    </div>
  </div>
</section>

<section class="resum-sec">
  <div class="container">
    <div class="sec-cap">
      <div class="eyebrow">Tot junt</div>
      <h2>Per si ho heu de <em>portar a una junta</em></h2>
    </div>
    <div class="taula-wrap">${htmlTaula()}
    </div>
  </div>
</section>

<section class="cta">
  <div class="container">
    <h2>Obriu-ne una i <em>mireu-la per dins</em></h2>
    <p>No hi ha demo ni prova de trenta dies: són pàgines obertes. Si després voleu saber quant costa muntar-ho de debò al vostre poble o a la vostra empresa, el diagnòstic ho diu en tres minuts.</p>
    <div class="btns">
      <a class="btn-p" href="SOS/diagnostic.html">Fes el diagnòstic · 3 min →</a>
      <a class="btn-g" href="index.html">Com treballem i quant costa →</a>
    </div>
  </div>
</section>

<footer><div class="container">TeamTowers Humà · Força · Equilibri · Valor · Seny</div></footer>

</body>
</html>
`;

/* ══ ESCRIPTURA ══════════════════════════════════════════════════════════════ */
const fPag = join(ARREL, 'home-nova.html');

if (CHECK) {
  console.log('\nGuarda de la vitrina · la proposta de portada');
  if (!existsSync(fPag)) { console.log('  ✗ no hi ha home-nova.html'); process.exit(1); }
  if (readFileSync(fPag, 'utf8') !== pagina()) {
    console.log('  ✗ home-nova.html està vella: corre `node SOS/tools/build-vitrina.js`');
    process.exit(1);
  }
  console.log(`  ✓ ${MAPES.length} mapes, ${EINES.length} eines en ${CAPES.length} capes i ${GENT.length} peces de gent`);
  console.log('\n✅ La vitrina quadra.');
  process.exit(0);
}

writeFileSync(fPag, pagina());
console.log(`✅ home-nova.html escrita · ${MAPES.length} mapes · ${EINES.length} eines en ${CAPES.length} capes · ${GENT.length} peces de gent`);

module.exports = { MAPES, EINES, GENT, CAPES };
