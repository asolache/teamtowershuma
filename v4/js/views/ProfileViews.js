// /v4/js/views/ProfileView.js
import { store } from '../core/store.js';

export const ProfileView = {
    render: (userId) => {
        const state = store.getState();
        const user = state.users.find(u => u.id === userId) || state.users[0];
        
        // Calcular impacto total del usuario en el sistema
        const userTxs = state.transactions.filter(tx => tx.rolId === user.id);
        const totalLiquidado = userTxs.reduce((sum, tx) => sum + tx.liquidación, 0);

        return `
            <div class="profile-card">
                <header>
                    <h1>Perfil FEVS: ${user.nombre}</h1>
                    <span class="user-id">${user.id}</span>
                </header>
                
                <div class="fevs-stats" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; margin:20px 0;">
                    <div class="stat"><b>F:</b> ${user.fevs.f} <br><small>Força</small></div>
                    <div class="stat"><b>E:</b> ${user.fevs.e} <br><small>Equilibri</small></div>
                    <div class="stat"><b>V:</b> ${user.fevs.v} <br><small>Valor</small></div>
                    <div class="stat"><b>S:</b> ${user.fevs.s} <br><small>Seny</small></div>
                </div>

                <div class="impact-summary" style="background: #1e293b; padding: 15px; border-radius: 8px;">
                    <h3>Capitalización de Valor</h3>
                    <p>Total Liquidado en el SOS: <strong>${totalLiquidado.toFixed(2)}€</strong></p>
                    <p>Memes de conocimiento generados: <strong>${userTxs.length}</strong></p>
                </div>
            </div>
        `;
    }
};
