// v5/js/router.js

// 1. Añadimos la ruta de los tests
const routes = {
    '/': 'HomeView',
    '/create': 'ProjectCreatorView',
    '/project': 'ProjectView',
    '/tests': 'TestsView' // <--- NUEVA RUTA
};

class Router {
    constructor() {
        this.appContainer = document.getElementById('app');
        window.addEventListener('popstate', () => this.handleRoute());
        document.body.addEventListener('click', (e) => {
            // Si hacen clic en un elemento dentro de un enlace (ej: un <span> dentro de un <a>)
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
        
        // Limpiamos el path de la subcarpeta para saber qué vista cargar
        const basePath = '/v5';
        if (path.startsWith(basePath)) {
            path = path.slice(basePath.length) || '/';
        }

        const viewName = routes[path] || 'HomeView';

        try {
            // RUTA ABSOLUTA PARA EL IMPORT (Previene el error de "Iniciando Kernel...")
            const modulePath = `/v5/js/views/${viewName}.js`;
            const { default: View } = await import(modulePath);
            const view = new View();
            
            this.appContainer.innerHTML = await view.getHtml();
            
            if (typeof view.executeViewScript === 'function') {
                view.executeViewScript();
            }
        } catch (error) {
            console.error(`💥 Error cargando la vista ${viewName}:`, error);
            this.appContainer.innerHTML = `
                <div style="padding: 3rem; text-align: center;">
                    <h2 style="color: #ff5252;">Error 404/500</h2>
                    <p style="color: var(--text-muted); margin-bottom: 2rem;">No se pudo cargar el módulo JS de la vista.</p>
                    <a href="/v5/" data-link class="btn btn-outline">Volver al Inicio</a>
                </div>
            `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const router = new Router();
    router.handleRoute();
});
