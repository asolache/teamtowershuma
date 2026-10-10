# Abans de generar la web · Antes de generar la web

**ca.** Aquí encara falta gairebé tot: les pàgines, `cerebro/` i les skills apareixen en executar `node eines/genera.mjs` (Node 18 o més nou). Netlify ho fa a cada publicació, però no ho desa al repositori.

1. Primer ha d'existir `cerebro/mapa-real.json`: desa-hi el que dona l'editor del mapa de valor («Copia el JSON»). Sense mapa surt la web d'exemple.
2. Després, `node eines/genera.mjs`.
3. En acabar, el `CLAUDE.md` complet substitueix aquest, i les skills `/importa`, `/continguts` i `/tasca` apareixen a `.claude/skills/`.

Cap clau ni dada personal al repositori. Cada canvi, en una PR.

---

**es.** Aquí todavía falta casi todo: las páginas, `cerebro/` y las skills aparecen al ejecutar `node eines/genera.mjs` (Node 18 o más nuevo). Netlify lo hace en cada publicación, pero no lo guarda en el repositorio.

1. Primero tiene que existir `cerebro/mapa-real.json`: guarda en él lo que da el editor del mapa de valor («Copia el JSON»). Sin mapa sale la web de ejemplo.
2. Después, `node eines/genera.mjs`.
3. Al terminar, el `CLAUDE.md` completo sustituye a este, y las skills `/importa`, `/continguts` y `/tasca` aparecen en `.claude/skills/`.

Ninguna clave ni dato personal en el repositorio. Cada cambio, en una PR.
