// dashboard.js - Vista principal del dashboard
// TeamTowers Humà v3.3 - Estilo global

window.renderDashboard = function() {
    try {
        console.log('📊 Renderizando dashboard...');
        
        // Obtener datos con fallbacks seguros
        const state = window.store?.getState?.() || { 
            projects: [], 
            transactions: [],
            users: []
        };
        
        const projects = state.projects || [];
        const transactions = state.transactions || [];
        
        // Calcular métricas
        const totalUV = transactions.reduce((sum, t) => sum + (t.uv || 0), 0);
        const totalTransactions = transactions.length;
        const totalProjects = projects.length;
        const activeProjects = new Set(transactions.map(t => t.project)).size;
        const totalUsers = (state.users || []).length;
        
        // Datos para el gráfico - SOLO proyectos con actividad
        const activeProjectsList = projects.filter(p => 
            transactions.some(t => t.project === p.id)
        );
        
        const pieData = activeProjectsList.map(p => {
            const uv = transactions
                .filter(t => t.project === p.id)
                .reduce((sum, t) => sum + (t.uv || 0), 0);
            return {
                label: p.id,
                value: uv,
                color: p.id === '#kernel' ? '#2563eb' : 
                       p.id === '#paper' ? '#8b5cf6' : 
                       p.id === '#vna-app' ? '#10b981' : '#f59e0b'
            };
        });

        return `
            <div class="card">
                <h2>📊 Dashboard</h2>
                
                <!-- Filtros -->
                <tt-filter-bar 
                    id="dashboard-filters"
                    filters='${JSON.stringify([
                        { type: 'select', key: 'project', label: 'Proyecto', 
                          options: [
                              { value: 'all', label: 'Todos' },
                              ...projects.map(p => ({ value: p.id, label: p.name }))
                          ]}
                    ])}'>
                </tt-filter-bar>

                <!-- Métricas -->
                <div class="metric-grid" id="dashboard-metrics">
                    <tt-metric-card id="metric-uv" value="${totalUV}" label="UV Totales" color="#2563eb" icon="💰" action="transactions"></tt-metric-card>
                    <tt-metric-card id="metric-tx" value="${totalTransactions}" label="Transacciones" color="#8b5cf6" icon="📊" action="transactions"></tt-metric-card>
                    <tt-metric-card id="metric-projects" value="${totalProjects}" label="Total Proyectos" color="#10b981" icon="📋" action="projects"></tt-metric-card>
                    <tt-metric-card id="metric-active" value="${activeProjects}" label="Proyectos Activos" color="#3b82f6" icon="🔥" action="active-projects"></tt-metric-card>
                    <tt-metric-card id="metric-users" value="${totalUsers}" label="Usuarios" color="#8b5cf6" icon="👥" action="users"></tt-metric-card>
                </div>
            </div>

            <!-- Gráfico -->
            <div class="card">
                <h2>📊 Distribución por Proyecto</h2>
                ${pieData.length > 0 ? `
                    <tt-pie-chart 
                        id="dashboard-pie"
                        data='${JSON.stringify(pieData)}'
                        width="300"
                        height="300">
                    </tt-pie-chart>
                ` : `
                    <div style="text-align: center; padding: 40px; background: #f8fafc; border-radius: 16px;">
                        <p>No hay datos de actividad para mostrar</p>
                    </div>
                `}
            </div>

            <!-- Tabla de transacciones recientes -->
            <div class="card">
                <h2>📋 Últimas Transacciones</h2>
                <tt-data-table 
                    id="dashboard-table"
                    data='${JSON.stringify(transactions.slice(0, 5))}'
                    columns='${JSON.stringify([
                        { key: 'name', label: 'Nombre' },
                        { key: 'project', label: 'Proyecto' },
                        { key: 'role', label: 'Rol' },
                        { key: 'user', label: 'Usuario' },
                        { key: 'uv', label: 'UV', type: 'number' }
                    ])}'>
                </tt-data-table>
            </div>
        `;
    } catch (e) {
        console.error('❌ Error en renderDashboard:', e);
        return `<div class="loading">Error al cargar dashboard: ${e.message}</div>`;
    }
};

window.setupDashboardEvents = function() {
    try {
        console.log('🔧 Configurando eventos de dashboard...');
        
        // Filtros
        const filterBar = document.getElementById('dashboard-filters');
        if (filterBar) {
            filterBar.addEventListener('filter-change', (e) => {
                console.log('📌 Filtros aplicados:', e.detail);
            });
        }

        // Métricas click
        const metrics = document.querySelectorAll('#dashboard-metrics tt-metric-card');
        metrics.forEach(metric => {
            metric.addEventListener('metric-click', (e) => {
                const action = e.detail.action;
                if (action === 'projects') {
                    window.router?.navigate('projects');
                } else if (action === 'users') {
                    window.router?.navigate('users');
                }
            });
        });

        // Tabla row click
        const table = document.getElementById('dashboard-table');
        if (table) {
            table.addEventListener('row-click', (e) => {
                console.log('📄 Transacción seleccionada:', e.detail);
                // Navegar a detalle de transacción (cuando exista)
            });
        }

        // Gráfico slice click
        const pie = document.getElementById('dashboard-pie');
        if (pie) {
            pie.addEventListener('slice-click', (e) => {
                const slice = e.detail;
                window.router?.navigate('project', slice.label);
            });
        }
        
        console.log('✅ Eventos de dashboard configurados');
    } catch (e) {
        console.error('❌ Error en setupDashboardEvents:', e);
    }
};

console.log('✅ Dashboard cargado globalmente');