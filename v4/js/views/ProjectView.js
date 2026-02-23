import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

// --- FUNCIONES LOGICAS (GLOBALES PARA LA UI) ---
window.editRol = (projectId, rolId, newName) => {
    store.dispatch({
        type: 'UPDATE_ROLE_NAME',
        payload: { projectId, rolId, newName }
    });
};

window.addTx = (projectId) => {
    const from = document.getElementById('f-from').value;
    const to = document.getElementById('f-to').value;
    const tipo = document.getElementById('f-tipo').value;
    const concepto = document.getElementById('f-concepto').value;
    const horas = document.getElementById('f-horas').value;

    if (!concepto) return alert("Debes describir el entregable");

    store.dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
            projectId,
            transaction: { rolId: from, to, tipo_flujo: tipo, concepto, horas: parseFloat(horas) }
        }
    });

    document.getElementById('f-concepto').value = ""; // Limpiar input
};

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "<div style='color:white;'>Proyecto no encontrado...</div>";

        return `
            <div style="max-width:900px; margin:0 auto; padding:20px; color:white; font-family:sans-serif;">
                <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <div>
                        <h1 style="margin:0; font-size:1.5rem;">${project.nombre}</h1>
                        <span style="color:#58a6ff; font-size:0.8rem;">SECTOR: ${project.sector.toUpperCase()}</span>
                    </div>
                    <a href="index.html" style="color:#8b949e; text-decoration:none; font-size:0.8rem;">← Volver al Dashboard</a>
                </header>

                <div style="background:#161b22; padding:15px; border-radius:8px; border:1px solid #30363d; margin-bottom:20px;">
                    <h3 style="margin:0 0 10px 0; font-size:0.7rem; color:#8b949e; text-transform:uppercase;">Nombres de Roles en el Gremio</h3>
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:10px;">
                        ${Object.keys(project.customRoles).map(rolId => `
                            <div>
                                <label style="display:block; font-size:0.6rem; color:#3b82f6; margin-bottom:4px;">${rolId}</label>
                                <input type="text" value="${project.customRoles[rolId]}" 
                                       onchange="window.editRol('${projectId}', '${rolId}', this.value)"
                                       style="width:100%; background:#0d1117; border:1px solid #30363d; color:white; padding:6px; border-radius:4px; font-size:0.8rem; box-sizing:border-box;">
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${ValueMapView.render(projectId)}

                <div style="background:#0d1117; border:1px solid #30363d; padding:20px; border-radius:8px; display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
                    <div style="grid-column: span 3;"><h3 style="margin:0; font-size:0.9rem;">Inyectar Flujo de Valor</h3></div>
                    
                    <select id="f-from" style="padding:10px; background:#161b22; color:white; border:1px solid #30363d;">
                        ${Object.keys(project.customRoles).map(id => `<option value="${id}">DE: ${project.customRoles[id]}</option>`).join('')}
                    </select>

                    <select id="f-to" style="padding:10px; background:#161b22; color:white; border:1px solid #30363d;">
                        <option value="@proyecto">PARA: @PROYECTO</option>
                        ${Object.keys(project.customRoles).map(id => `<option value="${id}">PARA: ${project.customRoles[id]}</option>`).join('')}
                    </select>

                    <select id="f-tipo" style="padding:10px; background:#161b22; color:white; border:1px solid #30363d;">
                        <option value="tangible">TANGIBLE (Entregable)</option>
                        <option value="intangible">INTANGIBLE (Conocimiento/Confianza)</option>
                    </select>

                    <input id="f-concepto" placeholder="¿Qué valor se entrega? (ej: Diseño UI, Feedback...)" style="grid-column: span 2; padding:10px; background:#000; color:white; border:1px solid #30363d;">
                    
                    <input id="f-horas" type="number" value="1" step="0.5" style="padding:10px; background:#000; color:white; border:1px solid #30363d;">

                    <button onclick="window.addTx('${projectId}')" style="grid-column: span 3; background:#238636; color:white; border:none; padding:12px; border-radius:4px; font-weight:bold; cursor:pointer;">
                        REGISTRAR TRANSACCIÓN VNA
                    </button>
                </div>
            </div>
        `;
    }
};
