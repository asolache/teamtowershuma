# Molekulon · Molekulandia com a estat líquid

> Decisió d'arquitectura i disseny del món. Escrita el 2026-09-16, després de
> fer-ho: cada xifra d'aquest document surt de `SOS/tools/build-molekulon.js`,
> que la calcula del model i no de la memòria.

---

## L'encàrrec

> «Quiero que molekulon tenga una url propia y que se desarrolle como fork de
> sos para mostrar un caso de uso con molekulandia como estado líquido.»

Tres coses: **una URL**, **un fork**, i **un cas d'ús**.

---

## 1 · El fork és del model, no del codi

És l'única decisió d'aquesta tanda que no es pot canviar d'opinió barat, i per
això va la primera.

**Un fork de codi** hauria estat copiar `SOS/index.html` —1,6 MB, 497 KB en
gzip— a un segon fitxer i pintar-lo d'un altre color. Els quatre problemes que
això porta no són hipotètics:

| | Fork de codi | Fork de model |
|---|---|---|
| **Divergència** | La còpia s'endarrereix la primera setmana i no torna mai | Tot el que millori al SOS, Molekulandia ho té el mateix dia |
| **Registre** | Dos registres i dues identitats: un apunt d'un costat no val a l'altre | Un sol registre, unes soles vedes |
| **Guardes** | Les 30 guardes del repositori, duplicades — i la còpia sense mantenir | Les de sempre, i una de nova |
| **L'argument** | Demostraria que per canviar de món cal canviar el programa | Demostra que el món és una dada |

L'últim és el que decideix. El SOS defensa que **el territori és configuració**,
i ja en tenia el mecanisme muntat: `BUILTIN_MODELS`, `forkModel`,
`loadModelSkeleton(model, rootName, rootNode)`, `geoFor`, `mapDefFor`. Existien
per a Catalunya i Euskadi. Molekulandia s'hi posa com a tercer, i **no s'ha
escrit cap funció nova a l'aplicació**: s'han declarat tres constants.

Un fork de codi hauria estat la prova del contrari del que el projecte diu.

---

## 2 · El disseny del món

### Els nivells: els mateixos cinc, reetiquetats

`BASE_LEVELS` és `['pais','provincia','comarca','municipi','barri']` i
Molekulandia **no se n'inventa cap**. Un model reetiqueta amb `label` i manté
els `id`:

| id del SOS | A un estat sòlid | A Molekulandia | Què hi ha de debò |
|---|---|---|---|
| `pais` | País | **Món** | El món sencer. Un de sol. |
| `provincia` | Província | **Federació** | Un tema que algú sosté. No té fronteres. |
| `comarca` | Comarca | **Casa** | Un edifici del poble. On passa la cosa. |
| `municipi` | Municipi | **Colla** | La gent que manté una casa oberta. |
| `barri` | Barri | **Taula** | Un projecte, una compra, una setmana. |

**Per què els `id` no canvien.** Perquè un apunt d'hores de Molekulandia i un de
Terrassa han de ser el mateix tipus d'apunt. Si el model inventés un nivell,
`consolidate`, `rollup`, `subtreeIds` i `ancestors` haurien de saber-ne —i el
registre s'hauria de partir en dos. La guarda 5 de `build-molekulon.js` ho
vigila explícitament, perquè un nivell nou no petaria fins molt més tard.

### La peça del mig: un tema, no un tros de terra

Aquesta és la definició operativa d'«estat líquid», i no és una metàfora:

1. **Et vincules a un tema, no a una adreça.** A un estat sòlid el lloc te'l
   dona el padró. Aquí te'l dona el que sostens.
2. **Un nivell buit desapareix.** Una comarca sense ningú segueix sent una
   comarca. Una federació sense ningú no és res.
3. **Els temes se solapen.** Ser a dues federacions alhora és el cas normal; en
   un estat sòlid, viure a dos municipis és un error de dades.

El SOS ja tenia la peça: les **federacions temàtiques** (`themeFederation`,
`themeNeighbours`, `openFederations`), que agrupen nodes pel que fan i no per on
són. Molekulandia no les inventa — **les posa al mig del model** en comptes de
al costat.

### Les set federacions i les onze cases

Els noms no s'han inventat: les onze cases són **els onze edificis del poble**
que ja hi havia a `SOS/molekulandia.html`, declarats a `build-molekulandia.js`.
Les set federacions són el tema que sosté cadascuna.

| Federació | Cases |
|---|---|
| Les Cures | El bar, El casal |
| Les Coses | La ferreteria, El magatzem |
| L'Aliment | El mercat |
| L'Energia | La central |
| El Sostre | Les cases |
| La Feina | El taller, El viver |
| El Saber | L'arxiu, La sala de plànols |

### Els rols són funcions, no càrrecs

Els tres mapes de valor (`MOL_MAPS`, nivells `pais`, `provincia` i `comarca`)
no anomenen cap càrrec. «Qui obre la casa» i no «director»; «qui confirma» i no
«tresorer». En un estat líquid no hi ha institucions permanents: hi ha
**funcions que algú fa mentre les fa**, i el dia que ho faci un altre el mapa no
s'ha de reescriure.

### El que el model deliberadament no porta

**Cap catàleg de colles ni de taules.** Els dos nivells de baix són buits a
`MOL_GEO`, i és a posta: una llista tancada de colles seria estructura sòlida
entrant per la porta del darrere. Les colles les fa qui s'hi posa.

---

## 3 · La demostració, en nodes

`skeletonSize(model)` és arrel + nivell 1 + nivell 2: els nodes que es creen el
primer dia, abans que hi hagi cap persona, cap hora i cap objecte.

| Món | Estat | Nivell del mig | Nodes en néixer |
|---|---|---|---|
| Catalunya | Sòlid | Comarca | **47** |
| Euskadi | Sòlid | Eskualdea | **25** |
| Molekulandia | **Líquid** | Federació | **19** |

**47 contra 19.** Obrir Catalunya crea 46 territoris que existeixen perquè
existeixen. Obrir Molekulandia en crea 18, i cap és un tros de terra: són 7
temes i 11 cases. La resta del món **no existeix fins que algú s'hi posa**.

Cap dels dos és millor. Un estat sòlid serveix per administrar el que ja està
repartit; un de líquid, per al que encara s'ha de sostenir. El que no es pot fer
és dibuixar-ne un de sòlid i esperar-ne comportament líquid — que és el que
passa cada vegada que es crea una estructura i després es busca qui la vulgui.

---

## 4 · La URL

`/molekulon` → `SOS/molekulon.html`, amb les tres variants de sempre
(`/molekulon`, `/sos/molekulon`, `/SOS/molekulon`), perquè qui l'escriu de
memòria l'encerti. S'hi han afegit també les tres de `/molekulandia`, que
existia com a pàgina i no tenia adreça curta.

**El subdomini és el pas que jo no puc fer.** `molekulon.teamtowershuma.com`
necessita dues coses que viuen fora del repositori:

1. Un **domain alias** a Netlify per al lloc (Site settings → Domain management
   → Add domain alias).
2. Un registre **CNAME** `molekulon` → el domini de Netlify del lloc, al
   proveïdor de DNS de `teamtowershuma.com`.

Amb això, `molekulon.teamtowershuma.com` serviria la mateixa portada del lloc i
caldria una regla més a `_redirects` per portar l'arrel d'aquest amfitrió a
`/SOS/molekulon.html`. Mentre no hi sigui, **l'adreça canònica és
`/molekulon`**, que ja funciona i ja és curta — i la pàgina ho diu, en comptes
de prometre un subdomini que no respon.

---

## 5 · Què vigila la guarda

`node SOS/tools/build-molekulon.js --check`, guarda 31 del CI. Vuit regles, i
cadascuna tapa una manera concreta que això es podria podrir sense petar:

1. **Cap casa òrfena** — tota casa penja d'una federació que existeix.
2. **Cap federació buida** — un tema sense cap casa és un titular, no un nivell.
3. **Cap intercanvi amb un rol fantasma** — tot rol citat en una fletxa és a la
   llista de rols del seu nivell.
4. **Cap rol sense cap fletxa** — un rol que no dona ni rep res no fa res. És la
   mateixa classe de defecte que `check-vna.js` va trobar al mapa casteller.
5. **Els cinc nivells del SOS, en ordre** — un nivell inventat trencaria la
   consolidació i no petaria fins molt més tard.
6. **La tesi ha de ser certa** — si un dia l'esquelet líquid deixa de ser el més
   petit, la pàgina estaria dient una cosa falsa amb números.
7. **Cap porta a un fitxer que no hi és** — les 9 eines citades s'obren.
8. **Les cases són edificis declarats del poble** — si `build-molekulandia.js`
   rebateja un edifici, aquí peta en comptes de quedar-se sense icona.

I els cinc blocs de la pàgina (`MK-ESQUELET`, `MK-NIVELLS`, `MK-FEDERACIONS`,
`MK-CASES`, `MK-MAPES`) es comparen amb el que surt del model: si algú els
edita a mà, el CI ho diu.

---

## 6 · El que Molekulon serveix, i el que no

**Serveix per a tres coses**, i les tres justifiquen tenir un món de mentida
dins d'una eina de veritat:

- **Ensenyar el SOS sense dades de ningú.** A una formació o a una aula es pot
  fer tot el recorregut —mapa de valor, apunts, vistiplaus, registre— sense que
  ningú hi posi el seu nom.
- **Provar un model abans d'aplicar-lo.** Una federació temàtica és difícil de
  desfer en un territori real; aquí es munta, es mira i es llença.
- **Mostrar que el model és una dada.** Si un món de ficció hi cap sense tocar
  el codi, un país que no sigui Catalunya també.

**No serveix** com a registre de res. És ficció i el model ho diu al camp
`source`. El que no s'hi ha de fer és apuntar-hi hores reals de gent real i
esperar que valguin com a prova enlloc.

---

## 7 · Cost

`SOS/index.html` passa de 495 a **497 KB en gzip**, un 97 % del sostre de 510.
El model hi cap sense apujar cap sostre de `check-kiss.js` i sense afegir cap
ruta modal —`#/paisos` ja existia i és la porta—, o sigui que el comptador de
`MAX_MODAL_ROUTES` es queda on era. Un món nou ha costat tres constants de
dades i cap superfície nova, que és exactament el que havia de costar.
