// castell-view.js - Versión final con Pinya Visual
window.renderCastellView = function(projectId = '#kernel') {
    console.log('🏰 Renderizando castell view con pinya visual');
    
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    const project = state.projects.find(p => p.id === projectId) || { id: projectId, name: projectId };
    const transactions = state.transactions.filter(t => t.project === projectId);
    
    // Calcular distribución por rol
    const roles = {};
    transactions.forEach(t => {
        if (!roles[t.role]) roles[t.role] = { uv: 0, count: 0 };
        roles[t.role].uv += t.uv || 0;
        roles[t.role].count++;
    });

    const totalUV = transactions.reduce((s, t) => s + (t.uv || 0), 0);

    return `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap;">
                <h2>🏰 Castell de Valor - ${project.name}</h2>
                <select id="castell-project-select" style="padding: 8px 16px; border-radius: 30px; border: 1px solid #cbd5e1;">
                    ${state.projects.map(p => `
                        <option value="${p.id}" ${p.id === projectId ? 'selected' : ''}>${p.name}</option>
                    `).join('')}
                </select>
            </div>

            <!-- Métricas principales -->
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

            <!-- PINYA VISUAL - NUEVO COMPONENTE -->
            <tt-pinya-visual project-id="${projectId}"></tt-pinya-visual>

            <!-- Distribución por rol -->
            <h3 style="margin: 30px 0 15px;">📊 Distribución por Rol</h3>
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
                </tbody>
            </table>
        </div>
    `;
};

window.setupCastellViewEvents = function() {
    const select = document.getElementById('castell-project-select');
    if (select) {
        select.addEventListener('change', (e) => {
            window.router?.navigate('castell', e.target.value);
        });
    }
};
