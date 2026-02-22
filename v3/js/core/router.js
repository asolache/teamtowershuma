// router.js
class Router {
    constructor() {
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
                    case 'dashboard': content = window.renderDashboard?.() || '<div class="loading">Error</div>'; break;
                    case 'projects': content = window.renderProjects?.() || '<div class="loading">Error</div>'; break;
                    case 'project': content = param ? (window.renderProject?.(param) || '<div class="loading">Error</div>') : '<div class="loading">ID requerido</div>'; break;
                    case 'users': content = window.renderUsers?.() || '<div class="loading">Error</div>'; break;
                    case 'user': content = param ? (window.renderUser?.(param) || '<div class="loading">Error</div>') : '<div class="loading">ID requerido</div>'; break;
                    case 'castell': content = window.renderCastellView?.(param || '#kernel') || '<div class="loading">Error</div>'; break;
                    case 'value-map': content = window.renderValueMapping?.(param || '#kernel') || '<div class="loading">Error</div>'; break;
                    case 'value-accounting': content = window.renderValueAccounting?.() || '<div class="loading">Error</div>'; break;
                    default: content = '<div class="loading">Página no encontrada</div>';
                }
                main.innerHTML = content;
            } catch (e) {
                main.innerHTML = `<div class="loading">Error: ${e.message}</div>`;
            }
        }, 100);
    }
}

window.Router = Router;
