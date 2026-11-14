# Contribuir al currículum de la Matriu

Gràcies per voler aportar al currículum. Aquesta guia explica com fer-ho
de forma que el resultat sigui útil tant per a humans com per als agents
del swarm SOS V11.

## Filosofia · *Glass-Box AI*

Tot el contingut d'aquest repositori és **públic i auditable**. Els SOPs
no són secrets industrials: són mètodes refinats per Comunitats de Pràctica
que volen ser ratificats, criticats i millorats per la xarxa.

Cada contribució passa per quatre fases:

```
DRAFT  →  REVIEW  →  APPROVED-BY-COP  →  CONSUMIBLE
```

- **DRAFT** — Algú escriu sobre el seu projecte real
- **REVIEW** — La CoP del rol associat el revisa
- **APPROVED-BY-COP** — Ratificat per la xarxa
- **CONSUMIBLE** — Els agents IA del swarm el carreguen com a base de coneixement

## Tipus de contribucions

Pots contribuir amb:

| Tipus | On va | Quan |
|---|---|---|
| Domini nou | `domains/d{NN}-{slug}.md` | Si has dissenyat un agrupament de competències coherent |
| Competència nova | `competencies/c-{DD}.{NN}-{slug}.md` | Si has desenvolupat una capacitat verificable |
| Skill-seed nova | `skill-seeds/s-{slug}.md` | Si saps com un agent IA pot suportar una competència |
| SOP nou | `sops/sop-{slug}.md` | Si has procedimentalitzat una pràctica |
| Refinament | qualsevol fitxer existent | Sempre, si el millores |

## Procés pas a pas

### 1 · Fer una proposta

Abans de crear MD nous, **obre una issue al repo** explicant què vols afegir:

- Quin domini afecta?
- Quina competència vols cobrir?
- Quin SOP s'utilitza?
- A quina CoP demanaràs validació?

Això evita treball duplicat i activa la conversa amb la CoP correcta.

### 2 · Crear el(s) fitxer(s)

Segueix estrictament el `_schema.md`. Recorda:

- **Frontmatter YAML** per a màquines (id, type, refs, agent, mastery_levels)
- **Cos prosòdic** per a humans (pregunta, criteri, com es practica)
- **No dupliquis** info entre frontmatter i cos
- **IDs en kebab-case ASCII** (no accents, no espais)
- **Status inicial sempre `draft`**

### 3 · Validar localment

```bash
python3 build.py
```

Si surten errors, soluciona'ls abans d'obrir el PR. Els warnings de
"refs no existeixen encara" estan permesos durant el pilot — són la teva
backlog visible.

### 4 · Obrir el Pull Request

Estructura el PR així:

```
Títol: [D-XX] Afegeix C-XX.Y · Nom de la competència

Cos:
- **Tipus de canvi:** nova competència / nou SOP / refinament
- **Fitxers nous:** llista
- **Refs noves:** llista (skill-seeds, sops, etc.)
- **CoP que ho validarà:** cop-nom

**Context:** explicació de per què aquesta competència és necessària
i com encaixa amb les altres del domini.

**Verificació local:** sortida del build.py
```

### 5 · Revisió de la CoP

La CoP corresponent revisa el PR:

- ✓ Lligams amb les competències existents
- ✓ Vocabulari coherent amb la disciplina
- ✓ Verificacions són mesurables
- ✓ Skill-seeds estan ben pensades
- ✓ Pedagogia (cos prosòdic) és clara

Si la CoP aprova, el PR es merge i l'status canvia a `approved-by-cop`.
Si demana canvis, conversa, refines, i tornem a revisar.

## Estil

### Tipogràfic

- Català sempre que sigui possible (excepte termes tècnics ja establerts en anglès)
- Frases curtes als manifests i frases-pal
- Cursiva per a *èmfasi* i conceptes clau d'altres autors
- Negreta per a **frases-ancora** que el lector ha de retenir
- Codi en `backticks` per a IDs, paths, noms de fitxers, comandos

### De contingut

- **Mostra, no diguis.** En lloc de "*aquesta és una competència complexa*", dóna l'exemple del recepcionista que té 4 rols
- **La pregunta primer.** Cada competència comença per la pregunta que aprens a respondre
- **Verifica amb verbs.** "*Sé identificar 5+ rols VNA*" és millor que "*entén els rols*"
- **Defineix la trampa.** Què passa quan s'aplica malament aquesta competència?
- **No facis llistes infinites.** 3-5 elements per llista màxim

## Anti-patterns

Coses que **no** acceptem al currículum:

- Continguts sense font o atribució (Verna Allee, Senge, Moyer es citen sempre)
- Skill-seeds que prometen màgia (*"l'agent farà el mapa VNA automàticament"*)
- Competències sense criteri de verificació
- SOPs que no especifiquen errades a evitar
- Frontmatter incomplet o malformat
- Vocabulari sànscrit usat com a marca de marca espiritual (vegeu `_schema.md`)

## CoPs i agents disponibles

| CoP | Agent del swarm | Suporta |
|---|---|---|
| `cop-mapejador-vna` | `@agent_dharma_ontologist` | D-01 |
| `cop-cap-de-colla` | `@agent_castell_director` | D-03 |
| `cop-cap-de-finances-coop` | `@agent_token_economist` | D-05 |
| `cop-coordinador-eixam-ia` | `@agent_swarm_orchestrator` | D-04 |
| ... | ... | ... |

Si la teva contribució necessita una CoP o un agent que **no existeix**,
proposa'l al PR. Els nous rols neixen de manera emergent (com diu el doc
`vision-communities-of-practice`).

## Preguntes?

Obre una issue al repo, contacta amb [@asolache](https://github.com/asolache)
o vine a la pròxima sessió oberta de la CoP corresponent.

---

*TeamTowers SOS V11 · Força · Equilibri · Valor · Seny*
