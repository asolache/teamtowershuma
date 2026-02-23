// v3/tests/resilience.test.js
import { Selectors } from '../js/core/selectors.js';

describe('VNA Resilience Index (P-023)', () => {

    test('Un proyecto sin transacciones debe devolver estado desconocido', () => {
        const state = { projects: [{ id: 'p1', transactions: [] }] };
        const res = Selectors.getProjectResilienceIndex(state, 'p1');
        expect(res.status).toBe('desconocido');
        expect(res.ratio).toBe(0);
    });

    test('Debe marcar como FRÁGIL si el valor es 100% tangible (ej: solo dinero)', () => {
        const state = {
            projects: [{
                id: 'p1',
                transactions: [
                    { uv: 1000, tipo_valor: 'tangible' }
                ]
            }]
        };
        const res = Selectors.getProjectResilienceIndex(state, 'p1');
        expect(res.status).toBe('fragil');
        expect(res.ratio).toBe(0);
    });

    test('Debe marcar como SALUDABLE si hay equilibrio (aprox 50% intangibles)', () => {
        const state = {
            projects: [{
                id: 'p2',
                transactions: [
                    { uv: 500, tipo_valor: 'tangible' },   // ej: pago
                    { uv: 500, tipo_valor: 'intangible' } // ej: reconocimiento/conocimiento
                ]
            }]
        };
        const res = Selectors.getProjectResilienceIndex(state, 'p2');
        expect(res.ratio).toBe(0.5);
        expect(res.status).toBe('saludable');
    });

    test('Debe marcar como ROBUSTO si dominan los intangibles (>60%)', () => {
        const state = {
            projects: [{
                id: 'p3',
                transactions: [
                    { uv: 200, tipo_valor: 'tangible' },
                    { uv: 800, tipo_valor: 'intangible' }
                ]
            }]
        };
        const res = Selectors.getProjectResilienceIndex(state, 'p3');
        expect(res.ratio).toBe(0.8);
        expect(res.status).toBe('robusto');
    });
});
