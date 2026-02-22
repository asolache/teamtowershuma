// project.js - Vista detallada de proyecto
// TeamTowers Humà v3.3 - Estilo global

window.renderProject = function(projectId) {
    try {
        console.log(`📁 Renderizando proyecto: ${projectId}`);
        
        const state = window.store?.getState?.() || { projects: [], transactions: [] };
        const project = state.projects.find(p => p.id === projectId) || 
                       { id: projectId, name: projectId, sector: 'desconocido' };
        
        const transactions = state.transactions.filter(t => t.project === projectId) || [];
        
        // Calcular métricas
        const totalUV = transactions.reduce((sum, t) => sum + (t.uv || 0), 0);
        const roles = [...new Set(transactions.map(t => t.role))];
        const users = [...new Set(transactions.map(t => t.user))];
        
        // Distribución por rol
        const roleUV = {};
        transactions.forEach(t => {
            roleUV[t.role] = (roleUV[t.role] || 0) + (t.uv || 0);
        });

        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>📁 ${project.id}</h2>
                    <button onclick="window.router?.navigate('projects')" class="btn-back" style="padding: 8px 16px; background: #f1f5f9; border: none; border-radius: 30px; cursor: pointer;">← Volver</button>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 20px;">
                    <p><strong>Nombre:</strong> ${project.name}</p>
                    <p><strong>Sector:</strong> ${project.sector || '—'}</p>
                </div>
                
                <!-- Métricas -->
                <div class="metric-grid" style="margin-bottom: 30px;">
                    <div class="metric-card">
                        <div class="metric-value" style="color: #2563eb">${totalUV}</div>
                        <div class="metric-label">UV Total</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: #8b5cf6">${transactions.length}</div>
                        <div class="metric-label">Transacciones</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: #10b981">${roles.length}</div>
                        <div class="metric-label">Roles</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: #f59e0b">${users.length}</div>
                        <div class="metric-label">Usuarios</div>
                    </div>
                </div>
                
                <!-- Distribución por rol -->
                <div style="margin-bottom: 30px;">
                    <h3>📊 Distribución por Rol</h3>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 16px;">
                        ${Object.entries(roleUV).map(([role, uv]) => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: white; border-radius: 8px;">
                                <span><strong>${role}</strong></span>
                                <span style="color: #2563eb; font-weight: bold;">${uv} UV (${Math.round(uv/totalUV*100)}%)</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Transacciones -->
                <div>
                    <h3>📋 Transacciones</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Rol</th>
                                <th>Usuario</th>
                                <th>UV</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions.map(t => `
                                <tr>
                                    <td>${t.name}</td>
                                    <td>${t.role}</td>
                                    <td>${t.user}</td>
                                    <td style="color: #2563eb; font-weight: bold;">${t.uv}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('❌ Error en renderProject:', e);
        return `<div class="loading">Error al cargar proyecto: ${e.message}</div>`;
    }
};

window.setupProjectEvents = function() {
    console.log('✅ Eventos de proyecto configurados');
};

console.log('✅ Project cargado globalmente');