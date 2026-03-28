// =============================================================================
// TEAMTOWERS SOS V10 — ROUTER
// Rutas relativas — Netlify publica desde ia/dev/ como raíz
// =============================================================================

import { store } from './core/store.js';

const ROUTES = [
    { path: '/',          view: () => import('./views/HomeView.js')           },
    { path: '/ia',        view: () => import('./views/HomeView.js')           },
    { path: '/dashboard', view: () => import('./views/DashboardView.js')      },
    { path: '/map',       view: () => import('./views/ValueMapView.js')       },
    { path: '/paper',     view: () => import('./views/PaperView.js')          },
    { path: '/focus',     view: () => import('./views/PaperView.js')          },
    { path: '/lms',       view: () => import('./views/LmsView.js')            },
    { path: '/manifesto', view: () => import('./views/LmsView.js')            },
    { path: '/team',      view: () => import('./views/AgentEditorView.js')    },
    { path: '/identity',  view: () => import('./views/AgentEditorView.js')    },
    { path: '/agentes',   view: () => import('./views/AgentEditorView.js')    },
    { path: '/ledger',    view: () => import('./views/LedgerView.js')         },
    { path: '/project',   view: () => import('./views/ProjectView.js')        },
    { path: '/create',    view: () => import('./views/ProjectCreatorView.js') },
    { path: '/settings',  view: () => import('./views/SettingsView.js')       },
    { path: '/pantheon',  view: () => import('./views/SettingsView.js')       },
    { path: '/profile',   view: () => import('./views/ProfileView.js')        },
    { path: '/tests',     view: () => import('./views/TestsView.js')          },
    { path: null,         view: () => import('./views/HomeView.js')           },
];

async function router() {
    const path  = window.location.pathname.replace(/\/$/, '') || '/';
    const match = ROUTES.find(r => r.path === path) ?? ROUTES.find(r => r.path === null);
    const app   = document.getElementById('app');

    try {
        await store.init();

        const module    = await match.view();
        const ViewClass = module.default;
        const view      = new ViewClass();

        app.innerHTML = await view.getHtml();

        // Soporte V10 (afterRender) y alias V9 (executeViewScript)
        if (typeof view.afterRender         === 'function') await view.afterRender();
        else if (typeof view.executeViewScript === 'function') await view.executeViewScript();

        // Activar links SPA — evitar doble bind
        document.querySelectorAll('[data-link]').forEach(link => {
            if (link._linked) return;
            link._linked = true;
            link.addEventListener('click', e => {
                e.preventDefault();
                navigateTo(link.getAttribute('href'));
            });
        });

    } catch (err) {
        console.error('[V10 Router]', err);
        app.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100dvh;
                        flex-direction:column;gap:1.5rem;color:#888;font-family:monospace;background:#050507;">
                <div style="font-size:3rem;">💥</div>
                <div style="color:#ff5252;font-size:0.9rem;max-width:420px;text-align:center;">${err.message}</div>
                <button onclick="window.location.href='/'"
                        style="background:rgba(99,102,241,0.2);border:1px solid #6366f1;color:#6366f1;
                               padding:10px 20px;border-radius:10px;cursor:pointer;font-family:monospace;">
                    ← Volver al inicio
                </button>
            </div>`;
    } finally {
        window.bootDone?.();
    }
}

export function navigateTo(url) {
    window.history.pushState(null, null, url);
    router();
}

window.navigateTo = navigateTo;
window.addEventListener('popstate', router);

document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link && !link._linked) {
        e.preventDefault();
        navigateTo(link.getAttribute('href'));
    }
});

router();
