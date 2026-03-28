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
            { path: '/dashboard', icon: '🛰️', label: 'Ojo del Castell'       },
            { path: '/map',       icon: '🕸️', label: 'Topología VNA'         },
            { path: '/project',   icon: '📋', label: 'Mercado PULL'           },
            { path: '/paper',     icon: '📝', label: 'Omni-Paper'             },
            { path: '/team',      icon: '👥', label: 'Padrón de Nodos'        },
            { path: '/ledger',    icon: '⚖️', label: 'Notaría Slicing Pie'    },
            { path: '/lms',       icon: '🧠', label: 'La Forja (Córtex W3C)' },
            { path: '/settings',  icon: '⚙️', label: 'Panteón Global'         },
            { path: '/tests',     icon: '🩺', label: 'Test Antigravity'       }
        ];

        const navHtml = navItems.map(item => {
            const isActive = currentPath === item.path ? 'active' : '';
            return `<a href="${item.path}" class="side-link ${isActive}" data-link title="${item.label}">
                <span class="icon">${item.icon}</span>
                <span class="text">${item.label}</span>
            </a>`;
        }).join('');

        const visibleProjects = state.projects.filter(p => !p.isArchived || p.id === currentActiveId);
        const ecoOptions = visibleProjects.map(p =>
            `<option value="${p.id}" ${p.id === (project?.id || '') ? 'selected' : ''}>${p.isArchived ? '[ARC] ' : ''}${p.nombre}</option>`
        ).join('');

        return `
        <style>
            #mainSidebar {
                width: var(--sidebar-width, 260px);
                background: rgba(8,8,12,0.98);
                border-right: 1px solid var(--glass-border);
                padding: 1.5rem 1rem;
                display: flex; flex-direction: column;
                z-index: 100; flex-shrink: 0; overflow-y: auto;
                height: 100dvh;
                transition: width 0.3s ease;
                box-sizing: border-box;
            }
            #mainSidebar.collapsed { width: 72px; padding: 1.5rem 0.5rem; align-items: center; }
            #mainSidebar.collapsed .text,
            #mainSidebar.collapsed .eco-wrap,
            #mainSidebar.collapsed .sec-label { display: none; }

            .sb-logo { display:flex; align-items:center; gap:10px; margin-bottom:1.5rem; text-decoration:none; padding:0 0.25rem; }
            .sb-logo-icon { font-size:1.6rem; }
            .sb-logo-name { font-size:1rem; font-weight:900; color:white; line-height:1.2; }
            .sb-logo-sub  { font-size:0.6rem; color:var(--accent-indigo,#6366f1); font-family:var(--font-mono,monospace); font-weight:700; }

            .eco-wrap { margin-bottom:1.25rem; }
            .eco-lbl  { font-size:0.6rem; color:var(--text-muted,#5c5c70); text-transform:uppercase; letter-spacing:1.5px; font-weight:700; margin-bottom:4px; }
            .eco-sel  { width:100%; background:rgba(0,0,0,0.5); border:1px solid var(--glass-border); border-radius:8px; color:white; padding:7px 9px; font-size:0.8rem; outline:none; cursor:pointer; }
            .eco-sel:focus { border-color:var(--accent-indigo,#6366f1); }

            .sec-label { font-size:0.6rem; color:var(--text-muted,#5c5c70); text-transform:uppercase; letter-spacing:1.5px; font-weight:700; padding:0.5rem 0.25rem; margin-top:0.5rem; }

            .side-link { padding:0.6rem 0.8rem; border-radius:9px; color:var(--text-muted,#5c5c70); display:flex; align-items:center; text-decoration:none; font-weight:600; gap:10px; font-size:0.87rem; transition:all 0.15s; margin-bottom:2px; }
            .side-link:hover  { background:rgba(255,255,255,0.05); color:white; transform:translateX(2px); }
            .side-link.active { background:rgba(99,102,241,0.12); color:var(--accent-indigo,#6366f1); }
            .side-link .icon  { font-size:1rem; flex-shrink:0; }

            .sb-footer { margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--glass-border); }
            .sb-user   { display:flex; align-items:center; gap:10px; padding:0.6rem 0.8rem; border-radius:9px; background:rgba(0,0,0,0.3); }
            .sb-avatar { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,var(--accent-indigo,#6366f1),var(--accent-purple,#e040fb)); display:flex; align-items:center; justify-content:center; font-size:0.82rem; font-weight:900; color:white; flex-shrink:0; }
            .sb-user-name { font-size:0.8rem; font-weight:700; color:white; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
            .sb-user-role { font-size:0.62rem; color:var(--text-muted,#5c5c70); font-family:var(--font-mono,monospace); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

            .btn-sb-toggle { display:flex; align-items:center; justify-content:center; width:100%; padding:6px; border-radius:7px; background:transparent; border:1px solid var(--glass-border); color:var(--text-muted,#5c5c70); cursor:pointer; transition:0.2s; margin-top:6px; font-size:0.8rem; font-weight:bold; }
            .btn-sb-toggle:hover { background:rgba(255,255,255,0.05); color:white; }
            .btn-sb-logout { width:100%; padding:6px; border-radius:7px; background:transparent; border:1px solid rgba(255,82,82,0.25); color:var(--accent-red,#ff5252); cursor:pointer; transition:0.2s; margin-top:5px; font-size:0.78rem; font-weight:bold; }
            .btn-sb-logout:hover { background:rgba(255,82,82,0.1); }

            @media (max-width:768px) { #mainSidebar { display:none !important; } }
        </style>

        <aside id="mainSidebar" class="${isMin ? 'collapsed' : ''}">
            <a href="/" data-link class="sb-logo">
                <span class="sb-logo-icon">🗼</span>
                <div class="text">
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
                <div class="sb-user">
                    <div class="sb-avatar">${activeUserName.charAt(0).toUpperCase()}</div>
                    <div class="text" style="overflow:hidden; min-width:0;">
                        <div class="sb-user-name">${activeUserName}</div>
                        <div class="sb-user-role">${projectLabel}</div>
                    </div>
                </div>
                <button class="btn-sb-toggle text" id="btnToggleSidebar">◀ Colapsar</button>
                <button class="btn-sb-logout" id="btnLogout">✖ Cerrar Sesión</button>
            </div>
        </aside>`;
    }

    static initListeners() {
        document.getElementById('btnToggleSidebar')?.addEventListener('click', () => {
            const sb = document.getElementById('mainSidebar');
            if (!sb) return;
            const col = sb.classList.toggle('collapsed');
            localStorage.setItem('tt_sidebar_min', String(col));
            const btn = document.getElementById('btnToggleSidebar');
            if (btn) btn.textContent = col ? '▶' : '◀ Colapsar';
        });

        document.getElementById('sidebarEcoSelector')?.addEventListener('change', (e) => {
            localStorage.setItem('tt_active_project', e.target.value);
            window.location.reload();
        });

        document.getElementById('btnLogout')?.addEventListener('click', async () => {
            await store.dispatch({ type: 'LOGOUT' });
            if (typeof window.navigateTo === 'function') window.navigateTo('/');
            else window.location.href = '/';
        });
    }
}
