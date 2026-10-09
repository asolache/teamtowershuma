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
És el que llegirà la plantilla de la web del pas 3.

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

## 3 · Per fer: la plantilla que llegeix `web.json`

Un repositori plantilla amb:

- Un generador que fa una pàgina per porta i les pàgines «Serveis» i
  «Per a l'equip», a partir de `web.json`. Així el SOS ja treballa: HTML
  estàtic, sense dependències.
- Els formularis de cada porta («Què ens dones») passen a ser
  [formularis de Netlify](guia-zoho-nivell2.md). Si el client té un CRM, entren
  al CRM sols, com ja fa el diagnòstic.
- **Els comptes** només per als rols de la llista `alta`. Hi ha d'haver un
  proveïdor d'accés: per defecte, Supabase Auth, que ja fem servir i té pla
  gratuït.
- `CLAUDE.md` i una carpeta de memòria, perquè qualsevol sessió de Claude Code
  sàpiga les regles del client des del primer moment.

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
2. La plantilla que llegeix `web.json` i el camí B: el botó de Netlify
   funciona sense que hàgim de guardar cap permís.
3. Stripe Checkout en mode de prova i la funció que verifica l'avís.
4. El camí A: crear el repositori i el lloc. Això demana tokens de servei
   de l'Àlvar.
5. Els crèdits d'IA, quan l'Àlvar hagi decidit el marge.
