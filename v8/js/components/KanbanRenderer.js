// v8/js/components/KanbanRenderer.js

export class KanbanRenderer {
    constructor(containerEl, options = {}) {
        this.container = containerEl;
        this.options = Object.assign({
            project: null,
            activeUserId: null,
            isPO: false,
            currentFilter: 'all',
            isProcessingAi: false,
            isMacroMode: false 
        }, options);
        
        this.colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': 'var(--accent-orange)', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-blue)', '@pinya': 'var(--accent-green)' };
    }

    static getStyles() {
        return `
            .kanban-board-layout { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; align-items: start; width: 100%; padding-bottom: 2rem; }
            .kanban-column { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; display: flex; flex-direction: column; min-height: 500px;}
            .kanban-col-header { padding: 15px 20px; font-weight: 900; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;}
            .kanban-col-count { background: rgba(255,255,255,0.1); font-family: var(--font-mono); font-size: 0.8rem; padding: 2px 8px; border-radius: 12px; }
            .kanban-col-body { padding: 15px; display: flex; flex-direction: column; gap: 15px; flex: 1; }

            .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; align-items: start; width: 100%; }

            .task-card { box-sizing: border-box; width: 100%; background: linear-gradient(180deg, rgba(25,25,30,0.8) 0%, rgba(10,10,15,0.9) 100%); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; position: relative; display: flex; flex-direction: column; gap: 10px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 5px 20px rgba(0,0,0,0.3); }
            .task-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.15); box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.6);}
            .task-card.ai-processing { border-color: var(--accent-purple); box-shadow: 0 0 30px rgba(224,64,251,0.3); animation: aiPulse 2s infinite; }
            
            .task-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 5px;}
            .task-route { display: flex; gap: 4px; align-items: center; flex-wrap: wrap;}
            .route-badge { font-size: 0.65rem; padding: 3px 6px; border-radius: 6px; font-family: var(--font-mono); font-weight: bold; border: 1px solid; white-space: nowrap;}
            
            .task-title { color: white; font-size: 1.1rem; margin: 0; line-height: 1.3; font-weight: 900; word-break: break-word;}
            .task-desc-bubble { font-size: 0.8rem; color: #aaa; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 8px; border-left: 2px solid var(--accent-blue); font-style: italic; line-height: 1.4;}
            .task-ai-output { font-size: 0.8rem; color: #ddd; background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); padding: 10px; border-radius: 8px; line-height: 1.4; max-height: 100px; overflow-y: auto;}

            .task-meta-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #888; background: rgba(0,0,0,0.4); padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); margin-top: auto;}
            .soc-progress { display: flex; align-items: center; gap: 5px; font-weight: bold; font-family: var(--font-mono); color: var(--accent-blue); }
            
            .task-actions { margin-top: 10px; display: flex; flex-direction: row; gap: 8px;}
            
            .btn-pull, .btn-push { flex: 1; background: transparent; border: 1px solid #666; color: white; transition: 0.2s; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 0.85rem;}
            .btn-pull:hover { background: white; color: black; border-color: white;}
            .btn-push { border-style: dashed; border-color: var(--accent-purple); color: var(--accent-purple); }
            .btn-push:hover { background: rgba(224, 64, 251, 0.1); border-style: solid;}

            .btn-focus { flex: 1; background: linear-gradient(135deg, rgba(0,176,255,0.1), rgba(0,176,255,0.2)); border: 1px solid var(--accent-blue); color: var(--accent-blue); text-align: center; text-decoration: none; padding: 10px; border-radius: 8px; font-weight: 900; transition: 0.3s; font-size: 0.85rem; display:flex; justify-content:center; align-items:center;}
            .btn-focus:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 15px rgba(0,176,255,0.4);}
            
            .btn-reject { background: transparent; border: 1px solid var(--accent-red); color: var(--accent-red); padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s;}
            .btn-reject:hover { background: var(--accent-red); color: white;}

            .btn-ai-exec { flex: 1; background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(224, 64, 251, 0.2)); border: 1px solid var(--accent-purple); color: var(--accent-purple); text-align: center; text-decoration: none; padding: 10px; border-radius: 8px; font-weight: 900; transition: 0.3s; font-size: 0.85rem; cursor:pointer;}
            .btn-ai-exec:hover { background: var(--accent-purple); color: white; box-shadow: 0 0 20px rgba(224, 64, 251, 0.5);}

            .btn-review { flex: 1; background: var(--accent-blue); color: black; border: none; padding: 10px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.2s; font-size: 0.85rem;}
            .btn-review:hover { transform: scale(1.02); box-shadow: 0 0 15px rgba(0,176,255,0.4);}

            .btn-approve { flex: 1; background: var(--accent-green); color: black; border: none; padding: 10px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.2s; font-size: 0.85rem;}
            .btn-approve:hover { transform: scale(1.02); box-shadow: 0 0 15px rgba(0,230,118,0.4);}

            .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted); font-size: 0.9rem; font-style: italic;}

            @keyframes aiPulse { 0% { box-shadow: 0 0 10px rgba(224,64,251,0.2); } 50% { box-shadow: 0 0 30px rgba(224,64,251,0.6); } 100% { box-shadow: 0 0 10px rgba(224,64,251,0.2); } }

            @media (max-width: 1024px) {
                .kanban-board-layout { grid-template-columns: 1fr; gap: 2rem;}
                .kanban-column { min-height: auto; }
            }
        `;
    }

    render() {
        if (!this.container || !this.options.project) return;
        const { project, activeUserId, isPO, currentFilter, isMacroMode } = this.options;
        
        let allTasks = [
            ...(project.work_orders || []).map(wo => ({ ...wo, isWorkOrder: true })),
            ...(project.transactions || []).map(tx => ({ ...tx, isWorkOrder: false }))
        ];

        const activeSprintId = project.activeSprintId;
        allTasks = allTasks.filter(tx => !tx.isWorkOrder || tx.sprintId === activeSprintId);

        let cols = { 'oportunidades': [], 'en-curso': [], 'contabilizado': [] };

        allTasks.forEach(tx => {
            let flowData = tx.isWorkOrder ? ((project.vna_flows || []).find(f => f.id === tx.flowId) || { tipo: 'tangible', template: 'Tarea Huérfana', estimatedHours: 0 }) : tx;

            if (currentFilter === 'tangible' && flowData.tipo !== 'tangible') return;
            if (currentFilter === 'intangible' && flowData.tipo !== 'intangible') return;
            if (currentFilter === 'mine' && tx.status !== 'theoretical' && tx.assigneeId !== activeUserId) return;
            if (!isPO && currentFilter === 'all' && tx.status !== 'theoretical' && tx.assigneeId !== activeUserId) return;

            const cardHtml = this.buildCardHTML(tx, flowData, project);

            if (tx.status === 'theoretical' || tx.status === 'requested') cols['oportunidades'].push(cardHtml);
            else if (tx.status === 'pinged' || tx.status === 'reported' || tx.status === 'in_review') cols['en-curso'].push(cardHtml);
            else if (tx.status === 'consolidated' || tx.status === 'approved') cols['contabilizado'].push(cardHtml);
        });

        if (isMacroMode) {
            const allCards = [...cols['oportunidades'], ...cols['en-curso'], ...cols['contabilizado']];
            this.container.innerHTML = allCards.length > 0 ? `<div class="task-grid">${allCards.join('')}</div>` : `<div class="empty-state">No hay tareas que mostrar.</div>`;
        } else {
            const colOportunidades = cols['oportunidades'].length > 0 ? cols['oportunidades'].join('') : `<div class="empty-state">No hay oportunidades libres en el Sprint.</div>`;
            const colEnCurso = cols['en-curso'].length > 0 ? cols['en-curso'].join('') : `<div class="empty-state">No hay tareas activas o en auditoría.</div>`;
            const colSelladas = cols['contabilizado'].length > 0 ? cols['contabilizado'].join('') : `<div class="empty-state">Aún no se han sellado Slices.</div>`;

            this.container.innerHTML = `
                <div class="kanban-board-layout">
                    <div class="kanban-column" style="border-top: 3px solid #888;">
                        <div class="kanban-col-header" style="color: #ccc;"><span>📥 Oportunidades</span><span class="kanban-col-count">${cols['oportunidades'].length}</span></div>
                        <div class="kanban-col-body">${colOportunidades}</div>
                    </div>
                    <div class="kanban-column" style="border-top: 3px solid var(--accent-orange);">
                        <div class="kanban-col-header" style="color: var(--accent-orange);"><span>⏳ En Curso / Auditoría</span><span class="kanban-col-count" style="color: white;">${cols['en-curso'].length}</span></div>
                        <div class="kanban-col-body">${colEnCurso}</div>
                    </div>
                    <div class="kanban-column" style="border-top: 3px solid var(--accent-green);">
                        <div class="kanban-col-header" style="color: var(--accent-green);"><span>💎 Selladas (Ledger)</span><span class="kanban-col-count" style="color: white;">${cols['contabilizado'].length}</span></div>
                        <div class="kanban-col-body">${colSelladas}</div>
                    </div>
                </div>
            `;
        }
        this.attachEvents();
    }

    buildCardHTML(tx, flowData, project) {
        const { isPO, activeUserId } = this.options;
        const role = project.roles.find(r => r.id === flowData.from) || { name: 'Nodo Borrado', levelId: '@baixos' };
        const receiverRole = project.roles.find(r => r.id === flowData.to) || { name: 'Destino', levelId: '?' };
        
        const color = this.colors[role.levelId] || '#aaa';
        const tipoColor = flowData.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
        const tipoEmoji = flowData.tipo === 'tangible' ? '🟢' : '🟣';
        
        const isLegacy = !tx.isWorkOrder;
        const hashAttr = `data-hash="${tx.hash}" data-legacy="${isLegacy}"`;

        let actionHtml = ''; let statusTag = ''; let aiOutputHtml = '';

        const socs = tx.soc_checklist || flowData.soc_checklist || [];
        const checkedCount = socs.filter(s => s.isChecked).length;
        const socHtml = socs.length > 0 ? `<div class="soc-progress">☑️ ${checkedCount}/${socs.length} SOCs</div>` : '';

        if (tx.status === 'theoretical') {
            statusTag = `<span style="color:#aaa; font-size:0.65rem; border:1px solid #444; padding:3px 8px; border-radius:12px; font-weight:bold; letter-spacing:1px;">LIBRE</span>`;
            if (isPO) {
                actionHtml = `
                    <button class="btn-pull kb-action" data-action="request" ${hashAttr} title="Adjudicarme la tarea">📥 PULL</button>
                    <button class="btn-push kb-action" data-action="push" ${hashAttr} title="Asignar a un miembro">👤 PUSH (Asignar)</button>
                `;
            } else {
                actionHtml = `<button class="btn-pull kb-action" data-action="request" ${hashAttr}>✋ Solicitar</button>`;
            }
        } 
        else if (tx.status === 'requested') {
            statusTag = `<span style="color:var(--accent-red); font-size:0.65rem; border:1px solid var(--accent-red); padding:3px 8px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(255,82,82,0.1);">SOLICITADO</span>`;
            if (isPO) {
                actionHtml = `<button class="btn-approve kb-action" data-action="approve-pull" ${hashAttr} data-userid="${tx.assigneeId}">✅ Aprobar PULL a ${tx.assigneeId}</button>`;
            } else {
                actionHtml = `<div style="color: var(--accent-orange); font-size: 0.8rem; text-align: center; padding: 8px; border: 1px dashed var(--accent-orange); border-radius: 8px;">✋ Esperando aprobación PO</div>`;
            }
        }
        else if (tx.status === 'pinged') {
            statusTag = `<span style="color:var(--accent-orange); font-size:0.65rem; border:1px solid var(--accent-orange); padding:3px 8px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(255,171,64,0.1);">WIP</span>`;
            const isMine = tx.assigneeId === activeUserId;
            const isAiAssignee = tx.assigneeId && tx.assigneeId.startsWith('@') && !isMine; 

            if (isMine) {
                actionHtml = `
                    <a href="/v8/paper?hash=${tx.hash}&legacy=${isLegacy}" class="btn-focus" data-link>▶ OMNI-PAPER</a>
                    <button class="btn-reject kb-action" data-action="reject" ${hashAttr} title="Rechazar Tarea">✖</button>
                `;
            }
            else if (isAiAssignee && isPO) actionHtml = `<button class="btn-ai-exec kb-action" data-action="ai-exec" ${hashAttr} data-agent="${tx.assigneeId}">⚡ EJECUTAR (${tx.assigneeId})</button>`;
            else actionHtml = `<div style="color: white; font-size: 0.8rem; text-align: center; padding: 8px; background:rgba(0,0,0,0.4); border-radius: 8px; border:1px solid #333;">Asignado: <b>${tx.assigneeId}</b></div>`;
        } 
        else if (tx.status === 'reported' || tx.status === 'in_review') {
            statusTag = `<span style="color:var(--accent-blue); font-size:0.65rem; border:1px solid var(--accent-blue); padding:3px 8px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(0,176,255,0.1);">AUDITORÍA</span>`;
            if (tx.proofLink === 'Agent_Auto_Report' || tx.proofLink === 'Usenet_Thread') {
                aiOutputHtml = `<div class="task-ai-output"><b>🤖 Resultado:</b><br>${(tx.comentario || '').replace(/\n/g, '<br>')}</div>`;
            }
            actionHtml = `
                ${isPO ? `<button class="btn-review kb-action" data-action="review" ${hashAttr}>🔎 Auditar SOCs</button>` : `<div style="font-size:0.8rem; color:#888; text-align:center; padding:10px; border:1px dashed #333; border-radius:8px;">Pendiente de Notaría</div>`}
            `;
        }
        else if (tx.status === 'consolidated' || tx.status === 'approved') {
            statusTag = `<span style="color:var(--accent-green); font-size:0.65rem; border:1px solid var(--accent-green); padding:3px 8px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(0,230,118,0.1);">SELLADO</span>`;
            if (tx.proofLink === 'Agent_Auto_Report' || tx.proofLink === 'Usenet_Thread') {
                aiOutputHtml = `<div class="task-ai-output" style="max-height:60px; opacity:0.7;"><b>🤖 Resultado:</b><br>${(tx.comentario || '').replace(/\n/g, '<br>')}</div>`;
            }
            actionHtml = `
                <div style="color: var(--accent-green); font-size: 1.1rem; font-weight: 900; font-family: var(--font-mono); text-align: center; padding: 10px; background: rgba(0, 230, 118, 0.05); border-radius: 8px; border: 1px dashed var(--accent-green); width: 100%;">
                    +${Math.round(tx.valorCongelado || 0).toLocaleString()} Slices
                </div>
            `;
        }

        const borderStyle = tx.status === 'requested' ? 'border-color: var(--accent-red); box-shadow: 0 0 20px rgba(255,82,82,0.15);' : '';
        const titleText = flowData.template || flowData.entregable || 'Work Order';
        let contextText = tx.comentario || tx.descripcionContexto || flowData.context || '';
        if (tx.proofLink === 'Agent_Auto_Report' || tx.proofLink === 'Usenet_Thread') contextText = ''; 

        const contextHtml = contextText ? `<div class="task-desc-bubble">💬 "${contextText}"</div>` : '';

        return `
            <div class="task-card" style="${borderStyle}">
                <div class="task-header">
                    <div class="task-route">
                        <span class="route-badge" style="color: ${color}; border-color: ${color};" title="${role.name}">${role.levelId}</span>
                        <span style="color: #666; font-size:0.8rem;">&rarr;</span>
                        <span class="route-badge" style="color: #888; border-color: #444;" title="${receiverRole.name}">${receiverRole.levelId}</span>
                    </div>
                    ${statusTag}
                </div>
                <h3 class="task-title">${titleText}</h3>
                ${contextHtml}
                ${aiOutputHtml}
                <div class="task-meta-row">
                    ${socHtml || `<span style="color: #666; font-weight: bold; font-size:0.75rem;">Sin SOCs</span>`}
                    <span style="font-weight:bold; color:white; font-family:var(--font-mono);">⏱ ${flowData.estimatedHours || flowData.horas || 1}h</span>
                </div>
                <div class="task-actions">
                    ${actionHtml}
                </div>
            </div>
        `;
    }

    attachEvents() {
        const actionBtns = this.container.querySelectorAll('.kb-action');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const hash = e.currentTarget.dataset.hash;
                const isLegacy = e.currentTarget.dataset.legacy === "true";
                const userId = e.currentTarget.dataset.userid;
                const agentId = e.currentTarget.dataset.agent;
                
                window.dispatchEvent(new CustomEvent('kanban-action', { 
                    detail: { action, hash, isLegacy, userId, agentId, element: e.currentTarget } 
                }));
            });
        });
    }
}
