// value-mapping.js - Página de Value Map (CON EVENTOS)
import { store } from '../core/store.js';
import { Selectors } from '../core/selectors.js';

export function renderValueMapping() {
    const state = store.getState();
    const transactions = state.transactions;
    const projects = state.projects;
    
    const mapData = transactions.map(t => ({
        role: t.role,
        user: t.user,
        targetRole: t.role,
        targetUser: t.user,
        uv: t.uv,
        project: t.project
    }));

    const metrics = Selectors.getGlobalMetrics();

    // Breadcrumb
    const breadcrumbItems = [
        { label: 'Inicio', path: 'dashboard' },
        { label: 'Value Map', path: 'value-map' }
    ];

    return `
        <div class="card">
            <tt-breadcrumb id="vm-breadcrumb" items='${JSON.stringify(breadcrumbItems)}'></tt-breadcrumb>
            <h2>🗺️ Value Mapping - Análisis Global</h2>
            
            <!-- Filtros avanzados -->
            <tt-filter-bar 
                id="vm-filters"
                filters='${JSON.stringify([
                    { type: 'select', key: 'project', label: 'Proyecto', 
                      options: [
                          { value: 'all', label: 'Todos' },
                          ...projects.map(p => ({ value: p.id, label: p.name }))
                      ]},
                    { type: 'select', key: 'type', label: 'Tipo', 
                      options: [
                          { value: 'all', label: 'Todos' },
                          { value: 'tangible', label: 'Tangibles' },
                          { value: 'intangible', label: 'Intangibles' }
                      ]},
                    { type: 'date', key: 'from', label: 'Desde' },
                    { type: 'date', key: 'to', label: 'Hasta' }
                ])}'>
            </tt-filter-bar>

            <!-- Controles del mapa -->
            <tt-map-controls id="vm-controls" map-id="vm-map" views="roles,users" filters></tt-map-controls>
            
            <!-- Mapa -->
            <tt-role-map 
                id="vm-map"
                data='${JSON.stringify(mapData)}'
                view="roles"
                width="100%"
                height="500px">
            </tt-role-map>
        </div>

        <!-- Estadísticas -->
        <div class="card">
            <h2>📊 Estadísticas Globales</h2>
            <div class="metric-grid" id="vm-metrics">
                <tt-metric-card value="${metrics.totalTransactions}" label="Total Transacciones" color="#2563eb"></tt-metric-card>
                <tt-metric-card value="${metrics.totalUV}" label="UV Totales" color="#8b5cf6"></tt-metric-card>
                <tt-metric-card value="${metrics.activeProjects}" label="Proyectos" color="#10b981"></tt-metric-card>
                <tt-metric-card value="${metrics.activeUsers}" label="Usuarios" color="#f59e0b"></tt-metric-card>
            </div>

            <!-- Leyenda -->
            <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 12px;">
                <h4 style="margin-bottom: 10px;">📖 Leyenda</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div><span style="display: inline-block; width: 12px; height: 12px; background: #2563eb; border-radius: 4px;"></span> Nodos: Roles/Usuarios</div>
                    <div><span style="display: inline-block; width: 20px; height: 2px; background: #2563eb;"></span> Tangible</div>
                    <div><span style="display: inline-block; width: 20px; height: 2px; border-top: 2px dashed #f59e0b;"></span> Intangible</div>
                    <div><span style="display: inline-block; width: 20px; height: 2px; background: #94a3b8;"></span> Flujo de valor</div>
                </div>
            </div>
        </div>
    `;
}

export function setupValueMappingEvents() {
    // Breadcrumb
    const breadcrumb = document.getElementById('vm-breadcrumb');
    if (breadcrumb) {
        breadcrumb.addEventListener('breadcrumb-click', (e) => {
            const item = e.detail;
            window.router?.navigate(item.path);
        });
    }

    // Filtros
    const filterBar = document.getElementById('vm-filters');
    if (filterBar) {
        filterBar.addEventListener('filter-change', (e) => {
            const filters = e.detail;
            console.log('Filtros aplicados:', filters);
            // Aquí se actualizaría el mapa
        });
    }

    // Mapa node click
    const map = document.getElementById('vm-map');
    if (map) {
        map.addEventListener('node-click', (e) => {
            const node = e.detail;
            console.log('Nodo seleccionado:', node);
            if (node.type === 'role') {
                window.router?.navigate('role', node.id);
            } else {
                window.router?.navigate('user', node.id);
            }
        });
    }

    // Métricas click
    const metrics = document.querySelectorAll('#vm-metrics tt-metric-card');
    metrics.forEach(metric => {
        metric.addEventListener('metric-click', (e) => {
            console.log('Métrica click:', e.detail);
        });
    });
}