---
tipo: propuesta
de: huma
rol: [red, personas]
fase: crea
visible: privada
estado: borrador
etiquetas: [boreal, formacio]
---
# L'aigua com a escola · cada planta, un sector nou al voltant

> **Demanat per l'Àlvar el 16/11/2026:** «Boreal Light me gustaría enfocarme
> también como un partner en el sentido de la formación […] forman a todos
> estos roles y disciplinas cuando ponen una máquina allí […] pero se genera
> también una industria con el agua, ¿no? Gente va a estudiar, se crea
> escuela, se crea cultivos, se crea agua para servicios, se crea, por decir,
> un segundo sector.» I, el mateix dia, per a la seva web: «donde hay agua
> potable surge todo».
>
> **Això és un esborrany per validar (regla 10), no una sessió.** El mapa el
> dibuixa qui hi és. Com a `aigua-solar-xarxa.md`, aquí el fabricant no té nom
> ni xifres: l'acord i els imports viuen al repositori privat d'estratègia
> (`holding/negocio/`) fins que confirmi l'aliança i l'Àlvar ho digui. La seva
> web personal sí que explica que conèixer-lo va ser la presa de consciència
> que funda el seu treball de psicòleg comunitari: és la seva història, no un
> acord.

## La idea

Una planta d'aigua solar no és una màquina: **és la llavor d'un sector**. On
abans no hi havia aigua bona, l'endemà hi ha qui l'ha de cuidar, qui la fa
servir per regar, qui hi obre un servei i qui en treu un producte. I tot això
s'ha d'aprendre.

Bona part de l'operació d'una planta es fa a distància, amb una targeta SIM,
sensors i automatització (ho diu l'Àlvar; la proporció exacta no es publica
fins que tingui font). **El que no es pot fer a distància és la comunitat.**
Aquest és el forat on entra la matriu, i on entra l'Àlvar com a psicòleg
comunitari.

## Què ja existeix i no es torna a fer (DRY)

| Peça | On viu |
|---|---|
| Les vuit disciplines de la planta i l'evidència N1 i N2 de cadascuna | `aigua-solar-xarxa.md` |
| Els nivells N0 a N3 i la certificació per evidència al ledger | `SOS/formacio.html` · `negoci/formacio-mentoria.md` |
| Primer valor, després quota, després web pròpia | `embut-comu.md` |
| Oficis i professions | `professions.md` (el genera `build-molekulandia.js`) |
| Comunitat energètica i autoconsum compartit | `SOS/energia.html` |
| Finançadors i aliats de la regió | `mapa-estrategic-regio.md` |
| Proves no transferibles, accés nominatiu i el registre del poble | l'obra de tokenització (PR #384, per mergejar) |

**El que aquesta obra afegeix:** passar de la planta al territori que hi neix
al voltant. `aigua-solar-xarxa.md` forma qui instal·la i manté; aquesta forma
**qui hi viu i en viu**.

## Les cinc capes del sector de l'aigua

Cada capa necessita l'anterior. L'escola les travessa totes.

| Capa | Què hi passa | Rols que cal formar |
|---|---|---|
| **1 · La planta** | Aigua bona cada dia, operada sobretot a distància | Les vuit disciplines de `aigua-solar-xarxa.md`, i **qui opera al lloc**: la persona del poble que llegeix els avisos, canvia filtres i fa d'ulls del sensor |
| **2 · L'aigua per a serveis** | Quiosc d'aigua, escola, centre de salut, higiene, cuina | Qui gestiona el quiosc i el cobrament, qui vetlla la qualitat a l'aixeta |
| **3 · Els conreus** | Reg eficient, hort comunitari, viver, rec amb l'aigua de rebuig on es pugui | Qui conrea amb poca aigua, qui assessora en agronomia |
| **4 · El segon sector** | Transformar el que es cultiva i el que l'aigua fa possible: envasat, gel, conserves, petit obrador | Qui transforma, qui ven, qui porta els comptes de la cooperativa |
| **5 · La comunitat de l'aigua** | Qui en fa ús, com es paga, com es decideix i com s'explica | Qui facilita l'assemblea, qui teixeix la xarxa, qui forma els formadors (N3) |

## El fabricant com a partner de formació (proposta)

El fabricant ja forma qui instal·la la seva màquina. La proposta és que
aquesta formació tècnica sigui l'N1 de les disciplines de la planta, i que la
matriu hi posi **la capa humana**: el mètode, la comunitat, la certificació per
evidència i les capes 2 a 5, que el fabricant no fa i que fan que la planta
duri.

## El mapa de valor

**Abast.** Del dia que s'instal·la una planta fins que al seu voltant hi ha una
comunitat que en viu i forma la següent.

| Rol | Què fa |
|---|---|
| **Qui fabrica i opera a distància** | La planta, la telemetria i la formació tècnica |
| **L'escola de l'aigua** | La matriu: currículum de les cinc capes, nivells i ledger |
| **Qui opera al lloc** | La persona del poble que cuida la planta cada dia |
| **Qui teixeix la comunitat** | El psicòleg comunitari: l'Àlvar i els formadors N3 que vinguin |
| **Qui necessita aigua** | La comunitat, el municipi o la finca |
| **Qui conrea** | Pagesos i horts comunitaris |
| **Qui transforma** | El segon sector: obradors, cooperatives, comerç |
| **Qui presta serveis amb l'aigua** | Escola, centre de salut, allotjament |
| **Qui finança i autoritza** | Administració, fundacions, banca ètica (avui **no és ningú amb nom**, regla 5) |

| De → a | Mena | Què | Retorn | Mena |
|---|---|---|---|---|
| Qui fabrica → escola de l'aigua | T | formació tècnica i dades de la planta | casos explicats i el que demana el territori | I |
| Escola de l'aigua → qui opera al lloc | T | formació i certificat N1 al ledger | la planta cuidada cada dia | T |
| Qui opera al lloc → qui fabrica | I | avisos de camp que el sensor no veu | menys visites i menys avaries | T |
| Qui teixeix la comunitat → qui necessita aigua | I | assemblea, acord d'ús i de pagament | confiança i pertinença | I |
| Qui necessita aigua → qui fabrica | T | pagament de la planta i del manteniment | aigua bona cada dia | T |
| Qui fabrica → qui conrea | T | aigua per regar | demanda estable | T |
| Escola de l'aigua → qui conrea | T | formació en reg amb poca aigua | el que funciona al seu camp | I |
| Qui conrea → qui transforma | T | collita | un preu just i un comprador a prop | T |
| Escola de l'aigua → qui transforma | T | formació de la cooperativa i dels comptes | casos de segon sector per ensenyar | I |
| Qui presta serveis → qui necessita aigua | T | escola, salut i higiene amb aigua bona | ús i quota del servei | T |
| Qui finança → qui necessita aigua | T | subvenció o préstec | impacte que es pot justificar | I |
| Qui necessita aigua → qui teixeix la comunitat | I | la història de l'aigua recuperada | la porta al poble següent | I |
| Escola de l'aigua → escola de l'aigua | I | els formadors N3 de cada poble formen el següent | l'escola creix sense nou centre | I |

## El que ensenya

1. **La SIM fa la tècnica; la comunitat no es fa per SIM.** El valor que el
   fabricant no pot donar a distància és el que fa que la planta duri: algú
   del poble que la cuida i una comunitat que l'ha fet seva. És el lloc de la
   matriu i del psicòleg comunitari.
2. **El node que no és de ningú és el segon sector.** Hi ha qui fabrica, qui
   instal·la i qui beu. No hi ha qui ajudi a transformar el que l'aigua fa
   créixer. És on l'aigua es torna feina.
3. **L'escola és la que es repeteix.** Cada planta nova necessita les cinc
   capes formades. Els formadors N3 d'un poble són el currículum viu del
   següent: el fil que fa que la xarxa creixi sense un centre nou.
4. **La història de l'aigua recuperada és el que obre la porta.** Ningú no la
   recull avui. És la tercera troballa de `aigua-solar-xarxa.md`, i aquí té
   qui la recull: qui teixeix la comunitat.

## Com encaixa amb la tokenització (PR #384)

Només amb el que aquella obra diu que és fàcil i segur: **proves que no es
poden vendre**.

- **Fase 1, proves no transferibles:** el certificat N1, N2 o N3 de cada
  disciplina i capa, signat al ledger. Qui opera al lloc s'emporta el seu
  ofici provat, encara que canviï de poble.
- **Fase 2, accés nominatiu:** la quota del quiosc d'aigua o del servei com a
  accés de cada família, si l'assessor ho veu bé.
- **El registre del poble:** la data de posada en marxa, les analítiques i els
  acords de l'assemblea, amb data i signatura. No hi van noms ni dades
  personals, només hashes.

Res d'això és inversió ni rendiment. Les paraules prohibides de l'obra de
tokenització valen aquí igual.

## Com encaixa a l'embut comú

| Pas | Per al poble | Per a qui aprèn un ofici |
|---|---|---|
| **1 · Primer, valor** | La diagnosi del lloc i una primera assemblea sobre l'aigua | La formació N0 oberta i el seu cervell gratis |
| **2 · Una pàgina al nostre entorn, amb quota** | El seguiment de la planta i de les cinc capes | La seva fitxa d'ofici certificat |
| **3 · La seva pròpia web** | La de la cooperativa de l'aigua | La seva web i el seu cervell, amb el segell de la xarxa |

## El que falta decidir

- Que el fabricant confirmi l'aliança i si vol ser partner de formació (d15
  del holding, repositori privat).
- Quin primer lloc fa de pilot de les cinc capes, i amb qui.
- Si l'escola de l'aigua és part de la MATRIU, una marca del holding o una
  cooperativa pròpia.
- Quin finançador i quin assessor tenen nom (regla 5).

## Preguntes que només pot respondre l'Àlvar

- La proporció de l'operació que es fa per SIM: d'on surt? Amb font, es pot
  publicar.
- Penses en pobles d'aquí (Penedès, Garraf, costa) o també en projectes fora
  d'Espanya on el fabricant ja té plantes?
- Vols que l'escola de l'aigua tingui una pàgina pròpia al SOS, o que visqui
  dins de la MATRIU?

## Següent pas

1. L'Àlvar presenta al fabricant la idea de partner de formació, amb aquesta
   obra (sense xifres) i `aigua-solar-xarxa.md`.
2. Escriure el currículum de la capa 1 per a **qui opera al lloc**, el rol que
   avui no forma ningú, sobre els nivells de `SOS/formacio.html`.
3. Amb el primer lloc pilot, la primera assemblea de l'aigua i la primera
   evidència N1 al ledger.
