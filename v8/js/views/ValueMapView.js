// v8/js/views/ValueMapView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class ValueMapView {
    constructor() {
        document.title = "Mapa VNA | TeamTowers V8";
        this.activeProjectId = null;
        this.selectedRoleId = null; 
        this.editingTxIndex = null; 
        
        this.isDragging = false;
        this.draggedElement = null;
        this.hasMoved = false; 
        this.flowFromId = null;
        this.tempVector = null;

        this.isSimulating = false;
        this.isHeatmapActive = false;
        this.currentSimIndex = 0;

        this.zoomVis = 1;
        this.zoomEdit = 1;

        this.levelHierarchy = { '@anxaneta': 1, '@aixecador': 2, '@dosos': 3, '@baixos': 4, '@pinya': 5 };
        this.resizeObserver = null;
        this.currentTab = 'visual';
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project && state.projects.length > 0) project = state.projects[state.projects.length - 1];

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/map')}
                    <main class="workspace" style="justify-content:center; align-items:center;">
                        <div class="glass-panel" style="text-align:center;">
                             <div style="font-size: 5rem; margin-bottom: 1.5rem;">🕸️</div>
                             <h2 style="color:white; margin-top:0;">Lienzo Vacío</h2>
                             <a href="/v8/create" data-link class="btn-primary">➕ Inicializar Red</a>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/map')}
                </div>
            `;
        }

        const isPO = project && (project.ownerId === activeUserId || state.session.role === 'ecosystem-owner');

        const headerConfig = {
            title: "Topología VNA",
            subtitle: project.nombre,
            tagline: "Arquitectura fractal de Roles y Tuberías de Valor.",
            tabs: [
                { id: 'visual', label: '🕸️ Red Visual', active: this.currentTab === 'visual' },
                { id: 'edit', label: '✏️ Arquitecto', active: this.currentTab === 'edit' },
                { id: 'roles', label: '🪑 Padrón Nodos', active: this.currentTab === 'roles' },
                { id: 'flow', label: '📋 Tubos Base', active: this.currentTab === 'flow' }
            ],
            magicActions: [
                { id: 'sim_flow', label: 'Simular Tuberías', icon: '▶', isAi: false },
                { id: 'sim_heat', label: 'Heatmap de Carga', icon: '🔥', isAi: false },
                { id: 'sim_stop', label: 'Detener Simulación', icon: '⏹', isAi: false }
            ]
        };

        return `
            <style>
                .workspace-map { display: flex; flex-direction: column; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; position: relative; scroll-behavior: smooth; width: 100%; box-sizing: border-box;}
                .tab-content { display: none; flex-direction: column; flex: 1; animation: fadeIn 0.4s ease-out; min-height: 500px; position: relative; width: 100%;}
                .tab-content.active { display: flex; }

                /* LIENZO PRINCIPAL */
                .map-container { flex: 1; position: relative; overflow: hidden; border: 1px solid var(--glass-border); border-radius: 20px; background: linear-gradient(180deg, rgba(15,15,20,0.9) 0%, rgba(5,5,8,1) 100%); box-shadow: inset 0 0 100px rgba(0,0,0,0.8); width: 100%; min-height: 500px; transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);}
                .map-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0); background-size: 50px 50px; transform-origin: top left; transition: transform 0.2s ease-out; }
                #edges-svg-visual, #edges-svg-edit { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; overflow: visible;}
                
                /* MODO FULLSCREEN ARQUITECTO */
                .map-container.fullscreen-mode {
                    position: fixed !important; top: 0 !important; left: 0 !important;
                    width: 100vw !important; height: 100vh !important; height: 100dvh !important;
                    z-index: 99999 !important; border-radius: 0 !important;
                    background: #050508 !important;
                }

                /* LÍNEAS SVG */
                .edge-line { fill: none; stroke-width: 3; opacity: 0.8; transition: stroke 0.4s, opacity 0.4s, stroke-width 0.4s; }
                .edge-line:hover { opacity: 1; stroke-width: 6 !important; cursor: pointer; pointer-events: stroke; filter: brightness(1.5);}
                .edge-tangible { stroke: var(--accent-green); filter: drop-shadow(0 0 3px rgba(0, 230, 118, 0.4));}
                .edge-intangible { stroke: var(--accent-purple); stroke-dasharray: 8, 8; animation: dashAnim 20s linear infinite; filter: drop-shadow(0 0 3px rgba(224, 64, 251, 0.4));}
                .edge-sick { stroke: var(--accent-red) !important; stroke-width: 4 !important; filter: drop-shadow(0 0 8px var(--accent-red)); }
                .edge-temp { stroke: var(--accent-orange); stroke-width: 4; stroke-dasharray: 6, 6; animation: dashAnim 5s linear infinite; opacity: 0.9;}

                /* ESTRUCTURA DE NODO */
                .node-wrapper { position: absolute; z-index: 5; cursor: grab; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; width: 140px; transition: filter 0.3s;}
                .node-wrapper:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.05); }
                .node-wrapper.selected { z-index: 10; }
                .node-wrapper:hover { filter: brightness(1.2); z-index: 9;}
                
                .node-circle { position: relative; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; transition: all 0.3s; background: rgba(20, 20, 25, 0.8); backdrop-filter: blur(15px); border: 3px solid rgba(255,255,255,0.1); color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.6); width: 85px; height: 85px; box-sizing: border-box;}
                .node-wrapper.selected .node-circle { border-color: var(--accent-blue) !important; box-shadow: 0 0 30px rgba(0, 176, 255, 0.6), inset 0 0 20px rgba(0, 176, 255, 0.2) !important; }
                .node-wrapper.sick-node .node-circle { border-color: var(--accent-red) !important; box-shadow: 0 0 45px rgba(255, 82, 82, 0.9) !important; animation: pulseSick 1s infinite alternate; }
                .node-wrapper.ghost-node { opacity: 0.4; filter: grayscale(100%); z-index: 1; }
                .node-wrapper.ghost-node .node-circle { border-style: dashed;}
                
                .node-fmv { font-size: 1.1rem; font-weight: 900; font-family: var(--font-mono); line-height: 1; margin-bottom: 2px;}
                .node-label-fmv { font-size: 0.65rem; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;}
                .node-level-badge { position: absolute; top: -12px; left: 12px; border-radius: 50%; width: 36px; height: 36px; display: flex; justify-content: center; align-items: center; font-size: 1.2rem; background: #000; border: 2px solid; box-shadow: 0 5px 15px rgba(0,0,0,0.8); z-index: 2; box-sizing: border-box;}
                
                .node-title { margin-top: 12px; font-size: 0.85rem; font-weight: 800; color: white; text-align: center; text-transform: uppercase; width: 100%; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3; padding: 4px 8px; text-shadow: 0 4px 8px rgba(0,0,0,0.9); pointer-events: none; background: rgba(0,0,0,0.6); border-radius: 8px; backdrop-filter: blur(5px);}

                #mapCanvasEdit .node-wrapper { cursor: pointer; } 
                #mapCanvasEdit .node-wrapper:hover .node-circle { transform: scale(1.15); box-shadow: 0 0 25px rgba(0, 176, 255, 0.4); }
                .node-wrapper.flow-source .node-circle { border-color: var(--accent-orange) !important; box-shadow: 0 0 40px rgba(255, 171, 64, 0.6) !important; z-index: 20;}

                /* BADGES Y TOOLTIPS */
                .tx-badge { position: absolute; transform: translate(-50%, -50%); z-index: 6; font-size: 0.8rem; font-weight: 900; font-family: var(--font-mono); padding: 4px 8px; border-radius: 6px; cursor: pointer; pointer-events: auto; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 5px 15px rgba(0,0,0,0.6); transition: all 0.3s; color: black;}
                .tx-badge:hover { transform: translate(-50%, -50%) scale(1.3); filter: brightness(1.2); z-index: 100; border-color: white;}
                .tx-badge.ghost { opacity: 0.3; }

                .tx-tooltip { position: fixed; background: rgba(10, 10, 14, 0.95); border: 1px solid var(--accent-blue); color: white; padding: 20px; border-radius: 12px; font-size: 0.9rem; z-index: 999999; box-shadow: 0 20px 50px rgba(0,0,0,0.9); backdrop-filter: blur(15px); opacity: 0; visibility: hidden; transition: opacity 0.2s; min-width: 280px; max-width: 350px; line-height: 1.5; pointer-events: none;}
                .tx-tooltip.visible { opacity: 1; visibility: visible; }

                /* ZOOM Y CONTROLES ARQUITECTO */
                .zoom-controls { position: absolute; bottom: 20px; left: 20px; display: flex; gap: 10px; z-index: 100;}
                .btn-zoom { background: rgba(0,0,0,0.6); border: 1px solid #444; color: white; border-radius: 10px; width: 45px; height: 45px; font-size: 1.4rem; font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(10px); transition: 0.2s;}
                .btn-zoom:hover { background: rgba(0,176,255,0.1); border-color: var(--accent-blue); color: var(--accent-blue);}

                .btn-fullscreen { position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.8); border: 1px dashed var(--accent-orange); color: var(--accent-orange); padding: 10px 15px; border-radius: 10px; font-weight: 900; cursor: pointer; z-index: 100; transition: 0.3s; backdrop-filter: blur(10px);}
                .btn-fullscreen:hover { background: var(--accent-orange); color: black; box-shadow: 0 0 20px rgba(255,171,64,0.4);}

                /* PESTAÑAS (LUXURY LISTS) */
                .roles-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap:15px;}
                .roles-grid-tab { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; width: 100%;}
                .role-list-card { background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; gap: 15px; transition: 0.3s; backdrop-filter: blur(10px);}
                .role-list-card:hover { background: rgba(255,255,255,0.03); transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.4);}

                .flow-container { display: flex; gap: 2rem; flex: 1; align-items: flex-start; margin-top: 10px;}
                .sequence-panel { flex: 2; display: flex; flex-direction: column; gap: 15px; max-height: calc(100vh - 250px); overflow-y: auto; padding-right: 15px;}
                
                .flow-step { background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.2rem 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 15px; transition: all 0.3s;}
                .flow-step:hover { background: rgba(255,255,255,0.03); border-color:#444;}
                .flow-step.simulating { transform: scale(1.03); border-color: var(--accent-blue); box-shadow: 0 0 25px rgba(0, 176, 255, 0.3); background: rgba(0,176,255,0.05); z-index:10; position:relative;}
                
                .step-info { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0; }
                .step-meta { font-size: 0.75rem; font-family: var(--font-mono); text-transform: uppercase; display: flex; align-items: center; gap: 8px; font-weight:bold;}
                .step-route-compact { font-size: 0.95rem; display: flex; align-items: center; flex-wrap: wrap; line-height: 1.3;}
                .route-level { color: #888; font-family: var(--font-mono); font-size: 0.8rem; margin-right: 6px; }
                .route-name { font-weight: 900; color: white; text-transform:uppercase; letter-spacing:0.5px;}
                .route-arrow { color: #555; margin: 0 10px; }
                .step-deliv-name { font-size: 1.1rem; font-weight: bold; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: #ccc;}
                
                .step-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
                .btn-step { background: rgba(0,0,0,0.5); border: 1px solid #333; color: var(--text-muted); border-radius: 8px; padding: 8px 15px; cursor: pointer; font-size: 0.85rem; font-weight:bold; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
                .btn-step:hover { background: rgba(255,255,255,0.1); color: white; border-color: #666; }
                .btn-step.del:hover { background: rgba(255, 82, 82, 0.15); color: var(--accent-red); border-color: var(--accent-red); }
                .btn-step.edit { background: rgba(0, 176, 255, 0.05); color: var(--accent-blue); border-color: rgba(0,176,255,0.3); }

                /* =========================================================
                   AI SCAFFOLD (EL COPILOTO)
                   ========================================================= */
                .ai-scaffold {
                    position: fixed; right: 30px; bottom: 30px; width: 340px;
                    background: rgba(10, 10, 15, 0.95); backdrop-filter: blur(20px);
                    border: 1px solid rgba(224, 64, 251, 0.4); border-radius: 16px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 20px rgba(224,64,251,0.1);
                    z-index: 9000; display: flex; flex-direction: column; overflow: hidden;
                    transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s;
                    transform: translateY(150%); opacity: 0;
                }
                .ai-scaffold.visible { transform: translateY(0); opacity: 1; }
                .ai-header { background: rgba(224,64,251,0.1); padding: 15px; font-weight: 900; color: var(--accent-purple); display:flex; justify-content:space-between; border-bottom: 1px solid rgba(224,64,251,0.2); font-size:0.9rem; text-transform:uppercase; letter-spacing:1px;}
                .ai-body { padding: 20px; font-size: 0.9rem; color: #ccc; line-height: 1.5; font-family:var(--font-main);}
                .ai-btn-close { background:transparent; border:none; color:#888; cursor:pointer; font-size:1.2rem; line-height:1;}
                .ai-btn-close:hover { color:white; }

                /* MODALS LUXURY */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 999999; }
                .modal-content { background: var(--bg-dark); border: 1px solid var(--glass-border); border-top: 4px solid var(--accent-blue); padding: 3rem; border-radius: 24px; width: 100%; max-width: 550px; box-shadow: 0 25px 60px rgba(0,0,0,0.8); box-sizing: border-box; max-height: 90vh; overflow-y:auto;}
                
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; font-weight: bold; letter-spacing: 1px;}
                .form-control { background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 14px 18px; border-radius: 12px; font-family: inherit; font-size: 1rem; outline: none; width: 100%; transition: all 0.3s; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0,176,255,0.1);}

                @keyframes dashAnim { to { stroke-dashoffset: -200; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulseSick { 0% { box-shadow: 0 0 20px rgba(255, 82, 82, 0.5); } 100% { box-shadow: 0 0 50px rgba(255, 82, 82, 0.9); } }

                /* MOBILE FIXES */
                @media (max-width: 768px) {
                    .workspace-map { padding: 90px 1rem 120px 1rem; } 
                    .map-container { height: calc(100vh - 350px); min-height: 400px; border-radius: 16px;}
                    .node-wrapper { width: 100px;}
                    .node-circle { width: 60px; height: 60px; border-width: 2px;} 
                    .node-level-badge { width: 28px; height: 28px; font-size: 0.9rem; top: -8px; left: 0px;}
                    .node-title { font-size: 0.7rem; background: rgba(0,0,0,0.7);}
                    .flow-container { flex-direction: column; gap: 1.5rem;}
                    .sequence-panel { width: 100%; max-height: none; padding-right: 0;}
                    .flow-step { flex-direction: column; align-items: stretch; gap: 15px;}
                    .step-actions { flex-direction: row; justify-content: space-between; border-top: 1px dashed #333; padding-top: 15px; flex-wrap:wrap;}
                    .step-actions .btn-step { flex: 1; padding: 12px; min-width: 45%;}
                    .modal-content { padding: 2rem 1.5rem; }
                    .ai-scaffold { width: calc(100% - 40px); right: 20px; bottom: 90px; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/map')}

                <main class="workspace-map">
                    
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="sickAlert" style="display: none; background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 15px; border-radius: 12px; font-size: 0.95rem; font-weight: bold; text-align: center; margin-bottom: 1.5rem;">⚠️ DIAGNÓSTICO: Salto estructural excesivo detectado. Los roles deben pasarse el valor escalonadamente.</div>

                    <div id="tab-visual" class="tab-content ${this.currentTab === 'visual' ? 'active' : ''}">
                        <div style="display: flex; gap: 15px; font-size: 0.8rem; font-weight:bold; color: #aaa; align-items: center; background: rgba(0,0,0,0.5); padding: 8px 15px; border-radius: 8px; border: 1px solid var(--glass-border); width: max-content; margin-bottom: 1rem;">
                            <div style="display: flex; align-items: center; gap: 8px; text-transform: uppercase;"><div style="width:18px; height:4px; border-radius:2px; background:var(--accent-green);"></div> Tangible</div>
                            <div style="display: flex; align-items: center; gap: 8px; text-transform: uppercase;"><div style="width:18px; height:4px; border-radius:2px; border-bottom:2px dashed var(--accent-purple); background:transparent;"></div> Intangible</div>
                        </div>

                        <div class="map-container">
                            <div class="map-canvas" id="mapCanvasVisual">
                                <svg id="edges-svg-visual">
                                    <defs>
                                        <marker id="arrow-tangible-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#00e676"/></marker>
                                        <marker id="arrow-intangible-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#e040fb"/></marker>
                                        <marker id="arrow-sick-vis" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#ff5252"/></marker>
                                    </defs>
                                    <g id="paths-group-vis"></g>
                                </svg>
                            </div>
                            <div class="zoom-controls">
                                <button class="btn-zoom" id="btnZoomInVis">➕</button>
                                <button class="btn-zoom" id="btnZoomOutVis">➖</button>
                            </div>
                        </div>
                    </div>

                    <div id="tab-edit" class="tab-content ${this.currentTab === 'edit' ? 'active' : ''}">
                        ${isPO ? `
                            <div style="background: rgba(0, 176, 255, 0.05); border: 1px dashed var(--accent-blue); color: var(--accent-blue); padding: 15px 20px; border-radius: 12px; font-size: 0.9rem; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap:15px; width: 100%; box-sizing: border-box;">
                                <div id="editTipText">💡 <b>Modo Arquitecto:</b> Haz clic en un nodo y luego en otro para trazar una tubería permanente. Arrástralos para moverlos.</div>
                                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                                    <button class="btn-primary" id="btnUndoTx" style="background:transparent; border:1px solid var(--accent-orange); color:var(--accent-orange); height:40px; padding:0 15px; font-size:0.8rem;"><span style="font-size:1.2rem;">↩️</span> Deshacer Última</button>
                                    <button class="btn-primary" id="btnOpenAddNode" style="background:transparent; border:1px dashed var(--accent-blue); color:var(--accent-blue); height:40px; padding:0 15px; font-size:0.8rem;">➕ Instanciar Rol</button>
                                </div>
                            </div>
                            
                            <div class="map-container" id="editMapContainer" style="border-color: var(--accent-blue); box-shadow: inset 0 0 100px rgba(0,176,255,0.1);">
                                <button class="btn-fullscreen" id="btnToggleFullscreen">🔲 Modo Inmersivo</button>
                                <div class="map-canvas building-flow" id="mapCanvasEdit">
                                    <svg id="edges-svg-edit">
                                        <defs>
                                            <marker id="arrow-tangible-edit" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#00e676"/></marker>
                                            <marker id="arrow-intangible-edit" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#e040fb"/></marker>
                                            <marker id="arrow-temp-edit" markerWidth="12" markerHeight="8" refX="10" refY="4" orient="auto"><polygon points="0 0, 12 4, 0 8" fill="#ffab40"/></marker>
                                        </defs>
                                        <g id="paths-group-edit"></g>
                                    </svg>
                                </div>
                                <div class="zoom-controls">
                                    <button class="btn-zoom" id="btnZoomInEdit">➕</button>
                                    <button class="btn-zoom" id="btnZoomOutEdit">➖</button>
                                </div>
                            </div>
                        ` : `
                            <div style="text-align:center; padding:5rem; background:rgba(0,0,0,0.3); border-radius:20px; border:1px dashed #333;">
                                <div style="font-size: 4rem; margin-bottom:1rem;">🔒</div>
                                <h2 style="color:white; font-weight:900;">Modo Arquitecto Bloqueado</h2>
                                <p style="color:#888;">Solo el Creador puede editar la topología inmutable de este Castell.</p>
                            </div>
                        `}
                    </div>

                    <div id="tab-roles" class="tab-content ${this.currentTab === 'roles' ? 'active' : ''}">
                        <div class="roles-header">
                            <div>
                                <h2 style="color:white; margin:0; font-weight:900;">Padrón de Nodos Estructurales</h2>
                                <p style="color:#888; font-size:0.95rem; margin:5px 0 0 0;">Gestión directa de los actores que componen el mapa.</p>
                            </div>
                            ${isPO ? `<button class="btn-primary" id="btnOpenAddNodeRoles" style="height:40px; font-size:0.9rem;">➕ Instanciar Rol</button>` : ''}
                        </div>
                        <div class="roles-grid-tab" id="rolesTabList"></div>
                    </div>

                    <div id="tab-flow" class="tab-content ${this.currentTab === 'flow' ? 'active' : ''}">
                        <div class="flow-container">
                            <div class="sequence-panel" id="sequenceList"></div>
                        </div>
                    </div>

                </main>

                <div id="aiCopilot" class="ai-scaffold">
                    <div class="ai-header">
                        <span>🧠 Agente VNA Activo</span>
                        <button class="ai-btn-close" id="btnCloseCopilot">&times;</button>
                    </div>
                    <div class="ai-body" id="aiCopilotBody">
                        <div style="text-align:center; animation: pulse 1.5s infinite;">
                            <span style="font-size:2rem; display:block; margin-bottom:10px;">👁️</span>
                            Analizando la densidad de transacciones de la red...
                        </div>
                    </div>
                </div>

                <div class="modal-overlay" id="txBuilderModal">
                    <div class="modal-content">
                        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid #333; padding-bottom: 15px;">
                            <h2 id="formTitle" style="margin:0; font-size:1.5rem; color:var(--accent-blue); font-weight:900; letter-spacing:-0.5px;">Definir Tubería (Flow)</h2>
                            <button id="btnCloseTxBuilder" style="background:none; border:none; color:#aaa; font-size:2.5rem; cursor:pointer; line-height:1;">&times;</button>
                        </div>
                        
                        <div class="form-group" style="display: flex; gap: 15px; flex-wrap:wrap;">
                            <div style="flex:1; min-width:200px;">
                                <label>Origen</label>
                                <select id="selFrom" class="form-control" disabled style="opacity:0.6; font-weight:bold;"></select>
                            </div>
                            <div style="flex:1; min-width:200px;">
                                <label>Destino</label>
                                <select id="selTo" class="form-control" disabled style="opacity:0.6; font-weight:bold;"></select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Catálogo de Entregables (Basado en Rol)</label>
                            <select id="selTemplate" class="form-control" style="background: rgba(0, 176, 255, 0.05); border-color: var(--accent-blue); color:var(--accent-blue); font-weight:bold;">
                                <option value="">Cargando ontología...</option>
                            </select>
                        </div>
                        <div class="form-group" style="display: flex; gap: 15px;">
                            <div style="flex:2;">
                                <label>Tipo de Valor</label>
                                <select id="selType" class="form-control">
                                    <option value="tangible">🟢 Tangible (Contractual)</option>
                                    <option value="intangible">🟣 Intangible (Soporte)</option>
                                </select>
                            </div>
                            <div style="flex:1;">
                                <label>Horas Est.</label>
                                <input type="number" id="inpHoras" class="form-control" value="2" style="font-family:var(--font-mono); font-weight:bold; color:var(--accent-green);">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Nombre del Entregable Teórico</label>
                            <input type="text" id="inpDesc" class="form-control" placeholder="Ej: Reporte Q1">
                        </div>
                        <button class="btn-primary" style="width: 100%; margin-top: 2rem;" id="btnAddFlow">➕ Sellar Tubería</button>
                    </div>
                </div>

                <div class="modal-overlay" id="addNodeModal">
                    <div class="modal-content">
                        <h2 style="color: white; margin-bottom: 2rem; margin-top:0; font-weight:900;">Instanciar Nodo (Silla)</h2>
                        <div class="form-group">
                            <label>Nombre de la Actividad</label>
                            <input type="text" id="inpNewNodeName" class="form-control" placeholder="Ej: DevOps">
                        </div>
                        <div class="form-group">
                            <label>Nivel Jerárquico (Multiplicador)</label>
                            <select id="selNewNodeLevel" class="form-control" style="font-family:var(--font-mono); font-weight: bold;">
                                <option value="@anxaneta">@anxaneta (x3.0) - Cúpula</option>
                                <option value="@aixecador">@aixecador (x2.0) - Táctica</option>
                                <option value="@dosos">@dosos (x1.5) - Supervisión</option>
                                <option value="@baixos" selected>@baixos (x1.2) - Producción</option>
                                <option value="@pinya">@pinya (x1.0) - Soporte</option>
                            </select>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 3rem; gap:15px;">
                            <button class="btn-primary" style="flex:1; background:transparent; border:1px solid #555; color:white;" id="btnCancelNode">Cancelar</button>
                            <button class="btn-primary" style="flex:2;" id="btnConfirmNode">Añadir al Mapa</button>
                        </div>
                    </div>
                </div>

                <div class="modal-overlay" id="inspectorModal">
                    <div class="modal-content">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom:1px solid #333; padding-bottom:15px;">
                            <h2 style="color: white; margin:0; font-weight:900;">Inspector de Nodo</h2>
                            <button id="btnCloseInspector" style="background:none; border:none; color:#aaa; cursor:pointer; font-size: 2.5rem; line-height:1;">&times;</button>
                        </div>
                        <div class="form-group">
                            <label>Nivel Estructural</label>
                            <select id="insLevel" class="form-control" style="font-family:var(--font-mono); font-weight: bold;">
                                <option value="@anxaneta">@anxaneta (Visión)</option>
                                <option value="@aixecador">@aixecador (Táctica)</option>
                                <option value="@dosos">@dosos (Auditoría)</option>
                                <option value="@baixos">@baixos (Producción)</option>
                                <option value="@pinya">@pinya (Soporte)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Nombre de la Actividad</label>
                            <input type="text" id="insName" class="form-control">
                        </div>
                        <div style="display:flex; gap:15px;">
                            <div class="form-group" style="flex:1;">
                                <label>Valor (FMV €/h)</label>
                                <input type="number" id="inputFmv" class="form-control" style="color:var(--accent-green); font-weight:bold; font-family:var(--font-mono);">
                            </div>
                            <div class="form-group" style="flex:1;">
                                <label>Multiplicador</label>
                                <input type="number" step="0.1" id="inputMult" class="form-control" style="color:var(--accent-orange); font-weight:bold; font-family:var(--font-mono);">
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 2rem;">
                            <button class="btn-primary" style="height:50px; font-size:1.05rem;" id="btnSaveRole">✓ Actualizar Kernel</button>
                            <button class="btn-primary" style="background:rgba(255,82,82,0.1); border:1px solid var(--accent-red); color: var(--accent-red); height:50px;" id="btnDeleteRole">🗑️ Archivar Nodo</button>
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
        
        if (!project) return;
        this.activeProjectId = project.id;
        const isPO = project.ownerId === state.session.activeUserId || state.session.role === 'ecosystem-owner';
        
        this.dom = {
            canvasVis: document.getElementById('mapCanvasVisual'),
            pathsVis: document.getElementById('paths-group-vis'), 
            canvasEdit: document.getElementById('mapCanvasEdit'),
            pathsEdit: document.getElementById('paths-group-edit'), 
            editMapContainer: document.getElementById('editMapContainer'),
            btnFullscreen: document.getElementById('btnToggleFullscreen'),
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
            formTitle: document.getElementById('formTitle'),
            editTipText: document.getElementById('editTipText'),
            btnUndoTx: document.getElementById('btnUndoTx'),
            
            inspectorModal: document.getElementById('inspectorModal'),
            insName: document.getElementById('insName'),
            insLevel: document.getElementById('insLevel'),
            inputFmv: document.getElementById('inputFmv'),
            inputMult: document.getElementById('inputMult'),
            addNodeModal: document.getElementById('addNodeModal'),
            
            sickAlert: document.getElementById('sickAlert'),
            tooltip: document.getElementById('txTooltip'),
            
            aiCopilot: document.getElementById('aiCopilot'),
            aiCopilotBody: document.getElementById('aiCopilotBody'),
            btnCloseCopilot: document.getElementById('btnCloseCopilot')
        };

        // -- TABS LOGIC V8 GLOBAL EVENT --
        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.currentTab}`);
            if(target) target.classList.add('active');

            if(this.currentTab === 'visual' || this.currentTab === 'edit') {
                setTimeout(() => { if(!this.isSimulating) this.drawEdges(); }, 50);
            }
        });

        // -- MAGIC ACTION EVENT V8 --
        window.addEventListener('ph-magic-action', (e) => {
            if(e.detail.actionId === 'sim_flow') {
                this.isHeatmapActive = false;
                this.startSimulation();
            }
            if(e.detail.actionId === 'sim_heat') {
                this.stopSimulation();
                this.isHeatmapActive = true;
                this.drawEdges(); 
                this.triggerAiInsight("🔥 <b>Heatmap Activado.</b> Las líneas más gruesas indican las tuberías por donde ha fluido más Proof of Work auditado.");
            }
            if(e.detail.actionId === 'sim_stop') {
                this.stopSimulation();
                this.dom.aiCopilot.classList.remove('visible');
            }
        });

        // -- AI COPILOT LOGIC --
        if(this.dom.btnCloseCopilot) {
            this.dom.btnCloseCopilot.addEventListener('click', () => {
                this.dom.aiCopilot.classList.remove('visible');
            });
        }

        // -- FULLSCREEN ARCHITECT --
        if(this.dom.btnFullscreen) {
            this.dom.btnFullscreen.addEventListener('click', () => {
                this.dom.editMapContainer.classList.toggle('fullscreen-mode');
                const isFull = this.dom.editMapContainer.classList.contains('fullscreen-mode');
                this.dom.btnFullscreen.innerText = isFull ? '✖ Salir Inmersión' : '🔲 Modo Inmersivo';
                setTimeout(() => this.drawEdges(), 50);
            });
        }

        // ZOOM LOGIC
        const setupZoom = (btnInId, btnOutId, canvasObj, propName) => {
            const btnIn = document.getElementById(btnInId);
            const btnOut = document.getElementById(btnOutId);
            if(btnIn && btnOut && canvasObj) {
                btnIn.addEventListener('click', () => {
                    this[propName] = Math.min(2, this[propName] + 0.1);
                    canvasObj.style.transform = `scale(${this[propName]})`;
                });
                btnOut.addEventListener('click', () => {
                    this[propName] = Math.max(0.5, this[propName] - 0.1);
                    canvasObj.style.transform = `scale(${this[propName]})`;
                });
            }
        };
        setupZoom('btnZoomInVis', 'btnZoomOutVis', this.dom.canvasVis, 'zoomVis');
        setupZoom('btnZoomInEdit', 'btnZoomOutEdit', this.dom.canvasEdit, 'zoomEdit');

        // RENDER INICIAL
        setTimeout(() => {
            this.renderMap(this.dom.canvasVis, false);
            if(isPO) this.renderMap(this.dom.canvasEdit, true);
            this.renderRolesTab();
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

        // EVENTOS CANVAS EDICIÓN (DRAG & CLICK)
        if (isPO && this.dom.canvasEdit) {
            
            if(this.dom.btnUndoTx) {
                this.dom.btnUndoTx.addEventListener('click', () => {
                    const pState = store.getState().projects.find(x => x.id === this.activeProjectId);
                    const flows = pState.vna_flows && pState.vna_flows.length > 0 ? pState.vna_flows : pState.transactions;
                    if (flows && flows.length > 0) {
                        const lastFlowId = flows[flows.length - 1].id || flows[flows.length - 1].hash;
                        const actionType = pState.vna_flows && pState.vna_flows.length > 0 ? 'DELETE_FLOW' : 'DELETE_TRANSACTION';
                        const payloadKey = actionType === 'DELETE_FLOW' ? 'flowId' : 'txHash';

                        store.dispatch({ type: actionType, payload: { projectId: this.activeProjectId, [payloadKey]: lastFlowId } })
                        .then(() => {
                            this.forceSaveState(store.getState());
                            this.cancelVisualFlow();
                        });
                    } else { alert("No hay flujos para deshacer."); }
                });
            }

            this.dom.canvasEdit.addEventListener('mousedown', (e) => {
                if (window.innerWidth <= 768) return; 
                const node = e.target.closest('.node-wrapper');
                if (node) {
                    this.isDragging = true;
                    this.hasMoved = false;
                    this.draggedElement = node;
                    node.style.zIndex = 1000;
                }
            });

            this.dom.canvasEdit.addEventListener('dblclick', (e) => {
                const node = e.target.closest('.node-wrapper');
                this.cancelVisualFlow();
                if(node) this.openRoleInspector(node.dataset.id);
            });

            window.addEventListener('mousemove', (e) => {
                if (this.isDragging && this.draggedElement) {
                    this.hasMoved = true;
                    const rect = this.dom.canvasEdit.getBoundingClientRect();
                    let newX = ((e.clientX - rect.left) / rect.width) * 100;
                    let newY = ((e.clientY - rect.top) / rect.height) * 100;
                    newX = Math.max(5, Math.min(newX, 95));
                    newY = Math.max(5, Math.min(newY, 95));
                    
                    // Solo actualizamos el DOM temporalmente para fluidez
                    this.draggedElement.style.left = `${newX}%`;
                    this.draggedElement.style.top = `${newY}%`;
                    this.drawEdges(); 
                } 
                else if (this.flowFromId && this.dom.canvasEdit && window.innerWidth > 768) {
                    const originNode = this.dom.canvasEdit.querySelector(`.node-wrapper[data-id="${this.flowFromId}"]`);
                    if (!originNode) return;

                    const x1_center = originNode.offsetLeft;
                    const y1_center = originNode.offsetTop;
                    
                    const canvRect = this.dom.canvasEdit.getBoundingClientRect();
                    const zoom = this.zoomEdit;
                    const x2_center = (e.clientX - canvRect.left) / zoom;
                    const y2_center = (e.clientY - canvRect.top) / zoom;

                    const dx = x2_center - x1_center;
                    const dy = y2_center - y1_center;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const trim = 50; 
                    
                    let x1 = x1_center, y1 = y1_center;
                    if (dist > trim) {
                        x1 = x1_center + (dx/dist) * trim;
                        y1 = y1_center + (dy/dist) * trim;
                    }

                    if (!this.tempVector) {
                        this.tempVector = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        this.tempVector.setAttribute('class', 'edge-temp');
                        this.tempVector.setAttribute('marker-end', 'url(#arrow-temp-edit)');
                        if(this.dom.pathsEdit) this.dom.pathsEdit.appendChild(this.tempVector);
                    }

                    this.tempVector.setAttribute('x1', x1);
                    this.tempVector.setAttribute('y1', y1);
                    this.tempVector.setAttribute('x2', x2_center);
                    this.tempVector.setAttribute('y2', y2_center);
                }
            });

            window.addEventListener('mouseup', (e) => {
                if (this.isDragging && this.draggedElement) {
                    this.isDragging = false;
                    this.draggedElement.style.zIndex = this.draggedElement.classList.contains('ghost-node') ? 1 : 5;
                    
                    if (!this.hasMoved) {
                        this.handleNodeClick(this.draggedElement.dataset.id);
                    } else {
                        // AL SOLTAR: GUARDAR COORDENADAS X/Y EN EL KERNEL
                        const newX = parseFloat(this.draggedElement.style.left);
                        const newY = parseFloat(this.draggedElement.style.top);
                        
                        store.dispatch({
                            type: 'UPDATE_ROLE',
                            payload: { 
                                projectId: this.activeProjectId, 
                                roleId: this.draggedElement.dataset.id, 
                                updates: { x: newX, y: newY } 
                            }
                        }).then(() => {
                            // Actualizar el clon del Canvas Visual también
                            const cloneNode = this.dom.canvasVis.querySelector(`.node-wrapper[data-id="${this.draggedElement.dataset.id}"]`);
                            if(cloneNode) {
                                cloneNode.style.left = `${newX}%`;
                                cloneNode.style.top = `${newY}%`;
                            }
                        });
                    }
                    this.draggedElement = null;
                }
            });

            document.getElementById('btnCloseTxBuilder').addEventListener('click', () => {
                this.dom.txBuilderModal.style.display = 'none';
                this.cancelVisualFlow();
            });

            this.dom.selTemplate.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === "manual") {
                    this.dom.inpDesc.value = '';
                    this.dom.inpDesc.focus();
                } else if (val !== "") {
                    // Extraer los datos del string JSON que guardamos en las options
                    try {
                        const template = JSON.parse(val);
                        this.dom.inpDesc.value = template.name;
                        this.dom.selType.value = template.tipo;
                        this.dom.inpHoras.value = template.estimatedHours;
                    } catch(err) { }
                }
            });

            this.dom.btnAddFlow.addEventListener('click', () => {
                const fromId = this.dom.selFrom.value;
                const toId = this.dom.selTo.value;
                const desc = this.dom.inpDesc.value.trim();
                
                if(!desc) return alert("Escribe el nombre del entregable base.");

                if (this.editingTxIndex !== null) {
                    const pCurrent = store.getState().projects.find(x => x.id === this.activeProjectId);
                    const isLegacy = !pCurrent.vna_flows || pCurrent.vna_flows.length === 0;
                    const flows = isLegacy ? pCurrent.transactions : pCurrent.vna_flows;
                    const flowToEdit = flows[this.editingTxIndex];
                    
                    const actionType = isLegacy ? 'UPDATE_TRANSACTION' : 'UPDATE_FLOW';
                    const payloadKey = isLegacy ? 'txHash' : 'flowId';
                    const targetId = isLegacy ? flowToEdit.hash : flowToEdit.id;

                    const updates = isLegacy 
                        ? { horas: parseFloat(this.dom.inpHoras.value) || 1, entregable: desc, tipo: this.dom.selType.value }
                        : { estimatedHours: parseFloat(this.dom.inpHoras.value) || 1, template: desc, tipo: this.dom.selType.value };

                    store.dispatch({
                        type: actionType,
                        payload: { projectId: this.activeProjectId, [payloadKey]: targetId, updates }
                    }).then(() => {
                        this.dom.txBuilderModal.style.display = 'none';
                        this.editingTxIndex = null;
                        this.forceSaveState(store.getState());
                        this.cancelVisualFlow();
                    });
                } else {
                    store.dispatch({
                        type: 'ADD_FLOW',
                        payload: {
                            projectId: this.activeProjectId,
                            flow: {
                                from: fromId,
                                to: toId,
                                estimatedHours: parseFloat(this.dom.inpHoras.value) || 1,
                                template: desc,
                                tipo: this.dom.selType.value
                            }
                        }
                    }).then(() => {
                        this.dom.txBuilderModal.style.display = 'none';
                        this.editingTxIndex = null;
                        this.forceSaveState(store.getState());
                        this.cancelVisualFlow();
                    });
                }
            });
            
            this.dom.seqList.addEventListener('click', (e) => {
                const target = e.target.closest('.btn-step');
                if (!target) return;
                const idx = parseInt(target.getAttribute('data-idx'));
                if (isNaN(idx)) return;

                const currentState = store.getState();
                const p = currentState.projects.find(x => x.id === this.activeProjectId);
                const isLegacy = !p.vna_flows || p.vna_flows.length === 0;
                const flows = isLegacy ? p.transactions : p.vna_flows;

                if (target.classList.contains('btn-move-up')) {
                    [flows[idx - 1], flows[idx]] = [flows[idx], flows[idx - 1]];
                    this.forceSaveState(currentState, idx - 1);
                } 
                else if (target.classList.contains('btn-move-down')) {
                    [flows[idx], flows[idx + 1]] = [flows[idx + 1], flows[idx]];
                    this.forceSaveState(currentState, idx + 1);
                } 
                else if (target.classList.contains('btn-del')) {
                    if(confirm('¿Eliminar esta tubería permanente del mapa?')) {
                        const actionType = isLegacy ? 'DELETE_TRANSACTION' : 'DELETE_FLOW';
                        const payloadKey = isLegacy ? 'txHash' : 'flowId';
                        const targetId = isLegacy ? flows[idx].hash : flows[idx].id;
                        
                        store.dispatch({ type: actionType, payload: { projectId: p.id, [payloadKey]: targetId } })
                        .then(() => this.forceSaveState(store.getState()));
                    }
                }
                else if (target.classList.contains('btn-edit')) {
                    this.editingTxIndex = idx;
                    this.openTxBuilderModal(flows[idx].from, flows[idx].to, flows[idx]);
                }
            });

            const btnAddNodes = document.querySelectorAll('#btnOpenAddNode, #btnOpenAddNodeRoles');
            btnAddNodes.forEach(btn => btn.addEventListener('click', () => this.dom.addNodeModal.style.display = 'flex'));
            
            document.getElementById('btnCancelNode').addEventListener('click', () => this.dom.addNodeModal.style.display = 'none');
            document.getElementById('btnConfirmNode').addEventListener('click', () => {
                const name = document.getElementById('inpNewNodeName').value.trim();
                const levelId = document.getElementById('selNewNodeLevel').value;
                if(!name) return;
                const multipliers = { '@anxaneta': 3.0, '@aixecador': 2.0, '@dosos': 1.5, '@baixos': 1.2, '@pinya': 1.0 };
                
                store.dispatch({ type: 'ADD_ROLE', payload: { projectId: this.activeProjectId, role: { name, levelId, multiplier: multipliers[levelId], fmv: 50, isArchived: false } } })
                .then(() => {
                    this.dom.addNodeModal.style.display = 'none';
                    document.getElementById('inpNewNodeName').value = '';
                    this.forceSaveState(store.getState());
                });
            });

            document.getElementById('btnCloseInspector').addEventListener('click', () => {
                this.dom.inspectorModal.style.display = 'none';
                this.selectedRoleId = null;
                this.dom.canvasEdit.querySelectorAll('.node-wrapper').forEach(n => n.classList.remove('selected'));
                this.dom.canvasVis.querySelectorAll('.node-wrapper').forEach(n => n.classList.remove('selected'));
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
                }).then(() => {
                    this.forceSaveState(store.getState());
                    this.dom.inspectorModal.style.display = 'none';
                });
            });

            document.getElementById('btnDeleteRole').addEventListener('click', () => {
                const state = store.getState();
                const p = state.projects.find(x => x.id === this.activeProjectId);
                const roleToArchive = p.roles.find(r => r.id === this.selectedRoleId);
                if (!roleToArchive) return;
                
                if (roleToArchive.isArchived) {
                    if(confirm('¿Desarchivar este nodo y devolverlo a la vida?')) {
                        store.dispatch({ type: 'TOGGLE_ROLE_ARCHIVE', payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId } })
                        .then(() => {
                            this.dom.inspectorModal.style.display = 'none';
                            this.forceSaveState(store.getState());
                        });
                    }
                    return;
                }
                
                if(confirm('¿Archivar este nodo? Las tareas asociadas se volverán huérfanas si no las reasignas.')) {
                     store.dispatch({ type: 'TOGGLE_ROLE_ARCHIVE', payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId } })
                     .then(() => {
                         this.dom.inspectorModal.style.display = 'none';
                         this.forceSaveState(store.getState());
                     });
                }
            });
        }

        // Tooltips 
        const showTooltip = (e) => {
            if (e.target.classList.contains('tx-badge') || e.target.classList.contains('sim-tx-badge')) {
                const idx = e.target.getAttribute('data-idx');
                const p = store.getState().projects.find(x => x.id === this.activeProjectId);
                const flows = p.vna_flows && p.vna_flows.length > 0 ? p.vna_flows : p.transactions;
                const flow = flows[idx];
                if(!flow) return; 
                
                const rFrom = p.roles.find(r => r.id === flow.from);
                const rTo = p.roles.find(r => r.id === flow.to);
                
                const typeColor = flow.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
                const typeText = flow.tipo === 'tangible' ? 'TANGIBLE' : 'INTANGIBLE';
                const delivName = flow.template || flow.entregable || 'Entregable';
                const hours = flow.estimatedHours || flow.horas || 1;
                
                const totalRealHours = flow.total_hours_processed || 0;
                const txCount = flow.total_txs || 0;

                this.dom.tooltip.innerHTML = `
                    <div style="color: ${typeColor}; font-weight: 900; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px; font-size:0.75rem;">
                        [Tubería ${parseInt(idx) + 1}] ${typeText}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px;">
                        <div style="font-size: 0.8rem;"><strong style="color:#888;">Origen:</strong> ${rFrom ? rFrom.name : '?'}</div>
                        <div style="font-size: 0.8rem;"><strong style="color:#888;">Destino:</strong> ${rTo ? rTo.name : '?'}</div>
                    </div>
                    <div style="background: rgba(0,0,0,0.5); padding: 12px; border-radius: 8px; border: 1px dashed #444; border-left: 3px solid ${typeColor}; margin-bottom: 10px;">
                        <div style="color:white; font-weight:bold; margin-bottom:5px; font-size:1rem;">${delivName}</div>
                        <div style="color:var(--text-muted); font-family: monospace;">⏱ Est: ${hours}h</div>
                    </div>
                    ${this.isHeatmapActive ? `
                        <div style="background: rgba(255,171,64,0.1); border:1px solid rgba(255,171,64,0.3); padding:8px; border-radius:6px; color:var(--accent-orange); font-size:0.75rem; font-family:monospace; text-align:center;">
                            🔥 Ledger Analytics: ${totalRealHours}h procesadas en ${txCount} transacciones.
                        </div>
                    ` : ''}
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

        this.dom.canvasVis.addEventListener('mouseover', showTooltip);
        this.dom.canvasVis.addEventListener('mouseout', (e) => { if(e.target.classList.contains('tx-badge')) this.dom.tooltip.classList.remove('visible'); });
        
        if (isPO && this.dom.canvasEdit) {
            this.dom.canvasEdit.addEventListener('mouseover', showTooltip);
            this.dom.canvasEdit.addEventListener('mouseout', (e) => { if(e.target.classList.contains('tx-badge')) this.dom.tooltip.classList.remove('visible'); });
        }
    }

    triggerAiInsight(message) {
        if(!this.dom.aiCopilot || !this.dom.aiCopilotBody) return;
        this.dom.aiCopilotBody.innerHTML = `<div style="font-size: 0.95rem;">${message}</div>`;
        this.dom.aiCopilot.classList.add('visible');
        setTimeout(() => {
            this.dom.aiCopilot.classList.remove('visible');
        }, 8000);
    }

    handleNodeClick(nodeId) {
        if (!this.flowFromId) {
            this.flowFromId = nodeId;
            const nodeEl = this.dom.canvasEdit.querySelector(`[data-id="${nodeId}"]`);
            if(nodeEl) nodeEl.classList.add('flow-source');
            this.dom.editTipText.innerHTML = `🌟 <b>Paso 2:</b> Ahora haz click en el <b>nodo destino</b> para trazar la tubería.`;
        } else if (this.flowFromId !== nodeId) {
            this.openTxBuilderModal(this.flowFromId, nodeId);
        } else {
            this.cancelVisualFlow();
        }
    }

    renderMap(canvasObj, isEditMode) {
        if(!canvasObj) return;
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if (!p || !p.roles) return;

        // FIX V8: EVITAR DUPLICACIÓN AL REDIBUJAR
        canvasObj.querySelectorAll('.node-wrapper').forEach(n => n.remove());

        let activeRoles = p.roles.filter(r => !r.isArchived);
        if (activeRoles.length === 0) return;

        const levelCounts = { '@anxaneta':0, '@aixecador':0, '@dosos':0, '@baixos':0, '@pinya':0 };
        
        // Smart Grid Distribution for Initial Layout (If no X/Y saved)
        const getInitialLayout = (level, totalInLevel, currentCount) => {
            const baseLayout = { '@anxaneta': 15, '@aixecador': 35, '@dosos': 55, '@baixos': 75, '@pinya': 90 };
            let y = baseLayout[level] || 50;
            let x = 50;
            if (totalInLevel > 1) {
                const spacing = 100 / (totalInLevel + 1);
                x = spacing * (currentCount + 1);
            }
            return { x, y };
        };

        activeRoles.forEach(r => {
            const level = r.levelId || '@baixos';
            const color = this.getColor(level);
            const icon = this.getIcon(level);
            
            const totalInLevel = activeRoles.filter(role => role.levelId === level).length;
            const pos = getInitialLayout(level, totalInLevel, levelCounts[level]);
            levelCounts[level]++;

            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'node-wrapper';
            if (this.selectedRoleId === r.id) nodeDiv.classList.add('selected');
            nodeDiv.dataset.id = r.id;

            // USAR COORDENADAS GUARDADAS O EL CÁLCULO SMART GRID
            let topPos = r.y !== undefined ? r.y : pos.y;
            let leftPos = r.x !== undefined ? r.x : pos.x;

            nodeDiv.style.top = `${topPos}%`;
            nodeDiv.style.left = `${leftPos}%`;

            nodeDiv.innerHTML = `
                <div class="node-circle">
                    <div class="node-level-badge" style="color: ${color}; border-color: ${color};" title="${r.name}">${icon}</div>
                    <div class="node-fmv" style="color: ${color};">${r.fmv}€</div>
                    <div class="node-label-fmv">x${r.multiplier}</div>
                </div>
                <div class="node-title">${r.name}</div>
            `;

            canvasObj.appendChild(nodeDiv);
        });

        const ghostRoles = p.roles.filter(r => r.isArchived);
        ghostRoles.forEach((r, i) => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'node-wrapper ghost-node';
            nodeDiv.dataset.id = r.id;
            nodeDiv.style.top = `90%`;
            nodeDiv.style.left = `${10 + (i * 10)}%`;
            nodeDiv.innerHTML = `
                <div class="node-circle">
                    <div class="node-level-badge" style="color: #666; border-color: #666;">👻</div>
                    <div class="node-fmv" style="color: #666;">ARCH</div>
                </div>
                <div class="node-title">${r.name}</div>
            `;
            canvasObj.appendChild(nodeDiv);
        });
    }

    startSimulation() {
        if (this.isSimulating) return;
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const flows = p?.vna_flows && p.vna_flows.length > 0 ? p.vna_flows : (p?.transactions || []);
        if (flows.length === 0) return alert("Dibuja tuberías de valor para simular el flujo.");

        this.isSimulating = true;
        this.dom.sickAlert.style.display = 'none';
        if(this.currentSimIndex === undefined) this.currentSimIndex = 0;
        
        if(this.currentSimIndex === 0) {
            this.dom.canvasVis.querySelectorAll('.sim-tx-badge').forEach(b => b.remove());
            this.drawEdges(); 
        }

        const stepEls = this.dom.seqList.querySelectorAll('.flow-step');

        const runNextStep = () => {
            if(!this.isSimulating) return;
            if(this.currentSimIndex >= flows.length) {
                this.stopSimulation();
                this.triggerAiInsight("✅ Simulación Completada. La red parece estructuralmente sana y sin ciclos muertos.");
                return;
            }

            const index = this.currentSimIndex;
            const flow = flows[index];

            stepEls.forEach(el => el.classList.remove('simulating'));
            if(stepEls[index]) {
                stepEls[index].classList.add('simulating');
                if(window.innerWidth > 768) stepEls[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            const r1 = p.roles.find(r => r.id === flow.from);
            const r2 = p.roles.find(r => r.id === flow.to);
            let isSickFlow = false;

            if (r1 && r2) {
                const level1 = this.levelHierarchy[r1.levelId];
                const level2 = this.levelHierarchy[r2.levelId];
                if (Math.abs(level1 - level2) > 1) {
                    isSickFlow = true;
                    this.dom.sickAlert.style.display = 'block';
                    const dom1 = this.dom.canvasVis.querySelector(`.node-wrapper[data-id="${r1.id}"]`);
                    const dom2 = this.dom.canvasVis.querySelector(`.node-wrapper[data-id="${r2.id}"]`);
                    if(dom1) dom1.classList.add('sick-node');
                    if(dom2) dom2.classList.add('sick-node');
                    this.triggerAiInsight(`⚠️ <b>Cuello de botella detectado.</b> El flujo entre ${r1.levelId} y ${r2.levelId} salta demasiados niveles de riesgo.`);
                } else {
                    this.dom.sickAlert.style.display = 'none';
                    this.dom.canvasVis.querySelectorAll('.node-wrapper').forEach(n => n.classList.remove('sick-node'));
                }
            }

            this.drawSingleEdgeAnim(flow, index, isSickFlow); 
            
            this.currentSimIndex++;
            this.simTimeoutId = setTimeout(runNextStep, 2500);
        };

        runNextStep();
    }

    stopSimulation() {
        this.isSimulating = false;
        this.isHeatmapActive = false;
        this.currentSimIndex = 0;
        clearTimeout(this.simTimeoutId);
        
        this.dom.sickAlert.style.display = 'none';

        const stepEls = this.dom.seqList.querySelectorAll('.flow-step');
        stepEls.forEach(el => el.classList.remove('simulating'));

        this.dom.canvasVis.querySelectorAll('.node-wrapper').forEach(n => n.classList.remove('sick-node'));
        this.dom.canvasVis.querySelectorAll('.sim-tx-badge').forEach(b => b.remove());

        this.drawEdges(); 
    }

    drawSingleEdgeAnim(tx, index, isSick) {
        const dom1 = this.dom.canvasVis.querySelector(`.node-wrapper[data-id="${tx.from}"]`);
        const dom2 = this.dom.canvasVis.querySelector(`.node-wrapper[data-id="${tx.to}"]`);
        if (!dom1 || !dom2) return;

        const x1_center = dom1.offsetLeft;
        const y1_center = dom1.offsetTop;
        const x2_center = dom2.offsetLeft;
        const y2_center = dom2.offsetTop;

        const dx = x2_center - x1_center;
        const dy = y2_center - y1_center;
        const dist = Math.sqrt(dx*dx + dy*dy);

        const trim = 50; 
        let x1 = x1_center, y1 = y1_center, x2 = x2_center, y2 = y2_center;
        if (dist > trim) {
            x1 = x1_center + (dx/dist) * trim;
            y1 = y1_center + (dy/dist) * trim;
            x2 = x2_center - (dx/dist) * trim;
            y2 = y2_center - (dy/dist) * trim;
        }

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
        
        let markerId = isSick ? 'arrow-sick-vis' : (tx.tipo === 'tangible' ? 'arrow-tangible-vis' : 'arrow-intangible-vis');
        path.setAttribute('marker-end', `url(#${markerId})`);
        
        const strokeColor = isSick ? '#ff5252' : (tx.tipo === 'tangible' ? '#00e676' : '#e040fb');
        const realDist = dist; 
        
        path.style.cssText = `
            fill: none; stroke: ${strokeColor}; stroke-width: 5; stroke-dasharray: ${realDist}; stroke-dashoffset: ${realDist}; animation: drawLine 1.5s ease-out forwards; filter: drop-shadow(0 0 10px ${strokeColor});
        `;

        if(this.dom.pathsVis) this.dom.pathsVis.appendChild(path);

        setTimeout(() => {
            const txX = (x1_center + x2_center) / 2;
            const txY = (y1_center + y2_center) / 2;

            const badge = document.createElement('div');
            badge.className = 'sim-tx-badge';
            badge.style.position = 'absolute';
            badge.style.left = `${txX}px`;
            badge.style.top = `${txY}px`;
            badge.style.backgroundColor = 'rgba(10,10,14,0.95)';
            badge.style.border = `2px solid ${strokeColor}`;
            badge.style.color = 'white';
            badge.style.padding = '10px 15px';
            badge.style.borderRadius = '10px';
            badge.style.boxShadow = `0 10px 30px rgba(0,0,0,0.8), 0 0 20px ${strokeColor}`;
            badge.style.zIndex = '1000';
            badge.style.textAlign = 'center';
            badge.style.animation = 'popIn 0.4s ease-out forwards';
            badge.style.pointerEvents = 'none';

            const delivName = tx.template || tx.entregable || 'Flow';
            badge.innerHTML = `<div style="color:${strokeColor}; font-weight:900; font-size:0.75rem; margin-bottom:5px; text-transform:uppercase; letter-spacing:1px;">Flujo ${index + 1}</div><div style="font-size:1rem; font-weight:bold; line-height:1.2;">${delivName}</div>`;
            this.dom.canvasVis.appendChild(badge);
        }, 1000); 
    }

    populateDropdowns(roles) {
        if (!roles) return;
        const options = roles.filter(r => !r.isArchived).map(r => `<option value="${r.id}">${r.levelId} - ${r.name}</option>`).join('');
        if(this.dom.selFrom) this.dom.selFrom.innerHTML = options;
        if(this.dom.selTo) {
            this.dom.selTo.innerHTML = options;
            if(roles.filter(r => !r.isArchived).length > 1 && this.dom.selTo.options.length > 1) this.dom.selTo.selectedIndex = 1;
        }
    }

    updateOntologyTemplates() {
        if(!this.dom.selFrom || !this.dom.selFrom.value) return;
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const role = p.roles.find(x => x.id === this.dom.selFrom.value);
        if(!role) return;

        let html = `<option value="">-- Elige un Blueprint --</option>`;
        
        // V8: Usamos el AI Prompt / Template si existe o templates genéricos
        const templates = [
            { name: "Entrega Operativa Estándar", estimatedHours: 4, tipo: "tangible" },
            { name: "Auditoría o Revisión", estimatedHours: 2, tipo: "intangible" },
            { name: "Reporte Estratégico", estimatedHours: 8, tipo: "tangible" }
        ];

        templates.forEach((t, i) => {
            const valStr = JSON.stringify(t).replace(/"/g, '&quot;');
            html += `<option value="${valStr}">${t.tipo === 'tangible' ? '🟢' : '🟣'} ${t.name} (${t.estimatedHours}h)</option>`;
        });
        
        html += `<option value="manual">✍️ Definir Tubería Manual...</option>`;
        this.dom.selTemplate.innerHTML = html;
    }

    openRoleInspector(roleId) {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if(!p) return;
        const rol = p.roles.find(r => r.id === roleId);
        if(!rol) return;

        this.selectedRoleId = rol.id;
        
        this.dom.canvasVis.querySelectorAll('.node-wrapper').forEach(n => n.classList.remove('selected'));
        if(this.dom.canvasEdit) this.dom.canvasEdit.querySelectorAll('.node-wrapper').forEach(n => n.classList.remove('selected'));
        
        const nodeVis = this.dom.canvasVis.querySelector(`.node-wrapper[data-id="${rol.id}"]`);
        const nodeEdit = this.dom.canvasEdit ? this.dom.canvasEdit.querySelector(`.node-wrapper[data-id="${rol.id}"]`) : null;
        if(nodeVis) nodeVis.classList.add('selected');
        if(nodeEdit) nodeEdit.classList.add('selected');

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
        btnDel.innerText = isLocked ? '♻️ Desarchivar (Revivir)' : '🗑️ Archivar Nodo';
        btnDel.style.borderColor = isLocked ? 'var(--accent-green)' : 'var(--accent-red)';
        btnDel.style.color = isLocked ? 'var(--accent-green)' : 'var(--accent-red)';
    }

    cancelVisualFlow() {
        this.flowFromId = null;
        if(this.dom.canvasEdit) {
            this.dom.canvasEdit.querySelectorAll('.node-wrapper').forEach(n => n.classList.remove('flow-source'));
        }
        if (this.tempVector) {
            this.tempVector.remove();
            this.tempVector = null;
        }
        if(this.dom.editTipText) {
            this.dom.editTipText.innerHTML = `💡 <b>Modo Arquitecto:</b> Haz clic en un nodo y luego en otro para trazar una tubería permanente. Arrástralos para moverlos.`;
        }
    }

    openTxBuilderModal(fromId, toId, existingFlow = null) {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        this.populateDropdowns(p.roles); 
        
        this.dom.selFrom.value = fromId;
        this.dom.selTo.value = toId;
        
        this.updateOntologyTemplates();

        if (existingFlow) {
            this.dom.formTitle.innerText = `Editando Flujo`;
            this.dom.btnAddFlow.innerText = '💾 Guardar Cambios';
            this.dom.selType.value = existingFlow.tipo;
            this.dom.inpHoras.value = existingFlow.estimatedHours || existingFlow.horas;
            this.dom.inpDesc.value = existingFlow.template || existingFlow.entregable;
            this.dom.selTemplate.value = 'manual';
        } else {
            this.dom.formTitle.innerText = `Definir Tubería (Flow)`;
            this.dom.btnAddFlow.innerText = '➕ Sellar Tubería';
            this.dom.inpDesc.value = '';
            this.dom.selTemplate.value = '';
        }
        
        this.dom.txBuilderModal.style.display = 'flex';
    }

    forceSaveState(newState, highlightIndex = -1) {
        store.state = newState;
        localStorage.setItem('tt_sos_v8_state', JSON.stringify(store.state));
        const pUpdate = store.state.projects.find(x => x.id === this.activeProjectId);
        this.populateDropdowns(pUpdate.roles);
        this.renderSequence(highlightIndex); 
        this.renderRolesTab(); 
        if(this.dom.canvasEdit) this.renderMap(this.dom.canvasEdit, true);
        this.renderMap(this.dom.canvasVis, false);
        setTimeout(() => this.drawEdges(), 100); 
    }

    renderRolesTab() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if (!p) return;
        const isPO = p.ownerId === store.getState().session.activeUserId || store.getState().session.role === 'ecosystem-owner';

        const container = document.getElementById('rolesTabList');
        if (!container) return;

        let html = '';
        p.roles.forEach(rol => {
            const color = this.getColor(rol.levelId);
            const icon = this.getIcon(rol.levelId);
            const isGhost = rol.isArchived ? 'opacity: 0.5; filter: grayscale(1); border-style:dashed;' : '';
            
            html += `
                <div class="role-list-card" style="border-left: 4px solid ${color}; ${isGhost}">
                    <div style="display:flex; align-items:center; gap: 15px;">
                        <div style="font-size: 2rem; width: 40px; text-align: center; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">${icon}</div>
                        <div>
                            <h3 style="margin: 0; color: white; font-size: 1.1rem; line-height: 1.2; font-weight:800;">
                                ${rol.name} ${rol.isArchived ? '<span style="color:#ff5252; font-size:0.7rem; vertical-align:middle; margin-left:5px;">(ARCHIVADO)</span>' : ''}
                            </h3>
                            <div style="color: #888; font-size: 0.8rem; font-family: var(--font-mono); margin-top: 4px; font-weight:bold;">
                                ${rol.levelId} | FMV: <span style="color:var(--accent-green);">${rol.fmv || 0}€/h</span> | Riesgo: x${rol.multiplier || 1.0}
                            </div>
                        </div>
                    </div>
                    ${isPO ? `<button class="btn-step edit btn-edit-role-tab" data-id="${rol.id}" style="border-color:${color}; color:${color}; background:transparent;">✎ Editar</button>` : ''}
                </div>
            `;
        });

        container.innerHTML = html || '<div style="text-align:center; padding: 2rem; color:#666; border: 1px dashed #333; border-radius:12px; grid-column:1/-1;">No hay roles creados en la matriz.</div>';

        if (isPO) {
            container.querySelectorAll('.btn-edit-role-tab').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.openRoleInspector(e.currentTarget.dataset.id);
                });
            });
        }
    }

    renderSequence(highlightIndex = -1) {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        
        let flows = p?.vna_flows || [];
        if (flows.length === 0 && p?.transactions && p.transactions.length > 0) {
            flows = p.transactions;
        }

        this.dom.seqList.innerHTML = '';
        
        if(flows.length === 0) {
            this.dom.seqList.innerHTML = `<div style="text-align:center; padding: 3rem; color:#666; border: 1px dashed var(--glass-border); border-radius:16px; background:rgba(0,0,0,0.3);">No hay tuberías de valor trazadas. Usa el Modo Arquitecto para dibujar flujos permanentes.</div>`;
            return;
        }

        const isPO = p.ownerId === store.getState().session.activeUserId || store.getState().session.role === 'ecosystem-owner';

        flows.forEach((flow, i) => {
            const rFrom = p.roles.find(r => r.id === flow.from) || { levelId: '?', name: 'Nodo Borrado' };
            const rTo = p.roles.find(r => r.id === flow.to) || { levelId: '?', name: 'Nodo Borrado' };
            const color = flow.tipo === 'tangible' ? 'var(--accent-green)' : 'var(--accent-purple)';
            const delivName = flow.template || flow.entregable;
            const hours = flow.estimatedHours || flow.horas || 1;

            const stepEl = document.createElement('div');
            stepEl.className = 'flow-step';
            if (i === highlightIndex) stepEl.classList.add('flash-highlight');
            stepEl.style.borderLeft = `4px solid ${color}`;
            
            const actions = `
                <div class="step-actions">
                    ${i > 0 ? `<button class="btn-step btn-move-up" data-idx="${i}" title="Subir Orden">↑</button>` : ''}
                    ${i < flows.length - 1 ? `<button class="btn-step btn-move-down" data-idx="${i}" title="Bajar Orden">↓</button>` : ''}
                    <button class="btn-step edit btn-edit" data-idx="${i}" title="Editar Flujo">✎</button>
                    <button class="btn-step del btn-del" data-idx="${i}" title="Eliminar Flujo">🗑️</button>
                </div>
            `;

            stepEl.innerHTML = `
                <div class="step-info">
                    <div class="step-meta" style="color: ${color};"><span style="background:#111; padding:2px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.1);">Paso ${i + 1}</span> ⏱ ${hours}h Est.</div>
                    <div class="step-route-compact">
                        <span class="route-level">${rFrom.levelId}</span> <span class="route-name">${rFrom.name}</span>
                        <span class="route-arrow">&rarr;</span>
                        <span class="route-level">${rTo.levelId}</span> <span class="route-name">${rTo.name}</span>
                    </div>
                    <div class="step-deliv-name" style="color: white;">${delivName}</div>
                </div>
                ${isPO ? actions : ''}
            `;
            this.dom.seqList.appendChild(stepEl);
        });
    }

    drawEdges() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        
        if(this.dom.pathsVis) this.dom.pathsVis.innerHTML = '';
        if(this.dom.pathsEdit) this.dom.pathsEdit.innerHTML = '';
        
        this.dom.canvasVis.querySelectorAll('.tx-badge').forEach(b => b.remove()); 
        if(this.dom.canvasEdit) this.dom.canvasEdit.querySelectorAll('.tx-badge').forEach(b => b.remove()); 
        
        let flows = p?.vna_flows || [];
        if (flows.length === 0 && p?.transactions && p.transactions.length > 0) flows = p.transactions;

        if (flows.length === 0) return;

        let maxHours = 1;
        if (this.isHeatmapActive) {
            flows.forEach(tx => {
                const h = tx.total_hours_processed || 0;
                if (h > maxHours) maxHours = h;
            });
        }

        const pairCounts = {};
        flows.forEach((tx, i) => {
            const key = tx.from < tx.to ? `${tx.from}-${tx.to}` : `${tx.to}-${tx.from}`;
            if (!pairCounts[key]) pairCounts[key] = [];
            pairCounts[key].push({ tx, index: i });
        });

        Object.keys(pairCounts).forEach(key => {
            const edges = pairCounts[key];
            edges.forEach((edgeData, multiIdx) => {
                const { tx, index } = edgeData;
                if (this.dom.canvasVis.offsetWidth > 0 && this.dom.pathsVis) {
                    this.drawSingleEdgeForCanvas(this.dom.canvasVis, this.dom.pathsVis, tx, index, edges, multiIdx, false, maxHours);
                }
                if (this.dom.canvasEdit && this.dom.canvasEdit.offsetWidth > 0 && this.dom.pathsEdit) {
                    this.drawSingleEdgeForCanvas(this.dom.canvasEdit, this.dom.pathsEdit, tx, index, edges, multiIdx, true, 1);
                }
            });
        });
    }

    drawSingleEdgeForCanvas(canvas, pathsGroup, tx, index, edgesGroup, multiIdx, isEditCanvas, maxHours) {
        const dom1 = canvas.querySelector(`.node-wrapper[data-id="${tx.from}"]`);
        const dom2 = canvas.querySelector(`.node-wrapper[data-id="${tx.to}"]`);
        if (!dom1 || !dom2 || tx.from === tx.to) return;

        const x1_center = dom1.offsetLeft;
        const y1_center = dom1.offsetTop;
        const x2_center = dom2.offsetLeft;
        const y2_center = dom2.offsetTop;

        const dx = x2_center - x1_center;
        const dy = y2_center - y1_center;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        const trim = 50; 
        let x1 = x1_center, y1 = y1_center, x2 = x2_center, y2 = y2_center;

        if (dist > trim) {
            x1 = x1_center + (dx/dist) * trim;
            y1 = y1_center + (dy/dist) * trim;
            x2 = x2_center - (dx/dist) * trim;
            y2 = y2_center - (dy/dist) * trim;
        }

        const nx = -dy / dist; 
        const ny = dx / dist;
        let offset = 0;
        
        if (edgesGroup.length > 1) {
            const step = 60; 
            if (multiIdx % 2 !== 0) {
                offset = Math.ceil(multiIdx / 2) * step;
            } else {
                offset = -(Math.ceil(multiIdx / 2) * step);
            }
            if (tx.from > tx.to) offset = -offset;
        }

        const cx = (x1_center + x2_center) / 2 + nx * offset;
        const cy = (y1_center + y2_center) / 2 + ny * offset;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
        
        const suffix = isEditCanvas ? 'edit' : 'vis';
        let markerId = tx.tipo === 'tangible' ? `arrow-tangible-${suffix}` : `arrow-intangible-${suffix}`;
        
        const lineClass = tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible';
        path.setAttribute('class', `edge-line ${lineClass}`);
        
        const strokeHex = tx.tipo === 'tangible' ? '#00e676' : '#e040fb';
        path.style.stroke = strokeHex;
        
        // Heatmap V8
        if (this.isHeatmapActive && !isEditCanvas) {
            const hProcessed = tx.total_hours_processed || 0;
            const normalizedWidth = 3 + (hProcessed / maxHours) * 15;
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

        const txX = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
        const txY = 0.25 * y1 + 0.5 * cy + 0.25 * y2;

        const badge = document.createElement('div');
        badge.className = 'tx-badge';
        if (dom1.classList.contains('ghost-node') || dom2.classList.contains('ghost-node')) badge.classList.add('ghost');
        
        badge.style.left = `${txX}px`;
        badge.style.top = `${txY}px`;
        badge.style.backgroundColor = strokeHex;
        
        if (this.isHeatmapActive && !isEditCanvas) {
            const h = tx.total_hours_processed || 0;
            badge.innerText = `${h}h`;
            badge.style.borderRadius = '50%';
            badge.style.width = '30px';
            badge.style.height = '30px';
            badge.style.display = 'flex';
            badge.style.justifyContent = 'center';
            badge.style.alignItems = 'center';
            badge.style.opacity = h > 0 ? 1 : 0.3;
        } else {
            badge.innerText = `[${index + 1}]`;
        }
        
        badge.setAttribute('data-idx', index);
        
        if(isEditCanvas) {
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
