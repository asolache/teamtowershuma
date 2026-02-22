// /v3/js/pages/projects.js
// Vista de lista de proyectos y creación de nuevos proyectos
// v3.5 - Actualizado con sectores

// Renderizador principal de la página de proyectos (lista)
window.renderProjects = function() {
    console.log('📋 Renderizando lista de proyectos');
    
    const state = window.store?.getState?.() || { projects: [] };
    const projects = state.projects || [];

    let html = `
        <div class="page-header">
            <h1>📁 Proyectos</h1>
            <button id="new-project-btn" class="btn-primary">+ Nuevo Proyecto</button>
        </div>
        <div class="projects-grid">
    `;

    if (projects.length === 0) {
        html += `<p class="no-data">No hay proyectos aún. Crea uno nuevo.</p>`;
    } else {
        projects.forEach(proj => {
            // Obtener nombre del sector
            const sectorNombre = window.APP_CONSTANTS?.SECTORES_MAP[proj.sector] || proj.sector || 'General';
            
            html += `
                <div class="project-card" data-project-id="${proj.id}">
                    <h3>${proj.nombre} <span class="project-id">${proj.id}</span></h3>
                    <p class="project-sector">🏷️ ${sectorNombre}</p>
                    <p class="project-description">${proj.descripcion ? (proj.descripcion.length > 100 ? proj.descripcion.substring(0, 100) + '...' : proj.descripcion) : 'Sin descripción'}</p>
                    <div class="project-meta">
                        <span>👥 Roles: ${proj.roles?.length || 0}</span>
                        <span>📦 Entregables: ${proj.roles?.reduce((acc, rol) => acc + (rol.entregables?.length || 0), 0) || 0}</span>
                    </div>
                    <button class="view-project-btn" data-project-id="${proj.id}">Ver detalle</button>
                </div>
            `;
        });
    }
    html += `</div>`;

    // Programar eventos después de insertar el HTML
    setTimeout(() => {
        document.getElementById('new-project-btn')?.addEventListener('click', () => {
            showNewProjectForm();
        });
        
        document.querySelectorAll('.view-project-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const projectId = e.target.dataset.projectId;
                // Navegar al detalle del proyecto
                if (window.Router) {
                    window.Router.navigate(`project-detail?id=${encodeURIComponent(projectId)}`);
                } else {
                    // Fallback si no hay router
                    window.location.href = `?page=project-detail&id=${encodeURIComponent(projectId)}`;
                }
            });
        });

        // También hacer click en toda la card
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Evitar si se hizo click en el botón (ya tiene su propio evento)
                if (e.target.classList.contains('view-project-btn')) return;
                
                const projectId = card.dataset.projectId;
                if (window.Router) {
                    window.Router.navigate(`project-detail?id=${encodeURIComponent(projectId)}`);
                }
            });
        });
    }, 0);

    return html;
};

// Función para mostrar el formulario de nuevo proyecto
function showNewProjectForm() {
    console.log('📝 Mostrando formulario de nuevo proyecto');
    
    // Verificar que las constantes estén cargadas
    if (!window.APP_CONSTANTS) {
        console.error('ERROR: APP_CONSTANTS no está definido');
        alert('Error de configuración. Recarga la página.');
        return;
    }
    
    const sectores = window.APP_CONSTANTS.SECTORES;
    const defaultSector = window.APP_CONSTANTS.SECTOR_DEFAULT;

    const modalHtml = `
        <div class="form-overlay" id="new-project-overlay">
            <div class="form-modal">
                <h3>📁 Crear nuevo proyecto</h3>
                <form id="new-project-form">
                    <div class="form-group">
                        <label for="project-nombre">Nombre del proyecto *</label>
                        <input type="text" id="project-nombre" placeholder="Ej: Kernel v4.0" required autofocus>
                    </div>
                    
                    <div class="form-group">
                        <label for="project-id">ID del proyecto *</label>
                        <input type="text" id="project-id" placeholder="#kernel" required 
                               pattern="#[a-zA-Z0-9-]+" 
                               title="Debe empezar por # y contener solo letras, números y guiones">
                        <small class="help-text">Debe empezar por #, sin espacios. Ej: #kernel, #web-app</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="project-sector">Sector</label>
                        <select id="project-sector">
                            ${sectores.map(s => `<option value="${s.id}" ${s.id === defaultSector ? 'selected' : ''}>${s.nombre}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="project-descripcion">Descripción</label>
                        <textarea id="project-descripcion" rows="4" placeholder="Describe el propósito del proyecto..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">✅ Crear proyecto</button>
                        <button type="button" id="cancel-new-project" class="btn-secondary">❌ Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const overlay = document.getElementById('new-project-overlay');
    const form = document.getElementById('new-project-form');

    // Validar ID en tiempo real
    const idInput = document.getElementById('project-id');
    idInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value && !value.startsWith('#')) {
            e.target.value = '#' + value.replace(/^#+/, '');
        }
        // Eliminar espacios
        e.target.value = e.target.value.replace(/\s/g, '-');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('project-nombre').value.trim();
        const id = document.getElementById('project-id').value.trim();
        const sector = document.getElementById('project-sector').value;
        const descripcion = document.getElementById('project-descripcion').value.trim();

        // Validaciones
        if (!nombre || nombre.length < 3) {
            alert('El nombre debe tener al menos 3 caracteres');
            return;
        }
        
        if (!id || !id.startsWith('#')) {
            alert('El ID debe empezar por #');
            return;
        }

        // Verificar si ya existe un proyecto con ese ID
        const state = window.store?.getState?.() || { projects: [] };
        if (state.projects.some(p => p.id === id)) {
            alert(`Ya existe un proyecto con ID ${id}. Elige otro.`);
            return;
        }

        // Crear objeto proyecto
        const newProject = {
            id: id,
            nombre: nombre,
            sector: sector,
            descripcion: descripcion,
            roles: [], // inicialmente vacío
            transacciones: [],
            creado_por: '@usuario-actual', // pendiente de autenticación
            fecha_creacion: new Date().toISOString()
        };

        // Guardar en store
        if (window.store) {
            window.store.addProject(newProject);
            overlay.remove();
            // Recargar la vista de proyectos
            if (window.Router) {
                window.Router.navigate('projects');
            } else {
                // Forzar recarga de la vista
                const content = window.renderProjects();
                document.getElementById('main-content').innerHTML = content;
            }
        } else {
            console.error('Store no disponible');
            alert('Error al guardar el proyecto');
        }
    });

    document.getElementById('cancel-new-project').addEventListener('click', () => {
        overlay.remove();
    });

    // Cerrar al hacer clic fuera del modal
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Función para filtrar proyectos por sector (futuro)
window.filterProjectsBySector = function(sectorId) {
    console.log(`Filtrando proyectos por sector: ${sectorId}`);
    // Esta función se puede implementar más adelante
    // Por ahora, simplemente recargamos la vista con un filtro
    // (requiere modificar renderProjects para aceptar filtros)
};

// Setup de eventos específicos de la página (llamado desde router si existe)
window.setupProjectsEvents = function() {
    console.log('⚙️ Setup eventos de projects');
    // Eventos adicionales si son necesarios
};

// Exportar funciones si se usa módulos (no es el caso)
