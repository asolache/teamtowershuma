// v8/js/components/LedgerRenderer.js
import { store } from '../core/store.js';

export class LedgerRenderer {
    /**
     * @param {HTMLElement} containerEl - Contenedor HTML donde se inyectará el Ledger
     * @param {Object} options - Configuración { projectId, showHistory }
     */
    constructor(containerEl, options = {}) {
        this.container = containerEl;
        this.options = Object.assign({
            projectId: null,
            showHistory: true
        }, options);
        this.globalUsers = store.getState().globalUsers;
    }

    static getStyles() {
        return `
            .equity-dashboard { display: grid; grid-template-columns: 350px minmax(0, 1fr); gap: 2.5rem; margin-bottom: 2rem; width: 100%; box-sizing: border-box;}
            
            .pie-panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 24px; padding: 3rem; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(15px);}
            .pie-chart { width: 220px; height: 220px; border-radius: 50%; background: conic-gradient(#333 0 100%); box-shadow: 0 0 0 10px rgba(255,255,255,0.02), inset 0 0 20px rgba(0,0,0,0.8); transition: background 1s ease-out; animation: spinIn 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
            .pie-center { position: absolute; width: 140px; height: 140px; background: var(--bg-dark); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 5px 15px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5); }
            .pie-center .total-val { font-size: 2rem; font-weight: 900; font-family: var(--font-mono); color: white;}
            .pie-center .total-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: bold;}

            .cap-table-container { background: rgba(255,255,255,0.015); border: 1px solid var(--glass-border); border-radius: 24px; padding: 2.5rem; display: flex; flex-direction: column; backdrop-filter: blur(10px); width: 100%; box-sizing: border-box; overflow-x: auto;}
            .panel-title { color: white; font-size: 1.4rem; font-weight: 900; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; flex-wrap: wrap; gap: 10px;}
            
            .cap-row { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 0; border-bottom: 1px dashed rgba(255,255,255,0.05); width: 100%; box-sizing: border-box; gap: 15px;}
            .cap-row:last-child { border-bottom: none; }
            
            .cap-user { display: flex; align-items: center; gap: 15px; width: 35%; color: white; font-weight: 900; font-size: 1.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;}
            .avatar { width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 900; color: white; font-size: 1.2rem; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0; background: rgba(0,0,0,0.5);}
            .user-info { display: flex; flex-direction: column; overflow: hidden; text-overflow: ellipsis; min-width: 0;}
            .user-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            
            .cap-bar-container { flex: 1; min-width: 50px; background: rgba(0,0,0,0.6); height: 12px; border-radius: 6px; overflow: hidden; position: relative; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);}
            .cap-bar-fill { height: 100%; border-radius: 6px; transition: width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1); width: 0%; box-shadow: 0 0 10px currentColor;}
            
            .cap-stats { text-align: right; width: 25%; font-family: var(--font-mono); min-width: 0; white-space: nowrap;}
            .cap-percent { font-size: 1.3rem; color: white; font-weight: 900; }
            .cap-slices { font-size: 0.9rem; color: var(--text-muted); }
            
            .desktop-only { display: block; }
            .mobile-only { display: none; }

            /* BLOCKCHAIN LOG */
            .ledger-container { background: transparent; border: none; padding: 0; overflow-x: auto; width: 100%;}
            .ledger-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;}
            .ledger-table th { padding: 1.2rem 1rem; background: rgba(0,0,0,0.4); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #333; font-weight: 900;}
            .ledger-table td { padding: 1.2rem 1rem; border-bottom: 1px dashed #222; color: #ddd; font-size: 0.95rem; vertical-align: middle; transition: background 0.2s;}
            .ledger-table tr:hover td { background: rgba(255,255,255,0.03); }
            
            .hash-badge { background: rgba(224, 64, 251, 0.1); color: var(--accent-purple); padding: 4px 8px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.75rem; border: 1px solid rgba(224, 64, 251, 0.3); font-weight: bold;}
            .slice-badge { color: var(--accent-green); font-weight: 900; font-family: var(--font-mono); font-size: 1.1rem; text-shadow: 0 0 10px rgba(0,230,118,0.3);}

            /* MOBILE LEDGER CARDS */
            .mobile-ledger-list { display: none; flex-direction: column; gap: 10px; width: 100%;}
            .mlc-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 12px; padding: 12px 15px; cursor: pointer; transition: 0.2s; position: relative; overflow: hidden; box-sizing: border-box; width: 100%;}
            .mlc-card.expanded { border-color: #555; background: rgba(0,0,0,0.5); }
            
            .mlc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
            .mlc-hash { font-size: 0.7rem; color: var(--accent-purple); font-family: var(--font-mono); background: rgba(224, 64, 251, 0.1); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(224, 64, 251, 0.2);}
            .mlc-date { font-size: 0.75rem; color: #666; font-family: var(--font-mono); }
            
            .mlc-main { display: flex; justify-content: space-between; align-items: center; }
            .mlc-user { color: white; font-weight: 900; font-size: 1.05rem; }
            .mlc-slices { color: var(--accent-green); font-weight: 900; font-size: 1.2rem; font-family: var(--font-mono); }
            .mlc-role { font-size: 0.8rem; color: #aaa; margin-top: 4px; }

            .mlc-details { max-height: 0; opacity: 0; transition: 0.3s; margin-top: 0; }
            .mlc-card.expanded .mlc-details { max-height: 300px; opacity: 1; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #333; }
            .mlc-desc { font-size: 0.85rem; color: #ccc; line-height: 1.4; word-break: break-word;}

            @keyframes spinIn { from { transform: rotate(-90deg) scale(0.8); opacity: 0; } to { transform: rotate(0) scale(1); opacity: 1; } }

            @media (max-width: 1024px) { .equity-dashboard { grid-template-columns: 1fr; } .pie-panel { padding: 3rem; } }
            @media (max-width: 768px) {
                .cap-table-container { padding: 2rem 1.2rem; border-radius: 20px;}
                .cap-row { min-width: 0; flex-wrap: nowrap; align-items: center; padding: 1rem 0; gap: 10px;}
                .cap-user { width: auto; flex: 1; font-size: 1rem; overflow: hidden;}
                .desktop-only { display: none !important; }
                .mobile-only { display: block; font-size: 0.75rem; color: #888; font-family: var(--font-mono); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;}
                .cap-stats { width: auto; text-align: right; display: flex; flex-direction: column; align-items: flex-end;}
                .ledger-table { display: none; }
                .mobile-ledger-list { display: flex; }
            }
        `;
    }

    render() {
        if (!this.container || !this.options.projectId) return;

        const project = store.getState().projects.find(p => p.id === this.options.projectId);
        if (!project) return;

        const harvestData = store.calculateHarvest(this.options.projectId) || [];
        const colors = ['#00b0ff', '#e040fb', '#00e676', '#ff9100', '#ff5252', '#ffd740'];
        
        let totalSlices = 0;
        harvestData.forEach(h => {
            totalSlices += (h.totalSlices || 0);
        });

        if (totalSlices === 0 || !project.ledger || project.ledger.length === 0) {
            this.container.innerHTML = `
                <div class="cap-table-container" style="text-align: center; color: #666; font-size:1.1rem;">
                    El Bloque Génesis aún no contiene equidad. Sella una Work Order para empezar a minar.
                </div>
            `;
            return;
        }

        let capHtml = '';
        let conicGradientParts = [];
        let currentDegree = 0;

        harvestData.sort((a, b) => (b.totalSlices || 0) - (a.totalSlices || 0)).forEach((userHarvest, index) => {
            const user = this.globalUsers.find(u => u.id === userHarvest.userId) || { name: userHarvest.userId };
            const rawSlices = userHarvest.totalSlices || 0;
            const percentageRaw = totalSlices > 0 ? (rawSlices / totalSlices) * 100 : 0;
            const percentageStr = percentageRaw.toFixed(2);
            const color = colors[index % colors.length];

            const nextDegree = currentDegree + (percentageRaw * 3.6);
            conicGradientParts.push(`${color} ${currentDegree}deg ${nextDegree}deg`);
            currentDegree = nextDegree;

            const userTxs = (project.ledger || []).filter(tx => tx.userId === userHarvest.userId);
            const capitalSlices = userTxs.filter(tx => tx.roleId === 'CAPITAL_ASSET').reduce((sum, tx) => sum + (tx.valorCongelado || 0), 0);
            const capitalHtml = capitalSlices > 0 ? ` | <span style="color:var(--accent-green);">Inversor</span>` : '';
            const initial = user.name.charAt(0).toUpperCase();

            capHtml += `
                <div class="cap-row">
                    <div class="cap-user">
                        <div class="avatar" style="border-color: ${color}; color: ${color};">${initial}</div>
                        <div class="user-info">
                            <div class="user-name">${user.name}</div>
                            <div class="user-sub mobile-only">Slices: ${Math.round(rawSlices).toLocaleString()}${capitalHtml}</div>
                        </div>
                    </div>
                    <div class="cap-bar-container desktop-only">
                        <div class="cap-bar-fill" style="width: 0%; background: ${color}; box-shadow: 0 0 10px ${color};" data-target-width="${percentageStr}%"></div>
                    </div>
                    <div class="cap-stats">
                        <div class="cap-percent" style="color: ${color};">${percentageStr}%</div>
                        <div class="cap-slices desktop-only">${Math.round(rawSlices).toLocaleString()} Slices</div>
                    </div>
                </div>
            `;
        });

        // Generar History HTML
        let historyHtml = '';
        if (this.options.showHistory) {
            const reversedLedger = [...project.ledger].reverse();
            let trs = '';
            let mobileCards = '';

            reversedLedger.forEach(entry => {
                const safeTimestamp = entry.timestamp || entry.date || Date.now();
                const dateStr = new Date(safeTimestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short' });
                const user = this.globalUsers.find(u => u.id === entry.userId) || { name: entry.userId };
                
                let roleName = entry.roleId === 'CAPITAL_ASSET' ? `<span style="color: var(--accent-green); font-weight:900;">💼 Capital</span>` : 'Nodo Base';
                if (entry.roleId !== 'CAPITAL_ASSET') {
                    const role = project.roles.find(r => r.id === entry.roleId);
                    if(role) roleName = `<span style="color:#aaa; font-size:0.8rem; font-family:var(--font-mono);">${role.levelId}</span>`;
                }
                
                const isCapital = entry.roleId === 'CAPITAL_ASSET';
                const horasStr = isCapital ? '--' : `${entry.horas || 1}h`;
                const slicesFmt = `+${Math.round(entry.valorCongelado || 0).toLocaleString()}`;
                
                const txId = entry.id || entry.hash || 'tx_genesi_' + Math.floor(Math.random()*1000);
                const hashShort = txId.substring(0, 8);
                const evidence = entry.description || `Ejecución Role: ${roleName.replace(/<[^>]*>?/gm, '')}`;

                trs += `
                    <tr>
                        <td><span class="hash-badge" title="${txId}">${hashShort}...</span></td>
                        <td style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem;">${dateStr}</td>
                        <td style="font-weight: 900; color: white;">${user.name}</td>
                        <td>${roleName}</td>
                        <td style="line-height:1.4; color:#ccc;">${evidence}</td>
                        <td style="font-family: var(--font-mono); color: #aaa; font-weight:bold;">${horasStr}</td>
                        <td style="text-align: right;"><span class="slice-badge">${slicesFmt}</span></td>
                    </tr>
                `;

                mobileCards += `
                    <div class="mlc-card" onclick="this.classList.toggle('expanded')">
                        <div class="mlc-top">
                            <span class="mlc-hash">${hashShort}...</span>
                            <span class="mlc-date">${dateStr}</span>
                        </div>
                        <div class="mlc-main">
                            <div>
                                <div class="mlc-user">${user.name}</div>
                                <div class="mlc-role">${roleName} ${isCapital ? '' : ` | ⏱ ${horasStr}`}</div>
                            </div>
                            <div class="mlc-slices">${slicesFmt}</div>
                        </div>
                        <div class="mlc-details">
                            <div class="mlc-desc">${evidence}</div>
                        </div>
                    </div>
                `;
            });

            historyHtml = `
                <div class="ledger-container">
                    <div class="panel-title" style="margin-bottom: 1.5rem; font-size:1.3rem; border-bottom: 1px solid #333; padding-bottom: 15px;">Registro Inmutable</div>
                    <table class="ledger-table">
                        <thead><tr><th>Tx Hash</th><th>Fecha</th><th>Nodo</th><th>Silla</th><th>Evidencia</th><th>Hrs</th><th style="text-align: right;">Slices</th></tr></thead>
                        <tbody>${trs}</tbody>
                    </table>
                    <div class="mobile-ledger-list">${mobileCards}</div>
                </div>
            `;
        }

        this.container.innerHTML = `
            <div class="equity-dashboard">
                <div class="pie-panel">
                    <div class="pie-chart" id="pieChart_${this.options.projectId}" style="background: conic-gradient(${conicGradientParts.join(', ')})"></div>
                    <div class="pie-center">
                        <div class="total-val">${Math.round(totalSlices).toLocaleString()}</div>
                        <div class="total-lbl">Total Slices</div>
                    </div>
                </div>
                <div class="cap-table-container">
                    <div class="panel-title">Distribución de Equidad</div>
                    ${capHtml}
                </div>
            </div>
            ${historyHtml}
        `;

        setTimeout(() => {
            this.container.querySelectorAll('.cap-bar-fill').forEach(bar => {
                const targetWidth = bar.getAttribute('data-target-width');
                if (targetWidth) bar.style.width = targetWidth;
            });
        }, 100);
    }
}
