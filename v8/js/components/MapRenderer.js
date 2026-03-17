// v8/js/components/MapRenderer.js
/**
 * Componente UI Universal: MapRenderer (V9)
 * Renderiza topologías de valor (VNA) usando nodos HTML y arcos SVG.
 * Aplicable en Dashboard (Macro-VNA), ValueMap (Full) y ProjectCreator (Mini).
 */

export const MapRenderer = {
    // Diccionarios Visuales
    colors: { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': '#7c4dff', '@pinya': 'var(--accent-blue)' },
    icons: { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' },
    
    getColor(level) { return this.colors[level] || '#aaa'; },
    getIcon(level) { return this.icons[level] || '💠'; },

    /**
     * Renderiza una topología de VNA completa en un contenedor dado.
     * @param {HTMLElement} container - El <div> que contendrá los nodos y el SVG.
     * @param {HTMLElement} pathsGroup - El <g> dentro del SVG donde irán las líneas.
     * @param {Array} roles - Lista de nodos (ej. { id: 'x', levelId: '@baixos', x: 50, y: 50, ... })
     * @param {Array} flows - Lista de aristas (ej. { from: 'x', to: 'y', tipo: 'tangible', ... })
     * @param {Object} options - Configuración de renderizado { isEditMode, isHeatmap, isMacro, onNodeClick, onEdgeClick, maxHeat }
     */
    renderMap(container, pathsGroup, roles, flows, options = {}) {
        if (!container || !pathsGroup || !roles) return;

        // 1. Limpiar Lienzo
        container.querySelectorAll('.node-wrapper, .tx-badge, .sim-tx-badge').forEach(n => n.remove());
        pathsGroup.innerHTML = '';

        const levelCounts = { '@anxaneta': 0, '@aixecador': 0, '@dosos': 0, '@baixos': 0, '@pinya': 0 };
        const activeRoles = roles.filter(r => !r.isArchived);
        const ghostRoles = roles.filter(r => r.isArchived);

        // 2. Layout Estructural (Si no tienen coords x,y predefinidas)
        activeRoles.forEach(r => {
            const level = r.levelId || '@baixos';
            const totalInLevel = activeRoles.filter(role => role.levelId === level).length;
            
            let topPos = r.y;
            let leftPos = r.x;

            if (topPos === undefined || leftPos === undefined) {
                const baseLayout = { '@anxaneta': 15, '@aixecador': 35, '@dosos': 55, '@baixos': 75, '@pinya': 90 };
                topPos = baseLayout[level] || 50;
                leftPos = 50;
                
                if (totalInLevel > 1) {
                    const step = 80 / (totalInLevel - 1);
                    leftPos = 10 + (step * levelCounts[level]);
                }
                // Micro-oscilación vertical para evitar solapamientos de flechas
                topPos += (levelCounts[level] % 2 === 0 ? -3 : 3);
            }

            levelCounts[level]++;

            const nodeDiv = this.createNodeElement(r, leftPos, topPos, false, options);
            container.appendChild(nodeDiv);
        });

        // 3. Nodos Archivados (Fantasmas en la parte inferior)
        ghostRoles.forEach((r, i) => {
            const nodeDiv = this.createNodeElement(r, 10 + (i * 10), 90, true, options);
            container.appendChild(nodeDiv);
        });

        // 4. Dibujar Arcos (Edges)
        if (!flows || flows.length === 0) return;

        // Agrupación de arcos paralelos (Multigrafo)
        const pairCounts = {};
        flows.forEach((tx, i) => {
            const key = tx.from < tx.to ? `${tx.from}-${tx.to}` : `${tx.to}-${tx.from}`;
            if (!pairCounts[key]) pairCounts[key] = [];
            pairCounts[key].push({ tx, index: i });
        });

        // setTimeout permite que el DOM posicione los nodos antes de calcular las líneas SVG
        setTimeout(() => {
            Object.keys(pairCounts).forEach(key => {
                const edgesGroup = pairCounts[key];
                edgesGroup.forEach((edgeData, multiIdx) => {
                    this.drawEdge(container, pathsGroup, edgeData.tx, edgeData.index, edgesGroup, multiIdx, options);
                });
            });
        }, 100);
    },

    // Generador HTML del Nodo
    createNodeElement(role, x, y, isGhost, options) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = `node-wrapper ${isGhost ? 'ghost-node' : ''}`;
        nodeDiv.dataset.id = role.id;
        nodeDiv.style.top = `${y}%`;
        nodeDiv.style.left = `${x}%`;

        if (options.isMacro) {
            // Renderizado simplificado para el Macro-VNA
            nodeDiv.innerHTML = `
                <div class="node-circle" style="border-color:${role.color}; box-shadow: 0 0 35px ${role.color}50;">
                    <div class="node-icon">${role.icon}</div>
                    ${role.desc ? `<div class="node-desc">${role.desc}</div>` : ''}
                </div>
                <div class="node-title">${role.label || role.name}</div>
            `;
        } else {
            // Renderizado completo para el Canvas V8/V9
            const color = this.getColor(role.levelId);
            const icon = this.getIcon(role.levelId);
            nodeDiv.innerHTML = `
                <div class="node-circle">
                    <div class="node-level-badge" style="color: ${isGhost ? '#666' : color}; border-color: ${isGhost ? '#666' : color};" title="${role.name}">${isGhost ? '👻' : icon}</div>
                    <div class="node-fmv" style="color: ${isGhost ? '#666' : color};">${isGhost ? 'ARCH' : (role.fmv + '€')}</div>
                    ${!isGhost ? `<div class="node-label-fmv">x${role.multiplier}</div>` : ''}
                </div>
                <div class="node-title">${role.name}</div>
            `;
        }

        // Eventos
        if (options.onNodeClick) {
            nodeDiv.addEventListener('click', (e) => options.onNodeClick(role.id, e));
        }

        return nodeDiv;
    },

    // Trazador Matemático de Líneas SVG (Curvas Cuadráticas Bezier)
    drawEdge(container, pathsGroup, tx, originalIndex, edgesGroup, multiIdx, options) {
        const dom1 = container.querySelector(`.node-wrapper[data-id="${tx.from}"]`);
        const dom2 = container.querySelector(`.node-wrapper[data-id="${tx.to}"]`);
        if (!dom1 || !dom2 || tx.from === tx.to) return;

        const x1_center = dom1.offsetLeft;
        const y1_center = dom1.offsetTop;
        const x2_center = dom2.offsetLeft;
        const y2_center = dom2.offsetTop;

        const dx = x2_center - x1_center;
        const dy = y2_center - y1_center;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Recorte para que la flecha termine en el borde del nodo, no en el centro
        const trim = options.trimSize || 50; 
        let x1 = x1_center, y1 = y1_center, x2 = x2_center, y2 = y2_center;

        if (dist > trim) {
            x1 = x1_center + (dx/dist) * trim;
            y1 = y1_center + (dy/dist) * trim;
            x2 = x2_center - (dx/dist) * trim;
            y2 = y2_center - (dy/dist) * trim;
        }

        // Vectores normales para curvar la línea si hay múltiples flujos entre los mismos nodos
        const nx = -dy / dist; 
        const ny = dx / dist;
        let offset = 0;
        
        if (edgesGroup.length > 1) {
            const step = options.curveStep || 60; 
            if (multiIdx % 2 !== 0) {
                offset = Math.ceil(multiIdx / 2) * step;
            } else {
                offset = -(Math.ceil(multiIdx / 2) * step);
            }
            if (tx.from > tx.to) offset = -offset;
        }

        const cx = (x1_center + x2_center) / 2 + nx * offset;
        const cy = (y1_center + y2_center) / 2 + ny * offset;

        // Trazado de Path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
        
        const isTangible = tx.tipo === 'tangible';
        const lineClass = isTangible ? 'edge-tangible' : 'edge-intangible';
        path.setAttribute('class', `edge-line ${lineClass}`);
        
        const strokeHex = isTangible ? '#00e676' : '#e040fb';
        path.style.stroke = strokeHex;
        
        // Suffix dinámico para los marcadores (edit, vis, macro, etc.)
        const markerSuffix = options.markerSuffix || 'vis';
        const markerId = isTangible ? `arrow-tangible-${markerSuffix}` : `arrow-intangible-${markerSuffix}`;

        // Lógica de Heatmap
        if (options.isHeatmap) {
            const hProcessed = tx.total_hours_processed || 0;
            const maxH = options.maxHeat || 1;
            const normalizedWidth = 3 + (hProcessed / maxH) * 15;
            const opac = hProcessed > 0 ? 0.9 : 0.15;
            
            path.style.strokeWidth = `${normalizedWidth}px`;
            path.style.opacity = opac;
            
            if (normalizedWidth < 10) path.setAttribute('marker-end', `url(#${markerId})`);
        } else {
            path.setAttribute('marker-end', `url(#${markerId})`);
        }
        
        if (dom1.classList.contains('ghost-node') || dom2.classList.contains('ghost-node')) {
            path.style.opacity = '0.2';
        }
        
        pathsGroup.appendChild(path);

        // --- Renderizado del Badge sobre la curva ---
        // Fórmula de Bezier para encontrar el punto medio exacto de la curva Q
        let t = 0.5; 
        if (edgesGroup.length > 1 && options.spreadBadges) {
            const spreadFactor = 0.3; 
            t = 0.5 + ((multiIdx / (edgesGroup.length - 1)) - 0.5) * spreadFactor;
        }

        const omt = 1 - t;
        const omt2 = omt * omt;
        const t2 = t * t;
        const txX = omt2 * x1 + 2 * omt * t * cx + t2 * x2;
        const txY = omt2 * y1 + 2 * omt * t * cy + t2 * y2;

        const badge = document.createElement('div');
        badge.className = 'tx-badge';
        if (dom1.classList.contains('ghost-node') || dom2.classList.contains('ghost-node')) badge.classList.add('ghost');
        
        badge.style.left = `${txX}px`;
        badge.style.top = `${txY}px`;
        badge.style.backgroundColor = strokeHex;
        badge.setAttribute('data-idx', originalIndex);
        
        if (options.isHeatmap) {
            const h = tx.total_hours_processed || 0;
            badge.innerText = `${h}h`;
            badge.style.borderRadius = '50%';
            badge.style.width = '30px';
            badge.style.height = '30px';
            badge.style.display = 'flex';
            badge.style.justifyContent = 'center';
            badge.style.alignItems = 'center';
            badge.style.opacity = h > 0 ? 1 : 0.3;
        } else if (options.isMacro) {
            badge.innerHTML = `<span class="tx-order">${originalIndex + 1}.</span> ${tx.label}`;
        } else {
            badge.innerText = `[${originalIndex + 1}]`;
        }
        
        if (options.onEdgeClick) {
            badge.addEventListener('click', (e) => options.onEdgeClick(originalIndex, e));
        }
        
        container.appendChild(badge);
    }
};
