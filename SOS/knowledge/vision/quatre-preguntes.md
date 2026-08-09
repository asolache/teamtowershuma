# Quatre preguntes de creixement

> Anàlisi feta el 2026-08-09 llegint el codi, no de memòria. Cada afirmació sobre
> què fa avui el SOS porta la funció on es pot comprovar.

---

## 1 · Connectar serveis de **nodes fills** a una venture o MATRIU

### Què passa avui

`linkResource(node)` (a `renderEcosistema`) construeix els candidats així:

```js
const sibs = children(node.parentId).filter(n =>
  n.id !== node.id &&
  (n.dynamicType === 'banc_temps' || n.dynamicType === 'biblioteca_coses') &&
  !linksOf(node).includes(n.id));
```

Tres límits, i cap dels tres és una decisió escrita — són el que va sortir:

- **Només germans.** `children(node.parentId)` són els nodes que pengen del
  **mateix pare**. Els **fills del propi node no hi surten mai**, que és
  justament el cas que preguntes: una MATRIU comarcal amb bancs de temps
  municipals a sota no els pot connectar.
- **Només dues dinàmiques**: banc de temps i biblioteca. Una MATRIU no pot
  connectar una altra MATRIU ni un projecte genèric.
- **Només un nivell.** Ni néts, ni el subarbre d'un germà.

El missatge d'error ho delata: «No hi ha bancs de temps ni biblioteques **al
mateix territori**».

### El canvi

El conjunt de candidats hauria de ser, per ordre de proximitat:

1. `descendants(node.id)` — **el que penja de tu**. És el cas natural i el que
   avui falta.
2. germans (el que ja hi ha).
3. el subarbre dels ancestres, sota demanda i marcat com a més llunyà.

I treure el filtre de dinàmica: que el picker mostri **el que hi ha**, agrupat
per tipus, en comptes de decidir per l'usuari quins dos tipus serveixen.

### El perill que això obre, i que no es pot ignorar

`ecosystemResources(node)` **suma** hores i objectes dels nodes enllaçats:

```js
links.forEach(l => {
  if (l.dynamicType==='banc_temps') hores += offersOf(l)…
  if (l.dynamicType==='biblioteca_coses') objectes += objectsOf(l)…
});
```

Mentre els enllaços eren germans, sumar era innocu. **En el moment que pots
enllaçar un fill teu, sumar és doble comptatge**: `rollup()` ja agrega els fills
cap amunt, i l'ecosistema els tornaria a comptar.

Això és exactament la veda de *consolidació entre nivells: propi vs agregat, mai
sumar-los*. Per tant el canvi no és només ampliar la llista de candidats:

- Un enllaç a un **descendent** s'ha de marcar com a tal i **no sumar-se** al
  total —o restar-se de l'agregat—, i dir-ho a la pantalla.
- Un enllaç a un **germà o a un node de fora** sí que suma, perquè no entra per
  cap altra banda.

Sense això, la primera MATRIU comarcal que connecti els seus municipis publicarà
el doble d'hores de les que existeixen. I com que el fons distingeix *verificat*
de *estimat*, seria un número inflat amb aparença de verificat: el pitjor cas.

**Cost:** baix el picker, mitjà fer bé el no-doble-comptatge. El segon és el que
val la pena i no es pot ajornar si es fa el primer.

---

## 2 · Subscripció amb tokens d'IA i permaweb, com a MVP

### Què hi ha avui

- **BYO key**: `loadAiKey` / `saveAiKey` guarden la clau d'Anthropic a IndexedDB
  (`__aikey`). Cada persona paga el seu.
- `AI.call` amb intents catalogats i `max_tokens` per intent — o sigui, **el
  consum ja és mesurable per crida**.
- **Permaweb: manual.** El SOS dona el fitxer i el CID; pinnar-lo és cosa teva.
  No hi ha codi d'Arweave i no se'n fa veure que n'hi hagi.

### La decisió que hi ha al mig

Una subscripció vol dir que **algú altre guarda la clau i mesura el consum**. I
això vol dir un servidor. El SOS no en té, i no tenir-ne no és una mancança: és
la premissa.

La sortida que no traeix res: **el servidor pot existir per a les comoditats,
mai per al registre**. Concretament:

| El que pot dependre d'una subscripció | El que no pot dependre'n mai |
|---|---|
| Crides d'IA (suggerir mapa, dossier, diagnòstic) | Apuntar hores |
| Pinnar les versions del registre a Arweave | Signar, verificar, fusionar |
| Relé gestionat | Llegir el teu propi node |

La prova de foc: **si demà es tanca la subscripció, tot el que hi ha al teu SOS
segueix funcionant i verificant-se**. Si no, la subscripció s'ha convertit en
l'amo que el projecte volia evitar.

### MVP en tres passos, del més barat al més car

1. **Sense servidor.** Botó «pinna aquesta versió» amb instruccions i el fitxer
   a punt. Zero infraestructura, i es diu clarament que és manual. Ja és el 80 %
   del valor: el registre ja és públic i ancorat.
2. **Proxy d'IA amb quota per `did`.** Un servei mínim que guarda *la nostra*
   clau i porta un comptador per `did:sos`. L'app segueix funcionant amb BYO key
   si no en vols. Aquí ja hi ha subscripció de debò, i el que es ven és **quota**,
   no accés a les teves dades.
3. **Vals prepagats signats.** En comptes d'un compte, un val signat que el proxy
   accepta i marca com a gastat. Encaixa amb la resta del projecte —tot són
   afirmacions signades— i evita tenir una base de dades d'usuaris.

**Recomanació:** fer 1 ara, i no fer 2 fins que hi hagi gent que ho demani. La
permaweb es paga un cop i és el que la gent entén que compra; els tokens d'IA
són un cost recurrent que obliga a portar comptes de tothom.

---

## 3 · Que sigui fàcil registrar-se i sortir a la comunitat

### Què ja està bé, i val la pena no espatllar-ho

**No hi ha registre.** La identitat (`did:sos`) es genera al dispositiu la
primera vegada: ni correu, ni contrasenya, ni confirmació. `openSuperheroiOnboarding`
demana nom, població i el que saps fer. Això ja és millor que el 95 % de les
apps del sector i no s'ha de tocar.

`welcomeEvent(name)` fa la part difícil: en donar-se d'alta, **busca a l'instant
gent amb qui ja es podria fer un intercanvi**. La intenció hi és.

### On es trenca

**Entrar és fàcil; sortir a la comunitat no.** Perquè algú de fora et trobi, la
teva oferta ha d'estar al paquet públic del node (`supplyPublicPack`), i
publicar-lo és una acció **del qui sosté el node**, no teva. O sigui: una persona
nova depèn que un coordinador publiqui perquè existeixi cap enfora.

I el `welcomeEvent` promet coincidències que, en un node nou amb tres persones,
seran zero. Una benvinguda que diu «no hem trobat ningú» és pitjor que no
prometre res.

### El canvi

- **Que publicar-se no depengui de ningú.** Una targeta pública personal —el que
  ofereixes i el que demanes, la població, cap contacte— que la persona publica
  ella mateixa pel mateix camí que el canal (V65) o l'oferta comuna (V60).
- **Que la benvinguda no promoti el buit.** Si no hi ha coincidències, dir-ho
  amb el següent pas concret: «encara no hi ha ningú que demani això; ets el
  primer, i això vol dir que la teva oferta hi serà quan arribi algú».
- **L'enllaç d'invitació ja existeix** (`inviteLink`) i és la via que de debò
  funciona en un poble: algú et passa un QR. Val més invertir aquí que en
  descobriment anònim.

**Cost:** baix. I és probablement el que més mou l'agulla de tot aquest document,
perquè afecta la primera hora de cada persona nova.

---

## 4 · Actualització automàtica amb nodes i projectes de dades públiques

### Què hi ha avui

`updateAtles()` llegeix `SOS/atles/index.json` a l'arrencada i fusiona els
paquets públics. O sigui: **el mecanisme d'actualització automàtica ja existeix i
ja corre sol**. El que li falta és que algú alimenti l'atles.

`aiDiscoverEntities` proposa entitats amb IA i és **verify-first**: proposa, no
escriu. Aquesta regla no s'ha de relaxar.

### El camí

Una tasca programada que llegeix dades obertes —registre d'entitats, cens
d'associacions, dades obertes municipals— i **obre una PR** contra `SOS/atles/`.
No escriu directament: una PR és revisable i reversible, i és el mateix camí que
ja fa servir tothom qui aporta a l'atles.

Tres regles que això necessita des del primer dia:

- **Entitats sí, persones no.** Importar el cens d'associacions d'un municipi és
  dada pública sobre organitzacions. Importar res sobre persones no és el mateix
  problema amb un altre volum: és un altre problema.
- **La font es guarda amb la dada.** D'on surt i de quina data. Una entitat sense
  procedència és un rumor amb format de fitxa.
- **Un node importat no és un node viu.** Ha de quedar clar que ningú d'allà ha
  dit encara que hi és. Si no, l'atles s'omple de projectes fantasma i el mapa
  deixa de voler dir res.

### Connectar persones

Ja hi és: `findMatches` i `matchesForPerson` casen oferta i demanda entre nodes,
i els pings ho superfícien. El que millorarà les coincidències **no és més codi**:
és més gent i més ofertes publicades — que ens torna al punt 3.

---

## Ordre suggerit

| | Què | Per què primer | Cost |
|---|---|---|---|
| 1 | **Sortir a la comunitat** (§3) | afecta la primera hora de cada persona nova | baix |
| 2 | **Enllaçar fills + no doble comptatge** (§1) | el segon és obligatori si es fa el primer | baix + mitjà |
| 3 | **Pinnar a la permaweb, manual** (§2 pas 1) | tanca el registre públic sense servidor | baix |
| 4 | **Atles per PR des de dades obertes** (§4) | el mecanisme ja corre; falta alimentar-lo | mitjà |
| 5 | **Proxy d'IA amb quota** (§2 pas 2) | només quan algú ho demani | alt |

El punt 5 és l'únic que introdueix un servidor, i per això va l'últim i amb la
prova de foc escrita: **si es tanca, tot el que hi ha al teu SOS segueix
funcionant**.
