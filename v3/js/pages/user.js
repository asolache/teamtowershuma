// user.js - Vista detallada de usuario
// TeamTowers Humà v3.3 - Estilo global

window.renderUser = function(userId) {
    try {
        console.log(`👤 Renderizando usuario: ${userId}`);
        
        const state = window.store?.getState?.() || { users: [], transactions: [] };
        const userData = state.users.find(u => u.id === userId) || 
                        { id: userId, name: userId, type: 'human', skills: {} };
        
        // Obtener transacciones del usuario
        const transactions = state.transactions.filter(t => t.user === userId) || [];
        
        // Calcular métricas
        const totalUV = transactions.reduce((sum, t) => sum + (t.uv || 0), 0);
        const roles = [...new Set(transactions.map(t => t.role))];
        const projects = [...new Set(transactions.map(t => t.project))];
        
        // Skills del usuario
        const skills = userData.skills || {};
        const topSkills = Object.entries(skills)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([skill, value]) => ({ 
                skill, 
                value,
                level: value >= 0.8 ? 'experto' :
                       value >= 0.6 ? 'avanzado' :
                       value >= 0.4 ? 'intermedio' : 'principiante'
            }));

        const reputation = Object.values(skills).length > 0 
            ? Math.round(Object.values(skills).reduce((a, b) => a + b, 0) / Object.values(skills).length * 100)
            : 0;

        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>🧑 ${userData.id}</h2>
                    <button onclick="window.router?.navigate('users')" class="btn-back" style="padding: 8px 16px; background: #f1f5f9; border: none; border-radius: 30px; cursor: pointer;">← Volver</button>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 20px;">
                    <p><strong>Nombre:</strong> ${userData.name || userData.id}</p>
                    <p><strong>Tipo:</strong> ${userData.type === 'human' ? '👤 Humano' : '🤖 IA'}</p>
                    ${userData.provider ? `<p><strong>Proveedor:</strong> ${userData.provider}</p>` : ''}
                    <p><strong>Reputación:</strong> <span style="color: ${reputation > 70 ? '#10b981' : reputation > 40 ? '#f59e0b' : '#ef4444'}">${reputation}%</span></p>
                </div>
                
                <!-- Skills -->
                <div style="margin-bottom: 30px;">
                    <h3>🔧 Skills</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        ${topSkills.map(s => `
                            <div style="background: #f1f5f9; padding: 15px; border-radius: 12px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="font-weight: bold;">${s.skill}</span>
                                    <span style="color: ${getSkillColor(s.level)};">${s.level}</span>
                                </div>
                                <div style="height: 8px; background: #cbd5e1; border-radius: 4px;">
                                    <div style="width: ${s.value * 100}%; height: 100%; background: ${getSkillColor(s.level)}; border-radius: 4px;"></div>
                                </div>
                                <div style="margin-top: 5px; font-size: 12px; color: #64748b; text-align: right;">
                                    ${Math.round(s.value * 100)}%
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Métricas -->
                <div class="metric-grid" style="margin-bottom: 30px;">
                    <div class="metric-card">
                        <div class="metric-value" style="color: #2563eb">${totalUV}</div>
                        <div class="metric-label">UV Generadas</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: #8b5cf6">${transactions.length}</div>
                        <div class="metric-label">Entregables</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: #10b981">${roles.length}</div>
                        <div class="metric-label">Roles</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: #f59e0b">${projects.length}</div>
                        <div class="metric-label">Proyectos</div>
                    </div>
                </div>
                
                <!-- Roles y Proyectos -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <div>
                        <h3>👤 Roles</h3>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${roles.map(role => `
                                <span style="background: #f1f5f9; padding: 6px 12px; border-radius: 30px; font-size: 13px; border-left: 3px solid ${getRoleColor(role)};">
                                    ${role}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                    <div>
                        <h3>📋 Proyectos</h3>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${projects.map(project => `
                                <span onclick="window.router?.navigate('project', '${project}')" style="background: #f1f5f9; padding: 6px 12px; border-radius: 30px; font-size: 13px; cursor: pointer;">
                                    ${project}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Transacciones -->
                <div>
                    <h3>📦 Entregables</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Proyecto</th>
                                <th>Rol</th>
                                <th>UV</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions.slice(0, 10).map(t => `
                                <tr>
                                    <td>${t.name}</td>
                                    <td>${t.project}</td>
                                    <td>${t.role}</td>
                                    <td style="color: #2563eb; font-weight: bold;">${t.uv}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('❌ Error en renderUser:', e);
        return `<div class="loading">Error al cargar usuario: ${e.message}</div>`;
    }
};

window.setupUserEvents = function() {
    console.log('✅ Eventos de usuario configurados');
};

// Funciones auxiliares
function getSkillColor(level) {
    const colors = {
        'experto': '#10b981',
        'avanzado': '#3b82f6',
        'intermedio': '#f59e0b',
        'principiante': '#f97316'
    };
    return colors[level] || '#64748b';
}

function getRoleColor(role) {
    const colors = {
        '@enxaneta': '#f59e0b',
        '@acotxador': '#8b5cf6',
        '@segon': '#3b82f6',
        '@terç': '#2563eb',
        '@quart': '#10b981',
        '@pinya': '#64748b'
    };
    return colors[role] || '#94a3b8';
}

console.log('✅ User cargado globalmente');