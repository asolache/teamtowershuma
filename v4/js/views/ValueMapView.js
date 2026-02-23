import { store } from '../core/store.js';

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "";

        // 1. Recopilamos todos los nodos disponibles (Base + Dinámicos)
        const allNodes = [
            ...Object.keys(project.customRoles).map(id => ({
                id,
                name: project.customRoles[id],
                type: 'base'
            })),
            ...(project.dynamicRoles || []).map(dr => ({
                id: dr.id,
                name: dr.name,
                type: 'dynamic'
            }))
        ];

        // 2. Posicionamiento en círculo (Layout radial para evitar el nodo central)
        const centerX = 400;
        const centerY = 225;
        const radius = 160;
        
        const nodesWithPos = allNodes.map((node, i) => {
            const angle = (i / allNodes.length) * 2 * Math.PI;
            return {
                ...node,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });

        // 3. Extraer relaciones del Ledger (Tuberías de Valor)
        // Por ahora, como las transacciones v4 inyectan valor al "sistema", 
        // vamos a conectar los roles que han participado hacia los roles estratégicos (@anxaneta/@aixecador)
        // o mapear flujos directos si existen.
        
        // Calculamos el valor total por rol para el grosor de los nodos
        const roleStats = project.transactions.reduce((acc, t) => {
            acc[t.rolId] = (acc[t.rolId] || 0) + t.liquidación;
            return acc;
        }, {});

        return `
            <svg viewBox="0 0 800 450" style="width:100%; height:100%; background:#0d1117;">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                ${nodesWithPos.map((src, i) => 
                    nodesWithPos.slice(i + 1).map(target => {
                        const hasInteraction = project.transactions.some(t => 
                            (t.rolId === src.id) || (t.rolId === target.id)
                        );
                        if (!hasInteraction) return '';
                        
                        return `
                            <line x1="${src.x}" y1="${src.y}" x2="${target.x}" y2="${target.y}" 
                                  stroke="#30363d" stroke-width="1" stroke-dasharray="2,2" />
                        `;
                    }).join('')
                ).join('')}

                ${nodesWithPos.map(n => {
                    const value = roleStats[n.id] || 0;
                    const size = 18 + Math.min(value / 500, 15); // El nodo crece con el valor inyectado
                    const color = n.type === 'base' ? '#238636' : '#1f6feb';
                    const active = value > 0;

                    return `
                        <g class="vna-node" style="cursor:pointer;">
                            <circle cx="${n.x}" cy="${n.y}" r="${size}" 
                                    fill="#161b22" 
                                    stroke="${active ? color : '#30363d'}" 
                                    stroke-width="${active ? 3 : 1}"
                                    filter="${active ? 'url(#glow)' : ''}" />
                            
                            <text x="${n.x}" y="${n.y + 5}" text-anchor="middle" fill="white" font-size="8" font-weight="bold" style="pointer-events:none;">
                                ${n.id.startsWith('custom') ? 'EXT' : n.id.replace('@','').toUpperCase()}
                            </text>
                            
                            <text x="${n.x}" y="${n.y + size + 15}" text-anchor="middle" fill="${active ? '#f0f6fc' : '#8b949e'}" font-size="11" font-weight="${active ? 'bold' : 'normal'}">
                                ${n.name}
                            </text>
                            
                            ${value > 0 ? `
                                <text x="${n.x}" y="${n.y - size - 10}" text-anchor="middle" fill="#3fb950" font-size="10" font-weight="bold">
                                    ${value.toLocaleString()}€
                                </text>
                            ` : ''}
                        </g>
                    `;
                }).join('')}
            </svg>
        `;
    }
};
