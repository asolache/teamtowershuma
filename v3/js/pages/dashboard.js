// dashboard.js - VERSIÓN CON VERIFICACIÓN
window.renderDashboard = function() {
    // Verificar que el store existe
    if (!window.store) {
        return `
            <div class="card">
                <h2>❌ Error</h2>
                <p>Store no inicializado. Verifica que store.js se cargó correctamente.</p>
            </div>
        `;
    }
    
    const state = window.store.getState();
    
    // Verificar que hay datos
    if (!state.transactions || state.transactions.length === 0) {
        return `
            <div class="card">
                <h2>📊 Dashboard</h2>
                <p style="color: #f59e0b;">No hay transacciones aún. Generando datos semilla...</p>
            </div>
        `;
    }
    
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
                    <div class="metric-value" style="color: #10b981">${state.projects?.length || 0}</div>
                    <div class="metric-label">Proyectos</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #f59e0b">${state.roles?.length || 0}</div>
                    <div class="metric-label">Roles</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #ec4899">${state.users?.length || 0}</div>
                    <div class="metric-label">Usuarios</div>
                </div>
            </div>
            <p style="margin-top: 20px; color: #10b981; text-align: center;">
                ✅ Datos persistentes - Última actualización: ${new Date().toLocaleTimeString()}
            </p>
        </div>
    `;
};
