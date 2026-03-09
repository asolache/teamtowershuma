// v5/js/views/NetworkView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class NetworkView {
    constructor() {
        document.title = "Ecosistema DAO | TeamTowers";
        this.allProjects = [];
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', sans-serif; }
                
                /* Workspace Central */
                .workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; flex-direction: column; }
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;}
                .view-header h1 { font-size: 2.5rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: #888; font-size: 1rem; margin-top: 5px; }

                /* BARRA DE FILTROS */
                .filter-bar { display: flex; gap: 15px; margin-bottom: 2rem; background: rgba(255,255,255,0.02); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); flex-wrap: wrap; align-items: center;}
                .form-control { background: #050505; border: 1px solid #333; color: white; padding: 10px 15px; border-radius: 8px; font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
                .form-control:focus { border-color: #00b0ff; }
                .filter-search { flex: 2; min-width: 200px; }
                .filter-select { flex: 1; min-width: 150px; }

                /* GRID DE PROYECTOS (ECOSISTEMA) */
                .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
                
                .project-card {
                    background: #121216; border: 1px solid #222; border-radius: 16px; padding: 1.5rem;
                    display: flex; flex-direction: column; transition: all 0.3s ease; position: relative; overflow: hidden;
                }
                .project-card:hover { transform: translateY(-5px); border-color: #00b0ff; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                
                /* Decoración de fondo de la tarjeta */
                .card-bg-glow { position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(0, 176, 255, 0.1) 0%, transparent 70%); border-radius: 50%; z-index: 0; pointer-events: none;}
                
                .card-header { display: flex; justify-content: space-between; align-items: flex-start; z-index: 1; margin-bottom: 1.5rem;}
                .card-title { font-size: 1.4rem; color: white; margin: 0 0 5px 0; font-weight: 800; letter-spacing: -0.5px;}
                .card-arch { font-size: 0.65rem; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                .arch-startup { background: rgba(0, 230, 118, 0.1); color: #00e676; border: 1px solid rgba(0, 230, 118, 0.3); }
                .arch-dao { background: rgba(224, 64, 251, 0.1); color: #e040fb; border: 1px solid rgba(224, 64, 251, 0.3); }
                .arch-corporate { background: rgba(0, 176, 255, 0.1); color: #00b0ff; border: 1px solid rgba(0, 176, 255, 0.3); }

                .card-sector { color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }

                .card-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; z-index: 1; padding-top: 1rem; border-top: 1px solid #222;}
                .metric { display: flex; flex-direction: column; }
                .metric-val { font-size: 1.5rem; color: white; font-family: monospace; font-weight: bold; }
                .metric-label { font-size: 0.7rem; color: #666; text-transform: uppercase; }

                .btn-enter { background: #00b0ff; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; text-align: center; text-decoration: none; transition: background 0.2s; z-index: 1; }
                .btn-enter:hover { background: #0091ea; }
                
                .empty-hub { grid-column: 1 / -1; text-align: center; padding: 5rem 2rem; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1); color: #888; }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/network')}

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1>Ecosistema de Redes</h1>
                            <p>Explora los Castells activos, analiza su madurez y solicita unirte a su cadena de valor.</p>
                        </div>
                    </div>

                    <div class="filter-bar" id="filterBar" style="display: none;">
                        <input type="text" id="filterSearch" class="form-control filter-search" placeholder="🔍 Buscar red por nombre...">
                        <select id="filterSector" class="form-control filter-select">
                            <option value="all">🌐 Todos los Sectores</option>
                        </select>
                        <select id="filterArch" class="form-control filter-select">
                            <option value="all">🏛️ Todos los Arquetipos</option>
                        </select>
                    </div>

                    <div class="projects-grid" id="hubGrid">
                        </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

        const state = store.getState();
        this.allProjects = state.projects || [];
        this.grid = document.getElementById('hubGrid');
        const filterBar = document.getElementById('filterBar');

        if (this.allProjects.length === 0) {
            this.grid.innerHTML = `
                <div class="empty-hub">
                    <h2 style="color: white; margin-bottom: 10px;">El Ecosistema está vacío</h2>
                    <p>Sé el primero en levantar un Castell. Instancia una red para empezar.</p>
                    <a href="/v5/create" class="btn-enter" data-link style="display: inline-block; margin-top: 15px; background: #00e676; color: black;">Crear Proyecto</a>
                </div>
            `;
            return;
        }

        // Si hay proyectos, mostramos la barra de filtros y la configuramos
        filterBar.style.display = 'flex';
        this.setupFilters();

        // Renderizamos por defecto todos los proyectos (invertidos, el más nuevo primero)
        this.renderProjects([...this.allProjects].reverse());
    }

    setupFilters() {
        const searchInput = document.getElementById('filterSearch');
        const sectorSelect = document.getElementById('filterSector');
        const archSelect = document.getElementById('filterArch');

        // Autocompletar Sectores existentes
        const uniqueSectors = [...new Set(this.allProjects.map(p => p.sector || 'General'))];
        uniqueSectors.forEach(sec => {
            sectorSelect.innerHTML += `<option value="${sec}">${sec.replace(/_/g, ' ').toUpperCase()}</option>`;
        });

        // Autocompletar Arquetipos existentes
        const uniqueArchs = [...new Set(this.allProjects.map(p => p.archetype || 'startup'))];
        uniqueArchs.forEach(arc => {
            archSelect.innerHTML += `<option value="${arc}">${arc.toUpperCase()}</option>`;
        });

        // Motor de filtrado
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

            this.renderProjects([...filtered].reverse());
        };

        // Listeners reactivos
        searchInput.addEventListener('input', applyFilters);
        sectorSelect.addEventListener('change', applyFilters);
        archSelect.addEventListener('change', applyFilters);
    }

    renderProjects(projectsToRender) {
        this.grid.innerHTML = '';

        if (projectsToRender.length === 0) {
            this.grid.innerHTML = `<div class="empty-hub" style="grid-column: 1 / -1;"><p>No se encontraron redes con esos filtros.</p></div>`;
            return;
        }

        projectsToRender.forEach(p => {
            
            // 1. Calcular Datos del Proyecto
            const maturity = store.calculateMaturityIndex(p.id);
            const harvest = store.calculateHarvest(p.id);
            const totalSlices = harvest.reduce((sum, h) => sum + h.slices, 0);
            
            // Colores del arquetipo
            let archClass = 'arch-startup';
            if(p.archetype === 'dao') archClass = 'arch-dao';
            if(p.archetype === 'corporate' || p.archetype === 'corp') archClass = 'arch-corporate';

            // Color del Maturity Index
            let matColor = '#ff5252'; // Rojo
            if (maturity.score >= 40) matColor = '#ff9100'; // Naranja
            if (maturity.score >= 80) matColor = '#00e676'; // Verde

            const card = document.createElement('div');
            card.className = 'project-card';
            
            card.innerHTML = `
                <div class="card-bg-glow"></div>
                
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${p.nombre}</h3>
                        <div class="card-sector">${(p.sector || 'General').replace(/_/g, ' ')}</div>
                    </div>
                    <div class="card-arch ${archClass}">${p.archetype}</div>
                </div>

                <div class="card-metrics">
                    <div class="metric">
                        <div class="metric-val" style="color: ${matColor};">${maturity.score}%</div>
                        <div class="metric-label">Maturity Index</div>
                    </div>
                    <div class="metric">
                        <div class="metric-val">${Math.round(totalSlices).toLocaleString()}</div>
                        <div class="metric-label">Slices (Equity)</div>
                    </div>
                    <div class="metric">
                        <div class="metric-val" style="color: #ccc;">${(p.roles || []).filter(r => !r.isArchived).length}</div>
                        <div class="metric-label">Nodos Base</div>
                    </div>
                    <div class="metric">
                        <div class="metric-val" style="color: #ccc;">${(p.usuarios || []).length}</div>
                        <div class="metric-label">Tripulantes</div>
                    </div>
                </div>

                <button class="btn-enter btn-enter-action" data-id="${p.id}">Entrar al Castell &rarr;</button>
            `;

            this.grid.appendChild(card);
        });

        // Evento para "Entrar" a un proyecto específico
        document.querySelectorAll('.btn-enter-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.getAttribute('data-id');
                this.setActiveProjectAndNavigate(targetId);
            });
        });
    }

    // 🔥 TRUCO DEL ALMENDRUCO (WORKAROUND SPA) 🔥
    setActiveProjectAndNavigate(projectId) {
        const state = store.getState();
        const pIndex = state.projects.findIndex(p => p.id === projectId);
        
        if (pIndex !== -1 && pIndex !== state.projects.length - 1) {
            // Sacamos el proyecto de su sitio y lo ponemos al final
            const p = state.projects[pIndex];
            const updatedProjects = [...state.projects];
            updatedProjects.splice(pIndex, 1);
            updatedProjects.push(p);

            // Inyectamos el array ordenado directamente en el estado y guardamos
            store.state.projects = updatedProjects;
            localStorage.setItem('tt_sos_state', JSON.stringify(store.state));
        }

        // Viajamos al Kanban (Tracción)
        window.location.href = '/v5/project';
    }
}
