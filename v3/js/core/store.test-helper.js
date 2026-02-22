// store.test-helper.js - Utilidades para tests (NUEVO)
const TestHelper = {
    // Resetear store a estado de prueba
    resetToMock: function() {
        console.log('🧪 Resetando store a estado de prueba...');
        
        // Limpiar localStorage
        localStorage.removeItem('teamtowers-v3');
        
        // Estado mínimo para tests
        const mockState = {
            version: "3.0.0",
            projects: [
                { id: '#test-1', name: 'Proyecto Test 1', sector: 'software' },
                { id: '#test-2', name: 'Proyecto Test 2', sector: 'blockchain' },
                { id: '#test-3', name: 'Proyecto Test 3', sector: 'software' }
            ],
            roles: [
                { id: '@test-role', name: 'Rol Test', multiplier: 1.0 }
            ],
            users: [
                { id: '@test-user', name: 'Usuario Test', type: 'human' }
            ],
            transactions: []
        };
        
        // Generar 1000 transacciones de prueba (para stress test)
        for (let i = 0; i < 1000; i++) {
            mockState.transactions.push({
                id: `tx-test-${i}`,
                name: `Transacción Test ${i}`,
                project: i % 3 === 0 ? '#test-1' : i % 3 === 1 ? '#test-2' : '#test-3',
                role: '@test-role',
                user: '@test-user',
                uv: Math.floor(Math.random() * 500) + 100,
                date: new Date(Date.now() - i * 86400000).toISOString()
            });
        }
        
        // Sobrescribir store (si existe método)
        if (window.store && typeof window.store.setState === 'function') {
            window.store.setState(mockState);
        } else {
            // Fallback: asignación directa (solo para test)
            window.store.state = mockState;
        }
        
        console.log(`🧪 Store resetado con ${mockState.transactions.length} transacciones`);
        return mockState;
    },
    
    // Medir tiempo de ejecución
    measureTime: function(fn, label = 'Operación') {
        const start = performance.now();
        fn();
        const end = performance.now();
        const duration = end - start;
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
        return duration;
    },
    
    // Generar datos de stress
    generateStressData: function(count = 1000) {
        const transactions = [];
        for (let i = 0; i < count; i++) {
            transactions.push({
                id: `tx-stress-${i}`,
                name: `Stress Transaction ${i}`,
                project: i % 5 === 0 ? '#kernel' : 
                        i % 5 === 1 ? '#paper' : 
                        i % 5 === 2 ? '#vna-app' : 
                        i % 5 === 3 ? '#tokenomics' : '#legacy',
                role: i % 4 === 0 ? '@Mr-Q' : 
                      i % 4 === 1 ? '@arquitecto' : 
                      i % 4 === 2 ? '@tester' : '@masterproject',
                user: i % 3 === 0 ? '@usuario-1' : 
                      i % 3 === 1 ? '@usuario-2' : '@masterproject',
                uv: Math.floor(Math.random() * 1000) + 50,
                date: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString()
            });
        }
        return transactions;
    }
};

window.TestHelper = TestHelper;