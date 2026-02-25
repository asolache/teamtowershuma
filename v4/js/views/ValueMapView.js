import { store } from '../core/store.js';

export const ValueMapView = {
    // 🚀 AHORA RECIBE EL viewType COMO PARÁMETRO ('teorico', 'contable', 'friccion')
    render: (projectId, viewType = 'teorico') => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return '';

        const roles = (project.roles || []).filter(r => r.id !== 'ecosistema' && r.name?.toLowerCase() !== 'ecosistema');
        
        // Pasamos el viewType al afterRender
        setTimeout(() => ValueMapView.afterRender(projectId, viewType), 100);

        return `
            <div id="vna-viewport" style="width: 100%; height: 500px; position: relative; overflow: hidden; background: radial-gradient(circle at center, #161b22 0%, #0b0e14 100%); border-radius: 8px;">
                <svg id="vna-svg" width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;"></svg>

                <div id="vna-nodes-container" style="position: absolute; width: 100%; height: 100%; z-index: 2; pointer-events: none;">
                    ${roles.map(role => {
                        const shortName = role.name && role.name.length > 12 
                            ? role.name.substring(0, 12) + '...' 
                            : (role.name || 'Role');
                        
                        let nodeColor = viewType === 'friccion' ? '#30363d' : '#58a6ff';

                        return `
                        <div id="node-${role.id}" style="position: absolute; pointer-events: auto; transform: translate(-50%, -50%); transition: left 0.5s ease-out, top 0.5s ease-out;">
                            <div style="background: #0d1117; border: 2px solid ${nodeColor}; width: 60px; height: 60px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.8); margin: 0 auto; transition: border-color 0.3s;">
                                <span style="font-size: 1.4rem;">👤</span>
                                <span style="font-size: 0.55rem; opacity: 0.7;">${role.levelId || ''}</span>
                            </div>
                            <div style="text-align: center; color: white; font-weight: bold; font-size: 0.75rem; margin-top: 8px; letter-spacing: 0.5px; text-shadow: 1px 1px 3px rgba(0,0,0,0.9); background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px;">
                                ${shortName}
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `;
    },

    afterRender: (projectId, viewType) => {
        const container = document.getElementById('vna-viewport');
        const svg = document.getElementById('vna-svg');
        if (!container || !svg) return;

        if (container.clientWidth === 0) {
            setTimeout(() => ValueMapView.afterRender(projectId, viewType), 50);
            return;
        }

        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return;

        const roles = (project.roles || []).filter(r => r.id !== 'ecosistema' && r.name?.toLowerCase() !== 'ecosistema');
        if (roles.length === 0) return;

        // --- PREPARACIÓN DE FLUJOS SEGÚN LA VISTA ---
        let flowsToDraw = [];

        if (viewType === 'teorico') {
            flowsToDraw = (project.transactions || []).map(tx => ({
                from: tx.from, to: tx.to, tipo: tx.tipo, label: tx.entregable,
                color: tx.tipo === 'intangible' ? '#a371f7' : '#58a6ff',
                dashArray: tx.tipo === 'intangible' ? '5,5' : '',
                thickness: 2, markerEnd: `url(#arrowhead-${tx.tipo === 'intangible' ? 'purple' : 'blue'})`
            }));
        } else if (viewType === 'contable') {
            const ledgerMap = {};
            (project.ledger || []).forEach(l => {
                const key = `${l.roleId}->${l.receiverId}`;
                if (!ledgerMap[key]) ledgerMap[key] = { from: l.roleId, to: l.receiverId, totalHoras: 0, count: 0 };
                ledgerMap[key].totalHoras += (l.horas || 0);
                ledgerMap[key].count += 1;
            });
            flowsToDraw = Object.values(ledgerMap).map(flow => ({
                from: flow.from, to: flow.to, tipo: 'contable',
                label: `${flow.totalHoras.toFixed(1)}h (${flow.count}x)`,
                color: '#d29922', dashArray: '',
                thickness: Math.min(10, Math.max(2, flow.totalHoras * 0.5)),
                markerEnd: 'url(#arrowhead-gold)'
            }));
        } else if (viewType === 'friccion') {
            const ledgerMap = {};
            (project.ledger || []).forEach(l => {
                const key = `${l.roleId}->${l.receiverId}`;
                if (!ledgerMap[key]) ledgerMap[key] = { from: l.roleId, to: l.receiverId, totalHoras: 0 };
                ledgerMap[key].totalHoras += (l.horas || 0);
            });
            flowsToDraw = Object.values(ledgerMap).map(flow => ({
                from: flow.from, to: flow.to, tipo: 'friccion',
                label: `Sobrecarga: ${flow.totalHoras}h`,
                color: '#f85149', dashArray: '4,4',
                thickness: Math.min(8, Math.max(3, flow.totalHoras * 0.3)),
                markerEnd: 'url(#arrowhead-red)'
            }));
        }

        const w = container.clientWidth;
        const h = container.clientHeight;
        const centerX = w / 2;
        const centerY = h / 2;
        const rx = Math.min(w * 0.4, w / 2 - 80); 
        const ry = Math.min(h * 0.4, h / 2 - 80); 

        svg.innerHTML = `
            <defs>
                <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="35" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#58a6ff" /></marker>
                <marker id="arrowhead-purple" markerWidth="10" markerHeight="7" refX="35" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#a371f7" /></marker>
                <marker id="arrowhead-gold" markerWidth="10" markerHeight="7" refX="35" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#d29922" /></marker>
                <marker id="arrowhead-red" markerWidth="12" markerHeight="9" refX="35" refY="4.5" orient="auto"><polygon points="0 0, 12 4.5, 0 9" fill="#f85149" /></marker>
            </defs>
        `;

        const posMap = {};
        roles.forEach((role, i) => {
            const angle = (i / roles.length) * (Math.PI * 2) - (Math.PI / 2);
            const x = centerX + rx * Math.cos(angle);
            const y = centerY + ry * Math.sin(angle);
            posMap[role.id] = { x, y };
            const nodeEl = document.getElementById(`node-${role.id}`);
            if (nodeEl) { nodeEl.style.left = `${x}px`; nodeEl.style.top = `${y}px`; }
        });

        flowsToDraw.forEach(flow => {
            const from = posMap[flow.from];
            const to = posMap[flow.to];
            if (from && to) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", from.x); line.setAttribute("y1", from.y);
                line.setAttribute("x2", to.x); line.setAttribute("y2", to.y);
                line.setAttribute("stroke", flow.color); line.setAttribute("stroke-width", flow.thickness);
                if (flow.dashArray) line.setAttribute("stroke-dasharray", flow.dashArray);
                line.setAttribute("marker-end", flow.markerEnd);
                svg.appendChild(line);

                if (viewType !== 'friccion' || flow.thickness > 3) {
                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    const midX = (from.x + to.x) / 2; const midY = (from.y + to.y) / 2;
                    text.setAttribute("x", midX); text.setAttribute("y", midY - 12); 
                    text.setAttribute("fill", flow.color); text.setAttribute("font-size", "11px");
                    text.setAttribute("text-anchor", "middle"); text.setAttribute("paint-order", "stroke");
                    text.setAttribute("stroke", "#0b0e14"); text.setAttribute("stroke-width", "4px");
                    text.style.fontWeight = "bold";
                    const shortDesc = flow.label.length > 20 ? flow.label.substring(0, 20) + '...' : flow.label;
                    text.textContent = shortDesc;
                    svg.appendChild(text);
                }
            }
        });
    }
};
