#!/usr/bin/env node
/* L'embut · per on començar, declarat un cop i escrit a les pàgines públiques
 * ─────────────────────────────────────────────────────────────────────────────
 * La portada (`#operatiu`) i `/sos/` ja diuen el camí des del 09/10/2026: es
 * comença pel diagnòstic, que torna alguna cosa sense demanar res, i s'acaba a
 * «El teu negoci operatiu». Les altres pàgines públiques —el catàleg, qui som,
 * la premsa, la formació, el blog, els fluxos amb IA— s'acabaven en un peu o en
 * un «escriu-nos», i qui hi arribava des d'un cercador havia d'endevinar el pas
 * següent. La guia de marca ho té escrit com a error: una pàgina que no porta
 * enlloc.
 *
 * Per això el bloc **es declara aquí i es genera**, com el menú i la pell: tres
 * portes (client, usuari i gestor de node, les mateixes de `/sos/`), un sol
 * botó principal —el diagnòstic— i cap xifra en euros. El preu del paquet és
 * una decisió oberta i el catàleg es pressuposta per fluxos.
 *
 * Les pàgines d'arrel tenen dos diccionaris: el bloc hi porta `data-i18n` i
 * les claus s'escriuen a tots dos. Les del SOS que no en tenen reben el català
 * net, sense claus que no tradueixen res.
 *
 * Ús:  node SOS/tools/build-embut.js [--check]
 */
'use strict';
const { readFileSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const ARREL = join(__dirname, '..', '..');
const CHECK = process.argv.includes('--check');

let fails = 0;
const ok = m => console.log('  ✓ ' + m);
const bad = m => { fails++; console.log('  ✗ ' + m); };

const T = (ca, es) => ({ ca, es });

/* ══ EL CONTINGUT ════════════════════════════════════════════════════════════
   Les paraules són les de la porta de client de `/sos/` (`SOS/index.html`),
   perquè qui passa d'una pàgina a l'altra ha de reconèixer el camí. */
const TXT = {
  'emb.k': T('Per on començar', 'Por dónde empezar'),
  'emb.h': T('Primer veus on ets. <em>Després decideixes.</em>', 'Primero ves dónde estás. <em>Después decides.</em>'),
  'emb.d': T('No et demanem res fins que t\'hem tornat alguna cosa. Hi ha tres portes, segons el que vulguis fer.',
    'No te pedimos nada hasta que te hemos devuelto algo. Hay tres puertas, según lo que quieras hacer.'),

  'emb.c.k': T('Com a client', 'Como cliente'),
  'emb.c.t': T('Vull el meu negoci operatiu', 'Quiero mi negocio operativo'),
  'emb.c.d': T('Per a una direcció, una pime o una cooperativa que vol el seu mapa de valor funcionant cada dia, no un informe. La sala i el criteri els posen persones; la feina que abans costava setmanes, el sistema.',
    'Para una dirección, una pyme o una cooperativa que quiere su mapa de valor funcionando cada día, no un informe. La sala y el criterio los ponen personas; el trabajo que antes costaba semanas, el sistema.'),
  'emb.c.1t': T('Diagnòstic', 'Diagnóstico'),
  'emb.c.1d': T('On sou, en 3 minuts i sense parlar amb ningú.', 'Dónde estáis, en 3 minutos y sin hablar con nadie.'),
  'emb.c.2t': T('Esborrany del mapa', 'Borrador del mapa'),
  'emb.c.2d': T('Gratuït, fet amb el material que ja teniu.', 'Gratuito, hecho con el material que ya tenéis.'),
  'emb.c.3t': T('La sala', 'La sala'),
  'emb.c.3d': T('L\'equip dibuixa el mapa real i l\'ideal, i marca on s\'encalla el valor.',
    'El equipo dibuja el mapa real y el ideal, y marca dónde se atasca el valor.'),
  'emb.c.4t': T('El sistema', 'El sistema'),
  'emb.c.4d': T('Cervell per rol, web de xarxa, les eines de cada rol i els avisos.',
    'Cerebro por rol, web de red, las herramientas de cada rol y los avisos.'),
  'emb.c.5t': T('Sistema viu', 'Sistema vivo'),
  'emb.c.5d': T('El mapa real es compara sol amb l\'ideal, i avisa.', 'El mapa real se compara solo con el ideal, y avisa.'),
  'emb.c.a': T('Fes el diagnòstic en 3 min →', 'Haz el diagnóstico en 3 min →'),
  'emb.c.b': T('Ja sé què vull: demana pressupost', 'Ya sé lo que quiero: pide presupuesto'),
  'emb.c.n': T('Es pressuposta per fluxos: hores i cost de la IA, <a href="/cataleg.html#cost">desglossats</a>.',
    'Se presupuesta por flujos: horas y coste de la IA, <a href="/cataleg.html#cost">desglosados</a>.'),

  'emb.u.k': T('Com a usuari', 'Como usuario'),
  'emb.u.t': T('Formo part d\'un equip o d\'un barri', 'Formo parte de un equipo o de un barrio'),
  'emb.u.d': T('Tries el teu rol i veus què dones, què reps i què tens pendent. El que fas queda al teu registre, i és teu.',
    'Eliges tu rol y ves qué das, qué recibes y qué tienes pendiente. Lo que haces queda en tu registro, y es tuyo.'),
  'emb.u.a': T('Crea el meu perfil →', 'Crea mi perfil →'),

  'emb.n.k': T('Com a gestor de node', 'Como gestor de nodo'),
  'emb.n.t': T('Porto un projecte o un territori', 'Llevo un proyecto o un territorio'),
  'emb.n.d': T('Muntes el node pel teu compte: el mapa de valor, el tauler de qui fa què i uns comptes que sumen hores, objectes, euros i intangibles.',
    'Montas el nodo por tu cuenta: el mapa de valor, el tablero de quién hace qué y unas cuentas que suman horas, objetos, euros e intangibles.'),
  'emb.n.a': T('Munta el meu node →', 'Monta mi nodo →'),

  'emb.peu': T('El SOS s\'obre al navegador, sense compte i sense quota, i les dades es queden al teu aparell.',
    'El SOS se abre en el navegador, sin cuenta y sin cuota, y los datos se quedan en tu dispositivo.')
};

/* Quines claus porten marcatge a dins i van amb `data-i18n-html`. */
const AMB_HTML = ['emb.h', 'emb.c.n'];

/* ══ ON VA ═══════════════════════════════════════════════════════════════════
   `abans`: el primer cop, el bloc s'insereix just abans d'aquest text. Després
   ja hi ha les marques i es substitueix el que hi ha entre elles.
   El catàleg el porta **a dalt**: són vint paquets i qui hi arriba sense saber
   per on començar no els ha de llegir tots per trobar el primer pas. */
const PAGINES = [
  { f: 'cataleg.html', dic: true, abans: '<!-- EL CATÀLEG ─' },
  { f: 'qui-som.html', dic: true, abans: '<!--TT-PEU-->' },
  { f: 'premsa.html', dic: true, abans: '<!--TT-PEU-->' },
  { f: 'SOS/ia.html', dic: false, abans: '</main>' },
  { f: 'SOS/formacio.html', dic: false, abans: '</main>' },
  { f: 'SOS/blog.html', dic: false, abans: '</main>' }
];

const OBRE = '<!--TT-EMBUT-->', TANCA = '<!--/TT-EMBUT-->';
const C_OBRE = '/*TT-EMBUT-CSS*/', C_TANCA = '/*/TT-EMBUT-CSS*/';

/* ══ EL MARCATGE ═════════════════════════════════════════════════════════════ */
function bloc(dic) {
  const t = k => TXT[k].ca;
  const a = k => dic ? ` ${AMB_HTML.includes(k) ? 'data-i18n-html' : 'data-i18n'}="${k}"` : '';
  const pas = n => `          <li><b${a(`emb.c.${n}t`)}>${t(`emb.c.${n}t`)}</b> <span${a(`emb.c.${n}d`)}>${t(`emb.c.${n}d`)}</span></li>`;
  const porta = (id, href) => [
    `      <a class="emb-p" href="${href}">`,
    `        <span class="emb-pk"${a(`emb.${id}.k`)}>${t(`emb.${id}.k`)}</span>`,
    `        <span class="emb-pt"${a(`emb.${id}.t`)}>${t(`emb.${id}.t`)}</span>`,
    `        <span class="emb-pd"${a(`emb.${id}.d`)}>${t(`emb.${id}.d`)}</span>`,
    `        <span class="emb-pa"${a(`emb.${id}.a`)}>${t(`emb.${id}.a`)}</span>`,
    '      </a>'
  ].join('\n');
  return [
    OBRE,
    '<!-- GENERAT per SOS/tools/build-embut.js · no s\'edita a mà. Les tres portes',
    '     són les de /sos/, i el botó principal és el diagnòstic perquè és l\'únic',
    '     que dona alguna cosa abans de demanar res (guia de marca §9). -->',
    '<section class="emb" id="per-on-comencar" aria-labelledby="emb-t">',
    '  <div class="emb-in">',
    `    <p class="emb-k"${a('emb.k')}>${t('emb.k')}</p>`,
    `    <h2 id="emb-t"${a('emb.h')}>${t('emb.h')}</h2>`,
    `    <p class="emb-d"${a('emb.d')}>${t('emb.d')}</p>`,
    '    <div class="emb-portes">',
    '      <div class="emb-p emb-c">',
    `        <span class="emb-pk"${a('emb.c.k')}>${t('emb.c.k')}</span>`,
    `        <h3 class="emb-pt"${a('emb.c.t')}>${t('emb.c.t')}</h3>`,
    `        <p class="emb-pd"${a('emb.c.d')}>${t('emb.c.d')}</p>`,
    '        <ol class="emb-r">',
    [1, 2, 3, 4, 5].map(pas).join('\n'),
    '        </ol>',
    '        <p class="emb-acc">',
    `          <a class="btn-primary emb-cta" href="/SOS/diagnostic.html"${a('emb.c.a')}>${t('emb.c.a')}</a>`,
    `          <a class="emb-sec" href="/SOS/pressupost.html"${a('emb.c.b')}>${t('emb.c.b')}</a>`,
    '        </p>',
    `        <p class="emb-n"${a('emb.c.n')}>${t('emb.c.n')}</p>`,
    '      </div>',
    porta('u', '/SOS/'),
    porta('n', '/SOS/'),
    '    </div>',
    `    <p class="emb-peu"${a('emb.peu')}>${t('emb.peu')}</p>`,
    '  </div>',
    '</section>',
    TANCA
  ].join('\n');
}

/* ══ L'ESTIL ═════════════════════════════════════════════════════════════════
   Només tokens de la pell (`build-pell.js`): el bloc va a pàgines que fins
   ahir tenien noms propis per als mateixos colors. Verd = la porta que ven,
   com a `/sos/`; indi = sistema i navegació. */
const CSS = [
  C_OBRE,
  '/* GENERAT per SOS/tools/build-embut.js · l\'embut «Per on començar» */',
  '.emb{padding:4rem 1.25rem;border-top:1px solid var(--border);background:var(--panel)}',
  '.emb-in{max-width:1080px;margin:0 auto}',
  '.emb-k{font-family:var(--mono);font-size:var(--t0);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 .6rem}',
  '.emb h2{font-size:var(--t4);line-height:1.15;margin:0 0 .8rem;color:var(--text)}',
  '.emb h2 em{font-style:normal;color:var(--indigo)}',
  '.emb-d{font-size:var(--t1);line-height:1.6;color:var(--light);max-width:62ch;margin:0 0 1.8rem}',
  '.emb-portes{display:grid;grid-template-columns:1fr 1fr;gap:1rem}',
  '.emb-p{display:flex;flex-direction:column;gap:.45rem;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1.2rem 1.25rem;color:var(--text);text-decoration:none}',
  'a.emb-p:hover,a.emb-p:focus-visible{border-color:var(--indigo)}',
  '.emb-c{grid-column:1/-1;border-color:var(--green);border-top-width:3px}',
  '.emb-pk{font-family:var(--mono);font-size:var(--t0);letter-spacing:.06em;text-transform:uppercase;color:var(--indigo)}',
  '.emb-c .emb-pk{color:var(--green)}',
  '.emb-pt{font-size:var(--t2);font-weight:700;line-height:1.3;margin:0;color:var(--text)}',
  '.emb-pd{font-size:var(--t0);line-height:1.6;color:var(--light);margin:0;max-width:72ch}',
  '.emb-pa{font-size:var(--t0);font-weight:600;color:var(--indigo);margin-top:auto;padding-top:.3rem}',
  '.emb-r{list-style:none;counter-reset:emb;display:grid;grid-template-columns:repeat(5,1fr);gap:.7rem;margin:.6rem 0 .4rem;padding:0}',
  '.emb-r li{counter-increment:emb;font-size:var(--t0);line-height:1.5;color:var(--muted);border-top:2px solid var(--green);padding-top:.5rem}',
  '.emb-r li b{display:block;color:var(--text)}',
  '.emb-r li b::before{content:counter(emb) " · ";font-family:var(--mono);font-weight:400;color:var(--green)}',
  '.emb-acc{display:flex;flex-wrap:wrap;gap:.8rem 1.4rem;align-items:center;margin:.6rem 0 0}',
  /* El botó és el comú (`build-components.js`) des del 10/10/2026: era verd i
     amb el seu radi, i a la mateixa pàgina el de la portada era indi. */
  '.emb-sec{display:inline-flex;align-items:center;min-height:44px;color:var(--indigo);font-weight:600}',
  '.emb-n,.emb-peu{font-size:var(--t0);line-height:1.6;color:var(--muted);margin:0}',
  '.emb-n a{color:var(--indigo)}',
  '.emb-peu{margin-top:1.2rem}',
  '.emb a:focus-visible{outline:2px solid var(--indigo);outline-offset:3px}',
  '@media(max-width:860px){.emb-r{grid-template-columns:1fr}}',
  '@media(max-width:620px){.emb-portes{grid-template-columns:1fr}.emb-cta{width:100%;justify-content:center}}',
  C_TANCA
].join('\n');

/* ══ LES CLAUS ═══════════════════════════════════════════════════════════════ */
const q = s => '\'' + s.replace(/\\/g, '\\\\').replace(/'/g, '\\\'') + '\'';
const dicc = l => Object.keys(TXT).map(k => `  ${q(k)}:${q(TXT[k][l])},`).join('\n');

/* Substitueix entre marques, o insereix el primer cop. */
function entre(html, a, b, nou, onPosar) {
  const i = html.indexOf(a), j = html.indexOf(b);
  if (i >= 0 && j > i) return html.slice(0, i) + nou + html.slice(j + b.length);
  const p = onPosar(html);
  if (p < 0) return null;
  return html.slice(0, p) + nou + '\n' + html.slice(p);
}

console.log('\nL\'embut · per on començar, a ' + PAGINES.length + ' pàgines');
let tocades = 0;
PAGINES.forEach(({ f, dic, abans }) => {
  const fit = join(ARREL, f);
  if (!existsSync(fit)) { bad(`${f} és a la llista i no existeix`); return; }
  const html = readFileSync(fit, 'utf8');
  let nou = entre(html, OBRE, TANCA, bloc(dic), h => h.indexOf(abans));
  if (nou === null) { bad(`${f}: no es troba on posar el bloc (${abans})`); return; }
  nou = entre(nou, C_OBRE, C_TANCA, CSS, h => h.indexOf('</style>'));
  if (nou === null) { bad(`${f}: no hi ha cap <style> on posar l'estil`); return; }
  if (dic) {
    for (const [M, l] of [['CA', 'ca'], ['ES', 'es']]) {
      const a = `/*TT-EMBUT-I18N-${M}*/`, b = `/*/TT-EMBUT-I18N-${M}*/`;
      const ancora = `/*/TT-NAV-I18N-${M}*/`;
      nou = entre(nou, a, b, a + '\n' + dicc(l) + '\n' + b, h => {
        const x = h.indexOf(ancora);
        return x < 0 ? -1 : x + ancora.length + 1;
      });
      if (nou === null) { bad(`${f}: no es troba ${ancora} per escriure-hi les claus`); return; }
    }
  }
  /* Una sola porta principal: si la pàgina ja en té una altra de verda al
     mateix bloc, n'hi hauria dues del mateix pes. */
  const n = (bloc(dic).match(/class="btn-primary emb-cta"/g) || []).length;
  if (n !== 1) bad(`${f}: el bloc porta ${n} botons principals`);
  if (/\d\s*€/.test(bloc(dic))) bad(`${f}: el bloc ensenya un preu en euros`);
  if (nou === html) return;
  if (CHECK) bad(`${f}: el bloc no correspon a la declaració — torna a executar build-embut.js`);
  else { writeFileSync(fit, nou); tocades++; }
});

/* Els destins del bloc han d'existir: un enllaç mort aquí és el pas següent
   del recorregut que no porta enlloc. */
['SOS/diagnostic.html', 'SOS/pressupost.html', 'SOS/index.html', 'cataleg.html'].forEach(p => {
  if (!existsSync(join(ARREL, p))) bad(`el bloc enllaça ${p}, que no existeix`);
});
/* I les dues llengües, completes. */
const coixes = Object.keys(TXT).filter(k => !TXT[k].ca || !TXT[k].es);
if (coixes.length) bad(`claus sense les dues llengües: ${coixes.join(', ')}`);

if (!fails) ok(CHECK ? 'el bloc és el declarat a totes' : `escrit a ${tocades} ${tocades === 1 ? 'pàgina' : 'pàgines'}`);
console.log(fails ? '\n❌ L\'embut no quadra.' : '\n✅ L\'embut quadra.');
process.exit(fails ? 1 : 0);
