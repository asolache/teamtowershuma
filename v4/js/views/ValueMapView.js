import { store } from '../core/store.js';

// Estado local para la vista activa (Teórico, Contable, Fricción)
let currentView = 'teorico'; // Valores: 'teorico', 'contable', 'friccion'

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return '';

        // Filtrar "ecosistema" y usar project.roles
        const roles = (project.roles || []).filter(r => r.id !== 'ecosistema' && r.name?.toLowerCase() !== 'ecosistema');
        
        // Truco para asegurar que el DOM existe antes de calcular coordenadas
        setTimeout(() => ValueMapView.afterRender(projectId), 100);

        // Helpers para el estilo de las pestañas
        const getTabStyle = (viewName) => `
            padding: 8px 16px; 
            cursor: pointer; 
            border-bottom: 2px solid ${currentView === viewName ? 'var(--accent-blue)' : 'transparent'};
            color: ${currentView === viewName ? 'var(--text-heading)' : 'var(--text-muted)'};
            font-weight: ${currentView === viewName ? 'bold' : 'normal'};
            transition: all 0.2s ease;
        `;

        return `
            <div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <div id="tab-teorico" style="${getTabStyle('teorico')}">📘 Mapa Teórico (Diseño)</div>
                    <div id="tab-contable" style="${getTabStyle('contable')}">📒 Mapa Contable (Realidad)</div>
                    <div id="tab-friccion" style="${getTabStyle('friccion')}">🔥 Puntos de Fricción (Diagnóstico)</div>
                </div>

                <div id="vna-viewport" style="width: 100%; height: 500px; position: relative; overflow: hidden; background: radial-gradient(circle at center, #161b22 0%, #0b0e14 100%); border-radius: 8px; border: 1px solid var(--border-color);">
                    <svg id="vna-svg" width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;"></svg>

                    <div id="vna-nodes-container" style="position: absolute; width: 100%; height: 100%; z-index: 2; pointer-events: none;">
                        ${roles.map(role => {
                            // 🛠️ FIX: Usamos role.name en lugar de role.handle
                            const shortName = role.name && role.name.length > 12 
                                ? role.name.substring(0, 12) + '...' 
                                : (role.name || 'Role');
                            
                            // Estilo dinámico del nodo según la vista (ej. en fricción podría ponerse rojo)
                            let nodeColor = '#58a6ff';
                            if (currentView === 'friccion') {
                                // Aquí podrías calcular si el rol está sobrecargado
                                // nodeColor = isOverloaded(role.id) ? '#f85149' : '#58a6ff';
                            }

                            return `
                            <div id="node-${role.id}" style="position: absolute; pointer-events: auto; transform: translate(-50%, -50%); transition: left 0.5s ease-out, top 0.5s ease-out;">
                                <div style="background: #0d1117; border: 2px solid ${nodeColor}; width: 60px; height: 60px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.8); margin: 0 auto;">
                                    <span style="font-size: 1.4rem;">👤</span>
                                    <span style="font-size: 0.6rem; opacity: 0.7;">${role.levelId || ''}</span>
                                </div>
                                <div style="text-align: center; color: white; font-weight: bold; font-size: 0.75rem; margin-top: 8px; letter-spacing: 0.5px; text-shadow: 1px 1px 3px rgba(0,0,0,0.9); background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px;">
                                    ${shortName}
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted); text-align: right;">
                    ${currentView === 'teorico' ? 'Mostrando flujos diseñados estratégicamente.' : ''}
                    ${currentView === 'contable' ? 'Mostrando el trabajo real registrado en el Libro Mayor. El grosor indica volumen.' : ''}
                    ${currentView === 'friccion' ? 'Mostrando cuellos de botella y falta de reciprocidad (Beta).' : ''}
                </div>
            </div>
        `;
    },

    afterRender: (projectId) => {
        // 1. GESTIÓN DE EVENTOS DE PESTAÑAS
        const setupTab = (tabId, viewName) => {
            const tab = document.getElementById(tabId);
            if (tab) {
                tab.onclick = () => {
                    currentView = viewName;
                    // Recargamos solo el mapa, no toda la página del proyecto
                    const container = document.getElementById('project-map-container'); // Asegúrate de que este ID exista en ProjectView.js
                    if (container) {
                        container.innerHTML = ValueMapView.render(projectId);
                    }
                };
            }
        };
        setupTab('tab-teorico', 'teorico');
        setupTab('tab-contable', 'contable');
        setupTab('tab-friccion', 'friccion');

        // 2. LÓGICA DE DIBUJADO SVG
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
        if (roles.length === 0) return;

        // --- PREPARACIÓN DE DATOS SEGÚN LA VISTA ---
        let flowsToDraw = [];

        if (currentView === 'teorico') {
            // Vista Teórica: Usamos project.transactions
            flowsToDraw = (project.transactions || []).map(tx => ({
                from: tx.from,
                to: tx.to,
                tipo: tx.tipo,
                label: tx.entregable,
                color: tx.tipo === 'intangible' ? '#a371f7' : '#58a6ff',
                dashArray: tx.tipo === 'intangible' ? '5,5' : '',
                thickness: 2,
                markerEnd: `url(#arrowhead-${tx.tipo === 'intangible' ? 'purple' : 'blue'})`
            }));

        } else if (currentView === 'contable') {
            // Vista Contable: Usamos project.ledger
            // Agrupamos por (from, to) para sumar horas y calcular grosor
            const ledgerMap = {};
            (project.ledger || []).forEach(l => {
                const key = `${l.roleId}->${l.receiverId}`;
                if (!ledgerMap[key]) ledgerMap[key] = { from: l.roleId, to: l.receiverId, totalHoras: 0, descriptions: [] };
                ledgerMap[key].totalHoras += (l.horas || 0);
                ledgerMap[key].descriptions.push(l.description);
            });

            flowsToDraw = Object.values(ledgerMap).map(flow => {
                // Calculamos el grosor basado en las horas (mínimo 2, máximo 10)
                const thickness = Math.min(10, Math.max(2, flow.totalHoras * 0.5));
                const label = `${flow.totalHoras.toFixed(1)}h (${flow.descriptions.length} apuntes)`;
                
                return {
                    from: flow.from,
                    to: flow.to,
                    tipo: 'contable',
                    label: label,
                    color: '#d29922', // Color dorado para lo contable/real
                    dashArray: '',
                    thickness: thickness,
                    markerEnd: 'url(#arrowhead-gold)'
                };
            });

        } else if (currentView === 'friccion') {
            // Vista Fricción (Beta: por ahora mostramos solo contable en rojo)
            // Aquí iría la lógica compleja de comparación teórica vs real
             const ledgerMap = {};
             (project.ledger || []).forEach(l => {
                 const key = `${l.roleId}->${l.receiverId}`;
                 if (!ledgerMap[key]) ledgerMap[key] = { from: l.roleId, to: l.receiverId, totalHoras: 0 };
                 ledgerMap[key].totalHoras += (l.horas || 0);
             });

            flowsToDraw = Object.values(ledgerMap).map(flow => {
                 const thickness = Math.min(8, Math.max(3, flow.totalHoras * 0.3));
                 return {
                    from: flow.from,
                    to: flow.to,
                    tipo: 'friccion',
                    label: `Flujo Real: ${flow.totalHoras}h`,
                    color: '#f85149', // Rojo para fricción/alerta
                    dashArray: '2,2', // Punteado agresivo
                    thickness: thickness,
                    markerEnd: 'url(#arrowhead-red)'
                 }
            });
        }

        // --- DIBUJADO COMÚN ---
        const w = container.clientWidth;
        const h = container.clientHeight;
        const centerX = w / 2;
        const centerY = h / 2;
        const rx = Math.min(w * 0.35, w / 2 - 70); 
        const ry = Math.min(h * 0.35, h / 2 - 70); 

        // Definición de Marcadores (Flechas)
        svg.innerHTML = `
            <defs>
                <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="38" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#58a6ff" />
                </marker>
                <marker id="arrowhead-purple" markerWidth="10" markerHeight="7" refX="38" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#a371f7" />
                </marker>
                <marker id="arrowhead-gold" markerWidth="10" markerHeight="7" refX="38" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#d29922" />
                </marker>
                 <marker id="arrowhead-red" markerWidth="12" markerHeight="9" refX="38" refY="4.5" orient="auto">
                    <polygon points="0 0, 12 4.5, 0 9" fill="#f85149" />
                </marker>
            </defs>
        `;

        const posMap = {};

        // Posicionar Nodos
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

        // Dibujar Flujos (Flechas)
        flowsToDraw.forEach(flow => {
            const from = posMap[flow.from];
            const to = posMap[flow.to];

            if (from && to) {
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", from.x);
                line.setAttribute("y1", from.y);
                line.setAttribute("x2", to.x);
                line.setAttribute("y2", to.y);
                line.setAttribute("stroke", flow.color);
                line.setAttribute("stroke-width", flow.thickness);
                if (flow.dashArray) line.setAttribute("stroke-dasharray", flow.dashArray);
                line.setAttribute("marker-end", flow.markerEnd);
                svg.appendChild(line);

                // Etiquetas de texto (solo si no es fricción, para no saturar)
                if (currentView !== 'friccion' || flow.thickness > 4) {
                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    const midX = (from.x + to.x) / 2;
                    const midY = (from.y + to.y) / 2;
                    
                    text.setAttribute("x", midX);
                    text.setAttribute("y", midY - 10); 
                    text.setAttribute("fill", flow.color); 
                    text.setAttribute("font-size", "11px");
                    text.setAttribute("text-anchor", "middle");
                    text.setAttribute("paint-order", "stroke");
                    text.setAttribute("stroke", "#0b0e14");
                    text.setAttribute("stroke-width", "4px");
                    text.style.fontWeight = "bold";
                    
                    const rawDesc = flow.label || 'Tx';
                    const shortDesc = rawDesc.length > 18 ? rawDesc.substring(0, 18) + '...' : rawDesc;
                    text.textContent = shortDesc;
                    
                    svg.appendChild(text);
                }
            }
        });
    }
};
