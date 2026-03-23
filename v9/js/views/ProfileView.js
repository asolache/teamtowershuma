// v9/js/views/ProfileView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { IdentityForge } from '../components/IdentityForge.js';

export default class ProfileView {
    constructor() {
        document.title = "Mi Espejo (Ikigai) | TeamTowers V9";
        this.forgeComponent = null;
    }

    async getHtml() {
        await store.init();
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);

        // Cálculo del Patrimonio Global (Slices)
        let totalGlobalSlices = 0;
        state.projects.forEach(p => {
            const harvest = store.calculateHarvest(p.id) || [];
            const myHarvest = harvest.find(h => h.userId === activeUserId || h.user === activeUserId);
            if (myHarvest && myHarvest.totalSlices > 0) {
                totalGlobalSlices += myHarvest.totalSlices;
            }
        });

        const headerConfig = {
            title: "Mi Espejo (Perfil & Ikigai)",
            subtitle: "Centro de Identidad Humana",
            tagline: "Define tu propósito, optimiza tu densidad semántica y conéctate al Meta-Grafo."
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-profile { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box; background: radial-gradient(circle at center, #111116 0%, #050505 100%);}
                
                .profile-container { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 2rem; padding-bottom: 5rem;}
                
                .stats-panel { display: flex; gap: 20px; flex-wrap: wrap;}
                .stat-card { flex: 1; min-width: 250px; background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.5rem; display: flex; align-items: center; gap: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);}
                .stat-icon { font-size: 3rem; background: rgba(0,0,0,0.5); width: 70px; height: 70px; display: flex; justify-content: center; align-items: center; border-radius: 16px; border: 1px solid #333;}
                .stat-info h4 { margin: 0 0 5px 0; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;}
                .stat-info .val { margin: 0; color: white; font-size: 2rem; font-weight: 900; font-family: var(--font-mono);}
                .stat-info .val.green { color: var(--accent-green); text-shadow: 0 0 15px rgba(0,230,118,0.3); }

                @media (max-width: 1024px) {
                    .workspace-profile { padding: 90px 1rem 120px 1rem; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/profile')}
                <main class="workspace-profile">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="profile-container">
                        <div class="stats-panel">
                            <div class="stat-card">
                                <div class="stat-icon" style="color:var(--accent-blue); border-color:var(--accent-blue); background:rgba(0,176,255,0.1);">👤</div>
                                <div class="stat-info">
                                    <h4>Identidad Activa</h4>
                                    <div class="val">${user ? user.name : 'Desconocido'}</div>
                                    <div style="color:#888; font-family:var(--font-mono); font-size:0.8rem;">${activeUserId}</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon" style="color:var(--accent-green); border-color:var(--accent-green); background:rgba(0,230,118,0.1);">💎</div>
                                <div class="stat-info">
                                    <h4>Patrimonio Global (Equity)</h4>
                                    <div class="val green">${Math.round(totalGlobalSlices).toLocaleString()}</div>
                                    <div style="color:#888; font-family:var(--font-mono); font-size:0.8rem;">Slices minadas en la red</div>
                                </div>
                            </div>
                        </div>

                        <div id="profileForgeMountPoint"></div>
                    </div>
                </main>
                ${BottomNav.getHtml('/profile')}
            </div>
        `;
    }

    async executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        const activeUserId = store.getState().session.activeUserId;

        // Montamos el Componente de Forja apuntando directamente al usuario actual
        this.forgeComponent = new IdentityForge('profileForgeMountPoint');
        await this.forgeComponent.render(activeUserId);

        // Escuchamos el evento de guardado para dar feedback
        window.addEventListener('identity-forged', (e) => {
            if (e.detail.id === activeUserId) {
                alert("✨ Tu Ikigai ha sido actualizado y optimizado en la red neuronal.");
                window.location.reload(); // Recargamos para actualizar el nombre en el Sidebar si cambió
            }
        });
    }
}
