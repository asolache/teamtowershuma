# molekulon.org · pla de la web pública del Comando

> **Això és un pla, no una obra feta.** Escrit el 2026-09-20 a partir de
> l'inventari del repositori: cada peça que es cita més avall existeix al disc i
> es pot obrir. El que no existeix surt marcat com a **falta**, i la llista de
> faltes és la part important del document — sense aquelles peces, la web es pot
> construir però no es pot llançar.

---

## L'encàrrec

> «He comprado el dominio molekulon.org y me gustaría que el proyecto del comando
> se ubique en esta web: repasar todo lo creado en teamtowershuma.com del comando
> Molekulon y hacer una web que lo integre todo, donde se presente el proyecto y
> todos los servicios y conceptos —Molekulandia, la película, los recursos
> existentes, la escuela de superhéroes.»

Tres coses, i la tercera és la que decideix les altres dues: **un domini**, **una
web que integra**, i **començar a donar-la a conèixer**.

---

## 1 · Què ja existeix (i on és)

El Comando no s'ha d'inventar: ja són **nou pàgines, set documents i onze vídeos**
escampats dins del SOS. El problema d'avui no és que falti material — és que el
material entra per la porta d'una eina de gestió comunitària, i qui ve pel còmic
no hi arriba mai.

### Pàgines que ja es poden reutilitzar

| Peça | Fitxer | Què hi ha, de debò |
|---|---|---|
| El Comando | `SOS/comando.html` (66 KB) | La tesi dels 150.000, els sis eixos, els 14 herois canònics, els 11 vídeos, els nivells, el perfil |
| Molekulandia | `SOS/molekulandia.html` (65 KB) | El poble, els 11 edificis, les 9 professions, els números i d'on surten |
| Molekulon · estat líquid | `SOS/molekulon.html` (39 KB) | 7 federacions, 11 cases, l'esquelet de 19 nodes contra els 47 d'un país sòlid |
| La Fàbrica de Superherois | `SOS/escola.html` (63 KB) | El programa de 6 a 13 anys, la guia metodològica, dades dels infants, avaluació |
| Formació | `SOS/formacio.html` (121 KB) | 16 mòduls de N0 a N3, amb un itinerari sencer de Comando · reputació · multivers |
| El joc | `SOS/joc.html` (92 KB) | Planta, defensa i activa el territori, a ritme |
| La Biblioteca de les Coses | `SOS/biblioteca.html` (39 KB) | Les superarmes: què val cada préstec |
| El Banc de Temps | `SOS/banc-temps.html` (38 KB) | Els superpoders: una hora val una hora |
| El blog | `SOS/blog.html` (45 KB) | 5 entrades del Comando (origen, síntesi, seny, rauxa, perfil) + 5 més del SOS |
| La intro | `SOS/intro.html` (50 KB) | 16 plans que expliquen el SOS — **no** la història del Comando |

### El saber escrit (la font del text, ja redactada)

- `knowledge/vision/comando-peli.md` — la tesi, els sis eixos, els 14 herois, la taula de mitjans i el que falta.
- `knowledge/vision/comando-intro.md` — el guió de la intro: **15 plans, 1:55**, amb què està filmat (3) i què s'ha de filmar (12).
- `knowledge/vision/molekulon-estat-liquid.md` — la decisió d'arquitectura del món líquid i les seves vuit guardes.
- `knowledge/codex.md` V12, V13, V17, V18 — la mitologia d'origen, els canals transmèdia i la definició de superheroi.
- `knowledge/references/pantheon-12.md` — els 12 arquetips de competències (CC BY, Pantheon.work).
- `knowledge/marketing/guia-estil-marca.md` — veu, valors i el que no s'escriu mai.
- `knowledge/marketing/social-posts.md` — la trilogia Shiva · Shakti · Molekulon, llesta per publicar.
- `prompts/narrative_kit.md`, `prompts/character_dossier.md`, `prompts/molekulon_invite.md` — els intents d'IA del kit narratiu.

### Els mitjans

11 vídeos publicats (`youtu.be/...`), 1 tema local (`SOS/media/comando-horacio.mp3`),
1 playlist de capítols. **Pendents d'enllaç** (ho diu el generador, no la memòria):
Pigmentón, Fraktalman, Tekno Kartoffeln i «un taller, filmat».

### El que el repositori **no** té

**Ni una sola imatge del Comando.** `SOS/media/` conté un mp3 i res més; les dues
pàgines del Comando i de Molekulandia no tenen ni un `<img>`. Tot el que hi ha és
tipografia, color i emoji. Per a una eina de gestió és una decisió defensable; per
a una web que ven un còmic, una banda i una pel·lícula, **és el forat principal**.

---

## 2 · Les tres decisions d'arquitectura

### 2.1 · Un domini nou no és un projecte nou

La decisió ja està presa i escrita a `molekulon-estat-liquid.md`: **fork del
model, no del codi**. Es manté. Una còpia de les pàgines del Comando a un segon
repositori divergiria la primera setmana, duplicaria 31 guardes de CI i partiria
el registre en dos.

Per tant: **un sol repositori, un sol desplegament, dos dominis amb dues portades
diferents.** El contingut del Comando es genera un cop i es publica a les dues
cases; el que canvia entre elles és **per on s'hi entra i a qui se li parla**.

### 2.2 · Com se serveix molekulon.org

| | Com es fa | Cost | Risc |
|---|---|---|---|
| **A · Alias de domini** (recomanada) | `molekulon.org` s'afegeix com a *domain alias* del lloc de Netlify que ja hi ha, i `_redirects` encamina l'arrel d'aquest amfitrió a `/molekulon/index.html` | Zero: un desplegament, un CI, un certificat | Cap de tècnic. Cal ordenar bé les regles per amfitrió |
| **B · Segon lloc de Netlify** | Un segon site del mateix repositori amb `base = molekulon/` | Dos desplegaments per commit, dues configuracions | Divergència de capçaleres i de redireccions |
| **C · Repositori propi** | Fork de codi | Alt i creixent | El que el projecte diu que no s'ha de fer |

**Es fa A.** És reversible: el dia que molekulon.org tingui vida pròpia i càrrega
suficient, passar a B és moure una carpeta i canviar un `base`.

### 2.3 · Què és canònic, i què és mirall

Això decideix el SEO i s'ha de decidir **abans** d'escriure la primera pàgina, no
després:

- A partir del llançament, **molekulon.org és canònic** per a tot el que és
  Comando, Molekulandia, escola i pel·lícula. Cada pàgina porta
  `<link rel="canonical">` cap a molekulon.org.
- `teamtowershuma.com/comando`, `/molekulon`, `/molekulandia` i `/escola`
  **segueixen funcionant** (hi ha enllaços impresos i dits de viva veu) però
  passen a **301** cap a molekulon.org. Les tres variants de cada adreça
  (`/x`, `/sos/x`, `/SOS/x`) es mantenen, com mana `_redirects` avui.
- teamtowershuma.com es queda el que és seu: la consultora, el mètode VNA, el
  catàleg, el pressupost i l'aplicació SOS. **Una frase a cada casa apunta a
  l'altra**, i cap de les dues intenta vendre el que ven la veïna.

---

## 3 · El mapa de molekulon.org

Dotze pàgines i **una regla d'ordre**: no s'ordena pel que hi ha, s'ordena per la
pregunta que es fa qui arriba. Primer *què és això*, després *ensenya-m'ho*,
després *què hi puc fer jo*, i al final *qui ho signa*.

| # | Adreça | Pàgina | D'on surt el contingut | Estat |
|---|---|---|---|---|
| 1 | `/` | **Portada** · la primera pel·lícula que farem 150.000 persones | `comando-peli.md` (tesi + 6 eixos) | **nova** |
| 2 | `/historia` | **La història** · els dos còmics, i l'acte III que s'està rodant | `codex.md` V17 + `comando-intro.md` | **nova** |
| 3 | `/personatges` | **Els 14 herois** · poder, superarma, què vol dir en un equip | `CANONICAL_HEROES` de `SOS/index.html` | generada del model |
| 4 | `/peli` | **La pel·lícula** · el guió de 15 plans, què està filmat i què falta | `comando-intro.md` | **nova**, generada |
| 5 | `/musica` | **La banda** · 11 videoclips, temes i directes | taula de mitjans de `build-comando.js` | reaprofita `comando.html` |
| 6 | `/comic` | **El còmic** · els dos números publicats i on es compren | — | **nova · falta material** |
| 7 | `/molekulandia` | **Molekulandia** · el poble, 11 edificis, 9 professions | `SOS/molekulandia.html` | ja feta, es reemmarca |
| 8 | `/estat-liquid` | **Un estat líquid** · 7 federacions, 19 nodes contra 47 | `SOS/molekulon.html` | ja feta, es reemmarca |
| 9 | `/escola` | **La Fàbrica de Superherois** · 6 a 13 anys, i l'Escola de Superpoders | `SOS/escola.html` | ja feta |
| 10 | `/recursos` | **El que ja tens** · banc de temps, biblioteca, joc, kit narratiu | `banc-temps`, `biblioteca`, `joc` | agregadora **nova** |
| 11 | `/uneix-te` | **Fes el teu personatge** · els quatre passos i les dues portes | `comando-peli.md` §«Com hi entra una persona» | adapta `SOS/uneix-te.html` |
| 12 | `/qui-som` | **Qui ho signa** · TeamTowers Humà, el SOS, contacte i avisos legals | `guia-estil-marca.md` | **nova · falta dada legal** |

Més `/blog` (les 5 entrades del Comando, separades de les del SOS) i `/premsa`
(dossier descarregable), que són pàgines de difusió i no de producte.

**El menú serà de quatre grups**, com el del SOS i per la mateixa raó: *La
història · El món · Entra-hi · Qui som*. Es declara a un generador i s'escriu a
totes les pàgines, mai a mà.

---

## 4 · El que s'ha de construir al repositori

Aquest repositori té una llei: **el que es pot derivar, es deriva; i el que es
promet, ho vigila una guarda que peta al CI**. La web nova no n'és excepció.

### Codi nou

1. **`molekulon/`** — carpeta nova a l'arrel, amb les 12 pàgines autocontingudes.
   S'ha de **declarar a `knowledge/taxonomia.md`** (cara `obra`) i regenerar
   `build-mapa.js`, o la guarda 21 peta amb «carpeta sense cara».
2. **`SOS/tools/build-molekulon-web.js`** — genera de les llistes ja declarades:
   herois (`CANONICAL_HEROES`), mitjans, els 15 plans del guió, els sis eixos, les
   federacions i les cases. Cap d'aquestes taules es torna a escriure a mà.
3. **`SOS/tools/build-nav-molekulon.js`** — el menú de les 12 pàgines, amb el seu
   `--check`, igual que `build-nav.js` fa al SOS.
4. **`SOS/tools/check-molekulon-web.js`** — la guarda de promeses de la web nova:
   - cap enllaç a un vídeo, una pàgina o un fitxer que no existeixi;
   - tot heroi citat és a `CANONICAL_HEROES` (la veda 109/112 ja ho obliga);
   - tota pàgina té `<title>`, `description`, `og:*`, `canonical` i `lang`;
   - cap peça de mitjans marcada com a publicada sense URL;
   - les xifres (150.000, 19 nodes, 16 mòduls, 14 herois) surten del model.
5. **`molekulon/sitemap.xml` i `robots.txt`** generats, no escrits.
6. **JSON-LD** per pàgina: `Organization`, `CreativeWorkSeries` (el còmic),
   `Movie` en preproducció, `Course` (escola i formació), `Event` (els directes).
   La veda JSON-LD del kernel ja ho demana per a tot.
7. **`_redirects`** — les regles per amfitrió de molekulon.org, més els 301 des
   de teamtowershuma.com, amb el comentari del *per què* al costat, com la resta
   del fitxer.

### El que **no** es fa

- No es duplica `SOS/index.html`. L'aplicació segueix sent una i viu on viu; des
  de molekulon.org s'hi entra per enllaç.
- No hi ha comptes, ni contrasenyes, ni analítica que segueixi ningú (vedes
  *Zero localStorage* / *Local-First*). Si es vol mesurar, es mesura amb
  comptadors agregats i es diu a la pàgina.
- No es publica cap xifra de participació que no surti del registre públic.
  Avui `SOS/registre/index.json` **és buit a posta**: el comptador dels 150.000
  ha de dir «0 de 150.000» i explicar-ho, no inventar-se un número.

---

## 5 · El que necessito de tu (i sense què no es pot llançar)

Ordenat per si bloqueja o no. **Els cinc primers bloquen el llançament.**

### Bloquegen

1. **DNS de molekulon.org.** El domini és a **Porkbun** i ja té assignats els
   quatre servidors de nom de **Netlify DNS** (`dns1..dns4.p09.nsone.net`): la
   zona ja existeix al costat de Netlify i el que falta és **apuntar-hi el
   registrador**. El procediment, pas a pas, a §5.1bis.

   L'única dada que necessito abans de tocar-hi res: **si molekulon.org ha de
   tenir correu**. Delegar els NS mou *tota* la zona a Netlify, i els `MX`, `SPF`
   i `DKIM` que hi hagi a Porkbun deixen de servir-se el mateix moment en què el
   canvi propaga. Si hi ha correu, o es recreen a Netlify DNS **abans** de
   canviar els NS, o es fa la variant sense delegació.
2. **Imatges.** És el forat gran: avui el repositori no en té cap.
   El mínim per obrir: **portada del còmic 1 i 2**, **6–10 vinyetes** en alta
   resolució amb permís de publicació, **14 retrats de personatge** (encara que
   siguin retalls de vinyeta), **un logotip del Comando** en SVG i **una imatge
   social** (1200×630) per pàgina. Si hi ha fotos dels directes, millor: la prova
   que «això no és només dibuix» és el pla 6 del guió.
3. **Qui signa, legalment.** Nom fiscal, NIF, adreça i correu de contacte per a
   l'avís legal i la política de privacitat. Si hi haurà formulari de contacte o
   butlletí, també qui és el responsable de les dades.
4. **Llicència del contingut.** Còmic, música i textos: què es pot copiar i què
   no. La proposta és **CC BY-SA** per als textos i el material d'aula, i drets
   reservats per al còmic i la música amb permís explícit de citació. Cal que ho
   confirmis: es publica a `/qui-som` i condiciona el dossier de premsa.
5. **Els quatre enllaços que falten**: Pigmentón, Fraktalman, Tekno Kartoffeln i
   el taller filmat. Si encara no existeixen, es publiquen com a «encara no hi
   són» —que és el que fa la pàgina d'avui— però cal dir-ho tu, no endevinar-ho jo.

### 5.1bis · El DNS, pas a pas

**Via A · delegar a Netlify DNS** (la que toca, perquè els NS ja estan assignats)

1. **Porkbun** → *Domain Management* → `molekulon.org` → *Authoritative
   Nameservers* → *Edit*. S'esborren els quatre de Porkbun (`…ns.porkbun.com`) i
   s'hi posen aquests quatre, un per línia i sense punt final:
   `dns1.p09.nsone.net` · `dns2.p09.nsone.net` · `dns3.p09.nsone.net` ·
   `dns4.p09.nsone.net`.
2. **Netlify** → el lloc `teamtowershuma.netlify.app` → *Domain management* →
   *Add domain alias* → `molekulon.org`, i el mateix amb `www.molekulon.org`.
   La zona de Netlify DNS i el lloc han de ser **del mateix equip**; si no, hi ha
   zona i hi ha lloc, i no es troben.
3. Esperar la propagació: minuts en el cas normal i fins a 48 h en el pitjor,
   segons el TTL que tenia Porkbun. Es comprova amb `dig NS molekulon.org`: quan
   responguin els `nsone`, ja hi és.
4. El certificat HTTPS (Let's Encrypt) el demana Netlify sol quan el domini
   resol. Si no surt, *Domain management → HTTPS → Verify DNS configuration*.
5. Llavors, i no abans, entren les regles de `_redirects` per amfitrió i els 301
   des de teamtowershuma.com (§4.7).

**Via B · deixar el DNS a Porkbun** (si hi ha correu al domini i no es vol moure)

No es toquen els NS. A Porkbun → *DNS Records*:

| Tipus | Host | Valor |
|---|---|---|
| `ALIAS` | (buit: l'arrel) | `teamtowershuma.netlify.app` |
| `CNAME` | `www` | `teamtowershuma.netlify.app` |

Porkbun serveix `ALIAS` a l'arrel, i això permet **no clavar cap IP** al
registre: una IP escrita a mà és una avaria ajornada al dia que Netlify la
canviï. A Netlify es fa igualment el pas 2. Els `MX` es queden on són i el correu
no se n'assabenta.

**Quina de les dues.** Si al domini no hi penja correu ni cap altre servei, la
**A**: un sol lloc on mirar el dia que una cosa no resolgui. Si hi ha correu i no
el vols moure avui, la **B**, que és reversible i no té cap desavantatge per a un
lloc estàtic.

### No bloquegen, però decideixen la forma

6. **Llengües.** Català i castellà (com el SOS) o també anglès? Mig traduir és
   pitjor que no traduir; el cost de l'anglès és real i s'ha de decidir ara,
   perquè afecta els generadors i les adreces.
7. **On es compren els còmics.** Enllaç d'Amazon (o el que sigui), preu, ISBN i
   si es poden ensenyar pàgines de mostra.
8. **Els canals.** Confirmació dels comptes reals: YouTube `@comando-molekulon`,
   Instagram `@comando_molekulon`, SoundCloud `/comando-molekulon`. El codex els
   dona per fets; cal comprovar que existeixen i que hi tens accés.
9. **Butlletí.** Avui **cap formulari del repositori envia res sol** i una guarda
   ho vigila. Per recollir correus cal triar destinació (Netlify Forms, un
   servidor de llistes, o un correu) i assumir-ne la conseqüència de privacitat,
   que s'escriurà a la pàgina.
10. **Escola.** Si el programa de la Fàbrica es ven, quin preu i a qui; si es
    regala, amb quina llicència. I si hi ha centres pilot que es puguin citar
    amb nom —una escola amb nom val més que tres paràgrafs de mètode.
11. **Diners.** Si el llançament ha de portar micromecenatge, quota o donació per
    a la pel·lícula: quina plataforma i què es promet a canvi. Si no, millor:
    una porta menys i una promesa menys.
12. **La intro filmada.** Dels 15 plans, 12 s'han de fer i «la major part és
    material del còmic que s'ha d'animar». Un teaser d'1:55 és, de llarg, la
    peça de difusió amb més retorn. Cal saber qui l'anima i per quan.

---

## 6 · Donar-la a conèixer

La web no és la campanya: és **on aterra** la campanya. L'ordre importa.

**Abans d'obrir**
- Les 12 pàgines amb OG i imatge social pròpia. Un enllaç compartit sense imatge
  perd la meitat dels clics i no es recupera.
- `sitemap.xml`, `robots.txt`, JSON-LD i els 301 des de teamtowershuma.com.
- Dossier de premsa a `/premsa`: què és el projecte en 5 línies, 10 imatges en
  alta, els enllaços als vídeos i un contacte amb nom i telèfon.
- Una pàgina que **es pugui ensenyar en una reunió d'escola** sense explicar res.

**La primera setmana**
- El teaser de la intro (o, si encara no hi és, **un dels 11 vídeos que ja
  existeixen**: La Bomba Disco a la Floresta és el que millor prova la tesi).
- La trilogia Shiva · Shakti · Molekulon de `social-posts.md`, ja escrita, un
  post per dia, cadascun tancant a una pàgina diferent de molekulon.org.
- Correu a la llista de contactes del CRM (`SOS/crm.html`) segmentat en tres:
  escoles, entitats i gent del Comando.

**El primer mes**
- **Premsa local i comarcal**: l'angle que funciona no és «una web nova», és
  «un còmic fet al Penedès vol fer una pel·lícula amb 150.000 persones».
- **Escoles**: la Fàbrica de Superherois és l'única peça del projecte amb
  comprador clar i calendari propi (el curs). Una sessió pilot filmada val per
  tot el trimestre.
- **Un directe**: la banda ja existeix i ja ha tocat. Un concert amb la pàgina
  projectada al fons converteix millor que qualsevol anunci.
- **Wikipedia/Wikidata i directoris de còmic** només quan hi hagi premsa que
  s'hi pugui citar. Abans, no.

**El que es mesura**: pàgines vistes per pàgina, clics als vídeos, altes de
personatge i descàrregues del dossier. Res que identifiqui ningú.

---

## 7 · Fases

| Fase | Què entrego | Depèn de |
|---|---|---|
| **0 · Decisions** | Aquest document, aprovat o corregit | Tu. Els punts 1–5 del §5 |
| **1 · Esquelet** | `molekulon/` amb les 12 pàgines, menú, generador i guarda al CI. Text real, imatges de marcador | Res més que la decisió |
| **2 · Domini** | molekulon.org servint, HTTPS, 301 des de teamtowershuma.com, sitemap | DNS (§5.1) |
| **3 · Cara** | Imatges, portades, retrats, OG per pàgina, favicon | Material (§5.2) |
| **4 · Llançament** | `/premsa`, dossier, butlletí si es vol, els tres posts | Legal i llicència (§5.3, §5.4) |
| **5 · Pel·lícula** | Pàgina del guió viva, amb el teaser quan hi sigui | L'animació (§5.12) |

Les fases 1 i 2 són independents de tot el que has de decidir tu, i es poden
començar avui. La 3 i la 4 no: sense imatges i sense avís legal, una web es pot
publicar però no es pot ensenyar.

---

## 8 · El que aquest pla no resol

- **Que hi hagi 150.000 persones.** La web no recluta ningú per si sola; el que
  fa és que qui arriba entengui què se li demana en menys d'un minut.
- **El repartiment del còmic.** Vendre'l a Amazon i vendre'l a una llibreria del
  barri són dues feines diferents i aquesta només en facilita la primera.
- **El manteniment.** Dotze pàgines més són dotze pàgines que envelleixen. Per
  això van generades i amb guarda: perquè el dia que una xifra deixi de ser
  certa, peti el CI i no se n'assabenti primer un visitant.
