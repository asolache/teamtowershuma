// v8/js/views/PaperView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; 
import { PageHeader } from '../components/PageHeader.js';
import { MapRenderer } from '../components/MapRenderer.js'; 
import { KanbanRenderer } from '../components/KanbanRenderer.js'; 
import { LedgerRenderer } from '../components/LedgerRenderer.js'; 
import { FocusRenderer } from '../components/FocusRenderer.js';

export default class PaperView {
    constructor() {
        document.title = "Omni-Paper | TeamTowers V14";
        this.activeTx = null; 
        this.isMenuOpen = false;
        this.currentWord = "";
    }

    async getHtml() {
        const state = store.getState();
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project && state.projects.length > 0) project = state.projects[state.projects.length - 1];

        const headerConfig = {
            title: "Omni-Paper (Usenet)",
            subtitle: project ? project.nombre : 'Sin Red',
            tagline: "Escribe @ para Agentes, # para Memes, y / para inyectar Componentes o Modificar el Sistema."
        };

        return `
            <style>
                ${MapRenderer.getStyles()}
                ${KanbanRenderer.getStyles()} 
                ${LedgerRenderer.getStyles()} 
                ${FocusRenderer.getStyles()}

                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width:100%;}
                .workspace-paper { flex: 1; display: flex; flex-direction: column; position: relative; background: var(--bg-dark); overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; padding: 2rem 3rem; box-sizing: border-box; width: 100%; align-items: center;}
                
                .paper-container { width: 100%; max-width: 800px; display: flex; flex-direction: column; gap: 2rem; margin-top: 2rem;}
                
                .tx-context-bar { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); padding: 15px 20px; border-radius: 12px; border: 1px dashed var(--glass-border); flex-wrap: wrap; gap: 15px; transition: 0.3s;}
                .tx-context-bar.draft-mode { border-color: var(--accent-orange); box-shadow: 0 0 20px rgba(255,171,64,0.1); }
                
                .tx-selector { background: transparent; border: none; color: white; font-size: 1.1rem; font-weight: 900; font-family: var(--font-main); outline: none; cursor: pointer; flex: 1; min-width: 200px; text-overflow: ellipsis;}
                .tx-selector option { background: #111; color: white; }
                .tx-selector optgroup { color: var(--accent-blue); background: #000; font-style: normal;}
                
                .slice-ticker { font-size: 1.2rem; font-family: var(--font-mono); font-weight: 900; color: var(--accent-green); background: rgba(0,230,118,0.1); border: 1px solid rgba(0,230,118,0.3); padding: 8px 16px; border-radius: 20px; display: flex; align-items: center; gap: 8px;}
                .slice-ticker.draft-ticker { color: var(--accent-orange); background: rgba(255,171,64,0.1); border-color: rgba(255,171,64,0.3); }

                /* =========================================================
                   EL LIENZO EN BLANCO (contenteditable)
                   ========================================================= */
                .editor-wrapper { position: relative; width: 100%; }
                .semantic-editor { width: 100%; min-height: 50vh; background: transparent; border: none; color: #ddd; font-family: 'Georgia', serif; font-size: 1.2rem; line-height: 1.8; outline: none; padding: 10px 0;}
                .semantic-editor:empty:before { content: attr(data-placeholder); color: #555; font-style: italic; pointer-events: none;}
                .semantic-editor p { margin: 0 0 1rem 0; }

                /* WIDGETS INYECTADOS EN EL TEXTO */
                .omni-widget { margin: 1.5rem 0; border: 1px dashed var(--accent-blue); border-radius: 16px; background: rgba(10,10,15,0.8); overflow: hidden; user-select: none; box-shadow: 0 10px 30px rgba(0,0,0,0.5);}
                .omni-widget-header { background: rgba(0,176,255,0.1); border-bottom: 1px solid rgba(0,176,255,0.2); padding: 10px 15px; font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-blue); font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                .omni-widget-body { padding: 0; position: relative; }
                
                /* MINI CONSOLAS INTERACTIVAS (NUEVO) */
                .inline-console { padding: 1.5rem; display: flex; flex-direction: column; gap: 10px; background: rgba(0,0,0,0.4); }
                .inline-input { background: rgba(0,0,0,0.6); border: 1px solid #444; color: white; padding: 10px 15px; border-radius: 8px; font-family: var(--font-main); font-size: 0.95rem; outline: none; width: 100%; box-sizing: border-box;}
                .inline-input:focus { border-color: var(--accent-blue); }
                .inline-btn { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.3s; margin-top: 10px;}
                .inline-btn:hover { filter: brightness(1.2); }
                .inline-success { color: var(--accent-green); font-weight: bold; padding: 1rem; text-align: center; background: rgba(0,230,118,0.1); border-top: 1px solid rgba(0,230,118,0.3);}

                /* UX DELUXE: MENÚ AUTOCOMPLETADO FLOTANTE */
                .semantic-menu { position: fixed; background: rgba(10,10,15,0.98); border: 1px solid rgba(255,255,255,0.1); border-top: 3px solid var(--accent-blue); border-radius: 16px; max-height: 300px; overflow-y: auto; display: none; z-index: 9999; box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(0,176,255,0.15); backdrop-filter: blur(20px); padding: 8px 0; min-width: 320px; animation: popIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); transform-origin: top left;}
                .semantic-item { padding: 12px 20px; color: white; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 15px; font-size: 0.95rem; font-family: var(--font-main); border-left: 2px solid transparent;}
                .semantic-item:hover, .semantic-item.selected { background: rgba(255,255,255,0.05); border-left-color: var(--accent-blue);}
                .semantic-item.type-mention:hover { border-left-color: var(--accent-blue); background: rgba(0,176,255,0.1); }
                .semantic-item.type-meme:hover { border-left-color: var(--accent-purple); background: rgba(224,64,251,0.1); }
                .semantic-item.type-widget:hover { border-left-color: var(--accent-orange); background: rgba(255,171,64,0.1); }
                .semantic-item.type-action:hover { border-left-color: var(--accent-green); background: rgba(0,230,118,0.1); }
                
                .semantic-badge { background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); margin-left: auto; font-weight:bold;}

                /* HIGHLIGHTS (LINKS) */
                .mention-highlight { color: var(--accent-blue); font-weight: bold; background: rgba(0,176,255,0.1); padding: 2px 6px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.95rem; cursor: pointer; transition: 0.2s; text-decoration: none;}
                .mention-highlight:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 15px rgba(0,176,255,0.4);}
                
                .meme-highlight { color: var(--accent-purple); font-weight: bold; background: rgba(224,64,251,0.1); padding: 2px 6px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.95rem; cursor: pointer; transition: 0.2s; text-decoration: none;}
                .meme-highlight:hover { background: var(--accent-purple); color: white; box-shadow: 0 0 15px rgba(224,64,251,0.4);}

                /* HILO DE CONVERSACIÓN (USENET LOGS) */
                .thread-container { margin-top: 1rem; border-top: 1px solid var(--glass-border); padding-top: 2rem; display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 6rem;}
                .thread-title { color: #888; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; display: flex; justify-content: space-between;}
                
                .log-bubble { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px; position: relative; transition:0.3s;}
                .log-bubble.ai-reply { border-left: 4px solid var(--accent-purple); background: rgba(224,64,251,0.05); }
                .log-bubble.human-reply { border-left: 4px solid var(--accent-blue); }
                
                .log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;}
                .log-author { font-weight: 900; color: white; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;}
                .log-time { font-size: 0.75rem; color: #666; font-family: var(--font-mono);}
                .log-content { color: #ccc; line-height: 1.6; font-family: 'Georgia', serif; font-size: 1.05rem; white-space: pre-wrap; word-break: break-word;}

                /* BOTONES DE ACCIÓN INFERIOR */
                .action-bar-fixed { position: fixed; bottom: 30px; right: 30px; display: flex; gap: 15px; z-index: 1000;}
                .btn-action-pow { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0, 176, 255, 0.3);}
                .btn-action-pow:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(224, 64, 251, 0.5); filter: brightness(1.1);}
                
                .btn-action-draft { background: rgba(255,171,64,0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 16px 30px; border-radius: 30px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px);}
                .btn-action-draft:hover { background: var(--accent-orange); color: black; box-shadow: 0 10px 30px rgba(255, 171, 64, 0.4); transform: translateY(-3px);}

                @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                @media (max-width: 768px) {
                    .workspace-paper { padding: 90px 1rem 120px 1rem; }
                    .tx-context-bar { flex-direction: column; align-items: stretch; }
                    .action-bar-fixed { bottom: 80px; right: 20px; left: 20px; justify-content: space-between; gap:10px; }
                    .btn-action-pow, .btn-action-draft { width: 100%; padding: 14px 10px; font-size: 0.95rem; text-align: center; justify-content:center;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/paper')}

                <main class="workspace-paper" id="paperWorkspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="paper-container">
                        
                        <div class="tx-context-bar" id="contextBar">
                            <select id="omniSelector" class="tx-selector">
                                <option value="draft" selected>📝 Borrador Libre (Draft Mode)</option>
                            </select>
                            <div class="slice-ticker draft-ticker" id="sliceContainer" title="Estimación de valor">
                                💡 <span id="sliceEstimation">Borrador</span>
                            </div>
                        </div>

                        <div class="editor-wrapper">
                            <div id="semanticEditor" class="semantic-editor" contenteditable="true" data-placeholder="El lienzo está en blanco.\n\nEscribe tu Proof of Work o empieza a redactar un Borrador (Draft).\n\nUsa @ para invocar a la Colla.\nUsa # para buscar Memes/SOPs del Cerebro LMS.\nUsa / para inyectar Componentes (/deepwork, /mapa, /agente, /rol...)."><p><br></p></div>
                        </div>

                        <div class="thread-container" id="threadWrapper" style="display:none;">
                            <div class="thread-title">
                                <span>📡 Historial Usenet (Pings)</span>
                                <span id="threadCount" style="color:var(--accent-blue);">0 Logs</span>
                            </div>
                            <div id="threadList"></div>
                        </div>

                    </div>
                    
                    <div class="action-bar-fixed">
                        <button class="btn-action-draft" id="btnConvertDraft">🚀 Convertir en Work Order</button>
                        <button class="btn-action-pow" id="btnSubmitReport" style="display:none;">⚖️ Enviar a Usenet (Sellar)</button>
                    </div>

                </main>
                
                <div id="semanticMenu" class="semantic-menu"></div>
                
                ${BottomNav.getHtml('/paper')}
            </div>
        `;
    }

    async executeViewScript() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        Sidebar.initListeners();
        PageHeader.execute(); 

        this.dom = {
            workspace: document.getElementById('paperWorkspace'),
            contextBar: document.getElementById('contextBar'),
            omniSelector: document.getElementById('omniSelector'),
            sliceContainer: document.getElementById('sliceContainer'),
            sliceEstimation: document.getElementById('sliceEstimation'),
            editor: document.getElementById('semanticEditor'),
            menu: document.getElementById('semanticMenu'),
            threadWrapper: document.getElementById('threadWrapper'),
            threadList: document.getElementById('threadList'),
            threadCount: document.getElementById('threadCount'),
            btnSubmit: document.getElementById('btnSubmitReport'),
            btnConvertDraft: document.getElementById('btnConvertDraft')
        };

        this.dom.editor.focus();

        // 1. CARGAR TAREAS DEL USUARIO
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
                allMyTasks.push({ ...tx, projectId: p.id, projectName: p.nombre, roleName: roleFrom ? roleFrom.name : 'VNA', displayName: resolvedName || 'Work Order' });
            });
        });

        allMyTasks.sort((a, b) => a.projectName.localeCompare(b.projectName));

        let selectHtml = `<option value="draft">📝 Borrador Libre (Draft Mode)</option>`;
        if (allMyTasks.length > 0) {
            let currentProjectName = '';
            allMyTasks.forEach(t => {
                if (t.projectName !== currentProjectName) {
                    if (currentProjectName !== '') selectHtml += `</optgroup>`;
                    selectHtml += `<optgroup label="🏰 ${t.projectName.toUpperCase()}">`;
                    currentProjectName = t.projectName;
                }
                selectHtml += `<option value="${t.id || t.hash}">[${t.roleName}] ${t.displayName}</option>`;
            });
            selectHtml += `</optgroup>`;
        }
        this.dom.omniSelector.innerHTML = selectHtml;

        const urlParams = new URLSearchParams(window.location.search);
        const hashFromUrl = urlParams.get('hash');
        
        if (hashFromUrl && allMyTasks.find(t => (t.id || t.hash) === hashFromUrl)) {
            this.activeTx = allMyTasks.find(t => (t.id || t.hash) === hashFromUrl);
            this.dom.omniSelector.value = this.activeTx.id || this.activeTx.hash;
            this.setTaskMode();
        } else {
            this.setDraftMode();
        }

        this.dom.omniSelector.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'draft') {
                this.activeTx = null;
                this.setDraftMode();
            } else {
                this.activeTx = allMyTasks.find(t => (t.id || t.hash) === val);
                this.setTaskMode();
            }
        });

        // 2. LÓGICA DEL OMNI-PAPER EDITOR DELUXE
        this.setupSemanticEditor();

        // 3. ENVÍO Y CONVERSIÓN
        this.dom.btnSubmit.addEventListener('click', () => this.submitReport());
        this.dom.btnConvertDraft.addEventListener('click', () => this.convertDraftToTask());
        
        // 4. DELEGACIÓN DE EVENTOS PARA LAS CONSOLAS INTERACTIVAS INYECTADAS
        this.dom.editor.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-inline-action')) {
                await this.handleInlineConsoleAction(e.target);
            }
        });
    }

    setDraftMode() {
        this.dom.contextBar.classList.add('draft-mode');
        this.dom.sliceContainer.className = 'slice-ticker draft-ticker';
        this.dom.sliceContainer.innerHTML = `💡 <span id="sliceEstimation">Borrador Libre</span>`;
        this.dom.threadWrapper.style.display = 'none';
        this.dom.btnSubmit.style.display = 'none';
        this.dom.btnConvertDraft.style.display = 'block';
    }

    setTaskMode() {
        if (!this.activeTx) return;
        this.dom.contextBar.classList.remove('draft-mode');
        this.dom.sliceContainer.className = 'slice-ticker';
        
        this.dom.threadWrapper.style.display = 'flex';
        this.dom.btnSubmit.style.display = 'block';
        this.dom.btnConvertDraft.style.display = 'none';

        const state = store.getState();
        const p = state.projects.find(x => x.id === this.activeTx.projectId);
        
        let estHours = this.activeTx.horas || this.activeTx.estimatedHours || 2;
        if (!this.activeTx.horas && this.activeTx.flowId) {
            const parentFlow = (p.vna_flows || []).find(f => f.id === this.activeTx.flowId);
            if (parentFlow) estHours = parentFlow.estimatedHours || 2;
        }
        const role = p.roles.find(r => r.id === this.activeTx.from);
        const slices = role ? (estHours * role.fmv * role.multiplier) : 0;
        this.dom.sliceContainer.innerHTML = `💎 <span id="sliceEstimation">${Math.round(slices).toLocaleString()}</span> Slices <span>(Est.)</span>`;

        this.renderThread(p);
    }

    renderThread(project) {
        if (!project.logs || !this.activeTx) return;
        const activeHash = this.activeTx.id || this.activeTx.hash;
        const thread = project.logs.filter(l => l.relatedTxHash === activeHash).sort((a,b) => a.date - b.date);
        
        this.dom.threadCount.innerText = `${thread.length} Mensajes`;

        if (thread.length === 0) {
            this.dom.threadList.innerHTML = `<div style="text-align:center; color:#555; font-style:italic; padding: 2rem;">El historial de la Usenet está limpio para esta tarea.</div>`;
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
            
            let formattedContent = log.content;
            if (log.mentions) {
                log.mentions.forEach(m => {
                    const rgx = new RegExp(`(?<!<[^>]*)${m}`, 'g');
                    formattedContent = formattedContent.replace(rgx, `<a href="/v8/profile?id=${m}" data-link class="mention-highlight">${m}</a>`);
                });
            }
            formattedContent = formattedContent.replace(/(?<!<[^>]*)(#[a-zA-Z0-9_]+)/g, `<a href="/v8/lms" data-link class="meme-highlight">$1</a>`);

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
        this.hydrateWidgets(project);
    }

    hydrateWidgets(project) {
        setTimeout(() => {
            this.dom.threadList.querySelectorAll('.omni-map-canvas').forEach(canvas => {
                const svg = canvas.querySelector('svg > g');
                if(svg && project) {
                    const flows = project.vna_flows && project.vna_flows.length > 0 ? project.vna_flows : (project.transactions || []);
                    const mr = new MapRenderer(canvas, svg, { isMacro: true });
                    mr.setData(project.roles, flows);
                }
            });
            this.dom.threadList.querySelectorAll('[id^="kanban_"]').forEach(container => {
                if (project) {
                    const activeUserId = store.getState().session.activeUserId;
                    const isPO = project.ownerId === activeUserId || store.getState().session.role === 'ecosystem-owner';
                    const kr = new KanbanRenderer(container, { project: project, activeUserId: activeUserId, isPO: isPO, currentTab: 'oportunidades', currentFilter: 'all', isMacroMode: true });
                    kr.render();
                }
            });
            this.dom.threadList.querySelectorAll('[id^="ledger_"]').forEach(container => {
                if (project) {
                    const lr = new LedgerRenderer(container, { projectId: project.id, showHistory: false });
                    lr.render();
                }
            });
        }, 100);
        setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
    }

    // ==========================================
    // UX DELUXE: EDITOR SEMÁNTICO FLOTANTE
    // ==========================================
    setupSemanticEditor() {
        const input = this.dom.editor;
        const menu = this.dom.menu;
        const state = store.getState();
        let lastKnownRect = null; 

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !menu.contains(e.target) && !e.target.classList.contains('btn-inline-action')) {
                menu.style.display = 'none';
                this.isMenuOpen = false;
            }
        });

        input.addEventListener('keyup', async (e) => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            const textBeforeCursor = range.startContainer.textContent.substring(0, range.startOffset);
            const words = textBeforeCursor.split(/\s/);
            this.currentWord = words[words.length - 1];

            const rect = range.getBoundingClientRect();
            if (rect.top !== 0 && rect.left !== 0) lastKnownRect = rect;
            
            if (this.currentWord.startsWith('@')) {
                const search = this.currentWord.substring(1).toLowerCase();
                const users = state.globalUsers.filter(u => u.name.toLowerCase().includes(search) || u.id.toLowerCase().includes(search));
                
                if (users.length > 0) {
                    menu.innerHTML = `<div style="padding: 5px 15px; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 5px;">Invocar Nodo / Agente IA</div>`;
                    menu.innerHTML += users.map(u => `
                        <div class="semantic-item type-mention" data-val="${u.id}" data-type="mention">
                            <span style="font-size:1.5rem;">${u.profile?.isAi ? '🤖' : '👤'}</span> 
                            <div>
                                <div style="font-weight:900;">${u.name}</div>
                                <div style="font-size:0.75rem; color:#888;">${u.profile?.isAi ? 'Agente A2A' : 'Humano'}</div>
                            </div>
                            <span class="semantic-badge">${u.id}</span>
                        </div>
                    `).join('');
                    this.showFloatingMenu(menu, lastKnownRect);
                } else {
                    menu.style.display = 'none';
                }
            } 
            else if (this.currentWord.startsWith('#')) {
                const search = this.currentWord.substring(1).toLowerCase();
                const { KB } = await import('../core/kb.js'); 
                await KB.init();
                let memes = await KB.getAllNodes({ type: 'meme' });
                if (search.length > 0) memes = memes.filter(m => m.title.toLowerCase().includes(search) || m.id.toLowerCase().includes(search) || (m.keywords && m.keywords.some(k => k.toLowerCase().includes(search))));
                
                if (memes.length > 0) {
                    menu.innerHTML = `<div style="padding: 5px 15px; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 5px;">Inyectar Conocimiento W3C</div>`;
                    menu.innerHTML += memes.slice(0, 8).map(m => `
                        <div class="semantic-item type-meme" data-val="#${m.id.replace('meme_','')}" data-type="meme" title="${m.content}">
                            <span style="font-size:1.2rem; color:var(--accent-purple);">🧠</span> 
                            <div>
                                <div style="font-weight:900; font-size:0.85rem;">${m.title}</div>
                                <div style="font-size:0.7rem; color:#888; font-family:monospace;">[${m.category}] ${m.roleTarget || 'Global'}</div>
                            </div>
                        </div>
                    `).join('');
                    this.showFloatingMenu(menu, lastKnownRect);
                } else {
                    menu.style.display = 'none';
                }
            } 
            else if (this.currentWord.startsWith('/')) {
                // 🔥 NUEVAS CONSOLAS INTERACTIVAS (TOTAL FRONTEND)
                menu.innerHTML = `
                    <div style="padding: 5px 15px; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 5px;">Forjar Estructura</div>
                    
                    <div class="semantic-item type-action" data-val="/agente" data-type="action">
                        <span style="font-size:1.5rem;">👤</span> 
                        <div><b style="color:var(--accent-green);">Añadir Nodo / Agente</b><br><span style="font-size:0.75rem;color:#888;">Registra un nuevo talento en el Padrón.</span></div>
                    </div>
                    <div class="semantic-item type-action" data-val="/rol" data-type="action">
                        <span style="font-size:1.5rem;">🪑</span> 
                        <div><b style="color:var(--accent-green);">Forjar Rol VNA (Silla)</b><br><span style="font-size:0.75rem;color:#888;">Añade un nuevo rol estructural al proyecto.</span></div>
                    </div>
                    <div class="semantic-item type-action" data-val="/tuberia" data-type="action">
                        <span style="font-size:1.5rem;">🛤️</span> 
                        <div><b style="color:var(--accent-green);">Trazar Tubería (SOP)</b><br><span style="font-size:0.75rem;color:#888;">Define una entrega de valor entre dos roles.</span></div>
                    </div>

                    <div style="padding: 10px 15px 5px 15px; font-size: 0.75rem; color: #888; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #333; margin-bottom: 5px; margin-top: 10px;">Insertar Componentes</div>
                    
                    <div class="semantic-item type-widget" data-val="/deepwork" data-type="widget">
                        <span style="font-size:1.5rem; color:var(--accent-orange);">🍅</span> 
                        <div><b style="color:white;">Modo DeepWork (Focus)</b><br><span style="font-size:0.75rem;color:#888;">Temporizador Inmersivo + Editor + SOCs.</span></div>
                    </div>
                    <div class="semantic-item type-widget" data-val="/mapa" data-type="widget">
                        <span style="font-size:1.5rem;">🕸️</span> 
                        <div><b style="color:white;">Mapa VNA (Topología)</b><br><span style="font-size:0.75rem;color:#888;">Inyecta el grafo dinámico del Ecosistema.</span></div>
                    </div>
                    <div class="semantic-item type-widget" data-val="/kanban" data-type="widget">
                        <span style="font-size:1.5rem;">📋</span> 
                        <div><b style="color:white;">Mercado Kanban PULL</b><br><span style="font-size:0.75rem;color:#888;">Renderiza oportunidades libres.</span></div>
                    </div>
                    <div class="semantic-item type-widget" data-val="/ledger" data-type="widget">
                        <span style="font-size:1.5rem;">⚖️</span> 
                        <div><b style="color:white;">Ledger (Slicing Pie)</b><br><span style="font-size:0.75rem;color:#888;">Cap Table interactiva y auditada.</span></div>
                    </div>
                `;
                this.showFloatingMenu(menu, lastKnownRect);
            } else {
                menu.style.display = 'none';
                this.isMenuOpen = false;
            }
        });

        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.semantic-item');
            if (item) {
                const replaceVal = item.getAttribute('data-val');
                const type = item.getAttribute('data-type');
                
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                range.setStart(selection.focusNode, range.endOffset - this.currentWord.length);
                range.deleteContents();
                
                if (type === 'widget' || type === 'action') {
                    const widgetId = 'wid_' + Date.now();
                    const el = document.createElement('div');
                    
                    // ---------------------------------------------------------
                    // 🏗️ MINI CONSOLAS INTERACTIVAS (NUEVO SPRINT 43)
                    // ---------------------------------------------------------
                    if (replaceVal === '/agente') {
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false" id="${widgetId}">
                                <div class="omni-widget-header" style="background: rgba(0, 230, 118, 0.1); border-bottom-color: rgba(0, 230, 118, 0.2); color: var(--accent-green);">🤖 Forjar Nodo / Agente</div>
                                <div class="inline-console">
                                    <input type="text" class="inline-input" id="agent_id_${widgetId}" placeholder="Alias del Nodo (ej: @cyber_monk)">
                                    <input type="text" class="inline-input" id="agent_name_${widgetId}" placeholder="Nombre Completo (ej: Agente Auditor)">
                                    <select class="inline-input" id="agent_isai_${widgetId}">
                                        <option value="true">Es una Inteligencia Artificial (A2A)</option>
                                        <option value="false">Es un Humano</option>
                                    </select>
                                    <button class="inline-btn btn-inline-action" data-action="create-agent" data-wid="${widgetId}">Añadir al Padrón Global</button>
                                </div>
                            </div><p><br></p>
                        `;
                    } else if (replaceVal === '/rol') {
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false" id="${widgetId}">
                                <div class="omni-widget-header" style="background: rgba(0, 176, 255, 0.1); border-bottom-color: rgba(0, 176, 255, 0.2); color: var(--accent-blue);">🪑 Forjar Silla (Rol VNA)</div>
                                <div class="inline-console">
                                    <select class="inline-input" id="role_level_${widgetId}">
                                        <option value="@anxaneta">@anxaneta (Cúspide / Dirección)</option>
                                        <option value="@aixecador">@aixecador (Estrategia)</option>
                                        <option value="@dosos">@dosos (Auditoría / Review)</option>
                                        <option value="@baixos" selected>@baixos (Producción Core)</option>
                                        <option value="@pinya">@pinya (Soporte / Infra)</option>
                                    </select>
                                    <input type="text" class="inline-input" id="role_name_${widgetId}" placeholder="Nombre del Rol (ej: Especialista en DevOps)">
                                    <input type="number" class="inline-input" id="role_fmv_${widgetId}" placeholder="Valor de Mercado (FMV €/h, ej: 45)" value="40">
                                    <button class="inline-btn btn-inline-action" data-action="create-role" data-wid="${widgetId}">Inyectar Rol en el Ecosistema</button>
                                </div>
                            </div><p><br></p>
                        `;
                    } else if (replaceVal === '/tuberia') {
                        const projId = this.activeTx ? this.activeTx.projectId : localStorage.getItem('tt_active_project');
                        const p = store.getState().projects.find(x => x.id === projId);
                        let roleOptions = '';
                        if (p && p.roles) {
                            p.roles.forEach(r => { roleOptions += `<option value="${r.id}">[${r.levelId}] ${r.name}</option>`; });
                        } else {
                            roleOptions = `<option value="">Sin red seleccionada</option>`;
                        }
                        
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false" id="${widgetId}">
                                <div class="omni-widget-header" style="background: rgba(224, 64, 251, 0.1); border-bottom-color: rgba(224, 64, 251, 0.2); color: var(--accent-purple);">🛤️ Trazar Tubería de Valor (SOP)</div>
                                <div class="inline-console">
                                    <input type="text" class="inline-input" id="flow_name_${widgetId}" placeholder="Nombre del Entregable (ej: Refactor Componente UI)">
                                    <div style="display:flex; gap:10px;">
                                        <select class="inline-input" id="flow_from_${widgetId}" title="De (Rol Origen)">${roleOptions}</select>
                                        <span style="color:#666; font-size:1.5rem; align-self:center;">&rarr;</span>
                                        <select class="inline-input" id="flow_to_${widgetId}" title="A (Rol Destino)">${roleOptions}</select>
                                    </div>
                                    <div style="display:flex; gap:10px;">
                                        <input type="number" class="inline-input" id="flow_hours_${widgetId}" placeholder="Horas Est." value="4">
                                        <select class="inline-input" id="flow_type_${widgetId}">
                                            <option value="tangible">🟢 Tangible (Código, Diseño)</option>
                                            <option value="intangible">🟣 Intangible (Auditoría, Soporte)</option>
                                        </select>
                                    </div>
                                    <button class="inline-btn btn-inline-action" data-action="create-flow" data-wid="${widgetId}">Trazar Tubería en Mapa</button>
                                </div>
                            </div><p><br></p>
                        `;
                    }
                    // ---------------------------------------------------------
                    // 📊 COMPONENTES DE RENDERIZADO (WIDGETS EXISTENTES)
                    // ---------------------------------------------------------
                    else if (replaceVal === '/mapa') {
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false">
                                <div class="omni-widget-header">🕸️ Topología VNA (Live Render)</div>
                                <div class="omni-widget-body omni-map-canvas" id="canvas_${widgetId}" style="height:350px; position:relative; background:#050508;">
                                    <svg style="position:absolute; top:0; left:0; width:100%; height:100%; z-index:1; pointer-events:none;">
                                        <defs>
                                            <marker id="arrow-tangible-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#00e676"/></marker>
                                            <marker id="arrow-intangible-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#e040fb"/></marker>
                                        </defs>
                                        <g id="svg_${widgetId}"></g>
                                    </svg>
                                </div>
                            </div><p><br></p>
                        `;
                    } else if (replaceVal === '/kanban') {
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false">
                                <div class="omni-widget-header" style="background: rgba(224, 64, 251, 0.1); border-bottom-color: rgba(224, 64, 251, 0.2); color: var(--accent-purple);">📋 Mercado Kanban PULL</div>
                                <div class="omni-widget-body" id="kanban_${widgetId}" style="padding: 1.5rem; background: radial-gradient(circle at top right, #111116 0%, #050505 100%);">
                                </div>
                            </div><p><br></p>
                        `;
                    } else if (replaceVal === '/ledger') {
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false">
                                <div class="omni-widget-header" style="background: rgba(0, 230, 118, 0.1); border-bottom-color: rgba(0, 230, 118, 0.2); color: var(--accent-green);">⚖️ Slicing Pie (Cap Table)</div>
                                <div class="omni-widget-body" id="ledger_${widgetId}" style="padding: 2rem; background: rgba(0,0,0,0.5);">
                                </div>
                            </div><p><br></p>
                        `;
                    } else if (replaceVal === '/deepwork') {
                        if (!this.activeTx) return alert("❌ El Modo Focus requiere una Work Order asignada.");
                        const activeHash = this.activeTx.id || this.activeTx.hash;
                        
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false" style="border-color:var(--accent-orange); box-shadow: 0 10px 40px rgba(255,171,64,0.1);">
                                <div class="omni-widget-body" id="focus_${widgetId}"></div>
                            </div><p><br></p>
                        `;
                    }
                    
                    // Inyección común para Widgets y Actions
                    range.insertNode(el);
                    range.setStartAfter(el);

                    // Hidratación diferida para Widgets
                    if (type === 'widget') {
                        setTimeout(() => {
                            const pId = this.activeTx ? this.activeTx.projectId : localStorage.getItem('tt_active_project');
                            const p = store.getState().projects.find(x => x.id === pId);
                            if(!p) return;

                            if (replaceVal === '/mapa') {
                                const canvas = document.getElementById(`canvas_${widgetId}`);
                                const svgG = document.getElementById(`svg_${widgetId}`);
                                if(canvas && svgG) {
                                    const flows = p.vna_flows && p.vna_flows.length > 0 ? p.vna_flows : (p.transactions || []);
                                    const mr = new MapRenderer(canvas, svgG, { isMacro: true });
                                    mr.setData(p.roles, flows);
                                }
                            } else if (replaceVal === '/kanban') {
                                const container = document.getElementById(`kanban_${widgetId}`);
                                if(container) {
                                    const activeUserId = store.getState().session.activeUserId;
                                    const isPO = p.ownerId === activeUserId || store.getState().session.role === 'ecosystem-owner';
                                    const kr = new KanbanRenderer(container, { project: p, activeUserId: activeUserId, isPO: isPO, currentTab: 'oportunidades', currentFilter: 'all', isMacroMode: true });
                                    kr.render();
                                }
                            } else if (replaceVal === '/ledger') {
                                const container = document.getElementById(`ledger_${widgetId}`);
                                if(container) {
                                    const lr = new LedgerRenderer(container, { projectId: p.id, showHistory: false });
                                    lr.render();
                                }
                            } else if (replaceVal === '/deepwork') {
                                const container = document.getElementById(`focus_${widgetId}`);
                                if(container) {
                                    const fr = new FocusRenderer(container, { 
                                        projectId: p.id, 
                                        woHash: this.activeTx.id || this.activeTx.hash,
                                        onCompleteCallback: (hours) => {
                                            alert(`✅ Tarea Reportada al Ledger (${hours}h).`);
                                            this.loadTaskContext(); 
                                        }
                                    });
                                    fr.render();
                                }
                            }
                        }, 50);
                    }

                } else {
                    // Inserción de Enlaces (Meme o Mention)
                    const htmlClass = type === 'mention' ? 'mention-highlight' : 'meme-highlight';
                    const el = document.createElement('a');
                    el.className = htmlClass;
                    el.href = type === 'mention' ? `/v8/profile?id=${replaceVal}` : `/v8/lms`;
                    el.setAttribute('data-link', '');
                    el.contentEditable = "false";
                    el.innerText = replaceVal;
                    
                    const space = document.createTextNode('\u00A0'); 
                    range.insertNode(space);
                    range.insertNode(el);
                    range.setStartAfter(space);
                }

                selection.removeAllRanges();
                selection.addRange(range);
                
                menu.style.display = 'none';
                this.isMenuOpen = false;
            }
        });
    }

    showFloatingMenu(menu, rect) {
        if (!rect) {
            menu.style.top = '50%'; menu.style.left = '50%';
        } else {
            menu.style.top = `${rect.bottom + 10}px`;
            menu.style.left = `${rect.left}px`;
        }
        menu.style.display = 'block';
        this.isMenuOpen = true;
    }

    // ==========================================
    // DELEGACIÓN DE EVENTOS (INLINE CONSOLES)
    // ==========================================
    async handleInlineConsoleAction(btnElement) {
        const action = btnElement.dataset.action;
        const wid = btnElement.dataset.wid;
        const widgetContainer = document.getElementById(wid);
        if (!widgetContainer) return;

        try {
            if (action === 'create-agent') {
                let id = document.getElementById(`agent_id_${wid}`).value.trim();
                const name = document.getElementById(`agent_name_${wid}`).value.trim();
                const isAi = document.getElementById(`agent_isai_${wid}`).value === 'true';
                
                if (!id || !name) throw new Error("Alias y Nombre son obligatorios.");
                if (!id.startsWith('@')) id = '@' + id; 

                await store.dispatch({ 
                    type: 'ADD_USER', 
                    payload: {
                        id: id, name: name, globalRole: isAi ? 'ai-agent' : 'network-user',
                        profile: { isAi: isAi, preferredEngine: 'deepseek', guardian: 'everyman' }
                    } 
                });
                
                widgetContainer.innerHTML = `<div class="inline-success">✅ Nodo ${id} inscrito en el Padrón Global.</div>`;
            } 
            else if (action === 'create-role') {
                const projId = this.activeTx ? this.activeTx.projectId : localStorage.getItem('tt_active_project');
                if (!projId) throw new Error("No hay proyecto activo.");
                
                const level = document.getElementById(`role_level_${wid}`).value;
                const name = document.getElementById(`role_name_${wid}`).value.trim();
                const fmv = parseFloat(document.getElementById(`role_fmv_${wid}`).value) || 40;
                
                if (!name) throw new Error("Nombre del rol obligatorio.");

                const multipliers = { '@anxaneta': 3.0, '@aixecador': 2.0, '@dosos': 1.5, '@baixos': 1.2, '@pinya': 1.0 };
                const newRole = { id: 'role_' + Date.now(), levelId: level, name: name, fmv: fmv, multiplier: multipliers[level] || 1.0 };

                await store.dispatch({
                    type: 'UPDATE_PROJECT_INFO',
                    payload: { projectId: projId, updates: { roles: [...store.getState().projects.find(p=>p.id===projId).roles, newRole] } }
                });
                
                widgetContainer.innerHTML = `<div class="inline-success">✅ Silla ${name} (${level}) forjada en el Ecosistema.</div>`;
            }
            else if (action === 'create-flow') {
                const projId = this.activeTx ? this.activeTx.projectId : localStorage.getItem('tt_active_project');
                if (!projId) throw new Error("No hay proyecto activo.");
                
                const name = document.getElementById(`flow_name_${wid}`).value.trim();
                const from = document.getElementById(`flow_from_${wid}`).value;
                const to = document.getElementById(`flow_to_${wid}`).value;
                const hours = parseFloat(document.getElementById(`flow_hours_${wid}`).value) || 4;
                const type = document.getElementById(`flow_type_${wid}`).value;

                if (!name || !from || !to) throw new Error("Faltan datos de la Tubería.");

                await store.dispatch({
                    type: 'ADD_FLOW',
                    payload: {
                        projectId: projId,
                        flow: {
                            id: 'flow_' + Date.now(),
                            template: name, from: from, to: to, estimatedHours: hours, tipo: type,
                            soc_checklist: [], required_skills: []
                        }
                    }
                });

                widgetContainer.innerHTML = `<div class="inline-success">✅ Tubería [${name}] trazada en el Mapa VNA.</div>`;
            }
        } catch (e) {
            alert(e.message);
        }
    }

    async convertDraftToTask() {
        const textContent = this.dom.editor.innerText.trim(); 
        if (!textContent) return alert("⚠️ Escribe algo en el borrador antes de convertirlo.");

        let projectId = localStorage.getItem('tt_active_project');
        if (!projectId) {
            const state = store.getState();
            if (state.projects.length === 0) return alert("Crea un Ecosistema (Proyecto) primero.");
            projectId = state.projects[state.projects.length - 1].id;
        }

        const project = store.getState().projects.find(p => p.id === projectId);
        if (!project) return;

        const words = textContent.split(/\s/);
        let assignee = store.getState().session.activeUserId; 
        for (const w of words) {
            if (w.startsWith('@') && w.length > 1) { assignee = w; break; }
        }

        const newHash = 'wo_draft_' + Math.random().toString(36).substr(2, 9);
        
        await store.dispatch({
            type: 'SPAWN_WORK_ORDER',
            payload: {
                projectId: projectId,
                workOrder: {
                    hash: newHash, 
                    flowId: null, 
                    status: 'pinged', 
                    realHours: 0,
                    sprintId: project.activeSprintId,
                    comentario: textContent,
                    soc_checklist: [],
                    assigneeId: assignee
                }
            }
        });

        alert(`🚀 Borrador convertido en Work Order y asignado a ${assignee}. Refrescando interfaz...`);
        window.location.href = `/v8/paper?hash=${newHash}`;
    }

    async submitReport() {
        if (!this.activeTx) return;
        
        const htmlContent = this.dom.editor.innerHTML.trim();
        const textContent = this.dom.editor.innerText.trim(); 

        if (!textContent && htmlContent === '<p><br></p>') return alert("⚠️ No puedes enviar un mensaje vacío a la Usenet.");

        this.dom.btnSubmit.disabled = true;
        this.dom.btnSubmit.innerText = '⏳ Sellando en la Usenet...';
        
        const activeHash = this.activeTx.id || this.activeTx.hash;
        
        const mentions = [];
        const words = textContent.split(/\s/);
        words.forEach(w => {
            if (w.startsWith('@') && w.length > 1) mentions.push(w);
        });

        await store.dispatch({
            type: 'ADD_LOG_ENTRY',
            payload: {
                projectId: this.activeTx.projectId,
                log: {
                    id: 'log_' + Date.now(),
                    date: Date.now(),
                    authorId: store.getState().session.activeUserId,
                    relatedTxHash: activeHash,
                    content: htmlContent, 
                    mentions: mentions, 
                    readBy: []
                }
            }
        });

        this.dom.editor.innerHTML = '<p><br></p>';
        this.loadTaskContext();
        this.dom.btnSubmit.disabled = false;
        this.dom.btnSubmit.innerText = '⚖️ Enviar a Usenet (Sellar)';
    }
}
