// v5/js/views/HomeView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';

export default class HomeView {
    constructor() {
        document.title = "Ecosistema | TeamTowers SOS";
        this.currentTab = 'proyectos'; 
        this.allProjects = [];
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const config = state.config;

        // Fallback para invitados o admin inicial
        if (!activeUserId || activeUserId === 'ecosystem-admin' || state.session.role === 'guest') {
            return this.getLandingHtml();
        }

        // Configuración de Pestañas (Design System V12)
        const headerConfig = {
            title: config.ecosystemName || "TeamTowers Network",
            subtitle: "Macro-Red",
            tagline: "Panel de control del Ecosistema y Gobernanza Fractal.",
            tabs: [
                { id: 'proyectos', label: '🪐 Redes', active: this.currentTab === 'proyectos' },
                { id: 'identidad', label: '📜 Misión', active: this.currentTab === 'identidad' },
                { id: 'explorador', label: '🔎 Etherscan', active: this.currentTab === 'explorador' },
                { id: 'mapa', label: '🕸️ VNA Macro', active: this.currentTab === 'mapa' }
            ]
        };

        const isEcosystemOwner = state.session.role === 'ecosystem-owner' || config.allowUserCreation;

        // Carga de Sectores para el buscador
        const customSectores = state.ontology?.sectores || {};
        let sectorOptions = `<option value="all">🌐 Todos los Sectores</option>`;
        if (Object.keys(customSectores).length > 0) {
            sectorOptions += `<optgroup label="🌟 Tus Plantillas">`;
            Object.keys(customSectores).forEach(k => { if(k !== '_meta') sectorOptions += `<option value="custom_${k}">${k.toUpperCase()}</option>`; });
            sectorOptions += `</optgroup>`;
        }
        sectorOptions += `<optgroup label="📦 Catálogo V10">`;
        Object.keys(GLOBAL_ONTOLOGY).forEach(k => { if(k !== '_meta') sectorOptions += `<option value="${k}">${k.replace(/_/g, ' ').toUpperCase()}</option>`; });
        sectorOptions += `</optgroup>`;

        return `
            <div class="app-layout">
                ${Sidebar.getHtml('/')}

                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-proyectos" class="tab-content ${this.currentTab === 'proyectos' ? 'active' : ''}">
                        <div class="toolbar-lux" style="display: flex; gap: 15px; margin-bottom: 2rem; background: rgba(255,255,255,0.02); padding: 15px; border-radius: 16px; border: 1px solid var(--glass-border); align-items: center; flex-wrap: wrap;">
                            <div style="display: flex; gap: 10px; flex: 1; min-width: 300px;">
                                <input type="text" id="filterSearch" class="form-control" placeholder="🔍 Buscar red..." style="flex: 2;">
                                <select id="filterSector" class="form-control" style="flex: 1;">${sectorOptions}</select>
                            </div>
                            ${isEcosystemOwner ? `<button class="btn-primary" id="btnCreateNewNet">➕ Instanciar Red</button>` : ''}
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;" id="ecosystemProjectsGrid"></div>
                    </div>

                    <div id="view-identidad" class="tab-content ${this.currentTab === 'identidad' ? 'active' : ''}">
                        <div class="panel" style="background: rgba(255,255,255,0.015); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2.5rem;">
                            <h2 style="margin-top:0;">📊 Estado de la Red</h2>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;" id="globalStatsGrid"></div>
                            
                            <h2 style="border-top: 1px solid #222; padding-top: 2rem;">📜 System Prompt / Misión</h2>
                            <p style="font-family: var(--font-mono); color: #888; background: rgba(0,0,0,0.4); padding: 20px; border-radius: 12px; border: 1px dashed #444;">
                                ${config.globalPrompt || "Definiendo propósito del ecosistema..."}
                            </p>
                        </div>
                    </div>

                    <div id="view-explorador" class="tab-content ${this.currentTab === 'explorador' ? 'active' : ''}">
                        <div class="panel" style="background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem;">
                            <div style="display:flex; justify-content:space-between; margin-bottom:1.5rem; align-items:center;">
                                <h2 style="margin:0;">🔎 Ledger Global</h2>
                                <input type="text" id="scanSearch" class="form-control" placeholder="Buscar Hash o Usuario..." style="width:300px;">
                            </div>
                            <div style="overflow-x: auto; border-radius: 12px; border: 1px solid #222;">
                                <table class="ledger-table" style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.85rem; min-width: 800px;">
                                    <thead><tr style="text-align: left; color: var(--accent-blue); border-bottom: 2px solid #222;"><th style="padding:15px;">HASH</th><th>PROYECTO</th><th>NODO</th><th>VALOR</th><th style="text-align:right; padding-right:15px;">TIMESTAMP</th></tr></thead>
                                    <tbody id="scanTableBody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div id="view-mapa" class="tab-content ${this.currentTab === 'mapa' ? 'active' : ''}">
                        <div style="text-align: center; padding: 5rem; color: #444; border: 2px dashed #222; border-radius: 24px;">
                            <div style="font-size: 4rem; margin-bottom: 1rem;">🕸️</div>
                            <h2 style="color: white;">Macro-Topología P2P</h2>
                            <p>En la V12, este lienzo conectará los Ecosistemas mediante protocolos de valor cruzado.</p>
                        </div>
                    </div>

                </main>
                ${BottomNav.getHtml('/')}
            </div>
        `;
    }

    getLandingHtml() {
        return `
            <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-dark); text-align: center;">
                <div>
                    <h1 style="font-size: 3.5rem; letter-spacing: -2px; margin-bottom: 1rem;">TeamTowers <span style="color:var(--accent-blue);">SOS</span></h1>
                    <p style="color: #666; margin-bottom: 3rem;">Iniciando Exoesqueleto Cognitivo...</p>
                    <a href="/v5/" data-link class="btn-primary" style="padding: 15px 40px; font-size: 1.1rem; text-decoration:none;">CONECTAR NODO</a>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        if (!state.session.activeUserId || state.session.role === 'guest') return;

        Sidebar.initListeners();
        PageHeader.execute();

        // LÓGICA DRY DE TABS (ESCUCHA EVENTO GLOBAL)
        window.addEventListener('ph-tab-changed', (e) => {
            if (e.detail && e.detail.tabId) {
                this.currentTab = e.detail.tabId;
                // No hace falta redibujar todo, las clases 'active' las maneja el DOM si usas IDs estándar, 
                // pero aquí forzamos render de componentes internos.
                if (this.currentTab === 'explorador') this.renderEtherscan();
            }
        });

        this.allProjects = state.projects || [];
        this.renderGlobalStats(state);
        this.renderEcosystemProjects([...this.allProjects].reverse());
        this.renderEtherscan();
        this.setupFilters();

        document.getElementById('btnCreateNewNet')?.addEventListener('click', () => window.location.href = '/v5/create');
    }

    setupFilters() {
        const apply = () => {
            const term = document.getElementById('filterSearch').value.toLowerCase();
            const sector = document.getElementById('filterSector').value;
            const arch = document.getElementById('filterArch')?.value || 'all';

            const filtered = this.allProjects.filter(p => {
                const matchName = p.nombre.toLowerCase().includes(term);
                const rawSector = sector.replace('custom_', '');
                const matchSector = sector === 'all' || p.sector === rawSector;
                return matchName && matchSector;
            });
            this.renderEcosystemProjects([...filtered].reverse());
        };

        document.getElementById('filterSearch')?.addEventListener('input', apply);
        document.getElementById('filterSector')?.addEventListener('change', apply);
        document.getElementById('scanSearch')?.addEventListener('input', () => this.renderEtherscan());
    }

    renderGlobalStats(state) {
        let totalSlices = 0;
        let users = new Set();
        state.projects.forEach(p => {
            (p.ledger || []).forEach(l => totalSlices += (l.valorCongelado || 0));
            (p.usuarios || []).forEach(u => users.add(u.id));
        });

        const grid = document.getElementById('globalStatsGrid');
        if(!grid) return;
        grid.innerHTML = `
            <div style="background:rgba(0,0,0,0.4); padding:20px; border-radius:12px; border:1px solid #222; text-align:center;">
                <div style="font-size:2rem; font-weight:900; color:var(--accent-blue);">${state.projects.length}</div>
                <div style="font-size:0.7rem; color:#666; font-weight:bold;">REDES ACTIVAS</div>
            </div>
            <div style="background:rgba(0,0,0,0.4); padding:20px; border-radius:12px; border:1px solid #222; text-align:center;">
                <div style="font-size:2rem; font-weight:900; color:var(--accent-green);">${Math.round(totalSlices).toLocaleString()}</div>
                <div style="font-size:0.7rem; color:#666; font-weight:bold;">SLICES EMITIDOS</div>
            </div>
            <div style="background:rgba(0,0,0,0.4); padding:20px; border-radius:12px; border:1px solid #222; text-align:center;">
                <div style="font-size:2rem; font-weight:900; color:var(--accent-purple);">${users.size}</div>
                <div style="font-size:0.7rem; color:#666; font-weight:bold;">NODOS HUMANOS</div>
            </div>
        `;
    }

    renderEcosystemProjects(list) {
        const grid = document.getElementById('ecosystemProjectsGrid');
        if(!grid) return;
        grid.innerHTML = list.map(p => `
            <div class="project-card" onclick="localStorage.setItem('tt_active_project','${p.id}'); window.location.href='/v5/project'">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:1rem;">
                    <h3 style="margin:0; font-size:1.3rem;">${p.nombre}</h3>
                    <span style="font-size:0.6rem; padding:4px 8px; border-radius:6px; background:rgba(0,176,255,0.1); color:var(--accent-blue); font-weight:900;">${p.archetype.toUpperCase()}</span>
                </div>
                <div style="display:flex; gap:8px; margin-bottom:1.5rem;">
                    <span style="font-size:0.7rem; color:#666;">#${p.sector}</span>
                    <span style="font-size:0.7rem; color:#666;">#${p.usuarios?.length || 0}Nodos</span>
                </div>
                <div style="margin-top:auto; padding-top:1rem; border-top:1px dashed #333; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--accent-green); font-weight:bold; font-size:0.8rem;">${(p.ledger?.length || 0)} Bloques</span>
                    <span style="font-weight:bold; font-size:0.8rem; color:white;">ENTRAR &rarr;</span>
                </div>
            </div>
        `).join('');
    }

    renderEtherscan() {
        const body = document.getElementById('scanTableBody');
        const query = document.getElementById('scanSearch')?.value.toLowerCase() || '';
        if(!body) return;

        let allLogs = [];
        store.getState().projects.forEach(p => {
            (p.ledger || []).forEach(l => allLogs.push({...l, pName: p.nombre}));
        });

        allLogs.sort((a,b) => b.timestamp - a.timestamp);
        const filtered = allLogs.filter(l => l.hash.toLowerCase().includes(query) || l.userId.toLowerCase().includes(query) || l.pName.toLowerCase().includes(query));

        body.innerHTML = filtered.slice(0, 50).map(l => `
            <tr style="border-bottom: 1px solid #1a1a1a;">
                <td style="padding:15px; color:#444;">${l.hash.substring(0,12)}...</td>
                <td style="font-weight:bold; color:var(--accent-blue);">${l.pName}</td>
                <td>${l.userId}</td>
                <td style="color:var(--accent-green); font-weight:900;">+${Math.round(l.valorCongelado)}</td>
                <td style="text-align:right; color:#444; padding-right:15px;">${new Date(l.timestamp).toLocaleTimeString()}</td>
            </tr>
        `).join('');
    }
}
