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
    // 1. Alta de Contribuidor con Identidad Soberana
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

        if (!uniqueId.startsWith('@')) uniqueId = '@' + uniqueId;
        uniqueId = uniqueId.toLowerCase().replace(/\s+/g, '');
        
        try {
            store.dispatch({ 
                type: 'ADD_USER', 
                payload: { projectId, name, uniqueId, walletOrSocial } 
            });
            
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
        btn.innerHTML = '✅ Sellado';
        btn.style.backgroundColor = 'var(--accent-green)';
        setTimeout(() => {
            document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
        }, 800);
    }

    // 📋 Copiar Prompt Auditor
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
            return alert("⚠️ Selecciona usuarios/roles y pega el JSON.");
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
            e.target.innerHTML = '✅ Sellado';
            setTimeout(() => {
                document.getElementById('app').innerHTML = ProjectAccountingView.render(projectId);
            }, 1000);

        } catch (error) {
            alert("❌ Error JSON: " + error.message);
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
                  <option value="Aportación libre">-- Aportación libre --</option>
               </select>`
            : `<input id="ldg-desc" type="text" class="form-control text-small" placeholder="Ej: Revisión de código">`;

        const getRoleDisplayName = (rId) => {
            const r = roles.find(role => role.id === rId);
            if (!r) return 'N/A';
            const asg = asignaciones.find(a => a.roleId === rId);
            const userForRole = asg ? users.find(u => u.id === asg.userId) : null;
            return userForRole ? `${r.name} (${userForRole.id})` : `${r.name}`;
        };

        return `
            <div class="container">
                <header style="margin-bottom: 30px;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none;">Dashboard</a> /
                        <b style="color: var(--text-heading);">${project.nombre}</b> /
                        <a href="#/project/${projectId}" style="color: var(--text-muted); text-decoration: none;">Maping</a> /
                        <span style="color: var(--accent-gold); font-weight:bold;">Accounting</span>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, rgba(210, 153, 34, 0.1) 0%, rgba(163, 113, 247, 0.05) 100%); border: 1px solid var(--accent-gold); border-radius: 12px; padding: 25px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h1 style="color: var(--accent-gold); margin: 0;">💰 Slicing Pie Ledger</h1>
                            <p style="margin: 0; font-size: 1rem; color: var(--text-main);">Identidades globales y flujos de valor auditados.</p>
                        </div>
                        <div style="text-align: right; background: rgba(0,0,0,0.3); padding: 15px 25px; border-radius: 8px;">
                            <div class="text-small text-muted text-uppercase">Equity Total (TVL)</div>
                            <div style="color: var(--accent-green); font-size: 2rem; font-weight: bold;">${totalPie.toLocaleString(undefined, {minimumFractionDigits: 2})} €</div>
                        </div>
                    </div>
                </header>

                <div class="grid-layout" style="grid-template-columns: 380px 1fr; gap: 30px;">
                    <aside style="display: flex; flex-direction: column; gap: 20px;">
                        <div class="panel-surface" style="border-left: 4px solid var(--accent-blue);">
                            <h4 style="margin-top: 0; color: var(--text-heading);">1. Equipo (Identidad Global)</h4>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                <input id="new-user-name" type="text" class="form-control text-small" placeholder="Nombre (Ej: Laura)">
                                <input id="new-user-id" type="text" class="form-control text-small" placeholder="@id_unico (Ej: @laura_dev)" style="font-family: monospace; color: var(--accent-blue);">
                                <input id="new-user-wallet" type="text" class="form-control text-small" placeholder="Wallet / Social Link">
                                <button id="btn-add-user" data-pid="${projectId}" class="btn btn-secondary text-small">Añadir al Pool Global</button>
                            </div>
                        </div>

                        <div class="panel-surface" style="border-left: 4px solid var(--accent-purple);">
                            <h4 style="margin-top: 0; color: var(--text-heading);">2. Vincular Nodo</h4>
                            <select id="assign-user-id" class="form-control text-small">
                                <option value="">Selecciona Usuario...</option>
                                ${userOptionsRaw}
                            </select>
                            <select id="assign-role-id" class="form-control text-small" style="margin-top:5px;">
                                <option value="">Selecciona Nodo...</option>
                                ${allActiveRoleOptions}
                            </select>
                            <button id="btn-assign-role" data-pid="${projectId}" class="btn btn-outline btn-block" style="margin-top: 5px;">Vincular</button>
                        </div>

                        <div class="panel" style="border-color: var(--accent-gold);">
                            <h3 style="margin-top: 0; color: var(--accent-gold);">3. Sellar Manual</h3>
                            <select id="ldg-user" data-pid="${projectId}" class="form-control text-small">${userOptionsSelected}</select>
                            <select id="ldg-role" data-pid="${projectId}" class="form-control text-small">${myRoleOptions}</select>
                            <select id="ldg-receiver" class="form-control text-small">${receiverOptions}</select>
                            ${descInputHtml}
                            <input id="ldg-horas" type="number" step="0.5" class="form-control" placeholder="Horas">
                            <button id="btn-add-ledger" data-pid="${projectId}" class="btn btn-primary btn-block">💾 Registrar</button>
                        </div>

                        <div class="panel-surface" style="border: 2px dashed var(--accent-blue); background: rgba(88, 166, 255, 0.05);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                <h3 style="margin: 0; color: var(--accent-blue);">🤖 4. Sesión IA</h3>
                                <button id="btn-copy-prompt" class="btn btn-secondary text-small" style="padding: 2px 8px; font-size: 0.7rem;">📋 Prompt</button>
                            </div>
                            <textarea id="chat-input" class="form-control" style="height: 80px; font-family: monospace; font-size: 0.7rem;"></textarea>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                <div>
                                    <label class="text-small text-muted">👤 Humano</label>
                                    <select id="parse-h-user" class="form-control text-small">${userOptionsRaw}</select>
                                    <select id="parse-h-role" class="form-control text-small">${allActiveRoleOptions}</select>
                                </div>
                                <div>
                                    <label class="text-small text-muted">🤖 IA</label>
                                    <select id="parse-ai-user" class="form-control text-small">${userOptionsRaw}</select>
                                    <select id="parse-ai-role" class="form-control text-small">${allActiveRoleOptions}</select>
                                </div>
                            </div>
                            <button id="btn-parse-chat" data-pid="${projectId}" class="btn btn-outline btn-block" style="margin-top: 10px;">🪄 Inyectar JSON</button>
                        </div>
                    </aside>

                    <main style="display: flex; flex-direction: column; gap: 20px;">
                        <section class="panel">
                            <h3>📊 Cap Table (Click en nombre para ver Perfil)</h3>
                            <div style="display: flex; gap: 30px; align-items: center; margin-bottom: 20px;">
                                <div style="width: 150px; height: 150px; border-radius: 50%; background: ${pieGradient}; border: 2px solid var(--border-color);"></div>
                                <div style="flex-grow: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px;">
                                    ${userStats.map(u => `<div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px;">
                                        <div style="font-size: 0.7rem; color: ${u.color}; font-weight: bold;">● ${u.name}</div>
                                        <div style="font-size: 1rem; font-family: monospace;">${u.ownership}%</div>
                                    </div>`).join('')}
                                </div>
                            </div>

                            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                                <thead>
                                    <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted); text-align: left;">
                                        <th style="padding: 10px;">Contribuidor</th>
                                        <th style="padding: 10px; text-align: right;">Total (€)</th>
                                        <th style="padding: 10px; text-align: right;">Equity %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${userStats.map(u => `
                                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                            <td style="padding: 12px 10px; font-weight: bold;">
                                                <a href="#/project/${projectId}/user/${u.id}" style="text-decoration: none; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.7" onmouseout="this.style.opacity=1">
                                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${u.color};"></div>
                                                    <span style="color: var(--text-heading);">${u.name}</span>
                                                    <span style="font-size: 0.6rem; color: var(--accent-blue); border: 1px solid var(--accent-blue); padding: 1px 4px; border-radius: 4px; margin-left: 5px; font-weight: normal;">Ver Perfil</span>
                                                </a>
                                                <span style="font-size: 0.7rem; color: var(--accent-blue); font-family: monospace; margin-left: 16px;">${u.id}</span>
                                            </td>
                                            <td style="padding: 12px 10px; text-align: right;">${u.userTotalValue.toLocaleString(undefined, {minimumFractionDigits: 2})} €</td>
                                            <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: var(--accent-green);">${u.ownership} %</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </section>

                        <section class="panel">
                            <h3>📖 Ledger de Transacciones</h3>
                            <div style="overflow-x: auto; max-height: 400px; overflow-y: auto;">
                                <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                                    <tbody>
                                        ${ledger.slice().reverse().map(l => `
                                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                                <td style="padding: 10px; color: var(--text-muted);">${new Date(l.timestamp).toLocaleDateString()}</td>
                                                <td style="padding: 10px; font-weight: bold;">${users.find(u => u.id === l.userId)?.name || 'N/A'}</td>
                                                <td style="padding: 10px;">${l.description}</td>
                                                <td style="padding: 10px; text-align: right; color: var(--accent-green); font-weight: bold;">+${(l.valorCongelado || 0).toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        `;
    }
};
