// v9/js/core/Orchestrator.js
import { store } from './store.js';
import { KB } from './kb.js';

// Matriz de Costes (USD por 1M de tokens) para Telemetría Antigravity
const LLM_PRICING = {
    'deepseek': { input: 0.14, output: 0.28 }, 
    'gemini': { input: 0.075, output: 0.30 },  
    'openai': { input: 2.50, output: 10.00 },  
    'anthropic': { input: 3.00, output: 15.00 }, 
    'custom': { input: 0.0, output: 0.0 },     
    'nano_banana': { input: 0.0, output: 0.02 }, 
    'veo': { input: 0.0, output: 0.50 }        
};

class OrchestratorCore {
    constructor() {
        this.version = "V9.0-Antigravity-Beta";
        this.isListening = false;
    }

    // ==========================================
    // 🛡️ ENRUTADOR RAG EN CASCADA (WATERFALL FALLBACK)
    // ==========================================
    _getBestProvider(preferredEngine) {
        // Cadena de supervivencia estricta: Si el preferido falla, baja por la jerarquía de calidad
        const fallbackChain = [preferredEngine, 'anthropic', 'openai', 'gemini', 'deepseek', 'custom'];
        const uniqueChain = [...new Set(fallbackChain)]; // Eliminamos duplicados

        for (const provider of uniqueChain) {
            if (provider === 'custom') return { provider: 'custom', apiKey: 'local_or_custom_mode' };
            
            const apiKey = localStorage.getItem(`tt_key_${provider}`);
            if (apiKey && apiKey.trim().length > 10) {
                return { provider, apiKey };
            }
        }
        throw new Error("[KERNEL PANIC] No hay ninguna API Key configurada en el Panteón para operar.");
    }

    // ==========================================
    // 🛡️ EL DAEMON DE USENET (ESCUCHA PASIVA P2P)
    // ==========================================
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

    // ==========================================
    // 🧠 MOTOR COGNITIVO BASE (ENRUTADOR RAG)
    // ==========================================
    async callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat = "json_object", temperature = 0.2, maxRetries = 2 }) {
        let attempt = 0; 
        let lastError = null;
        
        while (attempt <= maxRetries) {
            try {
                let textResponse = ""; 
                let tokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
                const startTime = Date.now();

                if (provider === 'gemini') {
                    const urlStr = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
                    const response = await fetch(urlStr, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            contents: [{ parts: [{ text: `${systemPrompt}\n\nINPUT:\n${userPrompt}` }] }], 
                            generationConfig: { temperature, maxOutputTokens: 8192, responseMimeType: responseFormat === "json_object" ? "application/json" : "text/plain" } 
                        })
                    });
                    
                    if (!response.ok) throw new Error(`[HTTP ${response.status}] ${await response.text()}`);
                    const data = await response.json();
                    if (!data.candidates || data.candidates.length === 0) throw new Error("Respuesta vacía.");
                    
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
                lastError = error; attempt++; 
                console.warn(`⚠️ [Orchestrator] Fallo cognitivo con ${provider} (Intento ${attempt})...`, error.message);
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
        throw new Error(`Colapso Neural: ${lastError.message}`);
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

    // ==========================================
    // 👑 BUCLE IMPERIAL 1: LA AUDITORÍA NOTARIAL (@notari_ledger)
    // ==========================================
    async notarizeWorkOrder(projectId, taskComment, socChecklist) {
        const { provider, apiKey } = this._getBestProvider('deepseek'); // Preferencia: Lógica TDD implacable

        const systemPrompt = `Eres @notari_ledger, el Juez Inmutable Antigravity. Evalúa ESTRICTAMENTE si el Entregable cumple con las Condiciones (SOCs). Devuelve ÚNICAMENTE un JSON: { "soc_id_1": true, "soc_id_2": false }\nSOCs a evaluar: ${JSON.stringify(socChecklist.map(s => ({id: s.id, text: s.text})))}`;
        const response = await this.callLLM({ provider, apiKey, systemPrompt, userPrompt: `ENTREGABLE:\n"${taskComment}"\n\nJuzga la evidencia.`, responseFormat: "json_object", temperature: 0.1 });
        this._logTelemetry(projectId, '@notari_ledger', provider, 'TDD_AUDIT', response.telemetry);
        return JSON.stringify(response.content);
    }

    // ==========================================
    // 👑 BUCLE IMPERIAL 2: EL DESTILADOR (@janitor)
    // ==========================================
    async harvestKnowledge(task, projectId) {
        try {
            const { provider, apiKey } = this._getBestProvider('gemini'); // Preferencia: Ventana de contexto rápida

            const systemPrompt = `Eres @janitor, el destilador del Learning Loop. Misión: Extraer una "Mejor Práctica" W3C. Si es trivial, devuelve {"isValuable": false}. Si es valioso, devuelve JSON: { "isValuable": boolean, "title": "Título Corto", "content": "Regla destilada...", "tags": ["tag1", "tag2"] }`;
            const response = await this.callLLM({ provider, apiKey, systemPrompt, userPrompt: `PoW:\n${task.comentario}`, responseFormat: "json_object", temperature: 0.2 });
            const result = response.content;

            if (result.isValuable) {
                await KB.init();
                await KB.saveNode({ id: `meme_evergreen_${Date.now()}`, type: 'meme', category: 'evergreen', projectId: projectId, targetId: 'global', title: `🌟 ${result.title}`, content: result.content, keywords: [...(result.tags || []), '#evergreen'] });
                this._logTelemetry(projectId, '@janitor', provider, 'HARVEST', response.telemetry);
                return result.title;
            }
            return null;
        } catch (error) { return null; }
    }

    // ==========================================
    // 👑 BUCLE IMPERIAL 3: EL ARQUITECTO (@genesi_ai)
    // ==========================================
    async designEcosystemVNA(projectName, archetypeText, vision) {
        const { provider, apiKey } = this._getBestProvider('anthropic'); // Preferencia: Claude 3.5/3.7 para VNA Sistémico

        await KB.init();
        const allSkills = await KB.getAllNodes({ category: 'skill' });
        const allSops = await KB.getAllNodes({ category: 'SOP' });
        
        const catalogContext = `
            Nodos W3C Disponibles (Úsalos si encajan en "new_memes" o "required_skills"):
            Skills: ${allSkills.slice(0,10).map(s => s.title).join(', ')}
            SOPs: ${allSops.slice(0,5).map(s => s.title).join(', ')}
        `;

        const systemPrompt = `
            Eres Master Ecosystem Architect (@genesi_ai). Forja topologías VNA (Value Network Analysis) de ALTA CALIDAD Y COHERENCIA.
            
            MANDAMIENTOS DE DISEÑO (CALIDAD ANTIGRAVITY):
            1. FLUJO ÓPTIMO DE VALOR: No recortes eslabones vitales por ahorrar tokens. Diseña el flujo exacto que garantice el éxito.
            2. INFERENCIA DE FASE: Analiza la visión del usuario y deduce en qué fase de madurez está el proyecto. Adapta las "phases" de las transacciones a esta realidad.
            3. Ikigai de Roles: Genera el "ai_prompt" para cada Rol con profundidad técnica y orientación a GTD.
            4. TDD Riguroso: Cada transacción DEBE tener una matriz "soc_checklist" (Criterios de auditoría medibles).
            
            FORMATO JSON ESTRICTO ESPERADO:
            { 
                "presentacion": "Pitch de la red y fase deducida...", 
                "tags": ["sector_x"], 
                "new_memes": [{ "id": "meme_gen_1", "category": "skill", "title": "Nombre", "content": "..." }],
                "roles": [{ "levelId": "@anxaneta", "name": "...", "fmv": 80, "multiplier": 3.0, "guardian": "explorer", "ai_prompt": "Tu Ikigai es..." }], 
                "transactions": [
                    { "id": "tx_1", "phase": "Fase_Deducida", "step_order": 1, "depends_on": [], "fromLevel": "@anxaneta", "toLevel": "@baixos", "tipo": "tangible", "template": "SOP...", "horas": 5, "required_skills": ["meme_gen_1"], "soc_checklist": [{ "text": "Validación 1" }] }
                ] 
            }
        `;

        const userPrompt = `Proyecto: ${projectName}\nArquetipo Legal: ${archetypeText}\n${catalogContext}\nVisión Fundacional:\n${vision}\n\nRECUERDA: Diseña un flujo de valor óptimo, deduciendo la fase actual del proyecto para establecer transacciones coherentes y de alta calidad.`;
        
        const response = await this.callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.2 });
        this._logTelemetry('global', '@genesi_ai', provider, 'VNA_DESIGN', response.telemetry);
        return response.content; 
    }

    // ==========================================
    // 👑 BUCLE IMPERIAL 4: EL INVESTIGADOR ACADÉMICO (@mestre_escola)
    // ==========================================
    async runDeepResearch(topic, expectedCategory, maxNodes = 3) {
        const { provider, apiKey } = this._getBestProvider('gemini'); // Preferencia: Gemini (Ventana masiva)

        const systemPrompt = `
            Eres @mestre_escola, el Investigador Ontológico y Creador de Memes W3C del Kernel.
            Se te ha pedido investigar un tema profundo. No devuelvas texto plano. Devuelve Nodos de Conocimiento (JSON-LD Semántico).
            Tu objetivo es generar "Memes" de muy alta densidad de información que los Agentes puedan usar en el futuro.
            
            FORMATO JSON ESTRICTO:
            {
                "research_summary": "Resumen ejecutivo del hallazgo...",
                "nodes": [
                    { "category": "${expectedCategory}", "title": "Nombre del concepto o habilidad...", "content": "Desarrollo técnico profundo...", "keywords": ["tag1", "tag2"] }
                ]
            }
            Genera un máximo de ${maxNodes} nodos.
        `;

        const userPrompt = `TEMA DE INVESTIGACIÓN: "${topic}"\nProcesa esto y genera los Nodos para el Meta-Grafo.`;
        const response = await this.callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.3 });
        this._logTelemetry('global', '@mestre_escola', provider, 'DEEP_RESEARCH', response.telemetry);
        
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

    // ==========================================
    // 🤖 COMUNICACIÓN P2P (USENET)
    // ==========================================
    async autoRespondUsenet(project, incomingLog, agentNode) {
        try {
            const profileEngine = agentNode.profile?.preferredEngine || 'openai';
            const { provider, apiKey } = this._getBestProvider(profileEngine); // Respeta el motor forjado en el Ikigai

            const contextStr = await this._buildLightweightContext(project.id, agentNode.id);
            const systemPrompt = `Eres ${agentNode.name}.\n\n${contextStr}\nResponde al ping del hilo con acción inmediata (GTD). No uses JSON ni markdown puro.`;
            const result = await this.callLLM({ provider, apiKey, systemPrompt, userPrompt: `Ping de ${incomingLog.authorId}: ${incomingLog.content}`, responseFormat: "text", temperature: 0.5 });
            
            await store.dispatch({ type: 'ADD_LOG_ENTRY', payload: { projectId: project.id, log: { id: 'log_' + Date.now(), date: Date.now(), authorId: agentNode.id, relatedTxHash: incomingLog.relatedTxHash, content: result.content, mentions: [incomingLog.authorId], readBy: [] } } });
            this._logTelemetry(project.id, agentNode.id, provider, 'USENET_PING', result.telemetry);
        } catch (error) { console.error(`[Usenet] Fallo P2P con ${agentNode.id}:`, error); }
    }

    // 🔥 BUCLE DE AUTO-SANACIÓN SEMÁNTICA (IKIGAI MATCHING)
    async autoHealNetwork(task, projectId) {
        try {
            const { provider, apiKey } = this._getBestProvider('deepseek'); // Preferencia: DeepSeek para análisis de SOCs

            const failedSocs = (task.soc_checklist || []).filter(s => !s.isChecked).map(s => s.text);
            if (failedSocs.length === 0) return null;

            await KB.init();
            const allPrompts = await KB.getAllNodes({ category: 'meta_prompt' }); 
            const nodeDirectory = allPrompts.map(p => ({ id: p.targetId, name: p.title, skills: p.keywords, ikigai: p.ikigai }));
            if (nodeDirectory.length === 0) return null;

            const systemPrompt = `
                Eres @seny_analyst, el auditor estratégico del Kernel V9.
                Una Work Order acaba de ser devuelta porque fracasó en la auditoría TDD (SOCs incumplidos).
                Misión: Revisa el Padrón Neuronal evaluando los 'Ikigais' y 'skills'.
                Busca al nodo más capacitado del padrón para resolver esta falla específica.
                Devuelve ÚNICAMENTE JSON: { "assignedNode": "@id_del_nodo", "reason": "Motivo corto...", "actionPlan": "Sugerencia rápida" }
                PADRÓN DISPONIBLE: ${JSON.stringify(nodeDirectory)}
            `;

            const userPrompt = `La tarea "${task.comentario.substring(0,60)}..." ha fallado los siguientes SOCs: ${JSON.stringify(failedSocs)}. ¿A qué nodo debemos invocar?`;
            const response = await this.callLLM({ provider, apiKey, systemPrompt, userPrompt, responseFormat: "json_object", temperature: 0.1 });
            const result = response.content;

            if (result.assignedNode) {
                const contentLog = `⚕️ **Protocolo de Auto-Sanación Activado.**\nLa auditoría Notarial falló en: *${failedSocs.join(', ')}*.\n\n@seny_analyst solicita asistencia de <a href="/v9/profile?id=${result.assignedNode.replace('@','')}" data-link class="mention-highlight">${result.assignedNode}</a>.\n\n**Motivo:** ${result.reason}\n**Plan:** ${result.actionPlan}`;
                await store.dispatch({ type: 'ADD_LOG_ENTRY', payload: { projectId, log: { id: 'log_heal_' + Date.now(), date: Date.now(), authorId: '@seny_analyst', relatedTxHash: task.hash || task.id, content: contentLog, mentions: [result.assignedNode, task.assigneeId], readBy: [] } } });
                this._logTelemetry(projectId, '@seny_analyst', provider, 'AUTO_HEAL', response.telemetry);
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
