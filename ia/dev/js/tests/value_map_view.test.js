// =============================================================================
// SOS V10.1 — VnaMapRenderer / ValueMapView TESTS
// Ruta: /ia/dev/tests/value_map_view.test.js
// Tests para VnaMapRenderer.js — renderizador universal de VNAs (Sprint 2)
// =============================================================================

import { assert, assertEqual, assertAllHave, sampleVnaNetwork } from './helpers.js';

export async function ValueMapViewTests(runner) {

    let VnaMapRenderer, VnaSequencer;
    try {
        VnaMapRenderer = (await import('../components/VnaMapRenderer.js')).VnaMapRenderer;
    } catch(_) { VnaMapRenderer = null; }
    try {
        VnaSequencer = (await import('../core/VnaSequencer.js')).VnaSequencer;
    } catch(_) { VnaSequencer = null; }

    runner.describe('VnaMapRenderer — módulo existe', () => {
        runner.it('VnaMapRenderer importable', () => {
            assert(VnaMapRenderer !== null,
                'VnaMapRenderer.js no existe en /ia/dev/components/. Crear el módulo. (Sprint 2)');
        });
        runner.it('métodos estáticos: render, fromKB, toArtifact, buildLayout', () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado');
            ['render', 'fromKB', 'toArtifact', 'buildLayout'].forEach(m => {
                assert(typeof VnaMapRenderer[m] === 'function',
                    `VnaMapRenderer.${m}() debe ser método estático`);
            });
        });
    });

    runner.describe('VnaMapRenderer.buildLayout()', () => {
        runner.it('buildLayout() genera posiciones x,y para cada nodo', () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado — Sprint 2 pendiente');
            const net    = sampleVnaNetwork();
            const layout = VnaMapRenderer.buildLayout(net, { width: 680 });
            assert(layout.nodes && Array.isArray(layout.nodes),
                'buildLayout() debe devolver { nodes: [] }');
            assertEqual(layout.nodes.length, net.nodes.length,
                'layout.nodes debe tener el mismo número de nodos que el VNA');
            layout.nodes.forEach((n, i) => {
                assert(typeof n.x === 'number' && typeof n.y === 'number',
                    `layout.nodes[${i}] debe tener x,y numéricos`);
                assert(n.x >= 0 && n.x <= 680,
                    `layout.nodes[${i}].x fuera del viewBox (${n.x})`);
                assert(n.y >= 0,
                    `layout.nodes[${i}].y no puede ser negativo (${n.y})`);
            });
        });

        runner.it('buildLayout() genera edges con coordenadas', () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado — Sprint 2 pendiente');
            const net    = sampleVnaNetwork();
            const layout = VnaMapRenderer.buildLayout(net, { width: 680 });
            assert(layout.edges && Array.isArray(layout.edges),
                'buildLayout() debe devolver { edges: [] }');
            layout.edges.forEach((e, i) => {
                ['x1', 'y1', 'x2', 'y2'].forEach(coord => {
                    assert(typeof e[coord] === 'number',
                        `edge[${i}] debe tener ${coord} numérico`);
                });
            });
        });

        runner.it('edges tienen sequence_order si el VNA está secuenciado', () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado — Sprint 2 pendiente');
            if (!VnaSequencer) return; // skip si VnaSequencer aún no existe
            const sequenced = VnaSequencer.sequence(sampleVnaNetwork());
            const layout    = VnaMapRenderer.buildLayout(sequenced, { width: 680 });
            layout.edges.forEach((e, i) => {
                assert(e.sequence_order !== undefined,
                    `edge[${i}] debe incluir sequence_order del exchange para mostrar badges numéricos`);
            });
        });
    });

    runner.describe('VnaMapRenderer.render()', () => {
        runner.it('render() devuelve string SVG válido', () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado — Sprint 2 pendiente');
            const svg = VnaMapRenderer.render(sampleVnaNetwork(), { width: 680 });
            assert(typeof svg === 'string', 'render() debe devolver string');
            assert(svg.trim().startsWith('<svg'),
                `render() debe devolver SVG válido (empieza con <svg), got: '${svg.substring(0,50)}'`);
        });

        runner.it('SVG contiene labels de los nodos del VNA', () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado — Sprint 2 pendiente');
            const net = sampleVnaNetwork();
            const svg = VnaMapRenderer.render(net, { width: 680 });
            net.nodes.forEach(n => {
                assert(svg.includes(n.label) || svg.includes(n.id),
                    `SVG debe incluir label o id del nodo '${n.label || n.id}'`);
            });
        });

        runner.it('SVG incluye badges de secuencia con showSequence=true', () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado — Sprint 2 pendiente');
            if (!VnaSequencer) return;
            const sequenced = VnaSequencer.sequence(sampleVnaNetwork());
            const svg       = VnaMapRenderer.render(sequenced, { width: 680, showSequence: true });
            assert(
                svg.includes('sequence') || svg.includes('seq-badge') || />[1-9]</.test(svg),
                'SVG con showSequence=true debe incluir números de secuencia visibles'
            );
        });

        runner.it('SVG diferencia tangibles e intangibles visualmente', () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado — Sprint 2 pendiente');
            const svg = VnaMapRenderer.render(sampleVnaNetwork(), { width: 680 });
            assert(
                svg.includes('dasharray') || svg.includes('intangible') || svg.includes('dashed'),
                'SVG debe diferenciar visualmente flujos tangibles (sólido) e intangibles (punteado)'
            );
        });

        runner.it('render() con VNA vacío no lanza error', () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado — Sprint 2 pendiente');
            const empty = { ...sampleVnaNetwork(), nodes: [], exchanges: [] };
            let error = null;
            try { VnaMapRenderer.render(empty, { width: 680 }); } catch(e) { error = e; }
            assert(error === null,
                `render() con VNA vacío no debe lanzar error: ${error?.message}`);
        });
    });

    runner.describe('VnaMapRenderer.toArtifact()', () => {
        runner.it('toArtifact() devuelve payload para ArtifactEngine.persist()', () => {
            assert(VnaMapRenderer, 'VnaMapRenderer no importado — Sprint 2 pendiente');
            const payload = VnaMapRenderer.toArtifact(sampleVnaNetwork(), 'p1');
            assertEqual(payload.type, 'vna_viz',
                'toArtifact().type debe ser vna_viz');
            assert(payload.content !== undefined,
                'toArtifact() debe incluir content');
            assertEqual(payload.projectId, 'p1',
                'toArtifact() debe incluir projectId');
            assert(payload.title && payload.title.length > 0,
                'toArtifact() debe incluir title no vacío');
        });
    });
}
