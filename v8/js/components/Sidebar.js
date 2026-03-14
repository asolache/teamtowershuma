// v8/js/components/Sidebar.js
import { store } from '../core/store.js';

export const Sidebar = {
    getHtml: (currentPath = '') => {
        const isCollapsed = localStorage.getItem('tt_sidebar_collapsed') === 'true';
        const collapsedClass = isCollapsed ? 'collapsed' : '';
        const arrowIcon = isCollapsed ? '→' : '←';

        return `
            <aside class="sidebar ${collapsedClass}" id="mainSidebar">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    
                    <a href="/v8/" data-link style="display: ${isCollapsed ? 'none' : 'flex'}; align-items: center; height: 40px; text-decoration: none;">
                        <img src="/v8/logoteamtowers.png" alt="TeamTowers" style="max-height: 35px; max-width: 140px; object-fit: contain; filter: drop-shadow(0 0 15px rgba(255,255,255,0.2));" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <span style="display:none; color: white; font-weight: 900; margin-left: 10px; font-family: var(--font-mono); letter-spacing: -0.5px; font-size:1.5rem;">SOS v8</span>
                    </a>

                    <button id="btnToggleSidebar" style="background: transparent; border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 8px; padding: 6px 10px; cursor: pointer; width: ${isCollapsed ? '100%' : 'auto'}; transition: 0.2s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);">
                        ${arrowIcon}
                    </button>
                </div>
                
                <div style="margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 4px;">
                    <div style="font-size: 0.65rem; color: #666; text-transform: uppercase; font-weight: bold; margin-bottom: 5px; padding-left: 10px; display: ${isCollapsed ? 'none' : 'block'};">Global</div>
                    <a href="/v8/" class="side-link ${currentPath === '/' ? 'active' : ''}" data-link title="Centro de Mando">
                        <span style="margin-right: 12px; font-size: 1.2rem;">🌐</span> <span>Mis Redes</span>
                    </a>
                    <a href="/v8/network" class="side-link ${currentPath === '/network' ? 'active' : ''}" data-link title="Radar Global">
                        <span style="margin-right: 12px; font-size: 1.2rem;">📡</span> <span>Radar Global</span>
                    </a>

                    <div style="font-size: 0.65rem; color: #666; text-transform: uppercase; font-weight: bold; margin: 15px 0 5px 0; padding-left: 10px; display: ${isCollapsed ? 'none' : 'block'};">Operativa de Castell</div>
                    <a href="/v8/dashboard" class="side-link ${currentPath === '/dashboard' ? 'active' : ''}" data-link title="Dashboard">
                        <span style="margin-right: 12px; font-size: 1.2rem;">🛰️</span> <span>Dashboard</span>
                    </a>
                    <a href="/v8/map" class="side-link ${currentPath === '/map' ? 'active' : ''}" data-link title="Topología VNA">
                        <span style="margin-right: 12px; font-size: 1.2rem;">🕸️</span> <span>Mapa VNA</span>
                    </a>
                    <a href="/v8/team" class="side-link ${currentPath === '/team' ? 'active' : ''}" data-link title="La Colla">
                        <span style="margin-right: 12px; font-size: 1.2rem;">👥</span> <span>La Colla</span>
                    </a>
                    <a href="/v8/project" class="side-link ${currentPath === '/project' ? 'active' : ''}" data-link title="Kanban (PULL)">
                        <span style="margin-right: 12px; font-size: 1.2rem;">📋</span> <span>Kanban</span>
                    </a>
                    <a href="/v8/focus" class="side-link ${currentPath === '/focus' ? 'active' : ''}" data-link title="Modo Deep Work">
                        <span style="margin-right: 12px; font-size: 1.2rem;">🍅</span> <span>Deep Work</span>
                    </a>
                    <a href="/v8/ledger" class="side-link ${currentPath === '/ledger' ? 'active' : ''}" data-link title="Slicing Pie Wallet">
                        <span style="margin-right: 12px; font-size: 1.2rem;">⚖️</span> <span>Ledger</span>
                    </a>
                </div>
            </aside>
        `;
    },

    initListeners: () => {
        document.getElementById('btnToggleSidebar')?.addEventListener('click', () => {
            const sidebar = document.getElementById('mainSidebar');
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('tt_sidebar_collapsed', sidebar.classList.contains('collapsed') ? 'true' : 'false');
            window.location.reload();
        });
    }
};
