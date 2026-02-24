import { store } from '../core/store.js';

// 🛡️ EVENTOS REACTIVOS DE LA CONTABILIDAD
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-add-hours-acc') {
        const projectId = e.target.getAttribute('data-pid');
        const from = document.getElementById('acc-role').value;
        const horas = parseFloat(document.getElementById('acc-hours').value) || 0;
        const entregable = document.getElementById('acc-concept').value;
        // Permitir registrar transacciones en el pasado para las Rondas
        const fechaManual = document.getElementById('acc-date').value;

        if (!horas || !entregable) return alert("Indica el concepto y las horas aportadas.");

        // Si hay fecha manual, la convertimos a formato ISO
        const fechaFinal = fechaManual ? new Date(fechaManual).toISOString() : new Date().toISOString();

        store.dispatch({ 
            type: 'ADD_TRANSACTION', 
            payload: { 
                projectId, 
                tx: { 
                    from, to: 'Ecosistema', entregable, tipo: 'tangible', 
                    horas, fecha: fechaFinal
                } 
            } 
        });
    }
});

document.addEventListener('change', (e) => {
    if (e.target.id === 'filter-ronda') {
        const projectId = e.target.getAttribute('data-pid');
        const selectedRonda = e.target.value;
        // Re-renderizamos la vista con el filtro aplicado
        const app = document.getElementById('app');
        app.innerHTML = ProjectAccountingView.render(projectId, selectedRonda);
    }
});

export const ProjectAccountingView = {
    render: (projectId, filterRondaId = 'all') => {
        const state = store.getState();
        const project = state.projects.find(x => x.id === projectId);
        if (!project) return `<div class="container text-center"><h2>Proyecto no encontrado</h2></div>`;

        const activeRoles = (project.roles || []).filter(r => !r.isArchived);
        const rondas = project.rondas || [];
        
        // 🚀 FILTRO DINÁMICO POR RONDAS
        let allTxs = project.transactions || [];
        let txs = allTxs;
        let currentRondaName = "Histórico Completo (Global)";

        if (filterRondaId !== 'all') {
            const r = rondas.find(x => x.id === filterRondaId);
            if (r) {
                currentRondaName = r.name;
                txs = allTxs.filter(t => {
                    const txDate = t.fecha ? t.fecha.split('T')[0] : new Date(t.timestamp).toISOString().split('T')[0];
                    const afterStart = r.startDate ? txDate >= r.startDate : true;
                    const beforeEnd = r.endDate ? txDate <= r.endDate : true;
                    return afterStart && beforeEnd;
                });
            }
        }

        // Resiliencia calculada SOLO para las transacciones filtradas
        const resiliencia = store.calculateResilience(projectId, txs);

        const getNodeName = (id) => {
            if (id === 'Ecosistema') return 'Ecosistema';
            const node = activeRoles.find(n => n.id === id);
            return node ? node.name : id; 
        };

        let totalValue = 0;
        let totalHours = 0;
        const valueByNode = {}; 

        const ledgerRows = txs.map(t => {
            const horasReales = parseFloat(t.horas) || 1; 
            
            // 🧊 INMUTABILIDAD FINANCIERA
            let valorTx = t.valorCongelado !== undefined ? t.valorCongelado : 0;
            
            totalValue += valorTx;
            totalHours += horasReales;

            if (!valueByNode[t.from]) valueByNode[t.from] = 0;
            valueByNode[t.from] += valorTx;

            const shortHash = t.hash ? t.hash.substring(0, 8) + '...' : 'pending';
            const fechaFormat = t.fecha ? new Date(t.fecha).toLocaleString() : new Date(t.timestamp || Date.now()).toLocaleString();
            
            const originRole = activeRoles.find(r => r.id === t.from);
            const levelLabel = originRole ? `(${originRole.levelId})` : '';
            
            // Etiqueta visual para saber si esta transacción tuvo multiplicador Slicing Pie
            const multiBadge = t.rondaMultiplier && t.rondaMultiplier !== 1 ? `<span style="font-size:0.65rem; background:#d29922; color:#000; padding:1px 4px; border-radius:3px; margin-left:5px;">Riesgo ${t.rondaMultiplier}x</span>` : '';

            return `
                <tr style="border-top: 1px solid var(--border-color);">
                    <td style="padding: 12px;" class="text-muted text-small"><span title="${t.hash}">${shortHash}</span></td>
                    <td style="padding: 12px; font-size: 0.8rem;">${fechaFormat}</td>
                    <td style="padding: 12px;" class="text-accent">
                        <b>${getNodeName(t.from)}</b> ${multiBadge} <span style="font-size:0.7rem; color:var(--text-muted); display:block; margin-top:2px;">${levelLabel}</span>
                    </td>
                    <td style="padding: 12px;" class="text-muted">➔ ${getNodeName(t.to)}</td>
                    <td style="padding: 12px;">${t.entregable}</td>
                    <td style="padding: 12px; text-align: center;">${horasReales}h</td>
                    <td style="padding: 12px; text-align: right; color: var(--accent-green); font-weight: bold;">${valorTx.toLocaleString()} €</td>
                </tr>
            `;
        }).join('');

        // 📊 LÓGICA DE ALERTAS (Basada en el contexto actual)
        const alertas = [];
        if (txs.length > 0) {
            const hasAudit = txs.some(t => {
                const rFrom = project.roles.find(r => r.id === t.from);
                const rTo = project.roles.find(r => r.id === t.to);
                return (rFrom && rFrom.levelId === '@dosos') || (rTo && rTo.levelId === '@dosos');
            });
            if (!hasAudit) {
                alertas.push({ nivel: 'CRÍTICA', color: 'var(--accent-red)', msg: `Riesgo de Deuda Técnica en ${currentRondaName}: No hay flujo de auditoría o calidad (Nivel @dosos).` });
            }
        }

        const alertasHtml = alertas.length > 0 ? alertas.map(a => `
            <div style="background: rgba(0,0,0,0.2); border-left: 4px solid ${a.color}; padding: 10px 15px; margin-bottom: 10px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
                <span style="color: ${a.color}; font-size: 0.75rem; font-weight: bold; margin-right: 10px;">[${a.nivel}]</span>
                <span style="font-size: 0.85rem;">${a.msg}</span>
            </div>
        `).join('') : `<div class="text-muted text-small">✅ El flujo en ${currentRondaName} está sano y equilibrado.</div>`;

        // 📊 GRÁFICO DE TARTA
        const colors = ['#58a6ff', '#238636', '#a371f7', '#f85149', '#d29922', '#3fb950', '#bc8cff', '#ff7b72'];
        let conicGradient = [];
        let chartLegend = [];
        let currentAngle = 0;
        
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
                <header class="header-main" style="align-items: flex-end;">
                    <div>
                        <h1>💰 Libro Mayor: ${project.nombre}</h1>
                        <p class="text-muted" style="margin: 0;">Auditoría Inmutable de Valor y Tokenomics</p>
                    </div>
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 10px; background: var(--bg-surface); border: 1px solid var(--border-color); padding: 5px 15px; border-radius: var(--radius-md);">
                            <span class="text-muted text-small">
