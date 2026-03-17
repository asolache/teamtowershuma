// v8/js/router.js
import { Orchestrator } from './core/Orchestrator.js'; // 🔥 NUEVO SPRINT 35: Invocación del Daemon
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
import LedgerView from './views/LedgerView.js'; // 🔥 FIX: Importamos la Notaría

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    // Definición del árbol de rutas de TeamTowers V14
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
        { path: "/v8/lms", view: LmsView },
        { path: "/v8/settings", view: SettingsView },
        { path: "/v8/ledger", view: LedgerView } // 🔥 FIX: Registramos la ruta del Ledger
    ];

    // Buscar coincidencia exacta con la URL actual
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path || location.pathname === route.path + '/'
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    // Si la ruta no existe (404), redirigimos al Home (Zero-Trust Login)
    if (!match) {
        match = {
            route: routes[0], 
            isMatch: true
        };
    }

    // Instanciar la vista correspondiente
    const view = new match.route.view();

    // 1. Inyectar el HTML pre-renderizado en el contenedor principal
    document.querySelector("#app").innerHTML = await view.getHtml();
    
    // 2. Ejecutar los listeners y scripts dinámicos (D3, D&D, APIs)
    if (typeof view.executeViewScript === 'function') {
        view.executeViewScript();
    }
};

// Escuchar navegación por historial (Botón Atrás/Adelante del navegador)
window.addEventListener("popstate", router);

// Interceptar clics en enlaces internos (SPA behavior)
document.addEventListener("DOMContentLoaded", () => {
    
    // 🔥 NUEVO SPRINT 35: Arrancar el Daemon de Auto-Respuesta A2A al cargar la App
    Orchestrator.initUsenetDaemon();

    document.body.addEventListener("click", e => {
        // Soporte para clics directos en el enlace o en elementos hijos (iconos/spans) dentro del enlace
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        } else if (e.target.closest("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.closest("[data-link]").href);
        }
    });

    // Arrancar el router por primera vez
    router();
});
