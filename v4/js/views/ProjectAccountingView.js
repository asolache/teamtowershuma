import { store } from '../core/store.js';

// 🛡️ CÁMARA DE VIGILANCIA PARA LA CONTABILIDAD
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-add-hours-acc') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('acc-role').value;
        const horas = parseFloat(document.getElementById('acc-hours').value) || 0;
        const entregable = document.getElementById('acc-concept').value;

        if (!horas || !entregable) return alert("Indica el concepto y las horas aportadas.");

        // Guardamos explícitamente la fecha en formato ISO
        store.dispatch({ 
            type: 'ADD_TRANSACTION', 
            payload: { 
                projectId, 
                tx: { 
                    from, 
                    to: 'Ecosistema', 
                    entregable, 
                    tipo: 'tangible', 
                    horas,
                    fecha: new Date().toISOString()
                } 
            } 
        });
    }
});

export const ProjectAccountingView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(x => x.id === projectId);
        if (!project) return `<div class="container text-center"><h2>Proyecto no encontrado</h2></div>`;

        const txs = project.transactions || [];
        
        // Unificamos nodos para el selector y el traductor de nombres
        const allNodes = [
            ...Object.keys(project.customRoles || {}).map(id => ({ id, label: project.customRoles[id] })),
            ...(project.dynamicRoles || []).filter(dr => !dr.isArchived).map(dr => ({ id: dr.id, label: dr.name }))
        ];

        // Función para traducir el ID al nombre legible en la tabla
        const getNodeName = (id) => {
            if (id === 'Ecosistema') return 'Ecosistema';
            const node = allNodes.find(n => n.id === id);
            return node ? node.label : id;
        };

        // Función financiera para calcular valor
        const getFinancials = (nodeId) => {
            let baseId = nodeId;
            const dyn = (project.dynamicRoles || []).find(r => r.id === nodeId);
            if (dyn) baseId = dyn.levelId;
            
            const roleDef = state.roles.find(r => r.id === baseId);
            return roleDef ? { multiplier: roleDef.multiplier, price: roleDef.precio_base_h } : { multiplier: 1, price: 30 };
        };

        let totalValue = 0;
        let totalHours = 0;
        const valueByNode = {}; // Almacén para el gráfico de tarta

        const ledgerRows = txs.map(t => {
            const financials = getFinancials(t.from);
            const horasReales = parseFloat(t.horas) || 1; 
            const valorTx = horasReales * financials.multiplier * financials.price;
            
            totalValue += valorTx;
            totalHours += horasReales;

            // Acumulamos el valor generado por este rol
            if (!valueByNode[t.from]) valueByNode[t.from] = 0;
            valueByNode[t.from] += valorTx;

            const shortHash = t.hash ? t.hash.substring(0, 8) + '...' : 'pending';
            // Formateo correcto de fecha y hora
            const fechaFormat = t.fecha ? new Date(t.fecha).toLocaleString() : new Date(t.timestamp || Date.now()).toLocaleString();

            return `
                <tr style="border-top: 1px solid var(--border-color);">
                    <td style="padding: 12px;" class="text-muted text-small"><span title="${t.hash}">${shortHash}</span></td>
                    <td style="padding: 12px; font-size: 0.8rem;">${fechaFormat}</td>
                    <td style="padding: 12px;" class="text-accent">
                        <b>${getNodeName(t.from)}</b> <span style="font-size:0.7rem; color:var(--text-muted)">(${t.from})</span>
                    </td>
                    <td style="padding: 12px;" class="text-muted">➔ ${getNodeName(t.to)}</td>
                    <td style="padding: 12px;">${t.entregable}</td>
                    <td style="padding: 12px; text-align: center;">${horasReales}h</td>
                    <td style="padding: 12px; text-align: right; color: var(--accent-green); font-weight: bold;">${valorTx.toLocaleString()} €</td>
                </tr>
            `;
        }).join('');

        // 📊 LÓGICA DEL GRÁFICO DE TARTA (Conic Gradient)
        const colors = ['#58a6ff', '#238636', '#a371f7', '#f85149', '#d29922', '#3fb950', '#bc8cff', '#ff7b72'];
        let conicGradient = [];
        let chartLegend = [];
        let currentAngle = 0;
        
        // Ordenar nodos por mayor aportación
        const nodesArr = Object.keys(valueByNode).sort((a,b) => valueByNode[b] - valueByNode[a]);
        
        if (totalValue > 0) {
            nodesArr.forEach((nodeId, index) => {
                const percentage = (valueByNode[nodeId] / totalValue) * 100;
                const color = colors[index % colors.length];
                const angle = (percentage / 100) * 360;
                
                conicGradient.push(`${color} ${currentAngle}deg ${currentAngle + angle}deg`);
                currentAngle += angle;
                
                chartLegend.push(`
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px; font-size:0.8rem;">
                        <div style="width:12px; height:12px; border-radius:3px; background:${color};"></div>
                        <span class="text-muted" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:80px;" title="${getNodeName(nodeId)}">${getNodeName(nodeId)}:</span> 
                        <b class="text-heading">${percentage.toFixed(1)}%</b>
                    </div>
                `);
            });
        } else {
            conicGradient.push(`var(--border-color) 0deg 360deg`);
        }

        const pieStyle = `width: 120px; height: 120px; border-radius: 50%; background: conic-gradient(${conicGradient.join(', ')}); border: 2px solid var(--bg-panel); flex-shrink: 0;`;

        return `
            <div class="container">
                <header class="header-main">
                    <div>
                        <h1>💰 Libro Mayor: ${project.nombre}</h1>
                        <p class="text-muted" style="margin: 0;">Auditoría Inmutable de Valor y Esfuerzo</p>
                    </div>
                    <button class="btn btn-outline" onclick="location.hash='#/project/${projectId}'">
                        ← Volver al Mapa
                    </button>
                </header>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1.5fr; gap: 20px; margin-bottom: 30px;">
                    <div class="panel">
                        <div class="text-muted text-uppercase text-small">Valor Generado</div>
                        <div style="color: var(--accent-green); font-size: 2rem; font-weight: bold;">${totalValue.toLocaleString()} €</div>
                    </div>
                    <div class="panel">
                        <div class="text-muted text-uppercase text-small">Esfuerzo Total</div>
                        <div style="color: var(--accent-blue); font-size: 2rem; font-weight: bold;">${totalHours} h</div>
                    </div>
                    <div class="panel">
                        <div class="text-muted text-uppercase text-small">Aportaciones Totales</div>
                        <div style="color: var(--text-heading); font-size: 2rem; font-weight: bold;">${txs.length}</div>
                    </div>
                    
                    <div class="panel" style="display: flex; gap: 20px; align-items: center; justify-content: space-around;">
                        <div style="${pieStyle}"></div>
                        <div style="flex-grow: 1;">
                            <h4 class="text-muted text-uppercase text-small" style="margin-top:0; border-bottom:1px solid var(--border-color); padding-bottom:5px;">Distribución</h4>
                            <div style="max-height: 90px; overflow-y: auto; padding-right:5px;">
                                ${totalValue > 0 ? chartLegend.join('') : '<span class="text-muted text-small">Aporta valor para ver el gráfico</span>'}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid-layout" style="grid-template-columns: 320px 1fr;">
                    
                    <aside>
                        <div class="panel">
                            <h3 class="text-accent text-uppercase text-small">⏱️ Anotar Aportación de Valor</h3>
                            
                            <label class="form-label">Rol / Especialista (Origen)</label>
                            <select id="acc-role" class="form-control">
                                ${allNodes.map(n => `<option value="${n.id}">${n.label} (${n.id})</option>`).join('')}
                            </select>
                            
                            <label class="form-label">Horas Invertidas</label>
                            <input id="acc-hours" type="number" min="0.5" step="0.5" class="form-control" placeholder="Ej: 4">
                            
                            <label class="form-label">Concepto (Entregable)</label>
                            <input id="acc-concept" type="text" class="form-control" placeholder="Ej: Desarrollo de API">
                            
                            <button id="btn-add-hours-acc" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-top: 15px;">
                                Inyectar Valor
                            </button>
                            <p class="text-muted text-small" style="margin-top: 15px; text-align: center;">
                                El sistema calculará el valor en base al multiplicador del rol seleccionado.
                            </p>
                        </div>
                    </aside>

                    <main>
                        <div class="panel-surface" style="padding: 0; overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                                <thead style="background-color: var(--bg-panel); border-bottom: 2px solid var(--border-color);">
                                    <tr>
                                        <th style="padding: 15px; color: var(--text-muted);">Hash</th>
                                        <th style="padding: 15px; color: var(--text-muted);">Fecha y Hora</th>
                                        <th style="padding: 15px; color: var(--text-muted);">Origen (Rol)</th>
                                        <th style="padding: 15px; color: var(--text-muted);">Destino</th>
                                        <th style="padding: 15px; color: var(--text-muted);">Concepto</th>
                                        <th style="padding: 15px; color: var(--text-muted); text-align: center;">Esfuerzo</th>
                                        <th style="padding: 15px; color: var(--text-muted); text-align: right;">Valor (€)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${txs.length === 0 ? `<tr><td colspan="7" class="text-center text-muted" style="padding: 30px;">No hay transacciones registradas en el Ledger.</td></tr>` : ledgerRows}
                                </tbody>
                            </table>
                        </div>
                    </main>
                </div>
            </div>
        `;
    }
};
