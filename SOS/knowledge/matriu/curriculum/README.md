# Currículum de la Matriu · v0.2

> El que aprens fent al sistema operatiu de la colla.
> Currículum operatiu de la **Matriu**, integrat amb **TeamTowers SOS V11**.

[![status](https://img.shields.io/badge/status-v0.2--stubs-orange)]()
[![domains](https://img.shields.io/badge/dominis-11-blue)]()
[![license](https://img.shields.io/badge/license-CC%20BY--SA%204.0-green)]()

> **Des del 14/11/2026 el currículum viu aquí**, a `SOS/knowledge/matriu/curriculum/`,
> al costat de la [guia de funcionament](../guia-funcionament.md) i del
> [pla de millora](../pla-millora.md) de la MATRIU. El repositori
> `teamtowers-matriu` queda com a arxiu. Validació: `python3 build.py` des d'aquesta carpeta.

---

## Què és això

Aquest repositori conté el **currículum operatiu de la Matriu**: una estructura
de documents Markdown que defineix els **11 dominis** de competències del
programa d'acció-formació de **TeamTowers**, juntament amb les **skill-seeds**
(skills d'IA carregables pel swarm) i els **SOPs** (procediments validats per
Comunitats de Pràctica) que les suporten.

És simultàniament:
- **Currículum pedagògic** per a humans que aprenen
- **Knowledge graph** per a agents IA que els acompanyen
- **Catàleg** d'artefactes verificables produïts en cada projecte

## Arquitectura v0.2

```
                 D-00 · Treball intern + IA aliada    (transversal)
                  ↓
  ───────────── CICLE DE VIDA DEL PROJECTE ──────────────
  D-01 → D-02 → D-03 → D-04 → D-05 → D-06 → D-07 → D-08
  ────────────────────────────────────────────────────────
                  ↓
                 D-09 · Comunitats de Pràctica        (transversal)
                  ↓
                 D-10 · Metanoia                      (culminació)
```

**Tres modes de domini:**

- **`transversal`** (D-00, D-09) — activables des del primer dia
- **`linear`** (D-01 a D-08) — el cicle de vida del projecte
- **`culmination`** (D-10) — només es reconeix després del cicle

**Els 8 dominis lineals s'agrupen narrativament** en quatre fases:

| Fase | Dominis | Què fas |
|---|---|---|
| **Definir** | D-01, D-02 | Idea + propòsit + mapa de valor |
| **Estructurar** | D-03, D-04 | Equip + comptabilitat |
| **Operar** | D-05, D-06 | Agents IA + contractes |
| **Llançar** | D-07, D-08 | Comunicació + mercat |

## Estructura

```
.
├── _schema.md              ← Definició formal del format dels MD
├── _index.md               ← Catàleg dels 11 dominis amb estat
├── build.py                ← Validador + generador de JSON
├── README.md               ← Aquest document
├── CONTRIBUTING.md         ← Procés de contribució
├── CLAUDE.md               ← Instrucions per a Claude Code
├── LICENSE                 ← CC BY-SA 4.0
├── .gitignore              ← Builds, caches, secrets
├── .claude/instructions.md ← Detall per a Claude Code
│
├── domains/                ← 11 dominis (d00..d10)
├── competencies/           ← Competències per domini (c-DD.NN-slug)
├── skill-seeds/            ← Skills per agents IA (s-slug)
├── sops/                   ← Procediments validats (sop-slug)
│
└── html/
    ├── auditoria.html      ← Interfície visual del currículum
    └── curriculum-data.json ← Output del build.py (autogenerat)
```

## Schema híbrid

Cada document MD té dues capes:

- **Frontmatter YAML** — Estructurat, llegible per agents IA i scripts
- **Cos prosòdic** — Pedagogia humana, sense duplicar el frontmatter

Vegeu `_schema.md` per la definició completa, incloent el camp `mode`
(transversal/linear/culmination) que distingeix els tipus de domini.

## Ús ràpid

### Validar el currículum

```bash
python3 build.py
```

Mostra inventari, valida camps obligatoris, i detecta refs trencades.

### Veure l'auditoria visual

Obriu `html/auditoria.html` en un navegador. Llegeix el JSON generat
pel build i mostra el currículum amb panells de detall navegables.

### Integració amb SOS V11

**Opció recomanada · Git submodule:**

```bash
# Des del repo de SOS
git submodule add https://github.com/asolache/teamtowers-matriu knowledge/matriu
git submodule update --init --recursive
```

El `KnowledgeLoader` el carrega amb el patró estàndard:

```js
// Carregar tot el D-02 (domini + competències + skill-seeds + sops)
const ctx = await KnowledgeLoader.buildContext({
    matriu_domain: 'd02-value-mapping'
});

// Carregar només dominis transversals
const ctx = await KnowledgeLoader.buildContext({
    matriu_mode: 'transversal'
});
```

## Estat actual (v0.2)

| Domini | Mode | Status | Compet. | Skill-seeds | SOPs |
|---|---|---|---|---|---|
| **D-00 · Treball intern + IA aliada** | transversal | 🟢 **pilot complet** | **5**/5 | **10** | **10** |
| **D-01 · Definir el projecte** | linear | 🟢 **pilot complet** | **5**/5 | **9** | **10** |
| **D-02 · Mapejar el valor (VNA)** | linear | 🟢 **pilot complet** | **5**/5 | **7** | **8** |
| D-03 · Estructurar la colla | linear | ⚪ stub | 0/5 | 0 | 0 |
| D-04 · Comptabilitzar el valor | linear | ⚪ stub | 0/5 | 0 | 0 |
| D-05 · Operar amb agents IA | linear | ⚪ stub | 0/5 | 0 | 0 |
| D-06 · Acords i contractes | linear | ⚪ stub | 0/5 | 0 | 0 |
| D-07 · Comunicar el projecte | linear | ⚪ stub | 0/5 | 0 | 0 |
| D-08 · Productes i mercat | linear | ⚪ stub | 0/5 | 0 | 0 |
| D-09 · Comunitats de Pràctica | transversal | ⚪ stub | 0/5 | 0 | 0 |
| D-10 · Metanoia | culmination | ⚪ stub | 0/3 | 0 | 0 |

**Total previst:** ~53 competències, ~35 skill-seeds, ~20 SOPs.
**Actualment:** 15 competències, 30 skill-seeds, 30 SOPs.
**Progrés:** 3/11 dominis complets (D-00 + D-01 + D-02 = fonament + porta d'entrada + llenguatge fundacional).

## Roadmap

**Fase 1 (actual):** Stubs dels 11 dominis ✓

**Fase 2:** Completar D-02 (3/5 competències ja amb pilot)

**Fase 3:** Una sessió per domini. Ordre suggerit:
**D-01 → D-00 → D-03 → D-04 → D-09 → D-05 → D-06 → D-07 → D-08 → D-10**

**Fase 4:** Validació creuada per CoPs simulades

**Fase 5:** Migració definitiva a SOS V11 via submodule

## Contribuir

Vegeu `CONTRIBUTING.md` per al procés:
1. Triar un domini o competència oberta del `_index.md`
2. Crear o editar el MD seguint el `_schema.md`
3. Executar `python3 build.py` per validar
4. Obrir Pull Request amb el resum del canvi
5. La CoP corresponent revisa i ratifica (status: `approved-by-cop`)

## Marc teòric

Aquest currículum es recolza en:

- **Verna Allee (2008)** · *Value Network Analysis* — la lent fundacional (D-02)
- **Mike Moyer (2012)** · *Slicing Pie* — la comptabilitat de valor (D-04)
- **Peter Senge (1990)** · *The Fifth Discipline* — el marc de learning organization (D-00, D-10)
- **Etienne Wenger** · *Communities of Practice* — l'estructura social (D-09)
- **Rory Ridley-Duff** · *FairShares Model* — el repartiment multi-stakeholder (D-04, D-06)
- **TeamTowers · 10 competències castelleres** — el mètode d'equip (D-03)
- **Tradició vèdica** · les funcions de la ment — el treball intern (D-00)
- **Tiago Forte** · *Building a Second Brain* — el cervell extens (D-00)

## Llicència

[Creative Commons BY-SA 4.0](./LICENSE).

Pots usar, modificar i redistribuir el currículum, també comercialment, sempre que:
- En reconeguis l'autoria (TeamTowers · Alvaro Solache)
- Mantinguis la mateixa llicència per a obres derivades

## Mantenidor

**Alvaro Solache** · [`@asolache`](https://github.com/asolache) · [TeamTowers.eu](https://teamtowers.eu/)

L'ecosistema:
- [TeamTowers.eu](https://teamtowers.eu/) · Workshops castellers (des de 2003)
- [TeamTowers Huma](https://teamtowershuma.com/) · VNA & IA
- [SOS V11](https://sos.teamtowershuma.com/) · Sistema Operatiu de Swarm
- [La Matriu](https://teamtowershuma.com/matriu) · Acció-formació

---

*v0.2 · TeamTowers SOS V11 · Força · Equilibri · Valor · Seny*
