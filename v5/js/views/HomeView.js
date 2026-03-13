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
        this.allProjects = [];
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
                /* ESTILOS EXCLUSIVOS DE HOMEVIEW (NO REPETIR LAYOUT DEL MASTER) */
                .tab-content { display: none; animation: fadeIn 0.4s ease-out; padding-bottom: 3rem; width: 100%;}
                .tab-content.active { display: block; }

                .toolbar-lux { display: flex; gap: 15px; margin-bottom: 2.5rem; background: rgba(255,255,255,0.02); padding: 15px; border-radius: 16px; border: 1px solid var(--glass-border); align-items: center; justify-content: space-between; flex-wrap: wrap; backdrop-filter: blur(5px);}
                
                .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 2rem; }
                
                .project-card { 
                    background: linear-gradient(180deg, rgba(25, 25, 30, 0.8) 0%, rgba(15, 15, 20, 0.9) 100%);
                    border: 1px solid rgba(255,255,255,0.08); 
                    border-radius: 20px; padding: 1.8rem; display: flex; flex-direction: column; 
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); position: relative; overflow: hidden; backdrop-filter: blur(15px);
                    cursor: pointer; text-decoration: none;
                }
                .project-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.2); box-shadow: 0 15px 35px rgba(0,0,0,0.5); }
                
                .ledger-table-wrapper { overflow-x: auto; background: #08080a; border: 1px solid #1a1a24; border-radius: 16px; padding: 1.5rem; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) rgba(0,0,0,0.2);}
                .ledger-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 800px; font-family: var(--font-mono); font-size: 0.9rem;}
                
                @media (max-width: 768px) {
                    .projects-grid { display: flex; flex-direction: column; gap: 15px; }
                    .toolbar-lux { flex-direction: column; align-items: stretch; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/')}

                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-proyectos" class="tab-content ${this.currentTab === 'proyectos' ? 'active' : ''}">
                        <div class="toolbar-lux">
                            <div style="display: flex; gap: 12px; flex: 1; flex-wrap: wrap; align-items: center;">
                                <input type="text" id="filterSearch" class="form-control" style="flex:2; min-width:250px;" placeholder="🔍 Buscar red por nombre...">
                                <select id="filterSector" class="form-control" style="flex:1; min-width:180px;">
                                    ${filterSectorOptions}
                                </select>
                            </div>
                            ${isEcosystemOwner ? `<button class="btn-primary" id="btnCreateNewNet"><span>➕</span> Instanciar Red</button>` : ''}
                        </div>

                        <div class="projects-grid" id="ecosystemProjectsGrid"></div>
                    </div>

                    <div id="view-identidad" class="tab-content ${this.currentTab === 'identidad' ? 'active' : ''}">
                        <div class="panel">
                            <h2>📊 Tablero de Comando Global</h2>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;" id="globalStatsGrid"></div>
                        </div>
                        <div class="panel">
                            <h2>📜 Misión y System Prompt Global</h2>
                            <p style="font-family: var(--font-mono); color: #ccc; background: rgba(0,0,0,0.5); padding: 20px; border-radius: 12px; border: 1px dashed #444; line-height: 1.6;">
                                ${config.globalPrompt || "El Ecosistema aún no tiene un System Prompt definido."}
                            </p>
                        </div>
                    </div>

                    <div id="view-explorador" class="tab-content ${this.currentTab === 'explorador' ? 'active' : ''}">
                        <div class="panel" style="padding: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 15px;">
                                <h2 style="margin:0; border:none;">🔎 Explorador de Bloques</h2>
                                <input type="text" id="scanSearch" class="form-control" placeholder="Buscar Hash o Alias..." style="width:300px;">
                            </div>
                            <div class="ledger-table-wrapper">
                                <table class="ledger-table">
                                    <thead>
                                        <tr style="color: var(--accent-blue); text-transform: uppercase; font-size: 0.75rem; border-bottom: 1px solid #222;">
                                            <th style="padding:10px;">Hash</th><th>Red</th><th>Fecha</th><th>Nodo</th><th>Concepto</th><th style="text-align:right;">Slices</th>
                                        </tr>
                                    </thead>
                                    <tbody id="scanTableBody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div id="view-mapa" class="tab-content ${this.currentTab === 'mapa' ? 'active' : ''}">
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
        return `<div class="app-layout" style="justify-content:center; align-items:center;">
                    <div style="text-align:center;">
                        <h1 style="font-size:3.5rem; letter-spacing:-2px;">TeamTowers <span style="color:var(--accent-blue)">SOS</span></h1>
                        <button class="btn-primary" onclick="location.reload()">RECONECTAR KERNEL</button>
                    </div>
                </div>`; 
    }

    executeViewScript() {
        const state = store.getState();
        if (!state.session.activeUserId || state.session.activeUserId === 'ecosystem-admin' || state.session.role === 'guest') return;

        Sidebar.initListeners();
        PageHeader.execute();

        // MOTOR DE PESTAÑAS DRY
        window.addEventListener('ph-tab-changed', (e) => {
            if (e.detail && e.detail.tabId) {
                this.currentTab = e.detail.tabId;
                // Alternar visibilidad de secciones
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                const target = document.getElementById(`view-${this.currentTab}`);
                if(target) target.classList.add('active');
            }
        });

        this.allProjects = state.projects || [];
        this.renderGlobalStats(state);
        this.setupFilters();
        this.renderEcosystemProjects([...this.allProjects].reverse());
        this.renderEtherscan(state);

        document.getElementById('scanSearch')?.addEventListener('input', () => this.renderEtherscan(store.getState()));
        document.getElementById('btnCreateNewNet')?.addEventListener('click', () => window.location.href = '/v5/create');
    }

    setupFilters() {
        const searchInput = document.getElementById('filterSearch');
        const sectorSelect = document.getElementById('filterSector');
        if (!searchInput || !sectorSelect) return;

        const applyFilters = () => {
            const term = searchInput.value.toLowerCase();
            const sector = sectorSelect.value;
            const filtered = this.allProjects.filter(p => {
                const matchName = p.nombre.toLowerCase().includes(term);
                const rawSector = sector.replace('custom_', '');
                const matchSector = sector === 'all' || p.sector === rawSector;
                return matchName && matchSector;
            });
            this.renderEcosystemProjects([...filtered].reverse());
        };

        searchInput.addEventListener('input', applyFilters);
        sectorSelect.addEventListener('change', applyFilters);
    }

    renderGlobalStats(state) {
        let totalProjects = state.projects.length;
        let totalGlobalSlices = 0;
        let users = new Set();
        state.projects.forEach(p => {
            (p.ledger || []).forEach(l => totalGlobalSlices += (l.valorCongelado || 0));
            (p.usuarios || []).forEach(u => users.add(u.id));
        });

        const grid = document.getElementById('globalStatsGrid');
        if(!grid) return;
        grid.innerHTML = `
            <div class="stat-card" style="border-bottom: 3px solid var(--accent-blue);">
                <div class="stat-value" style="color:var(--accent-blue)">${totalProjects}</div>
                <div class="stat-label">REDES ACTIVAS</div>
            </div>
            <div class="stat-card" style="border-bottom: 3px solid var(--accent-green);">
                <div class="stat-value" style="color:var(--accent-green)">${Math.round(totalGlobalSlices).toLocaleString()}</div>
                <div class="stat-label">SLICES EMITIDOS</div>
            </div>
            <div class="stat-card" style="border-bottom: 3px solid var(--accent-purple);">
                <div class="stat-value" style="color:var(--accent-purple)">${users.size}</div>
                <div class="stat-label">NODOS HUMANOS</div>
            </div>
        `;
    }

    renderEcosystemProjects(projectsToRender) {
        const grid = document.getElementById('ecosystemProjectsGrid');
        if(!grid) return;
        grid.innerHTML = projectsToRender.map(p => `
            <div class="project-card" onclick="localStorage.setItem('tt_active_project','${p.id}'); window.location.href='/v5/project'">
                <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                    <h3 style="margin:0; font-size:1.3rem;">${p.nombre}</h3>
                    <span style="font-size:0.6rem; color:var(--accent-blue); font-weight:900; border:1px solid; padding:2px 6px; border-radius:4px;">${p.archetype.toUpperCase()}</span>
                </div>
                <div style="margin-bottom:1.5rem; display:flex; gap:10px;">
                   <span class="tag-pill">#${p.sector}</span>
                   <span class="tag-pill">#${(p.usuarios?.length || 0)} Nodos</span>
                </div>
                <div style="margin-top:auto; padding-top:1rem; border-top:1px dashed #333; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--accent-green); font-weight:bold; font-family:var(--font-mono);">${(p.ledger?.length || 0)} BLOQUES</span>
                    <span style="font-weight:bold; color:white;">ENTRAR &rarr;</span>
                </div>
            </div>
        `).join('');
    }

    renderEtherscan(state) {
        const tbody = document.getElementById('scanTableBody');
        const query = document.getElementById('scanSearch')?.value.toLowerCase() || '';
        if(!tbody) return;

        let allLogs = [];
        state.projects.forEach(p => (p.ledger || []).forEach(l => allLogs.push({...l, pName: p.nombre})));
        allLogs.sort((a,b) => b.timestamp - a.timestamp);

        const filtered = allLogs.filter(l => l.hash.toLowerCase().includes(query) || l.userId.toLowerCase().includes(query) || l.pName.toLowerCase().includes(query));

        tbody.innerHTML = filtered.slice(0, 50).map(l => `
            <tr style="border-bottom: 1px solid #1a1a1a;">
                <td style="padding:15px;"><span class="hash-badge">${l.hash.substring(0,10)}...</span></td>
                <td style="font-weight:bold; color:var(--accent-blue);">${l.pName}</td>
                <td style="color:#666;">${new Date(l.timestamp).toLocaleDateString()}</td>
                <td style="font-weight:bold;">${l.userId}</td>
                <td style="color:#aaa;">${l.description || 'Validación de Valor'}</td>
                <td style="text-align:right; font-weight:900; color:var(--accent-green); font-family:var(--font-mono);">+${Math.round(l.valorCongelado)}</td>
            </tr>
        `).join('');
    }
}
