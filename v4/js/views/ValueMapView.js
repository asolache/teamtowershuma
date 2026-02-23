import { store } from '../core/store.js';

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "";

        const allNodes = [
            ...Object.keys(project.customRoles).map(id => ({ id, name: project.customRoles[id], type: 'base' })),
            ...(project.dynamicRoles || []).map(dr => ({ id: dr.id, name: dr.name, type: 'dynamic' }))
        ];

        // Layout Radial
        const centerX = 400;
        const centerY = 250;
        const radius = 170;
        
        const nodesWithPos = allNodes.map((node, i) => {
            const angle = (i / allNodes.length) * 2 * Math.PI - (Math.PI / 2); // Empezar arriba
            return {
                ...node,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });

        // Agrupar transacciones por par (Origen -> Destino) para calcular el grosor (Value Flow)
        const flows = {};
        const roleStats = {}; // Para el tamaño del nodo

        project.transactions.forEach(t => {
            // Stats para tamaño del nodo (valor aportado)
            roleStats[t.rolId] = (roleStats[t.rolId] || 0) + t.liquidación;
            
            // Stats para la línea de conexión
            if (!t.toId) return; 
            const flowKey = `${t.rolId}->${t.toId}`;
            flows[flowKey] = (flows[flowKey] || 0) + t.liquidación;
        });

        return `
            <svg viewBox="0 0 800 500" style="width:100%; height:100%; background:#0d1117;">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="24" refY="4" orient="auto">
                        <polygon points="0 0, 8 4, 0 8" fill="#58a6ff" />
                    </marker>
                </defs>

                ${Object.keys(flows).map(flowKey => {
                    const [fromId, toId] = flowKey.split('->');
                    const src = nodesWithPos.find(n => n.id === fromId);
                    const tgt = nodesWithPos.find(n => n.id === toId);
                    if (!src || !tgt) return '';

                    const totalValue = flows[flowKey];
                    // El grosor de la línea escala según el valor (mínimo 1px, máximo 12px)
                    const strokeWidth = Math.max(1, Math.min(totalValue / 200, 12)); 

                    return `
                        <g>
                            <title>${totalValue.toLocaleString()}€ transferidos</title>
                            <line x1="${src.x}" y1="${src.y}" x2="${tgt.x}" y2="${tgt.y}" 
                                  stroke="#58a6ff" stroke-width="${strokeWidth}" stroke-opacity="0.6"
                                  marker-end="url(#arrowhead)" />
                        </g>
                    `;
                }).join('')}

                ${nodesWithPos.map(n => {
                    const valueProduced = roleStats[n.id] || 0;
                    const size = 20 + Math.min(valueProduced / 400, 20); // Crece según aporta
                    const color = n.type === 'base' ? '#238636' : '#a371f7'; // Verdes = Base, Morados = Custom
                    const active = valueProduced > 0;

                    return `
                        <g class="vna-node" style="cursor:pointer; transition: all 0.3s;">
                            <circle cx="${n.x}" cy="${n.y}" r="${size}" 
                                    fill="#161b22" 
                                    stroke="${active ? color : '#30363d'}" 
                                    stroke-width="${active ? 3 : 1}"
                                    filter="${active ? 'url(#glow)' : ''}" />
                            
                            <text x="${n.x}" y="${n.y + 4}" text-anchor="middle" fill="#c9d1d9" font-size="9" font-weight="bold" style="pointer-events:none;">
                                ${n.id.startsWith('custom') ? 'EXT' : n.id.replace('@','').toUpperCase()}
                            </text>
                            
                            <text x="${n.x}" y="${n.y + size + 16}" text-anchor="middle" fill="${active ? '#f0f6fc' : '#8b949e'}" font-size="12" font-weight="${active ? 'bold' : 'normal'}">
                                ${n.name}
                            </text>
                        </g>
                    `;
                }).join('')}
            </svg>
        `;
    }
};
