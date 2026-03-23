// v9/js/views/LedgerView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { LedgerRenderer } from '../components/LedgerRenderer.js'; 

export default class LedgerView {
    constructor() {
        document.title = "Notaría & Cap Table | TeamTowers V9";
        this.activeProjectId = null;
        this.currentTab = 'project'; 
        this.ledgerRenderer = null; 
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
                        <div class="glass-panel" style="text-align:center; max-width: 500px; margin: 0 auto; padding: 4rem;">
                             <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1;">⚖️</div>
                             <h2 style="color:white; margin-top:0; font-weight:900; font-size:2rem;">Wallet Vacía</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2.5rem; font-size:1.1rem;">No tienes participación (Slices) en ningún Ecosistema.</p>
                             <a href="/v9/create" data-link class="btn-primary" style="text-decoration:none;">➕ Inicializar Red</a>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/ledger')}
                </div>
            `;
        }

        const isPO = project && (project.ownerId === activeUserId || state.session.role === 'ecosystem-owner');

        const headerConfig = {
            title: "Slicing Pie Wallet",
            subtitle: project.nombre,
            tagline: "Libro mayor inmutable. Tu trabajo (realHours) y riesgo matemático convertido en Equity.",
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
                ${LedgerRenderer.getStyles()} 

                .workspace-ledger { flex: 1; padding: 2rem 3rem; overflow-y: auto; background: radial-gradient(circle at center, #111116 0%, #050505 100%); }
                .tab-content { display: none; animation: fadeIn 0.3s ease-out; }
                .tab-content.active { display: block; }

                .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; width: 100%; box-sizing: border-box;}
                .portfolio-card { background: linear-gradient(145deg, rgba(30,30,35,0.6), rgba(15,15,20,0.8)); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 20px; transition: 0.3s; box-sizing: border-box;}
                .portfolio-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5);}

                .overlay-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(15px); z-index: 5000; display: none; justify-content: center; align-items: center;}
                .card-modal { background: var(--bg-dark); border: 1px solid #444; border-radius: 24px; padding: 3rem; width: 100%; max-width: 500px; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8); animation: slideUp 0.4s; box-sizing: border-box; max-height: 90vh; overflow-y:auto; border-top: 4px solid currentColor;}
                .form-group { text-align: left; margin-bottom: 20px; }
                .form-group label { display: block; color: var(--text-muted); font-size: 0.8rem; margin-bottom: 8px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;}
                .form-control { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; padding: 14px 16px; border-radius: 12px; font-family: inherit; font-size: 1rem; outline: none; box-sizing: border-box; transition: 0.3s; }
                .form-control:focus { border-color: var(--accent-green); }

                @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                @media (max-width: 1024px) { .workspace-ledger { padding: 90px 1rem 120px 1rem; } }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/ledger')}
                <main class="workspace-ledger">
                    ${PageHeader.getHtml(headerConfig)}
                    
                    <div id="tab-project" class="tab-content ${this.currentTab === 'project' ? 'active' : ''}">
                        <div id="ledgerMountPoint"></div>
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
                            <p style="color: #aaa; font-size: 0.95rem; margin-bottom: 2.5rem; line-height:1.5;">El motor aplicará el multiplicador matemático correspondiente al tipo de riesgo.</p>
                            
                            <div class="form-group">
                                <label>Inversor (Nodo del Ecosistema)</label>
                                <select id="inpCapUser" class="form-control" style="font-weight:bold; color:var(--accent-green);"></select>
                            </div>
                            
                            <div class="form-group">
                                <label>Tipo de Activo Inyectado</label>
                                <select id="inpCapType" class="form-control">
                                    <option value="cash">💶 Efectivo / Fiat (Riesgo x4)</option>
                                    <option value="equipment">💻 Equipamiento Físico (Riesgo x2)</option>
                                    <option value="tools">🛠️ Licencias Software (Riesgo x2)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Valor de Mercado Justo (€)</label>
                                <input type="number" id="inpCapAmount" class="form-control" placeholder="Ej: 1500" min="1" style="font-size:1.2rem; font-weight:bold;">
                            </div>

                            <div class="form-group">
                                <label>Concepto</label>
                                <input type="text" id="inpCapDesc" class="form-control" placeholder="Ej: Pago de Servidor AWS Anual">
                            </div>

                            <div style="display:flex; gap:15px; margin-top: 2.5rem;">
                                <button class="btn-primary" style="flex: 1; background:transparent; border:1px solid #555; color:white;" id="btnCancelCap">Cancelar</button>
                                <button class="btn-primary" style="flex: 2; background: var(--accent-green); color: black;" id="btnConfirmCap">Sellar Bloque Inmutable</button>
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

        const mountPoint = document.getElementById('ledgerMountPoint');
        if (mountPoint) {
            this.ledgerRenderer = new LedgerRenderer(mountPoint, { 
                projectId: this.activeProjectId, 
                showHistory: true 
            });
            this.ledgerRenderer.render();
        }

        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.currentTab}`);
            if(target) target.classList.add('active');

            if(this.currentTab === 'global') {
                this.renderGlobalPortfolio(store.getState(), activeUserId);
            } else {
                if (this.ledgerRenderer) this.ledgerRenderer.render();
            }
        });

        window.addEventListener('ph-magic-action', (e) => {
            if(e.detail.actionId === 'audit_cap') {
                alert("🧠 IA Auditora (@notari_ledger): Cap Table validada. Todos los Slices derivan de Work Orders auditadas o Inyecciones de Capital selladas.");
            }
        });

        const btnOpenCap = document.getElementById('btnOpenCapitalModal');
        const capModal = document.getElementById('capitalModal');
        if (btnOpenCap) {
            btnOpenCap.addEventListener('click', () => {
                // Muestra tanto usuarios asignados como dueños
                let users = [...(project.usuarios || [])];
                if (project.ownerId && !users.find(u => u.id === project.ownerId)) {
                    users.push({ id: project.ownerId });
                }

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

            if (!amount || amount <= 0) return alert("Introduce un valor en euros mayor que cero.");
            if (!desc) return alert("El concepto es obligatorio para la trazabilidad.");

            const btn = document.getElementById('btnConfirmCap');
            btn.disabled = true;
            btn.innerText = "⏳ Inyectando...";

            await store.dispatch({
                type: 'ADD_CAPITAL_INJECTION',
                payload: { projectId: this.activeProjectId, userId: userId, assetType: assetType, amount: amount, description: desc }
            });

            capModal.style.display = 'none';
            btn.disabled = false;
            btn.innerText = "Sellar Bloque Inmutable";
            
            if (this.ledgerRenderer) this.ledgerRenderer.render(); 
        });

        document.getElementById('btnOpenExit')?.addEventListener('click', () => {
            alert("Esta función requiere conectar una Wallet Web3 (Ethereum/Solana). Integración en desarrollo para la fase P2P.");
        });
        
        document.getElementById('btnOpenPermaweb')?.addEventListener('click', () => {
            alert("Congelando Hash de la Cap Table en Arweave... [Modo Simulación V9 Antigravity]");
        });
    }

    renderGlobalPortfolio(state, userId) {
        const grid = document.getElementById('portfolioGrid');
        if(!grid) return;
        let html = '';
        let totalGlobalSlices = 0;

        state.projects.forEach(p => {
            const harvest = store.calculateHarvest(p.id) || [];
            const myHarvest = harvest.find(h => h.userId === userId || h.user === userId); // Soporte retroactivo para V8
            
            if (myHarvest && myHarvest.totalSlices > 0) {
                totalGlobalSlices += myHarvest.totalSlices;
                
                // Determinamos el rol principal del usuario en este proyecto
                const userTxs = (p.ledger || []).filter(tx => tx.userId === userId);
                const hasCapital = userTxs.some(tx => tx.type === 'CAPITAL');
                let roleTag = hasCapital ? `<span style="color:var(--accent-green);">Capital (Inversor)</span>` : `Trabajo (Sweat Equity)`;

                html += `
                    <div class="portfolio-card">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <strong style="color:white; font-size:1.2rem; font-weight:900;">${p.nombre}</strong>
                            <span style="font-size:0.75rem; color:var(--accent-purple); border:1px solid rgba(224,64,251,0.3); background:rgba(224,64,251,0.1); padding:4px 10px; border-radius:8px; font-weight:bold;">${p.archetype || 'SOS'}</span>
                        </div>
                        <div style="font-size: 2.2rem; font-family: var(--font-mono); color: var(--accent-green); font-weight: 900; margin: 15px 0;">
                            ${Math.round(myHarvest.totalSlices).toLocaleString()} <span style="font-size:0.9rem; color:#888; font-weight:normal;">Slices</span>
                        </div>
                        <div style="font-size:0.85rem; color:#ccc; display:flex; justify-content:space-between; align-items:center;">
                            <span>Participación (Equity): <strong style="color:white;">${myHarvest.percentage}%</strong></span>
                            ${roleTag}
                        </div>
                    </div>
                `;
            }
        });

        if (html === '') {
            grid.innerHTML = `<div style="grid-column: 1/-1; padding: 4rem; text-align:center; color:#666; border: 1px dashed var(--glass-border); border-radius:20px;">No tienes patrimonio consolidado en ningún ecosistema de la red.</div>`;
        } else {
            const summaryHtml = `
                <div class="portfolio-card" style="background: linear-gradient(135deg, rgba(0, 176, 255, 0.1), rgba(224, 64, 251, 0.1)); border-color: var(--accent-blue);">
                    <div style="color:var(--accent-blue); font-size:0.85rem; text-transform:uppercase; font-weight:900; letter-spacing:1px; margin-bottom:10px;">Patrimonio Consolidado</div>
                    <div style="font-size: 2.8rem; font-family: var(--font-mono); color: white; font-weight: 900; margin: 15px 0; text-shadow: 0 5px 15px rgba(0,0,0,0.5);">
                        ${Math.round(totalGlobalSlices).toLocaleString()} <span style="font-size:1rem; color:#888; font-weight:normal;">Total Slices</span>
                    </div>
                    <div style="font-size:0.8rem; color:#aaa; font-style:italic;">Suma de tu valor aportado a través de todos los Ecosistemas del Kernel V9.</div>
                </div>
            `;
            grid.innerHTML = summaryHtml + html;
        }
    }
}
