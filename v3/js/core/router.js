// /v3/js/core/router.js
// Router SPA - v3.5 - VERSIÓN SIMPLE Y ROBUSTA

class Router {
    constructor() {
        console.log('🔄 Router inicializado (versión simple)');
        
        this.routes = {
            'dashboard': window.renderDashboard || (() => '<div>Dashboard no disponible</div>'),
            'projects': window.renderProjects || (() => '<div>Projects no disponible</div>'),
            'create-project': window.renderCreateProject || (() => '<div>Create Project no disponible</div>'),
            'project-detail': window.renderProjectDetail || ((params) => `<div>Project Detail no disponible para ${params?.id || 'unknown'}</div>`),
            'users': window.renderUsers || (() => '<div>Users no disponible</div>'),
            'user': window.renderUser || (() => '<div>User no disponible</div>'),
            'castell': window.renderCastellView || (() => '<div>Castell no disponible</div>'),
            'value-map': window.renderValueMapping || (() => '<div>Value Map no disponible</div>'),
            'value-accounting': window.renderValueAccounting || (() => '<div>Value Accounting no disponible</div>')
        };

        window.addEventListener('popstate', () => this.handleRoute());
        
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigate(page);
            }
        });
    }

    handleRoute() {
        let hash = window.location.hash.slice(1); // quita el '#'
        console.log('📍 Hash completo:', hash);
        
        if (!hash) {
            this.navigate('dashboard');
            return;
        }

        // Separar página y query string
        let page = hash;
        let query = '';
        const questionIndex = hash.indexOf('?');
        if (questionIndex !== -1) {
            page = hash.substring(0, questionIndex);
            query = hash.substring(questionIndex + 1);
        }
        console.log('📌 Página:', page);
        console.log('📌 Query:', query);

        // Convertir query a objeto
        let params = {};
        if (query) {
            query.split('&').forEach(pair => {
                const [key, value] = pair.split('=');
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            });
        }
        console.log('📌 Parámetros:', params);

        this.renderPage(page, params);
    }

    navigate(page, params = {}) {
        console.log('🔄 Navegando a:', page, params);
        let url = '#' + page;
        if (Object.keys(params).length > 0) {
            url += '?' + new URLSearchParams(params).toString();
        }
        history.pushState({ page, params }, '', url);
        this.renderPage(page, params);
    }

    renderPage(page, params) {
        console.log('🎨 Renderizando página:', page, params);
        const renderFn = this.routes[page];
        if (!renderFn) {
            document.getElementById('main-content').innerHTML = `<div class="error">Página "${page}" no encontrada</div>`;
            return;
        }
        document.getElementById('main-content').innerHTML = renderFn(params);
        
        // Intentar ejecutar setup si existe
        const setupName = 'setup' + page.charAt(0).toUpperCase() + page.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase()) + 'Events';
        const setupFn = window[setupName];
        if (setupFn) setTimeout(setupFn, 50);
    }
}

window.Router = Router;
console.log('✅ router.js cargado (versión simple)');
