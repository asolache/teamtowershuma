// project.js - Vista detallada de proyecto con pestañas
// TeamTowers Humà v3.5

window.renderProject = function(projectId) {
    console.log(`📁 Renderizando proyecto: ${projectId}`);
    
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    const project = state.projects.find(p => p.id === projectId) || { 
        id: projectId, 
        name: projectId, 
        sector: 'desconocido',
        roles: [],
        entregables: [],
        flujos: []
    };
    
    const transactions = state.transactions.filter(t => t.project === projectId) || [];
    const totalUV = transactions.reduce((s, t) => s + (t.uv || 0), 0);
    
    // Obtener pestaña actual de la URL (hash) o por defecto 'mapa'
    const currentTab = window.location.hash.slice(1) || 'mapa';

    return `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>📁 ${project.name}</h2>
                <div>
                    <button onclick="window.router?.navigate('projects')" class="btn-back" style="padding: 8px 16px; background: #f1f5f9; border: none; border-radius: 30px; cursor: pointer;">← Volver</button>
                </div>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 20px;">
                <p><strong>ID:</strong> ${project.id}</p>
                <p><strong>Sector:</strong> ${project.sector || '—'}</p>
                <p><strong>Descripción:</strong> ${project.description || 'Sin descripción'}</p>
                <p><strong>Creado:</strong> ${project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—'}</p>
            </div>
            
            <!-- Métricas -->
            <div class="metric-grid" style="margin-bottom: 30px;">
                <div class="metric-card">
                    <div class="metric-value" style="color: #2563eb">${totalUV}</div>
                    <div class="metric-label">UV Totales</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #8b5cf6">${transactions.length}</div>
                    <div class="metric-label">Transacciones</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #10b981">${project.roles?.length || 0}</div>
                    <div class="metric-label">Roles</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #f59e0b">${project.entregables?.length || 0}</div>
                    <div class="metric-label">Entregables</div>
                </div>
            </div>
            
            <!-- Pestañas -->
            <div style="display: flex; gap: 10px; border-bottom: 2px solid #e2e8f0; margin-bottom: 20px;">
                <a href="#mapa" class="tab-link ${currentTab === 'mapa' ? 'active' : ''}" data-tab="mapa" style="padding: 10px 20px; text-decoration: none; color: #64748b; border-bottom: 2px solid ${currentTab === 'mapa' ? '#2563eb' : 'transparent'}; margin-bottom: -2px;">🗺️ Mapa de Valor</a>
                <a href="#roles" class="tab-link ${currentTab === 'roles' ? 'active' : ''}" data-tab="roles" style="padding: 10px 20px; text-decoration: none; color: #64748b; border-bottom: 2px solid ${currentTab === 'roles' ? '#2563eb' : 'transparent'}; margin-bottom: -2px;">👥 Roles</a>
                <a href="#entregables" class="tab-link ${currentTab === 'entregables' ? 'active' : ''}" data-tab="entregables" style="padding: 10px 20px; text-decoration: none; color: #64748b; border-bottom: 2px solid ${currentTab === 'entregables' ? '#2563eb' : 'transparent'}; margin-bottom: -2px;">📦 Entregables</a>
                <a href="#flujos" class="tab-link ${currentTab === 'flujos' ? 'active' : ''}" data-tab="flujos" style="padding: 10px 20px; text-decoration: none; color: #64748b; border-bottom: 2px solid ${currentTab === 'flujos' ? '#2563eb' : 'transparent'}; margin-bottom: -2px;">🔀 Flujos</a>
            </div>
            
            <!-- Contenido de las pestañas -->
            <div id="tab-content">
                ${renderTabContent(currentTab, project, transactions)}
            </div>
        </div>
    `;
};

function renderTabContent(tab, project, transactions) {
    switch(tab) {
        case 'mapa':
            return renderMapaTab(project, transactions);
        case 'roles':
            return renderRolesTab(project);
        case 'entregables':
            return renderEntregablesTab(project);
        case 'flujos':
            return renderFlujosTab(project);
        default:
            return renderMapaTab(project, transactions);
    }
}

function renderMapaTab(project, transactions) {
    // Vista preliminar del mapa de valor
    return `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>🗺️ Mapa de Valor del Proyecto</h3>
                <button onclick="window.router?.navigate('value-map', '${project.id}')" class="btn-primary" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 30px; cursor: pointer;">
                    Ver mapa completo →
                </button>
            </div>
            
            <div style="background: #f8fafc; border-radius: 24px; padding: 40px; text-align: center;">
                <p style="color: #64748b;">Mapa de valor interactivo próximamente</p>
                <p style="font-size: 12px; margin-top: 10px;">Configura roles y entregables en las pestañas superiores</p>
            </div>
            
            <h4 style="margin-top: 30px;">📊 Transacciones recientes</h4>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Usuario</th>
                        <th>UV</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.slice(0, 5).map(t => `
                        <tr>
                            <td>${t.name || 'Sin nombre'}</td>
                            <td>${t.role || '—'}</td>
                            <td>${t.user || '—'}</td>
                            <td style="color: #2563eb;">${t.uv || 0}</td>
                        </tr>
                    `).join('')}
                    ${transactions.length === 0 ? `
                        <tr><td colspan="4" style="text-align: center; color: #64748b;">No hay transacciones</td></tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
    `;
}

function renderRolesTab(project) {
    const roles = project.roles || [];
    
    return `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>👥 Roles del Proyecto</h3>
                <button id="add-role-btn" class="btn-primary" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 30px; cursor: pointer;">
                    + Añadir Rol
                </button>
            </div>
            
            ${roles.length === 0 ? `
                <div style="background: #f8fafc; border-radius: 16px; padding: 40px; text-align: center;">
                    <p style="color: #64748b;">No hay roles asignados a este proyecto</p>
                    <button onclick="alert('Funcionalidad próximamente')" style="margin-top: 10px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 30px; cursor: pointer;">
                        Añadir primer rol
                    </button>
                </div>
            ` : `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Rol</th>
                            <th>Nivel</th>
                            <th>Multiplicador</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${roles.map(rol => `
                            <tr>
                                <td><strong style="color: ${rol.color || '#2563eb'}">${rol.id}</strong></td>
                                <td>${rol.level || 'base'}</td>
                                <td>${rol.multiplier || 1.0}x</td>
                                <td>
                                    <button onclick="alert('Editar rol')" style="background: none; border: none; cursor: pointer;">✏️</button>
                                    <button onclick="alert('Eliminar rol')" style="background: none; border: none; cursor: pointer;">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;
}

function renderEntregablesTab(project) {
    const entregables = project.entregables || [];
    
    return `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>📦 Entregables del Proyecto</h3>
                <button id="add-entregable-btn" class="btn-primary" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 30px; cursor: pointer;">
                    + Añadir Entregable
                </button>
            </div>
            
            ${entregables.length === 0 ? `
                <div style="background: #f8fafc; border-radius: 16px; padding: 40px; text-align: center;">
                    <p style="color: #64748b;">No hay entregables definidos</p>
                    <p style="font-size: 12px; margin-top: 10px;">Los entregables se crearán usando plantillas TeamTowers v1</p>
                </div>
            ` : `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>UV Estimado</th>
                            <th>Responsable</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entregables.map(e => `
                            <tr>
                                <td>${e.nombre}</td>
                                <td>${e.tipo === '#tangible' ? '🔷 Tangible' : '💭 Intangible'}</td>
                                <td>${e.uv_estimado || '—'}</td>
                                <td>${e.responsable || '—'}</td>
                                <td>
                                    <button onclick="alert('Ver entregable')" style="background: none; border: none; cursor: pointer;">👁️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;
}

function renderFlujosTab(project) {
    const flujos = project.flujos || [];
    
    return `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>🔀 Flujos de Valor</h3>
                <button id="add-flujo-btn" class="btn-primary" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 30px; cursor: pointer;">
                    + Añadir Flujo
                </button>
            </div>
            
            ${flujos.length === 0 ? `
                <div style="background: #f8fafc; border-radius: 16px; padding: 40px; text-align: center;">
                    <p style="color: #64748b;">No hay flujos definidos</p>
                    <p style="font-size: 12px; margin-top: 10px;">Los flujos conectan roles mediante entregables</p>
                </div>
            ` : `
                <div style="display: grid; gap: 15px;">
                    ${flujos.map(f => `
                        <div style="background: #f8fafc; padding: 15px; border-radius: 12px; display: flex; align-items: center; gap: 20px;">
                            <div style="font-weight: bold; color: ${getRoleColor(f.de)}">${f.de}</div>
                            <div style="font-size: 20px;">→</div>
                            <div style="font-weight: bold; color: ${getRoleColor(f.para)}">${f.para}</div>
                            <div style="flex: 1; padding: 8px; background: white; border-radius: 8px;">
                                <div>📦 ${f.entregable}</div>
                                <div style="font-size: 11px; color: #64748b;">${f.tipo === 'tangible' ? '🔷 Tangible' : '💭 Intangible'}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
}

function getRoleColor(roleId) {
    const colors = {
        '@enxaneta': '#f59e0b',
        '@acotxador': '#8b5cf6',
        '@terç': '#2563eb',
        '@quart': '#10b981',
        '@pinya': '#64748b',
        '@arquitecto': '#8b5cf6',
        '@Mr-Q': '#2563eb',
        '@masterproject': '#f59e0b'
    };
    return colors[roleId] || '#64748b';
}

window.setupProjectEvents = function() {
    console.log('📁 Configurando eventos de proyecto');
    
    // Manejar clicks en pestañas
    document.querySelectorAll('.tab-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = e.target.dataset.tab;
            window.location.hash = tab;
            
            // Recargar la página para mostrar la pestaña correcta
            // En una versión más avanzada, se haría con JS sin recargar
            location.reload();
        });
    });
    
    // Botones de añadir (placeholder)
    const addRoleBtn = document.getElementById('add-role-btn');
    if (addRoleBtn) {
        addRoleBtn.addEventListener('click', () => {
            alert('🔄 Funcionalidad de añadir roles próximamente (P-022)');
        });
    }
    
    const addEntregableBtn = document.getElementById('add-entregable-btn');
    if (addEntregableBtn) {
        addEntregableBtn.addEventListener('click', () => {
            alert('📦 Funcionalidad de añadir entregables próximamente (P-023)');
        });
    }
    
    const addFlujoBtn = document.getElementById('add-flujo-btn');
    if (addFlujoBtn) {
        addFlujoBtn.addEventListener('click', () => {
            alert('🔀 Funcionalidad de añadir flujos próximamente (P-024)');
        });
    }
};
// Funciones para el modal de roles
function showRoleSelector(projectId) {
    // Crear modal si no existe
    let modal = document.getElementById('role-selector-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'role-selector-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
        `;
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background: white; border-radius: 24px; width: 800px; max-width: 90%; max-height: 80vh; overflow-y: auto; padding: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h2 style="margin: 0;">👥 Seleccionar Roles para el Proyecto</h2>
                <button onclick="document.getElementById('role-selector-modal').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">✕</button>
            </div>
            
            <tt-role-selector project-id="${projectId}" id="role-selector"></tt-role-selector>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                <button onclick="document.getElementById('role-selector-modal').remove()" style="padding: 10px 20px; background: #e2e8f0; border: none; border-radius: 30px; cursor: pointer;">
                    Cancelar
                </button>
                <button id="save-roles-btn" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 30px; cursor: pointer;">
                    Guardar Roles
                </button>
            </div>
        </div>
    `;

    // Evento guardar
    const saveBtn = document.getElementById('save-roles-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const selector = document.getElementById('role-selector');
            if (selector && selector.selectedRoles) {
                saveProjectRoles(projectId, selector.selectedRoles);
            }
        });
    }
}

function saveProjectRoles(projectId, roles) {
    const state = window.store.getState();
    const projectIndex = state.projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
        state.projects[projectIndex].roles = roles;
        window.store.saveState();
        
        alert(`✅ ${roles.length} roles guardados correctamente`);
        document.getElementById('role-selector-modal')?.remove();
        
        // Recargar la página para ver los cambios
        location.reload();
    } else {
        alert('❌ Proyecto no encontrado');
    }
}

// Modificar la función renderRolesTab para incluir el botón funcional
function renderRolesTab(project) {
    const roles = project.roles || [];
    
    return `
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>👥 Roles del Proyecto</h3>
                <button onclick="showRoleSelector('${project.id}')" class="btn-primary" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 30px; cursor: pointer;">
                    + Añadir Rol
                </button>
            </div>
            
            ${roles.length === 0 ? `
                <div style="background: #f8fafc; border-radius: 16px; padding: 40px; text-align: center;">
                    <p style="color: #64748b;">No hay roles asignados a este proyecto</p>
                    <button onclick="showRoleSelector('${project.id}')" style="margin-top: 10px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 30px; cursor: pointer;">
                        Añadir primer rol
                    </button>
                </div>
            ` : `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Rol</th>
                            <th>Nivel</th>
                            <th>Multiplicador</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${roles.map(rol => `
                            <tr>
                                <td><strong style="color: ${rol.color || '#2563eb'}">${rol.id}</strong></td>
                                <td>${rol.level || 'base'}</td>
                                <td>${rol.multiplier || 1.0}x</td>
                                <td>
                                    <button onclick="alert('Eliminar rol - Funcionalidad próximamente')" style="background: none; border: none; cursor: pointer;">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;
}
console.log('✅ Project page cargada');
