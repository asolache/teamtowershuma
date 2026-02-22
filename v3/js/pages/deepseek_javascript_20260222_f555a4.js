// value-mapping.js - Mapa de valor global
// TeamTowers Humà v3.3 - Estilo global

window.renderValueMapping = function() {
    try {
        console.log('🗺️ Renderizando value mapping...');
        
        const state = window.store?.getState?.() || { projects: [], transactions: [] };
        const projects = state.projects || [];
        const transactions = state.transactions || [];
        
        // Preparar datos para el mapa
        const mapData = transactions.map(t => ({
            role: t.role,
            user: t.user,
            targetRole: t.role,
            targetUser: t.user,
            uv: t.uv,
            project: t.project
        }));

        return `
            <div class="card">
                <h2>🗺️ Value Mapping</h2>
                
                <div style="margin-bottom: 20px;">
                    <select id="vm-project-filter" style="padding: 8px 16px; border-radius: 30px; border: 1px solid #cbd5e1; width: 200px;">
                        <option value="all">Todos los proyectos</option>
                        ${projects.map(p => `
                            <option value="${p.id}">${p.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div style="background: #f8fafc; border-radius: 16px; padding: 30px; text-align: center;">
                    <p style="color: #64748b; margin-bottom: 20px;">Visualización de mapa de valor en desarrollo</p>
                    <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                        ${projects.map(p => {
                            const projectUV = transactions.filter(t => t.project === p.id).reduce((s, t) => s + (t.uv || 0), 0);
                            return `
                                <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; min-width: 150px;">
                                    <div style="font-weight: bold;">${p.id}</div>
                                    <div style="font-size: 24px; color: #2563eb;">${projectUV} UV</div>
                                    <div style="font-size: 12px; color: #64748b;">${transactions.filter(t => t.project === p.id).length} tx</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Métricas globales -->
                <div class="metric-grid" style="margin-top: 30px;">
                    <div class="metric-card">
                        <div class="metric-value">${transactions.length}</div>
                        <div class="metric-label">Transacciones totales</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${transactions.reduce((s, t) => s + (t.uv || 0), 0)}</div>
                        <div class="metric-label">UV totales</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${projects.length}</div>
                        <div class="metric-label">Proyectos</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${new Set(transactions.map(t => t.user)).size}</div>
                        <div class="metric-label">Usuarios activos</div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('❌ Error en renderValueMapping:', e);
        return `<div class="loading">Error al cargar value mapping: ${e.message}</div>`;
    }
};

window.setupValueMappingEvents = function() {
    console.log('🗺️ Eventos de value mapping configurados');
    
    const filter = document.getElementById('vm-project-filter');
    if (filter) {
        filter.addEventListener('change', (e) => {
            console.log('Filtrar por proyecto:', e.target.value);
            // Aquí iría la lógica de filtrado
        });
    }
};

console.log('✅ Value Mapping cargado globalmente');