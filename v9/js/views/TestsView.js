// v9/js/views/TestsView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';

// 🔥 IMPORTAMOS EL MOTOR DE TESTS V9.1 (Portado de V10)
import { ALL_SUITES } from '../tests/v9_suite.test.js';

export default class TestsView {
    constructor() {
        document.title = "Diagnóstico Cuántico | TeamTowers V9.1";
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: radial-gradient(circle at center, #111116 0%, #050505 100%); font-family: var(--font-mono); justify-content: center; align-items: center; }
                .test-container { width: 100%; max-width: 1000px; padding: 2rem; }
                
                .matrix-header { text-align: center; margin-bottom: 2rem; }
                .matrix-header h1 { color: var(--accent-green); font-size: 2.8rem; letter-spacing: 2px; margin: 0; text-transform: uppercase; text-shadow: 0 0 25px rgba(0, 230, 118, 0.4); font-weight: 900; }
                .matrix-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 10px; font-family: var(--font-main); }

                .log-terminal { 
                    background: rgba(5, 5, 8, 0.95); border: 1px solid rgba(0, 230, 118, 0.3); 
                    border-radius: 16px; padding: 2rem; height: 500px; overflow-y: auto; 
                    color: #a0a0a0; font-size: 0.95rem; line-height: 1.6; 
                    box-shadow: inset 0 0 50px rgba(0,0,0,0.8), 0 15px 40px rgba(0,230,118,0.05); 
                    scroll-behavior: smooth;
                    backdrop-filter: blur(10px);
                }
                
                .test-suite-title { color: var(--accent-blue); font-weight: 900; font-size: 1.1rem; margin: 20px 0 10px 0; border-bottom: 1px dashed rgba(0,176,255,0.3); padding-bottom: 5px; text-transform: uppercase;}
                .test-row { margin-bottom: 8px; display: flex; align-items: flex-start; animation: fadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); padding-left: 10px;}
                .test-icon { margin-right: 15px; font-size: 1.1rem; }
                .test-msg { flex: 1; color: #ddd; font-family: var(--font-main); }
                
                .pass-row { border-left: 3px solid var(--accent-green); }
                .fail-row { border-left: 3px solid var(--accent-red); }
                .error-details { background: rgba(255,82,82,0.1); color: #ff8a80; padding: 10px; border-radius: 8px; font-size: 0.8rem; margin-top: 5px; font-family: var(--font-mono); display: block;}

                .action-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; }
                .score-display { font-size: 2.5rem; font-weight: 900; color: var(--text-muted); }
                .score-display.perfect { color: var(--accent-green); text-shadow: 0 0 15px rgba(0,230,118,0.4); }
                
                .btn-enter-matrix { 
                    background: transparent; border: 2px solid var(--accent-green); color: var(--accent-green); 
                    padding: 14px 35px; font-family: var(--font-mono); font-weight: 900; font-size: 1.2rem; 
                    border-radius: 12px; cursor: pointer; transition: 0.3s; opacity: 0; pointer-events: none;
                    text-transform: uppercase; letter-spacing: 2px; text-decoration: none;
                    box-shadow: 0 0 20px rgba(0,230,118,0.1);
                }
                .btn-enter-matrix.visible { opacity: 1; pointer-events: auto; }
                .btn-enter-matrix.visible:hover { background: var(--accent-green); color: black; box-shadow: 0 0 30px rgba(0,230,118,0.5); transform: translateY(-2px);}

                @keyframes fadeIn { from { opacity: 0; transform: translateX(-15px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                
                .cursor { display: inline-block; width: 10px; height: 18px; background: var(--accent-green); animation: pulse 1s infinite; vertical-align: middle; margin-left: 8px;}
            </style>

            <div class="app-layout">
                <div class="test-container">
                    <div class="matrix-header">
                        <h1>V9.1 ANTIGRAVITY KERNEL</h1>
                        <p>Motor TDD: Validando VnaSequencer, WoGenerator y Economía Proxy</p>
                    </div>

                    <div class="log-terminal" id="terminalLog">
                        <div style="color: var(--accent-green); margin-bottom: 20px; font-weight:900; font-size: 1.1rem;">> COMPILANDO TESTS TDD (V10 Backport)... <span class="cursor" id="blinkingCursor"></span></div>
                    </div>

                    <div class="action-footer">
                        <div class="score-display" id="testScore">0/0</div>
                        <a href="/v9/" data-link class="btn-enter-matrix" id="btnEnterOS">Entrar al Kernel &rarr;</a>
                    </div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const terminal = document.getElementById('terminalLog');
        const score = document.getElementById('testScore');
        const btnEnter = document.getElementById('btnEnterOS');
        const cursor = document.getElementById('blinkingCursor');

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const runTests = async () => {
            let total = 0;
            let passed = 0;
            
            // Creamos un Runner que inyecta resultados directamente en el DOM
            const visualRunner = {
                describe: (name, fn) => {
                    terminal.insertAdjacentHTML('beforeend', `<div class="test-suite-title">📦 ${name}</div>`);
                    fn();
                },
                it: async (name, fn) => {
                    total++;
                    try {
                        await fn();
                        passed++;
                        terminal.insertAdjacentHTML('beforeend', `
                            <div class="test-row pass-row">
                                <span class="test-icon">🟢</span>
                                <span class="test-msg">${name}</span>
                            </div>
                        `);
                    } catch (e) {
                        terminal.insertAdjacentHTML('beforeend', `
                            <div class="test-row fail-row" style="flex-direction:column;">
                                <div style="display:flex; align-items:center;">
                                    <span class="test-icon">🔴</span>
                                    <span class="test-msg" style="color:var(--accent-red); font-weight:bold;">${name}</span>
                                </div>
                                <div class="error-details">> ${e.message}</div>
                            </div>
                        `);
                    }
                    
                    // Actualizar el Scoreboard
                    score.innerText = `${passed}/${total}`;
                    score.style.color = passed === total ? 'var(--accent-green)' : 'var(--accent-red)';
                    
                    // Auto-scroll
                    terminal.scrollTop = terminal.scrollHeight;
                    await sleep(30); // Pequeña pausa para efecto visual Matrix
                }
            };

            try {
                // 1. Inicializamos DB y Store para que los tests tengan entorno
                await store.init();
                await KB.init();

                // 2. Ejecutamos todas las suites importadas
                for (const suite of ALL_SUITES) {
                    await suite(visualRunner);
                }

                // 3. Resultado Final
                if (cursor) cursor.remove();
                
                if (passed === total && total > 0) {
                    score.classList.add('perfect');
                    terminal.insertAdjacentHTML('beforeend', `
                        <div style="margin-top: 30px; padding: 30px; background: rgba(0, 230, 118, 0.05); border: 1px solid var(--accent-green); border-radius: 16px; text-align: center; box-shadow: 0 0 50px rgba(0, 230, 118, 0.15); animation: fadeIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);">
                            <h2 style="color: var(--accent-green); margin: 0; font-size: 2.2rem; letter-spacing:-1px; text-shadow: 0 0 20px rgba(0,230,118,0.5);">🔥 KERNEL V9.1 INMORTAL 🔥</h2>
                            <p style="color: #ccc; font-size: 1.1rem; margin-top: 15px; line-height: 1.6;">Todas las aserciones superadas. Economía Proxy, VnaSequencer y Rutinas de Generación operativas.</p>
                        </div>
                    `);
                    btnEnter.classList.add('visible');
                } else {
                    terminal.insertAdjacentHTML('beforeend', `
                        <div style="margin-top: 30px; padding: 30px; background: rgba(255, 82, 82, 0.05); border: 1px solid var(--accent-red); border-radius: 16px; text-align: center;">
                            <h3 style="color: var(--accent-red); margin: 0; font-size: 1.8rem;">💥 FASE RED: TESTS FALLIDOS</h3>
                            <p style="color: white; font-size: 1rem; margin-top: 15px;">Hay módulos que refactorizar para que la lógica de negocio pase los tests (Fase GREEN).</p>
                        </div>
                    `);
                }
                
                terminal.scrollTop = terminal.scrollHeight;

            } catch (globalError) {
                console.error(globalError);
                if (cursor) cursor.remove();
                terminal.insertAdjacentHTML('beforeend', `
                    <div class="test-row fail-row"><span class="test-icon">☢️</span><span class="test-msg" style="color:var(--accent-red);">ERROR FATAL EN EL RUNNER: ${globalError.message}</span></div>
                `);
            }
        };

        // Arrancamos con un pequeño delay para que dé tiempo a cargar la UI
        setTimeout(runTests, 800);
    }
}