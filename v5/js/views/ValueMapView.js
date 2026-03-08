// v5/js/views/ValueMapView.js
import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ValueMapView {
    constructor() {
        document.title = "Diseñador VNA | TeamTowers";
        this.activeProjectId = null;
        this.selectedRoleId = null; 
        this.editingTxIndex = null; 
        this.isDragging = false;
        this.draggedElement = null;
        this.hasMoved = false; // <-- Bandera para detectar si se ha arrastrado
        this.isSimulating = false;
        this.simulationTimeouts = [];
        this.levelHierarchy = { '@anxaneta': 1, '@aixecador': 2, '@dosos': 3, '@baixos': 4, '@pinya': 5 };
    }

    async getHtml() {
        return `
            <style>
                .vna-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', sans-serif; }
                
                /* PANEL SECUENCIAL */
                .sequence-panel { width: 340px; background: rgba(12, 12, 16, 0.95); border-right: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; z-index: 20; flex-shrink: 0; box-shadow: 10px 0 30px rgba(0,0,0,0.5);}
                .sequence-header { padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .sequence-header h2 { font-size: 1.1rem; color: white; margin: 0 0 5px 0; letter-spacing: 0.5px; }
                .sequence-header p { font-size: 0.75rem; color: #888; margin: 0; }
                .sequence-body { flex: 1; overflow-y: auto; padding: 1rem; }
                
                .flow-step { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 10px; margin-bottom: 10px; font-size: 0.8rem; display: flex; flex-direction: column; gap: 5px; transition: all 0.3s; position: relative;}
                .flow-step.simulating { transform: scale(1.05); border-color: #00b0ff; box-shadow: 0 0 15px rgba(0, 176, 255, 0.3); }
                .step-header { display: flex; justify-content: space-between; align-items: center; color: #aaa; font-family: monospace; }
                .step-route { display: flex; align-items: center; gap: 5px; font-weight: bold; color: white; }
                .step-deliverable { color: #00b0ff; text-transform: uppercase; font-size: 0.75rem; }

                .step-actions { display: flex; gap: 4px; margin-top: 5px; justify-content: flex-end; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 5px;}
                .btn-step { background: rgba(255,255,255,0.05); border: none; color: #aaa; border-radius: 4px; padding: 3px 6px; cursor: pointer; font-size: 0.7rem; transition: background 0.2s;}
                .btn-step:hover { background: rgba(255,255,255,0.15); color: white; }
                .btn-step.del:hover { background: rgba(255, 82, 82, 0.2); color: #ff5252; }

                .sequence-footer { padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.3); transition: background 0.3s; }
                .sequence-footer.edit-mode { background: rgba(0, 176, 255, 0.1); border-top: 1px solid #00b0ff; }
                
                .form-control { width: 100%; background: #000; border: 1px solid #333; color: white; padding: 10px; border-radius: 6px; margin-bottom: 10px; font-size: 0.85rem; transition: border-color 0.2s;}
                .form-control:focus { border-color: #00b0ff; outline: none; }
                .form-row { display: flex; gap: 10px; }

                /* LIENZO PRINCIPAL */
                .map-container { flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; }
                .map-canvas { flex: 1; position: relative; width: 100%; height: 100%; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 40px 40px; }
                #edges-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
                
                .edge-line { fill: none; stroke-width: 2.5; opacity: 0.85; transition: stroke 0.3s; }
                .edge-tangible { stroke: #00e676; }
                .edge-intangible { stroke: #e040fb; stroke-dasharray: 6, 6; animation: dashAnim 15s linear infinite; }
                .edge-sick { stroke: #ff5252 !important; stroke-width: 4 !important; filter: drop-shadow(0 0 8px #ff5252); }
                @keyframes dashAnim { to { stroke-dashoffset: -500; } }
                @keyframes drawLine { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }

                .node { position: absolute; z-index: 5; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: grab; transition: transform 0.2s, box-shadow 0.3s, border-color 0.3s; background: rgba(15, 15, 20, 0.95); backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.1); color: white; transform: translate(-50%, -50%); user-select: none; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                .node:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.05); }
                .node.selected { border-color: #00b0ff !important; box-shadow: 0 0 35px rgba(0, 176, 255, 0.6); z-index: 10; }
                .node.sick-node { border-color: #ff5252 !important; box-shadow: 0 0 40px rgba(255, 82, 82, 0.8); animation: pulseSick 1s infinite alternate; z-index: 15; }
                .node-name { font-size: 0.7rem; margin-top: 5px; pointer-events: none; text-transform: uppercase; width: 85%; font-weight: bold; line-height: 1.1; }

                @keyframes pulseSick { from { transform: translate(-50%, -50%) scale(1); } to { transform: translate(-50%, -50%) scale(1.15); } }

                .ui-overlay { position: absolute; top: 0; left: 0; width: 100%; padding: 1.5rem; z-index: 100; pointer-events: none; display: flex; justify-content: space-between; align-items: flex-start;}
                .interactive { pointer-events: auto; }
                .action-panel { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
                .vna-legend { background: rgba(10, 10, 15, 0.9); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; pointer-events: auto; backdrop-filter: blur(10px); display: flex; flex-direction: column; gap: 10px; }
                #sickAlert { display: none; background: rgba(255, 82, 82, 0.1); border: 1px solid #ff5252; color: #ff5252; padding: 10px; border-radius: 8px; font-size: 0.75rem; font-weight: bold; max-width: 200px; text-align: right; }

                /* INSPECTOR */
                .inspector-panel { position: absolute; top: 0; right: 0; height: 100%; width: 380px; background: #0c0c10; border-left: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 1000; box-shadow: -10px 0 30px rgba(0,0,0,0.7); overflow-y: auto;}
                .inspector-panel.open { transform: translateX(0); }
                
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: none; justify-content: center; align-items: center; z-index: 2000; }
                .modal-content { background: #121216; border: 1px solid #333; padding: 2rem; border-radius: 12px; width: 350px; }

                .btn { padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; border: none; font-size: 0.9rem; transition: transform 0.2s;}
                .btn:hover { transform: translateY(-2px); }
                .btn-play { background: #00b0ff; color: black; box-shadow: 0 0 20px rgba(0, 176, 255, 0.3); }
                .btn-stop { background: #333; color: white; display: none; }

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
                        <p>Diseña el flujo de valor organizativo.</p>
                    </div>
                    <div class="sequence-body interactive" id="sequenceList"></div>
                    <div class="sequence-footer interactive" id="seqFooter">
                        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span id="formTitle" style="font-size:0.75rem; color:#00b0ff; font-weight:bold; text-transform:uppercase;">Añadir Transacción</span>
                            <button class="btn-step" id="btnCancelEditFlow" style="display:none;">Cancelar Edición</button>
                        </div>

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
                                <option value="tangible">🟢 Tangible</option>
                                <option value="intangible">🟣 Intangible</option>
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
                            <p style="color: #888; font-size: 0.8rem; margin: 5px 0 0 0;">Arrástralos para organizar. 1 clic: Conectar | Doble clic: Editar</p>
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
                        <h2 id="insTitleLabel" style="font-size: 1.5rem; margin:0; color: white;">Editar Nodo</h2>
                        <button id="btnCloseInspector" style="background:none; border:none; color:#666; cursor:pointer; font-size: 2rem;">&times;</button>
                    </div>
                    <div style="padding: 2rem; padding-top: 0;">
                        
                        <div class="form-group" style="margin-bottom: 1rem;">
                            <label style="font-size: 0.75rem; color: #aaa;">Nivel Estructural</label>
                            <select id="insLevel" class="form-control" style="font-weight: bold;">
                                <option value="@anxaneta">@anxaneta</option>
                                <option value="@aixecador">@aixecador</option>
                                <option value="@dosos">@dosos</option>
                                <option value="@baixos">@baixos</option>
                                <option value="@pinya">@pinya</option>
                            </select>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.5rem;">
                            <label style="font-size: 0.75rem; color: #aaa;">Nombre del Rol</label>
                            <input type="text" id="insName" class="form-control">
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <label style="font-size: 0.75rem; color: #aaa;">Valor Mercado (FMV €/h)</label>
                            <input type="number" id="inputFmv" class="form-control">
                        </div>
                        <div style="margin-bottom: 2rem;">
                            <label style="font-size: 0.75rem; color: #aaa;">Factor de Riesgo Multiplicador</label>
                            <input type="number" step="0.1" id="inputMult" class="form-control">
                        </div>

                        <button class="btn" style="background: #00b0ff; color: white; width: 100%; margin-bottom: 1rem;" id="btnSaveRole">✓ Guardar Cambios</button>
                        <button class="btn" style="background: transparent; border: 1px solid #ff5252; color: #ff5252; width: 100%;" id="btnDeleteRole">🗑️ Archivar Nodo</button>
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
        Sidebar.initListeners();

        let state = store.getState();
        let project = state.projects[state.projects.length - 1];

        if (!project || !project.roles) return;
        this.activeProjectId = project.id;
        
        this.dom = {
            title: document.getElementById('mapTitle'),
            canvas: document.getElementById('mapCanvas'),
            svg: document.getElementById('edges-svg'),
            seqList: document.getElementById('sequenceList'),
            seqFooter: document.getElementById('seqFooter'),
            selFrom: document.getElementById('selFrom'),
            selTo: document.getElementById('selTo'),
            selTemplate: document.getElementById('selTemplate'),
            selType: document.getElementById('selType'),
            inpDesc: document.getElementById('inpDesc'),
            inpHoras: document.getElementById('inpHoras'),
            btnAddFlow: document.getElementById('btnAddFlow'),
            btnCancelEditFlow: document.getElementById('btnCancelEditFlow'),
            formTitle: document.getElementById('formTitle'),
            
            inspector: document.getElementById('inspectorPanel'),
            insName: document.getElementById('insName'),
            insLevel: document.getElementById('insLevel'),
            inputFmv: document.getElementById('inputFmv'),
            inputMult: document.getElementById('inputMult'),
            
            btnSimulate: document.getElementById('btnSimulate'),
            btnStopSim: document.getElementById('btnStopSim'),
            sickAlert: document.getElementById('sickAlert')
        };

        this.dom.title.innerText = project.nombre;

        this.populateDropdowns(project.roles);
        this.updateOntologyTemplates(); 
        this.renderMap();
        this.renderSequence();

        // ------------------ WIZARD DE FLUJOS ------------------
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

        this.dom.btnAddFlow.addEventListener('click', () => {
            const fromId = this.dom.selFrom.value;
            const toId = this.dom.selTo.value;
            const desc = this.dom.inpDesc.value.trim();
            if(fromId === toId) return alert("El valor debe fluir entre nodos distintos.");
            if(!desc) return alert("Escribe el nombre del entregable.");

            const currentState = store.getState();
            const pIndex = currentState.projects.findIndex(x => x.id === this.activeProjectId);
            
            if (this.editingTxIndex !== null) {
                currentState.projects[pIndex].transactions[this.editingTxIndex] = {
                    ...currentState.projects[pIndex].transactions[this.editingTxIndex],
                    from: fromId, to: toId, horas: parseFloat(this.dom.inpHoras.value)||1, entregable: desc, tipo: this.dom.selType.value
                };
                this.exitEditMode();
            } else {
                store.dispatch({ 
                    type: 'ADD_TRANSACTION', 
                    payload: { projectId: this.activeProjectId, tx: { hash: '0x'+Math.random().toString(16).slice(2,10), from: fromId, to: toId, horas: parseFloat(this.dom.inpHoras.value)||1, entregable: desc, tipo: this.dom.selType.value, status: 'theoretical' } } 
                });
            }

            this.forceSaveState(currentState);
            this.dom.selFrom.value = toId; 
            this.updateOntologyTemplates();
            this.dom.inpDesc.value = ''; 
        });

        this.dom.btnCancelEditFlow.addEventListener('click', () => this.exitEditMode());

        this.dom.seqList.addEventListener('click', (e) => {
            const target = e.target;
            const idx = parseInt(target.getAttribute('data-idx'));
            if (isNaN(idx)) return;

            const currentState = store.getState();
            const p = currentState.projects.find(x => x.id === this.activeProjectId);
            const txs = p.transactions;

            if (target.classList.contains('btn-move-up')) {
                [txs[idx - 1], txs[idx]] = [txs[idx], txs[idx - 1]];
                this.forceSaveState(currentState);
            } 
            else if (target.classList.contains('btn-move-down')) {
                [txs[idx], txs[idx + 1]] = [txs[idx + 1], txs[idx]];
                this.forceSaveState(currentState);
            } 
            else if (target.classList.contains('btn-del')) {
                if(confirm('¿Eliminar transacción del flujo?')) {
                    txs.splice(idx, 1);
                    if(this.editingTxIndex === idx) this.exitEditMode();
                    this.forceSaveState(currentState);
                }
            }
            else if (target.classList.contains('btn-edit')) {
                this.enterEditMode(idx, txs[idx]);
            }
        });

        // ------------------ MAPA Y NODOS ------------------
        this.dom.btnSimulate.addEventListener('click', () => this.startSimulation());
        this.dom.btnStopSim.addEventListener('click', () => this.stopSimulation());

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

        // ------------------ INSPECTOR DE NODOS ------------------
        document.getElementById('btnCloseInspector').addEventListener('click', () => {
            this.dom.inspector.classList.remove('open');
            this.selectedRoleId = null;
            this.renderMap();
        });

        document.getElementById('btnSaveRole').addEventListener('click', () => {
            const fmv = parseFloat(this.dom.inputFmv.value) || 0;
            const mult = parseFloat(this.dom.inputMult.value) || 1.0;
            const name = this.dom.insName.value.trim();
            const level = this.dom.insLevel.value;

            if(!name) return alert("El nombre no puede estar vacío.");

            const currentState = store.getState();
            const pIndex = currentState.projects.findIndex(x => x.id === this.activeProjectId);
            const rIndex = currentState.projects[pIndex].roles.findIndex(r => r.id === this.selectedRoleId);
            
            if (rIndex > -1) {
                currentState.projects[pIndex].roles[rIndex].name = name;
                currentState.projects[pIndex].roles[rIndex].levelId = level;
                currentState.projects[pIndex].roles[rIndex].fmv = fmv;
                currentState.projects[pIndex].roles[rIndex].multiplier = mult;
                this.forceSaveState(currentState);
            }
        });

        document.getElementById('btnDeleteRole').addEventListener('click', () => {
            if(confirm('¿Archivar este nodo? Desaparecerá del mapa, pero las transacciones antiguas se mantendrán.')) {
                const currentState = store.getState();
                const pIndex = currentState.projects.findIndex(x => x.id === this.activeProjectId);
                const rIndex = currentState.projects[pIndex].roles.findIndex(r => r.id === this.selectedRoleId);
                
                if (rIndex > -1) {
                    currentState.projects[pIndex].roles[rIndex].isArchived = true;
                    this.selectedRoleId = null;
                    this.dom.inspector.classList.remove('open');
                    this.forceSaveState(currentState);
                }
            }
        });

        // ------------------ DRAG & CLICK LOGIC (ARREGLADO) ------------------
        this.dom.canvas.addEventListener('mousedown', (e) => {
            const node = e.target.closest('.node');
            if (node && !this.isSimulating) { 
                this.isDragging = true; 
                this.hasMoved = false; // Reset al pulsar
                this.draggedElement = node; 
                node.style.zIndex = 1000; 
            }
        });
        
        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.draggedElement) return;
            this.hasMoved = true; // El ratón se ha movido (Es un Arrastre)
            const rect = this.dom.canvas.getBoundingClientRect();
            this.draggedElement.style.left = `${((e.clientX - rect.left) / rect.width) * 100}%`;
            this.draggedElement.style.top = `${((e.clientY - rect.top) / rect.height) * 100}%`;
            this.drawEdges();
        });
        
        window.addEventListener('mouseup', () => { 
            if (this.draggedElement) this.draggedElement.style.zIndex = 5;
            this.isDragging = false; 
            this.draggedElement = null; 
        });
        
        window.addEventListener('resize', () => { if(!this.isSimulating) this.drawEdges(); });
    }

    // --- MÉTODOS DE EDICIÓN ---
    enterEditMode(idx, tx) {
        this.editingTxIndex = idx;
        this.dom.seqFooter.classList.add('edit-mode');
        this.dom.formTitle.innerText = `Editando Paso ${idx + 1}`;
        this.dom.formTitle.style.color = '#ff9100';
        this.dom.btnCancelEditFlow.style.display = 'block';
        this.dom.btnAddFlow.innerText = '✓ Actualizar Transacción';
        this.dom.btnAddFlow.style.background = '#00b0ff';

        this.dom.selFrom.value = tx.from;
        this.dom.selTo.value = tx.to;
        this.dom.selType.value = tx.tipo;
        this.dom.inpHoras.value = tx.horas;
        this.dom.inpDesc.value = tx.entregable;
    }

    exitEditMode() {
        this.editingTxIndex = null;
        this.dom.seqFooter.classList.remove('edit-mode');
        this.dom.formTitle.innerText = `Añadir Transacción`;
        this.dom.formTitle.style.color = '#00b0ff';
        this.dom.btnCancelEditFlow.style.display = 'none';
        this.dom.btnAddFlow.innerText = '➕ Añadir a Secuencia';
        this.dom.btnAddFlow.style.background = '#00e676';
        this.dom.inpDesc.value = '';
    }

    forceSaveState(newState) {
        store.state = newState;
        localStorage.setItem('tt_sos_state', JSON.stringify(store.state));
        
        const pUpdate = store.state.projects.find(x => x.id === this.activeProjectId);
        this.populateDropdowns(pUpdate.roles);
        this.renderMap();
        this.renderSequence();
    }


    // --- SIMULACIÓN ---
    startSimulation() {
        if (this.isSimulating) return;
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const txs = p?.transactions || [];
        if (txs.length === 0) return alert("Añade transacciones para simular el flujo.");

        this.isSimulating = true;
        this.dom.btnSimulate.style.display = 'none';
        this.dom.btnStopSim.style.display = 'block';
        this.dom.sickAlert.style.display = 'none';
        this.dom.svg.innerHTML = '';
        
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `<marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="context-stroke"/></marker>`;
        this.dom.svg.appendChild(defs);

        const stepEls = this.dom.seqList.querySelectorAll('.flow-step');
        stepEls.forEach(el => el.classList.remove('simulating'));
        this.dom.canvas.querySelectorAll('.node').forEach(n => n.classList.remove('sick-node'));

        let delayAccumulator = 0;
        const timePerStep = 2000;

        txs.forEach((tx, index) => {
            const timeoutId = setTimeout(() => {
                stepEls.forEach(el => el.classList.remove('simulating'));
                if(stepEls[index]) {
                    stepEls[index].classList.add('simulating');
                    stepEls[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                const r1 = p.roles.find(r => r.id === tx.from);
                const r2 = p.roles.find(r => r.id === tx.to);
                let isSickFlow = false;

                if (r1 && r2) {
                    const level1 = this.levelHierarchy[r1.levelId];
                    const level2 = this.levelHierarchy[r2.levelId];
                    if (Math.abs(level1 - level2) > 1) {
                        isSickFlow = true;
                        this.dom.sickAlert.style.display = 'block';
                        const dom1 = this.dom.canvas.querySelector(`.node[data-id="${r1.id}"]`);
                        const dom2 = this.dom.canvas.querySelector(`.node[data-id="${r2.id}"]`);
                        if(dom1) dom1.classList.add('sick-node');
                        if(dom2) dom2.classList.add('sick-node');
                    } else {
                        this.dom.sickAlert.style.display = 'none';
                        this.dom.canvas.querySelectorAll('.node').forEach(n => n.classList.remove('sick-node'));
                    }
                }
                this.drawSingleEdgeAnim(tx, index, p, isSickFlow);

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
        
        this.simulationTimeouts.forEach(id => clearTimeout(id));
        this.simulationTimeouts = [];

        const stepEls = this.dom.seqList.querySelectorAll('.flow-step');
        stepEls.forEach(el => el.classList.remove('simulating'));
        this.dom.canvas.querySelectorAll('.node').forEach(n => n.classList.remove('sick-node'));

        this.drawEdges();
    }

    drawSingleEdgeAnim(tx, index, project, isSick) {
        // Query Segura del DOM en tiempo real
        const dom1 = this.dom.canvas.querySelector(`.node[data-id="${tx.from}"]`);
        const dom2 = this.dom.canvas.querySelector(`.node[data-id="${tx.to}"]`);
        
        if (!dom1 || !dom2) return;

        const rect1 = dom1.getBoundingClientRect();
        const rect2 = dom2.getBoundingClientRect();
        const canv = this.dom.canvas.getBoundingClientRect();
        const x1 = rect1.left + rect1.width / 2 - canv.left;
        const y1 = rect1.top + rect1.height / 2 - canv.top;
        const x2 = rect2.left + rect2.width / 2 - canv.left;
        const y2 = rect2.top + rect2.height / 2 - canv.top;

        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2);
        line.setAttribute('marker-end', 'url(#arrow)');
        
        line.style.strokeDasharray = distance;
        line.style.strokeDashoffset = distance;
        line.style.animation = `drawLine 0.8s ease-out forwards`;
        
        // Uso de setAttribute en SVG para máxima compatibilidad
        const lineClass = isSick ? 'edge-sick' : (tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible');
        line.setAttribute('class', `edge-line ${lineClass}`);

        this.dom.svg.appendChild(line);

        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', (x1+x2)/2); txt.setAttribute('y', (y1+y2)/2 - 8);
        txt.setAttribute('text-anchor', 'middle');
        txt.style.cssText = `fill:${isSick ? '#ff5252' : (tx.tipo==='tangible'?'#00e676':'#e040fb')};font-size:14px;font-weight:900;font-family:monospace;paint-order:stroke;stroke:#111;stroke-width:5px; opacity: 0; transition: opacity 0.5s;`;
        txt.textContent = `[${index + 1}]`;
        
        setTimeout(() => txt.style.opacity = '1', 400); 
        this.dom.svg.appendChild(txt);
    }

    // Funciones estándar
    populateDropdowns(roles) {
        const options = roles.filter(r => !r.isArchived).map(r => `<option value="${r.id}">${r.levelId} - ${r.name}</option>`).join('');
        this.dom.selFrom.innerHTML = options;
        this.dom.selTo.innerHTML = options;
        if(roles.length > 1 && this.dom.selTo.options.length > 1) this.dom.selTo.selectedIndex = 1;
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
        if(this.editingTxIndex === null) this.dom.inpDesc.value = '';
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
            
            const actions = `
                <div class="step-actions">
                    ${i > 0 ? `<button class="btn-step btn-move-up" data-idx="${i}">↑</button>` : ''}
                    ${i < txs.length - 1 ? `<button class="btn-step btn-move-down" data-idx="${i}">↓</button>` : ''}
                    <button class="btn-step btn-edit" data-idx="${i}">✎</button>
                    <button class="btn-step del btn-del" data-idx="${i}">🗑️</button>
                </div>
            `;

            stepEl.innerHTML = `
                <div class="step-header"><span>Paso ${i + 1}</span><span style="font-size: 0.7rem;">${tx.horas}h Est.</span></div>
                <div class="step-route"><span style="color: ${this.getColor(rFrom.levelId)}">${rFrom.levelId}</span> <span style="color:#666;">&rarr;</span> <span style="color: ${this.getColor(rTo.levelId)}">${rTo.levelId}</span></div>
                <div class="step-deliverable" style="color: ${color};">${tx.entregable}</div>
                ${actions}
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

            // 1 CLIC: SELECCIONAR PARA CONECTAR
            el.addEventListener('click', (e) => {
                if(this.hasMoved || this.isSimulating) return; // Si ha arrastrado, ignora el clic
                
                if (this.selectedRoleId && this.selectedRoleId !== rol.id) {
                    this.dom.selFrom.value = this.selectedRoleId;
                    this.dom.selTo.value = rol.id;
                    this.updateOntologyTemplates();
                }

                this.selectedRoleId = rol.id;
                this.renderMap();
            });

            // DOBLE CLIC: ABRIR INSPECTOR DE EDICIÓN
            el.addEventListener('dblclick', (e) => {
                if(this.isSimulating) return;
                this.dom.inspector.classList.add('open');
                this.dom.insName.value = rol.name;
                this.dom.insLevel.value = rol.levelId;
                this.dom.inputFmv.value = rol.fmv || 0;
                this.dom.inputMult.value = rol.multiplier || 1.0;
            });

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
            // SAFE DOM QUERY (La clave para que no desaparezcan)
            const dom1 = this.dom.canvas.querySelector(`.node[data-id="${tx.from}"]`);
            const dom2 = this.dom.canvas.querySelector(`.node[data-id="${tx.to}"]`);
            
            if (dom1 && dom2 && tx.from !== tx.to) {
                const rect1 = dom1.getBoundingClientRect();
                const rect2 = dom2.getBoundingClientRect();
                const canv = this.dom.canvas.getBoundingClientRect();
                
                const x1 = rect1.left + rect1.width / 2 - canv.left;
                const y1 = rect1.top + rect1.height / 2 - canv.top;
                const x2 = rect2.left + rect2.width / 2 - canv.left;
                const y2 = rect2.top + rect2.height / 2 - canv.top;

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x2); line.setAttribute('y2', y2);
                line.setAttribute('marker-end', 'url(#arrow)');
                
                const lineClass = tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible';
                line.setAttribute('class', `edge-line ${lineClass}`);
                
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
