// /v3/js/pages/projects.js
// Vista de lista de proyectos y creación de nuevos proyectos (modal)
// v3.5 - Corregido para evitar errores de sintaxis

console.log('📦 Cargando projects.js...');

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
            const sectorNombre = window.APP_CONSTANTS?.SECTORES_MAP[proj.sector] || proj.sector_nombre || proj.sector || 'General';
            const sectorEmoji = proj.sector_emoji || '📁';
            
            html += `
                <div class="project-card" data-project-id="${proj.id}">
                    <h3>${proj.nombre} <span class="project-id">${proj.id}</span></h3>
                    <p class="project-sector">${sectorEmoji} ${sectorNombre}</p>
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

    return html;
};

window.setupProjectsEvents = function() {
    console.log('⚙️ Configurando eventos de projects');
    
    document.getElementById('new-project-btn')?.addEventListener('click', showNewProjectForm);
    
    document.querySelectorAll('.view-project-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const projectId = e.target.dataset.projectId;
            if (window.router) {
                window.router.navigate('project-detail', { id: projectId });
            } else {
                window.location.href = `/?page=project-detail&id=${encodeURIComponent(projectId)}`;
            }
        });
    });

    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-project-btn')) return;
            const projectId = card.dataset.projectId;
            if (window.router) {
                window.router.navigate('project-detail', { id: projectId });
            }
        });
    });
};

function showNewProjectForm() {
    console.log('📝 Mostrando formulario de nuevo proyecto');
    
    const sectores = window.APP_CONSTANTS?.SECTORES || [
        { id: "tecnologia", nombre: "Tecnología, Software e IA" },
        { id: "salud", nombre: "Salud, Biotech y Bienestar" },
        { id: "turismo", nombre: "Turismo, Viajes y Hostelería" },
        { id: "fintech", nombre: "Fintech y Servicios Financieros" },
        { id: "comercio", nombre: "Comercio Electrónico y Distribución" },
        { id: "educacion", nombre: "Educación y Edtech" },
        { id: "energia", nombre: "Energía, Sostenibilidad y Cleantech" },
        { id: "construccion", nombre: "Construcción, Inmobiliario y Proptech" },
        { id: "consultoria", nombre: "Servicios Profesionales y Consultoría B2B" }
    ];
    const defaultSector = window.APP_CONSTANTS?.SECTOR_DEFAULT || 'tecnologia';

    const modalHtml = `
        <div class="form-overlay" id="new-project-overlay">
            <div class="form-modal">
                <h3>📁 Crear nuevo proyecto</h3>
                <form id="inline-project-form">
                    <div class="form-group">
                        <label for="project-nombre">Nombre del proyecto *</label>
                        <input type="text" id="project-nombre" placeholder="Ej: Proyecto Alpha" required autofocus>
                    </div>
                    
                    <div class="form-group">
                        <label for="project-id">ID del proyecto *</label>
                        <input type="text" id="project-id" placeholder="#proyecto-alpha" required 
                               pattern="#[a-z0-9-]+" 
                               title="Debe empezar por # y contener solo minúsculas, números y guiones">
                        <small class="help-text">Debe empezar por #, sin espacios. Ej: #proyecto-alpha</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="project-sector">Sector</label>
                        <select id="project-sector">
                            ${sectores.map(s => `<option value="${s.id}" ${s.id === defaultSector ? 'selected' : ''}>${s.nombre}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="project-descripcion">Descripción</label>
                        <textarea id="project-descripcion" rows="3" placeholder="Describe el propósito del proyecto..."></textarea>
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
    const form = document.getElementById('inline-project-form');

    const idInput = document.getElementById('project-id');
    idInput.addEventListener('input', (e) => {
        let value = e.target.value;
        if (value && !value.startsWith('#')) {
            e.target.value = '#' + value.replace(/^#+/, '');
        }
        e.target.value = e.target.value.replace(/\s/g, '-').toLowerCase();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('project-nombre').value.trim();
        const id = document.getElementById('project-id').value.trim();
        const sector = document.getElementById('project-sector').value;
        const descripcion = document.getElementById('project-descripcion').value.trim();

        if (!nombre || nombre.length < 3) {
            alert('El nombre debe tener al menos 3 caracteres');
            return;
        }
        
        if (!id || !id.startsWith('#')) {
            alert('El ID debe empezar por #');
            return;
        }

        const state = window.store?.getState?.() || { projects: [] };
        if (state.projects.some(p => p.id === id)) {
            alert(`Ya existe un proyecto con ID ${id}. Elige otro.`);
            return;
        }

        const sectorObj = sectores.find(s => s.id === sector);
        const sectorNombre = sectorObj ? sectorObj.nombre : sector;

        const newProject = {
            id: id,
            nombre: nombre,
            sector: sector,
            sector_nombre: sectorNombre,
            descripcion: descripcion,
            roles: [],
            creado_por: "@masterproject",
            fecha_creacion: new Date().toISOString()
        };

        if (window.store) {
            window.store.addProject(newProject);
            overlay.remove();
            if (window.router) {
                window.router.navigate('projects');
            } else {
                const content = window.renderProjects();
                document.getElementById('main-content').innerHTML = content;
                window.setupProjectsEvents();
            }
        }
    });

    document.getElementById('cancel-new-project').addEventListener('click', () => {
        overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

window.showNewProjectForm = showNewProjectForm;

console.log('✅ projects.js cargado - setupProjectsEvents definida:', typeof window.setupProjectsEvents);
