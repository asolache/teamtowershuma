// v8/js/router.js
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
    const routes = [
        { path: "/v8/", view: HomeView },
        { path: "/v8/profile", view: ProfileView },
        { path: "/v8/dashboard", view: DashboardView },
        { path: "/v8/map", view: ValueMapView },
        { path: "/v8/project", view: ProjectView },
        { path: "/v8/create", view: ProjectCreatorView },
        { path: "/v8/tests", view: TestsView },
        { path: "/v8/agents", view: AgentEditorView }, 
        { path: "/v8/paper", view: PaperView },
        { path: "/v8/focus", view: PaperView }, 
        { path: "/v8/lms", view: LmsView },
        { path: "/v8/settings", view: SettingsView },
        { path: "/v8/ledger", view: LedgerView }
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
                <p>La vista ha colapsado. Revisa la consola (F12).</p>
                <code>${error.stack}</code>
                <br><br><a href="/v8/" style="color:white; text-decoration:underline;">Volver al Inicio (Forzar recarga)</a>
            </div>
        `;
    }
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    Orchestrator.initUsenetDaemon();

    // 🔥 FIX: Interceptar SÓLO enlaces <a> con [data-link]
    document.body.addEventListener("click", e => {
        const linkElement = e.target.closest("a[data-link]");
        if (linkElement) {
            e.preventDefault();
            navigateTo(linkElement.href);
        }
    });

    router();
});
