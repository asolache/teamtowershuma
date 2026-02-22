// value-mapping.js - DEFINICIÓN GLOBAL
window.renderValueMapping = function() {
    console.log('🗺️ Renderizando value mapping...');
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    
    return `
        <div class="card">
            <h2>🗺️ Value Mapping</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value" style="color: #2563eb">${state.transactions.length}</div>
                    <div class="metric-label">Transacciones</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #8b5cf6">${state.projects.length}</div>
                    <div class="metric-label">Proyectos</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #10b981">${state.users?.length || 0}</div>
                    <div class="metric-label">Usuarios</div>
                </div>
            </div>
            <p style="text-align: center; color: #64748b; margin-top: 30px; padding: 30px; background: #f8fafc; border-radius: 16px;">
                🗺️ Visualización avanzada en desarrollo<br>
                <small>Próximamente: mapa interactivo de valor</small>
            </p>
        </div>
    `;
};

window.setupValueMappingEvents = function() {
    console.log('🗺️ Value Mapping eventos listos');
};

console.log('✅ Value Mapping cargado globalmente');window.renderValueMapping = function() {
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
