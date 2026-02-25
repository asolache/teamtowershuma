import { store } from '../core/store.js';

// 🧠 MEMORIA DE SESIÓN LOCAL
let memoryUserId = null;
let memoryRoleId = null;

// 🛡️ EVENTOS REACTIVOS
document.addEventListener('change', (e) => {
    if (e.target.id === 'ldg-user') {
        memoryUserId = e.target.value;
        memoryRoleId = null; 
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
    }
    
    if (e.target.id === 'ldg-role') {
        memoryRoleId = e.target.value;
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
    }
});

// 🛡️ EVENTOS DE ACCIÓN
document.addEventListener('click', (e) => {
    // 🚀 NUEVO: 1. Alta de Contribuidor con Identidad Soberana
    if (e.target.id === 'btn-add-user') {
        const projectId = e.target.getAttribute('data-pid');
        const nameInput = document.getElementById('new-user-name');
        const idInput = document.getElementById('new-user-id');
        const walletInput = document.getElementById('new-user-wallet');
        
        const name = nameInput.value.trim();
        let uniqueId = idInput.value.trim();
        const walletOrSocial = walletInput.value.trim();
        
        if (!name) return alert("⚠️ Indica el nombre del contribuidor.");
        if (!uniqueId) return alert("⚠️ Indica el identificador único (@id).");

        // Formateo automático: asegurar que empieza por @ y no tiene espacios
        if (!uniqueId.startsWith('@')) uniqueId = '@' + uniqueId;
        uniqueId = uniqueId.toLowerCase().replace(/\s+/g, '');
        
        try {
            // Intentamos inyectar al Kernel
            store.dispatch({ 
                type: 'ADD_USER', 
                payload: { projectId, name, uniqueId, walletOrSocial } 
            });
            
            // Si funciona, limpiamos y recargamos
            nameInput.value = '';
            idInput.value = '';
            walletInput.value = '';
            
            const btn = document.getElementById('btn-add-user');
            btn.innerHTML = '✅ Guardado';
            btn.style.backgroundColor = 'var(--accent-green)';
            setTimeout(() => {
                document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
            }, 500);

        } catch (error) {
            // 🛡️ Capturamos el bloqueo de duplicados del Kernel
            alert("❌ ALERTA DE SISTEMA:\n\n" + error.message);
        }
    }

    // 2. Asignar Rol a Persona
    if (e.target.id === 'btn-assign-role') {
        const projectId = e.target.getAttribute('data-pid');
        const userId = document.getElementById('assign-user-id').value;
        const roleId = document.getElementById('assign-role-id').value;
        
        if (!userId || !roleId) return alert("⚠️ Selecciona un usuario y un rol activo.");
        
        store.dispatch({ type: 'ASSIGN_USER_ROLE', payload: { projectId, userId, roleId } });
        
        if (userId === memoryUserId) memoryRoleId = roleId; 
        
        const btn = document.getElementById('btn-assign-role');
        btn.innerHTML = '✅ Asignado';
        btn.style.backgroundColor = 'var(--accent-green)';
        btn.style.color = '#fff';
        setTimeout(() => {
            document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
        }, 500);
    }

    // 3. Registrar Aportación Directa
    if (e.target.id === 'btn-add-ledger') {
        const projectId = e.target.getAttribute('data-pid');
        const userId = document.getElementById('ldg-user').value;
        const roleId = document.getElementById('ldg-role').value;
        const receiverId = document.getElementById('ldg-receiver').value;
        
        const descElement = document.getElementById('ldg-desc');
        const description = descElement.value;
        const horas = document.getElementById('ldg-horas').value;

        if (!userId || !roleId || !receiverId || !description || !horas) {
            return alert("⚠️ Rellena todos los campos. Asegúrate de que el usuario tiene un rol asignado.");
        }

        store.dispatch({ 
            type: 'ADD_LEDGER_ENTRY', 
            payload: { projectId, userId, roleId, receiverId, description, horas } 
        });

        memoryUserId = userId;
        memoryRoleId = roleId;

        const btn = document.getElementById('btn-add-ledger');
        btn.innerHTML = '✅ Sellado en Blockchain Local';
        btn.style.backgroundColor = 'var(--accent-green)';
        setTimeout(() => {
            document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
        }, 800);
    }

    // EVENTO: Copiar Prompt al Portapapeles
    if (e.target.id === 'btn-copy-prompt') {
        const promptText = `Gemini, evalúa nuestra sesión de hoy como Auditor Slicing Pie. Calcula el esfuerzo y devuélveme EXCLUSIVAMENTE un array JSON válido para inyectar en el Ledger con esta estructura exacta: [{"actor": "human", "description": "Resumen de lo que diseñó/dirigió el humano", "horas": 0.0}, {"actor": "ai", "description": "Resumen de lo que codificó/ejecutó la IA", "horas": 0.0}]`;
        navigator.clipboard.writeText(promptText);
        e.target.innerHTML = '✅ Copiado!';
        setTimeout(() => e.target.innerHTML = '📋 Copiar Prompt Auditor', 2000);
    }

    // 4. AUTO-LEDGER (INYECCIÓN JSON)
    if (e.target.id === 'btn-parse-chat') {
        const projectId = e.target.getAttribute('data-pid');
        const jsonText = document.getElementById('chat-input').value.trim();
        const hUserId = document.getElementById('parse-h-user').value;
        const hRoleId = document.getElementById('parse-h-role').value;
        const aiUserId = document.getElementById('parse-ai-user').value;
        const aiRoleId = document.getElementById('parse-ai-role').value;

        if (!jsonText || !hUserId || !hRoleId || !aiUserId || !aiRoleId) {
            return alert("⚠️ Debes seleccionar los usuarios/roles y pegar el JSON generado por la IA.");
        }

        try {
            let cleanJsonText = jsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsedArray = JSON.parse(cleanJsonText);

            const finalPayload = parsedArray.map(entry => {
                const isHuman = entry.actor === 'human';
                return {
                    userId: isHuman ? hUserId : aiUserId,
                    roleId: isHuman ? hRoleId : aiRoleId,
                    receiverId: isHuman ? aiRoleId : hRoleId,
                    description: entry.description,
                    horas: entry.horas
                };
            });

            store.importSessionJSON(projectId, finalPayload);

            const btn = e.target;
            btn.innerHTML = '✅ JSON Procesado y Sellado';
            btn.style.backgroundColor = 'var(--accent-green)';
            
            setTimeout(() => {
                document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
            }, 1200);

        } catch (error) {
            alert("❌ Error de Formato: El texto introducido no es un JSON válido.\n\nDetalle: " + error.message);
        }
    }
});

export const ProjectAccountingView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Proyecto no encontrado</h2></div>`;

        const roles = project.roles || [];
        const activeRoles = roles.filter(r => !r.isArchived && r.id !== 'ecosistema');
        const users = project.usuarios || [];
        const asignaciones = project.asignaciones || [];
        const ledger = project.ledger || [];
        const transactions = project.transactions || []; 

        const totalPie = ledger.reduce((acc, entry) => acc + (entry.valorCongelado || 0), 0);
        const pieColors = ['#58a6ff', '#a371f7', '#238636', '#d29922', '#f85149', '#3fb950', '#bc8cff', '#d1d5da'];

        const userStats = users.map((user, index) => {
            const userEntries = ledger.filter(l => l.userId === user.id);
            const userTotalValue = userEntries.reduce((sum, l) => sum + (l.valorCongelado || 0), 0);
            const rawOwnership = totalPie > 0 ? (userTotalValue / totalPie) * 100 : 0;
            const ownership = rawOwnership.toFixed(2);
            
            const userRoles = asignaciones
                .filter(a => a.userId === user.id)
                .map(a => {
                    const r = roles.find(r => r.id === a.roleId);
                    return r ? r.name : 'Rol Desconocido';
                });

            const color = pieColors[index % pieColors.length];
            return { ...user, userTotalValue, ownership, rawOwnership, userRoles, color };
        }).sort((a, b) => b.userTotalValue - a.userTotalValue);

        let pieGradient = 'conic-gradient(';
        let cumulativePercent = 0;
        
        if (totalPie === 0 || userStats.length === 0) {
            pieGradient = 'conic-gradient(#30363d 0% 100%)';
        } else {
            userStats.forEach((u, i) => {
                const start = cumulativePercent;
                const end = cumulativePercent + u.rawOwnership;
                pieGradient += `${u.color} ${start}% ${end}%${i < userStats.length - 1 ? ', ' : ''}`;
                cumulativePercent = end;
            });
            pieGradient += ')';
        }

        const currentUserId = memoryUserId || (users.length > 0 ? users[0].id : "");
        const userAssignedRoleIds = asignaciones.filter(a => a.userId === currentUserId).map(a => a.roleId);
        const assignedActiveRoles = activeRoles.filter(r => userAssignedRoleIds.includes(r.id));

        let currentRoleId = (memoryRoleId && userAssignedRoleIds.includes(memoryRoleId)) 
            ? memoryRoleId 
            : (assignedActiveRoles.length > 0 ? assignedActiveRoles[0].id : "");

        let defaultReceiverId = "";
        let pendingDeliverables = [];

        if (currentRoleId) {
            const outgoingTxs = transactions.filter(tx => tx.from === currentRoleId);
            if (outgoingTxs.length > 0) {
                defaultReceiverId = outgoingTxs[0].to;
                pendingDeliverables = outgoingTxs.filter(tx => tx.status !== 'consolidated');
            }
        }

        // 🚀 NUEVO UX: Mostrar el @id al lado del nombre en los selectores
        const userOptionsRaw = users.map(u => `<option value="${u.id}">${u.name} (${u.id})</option>`).join('');
        const userOptionsSelected = users.map(u => `<option value="${u.id}" ${u.id === currentUserId ? 'selected' : ''}>${u.name} (${u.id})</option>`).join('');
        
        const myRoleOptions = assignedActiveRoles.length > 0
            ? assignedActiveRoles.map(r => `<option value="${r.id}" ${r.id === currentRoleId ? 'selected' : ''}>${r.name} (${r.levelId})</option>`).join('')
            : `<option value="">-- Sin roles asignados --</option>`;
            
        const receiverOptions = activeRoles.map(r => `<option value="${r.id}" ${r.id === defaultReceiverId ? 'selected' : ''}>${r.name} (${r.levelId})</option>`).join('');
        const allActiveRoleOptions = activeRoles.map(r => `<option value="${r.id}">${r.name} (${r.levelId})</option>`).join('');

        const descInputHtml = pendingDeliverables.length > 0 
            ? `<select id="ldg-desc" class="form-control text-small">
                  <option value="">Selecciona un Entregable Pendiente...</option>
                  ${pendingDeliverables.map(tx => `<option value="${tx.entregable}">${tx.entregable} (${tx.horas || tx.estimatedHours || 1}h est.)</option>`).join('')}
                  <option value="Aportación libre (Fuera de diseño)">-- Aportación libre (Fuera del mapa) --</option>
               </select>`
            : `<input id="ldg-desc" type="text" class="form-control text-small" placeholder="Ej: Revisión de código de seguridad">`;

        const getRoleDisplayName = (rId) => {
            const r = roles.find(role => role.id === rId);
            if (!r) return '<del>Rol Eliminado</del>';
            const asg = asignaciones.find(a => a.roleId === rId);
            const userForRole = asg ? users.find(u => u.id === asg.userId) : null;
            return userForRole ? `${r.name} (${userForRole.id})` : `${r.name} (${r.levelId})`;
        };

        return `
            <div class="container">
                <header style="margin-bottom: 30px;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none;">Dashboard</a> /
                        <b style="color: var(--text-heading);">${project.nombre}</b> /
                        <a href="#/project/${projectId}" style="color: var(--text-muted); text-decoration: none;">Maping</a> /
                        <a href="#/project/${projectId}/edit" style="color: var(--text-muted); text-decoration: none;">Configurador</a> /
                        <span style="color: var(--accent-gold); font-weight:bold;">Accounting</span>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(210, 153, 34, 0.1) 0%, rgba(163, 113, 247, 0.05) 100%); border: 1px solid var(--accent-gold); border-radius: 12px; padding: 25px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h1 style="color: var(--accent-gold); margin: 0;">💰 Contabilidad de Valor (Slicing Pie)</h1>
                            <p style="margin: 0; font-size: 1rem; color: var(--text-main); max-width: 800px;">
                                <b>Propuesta de Valor:</b> Convierte el esfuerzo humano y de IA en Equity real. Sella transacciones directas o inyecta sesiones auditadas vía JSON.
                            </p>
                        </div>
                        <div style="text-align: right; background: rgba(0,0,0,0.3); padding: 15px 25px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                            <div class="text-small text-muted text-uppercase">Fondo Total Generado (TVL)</div>
                            <div style="color: var(--accent-green); font-size: 2rem; font-weight: bold; line-height: 1;">${totalPie.toLocaleString(undefined, {minimumFractionDigits: 2})} €</div>
                        </div>
                    </div>
                </header>

                <div class="grid-layout" style="grid-template-columns: 380px 1fr; gap: 30px;">
                    
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <div class="panel-surface" style="border-left: 4px solid var(--accent-blue);">
                            <h4 style="margin-top: 0; color: var(--text-heading);">1. Equipo (Identidad Global)</h4>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <input id="new-user-name" type="text" class="form-control text-small" placeholder="Nombre (Ej: Laura)" style="margin:0;">
                                <input id="new-user-id" type="text" class="form-control text-small" placeholder="@id_unico (Ej: @laura_dev)" style="margin:0; font-family: monospace; color: var(--accent-blue);">
                                <input id="new-user-wallet" type="text" class="form-control text-small" placeholder="Wallet Web3 / Social URL (Opcional)" style="margin:0; font-family: monospace;">
                                <button id="btn-add-user" data-pid="${projectId}" class="btn btn-secondary text-small">Añadir al Pool Global</button>
                            </div>
                        </div>

                        <div class="panel-surface" style="border-left: 4px solid var(--accent-purple);">
                            <h4 style="margin-top: 0; color: var(--text-heading);">2. Asignación de Nodos</h4>
                            <select id="assign-user-id" class="form-control text-small">
                                <option value="">Selecciona Usuario...</option>
                                ${userOptionsRaw}
                            </select>
                            <select id="assign-role-id" class="form-control text-small" style="margin-top:5px;">
                                <option value="">Selecciona Nodo Activo...</option>
                                ${allActiveRoleOptions}
                            </select>
                            <button id="btn-assign-role" data-pid="${projectId}" class="btn btn-outline btn-block" style="margin-top: 5px;">Vincular</button>
                        </div>

                        <div class="panel" style="border-color: var(--accent-gold); background: linear-gradient(180deg, rgba(210, 153, 34, 0.05) 0%, transparent 100%);">
                            <h3 style="margin-top: 0; color: var(--accent-gold);">3. Sellar Manualmente</h3>
                            
                            <label class="form-label">Autor del trabajo:</label>
                            <select id="ldg-user" data-pid="${projectId}" class="form-control text-small">
                                ${users.length === 0 ? '<option value="">(Crea un usuario en el paso 1)</option>' : userOptionsSelected}
                            </select>
                            
                            <label class="form-label">Actuando como:</label>
                            <select id="ldg-role" data-pid="${projectId}" class="form-control text-small" style="border-color: var(--accent-purple);">${myRoleOptions}</select>
                            
                            <label class="form-label">Entregado a:</label>
                            <select id="ldg-receiver" class="form-control text-small" style="border-color: var(--accent-blue);">${receiverOptions}</select>
                            
                            <label class="form-label">¿Qué se ha entregado?</label>
                            ${descInputHtml}
                            
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1);">
                                <label class="form-label" style="color: var(--text-heading);">Tiempo (Horas)</label>
                                <input id="ldg-horas" type="number" step="0.5" min="0.1" class="form-control" placeholder="Ej: 4.5" style="font-size: 1.2rem; font-weight: bold; color: var(--accent-gold);">
                            </div>
                            
                            <button id="btn-add-ledger" data-pid="${projectId}" class="btn btn-primary btn-block" style="margin-top: 10px;">💾 Registrar Manual</button>
                        </div>

                        <div class="panel-surface" style="border: 2px dashed var(--accent-blue); background: rgba(88, 166, 255, 0.05);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                <h3 style="margin: 0; color: var(--accent-blue); display: flex; align-items: center; gap: 8px;">🤖 4. Importar Sesión IA</h3>
                                <button id="btn-copy-prompt" class="btn btn-secondary text-small" style="padding: 2px 8px; font-size: 0.7rem; border-radius: 12px;">📋 Copiar Prompt Auditor</button>
                            </div>
                            
                            <p class="text-small text-muted" style="margin-bottom: 15px;">Pide a la IA que audite la sesión y pega aquí su respuesta JSON.</p>
                            
                            <textarea id="chat-input" class="form-control" style="height: 120px; font-family: monospace; font-size: 0.75rem; border-color: rgba(88, 166, 255, 0.3); background: rgba(0,0,0,0.2);" placeholder='Ejemplo:
[
  { "actor": "human", "description": "Diseño UI", "horas": 1.5 },
  { "actor": "ai", "description": "Código Backend", "horas": 0.8 }
]'></textarea>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                                <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px;">
                                    <label class="text-small text-muted" style="display:block; margin-bottom:4px;">👤 Humano (Actor)</label>
                                    <select id="parse-h-user" class="form-control text-small" style="padding: 4px; margin-bottom: 5px;">
                                        <option value="">Usuario...</option>${userOptionsRaw}
                                    </select>
                                    <select id="parse-h-role" class="form-control text-small" style="padding: 4px; margin-bottom: 0;">
                                        <option value="">Rol...</option>${allActiveRoleOptions}
                                    </select>
                                </div>
                                <div style="background: rgba(88, 166, 255, 0.1); padding: 8px; border-radius: 6px;">
                                    <label class="text-small text-muted" style="display:block; margin-bottom:4px;">🤖 IA (Actor)</label>
                                    <select id="parse-ai-user" class="form-control text-small" style="padding: 4px; margin-bottom: 5px;">
                                        <option value="">Usuario IA...</option>${userOptionsRaw}
                                    </select>
                                    <select id="parse-ai-role" class="form-control text-small" style="padding: 4px; margin-bottom: 0;">
                                        <option value="">Rol...</option>${allActiveRoleOptions}
                                    </select>
                                </div>
                            </div>

                            <button id="btn-parse-chat" data-pid="${projectId}" class="btn btn-outline btn-block" style="margin-top: 15px; border-color: var(--accent-blue);">
                                🪄 Inyectar JSON al Slicing Pie
                            </button>
                        </div>

                    </aside>

                    <main style="display: flex; flex-direction: column; gap: 20px;">
                        
                        <section class="panel" style="border-color: rgba(255,255,255,0.1);">
                            <h3 style="margin-top: 0; display: flex; align-items: center; justify-content: space-between;">
                                <span>📊 Cap Table (Tabla de Capitalización)</span>
                            </h3>
                            
                            ${users.length === 0 ? `
                                <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
                                    <div style="font-size: 3rem; margin-bottom: 10px; opacity: 0.2;">🥧</div>
                                    Aún no hay equipo. Añade usuarios para inicializar la tarta de capital.
                                </div>
                            ` : `
                                <div style="display: flex; gap: 40px; align-items: center; margin: 30px 0; padding: 20px; background: var(--bg-surface); border-radius: 12px;">
                                    <div style="
                                        width: 180px; height: 180px; border-radius: 50%; 
                                        background: ${pieGradient};
                                        box-shadow: 0 0 25px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.8);
                                        flex-shrink: 0; border: 2px solid var(--border-color);
                                    "></div>
                                    
                                    <div style="flex-grow: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px;">
                                        ${userStats.map(u => `
                                            <div style="display: flex; align-items: flex-start; gap: 10px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
                                                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${u.color}; margin-top: 2px; box-shadow: 0 0 5px ${u.color};"></div>
                                                <div>
                                                    <div style="font-size: 0.85rem; font-weight: bold; color: var(--text-heading);">${u.name}</div>
                                                    <div style="font-size: 1.1rem; color: var(--text-main); font-family: monospace;">${u.ownership}%</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>

                                <div style="overflow-x: auto;">
                                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                                        <thead>
                                            <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted); text-align: left;">
                                                <th style="padding: 12px 10px;">Contribuidor</th>
                                                <th style="padding: 12px 10px;">Roles Activos</th>
                                                <th style="padding: 12px 10px; text-align: right;">Valor Acumulado (€)</th>
                                                <th style="padding: 12px 10px; text-align: right;">% Equity Real</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${userStats.map(u => `
                                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                                    <td style="padding: 12px 10px; font-weight: bold; display: flex; flex-direction: column; gap: 2px;">
                                                        <div style="display: flex; align-items: center; gap: 8px;">
                                                            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${u.color};"></div>
                                                            ${u.name}
                                                        </div>
                                                        <span style="font-size: 0.7rem; color: var(--accent-blue); font-family: monospace; margin-left: 16px;">${u.id}</span>
                                                    </td>
                                                    <td style="padding: 12px 10px; font-size: 0.8rem; color: var(--accent-purple);">
                                                        ${u.userRoles.length > 0 ? u.userRoles.map(r => `<span style="background:rgba(163, 113, 247, 0.1); padding:2px 6px; border-radius:4px;">${r}</span>`).join(' ') : '<i style="color:var(--text-muted);">Sin rol asignado</i>'}
                                                    </td>
                                                    <td style="padding: 12px 10px; text-align: right; color: var(--text-main);">${u.userTotalValue.toLocaleString(undefined, {minimumFractionDigits: 2})} €</td>
                                                    <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: var(--accent-green); font-size: 1.1rem;">${u.ownership} %</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `}
                        </section>

                        <section class="panel">
                            <h3 style="margin-top: 0;">📖 Historial Inmutable (Ledger)</h3>
                            
                            ${ledger.length === 0 ? `
                                <div style="text-align: center; padding: 30px 0; color: var(--text-muted); border: 1px dashed var(--border-color); border-radius: 8px;">
                                    El libro mayor está vacío.
                                </div>
                            ` : `
                                <div style="overflow-x: auto; max-height: 500px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px;">
                                    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                                        <thead style="position: sticky; top: 0; background: var(--bg-panel); z-index: 1; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">
                                            <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); text-align: left;">
                                                <th style="padding: 12px;">Fecha</th>
                                                <th style="padding: 12px;">Usuario</th>
                                                <th style="padding: 12px;">Vector (De -> Para)</th>
                                                <th style="padding: 12px;">Entregable Consolidado</th>
                                                <th style="padding: 12px; text-align: center;">H. Reales</th>
                                                <th style="padding: 12px; text-align: right;">Pie (€)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${ledger.slice().reverse().map(l => {
                                                const date = new Date(l.timestamp).toLocaleDateString();
                                                const userObj = users.find(u => u.id === l.userId);
                                                const userName = userObj ? userObj.name : 'Desconocido';
                                                const roleDisplay = getRoleDisplayName(l.roleId);
                                                const receiverDisplay = getRoleDisplayName(l.receiverId);

                                                return `
                                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                                                    <td style="padding: 12px; color: var(--text-muted); white-space: nowrap;">${date}</td>
                                                    <td style="padding: 12px; font-weight: bold; color: var(--text-main);">
                                                        ${userName}
                                                    </td>
                                                    <td style="padding: 12px; color: var(--accent-blue); font-size: 0.75rem; line-height: 1.4;">
                                                        <span style="opacity:0.8;">[${roleDisplay}]</span><br>
                                                        <span style="color:var(--text-muted);">↳ a [${receiverDisplay}]</span>
                                                    </td>
                                                    <td style="padding: 12px; font-weight: 500;">${l.description}</td>
                                                    <td style="padding: 12px; text-align: center; color: var(--text-muted); font-family: monospace;">${parseFloat(l.horas).toFixed(1)}h</td>
                                                    <td style="padding: 12px; text-align: right; color: var(--accent-green); font-weight: bold;">+${(l.valorCongelado || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                </tr>
                                                `;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            `}
                        </section>
                    </main>
                </div>
            </div>
        `;
    }
};
