import { store } from '../core/store.js';

let dashboardDisplayMode = 'inbox'; // Modos: inbox, analytics
let inboxFilterMode = 'pow'; // Filtros: pow, alerts

// --- SIMULADOR DE AGENTE IA (Dosos) ---
async function simulateAIAudit(tx, project, state) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const role = project.roles.find(r => r.id === tx.from);
            const globalPrompt = state.config.globalPrompt;
            const rolePrompt = role?.ai_prompt || "Rol sin instrucciones específicas.";

            let veredicto = "Aprobado";
            let analisis = `He analizado el entregable "${tx.entregable}" contra la ontología del rol ${role?.name || 'Desconocido'}. Las horas reclamadas (${tx.realHours}h) parecen coherentes con la carga estándar.`;

            if (tx.realHours > 40) {
                veredicto = "Revisión Requerida";
                analisis = `⚠️ ALERTA: Las ${tx.realHours} horas reclamadas exceden la desviación estándar. El PO debe validar la complejidad manualmente.`;
            }

            resolve({
                veredicto,
                analisis,
                contextUsed: `Contexto: ${globalPrompt.substring(0, 15)}... | Rol: ${rolePrompt.substring(0, 15)}...`
            });
        }, 1500); 
    });
}

// --- EVENTOS DEL DASHBOARD ---
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('dash-tab-btn')) {
        dashboardDisplayMode = e.target.getAttribute('data-mode');
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
    }

    if (e.target.classList.contains('inbox-filter-btn')) {
        inboxFilterMode = e.target.getAttribute('data-filter');
        const projectId = e.target.getAttribute('data-pid');
        document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
    }

    if (e.target.classList.contains('btn-dash-approve')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        if (confirm("¿Consolidar este PoW? Se generarán Slices inmutables.")) {
            store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId, txHash } });
            document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
        }
    }

    if (e.target.classList.contains('btn-dash-reject')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const motivo = prompt("Motivo del rechazo:");
        if (motivo) {
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

    if (e.target.classList.contains('btn-resolve-alert')) {
        const alertId = e.target.getAttribute('data-alert');
        const projectId = e.target.getAttribute('data-pid');
        store.dispatch({ type: 'RESOLVE_PROJECT_ALERT', payload: { projectId, alertId } });
        document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
    }

    if (e.target.classList.contains('btn-dash-ai-audit')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        const btn = e.target;
        btn.innerHTML = '🤖 Analizando...';
        btn.disabled = true;
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
        if (!project) return `<div class="container text-center"><h2>Proyecto no encontrado</h2></div>`;

        const session = state.session || { activeUserId: 'unknown', role: 'user' };
        const isEcosystemOwner = session.role === 'admin';
        const isProjectOwner = project.ownerId === session.activeUserId || isEcosystemOwner;
        
        // 📊 Cálculos de Madurez y Resiliencia
        const maturity = store.calculateMaturityIndex(projectId);
        const resilience = store.calculateResilience(projectId);
        const txs = project.transactions || [];
        const pendingApprovals = txs.filter(tx => tx.status === 'reported');
        const activeAlerts = (project.alerts || []).filter(a => !a.resolved);
        let totalSlices = 0;
        (project.ledger || []).forEach(l => totalSlices += l.valorCongelado);

        // 🎨 Colores por Arquetipo
        const archColors = { 'startup': 'var(--accent-blue)', 'corporate': 'var(--accent-green)', 'dao': 'var(--accent-gold)' };
        const themeColor = archColors[project.archetype] || 'var(--accent-blue)';

        // 🚀 SET NAVBAR v4.1
        setTimeout(() => {
            if (window.setNavbar) {
                window.setNavbar(
                    [
                        { label: state.config.ecosystemName, hash: '#/' },
                        { label: project.nombre }
                    ], 
                    `<span class="badge" style="background:${themeColor}22; color:${themeColor}; margin-left:10px;">${project.archetype.toUpperCase()}</span>`, 
                    `<button class="btn btn-outline" onclick="location.hash='#/project/${projectId}/map'">🗺️ Mapa</button>
                     <button class="btn btn-outline" onclick="location.hash='#/project/${projectId}/accounting'">💰 Equity</button>
                     ${isProjectOwner ? `<button class="btn btn-outline" onclick="location.hash='#/project/${projectId}/edit'">⚙️ ADN</button>` : ''}`
                );
            }
        }, 0);

        return `
            <div class="container fade-in" style="max-width: 1200px; margin: 30px auto;">
                
                <div class="grid-layout" style="grid-template-columns: 1.8fr 1.2fr; gap: 30px;">
                    
                    <main>
                        <div style="display:flex; border-bottom:1px solid var(--border-color); margin-bottom:25px; gap:15px;">
                            <button class="dash-tab-btn" data-mode="inbox" data-pid="${projectId}" style="padding:10px; background:none; border:none; color:${dashboardDisplayMode==='inbox'?'var(--text-heading)':'var(--text-muted)'}; border-bottom:2px solid ${dashboardDisplayMode==='inbox'?themeColor:'transparent'}; font-weight:bold; cursor:pointer;">📥 Inbox de Valor</button>
                            <button class="dash-tab-btn" data-mode="analytics" data-pid="${projectId}" style="padding:10px; background:none; border:none; color:${dashboardDisplayMode==='analytics'?'var(--text-heading)':'var(--text-muted)'}; border-bottom:2px solid ${dashboardDisplayMode==='analytics'?themeColor:'transparent'}; font-weight:bold; cursor:pointer;">📈 Análisis Sistémico</button>
                        </div>

                        ${dashboardDisplayMode === 'inbox' ? `
                            <div style="display:flex; gap:10px; margin-bottom:20px;">
                                <button class="inbox-filter-btn" data-filter="pow" data-pid="${projectId}" style="padding:5px 12px; border-radius:20px; border:1px solid var(--border-color); background:${inboxFilterMode==='pow'?themeColor:'transparent'}; color:${inboxFilterMode==='pow'?'#000':'var(--text-muted)'}; cursor:pointer;">📝 Entregables (${pendingApprovals.length})</button>
                                <button class="inbox-filter-btn" data-filter="alerts" data-pid="${projectId}" style="padding:5px 12px; border-radius:20px; border:1px solid var(--border-color); background:${inboxFilterMode==='alerts'?'var(--accent-red)':'transparent'}; color:${inboxFilterMode==='alerts'?'#fff':'var(--text-muted)'}; cursor:pointer;">⚠️ Pings SOS (${activeAlerts.length})</button>
                            </div>

                            <div class="list-group">
                                ${inboxFilterMode === 'pow' ? (
                                    pendingApprovals.length === 0 ? `<p class="text-muted text-center" style="padding:40px;">No hay reportes pendientes.</p>` :
                                    pendingApprovals.map(tx => {
                                        const assignee = state.globalUsers.find(u => u.id === tx.assigneeId);
                                        return `
                                            <div class="panel-surface" style="margin-bottom:15px; border-left:4px solid ${themeColor};">
                                                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                                    <div>
                                                        <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">De: ${assignee?.name || tx.assigneeId}</div>
                                                        <h4 style="margin:5px 0;">${tx.entregable}</h4>
                                                        <div style="font-size:0.8rem; margin-bottom:10px;"><b>Reclama:</b> ${tx.realHours}h | <a href="${tx.proofLink}" target="_blank" style="color:${themeColor}">Ver Evidencia 🔗</a></div>
                                                    </div>
                                                    <div style="display:flex; gap:5px;">
                                                        <button class="btn btn-outline btn-dash-ai-audit" data-hash="${tx.hash}" data-pid="${projectId}">🤖 Audit</button>
                                                        <button class="btn btn-outline btn-dash-reject" data-hash="${tx.hash}" data-pid="${projectId}" style="color:var(--accent-red); border-color:var(--accent-red);">❌</button>
                                                        <button class="btn btn-primary btn-dash-approve" data-hash="${tx.hash}" data-pid="${projectId}" style="background:var(--accent-green); color:#000;">✅ Aprobar</button>
                                                    </div>
                                                </div>
                                                ${tx.aiAudit ? `<div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:8px; margin-top:10px; font-size:0.85rem; border:1px solid var(--accent-purple);"><b style="color:var(--accent-purple);">🤖 IA:</b> ${tx.aiAudit.analisis}</div>` : ''}
                                            </div>
                                        `;
                                    }).join('')
                                ) : (
                                    activeAlerts.length === 0 ? `<p class="text-muted text-center" style="padding:40px;">Sin alertas críticas.</p>` :
                                    activeAlerts.map(a => `
                                        <div class="panel-surface" style="border-left:4px solid var(--accent-red); margin-bottom:10px;">
                                            <p style="margin:0;">${a.message}</p>
                                            <button class="btn-resolve-alert" data-alert="${a.id}" data-pid="${projectId}" style="background:none; border:none; color:var(--accent-green); cursor:pointer; font-weight:bold; margin-top:5px;">Marcar como leído ✓</button>
                                        </div>
                                    `).join('')
                                )}
                            </div>
                        ` : `
                            <div class="panel-surface text-center" style="padding:60px;">
                                <h3>📊 Próximamente: Graph Analytics</h3>
                                <p class="text-muted">Visualiza el flujo de valor entre nodos en tiempo real.</p>
                            </div>
                        `}
                    </main>

                    <aside>
                        <div class="panel-surface" style="border-top:4px solid ${maturity.score > 70 ? 'var(--accent-green)' : 'var(--accent-gold)'}; margin-bottom:20px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                                <h4 style="margin:0;">Madurez Estructural</h4>
                                <span style="font-size:1.5rem; font-weight:800; color:${maturity.score > 70 ? 'var(--accent-green)' : 'var(--accent-gold)'}">${maturity.score}%</span>
                            </div>
                            <div style="height:8px; background:var(--bg-base); border-radius:10px; margin-bottom:15px;">
                                <div style="height:100%; width:${maturity.score}%; background:${maturity.score > 70 ? 'var(--accent-green)' : 'var(--accent-gold)'}; border-radius:10px; transition:0.5s;"></div>
                            </div>
                            ${maturity.alerts.length > 0 ? `
                                <div style="background:rgba(210,153,34,0.1); padding:10px; border-radius:6px; font-size:0.75rem; color:var(--accent-gold);">
                                    <b>💡 Tip de Diseño:</b><br>
                                    ${maturity.alerts.map(a => `<div style="margin-top:5px;">${a}</div>`).join('')}
                                </div>
                            ` : `<p style="font-size:0.75rem; color:var(--accent-green);">✅ Tu red tiene una estructura HUMA equilibrada.</p>`}
                        </div>

                        <div class="panel-surface" style="margin-bottom:20px;">
                            <h4 style="margin-bottom:15px;">Métricas de Salud</h4>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                                <div style="background:var(--bg-base); padding:10px; border-radius:8px; text-align:center;">
                                    <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase;">Resiliencia</div>
                                    <div style="font-size:1.2rem; font-weight:bold; color:var(--accent-blue);">${resilience}%</div>
                                </div>
                                <div style="background:var(--bg-base); padding:10px; border-radius:8px; text-align:center;">
                                    <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase;">Equity Total</div>
                                    <div style="font-size:1.1rem; font-weight:bold; color:var(--accent-green);">${totalSlices.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div class="panel" style="background:rgba(255,255,255,0.02); border-style:dashed;">
                            <h5 style="margin-top:0;">📚 Lección de Hoy</h5>
                            <p style="font-size:0.75rem; color:var(--text-muted); margin:0;">
                                El <b>${project.archetype.toUpperCase()}</b> requiere un equilibrio entre el aporte tangible (horas) e intangible (IP/Red). 
                                Asegúrate de que los roles @dosos estén auditando la calidad del PoW para evitar inflación de Slices.
                            </p>
                        </div>
                    </aside>

                </div>
            </div>
        `;
    }
};
