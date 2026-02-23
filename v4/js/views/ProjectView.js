/**
 * TEAMTOWERS v4 - VISTA DE PROYECTO (CANVAS)
 * Gestiona la interfaz del proyecto, edición de roles e inyección de flujos.
 */
import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

// --- FUNCIONES DE INTERACCIÓN (GLOBALES) ---

/**
 * Permite renombrar un rol del gremio para este proyecto específico.
 */
window.editRol = (projectId, rolId, newName) => {
    store.dispatch({
        type: 'UPDATE_ROLE_NAME',
        payload: { projectId, rolId, newName }
    });
};

/**
 * Recoge los datos del formulario y registra una transacción VNA.
 */
window.addTx = (projectId) => {
    const from = document.getElementById('f-from').value;
    const to = document.getElementById('f-to').value;
    const tipo = document.getElementById('f-tipo').value;
    const concepto = document.getElementById('f-concepto').value;
    const horas = document.getElementById('f-horas').value;

    if (!concepto || !horas) {
        return alert("Por favor, completa el concepto y las horas.");
    }

    store.dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
            projectId,
            transaction: { 
                rolId: from, // IMPORTANTE: Enviamos el ID técnico (@anxaneta)
                to: to, 
                tipo_flujo: tipo, 
                concepto: concepto, 
                horas: parseFloat(horas) 
            }
        }
    });

    // Resetear solo el campo de concepto para agilizar la carga múltiple
    document.getElementById('f-concepto').value = "";
};

// --- COMPONENTE VIEW ---

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);

        if (!project) {
            return `
                <div style="padding:40px; text-align:center; color:#8b949e;">
                    <h2>🚫 Proyecto no encontrado</h2>
                    <a href="index.html" style="color:#58a6ff;">Volver al Dashboard</a>
                </div>
            `;
        }

        return `
            <div style="max-width:1000px; margin:0 auto; padding:20px; color:#c9d1d9; font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
                
                <header style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:30px; border-bottom:1px solid #30363d; padding-bottom:20px;">
                    <div>
                        <h1 style="margin:0; font-size:1.8rem; color:#f0f6fc;">${project.nombre}</h1>
                        <span style="display:inline-block; margin-top:5px; padding:2px 8px; background:#1f6feb; border-radius:12px; font-size:0.7rem; font-weight:bold; text-transform:uppercase;">
                            Sector: ${project.sector}
                        </span>
                    </div>
                    <a href="index.html" style="color:#8b949e; text-decoration:none; font-size:0.9rem; border:1px solid #30363d; padding:8px 16px; border-radius:6px;">← Dashboard</a>
                </header>

                <section style="background:#161b22; border:1px solid #30363d; border-radius:8px; padding:20px; margin-bottom:25px;">
                    <h3 style="margin-top:0; font-size:0.8rem; color:#8b949e; text-transform:uppercase; letter-spacing:1px;">Estructura del Gremio (Edición de Roles)</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap:15px;">
                        ${Object.keys(project.customRoles).map(rolId => `
                            <div>
                                <label style="display:block; font-size:0.65rem; color:#58a6ff; margin-bottom:5px; font-weight:bold;">${rolId}</label>
                                <input type="text" 
                                       value="${project.customRoles[rolId]}" 
                                       onchange="window.editRol('${projectId}', '${rolId}', this.value)"
                                       style="width:100%; background:#0d1117; border:1px solid #30363d; color:#f0f6fc; padding:8px; border-radius:4px; font-size:0.85rem; box-sizing:border-box;">
                            </div>
                        `).join('')}
                    </div>
                </section>

                ${ValueMapView.render(projectId)}

                <section style="background:#0d1117; border:1px solid #30363d; border-radius:8px; padding:25px; margin-top:25px;">
                    <h3 style="margin-top:0; font-size:1rem; color:#f0f6fc; margin-bottom:20px;">Registrar Flujo de Valor</h3>
                    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px;">
                        
                        <div style="display:flex; flex-direction:column;">
                            <label style="font-size:0.75rem; color:#8b949e; margin-bottom:5px;">Origen (DE)</label>
                            <select id="f-from" style="padding:10px; background:#161b22; color:#f0f6fc; border:1px solid #30363d; border-radius:6px;">
                                ${Object.keys(project.customRoles).map(id => `
                                    <option value="${id}">${project.customRoles[id]} (${id})</option>
                                `).join('')}
                            </select>
                        </div>

                        <div style="display:flex; flex-direction:column;">
                            <label style="font-size:0.75rem; color:#8b949e; margin-bottom:5px;">Destino (PARA)</label>
                            <select id="f-to" style="padding:10px; background:#161b22; color:#f0f6fc; border:1px solid #30363d; border-radius:6px;">
                                <option value="@proyecto">📦 @PROYECTO (Castell)</option>
                                ${Object.keys(project.customRoles).map(id => `
                                    <option value="${id}">${project.customRoles[id]}</option>
                                `).join('')}
                            </select>
                        </div>

                        <div style="display:flex; flex-direction:column;">
                            <label style="font-size:0.75rem; color:#8b949e; margin-bottom:5px;">Tipo de Capital</label>
                            <select id="f-tipo" style="padding:10px; background:#161b22; color:#f0f6fc; border:1px solid #30363d; border-radius:6px;">
                                <option value="tangible">💎 Tangible (Producto/Resultado)</option>
                                <option value="intangible">🧬 Intangible (Conocimiento/Relación)</option>
                            </select>
                        </div>

                        <div style="grid-column: span 2; display:flex; flex-direction:column;">
                            <label style="font-size:0.75rem; color:#8b949e; margin-bottom:5px;">Entregable / Concepto</label>
                            <input id="f-concepto" type="text" placeholder="Ej: Diseño de Interfaz v1.0 o Feedback técnico" 
                                   style="padding:10px; background:#0d1117; color:#f0f6fc; border:1px solid #30363d; border-radius:6px;">
                        </div>

                        <div style="display:flex; flex-direction:column;">
                            <label style="font-size:0.75rem; color:#8b949e; margin-bottom:5px;">Horas Invertidas</label>
                            <input id="f-horas" type="number" value="1" step="0.5" 
                                   style="padding:10px; background:#0d1117; color:#f0f6fc; border:1px solid #30363d; border-radius:6px;">
                        </div>

                        <button onclick="window.addTx('${projectId}')" 
                                style="grid-column: span 3; background:#238636; color:#ffffff; border:none; padding:15px; border-radius:6px; font-weight:bold; font-size:1rem; cursor:pointer; margin-top:10px;">
                            Registrar en el Mapa de Valor
                        </button>
                    </div>
                </section>
            </div>
        `;
    }
};
