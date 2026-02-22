// castell-view.js - Vista con representación gráfica del castell
window.renderCastellView = function(projectId = '#kernel') {
    console.log('🏰 Renderizando castell view con gráfico');
    
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

            <!-- REPRESENTACIÓN VISUAL DEL CASTELL -->
            <div style="background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 40px; padding: 40px 20px; margin: 30px 0; text-align: center;">
                
                <!-- Cima (Enxaneta) -->
                <div style="margin-bottom: 10px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; color: white; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; box-shadow: 0 4px 12px rgba(245,158,11,0.3);">
                        👑
                    </div>
                    <div style="margin-top: 5px; font-size: 12px; color: #f59e0b;">Enxaneta</div>
                    <div style="font-size: 11px;">${roles['@enxaneta']?.uv || 0} UV</div>
                </div>
                
                <!-- Tronco (acotxador, segon, terç, quart) -->
                <div style="display: flex; justify-content: center; gap: 30px; margin: 20px 0;">
                    <div>
                        <div style="width: 50px; height: 50px; background: #8b5cf6; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">A</div>
                        <div style="font-size: 11px; margin-top: 5px;">${roles['@acotxador']?.uv || 0} UV</div>
                    </div>
                    <div>
                        <div style="width: 50px; height: 50px; background: #3b82f6; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">S</div>
                        <div style="font-size: 11px; margin-top: 5px;">${roles['@segon']?.uv || 0} UV</div>
                    </div>
                    <div>
                        <div style="width: 50px; height: 50px; background: #2563eb; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">T</div>
                        <div style="font-size: 11px; margin-top: 5px;">${roles['@terç']?.uv || 0} UV</div>
                    </div>
                    <div>
                        <div style="width: 50px; height: 50px; background: #10b981; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">Q</div>
                        <div style="font-size: 11px; margin-top: 5px;">${roles['@quart']?.uv || 0} UV</div>
                    </div>
                </div>
                
                <!-- Base (Pinya) -->
                <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; margin-top: 30px; padding: 20px; background: #475569; border-radius: 60px;">
                    ${['@pinya', '@manilles', '@folre', '@agulla', '@crossa'].map(role => `
                        <div style="text-align: center;">
                            <div style="width: 40px; height: 40px; background: #64748b; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px;">
                                ${role.replace('@', '').substring(0, 3)}
                            </div>
                            <div style="font-size: 10px; color: white; margin-top: 5px;">${roles[role]?.uv || 0} UV</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- PINYA VISUAL -->
            <tt-pinya-visual project-id="${projectId}"></tt-pinya-visual>

            <!-- Tabla de roles -->
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
