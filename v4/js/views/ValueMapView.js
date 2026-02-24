import { store } from '../core/store.js';

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "";

        // 1. Leer Roles Activos Unificados
        const activeRoles = (project.roles || []).filter(r => !r.isArchived);

        // 2. Motor Físico: Órbitas Concéntricas
        const centerX = 400;
        const centerY = 350;
        const positions = {};
        
        // Radios de las órbitas para cada nivel jerárquico
        const orbits = {
            '@anxaneta': 0,     // Centro (Dirección)
            '@aixecador': 80,   // Órbita 1 (Management)
            '@dosos': 160,      // Órbita 2 (Calidad)
            '@baixos': 240,     // Órbita 3 (Operativa)
            '@pinya': 320       // Órbita 4 (Soporte Base)
        };

        // Distribuimos matemáticamente los roles en su órbita correspondiente
        Object.keys(orbits).forEach(level => {
            const rolesInLevel = activeRoles.filter(r => r.levelId === level);
            const radius = orbits[level];
            
            rolesInLevel.forEach((node, i) => {
                if (radius === 0) {
                    // Centro: Si hay más de un anxaneta, los separamos ligeramente
                    const offset = rolesInLevel.length > 1 ? 20 : 0;
                    const angle = (i * 2 * Math.PI) / rolesInLevel.length;
                    positions[node.id] = { x: centerX + offset * Math.cos(angle), y: centerY + offset * Math.sin(angle) };
                } else {
                    // Repartir homogéneamente por el anillo
                    const angle = (i * 2 * Math.PI) / rolesInLevel.length - (Math.PI / 2); // Start at top
                    positions[node.id] = {
                        x: centerX + radius * Math.cos(angle),
                        y: centerY + radius * Math.sin(angle)
                    };
                }
            });
        });

        // 3. Renderizado SVG
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

                ${Object.values(orbits).filter(r => r > 0).map(r => `
                    <circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="#30363d" stroke-width="1" stroke-dasharray="4,4" opacity="0.3" />
                `).join('')}

                ${(project.transactions || []).map(t => {
                    const start = positions[t.from];
                    const end = positions[t.to];
                    if (!start || !end) return '';

                    const isTangible = t.tipo === 'tangible';
                    const color = isTangible ? '#58a6ff' : '#a371f7';
                    const marker = isTangible ? 'url(#arrow-tangible)' : 'url(#arrow-intangible)';
                    const dash = isTangible ? '0' : '5,5';

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

                ${activeRoles.map(n => {
                    const pos = positions[n.id];
                    if(!pos) return '';
                    // Si es base lo pintamos azul, si fue añadido a mano, verde.
                    const fillColor = n.isBase ? '#1f6feb' : '#238636'; 
                    return `
                        <g class="map-node">
                            <circle cx="${pos.x}" cy="${pos.y}" r="20" 
                                    fill="${fillColor}" 
                                    stroke="#f0f6fc" stroke-width="2" />
                            
                            <text x="${pos.x}" y="${pos.y + 35}" 
                                  fill="white" font-size="12" font-weight="bold" font-family="sans-serif" text-anchor="middle">
                                ${n.name}
                            </text>
                        </g>
                    `;
                }).join('')}
            </svg>
        `;
    }
};
