// v8/js/router.js
import { store } from './core/store.js';

const routes = {
    '/': 'HomeView',
    // Las demás vistas se irán añadiendo según avancen los Sprints
};

class Router {
    constructor() {
        this.appContainer = document.getElementById('app');
        window.addEventListener('popstate', () => this.handleRoute());
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('[data-link]');
            if (link) { e.preventDefault(); this.navigateTo(link.href); }
        });
    }

    navigateTo(url) {
        window.history.pushState(null, null, url);
        this.handleRoute();
    }

    async handleRoute() {
        let path = window.location.pathname;
        const basePath = '/v8';
        if (path.startsWith(basePath)) path = path.slice(basePath.length);
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path === '' || path === '/') path = '/';

        const viewFileName = routes[path] || 'HomeView';

        try {
            const modulePath = `/v8/js/views/${viewFileName}.js`;
            const { default: View } = await import(modulePath);
            const view = new View();
            this.appContainer.innerHTML = await view.getHtml();
            if (typeof view.executeViewScript === 'function') view.executeViewScript();
            window.scrollTo(0, 0);
        } catch (error) {
            console.error(`💥 Router V8 Error [${viewFileName}]:`, error);
        }
    }
}

const appRouter = new Router();
document.addEventListener('DOMContentLoaded', () => appRouter.handleRoute());
export const navigateTo = (url) => appRouter.navigateTo(url);
