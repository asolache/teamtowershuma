// =============================================================================
// TEAMTOWERS SOS V10 — PAPER VIEW
// Ruta: ia/dev/js/views/PaperView.js
// Omni-Paper · Chat IDE · GTD Canvas · Pomodoro · Swarm Memory
// =============================================================================

import { store }            from '../core/store.js';
import { KB }               from '../core/kb.js';
import { Sidebar }          from '../components/Sidebar.js';
import { BottomNav }        from '../components/BottomNav.js';
import { PageHeader }       from '../components/PageHeader.js';
import { Orchestrator }     from '../core/Orchestrator.js';
import { SandboxRenderer }  from '../components/SandboxRenderer.js';

export default class PaperView {

    constructor() {
        document.title        = 'Omni-Paper | TeamTowers V10';
        this.woHash           = new URLSearchParams(window.location.search).get('hash');
        this.activeTx         = null;
        this.activeProjectId  = null;
        this.isMenuOpen       = false;
        this.pomodoroInterval = null;
        this.pomodoroSeconds  = 0;
        this.isPomodoroRunning = false;
        this.sandbox          = null;
        this.chatHistory      = [];
        this.dom              = {};
        this.loadProjectTasks = null;
    }

    async getHtml() {
        await store.init();
        const state = store.getState();
        this.activeProjectId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === this.activeProjectId);
        if (!project && state.projects.length > 0) {
            project = state.projects.at(-1);
            this.activeProjectId = project.id;
        }

        if (!project) return `
            <div class="app-layout">
                ${Sidebar.getHtml('/paper')}
                <main class="workspace" style="justify-content:center; align-items:center; display:flex;">
                    <div class="glass-panel" style="text-align:center; max-width:500px; padding:4rem;">
                        <div style="font-size:5rem; margin-bottom:1.5rem;">📝</div>
                        <h2 style="color:white; margin-top:0; font-weight:900;">Sin Red Asignada</h2>
                        <p style="color:var(--text-muted); margin-bottom:2rem;">Crea un ecosistema para activar el Omni-Paper.</p>
                        <a href="/create" data-link class="btn-primary" style="text-decoration:none;">➕ Forjar Ecosistema</a>
                    </div>
                </main>
            </div>`;

        // Agentes IA disponibles
        const aiUsers    = state.globalUsers.filter(u => u.profile?.isAi);
        const priorityIds = ['@agent_web_deployer','@agent_codex_developer','@agent_skill_crafter','@agent_tdd_auditor'];
        const priority   = priorityIds.map(id => aiUsers.find(a => a.id === id)).filter(Boolean);
        const rest        = aiUsers.filter(a => !priorityIds.includes(a.id));
        let agentOptions  = [...priority, ...rest].map(ai =>
            `<option value="${ai.id}">🤖 ${ai.name}</option>`
        ).join('');

        const headerConfig = {
            title:   'Omni-Paper (Chat IDE & GTD)',
            subtitle: project.nombre,
            tagline: 'Lienzo Universal: Ejecuta Tareas o interactúa con el Swarm para generar código, documentos o mutar agentes.',
            tabs:    []
        };

        return `
        <style>
            .app-layout       { display:flex; height:100dvh; overflow:hidden; background:var(--bg-dark); font-family:var(--font-main); width:100%; }
            .workspace-paper  { flex:1; display:flex; flex-direction:column; position:relative; background:radial-gradient(circle at center,#111116 0%,#050505 100%); overflow-y:auto; overflow-x:hidden; padding:2rem 3rem; box-sizing:border-box; align-items:center; }

            .paper-container  { width:100%; max-width:1300px; display:flex; flex-direction:column; gap:1rem; margin-top:1.5rem; padding-bottom:8rem; flex:1; }

            .breadcrumb-bar   { display:flex; align-items:center; background:rgba(10,10,15,0.8); padding:10px 14px; border-radius:12px; border:1px solid var(--glass-border); gap:10px; flex-wrap:wrap; }
            .bc-select        { background:rgba(0,0,0,0.5); border:1px solid #333; color:white; font-size:0.88rem; font-weight:bold; font-family:var(--font-main); outline:none; cursor:pointer; padding:7px 11px; border-radius:8px; transition:0.3s; }
            .bc-select:focus  { border-color:var(--accent-indigo); }
            .bc-separator     { color:#555; font-weight:bold; }

            /* IDE MODE */
            .ide-mode-panel   { display:grid; grid-template-columns:420px 1fr; gap:18px; flex:1; min-height:520px; }
            .chat-panel       { background:rgba(10,10,15,0.9); border:1px solid var(--glass-border); border-radius:14px; display:flex; flex-direction:column; overflow:hidden; }
            .chat-header      { padding:13px; border-bottom:1px dashed rgba(255,255,255,0.08); background:rgba(0,0,0,0.5); }
            .chat-header select { background:#050508; border:1px solid var(--accent-purple); color:var(--accent-purple); padding:9px; border-radius:8px; width:100%; font-weight:bold; outline:none; cursor:pointer; }
            .chat-history     { flex:1; padding:13px; overflow-y:auto; display:flex; flex-direction:column; gap:12px; scroll-behavior:smooth; }
            .msg-bubble       { max-width:92%; padding:11px 14px; border-radius:12px; font-size:0.9rem; line-height:1.5; white-space:pre-wrap; }
            .msg-user         { background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.2); color:white; align-self:flex-end; border-bottom-right-radius:2px; }
            .msg-ai           { background:rgba(224,64,251,0.05); border:1px solid rgba(224,64,251,0.2); color:#ccc; align-self:flex-start; border-bottom-left-radius:2px; }
            .msg-ai-artifact  { border-color:var(--accent-orange); color:var(--accent-orange); font-family:var(--font-mono); font-size:0.8rem; cursor:pointer; transition:0.2s; }
            .msg-ai-artifact:hover { background:rgba(255,145,0,0.1); box-shadow:0 0 15px rgba(255,145,0,0.2); }
            .chat-input-area  { padding:13px; background:rgba(0,0,0,0.6); border-top:1px solid var(--glass-border); display:flex; flex-direction:column; gap:8px; }
            .chat-textarea    { width:100%; background:#050508; border:1px solid #444; color:white; border-radius:10px; padding:11px; font-family:var(--font-main); font-size:0.9rem; resize:none; outline:none; min-height:75px; box-sizing:border-box; transition:0.3s; }
            .chat-textarea:focus { border-color:var(--accent-indigo); }
            .btn-send         { background:linear-gradient(135deg, var(--accent-indigo), var(--accent-purple)); border:none; color:white; padding:11px; border-radius:8px; font-weight:900; cursor:pointer; transition:0.2s; display:flex; align-items:center; justify-content:center; gap:8px; }
            .btn-send:hover   { filter:brightness(1.2); transform:translateY(-2px); }
            .btn-send:disabled { opacity:0.5; pointer-events:none; filter:grayscale(1); }
            .sandbox-panel    { background:repeating-linear-gradient(45deg,rgba(255,255,255,0.01) 0px,rgba(255,255,255,0.01) 10px,transparent 10px,transparent 20px),#050508; border:1px dashed #333; border-radius:14px; display:flex; justify-content:center; align-items:center; overflow:hidden; position:relative; }
            .sandbox-empty    { color:#555; text-align:center; font-family:var(--font-mono); font-size:0.9rem; padding:2rem; }

            /* GTD MODE */
            .gtd-mode-panel   { display:none; width:100%; max-width:900px; margin:0 auto; flex-direction:column; gap:18px; }
            .pomodoro-panel   { background:linear-gradient(145deg,rgba(20,20,25,0.9),rgba(10,10,15,0.95)); border:1px solid var(--accent-orange); border-radius:22px; padding:2rem; text-align:center; box-shadow:0 15px 35px rgba(255,171,64,0.1); transition:0.3s; }
            .pomodoro-panel.running { border-color:var(--accent-green); animation:breathe 3s ease-in-out infinite; }
            .timer-display    { font-size:3.5rem; font-weight:900; font-family:var(--font-mono); color:white; letter-spacing:4px; margin:1rem 0; text-shadow:0 0 30px rgba(255,171,64,0.4); }
            .pomodoro-panel.running .timer-display { text-shadow:0 0 30px rgba(0,230,118,0.5); color:var(--accent-green); }

            .task-card-view   { background:rgba(10,10,15,0.8); border:1px solid var(--glass-border); border-radius:18px; padding:2rem; }
            .task-title-view  { font-size:1.6rem; font-weight:900; color:white; margin-bottom:0.75rem; }
            .task-meta        { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:1.5rem; }
            .pow-fields       { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem; }
            .pow-group label  { display:block; font-size:0.72rem; color:#888; text-transform:uppercase; font-weight:bold; margin-bottom:5px; }
            .pow-input        { width:100%; background:rgba(0,0,0,0.5); border:1px solid #333; color:white; padding:10px 12px; border-radius:8px; font-size:0.9rem; outline:none; box-sizing:border-box; }
            .pow-input.mono   { font-family:var(--font-mono); }
            .semantic-editor  { background:rgba(0,0,0,0.4); border:1px solid #333; border-radius:10px; padding:1rem; min-height:150px; color:white; font-size:0.9rem; line-height:1.7; outline:none; }
            .soc-item-check   { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.88rem; color:#ccc; }

            .action-bar-fixed { position:sticky; bottom:0; background:rgba(5,5,8,0.98); backdrop-filter:blur(15px); padding:14px 2rem; display:flex; gap:12px; justify-content:flex-end; border-top:1px solid var(--glass-border); z-index:100; }
            .btn-action-draft { background:transparent; border:1px solid var(--accent-indigo); color:var(--accent-indigo); padding:11px 22px; border-radius:12px; font-weight:900; cursor:pointer; transition:0.3s; }
            .btn-action-pow   { background:linear-gradient(135deg,var(--accent-green),#00b341); color:black; border:none; padding:11px 22px; border-radius:12px; font-weight:900; cursor:pointer; transition:0.3s; }

            @keyframes breathe { 0%,100%{box-shadow:0 15px 35px rgba(0,230,118,0.1);} 50%{box-shadow:0 15px 35px rgba(0,230,118,0.3);} }
            @media (max-width:1024px) { .ide-mode-panel { grid-template-columns:340px 1fr; } }
            @media (max-width:768px)  { .ide-mode-panel { grid-template-columns:1fr; display:flex; flex-direction:column-reverse; min-height:auto; } .workspace-paper { padding:80px 1rem 120px 1rem; } .sandbox-panel { min-height:360px; } }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/paper')}
            <main class="workspace-paper" id="paperWorkspace">
                ${PageHeader.getHtml(headerConfig)}

                <div class="paper-container">
                    <!-- Breadcrumb / Selector -->
                    <div class="breadcrumb-bar">
                        <span style="font-size:1.1rem;">🏰</span>
                        <select id="selProject" class="bc-select">
                            ${state.projects.map(p => `<option value="${p.id}" ${p.id === this.activeProjectId ? 'selected' : ''}>${p.nombre}</option>`).join('')}
                        </select>
                        <span class="bc-separator">/</span>
                        <span style="font-size:1.1rem;">🎯</span>
                        <select id="omniSelector" class="bc-select" style="flex:1;">
                            <option value="ide">🚀 Omni-Sandbox (UI, Docs & Skills)</option>
                        </select>
                    </div>

                    <!-- IDE MODE -->
                    <div class="ide-mode-panel" id="ideModePanel">
                        <div class="chat-panel">
                            <div class="chat-header">
                                <label style="font-size:0.68rem; color:#888; text-transform:uppercase; margin-bottom:4px; display:block;">🗣️ Interlocutor IA (Swarm Memory)</label>
                                <select id="selAgentTarget">${agentOptions}</select>
                            </div>
                            <div class="chat-history" id="chatHistory">
                                <div class="msg-bubble msg-ai">
                                    ¡Ommmm! Sandbox V10 activado.<br><br>
                                    • <b>Web Deployer</b> → renderiza componentes UI.<br>
                                    • <b>Skill Crafter</b> → evoluciona Skills del KB.<br>
                                    • <b>TDD Auditor</b> → redacta contratos y documentos.<br>
                                    Motor primario: <b style="color:var(--accent-indigo);">Anthropic claude-sonnet-4</b>.
                                </div>
                            </div>
                            <div class="chat-input-area">
                                <textarea id="inpChatPrompt" class="chat-textarea" placeholder="Ej: Crea una skill para analizar VNA..."></textarea>
                                <button class="btn-send" id="btnSendPrompt">🚀 Enviar Directiva</button>
                            </div>
                        </div>
                        <div class="sandbox-panel" id="sandboxMount">
                            <div class="sandbox-empty" id="sbEmptyState">
                                <span style="font-size:3rem; display:block; margin-bottom:1rem; opacity:0.5;">⚡</span>
                                Esperando Artifact (Código, Doc o Mutación)…
                            </div>
                        </div>
                    </div>

                    <!-- GTD MODE -->
                    <div class="gtd-mode-panel" id="gtdModePanel">
                        <div class="pomodoro-panel" id="pomoPanel">
                            <div style="color:var(--text-muted); font-size:0.82rem; text-transform:uppercase; font-weight:bold; letter-spacing:2px;">Tiempo de Foco Activo</div>
                            <div class="timer-display" id="timeDisplay">00:00:00</div>
                            <div style="font-family:var(--font-mono); color:#888; font-size:0.78rem;">El tiempo se inyectará en el Slicing Pie al sellar.</div>
                            <div style="display:flex; gap:12px; justify-content:center; margin-top:1.25rem;">
                                <button id="btnPlay"  class="btn-action-pow" style="display:flex; align-items:center; gap:6px; padding:10px 20px;">▶ Iniciar Foco</button>
                                <button id="btnPause" class="btn-action-draft" style="display:none; padding:10px 20px;">⏸ Pausar</button>
                            </div>
                        </div>

                        <div class="task-card-view" id="taskCardView">
                            <div class="task-title-view" id="taskTitle">—</div>
                            <div class="task-meta">
                                <span id="taskRole"   style="font-size:0.8rem; color:var(--accent-indigo); font-family:var(--font-mono); background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.3); padding:3px 8px; border-radius:6px;"></span>
                                <span id="taskStatus" style="font-size:0.8rem; color:var(--accent-green);  font-family:var(--font-mono); background:rgba(0,230,118,0.1);  border:1px solid rgba(0,230,118,0.3);  padding:3px 8px; border-radius:6px;"></span>
                            </div>
                            <div id="taskDesc" style="color:#aaa; font-size:0.88rem; line-height:1.6; margin-bottom:1.5rem; font-style:italic;"></div>

                            <div id="taskSocsContainer" style="margin-bottom:1.5rem;"></div>

                            <div class="pow-fields">
                                <div class="pow-group">
                                    <label>🔗 Enlace Proof of Work</label>
                                    <input type="url" id="inpPowLink" class="pow-input" placeholder="https://github.com/...">
                                </div>
                                <div class="pow-group">
                                    <label>⏱ Tiempo Imputado (H)</label>
                                    <input type="number" step="0.01" id="inpPowHours" class="pow-input mono" readonly>
                                </div>
                            </div>

                            <label style="font-size:0.72rem; color:#888; text-transform:uppercase; font-weight:bold; display:block; margin-bottom:6px;">Proof of Work</label>
                            <div id="semanticEditor" class="semantic-editor" contenteditable="true" data-placeholder="Documenta tu Proof of Work aquí…"><p><br></p></div>
                        </div>
                    </div>
                </div>

                <div class="action-bar-fixed" id="gtdActionBar" style="display:none;">
                    <button class="btn-action-draft" id="btnSaveTaskDraft">💾 Guardar Borrador</button>
                    <button class="btn-action-pow"   id="btnSubmitReport">🚀 Sellar Proof of Work</button>
                </div>
            </main>

            ${BottomNav.getHtml('/paper')}
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender();

        this.sandbox = new SandboxRenderer('sandboxMount');
        const state  = store.getState();
        const activeUserId = state.session.activeUserId;

        this.dom = {
            selProject:    document.getElementById('selProject'),
            omniSelector:  document.getElementById('omniSelector'),
            ideModePanel:  document.getElementById('ideModePanel'),
            gtdModePanel:  document.getElementById('gtdModePanel'),
            gtdActionBar:  document.getElementById('gtdActionBar'),
            history:       document.getElementById('chatHistory'),
            input:         document.getElementById('inpChatPrompt'),
            btnSend:       document.getElementById('btnSendPrompt'),
            selAgent:      document.getElementById('selAgentTarget'),
            sbEmpty:       document.getElementById('sbEmptyState'),
            pomoPanel:     document.getElementById('pomoPanel'),
            timeDisplay:   document.getElementById('timeDisplay'),
            btnPlay:       document.getElementById('btnPlay'),
            btnPause:      document.getElementById('btnPause'),
            taskTitle:     document.getElementById('taskTitle'),
            taskRole:      document.getElementById('taskRole'),
            taskStatus:    document.getElementById('taskStatus'),
            taskDesc:      document.getElementById('taskDesc'),
            taskSocs:      document.getElementById('taskSocsContainer'),
            inpPowLink:    document.getElementById('inpPowLink'),
            inpPowHours:   document.getElementById('inpPowHours'),
            editor:        document.getElementById('semanticEditor'),
            btnSubmit:     document.getElementById('btnSubmitReport'),
            btnSaveTaskDraft: document.getElementById('btnSaveTaskDraft')
        };

        // ── Cargador de tareas del proyecto ───────────────────────
        this.loadProjectTasks = async (projId) => {
            const p = store.getState().projects.find(x => x.id === projId);
            if (!p) return;
            let tasks = p.work_orders?.length > 0 ? p.work_orders : (p.transactions || []);
            tasks = (state.session.role === 'ecosystem-owner' || p.ownerId === activeUserId)
                ? tasks.filter(tx => tx.status !== 'theoretical')
                : tasks.filter(tx => tx.assigneeId === activeUserId || tx.workerId === activeUserId);

            let selectHtml = `<option value="ide">🚀 Omni-Sandbox (UI, Docs & Skills)</option>`;
            if (tasks.length > 0) {
                selectHtml += `<optgroup label="🎯 Tareas Asignadas (Modo GTD)">`;
                tasks.forEach(t => {
                    const pf = (p.vna_flows || []).find(f => f.id === t.flowId) || t;
                    selectHtml += `<option value="${t.id || t.hash}">[WO] ${(pf.template || pf.entregable || t.comentario || 'WO').substring(0, 42)}</option>`;
                });
                selectHtml += `</optgroup>`;
            }
            this.dom.omniSelector.innerHTML = selectHtml;
        };

        await this.loadProjectTasks(this.activeProjectId);

        // ── Cambio de proyecto ────────────────────────────────────
        this.dom.selProject?.addEventListener('change', async (e) => {
            this.activeProjectId = e.target.value;
            localStorage.setItem('tt_active_project', this.activeProjectId);
            await this.loadProjectTasks(this.activeProjectId);
            this.activeTx = null;
            this._stopPomodoro();
            this._setIdeMode();
        });

        // ── Selector de modo ──────────────────────────────────────
        this.dom.omniSelector?.addEventListener('change', async (e) => {
            const val = e.target.value;
            this._stopPomodoro();
            if (val === 'ide') { this.activeTx = null; this._setIdeMode(); }
            else {
                const proj = store.getState().projects.find(x => x.id === this.activeProjectId);
                this.activeTx = (proj?.work_orders || []).find(t => (t.id || t.hash) === val) || null;
                if (this.activeTx) this._setGtdMode();
            }
        });

        // ── Cambio de agente ──────────────────────────────────────
        this.dom.selAgent?.addEventListener('change', () => {
            const name = this.dom.selAgent.options[this.dom.selAgent.selectedIndex].text;
            this._addMessage(`🔄 Enrutando comunicación a: <b>${name}</b>.`, 'ai');
        });

        // ── Enviar mensaje ────────────────────────────────────────
        this.dom.btnSend?.addEventListener('click', () => this._handleSendMessage());
        this.dom.input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._handleSendMessage(); }
        });

        // ── Pomodoro ──────────────────────────────────────────────
        this._setupPomodoro();

        // ── Guardar borrador ──────────────────────────────────────
        this.dom.btnSaveTaskDraft?.addEventListener('click', () => this._saveTaskDraft());

        // ── Sellar PoW ────────────────────────────────────────────
        this.dom.btnSubmit?.addEventListener('click', async () => {
            if (!this.activeTx) return;
            const hours   = parseFloat(this.dom.inpPowHours.value) || 0;
            const link    = this.dom.inpPowLink.value.trim();
            const content = this.dom.editor.innerHTML.trim();
            if (!hours || hours <= 0) return alert('Introduce las horas trabajadas.');
            if (!link)                return alert('Añade el enlace de Proof of Work (GitHub, Figma, etc.).');

            const btn = this.dom.btnSubmit;
            btn.disabled = true; btn.innerText = '⏳ Sellando…';
            this._stopPomodoro();

            await store.dispatch({
                type: 'REPORT_WORK_ORDER',
                payload: {
                    projectId: this.activeProjectId,
                    woHash:    this.activeTx.hash || this.activeTx.id,
                    realHours: hours,
                    comentario: content.replace(/<[^>]*>/g, '').substring(0, 500),
                    proofLink: link
                }
            });

            btn.disabled  = false;
            btn.innerText = '✅ PoW Sellado';
            setTimeout(() => { btn.innerText = '🚀 Sellar Proof of Work'; }, 3000);
            await this.loadProjectTasks(this.activeProjectId);
        });

        // ── Auto-cargar WO si viene de URL con hash ───────────────
        if (this.woHash) {
            const proj = store.getState().projects.find(x => x.id === this.activeProjectId);
            this.activeTx = (proj?.work_orders || []).find(t => (t.id || t.hash) === this.woHash);
            if (this.activeTx) this._setGtdMode();
        } else {
            this._setIdeMode();
        }
    }

    // ── Modo IDE ──────────────────────────────────────────────────
    _setIdeMode() {
        this.dom.gtdModePanel.style.display  = 'none';
        this.dom.gtdActionBar.style.display  = 'none';
        this.dom.ideModePanel.style.display  = window.innerWidth <= 768 ? 'flex' : 'grid';
    }

    // ── Modo GTD ──────────────────────────────────────────────────
    _setGtdMode() {
        if (!this.activeTx) return;
        this.dom.ideModePanel.style.display = 'none';
        this.dom.gtdModePanel.style.display = 'flex';
        this.dom.gtdActionBar.style.display = 'flex';

        const proj      = store.getState().projects.find(x => x.id === this.activeProjectId);
        const parentFlow = (proj?.vna_flows || []).find(f => f.id === this.activeTx.flowId) || this.activeTx;
        const role       = proj?.roles?.find(r => r.id === parentFlow.to);

        this.dom.taskTitle.textContent  = parentFlow.template || parentFlow.entregable || 'Work Order';
        this.dom.taskRole.textContent   = role ? `${role.name} (${role.levelId})` : parentFlow.to || '—';
        this.dom.taskStatus.textContent = this.activeTx.status?.toUpperCase() || '—';
        this.dom.taskDesc.innerHTML     = (this.activeTx.comentario || parentFlow.context || '').replace(/\n/g, '<br>');

        // SOCs
        const socs = this.activeTx.soc_checklist?.length > 0 ? this.activeTx.soc_checklist : (parentFlow.soc_checklist || []);
        this.dom.taskSocs.innerHTML = socs.length > 0
            ? '<label style="font-size:0.72rem; color:#888; text-transform:uppercase; font-weight:bold; margin-bottom:8px; display:block;">Criterios de Aceptación (SOCs)</label>' +
              socs.map(soc => `<div class="soc-item-check"><input type="checkbox" id="${soc.id}" ${soc.isChecked ? 'checked' : ''}><span>${soc.text}</span></div>`).join('')
            : '<div style="color:#555; font-style:italic; font-size:0.82rem;">No hay SOCs asociados.</div>';

        this.dom.inpPowLink.value = this.activeTx.draftLink || this.activeTx.proofLink || '';
        const savedHours = this.activeTx.draftHours || this.activeTx.realHours || 0;
        if (savedHours > 0) {
            this.pomodoroSeconds = Math.floor(savedHours * 3600);
            this._updatePomodoroDisplay();
            this.dom.inpPowHours.value = savedHours.toFixed(3);
        } else {
            this.pomodoroSeconds = 0;
            this._updatePomodoroDisplay();
            this.dom.inpPowHours.value = parentFlow.estimatedHours || parentFlow.horas || 1;
        }

        this.dom.editor.innerHTML = this.activeTx.draftContent || '<p><br></p>';

        const editable = this.activeTx.status === 'pinged';
        this.dom.btnSubmit.style.display       = editable ? 'block' : 'none';
        this.dom.btnSaveTaskDraft.style.display = editable ? 'block' : 'none';
        this.dom.btnPlay.style.display          = editable ? 'flex'  : 'none';
        this.dom.editor.contentEditable         = editable ? 'true'  : 'false';
        this.dom.inpPowLink.disabled            = !editable;
        if (!editable) this.dom.taskSocs.querySelectorAll('input').forEach(i => i.disabled = true);
    }

    // ── Enviar mensaje al Swarm ───────────────────────────────────
    async _handleSendMessage() {
        const text = this.dom.input.value.trim();
        if (!text) return;

        const targetAgentId   = this.dom.selAgent.value;
        const targetAgentName = this.dom.selAgent.options[this.dom.selAgent.selectedIndex].text;

        this._addMessage(text, 'user');
        this.dom.input.value  = '';
        this.dom.btnSend.disabled = true;
        this.dom.btnSend.innerText = '⏳ Orquestando…';

        try {
            await KB.init();
            const promptNode = await KB.getNode(`prompt_global_${targetAgentId.replace('@', '')}`);
            let systemPrompt = promptNode?.content || `Eres ${targetAgentName}, agente del Swarm SOS V10.`;

            // Inyectar Skills del cinturón
            if (promptNode?.dependencies?.length) {
                systemPrompt += '\n\nSOPs DISPONIBLES:\n';
                for (const skillId of promptNode.dependencies) {
                    const skill = await KB.getNode(skillId);
                    if (skill) systemPrompt += `\n--- SKILL: ${skill.title} ---\n${skill.content}\n`;
                }
            }

            const currentArtifactState = this.sandbox?.currentData
                ? JSON.stringify(this.sandbox.currentData)
                : 'Ningún artifact activo.';

            systemPrompt += `

[PROTOCOLO OMNI-PAPER V10 — STRICT JSON]:
Operas en modo "Swarm Memory". Responde SIEMPRE con un ÚNICO objeto JSON válido. Sin bloques markdown.
{
  "message": "Respuesta conversacional corta.",
  "artifact": null
}

SI GENERAS UNA SKILL:
{ "type": "entity_mutation", "entity_type": "skill", "title": "...", "description": "...", "content": "...", "references": [], "evals": [], "scripts": [] }

SI GENERAS UN COMPONENTE UI:
{ "type": "web_component", "html": "...", "css": "...", "js": "..." }

SI GENERAS UN DOCUMENTO:
{ "type": "document", "title": "...", "content": "..." }

ESTADO ACTUAL EN PANTALLA: ${currentArtifactState}`;

            let contextBuilder = 'HISTORIAL DE CONVERSACIÓN:\n';
            this.chatHistory.slice(0, -1).forEach(msg => {
                contextBuilder += `[${msg.role.toUpperCase()}]: ${msg.content}\n`;
            });
            contextBuilder += `\n[NUEVA INSTRUCCIÓN PARA ${targetAgentName.toUpperCase()}]:\n${text}`;

            const response = await Orchestrator.callLLM({
                preferredEngine: 'anthropic',
                systemPrompt,
                userPrompt:     contextBuilder,
                responseFormat: 'json_object',
                temperature:    0.3
            });

            let parsed = response.content;
            if (typeof parsed === 'string') {
                try { parsed = JSON.parse(parsed); }
                catch (e) {
                    const match = parsed.match(/\{[\s\S]*\}/);
                    if (match) parsed = JSON.parse(match[0]);
                    else throw new Error('La IA no devolvió un JSON parseable.');
                }
            }

            // Telemetría
            if (response.telemetry && this.activeProjectId) {
                store.dispatch({
                    type: 'LOG_TELEMETRY',
                    payload: {
                        projectId:  this.activeProjectId,
                        agentId:    targetAgentId,
                        engine:     response.telemetry.provider,
                        actionType: 'OMNI_PAPER',
                        tokens:     response.telemetry.tokens,
                        costInDollars: 0,
                        recRatio:   0,
                        latencyMs:  response.telemetry.latencyMs
                    }
                });
            }

            if (parsed.artifact) {
                this._addMessage(parsed.message || 'He generado el artifact.', 'ai', parsed.artifact);
            } else {
                this._addMessage(parsed.message || 'Entendido.', 'ai');
            }

        } catch (err) {
            this._addMessage(`⚠️ Error de Kernel: ${err.message}`, 'ai');
        } finally {
            this.dom.btnSend.disabled  = false;
            this.dom.btnSend.innerHTML = '🚀 Enviar Directiva';
        }
    }

    _addMessage(text, type, artifactData = null) {
        if (type === 'user') this.chatHistory.push({ role: 'user',      content: text });
        else                 this.chatHistory.push({ role: 'assistant', content: artifactData ? JSON.stringify(artifactData) : text });

        const msg       = document.createElement('div');
        msg.className   = `msg-bubble msg-${type}`;

        if (artifactData) {
            msg.classList.add('msg-ai-artifact');
            msg.innerHTML = `📦 <b>Artifact Compilado (${artifactData.type})</b><br><br>El motor lo está renderizando en el Sandbox.`;
            msg.addEventListener('click', () => {
                if (this.dom.sbEmpty) this.dom.sbEmpty.style.display = 'none';
                this.sandbox?.renderArtifact(artifactData);
            });
            if (this.dom.sbEmpty) this.dom.sbEmpty.style.display = 'none';
            this.sandbox?.renderArtifact(artifactData);
        } else {
            msg.innerHTML = text.replace(/\n/g, '<br>');
        }

        this.dom.history.appendChild(msg);
        this.dom.history.scrollTop = this.dom.history.scrollHeight;
    }

    // ── Pomodoro ──────────────────────────────────────────────────
    _setupPomodoro() {
        this.dom.btnPlay?.addEventListener('click', () => {
            if (this.isPomodoroRunning) return;
            this.isPomodoroRunning      = true;
            this.dom.btnPlay.style.display  = 'none';
            this.dom.btnPause.style.display = 'flex';
            this.dom.pomoPanel.classList.add('running');
            this.pomodoroInterval = setInterval(() => { this.pomodoroSeconds++; this._updatePomodoroDisplay(); }, 1000);
        });

        this.dom.btnPause?.addEventListener('click', () => this._stopPomodoro());
    }

    _stopPomodoro() {
        if (!this.isPomodoroRunning) return;
        this.isPomodoroRunning      = false;
        this.dom.btnPlay.style.display  = 'flex';
        this.dom.btnPause.style.display = 'none';
        this.dom.pomoPanel.classList.remove('running');
        clearInterval(this.pomodoroInterval);
    }

    _updatePomodoroDisplay() {
        const h = Math.floor(this.pomodoroSeconds / 3600);
        const m = Math.floor((this.pomodoroSeconds % 3600) / 60);
        const s = this.pomodoroSeconds % 60;
        if (this.dom.timeDisplay) {
            this.dom.timeDisplay.innerText = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }
        if (this.pomodoroSeconds > 0 && this.dom.inpPowHours) {
            this.dom.inpPowHours.value = (this.pomodoroSeconds / 3600).toFixed(3);
        }
    }

    // ── Guardar borrador ──────────────────────────────────────────
    async _saveTaskDraft() {
        if (!this.activeTx) return;
        const btn = this.dom.btnSaveTaskDraft;
        btn.disabled = true; btn.innerText = '⏳…';

        const socs = [];
        this.dom.taskSocs.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            socs.push({ id: cb.id, text: cb.nextElementSibling?.innerText || '', isChecked: cb.checked });
        });

        const p      = store.getState().projects.find(x => x.id === this.activeProjectId);
        const isLegacy = !this.activeTx.flowId;
        const list   = isLegacy ? (p.transactions || []) : (p.work_orders || []);
        const idx    = list.findIndex(t => (t.id || t.hash) === (this.activeTx.id || this.activeTx.hash));
        if (idx === -1) { btn.disabled = false; btn.innerText = '💾 Guardar Borrador'; return; }

        const updated = { ...list[idx], draftLink: this.dom.inpPowLink.value.trim(), draftHours: parseFloat(this.dom.inpPowHours.value) || 0, draftContent: this.dom.editor.innerHTML, soc_checklist: socs };
        const newList = [...list];
        newList[idx]  = updated;
        await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: p.id, updates: isLegacy ? { transactions: newList } : { work_orders: newList } } });

        btn.disabled  = false;
        btn.innerText = '✅ Borrador Guardado';
        setTimeout(() => { btn.innerText = '💾 Guardar Borrador'; }, 2500);
    }

    // Alias V9
    executeViewScript() { return this.afterRender(); }
}
