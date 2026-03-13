import { store } from '../core/store.js';

export const Sidebar = {
    getHtml: (currentPath = '') => {
        const state = store.getState();
        const { activeUserId, role } = state.session;
        let project = state.projects.find(p => p.id === localStorage.getItem('tt_active_project')) || state.projects[0];

        const isCollapsed = localStorage.getItem('tt_sidebar_collapsed') === 'true';
        const isPomodoroActive = localStorage.getItem('tt_active_pomodoro_tx') ? 'active-pomodoro' : '';

        return `
            <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" id="mainSidebar">
                <div class="sidebar-top-bar">
                    <a href="/v5/" class="brand" data-link><img src="/v5/logoteamtowers.png" alt="TeamTowers"></a>
                    <button class="btn-toggle-sidebar" id="btnToggleSidebar">${isCollapsed ? '→' : '←'}</button>
                </div>
                <div class="side-section">
                    <a href="/v5/" class="side-link ${currentPath === '/' ? 'active' : ''}" data-link><span class="icon">🌐</span> <span class="text">Ecosistema</span></a>
                </div>
                ${project ? `
                <div class="side-section" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
                    <a href="/v5/dashboard" class="side-link ${currentPath === '/dashboard' ? 'active' : ''}" data-link><span class="icon">🛰️</span> <span class="text">Dashboard</span></a>
                    <a href="/v5/map" class="side-link ${currentPath === '/map' ? 'active' : ''}" data-link><span class="icon">🕸️</span> <span class="text">Mapa VNA</span></a>
                    <a href="/v5/project" class="side-link ${currentPath === '/project' ? 'active' : ''}" data-link><span class="icon">📋</span> <span class="text">Kanban Pull</span></a>
                    <a href="/v5/focus" class="side-link ${currentPath === '/focus' ? 'active' : ''}" data-link><span class="icon ${isPomodoroActive}">🍅</span> <span class="text">Deep Work</span></a>
                    <a href="/v5/ledger" class="side-link ${currentPath === '/ledger' ? 'active' : ''}" data-link><span class="icon">⚖️</span> <span class="text">Wallet</span></a>
                </div>` : ''}
                <div class="sidebar-footer">
                    <a href="/v5/profile" class="side-link ${currentPath === '/profile' ? 'active' : ''}" data-link><span class="icon">👤</span> <span class="text">Identidad</span></a>
                    <button class="side-link" id="globalBtnLogout" style="background:transparent; border:none; width:100%; color:var(--accent-red);"><span class="icon">🚪</span> <span class="text">Salir</span></button>
                </div>
            </aside>
        `;
    },
    initListeners: () => {
        document.getElementById('btnToggleSidebar')?.addEventListener('click', () => {
            const sb = document.getElementById('mainSidebar');
            sb.classList.toggle('collapsed');
            localStorage.setItem('tt_sidebar_collapsed', sb.classList.contains('collapsed'));
            window.location.reload();
        });
        document.getElementById('globalBtnLogout')?.addEventListener('click', () => {
            if(confirm('¿Desconectar nodo?')) { store.dispatch({ type: 'LOGOUT_USER' }); window.location.href = '/v5/'; }
        });
    }
};
