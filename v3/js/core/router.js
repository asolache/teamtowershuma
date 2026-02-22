// router.js - Navegación SPA con soporte para parámetros
// TeamTowers Humà v3.4 - VERSIÓN DEFINITIVA

class Router {
    constructor() {
        console.log('🚦 Router inicializando...');
        
        this.routes = {
            'dashboard': 'dashboard',
            'projects': 'projects',
            'project': 'project',
            'users': 'users',
            'user': 'user',
            'castell': 'castell',
            'value-map': 'value-map',
            'value-accounting': 'value-accounting'
        };
        
        this.params = {};
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        // Manejar clicks en enlaces de navegación
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigate(page);
            });
        });

        // Manejar historial del navegador
        window.addEventListener('popstate', () => this.handleLocation());

        // Cargar la ruta inicial
        this.handleLocation();
        
        console.log('✅ Router listo');
    }

    handleLocation() {
        const path = window.location.pathname.substring(1) || 'dashboard';
        const parts = path.split('/');
        const page = parts[0];
        const param = parts[1] || null;
        
        this.navigate(page, param);
    }

    navigate(page, param = null) {
        console.log(`🧭 Navegando a: ${page}${param ? '/' + param : ''}`);
        
        // Construir URL
        let url = `/${page}`;
        if (param) {
            url += `/${param}`;
        }

        // Actualizar URL si es diferente (evitar bucles)
        if (window.location.pathname !== url) {
            window.history.pushState({ page, param }, '', url);
        }

        // Actualizar clase active en el menú
        document.querySelectorAll('[data-page]').forEach(link => {
            if (link.dataset.page === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Guardar parámetros
        this.params = { page, param };
        this.currentPage = page;

        // Cargar la página
        this.loadPage(page, param);
    }

    loadPage(page, param = null) {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('❌ No se encuentra el elemento main-content');
            return;
        }

        // Mostrar loading
        mainContent.innerHTML = '<div class="loading">Cargando...</div>';

        // Pequeño retraso para asegurar renderizado
        setTimeout(() => {
            try {
                let content = '';
                let setupFn = null;

                switch(page) {
                    case 'dashboard':
                        content = window.renderDashboard?.() || '<div class="loading">Error: Dashboard no disponible</div>';
                        setupFn = window.setupDashboardEvents;
                        break;
                        
                    case 'projects':
                        content = window.renderProjects?.() || '<div class="loading">Error: Projects no disponible</div>';
                        setupFn = window.setupProjectsEvents;
                        break;
                        
                    case 'project':
                        if (!param) {
                            content = '<div class="loading">ID de proyecto requerido</div>';
                            break;
                        }
                        content = window.renderProject?.(param) || '<div class="loading">Error: Project no disponible</div>';
                        setupFn = window.setupProjectEvents;
                        break;
                        
                    case 'users':
                        content = window.renderUsers?.() || '<div class="loading">Error: Users no disponible</div>';
                        setupFn = window.setupUsersEvents;
                        break;
                        
                    case 'user':
                        if (!param) {
                            content = '<div class="loading">ID de usuario requerido</div>';
                            break;
                        }
                        content = window.renderUser?.(param) || '<div class="loading">Error: User no disponible</div>';
                        setupFn = window.setupUserEvents;
                        break;
                        
                    case 'castell':
                        content = window.renderCastellView?.(param || '#kernel') || '<div class="loading">Error: Castell no disponible</div>';
                        setupFn = window.setupCastellViewEvents;
                        break;
                        
                    case 'value-map':
                        content = window.renderValueMapping?.(param || '#kernel') || '<div class="loading">Error: Value Map no disponible</div>';
                        setupFn = window.setupValueMappingEvents;
                        break;
                        
                    case 'value-accounting':
                        content = window.renderValueAccounting?.() || '<div class="loading">Error: Value Accounting no disponible</div>';
                        setupFn = window.setupValueAccountingEvents;
                        break;
                        
                    default:
                        content = '<div class="loading">Página no encontrada</div>';
                }

                // Actualizar contenido
                mainContent.innerHTML = content;
                
                // Ejecutar setup de eventos si existe
                if (setupFn) {
                    setTimeout(setupFn, 100);
                }

                // Actualizar breadcrumb si existe la función
                if (window.updateBreadcrumb) {
                    window.updateBreadcrumb(page, param);
                }

            } catch (e) {
                console.error('❌ Error cargando página:', e);
                mainContent.innerHTML = `<div class="loading">Error: ${e.message}</div>`;
            }
        }, 50);
    }

    // Obtener parámetros actuales
    getParams() {
        return { ...this.params };
    }

    // Obtener página actual
    getCurrentPage() {
        return this.currentPage;
    }

    // Navegar hacia atrás
    goBack() {
        window.history.back();
    }

    // Recargar página actual
    reload() {
        this.loadPage(this.currentPage, this.params.param);
    }
}

// Exponer globalmente
window.Router = Router;
console.log('✅ Router cargado globalmente');
