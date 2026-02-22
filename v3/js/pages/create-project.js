// /v3/js/pages/create-project.js - VERSIÓN MÍNIMA PARA TEST
console.log('🔥 create-project.js se está ejecutando');

// Definir función render
window.renderCreateProject = function() {
    console.log('🔥 renderCreateProject ejecutada');
    return '<div style="padding: 2rem; background: green; color: white; font-size: 2rem;">✅ FUNCIONA!</div>';
};

// Definir función setup - EL NOMBRE DEBE SER EXACTAMENTE ESTE
window.setupCreateProjectEvents = function() {
    console.log('🔥 setupCreateProjectEvents ejecutada');
    alert('✅ Setup ejecutado correctamente');
};

console.log('🔥 Funciones definidas:');
console.log('  - renderCreateProject:', typeof window.renderCreateProject);
console.log('  - setupCreateProjectEvents:', typeof window.setupCreateProjectEvents);
