// /v3/js/pages/create-project.js
// Página para crear nuevos proyectos - v3.5

console.log('📦 Cargando create-project.js...');

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

// EXPORTAR FUNCIÓN GLOBALMENTE (debe estar definida ANTES de usarse)
window.renderCreateProject = function(params) {
    console.log('📁 renderCreateProject ejecutado con params:', params);
    
    const fields = [
        {
            nombre: "Nombre del Proyecto",
            tipo: "text",
            required: true,
            placeholder: "Ej: Proyecto Alpha"
        },
        {
            nombre: "ID",
            tipo: "text",
            required: true,
            placeholder: "#proyecto-alpha",
            help: "Debe empezar con # y usar guiones. Ej: #nombre-del-proyecto",
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

// Manejador del envío del formulario
function handleFormSubmit(e) {
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
        nombre: data["Nombre del Proyecto"],
        sector: sectorId,
        sector_nombre: sectorNombre,
        sector_emoji: sectorObj?.emoji || "📁",
        descripcion: data.Descripción || '',
        objetivos: objetivosLista,
        roles: [],
        creado_por: "@masterproject",
        fecha_creacion: new Date().toISOString()
    };

    // Añadir al store
    if (window.store) {
        // Verificar si ya existe
        const existe = window.store.getState().projects.some(p => p.id === data.ID);
        if (existe) {
            alert(`❌ Ya existe un proyecto con ID ${data.ID}`);
            return;
        }
        
        window.store.addProject(nuevoProyecto);
        console.log('✅ Proyecto creado:', nuevoProyecto);
        alert(`✅ Proyecto ${nuevoProyecto.id} creado correctamente`);
        
        // Redirigir
        if (window.router) {
            window.router.navigate(`project-detail?id=${encodeURIComponent(nuevoProyecto.id)}`);
        }
    } else {
        console.error('❌ Store no disponible');
        alert('❌ Error al guardar el proyecto');
    }
}

// Configurar eventos (se llama desde el router después de renderizar)
window.setupCreateProjectEvents = function() {
    console.log('📁 setupCreateProjectEvents iniciado');
    
    let attempts = 0;
    const maxAttempts = 30; // 30 * 100ms = 3 segundos
    
    function tryAttach() {
        const form = document.getElementById('create-project-form');
        if (form) {
            console.log('✅ Formulario encontrado, adjuntando evento');
            form.removeEventListener('form-submit', handleFormSubmit);
            form.addEventListener('form-submit', handleFormSubmit);
            return true;
        } else {
            if (attempts < maxAttempts) {
                attempts++;
                console.log(`⏳ Intento ${attempts}/${maxAttempts}: Esperando formulario...`);
                setTimeout(tryAttach, 100);
            } else {
                console.error('❌ No se pudo encontrar el formulario después de varios intentos');
                // Mostrar mensaje al usuario
                const container = document.getElementById('main-content');
                if (container) {
                    container.innerHTML += `
                        <div class="error-message" style="background: #fee; padding: 1rem; margin: 1rem; border-radius: 8px;">
                            ⚠️ Error al cargar el formulario. 
                            <button onclick="location.reload()">Recargar página</button>
                        </div>
                    `;
                }
            }
        }
    }
    
    tryAttach();
};

console.log('✅ create-project.js cargado correctamente');
console.log('📌 window.renderCreateProject definido:', !!window.renderCreateProject);
console.log('📌 window.setupCreateProjectEvents definido:', !!window.setupCreateProjectEvents);
