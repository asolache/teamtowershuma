// users.js - DEFINICIÓN GLOBAL
window.renderUsers = function() {
    console.log('👥 Renderizando usuarios...');
    const state = window.store?.getState?.() || { users: [] };
    
    return `
        <div class="card">
            <h2>👥 Usuarios</h2>
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>Nombre</th><th>Tipo</th></tr>
                </thead>
                <tbody>
                    ${state.users.map(u => `
                        <tr onclick="window.router?.navigate('user', '${u.id}')" style="cursor: pointer;">
                            <td><strong>${u.id}</strong></td>
                            <td>${u.name || u.id}</td>
                            <td>${u.type === 'human' ? '👤 Humano' : '🤖 IA'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

window.setupUsersEvents = function() {
    console.log('✅ Usuarios eventos listos');
};

console.log('✅ Users cargado globalmente');
