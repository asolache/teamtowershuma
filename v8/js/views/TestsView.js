// v8/js/views/TestsView.js
import { store } from '../core/store.js';

// Importamos un extracto de la Ontología para el test de estrés E2E
const MOCK_ONTOLOGY = {
    '@anxaneta': { name: 'Growth Hacker', multiplier: 3.0, fmv: 70 },
    '@aixecador': { name: 'Director Creativo', multiplier: 2.0, fmv: 60 },
    '@dosos': { name: 'Project Manager', multiplier: 1.5, fmv: 50 },
    '@baixos': { name: 'Diseñador UI', multiplier: 1.2, fmv: 40 },
    '@pinya': { name: 'Community Manager', multiplier: 1.0, fmv: 25 }
};

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
                        <h1>V8 STRESS TEST E2E</h1>
                        <p>Validación de Topología Fractal, Kanban y Motor Slicing Pie</p>
                    </div>

                    <div class="log-terminal" id="terminalLog">
                        <div style="color: var(--accent-green); margin-bottom: 15px; font-weight:bold;">> INICIANDO SECUENCIA DE ESTRÉS... <span class="cursor"></span></div>
                    </div>

                    <div class="action-footer">
                        <div class="score-display" id="testScore">0/0</div>
                        <a href="/v8/" data-link class="btn-enter-matrix" id="btnEnterOS">ENTRAR AL KERNEL →</a>
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

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const assert = async (condition, message, tag) => {
            total++;
            const isPass = !!condition;
            if(isPass) passed++;
            
            await sleep(300); // Retraso matrix para efecto visual
            
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
            const PID_TEST = 'v8-stress-' + Date.now();
            const dynUser = 'nodo_' + Math.floor(Math.random() * 1000);

            try {
                // 1. KERNEL & SESSION
                await assert(store.getState().config.version.startsWith('8'), "Versión del Kernel apunta a V8", "SYS");
                await assert(store.getState().session.activeUserId === 'usr_alvaro_001', "Master Architect identificado", "AUTH");

                // 2. GÉNESIS E2E (INSTANCIACIÓN DE RED)
                const draftRoles = Object.keys(MOCK_ONTOLOGY).map(levelKey => ({
                    id: 'role_' + levelKey.replace('@','') + '_' + Date.now(),
                    levelId: levelKey,
                    name: MOCK_ONTOLOGY[levelKey].name,
                    fmv: MOCK_ONTOLOGY[levelKey].fmv,
                    multiplier: MOCK_ONTOLOGY[levelKey].multiplier,
                    isArchived: false
                }));

                await store.dispatch({ 
                    type: 'CREATE_PROJECT', 
                    payload: {
                        id: PID_TEST,
                        nombre: "Stress Test Agency",
                        ownerId: 'usr_alvaro_001',
                        sector: 'agencia_marketing',
                        roles: draftRoles,
                        vna_flows: [],
                        work_orders: [],
                        ledger: []
                    } 
                });

                let p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p !== undefined, "Proyecto inyectado en Base de Datos Local", "DB");
                await assert(p.roles.length === 5, "5 Roles Estructurales Creados Perfectamente", "TOPOLOGY");

                // 3. TRAZADO DE TUBERÍAS (MAPA VNA)
                const rAnx = p.roles.find(r => r.levelId === '@anxaneta');
                const rAix = p.roles.find(r => r.levelId === '@aixecador');
                const rBaix = p.roles.find(r => r.levelId === '@baixos');

                await store.dispatch({
                    type: 'ADD_FLOW',
                    payload: {
                        projectId: PID_TEST,
                        flow: { id: 'flow_1', from: rAnx.id, to: rAix.id, template: "Estrategia Q1", tipo: "intangible", estimatedHours: 5 }
                    }
                });
                await store.dispatch({
                    type: 'ADD_FLOW',
                    payload: {
                        projectId: PID_TEST,
                        flow: { id: 'flow_2', from: rAix.id, to: rBaix.id, template: "Diseño Web", tipo: "tangible", estimatedHours: 10 }
                    }
                });

                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.vna_flows.length === 2, "Mapa VNA: Tuberías trazadas e inyectadas", "VNA_FLOW");

                // 4. INSTANCIACIÓN EN KANBAN (WORK ORDERS)
                const woHash = 'wo_' + Date.now();
                await store.dispatch({
                    type: 'SPAWN_WORK_ORDER',
                    payload: {
                        projectId: PID_TEST,
                        workOrder: { hash: woHash, flowId: 'flow_2', status: 'theoretical', realHours: 0 }
                    }
                });

                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders.length === 1, "Kanban: Entregable nacido como Oportunidad (PULL)", "KANBAN");
                await assert(p.work_orders[0].status === 'theoretical', "Kanban: Estado 'Libre' validado", "KANBAN");

                // 5. FLUJO DE TRABAJO (PULL -> REPORT -> APPROVE)
                await store.dispatch({ type: 'PING_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, userId: 'usr_alvaro_001' } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'pinged', "Focus Mode: Tarea asumida por nodo", "WORKFLOW");

                await store.dispatch({ type: 'REPORT_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, realHours: 8 } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].realHours === 8, "Focus Mode: Prueba de Trabajo (PoW) reportada", "WORKFLOW");

                // 6. MOTOR SLICING PIE (LEDGER)
                await store.dispatch({ type: 'APPROVE_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'consolidated', "Auditoría: Tarea Sellada", "AUDIT");
                await assert(p.ledger.length === 1, "Ledger: Bloque Criptográfico Minado", "LEDGER");

                // Verificamos matemáticas: 8h * fmv(@baixos: 40) * mult(1.2) = 384 Slices
                const expectedSlices = 8 * 40 * 1.2;
                await assert(p.ledger[0].valorCongelado === expectedSlices, `Economía: Slices exactos calculados (${expectedSlices})`, "MATH");

                // FINALIZACIÓN EXITOSA
                await sleep(500);
                terminal.innerHTML += `
                    <div style="margin-top: 20px; padding: 15px; background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); border-radius: 8px; text-align: center;">
                        <h3 style="color: var(--accent-green); margin: 0;">🔥 ESTRÉS E2E SUPERADO 🔥</h3>
                        <p style="color: white; font-size: 0.85rem; margin-top: 5px;">Génesis > Mapa VNA > Kanban > Ledger. Sin pérdida de datos. Kernel Blindado.</p>
                    </div>
                `;
                terminal.scrollTop = terminal.scrollHeight;
                
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
            
            const cursor = document.querySelector('.cursor');
            if(cursor) cursor.remove();
        };

        setTimeout(runTests, 500);
    }
}
