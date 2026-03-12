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

        // Si no hay usuario logueado, mostramos la Landing Page
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
            subtitle: `<span style="font-size:0.6rem; padding:4px 10px; border-radius:12px; border:1px solid ${archData.color}; color:${archData.color}; vertical-align:middle; margin-left:10px; letter-spacing:1px; background: rgba(0,0,0,0.5);">${archData.label}</span>`,
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
                
                .tab-content { display: none; animation: fadeIn 0.4s ease-out; padding-bottom: 3rem; }
                .tab-content.active { display: block; }

                /* =========================================================
                   PANELES Y STATS (LUXURY UX)
                   ========================================================= */
                .panel { background: rgba(255,255,255,0.015); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2.5rem; margin-bottom: 2.5rem; box-shadow: 0 10px 40px rgba(0,0,0,0.2); backdrop-filter: blur(10px);}
                .panel h2 { color: white; font-size: 1.3rem; margin-top: 0; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; font-weight: 800; letter-spacing: -0.5px;}
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
                .stat-card { background: linear-gradient(145deg, rgba(0,0,0,0.6), rgba(10,10,15,0.8)); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 16px; text-align: center; transition: transform 0.3s, box-shadow 0.3s; position: relative; overflow: hidden;}
                .stat-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.4); }
                
                .stat-value { font-size: 3rem; font-weight: 900; font-family: var(--font-mono); line-height: 1; margin-bottom: 8px; z-index: 2; position: relative;}
                .stat-label { color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; z-index: 2; position: relative;}

                /* =========================================================
                   FILTROS, BUSCADOR Y BOTÓN CREAR
                   ========================================================= */
                .toolbar-lux { display: flex; gap: 15px; margin-bottom: 2.5rem; background: rgba(255,255,255,0.02); padding: 15px; border-radius: 16px; border: 1px solid var(--glass-border); align-items: center; justify-content: space-between; flex-wrap: wrap; backdrop-filter: blur(5px);}
                .filter-group { display: flex; gap: 12px; flex: 1; flex-wrap: wrap; align-items: center; }
                
                .lux-input { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 12px 18px; border-radius: 10px; font-family: inherit; font-size: 0.95rem; outline: none; transition: all 0.3s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);}
                .lux-input:focus, .lux-input:hover { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.1); }
                .filter-search { flex: 2; min-width: 250px; }
                .filter-select { flex: 1; min-width: 180px; appearance: none; background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23AAAAAA%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); background-repeat: no-repeat; background-position: right 15px top 50%; background-size: 10px auto;}

                .btn-create-lux { 
                    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); 
                    color: white; border: none; padding: 12px 24px; border-radius: 12px; 
                    font-weight: 800; font-size: 1rem; cursor: pointer; transition: all 0.3s ease; 
                    display: flex; align-items: center; gap: 8px; box-shadow: 0 5px 20px rgba(0, 176, 255, 0.2);
                    white-space: nowrap;
                }
                .btn-create-lux:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 8px 25px rgba(224, 64, 251, 0.4); filter: brightness(1.1);}

                /* =========================================================
                   GRID PROYECTOS (LUXURY CARDS)
                   ========================================================= */
                .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 2rem; }
                
                .project-card { 
                    background: linear-gradient(180deg, rgba(25, 25, 30, 0.8) 0%, rgba(15, 15, 20, 0.9) 100%);
                    border: 1px solid rgba(255,255,255,0.08); 
                    border-radius: 20px; padding: 1.8rem; display: flex; flex-direction: column; 
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); position: relative; overflow: hidden; backdrop-filter: blur(15px);
                    cursor: pointer; text-decoration: none;
                }
                .project-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple)); opacity: 0; transition: opacity 0.3s; }
                .project-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); box-shadow: 0 15px 35px rgba(0,0,0,0.5); }
                .project-card:hover::before { opacity: 1; }
                
                .card-header { display: flex; justify-content: space-between; align-items: flex-start; z-index: 1; margin-bottom: 1.2rem;}
                .card-title { font-size: 1.4rem; color: white; margin: 0 0 10px 0; font-weight: 800; letter-spacing: -0.5px;}
                
                .card-arch { font-size: 0.65rem; padding: 4px 10px; border-radius: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); white-space:nowrap;}
                .arch-startup { background: rgba(0, 230, 118, 0.1); color: var(--accent-green); border: 1px solid rgba(0, 230, 118, 0.2); }
                .arch-dao { background: rgba(224, 64, 251, 0.1); color: var(--accent-purple); border: 1px solid rgba(224, 64, 251, 0.2); }
                .arch-corp { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border: 1px solid rgba(0, 176, 255, 0.2); }
                .arch-incubator { background: rgba(255, 171, 64, 0.1); color: var(--accent-orange); border: 1px solid rgba(255, 171, 64, 0.2); }

                /* TAGS */
                .card-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 1.2rem; z-index: 1;}
                .tag-pill { background: rgba(0,0,0,0.6); border: 1px solid #333; color: #bbb; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px;}

                .card-metrics { display: flex; justify-content: space-between; margin-bottom: 1.5rem; z-index: 1; padding: 12px 15px; background: rgba(0,0,0,0.4); border-radius: 12px; border: 1px solid rgba(255,255,255,0.02);}
                .metric { display: flex; flex-direction: column; align-items: center; }
                .metric-val { font-size: 1.3rem; color: white; font-family: var(--font-mono); font-weight: 900; }
                .metric-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;}

                .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 15px; z-index: 1;}
                
                /* PILL DE OFERTAS PREMIUM */
                .opp-pill { 
                    background: rgba(0, 176, 255, 0.1); border: 1px solid rgba(0, 176, 255, 0.2); color: var(--accent-blue);
                    padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; 
                    display: inline-flex; align-items: center; gap: 6px; transition: 0.3s; font-family: var(--font-mono);
                }
                .opp-pill.has-offers {
                    background: rgba(255, 171, 64, 0.15); border-color: var(--accent-orange); color: var(--accent-orange);
                    box-shadow: 0 0 15px rgba(255, 171, 64, 0.2);
                }
                .project-card:hover .opp-pill.has-offers { box-shadow: 0 0 20px rgba(255, 171, 64, 0.4); transform: scale(1.05);}

                .btn-enter { color: var(--text-muted); font-size: 0.9rem; font-weight: bold; display: flex; align-items: center; gap: 5px; transition: 0.3s; text-transform: uppercase; letter-spacing: 1px;}
                .project-card:hover .btn-enter { color: white; transform: translateX(5px);}

                .desktop-only { display: flex; }
                .mobile-only { display: none; }

                /* =========================================================
                   ETHERSCAN LOCAL
                   ========================================================= */
                .etherscan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 15px;}
                .ledger-table-wrapper { overflow-x: auto; background: #08080a; border: 1px solid #1a1a24; border-radius: var(--border-radius-lg); padding: 1.5rem;}
                .ledger-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px; font-family: var(--font-mono); font-size: 0.9rem;}
                .ledger-table th { padding: 1rem; color: var(--accent-blue); border-bottom: 1px solid #222; text-transform: uppercase; letter-spacing: 1px; font-size: 0.75rem;}
                .ledger-table td { padding: 1.2rem 1rem; border-bottom: 1px dashed #1a1a24; color: #ddd; }
                .ledger-table tr:hover td { background: rgba(255,255,255,0.02); }
                .hash-badge { color: var(--accent-purple); padding: 4px 8px; border-radius: 6px; background: rgba(224,64,251,0.1); border: 1px solid rgba(224,64,251,0.2); font-weight: bold;}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

                /* =========================================================
                   RESPONSIVE MOBILE (COMPACT ROWS)
                   ========================================================= */
                @media (max-width: 768px) {
                    .workspace { padding: 80px 1rem 90px 1rem; } 
                    
                    .panel { padding: 1.5rem; }
                    .stats-grid { grid-template-columns: 1fr 1fr; }
                    .stat-value { font-size: 2rem; }
                    
                    .toolbar-lux { flex-direction: column; align-items: stretch; padding: 15px; border-radius: 12px;}
                    .filter-group { flex-direction: column; gap: 10px;}
                    .lux-input { width: 100%; }
                    .btn-create-lux { width: 100%; justify-content: center; padding: 14px;}
                    
                    /* UX LUXURY LIST */
                    .projects-grid { display: flex; flex-direction: column; gap: 15px; }
                    .project-card { padding: 1.5rem; border-radius: 16px; }
                    .card-header { margin-bottom: 10px; }
                    .card-title { font-size: 1.2rem; margin-bottom: 8px;}
                    
                    .desktop-only { display: none !important; }
                    .mobile-only { display: flex !important; }

                    .card-footer { padding-top: 15px; border-top: 1px dashed #333; margin-top: 5px;}
                    .mob-meta-stats { font-size: 0.8rem; color: #888; font-family: var(--font-mono); font-weight: bold;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/')}

                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-proyectos" class="tab-content active">
                        
                        <div class="toolbar-lux" id="filterBar" style="${this.allProjects?.length === 0 ? 'display:none;' : ''}">
                            <div class="filter-group">
                                <input type="text" id="filterSearch" class="lux-input filter-search" placeholder="🔍 Buscar red por nombre...">
                                <select id="filterSector" class="lux-input filter-select">
                                    <option value="all">🌐 Todos los Sectores</option>
                                </select>
                                <select id="filterArch" class="lux-input filter-select">
                                    <option value="all">🏛️ Todos los Arquetipos</option>
                                </select>
                            </div>
                            ${isEcosystemOwner ? `
                                <button class="btn-create-lux" id="btnCreateNewNet" title="Abre el Creador de Redes y IA">
                                    <span>➕</span> Instanciar Red
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
                            <p style="font-family: var(--font-mono); color: #ccc; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 12px; border: 1px dashed #444; line-height: 1.6;">
                                ${config.globalPrompt || "El Ecosistema aún no tiene un System Prompt definido. Usa la configuración para darle un alma a tu DAO."}
                            </p>
                        </div>
                    </div>

                    <div id="view-explorador" class="tab-content">
                        <div class="panel" style="padding: 1.5rem;">
                            <div class="etherscan-header">
                                <h2 style="color:white; margin:0; border:none;">🔎 Explorador de Bloques</h2>
                                <div class="filter-group" style="flex:0; min-width:300px;">
                                    <input type="text" id="scanSearch" class="lux-input" placeholder="Buscar Hash o Alias...">
                                    <select id="scanProjectFilter" class="lux-input">
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
                    </div>

                    <div id="view-mapa" class="tab-content">
                        <div class="panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height: 400px; text-align:center;">
                            <div style="font-size: 4rem; margin-bottom: 1.5rem;">🕸️</div>
                            <h2 style="border:none; font-size: 2rem;">Topología Macro-Red</h2>
                            <p style="max-width: 600px; margin:0 auto; color: #888; font-size: 1.1rem;">En la V11, este lienzo conectará de forma visual e interactiva cómo los Ecosistemas (Nodos Macro) intercambian valor y capital mediante el protocolo <code>macroFlows</code> del Kernel.</p>
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
            const fb = document.getElementById('filterBar');
            if(fb) fb.style.display = 'flex';
            this.setupFilters();
        }
        
        this.renderEcosystemProjects([...this.allProjects].reverse());
        this.renderEtherscan(state);

        document.getElementById('scanSearch')?.addEventListener('input', () => this.renderEtherscan(store.getState()));
        document.getElementById('scanProjectFilter')?.addEventListener('change', () => this.renderEtherscan(store.getState()));

        // BOTÓN DE CREAR RED (V10 DRY LOGIC)
        const btnCreateNet = document.getElementById('btnCreateNewNet');
        if (btnCreateNet) {
            btnCreateNet.addEventListener('click', () => {
                // Redirige directamente al Instanciador Oficial (ProjectCreatorView)
                window.location.href = '/v5/create';
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
            <div class="stat-card" style="border-bottom: 3px solid var(--accent-blue);">
                <div class="stat-value" style="color: var(--accent-blue);">${totalProjects}</div>
                <div class="stat-label">Nodos Activos (Redes)</div>
            </div>
            <div class="stat-card" style="border-bottom: 3px solid var(--accent-green);">
                <div class="stat-value" style="color: var(--accent-green);">${Math.round(totalGlobalSlices).toLocaleString()}</div>
                <div class="stat-label">Slices Emitidos (Equity)</div>
            </div>
            <div class="stat-card" style="border-bottom: 3px solid var(--accent-purple);">
                <div class="stat-label" style="margin-bottom:8px;">Comunidad Web3</div>
                <div style="font-size: 1.8rem; color: white; font-weight:900; font-family:var(--font-mono);">${totalGlobalUsers.size} <span style="font-size:1rem; color:#888;">Wallets</span></div>
                <div style="font-size: 0.85rem; color: var(--accent-purple); margin-top:8px; font-weight:bold;">${totalTxs} Bloques Validados</div>
            </div>
        `;
    }

    renderEcosystemProjects(projectsToRender) {
        const grid = document.getElementById('ecosystemProjectsGrid');
        if(!grid) return;
        
        if (projectsToRender.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1; padding:4rem; text-align:center; color:#888; border:1px dashed #333; border-radius:16px; background:rgba(0,0,0,0.3);">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🌌</div>
                    <h3 style="color:white;">El universo está vacío</h3>
                    <p>No se encontraron redes con estos filtros. Crea tu primera DAO.</p>
                </div>`;
            return;
        }

        grid.innerHTML = projectsToRender.map(p => {
            const usersCount = (p.usuarios || []).length;
            const ledgerCount = (p.ledger || []).length;
            
            // V10 LOGIC: Ofertas teóricas (Transactions legacy + Work Orders nuevas)
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
                        <div style="display:flex; flex-direction:column; gap:8px; flex:1;">
                            <h3 class="card-title">${p.nombre}</h3>
                            <div class="card-tags">
                                ${tags.slice(0,3).map(t => `<span class="tag-pill">#${t}</span>`).join('')}
                            </div>
                        </div>
                        <div class="card-arch ${archClass}" style="flex-shrink:0;">${privacyIcon} ${p.archetype}</div>
                    </div>

                    <div class="card-metrics desktop-only">
                        <div class="metric">
                            <span class="metric-val">${usersCount}</span>
                            <span class="metric-label">Nodos Huma</span>
                        </div>
                        <div class="metric" style="border-left: 1px solid rgba(255,255,255,0.05); padding-left: 20px;">
                            <span class="metric-val">${ledgerCount}</span>
                            <span class="metric-label">Bloques</span>
                        </div>
                    </div>

                    <div class="card-footer">
                        <div class="opp-pill ${oppClass}">
                            🎯 ${openTasks} Tareas Libres
                        </div>
                        <div class="mob-meta-stats mobile-only">
                            👥 ${usersCount} Nodos | 🧱 ${ledgerCount} Bloques
                        </div>
                        <div class="btn-enter desktop-only">
                            ENTRAR &rarr;
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
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 3rem; color:#666; font-size:1rem;">La red está inactiva. No hay bloques minados.</td></tr>`;
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
                    <td style="color:var(--accent-blue); font-weight:bold;">${entry.projectName}</td>
                    <td style="color:#888;">${date}</td>
                    <td style="font-weight:bold; color:white;">${user.name}</td>
                    <td style="color:#ccc;">${entry.description || ''}</td>
                    <td style="text-align:right; font-weight:900; color:var(--accent-green); font-family:var(--font-mono); font-size:1rem;">${slicesFmt}</td>
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
