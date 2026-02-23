// /v3/js/pages/create-project.js
console.log('📦 Cargando create-project.js...');

// Guarda para evitar doble carga
if (window.__createProjectJsLoaded) {
    console.log('⏩ create-project.js ya cargado');
    return;
}
window.__createProjectJsLoaded = true;

const SECTORES = [
    { id: "tecnologia", nombre: "Tecnología, Software e IA", emoji: "💻", descripcion: "SaaS, apps, IA aplicada..." },
    { id: "salud", nombre: "Salud, Biotech y Bienestar", emoji: "⚕️", descripcion: "Healthtech, medtech..." },
    { id: "turismo", nombre: "Turismo, Viajes y Hostelería", emoji: "✈️", descripcion: "Traveltech, reservas..." },
    { id: "fintech", nombre: "Fintech y Servicios Financieros", emoji: "💰", descripcion: "Pagos, lending..." },
    { id: "comercio", nombre: "Comercio Electrónico y Distribución", emoji: "🛒", descripcion: "E-commerce, marketplaces..." },
    { id: "educacion", nombre: "Educación y Edtech", emoji: "📚", descripcion: "Plataformas formativas..." },
    { id: "energia", nombre: "Energía, Sostenibilidad y Cleantech", emoji: "🌱", descripcion: "Renovables, eficiencia..." },
    { id: "construccion", nombre: "Construcción, Inmobiliario y Proptech", emoji: "🏗️", descripcion: "Obras, smart buildings..." },
    { id: "consultoria", nombre: "Servicios Profesionales y Consultoría B2B", emoji: "🤝", descripcion: "Marketing digital, legaltech..." }
];

window.renderCreateProject = function(params) {
    console.log('📁 renderCreateProject ejecutado');
    
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
            placeholder: "¿Qué valor genera este proyecto?"
        }
    ];

    return `
        <div class="card">
            <h2>📁 Crear Nuevo Proyecto</h2>
            <tt-form 
                id="create-project-form"
                fields='${JSON.stringify(fields)}'
                submit-label="Crear Proyecto"
            ></tt-form>
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
        console.log('📝 Datos:', data);
        
        if (!data.ID.startsWith('#')) {
            alert('❌ El ID debe empezar con #');
            return;
        }
        
        const sectorObj = SECTORES.find(s => data.Sector.includes(s.nombre));
        const nuevoProyecto = {
            id: data.ID,
            nombre: data["Nombre del Proyecto"],
            sector: sectorObj?.id || "tecnologia",
            sector_nombre: sectorObj?.nombre || data.Sector,
            sector_emoji: sectorObj?.emoji || "📁",
            descripcion: data.Descripción || '',
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
            alert(`✅ Proyecto creado`);
            if (window.router) window.router.navigate('projects');
        }
    });
};

console.log('✅ create-project.js cargado correctamente');
