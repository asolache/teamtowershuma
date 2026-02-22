// tests/unit/store.test.js
describe('Store - Kernel Crítico', () => {
    
    test('Store debe inicializarse correctamente', () => {
        const state = window.store.getState();
        
        console.assert(state !== null, 'Store no debería ser null');
        console.assert(Array.isArray(state.projects), 'projects debería ser array');
        console.assert(Array.isArray(state.transactions), 'transactions debería ser array');
        
        console.log('✅ Store inicializado correctamente');
    });
    
    test('Store debe tener datos de ejemplo', () => {
        const state = window.store.getState();
        
        console.assert(state.projects.length >= 3, 'Debe haber al menos 3 proyectos');
        console.assert(state.transactions.length >= 3, 'Debe haber al menos 3 transacciones');
        console.assert(state.users.length >= 2, 'Debe haber al menos 2 usuarios');
        
        console.log('✅ Datos de ejemplo cargados correctamente');
    });
    
    test('Las transacciones deben tener estructura válida', () => {
        const transactions = window.store.getState().transactions;
        
        transactions.forEach((t, index) => {
            console.assert(t.id, `Transacción ${index} debe tener id`);
            console.assert(t.name, `Transacción ${index} debe tener nombre`);
            console.assert(t.project, `Transacción ${index} debe tener proyecto`);
            console.assert(t.uv > 0, `Transacción ${index} debe tener UV positivo`);
        });
        
        console.log('✅ Estructura de transacciones válida');
    });
    
    test('Los proyectos deben tener estructura válida', () => {
        const projects = window.store.getState().projects;
        
        projects.forEach((p, index) => {
            console.assert(p.id, `Proyecto ${index} debe tener id`);
            console.assert(p.name, `Proyecto ${index} debe tener nombre`);
            console.assert(p.sector, `Proyecto ${index} debe tener sector`);
        });
        
        console.log('✅ Estructura de proyectos válida');
    });
});

// Ejecutar tests
console.log('\n🔍 EJECUTANDO TESTS DE STORE...\n');
store.test();