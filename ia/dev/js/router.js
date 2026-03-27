// =============================================================================
// TEAMTOWERS SOS V10 — ROUTER
// SPA Router · Lazy Views · Antigravity Kernel
// Ruta base: /ia/dev/
// =============================================================================

import { store } from './core/store.js';

// ── REGISTRO DE RUTAS ─────────────────────────────────────────────
const ROUTES = [
    { path: '/ia',          view: () => import('./views/HomeView.js') },
    { path: '/ia/home',     view: () => import('./views/HomeView.js') },
    { path: '/ia/dashboard',view: () => import('./views/DashboardView.js') },
    { path: '/ia/paper',    view: () => import('./views/PaperView.js') },
    { path: '/ia/team',     view: () => import('./views/TeamView.js') },
    { path: '/ia/lms',      view: () => import('./views/LmsView.js') },
    { path: '/ia/map',      view: () => import('./views/ValueMapView.js') },
    { path: '/ia/focus',    view: () => import('./views/FocusView.js') },
    { path: '/ia/ledger',   view: () => import('./views/LedgerView.js') },
    { path: '/ia/settings', view: () => import('./views/SettingsView.js') },
    { path: '/ia/manifesto',view: () => import('./views/ManifestoView.js') },
    // 404
    { path: null,           view: () => import('./views/NotFoundView.js') },
];

// ── ROUTER PRINCIPAL ──────────────────────────────────────────────
async function router() {
    const path = window.location.pathname.replace(/\/$/, '') || '/ia';

    // Buscar ruta coincidente
    const match = ROUTES.find(r => r.path === path) || ROUTES.find(r => r.path === null);

    try {
        // Init store antes de renderizar
        await store.init();

        // Lazy load de la vista
        const module = await match.view();
        const ViewClass = module.default;
        const view = new ViewClass();

        const app = document.getElementById('app');
        app.innerHTML = await view.getHtml();

        // Ejecutar lógica post-render si existe
        if (typeof view.afterRender === 'function') {
            await view.afterRender();
        }

        // Registrar listeners de navegación interna
        document.querySelectorAll('[data-link]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                navigateTo(link.getAttribute('href'));
            });
        });

        // Escuchar eventos SOS de navegación
        window.addEventListener('sos:navigate', (e) => {
            const { view: viewPath } = e.detail || {};
            if (viewPath) navigateTo(`/ia/${viewPath}`);
        }, { once: true });

    } catch (err) {
        console.error('[SOS Router] Error cargando vista:', err);
        document.getElementById('app').innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100dvh;flex-direction:column;gap:1rem;color:#888;font-family:monospace;">
                <div style="font-size:3rem;">💥</div>
                <div style="color:#ff5252;">Error cargando módulo</div>
                <div style="font-size:0.8rem;opacity:0.5;">${err.message}</div>
                <a href="/ia" data-link style="color:#6366f1;margin-top:1rem;">← Volver al inicio</a>
            </div>
        `;
    } finally {
        // Ocultar bootloader
        window.bootDone?.();
    }
}

// ── NAVEGACIÓN PROGRAMÁTICA ───────────────────────────────────────
export function navigateTo(url) {
    window.history.pushState(null, null, url);
    router();
}

// ── EVENT LISTENERS ───────────────────────────────────────────────
window.addEventListener('popstate', router);

// Interceptar clicks globales en [data-link]
document.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link) {
        e.preventDefault();
        navigateTo(link.getAttribute('href'));
    }
});

// ── BOOT ──────────────────────────────────────────────────────────
router();
