import { store } from '../core/store.js';

// 🛡️ EVENTOS BLINDADOS Y REACTIVOS (Sin Reload)
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-save-meta') {
        const projectId = e.target.getAttribute('data-pid');
        const nombre = document.getElementById('edit-name').value;
        const sector = document.getElementById('edit-sector').value;
        const description = document.getElementById('edit-desc').value;
        store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, nombre, sector, description } });
    }

    if (e.target.id === 'btn-add-role-edit') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-name-edit').value;
        const levelId = document.getElementById('nr-level-edit').value;
        const area = document.getElementById('nr-area-edit').value;
        if(!name) return alert("El nombre es obligatorio");
        
        store.dispatch({ type: 'CREATE_CUSTOM_ROLE', payload: { projectId, name, levelId, area } });
    }

    if (e.target.classList.contains('btn-archive-role')) {
        const projectId = e.target.getAttribute('data-pid');
        const rolId = e.target.getAttribute('data-rid');
        if(confirm("¿Archivar rol? Dejará de aparecer en el mapa.")) {
            store.dispatch({ type: 'ARCHIVE_CUSTOM_ROLE', payload: { projectId, rolId } });
        }
    }
});

document.addEventListener('change', (e) => {
    if (e.target.classList.contains('seq-input')) {
        const projectId = e.target.getAttribute('data-pid');
        const rolId = e.target.getAttribute('data-rid');
        store.dispatch({ type: 'UPDATE_ROLE_SEQUENCE', payload: { projectId, rolId, sequence: e.target.value } });
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div style="padding:50px; color:white;">Proyecto no encontrado</div>`;

        const systemPrompt = store.generateSystemPrompt(projectId);
        const activeDynamicRoles = (project.dynamicRoles || []).filter(dr => !dr.isArchived);
        const defaultSeq = { "@anxaneta": 1, "@aixecador": 2, "@dosos": 3, "@baixos": 4, "@pinya": 5 };

        return `
            <div style="max-width: 1400px; margin: 0 auto; padding: 25px; font-family: sans-serif; color: #c9d1d9;">
                
                <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 20px; margin-bottom: 30px;">
                    <div>
                        <h1 style="color: #58a6ff; margin: 0; font-size: 1.8rem;">⚙️ Diseñador de Ecosistema: ${project.nombre}</h1>
                        <p style="color:#8b949e; margin: 5px 0 0 0;">Arquitectura y Contexto IA</p>
                    </div>
                    <button onclick="location.hash='#/project/${projectId}'" style="background:#238636; border:none; color:#fff; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold;">Guardar y Volver ➔</button>
                </header>

                <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 30px;">
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <section style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px;">
                            <h3 style="color: #f0f6fc; margin-top: 0;">1. Misión del Proyecto</h3>
                            
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <label style="display:block; font-size: 0.8rem; color: #8b949e; margin-bottom: 5px;">Nombre</label>
                                    <input id="edit-name" type="text" value="${project.nombre}" style="width: 100%; background:#0d1117; color:white; border:1px solid #30363d; padding:10px; border-radius:4px; box-sizing:border-box;">
                                </div>
                                <div>
                                    <label style="display:block; font-size: 0.8rem; color: #8b949e; margin-bottom: 5px;">Sector Base</label>
                                    <select id="edit-sector" style="width: 100%; background:#0d1117; color:white; border:1px solid #30363d; padding:10px; border-radius:4px; box-sizing:border-box; text-transform:capitalize;">
                                        ${Object.keys(state.ontology.sectores).map(s => `
                                            <option value="${s}" ${project.sector === s ? 'selected' : ''}>${s}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>

                            <div style="margin-bottom: 15px;">
                                <label style="display:block; font-size: 0.8rem; color: #8b949e; margin-bottom: 5px;">Prompt Maestro</label>
                                <textarea id="edit-desc" style="width: 100%; height: 80px; background:#0d1117; color:white; border:1px solid #30363d; padding:10px; border-radius:4px; box-sizing:border-box;">${project.description || ''}</textarea>
                            </div>
                            <button id="btn-save-meta" data-pid="${projectId}" style="background:#21262d; color:#c9d1d9; border:1px solid #30363d; padding:10px; border-radius:4px; cursor:pointer; width:100%; font-weight:bold;">Actualizar Metadatos</button>
                        </section>

                        <section style="background: #0d1117; border: 1px solid #a371f7; border-radius: 8px; padding: 20px;">
                            <h3 style="color: #a371f7; margin-top:0;">🧠 Espejo de Consciencia</h3>
                            <pre style="background: #010409; padding: 15px; border-radius: 6px; border: 1px solid #30363d; color: #c9d1d9; font-size: 0.8rem; white-space: pre-wrap;">${systemPrompt}</pre>
                        </section>
                    </div>

                    <section style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px;">
                        <h3 style="color: #f0f6fc; margin-top: 0; border-bottom: 1px solid #30363d; padding-bottom: 10px;">2. Secuenciación del Flujo</h3>
                        
                        <div style="max-height: 400px; overflow-y: auto; margin-bottom: 20px; padding-right: 10px;">
                            <h4 style="font-size:0.75rem; color:#8b949e; text-transform:uppercase; margin-top:0;">Roles Base</h4>
                            ${Object.keys(project.customRoles).map(id => {
                                const seq = project.sequences?.[id] || defaultSeq[id] || 99;
                                return `
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#0d1117; padding:10px; border:1px solid #30363d; border-radius:6px; margin-bottom:8px;">
                                    <div style="display:flex; align-items:center; gap: 15px;">
                                        <input type="number" value="${seq}" class="seq-input" data-pid="${projectId}" data-rid="${id}" style="width: 45px; background:#161b22; color:#58a6ff; border:1px solid #30363d; text-align:center;">
                                        <div>
                                            <span style="color:#238636; font-size:0.8rem; font-weight:bold;">${id}</span> 
                                            <div style="color:#c9d1d9; font-size:0.9rem;">${project.customRoles[id]}</div>
                                        </div>
                                    </div>
                                </div>
                                `;
                            }).join('')}
                            
                            <h4 style="font-size:0.75rem; color:#8b949e; text-transform:uppercase; margin-top:20px;">Especialistas Activos</h4>
                            ${activeDynamicRoles.map(dr => {
                                const seq = project.sequences?.[dr.id] || 99;
                                return `
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#0d1117; padding:10px; border:1px solid #30363d; border-radius:6px; margin-bottom:8px;">
                                    <div style="display:flex; align-items:center; gap: 15px;">
                                        <input type="number" value="${seq}" class="seq-input" data-pid="${projectId}" data-rid="${dr.id}" style="width: 45px; background:#161b22; color:#58a6ff; border:1px solid #30363d; text-align:center;">
                                        <div>
                                            <div style="color:#58a6ff; font-weight:bold; font-size:0.9rem;">${dr.name}</div>
                                            <div style="font-size:0.7rem; color:#8b949e;">Vinculado a: ${dr.levelId}</div>
                                        </div>
                                    </div>
                                    <button class="btn-archive-role" data-pid="${projectId}" data-rid="${dr.id}" style="background:transparent; border:1px solid #30363d; padding: 6px 10px; border-radius: 4px; color:#8b949e; cursor:pointer;">📥</button>
                                </div>
                                `;
                            }).join('')}
                        </div>

                        <div style="background: #0d1117; border: 1px dashed #30363d; padding: 15px; border-radius: 4px;">
                            <h4 style="color: #c9d1d9; font-size: 0.85rem; margin-top: 0; margin-bottom: 10px;">+ Añadir Especialista</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <input id="nr-name-edit" type="text" placeholder="Nombre (ej: QA Engineer)" style="background:#161b22; color:white; border:1px solid #30363d; padding:8px; border-radius:4px;">
                                <select id="nr-level-edit" style="background:#161b22; color:white; border:1px solid #30363d; padding:8px; border-radius:4px;">
                                    <option value="@anxaneta">Anxaneta</option>
                                    <option value="@aixecador">Aixecador</option>
                                    <option value="@dosos">Dosos</option>
                                    <option value="@baixos">Baixos</option>
                                    <option value="@pinya">Pinya</option>
                                </select>
                                <input id="nr-area-edit" type="text" placeholder="Área" style="grid-column: span 2; background:#161b22; color:white; border:1px solid #30363d; padding:8px; border-radius:4px;">
                                <button id="btn-add-role-edit" data-pid="${projectId}" style="grid-column: span 2; background:#238636; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; font-weight:bold;">Añadir Nodo</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }
};
