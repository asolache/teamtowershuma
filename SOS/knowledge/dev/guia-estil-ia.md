# Guia d'arquitectura de la informació i estil · SOS

> Com s'organitza la navegació del SOS i per què. Serveix per decidir on posar
> una funció nova sense que la barra torni a créixer sense control.

---

## 1. El principi: freqüència × criticitat

Cada control ocupa espai i, sobretot, **atenció**. La regla per decidir on va:

| Freqüència | Criticitat | On va |
|---|---|---|
| Alta | Alta | Barra superior, sempre visible, amb etiqueta |
| Alta | Baixa | Launcher (☰ Accions) |
| Baixa | Alta | Menú «Més» amb nom escrit |
| Baixa | Baixa | Launcher o paleta de cerca, i prou |

El que **mai** ha de passar: que una funció que es fa servir dues vegades l'any
ocupi el mateix espai visual que una que es fa servir vint cops al dia.

---

## 2. Els quatre nivells de navegació

```
Nivell 0 · Rutes (#/…)          →  enllaçable, marcable, navegable amb enrere
Nivell 1 · Barra superior        →  cercar · actuar · qui sóc
Nivell 2 · Launcher i paleta     →  totes les accions, cercables per nom
Nivell 3 · Menú «Més»            →  explorar i sistema, amb nom escrit
```

**Cap funció viu només al nivell 3.** El menú «Més» és una drecera, no l'únic
camí: tot el que hi ha és també al launcher o a la paleta. Per això es pot
tancar sense conseqüències i per això no passa res si algú no el descobreix.

### Nivell 1 · Barra superior

Només tres controls, i cadascun respon a una pregunta diferent:

| Control | Pregunta que respon | Per què és de nivell 1 |
|---|---|---|
| 🔍 **Cerca** (⌘K) | «On és això?» | És l'entrada universal: node, entitat, persona o acció |
| ☰ **Accions** | «Què puc fer?» | Porta d'entrada a tot el catàleg |
| 👤 **Persona** | «Qui sóc ara?» | Només apareix si hi ha sessió; identitat sempre visible |

La píndola d'estat de sincronització és **estat, no acció**: informa, no s'hi
clica, i porta `role="status"` amb `aria-live="polite"`.

### Nivell 3 · Menú «Més», agrupat per intenció

- **Explorar** — mapa de Catalunya, directori d'entitats, registre d'activitat
- **Sistema** — sincronitzar, configuració i dades, contacte

Els grups tenen encapçalament visible. Sense agrupació, sis opcions seguides
tornen a ser sopa d'icones amb text.

---

## 3. Regles de disseny

### Etiquetes
Una icona sola **no es descobreix**. Un emoji sense text obliga a passar el
ratolí per sobre — cosa que a iPad no existeix. Regla:

- Nivell 1: icona **+ etiqueta** en pantalla ampla; icona sola per sota de 820px.
- Nivell 3: sempre amb text. És justament el que el fa millor que sis botons emoji.
- `aria-label` **sempre**, digui el que digui el `title`. El `title` no és un nom
  accessible fiable.

### Mides tàctils
- Alçada mínima **44px** a tot control de la barra i del menú.
- `touch-action:manipulation` i `-webkit-tap-highlight-color:transparent` per
  evitar el retard de 300ms i el flaix blau a iOS.
- Els 32px que hi havia abans quedaven per sota de qualsevol guia tàctil.

### Teclat
- `⌘K` / `Ctrl+K` obre la cerca des de qualsevol lloc.
- `Escape` tanca primer el menú de la barra; si no n'hi ha cap obert, el modal.
- Dins del menú: `↓` `↑` per moure's, `Home` i `End` als extrems.
- `:focus-visible` amb contorn visible a tot arreu. Sense això, navegar per
  teclat és navegar a cegues.

### Comportament dels menús
- Clic fora tanca.
- Triar una opció tanca. Si no, el menú queda flotant per sobre del que acabes
  d'obrir.
- `aria-expanded` sincronitzat amb l'estat real, `aria-haspopup="menu"`,
  `role="menu"` i `role="menuitem"`.

### Responsive
- **≤820px** — cauen les etiquetes i les tecles ràpides; queden les icones.
- **≤560px** — cauen les molles de pa i la píndola d'estat.

L'ordre importa: **primer es perd decoració, després context, mai funcions.**
Una barra que amaga funcions en estret és pitjor que una que amaga etiquetes.

---

## 4. Rutes (nivell 0)

`#/n/<nodeId>/<tab>` per a nodes; `#/comando`, `#/activitat`, `#/mapa`,
`#/directori`, `#/identitat`, `#/multivers`, `#/pings`, `#/mentoria`.

Hash routing i no History API perquè `pushState` trenca sota `file://` i
exigeix reescriptures al servidor. El SOS ha de poder obrir-se des del disc,
IPFS o Arweave sense configurar res.

Afegir una vista enllaçable és **una línia** a `MODAL_ROUTES`. Si has de tocar
el parser, l'estàs afegint malament.

**Límit conegut**: els ids de node surten d'`uid()` i són locals a cada
dispositiu. Una ruta de node serveix per als teus marcadors, no per compartir.

---

## 5. Enllaços cap enfora

- `target="_blank"` **sempre** amb `rel="noopener"`. Sense això, la pàgina
  destí pot manipular la d'origen (reverse tabnabbing).
- Els enllaços a pàgines del SOS des de la web principal són relatius a l'arrel
  (`/SOS/…`) perquè funcionin igual des de qualsevol secció.
- Tota pàgina nova del SOS ha d'estar enllaçada des de:
  1. La navegació de la home de TeamTowers
  2. La home del SOS (`.ob-secondary`)
  3. El launcher, si té sentit dins de l'app

Una pàgina que existeix i no està enllaçada des d'enlloc no existeix.

---

## 6. Llista de comprovació abans d'afegir un control

1. **Ja hi és?** Mira el launcher i la paleta abans de crear res.
2. **A quin nivell li toca** segons freqüència × criticitat?
3. Té `aria-label` propi i no depèn només del `title`?
4. Fa 44px d'alçada com a mínim?
5. Es pot arribar per teclat i es veu quan té el focus?
6. Si obre una vista sencera, té ruta pròpia a `MODAL_ROUTES`?
7. Si és de nivell 3, **també** s'hi arriba des del launcher o la paleta?
8. Aguanta 560px sense desbordar-se ni amagar funcions?

Si alguna resposta és «no», encara no està acabat.

---

## 7. Antipatrons vistos i corregits

| Antipatró | Què passava | Correcció |
|---|---|---|
| **Sopa d'icones** | 9 botons emoji d'igual pes visual a la barra | 3 de nivell 1 + menú agrupat amb noms |
| **Objectius tàctils petits** | 32×32px, per sota de qualsevol guia | 44px mínim a tot arreu |
| **Nom accessible només al `title`** | Un lector de pantalla llegia l'emoji | `aria-label` a tots els controls |
| **Text com a classe CSS** | `el('h3','Text')` posava el text al `className`, i tres capçaleres no s'havien renderitzat mai | Tercer argument |
| **`_blank` sense `rel`** | 11 enllaços exposats a reverse tabnabbing | `rel="noopener"` a tots |
| **Pàgina òrfena** | `diagnostic.html` existia i no s'hi arribava des d'enlloc | Enllaçada des de la nav, el CTA i el launcher |
