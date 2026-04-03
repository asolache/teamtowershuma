// =============================================================================
// TEAMTOWERS SOS V10.1 — VNA MAP RENDERER v2
// [#TEAMTOWERS_V10_ANTIGRAVITY_KERNEL]
// Ruta: /ia/dev/js/components/VnaMapRenderer.js
//
// Renderiza VnaNetworks como SVG puro.
// v2: curvas bezier, anti-solapamiento, nodos con entregable visible,
//     edición inline de roles, panel de detalle al clicar.
//
// API pública:
//   render(network, options)          → SVG string
//   buildLayout(network, options)     → { nodes, edges }
//   renderPhase1(network, container)  → SVG solo roles (sin flechas)
//   renderPhase2(network, container)  → SVG completo con flechas bezier
//   toArtifact(network, projectId)    → payload para ArtifactEngine
//   fromKB(projectId, deps)           → último vna_viz del proyecto
// =============================================================================

const ROLE_COLORS = {
    human:        { fill: 'rgba(15,110,86,.18)',  stroke: '#0F6E56', text: '#5ecfaa',  icon: '👤' },
    agent:        { fill: 'rgba(83,74,183,.18)',  stroke: '#534AB7', text: '#a8a3ee',  icon: '🤖' },
    process:      { fill: 'rgba(153,60,29,.14)',  stroke: '#993C1D', text: '#f0a07a',  icon: '⚙️' },
    organization: { fill: 'rgba(24,95,165,.14)',  stroke: '#185FA5', text: '#85B7EB',  icon: '🏢' },
    resource:     { fill: 'rgba(59,109,17,.14)',  stroke: '#3B6D11', text: '#a3d977',  icon: '📦' },
    default:      { fill: 'rgba(100,100,100,.1)', stroke: '#555',    text: '#bbb',     icon: '◆'  },
};

const FLOW_STYLE = {
    tangible:   { stroke: '#1D9E75', dash: '',                  marker: 'vna-arr-t' },
    intangible: { stroke: '#7F77DD', dash: 'stroke-dasharray="8 4"', marker: 'vna-arr-i' },
    payment:    { stroke: '#BA7517', dash: '',                  marker: 'vna-arr-p' },
};

// Nodo más alto para mostrar nombre + entregable
const NODE_W  = 160;
const NODE_H  =  72;
const PAD_X   =  28;
const PAD_Y   =  56;
const TIER_H  = 130;

export class VnaMapRenderer {

    // ══════════════════════════════════════════════════════════════════════════
    //  buildLayout — posiciones x,y para nodos y curvas bezier para edges
    // ══════════════════════════════════════════════════════════════════════════
    static buildLayout(network, options = {}) {
        const width     = options.width || 860;
        const nodes     = network.nodes     || [];
        const exchanges = network.exchanges || [];
        if (!nodes.length) return { nodes: [], edges: [] };

        // ── Agrupar por tier ──────────────────────────────────────────────────
        const tiers = {};
        nodes.forEach(n => {
            const t = n.tier ?? VnaMapRenderer._tierFromLevel(n.levelId) ?? 2;
            if (!tiers[t]) tiers[t] = [];
            tiers[t].push({ ...n, _tier: t });
        });

        const tierKeys   = Object.keys(tiers).map(Number).sort((a, b) => a - b);
        const nodeLayout = {};

        tierKeys.forEach((tier, ti) => {
            const tierNodes = tiers[tier];
            const count     = tierNodes.length;
            const totalW    = count * NODE_W + (count - 1) * PAD_X;
            const startX    = Math.max(PAD_X, (width - totalW) / 2);
            const y         = PAD_Y + ti * TIER_H;

            tierNodes.forEach((node, i) => {
                const x = startX + i * (NODE_W + PAD_X);
                nodeLayout[node.id] = { ...node, x, y, cx: x + NODE_W / 2, cy: y + NODE_H / 2 };
            });
        });

        // ── Edges con curvas bezier ───────────────────────────────────────────
        // Contar cuántos flujos hay entre cada par para calcular offset
        const pairCount = {};
        const pairIndex = {};
        exchanges.forEach(ex => {
            const key = [ex.from, ex.to].sort().join('→');
            pairCount[key] = (pairCount[key] || 0) + 1;
        });

        const edgeLayout = exchanges.map(ex => {
            const from = nodeLayout[ex.from];
            const to   = nodeLayout[ex.to];
            if (!from || !to) return { ...ex, path: '', midX: 0, midY: 0 };

            const key   = [ex.from, ex.to].sort().join('→');
            pairIndex[key] = (pairIndex[key] || 0);
            const idx   = pairIndex[key]++;
            const total = pairCount[key] || 1;

            // Calcular path bezier con offset para no solapar
            const { path, midX, midY } = VnaMapRenderer._bezierPath(
                from, to, idx, total, NODE_W, NODE_H
            );

            const flowType = ex.category === 'payment' ? 'payment'
                           : ex.type === 'intangible'  ? 'intangible'
                           : 'tangible';

            return { ...ex, path, midX, midY, flowType };
        });

        return { nodes: Object.values(nodeLayout), edges: edgeLayout };
    }

    // ── Calcular path bezier con anti-solapamiento ────────────────────────────
    static _bezierPath(from, to, idx, total, nodeW, nodeH) {
        const dx     = to.cx - from.cx;
        const dy     = to.cy - from.cy;
        const dist   = Math.sqrt(dx * dx + dy * dy) || 1;
        const sameTier = Math.abs(from.cy - to.cy) < 10;

        // Punto de salida y entrada en el borde del nodo
        const normX = dx / dist;
        const normY = dy / dist;
        const x1    = from.cx + normX * (nodeW / 2 + 2);
        const y1    = from.cy + normY * (nodeH / 2 + 2);
        const x2    = to.cx   - normX * (nodeW / 2 + 10);
        const y2    = to.cy   - normY * (nodeH / 2 + 2);

        // Offset lateral para separar flujos paralelos
        const offsetStep = 18;
        const offsetBase = (idx - (total - 1) / 2) * offsetStep;
        const perpX      = -normY * offsetBase;
        const perpY      =  normX * offsetBase;

        let cpX, cpY;
        if (sameTier) {
            // Flujo en el mismo tier: curva que sube por encima
            const curveHeight = 60 + Math.abs(offsetBase);
            cpX = (x1 + x2) / 2 + perpX;
            cpY = Math.min(from.cy, to.cy) - curveHeight + perpY;
        } else {
            // Flujo entre tiers distintos: curva suave con offset lateral
            cpX = (x1 + x2) / 2 + perpX;
            cpY = (y1 + y2) / 2 + perpY;
        }

        const midX = (x1 + cpX * 2 + x2) / 4;
        const midY = (y1 + cpY * 2 + y2) / 4;

        return {
            path: `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cpX.toFixed(1)} ${cpY.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,
            midX,
            midY
        };
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  renderPhase1 — solo nodos (Fase 1: arquitectura de roles)
    //  Nodos editables inline. Sin flechas.
    // ══════════════════════════════════════════════════════════════════════════
    static renderPhase1(network, options = {}) {
        const width  = options.width || 860;
        const layout = VnaMapRenderer.buildLayout(network, { width });

        if (!layout.nodes.length) return VnaMapRenderer._emptySvg(width);

        const tierCount = new Set((network.nodes || []).map(n =>
            n.tier ?? VnaMapRenderer._tierFromLevel(n.levelId) ?? 2
        )).size || 1;
        const height = PAD_Y * 2 + tierCount * TIER_H + NODE_H + 20;

        const tierLabels = VnaMapRenderer._tierLabelsSvg(network, layout, height);
        const nodeSvg    = layout.nodes.map(n => VnaMapRenderer._nodeSvg(n, true)).join('\n');

        return `<svg width="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"
            style="display:block;min-height:${height}px;">
            ${VnaMapRenderer._defs()}
            ${tierLabels}
            ${nodeSvg}
        </svg>`;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  render / renderPhase2 — SVG completo con flechas bezier
    // ══════════════════════════════════════════════════════════════════════════
    static render(network, options = {}) {
        const width        = options.width        || 860;
        const showSequence = options.showSequence !== false;
        const showLabels   = options.showLabels   !== false;
        const layout       = VnaMapRenderer.buildLayout(network, { width });

        if (!layout.nodes.length) return VnaMapRenderer._emptySvg(width);

        const tierCount = new Set((network.nodes || []).map(n =>
            n.tier ?? VnaMapRenderer._tierFromLevel(n.levelId) ?? 2
        )).size || 1;
        const height = PAD_Y * 2 + tierCount * TIER_H + NODE_H + 40;

        const tierLabels = VnaMapRenderer._tierLabelsSvg(network, layout, height);
        const edgeSvg    = layout.edges.map(e =>
            VnaMapRenderer._edgeSvg(e, showSequence, showLabels)
        ).join('\n');
        const nodeSvg    = layout.nodes.map(n =>
            VnaMapRenderer._nodeSvg(n, false)
        ).join('\n');
        const legend     = VnaMapRenderer._legendSvg(height);
        const healthBadge= VnaMapRenderer._healthBadgeSvg(network, width);

        return `<svg width="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"
            style="display:block;min-height:${height}px;padding:8px;">
            ${VnaMapRenderer._defs()}
            ${tierLabels}
            ${edgeSvg}
            ${nodeSvg}
            ${legend}
            ${healthBadge}
        </svg>`;
    }

    static renderPhase2(network, options = {}) {
        return VnaMapRenderer.render(network, options);
    }

    // ── SVG de un nodo — muestra nombre + entregable principal ────────────────
    static _nodeSvg(n, editable = false) {
        const colors   = ROLE_COLORS[n.role] || ROLE_COLORS.default;
        const name     = (n.label || n.id || '').substring(0, 22);
        // Entregable: campo main_deliverable o primer elemento de deliverables[]
        const deliv    = (n.main_deliverable || n.deliverables?.[0] || n.description || '').substring(0, 26);
        const editAttr = editable ? `data-node-id="${n.id}" class="vna-node-editable"` : `data-node-id="${n.id}"`;

        return `<g ${editAttr} style="cursor:${editable ? 'text' : 'pointer'}">
            <rect x="${n.x.toFixed(1)}" y="${n.y.toFixed(1)}" width="${NODE_W}" height="${NODE_H}" rx="9"
                fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="1"
                class="vna-node-rect"/>
            <text x="${n.cx.toFixed(1)}" y="${(n.y + 24).toFixed(1)}"
                text-anchor="middle" font-size="11" font-weight="700" fill="${colors.text}"
                font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${name}</text>
            <text x="${n.cx.toFixed(1)}" y="${(n.y + 40).toFixed(1)}"
                text-anchor="middle" font-size="9" fill="${colors.stroke}" opacity="0.85"
                font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${deliv}</text>
            <text x="${n.cx.toFixed(1)}" y="${(n.y + 57).toFixed(1)}"
                text-anchor="middle" font-size="8" fill="${colors.stroke}" opacity="0.5"
                font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${n.role || ''}</text>
        </g>`;
    }

    // ── SVG de una arista bezier con label de entregable ─────────────────────
    static _edgeSvg(e, showSequence = true, showLabels = true) {
        if (!e.path) return '';
        const style    = FLOW_STYLE[e.flowType] || FLOW_STYLE.tangible;
        const label    = (e.label || e.entregable || '').substring(0, 28);
        const midX     = e.midX.toFixed(1);
        const midY     = e.midY.toFixed(1);

        const lineSvg  = `<path d="${e.path}" stroke="${style.stroke}" stroke-width="1.5"
            ${style.dash} fill="none" marker-end="url(#${style.marker})"
            class="vna-edge" data-edge-id="${e.id || ''}"/>`;

        const labelSvg = showLabels && label ? `
            <rect x="${(e.midX - label.length * 3.1).toFixed(1)}" y="${(e.midY - 9).toFixed(1)}"
                width="${(label.length * 6.2 + 8).toFixed(1)}" height="14" rx="3"
                fill="rgba(5,5,8,0.85)" stroke="${style.stroke}" stroke-width="0.4"/>
            <text x="${midX}" y="${(e.midY + 1.5).toFixed(1)}" text-anchor="middle"
                font-size="8.5" fill="${style.stroke}"
                font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${label}</text>` : '';

        const seqSvg   = showSequence && e.sequence_order != null ? `
            <circle cx="${(e.midX - label.length * 3.1 - 10).toFixed(1)}" cy="${midY}" r="8"
                fill="${style.stroke}" opacity="0.9"/>
            <text x="${(e.midX - label.length * 3.1 - 10).toFixed(1)}" y="${(e.midY + 3).toFixed(1)}"
                text-anchor="middle" font-size="8" font-weight="700" fill="#fff"
                font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${e.sequence_order}</text>` : '';

        return lineSvg + labelSvg + seqSvg;
    }

    // ── Defs (markers de flecha) ──────────────────────────────────────────────
    static _defs() {
        return `<defs>
            <marker id="vna-arr-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#1D9E75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </marker>
            <marker id="vna-arr-i" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#7F77DD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </marker>
            <marker id="vna-arr-p" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M2 1L8 5L2 9" fill="none" stroke="#BA7517" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </marker>
        </defs>`;
    }

    // ── Tier labels (izquierda, rotados) ──────────────────────────────────────
    static _tierLabelsSvg(network, layout, height) {
        const TIER_LABELS = {
            0: '@anxaneta', 1: '@aixecador', 2: '@dosos', 3: '@baixos', 4: '@pinya'
        };
        const seenTiers = new Set();
        const lines = [];
        layout.nodes.forEach(n => {
            const t = n._tier ?? n.tier ?? VnaMapRenderer._tierFromLevel(n.levelId) ?? 2;
            if (!seenTiers.has(t)) {
                seenTiers.add(t);
                const y = n.cy;
                lines.push(`<text x="10" y="${y}" font-size="8" fill="#2a2a2a" font-family="monospace"
                    transform="rotate(-90,10,${y})" text-anchor="middle">${TIER_LABELS[t] || ''}</text>`);
            }
        });
        return lines.join('\n');
    }

    // ── Leyenda ───────────────────────────────────────────────────────────────
    static _legendSvg(height) {
        const y = height - 16;
        return `
            <circle cx="20" cy="${y}" r="6" fill="rgba(29,158,117,.2)" stroke="#1D9E75" stroke-width="0.6"/>
            <text x="30" y="${y + 4}" font-size="8.5" fill="#444"
                font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">tangible</text>
            <line x1="74" y1="${y}" x2="88" y2="${y}" stroke="#7F77DD" stroke-width="1.5" stroke-dasharray="5 3"/>
            <text x="92" y="${y + 4}" font-size="8.5" fill="#444"
                font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">intangible</text>
            <line x1="140" y1="${y}" x2="154" y2="${y}" stroke="#BA7517" stroke-width="1.5"/>
            <text x="158" y="${y + 4}" font-size="8.5" fill="#444"
                font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">pago</text>`;
    }

    // ── Health badge ──────────────────────────────────────────────────────────
    static _healthBadgeSvg(network, width) {
        const hs = network.meta?.health_score ?? network.sequencing_meta?.health_score;
        if (hs == null) return '';
        const pct   = Math.round(hs * 100);
        const color = pct >= 70 ? '#00e676' : pct >= 40 ? '#ff9100' : '#ff5252';
        return `<rect x="${width - 84}" y="6" width="76" height="20" rx="6"
            fill="rgba(0,0,0,0.4)" stroke="${color}" stroke-width="0.6"/>
            <text x="${width - 46}" y="20" text-anchor="middle" font-size="10" fill="${color}"
                font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">health ${pct}%</text>`;
    }

    static _emptySvg(width) {
        return `<svg width="100%" viewBox="0 0 ${width} 120" xmlns="http://www.w3.org/2000/svg">
            <text x="${width/2}" y="60" text-anchor="middle" font-size="12" fill="#333"
                font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">Red vacía</text>
        </svg>`;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  toArtifact / fromKB
    // ══════════════════════════════════════════════════════════════════════════
    static toArtifact(network, projectId) {
        return {
            type:      'vna_viz',
            content:   network,
            projectId,
            agentId:   'node-claude-sonnet-v10',
            title:     `Mapa VNA — ${(network.mission || network.id || 'VNA').substring(0, 40)}`,
            meta: {
                nodeCount:     (network.nodes     || []).length,
                exchangeCount: (network.exchanges || []).length,
                health_score:  network.meta?.health_score ?? null,
            }
        };
    }

    static async fromKB(projectId, deps) {
        const { kb } = deps;
        const all = await kb.getNodesByType('artifact_node');
        return all
            .filter(n => n.projectId === projectId && n.artifactType === 'vna_viz')
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))[0] || null;
    }

    static _tierFromLevel(levelId) {
        const l = (levelId || '').toLowerCase();
        if (l.includes('anx'))  return 0;
        if (l.includes('aix'))  return 1;
        if (l.includes('dos'))  return 2;
        if (l.includes('bai'))  return 3;
        if (l.includes('pin'))  return 4;
        return null;
    }
}
