import { store } from '../core/store.js';

let dashboardDisplayMode = 'inbox'; // Modos: inbox, analytics
let inboxFilterMode = 'pow'; // Filtros: all, pow, alerts, requests

// --- SIMULADOR DE AGENTE IA (Dosos) ---
async function simulateAIAudit(tx, project, state) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const role = project.roles.find(r => r.id === tx.from);
            const globalPrompt = state.config.globalPrompt;
            const projectPrompt = project.prompt;
            const rolePrompt = role?.ai_prompt || "Rol sin instrucciones específicas.";

            let veredicto = "Aprobado";
            let analisis = `He analizado el entregable "${tx.entregable}" contra la ontología del rol ${role?.name || 'Desconocido'}. Las horas reclamadas (${tx.realHours}h) parecen coherentes con la carga estándar. El enlace proporcionado es accesible.`;

            if (tx.realHours > 40) {
                veredicto = "Revisión Manual Requerida";
                analisis = `⚠️ ALERTA: Las ${tx.realHours} horas reclamadas para "${tx.entregable}" exceden la desviación estándar para el rol ${role?.name}. Recomiendo que el Project Owner revise el enlace detenidamente.`;
            }

            resolve({
                veredicto,
                analisis,
                contextUsed: `Contexto analizado: ${globalPrompt.substring(0, 20)}... | Rol: ${rolePrompt.substring(0, 20)}...`
            });
        }, 1500); 
    });
}

// --- EVENTOS DEL DASHBOARD ---
document.addEventListener('click', async (e) => {
    
    // --- NAVEGACIÓN POR PESTAÑAS PRINCIPALES ---
    if (e.target.classList.contains('dash-tab-btn')) {
        dashboardDisplayMode = e.target.getAttribute('data-mode');
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
    }

    // --- FILTROS DEL INBOX ---
    if (e.target.classList.contains('inbox-filter-btn')) {
        inboxFilterMode = e.target.getAttribute('data-filter');
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
    }

    // --- APROBAR POW ---
    if (e.target.classList.contains('btn-dash-approve')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        
        if (confirm("¿Consolidar este Proof of Work en el Ledger? Esto generará Slices inmutables.")) {
            store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId, txHash } });
            document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
        }
    }

    // --- RECHAZAR POW ---
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

    // --- AUDITORÍA IA ---
    if (e.target.classList.contains('btn-dash-ai-audit')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const btn = e.target;
        
        btn.innerHTML = '🤖 Analizando Ontología...';
        btn.disabled = true;
        btn.style.background = 'var(--text-muted)';
        
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        const tx = project.transactions.find(t => t.hash === txHash);

        const auditResult = await simulateAIAudit(tx, project, state);
        tx.aiAudit = auditResult;
        
        store.dispatch({ type: 'UPDATE_PROJECT_INFO', payload: { projectId, updates: {} } });
        document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
    }
});

export const ProjectDashboardView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container text-center" style="padding: 50px;"><h2>Proyecto no encontrado</h2></div>`;

        // Analítica
        const txs = project.transactions || [];
        const resilience = store.calculateResilience(projectId);
        const pendingApprovals = txs.filter(tx => tx.status === 'reported');
        const bottlenecks = txs.filter(tx => tx.status === 'theoretical' || tx.status === 'pinged').length;
        
        let totalFrozen = 0;
        (project.ledger || []).forEach(l => totalFrozen += l.valorCongelado);

        // 🚀 SET NAVBAR GLOBAL (Breadcrumbs Izq, Acciones rápidas Der)
        setTimeout(() => window.setNavbar(
            [
                { label: '🏠 Hub', hash: '#/' }, 
                { label: project.nombre, hash: `#/project/${projectId}` },
                { label: 'Dashboard PO' }
            ], 
            ``, 
            `<button class="btn btn-outline text-small" onclick="location.hash='#/project/${projectId}/map'" title="Ver el Grafo" style="border-color: var(--accent-blue); color: var(--accent-blue);">🗺️ Mapa VNA</button>
             <button class="btn btn-outline text-small" onclick="location.hash='#/project/${projectId}/accounting'" title="Ir a Contabilidad" style="border-color: var(--accent-green); color: var(--accent-green);">💰 Contabilidad</button>
             <button class="btn btn-outline text-small" onclick="location.hash='#/project/${projectId}/edit'" title="Ajustes raíz" style="border-color: var(--accent-purple); color: var(--accent-purple);">⚙️ Ontología</button>`
        ), 0);

        const tabStyle = (mode) => `
            padding: 10px 20px; font-weight: bold; cursor: pointer; border-bottom: 3px solid ${dashboardDisplayMode === mode ? 'var(--accent-blue)' : 'transparent'}; 
            color: ${dashboardDisplayMode === mode ? 'var(--text-heading)' : 'var(--text-muted)'}; transition: 0.2s; background: transparent; border-top: none; border-left: none; border-right: none;
        `;

        const filterStyle = (filter) => `
            padding: 5px 12px; font-size: 0.8rem; border-radius: 20px; cursor: pointer; border: 1px solid var(--border-color);
            background: ${inboxFilterMode === filter ? 'var(--accent-blue)' : 'transparent'};
            color: ${inboxFilterMode === filter ? '#fff' : 'var(--text-muted)'};
        `;

        return `
            <div class="container fade-in" style="max-width: 1200px; margin: 30px auto; padding: 0 20px;">
                
                <h1 style="margin: 0 0 5px 0; font-size: 2.2rem; color: var(--text-heading);">Dashboard Sistémico</h1>
                <p style="margin: 0 0 20px 0; color: var(--text-muted);">Audita el trabajo de la red y mantén la resiliencia al 100%.</p>

                <div style="display:flex; border-bottom: 1px solid var(--border-color); margin-bottom: 25px; gap: 10px; overflow-x: auto;">
                    <button class="dash-tab-btn" data-mode="inbox" data-pid="${projectId}" style="${tabStyle('inbox')}">📥 Centro de Control (Inbox)</button>
                    <button class="dash-tab-btn" data-mode="analytics" data-pid="${projectId}" style="${tabStyle('analytics')}">📈 Analítica de Red</button>
                </div>

                <div class="grid-layout" style="grid-template-columns: 2fr 1fr; gap: 30px;">
                    
                    <main>
                        ${dashboardDisplayMode === 'inbox' ? `
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                <h3 style="margin: 0; display: flex; align-items: center; gap: 10px;">
                                    Bandeja de Entrada
                                    ${pendingApprovals.length > 0 ? `<span class="badge" style="background: var(--accent-blue); color: #fff;">${pendingApprovals.length} Nuevos</span>` : ''}
                                </h3>
                                <div style="display: flex; gap: 8px;">
                                    <button class="inbox-filter-btn" data-filter="pow" data-pid="${projectId}" style="${filterStyle('pow')}">📝 Entregables (PoW)</button>
                                    <button class="inbox-filter-btn" data-filter="alerts" data-pid="${projectId}" style="${filterStyle('alerts')}">⚠️ Alertas del Sistema</button>
                                </div>
                            </div>

                            ${inboxFilterMode === 'alerts' ? `
                                <div class="panel-surface text-center" style="padding: 40px; border: 1px dashed var(--accent-gold);">
                                    <div style="font-size: 2rem; margin-bottom: 10px;">🛡️</div>
                                    <h4 style="margin: 0; color: var(--accent-gold);">Sistema Sano</h4>
                                    <p class="text-small text-muted">No hay cuellos de botella críticos ni incidencias ontológicas reportadas.</p>
                                </div>
                            ` : `
                                ${pendingApprovals.length === 0 ? `
                                    <div class="panel-surface text-center" style="padding: 40px; border: 1px dashed var(--border-color);">
                                        <div style="font-size: 3rem; opacity: 0.5; margin-bottom: 15px;">✅</div>
                                        <h4 style="margin: 0 0 5px 0; color: var(--text-muted);">Inbox Limpio</h4>
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
                            `}
                        ` : `
                            <div class="panel-surface text-center" style="padding: 50px; border: 1px dashed var(--border-color);">
                                <h3 style="color: var(--text-muted);">Módulo de Analítica en Desarrollo</h3>
                                <p class="text-small text-muted">Próximamente verás aquí gráficos de velocidad de entrega, resiliencia estructural y simulación de Slicing Pie avanzada.</p>
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
                                <div class="text-muted text-small text-uppercase">Resiliencia Organizacional</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: ${resilience < 50 ? 'var(--accent-red)' : 'var(--accent-blue)'};">${resilience}%</div>
                            </div>
                            <div class="panel-surface" style="border-left: 4px solid var(--accent-purple); padding: 15px;">
                                <div class="text-muted text-small text-uppercase">Cuellos de Botella</div>
                                <div style="font-size: 1.8rem; font-weight: bold; color: var(--accent-purple);">${bottlenecks}</div>
                            </div>
                        </div>

                        <div class="panel" style="background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05);">
                            <h4 style="margin-top:0; color:var(--text-muted); font-size:0.9rem;">💡 Tip del Sistema</h4>
                            <p style="font-size:0.8rem; color:var(--text-muted); margin:0;">Usa la Auditoría de IA para validar que el trabajo cumple con las reglas ontológicas que configuraste en "Ajustes".</p>
                        </div>
                    </aside>

                </div>
            </div>
        `;
    }
};
