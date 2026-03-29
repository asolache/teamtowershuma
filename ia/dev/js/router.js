// =============================================================================
// TEAMTOWERS SOS V10 — ROUTER
// Rutas relativas — Netlify publica desde ia/dev/ como raíz
// BASE_PATH normaliza el pathname para que /ia/dev/map → /map
// =============================================================================

import { store } from './core/store.js';

// ─── BASE PATH ────────────────────────────────────────────────────────────────
// En Netlify el sitio vive en /ia/dev/. Cuando el usuario visita
// https://teamtowershuma.com/ia/dev/map, window.location.pathname es /ia/dev/map.
// navigateTo() ya usa rutas cortas (/map) via pushState, pero en el primer
// render (carga directa o reload) hay que strip del prefijo.
const BASE_PATH = '/ia/dev';

function getRoutePath() {
    const raw  = window.location.pathname.replace(/\/$/, '') || '/';
    // Si el pathname empieza con BASE_PATH, lo quitamos
    if (raw.startsWith(BASE_PATH)) {
        const stripped = raw.slice(BASE_PATH.length).replace(/\/$/, '') || '/';
        return stripped;
    }
    return raw;
}

const VIEWS_PATH = `${BASE_PATH}/js/views`;
const V = '?v=10.1.4'; // ← cambia esto en cada deploy

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
    const path  = getRoutePath();
    const match = ROUTES.find(r => r.path === path) ?? ROUTES.find(r => r.path === null);
    const app   = document.getElementById('app');

    try {
        await store.init();

        const module    = await match.view();
        const ViewClass = module.default;
        const view      = new ViewClass();

        app.innerHTML = await view.getHtml();

        // Soporte V10 (afterRender) y alias V9 (executeViewScript)
        if (typeof view.afterRender          === 'function') await view.afterRender();
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
                <button onclick="window.location.href='/ia/dev/'"
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
    // navigateTo siempre recibe rutas cortas (/map, /dashboard…)
    // Para pushState necesitamos la URL completa con el base path
    const fullUrl = url.startsWith(BASE_PATH) ? url : BASE_PATH + url;
    window.history.pushState(null, null, fullUrl);
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
