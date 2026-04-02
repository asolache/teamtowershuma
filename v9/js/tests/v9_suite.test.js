// v9/js/tests/v9_suite.test.js
import { EconomyProxyTests } from './economy_proxy.test.js';

export const ALL_SUITES = [
    EconomyProxyTests
];

// Simple in-browser runner execution loop (Para invocar desde la consola o vista oculta)
export async function runV9Tests() {
    const results = [];
    const runner = {
        describe: (name, fn) => { console.group(`📦 ${name}`); fn(); console.groupEnd(); },
        it: async (name, fn) => {
            try {
                await fn();
                console.log(`✅ PASS: ${name}`);
                results.push({ name, status: 'PASS' });
            } catch (e) {
                console.error(`❌ FAIL: ${name}`, e);
                results.push({ name, status: 'FAIL', error: e.message });
            }
        }
    };

    console.log("🚀 Iniciando Test Suite V9.1...");
    for (const suite of ALL_SUITES) {
        await suite(runner);
    }
    console.log("🏁 Tests completados.");
    return results;
}