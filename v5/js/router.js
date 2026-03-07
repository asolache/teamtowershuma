// v5/js/router.js

const routes = {
    '/': 'HomeView',
    '/create': 'ProjectCreatorView',
    '/project': 'ProjectView',
    '/tests': 'TestsView',
    '/map': 'ValueMapView',
    '/focus': 'FocusView'  // <--- Añadida la vista de Pomodoro / Deep Work
};

class Router {
    constructor() {
        this.appContainer = document.getElementById('app');
        
        // Escuchar la navegación hacia atrás/adelante del navegador (Botones del navegador)
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Interceptar los clics en enlaces con 'data-link' para hacer navegación SPA (sin recargar)
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
        
        // 1. Limpiamos el prefijo /v5 (Vital para servidores como Netlify o GitHub Pages)
        const basePath = '/v5';
        if (path.startsWith(basePath)) {
            path = path.slice(basePath.length);
        }
        
        // 2. Limpiamos la barra final (Trailing slash) si la hay (ej: /tests/ -> /tests)
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }

        // 3. Fallback de seguridad al home si el path se queda vacío
        if (path === '' || path === '/') {
            path = '/';
        }

        // 4. Buscar la vista correspondiente, o forzar al Home si no existe en el diccionario
        const viewName = routes[path] || 'HomeView';

        try {
            // 5. Importación dinámica del módulo de la vista
            const modulePath = `/v5/js/views/${viewName}.js`;
            const { default: View } = await import(modulePath);
            const view = new View();
            
            // 6. Inyectar HTML y ejecutar Scripts de la vista
            this.appContainer.innerHTML = await view.getHtml();
            
            if (typeof view.executeViewScript === 'function') {
                view.executeViewScript();
            }

            // 7. Subir el scroll arriba del todo en cada cambio de pantalla
            window.scrollTo(0, 0);

        } catch (error) {
            // 8. Trampa de Errores: Si la vista no existe o el JS falla al cargar
            console.error(`💥 Error crítico cargando la vista [${viewName}]:`, error);
            this.renderError(viewName, error);
        }
    }

    renderError(viewName, error) {
        this.appContainer.innerHTML = `
            <div style="padding: 4rem 2rem; text-align: center; max-width: 600px; margin: 0 auto; font-family: monospace;">
                <h1 style="color: #ff5252; font-size: 4rem; margin-bottom: 1rem;">404</h1>
                <h2 style="color: white; margin-bottom: 1rem;">Módulo "${viewName}" no hallado</h2>
                <p style="color: #888; background: rgba(0,0,0,0.3); border: 1px solid #333; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; word-break: break-all;">
                    ${error.message}
                </p>
                <a href="/v5/" data-link class="btn btn-primary" style="padding: 1rem 2rem; background: #00b0ff; color: white; text-decoration: none; border-radius: 8px;">
                    REBOOT SYSTEM (Inicio)
                </a>
            </div>
        `;
    }
}

// Iniciar el router cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const router = new Router();
    router.handleRoute();
});
