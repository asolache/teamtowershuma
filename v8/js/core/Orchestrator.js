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
        this.version = "14.5-AcademicRAG";
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
        if (!apiKey && provider !== 'custom') throw new Error("API Key requerida para el Orquestador.");
        let attempt = 0; let lastError = null;
        while (attempt <= maxRetries) {
            try {
                let textResponse = ""; let tokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
                const startTime = Date.now();

                if (provider === 'gemini') {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nINPUT DEL USUARIO:\n${userPrompt}` }] }], generationConfig: { temperature, responseMimeType: responseFormat === "json_object" ? "application/json" : "text/plain" } })
                    });
                    if (!response.ok) throw new Error(`Google Gemini Error: ${response.statusText}`);
                    const data = await response.json();
                    textResponse = data.candidates[0].content.parts[0].text;
                    if (data.usageMetadata) { tokenUsage.prompt_tokens = data.usageMetadata.promptTokenCount || 0; tokenUsage.completion_tokens = data.usageMetadata.candidatesTokenCount || 0; }
                } else if (provider === 'openai' || provider === 'deepseek') {
                    const endpoint = provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://api.deepseek.com/chat/completions';
                    const modelName = provider === 'openai' ? "gpt-4o" : "deepseek-chat";
                    const response = await fetch(endpoint, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ model: modelName, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], temperature, response_format: responseFormat === "json_object" ? { type: "json_object" } : null })
                    });
                    if (!response.ok) throw new Error(`${provider.toUpperCase()} Error: ${response.statusText}`);
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
                lastError = error; attempt++; await new Promise(r => setTimeout(r, 1000));
            }
        }
        throw new Error(`Fallo tras ${maxRetries + 1} intentos. Último error: ${lastError.message}`);
    }

    async designEcosystemVNA(projectName, archetypeText, vision, provider, apiKey) {
        const systemPrompt = `
Eres el Master Ecosystem Architect de TeamTowers V14. Diseña una arquitectura VNA devolviendo EXCLUSIVAMENTE un objeto JSON estricto.
MANDAMIENTOS: 1. MÍNIMO 12 transacciones. 2. 5 ERAS: Kickoff, Growth, Scale, Harvest, Cierre. 3. Lógica DAG en "depends_on". 4. 30% transacciones intangibles. 5. 3 skills por tx. 6. 2 soc_checklists auditable matemáticamente por tx.
ESTRUCTURA JSON EXACTA: { "presentacion": "...", "tags": ["..."], "new_memes": [{ "id": "meme_skill_x", "category": "skill", "title": "X", "content": "..." }], "roles": [{ "levelId": "@anxaneta", "name": "CEO", "fmv": 80, "multiplier": 3.0, "guardian": "explorer", "ai_prompt": "..." }], "transactions": [{ "id": "tx_1", "phase": "Kickoff", "step_order": 1, "depends_on": [], "fromLevel": "@anxaneta", "toLevel": "@baixos", "tipo": "intangible", "template": "...", "horas": 5, "required_skills": ["meme_skill_x"], "soc_checklist": [{ "text": "..." }] }] }
REGLA DE ORO: Usa roles estándar (@anxaneta, @aixecador, @dosos, @baixos, @pinya).
`;
        const result = await this.callLLM({ provider, apiKey, systemPrompt, userPrompt: `Proyecto: ${projectName}\nArquetipo: ${archetypeText}\nVisión: ${vision}`, responseFormat: "json_object", temperature: 0.1 });
        return result.content; 
    }

    async forgeProjectColla(projectId, provider, apiKey) {
        /* ... Mantenido igual ... */
    }

    async autoRespondUsenet(project, incomingLog, agentNode) {
        /* ... Mantenido igual ... */
    }

    // ==========================================
    // CAPA 5: DEEP RESEARCH ACADÉMICO (ORÁCULO W3C)
    // ==========================================
    async deepResearch(topic, category, provider, apiKey) {
        if (!apiKey && provider !== 'custom') throw new Error("API Key requerida para Deep Research.");

        const systemPrompt = `
            Actúa como @mestre_escola, el Investigador Jefe Académico y de Ingeniería de la Matriz V14.
            Tu directiva es extraer el conocimiento más veraz, estandarizado a nivel industrial y profundo sobre el tema solicitado. No simules ni inventes; accede a tu base de conocimiento global (patrones de diseño, normativas ISO, frameworks Agile/W3C, documentación técnica oficial).
            
            Debes destilar este conocimiento en un array de "Memes" (nodos de conocimiento).
            Si la categoría solicitada es "SOP" (Procedimientos), describe pasos ejecutables.
            Si es "SOC" (Condiciones), describe métricas de calidad estrictas y auditables.
            Si es "SKILL", describe las competencias técnicas reales necesarias.
            
            DEVUELVE ÚNICAMENTE JSON:
            {
                "memes": [
                    {
                        "category": "${category}",
                        "title": "Nombre del framework/procedimiento exacto",
                        "content": "Desarrollo técnico profundo...",
                        "keywords": ["tag_real_1", "tag_real_2"]
                    }
                ]
            }
        `;

        const userPrompt = `INVESTIGA Y EXTRAE CONOCIMIENTO VERAZ SOBRE: "${topic}"\nCategoría de salida deseada: ${category.toUpperCase()}. Extrae al menos 3 nodos de alta densidad informativa.`;

        const result = await this.callLLM({
            provider, apiKey, systemPrompt, userPrompt, responseFormat: "json_object", 
            temperature: 0.2 // Muy bajo para garantizar precisión técnica y reducir alucinación
        });

        // Registrar telemetría
        const priceMatrix = LLM_PRICING[provider] || { input: 0, output: 0 };
        const costInDollars = ((result.telemetry.tokens.prompt_tokens / 1000000) * priceMatrix.input) + 
                              ((result.telemetry.tokens.completion_tokens / 1000000) * priceMatrix.output);

        await store.dispatch({
            type: 'LOG_TELEMETRY',
            payload: { projectId: 'global', agentId: '@mestre_escola', engine: provider, actionType: 'DEEP_RESEARCH', tokens: result.telemetry.tokens, costInDollars: costInDollars, recRatio: 0, latencyMs: result.telemetry.latencyMs }
        });

        return result.content;
    }
}

export const Orchestrator = new OrchestratorCore();
