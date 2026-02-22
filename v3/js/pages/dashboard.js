// dashboard.js - DEFINICIÓN GLOBAL
window.renderDashboard = function() {
    console.log('📊 Renderizando dashboard...');
    const state = window.store?.getState?.() || { projects: [], transactions: [], users: [] };
    
    const totalUV = state.transactions.reduce((s, t) => s + (t.uv || 0), 0);
    
    return `
        <div class="card">
            <h2>📊 Dashboard</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value" style="color: #2563eb">${totalUV}</div>
                    <div class="metric-label">UV Totales</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #8b5cf6">${state.transactions.length}</div>
                    <div class="metric-label">Transacciones</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #10b981">${state.projects.length}</div>
                    <div class="metric-label">Proyectos</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #f59e0b">${state.users.length}</div>
                    <div class="metric-label">Usuarios</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>📋 Últimas Transacciones</h2>
            <table class="data-table">
                <thead>
                    <tr><th>Nombre</th><th>Proyecto</th><th>Rol</th><th>UV</th></tr>
                </thead>
                <tbody>
                    ${state.transactions.slice(-5).reverse().map(t => `
                        <tr>
                            <td>${t.name || 'Sin nombre'}</td>
                            <td>${t.project || '—'}</td>
                            <td>${t.role || '—'}</td>
                            <td style="color: #2563eb; font-weight: bold;">${t.uv || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

window.setupDashboardEvents = function() {
    console.log('✅ Dashboard eventos listos');
};

console.log('✅ Dashboard cargado globalmente');
