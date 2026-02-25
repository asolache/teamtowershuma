import { store } from '../core/store.js';

// 🧠 MEMORIA LOCAL PARA LA INTERFAZ ÁGIL
let agileOriginId = null;
let agileDestinationId = null;
let showAgileModal = false;

// 🛡️ EVENTOS DE LA VISTA
document.addEventListener('click', (e) => {
    
    // --- 1. LÓGICA DE CREACIÓN ÁGIL (CLIC EN NODOS) ---
    const nodeElement = e.target.closest('.node-bubble');
    if (nodeElement) {
        const state = store.getState();
        const isAdmin = (state.session?.role || 'admin') === 'admin';
        if (!isAdmin) return; // Solo Admins pueden diseñar

        const clickedRoleId = nodeElement.getAttribute('data-id');
        const projectId = nodeElement.getAttribute('data-pid');

        if (!agileOriginId) {
            // Primer Clic: Seleccionamos Emisor
            agileOriginId = clickedRoleId;
            document.getElementById('app').innerHTML = ProjectView.render(projectId);
        } else if (agileOriginId === clickedRoleId) {
            // Clic en el mismo: Deseleccionamos
            agileOriginId = null;
            document.getElementById('app').innerHTML = ProjectView.render(projectId);
        } else {
            // Segundo Clic: Seleccionamos Receptor y abrimos Modal
            agileDestinationId = clickedRoleId;
            showAgileModal = true;
            document.getElementById('app').innerHTML = ProjectView.render(projectId);
            
            // Auto-focus en el input del modal para UX rápida
            setTimeout(() => document.getElementById('agile-entregable').focus(), 100);
        }
    }

    // --- 2. MODAL ÁGIL (GUARDAR / CANCELAR) ---
    if (e.target.id === 'btn-agile-cancel') {
        agileOriginId = null;
        agileDestinationId = null;
        showAgileModal = false;
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    if (e.target.id === 'btn-agile-save') {
        const projectId = e.target.getAttribute('data-pid');
        const entregable = document.getElementById('agile-entregable').value.trim();
        const horas = document.getElementById('agile-horas').value;
        const tipo = document.getElementById('agile-tipo').value;

        if (!entregable || !horas) return alert("⚠️ Define el entregable y la estimación de horas.");

        store.dispatch({
            type: 'ADD_TRANSACTION',
            payload: { projectId, tx: { from: agileOriginId, to: agileDestinationId, horas, entregable, tipo } }
        });

        // Limpiamos y recargamos
        agileOriginId = null;
        agileDestinationId = null;
        showAgileModal = false;
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- 3. FORMULARIO TRADICIONAL (LATERAL) ---
    if (e.target.id === 'btn-add-tx') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('tx-from').value;
        const to = document.getElementById('tx-to').value;
        const horas = document.getElementById('tx-horas').value;
        const entregable = document.getElementById('tx-entregable').value;
        const tipo = document.getElementById('tx-tipo').value;

        if (!from || !to || !horas || !entregable) return alert("⚠️ Rellena todos los campos de la Transacción.");
        if (from === to) return alert("⚠️ El emisor y receptor no pueden ser el mismo Rol.");

        store.dispatch({
            type: 'ADD_TRANSACTION',
            payload: { projectId, tx: { from, to, horas, entregable, tipo } }
        });
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    // --- 4. OPERACIONES DEL MAPA (PINGS Y APROBACIONES) ---
    if (e.target.classList.contains('btn-ping')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const toRoleId = e.target.getAttribute('data-torole');
        
        const p = store.getState().projects.find(x => x.id === projectId);
        const asignacion = p.asignaciones?.find(a => a.roleId === toRoleId);
        
        if (!asignacion) return alert("⚠️ No hay usuario asignado a este Rol. Ve a Accounting -> Vincular Nodo.");

        store.dispatch({
            type: 'PING_TRANSACTION',
            payload: { projectId, txHash, userId: asignacion.userId }
        });
        document.getElementById('app').innerHTML = ProjectView.render(projectId);
    }

    if (e.target.classList.contains('btn-approve')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        
        if (confirm("¿Consolidar trabajo? Esto inyectará el Equity definitivamente en el Ledger.")) {
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

        // RBAC
        const session = state.session || { activeUserId: 'ecosystem-admin', role: 'admin' };
        const isAdmin = session.role === 'admin';

        const roles = project.roles.filter(r => !r.isArchived);
        const transactions = project.transactions || [];
        const resilience = store.calculateResilience(projectId);

        // 🎨 RENDERIZADO DEL MODAL ÁGIL (Se superpone si showAgileModal es true)
        let modalHTML = '';
        if (showAgileModal && isAdmin) {
            const rOrigin = roles.find(r => r.id === agileOriginId)?.name || 'Origen';
            const rDest = roles.find(r => r.id === agileDestinationId)?.name || 'Destino';
            
            modalHTML = `
                <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                    <div class="panel" style="width: 400px; border-color: var(--accent-blue); box-shadow: 0 10px 30px rgba(88,166,255,0.2);">
                        <h3 style="margin-top: 0; color: var(--accent-blue);">⚡ Nueva Transacción de Valor</h3>
                        <p class="text-small text-muted" style="margin-bottom: 20px;">
                            Flujo desde <b style="color:var(--accent-green);">${rOrigin}</b> hacia <b style="color:var(--accent-purple);">${rDest}</b>
                        </p>

                        <label class="form-label">Entregable (PoW):</label>
                        <input type="text" id="agile-entregable" class="form-control" placeholder="Ej: Diseño de Interfaz">
                        
                        <div style="display: flex; gap: 15px;">
                            <div style="flex: 1;">
                                <label class="form-label">Horas (Slicing Pie):</label>
                                <input type="number" step="0.5" id="agile-horas" class="form-control" placeholder="Ej: 2.5">
                            </div>
                            <div style="flex: 1;">
                                <label class="form-label">Tipo:</label>
                                <select id="agile-tipo" class="form-control">
                                    <option value="tangible">Tangible</option>
                                    <option value="intangible">Fricción / Review</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button id="btn-agile-cancel" data-pid="${projectId}" class="btn btn-secondary" style="flex: 1;">Cancelar</button>
                            <button id="btn-agile-save" data-pid="${projectId}" class="btn btn-primary" style="flex: 1;">Sellar Transacción</button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            ${modalHTML}
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
                                Mapeo de Roles, Transacciones y Entregables del ecosistema.
                            </p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            ${isAdmin ? `
                                <button class="btn btn-outline" onclick="location.hash='#/project/${projectId}/edit'">⚙️ Ontología</button>
                                <button class="btn btn-primary" onclick="location.hash='#/project/${projectId}/accounting'">💰 Contabilidad</button>
                            ` : `
                                <button class="btn btn-primary" onclick="location.hash='#/user-dashboard'">Mi Bandeja de Pings</button>
                            `}
                        </div>
                    </div>
                </header>

                <section class="panel-surface" style="margin-bottom: 25px; border: 1px dashed var(--border-color); background: rgba(0,0,0,0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4 style="margin: 0; color: var(--text-muted);">Nodos del Sistema</h4>
                        ${isAdmin ? `
                            <span style="font-size: 0.75rem; color: var(--accent-blue);">
                                ${!agileOriginId ? 'Paso 1: Clic en el Rol Emisor' : 'Paso 2: Clic en el Rol Receptor'}
                            </span>
                        ` : ''}
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
                        ${roles.map(r => {
                            let borderStyle = '1px solid var(--border-color)';
                            let bgStyle = 'var(--bg-panel)';
                            if (r.id === agileOriginId) {
                                borderStyle = '2px solid var(--accent-green)';
                                bgStyle = 'rgba(35, 134, 54, 0.1)';
                            }
                            
                            return `
                                <div class="node-bubble" data-id="${r.id}" data-pid="${projectId}" 
                                     style="background: ${bgStyle}; border: ${borderStyle}; padding: 10px 20px; border-radius: 30px; 
                                            cursor: ${isAdmin ? 'pointer' : 'default'}; transition: 0.2s; user-select: none; text-align: center;"
                                     ${isAdmin ? `onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"` : ''}>
                                    <div style="font-weight: bold; color: var(--text-heading); font-size: 0.9rem;">${r.name}</div>
                                    <div style="font-size: 0.65rem; color: var(--text-muted);">${r.levelId}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </section>

                <div class="grid-layout" style="${isAdmin ? 'grid-template-columns: 2fr 1fr;' : 'grid-template-columns: 1fr; max-width: 1000px; margin: 0 auto;'}">
                    
                    <main>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                                📉 Transacciones Secuenciadas
                                <span style="font-size: 0.75rem; font-weight: normal; background: var(--bg-surface); padding: 2px 8px; border-radius: 12px; border: 1px solid var(--border-color);">
                                    Salud: <b style="color: ${resilience > 50 ? 'var(--accent-green)' : 'var(--accent-red)'};">${resilience}%</b>
                                </span>
                            </h3>
                        </div>

                        ${transactions.length === 0 ? `
                            <div class="panel-surface text-center" style="padding: 40px; border-style: dashed;">
                                <div style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px;">🕸️</div>
                                <h4 style="color: var(--text-muted); margin: 0;">No hay flujos de valor mapeados</h4>
                            </div>
                        ` : `
                            <div class="list-group">
                                ${transactions.slice().reverse().map((tx, index) => {
                                    const rFrom = roles.find(r => r.id === tx.from);
                                    const rTo = roles.find(r => r.id === tx.to);
                                    
                                    let statusUI = '';
                                    let actionBtn = '';

                                    if (tx.status === 'theoretical') {
                                        statusUI = `<span style="color: var(--text-muted); font-size: 0.8rem;">📦 Teórico</span>`;
                                        if (isAdmin) actionBtn = `<button class="btn btn-outline btn-ping text-small" style="padding: 4px 10px;" data-hash="${tx.hash}" data-pid="${project.id}" data-torole="${tx.to}">Enviar Ping ⚡</button>`;
                                    } else if (tx.status === 'pinged') {
                                        statusUI = `<span style="color: var(--accent-purple); font-size: 0.8rem; font-weight: bold;">⏳ Pendiente de Trabajo</span>`;
                                    } else if (tx.status === 'reported') {
                                        statusUI = `<span style="color: var(--accent-blue); font-size: 0.8rem; font-weight: bold;">📝 Reporte (PoW) Recibido</span>`;
                                        if (isAdmin) actionBtn = `<button class="btn btn-primary btn-approve text-small" style="padding: 4px 10px;" data-hash="${tx.hash}" data-pid="${project.id}">Aprobar y Sellar 💾</button>`;
                                    } else if (tx.status === 'consolidated') {
                                        statusUI = `<span style="color: var(--accent-green); font-size: 0.8rem; font-weight: bold;">✅ Consolidado en Ledger</span>`;
                                    }

                                    return `
                                    <div class="panel-surface" style="margin-bottom: 12px; border-left: 4px solid ${tx.status === 'consolidated' ? 'var(--accent-green)' : 'var(--accent-blue)'};">
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                            <div>
                                                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05rem; margin-bottom: 4px;">Transacción ${transactions.length - index}</div>
                                                <h4 style="margin: 0; color: var(--text-heading); font-size: 1.1rem;">${tx.entregable}</h4>
                                            </div>
                                            <div style="text-align: right;">
                                                <div style="font-family: monospace; font-size: 0.75rem; color: var(--text-muted); background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px;">${tx.hash.substring(0,8)}</div>
                                            </div>
                                        </div>

                                        <div style="display: flex; align-items: center; gap: 15px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                                            <div style="flex: 1; text-align: right;">
                                                <div style="font-size: 0.8rem; font-weight: bold; color: var(--text-main);">${rFrom?.name || 'Borrado'}</div>
                                            </div>
                                            <div style="color: var(--accent-blue); font-size: 1.2rem;">⟶</div>
                                            <div style="flex: 1; text-align: left;">
                                                <div style="font-size: 0.8rem; font-weight: bold; color: var(--text-main);">${rTo?.name || 'Borrado'}</div>
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
                                            <div>${actionBtn}</div>
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
                                <h3 style="margin-top: 0; color: var(--accent-blue);">⌨️ Mapeo Manual</h3>
                                <p class="text-small text-muted">Añade Transacciones directamente (Atajos de teclado habilitados).</p>
                                
                                <label class="form-label">Rol Emisor:</label>
                                <select id="tx-from" class="form-control">
                                    <option value="">Selecciona nodo...</option>
                                    ${roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
                                </select>
                                
                                <label class="form-label">Rol Receptor:</label>
                                <select id="tx-to" class="form-control">
                                    <option value="">Selecciona nodo...</option>
                                    ${roles.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
                                </select>

                                <label class="form-label">Entregable:</label>
                                <input type="text" id="tx-entregable" class="form-control" placeholder="Ej: Auditoría">
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                    <div>
                                        <label class="form-label">Slicing (h):</label>
                                        <input type="number" step="0.5" id="tx-horas" class="form-control" placeholder="2.5">
                                    </div>
                                    <div>
                                        <label class="form-label">Tipo:</label>
                                        <select id="tx-tipo" class="form-control">
                                            <option value="tangible">Tangible</option>
                                            <option value="intangible">Intangible</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <button id="btn-add-tx" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-top: 15px;">Añadir Transacción</button>
                            </div>
                        </aside>
                    ` : ''}

                </div>
            </div>
        `;
    }
};
