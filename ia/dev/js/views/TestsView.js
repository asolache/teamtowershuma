// =============================================================================
// TEAMTOWERS SOS V10.1 — TESTS VIEW
// Ruta: /ia/dev/js/views/TestsView.js
// Vista integrada en el router SOS para ejecutar el test suite V10.1.
// Ruta SPA: /tests
//
// Ejecuta todos los tests del suite V10.1 y muestra:
//   - Barra de progreso global
//   - Resultados agrupados por suite
//   - Estado de cada módulo nuevo (RED / GREEN / SKIP)
//   - Plan de implementación con prioridades
// =============================================================================

export default class TestsView {

    async getHtml() {
        return `
        <style>
            .tv-wrap { max-width: 860px; margin: 0 auto; padding: 24px 16px; font-family: var(--font-sans, sans-serif); }
            .tv-header { margin-bottom: 24px; }
            .tv-title { font-size: 1.2rem; font-weight: 500; color: var(--color-text-primary, #fff); margin: 0 0 4px; }
            .tv-sub   { font-size: 0.75rem; color: var(--color-text-secondary, #888); font-family: var(--font-mono, monospace); }

            .tv-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .tv-metric  { background: var(--color-background-secondary, rgba(255,255,255,0.05)); border: 0.5px solid var(--color-border-tertiary, rgba(255,255,255,0.08)); border-radius: 10px; padding: 12px; text-align: center; }
            .tv-metric-val { font-size: 1.5rem; font-weight: 500; font-family: var(--font-mono, monospace); }
            .tv-metric-lbl { font-size: 0.68rem; color: var(--color-text-secondary, #888); text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px; }
            .tv-green { color: var(--color-text-success, #00e676); }
            .tv-red   { color: var(--color-text-danger,  #ff5252); }
            .tv-gray  { color: var(--color-text-secondary, #888); }

            .tv-progress-bar { height: 4px; background: var(--color-border-tertiary, rgba(255,255,255,0.08)); border-radius: 2px; margin-bottom: 20px; overflow: hidden; }
            .tv-progress-fill { height: 100%; background: var(--color-text-success, #00e676); border-radius: 2px; transition: width 0.5s ease; }

            .tv-suite  { margin-bottom: 14px; border: 0.5px solid var(--color-border-tertiary, rgba(255,255,255,0.08)); border-radius: 10px; overflow: hidden; }
            .tv-suite-header { padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; background: var(--color-background-secondary, rgba(255,255,255,0.03)); cursor: pointer; }
            .tv-suite-name { font-size: 0.82rem; font-weight: 500; color: var(--color-text-primary, #fff); }
            .tv-suite-badge { font-size: 0.68rem; padding: 2px 8px; border-radius: 8px; font-weight: bold; }
            .badge-green { background: rgba(0,230,118,0.12); color: #00e676; border: 0.5px solid rgba(0,230,118,0.3); }
            .badge-red   { background: rgba(255,82,82,0.12);  color: #ff5252; border: 0.5px solid rgba(255,82,82,0.3);  }
            .badge-gray  { background: rgba(128,128,128,0.1); color: #888;    border: 0.5px solid rgba(128,128,128,0.2); }
            .badge-orange{ background: rgba(255,171,64,0.12); color: #ffab40; border: 0.5px solid rgba(255,171,64,0.3); }

            .tv-tests  { padding: 8px 0; }
            .tv-test   { display: flex; align-items: flex-start; gap: 8px; padding: 5px 14px; font-size: 0.76rem; }
            .tv-test-icon { flex-shrink: 0; margin-top: 1px; font-size: 0.72rem; width: 14px; text-align: center; }
            .tv-test-name { color: var(--color-text-secondary, #aaa); flex: 1; line-height: 1.4; }
            .tv-test-err  { color: var(--color-text-danger, #ff5252); font-size: 0.68rem; font-family: var(--font-mono, monospace); margin-top: 2px; line-height: 1.4; }

            .tv-plan   { margin-top: 24px; }
            .tv-plan-title { font-size: 0.8rem; font-weight: 500; color: var(--color-text-primary, #fff); margin-bottom: 12px; }
            .tv-sprint { margin-bottom: 10px; border: 0.5px solid var(--color-border-tertiary, rgba(255,255,255,0.08)); border-radius: 10px; padding: 12px 14px; }
            .tv-sprint-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
            .tv-sprint-name { font-size: 0.8rem; font-weight: 500; color: var(--color-text-primary, #fff); }
            .tv-sprint-items { display: flex; flex-direction: column; gap: 4px; }
            .tv-sprint-item { display: flex; align-items: center; gap: 6px; font-size: 0.73rem; color: var(--color-text-secondary, #aaa); }
            .tv-sprint-item.done  { color: var(--color-text-success, #00e676); }
            .tv-sprint-item.todo  { color: var(--color-text-secondary, #888); }
            .tv-sprint-item.fail  { color: var(--color-text-danger, #ff5252); }
            .tv-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
            .dot-green { background: #00e676; }
            .dot-red   { background: #ff5252; }
            .dot-gray  { background: #555; }

            .tv-run-btn { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.5); color: #818cf8; padding: 9px 20px; border-radius: 8px; cursor: pointer; font-size: 0.82rem; font-weight: 500; transition: 0.2s; }
            .tv-run-btn:hover { background: rgba(99,102,241,0.3); }
            .tv-run-btn:disabled { opacity: 0.4; cursor: not-allowed; }
            .tv-spinner { display: inline-block; width: 11px; height: 11px; border: 1.5px solid rgba(255,255,255,0.2); border-top-color: #818cf8; border-radius: 50%; animation: tv-spin 0.7s linear infinite; vertical-align: middle; margin-right: 4px; }
            @keyframes tv-spin { to { transform: rotate(360deg); } }
        </style>

        <div class="tv-wrap">
            <div class="tv-header">
                <div class="tv-title">SOS V10.1 — Test Suite</div>
                <div class="tv-sub">TDD · Value Flow Sequence + Quality Loop · ${new Date().toLocaleDateString('es')}</div>
            </div>

            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                <button class="tv-run-btn" id="tv-run-btn" onclick="runTests()">Ejecutar todos los tests</button>
                <span id="tv-status" style="font-size:0.75rem;color:var(--color-text-secondary,#888);">Listo para ejecutar</span>
            </div>

            <div id="tv-summary" style="display:none;">
                <div class="tv-summary" id="tv-metrics"></div>
                <div class="tv-progress-bar"><div class="tv-progress-fill" id="tv-progress" style="width:0%"></div></div>
            </div>

            <div id="tv-results"></div>

            <div class="tv-plan">
                <div class="tv-plan-title">Plan de implementación V10.1 — estado actual</div>
                <div id="tv-plan-content">
                    ${TestsView._renderPlanStatic()}
                </div>
            </div>
        </div>`;
    }

    async afterRender() {
        // Auto-run en modo dev
        if (window.location.search.includes('autorun')) {
            setTimeout(() => window.runTests?.(), 300);
        }
    }

    static _renderPlanStatic() {
        const sprints = [
            {
                id: 'S1', name: 'Sprint 1 — VnaSequencer + WoGenerator V10.1',
                priority: 'high', impact: 'El Orquestador puede ejecutar WOs en orden correcto',
                items: [
                    { file: 'core/VnaSequencer.js',   desc: 'Topological sort, sequence_order, depends_on, detectCycles()' },
                    { file: 'core/WoGenerator.js',    desc: 'Heredar sequence_order, nextExecutable(), execution_layers en summary()' },
                    { file: 'core/QueenSwarm.js',     desc: 'Usar VnaSequencer antes de fromVnaNetwork() en el paso 4' },
                ]
            },
            {
                id: 'S2', name: 'Sprint 2 — ArtifactEngine + VnaMapRenderer',
                priority: 'high', impact: 'Artefactos persistidos y visualizables en cualquier vista SOS',
                items: [
                    { file: 'core/ArtifactEngine.js',         desc: 'persist(), getByProject(), getRenderable(), TYPES, ARTIFACT_CREATED' },
                    { file: 'components/VnaMapRenderer.js',   desc: 'render(vna, opts), buildLayout(), toArtifact(), showSequence badges' },
                    { file: 'store.js',                       desc: 'Añadir reducer ARTIFACT_CREATED' },
                ]
            },
            {
                id: 'S3', name: 'Sprint 3 — QueenAudit + PrimerEngine',
                priority: 'medium', impact: 'Ciclo de mejora continua + memoria entre sesiones',
                items: [
                    { file: 'core/QueenAudit.js',    desc: 'analyze(), proposeFixes(), applyFixes() — post CONSOLIDATE_WORK_ORDER' },
                    { file: 'core/PrimerEngine.js',  desc: 'save(), load(), buildContext() — session_summary nodes en KB' },
                    { file: 'core/WoAutoCloser.js',  desc: 'Disparar QueenAudit.analyze() después de _consolidate()' },
                ]
            },
            {
                id: 'S4', name: 'Sprint 4 — GateEngine + integración completa',
                priority: 'medium', impact: '0 violaciones del Codex en runtime + testing continuo',
                items: [
                    { file: 'core/GateEngine.js',    desc: 'check(), wrap(), promote(), DEFAULT_GATES del Codex SOS V10' },
                    { file: 'core/store.js',         desc: 'Wrapear dispatch() con GateEngine.wrap() en init()' },
                    { file: 'views/TestsView.js',    desc: 'Integrar suite de tests en /tests — este fichero' },
                ]
            },
        ];

        return sprints.map(s => `
            <div class="tv-sprint">
                <div class="tv-sprint-header">
                    <span class="tv-sprint-name">${s.id}: ${s.name}</span>
                    <span class="tv-suite-badge badge-orange">${s.priority}</span>
                </div>
                <div style="font-size:0.7rem;color:var(--color-text-secondary,#888);margin-bottom:7px;">${s.impact}</div>
                <div class="tv-sprint-items">
                    ${s.items.map(item => `
                    <div class="tv-sprint-item todo">
                        <div class="tv-dot dot-gray"></div>
                        <code style="font-size:0.7rem;color:inherit;">${item.file}</code>
                        <span style="color:var(--color-text-tertiary,#555);font-size:0.68rem;">— ${item.desc}</span>
                    </div>`).join('')}
                </div>
            </div>`).join('');
    }
}

// ── Global test runner (accesible desde el HTML) ──────────────────────────────

window.runTests = async function() {
    const btn    = document.getElementById('tv-run-btn');
    const status = document.getElementById('tv-status');
    const results = document.getElementById('tv-results');
    const summary = document.getElementById('tv-summary');

    btn.disabled = true;
    btn.innerHTML = '<span class="tv-spinner"></span>Ejecutando…';
    status.textContent = 'Cargando módulos…';
    results.innerHTML  = '';
    summary.style.display = 'block';

    let suiteResults = [];

    try {
        // Importar runner y suites — rutas relativas a js/views/ → js/tests/
        const { TestRunner } = await import('../tests/helpers.js');
        const { ALL_SUITES } = await import('../tests/sos_v10_1.test.js');
        const runner = new TestRunner();

        status.textContent = 'Ejecutando tests…';

        // Ejecutar cada suite y actualizar UI progresivamente
        for (const suite of ALL_SUITES) {
            try {
                await suite(runner);
            } catch(e) {
                console.error('[TestsView] Suite error:', e);
            }
        }

        // Resolver async tests
        const pending = runner.results.filter(r => r.passed === 'pending');
        for (const p of pending) {
            try { await p.promise; p.passed = true; } catch(e) { p.passed = false; p.error = e.message; }
            delete p.promise;
        }

        const sum = runner.summary();
        suiteResults = sum.results;

        // Métricas globales
        document.getElementById('tv-metrics').innerHTML = `
            <div class="tv-metric"><div class="tv-metric-val">${sum.total}</div><div class="tv-metric-lbl">Total tests</div></div>
            <div class="tv-metric"><div class="tv-metric-val tv-green">${sum.passed}</div><div class="tv-metric-lbl">Passed</div></div>
            <div class="tv-metric"><div class="tv-metric-val tv-red">${sum.failed}</div><div class="tv-metric-lbl">Failed</div></div>
            <div class="tv-metric"><div class="tv-metric-val ${sum.pct === 100 ? 'tv-green' : sum.pct >= 60 ? '' : 'tv-red'}">${sum.pct}%</div><div class="tv-metric-lbl">Pass rate</div></div>`;
        document.getElementById('tv-progress').style.width = sum.pct + '%';
        document.getElementById('tv-progress').style.background = sum.pct === 100 ? '#00e676' : sum.pct >= 60 ? '#ffab40' : '#ff5252';

        // Agrupar por suite
        const bySuite = {};
        sum.results.forEach(r => {
            if (!bySuite[r.suite]) bySuite[r.suite] = [];
            bySuite[r.suite].push(r);
        });

        results.innerHTML = Object.entries(bySuite).map(([suite, tests]) => {
            const suitePassed = tests.filter(t => t.passed).length;
            const suiteTotal  = tests.length;
            const allGreen    = suitePassed === suiteTotal;
            const allRed      = suitePassed === 0;
            const badgeClass  = allGreen ? 'badge-green' : allRed ? 'badge-red' : 'badge-orange';
            const badgeText   = allGreen ? 'PASS' : allRed ? 'FAIL' : `${suitePassed}/${suiteTotal}`;

            return `
            <div class="tv-suite">
                <div class="tv-suite-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
                    <span class="tv-suite-name">${suite}</span>
                    <span class="tv-suite-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="tv-tests" style="display:${allGreen ? 'none' : 'block'}">
                    ${tests.map(t => `
                    <div class="tv-test">
                        <span class="tv-test-icon">${t.passed ? '✓' : '✗'}</span>
                        <div>
                            <div class="tv-test-name" style="color:${t.passed ? 'var(--color-text-secondary,#aaa)' : 'var(--color-text-primary,#fff)'}">${t.name}</div>
                            ${t.error ? `<div class="tv-test-err">${t.error}</div>` : ''}
                        </div>
                    </div>`).join('')}
                </div>
            </div>`;
        }).join('');

        status.textContent = `${sum.passed}/${sum.total} tests pasados (${sum.pct}%)`;

        // Actualizar plan con estado real
        _updatePlanWithResults(sum.results);

    } catch(e) {
        status.textContent = 'Error cargando test suite: ' + e.message;
        results.innerHTML = `<div style="color:var(--color-text-danger,#ff5252);font-size:0.82rem;padding:12px;border:0.5px solid rgba(255,82,82,0.3);border-radius:8px;">${e.message}</div>`;
        console.error('[TestsView]', e);
    }

    btn.disabled = false;
    btn.innerHTML = 'Volver a ejecutar';
};

function _updatePlanWithResults(results) {
    const plan = document.getElementById('tv-plan-content');
    if (!plan) return;
    // Marcar sprints como done/fail según si sus módulos tienen tests que pasan
    const moduleStatus = {
        'VnaSequencer':   results.filter(r => r.suite.includes('VnaSequencer')).every(r => r.passed),
        'WoGenerator':    results.filter(r => r.suite.includes('WoGenerator')).every(r => r.passed),
        'ArtifactEngine': results.filter(r => r.suite.includes('ArtifactEngine')).every(r => r.passed),
        'QueenAudit':     results.filter(r => r.suite.includes('QueenAudit')).every(r => r.passed),
        'PrimerEngine':   results.filter(r => r.suite.includes('PrimerEngine')).every(r => r.passed),
        'GateEngine':     results.filter(r => r.suite.includes('GateEngine')).every(r => r.passed),
        'VnaMapRenderer': results.filter(r => r.suite.includes('ValueMapView') || r.suite.includes('VnaMapRenderer')).every(r => r.passed),
    };
    plan.querySelectorAll('.tv-sprint-item').forEach(item => {
        const code = item.querySelector('code');
        if (!code) return;
        const file = code.textContent;
        const key  = Object.keys(moduleStatus).find(k => file.includes(k));
        if (!key) return;
        if (moduleStatus[key]) {
            item.classList.remove('todo','fail'); item.classList.add('done');
            item.querySelector('.tv-dot').className = 'tv-dot dot-green';
        } else {
            item.classList.remove('todo','done'); item.classList.add('fail');
            item.querySelector('.tv-dot').className = 'tv-dot dot-red';
        }
    });
}
