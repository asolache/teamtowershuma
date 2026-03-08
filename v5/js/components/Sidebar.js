// v5/js/components/Sidebar.js
import { store } from '../core/store.js';

export const Sidebar = {
    getHtml: (activePath) => {
        const state = store.getState();
        const activeProject = state.projects[state.projects.length - 1];
        
        // 1. Enlaces Globales (Siempre visibles)
        const globalLinks = `
            <div class="side-section">
                <a href="/v5/" class="side-link ${activePath === '/' ? 'active' : ''}" data-link>🏠 Inicio Central</a>
                <a href="/v5/network" class="side-link ${activePath === '/network' ? 'active' : ''}" data-link>🌐 Explorar DAOs</a>
                <a href="/v5/create" class="side-link ${activePath === '/create' ? 'active' : ''}" data-link>➕ Instanciar Red</a>
                <a href="/v5/profile" class="side-link ${activePath === '/profile' ? 'active' : ''}" data-link>👤 Mi CV / Skills</a>
            </div>
        `;

        // 2. Enlaces Contextuales (Solo si hay un proyecto instanciado)
        let projectLinks = '';
        if (activeProject) {
            projectLinks = `
                <div class="project-context-header" style="margin-top: 1rem;">
                    <h3 title="${activeProject.nombre}">${activeProject.nombre}</h3>
                    <p>MODO: ${activeProject.archetype.toUpperCase()}</p>
                </div>
                <div class="side-section">
                    <a href="/v5/project" class="side-link ${activePath === '/project' ? 'active' : ''}" data-link>📋 Kanban (Tracción)</a>
                    <a href="/v5/map" class="side-link ${activePath === '/map' ? 'active' : ''}" data-link>🕸️ Mapa VNA</a>
                    <a href="/v5/team" class="side-link ${activePath === '/team' ? 'active' : ''}" data-link>👥 Tripulación</a>
                    <a href="/v5/ledger" class="side-link ${activePath === '/ledger' ? 'active' : ''}" data-link>⚖️ Ledger Equity</a>
                </div>
            `;
        }

        // 3. Estado de Autenticación
        const activeUserId = state.session.activeUserId;
        let authHtml = '';
        
        if (activeUserId && activeUserId !== 'ecosystem-admin') {
            const user = state.globalUsers.find(u => u.id === activeUserId);
            const name = user ? user.name : activeUserId;
            authHtml = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 24px; height: 24px; background: #00b0ff; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: black; font-weight: bold; font-size: 0.7rem;">${name.charAt(0).toUpperCase()}</div>
                    <div class="name" title="${name}" style="color: white; font-size: 0.8rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;">${name}</div>
                </div>
                <button class="btn-logout" id="globalBtnLogout" title="Cerrar Sesión" style="background: transparent; border: none; color: #ff5252; cursor: pointer; font-size: 1.2rem; transition: transform 0.2s;">⏻</button>
            `;
        } else {
            authHtml = `
                <a href="/v5/team" data-link style="color: #00e676; text-decoration: none; font-size: 0.85rem; font-weight: bold; display: flex; align-items: center; justify-content: center; width: 100%;">
                    👤 Iniciar Sesión
                </a>
            `;
        }

        // Retornamos el bloque completo del Sidebar
        return `
            <style>
                .sidebar-comp { width: 260px; background: rgba(15, 15, 20, 0.95); border-right: 1px solid rgba(255,255,255,0.05); padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 10px; z-index: 100; flex-shrink: 0; overflow-y: auto;}
                .sidebar-comp .brand { font-weight: bold; font-family: monospace; color: white; margin-bottom: 2rem; font-size: 1.2rem; flex-shrink: 0; }
                .sidebar-comp .side-section { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 5px;}
                .sidebar-comp .side-link { padding: 0.8rem 1rem; border-radius: 8px; cursor: pointer; color: #888; text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s; }
                .sidebar-comp .side-link:hover { background: rgba(255,255,255,0.05); color: white; }
                .sidebar-comp .side-link.active { background: rgba(0, 176, 255, 0.1); color: #00b0ff; font-weight: bold; border-left: 3px solid #00b0ff; }
                .sidebar-comp .project-context-header { padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1rem; }
                .sidebar-comp .project-context-header h3 { font-size: 1rem; margin: 0 0 5px 0; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .sidebar-comp .project-context-header p { font-size: 0.7rem; color: #00b0ff; text-transform: uppercase; font-weight: bold; margin: 0;}
                .sidebar-comp .sidebar-footer { margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; }
                .sidebar-comp .user-status { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; margin-top: 10px; border: 1px solid rgba(255,255,255,0.05);}
                .sidebar-comp .btn-logout:hover { transform: scale(1.2) !important; }

                @media (max-width: 768px) {
                    .sidebar-comp { width: 100%; padding: 1rem; flex-direction: row; overflow-x: auto; flex-wrap: nowrap; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
                    .sidebar-comp .brand { display: none; }
                    .sidebar-comp .project-context-header { display: none; }
                    .sidebar-comp .sidebar-footer { display: none; }
                    .sidebar-comp .side-section { flex-direction: row; gap: 10px; margin-bottom: 0;}
                    .sidebar-comp .side-link { white-space: nowrap; }
                }
            </style>

            <aside class="sidebar-comp">
                <div class="brand">🗼 TeamTowers</div>
                
                ${globalLinks}
                ${projectLinks}
                
                <div class="sidebar-footer">
                    <a href="/v5/settings" class="side-link ${activePath === '/settings' ? 'active' : ''}" data-link style="font-size: 0.8rem;">⚙️ Configuración & Datos</a>
                    <div class="user-status">
                        ${authHtml}
                    </div>
                </div>
            </aside>
        `;
    },

    initListeners: () => {
        const btnLogout = document.getElementById('globalBtnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'ecosystem-admin' } });
                window.location.href = '/v5/team'; // Redirigimos a login
            });
        }
    }
};
