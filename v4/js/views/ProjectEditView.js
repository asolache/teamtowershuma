import { store } from '../core/store.js';

// 🧠 HELPER: Función para extraer y renderizar las sugerencias del System Prompt
const generateSuggestionsHtml = (roleId, project) => {
    if (!roleId || !project) return '';
    const role = project.roles.find(r => r.id === roleId);
    if (!role || !role.systemPrompt) return '';

    const lines = role.systemPrompt.split('\n');
    let html = '';
    
    lines.forEach(line => {
        if (line.includes('- [Tangible]') || line.includes('- [Intangible]')) {
            const isTangible = line.includes('[Tangible]');
            const type = isTangible ? 'tangible' : 'intangible';
            const text = line.split('] ')[1]?.trim(); 
            
            if (text) {
                const color = isTangible ? 'var(--accent-blue)' : 'var(--accent-purple)';
                const shortTitle = text.split('.')[0]; 
                
                html += `
                    <div class="btn-use-suggestion" data-tipo="${type}" data-titulo="${shortTitle}" data-texto="${text}"
                        style="background: rgba(255,255,255,0.03); border: 1px solid ${color}; color: ${color}; 
                        padding: 8px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; margin-top: 8px; transition: 0.2s;"
                        onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.03)'">
                        ✨ Usar: <b>[${isTangible ? 'Tangible' : 'Intangible'}]</b> ${shortTitle}
                    </div>
                `;
            }
        }
    });

    if (html === '') return '<div class="text-muted text-small" style="margin-top:10px;">No hay sugerencias formateadas en el prompt de este rol.</div>';
    
    return `<div style="margin-top: 15px;">
                <label class="form-label text-muted" style="font-size: 0.65rem; letter-spacing: 0.05rem;">SUGERENCIAS DEL MAPA DE VALOR:</label>
                ${html}
            </div>`;
};

// 🛡️ GESTIÓN DE EVENTOS DE EDICIÓN
document.addEventListener('change', (e) => {
    // 1. Editar Nombre del Rol (Mantenido de tu versión)
    if (e.target.classList.contains('edit-role-name')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        store.dispatch({ 
            type: 'UPDATE_ROLE', 
            payload: { projectId, roleId, field: 'name', value: e.target.value } 
        });
    }

    // 2. Editar Órbita/Nivel (Mantenido de tu versión)
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

    // 3. Autoguardado del System Prompt del Rol
    if (e.target.classList.contains('role-prompt-input')) {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        store.dispatch({
            type: 'UPDATE_ROLE',
            payload: { projectId, roleId, field: 'systemPrompt', value: e.target.value }
        });
        
        // Actualizar sugerencias en vivo si estamos editando el rol seleccionado como emisor
        const currentEmisor = document.getElementById('tx-from').value;
        if (currentEmisor === roleId) {
            const project = store.getState().projects.find(p => p.id === projectId);
            document.getElementById('tx-suggestions-container').innerHTML = generateSuggestionsHtml(roleId, project);
        }
    }

    // 4. Actualizar sugerencias al cambiar el "Emisor" en el formulario de transacciones
    if (e.target.id === 'tx-from') {
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.value;
        const project = store.getState().projects.find(p => p.id === projectId);
        document.getElementById('tx-suggestions-container').innerHTML = generateSuggestionsHtml(roleId, project);
    }
});

document.addEventListener('click', (e) => {
    // Guardar Metadatos del Proyecto (Mantenido intacto de tu versión)
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
        const app = document.getElementById('app');
        app.innerHTML = ProjectEditView.render(projectId);
        console.log("✅ Datos estratégicos sincronizados con el Contexto IA");
    }

    // Inyectar Nuevo Rol (Mantenido intacto de tu versión)
    if (e.target.id === 'btn-add-role-edit') {
        const projectId = e.target.getAttribute('data-pid');
        const name = document.getElementById('nr-name-edit').value;
        const levelId = document.getElementById('nr-level-edit').value;
        if(!name) return alert("Indica el nombre del rol");
        store.dispatch({ type: 'CREATE_ROLE', payload: { projectId, name, levelId } });
        const app = document.getElementById('app');
        app.innerHTML = ProjectEditView.render(projectId);
    }

    // Archivar Rol
    if (e.target.classList.contains('btn-archive-role')) {
        const roleId = e.target.getAttribute('data-rid');
        const projectId = e.target.getAttribute('data-pid');
        if(confirm('¿Desactivar este nodo del ecosistema?')) {
            store.dispatch({ type: 'ARCHIVE_ROLE', payload: { projectId, roleId } });
            document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
        }
    }

    // 🚀 INYECTOR MÁGICO: Al hacer clic en un botón de Sugerencia, autocompletar el formulario
    const btnSuggestion = e.target.closest('.btn-use-suggestion');
    if (btnSuggestion) {
        const tipo = btnSuggestion.getAttribute('data-tipo');
        const titulo = btnSuggestion.getAttribute('data-titulo');
        const textoCompleto = btnSuggestion.getAttribute('data-texto');

        document.getElementById('tx-tipo').value = tipo;
        document.getElementById('tx-entregable').value = titulo;
        
        document.getElementById('tx-prompt').value = `Instrucción Táctica: Genera el entregable principal de este flujo.\n\nRequerimiento: ${textoCompleto}\n\nAsegúrate de cumplir con tu misión de rol y aplicar las directrices globales del proyecto.`;
        
        const promptBox = document.getElementById('tx-prompt');
        promptBox.style.boxShadow = '0 0 15px var(--accent-green)';
        setTimeout(() => promptBox.style.boxShadow = 'none', 500);
    }

    // Crear Transacción con Prompt Táctico
    if (e.target.id === 'btn-add-tx-edit') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('tx-from').value;
        const to = document.getElementById('tx-to').value;
        const entregable = document.getElementById('tx-entregable').value;
        const tipo = document.getElementById('tx-tipo').value;
        const promptTactico = document.getElementById('tx-prompt').value;

        if (!entregable) return alert("Define el nombre del entregable.");

        store.dispatch({ 
            type: 'ADD_TRANSACTION', 
            payload: { 
                projectId, 
                tx: { from, to, entregable, tipo, systemPrompt: promptTactico, horas: 1 } 
            } 
        });
        document.getElementById('app').innerHTML = ProjectEditView.render(projectId);
    }
});

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Proyecto no encontrado</h2></div>`;

        const activeRoles = project.roles.filter(r => !r.isArchived);
        const optionsHtml = activeRoles.map(n => `<option value="${n.id}">${n.name} (${n.levelId})</option>`).join('');

        const levelOptions = [
            { id: "@anxaneta", label: "Strategy (@anxaneta)" },
            { id: "@aixecador", label: "Creative/Coord (@aixecador)" },
            { id: "@dosos", label: "Quality/Audit (@dosos)" },
            { id: "@baixos", label: "Operational (@baixos)" },
            { id: "@pinya", label: "Support/Base (@pinya)" }
        ];

        // 🧠 Cargamos las sugerencias del primer rol por defecto
        const initialSuggestionsHtml = activeRoles.length > 0 ? generateSuggestionsHtml(activeRoles[0].id, project) : '';

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1>⚙️ Diseñador de Ontología y Prompts: ${project.nombre}</h1>
                        <p class="text-muted">Ajusta la base estratégica, los roles y las instrucciones tácticas para la IA</p>
                    </div>
                    <button class="btn btn-secondary" onclick="location.hash='#/project/${projectId}'">← Volver al Mapa</button>
                </header>

                <div style="display: grid; grid-template-columns: 380px 1fr; gap: 30px;">
                    
                    <section class="panel" style="border-left: 4px solid var(--accent-purple); align-self: start;">
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
                                style="height: 180px; line-height: 1.5; font-family: monospace; background: #000; color: #a5d6ff; resize: vertical;" 
                                placeholder="Define el propósito central del proyecto...">${project.description || ''}</textarea>
                            <p class="text-small text-muted" style="margin-top: 5px;">* Esta descripción define el comportamiento global de todos los agentes IA.</p>
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
                        <h3>Gestión de Roles y Prompts de Agente</h3>
                        <p class="text-muted text-small">Edita los nombres, niveles y el comportamiento específico (System Prompt) de cada rol.</p>
                        
                        <div style="margin-bottom: 25px;">
                            ${activeRoles.map(r => `
                                <div class="panel-surface" style="padding: 15px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 40px; gap: 15px; align-items: center;">
                                        <div>
                                            <label class="text-small text-muted" style="display:block; font-size:0.6rem; letter-spacing: 0.05rem;">NOMBRE DEL ROL</label>
                                            <input type="text" 
                                                   class="form-control edit-role-name" 
                                                   data-pid="${projectId}" 
                                                   data-rid="${r.id}" 
                                                   value="${r.name}" 
                                                   style="margin:0; border-color: transparent; background: rgba(0,0,0,0.2); font-weight: bold;">
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
                                    
                                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border-color);">
                                        <label class="text-small text-muted" style="display:block; font-size:0.65rem; letter-spacing: 0.05rem; color: var(--accent-purple);">SYSTEM PROMPT DEL ROL (Misión y Sugerencias)</label>
                                        <textarea class="form-control role-prompt-input" data-pid="${projectId}" data-rid="${r.id}" 
                                            style="min-height: 80px; background: rgba(0,0,0,0.3); color: #d2a8ff; font-family: monospace; font-size: 0.8rem; margin: 5px 0 0 0; border-color: transparent;" 
                                            placeholder="Añade aquí las instrucciones y etiquetas [Tangible] o [Intangible] para alimentar el sugeridor...">${r.systemPrompt || ''}</textarea>
                                    </div>
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

                <section class="panel" style="border-color: var(--accent-green); margin-top: 30px;">
                    <h3 style="color: var(--accent-green); margin-top: 0;">📝 Flujos de Valor e Instrucciones Tácticas</h3>
                    <p class="text-small text-muted">Añade entregables al Mapa de Valor. Usa las sugerencias de la IA para autocompletar rápidamente.</p>
                    
                    <div class="panel-surface" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: start;">
                        
                        <div>
                            <label class="form-label">Emisor (Quién lo hace):</label>
                            <select id="tx-from" data-pid="${projectId}" class="form-control text-small">${optionsHtml}</select>
                            
                            <div id="tx-suggestions-container">
                                ${initialSuggestionsHtml}
                            </div>
                            
                            <hr style="border-color: rgba(255,255,255,0.05); margin: 20px 0;">

                            <label class="form-label">Receptor (Para quién es):</label>
                            <select id="tx-to" class="form-control text-small">${optionsHtml}</select>
                            
                            <label class="form-label">Nombre del Entregable:</label>
                            <input id="tx-entregable" class="form-control text-small" placeholder="Haz clic en una sugerencia arriba...">
                            
                            <label class="form-label">Tipo de Flujo:</label>
                            <select id="tx-tipo" class="form-control text-small">
                                <option value="tangible">Tangible (Material / Contrato)</option>
                                <option value="intangible">Intangible (Feedback / Guía)</option>
                            </select>
                        </div>

                        <div style="display: flex; flex-direction: column; height: 100%;">
                            <label class="form-label" style="color: var(--accent-green);">Prompt del Entregable (Instrucción a la IA):</label>
                            <textarea id="tx-prompt" class="form-control" 
                                style="flex-grow: 1; min-height: 150px; background: #000; color: #7ee787; font-family: monospace; font-size: 0.8rem;" 
                                placeholder="El texto se autocompletará aquí cuando hagas clic en una sugerencia..."></textarea>
                            
                            <button id="btn-add-tx-edit" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-top: 15px;">
                                Inyectar al Mapa de Valor →
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        `;
    }
};
