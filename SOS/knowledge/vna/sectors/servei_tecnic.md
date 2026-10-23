---
tipo: modelo
de: casa
rol: [sales, operations, marketing]
fase: crea
sector: [private]
visible: pública
estado: borrador
etiquetas: [veda, mapa-de-valor, servei-tecnic]
---

# 💼 Consultoria / servei tècnic · la veda del flux de valor

> **Veda de bones pràctiques, no cas.** Ve dels mapes tipus de l'app i del mètode, completada amb el que el mapa necessita per complir les regles (`BONES`). És el punt de partida que el sistema ofereix per defecte; quan una sessió real ensenyi una altra cosa, guanya el cas (`../casos/`) i, a la segona vegada, el patró (`../patrons.md`).

**Per a qui.** Consultoria, disseny, IT, arquitectura, assessoria — projecte per projecte.

<!--TT-MAPA-->
## El mapa de referència

**Qui fa de «tu».** Consultors/es: qui promou el projecte. 6 rols i 9 relacions.

| Qui dona | A qui | Què | | Qui ho fa |
|---|---|---|---|---|
| Consultors/es | Clients institucionals | entregable especialitzat | es paga | es decideix a la sessió |
| Clients institucionals | Consultors/es | honoraris | es paga | es decideix a la sessió |
| Consultors/es | Clients privats | entregable especialitzat | es paga | es decideix a la sessió |
| Clients privats | Consultors/es | honoraris | es paga | es decideix a la sessió |
| Xarxa de partners | Consultors/es | revisió entre iguals | no es paga | una persona |
| Consultors/es | Xarxa de partners | sub-encàrrecs | es paga | es decideix a la sessió |
| Nucli operatiu | Consultors/es | administració i comercial | no es paga | una persona |
| Consultors/es | Nucli operatiu | % de facturació | es paga | una persona |
| Clients institucionals | Nucli operatiu | licitacions i marc de contractació | es paga | es decideix a la sessió |
| Nucli operatiu | Clients institucionals | documentació i justificació | es paga | ⚙ la prepara la màquina, la revisa una persona |
| Clients privats | Xarxa de partners | recomanació | no es paga | una persona |
| Xarxa de partners | Clients privats | capacitat extra quan cal | es paga | es decideix a la sessió |
| Nucli operatiu | Xarxa de partners | contractes marc | es paga | es decideix a la sessió |
| Xarxa de partners | Nucli operatiu | fiabilitat i compliment | no es paga | una persona |
| Clients institucionals | Clients privats | cas d'ús públic replicable | no es paga | una persona |
| Clients privats | Clients institucionals | validació de mercat | no es paga | una persona |
| Antics clients | Consultors/es | referències i casos | no es paga | una persona |
| Consultors/es | Antics clients | seguiment i novetats | no es paga | una persona |

**La bona pràctica.** Al servei tècnic, el següent client arriba per un cas que ja ha funcionat: cuida qui ja hi ha passat.

_Generat per `SOS/tools/build-models-mapa.js` des de `SOS/lib/models-mapa.js`; «qui ho fa» és la regla del tauler de l'app. No s'edita a mà._
<!--/TT-MAPA-->

## Els intangibles que ja se saben

_Els que no es paguen i qualsevol projecte del sector necessita: la base. El que diferencia cada marca al mercat són els seus intangibles propis, els que només ella genera; la sessió i la IA els busquen a part i no es copien d'aquí._

- **Antics clients → consultors: referències i casos.** El següent encàrrec arriba per un cas que ha funcionat.
- **Xarxa de partners ↔ consultors: encàrrecs i coneixement.** Ningú cobreix tot sol tots els fronts.
- **Clients → consultors: el problema ben explicat.** Un encàrrec mal dit és un projecte que es torça.

## El que sol faltar

- El seguiment de qui ja ha estat client: és qui més recomana i qui menys es cuida.
- El coneixement que torna de cada projecte a l'equip.

## Com es pregunta a la sessió

- Quin client antic et recomanaria avui sense dubtar? Quan hi vas parlar per última vegada?
- Amb qui comparteixes encàrrecs, i què et dona a part dels diners?
- Què aprèn l'equip de cada projecte, i on queda escrit?

## Senyals que la xarxa està sana

- Els encàrrecs nous venen de clients antics o de partners.
- Cada projecte deixa un cas explicable.
- Els partners et passen feina i tu a ells.
