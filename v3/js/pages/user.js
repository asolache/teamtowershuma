// user.js - DEFINICIÓN GLOBAL
window.renderUser = function(userId) {
    console.log('👤 Renderizando usuario:', userId);
    const state = window.store?.getState?.() || { users: [], transactions: [] };
    
    const user = state.users.find(u => u.id === userId) || { id: userId, name: userId, type: 'human' };
    const transactions = state.transactions.filter(t => t.user === userId);
    const totalUV = transactions.reduce((s, t) => s + (t.uv || 0), 0);
    
    return `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>👤 ${user.name || userId}</h2>
                <button onclick="window.router?.navigate('users')" class="btn-back" style="padding: 8px 16px; background: #f1f5f9; border: none; border-radius: 30px; cursor: pointer;">← Volver</button>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 20px;">
                <p><strong>ID:</strong> ${user.id}</p>
                <p><strong>Tipo:</strong> ${user.type === 'human' ? '👤 Humano' : '🤖 IA'}</p>
            </div>
            
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value" style="color: #2563eb">${totalUV}</div>
                    <div class="metric-label">UV Generadas</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #8b5cf6">${transactions.length}</div>
                    <div class="metric-label">Entregables</div>
                </div>
            </div>
            
            <h3>📦 Entregables</h3>
            <table class="data-table">
                <thead>
                    <tr><th>Nombre</th><th>Proyecto</th><th>Rol</th><th>UV</th></tr>
                </thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr>
                            <td>${t.name || 'Sin nombre'}</td>
                            <td>${t.project || '—'}</td>
                            <td>${t.role || '—'}</td>
                            <td style="color: #2563eb; font-weight: bold;">${t.uv || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

window.setupUserEvents = function() {
    console.log('✅ Usuario eventos listos');
};

console.log('✅ User cargado globalmente');
