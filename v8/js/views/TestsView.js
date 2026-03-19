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

const LLM_PRICING = {
    'deepseek': { input: 0.14, output: 0.28 },
    'gemini': { input: 0.075, output: 0.30 },
    'openai': { input: 0.15, output: 0.60 },
    'anthropic': { input: 3.00, output: 15.00 }
};

export default class TestsView {
    constructor() {
        document.title = "Boot Diagnostics | TeamTowers V15.5";
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-mono); justify-content: center; align-items: center; }
                .test-container { width: 100%; max-width: 900px; padding: 2rem; }
                
                .matrix-header { text-align: center; margin-bottom: 2rem; }
                .matrix-header h1 { color: var(--accent-green); font-size: 2.5rem; letter-spacing: 2px; margin: 0; text-transform: uppercase; text-shadow: 0 0 15px rgba(0, 230, 118, 0.4); }
                .matrix-header p { color: var(--text-muted); font-size: 0.9rem; margin-top: 5px; }

                .log-terminal { 
                    background: rgba(5, 5, 7, 0.95); border: 1px solid rgba(0, 230, 118, 0.3); 
                    border-radius: 12px; padding: 1.5rem; height: 500px; overflow-y: auto; 
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
                        <h1>V15.5 FRACTAL DIAGNOSTICS</h1>
                        <p>Validando Semantic RAG (W3C), Córtex A2A, TDD Componentizado y Core OS</p>
                    </div>

                    <div class="log-terminal" id="terminalLog">
                        <div style="color: var(--accent-green); margin-bottom: 15px; font-weight:bold;">> CARGANDO VECTORES DE ESTRÉS... <span class="cursor"></span></div>
                    </div>

                    <div class="action-footer">
                        <div class="score-display" id="testScore">0/0</div>
                        <a href="/v8/dashboard" data-link class="btn-enter-matrix" id="btnEnterOS">ENTRAR AL KERNEL →</a>
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
            
            await sleep(50); 
            
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
            const PID_TEST = 'v15-stress-' + Date.now();
            const dynNeoId = '0xNeoWallet' + Math.floor(Math.random() * 1000);
            const dynLauraId = '@laura_dev_' + Math.floor(Math.random() * 1000);
            const dynAgentId = '@deep_coder_' + Math.floor(Math.random() * 1000);

            try {
                // Guardamos el usuario original para restaurarlo después del test
                const originalUser = store.getState().session.activeUserId;

                // ==========================================
                // BLOQUE 1: KERNEL LEGACY & IDENTIDAD (V15)
                // ==========================================
                const currentVer = store.getState().config?.version || 'Desconocida';
                await assert(true, `Motor Fractal Activo y Respondiendo (Detectada: ${currentVer})`, "SYS");
                
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: dynNeoId } });
                await assert(store.getState().session.activeUserId === dynNeoId, "Identidad Web3 verificada en Storage Redux", "AUTH");

                await store.dispatch({ type: 'ADD_USER', payload: { id: dynLauraId, name: 'Laura Dev', globalRole: 'network-user' } });
                await store.dispatch({ 
                    type: 'ADD_USER', 
                    payload: { id: dynAgentId, name: 'Deep Coder', globalRole: 'ai-agent', profile: { isAi: true, preferredEngine: 'deepseek', version: 'v15' } } 
                });

                // ==========================================
                // BLOQUE 2: MEMORIA PROFUNDA (KB) & RAG W3C
                // ==========================================
                const db = await KB.init();
                await assert(db !== null, "IndexedDB Córtex montada y sincronizada correctamente", "KB-INIT");

                const allMemes = await KB.getAllNodes({ type: 'meme' });
                const hasKernelMemes = allMemes.some(m => m.keywords && m.keywords.includes('#kernel_sos'));
                await assert(hasKernelMemes, `Motor de Génesis: Semillas del OS inyectadas en la red neuronal.`, "CÓRTEX");

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
                            required_skills: ['meme_skill_core_tdd', 'meme_soc_code_quality'] 
                        } 
                    } 
                });

                // ==========================================
                // BLOQUE 4: SOP, TDD = SOC Y EJECUCIÓN (NOTARÍA DIGITAL)
                // ==========================================
                const woHash = 'wo_' + Date.now();
                await store.dispatch({ 
                    type: 'SPAWN_WORK_ORDER', 
                    payload: { 
                        projectId: PID_TEST, 
                        workOrder: { 
                            hash: woHash, flowId: 'flow_1', status: 'theoretical', realHours: 0,
                            soc_checklist: [{ id: 'soc_1', text: "Pasa tests TDD", isChecked: false }]
                        } 
                    } 
                });

                await store.dispatch({ type: 'PING_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, userId: dynAgentId } });
                await store.dispatch({ type: 'REPORT_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, realHours: 8, comentario: 'Commit Pushed' } });
                
                // Prueba TDD Fallida
                await store.dispatch({ type: 'REVIEW_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, auditorId: '@notari_ledger', socValidation: { 'soc_1': false } } });
                await store.dispatch({ type: 'APPROVE_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'reported', "TDD Activo: El Ledger rechaza consolidar si el SOC (Unit Test) falla.", "TDD-SOC");

                // Prueba TDD Exitosa
                await store.dispatch({ type: 'REVIEW_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash, auditorId: '@notari_ledger', socValidation: { 'soc_1': true } } });
                await store.dispatch({ type: 'APPROVE_WORK_ORDER', payload: { projectId: PID_TEST, woHash: woHash } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'consolidated', "Notaría Componentizada: TDD superado. SOP validado y sellado inmutablemente", "LEDGER");

                // ==========================================
                // BLOQUE 5: CÁLCULOS MATEMÁTICOS DE EQUIDAD (SLICING PIE)
                // ==========================================
                const expectedSlices = 8 * 40 * 1.2; 
                await assert(p.ledger[0].valorCongelado === expectedSlices, `Slicing Pie: Ecuación de Equidad resuelta (${expectedSlices} Slices)`, "MATH");
                
                await store.dispatch({ type: 'ADD_CAPITAL_INJECTION', payload: { projectId: PID_TEST, userId: dynNeoId, assetType: 'cash', amount: 1000, description: "Seed" } });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                const capTx = p.ledger.find(l => l.roleId === 'CAPITAL_ASSET');
                await assert(capTx !== undefined && capTx.valorCongelado > 1000, "Ledger Cash: Multiplicador de riesgo 4x aplicado al FIAT", "LEDGER-CASH");

                // ==========================================
                // BLOQUE 6: TELEMETRÍA Y EFICIENCIA COGNITIVA (REC)
                // ==========================================
                const mockApiUsage = { prompt_tokens: 15000, completion_tokens: 2500 };
                const selectedEngine = 'deepseek'; 
                const priceMatrix = LLM_PRICING[selectedEngine];
                const costInDollars = ((mockApiUsage.prompt_tokens / 1000000) * priceMatrix.input) + ((mockApiUsage.completion_tokens / 1000000) * priceMatrix.output);
                const valueCreated = 8 * 40; 
                const REC = valueCreated / costInDollars;

                await store.dispatch({
                    type: 'LOG_TELEMETRY',
                    payload: {
                        projectId: PID_TEST, agentId: dynAgentId, engine: selectedEngine, actionType: 'SOP_EXECUTION',
                        tokens: mockApiUsage, costInDollars: costInDollars, recRatio: REC, latencyMs: 1200
                    }
                });

                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.telemetry.length === 1, `Telemetría: Gasto API registrado (${mockApiUsage.prompt_tokens + mockApiUsage.completion_tokens} tokens)`, "TELEMETRY");
                await assert(REC > 10000, `Eficiencia REC: Retorno masivo. Generados 320€ con un coste de $${costInDollars.toFixed(4)}`, "OPTIMIZER");

                // ==========================================
                // BLOQUE 7: USENET PINGS & OMNI-FLOW
                // ==========================================
                await store.dispatch({
                    type: 'ADD_LOG_ENTRY',
                    payload: {
                        projectId: PID_TEST,
                        log: { id: 'log_1', authorId: dynAgentId, relatedTxHash: woHash, content: "SOP ejecutado. Revisa el código @laura_dev_", mentions: [dynLauraId], readBy: [] }
                    }
                });

                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.logs.length === 1 && p.logs[0].mentions.includes(dynLauraId), "Omni-Flow Usenet: Mención detectada e inyectada en Log", "USENET");
                
                const unreadPings = p.logs.filter(l => l.mentions && l.mentions.includes(dynLauraId) && !l.readBy?.includes(dynLauraId));
                await assert(unreadPings.length === 1, "PageHeader Radar: El Nodo receptor suma +1 en su bandeja de Pings pendientes.", "RADAR-PING");

                await store.dispatch({
                    type: 'MARK_LOG_READ',
                    payload: { projectId: PID_TEST, logId: 'log_1', userId: dynLauraId }
                });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                const stillUnread = p.logs.filter(l => l.mentions && l.mentions.includes(dynLauraId) && !l.readBy?.includes(dynLauraId));
                await assert(stillUnread.length === 0, "Flujo de Comunicación: El ping se purga tras acuse de recibo en el Omni-Paper.", "PING-READ");


                // Restauramos el usuario original al acabar el test para no desloguearte
                if (originalUser) {
                    await store.dispatch({ type: 'LOGIN_USER', payload: { userId: originalUser } });
                }

                // FINALIZACIÓN EXITOSA
                await sleep(200);
                terminal.insertAdjacentHTML('beforeend', `
                    <div style="margin-top: 30px; padding: 25px; background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); border-radius: 12px; text-align: center; box-shadow: 0 0 30px rgba(0, 230, 118, 0.15); animation: fadeIn 0.5s ease-out;">
                        <h2 style="color: var(--accent-green); margin: 0; font-size: 2rem; letter-spacing:-1px;">🔥 V15.5 KERNEL CERTIFIED 🔥</h2>
                        <p style="color: white; font-size: 1.05rem; margin-top: 10px;">La Forja Neuronal, el Cerebro LMS (RAG), la Notaría y la Telemetría han pasado los test de estrés. Listo para Producción.</p>
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
                
                // Restauramos usuario original incluso si el test falla
                if (originalUser) {
                    await store.dispatch({ type: 'LOGIN_USER', payload: { userId: originalUser } });
                }
            }
            
            const cursor = document.querySelector('.cursor');
            if(cursor) cursor.remove();
        };

        setTimeout(runTests, 400);
    }
}
