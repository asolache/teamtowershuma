// router.js - Navegación con eventos y deep linking
class Router {
    constructor() {
        this.routes = {
            'dashboard': { page: 'dashboard', title: 'Dashboard' },
            'projects': { page: 'projects', title: 'Proyectos' },
            'project/:id': { page: 'project', title: 'Proyecto' },
            'users': { page: 'users', title: 'Usuarios' },
            'user/:id': { page: 'user', title: 'Usuario' },
            'value-map': { page: 'value-mapping', title: 'Value Map' },
            'value-accounting': { page: 'value-accounting', title: 'Value Accounting' }
        };
        
        this.currentRoute = null;
        this.params = {};
        this.pageSetupFunctions = {
            'dashboard': 'setupDashboardEvents',
            'projects': 'setupProjectsEvents',
            'project': 'setupProjectEvents',
            'users': 'setupUsersEvents',
            'user': 'setupUserEvents',
            'value-mapping': 'setupValueMappingEvents',
            'value-accounting': 'setupValueAccountingEvents'
        };
        
        this.init();
    }

    init() {
        // Manejar clicks en navegación
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigate(page);
            });
        });

        // Manejar historial
        window.addEventListener('popstate', () => {
            this.handleLocation();
        });

        // Cargar ruta inicial
        this.handleLocation();
    }

    handleLocation() {
        const path = window.location.pathname.substring(1) || 'dashboard';
        const [base, id] = path.split('/');
        this.navigate(base, id);
    }

    navigate(page, param = null) {
        // Construir URL
        let url = `/${page}`;
        if (param) {
            url += `/${param}`;
        }

        // Actualizar URL si es diferente
        if (window.location.pathname !== url) {
            window.history.pushState({ page, param }, '', url);
        }

        // Actualizar active en menú
        document.querySelectorAll('[data-page]').forEach(link => {
            if (link.dataset.page === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Disparar evento de navegación
        const event = new CustomEvent('route-change', {
            detail: { page, param }
        });
        document.dispatchEvent(event);

        // Cargar la página
        this.loadPage(page, param);
    }

    async loadPage(page, param = null) {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        mainContent.innerHTML = '<div class="loading">Cargando...</div>';

        try {
            let module;
            let renderFn;
            let setupFnName = this.pageSetupFunctions[page] || this.pageSetupFunctions[page.split('/')[0]];

            switch(page) {
                case 'dashboard':
                    module = await import('../pages/dashboard.js');
                    renderFn = module.renderDashboard;
                    break;
                    
                case 'projects':
                    module = await import('../pages/projects.js');
                    renderFn = module.renderProjects;
                    break;
                    
                case 'project':
                    if (!param) {
                        mainContent.innerHTML = '<div class="loading">ID de proyecto no especificado</div>';
                        return;
                    }
                    module = await import('../pages/project.js');
                    renderFn = () => module.renderProject(param);
                    break;
                    
                case 'users':
                    module = await import('../pages/users.js');
                    renderFn = module.renderUsers;
                    break;
                    
                case 'user':
                    if (!param) {
                        mainContent.innerHTML = '<div class="loading">ID de usuario no especificado</div>';
                        return;
                    }
                    module = await import('../pages/user.js');
                    renderFn = () => module.renderUser(param);
                    break;
                    
                case 'value-map':
                    module = await import('../pages/value-mapping.js');
                    renderFn = module.renderValueMapping;
                    break;
                    
                case 'value-accounting':
                    module = await import('../pages/value-accounting.js');
                    renderFn = module.renderValueAccounting;
                    break;
                    
                default:
                    mainContent.innerHTML = '<div class="loading">Página no encontrada</div>';
                    return;
            }

            mainContent.innerHTML = renderFn();
            
            // Ejecutar setup de eventos si existe
            if (setupFnName && module[setupFnName]) {
                setTimeout(() => {
                    try {
                        module[setupFnName]();
                    } catch (e) {
                        console.error(`Error en setup de ${page}:`, e);
                    }
                }, 100);
            }

        } catch (error) {
            console.error('Error cargando página:', error);
            mainContent.innerHTML = '<div class="loading">Error al cargar la página</div>';
        }
    }

    // Método para obtener parámetros de la URL
    getParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return Object.fromEntries(urlParams);
    }
}

export const router = new Router();
window.router = router; // Para acceso global