// project.js
window.renderProject = function(projectId) {
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    const project = state.projects.find(p => p.id === projectId) || { id: projectId, name: projectId };
    const transactions = state.transactions.filter(t => t.project === projectId);
    const totalUV = transactions.reduce((s, t) => s + t.uv, 0);
    
    return `
        <div class="card">
            <div style="display: flex; justify-content: space-between;">
                <h2>📁 ${project.name}</h2>
                <button onclick="window.router?.navigate('projects')">← Volver</button>
            </div>
            <div class="metric-grid">
                <div class="metric-card"><div class="metric-value">${totalUV}</div><div>UV Total</div></div>
                <div class="metric-card"><div class="metric-value">${transactions.length}</div><div>Transacciones</div></div>
            </div>
            <tt-pinya-visual project-id="${projectId}"></tt-pinya-visual>
            <h3>📋 Transacciones</h3>
            <table class="data-table">
                <thead><tr><th>Nombre</th><th>Rol</th><th>Usuario</th><th>UV</th></tr></thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr><td>${t.name}</td><td>${t.role}</td><td>${t.user}</td><td>${t.uv}</td></tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};
