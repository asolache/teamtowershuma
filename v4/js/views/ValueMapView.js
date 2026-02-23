import { store } from '../core/store.js';

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "";

        // Unificamos nodos Base y Dinámicos para el mapa
        const allNodes = [
            ...Object.keys(project.customRoles || {}).map(id => ({ id, label: project.customRoles[id], type: 'base' })),
            ...(project.dynamicRoles || []).map(dr => ({ id: dr.id, label: dr.name, type: 'dynamic', parent: dr.levelId }))
        ];

        // Poblar los selectores de transacciones después de renderizar
        setTimeout(() => {
            const fromSelect = document.getElementById('tx-from');
            const toSelect = document.getElementById('tx-to');
            if(fromSelect && toSelect) {
                const options = allNodes.map(n => `<option value="${n.id}">${n.label}</option>`).join('');
                fromSelect.innerHTML = options;
                toSelect.innerHTML = options;
            }
        }, 50);

        // Lógica de posiciones (Simplificada para el ejemplo)
        const positions = {};
        const centerX = 400, centerY = 350;
        allNodes.forEach((n, i) => {
            const angle = (i * 2 * Math.PI) / allNodes.length;
            positions[n.id] = { x: centerX + 250 * Math.cos(angle), y: centerY + 250 * Math.sin(angle) };
        });

        return `
            <svg id="svg-map" viewBox="0 0 800 700" style="width:100%; height:100%;">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="22" refY="5" orient="auto">
                        <path d="M0,0 L10,5 L0,10 Z" fill="#58a6ff" />
                    </marker>
                </defs>

                ${(project.transactions || []).map(t => {
                    const start = positions[t.from];
                    const end = positions[t.to];
                    if(!start || !end) return '';
                    return `
                        <g>
                            <line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" 
                                  stroke="#58a6ff" stroke-width="2" 
                                  stroke-dasharray="${t.tipo === 'tangible' ? '0' : '5,5'}" 
                                  marker-end="url(#arrow)" />
                            <text x="${(start.x + end.x)/2}" y="${(start.y + end.y)/2}" fill="#8b949e" font-size="10" font-style="italic">
                                ${t.entregable}
                            </text>
                        </g>`;
                }).join('')}

                ${allNodes.map(n => `
                    <g>
                        <circle cx="${positions[n.id].x}" cy="${positions[n.id].y}" r="18" 
                                fill="${n.type === 'base' ? '#1f6feb' : '#238636'}" stroke="white" stroke-width="2" />
                        <text x="${positions[n.id].x}" y="${positions[n.id].y + 35}" fill="white" font-size="12" font-weight="bold" text-anchor="middle">
                            ${n.label}
                        </text>
                    </g>
                `).join('')}
            </svg>
        `;
    }
};

window.sendValue = (pId) => {
    const from = document.getElementById('tx-from').value;
    const to = document.getElementById('tx-to').value;
    const entregable = document.getElementById('tx-entregable').value;
    const tipo = document.getElementById('tx-tipo').value;

    store.dispatch({
        type: 'ADD_TRANSACTION',
        payload: { projectId: pId, tx: { from, to, entregable, tipo, fecha: new Date().toISOString() } }
    });
    location.reload();
};
