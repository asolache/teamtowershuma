import { store } from '../core/store.js';

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div>Proyecto no encontrado</div>`;

        return `
            <div style="max-width: 1000px; margin: 0 auto; padding: 25px; font-family: sans-serif; color: #c9d1d9;">
                
                <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 20px; margin-bottom: 30px;">
                    <div>
                        <h1 style="color: #58a6ff; margin: 0; font-size: 1.8rem;">⚙️ Diseñador de Sistema: ${project.nombre}</h1>
                        <p style="color:#8b949e; margin: 5px 0 0 0; font-size: 0.9rem;">Fase de Arquitectura y Ontología</p>
                    </div>
                    <button onclick="location.hash='#/project/${projectId}'" style="background:#238636; border:none; color:#fff; padding:8px 15px; border-radius:6px; cursor:pointer; font-weight:bold;">Guardar y Volver a Operaciones</button>
                </header>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    
                    <section style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px;">
                        <h3 style="color: #f0f6fc; margin-top: 0; border-bottom: 1px solid #30363d; padding-bottom: 10px;">1. Parámetros del Proyecto</h3>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display:block; font-size: 0.8rem; color: #8b949e; margin-bottom: 5px;">Nombre del Proyecto</label>
                            <input id="edit-name" type="text" value="${project.nombre}" style="width: 100%; background:#0d1117; color:white; border:1px solid #30363d; padding:10px; border-radius:4px; box-sizing:border-box;">
                        </div>

                        <div style="margin-bottom: 15px;">
                            <label style="display:block; font-size: 0.8rem; color: #8b949e; margin-bottom: 5px;">Sector / Ontología Base</label>
                            <select id="edit-sector" style="width: 100%; background:#0d1117; color:white; border:1px solid #30363d; padding:10px; border-radius:4px; box-sizing:border-box;">
                                ${Object.keys(state.ontology.sectores).map(s => `
                                    <option value="${s}" ${project.sector === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                `).join('')}
                            </select>
                        </div>

                        <div style="margin-bottom: 15px;">
                            <label style="display:block; font-size: 0.8rem; color: #8b949e; margin-bottom: 5px;">Prompt / Misión del Ecosistema</label>
                            <textarea id="edit-desc" placeholder="Define el propósito general, las reglas y los objetivos para que la IA entienda este ecosistema..." style="width: 100%; height: 120px; background:#0d1117; color:white; border:1px solid #30363d; padding:10px; border-radius:4px; box-sizing:border-box; font-family:sans-serif;">${project.description || ''}</textarea>
                        </div>

                        <button onclick="window.saveProjectInfo('${projectId}')" style="background:#21262d; color:#c9d1d9; border:1px solid #30363d; padding:10px 15px; border-radius:4px; cursor:pointer; width:100%;">Actualizar Metadatos</button>
                    </section>

                    <section style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px;">
                        <h3 style="color: #f0f6fc; margin-top: 0; border-bottom: 1px solid #30363d; padding-bottom: 10px;">2. Nodos de Valor (Gremio)</h3>
                        
                        <div style="max-height: 250px; overflow-y: auto; margin-bottom: 20px;">
                            <h4 style="font-size:0.75rem; color:#8b949e; text-transform:uppercase;">Roles Base</h4>
                            ${Object.keys(project.customRoles).map(id => `
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#0d1117; padding:8px; border:1px solid #30363d; border-radius:4px; margin-bottom:5px;">
                                    <span><span style="color:#238636; font-size:0.8rem; margin-right:10px;">${id}</span> ${project.customRoles[id]}</span>
                                </div>
                            `).join('')}
                            
                            <h4 style="font-size:0.75rem; color:#8b949e; text-transform:uppercase; margin-top:15px;">Roles Dinámicos</h4>
                            ${(project.dynamicRoles || []).map(dr => `
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#0d1117; padding:8px; border:1px solid #30363d; border-radius:4px; margin-bottom:5px;">
                                    <div>
                                        <div style="color:#58a6ff; font-weight:bold; font-size:0.9rem;">${dr.name}</div>
                                        <div style="font-size:0.7rem; color:#8b949e;">${dr.area} | Nivel: ${dr.levelId}</div>
                                    </div>
                                    <button onclick="window.deleteCustomRole('${projectId}', '${dr.id}')" style="background:transparent; border:none; color:#f85149; cursor:pointer;" title="Eliminar Rol">🗑️</button>
                                </div>
                            `).join('')}
                        </div>

                        <div style="background: #0d1117; border: 1px dashed #30363d; padding: 15px; border-radius: 4px;">
                            <h4 style="color: #c9d1d9; font-size: 0.85rem; margin-top: 0;">+ Nuevo Rol Especializado</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <input id="nr-name" type="text" placeholder="Nombre (ej: QA Engineer)" style="background:#161b22; color:white; border:1px solid #30363d; padding:8px; border-radius:4px;">
                                <select id="nr-level" style="background:#161b22; color:white; border:1px solid #30363d; padding:8px; border-radius:4px;">
                                    <option value="@anxaneta">Anxaneta (Estrategia)</option>
                                    <option value="@aixecador">Aixecador (Estructura)</option>
                                    <option value="@dosos">Dosos (Refinamiento)</option>
                                    <option value="@baixos">Baixos (Producción)</option>
                                    <option value="@pinya">Pinya (Soporte)</option>
                                </select>
                                <input id="nr-area" type="text" placeholder="Área (ej: Testing)" style="grid-column: span 2; background:#161b22; color:white; border:1px solid #30363d; padding:8px; border-radius:4px;">
                                <button onclick="window.createRoleFromEdit('${projectId}')" style="grid-column: span 2; background:#238636; color:white; border:none; padding:8px; border-radius:4px; cursor:pointer; font-weight:bold;">Añadir al Gremio</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }
};

// Acciones globales para esta vista
window.saveProjectInfo = (projectId) => {
    const nombre = document.getElementById('edit-name').value;
    const sector = document.getElementById('edit-sector').value;
    const description = document.getElementById('edit-desc').value;
    
    store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, nombre, sector, description } });
    alert("Metadatos actualizados");
};

window.deleteCustomRole = (projectId, rolId) => {
    if(confirm("¿Seguro que quieres eliminar este rol? Las transacciones previas conservarán su ID histórico.")) {
        store.dispatch({ type: 'DELETE_CUSTOM_ROLE', payload: { projectId, rolId } });
        location.reload();
    }
};

window.createRoleFromEdit = (projectId) => {
    const name = document.getElementById('nr-name').value;
    const levelId = document.getElementById('nr-level').value;
    const area = document.getElementById('nr-area').value;
    if(!name) return alert("Nombre obligatorio");
    store.dispatch({ type: 'CREATE_CUSTOM_ROLE', payload: { projectId, name, levelId, area, description: '', skills: [] } });
    location.reload();
};
