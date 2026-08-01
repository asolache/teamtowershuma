# Pla de millora èpic de la MATRIU

> Auditoria del que hi ha, què hi falta i en quin ordre construir-ho.
> Per a com funciona avui, mira `guia-funcionament.md`.

---

## Part I · Auditoria de l'existent

### Què està integrat i funcionant

| Capacitat | Implementació | Estat |
|---|---|---|
| Creació de ventures per 3 vies | `CRITICAL_ACTIVITIES` · `PROTOTYPE_MAPS` · `aiPlanValueFlows` | ✅ |
| Tipus de projecte amb equity heretat | `PROJECT_TYPES` (4) | ✅ |
| Mapa de valor VNA per venture | `newVenture` · `newVentureFromPrototype` | ✅ |
| Diagnòstic de salut del mapa | `buildHealth` (ara també per venture) | ✅ |
| Pla d'sprints des del mapa | `seedSprintPlanFromMap` (S1/S2/S3) | ✅ |
| Backlog amb 4 tipus d'item | `addBacklogItem` · `toggleBacklogItem` | ✅ |
| Portes d'etapa amb criteris | `stageGate` · `advanceStage` | ✅ |
| Readiness de graduació (5 checks) | `ventureReadiness` | ✅ |
| Assignació de recursos de l'ecosistema | `ecosystemResources` · `allocationsOf` | ✅ |
| Slicing Pie per venture i per fons | `computeVentureEquity` · `computeEquity` | ✅ |
| Oracle de valoració editable | `oracleFmv` · `oracleObjectValue` | ✅ |
| Fons cooperatiu + valor amb rang | `fundRollup` · `fundValue` | ✅ |
| Intercooperació signada i encadenada | `transferBetweenVentures` · `cooperationSummary` | ✅ |
| Graduació amb carry-over de backlog | `graduateVenture` | ✅ |
| Impacte psicosocial | `matriuPsychoImpact` | ✅ |
| Equip gestor (Comando) node i entitat | `newProjectComando` · `newEntityComando` | ✅ |
| Registre d'activitat | `activityFeed` · `openActivityLog` | ✅ |
| Ancoratge públic verificable | `buildAnchorPack` · `nostrPublishAnchor` | ✅ |

### Defectes trobats i corregits en aquesta auditoria

| # | Defecte | Impacte | Correcció |
|---|---|---|---|
| 1 | **Convenció de `kind` inconsistent** — 3 funcions escrivien `'T'`/`'I'` mentre tota la resta de l'app espera `'tangible'`/`'intangible'` | La reciprocitat (mètrica insígnia) comptava com a tangibles tots els fluxos de ventures fetes des d'activitats crítiques; `buildHealth` deia «Només tang.» erròniament; el render SVG perdia la distinció visual | Escriptura canònica via `normKind()`; lectura tolerant perquè les dades ja persistides a IndexedDB segueixin comptant bé |
| 2 | **Portes d'etapa inexistents** — només la transició final estava condicionada | Una venture podia saltar idea→prototip→validació a cops de clic, sense cap evidència. Això no és incubar, és canviar un desplegable | `stageGate` amb criteris propis per cada salt (3 · 4 · 5 comprovacions); botó 🔒 amb pendents fins que estan verds |
| 3 | **`cooperationSummary` orfe** — calculat, exportat, mai renderitzat | La intercooperació només es veia venture a venture; l'agregat que explica el model Mondragón era invisible | Secció nova a la Cartera amb total, desglossament per tipus i el perquè |
| 4 | **Salut VNA no aplicada a ventures** — `buildHealth` només s'usava al node | Cada venture naixia cega: no es podia saber si el seu mapa era recíproc, dens o tenia rols aïllats — precisament el que la metodologia VNA serveix per veure | Panell de salut a `openVentureDetail` |
| 5 | **Tres capçaleres invisibles** — `el(tag, class, html)` cridat com `el('h3','Text')`, que posava el text com a `className` | «Rols / Actors», «Nou intercanvi» i «Salut de la xarxa» no s'han renderitzat mai | Tercer argument corregit als tres punts |

---

## Part II · El que falta

Ordenat per relació impacte/esforç. Cada fase és independent i enviable.

### Fase 1 · Acompanyament (el buit més gran)

Una incubadora sense mentoria és un repositori. Avui no hi ha cap rastre de
l'acompanyament, que és el servei principal que presta una MATRIU.

- **Mentors per venture** — assignar un o més socis com a acompanyants, amb el
  seu àmbit (jurídic, econòmic, tècnic, relacional).
- **Registre de sessions** — data, assistents, temes, acords, propers passos.
  Cada sessió és una entrada més al ledger: el temps de mentoria **és** aportació
  de valor i ha de generar slices.
- **Alertes d'abandó** — una venture sense activitat en X setmanes surt marcada a
  la Cartera. El silenci és el primer símptoma abans que un projecte mori.

*Per què primer*: converteix el temps d'acompanyament en valor comptabilitzat, i
tanca el forat entre «tenim eines» i «acompanyem gent».

### Fase 2 · Viabilitat econòmica

`fundValue` diu què s'ha mobilitzat, no si el projecte se sosté. Per als tipus
cooperativa, autònom i empresa això és el que decideix si graduar té sentit.

- **Model d'ingressos** per venture: fonts, recurrència, preu unitari estimat.
- **Estructura de costos**: fixos i variables.
- **Llindar de sostenibilitat**: unitats/mes per cobrir costos, i quant falta.
- **Runway del fons**: amb el capital actual i el ritme de crema, quants mesos.
- Nova comprovació a la porta 3 per als tipus amb ànim de lucre: *el llindar està
  calculat i és assolible*.

*Per què*: graduar una cooperativa que no sap si cobreix costos és enviar-la a
tancar en sis mesos.

### Fase 3 · Riscos i bloquejos

- **Registre de riscos** per venture: descripció, probabilitat, impacte, mitigació.
- **Items bloquejats** al backlog, amb motiu i qui desbloqueja.
- **Semàfor a la Cartera**: verda (avança), ambre (bloquejada >2 setmanes),
  vermella (risc alt sense mitigació).

*Per què*: avui una venture aturada i una que va bé són visualment idèntiques.

### Fase 4 · Vista de cohort

- **Taula comparativa** de totes les ventures: etapa, readiness, backlog, hores,
  equity, salut del mapa, última activitat.
- **Embut per etapes**: quantes ventures a cada estadi i quantes graduades.
- **Ordenació i filtre** per qualsevol columna.
- **Exportació CSV** per a memòries i justificacions de subvenció.

*Per què*: qui coordina la MATRIU necessita veure el conjunt en una pantalla, no
obrir dotze modals.

### Fase 5 · Finançament i tràmits

- **Pipeline de finançament**: subvencions i préstecs sol·licitats, imports,
  estats, terminis. Alertes de venciment.
- **Checklist jurídica per tipus**: els passos reals de constituir una SCCL,
  donar-se d'alta d'autònom, registrar una associació — vinculats a la
  `juridic` que ja porta cada `PROJECT_TYPE`.

*Per què*: el mur real d'un projecte comunitari no és la idea, és la paperassa i
el calendari de convocatòries.

### Fase 6 · Formació lligada a l'etapa

`formacio.html` té 8 mòduls; la MATRIU no els cita mai.

- **Mòdul recomanat per etapa**: idea→M3 (VNA), prototip→M4 (recursos),
  validació→M6 (Slicing Pie), graduació→M5 (governança).
- **Progrés formatiu de l'equip** com a senyal de maduresa a la Cartera.
- Nova comprovació opcional: *el lead ha completat el mòdul de l'etapa*.

*Per què*: tanca el bucle acció-formació que la MATRIU ja promet en el seu propi
text d'introducció però no implementa.

### Fase 7 · Seguiment post-graduació

- **Vincle viu** entre la venture graduada i el node nou (avui hi ha
  `graduatedNodeId` però no es fa servir per llegir res).
- **Revisions als 3, 6 i 12 mesos**: segueix actiu? ha crescut? ha mort?
- **Taxa de supervivència** de la MATRIU, com a indicador de la incubadora
  mateixa i no només dels projectes.

*Per què*: una incubadora que no sap què va passar amb el que va graduar no pot
millorar el seu propi mètode.

### Fase 8 · Evidències

- **Adjuntar proves** als items de backlog: enllaç, foto, document.
- Emmagatzematge local (IndexedDB blob) amb opció d'ancorar el hash.
- Comprovació de graduació reforçada: *els entregables de l'S3 tenen evidència*.

*Per què*: converteix el checklist en un expedient defensable davant d'una
administració que finança.

---

## Part III · Ordre recomanat

```
Fase 1 (mentoria) ──▶ Fase 3 (riscos) ──▶ Fase 4 (cohort)
                                              │
Fase 2 (viabilitat) ──────────────────────────┤
                                              ▼
                     Fase 5 (finançament) ──▶ Fase 7 (seguiment)
                                              ▲
Fase 6 (formació) ────────────────────────────┘
                     Fase 8 (evidències) ─────┘
```

**Fases 1 i 3 primer**: són les que fan que la MATRIU deixi de ser un
repositori d'estructures i passi a ser un servei d'acompanyament. Sense elles,
la resta són millores sobre una base incompleta.

**Fase 4 immediatament després**: és la que dona a la coordinació una raó per
obrir l'app cada setmana.

---

## Principis a mantenir

Qualsevol millora ha de respectar el que ja fa la MATRIU diferent:

1. **Evidència abans que permís** — les portes es passen demostrant, no demanant.
2. **El valor circula** — tota funció nova ha de preguntar-se si ajuda a fer
   circular valor o només a acumular-lo.
3. **Glass-Box** — cap xifra sense el seu desglossament auditable.
4. **Local-first** — res no pot requerir servidor.
5. **L'intangible compta** — qualsevol mètrica nova ha de tenir la seva parella
   relacional, no només l'econòmica.
6. **Zero Redundancy** — abans d'afegir, comprovar si ja existeix i només li
   falta estar connectat (tres de les cinc correccions d'aquesta auditoria eren
   exactament això).
