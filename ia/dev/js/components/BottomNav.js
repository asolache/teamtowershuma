// =============================================================================
// TEAMTOWERS SOS V10 — BOTTOM NAV
// Ruta: ia/dev/js/components/BottomNav.js
// Mobile-only · Rutas relativas · FAB Omni-Paper central
// =============================================================================

import { store } from '../core/store.js';

export const BottomNav = {
    getHtml(activePath = '') {
        const state = store.getState();

        // Sin sesión en la raíz → no pintamos
        const isRoot = window.location.pathname === '/' || window.location.pathname === '';
        if (isRoot && !state.session.activeUserId) return '';

        const path = activePath; // ya viene sin prefijo en V10

        return `
        <style>
            .bottom-nav {
                display: none;
                position: fixed; bottom: 0; left: 0; width: 100%;
                background: rgba(10,10,15,0.97);
                backdrop-filter: blur(20px);
                border-top: 1px solid rgba(255,255,255,0.05);
                z-index: 9999;
                padding-bottom: env(safe-area-inset-bottom);
                box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
            }
            @media (max-width: 768px) {
                .bottom-nav { display: block; }

                .bn-menu {
                    display: flex; justify-content: space-around;
                    align-items: center; height: 70px; padding: 0 10px;
                }

                .bn-item {
                    display: flex; flex-direction: column; align-items: center;
                    justify-content: center; text-decoration: none;
                    color: #666; font-size: 0.65rem; font-weight: bold;
                    font-family: var(--font-mono, monospace);
                    transition: all 0.3s cubic-bezier(0.2,0.8,0.2,1);
                    flex: 1; letter-spacing: 0.5px;
                }
                .bn-item.active { color: var(--accent-indigo, #6366f1); }
                .bn-item.active .bn-icon {
                    transform: translateY(-4px) scale(1.15);
                    filter: drop-shadow(0 0 10px rgba(99,102,241,0.5));
                }
                .bn-icon { font-size: 1.4rem; margin-bottom: 4px; transition: transform 0.3s cubic-bezier(0.2,0.8,0.2,1), filter 0.3s; }

                /* FAB central — Omni-Paper */
                .bn-item-center-wrapper {
                    display: flex; flex-direction: column; align-items: center;
                    width: 75px; position: relative; top: -15px;
                }
                .bn-item-center {
                    width: 55px; height: 55px;
                    background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #e040fb));
                    border-radius: 50%;
                    display: flex; justify-content: center; align-items: center;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.6), inset 0 2px 10px rgba(255,255,255,0.3);
                    border: 4px solid #050508;
                    color: white; font-size: 1.6rem; text-decoration: none;
                    transition: transform 0.3s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.3s;
                    z-index: 2;
                }
                .bn-item-center:hover,
                .bn-item-center.active {
                    transform: scale(1.1) translateY(-2px);
                    box-shadow: 0 15px 25px rgba(99,102,241,0.5), inset 0 2px 10px rgba(255,255,255,0.4);
                    border-color: #111116;
                }
                .bn-center-lbl {
                    font-size: 0.65rem; color: #888; font-weight: bold;
                    font-family: var(--font-mono, monospace);
                    margin-top: 4px; transition: color 0.3s;
                }
                .bn-item-center.active ~ .bn-center-lbl { color: var(--accent-indigo, #6366f1); }
            }
        </style>

        <nav class="bottom-nav">
            <div class="bn-menu">
                <a href="/dashboard" data-link class="bn-item ${path === '/dashboard' || path === '/' ? 'active' : ''}">
                    <span class="bn-icon">🛰️</span>
                    <span>RADAR</span>
                </a>

                <a href="/project" data-link class="bn-item ${path === '/project' ? 'active' : ''}">
                    <span class="bn-icon">📋</span>
                    <span>PULL</span>
                </a>

                <div class="bn-item-center-wrapper">
                    <a href="/paper" data-link
                       class="bn-item-center ${path === '/paper' || path === '/focus' ? 'active' : ''}"
                       title="Omni-Paper">
                        📝
                    </a>
                    <span class="bn-center-lbl">EJECUTAR</span>
                </div>

                <a href="/ledger" data-link class="bn-item ${path === '/ledger' ? 'active' : ''}">
                    <span class="bn-icon">⚖️</span>
                    <span>WALLET</span>
                </a>

                <a href="/lms" data-link class="bn-item ${path === '/lms' ? 'active' : ''}">
                    <span class="bn-icon">🧠</span>
                    <span>FORJA</span>
                </a>
            </div>
        </nav>`;
    }
};
