// v8/js/components/Sidebar.js
import { store } from '../core/store.js';

export const Sidebar = {
    getHtml: (currentPath = '') => {
        const isCollapsed = localStorage.getItem('tt_sidebar_collapsed') === 'true';
        const collapsedClass = isCollapsed ? 'collapsed' : '';

        return `
            <style>
                /* Sidebar Core Styles */
                .sidebar { width: 260px; background: rgba(10,10,15,0.95); border-right: 1px solid var(--glass-border); padding: 2rem 1.5rem; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; transition: width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), padding 0.3s; z-index: 1000; position: relative;}
                
                /* ESTADO CONTRAÍDO (Puro CSS Reactivo) */
                .sidebar.collapsed { width: 85px; padding: 2rem 10px; align-items: center;}
                .sidebar.collapsed .side-link { justify-content: center; padding: 12px 0; border-left: none; border-radius: 50%; width: 45px; height: 45px; margin: 0 auto 10px auto;}
                .sidebar.collapsed .link-text { display: none; }
                /* 🔥 FIX UX: Forzar visibilidad y centrado de los iconos al colapsar */
                .sidebar.collapsed .link-icon { margin-right: 0 !important; font-size: 1.5rem; display: flex; justify-content: center; align-items: center; width: 100%;}
                .sidebar.collapsed .side-category { display: none; }
                .sidebar.collapsed .logo-area { display: none; }
                .sidebar.collapsed .btn-logout { justify-content: center; padding: 12px 0; border-radius: 50%; width: 45px; height: 45px; margin: 0 auto;}
                .sidebar.collapsed .btn-logout .link-text { display: none; }
                .sidebar.collapsed .btn-logout .link-icon { margin-right: 0 !important;}
                
                /* Links Hover & Active States */
                .side-link { display: flex; align-items: center; color: #888; text-decoration: none; padding: 12px 15px; border-radius: 12px; margin-bottom: 5px; font-weight: 900; font-size: 0.95rem; transition: all 0.2s; border-left: 3px solid transparent; width: 100%; box-sizing: border-box; overflow: hidden;}
                .link-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: opacity 0.2s; }
                .link-icon { margin-right: 12px; font-size: 1.3rem; transition: margin 0.2s, font-size 0.2s; display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
                
                .side-link:hover { background: rgba(255,255,255,0.03); color: white; border-left-color: rgba(255,255,255,0.2); transform: translateX(3px);}
                .sidebar.collapsed .side-link:hover { transform: translateY(-3px); border-left-color: transparent; background: rgba(255,255,255,0.1); }
                
                .side-link.active { background: linear-gradient(90deg, rgba(0,176,255,0.1) 0%, transparent 100%); color: white; border-left-color: var(--accent-blue); box-shadow: inset 0 0 20px rgba(0,176,255,0.05);}
                .sidebar.collapsed .side-link.active { background: rgba(0,176,255,0.15); border-left-color: transparent; box-shadow: 0 0 15px rgba(0,176,255,0.2); }
                .side-link.active .link-icon { filter: drop-shadow(0 0 8px rgba(0,176,255,0.6)); }

                /* Category Headers */
                .side-category { font-size: 0.65rem; color: #555; text-transform: uppercase; font-family: var(--font-mono); font-weight: bold; margin: 20px 0 8px 0; padding-left: 15px; letter-spacing: 1px;}
                
                /* Collapse Button */
                .btn-collapse { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #888; border-radius: 8px; padding: 8px; cursor: pointer; transition: 0.2s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3); flex-shrink: 0; display:flex; justify-content:center; align-items:center;}
                .sidebar.collapsed .btn-collapse { width: 100%; margin-bottom: 20px; }
                .btn-collapse:hover { background: rgba(255,255,255,0.05); color: white; border-color: rgba(255,255,255,0.3);}

                /* Logout Button */
                .btn-logout { width: 100%; background: transparent; border: 1px dashed rgba(255,82,82,0.3); color: var(--accent-red); padding: 12px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: flex-start; box-sizing: border-box; overflow:hidden;}
                .btn-logout:hover { background: rgba(255,82,82,0.1); border-style: solid; box-shadow: 0 0 15px rgba(255,82,82,0.2);}

                @media (max-width: 768px) {
                    .sidebar { display: none !important; /* En móvil usamos BottomNav */ }
                }
            </style>

            <aside class="sidebar ${collapsedClass}" id="mainSidebar">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1.5rem; width: 100%; box-sizing: border-box;">
                    <a href="/v8/" class="logo-area" data-link style="display: flex; align-items: center; text-decoration: none; overflow:hidden;">
                        <span style="font-size: 1.8rem; filter: drop-shadow(0 0 10px rgba(0,176,255,0.5)); margin-right:10px;">🗼</span>
                        <div>
                            <div style="color: white; font-weight: 900; font-family: var(--font-main); font-size:1.1rem; line-height:1; letter-spacing:-0.5px;">TeamTowers</div>
                            <div style="color: var(--accent-blue); font-family: var(--font-mono); font-size:0.7rem; font-weight:bold; letter-spacing:1px; margin-top:2px;">KERNEL V14</div>
                        </div>
                    </a>
                    <button id="btnToggleSidebar" class="btn-collapse" title="Expandir/Contraer">
                        <span class="icon-collapse"></span>
                    </button>
                </div>
                
                <div style="display: flex; flex-direction: column; flex: 1; overflow-y: auto; overflow-x: hidden; width: 100%;">
                    
                    <div class="side-category" style="margin-top:0;">Matriz Global</div>
                    
                    <a href="/v8/" class="side-link ${currentPath === '/' ? 'active' : ''}" data-link title="Mis Ecosistemas">
                        <span class="link-icon">🌐</span> <span class="link-text">Mis Ecosistemas</span>
                    </a>
                    
                    <a href="/v8/settings" class="side-link ${currentPath === '/settings' ? 'active' : ''}" data-link title="Panteón Global (Gobernanza)">
                        <span class="link-icon">🏛️</span> <span class="link-text">Panteón Global</span>
                    </a>

                    <div class="side-category">Operativa Local (Castell)</div>
                    
                    <a href="/v8/dashboard" class="side-link ${currentPath === '/dashboard' ? 'active' : ''}" data-link title="Radar (Macro-Vista)">
                        <span class="link-icon">🛰️</span> <span class="link-text">Radar VNA</span>
                    </a>
                    
                    <a href="/v8/map" class="side-link ${currentPath === '/map' ? 'active' : ''}" data-link title="Topología (Diseño)">
                        <span class="link-icon">🕸️</span> <span class="link-text">Topología</span>
                    </a>
                    
                    <a href="/v8/lms" class="side-link ${currentPath === '/lms' ? 'active' : ''}" data-link title="La Forja (Cerebro LMS)">
                        <span class="link-icon">🧠</span> <span class="link-text">La Forja (LMS)</span>
                    </a>
                    <a href="/v8/agents" class="side-link ${currentPath === '/agents' ? 'active' : ''}" data-link title="Sandbox TDD (Entrenar IA)">
                        <span class="link-icon">🧪</span> <span class="link-text">Sandbox TDD</span>
                    </a>
                    <a href="/v8/project" class="side-link ${currentPath === '/project' ? 'active' : ''}" data-link title="Mercado PULL (Kanban)">
                        <span class="link-icon">📋</span> <span class="link-text">Mercado PULL</span>
                    </a>

                    <a href="/v8/paper" class="side-link ${currentPath === '/paper' || currentPath === '/focus' ? 'active' : ''}" data-link title="Omni-Paper (Usenet)">
                        <span class="link-icon">📝</span> <span class="link-text">Omni-Paper</span>
                    </a>

                    <a href="/v8/ledger" class="side-link ${currentPath === '/ledger' ? 'active' : ''}" data-link title="Notaría y Equity">
                        <span class="link-icon">⚖️</span> <span class="link-text">Notari Ledger</span>
                    </a>

                    <div class="side-category">Sistema</div>
                    
                    <a href="/v8/profile" class="side-link ${currentPath === '/profile' ? 'active' : ''}" data-link title="Mi Ikigai (Perfil)">
                        <span class="link-icon">👤</span> <span class="link-text">Mi Perfil (SBTs)</span>
                    </a>
                </div>

                <div style="margin-top: auto; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); width: 100%;">
                    <button id="btnLogout" class="btn-logout" title="Suspender sesión del Nodo">
                        <span class="link-icon">🚪</span> <span class="link-text">Desconectar</span>
                    </button>
                </div>
            </aside>
        `;
    },

    initListeners: () => {
        const updateArrowIcon = () => {
            const sidebar = document.getElementById('mainSidebar');
            const iconSpan = document.querySelector('.icon-collapse');
            if (iconSpan && sidebar) {
                iconSpan.innerHTML = sidebar.classList.contains('collapsed') ? '→' : '←';
            }
        };

        document.getElementById('btnToggleSidebar')?.addEventListener('click', () => {
            const sidebar = document.getElementById('mainSidebar');
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('tt_sidebar_collapsed', sidebar.classList.contains('collapsed') ? 'true' : 'false');
            
            updateArrowIcon();

            setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
        });

        updateArrowIcon();

        document.getElementById('btnLogout')?.addEventListener('click', async () => {
            if(confirm('¿Suspender sesión del Nodo Humano? Los agentes seguirán procesando en Local.')) {
                await store.dispatch({ type: 'LOGOUT_USER' });
                window.location.href = '/v8/'; 
            }
        });
    }
};
