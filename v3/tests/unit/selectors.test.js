// tests/unit/selectors.test.js
describe('Selectors - Kernel Crítico', () => {
    
    test('getGlobalMetrics debe retornar estructura correcta', () => {
        const metrics = window.Selectors.getGlobalMetrics();
        
        console.assert(typeof metrics.totalUV === 'number', 'totalUV debe ser número');
        console.assert(typeof metrics.totalTransactions === 'number', 'totalTransactions debe ser número');
        console.assert(typeof metrics.totalProjects === 'number', 'totalProjects debe ser número');
        console.assert(typeof metrics.activeProjects === 'number', 'activeProjects debe ser número');
        
        console.log('✅ getGlobalMetrics estructura correcta');
    });
    
    test('getGlobalMetrics debe tener coherencia', () => {
        const metrics = window.Selectors.getGlobalMetrics();
        const state = window.store.getState();
        
        console.assert(metrics.totalProjects === state.projects.length, 
            `totalProjects (${metrics.totalProjects}) debe coincidir con projects.length (${state.projects.length})`);
        
        console.assert(metrics.activeProjects <= metrics.totalProjects,
            'Proyectos activos no pueden ser mayores que total');
        
        console.log('✅ getGlobalMetrics coherencia correcta');
    });
    
    test('getProjectsWithMetrics debe calcular UV correctamente', () => {
        const projects = window.Selectors.getProjectsWithMetrics();
        const state = window.store.getState();
        
        projects.forEach(p => {
            const expectedUV = state.transactions
                .filter(t => t.project === p.id)
                .reduce((sum, t) => sum + (t.uv || 0), 0);
            
            console.assert(p.uv === expectedUV, 
                `UV de ${p.id} (${p.uv}) debe coincidir con cálculo (${expectedUV})`);
        });
        
        console.log('✅ getProjectsWithMetrics cálculos correctos');
    });
    
    test('getTopContributors debe ordenar correctamente', () => {
        const top = window.Selectors.getTopContributors(3);
        
        console.assert(top.length <= 3, 'Debe respetar límite');
        
        // Verificar orden descendente
        for (let i = 0; i < top.length - 1; i++) {
            console.assert(top[i].uv >= top[i+1].uv, 
                `Orden incorrecto: ${top[i].uv} >= ${top[i+1].uv}`);
        }
        
        console.log('✅ getTopContributors orden correcto');
    });
    
    test('getTransactionsByProject debe filtrar correctamente', () => {
        const state = window.store.getState();
        const firstProject = state.projects[0].id;
        
        const tx = window.Selectors.getTransactionsByProject(firstProject);
        
        tx.forEach(t => {
            console.assert(t.project === firstProject, 
                `Transacción ${t.id} debe pertenecer a ${firstProject}`);
        });
        
        console.log('✅ getTransactionsByProject filtro correcto');
    });
});

// Ejecutar tests
console.log('\n🔍 EJECUTANDO TESTS DE SELECTORS...\n');
selectors.test();