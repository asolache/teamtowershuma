// /v3/js/pages/dashboard.js
window.renderDashboard = function() {
    console.log('📊 Renderizando dashboard v3.5');
    
    // Fallback seguro si el store no ha cargado aún
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    const metrics = window.Selectors?.getGlobalMetrics?.() || {
        totalProjects: state.projects?.length || 0,
        totalUV: 0,
        totalUsers: 0
    };

    return `
        <div class="dashboard">
            <div class="page-header">
                <h1>📊 Ecosistema Global</h1>
                <button onclick="window.router.navigate('create-project')" class="btn-primary">➕ Nuevo Proyecto</button>
            </div>
            
            <div class="metrics-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                <div class="card" style="text-align:center"><h2>${metrics.totalProjects}</h2><p>Proyectos</p></div>
                <div class="card" style="text-align:center"><h2>${metrics.totalUV}</h2><p>Valor (UV)</p></div>
                <div class="card" style="text-align:center"><h2>${state.transactions?.length || 0}</h2><p>Flujos</p></div>
            </div>
            
            <div class="recent-projects card">
                <h2>Proyectos Recientes</h2>
                <div class="projects-mini-list">
                    ${state.projects.length > 0 ? state.projects.slice(-3).reverse().map(p => `
                        <div class="project-mini-card" style="cursor:pointer; padding: 10px; border-bottom: 1px solid #333" 
                             onclick="window.router.navigate('project-detail?id=${encodeURIComponent(p.id)}')">
                            <strong>${p.sector_emoji || '📁'} ${p.nombre}</strong> <small>(${p.id})</small>
                        </div>
                    `).join('') : '<p>No hay proyectos activos.</p>'}
                </div>
            </div>
        </div>
    `;
};

window.setupDashboardEvents = function() {
    console.log('⚙️ Eventos Dashboard OK');
};
