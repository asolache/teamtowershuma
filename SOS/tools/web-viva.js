#!/usr/bin/env node
/* La web viva · què vols, fins on, i què es manté viu cada mes
 * ─────────────────────────────────────────────────────────────────
 * Demanat per l'Àlvar (21/10/2026): que la «web viva» digui que, pagant la
 * quota, les automatitzacions es poden definir i gestionar; que hi entrin els
 * processos continus d'un negoci (màrqueting, finances, desenvolupament,
 * competència, oportunitats, nous mercats, organització, fluxos de valor,
 * auditoria, creativitat) ordenats per la trinitat crear · sostenir ·
 * transformar; i que hi hagi opcions de producte mínim viable, perquè cadascú
 * vol la web fins a un cert nivell.
 *
 * Es declara aquí un sol cop i `build-proces.js` ho escriu a /mapa-web/#viva,
 * al costat dels passos (`proces-web.js`). Cap xifra d'euros: cada nivell es
 * pressuposta per fluxos.
 *
 * Els processos porten `estat`: «hoy» si ja funciona a casa i «contigo» si es
 * defineix amb el client. La guarda de `build-proces.js` no deixa que un
 * procés digui «hoy» sense dir amb què funciona.
 */
'use strict';

const NIVELLS = [
  { id: 'pagina', nom: 'Una página', per: 'Para estar y que te encuentren',
    te: ['Portada y contacto, en un idioma', 'Sale del borrador de tu mapa', 'Tuya: en tu GitHub y tu Netlify'] },
  { id: 'mapa', nom: 'La web de tu mapa', per: 'Para que cada rol encuentre su puerta',
    te: ['Todo lo anterior', 'Hasta tres puertas del flujo que importa ahora', 'Formularios que te llegan por correo', 'Datos para buscadores e IA en cada página'] },
  { id: 'conectada', nom: 'La web conectada', per: 'Para dejar de copiar y pegar',
    te: ['Todo lo anterior', 'Tu CRM, tus reservas o tus matrículas', 'La web avisa a tu IA, con MCP o con una función', 'Más idiomas o más puertas, como flujos'] },
  { id: 'viva', nom: 'La web viva', per: 'Para que el sistema mejore cada mes', cuota: true,
    te: ['Todo lo anterior', 'Tus procesos repetitivos, definidos y gestionados', 'El tablero del día y el informe del mes', 'Comprobaciones automáticas y cambios pequeños'] }
];

const GARANTIA = 'Con la cuota de la web viva, cada automatización que necesites se define contigo, tiene quien la lleva (una persona o un agente con tu IA), se ve en tu mapa y se mide cada mes. Si un proceso deja de funcionar, te llega el aviso y se arregla dentro de la cuota.';

/* La trinitat: crear el que encara no hi és, sostenir el que funciona i
   transformar el que s'ha quedat curt. */
const TRINITAT = [
  { id: 'crear', nom: 'Crear', que: 'Lo que todavía no existe',
    processos: [
      { area: 'Creatividad', que: 'Cada mes, una idea que sale de tu mapa: un rol que nadie cubre o algo que das y nadie te reconoce.', estat: 'contigo' },
      { area: 'Desarrollo', que: 'Cambios en tu web y en tus herramientas, propuestos por la IA y revisados antes de publicar.', estat: 'hoy', amb: 'GitHub y Netlify' },
      { area: 'Nuevos mercados', que: 'A quién más le sirve lo que das: nuevos roles, nuevos idiomas, nuevos lugares.', estat: 'contigo' }
    ] },
  { id: 'sostener', nom: 'Sostener', que: 'Lo que ya funciona, sin que dependa de ti',
    processos: [
      { area: 'Marketing', que: 'Publicar una vez y que salga en la web, en el boletín y en las redes.', estat: 'contigo' },
      { area: 'Finanzas', que: 'El cierre del mes: lo cobrado, lo pendiente y lo que ha costado la IA de cada flujo.', estat: 'contigo' },
      { area: 'Auditoría', que: 'Las diez reglas de tu mapa, la web y los servicios comprobados, con el aviso si algo falla.', estat: 'hoy', amb: 'la consola del mapa y una tarea programada' }
    ] },
  { id: 'transformar', nom: 'Transformar', que: 'Lo que se ha quedado corto',
    processos: [
      { area: 'Competencia y oportunidades', que: 'Qué cambia fuera y qué encaja con tu mapa: convocatorias, clientes, colaboraciones.', estat: 'contigo' },
      { area: 'Organización', que: 'Quién da y no recibe, quién lleva demasiados roles y qué zonas se calientan.', estat: 'hoy', amb: 'el diagnóstico del mapa' },
      { area: 'Flujos de valor', que: 'Los flujos que se paran, con su aviso y su orden del día: responder, cobrar, producir.', estat: 'hoy', amb: 'el tablero del día' }
    ] }
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CSS = '.vv-n{display:grid;gap:1rem;margin:1.5rem 0 0}@media (min-width:60rem){.vv-n{grid-template-columns:repeat(' + NIVELLS.length + ',minmax(0,1fr))}}'
  + '.vv-n article{border:1px solid var(--border,#d6d6e0);border-radius:14px;padding:1.1rem 1.2rem;background:var(--card,#fff);display:grid;gap:.45rem;align-content:start}'
  + '.vv-n article.cuota{border-color:var(--indigo,#3b3fb6);border-width:2px}'
  + '.vv-n .vv-k{font-family:var(--mono,monospace);font-size:.9375rem;color:var(--indigo,#3b3fb6)}'
  + '.vv-n h3{font-size:1.125rem;line-height:1.3}.vv-n p,.vv-n li{line-height:1.55}.vv-n ul{display:grid;gap:.3rem;padding-left:1.1rem;list-style:disc}'
  + '.vv-g{margin:2rem 0 0;padding:1rem 1.2rem;border-left:3px solid var(--indigo,#3b3fb6);background:var(--card,#fff);border-radius:0 12px 12px 0;line-height:1.6;max-width:70ch}'
  + '.vv-t{display:grid;gap:1rem;margin:1.5rem 0 0}@media (min-width:60rem){.vv-t{grid-template-columns:repeat(3,minmax(0,1fr))}}'
  + '.vv-t section{display:grid;gap:.6rem;align-content:start}.vv-t h4{font-size:1.125rem}.vv-t h4 span{font-weight:400;color:var(--muted,#555)}'
  + '.vv-t ul{list-style:none;display:grid;gap:.6rem;padding:0}.vv-t li{border:1px solid var(--border,#d6d6e0);border-radius:12px;padding:.7rem .9rem;background:var(--card,#fff);line-height:1.5}'
  + '.vv-t li b{display:block}.vv-t .vv-e{font-family:var(--mono,monospace);font-size:.9375rem;color:var(--muted,#555)}.vv-t .vv-e.hoy{color:var(--green,#0c6640)}';

const ESTAT = { hoy: 'Funciona hoy', contigo: 'Se define contigo' };

function pinta(sagnat) {
  const ind = sagnat || '';
  const nivells = ind + '<div class="vv-n">\n' + NIVELLS.map((n, i) => ind + '  <article class="' + (n.cuota ? 'cuota' : '') + '" id="nivel-' + n.id + '">'
    + '<p class="vv-k">Nivel ' + (i + 1) + (n.cuota ? ' · cuota mensual' : ' · por flujos') + '</p><h3>' + esc(n.nom) + '</h3><p>' + esc(n.per) + '</p>'
    + '<ul>' + n.te.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul></article>').join('\n') + '\n' + ind + '</div>';
  const trin = ind + '<div class="vv-t">\n' + TRINITAT.map(t => ind + '  <section aria-labelledby="vv-' + t.id + '"><h4 id="vv-' + t.id + '">' + esc(t.nom) + ' <span>· ' + esc(t.que) + '</span></h4><ul>'
    + t.processos.map(p => '<li><b>' + esc(p.area) + '</b>' + esc(p.que) + ' <span class="vv-e' + (p.estat === 'hoy' ? ' hoy' : '') + '">' + esc(ESTAT[p.estat]) + (p.amb ? ', con ' + esc(p.amb) : '') + '</span></li>').join('')
    + '</ul></section>').join('\n') + '\n' + ind + '</div>';
  return { nivells, garantia: ind + '<p class="vv-g"><strong>Lo que garantiza la cuota.</strong> ' + esc(GARANTIA) + '</p>', trinitat: trin };
}

/* Per a la guarda: què ha de complir cada peça. */
function revisa() {
  const err = [];
  TRINITAT.forEach(t => t.processos.forEach(p => {
    if (!ESTAT[p.estat]) err.push(p.area + ': estat desconegut ' + p.estat);
    if (p.estat === 'hoy' && !p.amb) err.push(p.area + ': diu que funciona avui i no diu amb què');
  }));
  if (!NIVELLS.some(n => n.cuota)) err.push('cap nivell és la quota de la web viva');
  return err;
}

module.exports = { NIVELLS, GARANTIA, TRINITAT, CSS, pinta, revisa };

if (require.main === module) {
  NIVELLS.forEach((n, i) => console.log('Nivel ' + (i + 1) + ' · ' + n.nom));
  TRINITAT.forEach(t => console.log(t.nom + ': ' + t.processos.map(p => p.area + ' (' + p.estat + ')').join(', ')));
}
