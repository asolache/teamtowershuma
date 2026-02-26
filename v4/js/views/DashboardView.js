import { store } from '../core/store.js';

document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-add-project') {
        const id = document.getElementById('new-proj-id').value.trim().toLowerCase().replace(/\s+/g, '-');
        const nombre = document.getElementById('new-proj-name').value.trim();
        const sector = document.getElementById('new-proj-sector').value;

        if (!id || !nombre) return alert("⚠️ Define un identificador y un nombre para el ecosistema.");

        store.dispatch({
            type: 'ADD_PROJECT',
            payload: { id, nombre, sector, ownerId: store.getState().session.activeUserId }
        });
        
        window.location.hash = `#/project/${id}`;
    }
});

export const DashboardView = {
    render: () => {
        const state = store.getState();
        const isAdmin = (state.session?.role || 'admin') === 'admin';
        const activeUserId = state.session.activeUserId;

        // 🚀 BREADCRUMBS GLOBALES
        setTimeout(() => window.setNavbar(
            [{ label: '🏠 Hub de Ecosistemas', hash: '#/' }], 
            ``, `` // Sin botones extra
        ), 0);

        // Filtrar ecosistemas: El Admin ve todos, el Usuario ve solo donde participa
        let visibleProjects = state.projects;
        if (!isAdmin) {
            visibleProjects = state.projects.filter(p => 
                (p.asignaciones || []).some(a => a.userId === activeUserId)
            );
        }

        // Métricas Globales
        const totalEcosystems = visibleProjects.length;
        let totalSlices = 0;
        let totalTxs = 0;
        
        visibleProjects.forEach(p => {
            (p.ledger || []).forEach(l => totalSlices += l.valorCongelado);
            totalTxs += (p.transactions || []).length;
        });

        return `
            <div class="container fade-in">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div class="panel-surface" style="border-top: 4px solid var(--accent-blue); text-align: center;">
                        <div class="text-muted text-small text-uppercase">Ecosistemas Activos</div>
                        <div style="font-size: 2rem; font-weight: bold; color: var(--text-heading);">${totalEcosystems}</div>
                    </div>
                    <div class="panel-surface" style="border-top: 4px solid var(--accent-purple); text-align: center;">
                        <div class="text-muted text-small text-uppercase">Flujos Diseñados (VNA)</div>
                        <div style="font-size: 2rem; font-weight: bold; color: var(--text-heading);">${totalTxs}</div>
                    </div>
                    <div class="panel-surface" style="border-top: 4px solid var(--accent-green); text-align: center;">
                        <div class="text-muted text-small text-uppercase">Valor Total (Slices)</div>
                        <div style="font-size: 2rem; font-weight: bold; color: var(--accent-green);">${totalSlices.toLocaleString()}</div>
                    </div>
                </div>

                <div class="grid-layout" style="${isAdmin ? 'grid-template-columns: 2fr 1fr;' : 'grid-template-columns: 1fr; max-width: 900px; margin: 0 auto;'}">
                    
                    <main>
                        <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                            🌍 Tus Ecosistemas 
                        </h3>
                        
                        ${visibleProjects.length === 0 ? `
                            <div class="panel text-center" style="padding: 40px; border-style: dashed;">
                                <div style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px;">🌱</div>
                                <h4 style="margin: 0; color: var(--text-muted);">No hay ecosistemas activos</h4>
                                ${isAdmin ? '<p class="text-small text-muted">Utiliza el panel lateral para inicializar tu primera red de valor.</p>' : '<p class="text-small text-muted">Aún no has sido invitado a ninguna red de valor.</p>'}
                            </div>
                        ` : `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
                                ${visibleProjects.map(p => {
                                    const res = store.calculateResilience(p.id);
                                    const txCount = (p.transactions || []).length;
                                    const nodeCount = (p.asignaciones || []).length;
                                    const roleCount = (p.roles || []).filter(r => !r.isArchived).length;

                                    return `
                                    <div class="panel-surface" style="border-left: 4px solid var(--accent-blue); display: flex; flex-direction: column; transition: 0.2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                            <div class="badge" style="background: rgba(88,166,255,0.1); color: var(--accent-blue);">${p.sector || 'General'}</div>
                                            <div class="text-small text-muted" style="font-family: monospace;">ID: ${p.id}</div>
                                        </div>
                                        <h3 style="margin: 0 0 10px 0; color: var(--text-heading);">${p.nombre}</h3>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 0.8rem; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">
                                            <div>👥 ${nodeCount} / ${roleCount} Nodos</div>
                                            <div>📈 ${txCount} Flujos</div>
                                            <div style="grid-column: span 2; display:flex; align-items:center; gap:5px;">
                                                ❤️ Salud de Red: <b style="color:${res < 50 ? 'var(--accent-red)' : 'var(--accent-green)'}">${res}%</b>
                                            </div>
                                        </div>
                                        <div style="margin-top: auto;">
                                            <a href="#/project/${p.id}" class="btn btn-primary btn-block" style="text-decoration: none;">Entrar a la Red ➔</a>
                                        </div>
                                    </div>`;
                                }).join('')}
                            </div>
                        `}
                    </main>

                    ${isAdmin ? `
                        <aside>
                            <div class="panel" style="position: sticky; top: 130px; border-color: var(--accent-green);">
                                <h3 style="margin-top: 0; color: var(--accent-green);">🌱 Inicializar Ecosistema</h3>
                                <p class="text-small text-muted">Crea una nueva red de valor e inyecta la ontología base (Sectores y Roles).</p>
                                
                                <label class="form-label">ID Único (Sin espacios):</label>
                                <input type="text" id="new-proj-id" class="form-control" placeholder="Ej: dao-huma">
                                
                                <label class="form-label">Nombre del Ecosistema:</label>
                                <input type="text" id="new-proj-name" class="form-control" placeholder="Ej: Proyecto HUMA">
                                
                                <label class="form-label">Ontología Inicial (Sector):</label>
                                <select id="new-proj-sector" class="form-control">
                                    ${Object.keys(state.ontology.sectores).map(s => `<option value="${s}">${s.toUpperCase()}</option>`).join('')}
                                </select>
                                
                                <button id="btn-add-project" class="btn btn-primary btn-block" style="margin-top: 15px;">Diseñar Red</button>
                            </div>
                        </aside>
                    ` : ''}

                </div>
            </div>
        `;
    }
};
