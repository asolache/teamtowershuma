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

### Camí B · «Ho vull a nom meu»

Dos tocs més, i tot és seu des del primer minut.

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

**Per publicar-la:** arrossega la carpeta a Netlify (Netlify Drop) o puja-la al
repositori del client. Netlify en detecta els formularis sol.

**Pendent:**

- Publicar a IPFS o Arweave des del mateix botó. Demana una cartera, i la clau
  ha de ser a la cartera de qui signa, mai al repositori.
- Els comptes de debò, per als rols de la llista `alta`.
- ✓ El zip ja és el repositori del client: el cervell (`cerebro/`),
  `CLAUDE.md`, `netlify.toml`, la 404, `robots.txt` i, amb l'adreça, el sitemap.
- ✓ El registre viu de transaccions (fase 2 del pla): vegeu el punt 3b.

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
   ✓ El registre viu (`llegeix-registre.js`, fase 2 del pla).
3. El repositori plantilla i el camí B: el botó de Netlify funciona sense que
   hàgim de guardar cap permís.
4. Stripe Checkout en mode de prova i la funció que verifica l'avís.
5. El camí A: crear el repositori i el lloc. Això demana tokens de servei
   de l'Àlvar.
6. Els crèdits d'IA, quan l'Àlvar hagi decidit el marge.
