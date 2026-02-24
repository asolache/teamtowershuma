import { store } from '../core/store.js';

// 👤 Simulamos el Login del usuario actual (Dogfooding)
const CURRENT_USER_ID = "usr-human-01"; 

// 🛡️ EVENTOS DEL PORTAL DE USUARIO
document.addEventListener('click', (e) => {
    // 1. Mostrar formulario de reporte
    if (e.target.classList.contains('btn-open-report')) {
        const hash = e.target.getAttribute('data-hash');
        document.getElementById(`report-form-${hash}`).style.display = 'block';
        e.target.style.display = 'none';
    }

    // 2. Enviar el Proof of Work (Reportar Transacción)
    if (e.target.classList.contains('btn-submit-report')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        
        const realHours = document.getElementById(`hours-${txHash}`).value;
        const proofLink = document.getElementById(`link-${txHash}`).value;
        const comentario = document.getElementById(`comment-${txHash}`).value;

        if (!realHours || !proofLink) {
            return alert("⚠️ Debes indicar las horas invertidas y adjuntar un link con la prueba de tu trabajo (Docs, GitHub, Figma...).");
        }

        // Despachamos al Kernel el estado "reported"
        store.dispatch({
            type: 'REPORT_TRANSACTION',
            payload: { 
                projectId, 
                txHash, 
                realHours: parseFloat(realHours), 
                proofLink, 
                comentario 
            }
        });

        alert("🚀 ¡Entregable reportado! Esperando consolidación del Project Owner.");
        document.getElementById('app').innerHTML = UserDashboardView.render();
    }
});

export const UserDashboardView = {
    render: () => {
        const state = store.getState();
        const projects = state.projects || [];
        
        let pendingPingsHTML = '';
        let consolidatedLedgerHTML = '';
        let totalEquity = 0;

        // Recorremos todos los proyectos buscando tareas (Pings) y cobros (Ledger) de este usuario
        projects.forEach(p => {
            // 1. Buscar Pings Pendientes
            const misPings = (p.transactions || []).filter(tx => tx.assigneeId === CURRENT_USER_ID && tx.status === 'pinged');
            
            misPings.forEach(tx => {
                const emisor = p.roles.find(r => r.id === tx.from);
                pendingPingsHTML += `
                    <div class="panel" style="border-left: 4px solid var(--accent-purple); margin-bottom: 15px; background: rgba(163, 113, 247, 0.02);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <span class="badge" style="background: var(--accent-purple); color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.7rem;">PING RECIBIDO</span>
                                <h4 style="margin: 10px 0 5px 0; color: var(--accent-blue);">${tx.entregable}</h4>
                                <p class="text-small text-muted" style="margin: 0;">Proyecto: <b>${p.nombre}</b> | Solicitado por: ${emisor?.name || 'Project Owner'}</p>
                                <p class="text-small" style="margin-top: 5px;">Estimación teórica: <span style="color: var(--accent-gold);">${tx.estimatedHours}h</span></p>
                            </div>
                            <button class="btn btn-outline btn-open-report" data-hash="${tx.hash}" data-pid="${p.id}" style="border-color: var(--accent-green); color: var(--accent-green);">
                                📤 Entregar Trabajo
                            </button>
                        </div>

                        <div id="report-form-${tx.hash}" style="display: none; margin-top: 20px; padding-top: 15px; border-top: 1px dashed rgba(255,255,255,0.1);">
                            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; margin-bottom: 10px;">
                                <div>
                                    <label class="text-small text-muted">Horas Reales Invertidas</label>
                                    <input type="number" id="hours-${tx.hash}" class="form-control" placeholder="Ej: 2.5" step="0.5" min="0.1">
                                </div>
                                <div>
                                    <label class="text-small text-muted">Link del Entregable (Proof of Work)</label>
                                    <input type="url" id="link-${tx.hash}" class="form-control" placeholder="https://docs.google.com/...">
                                </div>
                            </div>
                            <label class="text-small text-muted">Comentarios para el Revisor (Opcional)</label>
                            <textarea id="comment-${tx.hash}" class="form-control" placeholder="Añade contexto sobre desviaciones de tiempo o bloqueos..." style="height: 60px;"></textarea>
                            
                            <button class="btn btn-primary btn-submit-report" data-hash="${tx.hash}" data-pid="${p.id}" style="margin-top: 10px; width: 100%;">
                                Firmar y Reportar Entregable al Ecosistema
                            </button>
                        </div>
                    </div>
                `;
            });

            // 2. Buscar Equity Consolidado en el Ledger
            const miLedger = (p.ledger || []).filter(l => l.userId === CURRENT_USER_ID);
            miLedger.forEach(l => {
                totalEquity += l.valorCongelado;
                consolidatedLedgerHTML += `
                    <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem;">
                        <div>
                            <strong style="color: #f0f6fc;">${l.description}</strong>
                            <div class="text-muted text-small">${new Date(l.timestamp).toLocaleDateString()} • ${p.nombre}</div>
                        </div>
                        <div style="text-align: right;">
                            <strong style="color: var(--accent-green);">+ ${l.valorCongelado.toLocaleString()} €</strong>
                            <div class="text-muted text-small">${l.horas}h reportadas</div>
                        </div>
                    </div>
                `;
            });
        });

        if (pendingPingsHTML === '') pendingPingsHTML = '<div class="text-muted text-center" style="padding: 30px;">✅ Bandeja vacía. No tienes tareas pendientes.</div>';
        if (consolidatedLedgerHTML === '') consolidatedLedgerHTML = '<div class="text-muted text-center" style="padding: 30px;">Aún no tienes valor consolidado.</div>';

        return `
            <div class="container">
                <header class="header-main" style="border-bottom-color: var(--accent-green);">
                    <div>
                        <h1 style="color: var(--accent-green);">🧑‍🚀 Portal del Contribuidor</h1>
                        <p class="text-muted">Bandeja de entrada y gestión de Slicing Pie para: <b>${CURRENT_USER_ID}</b></p>
                    </div>
                    <button class="btn btn-secondary" onclick="location.hash='#/'">← Volver al Admin</button>
                </header>

                <div class="grid-layout" style="grid-template-columns: 2fr 1fr; gap: 30px;">
                    
                    <main>
                        <h3 style="margin-top: 0; display: flex; align-items: center; gap: 10px;">
                            📥 Bandeja de Pings (Tareas)
                            <span style="background: var(--accent-purple); color: white; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem;">!</span>
                        </h3>
                        <p class="text-small text-muted" style="margin-bottom: 20px;">Los Project Owners del ecosistema requieren estos entregables de ti.</p>
                        
                        ${pendingPingsHTML}
                    </main>

                    <aside>
                        <div class="panel" style="border-color: var(--accent-gold); text-align: center; background: rgba(210, 153, 34, 0.05);">
                            <h4 style="margin-top: 0; color: var(--accent-gold); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05rem;">Mi Patrimonio Total (Equity)</h4>
                            <div style="font-size: 2.5rem; font-weight: bold; color: var(--accent-gold); margin: 10px 0;">
                                ${totalEquity.toLocaleString()} €
                            </div>
                            <p class="text-small text-muted">Slicing Pie consolidado y firmado en el Ledger de todos tus ecosistemas.</p>
                        </div>

                        <div class="panel" style="margin-top: 20px;">
                            <h4 style="margin-top: 0;">📜 Historial Consolidado</h4>
                            <div style="max-height: 400px; overflow-y: auto; margin-top: 15px;">
                                ${consolidatedLedgerHTML}
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        `;
    }
};
