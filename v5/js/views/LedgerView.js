// v5/js/views/LedgerView.js
import { store } from '../core/store.js';

export default class LedgerView {
    constructor() {
        document.title = "Ledger de Equity | TeamTowers";
        this.activeProjectId = null;
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', sans-serif; }
                
                /* Sidebar Local (Consistente con Kanban) */
                .sidebar {
                    width: 260px; background: rgba(15, 15, 20, 0.95); border-right: 1px solid rgba(255,255,255,0.05);
                    padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 10px; z-index: 10;
                }
                .project-context-header { 
                    padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1.5rem; 
                }
                .project-context-header h3 { font-size: 1rem; margin: 0 0 5px 0; color: white; }
                .project-context-header p { font-size: 0.7rem; color: #00b0ff; text-transform: uppercase; font-weight: bold; margin: 0;}
                
                .side-link {
                    padding: 0.8rem 1rem; border-radius: 8px; cursor: pointer; color: #888; text-decoration: none;
                    font-size: 0.85rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s;
                }
                .side-link:hover { background: rgba(255,255,255,0.05); color: white; }
                .side-link.active { background: rgba(0, 230, 118, 0.1); color: #00e676; font-weight: bold; border-left: 3px solid #00e676; }

                /* Workspace Central */
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; }
                .view-header { margin-bottom: 2rem; }
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; display: flex; align-items: center; gap: 10px;}
                .view-header p { color: #888; font-size: 0.95rem; margin-top: 5px; }

                /* CAP TABLE SECTION */
                .cap-table-container {
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px; padding: 2rem; margin-bottom: 3rem;
                }
                .cap-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem;}
                .cap-header h2 { margin: 0; color: white; font-size: 1.4rem; }
                .total-pie { text-align: right; }
                .total-pie .label { font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 1px; }
                .total-pie .value { font-size: 1.8rem; color: #00e676; font-weight: 800; font-family: monospace; }

                .cap-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid rgba(255,255,255,0.02); }
                .cap-row:last-child { border-bottom: none; }
                .cap-user { display: flex; align-items: center; gap: 15px; width: 30%; }
                .avatar { width: 40px; height: 40px; background: #222; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 1.2rem; border: 2px solid #333;}
                
                .cap-bar-container { flex: 1; margin: 0 2rem; background: rgba(0,0,0,0.5); height: 12px; border-radius: 6px; overflow: hidden; position: relative; }
                .cap-bar-fill { height: 100%; background: linear-gradient(90deg, #00b0ff, #00e676); border-radius: 6px; transition: width 1s ease-out; width: 0%; }
                
                .cap-stats { text-align: right; width: 20%; font-family: monospace; }
                .cap-percent { font-size: 1.4rem; color: white; font-weight: bold; }
                .cap-slices { font-size: 0.85rem; color: #888; }

                /* LEDGER SECTION */
                .ledger-container {
                    background: #0f0f14; border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px; overflow: hidden;
                }
                .ledger-table { width: 100%; border-collapse: collapse; text-align: left; }
                .ledger-table th { padding: 1.2rem 1rem; background: rgba(0,0,0,0.5); color: #888; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #222; }
                .ledger-table td { padding: 1rem; border-bottom: 1px solid #1a1a24; color: #ddd; font-size: 0.9rem; vertical-align: middle; }
                .ledger-table tr:hover td { background: rgba(255,255,255,0.02); }
                
                .hash-badge { background: rgba(0, 176, 255, 0.1); color: #00b0ff; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 0.75rem; border: 1px solid rgba(0, 176, 255, 0.3); }
                .slice-badge { color: #00e676; font-weight: bold; font-family: monospace; font-size: 1rem; }

                .empty-ledger { padding: 4rem; text-align: center; color: #666; }
            </style>

            <div class="app-layout">
                <aside class="sidebar">
                    <div style="font-weight: bold; font-family: monospace; color: white; margin-bottom: 2rem; font-size: 1.2rem;">
                        🗼 TeamTowers
                    </div>

                    <div class="project-context-header">
                        <h3 id="projNameSide">Cargando...</h3>
                        <p id="projArchSide">--</p>
                    </div>
                    
                    <a href="/v5/project" class="side-link" data-link>📋 Kanban (Tracción)</a>
                    <a href="/v5/map" class="side-link" data-link>🌐 Mapa VNA (Diseño)</a>
                    <a href="/v5/ledger" class="side-link active" data-link>⚖️ Ledger (Equity)</a>
                    <a href="/v5/tests" class="side-link" data-link style="margin-top: auto;">🛠 Diagnóstico Kernel</a>
                    <a href="/v5/team" class="side-link" data-link>👥 Tripulación & DAO</a>
                </aside>

                <main class="workspace">
                    <div class="view-header">
                        <h1>⚖️ Slicing Pie & Contabilidad Triple Entrada</h1>
                        <p>Distribución de equidad dinámica basada en aportación de valor real (PoW).</p>
                    </div>

                    <div class="cap-table-container">
                        <div class="cap-header">
                            <h2>Distribución de la Red (Cap Table)</h2>
                            <div class="total-pie">
                                <div class="label">Slices Totales Emitidos</div>
                                <div class="value" id="totalSlicesVal">0.00</div>
                            </div>
                        </div>
                        <div id="capTableBody">
                            <div style="color: #666; font-size: 0.85rem;">Esperando aportaciones consolidadas...</div>
                        </div>
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
                            <tbody id="ledgerBody">
                                </tbody>
                        </table>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        let project = state.projects[state.projects.length - 1];

        if (!project) return; // Fallback handled by other views usually
        this.activeProjectId = project.id;
        
        // Actualizar Sidebar
        document.getElementById('projNameSide').innerText = project.nombre;
        document.getElementById('projArchSide').innerText = `MODO: ${project.archetype.toUpperCase()}`;

        this.renderCapTable(project);
        this.renderLedger(project);
    }

    renderCapTable(project) {
        const container = document.getElementById('capTableBody');
        const totalElem = document.getElementById('totalSlicesVal');
        
        // Usamos el calculador oficial del Kernel
        const harvestData = store.calculateHarvest(this.activeProjectId);
        
        if (!harvestData || harvestData.length === 0) {
            container.innerHTML = `<div style="padding: 2rem 0; text-align: center; color: #555;">No hay Slices emitidos. Aprueba una tarea en el Kanban para iniciar el Ledger.</div>`;
            return;
        }

        container.innerHTML = '';
        let globalSlices = 0;

        harvestData.forEach(entry => {
            globalSlices += entry.slices;
            
            // Resolviendo el nombre del usuario (Si no está en globalUsers, mostramos el ID)
            const state = store.getState();
            const user = state.globalUsers.find(u => u.id === entry.userId);
            const userName = user ? user.name : (entry.userId || 'Usuario Anónimo');
            const initial = userName.charAt(0).toUpperCase();

            // Color del avatar dinámico
            const colors = ['#ff5252', '#00b0ff', '#e040fb', '#ff9100'];
            const avatarColor = colors[userName.length % colors.length];

            const row = document.createElement('div');
            row.className = 'cap-row';
            row.innerHTML = `
                <div class="cap-user">
                    <div class="avatar" style="border-color: ${avatarColor}; color: ${avatarColor};">${initial}</div>
                    <div style="color: white; font-weight: 500;">${userName}</div>
                </div>
                <div class="cap-bar-container">
                    <div class="cap-bar-fill" style="width: ${entry.percentage};"></div>
                </div>
                <div class="cap-stats">
                    <div class="cap-percent">${entry.percentage}</div>
                    <div class="cap-slices">${Math.round(entry.slices).toLocaleString()} Slices</div>
                </div>
            `;
            container.appendChild(row);
        });

        totalElem.innerText = Math.round(globalSlices).toLocaleString();
    }

    renderLedger(project) {
        const tbody = document.getElementById('ledgerBody');
        const ledger = project.ledger || [];

        if (ledger.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="empty-ledger">El Ledger está vacío. No hay registros criptográficos aún.</td></tr>`;
            return;
        }

        tbody.innerHTML = '';
        
        // Invertimos el array para ver el más reciente arriba
        const reversedLedger = [...ledger].reverse();

        reversedLedger.forEach(entry => {
            // Helpers para formatear datos
            const date = new Date(entry.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
            
            const state = store.getState();
            const user = state.globalUsers.find(u => u.id === entry.userId);
            const userName = user ? user.name : (entry.userId || 'Anónimo');

            const role = project.roles.find(r => r.id === entry.roleId);
            const roleName = role ? `<span style="color: #888; font-size:0.8rem;">${role.levelId}</span> ${role.name}` : 'Nodo Base';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="hash-badge">${entry.hash.substring(0,8)}...</span></td>
                <td style="color: #888;">${date}</td>
                <td style="font-weight: bold; color: #ccc;">${userName}</td>
                <td>${roleName}</td>
                <td>${entry.description}</td>
                <td style="font-family: monospace;">${entry.horas}h</td>
                <td style="text-align: right;"><span class="slice-badge">+${Math.round(entry.valorCongelado).toLocaleString()}</span></td>
            `;
            tbody.appendChild(row);
        });
    }
}
