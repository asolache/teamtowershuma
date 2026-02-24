import { store } from '../core/store.js';

// 🛡️ EVENTOS BLINDADOS PARA EL DASHBOARD
document.addEventListener('click', (e) => {
    // 1. Evento: Crear Proyecto
    if (e.target.id === 'btn-create-project') {
        const name = document.getElementById('new-p-name').value;
        const sector = document.getElementById('new-p-sector').value;
        if (!name) return alert("Por favor, ponle un nombre al Castell");
        
        const id = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        store.dispatch({ 
            type: 'ADD_PROJECT', 
            payload: { id, nombre: name, sector: sector } 
        });
        location.hash = '#/project/' + id;
    }

    // 2. Evento: Navegar al Proyecto (Delegado desde las tarjetas)
    const card = e.target.closest('.project-card');
    if (card) {
        location.hash = card.getAttribute('data-route');
    }
});

export const HomeView = {
    render: () => {
        const state = store.getState();
        const projects = [...(state.projects || [])].reverse();
        
        const sectores = [
            "marketing", "Web3", "gremial", "salud", "educacion", 
            "eventos", "legal", "finanzas", "retail", "turismo"
        ];

        return `
            <div class="container-sm container">
                <header class="header-main" style="border-bottom: none;">
                    <div>
                        <h1>Centro de Mando SOS</h1>
                        <p class="text-muted">Gestión de Resiliencia y Flujo de Valor</p>
                    </div>
                </header>

                <section class="panel" style="margin-bottom: 40px;">
                    <h3>🚀 Levantar Nuevo Castell</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 120px; gap: 15px; align-items: end;">
                        <div>
                            <label class="form-label">Nombre del Ecosistema</label>
                            <input id="new-p-name" type="text" class="form-control" placeholder="Ej: Proyecto Alpha..." style="margin-bottom:0;">
                        </div>
                        <div>
                            <label class="form-label">Sector Operativo</label>
                            <select id="new-p-sector" class="form-control" style="margin-bottom:0; text-transform: capitalize;">
                                ${sectores.map(s => `<option value="${s}">${s}</option>`).join('')}
                            </select>
                        </div>
                        <button id="btn-create-project" class="btn btn-primary btn-block">
                            Inicializar
                        </button>
                    </div>
                </section>

                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <h4 class="text-muted text-uppercase" style="margin-bottom: 0;">Proyectos Activos</h4>
                    
                    ${projects.length === 0 ? '<div class="panel text-center text-muted">No hay Castells levantados todavía.</div>' : 
                        projects.map(p => {
                            const salud = store.calculateResilience(p.id);
                            const colorSalud = salud > 40 ? 'var(--accent-green)' : 'var(--accent-red)';
                            
                            return `
                                <div class="card-interactive project-card" data-route="#/project/${p.id}">
                                    <div>
                                        <h3 style="margin: 0; font-size: 1.2rem;">${p.nombre}</h3>
                                        <div class="text-muted text-uppercase" style="margin-top: 4px;">
                                            Sector: <span class="text-accent">${p.sector}</span>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 15px;">
                                        <div style="text-align: right;">
                                            <div class="text-muted text-uppercase" style="font-size: 0.65rem;">Resiliencia</div>
                                            <div style="color: ${colorSalud}; font-weight: bold; font-size: 1.1rem;">${salud}%</div>
                                        </div>
                                        <span class="text-accent" style="font-size: 1.5rem;">→</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                </div>
            </div>
        `;
    }
};
