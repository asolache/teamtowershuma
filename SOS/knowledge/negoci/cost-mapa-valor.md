# El mapa de cost · d'on surt un preu

> Fins al setembre del 2026 la portada publicava la tarifa del taller Fent Pinya
> i de les demostracions castelleres per trams. Ja no. Aquest document explica
> **què s'ha canviat, per què, i quin mètode ocupa el lloc** — i és la font del
> que genera `SOS/tools/build-oferta.js` a la portada (`#cost`) i al README.

---

## 1 · Per què el taller i les demos no publiquen preu

Una tarifa publicada és una promesa. El que costa un taller depèn de tres coses
que **no es poden endevinar des d'una pàgina**:

- **Quanta gent hi ha.** De 10 a 1.000 persones no és el mateix nombre de
  monitors, ni de músics, ni de faixes.
- **Quanta colla cal moure.** Una demostració de quatre pisos són tretze
  castellers; una de sis, trenta. La diferència no és estètica: és logística.
- **A quina distància.** El desplaçament de vint o trenta persones canvia el
  pressupost més que qualsevol altra partida.

Publicar-ne una xifra tancada vol dir una de dues, i totes dues són dolentes:

1. **Es diu alta** perquè cobreixi el pitjor cas, i espanta la meitat dels que
   haurien trucat — inclosos els que hi haurien encaixat de sobres.
2. **Es diu baixa**, i s'ha de desdir a la proposta. Que és pitjor: el client ja
   ha portat la xifra a una junta i ara ha de tornar-hi a explicar per què ha
   pujat.

La sortida no és amagar el preu. **És publicar el mètode**, de manera que qui
llegeix pugui fer el càlcul pel seu compte abans de trucar. Un preu que només es
pot saber trucant és un preu que qui no truca no sabrà mai.

> **Nota sobre el tarifari intern.** Les tarifes del catàleg comercial 2026
> segueixen buidades a [`cataleg-teamtowers-2026.md`](cataleg-teamtowers-2026.md)
> perquè són el registre del document i la referència de partida per pressupostar.
> **No es publiquen a la web.** Si es decideix que tampoc han de ser al
> repositori, es treuen d'allà i no de dos llocs.

---

## 2 · Els quatre passos

El mètode és el mateix per a tot el catàleg, i és **el mateix mapa de valor que
ensenyem a fer**. Això no és una coincidència de màrqueting: si el nostre
pressupost es fes d'una altra manera que la que ensenyem, una de les dues coses
seria mentida.

### 1 · Es dibuixa la feina com un mapa de valor

Quins **rols** la fan i quins **intercanvis** hi ha entre ells. Al SOS això és
literal: `node.vna.roles` i `node.vna.exchanges`. Un encàrrec és una xarxa de
valor petita, amb els seus fluxos tangibles (una sessió, un informe, un
muntatge) i els seus intangibles (la preparació, la relació amb el client, el
criteri que hi posa qui decideix).

### 2 · Cada rol porta les seves hores

Les hores **surten dels fluxos del mapa**, no d'una intuïció. Això té una
conseqüència que val la pena dir en veu alta: si un flux no és al mapa, no es
cobra; i si hi és, es pot discutir. Un pressupost deixa de ser una xifra a
prendre o deixar i passa a ser una llista que el client pot retallar.

### 3 · Cada rol té el preu del seu nivell

Tres nivells, i el que els separa **no és l'antiguitat**. És evidència
registrada al SOS —la mateixa que acredita un gestor o un mentor a la formació—
i qualsevol la pot verificar sense confiar en nosaltres.

| Nivell | Què fa | Com s'acredita | €/h |
|---|---|---|---|
| **N1 · Practicant** | Executa la feina acompanyada: recull, registra, prepara sessions, sosté el dia a dia | Perfil actiu i aportacions signades al registre | 35 |
| **N2 · Gestor/a** | Sosté un node sencer sol: facilita, mapa, governança, comptes i seguiment | > 20 h registrades i 3 comunitats acompanyades, o una iniciativa liderada | 55 |
| **N3 · Mentor/a** | Dissenya l'encàrrec, hi posa el criteri, decideix davant del client i forma els altres | > 50 h, 3 comunitats, 2 iniciatives o una graduada, i gestors formats | 80 |

**Sense IVA.** És tarifa **proposada** per al 2026: encara no s'ha facturat prou
vegades per dir-ne una altra cosa, i dir-ho val més que la venda que es perdi.
Es revisa cada any.

La proposta diu sempre **quina persona fa quines hores i a quin nivell**. Un
pressupost que diu «40 h de consultoria» amaga precisament la pregunta que
decideix: qui les farà.

**Per què tres i no cinc.** Perquè tres és el mínim que distingeix executar de
sostenir i de decidir, i cada esglaó de més s'ha de poder acreditar amb una
evidència diferent. Un esglaó que no es pot acreditar és un esglaó que serveix
per pujar el preu i prou.

### 4 · Les despeses directes, al seu preu de factura

Desplaçaments, materials, lloguers, músics, monitors castellers, assegurances i
tercers. **Sense marge amagat a sobre.** Si en algun cas es revenen amb marge,
es diu quin: és una decisió comercial legítima i amagar-la no ho és.

---

## 3 · La contractació per hores del sector públic

Una administració que contracta serveis professionals sovint no compra un
paquet: compra hores. L'escala de dalt és exactament la taula que es presenta en
aquest cas, i el formulari de [`SOS/pressupost.html`](../../pressupost.html) la
calcula en directe.

Per què això és millor que una tarifa plana:

- **És defensable en un expedient.** Cada hora té un nivell, i cada nivell té un
  criteri escrit i verificable.
- **Deixa contractar barreges.** Quaranta hores de N2 amb vuit de N3 costen el
  que costen, i el client veu on va cada euro.
- **No premia l'antiguitat.** Premia el que hi ha fet, que és el que li
  interessa a qui paga.

El **sostre dels 5.000 €** dels paquets segueix vigent i és una altra cosa: és el
que un ajuntament contracta sense obrir expedient llarg, i s'aplica a l'entrada
de la forquilla.

---

## 4 · Què encara no hi ha

Escrit perquè no es confongui amb una omissió:

- **Les hores per rol de cada paquet no estan declarades.** El catàleg publica la
  forquilla i el que la mou, no el desglossament d'hores. Fer-ho voldria dir
  declarar-lo per als vint-i-tres paquets, i mig fet seria pitjor que no fet.
- **Els preus unitaris de les despeses directes tampoc.** Un monitor casteller,
  un músic o un lloguer de faixes tenen un cost real que no és meu d'inventar:
  quan es documenti, entra aquí.
- **Condicions de reserva i cancel·lació.** Segueixen sense existir enlloc, i és
  la primera pregunta que fa qui contracta un esdeveniment. Al backlog.
