import { store } from '../core/store.js';

// 🛡️ EVENTOS DEL PORTAL DE USUARIO
document.addEventListener('change', (e) => {
    // Simulador de Login: Al cambiar de usuario, recargamos la vista
    if (e.target.id === 'user-login-simulator') {
        const userId = e.target.value;
        // Guardamos en sessionStorage para mantener la "sesión" activa mientras navegamos
        sessionStorage.setItem('sos-active-user', userId);
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }
});

document.addEventListener('click', (e) => {
    // Registrar Trabajo desde el Portal
    if (e.target.classList.contains('btn-report-work')) {
        const txHash = e.target.getAttribute('data-tx');
        const projectId = e.target.getAttribute('data-pid');
        const roleId = e.target.getAttribute('data-rid');
        const receiverId = e.target.getAttribute('data-rec');
        const description = e.target.getAttribute('data-desc');
        const userId = sessionStorage.getItem('sos-active-user');
        
        const horasInput = document.getElementById(`horas-${txHash}`).value;
        const notesInput = document.getElementById(`notes-${txHash}`).value;

        if (!horasInput || horasInput <= 0) return alert("Por favor, indica las horas invertidas.");

        // Guardamos en el Ledger
        store.dispatch({ 
            type: 'ADD_LEDGER_ENTRY', 
            payload: { 
                projectId, 
                userId, 
                roleId, 
                receiverId, 
                description: `[${description}] ${notesInput}`, 
                horas: horasInput 
            } 
        });

        alert("✅ Aportación registrada en el Libro Mayor. Slicing Pie actualizado.");
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }
});

export const UserDashboardView = {
    render: () => {
        const state = store.getState();
        const projects = state.projects || [];
        
        // 1. OBTENER TODOS LOS USUARIOS DEL SISTEMA (Para el simulador de Login)
        // Extraemos usuarios únicos de todos los proyectos para el selector global
        const allUsers = [];
        projects.forEach(p => {
            (p.usuarios || []).forEach(u => {
                if (!allUsers.find(exist => exist.id === u.id)) allUsers.push(u);
            });
        });

        // 2. RECUPERAR EL USUARIO ACTIVO DE LA SESIÓN
        const activeUserId = sessionStorage.getItem('sos-active-user');
        const activeUser = allUsers.find(u => u.id === activeUserId);

        const loginSelectorHTML = `
            <div style="background: rgba(88, 166, 255, 0.1); border: 1px solid var(--accent-blue); padding: 10px 15px; border-radius: 8px; display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 0.85rem; color: var(--text-muted);">Simular sesión como:</span>
                <select id="user-login-simulator" class="form-control" style="width: auto; margin: 0; padding: 5px 10px;">
                    <option value="">-- Selecciona Usuario --</option>
                    ${allUsers.map(u => `<option value="${u.id}" ${activeUserId === u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
                </select>
            </div>
        `;

        if (!activeUser) {
            return `
                <div class="container container-sm">
                    <header class="header-main" style="border-bottom: none; justify-content: space-between;">
                        <h1 class="text-accent">👤 Portal del Contribuidor</h1>
                        <button class="btn btn-secondary" onclick="location.hash='#/'">← Dashboard Admin</button>
                    </header>
                    ${loginSelectorHTML}
                    <div class="panel" style="margin-top: 30px; text-align: center; padding: 50px 20px;">
                        <h2 style="color: var(--text-muted);">Inicia sesión para ver tu trabajo</h2>
                        <p class="text-small text-muted">Selecciona un usuario en el menú superior para cargar sus proyectos y roles.</p>
                    </div>
                </div>
            `;
        }

        // 3. BUSCAR LOS PROYECTOS Y TAREAS DEL USUARIO
        let userInboxHTML = '';
        let totalHorasUsuario = 0;
        let totalValorUsuario = 0;

        projects.forEach(p => {
            // Verificar si el usuario tiene asignaciones en este proyecto
            const userAssignments = (p.asignaciones || []).filter(a => a.userId === activeUserId);
            if (userAssignments.length === 0) return; // No está en este proyecto

            // Calcular el valor histórico del usuario en este proyecto (Slicing Pie)
            const userLedger = (p.ledger || []).filter(l => l.userId === activeUserId);
            const projectHoras = userLedger.reduce((acc, l) => acc + parseFloat(l.horas), 0);
            const projectValor = userLedger.reduce((acc, l) => acc + l.valorCongelado, 0);
            
            totalHorasUsuario += projectHoras;
            totalValorUsuario += projectValor;

            // Construir la lista de Tareas Pendientes (Transacciones donde el usuario es el Origen)
            const userRoleIds = userAssignments.map(a => a.roleId);
            const myPendingTasks = (p.transactions || []).filter(tx => userRoleIds.includes(tx.from));

            const tasksHTML = myPendingTasks.length === 0 
                ? `<p class="text-muted text-small">No hay flujos de valor asignados a tus roles en este proyecto.</p>` 
                : myPendingTasks.map(tx => {
                    const fromRole = p.roles.find(r => r.id === tx.from);
                    const toRole = p.roles.find(r => r.id === tx.to);
                    const isIntangible = tx.tipo === 'intangible';
                    const color = isIntangible ? 'var(--accent-purple)' : 'var(--accent-blue)';

                    return `
                        <div class="panel-surface" style="margin-bottom: 15px; border-left: 3px solid ${color};">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                <div>
                                    <span style="font-size: 0.7rem; font-weight: bold; color: ${color}; text-transform: uppercase;">
                                        Actuando como: ${fromRole.name}
                                    </span>
                                    <h4 style="margin: 5px 0 2px 0;">${tx.entregable}</h4>
                                    <span class="text-muted text-small">Entregar a: <b>${toRole.name}</b> (${toRole.levelId})</span>
                                </div>
                                <div style="text-align: right;">
                                    <span style="font-size: 0.75rem; background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 12px;">
                                        Multiplicador: ${fromRole.multiplier}x
                                    </span>
                                </div>
                            </div>
                            
                            <div style="background: #000; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-family: monospace; font-size: 0.8rem; color: #a5d6ff; display: flex; justify-content: space-between; align-items: center;">
                                <span>📄 System Prompt del Entregable: <span style="opacity:0.5;">(Próximamente en v4.6)</span></span>
                                <button class="btn btn-outline" style="padding: 3px 8px; font-size: 0.7rem; opacity: 0.5;" disabled>Generar con IA</button>
                            </div>

                            <div style="display: grid; grid-template-columns: 80px 1fr auto; gap: 10px; align-items: center; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;">
                                <input type="number" id="horas-${tx.hash}" class="form-control" placeholder="Horas" step="0.5" style="margin:0;">
                                <input type="text" id="notes-${tx.hash}" class="form-control" placeholder="Notas adicionales (Opcional)" style="margin:0;">
                                <button class="btn btn-primary btn-report-work" 
                                    data-tx="${tx.hash}" data-pid="${p.id}" data-rid="${tx.from}" 
                                    data-rec="${tx.to}" data-desc="${tx.entregable}">
                                    Reportar Valor
                                </button>
                            </div>
                        </div>
                    `;
                }).join('');

            userInboxHTML += `
                <div class="panel" style="margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: var(--text-heading);">🏰 ${p.nombre}</h3>
                        <div style="text-align: right;">
                            <span class="text-muted text-small">Tu Equity Generado:</span>
                            <span style="color: var(--accent-green); font-weight: bold; margin-left: 5px;">${projectValor.toLocaleString()} €</span>
                        </div>
                    </div>
                    ${tasksHTML}
                </div>
            `;
        });

        if (userInboxHTML === '') {
            userInboxHTML = `<div class="panel text-center text-muted" style="padding: 40px;">No estás asignado a ningún rol en los ecosistemas activos.</div>`;
        }

        return `
            <div class="container container-sm">
                <header class="header-main" style="margin-bottom: 20px;">
                    <div>
                        <h1 class="text-accent">👤 Portal del Contribuidor</h1>
                        <p class="text-muted" style="margin: 0;">Tu espacio personal de ejecución y reporte de valor.</p>
                    </div>
                    <div style="display: flex; gap: 15px;">
                        ${loginSelectorHTML}
                        <button class="btn btn-secondary" onclick="location.hash='#/'">Salir al Dashboard</button>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px;">
                    <div class="panel-surface text-center" style="border-top: 3px solid var(--text-muted);">
                        <h4 style="margin:0; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Identidad</h4>
                        <div style="font-size: 1.2rem; font-weight: bold; margin-top: 5px;">${activeUser.name}</div>
                    </div>
                    <div class="panel-surface text-center" style="border-top: 3px solid var(--accent-blue);">
                        <h4 style="margin:0; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Horas Invertidas</h4>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--accent-blue); margin-top: 5px;">${totalHorasUsuario} h</div>
                    </div>
                    <div class="panel-surface text-center" style="border-top: 3px solid var(--accent-green);">
                        <h4 style="margin:0; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Fondo Total Slicing Pie</h4>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--accent-green); margin-top: 5px;">${totalValorUsuario.toLocaleString()} €</div>
                    </div>
                </div>

                <div class="inbox-section">
                    <h2 style="font-size: 1.2rem; margin-bottom: 20px; color: var(--text-main);">📥 Tus Flujos de Valor Pendientes</h2>
                    ${userInboxHTML}
                </div>
            </div>
        `;
    }
};
