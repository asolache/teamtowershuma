// v5/js/views/ValueMapView.js
import { store } from '../core/store.js';

export default class ValueMapView {
    constructor() {
        document.title = "Value Network Analysis | TeamTowers";
        this.activeProjectId = null;
        this.selectedRoleId = null;
        this.isDragging = false;
        this.draggedElement = null;
    }

    async getHtml() {
        return `
            <style>
                .vna-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: #0a0a0c; font-family: sans-serif; }
                .map-container { flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; }
                .map-canvas { 
                    flex: 1; position: relative; width: 100%; height: 100%; 
                    background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0);
                    background-size: 40px 40px;
                }
                #edges-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
                .edge-line { fill: none; stroke-width: 2.5; opacity: 0.7; }
                .edge-tangible { stroke: #00e676; }
                .edge-intangible { stroke: #e040fb; stroke-dasharray: 8, 8; }
                
                .node {
                    position: absolute; z-index: 5; border-radius: 50%;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    text-align: center; cursor: grab; transition: transform 0.2s, box-shadow 0.3s;
                    background: rgba(15, 15, 25, 0.9); backdrop-filter: blur(12px); border: 2px solid rgba(255,255,255,0.1);
                    color: white; font-weight: bold; transform: translate(-50%, -50%); user-select: none;
                }
                .node.selected { border-color: #00b0ff !important; box-shadow: 0 0 30px rgba(0, 176, 255, 0.4); }
                .node-name { font-size: 0.7rem; margin-top: 4px; pointer-events: none; text-transform: uppercase; width: 85%; }
                .node-value { font-size: 0.65rem; color: #00e676; pointer-events: none; font-family: monospace; margin-top: 2px; }

                .diagnosis-panel {
                    position: absolute; bottom: 25px; left: 25px; z-index: 10; width: 300px;
                    background: rgba(10, 10, 15, 0.9); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px; padding: 1.2rem;
                }
                .alert-item { font-size: 0.75rem; margin-top: 8px; padding: 8px; border-radius: 6px; border-left: 3px solid; background: rgba(255,255,255,0.03); }

                .inspector-panel {
                    width: 350px; background: #0f0f14; border-left: 1px solid rgba(255,255,255,0.1);
                    display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.4s ease;
                    z-index: 1000;
                }
                .inspector-panel.open { transform: translateX(0); }
                .form-control { width: 100%; background: #000; border: 1px solid #333; color: white; padding: 10px; border-radius: 6px; margin-top: 5px; }

                /* CAJA DE ERROR ANTI-CRASHES */
                .error-box {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: rgba(255,0,0,0.1); border: 2px solid #ff5252; padding: 2rem; border-radius: 12px;
                    color: white; text-align: center; z-index: 9999; backdrop-filter: blur(10px);
                    max-width: 600px; width: 90%;
                }
            </style>

            <div class="vna-layout">
                <div class="map-container">
                    <header style="position: absolute; top: 0; left: 0; width: 100%; padding: 1.5rem 2rem; z-index: 100; display: flex; justify-content: space-between; pointer-events: none;">
                        <a href="/v5/project" class="btn btn-outline" data-link style="pointer-events: auto;">&larr; Volver al Kanban</a>
                        <button class="btn btn-primary" id="btnSimulateTx" style="pointer-events: auto;">✨ Simular Transacción</button>
                    </header>

                    <div style="margin-top: 80px; padding: 0 2rem;">
                        <h1 id="mapTitle" style="margin:0;">Cargando Red...</h1>
                        <p id="mapArchetype" style="color: #888; font-size: 0.8rem; text-transform: uppercase;">--</p>
                    </div>

                    <div class="map-canvas" id="mapCanvas">
                        <svg id="edges-svg"></svg>
                    </div>

                    <div class="diagnosis-panel">
                        <p style="font-size: 0.7rem; color: #00b0ff; font-weight: bold; margin-bottom: 10px;">DIAGNÓSTICO KERNEL v6.1</p>
                        <div id="maturityScore" style="font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">--%</div>
                        <div id="alertsContainer"></div>
                    </div>
                </div>

                <aside class="inspector-panel" id="inspectorPanel">
                    <div style="padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between;">
                        <h2 id="insName">Nodo</h2>
                        <button id="btnCloseInspector" style="background:none; border:none; color:#555; cursor:pointer; font-size: 1.5rem;">&times;</button>
                    </div>
                    <div id="inspectorBody" style="padding: 1.5rem; display: none;">
                        <span class="badge" id="insLevel" style="margin-bottom: 1.5rem;">@rol</span>
                        <div style="background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <label style="font-size: 0.7rem; color: #888;">EQUITY ACUMULADO</label>
                            <div id="insEquity" style="font-size: 1.8rem; color: #00e676; font-weight: bold;">0</div>
                        </div>
                        <label style="font-size: 0.7rem;">VALOR HORA (€/h)</label>
                        <input type="number" id="inputFmv" class="form-control" style="margin-bottom: 1rem;">
                        <label style="font-size: 0.7rem;">MULTIPLICADOR</label>
                        <input type="number" step="0.1" id="inputMult" class="form-control">
                        <button class="btn btn-primary" id="btnSaveRole" style="width: 100%; margin-top: 1.5rem;">Actualizar Nodo</button>
                    </div>
                </aside>
            </div>
        `;
    }

    executeViewScript() {
        try {
            console.log("📍 Iniciando Engine de Renderizado VNA...");
            
            // 1. OBTENER ESTADO SEGURO
            let state = store.getState();
            let project = state.projects[state.projects.length - 1];

            // 2. FALLBACK SI NO HAY PROYECTO O ESTÁ CORRUPTO
            if (!project || !project.roles || project.roles.length === 0) {
                console.warn("⚠️ Proyecto corrupto o vacío detectado. Inyectando Demo Base...");
                store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'ecosystem-admin' } });
                store.dispatch({
                    type: 'ADD_PROJECT',
                    payload: { id: 'demo-vna', nombre: 'Red Demo Recuperada', sector: 'software', archetype: 'startup' }
                });
                state = store.getState();
                project = state.projects[state.projects.length - 1];
            }

            this.activeProjectId = project.id;

            // 3. CAPTURAR DOM
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

            // 4. INICIAR PINTURA
            this.renderMap();
            this.updateDiagnosis();

            // 5. LISTENERS
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

            // 6. DRAG & DROP
            this.dom.canvas.addEventListener('mousedown', (e) => {
                const node = e.target.closest('.node');
                if (node) {
                    this.isDragging = true;
                    this.draggedElement = node;
                }
            });

            window.addEventListener('mousemove', (e) => {
                if (!this.isDragging || !this.draggedElement) return;
                const rect = this.dom.canvas.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                this.draggedElement.style.left = `${x}%`;
                this.draggedElement.style.top = `${y}%`;
                this.drawEdges();
            });

            window.addEventListener('mouseup', () => { this.isDragging = false; this.draggedElement = null; });
            window.addEventListener('resize', () => this.drawEdges());

        } catch (error) {
            // SI ALGO ESTALLA, SE PINTA EN LA PANTALLA EN LUGAR DE QUEDARSE EN BLANCO
            console.error("CRITICAL CRASH:", error);
            const canvas = document.getElementById('mapCanvas');
            if(canvas) {
                canvas.innerHTML = `
                    <div class="error-box">
                        <h2 style="color: #ff5252; margin-top:0;">💥 ERROR DEL KERNEL 💥</h2>
                        <p style="margin-bottom: 20px;">El motor de renderizado ha fallado al intentar procesar los datos.</p>
                        <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px; font-family: monospace; font-size: 0.8rem; text-align: left; color: #ff8a80; overflow-x: auto;">
                            ${error.message}<br><br>${error.stack}
                        </div>
                        <button id="btnHardReset" style="margin-top: 20px; padding: 10px 20px; background: #ff5252; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                            BORRAR MEMORIA CORRUPTA Y REINICIAR
                        </button>
                    </div>
                `;
                document.getElementById('btnHardReset').addEventListener('click', () => {
                    localStorage.removeItem('tt_sos_state'); // Borramos datos corruptos
                    window.location.href = '/v5/'; // Volvems a la home
                });
            }
        }
    }

    renderMap() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        if (!p) return;

        this.dom.title.innerText = p.nombre || 'Proyecto Sin Nombre';
        this.dom.arch.innerText = `Arquetipo: ${p.archetype || 'Desconocido'}`;

        const harvest = store.calculateHarvest(this.activeProjectId) || [];
        
        const positions = {};
        this.dom.canvas.querySelectorAll('.node').forEach(n => {
            positions[n.dataset.id] = { left: n.style.left, top: n.style.top };
            n.remove();
        });

        const layout = {
            '@anxaneta': { x: 50, y: 15 }, '@aixecador': { x: 50, y: 35 },
            '@dosos': { x: 35, y: 55 }, '@baixos': { x: 65, y: 55 }, '@pinya': { x: 50, y: 80 }
        };

        const rolesSeguros = p.roles || []; // Fallback por si acaso
        const levelCounts = {};

        rolesSeguros.forEach(rol => {
            const level = rol.levelId || '@baixos';
            levelCounts[level] = (levelCounts[level] || 0) + 1;
            const h = harvest.find(x => x.roleId === rol.id);
            const val = h ? h.totalValue : 0;
            const size = 80 + Math.min(val / 10, 60);

            const el = document.createElement('div');
            el.className = `node ${this.selectedRoleId === rol.id ? 'selected' : ''}`;
            el.dataset.id = rol.id;
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            
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
                <div style="font-size:1.2rem;">${this.getIcon(level)}</div>
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

        setTimeout(() => this.drawEdges(), 50);
    }

    drawEdges() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        this.dom.svg.innerHTML = '';
        const txs = p?.transactions || [];
        if (txs.length === 0) return;

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

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1); line.setAttribute('y1', y1);
                line.setAttribute('x2', x2); line.setAttribute('y2', y2);
                line.classList.add('edge-line', tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible');
                this.dom.svg.appendChild(line);
            }
        });
    }

    simulateFlow() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const roles = p?.roles || [];
        if(roles.length < 2) return;
        
        const r1 = roles[Math.floor(Math.random() * roles.length)];
        const r2 = roles.filter(r => r.id !== r1.id)[Math.floor(Math.random() * (roles.length - 1))];
        const esTangible = Math.random() > 0.4;
        const desc = esTangible ? ['Diseño UI', 'Código API', 'Contrato'] : ['Feedback', 'Mentoría', 'Estrategia'];
        const hash = '0x' + Math.random().toString(16).slice(2, 10);

        store.dispatch({ 
            type: 'ADD_TRANSACTION', 
            payload: { projectId: this.activeProjectId, tx: { hash, from: r1.id, to: r2.id, horas: 5, entregable: desc[Math.floor(Math.random()*desc.length)], tipo: esTangible ? 'tangible' : 'intangible', status: 'approved' } } 
        });
        store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: this.activeProjectId, txHash: hash } });
        this.renderMap();
        this.updateDiagnosis();
    }

    openInspector(rol, val, mon, col) {
        this.dom.inspector.classList.add('open');
        this.dom.insBody.style.display = 'block';
        document.getElementById('insName').innerText = rol.name || 'Nodo';
        document.getElementById('insLevel').innerText = rol.levelId || '@baixos';
        document.getElementById('insLevel').style.color = col;
        document.getElementById('insLevel').style.borderColor = col;
        document.getElementById('insEquity').innerText = `${val} ${mon}`;
        document.getElementById('inputFmv').value = rol.fmv || 0;
        document.getElementById('inputMult').value = rol.multiplier || 1.0;
    }

    updateDiagnosis() {
        const m = store.calculateMaturityIndex(this.activeProjectId);
        this.dom.score.innerText = `${m.score}%`;
        this.dom.alerts.innerHTML = m.alerts.length === 0 ? `<div class="alert-item alert-ok">Flujo Óptimo.</div>` : m.alerts.map(a => `<div class="alert-item alert-warning">⚠️ ${a}</div>`).join('');
    }

    getIcon(l) { return { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' }[l] || '💠'; }
    getColor(l) { return { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' }[l] || '#fff'; }
}
