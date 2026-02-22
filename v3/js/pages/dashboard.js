// dashboard.js
window.renderDashboard = function() {
    const state = window.store?.getState?.() || { projects: [], transactions: [], users: [], roles: [] };
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
                    <div class="metric-value" style="color: #f59e0b">${state.roles.length}</div>
                    <div class="metric-label">Roles</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #ec4899">${state.users.length}</div>
                    <div class="metric-label">Usuarios</div>
                </div>
            </div>
            <p style="margin-top: 20px; color: #10b981; text-align: center;">
                ✅ Store funcionando - ${state.roles.length} roles cargados
            </p>
        </div>
    `;
};
