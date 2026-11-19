/* El panteó de 12 · les dotze preguntes que tota colla ha de saber respondre
 * ─────────────────────────────────────────────────────────────────────────────
 * Dels dotze arquetips de Pantheon.work (CC BY), adoptats a la veda 19 del codex
 * i explicats a `SOS/knowledge/references/pantheon-12.md`. No són etiquetes per a
 * persones (veda 19): són preguntes. Una colla que en deixa una sense ningú que
 * la respongui té un forat, i el forat és una oportunitat per a algú que ho vol
 * aprendre. Zeus és la de repartir el valor: la redistribució dels recursos.
 *
 * Una sola còpia: la fan servir `tools/build-castells.js` (cada posició del
 * castell és resposta d'una pregunta), `lib/guia-cliente.js` (els forats de la
 * teva colla) i qui la vulgui. L'ordre és el de la taula de la referència.
 *
 *   Panteo.ARQ[id]  { ic, nom, nomEs, q, qEs }
 *   Panteo.ORDRE    [id…]
 */
(function (arrel) {
  var ARQ = {
  zeus: { ic: '⚡', nom: 'Zeus', nomEs: 'Zeus', q: 'Com prenem les decisions i com repartim el valor',
    qEs: 'Cómo tomamos las decisiones y cómo repartimos el valor' },
  hera: { ic: '👑', nom: 'Hera', nomEs: 'Hera', q: 'Com generem confiança i compromís',
    qEs: 'Cómo generamos confianza y compromiso' },
  posido: { ic: '🌊', nom: 'Posidó', nomEs: 'Posidón', q: 'Com sostenim la tensió del canvi',
    qEs: 'Cómo sostenemos la tensión del cambio' },
  demeter: { ic: '🌾', nom: 'Demèter', nomEs: 'Deméter', q: 'Com generem valor i en tenim cura',
    qEs: 'Cómo generamos valor y lo cuidamos' },
  atenea: { ic: '🦉', nom: 'Atenea', nomEs: 'Atenea', q: 'Com protegim el nostre flux de valor',
    qEs: 'Cómo protegemos nuestro flujo de valor' },
  apollo: { ic: '📚', nom: 'Apol·lo', nomEs: 'Apolo', q: 'Com estructurem el que sabem',
    qEs: 'Cómo estructuramos lo que sabemos' },
  hebe: { ic: '🍶', nom: 'Hebe', nomEs: 'Hebe', q: 'Com resolem la intendència',
    qEs: 'Cómo resolvemos la intendencia' },
  dionis: { ic: '🍇', nom: 'Dionís', nomEs: 'Dioniso', q: 'Com celebrem el que surt bé',
    qEs: 'Cómo celebramos lo que sale bien' },
  afrodita: { ic: '💗', nom: 'Afrodita', nomEs: 'Afrodita', q: 'Com es veu el valor que aportem',
    qEs: 'Cómo se ve el valor que aportamos' },
  hefest: { ic: '🔨', nom: 'Hefest', nomEs: 'Hefesto', q: 'Amb quin ofici i quines eines produïm',
    qEs: 'Con qué oficio y qué herramientas producimos' },
  hermes: { ic: '🪽', nom: 'Hermes', nomEs: 'Hermes', q: 'Com connectem les persones',
    qEs: 'Cómo conectamos a las personas' },
  hestia: { ic: '🔥', nom: 'Hèstia', nomEs: 'Hestia', q: 'Com acollim i sostenim els espais',
    qEs: 'Cómo acogemos y sostenemos los espacios' }
};
  var Panteo = { ARQ: ARQ, ORDRE: Object.keys(ARQ) };
  if (typeof module === 'object' && module.exports) module.exports = Panteo;
  else arrel.Panteo = Panteo;
})(this);
