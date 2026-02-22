// /v3/js/pages/create-project.js
console.log('📦 Cargando create-project.js...');

// Guarda para evitar doble carga
if (window.__createProjectJsLoaded) {
    console.log('⏩ create-project.js ya cargado');
    return;
}
window.__createProjectJsLoaded = true;

// SOLO UNA DECLARACIÓN DE SECTORES
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
    // ... (código existente, igual que tienes)
};

window.setupCreateProjectEvents = function() {
    // ... (código existente)
};

console.log('✅ create-project.js cargado correctamente');
