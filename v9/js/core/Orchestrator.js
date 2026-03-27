// v9/js/core/Orchestrator.js
import { store } from './store.js';
import { KB } from './kb.js';

// 🔥 PADRÓN UNIVERSAL DE AGENTES CORE (V9 Antigravity)
const CORE_AGENTS = {
    ARCHITECT: '@agent_genesis_architect',
    ONTOLOGIST: '@agent_dharma_ontologist',
    CRAFTER: '@agent_skill_crafter',
    SYNTHESIZER: '@agent_prompt_synthesizer',
    AUDITOR: '@agent_tdd_auditor',
    WEAVER: '@agent_synaptic_weaver',
    ECONOMIST: '@agent_token_economist'
};

class OrchestratorCore {
    constructor() {
        this.version = "V9.2-Anthropic-Skills-Full";
        this.isListening = false;
    }

    _getAvailableProviders(overrideEngine = null) {
        const globalEngine = localStorage.getItem('tt_ai_provider') || 'openai';
        const actualPreference = overrideEngine || globalEngine;
        
        const fallbackChain = [actualPreference, globalEngine, 'openai', 'deepseek', 'gemini', 'custom', 'anthropic'];
        const uniqueChain = [...new Set(fallbackChain)]; 
        const available = [];

        for (const provider of uniqueChain) {
            if (provider === 'custom') { available.push({ provider: 'custom', apiKey: 'local_or_custom_mode' }); continue; }
            const apiKey = localStorage.getItem(`tt_key_${provider}`);
            if (apiKey && apiKey.trim().length > 10) available.push({ provider, apiKey });
        }
        
        if (available.length === 0) throw new Error("[KERNEL PANIC] No hay ninguna API Key configurada en el Panteón.");
        return available;
    }

    initUsenetDaemon() {
        if (this.isListening) return;
        this.isListening = true;
        store.subscribe((state) => {
            if (!state.projects || state.projects.length === 0) return;
            state.projects.forEach(project => {
                if (!project.logs) return;
                project.logs.forEach(log => {
                    if (log.mentions && log.mentions.length > 0) {
                        log.mentions.forEach(async (mentionId) => {
                            const isRead = log.readBy && log.readBy.includes(mentionId);
                            if (isRead) return; 
                            const targetNode = state.globalUsers.find(u => u.id === mentionId);
                            if (targetNode && targetNode.profile && targetNode.profile.isAi) {
                                store.dispatch({ type: 'MARK_LOG_READ', payload: { projectId: project.id, logId: log.id, userId: targetNode.id } });
                                await this.autoRespondUsenet(project, log, targetNode);
                            }
                        });
                    }
                });
            });
        });
    }

    // 🔥 FASE 1: SINCRONIZADOR DE SKILLS A ANTHROPIC API (Zero External Libs)
    async _syncAnthropicSkill(skillId, apiKey) {
        await KB.init();
        const skillNode = await KB.getNode(skillId);
        if (!skillNode || (skillNode.category !== 'skill' && skillNode.type !== 'skill')) return null;

        if (skillNode.anthropic_skill_id) {
            return { id: skillNode.anthropic_skill_id, version: skillNode.anthropic_version || 'latest' };
        }

        console.log(`[Antigravity] 🚀 Subiendo Skill '${skillNode.title}' a la VM de Anthropic...`);

        const formData = new FormData();
        const safeTitle = (skillNode.title || 'Skill Antigravity').substring(0, 60);
        formData.append('display_title', safeTitle);

        const safeDir = `skill_${skillNode.id.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase().substring(0,20)}`;
        const cleanDesc = (skillNode.description || 'SOP de ejecución').replace(/\n/g, ' ').substring(0, 1000);
        const frontmatter = `---\nname: ${safeDir}\ndescription: ${cleanDesc}\n---\n\n`;
        const mainContent = `${frontmatter}# ${skillNode.title}\n\n${skillNode.content || ''}`;
        
        formData.append('files[]', new Blob([mainContent], { type: 'text/markdown' }), `${safeDir}/SKILL.md`);

        const appendChildren = async (ids, folder) => {
            if (!ids || !Array.isArray(ids)) return;
            for (const cId of ids) {
                const cNode = await KB.getNode(cId);
                if (cNode) {
                    let ext = 'md';
                    if (cNode.type === 'script') ext = 'py'; 
                    if (cNode.type === 'eval') ext = 'json';
                    const sName = (cNode.title || cId).replace(/[^a-zA-Z0-9-]/g, '_').toLowerCase();
                    formData.append('files[]', new Blob([cNode.content], { type: 'text/plain' }), `${safeDir}/${folder}/${sName}.${ext}`);
                }
            }
        };

        await appendChildren(skillNode.references, 'references');
        await appendChildren(skillNode.evals, 'evals');
        await appendChildren(skillNode.scripts, 'scripts');

        try {
            const response = await fetch('https://api.anthropic.com/v1/skills', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-beta': 'skills-2025-10-02',
                    'anthropic-dangerously-allow-browser': 'true'
                },
                body: formData 
            });

            if (!response.ok) throw new Error(await response.text());
            
            const data = await response.json();
            skillNode.anthropic_skill_id = data.id;
            skillNode.anthropic_version = data.latest_version;
            await KB.saveNode(skillNode);
            
            console.log(`[Antigravity] ✅ Skill sellada en Workspace Anthropic: ${data.id}`);
            return { id: data.id, version: data.latest_version };
        } catch (error) {
            console.error(`[Anthropic Sync Failed]:`, error);
            return null; 
        }
    }

    // 🔥 FASE 2: BIFURCACIÓN DEL PAYLOAD
    async callLLM({ preferredEngine = null, systemPrompt, userPrompt, responseFormat = "json_object", temperature = 0.2, mcpSkills = [] }) {
        const availableProviders = this._getAvailableProviders(preferredEngine);
        let lastError = null;

        for (const p of availableProviders) {
            const { provider, apiKey } = p;
            let attempt = 0;
            const maxRetries = 1;

            while (attempt <= maxRetries) {
                try {
                    let textResponse = ""; 
                    let tokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
                    const startTime = Date.now();

                    if (provider === 'gemini') {
                        const urlStr = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
                        const response = await fetch(urlStr, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                contents: [{ parts: [{ text: `${systemPrompt}\n\nINPUT:\n${userPrompt}` }] }], 
                                generationConfig: { temperature, maxOutputTokens: 8192, responseMimeType: responseFormat === "json_object" ? "application/json" : "text/plain" } 
                            })
                        });
                        
                        if (!response.ok) throw new Error(`[HTTP ${response.status}] ${await response.text()}`);
                        const data = await response.json();
                        if (!data.candidates || data.candidates.length === 0) throw new Error("Respuesta vacía de Gemini.");
                        
                        textResponse = data.candidates[0].content.parts[0].text;
                        if (data.usageMetadata) { 
                            tokenUsage.prompt_tokens = data.usageMetadata.promptTokenCount || 0; 
                            tokenUsage.completion_tokens = data.usageMetadata.candidatesTokenCount || 0; 
                        }
                    } 
                    else if (provider === 'anthropic') {
                        const anthropicSystem = responseFormat === "json_object" 
                            ? systemPrompt + "\n\nDEBES RESPONDER ÚNICAMENTE CON UN OBJETO JSON VÁLIDO. NO USES BLOQUES MARKDOWN." 
                            : systemPrompt;

                        const requestBody = {
                            model: 'claude-3-5-sonnet-20241022', 
                            max_tokens: 8192, 
                            temperature: temperature, 
                            system: anthropicSystem, 
                            messages: [{ role: 'user', content: userPrompt }]
                        };

                        const headers = { 
                            'x-api-key': apiKey, 
                            'anthropic-version': '2023-06-01', 
                            'content-type': 'application/json', 
                            'anthropic-dangerously-allow-browser': 'true' 
                        };

                        if (mcpSkills && mcpSkills.length > 0) {
                            const mappedSkills = [];
                            for (const sId of mcpSkills) {
                                const synced = await this._syncAnthropicSkill(sId, apiKey);
                                if (synced) mappedSkills.push({ type: 'custom', skill_id: synced.id, version: synced.version });
                            }
                            
                            if (mappedSkills.length > 0) {
                                requestBody.container = { skills: mappedSkills };
                                requestBody.tools = [{ type: "code_execution_20250825", name: "code_execution" }];
                                headers['anthropic-beta'] = 'code-execution-2025-08-25,skills-2025-10-02,files-api-2025-04-14';
                            }
                        }

                        const response = await fetch('https://api.anthropic.com/v1/messages', {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify(requestBody)
                        });
                        
                        if (!response.ok) throw new Error(`[HTTP ${response.status}] ${await response.text()}`);
                        const data = await response.json();
                        
                        const executionBlock = data.content.find(c => c.type === 'tool_use' && c.name === 'code_execution');
                        if (executionBlock) {
                            textResponse = JSON.stringify({ message: "Operación ejecutada en la VM.", artifact: executionBlock });
                        } else {
                            textResponse = data.content[0].text;
                        }
                        
                        tokenUsage.prompt_tokens = data.usage?.input_tokens || 0;
                        tokenUsage.completion_tokens = data.usage?.output_tokens || 0;
                    }
                    else {
                        let endpointUrl = 'https://api.openai.com/v1/chat/completions';
                        let modelName = 'gpt-4o';
                        
                        if (provider === 'deepseek') { endpointUrl = 'https://api.deepseek.com/chat/completions'; modelName = 'deepseek-chat'; } 
                        else if (provider === 'custom') { endpointUrl = document.getElementById('inpCustomUrl')?.value || 'http://localhost:1234/v1/chat/completions'; modelName = 'local-model'; }
                        
                        const bodyData = { model: modelName, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], temperature: temperature, max_tokens: 8192 };
                        if (responseFormat === "json_object") bodyData.response_format = { type: "json_object" };
                        
                        const response = await fetch(endpointUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(bodyData) });
                        if (!response.ok) throw new Error(`[HTTP ${response.status}] ${await response.text()}`);
                        const data = await response.json();
                        textResponse = data.choices[0].message.content;
                        if (data.usage) tokenUsage = data.usage;
                    }

                    const latencyMs = Date.now() - startTime;
                    let parsedContent = textResponse;
                    
                    if (responseFormat === "json_object") {
                        let cleanText = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
                        const firstBrace = cleanText.indexOf('{'); const lastBrace = cleanText.lastIndexOf('}');
                        if (firstBrace !== -1 && lastBrace !== -1) cleanText = cleanText.substring(firstBrace, lastBrace + 1);
                        parsedContent = JSON.parse(cleanText);
                    }
                    
                    return { content: parsedContent, telemetry: { provider, tokens: tokenUsage, latencyMs } };
                
                } catch (error) {
                    lastError = error; 
                    const errMsg = (error.message || "").toLowerCase();
                    if (errMsg.includes('networkerror') || errMsg.includes('failed to fetch') || errMsg.includes('cors') || errMsg.includes('network')) {
                        console.warn(`🛡️ [Antigravity Shield] Muro CORS en ${provider}. Saltando al siguiente motor...`);
                        break; 
                    }
                    attempt++; 
                    if (attempt <= maxRetries) await new Promise(r => setTimeout(r, 1000 * attempt));
                }
            }
        }
        throw new Error(`Todos los motores colapsaron. Último error: ${lastError.message}`);
    }

    async _buildLightweightContext(projectId, agentId) {
        await KB.init();
        let contextText = `Leyes del Ecosistema: GTD (Orientación a Acción) y TDD (Validación Estricta).\n`;
        const promptNode = await KB.getNode(`prompt_global_${agentId.replace('@','')}`);
        if (promptNode) contextText += `\nTU CONSCIENCIA E IKIGAI:\n${promptNode.content}\n`;
        const allMemes = await KB.getAllNodes({ category: 'evergreen' });
        const relevantMemes = allMemes.filter(m => m.projectId === projectId || m.projectId === 'global').slice(0,3);
        if (relevantMemes.length > 0) {
            contextText += `\nSABIDURÍA EVERGREEN:\n`;
            relevantMemes.forEach(m => contextText += `- ${m.title}: ${m.content}\n`);
        }
        return contextText;
    }

    async synthesizeAgentPrompt(currentPrompt, allSkillsContext) {
        const systemPrompt = `
            Eres el '${CORE_AGENTS.SYNTHESIZER}'. Tu misión es realizar una "Re-síntesis Neuronal": debes reescribir el System Prompt de un Agente (AGENT.md) para asegurarte de que su CINTURÓN DE HERRAMIENTAS completo está integrado, SIN DESTRUIR su personalidad ni su objetivo original.
            
            REGLAS ESTRICTAS:
            1. MANTÉN INTACTO el rol, tono y propósito principal del Agente.
            2. Busca o crea la sección "=== HERRAMIENTAS ===" (o similar) en el prompt.
            3. Integra TODAS las herramientas listadas que se te proporcionan, indicando brevemente CUÁNDO debe invocar cada una basándote en su descripción. NO OMITAS NINGUNA.
            4. Sé directo. Usa frases imperativas ("Usa esta tool cuando...").
            5. Devuelve ÚNICAMENTE el texto final del AGENT.md completo, sin explicaciones adicionales ni bloques markdown envolventes.
        `;

        const userPrompt = `
            === CEREBRO BASE DEL AGENTE ===
            ${currentPrompt || "Eres un agente asistente."}
            
            === CINTURÓN DE HERRAMIENTAS COMPLETO (DEBEN ESTAR TODAS) ===
            ${allSkillsContext}
            
            Ejecuta la síntesis y devuelve el cerebro integrado con todas las herramientas.
        `;

        const response = await this.callLLM({ preferredEngine: 'openai', systemPrompt, userPrompt, responseFormat: "text", temperature: 0.1 }); 
        this._logTelemetry('global', CORE_AGENTS.SYNTHESIZER, response.telemetry.provider, 'PROMPT_SYNTHESIS', response.telemetry);
        return response.content.replace(/^```markdown\n/, '').replace(/```$/, '').trim();
    }

    async evaluateContextForVNA(projectName, archetypeText, vision, overrideProvider = null) {
        const systemPrompt = `
            Eres ${CORE_AGENTS.ARCHITECT}, Master Ecosystem Architect. Vas a aplicar Value Network Analysis (VNA).
            Eres EXTREMADAMENTE EXIGENTE y HOSTIL a la ambigüedad. Tienes que actuar como un consultor experto.
            
            REGLA DE ORO DE SUPERVIVENCIA:
            Si el usuario no te ha especificado claramente:
            1. El Sector de Actividad y el Tipo de Organización exacta.
            2. Los Arquetipos de Roles o departamentos que asume que existen en la red.
            3. Qué tangibles e intangibles principales se van a intercambiar.
            
            ESTÁS OBLIGADO a devolver "isReady": false y generar hasta 3 preguntas quirúrgicas para investigar este contexto.
            NUNCA asumas el modelo de negocio si la visión es muy genérica (ej: "Hacer una web").
            
            Devuelve ÚNICAMENTE un JSON estricto:
            { "isReady": boolean, "questions": ["Pregunta 1...", "Pregunta 2..."] }
        `;

        const userPrompt = `Proyecto: ${projectName}\nArquetipo: ${archetypeText}\nVisión Fundacional:\n${vision}`;
        const response = await this.callLLM({ preferredEngine: overrideProvider, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.1 });
        this._logTelemetry('global', CORE_AGENTS.ARCHITECT, response.telemetry.provider, 'VNA_EVALUATION', response.telemetry);
        return response.content; 
    }

    async notarizeWorkOrder(projectId, taskComment, socChecklist) {
        const systemPrompt = `Eres ${CORE_AGENTS.AUDITOR}, el Juez Inmutable Antigravity. Evalúa ESTRICTAMENTE si el Entregable cumple con las Condiciones (SOCs). Devuelve ÚNICAMENTE un JSON: { "soc_id_1": true, "soc_id_2": false }\nSOCs a evaluar: ${JSON.stringify(socChecklist.map(s => ({id: s.id, text: s.text})))}`;
        const response = await this.callLLM({ preferredEngine: 'deepseek', systemPrompt, userPrompt: `ENTREGABLE:\n"${taskComment}"\n\nJuzga la evidencia.`, responseFormat: "json_object", temperature: 0.1 });
        this._logTelemetry(projectId, CORE_AGENTS.AUDITOR, response.telemetry.provider, 'TDD_AUDIT', response.telemetry);
        return JSON.stringify(response.content);
    }

    async harvestKnowledge(task, projectId) {
        try {
            const systemPrompt = `Eres ${CORE_AGENTS.WEAVER}, el destilador del Learning Loop. Misión: Extraer una "Mejor Práctica" W3C. Si es trivial, devuelve {"isValuable": false}. Si es valioso, devuelve JSON: { "isValuable": boolean, "title": "Título Corto", "content": "Regla destilada...", "tags": ["tag1", "tag2"] }`;
            const response = await this.callLLM({ preferredEngine: 'gemini', systemPrompt, userPrompt: `PoW:\n${task.comentario}`, responseFormat: "json_object", temperature: 0.2 });
            const result = response.content;

            if (result.isValuable) {
                await KB.init();
                await KB.saveNode({ id: `meme_evergreen_${Date.now()}`, type: 'meme', category: 'evergreen', projectId: projectId, targetId: 'global', title: `🌟 ${result.title}`, content: result.content, keywords: [...(result.tags || []), '#evergreen'] });
                this._logTelemetry(projectId, CORE_AGENTS.WEAVER, response.telemetry.provider, 'HARVEST', response.telemetry);
                return result.title;
            }
            return null;
        } catch (error) { return null; }
    }

    async designEcosystemVNA(projectName, archetypeText, vision, overrideProvider = null) {
        await KB.init();
        
        const vnaSkill = await KB.getNode('skill_vna_strategy');
        const vnaInstructions = vnaSkill ? vnaSkill.content : 'Diseña un mapa de valor detallado con un mínimo de 5 transacciones.';

        const allSkills = await KB.getAllNodes({ category: 'skill' });
        const allSops = await KB.getAllNodes({ category: 'SOP' });
        
        const catalogContext = `
            Nodos W3C Disponibles (Úsalos si encajan en "new_memes" o "required_skills"):
            Skills: ${allSkills.slice(0,10).map(s => s.title).join(', ')}
            SOPs: ${allSops.slice(0,5).map(s => s.title).join(', ')}
        `;

        const systemPrompt = `
            Eres Master Ecosystem Architect (${CORE_AGENTS.ARCHITECT}).
            
            Basado en tu Skill Operativa de VNA, debes seguir estrictamente estas reglas:
            ${vnaInstructions}

            ATENCIÓN: NO SEPARES EL MAPA EN FASES O ERAS TEMPORALES. Diseña la red en su estado estacionario continuo. El tiempo se gestionará en Sprints (Kanban), no en la topología.
            
            FORMATO JSON ESTRICTO ESPERADO:
            { 
                "presentacion": "Pitch de la red y su modelo de negocio...", 
                "tags": ["sector_x"], 
                "new_memes": [{ "id": "meme_gen_1", "category": "skill", "title": "Nombre", "content": "..." }],
                "roles": [{ "levelId": "@anxaneta", "name": "...", "fmv": 80, "multiplier": 3.0, "guardian": "explorer", "ai_prompt": "Tu Ikigai es..." }], 
                "transactions": [
                    { "id": "tx_1", "step_order": 1, "depends_on": [], "fromLevel": "@anxaneta", "toLevel": "@baixos", "tipo": "tangible", "template": "SOP a ejecutar...", "horas": 5, "required_skills": ["meme_gen_1"], "soc_checklist": [{ "text": "Aserción TDD Binaria 1" }] }
                ] 
            }
        `;

        const userPrompt = `Proyecto: ${projectName}\nArquetipo Legal: ${archetypeText}\n${catalogContext}\nVisión Fundacional:\n${vision}`;
        
        const response = await this.callLLM({ preferredEngine: overrideProvider, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.2 });
        this._logTelemetry('global', CORE_AGENTS.ARCHITECT, response.telemetry.provider, 'VNA_DESIGN', response.telemetry);
        return response.content; 
    }

    async runDeepResearch(topic, expectedCategory, maxNodes = 3, overrideProvider = null) {
        const systemPrompt = `
            Eres ${CORE_AGENTS.CRAFTER}, el Investigador Ontológico y Creador de Memes W3C del Kernel.
            Se te ha pedido investigar un tema profundo. Devuelve Nodos de Conocimiento (JSON-LD Semántico).
            
            FORMATO JSON ESTRICTO:
            {
                "research_summary": "Resumen ejecutivo del hallazgo...",
                "nodes": [
                    { "category": "${expectedCategory}", "title": "Nombre del concepto...", "content": "Desarrollo técnico profundo...", "keywords": ["tag1", "tag2"] }
                ]
            }
            Genera un máximo de ${maxNodes} nodos.
        `;

        const userPrompt = `TEMA DE INVESTIGACIÓN: "${topic}"\nProcesa esto y genera los Nodos para el Meta-Grafo.`;
        const response = await this.callLLM({ preferredEngine: overrideProvider, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.3 });
        this._logTelemetry('global', CORE_AGENTS.CRAFTER, response.telemetry.provider, 'DEEP_RESEARCH', response.telemetry);
        
        const result = response.content;
        if (result.nodes && result.nodes.length > 0) {
            await KB.init();
            for (const node of result.nodes) {
                await KB.saveNode({
                    id: `meme_research_${Date.now()}_${Math.floor(Math.random() * 1000)}`, type: 'meme', category: node.category || expectedCategory, projectId: 'global', targetId: 'global',
                    title: `📖 ${node.title}`, content: node.content, keywords: node.keywords || []
                });
            }
        }
        return result;
    }

    async expandNodeSemantics(title, category, content, tags, overrideProvider = null) {
        const available = this._getAvailableProviders(overrideProvider || 'openai');
        const { provider, apiKey } = available[0];

        const systemPrompt = `
            Eres ${CORE_AGENTS.CRAFTER} del Kernel V9 (Inspirado en el estándar AgentSkills de Anthropic).
            Misión: Tomar un concepto semilla y forjar una cápsula de conocimiento altamente estructurada.
            
            SI EL NODO ES UNA "SKILL" (Categoría: skill), DEBES ESTRUCTURAR EL CONTENT ASÍ:
            
            ### 1. VNA Flow (Flujo de Valor)
            - **Inputs Requeridos (Tangibles/Intangibles):** ¿Qué necesita el agente antes de empezar?
            - **Outputs Generados (Tangibles/Intangibles):** ¿Qué devuelve a la red?
            
            ### 2. SOP (Standard Operating Procedure)
            Instrucciones en imperativo. Paso a paso. CERO teoría (la teoría va a los reference_docs).
            
            ### 3. SOC (Standard Operating Conditions / Evals)
            Criterios de éxito y aserciones TDD.
            
            REGLA DE REVELACIÓN PROGRESIVA (Progressive Disclosure):
            Si la Skill requiere teoría, extráelo y mételo en el array JSON "reference_docs".
            
            Devuelve ÚNICAMENTE JSON estricto: 
            { 
                "title": "Título Mejorado", 
                "description": "Resumen indexable corto...", 
                "content": "Estructura VNA Flow + SOP + SOC en Markdown...", 
                "keywords": ["tag1", "tag2"],
                "reference_docs": [ { "title": "Referencia 1", "description": "Breve resumen", "content": "Teoría profunda en Markdown..." } ]
            }
        `;

        const userPrompt = `Título Original: ${title}\nCategoría: ${category}\nTags Actuales: ${tags}\nContenido Semilla:\n${content}`;
        
        const response = await this.callLLM({ preferredEngine: provider, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.4 });
        this._logTelemetry('global', CORE_AGENTS.CRAFTER, provider, 'KNOWLEDGE_EXPANSION', response.telemetry);
        
        return response.content;
    }

    async autoHealNetwork(task, projectId) {
        try {
            const failedSocs = (task.soc_checklist || []).filter(s => !s.isChecked).map(s => s.text);
            if (failedSocs.length === 0) return null;

            await KB.init();
            const allPrompts = await KB.getAllNodes({ category: 'meta_prompt' }); 
            const nodeDirectory = allPrompts.map(p => ({ id: p.targetId, name: p.title, skills: p.keywords, ikigai: p.ikigai }));
            if (nodeDirectory.length === 0) return null;

            const systemPrompt = `
                Eres ${CORE_AGENTS.SYNTHESIZER}. Una Work Order falló en la auditoría TDD. Busca al nodo más capacitado del padrón para resolver esta falla.
                Devuelve ÚNICAMENTE JSON: { "assignedNode": "@id_del_nodo", "reason": "Motivo corto...", "actionPlan": "Sugerencia rápida" }
                PADRÓN DISPONIBLE: ${JSON.stringify(nodeDirectory)}
            `;

            const userPrompt = `La tarea "${task.comentario.substring(0,60)}..." falló los SOCs: ${JSON.stringify(failedSocs)}. ¿A qué nodo invocamos?`;
            const response = await this.callLLM({ preferredEngine: 'deepseek', systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.1 });
            const result = response.content;

            if (result.assignedNode) {
                const contentLog = `⚕️ **Protocolo de Auto-Sanación Activado.**\nLa auditoría Notarial falló en: *${failedSocs.join(', ')}*.\n\n${CORE_AGENTS.SYNTHESIZER} solicita asistencia de <a href="/v9/profile?id=${result.assignedNode.replace('@','')}" data-link class="mention-highlight">${result.assignedNode}</a>.\n\n**Motivo:** ${result.reason}\n**Plan:** ${result.actionPlan}`;
                await store.dispatch({ type: 'ADD_LOG_ENTRY', payload: { projectId, log: { id: 'log_heal_' + Date.now(), date: Date.now(), authorId: CORE_AGENTS.SYNTHESIZER, relatedTxHash: task.hash || task.id, content: contentLog, mentions: [result.assignedNode, task.assigneeId], readBy: [] } } });
                this._logTelemetry(projectId, CORE_AGENTS.SYNTHESIZER, response.telemetry.provider, 'AUTO_HEAL', response.telemetry);
                return result;
            }
            return null;
        } catch (e) {
            console.warn("⚠️ [Orchestrator] Fallo en Auto-Sanación:", e.message);
            return null;
        }
    }

    _logTelemetry(projectId, agentId, engine, actionType, telemetryData) {
        if (!telemetryData) return;
        const state = store.getState();
        const ecoConfig = state.config?.economics || {
            markup_margin: 0.0,
            premium_features_fee: 0.0,
            base_pricing: {
                'deepseek': { input: 0.14, output: 0.28 }, 
                'gemini': { input: 0.075, output: 0.30 },  
                'openai': { input: 2.50, output: 10.00 },  
                'anthropic': { input: 3.00, output: 15.00 }, 
                'custom': { input: 0.0, output: 0.0 }
            }
        };

        const priceMatrix = ecoConfig.base_pricing[engine] || { input: 0, output: 0 };
        const baseCost = ((telemetryData.tokens.prompt_tokens / 1000000) * priceMatrix.input) + 
                         ((telemetryData.tokens.completion_tokens / 1000000) * priceMatrix.output);
        const finalCostInDollars = baseCost * (1 + ecoConfig.markup_margin + ecoConfig.premium_features_fee);

        store.dispatch({ 
            type: 'LOG_TELEMETRY', 
            payload: { 
                projectId, agentId, engine, actionType, 
                tokens: telemetryData.tokens, costInDollars: finalCostInDollars, 
                recRatio: 0, latencyMs: telemetryData.latencyMs 
            } 
        });
    }
}
export const Orchestrator = new OrchestratorCore();
