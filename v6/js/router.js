// v5/js/router.js

/**
 * MAPEO DE RUTAS SINCRONIZADO CON EL SERVIDOR
 * Clave: El path que aparece en la URL (después de /v5)
 * Valor: El nombre EXACTO del archivo .js que existe en /js/views/
 */
const routes = {
    '/': 'HomeView',
    '/create': 'ProjectCreatorView',
    '/dashboard': 'DashboardView', // LOBBY V7.2
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
    '/onboarding': 'OnboardingView' // <-- RUTA AÑADIDA PARA V8.0 IDENTIDAD FRACTAL
};

class Router {
    constructor() {
        this.appContainer = document.getElementById('app');
        
        // Navegación historial
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Interceptar clics en enlaces data-link
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
        
        // 1. Limpiar prefijo /v5
        const basePath = '/v5';
        if (path.startsWith(basePath)) {
            path = path.slice(basePath.length);
        }
        
        // 2. Limpiar barra final
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        // 3. Fallback al home
        if (path === '' || path === '/') {
            path = '/';
        }

        // 4. Obtener el nombre del archivo de la vista
        const viewFileName = routes[path] || 'HomeView';

        try {
            // CARGA DINÁMICA DEL MÓDULO
            const modulePath = `/v5/js/views/${viewFileName}.js`;
            const { default: View } = await import(modulePath);
            const view = new View();
            
            // Renderizado
            this.appContainer.innerHTML = await view.getHtml();
            
            // Scripts de vista
            if (typeof view.executeViewScript === 'function') {
                view.executeViewScript();
            }

            window.scrollTo(0, 0);

        } catch (error) {
            console.error(`💥 Router Error cargando [${viewFileName}]:`, error);
            this.renderError(viewFileName, error);
        }
    }

    renderError(viewName, error) {
        this.appContainer.innerHTML = `
            <div style="padding: 4rem 2rem; text-align: center; max-width: 600px; margin: 0 auto; font-family: monospace;">
                <h1 style="color: var(--accent-red); font-size: 5rem; margin-bottom: 1rem;">404</h1>
                <h2 style="color: white; margin-bottom: 1rem;">Módulo "${viewName}" no hallado</h2>
                <p style="color: #888; background: rgba(0,0,0,0.4); border: 1px solid #333; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; word-break: break-all; line-height: 1.5;">
                    El archivo <b>/v5/js/views/${viewName}.js</b> no se encuentra en el servidor.<br><br>
                    <span style="color: var(--accent-red);">${error.message}</span>
                </p>
                <a href="/v5/" data-link class="btn btn-primary">REBOOT SYSTEM</a>
            </div>
        `;
    }
}

const appRouter = new Router();

document.addEventListener('DOMContentLoaded', () => {
    appRouter.handleRoute();
});

export const navigateTo = (url) => appRouter.navigateTo(url);
