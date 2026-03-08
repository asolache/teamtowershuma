// v5/js/views/ValueMapView.js
import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';
import { Sidebar } from '../components/Sidebar.js'; // INYECCIÓN DEL SIDEBAR

export default class ValueMapView {
    constructor() {
        document.title = "Diseñador VNA | TeamTowers";
        this.activeProjectId = null;
        this.selectedRoleId = null; 
        this.isDragging = false;
        this.draggedElement = null;
        
        // Control de Animación
        this.isSimulating = false;
        this.simulationTimeouts = [];
        
        // Jerarquía para el diagnóstico de salud (1 = Top, 5 = Base)
        this.levelHierarchy = { '@anxaneta': 1, '@aixecador': 2, '@dosos': 3, '@baixos': 4, '@pinya': 5 };
    }

    async getHtml() {
        return `
            <style>
                .vna-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', sans-serif; }
                
                /* PANEL SECUENCIAL (AHORA COLUMNA 2) */
                .sequence-panel { width: 320px; background: rgba(12, 12, 16, 0.95); border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; z-index: 20; flex-shrink: 0; box-shadow: 10px 0 30px rgba(0,0,0,0.5);}
                .sequence-header { padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .sequence-header h2 { font-size: 1.1rem; color: white; margin: 0 0 5px 0; letter-spacing: 0.5px; }
                .sequence-header p { font-size: 0.75rem; color: #888; margin: 0; }
                .sequence-body { flex: 1; overflow-y: auto; padding: 1rem; }
                .flow-step { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 10px; margin-bottom: 10px; font-size: 0.8rem; display: flex; flex-direction: column; gap: 5px; transition: all 0.3s;}
                .flow-step.simulating { transform: scale(1.05); border-color: #00b0ff; box-shadow: 0 0 15px rgba(0, 176, 255, 0.3); }
                .step-header { display: flex; justify-content: space-between; align-items: center; color: #aaa; font-family: monospace; }
                .step-route { display: flex; align-items: center; gap: 5px; font-weight: bold; color: white; }
                .step-deliverable { color: #00b0ff; text-transform: uppercase; font-size: 0.75rem; }

                .sequence-footer { padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.3); }
                .form-control { width: 100%; background: #000; border: 1px solid #333; color: white; padding: 10px; border-radius: 6px; margin-bottom: 10px; font-size: 0.85rem; transition: border-color 0.2s;}
                .form-control:focus { border-color: #00b0ff; outline: none; }
                .form-row { display: flex; gap: 10px; }

                /* LIENZO PRINCIPAL */
                .map-container { flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; }
                .map-canvas { flex: 1; position: relative; width: 100%; height: 100%; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 40px 40px; }
                #edges-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
                
                /* ESTILOS DE LÍNEAS (EDGES) */
                .edge-line { fill: none; stroke-width: 2.5; opacity: 0.85; transition: stroke 0.3s; }
                .edge-tangible { stroke: #00e676; }
                .edge-intangible { stroke: #e040fb; stroke-dasharray: 6, 6; animation: dashAnim 15s linear infinite; }
                .edge-sick { stroke: #ff5252 !important; stroke-width: 4 !important; filter: drop-shadow(0 0 8px #ff5252); }
                
                @keyframes dashAnim { to { stroke-dashoffset: -500; } }
                @keyframes drawLine { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }

                /* NODOS */
                .node { position: absolute; z-index: 5; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: grab; transition: transform 0.2s, box-shadow 0.3s, border-color 0.3s; background: rgba(15, 15, 20, 0.95); backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.1); color: white; transform: translate(-50%, -50%); user-select: none; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                .node:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.05); }
                .node.selected { border-color: #00b0ff !important; box-shadow: 0 0 35px rgba(0, 176, 255, 0.6); z-index: 10; }
                .node.sick-node { border-color: #ff5252 !important; box-shadow: 0 0 40px rgba(255, 82, 82, 0.8); animation: pulseSick 1s infinite alternate; z-index: 15; }
                .node-name { font-size: 0.7rem; margin-top: 5px; pointer-events: none; text-transform: uppercase; width: 85%; font-weight: bold; line-height: 1.1; }

                @keyframes pulseSick { from { transform: translate(-50%, -50%) scale(1); } to { transform: translate(-50%, -50%) scale(1.15); } }

                /* OVERLAYS Y PANELES */
                .ui-overlay { position: absolute; top: 0; left: 0; width: 100%; padding: 1.5rem; z-index: 100; pointer-events: none; display: flex; justify-content: space-between; align-items: flex-start;}
                .interactive { pointer-events: auto; }
                .action-panel { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
                .vna-legend { background: rgba(10, 10, 15, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; pointer-events: auto; backdrop-filter: blur(10px); display: flex; flex-direction: column; gap: 10px; }
                
                /* ALERTA DIAGNÓSTICO ENFERMO */
                #sickAlert { display: none; background: rgba(255, 82, 82, 0.1); border: 1px solid #ff5252; color: #ff5252; padding: 10px; border-radius: 8px; font-size: 0.75rem; font-weight: bold; max-width: 200px; text-align: right; }

                .inspector-panel { position: absolute; top: 0; right: 0; height: 100%; width: 380px; background: #0c0c10; border-left: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 1000; box-shadow: -10px 0 30px rgba(0,0,0,0.7); }
                .inspector-panel.open { transform: translateX(0); }
                
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: none; justify-content: center; align-items: center; z-index: 2000; }
                .modal-content { background: #121216; border: 1px solid #333; padding: 2rem; border-radius: 12px; width: 350px; }

                /* BOTONES VNA */
                .btn { padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; font-size: 0.9rem; transition: transform 0.2s;}
                .btn:hover { transform: translateY(-2px); }
                .btn-play { background: #00b0ff; color: black; box-shadow: 0 0 20px rgba(0, 176, 255, 0.3); }
                .btn-stop { background: #333; color: white; display: none; }

                /* MOBILE RESPONSIVE */
                @media (max-width: 768px) {
                    .vna-layout { flex-direction: column; }
                    .sequence-panel { width: 100%; max-height: 250px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; }
                    .ui-overlay h1 { font-size: 1.2rem; }
                    .inspector-panel { width: 100%; }
                }
            </style>

            <div class="vna-layout">
                
                ${Sidebar.getHtml('/map')}

                <aside class="sequence-panel" id="seqPanel">
                    <div class="sequence-header interactive">
                        <h2>Secuencia VNA</h2>
                        <p>Añade transacciones para nutrir la red.</p>
                    </div>
                    <div class="sequence-body" id="sequenceList"></div>
                    <div class="sequence-footer interactive">
                        <div class="form-row">
                            <select id="selFrom" class="form-control" title="Origen"></select>
                            <span style="color: #555; align-self: center;">&rarr;</span>
                            <select id="selTo" class="form-control" title="Destino"></select>
                        </div>
                        <select id="selTemplate" class="form-control" style="background: rgba(0, 176, 255, 0.1); border-color: #00b0ff; color: #fff;">
                            <option value="">Cargando ontología...</option>
                        </select>
                        <div class="form-row">
                            <select id="selType" class="form-control">
                                <option value="tangible">🟢 Tangible (Doc)</option>
                                <option value="intangible">🟣 Intangible (Sync)</option>
                            </select>
                            <input type="number" id="inpHoras" class="form-control" placeholder="Hrs" value="2" style="width: 70px;">
                        </div>
                        <input type="text" id="inpDesc" class="form-control" placeholder="Nombre del Entregable">
                        <button class="btn" style="background: #00e676; color: black; width: 100%; margin-top: 5px;" id="btnAddFlow">➕ Añadir a Secuencia</button>
                    </div>
                </aside>

                <div class="map-container">
                    <div class="ui-overlay">
                        <div class="interactive">
                            <h1 id="mapTitle" style="font-size: 2rem; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">Red de Valor</h1>
                        </div>
                        <div class="action-panel interactive">
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-play" id="btnSimulate">▶ Simular Flujo</button>
                                <button class="btn btn-stop" id="btnStopSim">⏹ Detener</button>
                            </div>
                            
                            <button class="btn" style="background: #333; color: white;" id="btnOpenAddNode">➕ Nuevo Nodo</button>
                            
                            <div class="vna-legend">
                                <div style="display: flex; gap: 10px; font-size: 0.75rem; color: #ddd;"><div style="width: 20px; height: 3px; background: #00e676; margin-top:6px;"></div> Tangible</div>
                                <div style="display: flex; gap: 10px; font-size: 0.75rem; color: #ddd;"><div style="width: 20px; height: 3px; border-bottom: 2px dashed #e040fb; margin-top:5px;"></div> Intangible</div>
                            </div>

                            <div id="sickAlert">⚠️ DIAGNÓSTICO:<br>Salto estructural excesivo detectado. Riesgo de colapso de comunicación.</div>
                        </div>
                    </div>
                    <div class="map-canvas" id="mapCanvas">
                        <svg id="edges-svg"></svg>
                    </div>
                </div>

                <aside class="inspector-panel interactive" id="inspectorPanel">
                    <div style="padding: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                        <h2 id="insName" style="font-size: 1.5rem; margin:0; color: white;">Nodo</h2>
                        <button id="btnCloseInspector" style="background:none; border:none; color:#666; cursor:pointer; font-size: 2rem;">&times;</button>
                    </div>
                    <div style="padding: 2rem;">
                        <span class="badge" id="insLevel" style="margin-bottom: 2rem; font-size: 0.8rem;">@rol</span>
                        <div style="margin-top: 1.5rem; margin-bottom: 1.5rem;">
                            <label style="font-size: 0.75rem; color: #aaa;">Valor Mercado (FMV €/h)</label>
                            <input type="number" id="inputFmv" class="form-control">
                        </div>
                        <div style="margin-bottom: 2rem;">
                            <label style="font-size: 0.75rem; color: #aaa;">Factor de Riesgo Multiplicador</label>
                            <input type="number" step="0.1" id="inputMult" class="form-control">
                        </div>
                        <button class="btn" style="background: #00b0ff; color: white; width: 100%;" id="btnSaveRole">✓ Actualizar Matemáticas</button>
                    </div>
                </aside>
            </div>

            <div class="modal-overlay" id="addNodeModal">
                <div class="modal-content">
                    <h3 style="color: white; margin-top: 0;">Instanciar Nodo</h3>
                    <input type="text" id="inpNewNodeName" class="form-control" placeholder="Ej: Especialista SEO">
                    <select id="selNewNodeLevel" class="form-control" style="margin-top: 10px;">
                        <option value="@anxaneta">@anxaneta</option>
                        <option value="@aixecador">@aixecador</option>
                        <option value="@dosos">@dosos</option>
                        <option value="@baixos" selected>@baixos</option>
                        <option value="@pinya">@pinya</option>
                    </select>
                    <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
                        <button class="btn" style="background: transparent; border: 1px solid #555; color: white;" id="btnCancelNode">Cancelar</button>
                        <button class="btn" style="background: #00b0ff; color: white;" id="btnConfirmNode">Añadir Nodo</button>
                    </div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners(); // Activar Logout

        let state = store.getState();
        let project = state.projects[state.projects.length - 1];

        if (!project || !project.roles) return;

        this.activeProjectId = project.id;
        
        this.dom = {
            title: document.getElementById('mapTitle'),
            canvas: document.getElementById('mapCanvas'),
            svg: document.getElementById('edges-svg'),
            seqList: document.getElementById('sequenceList'),
            seqPanel: document.getElementById('seqPanel'),
            selFrom: document.getElementById('selFrom'),
            selTo: document.getElementById('selTo'),
            selTemplate: document.getElementById('selTemplate'),
            selType: document.getElementById('selType'),
            inpDesc: document.getElementById('inpDesc'),
            inpHoras: document.getElementById('inpHoras'),
            inspector: document.getElementById('inspectorPanel'),
            btnSimulate: document.getElementById('btnSimulate'),
            btnStopSim: document.getElementById('btnStopSim'),
            sickAlert: document.getElementById('sickAlert')
        };

        this.dom.title.innerText = project.nombre;

        this.populateDropdowns(project.roles);
        this.updateOntologyTemplates(); 
        this.renderMap();
        this.renderSequence();

        // LOGICA DE SIMULACIÓN (PLAY/STOP)
        this.dom.btnSimulate.addEventListener('click', () => this.startSimulation());
        this.dom.btnStopSim.addEventListener('click', () => this.stopSimulation());

        // Listeners Dropdowns
        this.dom.selFrom.addEventListener('change', () => this.updateOntologyTemplates());
        this.dom.selTemplate.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === "manual") {
                this.dom.inpDesc.value = '';
                this.dom.inpDesc.focus();
            } else if (val !== "") {
                const template = this.getTemplatesForLevel(this.getRoleLevel(this.dom.selFrom.value))[parseInt(val)];
                this.dom.inpDesc.value = template.name;
                this.dom.selType.value = template.tipo;
                this.dom.inpHoras.value = template.estimatedHours;
            }
        });

        document.getElementById('btnAddFlow').addEventListener('click', () => {
            const fromId = this.dom.selFrom.value;
            const toId = this.dom.selTo.value;
            const desc = this.dom.inpDesc.value.trim();
            if(fromId === toId) return alert("El valor debe fluir entre nodos distintos.");
            if(!desc) return alert("Escribe el nombre del entregable.");

            store.dispatch({ 
                type: 'ADD_TRANSACTION', 
                payload: { projectId: this.activeProjectId, tx: { hash: '0x'+Math.random().toString(16).slice(2,10), from: fromId, to: toId, horas: parseFloat(this.dom.inpHoras.value)||1, entregable: desc, tipo: this.dom.selType.value, status: 'theoretical' } } 
            });

            this.dom.selFrom.value = toId; 
            this.updateOntologyTemplates();
            this.dom.inpDesc.value = ''; 
            this.renderSequence();
            this.drawEdges();
        });

        // Modal Nuevo Nodo
        const modal = document.getElementById('addNodeModal');
        document.getElementById('btnOpenAddNode').addEventListener('click', () => modal.style.display = 'flex');
        document.getElementById('btnCancelNode').addEventListener('click', () => modal.style.display = 'none');
        document.getElementById('btnConfirmNode').addEventListener('click', () => {
            const name = document.getElementById('inpNewNodeName').value.trim();
            const levelId = document.getElementById('selNewNodeLevel').value;
            if(!name) return;
            const multipliers = { '@anxaneta': 3.0, '@aixecador': 2.0, '@dosos': 1.5, '@baixos': 1.2, '@pinya': 1.0 };
            
            store.dispatch({ type: 'ADD_ROLE', payload: { projectId: this.activeProjectId, role: { name, levelId, multiplier: multipliers[levelId], fmv: 50, isArchived: false } } });
            modal.style.display = 'none';
            document.getElementById('inpNewNodeName').value = '';
            
            const pUpdate = store.getState().projects.find(x => x.id === this.activeProjectId);
            this.populateDropdowns(pUpdate.roles);
            this.renderMap();
        });

        // Inspector Logic
        document.getElementById('btnCloseInspector').addEventListener('click', () => {
            this.dom.inspector.classList.remove('open');
            this.selectedRoleId = null;
            this.renderMap();
        });
        document.getElementById('btnSaveRole').addEventListener('click', () => {
            const fmv = parseFloat(document.getElementById('inputFmv').value);
            const mult = parseFloat(document.getElementById('inputMult').value);
            store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId, field: 'fmv', value: fmv } });
            store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId, field: 'multiplier', value: mult } });
            this.renderMap();
        });

        // Drag Overlay
        this.dom.canvas.addEventListener('mousedown', (e) => {
            const node = e.target.closest('.node');
            if (node && !this.isSimulating) { this.isDragging = true; this.draggedElement = node; node.style.zIndex = 1000; }
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
        window.addEventListener('resize', () => { if(!this.isSimulating) this.drawEdges(); });
    }

    // 🔥 EL MOTOR DE SIMULACIÓN Y DIAGNÓSTICO 🔥
    startSimulation() {
        if (this.isSimulating) return;
        
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const txs = p?.transactions || [];
        if (txs.length === 0) return alert("Añade transacciones para simular el flujo.");

        this.isSimulating = true;
        this.dom.btnSimulate.style.display = 'none';
        this.dom.btnStopSim.style.display = 'block';
        this.dom.sickAlert.style.display = 'none';
        
        // Limpiamos los SVG actuales
        this.dom.svg.innerHTML = '';
        
        // Preparar marker
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `<marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="context-stroke"/></marker>`;
        this.dom.svg.appendChild(defs);

        // Reseteamos UI de la lista
        const stepEls = this.dom.seqList.querySelectorAll('.flow-step');
        stepEls.forEach(el => el.classList.remove('simulating'));
        
        // Quitar clases enfermas a los nodos
        this.dom.canvas.querySelectorAll('.node').forEach(n => n.classList.remove('sick-node'));

        let delayAccumulator = 0;
        const timePerStep = 2000; // 2 segundos por transacción

        txs.forEach((tx, index) => {
            const timeoutId = setTimeout(() => {
                // 1. Resaltar paso en la lista
                stepEls.forEach(el => el.classList.remove('simulating'));
                if(stepEls[index]) {
                    stepEls[index].classList.add('simulating');
                    stepEls[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                // 2. Diagnóstico de Salud Estructural (El Algoritmo Médico)
                const r1 = p.roles.find(r => r.id === tx.from);
                const r2 = p.roles.find(r => r.id === tx.to);
                let isSickFlow = false;

                if (r1 && r2) {
                    const level1 = this.levelHierarchy[r1.levelId];
                    const level2 = this.levelHierarchy[r2.levelId];
                    // Si la diferencia de jerarquía es mayor a 1 (ej. de 1 a 3, o de 1 a 5), la arteria enferma.
                    if (Math.abs(level1 - level2) > 1) {
                        isSickFlow = true;
                        this.dom.sickAlert.style.display = 'block';
                        r1._dom.classList.add('sick-node');
                        r2._dom.classList.add('sick-node');
                    } else {
                        // Limpiar si el flujo es sano
                        this.dom.sickAlert.style.display = 'none';
                        this.dom.canvas.querySelectorAll('.node').forEach(n => n.classList.remove('sick-node'));
                    }
                }

                // 3. Dibujar la línea animada
                this.drawSingleEdgeAnim(tx, index, p, isSickFlow);

                // 4. Si es la última transacción, terminar la simulación después
                if (index === txs.length - 1) {
                    setTimeout(() => this.stopSimulation(), timePerStep);
                }
            }, delayAccumulator);
            
            this.simulationTimeouts.push(timeoutId);
            delayAccumulator += timePerStep;
        });
    }

    stopSimulation() {
        this.isSimulating = false;
        this.dom.btnSimulate.style.display = 'block';
        this.dom.btnStopSim.style.display = 'none';
        this.dom.sickAlert.style.display = 'none';
        
        // Limpiar timeouts pendientes
        this.simulationTimeouts.forEach(id => clearTimeout(id));
        this.simulationTimeouts = [];

        // Limpiar UI visual
        const stepEls = this.dom.seqList.querySelectorAll('.flow-step');
        stepEls.forEach(el => el.classList.remove('simulating'));
        this.dom.canvas.querySelectorAll('.node').forEach(n => n.classList.remove('sick-node'));

        // Redibujar el mapa en estado estático
        this.drawEdges();
    }

    drawSingleEdgeAnim(tx, index, project, isSick) {
        const r1 = project.roles.find(r => r.id === tx.from);
        const r2 = project.roles.find(r => r.id === tx.to);
        if (!r1?._dom || !r2?._dom) return;

        const rect1 = r1._dom.getBoundingClientRect();
        const rect2 = r2._dom.getBoundingClientRect();
        const canv = this.dom.canvas.getBoundingClientRect();
        const x1 = rect1.left + rect1.width / 2 - canv.left;
        const y1 = rect1.top + rect1.height / 2 - canv.top;
        const x2 = rect2.left + rect2.width / 2 - canv.left;
        const y2 = rect2.top + rect2.height / 2 - canv.top;

        // Calcular distancia para la animación de dibujo (stroke-dasharray)
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2);
        line.setAttribute('marker-end', 'url(#arrow)');
        
        // Configurar animación de dibujado
        line.style.strokeDasharray = distance;
        line.style.strokeDashoffset = distance;
        line.style.animation = `drawLine 0.8s ease-out forwards`;
        
        line.classList.add('edge-line');
        
        if (isSick) {
            line.classList.add('edge-sick'); // Rojo de peligro
        } else {
            line.classList.add(tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible');
        }

        this.dom.svg.appendChild(line);

        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', (x1+x2)/2); txt.setAttribute('y', (y1+y2)/2 - 8);
        txt.setAttribute('text-anchor', 'middle');
        txt.style.cssText = `fill:${isSick ? '#ff5252' : (tx.tipo==='tangible'?'#00e676':'#e040fb')};font-size:14px;font-weight:900;font-family:monospace;paint-order:stroke;stroke:#111;stroke-width:5px; opacity: 0; transition: opacity 0.5s;`;
        txt.textContent = `[${index + 1}]`;
        
        setTimeout(() => txt.style.opacity = '1', 400); // Aparece tras dibujarse la línea
        
        this.dom.svg.appendChild(txt);
    }

    // Funciones estándar
    populateDropdowns(roles) {
        const options = roles.filter(r => !r.isArchived).map(r => `<option value="${r.id}">${r.levelId} - ${r.name}</option>`).join('');
        this.dom.selFrom.innerHTML = options;
        this.dom.selTo.innerHTML = options;
        if(roles.length > 1) this.dom.selTo.selectedIndex = 1;
    }

    getRoleLevel(roleId) {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const r = p.roles.find(x => x.id === roleId);
        return r ? r.levelId : '@baixos';
    }

    getTemplatesForLevel(levelId) {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const sectorData = GLOBAL_ONTOLOGY[p.sector || 'startup_tech'];
        if (sectorData && sectorData[levelId] && sectorData[levelId].standard_deliverables) {
            return sectorData[levelId].standard_deliverables;
        }
        return [ { name: "Documento Técnico", estimatedHours: 4, tipo: "tangible" } ];
    }

    updateOntologyTemplates() {
        const levelId = this.getRoleLevel(this.dom.selFrom.value);
        const templates = this.getTemplatesForLevel(levelId);
        let html = `<option value="">-- Catálogo Ontológico --</option>`;
        templates.forEach((t, i) => html += `<option value="${i}">${t.tipo === 'tangible' ? '🟢' : '🟣'} ${t.name} (${t.estimatedHours}h)</option>`);
        html += `<option value="manual">✍️ Crear Manualmente...</option>`;
        this.dom.selTemplate.innerHTML = html;
        this.dom.inpDesc.value = '';
    }

    renderSequence() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const txs = p?.transactions || [];
        this.dom.seqList.innerHTML = '';
        if(txs.length === 0) return this.dom.seqList.innerHTML = `<p style="color:#666; font-size:0.8rem; text-align:center; margin-top:2rem;">Lienzo en blanco.</p>`;

        txs.forEach((tx, i) => {
            const rFrom = p.roles.find(r => r.id === tx.from);
            const rTo = p.roles.find(r => r.id === tx.to);
            if(!rFrom || !rTo) return;
            const color = tx.tipo === 'tangible' ? '#00e676' : '#e040fb';

            const stepEl = document.createElement('div');
            stepEl.className = 'flow-step';
            stepEl.style.borderLeft = `3px solid ${color}`;
            stepEl.innerHTML = `
                <div class="step-header"><span>Paso ${i + 1}</span><span style="font-size: 0.7rem;">${tx.horas}h Est.</span></div>
                <div class="step-route"><span style="color: ${this.getColor(rFrom.levelId)}">${rFrom.levelId}</span> <span style="color:#666;">&rarr;</span> <span style="color: ${this.getColor(rTo.levelId)}">${rTo.levelId}</span></div>
                <div class="step-deliverable" style="color: ${color};">${tx.entregable}</div>
            `;
            this.dom.seqList.appendChild(stepEl);
        });
        this.dom.seqList.scrollTop = this.dom.seqList.scrollHeight;
    }

    renderMap() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if (!p) return;

        const positions = {};
        this.dom.canvas.querySelectorAll('.node').forEach(n => { positions[n.dataset.id] = { left: n.style.left, top: n.style.top }; n.remove(); });

        const layout = { '@anxaneta': {x: 50, y: 15}, '@aixecador': {x: 50, y: 35}, '@dosos': {x: 35, y: 55}, '@baixos': {x: 65, y: 55}, '@pinya': {x: 50, y: 80} };
        const levelCounts = {};

        p.roles.forEach(rol => {
            if (rol.isArchived) return;
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
            el.innerHTML = `<div style="font-size:1.5rem; margin-bottom:2px;">${this.getIcon(level)}</div><div class="node-name">${rol.name}</div>`;

            el.addEventListener('click', (e) => {
                if(this.isDragging || this.isSimulating) return;
                if (this.selectedRoleId && this.selectedRoleId !== rol.id) {
                    this.dom.selFrom.value = this.selectedRoleId;
                    this.dom.selTo.value = rol.id;
                    this.updateOntologyTemplates();
                }

                this.selectedRoleId = rol.id;
                this.renderMap();
                
                this.dom.inspector.classList.add('open');
                document.getElementById('insName').innerText = rol.name;
                const b = document.getElementById('insLevel');
                b.innerText = rol.levelId; b.style.color = this.getColor(level); b.style.borderColor = this.getColor(level);
                document.getElementById('inputFmv').value = rol.fmv || 0;
                document.getElementById('inputMult').value = rol.multiplier || 1.0;
            });

            rol._dom = el;
            this.dom.canvas.appendChild(el);
        });

        setTimeout(() => { if(!this.isSimulating) this.drawEdges(); }, 50);
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

                const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                txt.setAttribute('x', (x1+x2)/2); txt.setAttribute('y', (y1+y2)/2 - 8);
                txt.setAttribute('text-anchor', 'middle');
                txt.style.cssText = `fill:${tx.tipo==='tangible'?'#00e676':'#e040fb'};font-size:11px;font-weight:900;font-family:monospace;paint-order:stroke;stroke:#111;stroke-width:5px;`;
                txt.textContent = `[${index + 1}]`;
                this.dom.svg.appendChild(txt);
            }
        });
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }
    getColor(l) { return { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' }[l] || '#fff'; }
}
