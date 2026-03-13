// v8/js/views/LedgerView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class LedgerView {
    constructor() {
        document.title = "Ledger Inmutable | TeamTowers V8";
        this.activeProjectId = null;
        this.currentTab = 'project'; // 'project' | 'global'
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        
        if (!project) {
            const userProjects = state.projects.filter(p => 
                state.session.role === 'ecosystem-owner' || 
                p.ownerId === activeUserId || 
                (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
            );
            project = userProjects.length > 0 ? userProjects[userProjects.length - 1] : null;
        }

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/ledger')}
                    <main class="workspace" style="justify-content:center; align-items:center;">
                        <div class="glass-panel" style="text-align:center; max-width: 500px; margin: 0 auto;">
                             <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1;">⚖️</div>
                             <h2 style="color:white; margin-top:0; font-weight:900; font-size:2rem;">Wallet Vacía</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2.5rem; font-size:1.1rem;">No tienes participación en ningún Ecosistema.</p>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/ledger')}
                </div>
            `;
        }

        const isPO = project && (project.ownerId === activeUserId || state.session.role === 'ecosystem-owner');

        // --- CONFIGURACIÓN HEADER V8 ---
        const headerConfig = {
            title: "Slicing Pie Wallet",
            subtitle: project.nombre,
            tagline: "Libro mayor inmutable. Tu trabajo y riesgo convertido en Equity.",
            tabs: [
                { id: 'project', label: 'Ecosistema Actual', active: this.currentTab === 'project' },
                { id: 'global', label: '🌐 Mi Portfolio Global', active: this.currentTab === 'global' }
            ],
            actionHtml: isPO ? `
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button id="btnOpenCapitalModal" style="background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 8px 16px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; cursor:pointer; transition: 0.3s; box-shadow: 0 0 15px rgba(0,230,118,0.1);">💶 Inyectar Capital</button>
                    <button id="btnOpenPermaweb" style="background: rgba(255, 171, 64, 0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 8px 16px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; cursor:pointer; transition: 0.3s; box-shadow: 0 0 15px rgba(255,171,64,0.1);">🧊 Congelar Blockchain</button>
                </div>
            ` : '',
            magicActions: [
                { id: 'audit_cap', label: 'Auditoría de Inversores', icon: '🤖', isAi: true, tokens: 200 }
            ]
        };

        return `
            <style>
                .equity-dashboard { display: grid; grid-template-columns: 350px minmax(0, 1fr); gap: 2.5rem; margin-bottom: 3rem; width: 100%; box-sizing: border-box;}
                
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

                /* BLOCKCHAIN LOG (FRAMELESS) */
                .ledger-container { background: transparent; border: none; padding: 0; margin-top: 1rem; overflow-x: auto; width: 100%;}
                .ledger-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;}
                .ledger-table th { padding: 1.2rem 1rem; background: rgba(0,0,0,0.4); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #333; font-weight: 900;}
                .ledger-table td { padding: 1.2rem 1rem; border-bottom: 1px dashed #222; color: #ddd; font-size: 0.95rem; vertical-align: middle; transition: background 0.2s;}
                .ledger-table tr:hover td { background: rgba(255,255,255,0.03); }
                
                .hash-badge { background: rgba(224, 64, 251, 0.1); color: var(--accent-purple); padding: 4px 8px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.75rem; border: 1px solid rgba(224, 64, 251, 0.3); font-weight: bold;}
                .slice-badge { color: var(--accent-green); font-weight: 900; font-family: var(--font-mono); font-size: 1.1rem; text-shadow: 0 0 10px rgba(0,230,118,0.3);}

                /* MOBILE LEDGER CARDS (ACCORDION) */
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
                .mlc-chevron { position: absolute; bottom: 12px; right: 15px; font-size: 0.8rem; color: #666; transition: 0.3s; }
                .mlc-card.expanded .mlc-chevron { transform: rotate(180deg); color: var(--accent-blue); }

                /* PORTFOLIO GLOBAL TAB */
                .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; width: 100%; box-sizing: border-box;}
                .portfolio-card { background: linear-gradient(145deg, rgba(30,30,35,0.6), rgba(15,15,20,0.8)); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 20px; transition: 0.3s; box-sizing: border-box;}
                .portfolio-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5);}

                /* MODALS */
                .overlay-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(15px); z-index: 5000; display: none; justify-content: center; align-items: center;}
                .card-modal { background: var(--bg-dark); border: 1px solid #444; border-radius: 24px; padding: 3rem; width: 100%; max-width: 500px; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8); animation: slideUp 0.4s; box-sizing: border-box; max-height: 90vh; overflow-y:auto; border-top: 4px solid currentColor;}
                .form-group { text-align: left; margin-bottom: 20px; }
                .form-group label { display: block; color: var(--text-muted); font-size: 0.8rem; margin-bottom: 8px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 14px 16px; border-radius: 12px; font-family: inherit; font-size: 1rem; outline: none; box-sizing: border-box; transition: 0.3s; }
                .form-control:focus { border-color: var(--accent-green); }

                @keyframes spinIn { from { transform: rotate(-90deg) scale(0.8); opacity: 0; } to { transform: rotate(0) scale(1); opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                /* RESPONSIVE MÓVIL */
                @media (max-width: 1024px) { .equity-dashboard { grid-template-columns: 1fr; } .pie-panel { padding: 3rem; } }
                @media (max-width: 768px) {
                    .cap-table-container { padding: 2rem 1.2rem; border-radius: 20px;}
                    .cap-row { min-width: 0; flex-wrap: nowrap; align-items: center; padding: 1rem 0; border-bottom: 1px dashed #333; gap: 10px;}
                    .cap-user { width: auto; flex: 1; font-size: 1rem; overflow: hidden;}
                    .desktop-only { display: none !important; }
                    .mobile-only { display: block; font-size: 0.75rem; color: #888; font-family: var(--font-mono); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;}
                    .cap-stats { width: auto; text-align: right; display: flex; flex-direction: column; align-items: flex-end;}
                    .ledger-table { display: none; }
                    .mobile-ledger-list { display: flex; }
                    .card-modal { padding: 2.5rem 1.5rem; width: 95%; margin: 0 auto;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/ledger')}

                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="tab-project" class="tab-content ${this.currentTab === 'project' ? 'active' : ''}">
                        
                        <div class="equity-dashboard">
                            <div class="pie-panel">
                                <div class="pie-chart" id="pieChart"></div>
                                <div class="pie-center">
                                    <div class="total-val" id="totalSlicesVal">0</div>
                                    <div class="total-lbl">Total Slices</div>
                                </div>
                            </div>

                            <div class="cap-table-container">
                                <div class="panel-title">Distribución de Equidad</div>
                                <div id="capTableBody"></div>
                            </div>
                        </div>

                        <div class="ledger-container">
                            <div class="panel-title" style="margin-bottom: 1.5rem; font-size:1.3rem; border-bottom: 1px solid #333; padding-bottom: 15px;">
                                Registro Inmutable (Bloques Minados)
                            </div>
                            
                            <table class="ledger-table">
                                <thead>
                                    <tr>
                                        <th>Tx Hash</th>
                                        <th>Fecha</th>
                                        <th>Nodo</th>
                                        <th>Silla / Rol</th>
                                        <th>Evidencia</th>
                                        <th>Hrs</th>
                                        <th style="text-align: right;">Slices</th>
                                    </tr>
                                </thead>
                                <tbody id="ledgerBody"></tbody>
                            </table>
                            
                            <div class="mobile-ledger-list" id="mobileLedgerList"></div>
                        </div>
                    </div>

                    <div id="tab-global" class="tab-content ${this.currentTab === 'global' ? 'active' : ''}">
                        <div style="display:flex; justify-content:flex-end; margin-bottom: 2rem;">
                            <button class="btn-primary" id="btnOpenExit" style="background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));">
                                💸 Simular Liquidación (Harvest)
                            </button>
                        </div>
                        <div class="portfolio-grid" id="portfolioGrid"></div>
                    </div>

                    <div id="capitalModal" class="overlay-modal">
                        <div class="card-modal" style="color: var(--accent-green);">
                            <h2 style="color: var(--accent-green); margin-top: 0; font-size: 1.8rem; font-weight:900; letter-spacing:-1px;">Inyección de Capital</h2>
                            <p style="color: #aaa; font-size: 0.95rem; margin-bottom: 2.5rem; line-height:1.5;">El motor aplicará el multiplicador matemático correspondiente.</p>
                            
                            <div class="form-group">
                                <label>Inversor (Nodo)</label>
                                <select id="inpCapUser" class="form-control" style="font-weight:bold; color:var(--accent-green);"></select>
                            </div>
                            
                            <div class="form-group">
                                <label>Tipo de Activo</label>
                                <select id="inpCapType" class="form-control">
                                    <option value="cash">💶 Efectivo / Fiat (Riesgo x4)</option>
                                    <option value="equipment">💻 Equipamiento Físico (Riesgo x2)</option>
                                    <option value="tools">🛠️ Licencias Software (Riesgo x2)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Valor Mercado Justo (€)</label>
                                <input type="number" id="inpCapAmount" class="form-control" placeholder="Ej: 1500" min="1" style="font-size:1.2rem; font-weight:bold;">
                            </div>

                            <div class="form-group">
                                <label>Concepto</label>
                                <input type="text" id="inpCapDesc" class="form-control" placeholder="Ej: Factura Servidor AWS 2026">
                            </div>

                            <div style="display:flex; gap:15px; margin-top: 2.5rem;">
                                <button class="btn-primary" style="flex: 1; background:transparent; border:1px solid #555; color:white;" id="btnCancelCap">Cancelar</button>
                                <button class="btn-primary" style="flex: 2; background: var(--accent-green); color: black;" id="btnConfirmCap">Sellar Bloque</button>
                            </div>
                        </div>
                    </div>

                </main>
                ${BottomNav.getHtml('/ledger')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        const state = store.getState();
        const activeUserId = state.session.activeUserId;

        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project) return;
        
        this.activeProjectId = project.id;

        // -- TABS LOGIC V8 GLOBAL EVENT --
        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.currentTab}`);
            if(target) target.classList.add('active');

            if(this.currentTab === 'global') this.renderGlobalPortfolio(state, activeUserId);
            else setTimeout(() => this.renderLedgerData(project, state.globalUsers), 50);
        });

        // -- MAGIC ACTION EVENT --
        window.addEventListener('ph-magic-action', (e) => {
            if(e.detail.actionId === 'audit_cap') {
                alert("🧠 IA Auditora: Analizando Cap Table. El balance PoW vs Capital es óptimo. (Integración profunda WIP Sprint 4)");
            }
        });

        // Render Inicial
        this.renderLedgerData(project, state.globalUsers);

        // Lógica Modal Capital
        const btnOpenCap = document.getElementById('btnOpenCapitalModal');
        const capModal = document.getElementById('capitalModal');
        if (btnOpenCap) {
            btnOpenCap.addEventListener('click', () => {
                const users = project.usuarios || [];
                document.getElementById('inpCapUser').innerHTML = users.map(u => {
                    const gUser = state.globalUsers.find(gu => gu.id === u.id);
                    return `<option value="${u.id}">${gUser ? gUser.name : u.id}</option>`;
                }).join('');
                capModal.style.display = 'flex';
            });
        }
        document.getElementById('btnCancelCap')?.addEventListener('click', () => capModal.style.display = 'none');
        document.getElementById('btnConfirmCap')?.addEventListener('click', async () => {
            const userId = document.getElementById('inpCapUser').value;
            const assetType = document.getElementById('inpCapType').value;
            const amount = parseFloat(document.getElementById('inpCapAmount').value);
            const desc = document.getElementById('inpCapDesc').value.trim();

            if (!amount || amount <= 0) return alert("Introduce un valor válido.");
            if (!desc) return alert("Describe el concepto.");

            await store.dispatch({
                type: 'ADD_CAPITAL_INJECTION',
                payload: { projectId: this.activeProjectId, userId: userId, assetType: assetType, amount: amount, description: desc }
            });

            capModal.style.display = 'none';
            this.renderLedgerData(store.getState().projects.find(p => p.id === this.activeProjectId), state.globalUsers);
        });

        // Simulación Harvesting Global
        document.getElementById('btnOpenExit')?.addEventListener('click', () => {
            alert("Esta función requiere conectar una Wallet Web3 (MetaMask/Phantom). Integración programada para el siguiente ciclo.");
        });
        
        // Simulación Permaweb
        document.getElementById('btnOpenPermaweb')?.addEventListener('click', () => {
            alert("Congelando Hash de la Cap Table en Arweave... [Modo Simulación V8]");
        });
    }

    renderGlobalPortfolio(state, userId) {
        const grid = document.getElementById('portfolioGrid');
        if(!grid) return;
        let html = '';
        let totalGlobalSlices = 0;

        state.projects.forEach(p => {
            const harvest = store.calculateHarvest(p.id) || [];
            const myHarvest = harvest.find(h => h.userId === userId);
            
            if (myHarvest && myHarvest.slices > 0) {
                totalGlobalSlices += myHarvest.slices;
                html += `
                    <div class="portfolio-card">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <strong style="color:white; font-size:1.2rem; font-weight:900;">${p.nombre}</strong>
                            <span style="font-size:0.75rem; color:var(--accent-purple); border:1px solid rgba(224,64,251,0.3); background:rgba(224,64,251,0.1); padding:4px 10px; border-radius:8px; font-weight:bold;">${p.archetype}</span>
                        </div>
                        <div style="font-size: 2.2rem; font-family: var(--font-mono); color: var(--accent-green); font-weight: 900; margin: 15px 0;">
                            ${Math.round(myHarvest.slices).toLocaleString()} <span style="font-size:0.9rem; color:#888; font-weight:normal;">Slices</span>
                        </div>
                        <div style="font-size:0.85rem; color:#ccc;">Participación (Equity): <strong style="color:white;">${myHarvest.percentage}%</strong></div>
                    </div>
                `;
            }
        });

        if (html === '') {
            grid.innerHTML = `<div style="grid-column: 1/-1; padding: 4rem; text-align:center; color:#666; border: 1px dashed var(--glass-border); border-radius:20px;">No tienes patrimonio en ningún ecosistema.</div>`;
        } else {
            const summaryHtml = `
                <div class="portfolio-card" style="background: linear-gradient(135deg, rgba(0, 176, 255, 0.1), rgba(224, 64, 251, 0.1)); border-color: var(--accent-blue);">
                    <div style="color:var(--accent-blue); font-size:0.85rem; text-transform:uppercase; font-weight:900; letter-spacing:1px; margin-bottom:10px;">Patrimonio Consolidado</div>
                    <div style="font-size: 2.8rem; font-family: var(--font-mono); color: white; font-weight: 900; margin: 15px 0; text-shadow: 0 5px 15px rgba(0,0,0,0.5);">
                        ${Math.round(totalGlobalSlices).toLocaleString()} <span style="font-size:1rem; color:#888; font-weight:normal;">Total Slices</span>
                    </div>
                </div>
            `;
            grid.innerHTML = summaryHtml + html;
        }
    }

    renderLedgerData(project, globalUsers) {
        const harvest = store.calculateHarvest(this.activeProjectId) || [];
        const capTableBody = document.getElementById('capTableBody');
        const pieChart = document.getElementById('pieChart');
        const totalSlicesEl = document.getElementById('totalSlicesVal');
        const tbody = document.getElementById('ledgerBody');
        const mobileList = document.getElementById('mobileLedgerList');

        if(!capTableBody || !tbody) return;

        const colors = ['#00b0ff', '#e040fb', '#00e676', '#ff9100', '#ff5252', '#ffd740'];
        
        let totalSlices = 0;
        harvest.forEach(h => totalSlices += h.slices);

        totalSlicesEl.innerText = Math.round(totalSlices).toLocaleString();

        if (totalSlices === 0 || !project.ledger || project.ledger.length === 0) {
            capTableBody.innerHTML = `<div style="padding: 3rem; text-align: center; color: #666; font-size:1.1rem;">El Bloque Génesis aún no contiene equidad.</div>`;
            tbody.innerHTML = `<tr><td colspan="7" style="padding: 4rem; text-align: center; color: #666; font-style: italic;">El Ledger está vacío. No hay registros criptográficos aún.</td></tr>`;
            mobileList.innerHTML = `<div style="padding: 2rem; text-align: center; color: #666; font-style: italic;">El Ledger está vacío.</div>`;
            return;
        }

        let capHtml = '';
        let conicGradientParts = [];
        let currentDegree = 0;

        harvest.sort((a, b) => b.slices - a.slices).forEach((userHarvest, index) => {
            const user = globalUsers.find(u => u.id === userHarvest.userId) || { name: userHarvest.userId };
            const percentageRaw = (userHarvest.slices / totalSlices) * 100;
            const percentageStr = percentageRaw.toFixed(2);
            const color = colors[index % colors.length];

            const nextDegree = currentDegree + (percentageRaw * 3.6);
            conicGradientParts.push(`${color} ${currentDegree}deg ${nextDegree}deg`);
            currentDegree = nextDegree;

            const userTxs = (project.ledger || []).filter(tx => tx.userId === userHarvest.userId);
            const capitalSlices = userTxs.filter(tx => tx.roleId === 'CAPITAL_ASSET').reduce((sum, tx) => sum + tx.valorCongelado, 0);
            const capitalHtml = capitalSlices > 0 ? ` | <span style="color:var(--accent-green);">Inversor</span>` : '';
            const initial = user.name.charAt(0).toUpperCase();

            capHtml += `
                <div class="cap-row">
                    <div class="cap-user">
                        <div class="avatar" style="border-color: ${color}; color: ${color};">${initial}</div>
                        <div class="user-info">
                            <div class="user-name">${user.name}</div>
                            <div class="user-sub mobile-only">Slices: ${Math.round(userHarvest.slices).toLocaleString()}${capitalHtml}</div>
                        </div>
                    </div>
                    <div class="cap-bar-container desktop-only">
                        <div class="cap-bar-fill" style="width: 0%; background: ${color};" data-target-width="${percentageStr}%"></div>
                    </div>
                    <div class="cap-stats">
                        <div class="cap-percent" style="color: ${color};">${percentageStr}%</div>
                        <div class="cap-slices desktop-only">${Math.round(userHarvest.slices).toLocaleString()} Slices</div>
                    </div>
                </div>
            `;
        });

        capTableBody.innerHTML = capHtml;
        
        setTimeout(() => {
            if(pieChart) pieChart.style.background = `conic-gradient(${conicGradientParts.join(', ')})`;
            document.querySelectorAll('.cap-bar-fill').forEach(bar => bar.style.width = bar.getAttribute('data-target-width'));
        }, 100);

        tbody.innerHTML = '';
        mobileList.innerHTML = '';
        
        const reversedLedger = [...project.ledger].reverse();

        reversedLedger.forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short' });
            const user = globalUsers.find(u => u.id === entry.userId) || { name: entry.userId };
            
            let roleName = entry.roleId === 'CAPITAL_ASSET' ? `<span style="color: var(--accent-green); font-weight:900;">💼 Capital</span>` : 'Nodo Base';
            if (entry.roleId !== 'CAPITAL_ASSET') {
                const role = project.roles.find(r => r.id === entry.roleId);
                if(role) roleName = `<span style="color:#aaa; font-size:0.8rem; font-family:var(--font-mono);">${role.levelId}</span>`;
            }
            
            const isCapital = entry.roleId === 'CAPITAL_ASSET';
            const horasStr = isCapital ? '--' : `${entry.horas}h`;
            const slicesFmt = `+${Math.round(entry.valorCongelado).toLocaleString()}`;
            const hashShort = entry.hash.substring(0,8);

            // DESKTOP ROW
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="hash-badge" title="${entry.hash}">${hashShort}...</span></td>
                <td style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem;">${date}</td>
                <td style="font-weight: 900; color: white;">${user.name}</td>
                <td>${roleName}</td>
                <td style="line-height:1.4;">${entry.description}</td>
                <td style="font-family: var(--font-mono); color: #aaa;">${horasStr}</td>
                <td style="text-align: right;"><span class="slice-badge">${slicesFmt}</span></td>
            `;
            tbody.appendChild(row);

            // MOBILE CARD
            const mobCard = document.createElement('div');
            mobCard.className = 'mlc-card';
            mobCard.innerHTML = `
                <div class="mlc-top">
                    <span class="mlc-hash">${hashShort}...</span>
                    <span class="mlc-date">${date}</span>
                </div>
                <div class="mlc-main">
                    <div>
                        <div class="mlc-user">${user.name}</div>
                        <div class="mlc-role">${roleName} ${isCapital ? '' : ` | ⏱ ${horasStr}`}</div>
                    </div>
                    <div class="mlc-slices">${slicesFmt}</div>
                </div>
                <div class="mlc-details">
                    <div class="mlc-desc">${entry.description}</div>
                </div>
                <div class="mlc-chevron">▼</div>
            `;
            mobCard.addEventListener('click', function() { this.classList.toggle('expanded'); });
            mobileList.appendChild(mobCard);
        });
    }
}
