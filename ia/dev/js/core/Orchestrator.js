// ============================================================
//  ia/dev/js/core/Orchestrator.js
//  TeamTowers SOS — Sesión V10 · Fase 1
//  Motor: anthropic/claude-sonnet-4-20250514 (primario)
//  API Key: IndexedDB via KB.js (zero localStorage)
//  Codex: SOS Antigravity Kernel V10
// ============================================================

import { store } from './store.js';
import { KB } from './kb.js';

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

// ─── CLAVE DE PERSISTENCIA EN KB (IndexedDB) ─────────────────
const KB_KEY_PROVIDER    = 'sos_ai_provider';
const KB_KEY_ANTHROPIC   = 'sos_key_anthropic';
const KB_KEY_OPENAI      = 'sos_key_openai';
const KB_KEY_DEEPSEEK    = 'sos_key_deepseek';
const KB_KEY_GEMINI      = 'sos_key_gemini';

// ═════════════════════════════════════════════════════════════
//  OrchestratorCore — Clase principal
// ═════════════════════════════════════════════════════════════
class OrchestratorCore {

    constructor() {
        this.version      = 'V10.0-Antigravity-Anthropic-Primary';
        this.isListening  = false;
        this._kbReady     = false;
    }

    // ──────────────────────────────────────────────────────────
    //  BOOT: asegura KB inicializado antes de cualquier operación
    // ──────────────────────────────────────────────────────────
    async _ensureKB() {
        if (!this._kbReady) {
            await KB.init();
            this._kbReady = true;
        }
    }

    // ──────────────────────────────────────────────────────────
    //  PROVEEDORES: lee claves de IndexedDB (Zero localStorage)
    // ──────────────────────────────────────────────────────────
    async _getAvailableProviders(overrideEngine = null) {
        await this._ensureKB();

        const globalEngine    = (await KB.getNode(KB_KEY_PROVIDER))?.value || 'anthropic';
        const actualPreference = overrideEngine || globalEngine;

        // Cadena de fallback: preferido → global → anthropic → resto
        const fallbackChain = [
            actualPreference,
            globalEngine,
            'anthropic',
            'openai',
            'deepseek',
            'gemini',
            'custom'
        ];
        const uniqueChain = [...new Set(fallbackChain)];
        const available   = [];

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

        // Cache: ya sincronizado
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
                    'x-api-key': apiKey,
                    'anthropic-version': ANTHROPIC_VERSION,
                    'anthropic-beta': 'skills-2025-10-02,files-api-2025-04-14',
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
        responseFormat = 'json_object',   // 'json_object' | 'text'
        temperature    = 0.2,
        mcpSkills      = []               // IDs de skills KB a inyectar vía Anthropic
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

                        const requestBody = {
                            model:       ANTHROPIC_MODEL,
                            max_tokens:  8192,
                            temperature,
                            system:      systemPrompt + jsonSuffix,
                            messages:    [{ role: 'user', content: userPrompt }]
                        };

                        const headers = {
                            'x-api-key':                         apiKey,
                            'anthropic-version':                  ANTHROPIC_VERSION,
                            'content-type':                       'application/json',
                            'anthropic-dangerously-allow-browser':'true'
                        };

                        // Inyección de Skills MCP
                        if (mcpSkills.length > 0) {
                            const mappedSkills = [];
                            for (const sId of mcpSkills) {
                                const synced = await this._syncAnthropicSkill(sId, apiKey);
                                if (synced) {
                                    mappedSkills.push({ type: 'custom', skill_id: synced.id, version: synced.version });
                                }
                            }
                            if (mappedSkills.length > 0) {
                                requestBody.container = { skills: mappedSkills };
                                requestBody.tools     = [{ type: 'code_execution_20250825', name: 'code_execution' }];
                                headers['anthropic-beta'] = 'code-execution-2025-08-25,skills-2025-10-02,files-api-2025-04-14';
                            }
                        }

                        const response = await fetch(ANTHROPIC_API_URL, {
                            method:  'POST',
                            headers,
                            body:    JSON.stringify(requestBody)
                        });

                        if (!response.ok) throw new Error(`[HTTP ${response.status}] ${await response.text()}`);

                        const data = await response.json();

                        // Extraer texto o resultado de code_execution
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
                                prompt_tokens:     data.usage.input_tokens     || 0,
                                completion_tokens: data.usage.output_tokens    || 0,
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
                        const body = {
                            model:       'gpt-4o',
                            temperature,
                            max_tokens:  8192,
                            messages
                        };
                        if (responseFormat === 'json_object') {
                            body.response_format = { type: 'json_object' };
                        }

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
                        const body = {
                            model:       'deepseek-chat',
                            temperature,
                            max_tokens:  8192,
                            messages
                        };
                        if (responseFormat === 'json_object') {
                            body.response_format = { type: 'json_object' };
                        }

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
                        content:  parsedContent,
                        telemetry: {
                            provider,
                            model:   provider === 'anthropic' ? ANTHROPIC_MODEL : provider,
                            tokens:  tokenUsage,
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
    //  Artifact JSON-LD obligatorio en salida
    // ══════════════════════════════════════════════════════════
    async dispatch({ routine, agent, context = {}, constraints = {} }) {
        const {
            maxTokens   = 1000,
            strictJSON  = true,
            engine      = 'anthropic',
            mcpSkills   = []
        } = constraints;

        await this._ensureKB();

        // Recuperar prompt global del agente desde KB
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
            responseFormat: strictJSON ? 'json_object' : 'text',
            temperature:    0.2,
            mcpSkills
        });

        // Envolver en envelope JSON-LD SosArtifact si no viene ya envuelto
        const payload = response.content;
        const artifact = {
            '@context':    'https://teamtowers.io/sos/v10',
            '@type':       'SosArtifact',
            artifactType:  'routine_output',
            agentId:       agent,
            routine,
            timestamp:     new Date().toISOString(),
            payload:       payload?.payload || payload,
            telemetry:     response.telemetry,
            audit: {
                tddPassed:  false,
                notarized:  false,
                hash:       `sha256:${Date.now().toString(16)}`
            }
        };

        // Telemetría al store
        if (context.projectId) {
            this._logTelemetry(context.projectId, agent, response.telemetry.provider, routine, response.telemetry);
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
                responseFormat: 'text',
                temperature:    0.4
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
            const project  = state.projects?.find(p => p.id === projectId);
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
                responseFormat: 'json_object',
                temperature:    0.1
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
                        id:              `log_heal_${Date.now()}`,
                        date:            Date.now(),
                        authorId:        CORE_AGENTS.SYNTHESIZER,
                        relatedTxHash:   task.hash || task.id,
                        content:         contentLog,
                        mentions:        [result.assignedNode, task.assigneeId],
                        readBy:          []
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
    //  Telemetría — registra coste y tokens en el store Redux
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
    }

    // ══════════════════════════════════════════════════════════
    //  API de Settings — guardar/leer claves desde KB
    //  Usado por SettingsVault V10
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
}

// ─── SINGLETON EXPORTADO ─────────────────────────────────────
export const Orchestrator = new OrchestratorCore();
