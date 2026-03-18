// v8/js/core/Orchestrator.js
import { store } from './store.js';
import { KB } from './kb.js';

const LLM_PRICING = {
    'deepseek': { input: 0.14, output: 0.28 },
    'gemini': { input: 0.075, output: 0.30 },
    'openai': { input: 0.15, output: 0.60 },
    'anthropic': { input: 3.00, output: 15.00 },
    'custom': { input: 0.0, output: 0.0 }
};

class OrchestratorCore {
    constructor() {
        this.version = "15.1-TitaniumPatch";
        this.isListening = false;
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

    async callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat = "json_object", temperature = 0.2, maxRetries = 2 }) {
        if (!apiKey && provider !== 'custom') throw new Error(`API Key requerida para el Orquestador (${provider}).`);
        let attempt = 0; let lastError = null;
        
        while (attempt <= maxRetries) {
            try {
                let textResponse = ""; let tokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
                const startTime = Date.now();

                if (provider === 'gemini') {
                    // 🔥 PARCHE TITANIUM: Estructura de fetch a prueba de fallos para Gemini
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            contents: [{ parts: [{ text: `${systemPrompt}\n\nINPUT DEL USUARIO:\n${userPrompt}` }] }], 
                            generationConfig: { 
                                temperature, 
                                maxOutputTokens: 8192, 
                                responseMimeType: responseFormat === "json_object" ? "application/json" : "text/plain" 
                            } 
                        })
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`[HTTP ${response.status}] ${errorText || response.statusText}`);
                    }
                    
                    const data = await response.json();
                    if (!data.candidates || data.candidates.length === 0) throw new Error("Gemini devolvió una respuesta vacía.");
                    
                    textResponse = data.candidates[0].content.parts[0].text;
                    if (data.usageMetadata) { tokenUsage.prompt_tokens = data.usageMetadata.promptTokenCount || 0; tokenUsage.completion_tokens = data.usageMetadata.candidatesTokenCount || 0; }
                
                } else if (provider === 'openai' || provider === 'deepseek') {
                    const endpoint = provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://api.deepseek.com/chat/completions';
                    const modelName = provider === 'openai' ? "gpt-4o" : "deepseek-chat";
                    
                    const response = await fetch(endpoint, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ 
                            model: modelName, 
                            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], 
                            temperature, 
                            max_tokens: 8192, 
                            response_format: responseFormat === "json_object" ? { type: "json_object" } : null 
                        })
                    });
                    
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`[HTTP ${response.status}] ${errorText || response.statusText}`);
                    }
                    
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
                lastError = error; attempt++; 
                console.warn(`⚠️ [Orquestador] Fallo en intento ${attempt}/${maxRetries + 1}. Error:`, error.message);
                await new Promise(r => setTimeout(r, 1500)); // Damos un poco más de aire (1.5s)
            }
        }
        throw new Error(`${lastError.message}`);
    }

    // ==========================================
    // CAPA 2: DISEÑADOR VNA (Agile RAG)
    // ==========================================
    async designEcosystemVNA(projectName, archetypeText, vision, provider, apiKey) {
        await KB.init();
        const promptNode = await KB.getNode('prompt_genesi_vna');
        
        // 🔥 PARCHE DE ESTABILIZACIÓN: Si el prompt cargado es muy restrictivo, lo relajamos.
        // Si no existe, usamos este fallback infalible.
        let systemPrompt = promptNode ? promptNode.content : `
Eres el Master Ecosystem Architect. Diseña una arquitectura VNA devolviendo EXCLUSIVAMENTE un objeto JSON estricto.
MANDAMIENTOS: 1. Crea EXACTAMENTE entre 8 y 10 transacciones. 2. 5 ERAS: Kickoff, Growth, Scale, Harvest, Cierre. 3. Mínimo 2 required_skills por tx. 4. 2 soc_checklist por tx.
ESTRUCTURA JSON EXACTA: { "presentacion": "...", "tags": ["Tech"], "new_memes": [{ "id": "meme_skill_x", "category": "skill", "title": "X", "content": "..." }], "roles": [{ "levelId": "@anxaneta", "name": "CEO", "fmv": 80, "multiplier": 3.0, "guardian": "explorer", "ai_prompt": "..." }], "transactions": [{ "id": "tx_1", "phase": "Kickoff", "step_order": 1, "depends_on": [], "fromLevel": "@anxaneta", "toLevel": "@baixos", "tipo": "intangible", "template": "...", "horas": 5, "required_skills": ["meme_skill_x"], "soc_checklist": [{ "text": "..." }] }] }
REGLA DE ORO: Usa roles estándar (@anxaneta, @aixecador, @dosos, @baixos, @pinya).
`;
        
        const result = await this.callLLM({ 
            provider, apiKey, systemPrompt, 
            userPrompt: `Proyecto: ${projectName}\nArquetipo: ${archetypeText}\nVisión: ${vision}`, 
            responseFormat: "json_object", temperature: 0.1 
        });
        return result.content; 
    }

    // ==========================================
    // CAPA 3: LA FORJA FRACTAL
    // ==========================================
    async forgeProjectColla(projectId, provider, apiKey) {
        await KB.init();
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) throw new Error("Proyecto no encontrado en el Kernel.");

        const promptNode = await KB.getNode('prompt_genesi_forge');
        const systemPrompt = promptNode ? promptNode.content : `Eres @genesi_ai, redacta un System Prompt en primera persona.`;
        
        const forgedAgents = [];

        for (const role of project.roles) {
            const flatContext = await KB.getAgentContextFlattened(projectId, role, project.prompt, project.archetype);
            const roleFlows = project.vna_flows.filter(f => f.from === role.id || f.to === role.id);
            const flowsContext = roleFlows.map(f => `- [${f.tipo.toUpperCase()}] ${f.template}`).join('\n');

            const userPrompt = `
                Crea el SYSTEM PROMPT definitivo para el rol de "${role.name}" (${role.levelId}).
                CONTEXTO ONTOLÓGICO: ${flatContext}
                TUBERÍAS VNA: ${flowsContext || "Ninguna aún."}
                Instrucciones: Texto estricto en primera persona para ejecutar SOPs. NO JSON.
            `;

            const result = await this.callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat: "text", temperature: 0.4 });

            const newPromptNode = await KB.saveNode({ id: `prompt_${projectId}_${role.id}`, type: 'prompt_a2a', projectId: projectId, targetId: role.id, roleTarget: role.levelId, title: `Prompt A2A Forjado: ${role.name}`, content: result.content });

            const priceMatrix = LLM_PRICING[provider] || { input: 0, output: 0 };
            const costInDollars = ((result.telemetry.tokens.prompt_tokens / 1000000) * priceMatrix.input) + ((result.telemetry.tokens.completion_tokens / 1000000) * priceMatrix.output);

            await store.dispatch({ type: 'LOG_TELEMETRY', payload: { projectId: projectId, agentId: '@genesi_ai', engine: provider, actionType: 'FORGE_IDENTITY', tokens: result.telemetry.tokens, costInDollars: costInDollars, recRatio: 0, latencyMs: result.telemetry.latencyMs } });

            forgedAgents.push({ roleId: role.id, roleName: role.name, promptId: newPromptNode.id });
        }
        return forgedAgents;
    }

    // ==========================================
    // CAPA 4: USENET DAEMON
    // ==========================================
    async autoRespondUsenet(project, incomingLog, agentNode) {
        try {
            let provider = agentNode.profile?.preferredEngine || localStorage.getItem('tt_ai_provider') || 'deepseek';
            let apiKey = localStorage.getItem(`tt_key_${provider}`);
            if (!apiKey) { provider = localStorage.getItem('tt_ai_provider') || 'deepseek'; apiKey = localStorage.getItem(`tt_key_${provider}`); }
            if (!apiKey) return;

            let contextStr = `Ecosistema: ${project.nombre}\n\n`;
            if (incomingLog.relatedTxHash) {
                const wo = project.work_orders.find(w => w.hash === incomingLog.relatedTxHash);
                if (wo) {
                    const flow = project.vna_flows.find(f => f.id === wo.flowId);
                    contextStr += `ESTADO ACTUAL:\n- Tarea: ${flow ? flow.template : 'Desconocida'}\n- SOCs: ${JSON.stringify(wo.soc_checklist)}\n\n`;
                }
            }
            const thread = project.logs.filter(l => l.relatedTxHash === incomingLog.relatedTxHash).slice(-5);
            contextStr += `HILO RECIENTE:\n`;
            thread.forEach(l => { const author = store.getState().globalUsers.find(u => u.id === l.authorId)?.name || l.authorId; contextStr += `[${author}]: ${l.content}\n`; });

            await KB.init();
            let agentPrompt = `Eres ${agentNode.name} (${agentNode.id}).`;
            const customPrompt = await KB.getNode(`prompt_${project.id}_${agentNode.id}`);
            if (customPrompt) agentPrompt = customPrompt.content;

            const systemPrompt = `${agentPrompt}\n\nCONTEXTO:\n${contextStr}\nMisión: Responde al ping de forma profesional. Firma la respuesta. NO uses JSON. NO uses markdown \`\`\`.`;

            const result = await this.callLLM({ provider, apiKey, systemPrompt, userPrompt: `Responde al ping de ${incomingLog.authorId}.`, responseFormat: "text", temperature: 0.7 });

            await store.dispatch({ type: 'ADD_LOG_ENTRY', payload: { projectId: project.id, log: { id: 'log_' + Date.now(), date: Date.now(), authorId: agentNode.id, relatedTxHash: incomingLog.relatedTxHash, content: result.content, mentions: [incomingLog.authorId], readBy: [] } } });

            const priceMatrix = LLM_PRICING[provider] || { input: 0, output: 0 };
            const costInDollars = ((result.telemetry.tokens.prompt_tokens / 1000000) * priceMatrix.input) + ((result.telemetry.tokens.completion_tokens / 1000000) * priceMatrix.output);
            await store.dispatch({ type: 'LOG_TELEMETRY', payload: { projectId: project.id, agentId: agentNode.id, engine: provider, actionType: 'USENET_PING', tokens: result.telemetry.tokens, costInDollars: costInDollars, recRatio: 0, latencyMs: result.telemetry.latencyMs } });

        } catch (error) { console.error(`[Usenet Daemon] Fallo al responder con ${agentNode.id}:`, error); }
    }

    // ==========================================
    // CAPA 5: DEEP RESEARCH ACADÉMICO
    // ==========================================
    async deepResearch(topic, category, provider, apiKey) {
        if (!apiKey && provider !== 'custom') throw new Error("API Key requerida para Deep Research.");

        await KB.init();
        const promptNode = await KB.getNode('prompt_mestre_research');
        const systemPrompt = promptNode ? promptNode.content : `Actúa como @mestre_escola. Extrae SOCs/SOPs en JSON.`;

        const userPrompt = `INVESTIGA Y EXTRAE CONOCIMIENTO VERAZ SOBRE: "${topic}"\nCategoría de salida deseada: ${category.toUpperCase()}. Extrae al menos 3 nodos de alta densidad informativa.`;

        const result = await this.callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.2 });

        const priceMatrix = LLM_PRICING[provider] || { input: 0, output: 0 };
        const costInDollars = ((result.telemetry.tokens.prompt_tokens / 1000000) * priceMatrix.input) + ((result.telemetry.tokens.completion_tokens / 1000000) * priceMatrix.output);

        await store.dispatch({ type: 'LOG_TELEMETRY', payload: { projectId: 'global', agentId: '@mestre_escola', engine: provider, actionType: 'DEEP_RESEARCH', tokens: result.telemetry.tokens, costInDollars: costInDollars, recRatio: 0, latencyMs: result.telemetry.latencyMs } });

        return result.content;
    }
}

export const Orchestrator = new OrchestratorCore();
