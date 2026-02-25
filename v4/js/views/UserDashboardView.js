import { store } from '../core/store.js';

// 🛡️ EVENTOS DEL PORTAL DE OPERACIONES
document.addEventListener('click', (e) => {
    // 1. Navegación al perfil desde el buscador
    if (e.target.id === 'btn-enter-portal') {
        const uId = document.getElementById('search-user-id').value.trim();
        if (!uId) return alert("⚠️ Introduce tu @id único");
        const safeId = uId.startsWith('@') ? uId : '@' + uId;
        window.location.hash = `#/user-dashboard/${safeId}`;
    }

    // 2. Mostrar formulario de reporte (Proof of Work)
    if (e.target.classList.contains('btn-open-report')) {
        const hash = e.target.getAttribute('data-hash');
        document.getElementById(`report-form-${hash}`).style.display = 'block';
        e.target.style.display = 'none';
    }

    // 3. Enviar el reporte al Kernel
    if (e.target.classList.contains('btn-submit-report')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        
        const realHours = document.getElementById(`hours-${txHash}`).value;
        const proofLink = document.getElementById(`link-${txHash}`).value;
        const comentario = document.getElementById(`comment-${txHash}`).value;

        if (!realHours || !proofLink) {
            return alert("⚠️ Indica horas reales y link de prueba.");
        }

        store.dispatch({
            type: 'REPORT_TRANSACTION',
            payload: { projectId, txHash, realHours: parseFloat(realHours), proofLink, comentario }
        });

        e.target.innerHTML = '✅ Enviado';
        setTimeout(() => {
            const currentHash = window.location.hash;
            window.location.hash = '#/'; // Forzamos refresco
            setTimeout(() => window.location.hash = currentHash, 10);
        }, 800);
    }
});

export const UserDashboardView = {
    render: () => {
        const state = store.getState();
        const hashParts = window.location.hash.split('/');
        const userId = hashParts[2]; // Capturamos el @id de la URL

        // --- CASO A: SI NO HAY USUARIO SELECCIONADO (PANTALLA DE ACCESO) ---
        if (!userId) {
            const users = state.globalUsers || [];
            return `
                <div class="container container-sm fade-in">
                    <header class="header-main" style="flex-direction: column; text-align: center;">
                        <h1 class="text-accent">🧑‍🚀 Portal de Operaciones</h1>
                        <p class="text-muted">Introduce tu identidad para gestionar tus tareas y equity.</p>
                    </header>
                    <div class="panel" style="max-width: 450px; margin: 0 auto; text-align: center; border-color: var(--accent-blue);">
                        <h3>Acceso con Identidad</h3>
                        <input type="text" id="search-user-id" class="form-control" placeholder="Ej: @laura_dev" style="text-align: center; font-size: 1.2rem; font-family: monospace;">
                        <button id="btn-enter-portal" class="btn btn-primary btn-block">Entrar a mi Bandeja →</button>
                        
                        <div style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px;">
                            <p class="text-small text-muted">¿Eres nuevo? Crea tu identidad en la sección de Contabilidad de cualquier proyecto.</p>
                        </div>
                    </div>
                </div>`;
        }

        // --- CASO B: DASHBOARD ACTIVO PARA UN USUARIO ---
        const user = state.globalUsers.find(u => u.id === userId);
        if (!user) return `<div class="container text-center"><h2>Identidad ${userId} no encontrada</h2><button class="btn btn-outline" onclick="location.hash='#/user-dashboard'">Volver</button></div>`;

        let pendingPingsHTML = '';
        let consolidatedLedgerHTML = '';
        let totalEquity = 0;
        let totalHours = 0;
        let totalAportaciones = 0;

        // Escaneo Global de Proyectos
        state.projects.forEach(p => {
            // 1. Tareas Pendientes (Pings asignados a este ID)
            const misPings = (p.transactions || []).filter(tx => tx.assigneeId === user.id && tx.status === 'pinged');
            misPings.forEach(tx => {
                const emisor = p.roles.find(r => r.id === tx.from);
                pendingPingsHTML += `
                    <div class="panel-surface" style="border-left: 4px solid var(--accent-purple); margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <span style="background: rgba(163, 113, 247, 0.1); color: var(--accent-purple); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">⚡ TAREA PENDIENTE</span>
                                <h3 style="margin: 10px 0 5px 0;">${tx.entregable}</h3>
                                <p class="text-small text-muted">Proyecto: <b>${p.nombre}</b> | Solicitado por: ${emisor?.name || 'PO'}</p>
                            </div>
                            <button class="btn btn-outline btn-open-report" data-hash="${tx.hash}">Reportar Trabajo</button>
                        </div>
                        <div id="report-form-${tx.hash}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border-color);">
                            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; margin-bottom: 15px;">
                                <input type="number" id="hours-${tx.hash}" class="form-control" placeholder="Horas Reales">
                                <input type="url" id="link-${tx.hash}" class="form-control" placeholder="URL Proof of Work (Github, Docs...)">
                            </div>
                            <textarea id="comment-${tx.hash}" class="form-control" placeholder="Comentarios..."></textarea>
                            <button class="btn btn-primary btn-submit-report btn-block" data-hash="${tx.hash}" data-pid="${p.id}">✍️ Firmar y Enviar</button>
                        </div>
                    </div>`;
            });

            // 2. Valor Consolidado (Ledger)
            const miLedger = (p.ledger || []).filter(l => l.userId === user.id);
            miLedger.forEach(l => {
                totalEquity += (l.valorCongelado || 0);
                totalHours += parseFloat(l.horas || 0);
                totalAportaciones++;
                consolidatedLedgerHTML += `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <div>
                            <div style="font-size: 0.9rem; font-weight: bold;">${l.description}</div>
                            <div class="text-muted" style="font-size: 0.75rem;">${p.nombre} • ${new Date(l.timestamp).toLocaleDateString()}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: var(--accent-green); font-weight: bold;">+${l.valorCongelado.toFixed(2)}€</div>
                            <div class="text-muted" style="font-size: 0.75rem;">${l.horas}h</div>
                        </div>
                    </div>`;
            });
        });

        return `
            <div class="container fade-in">
                <header style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none; font-size: 0.85rem;">← Dashboard Global</a>
                        <h1 style="margin: 10px 0 0 0; color: var(--accent-green);">🧑‍🚀 Mi Portal: ${user.name}</h1>
                        <code style="color: var(--accent-blue);">${user.id}</code>
                    </div>
                    <button class="btn btn-secondary" onclick="location.hash='#/user-dashboard'">Cambiar de Identidad</button>
                </header>

                <div class="grid-layout" style="grid-template-columns: 2fr 1fr; gap: 30px;">
                    <main>
                        <h3 style="display: flex; align-items: center; gap: 10px;">📥 Bandeja de Tareas (Pings)</h3>
                        ${pendingPingsHTML || '<div class="panel-surface text-center text-muted">No tienes tareas pendientes. ¡Buen trabajo!</div>'}
                    </main>

                    <aside>
                        <div class="panel" style="border-color: var(--accent-gold); text-align: center; background: rgba(210, 153, 34, 0.05);">
                            <div class="text-small text-muted text-uppercase">Patrimonio Acumulado</div>
                            <div style="font-size: 2.5rem; font-weight: bold; color: var(--accent-gold);">${totalEquity.toLocaleString()} €</div>
                            <div style="margin-top: 10px; font-size: 0.85rem;" class="text-muted">
                                <b>${totalHours.toFixed(1)}h</b> en <b>${totalAportaciones}</b> entregas
                            </div>
                        </div>

                        <div class="panel" style="margin-top: 20px;">
                            <h4>📜 Historial de Valor</h4>
                            <div style="max-height: 400px; overflow-y: auto;">
                                ${consolidatedLedgerHTML || '<p class="text-muted">Sin movimientos.</p>'}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>`;
    }
};
