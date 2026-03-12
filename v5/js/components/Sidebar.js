// v5/js/components/Sidebar.js
import { store } from '../core/store.js';

export const Sidebar = {
    getHtml: (currentPath = '') => {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const role = state.session.role;
        
        let pId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === pId);
        
        if (!project) {
            const userProjects = state.projects.filter(p => 
                role === 'ecosystem-owner' || 
                p.ownerId === activeUserId || 
                (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
            );
            project = userProjects.length > 0 ? userProjects[userProjects.length - 1] : null;
        }

        const isCollapsed = localStorage.getItem('tt_sidebar_collapsed') === 'true';
        const collapsedClass = isCollapsed ? 'collapsed' : '';
        const arrowIcon = isCollapsed ? '→' : '←';

        const globalSection = `
            <div class="side-section">
                <a href="/v5/" class="side-link ${currentPath === '/' ? 'active' : ''}" data-link title="Ecosistema (Centro de Mando)"><span class="icon">🌐</span> <span class="text">Ecosistema</span></a>
                <a href="/v5/profile" class="side-link ${currentPath === '/profile' ? 'active' : ''}" data-link title="Mi Perfil (CV)"><span class="icon">👤</span> <span class="text">Mi Perfil (CV)</span></a>
            </div>
        `;

        let projectSection = '';
        if (project) {
            const isPomodoroActive = localStorage.getItem('tt_active_pomodoro_tx') ? 'active-pomodoro' : '';

            // El Dashboard ahora está primero
            projectSection = `
                <div class="side-section" style="margin-top: 1rem; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 1rem;">
                    <a href="/v5/dashboard" class="side-link ${currentPath === '/dashboard' ? 'active' : ''}" data-link title="Dashboard de Red">
                        <span class="icon">🛰️</span> <span class="text">Dashboard</span>
                    </a>
                    <a href="/v5/project" class="side-link ${currentPath === '/project' ? 'active' : ''}" data-link title="Kanban Tareas">
                        <span class="icon">📋</span> <span class="text">Kanban Pull</span>
                    </a>
                    <a href="/v5/focus" class="side-link ${currentPath === '/focus' ? 'active' : ''}" data-link title="Deep Work Focus">
                        <span class="icon ${isPomodoroActive}">🍅</span> <span class="text">Deep Work</span>
                    </a>
                    <a href="/v5/ledger" class="side-link ${currentPath === '/ledger' ? 'active' : ''}" data-link title="Contabilidad y Slicing Pie">
                        <span class="icon">⚖️</span> <span class="text">Slicing Pie (Equity)</span>
                    </a>
                    <a href="/v5/map" class="side-link ${currentPath === '/map' ? 'active' : ''}" data-link title="Mapa de Valor VNA">
                        <span class="icon">🕸️</span> <span class="text">Mapa VNA</span>
                    </a>
                    <a href="/v5/team" class="side-link ${currentPath === '/team' ? 'active' : ''}" data-link title="Equipo / Nodos">
                        <span class="icon">👥</span> <span class="text">La Colla</span>
                    </a>
                </div>
            `;
        }

        return `
            <style>
                .sidebar { 
                    width: 260px; background: rgba(15, 15, 20, 0.95); border-right: 1px solid var(--glass-border); 
                    padding: 2rem 1.2rem; display: flex; flex-direction: column; z-index: 100; flex-shrink: 0; 
                    overflow-y: auto; height: 100vh; transition: width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), padding 0.3s;
                }
                
                .sidebar-top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                
                /* BRAND LOGO SIDEBAR */
                .sidebar .brand { display: flex; align-items: center; height: 40px; transition: opacity 0.2s; text-decoration: none; width: 100%;}
                .sidebar .brand img { height: 100%; width: auto; object-fit: contain; filter: brightness(0) invert(1); opacity: 0.9; transform-origin: left center;}
                
                .btn-toggle-sidebar { background: transparent; border: 1px solid #333; color: white; border-radius: 6px; padding: 4px 8px; cursor: pointer; transition: 0.2s; font-size: 1rem; font-family: monospace;}
                .btn-toggle-sidebar:hover { background: rgba(255,255,255,0.1); border-color: var(--accent-blue); color: var(--accent-blue);}

                .sidebar .side-section { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 4px;}
                .sidebar .side-link { 
                    padding: 0.8rem 1rem; border-radius: 8px; cursor: pointer; color: var(--text-muted); 
                    text-decoration: none; font-size: 0.9rem; display: flex; align-items: center; transition: all 0.2s; 
                    font-weight: 600; white-space: nowrap; overflow: hidden;
                }
                .sidebar .side-link .icon { margin-right: 12px; font-size: 1.2rem; flex-shrink: 0;}
                .sidebar .side-link .text { transition: opacity 0.2s; }
                
                .sidebar .side-link:hover { background: rgba(255,255,255,0.05); color: white; transform: translateX(3px);}
                .sidebar .side-link.active { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); }
                
                .active-pomodoro { animation: pulseTomato 1.5s infinite alternate; filter: drop-shadow(0 0 8px var(--accent-red)); }
                @keyframes pulseTomato { 0% { transform: scale(1); } 100% { transform: scale(1.2); } }
                
                .sidebar .sidebar-footer { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 10px; overflow: hidden; }
                
                /* MODO COLAPSADO */
                .sidebar.collapsed { width: 80px; padding: 2rem 0.8rem; align-items: center; }
                .sidebar.collapsed .brand { display: none; }
                .sidebar.collapsed .sidebar-top-bar { justify-content: center; width: 100%; margin-bottom: 2rem;}
                .sidebar.collapsed .side-link { padding: 0.8rem; justify-content: center; border-radius: 12px;}
                .sidebar.collapsed .side-link .icon { margin-right: 0; font-size: 1.4rem;}
                .sidebar.collapsed .side-link .text { display: none; }
                .sidebar.collapsed .sidebar-footer .text { display: none; }

                /* OCULTAR EN MÓVIL */
                @media (max-width: 768px) {
                    .sidebar { display: none !important; }
                }
            </style>
            
            <aside class="sidebar ${collapsedClass}" id="mainSidebar">
                <div class="sidebar-top-bar">
                    <a href="/v5/" class="brand" data-link>
                        <img src="/v5/logoteamtowers.png" alt="TeamTowers">
                    </a>
                    <button class="btn-toggle-sidebar" id="btnToggleSidebar" title="Colapsar / Expandir Menú">
                        <span id="btnToggleIcon">${arrowIcon}</span>
                    </button>
                </div>
                
                ${globalSection}
                ${projectSection}
                
                <div class="sidebar-footer">
                    ${role === 'ecosystem-owner' ? `
                        <a href="/v5/settings" class="side-link ${currentPath === '/settings' ? 'active' : ''}" data-link title="Configuración Ecosistema">
                            <span class="icon">⚙️</span> <span class="text">Configuración</span>
                        </a>
                    ` : ''}
                    <button class="side-link" id="globalBtnLogout" title="Desconectar" style="width:100%; text-align:left; background:transparent; border:none;">
                        <span class="icon">🚪</span> <span class="text">Desconectar</span>
                    </button>
                </div>
            </aside>
        `;
    },

    initListeners: () => {
        const btnLogout = document.getElementById('globalBtnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                if(confirm('¿Desconectar el Exoesqueleto y volver al portal público?')) {
                    store.dispatch({ type: 'LOGOUT_USER' });
                    window.location.href = '/v5/';
                }
            });
        }

        const btnToggle = document.getElementById('btnToggleSidebar');
        const sidebar = document.getElementById('mainSidebar');
        const iconToggle = document.getElementById('btnToggleIcon');
        
        if (btnToggle && sidebar && iconToggle) {
            btnToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                const isCollapsedNow = sidebar.classList.contains('collapsed');
                localStorage.setItem('tt_sidebar_collapsed', isCollapsedNow ? 'true' : 'false');
                iconToggle.innerText = isCollapsedNow ? '→' : '←';
            });
        }

        window.addEventListener('pomodoro_tick', () => {
            const icons = document.querySelectorAll('.sidebar .icon');
            icons.forEach(i => {
                if(i.innerText === '🍅') {
                    if (localStorage.getItem('tt_active_pomodoro_tx')) {
                        i.classList.add('active-pomodoro');
                    } else {
                        i.classList.remove('active-pomodoro');
                    }
                }
            });
        });
    }
};
