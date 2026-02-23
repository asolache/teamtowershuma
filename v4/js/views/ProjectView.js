/**
 * VISTA: ProjectView v4.2
 * Incluye: ResilienceBar, VNA Graph y CSS Shake Reactivo
 */
import { store } from '../core/store.js';
import { ValueMapView } from './ValueMapView.js';
import { ResilienceBar } from './ResilienceBar.js';

export const ProjectView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        
        // 1. Validación de existencia
        if (!project) return `
            <div style="padding:100px; text-align:center; color:#8b949e;">
                <h2>⚠️ Proyecto no encontrado</h2>
                <button onclick="location.hash='#/'" style="background:none; border:1px solid #30363d; color:#58a6ff; cursor:pointer; padding:10px 20px; border-radius:6px;">Volver al Dashboard</button>
            </div>
        `;

        // 2. Cálculo de métricas de salud (Watchdog)
        const salud = store.calculateResilience(projectId);
        const alerts = store.getAlerts(projectId);

        // 3. Inyección de Estilo Shake (Solo si la resiliencia es crítica < 30%)
        const shakeEffect = (salud < 30) ? `
            <style>
                @keyframes sos-vibration {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    20% { transform: translate(-2px, 0px) rotate(-1deg); }
                    40% { transform: translate(2px, 2px) rotate(1deg); }
                    60% { transform: translate(-1px, -1px) rotate(-1deg); }
                    80% { transform: translate(3px, 1px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(1deg); }
                }
                /* Aplicamos la vibración a los nodos del grafo y a la barra lateral */
                .vna-node, .alert-critical { 
                    animation: sos-vibration 0.3s infinite; 
                }
                .resilience-red { box-shadow: 0 0 20px rgba(248, 81, 73, 0.4); }
            </style>
        ` : '';

        return `
            ${shakeEffect}
            <div style="max-width: 1400px; margin: 0 auto; padding: 25px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                
                <header style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #30363d; padding-bottom: 20px; margin-bottom: 30px;">
                    <div>
                        <nav style="margin-bottom: 10px;">
                            <a href="#/" style="color: #8b949e; text-decoration: none; font-size: 0.8rem;">Dashboard</a> 
                            <span style="color: #30363d; margin: 0 8px;">/</span>
                            <span style="color: #58a6ff; font-size: 0.8rem;">${project.sector}</span>
                        </nav>
                        <h1 style="color: #f0f6fc; margin: 0; font-size: 1.8rem; letter-spacing: -0.5px;">${project.nombre}</h1>
                    </div>
                    <div style="text-align: right;">
                        <button onclick="window.resetProject('${projectId}')" style="background:none; border:1px solid #30363d; color:#f85149; padding:8px 12px; border-radius:6px; font-size: 0.75rem; cursor:pointer;">Limpiar Ledger</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 320px 1fr; gap: 30px; align-items: start;">
                    
                    <aside>
                        <div class="${salud < 30 ? 'alert-critical resilience-red' : ''}">
                            ${ResilienceBar.render(salud, alerts)}
                        </div>
                        
                        <div style="background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; margin-top: 20px;">
                            <h3 style="color: #f0f6fc; font-size: 0.85rem; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Estructura del Gremio</h3>
                            ${Object.keys(project.customRoles).map(rolId => `
                                <div style="margin-bottom: 15px;">
                                    <label style="display:block; font-size: 0.65rem; color: #8b949e; margin-bottom: 4px;">ID de Rol: ${rolId}</label>
                                    <input type="text" value="${project.customRoles[rolId]}" 
                                           onchange="window.editRol('${projectId}', '${rolId}', this.value)"
                                           style="width: 100%; background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; padding: 10px; border-radius: 6px; font-size: 0.85rem; box-sizing: border-box;">
                                </div>
                            `).join('')}
                        </div>
                    </aside>

                    <main>
                        <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 12px; height: 500px; position: relative; overflow: hidden; box-shadow: inset 0 0 40px rgba(0,0,0,0.5);">
                            ${ValueMapView.render(projectId)}
                            <div style="position: absolute; bottom: 15px; right: 15px; color: #30363d; font-size: 0.6rem; pointer-events: none;">
                                SOS_ENGINE_V4.2 // VNA_ENABLED
                            </div>
                        </div>

                        <div style="background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 25px; margin-top: 25px;">
                            <h3 style="color: #f0f6fc; font-size: 1rem; margin-top: 0; margin-bottom: 20px;">Nuevas Transacciones de Valor</h3>
                            <div style="display: grid; grid-template-columns: 180px 1fr 80px 140px; gap: 15px;">
                                <select id="f-from" style="padding: 12px; background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; border-radius: 6px;">
                                    ${Object.keys(project.customRoles).map(id => `
                                        <option value="${id}">${project.customRoles[id]}</option>
                                    `).join('')}
                                </select>
                                
                                <input id="f-concepto" type="text" placeholder="¿Qué entregable se ha completado?" 
                                       style="padding: 12px; background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; border-radius: 6px;">
                                
                                <div style="position:relative;">
                                    <input id="f-horas" type="number" value="1" min="1"
                                           style="width: 100%; padding: 12px; background: #0d1117; color: #f0f6fc; border: 1px solid #30363d; border-radius: 6px; box-sizing: border-box;">
                                    <span style="position:absolute; right: -25px; top: 12px; color: #444; font-size: 0.8rem;">h</span>
                                </div>

                                <button onclick="window.addTx('${projectId}')" 
                                        style="background: #238636; color: #ffffff; border: none; font-weight: bold; padding: 12px; border-radius: 6px; cursor: pointer; transition: filter 0.2s;">
                                    Inject Value
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        `;
    }
};

// --- MÉTODOS DE INTERACCIÓN GLOBAL ---

window.editRol = (pId, rId, name) => {
    store.dispatch({ 
        type: 'UPDATE_ROLE_NAME', 
        payload: { projectId: pId, rolId: rId, newName: name } 
    });
    // Notificamos para re-renderizar
};

window.addTx = (pId) => {
    const from = document.getElementById('f-from').value;
    const concepto = document.getElementById('f-concepto').value;
    const horas = document.getElementById('f-horas').value;
    
    if (!concepto) {
        alert("El SOS requiere un concepto claro para validar el flujo.");
        return;
    }

    store.dispatch({ 
        type: 'ADD_TRANSACTION', 
        payload: { 
            projectId: pId, 
            transaction: { 
                rolId: from, 
                horas: parseFloat(horas), 
                concepto: concepto,
                tipo_flujo: 'tangible' // Por defecto v4
            } 
        } 
    });
    // Forzamos re-renderizado
    location.reload(); 
};

window.resetProject = (pId) => {
    if(confirm("¿Seguro que quieres vaciar el Ledger? Esta acción es irreversible.")) {
        const state = store.getState();
        const p = state.projects.find(x => x.id === pId);
        if(p) {
            p.transactions = [];
            store.save();
            location.reload();
        }
    }
};
