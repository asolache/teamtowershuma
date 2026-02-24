import { store } from '../core/store.js'; // 🛠️ FIX: Conectado al store real

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return '';

        // Filtrar "ecosistema" y usar project.roles
        const roles = (project.roles || []).filter(r => r.id !== 'ecosistema' && r.name?.toLowerCase() !== 'ecosistema');
        
        // Truco para asegurar que el DOM existe antes de calcular coordenadas
        setTimeout(() => ValueMapView.afterRender(projectId), 100);

        return `
            <div id="vna-viewport" style="width: 100%; height: 400px; position: relative; overflow: hidden; background: radial-gradient(circle at center, #161b22 0%, #0b0e14 100%); border-radius: 8px;">
                <svg id="vna-svg" width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;"></svg>

                <div id="vna-nodes-container" style="position: absolute; width: 100%; height: 100%; z-index: 2; pointer-events: none;">
                    ${roles.map(role => {
                        // 🛠️ FIX: Usamos role.name en lugar de role.handle
                        const shortName = role.name && role.name.length > 12 
                            ? role.name.substring(0, 12) + '...' 
                            : (role.name || 'Role');
                            
                        return `
                        <div id="node-${role.id}" style="position: absolute; pointer-events: auto; transform: translate(-50%, -50%); transition: left 0.5s ease-out, top 0.5s ease-out;">
                            <div style="background: #0d1117; border: 2px solid #58a6ff; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; box-shadow: 0 4px 15px rgba(0,0,0,0.8); margin: 0 auto;">
                                👤
                            </div>
                            <div style="text-align: center; color: white; font-weight: bold; font-size: 0.7rem; margin-top: 6px; letter-spacing: 0.5px; text-shadow: 1px 1px 3px rgba(0,0,0,0.9); background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px;">
                                ${shortName}
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `;
    },

    afterRender: (projectId) => {
        const container = document.getElementById('vna-viewport');
        const svg = document.getElementById('vna-svg');
        if (!container || !svg) return;

        if (container.clientWidth === 0) {
            setTimeout(() => ValueMapView.afterRender(projectId), 50);
            return;
        }

        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return;

        const roles = (project.roles || []).filter(r => r.id !== 'ecosistema' && r.name?.toLowerCase() !== 'ecosistema');
        const flows = project.transactions || []; // 🛠️ FIX: Usar project.transactions

        if (roles.length === 0) return;

        const w = container.clientWidth;
        const h = container.clientHeight;
        const centerX = w / 2;
        const centerY = h / 2;
        
        const rx = Math.min(w * 0.35, w / 2 - 60); 
        const ry = Math.min(h * 0.35, h / 2 - 60); 

        svg.innerHTML = `
            <defs>
                <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#58a6ff" />
                </marker>
                <marker id="arrowhead-purple" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#a371f7" />
                </marker>
            </defs>
        `;

        const posMap = {};

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

        flows.forEach(flow => {
            const from = posMap[flow.from];
            const to = posMap[flow.to];

            if (from && to) {
                const isIntangible = flow.tipo === 'intangible'; // 🛠️ FIX: flow.tipo en lugar de flow.type
                const color = isIntangible ? '#a371f7' : '#58a6ff';
                
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

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                
                text.setAttribute("x", midX);
                text.setAttribute("y", midY - 8); 
                text.setAttribute("fill", color); 
                text.setAttribute("font-size", "10px");
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("paint-order", "stroke");
                text.setAttribute("stroke", "#0b0e14");
                text.setAttribute("stroke-width", "4px");
                text.style.fontWeight = "bold";
                
                // 🛠️ FIX: Usar flow.entregable
                const rawDesc = flow.entregable || 'Tx';
                const shortDesc = rawDesc.length > 12 ? rawDesc.substring(0, 12) + '...' : rawDesc;
                text.textContent = shortDesc;
                
                svg.appendChild(text);
            }
        });
    }
};
