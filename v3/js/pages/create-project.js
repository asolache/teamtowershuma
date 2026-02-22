// /v3/js/pages/create-project.js
// VERSIÓN MÍNIMA ABSOLUTA - Solo lo esencial

console.log('🔥 ARCHIVO CARGADO - LÍNEA 1');

// Definir SECTORES (necesario para el render)
const SECTORES = [
    { id: "tecnologia", nombre: "Tecnología, Software e IA", emoji: "💻" },
    { id: "salud", nombre: "Salud, Biotech y Bienestar", emoji: "⚕️" },
    { id: "turismo", nombre: "Turismo, Viajes y Hostelería", emoji: "✈️" }
];

// Función render - DEFINIDA PRIMERO
window.renderCreateProject = function(params) {
    console.log('🔥 renderCreateProject EJECUTADA');
    
    const fields = [
        {
            nombre: "Nombre del Proyecto",
            tipo: "text",
            required: true,
            placeholder: "Nombre"
        },
        {
            nombre: "ID",
            tipo: "text",
            required: true,
            placeholder: "#proyecto"
        },
        {
            nombre: "Sector",
            tipo: "select",
            required: true,
            options: SECTORES.map(s => s.emoji + " " + s.nombre)
        }
    ];

    return `
        <div class="card" style="padding: 2rem;">
            <h2>📁 Crear Proyecto (Modo Prueba)</h2>
            <tt-form 
                id="create-project-form"
                fields='${JSON.stringify(fields)}'
                submit-label="Crear"
            ></tt-form>
            <div style="margin-top: 2rem; padding: 1rem; background: #e8f5e9; border-radius: 8px;">
                <p>✅ Modo prueba - Si ves esto, el render funciona</p>
            </div>
        </div>
    `;
};

// Función setup - DEFINIDA INMEDIATAMENTE DESPUÉS
window.setupCreateProjectEvents = function() {
    console.log('🔥 setupCreateProjectEvents EJECUTADA');
    
    const form = document.getElementById('create-project-form');
    if (form) {
        console.log('✅ Formulario encontrado');
        form.addEventListener('form-submit', (e) => {
            e.preventDefault();
            console.log('📝 Formulario enviado', e.detail);
            alert('Formulario enviado - modo prueba');
        });
    } else {
        console.log('❌ Formulario NO encontrado');
        // Reintentar
        setTimeout(() => {
            const form2 = document.getElementById('create-project-form');
            if (form2) {
                console.log('✅ Formulario encontrado en reintento');
                window.setupCreateProjectEvents();
            }
        }, 500);
    }
};

// Log final
console.log('🔥 Funciones definidas:', {
    render: typeof window.renderCreateProject,
    setup: typeof window.setupCreateProjectEvents
});
