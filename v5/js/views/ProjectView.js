// v5/js/views/ProjectView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; // INYECCIÓN V8.0

export default class ProjectView {
    constructor() {
        document.title = "Tracción (Kanban) | TeamTowers";
        this.activeProjectId = null;
        this.currentFilter = 'all'; // all, mine, tangible, intangible
    }

    async getHtml() {
        // Preparar opciones de proyectos para el dropdown móvil
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 2rem 3rem; overflow-x: auto; display: flex; flex-direction: column; position: relative;}
                
                /* =========================================================
                   MOBILE TOP BAR (Solo visible en pantallas pequeñas)
                   ========================================================= */
                .mobile-top-bar {
                    display: none;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    background: rgba(10, 10, 14, 0.95);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    margin: -2rem -3rem 1rem -3rem; /* Compensa el padding del workspace */
                }
                
                .mob-brand { display: flex; align-items: center; gap: 10px; color: white; text-decoration: none; font-weight: bold; font-size: 1.2rem;}
                
                .mob-project-select {
                    background: rgba(0,0,0,0.5);
                    border: 1px solid var(--glass-border);
                    color: var(--accent-blue);
                    padding: 5px 10px;
                    border-radius: 6px;
                    font-family: var(--font-mono);
                    font-size: 0.8rem;
                    outline: none;
                    max-width: 150px;
                }

                .mob-user {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 35px;
                    height: 35px;
                    background: var(--accent-purple);
                    color: white;
                    border-radius: 50%;
                    font-weight: bold;
                    text-decoration: none;
                    font-size: 0.9rem;
                }

                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

                /* FILTROS */
                .kanban-filters { display: flex; gap: 10px; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; overflow-x: auto; white-space: nowrap;}
                .kanban-filters::-webkit-scrollbar { display: none; } /* Hide scrollbar for clean mobile UI */
                
                .filter-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--text-muted); padding: 6px 15px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;}
                .filter-btn.active { background: rgba(0, 176, 255, 0.15); color: var(--accent-blue); border-color: var(--accent-blue); font-weight: bold;}

                /* KANBAN LAYOUT */
                .kanban-container { display: grid; grid-template-columns: repeat(3, minmax(300px, 1fr)); gap: 2rem; flex: 1; min-height: 0; align-items: start;}
                .kanban-col { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); display: flex; flex-direction: column; max-height: calc(100vh - 200px); overflow: hidden;}
                .col-title { padding: 1.2rem; font-weight: bold; font-size: 1.1rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3);}
                .col-body { padding: 1rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1rem; }
                
                /* TASK CARDS */
                .task-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-sm); padding: 1.2rem; transition: transform 0.2s, border-color 0.2s; position: relative;}
                .task-card:hover { transform: translateY(-3px); border-color: #555; }
                .task-title { color: white; font-size: 1.05rem; margin: 10px 0; line-height: 1.4;}
                .task-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: #888; margin-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 10px;}
                
                .btn-pull { background: transparent; border: 1px solid var(--text-muted); color: var(--text-muted); transition: all 0.2s; width: 100%; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold;}
                .btn-pull:hover { background: white; color: black; border-color: white;}
                
                .btn-push { background: transparent; border: 1px dashed var(--accent-purple); color: var(--accent-purple); transition: all 0.2s; width: 100%; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 5px;}
                .btn-push:hover { background: rgba(224, 64, 251, 0.1); }

                .btn-focus { background: rgba(0, 176, 255, 0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); display: block; text-align: center; text-decoration: none; padding: 8px; border-radius: 6px; font-weight: bold; transition: all 0.2s;}
                .btn-focus:hover { background: var(--accent-blue); color: black;}
                
                .btn-approve { background: var(--accent-green); color: black; border: none; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: transform 0.2s; width: 100%;}
                .btn-approve:hover { transform: scale(1.02); }

                .status-requested { background: rgba(255, 82, 82, 0.1) !important; border-color: var(--accent-red) !important; }

                /* =========================================================
                   RESPONSIVE FIELD APP (MOBILE)
                   ========================================================= */
                @media (max-width: 1024px) {
                    .kanban-container { display: flex; flex-direction: column; gap: 2rem; overflow-y: auto; }
                    .kanban-col { max-height: none; }
                }
                
                @media (max-width: 768px) {
                    .workspace { padding: 1.5rem 1rem; padding-bottom: 90px;} /* Espacio para BottomNav */
                    
                    .mobile-top-bar { display: flex; margin: -1.5rem -1rem 1rem -1rem; }
                    
                    /* En móvil, simplificamos el View Header porque la barra superior ya da el contexto */
                    .view-header { flex-direction: column; align-items: flex-start; }
                    .view-header h1 { font-size: 1.8rem; }
                    
                    .kanban-col { border: none; background: transparent; }
                    .col-title { border-radius: 8px; border: 1px solid var(--glass-border); margin-bottom: 10px;}
                    .col-body { padding: 0; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/project')}

                <main class="workspace">
                    <header class="mobile-top-bar">
                        <a href="/v5/" data-link class="mob-brand">🗼</a>
                        
                        <select class="mob-project-select" id="mobProjectSelect">
                            ${userProjects.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                        </select>

                        <a href="/v5/profile" data-link class="mob-user" title="Mi Perfil">
                            ${state.globalUsers.find(u => u.id === activeUserId)?.name.charAt(0).toUpperCase() || '?'}
                        </a>
                    </header>

                    <div class="view-header">
                        <div>
                            <h1>Tracción de Red</h1>
                            <p>Convierte los entregables teóricos en Slices de Equity reales.</p>
                        </div>
                        <a href="/v5/map" class="btn btn-outline" data-link>⚙️ Ajustar VNA</a>
                    </div>

                    <div class="kanban-filters" id="kanbanFilters">
                        <button class="filter-btn active" data-filter="all">Todos los Flujos</button>
                        <button class="filter-btn" data-filter="mine">Mis Tareas</button>
                        <button class="filter-btn" data-filter="tangible">Solo Tangibles 🟢</button>
                        <button class="filter-btn" data-filter="intangible">Solo Intangibles 🟣</button>
                    </div>

                    <div class="kanban-container">
                        <div class="kanban-col">
                            <div class="col-title" style="color: white;">📥 Mercado Teórico <span class="badge" id="count-theo">0</span></div>
                            <div class="col-body" id="theo-list"></div>
                        </div>

                        <div class="kanban-col" style="border-color: rgba(0, 176, 255, 0.3);">
                            <div class="col-title" style="color: var(--accent-blue);">🔥 Deep Work & Tracción <span class="badge" id="count-work">0</span></div>
                            <div class="col-body" id="work-list"></div>
                        </div>

                        <div class="kanban-col" style="border-color: rgba(0, 230, 118, 0.3);">
                            <div class="col-title" style="color: var(--accent-green);">⛓️ Ledger Consolidado <span class="badge" id="count-done">0</span></div>
                            <div class="col-body" id="done-list"></div>
                        </div>
                    </div>
                </main>
                
                ${BottomNav.getHtml('/project')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

        const state = store.getState();
        
        // --- GESTIÓN DE PROYECTO ACTIVO (DRY con Sidebar) ---
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        
        // Fallback: Si no hay activo o no se encuentra, coger el último del usuario
        if (!project) {
            const userProjects = state.projects.filter(p => 
                state.session.role === 'ecosystem-owner' || 
                p.ownerId === state.session.activeUserId || 
                (p.usuarios && p.usuarios.find(u => u.id === state.session.activeUserId))
            );
            project = userProjects.length > 0 ? userProjects[userProjects.length - 1] : null;
            if(project) localStorage.setItem('tt_active_project', project.id);
        }

        if (!project) return;
        this.activeProjectId = project.id;
        
        // --- MOBILE TOP BAR LOGIC ---
        const mobSelect = document.getElementById('mobProjectSelect');
        if (mobSelect) {
            mobSelect.value = this.activeProjectId;
            mobSelect.addEventListener('change', (e) => {
                localStorage.setItem('tt_active_project', e.target.value);
                window.location.reload(); // Recargamos para aplicar el contexto a todas las vistas
            });
        }

        const isPO = project.ownerId === state.session.activeUserId || state.session.role === 'ecosystem-owner';
        if (!isPO && this.currentFilter === 'all') {
            this.currentFilter = 'mine'; 
            setTimeout(() => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                const mineBtn = document.querySelector('[data-filter="mine"]');
                if(mineBtn) mineBtn.classList.add('active');
            }, 10);
        }

        // Setup Filtros 
        const filtersContainer = document.getElementById('kanbanFilters');
        if (filtersContainer) {
            filtersContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.currentFilter = e.target.dataset.filter;
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                }
            });
        }

        const workspace = document.querySelector('.kanban-container');
        workspace.addEventListener('click', async (e) => {
            const target = e.target;
            const currentState = store.getState();
            const currProject = currentState.projects.find(p => p.id === this.activeProjectId);
            if (!currProject) return;

            // 1. APROBAR Y CONSOLIDAR
            if (target.classList.contains('btn-approve')) {
                const action = target.dataset.action;
                const txHash = target.dataset.hash;

                if (action === 'approve-pull') {
                    const targetUserId = target.dataset.userid;
                    await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: currProject.id, txHash, userId: targetUserId } });
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                } 
                else if (action === 'consolidate') {
                    if (confirm('¿Aprobar Proof of Work? Esto generará Slices inmutables en el Ledger.')) {
                        await store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: currProject.id, txHash } });
                        this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                    }
                }
                return;
            }

            // 2. HACER PULL
            if (target.classList.contains('btn-pull')) {
                const txHash = target.dataset.hash;
                const action = target.dataset.action;
                
                if (action === 'request') {
                    await store.dispatch({ type: 'REQUEST_TRANSACTION', payload: { projectId: currProject.id, txHash, userId: currentState.session.activeUserId } });
                } else {
                    await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: currProject.id, txHash, userId: currentState.session.activeUserId } });
                }
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                return;
            }

            // 3. HACER PUSH
            if (target.classList.contains('btn-push')) {
                const txHash = target.dataset.hash;
                const usersInProject = currProject.usuarios || [];
                
                if (usersInProject.length === 0) return alert("No hay miembros en la Colla para delegar.");
                
                let userListStr = "IDs disponibles:\n";
                usersInProject.forEach(u => {
                    const globalData = currentState.globalUsers.find(gu => gu.id === u.id);
                    userListStr += `- ${u.id} (${globalData ? globalData.name : 'Unknown'})\n`;
                });

                const targetUserId = prompt(`Introduce el ID del usuario al que quieres asignar esta tarea:\n\n${userListStr}`);
                
                if (targetUserId) {
                    const exists = usersInProject.find(u => u.id === targetUserId);
                    if (!exists && targetUserId !== currProject.ownerId) {
                        return alert("Ese usuario no es miembro del proyecto. Invítalo primero.");
                    }
                    await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: currProject.id, txHash, userId: targetUserId } });
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                }
                return;
            }
        });

        this.renderTasks(project);
    }

    renderTasks(project) {
        const lists = { theo: document.getElementById('theo-list'), work: document.getElementById('work-list'), done: document.getElementById('done-list') };
        Object.values(lists).forEach(l => l.innerHTML = '');

        const txs = project.transactions || [];
        const state = store.getState();
        const activeUser = state.session.activeUserId;
        const isPO = project.ownerId === activeUser || state.session.role === 'ecosystem-owner';
        
        let counts = { theo: 0, work: 0, done: 0 };

        txs.forEach(tx => {
            // Aplicar Filtros
            if (this.currentFilter === 'tangible' && tx.tipo !== 'tangible') return;
            if (this.currentFilter === 'intangible' && tx.tipo !== 'intangible') return;
            
            if (this.currentFilter === 'mine') {
                if (tx.status !== 'theoretical' && tx.status !== 'requested' && tx.assigneeId !== activeUser) return;
            }

            if (!isPO && this.currentFilter === 'all') {
                if ((tx.status === 'consolidated' || tx.status === 'reported') && tx.assigneeId !== activeUser) return;
            }

            const card = this.createTaskCard(tx, project, state.session, isPO);
            
            // Inyectar en columnas
            if (tx.status === 'theoretical' || tx.status === 'requested') { 
                lists.theo.appendChild(card); counts.theo++; 
            } else if (tx.status === 'pinged' || tx.status === 'reported') { 
                lists.work.appendChild(card); counts.work++; 
            } else if (tx.status === 'consolidated' || tx.status === 'approved') { 
                lists.done.appendChild(card); counts.done++; 
            }
        });

        document.getElementById('count-theo').innerText = counts.theo;
        document.getElementById('count-work').innerText = counts.work;
        document.getElementById('count-done').innerText = counts.done;
    }

    createTaskCard(tx, project, session, isPO) {
        const role = project.roles.find(r => r.id === tx.from) || { name: 'Nodo Borrado', levelId: '@baixos' };
        const receiverRole = project.roles.find(r => r.id === tx.to) || { name: 'Destino', levelId: '?' };
        
        const card = document.createElement('div');
        card.className = `task-card ${tx.status === 'requested' ? 'status-requested' : ''}`;
        const color = this.getColorForLevel(role.levelId);
        const tipoColor = tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';

        let actionHtml = '';

        if (tx.status === 'theoretical') {
            if (isPO) {
                actionHtml = `
                    <div style="display:flex; flex-direction:column; gap:5px;">
                        <button class="btn-pull" data-hash="${tx.hash}" title="Adjudicarme la tarea">📥 Hacer PULL (Asumírmela)</button>
                        <button class="btn-push" data-hash="${tx.hash}" title="Asignar a un miembro de la Colla">👤 Delegar (PUSH)</button>
                    </div>
                `;
            } else {
                actionHtml = `<button class="btn-pull" data-action="request" data-hash="${tx.hash}">✋ Solicitar Tarea (Request Pull)</button>`;
            }
        } 
        else if (tx.status === 'requested') {
            const requester = store.getState().globalUsers.find(u => u.id === tx.assigneeId);
            const reqName = requester ? requester.name : tx.assigneeId;
            
            if (isPO) {
                actionHtml = `
                    <div style="color: var(--accent-red); font-size: 0.75rem; font-weight: bold; margin-bottom: 10px;">⚠️ SOLICITUD DE PULL PENDIENTE</div>
                    <div style="font-size: 0.8rem; color: #ccc; margin-bottom: 10px;">El nodo <b>${reqName}</b> solicita realizar este entregable.</div>
                    <button class="btn-approve" data-action="approve-pull" data-hash="${tx.hash}" data-userid="${tx.assigneeId}">✅ Aprobar Solicitud</button>
                `;
            } else {
                actionHtml = `<div style="color: var(--accent-orange); font-size: 0.8rem; text-align: center; padding: 10px; border: 1px dashed var(--accent-orange); border-radius: 6px;">✋ Solicitud enviada al Owner. Esperando aprobación...</div>`;
            }
        }
        else if (tx.status === 'pinged') {
            const isMine = tx.assigneeId === session.activeUserId;
            if (isMine) {
                actionHtml = `
                    <div style="color: var(--accent-orange); font-size: 0.75rem; font-weight: bold; margin-bottom: 10px;">⏳ EN TU ESCRITORIO</div>
                    <a href="/v5/focus" class="btn btn-focus" data-link>▶ Iniciar Focus / Reportar</a>
                `;
            } else {
                const worker = store.getState().globalUsers.find(u => u.id === tx.assigneeId);
                actionHtml = `<div style="color: #666; font-size: 0.8rem; text-align: center; padding: 10px; border: 1px dashed #333; border-radius: 6px;">Asignada a: <span style="color:white;">${worker ? worker.name : tx.assigneeId}</span></div>`;
            }
        } 
        else if (tx.status === 'reported') {
            actionHtml = `
                <div style="color: var(--accent-blue); font-size: 0.75rem; font-weight: bold; margin-bottom: 10px;">🛡️ ESPERANDO AUDITORÍA</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); background: rgba(0,0,0,0.5); padding: 8px; border-radius: 4px; margin-bottom: 10px;">
                    Horas Reales: <strong style="color: white;">${tx.realHours}h</strong><br>
                    Evidencia: <a href="${tx.proofLink}" target="_blank" style="color: var(--accent-blue);">${tx.proofLink ? 'Ver Trabajo' : 'Sin link'}</a>
                </div>
                ${isPO ? `<button class="btn-approve" data-action="consolidate" data-hash="${tx.hash}">✅ Aprobar y Consolidar (Ledger)</button>` : `<div style="font-size:0.75rem; color:#888;">Pendiente de firma del PO.</div>`}
            `;
        }
        else if (tx.status === 'consolidated') {
            actionHtml = `
                <div style="color: var(--accent-green); font-size: 1rem; font-weight: bold; font-family: var(--font-mono); text-align: center; padding: 10px; background: rgba(0, 230, 118, 0.05); border-radius: 8px;">
                    +${Math.round(tx.valorCongelado || 0).toLocaleString()} Slices Acuñados
                </div>
            `;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 5px; align-items: center;">
                    <span class="badge" style="color: ${color}; border-color: ${color}; font-size: 0.65rem;" title="De: ${role.name}">${role.levelId}</span>
                    <span style="color: #666;">&rarr;</span>
                    <span class="badge" style="color: #888; border-color: #444; font-size: 0.65rem;" title="Hacia: ${receiverRole.name}">${receiverRole.levelId}</span>
                </div>
                <span style="font-size: 0.6rem; color: var(--text-muted); font-family: var(--font-mono);">#${tx.hash.substring(0,6)}</span>
            </div>
            <h3 class="task-title">${tx.entregable}</h3>
            <div style="margin-bottom: 1rem;">${actionHtml}</div>
            <div class="task-meta">
                <span>⏱ ${tx.horas}h Est.</span>
                <span style="color: ${tipoColor}; font-weight: bold; text-transform: uppercase;">${tx.tipo}</span>
            </div>
        `;

        return card;
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
        return colors[levelId] || 'var(--text-main)';
    }
}// v5/js/views/ProjectView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ProjectView {
    constructor() {
        document.title = "Tracción (Kanban) | TeamTowers";
        this.activeProjectId = null;
        this.currentFilter = 'all'; // all, mine, tangible, intangible
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 2rem 3rem; overflow-x: auto; display: flex; flex-direction: column; }
                
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

                /* FILTROS */
                .kanban-filters { display: flex; gap: 10px; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;}
                .filter-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--text-muted); padding: 6px 15px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;}
                .filter-btn.active { background: rgba(0, 176, 255, 0.15); color: var(--accent-blue); border-color: var(--accent-blue); font-weight: bold;}

                /* KANBAN LAYOUT */
                .kanban-container { display: grid; grid-template-columns: repeat(3, minmax(300px, 1fr)); gap: 2rem; flex: 1; min-height: 0; align-items: start;}
                .kanban-col { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); display: flex; flex-direction: column; max-height: calc(100vh - 200px); overflow: hidden;}
                .col-title { padding: 1.2rem; font-weight: bold; font-size: 1.1rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3);}
                .col-body { padding: 1rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1rem; }
                
                /* TASK CARDS */
                .task-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-sm); padding: 1.2rem; transition: transform 0.2s, border-color 0.2s; position: relative;}
                .task-card:hover { transform: translateY(-3px); border-color: #555; }
                .task-title { color: white; font-size: 1.05rem; margin: 10px 0; line-height: 1.4;}
                .task-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: #888; margin-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 10px;}
                
                .btn-pull { background: transparent; border: 1px solid var(--text-muted); color: var(--text-muted); transition: all 0.2s; width: 100%; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold;}
                .btn-pull:hover { background: white; color: black; border-color: white;}
                
                .btn-push { background: transparent; border: 1px dashed var(--accent-purple); color: var(--accent-purple); transition: all 0.2s; width: 100%; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 5px;}
                .btn-push:hover { background: rgba(224, 64, 251, 0.1); }

                .btn-focus { background: rgba(0, 176, 255, 0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); display: block; text-align: center; text-decoration: none; padding: 8px; border-radius: 6px; font-weight: bold; transition: all 0.2s;}
                .btn-focus:hover { background: var(--accent-blue); color: black;}
                
                .btn-approve { background: var(--accent-green); color: black; border: none; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: transform 0.2s; width: 100%;}
                .btn-approve:hover { transform: scale(1.02); }

                .status-requested { background: rgba(255, 82, 82, 0.1) !important; border-color: var(--accent-red) !important; }

                @media (max-width: 1024px) {
                    .kanban-container { display: flex; flex-direction: column; gap: 2rem; overflow-y: auto; }
                    .kanban-col { max-height: none; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/project')}

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1>Tracción de Red</h1>
                            <p>Convierte los entregables teóricos en Slices de Equity reales.</p>
                        </div>
                        <a href="/v5/map" class="btn btn-outline" data-link>⚙️ Ajustar VNA</a>
                    </div>

                    <div class="kanban-filters" id="kanbanFilters">
                        <button class="filter-btn active" data-filter="all">Todos los Flujos</button>
                        <button class="filter-btn" data-filter="mine">Mis Tareas</button>
                        <button class="filter-btn" data-filter="tangible">Solo Tangibles 🟢</button>
                        <button class="filter-btn" data-filter="intangible">Solo Intangibles 🟣</button>
                    </div>

                    <div class="kanban-container">
                        <div class="kanban-col">
                            <div class="col-title" style="color: white;">📥 Mercado Teórico <span class="badge" id="count-theo">0</span></div>
                            <div class="col-body" id="theo-list"></div>
                        </div>

                        <div class="kanban-col" style="border-color: rgba(0, 176, 255, 0.3);">
                            <div class="col-title" style="color: var(--accent-blue);">🔥 Deep Work & Tracción <span class="badge" id="count-work">0</span></div>
                            <div class="col-body" id="work-list"></div>
                        </div>

                        <div class="kanban-col" style="border-color: rgba(0, 230, 118, 0.3);">
                            <div class="col-title" style="color: var(--accent-green);">⛓️ Ledger Consolidado <span class="badge" id="count-done">0</span></div>
                            <div class="col-body" id="done-list"></div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

        const state = store.getState();
        let project = state.projects[state.projects.length - 1];

        if (!project) return;
        this.activeProjectId = project.id;
        
        const isPO = project.ownerId === state.session.activeUserId || state.session.role === 'ecosystem-owner';
        if (!isPO && this.currentFilter === 'all') {
            this.currentFilter = 'mine'; 
            setTimeout(() => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('[data-filter="mine"]').classList.add('active');
            }, 10);
        }

        // Setup Filtros (Delegación de Eventos)
        const filtersContainer = document.getElementById('kanbanFilters');
        if (filtersContainer) {
            filtersContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.currentFilter = e.target.dataset.filter;
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                }
            });
        }

        // Usamos delegación de eventos a nivel global para los botones de las tarjetas
        // Esto evita el problema de las condiciones de carrera (doble clic)
        const workspace = document.querySelector('.kanban-container');
        workspace.addEventListener('click', async (e) => {
            const target = e.target;
            const state = store.getState();
            const project = state.projects.find(p => p.id === this.activeProjectId);
            
            if (!project) return;

            // 1. APROBAR Y CONSOLIDAR (Aquí estaba el bug del doble clic)
            if (target.classList.contains('btn-approve')) {
                const action = target.dataset.action;
                const txHash = target.dataset.hash;

                if (action === 'approve-pull') {
                    const targetUserId = target.dataset.userid;
                    await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: project.id, txHash, userId: targetUserId } });
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                } 
                else if (action === 'consolidate') {
                    if (confirm('¿Aprobar Proof of Work? Esto generará Slices inmutables en el Ledger.')) {
                        await store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: project.id, txHash } });
                        this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                    }
                }
                return;
            }

            // 2. HACER PULL
            if (target.classList.contains('btn-pull')) {
                const txHash = target.dataset.hash;
                const action = target.dataset.action;
                
                if (action === 'request') {
                    await store.dispatch({ type: 'REQUEST_TRANSACTION', payload: { projectId: project.id, txHash, userId: state.session.activeUserId } });
                } else {
                    await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: project.id, txHash, userId: state.session.activeUserId } });
                }
                this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                return;
            }

            // 3. HACER PUSH
            if (target.classList.contains('btn-push')) {
                const txHash = target.dataset.hash;
                const usersInProject = project.usuarios || [];
                
                if (usersInProject.length === 0) return alert("No hay miembros en la Colla para delegar.");
                
                let userListStr = "IDs disponibles:\n";
                usersInProject.forEach(u => {
                    const globalData = state.globalUsers.find(gu => gu.id === u.id);
                    userListStr += `- ${u.id} (${globalData ? globalData.name : 'Unknown'})\n`;
                });

                const targetUserId = prompt(`Introduce el ID del usuario al que quieres asignar esta tarea:\n\n${userListStr}`);
                
                if (targetUserId) {
                    const exists = usersInProject.find(u => u.id === targetUserId);
                    if (!exists && targetUserId !== project.ownerId) {
                        return alert("Ese usuario no es miembro del proyecto. Invítalo primero.");
                    }
                    await store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId: project.id, txHash, userId: targetUserId } });
                    this.renderTasks(store.getState().projects.find(p => p.id === this.activeProjectId));
                }
                return;
            }
        });

        this.renderTasks(project);
    }

    renderTasks(project) {
        const lists = { theo: document.getElementById('theo-list'), work: document.getElementById('work-list'), done: document.getElementById('done-list') };
        Object.values(lists).forEach(l => l.innerHTML = '');

        const txs = project.transactions || [];
        const state = store.getState();
        const activeUser = state.session.activeUserId;
        const isPO = project.ownerId === activeUser || state.session.role === 'ecosystem-owner';
        
        let counts = { theo: 0, work: 0, done: 0 };

        txs.forEach(tx => {
            // Aplicar Filtros
            if (this.currentFilter === 'tangible' && tx.tipo !== 'tangible') return;
            if (this.currentFilter === 'intangible' && tx.tipo !== 'intangible') return;
            
            if (this.currentFilter === 'mine') {
                if (tx.status !== 'theoretical' && tx.status !== 'requested' && tx.assigneeId !== activeUser) return;
            }

            if (!isPO && this.currentFilter === 'all') {
                if ((tx.status === 'consolidated' || tx.status === 'reported') && tx.assigneeId !== activeUser) return;
            }

            const card = this.createTaskCard(tx, project, state.session, isPO);
            
            // Inyectar en columnas
            if (tx.status === 'theoretical' || tx.status === 'requested') { 
                lists.theo.appendChild(card); counts.theo++; 
            } else if (tx.status === 'pinged' || tx.status === 'reported') { 
                lists.work.appendChild(card); counts.work++; 
            } else if (tx.status === 'consolidated' || tx.status === 'approved') { 
                lists.done.appendChild(card); counts.done++; 
            }
        });

        document.getElementById('count-theo').innerText = counts.theo;
        document.getElementById('count-work').innerText = counts.work;
        document.getElementById('count-done').innerText = counts.done;
    }

    createTaskCard(tx, project, session, isPO) {
        const role = project.roles.find(r => r.id === tx.from) || { name: 'Nodo Borrado', levelId: '@baixos' };
        const receiverRole = project.roles.find(r => r.id === tx.to) || { name: 'Destino', levelId: '?' };
        
        const card = document.createElement('div');
        card.className = `task-card ${tx.status === 'requested' ? 'status-requested' : ''}`;
        const color = this.getColorForLevel(role.levelId);
        const tipoColor = tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';

        let actionHtml = '';

        if (tx.status === 'theoretical') {
            if (isPO) {
                actionHtml = `
                    <div style="display:flex; flex-direction:column; gap:5px;">
                        <button class="btn-pull" data-hash="${tx.hash}" title="Adjudicarme la tarea">📥 Hacer PULL (Asumírmela)</button>
                        <button class="btn-push" data-hash="${tx.hash}" title="Asignar a un miembro de la Colla">👤 Delegar (PUSH)</button>
                    </div>
                `;
            } else {
                actionHtml = `<button class="btn-pull" data-action="request" data-hash="${tx.hash}">✋ Solicitar Tarea (Request Pull)</button>`;
            }
        } 
        else if (tx.status === 'requested') {
            const requester = store.getState().globalUsers.find(u => u.id === tx.assigneeId);
            const reqName = requester ? requester.name : tx.assigneeId;
            
            if (isPO) {
                actionHtml = `
                    <div style="color: var(--accent-red); font-size: 0.75rem; font-weight: bold; margin-bottom: 10px;">⚠️ SOLICITUD DE PULL PENDIENTE</div>
                    <div style="font-size: 0.8rem; color: #ccc; margin-bottom: 10px;">El nodo <b>${reqName}</b> solicita realizar este entregable.</div>
                    <button class="btn-approve" data-action="approve-pull" data-hash="${tx.hash}" data-userid="${tx.assigneeId}">✅ Aprobar Solicitud</button>
                `;
            } else {
                actionHtml = `<div style="color: var(--accent-orange); font-size: 0.8rem; text-align: center; padding: 10px; border: 1px dashed var(--accent-orange); border-radius: 6px;">✋ Solicitud enviada al Owner. Esperando aprobación...</div>`;
            }
        }
        else if (tx.status === 'pinged') {
            const isMine = tx.assigneeId === session.activeUserId;
            if (isMine) {
                actionHtml = `
                    <div style="color: var(--accent-orange); font-size: 0.75rem; font-weight: bold; margin-bottom: 10px;">⏳ EN TU ESCRITORIO</div>
                    <a href="/v5/focus" class="btn btn-focus" data-link>▶ Iniciar Focus / Reportar</a>
                `;
            } else {
                const worker = store.getState().globalUsers.find(u => u.id === tx.assigneeId);
                actionHtml = `<div style="color: #666; font-size: 0.8rem; text-align: center; padding: 10px; border: 1px dashed #333; border-radius: 6px;">Asignada a: <span style="color:white;">${worker ? worker.name : tx.assigneeId}</span></div>`;
            }
        } 
        else if (tx.status === 'reported') {
            actionHtml = `
                <div style="color: var(--accent-blue); font-size: 0.75rem; font-weight: bold; margin-bottom: 10px;">🛡️ ESPERANDO AUDITORÍA</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); background: rgba(0,0,0,0.5); padding: 8px; border-radius: 4px; margin-bottom: 10px;">
                    Horas Reales: <strong style="color: white;">${tx.realHours}h</strong><br>
                    Evidencia: <a href="${tx.proofLink}" target="_blank" style="color: var(--accent-blue);">${tx.proofLink ? 'Ver Trabajo' : 'Sin link'}</a>
                </div>
                ${isPO ? `<button class="btn-approve" data-action="consolidate" data-hash="${tx.hash}">✅ Aprobar y Consolidar (Ledger)</button>` : `<div style="font-size:0.75rem; color:#888;">Pendiente de firma del PO.</div>`}
            `;
        }
        else if (tx.status === 'consolidated') {
            actionHtml = `
                <div style="color: var(--accent-green); font-size: 1rem; font-weight: bold; font-family: var(--font-mono); text-align: center; padding: 10px; background: rgba(0, 230, 118, 0.05); border-radius: 8px;">
                    +${Math.round(tx.valorCongelado || 0).toLocaleString()} Slices Acuñados
                </div>
            `;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 5px; align-items: center;">
                    <span class="badge" style="color: ${color}; border-color: ${color}; font-size: 0.65rem;" title="De: ${role.name}">${role.levelId}</span>
                    <span style="color: #666;">&rarr;</span>
                    <span class="badge" style="color: #888; border-color: #444; font-size: 0.65rem;" title="Hacia: ${receiverRole.name}">${receiverRole.levelId}</span>
                </div>
                <span style="font-size: 0.6rem; color: var(--text-muted); font-family: var(--font-mono);">#${tx.hash.substring(0,6)}</span>
            </div>
            <h3 class="task-title">${tx.entregable}</h3>
            <div style="margin-bottom: 1rem;">${actionHtml}</div>
            <div class="task-meta">
                <span>⏱ ${tx.horas}h Est.</span>
                <span style="color: ${tipoColor}; font-weight: bold; text-transform: uppercase;">${tx.tipo}</span>
            </div>
        `;

        return card;
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
        return colors[levelId] || 'var(--text-main)';
    }
}
