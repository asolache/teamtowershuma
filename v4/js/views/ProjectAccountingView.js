import { store } from '../core/store.js';

export const ProjectAccountingView = {
    projectId: null,
    valuationAmount: 100000, // Presupuesto / Valoración por defecto

    init(projectId) {
        this.projectId = projectId;
        this.render();
    },

    render() {
        const state = store.getState();
        const project = state.projects.find(p => p.id === this.projectId);
        
        if (!project) {
            document.getElementById('app').innerHTML = `<div class="container" style="padding: 50px; text-align:center;"><h2>Proyecto no encontrado</h2></div>`;
            return;
        }

        const app = document.getElementById('app');
        
        // 1. TOP BAR CORPORATIVA (Breadcrumb limpio)
        let html = `
            <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border-color); padding: 15px 30px; position: sticky; top: 0; z-index: 100;">
                <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
                    <div style="font-size: 0.95rem; color: var(--text-muted); display: flex; align-items: center; gap: 10px;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none; font-weight: bold;">TeamTowers Hub</a> 
                        <span>/</span> 
                        <a href="#/project/${this.projectId}" style="color: var(--text-main); text-decoration: none;">${project.nombre}</a> 
                        <span>/</span> 
                        <span style="color: var(--text-heading); font-weight: bold;">Contabilidad de Valor</span>
                    </div>
                    <div>
                        <span style="background: rgba(163, 113, 247, 0.1); color: var(--accent-purple); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; border: 1px solid var(--accent-purple);">
                            TOKENOMICS: ${project.config?.tokenomics?.toUpperCase() || 'STARTUP'}
                        </span>
                    </div>
                </div>
            </div>

            <div class="container fade-in" style="max-width: 1200px; margin: 30px auto; padding: 0 20px;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px;">
                    <div>
                        <h1 style="margin: 0 0 5px 0; font-size: 2.2rem; color: var(--text-heading);">Cap Table & Ledger</h1>
                        <p style="margin: 0; color: var(--text-muted);">Monitorización inmutable de Slices y aportaciones de la red.</p>
                    </div>
                    <div style="display: flex; gap: 15px;">
                        <button id="btn-add-node" class="btn" style="background: var(--bg-panel); border: 1px solid var(--border-color); color: var(--text-main);">
                            👤 + Añadir Nodo
                        </button>
                        <button id="btn-add-cash" class="btn" style="background: var(--accent-green); color: #000; border: none; font-weight: bold; box-shadow: 0 4px 15px rgba(35, 134, 54, 0.3);">
                            💰 + Aportación Manual (Cash/Bienes)
                        </button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px;">
                    
                    <div class="panel-surface" style="padding: 25px; border-radius: 12px; border-top: 3px solid var(--accent-blue);">
                        <h3 style="margin-top: 0; display: flex; align-items: center; gap: 10px;">
                            📊 Distribución de Slices (Sudor/Riesgo)
                        </h3>
                        ${this.renderCapTable(project)}
                    </div>

                    <div class="panel-surface" style="padding: 25px; border-radius: 12px; border-top: 3px solid var(--accent-gold); background: linear-gradient(180deg, rgba(210, 153, 34, 0.05), transparent);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                            <h3 style="margin: 0; color: var(--accent-gold);">🌾 Simulador de La Cosecha</h3>
                        </div>
                        
                        <div style="background: var(--bg-base); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px;">
                            <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
                                Valoración / Presupuesto del Ecosistema (€):
                            </label>
                            <input type="number" id="input-valuation" value="${this.valuationAmount}" 
                                   style="width: 100%; background: transparent; border: none; color: var(--text-heading); font-size: 1.8rem; font-weight: bold; outline: none; border-bottom: 2px solid var(--border-color); padding-bottom: 5px;">
                        </div>

                        ${this.renderHarvest(project)}
                    </div>
                </div>

                <div class="panel-surface" style="margin-top: 30px; padding: 25px; border-radius: 12px;">
                    <h3 style="margin-top: 0;">📜 Libro Mayor (Últimas Aportaciones)</h3>
                    ${this.renderLedger(project)}
                </div>
            </div>
            
            ${this.renderModals(project)}
        `;

        app.innerHTML = html;
        this.attachEvents();
    },

    // --- RENDERIZADO DE TABLAS ---

    renderCapTable(project) {
        // Agrupamos slices reales desde el ledger
        const slicesMap = {};
        project.ledger.forEach(entry => {
            slicesMap[entry.userId] = (slicesMap[entry.userId] || 0) + entry.valorCongelado;
        });

        const sortedUsers = Object.entries(slicesMap).sort((a, b) => b[1] - a[1]);

        if (sortedUsers.length === 0) {
            return `<div style="padding: 30px; text-align: center; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: 8px;">
                        No hay Slices consolidados aún. El equipo debe validar entregables o inyectar capital.
                    </div>`;
        }

        let html = `<table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
                        <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                            <th style="padding: 10px 5px;">Nodo (@id)</th>
                            <th style="padding: 10px 5px; text-align: right;">Slices Netos</th>
                        </tr>`;
        
        sortedUsers.forEach(([userId, slices]) => {
            const userName = project.usuarios.find(u => u.id === userId)?.name || userId;
            html += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px 5px; font-family: monospace; color: var(--accent-blue);">${userId} <span style="color:var(--text-muted); font-size:0.8rem;">(${userName})</span></td>
                    <td style="padding: 12px 5px; text-align: right; font-weight: bold;">${slices.toLocaleString()} 🍰</td>
                </tr>`;
        });
        html += `</table>`;
        return html;
    },

    renderHarvest(project) {
        // Usamos la nueva función del Store (Épica de Tokenomics)
        const harvestData = store.calculateHarvest(this.projectId, this.valuationAmount);

        if (harvestData.length === 0) {
            return `<p style="color: var(--text-muted); font-size: 0.9rem;">El simulador requiere Slices consolidados para proyectar el reparto.</p>`;
        }

        let html = `<table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
                        <tr style="border-bottom: 1px solid var(--border-color); color: var(--accent-gold);">
                            <th style="padding: 10px 5px;">Nodo</th>
                            <th style="padding: 10px 5px; text-align: right;">% Equity</th>
                            <th style="padding: 10px 5px; text-align: right;">Valor Proyectado</th>
                        </tr>`;
        
        harvestData.forEach(data => {
            html += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px 5px; font-family: monospace;">${data.userId}</td>
                    <td style="padding: 12px 5px; text-align: right; font-weight: bold; color: var(--text-heading);">${data.percentage}</td>
                    <td style="padding: 12px 5px; text-align: right; color: var(--accent-green); font-family: monospace; font-size: 1.1rem;">${data.financialValue}</td>
                </tr>`;
        });
        html += `</table>`;
        return html;
    },

    renderLedger(project) {
        if (!project.ledger || project.ledger.length === 0) return `<p style="color: var(--text-muted);">El Ledger está vacío.</p>`;
        
        // Mostrar los últimos 10
        const recent = [...project.ledger].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
        
        let html = `<table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem; font-family: monospace;">
                        <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                            <th style="padding: 10px 5px;">Fecha</th>
                            <th style="padding: 10px 5px;">Nodo</th>
                            <th style="padding: 10px 5px;">Aportación / Concepto</th>
                            <th style="padding: 10px 5px; text-align: right;">Slices Generados</th>
                        </tr>`;
        
        recent.forEach(entry => {
            const date = new Date(entry.timestamp).toLocaleDateString();
            html += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 10px 5px; color: var(--text-muted);">${date}</td>
                    <td style="padding: 10px 5px; color: var(--accent-blue);">${entry.userId}</td>
                    <td style="padding: 10px 5px;">${entry.description}</td>
                    <td style="padding: 10px 5px; text-align: right; color: var(--accent-green);">+${entry.valorCongelado.toLocaleString()}</td>
                </tr>`;
        });
        html += `</table>`;
        return html;
    },

    renderModals(project) {
        return `
            <div id="modal-node" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:1000; align-items:center; justify-content:center; backdrop-filter: blur(5px);">
                <div class="panel-surface" style="width: 400px; padding: 30px; border-radius: 12px; border: 1px solid var(--border-color);">
                    <h3 style="margin-top:0;">👤 Inyectar Nodo a la Red</h3>
                    <input type="text" id="node-id" placeholder="ID único (ej: @maria_dev)" class="form-input" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white;">
                    <input type="text" id="node-name" placeholder="Nombre completo" class="form-input" style="width:100%; margin-bottom:20px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white;">
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button onclick="document.getElementById('modal-node').style.display='none'" class="btn" style="background:transparent; border:1px solid var(--border-color); color:white;">Cancelar</button>
                        <button id="submit-node" class="btn" style="background:var(--accent-blue); color:white; border:none;">Guardar Nodo</button>
                    </div>
                </div>
            </div>

            <div id="modal-cash" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:1000; align-items:center; justify-content:center; backdrop-filter: blur(5px);">
                <div class="panel-surface" style="width: 450px; padding: 30px; border-radius: 12px; border: 1px solid var(--border-color); border-top: 4px solid var(--accent-green);">
                    <h3 style="margin-top:0; color: var(--accent-green);">💰 Registrar Aportación Extraordinaria</h3>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 20px;">Slicing Pie multiplica el riesgo. El Cash tiene un riesgo de x4. El equipo/material x2.</p>
                    
                    <select id="cash-user" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white;">
                        <option value="">-- Selecciona el Nodo Emisor --</option>
                        ${project.usuarios.map(u => `<option value="${u.id}">${u.id} (${u.name})</option>`).join('')}
                    </select>

                    <select id="cash-type" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white;">
                        <option value="4">Capital en Efectivo (Cash) - Multiplicador Riesgo x4</option>
                        <option value="2">Materiales / Licencias / Servidores - Multiplicador x2</option>
                    </select>

                    <input type="number" id="cash-amount" placeholder="Valor real en Euros (€)" class="form-input" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white;">
                    <input type="text" id="cash-desc" placeholder="Concepto (ej: Compra servidores AWS)" class="form-input" style="width:100%; margin-bottom:20px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:white;">
                    
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button onclick="document.getElementById('modal-cash').style.display='none'" class="btn" style="background:transparent; border:1px solid var(--border-color); color:white;">Cancelar</button>
                        <button id="submit-cash" class="btn" style="background:var(--accent-green); color:#000; font-weight:bold; border:none;">Inyectar al Ledger</button>
                    </div>
                </div>
            </div>
        `;
    },

    // --- LÓGICA DE INTERACCIÓN ---

    attachEvents() {
        // Actualizar Simulador en tiempo real
        const inputValuation = document.getElementById('input-valuation');
        if (inputValuation) {
            inputValuation.addEventListener('input', (e) => {
                this.valuationAmount = parseFloat(e.target.value) || 0;
                this.render(); // Re-render para actualizar la tabla de la cosecha
            });
        }

        // Modal Nodos
        document.getElementById('btn-add-node')?.addEventListener('click', () => {
            document.getElementById('modal-node').style.display = 'flex';
        });

        document.getElementById('submit-node')?.addEventListener('click', () => {
            const id = document.getElementById('node-id').value.trim();
            const name = document.getElementById('node-name').value.trim();
            if (id && name) {
                store.dispatch({ type: 'ADD_USER', payload: { projectId: this.projectId, id, name } });
                this.render();
            } else {
                alert("Completa todos los campos del nodo.");
            }
        });

        // Modal Aportaciones Manuales (CASH)
        document.getElementById('btn-add-cash')?.addEventListener('click', () => {
            document.getElementById('modal-cash').style.display = 'flex';
        });

        document.getElementById('submit-cash')?.addEventListener('click', () => {
            const userId = document.getElementById('cash-user').value;
            const riskMultiplier = parseFloat(document.getElementById('cash-type').value);
            const amount = parseFloat(document.getElementById('cash-amount').value);
            const desc = document.getElementById('cash-desc').value.trim();

            if (userId && amount > 0 && desc) {
                // Cálculo Slicing Pie para Cash: Valor * Riesgo
                const slicesGenerados = amount * riskMultiplier;
                
                // Hack Elegante: Inyectamos directo al Ledger usando la estructura de datos existente
                const state = store.getState();
                const project = state.projects.find(p => p.id === this.projectId);
                
                project.ledger.push({
                    userId: userId,
                    roleId: 'inversor', // Rol simbólico para aportaciones manuales
                    description: `[Capital/Riesgo x${riskMultiplier}] ${desc}`,
                    horas: 0, 
                    valorCongelado: slicesGenerados,
                    timestamp: Date.now()
                });
                
                // Forzamos actualización de estado
                store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId: this.projectId, updates: {} } });
                this.render();
            } else {
                alert("Faltan datos para procesar la inyección de capital.");
            }
        });
    }
};
