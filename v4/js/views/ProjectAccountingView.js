import { store } from '../core/store.js';

let currentValuation = 100000;

// --- FUNCIÓN AUXILIAR: Tabla de Cosecha ---
function generateHarvestTable(projectId, valuation) {
    try {
        const harvestData = store.calculateHarvest(projectId, valuation);
        if (!harvestData || harvestData.length === 0) return `<p class="text-muted text-small" style="padding: 20px;">El simulador requiere Slices consolidados en el Ledger.</p>`;

        let html = `<table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
                        <tr style="border-bottom: 1px solid var(--border-color); color: var(--accent-gold);">
                            <th style="padding: 10px 5px;">Usuario (@id)</th>
                            <th style="padding: 10px 5px; text-align: right;">% Equity</th>
                            <th style="padding: 10px 5px; text-align: right;">Valor Proyectado</th>
                        </tr>`;
        harvestData.forEach(data => {
            html += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 12px 5px; font-family: monospace; color: var(--text-main);">${data.userId}</td>
                    <td style="padding: 12px 5px; text-align: right; font-weight: bold; color: var(--text-heading);">${data.percentage}</td>
                    <td style="padding: 12px 5px; text-align: right; color: var(--accent-green); font-family: monospace; font-size: 1.1rem;">${data.financialValue}</td>
                </tr>`;
        });
        html += `</table>`;
        return html;
    } catch (err) {
        return `<div style="color:red; padding:10px;">Error en Simulador: ${err.message}</div>`;
    }
}

// --- EVENTOS GLOBALES ---
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-open-user') document.getElementById('modal-user').style.display = 'flex';
    if (e.target.id === 'btn-close-user') document.getElementById('modal-user').style.display = 'none';
    
    if (e.target.id === 'btn-open-role') document.getElementById('modal-role').style.display = 'flex';
    if (e.target.id === 'btn-close-role') document.getElementById('modal-role').style.display = 'none';

    if (e.target.id === 'btn-open-cash') document.getElementById('modal-cash').style.display = 'flex';
    if (e.target.id === 'btn-close-cash') document.getElementById('modal-cash').style.display = 'none';

    if (e.target.id === 'btn-assign-role') {
        const projectId = e.target.getAttribute('data-pid');
        const userId = document.getElementById('assign-user').value;
        const roleId = document.getElementById('assign-role').value;
        if (!userId || !roleId) return alert("⚠️ Selecciona un Usuario y un Rol.");
        store.dispatch({ type: 'ASSIGN_USER_ROLE', payload: { projectId, userId, roleId } });
        document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
    }
    
    if (e.target.id === 'btn-create-user') {
        const projectId = e.target.getAttribute('data-pid');
        const rawId = document.getElementById('new-user-id').value.trim().toLowerCase();
        const name = document.getElementById('new-user-name').value.trim();
        const wallet = document.getElementById('new-user-wallet').value.trim();
        if (!rawId || !name) return alert("⚠️ El usuario debe tener un Nombre y un identificador (@id).");
        const userId = rawId.startsWith('@') ? rawId : `@${rawId}`;
        try {
            store.dispatch({ type: 'ADD_USER', payload: { id: userId, projectId, name, walletOrSocial: wallet } });
            document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
        } catch (err) { alert("❌ " + err.message); }
    }

    if (e.target.id === 'submit-cash') {
        const projectId = e.target.getAttribute('data-pid');
        const userId = document.getElementById('cash-user').value;
        const riskMultiplier = parseFloat(document.getElementById('cash-type').value);
        const amount = parseFloat(document.getElementById('cash-amount').value);
        const desc = document.getElementById('cash-desc').value.trim();
        if (userId && amount > 0 && desc) {
            const slicesGenerados = amount * riskMultiplier;
            const state = store.getState();
            const project = state.projects.find(p => p.id === projectId);
            project.ledger.push({
                userId: userId, roleId: 'inversor',
                description: `[Aportación/Riesgo x${riskMultiplier}] ${desc}`,
                horas: 0, valorCongelado: slicesGenerados, timestamp: Date.now()
            });
            store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, updates: {} } });
            document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
        } else { alert("⚠️ Faltan datos para procesar la aportación."); }
    }
});

document.addEventListener('input', (e) => {
    if (e.target.id === 'input-valuation') {
        currentValuation = parseFloat(e.target.value) || 0;
        const projectId = e.target.getAttribute('data-pid');
        const container = document.getElementById('harvest-table-container');
        if (container && projectId) container.innerHTML = generateHarvestTable(projectId, currentValuation);
    }
});

export const ProjectAccountingView = {
    render: (projectId) => {
        try {
            const state = store.getState();
            const project = state.projects.find(p => p.id === projectId);
            if (!project) return `<div class="container" style="padding: 50px; text-align:center;"><h2>Red no encontrada</h2></div>`;

            const session = state.session || { activeUserId: 'ecosystem-admin', role: 'admin' };
            if (session.role !== 'admin') return `<div class="container text-center" style="padding-top:10vh;"><h3>⛔ Acceso Denegado</h3><p>La Contabilidad de Valor es exclusiva del Owner.</p></div>`;

            const roles = project.roles?.filter(r => !r.isArchived) || [];
            const ledger = project.ledger || [];

            let capTable = {};
            let totalSlices = 0;
            ledger.forEach(l => {
                if (!capTable[l.userId]) {
                    const userObj = state.globalUsers?.find(u => u.id === l.userId);
                    capTable[l.userId] = { name: userObj ? userObj.name : l.userId, slices: 0, color: `hsl(${Math.random() * 360}, 70%, 60%)` };
                }
                capTable[l.userId].slices += l.valorCongelado;
                totalSlices += l.valorCongelado;
            });

            let capTableArray = Object.keys(capTable).map(id => ({
                id, ...capTable[id],
                percentage: totalSlices > 0 ? ((capTable[id].slices / totalSlices) * 100).toFixed(2) : 0
            })).sort((a, b) => b.slices - a.slices);

            const predefColors = ['var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-green)', 'var(--accent-gold)', 'var(--accent-red)'];
            capTableArray.forEach((u, i) => { if(i < 5) u.color = predefColors[i]; });

            setTimeout(() => window.setNavbar ? window.setNavbar([], '', '') : null, 0);

            return `
                <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border-color); padding: 15px 30px; position: sticky; top: 0; z-index: 100;">
                    <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
                        <div style="font-size: 0.95rem; color: var(--text-muted); display: flex; align-items: center; gap: 10px;">
                            <a href="#/" style="color: var(--accent-blue); text-decoration: none; font-weight: bold;">🏠 Hub</a> 
                            <span>/</span> 
                            <a href="#/project/${projectId}" style="color: var(--text-main); text-decoration: none;">${project.nombre}</a> 
                            <span>/</span> 
                            <span style="color: var(--text-heading); font-weight: bold;">Contabilidad de Valor</span>
                        </div>
                        <div>
                            <span class="badge" style="background: rgba(163, 113, 247, 0.1); color: var(--accent-purple); border-color: var(--accent-purple);">
                                TOKENOMICS: ${project.config?.tokenomics?.toUpperCase() || 'STARTUP'}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="container fade-in" style="max-width: 1200px; margin: 30px auto; padding: 0 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">
                        <div>
                            <h1 style="margin: 0 0 5px 0; font-size: 2.2rem; color: var(--text-heading);">Cap Table & Ledger</h1>
                            <p style="margin: 0; color: var(--text-muted);">Monitorización inmutable de Slices y Equity Dinámico.</p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button id="btn-open-user" class="btn btn-outline text-small" style="padding: 10px 15px;">👤 Añadir Usuario</button>
                            <button id="btn-open-role" class="btn btn-outline text-small" style="padding: 10px 15px;">🎭 Asignar Rol a Usuario</button>
                            <button id="btn-open-cash" class="btn" style="padding: 10px 15px; background: var(--accent-green); color: #000; border: none; font-weight: bold; box-shadow: 0 4px 15px rgba(35, 134, 54, 0.3);">
                                💰 Aportar Valor Extra
                            </button>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 30px;">
                        
                        <div class="panel-surface" style="padding: 25px; border-radius: 12px; border-top: 3px solid var(--accent-blue);">
                            <h3 style="margin-top:0; display:flex; justify-content:space-between;">
                                <span>📊 Distribución de Slices</span>
                                <span style="font-size:1rem; color:var(--accent-blue);">${totalSlices.toLocaleString()} Totales</span>
                            </h3>
                            ${totalSlices === 0 ? `
                                <div class="text-center text-muted" style="padding: 20px; border: 1px dashed var(--border-color); border-radius: 8px;">Aún no hay Slices congelados en la red.</div>
                            ` : `
                                <div style="width: 100%; height: 25px; border-radius: 12px; overflow: hidden; display: flex; margin-bottom: 20px; border: 1px solid var(--border-color);">
                                    ${capTableArray.map(u => `<div style="width: ${u.percentage}%; background-color: ${u.color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.7rem; overflow: hidden; transition: 0.3s;" title="${u.name}: ${u.percentage}%">${u.percentage > 5 ? u.percentage + '%' : ''}</div>`).join('')}
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                                    ${capTableArray.map(u => `
                                        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-panel); padding: 10px 15px; border-radius: 8px; border: 1px solid var(--border-color);">
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${u.color};"></div>
                                                <div><div style="font-weight: bold; font-size: 0.9rem; color: var(--text-heading);">${u.name} <span style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${u.id}</span></div></div>
                                            </div>
                                            <div style="text-align: right;"><div style="font-weight: bold; color: ${u.color};">${u.percentage}%</div><div style="font-size: 0.75rem; color: var(--text-muted);">${u.slices.toLocaleString()} Slices</div></div>
                                        </div>`).join('')}
                                </div>
                            `}
                        </div>

                        <div class="panel-surface" style="padding: 25px; border-radius: 12px; border-top: 3px solid var(--accent-gold); background: linear-gradient(180deg, rgba(210, 153, 34, 0.05), transparent);">
                            <h3 style="margin-top: 0; color: var(--accent-gold);">🌾 Simulador de La Cosecha</h3>
                            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">Adapta la valoración para simular el retorno real.</p>
                            <div style="background: var(--bg-base); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px;">
                                <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">Valoración / Presupuesto a repartir (€):</label>
                                <input type="number" id="input-valuation" data-pid="${projectId}" value="${currentValuation}" style="width: 100%; background: transparent; border: none; color: var(--text-heading); font-size: 1.8rem; font-weight: bold; outline: none; border-bottom: 2px solid var(--border-color); padding-bottom: 5px;">
                            </div>
                            <div id="harvest-table-container">${generateHarvestTable(projectId, currentValuation)}</div>
                        </div>
                    </div>

                    <div class="panel-surface" style="padding: 25px; border-radius: 12px; max-height: 500px; overflow-y: auto;">
                        <h3 style="margin-top: 0;">📜 Libro Mayor (Ledger Histórico)</h3>
                        <p class="text-small text-muted" style="margin-bottom: 20px;">Registro inmutable de todas las aportaciones de valor de la red.</p>
                        ${ledger.length === 0 ? `<div class="text-center text-muted" style="padding: 20px; border: 1px dashed var(--border-color);">El Ledger está vacío.</div>` : `
                            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); text-align: left;">
                                    <th style="padding: 10px;">Fecha</th><th style="padding: 10px;">Usuario (@id)</th><th style="padding: 10px;">Concepto / Entregable</th><th style="padding: 10px;">Rol Validado</th><th style="padding: 10px; text-align: right;">Slices Generados</th>
                                </tr>
                                ${ledger.slice().reverse().map(l => {
                                    const user = state.globalUsers?.find(u => u.id === l.userId);
                                    const role = project.roles?.find(r => r.id === l.roleId);
                                    const date = new Date(l.timestamp).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                    const isCash = l.roleId === 'inversor';
                                    const rowColor = isCash ? 'var(--accent-gold)' : 'var(--accent-green)';
                                    return `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                        <td style="padding: 12px 10px; color: var(--text-muted);">${date}</td>
                                        <td style="padding: 12px 10px; font-weight: bold; color: var(--accent-blue);">${l.userId}</td>
                                        <td style="padding: 12px 10px; color: var(--text-heading);">${l.description}</td>
                                        <td style="padding: 12px 10px; color: var(--text-muted);">${isCash ? 'Capital Extra' : (role ? role.name : 'Desc.')}</td>
                                        <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: ${rowColor};">+${l.valorCongelado.toLocaleString()} Slices</td>
                                    </tr>`;
                                }).join('')}
                            </table>
                        `}
                    </div>
                </div>

                <div id="modal-user" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:1000; align-items:center; justify-content:center; backdrop-filter: blur(5px);">
                    <div class="panel-surface fade-in" style="width: 400px; padding: 30px; border-radius: 12px; border: 1px solid var(--border-color); border-top: 4px solid var(--accent-blue);">
                        <h3 style="margin-top:0; color: var(--text-heading);">👤 Añadir Usuario</h3>
                        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 20px;">Registra a un humano en la base de datos global de la red.</p>
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Identificador Único (@id)</label>
                        <input type="text" id="new-user-id" class="form-input" placeholder="Ej: @laura" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Nombre Completo</label>
                        <input type="text" id="new-user-name" class="form-input" placeholder="Ej: Laura García" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Wallet / Email (Opcional)</label>
                        <input type="text" id="new-user-wallet" class="form-input" placeholder="0x... o email@..." style="width:100%; margin-bottom:20px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                        
                        <div style="display:flex; gap:10px; justify-content:flex-end;">
                            <button id="btn-close-user" class="btn btn-outline" style="padding: 10px 15px;">Cancelar</button>
                            <button id="btn-create-user" data-pid="${projectId}" class="btn btn-primary" style="padding: 10px 15px; background:var(--accent-blue); border:none;">Registrar Usuario</button>
                        </div>
                    </div>
                </div>

                <div id="modal-role" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:1000; align-items:center; justify-content:center; backdrop-filter: blur(5px);">
                    <div class="panel-surface fade-in" style="width: 400px; padding: 30px; border-radius: 12px; border: 1px solid var(--border-color); border-top: 4px solid var(--accent-purple);">
                        <h3 style="margin-top:0; color: var(--text-heading);">🎭 Asignar Rol a Usuario</h3>
                        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 20px;">Vincula un usuario existente con un rol del Mapa de Valor.</p>
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Selecciona el Nodo (Usuario)</label>
                        <select id="assign-user" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                            <option value="">-- Buscar Usuario (@id) --</option>
                            ${(state.globalUsers || []).map(u => `<option value="${u.id}">${u.name} (${u.id})</option>`).join('')}
                        </select>
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Selecciona el Rol Teórico</label>
                        <select id="assign-role" style="width:100%; margin-bottom:20px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                            <option value="">-- Buscar Rol --</option>
                            ${roles.map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('')}
                        </select>
                        
                        <div style="display:flex; gap:10px; justify-content:flex-end;">
                            <button id="btn-close-role" class="btn btn-outline" style="padding: 10px 15px;">Cancelar</button>
                            <button id="btn-assign-role" data-pid="${projectId}" class="btn btn-primary" style="padding: 10px 15px; background:var(--accent-purple); border:none;">Vincular Rol</button>
                        </div>
                    </div>
                </div>

                <div id="modal-cash" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:1000; align-items:center; justify-content:center; backdrop-filter: blur(5px);">
                    <div class="panel-surface fade-in" style="width: 450px; padding: 30px; border-radius: 12px; border: 1px solid var(--border-color); border-top: 4px solid var(--accent-green);">
                        <h3 style="margin-top:0; color: var(--text-heading);">💰 Aportar Valor Extra</h3>
                        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 20px;">Slicing Pie multiplica el riesgo. El Efectivo (Cash) tiene un riesgo de x4. Material o recursos x2.</p>
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Nodo Inversor / Aportador</label>
                        <select id="cash-user" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                            <option value="">-- Selecciona el Usuario Emisor --</option>
                            ${(state.globalUsers || []).map(u => `<option value="${u.id}">${u.id} (${u.name})</option>`).join('')}
                        </select>

                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Tipo de Activo</label>
                        <select id="cash-type" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                            <option value="4">Capital en Efectivo (Cash) - Riesgo x4</option>
                            <option value="2">Materiales / Licencias / Servidores - Riesgo x2</option>
                        </select>

                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Cantidad / Valor Equivalente</label>
                        <input type="number" id="cash-amount" placeholder="Valor real en Euros (€)" style="width:100%; margin-bottom:15px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                        
                        <label style="display:block; margin-bottom:5px; color:var(--text-muted); font-size:0.85rem;">Concepto de la inyección</label>
                        <input type="text" id="cash-desc" placeholder="Ej: Pago de servidores anual AWS" style="width:100%; margin-bottom:20px; background:var(--bg-base); border:1px solid var(--border-color); padding:10px; color:var(--text-heading); border-radius: 6px;">
                        
                        <div style="display:flex; gap:10px; justify-content:flex-end;">
                            <button id="btn-close-cash" class="btn btn-outline" style="padding: 10px 15px;">Cancelar</button>
                            <button id="submit-cash" data-pid="${projectId}" class="btn" style="padding: 10px 15px; background:var(--accent-green); color:#000; font-weight:bold; border:none;">Sellar en el Ledger</button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            return `<div class="container fade-in" style="padding: 50px; max-width: 800px; margin: 40px auto;"><div class="panel-surface" style="border: 2px solid var(--accent-red); padding: 30px; border-radius: 12px;"><h2 style="color: var(--accent-red); margin-top: 0;">💥 Error Visual</h2><div style="background: #000; padding: 15px; border-radius: 8px; font-family: monospace; color: #ff7b72;">${error.message}</div></div></div>`;
        }
    }
};
