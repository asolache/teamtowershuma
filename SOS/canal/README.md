# Canal asíncron

Aquest directori és una **bústia**, no un taulell.

El relé del SOS dona presència en viu, i per això demana que dues persones hi
siguin **alhora**. En un poble això no passa gairebé mai: la gent obre l'app el
diumenge al vespre, i no totes el mateix diumenge. Un canal que exigeix
simultaneïtat és un canal que no s'usa.

Un repositori git, en canvi, és un bus **asíncron, durable, versionat, amb
historial i auditable**. Cadascú hi deixa el seu paquet quan pot; qui arriba
després, se'l troba. I cada clon, cada fork i cada CDN que el serveix és una
còpia més del registre: com més gent el fa servir, més difícil és perdre'l.

## Per què això funciona

Perquè des de V64 els apunts són **idempotents**: cada apunt porta la seva
firma, cada autor encadena els seus, i fusionar dos ledgers és quedar-se'ls tots
dos. Un directori al qual tothom afegeix **convergeix sol**, sense que ningú
hagi de decidir qui va primer. Amb la cadena única d'abans això hauria estat
impossible.

## Què hi ha a dins d'un paquet

```json
{
  "type": "sos-channel-pack",
  "theme": "banc-de-temps",
  "nodeId": "…", "nodeName": "…",
  "enc": { "iv": "…", "ct": "…", "alg": "AES-GCM" },
  "signer": { "did": "did:sos:…" }, "sig": "…"
}
```

El contingut va **xifrat amb la clau del node** (V29). El repositori és públic;
el que hi ha a dins només el llegeix qui ja és del node. Qui no té la clau veu
que hi ha un paquet i no en pot treure res — que és exactament el que ha de
passar.

## Tres regles que no es relaxen

- **El transport no dona veritat.** En llegir, es verifica el sobre **i cada
  apunt per separat**. El que no porta firma vàlida es descarta encara que
  vingui d'aquest repositori. Confiar en l'origen és com es cola una fuita.
- **Qui no té la clau no llegeix res.** No es publica mai en clar sense dir-ho.
- **Publicar dues vegades no fa mal.** La unió és idempotent; es pot reintentar
  sense pensar-hi.

## Com s'hi aporta

Dos camins, i el primer no demana permís a ningú:

1. **Per pull request** — el SOS et dona el fitxer, l'afegeixes aquí i obres una
   PR. És el mateix camí que l'atles i que `SOS/supply/`.
2. **Amb el token de GitHub** — si en tens un configurat, el SOS deixa el fitxer
   directament al repositori.

## Estat

Buit a posta. No hi ha cap paquet inventat, igual que a `SOS/supply/`.
