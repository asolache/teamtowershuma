// v8/js/components/Sidebar.js
import { store } from '../core/store.js';

export const Sidebar = {
    getHtml: (currentPath = '') => {
        const state = store.getState();
        const role = state.session.role;
        const isCollapsed = localStorage.getItem('tt_sidebar_collapsed') === 'true';
        const collapsedClass = isCollapsed ? 'collapsed' : '';
        const arrowIcon = isCollapsed ? '→' : '←';

        // En V8, los agentes operan en segundo plano, el humano supervisa en el Dashboard
        return `
            <aside class="sidebar ${collapsedClass}" id="mainSidebar">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <a href="/v8/" data-link style="display: ${isCollapsed ? 'none' : 'flex'}; align-items: center; height: 40px; text-decoration: none;">
                        <span style="font-size: 1.5rem; filter: drop-shadow(0 0 10px rgba(0,176,255,0.5));">🗼</span>
                        <span style="color: white; font-weight: 900; margin-left: 10px; font-family: var(--font-mono); letter-spacing: -0.5px;">SOS v8</span>
                    </a>
                    <button id="btnToggleSidebar" style="background: transparent; border: 1px solid #333; color: white; border-radius: 6px; padding: 4px 8px; cursor: pointer; width: ${isCollapsed ? '100%' : 'auto'};">
                        ${arrowIcon}
                    </button>
                </div>
                
                <div style="margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 4px;">
                    <a href="/v8/" class="side-link ${currentPath === '/' ? 'active' : ''}" data-link title="Centro de Mando">
                        <span style="margin-right: 12px; font-size: 1.2rem;">🌐</span> <span>Ecosistema</span>
                    </a>
                    <a href="/v8/dashboard" class="side-link ${currentPath === '/dashboard' ? 'active' : ''}" data-link title="Supervisión IA">
                        <span style="margin-right: 12px; font-size: 1.2rem;">🛰️</span> <span>Dashboard</span>
                    </a>
                    <a href="/v8/project" class="side-link ${currentPath === '/project' ? 'active' : ''}" data-link title="Aprobación de Sprints">
                        <span style="margin-right: 12px; font-size: 1.2rem;">📋</span> <span>Kanban (PULL)</span>
                    </a>
                    <a href="/v8/ledger" class="side-link ${currentPath === '/ledger' ? 'active' : ''}" data-link title="Slicing Pie">
                        <span style="margin-right: 12px; font-size: 1.2rem;">⚖️</span> <span>Wallet</span>
                    </a>
                </div>
                
                <div style="margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 10px;">
                    <a href="/v8/profile" class="side-link ${currentPath === '/profile' ? 'active' : ''}" data-link title="Identidad Agentic">
                        <span style="margin-right: 12px; font-size: 1.2rem;">👤</span> <span>Mi ADN</span>
                    </a>
                    <button class="side-link" id="globalBtnLogout" title="Desconectar" style="width: 100%; text-align: left; background: transparent; border: none; color: var(--accent-red);">
                        <span style="margin-right: 12px; font-size: 1.2rem;">🚪</span> <span>Desconectar</span>
                    </button>
                </div>
            </aside>
        `;
    },

    initListeners: () => {
        document.getElementById('globalBtnLogout')?.addEventListener('click', () => {
            if(confirm('¿Suspender sesión del Nodo Humano? Los agentes seguirán procesando en Local.')) {
                store.dispatch({ type: 'LOGOUT_USER' });
                window.location.href = '/v8/';
            }
        });

        document.getElementById('btnToggleSidebar')?.addEventListener('click', () => {
            const sidebar = document.getElementById('mainSidebar');
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('tt_sidebar_collapsed', sidebar.classList.contains('collapsed') ? 'true' : 'false');
            window.location.reload();
        });
    }
};
