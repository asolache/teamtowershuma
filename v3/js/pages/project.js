// projects.js - DEFINICIÓN GLOBAL
window.renderProjects = function() {
    console.log('📋 Renderizando proyectos...');
    const state = window.store?.getState?.() || { projects: [] };
    
    return `
        <div class="card">
            <h2>📋 Proyectos</h2>
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>Nombre</th><th>Sector</th></tr>
                </thead>
                <tbody>
                    ${state.projects.map(p => `
                        <tr onclick="window.router?.navigate('project', '${p.id}')" style="cursor: pointer;">
                            <td><strong>${p.id}</strong></td>
                            <td>${p.name || p.id}</td>
                            <td>${p.sector || '—'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

window.setupProjectsEvents = function() {
    console.log('✅ Proyectos eventos listos');
};

console.log('✅ Projects cargado globalmente');
