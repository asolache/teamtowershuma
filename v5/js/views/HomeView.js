// v5/js/views/HomeView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class HomeView {
    constructor() {
        document.title = "Centro de Mando | TeamTowers SOS";
        this.currentTab = 'proyectos'; 
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const config = state.config;

        if (!activeUserId || activeUserId === 'ecosystem-admin' || state.session.role === 'guest') {
            return this.getLandingHtml();
        }

        const archetypeColors = {
            'startup': { label: '🚀 STARTUP', color: 'var(--accent-green)' },
            'corp': { label: '🏢 HOLDING / CORP', color: 'var(--accent-blue)' },
            'corporate': { label: '🏢 HOLDING / CORP', color: 'var(--accent-blue)' },
            'dao': { label: '🤖 IA-DAO', color: 'var(--accent-purple)' },
            'incubator': { label: '🏭 INCUBADORA', color: 'var(--accent-orange)' },
            'sos': { label: '🆘 S.O.S. COMUNITARIO', color: 'var(--accent-red)' },
            'custom': { label: '✨ RED CUSTOM', color: 'white' }
        };

        const globalArchetype = config.archetype || (state.projects[0] ? state.projects[0].archetype : 'startup');
        const archData = archetypeColors[globalArchetype] || archetypeColors['startup'];

        const headerConfig = {
            title: config.ecosystemName || "TeamTowers Network",
            subtitle: `<span style="font-size:0.6rem; padding:4px 8px; border-radius:12px; border:1px solid ${archData.color}; color:${archData.color}; vertical-align:middle; margin-left:10px;">${archData.label}</span>`,
            tagline: "Panel de control del Ecosistema (Macro-Red).",
            tabs: [
                { id: 'proyectos', label: '🪐 Redes', active: this.currentTab === 'proyectos' },
                { id: 'identidad', label: '📜 Misión', active: this.currentTab === 'identidad' },
                { id: 'explorador', label: '🔎 Etherscan', active: this.currentTab === 'explorador' },
                { id: 'mapa', label: '🕸️ VNA Macro', active: this.currentTab === 'mapa' }
            ]
        };

        const isEcosystemOwner = state.session.role === 'ecosystem-owner' || config.allowUserCreation;

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; height: 100%; box-sizing: border-box; scroll-behavior: smooth;}
                
                .tab-content { display: none; animation: fadeIn 0.3s ease-out; padding-bottom: 2rem; }
                .tab-content.active { display: block; }

                /* PANELES Y STATS */
                .panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 2rem; margin-bottom: 2rem;}
                .panel h2 { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px;}
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .stat-card { background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: var(--border-radius-md); text-align: center; }
                .stat-value { font-size: 2.5rem; color: var(--accent-green); font-weight: 800; font-family: var(--font-mono); margin-bottom: 5px; }
                .stat-label { color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }

                /* =========================================================
                   FILTROS, BUSCADOR Y BOTÓN CREAR
                   ========================================================= */
                .filter-bar { display: flex; gap: 15px; margin-bottom: 2rem; background: rgba(255,255,255,0.02); padding: 15px; border-radius: var(--border-radius-md); border: 1px solid var(--glass-border); flex-wrap: wrap; align-items: center; justify-content: space-between;}
                .filter-group { display: flex; gap: 15px; flex: 1; flex-wrap: wrap; }
                .filter-bar input, .filter-bar select { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 10px 15px; border-radius: 8px; font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
                .filter-bar input:focus, .filter-bar select:focus { border-color: var(--accent-blue); }
                .filter-search { flex: 2; min-width: 200px; }
                .filter-select { flex: 1; min-width: 150px; }

                .btn-create-net { background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple)); padding: 2px; border-radius: 8px; cursor: pointer; transition: transform 0.2s; border: none; display: flex;}
                .btn-create-net:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 176, 255, 0.3); }
                .btn-create-inner { background: #000; color: white; padding: 8px 20px; border-radius: 6px; font-weight: bold; font-size: 0.9rem; width: 100%; text-align: center;}
                .btn-create-net:hover .btn-create-inner { background: transparent; }

                /* =========================================================
                   GRID PROYECTOS (LUXURY CARDS)
                   ========================================================= */
                .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
                
                .project-card { 
                    background: rgba(20, 20, 25, 0.6); border: 1px solid rgba(255,255,255,0.05); 
                    border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; 
                    transition: all 0.3s ease; position: relative; overflow: hidden; backdrop-filter: blur(10px);
                    cursor: pointer; text-decoration: none;
                }
                .project-card:hover { transform: translateY(-3px); border-color: #555; box-shadow: 0 10px 20px rgba(0,0,0,0.3); background: rgba(255,255,255,0.03); }
                
                .card-header { display: flex; justify-content: space-between; align-items: flex-start; z-index: 1; margin-bottom: 1rem;}
                .card-title { font-size: 1.3rem; color: white; margin: 0 0 8px 0; font-weight: 800; letter-spacing: -0.5px;}
                
                .card-arch { font-size: 0.65rem; padding: 4px 8px; border-radius: 6px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); white-space:nowrap;}
                .arch-startup { background: rgba(0, 230, 118, 0.1); color: var(--accent-green); border: 1px solid rgba(0, 230, 118, 0.2); }
                .arch-dao { background: rgba(224, 64, 251, 0.1); color: var(--accent-purple); border: 1px solid rgba(224, 64, 251, 0.2); }
                .arch-corp { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border: 1px solid rgba(0, 176, 255, 0.2); }
                .arch-incubator { background: rgba(255, 171, 64, 0.1); color: var(--accent-orange); border: 1px solid rgba(255, 171, 64, 0.2); }

                /* TAGS */
                .card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 1rem; z-index: 1;}
                .tag-pill { background: rgba(0,0,0,0.5); border: 1px solid #333; color: #aaa; font-size: 0.7rem; padding: 3px 8px; border-radius: 12px;}

                .card-metrics { display: flex; justify-content: space-between; margin-bottom: 1.5rem; z-index: 1; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;}
                .metric { display: flex; flex-direction: column; align-items: center; }
                .metric-val { font-size: 1.2rem; color: white; font-family: var(--font-mono); font-weight: bold; }
                .metric-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; }

                .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 15px; z-index: 1;}
                
                .opp-pill { 
                    background: rgba(0, 176, 255, 0.1); border: 1px solid rgba(0, 176, 255, 0.2); color: var(--accent-blue);
                    padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; 
                    display: inline-flex; align-items: center; gap: 6px; transition: 0.2s; font-family: var(--font-mono);
                }
                .opp-pill.has-offers {
                    background: rgba(255, 171, 64, 0.15); border-color: var(--accent-orange); color: var(--accent-orange);
                    box-shadow: 0 0 10px rgba(255, 171, 64, 0.1);
                }
                .project-card:hover .opp-pill.has-offers { box-shadow: 0 0 15px rgba(255, 171, 64, 0.3); }

                .btn-enter { color: var(--text-muted); font-size: 0.85rem; font-weight: bold; display: flex; align-items: center; gap: 5px; transition: 0.2s;}
                .project-card:hover .btn-enter { color: white; }

                .desktop-only { display: flex; }
                .mobile-only { display: none; }

                /* ETHERSCAN LOCAL */
                .etherscan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 10px;}
                .etherscan-filters select, .etherscan-filters input { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 8px 12px; border-radius: 6px; outline: none; font-size:0.85rem; font-family:var(--font-mono);}
                .ledger-table-wrapper { overflow-x: auto; background: #08080a; border: 1px solid #1a1a24; border-radius: var(--border-radius-lg); padding: 1rem;}
                .ledger-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px; font-family: var(--font-mono); font-size: 0.85rem;}
                .ledger-table th { padding: 1rem; color: var(--accent-blue); border-bottom: 1px solid #222; text-transform: uppercase; letter-spacing: 1px; font-size: 0.75rem;}
                .ledger-table td { padding: 1rem; border-bottom: 1px dashed #1a1a24; color: #ddd; }
                .ledger-table tr:hover td { background: rgba(255,255,255,0.02); }
                .hash-badge { color: var(--accent-purple); padding: 2px 6px; border-radius: 4px; background: rgba(224,64,251,0.1); border: 1px solid rgba(224,64,251,0.2);}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

                /* RESPONSIVE MOBILE */
                @media (max-width: 768px) {
                    .workspace { padding: 80px 1rem 90px 1rem; } 
                    .stats-grid { grid-template-columns: 1fr 1fr; }
                    .filter-bar { flex-direction: column; align-items: stretch; padding: 15px;}
                    .filter-group { flex-direction: column; }
                    .filter-bar input, .filter-bar select { width: 100%; }
                    
                    .projects-grid { display: flex; flex-direction: column; gap: 12px; }
                    .project-card { padding: 1rem 1.2rem; border-radius: 16px; }
                    .card-header { margin-bottom: 8px; }
                    .card-title { font-size: 1.15rem; margin-bottom: 4px;}
                    
                    .desktop-only { display: none !important; }
                    .mobile-only { display: flex !important; }

                    .card-footer { padding-top: 10px; border-top: 1px dashed #333; margin-top: 5px;}
                    .mob-meta-stats { font-size: 0.75rem; color: #888; font-family: var(--font-mono); font-weight: bold;}

                    .etherscan-filters { width: 100%; display: flex; flex-direction: column; }
                    .etherscan-filters input, .etherscan-filters select { width: 100%; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/')}

                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-proyectos" class="tab-content active">
                        <div class="filter-bar" id="filterBar" style="${this.allProjects?.length === 0 ? 'display:none;' : ''}">
                            <div class="filter-group">
                                <input type="text" id="filterSearch" class="filter-search" placeholder="🔍 Buscar red por nombre...">
                                <select id="filterSector" class="filter-select">
                                    <option value="all">🌐 Todos los Sectores</option>
                                </select>
                                <select id="filterArch" class="filter-select">
                                    <option value="all">🏛️ Todos los Arquetipos</option>
                                </select>
                            </div>
                            ${isEcosystemOwner ? `
                                <button class="btn-create-net" id="btnCreateNewNet">
                                    <div class="btn-create-inner">➕ Instanciar Red</div>
                                </button>
                            ` : ''}
                        </div>

                        <div class="projects-grid" id="ecosystemProjectsGrid"></div>
                    </div>

                    <div id="view-identidad" class="tab-content">
                        <div class="panel">
                            <h2>📊 Tablero de Comando Global</h2>
                            <div class="stats-grid" id="globalStatsGrid">
                                <div class="stat-card"><div class="stat-value">Cargando...</div></div>
                            </div>
                        </div>

                        <div class="panel">
                            <h2>📜 Misión y System Prompt Global</h2>
                            <p style="font-family: var(--font-mono); color: #ccc; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; border: 1px dashed #444;">
                                ${config.globalPrompt || "El Ecosistema aún no tiene un System Prompt definido."}
                            </p>
                        </div>
                    </div>

                    <div id="view-explorador" class="tab-content">
                        <div class="etherscan-header">
                            <h2 style="color:white; margin:0;">🔎 Explorador de Bloques</h2>
                            <div class="etherscan-filters">
                                <input type="text" id="scanSearch" placeholder="Buscar por Tx Hash o Alias...">
                                <select id="scanProjectFilter">
                                    <option value="all">Todas las Redes</option>
                                    ${state.projects.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="ledger-table-wrapper">
                            <table class="ledger-table">
                                <thead>
                                    <tr>
                                        <th>Hash</th>
                                        <th>Red (Proyecto)</th>
                                        <th>Fecha</th>
                                        <th>Nodo</th>
                                        <th>Concepto</th>
                                        <th style="text-align:right;">Slices Generados</th>
                                    </tr>
                                </thead>
                                <tbody id="scanTableBody"></tbody>
                            </table>
                        </div>
                    </div>

                    <div id="view-mapa" class="tab-content">
                        <div class="panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height: 400px; text-align:center;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">🕸️</div>
                            <h2 style="border:none;">Topología Macro-Red (En Construcción)</h2>
                            <p style="max-width: 500px; margin:0 auto;">En la V10, este lienzo mostrará cómo las empresas/proyectos (nodos macro) se pasan valor entre ellos mediante el orquestador de <code>macroFlows</code> del Kernel.</p>
                        </div>
                    </div>

                </main>
                ${BottomNav.getHtml('/')}
            </div>
        `;
    }

    // --- LANDING PAGE MANTENIDA IGUAL ---
    getLandingHtml() {
        return `
            <style>
                .landing-canvas { height: 100vh; width: 100vw; background: #050507; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: var(--font-main); position: relative; overflow: hidden; }
                .grid-bg { position: absolute; width: 200%; height: 200%; background-image: linear-gradient(rgba(0, 176, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 176, 255, 0.05) 1px, transparent 1px); background-size: 50px 50px; transform: perspective(500px) rotateX(60deg); bottom: -50%; left: -50%; animation: gridMove 20s linear infinite; z-index: 0; }
                @keyframes gridMove { from { background-position: 0 0; } to { background-position: 0 1000px; } }
                .content-box { z-index: 10; text-align: center; max-width: 900px; padding: 0 2rem; background: rgba(5, 5, 7, 0.8); backdrop-filter: blur(10px); padding: 4rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 30px 60px rgba(0,0,0,0.8);}
                .tagline { color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 1.5rem; display: inline-block; background: rgba(0,176,255,0.1); padding: 5px 15px; border-radius: 20px; border: 1px solid rgba(0,176,255,0.2);}
                .main-title { font-size: 4rem; color: white; line-height: 1; margin-bottom: 1.5rem; letter-spacing: -2px; font-weight: 800; }
                .main-title span { color: transparent; background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple)); -webkit-background-clip: text; background-clip: text; }
                .description { color: #aaa; font-size: 1.1rem; max-width: 600px; margin: 0 auto 3rem auto; line-height: 1.6; }
                .auth-container { display: flex; flex-direction: column; align-items: center; gap: 15px; width: 100%; max-width: 350px; margin: 0 auto;}
                .btn-web3 { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s;}
                .btn-web3:hover { background: rgba(255,255,255,0.1); border-color: white; transform: translateY(-2px);}
                #googleButtonContainer { width: 100%; display: flex; justify-content: center;}
                .features-row { display: flex; justify-content: center; gap: 30px; margin-top: 3rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 2rem;}
                .feat { font-size: 0.8rem; color: #666; display: flex; align-items: center; gap: 8px;}
                .feat strong { color: var(--accent-green); }
                .terminal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5, 5, 7, 0.98); backdrop-filter: blur(20px); z-index: 2000; display: none; flex-direction: column; align-items: center; justify-content: center; font-family: var(--font-mono); color: var(--accent-green); }
                .boot-log { width: 500px; text-align: left; font-size: 1rem; line-height: 2; border-left: 3px solid var(--accent-blue); padding-left: 25px; text-shadow: 0 0 8px rgba(0, 230, 118, 0.5); font-weight: bold; }
                .cursor { display: inline-block; width: 10px; height: 18px; background: var(--accent-green); animation: blink 0.8s infinite; margin-left: 5px; vertical-align: middle;}
                @keyframes blink { 50% { opacity: 0; } }
            </style>
            <div class="landing-canvas">
                <div class="grid-bg"></div>
                <div class="content-box">
                    <span class="tagline">Local-First DAO OS</span>
                    <h1 class="main-title">No uses software.<br>Construye <span>Soberanía.</span></h1>
                    <p class="description">El primer Exoesqueleto Organizacional que fusiona Modelos Dinámicos de Equidad (Slicing Pie), Agentes IA y Bases de Datos Locales para equipos radicales.</p>
                    <div class="auth-container">
                        <button class="btn-web3" id="btnConnectWallet">🦊 Conectar Wallet (Web3)</button>
                        <div style="color:#555; font-size:0.8rem; margin: 5px 0;">— o utiliza el puente Web2 —</div>
                        <div id="googleButtonContainer"></div>
                        <div id="authStatus" style="color: var(--accent-green); font-family: var(--font-mono); font-size: 0.8rem; display: none;">Sincronizando Identidad Fractal...</div>
                    </div>
                    <div class="features-row">
                        <div class="feat"><strong>✓</strong> Datos en Localhost</div>
                        <div class="feat"><strong>✓</strong> Contratos Inmutables</div>
                        <div class="feat"><strong>✓</strong> Orquestador Cognitivo IA</div>
                    </div>
                </div>
                <div class="terminal-overlay" id="bootTerminal">
                    <div style="font-size: 4rem; margin-bottom: 2rem; text-shadow: 0 0 20px rgba(0,176,255,0.5);">🗼</div>
                    <div class="boot-log" id="logContent"></div>
                    <div style="margin-top: 3rem; font-size: 0.75rem; color: #555; text-shadow: none;">SOS_KERNEL_STABLE // BUILD 2026.03.11</div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        if (!state.session.activeUserId || state.session.activeUserId === 'ecosystem-admin' || state.session.role === 'guest') {
            this.initLandingScripts();
            return;
        }

        Sidebar.initListeners();
        PageHeader.execute();

        const tabBtns = document.querySelectorAll('.ph-tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach(content => content.classList.remove('active'));
                
                const targetId = `view-${btn.dataset.tab}`;
                const targetContent = document.getElementById(targetId);
                if (targetContent) targetContent.classList.add('active');
            });
        });

        this.allProjects = state.projects || [];

        this.renderGlobalStats(state);
        
        if(this.allProjects.length > 0) {
            document.getElementById('filterBar').style.display = 'flex';
            this.setupFilters();
        }
        
        this.renderEcosystemProjects([...this.allProjects].reverse());
        this.renderEtherscan(state);

        document.getElementById('scanSearch')?.addEventListener('input', () => this.renderEtherscan(store.getState()));
        document.getElementById('scanProjectFilter')?.addEventListener('change', () => this.renderEtherscan(store.getState()));

        // BOTÓN DE CREAR RED (V10)
        const btnCreateNet = document.getElementById('btnCreateNewNet');
        if (btnCreateNet) {
            btnCreateNet.addEventListener('click', async () => {
                const name = prompt("Nombre de la nueva red / proyecto:");
                if (!name) return;
                
                const newId = 'proj-' + Date.now();
                await store.dispatch({
                    type: 'CREATE_PROJECT',
                    payload: {
                        id: newId,
                        nombre: name,
                        sector: 'digital_media_growth',
                        archetype: 'startup',
                        ownerId: state.session.activeUserId
                    }
                });
                
                localStorage.setItem('tt_active_project', newId);
                window.location.href = '/v5/project';
            });
        }
    }

    setupFilters() {
        const searchInput = document.getElementById('filterSearch');
        const sectorSelect = document.getElementById('filterSector');
        const archSelect = document.getElementById('filterArch');

        if (!searchInput || !sectorSelect || !archSelect) return;

        const uniqueSectors = [...new Set(this.allProjects.map(p => p.sector || 'General'))];
        uniqueSectors.forEach(sec => {
            sectorSelect.innerHTML += `<option value="${sec}">${sec.replace(/_/g, ' ').toUpperCase()}</option>`;
        });

        const uniqueArchs = [...new Set(this.allProjects.map(p => p.archetype || 'startup'))];
        uniqueArchs.forEach(arc => {
            archSelect.innerHTML += `<option value="${arc}">${arc.toUpperCase()}</option>`;
        });

        const applyFilters = () => {
            const term = searchInput.value.toLowerCase();
            const selectedSector = sectorSelect.value;
            const selectedArch = archSelect.value;

            const filtered = this.allProjects.filter(p => {
                const matchName = p.nombre.toLowerCase().includes(term);
                const matchSector = selectedSector === 'all' || (p.sector || 'General') === selectedSector;
                const matchArch = selectedArch === 'all' || (p.archetype || 'startup') === selectedArch;
                return matchName && matchSector && matchArch;
            });

            this.renderEcosystemProjects([...filtered].reverse());
        };

        searchInput.addEventListener('input', applyFilters);
        sectorSelect.addEventListener('change', applyFilters);
        archSelect.addEventListener('change', applyFilters);
    }

    renderGlobalStats(state) {
        let totalProjects = state.projects.length;
        let totalGlobalSlices = 0;
        let totalGlobalUsers = new Set();
        let totalTxs = 0;

        state.projects.forEach(p => {
            (p.ledger || []).forEach(l => {
                totalGlobalSlices += l.valorCongelado || 0;
                totalTxs++;
            });
            (p.usuarios || []).forEach(u => totalGlobalUsers.add(u.id));
        });

        document.getElementById('globalStatsGrid').innerHTML = `
            <div class="stat-card" style="border-color: var(--accent-blue);">
                <div class="stat-value" style="color: var(--accent-blue);">${totalProjects}</div>
                <div class="stat-label">Proyectos (Nodos)</div>
            </div>
            <div class="stat-card" style="border-color: var(--accent-green);">
                <div class="stat-value" style="color: var(--accent-green);">${Math.round(totalGlobalSlices).toLocaleString()}</div>
                <div class="stat-label">Slices Minados Global</div>
            </div>
            <div class="stat-card" style="border-color: var(--accent-purple);">
                <div class="stat-label" style="margin-bottom:5px;">Comunidad</div>
                <div style="font-size: 1.5rem; color: white; font-weight:bold;">${totalGlobalUsers.size} Usuarios</div>
                <div style="font-size: 0.8rem; color: #888; margin-top:5px;">${totalTxs} Bloques Validados</div>
            </div>
        `;
    }

    renderEcosystemProjects(projectsToRender) {
        const grid = document.getElementById('ecosystemProjectsGrid');
        if(!grid) return;
        
        if (projectsToRender.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1; padding:3rem; text-align:center; color:#888; border:1px dashed #333; border-radius:12px;">El ecosistema está vacío. Crea tu primera red.</div>`;
            return;
        }

        grid.innerHTML = projectsToRender.map(p => {
            const usersCount = (p.usuarios || []).length;
            const ledgerCount = (p.ledger || []).length;
            
            // Evaluamos ofertas usando ambas estructuras
            const openTxs = (p.transactions || []).filter(tx => tx.status === 'theoretical').length;
            const openWos = (p.work_orders || []).filter(wo => wo.status === 'theoretical').length;
            const openTasks = openTxs + openWos;

            let tags = p.tags || [];
            if (tags.length === 0) tags = ['VNA', (p.sector || 'Agnóstico').split('_')[0]];

            let archClass = 'arch-startup';
            let privacyIcon = '🌐';
            
            if(p.archetype === 'dao') archClass = 'arch-dao';
            if(p.archetype === 'corporate' || p.archetype === 'corp') {
                archClass = 'arch-corp';
                privacyIcon = '🔒';
            }
            if(p.archetype === 'incubator') archClass = 'arch-incubator';

            const oppClass = openTasks > 0 ? 'has-offers' : '';

            return `
                <div class="project-card btn-navigate" data-id="${p.id}" data-target="/project">
                    <div class="card-header">
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <h3 class="card-title">${p.nombre}</h3>
                            <div class="card-tags">
                                ${tags.map(t => `<span class="tag-pill">#${t}</span>`).join('')}
                            </div>
                        </div>
                        <div class="card-arch ${archClass}">${privacyIcon} ${p.archetype}</div>
                    </div>

                    <div class="card-metrics desktop-only">
                        <div class="metric">
                            <span class="metric-val">${usersCount}</span>
                            <span class="metric-label">Nodos</span>
                        </div>
                        <div class="metric" style="border-left: 1px solid rgba(255,255,255,0.1); padding-left: 15px;">
                            <span class="metric-val">${ledgerCount}</span>
                            <span class="metric-label">Bloques</span>
                        </div>
                    </div>

                    <div class="card-footer">
                        <div class="opp-pill ${oppClass}">
                            🎯 ${openTasks} Ofertas
                        </div>
                        <div class="mob-meta-stats mobile-only">
                            👥 ${usersCount} | 🧱 ${ledgerCount}
                        </div>
                        <div class="btn-enter desktop-only">
                            Acceder &rarr;
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.btn-navigate').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.currentTarget.getAttribute('data-id');
                const targetUrl = e.currentTarget.getAttribute('data-target');
                localStorage.setItem('tt_active_project', targetId);
                window.location.href = `/v5${targetUrl}`;
            });
        });
    }

    renderEtherscan(state) {
        const tbody = document.getElementById('scanTableBody');
        if(!tbody) return;

        const searchQ = document.getElementById('scanSearch')?.value.toLowerCase() || '';
        const projFilt = document.getElementById('scanProjectFilter')?.value || 'all';

        let globalLedger = [];
        state.projects.forEach(p => {
            if(projFilt === 'all' || projFilt === p.id) {
                (p.ledger || []).forEach(l => {
                    globalLedger.push({ ...l, projectName: p.nombre });
                });
            }
        });

        globalLedger.sort((a, b) => b.timestamp - a.timestamp);

        if (searchQ) {
            globalLedger = globalLedger.filter(l => {
                const safeHash = l.hash || l.id || '';
                const safeUserId = l.userId || '';
                const safeDesc = l.description || '';
                return safeHash.toLowerCase().includes(searchQ) || 
                       safeUserId.toLowerCase().includes(searchQ) || 
                       safeDesc.toLowerCase().includes(searchQ);
            });
        }

        if (globalLedger.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2rem; color:#666;">No se encontraron bloques.</td></tr>`;
            return;
        }

        tbody.innerHTML = globalLedger.slice(0, 100).map(entry => {
            const date = new Date(entry.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
            const user = state.globalUsers.find(u => u.id === entry.userId) || { name: entry.userId };
            
            const rawHash = entry.hash || entry.id || 'LEGACY_BLOCK';
            const hashShort = rawHash.length > 10 ? rawHash.substring(0,10) : rawHash;
            
            const slicesFmt = `+${Math.round(entry.valorCongelado || 0).toLocaleString()}`;
            
            return `
                <tr>
                    <td><span class="hash-badge" title="${rawHash}">${hashShort}...</span></td>
                    <td style="color:var(--accent-blue);">${entry.projectName}</td>
                    <td style="color:#888;">${date}</td>
                    <td style="font-weight:bold; color:white;">${user.name}</td>
                    <td style="color:#ccc;">${entry.description || ''}</td>
                    <td style="text-align:right; font-weight:bold; color:var(--accent-green); font-family:var(--font-mono);">${slicesFmt}</td>
                </tr>
            `;
        }).join('');
    }

    // --- LANDING SCRIPTS ---
    initLandingScripts() {
        if (!document.getElementById('gsi-script')) {
            const script = document.createElement('script');
            script.id = 'gsi-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            document.head.appendChild(script);
            script.onload = () => this.initGoogleAuth();
        } else {
            this.initGoogleAuth();
        }

        const btnWallet = document.getElementById('btnConnectWallet');
        if (btnWallet) {
            btnWallet.addEventListener('click', () => {
                const address = prompt("Fase Beta: Simulador de Conexión Ethers.js\nIntroduce una Wallet Address (Ej: 0x123...):", "0xabc123...");
                if (address) {
                    this.processLoginOrOnboarding({ wallet: address, name: "Crypto User" });
                }
            });
        }
    }

    initGoogleAuth() {
        const GOOGLE_CLIENT_ID = "778991708293-c4f7s4l4339ooldpun0eitfdb12gjfdn.apps.googleusercontent.com";
        if (window.google && window.google.accounts) {
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: this.handleGoogleCredentialResponse.bind(this)
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("googleButtonContainer"),
                    { theme: "outline", size: "large", shape: "rectangular", width: 350 }
                );
            } catch (e) {
                console.warn("GSI Error:", e);
                document.getElementById("googleButtonContainer").innerHTML = 
                    `<button class="btn-web3" onclick="alert('Google Auth requiere HTTPS / Dominio válido.')">⚠️ Forzar Login Dummy</button>`;
            }
        }
    }

    async handleGoogleCredentialResponse(response) {
        document.getElementById('authStatus').style.display = 'block';
        document.getElementById('googleButtonContainer').style.display = 'none';
        document.getElementById('btnConnectWallet').style.display = 'none';

        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        this.processLoginOrOnboarding({ email: decodedToken.email, name: decodedToken.name });
    }

    async processLoginOrOnboarding(credentials) {
        const state = store.getState();
        
        const existingUser = state.globalUsers.find(u => 
            (credentials.email && u.email === credentials.email) || 
            (credentials.wallet && u.wallet === credentials.wallet) ||
            (credentials.email && u.walletOrSocial === credentials.email)
        );

        if (existingUser) {
            const terminal = document.getElementById('bootTerminal');
            const logContent = document.getElementById('logContent');
            if (terminal) terminal.style.display = 'flex';
            
            const lines = [
                `> AUTHENTICATING ENTITY: [${existingUser.id}]`,
                "> SYNCING VNA PROTOCOLS... <span style='color:var(--accent-blue)'>[OK]</span>",
                "> LOADING SLICING PIE LEDGER... <span style='color:var(--accent-blue)'>[OK]</span>",
                "> DEPLOYING COGNITIVE EXOSKELETON..."
            ];

            let i = 0;
            const printLine = () => {
                if (i < lines.length) {
                    if (logContent) logContent.innerHTML += `<div style="margin-bottom: 5px;">${lines[i]}</div>`;
                    i++;
                    setTimeout(printLine, 300); 
                } else {
                    if (logContent) logContent.innerHTML += `<div style="margin-top:20px; color:white; font-size: 1.2rem;">ACCESS GRANTED <span class="cursor"></span></div>`;
                    setTimeout(async () => {
                        await store.dispatch({ type: 'LOGIN_USER', payload: { userId: existingUser.id } });
                        window.location.reload();
                    }, 600);
                }
            };
            setTimeout(printLine, 200);

        } else {
            sessionStorage.setItem('tt_temp_onboarding_email', credentials.email || '');
            sessionStorage.setItem('tt_temp_onboarding_wallet', credentials.wallet || '');
            sessionStorage.setItem('tt_temp_onboarding_name', credentials.name || '');
            setTimeout(() => window.location.href = '/v5/onboarding', 1000);
        }
    }
}
