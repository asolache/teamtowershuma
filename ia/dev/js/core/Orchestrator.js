// ============================================================
//  ia/dev/js/core/Orchestrator.js
//  TeamTowers SOS — Sesión V10 · Sprint 1
//  Motor: anthropic/claude-sonnet-4-20250514 (primario)
//  API Key: IndexedDB via KB.js (zero localStorage)
//  Codex: SOS Antigravity Kernel V10
// ============================================================

import { store } from './store.js';
import { KB } from './kb.js';
import { SKILL_SEEDS, CLAUDE_VNA_NODE, CLAUDE_KB_NODE } from './skill-seeds.js';

// ─── PADRÓN UNIVERSAL DE AGENTES CORE ───────────────────────
const CORE_AGENTS = {
    ARCHITECT:   '@agent_genesis_architect',
    ONTOLOGIST:  '@agent_dharma_ontologist',
    CRAFTER:     '@agent_skill_crafter',
    SYNTHESIZER: '@agent_prompt_synthesizer',
    AUDITOR:     '@agent_tdd_auditor',
    WEAVER:      '@agent_synaptic_weaver',
    ECONOMIST:   '@agent_token_economist'
};

// ─── PRECIO BASE POR PROVEEDOR (USD / 1M tokens) ─────────────
const BASE_PRICING = {
    anthropic: { input: 3.00,  output: 15.00 },
    openai:    { input: 2.50,  output: 10.00 },
    deepseek:  { input: 0.14,  output: 0.28  },
    gemini:    { input: 0.075, output: 0.30  },
    custom:    { input: 0.0,   output: 0.0   }
};

// ─── MODELO PRIMARIO ─────────────────────────────────────────
const ANTHROPIC_MODEL   = 'claude-sonnet-4-20250514';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

// ─── PROXY NETLIFY (resuelve CORS del browser → Anthropic) ───
// En local (localhost) llama directo. En Netlify usa el proxy.
const ANTHROPIC_PROXY_URL = window.location.hostname === 'localhost'
    ? ANTHROPIC_API_URL
    : '/api/anthropic-proxy';

// ─── CLAVE DE PERSISTENCIA EN KB (IndexedDB) ─────────────────
const KB_KEY_PROVIDER  = 'sos_ai_provider';
const KB_KEY_ANTHROPIC = 'sos_key_anthropic';
const KB_KEY_OPENAI    = 'sos_key_openai';
const KB_KEY_DEEPSEEK  = 'sos_key_deepseek';
const KB_KEY_GEMINI    = 'sos_key_gemini';

// ─── SYSTEM PROMPTS VNA (Sprint 1) ───────────────────────────
const VNA_MAPPER_PROMPT = `Eres @agent_genesis_architect del SOS V10, experto en Value Network Analysis de Verna Allee.
Construye redes de valor completas. DEVUELVE SOLO JSON-LD válido con @context "https://teamtowers.io/sos/v10/vna" y @type "VnaNetwork".
Estructura: { "@context", "@type", "id", "mission", "vision", "nodes": [VnaNode], "exchanges": [VnaExchange], "meta": { "health_score": 0.0 } }
VnaNode: { "id", "label", "role": "agent|human|organization|resource|process", "tier": 0-3, "skills": [], "fmv": 0.0, "slices": 0.0 }
VnaExchange: { "id", "from", "to", "type": "tangible|intangible", "category": "payment|deliverable|resource|service|knowledge|trust|feedback|collaboration", "label", "trigger", "frequency": "once|recurring|on-demand", "automatable": true|false }
Máximo 10 roles. Incluir health_score 0.0-1.0. Zero hallucinations.`;

const SKILL_CRAFTER_PROMPT = `Eres @agent_skill_crafter del SOS V10. Creas skills en formato SKILL.md.
Estructura OBLIGATORIA:
---
name: skill-nombre-kebab-case
description: >
  [Descripción "pushy" y específica con palabras clave para triggering]
---
# Título de la Skill
[Instrucciones precisas. Ejemplos. Referencias si aplica.]
Devuelve SOLO el contenido del SKILL.md. Sin explicaciones adicionales. Zero redundancy.`;

const AGENT_DESIGNER_PROMPT = `Eres @agent_prompt_synthesizer del SOS V10. Diseñas agentes IA verticales Glass-Box.
Devuelve EXACTAMENTE este JSON:
{ "@type": "SosAgent", "id": "@agent_{vertical}_{role}", "name": "Nombre legible",
  "globalRole": "ai-agent",
  "profile": { "isAi": true, "guardian": "{arquetipo: sage|magician|hero|ruler|caregiver|explorer|jester|outlaw|creator}",
    "preferredEngine": "anthropic", "active_skills": ["skill-ids"],
    "vertical": "{sector}", "system_prompt": "Prompt completo Glass-Box para este agente..." } }
El system_prompt debe: definir el rol con precisión, listar capacidades concretas, especificar formato de output (JSON-LD cuando aplique), incluir restricciones Glass-Box.`;

const NETWORK_HEALER_PROMPT = `Eres @agent_synaptic_weaver del SOS V10. Detectas y reparas patologías VNA.
Devuelve SOLO JSON:
{ "pathologies": [{ "type": "hub_unico|rol_aislado|reciprocidad_rota|flujo_sin_receptor|slices_desequilibrados", "affected": [], "severity": "critical|warning|info" }],
  "recommendations": [{ "action": "", "priority": "high|medium|low" }],
  "healed_exchanges": [VnaExchange],
  "health_score": 0.0 }`;

// ═════════════════════════════════════════════════════════════
//  OrchestratorCore — Clase principal
// ═════════════════════════════════════════════════════════════
class OrchestratorCore {

    constructor() {
        this.version     = 'V10.1-Antigravity-Sprint1';
        this.isListening = false;
        this._kbReady    = false;
    }

    // ──────────────────────────────────────────────────────────
    //  BOOT: inicializa KB, siembra SKILL_SEEDS y registra Claude
    //  Idempotente — seguro llamar múltiples veces
    // ──────────────────────────────────────────────────────────
    async _ensureKB() {
        if (this._kbReady) return;

        await KB.init();
        this._kbReady = true;

        // ── Sembrar skills del Swarm si no existen ────────────
        for (const seed of SKILL_SEEDS) {
            const existing = await KB.getNode(seed.id);
            if (!existing) {
                await KB.saveNode(seed);
                console.log(`[V10·KB] 🌱 Skill sembrada: ${seed.id}`);
            }
        }

        // ── Registrar nodo Claude en KB si no existe ──────────
        const claudeKB = await KB.getNode(CLAUDE_KB_NODE.id);
        if (!claudeKB) {
            await KB.saveNode(CLAUDE_KB_NODE);
            console.log('[V10·KB] 🤖 Claude VNA Node registrado en KB.');
        }

        // ── Registrar Claude en globalUsers si no existe ──────
        const state = store.getState();
        if (!state.globalUsers?.find(u => u.id === CLAUDE_VNA_NODE.id)) {
            await store.dispatch({ type: 'ADD_USER', payload: CLAUDE_VNA_NODE });
            console.log('[V10·Store] 🤖 Claude añadido a globalUsers.');
        }
    }

    // ──────────────────────────────────────────────────────────
    //  PROVEEDORES: lee claves de IndexedDB (Zero localStorage)
    // ──────────────────────────────────────────────────────────
    async _getAvailableProviders(overrideEngine = null) {
        await this._ensureKB();

        const globalEngine     = (await KB.getNode(KB_KEY_PROVIDER))?.value || 'anthropic';
        const actualPreference = overrideEngine || globalEngine;

        const fallbackChain = [actualPreference, globalEngine, 'anthropic', 'openai', 'deepseek', 'gemini', 'custom'];
        const uniqueChain   = [...new Set(fallbackChain)];
        const available     = [];

        for (const provider of uniqueChain) {
            if (provider === 'custom') {
                available.push({ provider: 'custom', apiKey: 'local_or_custom_mode' });
                continue;
            }
            const kbKey  = this._kbKeyForProvider(provider);
            const record = await KB.getNode(kbKey);
            const apiKey = record?.value?.trim();
            if (apiKey && apiKey.length > 10) {
                available.push({ provider, apiKey });
            }
        }

        if (available.length === 0) {
            throw new Error('[KERNEL PANIC] No hay API Key configurada en KB. Usa SettingsVault para añadir credenciales.');
        }
        return available;
    }

    // ──────────────────────────────────────────────────────────
    //  UTIL: mapeo provider → clave KB
    // ──────────────────────────────────────────────────────────
    _kbKeyForProvider(provider) {
        const map = {
            anthropic: KB_KEY_ANTHROPIC,
            openai:    KB_KEY_OPENAI,
            deepseek:  KB_KEY_DEEPSEEK,
            gemini:    KB_KEY_GEMINI
        };
        return map[provider] || `sos_key_${provider}`;
    }

    // ──────────────────────────────────────────────────────────
    //  SKILL SYNC: sube Skills de KB al workspace Anthropic
    // ──────────────────────────────────────────────────────────
    async _syncAnthropicSkill(skillId, apiKey) {
        await this._ensureKB();
        const skillNode = await KB.getNode(skillId);
        if (!skillNode || (skillNode.category !== 'skill' && skillNode.type !== 'skill')) return null;

        if (skillNode.anthropic_skill_id) {
            return { id: skillNode.anthropic_skill_id, version: skillNode.anthropic_version || 'latest' };
        }

        console.log(`[V10·Antigravity] 🚀 Subiendo Skill '${skillNode.title}' al workspace Anthropic...`);

        const safeDir   = `skill_${skillNode.id.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().substring(0, 20)}`;
        const safeTitle = (skillNode.title || 'Skill Antigravity').substring(0, 60);
        const cleanDesc = (skillNode.description || 'SOP de ejecución SOS').replace(/\n/g, ' ').substring(0, 1000);
        const frontmatter = `---\nname: ${safeDir}\ndescription: ${cleanDesc}\n---\n\n`;
        const mainContent = `${frontmatter}# ${skillNode.title}\n\n${skillNode.content || ''}`;

        const formData = new FormData();
        formData.append('display_title', safeTitle);
        formData.append('files[]', new Blob([mainContent], { type: 'text/markdown' }), `${safeDir}/SKILL.md`);

        const appendChildren = async (ids, folder) => {
            if (!Array.isArray(ids)) return;
            for (const cId of ids) {
                const cNode = await KB.getNode(cId);
                if (!cNode) continue;
                const ext  = cNode.type === 'script' ? 'py' : cNode.type === 'eval' ? 'json' : 'md';
                const name = (cNode.title || cId).replace(/[^a-zA-Z0-9-]/g, '_').toLowerCase();
                formData.append('files[]', new Blob([cNode.content], { type: 'text/plain' }), `${safeDir}/${folder}/${name}.${ext}`);
            }
        };

        await appendChildren(skillNode.references, 'references');
        await appendChildren(skillNode.evals,      'evals');
        await appendChildren(skillNode.scripts,    'scripts');

        try {
            const response = await fetch('https://api.anthropic.com/v1/skills', {
                method: 'POST',
                headers: {
                    'x-api-key':                          apiKey,
                    'anthropic-version':                   ANTHROPIC_VERSION,
                    'anthropic-beta':                      'skills-2025-10-02,files-api-2025-04-14',
                    'anthropic-dangerously-allow-browser': 'true'
                },
                body: formData
            });

            if (!response.ok) throw new Error(await response.text());

            const data = await response.json();
            skillNode.anthropic_skill_id = data.id;
            skillNode.anthropic_version  = data.latest_version;
            await KB.saveNode(skillNode);

            console.log(`[V10·Antigravity] ✅ Skill sellada: ${data.id}`);
            return { id: data.id, version: data.latest_version };

        } catch (err) {
            console.error('[Anthropic Skill Sync Failed]:', err);
            return null;
        }
    }

    // ══════════════════════════════════════════════════════════
    //  callLLM — Motor central multi-proveedor
    //  Motor primario: anthropic/claude-sonnet-4-20250514
    //  Fallback chain leída de KB (IndexedDB)
    // ══════════════════════════════════════════════════════════
    async callLLM({
        preferredEngine = 'anthropic',
        systemPrompt,
        userPrompt,
        responseFormat = 'json_object',
        temperature    = 0.2,
        mcpSkills      = []
    }) {
        const providers = await this._getAvailableProviders(preferredEngine);
        let lastError   = null;

        for (const { provider, apiKey } of providers) {
            let attempt = 0;
            const maxRetries = 1;

            while (attempt <= maxRetries) {
                try {
                    const startTime  = Date.now();
                    let textResponse = '';
                    let tokenUsage   = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

                    // ── ANTHROPIC (motor primario) ──────────────────────────
                    if (provider === 'anthropic') {
                        const jsonSuffix = responseFormat === 'json_object'
                            ? '\n\nDEBES RESPONDER ÚNICAMENTE CON UN OBJETO JSON VÁLIDO. NO USES BLOQUES MARKDOWN NI TEXTO ADICIONAL.'
                            : '';

                        // Body para el proxy: apiKey + _meta + payload Anthropic
                        const requestBody = {
                            apiKey,                          // proxy lo extrae, pone en x-api-key
                            _anthropicVersion: ANTHROPIC_VERSION,
                            model:       ANTHROPIC_MODEL,
                            max_tokens:  4096,
                            temperature,
                            system:      systemPrompt + jsonSuffix,
                            messages:    [{ role: 'user', content: userPrompt }]
                        };

                        if (mcpSkills.length > 0) {
                            const mappedSkills = [];
                            for (const sId of mcpSkills) {
                                const synced = await this._syncAnthropicSkill(sId, apiKey);
                                if (synced) {
                                    mappedSkills.push({ type: 'custom', skill_id: synced.id, version: synced.version });
                                }
                            }
                            if (mappedSkills.length > 0) {
                                requestBody.container      = { skills: mappedSkills };
                                requestBody.tools          = [{ type: 'code_execution_20250825', name: 'code_execution' }];
                                requestBody._anthropicBeta = 'code-execution-2025-08-25,skills-2025-10-02,files-api-2025-04-14';
                            }
                        }

                        // ANTHROPIC_PROXY_URL → /api/anthropic-proxy en Netlify
                        // evita CORS; en localhost apunta directo a api.anthropic.com
                        const response = await fetch(ANTHROPIC_PROXY_URL, {
                            method:  'POST',
                            headers: { 'content-type': 'application/json' },
                            body:    JSON.stringify(requestBody)
                        });

                        if (!response.ok) throw new Error(`[HTTP ${response.status}] ${await response.text()}`);

                        const data = await response.json();

                        const execBlock = data.content.find(c => c.type === 'tool_use' && c.name === 'code_execution');
                        if (execBlock) {
                            textResponse = JSON.stringify({
                                message:       'Operación ejecutada en VM Anthropic.',
                                skillsUsed:    mcpSkills,
                                executionId:   execBlock.id,
                                outputPreview: execBlock.input?.code?.substring(0, 200) || ''
                            });
                        } else {
                            textResponse = data.content
                                .filter(c => c.type === 'text')
                                .map(c => c.text)
                                .join('');
                        }

                        if (data.usage) {
                            tokenUsage = {
                                prompt_tokens:     data.usage.input_tokens                              || 0,
                                completion_tokens: data.usage.output_tokens                             || 0,
                                total_tokens:      (data.usage.input_tokens + data.usage.output_tokens) || 0
                            };
                        }
                    }

                    // ── OPENAI ──────────────────────────────────────────────
                    else if (provider === 'openai') {
                        const messages = [
                            { role: 'system', content: systemPrompt },
                            { role: 'user',   content: userPrompt  }
                        ];
                        const body = { model: 'gpt-4o', temperature, max_tokens: 8192, messages };
                        if (responseFormat === 'json_object') body.response_format = { type: 'json_object' };

                        const response = await fetch('https://api.openai.com/v1/chat/completions', {
                            method:  'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
                            body:    JSON.stringify(body)
                        });
                        if (!response.ok) throw new Error(`[HTTP ${response.status}] ${await response.text()}`);

                        const data   = await response.json();
                        textResponse = data.choices?.[0]?.message?.content || '';
                        if (data.usage) {
                            tokenUsage = {
                                prompt_tokens:     data.usage.prompt_tokens     || 0,
                                completion_tokens: data.usage.completion_tokens || 0,
                                total_tokens:      data.usage.total_tokens      || 0
                            };
                        }
                    }

                    // ── DEEPSEEK ────────────────────────────────────────────
                    else if (provider === 'deepseek') {
                        const messages = [
                            { role: 'system', content: systemPrompt },
                            { role: 'user',   content: userPrompt  }
                        ];
                        const body = { model: 'deepseek-chat', temperature, max_tokens: 8192, messages };
                        if (responseFormat === 'json_object') body.response_format = { type: 'json_object' };

                        const response = await fetch('https://api.deepseek.com/chat/completions', {
                            method:  'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
                            body:    JSON.stringify(body)
                        });
                        if (!response.ok) throw new Error(`[HTTP ${response.status}] ${await response.text()}`);

                        const data   = await response.json();
                        textResponse = data.choices?.[0]?.message?.content || '';
                        if (data.usage) {
                            tokenUsage = {
                                prompt_tokens:     data.usage.prompt_tokens     || 0,
                                completion_tokens: data.usage.completion_tokens || 0,
                                total_tokens:      data.usage.total_tokens      || 0
                            };
                        }
                    }

                    // ── GEMINI ──────────────────────────────────────────────
                    else if (provider === 'gemini') {
                        const mimeType = responseFormat === 'json_object' ? 'application/json' : 'text/plain';
                        const url      = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                        const response = await fetch(url, {
                            method:  'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body:    JSON.stringify({
                                contents: [{ parts: [{ text: `${systemPrompt}\n\nINPUT:\n${userPrompt}` }] }],
                                generationConfig: { temperature, maxOutputTokens: 8192, responseMimeType: mimeType }
                            })
                        });
                        if (!response.ok) throw new Error(`[HTTP ${response.status}] ${await response.text()}`);

                        const data = await response.json();
                        if (!data.candidates?.length) throw new Error('Respuesta vacía de Gemini.');
                        textResponse = data.candidates[0].content.parts[0].text;
                        if (data.usageMetadata) {
                            tokenUsage.prompt_tokens     = data.usageMetadata.promptTokenCount     || 0;
                            tokenUsage.completion_tokens = data.usageMetadata.candidatesTokenCount || 0;
                            tokenUsage.total_tokens      = tokenUsage.prompt_tokens + tokenUsage.completion_tokens;
                        }
                    }

                    // ── CUSTOM / LOCAL ──────────────────────────────────────
                    else if (provider === 'custom') {
                        const ollamaUrl = 'http://localhost:11434/api/chat';
                        const response  = await fetch(ollamaUrl, {
                            method:  'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body:    JSON.stringify({
                                model:    'llama3',
                                stream:   false,
                                messages: [
                                    { role: 'system', content: systemPrompt },
                                    { role: 'user',   content: userPrompt  }
                                ]
                            })
                        });
                        if (!response.ok) throw new Error(`[Custom/Ollama HTTP ${response.status}]`);
                        const data   = await response.json();
                        textResponse = data.message?.content || '';
                    }

                    // ── PARSE CONTENT ───────────────────────────────────────
                    let parsedContent = textResponse;
                    if (responseFormat === 'json_object') {
                        try {
                            const clean = textResponse
                                .replace(/^```json\s*/i, '')
                                .replace(/^```\s*/i, '')
                                .replace(/```\s*$/i, '')
                                .trim();
                            parsedContent = JSON.parse(clean);
                        } catch (parseErr) {
                            console.warn(`[V10·Orchestrator] JSON parse fallback en ${provider}:`, parseErr.message);
                            parsedContent = { raw: textResponse, parseError: true };
                        }
                    }

                    const latencyMs = Date.now() - startTime;
                    return {
                        content:   parsedContent,
                        telemetry: {
                            provider,
                            model:     provider === 'anthropic' ? ANTHROPIC_MODEL : provider,
                            tokens:    tokenUsage,
                            latencyMs
                        }
                    };

                } catch (err) {
                    lastError = err;
                    console.warn(`[V10·Orchestrator] ⚠️ Fallo en ${provider} (intento ${attempt + 1}):`, err.message);
                    attempt++;
                }
            }
        }

        throw new Error(`[V10·Orchestrator] Todos los proveedores fallaron. Último error: ${lastError?.message}`);
    }

    // ══════════════════════════════════════════════════════════
    //  dispatch — Router de rutinas del Swarm
    // ══════════════════════════════════════════════════════════
    async dispatch({ routine, agent, context = {}, constraints = {} }) {
        const {
            strictJSON = true,
            engine     = 'anthropic',
            mcpSkills  = []
        } = constraints;

        await this._ensureKB();

        const promptNode = await KB.getNode(`prompt_global_${agent.replace('@', '')}`);
        const agentSOP   = promptNode?.content || `Eres ${agent}, agente del Swarm SOS V10. Opera con precisión y Glass-Box.`;

        const systemPrompt = `${agentSOP}

RUTINA ACTIVA: ${routine}
VERSIÓN KERNEL: V10 Antigravity

${strictJSON ? 'RESPONDE SIEMPRE CON UN ÚNICO JSON-LD VÁLIDO siguiendo el schema SosArtifact V10.' : ''}`;

        const userPrompt = `CONTEXTO DE LA RUTINA:
${JSON.stringify(context, null, 2)}

Ejecuta la rutina "${routine}" y devuelve el artefacto correspondiente.`;

        const response = await this.callLLM({
            preferredEngine: engine,
            systemPrompt,
            userPrompt,
            responseFormat:  strictJSON ? 'json_object' : 'text',
            temperature:     0.2,
            mcpSkills
        });

        const payload  = response.content;
        const artifact = {
            '@context':   'https://teamtowers.io/sos/v10',
            '@type':      'SosArtifact',
            artifactType: 'routine_output',
            agentId:      agent,
            routine,
            timestamp:    new Date().toISOString(),
            payload:      payload?.payload || payload,
            telemetry:    response.telemetry,
            audit: {
                tddPassed: false,
                notarized: false,
                hash:      `sha256:${Date.now().toString(16)}`
            }
        };

        if (context.projectId) {
            this._logTelemetry(context.projectId, agent, response.telemetry.provider, routine, response.telemetry);
        }

        return artifact;
    }

    // ══════════════════════════════════════════════════════════
    //  designVnaMap — Genera mapa VNA completo de un proyecto
    // ══════════════════════════════════════════════════════════
    async designVnaMap({ projectId, description, domain = 'auto' }) {
        const artifact = await this.dispatch({
            routine:     'designEcosystemVNA',
            agent:       CORE_AGENTS.ARCHITECT,
            context:     { projectId, description, domain },
            constraints: {
                strictJSON: true,
                engine:     'anthropic',
                mcpSkills:  ['skill-vna-mapper', 'skill_vna_architect']
            }
        });

        const network = artifact.payload;
        if (!network?.nodes) return artifact;

        for (const node of (network.nodes || [])) {
            await store.dispatch({ type: 'VNA_NODE_ADD', payload: { projectId, node } });
        }
        for (const exchange of (network.exchanges || [])) {
            await store.dispatch({ type: 'VNA_EXCHANGE_REGISTER', payload: { projectId, exchange } });
        }

        await KB.saveNode({
            id:        `vna-network-${projectId}`,
            type:      'vna-network',
            projectId,
            ...network
        });

        return artifact;
    }

    // ══════════════════════════════════════════════════════════
    //  createSkillFromVna — Crea skill SKILL.md desde nodo VNA
    // ══════════════════════════════════════════════════════════
    async createSkillFromVna({ projectId, skillName, skillContext, roleName }) {
        const artifact = await this.dispatch({
            routine:     'createSkill',
            agent:       CORE_AGENTS.CRAFTER,
            context:     { skillName, roleName, skillContext, projectId },
            constraints: { strictJSON: false, engine: 'anthropic', mcpSkills: ['skill_crafter_master'] }
        });

        const skillContent = typeof artifact.payload === 'string'
            ? artifact.payload
            : artifact.payload?.content || JSON.stringify(artifact.payload);

        const kbKey     = `skill-${skillName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()}-${Date.now()}`;
        const skillNode = {
            id:          kbKey,
            type:        'skill',
            category:    'skill',
            title:       roleName || skillName,
            description: `Skill generada desde VNA para el rol: ${roleName}`,
            content:     skillContent,
            projectId,
            references:  [],
            evals:       [],
            scripts:     []
        };

        await KB.saveNode(skillNode);

        const slices = Number(((artifact.telemetry?.tokens?.completion_tokens || 0) / 1000 * 0.015 * 2.0).toFixed(3));
        await store.dispatch({
            type:    'SKILL_CREATED',
            payload: {
                projectId,
                skillId:       kbKey,
                skillName,
                kbKey,
                createdBy:     'node-claude-sonnet-v10',
                slicesCharged: slices
            }
        });

        return artifact;
    }

    // ══════════════════════════════════════════════════════════
    //  designVerticalAgent — Fabrica un agente IA para un vertical
    // ══════════════════════════════════════════════════════════
    async designVerticalAgent({ projectId, vertical, sector, useCases = [] }) {
        const artifact = await this.dispatch({
            routine:     'synthesizeAgentPrompt',
            agent:       CORE_AGENTS.SYNTHESIZER,
            context:     { vertical, sector, useCases, projectId },
            constraints: { strictJSON: true, engine: 'anthropic', mcpSkills: ['skill_prompt_synthesizer'] }
        });

        const agentDef = artifact.payload;
        if (!agentDef?.id) return artifact;

        const kbKey = `agent-vertical-${vertical.toLowerCase()}-${Date.now()}`;
        await KB.saveNode({ id: kbKey, type: 'agent-vertical', projectId, vertical, sector, ...agentDef });

        await store.dispatch({
            type:    'ADD_USER',
            payload: {
                id:         agentDef.id,
                name:       agentDef.name || `${vertical} Agent`,
                globalRole: 'ai-agent',
                profile:    agentDef.profile || { isAi: true, preferredEngine: 'anthropic', active_skills: [] }
            }
        });

        return artifact;
    }

    // ══════════════════════════════════════════════════════════
    //  curateNetworkHealth — Detecta y repara patologías VNA
    // ══════════════════════════════════════════════════════════
    async curateNetworkHealth({ projectId }) {
        const state   = store.getState();
        const project = state.projects?.find(p => p.id === projectId);
        if (!project) return null;

        const networkContext = {
            nodes:     project.vna_nodes     || [],
            exchanges: project.vna_exchanges || [],
            ledger:    project.ledger        || [],
            projectId
        };

        const artifact = await this.dispatch({
            routine:     'autoHealNetwork',
            agent:       CORE_AGENTS.WEAVER,
            context:     networkContext,
            constraints: { strictJSON: true, engine: 'anthropic', mcpSkills: ['skill_knowledge_harvest'] }
        });

        const result = artifact.payload;

        for (const exchange of (result?.healed_exchanges || [])) {
            await store.dispatch({ type: 'VNA_EXCHANGE_REGISTER', payload: { projectId, exchange } });
        }

        if (result?.pathologies?.some(p => p.severity === 'critical')) {
            await this.autoHealNetwork({
                projectId,
                task:       { id: `heal-${Date.now()}`, assigneeId: CORE_AGENTS.WEAVER },
                failedSocs: result.pathologies.map(p => p.type)
            });
        }

        return artifact;
    }

    // ══════════════════════════════════════════════════════════
    //  Usenet Daemon — Escucha menciones a agentes IA en logs
    // ══════════════════════════════════════════════════════════
    initUsenetDaemon() {
        if (this.isListening) return;
        this.isListening = true;

        store.subscribe(async (state) => {
            if (!state.projects?.length) return;
            for (const project of state.projects) {
                if (!project.logs) continue;
                for (const log of project.logs) {
                    if (!log.mentions?.length) continue;
                    for (const mentionId of log.mentions) {
                        const alreadyRead = log.readBy?.includes(mentionId);
                        if (alreadyRead) continue;
                        const targetNode = state.globalUsers?.find(u => u.id === mentionId);
                        if (targetNode?.profile?.isAi) {
                            store.dispatch({
                                type:    'MARK_LOG_READ',
                                payload: { projectId: project.id, logId: log.id, userId: targetNode.id }
                            });
                            await this.autoRespondUsenet(project, log, targetNode);
                        }
                    }
                }
            }
        });
    }

    // ──────────────────────────────────────────────────────────
    //  autoRespondUsenet — Respuesta automática de agente IA
    // ──────────────────────────────────────────────────────────
    async autoRespondUsenet(project, log, agentNode) {
        try {
            await this._ensureKB();
            const promptNode = await KB.getNode(`prompt_global_${agentNode.id.replace('@', '')}`);
            const agentSOP   = promptNode?.content || `Eres ${agentNode.id}, agente del Swarm SOS V10.`;

            const systemPrompt = `${agentSOP}

Eres un agente Glass-Box del SOS V10 respondiendo en el Usenet del proyecto "${project.name || project.id}".
Sé conciso, técnico y útil. Usa markdown básico si es necesario.
NO inventes datos del proyecto que no estén en el contexto.`;

            const userPrompt = `Mensaje recibido en el Usenet del proyecto:
"${log.content}"

Contexto del proyecto (últimos 5 logs):
${JSON.stringify((project.logs || []).slice(-5), null, 2)}

Responde como ${agentNode.id} al mensaje anterior.`;

            const engine   = agentNode.profile?.preferredEngine || 'anthropic';
            const response = await this.callLLM({
                preferredEngine: engine,
                systemPrompt,
                userPrompt,
                responseFormat:  'text',
                temperature:     0.4
            });

            const responseText = typeof response.content === 'string'
                ? response.content
                : JSON.stringify(response.content);

            await store.dispatch({
                type:    'ADD_LOG_ENTRY',
                payload: {
                    projectId: project.id,
                    log: {
                        id:       `log_auto_${Date.now()}`,
                        date:     Date.now(),
                        authorId: agentNode.id,
                        content:  `🤖 **${agentNode.name || agentNode.id}:** ${responseText}`,
                        mentions: [],
                        readBy:   []
                    }
                }
            });

            this._logTelemetry(project.id, agentNode.id, response.telemetry.provider, 'USENET_AUTO_RESPOND', response.telemetry);

        } catch (err) {
            console.warn(`[V10·Orchestrator] ⚠️ autoRespondUsenet falló para ${agentNode.id}:`, err.message);
        }
    }

    // ══════════════════════════════════════════════════════════
    //  Auto-Sanación de red — activa cuando falla TDD notarial
    // ══════════════════════════════════════════════════════════
    async autoHealNetwork({ projectId, task, failedSocs }) {
        try {
            const state    = store.getState();
            const allNodes = state.globalUsers || [];
            const aiNodes  = allNodes.filter(u => u.profile?.isAi && u.id !== CORE_AGENTS.SYNTHESIZER);

            const systemPrompt = `Eres el ${CORE_AGENTS.SYNTHESIZER}, Córtex Integrador del Swarm SOS V10.
Una tarea ha fallado la auditoría notarial. Debes asignar un agente reparador.
Responde SOLO con JSON: { "assignedNode": "@agent_id", "reason": "...", "actionPlan": "..." }`;

            const userPrompt = `TAREA FALLIDA:
${JSON.stringify(task, null, 2)}

SOCs FALLIDOS: ${failedSocs.join(', ')}

AGENTES DISPONIBLES:
${aiNodes.map(a => `- ${a.id} (${a.profile?.preferredEngine || 'anthropic'})`).join('\n')}

¿A qué nodo invocamos?`;

            const response = await this.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt,
                userPrompt,
                responseFormat:  'json_object',
                temperature:     0.1
            });

            const result = response.content;
            if (!result.assignedNode) return null;

            const contentLog = `⚕️ **Protocolo de Auto-Sanación Activado.**
La auditoría Notarial falló en: *${failedSocs.join(', ')}*.

${CORE_AGENTS.SYNTHESIZER} solicita asistencia de <a href="/ia/dev/profile?id=${result.assignedNode.replace('@', '')}" data-link class="mention-highlight">${result.assignedNode}</a>.

**Motivo:** ${result.reason}
**Plan:** ${result.actionPlan}`;

            await store.dispatch({
                type:    'ADD_LOG_ENTRY',
                payload: {
                    projectId,
                    log: {
                        id:            `log_heal_${Date.now()}`,
                        date:          Date.now(),
                        authorId:      CORE_AGENTS.SYNTHESIZER,
                        relatedTxHash: task.hash || task.id,
                        content:       contentLog,
                        mentions:      [result.assignedNode, task.assigneeId],
                        readBy:        []
                    }
                }
            });

            this._logTelemetry(projectId, CORE_AGENTS.SYNTHESIZER, response.telemetry.provider, 'AUTO_HEAL', response.telemetry);
            return result;

        } catch (err) {
            console.warn('[V10·Orchestrator] ⚠️ Fallo en Auto-Sanación:', err.message);
            return null;
        }
    }

    // ══════════════════════════════════════════════════════════
    //  Telemetría — registra coste y tokens + alimenta Ledger
    // ══════════════════════════════════════════════════════════
    _logTelemetry(projectId, agentId, engine, actionType, telemetryData) {
        if (!telemetryData) return;

        const state       = store.getState();
        const ecoConfig   = state.config?.economics || { markup_margin: 0.0, premium_features_fee: 0.0 };
        const priceMatrix = BASE_PRICING[engine] || { input: 0, output: 0 };

        const baseCost = (
            (telemetryData.tokens.prompt_tokens     / 1_000_000) * priceMatrix.input +
            (telemetryData.tokens.completion_tokens / 1_000_000) * priceMatrix.output
        );
        const finalCost = baseCost * (1 + (ecoConfig.markup_margin || 0) + (ecoConfig.premium_features_fee || 0));

        // ── Telemetría existente (no tocar) ───────────────────
        store.dispatch({
            type:    'LOG_TELEMETRY',
            payload: {
                projectId,
                agentId,
                engine,
                actionType,
                tokens:        telemetryData.tokens,
                costInDollars: finalCost,
                recRatio:      0,
                latencyMs:     telemetryData.latencyMs
            }
        });

        // ── NUEVO V10: alimentar Ledger Slicing Pie ───────────
        if (projectId) {
            store.dispatch({
                type:    'LEDGER_AI_COST',
                payload: {
                    projectId,
                    agentId,
                    engine,
                    routine:       actionType,
                    input_tokens:  telemetryData.tokens.prompt_tokens     || 0,
                    output_tokens: telemetryData.tokens.completion_tokens || 0,
                    latencyMs:     telemetryData.latencyMs                || 0,
                    multiplier:    2.0
                }
            });
        }
    }

    // ══════════════════════════════════════════════════════════
    //  API de Settings — guardar/leer claves desde KB
    // ══════════════════════════════════════════════════════════
    async saveApiKey(provider, apiKey) {
        await this._ensureKB();
        const kbKey = this._kbKeyForProvider(provider);
        await KB.saveNode({ id: kbKey, type: 'config', value: apiKey.trim() });
        console.log(`[V10·Orchestrator] 🔑 API Key de ${provider} guardada en KB (IndexedDB).`);
    }

    async getApiKey(provider) {
        await this._ensureKB();
        const record = await KB.getNode(this._kbKeyForProvider(provider));
        return record?.value || null;
    }

    async setDefaultProvider(provider) {
        await this._ensureKB();
        await KB.saveNode({ id: KB_KEY_PROVIDER, type: 'config', value: provider });
    }

    async getDefaultProvider() {
        await this._ensureKB();
        const record = await KB.getNode(KB_KEY_PROVIDER);
        return record?.value || 'anthropic';
    }

    // ══════════════════════════════════════════════════════════════
    //  CLUSTERING V10.2 — Orquestadores como centros de gravedad
    //  Cada orquestador gestiona un enjambre de agentes.
    //  Cuando un orquestador tiene > MAX_SWARM_SIZE agentes, se bifurca.
    // ══════════════════════════════════════════════════════════════

    static MAX_SWARM_SIZE = 6;

    // ── getClusterMap — devuelve el mapa de clusters activos ─────
    // Retorna: { orchestratorId: { orchestrator, agents: [], load: N } }
    async getClusterMap() {
        const state = store.getState();
        const allUsers = state.globalUsers || [];

        // Orquestadores = agentes IA con role 'orchestrator' o id que contiene 'orchestrator'
        const orchestrators = allUsers.filter(u =>
            u.profile?.isAi && (
                u.profile?.role === 'orchestrator' ||
                u.globalRole === 'orchestrator' ||
                u.id.includes('orchestrator') ||
                u.id.includes('synthesizer') ||    // @agent_prompt_synthesizer actúa como orquestador
                u.id.includes('architect')         // @agent_genesis_architect actúa como orquestador
            )
        );

        // Si no hay orquestadores definidos, el Orchestrator principal es el único cluster
        if (!orchestrators.length) {
            const mainOrch = { id: 'node-claude-sonnet-v10', name: 'Claude Sonnet V10', profile: { isAi: true, role: 'orchestrator' } };
            orchestrators.push(
                allUsers.find(u => u.id === 'node-claude-sonnet-v10') || mainOrch,
                allUsers.find(u => u.id === '@agent_prompt_synthesizer'),
                allUsers.find(u => u.id === '@agent_genesis_architect'),
            );
        }

        const clusters = {};
        const agents   = allUsers.filter(u => u.profile?.isAi && !orchestrators.find(o => o?.id === u.id));

        // Distribuir agentes en clusters por afinidad de arquetipo
        orchestrators.filter(Boolean).forEach((orch, i) => {
            clusters[orch.id] = { orchestrator: orch, agents: [], load: 0 };
        });

        // Asignar cada agente al orquestador más afín (por arquetipo o índice)
        const orchIds = Object.keys(clusters);
        agents.forEach((agent, i) => {
            const orchId = orchIds[i % orchIds.length];
            if (clusters[orchId]) {
                clusters[orchId].agents.push(agent);
                clusters[orchId].load += agent.profile?.active_skills?.length || 0;
            }
        });

        return clusters;
    }

    // ── forkCluster — bifurca un orquestador sobrecargado ────────
    async forkCluster(orchestratorId, projectId) {
        const clusters = await this.getClusterMap();
        const cluster  = clusters[orchestratorId];
        if (!cluster) throw new Error(`Cluster ${orchestratorId} no encontrado`);
        if (cluster.agents.length <= OrchestratorCore.MAX_SWARM_SIZE) return null;

        // Crear nuevo orquestador hijo
        const forkId   = `@orchestrator_fork_${Date.now()}`;
        const halfSize = Math.floor(cluster.agents.length / 2);
        const forkedAgents = cluster.agents.splice(halfSize);

        const forkNode = {
            id: forkId, name: `Orchestrator Fork #${Object.keys(clusters).length}`,
            globalRole: 'orchestrator',
            profile: {
                isAi: true, role: 'orchestrator',
                preferredEngine: 'anthropic', version: 'v10',
                parentOrchestrator: orchestratorId,
                assignedAgents: forkedAgents.map(a => a.id),
                maturity: 'draft', archetype_mesh: {}
            }
        };

        await store.dispatch({ type: 'ADD_USER', payload: forkNode });

        // Registrar el fork en KB
        await this._ensureKB();
        await KB.saveNode({
            id:       `cluster_${forkId}`,
            type:     'cluster',
            category: 'orchestration',
            orchestratorId: forkId,
            parentId: orchestratorId,
            agentIds: forkedAgents.map(a => a.id),
            projectId,
            createdAt: Date.now()
        });

        return { forkId, forkNode, forkedAgents };
    }

    // ── getClusterHealth — métricas de salud del enjambre ────────
    async getClusterHealth(projectId) {
        const clusters = await this.getClusterMap();
        const state    = store.getState();
        const project  = state.projects?.find(p => p.id === projectId);
        const wos      = project?.work_orders || [];

        return Object.entries(clusters).map(([orchId, cluster]) => {
            const assignedWos  = wos.filter(w => cluster.agents.find(a => a.id === w.assigneeId));
            const completedWos = assignedWos.filter(w => w.status === 'consolidated' || w.status === 'reported');
            const pendingWos   = assignedWos.filter(w => w.status === 'theoretical' || w.status === 'pinged');
            const load         = cluster.agents.length;
            const overloaded   = load > OrchestratorCore.MAX_SWARM_SIZE;

            return {
                orchestratorId: orchId,
                orchestratorName: cluster.orchestrator?.name || orchId,
                agentCount:    load,
                woTotal:       assignedWos.length,
                woCompleted:   completedWos.length,
                woPending:     pendingWos.length,
                overloaded,
                healthScore:   assignedWos.length > 0 ? Number((completedWos.length / assignedWos.length).toFixed(3)) : 1.0
            };
        });
    }
}

// ─── SINGLETON EXPORTADO ─────────────────────────────────────
export const Orchestrator = new OrchestratorCore();
