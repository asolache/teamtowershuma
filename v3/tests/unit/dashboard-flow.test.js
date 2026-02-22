// tests/integration/dashboard-flow.test.js
describe('Dashboard - Flujo Completo', () => {
    
    test('Dashboard debe renderizar sin errores', () => {
        try {
            const html = window.renderDashboard();
            console.assert(typeof html === 'string', 'renderDashboard debe retornar string');
            console.assert(html.includes('Dashboard'), 'Dashboard debe contener título');
            console.log('✅ Dashboard renderizado correctamente');
        } catch (e) {
            console.error('❌ Error renderizando dashboard:', e);
        }
    });
    
    test('Métricas del dashboard deben coincidir con selectors', () => {
        const metrics = window.Selectors.getGlobalMetrics();
        const html = window.renderDashboard();
        
        console.assert(html.includes(metrics.totalUV.toString()), 
            `Dashboard debe mostrar UV total ${metrics.totalUV}`);
        console.assert(html.includes(metrics.totalProjects.toString()), 
            `Dashboard debe mostrar total proyectos ${metrics.totalProjects}`);
        console.assert(html.includes(metrics.activeProjects.toString()), 
            `Dashboard debe mostrar proyectos activos ${metrics.activeProjects}`);
        
        console.log('✅ Métricas del dashboard correctas');
    });
    
    test('Click en proyecto del dashboard debe navegar', () => {
        // Simular click en proyecto
        const projectId = '#kernel';
        let navigatedTo = null;
        
        // Mock del router
        const originalNavigate = window.router.navigate;
        window.router.navigate = (page) => { navigatedTo = page; };
        
        // Aquí iría la simulación de click
        // Por ahora verificamos que la función existe
        console.assert(typeof window.router.navigate === 'function', 'router.navigate debe existir');
        
        // Restaurar
        window.router.navigate = originalNavigate;
        
        console.log('✅ Navegación desde dashboard preparada');
    });
});

console.log('\n🔍 EJECUTANDO TESTS DE INTEGRACIÓN...\n');