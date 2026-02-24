import { state } from '../state.js';

export const ValueMapView = {
    render: () => {
        const roles = state.getRoles();
        const health = state.getNetworkHealth();

        return `
            <div class="container-fluid" style="height: 100vh; background: #0b0e14; color: white; overflow: hidden; display: flex; flex-direction: column; font-family: sans-serif;">
                
                <header style="padding: 15px 25px; border-bottom: 1px solid #30363d; display: flex; justify-content: space-between; align-items: center; background: #161b22;">
                    <div>
                        <h2 style="margin: 0; color: #a371f7; font-size: 1.2rem;">🗺️ Value Network Analysis (VNA)</h2>
                        <div style="display: flex; gap: 15px; margin-top: 5px;">
                            <span style="font-size: 0.75rem; color: #8b949e;">
                                <strong style="color: #58a6ff;">━</strong> Tangible (Contractual)
                            </span>
                            <span style="font-size: 0.75rem; color: #8b949e;">
                                <strong style="color: #a371f7;">┈</strong> Intangible (Conocimiento)
                            </span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.8rem; color: #8b949e;">Salud de la Red</div>
                        <div style="font-weight: bold; color: #a371f7;">${health.ratio}% Reciprocidad</div>
                    </div>
                </header>

                <div id="vna-viewport" style="flex-grow: 1; position: relative; overflow: hidden; cursor: grab;">
                    
                    <svg id="vna-svg" width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;">
                        <defs>
                            <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#58a6ff" />
                            </marker>
                            <marker id="arrowhead-purple" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#a371f7" />
                            </marker>
                        </defs>
                    </svg>

                    <div id="vna-nodes-container" style="position: absolute; width: 100%; height: 100%; z-index: 2; pointer-events: none;">
                        ${roles.map(role => `
                            <div id="node-${role.id}" style="position: absolute; pointer-events: auto; transform: translate(-50%, -50%); transition: all 0.3s ease;">
                                <div style="background: #0d1117; border: 2px solid #58a6ff; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 0 20px rgba(0,0,0,0.6);">
                                    ${role.icon || '👤'}
                                </div>
                                <div style="text-align: center; color: white; font-weight: bold; font-size: 0.7rem; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; text-shadow: 1px 1px 2px #000;">
                                    ${role.handle}
                                </div>
                            </div>
                        `).join('')}
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

        // 1. Cálculo de distribución Elíptica Dinámica
        const w = container.clientWidth;
        const h = container.clientHeight;
        const centerX = w / 2;
        const centerY = h / 2;
        const rx = w * 0.35; // Radio horizontal
        const ry = h * 0.30; // Radio vertical

        roles.forEach((role, i) => {
            const angle = (i / roles.length) * (Math.PI * 2) - (Math.PI / 2);
            role.x = centerX + rx * Math.cos(angle);
            role.y = centerY + ry * Math.sin(angle);
            
            const nodeEl = document.getElementById(`node-${role.id}`);
            if (nodeEl) {
                nodeEl.style.left = `${role.x}px`;
                nodeEl.style.top = `${role.y}px`;
            }
        });

        // 2. Dibujar Flechas y Nombres de Entregables
        flows.forEach(flow => {
            const from = roles.find(r => r.id === flow.from);
            const to = roles.find(r => r.id === flow.to);

            if (from && to) {
                const isIntangible = flow.type === 'intangible';
                const color = isIntangible ? '#a371f7' : '#58a6ff';
                
                // Dibujar Línea/Flecha
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", from.x);
                line.setAttribute("y1", from.y);
                line.setAttribute("x2", to.x);
                line.setAttribute("y2", to.y);
                line.setAttribute("stroke", color);
                line.setAttribute("stroke-width", "2");
                if (isIntangible) line.setAttribute("stroke-dasharray", "5,5");
                line.setAttribute("marker-end", `url(#arrowhead-${isIntangible ? 'purple' : 'blue'})`);
                svg.appendChild(line);

                // Dibujar Etiqueta del Entregable (Texto centrado en la flecha)
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                
                text.setAttribute("x", midX);
                text.setAttribute("y", midY - 12); // Un poco arriba de la línea
                text.setAttribute("fill", "#c9d1d9");
                text.setAttribute("font-size", "10px");
                text.setAttribute("text-anchor", "middle");
                text.style.fontWeight = "bold";
                text.style.paintOrder = "stroke";
                text.style.stroke = "#0b0e14"; // "Halo" negro para que se lea siempre
                text.style.strokeWidth = "4px";
                
                // Si tiene valor financiero (del test de los 540€), lo mostramos
                const valueLabel = flow.financials ? ` (${flow.financials.value}€)` : '';
                text.textContent = flow.description + valueLabel;
                
                svg.appendChild(text);
            }
        });
    }
};
