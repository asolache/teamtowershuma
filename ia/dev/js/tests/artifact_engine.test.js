// =============================================================================
// SOS V10.1 — ArtifactEngine TESTS
// Ruta: /ia/dev/tests/artifact_engine.test.js
//
// ArtifactEngine es el módulo NUEVO que:
//   - Persiste artefactos generados por agentes en KB como artifact_nodes
//   - Tipos soportados: landing | vna_viz | chart | html | skill | media | content
//   - Cada nodo es visualizable desde ValueMapView / cualquier vista SOS
//   - dispatch ARTIFACT_CREATED al store con metadata
//   - getByProject(projectId) devuelve todos los artefactos del proyecto
//   - getRenderable(artifactId) devuelve el nodo con contentUrl o contentInline
// =============================================================================

import { assert, assertEqual, assertAllHave, assertType,
         assertRange, createMockStore, createMockKB } from './helpers.js';

export async function ArtifactEngineTests(runner) {

    let ArtifactEngine;
    try {
        ArtifactEngine = (await import('../core/ArtifactEngine.js')).ArtifactEngine;
    } catch(_) {
        ArtifactEngine = null;
    }

    runner.describe('ArtifactEngine — módulo existe', () => {
        runner.it('ArtifactEngine importable', () => {
            assert(ArtifactEngine !== null,
                'ArtifactEngine.js no existe en /ia/dev/core/. Crear el módulo.');
        });

        runner.it('métodos estáticos requeridos existen', () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const required = ['persist', 'getByProject', 'getRenderable', 'TYPES'];
            required.forEach(m => {
                assert(ArtifactEngine[m] !== undefined,
                    `ArtifactEngine.${m} debe existir como método o propiedad estática`);
            });
        });

        runner.it('TYPES contiene todos los tipos V10.1', () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const expected = ['landing', 'vna_viz', 'chart', 'html', 'skill', 'media', 'content'];
            expected.forEach(t => {
                assert(ArtifactEngine.TYPES[t] !== undefined || Object.values(ArtifactEngine.TYPES).includes(t),
                    `ArtifactEngine.TYPES debe incluir '${t}'`);
            });
        });
    });

    runner.describe('ArtifactEngine.persist() — schema del nodo', () => {
        runner.it('persist() devuelve artifact_node con id único', async () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const kb    = createMockKB();
            const store = createMockStore({ projects: [{ id: 'proj-test', nombre: 'Test', artifacts: [] }] });

            const node = await ArtifactEngine.persist({
                type:      'landing',
                content:   { headline: 'Aprende diseño', subheadline: 'Con IA' },
                projectId: 'proj-test',
                agentId:   '@agent_codex_developer',
                title:     'Landing MVP'
            }, { kb, store });

            assert(node.id && node.id.length > 0,
                'artifact_node debe tener id no vacío');
            assert(node.id.startsWith('artifact_') || node.type === 'artifact_node',
                `artifact_node.id debe empezar con 'artifact_' o tener type='artifact_node', got id='${node.id}', type='${node.type}'`);
        });

        runner.it('persist() guarda el nodo en KB', async () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const kb    = createMockKB();
            const store = createMockStore({ projects: [{ id: 'proj-test', nombre: 'Test', artifacts: [] }] });

            const node = await ArtifactEngine.persist({
                type: 'skill', content: '---\nname: test-skill\n---\n# Test', projectId: 'proj-test', agentId: '@agent_skill_crafter', title: 'Test Skill'
            }, { kb, store });

            const fromKb = await kb.getNode(node.id);
            assert(fromKb !== null, 'El nodo debe estar guardado en KB después de persist()');
            assertEqual(fromKb.id, node.id, 'El nodo en KB debe tener el mismo id');
        });

        runner.it('persist() dispara ARTIFACT_CREATED en store', async () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const kb    = createMockKB();
            const store = createMockStore({ projects: [{ id: 'proj-test', nombre: 'Test', artifacts: [] }] });

            await ArtifactEngine.persist({
                type: 'html', content: '<h1>Hello</h1>', projectId: 'proj-test', agentId: '@agent_web_deployer', title: 'Test HTML'
            }, { kb, store });

            const actions = store.dispatched();
            assert(actions.some(a => a.type === 'ARTIFACT_CREATED'),
                'persist() debe disparar ARTIFACT_CREATED al store');
        });

        runner.it('schema obligatorio del artifact_node', async () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const kb    = createMockKB();
            const store = createMockStore({ projects: [{ id: 'p1', artifacts: [] }] });

            const node = await ArtifactEngine.persist({
                type: 'chart', content: { labels: ['A','B'], data: [1,2] }, projectId: 'p1', agentId: '@agent_token_economist', title: 'Revenue Chart'
            }, { kb, store });

            const required = ['id', 'type', 'artifactType', 'title', 'content', 'projectId', 'agentId', 'renderable', 'createdAt'];
            required.forEach(f => {
                assert(node[f] !== undefined && node[f] !== null,
                    `artifact_node debe tener campo '${f}', got: ${JSON.stringify(node[f])}`);
            });
        });

        runner.it('renderable=true para todos los tipos excepto skill-draft', async () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const kb    = createMockKB();
            const store = createMockStore({ projects: [{ id: 'p1', artifacts: [] }] });

            for (const type of ['landing', 'vna_viz', 'chart', 'html', 'media', 'content']) {
                const node = await ArtifactEngine.persist({
                    type, content: 'test content', projectId: 'p1', agentId: '@test', title: `Test ${type}`
                }, { kb, store });
                assertEqual(node.renderable, true,
                    `artifact_node de tipo '${type}' debe tener renderable=true`);
            }
        });

        runner.it('persist() rechaza type inválido', async () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const kb    = createMockKB();
            const store = createMockStore({ projects: [{ id: 'p1', artifacts: [] }] });
            let threw = false;
            try {
                await ArtifactEngine.persist({ type: 'unknown_type_xyz', content: 'x', projectId: 'p1', agentId: '@x', title: 'X' }, { kb, store });
            } catch(_) { threw = true; }
            assert(threw, 'persist() debe lanzar error con type inválido');
        });

        runner.it('persist() rechaza content vacío', async () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const kb    = createMockKB();
            const store = createMockStore({ projects: [{ id: 'p1', artifacts: [] }] });
            let threw = false;
            try {
                await ArtifactEngine.persist({ type: 'html', content: null, projectId: 'p1', agentId: '@x', title: 'X' }, { kb, store });
            } catch(_) { threw = true; }
            assert(threw, 'persist() debe rechazar content=null');
        });
    });

    runner.describe('ArtifactEngine.getByProject()', () => {
        runner.it('getByProject() devuelve todos los artefactos del proyecto', async () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const kb    = createMockKB();
            const store = createMockStore({ projects: [{ id: 'proj-A', artifacts: [] }, { id: 'proj-B', artifacts: [] }] });

            await ArtifactEngine.persist({ type: 'landing', content: { h: 'H1' }, projectId: 'proj-A', agentId: '@x', title: 'L1' }, { kb, store });
            await ArtifactEngine.persist({ type: 'chart',   content: { d: [1] }, projectId: 'proj-A', agentId: '@x', title: 'C1' }, { kb, store });
            await ArtifactEngine.persist({ type: 'html',    content: '<p>',       projectId: 'proj-B', agentId: '@x', title: 'H1' }, { kb, store });

            const projA = await ArtifactEngine.getByProject('proj-A', { kb });
            assertEqual(projA.length, 2, `getByProject('proj-A') debe devolver 2 artefactos, devolvió ${projA.length}`);

            const projB = await ArtifactEngine.getByProject('proj-B', { kb });
            assertEqual(projB.length, 1, `getByProject('proj-B') debe devolver 1 artefacto, devolvió ${projB.length}`);
        });

        runner.it('getByProject() ordena por createdAt descendente', async () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const kb    = createMockKB();
            const store = createMockStore({ projects: [{ id: 'p1', artifacts: [] }] });

            await ArtifactEngine.persist({ type: 'html',    content: 'a', projectId: 'p1', agentId: '@x', title: 'A' }, { kb, store });
            await new Promise(r => setTimeout(r, 5));
            await ArtifactEngine.persist({ type: 'landing', content: {}, projectId: 'p1', agentId: '@x', title: 'B' }, { kb, store });

            const list = await ArtifactEngine.getByProject('p1', { kb });
            assert(list[0].createdAt >= list[1].createdAt,
                'getByProject() debe ordenar por createdAt descendente (más reciente primero)');
        });

        runner.it('getByProject() devuelve array vacío si no hay artefactos', async () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const kb    = createMockKB();
            const store = createMockStore({ projects: [{ id: 'empty-proj', artifacts: [] }] });
            const list  = await ArtifactEngine.getByProject('empty-proj', { kb });
            assert(Array.isArray(list), 'Debe devolver Array');
            assertEqual(list.length, 0, 'Proyecto sin artefactos debe devolver array vacío');
        });
    });

    runner.describe('ArtifactEngine.getRenderable()', () => {
        runner.it('getRenderable() devuelve nodo con renderConfig según type', async () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const kb    = createMockKB();
            const store = createMockStore({ projects: [{ id: 'p1', artifacts: [] }] });

            const node = await ArtifactEngine.persist({ type: 'landing', content: { headline: 'H', cta_primary: 'Start' }, projectId: 'p1', agentId: '@x', title: 'L' }, { kb, store });
            const renderable = await ArtifactEngine.getRenderable(node.id, { kb });

            assert(renderable !== null, 'getRenderable() debe devolver el nodo');
            assert(renderable.renderConfig !== undefined,
                'getRenderable() debe añadir renderConfig al nodo');
            assert(renderable.renderConfig.component !== undefined,
                'renderConfig debe incluir el componente/vista para renderizar este tipo');
        });

        runner.it('renderConfig.component correcto por tipo', async () => {
            assert(ArtifactEngine, 'ArtifactEngine no importado');
            const kb    = createMockKB();
            const store = createMockStore({ projects: [{ id: 'p1', artifacts: [] }] });
            const cases = [
                { type: 'landing',  expectedComponent: 'LandingCard' },
                { type: 'html',     expectedComponent: 'HtmlSandbox' },
                { type: 'chart',    expectedComponent: 'ChartRenderer' },
                { type: 'vna_viz',  expectedComponent: 'VnaMapRenderer' },
                { type: 'content',  expectedComponent: 'ContentCard' },
            ];
            for (const { type, expectedComponent } of cases) {
                const node = await ArtifactEngine.persist({ type, content: type === 'chart' ? { d: [] } : '<p>test</p>', projectId: 'p1', agentId: '@x', title: type }, { kb, store });
                const r    = await ArtifactEngine.getRenderable(node.id, { kb });
                assertEqual(r.renderConfig.component, expectedComponent,
                    `Tipo '${type}' debe tener renderConfig.component='${expectedComponent}', got: '${r.renderConfig.component}'`);
            }
        });
    });
}
