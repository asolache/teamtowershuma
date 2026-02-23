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

        // Generar las opciones de roles una sola vez para reutilizarlas en los selects
        const roleOptions = `
            <optgroup label="Roles Base">
                ${Object.keys(project.customRoles).map(id => `<option value="${id}">${project.customRoles[id]}</option>`).join('')}
            </optgroup>
            <optgroup label="Especialistas">
                ${(project.dynamicRoles || []).map(dr => `<option value="${dr.id}">${dr.name}</option>`).join('')}
            </optgroup>
        `;

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
                                <button onclick="window.createRole('${projectId}')" style="background:#238636; color:white; border:none; padding:12px; border-radius:4px; font-weight:bold; cursor:pointer;">Crear Nuevo Rol</button>
                            </div>
                        </div>

                        <div style="margin-top: 25px;">
                            <h4 style="font-size: 0.7rem; color: #8b949e; text-transform: uppercase; border-bottom: 1px solid #30363d; padding-bottom: 5px; margin-bottom: 10px;">Gremio Especializado</h4>
                            ${(project.dynamicRoles || []).map(dr => `
                                <div style="background:#0d1117; border:1px solid #21262d; padding:12px; border-radius:6px; margin-bottom:10px;">
                                    <div style="font-weight:bold; font-size:0.85rem; color:#f0f6fc;">${dr.name}</div>
                                    <div style="font-size:0.7rem; color:#58a6ff;">${dr.area} | ${dr.levelId.replace('@','')}</div>
                                </div>
                            `).join('')}
                        </div>
                    </aside>

                    <main>
                        <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 12px; height: 500px; position: relative; margin-bottom: 25px; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                            ${ValueMapView.render(projectId)}
                        </div>

                        <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                            <h3 style="color: #f0f6fc; font-size: 1rem; margin: 0 0 20px 0;">Inyectar Flujo de Valor</h3>
                            <div style="display: grid; grid-template-columns: 1fr 20px 1fr 2fr 80px 100px; gap: 10px; align-items: center;">
                                
                                <select id="f-from" title="Origen del Valor" style="padding: 10px; background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; border-radius: 6px;">
                                    ${roleOptions}
                                </select>
                                
                                <span style="color:#8b949e; text-align:center; font-weight:bold;">➔</span>
                                
                                <select id="f-to" title="Destinatario del Valor" style="padding: 10px; background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; border-radius: 6px;">
                                    ${roleOptions}
                                </select>

                                <input id="f-concepto" type="text" placeholder="¿Qué se ha entregado?" style="padding: 10px; background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; border-radius: 6px;">
                                <input id="f-horas" type="number" value="1" title="Horas" style="padding: 10px; background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; border-radius: 6px;">
                                <button onclick="window.addTx('${projectId}')" style="background: #238636; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer; padding: 10px;">Inyectar</button>
                            </div>
                        </div>

                        <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 25px;">
                            <h3 style="color: #f0f6fc; font-size: 1rem; margin: 0 0 20px 0;">Ledger del Proyecto</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                                <thead style="color:#8b949e; border-bottom:1px solid #30363d;">
                                    <tr>
                                        <th style="padding:10px; text-align:left;">Flujo (Origen ➔ Destino)</th>
                                        <th style="padding:10px; text-align:left;">Concepto</th>
                                        <th style="padding:10px; text-align:right;">Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${transactions.length === 0 ? '<tr><td colspan="3" style="padding:30px; text-align:center; color:#484f58;">No hay flujos de valor aún.</td></tr>' : ''}
                                    ${transactions.map(t => {
                                        const roleFromName = project.customRoles[t.rolId] || project.dynamicRoles?.find(dr => dr.id === t.rolId)?.name || 'Desconocido';
                                        const roleToName = project.customRoles[t.toId] || project.dynamicRoles?.find(dr => dr.id === t.toId)?.name || 'Proyecto';
                                        
                                        return `
                                        <tr style="border-bottom: 1px solid #21262d;">
                                            <td style="padding:12px; font-weight:500;">
                                                <span style="color:#58a6ff;">${roleFromName}</span> 
                                                <span style="color:#8b949e; font-size:0.8em; margin:0 5px;">➔</span> 
                                                <span style="color:#c9d1d9;">${roleToName}</span>
                                            </td>
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

window.createRole = (projectId) => {
    const name = document.getElementById('nr-name').value;
    const levelId = document.getElementById('nr-level').value;
    const area = document.getElementById('nr-area').value;
    if(!name) return alert("El nombre del rol es obligatorio.");
    store.dispatch({ type: 'CREATE_CUSTOM_ROLE', payload: { projectId, name, levelId, area, description: '', skills: [] } });
    location.reload();
};

window.addTx = (projectId) => {
    const fromId = document.getElementById('f-from').value;
    const toId = document.getElementById('f-to').value;
    const concepto = document.getElementById('f-concepto').value;
    const horas = parseFloat(document.getElementById('f-horas').value);
    
    if(!concepto) return alert("Indica un concepto para el Ledger.");
    if(fromId === toId) return alert("Un rol no puede inyectarse valor a sí mismo.");

    store.dispatch({ 
        type: 'ADD_TRANSACTION', 
        payload: { 
            projectId, 
            transaction: { 
                rolId: fromId, 
                toId: toId, 
                horas, 
                concepto 
            } 
        } 
    });
    location.reload();
};
