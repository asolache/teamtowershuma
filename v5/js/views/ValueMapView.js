// v5/js/views/ValueMapView.js
import { store } from '../core/store.js';

export default class ValueMapView {
    constructor() {
        document.title = "Diseñador de Flujos VNA | TeamTowers";
        this.activeProjectId = null;
        this.selectedRoleId = null;
        this.isDragging = false;
        this.draggedElement = null;
    }

    async getHtml() {
        return `
            <style>
                .vna-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', sans-serif; }
                
                /* PANEL SECUENCIAL (IZQUIERDA) */
                .sequence-panel {
                    width: 320px; background: rgba(12, 12, 16, 0.95); border-right: 1px solid rgba(255,255,255,0.05);
                    display: flex; flex-direction: column; z-index: 20; box-shadow: 10px 0 30px rgba(0,0,0,0.5);
                    backdrop-filter: blur(20px);
                }
                .sequence-header { padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .sequence-header h2 { font-size: 1.1rem; color: white; margin: 0 0 5px 0; letter-spacing: 0.5px; }
                .sequence-header p { font-size: 0.75rem; color: #888; margin: 0; }
                
                .sequence-body { flex: 1; overflow-y: auto; padding: 1rem; }
                .flow-step { 
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; 
                    padding: 10px; margin-bottom: 10px; font-size: 0.8rem;
                    display: flex; flex-direction: column; gap: 5px; animation: slideInLeft 0.3s ease;
                }
                .step-header { display: flex; justify-content: space-between; align-items: center; color: #aaa; font-family: monospace; }
                .step-route { display: flex; align-items: center; gap: 5px; font-weight: bold; color: white; }
                .step-deliverable { color: #00b0ff; text-transform: uppercase; font-size: 0.75rem; }

                .sequence-footer { padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.3); }
                .form-control { width: 100%; background: #000; border: 1px solid #333; color: white; padding: 10px; border-radius: 6px; margin-bottom: 10px; font-size: 0.85rem; }
                .form-control:focus { border-color: #00b0ff; outline: none; }
                .form-row { display: flex; gap: 10px; }

                /* LIENZO PRINCIPAL */
                .map-container { flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; }
                .map-canvas { 
                    flex: 1; position: relative; width: 100%; height: 100%; 
                    background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 40px 40px;
                }
                #edges-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
                
                .edge-line { fill: none; stroke-width: 2.5; opacity: 0.85; }
                .edge-tangible { stroke: #00e676; }
                .edge-intangible { stroke: #e040fb; stroke-dasharray: 6, 6; animation: dashAnim 15s linear infinite; }
                @keyframes dashAnim { to { stroke-dashoffset: -500; } }

                /* NODOS */
                .node {
                    position: absolute; z-index: 5; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center;
                    text-align: center; cursor: grab; transition: transform 0.2s, box-shadow 0.3s;
                    background: rgba(15, 15, 20, 0.95); backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.1);
                    color: white; transform: translate(-50%, -50%); user-select: none; box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                }
                .node:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.05); }
                .node.selected { border-color: #00b0ff !important; box-shadow: 0 0 35px rgba(0, 176, 255, 0.5); z-index: 10; }
                .node-name { font-size: 0.7rem; margin-top: 5px; pointer-events: none; text-transform: uppercase; width: 85%; font-weight: bold; }

                .ui-overlay { position: absolute; top: 0; left: 0; width: 100%; padding: 1.5rem; z-index: 100; pointer-events: none; display: flex; justify-content: flex-end;}
                .interactive { pointer-events: auto; }

                @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
            </style>

            <div class="vna-layout">
                
                <aside class="sequence-panel">
                    <div class="sequence-header interactive">
                        <a href="/v5/project" class="btn btn-outline" data-link style="padding: 5px 10px; font-size: 0.7rem; margin-bottom: 15px; display: inline-block;">&larr; Ir al Kanban</a>
                        <h2>Secuencia de Valor</h2>
                        <p>Diseña el proceso paso a paso.</p>
                    </div>
                    
                    <div class="sequence-body" id="sequenceList">
                        </div>

                    <div class="sequence-footer interactive">
                        <div style="font-size: 0.75rem; color: #00b0ff; margin-bottom: 8px; font-weight: bold; text-transform: uppercase;">Añadir Nuevo Entregable</div>
                        
                        <div class="form-row">
                            <select id="selFrom" class="form-control" title="Origen"></select>
                            <span style="color: #555; align-self: center;">&rarr;</span>
                            <select id="selTo" class="form-control" title="Destino"></select>
                        </div>
                        
                        <div class="form-row">
                            <select id="selType" class="form-control">
                                <option value="tangible">🟢 Tangible (Doc, Código)</option>
                                <option value="intangible">🟣 Intangible (Feedback, Idea)</option>
                            </select>
                            <input type="number" id="inpHoras" class="form-control" placeholder="Horas" value="2" style="width: 80px;">
                        </div>

                        <input type="text" id="inpDesc" class="form-control" placeholder="Ej: Redacción del Pitch Deck">
                        
                        <button class="btn btn-primary" id="btnAddFlow" style="width: 100%; margin-top: 5px; font-size: 0.85rem;">
                            ➕ Añadir a la Secuencia
                        </button>
                    </div>
                </aside>

                <div class="map-container">
                    <div class="ui-overlay">
                        <div class="interactive" style="background: rgba(10,10,15,0.8); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(10px);">
                            <div style="font-size: 0.7rem; color: #888; text-transform: uppercase; margin-bottom: 5px;">Maturity Index</div>
                            <div id="maturityScore" style="font-size: 1.5rem; color: #00e676; font-family: monospace; font-weight: bold;">--%</div>
                        </div>
                    </div>

                    <div class="map-canvas" id="mapCanvas">
                        <svg id="edges-svg"></svg>
                    </div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        let project = state.projects[state.projects.length - 1];

        // Fallback de seguridad
        if (!project || !project.roles || project.roles.length === 0) {
            store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'ecosystem-admin' } });
            store.dispatch({ type: 'ADD_PROJECT', payload: { id: 'demo-vna', nombre: 'Red de Consultoría', sector: 'software', archetype: 'startup' } });
            project = store.getState().projects.find(p => p.id === 'demo-vna');
        }

        this.activeProjectId = project.id;
        this.dom = {
            canvas: document.getElementById('mapCanvas'),
            svg: document.getElementById('edges-svg'),
            seqList: document.getElementById('sequenceList'),
            score: document.getElementById('maturityScore'),
            selFrom: document.getElementById('selFrom'),
            selTo: document.getElementById('selTo')
        };

        this.populateDropdowns(project.roles);
        this.renderMap();
        this.renderSequence();
        this.updateDiagnosis();

        // LISTENER: Añadir Flujo Manual
        document.getElementById('btnAddFlow').addEventListener('click', () => {
            const fromId = this.dom.selFrom.value;
            const toId = this.dom.selTo.value;
            const tipo = document.getElementById('selType').value;
            const desc = document.getElementById('inpDesc').value.trim();
            const horas = parseFloat(document.getElementById('inpHoras').value) || 1;

            if(fromId === toId) return alert("El origen y destino no pueden ser el mismo rol.");
            if(!desc) return alert("Escribe el nombre del entregable.");

            const hash = '0x' + Math.random().toString(16).slice(2, 10);

            // Al crearlo aquí, nace como TEÓRICO. (Aparecerá en el Kanban)
            store.dispatch({ 
                type: 'ADD_TRANSACTION', 
                payload: { 
                    projectId: this.activeProjectId, 
                    tx: { hash, from: fromId, to: toId, horas, entregable: desc, tipo, status: 'theoretical' } 
                } 
            });

            document.getElementById('inpDesc').value = ''; // Limpiar input
            
            this.renderSequence();
            this.drawEdges();
            this.updateDiagnosis();
        });

        // MOTOR DRAG & DROP
        this.dom.canvas.addEventListener('mousedown', (e) => {
            const node = e.target.closest('.node');
            if (node) { this.isDragging = true; this.draggedElement = node; node.style.zIndex = 1000; }
        });
        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.draggedElement) return;
            const rect = this.dom.canvas.getBoundingClientRect();
            this.draggedElement.style.left = `${((e.clientX - rect.left) / rect.width) * 100}%`;
            this.draggedElement.style.top = `${((e.clientY - rect.top) / rect.height) * 100}%`;
            this.drawEdges();
        });
        window.addEventListener('mouseup', () => { 
            if (this.draggedElement) this.draggedElement.style.zIndex = 5;
            this.isDragging = false; this.draggedElement = null; 
        });
        window.addEventListener('resize', () => this.drawEdges());
    }

    populateDropdowns(roles) {
        const options = roles.map(r => `<option value="${r.id}">${r.levelId} - ${r.name}</option>`).join('');
        this.dom.selFrom.innerHTML = options;
        this.dom.selTo.innerHTML = options;
        if(roles.length > 1) this.dom.selTo.selectedIndex = 1; // Seleccionar diferente por defecto
    }

    renderSequence() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const txs = p?.transactions || [];
        this.dom.seqList.innerHTML = '';

        if(txs.length === 0) {
            this.dom.seqList.innerHTML = `<p style="color:#666; font-size:0.8rem; text-align:center; margin-top:2rem;">El lienzo está en blanco. Define el primer paso del proceso.</p>`;
            return;
        }

        txs.forEach((tx, index) => {
            const rFrom = p.roles.find(r => r.id === tx.from);
            const rTo = p.roles.find(r => r.id === tx.to);
            if(!rFrom || !rTo) return;

            const color = tx.tipo === 'tangible' ? '#00e676' : '#e040fb';

            const stepEl = document.createElement('div');
            stepEl.className = 'flow-step';
            stepEl.style.borderLeft = `3px solid ${color}`;
            stepEl.innerHTML = `
                <div class="step-header">
                    <span>Paso ${index + 1}</span>
                    <span style="font-size: 0.7rem;">${tx.horas}h Est.</span>
                </div>
                <div class="step-route">
                    <span style="color: ${this.getColor(rFrom.levelId)}">${rFrom.levelId}</span>
                    <span style="color: #666;">&rarr;</span>
                    <span style="color: ${this.getColor(rTo.levelId)}">${rTo.levelId}</span>
                </div>
                <div class="step-deliverable" style="color: ${color};">${tx.entregable}</div>
            `;
            this.dom.seqList.appendChild(stepEl);
        });
        
        // Auto-scroll al fondo
        this.dom.seqList.scrollTop = this.dom.seqList.scrollHeight;
    }

    renderMap() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if (!p) return;

        // Limpiar
        const positions = {};
        this.dom.canvas.querySelectorAll('.node').forEach(n => { positions[n.dataset.id] = { left: n.style.left, top: n.style.top }; n.remove(); });

        const layout = { '@anxaneta': {x: 50, y: 15}, '@aixecador': {x: 50, y: 35}, '@dosos': {x: 35, y: 55}, '@baixos': {x: 65, y: 55}, '@pinya': {x: 50, y: 80} };
        const levelCounts = {};

        p.roles.forEach(rol => {
            const level = rol.levelId || '@baixos';
            levelCounts[level] = (levelCounts[level] || 0) + 1;
            
            const el = document.createElement('div');
            el.className = `node ${this.selectedRoleId === rol.id ? 'selected' : ''}`;
            el.dataset.id = rol.id;
            el.style.width = `80px`; el.style.height = `80px`;
            
            if (positions[rol.id]) {
                el.style.left = positions[rol.id].left; el.style.top = positions[rol.id].top;
            } else {
                const pos = { ...(layout[level] || {x:50, y:50}) };
                if (levelCounts[level] > 1) pos.x += (levelCounts[level] - 1) * 20 - 10;
                el.style.left = `${pos.x}%`; el.style.top = `${pos.y}%`;
            }

            el.style.borderColor = this.getColor(level);
            el.innerHTML = `
                <div style="font-size:1.5rem; margin-bottom:2px;">${this.getIcon(level)}</div>
                <div class="node-name">${rol.name}</div>
            `;

            el.addEventListener('click', () => {
                if(this.isDragging) return;
                this.selectedRoleId = rol.id;
                this.renderMap();
            });

            rol._dom = el;
            this.dom.canvas.appendChild(el);
        });

        setTimeout(() => this.drawEdges(), 50);
    }

    drawEdges() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        this.dom.svg.innerHTML = '';
        const txs = p?.transactions || [];
        if (txs.length === 0) return;

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `<marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="context-stroke"/></marker>`;
        this.dom.svg.appendChild(defs);

        txs.forEach((tx, index) => {
            const r1 = p.roles.find(r => r.id === tx.from);
            const r2 = p.roles.find(r => r.id === tx.to);
            if (r1?._dom && r2?._dom && r1.id !== r2.id) {
                const rect1 = r1._dom.getBoundingClientRect();
                const rect2 = r2._dom.getBoundingClientRect();
                const canv = this.dom.canvas.getBoundingClientRect();

                const x1 = rect1.left + rect1.width / 2 - canv.left;
                const y1 = rect1.top + rect1.height / 2 - canv.top;
                const x2 = rect2.left + rect2.width / 2 - canv.left;
                const y2 = rect2.top + rect2.height / 2 - canv.top;

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2);
                line.setAttribute('marker-end', 'url(#arrow)');
                line.classList.add('edge-line', tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible');
                this.dom.svg.appendChild(line);

                // ETIQUETA SECUENCIAL [1], [2]... EN LA FLECHA
                const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                txt.setAttribute('x', (x1+x2)/2); txt.setAttribute('y', (y1+y2)/2 - 8);
                txt.setAttribute('text-anchor', 'middle');
                txt.style.cssText = `fill:${tx.tipo==='tangible'?'#00e676':'#e040fb'};font-size:11px;font-weight:900;font-family:monospace;paint-order:stroke;stroke:#111;stroke-width:5px;`;
                txt.textContent = `[${index + 1}] ${tx.entregable.toUpperCase()}`;
                this.dom.svg.appendChild(txt);
            }
        });
    }

    updateDiagnosis() {
        const m = store.calculateMaturityIndex(this.activeProjectId);
        this.dom.score.innerText = `${m.score}%`;
        this.dom.score.style.color = m.score > 70 ? '#00e676' : (m.score > 40 ? '#ff9100' : '#ff5252');
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }
    getColor(l) { return { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' }[l] || '#fff'; }
}
