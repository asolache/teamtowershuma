# Guia d'estil · TeamTowers i TeamTowers Humà

> Com escrivim i com es veu. No és decoració: és el que fa que dues pàgines
> fetes amb mesos de diferència semblin la mateixa casa.

---

## 1. Les dues marques

| | **TeamTowers** | **TeamTowers Humà** |
|---|---|---|
| Què és | La consultora i el mètode | La branca comunitària i el producte SOS |
| A qui parla | Organitzacions que volen mapar el seu valor | Ajuntaments, consells comarcals, entitats i grups |
| To | Professional, precís | Proper, però mai infantil |
| Prova | Metodologia VNA | Un territori funcionant |

**Regla**: TeamTowers és qui signa; TeamTowers Humà és què fa al territori. Mai
es fan servir com a sinònims dins d'una mateixa frase.

---

## 2. Els quatre valors

**Força · Equilibri · Valor · Seny.**

Vénen del món casteller i no són adorns: cadascun és un criteri de decisió.

| Valor | Què vol dir a la pràctica |
|---|---|
| **Força** | El que prometem es pot sostenir. Res que depengui d'una sola persona |
| **Equilibri** | Cada tangible té el seu intangible. Cap xifra sense el seu context |
| **Valor** | Si no es pot comptabilitzar i verificar, encara no és valor |
| **Seny** | Preferim una cosa que funcioni a tres començades |

---

## 3. Veu

### Com escrivim

- **Frases curtes i afirmatives.** Si una frase necessita dues comes per
  respirar, es parteix.
- **Concret abans que abstracte.** No «optimitzem processos participatius»: «el
  mapa ensenya qui sosté què».
- **El dolor en veu de qui el pateix**, entre cometes i en primera persona:
  *«Sempre tirem els mateixos quatre.»*
- **Xifres amb el seu rang.** `fundValue` dona ±30%: es diu. Una xifra exacta
  que ningú pot comprovar genera menys confiança que un rang honest.
- **Diem què no fem.** Genera més confiança que ampliar la llista del que sí.

### Com no escrivim

| Evitar | Per què |
|---|---|
| «Solucions innovadores», «ecosistema disruptiu» | No diuen res i sonen a fullet |
| «Empoderament» sense objecte | Empoderar per fer què, exactament? |
| Superlatius sense prova | Si és «el millor», cal la dada al costat |
| Exclamacions | El to és serè, no animós |
| Anglicismes evitables | *engagement* → implicació · *insight* → troballa |
| Prometre resultats garantits | El resultat el fa la comunitat, no l'eina |

### Llengua

Català per defecte. Castellà com a segona (`data-i18n` a totes dues). **Tota
cadena nova neix amb les dues claus**: mig traduir és pitjor que no traduir.

Gènere: es busca la forma neutra abans que el desdoblament sistemàtic —
«qui coordina» abans que «el coordinador o la coordinadora». Quan cal desdoblar,
«/a» a l'adjectiu: *benvingut/da*.

---

## 4. Color

```
--bg-dark      #050507   fons principal
--bg-panel     #0a0a0f   panells
--bg-elevated  #111118   elements elevats
--border       rgba(255,255,255,.07)
--white        #f5f5f7   text principal
--light        #c7c7d1   text secundari
--muted        #82828d   text terciari i metadades
```

### Accents · un significat cadascun

| Token | Hex | Què significa **sempre** |
|---|---|---|
| `--accent-indigo` | `#6366f1` | Acció primària, sistema, navegació |
| `--accent-green` | `#00e676` | Verificat, complet, salut, valor confirmat |
| `--accent-orange` | `#ff9100` | Atenció, pendent, avís no crític |
| `--accent-purple` | `#e040fb` | Comando, narrativa, arquetips |
| `--accent-blue` | `#00b0ff` | Territori, mapa, exploració |
| `--accent-red` | `#ff5252` | Error, vençut, risc |

**Regla dura**: un accent no canvia de significat entre pàgines. Si el verd vol
dir «verificat» al SOS, no pot voler dir «ecològic» a la landing.

Cada accent té la seva variant `-dim` al 12% per a fons.

---

## 5. Tipografia

- **Space Grotesk** — títols i interfície
- **JetBrains Mono** — dades, etiquetes, codi, xifres comptables

El mono no és estètic: marca **el que és auditable**. Si una xifra surt del
ledger, va en mono.

Etiquetes de secció: mono, `.62rem`, `letter-spacing:.09em`, majúscules,
color `--muted`.

---

## 6. Components

### Botons
- **Primari** — un per pantalla. Gradient indigo o fons ple.
- **Ghost** — vora, fons transparent. Tots els altres.
- **44px d'alçada mínima**, sempre. `touch-action:manipulation`.
- El text diu **què passarà**: «Fes el diagnòstic», no «Enviar».

### Targetes
Radi 10–14px, vora `--border`, fons `--bg-panel`. Accent a la vora esquerra
(3px) quan la targeta té estat.

### Espaiat
Escala 0.3 / 0.5 / 0.8 / 1.2 / 2 rem. Seccions separades per 2rem mínim.

---

## 7. Accessibilitat (no negociable)

- `aria-label` a tot control sense text visible. El `title` no compta.
- 44px de zona tàctil.
- `:focus-visible` amb contorn visible.
- Contrast AA mínim sobre fons fosc.
- `target="_blank"` sempre amb `rel="noopener"`.
- Responsive per ordre: **primer cau la decoració, després el context, mai les
  funcions.**

Detall complet a `../dev/guia-estil-ia.md`.

---

## 8. Estructura d'una pàgina de venda

```
1 · Dolor          en veu de qui el pateix
2 · Promesa        una frase, concreta
3 · Com            3-4 passos, no més
4 · Prova          xifres amb rang, o casos
5 · Oferta         què es pot contractar
6 · CTA            una acció principal + una secundària
7 · Objeccions     el que no fem, i el preu
```

**Una acció principal per pantalla.** Tres botons del mateix pes visual és no
tenir-ne cap.

---

## 9. Crides a l'acció

Ordenades pel compromís que demanen:

| Compromís | CTA | Quan |
|---|---|---|
| Cap | «Fes el diagnòstic en 3 min» | Entrada principal: torna valor sense demanar res |
| Baix | «Explora el SOS en viu» | Qui vol veure abans de parlar |
| Mitjà | «Llegeix la guia formativa» | Qui vol entendre el mètode |
| Alt | «Parlem del teu territori» | Qui ja sap què vol |

**El diagnòstic és el CTA principal** perquè és l'únic que dona alguna cosa
abans de demanar res.

---

## 10. Errors comesos i corregits

Es documenten perquè no es repeteixin:

| Error | Conseqüència |
|---|---|
| Un formulari extern per captar contactes | Trencava el missatge de sobirania de dades: prediquem local-first i el primer contacte anava a un tercer |
| Tres CTA del mateix pes al mateix bloc | Cap destacava |
| Enllaços `_blank` sense `rel` | Exposició a reverse tabnabbing |
| Pàgina publicada i no enllaçada des d'enlloc | Existia i no hi arribava ningú |
| Text passat com a classe CSS | Tres capçaleres invisibles durant mesos |
