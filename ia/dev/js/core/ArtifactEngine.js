// =============================================================================
// TEAMTOWERS SOS V10.1 — ARTIFACT ENGINE
// Ruta: /ia/dev/js/core/ArtifactEngine.js
//
// Motor de persistencia de artefactos generados por agentes del Swarm.
// Cualquier agente puede persistir contenido como artifact_node en KB.
// El tipo determina cómo se renderiza en ValueMapView / cualquier vista SOS.
//
// Tipos soportados:
//   landing   → LandingCard    (headline, cta, pricing)
//   vna_viz   → VnaMapRenderer (VnaNetwork JSON-LD renderizado como SVG)
//   chart     → ChartRenderer  (Chart.js data object)
//   html      → HtmlSandbox    (HTML string seguro)
//   skill     → SkillCard      (SKILL.md content)
//   media     → MediaViewer    (URL o base64 de imagen/video)
//   content   → ContentCard    (texto, posts, narrativas)
//
// Inmutabilidad: ArtifactEngine nunca muta el store ni KB directamente
//   — siempre via dispatch() y kb.saveNode().
// =============================================================================

// ─── Mapa: tipo de artefacto → componente de renderizado ─────────────────────
const RENDER_COMPONENTS = {
    landing:  'LandingCard',
    vna_viz:  'VnaMapRenderer',
    chart:    'ChartRenderer',
    html:     'HtmlSandbox',
    skill:    'SkillCard',
    media:    'MediaViewer',
    content:  'ContentCard',
};

export class ArtifactEngine {

    // ── Tipos soportados (objeto para fácil lookup) ───────────────────────────
    static TYPES = {
        landing: 'landing',
        vna_viz: 'vna_viz',
        chart:   'chart',
        html:    'html',
        skill:   'skill',
        media:   'media',
        content: 'content',
    };

    // ══════════════════════════════════════════════════════════════════════════
    //  persist — guarda un artefacto en KB y dispara ARTIFACT_CREATED al store
    //
    //  Entrada:
    //    payload.type       string  — uno de ArtifactEngine.TYPES
    //    payload.content    any     — contenido del artefacto (no puede ser null)
    //    payload.projectId  string  — ID del proyecto al que pertenece
    //    payload.agentId    string  — agente que lo generó (@agent_...)
    //    payload.title      string  — título descriptivo
    //    payload.meta       object  — metadatos opcionales (versión, tags, etc.)
    //  deps:
    //    deps.kb    — instancia de KB (saveNode, getNode)
    //    deps.store — instancia de store (dispatch)
    //
    //  Salida: artifact_node completo con id, renderConfig añadido
    // ══════════════════════════════════════════════════════════════════════════
    static async persist(payload, deps) {
        const { type, content, projectId, agentId, title, meta = {} } = payload;
        const { kb, store } = deps;

        // ── Validaciones ──────────────────────────────────────────────────────
        if (!ArtifactEngine.TYPES[type]) {
            throw new Error(
                `[ArtifactEngine] Tipo inválido: '${type}'. ` +
                `Tipos válidos: ${Object.keys(ArtifactEngine.TYPES).join(', ')}`
            );
        }
        if (content === null || content === undefined) {
            throw new Error(`[ArtifactEngine] content no puede ser null o undefined`);
        }

        // ── Construir artifact_node ───────────────────────────────────────────
        const id = `artifact_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const node = {
            id,
            type:         'artifact_node',  // tipo KB
            artifactType: type,             // tipo de artefacto (landing, chart, etc.)
            title:        title || `Artefacto ${type}`,
            content,
            projectId,
            agentId,
            renderable:   true,             // todos son renderizables por defecto
            createdAt:    Date.now(),
            meta,
        };

        // ── Guardar en KB ─────────────────────────────────────────────────────
        await kb.saveNode(node);

        // ── Disparar ARTIFACT_CREATED al store ────────────────────────────────
        await store.dispatch({
            type:    'ARTIFACT_CREATED',
            payload: {
                projectId,
                artifact: { id, artifactType: type, title: node.title, agentId, createdAt: node.createdAt }
            }
        });

        return node;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  getByProject — devuelve todos los artefactos de un proyecto
    //  Ordenados por createdAt descendente (más reciente primero).
    // ══════════════════════════════════════════════════════════════════════════
    static async getByProject(projectId, deps) {
        const { kb } = deps;

        // Obtener todos los nodos de tipo artifact_node
        const all = await kb.getNodesByType('artifact_node');

        // Filtrar por proyecto y ordenar
        return all
            .filter(n => n.projectId === projectId)
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  getRenderable — devuelve el nodo con renderConfig añadido
    //  renderConfig.component indica qué componente de UI usar para renderizar.
    // ══════════════════════════════════════════════════════════════════════════
    static async getRenderable(artifactId, deps) {
        const { kb } = deps;

        const node = await kb.getNode(artifactId);
        if (!node) return null;

        const component = RENDER_COMPONENTS[node.artifactType] || 'ContentCard';

        return {
            ...node,
            renderConfig: {
                component,
                artifactType: node.artifactType,
                renderable:   node.renderable,
            }
        };
    }
}
