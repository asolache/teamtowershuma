// v7/js/router.js

const routes = {
    '/': 'HomeView',
    '/create': 'ProjectCreatorView',
    '/dashboard': 'DashboardView',
    '/project': 'ProjectView',
    '/map': 'ValueMapView',
    '/team': 'TeamView',
    '/ledger': 'LedgerView',
    '/tests': 'TestsView',
    '/manifesto': 'ManifestoView',
    '/network': 'NetworkView',
    '/settings': 'SettingsView',
    '/focus': 'FocusView',
    '/profile': 'ProfileView',
    '/help': 'HelpView',
    '/onboarding': 'OnboardingView'
};

class Router {
    constructor() {
        this.appContainer = document.getElementById('app');
        
        window.addEventListener('popstate', () => this.handleRoute());
        
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('[data-link]');
            if (link) {
                e.preventDefault();
                this.navigateTo(link.href);
            }
        });
    }

    navigateTo(url) {
        window.history.pushState(null, null, url);
        this.handleRoute();
    }

    async handleRoute() {
        let path = window.location.pathname;
        
        const basePath = '/v7';
        if (path.startsWith(basePath)) path = path.slice(basePath.length);
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path === '' || path === '/') path = '/';

        const viewFileName = routes[path] || 'HomeView';

        try {
            const modulePath = `/v7/js/views/${viewFileName}.js`;
            
            // FIX ANTIFALLOS: Importación en dos pasos para evitar conflictos con la palabra reservada 'default'
            const module = await import(modulePath);
            const View = module.default;
            const view = new View();
            
            this.appContainer.innerHTML = await view.getHtml();
            
            if (typeof view.executeViewScript === 'function') {
                view.executeViewScript();
            }

            window.scrollTo(0, 0);

        } catch (error) {
            console.error(`💥 Router V7 Error cargando [${viewFileName}]:`, error);
            this.renderError(viewFileName, error);
        }
    }

    renderError(viewName, error) {
        this.appContainer.innerHTML = `
            <div style="padding: 4rem 2rem; text-align: center; max-width: 600px; margin: 0 auto; font-family: monospace;">
                <h1 style="color: #ff5252; font-size: 5rem; margin-bottom: 1rem;">404</h1>
                <h2 style="color: white; margin-bottom: 1rem;">Módulo "${viewName}" no hallado</h2>
                <p style="color: #888; background: rgba(0,0,0,0.4); border: 1px solid #333; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; word-break: break-all; line-height: 1.5;">
                    El archivo <b>/v7/js/views/${viewName}.js</b> falló al cargar.<br><br>
                    <span style="color: #ff5252;">${error.message}</span>
                </p>
                <a href="/v7/" data-link style="color: #00b0ff; text-decoration: none; font-weight: bold; border: 1px solid #00b0ff; padding: 10px 20px; border-radius: 8px;">REBOOT SYSTEM</a>
            </div>
        `;
    }
}

const appRouter = new Router();

document.addEventListener('DOMContentLoaded', () => {
    appRouter.handleRoute();
});

export const navigateTo = (url) => appRouter.navigateTo(url);
