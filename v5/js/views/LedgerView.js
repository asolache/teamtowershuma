// v5/js/views/LedgerView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js'; // INYECCIÓN V8.0

export default class LedgerView {
    constructor() {
        document.title = "Ledger de Equity | TeamTowers SOS";
        this.activeProjectId = null;
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; position: relative; scroll-behavior: smooth;}
                
                /* =========================================================
                   MOBILE TOP BAR (DRY V8.0)
                   ========================================================= */
                .mobile-top-bar {
                    display: none; justify-content: space-between; align-items: center; padding: 15px 20px;
                    background: rgba(10, 10, 14, 0.95); border-bottom: 1px solid rgba(255,255,255,0.05);
                    backdrop-filter: blur(10px); position: sticky; top: 0; z-index: 1000;
                    margin: -2rem -3rem 1.5rem -3rem; 
                }
                .mob-brand { display: flex; align-items: center; gap: 10px; color: white; text-decoration: none; font-weight: bold; font-size: 1.2rem;}
                .mob-project-select { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: var(--accent-blue); padding: 5px 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.8rem; outline: none; max-width: 150px; }
                .mob-user { display: flex; align-items: center; justify-content: center; width: 35px; height: 35px; background: var(--accent-purple); color: white; border-radius: 50%; font-weight: bold; text-decoration: none; font-size: 0.9rem; }

                /* =========================================================
                   HEADER
                   ========================================================= */
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; display: flex; align-items: center; gap: 15px; flex-wrap: wrap;}
                .view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

                .permaweb-badge { background: rgba(255, 171, 64, 0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-family: var(--font-mono); text-transform: uppercase; font-weight: bold; letter-spacing: 1px; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 0 15px rgba(255, 171, 64, 0.2);}

                .action-buttons { display: flex; gap: 10px; flex-wrap: wrap;}
                .btn-permaweb { background: transparent; border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 10px 20px; border-radius: 8px; font-size: 0.9rem; font-weight: bold; cursor: pointer; transition: all 0.2s; font-family: var(--font-mono); display: flex; align-items: center; justify-content: center; gap: 8px; flex: 1;}
                .btn-permaweb:hover { background: rgba(255, 171, 64, 0.1); box-shadow: 0 0 20px rgba(255, 171, 64, 0.3); transform: translateY(-2px);}
                
                .btn-capital { background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 10px 20px; border-radius: 8px; font-size: 0.9rem; font-weight: bold; cursor: pointer; transition: all 0.2s; font-family: var(--font-mono); display: flex; align-items: center; justify-content: center; gap: 8px; flex: 1;}
                .btn-capital:hover { background: var(--accent-green); color: black; box-shadow: 0 0 20px rgba(0, 230, 118, 0.3); transform: translateY(-2px);}

                /* PANEL SUPERIOR: EL PASTEL (PIE) Y LA CAP TABLE */
                .equity-dashboard { display: grid; grid-template-columns: 300px 1fr; gap: 2rem; margin-bottom: 3rem;}
                
                .pie-panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;}
                
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
                .panel-title { color: white; font-size: 1.2rem; font-weight: bold; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; flex-wrap: wrap; gap: 10px;}
                
                .cap-row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px dashed rgba(255,255,255,0.05); min-width: 500px;}
                .cap-row:last-child { border-bottom: none; }
                .cap-user { display: flex; align-items: center; gap: 15px; width: 30%; color: white; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .avatar { width: 35px; height: 35px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 1rem; border: 2px solid #333; flex-shrink: 0;}
                
                .cap-bar-container { flex: 1; margin: 0 2rem; background: rgba(0,0,0,0.5); height: 10px; border-radius: 6px; overflow: hidden; position: relative; }
                .cap-bar-fill { height: 100%; border-radius: 6px; transition: width 1.5s cubic-bezier(0.2, 0.8, 0.2, 1); width: 0%; }
                
                .cap-stats { text-align: right; width: 25%; font-family: var(--font-mono); }
                .cap-percent { font-size: 1.2rem; color: white; font-weight: bold; }
                .cap-slices { font-size: 0.85rem; color: var(--text-muted); }
                .cap-fmv { font-size: 0.7rem; color: #666; margin-top: 4px; }

                /* BLOCKCHAIN LOG */
                .ledger-container { background: #08080a; border: 1px solid #1a1a24; border-radius: var(--border-radius-lg); padding: 2rem; position: relative; overflow-x: auto;}
                
                .ledger-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;}
                .ledger-table th { padding: 1.2rem 1rem; background: rgba(0,0,0,0.5); color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #222; }
                .ledger-table td { padding: 1rem; border-bottom: 1px dashed #1a1a24; color: #ddd; font-size: 0.9rem; vertical-align: middle; transition: background 0.2s;}
                .ledger-table tr:hover td { background: rgba(255,255,255,0.02); }
                
                .hash-badge { background: rgba(224, 64, 251, 0.1); color: var(--accent-purple); padding: 4px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.75rem; border: 1px solid rgba(224, 64, 251, 0.3); }
                .slice-badge { color: var(--accent-green); font-weight: bold; font-family: var(--font-mono); font-size: 1rem; }
                .empty-ledger { padding: 4rem; text-align: center; color: #666; font-style: italic;}

                /* MOBILE LEDGER CARDS (Oculto en PC, Visible en Móvil) */
                .mobile-ledger-list { display: none; flex-direction: column; gap: 15px;}
                .mob-ledger-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 8px; padding: 15px;}
                .mob-ledger-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.8rem;}

                /* MODALS GLOBALES */
                .overlay-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 2000; display: none; justify-content: center; align-items: center;}
                .card-modal { background: #111; border: 1px solid #333; border-radius: 16px; padding: 3rem; width: 100%; max-width: 450px; text-align: center; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); animation: slideUp 0.4s ease-out; box-sizing: border-box; max-height: 90vh; overflow-y:auto;}
                
                .form-group { text-align: left; margin-bottom: 15px; }
                .form-group label { display: block; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 5px; text-transform: uppercase; font-weight: bold;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 10px; border-radius: 8px; font-family: inherit; font-size: 1rem; outline: none; box-sizing: border-box;}
                .form-control:focus { border-color: var(--accent-green); }

                @keyframes spinIn { from { transform: rotate(-90deg) scale(0.8); opacity: 0; } to { transform: rotate(0) scale(1); opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                /* =========================================================
                   RESPONSIVE (FIELD APP)
                   ========================================================= */
                @media (max-width: 1024px) { 
                    .equity-dashboard { grid-template-columns: 1fr; } 
                    .pie-panel { padding: 3rem; } 
                }
                
                @media (max-width: 768px) {
                    .workspace { padding: 1.5rem 1rem; padding-bottom: 90px;}
                    .mobile-top-bar { display: flex; margin: -1.5rem -1rem 1.5rem -1rem; }
                    
                    .view-header { flex-direction: column; align-items: stretch; }
                    .view-header h1 { font-size: 1.8rem; }
                    .action-buttons { flex-direction: column; width: 100%; }
                    
                    /* Simplificar Cap Table a lista sin barras de progreso */
                    .cap-table-container { padding: 1.5rem 1rem; }
                    .cap-row { min-width: 0; flex-wrap: wrap; }
                    .cap-user { width: 100%; margin-bottom: 10px; font-size: 1.1rem;}
                    .cap-bar-container { display: none; } 
                    .cap-stats { width: 100%; text-align: left; display: flex; justify-content: space-between; align-items: baseline;}
                    
                    /* Transformar Tabla Ledger en Tarjetas */
                    .ledger-container { padding: 1.5rem 1rem; background: transparent; border: none;}
                    .ledger-table { display: none; }
                    .mobile-ledger-list { display: flex; }
                    
                    .card-modal { padding: 2rem 1.5rem; width: 95%; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/ledger')}

                <main class="workspace">
                    <header class="mobile-top-bar">
                        <a href="/v5/" data-link class="mob-brand">🗼</a>
                        <select class="mob-project-select" id="mobProjectSelect">
                            ${userProjects.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                        </select>
                        <a href="/v5/profile" data-link class="mob-user" title="Mi Perfil">
                            ${state.globalUsers.find(u => u.id === activeUserId)?.name.charAt(0).toUpperCase() || '?'}
                        </a>
                    </header>

                    <div class="view-header">
                        <div>
                            <h1 id="ledgerTitle">⚖️ Contabilidad <span class="permaweb-badge" style="display:none;" id="permawebBadge" title="Snapshot Inmutable">🧊 Sellado</span></h1>
                            <p>Slicing Pie dinámico. El registro inmutable del valor aportado por la Colla.</p>
                            <div id="snapMeta" style="font-size: 0.75rem; color: var(--accent-orange); font-family: var(--font-mono); margin-top: 10px; display:none;"></div>
                        </div>
                        <div class="action-buttons">
                            <button class="btn-capital" id="btnOpenCapitalModal" title="Inyectar Dinero o Activos a la Red" style="display:none;">
                                💶 Inyectar Capital
                            </button>
                            <button class="btn-permaweb" id="btnOpenPermaweb" title="Sella este Snapshot en Blockchain">
                                <span style="font-size: 1.2rem;" id="btnPermawebIcon">🧊</span> <span id="btnPermawebText">Congelar Snapshot</span>
                            </button>
                        </div>
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
                                Cap Table
                                <span style="font-size: 0.75rem; color: #666; font-weight: normal;">Distribución Dinámica</span>
                            </div>
                            <div id="capTableBody"></div>
                        </div>
                    </div>

                    <div class="ledger-container">
                        <div class="panel-title" style="margin-bottom: 1.5rem; font-size:1.1rem;">
                            Registro Inmutable (Bloques)
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

                    <div id="capitalModal" class="overlay-modal">
                        <div class="card-modal" style="border-color: var(--accent-green);">
                            <h2 style="color: var(--accent-green); margin-top: 0; font-size: 1.5rem;">Aportación de Capital</h2>
                            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;">Inyecta dinero o activos a la Cap Table. El modelo Slicing Pie aplicará el multiplicador de riesgo.</p>
                            
                            <div class="form-group">
                                <label>Inversor (Miembro de la red)</label>
                                <select id="inpCapUser" class="form-control"></select>
                            </div>
                            
                            <div class="form-group">
                                <label>Tipo de Activo</label>
                                <select id="inpCapType" class="form-control">
                                    <option value="cash">💶 Dinero en Efectivo (Mult. x4)</option>
                                    <option value="equipment">💻 Equipamiento Físico (Mult. x2)</option>
                                    <option value="tools">🛠️ Software / Suscripciones (Mult. x2)</option>
                                    <option value="ip">💡 Propiedad Intelectual / IP (Mult. x2)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Valor Mercado Justo (FMV en €)</label>
                                <input type="number" id="inpCapAmount" class="form-control" placeholder="Ej: 1500" min="1">
                            </div>

                            <div class="form-group">
                                <label>Concepto / Evidencia</label>
                                <input type="text" id="inpCapDesc" class="form-control" placeholder="Ej: Factura Servidor AWS 2026">
                            </div>

                            <div style="display:flex; gap:10px; margin-top: 2rem;">
                                <button class="btn btn-outline" style="width: 50%; background:transparent; color:#888; border:1px solid #555; border-radius:8px; padding:10px; cursor:pointer;" id="btnCancelCap">Cancelar</button>
                                <button class="btn btn-approve" style="width: 50%; background: var(--accent-green); color: black; border:none; border-radius:8px; font-weight:bold; padding:10px; cursor:pointer;" id="btnConfirmCap">Sellar en Ledger</button>
                            </div>
                        </div>
                    </div>

                    <div id="checkoutModal" class="overlay-modal">
                        <div class="card-modal" style="border-color: var(--accent-orange);">
                            <h2 style="color: var(--accent-orange); margin-top: 0; font-size: 1.8rem;">Sello Notarial Web3</h2>
                            <p style="color: var(--text-muted); font-size: 0.9rem;">Acuña el Snapshot actual de tu Cap Table en la red descentralizada de Arweave. Garantía legal e inmutable para la Colla y los Inversores.</p>
                            
                            <div class="checkout-price" style="font-size: 3.5rem; font-weight: 900; color: white; margin: 1rem 0; font-family: var(--font-mono);">€4.99</div>
                            <p style="color: #666; font-size: 0.75rem; margin-top:-10px;">Pago único por sellado (Sin suscripciones)</p>

                            <ul style="text-align: left; margin: 2rem 0; padding-left: 20px; color: #aaa; line-height: 1.6;">
                                <li>✅ Hash SHA-256 consolidado en Blockchain.</li>
                                <li>✅ Prueba matemática inalterable de propiedad.</li>
                                <li>✅ Mantenimiento de Nodos TeamTowers.</li>
                            </ul>

                            <div id="paymentButtons">
                                <button class="pay-btn pay-gpay" style="background: white; color: #3c4043; width: 100%; padding: 15px; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; transition: transform 0.2s;" id="btnGooglePay">
                                    <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5455 7.63636V10.1818H20.8182C20.5455 11.5455 19.5455 13.3636 17.2727 13.3636C15.3636 13.3636 13.8182 11.8182 13.8182 9.81818C13.8182 7.81818 15.3636 6.27273 17.2727 6.27273C18.3636 6.27273 19.0909 6.72727 19.5455 7.18182L21.4545 5.27273C20.3636 4.18182 18.9091 3.54545 17.2727 3.54545C13.8182 3.54545 11 6.36364 11 9.81818C11 13.2727 13.8182 16.0909 17.2727 16.0909C20.9091 16.0909 23.3636 13.5455 23.3636 9.90909C23.3636 9.36364 23.2727 8.81818 23.1818 8.45455H14.5455V7.63636ZM27.0909 10V12.7273H29.6364V10H32.3636V7.45455H29.6364V4.72727H27.0909V7.45455H24.3636V10H27.0909Z" fill="#3C4043"/><path d="M4.63636 12.8182H7.36364V0.909091H4.63636V12.8182ZM1.81818 12.8182H4.54545V4.72727H1.81818V12.8182Z" fill="#3C4043"/></svg>
                                    Pagar con Google Pay
                                </button>
                                <button class="pay-btn pay-card" style="background: #635bff; color: white; width: 100%; padding: 15px; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; transition: transform 0.2s;" id="btnStripePay">💳 Pagar con Tarjeta</button>
                                <button class="btn btn-outline" style="width: 100%; border: none; margin-top: 10px; background:transparent; color:#888; cursor:pointer;" id="btnCloseModal">Cancelar</button>
                            </div>

                            <div id="mintingLoader" style="display: none; flex-direction: column; align-items: center; gap: 15px; margin-top: 2rem;">
                                <div style="width: 40px; height: 40px; border: 4px solid rgba(255, 171, 64, 0.3); border-top-color: var(--accent-orange); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                                <p style="color: var(--accent-orange); font-family: var(--font-mono); font-weight: bold; margin:0;">Transfiriendo a Permaweb...</p>
                                <p style="color: #666; font-size: 0.75rem;">Consensuando bloques criptográficos.</p>
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

        const state = store.getState();
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        
        if (!project) {
            const userProjects = state.projects.filter(p => 
                state.session.role === 'ecosystem-owner' || 
                p.ownerId === state.session.activeUserId || 
                (p.usuarios && p.usuarios.find(u => u.id === state.session.activeUserId))
            );
            project = userProjects.length > 0 ? userProjects[userProjects.length - 1] : null;
            if(project) localStorage.setItem('tt_active_project', project.id);
        }

        if (!project) return;
        this.activeProjectId = project.id;
        
        // Mobile Top Bar
        const mobSelect = document.getElementById('mobProjectSelect');
        if (mobSelect) {
            mobSelect.value = this.activeProjectId;
            mobSelect.addEventListener('change', (e) => {
                localStorage.setItem('tt_active_project', e.target.value);
                window.location.reload(); 
            });
        }

        this.dom = {
            title: document.getElementById('ledgerTitle'),
            badge: document.getElementById('permawebBadge'),
            snapMeta: document.getElementById('snapMeta'),
            btnOpenPermaweb: document.getElementById('btnOpenPermaweb'),
            btnPermawebIcon: document.getElementById('btnPermawebIcon'),
            btnPermawebText: document.getElementById('btnPermawebText'),
            checkoutModal: document.getElementById('checkoutModal'),
            btnCloseModal: document.getElementById('btnCloseModal'),
            paymentButtons: document.getElementById('paymentButtons'),
            mintingLoader: document.getElementById('mintingLoader'),
            btnGooglePay: document.getElementById('btnGooglePay'),
            btnStripePay: document.getElementById('btnStripePay'),
            
            // Capital Elements
            btnOpenCapital: document.getElementById('btnOpenCapitalModal'),
            capitalModal: document.getElementById('capitalModal'),
            btnCancelCap: document.getElementById('btnCancelCap'),
            btnConfirmCap: document.getElementById('btnConfirmCap'),
            inpCapUser: document.getElementById('inpCapUser'),
            inpCapType: document.getElementById('inpCapType'),
            inpCapAmount: document.getElementById('inpCapAmount'),
            inpCapDesc: document.getElementById('inpCapDesc')
        };

        // Render inicial de datos
        this.renderLedgerData(project, state.globalUsers);

        // Control Visual (Solo PO o EO ven inyectar capital)
        if (project.ownerId === state.session.activeUserId || state.session.role === 'ecosystem-owner') {
            this.dom.btnOpenCapital.style.display = 'flex';
        }

        if (project.permawebSnapshot) {
            this.applyMintedStyle(project.permawebSnapshot);
        }

        // LÓGICA MODAL APORTACIÓN DE CAPITAL
        this.dom.btnOpenCapital.addEventListener('click', () => {
            const users = project.usuarios || [];
            this.dom.inpCapUser.innerHTML = users.map(u => {
                const gUser = state.globalUsers.find(gu => gu.id === u.id);
                return `<option value="${u.id}">${gUser ? gUser.name : u.id}</option>`;
            }).join('');
            
            this.dom.capitalModal.style.display = 'flex';
        });

        this.dom.btnCancelCap.addEventListener('click', () => {
            this.dom.capitalModal.style.display = 'none';
        });

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
                payload: {
                    projectId: this.activeProjectId,
                    userId: userId,
                    assetType: assetType,
                    amount: amount,
                    description: desc
                }
            });

            this.dom.capitalModal.style.display = 'none';
            this.executeViewScript(); // Recargar vista completa para actualizar pie y tablas
        });

        // LÓGICA MODAL WEB3 PERMAWEB
        this.dom.btnOpenPermaweb.addEventListener('click', () => {
            const harvest = store.calculateHarvest(this.activeProjectId) || [];
            if(harvest.length === 0) return alert("⚠️ No puedes congelar un Ledger vacío. La Colla debe reportar trabajo o aportar capital primero.");
            this.dom.checkoutModal.style.display = 'flex';
        });

        this.dom.btnCloseModal.addEventListener('click', () => {
            this.dom.checkoutModal.style.display = 'none';
        });

        const simulatePayment = () => this.executeMintingProcess();
        this.dom.btnGooglePay.addEventListener('click', simulatePayment);
        this.dom.btnStripePay.addEventListener('click', simulatePayment);
    }

    executeMintingProcess() {
        this.dom.paymentButtons.style.display = 'none';
        this.dom.mintingLoader.style.display = 'flex';

        setTimeout(() => {
            const mockArweaveTx = 'ar://' + Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('');
            
            store.dispatch({
                type: 'UPDATE_PROJECT_INFO',
                payload: {
                    projectId: this.activeProjectId,
                    updates: {
                        permawebSnapshot: {
                            txId: mockArweaveTx,
                            timestamp: Date.now()
                        }
                    }
                }
            });

            this.dom.checkoutModal.style.display = 'none';
            this.dom.paymentButtons.style.display = 'block';
            this.dom.mintingLoader.style.display = 'none';
            
            this.applyMintedStyle(store.getState().projects.find(p => p.id === this.activeProjectId).permawebSnapshot);
            
            alert(`✅ Snapshot Sellado Exitosamente.\n\nHash Público: ${mockArweaveTx}\nTu Cap Table ahora está protegida por la matemática.`);
        }, 3000);
    }

    applyMintedStyle(snapshotData) {
        this.dom.badge.style.display = 'inline-flex';
        this.dom.btnPermawebIcon.innerText = '🔄';
        this.dom.btnPermawebText.innerText = 'Actualizar Snapshot';
        
        const dateStr = new Date(snapshotData.timestamp).toLocaleDateString('es-ES');
        this.dom.snapMeta.style.display = 'block';
        this.dom.snapMeta.innerText = `Último Backup Web3: ${dateStr} - TxID: ${snapshotData.txId.substring(0,12)}...`;
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
            capTableBody.innerHTML = `<div style="padding: 2rem; text-align: center; color: #666;">El Bloque Génesis aún no contiene equidad. Completa tareas o inyecta capital.</div>`;
            tbody.innerHTML = `<tr><td colspan="7" class="empty-ledger">El Ledger está vacío. No hay registros criptográficos aún.</td></tr>`;
            mobileList.innerHTML = `<div class="empty-ledger">El Ledger está vacío.</div>`;
            return;
        }

        // 1. GENERAR CAP TABLE (BARRAS) & PIE CHART GRADIENT
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
            const capitalHtml = capitalSlices > 0 ? ` | <span style="color:var(--accent-green);">Capital Inyectado</span>` : '';

            const avgFmv = totalHours > 0 ? ((userHarvest.slices - capitalSlices) / totalHours).toFixed(1) : 0;
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
                        <div>
                            <div class="cap-percent" style="color: ${color};">${percentageStr}%</div>
                            <div class="cap-slices">${Math.round(userHarvest.slices).toLocaleString()} Slices</div>
                        </div>
                        <div class="cap-fmv">Avg. Risk/FMV: ~€${avgFmv}/h${capitalHtml}</div>
                    </div>
                </div>
            `;
        });

        capTableBody.innerHTML = capHtml;
        
        setTimeout(() => {
            pieChart.style.background = `conic-gradient(${conicGradientParts.join(', ')})`;
            document.querySelectorAll('.cap-bar-fill').forEach(bar => {
                bar.style.width = bar.getAttribute('data-target-width');
            });
        }, 100);

        // 2. GENERAR REGISTRO INMUTABLE (TABLA PC + LISTA MOBILE)
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
                roleName = `<span style="color: var(--accent-green); font-weight:bold;">💼 Aportación Capital</span>`;
                horasStr = `<span style="color:#666;">--</span>`; 
            } else {
                const role = project.roles.find(r => r.id === entry.roleId);
                roleName = role ? `<span style="color: var(--text-muted); font-size:0.8rem; font-family:var(--font-mono);">${role.levelId}</span> ${role.name}` : 'Nodo Base';
                horasStr = `${entry.horas}h`;
            }
            
            const proofLink = entry.proofLink ? ` <a href="${entry.proofLink}" target="_blank" style="color:var(--accent-blue); font-size:0.8rem; text-decoration:none;">[Ver]</a>` : '';
            const slicesFmt = `+${Math.round(entry.valorCongelado).toLocaleString()}`;
            const hashShort = entry.hash.substring(0,8);

            // RENDER TABLA (PC)
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><span class="hash-badge" title="${entry.hash}">${hashShort}...</span></td>
                <td style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem;">${date}</td>
                <td style="font-weight: bold; color: white;">${user.name}</td>
                <td>${roleName}</td>
                <td>${entry.description}${proofLink}</td>
                <td style="font-family: var(--font-mono); color: #888;">${horasStr}</td>
                <td style="text-align: right;"><span class="slice-badge">${slicesFmt}</span></td>
            `;
            tbody.appendChild(row);

            // RENDER TARJETA (MÓVIL)
            const mobCard = document.createElement('div');
            mobCard.className = 'mob-ledger-card';
            mobCard.innerHTML = `
                <div class="mob-ledger-header">
                    <span class="hash-badge" title="${entry.hash}">${hashShort}...</span>
                    <span style="color: var(--text-muted); font-family: var(--font-mono);">${date}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <strong style="color:white; font-size:1.1rem;">${user.name}</strong>
                    <span class="slice-badge" style="font-size:1.2rem;">${slicesFmt}</span>
                </div>
                <div style="font-size:0.85rem; color:#ccc; margin-bottom:5px;">${roleName}</div>
                <div style="font-size:0.8rem; color:#888; background:rgba(0,0,0,0.4); padding:8px; border-radius:6px;">
                    ${entry.description} ${isCapital ? '' : `| ⏱ ${horasStr}`} ${proofLink}
                </div>
            `;
            mobileList.appendChild(mobCard);
        });

        // GENESIS BLOCK
        const genesisHash = (project.genesisHash || 'GENESIS').substring(0,8);
        
        // Genesis Tabla PC
        const genesisRow = document.createElement('tr');
        genesisRow.innerHTML = `
            <td><span class="hash-badge" style="border-color:#555; color:#888;">${genesisHash}...</span></td>
            <td style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem;">--</td>
            <td style="color: #666; font-style: italic;">Sistema</td>
            <td style="color: #666;">Orquestador Kernel</td>
            <td style="color: #888;">Instanciación del Mapa VNA (Bloque Génesis)</td>
            <td style="font-family: var(--font-mono); color: #666;">0h</td>
            <td style="text-align: right;"><span class="slice-badge" style="color:#666;">+0</span></td>
        `;
        tbody.appendChild(genesisRow);

        // Genesis Tarjeta Móvil
        const mobGen = document.createElement('div');
        mobGen.className = 'mob-ledger-card';
        mobGen.style.borderColor = '#333';
        mobGen.innerHTML = `
            <div class="mob-ledger-header">
                <span class="hash-badge" style="border-color:#555; color:#888;">${genesisHash}...</span>
                <span style="color: #666; font-family: var(--font-mono);">--</span>
            </div>
            <div style="color:#888; font-size:0.9rem; font-style:italic;">Bloque Génesis (Instanciación del Mapa VNA)</div>
        `;
        mobileList.appendChild(mobGen);
    }
}
