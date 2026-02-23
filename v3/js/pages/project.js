// /v3/js/pages/project.js - PASO 2: VISUALIZACIÓN DE ROLES
console.log('📦 Cargando project.js (Paso 2)...');

// Guarda para evitar doble carga
if (window.__projectJsLoaded) {
    console.log('⏩ project.js ya cargado');
    return;
}
window.__projectJsLoaded = true;

window.renderProjectDetail = function(params) {
    console.log('📄 renderProjectDetail', params);
    
    const projectId = params?.id;
    if (!projectId) return '<div class="error">ID no proporcionado</div>';
    
    const project = window.store?.getState()?.projects.find(p => p.id === projectId);
    if (!project) return `<div class="error">Proyecto ${projectId} no encontrado</div>`;

    // HTML con pestañas
    const html = `
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

    // Configurar eventos después de renderizar
    setTimeout(() => {
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Quitar clase active de todos
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Cargar contenido según pestaña
                const tab = e.target.dataset.tab;
                const project = window.store?.getState()?.projects.find(p => p.id === projectId);
                if (!project) return;
                
                let content = '';
                switch(tab) {
                    case 'info': content = renderInfoTab(project); break;
                    case 'roles': content = renderRolesTab(project); break;
                    case 'entregables': content = '<div class="card"><h3>Entregables</h3><p>Contenido de entregables (próximamente)</p></div>'; break;
                    case 'transacciones': content = '<div class="card"><h3>Transacciones</h3><p>Contenido de transacciones (próximamente)</p></div>'; break;
                }
                document.getElementById('tab-content').innerHTML = content;
            });
        });
    }, 0);

    return html;
};

// ----- Pestaña Info -----
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

// ----- Pestaña Roles (solo visualización) -----
function renderRolesTab(project) {
    let html = '<div class="roles-panel card"><h3>Roles del proyecto</h3>';
    
    if (project.roles && project.roles.length > 0) {
        html += '<div class="roles-list">';
        project.roles.forEach(role => {
            const usuarios = role.usuarios_autorizados || [];
            html += `
                <div class="role-card" data-role-id="${role.id}">
                    <div class="role-header">
                        <strong>${role.id}</strong>
                        <span class="role-name">${role.nombre || ''}</span>
                    </div>
                    <div class="role-users">
                        <strong>Usuarios autorizados:</strong>
                        ${usuarios.length > 0 ? `<ul class="user-list">${usuarios.map(u => `<li>${u}</li>`).join('')}</ul>` : '<p class="no-data">Ningún usuario autorizado</p>'}
                    </div>
                    <div class="role-stats">
                        <small>📦 Entregables: ${role.entregables?.length || 0}</small>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    } else {
        html += '<p class="no-data">No hay roles definidos en este proyecto.</p>';
    }
    
    html += '</div>';
    return html;
}

console.log('✅ project.js Paso 2 cargado');
