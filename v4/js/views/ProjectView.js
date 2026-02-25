import { store } from '../core/store.js';

// EVENTOS DE LA VISTA
document.addEventListener('click', (e) => {
    // 1. Añadir nueva transacción (Solo Admins)
    if (e.target.id === 'btn-add-tx') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('tx-from').value;
        const to = document.getElementById('tx-to').value;
        const horas = document.getElementById('tx-horas').value;
        const entregable = document.getElementById('tx-entregable').value;
        const tipo = document.getElementById('tx-tipo').value;

        if (!from || !to || !horas || !entregable) return alert("Rellena todos los campos del flujo.");
        if (from === to) return alert("El emisor y receptor no pueden ser el mismo nodo.");

        store.dispatch({
            type: 'ADD_TRANSACTION',
            payload: { projectId, tx: { from, to, horas, entregable, tipo } }
        });
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // 2. Enviar Ping (Solo Admins)
    if (e.target.classList.contains('btn-ping')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const toRoleId = e.target.getAttribute('data-torole');
        
        // Buscamos quién tiene asignado ese rol para enviarle el Ping
        const p = store.getState().projects.find(x => x.id === projectId);
        const asignacion = p.asignaciones?.find(a => a.roleId === toRoleId);
        
        if (!asignacion) return alert("⚠️ No hay ningún usuario asignado al rol receptor. Ve a Accounting -> Vincular Nodo.");

        store.dispatch({
            type: 'PING_TRANSACTION',
            payload: { projectId, txHash, userId: asignacion.userId }
        });
        
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // 3. Aprobar Reporte (Sellar en Ledger) (Solo Admins)
    if (e.target.classList.contains('btn-approve')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        
        if (confirm("¿Confirmas que el trabajo cumple los requisitos? Esto generará Equity inmutable en el Ledger.")) {
            store.dispatch({
                type: 'APPROVE_TRANSACTION',
                payload: { projectId, txHash }
            });
            document.getElementById('app').innerHTML = ProjectView.render(projectId);
        }
    }
});

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Proyecto no encontrado</h2></div>`;

        // 🛡️ CONTROL DE ACCESO (RBAC)
        const session = state.session || { activeUserId: 'ecosystem-admin', role: 'admin' };
        const isAdmin = session.role === 'admin';

        const roles = project.roles.filter(r => !r.isArchived);
        const transactions = project.transactions || [];
        const resilience = store.calculateResilience(projectId);

        return `
            <div class="container fade-in">
                <header style="margin-bottom: 30px;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none;">Dashboard</a> /
                        <span style="color: var(--text-heading); font-weight:bold;">${project.nombre}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <h1 style="margin: 0; font-size: 2.2rem;">🗺️ Mapa de Valor</h1>
                                ${!isAdmin ? '<span class="badge" style="background: rgba(210, 153, 34, 0.1); border: 1px solid var(--accent-gold); color: var(--accent-gold);">👁️ MODO LECTURA</span>' : ''}
                            </div>
                            <p style="margin: 5px 0 0 0; color: var(--text-muted); max-width: 600px;">
                                ${project.description || 'Diseño de la topología de la red y flujos de trabajo.'}
                            </p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            ${isAdmin ? `
                                <button class="btn btn-outline" onclick="location.hash='#/project/${projectId}/edit'">⚙️ Ontología</button>
                                <button class="btn btn-primary" onclick="location.hash='#/project/${projectId}/accounting'">💰 Accounting</button>
                            ` : `
                                <button class="btn btn-primary" onclick="location.hash='#/user-dashboard'">Mi Bandeja de Tareas</button>
                            `}
                        </div>
                    </div>
                </header>

                <div class="grid-layout" style="${isAdmin ? 'grid-template-columns: 2fr 1fr;' : 'grid-template-columns: 1fr; max-width: 1000px; margin: 0 auto;'}">
                    
                    <main>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                                📉 Flujos Secuenciados
                                <span style="font-size: 0.75rem; font-weight: normal; background: var(--bg-surface); padding: 2px 8px; border-radius: 12px; border: 1px solid var(--border-color);">
                                    Salud de Red: <b style="color: ${resilience > 50 ? 'var(--accent-green)' : 'var(--accent-red)'};">${resilience}%</b>
                                </span>
                            </h3>
                        </div>

                        ${transactions.length === 0 ? `
                            <div class="panel-surface text-center" style="padding: 40px; border-style: dashed;">
                                <div style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px;">🕸️</div>
                                <h4 style="color: var(--text-muted); margin: 0;">No hay flujos de valor diseñados</h4>
                                ${isAdmin ? '<p class="text-small text-muted">Usa el panel lateral para conectar los nodos y definir entregables.</p>' : ''}
                            </div>
                        ` : `
                            <div class="list-group">
                                ${transactions.slice().reverse().map((tx, index) => {
                                    const rFrom = roles.find(r => r.id === tx.from);
                                    const rTo = roles.find(r => r.id === tx.to);
                                    
                                    // Determinar UI según el estado del flujo
                                    let statusUI = '';
                                    let actionBtn = '';

                                    if (tx.status === 'theoretical') {
                                        statusUI = `<span style="color: var(--text-muted); font-size: 0.8rem;">📦 Diseñado</span>`;
                                        if (isAdmin) {
                                            actionBtn = `<button class="btn btn-outline btn-ping text-small" style="padding: 4px 10px;" data-hash="${tx.hash}" data-pid="${project.id}" data-torole="${tx.to}">Enviar Ping ⚡</button>`;
                                        }
                                    } else if (tx.status === 'pinged') {
                                        statusUI = `<span style="color: var(--accent-purple); font-size: 0.8rem; font-weight: bold;">⏳ Esperando Trabajo</span>`;
                                    } else if (tx.status === 'reported') {
                                        statusUI = `<span style="color: var(--accent-blue); font-size: 0.8rem; font-weight: bold;">📝 Reporte Recibido (${tx.realHours}h)</span>`;
                                        if (isAdmin) {
                                            actionBtn = `<button class="btn btn-primary btn-approve text-small" style="padding: 4px 10px;" data-hash="${tx.hash}" data-pid="${project.id}">Aprobar y Sellar 💾</button>`;
                                        }
                                    } else if (tx.status === 'consolidated') {
                                        statusUI = `<span style="color: var(--accent-green); font-size: 0.8rem; font-weight: bold;">✅ Consolidado</span>`;
                                    }

                                    return `
                                    <div class="panel-surface" style="margin-bottom: 12px; border-left: 4px solid ${tx.status === 'consolidated' ? 'var(--accent-green)' : 'var(--accent-blue)'};">
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                            <div>
                                                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05rem; margin-bottom: 4px;">Fase ${transactions.length - index}</div>
                                                <h4 style="margin: 0; color: var(--text-heading); font-size: 1.1rem;">${tx.entregable}</h4>
                                            </div>
                                            <div style="text-align: right;">
                                                <div style="font-family: monospace; font-size: 0.75rem; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">
                                                    ${tx.hash.substring(0,8)}...
                                                </div>
                                            </div>
                                        </div>

                                        <div style="display: flex; align-items: center; gap: 15px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                                            <div style="flex: 1; text-align: right;">
                                                <div style="font-size: 0.8rem; font-weight: bold; color: var(--text-main);">${rFrom?.name || 'Borrado'}</div>
                                                <div style="font-size: 0.65rem; color: var(--text-muted);">${rFrom?.levelId || ''}</div>
                                            </div>
                                            <div style="color: var(--accent-blue); font-size: 1.2rem;">⟶</div>
                                            <div style="flex: 1; text-align: left;">
                                                <div style="font-size: 0.8rem; font-weight: bold; color: var(--text-main);">${rTo?.name || 'Borrado'}</div>
                                                <div style="font-size: 0.65rem; color: var(--text-muted);">${rTo?.levelId || ''}</div>
                                            </div>
                                        </div>

                                        ${tx.status === 'reported' ? `
                                            <div style="background: rgba(88, 166, 255, 0.1); border: 1px dashed var(--accent-blue); padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 0.85rem;">
                                                <b style="color: var(--accent-blue);">🔗 Proof of Work:</b> <a href="${tx.proofLink}" target="_blank" style="color: var(--text-main);">${tx.proofLink}</a><br>
                                                ${tx.reportComment ? `<div style="margin-top: 5px; color: var(--text-muted);"><i>"${tx.reportComment}"</i></div>` : ''}
                                            </div>
                                        ` : ''}

                                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;">
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                ${statusUI}
                                                <span style="font-size: 0.75rem; color: var(--text-muted);">| Est: ${tx.estimatedHours}h</span>
                                            </div>
                                            <div>
                                                ${actionBtn}
                                            </div>
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        `}
                    </main>

                    ${isAdmin ? `
                        <aside>
                            <div class="panel" style="position: sticky; top: 80px; border-color: var(--accent-blue);">
                                <h3 style="margin-top: 0; color: var(--accent-blue);">🔌 Diseñador de Flujos</h3>
                                <p class="text-small text-muted">Conecta dos nodos para crear una ruta de valor o fricción.</p>
                                
                                <label class="form-label">De (Generador):</label>
                                <select id="tx-from" class="form-control">
                                    <option value="">Selecciona nodo origen...</option>
                                    ${roles.map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('')}
                                </select>
                                
                                <label class="form-label">A (Receptor / Auditor):</label>
                                <select id="tx-to" class="form-control">
                                    <option value="">Selecciona nodo destino...</option>
                                    ${roles.map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('')}
                                </select>
                                
                                <label class="form-label">Tipo de Conexión:</label>
                                <select id="tx-tipo" class="form-control">
                                    <option value="tangible">Entregable Tangible (Ej: Código, Diseño)</option>
                                    <option value="intangible">Fricción / Auditoría (Ej: Review, Estrategia)</option>
                                </select>

                                <label class="form-label">Nombre del Entregable:</label>
                                <input type="text" id="tx-entregable" class="form-control" placeholder="Ej: Auditoría Contratos">
                                
                                <label class="form-label">Horas Estimadas (Slicing Pie):</label>
                                <input type="number" step="0.5" id="tx-horas" class="form-control" placeholder="Ej: 2.5">
                                
                                <button id="btn-add-tx" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-top: 15px;">Conectar Nodos</button>
                            </div>
                        </aside>
                    ` : ''}

                </div>
            </div>
        `;
    }
};
