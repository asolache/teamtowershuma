// v5/js/router.js
import { store } from './core/store.js';

const routes = {
    '/': 'HomeView',
    '/create': 'ProjectCreatorView',
    '/dashboard': 'DashboardView',
    '/project': 'ProjectView',
    '/map': 'ValueMapView',
    '/team': 'TeamView',
    '/ledger': 'LedgerView',
    '/settings': 'SettingsView',
    '/focus': 'FocusView',
    '/profile': 'ProfileView'
};

class Router {
    constructor() {
        this.appContainer = document.getElementById('app');
        window.addEventListener('popstate', () => this.handleRoute());
        document.body.addEventListener('click', e => {
            const link = e.target.closest('[data-link]');
            if (link) { e.preventDefault(); this.navigateTo(link.href); }
        });
    }
    navigateTo(url) { window.history.pushState(null, null, url); this.handleRoute(); }
    async handleRoute() {
        let path = window.location.pathname;
        const basePath = '/v5';
        if (path.startsWith(basePath)) path = path.slice(basePath.length);
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path === '' || path === '/') path = '/';

        const viewFileName = routes[path] || 'HomeView';
        try {
            const modulePath = `./views/${viewFileName}.js`;
            const { default: View } = await import(modulePath);
            const view = new View();
            this.appContainer.innerHTML = await view.getHtml();
            if (view.executeViewScript) view.executeViewScript();
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Router Error:", error);
            this.appContainer.innerHTML = `<div style="padding:4rem;text-align:center;color:white;font-family:monospace;">
                <h1 style="color:#ff5252">ERROR DE CARGA</h1><p>${error.message}</p>
                <a href="/v5/" data-link style="color:#00b0ff">[ REBOOT SYSTEM ]</a></div>`;
        }
    }
}
const appRouter = new Router();
document.addEventListener('DOMContentLoaded', () => appRouter.handleRoute());
export const navigateTo = (url) => appRouter.navigateTo(url);
