// v5/js/views/ValueMapView.js
import { store } from '../core/store.js';

export default class ValueMapView {
    constructor() {
        document.title = "Value Network Analysis (VNA) | TeamTowers";
        this.activeProjectId = null;
        this.selectedRoleId = null;
        this.isDragging = false;
        this.draggedElement = null;
    }

    async getHtml() {
        return `
            <style>
                .vna-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                .map-container { flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; }
                
                /* Fondo estilo Blueprint / Cuadrícula */
                .map-canvas { 
                    flex: 1; position: relative; width: 100%; height: 100%; 
                    background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.04) 1px, transparent 0);
                    background-size: 40px 40px;
                }
                
                #edges-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
                
                /* Estilos VNA para las flechas */
                .edge-line { fill: none; stroke-width: 2.5; opacity: 0.85; transition: stroke-width 0.3s; }
                .edge-tangible { stroke: #00e676; } /* Verde para entregables duros */
                .edge-intangible { stroke: #e040fb; stroke-dasharray: 6, 6; animation: dashAnim 15s linear infinite; } /* Morado punteado para intangibles */
                @keyframes dashAnim { to { stroke-dashoffset: -500; } }

                /* NODOS (Roles) */
                .node {
                    position: absolute; z-index: 5; border-radius: 50%;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    text-align: center; cursor: grab; transition: transform 0.2s, box-shadow 0.3s;
                    background: rgba(15, 15, 20, 0.95); backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.1);
                    color: white; font-weight: bold; transform: translate(-50%, -50%); user-select: none;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                }
                .node:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.05); }
                .node.selected { border-color: #00b0ff !important; box-shadow: 0 0 35px rgba(0, 176, 255, 0.5); z-index: 10; }
                .node-name { font-size: 0.7rem; margin-top: 5px; pointer-events: none; text-transform: uppercase; letter-spacing: 0.5px; width: 85%; line-height: 1.1; }
                .node-value { font-size: 0.7rem; color: #00e676; pointer-events: none; font-family: monospace; margin-top: 3px; font-weight: 800; }

                /* PANELES EDUCATIVOS Y DE CONSULTORÍA */
                .ui-overlay { position: absolute; top: 0; left: 0; width: 100%; padding: 1.5rem 2rem; z-index: 100; pointer-events: none; display: flex; justify-content: space-between; align-items: flex-start; }
                .interactive { pointer-events: auto; }

                .vna-legend {
                    background: rgba(10, 10, 15, 0.9); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px; padding: 1rem; margin-top: 15px; pointer-events: auto;
                    backdrop-filter: blur(10px);
                }

                .diagnosis-panel {
                    position: absolute; bottom: 25px; left: 25px; z-index: 10; width: 340px;
                    background: rgba(10, 10, 15, 0.95); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px);
                    border-radius: 16px; padding: 1.5rem; box-shadow: 0 15px 50px rgba(0,0,0,0.8);
                }
                .alert-item { font-size: 0.75rem; margin-top: 8px; padding: 10px; border-radius: 6px; border-left: 3px solid; background: rgba(255,255,255,0.03); }

                /* INSPECTOR LATERAL */
                .inspector-panel {
                    width: 380px; background: #0c0c10; border-left: 1px solid rgba(255,255,255,0.1);
                    display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    z-index: 1000; box-shadow: -10px 0 30px rgba(0,0,0,0.7);
                }
                .inspector-panel.open { transform: translateX(0); }
                .form-control { width: 100%; background: #000; border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; margin-top: 5px; font-family: monospace; font-size: 1.1rem; }
                .form-control:focus { border-color: #00b0ff; outline: none; }

                .error-box {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: rgba(255,0,0,0.1); border: 2px solid #ff5252; padding: 2rem; border-radius: 12px;
                    color: white; text-align: center; z-index: 9999; backdrop-filter: blur(10px); max-width: 600px; width: 90%;
                }
            </style>

            <div class="vna-layout">
                <div class="map-container">
                    <div class="ui-overlay">
                        <div class="interactive">
                            <a href="/v5/project" class="btn btn-outline" data-link style="background: rgba(0,0,0,0.7);">&larr; Volver al Kanban</a>
                            <div style="margin-top: 25px;">
                                <h1 id="mapTitle" style="font-size: 2.2rem; margin: 0; letter-spacing: -1px; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">Cargando Red...</h1>
                                <p style="color: #aaa; font-size: 0.85rem; margin-top: 5px;">MODELO ECONÓMICO: <span id="mapArchetype" class="badge" style="background: rgba(0, 176, 255, 0.2); color: #00b0ff; border: 1px solid #00b0ff;">--</span></p>
                            </div>
                        </div>
                        
                        <div class="interactive" style="display: flex; flex-direction: column; align-items: flex-end;">
                            <button class="btn btn-primary" id="btnSimulateTx" style="box-shadow: 0 0 25px rgba(0, 176, 255, 0.4); font-size: 1rem; padding: 12px 24px;">✨ Simular Tracción</button>
                            
                            <div class="vna-legend">
                                <h4 style="margin: 0 0 10px 0; font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 1px;">Metodología VNA</h4>
                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 0.8rem; color: #ddd;">
                                    <div style="width: 25px; height: 3px; background: #00e676;"></div>
                                    <span>Valor Tangible (Código, Capital)</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 10px; font-size: 0.8rem; color: #ddd;">
                                    <div style="width: 25px; height: 3px; border-bottom: 3px dashed #e040fb;"></div>
                                    <span>Valor Intangible (Cultura, Mentoría)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="map-canvas" id="mapCanvas">
                        <svg id="edges-svg"></svg>
                    </div>

                    <div class="diagnosis-panel interactive">
                        <h3 style="font-size: 0.85rem; color: #00b0ff; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <span>🧠</span> Motor de Diagnóstico IA
                        </h3>
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px;">
                            <span style="font-size: 0.8rem; color: #888;">Salud de la Red (Maturity)</span>
                            <span id="maturityScore" style="font-size: 1.4rem; font-weight: bold; font-family: monospace;">--%</span>
                        </div>
                        <div id="alertsContainer"></div>
                    </div>
                </div>

                <aside class="inspector-panel interactive" id="inspectorPanel">
                    <div style="padding: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                        <h2 id="insName" style="font-size: 1.5rem; margin:0;">Configurar Nodo</h2>
                        <button id="btnCloseInspector" style="background:none; border:none; color:#666; cursor:pointer; font-size: 2rem; transition: color 0.2s;">&times;</button>
                    </div>
                    <div id="inspectorBody" style="padding: 2rem; display: none;">
                        <span class="badge" id="insLevel" style="margin-bottom: 2rem; font-size: 0.8rem; padding: 6px 12px;">@rol</span>
                        
                        <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid rgba(255,255,255,0.05);">
                            <label style="font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 1px;">Slices Generados (Equity)</label>
                            <div id="insEquity" style="font-size: 2.8rem; color: #00e676; font-weight: 800; font-family: monospace; margin-top: 5px;">0</div>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <label style="font-size: 0.75rem; color: #aaa; text-transform: uppercase;">Valor Hora Mercado (FMV)</label>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <input type="number" id="inputFmv" class="form-control">
                                <span style="color: #666; font-family: monospace; font-size: 1.2rem;">€/h</span>
                            </div>
                        </div>

                        <div style="margin-bottom: 2rem;">
                            <label style="font-size: 0.75rem; color: #aaa; text-transform: uppercase;">Factor Riesgo (Slicing Pie)</label>
                            <input type="number" step="0.1" id="inputMult" class="form-control">
                        </div>

                        <button class="btn btn-primary" id="btnSaveRole" style="width: 100%; padding: 1.2rem; font-size: 1.1rem; box-shadow: 0 5px 15px rgba(0, 176, 255, 0.2);">✓ Actualizar Matemáticas</button>
                    </div>
                </aside>
            </div>
        `;
    }

    executeViewScript() {
        try {
            console.log("📍 Engine VNA (Value Network Analysis) iniciado con éxito.");
            
            // 1. OBTENER ESTADO Y BLINDAJE
            let state = store.getState();
            let project = state.projects[state.projects.length - 1];

            // Si el proyecto no existe o está corrupto, inyectamos uno completo
            if (!project || !project.roles || project.roles.length === 0) {
                console.warn("⚠️ Inyectando Red de Demostración Segura para VNA...");
                store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'ecosystem-admin' } });
                store.dispatch({
                    type: 'ADD_PROJECT',
                    payload: { id: 'demo-vna', nombre: 'Organización Fractal', sector: 'software', archetype: 'startup' }
                });
                state = store.getState();
                project = state.projects[state.projects.length - 1];
            }

            this.activeProjectId = project.id;

            // 2. MAPEO DEL DOM
            this.dom = {
                title: document.getElementById('mapTitle'),
                arch: document.getElementById('mapArchetype'),
                canvas: document.getElementById('mapCanvas'),
                svg: document.getElementById('edges-svg'),
                inspector: document.getElementById('inspectorPanel'),
                insBody: document.getElementById('inspectorBody'),
                score: document.getElementById('maturityScore'),
                alerts: document.getElementById('alertsContainer')
            };

            // 3. RENDERIZADO INICIAL
            this.renderMap();
            this.updateDiagnosis();

            // 4. EVENT LISTENERS
            document.getElementById('btnCloseInspector')?.addEventListener('click', () => {
                this.dom.inspector.classList.remove('open');
                this.selectedRoleId = null;
                this.renderMap();
            });

            document.getElementById('btnSaveRole')?.addEventListener('click', () => {
                const newFmv = parseFloat(document.getElementById('inputFmv').value);
                const newMult = parseFloat(document.getElementById('inputMult').value);
                store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId, field: 'fmv', value: newFmv } });
                store.dispatch({ type: 'UPDATE_ROLE', payload: { projectId: this.activeProjectId, roleId: this.selectedRoleId, field: 'multiplier', value: newMult } });
                this.renderMap();
            });

            document.getElementById('btnSimulateTx')?.addEventListener('click', () => this.simulateFlow());

            // 5. MOTOR DE DRAG & DROP PARA CONSULTORÍA
            this.dom.canvas.addEventListener('mousedown', (e) => {
                const node = e.target.closest('.node');
                if (node) {
                    this.isDragging = true;
                    this.draggedElement = node;
                    node.style.zIndex = 1000;
                }
            });

            window.addEventListener('mousemove', (e) => {
                if (!this.isDragging || !this.draggedElement) return;
                const rect = this.dom.canvas.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                this.draggedElement.style.left = `${x}%`;
                this.draggedElement.style.top = `${y}%`;
                this.drawEdges(); // Recalcula las flechas en vivo al mover
            });

            window.addEventListener('mouseup', () => { 
                if (this.draggedElement) this.draggedElement.style.zIndex = 5;
                this.isDragging = false; 
                this.draggedElement = null; 
            });
            window.addEventListener('resize', () => this.drawEdges());

        } catch (error) {
            // TRAMPA ANTI-CRASHES
            console.error("💥 CRITICAL CRASH EN VNA:", error);
            const canvas = document.getElementById('mapCanvas');
            if(canvas) {
                canvas.innerHTML = `
                    <div class="error-box">
                        <h2 style="color: #ff5252; margin-top:0;">💥 ERROR DEL KERNEL 💥</h2>
                        <p style="margin-bottom: 20px;">El motor de VNA ha detectado datos corruptos en la caché local.</p>
                        <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; font-family: monospace; font-size: 0.8rem; text-align: left; color: #ff8a80; overflow-x: auto;">
                            ${error.message}
                        </div>
                        <button id="btnHardReset" style="margin-top: 20px; padding: 12px 24px; background: #ff5252; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                            BORRAR CACHÉ Y REINICIAR SISTEMA
                        </button>
                    </div>
                `;
                document.getElementById('btnHardReset').addEventListener('click', () => {
                    localStorage.removeItem('tt_sos_state'); 
                    window.location.href = '/v5/'; 
                });
            }
        }
    }

    renderMap() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if (!p) return;

        this.dom.title.innerText = p.nombre || 'Ecosistema';
        this.dom.arch.innerText = p.archetype ? p.archetype.toUpperCase() : 'DESCONOCIDO';

        const harvest = store.calculateHarvest(this.activeProjectId) || [];
        
        // Memoria espacial: Guardamos dónde están los nodos para no resetearlos al simular
        const positions = {};
        this.dom.canvas.querySelectorAll('.node').forEach(n => {
            positions[n.dataset.id] = { left: n.style.left, top: n.style.top };
            n.remove();
        });

        const layout = {
            '@anxaneta': { x: 50, y: 15 }, '@aixecador': { x: 50, y: 35 },
            '@dosos': { x: 35, y: 55 }, '@baixos': { x: 65, y: 55 }, '@pinya': { x: 50, y: 80 }
        };

        const rolesSeguros = p.roles || []; 
        const levelCounts = {};

        rolesSeguros.forEach(rol => {
            const level = rol.levelId || '@baixos';
            levelCounts[level] = (levelCounts[level] || 0) + 1;
            
            const h = harvest.find(x => x.roleId === rol.id);
            const val = h ? h.totalValue : 0;
            const size = 85 + Math.min(val / 10, 70); // El nodo crece con el Equity

            const el = document.createElement('div');
            el.className = `node ${this.selectedRoleId === rol.id ? 'selected' : ''}`;
            el.dataset.id = rol.id;
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            
            // Asignar posición (Memoria o Default)
            if (positions[rol.id]) {
                el.style.left = positions[rol.id].left;
                el.style.top = positions[rol.id].top;
            } else {
                const pos = { ...(layout[level] || { x: 50, y: 50 }) };
                if (levelCounts[level] > 1) pos.x += (levelCounts[level] - 1) * 20 - 10;
                el.style.left = `${pos.x}%`;
                el.style.top = `${pos.y}%`;
            }

            el.style.borderColor = this.getColor(level);
            el.innerHTML = `
                <div style="font-size:1.4rem;">${this.getIcon(level)}</div>
                <div class="node-name">${rol.name || 'Nodo'}</div>
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

        // Darle un respiro al navegador antes de dibujar las flechas
        setTimeout(() => this.drawEdges(), 50);
    }

    drawEdges() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        this.dom.svg.innerHTML = '';
        const txs = p?.transactions || [];
        if (txs.length === 0) return;

        // Definimos la punta de la flecha
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="context-stroke"/>
            </marker>
        `;
        this.dom.svg.appendChild(defs);

        txs.forEach(tx => {
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

                // Línea de la flecha
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1); line.setAttribute('y1', y1);
                line.setAttribute('x2', x2); line.setAttribute('y2', y2);
                line.setAttribute('marker-end', 'url(#arrow)');
                line.classList.add('edge-line', tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible');
                this.dom.svg.appendChild(line);

                // Etiqueta del Entregable
                const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                txt.setAttribute('x', (x1+x2)/2); txt.setAttribute('y', (y1+y2)/2 - 12);
                txt.setAttribute('text-anchor', 'middle');
                txt.style.cssText = `fill:${tx.tipo==='tangible'?'#00e676':'#e040fb'};font-size:10px;font-weight:bold;font-family:monospace;paint-order:stroke;stroke:#111;stroke-width:5px;text-transform:uppercase;`;
                txt.textContent = tx.entregable;
                this.dom.svg.appendChild(txt);
            }
        });
    }

    simulateFlow() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const roles = p?.roles || [];
        if(roles.length < 2) {
            alert("Necesitas al menos 2 roles en la red para simular flujos de valor.");
            return;
        }
        
        const r1 = roles[Math.floor(Math.random() * roles.length)];
        const r2 = roles.filter(r => r.id !== r1.id)[Math.floor(Math.random() * (roles.length - 1))];
        const esTangible = Math.random() > 0.4;
        
        // Entregables educativos para demostrar la dualidad de valor
        const descT = ['Código API', 'Diseño UX', 'Modelo Financiero', 'Contrato Legal', 'Pitch Deck'];
        const descI = ['Mentoría Técnica', 'Resolución Conflictos', 'Feedback Estratégico', 'Onboarding', 'Cultura'];
        const desc = esTangible ? descT[Math.floor(Math.random()*descT.length)] : descI[Math.floor(Math.random()*descI.length)];
        
        const hash = '0x' + Math.random().toString(16).slice(2, 10);

        store.dispatch({ 
            type: 'ADD_TRANSACTION', 
            payload: { projectId: this.activeProjectId, tx: { hash, from: r1.id, to: r2.id, horas: Math.floor(Math.random() * 8) + 1, entregable: desc, tipo: esTangible ? 'tangible' : 'intangible', status: 'approved' } } 
        });
        store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: this.activeProjectId, txHash: hash } });
        
        this.renderMap();
        this.updateDiagnosis();
    }

    openInspector(rol, val, mon, col) {
        this.dom.inspector.classList.add('open');
        this.dom.insBody.style.display = 'block';
        document.getElementById('insName').innerText = rol.name || 'Nodo de Red';
        
        const b = document.getElementById('insLevel');
        b.innerText = rol.levelId || '@baixos';
        b.style.color = col;
        b.style.borderColor = col;
        b.style.background = `rgba(255,255,255,0.05)`;
        
        document.getElementById('insEquity').innerText = `${val} ${mon}`;
        document.getElementById('inputFmv').value = rol.fmv || 0;
        document.getElementById('inputMult').value = rol.multiplier || 1.0;
    }

    updateDiagnosis() {
        const m = store.calculateMaturityIndex(this.activeProjectId);
        this.dom.score.innerText = `${m.score}%`;
        this.dom.score.style.color = m.score > 70 ? '#00e676' : (m.score > 40 ? '#ff9100' : '#ff5252');
        this.dom.alerts.innerHTML = m.alerts.length === 0 ? `<div class="alert-item alert-ok">Red Óptima: El Value Network fluye sin fricciones.</div>` : m.alerts.map(a => `<div class="alert-item alert-warning">⚠️ ${a}</div>`).join('');
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }
    getColor(l) { return { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' }[l] || '#fff'; }
}
