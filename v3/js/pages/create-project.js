// ============================================
// pages/create-project.js
// Página para crear nuevos proyectos
// Filosofía: Offline-first, estado unidireccional
// ============================================

window.renderCreateProject = function() {
    const fields = [
        {
            nombre: "Nombre del Proyecto",
            tipo: "text",
            required: true,
            placeholder: "Ej: Taller de Castells"
        },
        {
            nombre: "ID",
            tipo: "text",
            required: true,
            placeholder: "#casteller-demo",
            help: "Debe empezar con # y usar guiones bajos",
            pattern: "^#[a-z0-9-]+$",
            patternError: "ID debe empezar con # y solo contener minúsculas, números y guiones"
        },
        {
            nombre: "Sector",
            tipo: "select",
            required: true,
            options: ["software", "blockchain", "consultoria", "formacion"]
        },
        {
            nombre: "Descripción",
            tipo: "textarea",
            required: false,
            placeholder: "¿Qué valor genera este proyecto?"
        }
    ];

    return `
        <div class="card">
            <h2>📁 Crear Nuevo Proyecto</h2>
            <p style="color: #64748b; margin-bottom: 20px;">
                Cada proyecto tendrá su propio mapa de valor con roles, entregables y flujos.
            </p>
            
            <tt-form 
                id="create-project-form"
                fields='${JSON.stringify(fields)}'
                submit-label="Crear Proyecto"
            ></tt-form>
        </div>
    `;
};

window.setupCreateProjectEvents = function() {
    const form = document.getElementById('create-project-form');
    if (form) {
        form.addEventListener('form-submit', (e) => {
            const data = e.detail;
            
            // Crear objeto de proyecto
            const nuevoProyecto = {
                id: data.ID,
                name: data["Nombre del Proyecto"],
                sector: data.Sector,
                description: data.Descripción || '',
                roles: [],      // Vacío - se añadirán después
                entregables: [], // Vacío - se definirán después
                flujos: [],      // Vacío - se definirán después
                createdAt: new Date().toISOString()
            };

            // Añadir al store
            if (window.store) {
                const state = window.store.getState();
                state.projects.push(nuevoProyecto);
                window.store.saveState();
                
                console.log('✅ Proyecto creado:', nuevoProyecto);
                alert(`Proyecto ${nuevoProyecto.id} creado correctamente`);
                
                // Redirigir a la vista del proyecto
                window.router.navigate('project', nuevoProyecto.id);
            } else {
                console.error('❌ Store no disponible');
                alert('Error al guardar el proyecto');
            }
        });
    }
};
