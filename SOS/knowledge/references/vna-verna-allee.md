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

## L'abast: no es fa un sol mapa

En una organització gran **no es mapa tota la casa en un sol dibuix**: es fa
**amb zoom**. Un nivell primer —la direcció, el comitè, el consell rector— i el
que hi ha dins de cada node es mapa a part si la decisió ho demana. Un mapa de
quaranta nodes no es llegeix a una sala, i a la sala és on s'ha de llegir.

I la conseqüència que ha de constar **abans de signar**: *segons la criticitat
de l'anàlisi, pot caldre més d'una sessió*. No és un extra que es descobreix a
mitja feina — és el que decideix la mida de l'encàrrec, i per això surt al pas 0
del procés (`PROCES` a `build-mapavalor.js`) i al camp `perque` del paquet
`mapa-organitzacio`.

**Precisat per l'Àlvar el 02/10/2026**, i a IKEA és exactament el que es va fer:
**dos mapes, el de la direcció i el de l'àrea de serveis** (fila a
`SOS/knowledge/negoci/trajectoria.md`).

Això és el mateix gest que l'eina ja fa al mapa del SOS: els llocs de dins
surten al centre i clicar-hi els fa el mapa sencer. El zoom de la metodologia i
el zoom de l'eina són la mateixa idea, i no és casualitat — l'un va sortir de
l'altre.

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

## Fonts

**L'original.** Verna Allee, *The Future of Knowledge: Increasing Prosperity
through Value Networks* (2003) i *Value Networks and the True Nature of
Collaboration* (2011).

**La pràctica en castellà.** «Cómo hacer tu primer análisis de la red de valor»,
**Pantheon.work**, 30/11/2018 —
`pantheon.work/blog/2018/11/30/como-hacer-tu-primer-analisis-de-la-red-de-valor/`
Aportat per l'Àlvar el 02/10/2026.

Pantheon aplica el VNA de Verna Allee com a **metodologia central** i el
descriu com un exercici **ràpid i no invasiu** que dona informació completa
d'una organització, que **promou una reflexió col·lectiva** sobre com funciona
de debò, i que —a diferència d'altres anàlisis— **destapa els intangibles**: els
intercanvis no regulats que són els que de veritat marquen la diferència quan
es genera valor.

> ⚠ **No s'ha pogut llegir sencer.** `pantheon.work` està bloquejat pel proxy
> de sortida d'aquest entorn, i del que hi ha a dalt només consta el que es pot
> verificar des de fora: títol, data, autoria i el marc del mètode. **El pas a
> pas del procés que proposa l'article no s'ha incorporat**, i per tant les
> coincidències i diferències amb el nostre `PROCES` de deu passos estan sense
> comparar. L'Àlvar ha dit que passarà un document amb més detall del flux: és
> el que falta per tancar-ho.

*Pantheon.work ja és font d'aquesta casa per una altra cosa: el panteó de 12
(`references/pantheon-12.md`, CC BY). Són dos documents del mateix lloc i
conviuen bé.*
