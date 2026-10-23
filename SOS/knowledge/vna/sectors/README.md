---
tipo: proceso
de: casa
rol: [strategy, systems]
fase: crea
visible: pública
estado: borrador
etiquetas: [veda, mapa-de-valor]
---

# Vedes de sector · el que ja se sap del flux de valor

Una veda per cada model i sector de `SOS/lib/models-mapa.js` (21). «Veda» vol dir veritat: aquí, el que la pràctica de cada sector ja té clar (recursos humans, màrqueting, comunicació, vendes, producció, operacions, logística: tot ja està inventat), dit com a bona pràctica i no com a cas.

**Què hi ha a cada fitxer**

- **El mapa de referència**: generat per `SOS/tools/build-models-mapa.js` entre `<!--TT-MAPA-->` i `<!--/TT-MAPA-->`, des del mateix model que fa servir l'app i /cliente/. Diu qui dona què a qui, si es paga o no, i qui ho fa segons la regla del tauler (⚙ ho prepara la màquina i ho revisa una persona; els intangibles i els diners, sempre una persona). No s'edita a mà.
- **Els intangibles que ja se saben**: la base comuna del sector. El que diferencia cada marca són els seus intangibles propis; aquests no són aquí, els busca la sessió amb el client.
- **El que sol faltar**, **Com es pregunta a la sessió**, **Senyals que la xarxa està sana**: escrits a mà.

**Com circula**

`build-models-mapa.js` llegeix les seccions i les posa a `models-mapa.js` (`veda: {clau, preguntes, falta}`); /cliente/ les envia amb el model i la IA (`netlify/functions/pule-mapa.mjs`) les fa servir com a base, buscant a part el que fa única la marca. `--check` falla si una veda no hi és, li falta una secció o el mapa no està al dia.

**Regles**: sense noms de persones ni d'empreses, sense xifres que no es puguin refer. Quan una sessió real ensenyi una altra cosa, guanya el cas (`../casos/`) i, a la segona vegada, el patró (`../patrons.md`). Aquestes vedes són verdats d'un àmbit (el flux de valor); les del còdex són decisions a partir dels errors (neti-neti).
