// v5/js/views/ValueMapView.js
import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js'; // 1. IMPORTAMOS LA ONTOLOGÍA GLOBAL

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
                    width: 340px; background: rgba(12, 12, 16, 0.95); border-right: 1px solid rgba(255,255,255,0.05);
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

                /* HELPERS EDUCATIVOS */
                .edu-helper {
                    background: rgba(0, 176, 255, 0.1); border-left: 3px solid #00b0ff;
                    padding: 8px 10px; font-size: 0.7rem; color: #aaa; border-radius: 4px;
                    margin-bottom: 10px; display: none;
                }
                .edu-helper strong { color: white; }
                .edu-helper .tg { color: #00e676; }
                .edu-helper .ig { color: #e040fb; }

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
                .node-name { font-size: 0.7rem; margin-top: 5px; pointer-events: none; text-transform: uppercase; width: 85%; font-weight: bold; line-height: 1.1; }
                .node-value { font-size: 0.65rem; color: #00e676; pointer-events: none; font-family: monospace; margin-top: 3px; font-weight: bold; }

                .ui-overlay { position: absolute; top: 0; left: 0; width: 100%; padding: 1.5rem; z-index: 100; pointer-events: none; display: flex; justify-content: space-between; align-items: flex-start;}
                .interactive { pointer-events: auto; }

                /* INSPECTOR Y LEYENDA */
                .vna-legend { background: rgba(10, 10, 15, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; margin-top: 15px; pointer-events: auto; backdrop-filter: blur(10px); }
                .diagnosis-panel { position: absolute; bottom: 25px; left: 25px; z-index: 10; width: 340px; background: rgba(10, 10, 15, 0.95); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px); border-radius: 16px; padding: 1.5rem; box-shadow: 0 15px 50px rgba(0,0,0,0.8); }
                .inspector-panel { width: 380px; background: #0c0c10; border-left: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 1000; box-shadow: -10px 0 30px rgba(0,0,0,0.7); }
                .inspector-panel.open { transform: translateX(0); }
                
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
                        <div style="font-size: 0.75rem; color: #00b0ff; margin-bottom: 8px; font-weight: bold; text-transform: uppercase;">Añadir Entrega de Valor</div>
                        
                        <div class="form-row">
                            <select id="selFrom" class="form-control" title="Origen"></select>
                            <span style="color: #555; align-self: center;">&rarr;</span>
                            <select id="selTo" class="form-control" title="Destino"></select>
                        </div>

                        <select id="selTemplate" class="form-control" style="background: rgba(0, 176, 255, 0.1); border-color: #00b0ff; color: #fff;">
                            <option value="">Cargando ontología...</option>
                        </select>
                        
                        <div id="eduHelper" class="edu-helper">
                            💡 <strong>Tip VNA:</strong><br>
                            Entregable documentado/código = <span class="tg">TANGIBLE</span>.<br>
                            Transferencia de conocimiento/cultura = <span class="ig">INTANGIBLE</span>.
                        </div>
                        
                        <div class="form-row">
                            <select id="selType" class="form-control">
                                <option value="tangible">🟢 Continua (Tangible)</option>
                                <option value="intangible">🟣 Punteada (Intangible)</option>
                            </select>
                            <input type="number" id="inpHoras" class="form-control" placeholder="Hrs" value="2" style="width: 70px;" title="Horas Estimadas">
                        </div>

                        <input type="text" id="inpDesc" class="form-control" placeholder="Nombre del Entregable">
                        
                        <button class="btn btn-primary" id="btnAddFlow" style="width: 100%; margin-top: 5px; font-size: 0.85rem;">
                            ➕ Añadir a la Secuencia
                        </button>
                    </div>
                </aside>

                <div class="map-container">
                    <div class="ui-overlay">
                        <div class="interactive">
                            <div>
                                <h1 id="mapTitle" style="font-size: 2.2rem; margin: 0; letter-spacing: -1px; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">Red de Valor</h1>
                                <p style="color: #aaa; font-size: 0.85rem; margin-top: 5px;">ONTOLOGÍA: <span id="mapSector" class="badge" style="background: rgba(224, 64, 251, 0.2); color: #e040fb; border: 1px solid #e040fb;">--</span></p>
                            </div>
                        </div>
                        
                        <div class="interactive" style="display: flex; flex-direction: column; align-items: flex-end;">
                            <button class="btn btn-primary" id="btnSimulateTx" style="box-shadow: 0 0 25px rgba(0, 176, 255, 0.4); font-size: 0.8rem; padding: 8px 16px;">✨ Acción Rápida (Test)</button>
                            
                            <div class="vna-legend">
                                <h4 style="margin: 0 0 10px 0; font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 1px;">Metodología VNA</h4>
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 0.8rem; color: #ddd;">
                                    <div style="width: 25px; height: 3px; background: #00e676;"></div>
                                    <span>Valor Tangible (Activos)</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: #ddd;">
                                    <div style="width: 25px; height: 3px; border-bottom: 3px dashed #e040fb;"></div>
                                    <span>Valor Intangible (Flujos Cognitivos)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="map-canvas" id="mapCanvas">
                        <svg id="edges-svg"></svg>
                    </div>

                    <div class="diagnosis-panel interactive">
                        <h3 style="font-size: 0.85rem; color: #00b0ff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <span>🧠</span> Diagnóstico IA
                        </h3>
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px;">
                            <span style="font-size: 0.8rem; color: #888;">Maturity Index</span>
                            <span id="maturityScore" style="font-size: 1.4rem; font-weight: bold; font-family: monospace;">--%</span>
                        </div>
                        <div id="alertsContainer"></div>
                    </div>
                </div>

                <aside class="inspector-panel interactive" id="inspectorPanel">
                    <div style="padding: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                        <h2 id="insName" style="font-size: 1.5rem; margin:0;">Nodo</h2>
                        <button id="btnCloseInspector" style="background:none; border:none; color:#666; cursor:pointer; font-size: 2rem; transition: color 0.2s;">&times;</button>
                    </div>
                    <div id="inspectorBody" style="padding: 2rem; display: none;">
                        <span class="badge" id="insLevel" style="margin-bottom: 2rem; font-size: 0.8rem; padding: 6px 12px;">@rol</span>
                        <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.05);">
                            <label style="font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 1px;">Slices Generados</label>
                            <div id="insEquity" style="font-size: 2.8rem; color: #00e676; font-weight: 800; font-family: monospace; margin-top: 5px;">0</div>
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <label style="font-size: 0.75rem; color: #aaa; text-transform: uppercase;">Valor Hora (FMV)</label>
                            <input type="number" id="inputFmv" class="form-control">
                        </div>
                        <div style="margin-bottom: 2rem;">
                            <label style="font-size: 0.75rem; color: #aaa; text-transform: uppercase;">Factor Riesgo</label>
                            <input type="number" step="0.1" id="inputMult" class="form-control">
                        </div>
                        <button class="btn btn-primary" id="btnSaveRole" style="width: 100%; padding: 1.2rem; font-size: 1.1rem; box-shadow: 0 5px 15px rgba(0, 176, 255, 0.2);">✓ Actualizar Matemáticas</button>
                    </div>
                </aside>
            </div>
        `;
    }

    executeViewScript() {
        let state = store.getState();
        let project = state.projects[state.projects.length - 1];

        // 1. Fallback (Si no hay proyecto, se crea uno seguro y se asigna el sector "startup" de la ontología)
        if (!project || !project.roles || project.roles.length === 0) {
            console.warn("Inyectando Red VNA Demo...");
            store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'admin' } });
            store.dispatch({ type: 'ADD_PROJECT', payload: { id: 'demo-vna', nombre: 'Proyecto Génesis', sector: 'startup', archetype: 'startup' } });
            state = store.getState();
            project = state.projects[state.projects.length - 1];
        }

        this.activeProjectId = project.id;
        this.dom = {
            title: document.getElementById('mapTitle'),
            sector: document.getElementById('mapSector'),
            canvas: document.getElementById('mapCanvas'),
            svg: document.getElementById('edges-svg'),
            seqList: document.getElementById('sequenceList'),
            score: document.getElementById('maturityScore'),
            selFrom: document.getElementById('selFrom'),
            selTo: document.getElementById('selTo'),
            selTemplate: document.getElementById('selTemplate'),
            selType: document.getElementById('selType'),
            inpDesc: document.getElementById('inpDesc'),
            inpHoras: document.getElementById('inpHoras'),
            eduHelper: document.getElementById('eduHelper'),
            inspector: document.getElementById('inspectorPanel'),
            insBody: document.getElementById('inspectorBody')
        };

        this.dom.title.innerText = project.nombre;
        this.dom.sector.innerText = project.sector ? project.sector.toUpperCase() : 'BASE';

        this.populateDropdowns(project.roles);
        this.updateOntologyTemplates(); // Cargar catálogo de la Ontología REAL
        
        this.renderMap();
        this.renderSequence();
        this.updateDiagnosis();

        // 2. LISTENERS DEL DISEÑADOR
        // Cada vez que cambiamos "Origen", cargamos los entregables de ese rol de la Ontología
        this.dom.selFrom.addEventListener('change', () => this.updateOntologyTemplates());
        
        this.dom.selTemplate.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === "manual") {
                this.dom.inpDesc.value = '';
                this.dom.eduHelper.style.display = 'block'; 
                this.dom.inpDesc.focus();
            } else if (val !== "") {
                // Recuperar la plantilla exacta desde GLOBAL_ONTOLOGY
                const template = this.getTemplatesForLevel(this.getRoleLevel(this.dom.selFrom.value))[parseInt(val)];
                this.dom.inpDesc.value = template.name; // OJO: En ontology.js se llama "name", no "nombre"
                this.dom.selType.value = template.tipo;
                this.dom.inpHoras.value = template.estimatedHours;
                this.dom.eduHelper.style.display = 'none';
            }
        });

        document.getElementById('btnAddFlow').addEventListener('click', () => {
            const fromId = this.dom.selFrom.value;
            const toId = this.dom.selTo.value;
            const tipo = this.dom.selType.value;
            const desc = this.dom.inpDesc.value.trim();
            const horas = parseFloat(this.dom.inpHoras.value) || 1;

            if(fromId === toId) return alert("El valor debe fluir entre nodos distintos.");
            if(!desc) return alert("Escribe el nombre del entregable.");

            const hash = '0x' + Math.random().toString(16).slice(2, 10);
            store.dispatch({ type: 'ADD_TRANSACTION', payload: { projectId: this.activeProjectId, tx: { hash, from: fromId, to: toId, horas, entregable: desc, tipo, status: 'theoretical' } } });

            // UX: El Destino se convierte en el Origen para el siguiente paso
            this.dom.selFrom.value = toId; 
            this.updateOntologyTemplates();
            this.dom.inpDesc.value = ''; 
            
            this.renderSequence();
            this.drawEdges();
            this.updateDiagnosis();
        });

        // 3. LISTENERS INSPECTOR Y DRAG
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

        // Drag & Drop visual
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
        if(roles.length > 1) this.dom.selTo.selectedIndex = 1;
    }

    getRoleLevel(roleId) {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const r = p.roles.find(x => x.id === roleId);
        return r ? r.levelId : '@baixos';
    }

    // 🔥 LA MAGIA: LEER DESDE GLOBAL_ONTOLOGY
    getTemplatesForLevel(levelId) {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const sector = p.sector || 'startup'; // Si no hay sector, asume startup
        
        // Accedemos a la Base de Datos Importada
        const sectorData = GLOBAL_ONTOLOGY[sector];
        
        // Si el sector y el rol existen, extraemos sus standard_deliverables
        if (sectorData && sectorData[levelId] && sectorData[levelId].standard_deliverables) {
            return sectorData[levelId].standard_deliverables;
        }
        
        // Fallback genérico si la ontología está vacía o el rol no tiene entregables
        return [
            { name: "Documento Técnico", estimatedHours: 4, tipo: "tangible" },
            { name: "Resolución de Dudas", estimatedHours: 2, tipo: "intangible" }
        ];
    }

    updateOntologyTemplates() {
        const levelId = this.getRoleLevel(this.dom.selFrom.value);
        const templates = this.getTemplatesForLevel(levelId);
        
        let html = `<option value="">-- Catálogo de la Ontología --</option>`;
        templates.forEach((t, index) => {
            const icon = t.tipo === 'tangible' ? '🟢' : '🟣';
            // Mostramos el nombre, tipo y horas estimadas directamente en el menú
            html += `<option value="${index}">${icon} ${t.name} (${t.estimatedHours}h)</option>`;
        });
        html += `<option value="manual">✍️ Crear Manualmente...</option>`;
        
        this.dom.selTemplate.innerHTML = html;
        this.dom.inpDesc.value = '';
        this.dom.eduHelper.style.display = 'none';
    }

    // --- RESTO DE FUNCIONES DE RENDERIZADO VISUAL ---
    renderSequence() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const txs = p?.transactions || [];
        this.dom.seqList.innerHTML = '';

        if(txs.length === 0) {
            this.dom.seqList.innerHTML = `<p style="color:#666; font-size:0.8rem; text-align:center; margin-top:2rem;">El lienzo está en blanco.</p>`;
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
                <div class="step-header"><span>Paso ${index + 1}</span><span style="font-size: 0.7rem;">${tx.horas}h Est.</span></div>
                <div class="step-route"><span style="color: ${this.getColor(rFrom.levelId)}">${rFrom.levelId}</span><span style="color: #666;">&rarr;</span><span style="color: ${this.getColor(rTo.levelId)}">${rTo.levelId}</span></div>
                <div class="step-deliverable" style="color: ${color};">${tx.entregable}</div>
            `;
            this.dom.seqList.appendChild(stepEl);
        });
        this.dom.seqList.scrollTop = this.dom.seqList.scrollHeight;
    }

    renderMap() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if (!p) return;

        const harvest = store.calculateHarvest(this.activeProjectId) || [];
        const positions = {};
        this.dom.canvas.querySelectorAll('.node').forEach(n => { positions[n.dataset.id] = { left: n.style.left, top: n.style.top }; n.remove(); });

        const layout = { '@anxaneta': {x: 50, y: 15}, '@aixecador': {x: 50, y: 35}, '@dosos': {x: 35, y: 55}, '@baixos': {x: 65, y: 55}, '@pinya': {x: 50, y: 80} };
        const levelCounts = {};

        p.roles.forEach(rol => {
            const level = rol.levelId || '@baixos';
            levelCounts[level] = (levelCounts[level] || 0) + 1;
            
            const h = harvest.find(x => x.roleId === rol.id);
            const val = h ? h.totalValue : 0;
            const size = 80 + Math.min(val / 10, 60);

            const el = document.createElement('div');
            el.className = `node ${this.selectedRoleId === rol.id ? 'selected' : ''}`;
            el.dataset.id = rol.id;
            el.style.width = `${size}px`; el.style.height = `${size}px`;
            
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
                <div class="node-value">${val} ${p.archetype === 'startup' ? 'Slices' : '€'}</div>
            `;

            el.addEventListener('click', () => {
                if(this.isDragging) return;
                this.selectedRoleId = rol.id;
                this.renderMap();
                this.openInspector(rol, val, p.archetype === 'startup' ? 'Slices' : '€', this.getColor(level));
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

    openInspector(rol, val, mon, col) {
        this.dom.inspector.classList.add('open');
        this.dom.insBody.style.display = 'block';
        document.getElementById('insName').innerText = rol.name || 'Nodo';
        const b = document.getElementById('insLevel');
        b.innerText = rol.levelId || '@baixos'; b.style.color = col; b.style.borderColor = col;
        document.getElementById('insEquity').innerText = `${val} ${mon}`;
        document.getElementById('inputFmv').value = rol.fmv || 0;
        document.getElementById('inputMult').value = rol.multiplier || 1.0;
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }
    getColor(l) { return { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' }[l] || '#fff'; }
}
