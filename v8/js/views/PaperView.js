// v8/js/views/PaperView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js'; 
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';

export default class PaperView {
    constructor() {
        document.title = "Paper | TeamTowers V9";
        this.activeProjectId = null;
        
        // Estado del Pomodoro
        this.timer = null;
        this.timeLeft = 25 * 60; 
        this.isWorking = true; 
        this.timerRunning = false;
    }

    async getHtml() {
        const state = store.getState();
        let project = state.projects.find(p => p.id === localStorage.getItem('tt_active_project'));
        if (!project && state.projects.length > 0) project = state.projects[state.projects.length - 1];

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/paper')}
                    <main class="workspace" style="justify-content:center; align-items:center;">
                        <div class="glass-panel" style="text-align:center;">
                             <h2 style="color:white;">Sin Ecosistema Activo</h2>
                             <p style="color:var(--text-muted);">Instancia o selecciona un proyecto para acceder al Paper.</p>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/paper')}
                </div>
            `;
        }

        const headerConfig = {
            title: "Flow Workspace (Paper)",
            subtitle: project.nombre,
            tagline: "Terminal hipertextual. Habla con @cap_de_colla para orquestar Work Orders y SOCs en tiempo real.",
            actionHtml: `<div class="status-badge" style="background: rgba(224,64,251, 0.1); border: 1px solid var(--accent-purple); color: var(--accent-purple); padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">🧠 Cap de Colla Activo</div>`
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .paper-workspace { display: flex; flex-direction: column; flex: 1; padding: 1.5rem 2rem; overflow: hidden; height: 100%; box-sizing: border-box; }
                
                .main-layout { display: flex; gap: 1.5rem; flex: 1; overflow: hidden; }
                
                /* PANEL IZQUIERDO: DEEP WORK & POMODORO */
                .focus-panel { width: 300px; background: rgba(10,10,15,0.8); border: 1px solid var(--glass-border); border-radius: 20px; padding: 20px; display: flex; flex-direction: column; align-items: center; box-shadow: inset 0 0 30px rgba(0,0,0,0.5); z-index: 10;}
                .timer-display { font-size: 4.5rem; font-family: var(--font-mono); font-weight: 900; margin: 20px 0; color: white; text-shadow: 0 0 20px rgba(255,255,255,0.2); transition: color 0.3s;}
                .timer-display.work-mode { color: var(--accent-green); text-shadow: 0 0 30px rgba(0,230,118,0.4); }
                .timer-display.break-mode { color: var(--accent-blue); text-shadow: 0 0 30px rgba(0,176,255,0.4); }
                .timer-status { font-size: 1rem; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px; color: var(--text-muted);}
                
                .timer-controls { display: flex; gap: 10px; width: 100%; }
                .btn-timer { flex: 1; padding: 12px; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 0.9rem;}
                .btn-start { background: rgba(0,230,118,0.2); color: var(--accent-green); border: 1px solid var(--accent-green);}
                .btn-start:hover { background: var(--accent-green); color: black; }
                .btn-pause { background: rgba(255,171,64,0.2); color: var(--accent-orange); border: 1px solid var(--accent-orange);}
                .btn-reset { background: rgba(255,255,255,0.1); color: white; border: 1px solid #555;}

                /* PANEL CENTRAL: EL LOG HIPERTEXTUAL */
                .log-panel { flex: 1; background: #050508; border: 1px solid var(--glass-border); border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; position: relative;}
                .log-feed { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px;}
                
                .log-block { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; line-height: 1.5; color: #ddd; font-size: 0.95rem; animation: fadeIn 0.3s ease-out;}
                .log-block.system { border-left: 3px solid #555; font-style: italic; color: #888; background: transparent; padding: 10px 15px;}
                .log-block.ai-msg { border-left: 4px solid var(--accent-purple); background: linear-gradient(90deg, rgba(224,64,251,0.05) 0%, transparent 100%);}
                
                .log-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.8rem; font-weight: bold;}
                .log-sender { color: white; display: flex; align-items: center; gap: 5px;}
                .log-time { color: #666; font-family: var(--font-mono);}

                /* MOTOR HIPERTEXTUAL (MAGIA W3C) */
                .entity-link { color: var(--accent-blue); background: rgba(0,176,255,0.1); padding: 2px 6px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s; text-decoration: none;}
                .entity-link:hover { background: var(--accent-blue); color: black;}
                .knowledge-link { color: var(--accent-green); background: rgba(0,230,118,0.1); padding: 2px 6px; border-radius: 6px; font-weight: bold; font-family: var(--font-mono); cursor: pointer; transition: 0.2s; text-decoration: none;}
                .knowledge-link:hover { background: var(--accent-green); color: black;}

                /* ZONA DE INPUT */
                .input-area { padding: 20px; background: rgba(10,10,15,0.9); border-top: 1px solid #222; display: flex; gap: 15px; align-items: flex-end;}
                .paper-input { flex: 1; background: #050508; border: 1px solid #444; color: white; padding: 15px; border-radius: 12px; font-family: inherit; font-size: 1rem; resize: none; min-height: 50px; max-height: 150px; outline: none; transition: 0.2s;}
                .paper-input:focus { border-color: var(--accent-purple); box-shadow: 0 0 15px rgba(224,64,251,0.2);}
                .btn-send { background: var(--accent-purple); color: black; border: none; width: 50px; height: 50px; border-radius: 12px; font-size: 1.5rem; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: 0.2s; font-weight: bold;}
                .btn-send:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(224,64,251,0.4);}

                .typing-indicator { display: none; padding: 10px 20px; color: var(--accent-purple); font-weight: bold; font-style: italic; font-size: 0.85rem; background: rgba(0,0,0,0.5); align-items: center; gap: 10px;}
                .typing-dots::after { content: '...'; animation: typing 1.5s infinite;}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes typing { 0% { content: '.'; } 33% { content: '..'; } 66% { content: '...'; } }

                @media (max-width: 900px) {
                    .main-layout { flex-direction: column; }
                    .focus-panel { width: 100%; height: auto; flex-direction: row; flex-wrap: wrap; justify-content: space-between; padding: 15px;}
                    .timer-display { font-size: 2.5rem; margin: 0; }
                    .timer-status { margin: 0; }
                    .timer-controls { width: auto; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/paper')}
                <main class="paper-workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="main-layout">
                        <aside class="focus-panel">
                            <div class="timer-status" id="timerStatus">Modo Enfoque</div>
                            <div class="timer-display work-mode" id="timerDisplay">25:00</div>
                            <div class="timer-controls">
                                <button class="btn-timer btn-start" id="btnTimerStart">▶ Iniciar</button>
                                <button class="btn-timer btn-pause" id="btnTimerPause" style="display:none;">⏸ Pausa</button>
                                <button class="btn-timer btn-reset" id="btnTimerReset">⏹ Reset</button>
                            </div>
                            
                            <div style="width: 100%; height: 1px; background: #333; margin: 30px 0;"></div>
                            
                            <div style="width:100%;">
                                <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 10px; font-weight: bold;">Guía Hipertextual</div>
                                <div style="font-size: 0.85rem; color: #aaa; margin-bottom: 8px;">Usa <strong style="color:var(--accent-blue);">@</strong> para invocar Agentes/Roles (ej: @cap_de_colla).</div>
                                <div style="font-size: 0.85rem; color: #aaa;">Usa <strong style="color:var(--accent-green);">#</strong> para enlazar Skills W3C (ej: #Agile).</div>
                            </div>
                        </aside>

                        <section class="log-panel">
                            <div class="log-feed" id="logFeed"></div>
                            
                            <div class="typing-indicator" id="typingIndicator">
                                🤖 Analizando flujos de valor y dependencias <span class="typing-dots"></span>
                            </div>

                            <div class="input-area">
                                <textarea id="paperInput" class="paper-input" placeholder="Ej: @cap_de_colla instánciame la Work Order del Frontend de @baixos..."></textarea>
                                <button class="btn-send" id="btnSendPaper">➤</button>
                            </div>
                        </section>
                    </div>
                </main>
                ${BottomNav.getHtml('/paper')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        const state = store.getState();
        let project = state.projects.find(p => p.id === localStorage.getItem('tt_active_project'));
        if (!project && state.projects.length > 0) project = state.projects[state.projects.length - 1];
        if (!project) return;
        this.activeProjectId = project.id;
        
        if (!project.logs) {
            project.logs = [{ id: 'log_0', text: "Bienvenido al Paper. El ecosistema está listo para la instanciación de conocimiento y tareas.", sender: "system", timestamp: Date.now() }];
            await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: project.id, updates: { logs: project.logs } } });
        }

        this.dom = {
            timerDisplay: document.getElementById('timerDisplay'),
            timerStatus: document.getElementById('timerStatus'),
            btnStart: document.getElementById('btnTimerStart'),
            btnPause: document.getElementById('btnTimerPause'),
            btnReset: document.getElementById('btnTimerReset'),
            logFeed: document.getElementById('logFeed'),
            input: document.getElementById('paperInput'),
            btnSend: document.getElementById('btnSendPaper'),
            typingIndicator: document.getElementById('typingIndicator')
        };

        this.initPomodoro();
        this.renderLogs(project.logs);

        this.dom.btnSend.addEventListener('click', () => this.handleUserSubmit());
        this.dom.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserSubmit();
            }
        });
    }

    parseHypertext(text) {
        let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        safeText = safeText.replace(/@([a-zA-Z0-9_]+)/g, '<span class="entity-link" data-id="@$1">@$1</span>');
        safeText = safeText.replace(/#([a-zA-Z0-9_]+)/g, '<span class="knowledge-link" data-id="#$1">#$1</span>');
        return safeText.replace(/\n/g, '<br>');
    }

    renderLogs(logs) {
        this.dom.logFeed.innerHTML = '';
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const me = state.globalUsers.find(u => u.id === activeUserId)?.name || 'Usuario';

        logs.forEach(log => {
            const el = document.createElement('div');
            if (log.sender === 'system') {
                el.className = 'log-block system';
                el.innerHTML = this.parseHypertext(log.text);
            } else {
                const isAI = log.sender === '@cap_de_colla' || log.sender.startsWith('@');
                el.className = `log-block ${isAI ? 'ai-msg' : ''}`;
                const timeStr = new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                const icon = isAI ? '🤖' : '👤';
                const displayName = log.sender === activeUserId ? me : log.sender;

                el.innerHTML = `
                    <div class="log-header">
                        <span class="log-sender">${icon} ${displayName}</span>
                        <span class="log-time">${timeStr}</span>
                    </div>
                    <div class="log-content">${this.parseHypertext(log.text)}</div>
                `;
            }
            this.dom.logFeed.appendChild(el);
        });
        this.dom.logFeed.scrollTop = this.dom.logFeed.scrollHeight;
    }

    async handleUserSubmit() {
        const text = this.dom.input.value.trim();
        if (!text) return;

        const state = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        
        const newLog = { id: 'log_' + Date.now(), text: text, sender: state.session.activeUserId, timestamp: Date.now() };
        const updatedLogs = [...(project.logs || []), newLog];
        
        await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: project.id, updates: { logs: updatedLogs } } });
        this.dom.input.value = '';
        this.renderLogs(updatedLogs);

        // Disparo de IA si se menciona a cualquier agente global
        if (text.includes('@')) {
            this.triggerAgenticAction(text, updatedLogs, project);
        }
    }

    // ==========================================
    // ACTION PARSER TRANSACTIVO (NLP a REDUX)
    // ==========================================
    async triggerAgenticAction(userMessage, currentLogs, project) {
        this.dom.typingIndicator.style.display = 'flex';
        this.dom.logFeed.scrollTop = this.dom.logFeed.scrollHeight;

        const provider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        let apiKey = localStorage.getItem(`tt_key_${provider}`) || '';

        if (!apiKey && provider !== 'custom') {
            this.dom.typingIndicator.style.display = 'none';
            this.addSystemLog("⚠️ Error: Configura una API Key en el menú de Creación de Proyecto para usar comandos de IA.");
            return;
        }

        // 1. Extraer Contexto Crítico del Ecosistema para 100% SOC Compliance
        const activeFlows = project.vna_flows.map(f => ({ id: f.id, from: f.from, to: f.to, template: f.template, skills: f.required_skills }));
        const activeRoles = project.roles.map(r => ({ id: r.id, levelId: r.levelId, name: r.name }));
        
        const systemPrompt = `
            Eres @cap_de_colla, el Orquestador del ecosistema TeamTowers V9. Tu objetivo es 100% SOC Compliance.
            NO alucines roles ni flujos. Analiza la petición del usuario y compárala con el estado actual del proyecto.

            ESTADO DEL PROYECTO (ID: ${project.id}):
            Sprints Activo: ${project.activeSprintId}
            Roles Existentes: ${JSON.stringify(activeRoles)}
            Tuberías de Valor (Flows): ${JSON.stringify(activeFlows)}

            INSTRUCCIONES:
            1. Entiende el comando del usuario.
            2. Si te pide asignar una tarea o "Work Order", busca el "flow.id" en el estado que coincida.
            3. Devuelve SIEMPRE un objeto JSON estricto con dos claves: "reply" y "actions".
            
            FORMATO JSON OBLIGATORIO:
            {
                "reply": "Tu respuesta en lenguaje natural, usando @ para roles y # para skills.",
                "actions": [
                    {
                        "type": "SPAWN_WORK_ORDER",
                        "payload": {
                            "projectId": "${project.id}",
                            "workOrder": {
                                "hash": "wo_auto_...",
                                "flowId": "ID_DEL_FLOW_AQUI",
                                "status": "theoretical",
                                "comentario": "SOP: ... | SOCs: ..."
                            }
                        }
                    }
                ]
            }
            Si no hay acción que ejecutar en el store, deja "actions" como un array vacío [].
        `;

        try {
            let textResponse = "";
            const payload = { model: provider === 'openai' ? 'gpt-4o-mini' : 'deepseek-chat', messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }], response_format: { type: "json_object" }};
            const endpoint = provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://api.deepseek.com/chat/completions';

            const response = await fetch(endpoint, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) throw new Error("API Error");
            const data = await response.json();
            textResponse = data.choices[0].message.content;

            const parsedResponse = JSON.parse(textResponse.replace(/```json/gi, '').replace(/```/g, '').trim());

            // 2. Despachar Acciones Reales al Store (Magia 100% SOC)
            if (parsedResponse.actions && parsedResponse.actions.length > 0) {
                for (const action of parsedResponse.actions) {
                    await store.dispatch(action); // <--- TRANSACCIÓN DIRECTA AL KERNEL
                }
                this.addSystemLog(`⚡ Transacción ejecutada exitosamente: ${parsedResponse.actions.length} acciones despachadas al Kanban/Ledger.`);
            }

            // 3. Imprimir la respuesta de la IA en el Log
            const aiLog = { id: 'log_' + Date.now(), text: parsedResponse.reply, sender: '@cap_de_colla', timestamp: Date.now() };
            const finalLogs = [...store.getState().projects.find(p => p.id === this.activeProjectId).logs, aiLog];
            
            await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: project.id, updates: { logs: finalLogs } } });
            this.renderLogs(finalLogs);

        } catch (error) {
            console.error("Error en Action Parser:", error);
            this.addSystemLog("⚠️ @cap_de_colla encontró una anomalía al procesar el JSON transaccional. Comprueba la API.");
        } finally {
            this.dom.typingIndicator.style.display = 'none';
        }
    }

    // ==========================================
    // MOTOR DE DEEP WORK (POMODORO)
    // ==========================================
    initPomodoro() {
        this.updateTimerDisplay();

        this.dom.btnStart.addEventListener('click', () => {
            if (!this.timerRunning) {
                this.timerRunning = true;
                this.dom.btnStart.style.display = 'none';
                this.dom.btnPause.style.display = 'block';
                this.timer = setInterval(() => {
                    this.timeLeft--;
                    this.updateTimerDisplay();
                    if (this.timeLeft <= 0) this.switchPomodoroMode();
                }, 1000);
            }
        });

        this.dom.btnPause.addEventListener('click', () => {
            this.timerRunning = false;
            clearInterval(this.timer);
            this.dom.btnPause.style.display = 'none';
            this.dom.btnStart.style.display = 'block';
        });

        this.dom.btnReset.addEventListener('click', () => {
            this.timerRunning = false;
            clearInterval(this.timer);
            this.dom.btnPause.style.display = 'none';
            this.dom.btnStart.style.display = 'block';
            this.isWorking = true;
            this.timeLeft = 25 * 60;
            this.updateTimerDisplay();
        });
    }

    switchPomodoroMode() {
        this.isWorking = !this.isWorking;
        this.timeLeft = this.isWorking ? 25 * 60 : 5 * 60;
        this.updateTimerDisplay();
        
        const msg = this.isWorking ? "🏁 Tiempo de Enfoque iniciado. @forca_worker está listo." : "☕ Ciclo completado. Fase de descanso estructurado (Seny).";
        this.addSystemLog(msg);
    }

    updateTimerDisplay() {
        const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const s = (this.timeLeft % 60).toString().padStart(2, '0');
        this.dom.timerDisplay.innerText = `${m}:${s}`;
        
        if (this.isWorking) {
            this.dom.timerStatus.innerText = "Modo Enfoque (Deep Work)";
            this.dom.timerDisplay.className = 'timer-display work-mode';
        } else {
            this.dom.timerStatus.innerText = "Descanso (Recuperación)";
            this.dom.timerDisplay.className = 'timer-display break-mode';
        }
    }

    async addSystemLog(text) {
        const state = store.getState();
        const project = state.projects.find(p => p.id === this.activeProjectId);
        if (!project) return;
        const newLog = { id: 'log_' + Date.now(), text: text, sender: 'system', timestamp: Date.now() };
        const updatedLogs = [...(project.logs || []), newLog];
        await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: project.id, updates: { logs: updatedLogs } } });
        this.renderLogs(updatedLogs);
    }
}
