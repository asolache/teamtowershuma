// =============================================================================
// TEAMTOWERS SOS V10 — MAP RENDERER
// Ruta: ia/dev/js/components/MapRenderer.js
// SVG VNA Map · Nodos draggables · Aristas tangibles/intangibles · Heatmap
// =============================================================================

import { store } from '../core/store.js';

export class MapRenderer {

    constructor(canvasEl, svgEl, options = {}) {
        this.canvas  = canvasEl;
        this.svg     = svgEl;
        this.options = Object.assign({
            isEditMode:   false,
            isHeatmap:    false,
            maxHeat:      1,
            isMacro:      false,
            markerSuffix: 'vis',
            trimSize:     0,
            onNodeClick:  () => {},
            onNodeDrop:   () => {},
            onEdgeClick:  () => {}
        }, options);

        this.nodes          = [];
        this.edges          = [];
        this.edgeCoordinates = {};
        this.isDragging     = false;
        this.draggedNode    = null;
        this.hasMoved       = false;
        this._retryCount    = 0;

        this._forceSvgDimensions();
        this._initEvents();
    }

    // ── Helpers estáticos ─────────────────────────────────────────
    static getIcon(level) {
        const l = (level || '').toLowerCase();
        if (l.includes('anx'))  return '👑';
        if (l.includes('aix'))  return '🧭';
        if (l.includes('dos'))  return '👁️';
        if (l.includes('baix')) return '⚙️';
        if (l.includes('pin'))  return '🤝';
        return '💠';
    }

    static getColor(level) {
        const l = (level || '').toLowerCase();
        if (l.includes('anx'))  return 'var(--accent-red)';
        if (l.includes('aix'))  return '#ff4081';
        if (l.includes('dos'))  return 'var(--accent-purple)';
        if (l.includes('baix')) return '#7c4dff';
        if (l.includes('pin'))  return '#536dfe';
        return 'var(--accent-indigo,#6366f1)';
    }

    static getStyles() {
        return `
            .map-container { flex:1; position:relative; overflow:hidden; border:1px solid var(--glass-border); border-radius:18px; background:linear-gradient(180deg,rgba(15,15,20,0.9) 0%,rgba(5,5,8,1) 100%); box-shadow:inset 0 0 100px rgba(0,0,0,0.8); width:100%; min-height:500px; transition:all 0.4s cubic-bezier(0.2,0.8,0.2,1); }
            .map-canvas { position:absolute; top:0; left:0; width:100%; height:100%; background-image:radial-gradient(circle at 2px 2px,rgba(255,255,255,0.04) 1px,transparent 0); background-size:50px 50px; transform-origin:top left; transition:transform 0.2s ease-out; }
            .map-canvas svg { width:100%; height:100%; position:absolute; top:0; left:0; overflow:visible; pointer-events:none; z-index:1; }

            .edge-line { fill:none; stroke-width:3; opacity:0.8; transition:stroke 0.4s,opacity 0.4s,stroke-width 0.4s; }
            .edge-line:hover { opacity:1; stroke-width:6!important; cursor:pointer; pointer-events:stroke; filter:brightness(1.5); }
            .edge-tangible   { stroke:var(--accent-green);  filter:drop-shadow(0 0 3px rgba(0,230,118,0.4)); }
            .edge-intangible { stroke:var(--accent-purple); stroke-dasharray:8,8; animation:dashAnim 20s linear infinite; filter:drop-shadow(0 0 3px rgba(224,64,251,0.4)); }
            .edge-sick { stroke:var(--accent-red)!important; stroke-width:4!important; filter:drop-shadow(0 0 8px var(--accent-red)); }
            .edge-temp { stroke:var(--accent-orange); stroke-width:4; stroke-dasharray:6,6; animation:dashAnim 5s linear infinite; opacity:0.9; }
            @keyframes dashAnim { to { stroke-dashoffset:-200; } }

            .node-wrapper { position:absolute; z-index:5; cursor:grab; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; width:140px; transition:filter 0.3s; }
            .node-wrapper:active { cursor:grabbing; transform:translate(-50%,-50%) scale(1.05); }
            .node-wrapper:hover  { filter:brightness(1.2); z-index:10; }
            .node-wrapper.selected { z-index:10; }
            .node-wrapper.ghost-node { opacity:0.4; cursor:default; }

            .node-circle { width:70px; height:70px; border-radius:50%; background:radial-gradient(circle at 35% 35%,rgba(255,255,255,0.08),rgba(0,0,0,0.6)); border:2px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; transition:all 0.3s; position:relative; box-shadow:0 4px 15px rgba(0,0,0,0.5); }
            .node-wrapper:hover .node-circle { transform:scale(1.1); box-shadow:0 8px 25px rgba(0,0,0,0.7); }
            .node-level-badge { font-size:1.6rem; line-height:1; }
            .node-fmv       { font-size:0.62rem; font-family:var(--font-mono); font-weight:bold; }
            .node-label-fmv { font-size:0.55rem; font-family:var(--font-mono); color:#888; }
            .node-title { font-size:0.72rem; color:white; font-weight:bold; text-align:center; margin-top:6px; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-shadow:0 1px 4px rgba(0,0,0,0.8); }

            .tx-badge { position:absolute; background:rgba(10,10,14,0.95); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:3px 8px; font-size:0.65rem; font-family:var(--font-mono); color:#ccc; cursor:pointer; z-index:20; white-space:nowrap; transition:0.2s; pointer-events:all; }
            .tx-badge:hover { background:rgba(99,102,241,0.2); border-color:var(--accent-indigo,#6366f1); color:white; transform:scale(1.05); }

            .btn-fullscreen { position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.6); border:1px solid #333; color:white; padding:8px 14px; border-radius:8px; font-size:0.78rem; cursor:pointer; z-index:10; transition:0.2s; font-weight:bold; }
            .btn-fullscreen:hover { background:rgba(99,102,241,0.2); border-color:var(--accent-indigo,#6366f1); }
            .map-overlay-link { font-size:0.75rem; color:var(--accent-indigo,#6366f1); text-decoration:none; font-weight:bold; padding:5px 10px; border:1px solid rgba(99,102,241,0.4); border-radius:7px; transition:0.2s; }
            .map-overlay-link:hover { background:var(--accent-indigo,#6366f1); color:white; }

            @keyframes spinIn { from { transform:rotate(-30deg) scale(0.8); opacity:0; } to { transform:rotate(0) scale(1); opacity:1; } }
        `;
    }

    // ── setData / setZoom ─────────────────────────────────────────
    setData(roles, flows) {
        this.nodes = roles || [];
        this.edges = flows || [];
        this._renderNodes();
        this.renderEdges();
    }

    setZoom(zoom) {
        if (this.canvas) this.canvas.style.transform = `scale(${zoom})`;
    }

    // ── Render Nodes ──────────────────────────────────────────────
    _renderNodes() {
        if (!this.canvas) return;
        this.canvas.querySelectorAll('.node-wrapper').forEach(n => n.remove());
        if (!this.nodes.length) return;

        const activeRoles = this.nodes.filter(r => !r.isArchived);
        const ghostRoles  = this.nodes.filter(r =>  r.isArchived);

        const normalizeLevel = (l) => {
            const lc = (l || '').toLowerCase();
            if (lc.includes('anx'))  return 0;
            if (lc.includes('aix'))  return 1;
            if (lc.includes('dos'))  return 2;
            if (lc.includes('baix')) return 3;
            return 4;
        };

        const levelCounts  = {};
        const getInitialLayout = (level, total, indexInLevel) => {
            const rowY = [15, 30, 50, 65, 80];
            const y    = rowY[level] || 50;
            let x;
            if (total === 1) x = 50;
            else {
                const margin = this.options.trimSize || 10;
                x = margin + (indexInLevel / Math.max(total - 1, 1)) * (100 - margin * 2);
            }
            return { x: Math.max(10, Math.min(x, 90)), y: Math.max(12, Math.min(y, 88)) };
        };

        activeRoles.forEach(r => {
            const level = normalizeLevel(r.levelId);
            const total = activeRoles.filter(role => normalizeLevel(role.levelId) === level).length;
            if (!levelCounts[level]) levelCounts[level] = 0;
            const pos     = getInitialLayout(level, total, levelCounts[level]);
            levelCounts[level]++;
            const topPos  = r.customPos ? parseFloat(r.y) : pos.y;
            const leftPos = r.customPos ? parseFloat(r.x) : pos.x;
            this.canvas.appendChild(this._buildNodeDOM(r, leftPos, topPos, false));
        });

        ghostRoles.forEach((r, i) => {
            this.canvas.appendChild(this._buildNodeDOM(r, 10 + (i * 12), 90, true));
        });

        this.renderEdges();
    }

    _buildNodeDOM(role, x, y, isGhost) {
        const levelSafe = (role.levelId || '').toLowerCase();
        const color     = isGhost ? '#666' : MapRenderer.getColor(levelSafe);
        const icon      = isGhost ? '👻'  : MapRenderer.getIcon(levelSafe);

        const nodeDiv = document.createElement('div');
        nodeDiv.className  = `node-wrapper${isGhost ? ' ghost-node' : ''}`;
        nodeDiv.dataset.id = role.id;
        nodeDiv.style.top  = `${y}%`;
        nodeDiv.style.left = `${x}%`;

        nodeDiv.innerHTML = `
            <div class="node-circle">
                <div class="node-level-badge" style="color:${color}; border-color:${color};" title="${role.name}">${icon}</div>
                <div class="node-fmv"       style="color:${color};">${isGhost ? 'ARCH' : `${role.fmv}€`}</div>
                ${!isGhost ? `<div class="node-label-fmv">x${role.multiplier}</div>` : ''}
            </div>
            <div class="node-title">${role.name}</div>`;

        if (this.options.isEditMode) nodeDiv.style.cursor = 'pointer';
        return nodeDiv;
    }

    // ── Render Edges ──────────────────────────────────────────────
    renderEdges() {
        if (!this.svg || !this.canvas) return;
        const pathsGroup = this.svg.id
            ? document.getElementById(this.svg.id.replace('edges-svg', 'paths-group'))
            : this.svg;

        if (pathsGroup) pathsGroup.innerHTML = '';
        else this.svg.innerHTML = '';

        this.canvas.querySelectorAll('.tx-badge').forEach(b => b.remove());
        this.edgeCoordinates = {};

        if (!this.edges.length) return;

        if (this.canvas.offsetWidth === 0 || this.canvas.offsetHeight === 0) {
            if (this._retryCount < 20) {
                this._retryCount++;
                setTimeout(() => this.renderEdges(), 60);
            }
            return;
        }
        this._retryCount = 0;

        let maxHours = 1;
        if (this.options.isHeatmap) {
            this.edges.forEach(tx => { const h = tx.total_hours_processed || 0; if (h > maxHours) maxHours = h; });
            this.options.maxHeat = maxHours;
        }

        const pairCounts = {};
        this.edges.forEach((tx, i) => {
            const key = tx.from < tx.to ? `${tx.from}-${tx.to}` : `${tx.to}-${tx.from}`;
            if (!pairCounts[key]) pairCounts[key] = [];
            pairCounts[key].push({ tx, index: i });
        });

        Object.values(pairCounts).forEach(edgesGroup => {
            edgesGroup.forEach((edgeData, multiIdx) => {
                this._drawSingleEdge(edgeData.tx, edgeData.index, edgesGroup, multiIdx, pathsGroup || this.svg);
            });
        });
    }

    _drawSingleEdge(tx, index, edgesGroup, multiIdx, pathsGroup) {
        const dom1 = this.canvas.querySelector(`.node-wrapper[data-id="${tx.from}"]`);
        const dom2 = this.canvas.querySelector(`.node-wrapper[data-id="${tx.to}"]`);
        if (!dom1 || !dom2) return;

        const w = this.canvas.offsetWidth;
        const h = this.canvas.offsetHeight;

        const x1 = (parseFloat(dom1.style.left) / 100) * w;
        const y1 = (parseFloat(dom1.style.top)  / 100) * h;
        const x2 = (parseFloat(dom2.style.left) / 100) * w;
        const y2 = (parseFloat(dom2.style.top)  / 100) * h;

        const suffix      = this.options.isEditMode ? 'edit' : (this.options.markerSuffix || 'vis');
        const isTangible  = tx.tipo !== 'intangible';
        const strokeColor = isTangible ? '#00e676' : '#e040fb';
        let   markerId    = isTangible ? `arrow-tangible-${suffix}` : `arrow-intangible-${suffix}`;

        // Heatmap override
        if (this.options.isHeatmap && tx.total_hours_processed) {
            const heat = tx.total_hours_processed / (this.options.maxHeat || 1);
            const r    = Math.round(255 * heat);
            const g    = Math.round(100 * (1 - heat));
            markerId   = `arrow-tangible-${suffix}`;
            const path = this._createPath(x1, y1, x2, y2, multiIdx, edgesGroup.length);
            path.setAttribute('stroke', `rgb(${r},${g},50)`);
            path.setAttribute('stroke-width', String(3 + heat * 8));
            path.setAttribute('class', 'edge-line edge-heat');
            path.setAttribute('marker-end', `url(#${markerId})`);
            pathsGroup.appendChild(path);
            return;
        }

        // Check if sick (no flows but has entries)
        const isSick = tx.sick || false;

        const path = this._createPath(x1, y1, x2, y2, multiIdx, edgesGroup.length);
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('class', `edge-line ${isTangible ? 'edge-tangible' : 'edge-intangible'}${isSick ? ' edge-sick' : ''}`);
        path.setAttribute('marker-end', `url(#${markerId})`);
        path.setAttribute('data-index', String(index));

        if (this.options.isEditMode) {
            path.style.pointerEvents = 'stroke';
            path.style.cursor        = 'pointer';
            path.addEventListener('click', () => this.options.onEdgeClick(index));
        }

        pathsGroup.appendChild(path);
        this.edgeCoordinates[index] = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };

        // Badge
        const txMidX = (x1 + x2) / 2;
        const txMidY = (y1 + y2) / 2;
        const badge  = document.createElement('div');
        badge.className = 'tx-badge';
        badge.dataset.idx = String(index);
        badge.style.left  = `${txMidX}px`;
        badge.style.top   = `${txMidY}px`;
        badge.style.transform = 'translate(-50%,-50%)';
        badge.textContent = tx.template || tx.entregable || '?';
        if (this.options.isEditMode) {
            badge.addEventListener('click', () => this.options.onEdgeClick(index));
        }
        this.canvas.appendChild(badge);

        // Animated flow particle
        if (!this.options.isHeatmap && !this.options.isMacro) this._animateParticle(path, strokeColor);
    }

    _createPath(x1, y1, x2, y2, multiIdx, total) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const dx   = x2 - x1;
        const dy   = y2 - y1;
        const offset = (multiIdx - (total - 1) / 2) * 25;
        const cx1  = x1 + dx * 0.25 - dy * 0.25 + offset;
        const cy1  = y1 + dy * 0.25 + dx * 0.25 + offset;
        const cx2  = x1 + dx * 0.75 - dy * 0.25 + offset;
        const cy2  = y1 + dy * 0.75 + dx * 0.25 + offset;
        path.setAttribute('d', `M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`);
        path.setAttribute('fill', 'none');
        return path;
    }

    _animateParticle(pathEl, color) {
        try {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', color);
            circle.setAttribute('opacity', '0.8');
            circle.style.filter = `drop-shadow(0 0 4px ${color})`;

            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
            animate.setAttribute('dur', `${2 + Math.random() * 2}s`);
            animate.setAttribute('repeatCount', 'indefinite');

            const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
            mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${pathEl.id || ''}`);
            if (!pathEl.id) {
                const pid = `path_${Date.now()}_${Math.random().toString(36).substr(2,4)}`;
                pathEl.id = pid;
                mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${pid}`);
            }

            animate.appendChild(mpath);
            circle.appendChild(animate);
            pathEl.parentNode?.insertBefore(circle, pathEl.nextSibling);
            setTimeout(() => circle.remove(), 2700);
        } catch (_) { /* silently fail in environments without full SVG support */ }
    }

    // ── Temp line (modo arquitecto) ───────────────────────────────
    drawTempLine(fromId, mouseX, mouseY, zoom = 1) {
        const originNode = this.canvas.querySelector(`.node-wrapper[data-id="${fromId}"]`);
        if (!originNode) return;
        const rect   = this.canvas.getBoundingClientRect();
        const targetX = (mouseX - rect.left) / zoom;
        const targetY = (mouseY - rect.top)  / zoom;

        let tempLine = this.svg.querySelector('.edge-temp');
        if (!tempLine) {
            tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tempLine.setAttribute('class', 'edge-temp');
            tempLine.setAttribute('marker-end', 'url(#arrow-temp-edit)');
            this.svg.appendChild(tempLine);
        }
        const ox = (parseFloat(originNode.style.left) / 100) * this.canvas.offsetWidth;
        const oy = (parseFloat(originNode.style.top)  / 100) * this.canvas.offsetHeight;
        tempLine.setAttribute('x1', String(ox));
        tempLine.setAttribute('y1', String(oy));
        tempLine.setAttribute('x2', String(targetX));
        tempLine.setAttribute('y2', String(targetY));
    }

    clearTempLine() {
        this.svg.querySelector('.edge-temp')?.remove();
    }

    // ── Events ────────────────────────────────────────────────────
    _initEvents() {
        if (!this.canvas) return;

        this.canvas.addEventListener('click', (e) => {
            const node = e.target.closest('.node-wrapper');
            if (node) this.options.onNodeClick(node.dataset.id, e);
        });

        if (!this.options.isEditMode) return;

        this.canvas.addEventListener('mousedown', (e) => {
            if (window.innerWidth <= 768) return;
            const node = e.target.closest('.node-wrapper');
            if (node) {
                this.isDragging  = true;
                this.hasMoved    = false;
                this.draggedNode = node;
                node.style.zIndex = '1000';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.draggedNode) return;
            this.hasMoved = true;
            const rect = this.canvas.getBoundingClientRect();
            const newX = Math.max(5, Math.min(((e.clientX - rect.left) / rect.width)  * 100, 95));
            const newY = Math.max(12, Math.min(((e.clientY - rect.top)  / rect.height) * 100, 88));
            this.draggedNode.style.left = `${newX}%`;
            this.draggedNode.style.top  = `${newY}%`;
            this.renderEdges();
        });

        window.addEventListener('mouseup', async () => {
            if (!this.isDragging || !this.draggedNode) return;
            this.isDragging = false;
            const node      = this.draggedNode;
            this.draggedNode = null;
            node.style.zIndex = node.classList.contains('ghost-node') ? '1' : '5';

            if (this.hasMoved) {
                const nodeId = node.dataset.id;
                const newX   = parseFloat(node.style.left);
                const newY   = parseFloat(node.style.top);
                this.options.onNodeDrop(nodeId, newX, newY);
            }
        });
    }

    _forceSvgDimensions() {
        if (!this.svg) return;
        const target = this.svg.tagName?.toLowerCase() !== 'svg' && this.svg.ownerSVGElement
            ? this.svg.ownerSVGElement : this.svg;
        Object.assign(target.style, { width:'100%', height:'100%', position:'absolute', top:'0', left:'0', overflow:'visible', pointerEvents:'none' });
    }
}
