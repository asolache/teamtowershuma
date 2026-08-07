# Revisió UX del SOS · el flux de valor cap al fons cooperatiu

> Revisió completa de l'app contra una tesi concreta: **Catalunya com a primera
> xarxa de valor que arriba a constituir el fons cooperatiu més gran del món**, i
> el cas Catalunya com a **model editable** perquè qui vulgui fer-ho al seu país
> el pugui forkejar.

Aquesta no és una revisió d'estètica. La pregunta que es fa a cada pantalla és
una sola: **aquesta vista fa avançar el flux de valor cap al fons, o el frena?**

> Les referències `index.html:NNN` són de l'estat del fitxer **quan es va fer la
> revisió**, abans de tocar res. Serveixen com a prova del que s'hi va trobar,
> no com a mapa del codi d'ara. L'estat d'implementació és a la secció 5.

---

## 0 · La contradicció de fons

El SOS diu tres coses a la seva pròpia documentació:

1. El model és **replicable** — «qualsevol comunitat pot fer-ho».
2. La destinació és el **fons cooperatiu** — `FOUNDER_MAP.kpis` posa xifra i any:
   30 M €/any el 2030.
3. Catalunya és el **primer cas**, no l'únic.

L'app, en canvi, fa tres coses diferents:

1. Catalunya no és un cas: està **soldada al codi** en sis llocs.
2. El fons cooperatiu **no té pantalla**. Existeix com a funció, i només dins
   d'un node MATRIU.
3. Crear un segon país porta a un node buit amb els noms de l'administració
   catalana i un mapa de valor que parla de la Generalitat.

Les tres es poden arreglar. Les dues primeres són les que decideixen si la tesi
és demostrable o només narrada.

---

## 1 · El fons cooperatiu no té porta d'entrada

### 1.1 · El número que ho justifica tot no surt enlloc

`fundValue(node)` (index.html:2659) i `fundRollup(node)` (:2607) calculen el
valor mobilitzat amb desglossament i rang d'incertesa. És bona feina i està ben
feta: separa el que és ledger real del que és estimació de l'oracle.

Però només es dibuixa en un lloc — `'🏦 Fons cooperatiu · valor mobilitzat'`
(:9115) — **dins la pestanya Ecosistema d'un node MATRIU**. Tres clics des de la
portada, i només si aquell node existeix.

Conseqüència directa: una persona pot fer servir el SOS durant setmanes sense
veure mai la xifra que dona sentit a tot el que hi aporta. El registre d'hores
demana esforç i no ensenya cap a on va.

### 1.2 · El fons està lligat a la MATRIU, no al territori

`fundValue` recorre `venturesOf(node)` i `linksOf(node)`. Sense MATRIU no hi ha
fons — encara que el territori tingui tres bancs de temps i dues biblioteques
movent hores i objectes cada setmana. El múscul real del territori no compta.

`renderResum` ho diu literalment al hero d'un territori
(«Aquest és el múscul del fons cooperatiu local», :6805) i acte seguit ensenya
hores i euros **sense valorar-los** ni acumular-los enlloc.

### 1.3 · La projecció i la realitat no es toquen

`FOUNDER_MAP.kpis` (:5016) porta la fila «Fons cooperatius mobilitzats (€/any):
base 0 · 2026 50k · 2030 30M». És una taula estàtica dins d'un modal. **No es
compara mai amb el que el ledger diu de debò.** L'única pregunta que un
finançador farà —«on sou ara respecte del que vau prometre?»— no té resposta a
l'app.

### 1.4 · No hi ha ruta

`MODAL_ROUTES` (:7675) té catorze entrades: comando, activitat, ledger,
registre, federacions, aprop, coordenades, ancoratges, mapa, directori,
identitat, multivers, pings, mentoria. **Cap és el fons.** No es pot enllaçar,
ni compartir, ni obrir des d'un QR, ni ensenyar a una reunió d'ajuntament.

---

## 2 · Catalunya està soldada; no és un model

Sis punts de codi fan impossible crear un segon país sense tocar el fitxer:

| # | On | Què hi ha soldat |
|---|---|---|
| 1 | `LEVEL_META` :896-901 | `província · comarca · municipi · barri` com a **únics** nivells possibles, amb exemples catalans com a placeholder |
| 2 | `LEVEL_KNOWLEDGE.pais.roles` :997 | El mapa de valor de **qualsevol** país neix amb `Generalitat · Diputacions · Consells comarcals` |
| 3 | `ENTITY_TYPES` :1722-1725 | Els tipus d'entitat per nivell són `Diputació`, `Consell Comarcal`, `Ajuntament` |
| 4 | `CAT_GEO` :909 | Constant global única. No hi ha lloc on posar la geografia d'un segon país |
| 5 | `resolveChainFromMunicipi` / `resolveChainFromComarca` :12403-12411 | Retornen `pais:'Catalunya'` **literal** |
| 6 | `loadCatalunyaSkeleton()` :12388 | Funció d'un sol país. L'onboarding hi porta amb el text «Explora Catalunya» (:826) |

### 2.1 · Què passa avui si algú vol crear Euskadi

El botó existeix: `#btnNewRoot` → `openCreateModal(null)` (:12502). El recorregut
real és aquest:

1. S'obre el wizard amb `level='pais'` i el placeholder **«p.ex. Catalunya»**.
2. L'autocompletar (`geoFor('pais')`) ofereix **una sola opció: Catalunya**.
3. Els reptes suggerits i el mapa de valor surten de `LEVEL_KNOWLEDGE.pais` →
   el mapa d'Euskadi neix amb un rol anomenat **«Generalitat»** i un altre
   **«Consells comarcals»**.
4. El node es crea **buit**: sense esquelet territorial, sense fons, sense res.
5. Quan hi afegeixi fills, el sistema els dirà **«província»** i després
   **«comarca»**, que a Euskadi no són les divisions que la gent fa servir.

Res d'això és un error de programació: tot funciona. És un **error de model** —
es va escriure un cas particular al lloc on hauria d'haver-hi una plantilla.

### 2.2 · El cas Catalunya no es pot llegir com a exemple

Encara que algú volgués copiar el que s'ha fet a Catalunya, **no hi ha res a
copiar**: no existeix l'objecte «model de país». La feina feta (44 comarques, 4
províncies, mapes de valor per nivell, tipus d'entitat, reptes) viu escampada en
constants del fitxer, no en una cosa que es pugui obrir, llegir, forkejar ni
exportar.

Un cas d'ús que no es pot obrir no és un cas d'ús. És documentació.

---

## 3 · El flux de valor, pantalla per pantalla

### 3.1 · La portada reparteix atenció en comptes de dirigir-la

`renderResum` d'un territori (:6796 endavant) mostra, en aquest ordre:

1. Hero amb la fase del territori
2. **Projectes core** (SOS + Comando + Fundació) — els mateixos a país,
   província, comarca i municipi
3. **Sis targetes de rol** amb cinc passos cadascuna → **30 passos possibles**

Trenta camins és cap camí. I les targetes són **idèntiques** al país i al barri,
quan el que toca fer en un país (federar, obrir dades, negociar amb la
Generalitat) i en un barri (buscar deu veïns) no té res a veure.

### 3.2 · El resum del país no és el resum d'un país

Un node `pais` amb 44 comarques a sota ensenya exactament la mateixa vista que
un barri: mateixes pestanyes, mateixes targetes de rol, mateix mapa de valor
editable. El que un país necessita —quantes comarques estan vives, quantes
mortes, on és el forat, quant fons acumula la xarxa sencera— no hi és.

`consolidate()` (:6741) ja fa la part difícil i la fa **bé**: separa propi
d'agregat i no els suma a mà. La feina està feta i no s'ensenya on més importa.

### 3.3 · Missions és personal; no hi ha missió de xarxa

`missions()` (V51) ordena bé el que **em** toca a mi: vistiplaus, retorns,
silencis. Però la xarxa també té feina pendent que no és de ningú en particular:
«tres comarques sense cap dinàmica», «la meitat del territori sense cap guardià».
Avui això no ho veu ningú, i per tant no ho fa ningú.

### 3.4 · Coses que ja funcionen bé i no s'han de tocar

Val la pena dir-ho perquè la revisió no sembli una llista de retrets:

- **La guia contextual** (`CONTEXT_GUIDES` + `buildContextGuide`) resol de debò
  el problema d'endevinar. Els passos es comproven contra el node, no es cliquen.
- **La consolidació propi/agregat** és honesta i poca gent ho fa bé.
- **El vistiplau** (V43) i el **pendent de confirmació** són la peça que fa que
  el registre sigui creïble.
- **L'oracle** marca sempre què és estimació i què és ledger. No s'ha de perdre
  això en fer el comptador del fons més gran.

---

## 4 · El disseny proposat

### 4.1 · Un objecte nou: el model de país

Introduir `COUNTRY_MODELS`, un registre de **plantilles de país** amb Catalunya
com a primera entrada, i moure-hi el que avui està escampat:

```
{ id:'catalunya', name:'Catalunya', flag:'🏴',
  levels:[ {id:'pais',label:'País'}, {id:'provincia',label:'Província'},
           {id:'comarca',label:'Comarca'}, {id:'municipi',label:'Municipi'},
           {id:'barri',label:'Barri'} ],
  geo:CAT_GEO,                    // el catàleg territorial d'aquest país
  institutions:{...},             // rols del mapa de valor per nivell
  entityTypes:{...},              // tipus d'entitat per nivell
  source:'Idescat · divisió administrativa' }
```

Regles que el fan un model i no una segona constant soldada:

- **Els nivells són dades, no codi.** `LEVEL_META` passa a derivar-se del model
  del país arrel de cada node. Qui crea Euskadi renombra `província→herrialdea` i
  l'app ho fa servir a tot arreu: arbre, breadcrumbs, wizard, botons.
- **Entre 2 i 6 nivells.** Un país petit no necessita cinc; un de federal en pot
  voler més.
- **Catalunya és de només lectura, forkejable.** Obrir-la ensenya el model
  sencer; el botó «Fes-ne el meu país» en fa una còpia editable amb un id nou.
  Ningú toca el cas de referència sense voler.

### 4.2 · L'assistent «crea el teu país» com a cas d'ús real

Substituir l'actual `openCreateModal(null)` per un recorregut de quatre passos
que **acaba amb un país viu**, no amb un node buit:

1. **Model de partida** — Catalunya (referència) · un model ja creat · des de
   zero. El text diu què aporta cadascun.
2. **Nivells** — la llista del model, renombrable i retallable, amb un exemple
   viu a sota de cada nom.
3. **Esquelet** — enganxar la divisió territorial (CSV o llista) o començar amb
   una sola regió. Es diu quantes s'han creat abans de crear-les.
4. **Institucions** — els rols del mapa de valor del país, precarregats del
   model i editables abans de sembrar-los.

El pas 4 és el que impedeix que Euskadi neixi parlant de la Generalitat.

### 4.3 · El fons cooperatiu com a pantalla, no com a funció

Nova ruta **`#/fons`**, enllaçable i compartible, amb tres capes en aquest ordre:

1. **Verificat** — el que hi ha signat i encadenat: € reals i hores confirmades.
   És la xifra que encapçala, perquè és la que aguanta una auditoria.
2. **Mobilitzat (estimat)** — just a sota, com a rang, amb la font a la vista:
   hores × FMV, objectes, talent. `fundValue` ja ho retorna així; només cal
   ensenyar-ho sense barrejar-ho amb el de dalt.
3. **Respecte del pla** — la fila de `FOUNDER_MAP.kpis` de l'any en curs al
   costat del real. Si anem endarrerits, que ho digui.

Amb el desglossament per territori i per dinàmica a sota, perquè la pregunta
següent («d'on surt?») tingui resposta al mateix lloc.

**Canvi de model necessari:** `fundValue` ha de deixar de dependre de
`venturesOf`. El fons d'un territori és el de **tot el que hi ha a sota** —
bancs de temps, biblioteques, MATRIUs i ventures— fent servir `scopeIds` i
`measure`, que ja existeixen i ja saben no duplicar.

### 4.4 · La cabina del país

Quan el node actiu és un `pais`, la pestanya Resum canvia de contingut (no
d'estructura):

- Fons de la xarxa a dalt, amb la variació del mes.
- **Cobertura**: quantes regions tenen almenys una dinàmica viva i quantes cap.
  Aquesta és la xifra que fa moure gent, i avui no existeix.
- Les tres regions que més creixen i les tres més aturades, amb enllaç directe.
- El model de país que fa servir, amb accés a editar-lo.

Les targetes de rol es queden, però al nivell on serveixen (municipi i barri).

---

## 5 · Ordre d'implementació

Criteri: primer el que desbloqueja la tesi, després el que la fa visible, i cap
pas deixa l'app en un estat pitjor que l'anterior.

| # | Què | Estat |
|---|---|---|
| **1** | `COUNTRY_MODELS` + nivells derivats del model + Catalunya migrada sense canvi visible | **Fet · V54** |
| **2** | Assistent «crea el teu país» amb fork de Catalunya | **Fet · V54** |
| **3** | `#/fons` amb verificat / estimat / pla, i el fons deslligat de la MATRIU | **Fet · V55** |
| **4** | Cabina del país: cobertura, creixement, forats | **Fet · V55** |
| **5** | Missions de xarxa al costat de les personals | Pendent — `countryCoverage` ja calcula la dada; falta convertir-la en missions |

Pel camí va sortir un defecte que no estava a la llista i que valia la pena
arreglar abans que res: **un objecte valia hores**. V45 va afegir el tipus
d'apunt `objecte` amb el valor en euros, però `measure()` —que alimenta cada
roll-up i cada panell de consolidació—, el total «Temps aportat» del ledger i la
taula de projectes del dashboard seguien assumint «el que no és moneda són
hores». Cada préstec d'una biblioteca inflava les hores del territori amb un
import en €. Corregit als tres llocs, amb `objectes` com a calaix propi.

### Compatibilitat

El pas 1 no pot trencar cap SOS existent. Els nodes que ja hi ha **no tenen**
`model`, i han de continuar funcionant: si un node arrel no en declara cap,
s'assumeix `catalunya`. Això es prova amb una còpia de seguretat feta abans del
canvi i restaurada després.

### Com es verifica

- Crear un país amb el model Catalunya → 4 províncies i 44 comarques, i els
  nivells es diuen com sempre.
- Forkejar-lo, renombrar `província→herrialdea`, retallar a 4 nivells → l'arbre,
  els breadcrumbs i el wizard ho diuen així, i Catalunya **no** ha canviat.
- Un país nou amb institucions editades → cap rol del mapa de valor diu
  «Generalitat».
- `#/fons` en un SOS amb banc de temps i biblioteca però **sense MATRIU** → la
  xifra no és zero.
- Verificat ≤ mobilitzat, sempre, i cap € del ledger comptat dues vegades quan
  el mateix territori té MATRIU i dinàmiques a sota.
- Restaurar una còpia anterior al canvi → tot funciona sense tocar res.

---

## 6 · El que aquesta revisió no resol

- **Que el fons sigui gran.** L'app pot fer-lo visible, comptable i comparable
  amb el pla. Fer-lo créixer és feina de fora de la pantalla.
- **Que les xifres siguin auditables per tercers.** Fa falta l'ancoratge extern
  (Nostr/permaweb), que segueix bloquejat per dependències de tercers.
- **La divisió territorial de cap país que no sigui Catalunya.** El model
  permetrà carregar-la; algú l'haurà d'aportar.
