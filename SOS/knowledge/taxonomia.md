# Taxonomia · on va cada cosa, i com se sap

Aquest repositori té 24 pàgines HTML soltes a l'arrel, nou versions d'una app
anterior (`v2`…`v9`), tres carpetes de codi que ja no s'executa i un `knowledge/`
que ha crescut per acumulació. Cap d'aquestes coses està malament per separat.
El problema és **que no hi ha manera de saber-ho des de fora**: qui obre el
repositori —una persona nova o una IA— ha d'endevinar què és viu i què és
memòria, i endevina malament.

I aquí hi ha la diferència que ho decideix tot: **una persona pregunta; una IA
no.** Una IA llegeix el nom de la carpeta, es fa una idea i escriu. Si el nom
enganya, escriu al lloc equivocat amb tota la confiança del món. Per tant una
taxonomia pensada per treballar amb IAs no és una jerarquia bonica: és un
sistema on **cada carpeta es declara** i on **un mapa derivat de l'arbre**
—no escrit a mà— fa impossible que la declaració i la realitat divergeixin.

> Un mapa desactualitzat és pitjor que cap mapa. Sense mapa mires; amb un mapa
> fals, vas.

## Les cinc cares

No és un arbre profund. És una **classificació per cares**: cada carpeta de
primer nivell n'és exactament una, i la cara diu **què s'hi pot fer** —que és
l'única pregunta que es fa qui hi arriba.

| Cara | Què és | La regla d'entrada | Qui hi mana |
|---|---|---|---|
| **llei** | Les regles que governen la resta | Hi entra el que, si es trenca, invalida la feina feta | Es discuteix, no s'edita de passada |
| **obra** | La cosa mateixa: el que fa servir la gent | Una sola font de veritat per cada cosa | El que hi ha és el que funciona |
| **prova** | El que comprova que l'obra compleix la llei | Cada regla que importi ha de tenir aquí qui la vigili | Ha de petar quan toca, i només llavors |
| **saber** | El que sabem i encara no és obra | Hi entra el que serviria a algú altre, no les notes d'un dia | Es cita, no es copia |
| **arxiu** | El que va ser | No s'hi treballa, no s'hi busca com a referència | Es conserva; no es llegeix com a present |

Cinc i no set. Cada cara de més és una decisió que algú haurà de prendre cada
cop que crea un fitxer, i les decisions que es prenen cada dia s'acaben prenent
malament.

### La cara que la gent s'oblida: `arxiu`

`v2`…`v9`, `ia/`, `js/`, `knowledge-base/` i la majoria de les pàgines de
l'arrel són versions anteriors del projecte. **No s'esborren**: hi ha història
allà dins, i `_redirects` encara en serveix algunes al web públic. Però tampoc
són el projecte, i tenir-les barrejades amb el que sí que ho és fa que qualsevol
cerca de text doni resultats de fa tres anys amb la mateixa cara de veritat que
els d'avui.

La feina de la cara `arxiu` és **dir-ho**, no moure-ho. Moure-ho trencaria el
web públic, i això és una decisió amb conseqüència a fora que no es pren de
passada mentre es fa neteja.

## Les tres regles de nomenclatura

Són poques a posta: una convenció que ningú recorda no és una convenció.

1. **El nom diu el contingut, no el format.** `registre/` i no `json/`.
   `prompts/` i no `md/`. El format ja el diu l'extensió.
2. **Singular per a la cosa, plural per al calaix.** `codex.md` és una cosa;
   `prompts/` és un calaix de coses del mateix tipus.
3. **Res de `misc/`, `altres/`, `temp/` ni `nou/`.** Un calaix sense criteri
   d'entrada s'omple sol i no es buida mai. Si una cosa no té cara, el que falta
   és decidir-la, no un lloc on amagar-la.

## Com hi navega una IA

L'ordre de lectura per a qualsevol IA que hagi de tocar això —i el motiu de
cada pas, perquè saltar-ne un té conseqüències concretes:

1. **`SOS/knowledge/MAPA.md`** — què hi ha i de quina cara és. **Generat**, mai
   escrit a mà.
2. **`SOS/knowledge/codex.md`** — les vedes. Són llei: cadascuna és un error que
   ja es va cometre i que no s'ha de tornar a cometre.
3. **`SOS/knowledge/for-ai/README.md`** — el contracte de treball concret.
4. **La cara `obra` que et toqui.** Sempre `Grep` abans de moure res: el codi és
   autocontingut i les coses es cauen a distància.
5. **La `prova` corresponent**, abans d'escriure i no després. Si el que vols
   fer no té guarda ni test, la primera feina és decidir si n'ha de tenir.

I la regla que estalvia més temps: **si un fitxer és a `arxiu`, no és una
referència.** Que un patró hi aparegui vuit vegades no vol dir que sigui el
patró; vol dir que ho va ser.

## El mecanisme que impedeix que això es podreixi

Un document com aquest, sol, dura fins a la primera setmana amb feina. El que el
sosté és que **el mapa és derivat**:

- `SOS/tools/build-mapa.js` recorre l'arbre de debò i escriu `MAPA.md`.
- La cara de cada carpeta es declara **aquí**, en aquest fitxer, a la taula de
  la secció següent — un sol lloc.
- `build-mapa.js --check` peta al CI si hi ha una carpeta sense cara declarada,
  o una cara declarada per a una carpeta que ja no existeix.

O sigui que **crear una carpeta nova sense dir què és** trenca el CI. No és
burocràcia: és l'única manera que la resposta a «on va això?» segueixi existint
d'aquí a dos anys.

## Declaració de cares

Format: `- ruta · cara · una línia del que hi entra`. El generador llegeix
aquesta llista i res més.

- `SOS` · obra · L'aplicació i tot el que se serveix: una pàgina per cosa, autocontingudes
- `SOS/knowledge` · saber · El que sabem: llei, referents, visió, negoci i aquest mapa
- `SOS/knowledge/matriu` · saber · El model de la MATRIU: com funciona i com es millora
- `SOS/knowledge/references` · saber · Els referents conceptuals, citats i no copiats
- `SOS/knowledge/vision` · saber · Decisions d'arquitectura vives i auditories fetes
- `SOS/knowledge/dev` · saber · El backlog i la guia d'estil per a qui hi escriu
- `SOS/knowledge/for-ai` · saber · El contracte de treball per a una IA que hi contribueix
- `SOS/knowledge/marketing` · saber · Veu de marca i material de difusió
- `SOS/knowledge/negoci` · saber · Model d'equip gestor, formació i mentoria
- `SOS/prompts` · saber · Un fitxer per intent d'IA: el que se li demana, versionat
- `SOS/tools` · prova · Les guardes que peten al CI quan una promesa deixa de ser certa
- `SOS/tests` · prova · Playwright contra les pàgines de debò, per `file://`
- `SOS/registre` · obra · El registre públic: hashes, totals i altes. Mai files
- `SOS/sql` · obra · Esquema de la part opcional amb servidor
- `SOS/supply` · obra · L'oferta comuna publicada, passada pel sedàs
- `SOS/canal` · obra · Paquets de canal per tema, xifrats
- `SOS/atles` · obra · Dades geogràfiques i institucionals del territori
- `SOS/media` · obra · Imatges i material que serveixen les pàgines
- `.github` · prova · El CI: quines guardes corren i en quin ordre
- `netlify` · obra · Funcions d'edge del web públic
- `data` · arxiu · Llavors de dades d'una versió anterior
- `js` · arxiu · Codi solt d'abans que tot fos autocontingut
- `ia` · arxiu · Prototip d'app amb IA, servit encara per `_redirects`
- `knowledge-base` · arxiu · Mòduls de coneixement d'una versió anterior
- `v2` · arxiu · Versió anterior de l'app
- `v3` · arxiu · Versió anterior de l'app
- `v4` · arxiu · Versió anterior de l'app
- `v5` · arxiu · Versió anterior de l'app
- `v6` · arxiu · Versió anterior de l'app
- `v7` · arxiu · Versió anterior de l'app
- `v8` · arxiu · Versió anterior de l'app
- `v9` · arxiu · Versió anterior de l'app, servida encara per `_redirects`

## El que aquesta taxonomia no fa

- **No mou res.** Declara. Moure `v2`…`v9` i `ia/` sota una carpeta `arxiu/` de
  debò seria més net i trencaria `_redirects` i el web públic: és una decisió
  a part, amb conseqüència a fora, i es pren mirant-la de cara.
- **No decideix què s'esborra.** Res del que hi ha aquí diu que l'arxiu sobri.
  Diu que no és el present.
- **No classifica fitxer a fitxer.** La cara és de la carpeta. Un fitxer que no
  encaixa amb la cara de la seva carpeta és un senyal que el fitxer és al lloc
  equivocat, no que calgui una cara nova.
