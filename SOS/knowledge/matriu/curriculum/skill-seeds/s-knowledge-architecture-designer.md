---
id: s-knowledge-architecture-designer
type: skill-seed
version: v0.1
status: draft
author: "@alvaro"

name: "Knowledge Architecture Designer"
purpose: >
  Dissenya l'arquitectura de cervell extens personal del cursant
  combinant Building a Second Brain (capes capture → organize → distill
  → express) amb la capa addicional de l'era agèntica (delegate).
  Suggereix taxonomia i eines.

competency_refs:
  - c-00.2-design-extended-brain

agent_ref: "@agent_introspection_mirror"

input_schema:
  type: object
  required:
    - current_tools
    - use_cases
  properties:
    current_tools:
      type: array
      description: "Eines que el cursant ja fa servir (Notion, Obsidian, Apple Notes, etc.)"
    use_cases:
      type: array
      description: "Tipus de coneixement que captura/organitza (recerca, projectes, lectures, idees, etc.)"
    ai_workflow:
      type: string
      description: "Com fa servir IA actualment (opcional)"

output_schema:
  type: object
  required:
    - architecture
  properties:
    architecture:
      type: object
      properties:
        capture_layer:
          type: object
          properties:
            tools: { type: array, items: { type: string } }
            workflow: { type: string }
        organize_layer:
          type: object
          properties:
            taxonomy_suggestion: { type: array, items: { type: string } }
            method: { type: string, description: "PARA, Zettelkasten, hybrid..." }
        distill_layer:
          type: object
          properties:
            triggers: { type: array, items: { type: string } }
        express_layer:
          type: object
          properties:
            formats: { type: array, items: { type: string } }
        delegate_layer:
          type: object
          properties:
            reservoir_zones: { type: array, items: { type: string } }
            biography_zones: { type: array, items: { type: string } }

context_tokens: 1600
dependencies: []

sos_context: critical
---

# Knowledge Architecture Designer

## Què fa

Dissenya el cervell extens del cursant amb 5 capes (BASB clàssiques +
delegate per a l'era agèntica). Específicament separa:

- **Reservori** — accessible per agents IA
- **Biografia** — privat, mai accessible per agents

És la skill que el cursant fa servir al C-00.2 per estructurar el seu
sistema personal de coneixement.

## Quan invocar-la

- Quan el cursant ja té sistema però vol re-dissenyar-lo
- Quan el cursant arrencat de zero i vol arquitectura inicial
- **NO** ho invoquis si no tens current_tools i use_cases definits

## Prompt nucli

```
Ets arquitecte de sistemes personals de coneixement. Dissenya un cervell
extens de 5 capes per al cursant.

LAYERS:
1. CAPTURE: on entren coses sense filtre
   - Tools concrets (no genèrics)
   - Workflow diari (rough)
2. ORGANIZE: on es classifiquen
   - Taxonomia: sugereix 10-15 categories útils per al cursant concret
   - Method: PARA, Zettelkasten, o híbrid
3. DISTILL: on es resumeix
   - Triggers: quan es decanta una nota (setmanalment? mensualment?)
4. EXPRESS: on es crea
   - Formats: articles, posts, decisions, documents
5. DELEGATE (essencial per a l'era agèntica):
   - Reservoir_zones: parts accessibles per agents (per categoria)
   - Biography_zones: parts MAI accessibles per agents (motivació
     profunda, dols, dubtes íntims)

REGLES:
- La separació reservori/biografia ha de ser **estricta**. No deixis
  ambigüitats.
- Les eines suggerides han de ser realistes i possibles d'adoptar
- La taxonomia ha de ser personal, no copiada genèrica

EINES ACTUALS: {{current_tools}}
USE CASES: {{use_cases}}
IA WORKFLOW: {{ai_workflow}}
```

## Notes

- Si el cursant té motivació profunda (C-01.5) ja escrita, aquesta va
  sempre a biography_zones, no a reservoir
- L'arquitectura no és definitiva: revisar cada 6 mesos és bona pràctica

---

*Skill-seed v0.1 · pendent validació CoP Mentor intern*
