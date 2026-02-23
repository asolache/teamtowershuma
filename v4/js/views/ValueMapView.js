import { store } from '../core/store.js';

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "";

        // Definimos posiciones
        // Roles base: arriba en arco
        const baseRolesNodes = Object.keys(project.customRoles).map((id, i) => ({
            id,
            name: project.customRoles[id],
            x: 150 + (i * 120),
            y: 100,
            color: '#238636'
        }));

        // Roles dinámicos: abajo en arco
        const dynamicRolesNodes = (project.dynamicRoles || []).map((dr, i) => ({
            id: dr.id,
            name: dr.name,
            x: 100 + (i * 130),
            y: 300,
            color: '#1f6feb',
            isCustom: true
        }));

        const nodes = [...baseRolesNodes, ...dynamicRolesNodes];
        const center = { x: 400, y: 200 }; // Nodo central del proyecto

        return `
            <svg viewBox="0 0 800 450" style="width:100%; height:100%; background:#0d1117;">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#30363d" />
                    </marker>
                </defs>

                ${nodes.map(n => `
                    <line x1="${n.x}" y1="${n.y}" x2="${center.x}" y2="${center.y}" 
                          stroke="#21262d" stroke-width="1.5" stroke-dasharray="4"
                          marker-end="url(#arrowhead)" />
                `).join('')}

                <g>
                    <circle cx="${center.x}" cy="${center.y}" r="30" fill="#161b22" stroke="#30363d" stroke-width="2" />
                    <text x="${center.x}" y="${center.y + 5}" text-anchor="middle" fill="#58a6ff" font-size="10" font-weight="bold">PROJECT</text>
                </g>

                ${nodes.map(n => `
                    <g class="vna-node" style="cursor:pointer;">
                        <title>${n.name}</title>
                        <circle cx="${n.x}" cy="${n.y}" r="22" fill="#161b22" stroke="${n.color}" stroke-width="3" />
                        <text x="${n.x}" y="${n.y + 5}" text-anchor="middle" fill="white" font-size="8" font-weight="bold">
                            ${n.id.startsWith('custom') ? 'EXT' : n.id.replace('@','').toUpperCase()}
                        </text>
                        <text x="${n.x}" y="${n.y + 38}" text-anchor="middle" fill="#8b949e" font-size="10" font-weight="normal">
                            ${n.name}
                        </text>
                    </g>
                `).join('')}
            </svg>
        `;
    }
};
