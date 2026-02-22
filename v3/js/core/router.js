// /v3/js/core/router.js
// Router SPA - v3.5
// Gestiona la navegación sin recargar la página

class Router {
    constructor() {
        console.log('🔄 Inicializando Router v3.5');
        
        // Definición de rutas y sus funciones renderizado// /v3/js/core/router.js
// Router SPA - v3.5 - VERSIÓN CON LOGS EXTENSIVOS

class Router {
    constructor() {
        console.log('🔄 Inicializando Router v3.5');
        
        this.routes = {
            'dashboard': window.renderDashboard || (() => '<div class="error">Dashboard no disponible</div>'),
            'projects': window.renderProjects || (() => '<div class="error">Projects no disponible</div>'),
            'create-project': window.renderCreateProject || (() => '<div class="error">Create Project no disponible</div>'),
            'project-detail': window.renderProjectDetail || ((params) => `<div class="error">Project Detail no disponible para ${params?.id || 'unknown'}</div>`),
            'users': window.renderUsers || (() => '<div class="error">Users no disponible</div>'),
            'user': window.renderUser || (() => '<div class="error">User no disponible</div>'),
            'castell': window.renderCastellView || (() => '<div class="error">Castell no disponible</div>'),
            'value-map': window.renderValueMapping || (() => '<div class="error">Value Map no disponible</div>'),
            'value-accounting': window.renderValueAccounting || (() => '<div class="error">Value Accounting no disponible</div>')
        };

        window.addEventListener('popstate', () => this.handleCurrentRoute());
        
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigate(page);
            }
        });

        console.log('✅ Router inicializado');
    }

    navigate(page, params = {}) {
        console.log(`🔄 Navegando a: ${page}`, params);
        
        let url = `#${page}`;
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }
        
        history.pushState({ page, params }, '', url);
        this.renderPage(page, params);
    }

    handleCurrentRoute() {
        const fullHash = window.location.hash.slice(1); // quita el '#'
        console.log('📍 Hash completo:', fullHash);
        
        if (!fullHash) {
            this.navigate('dashboard');
            return;
        }
        
        // SEPARAR PÁGINA DE PARÁMETROS (CORREGIDO)
        const parts = fullHash.split('?');
        const page = parts[0];
        const queryString = parts[1] || '';
        console.log('📌 Página extraída:', page);
        console.log('📌 Query string:', queryString);
        
        const params = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};
        console.log('📌 Parámetros:', params);
        
        this.renderPage(page, params);
    }

    renderPage(page, params = {}) {
        console.log(`🎨 Renderizando página: "${page}" con params:`, params);
        
        const renderFn = this.routes[page];
        if (!renderFn) {
            console.error(`❌ No hay función de render para: "${page}"`);
            document.getElementById('main-content').innerHTML = '<div class="error">Página no encontrada</div>';
            return;
        }

        const content = renderFn(params);
        document.getElementById('main-content').innerHTML = content;

        // Setup de eventos (si existe)
        const camelCasePage = page.split('-').map((part, index) => {
            if (index === 0) return part;
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join('');
        const setupFnName = `setup${camelCasePage.charAt(0).toUpperCase() + camelCasePage.slice(1)}Events`;
        const setupFn = window[setupFnName];

        console.log(`🔍 Buscando setup: ${setupFnName}`, setupFn ? '✅' : '❌');
        if (typeof setupFn === 'function') {
            setTimeout(() => setupFn(), 50);
        }

        this.updateBreadcrumb(page, params);
    }

    updateBreadcrumb(page, params) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;

        const pageNames = {
            'dashboard': 'Dashboard',
            'projects': 'Proyectos',
            'create-project': 'Nuevo Proyecto',
            'users': 'Usuarios',
            'castell': 'Castell',
            'value-map': 'Mapa de Valor',
            'value-accounting': 'Value Accounting'
        };

        let html = '<a href="#" data-page="dashboard">Inicio</a>';
        
        if (page === 'project-detail' && params.id) {
            html += ` > <a href="#" data-page="projects">Proyectos</a>`;
            html += ` > <span>${params.id}</span>`;
        } else if (page !== 'dashboard') {
            html += ` > <span>${pageNames[page] || page}</span>`;
        }
        
        breadcrumb.innerHTML = html;
    }
}

window.Router = Router;
console.log('📦 router.js cargado - versión con logs');ras
        this.routes = {
            'dashboard': window.renderDashboard || (() => '<div class="error">Dashboard no disponible</div>'),
            'projects': window.renderProjects || (() => '<div class="error">Projects no disponible</div>'),
            'create-project': window.renderCreateProject || (() => '<div class="error">Create Project no disponible</div>'),
            'project-detail': window.renderProjectDetail || ((params) => `<div class="error">Project Detail no disponible para ${params?.id || 'unknown'}</div>`),
            'users': window.renderUsers || (() => '<div class="error">Users no disponible</div>'),
            'user': window.renderUser || (() => '<div class="error">User no disponible</div>'),
            'castell': window.renderCastellView || (() => '<div class="error">Castell no disponible</div>'),
            'value-map': window.renderValueMapping || (() => '<div class="error">Value Map no disponible</div>'),
            'value-accounting': window.renderValueAccounting || (() => '<div class="error">Value Accounting no disponible</div>')
        };

        // Manejar navegación con botones atrás/adelante
        window.addEventListener('popstate', () => this.handleCurrentRoute());
        
        // Capturar clics en enlaces con data-page
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.dataset.page;
                // Si hay dataset.params, pasarlo como parámetros (opcional)
                const params = link.dataset.params ? JSON.parse(link.dataset.params) : {};
                this.navigate(page, params);
            }
        });

        console.log('✅ Router inicializado');
    }

    /**
     * Navega a una página
     * @param {string} page - Nombre de la página (ej: 'dashboard', 'create-project')
     * @param {object} params - Parámetros para la página (ej: { id: '#kernel' })
     */
    navigate(page, params = {}) {
        console.log(`🔄 Navegando a: ${page}`, params);
        
        // Construir URL con hash
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

    /**
     * Maneja la ruta actual (desde URL o hash)
     */
    handleCurrentRoute() {
        const hash = window.location.hash.slice(1); // quitar el '#'
        if (!hash) {
            this.navigate('dashboard');
            return;
        }
        
        // Separar página de parámetros
        const [page, queryString] = hash.split('?');
        const params = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};
        
        this.renderPage(page, params);
    }

    /**
     * Renderiza una página y ejecuta su setup
     * @param {string} page - Nombre de la página
     * @param {object} params - Parámetros
     */
    renderPage(page, params = {}) {
        console.log(`🎨 Renderizando página: ${page} con params:`, params);
        
        const renderFn = this.routes[page];
        if (!renderFn) {
            console.error(`❌ No hay función de render para: ${page}`);
            document.getElementById('main-content').innerHTML = '<div class="error">Página no encontrada</div>';
            return;
        }

        // Renderizar el HTML
        const content = renderFn(params);
        document.getElementById('main-content').innerHTML = content;

        // --- Ejecutar setup específico de la página ---
        // Convertir kebab-case a CamelCase (ej: project-detail -> ProjectDetail)
        const camelCasePage = page.split('-').map((part, index) => {
            if (index === 0) return part;
            return part.charAt(0).toUpperCase() + part.slice(1);
        }).join('');

        const setupFnName = `setup${camelCasePage.charAt(0).toUpperCase() + camelCasePage.slice(1)}Events`;
        const setupFn = window[setupFnName];

        console.log(`🔍 Buscando función setup: ${setupFnName}`, setupFn ? '✅' : '❌');

        if (typeof setupFn === 'function') {
            console.log(`⚙️ Ejecutando ${setupFnName}()`);
            // Pequeño retraso para asegurar DOM
            setTimeout(() => setupFn(), 50);
        }

        // Actualizar breadcrumb
        this.updateBreadcrumb(page, params);
    }

    /**
     * Actualiza el breadcrumb de navegación
     */
    updateBreadcrumb(page, params) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;

        const pageNames = {
            'dashboard': 'Dashboard',
            'projects': 'Proyectos',
            'create-project': 'Nuevo Proyecto',
            'users': 'Usuarios',
            'castell': 'Castell',
            'value-map': 'Mapa de Valor',
            'value-accounting': 'Value Accounting'
        };

        let html = '<a href="#" data-page="dashboard">Inicio</a>';
        
        if (page === 'project-detail' && params.id) {
            html += ` > <a href="#" data-page="projects">Proyectos</a>`;
            html += ` > <span>${params.id}</span>`;
        } else if (page !== 'dashboard') {
            html += ` > <span>${pageNames[page] || page}</span>`;
        }
        
        breadcrumb.innerHTML = html;
    }

    /**
     * Recarga la página actual
     */
    reload() {
        this.handleCurrentRoute();
    }
}

// Exponer globalmente
window.Router = Router;

console.log('📦 router.js cargado correctamente');
