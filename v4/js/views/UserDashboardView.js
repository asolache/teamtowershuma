import { store } from '../core/store.js';

let activePingHash = null;
let activePingProjectId = null;

document.addEventListener('click', (e) => {
    // 1. MODALES DE RESPUESTA
    if (e.target.classList.contains('btn-respond-ping')) {
        activePingHash = e.target.getAttribute('data-hash'); activePingProjectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }
    if (e.target.id === 'btn-cancel-pow') {
        activePingHash = null; activePingProjectId = null;
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }
    if (e.target.id === 'btn-submit-pow') {
        const realHours = document.getElementById('pow-horas').value;
        const proofLink = document.getElementById('pow-link').value.trim();
        const comentario = document.getElementById('pow-comentario').value.trim();
        if (!realHours || !proofLink) return alert("⚠️ Introduce horas reales y link al PoW.");

        store.dispatch({ type: 'REPORT_TRANSACTION', payload: { projectId: activePingProjectId, txHash: activePingHash, realHours: parseFloat(realHours), proofLink, comentario } });
        activePingHash = null; activePingProjectId = null;
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }

    // 2. SISTEMA PULL (El usuario se auto-asigna un entregable teórico)
    if (e.target.classList.contains('btn-pull-ping')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const state = store.getState();
        
        // Auto-Ping (Hacemos ping a nosotros mismos)
        store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId, txHash, userId: state.session.activeUserId } });
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }
});

export const UserDashboardView = {
    render: () => {
        const state = store.getState();
        const session = state.session || { activeUserId: 'ecosystem-admin', role: 'admin' };
        
        if (session.role === 'admin' && session.activeUserId === 'ecosystem-admin') {
            return `<div class="container text-center" style="padding-top:10vh;">
                        <h2>👑 Modo Ecosystem Owner</h2><p class="text-muted">Simula un usuario desde la barra superior para ver esta bandeja.</p>
                        <button class="btn btn-primary" onclick="location.hash='#/'">Ir al Hub</button>
                    </div>`;
        }

        const activeUser = state.globalUsers.find(u => u.id === session.activeUserId);
        const userName = activeUser ? activeUser.name : session.activeUserId;

        let totalSlices = 0;
        let pendingPings = [];
        let historyPoW = [];
        let availablePulls = []; // NUEVO: Entregables teóricos disponibles para su rol

        state.projects.forEach(project => {
            // Slices Globales
            const userLedgers = (project.ledger || []).filter(l => l.userId === session.activeUserId);
            userLedgers.forEach(l => totalSlices += l.valorCongelado);

            // Saber qué roles tiene asignados este usuario en este proyecto
            const userRolesIds = (project.asignaciones || []).filter(a => a.userId === session.activeUserId).map(a => a.roleId);

            (project.transactions || []).forEach(tx => {
                const rxInfo = { ...tx, projectName: project.nombre, projectId: project.id, projectRoles: project.roles };
                
                // 1. Pings pendientes (Push del PO o auto-asignados)
                if (tx.status === 'pinged' && tx.assigneeId === session.activeUserId) {
                    pendingPings.push(rxInfo);
                }
                // 2. Historial
                else if ((tx.status === 'reported' || tx.status === 'consolidated') && tx.assigneeId === session.activeUserId) {
                    historyPoW.push(rxInfo);
                }
                // 3. 🚀 PULL SYSTEM: Entregables Teóricos que apuntan a MI ROL
                else if (tx.status === 'theoretical' && userRolesIds.includes(tx.to)) {
                    availablePulls.push(rxInfo);
                }
            });
        });

        historyPoW.sort((a, b) => b.timestamp - a.timestamp);

        // MODAL PoW
        let modalHTML = '';
        if (activePingHash) {
            const project = state.projects.find(p => p.id === activePingProjectId);
            const tx = project.transactions.find(t => t.hash === activePingHash);
            const rTo = project.roles.find(r => r.id === tx.to);

            modalHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                    <div class="panel" style="width: 450px; border-color: var(--accent-purple); box-shadow: 0 10px 40px rgba(163,113,247,0.2);">
                        <h3 style="margin-top: 0; color: var(--accent-purple);">🚀 Entregar Proof of Work</h3>
                        <p style="margin-bottom: 20px; color: var(--text-muted); font-size:0.85rem;">Estás sellando <b style="color:var(--text-heading);">${tx.entregable}</b> para el rol ${rTo?.name}.</p>
                        
                        <label class="form-label">Horas Reales Invertidas (Slicing):</label>
                        <input type="number" step="0.5" id="pow-horas" class="form-control" placeholder="Ej: ${tx.estimatedHours}" value="${tx.estimatedHours}">
                        <label class="form-label">Enlace al Entregable (Github, Drive...):</label>
                        <input type="url" id="pow-link" class="form-control" placeholder="https://...">
                        <label class="form-label">Comentarios (Opcional):</label>
                        <textarea id="pow-comentario" class="form-control" rows="3" placeholder="Notas para el auditor..."></textarea>
                        
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button id="btn-cancel-pow" class="btn btn-secondary" style="flex: 1;">Cancelar</button>
                            <button id="btn-submit-pow" class="btn btn-primary" style="flex: 2; background: var(--accent-purple);">Sellar Entregable 💾</button>
                        </div>
                    </div>
                </div>`;
        }

        // 🚀 BREADCRUMBS GLOBALES
        setTimeout(() => window.setNavbar(
            [{ label: '👤 Perfil', hash: '#/user-dashboard' }, { label: 'Bandeja de Contribución' }], 
            ``, ``
        ), 0);

        return `
            ${modalHTML}
            <div class="container fade-in">
                <div class="panel-surface" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-left: 4px solid var(--accent-green);">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="width: 50px; height: 50px; background: var(--bg-panel); border: 2px solid var(--border-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">👤</div>
                        <div>
                            <h2 style="margin: 0; font-size: 1.2rem;">${userName}</h2>
                            <div style="font-family: monospace; color: var(--text-muted); font-size: 0.8rem;">${session.activeUserId}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: bold;">Total Equity (Slices)</div>
                        <div style="font-size: 2rem; font-weight: bold; color: var(--accent-green); line-height: 1;">${totalSlices.toLocaleString()}</div>
                    </div>
                </div>

                <div class="grid-layout">
                    <main>
                        <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">📬 Tareas en Curso ${pendingPings.length > 0 ? `<span class="badge" style="background: var(--accent-purple); color: white;">${pendingPings.length}</span>` : ''}</h3>
                        ${pendingPings.length === 0 ? `<p class="text-muted">No tienes entregables en curso.</p>` : `
                            <div class="list-group" style="margin-bottom: 30px;">
                                ${pendingPings.map(ping => {
                                    const rFrom = ping.projectRoles.find(r => r.id === ping.from);
                                    return `
                                    <div class="panel-surface" style="margin-bottom: 15px; border-left: 4px solid var(--accent-purple);">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                            <div>
                                                <div style="font-size: 0.7rem; color: var(--accent-purple); text-transform: uppercase;">Pedido por: ${rFrom?.name || 'Sistema'}</div>
                                                <h4 style="margin: 0; font-size: 1.1rem;">${ping.entregable}</h4>
                                                <div style="font-size: 0.75rem; color: var(--text-muted);">${ping.projectName}</div>
                                            </div>
                                            <button class="btn btn-primary btn-respond-ping" style="background: var(--accent-purple); height: fit-content;" data-hash="${ping.hash}" data-pid="${ping.projectId}">Entregar PoW</button>
                                        </div>
                                    </div>`;
                                }).join('')}
                            </div>
                        `}

                        <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">🛒 Entregables Disponibles para tus Roles</h3>
                        ${availablePulls.length === 0 ? `
                            <div class="panel text-center" style="border-style: dashed;"><p class="text-muted">No hay diseño de flujos teóricos pendientes para ti.</p></div>
                        ` : `
                            <div class="list-group">
                                ${availablePulls.map(pull => {
                                    const rTo = pull.projectRoles.find(r => r.id === pull.to);
                                    return `
                                    <div class="panel-surface" style="margin-bottom: 15px; border-left: 2px dashed var(--accent-gold); background: rgba(255,255,255,0.02);">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <div style="font-size: 0.7rem; color: var(--accent-gold); text-transform: uppercase;">Disponible para tu rol: ${rTo?.name}</div>
                                                <h4 style="margin: 0; font-size: 1rem;">${pull.entregable}</h4>
                                                <div style="font-size: 0.75rem; color: var(--text-muted);">Est: ${pull.estimatedHours}h | ${pull.projectName}</div>
                                            </div>
                                            <button class="btn btn-outline btn-pull-ping text-small" style="color: var(--accent-gold); border-color: var(--accent-gold);" data-hash="${pull.hash}" data-pid="${pull.projectId}">Asumir Entregable (+)</button>
                                        </div>
                                    </div>`;
                                }).join('')}
                            </div>
                        `}
                    </main>

                    <aside>
                        <h3 style="margin-bottom: 20px;">📜 Tu Ledger</h3>
                        ${historyPoW.length === 0 ? `<p class="text-small text-muted">Aún no has sellado valor.</p>` : `
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                ${historyPoW.map(tx => `
                                    <div class="panel" style="padding: 10px; border-color: ${tx.status === 'consolidated' ? 'var(--accent-green)' : 'var(--accent-blue)'};">
                                        <b style="font-size: 0.85rem;">${tx.entregable}</b>
                                        <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 5px;">${tx.projectName} | ${tx.realHours}h</div>
                                        <div style="font-size: 0.7rem;">${tx.status === 'consolidated' ? '✅ Sellado' : '⏳ En Auditoría'}</div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </aside>
                </div>
            </div>
        `;
    }
};
