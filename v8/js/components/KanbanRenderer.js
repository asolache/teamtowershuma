// v8/js/components/KanbanRenderer.js

export class KanbanRenderer {
    /**
     * @param {HTMLElement} containerEl - Contenedor HTML (div) donde se inyectará el Kanban
     * @param {Object} options - Configuración y context (ej: project data, activeUser)
     */
    constructor(containerEl, options = {}) {
        this.container = containerEl;
        this.options = Object.assign({
            project: null,
            activeUserId: null,
            isPO: false,
            currentTab: 'oportunidades',
            currentFilter: 'all',
            isProcessingAi: false
        }, options);
        
        this.colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': 'var(--accent-orange)', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-blue)', '@pinya': 'var(--accent-green)' };
    }

    static getStyles() {
        return `
            .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; align-items: start; padding-bottom: 2rem; width: 100%; }
            .task-card { box-sizing: border-box; width: 100%; background: linear-gradient(180deg, rgba(25,25,30,0.8) 0%, rgba(10,10,15,0.9) 100%); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.8rem; transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s; position: relative; display: flex; flex-direction: column; gap: 12px; backdrop-filter: blur(15px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5); }
            .task-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.15); box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 15px 40px rgba(0,0,0,0.8);}
            .task-card.ai-processing { border-color: var(--accent-purple); box-shadow: 0 0 30px rgba(224,64,251,0.3); animation: aiPulse 2s infinite; }
            
            .task-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
            .task-route { display: flex; gap: 8px; align-items: center; flex-wrap: wrap;}
            .route-badge { font-size: 0.7rem; padding: 4px 10px; border-radius: 8px; font-family: var(--font-mono); font-weight: 900; border: 1px solid; white-space: nowrap;}
            
            .task-title { color: white; font-size: 1.25rem; margin: 5px 0 0 0; line-height: 1.3; font-weight: 900; letter-spacing: -0.5px; word-break: break-word;}
            .task-desc-bubble { font-size: 0.85rem; color: #aaa; background: rgba(0,0,0,0.5); padding: 12px; border-radius: 8px; border-left: 3px solid var(--accent-blue); margin-bottom: 5px; font-style: italic; line-height: 1.5; word-break: break-word;}
            .task-ai-output { font-size: 0.85rem; color: #ddd; background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); padding: 12px; border-radius: 8px; margin-bottom: 5px; line-height: 1.5; max-height: 150px; overflow-y: auto;}

            .task-meta-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #888; background: rgba(0,0,0,0.4); padding: 12px 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);}
            .soc-progress { display: flex; align-items: center; gap: 5px; font-weight: bold; font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-blue); }
            
            .task-actions { margin-top: auto; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1); display: flex; flex-direction: row; gap: 10px;}
            
            .btn-pull, .btn-push { flex: 1; background: transparent; border: 1px solid #666; color: white; transition: 0.2s; padding: 12px; border-radius: 10px; cursor: pointer; font-weight: bold; font-size: 0.9rem;}
            .btn-pull:hover { background: white; color: black; border-color: white;}
            .btn-push { border-style: dashed; border-color: var(--accent-purple); color: var(--accent-purple); }
            .btn-push:hover { background: rgba(224, 64, 251, 0.1); border-style: solid;}

            .btn-focus { flex: 1; background: linear-gradient(135deg, rgba(0,176,255,0.1), rgba(0,176,255,0.2)); border: 1px solid var(--accent-blue); color: var(--accent-blue); text-align: center; text-decoration: none; padding: 12px; border-radius: 10px; font-weight: 900; transition: 0.3s; font-size: 0.9rem;}
            .btn-focus:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 20px rgba(0,176,255,0.4);}
            
            .btn-ai-exec { flex: 1; background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(224, 64, 251, 0.2)); border: 1px solid var(--accent-purple); color: var(--accent-purple); text-align: center; text-decoration: none; padding: 12px; border-radius: 10px; font-weight: 900; transition: 0.3s; font-size: 0.9rem; cursor:pointer;}
            .btn-ai-exec:hover { background: var(--accent-purple); color: white; box-shadow: 0 0 25px rgba(224, 64, 251, 0.5);}

            .btn-review { flex: 1; background: var(--accent-blue); color: black; border: none; padding: 12px; border-radius: 10px; font-weight: 900; cursor: pointer; transition: 0.2s; font-size: 0.9rem;}
            .btn-review:hover { transform: scale(1.02); box-shadow: 0 0 15px rgba(0,176,255,0.4);}

            .btn-approve { flex: 1; background: var(--accent-green); color: black; border: none; padding: 12px; border-radius: 10px; font-weight: 900; cursor: pointer; transition: 0.2s; font-size: 0.9rem;}
            .btn-approve:hover { transform: scale(1.02); box-shadow: 0 0 15px rgba(0,230,118,0.4);}

            .empty-state { grid-column: 1 / -1; text-align: center; padding: 5rem 2rem; color: var(--text-muted); font-size: 1.2rem; border: 1px dashed var(--glass-border); border-radius: 20px; background: rgba(0,0,0,0.3);}

            @keyframes aiPulse { 0% { box-shadow: 0 0 10px rgba(224,64,251,0.2); } 50% { box-shadow: 0 0 40px rgba(224,64,251,0.6); } 100% { box-shadow: 0 0 10px rgba(224,64,251,0.2); } }

            @media (max-width: 768px) {
                .task-grid { grid-template-columns: 1fr; gap: 1.2rem; padding-bottom: 2rem; }
                .task-actions { flex-direction: column; gap: 10px; }
                .btn-pull, .btn-push, .btn-focus, .btn-ai-exec, .btn-review, .btn-approve { width: 100%; padding: 14px;}
            }
        `;
    }

    render() {
        if (!this.container || !this.options.project) return;
        
        const { project, activeUserId, isPO, currentTab, currentFilter } = this.options;
        let activeCardsHtml = [];

        let allTasks = [
            ...(project.work_orders || []).map(wo => ({ ...wo, isWorkOrder: true })),
            ...(project.transactions || []).map(tx => ({ ...tx, isWorkOrder: false }))
        ];

        const activeSprintId = project.activeSprintId;
        allTasks = allTasks.filter(tx => {
            if (!tx.isWorkOrder) return true; 
            return tx.sprintId === activeSprintId;
        });

        allTasks.forEach(tx => {
            let tabCategory = '';
            if (tx.status === 'theoretical' || tx.status === 'requested') tabCategory = 'oportunidades';
            else if (tx.status === 'pinged' || tx.status === 'reported' || tx.status === 'in_review') tabCategory = 'en-curso';
            else if (tx.status === 'consolidated' || tx.status === 'approved') tabCategory = 'contabilizado';

            // Para el modo Macro del Omni-Paper, mostramos todo sin importar el tab
            if (!this.options.isMacroMode && tabCategory !== currentTab) return;

            let flowData = tx.isWorkOrder ? ((project.vna_flows || []).find(f => f.id === tx.flowId) || { tipo: 'tangible', template: 'Tarea Huérfana', estimatedHours: 0 }) : tx;

            if (currentFilter === 'tangible' && flowData.tipo !== 'tangible') return;
            if (currentFilter === 'intangible' && flowData.tipo !== 'intangible') return;
            if (currentFilter === 'mine' && tx.status !== 'theoretical' && tx.assigneeId !== activeUserId) return;
            if (!isPO && currentFilter === 'all' && tabCategory !== 'oportunidades' && tx.assigneeId !== activeUserId) return;

            activeCardsHtml.push(this.buildCardHTML(tx, flowData, project));
        });

        if (activeCardsHtml.length > 0) {
            this.container.innerHTML = `<div class="task-grid">${activeCardsHtml.join('')}</div>`;
        } else {
            let emptyMsg = "No hay tareas en esta vista.";
            if (currentTab === 'oportunidades') emptyMsg = "No hay oportunidades libres en el mercado del Sprint actual.";
            if (currentTab === 'en-curso') emptyMsg = "No hay ninguna tarea activa en proceso o auditoría en este Sprint.";
            if (currentTab === 'contabilizado') emptyMsg = "Aún no se han sellado Slices en este Sprint.";
            
            this.container.innerHTML = `<div class="task-grid"><div class="empty-state">${emptyMsg}</div></div>`;
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

        let actionHtml = '';
        let statusTag = '';
        let aiOutputHtml = '';

        const socs = tx.soc_checklist || flowData.soc_checklist || [];
        const checkedCount = socs.filter(s => s.isChecked).length;
        const socHtml = socs.length > 0 ? `<div class="soc-progress">☑️ SOCs: ${checkedCount}/${socs.length}</div>` : '';

        if (tx.status === 'theoretical') {
            statusTag = `<span style="color:#aaa; font-size:0.7rem; border:1px solid #444; padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px;">LIBRE</span>`;
            if (isPO) {
                actionHtml = `
                    <button class="btn-pull kb-action" data-action="request" ${hashAttr} title="Adjudicarme la tarea">📥 Hacer PULL</button>
                    <button class="btn-push kb-action" data-action="push" ${hashAttr} title="Asignar a un miembro de la Colla">👤 Delegar (PUSH)</button>
                `;
            } else {
                actionHtml = `<button class="btn-pull kb-action" data-action="request" ${hashAttr}>✋ Solicitar Asignación</button>`;
            }
        } 
        else if (tx.status === 'requested') {
            statusTag = `<span style="color:var(--accent-red); font-size:0.7rem; border:1px solid var(--accent-red); padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(255,82,82,0.1);">SOLICITADO</span>`;
            if (isPO) {
                actionHtml = `
                    <div style="font-size: 0.85rem; color: #ccc; margin-bottom: 10px; background:rgba(0,0,0,0.5); padding:10px; border-radius:8px; border-left:2px solid var(--accent-red);"><b>${tx.assigneeId}</b> solicita ejecutar.</div>
                    <button class="btn-approve kb-action" data-action="approve-pull" ${hashAttr} data-userid="${tx.assigneeId}">✅ Aprobar Asignación</button>
                `;
            } else {
                actionHtml = `<div style="color: var(--accent-orange); font-size: 0.85rem; text-align: center; padding: 10px; border: 1px dashed var(--accent-orange); border-radius: 8px;">✋ Esperando aprobación PO...</div>`;
            }
        }
        else if (tx.status === 'pinged') {
            statusTag = `<span style="color:var(--accent-orange); font-size:0.7rem; border:1px solid var(--accent-orange); padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(255,171,64,0.1);">EN CURSO</span>`;
            const isMine = tx.assigneeId === activeUserId;
            const isAiAssignee = tx.assigneeId && tx.assigneeId.startsWith('@') && !isMine; // Aproximación rápida para IA 

            if (isMine) actionHtml = `<a href="/v8/paper?hash=${tx.hash}&legacy=${isLegacy}" class="btn-focus" data-link>▶ MODO OMNI-PAPER</a>`;
            else if (isAiAssignee && isPO) actionHtml = `<button class="btn-ai-exec kb-action" data-action="ai-exec" ${hashAttr}>⚡ EJECUTAR IA</button>`;
            else actionHtml = `<div style="color: #888; font-size: 0.85rem; text-align: center; padding: 12px; background:rgba(0,0,0,0.4); border-radius: 10px; border:1px solid #333;">Ejecutando: <span style="color:white; font-weight:bold;">${tx.assigneeId}</span></div>`;
        } 
        else if (tx.status === 'reported' || tx.status === 'in_review') {
            statusTag = `<span style="color:var(--accent-blue); font-size:0.7rem; border:1px solid var(--accent-blue); padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(0,176,255,0.1);">${tx.status === 'reported' ? 'REPORTADO' : 'AUDITORÍA'}</span>`;
            if (tx.proofLink === 'Agent_Auto_Report' || tx.proofLink === 'Usenet_Thread') aiOutputHtml = `<div class="task-ai-output"><b>🤖 Output Adjunto:</b><br>${(tx.comentario || '').replace(/\n/g, '<br>')}</div>`;

            actionHtml = `
                <div style="font-size: 0.85rem; color: #ccc; background: rgba(0,0,0,0.6); padding: 12px; border-radius: 10px; margin-bottom: 12px; display:flex; justify-content:space-between; align-items:center; border-left:3px solid var(--accent-blue);">
                    <span>PoW Est: <strong style="color: white; font-family:var(--font-mono); font-size:1rem;">${tx.realHours}h</strong></span>
                </div>
                ${isPO ? `<button class="btn-review kb-action" data-action="review" ${hashAttr}>🔎 Auditar (SOCs)</button>` : `<div style="font-size:0.8rem; color:#888; text-align:center; padding:10px; border:1px dashed #333; border-radius:8px;">Pendiente de Notaría.</div>`}
            `;
        }
        else if (tx.status === 'consolidated' || tx.status === 'approved') {
            statusTag = `<span style="color:var(--accent-green); font-size:0.7rem; border:1px solid var(--accent-green); padding:4px 10px; border-radius:12px; font-weight:bold; letter-spacing:1px; background:rgba(0,230,118,0.1);">SELLADO</span>`;
            if (tx.proofLink === 'Agent_Auto_Report' || tx.proofLink === 'Usenet_Thread') aiOutputHtml = `<div class="task-ai-output" style="max-height:80px; opacity:0.8;"><b>🤖 Output:</b><br>${(tx.comentario || '').replace(/\n/g, '<br>')}</div>`;

            actionHtml = `
                <div style="color: var(--accent-green); font-size: 1.2rem; font-weight: 900; font-family: var(--font-mono); text-align: center; padding: 15px; background: rgba(0, 230, 118, 0.05); border-radius: 12px; border: 1px dashed var(--accent-green);">
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
                    ${socHtml || `<span style="color: ${tipoColor}; font-weight: bold; font-size:0.75rem; letter-spacing:1px;">${tipoEmoji} ${flowData.tipo.toUpperCase()}</span>`}
                    <span style="font-weight:bold; color:white; font-family:var(--font-mono);">⏱ ${flowData.estimatedHours || flowData.horas || 1}h <span style="color:#666; font-weight:normal; font-family:var(--font-main);">Est.</span></span>
                </div>

                <div class="task-actions">
                    ${actionHtml}
                </div>
            </div>
        `;
    }

    attachEvents() {
        // Disparar eventos Custom cuando se hace click en botones de acción
        const actionBtns = this.container.querySelectorAll('.kb-action');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                const hash = e.currentTarget.dataset.hash;
                const isLegacy = e.currentTarget.dataset.legacy === "true";
                const userId = e.currentTarget.dataset.userid;
                
                window.dispatchEvent(new CustomEvent('kanban-action', { 
                    detail: { action, hash, isLegacy, userId, element: e.currentTarget } 
                }));
            });
        });
    }
}
