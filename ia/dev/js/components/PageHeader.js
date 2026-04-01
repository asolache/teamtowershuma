// =============================================================================
// TEAMTOWERS SOS V10 — PAGE HEADER
// Ruta: ia/dev/js/components/PageHeader.js
// Header sticky · Tabs · Magic Actions · User Menu
// =============================================================================

import { store } from '../core/store.js';

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

        // Tabs
        const tabsHtml = config.tabs?.length > 0 ? `
            <div class="ph-bottom-row">
                <div class="ph-tabs">
                    ${config.tabs.map(t => `
                    <button class="ph-tab ${t.active ? 'active' : ''}" data-tab="${t.id}">
                        ${t.label}${t.badge ? ` <span style="background:var(--accent-orange);color:black;font-size:0.6rem;padding:1px 6px;border-radius:9999px;font-weight:900;margin-left:4px;">${t.badge}</span>` : ''}
                    </button>`).join('')}
                </div>
            </div>` : '';

        // Magic Actions
        const magicBtnHtml = config.magicActions?.length > 0 ? `
            <button class="ph-btn-magic" id="btnMagicDropdown">✨ Acciones IA ▾</button>
            <div class="ph-magic-menu" id="magicMenu">
                ${config.magicActions.map(a => `
                <div class="ph-magic-item" data-action="${a.id}">
                    <span class="ph-magic-icon">${a.icon || '⚡'}</span>
                    <div class="ph-magic-text">
                        <div class="ph-magic-title">${a.label}</div>
                        <div class="ph-magic-cost">${a.tokens ? `⚡ ${a.tokens} tokens` : '⚙️ Acción'}</div>
                    </div>
                </div>`).join('')}
            </div>` : '';

        return `
        <style>
            .page-header {
                background: linear-gradient(180deg,rgba(20,20,25,0.95),rgba(20,20,25,0.5));
                border-bottom: 1px solid var(--glass-border);
                padding: 1.5rem 3rem;
                margin: -2rem -3rem 2rem -3rem;
                display: flex; flex-direction: column; gap: 1rem;
                position: sticky; top: 0; z-index: 50;
                backdrop-filter: blur(12px);
                flex-shrink: 0;
            }
            .ph-top-row { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; }
            .ph-title-group { display:flex; flex-direction:column; gap:4px; }
            .ph-title { font-size:1.8rem; font-weight:900; color:white; margin:0; letter-spacing:-0.5px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
            .ph-subtitle { font-size:0.78rem; color:var(--accent-indigo,#6366f1); font-family:var(--font-mono,monospace); font-weight:700; text-transform:uppercase; letter-spacing:1px; border:1px solid rgba(99,102,241,0.3); padding:2px 8px; border-radius:6px; background:rgba(99,102,241,0.08); }
            .ph-tagline { font-size:0.85rem; color:var(--text-muted,#5c5c70); font-style:italic; }

            .ph-actions-group { display:flex; align-items:center; gap:12px; position:relative; flex-shrink:0; }

            .ph-user-menu { display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.4); border:1px solid var(--glass-border); padding:6px 12px; border-radius:10px; cursor:pointer; transition:0.2s; position:relative; }
            .ph-user-menu:hover { background:rgba(255,255,255,0.05); }
            .ph-avatar { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,var(--accent-indigo,#6366f1),var(--accent-purple,#e040fb)); display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:900; color:white; flex-shrink:0; }
            .ph-user-name { font-size:0.8rem; font-weight:700; color:white; }

            .ph-user-dropdown { position:absolute; top:calc(100% + 8px); right:0; background:rgba(15,15,20,0.98); border:1px solid var(--glass-border); border-radius:10px; min-width:160px; z-index:200; display:none; flex-direction:column; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.7); }
            .ph-user-dropdown.active { display:flex; }
            .ph-dd-item { padding:10px 14px; color:#ccc; font-size:0.83rem; cursor:pointer; transition:0.15s; text-decoration:none; display:block; }
            .ph-dd-item:hover { background:rgba(255,255,255,0.05); color:white; }
            .ph-dd-item.danger { color:var(--accent-red,#ff5252); }

            .ph-btn-magic { background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(224,64,251,0.1)); border:1px solid rgba(99,102,241,0.3); color:white; padding:7px 14px; border-radius:10px; font-weight:bold; cursor:pointer; transition:0.3s; font-size:0.83rem; }
            .ph-btn-magic:hover { box-shadow:0 0 15px rgba(99,102,241,0.3); }

            .ph-magic-menu { position:absolute; top:110%; right:0; background:rgba(15,15,20,0.98); border:1px solid var(--accent-indigo,#6366f1); border-radius:12px; width:260px; box-shadow:0 15px 40px rgba(0,0,0,0.8); display:none; flex-direction:column; overflow:hidden; z-index:201; }
            .ph-magic-menu.active { display:flex; }
            .ph-magic-item { padding:11px 14px; display:flex; align-items:center; gap:12px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.05); transition:0.15s; }
            .ph-magic-item:last-child { border-bottom:none; }
            .ph-magic-item:hover { background:rgba(99,102,241,0.1); }
            .ph-magic-icon { font-size:1.3rem; }
            .ph-magic-title { color:white; font-weight:bold; font-size:0.85rem; }
            .ph-magic-cost  { color:var(--accent-orange,#ff9100); font-size:0.68rem; font-family:var(--font-mono,monospace); }

            .ph-bottom-row { border-top:1px solid rgba(255,255,255,0.06); padding-top:0.75rem; margin-top:0.25rem; }
            .ph-tabs { display:flex; gap:6px; overflow-x:auto; scrollbar-width:none; }
            .ph-tabs::-webkit-scrollbar { display:none; }
            .ph-tab { background:transparent; border:none; color:var(--text-muted,#5c5c70); font-size:0.85rem; font-weight:800; padding:7px 14px; cursor:pointer; border-radius:8px; transition:0.2s; white-space:nowrap; font-family:var(--font-base,inherit); }
            .ph-tab:hover { color:white; background:rgba(255,255,255,0.05); }
            .ph-tab.active { background:rgba(99,102,241,0.12); color:var(--accent-indigo,#6366f1); }

            @media (max-width:768px) {
                .page-header { padding:1rem; margin:-2rem -1rem 1.5rem -1rem; }
                .ph-title { font-size:1.4rem; }
                .ph-top-row { flex-direction:column; gap:0.75rem; }
                .ph-actions-group { width:100%; justify-content:flex-end; }
            }
        </style>

        <header class="page-header">
            <div class="ph-top-row">
                <div class="ph-title-group">
                    <h1 class="ph-title">
                        ${config.title}
                        ${config.subtitle ? `<span class="ph-subtitle">${config.subtitle}</span>` : ''}
                    </h1>
                    ${config.tagline ? `<div class="ph-tagline">${config.tagline}</div>` : ''}
                </div>

                <div class="ph-actions-group">
                    ${config.actionHtml || ''}
                    ${magicBtnHtml}

                    <div class="ph-user-menu" id="btnUserMenu">
                        <div class="ph-avatar">${initial}</div>
                        <span class="ph-user-name">${user?.name || 'Guest'}</span>
                        <span style="color:var(--text-muted,#5c5c70); font-size:0.7rem;">▾</span>

                        <div class="ph-user-dropdown" id="userDropdown">
                            <a href="/profile" data-link class="ph-dd-item">👤 Mi Perfil</a>
                            <a href="/settings" data-link class="ph-dd-item">⚙️ Panteón</a>
                            <div class="ph-dd-item danger" id="ddLogout">✖ Cerrar Sesión</div>
                        </div>
                    </div>
                </div>
            </div>

            ${tabsHtml}
        </header>`;
    }

    // ── afterRender V10 ───────────────────────────────────────────
    static afterRender(onTabChange, onMagicAction) {
        // User menu toggle
        document.getElementById('btnUserMenu')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('userDropdown')?.classList.toggle('active');
            document.getElementById('magicMenu')?.classList.remove('active');
        });

        // Logout desde dropdown
        document.getElementById('ddLogout')?.addEventListener('click', async () => {
            await store.dispatch({ type: 'LOGOUT' });
            if (typeof window.navigateTo === 'function') window.navigateTo('/');
            else window.location.href = '/';
        });

        // Magic menu toggle
        document.getElementById('btnMagicDropdown')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('magicMenu')?.classList.toggle('active');
            document.getElementById('userDropdown')?.classList.remove('active');
        });

        // Magic items
        if (typeof onMagicAction === 'function') {
            document.querySelectorAll('.ph-magic-item').forEach(item => {
                item.addEventListener('click', () => {
                    document.getElementById('magicMenu')?.classList.remove('active');
                    onMagicAction(item.dataset.action);
                });
            });
        }

        // Tabs
        if (typeof onTabChange === 'function') {
            document.querySelectorAll('.ph-tab').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.ph-tab').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    onTabChange(btn.dataset.tab);
                });
            });
        }

        // Cerrar menús al click fuera
        document.addEventListener('click', () => {
            document.getElementById('userDropdown')?.classList.remove('active');
            document.getElementById('magicMenu')?.classList.remove('active');
        }, { once: false, capture: false });
    }

    // ── Alias V9 ──────────────────────────────────────────────────
    static execute(onTabChange, onMagicAction) {
        return PageHeader.afterRender(onTabChange, onMagicAction);
    }
}
