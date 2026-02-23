import { Selectors } from '../js/core/selectors.js';

// TEST: Validar que un sistema sin intangibles es frágil
const mockState = {
    projects: [{
        id: 'p1',
        transactions: [
            { uv: 100, tipo_valor: 'tangible' } // Solo dinero/producto
        ]
    }]
};

const res = Selectors.getProjectResilienceIndex(mockState, 'p1');
console.assert(res.status === 'fragil', "❌ Error: Debería ser frágil");
