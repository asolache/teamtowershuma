// v4/js/views/ValueMapView.js
import { store } from '../core/store.js';

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        
        if (!project || !project.customRoles) {
            return `<div style="color:red; padding:20px;">Error: Datos de roles no encontrados para este proyecto.</div>`;
        }

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
                    ${project.transactions.map(tx => {
                        const pStart = pos[tx.from] || pos["@proyecto"];
                        const pEnd = pos[tx.to] || pos["@proyecto"];
                        return `<line x1="${pStart.x}" y1="${pStart.y}" x2="${pEnd.x}" y2="${pEnd.y}" stroke="#3b82f6" stroke-width="2" opacity="0.5" />`;
                    }).join('')}
                </svg>

                ${Object.keys(pos).map(rolId => {
                    // SEGURO: Si el rolId no está en customRoles, mostramos el ID
                    const nombreVisible = project.customRoles[rolId] || rolId;
                    return `
                        <div style="position:absolute; left:${pos[rolId].x - 35}px; top:${pos[rolId].y - 35}px; 
                                    width:70px; height:70px; background:#0f172a; border:2px solid #3b82f6; 
                                    border-radius:50%; display:flex; align-items:center; justify-content:center; 
                                    color:white; font-size:0.6rem; font-weight:bold; text-align:center; padding:5px; z-index:2;">
                            ${nombreVisible.toUpperCase()}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
};
