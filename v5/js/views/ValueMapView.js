// v5/js/views/ValueMapView.js
import { store } from '../core/store.js';
import { GLOBAL_ONTOLOGY } from '../data/ontology.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class ValueMapView {
    constructor() {
        document.title = "Mapa Flujo de Valor | TeamTowers SOS";
        this.activeProjectId = null;
        this.selectedRoleId = null; 
        this.editingTxIndex = null; 
        
        // Drag Nodos
        this.isDragging = false;
        this.draggedElement = null;
        this.hasMoved = false; 
        
        // Simulación
        this.isSimulating = false;
        this.simulationTimeouts = [];
        
        // Lógica Visual Flow Builder
        this.isBuildingFlow = false;
        this.flowFromId = null;
        this.tempVector = null;

        this.levelHierarchy = { '@anxaneta': 1, '@aixecador': 2, '@dosos': 3, '@baixos': 4, '@pinya': 5 };
        this.resizeObserver = null;
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        
        if (!project) {
            const userProjects = state.projects.filter(p => 
                state.session.role === 'ecosystem-owner' || 
                p.ownerId === activeUserId || 
                (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
            );
            project = userProjects.length > 0 ? userProjects[userProjects.length - 1] : null;
        }

        const isPO = project && (project.ownerId === activeUserId || state.session.role === 'ecosystem-owner');

        const headerConfig = {
            title: "Mapa",
            subtitle: project ? project.nombre : '',
            tagline: "Flujo de Valor (VNA) y topología de la red.",
            tabs: [
                { id: 'visual', label: '🕸️ Red Visual', active: true },
                { id: 'edit', label: '✏️ Editar Mapa' },
                { id: 'flow', label: '📋 Flujo Operativo' }
            ]
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: var(--bg-dark); }
                .workspace { display: flex; flex-direction: column; flex: 1; padding: 2rem 3rem; overflow-y: auto; position: relative; scroll-behavior: smooth;}
                
                .ph-tabs-container { flex-shrink: 0 !important; }

                /* =========================================================
                   TABS CONTENT
                   ========================================================= */
                .tab-content { display: none; flex-direction: column; flex: 1; animation: fadeIn 0.3s ease-out; min-height: 500px; position: relative; }
                .tab-content.active { display: flex; }
                
                /* =========================================================
                   CONTROLES TÁCTICOS Y TIPS
                   ========================================================= */
                .vna-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 10px; flex-wrap: wrap;}
                .sim-group { display: flex; gap: 10px; }
                
                .btn-sm { padding: 8px 15px; font-size: 0.85rem; border-radius: 6px; font-weight: bold; cursor: pointer; transition: transform 0.2s; display: flex; align-items: center; justify-content: center; gap: 5px;}
                .btn-sm:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.3);}
                
                .legend-box { display: flex; gap: 15px; font-size: 0.75rem; color: #aaa; align-items: center; background: rgba(0,0,0,0.4); padding: 6px 12px; border-radius: 6px; border: 1px solid #333; margin-bottom: 10px; width: max-content;}
                .legend-item { display: flex; align-items: center; gap: 5px;}
                .legend-color { width: 15px; height: 3px; }

                .vna-tip { background: rgba(0, 176, 255, 0.1); border: 1px dashed var(--accent-blue); color: var(--accent-blue); padding: 10px 15px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;}
                .btn-magic-flow { background: var(--accent-blue); color: black; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s;}
                .btn-magic-flow:hover { transform: scale(1.05); }

                /* =========================================================
                   LIENZO PRINCIPAL (Mapa Visual)
                   ========================================================= */
                .map-container { flex: 1; position: relative; overflow: hidden; border: 1px solid var(--glass-border); border-radius: 12px; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0); background-size: 40px 40px; background-color: rgba(0,0,0,0.2);}
                #edges-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
                
                .edge-line { fill: none; stroke-width: 2.5; opacity: 0.85; transition: stroke 0.3s; }
                .edge-tangible { stroke: var(--accent-green); }
                .edge-intangible { stroke: var(--accent-purple); stroke-dasharray: 6, 6; animation: dashAnim 15s linear infinite; }
                .edge-sick { stroke: var(--accent-red) !important; stroke-width: 4 !important; filter: drop-shadow(0 0 8px var(--accent-red)); }
                .edge-temp { stroke: var(--accent-orange); stroke-width: 3; stroke-dasharray: 5, 5; animation: dashAnim 5s linear infinite; opacity: 0.8;}

                .node { position: absolute; z-index: 5; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; cursor: grab; transition: transform 0.2s, box-shadow 0.3s, border-color 0.3s, opacity 0.3s; background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 2px solid var(--glass-border); color: white; transform: translate(-50%, -50%); user-select: none; box-shadow: 0 10px 25px rgba(0,0,0,0.5); width: 80px; height: 80px;}
                .node:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.05); }
                .node.selected { border-color: var(--accent-blue) !important; box-shadow: 0 0 35px rgba(0, 176, 255, 0.6); z-index: 10; }
                .node.sick-node { border-color: var(--accent-red) !important; box-shadow: 0 0 40px rgba(255, 82, 82, 0.8); animation: pulseSick 1s infinite alternate; z-index: 15; }
                .node.ghost-node { opacity: 0.3; border-style: dashed; filter: grayscale(100%); z-index: 1; }
                
                /* CLASES INTERACTIVAS BUILDER */
                .map-canvas.building-flow .node { cursor: crosshair !important; border-color: var(--accent-orange); }
                .map-canvas.building-flow .node:hover { transform: translate(-50%, -50%) scale(1.1); box-shadow: 0 0 20px rgba(255, 171, 64, 0.5); }
                .node.flow-source { border-color: var(--accent-blue) !important; box-shadow: 0 0 30px rgba(0, 176, 255, 0.8); z-index: 20;}

                .node-name { font-size: 0.65rem; margin-top: 5px; pointer-events: none; text-transform: uppercase; width: 95%; font-weight: bold; line-height: 1.1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; padding: 0 5px; word-wrap: break-word; text-align: center;}

                .tx-badge { position: absolute; transform: translate(-50%, -50%); z-index: 6; font-size: 0.75rem; font-weight: 900; font-family: var(--font-mono); padding: 4px 8px; border-radius: 6px; cursor: pointer; pointer-events: auto; border: 1px solid #111; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: transform 0.2s, filter 0.2s; }
                .tx-badge:hover { transform: translate(-50%, -50%) scale(1.2); filter: brightness(1.2); z-index: 100;}
                .tx-badge.ghost { opacity: 0.3; }

                .tx-tooltip { position: fixed; background: rgba(10, 10, 14, 0.98); border: 1px solid var(--accent-blue); color: white; padding: 15px; border-radius: 8px; font-size: 0.85rem; z-index: 9999; box-shadow: 0 15px 50px rgba(0,0,0,0.9); backdrop-filter: blur(8px); opacity: 0; visibility: hidden; transition: opacity 0.2s; min-width: 250px; max-width: 320px; line-height: 1.4; pointer-events: none;}
                .tx-tooltip.visible { opacity: 1; visibility: visible; }

                /* =========================================================
                   PESTAÑA 3: FLUJO OPERATIVO (LISTA KANBAN)
                   ========================================================= */
                .flow-container { display: flex; gap: 2rem; flex: 1; align-items: flex-start; margin-top: 10px;}
                .sequence-panel { flex: 2; display: flex; flex-direction: column; gap: 12px; max-height: calc(100vh - 250px); overflow-y: auto; padding-right: 10px;}
                
                .flow-step { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 12px; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; gap: 15px; transition: all 0.3s;}
                .flow-step.simulating { transform: scale(1.02); border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.3); }
                
                .step-info { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
                .step-meta { font-size: 0.7rem; font-family: var(--font-mono); text-transform: uppercase; display: flex; align-items: center; gap: 8px;}
                .step-route-compact { font-size: 0.9rem; display: flex; align-items: center; flex-wrap: wrap; line-height: 1.2;}
                .route-level { color: #888; font-family: var(--font-mono); font-size: 0.75rem; margin-right: 4px; }
                .route-name { font-weight: bold; color: white; }
                .route-arrow { color: #555; margin: 0 8px; }
                .step-deliv-name { font-size: 1rem; font-weight: bold; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; }
                
                .step-actions { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
                .btn-step { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .btn-step:hover { background: rgba(255,255,255,0.15); color: white; border-color: var(--text-muted); }
                .btn-step.del:hover { background: rgba(255, 82, 82, 0.15); color: var(--accent-red); border-color: var(--accent-red); }
                .btn-step.edit { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border-color: var(--accent-blue); }
                .btn-step.edit:hover { background: var(--accent-blue); color: black; }

                /* =========================================================
                   MODALS Y FORMS
                   ========================================================= */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: none; justify-content: center; align-items: center; z-index: 4000; }
                .modal-content { background: var(--bg-panel); border: 1px solid #333; padding: 2.5rem; border-radius: 12px; width: 500px; max-width: 95%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); box-sizing: border-box; max-height: 90vh; overflow-y:auto;}
                
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; }
                .form-control { background: #050505; border: 1px solid #333; color: white; padding: 10px 12px; border-radius: 6px; font-family: inherit; font-size: 0.95rem; outline: none; width: 100%; transition: border-color 0.2s; box-sizing: border-box; }
                .form-control:focus { border-color: var(--accent-blue); }

                @keyframes dashAnim { to { stroke-dashoffset: -100; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

                /* RESPONSIVE MOBILE */
                @media (max-width: 768px) {
                    .workspace { padding: 80px 1rem 90px 1rem; } 
                    
                    .vna-controls { flex-direction: column; align-items: stretch; gap: 10px; }
                    .sim-group { display: flex; flex-direction: row; width: 100%; gap: 10px;}
                    .sim-group .btn-sm { flex: 1; padding: 12px; font-size: 0.95rem;}
                    
                    #btnOpenAddNode { padding: 12px; font-size: 0.95rem; }

                    .map-container { flex: 1; height: calc(100vh - 350px); min-height: 400px; border-radius: 12px;}
                    .node { width: 65px; height: 65px; font-size: 0.8rem; } 
                    .map-canvas:not(.building-flow) .node { pointer-events: none; transform: translate(-50%, -50%) scale(0.8); }
                    .tx-badge { pointer-events: none; font-size: 0.6rem; padding: 2px 5px;}

                    .flow-container { flex-direction: column; gap: 1rem; margin-top: 0;}
                    .sequence-panel { width: 100%; max-height: none; padding-right: 0;}
                    
                    .flow-step { flex-direction: column; align-items: stretch; gap: 12px;}
                    .step-actions { flex-direction: row; justify-content: space-between; border-top: 1px dashed #333; padding-top: 10px; margin-top: 5px;}
                    .step-actions .btn-step { flex: 1; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/map')}

                <main class="workspace">
                    
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="sickAlert" style="display: none; background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 10px; border-radius: 8px; font-size: 0.85rem; font-weight: bold; text-align: center; margin-bottom: 1rem;">⚠️ DIAGNÓSTICO: Salto estructural excesivo detectado.</div>

                    <div id="view-visual" class="tab-content active">
                        <div class="vna-controls">
                            <div class="sim-group">
                                <button class="btn btn-primary btn-sm" id="btnSimulate">▶ Simular Flujo</button>
                                <button class="btn btn-outline btn-sm" id="btnPauseSim" style="display:none; background:#333; color:white;">⏸ Pausar</button>
                                <button class="btn btn-outline btn-sm" id="btnStopSim" style="display:none; border-color:var(--accent-red); color:var(--accent-red);">⏹ Detener</button>
                            </div>
                            <div class="legend-box">
                                <div class="legend-item"><div class="legend-color" style="background:var(--accent-green);"></div> Tangible</div>
                                <div class="legend-item"><div class="legend-color" style="border-bottom:2px dashed var(--accent-purple);"></div> Intangible</div>
                            </div>
                        </div>

                        <div class="map-container">
                            <div class="map-canvas" id="mapCanvasVisual">
                                <svg id="edges-svg-visual"></svg>
                            </div>
                        </div>
                    </div>

                    <div id="view-edit" class="tab-content">
                        ${isPO ? `
                            <div class="vna-tip" id="editTip">
                                <div>💡 <b>Modo Arquitecto:</b> Arrastra los nodos para organizar el mapa. Haz doble click en un nodo para configurarlo.</div>
                                <div style="display:flex; gap:10px;">
                                    <button class="btn-magic-flow" id="btnStartVisualFlow">✨ Crear Transacción Visual</button>
                                    <button class="btn btn-outline btn-sm" id="btnOpenAddNode" style="border-style:dashed; color:white;">➕ Instanciar Rol</button>
                                </div>
                            </div>
                            
                            <div class="map-container" style="border-color: var(--accent-blue);">
                                <div class="map-canvas" id="mapCanvasEdit">
                                    <svg id="edges-svg-edit"></svg>
                                </div>
                            </div>
                        ` : `
                            <div style="text-align:center; padding:3rem; color:#888;">🔒 Solo el Project Owner puede editar la topología del Castell.</div>
                        `}
                    </div>

                    <div id="view-flow" class="tab-content">
                        <div class="flow-container">
                            <div class="sequence-panel" id="sequenceList">
                                </div>
                        </div>
                    </div>

                </main>

                <div class="modal-overlay" id="txBuilderModal">
                    <div class="modal-content">
                        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                            <h3 id="formTitle" style="margin:0; font-size:1.2rem; color:var(--accent-blue);">Definir Transacción</h3>
                            <button id="btnCloseTxBuilder" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
                        </div>
                        
                        <div class="form-group" style="display: flex; gap: 10px;">
                            <div style="flex:1;">
                                <label>Origen</label>
                                <select id="selFrom" class="form-control" disabled></select>
                            </div>
                            <div style="flex:1;">
                                <label>Destino</label>
                                <select id="selTo" class="form-control" disabled></select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Catálogo de Entregables</label>
                            <select id="selTemplate" class="form-control" style="background: rgba(0, 176, 255, 0.1); border-color: var(--accent-blue);">
                                <option value="">Cargando ontología...</option>
                            </select>
                        </div>
                        <div class="form-group" style="display: flex; gap: 10px;">
                            <div style="flex:2;">
                                <label>Tipo</label>
                                <select id="selType" class="form-control">
                                    <option value="tangible">🟢 Tangible</option>
                                    <option value="intangible">🟣 Intangible</option>
                                </select>
                            </div>
                            <div style="flex:1;">
                                <label>Horas Est.</label>
                                <input type="number" id="inpHoras" class="form-control" value="2">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Nombre del Entregable</label>
                            <input type="text" id="inpDesc" class="form-control" placeholder="Ej: Auditoría de Seguridad">
                        </div>
                        <button class="btn btn-primary" style="width: 100%; margin-top: 10px; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" id="btnAddFlow">➕ Confirmar Flujo</button>
                    </div>
                </div>

                <div class="modal-overlay" id="addNodeModal">
                    <div class="modal-content">
                        <h3 style="color: white; margin-bottom: 1.5rem; margin-top:0;">Instanciar Rol</h3>
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
                            <button class="btn btn-outline btn-sm" id="btnCancelNode">Cancelar</button>
                            <button class="btn btn-primary btn-sm" id="btnConfirmNode">Añadir Rol</button>
                        </div>
                    </div>
                </div>

                <div class="modal-overlay" id="inspectorModal">
                    <div class="modal-content">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <h3 style="color: white; margin:0;">Editar Nodo</h3>
                            <button id="btnCloseInspector" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size: 1.5rem;">&times;</button>
                        </div>
                        <div class="form-group">
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
                        <div style="display:flex; gap:10px;">
                            <div class="form-group" style="flex:1;">
                                <label>Valor (FMV €/h)</label>
                                <input type="number" id="inputFmv" class="form-control">
                            </div>
                            <div class="form-group" style="flex:1;">
                                <label>Multiplicador</label>
                                <input type="number" step="0.1" id="inputMult" class="form-control">
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 1rem;">
                            <button class="btn btn-primary" style="padding:10px; border-radius:8px; cursor:pointer; font-weight:bold; border:none;" id="btnSaveRole">✓ Guardar Cambios</button>
                            <button class="btn btn-outline" style="border:1px solid var(--accent-red); color: var(--accent-red); padding:10px; border-radius:8px; cursor:pointer;" id="btnDeleteRole">🗑️ Archivar Nodo</button>
                        </div>
                    </div>
                </div>
                
                <div id="txTooltip" class="tx-tooltip"></div>
                ${BottomNav.getHtml('/map')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        let state = store.getState();
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        
        if (!project) {
            const userProjects = state.projects.filter(p => 
                state.session.role === 'ecosystem-owner' || 
                p.ownerId === state.session.activeUserId || 
                (p.usuarios && p.usuarios.find(u => u.id === state.session.activeUserId))
            );
            project = userProjects.length > 0 ? userProjects[userProjects.length - 1] : null;
        }

        if (!project || !project.roles) return;
        this.activeProjectId = project.id;
        const isPO = project.ownerId === state.session.activeUserId || state.session.role === 'ecosystem-owner';
        
        this.dom = {
            canvasVis: document.getElementById('mapCanvasVisual'),
            svgVis: document.getElementById('edges-svg-visual'),
            canvasEdit: document.getElementById('mapCanvasEdit'),
            svgEdit: document.getElementById('edges-svg-edit'),
            seqList: document.getElementById('sequenceList'),
            
            // Formularios TX
            txBuilderModal: document.getElementById('txBuilderModal'),
            selFrom: document.getElementById('selFrom'),
            selTo: document.getElementById('selTo'),
            selTemplate: document.getElementById('selTemplate'),
            selType: document.getElementById('selType'),
            inpDesc: document.getElementById('inpDesc'),
            inpHoras: document.getElementById('inpHoras'),
            btnAddFlow: document.getElementById('btnAddFlow'),
            formTitle: document.getElementById('formTitle'),
            editTip: document.getElementById('editTip'),
            btnStartVisualFlow: document.getElementById('btnStartVisualFlow'),
            
            // Modales e Inspector
            inspectorModal: document.getElementById('inspectorModal'),
            insName: document.getElementById('insName'),
            insLevel: document.getElementById('insLevel'),
            inputFmv: document.getElementById('inputFmv'),
            inputMult: document.getElementById('inputMult'),
            addNodeModal: document.getElementById('addNodeModal'),
            
            // Simulación
            btnSimulate: document.getElementById('btnSimulate'),
            btnPauseSim: document.getElementById('btnPauseSim'),
            btnStopSim: document.getElementById('btnStopSim'),
            sickAlert: document.getElementById('sickAlert'),
            tooltip: document.getElementById('txTooltip')
        };

        // TABS LOGIC
        const tabBtns = document.querySelectorAll('.ph-tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                const targetId = `view-${btn.dataset.tab}`;
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                    if(btn.dataset.tab === 'visual' || btn.dataset.tab === 'edit') {
                        setTimeout(() => { if(!this.isSimulating) this.drawEdges(); }, 50);
                    }
                }
            });
        });

        if (isPO) {
            this.populateDropdowns(project.roles);
        }

        setTimeout(() => {
            this.renderMap(this.dom.canvasVis, false);
            if(isPO) this.renderMap(this.dom.canvasEdit, true);
            this.renderSequence();
            setTimeout(() => { if(!this.isSimulating) this.drawEdges(); }, 100);
        }, 50);

        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => {
                if (!this.isSimulating) this.drawEdges();
            });
            this.resizeObserver.observe(this.dom.canvasVis);
            if(this.dom.canvasEdit) this.resizeObserver.observe(this.dom.canvasEdit);
        }

        // ------------------------------------------------------------------
        // LÓGICA VISUAL FLOW BUILDER (LA MAGIA EN EL CANVAS)
        // ------------------------------------------------------------------
        if (isPO) {
            this.dom.btnStartVisualFlow.addEventListener('click', () => {
                this.isBuildingFlow = true;
                this.flowFromId = null;
                this.dom.canvasEdit.classList.add('building-flow');
                this.dom.editTip.innerHTML = `<div>🎯 <b>Paso 1:</b> Selecciona el NODO DE ORIGEN (quién crea el valor).</div> <button class="btn btn-outline btn-sm" id="btnCancelVisualFlow">Cancelar</button>`;
                
                document.getElementById('btnCancelVisualFlow').addEventListener('click', () => this.cancelVisualFlow());
            });

            this.dom.canvasEdit.addEventListener('click', (e) => {
                if (!this.isBuildingFlow) return;
                
                const nodeEl = e.target.closest('.node');
                if (!nodeEl) return;
                
                const clickedId = nodeEl.dataset.id;

                if (!this.flowFromId) {
                    // Seleccionar Origen
                    this.flowFromId = clickedId;
                    nodeEl.classList.add('flow-source');
                    this.dom.editTip.innerHTML = `<div>🎯 <b>Paso 2:</b> Ahora selecciona el NODO DE DESTINO (quién recibe el valor).</div> <button class="btn btn-outline btn-sm" id="btnCancelVisualFlow">Cancelar</button>`;
                    document.getElementById('btnCancelVisualFlow').addEventListener('click', () => this.cancelVisualFlow());
                } else {
                    // Seleccionar Destino y abrir Modal
                    if (this.flowFromId === clickedId) return alert("Origen y destino deben ser distintos.");
                    
                    const toId = clickedId;
                    this.cancelVisualFlow(); // Limpiar UI
                    this.openTxBuilderModal(this.flowFromId, toId);
                }
            });

            // Dibujar flecha temporal siguiendo al ratón
            this.dom.canvasEdit.addEventListener('mousemove', (e) => {
                if (!this.isBuildingFlow || !this.flowFromId) return;

                const originNode = this.dom.canvasEdit.querySelector(`.node[data-id="${this.flowFromId}"]`);
                if (!originNode) return;

                const rect1 = originNode.getBoundingClientRect();
                const canv = this.dom.canvasEdit.getBoundingClientRect();
                
                const x1 = rect1.left + rect1.width / 2 - canv.left;
                const y1 = rect1.top + rect1.height / 2 - canv.top;
                
                const x2 = e.clientX - canv.left;
                const y2 = e.clientY - canv.top;

                if (!this.tempVector) {
                    this.tempVector = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    this.tempVector.setAttribute('class', 'edge-temp');
                    this.dom.svgEdit.appendChild(this.tempVector);
                }

                this.tempVector.setAttribute('x1', x1);
                this.tempVector.setAttribute('y1', y1);
                this.tempVector.setAttribute('x2', x2);
                this.tempVector.setAttribute('y2', y2);
            });

            // Modal Logic
            document.getElementById('btnCloseTxBuilder').addEventListener('click', () => {
                this.dom.txBuilderModal.style.display = 'none';
            });

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
                
                if(!desc) return alert("Escribe el nombre del entregable.");

                const currentState = JSON.parse(JSON.stringify(store.getState()));
                const pIndex = currentState.projects.findIndex(x => x.id === this.activeProjectId);
                if (!currentState.projects[pIndex].transactions) currentState.projects[pIndex].transactions = [];

                if (this.editingTxIndex !== null) {
                    currentState.projects[pIndex].transactions[this.editingTxIndex] = {
                        ...currentState.projects[pIndex].transactions[this.editingTxIndex],
                        horas: parseFloat(this.dom.inpHoras.value)||1, entregable: desc, tipo: this.dom.selType.value
                    };
                } else {
                    currentState.projects[pIndex].transactions.push({
                        hash: '0x' + Math.random().toString(16).slice(2, 10),
                        from: fromId, to: toId, horas: parseFloat(this.dom.inpHoras.value) || 1,
                        entregable: desc, tipo: this.dom.selType.value, status: 'theoretical', timestamp: Date.now()
                    });
                }

                this.dom.txBuilderModal.style.display = 'none';
                this.editingTxIndex = null;
                this.forceSaveState(currentState, currentState.projects[pIndex].transactions.length - 1);
            });
            
            // Editar Flow Operativo ListView
            this.dom.seqList.addEventListener('click', (e) => {
                const target = e.target.closest('.btn-step');
                if (!target) return;
                const idx = parseInt(target.getAttribute('data-idx'));
                if (isNaN(idx)) return;

                const currentState = store.getState();
                const p = currentState.projects.find(x => x.id === this.activeProjectId);
                const txs = p.transactions;

                if (target.classList.contains('btn-move-up')) {
                    [txs[idx - 1], txs[idx]] = [txs[idx], txs[idx - 1]];
                    this.forceSaveState(currentState, idx - 1);
                } 
                else if (target.classList.contains('btn-move-down')) {
                    [txs[idx], txs[idx + 1]] = [txs[idx + 1], txs[idx]];
                    this.forceSaveState(currentState, idx + 1);
                } 
                else if (target.classList.contains('btn-del')) {
                    if(confirm('¿Eliminar transacción del flujo?')) {
                        txs.splice(idx, 1);
                        this.forceSaveState(currentState);
                    }
                }
                else if (target.classList.contains('btn-edit')) {
                    this.editingTxIndex = idx;
                    this.openTxBuilderModal(txs[idx].from, txs[idx].to, txs[idx]);
                }
            });

            // MODAL ADD NODE
            document.getElementById('btnOpenAddNode').addEventListener('click', () => this.dom.addNodeModal.style.display = 'flex');
            document.getElementById('btnCancelNode').addEventListener('click', () => this.dom.addNodeModal.style.display = 'none');
            document.getElementById('btnConfirmNode').addEventListener('click', () => {
                const name = document.getElementById('inpNewNodeName').value.trim();
                const levelId = document.getElementById('selNewNodeLevel').value;
                if(!name) return;
                const multipliers = { '@anxaneta': 3.0, '@aixecador': 2.0, '@dosos': 1.5, '@baixos': 1.2, '@pinya': 1.0 };
                
                store.dispatch({ type: 'ADD_ROLE', payload: { projectId: this.activeProjectId, role: { name, levelId, multiplier: multipliers[levelId], fmv: 50, isArchived: false } } });
                this.dom.addNodeModal.style.display = 'none';
                document.getElementById('inpNewNodeName').value = '';
                
                const pUpdate = store.getState().projects.find(x => x.id === this.activeProjectId);
                this.populateDropdowns(pUpdate.roles);
                this.renderMap(this.dom.canvasEdit, true);
                this.renderMap(this.dom.canvasVis, false);
            });

            // INSPECTOR DE NODOS
            document.getElementById('btnCloseInspector').addEventListener('click', () => {
                this.dom.inspectorModal.style.display = 'none';
                this.selectedRoleId = null;
                this.dom.canvasEdit.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
            });
            
            document.getElementById('btnSaveRole').addEventListener('click', () => {
                const fmv = parseFloat(this.dom.inputFmv.value) || 0;
                const mult = parseFloat(this.dom.inputMult.value) || 1.0;
                const name = this.dom.insName.value.trim();
                const level = this.dom.insLevel.value;
                if(!name) return alert("El nombre no puede estar vacío.");
                
                store.dispatch({
                    type: 'UPDATE_ROLE',
                    payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId, updates: { name: name, levelId: level, fmv: fmv, multiplier: mult } }
                });
                this.forceSaveState(store.getState());
                this.dom.inspectorModal.style.display = 'none';
            });

            document.getElementById('btnDeleteRole').addEventListener('click', () => {
                const state = store.getState();
                const p = state.projects.find(x => x.id === this.activeProjectId);
                const roleToArchive = p.roles.find(r => r.id === this.selectedRoleId);
                if (!roleToArchive) return;
                
                if (roleToArchive.isArchived) {
                    if(confirm('¿Desarchivar este nodo y devolverlo a la vida?')) {
                        store.dispatch({ type: 'TOGGLE_ROLE_ARCHIVE', payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId } });
                        this.dom.inspectorModal.style.display = 'none';
                        this.forceSaveState(store.getState());
                    }
                    return;
                }
                
                if(confirm('¿Archivar este nodo? Las tareas asociadas se volverán huérfanas si no las reasignas.')) {
                     store.dispatch({ type: 'TOGGLE_ROLE_ARCHIVE', payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId } });
                     this.dom.inspectorModal.style.display = 'none';
                     this.forceSaveState(store.getState());
                }
            });

            // ------------------------------------------------------------------
            // DRAG LOGIC (SOLO EN CANVAS DE EDICIÓN)
            // ------------------------------------------------------------------
            this.dom.canvasEdit.addEventListener('mousedown', (e) => {
                if (window.innerWidth <= 768 || this.isBuildingFlow) return; 
                const node = e.target.closest('.node');
                if (node) { 
                    this.isDragging = true; 
                    this.hasMoved = false; 
                    this.draggedElement = node; 
                    node.style.zIndex = 1000; 
                }
            });
            
            window.addEventListener('mousemove', (e) => {
                if (!this.isDragging || !this.draggedElement) return;
                this.hasMoved = true; 
                const rect = this.dom.canvasEdit.getBoundingClientRect();
                let newX = ((e.clientX - rect.left) / rect.width) * 100;
                let newY = ((e.clientY - rect.top) / rect.height) * 100;
                newX = Math.max(5, Math.min(newX, 95));
                newY = Math.max(5, Math.min(newY, 95));

                this.draggedElement.style.left = `${newX}%`;
                this.draggedElement.style.top = `${newY}%`;
                this.drawEdges();
            });
            
            window.addEventListener('mouseup', () => { 
                if (this.draggedElement) {
                    this.draggedElement.style.zIndex = this.draggedElement.classList.contains('ghost-node') ? 1 : 5;
                    // Al soltar, actualizamos el visual canvas tmb
                    const cloneNode = this.dom.canvasVis.querySelector(`.node[data-id="${this.draggedElement.dataset.id}"]`);
                    if(cloneNode) {
                        cloneNode.style.left = this.draggedElement.style.left;
                        cloneNode.style.top = this.draggedElement.style.top;
                    }
                }
                this.isDragging = false; 
                this.draggedElement = null; 
            });
        }

        // TOOLTIPS HTML HOVER (UNIVERSAL)
        const showTooltip = (e, canvasObj) => {
            if (e.target.classList.contains('tx-badge') || e.target.classList.contains('sim-tx-badge')) {
                const idx = e.target.getAttribute('data-idx');
                const p = store.getState().projects.find(x => x.id === this.activeProjectId);
                const tx = p.transactions[idx];
                if(!tx) return; 
                
                const rFrom = p.roles.find(r => r.id === tx.from);
                const rTo = p.roles.find(r => r.id === tx.to);
                
                const typeColor = tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
                const typeText = tx.tipo === 'tangible' ? 'TANGIBLE' : 'INTANGIBLE';
                
                this.dom.tooltip.innerHTML = `
                    <div style="color: ${typeColor}; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px;">
                        [Paso ${parseInt(idx) + 1}] ${typeText}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px;">
                        <div style="font-size: 0.8rem;"><strong style="color:#888;">De:</strong> ${rFrom ? rFrom.name : '?'}</div>
                        <div style="font-size: 0.8rem;"><strong style="color:#888;">Hacia:</strong> ${rTo ? rTo.name : '?'}</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 6px; border: 1px dashed #444;">
                        <div style="color:white; font-weight:bold; margin-bottom:5px;">${tx.entregable}</div>
                        <div style="color:var(--accent-blue); font-family: monospace;">⏱ Est: ${tx.horas}h</div>
                    </div>
                `;
                
                this.dom.tooltip.classList.add('visible');
                const badgeRect = e.target.getBoundingClientRect();
                const tooltipRect = this.dom.tooltip.getBoundingClientRect();
                
                let leftPos = badgeRect.right + 15;
                let topPos = badgeRect.top - 10;
                if (leftPos + tooltipRect.width > window.innerWidth - 20) leftPos = badgeRect.left - tooltipRect.width - 15;
                if (topPos + tooltipRect.height > window.innerHeight - 20) topPos = window.innerHeight - tooltipRect.height - 20;
                this.dom.tooltip.style.left = `${Math.max(20, leftPos)}px`;
                this.dom.tooltip.style.top = `${Math.max(20, topPos)}px`;
            }
        };

        this.dom.canvasVis.addEventListener('mouseover', (e) => showTooltip(e, this.dom.canvasVis));
        this.dom.canvasVis.addEventListener('mouseout', (e) => { if(e.target.classList.contains('tx-badge')) this.dom.tooltip.classList.remove('visible'); });
        
        if (isPO) {
            this.dom.canvasEdit.addEventListener('mouseover', (e) => showTooltip(e, this.dom.canvasEdit));
            this.dom.canvasEdit.addEventListener('mouseout', (e) => { if(e.target.classList.contains('tx-badge')) this.dom.tooltip.classList.remove('visible'); });
        }

        // SIMULACIÓN
        this.dom.btnSimulate.addEventListener('click', () => this.startSimulation());
        this.dom.btnPauseSim.addEventListener('click', () => this.pauseSimulation());
        this.dom.btnStopSim.addEventListener('click', () => this.stopSimulation());
    }

    // ---------------------------------------------------------
    // LÓGICA VISUAL FLOW BUILDER
    // ---------------------------------------------------------
    cancelVisualFlow() {
        this.isBuildingFlow = false;
        this.flowFromId = null;
        this.dom.canvasEdit.classList.remove('building-flow');
        this.dom.canvasEdit.querySelectorAll('.node').forEach(n => n.classList.remove('flow-source'));
        if (this.tempVector) {
            this.tempVector.remove();
            this.tempVector = null;
        }
        this.dom.editTip.innerHTML = `
            <div>💡 <b>Modo Arquitecto:</b> Arrastra los nodos para organizar el mapa. Haz doble click en un nodo para configurarlo.</div>
            <div style="display:flex; gap:10px;">
                <button class="btn-magic-flow" id="btnStartVisualFlow">✨ Crear Transacción Visual</button>
                <button class="btn btn-outline btn-sm" id="btnOpenAddNode" style="border-style:dashed; color:white;">➕ Instanciar Rol</button>
            </div>
        `;
        // Re-bind 
        document.getElementById('btnStartVisualFlow').addEventListener('click', () => {
            this.isBuildingFlow = true;
            this.flowFromId = null;
            this.dom.canvasEdit.classList.add('building-flow');
            this.dom.editTip.innerHTML = `<div>🎯 <b>Paso 1:</b> Selecciona el NODO DE ORIGEN (quién crea el valor).</div> <button class="btn btn-outline btn-sm" id="btnCancelVisualFlow">Cancelar</button>`;
            document.getElementById('btnCancelVisualFlow').addEventListener('click', () => this.cancelVisualFlow());
        });
        document.getElementById('btnOpenAddNode').addEventListener('click', () => this.dom.addNodeModal.style.display = 'flex');
    }

    openTxBuilderModal(fromId, toId, existingTx = null) {
        this.dom.selFrom.value = fromId;
        this.dom.selTo.value = toId;
        
        this.updateOntologyTemplates();

        if (existingTx) {
            this.dom.formTitle.innerText = `Editando Flujo`;
            this.dom.btnAddFlow.innerText = '💾 Guardar Cambios';
            this.dom.selType.value = existingTx.tipo;
            this.dom.inpHoras.value = existingTx.horas;
            this.dom.inpDesc.value = existingTx.entregable;
            this.dom.selTemplate.value = 'manual';
        } else {
            this.dom.formTitle.innerText = `Definir Transacción (Paso Final)`;
            this.dom.btnAddFlow.innerText = '➕ Confirmar Flujo';
            this.dom.inpDesc.value = '';
            this.dom.selTemplate.value = '';
        }
        
        this.dom.txBuilderModal.style.display = 'flex';
    }


    forceSaveState(newState, highlightIndex = -1) {
        store.state = newState;
        localStorage.setItem('tt_sos_state', JSON.stringify(store.state));
        const pUpdate = store.state.projects.find(x => x.id === this.activeProjectId);
        this.populateDropdowns(pUpdate.roles);
        this.renderSequence(highlightIndex); 
        setTimeout(() => this.drawEdges(), 100); 
    }

    startSimulation() {
        if (this.isSimulating && !this.isPaused) return;
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const txs = p?.transactions || [];
        if (txs.length === 0) return alert("Añade transacciones para simular el flujo.");

        this.isSimulating = true;
        this.isPaused = false;
        
        this.dom.btnSimulate.style.display = 'none';
        this.dom.btnPauseSim.style.display = 'flex';
        this.dom.btnStopSim.style.display = 'flex';
        this.dom.sickAlert.style.display = 'none';
        
        if(this.currentSimIndex === undefined) this.currentSimIndex = 0;
        
        if(this.currentSimIndex === 0) {
            this.dom.svgVis.innerHTML = '';
            this.dom.canvasVis.querySelectorAll('.tx-badge').forEach(b => b.remove());
            this.dom.canvasVis.querySelectorAll('.sim-tx-badge').forEach(b => b.remove());
            this.injectSvgMarkers();
        }

        const runNextStep = () => {
            if(!this.isSimulating || this.isPaused) return;
            if(this.currentSimIndex >= txs.length) {
                this.stopSimulation();
                return;
            }

            const index = this.currentSimIndex;
            const tx = txs[index];

            const r1 = p.roles.find(r => r.id === tx.from);
            const r2 = p.roles.find(r => r.id === tx.to);
            let isSickFlow = false;

            if (r1 && r2) {
                const level1 = this.levelHierarchy[r1.levelId];
                const level2 = this.levelHierarchy[r2.levelId];
                if (Math.abs(level1 - level2) > 1) {
                    isSickFlow = true;
                    this.dom.sickAlert.style.display = 'block';
                    const dom1 = this.dom.canvasVis.querySelector(`.node[data-id="${r1.id}"]`);
                    const dom2 = this.dom.canvasVis.querySelector(`.node[data-id="${r2.id}"]`);
                    if(dom1) dom1.classList.add('sick-node');
                    if(dom2) dom2.classList.add('sick-node');
                } else {
                    this.dom.sickAlert.style.display = 'none';
                    this.dom.canvasVis.querySelectorAll('.node').forEach(n => n.classList.remove('sick-node'));
                }
            }

            this.drawSingleEdgeAnim(tx, index, isSickFlow, 0, 1); 
            
            this.currentSimIndex++;
            this.simTimeoutId = setTimeout(runNextStep, 2500);
        };

        runNextStep();
    }

    pauseSimulation() {
        this.isPaused = true;
        clearTimeout(this.simTimeoutId);
        this.dom.btnSimulate.style.display = 'flex';
        this.dom.btnSimulate.innerText = '▶ Reanudar';
        this.dom.btnPauseSim.style.display = 'none';
    }

    stopSimulation() {
        this.isSimulating = false;
        this.isPaused = false;
        this.currentSimIndex = 0;
        clearTimeout(this.simTimeoutId);
        
        this.dom.btnSimulate.style.display = 'flex';
        this.dom.btnSimulate.innerText = '▶ Simular Flujo';
        this.dom.btnPauseSim.style.display = 'none';
        this.dom.btnStopSim.style.display = 'none';
        this.dom.sickAlert.style.display = 'none';

        this.dom.canvasVis.querySelectorAll('.node').forEach(n => n.classList.remove('sick-node'));
        this.dom.canvasVis.querySelectorAll('.sim-tx-badge').forEach(b => b.remove());

        this.drawEdges(); 
    }

    drawSingleEdgeAnim(tx, index, isSick, multiIdx, totalEdgesInPair) {
        const dom1 = this.dom.canvasVis.querySelector(`.node[data-id="${tx.from}"]`);
        const dom2 = this.dom.canvasVis.querySelector(`.node[data-id="${tx.to}"]`);
        if (!dom1 || !dom2) return;

        const rect1 = dom1.getBoundingClientRect();
        const rect2 = dom2.getBoundingClientRect();
        const canv = this.dom.canvasVis.getBoundingClientRect();
        
        const x1_center = rect1.left + rect1.width / 2 - canv.left;
        const y1_center = rect1.top + rect1.height / 2 - canv.top;
        const x2_center = rect2.left + rect2.width / 2 - canv.left;
        const y2_center = rect2.top + rect2.height / 2 - canv.top;

        const dx = x2_center - x1_center;
        const dy = y2_center - y1_center;
        const dist = Math.sqrt(dx*dx + dy*dy);

        const trim = 42; 
        const x1 = x1_center + (dx/dist) * trim;
        const y1 = y1_center + (dy/dist) * trim;
        const x2 = x2_center - (dx/dist) * trim;
        const y2 = y2_center - (dy/dist) * trim;

        const nx = -dy / dist; 
        const ny = dx / dist;
        const offset = 40; 
        const cx = (x1_center + x2_center) / 2 + nx * offset;
        const cy = (y1_center + y2_center) / 2 + ny * offset;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
        
        let markerId = isSick ? 'arrow-sick' : (tx.tipo === 'tangible' ? 'arrow-tangible' : 'arrow-intangible');
        path.setAttribute('marker-end', `url(#${markerId})`);
        
        const strokeColor = isSick ? 'var(--accent-red)' : (tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)');
        const realDist = dist + Math.abs(offset) * 2; 
        
        path.style.cssText = `
            fill: none; stroke: ${strokeColor}; stroke-width: 4; stroke-dasharray: ${realDist}; stroke-dashoffset: ${realDist}; animation: drawLine 1.5s ease-out forwards;
        `;
        
        if(!document.getElementById('svgAnimStyles')) {
            const style = document.createElement('style');
            style.id = 'svgAnimStyles';
            style.innerHTML = `@keyframes drawLine { to { stroke-dashoffset: 0; } }
                               @keyframes popIn { 0% { transform: translate(-50%, -50%) scale(0); opacity:0;} 80% { transform: translate(-50%, -50%) scale(1.1); opacity:1;} 100% { transform: translate(-50%, -50%) scale(1); opacity:1;} }`;
            document.head.appendChild(style);
        }

        this.dom.svgVis.appendChild(path);

        setTimeout(() => {
            const txX = 0.25 * x1_center + 0.5 * cx + 0.25 * x2_center;
            const txY = 0.25 * y1_center + 0.5 * cy + 0.25 * y2_center;

            const badge = document.createElement('div');
            badge.className = 'sim-tx-badge';
            badge.style.position = 'absolute';
            badge.style.left = `${txX}px`;
            badge.style.top = `${txY}px`;
            badge.style.backgroundColor = 'rgba(10,10,14,0.9)';
            badge.style.border = `1px solid ${strokeColor}`;
            badge.style.color = 'white';
            badge.style.padding = '8px 12px';
            badge.style.borderRadius = '8px';
            badge.style.boxShadow = `0 10px 30px rgba(0,0,0,0.8)`;
            badge.style.zIndex = '1000';
            badge.style.textAlign = 'center';
            badge.style.animation = 'popIn 0.4s ease-out forwards';
            badge.style.pointerEvents = 'none';
            badge.style.minWidth = '120px';

            badge.innerHTML = `<div style="color:${strokeColor}; font-weight:bold; font-size:0.7rem; margin-bottom:3px; text-transform:uppercase;">Paso ${index + 1}</div><div style="font-size:0.85rem; font-weight:bold; line-height:1.2;">${tx.entregable}</div>`;
            this.dom.canvasVis.appendChild(badge);
        }, 1200); 
    }

    populateDropdowns(roles) {
        const options = roles.filter(r => !r.isArchived).map(r => `<option value="${r.id}">${r.levelId} - ${r.name}</option>`).join('');
        if(this.dom.selFrom) this.dom.selFrom.innerHTML = options;
        if(this.dom.selTo) {
            this.dom.selTo.innerHTML = options;
            if(roles.filter(r => !r.isArchived).length > 1 && this.dom.selTo.options.length > 1) this.dom.selTo.selectedIndex = 1;
        }
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
        if(!this.dom.selFrom) return;
        const levelId = this.getRoleLevel(this.dom.selFrom.value);
        const templates = this.getTemplatesForLevel(levelId);
        let html = `<option value="">-- Catálogo Ontológico --</option>`;
        templates.forEach((t, i) => html += `<option value="${i}">${t.tipo === 'tangible' ? '🟢' : '🟣'} ${t.name} (${t.estimatedHours}h)</option>`);
        html += `<option value="manual">✍️ Crear Manualmente...</option>`;
        this.dom.selTemplate.innerHTML = html;
    }

    renderSequence(highlightIndex = -1) {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const txs = p?.transactions || [];
        this.dom.seqList.innerHTML = '';
        
        if(txs.length === 0) {
            this.dom.seqList.innerHTML = `<p style="color:var(--text-muted); font-size:0.8rem; text-align:center; margin-top:2rem;">El mapa no tiene flujos de valor. Usa el Modo Arquitecto para dibujarlos.</p>`;
            return;
        }

        const isPO = p.ownerId === store.getState().session.activeUserId || store.getState().session.role === 'ecosystem-owner';

        txs.forEach((tx, i) => {
            const rFrom = p.roles.find(r => r.id === tx.from) || { levelId: '?', name: 'Nodo Borrado' };
            const rTo = p.roles.find(r => r.id === tx.to) || { levelId: '?', name: 'Nodo Borrado' };
            const color = tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';

            const stepEl = document.createElement('div');
            stepEl.className = 'flow-step';
            if (i === highlightIndex) stepEl.classList.add('flash-highlight');
            stepEl.style.borderLeft = `3px solid ${color}`;
            
            const actions = `
                <div class="step-actions">
                    ${i > 0 ? `<button class="btn-step btn-move-up" data-idx="${i}" title="Subir">↑</button>` : ''}
                    ${i < txs.length - 1 ? `<button class="btn-step btn-move-down" data-idx="${i}" title="Bajar">↓</button>` : ''}
                    <button class="btn-step edit btn-edit" data-idx="${i}" title="Editar">✎</button>
                    <button class="btn-step del btn-del" data-idx="${i}" title="Eliminar">🗑️</button>
                </div>
            `;

            stepEl.innerHTML = `
                <div class="step-info">
                    <div class="step-meta" style="color: ${color};"><span style="font-weight:bold;">[${i + 1}]</span> ⏱ ${tx.horas}h Est.</div>
                    <div class="step-route-compact">
                        <span class="route-level">${rFrom.levelId}</span> <span class="route-name">${rFrom.name}</span>
                        <span class="route-arrow">&rarr;</span>
                        <span class="route-level">${rTo.levelId}</span> <span class="route-name">${rTo.name}</span>
                    </div>
                    <div class="step-deliv-name" style="color: ${color};">${tx.entregable}</div>
                </div>
                ${isPO ? actions : ''}
            `;
            this.dom.seqList.appendChild(stepEl);
        });
    }

    renderMap(canvasElement, isEditMode) {
        if(!canvasElement) return;
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if (!p) return;

        const positions = {};
        canvasElement.querySelectorAll('.node').forEach(n => { positions[n.dataset.id] = { left: n.style.left, top: n.style.top }; n.remove(); });

        const layout = { '@anxaneta': {x: 50, y: 15}, '@aixecador': {x: 50, y: 35}, '@dosos': {x: 35, y: 55}, '@baixos': {x: 65, y: 55}, '@pinya': {x: 50, y: 80} };
        const levelCounts = {};

        p.roles.forEach(rol => {
            const level = rol.levelId || '@baixos';
            levelCounts[level] = (levelCounts[level] || 0) + 1;
            const el = document.createElement('div');
            const isGhost = rol.isArchived ? 'ghost-node' : '';
            el.className = `node ${isGhost}`;
            el.dataset.id = rol.id;
            
            if (positions[rol.id]) {
                el.style.left = positions[rol.id].left; el.style.top = positions[rol.id].top;
            } else {
                const pos = { ...(layout[level] || {x:50, y:50}) };
                if (levelCounts[level] > 1) pos.x += (levelCounts[level] - 1) * 20 - 10;
                el.style.left = `${pos.x}%`; el.style.top = `${pos.y}%`;
            }

            el.style.borderColor = this.getColor(level);
            el.innerHTML = `<div style="font-size:1.5rem; margin-bottom:2px;">${this.getIcon(level)}</div><div class="node-name" title="${rol.name}">${rol.name}</div>`;

            if(isEditMode) {
                el.addEventListener('dblclick', (e) => {
                    if (window.innerWidth <= 768 || this.isBuildingFlow) return; 
                    this.selectedRoleId = rol.id;
                    canvasElement.querySelectorAll('.node').forEach(n => n.classList.remove('selected'));
                    el.classList.add('selected');

                    this.dom.inspectorModal.style.display = 'flex';
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
            }
            canvasElement.appendChild(el);
        });
    }

    injectSvgMarkers() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <marker id="arrow-tangible" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-green)"/></marker>
            <marker id="arrow-intangible" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-purple)"/></marker>
            <marker id="arrow-sick" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-red)"/></marker>
        `;
        if(this.dom.svgVis) this.dom.svgVis.appendChild(defs.cloneNode(true));
        if(this.dom.svgEdit) this.dom.svgEdit.appendChild(defs.cloneNode(true));
    }

    drawEdges() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if(this.dom.svgVis) this.dom.svgVis.innerHTML = '';
        if(this.dom.svgEdit) this.dom.svgEdit.innerHTML = '';
        this.dom.canvasVis.querySelectorAll('.tx-badge').forEach(b => b.remove()); 
        if(this.dom.canvasEdit) this.dom.canvasEdit.querySelectorAll('.tx-badge').forEach(b => b.remove()); 
        
        const txs = p?.transactions || [];
        if (txs.length === 0) return;

        this.injectSvgMarkers();

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
                this.drawSingleEdgeForCanvas(this.dom.canvasVis, this.dom.svgVis, tx, index, edges, multiIdx, false);
                if(this.dom.canvasEdit) this.drawSingleEdgeForCanvas(this.dom.canvasEdit, this.dom.svgEdit, tx, index, edges, multiIdx, true);
            });
        });
    }

    drawSingleEdgeForCanvas(canvas, svg, tx, index, edgesGroup, multiIdx, isEditCanvas) {
        const dom1 = canvas.querySelector(`.node[data-id="${tx.from}"]`);
        const dom2 = canvas.querySelector(`.node[data-id="${tx.to}"]`);
        if (!dom1 || !dom2 || tx.from === tx.to) return;

        const rect1 = dom1.getBoundingClientRect();
        const rect2 = dom2.getBoundingClientRect();
        const canv = canvas.getBoundingClientRect();
        
        const x1_center = rect1.left + rect1.width / 2 - canv.left;
        const y1_center = rect1.top + rect1.height / 2 - canv.top;
        const x2_center = rect2.left + rect2.width / 2 - canv.left;
        const y2_center = rect2.top + rect2.height / 2 - canv.top;

        const dx = x2_center - x1_center;
        const dy = y2_center - y1_center;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        const trim = 42; 
        const x1 = x1_center + (dx/dist) * trim;
        const y1 = y1_center + (dy/dist) * trim;
        const x2 = x2_center - (dx/dist) * trim;
        const y2 = y2_center - (dy/dist) * trim;

        const nx = -dy / dist; 
        const ny = dx / dist;
        let offset = 0;
        if (edgesGroup.length > 1) {
            const step = 45; 
            offset = (multiIdx % 2 !== 0 ? 1 : -1) * Math.ceil(multiIdx / 2) * step;
        }

        const cx = (x1_center + x2_center) / 2 + nx * offset;
        const cy = (y1_center + y2_center) / 2 + ny * offset;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
        
        let markerId = tx.tipo === 'tangible' ? 'arrow-tangible' : 'arrow-intangible';
        path.setAttribute('marker-end', `url(#${markerId})`);
        
        const lineClass = tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible';
        path.setAttribute('class', `edge-line ${lineClass}`);
        
        if (dom1.classList.contains('ghost-node') || dom2.classList.contains('ghost-node')) {
            path.style.opacity = '0.2';
        }
        
        svg.appendChild(path);

        const txX = 0.25 * x1_center + 0.5 * cx + 0.25 * x2_center;
        const txY = 0.25 * y1_center + 0.5 * cy + 0.25 * y2_center;

        const badge = document.createElement('div');
        badge.className = 'tx-badge';
        if (dom1.classList.contains('ghost-node') || dom2.classList.contains('ghost-node')) badge.classList.add('ghost');
        badge.style.left = `${txX}px`;
        badge.style.top = `${txY}px`;
        badge.style.backgroundColor = tx.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
        badge.innerText = `[${index + 1}]`;
        badge.setAttribute('data-idx', index);
        
        if(isEditMode) {
             badge.addEventListener('click', () => {
                 this.editingTxIndex = index;
                 this.openTxBuilderModal(tx.from, tx.to, tx);
             });
        }
        
        canvas.appendChild(badge);
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }
    getColor(l) { return { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': '#7c4dff', '@pinya': '#536dfe' }[l] || '#fff'; }
}
