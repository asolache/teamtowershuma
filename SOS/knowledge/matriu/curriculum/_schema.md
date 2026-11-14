---
id: matriu-schema
type: schema
version: v0.2
status: draft
author: "@alvaro"
purpose: >
  Definir l'estructura comuna de Dominis, Competències, Skill-seeds i SOPs
  del currículum de la Matriu, perquè el KnowledgeLoader i els agents del
  swarm SOS V11 puguin consumir-les de forma uniforme i auditable.
keywords: [matriu, curriculum, skills, competencies, domains, schema, sos-v11]
sos_context: critical
---

# Schema del currículum de la Matriu

> Quatre tipus d'entitats. Cada una amb el seu format i la seva carpeta.
> Principi rector: **complementar, no duplicar.** El YAML és per a màquines;
> el cos prosòdic és per a humans. No es repeteix el mateix dues vegades.

## Organització del repositori

```
matriu/
├── _schema.md              ← Aquest document
├── _index.md               ← Índex mestre del currículum
├── build.py                ← Validador i generador de JSON
│
├── domains/                ← 11 fitxers (d00..d10)
├── competencies/           ← N fitxers (c-DD.NN-slug)
├── skill-seeds/            ← N fitxers (s-slug)
└── sops/                   ← SOPs validats per CoP (sop-slug)
```

## Tipologia de dominis

El currículum té **tres modes** de domini, perquè reflecteix com realment funciona
l'aprenentatge dins una xarxa cooperativa:

- **`linear`** — Domini del cicle de vida del projecte. Es treballen en
  ordre (D-01 → D-08). Cada un produeix artefactes que el següent consumeix.
- **`transversal`** — Domini activable des del primer dia, sense ordre fix.
  Pot evolucionar durant tot el cicle. Exemples: D-00 (Treball intern),
  D-09 (Comunitats de Pràctica).
- **`culmination`** — Domini que només es pot reconèixer un cop el cicle
  s'ha viscut. No es pot ensenyar de manera lineal. Exemple: D-10 (Metanoia).

---

## 1. Domini (`domain`)

Categoria de competències. 11 al currículum. Carpeta `domains/`.

### Frontmatter obligatori

| Camp | Tipus | Exemple |
|---|---|---|
| `id` | `d{NN}-{slug}` | `d02-value-mapping` |
| `type` | literal | `domain` |
| `version` | semver | `v0.1` |
| `status` | enum | `draft \| review \| approved-by-cop \| deprecated` |
| `mode` | enum | `linear \| transversal \| culmination` |
| `name` | string CAT | `"Mapejar el valor (VNA)"` |
| `objective` | una frase | Què sap fer qui completa el domini |
| `competencies` | list ref | `[c-02.1, c-02.2, ...]` |
| `cop_ref` | ref | `cop-mapejador-vna` |
| `sos_module` | string | `VNA Mapper` |
| `prerequisites` | list of `d{NN}` | `[]` per a transversals i fundacionals |
| `unlocks` | list of `d{NN}` | Dominis que aquest habilita |
| `sos_context` | enum | `critical \| primary \| secondary` |
| `author` | handle | `"@alvaro"` |

### Cos del document

Quatre seccions canonical:

1. **El que aprens** — Què sap fer qui completa el domini, en termes pedagògics
2. **Per què aquí (i no en un altre moment)** — Argumentació de la posició al cicle
3. **El recorregut** — Les competències ordenades amb un paràgraf per cada una
4. **Connexió amb SOS** — Quin mòdul i agent del swarm donen suport

---

## 2. Competència (`competency`)

Capacitat humana desenvolupable. 3-6 per domini. Carpeta `competencies/`.

### Frontmatter obligatori

| Camp | Tipus | Exemple |
|---|---|---|
| `id` | `c-{DD}.{NN}-{slug}` | `c-02.1-identify-vna-roles` |
| `type` | literal | `competency` |
| `version` | semver | `v0.1` |
| `status` | enum | `draft \| review \| approved-by-cop \| deprecated` |
| `domain_ref` | ref | `d02-value-mapping` |
| `cop_ref` | ref | `cop-mapejador-vna` |
| `name` | string CAT | `"Identificar rols VNA"` |
| `objective` | una frase | El que el cursant sabrà fer |
| `verified_by` | list of strings | Criteris en primera persona |
| `artifacts` | list of types | `[role_list, role_persona_mapping]` |
| `skill_seeds` | list ref | `[s-vna-role-extractor]` |
| `agent_ref` | swarm agent | `"@agent_dharma_ontologist"` |
| `sops` | list ref | `[sop-entrevistar-per-rols]` |
| `effort_estimate_hours` | int | `4` |
| `mastery_levels` | object | `{beginner, intermediate, expert}` |
| `prerequisites` | list of `c-*` | `[]` |
| `unlocks` | list of `c-*` | Pròximes competències |
| `sos_context` | enum | `critical \| primary \| secondary` |
| `context_keywords` | list | Per al matching del KnowledgeLoader |
| `author` | handle | `"@alvaro"` |

### Cos del document

Quatre o cinc seccions canonical (mai duplicant frontmatter):

1. **La pregunta que aprens a respondre** — Frase d'obertura forta
2. **El criteri clau** — Distinció central (sovint en taula)
3. **Com es practica** — Passos concrets, numerats
4. **Quan el domines** — Senyal d'haver-hi arribat a cada nivell
5. *(Opcional)* **Errades típiques** — Què passa quan s'aplica malament

---

## 3. Skill-seed (`skill-seed`)

Unitat de coneixement empaquetada per a un agent IA. Carpeta `skill-seeds/`.

### Frontmatter obligatori

| Camp | Tipus | Exemple |
|---|---|---|
| `id` | `s-{slug}` | `s-vna-role-extractor` |
| `type` | literal | `skill-seed` |
| `version` | semver | `v0.1` |
| `status` | enum | `draft \| review \| approved-by-cop \| deprecated` |
| `competency_refs` | list ref | `[c-02.1-identify-vna-roles]` |
| `agent_ref` | swarm agent | `"@agent_dharma_ontologist"` |
| `input_schema` | object | JSON Schema simplificat |
| `output_schema` | object | JSON Schema simplificat |
| `context_tokens` | int | Tokens estimats que afegeix al context |
| `dependencies` | list of `s-*` | Skill-seeds prèvies |
| `sos_context` | enum | `critical \| primary \| secondary` |
| `author` | handle | `"@alvaro"` |

### Cos del document

Tres seccions canonical:

1. **Què fa** — Funció concreta de la skill, una frase
2. **Quan invocar-la** — Triggers, contextos d'ús
3. **Prompt nucli** — El prompt empaquetat que l'agent fa servir

---

## 4. SOP (`sop`)

Standard Operating Procedure validat per una CoP. Carpeta `sops/`.

### Frontmatter obligatori

| Camp | Tipus | Exemple |
|---|---|---|
| `id` | `sop-{slug}` | `sop-entrevistar-per-rols` |
| `type` | literal | `sop` |
| `version` | semver | `v0.1` |
| `status` | enum | `draft \| approved-by-cop \| deprecated` |
| `cop_ref` | ref | `cop-mapejador-vna` |
| `competency_refs` | list ref | `[c-02.1-identify-vna-roles]` |
| `applies_to` | list of dicts | Alternativa rica: `[{competency: c-02.1}, {skill_seed: s-...}]` |
| `effort_minutes` | int | `45` |
| `author` | handle | `"@alvaro"` |
| `approved_by` | list of handles | Quan `status: approved-by-cop` |

### Cos del document

Estructura clàssica de procediment: objectiu · pre-requisits · passos numerats ·
criteris d'èxit · errades a evitar.

---

## Convencions transversals

- **IDs en kebab-case ASCII** (mai amb accents ni espais)
- **Refs amb `{id}`** directa (el tipus s'infereix del context)
- **`version` segueix semver** estricte
- **`status` és l'únic flag de vida** del fitxer
- **Frontmatter sempre en YAML** entre `---`
- **Cos sempre comença amb H1** que repeteix el `name` (única excepció a "no duplicar")
- **Eines del swarm sempre amb `@`** (`@agent_dharma_ontologist`, `@alvaro`)

## Compatibilitat amb el `KnowledgeLoader`

```js
// Carregar tot el D-02 (domini + competències + skill-seeds + sops)
const ctx = await KnowledgeLoader.buildContext({
    matriu_domain: 'd02-value-mapping'
});

// Carregar només transversals
const ctx = await KnowledgeLoader.buildContext({
    matriu_mode: 'transversal'
});

// Carregar només les SOPs validades per una CoP
const ctx = await KnowledgeLoader.buildContext({
    matriu_cop: 'cop-mapejador-vna',
    status: 'approved-by-cop'
});
```

---

*Schema v0.2 · TeamTowers SOS V11 · Força · Equilibri · Valor · Seny*
