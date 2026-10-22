#!/usr/bin/env node
/* El procés del client web · de la primera paraula a la web viva
 * ─────────────────────────────────────────────────────────────────
 * Demanat per l'Àlvar (21/10/2026), amb el primer client que paga la web: un
 * sol flux de treball i de comunicació per a cada projecte de «mapa de valor +
 * web», que es vegi com a passos, que la pàgina de producte el mostri per
 * contractar-lo i que cada projecte el vegi amb el pas on és.
 *
 * Els passos es declaren aquí un sol cop i en surten dues coses:
 *
 *   · la secció «Cómo se contrata» de /mapa-web/ (`build-proces.js` l'escriu
 *     entre `<!--TT-PROCES-->` i `<!--/TT-PROCES-->`; `--check` al CI);
 *   · «Dónde estamos» a `EMPIEZA-AQUI.html`, el backoffice de cada client, amb
 *     el pas actual marcat (`proposta.js`, que llegeix `proces.json` de la
 *     proposta; sense fitxer, el pas és l'esborrany).
 *
 * Cada pas porta l'etapa de Zoho on viu l'oportunitat, perquè el CRM, la
 * pàgina i el backoffice diguin el mateix. Cap xifra d'euros: el preu va per
 * fluxos i el presupost el diu (veda «Todo sin precios»).
 *
 *   node SOS/tools/proces-web.js            imprimeix els passos
 */
'use strict';

const PASSOS = [
  { id: 'escribes', qui: ['tu'], zoho: 'Clasificación',
    es: ['Nos escribes', 'Tu web, si la tienes, y dos líneas sobre qué haces.', 'Te contesta una persona, con unas preguntas para empezar tu mapa.'],
    ca: ['Ens escrius', 'La teva web, si en tens, i dues línies sobre què fas.', 'Et contesta una persona, amb unes preguntes per començar el teu mapa.'] },
  { id: 'leemos', qui: ['ia', 'al'], zoho: 'Clasificación',
    es: ['Leemos lo que ya tienes', 'Con tu permiso, tu web, su diseño y sus imágenes, y lo que nos mandes.', 'Tu marca por escrito, las imágenes que sirven y lo que tu web no dice.'],
    ca: ['Llegim el que ja tens', 'Amb el teu permís, la teva web, el disseny i les imatges, i el que ens enviïs.', 'La teva marca per escrit, les imatges que serveixen i el que la web no diu.'] },
  { id: 'borrador', qui: ['ia', 'al'], zoho: 'Propuesta de valor',
    es: ['El borrador de tu mapa', 'Gratis, en tres días laborables. Lo prepara la IA y lo revisa una persona.', 'El borrador del mapa, las preguntas abiertas y una página privada con lo que ya está hecho.'],
    ca: ['L\'esborrany del teu mapa', 'Gratis, en tres dies laborables. El prepara la IA i el revisa una persona.', 'L\'esborrany del mapa, les preguntes obertes i una pàgina privada amb el que ja està fet.'] },
  { id: 'presupuesto', qui: ['al', 'tu'], zoho: 'Cotización de propuesta/precio',
    es: ['El presupuesto, por flujos', 'Cada flujo con sus horas y su coste de IA. Lo aceptas y ya no cambia.', 'El presupuesto desglosado y la fecha de la sesión.'],
    ca: ['El pressupost, per fluxos', 'Cada flux amb les seves hores i el cost d\'IA. L\'acceptes i ja no canvia.', 'El pressupost desglossat i la data de la sessió.'] },
  { id: 'sesion', qui: ['tu', 'al', 'ia'], zoho: 'produccion',
    es: ['La sesión: mapa y web', 'Una hora para el mapa y otra para la web, que se publica delante de ti.', 'Tu mapa validado y tu web publicada, con tu primer cambio hecho por ti.'],
    ca: ['La sessió: mapa i web', 'Una hora per al mapa i una altra per a la web, que es publica davant teu.', 'El teu mapa validat i la teva web publicada, amb el primer canvi fet per tu.'] },
  { id: 'entrega', qui: ['ia', 'al'], zoho: 'Cerrado (ganado)',
    es: ['Todo a tu nombre', 'Tu repositorio privado en tu GitHub, la web en tu Netlify y tu dominio.', 'El cerebro de tu negocio por escrito, tu backoffice y media hora de revisión a las dos semanas.'],
    ca: ['Tot a nom teu', 'El teu repositori privat al teu GitHub, la web al teu Netlify i el teu domini.', 'El cervell del teu negoci per escrit, el teu backoffice i mitja hora de revisió a les dues setmanes.'] },
  { id: 'viva', qui: ['ia', 'al'], zoho: 'Cerrado (ganado)', opcional: true,
    es: ['Tu web, viva', 'Si quieres, una cuota mensual sin permanencia: tus automatizaciones definidas y gestionadas, comprobaciones y el mapa al día.', 'Cada mes, el informe de tu mapa: qué se mueve, qué se para y qué se ha automatizado.'],
    ca: ['La teva web, viva', 'Si vols, una quota mensual sense permanència: les teves automatitzacions definides i gestionades, comprovacions i el mapa al dia.', 'Cada mes, l\'informe del teu mapa: què es mou, què s\'atura i què s\'ha automatitzat.'] }
];

const QUI = { es: { tu: 'Tú', ia: 'IA', al: 'Álvaro' }, ca: { tu: 'Tu', ia: 'IA', al: 'Àlvar' } };
const TXT = {
  es: { fan: 'Lo hacen: ', reps: 'Recibes: ', opc: 'Opcional', ara: 'Estamos aquí', fet: 'Hecho', titol: 'Los pasos' },
  ca: { fan: 'Ho fan: ', reps: 'Reps: ', opc: 'Opcional', ara: 'Som aquí', fet: 'Fet', titol: 'Els passos' }
};

/* Els estils van amb el component i fan servir les variables de qui el pinta
   amb un valor per defecte: /mapa-web/ (--indigo, --border, --muted) i la web
   d'un client (--acc, --lin, --mut). Cap mida per sota dels 15 px. */
const CSS = '.pr{list-style:none;margin:1.5rem 0 0;padding:0;display:grid;gap:0;counter-reset:pr}'
  + '.pr-p{counter-increment:pr;position:relative;display:grid;align-content:start;grid-template-columns:2.6rem minmax(0,1fr);column-gap:1rem;padding:0 0 1.4rem}'
  + '.pr-p::before{content:counter(pr);display:grid;place-items:center;width:2.4rem;height:2.4rem;border-radius:50%;border:2px solid var(--indigo,var(--acc,#3b3fb6));color:var(--indigo,var(--acc,#3b3fb6));font-weight:600;background:var(--bg,#fff);position:relative;z-index:1}'
  + '.pr-p::after{content:"";position:absolute;left:1.2rem;top:2.4rem;bottom:0;width:2px;margin-left:-1px;background:var(--border,var(--lin,#d6d6e0))}'
  + '.pr-p:last-child::after{display:none}'
  + '.pr-p h3{font-size:1.125rem;line-height:1.3;margin:.35rem 0 .35rem}'
  + '.pr-p p{margin:.2rem 0;line-height:1.55;max-width:62ch}'
  + '.pr-reps{color:var(--muted,var(--mut,#555))}'
  + '.pr-q{display:inline-flex;flex-wrap:wrap;gap:.35rem;margin:.1rem 0 .3rem}'
  + '.pr-q span,.pr-e{font-size:.9375rem;border:1px solid var(--border-strong,var(--lin,#bbb));border-radius:999px;padding:.05rem .55rem}'
  + '.pr .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'
  + '.pr-p.opc::before{border-style:dashed}'
  + '.pr-p.fet::before{content:"✓";background:var(--indigo,var(--acc,#3b3fb6));color:#fff}'
  + '.pr-p.ara::before{box-shadow:0 0 0 4px color-mix(in srgb,var(--indigo,var(--acc,#3b3fb6)) 25%,transparent)}'
  + '.pr-p.ara h3::after{content:attr(data-ara);margin-left:.5rem;font-size:.9375rem;font-weight:500;color:var(--indigo,var(--acc,#3b3fb6))}'
  + '@media (min-width:60rem){.pr{grid-template-columns:repeat(' + PASSOS.length + ',minmax(0,1fr));gap:1rem}'
  + '.pr-p{grid-template-columns:1fr;row-gap:.4rem;padding:0}.pr-p::after{left:2.4rem;right:-1rem;top:1.2rem;bottom:auto;width:auto;height:2px;margin:-1px 0 0}}';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* La llista de passos en HTML, sense JavaScript. Amb `ara` (l'id d'un pas),
   els d'abans surten com a fets i aquest amb aria-current="step". */
function pinta(opts) {
  const o = opts || {}, ll = TXT[o.llengua] ? o.llengua : 'es', T = TXT[ll], Q = QUI[ll];
  const iAra = o.ara ? PASSOS.findIndex(p => p.id === o.ara) : -1;
  if (o.ara && iAra < 0) throw new Error('pas desconegut: ' + o.ara + ' (són ' + PASSOS.map(p => p.id).join(', ') + ')');
  const ind = o.sagnat || '';
  return ind + '<ol class="pr" aria-label="' + esc(T.titol) + '">\n' + PASSOS.map((p, i) => {
    const [nom, que, reps] = p[ll];
    const cl = ['pr-p'];
    if (p.opcional) cl.push('opc');
    if (iAra >= 0 && i < iAra) cl.push('fet');
    if (i === iAra) cl.push('ara');
    return ind + '  <li class="' + cl.join(' ') + '" id="pas-' + p.id + '"' + (i === iAra ? ' aria-current="step"' : '') + '>'
      + '<div><h3' + (i === iAra ? ' data-ara="· ' + esc(T.ara) + '"' : '') + '>' + esc(nom) + (iAra >= 0 && i < iAra ? '<span class="sr"> · ' + esc(T.fet) + '</span>' : '') + '</h3>'
      + '<p class="pr-q"><span class="sr">' + esc(T.fan) + '</span>' + p.qui.map(q => '<span>' + esc(Q[q]) + '</span>').join('') + (p.opcional ? '<span class="pr-e">' + esc(T.opc) + '</span>' : '') + '</p>'
      + '<p>' + esc(que) + '</p><p class="pr-reps"><strong>' + esc(T.reps) + '</strong>' + esc(reps) + '</p></div></li>';
  }).join('\n') + '\n' + ind + '</ol>';
}

/* El pas on és una proposta: el que diu `proces.json` ({"pas": "sesion"}).
   Sense fitxer, `borrador`: el backoffice només existeix quan l'esborrany ja
   s'ha fet, i el pas següent el decideix una persona, no un fitxer que aparegui. */
function pasDe(proces) {
  const pas = proces && proces.pas;
  if (!pas) return 'borrador';
  if (!PASSOS.some(p => p.id === pas)) throw new Error('pas desconegut a proces.json: ' + pas + ' (són ' + PASSOS.map(p => p.id).join(', ') + ')');
  return pas;
}

module.exports = { PASSOS, CSS, pinta, pasDe };

if (require.main === module) {
  PASSOS.forEach((p, i) => console.log((i + 1) + '. ' + p.es[0] + '  ·  Zoho: ' + p.zoho + (p.opcional ? '  ·  opcional' : '')));
}
