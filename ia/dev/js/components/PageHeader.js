// =============================================================================
// TEAMTOWERS SOS V10 — PAGE HEADER
// Ruta: ia/dev/js/components/PageHeader.js
// Rutas relativas · afterRender pattern · Magic Actions IA
// =============================================================================

import { store }      from '../core/store.js';
import { navigateTo } from '../router.js';

export class PageHeader {

    static getHtml(options = {}) {
        const state        = store.getState();
        const activeUserId = state.session.activeUserId;
        const user         = state.globalUsers.find(u => u.id === activeUserId);
        const initial      = user ? user.name.charAt(0).toUpperCase() : '?';

        const config = Object.assign({
            title:        'Kernel VNA',
            subtitle:     '',
            tagline:      '',
            tabs:         [],
            actionHtml:   '',
            magicActions: []
        }, options);

        // ── Tabs ──────────────────────────────────────────────────
        let tabsHtml = '';
        if (config.tabs?.length > 0) {
            tabsHtml = `
            <div class="ph-tabs-container">
                ${config.tabs.map(t =>
                    `<button class="ph-tab-btn ${t.active ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`
                ).join('')}
            </div>`;
        }

        // ── Magic Actions ──────────────────────────────────────────
        let magicBtnHtml = '';
        if (config.magicActions?.length > 0) {
            magicBtnHtml = `
            <button class="ph-btn-magic" id="btnMagicDropdown">✨ Acciones IA ▾</button>
            <div class="ph-magic-menu" id="magicMenu">
                ${config.magicActions.map(a => `
                    <div class="ph-magic-item" data-action="${a.id}">
                        <span class="ph-magic-icon">${a.icon}</span>
                        <div class="ph-magic-text">
                            <div class="ph-magic-title">${a.label}</div>
                            <div class="ph-magic-cost">${a.tokens ? `⚡ ${a.tokens} tokens` : '⚙️ Acción de Sistema'}</div>
                        </div>
                    </div>`
                ).join('')}
            </div>`;
        }

        return `
        <style>
            .page-header {
                background: linear-gradient(180deg, rgba(20,20,25,0.95), rgba(20,20,25,0.5));
                border-bottom: 1px solid var(--glass-border);
                padding: 1.5rem 2rem; margin: 0 0 2rem 0;
                display: flex; flex-direction: column; gap: 1rem;
                position: sticky; top: 0; z-index: 50;
                backdrop-filter: blur(12px);
                animation: fadeIn var(--duration-base, 0.2s) var(--ease-out, ease-out);
            }

            .ph-top-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }

            .ph-title-group { display: flex; flex-direction: column; gap: 4px; }
            .ph-title   { font-size: 1.8rem; font-weight: 900; color: white; margin: 0; letter-spacing: -1px; display: flex; align-items: center; gap: 10px; }
            .ph-subtitle { font-size: 0.8rem; color: var(--accent-indigo, #6366f1); font-family: var(--font-mono); font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border: 1px solid rgba(99,102,241,0.3); padding: 2px 8px; border-radius: 6px; background: rgba(99,102,241,0.1); display: inline-block; }
            .ph-tagline { font-size: 0.9rem; color: var(--text-muted, #666); font-style: italic; }

            .ph-actions-group { display: flex; align-items: center; gap: 12px; position: relative; flex-shrink: 0; }

            /* User menu */
            .ph-user-menu { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border); padding: 8px 14px; border-radius: 12px; cursor: pointer; transition: 0.2s; user-select: none; }
            .ph-user-menu:hover { background: rgba(255,255,255,0.07); }
            .ph-avatar    { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #e040fb)); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1rem; color: white; }
            .ph-user-name { font-weight: 700; font-size: 0.9rem; color: white; }

            /* Dropdown */
            .ph-dropdown { display: none; position: absolute; top: calc(100% + 10px); right: 0; background: var(--bg-elevated, #18181f); border: 1px solid var(--glass-border); border-radius: 16px; padding: 8px; min-width: 220px; z-index: 200; box-shadow: 0 20px 40px rgba(0,0,0,0.6); animation: fadeIn 0.15s ease-out; }
            .ph-dropdown.open { display: block; }
            .ph-dd-item { display: block; padding: 10px 14px; color: #ccc; text-decoration: none; border-radius: 10px; font-size: 0.9rem; font-weight: 600; transition: 0.2s; white-space: nowrap; }
            .ph-dd-item:hover { background: rgba(255,255,255,0.06); color: white; }
            .ph-dd-logout { color: var(--accent-red, #ff5252) !important; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; }

            /* Magic button */
            .ph-btn-magic { background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(224,64,251,0.15)); border: 1px solid rgba(99,102,241,0.4); color: white; padding: 8px 16px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 0.9rem; }
            .ph-btn-magic:hover { background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(224,64,251,0.3)); box-shadow: 0 0 20px rgba(99,102,241,0.3); }

            .ph-magic-menu { display: none; position: absolute; top: calc(100% + 10px); right: 0; background: var(--bg-elevated, #18181f); border: 1px solid var(--glass-border); border-radius: 16px; padding: 8px; min-width: 260px; z-index: 200; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
            .ph-magic-menu.open { display: block; animation: fadeIn 0.15s ease-out; }
            .ph-magic-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; cursor: pointer; transition: 0.2s; }
            .ph-magic-item:hover { background: rgba(255,255,255,0.06); }
            .ph-magic-icon  { font-size: 1.4rem; }
            .ph-magic-title { color: white; font-weight: 700; font-size: 0.9rem; }
            .ph-magic-cost  { color: #888; font-size: 0.75rem; font-family: var(--font-mono); margin-top: 2px; }

            /* Tabs */
            .ph-tabs-container { display: flex; background: rgba(0,0,0,0.4); padding: 5px; border-radius: 14px; border: 1px solid var(--glass-border); gap: 4px; overflow-x: auto; scrollbar-width: none; }
            .ph-tabs-container::-webkit-scrollbar { display: none; }
            .ph-tab-btn { flex: 0 0 auto; background: transparent; border: none; color: var(--text-muted, #888); padding: 9px 18px; border-radius: 10px; font-size: 0.88rem; font-weight: 800; cursor: pointer; transition: 0.2s; }
            .ph-tab-btn.active { background: rgba(255,255,255,0.1); color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
            .ph-tab-btn:hover:not(.active) { color: white; background: rgba(255,255,255,0.04); }

            @media (max-width: 768px) {
                .page-header { padding: 1rem; margin: 0 0 1.5rem 0; }
                .ph-title { font-size: 1.4rem; }
                .ph-user-name { display: none; }
            }
        </style>

        <header class="page-header">
            <div class="ph-top-row">
                <div class="ph-title-group">
                    <h1 class="ph-title">${config.title}</h1>
                    ${config.subtitle ? `<span class="ph-subtitle">${config.subtitle}</span>` : ''}
                    ${config.tagline  ? `<p class="ph-tagline">${config.tagline}</p>` : ''}
                </div>

                <div class="ph-actions-group">
                    ${config.actionHtml}
                    ${magicBtnHtml}

                    <div class="ph-user-menu" id="btnUserMenu">
                        <div class="ph-avatar">${initial}</div>
                        <span class="ph-user-name">${user?.name || 'Invitado'}</span>
                        <span style="color:#666; font-size:0.8rem;">▼</span>
                    </div>

                    <div class="ph-dropdown" id="userDropdown">
                        <a href="/profile"  class="ph-dd-item" data-link>👤 Mi Perfil / SBTs</a>
                        <a href="/settings" class="ph-dd-item" data-link>⚙️ Configuración (API Keys)</a>
                        <a href="/team"     class="ph-dd-item" data-link>👥 Nodos (Team)</a>
                        <a href="/lms"      class="ph-dd-item" data-link>📜 La Forja LMS</a>
                        <a href="/tests"    class="ph-dd-item" data-link>🩺 Diagnóstico de Sistema</a>
                        <a href="#" class="ph-dd-item ph-dd-logout" id="btnLogout">🚪 Desconectar Ecosistema</a>
                    </div>
                </div>
            </div>

            ${tabsHtml}
        </header>`;
    }

    // ── afterRender — sustituye a execute() de V9 ─────────────────
    static afterRender(onTabChange = null, onMagicAction = null) {
        // User menu toggle
        const btnMenu    = document.getElementById('btnUserMenu');
        const dropdown   = document.getElementById('userDropdown');
        if (btnMenu && dropdown) {
            btnMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
                document.getElementById('magicMenu')?.classList.remove('open');
            });
        }

        // Magic dropdown toggle
        const btnMagic   = document.getElementById('btnMagicDropdown');
        const magicMenu  = document.getElementById('magicMenu');
        if (btnMagic && magicMenu) {
            btnMagic.addEventListener('click', (e) => {
                e.stopPropagation();
                magicMenu.classList.toggle('open');
                dropdown?.classList.remove('open');
            });
            magicMenu.querySelectorAll('.ph-magic-item').forEach(item => {
                item.addEventListener('click', () => {
                    magicMenu.classList.remove('open');
                    onMagicAction?.(item.dataset.action);
                });
            });
        }

        // Cerrar dropdowns al hacer click fuera
        document.addEventListener('click', () => {
            dropdown?.classList.remove('open');
            magicMenu?.classList.remove('open');
        }, { once: false, capture: false });

        // Tab switching
        if (onTabChange) {
            document.querySelectorAll('.ph-tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.ph-tab-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    onTabChange(btn.dataset.tab);
                });
            });
        }

        // Logout
        document.getElementById('btnLogout')?.addEventListener('click', async (e) => {
            e.preventDefault();
            await store.dispatch({ type: 'LOGOUT_USER' });
            navigateTo('/');
        });
    }

    // Alias de compatibilidad con vistas V9 que aún llamen a .execute()
    static execute(onTabChange = null, onMagicAction = null) {
        this.afterRender(onTabChange, onMagicAction);
    }
}
