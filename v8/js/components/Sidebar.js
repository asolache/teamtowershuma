// v8/js/components/Sidebar.js
import { store } from '../core/store.js';

export const Sidebar = {
    getHtml: (currentPath = '') => {
        const isCollapsed = localStorage.getItem('tt_sidebar_collapsed') === 'true';
        const collapsedClass = isCollapsed ? 'collapsed' : '';
        const arrowIcon = isCollapsed ? '→' : '←';

        return `
            <style>
                /* Sidebar Core Styles */
                .sidebar { width: 260px; background: rgba(10,10,15,0.95); border-right: 1px solid var(--glass-border); padding: 2rem 1.5rem; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); z-index: 1000; position: relative;}
                .sidebar.collapsed { width: 80px; padding: 2rem 10px; align-items: center;}
                
                /* Links Hover & Active States */
                .side-link { display: flex; align-items: center; color: #888; text-decoration: none; padding: 12px 15px; border-radius: 12px; margin-bottom: 5px; font-weight: 900; font-size: 0.95rem; transition: all 0.2s; border-left: 3px solid transparent; width: 100%; box-sizing: border-box;}
                .side-link span:last-child { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: ${isCollapsed ? 'none' : 'block'}; }
                
                .side-link:hover { background: rgba(255,255,255,0.03); color: white; border-left-color: rgba(255,255,255,0.2); transform: translateX(3px);}
                
                .side-link.active { background: linear-gradient(90deg, rgba(0,176,255,0.1) 0%, transparent 100%); color: white; border-left-color: var(--accent-blue); box-shadow: inset 0 0 20px rgba(0,176,255,0.05);}
                .side-link.active span:first-child { filter: drop-shadow(0 0 8px rgba(0,176,255,0.6)); }

                /* Category Headers */
                .side-category { font-size: 0.65rem; color: #555; text-transform: uppercase; font-family: var(--font-mono); font-weight: bold; margin: 20px 0 8px 0; padding-left: 15px; letter-spacing: 1px; display: ${isCollapsed ? 'none' : 'block'};}
                
                /* Collapse Button */
                .btn-collapse { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #888; border-radius: 8px; padding: 8px; cursor: pointer; width: ${isCollapsed ? '100%' : 'auto'}; transition: 0.2s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3); flex-shrink: 0;}
                .btn-collapse:hover { background: rgba(255,255,255,0.05); color: white; border-color: rgba(255,255,255,0.3);}

                /* Logout Button */
                .btn-logout { width: 100%; background: transparent; border: 1px dashed rgba(255,82,82,0.3); color: var(--accent-red); padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: ${isCollapsed ? 'center' : 'flex-start'}; gap: 10px;}
                .btn-logout:hover { background: rgba(255,82,82,0.1); border-style: solid; box-shadow: 0 0 15px rgba(255,82,82,0.2);}

                @media (max-width: 768px) {
                    .sidebar { display: none !important; /* En móvil usamos BottomNav */ }
                }
            </style>

            <aside class="sidebar ${collapsedClass}" id="mainSidebar">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1.5rem;">
                    <a href="/v8/" data-link style="display: ${isCollapsed ? 'none' : 'flex'}; align-items: center; text-decoration: none; overflow:hidden;">
                        <span style="font-size: 1.8rem; filter: drop-shadow(0 0 10px rgba(0,176,255,0.5)); margin-right:10px;">🗼</span>
                        <div>
                            <div style="color: white; font-weight: 900; font-family: var(--font-main); font-size:1.1rem; line-height:1; letter-spacing:-0.5px;">TeamTowers</div>
                            <div style="color: var(--accent-blue); font-family: var(--font-mono); font-size:0.7rem; font-weight:bold; letter-spacing:1px; margin-top:2px;">KERNEL V13</div>
                        </div>
                    </a>
                    <button id="btnToggleSidebar" class="btn-collapse" title="${isCollapsed ? 'Expandir' : 'Contraer'}">${arrowIcon}</button>
                </div>
                
                <div style="display: flex; flex-direction: column; flex: 1; overflow-y: auto; overflow-x: hidden; padding-right: 5px;">
                    
                    <div class="side-category" style="margin-top:0;">Matriz Global</div>
                    
                    <a href="/v8/" class="side-link ${currentPath === '/' ? 'active' : ''}" data-link title="Mis Ecosistemas">
                        <span style="margin-right: 12px; font-size: 1.3rem;">🌐</span> <span>Mis Ecosistemas</span>
                    </a>
                    
                    <a href="/v8/settings" class="side-link ${currentPath === '/settings' ? 'active' : ''}" data-link title="Consola Global (Settings)">
                        <span style="margin-right: 12px; font-size: 1.3rem;">⚙️</span> <span>Consola Global</span>
                    </a>

                    <div class="side-category">Operativa Local (Castell)</div>
                    
                    <a href="/v8/dashboard" class="side-link ${currentPath === '/dashboard' ? 'active' : ''}" data-link title="Radar (Macro-Vista)">
                        <span style="margin-right: 12px; font-size: 1.3rem;">🛰️</span> <span>Radar VNA</span>
                    </a>
                    
                    <a href="/v8/map" class="side-link ${currentPath === '/map' ? 'active' : ''}" data-link title="Topología (Diseño)">
                        <span style="margin-right: 12px; font-size: 1.3rem;">🕸️</span> <span>Topología</span>
                    </a>
                    
                    <a href="/v8/project" class="side-link ${currentPath === '/project' ? 'active' : ''}" data-link title="Mercado PULL (Kanban)">
                        <span style="margin-right: 12px; font-size: 1.3rem;">📋</span> <span>Mercado PULL</span>
                    </a>

                    <a href="/v8/paper" class="side-link ${currentPath === '/paper' || currentPath === '/focus' ? 'active' : ''}" data-link title="Omni-Paper (Usenet)">
                        <span style="margin-right: 12px; font-size: 1.3rem;">📝</span> <span>Omni-Paper</span>
                    </a>

                    <a href="/v8/ledger" class="side-link ${currentPath === '/ledger' ? 'active' : ''}" data-link title="Notaría y Equity">
                        <span style="margin-right: 12px; font-size: 1.3rem;">⚖️</span> <span>Notari Ledger</span>
                    </a>

                    <div class="side-category">Sistema</div>
                    
                    <a href="/v8/profile" class="side-link ${currentPath === '/profile' ? 'active' : ''}" data-link title="Mi Ikigai (Perfil)">
                        <span style="margin-right: 12px; font-size: 1.3rem;">👤</span> <span>Mi Perfil (SBTs)</span>
                    </a>
                </div>

                <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05);">
                    <button id="btnLogout" class="btn-logout" title="Suspender sesión del Nodo">
                        <span style="font-size: 1.2rem;">🚪</span> <span style="display: ${isCollapsed ? 'none' : 'inline'};">Desconectar</span>
                    </button>
                </div>
            </aside>
        `;
    },

    initListeners: () => {
        document.getElementById('btnToggleSidebar')?.addEventListener('click', () => {
            const sidebar = document.getElementById('mainSidebar');
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('tt_sidebar_collapsed', sidebar.classList.contains('collapsed') ? 'true' : 'false');
            
            // Forzamos un reflow del window para que los mapas (ResizeObserver) se ajusten al nuevo ancho
            window.dispatchEvent(new Event('resize'));
        });

        document.getElementById('btnLogout')?.addEventListener('click', async () => {
            if(confirm('¿Suspender sesión del Nodo Humano? Los agentes seguirán procesando en Local.')) {
                await store.dispatch({ type: 'LOGOUT_USER' });
                window.location.href = '/v8/'; 
            }
        });
    }
};
