# Mapa del repositori

> **Generat per `SOS/tools/build-mapa.js`. No l'editis a mà.**
> Les cares es declaren a [`taxonomia.md`](taxonomia.md); això és el que en
> surt en creuar-les amb l'arbre de debò. Si el mapa i l'arbre divergeixen, el
> CI peta — un mapa desactualitzat és pitjor que cap mapa.

Comença per aquí, després [`codex.md`](codex.md) (la llei) i després
[`for-ai/README.md`](for-ai/README.md) (el contracte de treball).

## obra

La cosa mateixa: el que fa servir la gent. Una sola font de veritat per cada cosa.

| carpeta | què hi entra | fitxers |
|---|---|---|
| `SOS/` | L'aplicació i tot el que se serveix: una pàgina per cosa, autocontingudes | 155 · 13522 KB |
| `SOS/atles/` | Dades geogràfiques i institucionals del territori | 5 · 15 KB |
| `SOS/canal/` | Paquets de canal per tema, xifrats | 2 · 2 KB |
| `SOS/media/` | Imatges i material que serveixen les pàgines | 1 · 9207 KB |
| `SOS/registre/` | El registre públic: hashes, totals i altes. Mai files | 2 · 7 KB |
| `SOS/sql/` | Esquema de la part opcional amb servidor | 1 · 5 KB |
| `SOS/supply/` | L'oferta comuna publicada, passada pel sedàs | 2 · 2 KB |
| `netlify/` | Funcions d'edge del web públic | 1 · 3 KB |

## prova

El que comprova que l'obra compleix la llei. Ha de petar quan toca, i només llavors.

| carpeta | què hi entra | fitxers |
|---|---|---|
| `.github/` | El CI: quines guardes corren i en quin ordre | 4 · 16 KB |
| `SOS/tests/` | Playwright contra les pàgines de debò, per `file://` | 72 · 788 KB |
| `SOS/tools/` | Les guardes que peten al CI quan una promesa deixa de ser certa | 22 · 242 KB |

## saber

El que sabem i encara no és obra. Es cita, no es copia.

| carpeta | què hi entra | fitxers |
|---|---|---|
| `SOS/knowledge/` | El que sabem: llei, referents, visió, negoci i aquest mapa | 22 · 482 KB |
| `SOS/knowledge/dev/` | El backlog i la guia d'estil per a qui hi escriu | 2 · 67 KB |
| `SOS/knowledge/for-ai/` | El contracte de treball per a una IA que hi contribueix | 1 · 5 KB |
| `SOS/knowledge/marketing/` | Veu de marca i material de difusió | 2 · 11 KB |
| `SOS/knowledge/matriu/` | El model de la MATRIU: com funciona i com es millora | 2 · 22 KB |
| `SOS/knowledge/negoci/` | Model d'equip gestor, formació i mentoria | 2 · 27 KB |
| `SOS/knowledge/references/` | Els referents conceptuals, citats i no copiats | 2 · 9 KB |
| `SOS/knowledge/vision/` | Decisions d'arquitectura vives i auditories fetes | 8 · 79 KB |
| `SOS/prompts/` | Un fitxer per intent d'IA: el que se li demana, versionat | 8 · 8 KB |

## arxiu

El que va ser. Es conserva; **no es llegeix com a present**.

| carpeta | què hi entra | fitxers |
|---|---|---|
| `data/` | Llavors de dades d'una versió anterior | 2 · 2 KB |
| `ia/` | Prototip d'app amb IA, servit encara per `_redirects` | 60 · 1312 KB |
| `js/` | Codi solt d'abans que tot fos autocontingut | 2 · 3 KB |
| `knowledge-base/` | Mòduls de coneixement d'una versió anterior | 2 · 5 KB |
| `v2/` | Versió anterior de l'app | 6 · 147 KB |
| `v3/` | Versió anterior de l'app | 56 · 218 KB |
| `v4/` | Versió anterior de l'app | 54 · 623 KB |
| `v5/` | Versió anterior de l'app | 27 · 611 KB |
| `v6/` | Versió anterior de l'app | 28 · 670 KB |
| `v7/` | Versió anterior de l'app | 28 · 663 KB |
| `v8/` | Versió anterior de l'app | 37 · 701 KB |
| `v9/` | Versió anterior de l'app, servida encara per `_redirects` | 48 · 834 KB |

## arrel · pàgines soltes

24 pàgines HTML a l'arrel del repositori (`app.html`, `app_coops.html`, `clients.html`, `colla.html`…).
Són **arxiu**: el web anterior a `SOS/`, encara servit per `_redirects`.
No són referència de com es fan les coses ara.

---

*32 carpetes declarades · generat des de l'arbre, no escrit.*
