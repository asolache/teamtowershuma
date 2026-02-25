import { store } from '../core/store.js';

export const ContributorProfileView = {
    render: (projectId, userId) => {
        const state = store.getState();
        const project = state.projects.find(p => p.id === projectId);
        const user = state.globalUsers.find(u => u.id === userId);

        if (!project || !user) return `<div class="container"><h2>Usuario o Proyecto no encontrado</h2></div>`;

        // Filtrar historial del usuario en este proyecto
        const userLedger = (project.ledger || []).filter(l => l.userId === userId);
        const totalValue = userLedger.reduce((acc, l) => acc + (l.valorCongelado || 0), 0);
        const totalHours = userLedger.reduce((acc, l) => acc + parseFloat(l.horas || 0), 0);

        // Calcular % de participación
        const totalProjectPie = (project.ledger || []).reduce((acc, l) => acc + (l.valorCongelado || 0), 0);
        const ownership = totalProjectPie > 0 ? ((totalValue / totalProjectPie) * 100).toFixed(2) : 0;

        return `
            <div class="container">
                <header style="margin-bottom: 30px;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">
                        <a href="#/project/${projectId}/accounting" style="color: var(--accent-blue); text-decoration: none;">← Volver a Contabilidad</a>
                    </div>
                    
                    <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 16px; padding: 30px; display: flex; align-items: center; gap: 25px;">
                        <div style="width: 80px; height: 80px; background: var(--accent-purple); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; color: white; box-shadow: 0 0 20px rgba(163, 113, 247, 0.3);">
                            ${user.name.charAt(0)}
                        </div>
                        <div style="flex-grow: 1;">
                            <h1 style="margin: 0; color: var(--text-heading);">${user.name}</h1>
                            <div style="font-family: monospace; color: var(--accent-blue); font-size: 1.1rem;">${user.id}</div>
                            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px;">
                                🌐 Wallet/Social: <span style="color: var(--text-main);">${user.wallet || 'No vinculada'}</span>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div class="badge" style="background: rgba(63, 185, 80, 0.1); color: var(--accent-green); padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; border: 1px solid var(--accent-green);">Contribuidor Activo</div>
                        </div>
                    </div>
                </header>

                <div class="grid-layout" style="grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                    <div class="panel-surface" style="text-align: center; border-bottom: 3px solid var(--accent-gold);">
                        <div class="text-muted text-small text-uppercase">Participación</div>
                        <div style="font-size: 2.5rem; font-weight: bold; color: var(--accent-gold);">${ownership}%</div>
                    </div>
                    <div class="panel-surface" style="text-align: center; border-bottom: 3px solid var(--accent-blue);">
                        <div class="text-muted text-small text-uppercase">Valor Generado</div>
                        <div style="font-size: 2.5rem; font-weight: bold; color: var(--accent-blue);">${totalValue.toLocaleString()}€</div>
                    </div>
                    <div class="panel-surface" style="text-align: center; border-bottom: 3px solid var(--accent-purple);">
                        <div class="text-muted text-small text-uppercase">Horas Totales</div>
                        <div style="font-size: 2.5rem; font-weight: bold; color: var(--accent-purple);">${totalHours.toFixed(1)}h</div>
                    </div>
                </div>

                <div class="panel">
                    <h3 style="margin-top: 0;">📜 Registro de Aportaciones</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-size: 0.8rem;">
                                    <th style="padding: 10px;">FECHA</th>
                                    <th style="padding: 10px;">DESCRIPCIÓN</th>
                                    <th style="padding: 10px;">ROL</th>
                                    <th style="padding: 10px; text-align: right;">VALOR (€)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${userLedger.length === 0 ? '<tr><td colspan="4" style="padding:20px; text-align:center;">No hay registros aún.</td></tr>' : 
                                    userLedger.slice().reverse().map(l => `
                                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                        <td style="padding: 12px 10px; font-size: 0.85rem; color: var(--text-muted);">${new Date(l.timestamp).toLocaleDateString()}</td>
                                        <td style="padding: 12px 10px; font-weight: 500;">${l.description}</td>
                                        <td style="padding: 12px 10px; font-size: 0.85rem; color: var(--accent-purple);">${project.roles.find(r => r.id === l.roleId)?.name || 'N/A'}</td>
                                        <td style="padding: 12px 10px; text-align: right; color: var(--accent-green); font-weight: bold;">+${l.valorCongelado.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
};
