// v9/js/views/ProjectView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';

export default class ProjectView {
    constructor() {
        document.title = "Kanban VNA | TeamTowers V9";
        this.projectId = localStorage.getItem('tt_active_project');
        this.project = null;
    }

    async getHtml() {
        await store.init();
        const state = store.getState();
        
        if (!this.projectId) {
            const userProjects = state.projects.filter(p => state.session.role === 'ecosystem-owner' || p.ownerId === state.session.activeUserId || (p.usuarios && p.usuarios.find(u => u.id === state.session.activeUserId)));
            if (userProjects.length > 0) {
                this.projectId = userProjects[userProjects.length - 1].id;
                localStorage.setItem('tt_active_project', this.projectId);
            }
        }
        
        this.project = state.projects.find(p => p.id === this.projectId);
        
        if (!this.project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/project')}
                    <main class="workspace" style="justify-content:center; align-items:center;">
                        <div style="text-align:center; color:#888;">
                            <span style="font-size:3rem; display:block; margin-bottom:1rem;">🌌</span>
                            No hay ecosistema activo. Selecciona uno en el Home.
                        </div>
                    </main>
                </div>
            `;
        }

        const headerConfig = {
            title: "Kanban Operativo (PULL)",
            subtitle: this.project.nombre,
            tagline: "Flujos de valor en tránsito. Asume una Work Order, trájala en el Omni-Paper y sella tu Proof of Work.",
            tabs: [],
            actionHtml: state.session.role === 'ecosystem-owner' || this.project.ownerId === state.session.activeUserId ? 
                `<button class="ph-btn-magic" style="border-color:var(--accent-purple); color:var(--accent-purple);" onclick="window.location.href='/v9/edit'">⚙️ Editar Matriz VNA</button>` : ''
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-kanban { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box; position: relative; background: radial-gradient(circle at center, #111116 0%, #050505 100%);}
                
                .kanban-board { display: flex; gap: 20px; overflow-x: auto; padding-bottom: 2rem; min-height: 70vh; align-items: flex-start;}
                
                .kanban-column { background: rgba(10,10,15,0.6); border: 1px solid var(--glass-border); border-radius: 16px; min-width: 320px; width: 320px; display: flex; flex-direction: column; max-height: 80vh;}
                .kc-header { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); border-radius: 16px 16px 0 0;}
                .kc-title { color: white; font-weight: 900; font-size: 1.1rem; margin: 0; display: flex; align-items: center; gap: 8px;}
                .kc-count { background: rgba(255,255,255,0.1); color: #ccc; font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; font-family: var(--font-mono); font-weight: bold;}
                
                .kc-cards { padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; flex: 1;}
                
                /* 🔥 TARJETA VNA MEJORADA */
                .k-card { background: linear-gradient(145deg, rgba(20,20,25,0.95), rgba(15,15,20,1)); border: 1px solid #333; border-left: 4px solid var(--accent-blue); border-radius: 12px; padding: 15px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); transition: 0.2s;}
                .k-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.5); border-color: #555;}
                
                .kc-top-row { display: flex; justify-content: space-between; align-items: flex-start;}
                .kc-flow-path { font-size: 0.7rem; color: #888; font-family: var(--font-mono); font-weight: bold; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; border: 1px solid #222;}
                .kc-flow-arrow { color: var(--accent-purple); }
                
                .kc-task-name { font-size: 1rem; color: white; font-weight: 900; line-height: 1.4; margin: 0; word-break: break-word;}
                
                .kc-botin { display: flex; justify-content: space-between; align-items: center; background: rgba(0,230,118,0.05); border: 1px dashed rgba(0,230,118,0.3); padding: 8px 10px; border-radius: 8px; margin-top: 5px;}
                .kc-botin-label { font-size: 0.7rem; color: var(--accent-green); text-transform: uppercase; font-weight: bold; letter-spacing: 1px;}
                .kc-botin-value { font-size: 0.9rem; color: white; font-family: var(--font-mono); font-weight: bold;}
                
                .kc-actions { display: flex; gap: 8px; margin-top: 5px;}
                .kcb-btn { flex: 1; border: none; padding: 8px; border-radius: 6px; font-weight: bold; font-size: 0.8rem; cursor: pointer; transition: 0.2s; text-align: center;}
                .kcb-btn.pull { background: rgba(0,176,255,0.1); color: var(--accent-blue); border: 1px solid var(--accent-blue);}
                .kcb-btn.pull:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 10px rgba(0,176,255,0.3);}
                .kcb-btn.work { background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color: white;}
                .kcb-btn.work:hover { filter: brightness(1.2); }
                .kcb-btn.audit { background: rgba(255,145,0,0.1); color: var(--accent-orange); border: 1px solid var(--accent-orange);}
                .kcb-btn.audit:hover { background: var(--accent-orange); color: black;}

                /* COLORES POR ESTADO */
                .col-pending .kc-header { border-bottom-color: var(--accent-blue); }
                .col-pending .k-card { border-left-color: var(--accent-blue); }
                
                .col-pinged .kc-header { border-bottom-color: var(--accent-orange); }
                .col-pinged .k-card { border-left-color: var(--accent-orange); }
                
                .col-reported .kc-header { border-bottom-color: var(--accent-purple); }
                .col-reported .k-card { border-left-color: var(--accent-purple); }
                
                .col-consolidated .kc-header { border-bottom-color: var(--accent-green); }
                .col-consolidated .k-card { border-left-color: var(--accent-green); opacity: 0.7;}
                .col-consolidated .k-card:hover { opacity: 1; }

                /* DROPDOWN CONTEXTUAL (ASIGNADO A) */
                .kc-assignee { font-size: 0.75rem; color: #aaa; display: flex; align-items: center; gap: 5px; margin-top: 5px;}
                .kc-avatar { width: 20px; height: 20px; background: #333; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 0.6rem; border: 1px solid #555;}

                @media (max-width: 768px) {
                    .workspace-kanban { padding: 90px 1rem 120px 1rem; }
                    .kanban-board { flex-direction: column; overflow-y: auto; overflow-x: hidden; align-items: stretch;}
                    .kanban-column { width: 100%; min-width: auto; max-height: none;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/project')}
                <main class="workspace-kanban">
                    ${PageHeader.getHtml(headerConfig)}
                    
                    <div class="kanban-board" id="kanbanBoard">
                        </div>
                </main>
                ${BottomNav.getHtml('/project')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();
        
        if (!this.project) return;

        this.dom = {
            board: document.getElementById('kanbanBoard')
        };

        this.renderBoard();
    }

    renderBoard() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        // Soportar legacy (transactions) o V9.1 (work_orders)
        const wos = this.project.work_orders && this.project.work_orders.length > 0 
            ? this.project.work_orders 
            : (this.project.transactions || []);

        const columns = [
            { id: 'pending', title: '📥 Backlog (PULL)', icon: '📋', class: 'col-pending' },
            { id: 'pinged', title: '🔥 En Progreso', icon: '⚙️', class: 'col-pinged' },
            { id: 'reported', title: '⚖️ En Notaría (TDD)', icon: '🔍', class: 'col-reported' },
            { id: 'consolidated', title: '✅ Slices Minados', icon: '🍕', class: 'col-consolidated' }
        ];

        let boardHtml = '';

        columns.forEach(col => {
            const colTasks = wos.filter(w => w.status === col.id);
            
            let cardsHtml = colTasks.map(task => {
                const isLegacy = !task.flowId;
                const flow = isLegacy ? task : (this.project.vna_flows || []).find(f => f.id === task.flowId);
                const roleFrom = this.project.roles.find(r => r.id === (flow ? flow.from : task.from));
                const roleTo = this.project.roles.find(r => r.id === (flow ? flow.to : task.to));
                
                const fromName = roleFrom ? roleFrom.name : 'Ecosistema';
                const toName = roleTo ? roleTo.name : 'Ecosistema';
                const fmv = roleTo ? (roleTo.fmv || 0) : 0;
                
                const horas = task.horas || (flow ? flow.horas : 1);
                const name = flow ? (flow.template || flow.entregable) : (task.comentario || 'Work Order');
                const botinSlices = (horas * fmv).toFixed(1);

                // Configuración de botones según estado y usuario
                let actionBtn = '';
                if (col.id === 'pending') {
                    actionBtn = `<button class="kcb-btn pull" data-action="pull" data-id="${task.id || task.hash}">Asumir Tarea</button>`;
                } else if (col.id === 'pinged') {
                    const isMine = task.workerId === activeUserId || task.assigneeId === activeUserId;
                    if (isMine) {
                        actionBtn = `<button class="kcb-btn work" data-action="work" data-id="${task.id || task.hash}">Ir a La Forja (Paper)</button>`;
                    } else {
                        const workerStr = task.workerId ? task.workerId.replace('@','') : 'Agente';
                        actionBtn = `<div class="kc-assignee"><div class="kc-avatar">${workerStr.charAt(0).toUpperCase()}</div> Operando: @${workerStr}</div>`;
                    }
                } else if (col.id === 'reported') {
                    if (state.session.role === 'ecosystem-owner' || this.project.ownerId === activeUserId) {
                        actionBtn = `<button class="kcb-btn audit" data-action="audit" data-id="${task.id || task.hash}">Auditar PoW</button>`;
                    } else {
                        actionBtn = `<div class="kc-assignee" style="color:var(--accent-orange);">Esperando validación del Arquitecto</div>`;
                    }
                }

                return `
                    <div class="k-card">
                        <div class="kc-top-row">
                            <div class="kc-flow-path">
                                ${fromName} <span class="kc-flow-arrow">→</span> ${toName}
                            </div>
                        </div>
                        <h4 class="kc-task-name">${name}</h4>
                        
                        <div class="kc-botin">
                            <span class="kc-botin-label">Incentivo Estimado</span>
                            <span class="kc-botin-value">${botinSlices} Slices</span>
                        </div>
                        
                        <div class="kc-actions">
                            ${actionBtn}
                        </div>
                    </div>
                `;
            }).join('');

            if (colTasks.length === 0) {
                cardsHtml = `<div style="text-align:center; padding:20px; color:#555; font-size:0.85rem; font-style:italic; border:1px dashed #333; border-radius:12px;">Vacío</div>`;
            }

            boardHtml += `
                <div class="kanban-column ${col.class}">
                    <div class="kc-header">
                        <h3 class="kc-title">${col.icon} ${col.title}</h3>
                        <span class="kc-count">${colTasks.length}</span>
                    </div>
                    <div class="kc-cards">
                        ${cardsHtml}
                    </div>
                </div>
            `;
        });

        this.dom.board.innerHTML = boardHtml;
        this.bindCardEvents();
    }

    bindCardEvents() {
        const triggerSPA = (url) => {
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('data-link', '');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        this.dom.board.querySelectorAll('.kcb-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const action = e.currentTarget.dataset.action;
                const taskId = e.currentTarget.dataset.id;
                const state = store.getState();
                const activeUserId = state.session.activeUserId;

                if (action === 'pull') {
                    if (confirm("¿Asumir esta Work Order? Pasará a la columna 'En Progreso'.")) {
                        try {
                            const isLegacy = this.project.transactions && this.project.transactions.some(t => t.hash === taskId);
                            const listType = isLegacy ? 'transactions' : 'work_orders';
                            const payloadKey = isLegacy ? 'txHash' : 'woHash';

                            await store.dispatch({
                                type: 'UPDATE_PROJECT_INFO',
                                payload: {
                                    projectId: this.project.id,
                                    updates: {
                                        [listType]: this.project[listType].map(t => {
                                            if ((t.id || t.hash) === taskId) {
                                                return { ...t, status: 'pinged', workerId: activeUserId, assigneeId: activeUserId };
                                            }
                                            return t;
                                        })
                                    }
                                }
                            });
                            this.renderBoard();
                        } catch (err) {
                            alert("Error al hacer PULL: " + err.message);
                        }
                    }
                } 
                else if (action === 'work') {
                    // Enrutamiento SPA directo al Omni-Paper con la tarea cargada
                    triggerSPA(`/v9/paper?hash=${taskId}`);
                }
                else if (action === 'audit') {
                    // Por ahora abrimos un alert, en el futuro abriremos el Modal de Notaría
                    const task = (this.project.work_orders || this.project.transactions).find(t => (t.id || t.hash) === taskId);
                    const hours = task.realHours || task.horas || 0;
                    if (confirm(`El operario ha sellado el PoW con ${hours} horas.\n\nEnlace: ${task.proofLink || 'N/A'}\n\n¿Aprobar y consolidar en el Slicing Pie?`)) {
                        try {
                            const isLegacy = !task.flowId;
                            const payloadKey = isLegacy ? 'txHash' : 'woHash';
                            
                            // 1. Marcar tarea como consolidada
                            await store.dispatch({
                                type: 'CONSOLIDATE_WORK_ORDER',
                                payload: { projectId: this.project.id, [payloadKey]: taskId, auditNotes: 'Aprobado por Arquitecto' }
                            });
                            
                            // 2. Aquí iría el T-008: Inyección en el Ledger Slicing Pie (Próximo Sprint)
                            alert("✅ Work Order consolidada con éxito.");
                            this.renderBoard();
                        } catch (err) {
                            alert("Error al auditar: " + err.message);
                        }
                    }
                }
            });
        });
    }
}
