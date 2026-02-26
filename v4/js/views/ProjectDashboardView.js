import { store } from '../core/store.js';

let dashboardDisplayMode = 'inbox'; // Modos: inbox, analytics

// --- SIMULADOR DE AGENTE IA (Dosos) ---
// En el futuro, aquí haremos el fetch() a la API de OpenAI o Anthropic
async function simulateAIAudit(tx, project, state) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const role = project.roles.find(r => r.id === tx.from);
            const globalPrompt = state.config.globalPrompt;
            const projectPrompt = project.prompt;
            const rolePrompt = role?.ai_prompt || "Rol sin instrucciones específicas.";

            // Simulación de razonamiento de la IA
            let veredicto = "Aprobado";
            let analisis = `He analizado el entregable "${tx.entregable}" contra la ontología del rol ${role?.name || 'Desconocido'}. Las horas reclamadas (${tx.realHours}h) parecen coherentes con la carga estándar. El enlace proporcionado es accesible.`;

            // Lógica simple para simular un rechazo si pide demasiadas horas
            if (tx.realHours > 40) {
                veredicto = "Revisión Manual Requerida";
                analisis = `⚠️ ALERTA: Las ${tx.realHours} horas reclamadas para "${tx.entregable}" exceden la desviación estándar para el rol ${role?.name}. Recomiendo que el Project Owner revise el enlace detenidamente.`;
            }

            resolve({
                veredicto,
                analisis,
                contextUsed: `Contexto analizado: ${globalPrompt.substring(0, 20)}... | Rol: ${rolePrompt.substring(0, 20)}...`
            });
        }, 1500); // 1.5 segundos de "pensamiento"
    });
}

// --- EVENTOS DEL DASHBOARD ---
document.addEventListener('click', async (e) => {
    
    // --- NAVEGACIÓN POR PESTAÑAS (TABS) ---
    if (e.target.classList.contains('dash-tab-btn')) {
        dashboardDisplayMode = e.target.getAttribute('data-mode');
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
    }

    // 1. Aprobar Manualmente (POW -> LEDGER)
    if (e.target.classList.contains('btn-dash-approve')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        
        if (confirm("¿Consolidar este Proof of Work en el Ledger? Esto generará Slices inmutables.")) {
            store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId, txHash } });
            document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
        }
    }

    // 2. Rechazar PoW
    if (e.target.classList.contains('btn-dash-reject')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        
        const motivo = prompt("Indica el motivo del rechazo para informar al nodo:");
        if (motivo !== null) {
            const state = store.getState();
            const project = state.projects.find(p => p.id === projectId);
            const tx = project.transactions.find(t => t.hash === txHash);
            
            if(tx) {
                tx.status = 'rejected';
                tx.reportComment = `❌ RECHAZADO: ${motivo}`;
                store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, updates: {} } });
                document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
            }
        }
    }

    // 3. 🤖 AUDITORÍA DE IA
    if (e.target.classList.contains('btn-dash-ai-audit')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const btn = e.target;
        
        // UI Feedback: Cargando...
        btn.innerHTML = '🤖 Analizando Ontología...';
        btn.disabled = true;
        btn.style.background = 'var(--text-muted)';
        
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        const tx = project.transactions.find(t => t.hash === txHash);

        // Llamada al Agente
        const auditResult = await simulateAIAudit(tx, project, state);

        // Guardar el resultado del agente en la transacción
        tx.aiAudit = auditResult;
        
        // Forzar renderizado
        store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, updates: {} } });
        document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
    }
});

export const ProjectDashboardView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container text-center" style="padding: 50px;"><h2>Proyecto no encontrado</h2></div>`;

        // Analítica Sistémica (Salud)
        const txs = project.transactions || [];
        const resilience = store.calculateResilience(projectId);
        const pendingApprovals = txs.filter(tx => tx.status === 'reported');
        const bottlenecks = txs.filter(tx => tx.status === 'theoretical' || tx.status === 'pinged').length;
        
        let totalFrozen = 0;
        (project.ledger || []).forEach(l => totalFrozen += l.valorCongelado);

        // 🚀 BREADCRUMBS ESTÁNDAR
        setTimeout(() => window.setNavbar ? window.setNavbar([], '', '') : null, 0);

        // ESTILOS DE PESTAÑAS (TABS) - Igual que en ProjectView
        const tabStyle = (mode) => `
            padding: 10px 20px; font-weight: bold; cursor: pointer; border-bottom: 3px solid ${dashboardDisplayMode === mode ? 'var(--accent-blue)' : 'transparent'}; 
            color: ${dashboardDisplayMode === mode ? 'var(--text-heading)' : 'var(--text-muted)'}; transition: 0.2s; background: transparent; border-top: none; border-left: none; border-right: none;
        `;

        return `
            <div style="background: var(--bg-surface); border-bottom: 1px solid var(--border-color); padding: 15px 30px; position: sticky; top: 0; z-index: 100;">
                <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
                    <div style="font-size: 0.95rem; color: var(--text-muted); display: flex; align-items: center; gap: 10px;">
                        <a href="#/" style="color: var(--accent-blue); text-decoration: none; font-weight: bold;">🏠 Hub</a> 
                        <span>/</span> 
                        <a href="#/project/${projectId}" style="color: var(--text-main); text-decoration: none;">${project.nombre}</a> 
                        <span>/</span> 
                        <span style="color: var(--text-heading); font-weight: bold;">Panel del Project Owner (PO)</span>
                    </div>
                </div>
            </div>

            <div class="container fade-in" style="max-width: 1200px; margin: 30px auto; padding: 0 20px;">
                
                <h1 style="margin: 0 0 5px 0; font-size: 2.2rem; color: var(--text-heading);">Dashboard Sistémico</h1>
                <p style="margin: 0 0 20px 0; color: var(--text-muted);">Audita el trabajo de la red y mantén la resiliencia al 100%.</p>

                <div style="display:flex; border-bottom: 1px solid var(--border-color); margin-bottom: 25px; gap: 10px; overflow-x: auto;">
                    <button class="dash-tab-btn" data-mode="inbox" data-pid="${projectId}" style="${tabStyle('inbox')}">📥 Bandeja de Auditoría (Inbox)</button>
                    <button class="dash-tab-btn" data-mode="analytics" data-pid="${projectId}" style="${tabStyle('analytics')}">📈 Analítica Sistémica (Próximamente)</button>
                </div>

                <div class="grid-layout" style="grid-template-columns: 2fr 1fr; gap: 30px;">
                    
                    <main>
                        ${dashboardDisplayMode === 'inbox' ? `
                            
                            <h3 style="display: flex; align-items: center; justify-content: space-between; margin-top: 0; margin-bottom: 20px;">
                                <span>📥 Entregables Pendientes (PoW)</span>
                                ${pendingApprovals.length > 0 ? `<span class="badge" style="background: var(--accent-blue); color: #fff; padding: 5px 10px;">${pendingApprovals.length} Pendientes</span>` : ''}
                            </h3>

                            ${pendingApprovals.length === 0 ? `
                                <div class="panel-surface text-center" style="padding: 40px; border: 1px dashed var(--border-color);">
                                    <div style="font-size: 3rem; opacity: 0.5; margin-bottom: 15px;">✅</div>
                                    <h4 style="margin: 0 0 5px 0; color: var(--text-muted);">Todo al día</h4>
                                    <p class="text-small text-muted">No hay Proof of Works pendientes de auditar por el PO.</p>
                                </div>
                            ` : `
                                <div class="list-group">
                                    ${pendingApprovals.map(tx => {
                                        const rFrom = project.roles.find(r => r.id === tx.from);
                                        const assignee = state.globalUsers.find(u => u.id === tx.assigneeId);
                                        const aiAudit = tx.aiAudit;
                                        
                                        return `
                                        <div class="panel-surface" style="margin-bottom: 20px; border-left: 4px solid var(--accent-blue);">
                                            
                                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                                                <div>
                                                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform:uppercase; margin-bottom: 4px;">
                                                        👤 Nodo: <b style="color:var(--text-heading);">${assignee ? assignee.name : tx.assigneeId}</b> 
                                                        | 🎭 Rol: <b style="color:var(--accent-purple);">${rFrom ? rFrom.name : 'Desc.'}</b>
                                                    </div>
                                                    <h4 style="margin:0; font-size:1.2rem; color: var(--text-heading);">${tx.entregable}</h4>
                                                </div>
                                                <span class="badge" style="background:rgba(88,166,255,0.1); color:var(--accent-blue); font-size: 0.9rem; padding: 5px 10px;">
                                                    Reclama: ${tx.realHours}h
                                                </span>
                                            </div>
                                            
                                            <div style="background:var(--bg-base); padding:15px; border-radius:8px; margin-bottom:15px; border: 1px solid var(--border-color);">
                                                <div style="margin-bottom: 8px;">
                                                    <b>🔗 Evidencia (Proof):</b> <a href="${tx.proofLink}" target="_blank" style="color:var(--accent-blue); text-decoration: underline;">${tx.proofLink}</a>
                                                </div>
                                                ${tx.reportComment ? `
                                                    <div style="color:var(--text-muted); font-size: 0.9rem; font-style: italic; border-left: 2px solid var(--border-color); padding-left: 10px; margin-top: 10px;">
                                                        "${tx.reportComment}"
                                                    </div>
                                                ` : ''}
                                            </div>

                                            ${aiAudit ? `
                                                <div style="background: rgba(163, 113, 247, 0.05); border: 1px solid var(--accent-purple); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                                        <span style="font-size: 1.2rem;">🤖</span>
                                                        <b style="color: var(--accent-purple);">Reporte del Agente 'Dosos'</b>
                                                        <span class="badge" style="background: ${aiAudit.veredicto === 'Aprobado' ? 'var(--accent-green)' : 'var(--accent-red)'}; color: #000;">
                                                            ${aiAudit.veredicto}
                                                        </span>
                                                    </div>
                                                    <p style="font-size: 0.9rem; color: var(--text-main); margin: 0 0 10px 0;">${aiAudit.analisis}</p>
                                                    <div style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace;">> ${aiAudit.contextUsed}</div>
                                                </div>
                                            ` : ''}

                                            <div style="display: flex; gap: 10px;">
                                                ${!aiAudit ? `
                                                    <button class="btn btn-outline btn-dash-ai-audit" style="flex: 1; border-color: var(--accent-purple); color: var(--accent-purple);" data-hash="${tx.hash}" data-pid="${project.id}">
                                                        🤖 Solicitar Auditoría IA
                                                    </button>
                                                ` : ''}
                                                <button class="btn btn-outline btn-dash-reject" style="flex: 1; border-color: var(--accent-red); color: var(--accent-red);" data-hash="${tx.hash}" data-pid="${project.id}">
                                                    ❌ Rechazar
                                                </button>
                                                <button class="btn btn-primary btn-dash-approve" style="flex: 2; background: var(--accent-green); color: #000; font-weight: bold; border: none;" data-hash="${tx.hash}" data-pid="${project.id}">
                                                    ✅ Sellar Ledger (+${tx.valorCongelado} Slices)
                                                </button>
                                            </div>
                                        </div>`;
                                    }).join('')}
                                </div>
                            `}
                        ` : `
                            <div class="panel-surface text-center" style="padding: 50px; border: 1px dashed var(--border-color);">
                                <h3 style="color: var(--text-muted);">Módulo de Analítica en Desarrollo</h3>
                                <p class="text-small text-muted">Próximamente verás aquí gráficos de velocidad de entrega y reparto de equity.</p>
                            </div>
                        `}
                    </main>

                    <aside>
                        <h3 style="margin-top: 0; margin-bottom: 20px;">📊 Salud General</h3>
                        <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
                            <div class="panel-surface" style="border-left: 4px solid var(--accent-green); padding: 15px;">
                                <div class="text-muted text-small text-uppercase">Slices Consolidados</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: var(--text-heading);">${totalFrozen.toLocaleString()}</div>
                            </div>
                            <div class="panel-surface" style="border-left: 4px solid ${resilience < 50 ? 'var(--accent-red)' : 'var(--accent-blue)'}; padding: 15px;">
                                <div class="text-muted text-small text-uppercase">Resiliencia</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: ${resilience < 50 ? 'var(--accent-red)' : 'var(--accent-blue)'};">${resilience}%</div>
                            </div>
                            <div class="panel-surface" style="border-left: 4px solid var(--accent-purple); padding: 15px;">
                                <div class="text-muted text-small text-uppercase">Cuellos de Botella</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent-purple);">${bottlenecks}</div>
                            </div>
                        </div>

                        <h3 style="margin-bottom: 20px;">🧭 Accesos Rápidos</h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            
                            <a href="#/project/${projectId}/map" style="text-decoration:none;">
                                <div class="panel-surface" style="padding:15px; transition:0.2s; border:1px solid var(--border-color); display:flex; align-items:center; gap:15px;" onmouseover="this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.borderColor='var(--border-color)'">
                                    <div style="font-size:1.5rem;">🗺️</div>
                                    <div><b style="color:var(--text-heading); display:block;">1. Mapa VNA</b><span style="font-size:0.75rem; color:var(--text-muted);">Red de flujos</span></div>
                                </div>
                            </a>

                            <a href="#/project/${projectId}/accounting" style="text-decoration:none;">
                                <div class="panel-surface" style="padding:15px; transition:0.2s; border:1px solid var(--border-color); display:flex; align-items:center; gap:15px;" onmouseover="this.style.borderColor='var(--accent-green)'" onmouseout="this.style.borderColor='var(--border-color)'">
                                    <div style="font-size:1.5rem;">💰</div>
                                    <div><b style="color:var(--text-heading); display:block;">2. La Cosecha</b><span style="font-size:0.75rem; color:var(--text-muted);">Contabilidad & Equity</span></div>
                                </div>
                            </a>

                            <a href="#/project/${projectId}/edit" style="text-decoration:none;">
                                <div class="panel-surface" style="padding:15px; transition:0.2s; border:1px solid var(--border-color); display:flex; align-items:center; gap:15px;" onmouseover="this.
