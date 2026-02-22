// /v3/js/pages/dashboard.js
// Dashboard principal con métricas globales

window.renderDashboard = function() {
    console.log('📊 Renderizando dashboard');
    
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    const metrics = window.Selectors?.getGlobalMetrics?.() || {
        totalProjects: state.projects.length,
        totalUV: 0,
        activeRoles: 0
    };

    return `
        <div class="dashboard">
            <div class="page-header">
                <h1>📊 Dashboard</h1>
                <a href="#" data-page="create-project" class="btn-primary">➕ Nuevo Proyecto</a>
            </div>
            
            <div class="metrics-grid">
                <tt-metric-card 
                    value="${metrics.totalProjects}" 
                    label="Proyectos" 
                    color="var(--tt-primary)">
                </tt-metric-card>
                
                <tt-metric-card 
                    value="${metrics.totalUV}" 
                    label="UV Totales" 
                    color="var(--tt-accent)">
                </tt-metric-card>
                
                <tt-metric-card 
                    value="${metrics.activeRoles}" 
                    label="Roles Activos" 
                    color="var(--color-arquitectura)">
                </tt-metric-card>
                
                <tt-metric-card 
                    value="${state.transactions?.length || 0}" 
                    label="Transacciones" 
                    color="var(--color-testing)">
                </tt-metric-card>
            </div>
            
            <div class="recent-projects">
                <h2>Proyectos Recientes</h2>
                <div class="projects-mini-list">
                    ${renderRecentProjects()}
                </div>
            </div>
            
            <div class="quick-actions">
                <h2>Acciones Rápidas</h2>
                <div class="actions-grid">
                    <button class="action-card" onclick="window.router?.navigate('projects')">
                        <span class="action-icon">📋</span>
                        <span class="action-text">Ver todos los proyectos</span>
                    </button>
                    <button class="action-card" onclick="window.showNewProjectForm()">
                        <span class="action-icon">➕</span>
                        <span class="action-text">Crear proyecto (modal)</span>
                    </button>
                    <button class="action-card" onclick="window.router?.navigate('create-project')">
                        <span class="action-icon">📝</span>
                        <span class="action-text">Crear proyecto (página)</span>
                    </button>
                    <button class="action-card" onclick="window.exportData?.()">
                        <span class="action-icon">📥</span>
                        <span class="action-text">Exportar datos</span>
                    </button>
                </div>
            </div>
        </div>
    `;
};

function renderRecentProjects() {
    const state = window.store?.getState?.() || { projects: [] };
    const projects = state.projects.slice(0, 5); // Últimos 5
    
    if (projects.length === 0) {
        return '<p class="no-data">No hay proyectos aún. ¡Crea uno!</p>';
    }
    
    return projects.map(p => `
        <div class="project-mini-card" onclick="window.router?.navigate('project-detail?id=${encodeURIComponent(p.id)}')">
            <span class="project-mini-icon">${p.sector_emoji || '📁'}</span>
            <div class="project-mini-info">
                <strong>${p.nombre}</strong>
                <small>${p.id}</small>
            </div>
        </div>
    `).join('');
}

window.setupDashboardEvents = function() {
    console.log('⚙️ Configurando eventos del dashboard');
    
    // Asegurar que los enlaces de navegación funcionan
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            if (window.router) {
                window.router.navigate(page);
            }
        });
    });
};

console.log('✅ Dashboard page loaded');
