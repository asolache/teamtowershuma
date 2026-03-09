// v5/js/router.js

/**
 * MAPEO DE RUTAS
 * Clave: El path que aparece en la URL (después de /v5)
 * Valor: El nombre exacto del archivo .js en /js/views/
 */
const routes = {
    '/': 'DashboardView',      // Antes era HomeView, lo unificamos a DashboardView
    '/create': 'ProjectCreatorView',
    '/project': 'ProjectView',
    '/map': 'ValueMapView',
    '/team': 'TeamView',
    '/ledger': 'LedgerView',
    '/tests': 'TestsView',
    '/manifesto': 'ManifestoView',
    '/network': 'NetworkView',
    '/settings': 'SettingsView',
    '/focus': 'FocusView',
    '/profile': 'ProfileView'
};

class Router {
    constructor() {
        this.appContainer = document.getElementById('app');
        
        // Escuchar la navegación del historial (atrás/adelante)
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Interceptar clics en enlaces con atributo data-link
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
        
        // 1. Normalización del Path (limpiamos el prefijo /v5)
        const basePath = '/v5';
        if (path.startsWith(basePath)) {
            path = path.slice(basePath.length);
        }
        
        // 2. Limpiamos la barra final si existe
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        // 3. Fallback al home si el path está vacío
        if (path === '' || path === '/') {
            path = '/';
        }

        // 4. Obtener el nombre de la vista
        const viewName = routes[path] || 'DashboardView';

        try {
            // CARGA DINÁMICA DEL MÓDULO
            // Esto evita que la app colapse si un archivo no existe, permitiendo mostrar un error 404 propio.
            const modulePath = `/v5/js/views/${viewName}.js`;
            const { default: View } = await import(modulePath);
            const view = new View();
            
            // Inyectar el HTML de la vista
            this.appContainer.innerHTML = await view.getHtml();
            
            // Ejecutar la lógica de la vista (listeners, etc.)
            if (typeof view.executeViewScript === 'function') {
                view.executeViewScript();
            }

            // Scroll al inicio en cada cambio de página
            window.scrollTo(0, 0);

        } catch (error) {
            console.error(`💥 Router Error [${viewName}]:`, error);
            this.renderError(viewName, error);
        }
    }

    renderError(viewName, error) {
        this.appContainer.innerHTML = `
            <div style="padding: 4rem 2rem; text-align: center; max-width: 800px; margin: 0 auto; font-family: monospace;">
                <h1 style="color: var(--accent-red); font-size: 5rem; margin-bottom: 1rem;">404</h1>
                <h2 style="color: white; margin-bottom: 1rem;">Error de Carga: ${viewName}</h2>
                <p style="color: #888; background: rgba(0,0,0,0.4); border: 1px solid #333; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; word-break: break-all; line-height: 1.5;">
                    El módulo solicitado no existe en el servidor o contiene errores de sintaxis.<br><br>
                    <span style="color: var(--accent-red);">${error.message}</span>
                </p>
                <a href="/v5/" data-link class="btn btn-primary" style="padding: 1rem 2rem; display: inline-block;">
                    REBOOT SYSTEM (Volver al Inicio)
                </a>
            </div>
        `;
    }
}

// Inicialización del Singleton del Router
const appRouter = new Router();

document.addEventListener('DOMContentLoaded', () => {
    appRouter.handleRoute();
});

export const navigateTo = (url) => appRouter.navigateTo(url);
