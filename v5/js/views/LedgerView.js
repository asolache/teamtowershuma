// v5/js/views/LedgerView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class LedgerView {
    constructor() {
        document.title = "Ledger de Equity | TeamTowers";
        this.activeProjectId = null;
    }

    async getHtml() {
        return `
            <style>
                /* Estilos locales ultra-específicos del Ledger que no están en master.css */
                .cap-table-container { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 2rem; margin-bottom: 3rem; overflow-x: auto; }
                .cap-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; flex-wrap: wrap; gap: 10px;}
                .cap-header h2 { margin: 0; color: white; font-size: 1.4rem; }
                
                .total-pie { text-align: right; }
                .total-pie .label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
                .total-pie .value { font-size: 1.8rem; color: var(--accent-green); font-weight: 800; font-family: var(--font-mono); }

                .cap-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.02); min-width: 600px;}
                .cap-row:last-child { border-bottom: none; }
                .cap-user { display: flex; align-items: center; gap: 15px; width: 30%; }
                .avatar { width: 40px; height: 40px; background: #222; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 1.2rem; border: 2px solid #333; flex-shrink: 0;}
                
                .cap-bar-container { flex: 1; margin: 0 2rem; background: rgba(0,0,0,0.5); height: 12px; border-radius: 6px; overflow: hidden; position: relative; }
                .cap-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent-blue), var(--accent-green)); border-radius: 6px; transition: width 1s ease-out; width: 0%; }
                
                .cap-stats { text-align: right; width: 20%; font-family: var(--font-mono); }
                .cap-percent { font-size: 1.4rem; color: white; font-weight: bold; }
                .cap-slices { font-size: 0.85rem; color: var(--text-muted); }

                .ledger-container { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); overflow-x: auto; }
                .ledger-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;}
                .ledger-table th { padding: 1.2rem 1rem; background: rgba(0,0,0,0.5); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #222; }
                .ledger-table td { padding: 1rem; border-bottom: 1px solid #1a1a24; color: #ddd; font-size: 0.9rem; vertical-align: middle; }
                .ledger-table tr:hover td { background: rgba(255,255,255,0.02); }
                
                .hash-badge { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); padding: 4px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem; border: 1px solid rgba(0, 176, 255, 0.3); }
                .slice-badge { color: var(--accent-green); font-weight: bold; font-family: var(--font-mono); font-size: 1rem; }
                .empty-ledger { padding: 4rem; text-align: center; color: #666; }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/ledger')}

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1>⚖️ Slicing Pie & Contabilidad Triple Entrada</h1>
                            <p>Distribución de equidad dinámica basada en aportación de valor real (PoW).</p>
                        </div>
                    </div>

                    <div class="cap-table-container">
                        <div class="cap-header">
                            <h2>Distribución de la Red (Cap Table)</h2>
                            <div class="total-pie">
                                <div class="label">Slices Totales Emitidos</div>
                                <div class="value" id="totalSlicesVal">0.00</div>
                            </div>
                        </div>
                        <div id="capTableBody"></div>
                    </div>

                    <div class="ledger-container">
                        <table class="ledger-table">
                            <thead>
                                <tr>
                                    <th>Tx Hash</th>
                                    <th>Fecha</th>
                                    <th>Nodo (Usuario)</th>
                                    <th>Rol Desempeñado</th>
                                    <th>Entregable Consolidado</th>
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
        
        this.renderCapTable(project);
        this.renderLedger(project);
    }

    renderCapTable(project) {
        const container = document.getElementById('capTableBody');
        const totalElem = document.getElementById('totalSlicesVal');
        const harvestData = store.calculateHarvest(this.activeProjectId);
        
        if (!harvestData || harvestData.length === 0) {
            container.innerHTML = `<div style="padding: 2rem 0; text-align: center; color: var(--text-muted);">No hay Slices emitidos. Aprueba una tarea en el Kanban para iniciar el Ledger.</div>`;
            return;
        }

        container.innerHTML = '';
        let globalSlices = 0;

        harvestData.forEach((entry, index) => {
            globalSlices += entry.slices;
            const state = store.getState();
            const user = state.globalUsers.find(u => u.id === entry.userId);
            const userName = user ? user.name : (entry.userId || 'Usuario Anónimo');
            const initial = userName.charAt(0).toUpperCase();
            
            // Usamos colores de variables para los avatares
            const colors = ['var(--accent-red)', 'var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-orange)'];
            const avatarColor = colors[index % colors.length];

            const row = document.createElement('div');
            row.className = 'cap-row';
            row.innerHTML = `
                <div class="cap-user">
                    <div class="avatar" style="border-color: ${avatarColor}; color: ${avatarColor};">${initial}</div>
                    <div style="color: white; font-weight: 500;">${userName}</div>
                </div>
                <div class="cap-bar-container">
                    <div class="cap-bar-fill" style="width: 0%;" data-target-width="${entry.percentage}"></div>
                </div>
                <div class="cap-stats">
                    <div class="cap-percent">${entry.percentage}</div>
                    <div class="cap-slices">${Math.round(entry.slices).toLocaleString()} Slices</div>
                </div>
            `;
            container.appendChild(row);
        });

        totalElem.innerText = Math.round(globalSlices).toLocaleString();

        // Animación de la barra de progreso
        setTimeout(() => {
            document.querySelectorAll('.cap-bar-fill').forEach(bar => {
                bar.style.width = bar.getAttribute('data-target-width');
            });
        }, 100);
    }

    renderLedger(project) {
        const tbody = document.getElementById('ledgerBody');
        const ledger = project.ledger || [];

        if (ledger.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-ledger">El Ledger está vacío. No hay registros criptográficos aún.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        const reversedLedger = [...ledger].reverse();

        reversedLedger.forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
            const state = store.getState();
            const user = state.globalUsers.find(u => u.id === entry.userId);
            const userName = user ? user.name : (entry.userId || 'Anónimo');
            
            const role = project.roles.find(r => r.id === entry.roleId);
            const roleName = role ? `<span style="color: var(--text-muted); font-size:0.8rem;">${role.levelId}</span> ${role.name}` : 'Nodo Base';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="hash-badge">${entry.hash.substring(0,8)}...</span></td>
                <td style="color: var(--text-muted);">${date}</td>
                <td style="font-weight: bold; color: #ccc;">${userName}</td>
                <td>${roleName}</td>
                <td>${entry.description}</td>
                <td style="font-family: var(--font-mono);">${entry.horas}h</td>
                <td style="text-align: right;"><span class="slice-badge">+${Math.round(entry.valorCongelado).toLocaleString()}</span></td>
            `;
            tbody.appendChild(row);
        });
    }
}
