// =============================================================================
// TEAMTOWERS SOS V10 — KANBAN RENDERER — Sprint 1
// [#TEAMTOWERS_V10_ANTIGRAVITY_KERNEL]
// Ruta: ia/dev/js/components/KanbanRenderer.js
//
// Sprint 1: fichas mejoradas con:
//   - Nombre real de rol origen → rol destino
//   - Entregable expandible
//   - SOCs visibles en la ficha
//   - Campo para cumplimentar entregable humano
// =============================================================================

import { WoEvalPanel } from './WoEvalPanel.js';

export class KanbanRenderer {

    constructor(containerEl, options) {
        this.container = containerEl;
        this.options   = Object.assign({
            project:       null,
            activeUserId:  null,
            isPO:          false,
            currentFilter: 'all',
            isMacroMode:   false
        }, options || {});

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

            .task-card { box-sizing:border-box; width:100%;
                background:linear-gradient(180deg,rgba(25,25,30,0.8) 0%,rgba(10,10,15,0.9) 100%);
                border:1px solid var(--glass-border); border-radius:14px; padding:1.2rem;
                transition:transform 0.2s,box-shadow 0.2s,border-color 0.2s;
                position:relative; display:flex; flex-direction:column; gap:8px; }
            .task-card:hover { transform:translateY(-2px); border-color:rgba(255,255,255,0.12); box-shadow:0 8px 25px rgba(0,0,0,0.5); }
            .task-card.ai-processing { border-color:var(--accent-purple); animation:aiPulse 2s infinite; }

            /* ── Header: ruta rol→rol ── */
            .task-header  { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; }
            .task-route   { display:flex; align-items:center; gap:5px; flex-wrap:wrap; flex:1; }
            .route-node   { display:flex; flex-direction:column; gap:1px; }
            .route-level  { font-size:0.58rem; font-family:var(--font-mono); font-weight:900; padding:2px 5px;
                border-radius:4px; border:1px solid; white-space:nowrap; }
            .route-name   { font-size:0.65rem; color:#555; white-space:nowrap; max-width:80px;
                overflow:hidden; text-overflow:ellipsis; }
            .route-arrow  { color:#333; font-size:0.75rem; flex-shrink:0; }

            .task-title   { color:white; font-size:0.95rem; margin:0; line-height:1.3; font-weight:900; word-break:break-word; }

            /* ── Entregable expandible ── */
            .task-deliv   { font-size:0.75rem; color:#888; background:rgba(0,0,0,0.3);
                border:1px solid rgba(255,255,255,0.05); border-radius:7px; padding:7px 10px;
                line-height:1.5; cursor:pointer; transition:0.15s; position:relative; }
            .task-deliv:hover { border-color:rgba(99,102,241,0.3); color:#aaa; }
            .task-deliv-full { display:none; margin-top:5px; font-style:italic; color:#666; }
            .task-deliv.expanded .task-deliv-full { display:block; }
            .task-deliv-toggle { font-size:0.6rem; color:var(--accent-indigo); margin-left:4px; }

            /* ── SOCs en ficha ── */
            .task-socs    { display:flex; flex-direction:column; gap:3px; }
            .task-soc-item{ display:flex; align-items:flex-start; gap:5px; font-size:0.68rem; color:#555; }
            .task-soc-dot { width:5px; height:5px; border-radius:50%; background:#333; flex-shrink:0; margin-top:3px; }
            .task-soc-dot.checked { background:var(--accent-green); }

            /* ── Campo entregable humano ── */
            .task-human-input { width:100%; background:rgba(0,0,0,0.4); border:1px solid #2a2a2a;
                color:white; padding:8px 10px; border-radius:8px; font-family:var(--font-base);
                font-size:0.78rem; outline:none; resize:vertical; min-height:60px;
                box-sizing:border-box; transition:border-color 0.2s; margin-top:4px; }
            .task-human-input:focus { border-color:rgba(99,102,241,0.4); }
            .task-human-input::placeholder { color:#2a2a2a; }

            .task-desc-bubble { font-size:0.75rem; color:#aaa; background:rgba(0,0,0,0.4);
                padding:8px 10px; border-radius:7px; border-left:2px solid var(--accent-indigo,#6366f1);
                font-style:italic; line-height:1.4; }
            .task-ai-output { font-size:0.75rem; color:#ddd; background:rgba(224,64,251,0.05);
                border:1px solid rgba(224,64,251,0.2); padding:8px 10px; border-radius:7px;
                line-height:1.4; max-height:90px; overflow-y:auto; }

            .task-meta-row { display:flex; justify-content:space-between; align-items:center;
                font-size:0.75rem; color:#888; background:rgba(0,0,0,0.35); padding:7px 10px;
                border-radius:8px; border:1px solid rgba(255,255,255,0.04); }
            .soc-progress  { display:flex; align-items:center; gap:5px; font-weight:bold;
                font-family:var(--font-mono); color:var(--accent-indigo,#6366f1); }

            .task-actions { display:flex; flex-direction:row; gap:6px; flex-wrap:wrap; margin-top:2px; }

            .btn-pull  { flex:1; background:transparent; border:1px solid #666; color:white;
                transition:0.2s; padding:8px; border-radius:8px; cursor:pointer; font-weight:bold; font-size:0.8rem; }
            .btn-pull:hover { background:white; color:black; border-color:white; }
            .btn-push  { flex:1; background:transparent; border:1px dashed var(--accent-purple);
                color:var(--accent-purple); transition:0.2s; padding:8px; border-radius:8px;
                cursor:pointer; font-weight:bold; font-size:0.8rem; }
            .btn-push:hover { background:rgba(224,64,251,0.1); border-style:solid; }

            .btn-focus { flex:1; background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(99,102,241,0.2));
                border:1px solid var(--accent-indigo,#6366f1); color:var(--accent-indigo,#6366f1);
                text-align:center; text-decoration:none; padding:8px; border-radius:8px;
                font-weight:900; transition:0.3s; font-size:0.8rem; display:flex;
                justify-content:center; align-items:center; cursor:pointer; }
            .btn-focus:hover { background:var(--accent-indigo,#6366f1); color:white; }

            .btn-reject { background:transparent; border:1px solid var(--accent-red);
                color:var(--accent-red); padding:8px 12px; border-radius:8px;
                cursor:pointer; font-weight:bold; transition:0.2s; }
            .btn-reject:hover { background:var(--accent-red); color:white; }

            .btn-ai-exec { flex:1; background:linear-gradient(135deg,rgba(224,64,251,0.1),rgba(224,64,251,0.2));
                border:1px solid var(--accent-purple); color:var(--accent-purple);
                padding:8px; border-radius:8px; font-weight:900; transition:0.3s;
                font-size:0.8rem; cursor:pointer; }
            .btn-ai-exec:hover { background:var(--accent-purple); color:white; }

            .btn-review { flex:1; background:var(--accent-indigo,#6366f1); color:white; border:none;
                padding:8px; border-radius:8px; font-weight:900; cursor:pointer; font-size:0.8rem; transition:0.2s; }
            .btn-review:hover { transform:scale(1.02); }

            .btn-review-human { flex:1; background:rgba(255,82,82,0.1); color:var(--accent-red);
                border:1px solid var(--accent-red); padding:8px; border-radius:8px;
                font-weight:900; cursor:pointer; font-size:0.8rem; animation:hitlPulse 2s infinite; }
            .btn-review-human:hover { background:var(--accent-red); color:white; }

            .btn-submit-deliv { flex:1; background:rgba(0,230,118,0.1); border:1px solid rgba(0,230,118,0.3);
                color:var(--accent-green); padding:8px; border-radius:8px; font-weight:900;
                cursor:pointer; font-size:0.78rem; transition:0.2s; }
            .btn-submit-deliv:hover { background:rgba(0,230,118,0.2); }

            .empty-state { text-align:center; padding:3rem 1rem; color:var(--text-muted); font-size:0.85rem; font-style:italic; }
            .btn-add-wo  { background:rgba(255,255,255,0.04); border:1px dashed rgba(255,255,255,0.2);
                color:white; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:0.7rem;
                font-weight:bold; transition:0.2s; }
            .btn-add-wo:hover { background:white; color:black; }

            @keyframes aiPulse   { 0%,100%{box-shadow:0 0 10px rgba(224,64,251,0.2);}50%{box-shadow:0 0 30px rgba(224,64,251,0.6);} }
            @keyframes hitlPulse { 0%,100%{border-color:rgba(255,82,82,0.3);}50%{border-color:rgba(255,82,82,1);} }
            @media (max-width:1024px) { .kanban-board-layout{grid-template-columns:1fr;} .kanban-column{min-height:auto;} }
        `;
    }

    render() {
        if (!this.container || !this.options.project) return;

        var self         = this;
        var project      = this.options.project;
        var activeUserId = this.options.activeUserId;
        var isPO         = this.options.isPO;
        var currentFilter= this.options.currentFilter;
        var isMacroMode  = this.options.isMacroMode;

        var allTasks = [].concat(
            (project.work_orders  || []).map(function(wo){ return Object.assign({}, wo, { isWorkOrder: true  }); }),
            (project.transactions || []).map(function(tx){ return Object.assign({}, tx, { isWorkOrder: false }); })
        );

        var activeSprintId = project.activeSprintId;
        allTasks = allTasks.filter(function(tx){ return !tx.isWorkOrder || tx.sprintId === activeSprintId; });

        if (currentFilter === 'mine')  allTasks = allTasks.filter(function(tx){ return tx.assigneeId === activeUserId || tx.workerId === activeUserId; });
        if (currentFilter === 'ai')    allTasks = allTasks.filter(function(tx){ return tx.assigneeId && tx.assigneeId.startsWith('@') && tx.assigneeId !== activeUserId; });
        if (currentFilter === 'hitl')  allTasks = allTasks.filter(function(tx){ return tx.status === 'reported' || tx.status === 'in_review'; });
        if (currentFilter === 'auto')  allTasks = allTasks.filter(function(tx){ return tx.automation === 'auto' && tx.status === 'theoretical'; });

        var cols = { oportunidades: [], 'en-curso': [], contabilizado: [] };
        allTasks.forEach(function(tx) {
            // Buscar datos del flujo — puede estar en vna_flows, vna_exchanges o en la propia WO
            var flowData = tx;
            if (tx.isWorkOrder && tx.flowId) {
                flowData = (project.vna_flows    || []).find(function(f){ return f.id === tx.flowId; })
                        || (project.vna_exchanges || []).find(function(f){ return f.id === tx.flowId; })
                        || tx;
            }

            if (tx.status === 'consolidated' || tx.status === 'approved') {
                cols.contabilizado.push({ tx: tx, flowData: flowData });
            } else if (tx.status === 'pinged' || tx.status === 'reported' || tx.status === 'in_review') {
                cols['en-curso'].push({ tx: tx, flowData: flowData });
            } else {
                cols.oportunidades.push({ tx: tx, flowData: flowData });
            }
        });

        if (isMacroMode) {
            var allCards = [];
            Object.keys(cols).forEach(function(k){ allCards = allCards.concat(cols[k]); });
            this.container.innerHTML = '<style>' + KanbanRenderer.getStyles() + '</style>' +
                '<div class="task-grid">' +
                allCards.map(function(item){ return self._buildTaskCard(item.tx, item.flowData, project, activeUserId, isPO); }).join('') +
                '</div>';
        } else {
            var colConfig = [
                { key: 'oportunidades', label: '🎯 Oportunidades', color: '#888' },
                { key: 'en-curso',      label: '⚡ En Curso',       color: 'var(--accent-orange)' },
                { key: 'contabilizado', label: '✅ Contabilizado',  color: 'var(--accent-green)' }
            ];

            this.container.innerHTML = '<style>' + KanbanRenderer.getStyles() + '</style>' +
                '<div class="kanban-board-layout">' +
                colConfig.map(function(col) {
                    return '<div class="kanban-column">' +
                        '<div class="kanban-col-header" style="color:' + col.color + ';">' +
                        col.label + '<span class="kanban-col-count">' + cols[col.key].length + '</span></div>' +
                        '<div class="kanban-col-body">' +
                        (cols[col.key].length === 0
                            ? '<div class="empty-state">Sin tareas aquí.</div>'
                            : cols[col.key].map(function(item){ return self._buildTaskCard(item.tx, item.flowData, project, activeUserId, isPO); }).join('')
                        ) +
                        '</div></div>';
                }).join('') +
                '</div>';
        }

        this._attachEvents();
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Build task card — mejorada Sprint 1
    // ══════════════════════════════════════════════════════════════════════════
    _buildTaskCard(tx, flowData, project, activeUserId, isPO) {
        var self = this;

        // ── Roles con nombres reales ──────────────────────────────────────────
        // Buscar en vna_nodes (nuevo) y roles (antiguo)
        var allNodes = [].concat(project.vna_nodes || [], project.roles || []);
        var fromRole = allNodes.find(function(r){ return r.id === (flowData.from || tx.from); });
        var toRole   = allNodes.find(function(r){ return r.id === (flowData.to   || tx.to  ); });

        var fromName  = fromRole ? (fromRole.label || fromRole.name || fromRole.id) : (flowData.from || '?');
        var toName    = toRole   ? (toRole.label   || toRole.name   || toRole.id)   : (flowData.to   || '?');
        var fromLevel = fromRole ? (fromRole.levelId || '') : '';
        var toLevel   = toRole   ? (toRole.levelId   || '') : '';
        var color     = this.colors[fromLevel] || 'var(--accent-indigo,#6366f1)';

        var isLegacy = !tx.isWorkOrder;
        var hashVal  = tx.hash || tx.id;
        var hashAttr = 'data-hash="' + hashVal + '" data-legacy="' + isLegacy + '"';

        // ── Entregable ────────────────────────────────────────────────────────
        var titleText   = flowData.template || flowData.entregable || flowData.label || tx.entregable || 'Work Order';
        var entregable  = flowData.entregable || flowData.context || tx.comentario || '';
        var hasFullDeliv= entregable && entregable !== titleText && entregable.length > 40;

        // ── SOCs ──────────────────────────────────────────────────────────────
        var socs         = tx.soc_checklist || flowData.soc_checklist || flowData.socs || [];
        var checkedCount = socs.filter(function(s){ return s.isChecked; }).length;

        var socsHtml = '';
        if (socs.length > 0) {
            // Mostrar máx 3 SOCs en la ficha, resto colapsado
            var visibleSocs = socs.slice(0, 3);
            socsHtml = '<div class="task-socs">' +
                visibleSocs.map(function(s) {
                    var text    = typeof s === 'string' ? s : (s.text || s.description || '');
                    var checked = typeof s === 'object' ? s.isChecked : false;
                    return '<div class="task-soc-item"><div class="task-soc-dot' + (checked ? ' checked' : '') + '"></div><span>' + text.substring(0, 60) + (text.length > 60 ? '…' : '') + '</span></div>';
                }).join('') +
                (socs.length > 3 ? '<div style="font-size:0.62rem;color:#444;padding-left:10px;">+' + (socs.length - 3) + ' más</div>' : '') +
                '</div>';
        }

        // ── Status tag ────────────────────────────────────────────────────────
        var statusTag    = '';
        var actionHtml   = '';
        var aiOutputHtml = '';
        var humanInputHtml = '';

        if (tx.status === 'theoretical' || !tx.status) {
            statusTag = '<span style="color:#aaa;font-size:0.6rem;border:1px solid #444;padding:2px 7px;border-radius:8px;font-weight:bold;letter-spacing:1px;">LIBRE</span>';

            // Campo para cumplimentar entregable si es tarea humana (no IA)
            var isHumanTask = !tx.assigneeId || !tx.assigneeId.startsWith('@');
            if (isHumanTask && isPO) {
                humanInputHtml = '<textarea class="task-human-input" data-hash="' + hashVal + '" ' +
                    'placeholder="Describe el entregable que vas a producir para esta WO…"></textarea>';
            }

            if (isPO) {
                actionHtml = '<button class="btn-pull kb-action" data-action="request" ' + hashAttr + ' title="Adjudicarme la tarea">📥 PULL (Mío)</button>' +
                    '<button class="btn-push kb-action" data-action="open-push-modal" ' + hashAttr + '>👤 PUSH</button>';
                if (isHumanTask && humanInputHtml) {
                    actionHtml += '<button class="btn-submit-deliv kb-action" data-action="submit-deliverable" ' + hashAttr + '>✓ Entregar</button>';
                }
            } else {
                actionHtml = '<button class="btn-pull kb-action" data-action="request" ' + hashAttr + '>✋ Hacer PULL</button>';
            }
        }
        else if (tx.status === 'pinged') {
            statusTag = '<span style="color:var(--accent-orange);font-size:0.6rem;border:1px solid var(--accent-orange);padding:2px 7px;border-radius:8px;font-weight:bold;background:rgba(255,171,64,0.08);">WIP</span>';
            var isMine       = tx.assigneeId === activeUserId || tx.workerId === activeUserId;
            var isAiAssignee = tx.assigneeId && tx.assigneeId.startsWith('@') && !isMine;

            if (isMine) {
                humanInputHtml = '<textarea class="task-human-input" data-hash="' + hashVal + '" ' +
                    'placeholder="Describe el entregable que has producido…">' + (tx.comentario && tx.comentario !== 'Work Order inyectada.' ? tx.comentario : '') + '</textarea>';
                actionHtml = '<button class="btn-focus kb-action" data-action="eval" ' + hashAttr + ' style="cursor:pointer;">▶ REPORTAR</button>' +
                    '<button class="btn-submit-deliv kb-action" data-action="submit-deliverable" ' + hashAttr + '>✓ Entregar</button>' +
                    '<button class="btn-reject kb-action" data-action="reject" ' + hashAttr + ' title="Soltar Tarea">✖</button>';
            } else if (isAiAssignee && isPO) {
                actionHtml = '<button class="btn-ai-exec kb-action" data-action="ai-exec" ' + hashAttr + ' data-agent="' + tx.assigneeId + '">⚡ EJECUTAR IA (' + tx.assigneeId.replace('@agent_','@') + ')</button>';
            } else {
                actionHtml = '<div style="color:#666;font-size:0.75rem;text-align:center;padding:7px;background:rgba(0,0,0,0.3);border-radius:7px;border:1px solid #222;width:100%;">Asignado: <b style="color:white;">' + (tx.assigneeId || tx.workerId || '—') + '</b></div>';
            }
        }
        else if (tx.status === 'reported' || tx.status === 'in_review') {
            statusTag = '<span style="color:var(--accent-indigo,#6366f1);font-size:0.6rem;border:1px solid var(--accent-indigo,#6366f1);padding:2px 7px;border-radius:8px;font-weight:bold;background:rgba(99,102,241,0.08);">AUDITORÍA</span>';

            var isAiTask = tx.proofLink === 'Agent_Auto_Report' || tx.proofLink === 'Usenet_Thread';
            if (isAiTask) {
                aiOutputHtml = '<div class="task-ai-output"><b>🤖 Proof of Work:</b><br>' + (tx.comentario || '').replace(/\n/g,'<br>') + '</div>';
            }
            var missSocs = socs.length === 0;
            actionHtml = '<button class="' + (missSocs ? 'btn-review-human' : 'btn-review') + ' kb-action" data-action="eval" ' + hashAttr + '>' +
                (missSocs ? '🎯 Generar SOCs y Evaluar' : '🔎 Evaluar Entregable') + '</button>';
        }
        else if (tx.status === 'consolidated' || tx.status === 'approved') {
            statusTag = '<span style="color:var(--accent-green);font-size:0.6rem;border:1px solid var(--accent-green);padding:2px 7px;border-radius:8px;font-weight:bold;background:rgba(0,230,118,0.08);">SELLADO</span>';

            if (tx.proofLink === 'Agent_Auto_Report') {
                aiOutputHtml = '<div class="task-ai-output" style="max-height:55px;opacity:0.6;"><b>🤖 PoW:</b><br>' + (tx.comentario || '').replace(/\n/g,'<br>') + '</div>';
            }

            var earnedSlices = tx.valorCongelado;
            if (!earnedSlices) {
                var fmv  = parseFloat((toRole && toRole.fmv)        || 40);
                var mult = parseFloat((toRole && toRole.multiplier) || 1);
                var hrs  = parseFloat(tx.realHours) || parseFloat(flowData.estimatedHours) || parseFloat(flowData.horas) || 1;
                earnedSlices = hrs * fmv * mult;
            }
            actionHtml = '<div style="color:var(--accent-green);font-size:1rem;font-weight:900;font-family:var(--font-mono);text-align:center;padding:8px;background:rgba(0,230,118,0.04);border-radius:7px;border:1px dashed var(--accent-green);width:100%;">+' + Math.round(earnedSlices).toLocaleString() + ' Slices</div>';
        }

        // ── Contexto textual ──────────────────────────────────────────────────
        var contextText = tx.comentario || tx.descripcionContexto || flowData.context || '';
        if (tx.proofLink === 'Agent_Auto_Report' || tx.proofLink === 'Usenet_Thread') contextText = '';
        var contextHtml = contextText ? '<div class="task-desc-bubble">💬 "' + contextText.substring(0, 120) + (contextText.length > 120 ? '…' : '') + '"</div>' : '';

        // ── Horas estimadas ───────────────────────────────────────────────────
        var hrs = flowData.estimatedHours || flowData.horas || tx.estimatedHours || 1;

        // ── SOC progress ──────────────────────────────────────────────────────
        var socProgressHtml = socs.length > 0
            ? '<div class="soc-progress">☑ ' + checkedCount + '/' + socs.length + ' SOCs</div>'
            : '<button class="kb-action" data-action="eval" ' + hashAttr + ' style="background:rgba(255,171,64,0.06);border:1px dashed rgba(255,171,64,0.3);color:var(--accent-orange);padding:2px 7px;border-radius:5px;font-size:0.68rem;font-weight:bold;cursor:pointer;">+ SOCs</button>';

        return '<div class="task-card">' +

            // Header: ruta rol→rol
            '<div class="task-header">' +
            '<div class="task-route">' +
            '<div class="route-node">' +
            '<span class="route-level" style="color:' + color + ';border-color:' + color + ';">' + (fromLevel || 'rol') + '</span>' +
            '<span class="route-name" title="' + fromName + '">' + fromName.substring(0, 14) + '</span>' +
            '</div>' +
            '<span class="route-arrow">→</span>' +
            '<div class="route-node">' +
            '<span class="route-level" style="color:#666;border-color:#333;">→ ' + (toLevel || 'rol') + '</span>' +
            '<span class="route-name" title="' + toName + '">' + toName.substring(0, 14) + '</span>' +
            '</div>' +
            '</div>' +
            statusTag +
            '</div>' +

            // Título del entregable
            '<h3 class="task-title">' + titleText + '</h3>' +

            // Entregable expandible
            (hasFullDeliv ? '<div class="task-deliv" data-toggle-deliv="true">' +
                '<span style="color:#555;font-size:0.7rem;">📄 ' + entregable.substring(0, 60) + '…</span>' +
                '<span class="task-deliv-toggle">▾ ver</span>' +
                '<div class="task-deliv-full">' + entregable + '</div>' +
                '</div>' : '') +

            // SOCs
            socsHtml +

            // Contexto
            contextHtml +

            // AI output
            aiOutputHtml +

            // Campo entregable humano
            humanInputHtml +

            // Meta row
            '<div class="task-meta-row">' + socProgressHtml +
            '<span style="font-weight:bold;color:white;font-family:var(--font-mono);">⏱ ' + hrs + 'h</span></div>' +

            // Acciones
            '<div class="task-actions">' + actionHtml + '</div>' +
            '</div>';
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  Attach Events
    // ══════════════════════════════════════════════════════════════════════════
    _attachEvents() {
        var self = this;

        // ── Expandir entregable ───────────────────────────────────────────────
        this.container.querySelectorAll('[data-toggle-deliv]').forEach(function(el) {
            el.addEventListener('click', function() {
                el.classList.toggle('expanded');
                var toggle = el.querySelector('.task-deliv-toggle');
                if (toggle) toggle.textContent = el.classList.contains('expanded') ? '▴ ocultar' : '▾ ver';
            });
        });

        // ── Acciones Kanban ───────────────────────────────────────────────────
        this.container.querySelectorAll('.kb-action').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var action  = e.currentTarget.dataset.action;
                var hash    = e.currentTarget.dataset.hash;
                var isLeg   = e.currentTarget.dataset.legacy === 'true';
                var agentId = e.currentTarget.dataset.agent;

                if (action === 'open-push-modal') {
                    document.dispatchEvent(new CustomEvent('sos:push-modal', {
                        bubbles: true,
                        detail: { hash: hash, isLegacy: isLeg, projectId: self.options.project && self.options.project.id }
                    }));
                    return;
                }

                if (action === 'eval') {
                    WoEvalPanel.open({ projectId: self.options.project && self.options.project.id, woHash: hash, isLegacy: isLeg });
                    return;
                }

                if (action === 'submit-deliverable') {
                    // Buscar el textarea asociado a esta WO
                    var card    = btn.closest('.task-card');
                    var textarea= card ? card.querySelector('.task-human-input') : null;
                    var content = textarea ? textarea.value.trim() : '';
                    window.dispatchEvent(new CustomEvent('kanban-action', {
                        detail: { action: 'submit-deliverable', hash: hash, isLegacy: isLeg, deliverableContent: content, element: e.currentTarget }
                    }));
                    return;
                }

                window.dispatchEvent(new CustomEvent('kanban-action', {
                    detail: { action: action, hash: hash, isLegacy: isLeg, agentId: agentId, element: e.currentTarget }
                }));
            });
        });

        // ── Botón añadir WO ───────────────────────────────────────────────────
        this.container.querySelectorAll('.btn-add-wo').forEach(function(btn) {
            btn.addEventListener('click', function() {
                window.dispatchEvent(new CustomEvent('kanban-inject-wo', {
                    detail: { projectId: self.options.project && self.options.project.id }
                }));
            });
        });
    }
}
