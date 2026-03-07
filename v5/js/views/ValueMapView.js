// v5/js/views/ValueMapView.js
import { store } from '../core/store.js';

export default class ValueMapView {
    constructor() {
        document.title = "Value Network Analysis | TeamTowers";
        this.activeProjectId = null;
        this.selectedRoleId = null;
    }

    async getHtml() {
        return `
            <style>
                .vna-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: var(--bg-base); }
                
                /* LIENZO PRINCIPAL */
                .map-container { flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; }
                .map-header { padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; z-index: 10; background: linear-gradient(to bottom, rgba(10,10,12,0.9), transparent); }
                
                .map-canvas { flex: 1; position: relative; width: 100%; height: 100%; }
                
                /* SVG PARA LÍNEAS DE CONEXIÓN */
                #edges-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
                .edge-line { fill: none; stroke-width: 2; opacity: 0.7; animation: dashAnim 30s linear infinite; }
                .edge-tangible { stroke: var(--accent-green); }
                .edge-intangible { stroke: var(--accent-purple); stroke-dasharray: 8, 8; }
                @keyframes dashAnim { to { stroke-dashoffset: -1000; } }

                /* NODOS DEL CASTELL */
                .node {
                    position: absolute; z-index: 2; border-radius: 50%;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    text-align: center; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s, left 0.5s, top 0.5s;
                    background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 2px solid var(--glass-border);
                    color: white; font-weight: bold; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                    transform: translate(-50%, -50%);
                }
                .node:hover { transform: translate(-50%, -50%) scale(1.1); z-index: 10; }
                .node.selected { border-color: var(--accent-blue); box-shadow: 0 0 25px rgba(0, 176, 255, 0.4); }
                .node-name { font-size: 0.75rem; margin-top: 5px; pointer-events: none; line-height: 1.1; padding: 0 5px; }
                .node-value { font-size: 0.65rem; color: var(--text-muted); pointer-events: none; font-family: monospace; margin-top: 2px;}

                /* DIAGNÓSTICO EDUCACIONAL */
                .diagnosis-panel {
                    position: absolute; bottom: 20px; left: 20px; z-index: 10; width: 320px;
                    background: rgba(20, 20, 25, 0.85); border: 1px solid var(--glass-border); backdrop-filter: var(--glass-blur);
                    border-radius: 12px; padding: 1.2rem;
                }
                .alert-item { font-size: 0.8rem; margin-top: 8px; padding: 10px; border-radius: 6px; border-left: 3px solid; animation: fadeIn 0.5s; }
                .alert-warning { background: rgba(255, 145, 0, 0.1); border-color: var(--accent-orange); color: #ffd180; }
                .alert-ok { background: rgba(0, 230, 118, 0.1); border-color: var(--accent-green); color: #b9f6ca; }

                /* PANEL INSPECTOR */
                .inspector-panel {
                    width: 350px; background: rgba(15, 15, 20, 0.95); border-left: 1px solid var(--glass-border);
                    display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.3s ease;
                    z-index: 20; box-shadow: -5px 0 25px rgba(0,0,0,0.5);
                }
                .inspector-panel.open { transform: translateX(0); }
                .inspector-header { padding: 1.5rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center; }
                .inspector-body { padding: 1.5rem; flex: 1; overflow-y: auto; }
                
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
                .form-control { width: 100%; background: #0a0a0c; border: 1px solid var(--glass-border); color: white; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 1rem;}
                .form-control:focus { outline: none; border-color: var(--accent-blue); }

                .metric-card { background: rgba(255,255,255,0.03); padding: 1.2rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05);}
                .metric-value { font-size: 1.8rem; font-weight: bold; color: var(--accent-green); font-family: monospace; margin-top: 5px; }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            </style>

            <div class="vna-layout">
                <div class="map-container">
                    <header style="position: absolute; top: 0; left: 0; width: 100%; padding: 1.5rem 2rem; z-index: 100; pointer-events: none; display: flex; justify-content: space-between; align-items: center;">
                        <a href="/project" class="btn btn-outline" data-link style="font-size: 0.8rem; pointer-events: auto;">&larr; Volver al Kanban</a>
                        <div style="pointer-events: auto;">
                            <button class="btn btn-primary" id="btnSimulateTx">✨ Simular Transacción</button>
                        </div>
                    </header>

                    <div class="map-header" style="margin-top: 70px;">
                        <div>
                            <h1 id="mapTitle" style="font-size: 1.8rem;">Cargando...</h1>
                            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">Arquetipo: <span id="mapArchetype" class="badge">--</span></p>
                        </div>
                    </div>

                    <div class="map-canvas" id="mapCanvas">
                        <svg id="edges-svg"></svg>
                    </div>

                    <div class="diagnosis-panel">
                        <h3 style="font-size: 0.9rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px;">
                            <span>🧠</span> Diagnóstico de Red
                        </h3>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Maturity Index: <span id="maturityScore" style="color: white; font-weight: bold; font-family: monospace;">--%</span></div>
                        <div id="alertsContainer"></div>
                    </div>
                </div>

                <aside class="inspector-panel" id="inspectorPanel">
                    <div class="inspector-header">
                        <h2 id="insName" style="font-size: 1.2rem;">Nodo</h2>
                        <button id="btnCloseInspector" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem;">&times;</button>
                    </div>
                    <div class="inspector-body" id="inspectorBody" style="display: none;">
                        <span class="badge" id="insLevel" style="margin-bottom: 1.5rem; display: inline-block;">@rol</span>
                        
                        <div class="metric-card">
                            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Slices Acumulados (Equity)</div>
                            <div class="metric-value" id="insEquity">0</div>
                        </div>

                        <div class="form-group">
                            <label>Valor Mercado (FMV - €/h)</label>
                            <input type="number" id="inputFmv" class="form-control">
                        </div>

                        <div class="form-group">
                            <label>Multiplicador Slicing Pie</label>
                            <input type="number" step="0.1" id="inputMult" class="form-control">
                        </div>

                        <button class="btn btn-primary" id="btnSaveRole" style="width: 100%; margin-top: 1rem;">Actualizar Nodo</button>
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
            store.dispatch({ type: 'ADD_PROJECT', payload: { id: 'vna-demo', nombre: 'NeoApp VNA Engine', sector: 'startup', archetype: 'startup' } });
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

        window.addEventListener('resize', () => this.drawEdges());
        this.dom.btnClose.addEventListener('click', () => {
            this.dom.inspector.classList.remove('open');
            this.selectedRoleId = null;
            this.renderMap();
        });

        this.dom.btnSave.addEventListener('click', () => {
            const newFmv = parseFloat(document.getElementById('inputFmv').value);
            const newMult = parseFloat(document.getElementById('inputMult').value);
            store.dispatch({ 
                type: 'UPDATE_ROLE', 
                payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId, field: 'fmv', value: newFmv } 
            });
            store.dispatch({ 
                type: 'UPDATE_ROLE', 
                payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId, field: 'multiplier', value: newMult } 
            });
            this.renderMap();
            this.dom.btnSave.innerText = "✓ Nodo Actualizado";
            setTimeout(() => this.dom.btnSave.innerText = "Actualizar Nodo", 2000);
        });

        this.dom.btnSimulateTx.addEventListener('click', () => {
            const p = store.getState().projects.find(x => x.id === this.activeProjectId);
            if(p.roles.length < 2) return;
            const r1 = p.roles[Math.floor(Math.random() * p.roles.length)];
            const r2 = p.roles.filter(r => r.id !== r1.id)[Math.floor(Math.random() * (p.roles.length - 1))];
            const esTangible = Math.random() > 0.4;
            const entregables = esTangible ? ['Código Core', 'Diseño UI', 'Smart Contract', 'Pitch Deck'] : ['Feedback UX', 'Mentoria', 'Revisión Estratégica', 'Cultura'];
            const desc = entregables[Math.floor(Math.random() * entregables.length)];
            const horas = Math.floor(Math.random() * 6) + 1;
            const txHash = '0x' + Math.random().toString(16).slice(2, 10);

            store.dispatch({ 
                type: 'ADD_TRANSACTION', 
                payload: { projectId: this.activeProjectId, tx: { hash: txHash, from: r1.id, to: r2.id, horas, entregable: desc, tipo: esTangible ? 'tangible' : 'intangible', status: 'approved' } } 
            });
            store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: this.activeProjectId, txHash: txHash } });
            this.renderMap();
            this.updateDiagnosis();
        });
    }

    updateHeader() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        this.dom.title.innerText = p.nombre;
        this.dom.archetype.innerText = p.archetype.toUpperCase();
    }

    renderMap() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const harvest = store.calculateHarvest(this.activeProjectId);
        document.querySelectorAll('.node').forEach(n => n.remove());

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
            const finalSize = 85 + Math.min(totalVal / 12, 65);

            let pos = { ...layoutMap[level] } || { x: 50, y: 50 };
            if (levelCounts[level] > 1) {
                pos.x += (levelCounts[level] - 1) * 18;
                pos.x -= 9; 
            }

            const nodeEl = document.createElement('div');
            nodeEl.className = `node ${this.selectedRoleId === rol.id ? 'selected' : ''}`;
            nodeEl.style.width = `${finalSize}px`;
            nodeEl.style.height = `${finalSize}px`;
            nodeEl.style.left = `${pos.x}%`;
            nodeEl.style.top = `${pos.y}%`;
            nodeEl.style.borderColor = this.getColorForLevel(rol.levelId);
            
            const isAssigned = p.asignaciones && p.asignaciones.find(a => a.roleId === rol.id);
            if(!isAssigned) nodeEl.style.opacity = '0.65';

            nodeEl.innerHTML = `
                <div style="font-size: 1.4rem;">${this.getIconForLevel(rol.levelId)}</div>
                <div class="node-name">${rol.name}</div>
                <div class="node-value">${totalVal} ${p.archetype === 'startup' ? 'Slices' : '€'}</div>
            `;

            nodeEl.addEventListener('click', () => {
                this.selectedRoleId = rol.id;
                this.renderMap();
                this.openInspector(rol, totalVal, p.archetype === 'startup' ? 'Slices' : '€', this.getColorForLevel(rol.levelId));
            });

            rol._dom = nodeEl;
            this.dom.canvas.appendChild(nodeEl);
        });

        setTimeout(() => this.drawEdges(), 100);
    }

    drawEdges() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        this.dom.svg.innerHTML = ''; 
        if(!p.transactions) return;

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="context-stroke" />
            </marker>
        `;
        this.dom.svg.appendChild(defs);

        p.transactions.forEach(tx => {
            const rFrom = p.roles.find(r => r.id === tx.from);
            const rTo = p.roles.find(r => r.id === tx.to);
            
            if(rFrom && rTo && rFrom._dom && rTo._dom && rFrom.id !== rTo.id) {
                const rectFrom = rFrom._dom.getBoundingClientRect();
                const rectTo = rTo._dom.getBoundingClientRect();
                const canvasRect = this.dom.canvas.getBoundingClientRect();

                const x1 = rectFrom.left + (rectFrom.width/2) - canvasRect.left;
                const y1 = rectFrom.top + (rectFrom.height/2) - canvasRect.top;
                const x2 = rectTo.left + (rectTo.width/2) - canvasRect.left;
                const y2 = rectTo.top + (rectTo.height/2) - canvasRect.top;

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1); line.setAttribute('y1', y1);
                line.setAttribute('x2', x2); line.setAttribute('y2', y2);
                line.setAttribute('marker-end', 'url(#arrowhead)');
                line.classList.add('edge-line', tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible');
                this.dom.svg.appendChild(line);

                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', midX); text.setAttribute('y', midY - 12);
                text.setAttribute('text-anchor', 'middle');
                text.style.fill = tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
                text.style.fontSize = '9px';
                text.style.fontFamily = 'monospace';
                text.style.fontWeight = 'bold';
                text.style.paintOrder = 'stroke';
                text.style.stroke = 'black';
                text.style.strokeWidth = '4px';
                text.textContent = tx.entregable.toUpperCase();
                this.dom.svg.appendChild(text);
            }
        });
    }

    openInspector(rol, totalVal, moneda, color) {
        this.dom.inspector.classList.add('open');
        this.dom.insBody.style.display = 'block';
        document.getElementById('insName').innerText = rol.name;
        const badge = document.getElementById('insLevel');
        badge.innerText = rol.levelId;
        badge.style.color = color; badge.style.borderColor = color;
        document.getElementById('insEquity').innerText = `${totalVal} ${moneda}`;
        document.getElementById('inputFmv').value = rol.fmv || 0;
        document.getElementById('inputMult').value = rol.multiplier || 1.0;
    }

    updateDiagnosis() {
        const maturity = store.calculateMaturityIndex(this.activeProjectId);
        this.dom.maturityScore.innerText = `${maturity.score}%`;
        this.dom.maturityScore.style.color = maturity.score > 70 ? 'var(--accent-green)' : (maturity.score > 40 ? 'var(--accent-orange)' : '#ff5252');
        this.dom.alertsContainer.innerHTML = '';
        if(maturity.alerts.length === 0) {
            this.dom.alertsContainer.innerHTML = `<div class="alert-item alert-ok">Flujo de valor equilibrado. Estructura de "Castell" sólida.</div>`;
        } else {
            maturity.alerts.forEach(alerta => {
                this.dom.alertsContainer.innerHTML += `<div class="alert-item alert-warning">⚠️ ${alerta}</div>`;
            });
        }
    }

    getIconForLevel(levelId) {
        return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[levelId] || '💠';
    }

    getColorForLevel(levelId) {
        return { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' }[levelId] || '#ffffff';
    }
}
