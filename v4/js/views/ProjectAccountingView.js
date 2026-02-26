import { store } from '../core/store.js';

document.addEventListener('click', (e) => {
    // Vincular un Nodo Humano (Usuario) a un Rol
    if (e.target.id === 'btn-assign-role') {
        const projectId = e.target.getAttribute('data-pid');
        const userId = document.getElementById('assign-user').value;
        const roleId = document.getElementById('assign-role').value;

        if (!userId || !roleId) return alert("⚠️ Selecciona un Usuario y un Rol de la Ontología.");

        store.dispatch({
            type: 'ASSIGN_USER_ROLE',
            payload: { projectId, userId, roleId }
        });
        document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
    }
    
    // Crear un nuevo Usuario (Nodo) en el pool
    if (e.target.id === 'btn-create-user') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('new-user-name').value;
        const wallet = document.getElementById('new-user-wallet').value;
        
        if (!name) return alert("⚠️ El usuario debe tener un nombre.");

        try {
            store.dispatch({
                type: 'ADD_USER',
                payload: { projectId, name, walletOrSocial: wallet }
            });
            document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
        } catch (err) {
            alert("❌ " + err.message);
        }
    }
});

export const ProjectAccountingView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Proyecto no encontrado</h2></div>`;

        // Solo Admin / PO puede ver la contabilidad global
        const session = state.session || { activeUserId: 'ecosystem-admin', role: 'admin' };
        if (session.role !== 'admin') {
            return `<div class="container text-center" style="padding-top:10vh;"><h3>⛔ Acceso Denegado</h3><p>La Contabilidad Global es exclusiva del Ecosystem Owner.</p></div>`;
        }

        const roles = project.roles.filter(r => !r.isArchived);
        const asignaciones = project.asignaciones || [];
        const ledger = project.ledger || [];

        // 🧠 CÁLCULO DE LA CAP TABLE (SLICING PIE)
        let capTable = {};
        let totalSlices = 0;

        ledger.forEach(l => {
            if (!capTable[l.userId]) {
                const userObj = state.globalUsers.find(u => u.id === l.userId);
                capTable[l.userId] = { name: userObj ? userObj.name : l.userId, slices: 0, color: `hsl(${Math.random() * 360}, 70%, 60%)` };
            }
            capTable[l.userId].slices += l.valorCongelado;
            totalSlices += l.valorCongelado;
        });

        // Convertir a array y ordenar por mayor equity
        let capTableArray = Object.keys(capTable).map(id => ({
            id, ...capTable[id],
            percentage: totalSlices > 0 ? ((capTable[id].slices / totalSlices) * 100).toFixed(2) : 0
        })).sort((a, b) => b.slices - a.slices);

        // Colores deterministas para los top usuarios para que no parpadeen
        const predefColors = ['var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-green)', 'var(--accent-gold)', 'var(--accent-red)'];
        capTableArray.forEach((u, i) => { if(i < 5) u.color = predefColors[i]; });

        // 🚀 BREADCRUMBS Y TOOLBAR
        setTimeout(() => window.setNavbar(
            [
                { label: '🏠 Hub', hash: '#/' },
                { label: project.nombre, hash: `#/project/${projectId}` },
                { label: '💰 Contabilidad de Valor' }
            ], 
            `<button class="btn btn-outline text-small" onclick="location.hash='#/project/${projectId}/map'">Ver Red de Valor</button>`,
            `<span class="badge" style="background: rgba(35,134,54,0.1); color: var(--accent-green); border: 1px solid var(--accent-green);">Total: ${totalSlices.toLocaleString()} Slices</span>`
        ), 0);

        return `
            <div class="container fade-in">
                <div class="panel-surface" style="margin-bottom: 30px; border-left: 4px solid var(--accent-green);">
                    <h3 style="margin-top:0; display:flex; justify-content:space-between;">
                        <span>🍰 Cap Table (Equity Dinámico)</span>
                        <span style="font-size:1.2rem; color:var(--accent-green);">${totalSlices.toLocaleString()} Slices Totales</span>
                    </h3>
                    
                    ${totalSlices === 0 ? `
                        <div class="text-center text-muted" style="padding: 20px;">Aún no hay Slices congelados. Sella entregables en el Dashboard.</div>
                    ` : `
                        <div style="width: 100%; height: 30px; border-radius: 15px; overflow: hidden; display: flex; margin-bottom: 20px; border: 1px solid var(--border-color);">
                            ${capTableArray.map(u => `
                                <div style="width: ${u.percentage}%; background-color: ${u.color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.7rem; overflow: hidden; transition: 0.3s;" title="${u.name}: ${u.percentage}%">
                                    ${u.percentage > 5 ? u.percentage + '%' : ''}
                                </div>
                            `).join('')}
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                            ${capTableArray.map(u => `
                                <div style="display: flex; align-items: center; gap: 10px; background: var(--bg-panel); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                                    <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${u.color};"></div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: bold; font-size: 0.9rem; color: var(--text-heading);">${u.name}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted);">${u.slices.toLocaleString()} Slices</div>
                                    </div>
                                    <div style="font-weight: bold; color: ${u.color};">${u.percentage}%</div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>

                <div class="grid-layout">
                    
                    <main>
                        <h3 style="margin-bottom: 20px;">👥 Gestión de Nodos (Usuarios)</h3>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="panel" style="border-color: var(--accent-purple);">
                                <h4 style="color: var(--accent-purple); margin-top: 0;">1. Crear Identidad</h4>
                                <p class="text-small text-muted">Añade a un humano a tu ecosistema.</p>
                                <label class="form-label">Nombre del Humano:</label>
                                <input type="text" id="new-user-name" class="form-control" placeholder="Ej: Laura García">
                                <label class="form-label">Wallet / Contacto (Opcional):</label>
                                <input type="text" id="new-user-wallet" class="form-control" placeholder="0x... o email">
                                <button id="btn-create-user" data-pid="${projectId}" class="btn btn-primary btn-block" style="background: var(--accent-purple); margin-top: 10px;">Crear Identidad</button>
                            </div>

                            <div class="panel" style="border-color: var(--accent-blue);">
                                <h4 style="color: var(--accent-blue); margin-top: 0;">2. Vincular a la Ontología</h4>
                                <p class="text-small text-muted">Conecta una identidad humana con un Rol teórico del VNA.</p>
                                <label class="form-label">Selecciona Humano (Identidad):</label>
                                <select id="assign-user" class="form-control">
                                    <option value="">Seleccionar...</option>
                                    ${state.globalUsers.map(u => `<option value="${u.id}">${u.name} (${u.id})</option>`).join('')}
                                </select>
                                <label class="form-label">Asignar al Rol Teórico:</label>
                                <select id="assign-role" class="form-control">
                                    <option value="">Seleccionar rol...</option>
                                    ${roles.map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('')}
                                </select>
                                <button id="btn-assign-role" data-pid="${projectId}" class="btn btn-primary btn-block" style="background: var(--accent-blue); margin-top: 10px;">Vincular Nodo</button>
                            </div>
                        </div>

                        <h4 style="margin-top: 30px; margin-bottom: 15px;">Nodos Vinculados Actuales</h4>
                        ${asignaciones.length === 0 ? '<p class="text-muted text-small">No hay humanos asignados a los roles del ecosistema.</p>' : `
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                ${asignaciones.map(a => {
                                    const user = state.globalUsers.find(u => u.id === a.userId);
                                    const role = roles.find(r => r.id === a.roleId);
                                    if(!role) return '';
                                    return `
                                    <div class="panel-surface" style="display: flex; justify-content: space-between; align-items: center; padding: 12px;">
                                        <div>
                                            <b style="color: var(--text-heading);">${user ? user.name : a.userId}</b>
                                            <span class="text-small text-muted" style="margin-left: 10px; font-family: monospace;">${a.userId}</span>
                                        </div>
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <span style="color: var(--accent-blue);">⟶</span>
                                            <span class="badge" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);">${role.name} (${role.levelId})</span>
                                        </div>
                                    </div>`;
                                }).join('')}
                            </div>
                        `}
                    </main>

                    <aside>
                        <h3 style="margin-bottom: 20px;">📜 Libro Mayor (Ledger)</h3>
                        <p class="text-small text-muted">Historial inmutable de valor consolidado. Cada entrada representa *Equity* sellado.</p>
                        
                        ${ledger.length === 0 ? `
                            <div class="panel text-center" style="padding: 20px;">
                                <p class="text-muted">El Ledger está vacío.</p>
                            </div>
                        ` : `
                            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 600px; overflow-y: auto; padding-right: 5px;">
                                ${ledger.slice().reverse().map(l => {
                                    const user = state.globalUsers.find(u => u.id === l.userId);
                                    const role = project.roles.find(r => r.id === l.roleId);
                                    const date = new Date(l.timestamp).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                    
                                    return `
                                    <div class="panel-surface" style="padding: 12px; border-left: 3px solid var(--accent-green);">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                            <b style="font-size: 0.85rem;">${user ? user.name : l.userId}</b>
                                            <span style="font-size: 0.75rem; color: var(--accent-green); font-weight: bold;">+${l.valorCongelado.toLocaleString()} Slices</span>
                                        </div>
                                        <div style="font-size: 0.75rem; color: var(--text-heading); margin-bottom: 4px;">${l.description}</div>
                                        <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted);">
                                            <span>Rol: ${role ? role.name : 'Desc.'} | PoW: ${l.horas}h</span>
                                            <span>${date}</span>
                                        </div>
                                    </div>`;
                                }).join('')}
                            </div>
                        `}
                    </aside>

                </div>
            </div>
        `;
    }
};
