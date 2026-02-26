import { store } from '../core/store.js';

let activePingHash = null;
let activePingProjectId = null;

document.addEventListener('click', (e) => {
    // ----------------------------------------------------------------
    // 1. LÓGICA ORIGINAL: MODALES DE RESPUESTA A PINGS 
    // ----------------------------------------------------------------
    if (e.target.classList.contains('btn-respond-ping')) {
        activePingHash = e.target.getAttribute('data-hash'); 
        activePingProjectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }
    if (e.target.id === 'btn-cancel-pow') {
        activePingHash = null; 
        activePingProjectId = null;
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }
    if (e.target.id === 'btn-submit-pow') {
        const realHours = document.getElementById('pow-horas').value;
        const proofLink = document.getElementById('pow-link').value.trim();
        const comentario = document.getElementById('pow-comentario').value.trim();
        if (!realHours || !proofLink) return alert("⚠️ Introduce horas reales y link al PoW.");

        store.dispatch({ 
            type: 'REPORT_TRANSACTION', 
            payload: { projectId: activePingProjectId, txHash: activePingHash, realHours: parseFloat(realHours), proofLink, comentario } 
        });
        activePingHash = null; 
        activePingProjectId = null;
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }

    // ----------------------------------------------------------------
    // 2. LÓGICA ORIGINAL: SISTEMA PULL (ASUMIR TAREA)
    // ----------------------------------------------------------------
    if (e.target.classList.contains('btn-pull-ping')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const state = store.getState();
        
        store.dispatch({ type: 'PING_TRANSACTION', payload: { projectId, txHash, userId: state.session.activeUserId } });
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }

    // ----------------------------------------------------------------
    // 3. NUEVA LÓGICA: REPORTE ESPONTÁNEO (BASADO EN ONTOLOGÍA)
    // ----------------------------------------------------------------
    if (e.target.id === 'btn-submit-spontaneous') {
        const selectDeliv = document.getElementById('select-deliverable').value;
        const realHours = parseFloat(document.getElementById('input-real-hours').value);
        const proofLink = document.getElementById('input-proof-link').value.trim();
        const comments = document.getElementById('input-comments').value.trim();
        const state = store.getState();
        const userId = state.session.activeUserId;

        if (!selectDeliv) return alert("⚠️ Selecciona un entregable de tu rol.");
        if (!realHours || realHours <= 0) return alert("⚠️ Debes indicar cuántas horas reales has invertido.");

        const [projectId, roleId, entregableName] = selectDeliv.split('|');

        store.dispatch({
            type: 'ADD_TRANSACTION',
            payload: {
                projectId,
                tx: {
                    from: roleId,
                    to: 'PO', 
                    entregable: entregableName,
                    horas: realHours, 
                    realHours: realHours,
                    proofLink: proofLink,
                    reportComment: comments,
                    status: 'reported',
                    assigneeId: userId
                }
            }
        });

        alert("✅ Trabajo reportado. Pendiente de auditoría.");
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }

    // 4. INCIDENCIA: SOLICITAR NUEVO ENTREGABLE AL PO
    if (e.target.id === 'btn-request-deliverable') {
        const tarea = prompt("Describe la tarea que has realizado y que no está en la Ontología. El PO recibirá un aviso:");
        if (tarea) {
            alert(`📨 Aviso enviado al PO: "Falta añadir el entregable: ${tarea}"`);
        }
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
        let availablePulls = []; 
        let myAssignedRoles = []; 

        state.projects.forEach(project => {
            const userLedgers = (project.ledger || []).filter(l => l.userId === session.activeUserId);
            userLedgers.forEach(l => totalSlices += l.valorCongelado);

            const userRolesIds = [];
            (project.asignaciones || []).forEach(a => {
                if (a.userId === session.activeUserId) {
                    userRolesIds.push(a.roleId);
                    const roleData = project.roles.find(r => r.id === a.roleId);
                    if (roleData) {
                        myAssignedRoles.push({ project, role: roleData });
                    }
                }
            });

            (project.transactions || []).forEach(tx => {
                const rxInfo = { ...tx, projectName: project.nombre, projectId: project.id, projectRoles: project.roles };
                
                if (tx.status === 'pinged' && tx.assigneeId === session.activeUserId) {
                    pendingPings.push(rxInfo);
                }
                else if ((tx.status === 'reported' || tx.status === 'consolidated') && tx.assigneeId === session.activeUserId) {
                    historyPoW.push(rxInfo);
                }
                else if (tx.status === 'theoretical' && userRolesIds.includes(tx.to)) {
                    availablePulls.push(rxInfo);
                }
            });
        });

        historyPoW.sort((a, b) => b.timestamp - a.timestamp);

        let modalHTML = '';
        if (activePingHash) {
            const project = state.projects.find(p => p.id === activePingProjectId);
            const tx = project.transactions.find(t => t.hash === activePingHash);
            const rTo = project.roles.find(r => r.id === tx.to);

            modalHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 3000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px);">
                    <div class="panel-surface fade-in" style="width: 450px; border-top: 4px solid var(--accent-purple); border-radius: 12px; padding: 30px; box-shadow: 0 10px 40px rgba(163,113,247,0.2);">
                        <h3 style="margin-top: 0; color: var(--accent-purple);">🚀 Entregar Proof of Work</h3>
                        <p style="margin-bottom: 20px; color: var(--text-muted); font-size:0.85rem;">Estás sellando <b style="color:var(--text-heading);">${tx.entregable}</b> para el rol ${rTo?.name}.</p>
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Horas Reales Invertidas (Slicing):</label>
                        <input type="number" step="0.5" id="pow-horas" class="form-input" placeholder="Ej: ${tx.estimatedHours}" value="${tx.estimatedHours}" style="width:100%; margin-bottom: 15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white; border-radius:6px;">
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Enlace al Entregable (Proof):</label>
                        <input type="url" id="pow-link" class="form-input" placeholder="https://..." style="width:100%; margin-bottom: 15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white; border-radius:6px;">
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Comentarios para el Auditor:</label>
                        <textarea id="pow-comentario" class="form-input" rows="3" placeholder="Notas adicionales..." style="width:100%; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white; border-radius:6px;"></textarea>
                        
                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button id="btn-cancel-pow" class="btn btn-outline" style="flex: 1;">Cancelar</button>
                            <button id="btn-submit-pow" class="btn btn-primary" style="flex: 2; background: var(--accent-purple); border:none;">Sellar Entregable 💾</button>
                        </div>
                    </div>
                </div>`;
        }

        // 🚀 BREADCRUMBS GLOBALES: Ahora sí incluye la jerarquía visual perfecta
        setTimeout(() => {
            if (window.setNavbar) {
                window.setNavbar(
                    [
                        { label: state.config?.ecosystemName || 'Ecosistema', hash: '#/' },
                        { label: 'Bandeja de Nodo' }
                    ], 
                    '', 
                    ''
                );
            }
        }, 0);

        let deliverableOptions = `<option value="">-- Selecciona una tarea estándar de tu rol --</option>`;
        myAssignedRoles.forEach(item => {
            if (item.role.standard_deliverables) {
                item.role.standard_deliverables.forEach(d => {
                    const valueString = `${item.project.id}|${item.role.id}|${d.name}`;
                    deliverableOptions += `<option value="${valueString}">[${item.project.nombre}] ${d.name} (~${d.estimatedHours}h)</option>`;
                });
            }
        });

        return `
            ${modalHTML}
            <div class="container fade-in" style="max-width: 1200px; margin: 30px auto; padding: 0 20px;">
                
                <div class="panel-surface" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-left: 4px solid var(--accent-green);">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div style="width: 50px; height: 50px; background: var(--bg-panel); border: 2px solid var(--border-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">👤</div>
                        <div>
                            <h2 style="margin: 0; font-size: 1.2rem; color: var(--text-heading);">${userName}</h2>
                            <div style="font-family: monospace; color: var(--text-muted); font-size: 0.8rem;">${session.activeUserId}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: bold;">Total Equity (Slices)</div>
                        <div style="font-size: 2rem; font-weight: bold; color: var(--accent-green); line-height: 1;">${totalSlices.toLocaleString()}</div>
                    </div>
                </div>

                <div class="grid-layout" style="grid-template-columns: 1.2fr 1fr; gap: 30px;">
                    
                    <main style="display: flex; flex-direction: column; gap: 30px;">
                        
                        <div class="panel-surface" style="padding: 25px; border-radius: 12px; border-top: 3px solid var(--accent-blue);">
                            <h3 style="margin: 0 0 15px 0; color: var(--accent-blue);">⚡ Aportación Espontánea</h3>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">¿Has completado una tarea estándar de tu rol? Repórtala directamente para que la IA la audite.</p>
                            
                            <select id="select-deliverable" style="width:100%; margin-bottom: 15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white; border-radius:6px;">
                                ${deliverableOptions}
                            </select>
                            <div style="text-align: right; margin-top: -10px; margin-bottom: 15px;">
                                <a href="#" id="btn-request-deliverable" style="font-size: 0.75rem; color: var(--accent-gold); text-decoration: underline;">¿Tu tarea no está en la lista? Avisar al PO.</a>
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Horas Reales</label>
                                    <input type="number" step="0.5" id="input-real-hours" placeholder="Ej: 4.5" style="width:100%; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white; border-radius:6px; font-weight:bold;">
                                </div>
                                <div>
                                    <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Enlace (Proof)</label>
                                    <input type="text" id="input-proof-link" placeholder="URL a Figma, Github..." style="width:100%; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white; border-radius:6px;">
                                </div>
                            </div>
                            <textarea id="input-comments" placeholder="Comentarios para el Auditor (Opcional)..." style="width:100%; height: 60px; margin-bottom: 15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white; border-radius:6px; font-family: monospace;"></textarea>

                            <button id="btn-submit-spontaneous" class="btn btn-primary btn-block" style="background: var(--accent-blue); border: none;">Enviar Reporte ➔</button>
                        </div>

                        <div>
                            <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">🛒 Tareas Libres en el Mercado (Pull System)</h3>
                            ${availablePulls.length === 0 ? `
                                <div class="panel text-center" style="border-style: dashed;"><p class="text-muted">No hay diseño de flujos teóricos pendientes para ti.</p></div>
                            ` : `
                                <div class="list-group">
                                    ${availablePulls.map(pull => {
                                        const rTo = pull.projectRoles.find(r => r.id === pull.to);
                                        return `
                                        <div class="panel-surface" style="margin-bottom: 15px; border-left: 2px dashed var(--accent-gold); background: rgba(255,255,255,0.02); padding: 15px;">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <div>
                                                    <div style="font-size: 0.7rem; color: var(--accent-gold); text-transform: uppercase;">Disponible para tu rol: ${rTo?.name}</div>
                                                    <h4 style="margin: 0 0 5px 0; font-size: 1.1rem; color: var(--text-heading);">${pull.entregable}</h4>
                                                    <div style="font-size: 0.75rem; color: var(--text-muted);">Est: ${pull.estimatedHours || pull.horas}h | Proyecto: ${pull.projectName}</div>
                                                </div>
                                                <button class="btn btn-outline btn-pull-ping text-small" style="color: var(--accent-gold); border-color: var(--accent-gold);" data-hash="${pull.hash}" data-pid="${pull.projectId}">Asumir Tarea (+)</button>
                                            </div>
                                        </div>`;
                                    }).join('')}
                                </div>
                            `}
                        </div>
                    </main>

                    <aside style="display: flex; flex-direction: column; gap: 30px;">
                        
                        <div class="panel-surface" style="padding: 20px; border-radius: 12px; border-top: 3px solid var(--accent-purple);">
                            <h3 style="margin: 0 0 20px 0;">⏳ Tareas Asumidas ${pendingPings.length > 0 ? `<span class="badge" style="background: var(--accent-purple); color: white;">${pendingPings.length}</span>` : ''}</h3>
                            ${pendingPings.length === 0 ? `<p class="text-muted text-small">No tienes tareas pendientes de entregar.</p>` : `
                                <div class="list-group">
                                    ${pendingPings.map(ping => {
                                        return `
                                        <div style="background: var(--bg-base); border: 1px solid var(--border-color); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                                            <h4 style="margin: 0 0 5px 0; font-size: 1rem; color: var(--text-heading);">${ping.entregable}</h4>
                                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px;">${ping.projectName}</div>
                                            <button class="btn btn-primary btn-block btn-respond-ping" style="background: var(--accent-purple); border: none;" data-hash="${ping.hash}" data-pid="${ping.projectId}">Entregar PoW</button>
                                        </div>`;
                                    }).join('')}
                                </div>
                            `}
                        </div>

                        <div class="panel-surface" style="padding: 20px; border-radius: 12px; height: 100%; max-height: 500px; overflow-y: auto;">
                            <h3 style="margin: 0 0 15px 0;">📜 Mis Entregas (Ledger)</h3>
                            ${historyPoW.length === 0 ? `<p class="text-small text-muted">Aún no has sellado valor.</p>` : `
                                <div style="display: flex; flex-direction: column; gap: 10px;">
                                    ${historyPoW.map(tx => `
                                        <div class="panel" style="padding: 12px; border-color: ${tx.status === 'consolidated' ? 'var(--accent-green)' : 'var(--accent-gold)'};">
                                            <b style="font-size: 0.85rem; color: var(--text-heading);">${tx.entregable}</b>
                                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 5px;">${tx.projectName} | ${tx.realHours}h</div>
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <span style="font-size: 0.75rem; font-weight: bold; color: ${tx.status === 'consolidated' ? 'var(--accent-green)' : 'var(--accent-gold)'};">
                                                    ${tx.status === 'consolidated' ? '✅ Aprobado' : '⏳ En Auditoría'}
                                                </span>
                                                ${tx.status === 'consolidated' ? `<span style="font-size: 0.8rem; color: var(--accent-green); font-weight: bold;">+${(tx.valorCongelado || 0).toLocaleString()} 🍰</span>` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                    </aside>

                </div>
            </div>
        `;
    }
};
