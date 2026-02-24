import { state } from '../state.js';

export const ValueMapView = {
    render: () => {
        // 1. Obtener y filtrar roles (ocultar "Ecosistema")
        const allRoles = state.getRoles() || [];
        const roles = allRoles.filter(r => r.id !== 'ecosistema' && r.handle?.toLowerCase() !== 'ecosistema');
        const health = state.getNetworkHealth() || { ratio: 100 };

        // TRUCO KERNEL: Forzamos el afterRender automático por si el router no lo hace a tiempo
        setTimeout(() => ValueMapView.afterRender(), 100);

        return `
            <div class="container-fluid" style="height: 100vh; background: #0b0e14; color: white; overflow: hidden; display: flex; flex-direction: column; font-family: 'Inter', sans-serif;">
                
                <header style="padding: 15px 25px; border-bottom: 1px solid #30363d; display: flex; justify-content: space-between; align-items: center; background: #161b22; z-index: 10;">
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
                        <div style="font-weight: bold; color: #a371f7;">${health.ratio}% Resiliencia</div>
                    </div>
                </header>

                <div id="vna-viewport" style="flex-grow: 1; position: relative; overflow: hidden; cursor: grab; background: radial-gradient(circle at center, #161b22 0%, #0b0e14 100%);">
                    
                    <svg id="vna-svg" width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;"></svg>

                    <div id="vna-nodes-container" style="position: absolute; width: 100%; height: 100%; z-index: 2; pointer-events: none;">
                        ${roles.map(role => {
                            const shortHandle = role.handle && role.handle.length > 10 
                                ? role.handle.substring(0, 10) + '...' 
                                : (role.handle || 'Role');
                                
                            return `
                            <div id="node-${role.id}" style="position: absolute; pointer-events: auto; transform: translate(-50%, -50%); transition: left 0.5s ease-out, top 0.5s ease-out;">
                                <div style="background: #0d1117; border: 2px solid #58a6ff; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.8);">
                                    ${role.icon || '👤'}
                                </div>
                                <div style="text-align: center; color: white; font-weight: bold; font-size: 0.7rem; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; text-shadow: 1px 1px 3px rgba(0,0,0,0.9);">
                                    ${shortHandle}
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    afterRender: () => {
        const container = document.getElementById('vna-viewport');
        const svg = document.getElementById('vna-svg');
        
        if (!container || !svg) return;

        // PROTECCIÓN 1: Si el DOM aún no está pintado (ancho 0), reintentamos en 50ms
        if (container.clientWidth === 0) {
            setTimeout(ValueMapView.afterRender, 50);
            return;
        }

        const allRoles = state.getRoles() || [];
        const roles = allRoles.filter(r => r.id !== 'ecosistema' && r.handle?.toLowerCase() !== 'ecosistema');
        const flows = state.getFlows() || [];

        if (roles.length === 0) return;

        const w = container.clientWidth;
        const h = container.clientHeight;
        const centerX = w / 2;
        const centerY = h / 2;
        
        // Radio responsivo con márgenes de seguridad para que no se corten
        const rx = Math.min(w * 0.35, w / 2 - 80); 
        const ry = Math.min(h * 0.35, h / 2 - 80); 

        // PROTECCIÓN 2: Limpiamos SVG e inyectamos Defs con refX=35 (para que la flecha no se esconda bajo el nodo de 60px)
        svg.innerHTML = `
            <defs>
                <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="35" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#58a6ff" />
                </marker>
                <marker id="arrowhead-purple" markerWidth="10" markerHeight="7" refX="35" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#a371f7" />
                </marker>
            </defs>
        `;

        // Diccionario para guardar coordenadas sin manchar el State global
        const posMap = {};

        // 1. Posicionar Nodos
        roles.forEach((role, i) => {
            const angle = (i / roles.length) * (Math.PI * 2) - (Math.PI / 2);
            const x = centerX + rx * Math.cos(angle);
            const y = centerY + ry * Math.sin(angle);
            
            posMap[role.id] = { x, y };
            
            const nodeEl = document.getElementById(`node-${role.id}`);
            if (nodeEl) {
                nodeEl.style.left = `${x}px`;
                nodeEl.style.top = `${y}px`;
            }
        });

        // 2. Dibujar Flujos
        flows.forEach(flow => {
            const from = posMap[flow.from];
            const to = posMap[flow.to];

            if (from && to) {
                const isIntangible = flow.type === 'intangible';
                const color = isIntangible ? '#a371f7' : '#58a6ff';
                
                // Línea de la flecha
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", from.x);
                line.setAttribute("y1", from.y);
                line.setAttribute("x2", to.x);
                line.setAttribute("y2", to.y);
                line.setAttribute("stroke", color);
                line.setAttribute("stroke-width", "2");
                
                if (isIntangible) {
                    line.setAttribute("stroke-dasharray", "6,6");
                }
                
                line.setAttribute("marker-end", `url(#arrowhead-${isIntangible ? 'purple' : 'blue'})`);
                svg.appendChild(line);

                // Texto de la transacción (entregable)
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                
                text.setAttribute("x", midX);
                text.setAttribute("y", midY - 10); 
                text.setAttribute("fill", color); 
                text.setAttribute("font-size", "11px");
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("paint-order", "stroke");
                text.setAttribute("stroke", "#0b0e14");
                text.setAttribute("stroke-width", "5px");
                text.style.fontWeight = "bold";
                
                // Recorte de descripción
                const rawDesc = flow.description || flow.entregable || 'Tx';
                const shortDesc = rawDesc.length > 10 ? rawDesc.substring(0, 10) + '...' : rawDesc;
                const valueLabel = flow.financials ? ` (${flow.financials.value}€)` : '';
                
                text.textContent = shortDesc + valueLabel;
                svg.appendChild(text);
            }
        });
    }
};
