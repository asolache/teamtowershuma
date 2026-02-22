// users.js - Lista de usuarios
// TeamTowers Humà v3.3 - Estilo global

window.renderUsers = function() {
    try {
        console.log('👥 Renderizando usuarios...');
        
        const state = window.store?.getState?.() || { users: [], transactions: [] };
        const users = state.users || [];
        const transactions = state.transactions || [];
        
        // Calcular top contribuidores
        const userUV = {};
        transactions.forEach(t => {
            userUV[t.user] = (userUV[t.user] || 0) + (t.uv || 0);
        });
        
        const topContributors = Object.entries(userUV)
            .map(([user, uv]) => ({ user, uv }))
            .sort((a, b) => b.uv - a.uv)
            .slice(0, 10);

        return `
            <div class="card">
                <h2>👥 Usuarios</h2>
                
                <!-- Top contribuidores -->
                <div style="margin-bottom: 30px;">
                    <h3>🏆 Top Contribuidores</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>UV</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topContributors.map(c => `
                                <tr onclick="window.router?.navigate('user', '${c.user}')" style="cursor: pointer;">
                                    <td><strong>${c.user}</strong></td>
                                    <td style="color: #2563eb; font-weight: bold;">${c.uv}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Todos los usuarios -->
                <div>
                    <h3>📋 Todos los usuarios</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Skills</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(u => {
                                const skills = u.skills ? 
                                    Object.entries(u.skills)
                                        .slice(0, 3)
                                        .map(([s, v]) => `${s} (${Math.round(v*100)}%)`)
                                        .join(', ') : '—';
                                return `
                                    <tr onclick="window.router?.navigate('user', '${u.id}')" style="cursor: pointer;">
                                        <td><strong>${u.id}</strong></td>
                                        <td>${u.name || u.id}</td>
                                        <td>${u.type === 'human' ? '👤 Humano' : '🤖 IA'}</td>
                                        <td><small>${skills}</small></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('❌ Error en renderUsers:', e);
        return `<div class="loading">Error al cargar usuarios: ${e.message}</div>`;
    }
};

window.setupUsersEvents = function() {
    console.log('✅ Eventos de usuarios configurados');
};

console.log('✅ Users cargado globalmente');