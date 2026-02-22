// /v3/js/pages/create-project.js
// Página para crear nuevos proyectos - v3.5

console.log('📦 Cargando create-project.js...');

// Guarda para evitar doble carga
if (window.__createProjectJsLoaded) {
    console.log('⏩ create-project.js ya cargado');
    return;
}
window.__createProjectJsLoaded = true;

// SOLO UNA DECLARACIÓN DE SECTORES
const SECTORES = [
    { id: "tecnologia", nombre: "Tecnología, Software e IA", emoji: "💻", descripcion: "SaaS, apps, IA aplicada, ciberseguridad, productividad digital, deeptech…" },
    { id: "salud", nombre: "Salud, Biotech y Bienestar", emoji: "⚕️", descripcion: "Healthtech, medtech, clínicas, telemedicina, life sciences, nutrición…" },
    { id: "turismo", nombre: "Turismo, Viajes y Hostelería", emoji: "✈️", descripcion: "Traveltech, reservas, experiencias, hoteles, ocio…" },
    { id: "fintech", nombre: "Fintech y Servicios Financieros", emoji: "💰", descripcion: "Pagos, lending, insurtech, wealthtech…" },
    { id: "comercio", nombre: "Comercio Electrónico y Distribución", emoji: "🛒", descripcion: "E-commerce, marketplaces, logística, retail digital…" },
    { id: "educacion", nombre: "Educación y Edtech", emoji: "📚", descripcion: "Plataformas formativas, e-learning, reskilling, corporate training…" },
    { id: "energia", nombre: "Energía, Sostenibilidad y Cleantech", emoji: "🌱", descripcion: "Renovables, eficiencia energética, circularidad, climate tech…" },
    { id: "construccion", nombre: "Construcción, Inmobiliario y Proptech", emoji: "🏗️", descripcion: "Obras, reformas, smart buildings, gestión propiedades, promoción…" },
    { id: "consultoria", nombre: "Servicios Profesionales y Consultoría B2B", emoji: "🤝", descripcion: "Marketing digital, diseño, legaltech, consultorías no-tech pura, agencias…" }
];

window.renderCreateProject = function(params) {
    console.log('📁 renderCreateProject ejecutado con params:', params);
    
    const fields = [
        {
            nombre: "Nombre del Proyecto",
            tipo: "text",
            required: true,
            placeholder: "Ej: Proyecto Alpha",
            help: "Elige un nombre descriptivo para tu proyecto"
        },
        {
            nombre: "ID",
            tipo: "text",
            required: true,
            placeholder: "#proyecto-alpha",
            help: "Debe empezar con # y usar guiones. Ej: #nombre-del-proyecto",
            pattern: "^#[a-z0-9-]+$",
            patternError: "El ID debe empezar con # y solo contener minúsculas, números y guiones"
        },
        {
            nombre: "Sector",
            tipo: "select",
            required: true,
            options: SECTORES.map(s => s.emoji + " " + s.nombre),
            help: "Selecciona el sector al que pertenece tu proyecto"
        },
        {
            nombre: "Descripción",
            tipo: "textarea",
            required: false,
            placeholder: "¿Qué problema resuelve este proyecto? ¿Qué valor genera?",
            help: "Describe el propósito y alcance del proyecto"
        },
        {
            nombre: "Objetivos",
            tipo: "textarea",
            required: false,
            placeholder: "• Objetivo 1\n• Objetivo 2\n• Objetivo 3",
            help: "Lista los objetivos principales (uno por línea)"
        }
    ];

    return `
        <div class="create-project-container">
            <div class="page-header">
                <h1>📁 Crear Nuevo Proyecto</h1>
                <p class="page-description">
                    Define un nuevo proyecto para comenzar a mapear su flujo de valor. 
                    Cada proyecto tendrá sus propios roles, entregables y transacciones.
                </p>
            </div>

            <div class="card form-card">
                <tt-form 
                    id="create-project-form"
                    fields='${JSON.stringify(fields).replace(/'/g, "&apos;")}'
                    submit-label="🚀 Crear Proyecto"
                ></tt-form>
            </div>

            <div class="card sectors-info">
                <h3>📋 Guía rápida de sectores</h3>
                <p class="sectors-info-intro">
                    Selecciona el sector que mejor describa tu proyecto. Esto ayudará a 
                    sugerir roles y entregables apropiados.
                </p>
                
                <div class="sectors-grid">
                    ${SECTORES.map(s => `
                        <div class="sector-card" data-sector="${s.id}">
                            <div class="sector-header">
                                <span class="sector-emoji">${s.emoji}</span>
                                <span class="sector-nombre">${s.nombre}</span>
                            </div>
                            <p class="sector-descripcion">${s.descripcion}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card tips-card">
                <h3>💡 Consejos para crear un buen proyecto</h3>
                <ul class="tips-list">
                    <li><strong>ID único:</strong> El identificador debe ser único en el sistema y seguir el formato #nombre-del-proyecto</li>
                    <li><strong>Descripción clara:</strong> Explica qué valor aporta el proyecto y quiénes son los beneficiarios</li>
                    <li><strong>Objetivos específicos:</strong> Define metas concretas y medibles</li>
                    <li><strong>Sector adecuado:</strong> Ayuda al sistema a sugerir roles y entregables relevantes</li>
                </ul>
            </div>
        </div>
    `;
};

window.setupCreateProjectEvents = function() {
    console.log('🔧 setupCreateProjectEvents iniciado');
    
    const form = document.getElementById('create-project-form');
    if (!form) {
        console.error('❌ Formulario no encontrado');
        return;
    }

    form.addEventListener('form-submit', (e) => {
        const data = e.detail;
        console.log('📝 Datos del formulario:', data);
        
        // Validar ID
        if (!data.ID.startsWith('#')) {
            alert('❌ El ID debe empezar con #');
            return;
        }
        
        // Extraer sector
        const sectorSeleccionado = data.Sector;
        const sectorObj = SECTORES.find(s => sectorSeleccionado.includes(s.nombre));
        const sectorId = sectorObj ? sectorObj.id : "tecnologia";
        const sectorNombre = sectorObj ? sectorObj.nombre : data.Sector;
        
        // Procesar objetivos
        const objetivosLista = data.Objetivos ? 
            data.Objetivos.split('\n').filter(line => line.trim() !== '') : [];
        
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

        if (window.store) {
            const existe = window.store.getState().projects.some(p => p.id === data.ID);
            if (existe) {
                alert(`❌ Ya existe un proyecto con ID ${data.ID}`);
                return;
            }
            
            window.store.addProject(nuevoProyecto);
            console.log('✅ Proyecto creado:', nuevoProyecto);
            alert(`✅ Proyecto ${nuevoProyecto.id} creado correctamente`);
            
            if (window.router) {
                window.router.navigate('projects');
            }
        } else {
            alert('❌ Error al guardar el proyecto');
        }
    });
};

console.log('✅ create-project.js cargado correctamente');
