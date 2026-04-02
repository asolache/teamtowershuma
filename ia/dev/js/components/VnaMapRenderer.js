// =============================================================================
// TEAMTOWERS SOS V10.1 — VNA MAP RENDERER
// Ruta: /ia/dev/js/components/VnaMapRenderer.js
//
// API estática para renderizar VnaNetworks como SVG string puro.
// Complementa al MapRenderer.js existente (DOM-based, interactivo).
//
//   MapRenderer     → instanciable, DOM, drag&drop, para vistas interactivas
//   VnaMapRenderer  → estático, SVG string, para tests y ArtifactEngine
//
// Reutiliza la paleta de colores y lógica de niveles de MapRenderer.
//
// API pública:
//   render(vnaNetwork, options)       → SVG string
//   buildLayout(vnaNetwork, options)  → { nodes, edges }
//   toArtifact(vnaNetwork, projectId) → payload para ArtifactEngine.persist()
//   fromKB(projectId, deps)           → último vna_viz artifact del proyecto
// =============================================================================

// ─── Paleta por role (alineada con MapRenderer.getColor) ─────────────────────
const ROLE_COLORS = {
    human:        { fill: 'rgba(15,110,86,.15)',  stroke: '#0F6E56', text: '#5ecfaa' },
    agent:        { fill: 'rgba(83,74,183,.15)',  stroke: '#534AB7', text: '#a8a3ee' },
    process:      { fill: 'rgba(153,60,29,.12)',  stroke: '#993C1D', text: '#f0a07a' },
    organization: { fill: 'rgba(24,95,165,.12)',  stroke: '#185FA5', text: '#85B7EB' },
    resource:     { fill: 'rgba(59,109,17,.12)',  stroke: '#3B6D11', text: '#a3d977' },
    default:      { fill: 'rgba(100,100,100,.1)', stroke: '#555',    text: '#bbb'    },
};

// ─── Colores de flujo (alineados con MapRenderer edge-tangible/intangible) ────
const FLOW = {
    tangible:   { stroke: '#00e676', dash: '' },
    intangible: { stroke: '#e040fb', dash: 'stroke-dasharray="8 4"' },
    payment:    { stroke: '#BA7517', dash: '' },
};

// ─── Layout constants ─────────────────────────────────────────────────────────
const NODE_W = 155;
const NODE_H =  56;
const PAD_X  =  40;
const PAD_Y  =  70;
const TIER_H = 140;

export class VnaMapRenderer {

    // ══════════════════════════════════════════════════════════════════════════
    //  buildLayout — calcula posiciones x,y para nodos y edges
    //  Agrupa nodos por tier (campo numérico, o inferido de levelId/role).
    //  Devuelve: { nodes: LayoutNode[], edges: LayoutEdge[] }
    // ══════════════════════════════════════════════════════════════════════════
    static buildLayout(network, options = {}) {
        const width     = options.width || 680;
        const nodes     = (network.nodes     || []);
        const exchanges = (network.exchanges || []);

        if (nodes.length === 0) return { nodes: [], edges: [] };

        // ── Agrupar por tier ──────────────────────────────────────────────────
        const tiers = {};
        nodes.forEach(n => {
            const tier = n.tier ?? VnaMapRenderer._tierFromLevel(n.levelId) ?? 0;
            if (!tiers[tier]) tiers[tier] = [];
            tiers[tier].push({ ...n, _tier: tier });
        });

        const tierKeys   = Object.keys(tiers).map(Number).sort((a, b) => a - b);
        const nodeLayout = {};

        tierKeys.forEach((tier, tierIdx) => {
            const tierNodes = tiers[tier];
            const count     = tierNodes.length;
            const usableW   = width - PAD_X * 2 - NODE_W;
            const spacing   = count > 1 ? usableW / (count - 1) : 0;
            const startX    = count > 1 ? PAD_X : (width - NODE_W) / 2;
            const baseY     = PAD_Y + tierIdx * TIER_H;

            tierNodes.forEach((node, i) => {
                const x = startX + i * spacing;
                // Stagger vertical para separar flechas
                const stagger = count > 1 ? (i % 2 === 0 ? -8 : 8) : 0;
                const y = baseY + stagger;
                nodeLayout[node.id] = {
                    ...node,
                    x,
                    y,
                    cx: x + NODE_W / 2,
                    cy: y + NODE_H / 2,
                };
            });
        });

        // ── Contar aristas paralelas entre pares ──────────────────────────────
        const pairIdx = {};
        exchanges.forEach((ex, i) => {
            const key = [ex.from, ex.to].sort().join('::');
            if (!pairIdx[key]) pairIdx[key] = [];
            pairIdx[key].push(i);
        });

        // ── Edges con coordenadas y curvas Bezier ─────────────────────────────
        const edgeLayout = exchanges.map((ex, i) => {
            const from = nodeLayout[ex.from];
            const to   = nodeLayout[ex.to];

            if (!from || !to) {
                return { ...ex, x1: 0, y1: 0, x2: 0, y2: 0, ctrlX: 0, ctrlY: 0, sequence_order: ex.sequence_order ?? null };
            }

            const dx  = to.cx - from.cx;
            const dy  = to.cy - from.cy;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx  = dx / len;
            const ny  = dy / len;

            const x1 = from.cx + nx * (NODE_W / 2 + 4);
            const y1 = from.cy + ny * (NODE_H / 2 + 3);
            const x2 = to.cx   - nx * (NODE_W / 2 + 12);
            const y2 = to.cy   - ny * (NODE_H / 2 + 3);

            // Offset perpendicular para aristas paralelas
            const pairKey  = [ex.from, ex.to].sort().join('::');
            const siblings = pairIdx[pairKey] || [i];
            const sibI     = siblings.indexOf(i);
            const perpOff  = (sibI - (siblings.length - 1) / 2) * 28;
            const px = -ny * perpOff;
            const py =  nx * perpOff;

            // Control point Bezier
            const baseCurve = Math.min(len * 0.18, 45);
            const ctrlX = (x1 + x2) / 2 + px + (-ny) * baseCurve;
            const ctrlY = (y1 + y2) / 2 + py + ( nx) * baseCurve;

            return {
                ...ex,
                x1, y1, x2, y2,
                ctrlX, ctrlY,
                sequence_order: ex.sequence_order ?? null,
                tangible:       ex.type !== 'intangible',
                payment:        ex.category === 'payment',
            };
        });

        return {
            nodes: Object.values(nodeLayout),
            edges: edgeLayout,
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  render — genera SVG string completo del VnaNetwork
    //  options.width        680
    //  options.showSequence false — badges numéricos en exchanges
    // ══════════════════════════════════════════════════════════════════════════
    static render(network, options = {}) {
        const width        = options.width        || 680;
        const showSequence = options.showSequence || false;
        const nodes        = network.nodes        || [];
        const exchanges    = network.exchanges    || [];

        if (nodes.length === 0 && exchanges.length === 0) {
            return `<svg width="100%" viewBox="0 0 ${width} 100" xmlns="http://www.w3.org/2000/svg">` +
                   `<text x="${width/2}" y="54" text-anchor="middle" font-size="12" fill="#666">Red vacía</text>` +
                   `</svg>`;
        }

        const layout     = VnaMapRenderer.buildLayout(network, { width });
        const tierCount  = new Set(nodes.map(n => n.tier ?? 0)).size || 1;
        const height     = PAD_Y * 2 + tierCount * TIER_H + NODE_H + 30;

        // ── Markers de flecha (alineados con MapRenderer edge styles) ─────────
        const defs = `<defs>
  <marker id="vna-arr-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="#00e676" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
  <marker id="vna-arr-i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="#e040fb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
  <marker id="vna-arr-p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="#BA7517" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>`;

        // ── Edges con curvas Bezier ────────────────────────────────────────────
        const edgeSvg = layout.edges.map(e => {
            const flow     = e.payment ? FLOW.payment : e.tangible ? FLOW.tangible : FLOW.intangible;
            const markerId = e.payment ? 'vna-arr-p' : e.tangible ? 'vna-arr-t' : 'vna-arr-i';

            // Punto medio en la curva Bezier al 50%
            const mt = 0.5;
            const midX = ((1-mt)*(1-mt)*e.x1 + 2*(1-mt)*mt*(e.ctrlX||((e.x1+e.x2)/2)) + mt*mt*e.x2).toFixed(1);
            const midY = ((1-mt)*(1-mt)*e.y1 + 2*(1-mt)*mt*(e.ctrlY||((e.y1+e.y2)/2)) + mt*mt*e.y2).toFixed(1);

            // Path Bezier cuadratico
            const cx = (e.ctrlX || ((e.x1+e.x2)/2)).toFixed(1);
            const cy = (e.ctrlY || ((e.y1+e.y2)/2)).toFixed(1);
            const path = `<path d="M${e.x1.toFixed(1)},${e.y1.toFixed(1)} Q${cx},${cy} ${e.x2.toFixed(1)},${e.y2.toFixed(1)}" ` +
                         `stroke="${flow.stroke}" stroke-width="1.5" ${flow.dash} ` +
                         `marker-end="url(#${markerId})" fill="none" opacity="0.85"/>`;

            // Badge de secuencia
            let badge = '';
            if (showSequence && e.sequence_order != null) {
                const ts = 0.18;
                const sx = ((1-ts)*(1-ts)*e.x1 + 2*(1-ts)*ts*(e.ctrlX||((e.x1+e.x2)/2)) + ts*ts*e.x2).toFixed(1);
                const sy = ((1-ts)*(1-ts)*e.y1 + 2*(1-ts)*ts*(e.ctrlY||((e.y1+e.y2)/2)) + ts*ts*e.y2).toFixed(1);
                badge = `<circle cx="${sx}" cy="${sy}" r="9" fill="${flow.stroke}" opacity="0.92" class="seq-badge"/>` +
                        `<text x="${sx}" y="${sy}" text-anchor="middle" dominant-baseline="central" ` +
                        `font-size="9" font-weight="500" fill="#fff" ` +
                        `font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${e.sequence_order}</text>`;
            }

            return path + badge;
        }).join('\n  ');

        // ── Nodes ─────────────────────────────────────────────────────────────
        const nodeSvg = layout.nodes.map(n => {
            const colors       = ROLE_COLORS[n.role] || ROLE_COLORS.default;
            const raw          = n.label || n.id || '';
            const displayLabel = raw.length > 15 ? raw.substring(0, 14) + '…' : raw;
            const sublabel     = n.role || '';

            return `<g>
    <rect x="${n.x.toFixed(1)}" y="${n.y.toFixed(1)}" width="${NODE_W}" height="${NODE_H}" rx="7"
          fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="0.8"/>
    <text x="${n.cx.toFixed(1)}" y="${(n.y + NODE_H / 2 - 8).toFixed(1)}"
          text-anchor="middle" font-size="11" font-weight="500" fill="${colors.text}"
          font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${displayLabel}</text>
    <text x="${n.cx.toFixed(1)}" y="${(n.y + NODE_H / 2 + 9).toFixed(1)}"
          text-anchor="middle" font-size="9" fill="${colors.stroke}" opacity="0.8"
          font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${sublabel}</text>
  </g>`;
        }).join('\n  ');

        // ── Health score badge ────────────────────────────────────────────────
        const healthScore = network.meta?.health_score ?? network.sequencing_meta?.health_score;
        const healthBadge = healthScore != null
            ? `<text x="${width - 8}" y="18" text-anchor="end" font-size="9" fill="#639922" ` +
              `font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">` +
              `health: ${healthScore}</text>`
            : '';

        return `<svg width="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${defs}
  ${edgeSvg}
  ${nodeSvg}
  ${healthBadge}
</svg>`;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  toArtifact — payload para ArtifactEngine.persist()
    // ══════════════════════════════════════════════════════════════════════════
    static toArtifact(network, projectId) {
        const missionLabel = (network.mission || network.id || 'VNA').substring(0, 40);
        return {
            type:      'vna_viz',
            content:   network,
            projectId,
            agentId:   'node-claude-sonnet-v10',
            title:     `Mapa VNA — ${missionLabel}`,
            meta: {
                nodeCount:     (network.nodes     || []).length,
                exchangeCount: (network.exchanges || []).length,
                health_score:  network.meta?.health_score ?? null,
            }
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  fromKB — carga el último vna_viz artifact del proyecto
    // ══════════════════════════════════════════════════════════════════════════
    static async fromKB(projectId, deps) {
        const { kb } = deps;
        const all = await kb.getNodesByType('artifact_node');
        const matches = all
            .filter(n => n.projectId === projectId && n.artifactType === 'vna_viz')
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return matches[0] || null;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  _tierFromLevel — inferir tier numérico desde levelId casteller
    // ══════════════════════════════════════════════════════════════════════════
    static _tierFromLevel(levelId) {
        const l = (levelId || '').toLowerCase();
        if (l.includes('anx'))  return 0;
        if (l.includes('aix'))  return 1;
        if (l.includes('dos'))  return 2;
        if (l.includes('baix')) return 3;
        if (l.includes('pin'))  return 4;
        return null;
    }
}
