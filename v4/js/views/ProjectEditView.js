import { store } from '../core/store.js';

export const ProjectEditView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div style="padding:50px; color:white;">Proyecto no encontrado</div>`;

        const systemPrompt = store.generateSystemPrompt(projectId);
        const activeDynamicRoles = (project.dynamicRoles || []).filter(dr => !dr.isArchived);
        const archivedRoles = (project.dynamicRoles || []).filter(dr => dr.isArchived);
        const defaultSeq = { "@anxaneta": 1, "@aixecador": 2, "@dosos": 3, "@baixos": 4, "@pinya": 5 };

        return `
            <div style="max-width: 1400px; margin: 0 auto; padding: 25px; font-family: sans-serif; color: #c9d1d9;">
                <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 20px; margin-bottom: 30px;">
                    <div>
                        <h1 style="color: #58a6ff; margin: 0; font-size: 1.8rem;">⚙️ Diseñador de Ecosistema: ${project.nombre}</h1>
                        <p style="color:#8b949e; margin: 5px 0 0 0; font-size: 0.9rem;">Arquitectura y Contexto IA</p>
                    </div>
                    <button onclick="location.hash='#/project/${projectId}'" style="background:#238636; border:none; color:#fff; padding:10px 20px; border-radius:6px; cursor:pointer; font-weight:bold;">Guardar y Volver ➔</button>
                </header>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <section style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px;">
                            <h3 style="color: #f0f6fc; margin-top: 0;">1. Propósito y Misión</h3>
                            <div style="margin-bottom: 15px;">
                                <label style="display:block; font-size: 0.8rem; color: #8b949e; margin-bottom: 5px;">Misión del Ecosistema (Prompt Maestro)</label>
                                <textarea id="edit-desc" style="width: 100%; height: 100px; background:#0d1117; color:white; border:1px solid #30363d; padding:10px; border-radius:4px; box-sizing:border-box;">${project.description || ''}</textarea>
                            </div>
                            <button onclick="window.saveProjectInfo('${projectId}')" style="background:#21262d; color:#c9d1d9; border:1px solid #30363d; padding:10px 15px; border-radius:4px; cursor:pointer; width:100%; font-weight:bold;">Actualizar Metadatos</button>
                        </section>

                        <section style="background: #0d1117; border: 1px solid #a371f7; border-radius: 8px; padding: 20px;">
                            <h3 style="color: #a371f7; margin-top:0; font-size: 1.1rem;">🧠 Contexto para el Agente (System Prompt)</h3>
                            <pre style="background: #010409; padding: 15px; border-radius: 6px; border: 1px solid #30363d; color: #c9d1d9; font-size: 0.8rem; white-space: pre-wrap; font-family: monospace;">${systemPrompt}</pre>
                        </section>
                    </div>

                    <section style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px;">
                        <h3 style="color: #f0f6fc; margin-top: 0;">2. Secuenciación del Flujo</h3>
                        <div style="max-height: 600px; overflow-y: auto;">
                            ${Object.keys(project.customRoles).map(id => {
                                const seq = project.sequences?.[id] || defaultSeq[id] || 99;
                                return `
                                    <div style="display:flex; justify-content:space-between; align-items:center; background:#0d1117; padding:10px; border:1px solid #30363d; border-radius:6px; margin-bottom:8px;">
                                        <div style="display:flex; align-items:center; gap: 15px;">
                                            <input type="number" value="${seq}" onchange="window.updateSequence('${projectId}', '${id}', this.value)" style="width: 45px; background:#161b22; color:#58a6ff; border:1px solid #30363d; text-align:center;">
                                            <div>
                                                <span style="color:#238636; font-size:0.8rem; font-weight:bold;">${id}</span> 
                                                <div style="color:#c9d1d9; font-size:0.9rem;">${project.customRoles[id]}</div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}

                            <h4 style="color:#8b949e; font-size:0.75rem; text-transform:uppercase; margin-top:20px;">Especialistas</h4>
                            ${activeDynamicRoles.map(dr => `
                                <div style="display:flex; justify-content:space-between; align-items:center; background:#0d1117; padding:10px; border:1px solid #30363d; border-radius:6px; margin-bottom:8px;">
                                    <div style="display:flex; align-items:center; gap: 15px;">
                                        <input type="number" value="${project.sequences?.[dr.id] || 99}" onchange="window.updateSequence('${projectId}', '${dr.id}', this.value)" style="width: 45px; background:#161b22; color:#58a6ff; border:1px solid #30363d; text-align:center;">
                                        <span style="color:#58a6ff; font-weight:bold;">${dr.name}</span>
                                    </div>
                                    <button onclick="window.archiveCustomRole('${projectId}', '${dr.id}')" style="background:transparent; border:none; cursor:pointer;">📥</button>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                </div>
            </div>
        `;
    }
};
