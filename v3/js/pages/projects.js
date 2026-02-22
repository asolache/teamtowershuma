// projects.js
window.renderProjects = function() {
    const projects = window.store?.getState?.()?.projects || [];
    return `
        <div class="card">
            <h2>📋 Proyectos (${projects.length})</h2>
            <table class="data-table">
                <thead><tr><th>ID</th><th>Nombre</th><th>Sector</th></tr></thead>
                <tbody>
                    ${projects.map(p => `
                        <tr onclick="window.router?.navigate('project', '${p.id}')" style="cursor: pointer;">
                            <td><strong>${p.id}</strong></td>
                            <td>${p.name}</td>
                            <td>${p.sector}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};
