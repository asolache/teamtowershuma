# Contrato de trabajo para una IA

Este fichero dice **cómo se trabaja aquí**. `taxonomia.md` dice dónde va cada
cosa y `MAPA.md` qué hay; esto dice qué hacer y qué no.

## 1 · El orden de lectura

1. `MAPA.md` — qué hay y de qué cara es. Generado desde el árbol.
2. `codex.md` — las vedas propias, y `vedas-heredadas.md` — las que vienen de
   TeamTowers: cada una es un error que ya se pagó en otro proyecto.
3. `taxonomia.md` — dónde va lo que escribas.
4. `../CLAUDE.md` — cómo quiere la comunicación quien trabaja aquí.

## 2 · Lo que no se negocia

- **Una sola fuente de verdad por cosa.** Las vistas se generan, no se editan.
- **Todo cambio pasa por PR.** Una rama por tema; decide quien es dueño.
- **Lo que se puede comprobar, se comprueba solo**, en `../guardas/` y en CI.
- **Nada personal entra en git.** El historial es para siempre.

## 3 · Las IA que ya saben hacer algo aquí

- **El mapa de valor:** la skill `../.claude/skills/mapa-de-valor/SKILL.md`
  acompaña una sesión con el método VNA de Verna Allee. El método está en
  `heredado/vna-verna-allee.md`, el contrato para un modelo en
  `heredado/ia-mapa-de-valor.md` y los patrones vistos en `heredado/vna-patrons.md`.
- **La propuesta inicial:** la skill `../.claude/skills/propuesta-inicial/SKILL.md`
  lleva de la web que hay a un borrador de mapa revisado, las preguntas que la
  web no contesta y una web que sale del mapa. Usa
  `../herramientas/tools/revisa-mapa.js` (el diagnóstico del editor) y
  `../herramientas/tools/web-del-mapa.js` (la web, con el mismo código que el
  editor). El editor se abre con doble clic: `../herramientas/vna-suport.html`.
- **La revisión de un PR:** `heredado/prompts/pr_review.md`, con dictamen
  verde, amarillo o rojo.

Todo lo de `heredado/` viene de TeamTowers y no se edita aquí.

## 4 · Los antipatrones que hemos cometido de verdad

Cuando una IA se equivoca aquí, el error entra en esta lista con su fecha, su
veda y la guarda que lo habría parado. Nada de antipatrones hipotéticos.

- *(vacío: el primero lo escribe el primer error real)*
