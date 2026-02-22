// /v3/js/core/store.js (fragmento modificado)

class Store {
    constructor() {
        this.state = {
            projects: [],
            roles: [],         // 71 roles casteller
            users: [],
            transactions: []
        };
        this.loadState();
    }

    // ... otros métodos ...

    addProject(project) {
        // Validar que el sector esté en la lista permitida
        if (!window.APP_CONSTANTS?.SECTORES_ID.includes(project.sector)) {
            console.warn(`Sector "${project.sector}" no válido. Usando defecto: ${window.APP_CONSTANTS.SECTOR_DEFAULT}`);
            project.sector = window.APP_CONSTANTS.SECTOR_DEFAULT;
        }
        // Asegurar que el proyecto tenga el campo sector
        if (!project.sector) project.sector = window.APP_CONSTANTS.SECTOR_DEFAULT;
        this.state.projects.push(project);
        this.saveState();
        window.EventBus.emit('project-added', project);
    }

    // ... resto del código ...
}
