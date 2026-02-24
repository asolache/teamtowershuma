import { state } from '../state.js';

export const ValueMapView = {
    render: () => {
        const roles = state.getRoles();
        const flows = state.getFlows();
        const health = state.getNetworkHealth();

        return `
            <div class="container-fluid" style="padding: 20px;">
                <header class="header-main">
                    <div>
                        <h1 class="text-accent">🗺️ Red de Valor: Verna Allee Analysis</h1>
                        <p class="text-muted">Visualización de Conversión de Activos Tangibles e Intangibles</p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-primary" id="btn-add-role-vna">+ Añadir Rol</button>
                        <button class="btn btn-secondary" onclick="location.hash='#/'">Volver al Dash</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 280px 1fr; gap: 20px;">
                    <aside>
                        <div class="panel" style="margin-bottom: 20px; border-left: 4px solid var(--accent-purple);">
                            <h4>Salud de la Red</h4>
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent-purple);">${health.ratio}%</div>
                            <div class="text-small text-muted">Ratio de Intangibles</div>
                        </div>
                        
                        <div class="panel">
                            <h4>Leyenda de Flujos</h4>
                            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 30px; height: 2px; background: var(--accent-blue);"></div>
                                    <span class="text-small">Tangible (Contractual)</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 30px; height: 2px; border-top: 2px dashed var(--accent-purple);"></div>
                                    <span class="text-small">Intangible (Conocimiento)</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div id="vna-viewport" class="panel" style="position: relative; height: 75vh; background: #0d1117; overflow: hidden; border: 1px solid var(--border-color); border-radius: 12px;">
                        
                        <svg id="vna-svg" width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;">
                            <defs>
                                <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-blue)" />
                                </marker>
                                <marker id="arrowhead-purple" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-purple)" />
                                </marker>
                            </defs>
                        </svg>

                        <div id="vna-nodes-container" style="position: absolute; width: 100%; height: 100%; z-index: 2; pointer-events: none;">
                            ${roles.map(role => `
                                <div id="node-${role.id}" class="vna-node" style="position: absolute; pointer-events: auto;">
                                    <div style="background: var(--bg-panel); border: 2px solid var(--accent-blue); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
                                        ${role.icon || '👤'}
                                    </div>
                                    <div style="text-align: center; color: white; font-weight: bold; font-size: 0.75rem; margin-top: 5px; text-shadow: 1px 1px 2px black;">
                                        ${role.handle}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    afterRender: () => {
        const container = document.getElementById('vna-viewport');
        const svg = document.getElementById('vna-svg');
        const roles = state.getRoles();
        const flows = state.getFlows();

        if (!container || roles.length === 0) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        const radiusX = width * 0.35; // Distribución elíptica
        const radiusY = height * 0.35;

        // 1. Posicionar Roles en Elipse
        roles.forEach((role, i) => {
            const angle = (i / roles.length) * (2 * Math.PI) - (Math.PI / 2);
            const x = centerX + radiusX * Math.cos(angle);
            const y = centerY + radiusY * Math.sin(angle);
            
            const node = document.getElementById(`node-${role.id}`);
            if (node) {
                node.style.left = `${x - 30}px`;
                node.style.top = `${y - 30}px`;
                role._x = x; // Guardar para las flechas
                role._y = y;
            }
        });

        // 2. Dibujar Flechas y Entregables
        flows.forEach(flow => {
            const fromRole = roles.find(r => r.id === flow.from);
            const toRole = roles.find(r => r.id === flow.to);

            if (fromRole && toRole) {
                const isIntangible = flow.type === 'intangible';
                const color = isIntangible ? 'var(--accent-purple)' : 'var(--accent-blue)';
                
                // Crear Línea
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", fromRole._x);
                line.setAttribute("y1", fromRole._y);
                line.setAttribute("x2", toRole._x);
                line.setAttribute("y2", toRole._y);
                line.setAttribute("stroke", color);
                line.setAttribute("stroke-width", "2");
                if (isIntangible) line.setAttribute("stroke-dasharray", "5,5");
                line.setAttribute("marker-end", `url(#arrowhead-${isIntangible ? 'purple' : 'blue'})`);
                svg.appendChild(line);

                // Crear Texto del Entregable
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                const midX = (fromRole._x + toRole._x) / 2;
                const midY = (fromRole._y + toRole._y) / 2;
                
                text.setAttribute("x", midX);
                text.setAttribute("y", midY - 10);
                text.setAttribute("fill", "white");
                text.setAttribute("font-size", "10px");
                text.setAttribute("text-anchor", "middle");
                text.style.fontWeight = "bold";
                text.style.paintOrder = "stroke";
                text.style.stroke = "#0d1117";
                text.style.strokeWidth = "3px";
                text.textContent = flow.description;
                svg.appendChild(text);
            }
        });

        // Evento para añadir rol y refrescar
        document.getElementById('btn-add-role-vna')?.addEventListener('click', () => {
            const name = prompt("Nombre del nuevo Rol (ej: @ventas):");
            if (name) {
                state.addRole(name, "Operativa", "💼");
                const app = document.getElementById('app');
                app.innerHTML = this.render();
                this.afterRender();
            }
        });
    }
};
