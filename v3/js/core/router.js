// router.js - Navegación SPA
class Router {
    constructor() {
        this.routes = {
            'dashboard': 'dashboard',
            'projects': 'projects',
            'project': 'project',
            'users': 'users',
            'user': 'user',
            'castell': 'castell',
            'value-map': 'value-mapping',
            'value-accounting': 'value-accounting'
        };
        this.params = {};
        this.init();
    }

    init() {
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigate(e.target.dataset.page);
            });
        });

        window.addEventListener('popstate', () => this.handleLocation());
        this.handleLocation();
    }

    handleLocation() {
        const path = window.location.pathname.substring(1) || 'dashboard';
        const [page, param] = path.split('/');
        this.navigate(page, param);
    }

    navigate(page, param = null) {
        const url = param ? `/${page}/${param}` : `/${page}`;
        if (window.location.pathname !== url) {
            window.history.pushState({}, '', url);
        }

        document.querySelectorAll('[data-page]').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        this.params = { page, param };
        this.loadPage(page, param);
    }

    loadPage(page, param = null) {
        const main = document.getElementById('main-content');
        if (!main) return;

        main.innerHTML = '<div class="loading">Cargando...</div>';

        setTimeout(() => {
            try {
                let content = '';
                switch(page) {
                    case 'dashboard': content = window.renderDashboard?.() || '<div class="loading">Error: Dashboard no disponible</div>'; break;
                    case 'projects': content = window.renderProjects?.() || '<div class="loading">Error: Projects no disponible</div>'; break;
                    case 'project': content = param ? (window.renderProject?.(param) || '<div class="loading">Error: Project no disponible</div>') : '<div class="loading">ID de proyecto requerido</div>'; break;
                    case 'users': content = window.renderUsers?.() || '<div class="loading">Error: Users no disponible</div>'; break;
                    case 'user': content = param ? (window.renderUser?.(param) || '<div class="loading">Error: User no disponible</div>') : '<div class="loading">ID de usuario requerido</div>'; break;
                    case 'castell': content = window.renderCastellView?.(param || '#kernel') || '<div class="loading">Error: Castell no disponible</div>'; break;
                    case 'value-map': content = window.renderValueMapping?.() || '<div class="loading">Error: Value Map no disponible</div>'; break;
                    case 'value-accounting': content = window.renderValueAccounting?.() || '<div class="loading">Error: Value Accounting no disponible</div>'; break;
                    default: content = '<div class="loading">Página no encontrada</div>';
                }
                main.innerHTML = content;
                
                // Ejecutar setup si existe
                const setupFn = window[`setup${page.charAt(0).toUpperCase() + page.slice(1)}Events`];
                if (setupFn) setTimeout(setupFn, 100);
                
            } catch (e) {
                console.error('Error:', e);
                main.innerHTML = `<div class="loading">Error: ${e.message}</div>`;
            }
        }, 100);
    }
}

window.Router = Router;
console.log('✅ Router cargado');
