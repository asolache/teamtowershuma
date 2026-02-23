// v3/tests/resilience.test.js

// Si usas Vitest/Node, descomenta la siguiente línea:
// import { Selectors } from '../js/core/selectors.js';

describe('VNA Resilience Index (P-023)', () => {

    test('1. Caso: Sin transacciones = Desconocido', () => {
        const state = { projects: [{ id: 'p1', transactions: [] }] };
        const res = window.Selectors.getProjectResilienceIndex(state, 'p1');
        if (res.status !== 'desconocido') throw new Error("Debería ser desconocido");
    });

    test('2. Caso: 100% Tangible = Frágil', () => {
        const state = {
            projects: [{
                id: 'p1',
                transactions: [{ uv: 1000, tipo_valor: 'tangible' }]
            }]
        };
        const res = window.Selectors.getProjectResilienceIndex(state, 'p1');
        if (res.status !== 'fragil') throw new Error("Debería ser frágil (falta de intangibles)");
    });

    test('3. Caso: Equilibrio 50/50 = Saludable', () => {
        const state = {
            projects: [{
                id: 'p1',
                transactions: [
                    { uv: 500, tipo_valor: 'tangible' },
                    { uv: 500, tipo_valor: 'intangible' }
                ]
            }]
        };
        const res = window.Selectors.getProjectResilienceIndex(state, 'p1');
        if (res.ratio !== 0.5 || res.status !== 'saludable') throw new Error("Fallo en cálculo de equilibrio");
    });

    test('4. Caso: Dominio Intangible = Robusto', () => {
        const state = {
            projects: [{
                id: 'p1',
                transactions: [
                    { uv: 200, tipo_valor: 'tangible' },
                    { uv: 800, tipo_valor: 'intangible' }
                ]
            }]
        };
        const res = window.Selectors.getProjectResilienceIndex(state, 'p1');
        if (res.status !== 'robusto') throw new Error("Debería ser robusto (alto capital social)");
    });
});
