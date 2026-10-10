# L'alta en un toc · del mapa a la web, pagant amb Apple Pay

**Demanat per l'Àlvar (09/10/2026):** que mentre es dibuixa el mapa de valor
surti la web, amb els menús, les pàgines, el contingut i els serveis. Que ja
quedin definits la creació de comptes, la integració i la benvinguda. I que la
màgia sigui que GitHub, Netlify i la IA es configurin pagant amb Apple Pay,
aprofitant els projectes de Claude Code per desenvolupar amb el client.

Aquest document és el disseny. El que ja està fet és el primer tram: el mapa
dona la web.

## 1 · Fet: el mapa dona la web

A l'editor del mapa (`SOS/vna-suport.html`) hi ha una pestanya nova, **Web**.
Es refà cada cop que canvia el mapa, i surt de l'ideal si és l'ideal el que es
mira. Les regles són a la funció `webDelMapa`, entre les marques `VS-WEB`, i la
prova `SOS/tests/test-vna-motor.mjs` a la CI.

| Del mapa | A la web |
|---|---|
| Els rols «de casa» (per defecte, el que té més lliuraments; es poden triar) | Fan la web. Van a «Per a l'equip» |
| Cada altre rol | Una porta: una pàgina al menú |
| Els lliuraments de casa cap al rol | «Què et donem» |
| Els lliuraments del rol cap a casa | «Què ens dones» |
| Anada i tornada amb casa | **Compte d'usuari.** Si només rep o només dona, no en cal |
| El primer lliurament en l'ordre dels processos | El pas «El primer que rebràs» de la benvinguda |
| Paraules dels lliuraments (pagament, client, visita…) | Les connexions proposades, amb la paraula que les ha fet sortir |
| Els processos i la seqüència | La pàgina «Serveis», amb els passos en ordre |

**La benvinguda de cada porta** té fins a cinc passos: coneix-nos, crea el
compte (o «sense compte»), connecta el que ja fas servir, el primer que rebràs
i el primer que et demanarem.

**El botó «Descarrega web.json»** dona tot això en un fitxer (`tt-web-1`).
És el que llegeix el generador de la web del pas 3.

Una porta buida no s'amaga: diu que casa no li dona res ni en rep res. És una
troballa del mapa, no un error de la web.

## 2 · La màgia, dita amb honestedat

Apple Pay **paga**. No crea comptes. GitHub i Netlify demanen que la persona
hi entri ella mateixa. Per això hi ha dos camins, i el client tria a la
pantalla de pagament:

### Camí A · «Ho tenim nosaltres» (per defecte als pilots)

El client només fa una cosa: pagar amb Apple Pay.

1. **Stripe Checkout** amb Apple Pay. Checkout és la pàgina de pagament de
   Stripe i ja porta Apple Pay i Google Pay. No hem de tocar dades de targeta.
2. Stripe avisa una funció de Netlify (`checkout-completat`), que comprova la
   signatura de l'avís abans de fer res.
3. La funció crea el **repositori** a partir de la plantilla, a l'organització
   de GitHub de TeamTowers, amb el `web.json` del mapa i un `CLAUDE.md` amb
   les regles del client.
4. Crea el **lloc de Netlify** connectat a aquest repositori, i hi posa les
   variables d'entorn: la IA i, si n'hi ha, el CRM.
5. El client rep un correu amb la web publicada i l'enllaç al projecte de
   Claude del seu cas.

**La porta de sortida és part del producte.** Qualsevol dia, el client pot
endur-se-ho tot: GitHub permet transferir un repositori i Netlify permet
transferir un lloc a un altre equip. Sense això, el camí A seria una presó.

### Camí B · «Ho vull a nom meu» (fet, amb el pagament en mode de prova)

Dos tocs més, i tot és seu des del primer minut.

**Ja funciona:** a la pestanya Web, **«Publica-la a nom teu (Netlify)»**. Obre
el botó «Deploy to Netlify» de la carpeta `SOS/plantilla-web/` d'aquest
repositori (paràmetre `create_from_path`: no cal cap repositori a part).
Netlify la copia al GitHub del client i la publica. A cada publicació hi
executa `node eines/genera.mjs`, que fa la web amb el mateix codi que l'editor.
El mapa hi va comprimit dins del botó (`TT_MAPA`, al hash de l'adreça, que no
arriba als registres de Netlify), amb el nom, el correu i la llengua. Quan el
client desa `cerebro/mapa-real.json` al seu repositori, aquest mana. La
plantilla es regenera amb `node SOS/tools/build-plantilla.js`, i la CI comprova
que porta el codi de l'editor tal com és.

1. Paga amb Apple Pay, igual que al camí A.
2. Botó **«Deploy to Netlify»**. El client entra a Netlify amb el seu GitHub.
   Netlify copia la plantilla al seu GitHub i la publica. És un servei de
   Netlify que ja existeix, i no cal que guardem cap permís seu.
3. Un formulari curt li demana la clau de la IA, si vol fer-la servir directament
   (vegeu el punt 4). Va a les variables de Netlify, mai al codi.

## 3 · Fet: la web de debò, des del mapa

L'Àlvar ho va posar per davant de tot (09/10/2026): des del mapa, o des de
qualsevol vista del graf, s'ha de poder fer la web del client. Amb bones
pràctiques W3C, integrable per API, fent servir els correus i la mateixa web
com a base de dades, DRY radical, al mínim cost i cap a la permaweb.

**On és:** a la pestanya Web, el botó **«Descarrega la web (.zip)»**. Hi ha
quatre camps opcionals: el nom, el correu on arriben els formularis,
l'adreça definitiva i la llengua (català o castellà). Des de Node fa el mateix:

```bash
node SOS/tools/web-del-mapa.js mapa.json carpeta/ --nom "El celler" --correu hola@exemple.cat --url https://elceller.example --llengua es
```

`mapa.json` és el que dona «Copia el JSON» a l'editor, o el `web.json` de la
pestanya. Qualsevol vista del graf que exporti aquest JSON pot fer la web.

**Què hi ha dins:**

| Fitxer | Per a què |
|---|---|
| `index.html` | La portada: una porta per a cadascú i els serveis en JSON-LD (`Organization` amb `makesOffer`) |
| `<rol>.html` | Una per porta: què et donem, què ens dones, la benvinguda i el formulari |
| `serveis.html` | Els processos amb els passos (`ItemList` de `Service`) |
| `equip.html` | El que passa a dins. No surt al menú i porta `noindex` |
| `gracies.html` | On va el formulari quan s'envia |
| `estil.css` | Un sol full d'estil, amb mode fosc |
| `web.json` | Les dades de la web, enllaçades des de cada pàgina |
| `permaweb.json` | L'empremta SHA-256 de cada fitxer |
| `404.html` | La pàgina que no hi és, amb `noindex` |
| `cerebro/` | **El cervell del projecte**, amb l'estructura que fixa el pla d'estratègia: `mapa-real.json` (la font, que l'editor torna a obrir igual) i `mapa-ideal.json` si n'hi ha, una fitxa per rol (`roles/`), per lliurament (`entregables/`) i per procés (`procesos/`), i `decisiones.md`, l'únic que s'escriu a mà |
| `CEREBRO.md` i `cerebro/indice.json` | **L'índex del cervell**: cada document amb el seu tema (la web, el mapa, rols, lliuraments, processos, decisions, regles) i la seva capa: pública (la web que s'indexa), per enllaç (les pàgines `noindex`) i equip (el que només viu al repositori). El mateix model que el cervell d'Events Penedès |
| `CLAUDE.md` | Les regles per a qui hi treballa, persona o IA: no s'edita a mà, cap clau al repositori, cada canvi en una PR |
| `LLEGEIX.md` | Com publicar-la (`LEEME.md` si és en castellà) |
| `netlify.toml` | Publica la carpeta, amb capçaleres de seguretat: CSP sense scripts i formularis només a la mateixa web |
| `robots.txt` i `sitemap.xml` | El sitemap, només si es dona l'adreça definitiva. Llavors cada pàgina porta també `canonical` i Open Graph |

**Com compleix el que es va demanar:**

- **Una sola font.** El mapa dona `web.json`, i `web.json` dona la web. Els
  HTML no es toquen a mà: es canvia el mapa i es torna a generar. El botó i
  `web-del-mapa.js` fan servir el mateix codi, el bloc `VS-SITE` de l'editor.
  Una prova comprova que les dues sortides són idèntiques byte a byte.
- **La web és la base de dades.** Cada pàgina porta les seves dades en
  JSON-LD de schema.org. Un cercador, una IA o una altra web les llegeix sense
  API, i `web.json` hi és per a qui ho vulgui sencer.
- **El correu és la safata d'entrada.** Cada porta amb relació té un
  formulari de Netlify Forms, i cada enviament arriba per correu. Si es
  connecta el CRM ([nivell 2](guia-zoho-nivell2.md)), també hi entra sol. Si
  la porta té compte, el botó diu «Demana el teu compte»: l'alta comença per
  correu fins que hi hagi un proveïdor d'accés (per defecte, Supabase Auth).
- **Cost zero de servidor.** HTML i CSS estàtics. Cap JavaScript i cap
  dependència: l'únic `<script>` de cada pàgina és el JSON-LD.
- **W3C.** Passa `html-validate` amb les regles recomanades sense cap error.
  Cada pàgina té `lang`, `charset`, `viewport`, un enllaç per saltar al
  contingut, `header`, `nav`, `main` i `footer` i `aria-current` al menú. Els
  camps tenen etiqueta, el focus és visible i els objectius fan 44 px.
- **Cap a la permaweb.** Tots els enllaços són relatius, i la web funciona igual
  des del disc, des de Netlify o des d'IPFS. El zip és determinista: el mateix
  mapa dona sempre els mateixos bytes. `permaweb.json` permet comprovar el que
  s'ha publicat.

**Per veure-la abans:** el botó «Vista prèvia» de la pestanya Web l'ensenya
al navegador, pàgina a pàgina, amb els enllaços i els formularis.

**Per publicar-la:** arrossega la carpeta a Netlify (Netlify Drop) o puja-la al
repositori del client. Netlify en detecta els formularis sol.

**Pendent:**

- Publicar a IPFS o Arweave des del mateix botó. Demana una cartera, i la clau
  ha de ser a la cartera de qui signa, mai al repositori.
- Els comptes de debò, per als rols de la llista `alta`.
- ✓ El zip ja és el repositori del client: el cervell (`cerebro/`),
  `CLAUDE.md`, `netlify.toml`, la 404, `robots.txt` i, amb l'adreça, el sitemap.
- ✓ El registre viu de transaccions (fase 2 del pla): vegeu el punt 3b.

## 3a · Fet: la marca i la proposta automàtica

**Demanat per l'Àlvar (10/10/2026):** que el disseny i els continguts de la web
es puguin personalitzar i automatitzar al màxim, i un sistema automàtic que
analitzi el que dona el client i en faci l'esborrany de la web.

**La marca.** El mapa dona l'estructura; `marca.json` hi posa la cara, sense
tocar cap HTML:

| Camp | A la web |
|---|---|
| `color` | El color d'accent, els botons i el menú. Si no arriba a 4,5:1 sobre el fons, s'enfosqueix (o s'aclareix al mode fosc) fins que hi arriba |
| `lletra` | `sans`, `serif`, `rodona` o `mono`, sempre del sistema: cap font externa |
| `forma` | `rodona` o `recta` |
| `logo` | Un SVG al costat de `marca.json`. Si porta scripts o enllaços, no s'hi posa |
| `lema`, `presentacio` | Sota el nom, a la portada i a la descripció |
| `portes` | Per a cada rol: el nom curt al menú i un paràgraf d'introducció |
| `contacte` | Adreça, telèfon i horari, a la portada i al JSON-LD |

A l'editor, la pestanya Web té el color, la lletra, la forma i dos camps per
carregar `marca.json` i el logo. Des de Node, `web-del-mapa.js --marca
marca.json`. El zip la desa a `cerebro/marca.json`: és l'altra font del
repositori del client.

**L'anàlisi i l'esborrany, d'un sol ordre:**

```bash
node SOS/tools/proposta.js propuesta/ --llengua es [--baixa https://el-negoci.example]
```

Llegeix `propuesta/fuentes/` (les pàgines desades, el catàleg, el CSS, el logo),
escriu `analisis.md` (qui hi surt i què s'hi dona, amb la frase on surt, i el
que la web no diu), `marca.json` i un esbós de mapa, i en fa la web: a
`web-esbozo/` mentre no hi hagi un `mapa.json` que passi les regles dures, i a
`web/` quan n'hi ha. `estado.md` diu el que falta. A l'arrel del cervell
escriu `EMPIEZA-AQUI.html`, **el backoffice del client**: si el negoci ja té
web, el que se li lliura no és una web nova sinó on segueix millorant-la. El que és criteri (els
intangibles, els noms dels rols) ho fa la sessió de Claude amb la skill
`propuesta-inicial`.

## 3b · Fet: el registre viu, el mapa real que surt de l'ús

Fase 2 del pla. Fins ara el mapa real sortia del taller, de la memòria de qui
hi era. Ara pot sortir de l'ús.

**On s'anota.** La web del client porta `registre.html`, fora del menú i dels
cercadors, enllaçada des de la pàgina de l'equip. És un formulari de Netlify
Forms: de quin rol a quin, quin lliurament (amb els del mapa per triar),
tangible o intangible, el valor percebut de 1 a 5, la data i un enllaç
d'evidència. Cada anotació arriba per correu. Cap servidor ni base de dades.

**Com es llegeix.** Netlify dona el CSV del formulari. Es carrega a la
pestanya Web de l'editor (camp «El CSV del registre») o es passa per Node:

```bash
node SOS/tools/llegeix-registre.js cerebro/mapa-real.json cerebro/registro/registre.csv cerebro/registro/ --llengua es
```

Tots dos fan servir el mateix codi, el bloc `VS-REG` de l'editor.

**Què en surt:**

| Sortida | Què diu |
|---|---|
| `informe.md` | Els fluxos vius (vegades, valor percebut, darrera data), els del mapa que no passen, el que passa i no és al mapa, i qui dona sense rebre |
| `mapa-observat.json` | El mapa que surt del registre, amb el dibuixat com a ideal. A l'editor, «Obre el mapa observat» ensenya la vista Desviació. Es pot desfer |
| `avisos.json` | El que la fase 3 enviarà per webhook, amb els noms del pla: `rol.sin_reciprocidad` i `desviacion.detectada` (flux sense ús o flux nou) |

**Cap dada personal.** Del CSV només es llegeixen rols, lliurament, tipus,
data, evidència i valor. Qualsevol altra columna (noms, correus, IP) es
descarta en llegir-lo, i una prova ho comprova. L'evidència només val si és
un enllaç `http(s)`.

**Pendent:** que el mapa observat s'actualitzi sol a cada enviament (una
funció de Netlify que rebi l'avís del formulari) i els webhooks de la fase 3.

## 3c · Fet: l'API i els avisos (fase 3 del pla)

**La web és l'API.** Per llegir, `web.json` i el JSON-LD de cada pàgina. Per
escriure, el formulari del registre: un `POST` de Netlify Forms. No hi ha cap
servidor propi.

**Els avisos.** El zip porta dues funcions de Netlify, que Netlify crida
soles: `submission-created`, a cada anotació del registre, i
`deploy-succeeded`, a cada publicació. Envien els avisos del pla a les
adreces de `TT_WEBHOOKS`, signats amb HMAC-SHA256 (capçalera
`X-TT-Signatura`) amb el secret de `TT_WEBHOOK_SECRET`. Sense secret, o a
una adreça que no sigui https, no s'envia res.

| Avís | Quan |
|---|---|
| `transaccion.creada` | Cada anotació al registre |
| `desviacion.detectada` | L'anotació no és cap flux del mapa, o un flux del mapa no passa |
| `rol.sin_reciprocidad` | Un rol dona i no rep res registrat |
| `cerebro.actualizado` | Cada publicació a producció |

Els dos del mig, quan depenen de tot el registre, surten de
`node eines/registre.mjs --envia`, al repositori del client.

**El cervell, per a Claude Code.** `.mcp.json` connecta `eines/mcp.mjs`, un
servidor MCP sense dependències amb tres eines: l'índex del cervell, llegir
un document i l'informe del registre. Només llegeix el que surt a l'índex.

**Un sol codi.** Tot surt dels blocs `VS-REG`, `VS-API` i `VS-MCP` de
l'editor, tal com hi són. `API.md`, al zip, explica com fer-ho servir.

**El cervell ja no es publica.** `netlify.toml` torna 404 per a `cerebro/`,
`eines/`, `netlify/`, les regles i `.mcp.json`: la capa «equip» de l'índex
només viu al repositori.

**Pendent:** donar d'alta els avisos amb el primer pilot (quina eina els
escolta) i l'accés de les persones de fora, quan hi hagi comptes de debò.

## 3d · Fet: el pagament, amb Stripe Checkout (mode de prova)

**Com es veu.** Si la web té claus de Stripe, el botó de la pestanya Web diu
**«Paga i publica-la a nom teu»**. Porta a la pàgina de pagament de Stripe
(targeta, Apple Pay o Google Pay). En tornar, l'editor pregunta si s'ha pagat
i el botó torna a ser «Publica-la a nom teu», amb el mapa i el nom on eren.
Sense claus, o des del disc, el botó publica sense pagar, com abans.

**El que es paga és el servei.** La plantilla és oberta (és en aquest
repositori públic). El pagament és per l'acompanyament, no per l'accés al codi.

**Dues funcions de Netlify, al web principal:**

- `netlify/functions/checkout.mjs`. `POST` crea la sessió de Checkout i en
  torna l'adreça. `GET ?session_id=cs_…` diu si s'ha pagat. `GET` sol diu si
  la web cobra. Les tornades surten de la `URL` de Netlify, mai de qui crida.
- `netlify/functions/checkout-completat.mjs`. L'avís de Stripe
  (`checkout.session.completed`). Comprova la signatura `Stripe-Signature`
  (HMAC-SHA256, cinc minuts de marge) abans de llegir res. Ara només ho anota;
  aquí s'hi penjarà el camí A.

**Variables d'entorn** (Netlify › Site configuration › Environment variables):

| Variable | Què és |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…`. Una `sk_live_` no s'accepta sense `STRIPE_LIVE=1` |
| `STRIPE_PRICE_ID` | `price_…` del producte de l'alta. L'import viu a Stripe, no aquí |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` de l'avís, a Stripe › Developers › Webhooks |
| `STRIPE_LIVE` | `1` només quan l'Àlvar decideixi cobrar de debò |

L'avís de Stripe s'apunta a `https://<web>/.netlify/functions/checkout-completat`,
amb l'esdeveniment `checkout.session.completed`. Per provar: la targeta
`4242 4242 4242 4242`, qualsevol data futura i qualsevol CVC. Apple Pay surt
a Safari amb una targeta a la cartera, i en mode de prova no cobra.

Les proves (`SOS/tests/test-stripe.mjs`, sense xarxa) i la pestanya Web amb
funcions falses (`test-vna-suport.mjs`, 7E) corren a la CI.

## 3e · Nou: l'arrencada amb IA, a partir del que el client ja té

**La revisió (10/10/2026).** Fins ara la web sortia només del mapa, i el text
l'havia d'escriure algú. El client, però, no arriba en blanc: té una web, uns
documents, un full de càlcul. I la promesa del SOS és que la feina de rutina
la prepara la IA i l'accepta una persona. Faltaven tres coses: portar el que ja
hi ha al cervell, que el text de les pàgines en pogués sortir, i que el client
pogués treballar-hi amb Claude sense nosaltres al costat.

**Què fa ara:**

- **Importar el que ja tenen** (bloc `VS-IMPORTA`). A la pestanya Web, «El que
  ja teniu»: s'hi pugen .html, .md, .txt i .csv, i el zip els porta a
  `cerebro/fonts/` en Markdown, amb la font i la data. No surt del navegador.
  Des de Node, `SOS/tools/importa.js` (sessió 0, abans que hi hagi repositori)
  i `eines/importa.mjs` (al repositori del client) també llegeixen una web:
  robots.txt, el sitemap i el menú, una pàgina cada segon (o el `Crawl-delay`).
- **Les dades personals, amb dos panys.** Correus, telèfons, DNI i IBAN
  s'amaguen al text. D'una taula, per defecte, només entra la capçalera i
  quantes files té: cada columna que hi va, la tria una persona (a l'editor, o
  `--columnes`), i una columna de persona no hi entra ni triada (veda 162).
- **Una web, només amb permís.** El rastrejador demana `--autoritzat <domini>`
  i no llegeix cap altre domini. L'autorització escrita del client va al CRM:
  en importar la seva web, en som encarregats del tractament.
- **Els continguts** (`cerebro/continguts/<id>.md`): el text de la portada, de
  serveis, de cada porta o de pàgines noves, en un Markdown petit que no pot
  trencar la web (res d'HTML, enllaços nets, imatges només pròpies). Un
  contingut amb un correu o un telèfon no surt, i el generador diu per què;
  només hi poden sortir el correu de la web i el telèfon de `cerebro/marca.json`.
- **Les tasques per a la IA** (`cerebro/tasques-ia.md` i `.json`): la regla de
  l'app (`VS-TASQUES`), copiada tal com és. Només compten els lliuraments que
  fa un rol de casa; un intangible no el fa mai la IA; el tipus surt del nom
  del lliurament i es diu per confirmar a la sala.
- **El kit de Claude:** `CLAUDE.md` (les regles), `TREBALLAR-AMB-CLAUDE.md` (la
  guia) i tres skills a `.claude/skills/`: `/importa`, `/continguts` i `/tasca`.
  La IA només fa esborranys; acceptar la PR és acceptar el text.
- **El repositori es refà sol.** `eines/genera.mjs` torna a fer la web amb el
  mateix codi que l'editor (`eines/motor.mjs`, que es copia a si mateix igual,
  byte a byte), llegeix els continguts i no trepitja mai el que s'escriu a mà:
  el mapa, les decisions, el dossier, les fonts, els continguts i els esborranys.

**Els plans de Claude, sense embuts (octubre de 2026).** Claude Code **no** és
al pla gratuït: demana un pla de pagament o una clau d'API. El camí gratuït és
claude.ai (pla Free): un projecte amb les instruccions de `CLAUDE.md`, el
repositori afegit amb la integració de GitHub (només llegeix) i les skills
pujades en zip. Claude hi llegeix el cervell i escriu el dossier, els textos i
els esborranys; el client els puja a GitHub amb una PR, o ens els envia. Ho
explica la guia, amb la data i l'enllaç als plans de cada moment.

**La sessió 0 (nou, per provar amb el primer pilot).** Amb el client: importem
el que ja té, en llegim el dossier i escrivim els primers continguts; la web
que surt ja parla com ell. No es promet res que no s'hagi escrit i acordat.

**El que queda obert:**

- **Els tipus de lliurament són de comunitat** (acta, informe, convocatòria,
  comanda…). En un negoci, pressupostos, propostes o respostes a consultes no
  hi encaixen, i al celler d'exemple la IA no en pot preparar cap: és la
  resposta honesta. Afegir-hi tipus és una decisió del SOS (`SOS/index.html`),
  no d'aquesta eina.
- **«pagament» i «factura» porten a `comanda`**, i un pagament no es redacta.
  Proposat al backlog.
- **PDF i Word** no es llegeixen: es llisten perquè els llegeixi la IA.

## 4 · La IA, pagada per ús

Dues opcions, i el client tria:

- **La clau és teva.** El proveïdor de la IA li factura directament. Nosaltres
  no hi som. És el que diu ara `/conecta/`.
- **Crèdits.** El client recarrega crèdits amb Apple Pay, i una funció de
  Netlify fa de pont amb la IA. Cada tasca es descompta al preu real que surt a
  `/conecta/#ia`. La clau és nostra i és al servidor.

**Decisió de l'Àlvar:** si els crèdits porten marge i quant. Mentre no ho
decideixi, el prototip els mostra a preu de cost i ho diu. Cap xifra de marge
va en aquest repositori, que és públic: va al privat.

## 5 · Desenvolupar amb el client, com ja treballem

Ara treballem en projectes de Claude: un fil per tasca, una memòria comuna i
PR que es revisen. El client hi entra igual:

- **Un projecte per client**, amb el seu repositori i el `CLAUDE.md` de la
  plantilla.
- **Un fil per flux del mapa.** Quan el client demana un canvi, s'obre un fil.
  Claude obre una PR i Netlify en publica una vista prèvia. El client la mira
  al mòbil i diu «sí» o «no».
- **El cost de cada fil és visible:** les tasques d'IA que ha fet, a preu real.

**Per comprovar abans de prometre-ho:** com es convida una persona de fora de
l'organització a un projecte, i què li cal per entrar-hi.

**Si el client treballa sol** (§3e): el kit de Claude del seu repositori. Amb
Claude Code, `/importa`, `/continguts` i `/tasca` obren PR; gratis, des d'un
projecte de claude.ai que llegeix el repositori, i el client puja el que surt.

## 6 · El que no es negocia

- **Cap clau al navegador.** Stripe, GitHub, Netlify i la IA només es criden
  des de funcions de servidor, amb les claus a les variables d'entorn.
- **Permisos mínims.** El token de GitHub només pot crear repositoris a partir
  de la plantilla, i el de Netlify, només llocs.
- **Cap dada personal als registres**, com a la funció de Zoho.
- **Res es cobra sense que el client hagi vist el desglossament per fluxos.**

## 7 · L'ordre

1. ✓ El mapa dona la web (`web.json`).
2. ✓ La web de debò, en un zip o des de Node (`web-del-mapa.js`).
   ✓ La marca i la proposta automàtica (`marca.json`, `proposta.js`).
   ✓ El registre viu (`llegeix-registre.js`, fase 2 del pla).
   ✓ L'API, els avisos signats i el servidor MCP del cervell (fase 3).
3. ✓ El repositori plantilla i el camí B: el botó de Netlify funciona sense que
   hàgim de guardar cap permís (`SOS/plantilla-web/`).
4. ✓ Stripe Checkout en mode de prova i la funció que verifica l'avís.
   ✓ L'arrencada amb IA: importar el que ja tenen, els continguts, les tasques
   per a la IA i el kit de Claude (§3e). Provar-la amb el primer pilot.
5. El camí A: crear el repositori i el lloc. Això demana tokens de servei
   de l'Àlvar.
6. Els crèdits d'IA, quan l'Àlvar hagi decidit el marge.
