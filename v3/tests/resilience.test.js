// /v3/tests/resilience.test.js
import { Selectors } from '../js/core/selectors.js';

describe('VNA Resilience Index (P-023)', () => {
    test('Debe marcar como FRÁGIL si el valor es 100% tangible', () => {
        const state = {
            projects: [{
                id: 'p1',
                transactions: [{ uv: 1000, tipo_valor: 'tangible' }]
            }]
        };
        const res = Selectors.getProjectResilienceIndex(state, 'p1');
        expect(res.status).toBe('fragil');
    });

    test('Debe marcar como SALUDABLE si hay equilibrio 50/50', () => {
        const state = {
            projects: [{
                id: 'p2',
                transactions: [
                    { uv: 500, tipo_valor: 'tangible' },
                    { uv: 500, tipo_valor: 'intangible' }
                ]
            }]
        };
        const res = Selectors.getProjectResilienceIndex(state, 'p2');
        expect(res.status).toBe('saludable');
    });
});
