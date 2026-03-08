// Ejemplo conceptual de v5/js/components/Sidebar.js
export function getSidebarHtml(activeRoute, project) {
    let projectMenu = '';
    
    // Si hay un proyecto activo, inyectamos el menú del Castell
    if (project) {
        projectMenu = `
            <div class="project-context-header">...${project.nombre}...</div>
            <a href="/v5/project" class="${activeRoute === '/project' ? 'active' : ''}">Kanban</a>
            <a href="/v5/map" class="${activeRoute === '/map' ? 'active' : ''}">Mapa VNA</a>
            `;
    }

    return `
        <aside class="sidebar">
            <div class="logo">🗼 TeamTowers</div>
            <a href="/v5/network" class="${activeRoute === '/network' ? 'active' : ''}">Ecosistema</a>
            ${projectMenu}
            <div class="footer">Ajustes y Logout</div>
        </aside>
    `;
}
