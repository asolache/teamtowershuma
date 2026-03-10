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
        this.hasMoved = false; 
        this.isSimulating = false;
        this.simulationTimeouts = [];
        this.levelHierarchy = { '@anxaneta': 1, '@aixecador': 2, '@dosos': 3, '@baixos': 4, '@pinya': 5 };
    }

    async getHtml() {
        return `
            <style>
                /* LAYOUT ESPECÍFICO DEL MAPA VNA */
                .vna-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: var(--bg-dark); }
                
                /* PANEL SECUENCIAL (Izquierda) */
                .sequence-panel { width: 340px; background: var(--glass-bg); border-right: 1px solid var(--glass-border); backdrop-filter: var(--glass-blur); display: flex; flex-direction: column; z-index: 20; flex-shrink: 0; box-shadow: 10px 0 30px rgba(0,0,0,0.5);}
                .sequence-header { padding: 1.5rem; border-bottom: 1px solid var(--glass-border); }
                .sequence-header h2 { font-size: 1.1rem; color: var(--text-main); margin: 0 0 5px 0; letter-spacing: 0.5px; }
                .sequence-body { flex: 1; overflow-y: auto; padding: 1rem; scroll-behavior: smooth; }
                
                .flow-step { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-sm); padding: 10px; margin-bottom: 10px; font-size: 0.8rem; display: flex; flex-direction: column; gap: 5px; transition: all 0.3s; position: relative;}
                .flow-step.simulating { transform: scale(1.05); border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.3); }
                .step-header { display: flex; justify-content: space-between; align-items: center; color: var(--text-muted); font-family: var(--font-mono); }
                .step-route { display: flex; align-items: center; gap: 5px; font-weight: bold; color: var(--text-main); }
                
                /* Animación de Feedback al mover un entregable */
                .flash-highlight { animation: flashHighlight 0.6s ease-out forwards; }
                @keyframes flashHighlight { 0% { background: rgba(0, 176, 255, 0.3); transform: scale(1.03); border-color: var(--accent-blue);} 100% { background: rgba(255,255,255,0.02); transform: scale(1); border-color: var(--glass-border);} }

                /* Mini-botones de la Secuencia */
                .step-actions { display: flex; gap: 6px; margin-top: 5px; justify-content: flex-end; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px;}
                .btn-step { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); border-radius: 6px; padding: 4px 8px; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .btn-step:hover { background: rgba(255,255,255,0.15); color: white; border-color: var(--text-muted); }
                .btn-step.del:hover { background: rgba(255, 82, 82, 0.15); color: var(--accent-red); border-color: var(--accent-red); }
                
                .sequence-footer { padding: 1.5rem; border-top: 1px solid var(--glass-border); background: rgba(0,0,0,0.3); transition: background 0.3s; }
                .sequence-footer.edit-mode { background: rgba(0, 176, 255, 0.1); border-top: 1px solid var(--accent-blue); }

                /* LIENZO PRINCIPAL (Centro) */
                .map-container { flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; }
                .map-canvas { flex: 1; position: relative; width: 100%; height: 100%; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 40px 40px; }
                #edges-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
                
                .edge-line { fill: none; stroke-width: 2.5; opacity: 0.85; transition: stroke 0.3s; }
                .edge-tangible { stroke: var(--accent-green); }
                .edge-intangible { stroke: var(--accent-purple); stroke-dasharray: 6, 6; animation: dashAnim 15s linear infinite; }
                .edge-sick { stroke: var(--accent-red) !important; stroke-width: 4 !important; filter: drop-shadow(0 0 8px var(--accent-red)); }
                
                .node { position: absolute; z-index: 5; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: grab; transition: transform 0.2s, box-shadow 0.3s, border-color 0.3s, opacity 0.3s; background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 2px solid var(--glass-border); color: white; transform: translate(-50%, -50%); user-select: none; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                .node:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.05); }
                .node.selected { border-color: var(--accent-blue) !important; box-shadow: 0 0 35px rgba(0, 176, 255, 0.6); z-index: 10; }
                .node.sick-node { border-color: var(--accent-red) !important; box-shadow: 0 0 40px rgba(255, 82, 82, 0.8); animation: pulseSick 1s infinite alternate; z-index: 15; }
                
                /* GHOST NODES */
                .node.ghost-node { opacity: 0.3; border-style: dashed; filter: grayscale(100%); z-index: 1; }
                .node.ghost-node:hover { opacity: 0.6; }
                .node.ghost-node .node-name { text-decoration: line-through; color: #888; }

                /* NOMBRES DE ROLES TRUNCADOS */
                .node-name { font-size: 0.7rem; margin-top: 5px; pointer-events: none; text-transform: uppercase; width: 90%; font-weight: bold; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; padding: 0 2px;}

                /* TOOLTIP DE TRANSACCIÓN */
                .tx-number { pointer-events: auto; cursor: pointer; transition: transform 0.2s, fill 0.2s; }
                .tx-number:hover { transform: scale(1.4); fill: white !important; }
                
                .tx-tooltip { position: absolute; background: rgba(15, 15, 20, 0.98); border: 1px solid var(--accent-blue); color: white; padding: 15px; border-radius: 8px; font-size: 0.85rem; z-index: 2000; pointer-events: none; box-shadow: 0 15px 40px rgba(0,0,0,0.8); backdrop-filter: blur(5px); opacity: 0; transition: opacity 0.2s, transform 0.2s; transform: translateY(10px); min-width: 250px; max-width: 300px; line-height: 1.4;}
                .tx-tooltip.visible { opacity: 1; pointer-events: auto; transform: translateY(0); }

                .ui-overlay { position: absolute; top: 0; left: 0; width: 100%; padding: 1.5rem; z-index: 100; pointer-events: none; display: flex; justify-content: space-between; align-items: flex-start;}
                .interactive { pointer-events: auto; }
                .action-panel { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }

                /* INSPECTOR DE NODOS (Derecha) */
                .inspector-panel { position: absolute; top: 0; right: 0; height: 100%; width: 380px; background: var(--bg-panel); border-left: 1px solid var(--glass-border); display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 1000; box-shadow: -10px 0 30px rgba(0,0,0,0.7); overflow-y: auto;}
                .inspector-panel.open { transform: translateX(0); }

                @media (max-width: 768px) {
                    .vna-layout { flex-direction: column; }
                    .sequence-panel { width: 100%; max-height: 250px; border-right: none; border-bottom: 1px solid var(--glass-border); flex-shrink: 0; }
                    .ui-overlay h1 { font-size: 1.2rem; }
                    .inspector-panel { width: 100%; }
                }
            </style>

            <div class="vna-layout">
                ${Sidebar.getHtml('/map')}

                <aside class="sequence-panel" id="seqPanel">
                    <div class="sequence-header interactive">
                        <h2>Flujos de Valor (Kanban)</h2>
                        <p style="color: var(--text-muted); font-size: 0.8rem; margin:0;">Diseña el circuito de entregables.</p>
                    </div>
                    <div class="sequence-body interactive" id="sequenceList"></div>
                    <div class="sequence-footer interactive" id="seqFooter">
                        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span id="formTitle" style="font-size:0.75rem; color:var(--accent-blue); font-weight:bold; text-transform:uppercase;">Añadir Transacción</span>
                            <button class="btn btn-outline" style="padding: 2px 5px; font-size: 0.7rem; display:none;" id="btnCancelEditFlow">Cancelar Edición</button>
                        </div>

                        <div class="form-group" style="margin-bottom: 10px; display: flex; gap: 10px;">
                            <select id="selFrom" class="form-control" title="Origen"></select>
                            <span style="color: var(--text-muted); align-self: center;">&rarr;</span>
                            <select id="selTo" class="form-control" title="Destino"></select>
                        </div>
                        <div class="form-group" style="margin-bottom: 10px;">
                            <select id="selTemplate" class="form-control" style="background: rgba(0, 176, 255, 0.1); border-color: var(--accent-blue);">
                                <option value="">Cargando ontología...</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 10px; display: flex; gap: 10px;">
                            <select id="selType" class="form-control">
                                <option value="tangible">🟢 Tangible (Doc/Código)</option>
                                <option value="intangible">🟣 Intangible (Sync/Cultura)</option>
                            </select>
                            <input type="number" id="inpHoras" class="form-control" placeholder="Hrs" value="2" style="width: 70px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 10px;">
                            <input type="text" id="inpDesc" class="form-control" placeholder="Nombre del Entregable">
                        </div>
                        <button class="btn btn-success" style="width: 100%; margin-top: 5px;" id="btnAddFlow">➕ Añadir a Secuencia</button>
                    </div>
                </aside>

                <div class="map-container">
                    <div class="ui-overlay">
                        <div class="interactive">
                            <h1 id="mapTitle" style="font-size: 2rem; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">Red de Valor</h1>
                            <p style="color: var(--text-muted); font-size: 0.8rem; margin: 5px 0 0 0;">Arrástralos. Doble clic: Editar | Clic en [1]: Info</p>
                        </div>
                        <div class="action-panel interactive">
                            <div style="display: flex; gap: 10px;">
                                <button class="btn btn-primary" id="btnSimulate">▶ Simular Flujo</button>
                                <button class="btn btn-outline" id="btnStopSim" style="display:none;">⏹ Detener</button>
                            </div>
                            <button class="btn btn-outline" style="margin-top: 10px; width: 100%;" id="btnOpenAddNode">➕ Nuevo Nodo</button>
                            
                            <div class="glass-panel" style="padding: 1rem; margin-top: 10px; display: flex; flex-direction: column; gap: 10px; width: 100%;">
                                <div style="display: flex; gap: 10px; font-size: 0.75rem; color: #ddd;"><div style="width: 20px; height: 3px; background: var(--accent-green); margin-top:6px;"></div> Tangible</div>
                                <div style="display: flex; gap: 10px; font-size: 0.75rem; color: #ddd;"><div style="width: 20px; height: 3px; border-bottom: 2px dashed var(--accent-purple); margin-top:5px;"></div> Intangible</div>
                            </div>
                            <div id="sickAlert" style="display: none; background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 10px; border-radius: 8px; font-size: 0.75rem; font-weight: bold; max-width: 200px; text-align: right; margin-top: 10px;">⚠️ DIAGNÓSTICO:<br>Salto estructural excesivo detectado.</div>
                        </div>
                    </div>
                    
                    <div class="map-canvas" id="mapCanvas">
                        <svg id="edges-svg"></svg>
                    </div>
                    
                    <div id="txTooltip" class="tx-tooltip"></div>
                </div>

                <aside class="inspector-panel interactive" id="inspectorPanel">
                    <div style="padding: 2rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;">
                        <h2 id="insTitleLabel" style="font-size: 1.5rem; margin:0; color: white;">Editar Nodo</h2>
                        <button id="btnCloseInspector" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size: 2rem;">&times;</button>
                    </div>
                    <div style="padding: 2rem; padding-top: 0;">
                        <div class="form-group" style="margin-top: 1.5rem;">
                            <label>Nivel Estructural</label>
                            <select id="insLevel" class="form-control" style="font-weight: bold;">
                                <option value="@anxaneta">@anxaneta</option>
                                <option value="@aixecador">@aixecador</option>
                                <option value="@dosos">@dosos</option>
                                <option value="@baixos">@baixos</option>
                                <option value="@pinya">@pinya</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Nombre del Rol</label>
                            <input type="text" id="insName" class="form-control">
                        </div>
                        <div class="form-group">
                            <label>Valor Mercado (FMV €/h)</label>
                            <input type="number" id="inputFmv" class="form-control">
                        </div>
                        <div class="form-group" style="margin-bottom: 2rem;">
                            <label>Factor de Riesgo Multiplicador</label>
                            <input type="number" step="0.1" id="inputMult" class="form-control">
                        </div>
                        <button class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;" id="btnSaveRole">✓ Guardar Cambios</button>
                        <button class="btn btn-outline" style="border-color: var(--accent-red); color: var(--accent-red); width: 100%;" id="btnDeleteRole">🗑️ Archivar Nodo</button>
                    </div>
                </aside>

                <div class="modal-overlay" id="addNodeModal">
                    <div class="modal-content">
                        <h3 style="color: white; margin-bottom: 1.5rem;">Instanciar Nodo</h3>
                        <div class="form-group">
                            <label>Nombre</label>
                            <input type="text" id="inpNewNodeName" class="form-control" placeholder="Ej: Especialista SEO">
                        </div>
                        <div class="form-group">
                            <label>Nivel</label>
                            <select id="selNewNodeLevel" class="form-control">
                                <option value="@anxaneta">@anxaneta</option>
                                <option value="@aixecador">@aixecador</option>
                                <option value="@dosos">@dosos</option>
                                <option value="@baixos" selected>@baixos</option>
                                <option value="@pinya">@pinya</option>
                            </select>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
                            <button class="btn btn-outline" id="btnCancelNode">Cancelar</button>
                            <button class="btn btn-primary" id="btnConfirmNode">Añadir Nodo</button>
                        </div>
                    </div>
                </div>

                <div class="modal-overlay" id="triageModal">
                    <div class="modal-content" style="width: 450px;">
                        <h3 style="color: var(--accent-orange); margin-top:0; margin-bottom: 1rem;">⚠️ Tareas Huérfanas Detectadas</h3>
                        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem;">
                            Este nodo tiene <strong id="triageCount" style="color: white; font-size: 1.2rem;">0</strong> transacciones activas o pendientes. 
                            Archivar el nodo requiere decidir el destino de estas tareas.
                        </p>
                        
                        <div class="form-group" style="margin-bottom: 2rem;">
                            <label>Reasignar tareas al Nodo Activo:</label>
                            <select id="selTriageNode" class="form-control"></select>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button class="btn btn-primary" id="btnTriageReassign">Migrar Tareas y Archivar Nodo</button>
                            <button class="btn btn-outline" style="border-color: var(--accent-red); color: var(--accent-red);" id="btnTriageDelete">Destruir Tareas y Archivar Nodo</button>
                            <button class="btn btn-outline" id="btnTriageCancel" style="margin-top: 10px;">Cancelar Acción</button>
                        </div>
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
            sickAlert: document.getElementById('sickAlert'),

            triageModal: document.getElementById('triageModal'),
            tooltip: document.getElementById('txTooltip')
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

            const currentState = JSON.parse(JSON.stringify(store.getState()));
            const pIndex = currentState.projects.findIndex(x => x.id === this.activeProjectId);
            
            if (!currentState.projects[pIndex].transactions) {
                currentState.projects[pIndex].transactions = [];
            }

            if (this.editingTxIndex !== null) {
                currentState.projects[pIndex].transactions[this.editingTxIndex] = {
                    ...currentState.projects[pIndex].transactions[this.editingTxIndex],
                    from: fromId, to: toId, horas: parseFloat(this.dom.inpHoras.value)||1, entregable: desc, tipo: this.dom.selType.value
                };
                this.exitEditMode();
            } else {
                currentState.projects[pIndex].transactions.push({
                    hash: '0x' + Math.random().toString(16).slice(2, 10),
                    from: fromId, to: toId, horas: parseFloat(this.dom.inpHoras.value) || 1,
                    entregable: desc, tipo: this.dom.selType.value, status: 'theoretical', timestamp: Date.now()
                });
            }

            this.forceSaveState(currentState, this.editingTxIndex !== null ? this.editingTxIndex : currentState.projects[pIndex].transactions.length - 1);
            
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
                this.forceSaveState(currentState, idx - 1); // Pasamos el nuevo index para animarlo
            } 
            else if (target.classList.contains('btn-move-down')) {
                [txs[idx], txs[idx + 1]] = [txs[idx + 1], txs[idx]];
                this.forceSaveState(currentState, idx + 1); // Pasamos el nuevo index para animarlo
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

        // ------------------ TOOLTIPS EN EL MAPA SVG ------------------
        this.dom.svg.addEventListener('click', (e) => {
            if (e.target.classList.contains('tx-number')) {
                const idx = e.target.getAttribute('data-idx');
                const currentState = store.getState();
                const p = currentState.projects.find(x => x.id === this.activeProjectId);
                const tx = p.transactions[idx];
                const rFrom = p.roles.find(r => r.id === tx.from);
                const rTo = p.roles.find(r => r.id === tx.to);
                
                const typeColor = tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
                
                this.dom.tooltip.innerHTML = `
                    <div style="color: ${typeColor}; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px;">
                        [Paso ${parseInt(idx) + 1}] ${tx.tipo.toUpperCase()}
                    </div>
                    <div style="margin-bottom: 4px;"><strong style="color:#888;">De:</strong> ${rFrom ? rFrom.name : 'Desconocido'}</div>
                    <div style="margin-bottom: 8px;"><strong style="color:#888;">A:</strong> ${rTo ? rTo.name : 'Desconocido'}</div>
                    <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px; border: 1px solid #333;">
                        <strong style="color:#aaa;">Entregable:</strong><br>
                        <span style="color:white;">${tx.entregable}</span>
                        <span style="color:var(--accent-blue); float:right; font-family: monospace;">⏱ ${tx.horas}h</span>
                    </div>
                `;
                
                // Posicionar tooltip cerca del cursor
                this.dom.tooltip.style.left = `${e.clientX + 15}px`;
                this.dom.tooltip.style.top = `${e.clientY + 15}px`;
                this.dom.tooltip.classList.add('visible');
                
                // Ocultar automático
                setTimeout(() => this.dom.tooltip.classList.remove('visible'), 5000);
            }
        });

        // Ocultar tooltip al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tx-number')) {
                this.dom.tooltip.classList.remove('visible');
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

        // ------------------ INSPECTOR Y TRIAJE ------------------
        document.getElementById('btnCloseInspector').addEventListener('click', () => {
            this.dom.inspector.classList.remove('open');
            this.selectedRoleId = null;
            this.dom.canvas.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
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
                store.dispatch({
                    type: 'UPDATE_ROLE',
                    payload: { 
                        projectId: this.activeProjectId, roleId: this.selectedRoleId, 
                        updates: { name: name, levelId: level, fmv: fmv, multiplier: mult } 
                    }
                });
                
                this.forceSaveState(store.getState());
            }
        });

        document.getElementById('btnDeleteRole').addEventListener('click', () => {
            const state = store.getState();
            const p = state.projects.find(x => x.id === this.activeProjectId);
            const roleToArchive = p.roles.find(r => r.id === this.selectedRoleId);

            if (!roleToArchive) return;

            if (roleToArchive.isArchived) {
                if(confirm('¿Desarchivar este nodo y devolverlo a la vida?')) {
                    this.executeArchiveToggle(false);
                }
                return;
            }

            const pendingTxs = (p.transactions || []).filter(tx => 
                (tx.from === this.selectedRoleId || tx.to === this.selectedRoleId) && 
                (tx.status !== 'consolidated' && tx.status !== 'approved')
            );

            if (pendingTxs.length > 0) {
                document.getElementById('triageCount').innerText = pendingTxs.length;
                
                const activeNodes = p.roles.filter(r => !r.isArchived && r.id !== this.selectedRoleId);
                const selectHtml = activeNodes.length > 0 
                    ? activeNodes.map(r => `<option value="${r.id}">${r.name}</option>`).join('')
                    : `<option value="">No hay otros nodos vivos</option>`;
                
                document.getElementById('selTriageNode').innerHTML = selectHtml;
                this.dom.triageModal.style.display = 'flex';
            } else {
                if(confirm('¿Archivar este nodo? Pasará a ser un fantasma en el mapa para mantener la inmutabilidad histórica.')) {
                    this.executeArchiveToggle(true);
                }
            }
        });

        document.getElementById('btnTriageCancel').addEventListener('click', () => {
            this.dom.triageModal.style.display = 'none';
        });

        document.getElementById('btnTriageDelete').addEventListener('click', () => {
            const currentState = JSON.parse(JSON.stringify(store.getState()));
            const pIdx = currentState.projects.findIndex(x => x.id === this.activeProjectId);
            
            currentState.projects[pIdx].transactions = currentState.projects[pIdx].transactions.filter(tx => {
                const hitsArchived = (tx.from === this.selectedRoleId || tx.to === this.selectedRoleId);
                const isPending = (tx.status !== 'consolidated' && tx.status !== 'approved');
                return !(hitsArchived && isPending);
            });

            this.dom.triageModal.style.display = 'none';
            this.forceSaveState(currentState);
            this.executeArchiveToggle(true);
        });

        document.getElementById('btnTriageReassign').addEventListener('click', () => {
            const targetNodeId = document.getElementById('selTriageNode').value;
            if(!targetNodeId) return alert("Debes seleccionar un nodo de destino válido.");

            const currentState = JSON.parse(JSON.stringify(store.getState()));
            const pIdx = currentState.projects.findIndex(x => x.id === this.activeProjectId);
            
            currentState.projects[pIdx].transactions = currentState.projects[pIdx].transactions.map(tx => {
                if (tx.status !== 'consolidated' && tx.status !== 'approved') {
                    if (tx.from === this.selectedRoleId) tx.from = targetNodeId;
                    if (tx.to === this.selectedRoleId) tx.to = targetNodeId;
                }
                return tx;
            });

            this.dom.triageModal.style.display = 'none';
            this.forceSaveState(currentState);
            this.executeArchiveToggle(true);
        });

        // ------------------ DRAG LOGIC ------------------
        this.dom.canvas.addEventListener('mousedown', (e) => {
            const node = e.target.closest('.node');
            if (node && !this.isSimulating) { 
                this.isDragging = true; 
                this.hasMoved = false; 
                this.draggedElement = node; 
                node.style.zIndex = 1000; 
            }
        });
        
        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.draggedElement) return;
            this.hasMoved = true; 
            const rect = this.dom.canvas.getBoundingClientRect();
            this.draggedElement.style.left = `${((e.clientX - rect.left) / rect.width) * 100}%`;
            this.draggedElement.style.top = `${((e.clientY - rect.top) / rect.height) * 100}%`;
            this.drawEdges();
        });
        
        window.addEventListener('mouseup', () => { 
            if (this.draggedElement) {
                this.draggedElement.style.zIndex = this.draggedElement.classList.contains('ghost-node') ? 1 : 5;
            }
            this.isDragging = false; 
            this.draggedElement = null; 
        });
        
        window.addEventListener('resize', () => { if(!this.isSimulating) this.drawEdges(); });
    }

    executeArchiveToggle(archiveState) {
        store.dispatch({ type: 'TOGGLE_ROLE_ARCHIVE', payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId } });
        if (archiveState) {
            this.selectedRoleId = null;
            this.dom.inspector.classList.remove('open');
        }
        this.forceSaveState(store.getState());
    }

    // --- MÉTODOS DE EDICIÓN ---
    enterEditMode(idx, tx) {
        this.editingTxIndex = idx;
        this.dom.seqFooter.classList.add('edit-mode');
        this.dom.formTitle.innerText = `Editando Paso ${idx + 1}`;
        this.dom.formTitle.style.color = 'var(--accent-orange)';
        this.dom.btnCancelEditFlow.style.display = 'block';
        this.dom.btnAddFlow.innerText = '✓ Actualizar Transacción';
        this.dom.btnAddFlow.style.background = 'var(--accent-blue)';
        this.dom.btnAddFlow.style.color = 'white';

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
        this.dom.formTitle.style.color = 'var(--accent-blue)';
        this.dom.btnCancelEditFlow.style.display = 'none';
        this.dom.btnAddFlow.innerText = '➕ Añadir a Secuencia';
        this.dom.btnAddFlow.style.background = 'var(--accent-green)';
        this.dom.btnAddFlow.style.color = 'black';
        this.dom.inpDesc.value = '';
    }

    forceSaveState(newState, highlightIndex = -1) {
        store.state = newState;
        localStorage.setItem('tt_sos_state', JSON.stringify(store.state));
        
        const pUpdate = store.state.projects.find(x => x.id === this.activeProjectId);
        this.populateDropdowns(pUpdate.roles);
        this.renderSequence(highlightIndex); 
        this.renderMap();      
        setTimeout(() => this.drawEdges(), 50); 
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
        
        this.injectSvgMarkers(); // Inyectamos las flechas direccionales

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

        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx*dx + dy*dy);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // Para simulación animamos en línea recta (es más fácil de calcular longitud)
        path.setAttribute('d', `M ${x1} ${y1} Q ${(x1+x2)/2} ${(y1+y2)/2} ${x2} ${y2}`);
        
        let markerId = isSick ? 'arrow-sick' : (tx.tipo === 'tangible' ? 'arrow-tangible' : 'arrow-intangible');
        path.setAttribute('marker-end', `url(#${markerId})`);
        
        path.style.strokeDasharray = distance;
        path.style.strokeDashoffset = distance;
        path.style.animation = `drawLine 0.8s ease-out forwards`;
        
        const lineClass = isSick ? 'edge-sick' : (tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible');
        path.setAttribute('class', `edge-line ${lineClass}`);

        this.dom.svg.appendChild(path);

        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', (x1+x2)/2); txt.setAttribute('y', (y1+y2)/2 - 8);
        txt.setAttribute('text-anchor', 'middle');
        txt.style.cssText = `fill:${isSick ? 'var(--accent-red)' : (tx.tipo==='tangible'?'var(--accent-green)':'var(--accent-purple)')};font-size:14px;font-weight:900;font-family:monospace;paint-order:stroke;stroke:#111;stroke-width:5px; opacity: 0; transition: opacity 0.5s;`;
        txt.textContent = `[${index + 1}]`;
        
        setTimeout(() => txt.style.opacity = '1', 400); 
        this.dom.svg.appendChild(txt);
    }

    // Funciones estándar
    populateDropdowns(roles) {
        const options = roles.filter(r => !r.isArchived).map(r => `<option value="${r.id}">${r.levelId} - ${r.name}</option>`).join('');
        this.dom.selFrom.innerHTML = options;
        this.dom.selTo.innerHTML = options;
        if(roles.filter(r => !r.isArchived).length > 1 && this.dom.selTo.options.length > 1) this.dom.selTo.selectedIndex = 1;
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

    renderSequence(highlightIndex = -1) {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const txs = p?.transactions || [];
        this.dom.seqList.innerHTML = '';
        
        if(txs.length === 0) {
            this.dom.seqList.innerHTML = `<p style="color:var(--text-muted); font-size:0.8rem; text-align:center; margin-top:2rem;">Lienzo en blanco.</p>`;
            return;
        }

        txs.forEach((tx, i) => {
            const rFrom = p.roles.find(r => r.id === tx.from) || { levelId: '?', name: 'Nodo Borrado' };
            const rTo = p.roles.find(r => r.id === tx.to) || { levelId: '?', name: 'Nodo Borrado' };
            
            const color = tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';

            const stepEl = document.createElement('div');
            stepEl.className = 'flow-step';
            if (i === highlightIndex) stepEl.classList.add('flash-highlight'); // Efecto Visual
            stepEl.style.borderLeft = `3px solid ${color}`;
            
            const actions = `
                <div class="step-actions">
                    ${i > 0 ? `<button class="btn-step btn-move-up" data-idx="${i}" title="Subir">↑</button>` : ''}
                    ${i < txs.length - 1 ? `<button class="btn-step btn-move-down" data-idx="${i}" title="Bajar">↓</button>` : ''}
                    <button class="btn-step btn-edit" data-idx="${i}" title="Editar">✎</button>
                    <button class="btn-step del btn-del" data-idx="${i}" title="Eliminar">🗑️</button>
                </div>
            `;

            stepEl.innerHTML = `
                <div class="step-header"><span>Paso ${i + 1}</span><span style="font-size: 0.7rem;">${tx.horas}h Est.</span></div>
                <div class="step-route"><span style="color: ${this.getColor(rFrom.levelId)}">${rFrom.levelId}</span> <span style="color:var(--text-muted);">&rarr;</span> <span style="color: ${this.getColor(rTo.levelId)}">${rTo.levelId}</span></div>
                <div class="step-deliverable" style="color: ${color}; font-size: 0.75rem; text-transform: uppercase; margin-top: 5px;">${tx.entregable}</div>
                ${actions}
            `;
            this.dom.seqList.appendChild(stepEl);
        });
        
        // Si hay highlight, asegurarse de que está a la vista
        if (highlightIndex !== -1 && this.dom.seqList.children[highlightIndex]) {
            this.dom.seqList.children[highlightIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            this.dom.seqList.scrollTop = this.dom.seqList.scrollHeight;
        }
    }

    renderMap() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if (!p) return;

        const positions = {};
        this.dom.canvas.querySelectorAll('.node').forEach(n => { positions[n.dataset.id] = { left: n.style.left, top: n.style.top }; n.remove(); });

        const layout = { '@anxaneta': {x: 50, y: 15}, '@aixecador': {x: 50, y: 35}, '@dosos': {x: 35, y: 55}, '@baixos': {x: 65, y: 55}, '@pinya': {x: 50, y: 80} };
        const levelCounts = {};

        p.roles.forEach(rol => {
            const level = rol.levelId || '@baixos';
            levelCounts[level] = (levelCounts[level] || 0) + 1;
            
            const el = document.createElement('div');
            
            const isGhost = rol.isArchived ? 'ghost-node' : '';
            const isSelected = this.selectedRoleId === rol.id ? 'selected' : '';
            el.className = `node ${isSelected} ${isGhost}`;
            
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
            // El texto ahora está truncado por CSS (.node-name)
            el.innerHTML = `<div style="font-size:1.5rem; margin-bottom:2px;">${this.getIcon(level)}</div><div class="node-name" title="${rol.name}">${rol.name}</div>`;

            el.addEventListener('click', (e) => {
                if(this.hasMoved || this.isSimulating) return; 
                
                if (!rol.isArchived && this.selectedRoleId && this.selectedRoleId !== rol.id) {
                    const currentlySelected = p.roles.find(r => r.id === this.selectedRoleId);
                    if(currentlySelected && !currentlySelected.isArchived) {
                        this.dom.selFrom.value = this.selectedRoleId;
                        this.dom.selTo.value = rol.id;
                        this.updateOntologyTemplates();
                    }
                }

                this.selectedRoleId = rol.id;
                this.dom.canvas.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
                el.classList.add('selected');
            });

            el.addEventListener('dblclick', (e) => {
                if(this.isSimulating) return;
                
                this.selectedRoleId = rol.id;
                this.dom.canvas.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
                el.classList.add('selected');

                this.dom.inspector.classList.add('open');
                this.dom.insName.value = rol.name;
                this.dom.insLevel.value = rol.levelId;
                this.dom.inputFmv.value = rol.fmv || 0;
                this.dom.inputMult.value = rol.multiplier || 1.0;
                
                const isLocked = rol.isArchived;
                this.dom.insName.disabled = isLocked;
                this.dom.insLevel.disabled = isLocked;
                this.dom.inputFmv.disabled = isLocked;
                this.dom.inputMult.disabled = isLocked;
                document.getElementById('btnSaveRole').style.display = isLocked ? 'none' : 'block';
                
                const btnDel = document.getElementById('btnDeleteRole');
                btnDel.innerText = isLocked ? '♻️ Desarchivar Nodo (Revivir)' : '🗑️ Archivar Nodo';
                btnDel.style.borderColor = isLocked ? 'var(--accent-green)' : 'var(--accent-red)';
                btnDel.style.color = isLocked ? 'var(--accent-green)' : 'var(--accent-red)';
            });

            this.dom.canvas.appendChild(el);
        });

        setTimeout(() => { if(!this.isSimulating) this.drawEdges(); }, 50);
    }

    injectSvgMarkers() {
        // RefX 42 desplaza la flecha justo hasta el borde exterior de la esfera del nodo (radio 40px)
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <marker id="arrow-tangible" markerWidth="10" markerHeight="7" refX="42" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-green)"/></marker>
            <marker id="arrow-intangible" markerWidth="10" markerHeight="7" refX="42" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-purple)"/></marker>
            <marker id="arrow-sick" markerWidth="10" markerHeight="7" refX="42" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-red)"/></marker>
        `;
        this.dom.svg.appendChild(defs);
    }

    drawEdges() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        this.dom.svg.innerHTML = '';
        const txs = p?.transactions || [];
        if (txs.length === 0) return;

        this.injectSvgMarkers();

        // AGRUPACIÓN PARA EVITAR SOLAPAMIENTOS (Curvas Bézier)
        const pairCounts = {};
        txs.forEach((tx, i) => {
            const key = tx.from < tx.to ? `${tx.from}-${tx.to}` : `${tx.to}-${tx.from}`;
            if (!pairCounts[key]) pairCounts[key] = [];
            pairCounts[key].push({ tx, index: i });
        });

        Object.keys(pairCounts).forEach(key => {
            const edges = pairCounts[key];
            
            edges.forEach((edgeData, multiIdx) => {
                const { tx, index } = edgeData;
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

                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    // Vector normal para crear la curva perpendicular
                    const nx = -dy / dist; 
                    const ny = dx / dist;

                    // Si hay múltiples conexiones, espaciamos las curvas. (0, 30, -30, 60, -60...)
                    let offset = 0;
                    if (edges.length > 1) {
                        const step = 45; // Distancia entre curvas
                        offset = (multiIdx % 2 !== 0 ? 1 : -1) * Math.ceil(multiIdx / 2) * step;
                    }

                    const cx = (x1 + x2) / 2 + nx * offset;
                    const cy = (y1 + y2) / 2 + ny * offset;

                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
                    
                    // Flecha direccional
                    let markerId = tx.tipo === 'tangible' ? 'arrow-tangible' : 'arrow-intangible';
                    path.setAttribute('marker-end', `url(#${markerId})`);
                    
                    const lineClass = tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible';
                    path.setAttribute('class', `edge-line ${lineClass}`);
                    
                    if (dom1.classList.contains('ghost-node') || dom2.classList.contains('ghost-node')) {
                        path.style.opacity = '0.2';
                    }
                    
                    this.dom.svg.appendChild(path);

                    // Posición matemática del texto en la curva Bézier (t = 0.5)
                    const txX = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
                    const txY = 0.25 * y1 + 0.5 * cy + 0.25 * y2;

                    const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    txt.setAttribute('x', txX); 
                    txt.setAttribute('y', txY - 8);
                    txt.setAttribute('text-anchor', 'middle');
                    txt.setAttribute('data-idx', index); // Guardamos el index para el Tooltip interactivo
                    txt.setAttribute('class', 'tx-number'); // Clase clickeable
                    txt.style.cssText = `fill:${tx.tipo==='tangible'?'var(--accent-green)':'var(--accent-purple)'};font-size:12px;font-weight:900;font-family:monospace;paint-order:stroke;stroke:#111;stroke-width:6px; cursor: pointer;`;
                    
                    if (dom1.classList.contains('ghost-node') || dom2.classList.contains('ghost-node')) {
                        txt.style.opacity = '0.3';
                    }
                    
                    txt.textContent = `[${index + 1}]`;
                    this.dom.svg.appendChild(txt);
                }
            });
        });
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }
    getColor(l) { return { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': '#7c4dff', '@pinya': '#536dfe' }[l] || '#fff'; }
}
