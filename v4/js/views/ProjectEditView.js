import { store } from '../core/store.js';

document.addEventListener('click', (e) => {
    // 1. Añadir Rol a la Ontología
    if (e.target.id === 'btn-add-role') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('new-role-name').value.trim();
        const levelId = document.getElementById('new-role-level').value;
        const multiplier = document.getElementById('new-role-multiplier').value;

        if (!name) return alert("⚠️ Ponle un nombre al rol.");

        store.dispatch({
            type: 'ADD_ROLE',
            payload: { projectId, role: { id: 'role-' + Date.now(), name, levelId, multiplier: parseFloat(multiplier) || 1 } }
        });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // 2. Archivar/Desarchivar Rol
    if (e.target.classList.contains('btn-archive-role')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-role');
        store.dispatch({ type: 'TOGGLE_ROLE_ARCHIVE', payload: { projectId, roleId } });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // 3. Guardar Modelo de Tokenomics (La Cosecha)
    if (e.target.id === 'btn-save-tokenomics') {
        const projectId = e.target.getAttribute('data-pid');
        const preset = document.getElementById('tokenomics-preset').value;
        
        store.dispatch({
            type: 'UPDATE_PROJECT_CONFIG',
            payload: { projectId, config: { tokenomics: preset } }
        });
        alert("✅ Modelo de Tokenomics actualizado.");
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Red no encontrada</h2></div>`;

        // Seguridad: Solo el Admin (Owner) puede editar la configuración
        const session = state.session || { activeUserId: 'ecosystem-admin', role: 'admin' };
        if (session.role !== 'admin') {
            return `<div class="container text-center" style="padding-top:10vh;"><h3>⛔ Acceso Denegado</h3><p>La configuración del Tokenomics y la Ontología es exclusiva del Owner.</p></div>`;
        }

        const esProyecto = project.tipo !== 'ecosystem';
        const tipoLabel = esProyecto ? '🎯 PROYECTO' : '🌍 ECOSISTEMA';
        const tipoColor = esProyecto ? 'var(--accent-blue)' : 'var(--accent-gold)';

        const activeRoles = project.roles.filter(r => !r.isArchived);
        const archivedRoles = project.roles.filter(r => r.isArchived);
        
        // Cargar el tokenomics actual o uno por defecto
        const currentTokenomics = project.config?.tokenomics || 'startup';

        // 🚀 BREADCRUMBS Y TOOLBAR GLOBAL
        setTimeout(() => window.setNavbar(
            [
                { label: '🏠 Hub', hash: '#/' },
                { label: project.nombre, hash: `#/project/${projectId}` },
                { label: '⚙️ Configuración y Tokenomics' }
            ], 
            `<button class="btn btn-outline text-small" onclick="location.hash='#/project/${projectId}'">Volver al Panel</button>`,
            `<span class="badge" style="background: rgba(255,255,255,0.05); color: ${tipoColor}; border: 1px solid ${tipoColor};">${tipoLabel}</span>`
        ), 0);

        return `
            <div class="container fade-in">
                
                <div class="panel-surface" style="margin-bottom: 30px; border-left: 4px solid ${tipoColor}; background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 100%);">
                    <h2 style="margin: 0; display: flex; align-items: center; gap: 15px;">
                        Configuración de la Red
                    </h2>
                    <p class="text-muted" style="margin-top: 5px; font-size: 0.9rem;">
                        Estás configurando las reglas base de <b>${project.nombre}</b>. Define cómo se repartirá la cosecha (Slicing Pie) y qué roles conforman el mapa de valor (Ontología).
                    </p>
                </div>

                <div class="grid-layout" style="grid-template-columns: 1fr 1fr; gap: 30px;">
                    
                    <main>
                        <h3 style="margin-bottom: 20px; color: var(--accent-green); display: flex; align-items: center; gap: 10px;">
                            🍰 Modelo de Recompensa (Tokenomics)
                        </h3>
                        
                        <div class="panel" style="border-color: var(--accent-green);">
                            <p class="text-small text-muted" style="margin-bottom: 20px;">
                                El Slicing Pie calcula el valor aportado en el Ledger. Elige cómo ese valor se traduce en <b>La Cosecha</b> real (Equity, Tokens o Cash) cuando la red genera beneficios.
                            </p>
                            
                            <label class="form-label">Selecciona el Preset Operativo:</label>
                            <select id="tokenomics-preset" class="form-control" style="font-size: 1rem; padding: 12px; border-color: var(--accent-green);">
                                <option value="startup" ${currentTokenomics === 'startup' ? 'selected' : ''}>🚀 The Startup Slicer (100% Equity Dinámico)</option>
                                <option value="dao" ${currentTokenomics === 'dao' ? 'selected' : ''}>🌍 Comunidad Web3 / DAO (20% Core / 80% Comunidad)</option>
                                <option value="profit-share" ${currentTokenomics === 'profit-share' ? 'selected' : ''}>🏢 Profit-Share Pyme (Reparto de Dividendos / Bonus)</option>
                            </select>

                            <div style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; margin-top: 15px; margin-bottom: 20px; font-size: 0.85rem; border-left: 2px solid var(--accent-green);">
                                ${currentTokenomics === 'startup' ? `<b>🚀 Dinámica Startup:</b> Todo el Equity de la compañía es líquido y se recalcula diariamente basado en el Ledger. Ideal para bootstrapping sin caja.` : ''}
                                ${currentTokenomics === 'dao' ? `<b>🌍 Dinámica DAO:</b> Se reserva un % fijo para los fundadores. El resto se emite en Tokens a la comunidad en proporción a los Slices ganados resolviendo Pings.` : ''}
                                ${currentTokenomics === 'profit-share' ? `<b>🏢 Profit-Share:</b> Las acciones de la empresa no cambian. Se utiliza el Ledger de Slices para repartir un bote económico (Bonus anual o dividendos) de forma 100% meritocrática.` : ''}
                            </div>

                            <button id="btn-save-tokenomics" data-pid="${projectId}" class="btn btn-primary btn-block">Sellar Modelo Económico</button>
                        </div>
                    </main>

                    <aside>
                        <h3 style="margin-bottom: 20px; color: var(--accent-blue); display: flex; align-items: center; gap: 10px;">
                            ⚙️ Ontología VNA (Roles)
                        </h3>

                        <div class="panel" style="margin-bottom: 20px; border-color: var(--accent-blue);">
                            <h4 style="margin-top: 0; color: var(--accent-blue);">Crear Nuevo Nodo Teórico</h4>
                            <p class="text-small text-muted">Añade roles al ecosistema y define su riesgo (Multiplicador de Slicing Pie).</p>
                            
                            <label class="form-label">Nombre del Rol:</label>
                            <input type="text" id="new-role-name" class="form-control" placeholder="Ej: Auditor Smart Contracts">
                            
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
                                <div>
                                    <label class="form-label">Nivel VNA (Casteller):</label>
                                    <select id="new-role-level" class="form-control">
                                        <option value="@anxaneta">👑 @anxaneta (Estrategia)</option>
                                        <option value="@aixecador">👁️ @aixecador (Táctico)</option>
                                        <option value="@dosos">⚖️ @dosos (QA / Auditor)</option>
                                        <option value="@baixos">🛠️ @baixos (Ejecución)</option>
                                        <option value="@pinya">🧱 @pinya (Soporte)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Riesgo (X):</label>
                                    <input type="number" step="0.1" id="new-role-multiplier" class="form-control" placeholder="1.0" value="1.0" title="Multiplicador de Slicing Pie">
                                </div>
                            </div>
                            
                            <button id="btn-add-role" data-pid="${projectId}" class="btn btn-outline btn-block" style="margin-top: 10px; border-color: var(--accent-blue); color: var(--accent-blue);">Inyectar Rol a la Red</button>
                        </div>

                        <h4 style="margin-bottom: 10px;">Roles Activos en la Red</h4>
                        ${activeRoles.length === 0 ? '<p class="text-muted text-small">No hay roles activos.</p>' : `
                            <div class="list-group" style="max-height: 300px; overflow-y: auto; padding-right: 5px;">
                                ${activeRoles.map(r => `
                                    <div class="panel-surface" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 10px;">
                                        <div>
                                            <b style="color: var(--text-heading); font-size: 0.9rem;">${r.name}</b>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">${r.levelId} | Mul: ${r.multiplier}x</div>
                                        </div>
                                        <button class="btn btn-secondary text-small btn-archive-role" data-pid="${projectId}" data-role="${r.id}">Ocultar</button>
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
