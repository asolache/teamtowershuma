// v5/js/views/LedgerView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class LedgerView {
    constructor() {
        document.title = "Ledger de Equity | TeamTowers SOS";
        this.activeProjectId = null;
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; position: relative;}
                
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

                .btn-permaweb { background: transparent; border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 8px 15px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: all 0.2s; font-family: var(--font-mono); display: flex; align-items: center; gap: 8px;}
                .btn-permaweb:hover { background: rgba(255, 171, 64, 0.1); box-shadow: 0 0 15px rgba(255, 171, 64, 0.2); transform: translateY(-2px);}

                /* PANEL SUPERIOR: EL PASTEL (PIE) Y LA CAP TABLE */
                .equity-dashboard { display: grid; grid-template-columns: 300px 1fr; gap: 2rem; margin-bottom: 3rem;}
                
                .pie-panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;}
                
                /* Dynamic CSS Pie Chart */
                .pie-chart {
                    width: 200px; height: 200px; border-radius: 50%;
                    background: conic-gradient(#333 0 100%);
                    box-shadow: 0 0 0 10px rgba(255,255,255,0.02), inset 0 0 20px rgba(0,0,0,0.8);
                    transition: background 1s ease-out;
                    animation: spinIn 1s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .pie-center {
                    position: absolute; width: 130px; height: 130px; background: var(--bg-panel);
                    border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center;
                    box-shadow: inset 0 5px 15px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.8);
                }
                .pie-center .total-val { font-size: 1.8rem; font-weight: 900; font-family: var(--font-mono); color: white;}
                .pie-center .total-lbl { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;}

                /* CAP TABLE (BARRAS) */
                .cap-table-container { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 2rem; display: flex; flex-direction: column;}
                .panel-title { color: white; font-size: 1.2rem; font-weight: bold; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
                
                .cap-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px dashed rgba(255,255,255,0.05); min-width: 500px;}
                .cap-row:last-child { border-bottom: none; }
                .cap-user { display: flex; align-items: center; gap: 15px; width: 30%; color: white; font-weight: bold;}
                .avatar { width: 35px; height: 35px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 1rem; border: 2px solid #333; flex-shrink: 0;}
                
                .cap-bar-container { flex: 1; margin: 0 2rem; background: rgba(0,0,0,0.5); height: 10px; border-radius: 6px; overflow: hidden; position: relative; }
                .cap-bar-fill { height: 100%; border-radius: 6px; transition: width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1); width: 0%; }
                
                .cap-stats { text-align: right; width: 25%; font-family: var(--font-mono); }
                .cap-percent { font-size: 1.2rem; color: white; font-weight: bold; }
                .cap-slices { font-size: 0.85rem; color: var(--text-muted); }
                .cap-fmv { font-size: 0.7rem; color: #666; margin-top: 4px; }

                /* BLOCKCHAIN LOG (TRIPLE ENTRY PREVIEW) */
                .ledger-container { background: #08080a; border: 1px solid #1a1a24; border-radius: var(--border-radius-lg); padding: 2rem; position: relative; overflow-x: auto;}
                
                .ledger-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;}
                .ledger-table th { padding: 1.2rem 1rem; background: rgba(0,0,0,0.5); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #222; }
                .ledger-table td { padding: 1rem; border-bottom: 1px dashed #1a1a24; color: #ddd; font-size: 0.9rem; vertical-align: middle; transition: background 0.2s;}
                .ledger-table tr:hover td { background: rgba(255,255,255,0.02); }
                
                .hash-badge { background: rgba(224, 64, 251, 0.1); color: var(--accent-purple); padding: 4px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem; border: 1px solid rgba(224, 64, 251, 0.3); }
                .slice-badge { color: var(--accent-green); font-weight: bold; font-family: var(--font-mono); font-size: 1rem; }
                .empty-ledger { padding: 4rem; text-align: center; color: #666; font-style: italic;}

                @keyframes spinIn { from { transform: rotate(-90deg) scale(0.8); opacity: 0; } to { transform: rotate(0) scale(1); opacity: 1; } }

                @media (max-width: 1024px) {
                    .equity-dashboard { grid-template-columns: 1fr; }
                    .pie-panel { padding: 3rem; }
                }
                @media (max-width: 768px) {
                    .app-layout { flex-direction: column; }
                    .workspace { padding: 1.5rem; }
                    .cap-bar-container { display: none; }
                    .cap-user { width: 50%; }
                    .cap-stats { width: 50%; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/ledger')}

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1>⚖️ Contabilidad de Triple Entrada</h1>
                            <p>Slicing Pie dinámico. El registro inmutable del valor aportado por la Colla.</p>
                        </div>
                        <button class="btn-permaweb" title="Sella este Ledger en Blockchain">
                            <span style="font-size: 1.2rem;">🧊</span> Congelar en Permaweb (Beta)
                        </button>
                    </div>

                    <div class="equity-dashboard">
                        <div class="pie-panel">
                            <div class="pie-chart" id="pieChart"></div>
                            <div class="pie-center">
                                <div class="total-val" id="totalSlicesVal">0</div>
                                <div class="total-lbl">Total Slices</div>
                            </div>
                        </div>

                        <div class="cap-table-container">
                            <div class="panel-title">
                                Tabla de Capitalización (Cap Table)
                                <span style="font-size: 0.75rem; color: #666; font-weight: normal;">Distribución Dinámica</span>
                            </div>
                            <div id="capTableBody">
                                </div>
                        </div>
                    </div>

                    <div class="ledger-container">
                        <div class="panel-title" style="margin-bottom: 1.5rem;">
                            Registro Inmutable de la Red (Bloques)
                        </div>
                        <table class="ledger-table">
                            <thead>
                                <tr>
                                    <th>Tx Hash</th>
                                    <th>Fecha</th>
                                    <th>Nodo (Usuario)</th>
                                    <th>Silla / Rol</th>
                                    <th>Proof of Work (Entregable)</th>
                                    <th>Hrs</th>
                                    <th style="text-align: right;">Slices Generados</th>
                                </tr>
                            </thead>
                            <tbody id="ledgerBody"></tbody>
                        </table>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

        const state = store.getState();
        let project = state.projects[state.projects.length - 1];

        if (!project) return;
        this.activeProjectId = project.id;
        
        this.renderLedgerData(project, state.globalUsers);
    }

    renderLedgerData(project, globalUsers) {
        const harvest = store.calculateHarvest(this.activeProjectId) || [];
        const capTableBody = document.getElementById('capTableBody');
        const pieChart = document.getElementById('pieChart');
        const totalSlicesEl = document.getElementById('totalSlicesVal');
        const tbody = document.getElementById('ledgerBody');

        // Paleta de colores para usuarios
        const colors = ['#00b0ff', '#e040fb', '#00e676', '#ff9100', '#ff5252', '#ffd740'];
        
        let totalSlices = 0;
        harvest.forEach(h => totalSlices += h.slices);

        totalSlicesEl.innerText = Math.round(totalSlices).toLocaleString();

        if (totalSlices === 0 || !project.ledger || project.ledger.length === 0) {
            capTableBody.innerHTML = `<div style="padding: 2rem; text-align: center; color: #666;">El Bloque Génesis aún no contiene equidad. Completa tareas en el Kanban.</div>`;
            tbody.innerHTML = `<tr><td colspan="7" class="empty-ledger">El Ledger está vacío. No hay registros criptográficos aún.</td></tr>`;
            return;
        }

        // 1. GENERAR CAP TABLE (BARRAS) & PIE CHART GRADIENT
        let capHtml = '';
        let conicGradientParts = [];
        let currentDegree = 0;

        // Ordenar por Slices (Mayor a Menor)
        harvest.sort((a, b) => b.slices - a.slices).forEach((userHarvest, index) => {
            const user = globalUsers.find(u => u.id === userHarvest.userId) || { name: userHarvest.userId };
            const percentageRaw = (userHarvest.slices / totalSlices) * 100;
            const percentageStr = percentageRaw.toFixed(2);
            const color = colors[index % colors.length];

            // Construir parte del Pie Chart CSS
            const nextDegree = currentDegree + (percentageRaw * 3.6); // 360 grados / 100
            conicGradientParts.push(`${color} ${currentDegree}deg ${nextDegree}deg`);
            currentDegree = nextDegree;

            // Calcular FMV promedio heurístico
            const userTxs = (project.ledger || []).filter(tx => tx.userId === userHarvest.userId);
            const totalHours = userTxs.reduce((sum, tx) => sum + (tx.horas || 0), 0);
            const avgFmv = totalHours > 0 ? (userHarvest.slices / totalHours).toFixed(1) : 0;
            const initial = user.name.charAt(0).toUpperCase();

            capHtml += `
                <div class="cap-row">
                    <div class="cap-user">
                        <div class="avatar" style="border-color: ${color}; color: ${color};">${initial}</div>
                        ${user.name}
                    </div>
                    <div class="cap-bar-container">
                        <div class="cap-bar-fill" style="width: 0%; background: ${color};" data-target-width="${percentageStr}%"></div>
                    </div>
                    <div class="cap-stats">
                        <div class="cap-percent" style="color: ${color};">${percentageStr}%</div>
                        <div class="cap-slices">${Math.round(userHarvest.slices).toLocaleString()} Slices</div>
                        <div class="cap-fmv">Avg. Risk/FMV: ~€${avgFmv}/h</div>
                    </div>
                </div>
            `;
        });

        capTableBody.innerHTML = capHtml;
        
        // Animaciones diferidas para las barras y el pastel
        setTimeout(() => {
            pieChart.style.background = `conic-gradient(${conicGradientParts.join(', ')})`;
            document.querySelectorAll('.cap-bar-fill').forEach(bar => {
                bar.style.width = bar.getAttribute('data-target-width');
            });
        }, 100);

        // 2. GENERAR REGISTRO INMUTABLE (TABLA DE BLOQUES)
        tbody.innerHTML = '';
        const reversedLedger = [...project.ledger].reverse();

        reversedLedger.forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
            const user = globalUsers.find(u => u.id === entry.userId) || { name: entry.userId };
            
            const role = project.roles.find(r => r.id === entry.roleId);
            const roleName = role ? `<span style="color: var(--text-muted); font-size:0.8rem; font-family:var(--font-mono);">${role.levelId}</span> ${role.name}` : 'Nodo Base';
            
            // Link a prueba si existe
            const proofLink = entry.proofLink ? ` <a href="${entry.proofLink}" target="_blank" style="color:var(--accent-blue); font-size:0.8rem; text-decoration:none;">[Ver]</a>` : '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="hash-badge" title="${entry.hash}">${entry.hash.substring(0,8)}...</span></td>
                <td style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem;">${date}</td>
                <td style="font-weight: bold; color: white;">${user.name}</td>
                <td>${roleName}</td>
                <td>${entry.description}${proofLink}</td>
                <td style="font-family: var(--font-mono); color: #888;">${entry.horas}h</td>
                <td style="text-align: right;"><span class="slice-badge">+${Math.round(entry.valorCongelado).toLocaleString()}</span></td>
            `;
            tbody.appendChild(row);
        });

        // Fila del Bloque Génesis al final
        const genesisRow = document.createElement('tr');
        genesisRow.innerHTML = `
            <td><span class="hash-badge" style="border-color:#555; color:#888;">${(project.genesisHash || 'GENESIS').substring(0,8)}...</span></td>
            <td style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem;">--</td>
            <td style="color: #666; font-style: italic;">Sistema</td>
            <td style="color: #666;">Orquestador Kernel</td>
            <td style="color: #888;">Instanciación del Mapa VNA (Bloque Génesis)</td>
            <td style="font-family: var(--font-mono); color: #666;">0h</td>
            <td style="text-align: right;"><span class="slice-badge" style="color:#666;">+0</span></td>
        `;
        tbody.appendChild(genesisRow);
    }
}
