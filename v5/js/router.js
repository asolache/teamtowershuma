/**
 * TEAMTOWERS OS - SPA ROUTER (v5.1)
 * Orquestador de navegación sin recarga de página.
 */

const routes = {
    '/': 'HomeView',
    '/create': 'ProjectCreatorView',
    '/project': 'ProjectView',
    '/tests': 'TestsView',
    '/map': 'ValueMapView' // <-- Coma corregida aquí
};

class Router {
    constructor() {
        this.appContainer = document.getElementById('app');
        
        // Escuchar el botón "Atrás" del navegador
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Delegación de eventos para capturar clics en enlaces con [data-link]
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('[data-link]');
            if (link) {
                e.preventDefault();
                this.navigateTo(link.href);
            }
        });
    }

    /**
     * Cambia la URL sin recargar y dispara el controlador de rutas
     */
    navigateTo(url) {
        window.history.pushState(null, null, url);
        this.handleRoute();
    }

    /**
     * Procesa la URL actual y carga el módulo JS correspondiente
     */
    async handleRoute() {
        let path = window.location.pathname;
        
        // Normalización para Netlify y subcarpetas
        const basePath = '/v5';
        if (path.startsWith(basePath)) {
            // Extraemos la ruta real (ej: de '/v5/map' pasamos a '/map')
            path = path.slice(basePath.length);
        }
        
        // Si el path queda vacío o es solo '/', cargamos HomeView
        if (path === '' || path === '/') {
            path = '/';
        }

        const viewName = routes[path] || 'HomeView';

        try {
            // Importación dinámica del componente de vista
            const modulePath = `/v5/js/views/${viewName}.js`;
            const { default: View } = await import(modulePath);
            const view = new View();
            
            // Inyectar el HTML de la vista en el contenedor principal
            this.appContainer.innerHTML = await view.getHtml();
            
            // Ejecutar la lógica de la vista si existe
            if (typeof view.executeViewScript === 'function') {
                view.executeViewScript();
            }

            // Scroll automático al inicio tras cambiar de vista
            window.scrollTo(0, 0);

        } catch (error) {
            console.error(`💥 Error crítico cargando la vista [${viewName}]:`, error);
            this.renderError(viewName, error);
        }
    }

    /**
     * Renderiza una pantalla de error amigable en caso de fallo de carga
     */
    renderError(viewName, error) {
        this.appContainer.innerHTML = `
            <div style="padding: 4rem 2rem; text-align: center; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ff5252; font-size: 3rem; margin-bottom: 1rem;">404</h1>
                <h2 style="color: white; margin-bottom: 1rem;">Módulo "${viewName}" no hallado</h2>
                <p style="color: var(--text-muted); font-family: monospace; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; margin-bottom: 2rem;">
                    ${error.message}
                </p>
                <a href="/v5/" data-link class="btn btn-primary">Reboot System (Inicio)</a>
            </div>
        `;
    }
}

// Inicialización del enrutador al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    const router = new Router();
    router.handleRoute();
});
