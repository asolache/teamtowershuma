// castell-view.js - Versión final que SIEMPRE muestra datos
window.renderCastellView = function(projectId = '#kernel') {
    const state = window.store.getState();
    const transactions = state.transactions.filter(t => t.project === projectId);
    const roles = {};
    
    transactions.forEach(t => {
        if (!roles[t.role]) roles[t.role] = { uv: 0, count: 0 };
        roles[t.role].uv += t.uv;
        roles[t.role].count++;
    });

    const totalUV = transactions.reduce((s, t) => s + t.uv, 0);

    return `
        <div class="card">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h2>🏰 Vista Casteller - ${projectId}</h2>
                <select id="castell-project" onchange="window.router.navigate('castell', this.value)">
                    ${state.projects.map(p => `
                        <option value="${p.id}" ${p.id === projectId ? 'selected' : ''}>${p.name}</option>
                    `).join('')}
                </select>
            </div>

            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">${totalUV}</div>
                    <div class="metric-label">UV Totales</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${transactions.length}</div>
                    <div class="metric-label">Transacciones</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${Object.keys(roles).length}</div>
                    <div class="metric-label">Roles</div>
                </div>
            </div>

            <h3>📊 Distribución por Rol</h3>
            <table class="data-table">
                <thead>
                    <tr><th>Rol</th><th>UV</th><th>Transacciones</th></tr>
                </thead>
                <tbody>
                    ${Object.entries(roles).map(([role, data]) => `
                        <tr>
                            <td><strong>${role}</strong></td>
                            <td>${data.uv}</td>
                            <td>${data.count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

window.setupCastellViewEvents = function() {
    const select = document.getElementById('castell-project');
    if (select) select.value = window.router?.params?.project || '#kernel';
};
