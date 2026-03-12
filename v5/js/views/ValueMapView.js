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
        
        // Drag & Interacción
        this.isDragging = false;
        this.draggedElement = null;
        this.hasMoved = false; 
        this.flowFromId = null;
        this.tempVector = null;

        // Simulación & Heatmap
        this.isSimulating = false;
        this.isHeatmapActive = false;
        this.simulationTimeouts = [];
        this.currentSimIndex = 0;

        // Zoom
        this.zoomVis = 1;
        this.zoomEdit = 1;

        this.levelHierarchy = { '@anxaneta': 1, '@aixecador': 2, '@dosos': 3, '@baixos': 4, '@pinya': 5 };
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
            title: "Arquitectura VNA",
            subtitle: project ? project.nombre : '',
            tagline: "Estructura Base y Tuberías de Valor Permanente.",
            tabs: [
                { id: 'visual', label: '🕸️ Red Visual', active: true },
                { id: 'edit', label: '✏️ Editar Mapa' },
                { id: 'roles', label: '🪑 Nodos / Roles' },
                { id: 'flow', label: '📋 Flujo Operativo' }
            ]
        };

        return `
            <style>
                /* CSS ESPECÍFICO DEL MAPA (NO ESTÁ EN MASTER) */
                .vna-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 15px; flex-wrap: wrap; background: rgba(255,255,255,0.02); padding: 15px; border-radius: 16px; border: 1px solid var(--glass-border); backdrop-filter: blur(5px); width: 100%; box-sizing: border-box;}
                .legend-box { display: flex; gap: 15px; font-size: 0.8rem; font-weight:bold; color: #aaa; align-items: center; background: rgba(0,0,0,0.5); padding: 8px 15px; border-radius: 8px; border: 1px solid #333; width: max-content; flex-shrink:0;}
                .legend-color { width: 18px; height: 4px; border-radius: 2px;}

                .vna-tip { background: rgba(0, 176, 255, 0.05); border: 1px dashed var(--accent-blue); color: var(--accent-blue); padding: 15px 20px; border-radius: 12px; font-size: 0.9rem; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap:15px; width: 100%; box-sizing: border-box;}

                .map-container { flex: 1; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; background: linear-gradient(180deg, rgba(15,15,20,0.9) 0%, rgba(5,5,8,1) 100%); box-shadow: inset 0 0 100px rgba(0,0,0,0.8); width: 100%; min-height: 500px;}
                .map-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0); background-size: 50px 50px; transform-origin: top left; transition: transform 0.2s ease-out; }
                
                #edges-svg-visual, #edges-svg-edit { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; overflow: visible;}
                .edge-line { fill: none; stroke-width: 3; opacity: 0.8; transition: stroke 0.4s, opacity 0.4s; pointer-events: stroke;}
                .edge-line:hover { opacity: 1; stroke-width: 6 !important; filter: brightness(1.5);}
                .edge-tangible { stroke: var(--accent-green); }
                .edge-intangible { stroke: var(--accent-purple); stroke-dasharray: 8, 8; animation: dashAnim 20s linear infinite; }
                .edge-sick { stroke: var(--accent-red) !important; stroke-width: 4 !important; filter: drop-shadow(0 0 8px var(--accent-red)); }
                .edge-temp { stroke: var(--accent-orange); stroke-width: 4; stroke-dasharray: 6, 6; animation: dashAnim 5s linear infinite; opacity: 0.9;}

                .node-wrapper { position: absolute; z-index: 5; cursor: grab; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; width: 140px; }
                .node-circle { position: relative; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); background: rgba(20, 20, 25, 0.8); backdrop-filter: blur(15px); border: 3px solid rgba(255,255,255,0.1); color: white; width: 85px; height: 85px; box-sizing: border-box;}
                .node-wrapper.selected .node-circle { border-color: var(--accent-blue) !important; box-shadow: 0 0 30px rgba(0, 176, 255, 0.6); }
                .node-wrapper.sick-node .node-circle { border-color: var(--accent-red) !important; animation: pulseSick 1s infinite alternate; }
                .node-wrapper.ghost-node { opacity: 0.4; filter: grayscale(100%); }
                .node-fmv { font-size: 1.1rem; font-weight: 900; font-family: var(--font-mono); line-height: 1; }
                .node-level-badge { position: absolute; top: -12px; left: 12px; border-radius: 50%; width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; background: #000; border: 2px solid; }
                .node-title { margin-top: 12px; font-size: 0.85rem; font-weight: 800; color: white; text-align: center; background: rgba(0,0,0,0.6); border-radius: 8px; padding: 4px 8px; pointer-events: none;}

                .tx-badge { position: absolute; transform: translate(-50%, -50%); z-index: 6; font-size: 0.8rem; font-weight: 900; font-family: var(--font-mono); padding: 4px 8px; border-radius: 6px; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); color: black;}
                .tx-tooltip { position: fixed; background: rgba(10, 10, 14, 0.95); border: 1px solid var(--accent-blue); color: white; padding: 20px; border-radius: 12px; font-size: 0.9rem; z-index: 9999; box-shadow: 0 20px 50px rgba(0,0,0,0.9); backdrop-filter: blur(15px); opacity: 0; visibility: hidden; pointer-events: none;}
                .tx-tooltip.visible { opacity: 1; visibility: visible; }

                .zoom-controls { position: absolute; bottom: 20px; left: 20px; display: flex; gap: 10px; z-index: 100;}
                .btn-zoom { background: rgba(0,0,0,0.6); border: 1px solid #444; color: white; border-radius: 10px; width: 45px; height: 45px; font-size: 1.4rem; cursor: pointer; display: flex; justify-content: center; align-items: center;}

                .role-list-card { background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; transition: all 0.3s;}
                .flow-step { background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.2rem 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;}
                .flow-step.simulating { border-color: var(--accent-blue); box-shadow: 0 0 25px rgba(0, 176, 255, 0.3); background: rgba(0,176,255,0.05); }

                @keyframes dashAnim { to { stroke-dashoffset: -200; } }
                @keyframes pulseSick { 0% { box-shadow: 0 0 10px rgba(255, 82, 82, 0.5); } 100% { box-shadow: 0 0 40px rgba(255, 82, 82, 0.9); } }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/map')}
                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="sickAlert" style="display: none; background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 15px; border-radius: 12px; font-size: 0.95rem; font-weight: bold; text-align: center; margin-bottom: 1.5rem;">⚠️ DIAGNÓSTICO: Salto estructural excesivo detectado. Los roles deben pasarse el valor escalonadamente.</div>

                    <div id="view-visual" class="tab-content active">
                        <div class="vna-controls">
                            <div class="magic-action-group">
                                <select id="selMagicAction" class="magic-select">
                                    <option value="sim">▶ Simular Tuberías (Flujo V10)</option>
                                    <option value="heat">🔥 Activar Heatmap Analítico (Tiempo V11)</option>
                                </select>
                                <button class="btn-primary" id="btnExecuteMagic">Ejecutar Magia</button>
                                <button class="btn-outline" id="btnPauseSim" style="display:none; height:40px;">⏸ Pausar</button>
                                <button class="btn-outline" id="btnStopSim" style="display:none; color:var(--accent-red); border-color:var(--accent-red); height:40px;">⏹ Reset</button>
                            </div>
                            <div class="legend-box">
                                <div style="display:flex; align-items:center; gap:8px;">🟢 Tangible</div>
                                <div style="display:flex; align-items:center; gap:8px;">🟣 Intangible</div>
                            </div>
                        </div>
                        <div class="map-container">
                            <div class="map-canvas" id="mapCanvasVisual">
                                <svg id="edges-svg-visual"><g id="paths-group-vis"></g></svg>
                            </div>
                            <div class="zoom-controls">
                                <button class="btn-zoom" id="btnZoomInVis">➕</button>
                                <button class="btn-zoom" id="btnZoomOutVis">➖</button>
                            </div>
                        </div>
                    </div>

                    <div id="view-edit" class="tab-content">
                        ${isPO ? `
                            <div class="vna-tip">
                                <div id="editTipText">💡 <b>Arquitecto:</b> Haz click en un nodo y luego en otro para trazar una tubería.</div>
                                <div style="display:flex; gap:10px;">
                                    <button class="btn-outline" id="btnUndoTx" style="height:40px;">↩️ Deshacer</button>
                                    <button class="btn-primary" id="btnOpenAddNode" style="height:40px;">➕ Instanciar Rol</button>
                                </div>
                            </div>
                            <div class="map-container" style="border-color: var(--accent-blue);">
                                <div class="map-canvas" id="mapCanvasEdit">
                                    <svg id="edges-svg-edit"><g id="paths-group-edit"></g></svg>
                                </div>
                                <div class="zoom-controls">
                                    <button class="btn-zoom" id="btnZoomInEdit">➕</button>
                                    <button class="btn-zoom" id="btnZoomOutEdit">➖</button>
                                </div>
                            </div>
                        ` : '<div class="panel">🔒 Solo el PO puede editar la arquitectura.</div>'}
                    </div>

                    <div id="view-roles" class="tab-content">
                        <div class="vna-controls">
                            <h2 style="margin:0; color:white;">Padrón de Nodos</h2>
                            ${isPO ? `<button class="btn-primary" id="btnOpenAddNodeRoles">➕ Añadir Rol</button>` : ''}
                        </div>
                        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;" id="rolesTabList"></div>
                    </div>

                    <div id="view-flow" class="tab-content">
                        <div class="sequence-panel" id="sequenceList"></div>
                    </div>
                </main>

                <div class="modal-overlay" id="txBuilderModal">
                    <div class="modal-content">
                        <h2 id="formTitle">Definir Tubería</h2>
                        <div class="form-group"><label>Origen</label><select id="selFrom" class="form-control" disabled></select></div>
                        <div class="form-group"><label>Destino</label><select id="selTo" class="form-control" disabled></select></div>
                        <div class="form-group"><label>Catálogo ADN V10</label><select id="selTemplate" class="form-control"></select></div>
                        <div class="form-group"><label>Horas Est.</label><input type="number" id="inpHoras" class="form-control"></div>
                        <div class="form-group"><label>Tipo de Valor</label><select id="selType" class="form-control"><option value="tangible">Tangible</option><option value="intangible">Intangible</option></select></div>
                        <div class="form-group"><label>Nombre del Entregable</label><input type="text" id="inpDesc" class="form-control"></div>
                        <button class="btn-primary" style="width:100%; margin-top:2rem;" id="btnAddFlow">Confirmar Tubería</button>
                    </div>
                </div>

                <div class="modal-overlay" id="addNodeModal">
                    <div class="modal-content">
                        <h2>Instanciar Rol</h2>
                        <div class="form-group"><label>Nombre</label><input type="text" id="inpNewNodeName" class="form-control"></div>
                        <div class="form-group"><label>Nivel Estructural</label><select id="selNewNodeLevel" class="form-control">
                            <option value="@anxaneta">@anxaneta (x3.0)</option><option value="@aixecador">@aixecador (x2.0)</option><option value="@dosos">@dosos (x1.5)</option><option value="@baixos" selected>@baixos (x1.2)</option><option value="@pinya">@pinya (x1.0)</option>
                        </select></div>
                        <button class="btn-primary" style="width:100%; margin-top:2rem;" id="btnConfirmNode">Añadir Rol</button>
                    </div>
                </div>

                <div class="modal-overlay" id="inspectorModal">
                    <div class="modal-content">
                        <h2>Inspector de Nodo</h2>
                        <div class="form-group"><label>Nombre</label><input type="text" id="insName" class="form-control"></div>
                        <div class="form-group"><label>Nivel</label><select id="insLevel" class="form-control"><option value="@anxaneta">@anxaneta</option><option value="@aixecador">@aixecador</option><option value="@dosos">@dosos</option><option value="@baixos">@baixos</option><option value="@pinya">@pinya</option></select></div>
                        <div class="form-group"><label>FMV €/h</label><input type="number" id="inputFmv" class="form-control"></div>
                        <div class="form-group"><label>Multiplicador</label><input type="number" step="0.1" id="inputMult" class="form-control"></div>
                        <button class="btn-primary" style="width:100%; margin-top:1rem;" id="btnSaveRole">Guardar</button>
                        <button class="btn-outline" style="width:100%; margin-top:1rem; color:var(--accent-red);" id="btnDeleteRole">Archivar Rol</button>
                        <button class="btn-outline" style="width:100%; margin-top:1rem;" id="btnCloseInspector">Cerrar</button>
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

        const state = store.getState();
        const project = state.projects.find(p => p.id === localStorage.getItem('tt_active_project')) || state.projects[0];
        if (!project) return;
        this.activeProjectId = project.id;
        const isPO = project.ownerId === state.session.activeUserId || state.session.role === 'ecosystem-owner';

        // Lógica de Tabs Globales
        window.addEventListener('ph-tab-changed', (e) => {
            if (!this.isSimulating) this.drawEdges();
        });

        // DOM Cache
        this.dom = {
            canvasVis: document.getElementById('mapCanvasVisual'),
            pathsVis: document.getElementById('paths-group-vis'), 
            canvasEdit: document.getElementById('mapCanvasEdit'),
            pathsEdit: document.getElementById('paths-group-edit'), 
            seqList: document.getElementById('sequenceList'),
            rolesTabList: document.getElementById('rolesTabList'),
            txBuilderModal: document.getElementById('txBuilderModal'),
            selFrom: document.getElementById('selFrom'),
            selTo: document.getElementById('selTo'),
            selTemplate: document.getElementById('selTemplate'),
            selType: document.getElementById('selType'),
            inpDesc: document.getElementById('inpDesc'),
            inpHoras: document.getElementById('inpHoras'),
            btnAddFlow: document.getElementById('btnAddFlow'),
            inspectorModal: document.getElementById('inspectorModal'),
            insName: document.getElementById('insName'),
            insLevel: document.getElementById('insLevel'),
            inputFmv: document.getElementById('inputFmv'),
            inputMult: document.getElementById('inputMult'),
            addNodeModal: document.getElementById('addNodeModal'),
            tooltip: document.getElementById('txTooltip')
        };

        // Zoom Logic
        const applyZoom = (canvas, zoom) => { if(canvas) canvas.style.transform = `scale(${zoom})`; this.drawEdges(); };
        document.getElementById('btnZoomInVis')?.addEventListener('click', () => { this.zoomVis = Math.min(2, this.zoomVis + 0.1); applyZoom(this.dom.canvasVis, this.zoomVis); });
        document.getElementById('btnZoomOutVis')?.addEventListener('click', () => { this.zoomVis = Math.max(0.5, this.zoomVis - 0.1); applyZoom(this.dom.canvasVis, this.zoomVis); });
        document.getElementById('btnZoomInEdit')?.addEventListener('click', () => { this.zoomEdit = Math.min(2, this.zoomEdit + 0.1); applyZoom(this.dom.canvasEdit, this.zoomEdit); });
        document.getElementById('btnZoomOutEdit')?.addEventListener('click', () => { this.zoomEdit = Math.max(0.5, this.zoomEdit - 0.1); applyZoom(this.dom.canvasEdit, this.zoomEdit); });

        // Tooltip Logic
        const showTooltip = (e) => {
            if (e.target.classList.contains('tx-badge')) {
                const idx = e.target.getAttribute('data-idx');
                const flows = project.vna_flows?.length ? project.vna_flows : project.transactions;
                const f = flows[idx]; if(!f) return;
                const rFrom = project.roles.find(r => r.id === f.from);
                const rTo = project.roles.find(r => r.id === f.to);
                this.dom.tooltip.innerHTML = `<b>${f.template || f.entregable}</b><br>${rFrom?.name} &rarr; ${rTo?.name}<br>Est: ${f.estimatedHours || f.horas}h`;
                this.dom.tooltip.style.left = `${e.clientX + 15}px`;
                this.dom.tooltip.style.top = `${e.clientY + 15}px`;
                this.dom.tooltip.classList.add('visible');
            }
        };
        this.dom.canvasVis.addEventListener('mouseover', showTooltip);
        this.dom.canvasVis.addEventListener('mousemove', showTooltip);
        this.dom.canvasVis.addEventListener('mouseout', () => this.dom.tooltip.classList.remove('visible'));

        // Drag & Drop Edit
        if (isPO && this.dom.canvasEdit) {
            this.dom.canvasEdit.addEventListener('mousedown', (e) => {
                const node = e.target.closest('.node-wrapper');
                if (node) { this.isDragging = true; this.draggedElement = node; node.style.zIndex = 1000; this.hasMoved = false; }
            });
            window.addEventListener('mousemove', (e) => {
                if (this.isDragging && this.draggedElement) {
                    this.hasMoved = true;
                    const rect = this.dom.canvasEdit.getBoundingClientRect();
                    this.draggedElement.style.left = `${((e.clientX - rect.left) / rect.width) * 100}%`;
                    this.draggedElement.style.top = `${((e.clientY - rect.top) / rect.height) * 100}%`;
                    this.drawEdges();
                }
            });
            window.addEventListener('mouseup', () => {
                if (this.isDragging) {
                    this.isDragging = false; 
                    if (!this.hasMoved && this.draggedElement) this.handleNodeClick(this.draggedElement.dataset.id);
                    if(this.draggedElement) this.draggedElement.style.zIndex = 5;
                    this.draggedElement = null;
                }
            });
        }

        // Magia Motor
        document.getElementById('btnExecuteMagic')?.addEventListener('click', () => {
            if (document.getElementById('selMagicAction').value === 'sim') this.startSimulation();
            else { this.isHeatmapActive = !this.isHeatmapActive; this.drawEdges(); }
        });

        document.getElementById('btnStopSim')?.addEventListener('click', () => this.stopSimulation());

        this.renderMap(this.dom.canvasVis, false);
        if(isPO) this.renderMap(this.dom.canvasEdit, true);
        this.renderRolesTab();
        this.renderSequence();
        setTimeout(() => this.drawEdges(), 100);
    }

    // --- MÉTODOS DE RENDERIZADO Y DIBUJO ---

    renderMap(canvas, isEdit) {
        if(!canvas) return; canvas.innerHTML = isEdit ? '<svg id="edges-svg-edit"><g id="paths-group-edit"></g></svg>' : '<svg id="edges-svg-visual"><g id="paths-group-vis"></g></svg>';
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const layout = { '@anxaneta': 15, '@aixecador': 35, '@dosos': 55, '@baixos': 75, '@pinya': 90 };
        const counts = { '@anxaneta':0, '@aixecador':0, '@dosos':0, '@baixos':0, '@pinya':0 };

        p.roles.filter(r => !r.isArchived).forEach(r => {
            counts[r.levelId]++;
            const node = document.createElement('div');
            node.className = 'node-wrapper';
            node.dataset.id = r.id;
            node.style.top = `${layout[r.levelId]}%`;
            const total = p.roles.filter(x => x.levelId === r.levelId).length;
            node.style.left = `${(100 / (total + 1)) * counts[r.levelId]}%`;
            node.innerHTML = `<div class="node-circle"><div class="node-level-badge" style="color:${this.getColor(r.levelId)}; border-color:${this.getColor(r.levelId)};">${this.getIcon(r.levelId)}</div><div class="node-fmv">${r.fmv}€</div></div><div class="node-title">${r.name}</div>`;
            canvas.appendChild(node);
        });
    }

    drawEdges() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const flows = p.vna_flows?.length ? p.vna_flows : p.transactions || [];
        const drawOn = (canvas, paths) => {
            if(!paths) return; paths.innerHTML = '';
            flows.forEach((f, i) => {
                const d1 = canvas.querySelector(`[data-id="${f.from}"]`);
                const d2 = canvas.querySelector(`[data-id="${f.to}"]`);
                if(!d1 || !d2) return;
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', `M ${d1.offsetLeft} ${d1.offsetTop} L ${d2.offsetLeft} ${d2.offsetTop}`);
                path.setAttribute('class', `edge-line ${f.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible'}`);
                paths.appendChild(path);
                const badge = document.createElement('div');
                badge.className = 'tx-badge'; badge.innerText = i + 1;
                badge.style.left = `${(d1.offsetLeft + d2.offsetLeft) / 2}px`;
                badge.style.top = `${(d1.offsetTop + d2.offsetTop) / 2}px`;
                badge.style.backgroundColor = f.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
                badge.setAttribute('data-idx', i);
                canvas.appendChild(badge);
            });
        };
        drawOn(this.dom.canvasVis, this.dom.pathsVis);
        if(this.dom.canvasEdit) drawOn(this.dom.canvasEdit, this.dom.pathsEdit);
    }

    startSimulation() {
        this.isSimulating = true;
        document.getElementById('btnStopSim').style.display = 'block';
        this.currentSimIndex = 0;
        const run = () => {
            if(!this.isSimulating) return;
            const flows = store.getState().projects.find(x => x.id === this.activeProjectId).vna_flows || [];
            if(this.currentSimIndex >= flows.length) { this.stopSimulation(); return; }
            this.renderSequence(this.currentSimIndex);
            this.currentSimIndex++;
            this.simTimeout = setTimeout(run, 1500);
        };
        run();
    }

    stopSimulation() { this.isSimulating = false; clearTimeout(this.simTimeout); document.getElementById('btnStopSim').style.display = 'none'; this.renderSequence(-1); }

    renderRolesTab() { /* Implementación simplificada para el Padrón */ }
    renderSequence(highlight = -1) { 
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const flows = p.vna_flows?.length ? p.vna_flows : p.transactions || [];
        this.dom.seqList.innerHTML = flows.map((f, i) => `
            <div class="flow-step ${i === highlight ? 'simulating' : ''}">
                <div><b>#${i+1}</b> ${f.template || f.entregable}</div>
                <div style="font-size:0.8rem; color:#888;">Est: ${f.estimatedHours || f.horas}h</div>
            </div>
        `).join('');
    }

    handleNodeClick(id) {
        if (!this.flowFromId) { this.flowFromId = id; }
        else if (this.flowFromId !== id) { /* Abrir modal para crear flujo */ this.flowFromId = null; }
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }
    getColor(l) { return { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': '#7c4dff', '@pinya': '#536dfe' }[l] || '#fff'; }
}
