// v5/js/views/ValueMapView.js
import { store } from '../core/store.js';

export default class ValueMapView {
    constructor() {
        document.title = "Value Network Analysis | TeamTowers";
        this.activeProjectId = null;
        this.selectedRoleId = null;
    }

    async getHtml() {
        return `
            <style>
                .vna-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; background: var(--bg-base); }
                
                /* LIENZO PRINCIPAL */
                .map-container { flex: 1; position: relative; overflow: hidden; display: flex; flex-direction: column; }
                .map-header { padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; z-index: 10; background: linear-gradient(to bottom, rgba(10,10,12,0.9), transparent); }
                
                .map-canvas { flex: 1; position: relative; width: 100%; height: 100%; }
                
                /* SVG PARA LÍNEAS DE CONEXIÓN */
                #edges-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
                .edge-line { fill: none; stroke-width: 2; opacity: 0.6; animation: dashAnim 20s linear infinite; }
                .edge-tangible { stroke: var(--accent-green); }
                .edge-intangible { stroke: var(--accent-purple); stroke-dasharray: 8, 8; }
                @keyframes dashAnim { to { stroke-dashoffset: -1000; } }

                /* NODOS DEL CASTELL */
                .node {
                    position: absolute; z-index: 2; border-radius: 50%;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    text-align: center; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s;
                    background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 2px solid var(--glass-border);
                    color: white; font-weight: bold; box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                    transform: translate(-50%, -50%); /* Centrar respecto a sus coordenadas x,y */
                }
                .node:hover { transform: translate(-50%, -50%) scale(1.1); z-index: 10; }
                .node.selected { border-color: var(--accent-blue); box-shadow: 0 0 25px rgba(0, 176, 255, 0.4); }
                .node-name { font-size: 0.8rem; margin-top: 5px; pointer-events: none; }
                .node-value { font-size: 0.7rem; color: var(--text-muted); pointer-events: none; font-family: monospace;}

                /* DIAGNÓSTICO EDUCACIONAL */
                .diagnosis-panel {
                    position: absolute; bottom: 20px; left: 20px; z-index: 10; width: 320px;
                    background: rgba(20, 20, 25, 0.85); border: 1px solid var(--glass-border); backdrop-filter: var(--glass-blur);
                    border-radius: 12px; padding: 1.5rem;
                }
                .alert-item { font-size: 0.85rem; margin-top: 10px; padding: 8px; border-radius: 6px; border-left: 3px solid; }
                .alert-warning { background: rgba(255, 145, 0, 0.1); border-color: var(--accent-orange); color: #ffd180; }
                .alert-ok { background: rgba(0, 230, 118, 0.1); border-color: var(--accent-green); color: #b9f6ca; }

                /* PANEL INSPECTOR (DERECHA) */
                .inspector-panel {
                    width: 350px; background: rgba(15, 15, 20, 0.95); border-left: 1px solid var(--glass-border);
                    display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.3s ease;
                    z-index: 20; box-shadow: -5px 0 25px rgba(0,0,0,0.5);
                }
                .inspector-panel.open { transform: translateX(0); }
                .inspector-header { padding: 1.5rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; }
                .inspector-body { padding: 1.5rem; flex: 1; overflow-y: auto; }
                
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 5px; text-transform: uppercase; }
                .form-control { width: 100%; background: #0a0a0c; border: 1px solid var(--glass-border); color: white; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 1.1rem;}
                .form-control:focus { outline: none; border-color: var(--accent-blue); }

                .metric-card { background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid rgba(255,255,255,0.05);}
                .metric-value { font-size: 1.8rem; font-weight: bold; color: var(--accent-green); font-family: monospace; }
            </style>

            <header style="position: absolute; top: 0; left: 0; width: 100%; padding: 1rem 2rem; z-index: 100; pointer-events: none;">
                <a href="/project" class="btn btn-outline" data-link style="font-size: 0.8rem; pointer-events: auto;">&larr; Volver al Kanban</a>
            </header>

            <div class="vna-layout">
                <div class="map-container">
                    <div class="map-header" style="margin-top: 50px;">
                        <div>
                            <h1 id="mapTitle">Cargando Ecosistema...</h1>
                            <p style="color: var(--text-muted); font-size: 0.9rem;">Arquetipo: <span id="mapArchetype" class="badge">--</span></p>
                        </div>
                        <button class="btn btn-primary" id="btnSimulateTx">✨ Simular Transacción</button>
                    </div>

                    <div class="map-canvas" id="mapCanvas">
                        <svg id="edges-svg"></svg>
                        </div>

                    <div class="diagnosis-panel">
                        <h3 style="font-size: 1rem; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                            <span>🧠</span> Motor de Diagnóstico
                        </h3>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 10px;">Maturity Index: <span id="maturityScore" style="color: white; font-weight: bold;">--/100</span></div>
                        <div id="alertsContainer">
                            </div>
                    </div>
                </div>

                <aside class="inspector-panel" id="inspectorPanel">
                    <div class="inspector-header">
                        <h2 id="insName">Selecciona un Nodo</h2>
                        <button id="btnCloseInspector" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 1.2rem;">&times;</button>
                    </div>
                    <div class="inspector-body" id="inspectorBody" style="display: none;">
                        <span class="badge" id="insLevel" style="margin-bottom: 1.5rem;">@rol</span>
                        
                        <div class="metric-card">
                            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Valor Aportado (Equity)</div>
                            <div class="metric-value" id="insEquity">0</div>
                        </div>

                        <div class="form-group">
                            <label>Fair Market Value (FMV - €/h)</label>
                            <input type="number" id="inputFmv" class="form-control">
                        </div>

                        <div class="form-group">
                            <label>Multiplicador de Riesgo</label>
                            <input type="number" step="0.1" id="inputMult" class="form-control">
                        </div>

                        <button class="btn btn-primary" id="btnSaveRole" style="width: 100%; margin-top: 1rem;">Guardar Cambios</button>
                    </div>
                </aside>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        // Cargar el primer proyecto disponible (o crear uno de fallback si no hay)
        let project = state.projects.length > 0 ? state.projects[state.projects.length - 1] : null;

        if (!project) {
            // Fallback de seguridad si el usuario entra directo sin pasar por /create
            store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'ecosystem-admin' } });
            store.dispatch({ type: 'ADD_PROJECT', payload: { id: 'vna-demo', nombre: 'NeoApp VNA Demo', sector: 'startup', archetype: 'startup' } });
            project = store.getState().projects.find(p => p.id === 'vna-demo');
        }

        this.activeProjectId = project.id;
        
        // Elementos del DOM
        this.dom = {
            title: document.getElementById('mapTitle'),
            archetype: document.getElementById('mapArchetype'),
            canvas: document.getElementById('mapCanvas'),
            svg: document.getElementById('edges-svg'),
            inspector: document.getElementById('inspectorPanel'),
            insBody: document.getElementById('inspectorBody'),
            btnClose: document.getElementById('btnCloseInspector'),
            btnSave: document.getElementById('btnSaveRole'),
            maturityScore: document.getElementById('maturityScore'),
            alertsContainer: document.getElementById('alertsContainer'),
            btnSimulateTx: document.getElementById('btnSimulateTx')
        };

        // Renderizado Inicial
        this.updateHeader();
        this.renderMap();
        this.updateDiagnosis();

        // Listeners
        window.addEventListener('resize', () => this.drawEdges());
        
        this.dom.btnClose.addEventListener('click', () => {
            this.dom.inspector.classList.remove('open');
            this.selectedRoleId = null;
            this.renderMap(); // Quita la clase .selected
        });

        this.dom.btnSave.addEventListener('click', () => {
            const newFmv = parseFloat(document.getElementById('inputFmv').value);
            const newMult = parseFloat(document.getElementById('inputMult').value);
            
            store.dispatch({ 
                type: 'UPDATE_ROLE', 
                payload: { 
                    projectId: this.activeProjectId, 
                    roleId: this.selectedRoleId, 
                    updates: { fmv: newFmv, multiplier: newMult } 
                } 
            });
            
            // Forzar recálculo del harvest en las transacciones pasadas sería lo ideal en un entorno real,
            // pero por ahora actualizamos la vista.
            this.renderMap();
            // Efecto visual de guardado
            this.dom.btnSave.innerText = "¡Guardado!";
            setTimeout(() => this.dom.btnSave.innerText = "Guardar Cambios", 1500);
        });

        // Botón mágico para simular actividad (Demostración Consultoría)
        this.dom.btnSimulateTx.addEventListener('click', () => {
            const p = store.getState().projects.find(x => x.id === this.activeProjectId);
            if(p.roles.length < 2) return;
            
            // Escoger dos roles al azar
            const r1 = p.roles[Math.floor(Math.random() * p.roles.length)];
            const r2 = p.roles[Math.floor(Math.random() * p.roles.length)];
            const esTangible = Math.random() > 0.5;
            const horas = Math.floor(Math.random() * 8) + 1;

            const txHash = '0x' + Math.random().toString(16).slice(2, 10);
            
            store.dispatch({ 
                type: 'ADD_TRANSACTION', 
                payload: { 
                    projectId: this.activeProjectId, 
                    tx: { hash: txHash, from: r1.id, to: r2.id, horas: horas, entregable: esTangible ? 'Código / Diseño' : 'Feedback / Mentoría', tipo: esTangible ? 'tangible' : 'intangible', status: 'approved' } 
                } 
            });
            
            // Auto consolidar para que sume Slices
            store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId: this.activeProjectId, txHash: txHash } });
            
            this.renderMap();
            this.updateDiagnosis();
        });
    }

    updateHeader() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        this.dom.title.innerText = p.nombre;
        this.dom.archetype.innerText = p.archetype.toUpperCase();
        
        if(p.archetype === 'startup') this.dom.archetype.style.border = "1px solid var(--accent-gold)";
        if(p.archetype === 'dao') this.dom.archetype.style.border = "1px solid var(--accent-purple)";
        if(p.archetype === 'corporate' || p.archetype === 'corp') this.dom.archetype.style.border = "1px solid var(--accent-blue)";
    }

    renderMap() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        const harvest = store.calculateHarvest(this.activeProjectId);
        
        // Limpiar nodos
        document.querySelectorAll('.node').forEach(n => n.remove());

        // Coordenadas Estructurales de El Castell (Porcentajes del Canvas)
        const layoutMap = {
            '@anxaneta': { x: 50, y: 15 },
            '@aixecador': { x: 50, y: 35 },
            '@dosos': { x: 50, y: 55 },
            '@baixos': { x: 30, y: 75 }, // Desplazados lateralmente para hacer base
            '@pinya': { x: 70, y: 75 }
        };

        // Colores Ontológicos
        const colorMap = {
            '@anxaneta': 'var(--role-anxaneta)', '@aixecador': 'var(--role-aixecador)',
            '@dosos': 'var(--role-dosos)', '@baixos': 'var(--role-baixos)', '@pinya': 'var(--role-pinya)'
        };

        p.roles.forEach((rol, index) => {
            // Valor acumulado para tamaño
            const hData = harvest.find(h => h.roleId === rol.id);
            const totalVal = hData ? hData.totalValue : 0;
            const baseSize = 80;
            const sizeBonus = Math.min(totalVal / 10, 80); // Crece hasta el doble según valor
            const finalSize = baseSize + sizeBonus;

            // Posición (usa el layoutMap, o calcula offsets si hay varios del mismo nivel)
            let pos = layoutMap[rol.levelId] || { x: 50 + (index*5), y: 50 + (index*5) };

            const nodeEl = document.createElement('div');
            nodeEl.className = `node ${this.selectedRoleId === rol.id ? 'selected' : ''}`;
            nodeEl.style.width = `${finalSize}px`;
            nodeEl.style.height = `${finalSize}px`;
            nodeEl.style.left = `${pos.x}%`;
            nodeEl.style.top = `${pos.y}%`;
            nodeEl.style.borderColor = colorMap[rol.levelId] || 'white';
            
            // Efecto fantasma si no hay usuario asignado (simulado comprobando asignaciones)
            const isAssigned = p.asignaciones && p.asignaciones.find(a => a.roleId === rol.id);
            if(!isAssigned) nodeEl.style.opacity = '0.6';

            // Etiqueta de la moneda
            const moneda = p.archetype === 'startup' ? ' Slices' : (p.archetype === 'dao' ? ' Tkns' : ' €');

            nodeEl.innerHTML = `
                <div style="font-size: 1.5rem;">${this.getIconForLevel(rol.levelId)}</div>
                <div class="node-name">${rol.name}</div>
                <div class="node-value">${totalVal}${moneda}</div>
            `;

            // INTERACTIVIDAD (Click para abrir Inspector)
            nodeEl.addEventListener('click', () => {
                this.selectedRoleId = rol.id;
                this.renderMap(); // Refrescar para marcar seleccionado
                this.openInspector(rol, totalVal, moneda, colorMap[rol.levelId]);
            });

            // Guardamos el DOM element en el objeto del rol temporalmente para poder trazar las líneas
            rol._dom = nodeEl;
            this.dom.canvas.appendChild(nodeEl);
        });

        // Dibujar las líneas después de colocar los nodos
        setTimeout(() => this.drawEdges(), 50);
    }

    drawEdges() {
        const p = store.getState().projects.find(x => x.id === this.activeProjectId);
        this.dom.svg.innerHTML = ''; // Limpiar SVG

        if(!p.transactions) return;

        // Agrupamos transacciones entre nodos para no dibujar 50 líneas superpuestas, sino una más gruesa
        p.transactions.forEach(tx => {
            const rFrom = p.roles.find(r => r.id === tx.from);
            const rTo = p.roles.find(r => r.id === tx.to);
            
            if(rFrom && rTo && rFrom._dom && rTo._dom && rFrom.id !== rTo.id) {
                const rectFrom = rFrom._dom.getBoundingClientRect();
                const rectTo = rTo._dom.getBoundingClientRect();
                const canvasRect = this.dom.canvas.getBoundingClientRect();

                // Centros de los nodos relativos al canvas
                const x1 = rectFrom.left + (rectFrom.width/2) - canvasRect.left;
                const y1 = rectFrom.top + (rectFrom.height/2) - canvasRect.top;
                const x2 = rectTo.left + (rectTo.width/2) - canvasRect.left;
                const y2 = rectTo.top + (rectTo.height/2) - canvasRect.top;

                // Crear línea SVG
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                
                // Estilo según tipo (Tangible = Continua Verde, Intangible = Discontinua Morada)
                line.classList.add('edge-line');
                line.classList.add(tx.tipo === 'tangible' ? 'edge-tangible' : 'edge-intangible');

                this.dom.svg.appendChild(line);
            }
        });
    }

    openInspector(rol, totalVal, moneda, color) {
        this.dom.inspector.classList.add('open');
        this.dom.insBody.style.display = 'block';
        
        document.getElementById('insName').innerText = rol.name;
        
        const badge = document.getElementById('insLevel');
        badge.innerText = rol.levelId;
        badge.style.color = color;
        badge.style.borderColor = color;
        badge.style.background = `rgba(255,255,255,0.05)`;

        document.getElementById('insEquity').innerText = `${totalVal} ${moneda}`;
        document.getElementById('inputFmv').value = rol.fmv || 0;
        document.getElementById('inputMult').value = rol.multiplier || 1.0;
    }

    updateDiagnosis() {
        const maturity = store.calculateMaturityIndex(this.activeProjectId);
        this.dom.maturityScore.innerText = `${maturity.score}/100`;
        
        // Color del score
        if(maturity.score > 80) this.dom.maturityScore.style.color = 'var(--accent-green)';
        else if(maturity.score > 50) this.dom.maturityScore.style.color = 'var(--accent-orange)';
        else this.dom.maturityScore.style.color = '#ff5252';

        this.dom.alertsContainer.innerHTML = '';

        if(maturity.alerts.length === 0) {
            this.dom.alertsContainer.innerHTML = `<div class="alert-item alert-ok">Estructura Óptima. La red fluye orgánicamente.</div>`;
        } else {
            maturity.alerts.forEach(alerta => {
                this.dom.alertsContainer.innerHTML += `<div class="alert-item alert-warning">⚠️ ${alerta}</div>`;
            });
        }
    }

    getIconForLevel(levelId) {
        const icons = { '@anxaneta': '👑', '@aixecador': '🧭', '@dosos': '👁️', '@baixos': '⚙️', '@pinya': '🤝' };
        return icons[levelId] || '💠';
    }
}
