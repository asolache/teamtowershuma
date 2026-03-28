// =============================================================================
// TEAMTOWERS SOS V10 — KANBAN RENDERER
// Ruta: ia/dev/js/components/KanbanRenderer.js
// Motor de renderizado del Kanban PULL · Work Orders · TDD SOCs
// =============================================================================

export class KanbanRenderer {

    constructor(containerEl, options = {}) {
        this.container = containerEl;
        this.options   = Object.assign({
            project:       null,
            activeUserId:  null,
            isPO:          false,
            currentFilter: 'all',
            isMacroMode:   false
        }, options);

        this.colors = {
            '@anxaneta':  'var(--accent-red)',
            '@aixecador': 'var(--accent-orange)',
            '@dosos':     'var(--accent-purple)',
            '@baixos':    'var(--accent-indigo,#6366f1)',
            '@pinya':     'var(--accent-green)'
        };
    }

    static getStyles() {
        return `
            .kanban-board-layout { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; align-items:start; width:100%; padding-bottom:2rem; }
            .kanban-column { background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:14px; display:flex; flex-direction:column; min-height:500px; }
            .kanban-col-header { padding:14px 18px; font-weight:900; font-size:0.95rem; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; }
            .kanban-col-count  { background:rgba(255,255,255,0.1); font-family:var(--font-mono); font-size:0.78rem; padding:2px 8px; border-radius:10px; }
            .kanban-col-body   { padding:14px; display:flex; flex-direction:column; gap:14px; flex:1; }

            .task-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1.5rem; align-items:start; width:100%; }

            .task-card { box-sizing:border-box; width:100%; background:linear-gradient(180deg,rgba(25,25,30,0.8) 0%,rgba(10,10,15,0.9) 100%); border:1px solid var(--glass-border); border-radius:14px; padding:1.4rem; transition:transform 0.2s,box-shadow 0.2s,border-color 0.2s; position:relative; display:flex; flex-direction:column; gap:10px; }
            .task-card:hover { transform:translateY(-3px); border-color:rgba(255,255,255,0.15); box-shadow:0 8px 25px rgba(0,0,0,0.6); }
            .task-card.ai-processing { border-color:var(--accent-purple); box-shadow:0 0 30px rgba(224,64,251,0.3); animation:aiPulse 2s infinite; }

            .task-header { display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:4px; }
            .task-route  { display:flex; gap:4px; align-items:center; flex-wrap:wrap; }
            .route-badge { font-size:0.62rem; padding:3px 6px; border-radius:6px; font-family:var(--font-mono); font-weight:bold; border:1px solid; white-space:nowrap; }

            .task-title      { color:white; font-size:1rem; margin:0; line-height:1.3; font-weight:900; word-break:break-word; }
            .task-desc-bubble { font-size:0.78rem; color:#aaa; background:rgba(0,0,0,0.5); padding:9px; border-radius:8px; border-left:2px solid var(--accent-indigo,#6366f1); font-style:italic; line-height:1.4; }
            .task-ai-output  { font-size:0.78rem; color:#ddd; background:rgba(224,64,251,0.05); border:1px solid rgba(224,64,251,0.2); padding:9px; border-radius:8px; line-height:1.4; max-height:100px; overflow-y:auto; }

            .task-meta-row { display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:#888; background:rgba(0,0,0,0.4); padding:9px 11px; border-radius:9px; border:1px solid rgba(255,255,255,0.05); margin-top:auto; }
            .soc-progress  { display:flex; align-items:center; gap:5px; font-weight:bold; font-family:var(--font-mono); color:var(--accent-indigo,#6366f1); }

            .task-actions { margin-top:8px; display:flex; flex-direction:row; gap:7px; flex-wrap:wrap; }

            .btn-pull { flex:1; background:transparent; border:1px solid #666; color:white; transition:0.2s; padding:9px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.82rem; }
            .btn-pull:hover { background:white; color:black; border-color:white; }
            .btn-push { flex:1; background:transparent; border:1px dashed var(--accent-purple); color:var(--accent-purple); transition:0.2s; padding:9px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.82rem; }
            .btn-push:hover { background:rgba(224,64,251,0.1); border-style:solid; }

            .btn-focus { flex:1; background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(99,102,241,0.2)); border:1px solid var(--accent-indigo,#6366f1); color:var(--accent-indigo,#6366f1); text-align:center; text-decoration:none; padding:9px; border-radius:8px; font-weight:900; transition:0.3s; font-size:0.82rem; display:flex; justify-content:center; align-items:center; }
            .btn-focus:hover { background:var(--accent-indigo,#6366f1); color:white; box-shadow:0 0 15px rgba(99,102,241,0.4); }

            .btn-reject { background:transparent; border:1px solid var(--accent-red); color:var(--accent-red); padding:9px 14px; border-radius:8px; cursor:pointer; font-weight:bold; transition:0.2s; }
            .btn-reject:hover { background:var(--accent-red); color:white; }

            .btn-ai-exec { flex:1; background:linear-gradient(135deg,rgba(224,64,251,0.1),rgba(224,64,251,0.2)); border:1px solid var(--accent-purple); color:var(--accent-purple); text-align:center; padding:9px; border-radius:8px; font-weight:900; transition:0.3s; font-size:0.82rem; cursor:pointer; }
            .btn-ai-exec:hover { background:var(--accent-purple); color:white; box-shadow:0 0 20px rgba(224,64,251,0.5); }

            .btn-review { flex:1; background:var(--accent-indigo,#6366f1); color:white; border:none; padding:9px; border-radius:8px; font-weight:900; cursor:pointer; transition:0.2s; font-size:0.82rem; }
            .btn-review:hover { transform:scale(1.02); box-shadow:0 0 15px rgba(99,102,241,0.4); }

            .btn-review-human { flex:1; background:rgba(255,82,82,0.1); color:var(--accent-red); border:1px solid var(--accent-red); padding:9px; border-radius:8px; font-weight:900; cursor:pointer; transition:0.2s; font-size:0.82rem; animation:hitlPulse 2s infinite; }
            .btn-review-human:hover { background:var(--accent-red); color:white; }

            .empty-state { text-align:center; padding:3rem 1rem; color:var(--text-muted); font-size:0.88rem; font-style:italic; }
            .btn-add-wo  { background:rgba(255,255,255,0.04); border:1px dashed rgba(255,255,255,0.2); color:white; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.72rem; font-weight:bold; transition:0.2s; }
            .btn-add-wo:hover { background:white; color:black; }

            @keyframes aiPulse   { 0%,100%{box-shadow:0 0 10px rgba(224,64,251,0.2);}50%{box-shadow:0 0 30px rgba(224,64,251,0.6);} }
            @keyframes hitlPulse { 0%,100%{border-color:rgba(255,82,82,0.3);}50%{border-color:rgba(255,82,82,1);} }
            @media (max-width:1024px) { .kanban-board-layout{grid-template-columns:1fr; gap:2rem;} .kanban-column{min-height:auto;} }
        `;
    }

    render() {
        if (!this.container || !this.options.project) return;

        const { project, activeUserId, isPO, currentFilter, isMacroMode } = this.options;

        let allTasks = [
            ...(project.work_orders  || []).map(wo => ({ ...wo, isWorkOrder: true  })),
            ...(project.transactions || []).map(tx => ({ ...tx, isWorkOrder: false }))
        ];

        const activeSprintId = project.activeSprintId;
        allTasks = allTasks.filter(tx => !tx.isWorkOrder || tx.sprintId === activeSprintId);

        // Filtro
        if (currentFilter === 'mine')  allTasks = allTasks.filter(tx => tx.assigneeId === activeUserId || tx.workerId === activeUserId);
        if (currentFilter === 'ai')    allTasks = allTasks.filter(tx => tx.assigneeId?.startsWith('@') && !tx.assigneeId?.startsWith('@alvaro'));
        if (currentFilter === 'hitl')  allTasks = allTasks.filter(tx => tx.status === 'reported' || tx.status === 'in_review');

        // Distribuir en columnas
        const cols = { oportunidades: [], 'en-curso': [], contabilizado: [] };
        allTasks.forEach(tx => {
            const flowData = tx.isWorkOrder
                ? (project.vna_flows?.find(f => f.id === tx.flowId) || tx)
                : tx;

            if (tx.status === 'consolidated' || tx.status === 'approved') {
                cols.contabilizado.push({ tx, flowData });
            } else if (tx.status === 'pinged' || tx.status === 'reported' || tx.status === 'in_review') {
                cols['en-curso'].push({ tx, flowData });
            } else {
                cols.oportunidades.push({ tx, flowData });
            }
        });

        if (isMacroMode) {
            const allCards = Object.values(cols).flat();
            this.container.innerHTML = `
                <style>${KanbanRenderer.getStyles()}</style>
                <div class="task-grid">
                    ${allCards.map(({ tx, flowData }) => this._buildTaskCard(tx, flowData, project, activeUserId, isPO)).join('')}
                </div>`;
        } else {
            const colConfig = [
                { key: 'oportunidades', label: '🎯 Oportunidades', color: '#888' },
                { key: 'en-curso',      label: '⚡ En Curso',       color: 'var(--accent-orange)' },
                { key: 'contabilizado', label: '✅ Contabilizado',  color: 'var(--accent-green)'  }
            ];

            this.container.innerHTML = `
                <style>${KanbanRenderer.getStyles()}</style>
                <div class="kanban-board-layout">
                    ${colConfig.map(col => `
                    <div class="kanban-column">
                        <div class="kanban-col-header" style="color:${col.color};">
                            ${col.label}
                            <span class="kanban-col-count">${cols[col.key].length}</span>
                        </div>
                        <div class="kanban-col-body">
                            ${cols[col.key].length === 0
                                ? `<div class="empty-state">Sin tareas aquí.</div>`
                                : cols[col.key].map(({ tx, flowData }) => this._buildTaskCard(tx, flowData, project, activeUserId, isPO)).join('')
                            }
                        </div>
                    </div>`).join('')}
                </div>`;
        }

        this._attachEvents();
    }

    // ── Build task card ───────────────────────────────────────────
    _buildTaskCard(tx, flowData, project, activeUserId, isPO) {
        const roles        = project.roles || [];
        const role         = roles.find(r => r.id === flowData.from) || { name: '?', levelId: '?', fmv: 40, multiplier: 1 };
        const receiverRole = roles.find(r => r.id === flowData.to)   || { name: '?', levelId: '?', fmv: 40, multiplier: 1 };
        const color        = this.colors[role.levelId] || 'var(--accent-indigo,#6366f1)';

        const isLegacy = !tx.isWorkOrder;
        const hashVal  = tx.hash || tx.id;
        const hashAttr = `data-hash="${hashVal}" data-legacy="${isLegacy}"`;

        let actionHtml  = '';
        let statusTag   = '';
        let aiOutputHtml = '';

        const socs         = tx.soc_checklist || flowData.soc_checklist || [];
        const checkedCount = socs.filter(s => s.isChecked).length;
        const socHtml      = socs.length > 0 ? `<div class="soc-progress">☑️ ${checkedCount}/${socs.length} SOCs</div>` : '';

        // ── LIBRE ─────────────────────────────────────────────────
        if (tx.status === 'theoretical' || !tx.status) {
            statusTag = `<span style="color:#aaa;font-size:0.62rem;border:1px solid #444;padding:3px 8px;border-radius:10px;font-weight:bold;letter-spacing:1px;">LIBRE</span>`;
            if (isPO) {
                actionHtml = `
                    <button class="btn-pull kb-action" data-action="request" ${hashAttr} title="Adjudicarme la tarea">📥 PULL (Mío)</button>
                    <button class="btn-push kb-action" data-action="open-push-modal" ${hashAttr} title="Asignar a un miembro o IA">👤 PUSH (Asignar)</button>`;
            } else {
                actionHtml = `<button class="btn-pull kb-action" data-action="request" ${hashAttr}>✋ Hacer PULL</button>`;
            }
        }
        // ── WIP ───────────────────────────────────────────────────
        else if (tx.status === 'pinged') {
            statusTag = `<span style="color:var(--accent-orange);font-size:0.62rem;border:1px solid var(--accent-orange);padding:3px 8px;border-radius:10px;font-weight:bold;letter-spacing:1px;background:rgba(255,171,64,0.1);">WIP</span>`;
            const isMine       = tx.assigneeId === activeUserId || tx.workerId === activeUserId;
            const isAiAssignee = tx.assigneeId?.startsWith('@') && !isMine;

            if (isMine) {
                actionHtml = `
                    <a href="/paper?hash=${hashVal}&legacy=${isLegacy}" class="btn-focus" data-link>▶ PUBLICAR ENTREGABLE</a>
                    <button class="btn-reject kb-action" data-action="reject" ${hashAttr} title="Soltar Tarea">✖</button>`;
            } else if (isAiAssignee && isPO) {
                actionHtml = `<button class="btn-ai-exec kb-action" data-action="ai-exec" ${hashAttr} data-agent="${tx.assigneeId}">⚡ EJECUTAR IA (${tx.assigneeId})</button>`;
            } else {
                actionHtml = `<div style="color:white;font-size:0.78rem;text-align:center;padding:8px;background:rgba(0,0,0,0.4);border-radius:8px;border:1px solid #333;width:100%;">Asignado: <b>${tx.assigneeId || tx.workerId || '—'}</b></div>`;
            }
        }
        // ── AUDITORÍA ─────────────────────────────────────────────
        else if (tx.status === 'reported' || tx.status === 'in_review') {
            statusTag = `<span style="color:var(--accent-indigo,#6366f1);font-size:0.62rem;border:1px solid var(--accent-indigo,#6366f1);padding:3px 8px;border-radius:10px;font-weight:bold;letter-spacing:1px;background:rgba(99,102,241,0.1);">AUDITORÍA</span>`;

            const isAiTask = tx.proofLink === 'Agent_Auto_Report' || tx.proofLink === 'Usenet_Thread';
            if (isAiTask) {
                aiOutputHtml = `<div class="task-ai-output"><b>🤖 Proof of Work:</b><br>${(tx.comentario || '').replace(/\n/g,'<br>')}</div>`;
            }

            if (isPO) {
                const needsHuman = isAiTask && (socs.length === 0 || socs.length > 5);
                actionHtml = needsHuman
                    ? `<button class="btn-review-human kb-action" data-action="review" ${hashAttr}>⚠️ Auditoría Humana (PO)</button>`
                    : `<button class="btn-review      kb-action" data-action="review" ${hashAttr}>🔎 Auditar SOCs (PO)</button>`;
            } else {
                actionHtml = `<div style="font-size:0.78rem;color:#888;text-align:center;padding:8px;border:1px dashed #333;border-radius:8px;width:100%;">Pendiente de Auditar por PO</div>`;
            }
        }
        // ── SELLADO ───────────────────────────────────────────────
        else if (tx.status === 'consolidated' || tx.status === 'approved') {
            statusTag = `<span style="color:var(--accent-green);font-size:0.62rem;border:1px solid var(--accent-green);padding:3px 8px;border-radius:10px;font-weight:bold;letter-spacing:1px;background:rgba(0,230,118,0.1);">SELLADO</span>`;

            if (tx.proofLink === 'Agent_Auto_Report' || tx.proofLink === 'Usenet_Thread') {
                aiOutputHtml = `<div class="task-ai-output" style="max-height:60px;opacity:0.7;"><b>🤖 Proof of Work:</b><br>${(tx.comentario || '').replace(/\n/g,'<br>')}</div>`;
            }

            let earnedSlices = tx.valorCongelado;
            if (!earnedSlices) {
                const fmv  = parseFloat(receiverRole.fmv)        || 40;
                const mult = parseFloat(receiverRole.multiplier) || 1;
                const hrs  = parseFloat(tx.realHours) || parseFloat(flowData.estimatedHours) || parseFloat(flowData.horas) || 1;
                earnedSlices = hrs * fmv * mult;
            }

            actionHtml = `
                <div style="color:var(--accent-green);font-size:1rem;font-weight:900;font-family:var(--font-mono);text-align:center;padding:9px;background:rgba(0,230,118,0.05);border-radius:8px;border:1px dashed var(--accent-green);width:100%;">
                    +${Math.round(earnedSlices).toLocaleString()} Slices
                </div>`;
        }

        const borderStyle  = tx.status === 'requested' ? 'border-color:var(--accent-red); box-shadow:0 0 20px rgba(255,82,82,0.15);' : '';
        const titleText    = flowData.template || flowData.entregable || 'Work Order';
        let   contextText  = tx.comentario || tx.descripcionContexto || flowData.context || '';
        if (tx.proofLink === 'Agent_Auto_Report' || tx.proofLink === 'Usenet_Thread') contextText = '';
        const contextHtml  = contextText ? `<div class="task-desc-bubble">💬 "${contextText}"</div>` : '';

        return `
        <div class="task-card" style="${borderStyle}">
            <div class="task-header">
                <div class="task-route">
                    <span class="route-badge" style="color:${color};border-color:${color};" title="${role.name}">${role.levelId}</span>
                    <span style="color:#555;font-size:0.78rem;">→</span>
                    <span class="route-badge" style="color:#888;border-color:#444;" title="${receiverRole.name}">${receiverRole.levelId}</span>
                </div>
                ${statusTag}
            </div>
            <h3 class="task-title">${titleText}</h3>
            ${contextHtml}
            ${aiOutputHtml}
            <div class="task-meta-row">
                ${socHtml || `<span style="color:#555;font-weight:bold;font-size:0.72rem;">Sin SOCs</span>`}
                <span style="font-weight:bold;color:white;font-family:var(--font-mono);">⏱ ${flowData.estimatedHours || flowData.horas || 1}h</span>
            </div>
            <div class="task-actions">${actionHtml}</div>
        </div>`;
    }

    // ── Attach Events ─────────────────────────────────────────────
    _attachEvents() {
        this.container.querySelectorAll('.kb-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action   = e.currentTarget.dataset.action;
                const hash     = e.currentTarget.dataset.hash;
                const isLegacy = e.currentTarget.dataset.legacy === 'true';
                const agentId  = e.currentTarget.dataset.agent;

                if (action === 'open-push-modal') {
                    // V10: usa evento sos: para que ProjectView abra el modal
                    document.dispatchEvent(new CustomEvent('sos:push-modal', {
                        bubbles: true,
                        detail: { hash, isLegacy, projectId: this.options.project?.id }
                    }));
                    return;
                }

                window.dispatchEvent(new CustomEvent('kanban-action', {
                    detail: { action, hash, isLegacy, agentId, element: e.currentTarget }
                }));
            });
        });

        // Botón para inyectar nueva WO desde columna (PO only)
        this.container.querySelectorAll('.btn-add-wo').forEach(btn => {
            btn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('kanban-inject-wo', {
                    detail: { projectId: this.options.project?.id }
                }));
            });
        });
    }
}
