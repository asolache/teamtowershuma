// =============================================================================
// TEAMTOWERS SOS V10 — SIDEBAR
// Ruta: ia/dev/js/components/Sidebar.js
// =============================================================================

import { store } from '../core/store.js';

export class Sidebar {

    static getHtml(currentPath = '') {
        const state        = store.getState();
        const activeUserId = state.session.activeUserId;
        const isMin        = localStorage.getItem('tt_sidebar_min') === 'true';

        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project && state.projects.length > 0) {
            project = state.projects.find(p => !p.isArchived) || state.projects[0];
        }

        const activeUserName = activeUserId
            ? (state.globalUsers.find(u => u.id === activeUserId)?.name || activeUserId)
            : 'Guest';
        const projectLabel = project ? project.nombre : 'Sin ecosistema';

        const navItems = [
            { path: '/paper',     icon: '💬', label: 'Chat · La Reina'           },
            { path: '/dashboard', icon: '🛰️', label: 'Ojo del Castell'           },
            { path: '/map',       icon: '🕸️', label: 'Topología VNA'             },
            { path: '/project',   icon: '📋', label: 'Mercado PULL'               },
            { path: '/team',      icon: '👥', label: 'Padrón de Nodos'            },
            { path: '/ledger',    icon: '⚖️', label: 'Notaría Slicing Pie'        },
            { path: '/lms',       icon: '🧠', label: 'La Forja (Córtex W3C)'     },
            { path: '/settings',  icon: '⚙️', label: 'Panteón Global'             },
            { path: '/tests',     icon: '🩺', label: 'Test Antigravity'           }
        ];

        const navHtml = navItems.map(item => {
            const isActive = currentPath === item.path ? 'active' : '';
            return `<a href="${item.path}" class="side-link ${isActive}" data-link title="${item.label}">
                <span class="sb-icon">${item.icon}</span>
                <span class="sb-text">${item.label}</span>
            </a>`;
        }).join('');

        const visibleProjects = state.projects.filter(p => !p.isArchived || p.id === currentActiveId);
        const ecoOptions = visibleProjects.map(p =>
            `<option value="${p.id}" ${p.id === (project?.id || '') ? 'selected' : ''}>${p.isArchived ? '[ARC] ' : ''}${p.nombre}</option>`
        ).join('');

        return `
        <style>
            /* ── Sidebar wrapper ─────────────────────────────── */
            .sb-wrap {
                position: relative;
                display: flex;
                flex-shrink: 0;
                height: 100dvh;
            }

            /* ── Sidebar principal ───────────────────────────── */
            #mainSidebar {
                width: 260px;
                background: rgba(8,8,12,0.98);
                border-right: 1px solid var(--glass-border,rgba(255,255,255,0.07));
                padding: 1.5rem 1rem;
                display: flex;
                flex-direction: column;
                z-index: 100;
                overflow-y: auto;
                overflow-x: hidden;
                height: 100dvh;
                transition: width 0.25s ease, padding 0.25s ease;
                box-sizing: border-box;
            }
            #mainSidebar.collapsed {
                width: 64px;
                padding: 1.5rem 0.5rem;
                align-items: center;
            }
            #mainSidebar.collapsed .sb-text,
            #mainSidebar.collapsed .eco-wrap,
            #mainSidebar.collapsed .sec-label,
            #mainSidebar.collapsed .sb-user-info,
            #mainSidebar.collapsed .btn-sb-logout { display: none; }
            #mainSidebar.collapsed .sb-logo { justify-content: center; }
            #mainSidebar.collapsed .side-link { justify-content: center; padding: 0.6rem; }
            #mainSidebar.collapsed .sb-user { justify-content: center; }

            /* ── Toggle tab — pegado al borde derecho del sidebar ── */
            #btnToggleSidebar {
                position: absolute;
                right: -14px;
                top: 50%;
                transform: translateY(-50%);
                z-index: 200;
                width: 20px;
                height: 48px;
                background: rgba(8,8,12,0.98);
                border: 1px solid var(--glass-border,rgba(255,255,255,0.07));
                border-left: none;
                border-radius: 0 8px 8px 0;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(255,255,255,0.3);
                font-size: 0.7rem;
                transition: color 0.2s, background 0.2s;
                padding: 0;
            }
            #btnToggleSidebar:hover {
                color: white;
                background: rgba(99,102,241,0.15);
            }

            /* ── Logo ────────────────────────────────────────── */
            .sb-logo { display:flex; align-items:center; gap:10px; margin-bottom:1.5rem;
                text-decoration:none; padding:0 0.25rem; flex-shrink:0; overflow:hidden; }
            .sb-logo-icon { font-size:1.6rem; flex-shrink:0; }
            .sb-logo-name { font-size:1rem; font-weight:900; color:white; line-height:1.2; }
            .sb-logo-sub  { font-size:0.6rem; color:var(--accent-indigo,#6366f1);
                font-family:var(--font-mono,monospace); font-weight:700; }

            /* ── Eco selector ────────────────────────────────── */
            .eco-wrap { margin-bottom:1.25rem; overflow:hidden; }
            .eco-lbl  { font-size:0.6rem; color:var(--text-muted,#5c5c70); text-transform:uppercase;
                letter-spacing:1.5px; font-weight:700; margin-bottom:4px; }
            .eco-sel  { width:100%; background:rgba(0,0,0,0.5);
                border:1px solid var(--glass-border,rgba(255,255,255,0.07));
                border-radius:8px; color:white; padding:7px 9px; font-size:0.8rem;
                outline:none; cursor:pointer; }
            .eco-sel:focus { border-color:var(--accent-indigo,#6366f1); }

            .sec-label { font-size:0.6rem; color:var(--text-muted,#5c5c70); text-transform:uppercase;
                letter-spacing:1.5px; font-weight:700; padding:0.5rem 0.25rem; margin-top:0.5rem; }

            /* ── Nav links ───────────────────────────────────── */
            .side-link { padding:0.6rem 0.8rem; border-radius:9px;
                color:var(--text-muted,#5c5c70); display:flex; align-items:center;
                text-decoration:none; font-weight:600; gap:10px; font-size:0.87rem;
                transition:all 0.15s; margin-bottom:2px; overflow:hidden; white-space:nowrap; }
            .side-link:hover  { background:rgba(255,255,255,0.05); color:white; }
            .side-link.active { background:rgba(99,102,241,0.12); color:var(--accent-indigo,#6366f1); }
            .sb-icon { font-size:1rem; flex-shrink:0; }

            /* ── Footer ──────────────────────────────────────── */
            .sb-footer { margin-top:auto; padding-top:0.75rem;
                border-top:1px solid var(--glass-border,rgba(255,255,255,0.07)); }
            .sb-user  { display:flex; align-items:center; gap:10px; padding:0.6rem 0.8rem;
                border-radius:9px; background:rgba(0,0,0,0.3); overflow:hidden; }
            .sb-avatar { width:30px; height:30px; border-radius:50%; flex-shrink:0;
                background:linear-gradient(135deg,var(--accent-indigo,#6366f1),var(--accent-purple,#e040fb));
                display:flex; align-items:center; justify-content:center;
                font-size:0.82rem; font-weight:900; color:white; }
            .sb-user-info { overflow:hidden; min-width:0; }
            .sb-user-name { font-size:0.8rem; font-weight:700; color:white;
                overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            .sb-user-role { font-size:0.62rem; color:var(--text-muted,#5c5c70);
                font-family:var(--font-mono,monospace);
                overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            .btn-sb-logout { width:100%; padding:6px; border-radius:7px;
                background:transparent; border:1px solid rgba(255,82,82,0.25);
                color:var(--accent-red,#ff5252); cursor:pointer; transition:0.2s;
                margin-top:5px; font-size:0.78rem; font-weight:bold; }
            .btn-sb-logout:hover { background:rgba(255,82,82,0.1); }

            @media (max-width:768px) {
                .sb-wrap { display:none; }
            }
        </style>

        <div class="sb-wrap" id="sbWrap">
            <aside id="mainSidebar" class="${isMin ? 'collapsed' : ''}">
                <a href="/" data-link class="sb-logo">
                    <span class="sb-logo-icon">🗼</span>
                    <div class="sb-text">
                        <div class="sb-logo-name">TeamTowers</div>
                        <div class="sb-logo-sub">SOS V10 · Antigravity</div>
                    </div>
                </a>

                ${ecoOptions ? `
                <div class="eco-wrap">
                    <div class="eco-lbl">Ecosistema Activo</div>
                    <select class="eco-sel" id="sidebarEcoSelector">${ecoOptions}</select>
                </div>` : ''}

                <div class="sec-label">Navegación</div>
                <nav>${navHtml}</nav>

                <div class="sb-footer">
                    <!-- Monitor de actividad IA -->
                    <div id="aiMonitorMount"></div>

                    <div class="sb-user" id="sbUserArea" style="cursor:pointer;" title="Cambiar usuario">
                        <div class="sb-avatar">${activeUserName.charAt(0).toUpperCase()}</div>
                        <div class="sb-user-info">
                            <div class="sb-user-name">${activeUserName}</div>
                            <div class="sb-user-role">${state.session.role || 'guest'}</div>
                        </div>
                        <span style="color:#333;font-size:0.7rem;flex-shrink:0;">⇅</span>
                    </div>
                    <!-- Panel de switch de usuario (oculto por defecto) -->
                    <div id="sbLoginPanel" style="display:none;margin-top:6px;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.06);border-radius:9px;padding:8px;max-height:180px;overflow-y:auto;">
                        <div style="font-size:0.6rem;color:#444;text-transform:uppercase;font-weight:bold;margin-bottom:6px;padding:0 4px;">Cambiar identidad</div>
                        ${state.globalUsers.filter(u => !u.profile?.isAi).map(u => `
                        <button class="btn-login-user" data-uid="${u.id}"
                            style="width:100%;text-align:left;padding:6px 8px;background:${u.id===activeUserId?'rgba(99,102,241,0.12)':'transparent'};border:none;border-radius:6px;cursor:pointer;font-size:0.76rem;color:${u.id===activeUserId?'#6366f1':'#888'};display:flex;align-items:center;gap:7px;transition:0.15s;margin-bottom:2px;">
                            <span style="width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#e040fb);display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:bold;color:white;flex-shrink:0;">${(u.name||u.id).charAt(0).toUpperCase()}</span>
                            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${u.name||u.id}</span>
                            ${u.globalRole==='ecosystem-owner'?'<span style="font-size:0.55rem;color:#e040fb;margin-left:auto;flex-shrink:0;">owner</span>':''}
                            ${u.id===activeUserId?'<span style="font-size:0.65rem;margin-left:auto;flex-shrink:0;">✓</span>':''}
                        </button>`).join('')}
                    </div>
                </div>
            </aside>

            <!-- Toggle tab pegado al borde derecho -->
            <button id="btnToggleSidebar" title="Expandir / Colapsar sidebar">
                <span id="sbToggleIcon">${isMin ? '▶' : '◀'}</span>
            </button>
        </div>`;
    }

    static initListeners() {
        const sb   = document.getElementById('mainSidebar');
        const btn  = document.getElementById('btnToggleSidebar');
        const icon = document.getElementById('sbToggleIcon');

        // ── Montar el monitor de actividad IA ─────────────────────
        import('../core/../components/AiActivityMonitor.js').then(({ AiActivityMonitor }) => {
            AiActivityMonitor.mount('aiMonitorMount');
        }).catch(() => {});  // silencioso si no carga

        btn?.addEventListener('click', () => {
            if (!sb) return;
            const col = sb.classList.toggle('collapsed');
            localStorage.setItem('tt_sidebar_min', String(col));
            if (icon) icon.textContent = col ? '▶' : '◀';
        });

        // Guard: evitar que el change inicial del select cause reload
        let _ecoSelectorReady = false;
        const ecoSel = document.getElementById('sidebarEcoSelector');
        if (ecoSel) {
            setTimeout(() => { _ecoSelectorReady = true; }, 300);
            ecoSel.addEventListener('change', (e) => {
                if (!_ecoSelectorReady) return;
                localStorage.setItem('tt_active_project', e.target.value);
                // navigateTo en lugar de reload — evita el loop
                if (typeof window.navigateTo === 'function') window.navigateTo('/dashboard');
                else window.location.reload();
            });
        }

        // ── Toggle panel de login ─────────────────────────────────
        document.getElementById('sbUserArea')?.addEventListener('click', () => {
            const panel = document.getElementById('sbLoginPanel');
            if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });

        // ── Switch de usuario ─────────────────────────────────────
        document.querySelectorAll('.btn-login-user').forEach(btn => {
            btn.addEventListener('mouseenter', () => { btn.style.color = 'white'; btn.style.background = 'rgba(255,255,255,0.05)'; });
            btn.addEventListener('mouseleave', () => {
                const state = store.getState();
                const isActive = btn.dataset.uid === state.session.activeUserId;
                btn.style.color = isActive ? '#6366f1' : '#888';
                btn.style.background = isActive ? 'rgba(99,102,241,0.12)' : 'transparent';
            });
            btn.addEventListener('click', async () => {
                const uid = btn.dataset.uid;
                await store.dispatch({ type: 'LOGIN_USER', payload: { userId: uid } });
                // Recargar la vista actual para reflejar el cambio de usuario
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo(window.location.pathname.replace('/ia/dev', '') || '/');
                } else {
                    window.location.reload();
                }
            });
        });
    }
}
