// v5/js/components/Sidebar.js
import { store } from '../core/store.js';

export const Sidebar = {
    getHtml: (activePath = '') => {
        const state = store.getState();
        const project = state.projects[state.projects.length - 1];
        
        const activeUserId = state.session.activeUserId;
        const role = state.session.role;
        let userDisplay = activeUserId || 'Invitado';
        
        if (activeUserId) {
            const u = state.globalUsers.find(x => x.id === activeUserId);
            if (u) userDisplay = u.name;
        }

        // Recuperar preferencia de colapso del usuario
        const isCollapsed = localStorage.getItem('tt_sidebar_collapsed') === 'true';
        const collapsedClass = isCollapsed ? 'collapsed' : '';

        // CONTROL DE PERMISOS
        const canCreate = role === 'ecosystem-owner' || (state.config && state.config.allowUserCreation);
        const createLink = canCreate ? `<a href="/v5/create" class="side-link ${activePath === '/create' ? 'active' : ''}" data-link title="Instanciar Red"><span class="icon">➕</span> <span class="text">Instanciar Red</span></a>` : '';

        // 1. SECCIÓN GLOBAL
        const globalSection = `
            <div class="side-section">
                <a href="/v5/" class="side-link ${activePath === '/' ? 'active' : ''}" data-link title="Inicio Central"><span class="icon">🏠</span> <span class="text">Inicio Central</span></a>
                <a href="/v5/network" class="side-link ${activePath === '/network' ? 'active' : ''}" data-link title="Red de DAOs"><span class="icon">🌐</span> <span class="text">Red de DAOs</span></a>
                ${createLink}
                <a href="/v5/profile" class="side-link ${activePath === '/profile' ? 'active' : ''}" data-link title="Mi CV / Arquetipo"><span class="icon">👤</span> <span class="text">Mi CV / Arquetipo</span></a>
            </div>
        `;

        // 2. SECCIÓN DE CONTEXTO (Si hay proyecto activo)
        let projectSection = '';
        if (project) {
            projectSection = `
                <div class="project-context-header" title="${project.nombre}">
                    <h3 class="text">${project.nombre}</h3>
                    <p class="text">MODO: ${project.archetype ? project.archetype.toUpperCase() : 'STARTUP'}</p>
                    <span class="icon-only" style="display:none; text-align:center; font-size:1.2rem; margin:10px 0;">🏰</span>
                </div>
                <div class="side-section">
                    <a href="/v5/dashboard" class="side-link ${activePath === '/dashboard' ? 'active' : ''}" data-link title="Lobby del Proyecto" style="color: var(--accent-green);">
                        <span class="icon">🏠</span> <span class="text">Lobby del Proyecto</span>
                    </a>
                    <a href="/v5/project" class="side-link ${activePath === '/project' ? 'active' : ''}" data-link title="Kanban Tracción">
                        <span class="icon">📋</span> <span class="text">Kanban Tracción</span>
                    </a>
                    <a href="/v5/map" class="side-link ${activePath === '/map' ? 'active' : ''}" data-link title="Mapa de Valor">
                        <span class="icon">🕸️</span> <span class="text">Mapa de Valor</span>
                    </a>
                    <a href="/v5/team" class="side-link ${activePath === '/team' ? 'active' : ''}" data-link title="La Colla (Talento)">
                        <span class="icon">👥</span> <span class="text">La Colla (Talento)</span>
                    </a>
                    <a href="/v5/ledger" class="side-link ${activePath === '/ledger' ? 'active' : ''}" data-link title="Ledger Equity">
                        <span class="icon">⚖️</span> <span class="text">Ledger Equity</span>
                    </a>
                </div>
            `;
        }

        return `
            <style>
                .sidebar { 
                    width: 280px; background: rgba(15, 15, 20, 0.95); border-right: 1px solid var(--glass-border); 
                    padding: 2rem 1.5rem; display: flex; flex-direction: column; z-index: 100; flex-shrink: 0; 
                    overflow-y: auto; height: 100vh; transition: width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), padding 0.3s;
                }
                
                .sidebar-top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .sidebar .brand { font-weight: bold; font-family: var(--font-mono); color: white; font-size: 1.2rem; letter-spacing: -1px; white-space: nowrap; transition: opacity 0.2s;}
                
                .btn-toggle-sidebar { background: transparent; border: 1px solid #333; color: white; border-radius: 6px; padding: 5px 8px; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; }
                .btn-toggle-sidebar:hover { background: rgba(255,255,255,0.1); border-color: var(--accent-blue); }

                .sidebar .side-section { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 4px;}
                .sidebar .side-link { 
                    padding: 0.8rem 1rem; border-radius: var(--border-radius-sm); cursor: pointer; color: var(--text-muted); 
                    text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; transition: all 0.2s; 
                    border-left: 3px solid transparent; white-space: nowrap; overflow: hidden;
                }
                .sidebar .side-link .icon { margin-right: 12px; font-size: 1.1rem; flex-shrink: 0;}
                .sidebar .side-link .text { transition: opacity 0.2s; }
                
                .sidebar .side-link:hover { background: rgba(255,255,255,0.05); color: white; }
                .sidebar .side-link.active { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); font-weight: bold; border-left: 3px solid var(--accent-blue); }
                
                .sidebar .project-context-header { padding: 1rem; background: rgba(255,255,255,0.03); border-radius: var(--border-radius-md); border: 1px solid var(--glass-border); margin: 1rem 0; overflow: hidden;}
                .sidebar .project-context-header h3 { font-size: 0.9rem; margin: 0 0 5px 0; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .sidebar .project-context-header p { font-size: 0.65rem; color: var(--accent-green); text-transform: uppercase; font-weight: bold; margin: 0; letter-spacing: 1px; white-space: nowrap;}
                
                .sidebar .sidebar-footer { margin-top: auto; border-top: 1px solid var(--glass-border); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 5px; overflow: hidden; }
                .sidebar .user-status { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 12px; border-radius: var(--border-radius-md); margin-top: 10px; border: 1px solid var(--glass-border);}
                
                .sidebar .btn-logout { background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; padding: 5px; border-radius: 6px;}
                .sidebar .btn-logout:hover { color: var(--accent-red); background: rgba(255, 82, 82, 0.1); }

                /* =========================================
                   MODO COLAPSADO (DESKTOP)
                   ========================================= */
                .sidebar.collapsed { width: 80px; padding: 2rem 0.8rem; align-items: center; }
                .sidebar.collapsed .brand { display: none; }
                .sidebar.collapsed .sidebar-top-bar { justify-content: center; width: 100%; margin-bottom: 2rem;}
                
                .sidebar.collapsed .side-link { padding: 0.8rem; justify-content: center; border-radius: 12px;}
                .sidebar.collapsed .side-link .icon { margin-right: 0; font-size: 1.3rem;}
                .sidebar.collapsed .side-link .text { display: none; }
                
                .sidebar.collapsed .project-context-header { padding: 0; background: transparent; border: none; margin: 0.5rem 0; width: 100%; display: flex; justify-content: center;}
                .sidebar.collapsed .project-context-header .text { display: none; }
                .sidebar.collapsed .project-context-header .icon-only { display: block !important; }
                
                .sidebar.collapsed .sidebar-footer .text { display: none; }
                .sidebar.collapsed .user-status { padding: 10px; justify-content: center; flex-direction: column; gap: 10px;}
                .sidebar.collapsed .user-status .text-name { display: none; }

                /* =========================================
                   RESPONSIVE MOBILE
                   ========================================= */
                @media (max-width: 768px) {
                    .sidebar { width: 100%; height: auto; padding: 1rem; flex-direction: row; overflow-x: auto; flex-wrap: nowrap; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); transition: none; align-items: center; gap: 15px;}
                    .sidebar-top-bar { display: none; } /* Ocultamos logo y hamburguesa en barra inferior/superior móvil */
                    .sidebar .side-section { flex-direction: row; margin-bottom: 0; gap: 10px;}
                    .sidebar .project-context-header { display: none; }
                    .sidebar-footer { display: none; }
                    .sidebar .side-link .text { display: none; } /* Solo iconos en móvil */
                    .sidebar .side-link .icon { margin-right: 0; font-size: 1.3rem;}
                    .sidebar.collapsed { width: 100%; padding: 1rem; }
                }
            </style>

            <aside class="sidebar ${collapsedClass}" id="mainSidebar">
                <div class="sidebar-top-bar">
                    <div class="brand">🗼 TeamTowers</div>
                    <button class="btn-toggle-sidebar" id="btnToggleSidebar" title="Colapsar / Expandir Menú">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                </div>
                
                ${globalSection}
                ${projectSection}
                
                <div class="sidebar-footer">
                    <a href="/v5/manifesto" class="side-link ${activePath === '/manifesto' ? 'active' : ''}" data-link title="Códice SOS" style="color: var(--accent-purple); font-weight: bold;">
                        <span class="icon">📚</span> <span class="text">Códice SOS</span>
                    </a>
                    <a href="/v5/help" class="side-link ${activePath === '/help' ? 'active' : ''}" data-link title="Manual de Uso" style="color: #ffd740; font-weight: bold;">
                        <span class="icon">❓</span> <span class="text">Manual de Uso</span>
                    </a>
                    <a href="/v5/settings" class="side-link ${activePath === '/settings' ? 'active' : ''}" data-link title="Configuración">
                        <span class="icon">⚙️</span> <span class="text">Configuración</span>
                    </a>
                    
                    <div class="user-status" title="${userDisplay}">
                        <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                            <div style="width: 28px; height: 28px; background: var(--accent-blue); border-radius: 50%; display: flex; justify-content: center; align-items: center; color: black; font-weight: bold; font-size: 0.75rem; flex-shrink: 0;">${userDisplay.charAt(0).toUpperCase()}</div>
                            <div class="text-name text" style="color: white; font-size: 0.8rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${userDisplay}</div>
                        </div>
                        <button class="btn-logout" id="globalBtnLogout" title="Desconectar / Logout">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </div>
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
        
        if (btnToggle && sidebar) {
            btnToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                const isCollapsedNow = sidebar.classList.contains('collapsed');
                localStorage.setItem('tt_sidebar_collapsed', isCollapsedNow ? 'true' : 'false');
            });
        }
    }
};
