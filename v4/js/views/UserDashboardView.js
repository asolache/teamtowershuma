import { store } from '../core/store.js';

// 👤 Simulamos el Login del usuario actual (Dogfooding / Placeholder para Auth real)
const CURRENT_USER_ID = "usr-human-01"; 
const CURRENT_USER_NAME = "Humano (Dogfooding)";

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
            return alert("⚠️ Debes indicar las horas reales invertidas y adjuntar un link con la prueba de tu trabajo.");
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

        // 🚀 Feedback UX brutal
        const btn = e.target;
        btn.innerHTML = '✅ Trabajo enviado al Revisor';
        btn.style.backgroundColor = 'var(--accent-green)';
        
        setTimeout(() => {
            document.getElementById('app').innerHTML = UserDashboardView.render();
        }, 1000);
    }

    // 3. Simulación de Guardado de Perfil (Preparación para Login real)
    if (e.target.id === 'btn-save-profile') {
        const bio = document.getElementById('user-bio').value;
        // Aquí en el futuro enviaríamos esto a Firebase o al store global de usuarios
        alert("✅ Contexto de usuario actualizado. La IA ahora conoce tu expertise.");
        e.target.innerHTML = 'Guardado';
        setTimeout(() => e.target.innerHTML = 'Actualizar Perfil', 2000);
    }
});

export const UserDashboardView = {
    render: () => {
        const state = store.getState();
        const projects = state.projects || [];
        
        let pendingPingsHTML = '';
        let consolidatedLedgerHTML = '';
        let totalEquity = 0;
        let totalHours = 0;
        let totalAportaciones = 0; // 🛠️ FIX: Variable global para contar las aportaciones totales

        // Recorremos todos los proyectos buscando tareas (Pings) y cobros (Ledger) de este usuario
        projects.forEach(p => {
            // 1. Buscar Pings Pendientes
            const misPings = (p.transactions || []).filter(tx => tx.assigneeId === CURRENT_USER_ID && tx.status === 'pinged');
            
            misPings.forEach(tx => {
                const emisor = p.roles.find(r => r.id === tx.from);
                const receptor = p.roles.find(r => r.id === tx.to); // El rol que asume el usuario
                
                pendingPingsHTML += `
                    <div class="panel-surface" style="border-left: 4px solid var(--accent-purple); margin-bottom: 20px; transition: transform 0.2s;" onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='none'">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                                    <span style="background: rgba(163, 113, 247, 0.2); color: var(--accent-purple); padding: 4px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; border: 1px solid rgba(163, 113, 247, 0.5);">⚡ PING DE TRABAJO</span>
                                    <span class="text-muted text-small">Proyecto: <b style="color:var(--text-main);">${p.nombre}</b></span>
                                </div>
                                <h3 style="margin: 0 0 5px 0; color: var(--text-heading);">${tx.entregable}</h3>
                                <p class="text-small" style="margin: 0; color: var(--text-muted);">
                                    Actuarás como: <b style="color:var(--accent-blue);">${receptor?.name || 'Contribuidor'}</b> <br>
                                    Solicitado por: <b>${emisor?.name || 'Project Owner'}</b>
                                </p>
                            </div>
                            <div style="text-align: right;">
                                <div class="text-muted text-uppercase" style="font-size: 0.65rem;">Estimación Slicing Pie</div>
                                <div style="color: var(--accent-gold); font-weight: bold; font-size: 1.2rem;">${tx.estimatedHours || 1}h</div>
                            </div>
                        </div>

                        <div style="margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                            <button class="btn btn-primary btn-block btn-open-report" data-hash="${tx.hash}" data-pid="${p.id}" style="background: rgba(88, 166, 255, 0.1); color: var(--accent-blue); border: 1px solid var(--accent-blue);">
                                🚀 Iniciar Trabajo y Entregar Reporte
                            </button>
                        </div>

                        <div id="report-form-${tx.hash}" style="display: none; margin-top: 15px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px dashed var(--accent-blue);">
                            <h4 style="margin: 0; color: var(--accent-blue);">📤 Adjuntar Proof of Work</h4>
                            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <label class="form-label">Horas Reales Invertidas</label>
                                    <input type="number" id="hours-${tx.hash}" class="form-control" placeholder="Ej: 2.5" step="0.5" min="0.1" style="font-size: 1.1rem; color: var(--accent-gold); font-weight: bold;">
                                </div>
                                <div>
                                    <label class="form-label">Link del Entregable (Docs, Github, Figma...)</label>
                                    <input type="url" id="link-${tx.hash}" class="form-control" placeholder="https://...">
                                </div>
                            </div>
                            <label class="form-label">Comentarios para el Revisor (Opcional)</label>
                            <textarea id="comment-${tx.hash}" class="form-control" placeholder="Añade contexto sobre desviaciones de tiempo o bloqueos en la red..." style="height: 60px;"></textarea>
                            
                            <button class="btn btn-primary btn-submit-report btn-block" data-hash="${tx.hash}" data-pid="${p.id}" style="margin-top: 10px;">
                                ✍️ Firmar y Enviar a Auditoría
                            </button>
                        </div>
                    </div>
                `;
            });

            // 2. Buscar Equity Consolidado en el Ledger
            const miLedger = (p.ledger || []).filter(l => l.userId === CURRENT_USER_ID);
            totalAportaciones += miLedger.length; // 🛠️ FIX: Sumamos las aportaciones de este proyecto al total

            miLedger.forEach(l => {
                totalEquity += (l.valorCongelado || 0);
                totalHours += parseFloat(l.horas || 0);
                
                consolidatedLedgerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                        <div>
                            <strong style="color: #f0f6fc; font-size: 0.9rem;">${l.description}</strong>
                            <div class="text-muted text-small" style="margin-top: 3px;">
                                <span style="color: var(--accent-blue);">${p.nombre}</span> • ${new Date(l.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <strong style="color: var(--accent-green); font-size: 1rem;">+ ${l.valorCongelado.toLocaleString(undefined, {minimumFractionDigits: 2})} €</strong>
                            <div class="text-muted text-small" style="font-family: monospace;">${parseFloat(l.horas).toFixed(1)}h</div>
                        </div>
                    </div>
                `;
            });
        });

        if (pendingPingsHTML === '') pendingPingsHTML = `
            <div class="panel-surface" style="text-align: center; padding: 50px 20px; border: 1px dashed var(--border-color);">
                <div style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;">☕</div>
                <h3 style="color: var(--text-muted); margin: 0;">Bandeja Vacía</h3>
                <p class="text-small text-muted" style="margin-top: 10px;">No tienes tareas asignadas por ningún Project Owner en este momento.</p>
            </div>`;
            
        if (consolidatedLedgerHTML === '') consolidatedLedgerHTML = '<div class="text-muted text-center" style="padding: 30px;">Aún no tienes valor sellado en el ecosistema.</div>';

        return `
            <div class="container">
                <header style="margin-bottom: 30px;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none;">Dashboard</a> /
                        <span style="color: var(--accent-green); font-weight:bold;">Portal del Contribuidor</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid var(--accent-green); padding-bottom: 15px;">
                        <div>
                            <h1 style="color: var(--accent-green); margin: 0;">🧑‍🚀 Mi Portal de Operaciones</h1>
                            <p class="text-muted" style="margin: 5px 0 0 0;">Visualiza tus asignaciones, entrega valor y monitoriza tu capitalización.</p>
                        </div>
                    </div>
                </header>

                <div class="grid-layout" style="grid-template-columns: 2fr 1fr; gap: 40px;">
                    
                    <main>
                        <h3 style="margin-top: 0; display: flex; align-items: center; gap: 10px; color: var(--text-heading);">
                            📥 Bandeja de Pings (Tareas Pendientes)
                        </h3>
                        <p class="text-small text-muted" style="margin-bottom: 25px;">Flujos de valor requeridos por el ecosistema. Tu respuesta se convertirá en acciones.</p>
                        
                        ${pendingPingsHTML}
                    </main>

                    <aside style="display: flex; flex-direction: column; gap: 25px;">
                        
                        <div class="panel" style="border-color: var(--border-color); background: linear-gradient(180deg, rgba(88, 166, 255, 0.05) 0%, transparent 100%);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h4 style="margin: 0; color: var(--accent-blue);">Mi Identidad (Config)</h4>
                                <span style="font-size: 0.65rem; background: var(--accent-blue); color: #000; padding: 2px 6px; border-radius: 10px; font-weight: bold;">LOCAL MODE</span>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                                <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg-surface); border: 2px solid var(--accent-blue); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                                    🤖
                                </div>
                                <div>
                                    <div style="font-weight: bold; color: var(--text-heading);">${CURRENT_USER_NAME}</div>
                                    <div style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace;">ID: ${CURRENT_USER_ID}</div>
                                </div>
                            </div>

                            <label class="form-label" style="color: var(--accent-blue);">System Prompt del Usuario (Tu Expertise):</label>
                            <textarea id="user-bio" class="form-control" style="font-size: 0.8rem; height: 80px; background: rgba(0,0,0,0.3); border-color: rgba(88, 166, 255, 0.3);" placeholder="Ej: Soy experto en Python y Arquitectura Cloud..."></textarea>
                            <p class="text-small text-muted" style="font-size: 0.65rem; margin-top: 5px;">Este texto ayuda a la IA global a enrutar tareas hacia ti según tus capacidades.</p>
                            
                            <button id="btn-save-profile" class="btn btn-outline btn-block text-small" style="margin-top: 10px;">Actualizar Perfil</button>
                            
                            <button class="btn btn-secondary btn-block text-small" style="margin-top: 10px; opacity: 0.5; cursor: not-allowed;" title="Próximamente">
                                🔒 Conectar con Google / Apple
                            </button>
                        </div>

                        <div class="panel" style="border-color: var(--accent-gold); text-align: center; background: rgba(210, 153, 34, 0.05); box-shadow: inset 0 0 20px rgba(210, 153, 34, 0.05);">
                            <h4 style="margin: 0; color: var(--accent-gold); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05rem;">Mi Patrimonio / Equity</h4>
                            <div style="font-size: 3rem; font-weight: bold; color: var(--accent-gold); margin: 10px 0; line-height: 1;">
                                ${totalEquity.toLocaleString(undefined, {minimumFractionDigits: 0})} <span style="font-size: 1.5rem; opacity: 0.8;">€</span>
                            </div>
                            <div style="display: flex; justify-content: center; gap: 20px; font-size: 0.85rem; color: var(--text-muted); margin-top: 15px;">
                                <div><b>${totalHours.toFixed(1)}</b> Horas Reales</div>
                                <div><b>${totalAportaciones}</b> Aportaciones</div> </div>
                        </div>

                        <div class="panel">
                            <h4 style="margin: 0;">📜 Mis Aportaciones Consolidadas</h4>
                            <div style="max-height: 350px; overflow-y: auto; margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                                ${consolidatedLedgerHTML}
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        `;
    }
};
