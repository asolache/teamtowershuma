// =============================================================================
// TEAMTOWERS SOS V10 — SKILL-SEEDS.JS
// Ruta: /ia/dev/js/core/skill-seeds.js
// Seeds de skills para todos los agentes del Swarm V10.
// Se siembran en KB (IndexedDB) durante _ensureKB() si no existen (idempotente).
// REGLA: Cada objeto SIEMPRE tiene { id: '...' } — Codex V10 absoluto.
// =============================================================================

export const SKILL_SEEDS = [

    // ── SKILL VNA MAPPER (nueva — Fábrica VNA) ────────────────────
    {
        id: 'skill-vna-mapper',
        type: 'skill',
        category: 'skill',
        title: 'Value Network Analysis Mapper',
        description: 'Experto en VNA de Verna Allee. Mapea roles, flujos tangibles/intangibles y entregables. Produce VnaNetwork JSON-LD listo para automatización.',
        content: `---
name: value-network-analysis
description: >
  Experto en Value Network Analysis (VNA) según Verna Allee. Activar SIEMPRE que
  el usuario quiera mapear flujos de valor, identificar roles/transacciones,
  automatizar procesos, o mencione: mapa de valor, VNA, flujo de valor, red de valor,
  entregables tangibles/intangibles, Verna Allee, o describa un proyecto para automatizar.
  También activar para diseñar agentes verticales o fábricas de proyectos monetizables.
---
# Value Network Analysis — Metodología Verna Allee

## Los 3 primitivos
- ROLES: funciones activas (no cargos). 6-10 máximo por mapa.
- TRANSACCIONES: intercambios direccionales. Tangibles (——) / Intangibles (- - -)
- ENTREGABLES: lo que se transfiere con trigger, frecuencia y automatizabilidad

## Output obligatorio: VnaNetwork JSON-LD
{
  "@context": "https://teamtowers.io/sos/v10/vna",
  "@type": "VnaNetwork",
  "mission": "...", "vision": "...",
  "nodes": [{ "id", "label", "role", "tier", "skills", "fmv", "slices" }],
  "exchanges": [{ "id", "from", "to", "type", "category", "label", "trigger", "automatable" }]
}

## Análisis de salud (siempre incluir)
- Exchange Analysis: ¿reciprocidad? ¿flujos muertos?
- Impact Analysis: ¿cada rol puede crear valor con lo que recibe?
- Patologías: hub_unico, rol_aislado, intercambio_sin_receptor, slices_desequilibrados
- health_score: 0.0-1.0`,
        references: [],
        evals: [],
        scripts: []
    },

    // ── SKILL VNA ARCHITECT (@agent_genesis_architect) ────────────
    {
        id: 'skill_vna_architect',
        type: 'skill',
        category: 'skill',
        title: 'VNA Ecosystem Architect',
        description: 'Diseña ecosistemas VNA completos desde cero. Identifica roles, flujos y oportunidades de monetización.',
        content: `---
name: vna-ecosystem-architect
description: >
  Diseña redes de valor completas (VNA) para cualquier proyecto, empresa o ecosistema.
  Activa cuando se pida diseñar un ecosistema, definir roles de una red, mapear un negocio
  desde cero, o cuando @agent_genesis_architect sea mencionado.
---
# VNA Ecosystem Architect
Diseña la red de valor completa: roles, intercambios tangibles e intangibles,
economía de slices, puntos de automatización y modelo de monetización.
Siempre devuelve VnaNetwork JSON-LD. Siempre incluye health_score.`,
        references: ['skill-vna-mapper'],
        evals: [],
        scripts: []
    },

    // ── SKILL IKIGAI ONTOLOGIST (@agent_dharma_ontologist) ─────────
    {
        id: 'skill_ikigai_ontologist',
        type: 'skill',
        category: 'skill',
        title: 'Ikigai & Ontology Designer',
        description: 'Expande la semántica de nodos VNA. Conecta roles con propósito (ikigai), skills y arquetipos guardian.',
        content: `---
name: ikigai-ontologist
description: >
  Expande ontología de nodos VNA, conecta roles con ikigai y arquetipos.
  Activar para expandNodeSemantics, asignar guardians, enriquecer metadata de nodos,
  o cuando @agent_dharma_ontologist sea mencionado.
---
# Ikigai Ontologist
Para cada nodo VNA: define su propósito (qué ama, en qué es experto, qué el mundo necesita,
por qué le pagan). Asigna guardian arquetípico. Devuelve VnaNode enriquecido JSON-LD.`,
        references: [],
        evals: [],
        scripts: []
    },

    // ── SKILL CRAFTER MASTER (@agent_skill_crafter) ──────────────
    {
        id: 'skill_crafter_master',
        type: 'skill',
        category: 'skill',
        title: 'Skill Crafter Master',
        description: 'Crea y cura skills en formato SKILL.md con frontmatter YAML válido. Especialista en diseño de instrucciones para agentes IA.',
        content: `---
name: skill-crafter-master
description: >
  Crea skills SKILL.md con frontmatter YAML, instrucciones precisas y referencias.
  Activar para createSkill, curateSkill, mejorar descripción de skills existentes,
  o cuando @agent_skill_crafter sea mencionado.
---
# Skill Crafter Master
Estructura obligatoria:
---
name: skill-nombre-kebab-case
description: >
  [Descripción "pushy" que asegura triggering. Incluir cuándo usar, palabras clave.]
---
# Título
[Cuerpo: instrucciones, ejemplos, referencias]
Zero redundancy. DRY. Output: solo el SKILL.md completo.`,
        references: [],
        evals: [],
        scripts: []
    },

    // ── SKILL PROMPT SYNTHESIZER (@agent_prompt_synthesizer) ───────
    {
        id: 'skill_prompt_synthesizer',
        type: 'skill',
        category: 'skill',
        title: 'Agent Prompt Synthesizer',
        description: 'Diseña agentes IA verticales con system_prompt optimizado, capabilities y constraints Glass-Box.',
        content: `---
name: agent-prompt-synthesizer
description: >
  Diseña agentes IA verticales completos con SosAgent JSON-LD.
  Activar para synthesizeAgentPrompt, diseñar agentes para verticales de industria,
  crear system_prompts optimizados, o cuando @agent_prompt_synthesizer sea mencionado.
---
# Agent Prompt Synthesizer
Devuelve SosAgent JSON-LD:
{ "@type": "SosAgent", "id": "@agent_{vertical}",
  "profile": { "isAi": true, "guardian": "...", "preferredEngine": "anthropic",
               "active_skills": [], "vertical": "...",
               "system_prompt": "Prompt Glass-Box optimizado..." } }`,
        references: ['skill_crafter_master'],
        evals: [],
        scripts: []
    },

    // ── SKILL SLICING PIE NOTARY (@agent_tdd_auditor) ─────────────
    {
        id: 'skill_slicing_pie_notary',
        type: 'skill',
        category: 'skill',
        title: 'Slicing Pie Notary & TDD Auditor',
        description: 'Notariza artefactos, audita TDD, valida slices del Ledger. Detecta inconsistencias en la economía del proyecto.',
        content: `---
name: slicing-pie-notary
description: >
  Notariza artefactos SOS, audita TDD, valida Ledger Slicing Pie.
  Activar para notarizar work orders, auditar slices, detectar inconsistencias económicas,
  o cuando @agent_tdd_auditor sea mencionado.
---
# Slicing Pie Notary
Valida: slices con .toFixed(3), hash sha256 presente, tddPassed correcto.
Devuelve: { "notarized": bool, "issues": [], "corrected_slices": 0.000 }`,
        references: [],
        evals: [],
        scripts: []
    },

    // ── SKILL KNOWLEDGE HARVEST (@agent_synaptic_weaver) ──────────
    {
        id: 'skill_knowledge_harvest',
        type: 'skill',
        category: 'skill',
        title: 'Knowledge Harvest & Network Healer',
        description: 'Cosecha conocimiento de conversaciones, detecta y repara patologías en redes VNA.',
        content: `---
name: knowledge-harvest-healer
description: >
  Cosecha conocimiento de logs/conversaciones y repara redes VNA patológicas.
  Activar para autoHealNetwork, curateNetworkHealth, extraer aprendizajes de proyectos,
  o cuando @agent_synaptic_weaver sea mencionado.
---
# Knowledge Harvest & Network Healer
Patologías a detectar: hub_unico, rol_aislado, reciprocidad_rota, slices_desequilibrados.
Devuelve: { "pathologies": [], "recommendations": [], "healed_exchanges": [], "health_score": 0.0 }`,
        references: ['skill-vna-mapper'],
        evals: [],
        scripts: []
    },

    // ── SKILL ANTIFRAGILE COMPRESSOR (@agent_token_economist) ──────
    {
        id: 'skill_antifragile_compressor',
        type: 'skill',
        category: 'skill',
        title: 'Token Economist & Cost Optimizer',
        description: 'Optimiza costes de tokens IA, calcula slices, gestiona el Ledger Slicing Pie con precisión de 3 decimales.',
        content: `---
name: antifragile-compressor
description: >
  Optimiza costes de tokens, calcula slices Slicing Pie, gestiona Ledger.
  Activar para calcular costes de llamadas IA, optimizar prompts por coste,
  revisar el Ledger, o cuando @agent_token_economist sea mencionado.
---
# Token Economist
Fórmula slices: (output_tokens/1M * precio_output + input_tokens/1M * precio_input) * markup * multiplier
Precisión: SIEMPRE .toFixed(3). Precios base: anthropic {input:3.00, output:15.00} USD/1M tokens.`,
        references: [],
        evals: [],
        scripts: []
    },

    // ── SKILL UI COMPONENT FORGE (@agent_web_deployer) ────────────
    {
        id: 'skill_ui_component_forge',
        type: 'skill',
        category: 'skill',
        title: 'UI Component Forge',
        description: 'Genera Web Components W3C con Shadow DOM, tokens CSS Antigravity y eventos sos: namespace.',
        content: `---
name: ui-component-forge
description: >
  Genera Web Components SOS V10: Shadow DOM, tokens CSS var(--sos-*), eventos sos: prefix.
  Activar para crear componentes UI, vistas, layouts, o cuando @agent_web_deployer sea mencionado.
---
# UI Component Forge
Patrón obligatorio: class SosXxx extends HTMLElement, connectedCallback, _render(), _subscribe().
Tokens: var(--sos-color-primary), var(--sos-color-accent), var(--sos-space-*).
Eventos: new CustomEvent('sos:nombre', { bubbles: true, detail: {} }).
NUNCA React/Vue/Angular. NUNCA hardcodear colores.`,
        references: [],
        evals: [],
        scripts: []
    },

    // ── SKILL VAULT MONETIZATION (@agent_codex_developer) ─────────
    {
        id: 'skill_vault_monetization',
        type: 'skill',
        category: 'skill',
        title: 'Vault Monetization & API Premium',
        description: 'Diseña modelos de monetización para agentes IA, APIs premium y fábricas de proyectos. Estructura revenue → Slicing Pie.',
        content: `---
name: vault-monetization
description: >
  Diseña modelos de monetización para agentes IA y APIs premium.
  Activar para estructurar precios SaaS, calcular revenue sharing, diseñar verticales
  monetizables, o cuando @agent_codex_developer sea mencionado.
---
# Vault Monetization
Modelos: SaaS (€199-499/mes), pay-per-use (€/1K tokens), freemium con límites.
Revenue flow: Cliente → API Premium → Ledger → Slicing Pie → distribución por slices acumulados.
Devuelve: { "model": "saas|ppu|freemium", "price": 0.0, "revenue_flow": [], "slices_formula": "" }`,
        references: ['skill_antifragile_compressor'],
        evals: [],
        scripts: []
    },

    // ── SKILL PENTEST CHAOS (@kaos_tester) ───────────────────────
    {
        id: 'skill_pentest_chaos',
        type: 'skill',
        category: 'skill',
        title: 'Pentest & Chaos Engineering',
        description: 'Testea la resiliencia del sistema SOS: fuzzing de inputs, inyección de fallos, validación de edge cases.',
        content: `---
name: pentest-chaos
description: >
  Testea resiliencia del sistema SOS: fuzzing, fallos inyectados, edge cases.
  Activar para auditar seguridad, testear flujos críticos, o cuando @kaos_tester sea mencionado.
---
# Pentest & Chaos Engineering
Técnicas: fuzzing de inputs KB, inyección de fallos en Orchestrator, stress del Ledger,
overflow de slices, keys inválidas, timeouts de API.
Devuelve: { "vulnerabilities": [], "recommendations": [] }`,
        references: [],
        evals: [],
        scripts: []
    },

    // ── SKILL COMMUNITY ENGAGEMENT (@bard_narrator) ───────────────
    {
        id: 'skill_community_engagement',
        type: 'skill',
        category: 'skill',
        title: 'Community Engagement & Bard',
        description: 'Genera narrativas del ecosistema, comunica el progreso del Swarm, crea contenido para la comunidad TeamTowers.',
        content: `---
name: community-engagement
description: >
  Genera narrativas, comunica progreso del Swarm, crea contenido para la comunidad.
  Activar para redactar updates del proyecto, crear posts, narrar logros del ecosistema,
  o cuando @bard_narrator sea mencionado.
---
# Community Engagement & Bard
Tono: épico pero honesto. Valores: Força · Equilibri · Valor · Seny.
Formatos: update semanal, thread, post de lanzamiento, manifiesto.
Nunca exagerar métricas. Glass-Box storytelling.`,
        references: [],
        evals: [],
        scripts: []
    }

];

// ─── NODO CLAUDE PARA globalUsers (ADD_USER en boot) ────────────
export const CLAUDE_VNA_NODE = {
    id: 'node-claude-sonnet-v10',
    name: 'Claude Sonnet (Nodo IA V10)',
    globalRole: 'ai-agent',
    profile: {
        isAi: true,
        guardian: 'sage',
        preferredEngine: 'anthropic',
        active_skills: [
            'skill-vna-mapper',
            'skill_crafter_master',
            'skill_prompt_synthesizer',
            'skill_knowledge_harvest'
        ],
        fmv: 0.015,
        multiplier: 2.0,
        capabilities: [
            'vna_mapping',
            'skill_creation',
            'skill_curation',
            'cost_accounting',
            'agent_vertical_design',
            'autoHealNetwork',
            'pathology_detection'
        ]
    }
};

// ─── NODO CLAUDE PARA KB (VnaNode persistido) ────────────────────
export const CLAUDE_KB_NODE = {
    id: 'node-claude-sonnet-v10',
    type: 'vna-node',
    label: 'Claude Sonnet · Nodo IA Activo SOS V10',
    role: 'agent',
    tier: 0,
    identity: {
        model:    'claude-sonnet-4-20250514',
        provider: 'Anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages'
    },
    economics: {
        fmv_output:    0.015,
        fmv_input:     0.0003,
        multiplier:    2.0,
        slice_formula: '(output_tokens/1000 * fmv_output + input_tokens/1000 * fmv_input) * multiplier'
    },
    ledger_config: {
        auto_register: true,
        precision:     3
    }
};
