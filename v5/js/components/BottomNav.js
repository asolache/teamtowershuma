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
                    backdrop-filter: blur(15px); 
                    border-top: 1px solid rgba(255,255,255,0.05); 
                    z-index: 9999; 
                    padding-bottom: env(safe-area-inset-bottom); /* Soporte para notch de iPhone */
                }
                
                .bn-menu { 
                    display: flex; 
                    justify-content: space-around; 
                    align-items: center; 
                    height: 70px; 
                    padding: 0 10px;
                }
                
                .bn-item { 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 4px; 
                    color: var(--text-muted); 
                    text-decoration: none; 
                    flex: 1; 
                    height: 100%; 
                    transition: all 0.2s;
                }
                
                .bn-item .icon { font-size: 1.4rem; filter: grayscale(100%) opacity(0.7); transition: all 0.2s;}
                .bn-item .label { font-size: 0.65rem; font-family: var(--font-mono); font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;}
                
                .bn-item.active { color: var(--accent-blue); }
                .bn-item.active .icon { filter: grayscale(0%) opacity(1); transform: translateY(-2px); text-shadow: 0 0 10px rgba(0, 176, 255, 0.5);}
                .bn-item.active.bn-accent { color: var(--accent-green); }
                .bn-item.active.bn-accent .icon { text-shadow: 0 0 10px rgba(0, 230, 118, 0.5); }

                /* MEDIA QUERY: Mostrar solo en móviles */
                @media (max-width: 768px) {
                    .bottom-nav { display: block; }
                    #mainSidebar { display: none !important; } /* Ocultamos el sidebar viejo */
                    .workspace { padding-bottom: 90px !important; } /* Evita que el contenido quede debajo de la barra */
                }
            </style>

            <nav class="bottom-nav">
                <div class="bn-menu">
                    <a href="/v5/project" data-link class="bn-item ${activePath === '/project' ? 'active' : ''}">
                        <span class="icon">📋</span>
                        <span class="label">Pull</span>
                    </a>
                    <a href="/v5/focus" data-link class="bn-item ${activePath === '/focus' ? 'active bn-accent' : ''} bn-accent">
                        <span class="icon">🎯</span>
                        <span class="label">Focus</span>
                    </a>
                    <a href="/v5/map" data-link class="bn-item ${activePath === '/map' ? 'active' : ''}">
                        <span class="icon">🕸️</span>
                        <span class="label">Mapa</span>
                    </a>
                    <a href="/v5/ledger" data-link class="bn-item ${activePath === '/ledger' ? 'active' : ''}">
                        <span class="icon">⚖️</span>
                        <span class="label">Wallet</span>
                    </a>
                    <a href="/v5/profile" data-link class="bn-item ${activePath === '/profile' ? 'active' : ''}">
                        <span class="icon">👤</span>
                        <span class="label">Perfil</span>
                    </a>
                </div>
            </nav>
        `;
    }
};
