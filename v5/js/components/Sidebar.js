// v5/js/components/Sidebar.js
import { store } from '../core/store.js';

export const Sidebar = {
    getHtml: (activePath = '') => {
        const state = store.getState();
        const project = state.projects[state.projects.length - 1];
        
        const activeUserId = state.session.activeUserId;
        let userDisplay = activeUserId === 'ecosystem-admin' ? 'Ecosystem Admin' : activeUserId;
        
        if (activeUserId !== 'ecosystem-admin') {
            const u = state.globalUsers.find(x => x.id === activeUserId);
            if (u) userDisplay = u.name;
        }

        let projContextHtml = '';
        if (project) {
            projContextHtml = `
                <div style="padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--glass-border); margin: 1.5rem 0;">
                    <h3 style="font-size: 1rem; margin: 0 0 5px 0; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${project.nombre}">${project.nombre}</h3>
                    <p style="font-size: 0.7rem; color: var(--accent-green); text-transform: uppercase; font-weight: bold; margin: 0;">MODO: ${project.archetype || 'startup'}</p>
                </div>
            `;
        }

        return `
            <aside class="sidebar">
                <div style="font-weight: bold; font-family: var(--font-mono); color: white; margin-bottom: 1rem; font-size: 1.2rem; flex-shrink: 0;">🗼 TeamTowers</div>
                
                <div class="side-section">
                    <a href="/v5/" class="side-link ${activePath === '/' ? 'active' : ''}" data-link>🏠 Inicio</a>
                    <a href="/v5/network" class="side-link ${activePath === '/network' ? 'active' : ''}" data-link>🌐 Red de DAOs</a>
                    <a href="/v5/create" class="side-link ${activePath === '/create' ? 'active' : ''}" data-link>➕ Instanciar Red</a>
                </div>
                
                ${projContextHtml}
                
                <div class="side-section">
                    <a href="/v5/project" class="side-link ${activePath === '/project' ? 'active' : ''}" data-link>📋 Kanban Tracción</a>
                    <a href="/v5/map" class="side-link ${activePath === '/map' ? 'active' : ''}" data-link>🕸️ Mapa VNA</a>
                    <a href="/v5/team" class="side-link ${activePath === '/team' ? 'active' : ''}" data-link>👥 Tripulación</a>
                    <a href="/v5/ledger" class="side-link ${activePath === '/ledger' ? 'active' : ''}" data-link>⚖️ Ledger Equity</a>
                    <a href="/v5/tests" class="side-link ${activePath === '/tests' ? 'active' : ''}" data-link>🧪 Diagnostics</a>
                </div>
                
                <div class="sidebar-footer" style="margin-top: auto; border-top: 1px solid var(--glass-border); padding-top: 1rem;">
                    <a href="/v5/manifesto" class="side-link ${activePath === '/manifesto' ? 'active' : ''}" data-link style="color: var(--accent-purple); font-weight: bold;">📚 Códice SOS</a>
                    <div class="user-status" style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; margin-top: 10px; border: 1px solid var(--glass-border);">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 24px; height: 24px; background: var(--accent-blue); border-radius: 50%; display: flex; justify-content: center; align-items: center; color: black; font-weight: bold; font-size: 0.7rem;">${userDisplay.charAt(0).toUpperCase()}</div>
                            <div class="name" style="color: white; font-size: 0.8rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;" title="${userDisplay}">${userDisplay}</div>
                        </div>
                    </div>
                </div>
            </aside>
        `;
    },

    initListeners: () => {
        // Listener global para enlaces
        document.querySelectorAll('[data-link]').forEach(link => {
            // Previene adjuntar múltiples veces si la vista se recarga
            link.removeEventListener('click', window.routerLinkHandler);
            
            window.routerLinkHandler = function(e) {
                e.preventDefault();
                import('../router.js').then(module => {
                    module.navigateTo(e.currentTarget.href);
                });
            };
            
            link.addEventListener('click', window.routerLinkHandler);
        });
    }
};
