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
                .auth-container { display: flex; flex-direction: column; align-items: center; gap: 15px; width: 100%; max-
