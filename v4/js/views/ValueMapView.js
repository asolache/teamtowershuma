import { store } from '../core/store.js';

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "";

        // Posiciones estratégicas para el Grafo VNA
        const pos = {
            "@anxaneta": { x: 400, y: 60 },
            "@aixecador": { x: 200, y: 160 },
            "@dosos": { x: 600, y: 160 },
            "@baixos": { x: 400, y: 340 },
            "@pinya": { x: 700, y: 340 },
            "@proyecto": { x: 400, y: 200 }
        };

        return `
            <div style="position:relative; height:450px; background:#050a10; border-radius:12px; overflow:hidden; border:1px solid #1e293b;">
                <svg style="position:absolute; width:100%; height:100%;">
                    <defs>
                        <marker id="arrow" markerWidth="10" markerHeight="10" refX="25" refY="5" orient="auto">
                            <path d="M0,0 L10,5 L0,10 Z" fill="#3b82f6" />
                        </marker>
                    </defs>
                    ${project.transactions.map(tx => {
                        const p1 = pos[tx.from] || pos["@proyecto"];
                        const p2 = pos[tx.to] || pos["@proyecto"];
                        return `
                            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" 
                                  stroke="#3b82f6" stroke-width="2" stroke-dasharray="4" 
                                  marker-end="url(#arrow)" opacity="0.5">
                                <animate attributeName="stroke-dashoffset" from="100" to="0" dur="10s" repeatCount="indefinite" />
                            </line>
                        `;
                    }).join('')}
                </svg>

                ${Object.keys(pos).map(rol => `
                    <div style="position:absolute; left:${pos[rol].x - 35}px; top:${pos[rol].y - 35}px; 
                                width:70px; height:70px; background:#1e293b; border:2px solid #3b82f6; 
                                border-radius:50%; display:flex; align-items:center; justify-content:center; 
                                color:white; font-size:0.6rem; font-weight:bold; box-shadow:0 0 15px #3b82f633;">
                        ${rol}
                    </div>
                `).join('')}

                ${project.transactions.map(tx => {
                    const p1 = pos[tx.from] || pos["@proyecto"];
                    const p2 = pos[tx.to] || pos["@proyecto"];
                    return `<div style="position:absolute; left:${(p1.x + p2.x) / 2}px; top:${(p1.y + p2.y) / 2}px; 
                                 background:#3b82f6; color:white; padding:2px 6px; border-radius:4px; 
                                 font-size:0.6rem; transform:translate(-50%, -50%); z-index:10; cursor:help;" 
                                 title="${tx.concepto}">
                                ${tx.liquidación}€
                            </div>`;
                }).join('')}
            </div>
        `;
    }
};
