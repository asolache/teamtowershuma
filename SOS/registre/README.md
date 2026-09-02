# Registre públic

Aquí no hi ha ni una sola transacció.

Això no és una limitació: **és el disseny**. Publicar qui va donar hores a qui
seria publicar dades de gent que no ho ha demanat, i el SOS existeix precisament
perquè aquella gent pugui confiar-hi.

El que hi ha és **el hash de cada apunt i els totals**. D'aquí surt la propietat
que volíem:

> verificable per tothom, llegible només per qui té el rebut.

Amb el teu rebut a la mà pots comprovar que el seu hash és al registre, i per
tant que aquella hora ja hi era en aquella data. Qui no el tingui veu una llista
de hashes que no li diu res de ningú.

## Com està organitzat

```
registre/
  index.json      ← el punter: quina és l'última versió i la cadena de mares
  v/<cid>.json    ← cada versió, immutable
```

Cada versió porta `parent`: el CID de l'anterior. **Actualitzable sense amo** vol
dir això — versions immutables i un punter que es mou. Qui no es refiï del
punter recorre la cadena des de qualsevol versió que ja tingués.

Una versió conté:

```json
{
  "type": "sos-register-pack",
  "scope":  { "nodes": 3, "persones": 41, "accions": 812 },
  "totals": { "hores": 1240, "euros": 0, "signats": 812, "encadenats": 812 },
  "root": "…",           // sha256 de totes les fulles
  "leaves": ["…", "…"],  // el hash de cada apunt, i res més
  "parent": "…",
  "signer": { "did": "did:sos:…" }, "sig": "…", "cid": "…"
}
```

## Com s'hi publica

Els dos camins de sempre: amb un token de GitHub el SOS deixa la versió i mou el
punter; sense, et dona el fitxer per obrir una PR.

**El punter s'actualitza després de la versió**, a posta. Si falla pel mig queda
una versió publicada que el punter encara no anomena —no s'ha perdut res— i mai
al revés, que seria un punter assenyalant un fitxer que no existeix.

## El que això prova, i el que no

- **Prova** que un apunt existia en la data d'una versió, i que qui la va signar
  ho va afirmar. Amb l'ancoratge a Nostr, la data no depèn ni tan sols de qui
  controla aquest repositori.
- **No prova** que el que diu l'apunt sigui cert. Això ho diu el vistiplau de
  l'altra banda, que viu al rebut, no aquí.
- **No impedeix** que qui controla el repositori deixi de publicar. No pot
  esborrar el passat —l'historial de git és públic i es pot forkejar— però sí
  aturar-se. Amb l'ancoratge es nota; sense, no.

## El número del Comando

La pel·lícula va d'un reclutament de **150.000 superherois** i cadascú té el seu
número. La manera fàcil de fer-ho seria un comptador en un servidor: el primer
que s'apunta és l'1. Seria mentida per tres motius alhora —hi hauria d'haver un
amo que el reparteix, es guanyaria escrivint un nom, i el dia que el servidor
caigués no hi hauria número enlloc.

Aquí **el número no l'assigna ningú: es dedueix**. És la posició en aquesta
llista append-only, i qualsevol la pot refer des de zero amb el mateix resultat.

Cada versió porta:

```json
"altes": ["uMUTdTfKD7rBjBYkPTLzgD", "…"],
"altesAbans": 4096,
"altesTotal": 4318,
"altesRoot": "…"
```

- **L'alta és un compromís, no una identitat.** `sha256('sos-alta-v1' | did:sos |
  hash de la primera aportació signada i encadenada)`, retallat a 22 caràcters.
- **Es guanya amb evidència.** Calen les dues coses, signatura i encadenat. Una
  alta sense res fet no dona número — la mateixa regla que el comptador dels
  150.000 ja feia servir.
- **L'ordre és el de publicació.** Les `ts` d'un apunt les escriu qui les escriu;
  el que no es pot retocar és en quina versió va aparèixer un compromís. Per això
  les altes són un **delta** amb la seva posició de sortida: endarrerir la data
  d'un apunt no acosta ningú al número 1.
- **Dins d'una versió mana la dada, no qui la munta.** L'ordre és per data de la
  primera aportació i, a igualtat, pel compromís.

I el que **no** és: **no és un rànquing.** L'ordre és de reclutament —quan vas
entrar—, no de mèrit. Qui té el número 12 no ha fet més que qui té el 40.000.

### Què revela, i què no

- **Del registre sol no se'n pot treure ningú.** Una llista de compromisos no
  permet enumerar persones ni saber què va fer cap.
- **Qui ja tingui el teu `did:sos` sí que hi pot trobar el teu número.** Les
  fulles són públiques a posta —és el que fa possible la prova d'inclusió—, i amb
  el teu did i les fulles el compromís es pot refer. No es pot evitar sense
  trencar el que ho fa útil, que és que qualsevol ho pugui verificar sense
  demanar permís a ningú. Es diu aquí en comptes de fer veure que no passa.
- **El número no es desa enlloc**: es dedueix cada cop que es mira. Un número
  desat és un número que un dia divergirà del registre.

## Què costa, i qui ho paga

**A qui es dona d'alta no li costa res**, i no és una promesa comercial sinó una
propietat: el compromís es calcula al seu navegador i **no puja res des del seu
dispositiu**. Ni compte, ni cartera, ni clau.

Publicar sí que té un cost, i és aquest:

| | mida | cost |
|---|---|---|
| una alta | ~26 bytes | — |
| una versió (fins a ~3.900 altes) | < 100 KiB | **0 €** — Turbo/ArDrive no cobra per sota de 100 KiB |
| els 150.000 sencers | 3,72 MB en ~39 versions | **0 €** aprofitant el llindar |
| els 150.000, pagant-ho tot a tarifa | 3,72 MB | **≈ 0,09 $** |

Preu de referència: **24,7 $/GiB**, setembre de 2026 — 11,03 AR/GiB
(arweavefees, juliol de 2026) × 2,24 $/AR. Va amb la data a sobre a posta: una
xifra de diners sense data menteix en silenci al cap d'un any.

El càlcul el fa `pesRegistre()` amb el paquet de debò a la mà i surt a la
pantalla del registre, així que si demà el compromís es fa més llarg o el preu
canvia, la xifra canvia sola. La projecció **no és** una estimació escrita en un
comentari.

Tres coses que aquesta taula no diu i s'han de dir:

- **El que creix no són les altes, són les fulles.** Cada apunt del registre hi
  posa un hash, i això sí que puja amb l'activitat de la xarxa. El dia que una
  versió passi de 100 KiB deixarà de ser gratuïta i la pantalla ho dirà amb la
  xifra; la sortida és publicar les fulles per trams, com ja es fa amb les altes.
- **Gratis no vol dir per sempre garantit.** El llindar de 100 KiB és una
  decisió d'un proveïdor i pot canviar. El que no canvia és l'ordre de magnitud:
  amb pagament complet, el registre sencer val cèntims.
- **El camí gratuït de debò segueix sent aquest repositori.** Arweave és el que
  fa que duri més que nosaltres, no el que el fa existir.

## Fer-lo permanent

El repositori es pot esborrar i els relés no guarden res per sempre. Perquè una
versió duri de debò, es pinna a Arweave (pagament únic) o a IPFS (mentre algú el
pinni).

**El SOS no puja res**: dona el fitxer i el CID, diu on portar-lo, i es queda
l'adreça on has dit que l'has posat. Sense adreça no desa res — un ancoratge del
qual no saps tornar no és un ancoratge.

## Estat

Buit a posta, com `supply/` i `canal/`. No hi ha cap versió inventada.
