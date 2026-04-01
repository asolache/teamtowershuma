// =============================================================================
// TEAMTOWERS SOS V10 — PROJECT VIEW
// Ruta: ia/dev/js/views/ProjectView.js
// Kanban PULL · Motor de ejecución GTD · automation_level V10
// =============================================================================

import { store }          from '../core/store.js';
import { KB }             from '../core/kb.js';
import { Sidebar }        from '../components/Sidebar.js';
import { BottomNav }      from '../components/BottomNav.js';
import { PageHeader }     from '../components/PageHeader.js';
import { KanbanRenderer } from '../components/KanbanRenderer.js';
import { Orchestrator }   from '../core/Orchestrator.js';

export default class ProjectView {

    constructor() {
        document.title        = 'Kanban PULL | TeamTowers V10';
        this.activeProjectId  = null;
        this.currentFilter    = 'all';
        this.isProcessingAi   = false;
        this.pushTargetHash   = null;
        this.pushTargetIsLegacy = false;
        this.kanbanRenderer   = null;
        this.draftedSopData   = null;
        this.isPO             = false;
    }

    async getHtml() {
        await store.init();

        const state        = store.getState();
        const activeUserId = state.session.activeUserId;
        const user         = state.globalUsers.find(u => u.id === activeUserId);

        const userProjects = state.projects.filter(p =>
            state.session.role === 'ecosystem-owner' ||
            p.ownerId === activeUserId ||
            p.usuarios?.find(u => u.id === activeUserId)
        );

        let activeProjectId = localStorage.getItem('tt_active_project') || userProjects.at(-1)?.id || null;
        let project = state.projects.find(p => p.id === activeProjectId);

        if (!project) {
            return `
            <div class="app-layout">
                ${Sidebar.getHtml('/project')}
                <main class="workspace" style="justify-content:center; align-items:center;">
                    <div class="glass-panel" style="text-align:center; max-width:500px; margin:0 auto; padding:4rem;">
                        <div style="font-size:5rem; margin-bottom:1.5rem; opacity:0.8;">📋</div>
                        <h2 style="color:white; margin-top:0; font-weight:900; font-size:2rem;">Radar Vacío</h2>
                        <p style="color:var(--text-muted); margin-bottom:2.5rem;">No hay ecosistemas activos para mostrar el Kanban.</p>
                        <a href="/create" data-link class="btn-primary" style="text-decoration:none;">➕ Forjar Ecosistema</a>
                    </div>
                </main>
                ${BottomNav.getHtml('/project')}
            </div>`;
        }

        this.activeProjectId = activeProjectId;
        this.isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        // ── Automation level badge ────────────────────────────────
        const autoLevel = project.settings?.automation_level || 'review_first';
        const autoLabels = { full_auto:'⚡ Full Auto', review_first:'👁️ Review First', human_only:'👤 Human Only' };
        const autoColors = { full_auto:'var(--accent-green)', review_first:'var(--accent-orange)', human_only:'#888' };
        const autoBadgeHtml = `
            <span style="font-size:0.72rem;padding:4px 10px;border-radius:6px;font-weight:bold;
                background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);
                color:${autoColors[autoLevel]};">
                ${autoLabels[autoLevel]}
            </span>`;

        const isOpen        = user?.profile?.isOpenToWork || false;
        const statusBtnText = isOpen ? '🟢 Flujo Abierto' : '🔴 Modo Foco (DND)';

        // WOs pendientes automáticas (full_auto pendientes de ejecutar)
        const pendingAutoWos = (project.work_orders || [])
            .filter(w => w.automation === 'auto' && w.status === 'theoretical' && w.assigneeId);
        const autoWoBadge = pendingAutoWos.length > 0
            ? `<span style="font-size:0.72rem;padding:4px 8px;border-radius:6px;font-weight:bold;background:rgba(0,230,118,0.1);border:1px solid rgba(0,230,118,0.3);color:var(--accent-green);">⚡ ${pendingAutoWos.length} auto pendientes</span>`
            : '';

        const headerConfig = {
            title:    'Mercado PULL (Kanban)',
            subtitle:  project.nombre,
            tagline:  'Motor de ejecución GTD. Gestiona Work Orders, asigna talento y sella Proof of Work.',
            actionHtml: `
                <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                    ${autoBadgeHtml}
                    ${autoWoBadge}
                    <button id="btnToggleStatus" style="background:rgba(0,0,0,0.4); border:1px solid #444; color:white; padding:8px 14px; border-radius:10px; font-size:0.82rem; font-weight:bold; cursor:pointer; transition:0.2s;">${statusBtnText}</button>
                    <select id="filterDropdown" style="background:rgba(0,0,0,0.5); border:1px solid #333; color:white; padding:8px 12px; border-radius:10px; font-size:0.82rem; font-weight:bold; outline:none; cursor:pointer;">
                        <option value="all">Todos los Flujos</option>
                        <option value="mine">Mis Tareas</option>
                        <option value="ai">Tareas IA</option>
                        <option value="hitl">HITL (Revisión Humana)</option>
                        <option value="auto">Auto-pendientes</option>
                    </select>
                    ${this.isPO ? `<button id="btnNewFlow" class="btn-primary" style="padding:8px 16px; font-size:0.85rem;">+ Inyectar Flujo VNA</button>` : ''}
                </div>`,
            magicActions: this.isPO ? [
                { id: 'gen_sop',     label: 'Generar SOP con IA',       icon: '🧠', tokens: 200 },
                { id: 'auto_assign', label: 'Auto-Asignar Agentes IA',  icon: '🤖', tokens: 100 },
                { id: 'run_auto',    label: 'Ejecutar WOs Auto ahora',  icon: '⚡', tokens: 50  }
            ] : []
        };

        return `
        <style>
            .workspace-project { flex:1; padding:2rem 3rem; overflow-y:auto; overflow-x:hidden;
                scroll-behavior:smooth; box-sizing:border-box;
                background:radial-gradient(circle at top right, rgba(99,102,241,0.03) 0%, transparent 40%); }

            .tab-content        { display:none; animation:fadeIn 0.3s ease-out; }
            .tab-content.active { display:block; }

            .overlay-modal { position:fixed; top:0; left:0; width:100vw; height:100vh;
                background:rgba(0,0,0,0.85); backdrop-filter:blur(15px);
                z-index:5000; display:none; justify-content:center; align-items:center; }
            .overlay-modal.active { display:flex; }
            .modal-inner { background:var(--bg-dark); border:1px solid #444; border-radius:24px;
                padding:2.5rem; width:100%; max-width:480px;
                box-shadow:0 30px 60px rgba(0,0,0,0.8); animation:slideUp 0.3s ease-out;
                border-top:4px solid var(--accent-indigo); box-sizing:border-box; }
            .form-group { margin-bottom:1.25rem; }
            .form-group label { display:block; font-size:0.75rem; color:var(--text-muted);
                text-transform:uppercase; font-weight:bold; letter-spacing:1px; margin-bottom:6px; }
            .form-control { width:100%; background:rgba(0,0,0,0.5); border:1px solid #333; color:white;
                padding:12px 14px; border-radius:10px; font-family:var(--font-main); font-size:0.95rem;
                outline:none; transition:0.3s; box-sizing:border-box; }
            .form-control:focus { border-color:var(--accent-indigo); }

            @keyframes slideUp { from { transform:translateY(30px); opacity:0; } to { transform:translateY(0); opacity:1; } }
            @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
            @media (max-width:768px) { .workspace-project { padding:80px 1rem 120px 1rem; } }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/project')}
            <main class="workspace-project">
                ${PageHeader.getHtml(headerConfig)}
                <div id="kanbanMountPoint"></div>
            </main>

            <!-- Modal: Asignar/Push -->
            <div id="pushModal" class="overlay-modal">
                <div class="modal-inner">
                    <h2 style="margin-top:0; font-weight:900; color:white; font-size:1.4rem;">⚡ Asignar Work Order</h2>
                    <p style="color:#aaa; font-size:0.9rem; margin-bottom:1.5rem;">Selecciona el nodo que ejecutará esta tarea.</p>
                    <div class="form-group">
                        <label>Nodo destino (Humano o IA)</label>
                        <select id="selPushTarget" class="form-control"></select>
                    </div>
                    <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:1.5rem;">
                        <button id="btnClosePushModal" style="background:transparent; border:1px solid #444; color:#aaa; padding:10px 20px; border-radius:10px; cursor:pointer; font-weight:bold;">Cancelar</button>
                        <button id="btnConfirmPush" class="btn-primary">✅ Confirmar Asignación</button>
                    </div>
                </div>
            </div>

            <!-- Modal: Nuevo Flujo VNA -->
            <div id="vnaOverlay" class="overlay-modal">
                <div class="modal-inner" style="max-width:560px; border-top-color:var(--accent-green);">
                    <h2 style="margin-top:0; font-weight:900; color:white; font-size:1.4rem;">🕸️ Inyectar Flujo VNA</h2>
                    <div class="form-group">
                        <label>Desde (Rol emisor)</label>
                        <select id="vnaFrom" class="form-control"></select>
                    </div>
                    <div class="form-group">
                        <label>Hacia (Rol receptor)</label>
                        <select id="vnaTo" class="form-control"></select>
                    </div>
                    <div class="form-group">
                        <label>Tipo de flujo</label>
                        <select id="vnaType" class="form-control">
                            <option value="tangible">📦 Tangible (Entregable físico)</option>
                            <option value="intangible">💡 Intangible (Conocimiento)</option>
                            <option value="financial">💰 Financiero</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Entregable / Título</label>
                        <input type="text" id="vnaTitle" class="form-control" placeholder="Ej: API de autenticación JWT">
                    </div>
                    <div class="form-group">
                        <label>Descripción / Contexto</label>
                        <textarea id="vnaDesc" class="form-control" rows="3" placeholder="Contexto de la tarea..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Horas estimadas</label>
                        <input type="number" id="vnaHours" class="form-control" value="4" min="0.5" step="0.5">
                    </div>
                    <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:1.5rem;">
                        <button id="btnCloseVna" style="background:transparent; border:1px solid #444; color:#aaa; padding:10px 20px; border-radius:10px; cursor:pointer; font-weight:bold;">Cancelar</button>
                        <button id="vnaConfirm" class="btn-primary" style="background:linear-gradient(135deg,var(--accent-green),#00b341);">✅ Inyectar en la Matriz</button>
                    </div>
                </div>
            </div>

            ${BottomNav.getHtml('/project')}
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender(null, async (actionId) => {
            if (actionId === 'gen_sop')     this._openVnaModal();
            if (actionId === 'auto_assign') await this._autoAssignIA();
            if (actionId === 'run_auto')    await this._runPendingAutoWos();
        });

        const state        = store.getState();
        const activeUserId = state.session.activeUserId;
        let project = state.projects.find(p => p.id === this.activeProjectId || p.id === localStorage.getItem('tt_active_project'));
        if (!project) return;
        this.activeProjectId = project.id;
        this.isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        // ── Kanban ────────────────────────────────────────────────
        const mountPoint = document.getElementById('kanbanMountPoint');
        if (mountPoint) {
            this.kanbanRenderer = new KanbanRenderer(mountPoint, {
                project, activeUserId, isPO: this.isPO,
                currentFilter: this.currentFilter, isMacroMode: false
            });
            this.kanbanRenderer.render();
        }

        // ── Filtro ────────────────────────────────────────────────
        document.getElementById('filterDropdown')?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            if (this.kanbanRenderer) {
                this.kanbanRenderer.options.currentFilter = this.currentFilter;
                this._refreshRenderer();
            }
        });

        // ── Toggle estado abierto/foco ────────────────────────────
        document.getElementById('btnToggleStatus')?.addEventListener('click', async () => {
            const user = state.globalUsers.find(u => u.id === activeUserId);
            if (!user) return;
            const updated = { ...user, profile: { ...user.profile, isOpenToWork: !user.profile?.isOpenToWork } };
            await store.dispatch({ type: 'UPDATE_USER', payload: updated });
            window.location.reload();
        });

        // ── Push Modal ────────────────────────────────────────────
        const pushModal     = document.getElementById('pushModal');
        const selPushTarget = document.getElementById('selPushTarget');

        document.getElementById('btnClosePushModal')?.addEventListener('click', () => {
            pushModal.classList.remove('active');
            this.pushTargetHash = null;
        });

        document.getElementById('btnConfirmPush')?.addEventListener('click', async () => {
            const targetId = selPushTarget.value;
            if (!targetId) return alert('Selecciona un nodo destino.');
            const btn = document.getElementById('btnConfirmPush');
            btn.disabled = true; btn.innerText = '⏳ Asignando...';

            const currProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            const wList    = this.pushTargetIsLegacy
                ? (currProj.transactions  || [])
                : (currProj.work_orders   || []);
            const tx = wList.find(t => (t.hash || t.id) === this.pushTargetHash);
            if (!tx) { alert('Work Order no encontrada.'); btn.disabled = false; return; }

            const targetUser = state.globalUsers.find(u => u.id === targetId);
            if (targetUser?.profile?.isAi) {
                await this._executeAIAgent(this.pushTargetHash, btn, currProj, this.pushTargetIsLegacy);
            } else {
                await store.dispatch({
                    type:    'UPDATE_WO_STATUS',
                    payload: { projectId: this.activeProjectId, hash: this.pushTargetHash, status: 'pinged', assigneeId: targetId }
                });
            }

            pushModal.classList.remove('active');
            this.pushTargetHash = null;
            btn.disabled = false; btn.innerText = '✅ Confirmar Asignación';
            this._refreshRenderer();
        });

        // Escuchar evento sos:push-modal desde KanbanRenderer
        document.addEventListener('sos:push-modal', (e) => {
            const { hash, isLegacy, projectId } = e.detail;
            if (projectId !== this.activeProjectId) return;
            this.pushTargetHash     = hash;
            this.pushTargetIsLegacy = isLegacy;
            const currProj = store.getState().projects.find(p => p.id === this.activeProjectId);
            const allNodes = [
                ...(currProj.usuarios || []).map(u => state.globalUsers.find(g => g.id === u.id)).filter(Boolean),
                ...state.globalUsers.filter(u => u.profile?.isAi)
            ];
            selPushTarget.innerHTML = [...new Map(allNodes.map(u => [u.id, u])).values()]
                .map(u => `<option value="${u.id}">${u.profile?.isAi ? '🤖' : '👤'} ${u.name || u.id}</option>`)
                .join('');
            pushModal.classList.add('active');
        });

        // ── Modal Nuevo Flujo VNA ─────────────────────────────────
        const vnaOverlay = document.getElementById('vnaOverlay');
        document.getElementById('btnNewFlow')?.addEventListener('click',  () => this._openVnaModal());
        document.getElementById('btnCloseVna')?.addEventListener('click', () => vnaOverlay.classList.remove('active'));

        document.getElementById('vnaConfirm')?.addEventListener('click', async () => {
            const title = document.getElementById('vnaTitle').value.trim();
            if (!title) return alert('El entregable es obligatorio.');
            const btn = document.getElementById('vnaConfirm');
            btn.disabled = true; btn.innerText = '⏳...';

            const currProj  = store.getState().projects.find(p => p.id === this.activeProjectId);
            const newFlowId = 'flow_' + Date.now();
            const newFlow   = {
                id:         newFlowId,
                from:       document.getElementById('vnaFrom').value,
                to:         document.getElementById('vnaTo').value,
                tipo:       document.getElementById('vnaType').value,
                entregable: title,
                context:    document.getElementById('vnaDesc').value.trim(),
                horas:      parseFloat(document.getElementById('vnaHours').value) || 1,
                soc_checklist: []
            };
            const newWO = {
                hash:       'wo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                flowId:     newFlowId,
                status:     'theoretical',
                comentario: newFlow.context || 'Work Order inyectada.',
                sprintId:   currProj.activeSprintId || null,
                assigneeId: null,
                createdBy:  'human',
                createdAt:  Date.now()
            };

            await store.dispatch({
                type:    'UPDATE_PROJECT_INFO',
                payload: {
                    projectId: currProj.id,
                    updates: {
                        vna_flows:   [...(currProj.vna_flows   || []), newFlow],
                        work_orders: [...(currProj.work_orders || []), newWO]
                    }
                }
            });

            vnaOverlay.classList.remove('active');
            window.location.reload();
        });

        // ── Auto-ejecutar WOs si full_auto y hay pendientes ───────
        if (project.settings?.automation_level === 'full_auto') {
            const autoWos = (project.work_orders || [])
                .filter(w => w.automation === 'auto' && w.status === 'theoretical' && w.assigneeId);
            if (autoWos.length > 0) {
                setTimeout(() => this._runPendingAutoWos(), 1500);
            }
        }
    }

    _openVnaModal() {
        const vnaOverlay = document.getElementById('vnaOverlay');
        const project    = store.getState().projects.find(p => p.id === this.activeProjectId);
        if (!project) return;
        const roleOptions = (project.roles || []).map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('');
        document.getElementById('vnaFrom').innerHTML = roleOptions;
        document.getElementById('vnaTo').innerHTML   = roleOptions;
        vnaOverlay.classList.add('active');
    }

    // ── _autoAssignIA — asigna agentes a WOs según sus skills ────
    async _autoAssignIA() {
        const project = store.getState().projects.find(p => p.id === this.activeProjectId);
        if (!project) return;

        const unassigned = (project.work_orders || [])
            .filter(wo => wo.status === 'theoretical' && !wo.assigneeId);
        if (!unassigned.length) { alert('No hay Work Orders sin asignar.'); return; }

        const state     = store.getState();
        const aiAgents  = state.globalUsers.filter(u => u.profile?.isAi);
        if (!aiAgents.length) { alert('No hay agentes IA en el Swarm.'); return; }

        let assigned = 0;
        for (const wo of unassigned) {
            // Asignar agente según categoría de la WO
            const categoryAgentMap = {
                'deliverable':   '@agent_web_deployer',
                'service':       '@agent_skill_crafter',
                'knowledge':     '@agent_synaptic_weaver',
                'payment':       '@agent_token_economist',
                'feedback':      '@agent_prompt_synthesizer',
                'collaboration': '@agent_genesis_architect',
                'resource':      '@agent_codex_developer',
                'trust':         '@bard_narrator'
            };
            const targetAgent = categoryAgentMap[wo.category]
                || aiAgents[assigned % aiAgents.length]?.id;

            if (!targetAgent) continue;

            await store.dispatch({
                type:    'UPDATE_WO_STATUS',
                payload: { projectId: this.activeProjectId, hash: wo.hash, status: 'theoretical', assigneeId: targetAgent }
            });
            assigned++;
        }

        this._refreshRenderer();
        alert(`✅ ${assigned} Work Orders asignadas a agentes IA. Nivel de automatización: ${project.settings?.automation_level || 'review_first'}.`);
    }

    // ── _runPendingAutoWos — ejecuta WOs auto en cola ─────────────
    async _runPendingAutoWos() {
        if (this.isProcessingAi) return;
        const project = store.getState().projects.find(p => p.id === this.activeProjectId);
        if (!project) return;

        const autoWos = (project.work_orders || [])
            .filter(w => w.automation === 'auto' && w.status === 'theoretical' && w.assigneeId);

        for (const wo of autoWos.slice(0, 3)) { // máx 3 a la vez
            const btn = { disabled: false, innerText: '' }; // mock btn
            await this._executeAIAgent(wo.hash, btn, project, false);
        }

        this._refreshRenderer();
    }

    async _executeAIAgent(txHash, btnElement, currProject, isLegacy) {
        if (this.isProcessingAi) return alert('Un Agente A2A ya está trabajando. Espera tu turno.');
        this.isProcessingAi = true;

        try {
            const flows = isLegacy ? (currProject.transactions || []) : (currProject.vna_flows || []);
            const wList = isLegacy ? (currProject.transactions || []) : (currProject.work_orders || []);
            const tx    = wList.find(t => (t.hash || t.id) === txHash);
            if (!tx) throw new Error('Work Order no encontrada.');

            const flow      = flows.find(f => f.id === (tx.flowId || tx.id)) || {};
            const state     = store.getState();
            const agentId   = tx.assigneeId || state.globalUsers.find(u => u.profile?.isAi)?.id;
            if (!agentId)   throw new Error('No hay agente asignado.');

            // Marcar como WIP
            await store.dispatch({
                type:    'UPDATE_WO_STATUS',
                payload: { projectId: currProject.id, hash: txHash, status: 'pinged', assigneeId: agentId }
            });

            // Ejecutar via Orchestrator
            const artifact = await Orchestrator.dispatch({
                routine: 'executeWorkOrder',
                agent:   agentId,
                context: {
                    projectId:   currProject.id,
                    workOrder:   tx,
                    flow,
                    projectName: currProject.nombre
                },
                constraints: { strictJSON: true, engine: 'anthropic' }
            });

            const result = artifact.payload;

            // Sellar con REPORT_WORK_ORDER
            await store.dispatch({
                type:    'REPORT_WORK_ORDER',
                payload: {
                    projectId:  currProject.id,
                    woHash:     txHash,           // ← campo correcto V10
                    realHours:  result?.realHours || flow?.estimatedHours || flow?.horas || 1,
                    comentario: result?.output || result?.message || 'Ejecutado por Swarm V10.',
                    proofLink:  'Agent_Auto_Report'
                }
            });

            this._refreshRenderer();

        } catch (err) {
            console.error('[ProjectView] AI Agent error:', err);
            alert(`⚠️ Error del agente: ${err.message}`);
        } finally {
            this.isProcessingAi = false;
        }
    }

    _refreshRenderer() {
        if (!this.kanbanRenderer) return;
        this.kanbanRenderer.options.project = store.getState().projects.find(p => p.id === this.activeProjectId);
        this.kanbanRenderer.render();
    }

    // Alias V9
    executeViewScript() { return this.afterRender(); }
}
