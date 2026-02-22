// create-project.js - Página para crear nuevos proyectos
// TeamTowers Humà v3.5 - CON TODOS LOS SECTORES

// Lista completa de sectores
const SECTORES = [
    { id: "tecnologia", nombre: "Tecnología, Software e IA", emoji: "💻" },
    { id: "salud", nombre: "Salud, Biotech y Bienestar", emoji: "⚕️" },
    { id: "turismo", nombre: "Turismo, Viajes y Hostelería", emoji: "✈️" },
    { id: "fintech", nombre: "Fintech y Servicios Financieros", emoji: "💰" },
    { id: "comercio", nombre: "Comercio Electrónico y Distribución", emoji: "🛒" },
    { id: "educacion", nombre: "Educación y Edtech", emoji: "📚" },
    { id: "energia", nombre: "Energía, Sostenibilidad y Cleantech", emoji: "🌱" },
    { id: "construccion", nombre: "Construcción, Inmobiliario y Proptech", emoji: "🏗️" },
    { id: "consultoria", nombre: "Servicios Profesionales y Consultoría B2B", emoji: "🤝" }
];

window.renderCreateProject = function() {
    console.log('📁 Renderizando formulario de nuevo proyecto');
    
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
            help: "Debe empezar con # y usar guiones bajos. Ej: #nombre-del-proyecto",
            pattern: "^#[a-z0-9-]+$",
            patternError: "ID debe empezar con # y solo contener minúsculas, números y guiones"
        },
        {
            nombre: "Sector",
            tipo: "select",
            required: true,
            options: SECTORES.map(s => s.emoji + " " + s.nombre)
        },
        {
            nombre: "Descripción",
            tipo: "textarea",
            required: false,
            placeholder: "¿Qué valor genera este proyecto? ¿Cuál es su propósito?"
        },
        {
            nombre: "Objetivos",
            tipo: "textarea",
            required: false,
            placeholder: "Lista los objetivos principales del proyecto (uno por línea)"
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
            
            <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 12px;">
                <h4 style="margin-bottom: 10px;">📋 Sectores disponibles:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px;">
                    ${SECTORES.map(s => `
                        <div style="padding: 5px 10px; background: white; border-radius: 30px; font-size: 13px;">
                            ${s.emoji} ${s.nombre}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
};

window.setupCreateProjectEvents = function() {
    console.log('📁 Configurando eventos de create project');
    
    const form = document.getElementById('create-project-form');
    if (form) {
        form.addEventListener('form-submit', (e) => {
            const data = e.detail;
            console.log('📝 Datos del formulario:', data);
            
            // Validar ID
            if (!data.ID.startsWith('#')) {
                alert('❌ El ID debe empezar con #');
                return;
            }
            
            // Extraer sector (sin el emoji)
            const sectorSeleccionado = data.Sector;
            const sectorObj = SECTORES.find(s => sectorSeleccionado.includes(s.nombre));
            const sectorId = sectorObj ? sectorObj.id : "consultoria";
            const sectorNombre = sectorObj ? sectorObj.nombre : data.Sector;
            
            // Procesar objetivos (convertir texto en lista)
            const objetivosLista = data.Objetivos ? 
                data.Objetivos.split('\n').filter(line => line.trim() !== '') : [];
            
            // Crear objeto de proyecto
            const nuevoProyecto = {
                id: data.ID,
                name: data["Nombre del Proyecto"],
                sector: sectorId,
                sector_nombre: sectorNombre,
                sector_emoji: sectorObj?.emoji || "📁",
                description: data.Descripción || '',
                objetivos: objetivosLista,
                roles: [],      // Vacío - se añadirán después
                entregables: [], // Vacío - se definirán después
                flujos: [],      // Vacío - se definirán después
                creado_por: "@masterproject", // Temporal - luego será el usuario actual
                fecha_creacion: new Date().toISOString()
            };

            // Añadir al store
            if (window.store) {
                const state = window.store.getState();
                
                // Verificar si ya existe un proyecto con ese ID
                const existe = state.projects.some(p => p.id === data.ID);
                if (existe) {
                    alert(`❌ Ya existe un proyecto con ID ${data.ID}`);
                    return;
                }
                
                state.projects.push(nuevoProyecto);
                window.store.saveState();
                
                console.log('✅ Proyecto creado:', nuevoProyecto);
                alert(`✅ Proyecto ${nuevoProyecto.id} creado correctamente en sector ${sectorNombre}`);
                
                // Redirigir a la vista del proyecto
                if (window.router) {
                    window.router.navigate('project', nuevoProyecto.id);
                } else {
                    window.location.href = `/project/${nuevoProyecto.id}`;
                }
            } else {
                console.error('❌ Store no disponible');
                alert('❌ Error al guardar el proyecto');
            }
        });
    } else {
        console.error('❌ Formulario no encontrado');
    }
};

console.log('✅ Create Project page loaded con todos los sectores');
