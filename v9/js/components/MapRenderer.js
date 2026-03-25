// v9/js/components/MapRenderer.js
import { store } from '../core/store.js';

export class MapRenderer {
    constructor(canvasEl, svgEl, options = {}) {
        this.canvas = canvasEl;
        this.svg = svgEl;
        this.options = Object.assign({
            isEditMode: false,
            isHeatmap: false,
            maxHeat: 1,
            onNodeClick: () => {},
            onNodeDrop: () => {},
            onEdgeClick: () => {}
        }, options);

        this.nodes = [];
        this.edges = [];
        this.edgeCoordinates = {}; 
        
        this.isDragging = false;
        this.draggedNode = null;
        this.hasMoved = false;

        this.forceSvgDimensions();
        this.initEvents();
    }

    forceSvgDimensions() {
        if (this.svg) {
            let targetSvg = this.svg;
            if (this.svg.tagName.toLowerCase() !== 'svg' && this.svg.ownerSVGElement) {
                targetSvg = this.svg.ownerSVGElement;
            }
            targetSvg.style.width = '100%';
            targetSvg.style.height = '100%';
            targetSvg.style.position = 'absolute';
            targetSvg.style.top = '0';
            targetSvg.style.left = '0';
            targetSvg.style.overflow = 'visible';
            targetSvg.style.pointerEvents = 'none';
        }
    }

    static getIcon(level) {
        const l = (level || '').toLowerCase();
        if(l.includes('anx')) return '👑';
        if(l.includes('aix')) return '🧭';
        if(l.includes('dos')) return '👁️';
        if(l.includes('baix')) return '⚙️';
        if(l.includes('pin')) return '🤝';
        return '💠';
    }
    
    static getColor(level) { 
        const l = (level || '').toLowerCase();
        if(l.includes('anx')) return 'var(--accent-red)';
        if(l.includes('aix')) return '#ff4081';
        if(l.includes('dos')) return 'var(--accent-purple)';
        if(l.includes('baix')) return '#7c4dff';
        if(l.includes('pin')) return '#536dfe';
        return '#fff';
    }

    static getStyles() {
        return `
            .map-container { flex: 1; position: relative; overflow: hidden; border: 1px solid var(--glass-border); border-radius: 20px; background: linear-gradient(180deg, rgba(15,15,20,0.9) 0%, rgba(5,5,8,1) 100%); box-shadow: inset 0 0 100px rgba(0,0,0,0.8); width: 100%; min-height: 500px; transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);}
            .map-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0); background-size: 50px 50px; transform-origin: top left; transition: transform 0.2s ease-out; }
            
            .map-canvas svg { width: 100%; height: 100%; position: absolute; top: 0; left: 0; overflow: visible; pointer-events: none; z-index: 1; }
            
            .edge-line { fill: none; stroke-width: 3; opacity: 0.8; transition: stroke 0.4s, opacity 0.4s, stroke-width 0.4s; }
            .edge-line:hover { opacity: 1; stroke-width: 6 !important; cursor: pointer; pointer-events: stroke; filter: brightness(1.5);}
            .edge-tangible { stroke: var(--accent-green); filter: drop-shadow(0 0 3px rgba(0, 230, 118, 0.4));}
            .edge-intangible { stroke: var(--accent-purple); stroke-dasharray: 8, 8; animation: dashAnim 20s linear infinite; filter: drop-shadow(0 0 3px rgba(224, 64, 251, 0.4));}
            .edge-sick { stroke: var(--accent-red) !important; stroke-width: 4 !important; filter: drop-shadow(0 0 8px var(--accent-red)); }
            .edge-temp { stroke: var(--accent-orange); stroke-width: 4; stroke-dasharray: 6, 6; animation: dashAnim 5s linear infinite; opacity: 0.9;}

            .node-wrapper { position: absolute; z-index: 5; cursor: grab; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; width: 140px; transition: filter 0.3s;}
            .node-wrapper:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.05); }
            .node-wrapper.selected { z-index: 10; }
            .node-wrapper:hover { filter: brightness(1.2); z-index: 9;}
            
            .node-circle { position: relative; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; transition: all 0.3s; background: rgba(20, 20, 25, 0.8); backdrop-filter: blur(15px); border: 3px solid rgba(255,255,255,0.1); color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.6); width: 85px; height: 85px; box-sizing: border-box;}
            .node-wrapper.selected .node-circle { border-color: var(--accent-blue) !important; box-shadow: 0 0 30px rgba(0, 176, 255, 0.6), inset 0 0 20px rgba(0, 176, 255, 0.2) !important; }
            .node-wrapper.sick-node .node-circle { border-color: var(--accent-red) !important; box-shadow: 0 0 45px rgba(255, 82, 82, 0.9) !important; animation: pulseSick 1s infinite alternate; }
            .node-wrapper.ghost-node { opacity: 0.4; filter: grayscale(100%); z-index: 1; }
            .node-wrapper.ghost-node .node-circle { border-style: dashed;}
            
            .node-fmv { font-size: 1.1rem; font-weight: 900; font-family: var(--font-mono); line-height: 1; margin-bottom: 2px;}
            .node-label-fmv { font-size: 0.65rem; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;}
            .node-level-badge { position: absolute; top: -12px; left: 12px; border-radius: 50%; width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; background: #000; border: 2px solid; box-shadow: 0 5px 15px rgba(0,0,0,0.8); z-index: 2; box-sizing: border-box;}
            .node-title { margin-top: 12px; font-size: 0.85rem; font-weight: 800; color: white; text-align: center; text-transform: uppercase; width: 100%; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3; padding: 4px 8px; text-shadow: 0 4px 8px rgba(0,0,0,0.9); pointer-events: none; background: rgba(0,0,0,0.6); border-radius: 8px; backdrop-filter: blur(5px);}

            .tx-badge { position: absolute; transform: translate(-50%, -50%); z-index: 6; font-size: 0.8rem; font-weight: 900; font-family: var(--font-mono); padding: 4px 8px; border-radius: 6px; cursor: pointer; pointer-events: auto; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 5px 15px rgba(0,0,0,0.6); transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); color: black;}
            .tx-badge:hover { transform: translate(-50%, -50%) scale(1.3); filter: brightness(1.2); z-index: 100; border-color: white;}
            .tx-badge.ghost { opacity: 0.3; }

            .sim-badge {
                z-index: 100 !important;
                white-space: nowrap;
                padding: 6px 14px;
                font-size: 0.95rem;
                color: white !important;
                text-shadow: 0 1px 3px rgba(0,0,0,0.8);
                animation: simBadgeAnim 2.8s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
                box-shadow: 0 10px 30px rgba(0,0,0,0.8);
                border: 2px solid white;
            }

            .node-wrapper.flow-source .node-circle { border-color: var(--accent-orange) !important; box-shadow: 0 0 40px rgba(255, 171, 64, 0.6) !important; z-index: 20;}

            @keyframes dashAnim { to { stroke-dashoffset: -200; } }
            @keyframes pulseSick { 0% { box-shadow: 0 0 20px rgba(255, 82, 82, 0.5); } 100% { box-shadow: 0 0 50px rgba(255, 82, 82, 0.9); } }
            @keyframes drawCurveAnim { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
            @keyframes simBadgeAnim {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                10% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                20% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            }
        `;
    }

    setData(roles, flows) {
        this.nodes = roles || [];
        this.edges = flows || [];
        this.render();
    }

    render() {
        if (!this.canvas || !this.svg) return;
        this.forceSvgDimensions();
        this.renderNodes();
        
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.renderEdges();
            }, 100);
        });
    }

    renderNodes() {
        this.canvas.querySelectorAll('.node-wrapper').forEach(n => n.remove());
        const activeRoles = this.nodes.filter(r => !r.isArchived);
        const ghostRoles = this.nodes.filter(r => r.isArchived);
        
        const levelCounts = { '@anxaneta':0, '@aixecador':0, '@dosos':0, '@baixos':0, '@pinya':0 };

        const normalizeLevel = (lvl) => {
            if (!lvl) return '@baixos';
            let safe = lvl.toLowerCase().trim();
            if (!safe.startsWith('@')) safe = '@' + safe;
            if (safe.includes('anx')) return '@anxaneta';
            if (safe.includes('aix')) return '@aixecador';
            if (safe.includes('dos')) return '@dosos';
            if (safe.includes('baix')) return '@baixos';
            if (safe.includes('pin')) return '@pinya';
            return '@baixos';
        };

        const getInitialLayout = (level, totalInLevel, currentCount) => {
            const baseYLayout = { '@anxaneta': 15, '@aixecador': 32, '@dosos': 50, '@baixos': 68, '@pinya': 85 };
            const singleNodeX = { '@anxaneta': 50, '@aixecador': 25, '@dosos': 75, '@baixos': 25, '@pinya': 50 };
            
            let x = singleNodeX[level] || 50; 
            if (totalInLevel > 1) {
                const margin = 15;
                const step = (100 - margin * 2) / (totalInLevel - 1);
                x = margin + (step * currentCount);
            }

            let y = baseYLayout[level] || 50;
            if (totalInLevel > 2) {
                const middleIndex = (totalInLevel - 1) / 2;
                const distanceToCenter = Math.abs(currentCount - middleIndex);
                y += (distanceToCenter * 4); 
            } else if (totalInLevel === 2) {
                y += (currentCount === 0 ? -4 : 4);
                x = currentCount === 0 ? 30 : 70; 
            }

            x = Math.max(10, Math.min(x, 90));
            y = Math.max(12, Math.min(y, 88));

            return { x, y };
        };

        activeRoles.forEach(r => {
            const level = normalizeLevel(r.levelId);
            const totalInLevel = activeRoles.filter(role => normalizeLevel(role.levelId) === level).length;
            const pos = getInitialLayout(level, totalInLevel, levelCounts[level]);
            levelCounts[level]++;

            const topPos = r.customPos ? parseFloat(r.y) : pos.y;
            const leftPos = r.customPos ? parseFloat(r.x) : pos.x;

            const nodeDiv = this.buildNodeDOM(r, leftPos, topPos, false);
            this.canvas.appendChild(nodeDiv);
        });

        ghostRoles.forEach((r, i) => {
            const nodeDiv = this.buildNodeDOM(r, 10 + (i * 12), 90, true);
            this.canvas.appendChild(nodeDiv);
        });
    }

    buildNodeDOM(role, x, y, isGhost) {
        const levelSafe = role.levelId ? role.levelId.toLowerCase() : '';
        const color = MapRenderer.getColor(levelSafe);
        const icon = MapRenderer.getIcon(levelSafe);

        const nodeDiv = document.createElement('div');
        nodeDiv.className = `node-wrapper ${isGhost ? 'ghost-node' : ''}`;
        nodeDiv.dataset.id = role.id;
        nodeDiv.style.top = `${y}%`;
        nodeDiv.style.left = `${x}%`;

        nodeDiv.innerHTML = `
            <div class="node-circle">
                <div class="node-level-badge" style="color: ${isGhost ? '#666' : color}; border-color: ${isGhost ? '#666' : color};" title="${role.name}">${isGhost ? '👻' : icon}</div>
                <div class="node-fmv" style="color: ${isGhost ? '#666' : color};">${isGhost ? 'ARCH' : (role.fmv + '€')}</div>
                ${!isGhost ? `<div class="node-label-fmv">x${role.multiplier}</div>` : ''}
            </div>
            <div class="node-title">${role.name}</div>
        `;

        if (this.options.isEditMode) { nodeDiv.style.cursor = 'pointer'; }
        return nodeDiv;
    }

    renderEdges() {
        this.svg.innerHTML = '';
        this.canvas.querySelectorAll('.tx-badge').forEach(b => b.remove());
        this.edgeCoordinates = {}; 

        if (this.edges.length === 0) return;

        if (this.canvas.offsetWidth === 0 || this.canvas.offsetHeight === 0) {
            if (!this._retryCount) this._retryCount = 0;
            if (this._retryCount < 20) {
                this._retryCount++;
                setTimeout(() => this.renderEdges(), 50);
            }
            return;
        }
        this._retryCount = 0;

        let maxHours = 1;
        if (this.options.isHeatmap) {
            this.edges.forEach(tx => {
                const h = tx.total_hours_processed || 0;
                if (h > maxHours) maxHours = h;
            });
            this.options.maxHeat = maxHours;
        }

        const pairCounts = {};
        this.edges.forEach((tx, i) => {
            const key = tx.from < tx.to ? `${tx.from}-${tx.to}` : `${tx.to}-${tx.from}`;
            if (!pairCounts[key]) pairCounts[key] = [];
            pairCounts[key].push({ tx, index: i });
        });

        Object.keys(pairCounts).forEach(key => {
            const edgesGroup = pairCounts[key];
            edgesGroup.forEach((edgeData, multiIdx) => {
                this.drawSingleEdgeForCanvas(this.canvas, this.svg, edgeData.tx, edgeData.index, edgesGroup, multiIdx, this.options.isEditMode, this.options.maxHeat);
            });
        });
    }

    drawSingleEdgeForCanvas(canvas, pathsGroup, tx, index, edgesGroup, multiIdx, isEditCanvas, maxHours) {
        const dom1 = canvas.querySelector(`.node-wrapper[data-id="${tx.from}"]`);
        const dom2 = canvas.querySelector(`.node-wrapper[data-id="${tx.to}"]`);
        if (!dom1 || !dom2) return;

        const w = this.canvas.offsetWidth;
        const h = this.canvas.offsetHeight;
        
        const x1_center = (parseFloat(dom1.style.left) / 100) * w;
        const y1_center = (parseFloat(dom1.style.top) / 100) * h;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const suffix = isEditCanvas ? 'edit' : 'vis';
        let markerId = tx.tipo === 'tangible' ? `arrow-tangible-${suffix}` : `arrow-intangible-${suffix}`;
        const strokeHex = tx.tipo === 'tangible' ? '#00e676' : '#e040fb';
        
        path.setAttribute('class', `edge-line ${tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible'}`);
        path.style.stroke = strokeHex;

        let txX, txY;

        // 🔥 FIX: DIBUJADO DE BUCLES (SELF-LOOPS)
        if (tx.from === tx.to) {
            // Dibujamos un arco bonito por encima del nodo
            const loopRadiusX = 40;
            const loopRadiusY = 60;
            
            const startX = x1_center - 15;
            const startY = y1_center - 30;
            const endX = x1_center + 15;
            const endY = y1_center - 30;
            
            // Incrementamos el offset si hay varios bucles en el mismo nodo
            const offset = multiIdx * 15;
            
            path.setAttribute('d', `M ${startX} ${startY} C ${x1_center - loopRadiusX - offset} ${y1_center - loopRadiusY - offset}, ${x1_center + loopRadiusX + offset} ${y1_center - loopRadiusY - offset}, ${endX} ${endY}`);
            
            txX = x1_center;
            txY = y1_center - loopRadiusY + 10 - offset;
            
            this.edgeCoordinates[index] = { isLoop: true, startX, startY, endX, endY, cx: x1_center, cy: y1_center - loopRadiusY - offset };
        } 
        else {
            // Lógica normal de nodo A a nodo B
            const x2_center = (parseFloat(dom2.style.left) / 100) * w;
            const y2_center = (parseFloat(dom2.style.top) / 100) * h;

            const dx = x2_center - x1_center, dy = y2_center - y1_center;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const trim = 45; 
            let x1 = x1_center, y1 = y1_center, x2 = x2_center, y2 = y2_center;

            if (dist > trim) {
                x1 = x1_center + (dx/dist) * trim; y1 = y1_center + (dy/dist) * trim;
                x2 = x2_center - (dx/dist) * trim; y2 = y2_center - (dy/dist) * trim;
            }

            const nx = -dy / dist, ny = dx / dist;
            let offset = 0;
            
            if (edgesGroup.length > 1) {
                const step = 40; 
                offset = (multiIdx % 2 !== 0 ? 1 : -1) * Math.ceil(multiIdx / 2) * step;
                if (tx.from > tx.to) offset = -offset;
            }

            const cx = (x1_center + x2_center) / 2 + nx * offset;
            const cy = (y1_center + y2_center) / 2 + ny * offset;

            this.edgeCoordinates[index] = { x1, y1, cx, cy, x2, y2, isLoop: false };

            path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
            
            txX = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
            txY = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
        }
        
        if (this.options.isHeatmap && !isEditCanvas) {
            const hProcessed = tx.total_hours_processed || 0;
            const normalizedWidth = 3 + (hProcessed / maxHours) * 15;
            path.style.strokeWidth = `${normalizedWidth}px`;
            path.style.opacity = hProcessed > 0 ? 0.9 : 0.15;
            if (normalizedWidth < 10) path.setAttribute('marker-end', `url(#${markerId})`);
        } else {
            path.setAttribute('marker-end', `url(#${markerId})`);
        }
        
        if (dom1.classList.contains('ghost-node') || dom2.classList.contains('ghost-node')) {
            path.style.opacity = '0.2';
        }
        pathsGroup.appendChild(path);

        const badge = document.createElement('div');
        badge.className = 'tx-badge';
        if (dom1.classList.contains('ghost-node') || dom2.classList.contains('ghost-node')) badge.classList.add('ghost');
        
        badge.style.left = `${txX}px`;
        badge.style.top = `${txY}px`;
        badge.style.backgroundColor = strokeHex;
        badge.dataset.idx = index;
        
        if (this.options.isHeatmap && !isEditCanvas) {
            const h = tx.total_hours_processed || 0;
            badge.innerText = `${h}h`;
            badge.style.borderRadius = '50%';
            badge.style.width = '30px';
            badge.style.height = '30px';
            badge.style.display = 'flex';
            badge.style.justifyContent = 'center';
            badge.style.alignItems = 'center';
            badge.style.opacity = h > 0 ? 1 : 0.3;
        } else {
            badge.innerText = `[${index + 1}]`;
        }
        
        if (this.options.onEdgeClick && isEditCanvas) {
            badge.addEventListener('click', (e) => this.options.onEdgeClick(index, e));
        }
        canvas.appendChild(badge);
    }

    drawAnimatedSimulationLine(tx, index, isSick) {
        const coords = this.edgeCoordinates[index];
        if (!coords) return null; 

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let markerId = isSick ? 'arrow-sick-vis' : (tx.tipo === 'tangible' ? 'arrow-tangible-vis' : 'arrow-intangible-vis');
        path.setAttribute('marker-end', `url(#${markerId})`);
        const strokeColor = isSick ? '#ff5252' : (tx.tipo === 'tangible' ? '#00e676' : '#e040fb');
        path.style.cssText = `fill: none; stroke: ${strokeColor}; stroke-width: 5; stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawCurveAnim 1.5s ease-out forwards; filter: drop-shadow(0 0 10px ${strokeColor});`;
        
        let txX, txY;

        if (coords.isLoop) {
            const { startX, startY, endX, endY, cx, cy } = coords;
            path.setAttribute('d', `M ${startX} ${startY} C ${cx - 40} ${cy}, ${cx + 40} ${cy}, ${endX} ${endY}`);
            txX = cx; txY = cy + 10;
        } else {
            const { x1, y1, cx, cy, x2, y2 } = coords;
            path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
            txX = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
            txY = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
        }

        this.svg.appendChild(path);

        const badge = document.createElement('div');
        badge.className = 'tx-badge sim-badge';
        badge.style.left = `${txX}px`;
        badge.style.top = `${txY}px`;
        badge.style.backgroundColor = strokeColor;
        
        const stepName = tx.template || tx.entregable || 'SOP VNA';
        badge.innerHTML = `<span style="background:rgba(0,0,0,0.5); padding:2px 6px; border-radius:4px; margin-right:5px;">${index + 1}</span> ${stepName}`;
        this.canvas.appendChild(badge);

        setTimeout(() => { if (badge && badge.parentNode) badge.remove(); }, 2700);
        return { x: txX, y: txY, color: strokeColor };
    }

    drawTempLine(fromId, mouseX, mouseY, zoom = 1) {
        const originNode = this.canvas.querySelector(`.node-wrapper[data-id="${fromId}"]`);
        if (!originNode) return;
        const canvRect = this.canvas.getBoundingClientRect();
        const targetX = (mouseX - canvRect.left) / zoom;
        const targetY = (mouseY - canvRect.top) / zoom;

        let tempLine = this.svg.querySelector('.edge-temp');
        if (!tempLine) {
            tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tempLine.setAttribute('class', 'edge-temp');
            tempLine.setAttribute('marker-end', 'url(#arrow-temp-edit)');
            this.svg.appendChild(tempLine);
        }
        tempLine.setAttribute('x1', originNode.offsetLeft); tempLine.setAttribute('y1', originNode.offsetTop);
        tempLine.setAttribute('x2', targetX); tempLine.setAttribute('y2', targetY);
    }

    clearTempLine() {
        const tempLine = this.svg.querySelector('.edge-temp');
        if (tempLine) tempLine.remove();
    }

    initEvents() {
        this.canvas.addEventListener('click', (e) => {
            const node = e.target.closest('.node-wrapper');
            if (node) this.options.onNodeClick(node.dataset.id, e);
        });

        if (this.options.isEditMode) {
            this.canvas.addEventListener('mousedown', (e) => {
                if (window.innerWidth <= 768) return; 
                const node = e.target.closest('.node-wrapper');
                if (node) {
                    this.isDragging = true;
                    this.hasMoved = false;
                    this.draggedNode = node;
                    node.style.zIndex = 1000;
                }
            });

            window.addEventListener('mousemove', (e) => {
                if (this.isDragging && this.draggedNode) {
                    this.hasMoved = true;
                    const rect = this.canvas.getBoundingClientRect();
                    let newX = ((e.clientX - rect.left) / rect.width) * 100;
                    let newY = ((e.clientY - rect.top) / rect.height) * 100;
                    newX = Math.max(5, Math.min(newX, 95));
                    newY = Math.max(12, Math.min(newY, 88)); 
                    
                    this.draggedNode.style.left = `${newX}%`;
                    this.draggedNode.style.top = `${newY}%`;
                    this.renderEdges(); 
                }
            });

            window.addEventListener('mouseup', async (e) => {
                if (this.isDragging && this.draggedNode) {
                    this.isDragging = false;
                    this.draggedNode.style.zIndex = this.draggedNode.classList.contains('ghost-node') ? 1 : 5;
                    
                    if (this.hasMoved) {
                        const newX = parseFloat(this.draggedNode.style.left);
                        const newY = parseFloat(this.draggedNode.style.top);
                        const nodeId = this.draggedNode.dataset.id;
                        
                        this.options.onNodeDrop(nodeId, newX, newY);

                        const state = store.getState();
                        const project = state.projects.find(p => p.roles && p.roles.some(r => r.id === nodeId));
                        if (project) {
                            const updatedRoles = project.roles.map(r => 
                                r.id === nodeId ? { ...r, x: newX, y: newY, customPos: true } : r
                            );
                            await store.dispatch({
                                type: 'UPDATE_PROJECT_INFO',
                                payload: { projectId: project.id, updates: { roles: updatedRoles } }
                            });
                        }
                    }
                    this.draggedNode = null;
                }
            });
        }
    }
}
