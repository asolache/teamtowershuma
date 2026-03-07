// v5/js/views/ValueMapView.js
import { store } from '../core/store.js';

export default class ValueMapView {
    constructor() {
        document.title = "Value Network Analysis | TeamTowers";
        this.activeProjectId = null;
        this.selectedRoleId = null;
        this.isDragging = false;
        this.draggedElement = null;
    }

    async getHtml() {
        return `
            <style>
                .vna-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: var(--bg-base); font-family: 'Segoe UI', sans-serif; }
                
                /* LIENZO PRINCIPAL */
                .map-container { flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; }
                
                .map-canvas { 
                    flex: 1; position: relative; width: 100%; height: 100%; 
                    background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0);
                    background-size: 40px 40px;
                }
                
                #edges-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
                
                .edge-line { fill: none; stroke-width: 2.5; opacity: 0.7; transition: stroke-width 0.3s; }
                .edge-tangible { stroke: var(--accent-green); }
                .edge-intangible { stroke: var(--accent-purple); stroke-dasharray: 8, 8; animation: dashAnim 20s linear infinite; }
                
                @keyframes dashAnim { to { stroke-dashoffset: -1000; } }

                /* NODOS */
                .node {
                    position: absolute; z-index: 5; border-radius: 50%;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    text-align: center; cursor: grab; transition: transform 0.2s, box-shadow 0.3s, border-color 0.3s;
                    background: rgba(15, 15, 25, 0.8); backdrop-filter: blur(12px); border: 2px solid var(--glass-border);
                    color: white; font-weight: bold; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    transform: translate(-50%, -50%); user-select: none;
                }
                .node:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.05); }
                .node.selected { border-color: var(--accent-blue) !important; box-shadow: 0 0 30px rgba(0, 176, 255, 0.4); z-index: 10; }
                .node-name { font-size: 0.7rem; margin-top: 4px; pointer-events: none; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1; width: 80%; }
                .node-value { font-size: 0.65rem; color: var(--accent-green); pointer-events: none; font-family: monospace; margin-top: 4px; opacity: 0.9; }

                /* UI OVERLAYS */
                .map-ui-overlay { position: absolute; top: 0; left: 0; width: 100%; padding: 1.5rem 2rem; z-index: 100; pointer-events: none; display: flex; justify-content: space-between; align-items: flex-start; }
                .ui-left, .ui-right { pointer-events: auto; }

                .diagnosis-panel {
                    position: absolute; bottom: 25px; left: 25px; z-index: 10; width: 320px;
                    background: rgba(10, 10, 15, 0.9); border: 1px solid var(--glass-border); backdrop-filter: blur(20px);
                    border-radius: 16px; padding: 1.5rem; box-shadow: 0 15px 50px rgba(0,0,0,0.8);
                }

                /* INSPECTOR */
                .inspector-panel {
                    width: 380px; background: rgba(10, 10, 15, 0.98); border-left: 1px solid var(--glass-border);
                    display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    z-index: 1000; backdrop-filter: blur(30px);
                }
                .inspector-panel.open { transform: translateX(0); }
                .inspector-header { padding: 2rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; }
                
                .form-control { width: 100%; background: #000; border: 1px solid #333; color: white; padding: 14px; border-radius: 8px; font-family: monospace; font-size: 1.1rem; margin-top: 5px; }
                .form-control:focus { border-color: var(--accent-blue); outline: none; }

                .metric-card { background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05); }

                @keyframes pulseNode { 0% { box-shadow: 0 0 0 0 rgba(0, 176, 255, 0.7); } 100% { box-shadow: 0 0 0 20px rgba(0, 176, 255, 0); } }
            </style>

            <div class="vna-layout">
                <div class="map-container">
                    <div class="map-ui-overlay">
                        <div class="ui-left">
                            <a href="/v5/project" class="btn btn-outline" data-link style="background: rgba(0,0,0,0.5);">&larr; Volver al Kanban</a>
                            <div style="margin-top: 20px;">
                                <h1 id="mapTitle" style="font-size: 2rem; margin: 0; letter-spacing: -1px;">Cargando...</h1>
                                <p style="color: var(--text-muted); font-size: 0.85rem;">Arquetipo: <span id="mapArchetype" class="badge">--</span></p>
                            </div>
                        </div>
                        <div class="ui-right">
                            <button class="btn btn-primary" id="btnSimulateTx" style="box-shadow: 0 0 20px rgba(0, 176, 255, 0.3);">✨ Simular Transacción</button>
                        </div>
                    </div>

                    <div class="map-canvas" id="mapCanvas">
                        <svg id="edges-svg"></svg>
                    </div>

                    <div class="diagnosis-panel">
                        <h3 style="font-size: 0.8rem; color: var(--accent-blue); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;">Diagnóstico de Flujo</h3>
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
                            <span style="font-size: 0.8rem; color: var(--text-muted);">Maturity Index</span>
                            <span id="maturityScore" style="font-size: 1.2rem; font-weight: bold; font-family: monospace;">--%</span>
                        </div>
                        <div id="alertsContainer"></div>
                    </div>
                </div>

                <aside class="inspector-panel" id="inspectorPanel">
                    <div class="inspector-header">
                        <h2 id="insName" style="font-size: 1.4rem;">Configurar Nodo</h2>
                        <button id="btnCloseInspector" style="background: transparent; border: none; color: #555; cursor: pointer; font-size: 2rem;">&times;</button>
                    </div>
                    <div class="inspector-body" id="inspectorBody" style="display: none;">
                        <span class="badge" id="insLevel" style="margin-bottom: 2rem;">@rol</span>
                        
                        <div class="metric-card">
                            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Slices Totales (Equity)</div>
                            <div class="metric-value" id="insEquity" style="font-size: 2.5rem; font-weight: 800; color: var(--accent-green); font-family: monospace;">0</div>
                        </div>

                        <div class="form-group">
                            <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Valor Hora Mercado (FMV)</label>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <input type="number" id="inputFmv" class="form-control">
                                <span style="color: #444;">€/h</span>
                            </div>
                        </div>

                        <div class="form-group" style="margin-top: 1.5rem;">
                            <label style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Multiplicador Slicing Pie</label>
                            <input type="number" step="0.1" id="inputMult" class="form-control">
                        </div>

                        <button class="btn btn-primary" id="btnSaveRole" style="width: 100%; margin-top: 2rem; padding: 1.2rem;">✓ Actualizar Parámetros</button>
                    </div>
                </aside>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        let project = state.projects[state.projects.length - 1];

        if (!project) {
            store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'ecosystem-admin' } });
            store.dispatch({ type: 'ADD_PROJECT', payload: { id: 'vna-demo', nombre: 'NeoApp VNA System', sector: 'software', archetype: 'startup' } });
            project = store.getState().projects.find(p => p.id === 'vna-demo');
        }

        this.activeProjectId = project.id;
        this.dom = {
            title: document.getElementById('mapTitle'),
            archetype: document.getElementById('mapArchetype'),
            canvas: document.getElementById('mapCanvas'),
            svg: document.getElementById('edges-svg'),
            inspector: document.getElementById('inspectorPanel'),
            insBody: document.getElementById('inspectorBody'),
            btnClose: document.getElementById('btnCloseInspector'),
            btnSave: document.getElementById('btnSaveRole'),
            maturityScore: document.getElementById('maturityScore'),
            alertsContainer: document.getElementById('alertsContainer'),
            btnSimulateTx: document.getElementById('btnSimulateTx')
        };

        this.updateHeader();
        this.renderMap();
        this.updateDiagnosis();

        // RE-DIBUJAR AL CAMBIAR TAMAÑO
        window.addEventListener('resize', () => this.drawEdges());

        this.dom.btnClose.addEventListener('click', () => {
            this.dom.inspector.classList.remove('open');
            this.selectedRoleId = null;
            this.renderMap();
        });

        this.dom.btnSave.addEventListener('click', () => {
            const newFmv = parseFloat(document.getElementById('inputFmv').value);
            const newMult = parseFloat(document.getElementById('inputMult').value);
            store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId, field: 'fmv', value: newFmv } });
            store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId, field: 'multiplier', value: newMult } });
            this.renderMap();
            this.dom.btnSave.innerText = "¡Actualizado!";
            setTimeout(() => this.dom.btnSave.innerText = "Actualizar Parámetros", 2000);
        });

        this.dom.btnSimulateTx.addEventListener('click', () => {
            this.simulateValueFlow();
        });

        // MOTOR DE ARRASTRE (DRAG)
        this.dom.canvas.addEventListener('mousedown', (e) => this.startDrag(e));
        window.addEventListener('mousemove', (e) => this.doDrag(e));
        window.addEventListener('mouseup', () => this.stopDrag());
    }

    startDrag(e) {
        const node = e.target.closest('.node');
        if (node) {
            this.isDragging = true;
            this.draggedElement = node;
            node.style.zIndex = 1000;
        }
    }

    doDrag(e) {
        if (!this.isDragging || !this.draggedElement) return;
        const rect = this.dom.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        this.draggedElement.style.left = `${x}%`;
        this.draggedElement.style.top = `${y}%`;
        this.drawEdges(); // Recalcular líneas en vivo
    }

    stopDrag() {
        if (this.draggedElement) this.draggedElement.style.zIndex = 5;
        this.isDragging = false;
        this.draggedElement = null;
    }

    simulateValueFlow() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if(p.roles.length < 2) return;
        
        const r1 = p.roles[Math.floor(Math.random() * p.roles.length)];
        const r2 = p.roles.filter(r => r.id !== r1.id)[Math.floor(Math.random() * (p.roles.length - 1))];
        const esTangible = Math.random() > 0.4;
        const desc = esTangible ? ['Diseño UI', 'Código API', 'Contrato'] : ['Feedback', 'Mentoría', 'Estrategia'];
        const horas = Math.floor(Math.random() * 5) + 1;
        const hash = '0x' + Math.random().toString(16).slice(2, 10);

        store.dispatch({ 
            type: 'ADD_TRANSACTION', 
            payload: { projectId: this.activeProjectId, tx: { hash, from: r1.id, to: r2.id, horas, entregable: desc[Math.floor(Math.random()*desc.length)], tipo: esTangible ? 'tangible' : 'intangible', status: 'approved' } } 
        });
        store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: this.activeProjectId, txHash: hash } });

        // Animación visual de pulso en el emisor
        if(r1._dom) {
            r1._dom.style.animation = 'pulseNode 1s ease-out';
            setTimeout(() => r1._dom.style.animation = '', 1000);
        }

        this.renderMap();
        this.updateDiagnosis();
    }

    updateHeader() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        this.dom.title.innerText = p.nombre;
        this.dom.archetype.innerText = p.archetype.toUpperCase();
    }

    renderMap() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const harvest = store.calculateHarvest(this.activeProjectId);
        
        // No borramos todo para no romper el drag; actualizamos si ya existen
        const existingNodes = document.querySelectorAll('.node');
        const nodesData = {};
        existingNodes.forEach(n => nodesData[n.dataset.id] = { left: n.style.left, top: n.style.top });
        
        existingNodes.forEach(n => n.remove());

        const layoutMap = {
            '@anxaneta': { x: 50, y: 15 },
            '@aixecador': { x: 50, y: 35 },
            '@dosos': { x: 35, y: 55 },
            '@baixos': { x: 65, y: 55 },
            '@pinya': { x: 50, y: 80 }
        };

        const levelCounts = {};

        p.roles.forEach((rol) => {
            const level = rol.levelId;
            levelCounts[level] = (levelCounts[level] || 0) + 1;
            const hData = harvest.find(h => h.roleId === rol.id);
            const totalVal = hData ? hData.totalValue : 0;
            const finalSize = 85 + Math.min(totalVal / 10, 70);

            const nodeEl = document.createElement('div');
            nodeEl.className = `node ${this.selectedRoleId === rol.id ? 'selected' : ''}`;
            nodeEl.dataset.id = rol.id;
            nodeEl.style.width = `${finalSize}px`;
            nodeEl.style.height = `${finalSize}px`;
            
            // Si el nodo ya existía (fue movido), respetamos su posición
            if (nodesData[rol.id]) {
                nodeEl.style.left = nodesData[rol.id].left;
                nodeEl.style.top = nodesData[rol.id].top;
            } else {
                let pos = { ...layoutMap[level] } || { x: 50, y: 50 };
                if (levelCounts[level] > 1) pos.x += (levelCounts[level] - 1) * 20 - 10;
                nodeEl.style.left = `${pos.x}%`;
                nodeEl.style.top = `${pos.y}%`;
            }

            nodeEl.style.borderColor = this.getColorForLevel(rol.levelId);
            if(!(p.asignaciones?.find(a => a.roleId === rol.id))) nodeEl.style.opacity = '0.6';

            nodeEl.innerHTML = `
                <div style="font-size: 1.4rem;">${this.getIconForLevel(rol.levelId)}</div>
                <div class="node-name">${rol.name}</div>
                <div class="node-value">${totalVal} ${p.archetype === 'startup' ? 'Slices' : '€'}</div>
            `;

            nodeEl.addEventListener('click', (e) => {
                if(this.isDragging) return;
                this.selectedRoleId = rol.id;
                this.renderMap();
                this.openInspector(rol, totalVal, p.archetype === 'startup' ? 'Slices' : '€', this.getColorForLevel(rol.levelId));
            });

            rol._dom = nodeEl;
            this.dom.canvas.appendChild(nodeEl);
        });

        setTimeout(() => this.drawEdges(), 50);
    }

    drawEdges() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        this.dom.svg.innerHTML = ''; 
        if(!p.transactions) return;

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `<marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="context-stroke"/></marker>`;
        this.dom.svg.appendChild(defs);

        p.transactions.forEach(tx => {
            const rFrom = p.roles.find(r => r.id === tx.from);
            const rTo = p.roles.find(r => r.id === tx.to);
            if(rFrom?._dom && rTo?._dom && rFrom.id !== rTo.id) {
                const rectF = rFrom._dom.getBoundingClientRect();
                const rectT = rTo._dom.getBoundingClientRect();
                const canvas = this.dom.canvas.getBoundingClientRect();

                const x1 = rectF.left + rectF.width/2 - canvas.left;
                const y1 = rectF.top + rectF.height/2 - canvas.top;
                const x2 = rectT.left + rectT.width/2 - canvas.left;
                const y2 = rectT.top + rectT.height/2 - canvas.top;

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1); line.setAttribute('y1', y1);
                line.setAttribute('x2', x2); line.setAttribute('y2', y2);
                line.setAttribute('marker-end', 'url(#arrow)');
                line.classList.add('edge-line', tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible');
                this.dom.svg.appendChild(line);

                const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                txt.setAttribute('x', (x1+x2)/2); txt.setAttribute('y', (y1+y2)/2 - 10);
                txt.setAttribute('text-anchor', 'middle');
                txt.style.cssText = `fill:${tx.tipo==='tangible'?'#00e676':'#e040fb'};font-size:9px;font-weight:bold;font-family:monospace;paint-order:stroke;stroke:black;stroke-width:4px;text-transform:uppercase;`;
                txt.textContent = tx.entregable;
                this.dom.svg.appendChild(txt);
            }
        });
    }

    openInspector(rol, val, mon, col) {
        this.dom.inspector.classList.add('open');
        this.dom.insBody.style.display = 'block';
        document.getElementById('insName').innerText = rol.name;
        const b = document.getElementById('insLevel');
        b.innerText = rol.levelId; b.style.color = col; b.style.borderColor = col;
        document.getElementById('insEquity').innerText = `${val} ${mon}`;
        document.getElementById('inputFmv').value = rol.fmv || 0;
        document.getElementById('inputMult').value = rol.multiplier || 1.0;
    }

    updateDiagnosis() {
        const m = store.calculateMaturityIndex(this.activeProjectId);
        this.dom.maturityScore.innerText = `${m.score}%`;
        this.dom.maturityScore.style.color = m.score > 70 ? '#00e676' : (m.score > 40 ? '#ff9100' : '#ff5252');
        this.dom.alertsContainer.innerHTML = m.alerts.length === 0 ? `<div class="alert-item alert-ok">Flujo Óptimo: La red tiene una estructura de Castell equilibrada.</div>` : m.alerts.map(a => `<div class="alert-item alert-warning">⚠️ ${a}</div>`).join('');
    }

    getIconForLevel(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }
    getColorForLevel(l) { return { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' }[l] || '#fff'; }
}
