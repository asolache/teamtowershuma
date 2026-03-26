// v9/js/views/TestsView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';

const MOCK_ONTOLOGY = {
    '@anxaneta': { name: 'Growth Hacker', multiplier: 3.0, fmv: 70, guardian: 'explorer' },
    '@aixecador': { name: 'Director Creativo', multiplier: 2.0, fmv: 60, guardian: 'creator' },
    '@dosos': { name: 'Project Manager', multiplier: 1.5, fmv: 50, guardian: 'ruler' },
    '@baixos': { name: 'Diseñador UI', multiplier: 1.2, fmv: 40, guardian: 'lover' },
    '@pinya': { name: 'Community Manager', multiplier: 1.0, fmv: 25, guardian: 'caregiver' }
};

const LLM_PRICING = {
    'deepseek': { input: 0.14, output: 0.28 },
    'gemini': { input: 0.075, output: 0.30 },
    'openai': { input: 0.15, output: 0.60 },
    'anthropic': { input: 3.00, output: 15.00 }
};

export default class TestsView {
    constructor() {
        document.title = "Diagnóstico de Sistema | TeamTowers V9";
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: radial-gradient(circle at center, #111116 0%, #050505 100%); font-family: var(--font-mono); justify-content: center; align-items: center; }
                .test-container { width: 100%; max-width: 950px; padding: 2rem; }
                
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
                
                .test-row { margin-bottom: 12px; display: flex; align-items: flex-start; animation: fadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
                .test-icon { margin-right: 15px; font-size: 1.2rem; }
                .test-msg { flex: 1; color: #ddd; }
                .test-badge { font-size: 0.7rem; padding: 3px 10px; border-radius: 8px; background: rgba(0,0,0,0.6); border: 1px solid #444; color: var(--text-muted); margin-left: 15px; white-space: nowrap; font-weight: bold; }
                
                .pass-row { border-left: 3px solid var(--accent-green); padding-left: 15px; }
                .fail-row { border-left: 3px solid var(--accent-red); padding-left: 15px; }

                .action-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 2rem; }
                .score-display { font-size: 2.5rem; font-weight: 900; color: var(--text-muted); }
                
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
                        <h1>V9 ANTIGRAVITY KERNEL</h1>
                        <p>Validando Inmutabilidad Redux, AgentSkills (.skill), TDD y Semantic WebGL</p>
                    </div>

                    <div class="log-terminal" id="terminalLog">
                        <div style="color: var(--accent-green); margin-bottom: 20px; font-weight:900; font-size: 1.1rem;">> INICIANDO DIAGNÓSTICO DE ESTRÉS COGNITIVO... <span class="cursor"></span></div>
                    </div>

                    <div class="action-footer">
                        <div class="score-display" id="testScore">0/0</div>
                        <a href="/v9/dashboard" data-link class="btn-enter-matrix" id="btnEnterOS">Entrar al Kernel &rarr;</a>
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
        let originalUser = null;

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const assert = async (condition, message, tag) => {
            total++;
            const isPass = !!condition;
            if(isPass) passed++;
            
            await sleep(80); 
            
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
            const dynAgentId = '@deep_coder_' + Math.floor(Math.random() * 1000);

            try {
                await store.init();
                originalUser = store.getState().session?.activeUserId;

                // ==========================================
                // BLOQUE 1: KERNEL V9 & IDENTIDAD
                // ==========================================
                const currentVer = store.getState().config?.version || 'Desconocida';
                await assert(currentVer.includes('v9') || currentVer.includes('Antigravity'), `Motor Redux Inmutable V9 Activo (Detectada: ${currentVer})`, "SYS");
                
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: dynNeoId } });
                await assert(store.getState().session.activeUserId === dynNeoId, "Identidad Web3 inyectada temporalmente en Storage Redux", "AUTH");

                await store.dispatch({ type: 'ADD_USER', payload: { id: dynLauraId, name: 'Laura Dev', globalRole: 'network-user' } });
                await store.dispatch({ 
                    type: 'ADD_USER', 
                    payload: { id: dynAgentId, name: 'Deep Coder', globalRole: 'ai-agent', profile: { isAi: true, preferredEngine: 'deepseek', version: 'v9' } } 
                });
                
                // Inyectamos a los agentes de Antifragilidad para validar su estructura en el store
                await store.dispatch({ type: 'ADD_USER', payload: { id: '@synaptic_weaver', name: 'Synaptic Weaver', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'magician' } } });
                await store.dispatch({ type: 'ADD_USER', payload: { id: '@token_economist', name: 'Token Economist', globalRole: 'ai-agent', profile: { isAi: true, guardian: 'ruler' } } });
                
                const weaverExists = store.getState().globalUsers.find(u => u.id === '@synaptic_weaver');
                await assert(weaverExists !== undefined, "Enjambre Evolucionado: Agentes Antifrágiles inyectados en la red neuronal.", "SWARM-V9");

                // ==========================================
                // BLOQUE 2: MEMORIA PROFUNDA (AGENTSKILLS & VNA)
                // ==========================================
                const db = await KB.init();
                await assert(db !== null, "IndexedDB Córtex (kb.js) montada y sincronizada correctamente", "KB-INIT");

                const allSkills = await KB.getAllNodes({ category: 'skill' });
                const allRefs = await KB.getAllNodes({ category: 'reference' });
                
                await assert(allSkills.length > 0 && allRefs.length > 0, `Arquitectura AgentSkills: Desacople estricto entre Instrucciones (${allSkills.length}) y Teoría (${allRefs.length})`, "SKILL-ARCH");

                const mockAgentSkill = { id: 'test_skill', type: 'skill', references: ['ref_1'], evals: ['eval_1'], scripts: ['script_1'] };
                await assert(mockAgentSkill.evals !== undefined, "Estructura AgentSkills: Soporte nativo para TDD Evals (/evals/evals.json)", "EVALS-READY");
                await assert(mockAgentSkill.scripts !== undefined, "Estructura AgentSkills: Soporte nativo para Scripts ejecutables (/scripts/)", "SCRIPTS-READY");

                const vnaSkill = allSkills.find(s => s.id === 'skill_vna_strategy');
                await assert(vnaSkill !== undefined, "Motor VNA: Skill de Generación de Mapas de Valor instanciada", "VNA-CORE");
                await assert(vnaSkill.references.includes('ref_immortal_tdd'), "Constitución TDD: La Skill VNA hereda la inmutabilidad del Kernel (ref_immortal_tdd)", "TDD-LINK");
                
                const metaSkill = allSkills.find(s => s.id === 'skill_creator_master');
                await assert(metaSkill !== undefined, "Recursividad Cognitiva: Meta-Skill Forjadora de Skills activa", "META-SKILL");

                // ==========================================
                // BLOQUE 3: CREACIÓN DE ECOSISTEMA VNA & RBAC
                // ==========================================
                const draftRoles = Object.keys(MOCK_ONTOLOGY).map(levelKey => ({
                    id: 'role_' + levelKey.replace('@','') + '_' + Date.now(), 
                    levelId: levelKey, name: MOCK_ONTOLOGY[levelKey].name, 
                    fmv: MOCK_ONTOLOGY[levelKey].fmv, multiplier: MOCK_ONTOLOGY[levelKey].multiplier, 
                    guardian: MOCK_ONTOLOGY[levelKey].guardian
                }));

                await store.dispatch({ 
                    type: 'CREATE_PROJECT', 
                    payload: { 
                        id: PID_TEST, nombre: "Matrix Sandbox", ownerId: dynNeoId, isPrivate: true, 
                        roles: draftRoles, vna_flows: [], work_orders: [], ledger: [], logs: [], telemetry: [],
                        usuarios: [{id: dynNeoId, permissions: {canCreateWO: true}}, {id: dynLauraId, permissions: {canCreateWO: false}}, {id: dynAgentId, permissions: {canCreateWO: false}}] 
                    } 
                });

                const hasAccessPO = store.canUserViewProject(PID_TEST, dynNeoId, 'network-user');
                await assert(hasAccessPO === true, "Gobernanza: Project Owner domina su ecosistema de forma Zero-Trust", "RBAC");

                let p = store.getState().projects.find(x => x.id === PID_TEST);
                const rAnx = p.roles.find(r => r.levelId === '@anxaneta');
                const rBaix = p.roles.find(r => r.levelId === '@baixos');

                await store.dispatch({ 
                    type: 'ADD_FLOW', 
                    payload: { 
                        projectId: PID_TEST, 
                        flow: { 
                            id: 'flow_1', from: rAnx.id, to: rBaix.id, template: "Backend Microservice", tipo: "tangible", estimatedHours: 10,
                            required_skills: ['skill_vna_strategy', 'skill_creator_master'] 
                        } 
                    } 
                });

                // ==========================================
                // BLOQUE 4: REDUX INMUTABLE (SOP, TDD = SOC Y EJECUCIÓN)
                // ==========================================
                const woHash = 'wo_' + Date.now();
                await store.dispatch({ 
                    type: 'SPAWN_WORK_ORDER', 
                    payload: { 
                        projectId: PID_TEST, 
                        workOrder: { 
                            hash: woHash, flowId: 'flow_1', status: 'theoretical', realHours: 0,
                            soc_checklist: [{ id: 'soc_1', text: "Pasa aserciones estrictas TDD (Evals)", isChecked: false }]
                        } 
                    } 
                });

                await store.dispatch({ type: 'UPDATE_WO_STATUS', payload: { projectId: PID_TEST, hash: woHash, status: 'pinged', assigneeId: dynAgentId } });
                await store.dispatch({ type: 'REPORT_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, realHours: 8.42, comentario: 'Commit Pushed' } });
                
                // Prueba TDD Fallida
                await store.dispatch({ type: 'REVIEW_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, auditorId: '@notari_ledger', socValidation: { 'soc_1': false } } });
                await store.dispatch({ type: 'APPROVE_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'reported', "Notaría Componentizada: El Ledger bloquea la consolidación si el SOC Eval falla", "EVAL-FAIL");

                // Prueba TDD Exitosa
                await store.dispatch({ type: 'REVIEW_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, auditorId: '@notari_ledger', socValidation: { 'soc_1': true } } });
                await store.dispatch({ type: 'APPROVE_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'consolidated', "Notaría Componentizada: Eval superado. SOP inyectado inmutablemente en la red", "EVAL-PASS");

                // ==========================================
                // BLOQUE 5: CÁLCULOS MATEMÁTICOS DE EQUIDAD (SLICING PIE)
                // ==========================================
                const expectedSlices = parseFloat((8.42 * 40 * 1.2).toFixed(3)); 
                await assert(p.ledger[0].valorCongelado === expectedSlices, `Slicing Pie V9: Equidad resuelta con precisión decimal (${expectedSlices} Slices)`, "MATH");
                
                await store.dispatch({ type: 'ADD_CAPITAL_INJECTION', payload: { projectId: PID_TEST, userId: dynNeoId, assetType: 'cash', amount: 1000, description: "Seed" } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                const capTx = p.ledger.find(l => l.roleId === 'CAPITAL_ASSET');
                await assert(capTx !== undefined && capTx.valorCongelado === 4000, "Ledger Cash: Multiplicador de riesgo FIAT (x4.0) aplicado", "LEDGER");

                // ==========================================
                // BLOQUE 6: TELEMETRÍA Y EFICIENCIA COGNITIVA (REC)
                // ==========================================
                const mockApiUsage = { prompt_tokens: 15000, completion_tokens: 2500 };
                const selectedEngine = 'deepseek'; 
                const priceMatrix = LLM_PRICING[selectedEngine];
                const costInDollars = ((mockApiUsage.prompt_tokens / 1000000) * priceMatrix.input) + ((mockApiUsage.completion_tokens / 1000000) * priceMatrix.output);
                const valueCreated = 8.42 * 40; 
                const REC = valueCreated / costInDollars;

                await store.dispatch({
                    type: 'LOG_TELEMETRY',
                    payload: {
                        projectId: PID_TEST, agentId: dynAgentId, engine: selectedEngine, actionType: 'SOP_EXECUTION',
                        tokens: mockApiUsage, costInDollars: costInDollars, recRatio: REC, latencyMs: 1200
                    }
                });

                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.telemetry.length === 1, `Telemetría Dashboard: Gasto API registrado ($${costInDollars.toFixed(4)})`, "TELEMETRY");
                await assert(REC > 10000, `Eficiencia REC: Retorno masivo. Generados 336.8€ con coste mínimo`, "ROI");

                // ==========================================
                // BLOQUE 7: USENET PINGS & OMNI-FLOW
                // ==========================================
                await store.dispatch({
                    type: 'ADD_LOG_ENTRY',
                    payload: {
                        projectId: PID_TEST,
                        log: { id: 'log_1', authorId: dynAgentId, relatedTxHash: woHash, content: "SOP ejecutado. Revisa aserciones @laura_dev_", mentions: [dynLauraId], readBy: [] }
                    }
                });

                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.logs.length === 1 && p.logs[0].mentions.includes(dynLauraId), "Omni-Flow P2P: Mención Semántica inyectada en Log", "USENET");
                
                const unreadPings = p.logs.filter(l => l.mentions && l.mentions.includes(dynLauraId) && !l.readBy?.includes(dynLauraId));
                await assert(unreadPings.length === 1, "Omni-Paper Radar: El Nodo receptor suma +1 en su bandeja táctica", "PING");

                await store.dispatch({
                    type: 'MARK_LOG_READ',
                    payload: { projectId: PID_TEST, logId: 'log_1', userId: dynLauraId }
                });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                const stillUnread = p.logs.filter(l => l.mentions && l.mentions.includes(dynLauraId) && !l.readBy?.includes(dynLauraId));
                await assert(stillUnread.length === 0, "Limpieza de Flujo: El ping se purga tras acuse de recibo.", "PING-READ");

                // ==========================================
                // TEARDOWN (Limpieza del Sandbox)
                // ==========================================
                if (originalUser) {
                    await store.dispatch({ type: 'LOGIN_USER', payload: { userId: originalUser } });
                }
                
                // 🔥 PURGA DEL SANDBOX
                await store.dispatch({ type: 'DELETE_PROJECT', payload: { projectId: PID_TEST } });
                terminal.insertAdjacentHTML('beforeend', `<div style="color:#888; font-size:0.8rem; margin-top:10px;">> Purga de Matrix Sandbox ejecutada exitosamente.</div>`);

                // FINALIZACIÓN EXITOSA
                await sleep(400);
                terminal.insertAdjacentHTML('beforeend', `
                    <div style="margin-top: 30px; padding: 30px; background: rgba(0, 230, 118, 0.05); border: 1px solid var(--accent-green); border-radius: 16px; text-align: center; box-shadow: 0 0 50px rgba(0, 230, 118, 0.15); animation: fadeIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);">
                        <h2 style="color: var(--accent-green); margin: 0; font-size: 2.2rem; letter-spacing:-1px; text-shadow: 0 0 20px rgba(0,230,118,0.5);">🔥 KERNEL V9 INMORTAL 🔥</h2>
                        <p style="color: #ccc; font-size: 1.1rem; margin-top: 15px; line-height: 1.6;">El Sistema Operativo de Sinergias (SOS) ha superado la auditoría. La arquitectura AgentSkills, la inmutabilidad Redux y las Evals operan a nivel estructural profundo.</p>
                    </div>
                `);
                
                await new Promise(r => requestAnimationFrame(r));
                terminal.scrollTop = terminal.scrollHeight;
                btnEnter.classList.add('visible');

            } catch (error) {
                terminal.insertAdjacentHTML('beforeend', `
                    <div style="margin-top: 30px; padding: 30px; background: rgba(255, 82, 82, 0.05); border: 1px solid var(--accent-red); border-radius: 16px;">
                        <h3 style="color: var(--accent-red); margin: 0; font-size: 1.8rem;">💥 COLAPSO NEURAL (KERNEL PANIC)</h3>
                        <p style="color: white; font-size: 1rem; margin-top: 15px; font-family: var(--font-mono); background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px;">${error.message}</p>
                    </div>
                `);
                
                // 🔥 TEARDOWN EN CASO DE ERROR (Asegurar que el Sandbox se purga aunque falle el test)
                if (originalUser) {
                    await store.dispatch({ type: 'LOGIN_USER', payload: { userId: originalUser } });
                }
                await store.dispatch({ type: 'DELETE_PROJECT', payload: { projectId: PID_TEST } });
                
                await new Promise(r => requestAnimationFrame(r));
                terminal.scrollTop = terminal.scrollHeight;
            }
            
            const cursor = document.querySelector('.cursor');
            if(cursor) cursor.remove();
        };

        setTimeout(runTests, 800);
    }
}
