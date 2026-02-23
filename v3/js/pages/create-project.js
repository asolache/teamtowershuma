// /v3/js/pages/create-project.js
console.log('📦 Cargando create-project.js...');

if (window.__createProjectJsLoaded) {
    console.log('⏩ create-project.js ya cargado');
} else {
    window.__createProjectJsLoaded = true;

    // Asegurar que usamos la lista canónica desde constants (o fallback local)
    const SECTORES_LOCALES = [
        { id: "tecnologia", nombre: "1. Tecnología, Software e IA", emoji: "💻" },
        { id: "salud", nombre: "2. Salud, Biotech y Bienestar", emoji: "⚕️" },
        { id: "turismo", nombre: "3. Turismo, Viajes y Hostelería", emoji: "✈️" },
        { id: "fintech", nombre: "4. Fintech y Servicios Financieros", emoji: "💰" },
        { id: "comercio", nombre: "5. Comercio Electrónico y Distribución", emoji: "🛒" },
        { id: "educacion", nombre: "6. Educación y Edtech", emoji: "📚" },
        { id: "energia", nombre: "7. Energía, Sostenibilidad y Cleantech", emoji: "🌱" },
        { id: "construccion", nombre: "8. Construcción, Inmobiliario y Proptech", emoji: "🏗️" },
        { id: "servicios", nombre: "9. Servicios Profesionales y Consultoría B2B", emoji: "🤝" },
        { id: "publico", nombre: "10. Sector Público y Tercer Sector", emoji: "🏛️" }
    ];

    window.renderCreateProject = function(params) {
        console.log('📁 renderCreateProject ejecutado');
        
        const sectoresParaMostrar = window.APP_CONSTANTS?.SECTORES || SECTORES_LOCALES;

        const fields = [
            { nombre: "Nombre del Proyecto", tipo: "text", required: true, placeholder: "Ej: Proyecto Alpha" },
            { nombre: "ID", tipo: "text", required: true, placeholder: "#proyecto-alpha", pattern: "^#[a-z0-9-]+$", patternError: "ID debe empezar con # y solo contener minúsculas, números y guiones" },
            { nombre: "Sector", tipo: "select", required: true, options: sectoresParaMostrar.map(s => s.emoji + " " + s.nombre) },
            { nombre: "Descripción", tipo: "textarea", required: false, placeholder: "¿Qué valor genera este proyecto?" }
        ];

        return `
            <div class="card">
                <h2>📁 Crear Nuevo Proyecto (VNA Ready)</h2>
                <p style="color: #888; margin-bottom: 20px;">El sistema inyectará automáticamente los roles y entregables base (Tronc) adaptados a tu sector.</p>
                <tt-form 
                    id="create-project-form"
                    fields='${JSON.stringify(fields)}'
                    submit-label="Crear Proyecto & Plantilla"
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
            
            if (!data.ID.startsWith('#')) {
                alert('❌ El ID debe empezar con #');
                return;
            }
            
            const sectoresActivos = window.APP_CONSTANTS?.SECTORES || SECTORES_LOCALES;
            const sectorObj = sectoresActivos.find(s => data.Sector.includes(s.nombre)) || sectoresActivos[0];
            
            // MAGIA VNA: Construir la plantilla de roles (Tronco + Ramas)
            let rolesInyectados = [];
            if (window.APP_CONSTANTS?.TRONCO_COMUN) {
                // Hacemos deep clone del tronco
                rolesInyectados = JSON.parse(JSON.stringify(window.APP_CONSTANTS.TRONCO_COMUN));
                
                // Si el sector tiene ramas específicas, las añadimos
                const ramasExtra = window.APP_CONSTANTS.PLANTILLAS_SECTOR?.[sectorObj.id];
                if (ramasExtra) {
                    rolesInyectados = [...rolesInyectados, ...JSON.parse(JSON.stringify(ramasExtra))];
                }
            }

            const nuevoProyecto = {
                id: data.ID,
                nombre: data["Nombre del Proyecto"],
                sector: sectorObj.id,
                sector_nombre: sectorObj.nombre,
                sector_emoji: sectorObj.emoji,
                descripcion: data.Descripción || '',
                roles: rolesInyectados, // ¡Aquí está la inyección!
                transacciones: [],
                creado_por: window.usuarioActual || "@masterproject",
                fecha_creacion: new Date().toISOString()
            };

            if (window.store) {
                const existe = window.store.getState().projects.some(p => p.id === data.ID);
                if (existe) {
                    alert(`❌ Ya existe un proyecto con ID ${data.ID}`);
                    return;
                }
                
                window.store.addProject(nuevoProyecto);
                alert(`✅ Proyecto ${nuevoProyecto.nombre} creado con ${rolesInyectados.length} roles base.`);
                if (window.router) window.router.navigate('projects');
            } else {
                console.error("Store no disponible globalmente.");
            }
        });
    };

    console.log('✅ create-project.js cargado correctamente (Plantillas inyectables)');
}
