// dashboard.js - Versión simplificada
window.renderDashboard = function() {
    const metrics = window.Selectors.getGlobalMetrics();
    const state = window.store.getState();
    
    // Datos para gráfico
    const activeProjects = state.projects.filter(p => 
        state.transactions.some(t => t.project === p.id)
    );
    
    const pieData = activeProjects.map(p => ({
        label: p.id,
        value: window.Selectors.getTotalUVByProject(p.id),
        color: p.id === '#kernel' ? '#2563eb' : 
               p.id === '#paper' ? '#8b5cf6' : '#10b981'
    }));

    return `
        <div class="card">
            <h2>Dashboard</h2>
            
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value" style="color: #2563eb">${metrics.totalUV}</div>
                    <div class="metric-label">UV Totales</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #8b5cf6">${metrics.totalTransactions}</div>
                    <div class="metric-label">Transacciones</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #10b981">${metrics.totalProjects}</div>
                    <div class="metric-label">Total Proyectos</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #f59e0b">${metrics.activeProjects}</div>
                    <div class="metric-label">Proyectos Activos</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>📊 Distribución por Proyecto</h2>
            ${pieData.length > 0 ? `
                <div style="height: 200px; display: flex; align-items: flex-end; gap: 20px; margin-top: 20px;">
                    ${pieData.map(item => `
                        <div style="flex: 1; text-align: center;">
                            <div style="height: ${item.value / 10}px; background: ${item.color}; border-radius: 8px 8px 0 0;"></div>
                            <div style="margin-top: 8px; font-weight: bold;">${item.label}</div>
                            <div style="font-size: 12px; color: #64748b;">${item.value} UV</div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p>No hay datos</p>'}
        </div>

        <div class="card">
            <h2>📋 Últimas Transacciones</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Proyecto</th>
                        <th>Rol</th>
                        <th>UV</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.transactions.slice(0, 5).map(t => `
                        <tr>
                            <td>${t.name}</td>
                            <td>${t.project}</td>
                            <td>${t.role}</td>
                            <td>${t.uv}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

window.setupDashboardEvents = function() {
    console.log('Dashboard events ready');
};