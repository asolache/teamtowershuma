# La teva web, des del mapa de valor

Aquest repositori és teu: el va crear el botó «Deploy to Netlify». A cada publicació, Netlify fa la web a partir del mapa (`node eines/genera.mjs`).

**El mapa és la font.** Desa el que dona l'editor del mapa de valor («Copia el JSON») a `cerebro/mapa-real.json` i fes-ne una PR. Netlify en publica una vista prèvia; quan l'acceptes, és la web. Mentre no hi sigui, la web surt de la variable `TT_MAPA` (la posa el botó) o de l'exemple.

**Es configura a Netlify** (Site configuration › Environment variables): `TT_NOM`, `TT_CORREU`, `TT_LLENGUA` (`ca` o `es`) i, per als avisos, `TT_WEBHOOKS` i `TT_WEBHOOK_SECRET`. Cap clau al repositori.

En cada publicació es generen les regles (`CLAUDE.md`), l'API (`API.md`) i el cervell (`cerebro/`). `cerebro/decisiones.md`, si el poses al repositori, es conserva.

---

# Tu web, desde el mapa de valor

Este repositorio es tuyo: lo creó el botón «Deploy to Netlify». En cada publicación, Netlify hace la web a partir del mapa (`node eines/genera.mjs`).

**El mapa es la fuente.** Guarda lo que da el editor del mapa de valor («Copia el JSON») en `cerebro/mapa-real.json` y haz una PR. Netlify publica una vista previa; cuando la aceptas, es la web. Mientras no esté, la web sale de la variable `TT_MAPA` (la pone el botón) o del ejemplo.

**Se configura en Netlify** (Site configuration › Environment variables): `TT_NOM`, `TT_CORREU`, `TT_LLENGUA` (`ca` o `es`) y, para los avisos, `TT_WEBHOOKS` y `TT_WEBHOOK_SECRET`. Ninguna clave en el repositorio.

En cada publicación se generan las reglas (`CLAUDE.md`), la API (`API.md`) y el cerebro (`cerebro/`). `cerebro/decisiones.md`, si lo pones en el repositorio, se conserva.
