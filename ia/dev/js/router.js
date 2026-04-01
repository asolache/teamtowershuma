// =============================================================================
// TEAMTOWERS SOS V10 — ROUTER
// =============================================================================

import { store } from './core/store.js';

const BASE_PATH  = '/ia/dev';
const VIEWS_PATH = `${BASE_PATH}/js/views`;
const V          = '?v=10.9.1';

// Guard contra ejecuciones simultáneas del router
let _routing = false;

function getRoutePath() {
    const raw = window.location.pathname.replace(/\/$/, '') || '/';
    if (raw.startsWith(BASE_PATH)) {
        return raw.slice(BASE_PATH.length).replace(/\/$/, '') || '/';
    }
    return raw;
}

const ROUTES = [
    { path: '/',          view: () => import(`${VIEWS_PATH}/HomeView.js${V}`)           },
    { path: '/ia',        view: () => import(`${VIEWS_PATH}/HomeView.js${V}`)           },
    { path: '/dashboard', view: () => import(`${VIEWS_PATH}/DashboardView.js${V}`)      },
    { path: '/map',       view: () => import(`${VIEWS_PATH}/ValueMapView.js${V}`)       },
    { path: '/paper',     view: () => import(`${VIEWS_PATH}/PaperView.js${V}`)          },
    { path: '/focus',     view: () => import(`${VIEWS_PATH}/PaperView.js${V}`)          },
    { path: '/lms',       view: () => import(`${VIEWS_PATH}/LmsView.js${V}`)            },
    { path: '/manifesto', view: () => import(`${VIEWS_PATH}/LmsView.js${V}`)            },
    { path: '/team',      view: () => import(`${VIEWS_PATH}/TeamView.js${V}`)           },
    { path: '/identity',  view: () => import(`${VIEWS_PATH}/TeamView.js${V}`)           },
    { path: '/agentes',   view: () => import(`${VIEWS_PATH}/TeamView.js${V}`)           },
    { path: '/ledger',    view: () => import(`${VIEWS_PATH}/LedgerView.js${V}`)         },
    { path: '/project',   view: () => import(`${VIEWS_PATH}/ProjectView.js${V}`)        },
    { path: '/create',    view: () => import(`${VIEWS_PATH}/ProjectCreatorView.js${V}`) },
    { path: '/settings',  view: () => import(`${VIEWS_PATH}/SettingsView.js${V}`)       },
    { path: '/pantheon',  view: () => import(`${VIEWS_PATH}/SettingsView.js${V}`)       },
    { path: '/profile',   view: () => import(`${VIEWS_PATH}/ProfileView.js${V}`)        },
    { path: '/tests',     view: () => import(`${VIEWS_PATH}/TestsView.js${V}`)          },
    { path: null,         view: () => import(`${VIEWS_PATH}/HomeView.js${V}`)           },
];

async function router() {
    if (_routing) return;   // evitar ejecuciones simultáneas
    _routing = true;

    const path  = getRoutePath();
    const match = ROUTES.find(r => r.path === path) ?? ROUTES.find(r => r.path === null);
    const app   = document.getElementById('app');

    try {
        await store.init();

        const module    = await match.view();
        const ViewClass = module.default;
        const view      = new ViewClass();

        app.innerHTML = await view.getHtml();

        if (typeof view.afterRender          === 'function') await view.afterRender();
        else if (typeof view.executeViewScript === 'function') await view.executeViewScript();

        // Bind links SPA — solo los no vinculados aún
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
        if (app) app.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100dvh;
                        flex-direction:column;gap:1.5rem;color:#888;font-family:monospace;background:#050507;">
                <div style="font-size:3rem;">💥</div>
                <div style="color:#ff5252;font-size:0.85rem;max-width:480px;text-align:center;line-height:1.5;">${err.message}</div>
                <button onclick="window.location.href='/ia/dev/'"
                        style="background:rgba(99,102,241,0.15);border:1px solid #6366f1;color:#6366f1;
                               padding:10px 20px;border-radius:10px;cursor:pointer;font-family:monospace;font-size:0.82rem;">
                    ← Volver al inicio
                </button>
            </div>`;
    } finally {
        _routing = false;
        // Ocultar bootloader si existe
        const boot = document.getElementById('bootloader');
        if (boot) boot.classList.add('hidden');
    }
}

export function navigateTo(url) {
    const fullUrl = url.startsWith(BASE_PATH) ? url : BASE_PATH + url;
    window.history.pushState(null, null, fullUrl);
    router();
}

window.navigateTo = navigateTo;
window.addEventListener('popstate', router);

// Un solo listener global para links — sin duplicados
document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link && !link._linked) {
        e.preventDefault();
        navigateTo(link.getAttribute('href'));
    }
});

// Arranque inicial
router();

