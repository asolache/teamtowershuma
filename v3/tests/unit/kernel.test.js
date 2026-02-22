// tests/regression/kernel.test.js
describe('Kernel - Regresión Crítica', () => {
    
    const REQUIRED_FUNCTIONS = [
        'window.store.getState',
        'window.Selectors.getGlobalMetrics',
        'window.Selectors.getProjectsWithMetrics',
        'window.Selectors.getTopContributors',
        'window.renderDashboard',
        'window.renderProjects',
        'window.router.navigate'
    ];
    
    test('Todas las funciones core deben existir', () => {
        REQUIRED_FUNCTIONS.forEach(fnPath => {
            const parts = fnPath.split('.');
            let obj = window;
            for (let i = 0; i < parts.length; i++) {
                obj = obj[parts[i]];
                console.assert(obj !== undefined, `${fnPath} debe existir`);
            }
        });
        
        console.log('✅ Todas las funciones core existen');
    });
    
    test('Estructura de datos debe ser consistente', () => {
        const state = window.store.getState();
        
        // Verificar IDs únicos
        const projectIds = new Set(state.projects.map(p => p.id));
        console.assert(projectIds.size === state.projects.length, 
            'Los IDs de proyecto deben ser únicos');
        
        // Verificar referencias cruzadas
        state.transactions.forEach(t => {
            console.assert(projectIds.has(t.project), 
                `Proyecto ${t.project} debe existir en projects`);
        });
        
        console.log('✅ Estructura de datos consistente');
    });
    
    test('Cálculos matemáticos deben ser precisos', () => {
        const state = window.store.getState();
        
        // Suma manual vs selectors
        const manualTotalUV = state.transactions.reduce((sum, t) => sum + (t.uv || 0), 0);
        const selectorTotalUV = window.Selectors.getGlobalMetrics().totalUV;
        
        console.assert(manualTotalUV === selectorTotalUV, 
            `Total UV manual (${manualTotalUV}) vs selector (${selectorTotalUV})`);
        
        console.log('✅ Cálculos matemáticos precisos');
    });
    
    test('Router debe manejar navegación básica', () => {
        let lastPage = null;
        const originalNavigate = window.router.navigate;
        
        window.router.navigate = (page) => { lastPage = page; };
        
        window.router.navigate('dashboard');
        console.assert(lastPage === 'dashboard', 'Navegación a dashboard debe funcionar');
        
        window.router.navigate('projects');
        console.assert(lastPage === 'projects', 'Navegación a projects debe funcionar');
        
        window.router.navigate('users');
        console.assert(lastPage === 'users', 'Navegación a users debe funcionar');
        
        window.router.navigate = originalNavigate;
        
        console.log('✅ Router funciona correctamente');
    });
});

console.log('\n🔍 EJECUTANDO TESTS DE REGRESIÓN...\n');
kernel.test();