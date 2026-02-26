import { store } from '../core/store.js';

document.addEventListener('click', (e) => {
    // 1. GUARDAR IDENTIDAD Y CONTEXTO (SYSTEM PROMPT) [TU CÓDIGO INTACTO]
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

    // 2. GUARDAR MODELO DE TOKENOMICS (LA COSECHA) [TU CÓDIGO INTACTO]
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

    // 3. INYECTAR ROL A LA ONTOLOGÍA (MANUAL) [TU CÓDIGO INTACTO + CAMPOS NUEVOS VACÍOS]
    if (e.target.id === 'btn-add-role') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('new-role-name').value.trim();
        const levelId = document.getElementById('new-role-level').value;
        const multiplier = document.getElementById('new-role-multiplier').value;

        if (!name) return alert("⚠️ Define un nombre para el nodo teórico.");

        store.dispatch({
            type: 'ADD_ROLE',
            payload: { 
                projectId, 
                role: { 
                    id: 'role-' + Date.now(), 
                    name, 
                    levelId, 
                    multiplier: parseFloat(multiplier) || 1,
                    ai_prompt: '', // Nuevo campo para IA
                    standard_deliverables: [] // Nuevo campo Pull System
                } 
            }
        });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // 4. OCULTAR / MOSTRAR ROL [TU CÓDIGO INTACTO]
    if (e.target.classList.contains('btn-archive-role')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-role');
        store.dispatch({ type: 'TOGGLE_ROLE_ARCHIVE', payload: { projectId, roleId } });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // 5. NUEVO: IMPORTAR PLANTILLA GLOBAL AL PROYECTO
    if (e.target.id === 'btn-import-template') {
        const projectId = e.target.getAttribute('data-pid');
        const sectorKey = document.getElementById('select-template').value;
        
        if (!sectorKey) return alert("Selecciona una plantilla primero.");
        if (!confirm(`¿Añadir los roles de la plantilla '${sectorKey}' a este proyecto?`)) return;

        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        const template = state.ontology?.sectores[sectorKey];

        if (!template) return alert("Error: Plantilla no encontrada.");

        // Añadimos los roles de la plantilla a la red actual
        const newRoles = [...project.roles];
        Object.keys(template).forEach(levelId => {
            const tmplData = template[levelId];
            newRoles.push({
                id: `role-${levelId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                levelId: levelId,
                name: tmplData.name || levelId,
                multiplier: tmplData.multiplier || 1.0,
                ai_prompt: tmplData.ai_prompt || '',
                standard_deliverables: tmplData.standard_deliverables ? JSON.parse(JSON.stringify(tmplData.standard_deliverables)) : [],
                price: 90,
                isArchived: false
            });
        });

        store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: { projectId, updates: { roles: newRoles } }
        });

        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }

    // 6. NUEVO: GUARDAR EDICIONES LOCALES (PROMPTS Y ENTREGABLES)
    if (e.target.id === 'btn-save-local-ontology') {
        const projectId = e.target.getAttribute('data-pid');
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);

        const updatedRoles = project.roles.map(r => {
            if (r.isArchived) return r; // No tocamos los ocultos

            const promptInput = document.getElementById(`local-prompt-${r.id}`);
            const delivInput = document.getElementById(`local-deliv-${r.id}`);
            
            if (promptInput && delivInput) {
                // Parseamos los entregables "Horas | Nombre"
                const parsedDeliverables = delivInput.value.split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => {
                        const parts = line.split('|');
                        return {
                            estimatedHours: parseFloat(parts[0]) || 0,
                            name: parts.slice(1).join('|').trim() || 'Entregable sin nombre'
                        };
                    });

                return {
                    ...r,
                    ai_prompt: promptInput.value.trim(),
                    standard_deliverables: parsedDeliverables
                };
            }
            return r;
        });

        store.dispatch({
            type: 'UPDATE_PROJECT_INFO',
            payload: { projectId, updates: { roles: updatedRoles } }
        });

        const btn = document.getElementById('btn-save-local-ontology');
        btn.innerHTML = '✅ Ontología Local Guardada';
        btn.style.background = 'var(--accent-purple)';
        btn.style.color = '#fff';
        setTimeout(() => document.getElementById('app').innerHTML = ProjectEditView.render(projectId), 1000);
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
        const sectores = state.ontology?.sectores || {};

        // 🚀 BREADCRUMBS Y TOOLBAR GLOBAL (Estándar UI)
        setTimeout(() => window.setNavbar ? window.setNavbar([], '', '') : null, 0);

        return `
            <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border-color); padding: 15px 30px; position: sticky; top: 0; z-index: 100;">
                <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
                    <div style="font-size: 0.95rem; color: var(--text-muted); display: flex; align-items: center; gap: 10px;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none; font-weight: bold;">🏠 Hub</a> 
                        <span>/</span> 
                        <a href="#/project/${projectId}" style="color: var(--text-main); text-decoration: none;">${project.nombre}</a> 
                        <span>/</span> 
                        <span style="color: var(--text-heading); font-weight: bold;">⚙️ Configuración</span>
                    </div>
                    <div>
                        <span class="badge" style="background: rgba(255,255,255,0.05); color: ${tipoColor}; border: 1px solid ${tipoColor};">${tipoLabel}</span>
                    </div>
                </div>
            </div>

            <div class="container fade-in" style="max-width: 1200px; margin: 30px auto; padding: 0 20px;">
                
                <div class="panel-surface" style="margin-bottom: 30px; border-left: 4px solid var(--accent-purple); background: linear-gradient(135deg, rgba(163, 113, 247, 0.05) 0%, transparent 100%);">
                    <h2 style="margin: 0; display: flex; align-items: center; gap: 15px; color: var(--accent-purple);">
                        Sala de Máquinas: ${project.nombre}
                    </h2>
                    <p class="text-muted" style="margin-top: 5px; font-size: 0.9rem;">
                        Configura la Identidad, Tokenomics, y ahora <b>el ADN de la IA y el Pull System (Entregables)</b>.
                    </p>
                </div>

                <div class="grid-layout" style="grid-template-columns: 1fr 1.5fr; gap: 30px;">
                    
                    <main style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div class="panel" style="border-color: var(--accent-blue);">
                            <h3 style="margin-top: 0; color: var(--accent-blue);">1. Identidad y Contexto IA</h3>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Define qué es esta red y dale un contexto a los Agentes IA que operen en ella.</p>
                            
                            <label class="form-label">Nombre de la Red:</label>
                            <input type="text" id="edit-proj-name" class="form-control" value="${project.nombre}" placeholder="Ej: Proyecto TeamTowers">
                            
                            <label class="form-label">Sector Base:</label>
                            <select id="edit-proj-sector" class="form-control">
                                <option value="${project.sector || 'general'}">${(project.sector || 'General').toUpperCase()}</option>
                                ${Object.keys(sectores).map(s => s !== project.sector ? `<option value="${s}">${s.toUpperCase()}</option>` : '').join('')}
                            </select>

                            <label class="form-label" style="margin-top: 15px; display:flex; justify-content:space-between;">
                                <span>System Prompt (Contexto Local):</span>
                                <span class="badge" style="background:var(--bg-surface); color:var(--text-muted); border:1px solid var(--border-color);">🤖 IA</span>
                            </label>
                            <textarea id="edit-proj-prompt" class="form-control" style="height: 120px; font-family: 'Cascadia Code', monospace; font-size: 0.8rem; background: rgba(0,0,0,0.1);" placeholder="Ej: Esta red se dedica al desarrollo...">${projectPrompt}</textarea>

                            <button id="btn-save-project-info" data-pid="${projectId}" class="btn btn-outline btn-block" style="border-color: var(--accent-blue); color: var(--accent-blue); margin-top: 10px;">💾 Guardar Identidad</button>
                        </div>

                        <div class="panel" style="border-color: var(--accent-green);">
                            <h3 style="margin-top: 0; color: var(--accent-green);">2. Modelo de Recompensa (Tokenomics)</h3>
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Elige cómo el Slicing Pie se convierte en <b>Equity o Cash</b>.</p>
                            
                            <select id="tokenomics-preset" class="form-control" style="font-weight: bold; border-color: var(--accent-green);">
                                <option value="startup" ${currentTokenomics === 'startup' ? 'selected' : ''}>🚀 Startup Slicer (100% Equity Dinámico)</option>
                                <option value="dao" ${currentTokenomics === 'dao' ? 'selected' : ''}>🌍 Comunidad Web3 (Tokens)</option>
                                <option value="profit-share" ${currentTokenomics === 'profit-share' ? 'selected' : ''}>🏢 Profit-Share (Bonus Pyme)</option>
                            </select>

                            <button id="btn-save-tokenomics" data-pid="${projectId}" class="btn btn-outline btn-block" style="border-color: var(--accent-green); color: var(--accent-green); margin-top: 15px;">⚖️ Sellar Tokenomics</button>
                        </div>
                    </main>

                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div class="panel" style="border-color: var(--accent-gold); background: rgba(210, 153, 34, 0.05);">
                            <h3 style="margin-top: 0; color: var(--accent-gold); font-size: 1.1rem;">⚡ Setup Ágil: Importar Plantilla</h3>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <select id="select-template" style="flex: 1; background: var(--bg-dark); border: 1px solid var(--border-color); color: white; padding: 10px; border-radius: 6px;">
                                    <option value="">-- Seleccionar de la Biblioteca Global --</option>
                                    ${Object.keys(sectores).map(k => `<option value="${k}">${k}</option>`).join('')}
                                </select>
                                <button id="btn-import-template" data-pid="${projectId}" class="btn" style="background: var(--accent-gold); color: #000; font-weight: bold;">⬇️ Inyectar</button>
                            </div>
                        </div>

                        <div class="panel" style="border-color: var(--border-color);">
                            <h3 style="margin-top: 0; font-size: 1.1rem;">➕ Añadir Rol Personalizado</h3>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="new-role-name" class="form-control" placeholder="Nombre Rol" style="flex:2;">
                                <select id="new-role-level" class="form-control" style="flex:1;">
                                    <option value="@anxaneta">@anxaneta</option>
                                    <option value="@aixecador">@aixecador</option>
                                    <option value="@dosos">@dosos</option>
                                    <option value="@baixos">@baixos</option>
                                    <option value="@pinya">@pinya</option>
                                </select>
                                <input type="number" step="0.1" id="new-role-multiplier" class="form-control" placeholder="Riesgo x1.0" value="1.0" style="flex:1;">
                            </div>
                            <button id="btn-add-role" data-pid="${projectId}" class="btn btn-outline btn-block" style="margin-top: 10px;">Añadir Rol Manual</button>
                        </div>

                        <div class="panel" style="border-color: var(--accent-purple); height: 100%;">
                            <h3 style="margin-top: 0; color: var(--accent-purple); display: flex; justify-content: space-between; align-items: center;">
                                3. Nodos Activos y Entregables
                                <span class="badge" style="background: rgba(163, 113, 247, 0.1); color: var(--accent-purple); border: 1px solid var(--accent-purple);">${activeRoles.length} Roles</span>
                            </h3>
                            <p class="text-small text-muted" style="margin-bottom: 20px;">Edita localmente el Prompt de IA y el listado de Entregables (Pull System) para cada rol.</p>

                            ${activeRoles.length === 0 ? '<p class="text-muted text-small text-center" style="padding: 20px; border: 1px dashed var(--border-color); border-radius: 8px;">La topología está vacía. Importa una plantilla o añade un rol manual.</p>' : `
                                <div style="max-height: 500px; overflow-y: auto; padding-right: 5px;">
                                    ${activeRoles.map(r => {
                                        // Reconstruir string de entregables
                                        let delivString = '';
                                        if (r.standard_deliverables) {
                                            delivString = r.standard_deliverables.map(d => `${d.estimatedHours} | ${d.name}`).join('\n');
                                        }

                                        return `
                                        <div class="panel-surface" style="margin-bottom: 15px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
                                            <div style="background: rgba(0,0,0,0.2); display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border-color); border-left: 3px solid var(--accent-purple);">
                                                <div>
                                                    <b style="color: var(--text-heading); font-size: 0.95rem;">${r.name}</b>
                                                    <div style="display: flex; gap: 10px; margin-top: 4px;">
                                                        <span class="badge" style="background: var(--bg-base); color: var(--text-muted); border: 1px solid var(--border-color);">${r.levelId}</span>
                                                        <span class="text-small" style="color: var(--accent-gold); font-weight: bold;">Riesgo: ${r.multiplier}x</span>
                                                    </div>
                                                </div>
                                                <button class="btn btn-secondary text-small btn-archive-role" style="padding: 4px 10px;" data-pid="${projectId}" data-role="${r.id}">Ocultar</button>
                                            </div>
                                            
                                            <div style="padding: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: rgba(255,255,255,0.01);">
                                                <div>
                                                    <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.75rem;">🤖 Prompt de Auditoría Local</label>
                                                    <textarea id="local-prompt-${r.id}" style="width:100%; height: 80px; background:var(--bg-base); border:1px solid var(--border-color); padding:8px; color:var(--accent-blue); border-radius: 4px; font-family: monospace; font-size: 0.75rem;" placeholder="Responsabilidades de este rol...">${r.ai_prompt || ''}</textarea>
                                                </div>
                                                <div>
                                                    <label style="display:block; margin-bottom:5px; color:var(--accent-green); font-size:0.75rem; font-weight: bold;">📦 Entregables (Horas | Tarea)</label>
                                                    <textarea id="local-deliv-${r.id}" placeholder="10 | Ejemplo tarea..." style="width:100%; height: 80px; background:var(--bg-base); border:1px solid var(--border-color); padding:8px; color:var(--accent-green); border-radius: 4px; font-family: monospace; font-size: 0.75rem; white-space: pre;">${delivString}</textarea>
                                                </div>
                                            </div>
                                        </div>
                                        `;
                                    }).join('')}
                                </div>
                                <button id="btn-save-local-ontology" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-top: 15px; background: var(--border-color);">💾 Guardar Prompts y Entregables</button>
                            `}
                        </div>
                    </aside>

                </div>
            </div>
        `;
    }
};
