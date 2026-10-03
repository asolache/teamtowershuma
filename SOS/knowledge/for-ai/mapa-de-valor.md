# Contracte per a una IA que proposa un mapa de valor

Aquest fitxer és **el que se li dona a un model quan se li demana un mapa de
valor**, i el que es comprova de la seva resposta. Viu a `for-ai/` i no a
`references/` perquè no és el mètode: és el mètode convertit en instruccions i
en comprovacions.

> **El problema que resol.** `aiPlanValueFlows()` i `aiSuggestMap()` criden
> l'API amb la demanda, el territori, el tipus de projecte i la llista de
> prototips — i **cap coneixement del mètode**. Se li demana a un model que
> faci un VNA sense dir-li què és un VNA, i després s'accepta el que torni si
> té la forma correcta. Un mapa sintàcticament vàlid i metodològicament fals és
> pitjor que cap mapa: **neix ambre i ensenya a la comunitat que ambre és
> normal** (`vision/auditoria-mapes.md`).

El mètode és a `references/vna-verna-allee.md`, de l'article de **Verna Allee,
«Value Network Analysis and value conversion of tangible and intangible
assets», *Journal of Intellectual Capital* 9(1), 2008, pp. 5-24**. El que hi ha
aquí sota n'és la part operativa; quan les dues divergeixin, mana la referència.

---

## 1 · Què se li demana, exactament

**Un mapa de valor és un graf de rols que s'intercanvien entregables.** Tres
elements i no més: **rols, transaccions i entregables**.

| | Què és, i què no és |
|---|---|
| **Rol** | El que algú *fa* en una activitat. **No** un càrrec, **no** una persona, **no** un departament. Una persona pot ocupar-ne dos i un rol el poden ocupar dues persones. L'organigrama és un intent de descriure rols recurrents: no és la llista |
| **Transacció** | Va **d'un rol a un altre** i té direcció. «A dona a B» no és «B dona a A» |
| **Entregable** | **La cosa que viatja**: un document, un avís, un accés, un favor, una decisió. Es diu amb **nom, no amb verb**, i el criteri és que **es pugui comprovar si ha arribat** |

**Tangible o intangible es decideix pel contracte, no per la matèria.**

- **Tangible** — és contractual o exigible: comanda, servei, factura, pagament,
  informe previst al contracte, confirmació, devolució.
- **Intangible** — no és contractual, encara que s'esperi: informació
  estratègica, coneixement de procés, saber tècnic, disseny conjunt,
  planificació compartida; i els **beneficis**: un favor, prestigi per
  associació, accés, reputació, confiança, visibilitat, atenció, consell.

> El mateix informe és tangible si el contracte el preveu i intangible si es
> dona de franc per mantenir la relació. **No és «el que es podria facturar»**:
> tot el que una casa regala es podria facturar, i aquesta és justament la
> troballa que el mapa ha de poder fer. El criteri és si **avui** algú el pot
> reclamar.

---

## 2 · Les deu regles que la proposta ha de complir

Les cinc primeres són del mètode; les cinc següents són d'aquesta casa i estan
mesurades a `vision/auditoria-mapes.md`.

1. **Entre 6 i 10 rols**, i **mai més de 12**. Per sobre de dotze rols i
   cinquanta transaccions un mapa no es maneja a una sala, i a la sala és on
   s'ha de llegir. Si el que es demana no hi cap, **no s'amplia el mapa: es
   proposa partir-lo per nivells** (el zoom del mètode) i es diu quin nivell
   s'està dibuixant.
2. **Les dues menes, sempre.** Un mapa només amb tangibles és un diagrama de
   processos; només amb intangibles és un pòster. **Com a mínim un terç de les
   transaccions han de ser intangibles**, perquè són la meitat invisible que
   el mètode existeix per fer sortir.
3. **Tot vincle és recíproc.** Es declara en parelles `[A, B, mena A→B, què
   A→B, mena B→A, què B→A]`. *Escriure el retorn obliga a pensar-lo.* **Un
   mapa on l'ajuntament només dona i mai rep no és un mapa incomplet: és un
   mapa fals.** Si de debò un vincle va en un sol sentit, s'ha de dir **com a
   troballa** —és el que l'anàlisi d'intercanvi busca— i no amagar-ho deixant
   la parella a mitges.
4. **Cap rol solt.** Un rol que no dona ni rep res no és un rol: és una
   decoració.
5. **Cap rol inventat per quadrar el dibuix.** Si un rol necessari no existeix
   a la casa, **això és la troballa**, i es diu: «aquest node avui no és de
   ningú». No es dibuixa com si hi fos.
6. **Reciprocitat 100 %**, **densitat ≥ 40 %**, **cap rol aïllat**,
   **concentració al rol més connectat ≤ 40 %** i **salut ≥ 80/100** amb
   `vnaAudit`. Una xarxa on tot passa pel nucli és fràgil encara que sigui
   recíproca.
7. **Cap xifra que no es pugui refer.** Ni euros, ni percentatges, ni
   previsions. El mapa diu **on mirar**; els números els posa la casa amb els
   seus. Una xifra inventada per il·lustrar és l'error que més car surt.
8. **Cap nom propi de persona ni d'empresa tercera.** Els rols es diuen pel que
   fan. Un nom de client és una afirmació sobre un tercer i demana font
   escrita.
9. **La llengua de qui ho demana**, i els entregables amb les seves paraules.
   Un mapa amb el vocabulari del consultor no el reconeix ningú a la sala.
10. **Ho proposa, no ho decideix.** La sortida és un esborrany per validar: el
    mapa el dibuixa qui hi és. Cada rol i cada transacció ha de poder-se
    esborrar sense que la resta es trenqui.

---

## 3 · La forma de la resposta

**La forma canònica, i només aquesta.** És la de `mapFlowsOf()` i la de
`CELLER` a `build-mapavalor.js`. Hi ha **un sol expander** a tot el sistema, i
el dia que n'hi va haver quatre les saluts anaven de 13 a 100.

```json
{
  "abast": "De quina activitat parlem i on s'acaba",
  "roles": ["Qui ven", "Qui entrega", "…"],
  "pairs": [
    ["Qui ven", "Qui entrega",
     "tangible",   "la comanda amb el que s'ha promès",
     "intangible", "avisar si no arribarà a temps"]
  ],
  "processos": [
    { "id": "venda", "nom": "La venda", "d": "Del primer contacte al cobrament" }
  ],
  "seq": { "Qui ven→Qui entrega": ["venda", 1] },
  "troballes": [
    { "t": "Hi ha un node que no és de ningú",
      "d": "Per què, i què s'atura si s'encalla" }
  ]
}
```

- **`abast` és obligatori** i va primer: és la passa 1 del mètode i el que evita
  la pregunta de mitja sessió, «i això també hi entra?».
- **`seq`** pot dir `"sempre"` en comptes de `[procés, pas]`, i **només per a
  un intangible**: el que passa tot el temps no té pas, i és precisament el que
  cap diagrama de procés pot veure. Un tangible marcat «sempre» és un tangible
  que ningú ha seqüenciat.
- **`processos` en plural.** *«A l'enginyeria de processos l'objectiu és
  identificar un únic procés òptim i eliminar la variació. Amb l'anàlisi de la
  xarxa de valor l'objectiu és optimitzar múltiples vies permetent alhora les
  variacions necessàries.»* Un sol procés és el senyal que s'ha fet l'exercici
  equivocat.

---

## 4 · Què se li ha de donar perquè pugui encertar

Avui el context que viatja és la demanda, el territori, el tipus de projecte i
els noms dels prototips. Això no basta per complir la secció 2. El que ha
d'anar-hi:

| | Per què |
|---|---|
| **Aquest fitxer, les seccions 1 a 3** | Sense el mètode, el model fa un organigrama amb fletxes |
| **L'abast, dit per la persona** | Sense frontera, el mapa creix fins als quaranta nodes |
| **El mapa que ja hi ha, si n'hi ha** | Per proposar **canvis** i no un de nou que esborra el que la casa ja sabia |
| **Un prototip proper sencer** (no només el nom) | Un exemple complet val més que una instrucció |
| **Els rols i entregables que la casa ja fa servir** | Perquè el vocabulari sigui el seu |
| **El que **no** ha de sortir** | Els noms propis i les xifres de la regla 7 i 8 |

---

## 5 · Les tres anàlisis, per si se li demanen

No són tres opinions: són tres preguntes diferents sobre el mateix dibuix, i
cada una té la seva estructura a l'article.

- **Anàlisi d'intercanvi** — el patró sencer. Hi ha lògica en com es mou el
  valor? Les dues menes són sanes o en domina una? Hi ha reciprocitat? Hi ha
  vincles morts, dèbils, culs-de-sac o colls d'ampolla? **S'optimitza el
  sistema sencer, o hi ha rols que hi guanyen a costa d'altres?**
- **Anàlisi d'impacte** — per cada transacció rebuda: quines activitats genera,
  què costa (temps, diners, competència, relacions), quin benefici dona
  —ingrés, capacitat actual, capacitat futura— i **com el valora qui el rep**,
  de −2 a +2. Aquesta última columna **és el gomet** blau o groc del full.
- **Anàlisi de creació de valor** — per cada transacció donada: com s'hi fan
  servir els actius, què costa, quin risc té, **com hi afegim valor**, i
  cost/risc contra benefici.

I la pregunta que les lliga, que és el producte: **quin intangible que la casa
ja produeix i regala es pot convertir en una forma negociable?** L'article en
posa l'exemple: una empresa de serveis financers regalava informes estàndard, i
en va empaquetar uns quants amb anàlisi experta i els va vendre.

---

## 6 · El fre, que és el mateix de tot el SOS

**La IA proposa, una persona valida, i cada línia diu d'on surt.**

- Res del que proposi entra al mapa de la casa sense que algú ho accepti.
- Cap dada de persona viatja a cap API fora de l'allistat tancat `CAMPS_IA`.
- Si no hi ha clau d'API, **hi ha camí**: el prototip més proper, dit com el
  que és —una plantilla, no un diagnòstic.
- Una proposta que no passi la secció 2 **no s'ensenya com a mapa**: s'ensenya
  el que li falta. Un mapa que neix amb la reciprocitat trencada ensenya que
  trencar-la és normal.

---

*Afegit el 03/10/2026 amb l'article de 2008, aportat per l'Àlvar. Les regles 6 i
7 de la secció 2 són d'aquesta casa i estan mesurades; les altres són del
mètode. Els llindars **no són de Verna Allee** —l'article diu explícitament que
«la recerca encara no ha determinat quines són les proporcions ideals»— i
atribuir-los-hi seria el mateix error que inventar una xifra d'euros.*
