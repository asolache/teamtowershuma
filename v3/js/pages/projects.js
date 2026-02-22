// projects.js - Lista de proyectos
// TeamTowers Humà v3.3 - Estilo global

window.renderProjects = function() {
    try {
        console.log('📋 Renderizando proyectos...');
        
        const state = window.store?.getState?.() || { projects: [], transactions: [] };
        const projects = state.projects || [];
        const transactions = state.transactions || [];
        
        const projectsWithMetrics = projects.map(p => ({
            ...p,
            uv: transactions.filter(t => t.project === p.id).reduce((sum, t) => sum + (t.uv || 0), 0),
            transactions: transactions.filter(t => t.project === p.id).length
        }));

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
                        ${projectsWithMetrics.map(p => `
                            <tr onclick="window.router?.navigate('project', '${p.id}')" style="cursor: pointer;">
                                <td><strong>${p.id}</strong></td>
                                <td>${p.name}</td>
                                <td>${p.sector || '—'}</td>
                                <td style="color: #2563eb; font-weight: bold;">${p.uv}</td>
                                <td>${p.transactions}</td>
                                <td>${p.transactions > 0 ? '🟢 Activo' : '⚪ Inactivo'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (e) {
        console.error('❌ Error en renderProjects:', e);
        return `<div class="loading">Error al cargar proyectos: ${e.message}</div>`;
    }
};

window.setupProjectsEvents = function() {
    console.log('✅ Eventos de proyectos configurados');
};

console.log('✅ Projects cargado globalmente');