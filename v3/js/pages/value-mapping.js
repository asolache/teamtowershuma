window.renderValueMapping = function() {
    const state = window.store.getState();
    return `
        <div class="card">
            <h2>🗺️ Value Mapping</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">${state.transactions.length}</div>
                    <div class="metric-label">Transacciones</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${state.projects.length}</div>
                    <div class="metric-label">Proyectos</div>
                </div>
            </div>
            <p style="text-align: center; color: #64748b; margin-top: 30px;">
                Visualización avanzada en desarrollo
            </p>
        </div>
    `;
};
