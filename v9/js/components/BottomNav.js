// v9/js/components/BottomNav.js
import { store } from '../core/store.js';

export const BottomNav = {
    getHtml: (activePath = '') => {
        const state = store.getState();
        // Si estamos en la raíz Zero-Trust y no hay sesión, no pintamos el menú
        if ((window.location.pathname === '/v9/' || window.location.pathname === '/v9') && !state.session.activeUserId) return '';

        // Limpieza de la ruta para el match de los botones
        const path = activePath.replace('/v9', '');

        return `
            <style>
                .bottom-nav {
                    display: none; /* Por defecto oculto en resoluciones de escritorio */
                }
                
                @media (max-width: 768px) {
                    .bottom-nav {
                        display: block;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        width: 100%;
                        background: rgba(10, 10, 15, 0.95);
                        backdrop-filter: blur(20px);
                        border-top: 1px solid rgba(255, 255, 255, 0.05);
                        z-index: 9999;
                        padding-bottom: env(safe-area-inset-bottom); /* Soporte iOS Notch */
                        box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
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
                        text-decoration: none;
                        color: #666;
                        font-size: 0.65rem;
                        font-weight: bold;
                        font-family: var(--font-mono, monospace);
                        transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
                        flex: 1;
                        letter-spacing: 0.5px;
                    }
                    
                    .bn-item.active {
                        color: var(--accent-blue, #00b0ff);
                    }
                    
                    .bn-item.active .bn-icon {
                        transform: translateY(-4px) scale(1.15);
                        filter: drop-shadow(0 0 10px rgba(0, 176, 255, 0.4));
                    }
                    
                    .bn-icon {
                        font-size: 1.4rem;
                        margin-bottom: 4px;
                        transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.3s;
                    }

                    /* 🔥 EL BOTÓN CENTRAL (OMNI-PAPER FAB) */
                    .bn-item-center-wrapper {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        width: 75px;
                        position: relative;
                        top: -15px;
                    }
                    
                    .bn-item-center {
                        width: 55px;
                        height: 55px;
                        background: linear-gradient(135deg, var(--accent-purple, #e040fb), var(--accent-blue, #00b0ff));
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        box-shadow: 0 10px 20px rgba(0,0,0,0.6), inset 0 2px 10px rgba(255,255,255,0.3);
                        border: 4px solid #050508;
                        color: white;
                        font-size: 1.6rem;
                        text-decoration: none;
                        transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s;
                        z-index: 2;
                    }
                    
                    .bn-item-center:hover, .bn-item-center.active {
                        transform: scale(1.1) translateY(-2px);
                        box-shadow: 0 15px 25px rgba(224, 64, 251, 0.5), inset 0 2px 10px rgba(255,255,255,0.4);
                        border-color: #111116;
                    }
                    
                    .bn-center-lbl {
                        font-size: 0.65rem;
                        color: #888;
                        font-weight: bold;
                        font-family: var(--font-mono, monospace);
                        margin-top: 4px;
                        transition: color 0.3s;
                    }
                    
                    .bn-item-center.active + .bn-center-lbl {
                        color: var(--accent-purple, #e040fb);
                    }
                }
            </style>

            <nav class="bottom-nav">
                <div class="bn-menu">
                    <a href="/v9/dashboard" data-link class="bn-item ${path === '/dashboard' || path === '' ? 'active' : ''}">
                        <span class="bn-icon">🛰️</span>
                        <span>RADAR</span>
                    </a>
                    
                    <a href="/v9/project" data-link class="bn-item ${path === '/project' ? 'active' : ''}">
                        <span class="bn-icon">📋</span>
                        <span>PULL</span>
                    </a>

                    <div class="bn-item-center-wrapper">
                        <a href="/v9/paper" data-link class="bn-item-center ${path === '/paper' ? 'active' : ''}" title="Omni-Paper">
                            📝
                        </a>
                        <span class="bn-center-lbl">EJECUTAR</span>
                    </div>
                    
                    <a href="/v9/ledger" data-link class="bn-item ${path === '/ledger' ? 'active' : ''}">
                        <span class="bn-icon">⚖️</span>
                        <span>WALLET</span>
                    </a>
                    
                    <a href="/v9/profile" data-link class="bn-item ${path === '/profile' ? 'active' : ''}">
                        <span class="bn-icon">👤</span>
                        <span>ADN</span>
                    </a>
                </div>
            </nav>
        `;
    }
};
