import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';
import { ResilienceBar } from './ResilienceBar.js';

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div style="padding:50px; text-align:center;"><h2>Proyecto no encontrado</h2><a href="#/" style="color:#58a6ff;">Volver al Dashboard</a></div>`;

        const salud = store.calculateResilience(projectId);
        const alerts = store.getAlerts(projectId);
        const transactions = [...project.transactions].reverse();

        return `
            <div style="max-width: 1400px; margin: 0 auto; padding: 25px; font-family: sans-serif; color: #c9d1d9;">
                
                <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; padding-bottom: 20px; margin-bottom: 30px;">
                    <div>
                        <h1 style="color: #f0f6fc; margin: 0; font-size: 1.8rem;">${project.nombre} <small style="color:#8b949e; font-size: 0.9rem;">[${project.sector}]</small></h1>
                    </div>
                    <button onclick="location.hash='#/'" style="background:transparent; border:1px solid #30363d; color:#58a6ff; padding:8px 15px; border-radius:6px; cursor:pointer;">← Dashboard</button>
                </header>

                <div style="display: grid; grid-template-columns: 350px 1fr; gap: 30px;">
                    
                    <aside>
                        ${ResilienceBar.render(salud, alerts)}
                        
                        <div style="background: #161b22; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin-top: 20px;">
                            <h3 style="color: #58a6ff; font-size: 0.8rem; margin: 0 0 15px 0; text-transform: uppercase;">+ Añadir Rol al Gremio</h3>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <input id="nr-name" type="text" placeholder="Nombre (ej: Senior Auditor)" style="background:#0d1117; color:white; border:1px solid #30363d; padding:8px; border-radius:4px;">
                                <select id="nr-level" style="background:#0d1117; color:white; border:1px solid #30363d; padding:8px; border-radius:4px;">
                                    <option value="@anxaneta">Anxaneta (Estrategia)</option>
                                    <option value="@aixecador">Aixecador (Estructura)</option>
                                    <option value="@dosos">Dosos (Auditoría/Refinamiento)</option>
                                    <option value="@baixos">Baixos (Producción)</option>
                                    <option value="@pinya">Pinya (Infra/Soporte)</option>
                                </select>
                                <input id="nr-area" type="text" placeholder="Área (ej: Seguridad Web3)" style="background:#0d1117; color:white; border:1px solid #30363d; padding:8px; border-radius:4px;">
                                <textarea id="nr-desc" placeholder="Descripción del rol..." style="background:#0d1117; color:white; border:1px solid #30363d; padding:8px; border-radius:4px; height:50px; font-family:sans-serif;"></textarea>
                                <input id="nr-skills" type="text" placeholder="Skills (separadas por comas)" style="background:#0d1117; color:white; border:1px solid #30363d; padding:8px; border-radius:4px;">
                                <button onclick="window.createRole('${projectId}')" style="background:#238636; color:white; border:none; padding:12px; border-radius:4px; font-weight:bold; cursor:pointer;">Crear Nuevo Rol</button>
                            </div>
                        </div>

                        <div style="margin-top: 25px;">
                            <h4 style="font-size: 0.7rem; color: #8b949e; text-transform: uppercase; border-bottom: 1px solid #30363d; padding-bottom: 5px; margin-bottom: 10px;">Gremio Especializado</h4>
                            ${(project.dynamicRoles || []).length === 0 ? '<div style="color:#484f58; font-size:0.75rem;">No hay roles extra.</div>' : ''}
                            ${(project.dynamicRoles || []).map(dr => `
                                <div style="background:#0d1117; border:1px solid #21262d; padding:12px; border-radius:6px; margin-bottom:10px;">
                                    <div style="font-weight:bold; font-size:0.85rem; color:#f0f6fc;">${dr.name}</div>
                                    <div style="font-size:0.7rem; color:#58a6ff; margin-bottom:5px;">${dr.area} | ${dr.levelId.replace('@','')}</div>
                                    <div style="font-size:0.75rem; color:#8b949e; line-height:1.3;">${dr.description}</div>
                                    <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:4px;">
                                        ${dr.skills.map(s => `<span style="font-size:0.6rem; background:#161b22; color:#c9d1d9; border:1px solid #30363d; padding:2px 6px; border-radius:10px;">${s}</span>`).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </aside>

                    <main>
                        <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 12px; height: 450px; position: relative; margin-bottom: 25px; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                            ${ValueMapView.render(projectId)}
                        </div>

                        <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                            <h3 style="color: #f0f6fc; font-size: 1rem; margin: 0 0 20px 0;">Inyectar Valor al Sistema</h3>
                            <div style="display: grid; grid-template-columns: 1fr 2fr 80px 140px; gap: 15px;">
                                <select id="f-from" style="padding: 12px; background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; border-radius: 6px;">
                                    <optgroup label="Roles Base">
                                        ${Object.keys(project.customRoles).map(id => `<option value="${id}">${project.customRoles[id]}</option>`).join('')}
                                    </optgroup>
                                    <optgroup label="Especialistas">
                                        ${(project.dynamicRoles || []).map(dr => `<option value="${dr.id}">${dr.name}</option>`).join('')}
                                    </optgroup>
                                </select>
                                <input id="f-concepto" type="text" placeholder="¿Qué se ha entregado?" style="padding: 12px; background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; border-radius: 6px;">
                                <input id="f-horas" type="number" value="1" style="padding: 12px; background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; border-radius: 6px;">
                                <button onclick="window.addTx('${projectId}')" style="background: #238636; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer; transition: 0.2s;">Inyectar</button>
                            </div>
                        </div>

                        <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 25px;">
                            <h3 style="color: #f0f6fc; font-size: 1rem; margin: 0 0 20px 0;">Historial de Liquidaciones (Ledger)</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                                <thead style="color:#8b949e; border-bottom:1px solid #30363d;">
                                    <tr>
                                        <th style="padding:10px; text-align:left;">Origen</th>
                                        <th style="padding:10px; text-align:left;">Concepto</th>
                                        <th style="padding:10px; text-align:right;">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${transactions.length === 0 ? '<tr><td colspan="3" style="padding:30px; text-align:center; color:#484f58;">No hay flujos de valor aún.</td></tr>' : ''}
                                    ${transactions.map(t => {
                                        const roleName = project.customRoles[t.rolId] || (project.dynamicRoles.find(dr => dr.id === t.rolId)?.name);
                                        return `
                                        <tr style="border-bottom: 1px solid #21262d;">
                                            <td style="padding:12px; color:#58a6ff; font-weight:500;">${roleName}</td>
                                            <td style="padding:12px; color:#8b949e;">${t.concepto} <small>(${t.horas}h)</small></td>
                                            <td style="padding:12px; text-align:right; font-weight:bold; color:#3fb950;">${t.liquidación.toLocaleString()}€</td>
                                        </tr>`;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </main>
                </div>
            </div>
        `;
    }
};

// FUNCIONES GLOBALES DE ACCIÓN
window.createRole = (projectId) => {
    const name = document.getElementById('nr-name').value;
    const levelId = document.getElementById('nr-level').value;
    const area = document.getElementById('nr-area').value;
    const description = document.getElementById('nr-desc').value;
    const skills = document.getElementById('nr-skills').value.split(',').map(s => s.trim()).filter(s => s);
    
    if(!name) return alert("El nombre del rol es obligatorio.");
    store.dispatch({ type: 'CREATE_CUSTOM_ROLE', payload: { projectId, name, levelId, area, description, skills } });
    location.reload();
};

window.addTx = (projectId) => {
    const rolId = document.getElementById('f-from').value;
    const concepto = document.getElementById('f-concepto').value;
    const horas = parseFloat(document.getElementById('f-horas').value);
    if(!concepto) return alert("Indica un concepto para el Ledger.");
    store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId, transaction: { rolId, horas, concepto } } });
    location.reload();
};
