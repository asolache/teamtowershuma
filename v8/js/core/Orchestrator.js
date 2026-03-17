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
        this.version = "13.0-Usenet";
        this.isListening = false;
    }

    /**
     * 🔥 NUEVO (SPRINT 35): Iniciar el Daemon de Escucha
     * Se suscribe a Redux para detectar Pings a los agentes IA en tiempo real.
     */
    initUsenetDaemon() {
        if (this.isListening) return;
        this.isListening = true;
        
        console.log("📡 [Usenet Daemon] Orquestador a la escucha de Pings...");

        store.subscribe((state) => {
            if (!state.projects || state.projects.length === 0) return;
            
            // Revisar todos los proyectos buscando logs no leídos por agentes IA
            state.projects.forEach(project => {
                if (!project.logs) return;
                
                project.logs.forEach(log => {
                    // Si el log tiene menciones y NO ha sido respondido o leído por los IAs involucrados
                    if (log.mentions && log.mentions.length > 0) {
                        log.mentions.forEach(async (mentionId) => {
                            const isRead = log.readBy && log.readBy.includes(mentionId);
                            if (isRead) return; // Ya fue procesado

                            const targetNode = state.globalUsers.find(u => u.id === mentionId);
                            
                            // Si el mencionado es un Agente IA, el Daemon lo despierta
                            if (targetNode && targetNode.profile && targetNode.profile.isAi) {
                                
                                // 1. Marcar como leído inmediatamente para evitar bucles infinitos
                                store.dispatch({
                                    type: 'MARK_LOG_READ',
                                    payload: { projectId: project.id, logId: log.id, userId: targetNode.id }
                                });

                                // 2. Procesar respuesta en background
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
    // CAPA 1: GATEWAY NEURONAL (API Agnostic + Sensores de Coste)
    // ==========================================
    async callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat = "json_object" }) {
        if (!apiKey && provider !== 'custom') throw new Error("API Key requerida para el Orquestador.");
        
        let textResponse = "";
        let tokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
        const startTime = Date.now();

        if (provider === 'gemini') {
            const targetModel = 'gemini-1.5-flash';
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    contents: [{ parts: [{ text: `${systemPrompt}\n\nINPUT DEL USUARIO:\n${userPrompt}` }] }],
                    generationConfig: responseFormat === "json_object" ? { responseMimeType: "application/json" } : {}
                })
            });
            if (!response.ok) throw new Error(`Google Gemini Error: ${response.statusText}`);
            const data = await response.json();
            textResponse = data.candidates[0].content.parts[0].text;
            
            // Sensor Gemini
            if (data.usageMetadata) {
                tokenUsage.prompt_tokens = data.usageMetadata.promptTokenCount || 0;
                tokenUsage.completion_tokens = data.usageMetadata.candidatesTokenCount || 0;
                tokenUsage.total_tokens = data.usageMetadata.totalTokenCount || 0;
            }
        
        } else if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ 
                    model: "gpt-4o", 
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], 
                    response_format: responseFormat === "json_object" ? { type: "json_object" } : null 
                })
            });
            if (!response.ok) throw new Error(`OpenAI Error: ${response.statusText}`);
            const data = await response.json();
            textResponse = data.choices[0].message.content;
            
            // Sensor OpenAI
            if (data.usage) tokenUsage = data.usage;
        
        } else if (provider === 'deepseek') {
            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ 
                    model: "deepseek-chat", 
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], 
                    response_format: responseFormat === "json_object" ? { type: "json_object" } : null 
                })
            });
            if (!response.ok) throw new Error(`DeepSeek Error: ${response.statusText}`);
            const data = await response.json();
            textResponse = data.choices[0].message.content;
            
            // Sensor DeepSeek
            if (data.usage) tokenUsage = data.usage;
            
        } else {
            throw new Error(`Proveedor IA desconocido: ${provider}`);
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
            parsedContent = JSON.parse(cleanText);
        }

        return {
            content: parsedContent,
            telemetry: { provider, tokens: tokenUsage, latencyMs }
        };
    }

    // ==========================================
    // CAPA 2: DISEÑADOR VNA
    // ==========================================
    async designEcosystemVNA(projectName, archetypeText, vision, provider, apiKey) {
        const systemPrompt = `
            Actúa como un Ingeniero de Procesos y Master Ecosystem Architect, experto mundial en Value Network Analysis (VNA) y Slicing Pie. 
            Diseña una red neuronal de valor exhaustiva para el proyecto "${projectName}" (Arquetipo: "${archetypeText}").

            MINDSET DEL ARQUITECTO (ESTRICTO):
            Eres una máquina analítica de topologías de valor. Extrapola ABSOLUTAMENTE TODAS las actividades clave, modelando rigurosamente los intercambios de valor entre nodos (roles).

            INSTRUCCIONES CRÍTICAS (TDD COMPLIANCE):
            1. FASES (ERAS): "Kickoff", "Growth", "Scale", "Harvest", "Cierre".
            2. DENSIDAD (REGLA DE ORO): MÍNIMO DE 15 TRANSACCIONES. Incluye flujos "intangibles" (conocimiento, mentoría, aprobaciones) y transacciones INTERNAS cruzadas entre roles.
            3. DAG: Cada SOP debe tener un "id" único. Fases posteriores requieren "depends_on" con los IDs previos.
            4. TRÍADA DE SKILLS: Cada SOP debe tener "required_skills" con al menos 3 IDs. Declara los nuevos en "new_memes".
            5. SOCs ESTRICTOS: Cada SOP requiere un "soc_checklist" con al menos 2 criterios binarios medibles.

            ESTRUCTURA OBLIGATORIA (Solo JSON):
            {
                "presentacion": "Pitch profundo...",
                "tags": ["Sector"],
                "new_memes": [{ "id": "meme_skill_custom", "category": "skill", "title": "Skill", "content": "..." }],
                "roles": [{ "levelId": "@baixos", "name": "Ingeniero", "fmv": 60, "multiplier": 1.2, "guardian": "hephaestus" }],
                "transactions": [
                    { 
                        "id": "tx_1", "phase": "Kickoff", "step_order": 1, "depends_on": [],
                        "fromLevel": "@anxaneta", "toLevel": "@baixos", "tipo": "tangible", 
                        "template": "Arquitectura DB", "horas": 15,
                        "required_skills": ["meme_skill_lvl_anxaneta", "meme_skill_pan_creator", "meme_skill_custom"],
                        "soc_checklist": [{ "text": "Esquema documentado" }]
                    }
                ]
            }
        `;

        const result = await this.callLLM({
            provider, apiKey, systemPrompt, userPrompt: vision, responseFormat: "json_object"
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
                provider, apiKey, systemPrompt, userPrompt, responseFormat: "text"
            });

            const promptNode = await KB.saveNode({
                id: `prompt_${projectId}_${role.id}`, 
                type: 'prompt_a2a', projectId: projectId, targetId: role.id, roleTarget: role.levelId,
                title: `Prompt A2A Forjado: ${role.name}`, content: result.content
            });

            // Telemetría de Forja
            const priceMatrix = LLM_PRICING[provider] || { input: 0, output: 0 };
            const costInDollars = ((result.telemetry.tokens.prompt_tokens / 1000000) * priceMatrix.input) + 
                                  ((result.telemetry.tokens.completion_tokens / 1000000) * priceMatrix.output);

            await store.dispatch({
                type: 'LOG_TELEMETRY',
                payload: {
                    projectId: projectId, agentId: '@genesi_ai', engine: provider, actionType: 'FORGE_IDENTITY',
                    tokens: result.telemetry.tokens, costInDollars: costInDollars,
                    recRatio: 0, 
                    latencyMs: result.telemetry.latencyMs
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
            // 1. Identificar el motor configurado para este agente, o usar el por defecto
            let provider = agentNode.profile?.preferredEngine || localStorage.getItem('tt_ai_provider') || 'deepseek';
            let apiKey = localStorage.getItem(`tt_key_${provider}`);
            
            // Fallback al motor principal si el del agente no tiene llave
            if (!apiKey) {
                provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
                apiKey = localStorage.getItem(`tt_key_${provider}`);
            }
            if (!apiKey) return console.warn(`[Usenet Daemon] Abortado: No hay API Key para ${provider}.`);

            // 2. Extraer contexto (Work Order asociada si existe y el hilo de la conversación)
            let contextStr = `Ecosistema: ${project.nombre}\nPropósito: ${project.presentation || 'N/A'}\n\n`;
            
            if (incomingLog.relatedTxHash) {
                const wo = project.work_orders.find(w => w.hash === incomingLog.relatedTxHash);
                if (wo) {
                    const flow = project.vna_flows.find(f => f.id === wo.flowId);
                    contextStr += `ESTADO ACTUAL (Work Order):\n- Tarea: ${flow ? flow.template : 'Desconocida'}\n- Estado: ${wo.status}\n- SOCs: ${JSON.stringify(wo.soc_checklist)}\n\n`;
                }
            }

            // Hilo de la Usenet (los últimos 5 mensajes relacionados)
            const thread = project.logs.filter(l => l.relatedTxHash === incomingLog.relatedTxHash).slice(-5);
            contextStr += `HILO DE USENET RECIENTE:\n`;
            thread.forEach(l => {
                const author = store.getState().globalUsers.find(u => u.id === l.authorId)?.name || l.authorId;
                contextStr += `[${author}]: ${l.content}\n`;
            });

            // 3. Forjar el Alma (System Prompt)
            const systemPrompt = `
                Eres ${agentNode.name} (${agentNode.id}), un nodo operativo en la red TeamTowers V13.
                Tu arquetipo base es ${agentNode.profile?.guardian || 'desconocido'}.
                
                CONTEXTO DE LA OPERACIÓN:
                ${contextStr}
                
                Misión: Acaban de hacerte un 'Ping' (te han mencionado con @). 
                Responde al último mensaje de forma breve, profesional y accionable. Si es una auditoría de código, da feedback directo. Si es una petición, confirma recepción.
                Firma tu respuesta. Usa formato texto plano. NO uses JSON.
            `;

            // 4. Llamada Neuronal
            const result = await this.callLLM({
                provider, apiKey, systemPrompt, userPrompt: `Responde al ping en el hilo.`, responseFormat: "text"
            });

            // 5. Publicar Respuesta en el Ledger
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
                        mentions: [incomingLog.authorId], // Hacemos ping de vuelta al autor original
                        readBy: []
                    }
                }
            });

            // 6. Registrar Coste
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
