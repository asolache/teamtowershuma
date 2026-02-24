import { state } from '../state.js';

export const ValueMapView = {
    render: () => {
        const roles = state.getRoles();
        const flows = state.getFlows();
        const health = state.getNetworkHealth();

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1 class="text-accent">🗺️ Mapa de Red de Valor</h1>
                        <p class="text-muted">Visualización de Conversión de Activos (Verna Allee)</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" id="btn-add-node">+ Añadir Rol</button>
                        <button class="btn btn-secondary" onclick="location.hash='#/'">Volver</button>
                    </div>
                </header>

                <div class="grid-layout" style="grid-template-columns: 300px 1fr;">
                    <aside class="panel">
                        <h4>Salud de la Red</h4>
                        <div class="panel-surface" style="margin-bottom: 15px;">
                            <div class="text-small">Ratio Intangibles: <b>${health.ratio}%</b></div>
                            <div class="text-small">Estado: <b style="color:var(--accent-green)">${health.balance}</b></div>
                        </div>
                        
                        <h4>Leyenda VNA</h4>
                        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 20px; height: 2px; background: var(--accent-blue);"></div> 
                                <span>Tangible (Contratos/Entregables)</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 20px; height: 2px; border-top: 2px dashed var(--accent-purple);"></div> 
                                <span>Intangible (Conocimiento/Confianza)</span>
                            </div>
                        </div>
                    </aside>

                    <main class="panel" style="position: relative; height: 600px; overflow: hidden; background: #0d1117; border-radius: 12px; border: 1px solid var(--border-color);">
                        <svg id="vna-svg" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none;">
                            <defs>
                                <marker id="arrow-blue" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-blue)" />
                                </marker>
                                <marker id="arrow-purple" viewBox="0 0 10 10" refX="25" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-purple)" />
                                </marker>
                            </defs>
                        </svg>

                        <div id="vna-nodes">
                            ${roles.map((role, i) => {
                                // Distribución circular básica para que no se solapen
                                const angle = (i / roles.length) * (2 * Math.PI);
                                const x = 350 + 200 * Math.cos(angle);
                                const y = 250 + 180 * Math.sin(angle);
                                return `
                                    <div class="role-node" id="${role.id}" 
                                         style="position: absolute; left: ${x}px; top: ${y}px; transform: translate(-50%, -50%);
                                                background: var(--bg-panel); border: 2px solid var(--accent-blue);
                                                padding: 10px; border-radius: 50%; width: 80px; height: 80px;
                                                display: flex; flex-direction: column; align-items: center; justify-content: center;
                                                cursor: pointer; z-index: 2; box-shadow: 0 0 15px rgba(0,0,0,0.5);">
                                        <span style="font-size: 1.5rem;">${role.icon || '👤'}</span>
                                        <span style="font-size: 0.6rem; font-weight: bold; color: white;">${role.handle}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </main>
                </div>
            </div>
        `;
    },

    afterRender: () => {
        const svg = document.getElementById('vna-svg');
        const roles = state.getRoles();
        const flows = state.getFlows();

        // Dibujar líneas de flujo entre roles
        flows.forEach(flow => {
            const fromEl = document.getElementById(flow.from);
            const toEl = document.getElementById(flow.to);

            if (fromEl && toEl) {
                const x1 = parseFloat(fromEl.style.left);
                const y1 = parseFloat(fromEl.style.top);
                const x2 = parseFloat(toEl.style.left);
                const y2 = parseFloat(toEl.style.top);

                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", x1);
                line.setAttribute("y1", y1);
                line.setAttribute("x2", x2);
                line.setAttribute("y2", y2);
                
                if (flow.type === 'intangible') {
                    line.setAttribute("stroke", "var(--accent-purple)");
                    line.setAttribute("stroke-dasharray", "5,5");
                    line.setAttribute("marker-end", "url(#arrow-purple)");
                } else {
                    line.setAttribute("stroke", "var(--accent-blue)");
                    line.setAttribute("marker-end", "url(#arrow-blue)");
                }
                line.setAttribute("stroke-width", "2");
                svg.appendChild(line);
            }
        });

        // Botón para añadir roles dinámicamente
        document.getElementById('btn-add-node')?.addEventListener('click', () => {
            const name = prompt("Nombre del Rol (ej: @analista):");
            if (name) {
                state.addRole(name, "Operativa", "🛠️");
                // Forzar re-render de la vista actual
                const app = document.getElementById('app');
                app.innerHTML = ValueMapView.render();
                ValueMapView.afterRender();
            }
        });
    }
};
