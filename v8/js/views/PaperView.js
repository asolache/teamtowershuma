// v8/js/views/PaperView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; 
import { PageHeader } from '../components/PageHeader.js';

export default class PaperView {
    constructor() {
        document.title = "Omni-Paper | TeamTowers V13";
        this.activeTx = null;
        this.isMenuOpen = false;
    }

    async getHtml() {
        const state = store.getState();
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project && state.projects.length > 0) project = state.projects[state.projects.length - 1];

        const headerConfig = {
            title: "Omni-Paper (Usenet)",
            subtitle: project ? project.nombre : 'Sin Red',
            tagline: "Escribe @ para invocar Agentes/Humanos y # para etiquetar Memes W3C."
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace-paper { flex: 1; display: flex; flex-direction: column; position: relative; background: var(--bg-dark); overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; padding: 2rem 3rem; box-sizing: border-box; width: 100%; align-items: center;}
                
                /* =========================================================
                   OMNI-PAPER EDITOR (Estilo Notion/Medium)
                   ========================================================= */
                .paper-container { width: 100%; max-width: 800px; display: flex; flex-direction: column; gap: 2rem; margin-top: 2rem;}
                
                .tx-context-bar { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); padding: 15px 20px; border-radius: 12px; border: 1px dashed var(--glass-border); flex-wrap: wrap; gap: 15px;}
                .tx-selector { background: transparent; border: none; color: white; font-size: 1.1rem; font-weight: 900; font-family: var(--font-main); outline: none; cursor: pointer; flex: 1; min-width: 200px; text-overflow: ellipsis;}
                .tx-selector option { background: #111; color: white; }
                .tx-selector optgroup { color: var(--accent-blue); background: #000; font-style: normal;}
                
                .slice-ticker { font-size: 1.2rem; font-family: var(--font-mono); font-weight: 900; color: var(--accent-green); background: rgba(0,230,118,0.1); border: 1px solid rgba(0,230,118,0.3); padding: 8px 16px; border-radius: 20px; display: flex; align-items: center; gap: 8px;}
                .slice-ticker span { font-size: 0.8rem; color: #888; text-transform: uppercase; }

                /* EL LIENZO EN BLANCO */
                .editor-wrapper { position: relative; width: 100%; }
                .semantic-editor { width: 100%; min-height: 60vh; background: transparent; border: none; color: #ddd; font-family: 'Georgia', serif; font-size: 1.2rem; line-height: 1.8; outline: none; resize: none; overflow: hidden; padding: 10px 0;}
                .semantic-editor::placeholder { color: #555; font-style: italic; }

                /* MENÚ AUTOCOMPLETADO (USENET) */
                .semantic-menu { position: absolute; background: rgba(15,15,20,0.95); border: 1px solid var(--accent-blue); border-radius: 12px; max-height: 250px; overflow-y: auto; display: none; z-index: 6000; box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(0,176,255,0.2); backdrop-filter: blur(15px); padding: 5px 0; min-width: 250px;}
                .semantic-item { padding: 12px 20px; color: white; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 12px; font-size: 0.95rem; font-family: var(--font-main);}
                .semantic-item:hover, .semantic-item.selected { background: rgba(0,176,255,0.15); }
                .semantic-badge { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-orange); margin-left: auto;}

                /* HILO DE CONVERSACIÓN (USENET LOGS) */
                .thread-container { margin-top: 3rem; border-top: 1px solid var(--glass-border); padding-top: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
                .thread-title { color: #888; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: flex; justify-content: space-between;}
                
                .log-bubble { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px; position: relative;}
                .log-bubble.ai-reply { border-left: 4px solid var(--accent-purple); background: rgba(224,64,251,0.05); }
                .log-bubble.human-reply { border-left: 4px solid var(--accent-blue); }
                
                .log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;}
                .log-author { font-weight: 900; color: white; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;}
                .log-time { font-size: 0.75rem; color: #666; font-family: var(--font-mono);}
                .log-content { color: #ccc; line-height: 1.6; font-family: 'Georgia', serif; font-size: 1.05rem; white-space: pre-wrap;}
                
                .mention-highlight { color: var(--accent-blue); font-weight: bold; background: rgba(0,176,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.9rem;}
                .meme-highlight { color: var(--accent-purple); font-weight: bold; background: rgba(224,64,251,0.1); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.9rem;}

                .btn-seal-pow { position: fixed; bottom: 100px; right: 30px; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0, 176, 255, 0.4); z-index: 1000;}
                .btn-seal-pow:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(224, 64, 251, 0.5); filter: brightness(1.1);}

                @media (max-width: 768px) {
                    .workspace-paper { padding: 90px 1rem 120px 1rem; }
                    .tx-context-bar { flex-direction: column; align-items: stretch; }
                    .btn-seal-pow { bottom: 80px; right: 20px; width: calc(100% - 40px); border-radius: 12px; text-align: center; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/paper')}

                <main class="workspace-paper">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="paper-container">
                        
                        <div class="tx-context-bar">
                            <select id="omniSelector" class="tx-selector">
                                <option value="" disabled selected>🎯 Selecciona una Work Order...</option>
                            </select>
                            <div class="slice-ticker" title="Valor a minar si el Notario aprueba (TDD)">
                                💎 <span id="sliceEstimation">0</span> Slices <span>(Est.)</span>
                            </div>
                        </div>

                        <div class="editor-wrapper">
                            <textarea id="semanticEditor" class="semantic-editor" placeholder="El lienzo está en blanco. Escribe tu Proof of Work aquí... \n\nUsa @ para consultar a La Colla (ej: @deep_coder_ audita esto).\nUsa # para aplicar metodologías W3C de la red."></textarea>
                            
                            <div id="semanticMenu" class="semantic-menu"></div>
                        </div>

                        <div class="thread-container">
                            <div class="thread-title">
                                <span>📡 Historial Usenet (Pings)</span>
                                <span id="threadCount" style="color:var(--accent-blue);">0 Respuestas</span>
                            </div>
                            <div id="threadList">
                                <div style="text-align:center; color:#555; font-style:italic; padding: 2rem;">No hay actividad en este hilo. Escribe una arroba en el lienzo superior para invocar a la red.</div>
                            </div>
                        </div>

                    </div>
                    
                    <button class="btn-seal-pow" id="btnSubmitReport" style="display:none;">⚖️ Sellar Proof of Work</button>

                </main>
                
                ${BottomNav.getHtml('/paper')}
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        Sidebar.initListeners();
        PageHeader.execute(); 

        this.dom = {
            omniSelector: document.getElementById('omniSelector'),
            sliceEstimation: document.getElementById('sliceEstimation'),
            editor: document.getElementById('semanticEditor'),
            menu: document.getElementById('semanticMenu'),
            threadList: document.getElementById('threadList'),
            threadCount: document.getElementById('threadCount'),
            btnSubmit: document.getElementById('btnSubmitReport')
        };

        // 1. CARGAR TAREAS DEL USUARIO (Igual que en el FocusView viejo)
        let allMyTasks = [];
        state.projects.forEach(p => {
            const tasksSource = p.work_orders && p.work_orders.length > 0 ? p.work_orders : (p.transactions || []);
            let tasks = tasksSource.filter(tx => tx.status === 'pinged' && tx.assigneeId === activeUserId);
            
            if(tasks.length === 0 && state.session.role === 'ecosystem-owner') {
                tasks = tasksSource.filter(tx => tx.status === 'pinged');
            }
            
            tasks.forEach(tx => {
                const roleFrom = p.roles.find(r => r.id === tx.from);
                let resolvedName = tx.entregable || tx.template;
                if (!resolvedName && tx.flowId) {
                    const parentFlow = (p.vna_flows || []).find(f => f.id === tx.flowId);
                    if (parentFlow) resolvedName = parentFlow.template || parentFlow.entregable;
                }
                allMyTasks.push({ ...tx, projectId: p.id, projectName: p.nombre, roleName: roleFrom ? roleFrom.name : 'Nodo', displayName: resolvedName || 'Work Order' });
            });
        });

        allMyTasks.sort((a, b) => a.projectName.localeCompare(b.projectName));

        if (allMyTasks.length > 0) {
            let currentProjectName = '';
            let selectHtml = `<option value="" disabled>🎯 Selecciona una Work Order...</option>`;
            allMyTasks.forEach(t => {
                if (t.projectName !== currentProjectName) {
                    if (currentProjectName !== '') selectHtml += `</optgroup>`;
                    selectHtml += `<optgroup label="🏰 ${t.projectName.toUpperCase()}">`;
                    currentProjectName = t.projectName;
                }
                selectHtml += `<option value="${t.id || t.hash}">[${t.roleName}] ${t.displayName}</option>`;
            });
            if (currentProjectName !== '') selectHtml += `</optgroup>`;
            this.dom.omniSelector.innerHTML = selectHtml;

            // Seleccionar tarea de la URL (si venimos del Kanban)
            const urlParams = new URLSearchParams(window.location.search);
            const hashFromUrl = urlParams.get('hash');
            if (hashFromUrl && allMyTasks.find(t => (t.id || t.hash) === hashFromUrl)) {
                this.activeTx = allMyTasks.find(t => (t.id || t.hash) === hashFromUrl);
                this.dom.omniSelector.value = this.activeTx.id || this.activeTx.hash;
                this.loadTaskContext();
            }

            this.dom.omniSelector.addEventListener('change', (e) => {
                this.activeTx = allMyTasks.find(t => (t.id || t.hash) === e.target.value);
                this.loadTaskContext();
            });
        }

        // 2. LÓGICA DEL EDITOR SEMÁNTICO (El Corazón de la Usenet)
        this.setupSemanticEditor();

        // 3. ENVÍO AL LEDGER
        this.dom.btnSubmit.addEventListener('click', () => this.submitReport());

        // 4. AUTO-EXPANDIR TEXTAREA
        this.dom.editor.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    loadTaskContext() {
        if (!this.activeTx) return;
        this.dom.btnSubmit.style.display = 'block';

        const state = store.getState();
        const p = state.projects.find(x => x.id === this.activeTx.projectId);
        
        // Calcular Slices Estimados
        let estHours = this.activeTx.horas || this.activeTx.estimatedHours || 2;
        if (!this.activeTx.horas && this.activeTx.flowId) {
            const parentFlow = (p.vna_flows || []).find(f => f.id === this.activeTx.flowId);
            if (parentFlow) estHours = parentFlow.estimatedHours || 2;
        }
        const role = p.roles.find(r => r.id === this.activeTx.from);
        const slices = role ? (estHours * role.fmv * role.multiplier) : 0;
        this.dom.sliceEstimation.innerText = Math.round(slices).toLocaleString();

        // Cargar Historial (Usenet Thread)
        this.renderThread(p);
    }

    renderThread(project) {
        if (!project.logs || !this.activeTx) return;
        
        const activeHash = this.activeTx.id || this.activeTx.hash;
        const thread = project.logs.filter(l => l.relatedTxHash === activeHash).sort((a,b) => a.date - b.date);
        
        this.dom.threadCount.innerText = `${thread.length} Mensajes`;

        if (thread.length === 0) {
            this.dom.threadList.innerHTML = `<div style="text-align:center; color:#555; font-style:italic; padding: 2rem;">El lienzo está limpio. Inicia la comunicación invocando a la red con un @.</div>`;
            return;
        }

        const state = store.getState();
        
        let html = '';
        thread.forEach(log => {
            const user = state.globalUsers.find(u => u.id === log.authorId);
            const isAi = user?.profile?.isAi;
            const authorName = user ? user.name : log.authorId;
            const authorIcon = isAi ? '🤖' : '👤';
            const timeStr = new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            // Reemplazar menciones crudas por Badges Visuales
            let formattedContent = log.content;
            if (log.mentions) {
                log.mentions.forEach(m => {
                    const rgx = new RegExp(m, 'g');
                    formattedContent = formattedContent.replace(rgx, `<span class="mention-highlight">${m}</span>`);
                });
            }
            // Simple regex para colorear hashtags (memes)
            formattedContent = formattedContent.replace(/(#[a-zA-Z0-9_]+)/g, `<span class="meme-highlight">$1</span>`);

            html += `
                <div class="log-bubble ${isAi ? 'ai-reply' : 'human-reply'}">
                    <div class="log-header">
                        <div class="log-author">${authorIcon} ${authorName}</div>
                        <div class="log-time">${timeStr}</div>
                    </div>
                    <div class="log-content">${formattedContent}</div>
                </div>
            `;
        });

        this.dom.threadList.innerHTML = html;
        // Bajar el scroll para ver el último mensaje
        setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
    }

    setupSemanticEditor() {
        const input = this.dom.editor;
        const menu = this.dom.menu;
        const state = store.getState();

        let triggerChar = null; // '@' o '#'

        input.addEventListener('input', (e) => {
            const val = input.value;
            const cursorIdx = input.selectionStart;
            
            const textBeforeCursor = val.substring(0, cursorIdx);
            const words = textBeforeCursor.split(/\s/);
            const currentWord = words[words.length - 1];

            if (currentWord.startsWith('@')) {
                const search = currentWord.substring(1).toLowerCase();
                const users = state.globalUsers.filter(u => u.name.toLowerCase().includes(search) || u.id.toLowerCase().includes(search));
                
                if (users.length > 0) {
                    menu.innerHTML = users.map(u => `
                        <div class="semantic-item" data-val="${u.id}">
                            <span style="font-size:1.5rem;">${u.profile?.isAi ? '🤖' : '👤'}</span> 
                            <div>
                                <div style="font-weight:900;">${u.name}</div>
                                <div style="font-size:0.75rem; color:#888;">${u.profile?.isAi ? 'Agente A2A' : 'Humano'}</div>
                            </div>
                            <span class="semantic-badge">${u.id}</span>
                        </div>
                    `).join('');
                    this.showMenu(input, menu, currentWord);
                    triggerChar = '@';
                } else {
                    menu.style.display = 'none';
                }
            } else if (currentWord.startsWith('#')) {
                // Mockup W3C Ontologies (Esto luego leerá del KB.js)
                menu.innerHTML = `
                    <div class="semantic-item" data-val="#SOP_Review"><span>📄</span> <b>SOP_Review</b> <span class="semantic-badge">Methodology</span></div>
                    <div class="semantic-item" data-val="#CleanCode"><span>✨</span> <b>CleanCode</b> <span class="semantic-badge">SOC</span></div>
                    <div class="semantic-item" data-val="#VNA_Mapping"><span>🕸️</span> <b>VNA_Mapping</b> <span class="semantic-badge">Framework</span></div>
                `;
                this.showMenu(input, menu, currentWord);
                triggerChar = '#';
            } else if (currentWord.startsWith('/')) {
                // Comandos DRY de Inyección
                menu.innerHTML = `
                    <div class="semantic-item" data-val="/mapa"><span>🕸️</span> <div><b>Inyectar Mapa VNA</b><br><span style="font-size:0.7rem;color:#888;">Renderiza topología actual.</span></div></div>
                    <div class="semantic-item" data-val="/ledger"><span>⚖️</span> <div><b>Inyectar Slicing Pie</b><br><span style="font-size:0.7rem;color:#888;">Renderiza Cap Table en vivo.</span></div></div>
                `;
                this.showMenu(input, menu, currentWord);
                triggerChar = '/';
            } else {
                menu.style.display = 'none';
                this.isMenuOpen = false;
            }
        });

        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.semantic-item');
            if (item) {
                const replaceVal = item.getAttribute('data-val');
                const val = input.value;
                const cursorIdx = input.selectionStart;
                const textBeforeCursor = val.substring(0, cursorIdx);
                const words = textBeforeCursor.split(/\s/);
                const currentWord = words[words.length - 1];
                
                // Sustituir la palabra actual por la seleccionada + un espacio
                const newText = val.substring(0, cursorIdx - currentWord.length) + replaceVal + ' ' + val.substring(cursorIdx);
                input.value = newText;
                menu.style.display = 'none';
                this.isMenuOpen = false;
                input.focus();
            }
        });
    }

    showMenu(textarea, menu, currentWord) {
        // Lógica simple para posicionar el menú cerca del cursor (Aproximación)
        // En un editor real usaríamos getCaretCoordinates, pero para este prototipo anclamos el menú
        // de forma flotante elegante.
        menu.style.display = 'block';
        this.isMenuOpen = true;
    }

    async submitReport() {
        if (!this.activeTx) return;
        
        const textContent = this.dom.editor.value.trim();
        if (!textContent) return alert("⚠️ No puedes sellar un lienzo vacío. Escribe tu reporte.");

        this.dom.btnSubmit.disabled = true;
        this.dom.btnSubmit.innerText = '⏳ Sellando y Pingeando...';
        
        const activeHash = this.activeTx.id || this.activeTx.hash;
        const p = store.getState().projects.find(x => x.id === this.activeTx.projectId);
        
        // 🔥 MAGIA USENET: Detectar menciones y comandos
        const mentions = [];
        const words = textContent.split(/\s/);
        words.forEach(w => {
            if (w.startsWith('@') && w.length > 1) mentions.push(w);
        });

        // Registrar el Log Semántico (El Paper)
        await store.dispatch({
            type: 'ADD_LOG_ENTRY',
            payload: {
                projectId: this.activeTx.projectId,
                log: {
                    id: 'log_' + Date.now(),
                    date: Date.now(),
                    authorId: store.getState().session.activeUserId,
                    relatedTxHash: activeHash,
                    content: textContent,
                    mentions: mentions, 
                    readBy: []
                }
            }
        });

        // Despachar el reporte clásico de la transacción para el Auditor
        const isV10 = p.work_orders && p.work_orders.some(w => w.hash === activeHash);

        // TODO: En el futuro calcularemos las 'realHours' a partir de los commits o tiempo en línea.
        // Ahora pasamos las horas estimadas automáticamente.
        let estHours = this.activeTx.horas || this.activeTx.estimatedHours || 1;
        if (!this.activeTx.horas && this.activeTx.flowId) {
            const parentFlow = (p.vna_flows || []).find(f => f.id === this.activeTx.flowId);
            if (parentFlow) estHours = parentFlow.estimatedHours || 1;
        }

        await store.dispatch({
            type: isV10 ? 'REPORT_WORK_ORDER' : 'REPORT_TRANSACTION',
            payload: {
                projectId: this.activeTx.projectId,
                [isV10 ? 'woHash' : 'txHash']: activeHash,
                realHours: estHours, 
                comentario: "Ver Log Semántico asociado.",
                proofLink: 'Usenet_Thread'
            }
        });

        // Limpieza y Redirección
        this.dom.editor.value = '';
        localStorage.setItem('tt_active_project', this.activeTx.projectId);
        
        // Esperamos 1 segundo para que el Daemon (si hay IA mencionada) empiece a escribir
        setTimeout(() => {
            window.location.href = `/v8/project?hash=${activeHash}`;
        }, 1000);
    }
}
