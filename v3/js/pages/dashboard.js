window.renderDashboard = function() {
    const state = window.store.getState();
    const totalUV = state.transactions.reduce((s, t) => s + t.uv, 0);
    
    return `
        <div class="card">
            <h2>📊 Dashboard</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">${totalUV}</div>
                    <div class="metric-label">UV Totales</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${state.transactions.length}</div>
                    <div class="metric-label">Transacciones</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${state.projects.length}</div>
                    <div class="metric-label">Proyectos</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${state.users.length}</div>
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
