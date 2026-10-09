# Verna Allee · Value Network Analysis

Metodologia per analitzar xarxes de valor multi-actor, més enllà de la cadena de valor lineal.

## Principis
- **Rols funcionals** (què fa la persona) no càrrecs (com es diu al organigrama)
- **Intercanvis tangibles** (béns, serveis, hores, diners) i **intangibles** (confiança, coneixement, pertinença, reconeixement)
- **Reciprocitat**: pocs fluxos unidireccionals sostinguts; les xarxes sanes són bidireccionals
- **Densitat** distribuïda — evitar topologia estrella (tot passant pel nucli)
- **Diversitat** de rols i de tipus d'intercanvis

## La conversió de valor · el que el mètode és de debò

**Afegit el 03/10/2026, de l'article de 2008.** El títol del paper no és «anàlisi
de xarxes de valor» i prou: és «*Value Network Analysis **and value conversion**
of tangible and intangible assets*». La pregunta que l'obre és aquesta, i és
una altra de la que fèiem:

> «Com convertim actius intangibles —coneixement humà, estructures internes,
> maneres de treballar, reputació, relacions de negoci— en **formes de valor
> negociables**?»

Dibuixar qui dona què a qui és **el mitjà**. El que es ven és **la conversió**:
posar en forma negociable allò que la casa ja produeix i regala. La pregunta va
en dos sentits:

| | |
|---|---|
| **Realització de valor** (entrades) | Com converteixo el que rebo en actius, tangibles i intangibles? Què em costa rebre-ho? |
| **Creació de valor** (sortides) | Com faig servir els meus actius per crear valor per a altres rols? Quin d'aquests valors pot passar a ser tangible i generar ingressos? |

**I l'exemple que l'article posa és el nostre cas del celler, escrit per
l'autora el 2008**: una empresa de serveis financers donava als seus clients
una sèrie d'informes estàndard **de franc**; en mirar les oportunitats de
conversió va veure que molts d'aquells informes es podien empaquetar millor,
enriquir amb anàlisi experta i **vendre**. Això és, paraula per paraula, el que
el mapa del celler diu del relat, del lloc i del vessant.

> ⚠ **Això encara no és a la pàgina.** `/vna` ven la conclusió —«el marge surt
> de cobrar els intangibles que ja produeixes»— i **no diu el nom del
> mecanisme**, que és el que la converteix en mètode i no en consell. Entrada
> oberta al backlog.

**I la frase que justifica mirar el sistema sencer abans que cap procés:**

> «El valor és una **propietat emergent de la xarxa**. No es pot determinar
> sumant tots els rols i les seves sortides.»

Amb el corol·lari que val per a la venda: un lliurament **és** valor en un
context i no en un altre, i una oferta no és una conversió fins que **un altre
rol l'accepta**.

## Les tres anàlisis
El que fa que això sigui un mètode i no una manera de dibuixar. Van pel seu nom
a `/SOS/vna` i a `SOS/tools/build-mapavalor.js`, perquè qui busca el mètode
l'ha de poder reconèixer. **Els noms i l'ordre són els de l'article de 2008**, i
el que hi ha entre parèntesis és l'estructura que l'article els dona i que
nosaltres encara no fem:

- **Anàlisi d'intercanvi** — el patró sencer: qui dona i no rep, quins vincles
  van en un sol sentit, quins nodes estan carregats de més. *Les preguntes
  textuals: hi ha una lògica coherent en com es mou el valor? Les dues menes
  són sanes o en domina una? Hi ha reciprocitat? Hi ha vincles morts, dèbils,
  culs-de-sac o colls d'ampolla? **S'optimitza el sistema sencer, o hi ha rols
  que en surten guanyant a costa d'altres?***
- **Anàlisi d'impacte** — node per node: què rep, què li costa rebre-ho i què hi
  guanya. És la que explica per què hi ha gent que plega sense queixar-se.
  *(L'article en dona una taula: per cada transacció, quines activitats
  genera, els costos i riscos —tangibles i intangibles—, els beneficis en tres
  nivells (valor tangible / capacitat actual / capacitat futura) i una última
  columna, **el valor percebut pel qui ho rep**, de −2 a +2.)*
- **Anàlisi de creació de valor** — què aporta cada node i què costaria no
  tenir-lo. És la que troba **el valor que ja es produeix i no es cobra**.
  *(Taula pròpia: ús d'actius tangibles i intangibles en alt/mitjà/baix, costos
  de cada mena, nivell de risc, com hi afegim valor, i cost/risc contra
  benefici.)*

**Els gomets tenen font i escala.** La columna «valor percebut per qui ho rep»
de la taula d'impacte **és** el gomet blau i groc del full, i l'article li dona
una escala de cinc punts. La frase que ho justifica: *«sovint dona idees, perquè
els participants poden percebre una mateixa transacció de maneres força
diferents»* — que és exactament per què els grups en posen dos, o un de cada
color.

**I les tres categories d'actiu intangible** que estructuren aquelles taules són
les de **Karl-Erik Sveiby**: *competència humana, estructura interna i relacions
externes*. No les fem servir enlloc.

## Els llindars són nostres, i convé dir-ho

L'article és explícit: comparar la **proporció** de transaccions tangibles i
intangibles dona idees, però

> «la recerca **encara no ha determinat quines són les proporcions ideals**».

Els llindars de `vnaAudit` —reciprocitat 100 %, densitat ≥ 40 %, concentració
≤ 40 %, salut ≥ 80— i els de `auditoria-mapes.md` §4 **són d'aquesta casa**,
mesurats sobre els nostres 36 mapes sembrats. Són defensables i són útils; el
que no són és de Verna Allee, i atribuir-los-hi seria el mateix error que
inventar una xifra d'euros al celler.

## On s'ha fet, segons la font

Noms que l'article publica, i per tant citables: **Boeing** i la **Mayo Clinic**
(combinant-ho amb Lean Manufacturing), el grup de sistemes adaptatius complexos
de Boeing (amb dinàmica de sistemes), **Cisco** i **Telenor** (amb anàlisi de
xarxes organitzatives), i l'avaluació **SMART de la Comissió Europea**, que fa
servir VNA i indicadors de capital intel·lectual per avaluar xarxes de
desplegament d'innovació als estats membres.

El que els de Boeing i la Mayo en diuen, i que val per a la venda: **la vista de
sistema sencer assegura el context abans de passar a l'anàlisi de processos, i
els salts grossos surten al nivell de xarxa, no al de procés.**

## La notació
Quatre paraules i prou. Un mapa amb quinze símbols no el llegeix ningú a una
sala, i a la sala és on s'ha de llegir.

| | Què és |
|---|---|
| **Rol** | Un rol, no una persona ni un càrrec |
| **Transacció** | Una fletxa amb direcció, d'un rol a un altre |
| **Tangible** | Línia plena: **el que és contractual** |
| **Intangible** | Línia discontínua: el que no consta i sense el qual res funciona |
| **Entregable** | La cosa que es mou. El mapa és l'eina, no l'entregable |

Les dues menes es distingeixen **pel traç i no només pel color**: un mapa que
només es llegeix distingint el blau del magenta deixa fora qui més necessita
que el dibuix sigui clar.

> ⚠ **El criteri és contractual, no físic**, i això és de l'article de 2008
> paraula per paraula: *«que un entregable es consideri tangible o intangible
> depèn de la seva **naturalesa contractual**, no de la seva naturalesa
> física»*. Un informe escrit que el contracte preveu és **tangible**; el
> mateix informe donat de franc per quedar bé és **intangible**. Dèiem «el que
> es podria facturar», que s'hi acosta i es trenca al cas que importa: tot el
> que la casa regala *es podria* facturar —aquesta és justament la tesi del
> celler— i per tant «podria» no distingeix res. El que distingeix és si
> **avui** algú el pot reclamar, que és exactament el «must» i l'«extra» de la
> sala.

I els tres elements són **només tres**, també de la font: *rols, transaccions i
entregables*. L'«entregable» no és el que la casa s'endú de la consultoria
—això ho diem nosaltres i està bé dir-ho— sinó **la cosa que viatja per la
fletxa**: un document, un missatge, un favor, un accés.

## Les quatre passes grans

El guió real d'una sessió les agrupa així, i és la forma que es comunica:
**quatre per recordar, deu per executar.**

| | |
|---|---|
| **1 · Definir l'abast i les fronteres** | De quina activitat parlem i on s'acaba |
| **2 · Decidir qui convidem** | Grup divers de la casa i del seu entorn; amb trenta persones, dos o tres grups en paral·lel |
| **3 · Identificar els rols i les seves transaccions** | Els noms primer, els rols després, i llavors què s'intercanvien |
| **4 · Validar el mapa seqüenciant transaccions** | En quin ordre passen les coses |

## Com és, a la sala

No es fa amb un programa: **un full gran de paper d'estrassa, post-its i
gomets**. El programa ve després, per mantenir-ho viu.

**L'abast s'escriu a dalt del full**, amb els noms dels participants i la data.
És el pas 1 i es queda escrit perquè a mitja sessió algú sempre pregunta «i
això també hi entra?».

**De les persones als rols.** Cadascú escriu en post-its **les deu o quinze
persones** —de dins i de fora— amb qui més s'ha relacionat **els últims dotze
mesos** dins de l'àmbit. Després es posen en comú i **s'agrupen pel rol que han
jugat**; qui n'ha jugat més d'un, es replica el post-it.

> «Canviar la mentalitat a rols en comptes de càrrecs obre un món de
> possibilitats. Una xarxa de valor no es pot administrar: només es pot servir
> a través dels rols que s'hi juguen.» — Verna Allee

**Entre 8 i 10 rols** per a un mapa, i els que tenen més interaccions van més
al centre. *A mà, per sobre de 12 rols i 50 transaccions ja no es maneja* — que
és, dit d'una altra manera, per què existeix el zoom.

### Els «must» i els «extra»

La notació simplificada per a un primer exercici. Una sola línia per direcció i
dues menes d'entregable:

| | Color | Què és |
|---|---|---|
| **Must** | verd | Contractual, directament lligat a l'activitat. El que és exigible entre rols: una comanda, un informe, una factura |
| **Extra** | rosa | El que es dona per construir i mantenir la relació i que **ningú pot reclamar**: favors, informació, poder de decisió, contactes, atenció, consell, reputació, visibilitat, reconeixement, claredat |

Això **és** la nostra parella tangible/intangible, dita amb les paraules de la
sala — i els colors ja coincideixen. La diferència de les dues maneres de
dir-ho: «tangible/intangible» diu *de quina matèria és*, «must/extra» diu *si
el pots reclamar*. La segona és la que fa saltar la conversa, perquè tothom
sap immediatament quins extres està donant i ningú li ha agraït mai.

**Els entregables es diuen amb noms, no amb verbs ni adjectius.** El criteri és
que un entregable es diu així perquè **es pot comprovar si ha arribat o no**.

### Els gomets de satisfacció

Sobre els entregables més importants, un gomet rodó: **blau** si qui el rep
n'està satisfet, **groc** si no. És la capa que converteix un dibuix en un
diagnòstic — un full sense gomets diu què hi ha i no diu on hi ha feina.

*Els grups solen ser creatius aquí: posar-ne dos, o un blau i un groc alhora
per dir que és inconsistent. Val la pena ser flexible mentre es mantingui el
fonamental: els rols són rols, els entregables són entregables, i la direcció
es veu.*

### La seqüència

En quin ordre passen les coses. **No per reduir-ho a un procés lineal**, sinó
per comprovar que el mapa és complet i fer aflorar els fluxos principals. Es
pregunta pel que passa primer en un escenari típic i se segueix el camí;
després, altres inicis i altres camins habituals.

> ✅ **Des del 03/10/2026 això és una dada i no una explicació.** A
> `build-mapavalor.js`, cada mapa declara `processos` —**en plural**, que és el
> que impedeix que es torni un diagrama de processos— i cada sentit de cada
> parell porta `['procés', pas]`. El celler en té tres: *la visita reservada*
> (8 passos), *el dia al poble* (4) i *la venda pel canal* (3).
>
> La conseqüència que val la pena: **el pols del dibuix ja no reparteix els
> retards per ordre de declaració** —`i * 0,17 s`, que no és cap ordre— sinó per
> la seqüència. L'animació va deixar de ser decoració i va passar a ser la
> passa 4 feta amb el dibuix. I a `/vna` es pot recórrer un procés pas per pas.

> «A l'enginyeria de processos l'objectiu és identificar un únic procés òptim i
> eliminar la variació. Amb l'anàlisi de la xarxa de valor l'objectiu és
> optimitzar múltiples vies i aconseguir un resultat consistent **permetent
> alhora les variacions necessàries** per a la innovació, la resiliència i
> l'agilitat de la xarxa.» — Verna Allee

*I una observació del guió que val or: **els intangibles sovint no entren a la
seqüència** perquè passen «tot el temps» o «en qualsevol moment». Això no és un
problema del mapa — és el que els fa invisibles a qualsevol diagrama de procés.*

> Això també és dada: el valor `seq: 'sempre'`, i una guarda que **només el
> deixa portar a un intangible**. Un tangible que «passa tot el temps» és un
> tangible que ningú ha seqüenciat, i la frase que es ven deixaria de ser certa.
> Al celler n'hi ha **un de sol**, i no és casual que sigui el lloc: *«el lloc
> que fa que aquell vi sigui d'allà»*. El paisatge no es lliura un dimarts.

### El pols de la xarxa

**De dos a quatre llocs** marcats amb un cor: on cal mirar què passa per saber
la salut del flux de valor. Les dues preguntes que els acompanyen:

- Quin rol és més essencial per a la supervivència de la xarxa?
- Què passaria si aquella persona la substituís una altra?

> ⚠ **El pols animat de la portada ve d'aquí**, i convé dir-ho: no és una idea
> de disseny nostra. El botó «i si aquest node s'encalla?» és la segona
> pregunta, feta amb el dibuix a la mà.

### Les vuit preguntes de l'anàlisi

El que converteix el full en una conversa. **El mapa no diu res sol.**

1. Qui és més actiu a la xarxa? Per què?
2. Qui és menys actiu? Per què?
3. Qui hi hauria de sortir i no hi surt? Per què?
4. Quines relacions caldria començar, enfortir o reprendre?
5. Tots els entregables aporten valor, o en generen un altre com a resposta?
6. Hi ha algun intercanvi dèbil o en risc?
7. La xarxa aporta valor a tots els rols?
8. Algú rep molt més del que aporta, o aporta molt més del que rep?

## Per què no és un diagrama de processos

L'article ho ancora a la **llei de Conway** (1967): *«les organitzacions que
dissenyen sistemes estan limitades a produir dissenys que són còpies de les
estructures de comunicació d'aquestes organitzacions»*. Si vols que el que
produeix la casa canviï, has de poder veure i canviar **com es comunica**, i
això un diagrama lineal no ho ensenya.

I la distinció que ho remata: **Kaizen** és millora contínua i progressiva
sobre el que ja hi ha; **Kaikaku** és transformació, un salt. *El VNA va més
enllà del Kaizen perquè habilita el Kaikaku* — s'han facilitat sessions que han
redefinit models de negoci, i en fundacions, les seves fonts de finançament.

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

**Precisat per l'Àlvar el 02/10/2026**: en una casa gran, primer un nivell i
després, si cal, el de dins d'un node.

Això és el mateix gest que l'eina ja fa al mapa del SOS: els llocs de dins
surten al centre i clicar-hi els fa el mapa sencer. El zoom de la metodologia i
el zoom de l'eina són la mateixa idea, i no és casualitat — l'un va sortir de
l'altre.

> ✅ **I des del 03/10/2026 també a `/vna`.** Dos nodes del celler s'obren i
> tenen el seu propi mapa: `acollida` —la troballa 3, el node que avui no és de
> ningú— amb cinc rols, i `vi` amb quatre. Es declaren a `DINS` de
> `build-mapavalor.js` **sense coordenades**: les reparteix el dibuixant en
> cercle, perquè obrir un node més hagi de ser fàcil i no una feina de
> dibuixant.
>
> El sostre és aquest d'aquí i és una guarda, no un consell: **cap nivell per
> sobre de 12 rols**. Si un en passa, el que cal no és una pantalla més gran,
> és partir-lo.

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

**L'original, i llegit** (03/10/2026). Verna Allee, **«Value Network Analysis
and value conversion of tangible and intangible assets»**, *Journal of
Intellectual Capital*, vol. 9, núm. 1, 2008, pp. 5-24. Vint-i-una pàgines,
aportades per l'Àlvar en PDF.

Fins avui aquesta fila deia «l'original» i citava **dos llibres que no havia
llegit ningú d'aquesta casa**: *The Future of Knowledge* (2003) i *Value
Networks and the True Nature of Collaboration* (2011). Seguien sent certs com a
referència i eren una cita de biblioteca, no una font: tot el que la casa sabia
del mètode venia de l'article de Pantheon i del guió d'una sessió real, que són pràctica i
no el text de l'autora. Ara hi ha el text, i els dos llibres queden on els
toca: **lectura de fons, pendent**.

El que aquest article confirma paraula per paraula i el que hi afegeix, a la
secció **«La conversió de valor»** de més amunt.

**La pràctica en castellà.** **Antonio Blanco-Gracia i Ingrid Astiz**, «Value
Network Analysis: ¿qué es? ¿para qué sirve? ¿cómo hacerlo?» —
**Pantheon.work**, 30/11/2018.
`pantheon.work/blog/2018/11/30/como-hacer-tu-primer-analisis-de-la-red-de-valor/`
Aportat per l'Àlvar el 02/10/2026 **en PDF**, i llegit sencer: d'aquí surten
les quatre passes, els «must» i els «extra», els gomets, la seqüència i la llei
de Conway.

**El guió d'una sessió real amb un equip de direcció** (19 pàgines), aportat
per l'Àlvar el 02/10/2026. És el guió amb què es va facilitar, i d'aquí surten
l'agrupació en quatre passes grans, els cors del pols i les vuit preguntes de
l'anàlisi. El client i el detall del cas no es publiquen (decidit per l'Àlvar el
09/10/2026).

Pantheon aplica el VNA de Verna Allee com a **metodologia central** i el
descriu com un exercici **ràpid i no invasiu** que dona informació completa
d'una organització, que **promou una reflexió col·lectiva** sobre com funciona
de debò, i que —a diferència d'altres anàlisis— **destapa els intangibles**: els
intercanvis no regulats que són els que de veritat marquen la diferència quan
es genera valor.

> **Llegits tots dos** (02/10/2026). El que en va sortir és a les seccions de
> sobre. L'únic que segueix sense comprovar és si l'article té una segona part
> amb el cas de l'escola de postgrau que anuncia al final.

*Pantheon.work ja és font d'aquesta casa per una altra cosa: el panteó de 12
(`references/pantheon-12.md`, CC BY). Són dos documents del mateix lloc i
conviuen bé.*
