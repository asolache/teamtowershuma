// /v3/js/core/router.js
// Router SPA - v3.5

class Router {
    constructor() {
        this.routes = {
            'dashboard': window.renderDashboard || (() => '<div>Dashboard no disponible</div>'),
            'projects': window.renderProjects || (() => '<div>Projects no disponible</div>'),
            'create-project': window.renderCreateProject || (() => '<div>Create Project no disponible</div>'),
            'project-detail': window.renderProjectDetail || (() => '<div>Project Detail no disponible</div>'),
            'users': window.renderUsers || (() => '<div>Users no disponible</div>'),
            'user': window.renderUser || (() => '<div>User no disponible</div>'),
            'castell': window.renderCastellView || (() => '<div>Castell no disponible</div>'),
            'value-map': window.renderValueMapping || (() => '<div>Value Map no disponible</div>'),
            'value-accounting': window.renderValueAccounting || (() => '<div>Value Accounting no disponible</div>')
        };

        // Manejar navegación inicial
        window.addEventListener('popstate', () => this.handleCurrentRoute());
        
        // Capturar clics en enlaces
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigate(page);
            }
        });
    }

    navigate(page, params = {}) {
        console.log(`🔄 Navegando a: ${page}`, params);
        
        // Construir URL
        let url = `#${page}`;
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }
        
        // Actualizar URL sin recargar
        history.pushState({ page, params }, '', url);
        
        // Renderizar la página
        this.renderPage(page, params);
    }

    handleCurrentRoute() {
        const hash = window.location.hash.slice(1); // quitar el #
        const [page, queryString] = hash.split('?');
        const params = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};
        
        this.renderPage(page || 'dashboard', params);
    }

    renderPage(page, params = {}) {
        console.log(`🎨 Renderizando página: ${page}`);
        
        const renderFn = this.routes[page];
        if (!renderFn) {
            document.getElementById('main-content').innerHTML = '<div class="error">Página no encontrada</div>';
            return;
        }

        // Renderizar el HTML
        const content = renderFn(params);
        document.getElementById('main-content').innerHTML = content;

        // --- PARTE CRÍTICA: Ejecutar setup específico de la página ---
        // Las funciones de setup deben llamarse así:
        // setupDashboardEvents, setupProjectsEvents, setupCreateProjectEvents, etc.
        const setupFnName = `setup${page.charAt(0).toUpperCase() + page.slice(1)}Events`;
        const setupFn = window[setupFnName];
        
        if (typeof setupFn === 'function') {
            console.log(`⚙️ Ejecutando ${setupFnName}()`);
            // Para create-project, necesitamos asegurar que el DOM está listo
            if (page === 'create-project') {
                // Esperar un poco más para create-project porque tt-form necesita tiempo
                setTimeout(() => {
                    setupFn();
                }, 100);
            } else {
                setupFn();
            }
        } else {
            console.warn(`⚠️ No se encontró ${setupFnName}`);
        }

        // Actualizar breadcrumb
        this.updateBreadcrumb(page, params);
    }

    updateBreadcrumb(page, params) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;

        let html = '<a href="#" data-page="dashboard">Inicio</a>';
        
        if (page === 'project-detail' && params.id) {
            html += ` > <span>${params.id}</span>`;
        } else if (page !== 'dashboard') {
            const pageNames = {
                'projects': 'Proyectos',
                'create-project': 'Nuevo Proyecto',
                'users': 'Usuarios',
                'castell': 'Castell',
                'value-map': 'Mapa de Valor',
                'value-accounting': 'Value Accounting'
            };
            html += ` > <span>${pageNames[page] || page}</span>`;
        }
        
        breadcrumb.innerHTML = html;
    }
}

// Exponer globalmente
window.Router = Router;
