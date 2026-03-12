// v5/js/components/BottomNav.js
import { store } from '../core/store.js';

export const BottomNav = {
    getHtml: (activePath = '') => {
        const state = store.getState();
        // Evitamos mostrar la barra si no hay proyecto activo o si estamos en la Landing
        const isLanding = window.location.pathname === '/v5/' || window.location.pathname === '/v5';
        if (isLanding && !state.session.activeUserId) return '';

        return `
            <style>
                .bottom-nav { 
                    display: none; /* Oculto por defecto en PC */
                    position: fixed; 
                    bottom: 0; 
                    left: 0; 
                    width: 100%; 
                    background: rgba(10, 10, 14, 0.95); 
                    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                    border-top: 1px solid rgba(255,255,255,0.05); 
                    z-index: 9999; 
                    padding-bottom: env(safe-area-inset-bottom); /* Soporte para notch de iPhone */
                    box-shadow: 0 -5px 20px rgba(0,0,0,0.5);
                }
                
                .bn-menu { 
                    display: flex; 
                    justify-content: space-around; 
                    align-items: center; 
                    height: 75px; 
                    padding: 0 15px;
                }
                
                .bn-item { 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 6px; 
                    color: var(--text-muted); 
                    text-decoration: none; 
                    flex: 1; 
                    height: 100%; 
                    transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                
                .bn-item .icon { font-size: 1.5rem; filter: grayscale(100%) opacity(0.5); transition: all 0.3s;}
                .bn-item .label { font-size: 0.65rem; font-family: var(--font-mono); font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;}
                
                .bn-item.active { color: white; }
                .bn-item.active .icon { filter: grayscale(0%) opacity(1); transform: translateY(-4px); text-shadow: 0 0 15px currentColor;}
                
                /* Colores de acento según la sección */
                .bn-item.bn-ledger.active { color: var(--accent-orange); }
                .bn-item.bn-focus.active { color: var(--accent-green); }
                .bn-item.bn-pull.active { color: var(--accent-blue); }
                .bn-item.bn-team.active { color: var(--accent-purple); }

                /* MEDIA QUERY: Mostrar solo en móviles */
                @media (max-width: 768px) {
                    .bottom-nav { display: block; }
                    #mainSidebar { display: none !important; } /* Ocultamos el sidebar viejo */
                    .workspace { padding-bottom: 120px !important; } /* Evita que el contenido quede debajo de la barra iOS Safe Area */
                }
            </style>

            <nav class="bottom-nav">
                <div class="bn-menu">
                    <a href="/v5/ledger" data-link class="bn-item bn-ledger ${activePath === '/ledger' ? 'active' : ''}">
                        <span class="icon">⚖️</span>
                        <span class="label">Wallet</span>
                    </a>
                    
                    <a href="/v5/focus" data-link class="bn-item bn-focus ${activePath === '/focus' ? 'active' : ''}">
                        <span class="icon">🎯</span>
                        <span class="label">Focus</span>
                    </a>

                    <a href="/v5/project" data-link class="bn-item bn-pull ${activePath === '/project' ? 'active' : ''}">
                        <span class="icon">📋</span>
                        <span class="label">Pull</span>
                    </a>

                    <a href="/v5/team" data-link class="bn-item bn-team ${activePath === '/team' ? 'active' : ''}">
                        <span class="icon">👥</span>
                        <span class="label">Equipo</span>
                    </a>
                </div>
            </nav>
        `;
    }
};
