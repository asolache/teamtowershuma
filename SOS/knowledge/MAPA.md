# Mapa del repositori

> **Generat per `SOS/tools/cervell.js`. No l'editis a mà.**
> Les cares es declaren a [`taxonomia.md`](taxonomia.md); això és el que en
> surt en creuar-les amb l'arbre de debò. Si el mapa i l'arbre divergeixen, el
> CI peta — un mapa desactualitzat és pitjor que cap mapa.

Comença per aquí, després [`codex.md`](codex.md) (la llei) i després [`for-ai/README.md`](for-ai/README.md) (el contracte de treball) i després [`taxonomia.md`](taxonomia.md) (on va cada cosa).

## obra

La cosa mateixa: el que fa servir la gent. Una sola font de veritat per cada cosa.

| carpeta | què hi entra | fitxers |
|---|---|---|
| `SOS/` | L'aplicació i tot el que se serveix: una pàgina per cosa, autocontingudes | 399 · 20605 KB |
| `SOS/atles/` | Dades geogràfiques i institucionals del territori | 5 · 15 KB |
| `SOS/canal/` | Paquets de canal per tema, xifrats | 2 · 2 KB |
| `SOS/cervell/` | El motor del cervell de cadascú: el lector del codex, les forces, el 3D per koshas, la vista, l'explorador d'una pàgina sencera i l'exportació (IA, HTML i SCORM). El fan servir `cervell.html` i les webs filles | 9 · 134 KB |
| `SOS/fonts/` | Les dues fonts de l'app, allotjades aquí perquè arrencar no depengui de ningú de fora | 8 · 93 KB |
| `SOS/lib/` | El que l'app carrega quan ho fa servir: el mapa de comarques, el codificador de QR i el mapa viu (fluxos vius i xarxa real) | 19 · 422 KB |
| `SOS/media/` | Imatges i material que serveixen les pàgines | 12 · 10008 KB |
| `SOS/plantilla-web/` | La plantilla del botó «Deploy to Netlify»: la web del client, a nom seu | 8 · 360 KB |
| `SOS/registre/` | El registre públic: hashes, totals i altes. Mai files | 2 · 7 KB |
| `SOS/sql/` | Esquema de la part opcional amb servidor | 1 · 6 KB |
| `SOS/supply/` | L'oferta comuna publicada, passada pel sedàs | 2 · 2 KB |
| `cliente/` | Espai de client: el compte, el primer diagnòstic, qui hi ha al voltant i el boceto de la web, en esborrany | 1 · 157 KB |
| `conecta/` | Prototip de serveis connectables: la pila per rol, el catàleg de serveis i el cost real de l'IA, en esborrany | 1 · 84 KB |
| `mapa-web/` | Servei «mapa de valor i web en una hora»: la pàgina pública, en esborrany | 2 · 204 KB |
| `netlify/` | Funcions del web públic: el formulari que entra al CRM (submission-created), el pagament (checkout), l'espai de cada agència (espai-partner) i la IA de /cliente/ amb qui la fa servir (pule-mapa, identitat) el preu de cada client, només per a ell (proposta), i el seu dibuix, guardat amb el seu compte (fitxa) | 12 · 77 KB |
| `visita/` | On porten els botons de la pàgina que rep el lead: el formulari per reservar la visita o dir que el mapa no és així | 1 · 6 KB |

## prova

El que comprova que l'obra compleix la llei. Ha de petar quan toca, i només llavors.

| carpeta | què hi entra | fitxers |
|---|---|---|
| `.github/` | El CI: quines guardes corren i en quin ordre | 4 · 35 KB |
| `SOS/tests/` | Playwright contra les pàgines de debò, per `file://` | 129 · 1687 KB |
| `SOS/tools/` | Les guardes que peten al CI quan una promesa deixa de ser certa | 73 · 1564 KB |

## saber

El que sabem i encara no és obra. Es cita, no es copia.

| carpeta | què hi entra | fitxers |
|---|---|---|
| `SOS/knowledge/` | El que sabem: llei, referents, visió, negoci i aquest mapa | 91 · 1251 KB |
| `SOS/knowledge/cervell/` | El cervell reutilitzable: el model, la plantilla per a un projecte nou i com s'hi instal·la | 19 · 76 KB |
| `SOS/knowledge/dev/` | El backlog i la guia d'estil per a qui hi escriu | 6 · 382 KB |
| `SOS/knowledge/for-ai/` | El contracte de treball per a una IA que hi contribueix | 2 · 18 KB |
| `SOS/knowledge/legal/` | Protecció de dades: els tractaments, el registre d'activitats que en surt i la plantilla d'encàrrec amb cada client (rgpd.js) | 3 · 15 KB |
| `SOS/knowledge/marketing/` | Veu de marca i material de difusió | 2 · 11 KB |
| `SOS/knowledge/matriu/` | El model de la MATRIU: com funciona i com es millora | 2 · 23 KB |
| `SOS/knowledge/negoci/` | Model d'equip gestor, formació i mentoria | 9 · 122 KB |
| `SOS/knowledge/references/` | Els referents conceptuals, citats i no copiats | 3 · 32 KB |
| `SOS/knowledge/vision/` | Decisions d'arquitectura vives i auditories fetes | 15 · 143 KB |
| `SOS/knowledge/vna/` | Els casos de mapa de valor i els patrons que n'han sortit | 25 · 89 KB |
| `SOS/prompts/` | Un fitxer per intent d'IA: el que se li demana, versionat | 8 · 8 KB |

## arxiu

El que va ser. Es conserva; **no es llegeix com a present**.

| carpeta | què hi entra | fitxers |
|---|---|---|
| `data/` | Llavors de dades d'una versió anterior | 2 · 2 KB |
| `ia/` | Prototip d'app amb IA (SOS V10) i el seu proxy d'IA; ja no se serveix | 61 · 1316 KB |
| `js/` | Codi solt d'abans que tot fos autocontingut | 3 · 5 KB |
| `knowledge-base/` | Mòduls de coneixement d'una versió anterior | 2 · 5 KB |
| `v2/` | Versió anterior de l'app | 6 · 147 KB |
| `v3/` | Versió anterior de l'app | 56 · 218 KB |
| `v4/` | Versió anterior de l'app | 54 · 623 KB |
| `v5/` | Versió anterior de l'app | 27 · 611 KB |
| `v6/` | Versió anterior de l'app | 28 · 670 KB |
| `v7/` | Versió anterior de l'app | 28 · 663 KB |
| `v8/` | Versió anterior de l'app | 37 · 701 KB |
| `v9/` | Versió anterior de l'app | 48 · 834 KB |

## arrel · pàgines HTML

9 pàgines HTML a l'arrel del repositori (`avis-legal.html`, `cataleg.html`, `finances.html`, `home-nova.html`…).
Són **arxiu**: el web anterior a `SOS/`, encara servit per `_redirects`.
No són referència de com es fan les coses ara.

## documents

Els documents estratègics, amb el tronc comú de `taxonomia-universal.json` i les etiquetes de la folksonomia d'aquest cervell.

| document | què és | rol | de | estat | qui ho veu | etiquetes |
|---|---|---|---|---|---|---|
| [`SOS/knowledge/negoci/arquitectura-portades.md`](negoci/arquitectura-portades.md) | informe | màrqueting, comunicació | TeamTowers Huma i SOS | vigent | pública | portada, embut, mesura |
| [`SOS/knowledge/negoci/equip-gestor-v1.md`](negoci/equip-gestor-v1.md) | pla | persones, xarxa i aliances | TeamTowers Huma i SOS | esborrany | pública | territori, equip-gestor, formacio |
| [`SOS/knowledge/negoci/frontera-molekulon.md`](negoci/frontera-molekulon.md) | decisió | sistemes i dades, màrqueting | La casa | vigent | pública | molekulon, redireccions, menu |
| [`SOS/knowledge/negoci/mapa-kanban-ia.md`](negoci/mapa-kanban-ia.md) | pla | sistemes i dades, operacions | TeamTowers Huma i SOS | esborrany | pública | kanban, mapa-viu, automatitzacio |
| [`SOS/knowledge/vna/sectors/acollida.md`](vna/sectors/acollida.md) | model | persones, xarxa i aliances, comunicació | La casa | esborrany | pública | veda, mapa-de-valor, acollida |
| [`SOS/knowledge/vna/sectors/alimentacio.md`](vna/sectors/alimentacio.md) | model | producció, logística, vendes | La casa | esborrany | pública | veda, mapa-de-valor, alimentacio |
| [`SOS/knowledge/vna/sectors/cultura.md`](vna/sectors/cultura.md) | model | comunicació, màrqueting, xarxa i aliances | La casa | esborrany | pública | veda, mapa-de-valor, cultura |
| [`SOS/knowledge/vna/sectors/cura_social.md`](vna/sectors/cura_social.md) | model | persones, operacions, xarxa i aliances | La casa | esborrany | pública | veda, mapa-de-valor, cura-social |
| [`SOS/knowledge/vna/sectors/cures.md`](vna/sectors/cures.md) | model | persones, xarxa i aliances, operacions | La casa | esborrany | pública | veda, mapa-de-valor, cures |
| [`SOS/knowledge/vna/sectors/digitalitzacio.md`](vna/sectors/digitalitzacio.md) | model | sistemes i dades, persones, xarxa i aliances | La casa | esborrany | pública | veda, mapa-de-valor, digitalitzacio |
| [`SOS/knowledge/vna/sectors/dinamitzacio_comercial.md`](vna/sectors/dinamitzacio_comercial.md) | model | màrqueting, vendes, xarxa i aliances | La casa | esborrany | pública | veda, mapa-de-valor, dinamitzacio-comercial |
| [`SOS/knowledge/vna/sectors/economia_circular.md`](vna/sectors/economia_circular.md) | model | producció, logística, xarxa i aliances | La casa | esborrany | pública | veda, mapa-de-valor, economia-circular |
| [`SOS/knowledge/vna/sectors/energia.md`](vna/sectors/energia.md) | model | producció, finances, xarxa i aliances | La casa | esborrany | pública | veda, mapa-de-valor, energia |
| [`SOS/knowledge/vna/sectors/formacio.md`](vna/sectors/formacio.md) | model | persones, màrqueting, xarxa i aliances | La casa | esborrany | pública | veda, mapa-de-valor, formacio |
| [`SOS/knowledge/vna/sectors/habitatge.md`](vna/sectors/habitatge.md) | model | finances, legal i compliment, xarxa i aliances | La casa | esborrany | pública | veda, mapa-de-valor, habitatge |
| [`SOS/knowledge/vna/sectors/joventut.md`](vna/sectors/joventut.md) | model | persones, comunicació, xarxa i aliances | La casa | esborrany | pública | veda, mapa-de-valor, joventut |
| [`SOS/knowledge/vna/sectors/mobilitat.md`](vna/sectors/mobilitat.md) | model | operacions, logística, xarxa i aliances | La casa | esborrany | pública | veda, mapa-de-valor, mobilitat |
| [`SOS/knowledge/vna/sectors/negoci.md`](vna/sectors/negoci.md) | model | direcció i estratègia, màrqueting, vendes | La casa | esborrany | pública | veda, mapa-de-valor, negoci |
| [`SOS/knowledge/vna/sectors/ocupacio.md`](vna/sectors/ocupacio.md) | model | persones, xarxa i aliances, vendes | La casa | esborrany | pública | veda, mapa-de-valor, ocupacio |
| [`SOS/knowledge/vna/sectors/producte_artesa.md`](vna/sectors/producte_artesa.md) | model | producció, vendes, màrqueting | La casa | esborrany | pública | veda, mapa-de-valor, producte-artesa |
| [`SOS/knowledge/vna/sectors/producte_digital.md`](vna/sectors/producte_digital.md) | model | sistemes i dades, màrqueting, operacions | La casa | esborrany | pública | veda, mapa-de-valor, producte-digital |
| [`SOS/knowledge/vna/sectors/servei_proximitat.md`](vna/sectors/servei_proximitat.md) | model | operacions, màrqueting, persones | La casa | esborrany | pública | veda, mapa-de-valor, servei-proximitat |
| [`SOS/knowledge/vna/sectors/servei_tecnic.md`](vna/sectors/servei_tecnic.md) | model | vendes, operacions, màrqueting | La casa | esborrany | pública | veda, mapa-de-valor, servei-tecnic |
| [`SOS/knowledge/vna/sectors/territori.md`](vna/sectors/territori.md) | model | operacions, xarxa i aliances, legal i compliment | La casa | esborrany | pública | veda, mapa-de-valor, territori |
| [`SOS/knowledge/vna/sectors/turisme.md`](vna/sectors/turisme.md) | model | màrqueting, vendes, xarxa i aliances | La casa | esborrany | pública | veda, mapa-de-valor, turisme |

**Etiquetes i el rol d'on pengen:** acollida → sense rol (1) · alimentacio → sense rol (1) · automatitzacio → sistemes i dades (1) · cultura → sense rol (1) · cura-social → sense rol (1) · cures → persones (1) · digitalitzacio → sense rol (1) · dinamitzacio-comercial → sense rol (1) · economia-circular → sense rol (1) · embut → vendes (1) · energia → sense rol (1) · equip-gestor → persones (1) · formacio → persones (2) · habitatge → sense rol (1) · joventut → sense rol (1) · kanban → operacions (1) · mapa-de-valor → direcció i estratègia (21) · mapa-viu → sistemes i dades (1) · menu → màrqueting (1) · mesura → lliure (1) · mobilitat → sense rol (1) · molekulon → xarxa i aliances (1) · negoci → sense rol (1) · ocupacio → sense rol (1) · portada → màrqueting (1) · producte-artesa → sense rol (1) · producte-digital → sense rol (1) · redireccions → sistemes i dades (1) · servei-proximitat → sense rol (1) · servei-tecnic → sense rol (1) · territori → xarxa i aliances (2) · turisme → sense rol (1) · veda → sense rol (21)

**Candidates: es repeteixen i no pengen de cap rol. Decideix a la folksonomia si pugen a un rol o queden lliures:** veda

---

*43 carpetes declarades · generat des de l'arbre, no escrit.*
