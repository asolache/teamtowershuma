import { store } from '../core/store.js';

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div style="padding:50px; color:white;">Proyecto no encontrado</div>`;

        // Compilamos el "cerebro" en tiempo real para previsualizarlo
        const systemPrompt = store.generateSystemPrompt(projectId);

        // Separamos roles activos de los archivados (Legacy)
        const activeDynamicRoles = (project.dynamicRoles || []).filter(dr => !dr.isArchived);
        const archivedRoles = (project.dynamicRoles || []).filter(dr => dr.isArchived);

        // 🛡️ DICCIONARI DE SEQÜÈNCIES PER DEFECTE
        const defaultSeq = { "@anxaneta": 1, "@aixecador": 2, "@dosos": 3, "@baixos": 4, "@pinya": 5 };

        return `
            <div style="max-width: 1400px; margin: 0 auto; padding: 25px; font-family: sans-serif; color: #c9d1d9;">
                
                <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 20px; margin-bottom: 30px;">
                    <div>
                        <h1 style="color: #58a6ff; margin: 0; font-size: 1.8rem;">⚙️ Diseñador de Ecosistema: ${project.nombre}</h1>
                        <p style="color:#8b949e; margin: 5px 0 0 0; font-size: 0.9rem;">Fase de Arquitectura, Secuenciación y Contexto IA</p>
                    </div>
                    <button onclick="location.hash='#/project/${projectId}'" style="background:#238636; border:none; color:#fff; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold; font-size: 1rem; transition: 0.2s;">Guardar y Operar ➔</button>
                </header>

                <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 30px;">
                    
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <section style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px;">
                            <h3 style="color: #f0f6fc; margin-top: 0; border-bottom: 1px solid #30363d; padding-bottom: 10px;">1. Propósito y Misión</h3>
                            
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <label style="display:block; font-size: 0.8rem; color: #8b949e; margin-bottom: 5px;">Nombre del Proyecto</label>
                                    <input id="edit-name" type="text" value="${project.nombre}" style="width: 100%; background:#0d1117; color:white; border:1px solid #30363d; padding:10px; border-radius:4px; box-sizing:border-box;">
                                </div>
                                <div>
                                    <label style="display:block; font-size: 0.8rem; color: #8b949e; margin-bottom: 5px;">Sector Base</label>
                                    <select id="edit-sector" style="width: 100%; background:#0d1117; color:white; border:1px solid #30363d; padding:10px; border-radius:4px; box-sizing:border-box;">
                                        ${Object.keys(state.ontology.sectores).map(s => `
                                            <option value="${s}" ${project.sector === s ? 'selected' : ''}>${s.toUpperCase()}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            </div>

                            <div style="margin-bottom: 15px;">
                                <label style="display:block; font-size: 0.8rem; color: #8b949e; margin-bottom: 5px;">Prompt Maestro (Define las reglas del juego para la IA)</label>
                                <textarea id="edit-desc" placeholder="Ej: Este ecosistema se encarga de auditar Smart Contracts. Debemos priorizar la seguridad..." style="width: 100%; height: 80px; background:#0d1117; color:white; border:1px solid #30363d; padding:10px; border-radius:4px; box-sizing:border-box; font-family:sans-serif;">${project.description || ''}</textarea>
                            </div>

                            <button onclick="window.saveProjectInfo('${projectId}')" style="background:#21262d; color:#c9d1d9; border:1px solid #30363d; padding:10px 15px; border-radius:4px; cursor:pointer; width:100%; font-weight:bold;">Actualizar Metadatos</button>
                        </section>

                        <section style="background: #0d1117; border: 1px solid #a371f7; border-radius: 8px; padding: 20px; box-shadow: inset 0 0 20px rgba(163, 113, 247, 0.05);">
                            <h3 style="color: #a371f7; margin-top:0; font-size: 1.1rem;">🧠 Espejo de Consciencia (Contexto IA)</h3>
                            <p style="font-size: 0.8rem; color: #8b949e;">Esto es lo que el Agente leerá internamente cuando le pidas que analice el Ledger:</p>
                            <pre style="background: #010409; padding: 15px; border-radius: 6px; border: 1px solid #30363d; color: #c9d1d9; font-size: 0.8rem; white-space: pre-wrap; font-family: 'Cascadia Code', monospace; overflow-x: auto; line-height: 1.5;">${systemPrompt}</pre>
                        </section>
                    </div>

                    <section style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px;">
                        <h3 style="color: #f0f6fc; margin-top: 0; border-bottom: 1px solid #30363d; padding-bottom: 10px;">2. Secuenciación del Flujo de Valor</h3>
                        <p style="font-size: 0.8rem; color: #8b949e; margin-bottom: 20px;">Asigna la Fase numérica (1, 2, 3...) para crear la tubería lógica. Los roles en Fase 99 actuarán como soporte transversal.</p>
                        
                        <div style="max-height: 500px; overflow-y: auto; margin-bottom: 20px; padding-right: 10px;">
                            
                            <h4 style="font-size:0.75rem; color:#8b949e; text-transform:uppercase; margin-top:0;">Roles Base (Ontología)</h4>
                            ${Object.keys(project.customRoles).map(id => {
                                // Apliquem el diccionari per defecte
                                const seq = project.sequences?.[id] || defaultSeq[id] || 99;
                                return `
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#0d1117; padding:10px; border:1px solid #30363d; border-radius:6px; margin-bottom:8px;">
                                    <div style="display:flex; align-items:center; gap: 15px;">
                                        <div style="display:flex; flex-direction:column; align-items:center;">
                                            <label style="font-size:0.6rem; color:#8b949e; margin-bottom:2px;">FASE</label>
                                            <input type="number" value="${seq}" onchange="window.updateSequence('${projectId}', '${id}', this.value)" style="width: 45px; background:#161b22; color:#58a6ff; border:1px solid #30363d; padding:5px; border-radius:4px; text-align:center; font-weight:bold;">
                                        </div>
                                        <div>
                                            <span style="color:#238636; font-size:0.8rem; font-weight:bold;">${id}</span> 
                                            <div style="color:#c9d1d9; font-size:0.9rem;">${project.customRoles[id]}</div>
                                        </div>
                                    </div>
                                </div>
                                `;
                            }).join('')}
                            
                            <h4 style="font-size:0.75rem; color:#8b949e; text-transform:uppercase; margin-top:20px;">Especialistas Dinámicos</h4>
                            ${activeDynamicRoles.length === 0 ? '<p style="font-size:0.8rem; color:#484f58; font-style:italic;">Sin especialistas activos.</p>' : ''}
                            ${activeDynamicRoles.map(dr => {
                                const seq = project.sequences?.[dr.id] || 99;
                                return `
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#0d1117; padding:10px; border:1px solid #30363d; border-radius:6px; margin-bottom:8px;">
                                    <div style="display:flex; align-items:center; gap: 15px;">
                                        <div style="display:flex; flex-direction:column; align-items:center;">
                                            <label style="font-size:0.6rem; color:#8b949e; margin-bottom:2px;">FASE</label>
                                            <input type="number" value="${seq}" onchange="window.updateSequence('${projectId}', '${dr.id}', this.value)" style="width: 45px; background:#161b22; color:#58a6ff; border:1px solid #30363d; padding:5px; border-radius:4px; text-align:center; font-weight:bold;">
                                        </div>
                                        <div>
                                            <div style="color:#58a6ff; font-weight:bold; font-size:0.9rem;">${dr.name}</div>
                                            <div style="font-size:0.7rem; color:#8b949e;">${dr.area} | Nivel: ${dr.levelId}</div>
                                        </div>
                                    </div>
                                    <button onclick="window.archiveCustomRole('${projectId}', '${dr.id}')" title="Archivar (Desactivar operaciones pero mantener en Ledger)" style="background:transparent; border:1px solid #30363d; padding: 6px 10px; border-radius: 4px; color:#8b949e; cursor:pointer; font-size:0.8rem; transition:0.2s;" onmouseover="this.style.color='#f85149'; this.style.borderColor='#f85149'" onmouseout="this.style.color='#8b949e'; this.style.borderColor='#30363d'">📥</button>
                                </div>
                                `;
                            }).join('')}

                            ${archivedRoles.length > 0 ? `
                                <h4 style="font-size:0.7rem; color:#484f58; text-transform:uppercase; margin-top:20px; border-top: 1px dashed #30363d; padding-top:10px;">Archivados (Inmutables)</h4>
                                ${archivedRoles.map(dr => `
                                    <div style="display:flex; justify-content:space-between; align-items:center; background:#010409; padding:8px; border:1px dashed #30363d; border-radius:6px; margin-bottom:5px; opacity: 0.6;">
                                        <div>
                                            <div style="color:#8b949e; font-weight:bold; font-size:0.8rem;">${dr.name} <span style="font-size:0.6rem; background:#30363d; padding:2px 5px; border-radius:4px; color:#c9d1d9;">LEGACY</span></div>
                                        </div>
                                    </div>
                                `).join('')}
                            ` : ''}
                        </div>

                        <div style="background: #0d1117; border: 1px dashed #30363d; padding: 15px; border-radius: 4px;">
                            <h4 style="color: #c9d1d9; font-size: 0.85rem; margin-top: 0; margin-bottom: 10px;">+ Nuevo Rol Especializado</h4>
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
                                <button onclick="window.createRoleFromEdit('${projectId}')" style="grid-column: span 2; background:#238636; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; font-weight:bold;">Añadir al Gremio</button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }
};

window.saveProjectInfo = (projectId) => {
    const nombre = document.getElementById('edit-name').value;
    const sector = document.getElementById('edit-sector').value;
    const description = document.getElementById('edit-desc').value;
    store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, nombre, sector, description } });
    location.reload(); 
};

window.archiveCustomRole = (projectId, rolId) => {
    if(confirm("¿Archivar rol? Ya no podrá inyectar valor, pero su historial y los Hashes contables permanecerán intactos.")) {
        store.dispatch({ type: 'ARCHIVE_CUSTOM_ROLE', payload: { projectId, rolId } });
        location.reload();
    }
};

window.updateSequence = (projectId, rolId, sequence) => {
    store.dispatch({ type: 'UPDATE_ROLE_SEQUENCE', payload: { projectId, rolId, sequence } });
    location.reload(); 
};

window.createRoleFromEdit = (projectId) => {
    const name = document.getElementById('nr-name').value;
    const levelId = document.getElementById('nr-level').value;
    const area = document.getElementById('nr-area').value;
    if(!name) return alert("Nombre obligatorio");
    store.dispatch({ type: 'CREATE_CUSTOM_ROLE', payload: { projectId, name, levelId, area, description: '', skills: [] } });
    location.reload();
};
