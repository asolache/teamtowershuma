// v8/js/views/TestsView.js
import { store } from '../core/store.js';

export default class TestsView {
    constructor() {
        document.title = "Boot Diagnostics | TeamTowers V8";
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-mono); justify-content: center; align-items: center; }
                .test-container { width: 100%; max-width: 900px; padding: 2rem; }
                
                .matrix-header { text-align: center; margin-bottom: 2rem; }
                .matrix-header h1 { color: var(--accent-green); font-size: 2.5rem; letter-spacing: 2px; margin: 0; text-transform: uppercase; text-shadow: 0 0 15px rgba(0, 230, 118, 0.4); }
                .matrix-header p { color: var(--text-muted); font-size: 0.9rem; margin-top: 5px; }

                .log-terminal { 
                    background: rgba(5, 5, 7, 0.95); border: 1px solid rgba(0, 230, 118, 0.3); 
                    border-radius: 12px; padding: 1.5rem; height: 400px; overflow-y: auto; 
                    color: #a0a0a0; font-size: 0.9rem; line-height: 1.6; 
                    box-shadow: inset 0 0 30px rgba(0,0,0,0.8), 0 10px 30px rgba(0,230,118,0.05); 
                    scroll-behavior: smooth;
                }
                
                .test-row { margin-bottom: 10px; display: flex; align-items: flex-start; animation: fadeIn 0.2s ease-in; }
                .test-icon { margin-right: 12px; font-size: 1.1rem; }
                .test-msg { flex: 1; color: #ddd; }
                .test-badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 6px; background: rgba(0,0,0,0.5); border: 1px solid #444; color: var(--text-muted); margin-left: 10px; white-space: nowrap; font-weight: bold; }
                
                .pass-row { border-left: 2px solid var(--accent-green); padding-left: 10px; }
                .fail-row { border-left: 2px solid var(--accent-red); padding-left: 10px; }

                .action-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; }
                .score-display { font-size: 2rem; font-weight: 900; color: var(--text-muted); }
                
                .btn-enter-matrix { 
                    background: transparent; border: 2px solid var(--accent-green); color: var(--accent-green); 
                    padding: 12px 30px; font-family: var(--font-mono); font-weight: bold; font-size: 1.1rem; 
                    border-radius: 8px; cursor: pointer; transition: 0.3s; opacity: 0; pointer-events: none;
                    text-transform: uppercase; letter-spacing: 1px; text-decoration: none;
                }
                .btn-enter-matrix.visible { opacity: 1; pointer-events: auto; }
                .btn-enter-matrix.visible:hover { background: var(--accent-green); color: black; box-shadow: 0 0 20px rgba(0,230,118,0.4); }

                @keyframes fadeIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                
                .cursor { display: inline-block; width: 8px; height: 15px; background: var(--accent-green); animation: pulse 1s infinite; vertical-align: middle; margin-left: 5px;}
            </style>

            <div class="app-layout">
                <div class="test-container">
                    <div class="matrix-header">
                        <h1>V8 KERNEL DIAGNOSTICS</h1>
                        <p>Validando Inmutabilidad, RBAC y Motor Slicing Pie</p>
                    </div>

                    <div class="log-terminal" id="terminalLog">
                        <div style="color: var(--accent-green); margin-bottom: 15px; font-weight:bold;">> SECUENCIA DE ARRANQUE INICIADA... <span class="cursor"></span></div>
                    </div>

                    <div class="action-footer">
                        <div class="score-display" id="testScore">0/0</div>
                        <a href="/v8/" data-link class="btn-enter-matrix" id="btnEnterOS">ENTRAR AL SISTEMA →</a>
                    </div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const terminal = document.getElementById('terminalLog');
        const score = document.getElementById('testScore');
        const btnEnter = document.getElementById('btnEnterOS');
        
        let passed = 0; 
        let total = 0;

        // Función Helper para simular tipeo y delay hacker
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const assert = async (condition, message, tag) => {
            total++;
            const isPass = !!condition;
            if(isPass) passed++;
            
            await sleep(400); // Retraso dramático Matrix
            
            const icon = isPass ? '🟢' : '🔴';
            const rowClass = isPass ? 'pass-row' : 'fail-row';
            const colorMsg = isPass ? '#c9d1d9' : 'var(--accent-red)';
            
            terminal.innerHTML += `
                <div class="test-row ${rowClass}">
                    <span class="test-icon">${icon}</span>
                    <span class="test-msg" style="color: ${colorMsg};">${message}</span>
                    <span class="test-badge">${tag}</span>
                </div>
            `;
            terminal.scrollTop = terminal.scrollHeight;
            score.innerText = `${passed}/${total}`;
            score.style.color = isPass ? (passed === total ? 'var(--accent-green)' : 'var(--text-muted)') : 'var(--accent-red)';
            
            if (!isPass) throw new Error(`Test Fallido: [${tag}] ${message}`);
        };

        const runTests = async () => {
            const PID_TEST = 'v8-test-' + Date.now();
            const dynUser = 'nodo_' + Math.floor(Math.random() * 1000);

            try {
                // 1. KERNEL & SESSION
                await assert(store.getState().config.version.startsWith('8'), "Versión del Config apunta a V8", "SYS");
                await assert(store.getState().session.activeUserId === 'usr_alvaro_001', "Master Architect identificado en sesión", "AUTH");

                // 2. CREACIÓN DE ECOSISTEMA (TDD Core)
                const mockProject = {
                    id: PID_TEST,
                    nombre: "Matrix Sandbox",
                    ownerId: 'usr_alvaro_001',
                    isPrivate: true,
                    usuarios: [{ id: 'usr_alvaro_001' }],
                    ledger: [
                        { userId: 'usr_alvaro_001', roleId: '@anxaneta', valorCongelado: 1500, horas: 10 }
                    ],
                    work_orders: [
                        { hash: 'wo1', status: 'reported' },
                        { hash: 'wo2', status: 'theoretical' }
                    ]
                };
                
                await store.dispatch({ type: 'CREATE_PROJECT', payload: mockProject });
                const p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p !== undefined, "Proyecto inyectado en el Store en memoria", "DB");
                await assert(p.ledger.length === 1, "Estructura Ledger persistida correctamente", "LEDGER");

                // 3. MOTOR SLICING PIE V8
                const harvest = store.calculateHarvest(PID_TEST);
                await assert(Array.isArray(harvest), "calculateHarvest() devuelve un array procesado", "ECONOMY");
                await assert(harvest.length > 0 && harvest[0].slices === 1500, "Cálculo de Slices en memoria exacto (1500 Slices)", "MATH");

                // 4. MOTOR DE RESILIENCIA Y MÉTRICAS
                const resilience = store.calculateResilience(PID_TEST);
                await assert(typeof resilience === 'number', "calculateResilience() devuelve un índice numérico", "HEALTH");
                await assert(resilience === 95, "Cálculo de Resiliencia exacto (1 atasco detectado restando 5 pts)", "MATH");

                // 5. GOBERNANZA FRACTAL (RBAC)
                const canPOView = store.canUserViewProject(PID_TEST, 'usr_alvaro_001', 'ecosystem-owner');
                const canStrangerView = store.canUserViewProject(PID_TEST, dynUser, 'network-user');
                await assert(canPOView === true, "Ecosystem Owner tiene visión absoluta sobre la Red", "RBAC");
                await assert(canStrangerView === false, "Muro de Cristal: Nodo externo bloqueado de red privada", "SECURITY");

                // FINALIZACIÓN EXITOSA
                await sleep(500);
                terminal.innerHTML += `
                    <div style="margin-top: 20px; padding: 15px; background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); border-radius: 8px; text-align: center;">
                        <h3 style="color: var(--accent-green); margin: 0;">SISTEMA V8 OPERATIVO Y ESTABLE</h3>
                        <p style="color: white; font-size: 0.85rem; margin-top: 5px;">El Kernel soporta el Dashboard. Listo para despliegue.</p>
                    </div>
                `;
                terminal.scrollTop = terminal.scrollHeight;
                
                // Mostrar botón de entrada
                btnEnter.classList.add('visible');

            } catch (error) {
                terminal.innerHTML += `
                    <div style="margin-top: 20px; padding: 15px; background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); border-radius: 8px;">
                        <h3 style="color: var(--accent-red); margin: 0;">💥 KERNEL PANIC</h3>
                        <p style="color: white; font-size: 0.85rem; margin-top: 5px;">${error.message}</p>
                    </div>
                `;
                terminal.scrollTop = terminal.scrollHeight;
            }
            
            // Quitar cursor animado
            const cursor = document.querySelector('.cursor');
            if(cursor) cursor.remove();
        };

        // Iniciar tests automáticamente al cargar la vista
        setTimeout(runTests, 500);
    }
}
