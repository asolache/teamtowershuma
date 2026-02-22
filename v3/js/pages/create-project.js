// /v3/js/pages/create-project.js
// Página para crear nuevos proyectos - TeamTowers Humà v3.5
// Con todos los sectores, validaciones y experiencia de usuario mejorada

console.log('📦 Cargando create-project.js...');

// ===== CONSTANTES =====
// Lista completa de sectores (también disponible en APP_CONSTANTS, pero la mantenemos local por si acaso)
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

// ===== FUNCIÓN PRINCIPAL DE RENDERIZADO =====
window.renderCreateProject = function(params) {
    console.log('📁 renderCreateProject ejecutado con params:', params);
    
    try {
        // Preparar opciones del selector de sectores con emojis y nombres
        const sectorOptions = SECTORES.map(s => ({
            value: s.id,
            label: `${s.emoji} ${s.nombre}`,
            descripcion: s.descripcion
        }));

        // Campos para el formulario (formato compatible con tt-form)
        const fields = [
            {
                nombre: "Nombre del Proyecto",
                tipo: "text",
                required: true,
                placeholder: "Ej: Plataforma de Gestión de Castells",
                help: "Elige un nombre descriptivo para tu proyecto"
            },
            {
                nombre: "ID",
                tipo: "text",
                required: true,
                placeholder: "#gestion-castells",
                help: "Debe empezar con # y usar guiones. Ej: #nombre-del-proyecto",
                pattern: "^#[a-z0-9-]+$",
                patternError: "El ID debe empezar con # y solo contener minúsculas, números y guiones"
            },
            {
                nombre: "Sector",
                tipo: "select",
                required: true,
                options: sectorOptions.map(o => o.label),
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

        // HTML completo con diseño mejorado
        return `
            <div class="create-project-container">
                <!-- Cabecera -->
                <div class="page-header">
                    <h1>📁 Crear Nuevo Proyecto</h1>
                    <p class="page-description">
                        Define un nuevo proyecto para comenzar a mapear su flujo de valor. 
                        Cada proyecto tendrá sus propios roles, entregables y transacciones.
                    </p>
                </div>

                <!-- Formulario principal -->
                <div class="card form-card">
                    <tt-form 
                        id="create-project-form"
                        fields='${JSON.stringify(fields).replace(/'/g, "&apos;")}'
                        submit-label="🚀 Crear Proyecto"
                    ></tt-form>
                </div>

                <!-- Panel informativo de sectores -->
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

                <!-- Tips adicionales -->
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
        
    } catch (error) {
        console.error('❌ Error en renderCreateProject:', error);
        return `
            <div class="error-container card">
                <h2 class="error-title">❌ Error al cargar el formulario</h2>
                <p>${error.message}</p>
                <button onclick="location.reload()" class="btn-primary">Reintentar</button>
            </div>
        `;
    }
};

// ===== MANEJADOR DEL ENVÍO DEL FORMULARIO =====
function handleFormSubmit(e) {
    console.log('📝 handleFormSubmit iniciado', e.detail);
    
    try {
        const data = e.detail;
        
        // Validar ID
        if (!data.ID || !data.ID.startsWith('#')) {
            alert('❌ El ID debe empezar con #');
            return;
        }
        
        // Validar formato del ID (solo minúsculas, números y guiones después de #)
        const idPattern = /^#[a-z0-9-]+$/;
        if (!idPattern.test(data.ID)) {
            alert('❌ El ID solo puede contener minúsculas, números y guiones después de #');
            return;
        }
        
        // Extraer sector (buscar por nombre ya que el select envía el texto completo con emoji)
        const sectorSeleccionado = data.Sector;
        const sectorObj = SECTORES.find(s => sectorSeleccionado.includes(s.nombre));
        
        if (!sectorObj) {
            console.error('Sector no encontrado:', sectorSeleccionado);
            alert('❌ Sector no válido');
            return;
        }
        
        // Procesar objetivos (convertir texto en lista)
        const objetivosLista = data.Objetivos ? 
            data.Objetivos.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0 && !line.startsWith('•') && !line.startsWith('-'))
            : [];
        
        // Crear objeto de proyecto
        const nuevoProyecto = {
            id: data.ID,
            nombre: data["Nombre del Proyecto"],
            sector: sectorObj.id,
            sector_nombre: sectorObj.nombre,
            sector_emoji: sectorObj.emoji,
            descripcion: data.Descripción || '',
            objetivos: objetivosLista,
            roles: [],
            creado_por: "@masterproject", // Temporal - luego será el usuario actual
            fecha_creacion: new Date().toISOString(),
            metadata: {
                version: "3.5",
                fuente: "create-project-form"
            }
        };

        console.log('📦 Proyecto a guardar:', nuevoProyecto);

        // Añadir al store
        if (!window.store) {
            throw new Error('Store no disponible');
        }

        // Verificar si ya existe un proyecto con ese ID
        const existe = window.store.getState().projects.some(p => p.id === data.ID);
        if (existe) {
            alert(`❌ Ya existe un proyecto con ID ${data.ID}`);
            return;
        }

        // Guardar proyecto
        window.store.addProject(nuevoProyecto);
        
        console.log('✅ Proyecto creado exitosamente:', nuevoProyecto);
        
        // Mostrar mensaje de éxito
        showSuccessMessage(`✅ Proyecto ${nuevoProyecto.id} creado correctamente en sector ${sectorObj.nombre}`);
        
        // Redirigir al detalle del proyecto
        setTimeout(() => {
            if (window.router) {
                window.router.navigate(`project-detail`, { id: nuevoProyecto.id });
            } else {
                window.location.href = `/?page=project-detail&id=${encodeURIComponent(nuevoProyecto.id)}`;
            }
        }, 1500);
        
    } catch (error) {
        console.error('❌ Error al guardar el proyecto:', error);
        alert(`❌ Error al guardar el proyecto: ${error.message}`);
    }
}

// ===== FUNCIÓN PARA MOSTRAR MENSAJE DE ÉXITO =====
function showSuccessMessage(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-testing);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: var(--shadow-pom-dalt);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== CONFIGURACIÓN DE EVENTOS =====
window.setupCreateProjectEvents = function() {
    console.log('🔧 setupCreateProjectEvents iniciado');
    
    let attempts = 0;
    const maxAttempts = 50; // 50 * 100ms = 5 segundos
    
    function tryAttachEvents() {
        const form = document.getElementById('create-project-form');
        
        if (form) {
            console.log('✅ Formulario encontrado, adjuntando eventos');
            
            // Eliminar listener previo si existe (para evitar duplicados)
            form.removeEventListener('form-submit', handleFormSubmit);
            
            // Adjuntar nuevo listener
            form.addEventListener('form-submit', handleFormSubmit);
            
            console.log('✅ Evento form-submit adjuntado correctamente');
            
            // Añadir interacción a las tarjetas de sector
            setupSectorCardsInteraction();
            
            return true;
        } else {
            if (attempts < maxAttempts) {
                attempts++;
                console.log(`⏳ Intento ${attempts}/${maxAttempts}: Esperando formulario...`);
                setTimeout(tryAttachEvents, 100);
            } else {
                console.error('❌ No se pudo encontrar el formulario después de varios intentos');
                
                // Mostrar mensaje de error al usuario
                const container = document.getElementById('main-content');
                if (container) {
                    container.innerHTML += `
                        <div class="error-message" style="background: #fee; padding: 1rem; margin: 1rem; border-radius: 8px; border-left: 4px solid #c00;">
                            <strong>⚠️ Error de carga</strong>
                            <p>No se pudo cargar el formulario correctamente.</p>
                            <button onclick="location.reload()" class="btn-primary">Recargar página</button>
                        </div>
                    `;
                }
            }
        }
    }
    
    tryAttachEvents();
};

// ===== INTERACCIÓN CON TARJETAS DE SECTOR =====
function setupSectorCardsInteraction() {
    const sectorCards = document.querySelectorAll('.sector-card');
    const sectorSelect = document.querySelector('#create-project-form select[name="Sector"]');
    
    if (!sectorCards.length || !sectorSelect) return;
    
    sectorCards.forEach(card => {
        card.addEventListener('click', () => {
            const sectorId = card.dataset.sector;
            const sector = SECTORES.find(s => s.id === sectorId);
            
            if (sector && sectorSelect) {
                // Buscar la opción que contiene el nombre del sector
                const optionText = `${sector.emoji} ${sector.nombre}`;
                const options = Array.from(sectorSelect.options);
                const optionIndex = options.findIndex(opt => opt.text.includes(sector.nombre));
                
                if (optionIndex !== -1) {
                    sectorSelect.selectedIndex = optionIndex;
                    
                    // Disparar evento change para que el formulario se actualice
                    sectorSelect.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // Feedback visual
                    sectorCards.forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                }
            }
        });
    });
}

// ===== ESTILOS ADICIONALES (se inyectan en el head) =====
(function injectStyles() {
    const styleId = 'create-project-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .create-project-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .page-header {
            margin-bottom: 2rem;
        }
        
        .page-header h1 {
            color: var(--tt-primary);
            margin-bottom: 0.5rem;
        }
        
        .page-description {
            color: var(--color-documentacion);
            font-size: 1.1rem;
        }
        
        .form-card {
            margin-bottom: 2rem;
        }
        
        .sectors-info {
            margin-bottom: 2rem;
        }
        
        .sectors-info h3 {
            margin-bottom: 0.5rem;
        }
        
        .sectors-info-intro {
            color: var(--color-documentacion);
            margin-bottom: 1.5rem;
        }
        
        .sectors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
        }
        
        .sector-card {
            background: var(--bg-card);
            border: 1px solid var(--border-light);
            border-radius: 8px;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .sector-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-tronc);
            border-color: var(--tt-accent);
        }
        
        .sector-card.selected {
            border-color: var(--tt-accent);
            background: rgba(245, 158, 11, 0.05);
            box-shadow: var(--shadow-tronc);
        }
        
        .sector-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        .sector-emoji {
            font-size: 1.5rem;
        }
        
        .sector-nombre {
            font-weight: 600;
            color: var(--tt-secondary);
        }
        
        .sector-descripcion {
            font-size: 0.9rem;
            color: var(--color-documentacion);
            margin: 0;
        }
        
        .tips-card {
            background: linear-gradient(135deg, var(--bg-card) 0%, #f8fafc 100%);
        }
        
        .tips-list {
            margin: 0;
            padding-left: 1.5rem;
        }
        
        .tips-list li {
            margin-bottom: 0.5rem;
            color: var(--tt-secondary);
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .success-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-testing);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: var(--shadow-pom-dalt);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        }
    `;
    
    document.head.appendChild(style);
    console.log('🎨 Estilos de create-project inyectados');
})();

console.log('✅ create-project.js cargado completamente');
console.log('📌 Funciones disponibles:', {
    renderCreateProject: typeof window.renderCreateProject,
    setupCreateProjectEvents: typeof window.setupCreateProjectEvents
});
