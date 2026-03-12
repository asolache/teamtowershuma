// v5/js/views/HomeView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

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

        // Carga Dinámica de Sectores para el Buscador
        const customSectores = state.ontology?.sectores || {};
        let filterSectorOptions = `<option value="all">🌐 Todos los Sectores</option>`;
        
        if (Object.keys(customSectores).length > 0) {
            filterSectorOptions += `<optgroup label="🌟 Tus Plantillas Custom">`;
            Object.keys(customSectores).forEach(k => {
                if(k !== '_meta') filterSectorOptions += `<option value="custom_${k}">${k.toUpperCase()}</option>`;
            });
            filterSectorOptions += `</optgroup>`;
        }
        
        filterSectorOptions += `<optgroup label="📦 Catálogo Kernel V10">`;
        Object.keys(GLOBAL_ONTOLOGY).forEach(k => {
            if(k !== '_meta') filterSectorOptions += `<option value="${k}">${k.replace(/_/g, ' ').toUpperCase()}</option>`;
        });
        filterSectorOptions += `</optgroup>`;

        return `
            <style>
                /* PANELES LUXURY */
                .panel { background: rgba(255,255,255,0.015); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2.5rem; margin-bottom: 2.5rem; box-shadow: 0 10px 40px rgba(0,0,0,0.2); backdrop-filter: blur(10px);}
                .panel h2 { color: white; font-size: 1.3rem; margin-top: 0; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; font-weight: 800; letter-spacing: -0.5px;}
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
                .stat-card { background: linear-gradient(145deg, rgba(0,0,0,0.6), rgba(10,10,15,0.8)); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 16px; text-align: center; transition: transform 0.3s, box-shadow 0.3s; position: relative; overflow: hidden;}
                .stat-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.4); }
                
                .stat-value { font-size: 3rem; font-weight: 900; font-family: var(--font-mono); line-height: 1; margin-bottom: 8px; z-index: 2; position: relative;}
                .stat-label { color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; z-index: 2; position: relative;}

                /* FILTROS Y BUSCADOR */
                .toolbar-lux { display: flex; gap: 15px; margin-bottom: 2.5rem; background: rgba(255,255,255,0.02); padding: 15px; border-radius: 16px; border: 1px solid var(--glass-border); align-items: center; justify-content: space-between; flex-wrap: wrap; backdrop-filter: blur(5px);}
                .filter-group { display: flex; gap: 12px; flex: 1; flex-wrap: wrap; align-items: center; }
                
                .filter-search { flex: 2; min-width: 250px; }
                .filter-select { 
                    flex: 1; min-width: 180px; appearance: none; -webkit-appearance: none;
                    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23AAAAAA%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E"); 
                    background-repeat: no-repeat; background-position: right 15px top 50%; background-size: 10px auto;
                }

                /* GRID PROYECTOS */
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

                /* ETHERSCAN LOCAL */
                .etherscan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 15px;}
                .ledger-table-wrapper { overflow-x: auto; background: #08080a; border: 1px solid #1a1a24; border-radius: var(--border-radius-lg); padding: 1.5rem; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) rgba(0,0,0,0.2);}
                .ledger-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px; font-family: var(--font-mono); font-size: 0.9rem;}
                .ledger-table th { padding: 1rem; color: var(--accent-blue); border-bottom: 1px solid #222; text-transform: uppercase; letter-spacing: 1px; font-size: 0.75rem;}
                .ledger-table td { padding: 1.2rem 1rem; border-bottom: 1px dashed #1a1a24; color: #ddd; }
                .ledger-table tr:hover td { background: rgba(255,255,255,0.02); }
                .hash-badge { color: var(--accent-purple); padding: 4px 8px; border-radius: 6px; background: rgba(224,64,251,0.1); border: 1px solid rgba(224,64,251,0.2); font-weight: bold;}

                /* RESPONSIVE MOBILE */
                @media (max-width: 768px) {
                    .panel { padding: 1.5rem; }
                    .stats-grid { grid-template-columns: 1fr 1fr; }
                    .stat-value { font-size: 2rem; }
                    
                    .toolbar-lux { flex-direction: column; align-items: stretch; padding: 15px; border-radius: 12px;}
                    .filter-group { flex-direction: column; gap: 10px;}
                    
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
                        
                        <div class="toolbar-lux" id="filterBar">
                            <div class="filter-group">
                                <input type="text" id="filterSearch" class="form-control filter-search" placeholder="🔍 Buscar red por nombre...">
                                <select id="filterSector" class="form-control filter-select">
                                    ${filterSectorOptions}
                                </select>
                                <select id="filterArch" class="form-control filter-select">
                                    <option value="all">🏛️ Todos los Arquetipos</option>
                                    <option value="startup">🚀 Startup</option>
                                    <option value="dao">🤖 IA-DAO</option>
                                    <option value="corp">🏢 Holding</option>
                                    <option value="incubator">🏭 Incubadora</option>
                                </select>
                            </div>
                            ${isEcosystemOwner ? `
                                <button class="btn-primary" id="btnCreateNewNet" title="Abre el Creador de Redes y IA">
                                    <span>➕</span> Instanciar Red
                                </button>
                            ` : ''}
                        </div>

                        <div class="projects-grid" id="ecosystemProjectsGrid"></div>
                    </div>

                    <div id="view-identidad" class="tab-content">
                        <div class="panel">
                            <h2>📊 Tablero de Comando Global</h2>
                            <div class="stats-grid" id="globalStatsGrid"></div>
                        </div>
                        <div class="panel">
                            <h2>📜 Misión y System Prompt Global</h2>
                            <p style="font-family: var(--font-mono); color: #ccc; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 12px; border: 1px dashed #444; line-height: 1.6;">
                                ${config.globalPrompt || "El Ecosistema aún no tiene un System Prompt definido."}
                            </p>
                        </div>
                    </div>

                    <div id="view-explorador" class="tab-content">
                        <div class="panel" style="padding: 1.5rem;">
                            <div class="etherscan-header">
                                <h2 style="color:white; margin:0; border:none;">🔎 Explorador de Bloques</h2>
                                <div class="filter-group" style="flex:0; min-width:300px;">
                                    <input type="text" id="scanSearch" class="form-control" placeholder="Buscar Hash o Alias...">
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
                                            <th style="text-align:right;">Slices</th>
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
                            <p style="max-width: 600px; margin:0 auto; color: #888; font-size: 1.1rem;">En la V12, este lienzo conectará los Ecosistemas mediante el protocolo <code>macroFlows</code> P2P.</p>
                        </div>
                    </div>

                </main>
                ${BottomNav.getHtml('/')}
            </div>
        `;
    }

    getLandingHtml() { 
        return `
            <div style="display:flex; height:100vh; justify-content:center; align-items:center; background:var(--bg-dark); color:white; font-family:var(--font-main);">
                <div style="text-align:center;">
                    <h1 style="font-size:3rem; margin-bottom:1rem; color:var(--accent-blue);">TeamTowers SOS</h1>
                    <p style="color:#888;">El Social Operating System. Conéctate para continuar.</p>
                    <a href="/v5/" data-link style="display:inline-block; margin-top:2rem; padding:10px 20px; background:var(--accent-blue); color:black; font-weight:bold; border-radius:8px; text-decoration:none;">ENTRAR AL KERNEL</a>
                </div>
            </div>
        `; 
    }

    executeViewScript() {
        const state = store.getState();
        if (!state.session.activeUserId || state.session.activeUserId === 'ecosystem-admin' || state.session.role === 'guest') {
            return; 
        }

        Sidebar.initListeners();
        PageHeader.execute();

        window.addEventListener('ph-tab-changed', (e) => {
            if (e.detail && e.detail.tabId) {
                this.currentTab = e.detail.tabId;
            }
        });

        this.allProjects = state.projects || [];
        this.renderGlobalStats(state);
        this.setupFilters();
        this.renderEcosystemProjects([...this.allProjects].reverse());
        this.renderEtherscan(state);

        document.getElementById('scanSearch')?.addEventListener('input', () => this.renderEtherscan(store.getState()));

        const btnCreateNet = document.getElementById('btnCreateNewNet');
        if (btnCreateNet) {
            btnCreateNet.addEventListener('click', () => {
                window.location.href = '/v5/create';
            });
        }
    }

    setupFilters() {
        const searchInput = document.getElementById('filterSearch');
        const sectorSelect = document.getElementById('filterSector');
        const archSelect = document.getElementById('filterArch');

        if (!searchInput || !sectorSelect || !archSelect) return;

        const applyFilters = () => {
            const term = searchInput.value.toLowerCase();
            const selectedSector = sectorSelect.value;
            const selectedArch = archSelect.value;

            const filtered = this.allProjects.filter(p => {
                const matchName = p.nombre.toLowerCase().includes(term);
                const rawSector = selectedSector.replace('custom_', '').replace('native_', '');
                const matchSector = selectedSector === 'all' || p.sector === rawSector || p.sector === selectedSector;
                const matchArch = selectedArch === 'all' || p.archetype === selectedArch;
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
            
            const openTxs = (p.transactions || []).filter(tx => tx.status === 'theoretical').length;
            const openWos = (p.work_orders || []).filter(wo => wo.status === 'theoretical').length;
            const openTasks = openTxs + openWos;

            let tags = p.tags || [];
            if (tags.length === 0) tags = ['VNA', (p.sector || 'Agnóstico').split('_')[0]];

            let archClass = 'arch-startup';
            let privacyIcon = '🌐';
            
            if(p.archetype === 'dao') archClass = 'arch-dao';
            if(p.archetype === 'corporate' || p.archetype === 'corp') { archClass = 'arch-corp'; privacyIcon = '🔒'; }
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
                localStorage.setItem('tt_active_project', e.currentTarget.getAttribute('data-id'));
                window.location.href = `/v5${e.currentTarget.getAttribute('data-target')}`;
            });
        });
    }

    renderEtherscan(state) {
        const tbody = document.getElementById('scanTableBody');
        if(!tbody) return;

        const searchQ = document.getElementById('scanSearch')?.value.toLowerCase() || '';

        let globalLedger = [];
        state.projects.forEach(p => {
            (p.ledger || []).forEach(l => { globalLedger.push({ ...l, projectName: p.nombre }); });
        });

        globalLedger.sort((a, b) => b.timestamp - a.timestamp);

        if (searchQ) {
            globalLedger = globalLedger.filter(l => 
                (l.hash || '').toLowerCase().includes(searchQ) || 
                (l.userId || '').toLowerCase().includes(searchQ) || 
                (l.description || '').toLowerCase().includes(searchQ)
            );
        }

        if (globalLedger.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 3rem; color:#666; font-size:1rem;">La red está inactiva. No hay bloques minados.</td></tr>`;
            return;
        }

        tbody.innerHTML = globalLedger.slice(0, 100).map(entry => {
            const date = new Date(entry.timestamp).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' });
            const user = state.globalUsers.find(u => u.id === entry.userId) || { name: entry.userId };
            const rawHash = entry.hash || entry.id || 'LEGACY_BLOCK';
            const slicesFmt = `+${Math.round(entry.valorCongelado || 0).toLocaleString()}`;
            
            return `
                <tr>
                    <td><span class="hash-badge" title="${rawHash}">${rawHash.substring(0,10)}...</span></td>
                    <td style="color:var(--accent-blue); font-weight:bold;">${entry.projectName}</td>
                    <td style="color:#888;">${date}</td>
                    <td style="font-weight:bold; color:white;">${user.name}</td>
                    <td style="color:#ccc;">${entry.description || ''}</td>
                    <td style="text-align:right; font-weight:900; color:var(--accent-green); font-family:var(--font-mono); font-size:1rem;">${slicesFmt}</td>
                </tr>
            `;
        }).join('');
    }
}
