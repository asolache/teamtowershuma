import { store } from '../core/store.js';

let currentValuation = 100000;
let accountingTabMode = 'cap-table'; // cap-table, ledger, simulator

// --- FUNCIÓN AUXILIAR: Tabla de Cosecha ---
function generateHarvestTable(projectId, valuation) {
    try {
        const harvestData = store.calculateHarvest(projectId, valuation);
        if (!harvestData || harvestData.length === 0) return `<div class="text-center text-muted" style="padding: 30px; border: 1px dashed var(--border-color); border-radius: 8px;">El simulador requiere Slices consolidados en el Ledger.</div>`;

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

// --- EVENTOS GLOBALES DE CONTABILIDAD ---
document.addEventListener('click', (e) => {
    
    // --- NAVEGACIÓN POR PESTAÑAS (TABS) ---
    if (e.target.classList.contains('acc-tab-btn')) {
        accountingTabMode = e.target.getAttribute('data-mode');
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
    }

    // --- MODALES (Apertura y Cierre) ---
    if (e.target.id === 'btn-open-user') document.getElementById('modal-user').style.display = 'flex';
    if (e.target.id === 'btn-close-user') document.getElementById('modal-user').style.display = 'none';
    
    if (e.target.id === 'btn-open-role') document.getElementById('modal-role').style.display = 'flex';
    if (e.target.id === 'btn-close-role') document.getElementById('modal-role').style.display = 'none';

    if (e.target.id === 'btn-open-cash') document.getElementById('modal-cash').style.display = 'flex';
    if (e.target.id === 'btn-close-cash') document.getElementById('modal-cash').style.display = 'none';

    // --- ACCIONES DE FORMULARIO ---
    if (e.target.id === 'btn-assign-role') {
        const projectId = e.target.getAttribute('data-pid');
        const userId = document.getElementById('assign-user').value;
        const roleId = document.getElementById('assign-role').value;
        if (!userId || !roleId) return alert("⚠️ Selecciona un Usuario y un Rol.");
        store.dispatch({ type: 'ASSIGN_USER_ROLE', payload: { projectId, userId, roleId } });
        document.getElementById('modal-role').style.display = 'none';
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
            document.getElementById('modal-user').style.display = 'none';
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
            document.getElementById('modal-cash').style.display = 'none';
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

            // 🔐 RBAC: Verificación de permisos de Contabilidad
            const session = state.session || { activeUserId: 'unknown', role: 'user' };
            const isEcosystemOwner = session.role === 'admin';
            const isProjectOwner = project.ownerId === session.activeUserId;
            
            // Si no eres EO ni PO de esta red, fuera.
            if (!isEcosystemOwner && !isProjectOwner) {
                // Seteamos una navbar vacía para evitar que se quede pegada la anterior
                setTimeout(() => window.setNavbar([{ label: '🏠 Hub', hash: '#/' }]), 0);
                return `
                    <div class="container fade-in" style="padding-top:15vh; text-align:center;">
                        <div class="panel-surface" style="display:inline-block; border-top: 4px solid var(--accent-red); padding: 40px; border-radius: 12px;">
                            <h2 style="color: var(--accent-red); margin-top: 0;">🔒 Acceso Denegado</h2>
                            <p class="text-muted">El Libro Mayor y la Contabilidad (Cap Table) son información confidencial.<br>Solo el <b>Project Owner</b> de esta red o el <b>Ecosystem Owner</b> pueden acceder.</p>
                            <button class="btn btn-outline" style="margin-top: 20px;" onclick="history.back()">Volver atrás</button>
                        </div>
                    </div>`;
            }

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

            // 🚀 SET NAVBAR GLOBAL LIMPIA (Inyecta solo en la sub-barra)
            setTimeout(() => {
                if(window.setNavbar) {
                    window.setNavbar(
                        [
                            { label: `${state.config?.ecosystemName || 'Ecosistema'} > Contabilidad: ${project.nombre}` }
                        ], 
                        ``, 
                        `<button class="btn btn-outline text-small" onclick="location.hash='#/project/${projectId}/map'" title="Ver el Grafo" style="border-color: var(--accent-blue); color: var(--accent-blue);">🗺️ Mapa VNA</button>
                         <button class="btn btn-outline text-small" onclick="location.hash='#/project/${projectId}'" title="Ir al Dashboard PO">📥 Dashboard PO</button>
                         <span class="badge" style="background: rgba(163, 113, 247, 0.1); color: var(--accent-purple); border-color: var(--accent-purple); margin-left: 10px;">
                             TOKENOMICS: ${project.config?.tokenomics?.toUpperCase() || 'STARTUP'}
                         </span>`
                    );
                    const backBtn = document.querySelector('.btn-back-nav');
                    if(backBtn) backBtn.style.display = 'none';
                }
            }, 0);

            // ESTILOS DE PESTAÑAS (TABS)
            const tabStyle = (mode) => `
                padding: 10px 20px; font-weight: bold; cursor: pointer; border-bottom: 3px solid ${accountingTabMode === mode ? 'var(--accent-blue)' : 'transparent'}; 
                color: ${accountingTabMode === mode ? 'var(--text-heading)' : 'var(--text-muted)'}; transition: 0.2s; background: transparent; border-top: none; border-left: none; border-right: none;
            `;

            return `
                <div class="container fade-in" style="max-width: 1200px; margin: 20px auto; padding: 0 20px;">
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 25px;">
                        <div>
                            <h1 style="margin: 0 0 5px 0; font-size: 2.2rem; color: var(--text-heading);">Contabilidad de Valor</h1>
                            <p style="margin: 0; color: var(--text-muted);">Monitorización inmutable de Slices y Equity Dinámico.</p>
                        </div>
                    </div>

                    <div style="display:flex; border-bottom: 1px solid var(--border-color); margin-bottom: 25px; gap: 10px; overflow-x: auto;">
                        <button class="acc-tab-btn" data-mode="cap-table" data-pid="${projectId}" style="${tabStyle('cap-table')}">📊 Cap Table</button>
                        <button class="acc-tab-btn" data-mode="simulator" data-pid="${projectId}" style="${tabStyle('simulator')}">🌾 Simulador La Cosecha</button>
                        <button class="acc-tab-btn" data-mode="ledger" data-pid="${projectId}" style="${tabStyle('ledger')}">📜 Libro Mayor (Ledger)</button>
                    </div>

                    <div class="grid-layout" style="grid-template-columns: 2fr 1fr; gap: 30px;">
                        
                        <main>
                            ${accountingTabMode === 'cap-table' ? `
                                <div class="panel-surface" style="border-top: 4px solid var(--accent-blue);">
                                    <h3 style="margin-top:0; display:flex; justify-content:space-between; align-items: center; margin-bottom: 20px;">
                                        <span>Distribución de Slices (Equity Dinámico)</span>
                                        <span class="badge" style="background: rgba(88,166,255,0.1); color:var(--accent-blue); padding: 8px 12px; font-size: 1rem;">
                                            ${totalSlices.toLocaleString()} Totales
                                        </span>
                                    </h3>
                                    ${totalSlices === 0 ? `
                                        <div class="text-center text-muted" style="padding: 40px; border: 1px dashed var(--border-color); border-radius: 8px;">
                                            Aún no hay Slices congelados en la red.
                                        </div>
                                    ` : `
                                        <div style="width: 100%; height: 30px; border-radius: 12px; overflow: hidden; display: flex; margin-bottom: 25px; border: 1px solid var(--border-color);">
                                            ${capTableArray.map(u => `<div style="width: ${u.percentage}%; background-color: ${u.color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.75rem; overflow: hidden; transition: 0.3s;" title="${u.name}: ${u.percentage}%">${u.percentage > 5 ? u.percentage + '%' : ''}</div>`).join('')}
                                        </div>
                                        <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                                            ${capTableArray.map(u => `
                                                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-panel); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                                    <div style="display: flex; align-items: center; gap: 15px;">
                                                        <div style="width: 16px; height: 16px; border-radius: 50%; background-color: ${u.color}; box-shadow: 0 0 10px ${u.color}80;"></div>
                                                        <div>
                                                            <div style="font-weight: bold; font-size: 1.1rem; color: var(--text-heading); margin-bottom: 2px;">${u.name}</div>
                                                            <div style="font-size: 0.8rem; color: var(--text-muted); font-family: monospace;">${u.id}</div>
                                                        </div>
                                                    </div>
                                                    <div style="text-align: right;">
                                                        <div style="font-weight: bold; font-size: 1.2rem; color: ${u.color};">${u.percentage}%</div>
                                                        <div style="font-size: 0.85rem; color: var(--text-muted);">${u.slices.toLocaleString()} Slices</div>
                                                    </div>
                                                </div>`).join('')}
                                        </div>
                                    `}
                                </div>
                            ` : ''}

                            ${accountingTabMode === 'simulator' ? `
                                <div class="panel-surface" style="border-top: 4px solid var(--accent-gold); background: linear-gradient(180deg, rgba(210, 153, 34, 0.05), transparent);">
                                    <h3 style="margin-top: 0; color: var(--accent-gold);">🌾 Simulador de La Cosecha</h3>
                                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">Adapta la valoración esperada (o el presupuesto a repartir) para simular el retorno económico real de cada usuario en base a su % de Equity actual.</p>
                                    
                                    <div style="background: var(--bg-base); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 25px;">
                                        <label style="display: block; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 10px;">Valoración / Presupuesto a repartir (€):</label>
                                        <input type="number" id="input-valuation" data-pid="${projectId}" value="${currentValuation}" style="width: 100%; background: transparent; border: none; color: var(--text-heading); font-size: 2.5rem; font-weight: bold; outline: none; border-bottom: 2px solid var(--accent-gold); padding-bottom: 5px; font-family: monospace;">
                                    </div>
                                    
                                    <div id="harvest-table-container">
                                        ${generateHarvestTable(projectId, currentValuation)}
                                    </div>
                                </div>
                            ` : ''}

                            ${accountingTabMode === 'ledger' ? `
                                <div class="panel-surface">
                                    <h3 style="margin-top: 0; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                                        <span>📜 Libro Mayor Histórico</span>
                                        <button class="btn btn-outline text-small btn-export-csv" style="border-color: var(--text-muted); color: var(--text-muted);" title="Exportar CSV">⬇️ Exportar</button>
                                    </h3>
                                    ${ledger.length === 0 ? `<div class="text-center text-muted" style="padding: 40px; border: 1px dashed var(--border-color);">El Ledger está vacío.</div>` : `
                                        <div style="overflow-x: auto;">
                                            <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                                                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); text-align: left;">
                                                    <th style="padding: 12px 10px;">Fecha</th>
                                                    <th style="padding: 12px 10px;">Usuario (@id)</th>
                                                    <th style="padding: 12px 10px;">Concepto / Entregable</th>
                                                    <th style="padding: 12px 10px;">Rol Validado</th>
                                                    <th style="padding: 12px 10px; text-align: right;">Slices Generados</th>
                                                </tr>
                                                ${ledger.slice().reverse().map(l => {
                                                    const role = project.roles?.find(r => r.id === l.roleId);
                                                    const date = new Date(l.timestamp).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                                    const isCash = l.roleId === 'inversor';
                                                    const rowColor = isCash ? 'var(--accent-gold)' : 'var(--accent-green)';
                                                    return `
                                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                                        <td style="padding: 15px 10px; color: var(--text-muted);">${date}</td>
                                                        <td style="padding: 15px 10px; font-weight: bold; color: var(--accent-blue);">${l.userId}</td>
                                                        <td style="padding: 15px 10px; color: var(--text-heading);">${l.description}</td>
                                                        <td style="padding: 15px 10px; color: var(--text-muted);">${isCash ? 'Capital Extra' : (role ? role.name : 'Desc.')}</td>
                                                        <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: ${rowColor};">+${l.valorCongelado.toLocaleString()} Slices</td>
                                                    </tr>`;
                                                }).join('')}
                                            </table>
                                        </div>
                                    `}
                                </div>
                            ` : ''}
                        </main>

                        <aside>
                            <div class="panel-surface" style="margin-bottom: 25px;">
                                <h3 style="margin-top: 0; margin-bottom: 20px;">🛠️ Operaciones Ledger</h3>
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    <button id="btn-open-role" class="btn btn-outline" style="text-align: left; display: flex; align-items: center; gap: 10px;">
                                        <span style="font-size: 1.2rem;">🎭</span> Asignar Rol a Nodo
                                    </button>
                                    <div style="height: 1px; background: var(--border-color); margin: 5px 0;"></div>
                                    <button id="btn-open-cash" class="btn btn-primary" style="text-align: left; display: flex; align-items: center; gap: 10px; background: var(--accent-green); color: #000; font-weight: bold;">
                                        <span style="font-size: 1.2rem;">💰</span> Aportar Valor Extra (Cash)
                                    </button>
                                </div>
                            </div>

                            <div class="panel" style="background: rgba(88,166,255,0.05); border-color: rgba(88,166,255,0.2);">
                                <h4 style="margin-top:0; color:var(--accent-blue); display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size:1.2rem;">💡</span> Regla del Slicing Pie
                                </h4>
                                <p style="font-size:0.85rem; color:var(--text-main); margin:0;">
                                    Las horas de trabajo auditadas generan Slices automáticamente. Si un inversor pone dinero en efectivo para servidores o licencias, usa el botón "Aportar Valor Extra". El efectivo tiene un multiplicador de riesgo (x4) superior al tiempo.
                                </p>
                            </div>
                        </aside>

                    </div>
                </div>

                <div id="modal-role" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:3000; align-items:center; justify-content:center; backdrop-filter: blur(5px);">
                    <div class="panel-surface fade-in" style="width: 400px; padding: 30px; border-radius: 12px; border-top: 4px solid var(--accent-purple);">
                        <h3 style="margin-top:0; color: var(--text-heading);">🎭 Asignar Rol a Usuario</h3>
                        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 20px;">Vincula un usuario existente con un rol del Mapa de Valor de esta red.</p>
                        
                        <label class="form-label">Selecciona el Nodo (Usuario)</label>
                        <select id="assign-user" class="form-control">
                            <option value="">-- Buscar Usuario (@id) --</option>
                            ${(state.globalUsers || []).map(u => `<option value="${u.id}">${u.name} (${u.id})</option>`).join('')}
                        </select>
                        
                        <label class="form-label">Selecciona el Rol Teórico</label>
                        <select id="assign-role" class="form-control">
                            <option value="">-- Buscar Rol --</option>
                            ${roles.map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('')}
                        </select>
                        
                        <div style="display:flex; gap:10px; margin-top: 20px;">
                            <button id="btn-close-role" class="btn btn-outline" style="flex:1;">Cancelar</button>
                            <button id="btn-assign-role" data-pid="${projectId}" class="btn btn-primary" style="flex:1; background:var(--accent-purple); border:none;">Vincular Rol</button>
                        </div>
                    </div>
                </div>

                <div id="modal-cash" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:3000; align-items:center; justify-content:center; backdrop-filter: blur(5px);">
                    <div class="panel-surface fade-in" style="width: 450px; padding: 30px; border-radius: 12px; border-top: 4px solid var(--accent-green);">
                        <h3 style="margin-top:0; color: var(--text-heading);">💰 Aportar Valor Extra</h3>
                        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 20px;">Inyecta Slices manualmente por aportaciones de capital o recursos.</p>
                        
                        <label class="form-label">Nodo Inversor / Aportador</label>
                        <select id="cash-user" class="form-control">
                            <option value="">-- Selecciona el Usuario Emisor --</option>
                            ${(state.globalUsers || []).map(u => `<option value="${u.id}">${u.id} (${u.name})</option>`).join('')}
                        </select>

                        <label class="form-label">Tipo de Activo / Multiplicador</label>
                        <select id="cash-type" class="form-control">
                            <option value="4">Capital en Efectivo (Cash) - Riesgo x4</option>
                            <option value="2">Materiales / Licencias / Servidores - Riesgo x2</option>
                        </select>

                        <label class="form-label">Cantidad / Valor Equivalente</label>
                        <input type="number" id="cash-amount" class="form-control" placeholder="Valor real en Euros (€)">
                        
                        <label class="form-label">Concepto de la inyección</label>
                        <input type="text" id="cash-desc" class="form-control" placeholder="Ej: Pago de servidores anual AWS">
                        
                        <div style="display:flex; gap:10px; margin-top: 20px;">
                            <button id="btn-close-cash" class="btn btn-outline" style="flex:1;">Cancelar</button>
                            <button id="submit-cash" data-pid="${projectId}" class="btn" style="flex:1; background:var(--accent-green); color:#000; font-weight:bold; border:none;">Sellar Ledger</button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            return `<div class="container fade-in" style="padding: 50px; max-width: 800px; margin: 40px auto;"><div class="panel-surface" style="border: 2px solid var(--accent-red); padding: 30px; border-radius: 12px;"><h2 style="color: var(--accent-red); margin-top: 0;">💥 Error Visual</h2><div style="background: #000; padding: 15px; border-radius: 8px; font-family: monospace; color: #ff7b72;">${error.message}</div></div></div>`;
        }
    }
};
