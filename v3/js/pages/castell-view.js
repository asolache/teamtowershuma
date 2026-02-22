// castell-view.js
window.renderCastellView = function(projectId = '#kernel') {
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    const transactions = state.transactions.filter(t => t.project === projectId);
    const roles = {};
    
    transactions.forEach(t => {
        if (!roles[t.role]) roles[t.role] = { uv: 0, count: 0 };
        roles[t.role].uv += t.uv;
        roles[t.role].count++;
    });

    return `
        <div class="card">
            <div style="display: flex; justify-content: space-between;">
                <h2>🏰 Castell - ${projectId}</h2>
                <select id="castell-project" onchange="window.router?.navigate('castell', this.value)">
                    ${state.projects.map(p => `
                        <option value="${p.id}" ${p.id === projectId ? 'selected' : ''}>${p.name}</option>
                    `).join('')}
                </select>
            </div>
            <div class="metric-grid">
                <div class="metric-card"><div class="metric-value">${Object.keys(roles).length}</div><div>Roles</div></div>
                <div class="metric-card"><div class="metric-value">${transactions.length}</div><div>Transacciones</div></div>
            </div>
            <table class="data-table">
                <thead><tr><th>Rol</th><th>UV</th><th>Tx</th></tr></thead>
                <tbody>
                    ${Object.entries(roles).map(([role, data]) => `
                        <tr><td>${role}</td><td>${data.uv}</td><td>${data.count}</td></tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};
