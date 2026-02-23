// /v3/js/pages/project.js - VERSIÓN CON PESTAÑAS
console.log('📦 Cargando project.js...');

window.renderProjectDetail = function(params) {
    console.log('📄 renderProjectDetail EJECUTADA', params);
    
    const projectId = params?.id;
    if (!projectId) return '<div class="error">ID no proporcionado</div>';
    
    const project = window.store?.getState()?.projects.find(p => p.id === projectId);
    if (!project) return `<div class="error">Proyecto ${projectId} no encontrado</div>`;

    // HTML con pestañas
    return `
        <div class="project-detail-header">
            <button onclick="window.router?.navigate('projects') || history.back()" class="back-btn">← Volver</button>
            <h2>${project.nombre} <span class="project-id">${project.id}</span></h2>
            <p class="project-sector-badge">🏷️ ${project.sector_nombre || project.sector}</p>
            <p class="project-description">${project.descripcion || ''}</p>
        </div>
        
        <div class="project-tabs">
            <button class="tab-button active" data-tab="info">📋 Información</button>
            <button class="tab-button" data-tab="roles">👥 Roles</button>
            <button class="tab-button" data-tab="entregables">📦 Entregables</button>
            <button class="tab-button" data-tab="transacciones">💰 Transacciones</button>
        </div>
        
        <div id="tab-content" class="tab-content">
            ${renderInfoTab(project)}
        </div>
    `;
};

// Funciones de renderizado de pestañas
function renderInfoTab(project) {
    return `
        <div class="info-panel card">
            <h3>Información general</h3>
            <table class="info-table">
                <tr><th>ID:</th><td><code>${project.id}</code></td></tr>
                <tr><th>Nombre:</th><td>${project.nombre}</td></tr>
                <tr><th>Sector:</th><td>${project.sector_nombre || project.sector}</td></tr>
                <tr><th>Creado por:</th><td>${project.creado_por || 'desconocido'}</td></tr>
                <tr><th>Fecha creación:</th><td>${project.fecha_creacion ? new Date(project.fecha_creacion).toLocaleString() : 'desconocida'}</td></tr>
                <tr><th>Descripción:</th><td>${project.descripcion || 'Sin descripción'}</td></tr>
                <tr><th>Roles:</th><td>${project.roles?.length || 0}</td></tr>
                <tr><th>Transacciones:</th><td>${project.transacciones?.length || 0}</td></tr>
            </table>
        </div>
    `;
}

function renderRolesTab(project) {
    return '<div class="card"><h3>Roles del proyecto</h3><p class="no-data">Funcionalidad en desarrollo</p></div>';
}

function renderEntregablesTab(project) {
    return '<div class="card"><h3>Entregables</h3><p class="no-data">Funcionalidad en desarrollo</p></div>';
}

function renderTransaccionesTab(project) {
    return '<div class="card"><h3>Transacciones</h3><p class="no-data">Funcionalidad en desarrollo</p></div>';
}

// Configuración de eventos de las pestañas
function setupTabs(projectId) {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Quitar clase active de todos
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Cargar contenido según la pestaña
            const tab = e.target.dataset.tab;
            const project = window.store?.getState()?.projects.find(p => p.id === projectId);
            if (!project) return;
            
            let content = '';
            switch(tab) {
                case 'info': content = renderInfoTab(project); break;
                case 'roles': content = renderRolesTab(project); break;
                case 'entregables': content = renderEntregablesTab(project); break;
                case 'transacciones': content = renderTransaccionesTab(project); break;
            }
            document.getElementById('tab-content').innerHTML = content;
        });
    });
}

// Modificar el setTimeout para configurar los tabs después de renderizar
setTimeout(() => {
    if (window.router) {
        const projectId = window.router?.currentParams?.id;
        if (projectId) setupTabs(projectId);
    }
}, 0);

console.log('✅ project.js cargado con pestañas');
