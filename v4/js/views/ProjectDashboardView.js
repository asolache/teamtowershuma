import { store } from '../core/store.js';

// EVENTOS DEL DASHBOARD
document.addEventListener('click', (e) => {
    // Aprobar PoW desde el Dashboard
    if (e.target.classList.contains('btn-dash-approve')) {
        const txHash = e.target.getAttribute('data-hash');
        const projectId = e.target.getAttribute('data-pid');
        
        if (confirm("¿Consolidar este Proof of Work en el Ledger? Esto generará Slices de Equity irrefutables.")) {
            store.dispatch({ type: 'APPROVE_TRANSACTION', payload: { projectId, txHash } });
            document.getElementById('app').innerHTML = ProjectDashboardView.render(projectId);
        }
    }
});

export const ProjectDashboardView = {
    render: (projectId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        if (!project) return `<div class="container"><h2>Proyecto no encontrado</h2></div>`;

        // Analítica Médica (Salud)
        const txs = project.transactions || [];
        const resilience = store.calculateResilience(projectId);
        const pendingApprovals = txs.filter(tx => tx.status === 'reported');
        const bottlenecks = txs.filter(tx => tx.status === 'theoretical' || tx.status === 'pinged').length;
        
        let totalFrozen = 0;
        (project.ledger || []).forEach(l => totalFrozen += l.valorCongelado);

        // 🚀 API DE NAVEGACIÓN (Breadcrumbs y Toolbar vacía porque este es el hub)
        setTimeout(() => window.setNavbar(
            [
                { label: '🏠 Hub', hash: '#/' },
                { label: project.nombre, hash: `#/project/${projectId}` },
                { label: 'Panel de Control PO' }
            ], 
            ``, `` // Sin botones extra en el hub
        ), 0);

        return `
            <div class="container fade-in">
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div class="panel-surface" style="border-top: 4px solid var(--accent-green); text-align: center;">
                        <div class="text-muted text-small text-uppercase">Slices Congelados (Equity)</div>
                        <div style="font-size: 2rem; font-weight: bold; color: var(--text-heading);">${totalFrozen.toLocaleString()}</div>
                    </div>
                    <div class="panel-surface" style="border-top: 4px solid var(--accent-blue); text-align: center;">
                        <div class="text-muted text-small text-uppercase">Resiliencia (Auditoría QA)</div>
                        <div style="font-size: 2rem; font-weight: bold; color: ${resilience < 50 ? 'var(--accent-red)' : 'var(--accent-blue)'};">${resilience}%</div>
                    </div>
                    <div class="panel-surface" style="border-top: 4px solid var(--accent-purple); text-align: center;">
                        <div class="text-muted text-small text-uppercase">Cuellos de Botella (Trombos)</div>
                        <div style="font-size: 2rem; font-weight: bold; color: var(--accent-purple);">${bottlenecks}</div>
                    </div>
                </div>

                <div class="grid-layout" style="grid-template-columns: 2fr 1fr;">
                    
                    <main>
                        <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                            📥 Bandeja de Aprobaciones
                            ${pendingApprovals.length > 0 ? `<span class="badge" style="background: var(--accent-blue);">${pendingApprovals.length} PoW Pendientes</span>` : ''}
                        </h3>

                        ${pendingApprovals.length === 0 ? `
                            <div class="panel text-center" style="border-style: dashed;">
                                <div style="font-size: 2rem; opacity: 0.3;">✅</div>
                                <h4 style="margin: 10px 0 0 0; color: var(--text-muted);">Todo al día</h4>
                                <p class="text-small text-muted">No hay Proof of Works pendientes de auditar.</p>
                            </div>
                        ` : `
                            <div class="list-group">
                                ${pendingApprovals.map(tx => {
                                    const rFrom = project.roles.find(r => r.id === tx.from);
                                    const assignee = state.globalUsers.find(u => u.id === tx.assigneeId);
                                    
                                    return `
                                    <div class="panel-surface" style="margin-bottom: 15px; border-left: 4px solid var(--accent-blue);">
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                            <div>
                                                <div class="text-small text-muted" style="text-transform:uppercase;">Entregable de ${assignee ? assignee.name : 'Usuario'}</div>
                                                <h4 style="margin:0; font-size:1.1rem;">${tx.entregable}</h4>
                                            </div>
                                            <span class="badge" style="background:rgba(88,166,255,0.1); color:var(--accent-blue);">Reclama: ${tx.realHours}h</span>
                                        </div>
                                        
                                        <div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:6px; margin-bottom:15px; font-size:0.85rem;">
                                            <b>🔗 Enlace PoW:</b> <a href="${tx.proofLink}" target="_blank" style="color:var(--accent-blue);">${tx.proofLink}</a>
                                            ${tx.reportComment ? `<div style="margin-top:5px; color:var(--text-muted);"><i>"${tx.reportComment}"</i></div>` : ''}
                                        </div>

                                        <button class="btn btn-primary btn-block btn-dash-approve" data-hash="${tx.hash}" data-pid="${project.id}">
                                            Auditar y Sellar Ledger 💾
                                        </button>
                                    </div>`;
                                }).join('')}
                            </div>
                        `}
                    </main>

                    <aside>
                        <h3 style="margin-bottom: 20px;">🧭 Navegación</h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            
                            <a href="#/project/${projectId}/map" style="text-decoration:none;">
                                <div class="panel-surface" style="padding:15px; transition:0.2s; border:1px solid var(--border-color); display:flex; align-items:center; gap:15px;" onmouseover="this.style.borderColor='var(--accent-blue)'" onmouseout="this.style.borderColor='var(--border-color)'">
                                    <div style="font-size:1.5rem;">🗺️</div>
                                    <div><b style="color:var(--text-heading); display:block;">1. Mapa de Valor (VNA)</b><span style="font-size:0.75rem; color:var(--text-muted);">Diseña flujos y asigna Pings</span></div>
                                </div>
                            </a>

                            <a href="#/project/${projectId}/accounting" style="text-decoration:none;">
                                <div class="panel-surface" style="padding:15px; transition:0.2s; border:1px solid var(--border-color); display:flex; align-items:center; gap:15px;" onmouseover="this.style.borderColor='var(--accent-green)'" onmouseout="this.style.borderColor='var(--border-color)'">
                                    <div style="font-size:1.5rem;">💰</div>
                                    <div><b style="color:var(--text-heading); display:block;">2. Contabilidad Slicing Pie</b><span style="font-size:0.75rem; color:var(--text-muted);">Ver Ledger y Cap Table</span></div>
                                </div>
                            </a>

                            <a href="#/project/${projectId}/accounting" style="text-decoration:none;">
                                <div class="panel-surface" style="padding:15px; transition:0.2s; border:1px solid var(--border-color); display:flex; align-items:center; gap:15px;" onmouseover="this.style.borderColor='var(--accent-purple)'" onmouseout="this.style.borderColor='var(--border-color)'">
                                    <div style="font-size:1.5rem;">👥</div>
                                    <div><b style="color:var(--text-heading); display:block;">3. Añadir / Asignar Usuarios</b><span style="font-size:0.75rem; color:var(--text-muted);">Vincular nodos humanos</span></div>
                                </div>
                            </a>

                            <a href="#/project/${projectId}/edit" style="text-decoration:none;">
                                <div class="panel-surface" style="padding:15px; transition:0.2s; border:1px solid var(--border-color); display:flex; align-items:center; gap:15px;" onmouseover="this.style.borderColor='var(--accent-gold)'" onmouseout="this.style.borderColor='var(--border-color)'">
                                    <div style="font-size:1.5rem;">⚙️</div>
                                    <div><b style="color:var(--text-heading); display:block;">4. Editar Ontología</b><span style="font-size:0.75rem; color:var(--text-muted);">Modificar roles y multiplicadores</span></div>
                                </div>
                            </a>

                        </div>
                    </aside>

                </div>
            </div>
        `;
    }
};
