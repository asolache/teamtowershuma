import { store } from '../core/store.js';

document.addEventListener('click', (e) => {
    // 1. GUARDAR IDENTIDAD Y CONTEXTO (SYSTEM PROMPT)
    if (e.target.id === 'btn-save-project-info') {
        const projectId = e.target.getAttribute('data-pid');
        const nombre = document.getElementById('edit-proj-name').value.trim();
        const sector = document.getElementById('edit-proj-sector').value;
        const prompt = document.getElementById('edit-proj-prompt').value.trim();

        if (!nombre) return alert("⚠️ El nombre de la red no puede estar vacío.");

        store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: { projectId, updates: { nombre, sector, prompt } }
        });
        
        const btn = document.getElementById('btn-save-project-info');
        btn.innerHTML = '✅ Identidad Guardada';
        btn.style.backgroundColor = 'var(--accent-blue)';
        btn.style.color = '#fff';
        
        setTimeout(() => document.getElementById('app').innerHTML = ProjectEditView.render(projectId), 1000);
    }

    // 2. GUARDAR MODELO DE TOKENOMICS (LA COSECHA)
    if (e.target.id === 'btn-save-tokenomics') {
        const projectId = e.target.getAttribute('data-pid');
        const preset = document.getElementById('tokenomics-preset').value;
        
        store.dispatch({
            type: 'UPDATE_PROJECT_CONFIG',
            payload: { projectId, config: { tokenomics: preset } }
        });
        
        const btn = document.getElementById('btn-save-tokenomics');
        btn.innerHTML = '✅ Tokenomics Sellado';
        setTimeout(() => document.getElementById('app').innerHTML = ProjectEditView.render(projectId), 1000);
    }

    // 3. INYECTAR ROL A LA ONTOLOGÍA
    if (e.target.id === 'btn-add-role') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('new-role-name').value.trim();
        const levelId = document.getElementById('new-role-level').value;
        const multiplier = document.getElementById('new-role-multiplier').value;

        if (!name) return alert("⚠️ Define un nombre para el nodo teórico.");

        store.dispatch({
            type: 'ADD_ROLE',
            payload: { projectId, role: { id: 'role-' + Date.now(), name, levelId, multiplier: parseFloat(multiplier) || 1 } }
        });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // 4. OCULTAR / MOSTRAR ROL
    if (e.target.classList.contains('btn-archive-role')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-role');
        store.dispatch({ type: 'TOGGLE_ROLE_ARCHIVE', payload: { projectId, roleId } });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Red no encontrada</h2></div>`;

        // Seguridad
        const session = state.session || { activeUserId: 'ecosystem-admin', role: 'admin' };
        if (session.role !== 'admin') {
            return `<div class="container text-center" style="padding-top:10vh;"><h3>⛔ Acceso Denegado</h3><p>Solo el Ecosystem Owner puede modificar la topología de la red.</p></div>`;
        }

        const esProyecto = project.tipo !== 'ecosystem';
        const tipoLabel = esProyecto ? '🎯 PROYECTO (Finito)' : '🌍 ECOSISTEMA (Continuo)';
        const tipoColor = esProyecto ? 'var(--accent-blue)' : 'var(--accent-gold)';

        const activeRoles = project.roles.filter(r => !r.isArchived);
        const currentTokenomics = project.config?.tokenomics || 'startup';
        const projectPrompt = project.prompt || '';

        // 🚀 BREADCRUMBS Y TOOLBAR GLOBAL
        setTimeout(() => window.setNavbar(
            [
                { label: '🏠 Hub', hash: '#/' },
                { label: project.nombre, hash: `#/project/${projectId}` },
                { label: '⚙️ Configuración' }
            ], 
            `<button class="btn btn-outline text-small" onclick="location.hash='#/project/${projectId}'">Volver al Panel de Control</button>`,
            `<span class="badge" style="background: rgba(255,255,255,0.05); color: ${tipoColor}; border: 1px solid ${tipoColor};">${tipoLabel}</span>`
        ), 0);

        return `
            <div class="container fade-in">
                
                <div class="panel-surface" style="margin-bottom: 30px; border-left: 4px solid var(--accent-purple); background: linear-gradient(135deg, rgba(163, 113, 247, 0.05) 0%, transparent 100%);">
                    <h2 style="margin: 0; display: flex; align-items: center; gap: 15px; color: var(--accent-purple);">
                        Sala de Máquinas: ${project.nombre}
                    </h2>
                    <p class="text-muted" style="margin-top: 5px; font-size: 0.9rem;">
                        Configura el alma de la red (Identidad, Contexto IA y Tokenomics) y su cuerpo (Ontología de Roles y Multiplicadores de Riesgo).
                    </p>
                </div>

                <div class="grid-layout" style="grid-template-columns: 1fr 1fr; gap: 30px;">
                    
                    <main style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div class="panel" style="border-color: var(--accent-blue);">
                            <h3 style="margin-top: 0; color: var(--accent-blue);">1. Identidad y Contexto IA</h3>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Define qué es esta red y dale un contexto a los Agentes IA que operen en ella.</p>
                            
                            <label class="form-label">Nombre de la Red:</label>
                            <input type="text" id="edit-proj-name" class="form-control" value="${project.nombre}" placeholder="Ej: Proyecto TeamTowers">
                            
                            <label class="form-label">Sector Base:</label>
                            <select id="edit-proj-sector" class="form-control">
                                <option value="${project.sector || 'general'}">${(project.sector || 'General').toUpperCase()}</option>
                                ${Object.keys(state.ontology?.sectores || {}).map(s => s !== project.sector ? `<option value="${s}">${s.toUpperCase()}</option>` : '').join('')}
                            </select>

                            <label class="form-label" style="margin-top: 15px; display:flex; justify-content:space-between;">
                                <span>System Prompt (Contexto Local):</span>
                                <span class="badge" style="background:var(--bg-surface); color:var(--text-muted); border:1px solid var(--border-color);">🤖 IA</span>
                            </label>
                            <textarea id="edit-proj-prompt" class="form-control" style="height: 120px; font-family: 'Cascadia Code', monospace; font-size: 0.8rem; background: rgba(0,0,0,0.1);" placeholder="Ej: Esta red se dedica al desarrollo de software Web3. El tono debe ser técnico y meritocrático...">${projectPrompt}</textarea>

                            <button id="btn-save-project-info" data-pid="${projectId}" class="btn btn-outline btn-block" style="border-color: var(--accent-blue); color: var(--accent-blue); margin-top: 10px;">💾 Guardar Identidad</button>
                        </div>

                        <div class="panel" style="border-color: var(--accent-green);">
                            <h3 style="margin-top: 0; color: var(--accent-green);">2. Modelo de Recompensa (Tokenomics)</h3>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">El Slicing Pie audita el valor. Elige cómo ese valor se convierte en <b>Equity o Cash</b> (La Cosecha).</p>
                            
                            <label class="form-label">Selecciona el Preset Operativo:</label>
                            <select id="tokenomics-preset" class="form-control" style="font-weight: bold; border-color: var(--accent-green);">
                                <option value="startup" ${currentTokenomics === 'startup' ? 'selected' : ''}>🚀 Startup Slicer (100% Equity Dinámico)</option>
                                <option value="dao" ${currentTokenomics === 'dao' ? 'selected' : ''}>🌍 Comunidad Web3 (20% Core / 80% Comunidad)</option>
                                <option value="profit-share" ${currentTokenomics === 'profit-share' ? 'selected' : ''}>🏢 Profit-Share (Reparto de Bonus Pyme)</option>
                            </select>

                            <div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; margin-top: 10px; margin-bottom: 15px; font-size: 0.8rem; border-left: 2px solid var(--accent-green); color: var(--text-muted);">
                                ${currentTokenomics === 'startup' ? `<b style="color:var(--text-heading);">Dinámica Startup:</b> Todo el Equity es líquido y se recalcula diariamente basado en el Ledger. Ideal para bootstrapping sin caja.` : ''}
                                ${currentTokenomics === 'dao' ? `<b style="color:var(--text-heading);">Dinámica DAO:</b> Se reserva un % fijo para los fundadores. El resto se emite en Tokens en proporción a los Slices ganados resolviendo Pings.` : ''}
                                ${currentTokenomics === 'profit-share' ? `<b style="color:var(--text-heading);">Profit-Share:</b> Las acciones de la empresa no cambian. Se utiliza el Ledger para repartir un bote económico (Bonus anual o dividendos).` : ''}
                            </div>

                            <button id="btn-save-tokenomics" data-pid="${projectId}" class="btn btn-outline btn-block" style="border-color: var(--accent-green); color: var(--accent-green);">⚖️ Sellar Tokenomics</button>
                        </div>
                    </main>

                    <aside>
                        <div class="panel" style="border-color: var(--accent-purple); height: 100%;">
                            <h3 style="margin-top: 0; color: var(--accent-purple);">3. Ontología VNA (Nodos Teóricos)</h3>
                            <p class="text-small text-muted" style="margin-bottom: 20px;">Añade roles estructurales y define su multiplicador de riesgo para el Slicing Pie.</p>

                            <div style="background: var(--bg-surface); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px;">
                                <label class="form-label">Nombre del Rol / Función:</label>
                                <input type="text" id="new-role-name" class="form-control" placeholder="Ej: Auditor de Calidad (QA)">
                                
                                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                                    <div>
                                        <label class="form-label">Nivel Sistémico:</label>
                                        <select id="new-role-level" class="form-control">
                                            <option value="@anxaneta">👑 @anxaneta (Estrategia)</option>
                                            <option value="@aixecador">👁️ @aixecador (Táctico)</option>
                                            <option value="@dosos">⚖️ @dosos (Auditoría)</option>
                                            <option value="@baixos">🛠️ @baixos (Ejecución)</option>
                                            <option value="@pinya">🧱 @pinya (Soporte)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label class="form-label">Riesgo (X):</label>
                                        <input type="number" step="0.1" id="new-role-multiplier" class="form-control" placeholder="1.0" value="1.0" title="Multiplicador de Slicing Pie">
                                    </div>
                                </div>
                                
                                <button id="btn-add-role" data-pid="${projectId}" class="btn btn-primary btn-block" style="background: var(--accent-purple); margin-top: 10px;">Inyectar Rol a la Red ➔</button>
                            </div>

                            <h4 style="margin-bottom: 15px; color: var(--text-heading); display: flex; justify-content: space-between;">
                                Nodos Activos en la Red
                                <span class="badge" style="background: rgba(163, 113, 247, 0.1); color: var(--accent-purple); border: 1px solid var(--accent-purple);">${activeRoles.length} Roles</span>
                            </h4>
                            
                            ${activeRoles.length === 0 ? '<p class="text-muted text-small text-center" style="padding: 20px; border: 1px dashed var(--border-color); border-radius: 8px;">La topología está vacía.</p>' : `
                                <div class="list-group" style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
                                    ${activeRoles.map(r => `
                                        <div class="panel-surface" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 12px; border-left: 3px solid var(--accent-purple);">
                                            <div>
                                                <b style="color: var(--text-heading); font-size: 0.95rem;">${r.name}</b>
                                                <div style="display: flex; gap: 10px; margin-top: 4px;">
                                                    <span class="badge" style="background: var(--bg-base); color: var(--text-muted); border: 1px solid var(--border-color);">${r.levelId}</span>
                                                    <span class="text-small" style="color: var(--accent-gold); font-weight: bold;">Mutliplicador: ${r.multiplier}x</span>
                                                </div>
                                            </div>
                                            <button class="btn btn-secondary text-small btn-archive-role" style="padding: 4px 10px;" data-pid="${projectId}" data-role="${r.id}">Ocultar</button>
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
