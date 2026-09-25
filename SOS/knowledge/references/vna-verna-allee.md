# Verna Allee · Value Network Analysis

Metodologia per analitzar xarxes de valor multi-actor, més enllà de la cadena de valor lineal.

## Principis
- **Rols funcionals** (què fa la persona) no càrrecs (com es diu al organigrama)
- **Intercanvis tangibles** (béns, serveis, hores, diners) i **intangibles** (confiança, coneixement, pertinença, reconeixement)
- **Reciprocitat**: pocs fluxos unidireccionals sostinguts; les xarxes sanes són bidireccionals
- **Densitat** distribuïda — evitar topologia estrella (tot passant pel nucli)
- **Diversitat** de rols i de tipus d'intercanvis

## Les tres anàlisis
El que fa que això sigui un mètode i no una manera de dibuixar. Van pel seu nom
a `/SOS/vna` i a `SOS/tools/build-mapavalor.js`, perquè qui busca el mètode
l'ha de poder reconèixer:

- **Anàlisi d'intercanvi** — el patró sencer: qui dona i no rep, quins vincles
  van en un sol sentit, quins nodes estan carregats de més.
- **Anàlisi d'impacte** — node per node: què rep, què li costa rebre-ho i què hi
  guanya. És la que explica per què hi ha gent que plega sense queixar-se.
- **Anàlisi de creació de valor** — què aporta cada node i què costaria no
  tenir-lo. És la que troba **el valor que ja es produeix i no es cobra**.

## La notació
Quatre paraules i prou. Un mapa amb quinze símbols no el llegeix ningú a una
sala, i a la sala és on s'ha de llegir.

| | Què és |
|---|---|
| **Node** | Un rol, no una persona ni un càrrec |
| **Transacció** | Una fletxa amb direcció, d'un node a un altre |
| **Tangible** | Línia plena: el que es podria facturar |
| **Intangible** | Línia discontínua: el que no consta i sense el qual res funciona |
| **Entregable** | El que se'n decideix. El mapa és l'eina, no l'entregable |

Les dues menes es distingeixen **pel traç i no només pel color**: un mapa que
només es llegeix distingint el blau del magenta deixa fora qui més necessita
que el dibuix sigui clar.

## Aplicació a SOS
Cada nodo (comunitat, projecte, MATRIU) manté un mapa VNA `{roles, exchanges}`. Els indicadors de salut `buildHealth` mesuren reciprocitat, densitat, diversitat i rols aïllats.

## El cas treballat
`build-mapavalor.js` declara un celler del Penedès que es planteja servir
turisme de luxe: 7 nodes i 16 transaccions, 7 intangibles. Serveix per ensenyar
la tesi sencera en un sol dibuix —**el marge no surt d'apujar el preu de
l'ampolla, surt de cobrar els intangibles que la casa ja produeix i que pel
canal se'n van de franc**— i porta una guarda que no es pot relaxar: **cap
xifra d'euros**. No tenim els números d'aquell celler i inventar-ne per
il·lustrar un marge seria el que la guia de marca prohibeix. El que sí que es
diu és el que el graf té: pel distribuïdor, 2 lliuraments i cap intangible; pel
camí del visitant, 8 i 3 intangibles.

## Font
Verna Allee, *The Future of Knowledge: Increasing Prosperity through Value Networks* (2003), *Value Networks and the True Nature of Collaboration* (2011).
