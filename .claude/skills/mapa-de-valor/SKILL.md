---
name: mapa-de-valor
description: Acompanyar una sessió de mapa de valor amb el mètode VNA de Verna Allee — proposar-lo, revisar-lo contra les deu regles de la casa, fer les tres anàlisis i deixar escrit el que ha ensenyat. Usa-la quan algú demani un mapa de valor, una xarxa de valor, un VNA, un diagnòstic d'intercanvis tangibles i intangibles, o quan vulgui revisar-ne un que ja existeix.
---

# Mapa de valor · el procés, no la plantilla

> **El que aquesta skill impedeix.** Un model al qual se li demana un VNA sense
> dir-li què és un VNA torna **un organigrama amb fletxes**: càrrecs en comptes
> de rols, verbs en comptes d'entregables i cap intangible. I com que la forma
> és correcta, s'accepta. **Un mapa sintàcticament vàlid i metodològicament fals
> és pitjor que cap mapa**: neix ambre i ensenya que ambre és normal.

## Abans de res, dues lectures

1. **`SOS/knowledge/vna/patrons.md`** — el que s'ha vist en els mapes que ja
   s'han fet. Si una troballa s'hi repeteix, pregunta-la abans que la sala
   l'hagi de descobrir sola.
2. **`SOS/knowledge/vna/casos/`** — si n'hi ha un del mateix ram, llegeix-lo
   sencer. *Un exemple complet val més que una instrucció.*

I quan acabis, **hi escrius**. La secció «Deixar-ho millor» ho diu com.

## Les eines que ja existeixen

| | On | Què fa |
|---|---|---|
| **La consola** | `SOS/vna-suport.html` | Escriure el mapa i veure les deu regles revisar-lo mentre s'escriu. Funciona per `file://`, sense compte i sense enviar res |
| **El motor** | `SOS/tools/build-vna-suport.js` | La declaració. `require`-la i crida `revisa(mapa)`: torna `{regles, passa, dures, toves}` |
| **El mètode** | `SOS/knowledge/references/vna-verna-allee.md` | L'article de 2008. Quan divergeixi d'aquest fitxer, **mana la referència** |
| **El contracte** | `SOS/knowledge/for-ai/mapa-de-valor.md` | El mateix, en prosa, i què se li ha de donar a un model |

**No reimplementis les regles.** Són a `build-vna-suport.js` i es poden executar:

```bash
node -e "const v=require('./SOS/tools/build-vna-suport.js');
console.log(v.revisa(JSON.parse(require('fs').readFileSync('mapa.json','utf8'))))"
```

---

## Les sis passes

<!--VS-PASSES-->
### 1 · Posar la frontera

**Què hi passa.** Dir de quina activitat parlem i on s'acaba. En una frase que es pugui repetir.

**Què en queda escrit.** `abast`

> Sense frontera el mapa creix fins als quaranta nodes i ja no es llegeix a una sala.

### 2 · Posar els rols

**Què hi passa.** Qui participa, dit pel que **fa** i no pel càrrec. Entre sis i dotze —els mateixos que compta la regla 2.

**Què en queda escrit.** `roles`

> Amb càrrecs surt un organigrama amb fletxes, que és el que ja es té i no explica res.

### 3 · Posar el que es lliura, en parelles

**Què hi passa.** Per cada vincle, què va de A a B i què torna de B a A, i de quina mena és cada cosa.

**Què en queda escrit.** `pairs`

> Escriure el retorn obliga a pensar-lo. Un mapa on algú només dona és un mapa fals.

### 4 · Fer sortir els intangibles

**Què hi passa.** Preguntar pel que s'ofereix i no es factura: avisos, favors, coneixement, accés, confiança.

**Què en queda escrit.** `pairs (mena intangible)`

> És la meitat invisible, i és l'única cosa que aquest mètode veu i un diagrama de procés no.

### 5 · Seqüenciar les transaccions

**Què hi passa.** Dir en quin procés i en quin pas passa cada transacció. I marcar «sempre» el que passa tot el temps.

**Què en queda escrit.** `processos, seq`

> Validar el mapa seqüenciant-lo és el que destapa els passos que ningú fa i els que fa tothom.

### 6 · Fer les tres anàlisis

**Què hi passa.** Intercanvi, impacte i creació de valor. Tres preguntes diferents sobre el mateix dibuix.

**Què en queda escrit.** `troballes`

> Un mapa sense anàlisi és un dibuix. El producte és la conversió: quin intangible es pot negociar.

<!--/VS-PASSES-->

---

## Les deu regles

Les **dures** aturen: una proposta que en trenqui una **no s'ensenya com a
mapa**, s'ensenya el que li falta. Les **toves** avisen i deixen passar.

<!--VS-REGLES-->
| | La regla | | Ve de |
|---|---|---|---|
| 1 | Hi ha un abast escrit | **dura** | mètode |
| 2 | Entre 6 i 12 rols | **dura** | mètode |
| 3 | Com a mínim un terç de transaccions intangibles | **dura** | mètode |
| 4 | Tot vincle és recíproc | **dura** | mètode |
| 5 | Cap rol solt | **dura** | mètode |
| 6 | Densitat ≥ 40 % | tova | la casa |
| 7 | Cap rol concentra més del 40 % | tova | la casa |
| 8 | Cap xifra que no es pugui refer | **dura** | la casa |
| 9 | Cap nom propi de persona ni d'empresa | **dura** | la casa |
| 10 | Més d'un procés, i el que passa «sempre» marcat | tova | la casa |
<!--/VS-REGLES-->

Els llindars de les regles 6 i 7 **no són de Verna Allee**: l'article diu
explícitament que «la recerca encara no ha determinat quines són les proporcions
ideals». Són d'aquesta casa, estan mesurats a `vision/auditoria-mapes.md`, i
atribuir-los-hi seria el mateix error que inventar una xifra d'euros.

---

## Les tres anàlisis

<!--VS-ANALISIS-->
### Anàlisi d'intercanvi

Sobre el patró sencer.

- Hi ha lògica en com es mou el valor, o hi ha trossos que no s'expliquen?
- Les dues menes són sanes, o en domina una?
- Hi ha vincles morts, dèbils, culs-de-sac o colls d'ampolla?
- S'optimitza el sistema sencer, o hi ha rols que hi guanyen a costa d'altres?

### Anàlisi d'impacte

Sobre cada transacció **rebuda**.

- Què genera
- Què costa (temps, diners, competència, relacions)
- Quin benefici dona (ingrés, capacitat actual, capacitat futura)
- Com el valora qui el rep (−2…+2)

- La darrera columna és el gomet del full: blau si qui ho rep n'està satisfet, groc si no.

### Anàlisi de creació de valor

Sobre cada transacció **donada**.

- Quins actius s'hi fan servir
- Què costa
- Quin risc té
- Com hi afegim valor
- Cost i risc contra benefici

- I la pregunta que les lliga, que és el producte: **quin intangible que la casa ja produeix i regala es pot convertir en una forma negociable?**

<!--/VS-ANALISIS-->

---

## El text que se li dona a un model

El generen `build-vna-suport.js` i el botó «Copia el que se li dona a la IA» de
la consola. **No el reescriguis a mà**: es construeix de les mateixes regles que
comproven la resposta, i si es declaressin a part, el dia que una canviï l'altra
es quedaria i tindríem un model complint una llista que ja no és la llista.

<!--VS-PROMPT-->
```
Ets qui acompanya una sessió de mapa de valor amb el mètode de Verna Allee
(Value Network Analysis). Proposes un esborrany perquè una sala el validi:
no decideixes res. Escrius en la llengua de qui t'ho demana.

UN MAPA DE VALOR ÉS UN GRAF DE ROLS QUE S'INTERCANVIEN ENTREGABLES.
Tres elements i no més:
· Rol — el que algú FA. No un càrrec, no una persona, no un departament.
· Transacció — va d'un rol a un altre i té direcció.
· Entregable — la cosa que viatja, dita amb NOM i no amb verb, i el criteri
  és que es pugui comprovar si ha arribat.

TANGIBLE O INTANGIBLE ES DECIDEIX PEL CONTRACTE, NO PER LA MATÈRIA.
Tangible és el que avui algú pot reclamar: comanda, servei, factura, informe
previst al contracte. Intangible és el que s'espera i no s'exigeix: un avís,
un favor, coneixement de procés, accés, reputació, confiança, un consell.
El mateix informe és tangible si el contracte el preveu i intangible si es
dona de franc per mantenir la relació.

LES REGLES QUE LA TEVA PROPOSTA HA DE COMPLIR:
1. Hi ha un abast escrit.
2. Entre 6 i 12 rols.
3. Com a mínim un terç de transaccions intangibles.
4. Tot vincle és recíproc.
5. Cap rol solt.
6. Densitat ≥ 40 %.
7. Cap rol concentra més del 40 %.
8. Cap xifra que no es pugui refer.
9. Cap nom propi de persona ni d'empresa.
10. Més d'un procés, i el que passa «sempre» marcat.

I TRES COSES QUE NO SÓN NEGOCIABLES:
· Si un rol necessari no existeix a la casa, AIXÒ ÉS LA TROBALLA: digues
  «aquest node avui no és de ningú». No el dibuixis com si hi fos.
· Si el que et demanen no cap en dotze rols, no ampliïs el mapa: proposa
  partir-lo per nivells i digues quin nivell estàs dibuixant.
· Cada rol i cada transacció s'han de poder esborrar sense que la resta es
  trenqui. És un esborrany per validar.
```
<!--/VS-PROMPT-->

---

## El fre

**La IA proposa, una persona valida, i cada línia diu d'on surt.**

- Res del que proposis entra al mapa de la casa sense que algú ho accepti.
- **Cap dada de persona** viatja a cap API fora de l'allistat tancat `CAMPS_IA`.
- Si no hi ha clau d'API, **hi ha camí**: el prototip més proper, dit com el que
  és —una plantilla, no un diagnòstic.
- Si la proposta trenca una regla dura, **ensenya el que li falta i no el mapa**.

---

## Deixar-ho millor

Això és el que fa que el mòdul **aprengui** i no només existeixi. Quan una
sessió acaba:

1. **Un cas nou** a `SOS/knowledge/vna/casos/<ram>-<lloc>.md`, amb la plantilla
   de `SOS/knowledge/vna/README.md`. La secció **«Què ha ensenyat» és
   obligatòria** i la guarda ho comprova: *un cas que només guarda el mapa és un
   fitxer, no coneixement.*
2. **Si una troballa es repeteix** en dos casos o més, puja a
   `patrons.md` amb els dos casos citats. Una troballa que ha passat dues
   vegades es pregunta a la tercera sessió en comptes de descobrir-se.
3. **Si una regla ha fallat quan no tocava** —o no ha vist una cosa que havia de
   veure— no la pedacegis al cas: canvia-la a `build-vna-suport.js` i torna a
   generar. És el motiu pel qual hi ha una sola declaració.

> Cap xifra nova sense d'on surt, i cap nom de client sense fila a
> `negoci/trajectoria.md`. Aquí també.
