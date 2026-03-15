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
                        <h1>V8 TDD DIAGNOSTICS</h1>
                        <p>Validando Zero-Trust, Arquitectura A2A, LMS y Slicing Pie</p>
                    </div>

                    <div class="log-terminal" id="terminalLog">
                        <div style="color: var(--accent-green); margin-bottom: 15px; font-weight:bold;">> CARGANDO VECTORES DE ESTRÉS... <span class="cursor"></span></div>
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
            
            if (!isPass) throw new Error(`Test Fallido: [${tag}] ${message}`);
        };

        const runTests = async () => {
            const PID_TEST = 'v8-stress-' + Date.now();
            const dynNeoId = '0xNeoWallet' + Math.floor(Math.random() * 1000);
            const dynLauraId = '@laura_dev_' + Math.floor(Math.random() * 1000);
            const dynBobId = '@bob_user_' + Math.floor(Math.random() * 1000);

            try {
                // Hacemos LOGOUT de seguridad por si venimos de una sesión activa
                await store.dispatch({ type: 'LOGOUT_USER' });

                // ==========================================
                // BLOQUE 1: KERNEL, ZERO-TRUST E IDENTIDAD SOBERANA
                // ==========================================
                await assert(store.getState().config.version.startsWith('8'), "Versión del Kernel estructurada", "SYS");
                await assert(store.getState().session.activeUserId === null, "Arranque Zero-Trust (Desconectado)", "AUTH");

                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: dynNeoId } });
                const neoUser = store.getState().globalUsers.find(u => u.id === dynNeoId);
                await assert(neoUser !== undefined && store.getState().session.activeUserId === dynNeoId, "Lazy Registration: Shadow Profile creado vía Web3", "IDENTITY");

                const genesiAi = store.getState().globalUsers.find(u => u.id === '@genesi_ai');
                await assert(genesiAi !== undefined && genesiAi.profile.isAi === true, "Enjambre IA: Guardianes Nativos cargados en el Padrón", "AI-NATIVE");

                await store.dispatch({ type: 'ADD_USER', payload: { id: dynLauraId, name: 'Laura Dev', globalRole: 'network-user' } });
                await store.dispatch({ type: 'ADD_USER', payload: { id: dynBobId, name: 'Bob Normal', globalRole: 'network-user' } });

                // ==========================================
                // BLOQUE 2: SEGURIDAD, RBAC Y MUROS DE CRISTAL
                // ==========================================
                await store.dispatch({ 
                    type: 'CREATE_PROJECT', 
                    payload: { 
                        id: PID_TEST, nombre: "Matrix Sandbox", ownerId: dynNeoId, isPrivate: true, 
                        roles: [], vna_flows: [], work_orders: [], ledger: [], 
                        usuarios: [{id: dynNeoId, permissions: {canCreateWO: true, canApprove: true}}] 
                    } 
                });

                const hasAccessPO = store.canUserViewProject(PID_TEST, dynNeoId, 'network-user');
                await assert(hasAccessPO === true, "Project Owner tiene acceso soberano a su red", "RBAC");

                const hasAccessBob = store.canUserViewProject(PID_TEST, dynBobId, 'network-user');
                await assert(hasAccessBob === false, "Nodo externo rechazado ante topología privada", "PRIVACY");

                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: PID_TEST, updates: { usuarios: [{id: dynLauraId, permissions: {canCreateWO: false}}] } } });
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: PID_TEST, updates: { governance: { workOrderCreation: 'po_only' } } } });
                
                await assert(store.canUserCreateWorkOrder(PID_TEST, dynLauraId) === false, "Nodo Base bloqueado por política de inyección estricta", "RBAC");

                // ==========================================
                // BLOQUE 3: TOPOLOGÍA VNA Y CEREBRO A2A (LMS)
                // ==========================================
                await KB.init();
                const globalDocs = await KB.getAllDocuments('global');
                const hasPantheon = globalDocs.find(d => d.id === 'meta_pantheon_core');
                await assert(hasPantheon !== undefined, "Cerebro Semántico A2A: Leyes de Panteón inyectadas en KB", "A2A-SEED");

                const draftRoles = Object.keys(MOCK_ONTOLOGY).map(levelKey => ({
                    id: 'role_' + levelKey.replace('@','') + '_' + Date.now(), levelId: levelKey, name: MOCK_ONTOLOGY[levelKey].name, fmv: MOCK_ONTOLOGY[levelKey].fmv, multiplier: MOCK_ONTOLOGY[levelKey].multiplier, isArchived: false
                }));
                
                await store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: PID_TEST, updates: { roles: draftRoles } } });
                let p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.roles.length === 5, "Geometría Fractal: 5 Nodos Estructurales creados", "TOPOLOGY");

                const rAnx = p.roles.find(r => r.levelId === '@anxaneta');
                const rBaix = p.roles.find(r => r.levelId === '@baixos');

                await store.dispatch({ type: 'ADD_FLOW', payload: { projectId: PID_TEST, flow: { id: 'flow_1', from: rAnx.id, to: rBaix.id, template: "Estrategia Base", tipo: "tangible", estimatedHours: 10 } } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.vna_flows.length === 1, "Mapa VNA: Tuberías de valor trazadas con éxito", "VNA-FLOW");

                // ==========================================
                // BLOQUE 4: CICLO DE VIDA (SOP), SBTs Y AUTO-APRENDIZAJE
                // ==========================================
                const woHash = 'wo_' + Date.now();
                await store.dispatch({ type: 'SPAWN_WORK_ORDER', payload: { projectId: PID_TEST, workOrder: { hash: woHash, flowId: 'flow_1', status: 'theoretical', realHours: 0 } } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'theoretical', "SOP: Work Order inyectada al mercado PULL", "KANBAN");

                await store.dispatch({ type: 'PING_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, userId: dynLauraId } });
                await store.dispatch({ type: 'REPORT_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, realHours: 8, comentario: 'Test PoW' } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'reported', "Focus Mode: Prueba de Trabajo (PoW) sometida a auditoría", "WORKFLOW");
                
                const preDocs = await KB.getAllDocuments();
                await store.dispatch({ type: 'APPROVE_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash } });
                
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'consolidated', "Auditor Notarial: Trabajo validado inmutablemente", "AUDIT");

                const laura = store.getState().globalUsers.find(u => u.id === dynLauraId);
                const hasSkill = laura.profile.sbt_skills && laura.profile.sbt_skills.length > 0;
                await assert(hasSkill === true && laura.profile.sbt_skills[0].exp === 8, "SBT Skills: Experiencia cristalizada en el perfil del nodo humano", "SBT-SKILLS");

                await sleep(200);
                const postDocs = await KB.getAllDocuments();
                await assert(postDocs.length > preDocs.length, "LMS Hook: El Kernel ha comprimido y guardado el Caso de Éxito", "LMS-HOOK");

                // ==========================================
                // BLOQUE 5: ECONOMÍA Y CAPITAL INJECTION
                // ==========================================
                const expectedSlices = 8 * 40 * 1.2; // 8h * fmv(@baixos: 40) * mult(1.2)
                await assert(p.ledger[0].valorCongelado === expectedSlices, `Cripto-Economía: Cálculo de Equity exacto (${expectedSlices} Slices)`, "MATH");
                
                // Inyección de Liquidez
                await store.dispatch({ type: 'ADD_CAPITAL_INJECTION', payload: { projectId: PID_TEST, userId: dynNeoId, assetType: 'cash', amount: 1000, description: "Inyección de Seed Capital" } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                
                // Cash = Multiplicador x4 (Y asumiendo Arquetipo startup x2 = 8000 Slices, pero lo dejamos genérico según reducer)
                const capTx = p.ledger.find(l => l.roleId === 'CAPITAL_ASSET');
                await assert(capTx !== undefined && capTx.valorCongelado > 1000, "Capital Injection: Los fondos líquidos se minan como Slices con prima de riesgo", "LEDGER-CASH");

                const harvest = store.calculateHarvest(PID_TEST);
                await assert(harvest.length === 2, "Cap Table: Refleja las aportaciones combinadas de Capital y Trabajo (SOP)", "CAP-TABLE");

                // FINALIZACIÓN EXITOSA
                await sleep(500);
                terminal.innerHTML += `
                    <div style="margin-top: 30px; padding: 25px; background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); border-radius: 12px; text-align: center; box-shadow: 0 0 30px rgba(0, 230, 118, 0.15);">
                        <h2 style="color: var(--accent-green); margin: 0; font-size: 2rem; letter-spacing:-1px;">🔥 V8.5 KERNEL CERTIFIED 🔥</h2>
                        <p style="color: white; font-size: 1.05rem; margin-top: 10px;">La Matriz de A2A, Identidad Web3, Slicing Pie y LMS responden con tolerancia cero a fallos.</p>
                    </div>
                `;
                terminal.scrollTop = terminal.scrollHeight;
                
                btnEnter.classList.add('visible');

            } catch (error) {
                terminal.innerHTML += `
                    <div style="margin-top: 20px; padding: 20px; background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); border-radius: 12px;">
                        <h3 style="color: var(--accent-red); margin: 0;">💥 KERNEL PANIC</h3>
                        <p style="color: white; font-size: 0.9rem; margin-top: 10px; font-family: monospace;">${error.message}</p>
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
