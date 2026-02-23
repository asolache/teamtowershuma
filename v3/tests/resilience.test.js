import { Selectors } from '../js/core/selectors.js';

describe('Pruebas de Resiliencia VNA (P-023)', () => {
    test('Un proyecto con solo transacciones tangibles debe tener resiliencia "frágil"', () => {
        const state = {
            projects: [{
                id: '#p-fragil',
                transactions: [
                    { id: 't1', tipo_valor: 'tangible', uv: 1000 }
                ]
            }]
        };
        const result = Selectors.getProjectResilienceIndex(state, '#p-fragil');
        expect(result.status).toBe('fragil');
    });

    test('Un proyecto con equilibrio tangible/intangible debe ser "saludable"', () => {
        const state = {
            projects: [{
                id: '#p-pro',
                transactions: [
                    { id: 't1', tipo_valor: 'tangible', uv: 500 },
                    { id: 't2', tipo_valor: 'intangible', uv: 500 }
                ]
            }]
        };
        const result = Selectors.getProjectResilienceIndex(state, '#p-pro');
        expect(result.ratio).toBe(0.5);
        expect(result.status).toBe('saludable');
    });
});
