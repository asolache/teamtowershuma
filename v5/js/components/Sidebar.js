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

        // CONTROL DE PERMISOS (Gobernanza del Ecosistema)
        const canCreate = role === 'ecosystem-owner' || (state.config && state.config.allowUserCreation);
        const createLink = canCreate ? `<a href="/v5/create" class="side-link ${activePath === '/create' ? 'active' : ''}" data-link>➕ Instanciar Red</a>` : '';

        // 1. SECCIÓN GLOBAL
        const globalSection = `
            <div class="side-section">
                <a href="/v5/" class="side-link ${activePath === '/' ? 'active' : ''}" data-link>🏠 Inicio Central</a>
                <a href="/v5/network" class="side-link ${activePath === '/network' ? 'active' : ''}" data-link>🌐 Red de DAOs</a>
                ${createLink}
                <a href="/v5/profile" class="side-link ${activePath === '/profile' ? 'active' : ''}" data-link>👤 Mi CV / Arquetipo</a>
            </div>
        `;

        // 2. SECCIÓN DE CONTEXTO (Si hay proyecto activo)
        let projectSection = '';
        if (project) {
            projectSection = `
                <div class="project-context-header">
                    <h3 title="${project.nombre}">${project.nombre}</h3>
                    <p>MODO: ${project.archetype ? project.archetype.toUpperCase() : 'STARTUP'}</p>
                </div>
                <div class="side-section">
                    <a href="/v5/dashboard" class="side-link ${activePath === '/dashboard' ? 'active' : ''}" data-link style="color: var(--accent-green);">🏠 Lobby del Proyecto</a>
                    <a href="/v5/project" class="side-link ${activePath === '/project' ? 'active' : ''}" data-link>📋 Kanban Tracción</a>
                    <a href="/v5/map" class="side-link ${activePath === '/map' ? 'active' : ''}" data-link>🕸️ Mapa de Valor</a>
                    <a href="/v5/team" class="side-link ${activePath === '/team' ? 'active' : ''}" data-link>👥 La Colla (Talento)</a>
                    <a href="/v5/ledger" class="side-link ${activePath === '/ledger' ? 'active' : ''}" data-link>⚖️ Ledger Equity</a>
                </div>
            `;
        }

        return `
            <style>
                .sidebar { width: 260px; background: rgba(15, 15, 20, 0.95); border-right: 1px solid var(--glass-border); padding: 2rem 1.5rem; display: flex; flex-direction: column; z-index: 100; flex-shrink: 0; overflow-y: auto; height: 100vh;}
                .sidebar .brand { font-weight: bold; font-family: var(--font-mono); color: white; margin-bottom: 2rem; font-size: 1.2rem; flex-shrink: 0; letter-spacing: -1px; }
                .sidebar .side-section { margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 4px;}
                .sidebar .side-link { padding: 0.8rem 1rem; border-radius: var(--border-radius-sm); cursor: pointer; color: var(--text-muted); text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s; border-left: 3px solid transparent; }
                .sidebar .side-link:hover { background: rgba(255,255,255,0.05); color: white; }
                .sidebar .side-link.active { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); font-weight: bold; border-left: 3px solid var(--accent-blue); }
                
                .sidebar .project-context-header { padding: 1rem; background: rgba(255,255,255,0.03); border-radius: var(--border-radius-md); border: 1px solid var(--glass-border); margin: 1rem 0; }
                .sidebar .project-context-header h3 { font-size: 0.9rem; margin: 0 0 5px 0; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .sidebar .project-context-header p { font-size: 0.65rem; color: var(--accent-green); text-transform: uppercase; font-weight: bold; margin: 0; letter-spacing: 1px;}
                
                .sidebar .sidebar-footer { margin-top: auto; border-top: 1px solid var(--glass-border); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 5px; }
                .sidebar .user-status { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 12px; border-radius: var(--border-radius-md); margin-top: 10px; border: 1px solid var(--glass-border);}
                
                .sidebar .btn-logout { background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; padding: 5px; border-radius: 6px;}
                .sidebar .btn-logout:hover { color: var(--accent-red); background: rgba(255, 82, 82, 0.1); }

                @media (max-width: 768px) {
                    .sidebar { width: 100%; height: auto; padding: 1rem; flex-direction: row; overflow-x: auto; flex-wrap: nowrap; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
                    .sidebar-footer { display: none; }
                }
            </style>

            <aside class="sidebar">
                <div class="brand">🗼 TeamTowers</div>
                
                ${globalSection}
                ${projectSection}
                
                <div class="sidebar-footer">
                    <a href="/v5/manifesto" class="side-link ${activePath === '/manifesto' ? 'active' : ''}" data-link style="color: var(--accent-purple); font-weight: bold;">📚 Códice SOS</a>
                    <a href="/v5/help" class="side-link ${activePath === '/help' ? 'active' : ''}" data-link style="color: #ffd740; font-weight: bold;">❓ Manual de Uso</a>
                    <a href="/v5/settings" class="side-link ${activePath === '/settings' ? 'active' : ''}" data-link>⚙️ Configuración</a>
                    
                    <div class="user-status">
                        <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                            <div style="width: 28px; height: 28px; background: var(--accent-blue); border-radius: 50%; display: flex; justify-content: center; align-items: center; color: black; font-weight: bold; font-size: 0.75rem; flex-shrink: 0;">${userDisplay.charAt(0).toUpperCase()}</div>
                            <div style="color: white; font-size: 0.8rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${userDisplay}">${userDisplay}</div>
                        </div>
                        <button class="btn-logout" id="globalBtnLogout" title="Desconectar">
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
    }
};
