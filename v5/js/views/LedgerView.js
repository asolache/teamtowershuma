// v5/js/views/LedgerView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class LedgerView {
    constructor() {
        document.title = "Ledger de Equity | TeamTowers SOS";
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

        const isPO = project && (project.ownerId === activeUserId || state.session.role === 'ecosystem-owner');

        // Configuración del Header Universal
        let actionHtml = '';
        if (isPO) {
            actionHtml = `
                <div class="action-buttons">
                    <button class="btn-capital" id="btnOpenCapitalModal" title="Inyectar Dinero o Activos a la Red">
                        💶 Inyectar Capital
                    </button>
                    <button class="btn-permaweb" id="btnOpenPermaweb" title="Sella este Snapshot en Blockchain">
                        <span style="font-size: 1.2rem;" id="btnPermawebIcon">🧊</span> <span id="btnPermawebText">Congelar Snapshot</span>
                    </button>
                </div>
            `;
        }

        const headerConfig = {
            title: "The Ledger",
            subtitle: project ? project.nombre : '',
            tagline: "Libro mayor inmutable. Capital y Trabajo convertido en Slices.",
            actionHtml: actionHtml,
            tabs: [
                { id: 'project', label: 'Castell Actual', active: true },
                { id: 'global', label: '🌐 Mi Portfolio Global' }
            ]
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; height: 100%; box-sizing: border-box; scroll-behavior: smooth;}
                
                .tab-content { display: none; animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); padding-bottom: 2rem; }
                .tab-content.active { display: block; }

                /* =========================================================
                   BOTONES Y BADGES DELUXE
                   ========================================================= */
                .action-buttons { display: flex; gap: 15px; flex-wrap: wrap; }
                
                .btn-permaweb { background: linear-gradient(135deg, rgba(255, 171, 64, 0.05), rgba(255, 171, 64, 0.15)); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 12px 24px; border-radius: 12px; font-size: 0.95rem; font-weight: 900; cursor: pointer; transition: all 0.3s; font-family: var(--font-mono); display: flex; align-items: center; justify-content: center; gap: 10px; flex: 1; box-shadow: 0 4px 15px rgba(255, 171, 64, 0.1);}
                .btn-permaweb:hover { background: rgba(255, 171, 64, 0.2); box-shadow: 0 8px 25px rgba(255, 171, 64, 0.3); transform: translateY(-2px);}
                
                .btn-capital { background: linear-gradient(135deg, rgba(0, 230, 118, 0.1), rgba(0, 230, 118, 0.2)); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 12px 24px; border-radius: 12px; font-size: 0.95rem; font-weight: 900; cursor: pointer; transition: all 0.3s; font-family: var(--font-mono); display: flex; align-items: center; justify-content: center; gap: 10px; flex: 1; box-shadow: 0 4px 15px rgba(0, 230, 118, 0.15);}
                .btn-capital:hover { background: var(--accent-green); color: black; box-shadow: 0 8px 25px rgba(0, 230, 118, 0.4); transform: translateY(-2px);}

                .btn-exit { background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color: white; padding: 14px 30px; border-radius: 12px; font-size: 1.1rem; font-weight: 900; cursor: pointer; transition: all 0.3s; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 2rem; box-shadow: 0 5px 20px rgba(179, 136, 255, 0.3);}
                .btn-exit:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(179, 136, 255, 0.5); filter: brightness(1.1);}

                /* =========================================================
                   DASHBOARD (PIE CHART & CAP TABLE)
                   ========================================================= */
                .equity-dashboard { display: grid; grid-template-columns: 350px 1fr; gap: 2.5rem; margin-bottom: 3rem;}
                
                .pie-panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 3rem; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(15px);}
                .pie-chart { width: 220px; height: 220px; border-radius: 50%; background: conic-gradient(#333 0 100%); box-shadow: 0 0 0 10px rgba(255,255,255,0.02), inset 0 0 20px rgba(0,0,0,0.8); transition: background 1s ease-out; animation: spinIn 1s cubic-bezier(0.2, 0.8, 0.2, 1); }
                .pie-center { position: absolute; width: 140px; height: 140px; background: var(--bg-dark); border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 5px 15px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5); }
                .pie-center .total-val { font-size: 2rem; font-weight: 900; font-family: var(--font-mono); color: white;}
                .pie-center .total-lbl { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: bold;}

                .cap-table-container { background: rgba(255,255,255,0.015); border: 1px solid var(--glass-border); border-radius: 24px; padding: 2.5rem; display: flex; flex-direction: column; backdrop-filter: blur(10px);}
                .panel-title { color: white; font-size: 1.4rem; font-weight: 900; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; flex-wrap: wrap; gap: 10px;}
                
                .cap-row { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 0; border-bottom: 1px dashed rgba(255,255,255,0.05); min-width: 500px;}
                .cap-row:last-child { border-bottom: none; }
                .cap-user { display: flex; align-items: center; gap: 15px; width: 30%; color: white; font-weight: 900; font-size: 1.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .avatar { width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 900; color: white; font-size: 1.2rem; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0; background: rgba(0,0,0,0.5);}
                .user-info { display: flex; flex-direction: column; }
                
                .cap-bar-container { flex: 1; margin: 0 2rem; background: rgba(0,0,0,0.6); height: 12px; border-radius: 6px; overflow: hidden; position: relative; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);}
                .cap-bar-fill { height: 100%; border-radius: 6px; transition: width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1); width: 0%; box-shadow: 0 0 10px currentColor;}
                
                .cap-stats { text-align: right; width: 25%; font-family: var(--font-mono); }
                .cap-percent { font-size: 1.3rem; color: white; font-weight: 900; }
                .cap-slices { font-size: 0.9rem; color: var(--text-muted); }
                
                .desktop-only { display: block; }
                .mobile-only { display: none; }

                /* =========================================================
                   BLOCKCHAIN LOG (FRAMELESS)
                   ========================================================= */
                .ledger-container { background: transparent; border: none; padding: 0; margin-top: 1rem; overflow-x: auto;}
                
                .ledger-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;}
                .ledger-table th { padding: 1.2rem 1rem; background: rgba(0,0,0,0.4); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #333; font-weight: 900;}
                .ledger-table td { padding: 1.2rem 1rem; border-bottom: 1px dashed #222; color: #ddd; font-size: 0.95rem; vertical-align: middle; transition: background 0.2s;}
                .ledger-table tr:hover td { background: rgba(255,255,255,0.03); }
                
                .hash-badge { background: rgba(224, 64, 251, 0.1); color: var(--accent-purple); padding: 4px 8px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.75rem; border: 1px solid rgba(224, 64, 251, 0.3); font-weight: bold;}
                .slice-badge { color: var(--accent-green); font-weight: 900; font-family: var(--font-mono); font-size: 1.1rem; text-shadow: 0 0 10px rgba(0,230,118,0.3);}
                .empty-ledger { padding: 4rem; text-align: center; color: #666; font-style: italic; font-size: 1.1rem;}

                /* MOBILE LEDGER CARDS */
                .mobile-ledger-list { display: none; flex-direction: column; gap: 15px;}
                .mob-ledger-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(10px);}
                .mob-ledger-header { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.85rem;}

                /* =========================================================
                   PORTFOLIO GLOBAL TAB
                   ========================================================= */
                .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;}
                .portfolio-card { background: linear-gradient(145deg, rgba(30,30,35,0.6), rgba(15,15,20,0.8)); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 20px; transition: transform 0.3s, box-shadow 0.3s;}
                .portfolio-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5);}
                
                /* =========================================================
                   MODALS GLOBALES
                   ========================================================= */
                .overlay-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(15px); z-index: 5000; display: none; justify-content: center; align-items: center;}
                .card-modal { background: var(--bg-dark); border: 1px solid #444; border-radius: 24px; padding: 3rem; width: 100%; max-width: 500px; text-align: center; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8); animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); box-sizing: border-box; max-height: 90vh; overflow-y:auto; border-top: 4px solid currentColor;}
                
                .form-group { text-align: left; margin-bottom: 20px; }
                .form-group label { display: block; color: var(--text-muted); font-size: 0.8rem; margin-bottom: 8px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 14px 16px; border-radius: 12px; font-family: inherit; font-size: 1rem; outline: none; box-sizing: border-box; transition: all 0.3s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-green); box-shadow: 0 0 15px rgba(0,230,118,0.2);}

                @keyframes spinIn { from { transform: rotate(-90deg) scale(0.8); opacity: 0; } to { transform: rotate(0) scale(1); opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

                /* =========================================================
                   RESPONSIVE MOBILE (FIELD APP - BOTTOM SAFE)
                   ========================================================= */
                @media (max-width: 1024px) { 
                    .equity-dashboard { grid-template-columns: 1fr; } 
                    .pie-panel { padding: 3rem; } 
                }
                
                @media (max-width: 768px) {
                    .workspace { 
                        padding: 90px 1rem 120px 1rem; /* 120px bottom safe zone iOS Safari */
                    } 
                    
                    .action-buttons { flex-direction: column; width: 100%; margin-top: 15px; gap: 15px;}
                    .btn-permaweb, .btn-capital { width: 100%; padding: 15px; font-size: 1.05rem; }
                    
                    .cap-table-container { padding: 2rem 1.2rem; border-radius: 20px;}
                    .cap-row { min-width: 0; flex-wrap: nowrap; align-items: center; padding: 1rem 0; border-bottom: 1px dashed #333;}
                    .cap-user { width: auto; flex: 1; font-size: 1rem; overflow: visible;}
                    .desktop-only { display: none !important; }
                    .mobile-only { display: block; font-size: 0.75rem; color: #888; font-family: var(--font-mono); margin-top: 4px; font-weight: normal;}
                    
                    .cap-stats { width: auto; text-align: right; display: flex; flex-direction: column; align-items: flex-end;}
                    .cap-percent { font-size: 1.2rem; }
                    
                    .ledger-table { display: none; }
                    .mobile-ledger-list { display: flex; }
                    
                    .card-modal { padding: 2.5rem 1.5rem; width: 95%; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/ledger')}

                <main class="workspace">
                    
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-project" class="tab-content active">
                        <div id="snapMeta" style="font-size: 0.8rem; color: var(--accent-orange); font-family: var(--font-mono); margin-bottom: 20px; display:none; text-align: right; font-weight:bold;"></div>

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
                                    Distribución de la Red (Cap Table)
                                </div>
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
                                        <th>Nodo (Usuario)</th>
                                        <th>Silla / Rol</th>
                                        <th>Prueba de Valor</th>
                                        <th>Hrs</th>
                                        <th style="text-align: right;">Slices</th>
                                    </tr>
                                </thead>
                                <tbody id="ledgerBody"></tbody>
                            </table>
                            <div class="mobile-ledger-list" id="mobileLedgerList"></div>
                        </div>
                    </div>

                    <div id="view-global" class="tab-content">
                        <button class="btn-exit" id="btnOpenExit">💸 Simular Liquidación (Harvesting)</button>
                        <div class="portfolio-grid" id="portfolioGrid"></div>
                    </div>

                    <div id="capitalModal" class="overlay-modal">
                        <div class="card-modal" style="color: var(--accent-green);">
                            <h2 style="color: var(--accent-green); margin-top: 0; font-size: 1.8rem; font-weight:900; letter-spacing:-1px;">Inyección de Capital</h2>
                            <p style="color: #aaa; font-size: 0.95rem; margin-bottom: 2.5rem; line-height:1.5;">Inyecta dinero o activos a la red. El motor de equidad aplicará el multiplicador de riesgo matemático automáticamente.</p>
                            
                            <div class="form-group">
                                <label>Inversor (Miembro de la red)</label>
                                <select id="inpCapUser" class="form-control" style="font-weight:bold; color:var(--accent-green);"></select>
                            </div>
                            
                            <div class="form-group">
                                <label>Tipo de Activo</label>
                                <select id="inpCapType" class="form-control">
                                    <option value="cash">💶 Efectivo / Fiat (Riesgo x4)</option>
                                    <option value="equipment">💻 Equipamiento Físico (Riesgo x2)</option>
                                    <option value="tools">🛠️ Software / Suscripciones (Riesgo x2)</option>
                                    <option value="ip">💡 Propiedad Intelectual / IP (Riesgo x2)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Valor Mercado Justo (FMV en €)</label>
                                <input type="number" id="inpCapAmount" class="form-control" placeholder="Ej: 1500" min="1" style="font-size:1.2rem; font-weight:bold;">
                            </div>

                            <div class="form-group">
                                <label>Concepto / Evidencia</label>
                                <input type="text" id="inpCapDesc" class="form-control" placeholder="Ej: Factura Servidor AWS 2026">
                            </div>

                            <div style="display:flex; gap:15px; margin-top: 2.5rem;">
                                <button class="btn btn-outline" style="flex: 1; background:transparent; color:white; border:1px solid #555; border-radius:12px; padding:14px; cursor:pointer; font-weight:bold;" id="btnCancelCap">Cancelar</button>
                                <button class="btn btn-approve" style="flex: 2; background: var(--accent-green); color: black; border:none; border-radius:12px; font-weight:900; padding:14px; cursor:pointer; box-shadow:0 5px 15px rgba(0,230,118,0.3);" id="btnConfirmCap">Sellar en Ledger</button>
                            </div>
                        </div>
                    </div>

                    <div id="checkoutModal" class="overlay-modal">
                        <div class="card-modal" style="color: var(--accent-orange);">
                            <h2 style="color: var(--accent-orange); margin-top: 0; font-size: 2rem; font-weight:900; letter-spacing:-1px;">Sello Notarial Web3</h2>
                            <p style="color: #aaa; font-size: 0.95rem; line-height:1.5;">Acuña el Snapshot actual de tu Cap Table en la red descentralizada de Arweave. Garantía inmutable para inversores.</p>
                            
                            <div class="checkout-price" style="font-size: 4rem; font-weight: 900; color: white; margin: 1.5rem 0; font-family: var(--font-mono); text-shadow: 0 5px 20px rgba(0,0,0,0.5);">€4.99</div>
                            <p style="color: #666; font-size: 0.8rem; margin-top:-15px; text-transform:uppercase; font-weight:bold;">Pago único por sellado</p>

                            <ul style="text-align: left; margin: 2.5rem 0; padding-left: 20px; color: #ccc; line-height: 1.8; font-size:0.95rem;">
                                <li>✅ Hash SHA-256 consolidado en Blockchain.</li>
                                <li>✅ Prueba matemática inalterable de propiedad.</li>
                                <li>✅ Mantenimiento de Nodos TeamTowers.</li>
                            </ul>

                            <div id="paymentButtons">
                                <button class="pay-btn pay-gpay" style="background: white; color: #3c4043; width: 100%; padding: 16px; border-radius: 12px; font-size: 1.1rem; font-weight: 900; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 12px; transition: transform 0.2s;" id="btnGooglePay">
                                    Pagar con Google Pay
                                </button>
                                <button class="pay-btn pay-card" style="background: #635bff; color: white; width: 100%; padding: 16px; border-radius: 12px; font-size: 1.1rem; font-weight: 900; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px; transition: transform 0.2s;" id="btnStripePay">💳 Pagar con Tarjeta</button>
                                <button class="btn btn-outline" style="width: 100%; border: none; background:transparent; color:#888; cursor:pointer; font-weight:bold; padding:10px;" id="btnCloseModal">Cancelar</button>
                            </div>

                            <div id="mintingLoader" style="display: none; flex-direction: column; align-items: center; gap: 20px; margin-top: 2rem;">
                                <div style="width: 50px; height: 50px; border: 5px solid rgba(255, 171, 64, 0.2); border-top-color: var(--accent-orange); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                                <p style="color: var(--accent-orange); font-family: var(--font-mono); font-weight: bold; margin:0; font-size:1.1rem;">Transfiriendo a Permaweb...</p>
                                <p style="color: #666; font-size: 0.85rem;">Consensuando bloques criptográficos.</p>
                            </div>
                        </div>
                    </div>

                    <div id="exitModal" class="overlay-modal">
                        <div class="card-modal" style="color: var(--accent-purple);">
                            <h2 style="color: white; margin-top: 0; font-size: 1.8rem; font-weight:900; letter-spacing:-1px;">💸 Modelo de Liquidación</h2>
                            <p style="color: #aaa; font-size: 0.95rem; margin-bottom: 2rem; line-height:1.5;">Selecciona el Castell para activar el contrato inteligente de Harvesting / Exit según su arquetipo legal.</p>
                            
                            <div class="form-group">
                                <label>Seleccionar Proyecto</label>
                                <select id="selExitProject" class="form-control" style="font-weight:bold;"></select>
                            </div>

                            <div class="form-group" style="margin-top: 25px;">
                                <label style="color:var(--accent-purple);">Ruta de Salida Disponible (Legal Framework)</label>
                                <select id="selExitRoute" class="form-control" style="background: rgba(224, 64, 251, 0.05); border-color: var(--accent-purple); color:var(--accent-purple); font-weight:bold;">
                                    </select>
                            </div>

                            <div style="background: rgba(0,0,0,0.6); padding: 20px; border-radius: 12px; border: 1px dashed #444; margin-top: 25px; font-size: 0.85rem; color: #ccc; text-align: left; line-height:1.6;">
                                ℹ️ <b>Aviso Legal:</b> La ejecución de este contrato liquidará tus Slices matemáticos transformándolos en el activo seleccionado (Cash, Tokens o Equity formal).
                            </div>

                            <div style="display:flex; gap:15px; margin-top: 2.5rem;">
                                <button class="btn btn-outline" style="flex:1; background:transparent; color:#888; border:1px solid #555; border-radius:12px; padding:14px; cursor:pointer; font-weight:bold;" id="btnCancelExit">Cancelar</button>
                                <button class="btn btn-approve" style="flex:2; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color: white; border:none; border-radius:12px; font-weight:900; padding:14px; cursor:pointer; box-shadow:0 5px 15px rgba(179,136,255,0.3);" id="btnConfirmExit">Firmar Contrato</button>
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
        
        if (!project) {
            const userProjects = state.projects.filter(p => 
                state.session.role === 'ecosystem-owner' || 
                p.ownerId === activeUserId || 
                (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
            );
            project = userProjects.length > 0 ? userProjects[userProjects.length - 1] : null;
            if(project) localStorage.setItem('tt_active_project', project.id);
        }

        if (!project) return;
        this.activeProjectId = project.id;

        this.dom = {
            snapMeta: document.getElementById('snapMeta'),
            
            // Permaweb
            btnOpenPermaweb: document.getElementById('btnOpenPermaweb'),
            btnPermawebIcon: document.getElementById('btnPermawebIcon'),
            btnPermawebText: document.getElementById('btnPermawebText'),
            checkoutModal: document.getElementById('checkoutModal'),
            btnCloseModal: document.getElementById('btnCloseModal'),
            paymentButtons: document.getElementById('paymentButtons'),
            mintingLoader: document.getElementById('mintingLoader'),
            
            // Capital Elements
            btnOpenCapital: document.getElementById('btnOpenCapitalModal'),
            capitalModal: document.getElementById('capitalModal'),
            btnCancelCap: document.getElementById('btnCancelCap'),
            btnConfirmCap: document.getElementById('btnConfirmCap'),
            inpCapUser: document.getElementById('inpCapUser'),
            inpCapType: document.getElementById('inpCapType'),
            inpCapAmount: document.getElementById('inpCapAmount'),
            inpCapDesc: document.getElementById('inpCapDesc'),

            // Exit Elements
            btnOpenExit: document.getElementById('btnOpenExit'),
            exitModal: document.getElementById('exitModal'),
            btnCancelExit: document.getElementById('btnCancelExit'),
            btnConfirmExit: document.getElementById('btnConfirmExit'),
            selExitProject: document.getElementById('selExitProject'),
            selExitRoute: document.getElementById('selExitRoute')
        };

        // TABS LOGIC
        const tabBtns = document.querySelectorAll('.ph-tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                const targetId = `view-${btn.dataset.tab}`;
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                    if(btn.dataset.tab === 'global') {
                        this.renderGlobalPortfolio(state, activeUserId);
                    } else {
                        setTimeout(() => this.renderLedgerData(project, state.globalUsers), 50);
                    }
                }
            });
        });

        // Render inicial de datos Proyecto
        this.renderLedgerData(project, state.globalUsers);

        // LÓGICA MODAL APORTACIÓN DE CAPITAL
        if (this.dom.btnOpenCapital) {
            this.dom.btnOpenCapital.addEventListener('click', () => {
                const users = project.usuarios || [];
                this.dom.inpCapUser.innerHTML = users.map(u => {
                    const gUser = state.globalUsers.find(gu => gu.id === u.id);
                    return `<option value="${u.id}">${gUser ? gUser.name : u.id}</option>`;
                }).join('');
                
                this.dom.capitalModal.style.display = 'flex';
            });
        }

        if(this.dom.btnCancelCap) this.dom.btnCancelCap.addEventListener('click', () => this.dom.capitalModal.style.display = 'none');

        if(this.dom.btnConfirmCap) {
            this.dom.btnConfirmCap.addEventListener('click', async () => {
                const userId = this.dom.inpCapUser.value;
                const assetType = this.dom.inpCapType.value;
                const amount = parseFloat(this.dom.inpCapAmount.value);
                const desc = this.dom.inpCapDesc.value.trim();

                if (!amount || amount <= 0) return alert("Introduce un valor justo de mercado (FMV) mayor que 0.");
                if (!desc) return alert("Describe el concepto de la aportación.");

                this.dom.btnConfirmCap.disabled = true;
                this.dom.btnConfirmCap.innerText = "Sellando...";

                await store.dispatch({
                    type: 'ADD_CAPITAL_INJECTION',
                    payload: { projectId: this.activeProjectId, userId: userId, assetType: assetType, amount: amount, description: desc }
                });

                this.dom.capitalModal.style.display = 'none';
                window.location.reload(); 
            });
        }

        // LÓGICA MODAL WEB3 PERMAWEB
        if (this.dom.btnOpenPermaweb) {
            this.dom.btnOpenPermaweb.addEventListener('click', () => {
                const harvest = store.calculateHarvest(this.activeProjectId) || [];
                if(harvest.length === 0) return alert("⚠️ No puedes congelar un Ledger vacío.");
                this.dom.checkoutModal.style.display = 'flex';
            });
        }

        if(this.dom.btnCloseModal) this.dom.btnCloseModal.addEventListener('click', () => this.dom.checkoutModal.style.display = 'none');

        const simulatePayment = () => {
            this.dom.paymentButtons.style.display = 'none';
            this.dom.mintingLoader.style.display = 'flex';

            setTimeout(() => {
                const mockArweaveTx = 'ar://' + Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('');
                
                store.dispatch({
                    type: 'UPDATE_PROJECT_INFO',
                    payload: {
                        projectId: this.activeProjectId,
                        updates: { permawebSnapshot: { txId: mockArweaveTx, timestamp: Date.now() } }
                    }
                });

                this.dom.checkoutModal.style.display = 'none';
                this.dom.paymentButtons.style.display = 'block';
                this.dom.mintingLoader.style.display = 'none';
                
                alert(`✅ Snapshot Sellado Exitosamente.\n\nHash Público: ${mockArweaveTx}`);
                window.location.reload();
            }, 3000);
        };
        
        const btnGpay = document.getElementById('btnGooglePay');
        const btnStripe = document.getElementById('btnStripePay');
        if(btnGpay) btnGpay.addEventListener('click', simulatePayment);
        if(btnStripe) btnStripe.addEventListener('click', simulatePayment);

        // LÓGICA MODAL EXIT (TOKENOMICS)
        if (this.dom.btnOpenExit) {
            this.dom.btnOpenExit.addEventListener('click', () => {
                let opts = '';
                state.projects.forEach(p => {
                    const harvest = store.calculateHarvest(p.id) || [];
                    const userH = harvest.find(h => h.userId === activeUserId);
                    if (userH && userH.slices > 0) {
                        opts += `<option value="${p.id}" data-arch="${p.archetype}">${p.nombre} (${Math.round(userH.slices)} Slices)</option>`;
                    }
                });

                if(!opts) return alert("Aún no tienes patrimonio (Slices) en ninguna red para liquidar.");
                
                this.dom.selExitProject.innerHTML = opts;
                this.updateExitRoutes(); 
                
                this.dom.exitModal.style.display = 'flex';
            });
        }

        if(this.dom.selExitProject) this.dom.selExitProject.addEventListener('change', () => this.updateExitRoutes());
        if(this.dom.btnCancelExit) this.dom.btnCancelExit.addEventListener('click', () => this.dom.exitModal.style.display = 'none');
        if(this.dom.btnConfirmExit) {
            this.dom.btnConfirmExit.addEventListener('click', () => {
                alert("⚙️ Función en Desarrollo. Próximamente se integrará con contratos inteligentes reales para ejecutar la liquidación según el marco legal del arquetipo.");
                this.dom.exitModal.style.display = 'none';
            });
        }
    }

    updateExitRoutes() {
        const selectedOpt = this.dom.selExitProject.options[this.dom.selExitProject.selectedIndex];
        if(!selectedOpt) return;
        const arch = selectedOpt.getAttribute('data-arch') || 'startup';
        let html = '';

        if (arch === 'startup') {
            html = `
                <option value="vesting">📈 Conversión a Equity Formal (Vesting Agreement)</option>
                <option value="secondary">🤝 Venta Secundaria a Inversores (Market OTC)</option>
            `;
        } else if (arch === 'corp' || arch === 'corporate') {
            html = `
                <option value="bonus">💶 Liquidación Directa (Cash Bonus / Bounties)</option>
                <option value="royalties">🔁 Contrato de Royalties (Beneficios sobre Producto)</option>
            `;
        } else if (arch === 'dao') {
            html = `
                <option value="gov">🏛️ Reclamo de Tokens de Gobernanza (ERC-20)</option>
                <option value="lp">💱 Liquidación contra Pool (Canje por Stablecoins)</option>
            `;
        }

        this.dom.selExitRoute.innerHTML = html;
    }

    renderGlobalPortfolio(state, userId) {
        const grid = document.getElementById('portfolioGrid');
        let html = '';
        let totalGlobalSlices = 0;

        state.projects.forEach(p => {
            const harvest = store.calculateHarvest(p.id) || [];
            const myHarvest = harvest.find(h => h.userId === userId);
            
            if (myHarvest && myHarvest.slices > 0) {
                totalGlobalSlices += myHarvest.slices;
                const typeIcon = p.archetype === 'dao' ? '🤖 DAO' : (p.archetype === 'corp' ? '🏢 Empresa' : '🚀 Startup');

                html += `
                    <div class="portfolio-card">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <strong style="color:white; font-size:1.2rem; font-weight:900;">${p.nombre}</strong>
                            <span style="font-size:0.75rem; color:var(--accent-purple); border:1px solid rgba(224,64,251,0.3); background:rgba(224,64,251,0.1); padding:4px 10px; border-radius:8px; font-weight:bold;">${typeIcon}</span>
                        </div>
                        <div style="font-size: 2.2rem; font-family: var(--font-mono); color: var(--accent-green); font-weight: 900; margin: 15px 0;">
                            ${Math.round(myHarvest.slices).toLocaleString()} <span style="font-size:0.9rem; color:#888; font-weight:normal;">Slices</span>
                        </div>
                        <div style="font-size:0.85rem; color:#ccc;">Participación (Equity): <strong style="color:white;">${myHarvest.percentage}</strong></div>
                    </div>
                `;
            }
        });

        if (html === '') {
            grid.innerHTML = `<div style="grid-column: 1/-1; padding: 4rem; text-align:center; color:#666; border: 1px dashed #333; border-radius:20px; font-size:1.1rem;">No tienes participación patrimonial en ningún ecosistema actualmente. Ejecuta tareas para acumular Slices.</div>`;
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

        const colors = ['#00b0ff', '#e040fb', '#00e676', '#ff9100', '#ff5252', '#ffd740'];
        
        let totalSlices = 0;
        harvest.forEach(h => totalSlices += h.slices);

        totalSlicesEl.innerText = Math.round(totalSlices).toLocaleString();

        if (totalSlices === 0 || !project.ledger || project.ledger.length === 0) {
            capTableBody.innerHTML = `<div style="padding: 3rem; text-align: center; color: #666; font-size:1.1rem;">El Bloque Génesis aún no contiene equidad. Completa tareas o inyecta capital.</div>`;
            tbody.innerHTML = `<tr><td colspan="7" class="empty-ledger">El Ledger está vacío. No hay registros criptográficos aún.</td></tr>`;
            mobileList.innerHTML = `<div class="empty-ledger">El Ledger está vacío.</div>`;
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
            const totalHours = userTxs.reduce((sum, tx) => sum + (tx.horas || 0), 0);
            
            const capitalSlices = userTxs.filter(tx => tx.roleId === 'CAPITAL_ASSET').reduce((sum, tx) => sum + tx.valorCongelado, 0);
            const capitalHtml = capitalSlices > 0 ? ` | <span style="color:var(--accent-green);">Aportó Capital</span>` : '';

            const avgFmv = totalHours > 0 ? ((userHarvest.slices - capitalSlices) / totalHours).toFixed(1) : 0;
            const initial = user.name.charAt(0).toUpperCase();

            capHtml += `
                <div class="cap-row">
                    <div class="cap-user">
                        <div class="avatar" style="border-color: ${color}; color: ${color};">${initial}</div>
                        <div class="user-info">
                            <div class="user-name">${user.name}</div>
                            <div class="user-sub mobile-only">Risk/FMV: ~€${avgFmv}/h ${capitalHtml}</div>
                        </div>
                    </div>
                    <div class="cap-bar-container desktop-only">
                        <div class="cap-bar-fill" style="width: 0%; background: ${color};" data-target-width="${percentageStr}%"></div>
                    </div>
                    <div class="cap-stats">
                        <div class="cap-percent" style="color: ${color};">${percentageStr}%</div>
                        <div class="cap-slices">${Math.round(userHarvest.slices).toLocaleString()} Slices</div>
                        <div class="cap-fmv desktop-only">Avg. Risk/FMV: ~€${avgFmv}/h${capitalHtml}</div>
                    </div>
                </div>
            `;
        });

        capTableBody.innerHTML = capHtml;
        
        setTimeout(() => {
            if(pieChart) pieChart.style.background = `conic-gradient(${conicGradientParts.join(', ')})`;
            document.querySelectorAll('.cap-bar-fill').forEach(bar => {
                bar.style.width = bar.getAttribute('data-target-width');
            });
        }, 100);

        tbody.innerHTML = '';
        mobileList.innerHTML = '';
        
        const reversedLedger = [...project.ledger].reverse();

        reversedLedger.forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
            const user = globalUsers.find(u => u.id === entry.userId) || { name: entry.userId };
            
            let roleName = "";
            let horasStr = "";
            let isCapital = entry.roleId === 'CAPITAL_ASSET';
            
            if (isCapital) {
                roleName = `<span style="color: var(--accent-green); font-weight:900;">💼 Capital Asset</span>`;
                horasStr = `<span style="color:#666;">--</span>`; 
            } else {
                const role = project.roles.find(r => r.id === entry.roleId);
                roleName = role ? `<span style="color: var(--text-muted); font-size:0.75rem; font-family:var(--font-mono); font-weight:bold;">${role.levelId}</span> <span style="font-weight:bold; color:#ccc;">${role.name}</span>` : 'Nodo Base';
                horasStr = `<strong>${entry.horas}h</strong>`;
            }
            
            const proofLink = entry.proofLink ? ` <br><a href="${entry.proofLink}" target="_blank" style="color:var(--accent-blue); font-size:0.8rem; text-decoration:none; font-weight:bold; margin-top:5px; display:inline-block;">🔗 Ver Evidence</a>` : '';
            const slicesFmt = `+${Math.round(entry.valorCongelado).toLocaleString()}`;
            const hashShort = entry.hash.substring(0,8);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="hash-badge" title="${entry.hash}">${hashShort}...</span></td>
                <td style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem;">${date}</td>
                <td style="font-weight: 900; color: white;">${user.name}</td>
                <td>${roleName}</td>
                <td style="line-height:1.4;">${entry.description}${proofLink}</td>
                <td style="font-family: var(--font-mono); color: #aaa;">${horasStr}</td>
                <td style="text-align: right;"><span class="slice-badge">${slicesFmt}</span></td>
            `;
            tbody.appendChild(row);

            const mobCard = document.createElement('div');
            mobCard.className = 'mob-ledger-card';
            mobCard.innerHTML = `
                <div class="mob-ledger-header">
                    <span class="hash-badge" title="${entry.hash}">${hashShort}...</span>
                    <span style="color: var(--text-muted); font-family: var(--font-mono);">${date}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <strong style="color:white; font-size:1.15rem; font-weight:900;">${user.name}</strong>
                    <span class="slice-badge" style="font-size:1.3rem;">${slicesFmt}</span>
                </div>
                <div style="font-size:0.9rem; color:#ccc; margin-bottom:8px;">${roleName}</div>
                <div style="font-size:0.85rem; color:#aaa; background:rgba(0,0,0,0.5); padding:12px; border-radius:8px; line-height:1.5;">
                    ${entry.description} ${isCapital ? '' : `<span style="color:white; font-weight:bold; font-family:var(--font-mono); float:right;">⏱ ${horasStr}</span>`} ${proofLink}
                </div>
            `;
            mobileList.appendChild(mobCard);
        });

        const genesisHash = (project.genesisHash || 'GENESIS').substring(0,8);
        
        const genesisRow = document.createElement('tr');
        genesisRow.innerHTML = `
            <td><span class="hash-badge" style="border-color:#555; color:#888; background:transparent;">${genesisHash}...</span></td>
            <td style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem;">--</td>
            <td style="color: #666; font-style: italic; font-weight:bold;">Sistema Core</td>
            <td style="color: #666;">Orquestador</td>
            <td style="color: #888;">Instanciación del Castell (Bloque Génesis)</td>
            <td style="font-family: var(--font-mono); color: #666;">0h</td>
            <td style="text-align: right;"><span class="slice-badge" style="color:#666; text-shadow:none;">+0</span></td>
        `;
        tbody.appendChild(genesisRow);

        const mobGen = document.createElement('div');
        mobGen.className = 'mob-ledger-card';
        mobGen.style.borderColor = '#333';
        mobGen.style.background = 'transparent';
        mobGen.innerHTML = `
            <div class="mob-ledger-header">
                <span class="hash-badge" style="border-color:#555; color:#888; background:transparent;">${genesisHash}...</span>
                <span style="color: #666; font-family: var(--font-mono);">--</span>
            </div>
            <div style="color:#888; font-size:0.9rem; font-style:italic; font-weight:bold;">Bloque Génesis (Instanciación de Red)</div>
        `;
        mobileList.appendChild(mobGen);
    }
}
