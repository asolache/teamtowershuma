import { state } from '../state.js';

export const ValueMapView = {
    render: () => {
        const roles = state.getRoles();
        const health = state.getNetworkHealth();

        return `
            <div class="container-fluid" style="padding: 20px; height: 100vh; display: flex; flex-direction: column;">
                <header class="header-main" style="margin-bottom: 10px;">
                    <div>
                        <h1 class="text-accent" style="margin:0;">🗺️ Red de Valor (VNA)</h1>
                        <p class="text-muted" style="margin:0;">Análisis de conversión: ${health.balance}</p>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 250px 1fr; gap: 20px; flex-grow: 1; overflow: hidden;">
                    <aside style="display: flex; flex-direction: column; gap: 15px;">
                        <div class="panel" style="border-left: 4px solid var(--accent-purple);">
                            <h4 style="margin:0 0 5px 0;">Salud de Red</h4>
                            <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent-purple);">${health.ratio}%</div>
                            <p class="text-small text-muted">Ratio de Intercambio Intangible</p>
                        </div>
                        
                        <div class="panel">
                            <h4 style="margin:0 0 10px 0;">Leyenda Allee</h4>
                            <div style="display: grid; gap: 10px; font-size: 0.75rem;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="width: 25px; height: 2px; background: var(--accent-blue);"></div>
                                    <span>Tangible (Contrato)</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="width: 25px; height: 2px; border-top: 2px dashed var(--accent-purple);"></div>
                                    <span>Intangible (Conocimiento)</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div id="vna-viewport" style="position: relative; background: #0b0e14; border-radius: 12px; border: 1px solid #30363d; overflow: hidden; cursor: crosshair;">
                        <svg id="vna-svg" width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;">
                            <defs>
                                <marker id="arrow-blue" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-blue)" />
                                </marker>
                                <marker id="arrow-purple" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                                    <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent-purple)" />
                                </marker>
                            </defs>
                        </svg>

                        <div id="vna-nodes-layer" style="position: absolute; width: 100%; height: 100%; z-index: 2; pointer-events: none;">
                            ${roles.map(role => `
                                <div id="node-${role.id}" style="position: absolute; pointer-events: auto; transform: translate(-50%, -50%);">
                                    <div style="background: #161b22; border: 2px solid var(--accent-blue); width: 55px; height: 55px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; box-shadow: 0 0 15px rgba(0,0,0,0.4);">
                                        ${role.icon || '👤'}
                                    </div>
                                    <div style="text-align: center; color: #c9d1d9; font-weight: 600; font-size: 0.7rem; margin-top: 4px;">
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
        const viewport = document.getElementById('vna-viewport');
        const svg = document.getElementById('vna-svg');
        const roles = state.getRoles();
        const flows = state.getFlows();

        if (!viewport || roles.length === 0) return;

        // Auto-distribución elíptica adaptativa
        const w = viewport.clientWidth;
        const h = viewport.clientHeight;
        const rx = w * 0.38;
        const ry = h * 0.35;

        roles.forEach((role, i) => {
            const angle = (i / roles.length) * (Math.PI * 2) - (Math.PI / 2);
            role._x = (w / 2) + rx * Math.cos(angle);
            role._y = (h / 2) + ry * Math.sin(angle);
            
            const el = document.getElementById(`node-${role.id}`);
            if (el) {
                el.style.left = `${role._x}px`;
                el.style.top = `${role._y}px`;
            }
        });

        // Dibujo de transacciones y etiquetas de entregables
        flows.forEach(flow => {
            const from = roles.find(r => r.id === flow.from);
            const to = roles.find(r => r.id === flow.to);

            if (from && to) {
                const isInt = flow.type === 'intangible';
                const color = isInt ? 'var(--accent-purple)' : 'var(--accent-blue)';

                // Flecha
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", from._x); line.setAttribute("y1", from._y);
                line.setAttribute("x2", to._x);   line.setAttribute("y2", to._y);
                line.setAttribute("stroke", color);
                line.setAttribute("stroke-width", "1.5");
                if (isInt) line.setAttribute("stroke-dasharray", "4,4");
                line.setAttribute("marker-end", `url(#${isInt ? 'arrow-purple' : 'arrow-blue'})`);
                svg.appendChild(line);

                // Etiqueta del entregable
                const midX = (from._x + to._x) / 2;
                const midY = (from._y + to._y) / 2;
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", midX);
                text.setAttribute("y", midY - 8);
                text.setAttribute("fill", "#8b949e");
                text.setAttribute("font-size", "9px");
                text.setAttribute("text-anchor", "middle");
                text.style.paintOrder = "stroke";
                text.style.stroke = "#0b0e14";
                text.style.strokeWidth = "4px";
                text.textContent = flow.description;
                svg.appendChild(text);
            }
        });
    }
};
