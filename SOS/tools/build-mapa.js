#!/usr/bin/env node
/* El mapa del repositori · ara el fa l'eina del cervell
 * ─────────────────────────────────────────────────────────────────────────
 * El mapa, la taxonomia i el contracte de la IA són peces d'un sol cervell, i
 * l'eina que els comprova és la mateixa que copia qualsevol projecte que el
 * reutilitzi: `SOS/tools/cervell.js`, configurada per `cervell.json`. Aquest
 * nom es manté perquè el citen el codex, la taxonomia i els patrons d'altres
 * generadors; dues còpies del mateix generador divergirien en silenci.
 *
 * Ús:  node SOS/tools/build-mapa.js [--check]   (igual que cervell.js)
 */
require('./cervell.js');
