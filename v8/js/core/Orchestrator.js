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
        this.version = "12.0-Telemetry";
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

        // El Gateway ahora devuelve el cerebro y los sensores completos
        return {
            content: parsedContent,
            telemetry: {
                provider,
                tokens: tokenUsage,
                latencyMs
            }
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

        // 🔥 Opcional: Aquí el Orquestador podría disparar un store.dispatch('LOG_TELEMETRY')
        // pero como "designEcosystemVNA" aún no tiene ProjectId, lo delegaremos a quien lo llame.

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

            // 🔥 Telemetría: Calculamos y guardamos el coste de forjar esta identidad
            const priceMatrix = LLM_PRICING[provider] || { input: 0, output: 0 };
            const costInDollars = ((result.telemetry.tokens.prompt_tokens / 1000000) * priceMatrix.input) + 
                                  ((result.telemetry.tokens.completion_tokens / 1000000) * priceMatrix.output);

            await store.dispatch({
                type: 'LOG_TELEMETRY',
                payload: {
                    projectId: projectId, agentId: '@genesi_ai', engine: provider, actionType: 'FORGE_IDENTITY',
                    tokens: result.telemetry.tokens, costInDollars: costInDollars,
                    recRatio: 0, // No aplica REC para forjado, solo para SOPs
                    latencyMs: result.telemetry.latencyMs
                }
            });

            forgedAgents.push({ roleId: role.id, roleName: role.name, promptId: promptNode.id });
        }

        return forgedAgents;
    }
}

export const Orchestrator = new OrchestratorCore();
