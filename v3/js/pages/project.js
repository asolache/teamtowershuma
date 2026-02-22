// projects.js - Lista de proyectos con sectores mejorados
window.renderProjects = function() {
    const state = window.store?.getState?.() || { projects: [] };
    const projects = state.projects || [];
    
    return `
        <div class="card">
            <h2>📋 Proyectos (${projects.length})</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Sector</th>
                        <th>Roles</th>
                        <th>Entregables</th>
                    </tr>
                </thead>
                <tbody>
                    ${projects.map(p => `
                        <tr onclick="window.router?.navigate('project', '${p.id}')" style="cursor: pointer;">
                            <td><strong>${p.id}</strong></td>
                            <td>${p.name}</td>
                            <td>${p.sector_emoji || '📁'} ${p.sector_nombre || p.sector || '—'}</td>
                            <td>${p.roles?.length || 0}</td>
                            <td>${p.entregables?.length || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

window.setupProjectsEvents = function() {
    console.log('✅ Projects listo');
};
