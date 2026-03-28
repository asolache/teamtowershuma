// =============================================================================
// TEAMTOWERS SOS V10 — LEDGER RENDERER
// Ruta: ia/dev/js/components/LedgerRenderer.js
// Componente de renderizado de Cap Table y Ledger History
// =============================================================================

import { store } from '../core/store.js';

export class LedgerRenderer {

    constructor(containerEl, options = {}) {
        this.container   = containerEl;
        this.options     = Object.assign({ projectId: null, showHistory: true }, options);
        this.globalUsers = store.getState().globalUsers;
    }

    static getStyles() {
        return `
            .equity-dashboard { display:grid; grid-template-columns:350px minmax(0,1fr); gap:2.5rem; margin-bottom:2rem; width:100%; box-sizing:border-box; }

            .pie-panel { background:linear-gradient(145deg,rgba(20,20,25,0.8),rgba(10,10,15,0.9)); border:1px solid var(--glass-border); border-radius:24px; padding:3rem; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; box-shadow:inset 0 1px 0 rgba(255,255,255,0.05),0 10px 30px rgba(0,0,0,0.5); backdrop-filter:blur(15px); }
            .pie-chart { width:220px; height:220px; border-radius:50%; background:conic-gradient(#333 0 100%); box-shadow:0 0 0 10px rgba(255,255,255,0.02),inset 0 0 20px rgba(0,0,0,0.8); transition:background 1s ease-out; animation:spinIn 1s cubic-bezier(0.2,0.8,0.2,1); }
            .pie-center { position:absolute; width:140px; height:140px; background:var(--bg-dark); border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:inset 0 5px 15px rgba(0,0,0,0.8),0 0 20px rgba(0,0,0,0.5); }
            .pie-center .total-val { font-size:2rem; font-weight:900; font-family:var(--font-mono); color:white; }
            .pie-center .total-lbl { font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; }

            .cap-table-container { background:linear-gradient(145deg,rgba(20,20,25,0.8),rgba(10,10,15,0.9)); border:1px solid var(--glass-border); border-radius:24px; padding:2rem; box-shadow:inset 0 1px 0 rgba(255,255,255,0.05),0 10px 30px rgba(0,0,0,0.4); }

            .cap-row { display:flex; align-items:center; gap:1.5rem; padding:1.2rem 0; border-bottom:1px solid rgba(255,255,255,0.05); }
            .cap-row:last-child { border-bottom:none; }
            .cap-user { display:flex; align-items:center; gap:15px; width:200px; flex-shrink:0; overflow:hidden; }
            .avatar { width:38px; height:38px; border-radius:50%; background:rgba(0,0,0,0.5); border:2px solid; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1rem; flex-shrink:0; }
            .user-info { overflow:hidden; }
            .user-name { font-weight:bold; color:white; font-size:0.95rem; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; }
            .ai-roi-badge { font-size:0.7rem; color:var(--accent-purple); background:rgba(224,64,251,0.1); padding:2px 6px; border-radius:4px; display:inline-block; margin-top:4px; }

            .cap-bar-container { flex:1; min-width:50px; background:rgba(0,0,0,0.6); height:12px; border-radius:6px; overflow:hidden; position:relative; box-shadow:inset 0 2px 5px rgba(0,0,0,0.5); }
            .cap-bar-fill { height:100%; border-radius:6px; transition:width 1.5s cubic-bezier(0.2,0.8,0.2,1); width:0%; }

            .cap-stats { text-align:right; width:25%; font-family:var(--font-mono); min-width:0; white-space:nowrap; }
            .cap-percent { font-size:1.3rem; color:white; font-weight:900; }
            .cap-slices { font-size:0.9rem; color:var(--text-muted); }

            .desktop-only { display:block; }
            .mobile-only  { display:none; }

            /* Ledger history */
            .ledger-container { background:transparent; border:none; padding:0; overflow-x:auto; width:100%; }
            .ledger-table { width:100%; border-collapse:collapse; text-align:left; min-width:800px; }
            .ledger-table th { padding:1.2rem 1rem; background:rgba(0,0,0,0.4); color:var(--text-muted); font-size:0.78rem; text-transform:uppercase; letter-spacing:1px; border-bottom:2px solid #333; font-weight:900; }
            .ledger-table td { padding:1.2rem 1rem; border-bottom:1px dashed #222; color:#ddd; font-size:0.9rem; vertical-align:middle; transition:background 0.2s; }
            .ledger-table tr:hover td { background:rgba(255,255,255,0.03); }

            .hash-badge { background:rgba(99,102,241,0.1); color:var(--accent-indigo,#6366f1); padding:4px 8px; border-radius:6px; font-family:var(--font-mono); font-size:0.72rem; border:1px solid rgba(99,102,241,0.3); font-weight:bold; }
            .node-badge { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:20px; font-size:0.78rem; font-weight:bold; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); }

            .mobile-ledger-list { display:none; flex-direction:column; gap:10px; }
            .mlc-card { background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:12px; }
            .mlc-user { display:flex; align-items:center; gap:10px; flex:1; overflow:hidden; }
            .mlc-name { font-weight:bold; color:white; font-size:0.9rem; }
            .mlc-role { color:#888; font-size:0.72rem; font-family:var(--font-mono); margin-top:2px; }
            .mlc-slices { font-family:var(--font-mono); font-size:1rem; font-weight:900; color:var(--accent-green); white-space:nowrap; }
            .mlc-details { padding:0 14px 10px; }
            .mlc-desc { font-size:0.78rem; color:#666; font-style:italic; }

            @keyframes spinIn { from { transform:rotate(-30deg) scale(0.8); opacity:0; } to { transform:rotate(0) scale(1); opacity:1; } }
            @media (max-width:1024px) { .equity-dashboard { grid-template-columns:1fr; } }
            @media (max-width:768px) {
                .cap-table-container { padding:1.5rem 1rem; }
                .desktop-only { display:none !important; }
                .mobile-only  { display:block; font-size:0.72rem; color:#888; font-family:var(--font-mono); margin-top:3px; }
                .cap-user  { width:auto; flex:1; }
                .cap-stats { width:auto; display:flex; flex-direction:column; align-items:flex-end; }
                .ledger-table { display:none; }
                .mobile-ledger-list { display:flex; }
            }
        `;
    }

    render() {
        if (!this.container || !this.options.projectId) return;

        const project = store.getState().projects.find(p => p.id === this.options.projectId);
        if (!project) return;

        const harvestData  = store.calculateHarvest?.(this.options.projectId) || [];
        const colors       = ['#6366f1','#e040fb','#00e676','#ff9100','#00b0ff','#ff5252','#ffd740'];
        const totalSlices  = harvestData.reduce((s, h) => s + (h.totalSlices || 0), 0);

        if (totalSlices === 0 || !project.ledger?.length) {
            this.container.innerHTML = `
                <div class="cap-table-container" style="text-align:center; color:#555; font-size:1rem; padding:3rem;">
                    El Bloque Génesis aún no contiene equidad. Sella una Work Order para empezar a minar.
                </div>`;
            return;
        }

        // Pre-cálculo de costes IA
        const agentCosts = {};
        (project.telemetry || []).forEach(log => {
            agentCosts[log.agentId] = (agentCosts[log.agentId] || 0) + (log.costInDollars || 0);
        });

        let capHtml             = '';
        let conicGradientParts  = [];
        let currentDegree       = 0;

        harvestData
            .sort((a, b) => (b.totalSlices || 0) - (a.totalSlices || 0))
            .forEach((userHarvest, index) => {
                const user         = this.globalUsers.find(u => u.id === userHarvest.userId) || { name: userHarvest.userId, profile: {} };
                const rawSlices    = userHarvest.totalSlices || 0;
                const percentageRaw = totalSlices > 0 ? (rawSlices / totalSlices) * 100 : 0;
                const percentageStr = percentageRaw.toFixed(2);
                const color         = colors[index % colors.length];

                const nextDegree = currentDegree + (percentageRaw * 3.6);
                conicGradientParts.push(`${color} ${currentDegree}deg ${nextDegree}deg`);
                currentDegree = nextDegree;

                const userTxs     = (project.ledger || []).filter(tx => tx.userId === userHarvest.userId);
                const capSlices   = userTxs.filter(tx => tx.roleId === 'CAPITAL_ASSET').reduce((s, tx) => s + (tx.valorCongelado || 0), 0);
                const capitalHtml = capSlices > 0 ? ` | <span style="color:var(--accent-green);">Inversor</span>` : '';

                let aiRoiHtml = '';
                if (user.profile?.isAi) {
                    const apiCost = agentCosts[user.id] || 0;
                    const rec     = apiCost > 0 ? (rawSlices / apiCost).toFixed(0) : '∞';
                    aiRoiHtml = `<div class="ai-roi-badge" title="Coste API: $${apiCost.toFixed(4)}">$${apiCost.toFixed(2)} | REC: ${rec}x</div>`;
                }

                const initial = user.profile?.isAi ? '🤖' : (user.name?.charAt(0).toUpperCase() || '?');

                capHtml += `
                <div class="cap-row">
                    <div class="cap-user">
                        <div class="avatar" style="border-color:${color}; color:${color};">${initial}</div>
                        <div class="user-info">
                            <div class="user-name">${user.name || user.id}</div>
                            ${aiRoiHtml}
                            <div class="user-sub mobile-only">Slices: ${Math.round(rawSlices).toLocaleString()}${capitalHtml}</div>
                        </div>
                    </div>
                    <div class="cap-bar-container desktop-only">
                        <div class="cap-bar-fill" style="width:0%; background:${color}; box-shadow:0 0 10px ${color};" data-target-width="${percentageStr}%"></div>
                    </div>
                    <div class="cap-stats">
                        <div class="cap-percent" style="color:${color};">${percentageStr}%</div>
                        <div class="cap-slices desktop-only">${Math.round(rawSlices).toLocaleString()} Slices</div>
                    </div>
                </div>`;
            });

        // History
        let historyHtml = '';
        if (this.options.showHistory && project.ledger?.length) {
            const reversed  = [...project.ledger].reverse();
            let trs         = '';
            let mobileCards = '';

            reversed.forEach(entry => {
                const safeTs  = entry.timestamp || entry.date || Date.now();
                const dateStr = new Date(safeTs).toLocaleString('es-ES', { day:'2-digit', month:'short' });
                const user    = this.globalUsers.find(u => u.id === entry.userId) || { name: entry.userId };

                let roleName  = entry.roleId === 'CAPITAL_ASSET'
                    ? `<span style="color:var(--accent-green); font-weight:900;">💼 Capital</span>`
                    : 'Nodo Base';
                if (entry.roleId !== 'CAPITAL_ASSET') {
                    const role = project.roles?.find(r => r.id === entry.roleId);
                    if (role) roleName = `<span style="color:#aaa; font-size:0.78rem; font-family:var(--font-mono);">${role.levelId}</span>`;
                }

                const isCapital  = entry.roleId === 'CAPITAL_ASSET';
                const horasStr   = isCapital ? `€${entry.fmv || 0}` : `${(entry.horas || 0).toFixed(2)}h`;
                const slicesVal  = entry.valorCongelado || 0;
                const slicesFmt  = slicesVal > 0
                    ? `<span style="color:var(--accent-green); font-weight:900; font-family:var(--font-mono);">+${Math.round(slicesVal).toLocaleString()}</span>`
                    : '—';
                const hashShort  = (entry.id || entry.roleId || '').substring(0, 10);
                const evidence   = entry.proofLink
                    ? `<a href="${entry.proofLink}" target="_blank" style="color:var(--accent-indigo); font-size:0.78rem;">🔗 PoW</a>`
                    : (entry.desc || entry.comentario || '—').substring(0, 40);

                trs += `
                <tr>
                    <td><span class="hash-badge">${hashShort}…</span></td>
                    <td style="color:#888; font-size:0.8rem;">${dateStr}</td>
                    <td><span class="node-badge">${user.profile?.isAi ? '🤖 ' : ''}${user.name || user.id}</span></td>
                    <td>${roleName}</td>
                    <td>${evidence}</td>
                    <td style="font-family:var(--font-mono); color:var(--accent-indigo);">${horasStr}</td>
                    <td style="text-align:right;">${slicesFmt}</td>
                </tr>`;

                mobileCards += `
                <div class="mlc-card">
                    <div class="mlc-user">
                        <div class="mlc-name">${user.profile?.isAi ? '🤖 ' : ''}${user.name || user.id}</div>
                        <div class="mlc-role">${roleName} ${isCapital ? '' : `· ⏱ ${horasStr}`}</div>
                    </div>
                    <div class="mlc-slices">${slicesFmt}</div>
                </div>`;
            });

            historyHtml = `
            <div class="ledger-container" style="margin-top:2rem;">
                <div class="panel-title" style="margin-bottom:1.5rem; font-size:1.2rem; border-bottom:1px solid #333; padding-bottom:14px; color:white; font-weight:900;">Registro Inmutable</div>
                <table class="ledger-table">
                    <thead><tr><th>Tx Hash</th><th>Fecha</th><th>Nodo</th><th>Silla</th><th>Evidencia</th><th>Hrs/€</th><th style="text-align:right;">Slices</th></tr></thead>
                    <tbody>${trs}</tbody>
                </table>
                <div class="mobile-ledger-list">${mobileCards}</div>
            </div>`;
        }

        this.container.innerHTML = `
        <div class="equity-dashboard">
            <div class="pie-panel">
                <div class="pie-chart" id="pieChart_${this.options.projectId}"
                     style="background:conic-gradient(${conicGradientParts.join(', ')})"></div>
                <div class="pie-center">
                    <div class="total-val">${Math.round(totalSlices).toLocaleString()}</div>
                    <div class="total-lbl">Total Slices</div>
                </div>
            </div>
            <div class="cap-table-container">
                <div class="panel-title" style="color:white; font-weight:900; font-size:1rem; margin-bottom:1.5rem;">Distribución de Equidad</div>
                ${capHtml}
            </div>
        </div>
        ${historyHtml}`;

        // Animar barras
        setTimeout(() => {
            this.container.querySelectorAll('.cap-bar-fill').forEach(bar => {
                const w = bar.getAttribute('data-target-width');
                if (w) bar.style.width = w;
            });
        }, 100);
    }
}
