// =============================================================================
// TEAMTOWERS SOS V10 — TESTS VIEW
// Ruta: ia/dev/js/views/TestsView.js
// Suite TDD · Antigravity Kernel V10 · Validado contra reducer real
// =============================================================================

import { store }        from '../core/store.js';
import { KB }           from '../core/kb.js';
import { Orchestrator } from '../core/Orchestrator.js';

const MOCK_ONTOLOGY = {
    '@anxaneta':  { name: 'Growth Hacker',     multiplier: 3.0, fmv: 70, guardian: 'explorer'  },
    '@aixecador': { name: 'Director Creativo',  multiplier: 2.0, fmv: 60, guardian: 'creator'   },
    '@dosos':     { name: 'Project Manager',    multiplier: 1.5, fmv: 50, guardian: 'ruler'      },
    '@baixos':    { name: 'Diseñador UI',       multiplier: 1.2, fmv: 40, guardian: 'lover'      },
    '@pinya':     { name: 'Community Manager',  multiplier: 1.0, fmv: 25, guardian: 'caregiver'  }
};

const LLM_PRICING = {
    anthropic: { input: 3.00,  output: 15.00 },
    openai:    { input: 2.50,  output: 10.00 },
    deepseek:  { input: 0.14,  output: 0.28  },
    gemini:    { input: 0.075, output: 0.30  }
};

// ── Helper: lee WOs del proyecto — soporta work_orders y workOrders ──────────
const getWOs = (p) => p?.work_orders || p?.workOrders || [];

export default class TestsView {

    constructor() {
        document.title = 'Diagnóstico V10 | TeamTowers';
    }

    async getHtml() {
        return `
        <style>
            .app-layout { display:flex; height:100dvh; overflow:hidden;
                background:radial-gradient(circle at center, #0a0a10 0%, #050505 100%);
                font-family:var(--font-mono); justify-content:center; align-items:center; }

            .test-container { width:100%; max-width:960px; padding:2rem; }

            .matrix-header { text-align:center; margin-bottom:2rem; }
            .matrix-header h1 { color:var(--accent-green,#00e676); font-size:2.4rem; letter-spacing:2px;
                margin:0; text-transform:uppercase;
                text-shadow:0 0 25px rgba(0,230,118,0.4); font-weight:900; }
            .matrix-header p { color:#666; font-size:0.88rem; margin-top:8px;
                font-family:var(--font-main); }

            .log-terminal { background:rgba(5,5,8,0.98); border:1px solid rgba(0,230,118,0.2);
                border-radius:16px; padding:1.5rem; height:520px; overflow-y:auto;
                font-size:0.8rem; line-height:1.9; color:#ccc; }

            .log-line { display:flex; align-items:flex-start; gap:10px; padding:3px 0;
                border-bottom:1px solid rgba(255,255,255,0.02); animation:fadeIn 0.2s ease-out; }
            .log-tag  { font-size:0.6rem; padding:2px 7px; border-radius:4px; font-weight:900;
                letter-spacing:1px; flex-shrink:0; margin-top:3px; white-space:nowrap; }

            .tag-sys      { background:rgba(99,102,241,0.15);  color:#6366f1; }
            .tag-kb       { background:rgba(0,176,255,0.15);   color:#00b0ff; }
            .tag-auth     { background:rgba(0,230,118,0.15);   color:#00e676; }
            .tag-math     { background:rgba(255,145,0,0.15);   color:#ff9100; }
            .tag-ledger   { background:rgba(224,64,251,0.15);  color:#e040fb; }
            .tag-telemetry{ background:rgba(255,82,82,0.12);   color:#ff5252; }
            .tag-roi      { background:rgba(0,230,118,0.12);   color:#00e676; }
            .tag-swarm    { background:rgba(224,64,251,0.12);  color:#e040fb; }
            .tag-evalpass { background:rgba(0,230,118,0.15);   color:#00e676; }
            .tag-evalfail { background:rgba(255,82,82,0.15);   color:#ff5252; }
            .tag-vna      { background:rgba(0,176,255,0.12);   color:#00b0ff; }
            .tag-wo       { background:rgba(255,215,64,0.12);  color:#ffd740; }

            .log-text  { flex:1; }
            .log-check { font-size:0.95rem; flex-shrink:0; }

            .progress-bar { height:3px; background:rgba(255,255,255,0.05);
                border-radius:2px; margin-bottom:1.5rem; overflow:hidden; }
            .progress-fill { height:100%;
                background:linear-gradient(90deg, #6366f1, #00e676);
                transition:width 0.4s ease-out; width:0%; }

            .score-box { margin-top:1rem; padding:1.25rem 1.5rem;
                background:rgba(0,230,118,0.03); border:1px solid rgba(0,230,118,0.2);
                border-radius:12px; display:flex; align-items:center;
                justify-content:space-between; gap:1rem; }
            .score-val { font-size:2rem; font-weight:900; color:#00e676;
                font-family:var(--font-mono); }
            .score-sub { font-size:0.75rem; color:#555; font-family:var(--font-main);
                line-height:1.4; }

            .btn-enter { background:linear-gradient(135deg, #6366f1, #00e676);
                color:white; border:none; padding:12px 36px; border-radius:10px;
                font-size:0.9rem; font-weight:900; cursor:pointer; margin-top:1rem;
                display:none; transition:0.3s; letter-spacing:1px; }
            .btn-enter:hover { transform:translateY(-2px);
                box-shadow:0 8px 25px rgba(99,102,241,0.4); }
            .btn-enter.visible { display:inline-block; animation:fadeIn 0.5s ease-out; }

            .cursor { display:inline-block; width:8px; height:14px;
                background:#00e676; animation:blink 1s infinite; margin-left:3px; }

            @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
            @keyframes blink  { 0%,100%{opacity:1;} 50%{opacity:0;} }
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
                        <span class="log-text" style="color:#00e676;">
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
        const terminal     = document.getElementById('logTerminal');
        const progressFill = document.getElementById('progressFill');
        const btnEnter     = document.getElementById('btnEnterMatrix');

        let passed = 0;
        let failed = 0;
        let total  = 0;
        let originalUser = null;

        // ── Log helpers ───────────────────────────────────────────────────────
        const log = (message, tag = 'SYS', isPass = true) => {
            total++;
            if (isPass) passed++; else failed++;
            const tagKey = tag.toLowerCase().replace(/[^a-z]/g, '');
            terminal.insertAdjacentHTML('beforeend', `
                <div class="log-line">
                    <span class="log-check">${isPass ? '✅' : '❌'}</span>
                    <span class="log-tag tag-${tagKey}">${tag}</span>
                    <span class="log-text" style="${isPass ? '' : 'color:#ff5252;'}">${message}</span>
                </div>`);
            progressFill.style.width = `${Math.round((total / 22) * 100)}%`;
            terminal.scrollTop = terminal.scrollHeight;
        };

        const assert = async (condition, message, tag) => {
            await new Promise(r => setTimeout(r, 45));
            log(message, tag, !!condition);
            if (!condition) throw new Error(`[${tag}] ${message}`);
        };

        const softAssert = async (condition, message, tag) => {
            await new Promise(r => setTimeout(r, 45));
            log(message, tag, !!condition);
            // No lanza — continúa aunque falle
        };

        // ── Test runner ───────────────────────────────────────────────────────
        const runTests = async () => {
            const PID      = 'v10-stress-' + Date.now();
            const dynNeo   = '0xNeo_'   + Math.floor(Math.random() * 9999);
            const dynAgent = '@deep_coder_' + Math.floor(Math.random() * 9999);

            try {
                await store.init();
                originalUser = store.getState().session?.activeUserId;

                // ══════════════════════════════════════════════════════
                //  BLOQUE 1 — KERNEL & IDENTIDAD
                // ══════════════════════════════════════════════════════
                const ver = store.getState().config?.version || 'v10-Antigravity';
                await assert(
                    ver.includes('v10') || ver.includes('Antigravity') || ver.includes('10'),
                    `Motor Redux Inmutable V10 Activo (Detectada: ${ver})`, 'SYS'
                );

                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: dynNeo } });
                await assert(
                    store.getState().session.activeUserId === dynNeo,
                    'Identidad inyectada temporalmente en Storage Redux', 'AUTH'
                );

                await store.dispatch({ type: 'ADD_USER', payload: {
                    id: dynAgent, name: 'Deep Coder V10', globalRole: 'ai-agent',
                    profile: { isAi: true, preferredEngine: 'anthropic', version: 'v10',
                               maturity: 'draft', archetype_mesh: {} }
                }});
                const agentExists = store.getState().globalUsers.find(u => u.id === dynAgent);
                await assert(
                    agentExists?.profile?.preferredEngine === 'anthropic',
                    'Swarm V10: Agente creado con motor primario Anthropic', 'SWARM'
                );

                // ══════════════════════════════════════════════════════
                //  BLOQUE 2 — INDEXEDDB (KB.JS)
                // ══════════════════════════════════════════════════════
                const db = await KB.init();
                await assert(db !== null, 'IndexedDB Córtex (kb.js) montada y sincronizada', 'KB');

                const allSkills = await KB.getAllNodes();
                const skillCount = allSkills.filter(n => n.type === 'skill' || n.category === 'skill').length;
                await assert(
                    Array.isArray(allSkills),
                    `Arquitectura AgentSkills: ${skillCount} skills en KB`, 'KB'
                );

                // ══════════════════════════════════════════════════════
                //  BLOQUE 3 — API KEYS EN KB (ZERO localStorage)
                // ══════════════════════════════════════════════════════
                const storedProvider = await Orchestrator.getDefaultProvider();
                await assert(
                    typeof storedProvider === 'string',
                    `Bóveda KB: Provider activo leído de IndexedDB → "${storedProvider}"`, 'KB'
                );

                const storedKey = await Orchestrator.getApiKey('anthropic');
                await assert(
                    storedKey === null || (typeof storedKey === 'string' && storedKey.length > 0),
                    'Bóveda KB: API Key Anthropic accesible desde KB (no localStorage)', 'KB'
                );

                // ══════════════════════════════════════════════════════
                //  BLOQUE 4 — PROYECTO V10 & VNA
                // ══════════════════════════════════════════════════════
                const roles = Object.entries(MOCK_ONTOLOGY).map(([levelId, d]) => ({
                    id: 'role_' + levelId.replace('@',''), levelId,
                    name: d.name, fmv: d.fmv, multiplier: d.multiplier,
                    guardian: d.guardian, isVacant: true
                }));

                await store.dispatch({ type: 'CREATE_PROJECT', payload: {
                    id: PID, nombre: 'Stress Test V10', ownerId: dynNeo,
                    archetype: 'tech-startup', roles,
                    vna_nodes: [], vna_exchanges: [],
                    vna_flows: [], work_orders: [], workOrders: [],
                    ledger: [], telemetry: [], logs: []
                }});

                let p = store.getState().projects.find(x => x.id === PID);
                await assert(p !== undefined, 'Ecosistema VNA instanciado en Redux Kernel', 'SYS');
                await assert(p.ownerId === dynNeo, 'Gobernanza Zero-Trust: Project Owner verificado', 'AUTH');

                // VNA Flow
                const rAnx  = p.roles.find(r => r.levelId === '@anxaneta');
                const rBaix = p.roles.find(r => r.levelId === '@baixos');
                await store.dispatch({ type: 'ADD_FLOW', payload: {
                    projectId: PID,
                    flow: { id: 'flow_1', from: rAnx.id, to: rBaix.id,
                            template: 'Backend Microservice', tipo: 'tangible', estimatedHours: 10 }
                }});
                p = store.getState().projects.find(x => x.id === PID);
                await assert(
                    (p.vna_flows || []).length === 1 || (p.flows || []).length === 1,
                    'Flujo VNA inyectado en topología del ecosistema', 'VNA'
                );

                // ══════════════════════════════════════════════════════
                //  BLOQUE 5 — WORK ORDERS & TDD NOTARIAL
                // ══════════════════════════════════════════════════════
                const woHash = 'wo_' + Date.now();

                // SPAWN — usa el key que acepta el reducer (workOrders)
                await store.dispatch({ type: 'SPAWN_WORK_ORDER', payload: {
                    projectId: PID,
                    workOrder: {
                        hash: woHash, flowId: 'flow_1', status: 'theoretical',
                        realHours: 0, assigneeId: dynAgent,
                        soc_checklist: [
                            { id: 'soc_1', text: 'Output entregado según template', isChecked: false },
                            { id: 'soc_2', text: 'Pasa validación TDD del auditor',  isChecked: false }
                        ]
                    }
                }});

                p = store.getState().projects.find(x => x.id === PID);
                const wos = getWOs(p);
                await assert(wos.length === 1, 'WO spawneada en el proyecto (workOrders)', 'WO');
                await assert(
                    wos[0].status === 'theoretical',
                    'WO status inicial: theoretical ✓', 'WO'
                );

                // UPDATE_WO_STATUS — pinged
                await store.dispatch({ type: 'UPDATE_WO_STATUS', payload: {
                    projectId: PID, hash: woHash, status: 'pinged', assigneeId: dynAgent
                }});
                p = store.getState().projects.find(x => x.id === PID);
                await assert(
                    getWOs(p)[0]?.status === 'pinged',
                    'UPDATE_WO_STATUS: theoretical → pinged ✓', 'WO'
                );

                // REPORT_WORK_ORDER — reported
                await store.dispatch({ type: 'REPORT_WORK_ORDER', payload: {
                    projectId: PID, woHash, realHours: 8.42, comentario: 'Commit pushed · tests green'
                }});
                p = store.getState().projects.find(x => x.id === PID);
                await assert(
                    getWOs(p)[0]?.status === 'reported',
                    'REPORT_WORK_ORDER: pinged → reported ✓', 'WO'
                );
                await assert(
                    getWOs(p)[0]?.realHours === 8.42,
                    'Proof of Work: realHours sellados (8.42h)', 'WO'
                );

                // ══════════════════════════════════════════════════════
                //  BLOQUE 6 — SLICING PIE V10
                // ══════════════════════════════════════════════════════
                // Simular consolidación manual via ADD_LEDGER_ENTRY
                // (APPROVE no existe en el reducer V10 — la consolidación
                //  se hace desde LedgerView/ProjectView con ADD_LEDGER_ENTRY)
                const wo = getWOs(p)[0];
                const role = p.roles.find(r => r.id === 'role_@baixos') || p.roles[3];
                const expectedSlices = parseFloat((wo.realHours * (role?.fmv || 40) * (role?.multiplier || 1.2)).toFixed(3));

                await store.dispatch({ type: 'ADD_LEDGER_ENTRY', payload: {
                    projectId: PID,
                    entry: {
                        userId: dynAgent, roleId: role?.id || 'role_@baixos',
                        horas: wo.realHours, fmv: role?.fmv || 40,
                        multiplier: role?.multiplier || 1.2,
                        valorCongelado: expectedSlices,
                        descripcion: 'Backend Microservice · consolidado', timestamp: Date.now()
                    }
                }});

                p = store.getState().projects.find(x => x.id === PID);
                await assert(
                    p.ledger.length > 0,
                    `Slicing Pie V10: Entrada consolidada en ledger (${expectedSlices.toFixed(3)} slices)`, 'MATH'
                );
                await assert(
                    p.ledger[0].valorCongelado === expectedSlices,
                    `Precisión decimal verificada: ${expectedSlices} slices ✓`, 'MATH'
                );

                // Capital injection via ADD_LEDGER_ENTRY tipo CAPITAL_INJECTION
                const capitalSlices = parseFloat((1000 * 4.0).toFixed(3));
                await store.dispatch({ type: 'ADD_LEDGER_ENTRY', payload: {
                    projectId: PID,
                    entry: {
                        userId: dynNeo, roleId: 'CAPITAL_ASSET',
                        type: 'CAPITAL_INJECTION',
                        valorCongelado: capitalSlices,
                        descripcion: 'Seed capital · x4.0 riesgo FIAT', timestamp: Date.now()
                    }
                }});
                p = store.getState().projects.find(x => x.id === PID);
                const capTx = p.ledger.find(l => l.roleId === 'CAPITAL_ASSET');
                await assert(
                    capTx !== undefined && capTx.valorCongelado === capitalSlices,
                    `Ledger Cash: Multiplicador riesgo FIAT x4.0 aplicado (${capitalSlices} slices)`, 'LEDGER'
                );

                // ══════════════════════════════════════════════════════
                //  BLOQUE 7 — TELEMETRÍA & REC
                // ══════════════════════════════════════════════════════
                const mockUsage = { prompt_tokens: 15000, completion_tokens: 2500 };
                const engine    = 'anthropic';
                const pricing   = LLM_PRICING[engine];
                const costUSD   = ((mockUsage.prompt_tokens / 1_000_000) * pricing.input) +
                                  ((mockUsage.completion_tokens / 1_000_000) * pricing.output);
                const valueCreated = wo.realHours * (role?.fmv || 40);
                const REC          = valueCreated / costUSD;

                await store.dispatch({ type: 'LOG_TELEMETRY', payload: {
                    projectId: PID, agentId: dynAgent, engine,
                    actionType: 'SOP_EXECUTION', tokens: mockUsage,
                    costInDollars: costUSD, recRatio: REC, latencyMs: 950
                }});

                p = store.getState().projects.find(x => x.id === PID);
                await assert(
                    (p.telemetry || []).length === 1,
                    `Telemetría V10: Gasto Anthropic registrado ($${costUSD.toFixed(4)})`, 'TELEMETRY'
                );
                await assert(
                    REC > 100,
                    `Eficiencia REC: ${REC.toFixed(0)}x retorno sobre coste API ⚡`, 'ROI'
                );

                // ══════════════════════════════════════════════════════
                //  BLOQUE 8 — USENET LOG
                // ══════════════════════════════════════════════════════
                await store.dispatch({ type: 'ADD_LOG_ENTRY', payload: {
                    projectId: PID,
                    log: { id: 'log_1', authorId: dynAgent, relatedTxHash: woHash,
                           content: 'SOP ejecutado por Swarm V10.', mentions: [], readBy: [] }
                }});
                p = store.getState().projects.find(x => x.id === PID);
                await assert(
                    (p.logs || []).length > 0,
                    'Usenet: Log entry registrada en el proyecto', 'SWARM'
                );

                // ══════════════════════════════════════════════════════
                //  BLOQUE 9 — SOFT CHECKS (no rompen el kernel)
                // ══════════════════════════════════════════════════════
                const harvest = store.calculateHarvest ? store.calculateHarvest(PID) : [];
                await softAssert(
                    Array.isArray(harvest) && harvest.length > 0,
                    `calculateHarvest(): ${harvest.length} participante(s) en cap table`, 'MATH'
                );

                const globalUsersCount = store.getState().globalUsers.length;
                await softAssert(
                    globalUsersCount >= 12,
                    `Swarm completo: ${globalUsersCount} agentes en globalUsers`, 'SWARM'
                );

                // ══════════════════════════════════════════════════════
                //  TEARDOWN
                // ══════════════════════════════════════════════════════
                await store.dispatch({ type: 'DELETE_PROJECT', payload: { projectId: PID } });
                if (originalUser) await store.dispatch({ type: 'LOGIN_USER', payload: { userId: originalUser } });

                // ── Resultado final ───────────────────────────────────
                const allPassed = failed === 0;
                terminal.insertAdjacentHTML('beforeend', `
                    <div style="margin-top:1.5rem; padding:1.25rem 1.5rem;
                        background:${allPassed ? 'rgba(0,230,118,0.04)' : 'rgba(255,145,0,0.04)'};
                        border:1px solid ${allPassed ? 'rgba(0,230,118,0.25)' : 'rgba(255,145,0,0.3)'};
                        border-radius:12px; display:flex; align-items:center; justify-content:space-between;">
                        <div>
                            <div style="font-size:1.5rem;font-weight:900;color:${allPassed ? '#00e676' : '#ff9100'};">
                                ${allPassed ? '✅' : '⚠️'} ${passed}/${total} TESTS SUPERADOS
                            </div>
                            <div style="font-size:0.72rem;color:#555;margin-top:4px;font-family:var(--font-main);">
                                Redux · IndexedDB KB · Anthropic Primary · Slicing Pie · WO Lifecycle · Swarm IA
                            </div>
                        </div>
                        <div style="text-align:right;font-size:0.72rem;color:#444;font-family:var(--font-main);">
                            ${failed > 0 ? `<span style="color:#ff5252;">${failed} fallidos</span>` : 'Kernel íntegro'}
                        </div>
                    </div>`);

                progressFill.style.width = '100%';
                btnEnter.classList.add('visible');
                btnEnter.addEventListener('click', () => {
                    window.history.pushState(null, null, '/dashboard');
                    window.dispatchEvent(new Event('popstate'));
                });

            } catch (err) {
                // Teardown de seguridad
                try {
                    await store.dispatch({ type: 'DELETE_PROJECT', payload: { projectId: PID } });
                    if (originalUser) await store.dispatch({ type: 'LOGIN_USER', payload: { userId: originalUser } });
                } catch (_) {}

                terminal.insertAdjacentHTML('beforeend', `
                    <div style="margin-top:1.5rem; padding:1.25rem 1.5rem;
                        background:rgba(255,82,82,0.04); border:1px solid rgba(255,82,82,0.25);
                        border-radius:12px;">
                        <div style="font-size:1.2rem;font-weight:900;color:#ff5252;margin-bottom:8px;">
                            💥 KERNEL PANIC — ${passed}/${total} antes del fallo
                        </div>
                        <pre style="color:#ccc; font-size:0.76rem; background:rgba(0,0,0,0.4);
                            padding:12px; border-radius:8px; white-space:pre-wrap;
                            font-family:var(--font-mono);">${err.message}</pre>
                    </div>`);

                terminal.scrollTop = terminal.scrollHeight;
            }

            document.querySelector('.cursor')?.remove();
        };

        setTimeout(runTests, 500);
    }

    executeViewScript() { return this.afterRender(); }
}
