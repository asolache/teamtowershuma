// v9/js/core/Orchestrator.js
import { store } from './store.js';
import { KB } from './kb.js';

const LLM_PRICING = {
    'deepseek': { input: 0.14, output: 0.28 }, 
    'gemini': { input: 0.075, output: 0.30 },  
    'openai': { input: 2.50, output: 10.00 },  
    'anthropic': { input: 3.00, output: 15.00 }, 
    'custom': { input: 0.0, output: 0.0 }
};

class OrchestratorCore {
    constructor() {
        this.version = "V9.0-Antigravity-Beta";
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

    async callLLM({ preferredEngine = null, systemPrompt, userPrompt, responseFormat = "json_object", temperature = 0.2 }) {
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
                        const response = await fetch('https://api.anthropic.com/v1/messages', {
                            method: 'POST',
                            headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-cors-bypass': 'true' },
                            body: JSON.stringify({
                                model: 'claude-3-5-sonnet-20241022', max_tokens: 8192, temperature: temperature, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }]
                            })
                        });
                        
                        if (!response.ok) throw new Error(`[HTTP ${response.status}] ${await response.text()}`);
                        const data = await response.json();
                        textResponse = data.content[0].text;
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

    async evaluateContextForVNA(projectName, archetypeText, vision, overrideProvider = null) {
        const systemPrompt = `
            Eres @genesi_ai, Master Ecosystem Architect. Vas a aplicar Value Network Analysis (VNA).
            Eres EXTREMADAMENTE EXIGENTE y HOSTIL a la ambigüedad. Los humanos suelen dar visiones vagas.
            
            REGLA DE ORO DE SUPERVIVENCIA:
            Si el texto de la Visión tiene menos de 50 palabras, o NO detalla claramente el modelo de negocio, quién paga a quién, y qué intangibles se intercambian, ESTÁS OBLIGADO a devolver "isReady": false.
            NUNCA asumas detalles. Si falta info, genera hasta 3 preguntas quirúrgicas para el usuario.
            
            Devuelve ÚNICAMENTE un JSON estricto:
            { "isReady": boolean, "questions": ["Pregunta 1...", "Pregunta 2..."] } // Vacío solo si la visión es muy profunda y perfecta.
        `;

        const userPrompt = `Proyecto: ${projectName}\nArquetipo: ${archetypeText}\nVisión Fundacional:\n${vision}`;
        const response = await this.callLLM({ preferredEngine: overrideProvider, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.1 });
        this._logTelemetry('global', '@genesi_ai', response.telemetry.provider, 'VNA_EVALUATION', response.telemetry);
        return response.content; 
    }

    async notarizeWorkOrder(projectId, taskComment, socChecklist) {
        const systemPrompt = `Eres @notari_ledger, el Juez Inmutable Antigravity. Evalúa ESTRICTAMENTE si el Entregable cumple con las Condiciones (SOCs). Devuelve ÚNICAMENTE un JSON: { "soc_id_1": true, "soc_id_2": false }\nSOCs a evaluar: ${JSON.stringify(socChecklist.map(s => ({id: s.id, text: s.text})))}`;
        const response = await this.callLLM({ preferredEngine: 'deepseek', systemPrompt, userPrompt: `ENTREGABLE:\n"${taskComment}"\n\nJuzga la evidencia.`, responseFormat: "json_object", temperature: 0.1 });
        this._logTelemetry(projectId, '@notari_ledger', response.telemetry.provider, 'TDD_AUDIT', response.telemetry);
        return JSON.stringify(response.content);
    }

    async harvestKnowledge(task, projectId) {
        try {
            const systemPrompt = `Eres @janitor, el destilador del Learning Loop. Misión: Extraer una "Mejor Práctica" W3C. Si es trivial, devuelve {"isValuable": false}. Si es valioso, devuelve JSON: { "isValuable": boolean, "title": "Título Corto", "content": "Regla destilada...", "tags": ["tag1", "tag2"] }`;
            const response = await this.callLLM({ preferredEngine: 'gemini', systemPrompt, userPrompt: `PoW:\n${task.comentario}`, responseFormat: "json_object", temperature: 0.2 });
            const result = response.content;

            if (result.isValuable) {
                await KB.init();
                await KB.saveNode({ id: `meme_evergreen_${Date.now()}`, type: 'meme', category: 'evergreen', projectId: projectId, targetId: 'global', title: `🌟 ${result.title}`, content: result.content, keywords: [...(result.tags || []), '#evergreen'] });
                this._logTelemetry(projectId, '@janitor', response.telemetry.provider, 'HARVEST', response.telemetry);
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
            Eres Master Ecosystem Architect (@genesi_ai).
            
            Basado en tu Skill Operativa de VNA, debes seguir estrictamente estas reglas:
            ${vnaInstructions}
            
            FORMATO JSON ESTRICTO ESPERADO:
            { 
                "presentacion": "Pitch de la red y fase deducida...", 
                "tags": ["sector_x"], 
                "new_memes": [{ "id": "meme_gen_1", "category": "skill", "title": "Nombre", "content": "..." }],
                "roles": [{ "levelId": "@anxaneta", "name": "...", "fmv": 80, "multiplier": 3.0, "guardian": "explorer", "ai_prompt": "Tu Ikigai es..." }], 
                "transactions": [
                    { "id": "tx_1", "phase": "Fase", "step_order": 1, "depends_on": [], "fromLevel": "@anxaneta", "toLevel": "@baixos", "tipo": "tangible", "template": "SOP...", "horas": 5, "required_skills": ["meme_gen_1"], "soc_checklist": [{ "text": "Validación 1" }] }
                ] 
            }
        `;

        const userPrompt = `Proyecto: ${projectName}\nArquetipo Legal: ${archetypeText}\n${catalogContext}\nVisión Fundacional:\n${vision}`;
        
        const response = await this.callLLM({ preferredEngine: overrideProvider, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.2 });
        this._logTelemetry('global', '@genesi_ai', response.telemetry.provider, 'VNA_DESIGN', response.telemetry);
        return response.content; 
    }

    async runDeepResearch(topic, expectedCategory, maxNodes = 3, overrideProvider = null) {
        const systemPrompt = `
            Eres @mestre_escola, el Investigador Ontológico y Creador de Memes W3C del Kernel.
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
        this._logTelemetry('global', '@mestre_escola', response.telemetry.provider, 'DEEP_RESEARCH', response.telemetry);
        
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

    // 🔥 BUCLE DE EXPANSIÓN COGNITIVA (META-SKILL CREATOR VNA)
    async expandNodeSemantics(title, category, content, tags, overrideProvider = null) {
        const available = this._getAvailableProviders(overrideProvider || 'openai');
        const { provider, apiKey } = available[0];

        const systemPrompt = `
            Eres el "Skill Creator" del Kernel V9 (Inspirado en el estándar AgentSkills de Anthropic).
            Misión: Tomar un concepto semilla y forjar una cápsula de conocimiento altamente estructurada.
            
            SI EL NODO ES UNA "SKILL" (Categoría: skill), DEBES ESTRUCTURAR EL CONTENT ASÍ:
            
            ### 1. VNA Flow (Flujo de Valor)
            - **Inputs Requeridos (Tangibles/Intangibles):** ¿Qué necesita el agente antes de empezar? (ej: Datos en bruto, acceso a un repo, feedback del usuario).
            - **Outputs Generados (Tangibles/Intangibles):** ¿Qué devuelve a la red? (ej: Archivo JSON, código refactorizado, confianza del cliente).
            
            ### 2. SOP (Standard Operating Procedure)
            Instrucciones en imperativo. Paso a paso. Concisas y accionables. CERO teoría (la teoría va a los reference_docs). Incluye patrones y formatos de salida esperados (ej: "ALWAYS use this exact template...").
            
            ### 3. SOC (Standard Operating Conditions / Evals)
            Criterios de éxito y aserciones TDD. Lista de verificación medible que un agente evaluador (Grader) pueda usar para aprobar o rechazar el trabajo resultante.
            
            REGLA DE REVELACIÓN PROGRESIVA (Progressive Disclosure):
            Si la Skill requiere teoría, ejemplos largos, metodologías de respaldo o historia, NO lo pongas en el "content". Extráelo y mételo en el array JSON "reference_docs" para que se guarden como archivos separados.
            
            Devuelve ÚNICAMENTE JSON estricto: 
            { 
                "title": "Título Mejorado", 
                "description": "Resumen indexable corto para enrutamiento RAG (Explica CUÁNDO debe usarse esta skill)...", 
                "content": "Estructura VNA Flow + SOP + SOC en Markdown...", 
                "keywords": ["tag1", "tag2"],
                "reference_docs": [ { "title": "Referencia 1", "description": "Breve resumen", "content": "Teoría profunda en Markdown..." } ]
            }
        `;

        const userPrompt = `Título Original: ${title}\nCategoría: ${category}\nTags Actuales: ${tags}\nContenido Semilla:\n${content}`;
        
        const response = await this.callLLM({ preferredEngine: provider, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.4 });
        this._logTelemetry('global', '@mestre_escola', provider, 'KNOWLEDGE_EXPANSION', response.telemetry);
        
        return response.content;
    }

    async autoRespondUsenet(project, incomingLog, agentNode) {
        try {
            const preferredEngine = agentNode.profile?.preferredEngine || null;
            const contextStr = await this._buildLightweightContext(project.id, agentNode.id);
            const systemPrompt = `Eres ${agentNode.name}.\n\n${contextStr}\nResponde al ping del hilo con acción inmediata (GTD). No uses JSON ni markdown puro.`;
            const result = await this.callLLM({ preferredEngine, systemPrompt, userPrompt: `Ping de ${incomingLog.authorId}: ${incomingLog.content}`, responseFormat: "text", temperature: 0.5 });
            
            await store.dispatch({ type: 'ADD_LOG_ENTRY', payload: { projectId: project.id, log: { id: 'log_' + Date.now(), date: Date.now(), authorId: agentNode.id, relatedTxHash: incomingLog.relatedTxHash, content: result.content, mentions: [incomingLog.authorId], readBy: [] } } });
            this._logTelemetry(project.id, agentNode.id, result.telemetry.provider, 'USENET_PING', result.telemetry);
        } catch (error) { console.error(`[Usenet] Fallo P2P con ${agentNode.id}:`, error); }
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
                Eres @seny_analyst. Una Work Order falló en la auditoría TDD. Busca al nodo más capacitado del padrón para resolver esta falla.
                Devuelve ÚNICAMENTE JSON: { "assignedNode": "@id_del_nodo", "reason": "Motivo corto...", "actionPlan": "Sugerencia rápida" }
                PADRÓN DISPONIBLE: ${JSON.stringify(nodeDirectory)}
            `;

            const userPrompt = `La tarea "${task.comentario.substring(0,60)}..." falló los SOCs: ${JSON.stringify(failedSocs)}. ¿A qué nodo invocamos?`;
            const response = await this.callLLM({ preferredEngine: 'deepseek', systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.1 });
            const result = response.content;

            if (result.assignedNode) {
                const contentLog = `⚕️ **Protocolo de Auto-Sanación Activado.**\nLa auditoría Notarial falló en: *${failedSocs.join(', ')}*.\n\n@seny_analyst solicita asistencia de <a href="/v9/profile?id=${result.assignedNode.replace('@','')}" data-link class="mention-highlight">${result.assignedNode}</a>.\n\n**Motivo:** ${result.reason}\n**Plan:** ${result.actionPlan}`;
                await store.dispatch({ type: 'ADD_LOG_ENTRY', payload: { projectId, log: { id: 'log_heal_' + Date.now(), date: Date.now(), authorId: '@seny_analyst', relatedTxHash: task.hash || task.id, content: contentLog, mentions: [result.assignedNode, task.assigneeId], readBy: [] } } });
                this._logTelemetry(projectId, '@seny_analyst', response.telemetry.provider, 'AUTO_HEAL', response.telemetry);
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
        const priceMatrix = LLM_PRICING[engine] || { input: 0, output: 0 };
        const costInDollars = ((telemetryData.tokens.prompt_tokens / 1000000) * priceMatrix.input) + ((telemetryData.tokens.completion_tokens / 1000000) * priceMatrix.output);
        store.dispatch({ type: 'LOG_TELEMETRY', payload: { projectId, agentId, engine, actionType, tokens: telemetryData.tokens, costInDollars, recRatio: 0, latencyMs: telemetryData.latencyMs } });
    }
}
export const Orchestrator = new OrchestratorCore();
