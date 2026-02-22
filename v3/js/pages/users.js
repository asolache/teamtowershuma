window.renderUsers = function() {
    const users = window.store.getState().users;
    return `
        <div class="card">
            <h2>👥 Usuarios</h2>
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>Nombre</th><th>Tipo</th></tr>
                </thead>
                <tbody>
                    ${users.map(u => `
                        <tr onclick="window.router.navigate('user', '${u.id}')" style="cursor: pointer;">
                            <td><strong>${u.id}</strong></td>
                            <td>${u.name}</td>
                            <td>${u.type === 'human' ? '👤 Humano' : '🤖 IA'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};
