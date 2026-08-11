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
| `test-fusio.mjs` | V64 | Que sincronitzar no destrueixi res: triple entrada, unió, i una cadena per autor |
| `test-canal.mjs` | V65 | El canal asíncron: que el repositori no doni veritat, i que sense clau no se'n tregui res |
| `test-rol-ux.mjs` | V66 | Que el rol decideixi per on comences — i sobretot, què NO s'amaga |
| `test-beta.mjs` | V67 | El rastre de la fusió, el camí per dir que s'ha trencat, i que designar no sigui custodiar |
| `test-patch.mjs` | V68 | El relé porta apunts signats: que no llegeixi, no inventi nodes ni coli apunts sense firma |
| `test-llengua.mjs` | V69 | La capa de segona llengua, i sobretot el pitjor cas: què surt quan no hi ha traducció |
| `test-home.mjs` | V70 | La home pel rol: què NO desapareix, i que sempre es pugui veure tot |
| `test-sortir.mjs` | V73 | Que se't pugui trobar: cada estat diu el motiu i el següent pas |
| `test-enllac.mjs` | V74 | Connectar el que penja de tu **sense doble comptatge** |
| `test-comando.mjs` | V77 | Que el relat sigui una capa: que es guanyi, i que apagar-lo no tregui res |
| `test-cromo.mjs` | V78 | Que un cromo **només** surti d'aportar, que el repetit no serveixi sol, i que bescanviar no en mogui cap |
| `test-certificat.mjs` | V79 · veda 84 | Intents de fer mentir un certificat: canviar-se el rol, inflar l'evidència, tornar a signar-ho tot, enganxar una confirmació falsa |
| `test-bomba.mjs` | V81 · veda 87 | Que d'un node aturat en surtin jugades amb botó, que no se n'inventi cap, i que qui s'ha despenjat no ho vegi qualsevol |
| `test-ambit.mjs` | V82 · veda 88 | Que la salutació deixi de portar el bastiment, i que estalviar **no perdi res** |
| `test-comarca.mjs` | V82 · E10 | L'escala de comarca amb números i sostres declarats — i què no mesura |
| `test-trobada.mjs` | V80 · veda 86 | Tres SOS de debò per WebRTC: dues sessions alhora, i que el que crea un arribi al tercer **sense fer voltes** |
| `test-vedes.mjs` | — | Que la pàgina dels vedes no perdi cap veda del codex pel camí, i que s'hi arribi per l'URL |
| `test-registre.mjs` | V72 | El registre públic: que surtin hashes i mai files, i que puguis demostrar que hi ets |

`relay-mock.mjs` és un WebSocket a pèl que respon com Supabase Realtime (join,
heartbeat, presència i broadcast). Guarda a `messages` tot el que li arriba, que
és com es comprova que qui allotja un relé **no pot llegir** el que hi passa.
Sense ell, del relé només es podria comprovar que l'URL es construeix bé —i això
no prova res.

`serve.mjs` és un servidor estàtic mínim per als tests que necessiten `http://`
(l'atles fa `fetch`, i `file://` el bloqueja). Els que el necessiten se
l'engeguen ells.

## Les guardes del CI

`check-kiss.js` i `check-i18n.js` no són tests de Playwright: corren a cada PR en
menys d'un segon i sense dependències, que és el que fa que mosseguin de debò.

### La guarda de KISS

Mesura pes, guies, duplicats i superfícies contra **sostres declarats**.

```bash
node SOS/tools/check-kiss.js
```

Per pujar un sostre: canvia el número al fitxer i explica per què al commit.
Aquesta fricció és tot el que fa, i és tota la seva utilitat.

### La guarda de la segona llengua

```bash
node SOS/tools/check-i18n.js
```

Compta el text català incrustat i les traduccions, i **no falla per cobertura
baixa**: la fa visible, que és el que evita que el deute creixi d'amagat. Falla
només pel que sí que és un error —una traducció buida, una que tradueix a si
mateixa, o una que apunta a text que ja no existeix al codi.

### La guarda de la pàgina dels vedes

```bash
node SOS/tools/build-vedes.js           # regenera SOS/vedes.html des del codex
node SOS/tools/build-vedes.js --check   # falla si s'ha quedat enrere
```

`SOS/vedes.html` **no s'edita**: es genera des de `SOS/knowledge/codex.md`, que
és l'original. Es guarda al repositori perquè el lloc és estàtic i sense passos
de construcció; el preu és que pot quedar-se enrere, i això és exactament el que
la guarda impedeix.

## Què no hi és

Els tests anteriors a aquesta branca segueixen fora del repositori. Els que es
van corregir pel camí —`test-atles*`, `test-dir`, `test-formacio`, `test-roles`,
`test-navbar`, `test-matriu-main`, `test-collab`— no s'han pogut moure aquí
perquè no formen part d'aquesta feina; queda com a pendent portar-los.

L'antic `test-home` d'aquella tanda **no és** el `test-home.mjs` d'aquí: aquell
comprovava que la portada pintés, i aquest que la portada sigui del rol de qui la
mira. Quan es porti l'altre caldrà un nom que els distingeixi.
