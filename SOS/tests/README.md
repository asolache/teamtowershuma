# Tests del SOS

Fins ara els tests vivien fora del repositori i es perdien amb la sessió. Aquí hi
ha els de la feina d'aquesta branca, perquè es puguin tornar a passar.

## Com passar-los

```bash
npm i -D playwright && npx playwright install chromium   # només el primer cop
node SOS/tests/run.mjs                # tots
node SOS/tests/run.mjs vistiplau      # només els que continguin «vistiplau»
node SOS/tests/test-missions.mjs      # un de sol, amb tot el detall
```

Obren `SOS/index.html` amb `file://` i comproven l'app de debò —no hi ha mocks
de l'aplicació— per mitjà del hook `window.__SOS`. La ruta es calcula des d'on és
el fitxer, així que funcionen a qualsevol clon.

## Què comprova cadascun

| Fitxer | Veda | Què hi busca |
|---|---|---|
| `test-copia.mjs` | V42 | Còpia de tot el SOS, xifrada o en clar, i què diu abans de descarregar |
| `test-vistiplau.mjs` | V43 | Que ningú escrigui al teu nom sense que hi diguis la teva |
| `test-pont.mjs` | V44 | El pont entre les taxonomies del banc de temps i la biblioteca |
| `test-circular.mjs` | V45 | Donació vs posada a disposició, valor per préstec, sessió de reparació |
| `test-rols.mjs` | V46 | Rols per context, deduïts de l'evidència, i la lent triable |
| `test-publica.mjs` | V47 | Que el paquet públic sigui agregat i no filtri res |
| `test-versions.mjs` | V48 | CID, pare, diferències i tornada enrere de les publicacions |
| `test-qr.mjs` | V49 | Lectura de QR, i que digui la veritat on no pot |
| `test-escala.mjs` | V50 | 500 nodes i 5.000 apunts, i accessibilitat |
| `test-missions.mjs` | V51 | La portada de missions |
| `test-matriu-f56.mjs` | V52 | Finançament, tràmits i formació per etapa |
| `test-matriu-f78.mjs` | V53 | Seguiment post-graduació i evidències |
| `test-model-pais.mjs` | V54 | Catalunya i Euskadi com a models editables, i que forkejar-los no els toqui |
| `test-fons.mjs` | V55 | El fons cooperatiu: verificat vs estimat, cobertura i cabina del país |
| `test-gent.mjs` | V56 · V57 | Rànquing recíproc, presència honesta i xat ancorat que no perd missatges |
| `test-rele.mjs` | V58 | El relé contra un servidor que parla el protocol: dos navegadors es veuen i es parlen |
| `test-identitat.mjs` | V59 | El `did` mana sobre el nom: ni fusiona homònims ni parteix ningú |
| `test-permaweb.mjs` | V60 · V61 | Oferta comuna amb sedàs d'entrada, i pont de claus que diu què no verifica |
| `test-kiss.mjs` | V62 · V63 | Que de cap portada es quedi ningú atrapat, cap pestanya sense guia, el llançador agrupat i la feina que no és de ningú |

`relay-mock.mjs` és un WebSocket a pèl que respon com Supabase Realtime (join,
heartbeat, presència i broadcast). Sense ell, del relé només es podria comprovar
que l'URL es construeix bé —i això no prova res.

`serve.mjs` és un servidor estàtic mínim per als tests que necessiten `http://`
(l'atles fa `fetch`, i `file://` el bloqueja). Els que el necessiten se
l'engeguen ells.

## La guarda de KISS

`SOS/tools/check-kiss.js` no és un test de Playwright: corre al CI a cada PR, en
menys d'un segon i sense dependències. Mesura pes, guies, duplicats i
superfícies contra **sostres declarats**.

```bash
node SOS/tools/check-kiss.js
```

Per pujar un sostre: canvia el número al fitxer i explica per què al commit.
Aquesta fricció és tot el que fa, i és tota la seva utilitat.

## Què no hi és

Els tests anteriors a aquesta branca segueixen fora del repositori. Els que es
van corregir pel camí —`test-atles*`, `test-dir`, `test-formacio`, `test-home`,
`test-roles`, `test-navbar`, `test-matriu-main`, `test-collab`— no s'han pogut
moure aquí perquè no formen part d'aquesta feina; queda com a pendent portar-los.
