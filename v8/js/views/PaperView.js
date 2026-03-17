// v8/js/views/PaperView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; 
import { PageHeader } from '../components/PageHeader.js';
import { MapRenderer } from '../components/MapRenderer.js'; 
import { KanbanRenderer } from '../components/KanbanRenderer.js'; // 🔥 Magia DRY: Importamos el motor del Kanban

export default class PaperView {
    constructor() {
        document.title = "Omni-Paper | TeamTowers V14";
        this.activeTx = null;
        this.isMenuOpen = false;
        this.triggerChar = null;
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
            tagline: "Escribe @ para Agentes, # para Memes W3C, y / para inyectar Widgets (Mapa/Ledger/Kanban)."
        };

        return `
            <style>
                ${MapRenderer.getStyles()}
                ${KanbanRenderer.getStyles()} /* 🔥 DRY: CSS del Kanban integrado en el Paper */

                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace-paper { flex: 1; display: flex; flex-direction: column; position: relative; background: var(--bg-dark); overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; padding: 2rem 3rem; box-sizing: border-box; width: 100%; align-items: center;}
                
                .paper-container { width: 100%; max-width: 800px; display: flex; flex-direction: column; gap: 2rem; margin-top: 2rem;}
                
                .tx-context-bar { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); padding: 15px 20px; border-radius: 12px; border: 1px dashed var(--glass-border); flex-wrap: wrap; gap: 15px;}
                .tx-selector { background: transparent; border: none; color: white; font-size: 1.1rem; font-weight: 900; font-family: var(--font-main); outline: none; cursor: pointer; flex: 1; min-width: 200px; text-overflow: ellipsis;}
                .tx-selector option { background: #111; color: white; }
                .tx-selector optgroup { color: var(--accent-blue); background: #000; font-style: normal;}
                
                .slice-ticker { font-size: 1.2rem; font-family: var(--font-mono); font-weight: 900; color: var(--accent-green); background: rgba(0,230,118,0.1); border: 1px solid rgba(0,230,118,0.3); padding: 8px 16px; border-radius: 20px; display: flex; align-items: center; gap: 8px;}
                .slice-ticker span { font-size: 0.8rem; color: #888; text-transform: uppercase; }

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
                .omni-ledger-table { width: 100%; border-collapse: collapse; font-family: var(--font-main); font-size: 0.95rem;}
                .omni-ledger-table th { text-align: left; padding: 10px 15px; color: #888; border-bottom: 1px solid #333; }
                .omni-ledger-table td { padding: 10px 15px; border-bottom: 1px solid #222; color: white; }

                /* MENÚ AUTOCOMPLETADO (USENET) */
                .semantic-menu { position: absolute; background: rgba(15,15,20,0.95); border: 1px solid var(--accent-blue); border-radius: 12px; max-height: 250px; overflow-y: auto; display: none; z-index: 6000; box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(0,176,255,0.2); backdrop-filter: blur(15px); padding: 5px 0; min-width: 280px; top: 100%; left: 0;}
                .semantic-item { padding: 12px 20px; color: white; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 12px; font-size: 0.95rem; font-family: var(--font-main);}
                .semantic-item:hover, .semantic-item.selected { background: rgba(0,176,255,0.15); }
                .semantic-badge { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-orange); margin-left: auto;}

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
                            <div id="semanticEditor" class="semantic-editor" contenteditable="true" data-placeholder="El lienzo está en blanco. Escribe tu Proof of Work aquí... \n\nUsa @ para consultar a La Colla.\nUsa # para aplicar metodologías W3C.\nUsa / para inyectar Widgets Dinámicos."><p><br></p></div>
                            
                            <div id="semanticMenu" class="semantic-menu"></div>
                        </div>

                        <div class="thread-container">
                            <div class="thread-title">
                                <span>📡 Historial Usenet (Pings)</span>
                                <span id="threadCount" style="color:var(--accent-blue);">0 Logs</span>
                            </div>
                            <div id="threadList"></div>
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

        // 2. LÓGICA DEL OMNI-PAPER EDITOR
        this.setupSemanticEditor();

        // 3. ENVÍO AL LEDGER
        this.dom.btnSubmit.addEventListener('click', () => this.submitReport());
    }

    loadTaskContext() {
        if (!this.activeTx) return;
        this.dom.btnSubmit.style.display = 'block';

        const state = store.getState();
        const p = state.projects.find(x => x.id === this.activeTx.projectId);
        
        let estHours = this.activeTx.horas || this.activeTx.estimatedHours || 2;
        if (!this.activeTx.horas && this.activeTx.flowId) {
            const parentFlow = (p.vna_flows || []).find(f => f.id === this.activeTx.flowId);
            if (parentFlow) estHours = parentFlow.estimatedHours || 2;
        }
        const role = p.roles.find(r => r.id === this.activeTx.from);
        const slices = role ? (estHours * role.fmv * role.multiplier) : 0;
        this.dom.sliceEstimation.innerText = Math.round(slices).toLocaleString();

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
            
            let formattedContent = log.content;
            
            if (log.mentions) {
                log.mentions.forEach(m => {
                    const rgx = new RegExp(`(?<!<[^>]*)${m}`, 'g');
                    formattedContent = formattedContent.replace(rgx, `<span class="mention-highlight">${m}</span>`);
                });
            }
            formattedContent = formattedContent.replace(/(?<!<[^>]*)(#[a-zA-Z0-9_]+)/g, `<span class="meme-highlight">$1</span>`);

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
        
        // 🔥 HIDRATACIÓN DE WIDGETS DRY (Mapas y Kanbans inyectados)
        setTimeout(() => {
            // Hidratar Mapas
            const maps = this.dom.threadList.querySelectorAll('.omni-map-canvas');
            maps.forEach(canvas => {
                const svg = canvas.querySelector('svg > g');
                if(svg && project) {
                    const flows = project.vna_flows && project.vna_flows.length > 0 ? project.vna_flows : (project.transactions || []);
                    const mr = new MapRenderer(canvas, svg, { isMacro: true });
                    mr.setData(project.roles, flows);
                }
            });

            // Hidratar Kanban (Mercado Pull)
            const kanbans = this.dom.threadList.querySelectorAll('[id^="kanban_"]');
            kanbans.forEach(container => {
                if (project) {
                    const activeUserId = state.session.activeUserId;
                    const isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';
                    
                    const kr = new KanbanRenderer(container, {
                        project: project,
                        activeUserId: activeUserId,
                        isPO: isPO,
                        currentTab: 'oportunidades', // Renderizamos las tareas libres para mostrar contexto
                        currentFilter: 'all'
                    });
                    kr.render();
                }
            });
        }, 100);

        setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
    }

    setupSemanticEditor() {
        const input = this.dom.editor;
        const menu = this.dom.menu;
        const state = store.getState();

        input.addEventListener('keyup', (e) => {
            const selection = window.getSelection();
            if (!selection.focusNode) return;
            
            const text = selection.focusNode.textContent;
            const cursorIdx = selection.focusOffset;
            const textBeforeCursor = text.substring(0, cursorIdx);
            const words = textBeforeCursor.split(/\s/);
            this.currentWord = words[words.length - 1];

            if (this.currentWord.startsWith('@')) {
                const search = this.currentWord.substring(1).toLowerCase();
                const users = state.globalUsers.filter(u => u.name.toLowerCase().includes(search) || u.id.toLowerCase().includes(search));
                
                if (users.length > 0) {
                    menu.innerHTML = users.map(u => `
                        <div class="semantic-item" data-val="${u.id}" data-type="mention">
                            <span style="font-size:1.5rem;">${u.profile?.isAi ? '🤖' : '👤'}</span> 
                            <div>
                                <div style="font-weight:900;">${u.name}</div>
                                <div style="font-size:0.75rem; color:#888;">${u.profile?.isAi ? 'Agente A2A' : 'Humano'}</div>
                            </div>
                            <span class="semantic-badge">${u.id}</span>
                        </div>
                    `).join('');
                    this.showMenu(menu);
                    this.triggerChar = '@';
                } else {
                    menu.style.display = 'none';
                }
            } else if (this.currentWord.startsWith('#')) {
                menu.innerHTML = `
                    <div class="semantic-item" data-val="#SOP_Review" data-type="meme"><span>📄</span> <b>SOP_Review</b> <span class="semantic-badge">Methodology</span></div>
                    <div class="semantic-item" data-val="#CleanCode" data-type="meme"><span>✨</span> <b>CleanCode</b> <span class="semantic-badge">SOC</span></div>
                    <div class="semantic-item" data-val="#VNA_Mapping" data-type="meme"><span>🕸️</span> <b>VNA_Mapping</b> <span class="semantic-badge">Framework</span></div>
                `;
                this.showMenu(menu);
                this.triggerChar = '#';
            } else if (this.currentWord.startsWith('/')) {
                menu.innerHTML = `
                    <div class="semantic-item" data-val="/mapa" data-type="widget">
                        <span style="font-size:1.5rem;">🕸️</span> 
                        <div><b>Inyectar Mapa VNA</b><br><span style="font-size:0.75rem;color:#888;">Renderiza la topología de la red actual.</span></div>
                    </div>
                    <div class="semantic-item" data-val="/ledger" data-type="widget">
                        <span style="font-size:1.5rem;">⚖️</span> 
                        <div><b>Inyectar Cap Table</b><br><span style="font-size:0.75rem;color:#888;">Tabla Slicing Pie en tiempo real.</span></div>
                    </div>
                    <div class="semantic-item" data-val="/kanban" data-type="widget">
                        <span style="font-size:1.5rem;">📋</span> 
                        <div><b>Inyectar Mercado PULL</b><br><span style="font-size:0.75rem;color:#888;">Renderiza las oportunidades libres del Sprint.</span></div>
                    </div>
                `;
                this.showMenu(menu);
                this.triggerChar = '/';
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
                
                if (type === 'widget') {
                    const widgetId = 'wid_' + Date.now();
                    const el = document.createElement('div');
                    
                    if (replaceVal === '/mapa') {
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
                        range.insertNode(el);
                        range.setStartAfter(el);
                        
                        setTimeout(() => {
                            const canvas = document.getElementById(`canvas_${widgetId}`);
                            const svgG = document.getElementById(`svg_${widgetId}`);
                            const p = store.getState().projects.find(x => x.id === this.activeTx.projectId);
                            if(p && canvas && svgG) {
                                const flows = p.vna_flows && p.vna_flows.length > 0 ? p.vna_flows : (p.transactions || []);
                                const mr = new MapRenderer(canvas, svgG, { isMacro: true });
                                mr.setData(p.roles, flows);
                            }
                        }, 50);

                    } else if (replaceVal === '/ledger') {
                        const harvest = store.calculateHarvest(this.activeTx.projectId) || [];
                        let trs = harvest.map(h => {
                            const u = store.getState().globalUsers.find(gu => gu.id === (h.user||h.userId));
                            return `<tr><td>${u ? u.name : (h.user||h.userId)}</td><td><span style="color:var(--accent-green); font-weight:bold;">${Math.round(h.slices)}</span></td><td>${h.percentage}%</td></tr>`;
                        }).join('');
                        if(!trs) trs = `<tr><td colspan="3" style="text-align:center; color:#666;">Ledger vacío.</td></tr>`;

                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false">
                                <div class="omni-widget-header">⚖️ Slicing Pie (Cap Table Activa)</div>
                                <div class="omni-widget-body" style="background: rgba(0,0,0,0.5);">
                                    <table class="omni-ledger-table">
                                        <tr><th>Nodo</th><th>Equidad (Slices)</th><th>% Red</th></tr>
                                        ${trs}
                                    </table>
                                </div>
                            </div><p><br></p>
                        `;
                        range.insertNode(el);
                        range.setStartAfter(el);
                    } else if (replaceVal === '/kanban') {
                        // 🔥 INYECCIÓN DEL KANBAN RENDERER
                        el.innerHTML = `
                            <div class="omni-widget" contenteditable="false">
                                <div class="omni-widget-header" style="background: rgba(224, 64, 251, 0.1); border-bottom-color: rgba(224, 64, 251, 0.2); color: var(--accent-purple);">📋 Mercado Kanban PULL</div>
                                <div class="omni-widget-body" id="kanban_${widgetId}" style="padding: 1.5rem; background: radial-gradient(circle at top right, #111116 0%, #050505 100%);">
                                    </div>
                            </div><p><br></p>
                        `;
                        range.insertNode(el);
                        range.setStartAfter(el);

                        setTimeout(() => {
                            const container = document.getElementById(`kanban_${widgetId}`);
                            const p = store.getState().projects.find(x => x.id === this.activeTx.projectId);
                            if(p && container) {
                                const activeUserId = store.getState().session.activeUserId;
                                const isPO = p.ownerId === activeUserId || store.getState().session.role === 'ecosystem-owner';
                                const kr = new KanbanRenderer(container, {
                                    project: p,
                                    activeUserId: activeUserId,
                                    isPO: isPO,
                                    currentTab: 'oportunidades',
                                    currentFilter: 'all'
                                });
                                kr.render();
                            }
                        }, 50);
                    }
                } else {
                    const htmlClass = type === 'mention' ? 'mention-highlight' : 'meme-highlight';
                    const el = document.createElement('span');
                    el.className = htmlClass;
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

    showMenu(menu) {
        menu.style.display = 'block';
        this.isMenuOpen = true;
    }

    async submitReport() {
        if (!this.activeTx) return;
        
        const htmlContent = this.dom.editor.innerHTML.trim();
        const textContent = this.dom.editor.innerText.trim(); 

        if (!textContent && htmlContent === '<p><br></p>') return alert("⚠️ No puedes sellar un lienzo vacío. Escribe tu Proof of Work.");

        this.dom.btnSubmit.disabled = true;
        this.dom.btnSubmit.innerText = '⏳ Sellando en la Usenet...';
        
        const activeHash = this.activeTx.id || this.activeTx.hash;
        const p = store.getState().projects.find(x => x.id === this.activeTx.projectId);
        
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

        const isV10 = p.work_orders && p.work_orders.some(w => w.hash === activeHash);
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
                comentario: "Proof of Work adjunto en el log semántico.",
                proofLink: 'Usenet_Thread'
            }
        });

        this.dom.editor.innerHTML = '<p><br></p>';
        this.loadTaskContext();
        this.dom.btnSubmit.disabled = false;
        this.dom.btnSubmit.innerText = '⚖️ Sellar Proof of Work';
    }
}
