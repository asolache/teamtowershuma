# Backlog de desenvolupament SOS

Font única de veritat del desenvolupament. Cada PR mergejat es tanca; cada bloc pendent es prioritza.

## PRs mergejats (línia principal, més recents primer)

- **#57 · Xifratge multi-membre ECDH-P256** — envelope per membre, no cal passphrase compartida
- **#56 · Cerca global ⌘K + Onboarding tour** — palette + tour de benvinguda de 4 pantalles
- **#55 · Pings offer/demand descentralitzat** — matching cross-node
- **#54 · Guardian request UI** — observer demana ser Guardian; owner valida
- **#53 · Origen Comando (Mazinguer/Horacio) + Launcher global + backlog al codex**
- **#52 · Comando Molekulon view · cromos + protagonistes + director filter**
- **#51 · Fix iPad multi-select + top-20 curats + wallet passkey + multivers**
- **#50 · Veda V16 Seny/Rauxa/Castells + 3 posts blog + marketing base**
- **#48 · Home per perfils + blog intern comercial + terme "cremades" → "sobrecarregades"**
- **#47 · Federació Guardians UI (Penrose-√població + Gini)**
- **#46 · Sabiduria UI · propostes, vots signats, consell IA**
- **#45 · AI valuation assistant + arquetips vèdic/celta/andí/secular**
- **#44 · Intercooperació entre ventures (Mondragón)**
- **#43 · Kit narratiu Molekulon (UI)**
- **#42 · GitHub OAuth device flow + IA revisa PRs end-to-end**
- **#41 · 5 nous intents IA (molekulon_invite, narrative_kit, valuation, governance, pr_review)**
- **#40 · AES-GCM xifratge per node + passphrase wrap**
- **#39 · Simulador Impacte Catalunya**
- **#38 · Molekulon Shakti/Shiva + reputació verificable**
- **#37 · Guardians · federació Penrose (model)**
- **#36 · Oracle FMV + Valor del fons**
- **#35 · Sabiduria + rols + main canònic (model)**
- **#34 · Signing als ledger writes + integritat UI**
- **#33 · did:key + firma + cadena hash**
- **#32 · AI adapter DRY + codex V11-V15**

## Bloc pendent (prioritzat)

### Onada en curs · qualitat dels mapes + tauler com a lloc únic

**Fet:**
1. **Auditoria completa dels mapes precarregats** — les 36 definicions que sembren
   mapes (5 nivells territorials + 23 reptes, 11 dinàmiques, 14 activitats
   crítiques, 6 prototips). Resultat i llindars a
   `../vision/auditoria-mapes.md`. Salut mínima del sistema: 13/100 → **86/100**.
2. **DRY de la sembra** — forma canònica `pairs` i un únic `mapFlowsOf`, que fan
   servir els sis camins que creen mapes. Abans: quatre implementacions, quatre
   qualitats.
3. **Actuar sense navegar** — `NODE_ACTIONS` + `openQuickAct` + panell de xarxa al
   tauler: cercar qualsevol node de Catalunya i registrar-hi valor, donar d'alta
   gent, publicar oferta o obrir l'assemblea sense sortir del tauler.

4. **El bucle tancat** — pings a la fila del node i al panell d'accions, intercanvi
   tancat des del tauler, i **retorn visible** (`valueSnapshot` → `valueDelta` →
   `showValueReturn`) que diu què ha canviat i proposa el següent moviment.

6. **Ledger personal i registre públic cercable** — `ledgerIndex` com a font
   única, `openMyLedger` accessible des del tauler i del perfil, i
   `openPublicRegister` amb cerca en text lliure i **verificació criptogràfica
   real** de cada firma. Exportable a CSV/JSON i enllaçat amb l'ancoratge.

5. **La reputació compta tot el valor aportat** — `personProfile` recull les
   aportacions de tots els nodes i ventures, el diner entra com a hores
   equivalents i l'escala s'ha recalibrat (40/150/450/1100). Veda V23.

7. **Consolidació entre nivells sense doble comptatge** — `measure(nodeIds)` com a
   únic lloc on es compta valor territorial (apunts deduplicats per node ·
   venture · apunt), `consolidate` amb columnes `propi` / `agregat` / `total`
   mesurat, i `consolidateSet` que detecta els nodes **redundants** d'un conjunt
   qualsevol. Panell visible al Resum del territori i a les accions ràpides del
   tauler. Veda V24. Prerequisit resolt per a les federacions temàtiques.

**Següent, per ordre:**
1. **F1 de la MATRIU · acompanyament** (mentors, sessions al ledger, alertes
   d'abandó) — segueix sent la que fa que la MATRIU sigui un servei i no un
   repositori d'estructures.
2. **Federacions temàtiques** (model del.icio.us): vincular nodes a un tema,
   veure qui més l'ha etiquetat i consolidar-ne el valor amb `consolidateSet`.

### Onada actual — user acquisition + traction
1. **Landing/onboarding més agressiu** — crear vista/pantalla dedicada a captació d'usuaris amb funcionalitats crítiques de tracció (CTA directe a crear perfil, comptador de superherois viu, testimonis).
2. **Registre d'usuaris descentralitzat** — perfil accessible des de la web SOS única, integrant amb els sistemes ja disponibles (did:key + WebAuthn passkey + Nostr NIP-05).
3. **Superarmes al perfil superheroi** *(fet a l'onada actual — cromo mostra superpoders + superarmes)*.
4. **Gamification per nivells** *(fet — Aprenent/Bronze/Plata/Or/Llegenda + reptes per desbloquejar el següent)*.
5. **Transmedia enllaços** *(fet — SoundCloud, YouTube, Amazon, Instagram al modal Comando)*.
6. **Vista territorial resum + incentiu al terreny** *(fet — panell "Baixa al terreny" a país/provincia/comarca).

### Defectes trobats i encara oberts

- **`updateAtles` no és idempotent.** Cridar-la dues vegades seguides deixa un
  nombre d'entitats diferent (18 · 17 · 20 · 28 en quatre execucions), i el
  comportament és idèntic a `origin/main` — no és cap regressió, és un defecte
  de fons. `test-atles` ho detecta amb l'asserció «second pull changed count»,
  que porta temps vermella. Cal una clau d'identitat estable per entitat i que
  la segona passada no en creï de noves.
- **`ventureGraduates`** (`test-matriu`) — vermell també a `origin/main`.

### Backlog crític restant (del codex V17)
3. **Sign records via WebAuthn** (no només vinculació) — refactor de signRecord per acceptar signer alternatiu
4. **Ancoratge Nostr P1** — `wss://relay.damus.io` publicació de mainHash *(bloqueja: cal relés reachable)*
5. **Snapshot Arweave / IPFS+OTS** — notarització permanent opt-in *(bloqueja: xarxa/paga)*
6. **AI review PRs deep integration** — GitHub App webhook fluid *(bloqueja: infra externa)*
10. **Wallets W2 (Nostr NIP-07) / W3 (EIP-712)** *(bloqueja: providers)*

### Qualitative tests de l'app
- Playtest guidat: 5 persones fan el fluid onboarding + creació perfil + primer intercanvi + primera aportació signada; recollir friccions.
- A/B test del text de la home (fase llavor vs directe).
- Test de comprensió del cromo (una persona sense context: entén tier, superpoders, superarmes, level bar?).
- Test d'accessibilitat WCAG 2.1 AA (contrast, keyboard nav, screen reader).
- Test de rendiment amb 500 nodes + 5.000 apunts al ledger.
- Compatibilitat: iPad Safari, Android Chrome, Firefox desktop, Edge.

### MATRIU · pla de millora èpic
Auditoria completa, defectes corregits i 8 fases pendents a
**`../matriu/pla-millora.md`**. Com funciona avui: **`../matriu/guia-funcionament.md`**.

Ordre recomanat: **F1 acompanyament** (mentors + sessions al ledger + alertes
d'abandó) i **F3 riscos/bloquejos** primer — són les que fan que la MATRIU deixi
de ser un repositori d'estructures i passi a ser un servei. Després **F4 vista de
cohort**. La resta: F2 viabilitat econòmica · F5 finançament i tràmits ·
F6 formació lligada a l'etapa · F7 seguiment post-graduació · F8 evidències.

### Visió de fons · Catalunya com a estat líquid descentralitzat

Anotat com a horitzó del model, no com a feina d'una onada. És el marc que dona
sentit a la federació de nodes que ja hi ha implementada.

**La tesi.** Catalunya com a **estat líquid**: no una estructura fixa que
administra un territori, sinó una **federació de federacions** que es recompon
segons el que cal sostenir en cada moment. La cohesió no la dona l'aparell —
la dona una **cultura compartida**.

**Els valors.** Sintetitzats en **seny i rauxa**, i el lloc on aquests dos
conviuen sense contradicció és la **cultura castellera**: el càlcul i el risc a
la mateixa pinya. D'aquí surten els quatre valors que ja fem servir com a
criteri de decisió (Força · Equilibri · Valor · Seny) i el fet que el castell
sigui l'única metàfora del SOS que no és decorativa: descriu una estructura on
la base és més ampla que el cim i on ningú puja sense que algú el sostingui.

**Què hi ha ja construït que hi apunta**
- Nodes territorials encaixats (país → província → comarca → municipi → barri)
  que existeixen i funcionen per separat.
- Assemblea federativa amb pes **Penrose-√població i correcció de Gini**: un
  municipi petit no queda esborrat per un de gran.
- Governança per **sabiduria** (quòrum de guardians) i registre públic de
  decisions ancorable, que no depèn de cap servidor central.
- Sync **P2P** entre navegadors: la federació no necessita un node mestre.

**Què hi falta per sostenir la tesi** (no prioritzat, per pensar)
- **Adhesió i sortida explícites**: com un node entra i surt d'una federació
  sense trencar el que ja ha comptabilitzat. Un estat líquid sense dret de
  sortida és un estat sòlid amb bon màrqueting.
- **Federacions per tema, no només per territori** (energia, cures, habitatge):
  el mateix node dins de diverses federacions alhora. Vegeu el detall a sota —
  és la peça que fa que «líquid» vulgui dir alguna cosa operativa.
- **Subsidiarietat comptable**: quina decisió es pren a quin nivell, i com es
  resol el conflicte entre nivells sense recentralitzar.
- **Interoperabilitat entre federacions** que no comparteixen guardians: què és
  suficient per confiar en el mapa de valor d'algú altre.

#### Federacions temàtiques · el vincle és el tema, no el mapa

El que fa que l'estat sigui **líquid** no és la geografia: és que **et federes
quan et vincules a un tema**. El territori segueix sent un eix (i el que ja hi ha
construït), però deixa de ser l'únic.

**El model de referència és `del.icio.us`.** No pel producte —era un gestor
d'adreces— sinó pel mecanisme: **etiquetaves una cosa i, en fer-ho, apareixia la
gent que havia etiquetat el mateix**. Ningú havia de crear un grup, demanar
permís ni acceptar una invitació. El grup emergia de l'acte d'etiquetar. Tres
propietats que val la pena copiar tal qual:

1. **L'etiqueta és una declaració d'interès, no una categoria administrativa.**
   La posa qui participa, no un comitè de taxonomia.
2. **El descobriment és lateral**: de l'etiqueta a les persones, i de les
   persones a les seves altres etiquetes. Així es troba gent amb qui comparteixes
   coses que no sabies que compartíeu.
3. **Els grups es poden agrupar.** Una federació de temes és un tema. Aquesta
   recursivitat és exactament la mateixa que «federació de federacions», i és el
   que evita haver de decidir a priori quin és el nivell correcte.

**Com encaixa amb el que ja tenim**
- Les categories de skills, les tipologies d'objectes i els `dynamicType` ja són,
  de fet, etiquetes: avui serveixen per classificar, no per federar. El salt és
  fer que **etiquetar connecti**.
- Els pings ja fan matching lateral per categoria entre nodes diferents: és el
  mateix mecanisme, però limitat a oferta↔demanda. Generalitzar-lo a interessos.
- Els arquetips declarats del dossier són una etiqueta d'un altre ordre (com sóc,
  no què m'interessa): serveixen per compondre equips, no per federar.

**Decidit · tot valor aportat es comptabilitza, i el valor és el que defineix
el mapa de valor.**

Això tanca la pregunta que quedava oberta (si una federació temàtica és una
comunitat o només un filtre de cerca): **és una comunitat**, perquè té mapa i,
per tant, té comptes. I té una conseqüència de disseny que estalvia feina:

- **No cal cap primitiva nova.** Una federació temàtica és un node com qualsevol
  altre: metaskill + mapa de valor + ledger + governança. L'únic que canvia és
  què la lliga — un tema en comptes d'un límit administratiu.
- **El mapa de valor és l'esquema comptable, no la decoració.** El que compta com
  a valor en aquella federació és exactament el que els seus fluxos declaren.
  Dues federacions poden comptar coses diferents sense contradir-se, perquè
  cadascuna ha declarat el seu mapa.
- **Res queda fora per ser intangible.** Si un flux intangible és al mapa, és
  comptabilitzable: aquesta és la diferència entre reconèixer el treball
  invisible i només anomenar-lo.
- **La reciprocitat és auditable a qualsevol escala.** Els mateixos indicadors
  (`vnaAudit`) valen per a un banc de temps de barri i per a una federació de
  federacions, perquè la unitat d'anàlisi és sempre el mapa.

**El que continua obert**
- Qui pot crear una etiqueta i com s'eviten cent variants del mateix tema sense
  posar-hi un comitè. (Suggerència: fusió proposada, mai automàtica.)
- Com es consolida el valor entre nivells sense comptar-lo dues vegades: el
  `rollup` territorial ja ho fa cap amunt; una persona dins de tres federacions
  temàtiques necessita la mateixa regla.
- Com es fa visible la persona sense convertir-ho en una xarxa social d'exhibició:
  el SOS mostra el que has fet, no el que dius que t'agrada.
- Privadesa: quines etiquetes són públiques i quines es queden al dossier local.

**Font**: converses amb l'Àlvar. Cal desenvolupar-ho com a document de visió
propi quan toqui; aquí queda anotat perquè no es perdi.

### Idees a explorar (paraking lot)
- **Federated onboarding**: quan aparelles amb un altre dispositiu, importa el seu roster de superherois com a suggerència.
- **Comando digest setmanal** — email o notificació al Guardian amb la setmana del node.
- **Multi-idioma**: primer ES i EN sobre les entrades UI, després tot.
- **Export PDF del kit narratiu** per lliurar a comunitats.
- **Widget embeded** per posar la pinya del fons cooperatiu a webs municipals.
