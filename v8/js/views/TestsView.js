// v8/js/views/TestsView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';

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
                    border-radius: 12px; padding: 1.5rem; height: 450px; overflow-y: auto; 
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
                        <h1>V9 TDD DIAGNOSTICS (Fase Roja)</h1>
                        <p>Validando Memética, Recetas (SOP), Checklist (SOCs) y Auditoría IA</p>
                    </div>

                    <div class="log-terminal" id="terminalLog">
                        <div style="color: var(--accent-green); margin-bottom: 15px; font-weight:bold;">> INICIANDO SECUENCIA DE RUPTURA (RED PHASE)... <span class="cursor"></span></div>
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
            
            await sleep(200); 
            
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
            
            if (!isPass) throw new Error(`Test Fallido Esperado: [${tag}] ${message}`);
        };

        const runTests = async () => {
            const PID_TEST = 'v9-stress-' + Date.now();
            const dynNeoId = '0xNeoWallet' + Math.floor(Math.random() * 1000);
            const dynLauraId = '@laura_dev_' + Math.floor(Math.random() * 1000);

            try {
                await store.dispatch({ type: 'LOGOUT_USER' });

                // ==========================================
                // BLOQUE 1 & 2: KERNEL Y TOPOLOGÍA BASE (Pasan en Verde)
                // ==========================================
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: dynNeoId } });
                await store.dispatch({ type: 'ADD_USER', payload: { id: dynLauraId, name: 'Laura Dev', globalRole: 'network-user' } });

                const draftRoles = Object.keys(MOCK_ONTOLOGY).map(levelKey => ({
                    id: 'role_' + levelKey.replace('@','') + '_' + Date.now(), levelId: levelKey, name: MOCK_ONTOLOGY[levelKey].name, fmv: MOCK_ONTOLOGY[levelKey].fmv, multiplier: MOCK_ONTOLOGY[levelKey].multiplier, isArchived: false
                }));

                await store.dispatch({ 
                    type: 'CREATE_PROJECT', 
                    payload: { 
                        id: PID_TEST, nombre: "Matrix Sandbox V9", ownerId: dynNeoId, isPrivate: true, 
                        roles: draftRoles, vna_flows: [], work_orders: [], ledger: [], 
                        usuarios: [{id: dynNeoId, permissions: {canCreateWO: true, canApprove: true}}] 
                    } 
                });

                let p = store.getState().projects.find(x => x.id === PID_TEST);
                const rAnx = p.roles.find(r => r.levelId === '@anxaneta');
                const rBaix = p.roles.find(r => r.levelId === '@baixos');
                const genesiAi = store.getState().globalUsers.find(u => u.id === '@genesi_ai');

                await store.dispatch({ type: 'ADD_FLOW', payload: { projectId: PID_TEST, flow: { id: 'flow_1', from: rAnx.id, to: rBaix.id, template: "Estrategia Base", tipo: "tangible", estimatedHours: 10 } } });

                // ==========================================
                // BLOQUE 3: EL NUEVO PARADIGMA FRACTAL (SOP, SOCs y AUDITORÍA IA) - AQUÍ FALLARÁ
                // ==========================================
                const woHash = 'wo_' + Date.now();
                
                // Exigimos que la Tarea (SOP) tenga una matriz de SOCs (Checklist) e Ingredientes (Recursos)
                await store.dispatch({ 
                    type: 'SPAWN_WORK_ORDER', 
                    payload: { 
                        projectId: PID_TEST, 
                        workOrder: { 
                            hash: woHash, 
                            flowId: 'flow_1', 
                            status: 'theoretical', 
                            realHours: 0,
                            soc_checklist: [
                                { id: 'soc_1', text: "El código pasa los linters", isChecked: false },
                                { id: 'soc_2', text: "Documentación generada", isChecked: false }
                            ],
                            resources: ['GitHub Repo', 'Figma File']
                        } 
                    } 
                });

                p = store.getState().projects.find(x => x.id === PID_TEST);
                const currentWO = p.work_orders[0];
                
                // ESTE TEST AÚN PUEDE PASAR (El dispatch guarda lo que le echen en el array)
                await assert(currentWO.soc_checklist && currentWO.soc_checklist.length === 2, "Fractalidad Memética: La Work Order (SOP) contiene su Checklist de conducta (SOCs)", "SOP-MEME");

                await store.dispatch({ type: 'PING_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, userId: dynLauraId } });
                await store.dispatch({ type: 'REPORT_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, realHours: 8, comentario: 'Test PoW' } });
                
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'reported', "Focus Mode: Prueba de Trabajo (PoW) reportada por el ejecutante", "WORKFLOW");

                // 💥 EL GRAN TEST DEL NUEVO FLUJO (AQUÍ HABRÁ KERNEL PANIC)
                // Exigimos que un Agente IA actúe como Auditor (Review) ANTES de consolidar
                await store.dispatch({ 
                    type: 'REVIEW_WORK_ORDER', 
                    payload: { 
                        projectId: PID_TEST, 
                        woHash: woHash, 
                        auditorId: genesiAi.id,
                        socValidation: { 'soc_1': true, 'soc_2': true } // El auditor marca los checks
                    } 
                });

                p = store.getState().projects.find(x => x.id === PID_TEST);
                
                // Esto FALLARÁ porque REVIEW_WORK_ORDER no existe en el store actual
                await assert(p.work_orders[0].status === 'in_review', "Auditoría Criptográfica: El Agente IA pone la tarea en 'Review' y valida el SOC Checklist", "AUTO-AUDIT");

                // No llegará aquí hasta que programemos el Kernel
                await store.dispatch({ type: 'APPROVE_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash } });
                
            } catch (error) {
                terminal.innerHTML += `
                    <div style="margin-top: 20px; padding: 20px; background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); border-radius: 12px;">
                        <h3 style="color: var(--accent-red); margin: 0;">💥 TDD KERNEL PANIC (ESPERADO)</h3>
                        <p style="color: white; font-size: 0.95rem; margin-top: 10px; font-family: monospace;">${error.message}</p>
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 15px;">Fase Roja completada. El Kernel exige la implementación del modelo de Recetas (SOCs) y la fase de Auditoría 'in_review'. Iniciando protocolo de reconstrucción del Store.</p>
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
