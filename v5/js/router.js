// v5/js/router.js
import { store } from './core/store.js';

// Mapa de Rutas de la Aplicación
const routes = {
    '/': 'HomeView',                // La Landing Page
    '/create': 'ProjectCreatorView',// El creador de IA
    '/eco': 'EcoDashboardView',     // Macro-Mapa VNA
    '/project': 'ProjectView',      // El Kanban (Desktop)
    '/focus': 'FocusView',          // El Pomodoro Móvil
    '/me': 'UserDashboardView',     // Mi GTD Inbox
    '/ledger': 'LedgerView'         // La Triple Entrada
};

class Router {
    constructor() {
        this.appContainer = document.getElementById('app');
        // Escuchar los botones de "Atrás/Adelante" del navegador
        window.addEventListener('popstate', () => this.handleRoute());
        // Interceptar todos los clics en enlaces (<a>)
        document.body.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigateTo(e.target.href);
            }
        });
    }

    navigateTo(url) {
        window.history.pushState(null, null, url);
        this.handleRoute();
    }

    async handleRoute() {
        // Extraer la ruta actual (ej: "/project" o "/")
        let path = window.location.pathname;
        
        // Adaptación para subcarpetas (Si lo alojas en teamtowers.com/v5/)
        const basePath = '/v5';
        if (path.startsWith(basePath)) {
            path = path.slice(basePath.length) || '/';
        }

        const viewName = routes[path] || 'HomeView'; // Fallback a Home si no existe

        try {
            // Importación dinámica (Lazy Loading). Solo carga el JS de la vista que necesitas.
            const { default: View } = await import(`./views/${viewName}.js`);
            const view = new View();
            
            // Inyectar el HTML de la vista en el DOM
            this.appContainer.innerHTML = await view.getHtml();
            
            // Ejecutar la lógica de esa vista (botones, listeners, suscripción al store)
            if (typeof view.executeViewScript === 'function') {
                view.executeViewScript();
            }
        } catch (error) {
            console.error(`Error cargando la vista ${viewName}:`, error);
            this.appContainer.innerHTML = `<h2 style="color: white; padding: 2rem;">Error 404: Módulo no encontrado.</h2>`;
        }
    }
}

// Inicializar el router cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    const router = new Router();
    router.handleRoute();
});
