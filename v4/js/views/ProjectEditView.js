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

    // 3. INYECTAR ROL A LA ONTOLOGÍA (MANUAL)
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
                    ai_prompt: '', 
                    standard_deliverables: [] 
                } 
            }
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

    // 5. IMPORTAR PLANTILLA GLOBAL AL PROYECTO
    if (e.target.id === 'btn-import-template') {
        const projectId = e.target.getAttribute('data-pid');
        const sectorKey = document.getElementById('select-template').value;
        
        if (!sectorKey) return alert("Selecciona una plantilla primero.");
        if (!confirm(`¿Añadir los roles de la plantilla '${sectorKey}' a este proyecto?`)) return;

        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        const template = state.ontology?.sectores[sectorKey];

        if (!template) return alert("Error: Plantilla no encontrada.");

        const newRoles = [...project.roles];
        Object.keys(template).forEach(levelId => {
            const tmplData = template[levelId];
            newRoles.push({
                id: `role-${levelId.replace('@','')}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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

    // 6. GUARDAR EDICIONES LOCALES (PROMPTS Y ENTREGABLES)
    if (e.target.id === 'btn-save-local-ontology') {
        const projectId = e.target.getAttribute('data-pid');
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);

        const updatedRoles = project.roles.map(r => {
            if (r.isArchived) return r; 

            const promptInput = document.getElementById(`local-prompt-${r.id}`);
            const delivInput = document.getElementById(`local-deliv-${r.id}`);
            
            if (promptInput && delivInput) {
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

        // 🔐 RBAC: Verificación de permisos (Solo EO o el PO de esta red)
        const session = state.session || { activeUserId: 'unknown', role: 'user' };
        const isEcosystemOwner = session.role === 'admin';
        const isProjectOwner = project.ownerId === session.activeUserId;
        
        if (!isEcosystemOwner && !isProjectOwner) {
            setTimeout(() => { if(window.setNavbar) window.setNavbar([{ label: '🏠 Hub', hash: '#/' }]) }, 0);
            return `
                <div class="container fade-in" style="padding-top:15vh; text-align:center;">
                    <div class="panel-surface" style="display:inline-block; border-top: 4px solid var(--accent-red); padding: 40px; border-radius: 12px;">
                        <h2 style="color: var(--accent-red); margin-top: 0;">🔒 Acceso Denegado</h2>
                        <p class="text-muted">La configuración estructural de esta red está restringida.<br>Solo el <b>Project Owner</b> o el <b>Ecosystem Owner</b> pueden modificar su ADN.</p>
                        <button class="btn btn-outline" style="margin-top: 20px;" onclick="history.back()">Volver atrás</button>
                    </div>
                </div>`;
        }

        const esProyecto = project.tipo !== 'ecosystem';
        const tipoLabel = esProyecto ? '🎯 PROYECTO (Finito)' : '🌍 ECOSISTEMA (Continuo)';
        const tipoColor = esProyecto ? 'var(--accent-blue)' : 'var(--accent-gold)';

        const activeRoles = project.roles.filter(r => !r.isArchived);
        const currentTokenomics = project.config?.tokenomics || 'startup';
        const projectPrompt = project.prompt || '';
        const sectores = state.ontology?.sectores || {};

        // 🚀 BREADCRUMBS GLOBALES INYECTADOS EN TOOLBAR
        setTimeout(() => {
            if (window.setNavbar) {
                window.setNavbar(
                    [
                        { label: state.config?.ecosystemName || 'Ecosistema', hash: '#/' },
                        { label: project.nombre, hash: `#/project/${projectId}` },
                        { label: '⚙️ Configuración' }
                    ], 
                    '', 
                    `<span class="badge" style="background: rgba(255,255,255,0.05); color: ${tipoColor}; border: 1px solid ${tipoColor};">${tipoLabel}</span>`
                );
            }
        }, 0);

        return `
            <div class="container fade-in" style="max-width: 1200px; margin: 30px auto; padding: 0 20px;">
                
                <div class="panel-surface" style="margin-bottom: 30px; border-left: 4px solid var(--accent-purple); background: linear-gradient(135deg, rgba(163, 113, 247, 0.05) 0%, transparent 100%); padding: 25px; border-radius: 12px;">
                    <h2 style="margin: 0; display: flex; align-items: center; gap: 15px; color: var(--accent-purple);">
                        Sala de Máquinas: ${project.nombre}
                    </h2>
                    <p class="text-muted" style="margin-top: 5px; font-size: 0.9rem;">
                        Configura la Identidad, Tokenomics, y el <b>ADN de la IA y el Pull System (Entregables)</b>.
                    </p>
                </div>

                <div class="grid-layout" style="grid-template-columns: 1fr 1.5fr; gap: 30px;">
                    
                    <main style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div class="panel-surface" style="border-top: 3px solid var(--accent-blue); border-radius: 12px; padding: 25px;">
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

                        <div class="panel-surface" style="border-top: 3px solid var(--accent-green); border-radius: 12px; padding: 25px;">
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
                        
                        <div class="panel-surface" style="border-top: 3px solid var(--accent-gold); background: rgba(210, 153, 34, 0.05); border-radius: 12px; padding: 25px;">
                            <h3 style="margin-top: 0; color: var(--accent-gold); font-size: 1.1rem;">⚡ Setup Ágil: Importar Plantilla</h3>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <select id="select-template" style="flex: 1; background: var(--bg-dark); border: 1px solid var(--border-color); color: white; padding: 10px; border-radius: 6px;">
                                    <option value="">-- Seleccionar de la Biblioteca Global --</option>
                                    ${Object.keys(sectores).map(k => `<option value="${k}">${k}</option>`).join('')}
                                </select>
                                <button id="btn-import-template" data-pid="${projectId}" class="btn" style="background: var(--accent-gold); color: #000; font-weight: bold;">⬇️ Inyectar</button>
                            </div>
                        </div>

                        <div class="panel-surface" style="border-top: 3px solid var(--border-color); border-radius: 12px; padding: 25px;">
                            <h3 style="margin-top: 0; font-size: 1.1rem;">➕ Añadir Rol Personalizado</h3>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="new-role-name" class="form-control" placeholder="Nombre Rol" style="flex:2; margin-bottom: 0;">
                                <select id="new-role-level" class="form-control" style="flex:1; margin-bottom: 0;">
                                    <option value="@anxaneta">@anxaneta</option>
                                    <option value="@aixecador">@aixecador</option>
                                    <option value="@dosos">@dosos</option>
                                    <option value="@baixos">@baixos</option>
                                    <option value="@pinya">@pinya</option>
                                </select>
                                <input type="number" step="0.1" id="new-role-multiplier" class="form-control" placeholder="Riesgo x1.0" value="1.0" style="flex:1; margin-bottom: 0;">
                            </div>
                            <button id="btn-add-role" data-pid="${projectId}" class="btn btn-outline btn-block" style="margin-top: 15px;">Añadir Rol Manual</button>
                        </div>

                        <div class="panel-surface" style="border-top: 3px solid var(--accent-purple); border-radius: 12px; padding: 25px; height: 100%;">
                            <h3 style="margin-top: 0; color: var(--accent-purple); display: flex; justify-content: space-between; align-items: center;">
                                3. Nodos Activos y Entregables
                                <span class="badge" style="background: rgba(163, 113, 247, 0.1); color: var(--accent-purple); border: 1px solid var(--accent-purple);">${activeRoles.length} Roles</span>
                            </h3>
                            <p class="text-small text-muted" style="margin-bottom: 20px;">Edita localmente el Prompt de IA y el listado de Entregables (Pull System) para cada rol.</p>

                            ${activeRoles.length === 0 ? '<p class="text-muted text-small text-center" style="padding: 20px; border: 1px dashed var(--border-color); border-radius: 8px;">La topología está vacía. Importa una plantilla o añade un rol manual.</p>' : `
                                <div style="max-height: 500px; overflow-y: auto; padding-right: 5px;">
                                    ${activeRoles.map(r => {
                                        let delivString = '';
                                        if (r.standard_deliverables) {
                                            delivString = r.standard_deliverables.map(d => `${d.estimatedHours} | ${d.name}`).join('\n');
                                        }

                                        return `
                                        <div style="margin-bottom: 15px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--bg-panel);">
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
                                            
                                            <div style="padding: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
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
