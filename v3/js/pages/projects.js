// projects.js - Versión simplificada
window.renderProjects = function() {
    const projects = window.Selectors.getProjectsWithMetrics();
    
    return `
        <div class="card">
            <h2>📋 Proyectos</h2>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Sector</th>
                        <th>UV</th>
                        <th>Transacciones</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${projects.map(p => `
                        <tr onclick="window.router.navigate('project/${p.id}')" style="cursor: pointer;">
                            <td>${p.id}</td>
                            <td>${p.name}</td>
                            <td>${p.sector}</td>
                            <td>${p.uv}</td>
                            <td>${p.transactions}</td>
                            <td>${p.transactions > 0 ? '🟢 Activo' : '⚪ Inactivo'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

window.setupProjectsEvents = function() {
    console.log('Projects events ready');
};