import { store } from '../core/store.js';

// 🧠 MEMORIA DE SESIÓN LOCAL (Para recordar el último usuario y rol usado)
let memoryUserId = null;
let memoryRoleId = null;

// 🛡️ EVENTOS REACTIVOS (Formularios Dinámicos)
document.addEventListener('change', (e) => {
    // Si cambiamos el usuario en el formulario de registro, actualizamos la vista para filtrar sus roles
    if (e.target.id === 'ldg-user') {
        memoryUserId = e.target.value;
        memoryRoleId = null; // Reseteamos el rol al cambiar de usuario
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
    }
    
    // Si cambiamos el rol, actualizamos para pre-cargar el receptor
    if (e.target.id === 'ldg-role') {
        memoryRoleId = e.target.value;
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
    }
});

// 🛡️ EVENTOS DE CONTABILIDAD
document.addEventListener('click', (e) => {
    // 1. Añadir Persona al Equipo
    if (e.target.id === 'btn-add-user') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('new-user-name').value;
        if (!name) return alert("Indica el nombre del contribuidor.");
        
        store.dispatch({ type: 'ADD_USER', payload: { projectId, name } });
        document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
    }

    // 2. Asignar Rol a Persona
    if (e.target.id === 'btn-assign-role') {
        const projectId = e.target.getAttribute('data-pid');
        const userId = document.getElementById('assign-user-id').value;
        const roleId = document.getElementById('assign-role-id').value;
        
        if (!userId || !roleId) return alert("Selecciona un usuario y un rol.");
        
        store.dispatch({ type: 'ASSIGN_USER_ROLE', payload: { projectId, userId, roleId } });
        
        // Si justo asignamos un rol al usuario que tenemos en memoria, forzamos la actualización de su dropdown
        if (userId === memoryUserId) memoryRoleId = roleId; 
        document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
    }

    // 3. Registrar Aportación de Valor (Ledger / Slicing Pie)
    if (e.target.id === 'btn-add-ledger') {
        const projectId = e.target.getAttribute('data-pid');
        const userId = document.getElementById('ldg-user').value;
        const roleId = document.getElementById('ldg-role').value;
        const receiverId = document.getElementById('ldg-receiver').value;
        const description = document.getElementById('ldg-desc').value;
        const horas = document.getElementById('ldg-horas').value;

        if (!userId || !roleId || !receiverId || !description || !horas) {
            return alert("Rellena todos los campos para registrar el valor. (Asegúrate de tener un rol asignado)");
        }

        store.dispatch({ 
            type: 'ADD_LEDGER_ENTRY', 
            payload: { projectId, userId, roleId, receiverId, description, horas } 
        });

        // Guardamos en memoria el usuario y rol que acaba de registrar para que siga precargado
        memoryUserId = userId;
        memoryRoleId = roleId;

        document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
    }
});

export const ProjectAccountingView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Proyecto no encontrado</h2></div>`;

        // Datos básicos
        const roles = project.roles || [];
        const activeRoles = roles.filter(r => !r.isArchived && r.id !== 'ecosistema');
        const users = project.usuarios || [];
        const asignaciones = project.asignaciones || [];
        const ledger = project.ledger || [];
        const transactions = project.transactions || []; // El Mapa de Valor

        // 🧮 CÁLCULO DEL CAP TABLE (SLICING PIE)
        const totalPie = ledger.reduce((acc, entry) => acc + entry.valorCongelado, 0);
        
        // Array de colores fijos para la tarta
        const pieColors = ['#58a6ff', '#a371f7', '#238636', '#d29922', '#f85149', '#3fb950', '#bc8cff', '#d1d5da'];

        const userStats = users.map((user, index) => {
            const userEntries = ledger.filter(l => l.userId === user.id);
            const userTotalValue = userEntries.reduce((sum, l) => sum + l.valorCongelado, 0);
            const rawOwnership = totalPie > 0 ? (userTotalValue / totalPie) * 100 : 0;
            const ownership = rawOwnership.toFixed(2);
            
            const userRoles = asignaciones
                .filter(a => a.userId === user.id)
                .map(a => {
                    const r = roles.find(r => r.id === a.roleId);
                    return r ? r.name : 'Rol Desconocido';
                });

            const color = pieColors[index % pieColors.length];

            return { ...user, userTotalValue, ownership, rawOwnership, userRoles, color };
        }).sort((a, b) => b.userTotalValue - a.userTotalValue);

        // 🎨 GENERADOR DEL GRÁFICO DE TARTA CSS (Conic Gradient)
        let pieGradient = 'conic-gradient(';
        let cumulativePercent = 0;
        
        if (totalPie === 0) {
            pieGradient = 'conic-gradient(#30363d 0% 100%)';
        } else {
            userStats.forEach((u, i) => {
                const start = cumulativePercent;
                const end = cumulativePercent + u.rawOwnership;
                pieGradient += `${u.color} ${start}% ${end}%${i < userStats.length - 1 ? ', ' : ''}`;
                cumulativePercent = end;
            });
            pieGradient += ')';
        }

        // ⚙️ LÓGICA DE AUTOCOMPLETADO (UX MEJORADA)
        const currentUserId = memoryUserId || (users.length > 0 ? users[0].id : "");

        const userAssignedRoleIds = asignaciones.filter(a => a.userId === currentUserId).map(a => a.roleId);
        const assignedActiveRoles = activeRoles.filter(r => userAssignedRoleIds.includes(r.id));

        let currentRoleId = (memoryRoleId && userAssignedRoleIds.includes(memoryRoleId)) 
            ? memoryRoleId 
            : (assignedActiveRoles.length > 0 ? assignedActiveRoles[0].id : "");

        let defaultReceiverId = "";
        if (currentRoleId) {
            const outgoingTxs = transactions.filter(tx => tx.from === currentRoleId);
            if (outgoingTxs.length > 0) {
                defaultReceiverId = outgoingTxs[0].to;
            }
        }

        // GENERACIÓN DE OPCIONES HTML
        const userOptions = users.map(u => 
            `<option value="${u.id}" ${u.id === currentUserId ? 'selected' : ''}>${u.name}</option>`
        ).join('');
        
        const myRoleOptions = assignedActiveRoles.length > 0
            ? assignedActiveRoles.map(r => `<option value="${r.id}" ${r.id === currentRoleId ? 'selected' : ''}>${r.name} (${r.levelId})</option>`).join('')
            : `<option value="">-- Sin roles asignados --</option>`;

        const receiverOptions = activeRoles.map(r => 
            `<option value="${r.id}" ${r.id === defaultReceiverId ? 'selected' : ''}>${r.name} (${r.levelId})</option>`
        ).join('');

        const allActiveRoleOptions = activeRoles.map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('');

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1>💰 Contabilidad de Valor (Slicing Pie)</h1>
                        <p class="text-muted">Proyecto: <b class="text-accent">${project.nombre}</b> | Fondo Total Generado: <b style="color: var(--accent-green);">${totalPie.toLocaleString()} €</b></p>
                    </div>
                    <button class="btn btn-secondary" onclick="location.hash='#/project/${projectId}'">← Volver al Mapa</button>
                </header>

                <div class="grid-layout" style="grid-template-columns: 350px 1fr; gap: 30px;">
                    
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div class="panel">
                            <h3 class="text-small text-uppercase">1. Alta de Contribuidor</h3>
                            <div style="display: flex; gap: 10px;">
                                <input id="new-user-name" type="text" class="form-control" placeholder="Nombre (Ej: Laura)" style="margin-bottom:0;">
                                <button id="btn-add-user" data-pid="${projectId}" class="btn btn-primary">+</button>
                            </div>
                        </div>

                        <div class="panel">
                            <h3 class="text-small text-uppercase">2. Asignar Rol a Usuario</h3>
                            <p class="text-small text-muted" style="margin-bottom: 10px;">¿Qué sombreros lleva cada persona?</p>
                            
                            <select id="assign-user-id" class="form-control text-small">
                                <option value="">Selecciona Usuario...</option>
                                ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
                            </select>
                            
                            <select id="assign-role-id" class="form-control text-small">
                                <option value="">Selecciona Rol (Activo)...</option>
                                ${allActiveRoleOptions}
                            </select>
                            
                            <button id="btn-assign-role" data-pid="${projectId}" class="btn btn-secondary btn-block">Asignar Rol</button>
                        </div>

                        <div class="panel" style="border-color: var(--accent-green);">
                            <h3 class="text-small text-uppercase" style="color: var(--accent-green);">3. Registrar Aportación</h3>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Inyecta valor al Slicing Pie.</p>
                            
                            <label class="form-label">¿Quién aportó?</label>
                            <select id="ldg-user" data-pid="${projectId}" class="form-control text-small">
                                ${users.length === 0 ? '<option value="">Crea un usuario primero</option>' : userOptions}
                            </select>
                            
                            <label class="form-label">¿Actuando en qué Rol?</label>
                            <select id="ldg-role" data-pid="${projectId}" class="form-control text-small" style="border-color: var(--accent-purple);">
                                ${myRoleOptions}
                            </select>
                            
                            <label class="form-label">¿A qué Rol lo entregó?</label>
                            <select id="ldg-receiver" class="form-control text-small" style="border-color: var(--accent-blue);">
                                ${receiverOptions}
                            </select>
                            <p class="text-muted" style="font-size: 0.65rem; margin-top: -8px; margin-bottom: 10px;">*Receptor sugerido según el Mapa de Valor.</p>
                            
                            <label class="form-label">¿Qué se entregó? (Descripción)</label>
                            <input id="ldg-desc" type="text" class="form-control text-small" placeholder="Ej: Backend Login Completado">
                            
                            <label class="form-label">Horas Invertidas</label>
                            <input id="ldg-horas" type="number" step="0.5" class="form-control text-small" placeholder="Ej: 4">
                            
                            <button id="btn-add-ledger" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-top: 10px;">
                                💾 Registrar en Libro Mayor
                            </button>
                        </div>
                    </aside>

                    <main style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <section class="panel" style="border-color: var(--accent-purple); background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(163, 113, 247, 0.05) 100%);">
                            <h3 style="color: var(--accent-purple); margin-top: 0; margin-bottom: 20px;">📊 Cap Table (Reparto de Acciones)</h3>
                            
                            ${users.length === 0 ? `<p class="text-muted">Añade usuarios para ver el Cap Table.</p>` : `
                                
                                <div style="display: flex; gap: 30px; align-items: center; margin-bottom: 30px;">
                                    
                                    <div style="
                                        width: 150px; 
                                        height: 150px; 
                                        border-radius: 50%; 
                                        background: ${pieGradient};
                                        box-shadow: 0 0 20px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.8);
                                        flex-shrink: 0;
                                    "></div>
                                    
                                    <div style="flex-grow: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px;">
                                        ${userStats.map(u => `
                                            <div style="display: flex; align-items: center; gap: 8px;">
                                                <div style="width: 12px; height: 12px; border-radius: 3px; background: ${u.color};"></div>
                                                <div>
                                                    <div style="font-size: 0.8rem; font-weight: bold; color: var(--text-heading);">${u.name}</div>
                                                    <div style="font-size: 0.7rem; color: var(--text-muted);">${u.ownership}%</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>

                                <div style="overflow-x: auto;">
                                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                                        <thead>
                                            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); text-align: left;">
                                                <th style="padding: 10px;">Contribuidor</th>
                                                <th style="padding: 10px;">Roles Asignados</th>
                                                <th style="padding: 10px; text-align: right;">Valor Generado (€)</th>
                                                <th style="padding: 10px; text-align: right;">% Equity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${userStats.map(u => `
                                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                                    <td style="padding: 12px 10px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                                                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${u.color};"></div>
                                                        ${u.name}
                                                    </td>
                                                    <td style="padding: 12px 10px; font-size: 0.8rem; color: var(--accent-blue);">${u.userRoles.length > 0 ? u.userRoles.join(', ') : '<i>Sin rol</i>'}</td>
                                                    <td style="padding: 12px 10px; text-align: right;">${u.userTotalValue.toLocaleString()} €</td>
                                                    <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: var(--accent-green);">${u.ownership} %</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `}
                        </section>

                        <section class="panel">
                            <h3 style="margin-top: 0;">📖 Historial del Libro Mayor</h3>
                            <p class="text-small text-muted">Registro inmutable de aportaciones de valor. Muestra roles históricos incluso si fueron archivados.</p>
                            
                            ${ledger.length === 0 ? `<p class="text-muted">El libro mayor está vacío. Registra trabajo para empezar.</p>` : `
                                <div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
                                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                                        <thead style="position: sticky; top: 0; background: var(--bg-panel); z-index: 1;">
                                            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); text-align: left;">
                                                <th style="padding: 10px;">Fecha</th>
                                                <th style="padding: 10px;">Usuario</th>
                                                <th style="padding: 10px;">Transacción (Rol -> Rol)</th>
                                                <th style="padding: 10px;">Entregable</th>
                                                <th style="padding: 10px; text-align: center;">Horas</th>
                                                <th style="padding: 10px; text-align: right;">Pie (€)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${ledger.slice().reverse().map(l => {
                                                const date = new Date(l.timestamp).toLocaleDateString();
                                                const userName = users.find(u => u.id === l.userId)?.name || 'Desconocido';
                                                
                                                // 🛡️ REGLA HISTÓRICA: Buscamos en TODOS los roles, no solo en los activos.
                                                const roleName = roles.find(r => r.id === l.roleId)?.name || '<del>Rol Eliminado</del>';
                                                const receiverName = roles.find(r => r.id === l.receiverId)?.name || '<del>Rol Eliminado</del>';

                                                return `
                                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                                    <td style="padding: 10px; color: var(--text-muted);">${date}</td>
                                                    <td style="padding: 10px; font-weight: bold;">${userName}</td>
                                                    <td style="padding: 10px; color: var(--accent-blue);">[${roleName}] → [${receiverName}]</td>
                                                    <td style="padding: 10px;">${l.description}</td>
                                                    <td style="padding: 10px; text-align: center;">${l.horas}</td>
                                                    <td style="padding: 10px; text-align: right; color: var(--accent-green);">+${l.valorCongelado}</td>
                                                </tr>
                                                `;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `}
                        </section>
                    </main>
                </div>
            </div>
        `;
    }
};
