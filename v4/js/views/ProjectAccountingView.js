import { store } from '../core/store.js';

// 🛡️ CÁMARA DE VIGILANCIA PARA LA CONTABILIDAD
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-add-hours-acc') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('acc-role').value;
        const horas = parseFloat(document.getElementById('acc-hours').value) || 0;
        const entregable = document.getElementById('acc-concept').value;

        if (!horas || !entregable) return alert("Indica el concepto y las horas invertidas.");

        // Registramos una transacción de tipo 'tangible' (esfuerzo directo) hacia el propio ecosistema (@general o sin destino específico)
        store.dispatch({ 
            type: 'ADD_TRANSACTION', 
            payload: { 
                projectId, 
                tx: { from, to: 'Ecosistema', entregable, tipo: 'tangible', horas } 
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
        
        // Unificamos nodos para el selector
        const allNodes = [
            ...Object.keys(project.customRoles || {}).map(id => ({ id, label: project.customRoles[id] })),
            ...(project.dynamicRoles || []).filter(dr => !dr.isArchived).map(dr => ({ id: dr.id, label: dr.name }))
        ];

        // 🧠 LÓGICA FINANCIERA: Cálculo de Valor Simbiótico
        const getFinancials = (nodeId) => {
            let baseId = nodeId;
            // Si es un especialista (dinámico), buscamos su rol base vinculado
            const dyn = (project.dynamicRoles || []).find(r => r.id === nodeId);
            if (dyn) baseId = dyn.levelId;
            
            const roleDef = state.roles.find(r => r.id === baseId);
            return roleDef ? { multiplier: roleDef.multiplier, price: roleDef.precio_base_h } : { multiplier: 1, price: 30 };
        };

        let totalValue = 0;
        let totalHours = 0;

        const ledgerRows = txs.map(t => {
            const financials = getFinancials(t.from);
            const horasReales = t.horas || 1; // Si viene del mapa sin horas, asume 1 unidad de flujo
            const valorTx = horasReales * financials.multiplier * financials.price;
            
            totalValue += valorTx;
            totalHours += horasReales;

            // Recorte del Hash para que no ocupe toda la pantalla
            const shortHash = t.hash ? t.hash.substring(0, 8) + '...' : 'pending';

            return `
                <tr style="border-top: 1px solid var(--border-color);">
                    <td style="padding: 12px;" class="text-muted text-small"><span title="${t.hash}">${shortHash}</span></td>
                    <td style="padding: 12px;">${new Date(t.timestamp || Date.now()).toLocaleDateString()}</td>
                    <td style="padding: 12px;" class="text-accent"><b>${t.from}</b></td>
                    <td style="padding: 12px;" class="text-muted">➔ ${t.to}</td>
                    <td style="padding: 12px;">${t.entregable}</td>
                    <td style="padding: 12px; text-align: center;">${horasReales}h</td>
                    <td style="padding: 12px; text-align: right; color: var(--accent-green); font-weight: bold;">${valorTx.toLocaleString()} €</td>
                </tr>
            `;
        }).join('');

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

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div class="panel">
                        <div class="text-muted text-uppercase text-small">Valor Total Circulante</div>
                        <div style="color: var(--accent-green); font-size: 2rem; font-weight: bold;">${totalValue.toLocaleString()} €</div>
                    </div>
                    <div class="panel">
                        <div class="text-muted text-uppercase text-small">Esfuerzo Acumulado</div>
                        <div style="color: var(--accent-blue); font-size: 2rem; font-weight: bold;">${totalHours} h</div>
                    </div>
                    <div class="panel">
                        <div class="text-muted text-uppercase text-small">Transacciones (Bloques)</div>
                        <div style="color: var(--text-heading); font-size: 2rem; font-weight: bold;">${txs.length}</div>
                    </div>
                </div>

                <div class="grid-layout" style="grid-template-columns: 320px 1fr;">
                    
                    <aside>
                        <div class="panel">
                            <h3 class="text-accent text-uppercase text-small">⏱️ Imputar Horas de Trabajo</h3>
                            
                            <label class="form-label">Nodo / Especialista</label>
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
                                        <th style="padding: 15px; color: var(--text-muted);">Fecha</th>
                                        <th style="padding: 15px; color: var(--text-muted);">Origen</th>
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
