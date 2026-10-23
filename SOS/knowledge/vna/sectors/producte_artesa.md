---
tipo: modelo
de: casa
rol: [production, sales, marketing]
fase: crea
sector: [private]
visible: pública
estado: borrador
etiquetas: [veda, mapa-de-valor, producte-artesa]
---

# 🧶 Producte artesà / manufactura · la veda del flux de valor

> **Veda de bones pràctiques, no cas.** Ve dels mapes tipus de l'app i del mètode, completada amb el que el mapa necessita per complir les regles (`BONES`). És el punt de partida que el sistema ofereix per defecte; quan una sessió real ensenyi una altra cosa, guanya el cas (`../casos/`) i, a la segona vegada, el patró (`../patrons.md`).

**Per a qui.** Producció física en petit format, taller propi o compartit.

<!--TT-MAPA-->
## El mapa de referència

**Qui fa de «tu».** Artesans/es: qui promou el projecte. 6 rols i 9 relacions.

| Qui dona | A qui | Què | | Qui ho fa |
|---|---|---|---|---|
| Proveïdors locals | Artesans/es | matèria primera km0 | es paga | es decideix a la sessió |
| Artesans/es | Proveïdors locals | comandes estables i pagament just | es paga | ⚙ la prepara la màquina, la revisa una persona |
| Artesans/es | Punt de venda | producte acabat | es paga | es decideix a la sessió |
| Punt de venda | Artesans/es | liquidació de vendes | es paga | ⚙ la prepara la màquina, la revisa una persona |
| Punt de venda | Clientes | venda i assessorament | es paga | es decideix a la sessió |
| Clientes | Punt de venda | ingressos | es paga | es decideix a la sessió |
| Clientes | Artesans/es | retorn i encàrrecs a mida | no es paga | una persona |
| Artesans/es | Clientes | història i traçabilitat de la peça | no es paga | una persona |
| Artesans/es | Comunitat i formació | ofici i tallers | no es paga | una persona |
| Comunitat i formació | Artesans/es | aprenents i renovació | no es paga | una persona |
| Comunitat i formació | Clientes | cultura del fet a mà | no es paga | una persona |
| Clientes | Comunitat i formació | demanda que valora l'ofici | no es paga | una persona |
| Punt de venda | Proveïdors locals | previsió de demanda | es paga | es decideix a la sessió |
| Proveïdors locals | Punt de venda | estoc i terminis | es paga | ⚙ la prepara la màquina, la revisa una persona |
| Comunitat i formació | Proveïdors locals | coneixement del material | no es paga | una persona |
| Proveïdors locals | Comunitat i formació | restes i materials per practicar | es paga | ⚙ la prepara la màquina, la revisa una persona |
| Qui ho explica (premsa, xarxes) | Artesans/es | relat i visibilitat | no es paga | una persona |
| Artesans/es | Qui ho explica (premsa, xarxes) | històries i accés al taller | no es paga | una persona |

**La bona pràctica.** L'ofici es ven pel relat: qui l'explica fora del taller hi aporta tant com el punt de venda.

**Per posar-ho en marxa.** Prototipar 3 referències → Muntar el taller → Preus i marges → Primer canal de venda → Iterar amb el retorn de la clientela → Escalar producció.

_Generat per `SOS/tools/build-models-mapa.js` des de `SOS/lib/models-mapa.js`; «qui ho fa» és la regla del tauler de l'app. No s'edita a mà._
<!--/TT-MAPA-->

## Els intangibles que ja se saben

_Els que no es paguen i qualsevol projecte del sector necessita: la base. El que diferencia cada marca al mercat són els seus intangibles propis, els que només ella genera; la sessió i la IA els busquen a part i no es copien d'aquí._

- **Qui ho explica → artesans: relat i visibilitat.** L'ofici es ven pel relat de com es fa.
- **Proveïdors locals ↔ artesans: matèria i compromís.** La qualitat comença abans del taller.
- **Comunitat i formació → artesans: relleu.** Sense aprenents, l'ofici s'acaba amb qui el fa.

## El que sol faltar

- Qui explica l'ofici fora del taller (premsa, xarxes, botigues que en parlen).
- El retorn a la comunitat que t'ha format o et forma.

## Com es pregunta a la sessió

- Qui explica la teva feina quan tu no hi ets?
- Què et donen els teus proveïdors a més del material?
- Qui aprèn de tu, i què et torna?

## Senyals que la xarxa està sana

- Els clients saben explicar com es fa el que compren.
- Els proveïdors avisen abans d'un canvi.
- Hi ha algú aprenent l'ofici.
