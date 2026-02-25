import { store } from '../core/store.js';

export const ContributorProfileView = {
    render: (projectId, userId) => {
        const state = store.getState();
        const user = state.globalUsers.find(u => u.id === userId);

        if (!user) return `<div class="container"><h2>Usuario no encontrado en la red global.</h2></div>`;

        // 🧠 ESCANEO GLOBAL: Buscamos al usuario en todos los proyectos
        let globalTotalValue = 0;
        let globalTotalHours = 0;
        const projectContributions = [];

        state.projects.forEach(p => {
            const userEntries = (p.ledger || []).filter(l => l.userId === userId);
            if (userEntries.length > 0) {
                const pValue = userEntries.reduce((acc, l) => acc + (l.valorCongelado || 0), 0);
                const pHours = userEntries.reduce((acc, l) => acc + parseFloat(l.horas || 0), 0);
                
                globalTotalValue += pValue;
                globalTotalHours += pHours;
                
                projectContributions.push({
                    projectName: p.nombre,
                    projectId: p.id,
                    value: pValue,
                    hours: pHours,
                    entries: userEntries
                });
            }
        });

        return `
            <div class="container fade-in">
                <header style="margin-bottom: 30px;">
                    <a href="#/user-dashboard" style="color: var(--accent-blue); text-decoration: none;">← Volver al Portal de Usuarios</a>
                    
                    <div style="background: var(--bg-panel); border: 1px solid var(--accent-purple); border-radius: 16px; padding: 30px; margin-top: 20px; display: flex; align-items: center; gap: 25px;">
                        <div style="width: 70px; height: 70px; background: var(--accent-purple); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white;">
                            ${user.name.charAt(0)}
                        </div>
                        <div style="flex-grow: 1;">
                            <h1 style="margin:0;">${user.name}</h1>
                            <code style="color: var(--accent-blue); font-size: 1.2rem;">${user.id}</code>
                        </div>
                        <div style="text-align: right;">
                            <div class="text-muted text-small text-uppercase">Net Worth en la Red</div>
                            <div style="color: var(--accent-gold); font-size: 2.2rem; font-weight: bold;">${globalTotalValue.toLocaleString()} €</div>
                        </div>
                    </div>
                </header>

                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px;">
                    <aside>
                        <div class="panel">
                            <h3>📊 Resumen de Actividad</h3>
                            <div class="text-muted" style="margin-bottom: 15px;">Participación en <b>${projectContributions.length}</b> proyectos.</div>
                            <div style="font-size: 1.1rem;">Tiempo total auditado: <b style="color: var(--accent-blue);">${globalTotalHours.toFixed(1)}h</b></div>
                            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 20px 0;">
                            <div class="text-small text-muted">ID de Certificación:</div>
                            <code style="font-size: 0.7rem; word-break: break-all; opacity: 0.6;">${user.wallet || 'No Linked Wallet'}</code>
                        </div>
                    </aside>

                    <main>
                        <h3>🏢 Desglose por Ecosistemas</h3>
                        ${projectContributions.map(pc => `
                            <div class="panel-surface" style="margin-bottom: 15px; border-left: 4px solid var(--accent-blue);">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <h4 style="margin:0;">${pc.projectName}</h4>
                                    <a href="#/project/${pc.projectId}" style="font-size: 0.7rem; color: var(--accent-blue);">Ver Mapa →</a>
                                </div>
                                <div style="display: flex; gap: 20px; margin-top: 10px;">
                                    <div>
                                        <div class="text-small text-muted text-uppercase">Equity</div>
                                        <div style="color: var(--accent-gold); font-weight: bold;">${pc.value.toLocaleString()} €</div>
                                    </div>
                                    <div>
                                        <div class="text-small text-muted text-uppercase">Horas</div>
                                        <div style="color: var(--text-heading);">${pc.hours.toFixed(1)}h</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </main>
                </div>
            </div>`;
    }
};
