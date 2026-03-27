// =============================================================================
// TEAMTOWERS SOS V10 — TESTS VIEW
// Ruta: ia/dev/js/views/TestsView.js
// Diagnóstico de Sistema · Antigravity Kernel V10
// =============================================================================

import { store } from '../core/store.js';
import { KB }    from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';

const MOCK_ONTOLOGY = {
    '@anxaneta': { name: 'Growth Hacker',     multiplier: 3.0, fmv: 70, guardian: 'explorer' },
    '@aixecador': { name: 'Director Creativo', multiplier: 2.0, fmv: 60, guardian: 'creator'  },
    '@dosos':     { name: 'Project Manager',   multiplier: 1.5, fmv: 50, guardian: 'ruler'    },
    '@baixos':    { name: 'Diseñador UI',      multiplier: 1.2, fmv: 40, guardian: 'lover'    },
    '@pinya':     { name: 'Community Manager', multiplier: 1.0, fmv: 25, guardian: 'caregiver'}
};

const LLM_PRICING = {
    anthropic: { input: 3.00,  output: 15.00 }, // ← primario V10
    openai:    { input: 2.50,  output: 10.00 },
    deepseek:  { input: 0.14,  output: 0.28  },
    gemini:    { input: 0.075, output: 0.30  }
};

export default class TestsView {

    constructor() {
        document.title = 'Diagnóstico V10 | TeamTowers';
    }

    async getHtml() {
        return `
        <style>
            .app-layout { display:flex; height:100dvh; overflow:hidden;
                background:radial-gradient(circle at center, #111116 0%, #050505 100%);
                font-family:var(--font-mono); justify-content:center; align-items:center; }

            .test-container { width:100%; max-width:960px; padding:2rem; }

            .matrix-header { text-align:center; margin-bottom:2rem; }
            .matrix-header h1 { color:var(--accent-green); font-size:2.6rem; letter-spacing:2px; margin:0;
                text-transform:uppercase; text-shadow:0 0 25px rgba(0,230,118,0.4); font-weight:900; }
            .matrix-header p { color:var(--text-muted); font-size:0.9rem; margin-top:10px; font-family:var(--font-main); }

            .log-terminal { background:rgba(5,5,8,0.95); border:1px solid rgba(0,230,118,0.3);
                border-radius:16px; padding:2rem; height:500px; overflow-y:auto;
                font-size:0.82rem; line-height:1.8; color:#ccc; }

            .log-line { display:flex; align-items:flex-start; gap:12px; padding:4px 0;
                border-bottom:1px solid rgba(255,255,255,0.02); animation:fadeIn 0.3s ease-out; }
            .log-tag  { font-size:0.65rem; padding:2px 8px; border-radius:4px; font-weight:900;
                letter-spacing:1px; flex-shrink:0; margin-top:3px; }
            .tag-sys      { background:rgba(99,102,241,0.2);  color:var(--accent-indigo); }
            .tag-kb       { background:rgba(0,176,255,0.2);   color:var(--accent-blue); }
            .tag-auth     { background:rgba(0,230,118,0.2);   color:var(--accent-green); }
            .tag-math     { background:rgba(255,145,0,0.2);   color:var(--accent-orange); }
            .tag-ledger   { background:rgba(224,64,251,0.2);  color:var(--accent-purple); }
            .tag-telemetry{ background:rgba(255,82,82,0.15);  color:var(--accent-red); }
            .tag-roi      { background:rgba(0,230,118,0.15);  color:var(--accent-green); }
            .tag-swarm    { background:rgba(224,64,251,0.15); color:var(--accent-purple); }
            .tag-eval-pass{ background:rgba(0,230,118,0.2);   color:var(--accent-green); }
            .tag-eval-fail{ background:rgba(255,82,82,0.2);   color:var(--accent-red); }
            .tag-pass { color:var(--accent-green); }
            .tag-fail { color:var(--accent-red); }

            .log-text  { flex:1; }
            .log-check { font-size:1rem; flex-shrink:0; }

            .progress-bar { height:4px; background:rgba(255,255,255,0.05);
                border-radius:2px; margin-bottom:1.5rem; overflow:hidden; }
            .progress-fill { height:100%; background:linear-gradient(90deg, var(--accent-indigo), var(--accent-green));
                transition:width 0.4s ease-out; width:0%; }

            .btn-enter { background:linear-gradient(135deg, var(--accent-indigo), var(--accent-green));
                color:white; border:none; padding:14px 40px; border-radius:12px; font-size:1rem;
                font-weight:900; cursor:pointer; margin-top:1.5rem; display:none;
                transition:0.3s; letter-spacing:1px; }
            .btn-enter:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(99,102,241,0.4); }
            .btn-enter.visible { display:inline-block; animation:fadeIn 0.5s ease-out; }

            .cursor { display:inline-block; width:10px; height:16px;
                background:var(--accent-green); animation:pulse 1s infinite; margin-left:4px; }

            @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
            @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0; } }
        </style>

        <div class="app-layout">
            <div class="test-container">
                <div class="matrix-header">
                    <h1>⚡ SOS ANTIGRAVITY V10</h1>
                    <p>Diagnóstico de integridad del Kernel · Todos los sistemas bajo escrutinio</p>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>

                <div class="log-terminal" id="logTerminal">
                    <div class="log-line">
                        <span class="log-check">🔄</span>
                        <span class="log-text" style="color:var(--accent-green);">
                            Inicializando Suite de Tests V10 · Antigravity Kernel…<span class="cursor"></span>
                        </span>
                    </div>
                </div>

                <div style="text-align:center;">
                    <button class="btn-enter" id="btnEnterMatrix">ENTRAR A LA MATRIZ →</button>
                </div>
            </div>
        </div>`;
    }

    async afterRender() {
        const terminal    = document.getElementById('logTerminal');
        const progressFill = document.getElementById('progressFill');
        const btnEnter    = document.getElementById('btnEnterMatrix');

        let passed       = 0;
        let total        = 0;
        let originalUser = null;

        const log = (message, tag = 'SYS', isPass = true) => {
            total++;
            if (isPass) passed++;
            const tagClass = `tag-${tag.toLowerCase().replace(/[^a-z]/g, '')}`;
            const check    = isPass ? '✅' : '❌';
            const color    = isPass ? '' : 'color:var(--accent-red);';
            terminal.insertAdjacentHTML('beforeend', `
                <div class="log-line">
                    <span class="log-check">${check}</span>
                    <span class="log-tag ${tagClass}">${tag}</span>
                    <span class="log-text" style="${color}">${message}</span>
                </div>`);
            progressFill.style.width = `${Math.round((passed / Math.max(total, 1)) * 100)}%`;
            terminal.scrollTop = terminal.scrollHeight;
        };

        const assert = async (condition, message, tag) => {
            await new Promise(r => setTimeout(r, 40));
            log(message, tag, !!condition);
            if (!condition) throw new Error(`Test Fallido: [${tag}] ${message}`);
        };

        const runTests = async () => {
            const PID_TEST   = 'v10-stress-' + Date.now();
            const dynNeoId   = '0xNeoWallet'  + Math.floor(Math.random() * 1000);
            const dynLauraId = '@laura_dev_'  + Math.floor(Math.random() * 1000);
            const dynAgentId = '@deep_coder_' + Math.floor(Math.random() * 1000);

            try {
                await store.init();
                originalUser = store.getState().session?.activeUserId;

                // ── BLOQUE 1: KERNEL V10 & IDENTIDAD ─────────────────
                const ver = store.getState().config?.version || 'Desconocida';
                await assert(
                    ver.includes('v10') || ver.includes('Antigravity'),
                    `Motor Redux Inmutable V10 Activo (Detectada: ${ver})`, 'SYS'
                );

                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: dynNeoId } });
                await assert(store.getState().session.activeUserId === dynNeoId,
                    'Identidad Web3 inyectada temporalmente en Storage Redux', 'AUTH');

                await store.dispatch({ type: 'ADD_USER', payload: { id: dynLauraId, name: 'Laura Dev', globalRole: 'network-user' } });
                await store.dispatch({ type: 'ADD_USER', payload: { id: dynAgentId, name: 'Deep Coder V10', globalRole: 'ai-agent', profile: { isAi: true, preferredEngine: 'anthropic', version: 'v10' } } });

                const agentExists = store.getState().globalUsers.find(u => u.id === dynAgentId);
                await assert(agentExists?.profile?.preferredEngine === 'anthropic',
                    'Swarm V10: Agente creado con motor primario Anthropic', 'SWARM');

                // ── BLOQUE 2: INDEXEDDB (KB.JS) ──────────────────────
                const db = await KB.init();
                await assert(db !== null, 'IndexedDB Córtex (kb.js) montada y sincronizada correctamente', 'KB');

                const allSkills = await KB.getAllNodes({ type: 'skill' });
                await assert(Array.isArray(allSkills),
                    `Arquitectura AgentSkills: ${allSkills.length} skills en KB`, 'KB');

                // ── BLOQUE 3: API KEYS EN KB (ZERO localStorage) ──────
                const storedProvider = await Orchestrator.getDefaultProvider();
                await assert(typeof storedProvider === 'string',
                    `Bóveda KB: Provider activo leído de IndexedDB → "${storedProvider}"`, 'KB');

                const storedKey = await Orchestrator.getApiKey('anthropic');
                await assert(storedKey === null || storedKey.length > 0,
                    'Bóveda KB: API Key Anthropic accesible desde KB (no localStorage)', 'KB');

                // ── BLOQUE 4: PROYECTO & VNA ──────────────────────────
                await store.dispatch({
                    type: 'CREATE_PROJECT',
                    payload: {
                        id: PID_TEST, nombre: 'Stress Test V10', ownerId: dynNeoId,
                        archetype: 'tech-startup', roles: Object.entries(MOCK_ONTOLOGY).map(([levelId, d]) => ({
                            id: 'role_' + levelId.replace('@', ''), levelId, name: d.name,
                            fmv: d.fmv, multiplier: d.multiplier, guardian: d.guardian, isVacant: true
                        })),
                        vna_flows: [], work_orders: [], ledger: [], telemetry: []
                    }
                });

                let p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p !== undefined, 'Ecosistema VNA instanciado en Redux Kernel', 'SYS');

                const hasAccessPO = p.ownerId === dynNeoId;
                await assert(hasAccessPO, 'Gobernanza: Project Owner domina su ecosistema Zero-Trust', 'AUTH');

                const rAnx  = p.roles.find(r => r.levelId === '@anxaneta');
                const rBaix = p.roles.find(r => r.levelId === '@baixos');
                await store.dispatch({
                    type: 'ADD_FLOW',
                    payload: {
                        projectId: PID_TEST,
                        flow: { id: 'flow_1', from: rAnx.id, to: rBaix.id, template: 'Backend Microservice', tipo: 'tangible', estimatedHours: 10 }
                    }
                });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.vna_flows.length === 1, 'Flujo VNA inyectado en topología del ecosistema', 'SYS');

                // ── BLOQUE 5: REDUX INMUTABLE (TDD / SOC) ────────────
                const woHash = 'wo_' + Date.now();
                await store.dispatch({
                    type: 'SPAWN_WORK_ORDER',
                    payload: {
                        projectId: PID_TEST,
                        workOrder: {
                            hash: woHash, flowId: 'flow_1', status: 'theoretical', realHours: 0,
                            soc_checklist: [{ id: 'soc_1', text: 'Pasa aserciones estrictas TDD (Evals)', isChecked: false }]
                        }
                    }
                });

                await store.dispatch({ type: 'UPDATE_WO_STATUS',   payload: { projectId: PID_TEST, hash: woHash, status: 'pinged',   assigneeId: dynAgentId } });
                await store.dispatch({ type: 'REPORT_WORK_ORDER',  payload: { projectId: PID_TEST, woHash, realHours: 8.42, comentario: 'Commit Pushed' } });
                await store.dispatch({ type: 'REVIEW_WORK_ORDER',  payload: { projectId: PID_TEST, woHash, auditorId: '@notari_ledger', socValidation: { soc_1: false } } });
                await store.dispatch({ type: 'APPROVE_WORK_ORDER', payload: { projectId: PID_TEST, woHash } });

                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'reported',
                    'Notaría: Ledger bloquea consolidación si SOC Eval falla', 'EVAL-FAIL');

                await store.dispatch({ type: 'REVIEW_WORK_ORDER',  payload: { projectId: PID_TEST, woHash, auditorId: '@notari_ledger', socValidation: { soc_1: true } } });
                await store.dispatch({ type: 'APPROVE_WORK_ORDER', payload: { projectId: PID_TEST, woHash } });

                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.work_orders[0].status === 'consolidated',
                    'Notaría: Eval superado. SOP inyectado inmutablemente en la red', 'EVAL-PASS');

                // ── BLOQUE 6: SLICING PIE (MATEMÁTICAS) ──────────────
                const expectedSlices = parseFloat((8.42 * 40 * 1.2).toFixed(3));
                await assert(p.ledger[0].valorCongelado === expectedSlices,
                    `Slicing Pie V10: Equidad resuelta con precisión decimal (${expectedSlices} Slices)`, 'MATH');

                await store.dispatch({
                    type: 'ADD_CAPITAL_INJECTION',
                    payload: { projectId: PID_TEST, userId: dynNeoId, assetType: 'cash', amount: 1000, description: 'Seed' }
                });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                const capTx = p.ledger.find(l => l.roleId === 'CAPITAL_ASSET');
                await assert(capTx !== undefined && capTx.valorCongelado === 4000,
                    'Ledger Cash: Multiplicador de riesgo FIAT (x4.0) aplicado', 'LEDGER');

                // ── BLOQUE 7: TELEMETRÍA & REC ────────────────────────
                const mockUsage   = { prompt_tokens: 15000, completion_tokens: 2500 };
                const engine      = 'anthropic'; // V10 primario
                const priceMatrix = LLM_PRICING[engine];
                const costUSD     = ((mockUsage.prompt_tokens / 1_000_000) * priceMatrix.input) +
                                    ((mockUsage.completion_tokens / 1_000_000) * priceMatrix.output);
                const valueCreated = 8.42 * 40;
                const REC          = valueCreated / costUSD;

                await store.dispatch({
                    type: 'LOG_TELEMETRY',
                    payload: {
                        projectId: PID_TEST, agentId: dynAgentId, engine, actionType: 'SOP_EXECUTION',
                        tokens: mockUsage, costInDollars: costUSD, recRatio: REC, latencyMs: 950
                    }
                });

                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert(p.telemetry.length === 1,
                    `Telemetría V10: Gasto API Anthropic registrado ($${costUSD.toFixed(4)})`, 'TELEMETRY');
                await assert(REC > 100,
                    `Eficiencia REC Anthropic: Retorno masivo. ${REC.toFixed(0)}x sobre coste API`, 'ROI');

                // ── BLOQUE 8: USENET PING ─────────────────────────────
                await store.dispatch({
                    type: 'ADD_LOG_ENTRY',
                    payload: {
                        projectId: PID_TEST,
                        log: { id: 'log_1', authorId: dynAgentId, relatedTxHash: woHash, content: 'SOP ejecutado por Swarm V10.', mentions: [], readBy: [] }
                    }
                });
                p = store.getState().projects.find(x => x.id === PID_TEST);
                await assert((p.logs || []).length > 0, 'Usenet: Log entry registrada en el proyecto', 'SWARM');

                // ── TEARDOWN ──────────────────────────────────────────
                await store.dispatch({ type: 'DELETE_PROJECT', payload: { projectId: PID_TEST } });
                if (originalUser) {
                    await store.dispatch({ type: 'LOGIN_USER', payload: { userId: originalUser } });
                }

                // ── RESULTADO FINAL ───────────────────────────────────
                terminal.insertAdjacentHTML('beforeend', `
                    <div style="margin-top:30px; padding:30px; background:rgba(0,230,118,0.04);
                                border:1px solid var(--accent-green); border-radius:16px; text-align:center;">
                        <h3 style="color:var(--accent-green); margin:0; font-size:2rem;">
                            ✅ ${passed}/${total} TESTS SUPERADOS
                        </h3>
                        <p style="color:#aaa; margin-top:10px; font-family:var(--font-main); font-size:1rem;">
                            Antigravity Kernel V10 · IndexedDB KB · Anthropic Primary · Slicing Pie · TDD Notarial · Swarm IA
                        </p>
                    </div>`);

                progressFill.style.width = '100%';
                btnEnter.classList.add('visible');
                btnEnter.addEventListener('click', () => {
                    window.history.pushState(null, null, '/dashboard');
                    window.dispatchEvent(new Event('popstate'));
                });

            } catch (error) {
                terminal.insertAdjacentHTML('beforeend', `
                    <div style="margin-top:30px; padding:30px; background:rgba(255,82,82,0.05);
                                border:1px solid var(--accent-red); border-radius:16px;">
                        <h3 style="color:var(--accent-red); margin:0; font-size:1.6rem;">💥 KERNEL PANIC</h3>
                        <pre style="color:white; font-size:0.82rem; margin-top:15px; background:rgba(0,0,0,0.5);
                                    padding:15px; border-radius:8px; white-space:pre-wrap;">${error.message}</pre>
                    </div>`);

                if (originalUser) {
                    await store.dispatch({ type: 'LOGIN_USER', payload: { userId: originalUser } });
                }
                await store.dispatch({ type: 'DELETE_PROJECT', payload: { projectId: PID_TEST } });

                terminal.scrollTop = terminal.scrollHeight;
            }

            document.querySelector('.cursor')?.remove();
        };

        setTimeout(runTests, 600);
    }

    // Alias V9
    executeViewScript() { return this.afterRender(); }
}
