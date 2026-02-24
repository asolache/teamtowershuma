import { state } from '../state.js';

export const ValueMapView = {
    render: () => {
        // 1. Obtener y filtrar roles (ocultar "Ecosistema")
        const allRoles = state.getRoles() || [];
        const roles = allRoles.filter(r => r.id !== 'ecosistema' && r.handle?.toLowerCase() !== 'ecosistema');
        
        const health = state.getNetworkHealth() || { ratio: 100 };

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
                        <div style="font-weight: bold; color: #a371f7;">${health.ratio}% Resiliencia</div>
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
                        ${roles.map(role => {
                            // Limitar el nombre del rol a 10 caracteres
                            const shortHandle = role.handle && role.handle.length > 10 
                                ? role.handle.substring(0, 10) + '...' 
                                : (role.handle || 'Role');
                                
                            return `
                            <div id="node-${role.id}" style="position: absolute; pointer-events: auto; transform: translate(-50%, -50%); transition: all 0.3s ease;">
                                <div style="background: #0d1117; border: 2px solid #58a6ff; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 0 20px rgba(0,0,0,0.6);">
                                    ${role.icon || '👤'}
                                </div>
                                <div style="text-align: center; color: white; font-weight: bold; font-size: 0.7rem; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; text-shadow: 1px 1px 2px #000;">
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
        
        // Volvemos a aplicar el filtro al recuperar de state para evitar errores
        const allRoles = state.getRoles() || [];
        const roles = allRoles.filter(r => r.id !== 'ecosistema' && r.handle?.toLowerCase() !== 'ecosistema');
        const flows = state.getFlows() || [];

        if (!container || roles.length === 0) return;

        // 1. Cálculo de distribución Elíptica Dinámica (Perfectamente centrada)
        // Usamos getBoundingClientRect para precisión submilenimétrica del DOM real
        const rect = container.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const centerX = w / 2;
        const centerY = h / 2;
        
        // Ajustamos los radios para que los nodos no se salgan de la pantalla en monitores pequeños
        const rx = Math.min(w * 0.35, w / 2 - 50); 
        const ry = Math.min(h * 0.35, h / 2 - 60); 

        roles.forEach((role, i) => {
            // Distribuir en círculo/elipse
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
        // Limpiamos flechas anteriores por si se llama a afterRender múltiples veces
        svg.innerHTML = `
            <defs>
                <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#58a6ff" />
                </marker>
                <marker id="arrowhead-purple" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#a371f7" />
                </marker>
            </defs>
        `;

        flows.forEach(flow => {
            const from = roles.find(r => r.id === flow.from);
            const to = roles.find(r => r.id === flow.to);

            // Si uno de los nodos era "Ecosistema" y lo hemos ocultado, no dibujamos la flecha
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
                
                if (isIntangible) {
                    line.setAttribute("stroke-dasharray", "6,6"); // Discontinua
                }
                
                line.setAttribute("marker-end", `url(#arrowhead-${isIntangible ? 'purple' : 'blue'})`);
                svg.appendChild(line);

                // Dibujar Etiqueta del Entregable (Texto centrado en la flecha)
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                
                text.setAttribute("x", midX);
                text.setAttribute("y", midY - 10); 
                text.setAttribute("fill", color); // Que el texto comparta color con la flecha ayuda a la legibilidad
                text.setAttribute("font-size", "11px");
                text.setAttribute("text-anchor", "middle");
                text.style.fontWeight = "bold";
                text.style.paintOrder = "stroke";
                text.style.stroke = "#0b0e14"; 
                text.style.strokeWidth = "5px"; // Halo más grueso
                
                // Limitar la descripción de la transacción a 10 caracteres
                const rawDesc = flow.description || 'Tx';
                const shortDesc = rawDesc.length > 10 ? rawDesc.substring(0, 10) + '...' : rawDesc;
                
                // Si tiene valor financiero, añadirlo, pero priorizando el límite visual
                const valueLabel = flow.financials ? ` (${flow.financials.value}€)` : '';
                text.textContent = shortDesc + valueLabel;
                
                svg.appendChild(text);
            }
        });
    }
};
