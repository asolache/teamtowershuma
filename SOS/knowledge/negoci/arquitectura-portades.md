# Dues portades, dues feines

> Anàlisi feta el 2026-09-24 **mesurant les pàgines amb un navegador**, no
> llegint-les. Cada xifra d'aquest document es pot tornar a treure executant el
> que hi ha al final.

---

## 1 · El que s'ha mesurat

### La portada de teamtowershuma.com

**16 seccions. 29,4 pantalles d'escriptori. 61,4 pantalles de mòbil.**

| Secció | Escriptori | Mòbil | % del mòbil |
|---|---:|---:|---:|
| hero | 1,2 | 2,1 | 3 % |
| fentpinya | 1,8 | 3,0 | 5 % |
| mapaval | 1,1 | 2,0 | 3 % |
| enfoc | 2,0 | 4,0 | 7 % |
| **beneficis** | 1,1 | 1,9 | 3 % |
| **glossari** | 1,1 | 2,5 | 4 % |
| relat | 1,2 | 2,6 | 4 % |
| facilitador | 1,5 | 2,9 | 5 % |
| com | 0,8 | 1,9 | 3 % |
| **aprenent** | 1,3 | 2,6 | 4 % |
| **cataleg** | **8,8** | **21,4** | **35 %** |
| cost | 1,7 | 3,5 | 6 % |
| **sos** | 1,5 | 3,7 | 6 % |
| trajectoria | 1,7 | 3,5 | 6 % |
| objeccions | 1,1 | 1,5 | 2 % |
| cta-final | 0,9 | 1,5 | 2 % |

**On és el preu:** el catàleg comença a la **pantalla 13,3** en escriptori i a la
**25,8** en mòbil. El primer preu escrit, a la **14,7** i la **27,7**.

### La portada del SOS · `/sos/`

**6,3 KB. Vuit blocs.** Eyebrow, titular, subtítol, tres dolors, els beneficis,
tres portes, una tira d'enllaços i el peu.

I al darrere: **21 destins de menú en quatre grups, i 1,1 MB de pàgines.**

| Grup | Pàgines | Pes |
|---|---:|---:|
| Comença | 4 | 170 KB |
| Eines | 9 | 564 KB |
| Aprèn | 5 | 615 KB |
| Xarxa | 3 | 198 KB |

---

## 2 · La troballa

**Les dues portades fan la feina de l'altra.**

La de teamtowershuma.com és una pàgina de venda que carrega **quatre seccions de
desenvolupament comunitari** que no venen res —beneficis psicosocials, el
glossari sencer, els projectes propis, el SOS com a projecte lliure—, i que
sumen el 16 % del mòbil.

I la del SOS són **6,3 KB davant de 1,1 MB**. És la porta d'entrada de vint-i-una
pàgines i **no n'anomena ni una**: qui hi arriba té tres portes i una tira
d'enllaços, i l'única manera de saber que existeix La Compra, L'Habitatge o la
Fàbrica de Superherois és obrir el desplegable del menú.

O sigui: **el catàleg de serveis s'amaga darrere de tretze pantalles, i el
catàleg d'eines no existeix enlloc.**

---

## 3 · La regla que ho ordena

Una sola frase, i tot s'assigna sol:

> **La portada respon «us hauria de contractar?».
> El SOS respon «com ho faig funcionar?».**

El que ajuda a **decidir una compra** es queda a la portada. El que ajuda a **fer
servir el model** se'n va al SOS. I cada banda hi porta amb una sola secció.

### L'assignació

| Secció | On va | Per què |
|---|---|---|
| hero, fentpinya, mapaval, enfoc | **Portada** | És la venda: promesa, prova, cas i dolor |
| relat, facilitador | **Portada** | Per què aquesta casa i no una altra |
| com, cost, trajectoria, objeccions | **Portada** | Com es treballa, d'on surt el preu, qui ho ha comprat, què preocupa |
| cataleg | **Portada** (veure §4) | És el producte |
| **beneficis** | **→ SOS** | Beneficis psicosocials i estalvi de les dinàmiques. No es contracta: es munta |
| **aprenent** | **→ SOS** | Són els projectes propis —SOS, Comando, Molekulandia, Fàbrica, directori—, que són el món del SOS. A la portada hi queda **una tira de proves amb enllaç** |
| **sos** | **→ SOS** | La secció sencera passa a ser una **banda de tres línies** amb enllaç |
| **glossari** | **Es parteix** | VNA, Intangible i Fent Pinya són el mètode que es ven → portada. SOS, MATRIU i Slicing Pie són l'eina → SOS |

**Efecte mesurat del moviment sol:** el mòbil passa de 61,4 a **~52 pantalles**.
Ordena el relat i no resol la llargada. El que resol la llargada és el punt
següent, i val la pena dir-ho abans que sembli que una cosa arregla l'altra.

---

## 4 · La pregunta de negoci: separar més els productes?

Avui hi ha **vint paquets** en quatre famílies, amb un filtre de sector:

| Família | Sector públic | Empresa | Tots dos |
|---|---:|---:|---:|
| Consultoria | 3 | 2 | — |
| Formació | 3 | 2 | 2 |
| Producció i dinamització | 2 | — | 3 |
| Digital i IA | — | — | 3 |

I, a part, **tres paquets que es venen al voltant del SOS** (implantació i
suport, IA amb frens, estudi de contractes intel·ligents).

### Les tres opcions

**(a) Deixar-ho com està.** Un sol catàleg a la portada, amb filtre.
· *A favor:* el preu és a la mateixa pàgina que l'argument; una sola URL a
posicionar; res a mantenir de nou.
· *En contra:* **21,4 pantalles de mòbil, el 35 % de la pàgina.** Qui navega
sense tocar el botó fix ha de baixar 26 pantalles per saber què costa una cosa.

**(b) Treure el catàleg a `/serveis` i deixar quatre targetes de família a la
portada.** ← **recomanada**
· *A favor:* la portada baixa a **~40 pantalles de mòbil** (i a ~31 fent també
el moviment del §3, **la meitat d'ara**). Cada família es pot explicar bé a la
seva secció en comptes de competir per l'espai. Una pàgina de serveis és el que
espera qui ve a comprar i el que s'enllaça des d'una proposta.
· *En contra:* el preu queda **a un clic** en comptes de a la mateixa pàgina.
· *Condició que ho fa acceptable:* **les quatre targetes de família han de
portar la forquilla de preu escrita.** Amb la forquilla a la portada i el detall
a `/serveis`, seguim complint la prova que ja existeix —arribar a un preu en dos
gestos— i guanyem trenta pantalles. Sense la forquilla, això és amagar el preu, i
llavors val més l'opció (a).

**(c) Partir per sector: `/empreses` i `/administracio`.**
· *A favor:* cada pàgina parla un sol idioma comercial.
· *En contra:* **duplica el relat del mètode dues vegades** —que és el que fa
creïble la casa i el que costa més d'escriure—, parteix el posicionament en dues
URLs que competeixen entre elles, i **vuit dels vint paquets són «per als dos»**:
o es dupliquen o es deixa mig catàleg fora de cada pàgina. El filtre de sector
que ja hi ha resol el mateix problema sense cap d'aquests costos.
· **No recomanada.**

### La recomanació, i el que no s'ha de fer

**Fer (b), i no fer (c).** I una cosa que no és òbvia i val més escriure-la:
**els tres paquets del SOS (implantació, IA, contractes) no van a `/serveis`: van
a `/sos/`.** Són el que es contracta al voltant de l'eina i es decideixen quan
algú ja hi és a dins, no quan compara consultories. Deixar-los al catàleg general
els posa davant de gent que encara no sap què és el SOS, i treure'ls de `/sos/`
els amaga de qui ja l'està fent servir.

---

## 5 · Què ha de ser la portada del SOS

Avui són tres portes i una tira d'enllaços. Ha de ser **la porta de vint-i-una
pàgines**, i per tant ha de dir-les. Quatre blocs a sota del que ja hi ha:

1. **Què hi guanyes** — ja fet: el fons, el que s'aprèn i el que s'estalvia, amb
   les xifres de l'app i la lectura de RSC.
2. **Què hi pots muntar** — les set dinàmiques amb la seva pàgina: banc de temps,
   biblioteca de les coses, la compra, l'energia, l'habitatge, la MATRIU, el
   mapa de valor. Cadascuna amb què és i què s'hi guanya. **Aquí hi arriben
   `beneficis` i la meitat del `glossari`.**
3. **Com s'aprèn** — formació (16 mòduls), escoles, vedes, blog, fluxos amb IA.
4. **El món** — Comando Molekulon, Molekulandia, Molekulon, el joc, el directori.
   **Aquí hi arriba `aprenent`**, que són exactament aquests projectes.

I al peu, **els tres paquets del SOS** amb el seu preu: el que es pot contractar
per a qui no vulgui descobrir-ho sol.

Regla de manteniment: **aquesta llista no s'escriu a mà.** Els destins ja estan
declarats a `build-nav.js` i els paquets a `build-oferta.js`. La portada del SOS
s'ha de generar d'allà, com ja es fa amb els beneficis, o divergirà la primera
vegada que s'afegeixi una pàgina.

---

## 6 · El risc que això obre, i que no es pot ignorar

**El SOS és la prova més forta que té la consultoria.** El «100 % de l'eina és
oberta i gratuïta» és una de les tres xifres del hero, i «s'aprèn fent amb
projectes propis» és el que distingeix aquesta casa d'una consultoria petita amb
un mètode bonic.

Si el moviment es fa a la brava i la portada es queda sense cap rastre del SOS,
**es perd l'argument que la fa diferent** i es guanya una pàgina més curta que ven
pitjor. Per això l'assignació del §3 no diu «treure»: diu **substituir per un
pont**.

- `aprenent` → **una tira de quatre proves amb enllaç**, no una secció.
- `sos` → **una banda de tres línies**: és lliure, funciona sense contractar-nos,
  i aquí es veu.
- La xifra del 100 % es queda al hero.

**La prova que dirà si el moviment ha anat bé** no és que la pàgina sigui més
curta: és que **des de la portada s'hi segueixi arribant**. Convé una guarda que
falli si la portada deixa de tenir un enllaç al SOS per sobre de la meitat de la
pàgina.

---

## 7 · Ordre de treball

| | Què | Per què primer | Cost | Estat |
|---|---|---|---|---|
| 1 | **La portada del SOS es converteix en porta** (§5, blocs 2-4, generats) | Sense això, moure-hi contingut és moure'l a un lloc que no el pot rebre | mitjà | **fet** |
| 2 | **Moure `beneficis`, `aprenent` i `sos`** i partir el glossari (§3) | Ja hi ha on posar-ho | baix | **fet** |
| 3 | **Els tres paquets del SOS passen a `/sos/`** (§4) | És una decisió de negoci, no de disseny, i és barata | baix | **fet** |
| 4 | **`/serveis` amb el catàleg, i quatre targetes de família amb forquilla** (§4b) | És el lever gros de llargada, i el més fàcil de fer malament | mitjà | pendent |
| 5 | **Guarda del pont** (§6) | Que no es pugui perdre el camí cap al SOS sense que peti | baix | **fet** (`check-landing.js` 7d) |

### El que ha donat, mesurat igual que abans

| | Abans | Després |
|---|---:|---:|
| Portada · pantalles de mòbil | 61,4 | **53,8** |
| Portada · on comença el catàleg | 25,8 | **21,3** |
| Portada · pantalles d'escriptori | 29,4 | **26,0** |
| `/sos/` · pàgines anomenades | **0** | **17** |

**La predicció del §3 era ~52 i el resultat és 53,8**, o sigui que l'estimació
era bona i la conclusió també: **ordena el relat i no resol la llargada**. Qui
vulgui la meitat de pàgina ha de fer el punt 4, i el punt 4 segueix pendent a
posta —canvia la manera de vendre i val la pena mesurar-lo a part.

Els punts 1-3 es poden fer i mesurar sense tocar el catàleg. **El punt 4 és el
que canvia la manera de vendre**, i val la pena fer-lo a part per poder mesurar
si el preu a un clic mou l'agulla o la para.

---

## 8 · Com es torna a mesurar

```js
// Alçada de cada secció, en pantalles, a les dues amplades.
await p.evaluate(() => document.querySelectorAll('.fade-up')
  .forEach(e => e.classList.add('visible')));
document.querySelectorAll('section').forEach(s =>
  console.log(s.id, Math.round(s.getBoundingClientRect().height / innerHeight * 10) / 10));
```

Amb `1280 × 900` i `390 × 844`, que són les dues amplades que ja fa servir
`SOS/tests/test-portada.mjs`.
