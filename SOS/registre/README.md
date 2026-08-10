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

## Fer-lo permanent

El repositori es pot esborrar i els relés no guarden res per sempre. Perquè una
versió duri de debò, es pinna a Arweave (pagament únic) o a IPFS (mentre algú el
pinni).

**El SOS no puja res**: dona el fitxer i el CID, diu on portar-lo, i es queda
l'adreça on has dit que l'has posat. Sense adreça no desa res — un ancoratge del
qual no saps tornar no és un ancoratge.

## Estat

Buit a posta, com `supply/` i `canal/`. No hi ha cap versió inventada.
