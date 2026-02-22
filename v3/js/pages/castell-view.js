// castell-view.js - DEFINICIÓN GLOBAL
window.renderCastellView = function(projectId = '#kernel') {
    console.log('🏰 Renderizando castell view para:', projectId);
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    
    const transactions = state.transactions.filter(t => t.project === projectId);
    const roles = {};
    
    transactions.forEach(t => {
        if (!roles[t.role]) roles[t.role] = { uv: 0, count: 0 };
        roles[t.role].uv += t.uv || 0;
        roles[t.role].count++;
    });

    const totalUV = transactions.reduce((s, t) => s + (t.uv || 0), 0);

    return `
        <div class="card">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h2>🏰 Vista Casteller - ${projectId}</h2>
                <select id="castell-project" onchange="window.router?.navigate('castell', this.value)">
                    ${state.projects.map(p => `
                        <option value="${p.id}" ${p.id === projectId ? 'selected' : ''}>${p.name || p.id}</option>
                    `).join('')}
                </select>
            </div>

            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value" style="color: #f59e0b">${totalUV}</div>
                    <div class="metric-label">UV Totales</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #8b5cf6">${transactions.length}</div>
                    <div class="metric-label">Transacciones</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #10b981">${Object.keys(roles).length}</div>
                    <div class="metric-label">Roles Activos</div>
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
                            <td style="color: #2563eb;">${data.uv}</td>
                            <td>${data.count}</td>
                        </tr>
                    `).join('')}
                    ${Object.keys(roles).length === 0 ? `
                        <tr><td colspan="3" style="text-align: center; color: #64748b; padding: 30px;">
                            No hay transacciones para este proyecto
                        </td></tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
    `;
};

window.setupCastellViewEvents = function() {
    console.log('🏰 Castell eventos listos');
    const select = document.getElementById('castell-project');
    if (select) select.value = window.router?.params?.project || '#kernel';
};

console.log('✅ Castell View cargado globalmente');
