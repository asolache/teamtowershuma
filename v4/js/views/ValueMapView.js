import { store } from '../core/store.js';

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "";

        // 1. Unificar todos los Nodos (Ontología Base + Gremio)
        const nodes = [
            ...Object.keys(project.customRoles || {}).map(id => ({ 
                id, 
                label: project.customRoles[id], 
                type: 'base' 
            })),
            ...(project.dynamicRoles || []).filter(dr => !dr.isArchived).map(dr => ({ 
                id: dr.id, 
                label: dr.name, 
                type: 'dynamic', 
                parent: dr.levelId 
            }))
        ];

        // 2. Motor Físico: Posicionamiento de Nodos
        const centerX = 400;
        const centerY = 350;
        const radius = 240;
        const positions = {};

        // 2.1. Posicionar Roles Base en un anillo central
        const baseNodes = nodes.filter(n => n.type === 'base');
        baseNodes.forEach((node, i) => {
            const angle = (i * 2 * Math.PI) / baseNodes.length;
            positions[node.id] = {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });

        // 2.2. Posicionar Especialistas (Dinámicos) cerca de su Rol Base asociado
        const dynamicNodes = nodes.filter(n => n.type === 'dynamic');
        dynamicNodes.forEach((node, i) => {
            const parentPos = positions[node.parent];
            if (parentPos) {
                // Generamos un pequeño ángulo para que no se superpongan si hay varios en el mismo padre
                const offsetAngle = (i * Math.PI) / 4; 
                positions[node.id] = {
                    x: parentPos.x + 90 * Math.cos(offsetAngle),
                    y: parentPos.y + 90 * Math.sin(offsetAngle)
                };
            } else {
                // Si por algún motivo no tienen padre, los mandamos al centro
                positions[node.id] = { x: centerX, y: centerY };
            }
        });

        // 3. Renderizar el Lienzo SVG
        return `
            <svg id="svg-map" viewBox="0 0 800 700" style="width:100%; height:100%;" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <marker id="arrow-tangible" markerWidth="10" markerHeight="10" refX="28" refY="5" orient="auto">
                        <path d="M0,0 L10,5 L0,10 Z" fill="#58a6ff" />
                    </marker>
                    <marker id="arrow-intangible" markerWidth="10" markerHeight="10" refX="28" refY="5" orient="auto">
                        <path d="M0,0 L10,5 L0,10 Z" fill="#a371f7" />
                    </marker>
                </defs>

                ${(project.transactions || []).map(t => {
                    const start = positions[t.from];
                    const end = positions[t.to];
                    if (!start || !end) return '';

                    const isTangible = t.tipo === 'tangible';
                    const color = isTangible ? '#58a6ff' : '#a371f7';
                    const marker = isTangible ? 'url(#arrow-tangible)' : 'url(#arrow-intangible)';
                    const dash = isTangible ? '0' : '5,5';

                    // Calculamos el punto medio para poner la etiqueta
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;

                    return `
                        <g class="tx-flow">
                            <line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" 
                                  stroke="${color}" stroke-width="2" 
                                  stroke-dasharray="${dash}" 
                                  marker-end="${marker}" opacity="0.8" />
                            
                            <rect x="${midX - 40}" y="${midY - 10}" width="80" height="20" fill="#0d1117" rx="4" />
                            
                            <text x="${midX}" y="${midY + 4}" fill="#c9d1d9" font-size="10" font-family="sans-serif" text-anchor="middle" font-style="italic">
                                ${t.entregable}
                            </text>
                        </g>
                    `;
                }).join('')}

                ${dynamicNodes.map(node => {
                    const parentPos = positions[node.parent];
                    const childPos = positions[node.id];
                    if(!parentPos) return '';
                    return `
                        <line x1="${parentPos.x}" y1="${parentPos.y}" x2="${childPos.x}" y2="${childPos.y}" 
                              stroke="#30363d" stroke-width="1" stroke-dasharray="2,2" />
                    `;
                }).join('')}

                ${nodes.map(n => `
                    <g class="map-node" style="cursor: pointer;">
                        <circle cx="${positions[n.id].x}" cy="${positions[n.id].y}" r="20" 
                                fill="${n.type === 'base' ? '#1f6feb' : '#238636'}" 
                                stroke="#f0f6fc" stroke-width="2" />
                        
                        <text x="${positions[n.id].x}" y="${positions[n.id].y + 35}" 
                              fill="white" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">
                            ${n.label}
                        </text>
                        
                        ${n.type === 'base' ? `
                            <text x="${positions[n.id].x}" y="${positions[n.id].y + 48}" 
                                  fill="#8b949e" font-size="9" font-family="sans-serif" text-anchor="middle">
                                ${n.id}
                            </text>
                        ` : ''}
                    </g>
                `).join('')}
            </svg>
        `;
    }
};
