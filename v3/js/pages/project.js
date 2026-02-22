// project.js - DEFINICIÓN GLOBAL
window.renderProject = function(projectId) {
    console.log('📁 Renderizando proyecto:', projectId);
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    
    const project = state.projects.find(p => p.id === projectId) || { id: projectId, name: projectId };
    const transactions = state.transactions.filter(t => t.project === projectId);
    const totalUV = transactions.reduce((s, t) => s + (t.uv || 0), 0);
    
    return `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>📁 ${project.name || projectId}</h2>
                <button onclick="window.router?.navigate('projects')" class="btn-back" style="padding: 8px 16px; background: #f1f5f9; border: none; border-radius: 30px; cursor: pointer;">← Volver</button>
            </div>
            
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value" style="color: #2563eb">${totalUV}</div>
                    <div class="metric-label">UV Total</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #8b5cf6">${transactions.length}</div>
                    <div class="metric-label">Transacciones</div>
                </div>
            </div>
            
            <h3>📋 Transacciones</h3>
            <table class="data-table">
                <thead>
                    <tr><th>Nombre</th><th>Rol</th><th>Usuario</th><th>UV</th></tr>
                </thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr>
                            <td>${t.name || 'Sin nombre'}</td>
                            <td>${t.role || '—'}</td>
                            <td>${t.user || '—'}</td>
                            <td style="color: #2563eb; font-weight: bold;">${t.uv || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

window.setupProjectEvents = function() {
    console.log('✅ Proyecto eventos listos');
};

console.log('✅ Project cargado globalmente');
