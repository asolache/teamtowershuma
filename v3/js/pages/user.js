// user.js
window.renderUser = function(userId) {
    const state = window.store?.getState?.() || { users: [], transactions: [] };
    const user = state.users.find(u => u.id === userId) || { id: userId, name: userId };
    const transactions = state.transactions.filter(t => t.user === userId);
    const totalUV = transactions.reduce((s, t) => s + t.uv, 0);
    
    return `
        <div class="card">
            <div style="display: flex; justify-content: space-between;">
                <h2>👤 ${user.name}</h2>
                <button onclick="window.router?.navigate('users')">← Volver</button>
            </div>
            <div class="metric-grid">
                <div class="metric-card"><div class="metric-value">${totalUV}</div><div>UV Generadas</div></div>
                <div class="metric-card"><div class="metric-value">${transactions.length}</div><div>Entregables</div></div>
            </div>
            <h3>📦 Entregables</h3>
            <table class="data-table">
                <thead><tr><th>Nombre</th><th>Proyecto</th><th>Rol</th><th>UV</th></tr></thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr><td>${t.name}</td><td>${t.project}</td><td>${t.role}</td><td>${t.uv}</td></tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `
