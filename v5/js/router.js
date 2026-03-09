// v5/js/router.js
import DashboardView from './views/DashboardView.js';
import NetworkView from './views/NetworkView.js';
import ProjectView from './views/ProjectView.js';
import ValueMapView from './views/ValueMapView.js';
import ProjectCreatorView from './views/ProjectCreatorView.js';
import TeamView from './views/TeamView.js';
import LedgerView from './views/LedgerView.js';
import TestsView from './views/TestsView.js';
import ManifestoView from './views/ManifestoView.js';

export const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    const routes = [
        { path: "/v5/", view: DashboardView },
        { path: "/v5/network", view: NetworkView },
        { path: "/v5/create", view: ProjectCreatorView },
        { path: "/v5/project", view: ProjectView },
        { path: "/v5/map", view: ValueMapView },
        { path: "/v5/team", view: TeamView },
        { path: "/v5/ledger", view: LedgerView },
        { path: "/v5/tests", view: TestsView },
        { path: "/v5/manifesto", view: ManifestoView }
    ];

    const potentialMatches = routes.map(route => {
        return {
            route: route,
            isMatch: location.pathname === route.path || location.pathname === route.path + '/'
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    if (!match) {
        match = {
            route: routes[0],
            isMatch: true
        };
    }

    const view = new match.route.view();
    
    const appElement = document.querySelector('#app');
    appElement.innerHTML = await view.getHtml();
    
    // Ejecutar scripts específicos de la vista después de renderizar
    if (typeof view.executeViewScript === 'function') {
        view.executeViewScript();
    }
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.href);
        } else {
            // Manejar clics en elementos anidados dentro de enlaces <a> (como iconos o spans)
            let currentElement = e.target;
            while (currentElement != null && currentElement.tagName !== 'BODY') {
                if (currentElement.tagName === 'A' && currentElement.hasAttribute('data-link')) {
                    e.preventDefault();
                    navigateTo(currentElement.href);
                    break;
                }
                currentElement = currentElement.parentElement;
            }
        }
    });

    router();
});
