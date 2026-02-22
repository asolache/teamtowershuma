// ===== CREATE-PROJECT.JS - VERSIÓN DEBUG =====
console.log('🔍 [1] Inicio del archivo');

// Lista completa de sectores
console.log('🔍 [2] Definiendo SECTORES');
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
console.log('🔍 [3] SECTORES definidos, longitud:', SECTORES.length);

// Definir función principal
console.log('🔍 [4] Definiendo window.renderCreateProject');
window.renderCreateProject = function(params) {
    console.log('🔍 [RENDER] Función renderCreateProject ejecutada', params);
    
    try {
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
        console.log('🔍 [RENDER] Fields creados:', fields.length);

        const html = `
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
        console.log('🔍 [RENDER] HTML generado');
        return html;
        
    } catch (error) {
        console.error('🔍 [RENDER] ERROR:', error);
        return `<div class="error">Error al renderizar: ${error.message}</div>`;
    }
};
console.log('🔍 [5] window.renderCreateProject definida:', typeof window.renderCreateProject);

// Manejador del envío
console.log('🔍 [6] Definiendo handleFormSubmit');
function handleFormSubmit(e) {
    console.log('🔍 [SUBMIT] Formulario enviado', e.detail);
    // ... (código existente)
}
console.log('🔍 [7] handleFormSubmit definida:', typeof handleFormSubmit);

// Setup de eventos
console.log('🔍 [8] Definiendo window.setupCreateProjectEvents');
window.setupCreateProjectEvents = function() {
    console.log('🔍 [SETUP] Iniciando setupCreateProjectEvents');
    
    let attempts = 0;
    const maxAttempts = 30;
    
    function tryAttach() {
        console.log(`🔍 [SETUP] Intento ${attempts + 1}/${maxAttempts}`);
        const form = document.getElementById('create-project-form');
        
        if (form) {
            console.log('🔍 [SETUP] ✅ Formulario encontrado');
            form.removeEventListener('form-submit', handleFormSubmit);
            form.addEventListener('form-submit', handleFormSubmit);
            console.log('🔍 [SETUP] Evento adjuntado');
            return true;
        } else {
            if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryAttach, 100);
            } else {
                console.error('🔍 [SETUP] ❌ Formulario no encontrado después de múltiples intentos');
            }
        }
    }
    
    tryAttach();
};
console.log('🔍 [9] window.setupCreateProjectEvents definida:', typeof window.setupCreateProjectEvents);

console.log('🔍 [10] FIN del archivo create-project.js');
console.log('📌 Estado final - renderCreateProject:', typeof window.renderCreateProject);
console.log('📌 Estado final - setupCreateProjectEvents:', typeof window.setupCreateProjectEvents);
