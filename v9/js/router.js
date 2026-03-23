// v9/js/router.js
import { store } from './core/store.js'; 
import { Orchestrator } from './core/Orchestrator.js'; 
import HomeView from './views/HomeView.js';
import ProfileView from './views/ProfileView.js';
import DashboardView from './views/DashboardView.js';
import ValueMapView from './views/ValueMapView.js';
import ProjectView from './views/ProjectView.js';
import ProjectCreatorView from './views/ProjectCreatorView.js';
import TestsView from './views/TestsView.js';
import AgentEditorView from './views/AgentEditorView.js'; 
import PaperView from './views/PaperView.js'; 
import SettingsView from './views/SettingsView.js'; 
import LmsView from './views/LmsView.js';
import LedgerView from './views/LedgerView.js'; 

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    // 🔥 FIX RUTAS: Migración completa a /v9
    const routes = [
        { path: "/v9/", view: HomeView },
        { path: "/v9/profile", view: ProfileView },
        { path: "/v9/dashboard", view: DashboardView },
        { path: "/v9/map", view: ValueMapView },
        { path: "/v9/project", view: ProjectView },
        { path: "/v9/create", view: ProjectCreatorView },
        { path: "/v9/tests", view: TestsView },
        { path: "/v9/agents", view: AgentEditorView }, 
        { path: "/v9/paper", view: PaperView },
        { path: "/v9/focus", view: PaperView }, 
        { path: "/v9/lms", view: LmsView },
        { path: "/v9/settings", view: SettingsView },
        { path: "/v9/ledger", view: LedgerView }
    ];

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path || location.pathname === route.path + '/'
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    if (!match) {
        match = { route: routes[0], isMatch: true };
    }

    // =================================================================
    // 🛡️ AUTH GUARD: EL PORTERO DE LA DISCOTECA (V9)
    // =================================================================
    const state = store.getState();
    const isRootRoute = match.route.path === '/v9/';
    
    // Si NO ESTÁS logueado y tratas de ir a cualquier lado que no sea el Root... Patada al Root.
    if (!state.session.activeUserId && !isRootRoute) {
        console.warn("🛡️ Auth Guard: Acceso denegado. Volviendo a Root.");
        window.location.replace('/v9/');
        return; 
    }
    // =================================================================

    try {
        const view = new match.route.view();
        document.querySelector("#app").innerHTML = await view.getHtml();
        
        if (typeof view.executeViewScript === 'function') {
            view.executeViewScript();
        }
    } catch (error) {
        console.error("🔥 Error crítico renderizando la vista:", error);
        document.querySelector("#app").innerHTML = `
            <div style="padding: 3rem; color: #ff5252; background: #111; height: 100vh;">
                <h1>⚠️ Error del Sistema Operativo</h1>
                <p>La vista ha colapsado.</p>
                <code>${error.stack}</code>
                <br><br><a href="/v9/" style="color:white; text-decoration:underline;">Volver al Inicio</a>
            </div>
        `;
    }
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    Orchestrator.initUsenetDaemon();

    document.body.addEventListener("click", e => {
        const linkElement = e.target.closest("a[data-link]");
        if (linkElement) {
            e.preventDefault();
            navigateTo(linkElement.href);
        }
    });

    router();
});
