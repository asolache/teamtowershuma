import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "Cargando...";

        return `
            <div style="display:grid; grid-template-columns: 1fr 350px; gap:20px; padding:20px;">
                <section>
                    <h2 style="color:white;">Agile Canvas: ${project.nombre}</h2>
                    ${ValueMapView.render(projectId)}
                    
                    <div style="margin-top:20px; background:#161b22; padding:20px; border-radius:12px; border:1px solid #30363d;">
                        <h3 style="color:#3b82f6; margin-top:0;">Inyectar Transacción de Valor</h3>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                            <label style="color:#8b949e; font-size:0.8rem;">Origen (Quién)</label>
                            <label style="color:#8b949e; font-size:0.8rem;">Destino (Para quién)</label>
                            
                            <select id="f-from" style="padding:8px; background:#0d1117; color:white; border:1px solid #30363d;">
                                ${state.roles.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('')}
                            </select>
                            <select id="f-to" style="padding:8px; background:#0d1117; color:white; border:1px solid #30363d;">
                                <option value="@proyecto">@proyecto (Global)</option>
                                ${state.roles.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('')}
                            </select>
                            
                            <input id="f-concepto" placeholder="¿Qué entregable?" style="grid-column: span 2; padding:10px; background:#0d1117; color:white; border:1px solid #30363d;">
                            <input id="f-horas" type="number" value="1" style="padding:10px; background:#0d1117; color:white; border:1px solid #30363d;">
                            
                            <button onclick="window.ejecutarTransaccion('${projectId}')" style="background:#238636; color:white; border:none; padding:10px; font-weight:bold; cursor:pointer; border-radius:6px;">
                                REGISTRAR Y MAPEAR
                            </button>
                        </div>
                    </div>
                </section>

                <aside style="background:#161b22; padding:20px; border-radius:12px; border:1px solid #30363d;">
                    <h3 style="color:white; margin-top:0;">Historial de Memes</h3>
                    <div style="max-height:600px; overflow-y:auto;">
                        ${project.transactions.slice().reverse().map(tx => `
                            <div style="border-bottom:1px solid #30363d; padding:10px 0; font-size:0.8rem;">
                                <div style="color:#3b82f6; font-weight:bold;">${tx.from} ➔ ${tx.to}</div>
                                <div style="color:white;">${tx.concepto}</div>
                                <div style="color:#2ea043; font-weight:bold;">${tx.liquidación}€</div>
                            </div>
                        `).join('')}
                    </div>
                </aside>
            </div>
        `;
    }
};
