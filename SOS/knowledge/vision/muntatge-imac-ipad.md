# Muntatge del SOS des d'un iMac vell i un iPad

Pla de configuració real per treballar amb SOS des de dos aparells que ja tens,
sense servidor, sense compte i sense pagar res (excepte l'ancoratge permanent, que
és opcional i de pagament únic).

La idea que ho ordena tot: **l'iMac és la casa i l'iPad és la butxaca.** La còpia
mestra de dades viu a l'iMac; l'iPad és el que va al terreny i torna amb valor
registrat. Els dos signen amb la **mateixa identitat**, i és per això que el
primer pas és la identitat i no cap altre.

---

## 0 · Abans de començar: què cal de veritat

| | Mínim | Per què |
|---|---|---|
| **iMac** | Un navegador modern: Chrome, Edge o Firefox actualitzats | El Safari antic dels iMacs vells no porta `CompressionStream` ni Ed25519. Si el macOS ja no accepta Chrome nou, Firefox ESR sol arribar més enrere. |
| **iPad** | Safari (o Chrome) actualitzat | A iOS tots els navegadors són Safari per dins; no cal triar. |
| **Xarxa** | El mateix wifi per sincronitzar | La sincronització és directa entre navegadors. Sense wifi comú, es fa igual amb el QR o copiant el codi. |
| **Còpies** | Un llapis USB o una carpeta al núvol que ja facis servir | Per guardar la còpia de la identitat i els paquets d'ancoratge. |

**Prova de foc, 30 segons.** Obre el SOS a cada aparell i mira si surt el tauler.
Si surt, el navegador serveix. Si es queda en blanc, és massa vell: al iMac,
instal·la Firefox; a l'iPad, actualitza iOS.

---

## 1 · La identitat, primer de tot

Tot el que el SOS signa —cada hora registrada, cada vot, cada acció del registre
públic— va signat amb el teu `did:sos`. Aquesta clau **neix dins el navegador i
no en surt sola**. Dues conseqüències que has de saber abans que et passin:

- Si esborres les dades del navegador de l'iMac, la identitat desapareix.
- Si obres el SOS a l'iPad sense fer res més, l'iPad genera una identitat
  **diferent**: al registre hi hauria dues persones on n'hi ha una.

### Passos

1. **A l'iMac**, obre `🆔 La meva identitat digital` → **⭳ Exporta còpia
   xifrada**. Posa una contrasenya llarga (una frase que recordis, no una
   paraula) i descarrega el fitxer `sos-identitat-….json`.
2. **Guarda'l en dos llocs** que no siguin el mateix aparell: el llapis USB i la
   carpeta al núvol, per exemple. El fitxer està xifrat: si algú el troba sense
   la contrasenya, no hi pot fer res.
3. **Apunta la contrasenya en paper** i guarda-la separada del fitxer. No hi ha
   cap manera de recuperar-la — ni jo ni ningú la té.
4. **A l'iPad**, obre el SOS → `🆔 La meva identitat digital` → **⭱ Restaura una
   còpia** → carrega el fitxer i escriu la contrasenya. Et demanarà confirmació
   perquè l'iPad ja tenia una identitat pròpia: confirma-ho.
5. **Comprova-ho**: el DID que surt a l'iPad ha de ser idèntic al de l'iMac.

### Opcional però recomanat: passkey

A cada aparell, al mateix panell, **🔐 Vincula passkey**. A l'iPad això lliga la
identitat al Face ID / Touch ID i la sincronitza pel clauer d'iCloud. És una
segona via d'accés, **no** una còpia de seguretat: la còpia xifrada del pas 1
segueix sent imprescindible.

---

## 2 · Sincronització entre els dos aparells

La sincronització és **directa de navegador a navegador** (WebRTC). No hi ha
servidor ni compte: els dos aparells es connecten i es passen tot el teu SOS.
Mentre la finestra queda oberta, **els canvis viatgen en viu** als dos sentits.

### Primera vegada

1. A l'**iMac**: `🔗 Sincronitza amb un altre dispositiu` → **① Crea invitació**
   → **🔗 Copia enllaç d'invitació**.
2. Envia't l'enllaç a l'**iPad** pel canal que vulguis (Missatges, Notes,
   AirDrop, correu). També pots apuntar la càmera de l'iPad al **QR**, que ja
   porta l'enllaç a dins.
3. A l'**iPad**, obre l'enllaç: el SOS s'obre amb el codi **ja carregat** i a la
   pantalla de qui rep. Prem **Genera resposta**.
4. Torna la resposta a l'**iMac** (copia-la o comparteix-la) i enganxa-la.
   Connectats.

Quan connecteu, cada costat **et diu qui és** —nom i `did:sos`— abans que res es
fusioni. Si el nom que surt no és qui esperaves, desconnecta.

### Cada dia

Mentre les dues finestres estan obertes i connectades, no has de fer res: el que
registres a l'iPad apareix a l'iMac a l'instant. Quan tanques, la connexió cau i
cal tornar a aparellar; el SOS **recorda amb qui vas sincronitzar l'última
vegada** i t'ho diu en obrir la pantalla.

> **Limitació coneguda, dita clara:** cal repetir l'aparellament cada sessió. No
> hi ha ni codi de sala ni reconnexió automàtica. Està identificat i pendent —
> mira "Què encara no hi és" al final.

---

## 3 · El registre i l'ancoratge permanent

El **registre públic d'accions** (`#/registre`) és la llista cercable de tot el
valor aportat, amb la firma de cada acció verificada de debò en obrir-lo. Viu al
teu aparell: és teu.

Perquè una tercera persona pugui demostrar d'aquí a cinc anys que aquestes
accions ja hi eren avui, cal **ancorar-lo**: publicar-ne una empremta en un lloc
que ningú pugui reescriure.

### Ancoratge gratuït · Nostr

Publica l'arrel a relés públics. **A l'iPad no hi ha extensions de navegador**,
així que la signatura Nostr (NIP-07) només te la podràs fer a l'iMac amb Alby o
nos2x instal·lats a Chrome/Firefox. **Fes els ancoratges Nostr des de l'iMac.**

### Ancoratge permanent · Arweave

1. Al registre: **🛰 Ancora** → es calcula l'arrel de totes les accions, es signa
   i es verifica a la mateixa pantalla. **⭳ Descarrega** el JSON: en descarregar-lo
   queda apuntat automàticament a **🛰 Els meus ancoratges**.
2. Puja'l a [arweave.app](https://arweave.app) des de l'**iMac** (necessites una
   cartera Arweave amb saldo; és pagament únic per fitxer, cèntims per un JSON
   d'aquesta mida).
3. Torna a **🛰 Els meus ancoratges** i **enganxa l'enllaç d'Arweave** al camp de
   l'ancoratge. A partir d'aquí saps què vas segellar, quan, i on és publicat.

### Comprovar que un ancoratge segueix valent

Obre **🛰 Els meus ancoratges**: cada entrada et diu si el que vas segellar
**segueix intacte** al registre d'avui, quantes accions han canviat i quantes
n'has fet de noves des de llavors. Un ancoratge que no es pot tornar a comprovar
no demostra res.

Per verificar un paquet que t'ha passat **una altra persona**: **🔍 Verifica un
paquet SOS** → enganxa'l o carrega'l. Et dirà de quin tipus és, si la firma i la
integritat quadren, i qui el va signar. Tot es comprova al teu aparell: el
paquet no s'envia enlloc.

> **Per què des de l'iMac i no des de l'iPad:** crear i custodiar una cartera
> Arweave a Safari d'iPad és incòmode i fràgil (l'emmagatzematge del navegador es
> pot buidar sol). L'iPad registra valor; l'iMac notaritza.

### Alternativa sense cartera

Si no vols tocar cripto: **⭳ Descarrega** el pack i guarda'l amb data a la teva
carpeta de sempre. Ja té firma i CID; qualsevol el pot verificar. No és
inalterable per tercers, però prova què deies i quan davant de qui es fiï de tu.

---

## 4 · Vinculacions · què lliga amb què

| Vinculació | On es fa | Per a què serveix |
|---|---|---|
| **Passkey ↔ identitat** | Panell d'identitat | Accés amb Face ID / Touch ID |
| **Persona ↔ node** | Socis del node | Que les teves hores comptin i entrin al teu cromo |
| **Rol del mapa ↔ entitat real** | Pestanya Mapa de valor | Que el mapa deixi de ser un dibuix i apunti a organitzacions que existeixen |
| **Node ↔ node** | Pestanya Ecosistema (MATRIU) | Que el fons cooperatiu vegi els recursos de tota la xarxa |
| **Carta d'intercanvi ↔ node xifrat** | Panell d'identitat → copia la carta; l'owner l'enganxa | Que puguis desxifrar un node privat sense compartir cap contrasenya |
| **Node ↔ Nostr** | Ancoratge Nostr | Prova pública amb data del `mainHash` |

L'ordre que funciona: **identitat → soci d'un node → registrar valor → vincular
els rols del mapa a entitats reals → ancorar**. Saltar-se el primer pas és el que
fa que després no quadri res.

---

## 5 · Rutina diària que ho manté sa

1. **Matí, iPad**: obre el SOS, registra el que has fet i tanca ofertes/demandes
   des del tauler, sense navegar enlloc.
2. **Vespre, iMac**: obre els dos, sincronitza, i revisa el tauler (⚠️ *Reclama
   la teva atenció*).
3. **Cada divendres**: exporta el CSV del registre i guarda'l amb data.
4. **Cada mes**: ancora el registre i, si escau, puja'l a Arweave.
5. **Cada cop que canviïs d'aparell o de navegador**: torna a exportar la
   identitat.

---

## 6 · Què encara no hi és (dit clar)

Perquè el pla no prometi el que el programa no fa avui:

- **Codi de sala per sincronitzar**: avui cal l'intercanvi manual de codis cada
  vegada. Un codi curt compartit que connectés sol està pendent.
- **Reconnexió automàtica**: si es talla el wifi, cal tornar a aparellar.
- **Lectura de QR des de dins del SOS**: el QR es genera, però l'escaneig es fa
  amb la càmera del sistema; el SOS encara no llegeix codis.
- **Pujada a Arweave des del SOS**: es prepara el paquet, la pujada és manual.
- **Nostr a l'iPad**: sense extensions no hi ha signatura NIP-07.
- **`updateAtles` no és idempotent**: repetir el descobriment d'entitats pot
  duplicar-ne. Defecte conegut, anotat al backlog.
