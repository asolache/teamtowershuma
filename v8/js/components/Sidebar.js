// v8/js/components/Sidebar.js
import { store } from '../core/store.js';

export class Sidebar {
    static getHtml(currentPath = '') {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const isMin = localStorage.getItem('tt_sidebar_min') === 'true';
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        
        const activeUserName = activeUserId ? (state.globalUsers.find(u => u.id === activeUserId)?.name || activeUserId) : 'Guest';
        const projectLabel = project ? project.nombre : 'Radar VNA';

        const navItems = [
            { path: '/v8/dashboard', icon: '🏰', label: projectLabel },
            { path: '/v8/map', icon: '🕸️', label: 'Mapa Valor' },
            { path: '/v8/project', icon: '📋', label: 'Work Orders' },
            { path: '/v8/paper', icon: '📝', label: 'Entregables' },
            { path: '/v8/lms', icon: '🧠', label: 'Conocimiento' },
            { path: '/v8/agentes', icon: '👥', label: 'Agentes IA' },
            { path: '/v8/ledger', icon: '⚖️', label: 'Monedero' },
            { path: '/v8/pantheon', icon: '⚙️', label: 'Configuración' }
        ];

        let navHtml = '';
        navItems.forEach(item => {
            const isActive = currentPath === item.path.replace('/v8', '') ? 'active' : '';
            navHtml += `
                <a href="${item.path}" class="nav-item ${isActive}" data-link title="${item.label}">
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-label">${item.label}</span>
                </a>
            `;
        });

        return `
            <style>
                .sidebar { width: 260px; height: 100vh; background: var(--bg-panel); border-right: 1px solid var(--glass-border); display: flex; flex-direction: column; transition: width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); z-index: 100; position: relative;}
                .sidebar.minimized { width: 80px; }
                
                .sb-header { padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); }
                
                .sb-brand { color: white; font-weight: 900; font-size: 1.2rem; letter-spacing: -0.5px; white-space: nowrap; overflow: hidden; display: flex; align-items: center; gap: 10px; transition: opacity 0.2s;}
                .sidebar.minimized .sb-brand-text { display: none; }
                .sb-brand-icon { font-size: 1.5rem; }

                /* 🔥 El botón mágico de colapsar/expandir */
                .btn-collapse { background: transparent; border: none; color: #888; font-size: 1.2rem; cursor: pointer; transition: 0.3s; padding: 5px; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 8px;}
                .btn-collapse:hover { color: white; background: rgba(255,255,255,0.1); }
                .sidebar.minimized .btn-collapse { transform: rotate(180deg); margin: 0 auto; }
                
                .sb-nav { flex: 1; padding: 1.5rem 0; display: flex; flex-direction: column; gap: 5px; overflow-y: auto; overflow-x: hidden;}
                
                .nav-item { display: flex; align-items: center; padding: 12px 1.5rem; color: #aaa; text-decoration: none; transition: 0.2s; white-space: nowrap; border-left: 3px solid transparent;}
                .nav-item:hover { background: rgba(255,255,255,0.03); color: white; }
                .nav-item.active { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border-left-color: var(--accent-blue); font-weight: bold;}
                
                .nav-icon { font-size: 1.2rem; min-width: 35px; text-align: center; transition: 0.3s;}
                .sidebar.minimized .nav-item { padding: 12px 0; justify-content: center; border-left: none; }
                .sidebar.minimized .nav-item.active { border-left: 3px solid var(--accent-blue); }
                .sidebar.minimized .nav-label { display: none; }
                
                .sb-footer { padding: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 15px; white-space: nowrap; overflow: hidden;}
                .sidebar.minimized .sb-footer { justify-content: center; padding: 1.5rem 0; }
                .sb-avatar { width: 35px; height: 35px; border-radius: 50%; background: var(--accent-purple); color: white; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 1rem; flex-shrink: 0;}
                .sb-user-info { display: flex; flex-direction: column; overflow: hidden; }
                .sidebar.minimized .sb-user-info { display: none; }
                .sb-user-name { color: white; font-weight: bold; font-size: 0.9rem; text-overflow: ellipsis; overflow: hidden; }
                .sb-user-role { color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }

                @media (max-width: 768px) {
                    .sidebar { display: none; } /* En móvil se usa el BottomNav */
                }
            </style>

            <nav class="sidebar ${isMin ? 'minimized' : ''}" id="mainSidebar">
                <div class="sb-header">
                    <div class="sb-brand">
                        <span class="sb-brand-icon">🏰</span>
                        <span class="sb-brand-text">TeamTowers</span>
                    </div>
                    <button class="btn-collapse" id="btnToggleSidebar" title="Colapsar menú">
                        ◀
                    </button>
                </div>
                
                <div class="sb-nav">
                    ${navHtml}
                </div>

                <div class="sb-footer">
                    <div class="sb-avatar">${activeUserName.charAt(0).toUpperCase()}</div>
                    <div class="sb-user-info">
                        <span class="sb-user-name">${activeUserName}</span>
                        <span class="sb-user-role">${state.session.role.replace('-',' ')}</span>
                    </div>
                </div>
            </nav>
        `;
    }

    static initListeners() {
        const btnToggle = document.getElementById('btnToggleSidebar');
        const sidebar = document.getElementById('mainSidebar');
        
        if (btnToggle && sidebar) {
            btnToggle.addEventListener('click', () => {
                sidebar.classList.toggle('minimized');
                const isMin = sidebar.classList.contains('minimized');
                localStorage.setItem('tt_sidebar_min', isMin);
            });
        }
    }
}
