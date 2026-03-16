// v8/js/core/Orchestrator.js
import { store } from './store.js';
import { KB } from './kb.js';

class OrchestratorCore {
    constructor() {
        this.version = "10.0-Fractal";
    }

    // ==========================================
    // CAPA 1: GATEWAY NEURONAL (API Agnostic)
    // ==========================================
    async callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat = "json_object" }) {
        if (!apiKey) throw new Error("API Key requerida para el Orquestador.");
        let textResponse = "";

        if (provider === 'gemini') {
            const targetModel = 'gemini-1.5-flash';
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nINPUT DEL USUARIO:\n${userPrompt}` }] }] })
            });
            if (!response.ok) throw new Error(`Google Gemini Error: ${response.statusText}`);
            const data = await response.json();
            textResponse = data.candidates[0].content.parts[0].text;
        
        } else if (provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({ 
                    model: "gpt-4o-mini", 
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], 
                    response_format: responseFormat === "json_object" ? { type: "json_object" } : null 
                })
            });
            if (!response.ok) throw new Error(`OpenAI Error: ${response.statusText}`);
            const data = await response.json();
            textResponse = data.choices[0].message.content;
        
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
        } else {
            throw new Error(`Proveedor IA desconocido: ${provider}`);
        }

        // Limpieza de formato si se espera JSON
        if (responseFormat === "json_object") {
            textResponse = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
            const firstBrace = textResponse.indexOf('{');
            const lastBrace = textResponse.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                textResponse = textResponse.substring(firstBrace, lastBrace + 1);
            }
            return JSON.parse(textResponse);
        }

        return textResponse;
    }

    // ==========================================
    // CAPA 2: DISEÑADOR VNA (Reemplaza a ProjectCreatorView)
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

        const parsedData = await this.callLLM({
            provider, apiKey, systemPrompt, userPrompt: vision, responseFormat: "json_object"
        });

        return parsedData; // El TDD se ejecutará en la Vista o en un middleware posterior
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

        // Por cada rol en el proyecto, vamos a forjar su "Cerebro A2A"
        for (const role of project.roles) {
            // 1. Extraemos el contexto fractal de la Base de Conocimiento
            const flatContext = await KB.getAgentContextFlattened(projectId, role, project.prompt, project.archetype);

            // 2. Extraemos los SOPs específicos en los que este rol participa
            const roleFlows = project.vna_flows.filter(f => f.from === role.id || f.to === role.id);
            const flowsContext = roleFlows.map(f => `- [${f.tipo.toUpperCase()}] ${f.template} (ID: ${f.id})`).join('\n');

            // 3. Le pedimos al LLM que redacte el System Prompt definitivo y optimizado para este agente
            const systemPrompt = `Eres @genesi_ai, el Meta-Agente Forjador. Tu misión es redactar el 'System Prompt' perfecto y determinista para un nuevo agente que va a operar en la Matriz V9.`;
            const userPrompt = `
                Crea el SYSTEM PROMPT definitivo para el rol de "${role.name}" (${role.levelId}) en el proyecto "${project.nombre}".
                
                CONTEXTO ONTOLÓGICO Y SKILLS DE LA KB:
                ${flatContext}

                TUBERÍAS DE VALOR (SOPs) ASIGNADAS A ESTE ROL:
                ${flowsContext || "Aún no hay tuberías asignadas."}

                Instrucciones para el Prompt:
                Debe ser un texto en primera persona (instruyendo al agente sobre quién es y qué debe hacer). Debe ser estricto, orientado a ejecutar SOPs y cumplir SOCs (Statements of Compliance). No uses formato JSON, solo el texto puro del prompt.
            `;

            // Llamada a la IA para sintetizar el prompt
            const generatedAgentPrompt = await this.callLLM({
                provider, apiKey, systemPrompt, userPrompt, responseFormat: "text"
            });

            // 4. Guardamos este prompt optimizado en la KB para persistencia fractal
            const promptNode = await KB.saveNode({
                id: `prompt_${projectId}_${role.id}`, 
                type: 'prompt_a2a',
                projectId: projectId, 
                targetId: role.id, 
                roleTarget: role.levelId,
                title: `Prompt A2A Forjado: ${role.name}`, 
                content: generatedAgentPrompt
            });

            forgedAgents.push({
                roleId: role.id,
                roleName: role.name,
                promptId: promptNode.id
            });
        }

        return forgedAgents;
    }
}

export const Orchestrator = new OrchestratorCore();
