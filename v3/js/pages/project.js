// /v3/js/pages/project.js - VERSIÓN MÍNIMA DE PRUEBA
console.log('📦 Cargando project.js...');

window.renderProjectDetail = function(params) {
    console.log('📄 renderProjectDetail EJECUTADA', params);
    
    const projectId = params?.id;
    if (!projectId) return '<div class="error">ID no proporcionado</div>';
    
    const project = window.store?.getState()?.projects.find(p => p.id === projectId);
    if (!project) return `<div class="error">Proyecto ${projectId} no encontrado</div>`;

    return `
        <div class="card" style="padding: 2rem;">
            <h2>${project.nombre} <span class="project-id">${project.id}</span></h2>
            <p><strong>Sector:</strong> ${project.sector_nombre || project.sector}</p>
            <p><strong>Descripción:</strong> ${project.descripcion || 'Sin descripción'}</p>
            <p><strong>Roles:</strong> ${project.roles?.length || 0}</p>
            <p><strong>Transacciones:</strong> ${project.transacciones?.length || 0}</p>
            <hr>
            <p><em>✅ Versión de prueba - Las pestañas se añadirán después</em></p>
        </div>
    `;
};

console.log('✅ project.js cargado - renderProjectDetail definida:', typeof window.renderProjectDetail);
