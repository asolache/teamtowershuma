import { store } from '../core/store.js';

export const ValueMapView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "";

        // 1. Recopilar todos los nodos (Base + Dinámicos)
        const nodes = [
            ...Object.keys(project.customRoles || {}).map(id => ({ id, label: project.customRoles[id], type: 'base' })),
            ...(project.dynamicRoles || []).map(dr => ({ id: dr.id, label: dr.name, type: 'dynamic', parent: dr.levelId }))
        ];

        // 2. Definir posiciones circulares para los nodos base
        const centerX = 400, centerY = 300, radius = 220;
        const positions = {};
        
        nodes.forEach((node, i) => {
            if (node.type === 'base') {
                const angle = (i * 2 * Math.PI) / Object.keys(project.customRoles).length;
                positions[node.id] = {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                };
            }
        });

        // Posicionar dinámicos cerca de su padre
        nodes.filter(n => n.type === 'dynamic').forEach((node, i) => {
            const parentPos = positions[node.parent] || { x: centerX, y: centerY };
            positions[node.id] = {
                x: parentPos.x + (60 * Math.cos(i)),
                y: parentPos.y + (60 * Math.sin(i))
            };
        });

        const txs = project.transactions || [];

        return `
            <div style="width:100%; height:100%; position:relative; overflow:hidden; background:#0d1117;">
                <svg id="svg-map" viewBox="0 0 800 600" style="width:100%; height:100%; cursor:grab;">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="25" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#58a6ff" />
                        </marker>
                    </defs>

                    ${txs.map(t => {
                        const start = positions[t.from] || { x:0, y:0 };
                        const end = positions[t.to] || { x:0, y:0 };
                        const isTangible = t.tipo === 'tangible';
                        
                        return `
                            <g>
                                <line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" 
                                      stroke="#58a6ff" stroke-width="2" 
                                      stroke-dasharray="${isTangible ? '0' : '5,5'}"
                                      marker-end="url(#arrowhead)" />
                                <text x="${(start.x + end.x) / 2}" y="${(start.y + end.y) / 2 - 5}" 
                                      fill="#8b949e" font-size="10" text-anchor="middle" font-style="italic">
                                    ${t.entregable || ''}
                                </text>
                            </g>
                        `;
                    }).join('')}

                    ${nodes.map(n => `
                        <g>
                            <circle cx="${positions[n.id].x}" cy="${positions[n.id].y}" r="15" 
                                    fill="${n.type === 'base' ? '#1f6feb' : '#238636'}" stroke="#f0f6fc" stroke-width="2" />
                            <text x="${positions[n.id].x}" y="${positions[n.id].y + 30}" 
                                  fill="white" font-size="12" text-anchor="middle" font-weight="bold">
                                ${n.label}
                            </text>
                        </g>
                    `).join('')}
                </svg>

                <div style="position:absolute; bottom:10px; left:10px; background:#161b22; padding:15px; border-radius:8px; border:1px solid #30363d; display:grid; gap:8px; width:280px; z-index:100;">
                    <h4 style="margin:0; font-size:0.8rem; color:#58a6ff;">Inyectar Flujo de Valor</h4>
                    <select id="tx-from" style="background:#0d1117; color:white; font-size:0.7rem;">
                        ${nodes.map(n => `<option value="${n.id}">De: ${n.label}</option>`).join('')}
                    </select>
                    <select id="tx-to" style="background:#0d1117; color:white; font-size:0.7rem;">
                        ${nodes.map(n => `<option value="${n.id}">Para: ${n.label}</option>`).join('')}
                    </select>
                    <input id="tx-entregable" placeholder="Nombre entregable..." style="background:#0d1117; color:white; font-size:0.7rem; border:1px solid #30363d; padding:4px;">
                    <select id="tx-tipo" style="background:#0d1117; color:white; font-size:0.7rem;">
                        <option value="tangible">Tangible (Continua)</option>
                        <option value="intangible">Intangible (Discontinua)</option>
                    </select>
                    <button onclick="window.sendValue('${projectId}')" style="background:#238636; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer; font-weight:bold;">Enviar Valor →</button>
                </div>
            </div>
        `;
    }
};

window.sendValue = (pId) => {
    const from = document.getElementById('tx-from').value;
    const to = document.getElementById('tx-to').value;
    const entregable = document.getElementById('tx-entregable').value;
    const tipo = document.getElementById('tx-tipo').value;

    if (!entregable) return alert("Define el entregable");

    store.dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
            projectId: pId,
            tx: { from, to, entregable, tipo, fecha: new Date().toISOString() }
        }
    });
    location.reload();
};
