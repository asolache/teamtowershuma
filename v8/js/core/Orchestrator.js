// v8/js/core/Orchestrator.js
import { store } from './store.js';
import { KB } from './kb.js';

// DICCIONARIO DE TOKENOMICS (Precios por 1 Millón de Tokens)
const LLM_PRICING = {
    'deepseek': { input: 0.14, output: 0.28 },
    'gemini': { input: 0.075, output: 0.30 },
    'openai': { input: 0.15, output: 0.60 },
    'anthropic': { input: 3.00, output: 15.00 },
    'custom': { input: 0.0, output: 0.0 } // Zero Cost Local
};

class OrchestratorCore {
    constructor() {
        this.version = "13.5-Resilience";
        this.isListening = false;
    }

    initUsenetDaemon() {
        if (this.isListening) return;
        this.isListening = true;
        
        console.log("📡 [Usenet Daemon] Orquestador a la escucha de Pings...");

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
                                store.dispatch({
                                    type: 'MARK_LOG_READ',
                                    payload: { projectId: project.id, logId: log.id, userId: targetNode.id }
                                });

                                console.log(`⚡ [Usenet Daemon] Despertando agente ${targetNode.id} para responder a log ${log.id}`);
                                await this.autoRespondUsenet(project, log, targetNode);
                            }
                        });
                    }
                });
            });
        });
    }

    // ==========================================
    // CAPA 1: GATEWAY NEURONAL (Auto-Retries + Temperature)
    // ==========================================
    async callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat = "json_object", temperature = 0.2, maxRetries = 2 }) {
        if (!apiKey && provider !== 'custom') throw new Error("API Key requerida para el Orquestador.");
        
        let attempt = 0;
        let lastError = null;

        while (attempt <= maxRetries) {
            try {
                let textResponse = "";
                let tokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
                const startTime = Date.now();

                if (provider === 'gemini') {
                    const targetModel = 'gemini-1.5-flash';
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            contents: [{ parts: [{ text: `${systemPrompt}\n\nINPUT DEL USUARIO:\n${userPrompt}` }] }],
                            generationConfig: { 
                                temperature: temperature,
                                responseMimeType: responseFormat === "json_object" ? "application/json" : "text/plain"
                            }
                        })
                    });
                    if (!response.ok) throw new Error(`Google Gemini Error: ${response.statusText}`);
                    const data = await response.json();
                    textResponse = data.candidates[0].content.parts[0].text;
                    
                    if (data.usageMetadata) {
                        tokenUsage.prompt_tokens = data.usageMetadata.promptTokenCount || 0;
                        tokenUsage.completion_tokens = data.usageMetadata.candidatesTokenCount || 0;
                        tokenUsage.total_tokens = data.usageMetadata.totalTokenCount || 0;
                    }
                
                } else if (provider === 'openai' || provider === 'deepseek') {
                    const endpoint = provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://api.deepseek.com/chat/completions';
                    const modelName = provider === 'openai' ? "gpt-4o" : "deepseek-chat";
                    
                    const response = await fetch(endpoint, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ 
                            model: modelName, 
                            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], 
                            temperature: temperature,
                            response_format: responseFormat === "json_object" ? { type: "json_object" } : null 
                        })
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
                    const firstBrace = cleanText.indexOf('{');
                    const lastBrace = cleanText.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1) {
                        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
                    }
                    // Validamos que el JSON no esté roto. Si lo está, saltará al catch y reintentará.
                    parsedContent = JSON.parse(cleanText);
                }

                return { content: parsedContent, telemetry: { provider, tokens: tokenUsage, latencyMs } };

            } catch (error) {
                lastError = error;
                attempt++;
                console.warn(`⚠️ [Orquestador] Fallo en intento ${attempt}/${maxRetries + 1}. Reintentando en 1s... Error:`, error.message);
                await new Promise(r => setTimeout(r, 1000)); // Esperar 1s antes del retry
            }
        }
        
        throw new Error(`Fallo tras ${maxRetries + 1} intentos. Último error: ${lastError.message}`);
    }

    // ==========================================
    // CAPA 2: DISEÑADOR VNA (Prompt Ingeniería Militar)
    // ==========================================
    async designEcosystemVNA(projectName, archetypeText, vision, provider, apiKey) {
        const systemPrompt = `
Eres el Master Ecosystem Architect de TeamTowers V13. Tu única función es diseñar arquitecturas VNA (Value Network Analysis) devolviendo EXCLUSIVAMENTE un objeto JSON válido y estricto. Cero charla. Cero markdown.

MANDAMIENTOS DE ARQUITECTURA (TDD):
1. DEBES crear un MÍNIMO de 12 transacciones (tuberías de valor).
2. Las transacciones DEBEN distribuirse lógicamente en 5 ERAS secuenciales: "Kickoff", "Growth", "Scale", "Harvest", "Cierre".
3. Lógica DAG estricta: Las transacciones de "Kickoff" NO tienen "depends_on" (array vacío []). Cualquier transacción en "Growth" o posterior DEBE tener en su "depends_on" el ID ("tx_N") de una transacción anterior.
4. Tipo de Valor: Al menos el 30% de las transacciones deben ser "intangible" (Mentoria, auditoría, soporte). El resto "tangible" (código, diseño, entregable).
5. Tríada de Skills: Cada transacción DEBE tener exactamente 3 IDs de skills en "required_skills".
6. Auditoría SOC: Cada transacción DEBE incluir al menos 2 validaciones en "soc_checklist" que respondan a la pregunta: "¿Cómo audito matemáticamente este entregable?".

ESTRUCTURA JSON EXACTA REQUERIDA (FEW-SHOT EXAMPLE):
{
  "presentacion": "El manifiesto del proyecto...",
  "tags": ["Tech", "Blockchain"],
  "new_memes": [
    { "id": "meme_skill_react", "category": "skill", "title": "React JS", "content": "Dominio de componentes funcionales" }
  ],
  "roles": [
    { "levelId": "@anxaneta", "name": "Arquitecto Visionario", "fmv": 80, "multiplier": 3.0, "guardian": "explorer", "ai_prompt": "Eres el líder..." },
    { "levelId": "@baixos", "name": "Ingeniero Core", "fmv": 50, "multiplier": 1.2, "guardian": "hephaestus", "ai_prompt": "Eres un dev..." }
  ],
  "transactions": [
    { 
      "id": "tx_1", "phase": "Kickoff", "step_order": 1, "depends_on": [],
      "fromLevel": "@anxaneta", "toLevel": "@baixos", "tipo": "intangible", 
      "template": "Definición de Arquitectura Base", "horas": 5,
      "required_skills": ["meme_skill_react", "meme_sys_arch", "meme_comms"],
      "soc_checklist": [{ "text": "El diagrama de arquitectura cubre todos los endpoints" }, { "text": "Base de datos normalizada en 3NF" }]
    },
    { 
      "id": "tx_2", "phase": "Growth", "step_order": 2, "depends_on": ["tx_1"],
      "fromLevel": "@baixos", "toLevel": "@anxaneta", "tipo": "tangible", 
      "template": "Despliegue de Backend MVP", "horas": 20,
      "required_skills": ["meme_skill_react", "meme_soc_clean_code", "meme_tdd"],
      "soc_checklist": [{ "text": "El código pasa los lint tests" }, { "text": "Cero dependencias circulares" }]
    }
  ]
}

REGLA DE ORO: Utiliza roles estándar ("@anxaneta", "@aixecador", "@dosos", "@baixos", "@pinya") en "levelId", "fromLevel" y "toLevel". NUNCA te inventes levelIds.
`;

        const result = await this.callLLM({
            provider, 
            apiKey, 
            systemPrompt, 
            userPrompt: `Proyecto: ${projectName}\nArquetipo: ${archetypeText}\nVisión: ${vision}`, 
            responseFormat: "json_object",
            temperature: 0.1 // 🔥 Razón Fría: Máximo determinismo para no romper el TDD
        });

        return result.content; 
    }

    // ==========================================
    // CAPA 3: LA FORJA FRACTAL (Agentes Autónomos)
    // ==========================================
    async forgeProjectColla(projectId, provider, apiKey) {
        await KB.init();
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) throw new Error("Proyecto no encontrado en el Kernel.");

        const forgedAgents = [];

        for (const role of project.roles) {
            const flatContext = await KB.getAgentContextFlattened(projectId, role, project.prompt, project.archetype);
            const roleFlows = project.vna_flows.filter(f => f.from === role.id || f.to === role.id);
            const flowsContext = roleFlows.map(f => `- [${f.tipo.toUpperCase()}] ${f.template} (ID: ${f.id})`).join('\n');

            const systemPrompt = `Eres @genesi_ai, el Meta-Agente Forjador. Tu misión es redactar el 'System Prompt' perfecto y determinista para un nuevo agente que va a operar en la Matriz V9.`;
            const userPrompt = `
                Crea el SYSTEM PROMPT definitivo para el rol de "${role.name}" (${role.levelId}) en el proyecto "${project.nombre}".
                
                CONTEXTO ONTOLÓGICO Y SKILLS DE LA KB:
                ${flatContext}

                TUBERÍAS DE VALOR (SOPs) ASIGNADAS A ESTE ROL:
                ${flowsContext || "Aún no hay tuberías asignadas."}

                Instrucciones: Debe ser un texto en primera persona. Estricto, orientado a ejecutar SOPs y cumplir SOCs. No uses formato JSON.
            `;

            const result = await this.callLLM({
                provider, apiKey, systemPrompt, userPrompt, responseFormat: "text", temperature: 0.4
            });

            const promptNode = await KB.saveNode({
                id: `prompt_${projectId}_${role.id}`, 
                type: 'prompt_a2a', projectId: projectId, targetId: role.id, roleTarget: role.levelId,
                title: `Prompt A2A Forjado: ${role.name}`, content: result.content
            });

            const priceMatrix = LLM_PRICING[provider] || { input: 0, output: 0 };
            const costInDollars = ((result.telemetry.tokens.prompt_tokens / 1000000) * priceMatrix.input) + 
                                  ((result.telemetry.tokens.completion_tokens / 1000000) * priceMatrix.output);

            await store.dispatch({
                type: 'LOG_TELEMETRY',
                payload: {
                    projectId: projectId, agentId: '@genesi_ai', engine: provider, actionType: 'FORGE_IDENTITY',
                    tokens: result.telemetry.tokens, costInDollars: costInDollars, recRatio: 0, latencyMs: result.telemetry.latencyMs
                }
            });

            forgedAgents.push({ roleId: role.id, roleName: role.name, promptId: promptNode.id });
        }

        return forgedAgents;
    }

    // ==========================================
    // CAPA 4: USENET DAEMON (Auto-Respuesta A2A)
    // ==========================================
    async autoRespondUsenet(project, incomingLog, agentNode) {
        try {
            let provider = agentNode.profile?.preferredEngine || localStorage.getItem('tt_ai_provider') || 'deepseek';
            let apiKey = localStorage.getItem(`tt_key_${provider}`);
            
            if (!apiKey) {
                provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
                apiKey = localStorage.getItem(`tt_key_${provider}`);
            }
            if (!apiKey) return console.warn(`[Usenet Daemon] Abortado: No hay API Key para ${provider}.`);

            let contextStr = `Ecosistema: ${project.nombre}\nPropósito: ${project.presentation || 'N/A'}\n\n`;
            
            if (incomingLog.relatedTxHash) {
                const wo = project.work_orders.find(w => w.hash === incomingLog.relatedTxHash);
                if (wo) {
                    const flow = project.vna_flows.find(f => f.id === wo.flowId);
                    contextStr += `ESTADO ACTUAL (Work Order):\n- Tarea: ${flow ? flow.template : 'Desconocida'}\n- Estado: ${wo.status}\n- SOCs: ${JSON.stringify(wo.soc_checklist)}\n\n`;
                }
            }

            const thread = project.logs.filter(l => l.relatedTxHash === incomingLog.relatedTxHash).slice(-5);
            contextStr += `HILO DE USENET RECIENTE:\n`;
            thread.forEach(l => {
                const author = store.getState().globalUsers.find(u => u.id === l.authorId)?.name || l.authorId;
                contextStr += `[${author}]: ${l.content}\n`;
            });

            const systemPrompt = `
                Eres ${agentNode.name} (${agentNode.id}), un nodo operativo en la red TeamTowers V13.
                Tu arquetipo base es ${agentNode.profile?.guardian || 'desconocido'}.
                
                CONTEXTO DE LA OPERACIÓN:
                ${contextStr}
                
                Misión: Acaban de hacerte un 'Ping' (te han mencionado con @). 
                Responde al último mensaje de forma breve, profesional y accionable. Si es una auditoría de código, da feedback directo. Si es una petición, confirma recepción.
                Firma tu respuesta. Usa formato texto plano o HTML básico (puedes usar listas <ul>, <b>). NO uses formato JSON. NUNCA respondas con bloques de markdown \`\`\`.
            `;

            const result = await this.callLLM({
                provider, apiKey, systemPrompt, userPrompt: `Responde al ping de ${incomingLog.authorId}.`, responseFormat: "text",
                temperature: 0.7 // 🔥 Razón Caliente: Creatividad y empatía para conversar en la Usenet
            });

            await store.dispatch({
                type: 'ADD_LOG_ENTRY',
                payload: {
                    projectId: project.id,
                    log: {
                        id: 'log_' + Date.now(),
                        date: Date.now(),
                        authorId: agentNode.id,
                        relatedTxHash: incomingLog.relatedTxHash,
                        content: result.content,
                        mentions: [incomingLog.authorId], 
                        readBy: []
                    }
                }
            });

            const priceMatrix = LLM_PRICING[provider] || { input: 0, output: 0 };
            const costInDollars = ((result.telemetry.tokens.prompt_tokens / 1000000) * priceMatrix.input) + 
                                  ((result.telemetry.tokens.completion_tokens / 1000000) * priceMatrix.output);

            await store.dispatch({
                type: 'LOG_TELEMETRY',
                payload: {
                    projectId: project.id, agentId: agentNode.id, engine: provider, actionType: 'USENET_PING',
                    tokens: result.telemetry.tokens, costInDollars: costInDollars, recRatio: 0, latencyMs: result.telemetry.latencyMs
                }
            });

        } catch (error) {
            console.error(`[Usenet Daemon] Fallo al responder con ${agentNode.id}:`, error);
        }
    }
}

export const Orchestrator = new OrchestratorCore();
