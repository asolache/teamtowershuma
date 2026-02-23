import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "<div style='color:white;'>Cargando Proyecto...</div>";

        return `
            <div style="display:grid; grid-template-columns: 1fr 380px; gap:25px; padding:20px; max-width:1400px; margin:auto;">
                <section>
                    <header style="margin-bottom:20px;">
                        <h1 style="color:white; margin:0;">${project.nombre}</h1>
                        <p style="color:#64748b; margin:5px 0;">VNA Value Mapping & Agile Canvas</p>
                    </header>

                    ${ValueMapView.render(projectId)}
                    
                    <div style="margin-top:25px; background:#0d1117; padding:25px; border-radius:12px; border:1px solid #30363d;">
                        <h3 style="color:#3b82f6; margin-top:0; font-size:1rem;">MODELAR TRANSACCIÓN DE VALOR</h3>
                        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:15px;">
                            <div>
                                <label style="color:#8b949e; font-size:0.7rem; display:block; margin-bottom:5px;">ORIGEN (ROL)</label>
                                <select id="f-from" style="width:100%; padding:10px; background:#161b22; color:white; border:1px solid #30363d; border-radius:6px;">
                                    ${state.roles.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="color:#8b949e; font-size:0.7rem; display:block; margin-bottom:5px;">DESTINO (CLIENTE VALOR)</label>
                                <select id="f-to" style="width:100%; padding:10px; background:#161b22; color:white; border:1px solid #30363d; border-radius:6px;">
                                    <option value="@proyecto">@proyecto (Global)</option>
                                    ${state.roles.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label style="color:#8b949e; font-size:0.7rem; display:block; margin-bottom:5px;">TIPO DE FLUJO</label>
                                <select id="f-tipo" style="width:100%; padding:10px; background:#161b22; color:white; border:1px solid #30363d; border-radius:6px;">
                                    <option value="tangible">TANGIBLE (Sólido)</option>
                                    <option value="intangible">INTANGIBLE (Punteado)</option>
                                </select>
                            </div>
                            <div style="grid-column: span 2;">
                                <label style="color:#8b949e; font-size:0.7rem; display:block; margin-bottom:5px;">ENTREGABLE (VALOR)</label>
                                <input id="f-concepto" placeholder="Ej: Arquitectura de Datos, Diseño UI..." style="width:95%; padding:10px; background:#161b22; color:white; border:1px solid #30363d; border-radius:6px;">
                            </div>
                            <div>
                                <label style="color:#8b949e; font-size:0.7rem; display:block; margin-bottom:5px;">HORAS</label>
                                <input id="f-horas" type="number" value="1" style="width:85%; padding:10px; background:#161b22; color:white; border:1px solid #30363d; border-radius:6px;">
                            </div>
                            <button onclick="window.ejecutarTransaccion('${projectId}')" style="grid-column: span 3; background:#238636; color:white; border:none; padding:15px; font-weight:bold; cursor:pointer; border-radius:6px; margin-top:10px;">
                                INYECTAR ENTREGABLE AL MAPA
                            </button>
                        </div>
                    </div>
                </section>

                <aside style="background:#0d1117; padding:20px; border-radius:12px; border:1px solid #30363d; height: fit-content;">
                    <h3 style="color:white; margin-top:0; font-size:1rem; border-bottom:1px solid #30363d; padding-bottom:10px;">LEDGER DE TRANSACCIONES</h3>
                    <div id="ledger-list" style="max-height:700px; overflow-y:auto;">
                        ${project.transactions.slice().reverse().map(tx => `
                            <div style="border-bottom:1px solid #21262d; padding:12px 0;">
                                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                                    <span style="color:#3b82f6; font-size:0.7rem; font-weight:bold;">${tx.from} ➔ ${tx.to}</span>
                                    <span style="color:${tx.tipo_flujo === 'tangible' ? '#e3b341' : '#a855f7'}; font-size:0.6rem;">${tx.tipo_flujo.toUpperCase()}</span>
                                </div>
                                <div style="color:white; font-size:0.85rem; font-weight:500;">${tx.concepto}</div>
                                <div style="display:flex; justify-content:space-between; margin-top:4px;">
                                    <span style="color:#8b949e; font-size:0.7rem;">${tx.horas}h invertidas</span>
                                    <span style="color:#4ade80; font-weight:bold; font-size:0.85rem;">${tx.liquidación}€</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </aside>
            </div>
        `;
    }
};
