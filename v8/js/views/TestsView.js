// v8/js/views/TestsView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';

const MOCK_ONTOLOGY = {
    '@anxaneta': { name: 'Growth Hacker', multiplier: 3.0, fmv: 70, guardian: 'explorer' },
    '@aixecador': { name: 'Director Creativo', multiplier: 2.0, fmv: 60, guardian: 'creator' },
    '@dosos': { name: 'Project Manager', multiplier: 1.5, fmv: 50, guardian: 'ruler' },
    '@baixos': { name: 'Diseñador UI', multiplier: 1.2, fmv: 40, guardian: 'lover' },
    '@pinya': { name: 'Community Manager', multiplier: 1.0, fmv: 25, guardian: 'caregiver' }
};

export default class TestsView {
    constructor() {
        document.title = "Boot Diagnostics | TeamTowers V9";
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
                        <h1>V11 TDD DIAGNOSTICS (Fase Verde)</h1>
                        <p>Validando Memética, Recetas (SOP), Checklist (SOCs) y Auditoría IA</p>
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
            
            await sleep(100); 
            
            const icon = isPass ? '🟢' : '🔴';
            const rowClass = isPass ? 'pass-row' : 'fail-row';
            const colorMsg = isPass ? '#c9d1d9' : 'var(--accent-red)';
            
            const htmlToInject = `
                <div class="test-row ${rowClass}">
                    <span class="test-icon">${icon}</span>
                    <span class="test-msg" style="color: ${colorMsg};">${message}</span>
                    <span class="test-badge">${tag}</span>
                </div>
            `;
            
            terminal.insertAdjacentHTML('beforeend', htmlToInject);
            
            await new Promise(r => requestAnimationFrame(r));
            
            terminal.scrollTop = terminal.scrollHeight;
            score.innerText = `${passed}/${total}`;
            score.style.color = isPass ? (passed === total ? 'var(--accent-green)' : 'var(--text-muted)') : 'var(--accent-red)';
            
            if (!isPass) throw new Error(`Test Fallido: [${tag}] ${message}`);
        };

        const runTests = async () => {
            const PID_TEST = 'v9-stress-' + Date.now();
            const dynNeoId = '0xNeoWallet' + Math.floor(Math.random() * 1000);
            const dynLauraId = '@laura_dev_' + Math.floor(Math.random() * 1000);
            const dynBobId = '@bob_user_' + Math.floor(Math.random() * 1000);

            try {
                await store.dispatch({ type: 'LOGOUT_USER' });

                // ==========================================
                // BLOQUE 1: KERNEL, ZERO-TRUST E IDENTIDAD
                // ==========================================
                await assert(store.getState().config.version.startsWith('9'), "Motor A2A y Memética SOP activados (V11)", "SYS");
                await assert(store.getState().session.activeUserId === null, "Arranque Zero-Trust (Desconectado)", "AUTH");

                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: dynNeoId } });
                const neoUser = store.getState().globalUsers.find(u => u.id === dynNeoId);
                await assert(neoUser !== undefined && store.getState().session.activeUserId === dynNeoId, "Lazy Registration: Shadow Profile creado al vuelo", "IDENTITY");

                const genesiAi = store.getState().globalUsers.find(u => u.id === '@genesi_ai');
                await assert(genesiAi !== undefined && genesiAi.profile.isAi === true, "Enjambre IA: Guardianes inyectados en la red neuronal", "AI-NATIVE");

                const mestreEscola = store.getState().globalUsers.find(u => u.id === '@mestre_escola');
                await assert(mestreEscola !== undefined, "Talent Tree: Mestre d'Escola está activo gobernando las competencias", "AI-NATIVE");

                await store.dispatch({ type: 'ADD_USER', payload: { id: dynLauraId, name: 'Laura Dev', globalRole: 'network-user' } });
                await store.dispatch({ type: 'ADD_USER', payload: { id: dynBobId, name: 'Bob Normal', globalRole: 'network-user' } });

                // ==========================================
                // BLOQUE 2: SEGURIDAD, RBAC Y MUROS DE CRISTAL
                // ==========================================
                const draftRoles = Object.keys(MOCK_ONTOLOGY).map(levelKey => ({
                    id: 'role_' + levelKey.replace('@','') + '_' + Date.now(), 
                    levelId: levelKey, name: MOCK_ONTOLOGY[levelKey].name, 
                    fmv: MOCK_ONTOLOGY[levelKey].fmv, multiplier: MOCK_ONTOLOGY[levelKey].multiplier, 
                    guardian: MOCK_ONTOLOGY[levelKey].guardian, isArchived: false
                }));

                await store.dispatch({ 
                    type: 'CREATE_PROJECT', 
                    payload: { 
                        id: PID_TEST, nombre: "Matrix Sandbox", ownerId: dynNeoId, isPrivate: true, 
                        roles: draftRoles, vna_flows: [], work_orders: [], ledger: [], logs: [], 
                        usuarios: [
                            {id: dynNeoId, permissions: {canCreateWO: true, canApprove: true}}, 
                            {id: dynLauraId, permissions: {canCreateWO: false}}
                        ],
                        governance: { workOrderCreation: 'custom' }
                    } 
                });

                const hasAccessPO = store.canUserViewProject(PID_TEST, dynNeoId, 'network-user');
                await assert(hasAccessPO === true, "Gobernanza: Project Owner domina su ecosistema", "RBAC");

                const hasAccessBob = store.canUserViewProject(PID_TEST, dynBobId, 'network-user');
                await assert(hasAccessBob === false, "Privacidad: Muro criptográfico bloquea a entidades externas", "PRIVACY");
                
                await assert(store.canUserCreateWorkOrder(PID_TEST, dynLauraId) === false, "RBAC: Nodo operativo bloqueado por política de red estricta", "RBAC");

                // ==========================================
                // BLOQUE 3: TOPOLOGÍA VNA Y CEREBRO A2A (LMS)
                // ==========================================
                await KB.init();
                const globalDocs = await KB.getAllDocuments('global');
                const hasPantheon = globalDocs.find(d => d.id === 'meme_os_pantheon');
                await assert(hasPantheon !== undefined, "Cerebro Semántico A2A: Leyes de VNA y Pantheon compiladas", "A2A-SEED");

                let p = store.getState().projects.find(x => x.id === PID_TEST);
                const rAnx = p.roles.find(r => r.levelId === '@anxaneta');
                const rBaix = p.roles.find(r => r.levelId === '@baixos');

                // Inyección de un Flow con Required Skills
                await store.dispatch({ 
                    type: 'ADD_FLOW', 
                    payload: { 
                        projectId: PID_TEST, 
                        flow: { 
                            id: 'flow_1', from: rAnx.id, to: rBaix.id, template: "Estrategia Base", tipo: "tangible", estimatedHours: 10,
                            required_skills: ['meme_skill_core_tdd', 'meme_soc_code_quality'] 
                        } 
                    } 
                });
                
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.vna_flows.length === 1 && p.vna_flows[0].required_skills.length === 2, "Mapa VNA: Rutas de valor ancladas a la Tríada de Competencias", "VNA-SKILLS");

                // ==========================================
                // BLOQUE 4: CICLO DE VIDA DE LA RECETA (SOP -> SOC -> AUDITORÍA)
                // ==========================================
                const woHash = 'wo_' + Date.now();
                await store.dispatch({ 
                    type: 'SPAWN_WORK_ORDER', 
                    payload: { 
                        projectId: PID_TEST, 
                        workOrder: { 
                            hash: woHash, flowId: 'flow_1', status: 'theoretical', realHours: 0,
                            soc_checklist: [
                                { id: 'soc_1', text: "El código pasa los linters", isChecked: false },
                                { id: 'soc_2', text: "Documentación generada", isChecked: false }
                            ],
                            resources: ['GitHub Repo']
                        } 
                    } 
                });

                p = store.getState().projects.find(x => x.id === PID_TEST);
                const currentWO = p.work_orders[0];
                await assert(currentWO.soc_checklist && currentWO.soc_checklist.length === 2, "Fractalidad Memética: La Receta (SOP) contiene su Checklist de conducta (SOCs)", "SOP-MEME");

                await store.dispatch({ type: 'PING_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, userId: dynLauraId } });
                await store.dispatch({ type: 'REPORT_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, realHours: 8, comentario: 'Test PoW' } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'reported', "Ejecución: Prueba de Trabajo (PoW) reportada a la matriz", "WORKFLOW");

                // Fase de Auditoría (Review)
                await store.dispatch({ 
                    type: 'REVIEW_WORK_ORDER', 
                    payload: { 
                        projectId: PID_TEST, woHash: woHash, auditorId: genesiAi.id,
                        socValidation: { 'soc_1': true, 'soc_2': true } 
                    } 
                });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'in_review' && p.work_orders[0].soc_checklist[0].isChecked === true, "Auditoría Criptográfica: Agente Validador marca los SOCs como completados", "AUTO-AUDIT");

                const preDocs = await KB.getAllDocuments();
                await store.dispatch({ type: 'APPROVE_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'consolidated', "Notaría Digital: SOP validada y sellada inmutablemente", "LEDGER");

                const laura = store.getState().globalUsers.find(u => u.id === dynLauraId);
                const hasSkill = laura.profile.sbt_skills && laura.profile.sbt_skills.length > 0;
                await assert(hasSkill === true && laura.profile.sbt_skills[0].exp === 8, "Reputación SBT: Experiencia cristalizada en el perfil del nodo", "SBT-SKILLS");

                await sleep(100);
                const postDocs = await KB.getAllDocuments();
                await assert(postDocs.length > preDocs.length, "LMS Auto-Aprendizaje: El Kernel extrajo un caso de éxito validado a su BD semántica", "LMS-HOOK");

                // Verificamos que el Paper Log esté registrando
                await assert(p.logs && p.logs.length > 0, "Paper Workspace: El Sistema Operativo guarda eventos en el log hipertextual.", "PAPER-LOG");

                // ==========================================
                // BLOQUE 5: CÁLCULOS MATEMÁTICOS DE EQUIDAD (SLICING PIE)
                // ==========================================
                const expectedSlices = 8 * 40 * 1.2; // 8h * fmv(@baixos: 40) * mult(1.2)
                await assert(p.ledger[0].valorCongelado === expectedSlices, `Slicing Pie: Ecuación de Equidad resuelta sin fisuras (${expectedSlices} Slices)`, "MATH");
                
                await store.dispatch({ type: 'ADD_CAPITAL_INJECTION', payload: { projectId: PID_TEST, userId: dynNeoId, assetType: 'cash', amount: 1000, description: "Inyección de Seed Capital" } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                const capTx = p.ledger.find(l => l.roleId === 'CAPITAL_ASSET');
                await assert(capTx !== undefined && capTx.valorCongelado > 1000, "Ledger Cash: Multiplicador de riesgo de Capital aplicado al FIAT entrante", "LEDGER-CASH");

                const harvest = store.calculateHarvest(PID_TEST);
                await assert(harvest.length === 2, "Cap Table: Convergencia de aportaciones (SOPs Laborales + Capital Líquido)", "CAP-TABLE");

                // FINALIZACIÓN EXITOSA (FASE VERDE)
                await sleep(200);
                terminal.insertAdjacentHTML('beforeend', `
                    <div style="margin-top: 30px; padding: 25px; background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); border-radius: 12px; text-align: center; box-shadow: 0 0 30px rgba(0, 230, 118, 0.15); animation: fadeIn 0.5s ease-out;">
                        <h2 style="color: var(--accent-green); margin: 0; font-size: 2rem; letter-spacing:-1px;">🔥 V11 KERNEL CERTIFIED 🔥</h2>
                        <p style="color: white; font-size: 1.05rem; margin-top: 10px;">La Matriz de A2A, Identidad Web3, Slicing Pie y Auditoría Fractal (SOCs) responden con tolerancia cero a fallos.</p>
                    </div>
                `);
                
                await new Promise(r => requestAnimationFrame(r));
                terminal.scrollTop = terminal.scrollHeight;
                
                btnEnter.classList.add('visible');

            } catch (error) {
                terminal.insertAdjacentHTML('beforeend', `
                    <div style="margin-top: 20px; padding: 20px; background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); border-radius: 12px;">
                        <h3 style="color: var(--accent-red); margin: 0;">💥 KERNEL PANIC</h3>
                        <p style="color: white; font-size: 0.9rem; margin-top: 10px; font-family: monospace;">${error.message}</p>
                    </div>
                `);
                await new Promise(r => requestAnimationFrame(r));
                terminal.scrollTop = terminal.scrollHeight;
            }
            
            const cursor = document.querySelector('.cursor');
            if(cursor) cursor.remove();
        };

        setTimeout(runTests, 400);
    }
}
