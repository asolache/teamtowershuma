import { store } from '../core/store.js';

// 🛡️ GESTIÓN DE EVENTOS DE EDICIÓN
document.addEventListener('change', (e) => {
    // 1. Editar Nombre del Rol
    if (e.target.classList.contains('edit-role-name')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        store.dispatch({ 
            type: 'UPDATE_ROLE', 
            payload: { projectId, roleId, field: 'name', value: e.target.value } 
        });
    }

    // 2. Editar Órbita/Nivel
    if (e.target.classList.contains('edit-role-level')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        store.dispatch({ 
            type: 'UPDATE_ROLE', 
            payload: { projectId, roleId, field: 'levelId', value: e.target.value } 
        });
        const app = document.getElementById('app');
        app.innerHTML = ProjectEditView.render(projectId);
    }
});

document.addEventListener('click', (e) => {
    // Guardar Metadatos del Proyecto
    const btnSave = e.target.closest('#btn-save-meta');
    if (btnSave) {
        const projectId = btnSave.getAttribute('data-pid');
        store.dispatch({ 
            type: 'UPDATE_PROJECT_INFO', 
            payload: { 
                projectId, 
                nombre: document.getElementById('edit-name').value, 
                sector: document.getElementById('edit-sector').value, 
                description: document.getElementById('edit-desc').value 
            } 
        });
        
        // Feedback visual de guardado y re-render
        const app = document.getElementById('app');
        app.innerHTML = ProjectEditView.render(projectId);
        console.log("✅ Datos estratégicos sincronizados con el Contexto IA");
    }

    // Inyectar Nuevo Rol
    if (e.target.id === 'btn-add-role-edit') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-name-edit').value;
        const levelId = document.getElementById('nr-level-edit').value;
        if(!name) return alert("Indica el nombre del rol");
        store.dispatch({ type: 'CREATE_ROLE', payload: { projectId, name, levelId } });
        const app = document.getElementById('app');
        app.innerHTML = ProjectEditView.render(projectId);
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Proyecto no encontrado</h2></div>`;

        const activeRoles = project.roles.filter(r => !r.isArchived);

        const levelOptions = [
            { id: "@anxaneta", label: "Strategy (@anxaneta)" },
            { id: "@aixecador", label: "Creative/Coord (@aixecador)" },
            { id: "@dosos", label: "Quality/Audit (@dosos)" },
            { id: "@baixos", label: "Operational (@baixos)" },
            { id: "@pinya", label: "Support/Base (@pinya)" }
        ];

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1>⚙️ Diseñador de Ontología: ${project.nombre}</h1>
                        <p class="text-muted">Ajusta la base estratégica y la estructura de capital humano</p>
                    </div>
                    <button class="btn btn-secondary" onclick="location.hash='#/project/${projectId}'">← Volver al Mapa</button>
                </header>

                <div style="display: grid; grid-template-columns: 380px 1fr; gap: 30px;">
                    
                    <section class="panel" style="border-left: 4px solid var(--accent-purple);">
                        <h3 style="display: flex; justify-content: space-between; align-items: center;">
                            Misión y Propósito
                            <span style="font-size: 0.7rem; background: var(--accent-purple); color: white; padding: 2px 8px; border-radius: 10px;">ESTRATÉGICO</span>
                        </h3>
                        
                        <div style="margin-bottom: 20px;">
                            <label class="form-label">Nombre del Proyecto</label>
                            <input id="edit-name" type="text" class="form-control" value="${project.nombre}">
                            
                            <label class="form-label">Sector Operativo</label>
                            <select id="edit-sector" class="form-control">
                                ${Object.keys(state.ontology.sectores).map(s => `
                                    <option value="${s}" ${project.sector === s ? 'selected' : ''}>${s.toUpperCase()}</option>
                                `).join('')}
                            </select>
                            
                            <label class="form-label">Descripción / Misión (Lectura IA)</label>
                            <textarea id="edit-desc" class="form-control" 
                                style="height: 180px; line-height: 1.5; font-family: 'Inter', sans-serif; resize: vertical;" 
                                placeholder="Define el propósito central del proyecto...">${project.description || ''}</textarea>
                            <p class="text-small text-muted" style="margin-top: 5px;">* Esta descripción define el comportamiento de los agentes IA.</p>
                        </div>

                        <button id="btn-save-meta" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-bottom: 25px;">
                            💾 Guardar y Sincronizar Contexto
                        </button>
                        
                        <div style="padding: 15px; background: rgba(163, 113, 247, 0.05); border: 1px dashed var(--accent-purple); border-radius: 12px;">
                            <h4 style="color: var(--accent-purple); margin:0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                                🧠 Contexto IA Activo
                            </h4>
                            <div id="ai-context-preview" style="font-size: 0.85rem; color: #eee;">
                                <div style="margin-bottom: 8px;"><strong>Sector:</strong> <span style="color: var(--accent-blue);">${project.sector}</span></div>
                                <div style="margin-bottom: 8px;"><strong>Enfoque:</strong> ${project.description ? project.description.substring(0, 100) + '...' : '<span class="text-muted">Esperando descripción...</span>'}</div>
                                <div style="display: flex; gap: 5px; margin-top: 10px;">
                                    <span style="height: 8px; width: 8px; background: #00ff00; border-radius: 50%; display: inline-block;"></span>
                                    <span class="text-small" style="color: #00ff00; font-weight: bold;">IA Lista para Diagnóstico</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="panel">
                        <h3>Gestión de Roles y Órbitas</h3>
                        <p class="text-muted text-small">Asigna responsabilidades a los niveles de valor. Los cambios afectan al reparto de Slicing Pie.</p>
                        
                        <div style="margin-bottom: 25px;">
                            ${activeRoles.map(r => `
                                <div class="panel-surface" style="display: grid; grid-template-columns: 1fr 1fr 40px; gap: 15px; align-items: center; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05);">
                                    <div>
                                        <label class="text-small text-muted" style="display:block; font-size:0.6rem; letter-spacing: 0.05rem;">NOMBRE DEL ROL</label>
                                        <input type="text" 
                                               class="form-control edit-role-name" 
                                               data-pid="${projectId}" 
                                               data-rid="${r.id}" 
                                               value="${r.name}" 
                                               style="margin:0; border-color: transparent; background: rgba(0,0,0,0.2);">
                                    </div>
                                    <div>
                                        <label class="text-small text-muted" style="display:block; font-size:0.6rem; letter-spacing: 0.05rem;">ÓRBITA DE VALOR</label>
                                        <select class="form-control edit-role-level" 
                                                 data-pid="${projectId}" 
                                                 data-rid="${r.id}" 
                                                 style="margin:0; font-size: 0.85rem; border-color: transparent; background: rgba(0,0,0,0.2);">
                                            ${levelOptions.map(opt => `
                                                <option value="${opt.id}" ${r.levelId === opt.id ? 'selected' : ''}>${opt.label}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <button class="btn-archive-role" data-pid="${projectId}" data-rid="${r.id}" 
                                            style="background:none; border:none; cursor:pointer; font-size:1.1rem; opacity:0.6; transition: 0.3s;"
                                            onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">🗑️</button>
                                </div>
                            `).join('')}
                        </div>

                        <div class="panel-surface" style="border: 2px dashed rgba(163, 113, 247, 0.3); background: rgba(163, 113, 247, 0.02);">
                            <h4 style="margin-top:0; font-size: 0.9rem; color: var(--accent-purple);">+ Inyectar Nueva Posición</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px;">
                                <input id="nr-name-edit" type="text" class="form-control" placeholder="Ej: Lead Developer" style="margin:0;">
                                <select id="nr-level-edit" class="form-control" style="margin:0;">
                                    ${levelOptions.map(opt => `<option value="${opt.id}">${opt.label}</option>`).join('')}
                                </select>
                                <button id="btn-add-role-edit" data-pid="${projectId}" class="btn btn-primary">Añadir</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }
};
