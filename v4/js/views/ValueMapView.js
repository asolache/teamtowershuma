import { store } from '../core/store.js';

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "";

        // Posiciones espaciales de los nodos (Coordenadas SVG)
        const pos = {
            "@anxaneta":  { x: 400, y: 60 },
            "@aixecador": { x: 200, y: 160 },
            "@dosos":     { x: 600, y: 160 },
            "@baixos":    { x: 400, y: 340 },
            "@pinya":     { x: 700, y: 340 },
            "@proyecto":  { x: 400, y: 200 }
        };

        return `
            <div class="vna-canvas-container" style="position:relative; height:450px; background:#050a10; border-radius:12px; overflow:hidden; border:1px solid #1e293b; margin: 20px 0;">
                <svg style="position:absolute; width:100%; height:100%;">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                        </marker>
                    </defs>
                    
                    ${project.transactions.map(tx => {
                        const pStart = pos[tx.from] || pos["@proyecto"];
                        const pEnd = pos[tx.to] || pos["@proyecto"];
                        const isTangible = tx.tipo_flujo === 'tangible';
                        
                        return `
                            <line x1="${pStart.x}" y1="${pStart.y}" x2="${pEnd.x}" y2="${pEnd.y}" 
                                  stroke="#3b82f6" stroke-width="2" 
                                  stroke-dasharray="${isTangible ? '0' : '6,6'}" 
                                  marker-end="url(#arrowhead)" opacity="0.6">
                                ${!isTangible ? '<animate attributeName="stroke-dashoffset" from="100" to="0" dur="5s" repeatCount="indefinite" />' : ''}
                            </line>
                        `;
                    }).join('')}
                </svg>

                ${Object.keys(pos).map(rolId => {
                    const nombreVisible = project.customRoles[rolId] || rolId;
                    const isCore = rolId === "@proyecto";
                    return `
                        <div style="position:absolute; left:${pos[rolId].x - 35}px; top:${pos[rolId].y - 35}px; 
                                    width:70px; height:70px; background:${isCore ? '#1e293b' : '#0f172a'}; 
                                    border:2px solid ${isCore ? '#4ade80' : '#3b82f6'}; 
                                    border-radius:50%; display:flex; align-items:center; justify-content:center; 
                                    color:white; font-size:0.6rem; font-weight:bold; text-align:center; padding:5px;
                                    box-shadow:0 0 15px ${isCore ? '#4ade8033' : '#3b82f633'}; z-index:2; line-height:1;">
                            ${nombreVisible.toUpperCase()}
                        </div>
                    `;
                }).join('')}

                ${project.transactions.map(tx => {
                    const pS = pos[tx.from];
                    const pE = pos[tx.to] || pos["@proyecto"];
                    return `
                        <div style="position:absolute; left:${(pS.x + pE.x) / 2}px; top:${(pS.y + pE.y) / 2}px; 
                                    background:#1e293b; border:1px solid #3b82f6; color:white; padding:3px 6px; border-radius:4px; 
                                    font-size:0.55rem; transform:translate(-50%, -50%); z-index:10; pointer-events:none;">
                            <span style="color:#4ade80;">${tx.liquidación}€</span> | ${tx.concepto}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
};
