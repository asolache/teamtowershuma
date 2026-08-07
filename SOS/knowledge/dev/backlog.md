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

### Ordre recomanat · la meva prioritització

**Criteri**, dit abans de la llista perquè es pugui discutir l'ordre sense
discutir cada punt: (1) primer el que **avui impedeix que el SOS el faci servir
més d'una persona**; (2) després el que fa que **el valor comptat sigui just**,
perquè comptar malament durant mesos no es pot corregir després; (3) després **la
cara pública**, que és la que dona tracció però és **irreversible**; (4) al final
el que **depèn de tercers** (relés, trackers, proveïdors), que no pot ser mai el
camí crític d'una eina que ha de funcionar sense xarxa.

---

**P0 · Revisió UX del flux de valor cap al fons** — feta i implementada

La revisió completa és a `SOS/knowledge/vision/review-ux-flux-de-valor.md`. Va
sortir de tres coses que el SOS deia i l'app no feia: que el model és replicable,
que la destinació és el fons cooperatiu, i que Catalunya és el primer cas i no
l'únic.

1. ~~**Catalunya soldada al codi**~~ · **fet (V54)**. Era un cas particular al
   lloc d'una plantilla, en sis punts: nivells, institucions del mapa de valor,
   tipus d'entitat, catàleg geogràfic, resolutors de cadena amb `pais:'Catalunya'`
   literal, i un esquelet d'un sol país. Ara hi ha `COUNTRY_MODELS` amb Catalunya
   com a referència de només lectura, forkejable; els nivells són dades
   (renombrables i retallables) però els seus ids no canvien mai; i l'assistent
   «crea el teu país» deixa un país viu en comptes d'un node buit.
2. ~~**El fons no tenia porta**~~ · **fet (V55)**. Ruta `#/fons` enllaçable, amb
   verificat (signat, hores en hores) separat de l'estimació de l'oracle (amb
   rang i font), comparació amb la fita del pla fundador sense interpolar, i
   desglossament per dinàmica i per node. `networkFund` ja no depèn de la MATRIU:
   un territori amb bancs de temps i biblioteques té fons.
3. ~~**El país ensenyava la portada d'un barri**~~ · **fet (V55)**. Cabina amb
   fons, cobertura (quines regions encara no tenen res) i les que més es mouen.
   Les sis targetes de rol es queden per als nivells on serveixen.
4. **Missions de xarxa** · **pendent**. Avui `missions()` només diu què *em* toca
   a mi. La feina que no és de ningú en particular —«tres comarques sense cap
   dinàmica»— no la veu ningú i per tant no la fa ningú. La cobertura ja la
   calcula (`countryCoverage`); falta convertir-la en missions.
5. ~~**Catàleg territorial d'un segon país**~~ · **fet (V54)**. **Euskadi** entra
   de sèrie amb estructura foral: 3 territoris històrics, 21 comarques i
   quadrilles, municipis principals de cada comarca (llista **parcial**, i ho
   diu), tipus d'entitat forals (Diputació Foral, Juntes Generals, Quadrilla) i
   un mapa de valor propi on **les Diputacions aporten al Govern**, no al revés.
   Etiquetes en català; la traducció a l'èuscar queda per a la beta.
6. **Traducció a l'èuscar del model d'Euskadi** · **pendent, per a la beta**.
   Els topònims ja hi són en la seva forma oficial i no s'han de tocar; el que
   falta traduir són les etiquetes de nivell i els noms dels rols.

---

**P0b · Gent: rànquing, presència, xat i captació** — fet (V56–V57)

1. ~~**Rànquing de qui mou la xarxa**~~ · **fet (V56)**. Puntua només el que està
   **signat** —les estimacions de l'oracle no donen reputació a ningú— amb factor
   de **reciprocitat** (donar i rebre val més que només donar) i decaïment
   temporal. Cada posició porta el seu **perquè**, construït al mateix lloc que
   el número.
2. ~~**Xat ancorat a nodes i fluxos**~~ · **fet (V57)**. La conversa penja d'un
   node i cada missatge pot citar un flux del mapa, un apunt, una tasca, una
   iniciativa, un objecte o una oferta. **Fusió per unió**, no LWW: sincronitzar
   no pot esborrar el que l'altre acabava d'escriure.
3. ~~**Landing de captació**~~ · **fet**. `SOS/uneix-te.html` — el dolor primer,
   el tracte (què hi poses / què en treus), els quatre rols, els quatre passos i
   **què NO fa**. Acaba a `#/alta`, que obre directament el formulari.
4. **Presència real de tota la xarxa** · **bloquejat pel transport**. Avui «en
   línia» només pot voler dir «connectat amb tu ara», i la pantalla ho diu. Per
   a una llista global caldria un **relé de presència** (opt-in, només presencia
   i missatges xifrats, mai el ledger) o el codi de sala amb trackers, que
   segueix a P5 amb la prova anotada. **Decisió pendent de l'Álvaro.**

---

**P1 · Ara — sense això, el SOS és monousuari**

1. ~~**Sync en viu**~~ · **ja hi era**. En anar a fer-ho es va comprovar que
   `syncBroadcast` ja emet un `patch` a cada `persist`/`persistEntity` i que
   `deleteNode`/`deleteEntity` propaguen tombstone; `test-collab` ho verifica
   d'extrem a extrem amb dos navegadors (`liveChangeReachesTheOtherSide`). El que
   queda d'aquella línia és el **codi de sala** i el **QR**, que són a P3 perquè
   depenen de tercers. *Prioritzar sobre memòria i no sobre el codi porta a
   posar de primer el que ja està fet.*
2. **Vistiplau de l'altra banda** · **fet (V43)**. `submitEntry` és el camí únic:
   si la contrapart ha reclamat la fitxa amb el seu `did`, l'apunt **no entra al
   ledger** i queda com a petició signada fins que hi digui la seva; si no l'ha
   reclamada, tot funciona com abans. Els préstecs passen pel mateix lloc
   (`submitLoan`). Safata `⏳ Esperen el teu vistiplau` amb pastilla a la barra,
   entrada al tauler d'atenció i a la paleta. L'apunt guarda la data del fet i
   qui l'ha validat. 46 assercions a `test-vistiplau`.
3. **Pont entre taxonomies** banc de temps ↔ biblioteca · **fet (V44)**.
   `SUPPLY_DOMAINS` és una capa d'àmbits per sobre de les dues llistes, que no en
   substitueix cap: set àmbits fan de pont de debò (reparació, electrònica,
   cuina, hort, costura, infància, cures) i vuit tenen una sola banda a
   consciència. La banda de coincidències distingeix **exacta** de **mateix
   àmbit** i diu quines dues coses creua; un àmbit que no travessa res no es
   mostra. Filtre d'àmbit amb xip (no es pot escriure a la caixa de cerca perquè
   no és el text de cap fitxa) i sortida des del «no hi ha res». 36 assercions a
   `test-pont`.

**P1 completat.** El següent és P2.

**P2 · Tot seguit — que el que es compta sigui just**

4. **Biblioteca circular** · **fet (V45)**. `OBJECT_MODES` separa donació de
   posada a disposició; `loanValue` valora **per préstec** amb coeficient de
   desgast per tipologia i s'escriu **al retorn**, no en prestar; `logRepair`
   registra la sessió amb mentora **i aprenents**, tots dos com a aportació;
   `circularStats` dona els indicadors del certificat (préstecs, compra evitada,
   reparacions, hores formatives, objectes salvats). Tipus d'apunt propi
   (`objecte`, amb `estimate:true`) perquè un valor estimat no es coli on hi ha
   d'haver diner real. 54 assercions a `test-circular`.
5. **Rols múltiples per context** · **fet (V46)**. `rolesOfPersonIn(node,nom)` i
   `rolesOfPerson(nom)` dedueixen els rols de l'evidència que ja hi havia
   (`mentorsOf`, `govOf`, ledger, objectes, ofertes), cadascun amb el seu perquè
   i els nodes on el fa. `primaryRole` substitueix el «primer que trobo
   recorrent nodes», que depenia de l'ordre de creació. `mentor` entra a
   `SOS_ROLES` amb recorregut propi i frase de lent a les dotze pantalles. La
   lent es tria amb un selector visible (`setLensRole`) i el perfil mostra tots
   els rols alhora. 44 assercions a `test-rols`.

**P2 completat.** El següent és P3 · la cara pública.

**P3 · Després — la cara pública, quan ja hi ha què publicar**

6. **`publicPack` d'habilitats i objectes amb privadesa verificable** ·
   **fet (V47)**. El gra és **agregat**: categoria + municipi + quants, i el
   paquet diu **on preguntar, no a qui**. *Deny by default* node a node i per
   separat per a habilitats i objectes (`publishScopeOf`, `setPublishScope`).
   **Els títols lliures no surten** —«Trepant d'en Quim Ferrer» hauria publicat
   un nom sense que ningú ho decidís. `verifyNoLeak` és **codi i no un test**:
   busca tots els noms, contactes, `did`, títols i apunts del SOS dins del JSON
   que viatjarà, rebutja qualsevol clau fora de la llista blanca, i **si falla
   el botó no publica**. `readSupplyPack` aplica el mateix sedàs a l'entrada.
   La pantalla ensenya la taula sencera abans de descarregar. 43 assercions a
   `test-publica`.
7. **Control de versions de les publicacions** · **fet (V48)**. Cada publicació
   guarda el seu **CID i el del seu pare**; `publicationDiff` diu **què** ha
   canviat (afegit, modificat, retirat) i `pubStatus` si el que tens ara és
   diferent del que vas publicar. El CID **no inclou la data de generació**, així
   que una versió és un canvi de contingut i no una passada de rellotge, i
   publicar el mateix dues vegades no crea versió nova. `rollbackPublication`
   torna enrere **publicant una versió nova** amb contingut antic, sense esborrar
   cap versió intermèdia. El versionat automàtic (`setAutoPublish`) s'atura si
   `verifyNoLeak` troba una fuita. 42 assercions a `test-versions`.

   **El que NO fa, dit clar**: no puja res a cap servidor. La sincronització
   remota depèn de relés de tercers (Nostr, Arweave, IPFS) i és al tram P5;
   anomenar «sincronització» el que és versionat local seria vendre el que no hi
   ha. L'historial és el que farà que, quan la xarxa hi sigui, publicar-hi sigui
   només el darrer pas.
8. **Lectura de QR des de dins** (`A4`) · **fet (V49)**. `qrCapabilities`,
   `decodeQR` i `openQRScanner` amb `BarcodeDetector`: càmera en viu o foto
   triada, i el codi arriba directament a la casella d'aparellament (les dues
   bandes: invitació i resposta). **No hi és a tot arreu** —comprovat: el
   Chromium d'escriptori Linux no el porta, Android i ChromeOS sí— i com que
   **el que escaneja és el mòbil**, la resposta correcta no és encastar un
   descodificador de 250 KB sinó dir-ho: la pantalla anomena l'API que falta,
   diu on sí que va, i deixa sempre el camí d'enganxar el text. 30 assercions a
   `test-qr`.

   **Codi de sala** (`A3`) · **mogut a P5, amb prova**. Els trackers WSS
   (`tracker.openwebtorrent.com`, `tracker.webtorrent.dev`, `tracker.files.fm`)
   **no responen des d'aquest entorn**. Escriure el client de tracker sense
   poder-lo verificar de cap manera deixaria codi que sembla fet i que ningú
   sabria si ha funcionat mai. Es fa quan hi hagi una xarxa on provar-ho.

**P3 completat** (excepte el codi de sala, mogut a P5 per la prova de dalt).

**P4 · Quan l'MVP estigui polit**

9. **App de mòbil per missions** · **fet (V51)**. `missions()` reuneix el que el
   sistema ja sabia (`pendingInbox`, `dashboardAttention`, `supplyMatches`,
   `dueStatus`, `journeyProgress`, reptes del tier) i ho converteix en una
   **portada pròpia** sense arbre, sense pestanyes i sense res per configurar:
   una llista, un botó gros per missió. Cada missió diu **què passarà si la fas**
   i quant costa; l'ordre és **per qui espera**, no per importància abstracta.
   Mai és buida per a qui té perfil. Ruta `#/missions`, entrada des del tauler i
   de la paleta. 36 assercions a `test-missions`.

   **Decisió d'arquitectura resolta**: un sol fitxer amb capa de portada, no un
   segon `index.html`. El cost mesurat és una funció i un bloc de CSS, i es manté
   el zero-servidor. *(Va aparèixer un tercer desbordament a 360 px: amb la
   sessió activa la barra tornava a sortir. El text de l'estat de sync s'amaga
   de la vista però no dels lectors de pantalla.)*
10. **MATRIU F5–F8**. F1–F4 ja fan que sigui un servei; aquestes la completen.
    - **F5 finançament i tràmits** · **fet (V52)**. Pipeline (`fundingOf`,
      `addFunding`, `fundingSummary`) que separa **demanat de concedit** —el que
      has demanat no és teu— i `fundingAlerts` que puja els venciments al tauler
      amb **severitat màxima**: és l'única cosa que caduca sola, i un termini
      passat es diu «ha passat fa N dies», no «pendent». Checklist jurídica
      (`LEGAL_STEPS`, `legalChecklist`) sobre el `juridic` que cada
      `PROJECT_TYPE` ja portava i que no servia per a res.
    - **F6 formació lligada a l'etapa** · **fet (V52)**. `STAGE_MODULE` connecta
      cada etapa amb el seu mòdul (idea→M3, prototip→M4, validació→M6,
      graduació→M5) i `stageTraining` diu qui de l'equip real l'ha fet. Surt a
      les comprovacions marcat com a **`soft`: no bloqueja graduar**, perquè es
      marca a mà i no es pot aturar ningú per una casella que ell mateix omple.
    - **F7 seguiment post-graduació** · **fet (V53)**. `graduatedNodeId` existia
      i no el llegia ningú. `postGradReviews` obre les fites de **3, 6 i 12
      mesos** —la resposta la posa una persona, perquè un projecte pot tenir el
      ledger quiet i estar viu— i `survivalRate` dona l'indicador **de la
      incubadora**. Sense revisions la taxa és `null` i no zero; es calcula
      **només sobre les revisades**; i una fita superada per una revisió
      posterior deixa de reclamar-se.
    - **F8 evidències** · **fet (V53)**. `addEvidence` accepta enllaç, nota o
      fitxer i en guarda sempre el **hash**, així es pot ancorar sense publicar
      el contingut. **El fitxer no entra al node** (viatjaria pel sync i pel pack
      públic): va a un registre local de tipus `evidence`, dins de
      `PRIVATE_DB_TYPES`. `evidenceCoverage` mira **només els items fets**, i és
      `soft`: demanar-la per graduar convidaria a adjuntar qualsevol cosa.
    - 46 assercions a `test-matriu-f56` i 42 a `test-matriu-f78`.

**P4 completat.** La MATRIU té les vuit fases del pla.
11. **Rendiment amb 500 nodes i 5.000 apunts** + **accessibilitat** ·
    **fet (V50)**. No s'ofega: render 33 ms (el segon, 5 ms), i cap funció que
    recorri tot el SOS passa de 25 ms —`ledgerIndex` 11, `supplyIndex` 4,
    `searchSupply` 21, `knownPersons` 6, `rolesOfPerson` 2. L'única cara és
    `verifyNoLeak` (211 ms) i ho és a posta: compara tot el SOS contra el JSON
    que sortirà, un cop per publicació. Accessibilitat: `lang`, títol, cap
    `tabindex` positiu, 37 botons amb nom, 7 camps etiquetats, un sol `h1`
    visible, sense salts de nivell, i Escape tanca els modals.
    **Dos defectes reals trobats, tots dos a 360 px** (`test-mobilenav` corre a
    375 i no els veia): la barra de pestanyes no podia encongir-se i feia
    desplaçar la pàgina —ara llisca ella—, i la barra superior sumava 361 px.
    32 assercions a `test-escala`.

**P5 · Bloquejat per tercers — no és camí crític**

12. Ancoratge Nostr / Arweave / IPFS, wallets W2/W3, integració profunda d'AI
    review de PRs, coordenades a les entitats del directori. Tot això depèn
    d'infraestructura externa. Que quedi al backlog no vol dir que sigui el
    següent: vol dir que **quan la xarxa hi sigui, ja sabem què fer-hi**.
13. **Codi de sala per sincronitzar** (trackers WSS + reconnexió). Baixat aquí
    des de P3 amb la prova feta: cap dels tres trackers públics respon des de
    l'entorn de desenvolupament. La publicació remota del `SupplyPack` (V47/V48)
    viu al mateix calaix i pel mateix motiu.

---

**El que NO faria ara**, i per què val la pena dir-ho: multi-peer (>2 alhora),
hub always-on, i conversió d'slices a participacions jurídiques. Els tres són
grans, cap dels tres no desbloqueja res del que hi ha per sobre, i els tres
tenen molt més sentit quan hi hagi comunitats reals fent-lo servir i sabrem què
demanen de debò.

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

### Onada permaweb · identitat portable + ancoratge del registre

**Fet:**
1. **Còpia xifrada de la identitat** — `exportIdentity` / `importIdentity`
   (PBKDF2 210k · AES-GCM), amb pantalla pròpia i entrada des del panell
   d'identitat. Resol que esborrar el navegador destruïa el `did:sos` i que el
   mateix humà amb dos aparells fos dues persones al registre. Veda V25.
2. **Ancoratge del registre sencer** — `buildRegisterPack` /
   `verifyRegisterPack` amb una arrel sobre totes les accions. El botó «Ancora»
   del registre obria l'ancoratge d'un node i, des del tauler, no obria res.
   Veda V26.
3. **CID que no cobria res** — `JSON.stringify(pack, Object.keys(pack).sort())`
   filtra les claus **a tota la profunditat**: `{totals:{hores:8}}` es
   serialitzava com `{totals:{}}`, així que es podien canviar hores i euros
   sense moure el CID. Defecte heretat de `buildAnchorPack`, corregit amb
   `_canon` (claus ordenades a tots els nivells) per als dos packs.
4. **Pla de muntatge iMac + iPad** — `../vision/muntatge-imac-ipad.md`.

5. **Col·laboració de debò** — enllaç d'invitació (`#/sync/<codi>`) que s'obre
   d'un clic amb el codi carregat, presentació mútua (`did:sos` + nom) abans que
   res es fusioni, i memòria de l'últim company. Veda V27.

6. **Federacions temàtiques** (model del.icio.us) — `node.themes`, `allThemes`,
   `themeFederation` (sobre `consolidateSet`, sense doble comptatge) i
   `themeNeighbours`, que és el moviment que fa que etiquetar valgui la pena:
   des d'un node veus **qui més treballa els teus temes**. Pantalles pròpies,
   entrada des del tauler, del llançador, de la paleta, de les accions del node
   i de la ruta `#/federacions`. Veda V28.

7. **F1 de la MATRIU · acompanyament** — mentors amb àmbit
   (`MENTOR_SCOPES`), sessions que entren al ledger de la venture signades i
   generen slices (`logSession`), i detecció de silenci (`ventureSilence`,
   `silentVentures`) visible a la Cartera i al tauler. Veda V29. La MATRIU deixa
   de ser un repositori d'estructures i passa a ser un servei.

8. **F3 de la MATRIU · riscos i bloquejos** — riscos amb probabilitat, impacte
   i **pla de mitigació**; bloquejos amb **qui els desbloqueja** i quants dies
   fa que duren; `ventureLight` calcula el semàfor de cada iniciativa i
   `matriuLights` ordena la cartera pitjor primer. El tauler d'atenció puja els
   bloquejos de 14 dies o més per damunt de tot i avisa dels riscos alts sense
   pla. Veda V36.

9. **Res no interromp el que estàs fent** — `modal()` buida `#modalRoot`, així
   que el tour d'acollida amb retard destruïa la pantalla que tenies oberta i
   el que hi havies escrit (el registre d'hores inclòs). Ara `modalOpen()`
   comprova si estàs ocupat i el tour espera o renuncia. Veda V35.

10. **F4 de la MATRIU · vista de cohort** — pestanya `▦ Cohort` amb una fila per
    iniciativa i les mateixes onze columnes (etapa, semàfor, preparació,
    backlog, hores, equity màx, salut del mapa, dies sense moure's, mentores,
    incidències). Ordenable per qualsevol columna en tots dos sentits, filtrable
    per etapa i semàfor, amb **embut per estadis** i **exportació CSV**.
    `mapHealthScore` resumeix el mapa de valor en un número comparable. Cap
    xifra és nova: el semàfor de la taula és el mateix `ventureLight` de la
    cartera. Veda V37.

11. **F2 de la MATRIU · viabilitat econòmica** — model d'ingressos (font, tipus,
    preu per unitat, unitats/mes) i estructura de costos separada en fixos i
    variables. `ventureEconomics` calcula el **llindar de sostenibilitat**
    (fixos ÷ marge unitari) i en diu l'estat: sostenible · assolible ·
    dependent · impossible · incomplet. **Els ajuts no compten al llindar.**
    `fundRunway` diu quants mesos aguanta el fons amb el ritme de crema actual.
    Nova comprovació a la porta 3 **només** per als tipus amb ànim de lucre.
    Columna de viabilitat a la cohort i al CSV. Veda V38.

12. **Alta de soci i identitat de les persones** — les tres capes fetes:
    `knownPersons()` (índex derivat de tota la gent del SOS) amb el formulari
    d'alta de **dues portes**; reclamació de fitxa **signada** amb el `did`
    propi, amb la comprovació `signer.did === member.did`; i **fusió de
    duplicats** que repunta l'estat mutable però **no reescriu mai història
    signada** —s'hi accedeix per taula d'àlies. Equity, saldos, reputació i
    perfil resolen per àlies. Veda V39.

13. **Cerca: l'eix és la cosa, la direcció és un atribut** — dos tipus
    (habilitat, objecte) en comptes de tres, i s'ofereix/es busca com a atribut
    filtrable, ordenable i visible a cada fila. La categoria és la clau
    d'aparellament, i d'aquí surt la banda de **coincidències**. Les llistes
    d'espera passen a ser demanda d'objecte visible. Cinc criteris d'ordre en
    tots dos sentits. Veda V40.

14. **Còpia de seguretat de tot el SOS local** — `exportBackup` /
    `importBackup` s'emporten **la base de dades sencera** (no només la
    identitat): nodes, socis, registre, iniciatives, biblioteca, entitats. Amb
    contrasenya, el fitxer va xifrat (PBKDF2 210k · AES-GCM, la mateixa pila que
    la identitat); **en blanc, va en clar** —i llavors el botó ho diu: «⚠
    Descarrega SENSE xifrar», perquè qui tingui el fitxer podrà llegir-ho tot i
    **signar en el teu nom**. Hi ha casella per treure la identitat de la còpia.
    En restaurar, primer es mostra què hi ha dins (registres, data, si porta
    identitat) i només després s'importa; substituir-ho tot és opcional i
    demana confirmació. Entrada des del panell d'identitat. Veda V42.

**Següent, per ordre:**
1. **Codi de sala per sincronitzar** — l'aparellament segueix sent per sessió.
   Descobriment via trackers WSS + reconnexió amb l'últim codi.
2. **Lectura de QR des de dins del SOS** (`BarcodeDetector`) — el QR es genera
   però l'escaneig depèn de la càmera del sistema.
3. **Més de dos alhora** — avui la sincronització és punt a punt; una assemblea
   de debò en vol N.

### Onada UX · el perfil s'edita i el catàleg és únic

**Fet:**
1. **El perfil s'edita, no es torna a començar** — `profileSnapshot` reconstrueix
   què té publicat la persona a tot el SOS, el formulari s'obre omplert i marcat,
   i desar **reconcilia** (afegeix el nou, retira el desmarcat) en comptes de
   duplicar. Els botons diuen «Edita» quan toca. Un objecte prestat no es
   retira mai. Veda V31.
2. **Cerca centralitzada per proximitat** — `supplyIndex`/`searchSupply` són el
   catàleg únic de tot el SOS (habilitats, objectes, demandes de qualsevol
   node), i `proximity` ordena de més a prop a més lluny **sense inventar
   quilòmetres**: es fa servir l'arbre territorial, i coordenades reals només si
   n'hi ha. Pantalla `🔎 Què hi ha a prop` al tauler i a `#/aprop`. Veda V32.

3. **Operar des del resultat** — `supplyAction`: cada resultat porta l'acció que
   li toca (hores, oferir-se, préstec, llista d'espera) i, si no ets soci
   d'aquell node, l'alta es fa sola. Veda V33.
4. **Coordenades reals** — `parseCoordText`/`applyCoords` llegeixen CSV i JSON
   d'ICGC/Idescat/OSM, la geolocalització del navegador marca la teva població,
   i la pantalla `📍 Coordenades` mostra la cobertura. Sense coordenades, la
   cerca **diu** que ordena per territori i no per km. Veda V34.

5. **Confirmació de l'altra banda** — `submitEntry`/`submitLoan` com a camí
   únic: si la contrapart ha reclamat la fitxa, l'apunt queda com a **petició
   signada** i no toca el ledger fins que hi ha vistiplau; si no l'ha reclamada,
   res canvia. Safata pròpia, pastilla a la barra i primer lloc al tauler
   d'atenció. Veda V43.

**Pendent d'aquesta línia:**
- **Coordenades a les entitats del directori**, no només als territoris.

### Publicar a la permaweb · el repositori públic del SOS

**L'objectiu, dit clar**: que una persona d'un poble faci servir el SOS, premi
un botó, i **el que ha decidit compartir quedi publicat** perquè algú altre ho
trobi. Que se senti la màgia. Tot el que hem construït fins ara és el registre
privat; això és la cara pública.

**Què hi ha ja i què falta.** No es comença de zero — cal **investigar què està
acabat abans de tocar res**:

- `toPublicPack` / `mergePack` — ja publiquen i fusionen **entitats** del
  directori amb `visibility==='public'`, amb tombstones i LWW. És el patró bo,
  però **només cobreix entitats**.
- `buildRegisterPack` / `verifyRegisterPack` (V26) — arrel i CID sobre el
  registre sencer. Serveix per **provar** el que es publica, no per publicar-ho.
- `nostrPublishAnchor` (NIP-07) i `rememberAnchor` / `compareAnchor` (V30) — ja
  ancoren i comparen. **Falta la publicació del contingut**, no només de l'arrel.
- `GH` (device flow) — hi és, i el control de versions de git **pot ser útil de
  debò aquí**: un repositori públic és un lloc perfectament vàlid per a un
  paquet signat i versionat, i ja en sabem el camí.

**El que falta de veritat, per ordre:**

1. **Un `publicPack` que cobreixi habilitats i objectes, no només entitats.**
   Habilitats i ofertes **per ubicació**, amb la mateixa forma canònica i
   signada que la resta.
2. **Privadesa per disseny, i verificable.** Aquesta és la part que no es pot
   improvisar: publicar «hi ha algú a Manresa que fa fusteria» no és publicar
   qui és, ni el seu telèfon, ni el seu ledger. Cal decidir **el gra**
   —probablement categoria + municipi + un identificador opac de contacte— i
   tenir **un test que ho comprovi**: cap dada privada dins del pack, com ja fa
   `privacyNoLeak` a `test-matriu`. La regla ha de ser *deny by default*: només
   surt el que està marcat explícitament com a públic.
3. **Sincronització automàtica de la part que triïs, amb control de versions.**
   Escollir l'abast (aquest node, aquests temes, aquesta comarca), i que es
   publiqui sol quan canvia. Cada publicació és **una versió**, amb el seu CID i
   el seu pare: es pot veure què va canviar, i tornar enrere. Aquí git no és una
   metàfora, és una opció real d'implementació.
4. **Que sigui intuïtiu, o no servirà de res.** Aquesta és la condició, no un
   acabat: com més senzill sigui publicar, més comunitat. La forma que volem és
   **formar agents locals** —persones del territori amb l'habilitat de publicar
   a la permaweb— i això vol dir que el camí ha de ser prou curt perquè es pugui
   ensenyar en una tarda i recordar la setmana següent.

**Riscos que cal dir en veu alta**: publicar és irreversible a la pràctica
—un pack replicat no es desfà—, així que el pas de publicar ha de mostrar
**exactament què sortirà** abans de fer-ho, i qui no ho entengui no ha de poder
prémer el botó sense veure-ho. I depèn de relés i xarxes de tercers
(Nostr, Arweave, IPFS), que és l'únic tros del SOS que no és autosuficient: cal
que funcioni degradat quan no hi ha xarxa, i que ho digui.

### Després de l'MVP · l'app de mòbil per a la gent

**On som i on anem.** Ara mateix estem construint les **bases** i l'app
d'**administració i gestió**: la MATRIU, la biblioteca i el banc de temps
operatius, i el SOS com a escola i facilitador del desenvolupament comunitari.
Això és feina de qui coordina, no de qui participa.

Un cop l'MVP estigui polit amb les tres eines funcionant, el pas següent és
**una altra app, no la mateixa amb la pantalla més petita**:

- **Fluxos totalment predefinits.** Res de configurar. Cada cosa que es pot fer
  és un camí tancat, d'una pantalla a la següent, sense decisions de disseny per
  a l'usuari.
- **Llista de missions.** La unitat d'ús no és el menú, és **la missió**: què em
  toca fer ara i què passarà quan ho faci. La llista viu a la portada.
  L'esquelet ja existeix (`ROLE_JOURNEYS`, `journeyProgress`, `HERO_CHALLENGES`,
  `dashboardAttention`); el que falta és que **sigui la interfície**, no un
  panell més dins d'un tauler.
- **User-friendly de debò**: poques accions per pantalla, text curt, res que
  demani entendre el model de dades. Tot el que avui és un modal amb quinze
  camps ha de ser tres passos amb un camp cadascun.

**La línia que separa les dues apps**: la de gestió mostra **estructura** (qui,
on, quant, per què); la de mòbil mostra **el següent pas**. Barrejar-les és el
que fa que una eina comunitària només l'acabin fent servir tres persones.

**Pendent de decidir**: si és la mateixa `index.html` amb una capa de portada
diferent —cosa que manté el zero-servidor i el fitxer únic— o un segon fitxer
autocontingut que comparteix el mateix IndexedDB i el mateix `did:sos`. La
primera opció és la coherent amb les vedes; cal comprovar que no fa la pàgina
massa gran.

### Una persona té diversos rols alhora

**Defecte de model, no de pantalla.** `roleOfPerson` retorna **un** rol i
`activeRoleId()` n'agafa un de sol per decidir la lent de tot el SOS. Però una
persona real és **superheroina al seu barri, mentora d'una MATRIU i
simpatitzant en un altre poble** a la vegada. La implicació no és un estat
global: **depèn del node i del que hi fa**.

Cap on ha d'anar:

- **Els rols són per context**, no per persona. El mateix humà pot ser
  `superheroi` a la biblioteca del seu barri i `mentor` a la MATRIU de la
  comarca, i totes dues coses són certes alhora.
- **El rol es dedueix del que fa, no d'una casella.** Si acompanya ventures, és
  mentora — ja hi ha `mentorsOf`. Si aporta hores i objectes, és superheroina.
  Si coordina un node, guardiana. El sistema ja té l'evidència; el que fa és
  aplanar-la a un sol valor.
- **`mentor` ni tan sols existeix a `SOS_ROLES`**, tot i que la MATRIU (F1) ja
  té mentors amb àmbit. Cal afegir-l'hi amb el seu recorregut propi.
- **La lent del SOS ha de ser triable**: «ara miro el SOS com a mentora» i la
  guia contextual, les missions i el tauler canvien en conseqüència. Amb un
  selector visible, no endevinat.

Encaixa amb V39: quan una persona reclama la seva fitxa amb el seu `did`, els
seus rols de tots els nodes es poden reunir sota una sola identitat sense
haver-los d'aplanar a un.

### Biblioteca de les coses · valor de l'aportació i economia circular

**Pendent.** Avui donar un objecte a la biblioteca no val res al registre: es
publica i prou. Però una biblioteca de les coses **produeix valor real** que ara
no es comptabilitza enlloc, i per això no es pot certificar ni retribuir.

**1 · Valor de l'aportació en posar un objecte.** El formulari d'objecte ha de
distingir dues coses que ara es confonen:

- **Donació** — l'objecte passa al comú. El valor és el bé cedit: entra al
  ledger com a aportació de qui el dona, valorat amb l'oracle
  (`oracleObjectValue`) i ajustat per estat i antiguitat.
- **Posada a disposició** (segueix sent teu, el prestes) — el valor **no** és el
  preu de l'objecte, perquè no el regales. El que aportes és **el risc i el
  desgast**: que se't faci malbé, que torni pitjor, i la revisió, reparació o
  reciclatge que aquell objecte generarà. Aquest és un flux de valor propi de la
  biblioteca, i és exactament el que un certificat d'economia circular ha de
  poder demostrar.

Cal, doncs, un **coeficient de desgast per tipologia i ús**: una eina elèctrica
prestada quaranta vegades no aporta el mateix que una tenda de campanya
prestada dues. La proposta és valorar per préstec, no d'una sola vegada: cada
retorn genera un apunt petit i signat a favor de qui l'ha posat a disposició.
Així el valor s'acumula amb l'ús real i no amb una declaració inicial.

**Regla d'honestedat**: aquests valors són **estimacions de l'oracle**, i s'han
de mostrar com a tals, amb la font a la vista (Glass-Box, com `fundValue`). Un
número inventat que sembli comptabilitat és pitjor que no tenir-lo.

**2 · Reparació: mentor i aprenent aporten valor tots dos.** La vessant de
reparació és on la biblioteca deixa de ser un magatzem i passa a ser una escola.
El model ha d'incentivar les dues bandes:

- **La mentora** aporta hores d'ofici i, sobretot, **transferència de
  coneixement** — un intangible que a la VNA és el flux que sosté tota la resta.
- **L'aprenent no és un cost**: mentre aprèn, **repara de debò**, i aquella
  reparació és valor lliurat a la comunitat. Ha de generar-li reputació pel que
  aporta, no només un certificat pel que aprèn.

Encaixa amb el que ja hi ha: `logSession` de la MATRIU (F1) ja converteix una
sessió d'acompanyament en apunts signats al ledger. Aquí caldria l'equivalent
per a la biblioteca —una **sessió de reparació** amb objecte, mentora, aprenents
i hores— que generi apunts per a tothom qui hi ha posat temps. Reutilitzar el
mateix camí d'escriptura, no inventar-ne un de nou (veda V22: un sol camí).

**3 · Per què això importa.** L'objectiu de fons és **automatitzar el registre
de la comptabilitat de valor** de tothom qui hi participa. Un model *fair*
no és el que reparteix bé al final: és el que **compta bé pel camí**, i que
compta el que normalment no es compta —el risc de qui presta, el temps de qui
ensenya, i la feina de qui aprèn fent.

**Ordre suggerit**: (1) donació vs posada a disposició amb valor per préstec ·
(2) sessió de reparació amb mentora i aprenents · (3) indicadors agregats per al
certificat circular (objectes salvats de l'abocador, reparacions, hores
formatives, valor evitat).

**Depèn de**: `oracleObjectValue` i `ORACLE_OBJECT_DEFAULTS` (ja hi són),
`pushLedger` (ja és el choke point), i el pont de taxonomies entre banc de temps
i biblioteca que ja consta com a pendent més amunt.

### Identitat i alta de socis · fet (V39)

**El problema que hi havia.** `newMember` encunyava un `uid()` nou cada vegada. La mateixa
persona donada d'alta a la MATRIU, al banc de temps i a la biblioteca són **tres
registres sense cap relació**, units només pel `personKey`, que avui és
literalment el nom normalitzat. Conseqüències: canvia-li el nom en un lloc i es
parteix en dues persones; dues Martes de pobles diferents es fusionen soles.

**Disseny en tres capes, de menys a més compromís:**

1. **Triar d'entre qui ja hi és.** Un índex de persones derivat (no desat) que
   escombra tots els nodes i agrupa per `personKey`. El formulari d'alta passa a
   tenir dues portes: *«Ja hi és»* — llista de qui el SOS ja coneix, amb els
   nodes on participa i el seu nivell — i *«Algú nou»*. Triar-ne una copia nom,
   contacte i entitat, i **estampa el `personKey`** al registre nou: el vincle
   passa a ser explícit, no una coincidència d'ortografia.

2. **`did` al registre de soci.** Quan una persona **reclama** la seva fitxa amb
   la seva identitat (`getIdentity()` → `did:sos`), el registre guarda el `did` i
   una **reclamació signada** sobre `{nodeId, memberId, did}`. A partir d'aquí el
   que uneix els registres és la identitat, no el nom: canvia't el nom quan
   vulguis. Dos registres amb el mateix `did` són la mateixa persona **per
   prova**, no per suposició. Una fitxa ja reclamada per un altre `did` no es pot
   tornar a reclamar sense que l'original signi el traspàs.

3. **Fusió de fitxes duplicades.** `mergePersons(a,b)` per quan un mateix humà té
   dues fitxes (una errata, «Marta R.» i «Marta Roca»). Ha de repuntar
   `memberId` a ledger, ofertes, propietaris i prestataris d'objectes, mentors i
   leads de venture. **Mai reescriu història signada**: un apunt signat amb l'id
   antic conserva la seva signatura i es resol per una taula d'àlies; reescriure
   l'apunt trencaria la seva cadena de hash. La fitxa absorbida queda com a
   làpida amb `mergedInto`, i la fusió és ella mateixa un registre signat.

**Estat**: les tres capes fetes i verificades (74 assercions a `test-identitat`),
inclosa la prova que la cadena de hash i les signatures sobreviuen una fusió.

**Pendent d'aquesta línia**: propagar la reclamació entre nodes (avui es reclama
fitxa a fitxa; hauria de poder-se reclamar tot el que és teu d'un cop), i que
la fusió entre nodes diferents —no només dins d'un— tingui sentit quan calgui.

### Cerca · l'eix és la cosa, no la direcció — fet (V40)

`searchSupply` tractava habilitat, objecte i demanda com tres categories
paral·leles. Però **una demanda no és una mena de cosa, és una direcció sobre
una cosa**. Fet: dos tipus (habilitat, objecte); `dir` (`ofereix`/`busca`) com a
atribut a cada fila; cinc criteris d'ordre (`SUPPLY_SORTS`) en tots dos sentits;
`supplyMatches` per a la banda de coincidències; i les llistes d'espera
convertides en demanda d'objecte visible.

**El pont entre les dues taxonomies · fet (V44)**: `SUPPLY_DOMAINS` posa una capa
d'àmbits per sobre de les dues llistes sense substituir-ne cap. Set fan de pont
de debò; vuit tenen una sola banda perquè forçar-hi una equivalència seria
mentir. La banda de coincidències separa **exacta** de **mateix àmbit**, diu
quines dues coses creua, i amaga l'àmbit que no travessa res que l'exacta no
digui ja. El filtre d'àmbit és un xip, no un text a la caixa de cerca —«Reparar i
bricolar» no és el títol de cap fitxa i posar-l'hi hauria donat zero resultats.

### Defectes trobats i encara oberts

- ~~**Un objecte valia hores**~~ · **resolt (V55)**. V45 va afegir el tipus
  d'apunt `objecte` amb el valor **en euros** (donacions i desgast per préstec),
  però tres llocs seguien assumint «el que no és moneda són hores»: `measure()`
  —que alimenta cada roll-up i cada panell de consolidació—, el total «Temps
  aportat» de `renderLedger`, i la taula de projectes del dashboard. Cada préstec
  d'una biblioteca inflava les hores del territori amb un import en €. Ara
  `measure` retorna `objectes` com a calaix propi i cap dels tres el barreja.


- **El selector d'idioma de la landing és inabastable a 1280 px** · **obert, i
  fora de l'abast d'aquesta línia**. A `index.html` (arrel), el botó
  `.lang-btn[data-lang="es"]` queda a **x=1342 en una finestra de 1280 px**: surt
  del viewport per la dreta. Vol dir que **ningú pot canviar a castellà en un
  portàtil normal**. Ho ha destapat `test-landing`, que fallava per timeout en
  clicar-lo —no per l'i18n, com semblava. No s'ha tocat perquè la landing és
  explícitament fora d'abast; queda anotat per a qui hi entri.

- ~~`updateAtles` no era idempotent~~ · **resolt (V41)**. Eren dues coses: el
  `catch` buit s'empassava els paquets que fallaven i deia «ja estava al dia», i
  la càrrega automàtica d'arrencada corria alhora que la manual fusionant els
  mateixos paquets. Amb el recompte de fallades i un pany d'una sola càrrega en
  vol: 17 · 17 · 17 estable.
- ~~`ventureGraduates` i `home3ActionButtons`~~ · **no eren defectes de l'app,
  eren tests obsolets**. El primer esperava que una venture sense feina feta
  gradués —la porta fa bé de bloquejar-la—; ara comprova les dues cares. El
  segon comptava exactament tres botons a la home, que se'n va menjar cada cop
  que hi afegíem una targeta; ara comprova que cada perfil tingui la seva acció.
  Tenir tests vermells que no són defectes erosiona la confiança en tota la
  suite: o són verds o no hi són.
- ~~`tier1IsSearchActionsPersona`~~ · **sí que era una regressió meva**, i la
  única d'aquesta línia. La pastilla del vistiplau (V43) es va afegir com a quart
  botó permanent de la barra, amagat amb `display:none`. La barra té **tres**
  controls d'alta freqüència i prou. Ara la pastilla **no existeix al DOM** quan
  no hi ha res esperant, i el test comprova les dues cares: tres per defecte,
  quatre quan algú espera. Un botó invisible que ocupa lloc a l'estructura és un
  botó que algun dia sortirà per accident.
- ~~`everyRoleHasItsCard`~~ · **buit real de la V46**: `mentor` va entrar a
  `SOS_ROLES` amb recorregut, lents i mòduls, però **la portada es va quedar
  enrere** i el rol no hi tenia targeta. Afegir un rol i deixar-lo sense targeta
  el fa invisible justament al lloc on la gent decideix què és. (El test antic
  buscava la paraula «Comunitat» i s'havia trencat en renombrar l'etiqueta; ara
  comprova que **cap rol es quedi sense targeta**, que és la invariant.)
- ~~`ventureGraduates` a `test-matriu-main`~~ · el mateix test obsolet que ja es
  va corregir a `test-matriu`, en un segon fitxer. Ara comprova les dues cares, i
  de passada documenta una cosa que val la pena: amb **una sola persona
  aportant-hi, l'equity és del 100% i la porta ho para**. Una iniciativa que
  depèn d'algú sol no està preparada per sortir.
- ~~`test-atles`, `test-atles-main`, `test-atles2`, `test-dir`~~ · **infraestructura
  i recomptes fixos, no defectes**. Els quatre esperaven un servidor HTTP que
  ningú arrencava (l'atles fa `fetch` i `file://` el bloqueja): ara se'l munten
  ells amb `serve.mjs`. Tres fixaven «6 entitats» quan l'atles ja en té 17;
  comproven la invariant —que en carrega alguna, que **tots els paquets
  arriben** (`updateAtles.last.complete`, V41) i que la segona càrrega dona el
  mateix— en comptes d'un número que canvia cada cop que l'atles creix. I
  `test-dir` llegia el recompte **amb la càrrega a mig fer**, així que la
  comparació d'després de recarregar fallava per una cursa del test.
- ~~`test-formacio`~~ · **tampoc era un defecte, era un test obsolet**. Fixava
  `.module === 8` i quatre recomptes de caixes a 8, i `formacio.html` ja té 16
  mòduls; a més, els mòduls nous fan servir `.box.metode` on els primers feien
  servir `.box.eines` —la mateixa caixa amb un altre nom, no una que falti. Ara
  comprova les invariants de debò: els ids van de `m1` fins a l'últim **sense
  forats**, i **cap mòdul es queda sense les seves quatre caixes**. Deixa de
  posar-se vermell cada cop que la formació creix.

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

**F1 acompanyament**, **F2 viabilitat econòmica**, **F3 riscos/bloquejos** i
**F4 vista de cohort** ja estan fetes — són les que fan que la MATRIU deixi de
ser un repositori d'estructures i passi a ser un servei que es pot coordinar.
Pendents: F5 finançament i tràmits · F6 formació lligada a l'etapa ·
F7 seguiment post-graduació · F8 evidències.

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
