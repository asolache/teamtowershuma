import { store } from '../core/store.js';

// Estado local para el modal de Proof of Work
let activePingHash = null;
let activePingProjectId = null;

document.addEventListener('click', (e) => {
    // 1. ABRIR MODAL PARA RESPONDER PING
    if (e.target.classList.contains('btn-respond-ping')) {
        activePingHash = e.target.getAttribute('data-hash');
        activePingProjectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }

    // 2. CANCELAR MODAL
    if (e.target.id === 'btn-cancel-pow') {
        activePingHash = null;
        activePingProjectId = null;
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }

    // 3. ENVIAR PROOF OF WORK (PoW)
    if (e.target.id === 'btn-submit-pow') {
        const realHours = document.getElementById('pow-horas').value;
        const proofLink = document.getElementById('pow-link').value.trim();
        const comentario = document.getElementById('pow-comentario').value.trim();

        if (!realHours || !proofLink) {
            return alert("⚠️ Debes introducir las horas reales y un enlace a tu Proof of Work (Entregable).");
        }

        store.dispatch({
            type: 'REPORT_TRANSACTION',
            payload: { 
                projectId: activePingProjectId, 
                txHash: activePingHash, 
                realHours: parseFloat(realHours), 
                proofLink, 
                comentario 
            }
        });

        // Limpiar estado y recargar
        activePingHash = null;
        activePingProjectId = null;
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }
});

export const UserDashboardView = {
    render: () => {
        const state = store.getState();
        const session = state.session || { activeUserId: 'ecosystem-admin', role: 'admin' };
        
        // Redirigir si el admin intenta entrar aquí por error (aunque puede simular ser usuario)
        if (session.role === 'admin' && session.activeUserId === 'ecosystem-admin') {
            return `<div class="container text-center" style="padding-top:10vh;">
                        <h2>👑 Modo Ecosystem Owner</h2>
                        <p class="text-muted">Estás usando la cuenta de administrador global. Simula un usuario desde la barra superior para ver esta bandeja.</p>
                        <button class="btn btn-primary" onclick="location.hash='#/'">Ir al Centro de Mando</button>
                    </div>`;
        }

        const activeUser = state.globalUsers.find(u => u.id === session.activeUserId);
        const userName = activeUser ? activeUser.name : session.activeUserId;

        // --- RECOLECCIÓN DE DATOS DEL USUARIO ---
        let totalSlices = 0;
        let pendingPings = [];
        let historyPoW = [];

        state.projects.forEach(project => {
            // 1. Calcular Equity (Slices) en el Ledger de este proyecto
            const userLedgers = (project.ledger || []).filter(l => l.userId === session.activeUserId);
            userLedgers.forEach(l => totalSlices += l.valorCongelado);

            // 2. Buscar Pings pendientes
            const userPings = (project.transactions || []).filter(tx => tx.status === 'pinged' && tx.assigneeId === session.activeUserId);
            userPings.forEach(tx => pendingPings.push({ ...tx, projectName: project.nombre, projectId: project.id, projectRoles: project.roles }));

            // 3. Buscar Historial (Reportados o Consolidados)
            const userHistory = (project.transactions || []).filter(tx => (tx.status === 'reported' || tx.status === 'consolidated') && tx.assigneeId === session.activeUserId);
            userHistory.forEach(tx => historyPoW.push({ ...tx, projectName: project.nombre, projectId: project.id }));
        });

        // Ordenar historial por timestamp más reciente
        historyPoW.sort((a, b) => b.timestamp - a.timestamp);

        // --- RENDERIZADO DEL MODAL PoW ---
        let modalHTML = '';
        if (activePingHash) {
            const project = state.projects.find(p => p.id === activePingProjectId);
            const tx = project.transactions.find(t => t.hash === activePingHash);
            const rTo = project.roles.find(r => r.id === tx.to);

            modalHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                    <div class="panel" style="width: 450px; border-color: var(--accent-purple); box-shadow: 0 10px 40px rgba(163,113,247,0.2);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="margin: 0; color: var(--accent-purple);">🚀 Entregar Proof of Work</h3>
                            <span class="badge" style="background: rgba(255,255,255,0.1);">${tx.entregable}</span>
                        </div>
                        
                        <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 0.85rem; border-left: 3px solid var(--accent-blue);">
                            <p style="margin:0 0 10px 0; color: var(--text-muted);">Estás respondiendo desde tu rol <b>${rTo?.name}</b> en el ecosistema <b>${project.nombre}</b>.</p>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Estimación Original:</span>
                                <strong style="color:var(--text-main);">${tx.estimatedHours}h</strong>
                            </div>
                        </div>

                        <label class="form-label">Horas Reales Invertidas (Slicing):</label>
                        <input type="number" step="0.5" id="pow-horas" class="form-control" placeholder="Ej: ${tx.estimatedHours}" value="${tx.estimatedHours}">
                        
                        <label class="form-label">Enlace al Entregable (Github, Figma, Drive...):</label>
                        <input type="url" id="pow-link" class="form-control" placeholder="https://...">

                        <label class="form-label">Comentarios (Opcional):</label>
                        <textarea id="pow-comentario" class="form-control" rows="3" placeholder="Añade notas para el auditor o Ecosystem Owner..."></textarea>

                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button id="btn-cancel-pow" class="btn btn-secondary" style="flex: 1;">Cancelar</button>
                            <button id="btn-submit-pow" class="btn btn-primary" style="flex: 2; background: var(--accent-purple); color: white;">Sellar Entregable 💾</button>
                        </div>
                    </div>
                </div>
            `;
        }

        // 🚀 INYECTAR EN LA NAVBAR GLOBAL
        setTimeout(() => window.setNavbar(
            `<span style="font-weight:normal; opacity:0.6;">Nodo /</span> Mi Bandeja`, 
            `<button class="btn btn-outline text-small" onclick="location.hash='#/'">Explorar Ecosistemas</button>`, 
            "Convierte tu esfuerzo en Equity. Responde a los Pings aportando un Proof of Work (PoW) verificable."
        ), 0);

        return `
            ${modalHTML}
            <div class="container fade-in" style="padding-top: 20px;">
                
                <div class="panel-surface" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; background: linear-gradient(135deg, rgba(35,134,54,0.1) 0%, rgba(13,17,23,0) 100%); border-left: 4px solid var(--accent-green);">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="width: 60px; height: 60px; background: var(--bg-panel); border: 2px solid var(--border-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                            👤
                        </div>
                        <div>
                            <h2 style="margin: 0; font-size: 1.4rem;">Bienvenido/a, ${userName}</h2>
                            <div style="font-family: monospace; color: var(--text-muted); font-size: 0.8rem;">${session.activeUserId}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: bold; letter-spacing: 0.05em;">Total Equity (Slices)</div>
                        <div style="font-size: 2.2rem; font-weight: bold; color: var(--accent-green); line-height: 1;">
                            ${totalSlices.toLocaleString('es-ES', { maximumFractionDigits: 1 })} <span style="font-size: 1rem; color: var(--text-muted);">Slices</span>
                        </div>
                    </div>
                </div>

                <div class="grid-layout">
                    <main>
                        <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                            📬 Bandeja de Pings 
                            ${pendingPings.length > 0 ? `<span class="badge" style="background: var(--accent-purple); color: white;">${pendingPings.length} Pendientes</span>` : ''}
                        </h3>

                        ${pendingPings.length === 0 ? `
                            <div class="panel text-center" style="padding: 40px; border-style: dashed; border-color: var(--border-color);">
                                <div style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 10px;">☕</div>
                                <h4 style="margin:0; color:var(--text-muted);">Bandeja Limpia</h4>
                                <p class="text-small text-muted" style="margin-top:5px;">No tienes Pings pendientes de respuesta en ningún ecosistema.</p>
                            </div>
                        ` : `
                            <div class="list-group">
                                ${pendingPings.map(ping => {
                                    const rFrom = ping.projectRoles.find(r => r.id === ping.from);
                                    const rTo = ping.projectRoles.find(r => r.id === ping.to);
                                    
                                    return `
                                    <div class="panel-surface" style="margin-bottom: 15px; border-left: 4px solid var(--accent-purple); transition: 0.2s; position: relative; overflow: hidden;">
                                        <div style="position: absolute; top: -10px; right: -10px; font-size: 4rem; opacity: 0.03; user-select: none;">⚡</div>
                                        
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                                            <div>
                                                <div style="font-size: 0.7rem; color: var(--accent-purple); text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em; margin-bottom: 4px;">
                                                    Ping de ${rFrom?.name || 'Origen Desconocido'}
                                                </div>
                                                <h4 style="margin: 0; font-size: 1.2rem; color: var(--text-heading);">${ping.entregable}</h4>
                                                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                                                    📍 Proyecto: <a href="#/project/${ping.projectId}" style="color:var(--accent-blue); text-decoration:none;">${ping.projectName}</a>
                                                </div>
                                            </div>
                                            <div style="text-align: right;">
                                                <span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-muted);">Est: ${ping.estimatedHours}h</span>
                                            </div>
                                        </div>

                                        <div style="background: rgba(0,0,0,0.2); border-radius: 6px; padding: 10px; display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                                            <div style="flex:1; text-align:right; font-size: 0.8rem; color: var(--text-muted);">${rFrom?.levelId || ''}</div>
                                            <div style="color: var(--accent-purple);">⟶</div>
                                            <div style="flex:1; text-align:left; font-size: 0.8rem; font-weight:bold;">${rTo?.name || 'Tu Rol'}</div>
                                        </div>

                                        <button class="btn btn-primary btn-block btn-respond-ping" style="background: var(--accent-purple);" data-hash="${ping.hash}" data-pid="${ping.projectId}">
                                            Responder Ping (Entregar PoW) ⚡
                                        </button>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </main>

                    <aside>
                        <h3 style="margin-bottom: 20px; font-size: 1.1rem; color: var(--text-heading);">📜 Tu Ledger (Historial PoW)</h3>
                        
                        ${historyPoW.length === 0 ? `
                            <p class="text-small text-muted">Aún no has reportado ningún entregable.</p>
                        ` : `
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                ${historyPoW.map(tx => {
                                    let statusUI = '';
                                    if (tx.status === 'reported') {
                                        statusUI = `<span style="color: var(--accent-blue); font-size: 0.7rem; font-weight:bold;">⏳ En Auditoría</span>`;
                                    } else if (tx.status === 'consolidated') {
                                        statusUI = `<span style="color: var(--accent-green); font-size: 0.7rem; font-weight:bold;">✅ Equity Sellado</span>`;
                                    }

                                    return `
                                    <div class="panel" style="padding: 12px; border-color: ${tx.status === 'consolidated' ? 'var(--accent-green)' : 'var(--accent-blue)'};">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                            <b style="font-size: 0.9rem;">${tx.entregable}</b>
                                        </div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">
                                            📍 ${tx.projectName} | ${tx.realHours}h reportadas
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05);">
                                            ${statusUI}
                                            <a href="${tx.proofLink}" target="_blank" style="font-size: 0.7rem; color: var(--accent-blue); text-decoration: none;">Ver PoW 🔗</a>
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </aside>

                </div>
            </div>
        `;
    }
};
