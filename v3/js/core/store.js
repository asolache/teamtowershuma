// /v3/js/core/store.js
// Estado central (SSOT) - Versión extendida con updateProject

class Store {
    constructor() {
        this.state = {
            projects: [],      // Lista de proyectos
            roles: [],         // 71 roles casteller (se cargarán desde data/role-templates)
            users: [],         // Personas reales
            transactions: []   // Registro de contribuciones
        };
        this.loadState();
    }

    // Cargar desde localStorage
    loadState() {
        const saved = localStorage.getItem('teamtowers-v3-state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading state', e);
            }
        } else {
            // Inicializar con datos por defecto si es necesario
            this.initDefaultData();
        }
    }

    initDefaultData() {
        // Aquí se podrían cargar los roles desde casteller.json, etc.
        // Por ahora lo dejamos vacío o con datos de ejemplo
    }

    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    // ===== Métodos de modificación =====

    addTransaction(tx) {
        this.state.transactions.push(tx);
        this.saveState();
        window.EventBus.emit('transaction-added', tx);
    }

    addProject(project) {
        this.state.projects.push(project);
        this.saveState();
        window.EventBus.emit('project-added', project);
    }

    /**
     * Actualiza un proyecto completo (reemplaza el objeto)
     * @param {string} projectId - ID del proyecto (ej. "#kernel")
     * @param {object} updatedProject - Nuevo objeto proyecto
     */
    updateProject(projectId, updatedProject) {
        const index = this.state.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            this.state.projects[index] = updatedProject;
            this.saveState();
            window.EventBus.emit('project-updated', { projectId, project: updatedProject });
        } else {
            console.warn(`Proyecto ${projectId} no encontrado para actualizar`);
        }
    }

    // Eliminar proyecto (si se necesita)
    deleteProject(projectId) {
        this.state.projects = this.state.projects.filter(p => p.id !== projectId);
        this.saveState();
        window.EventBus.emit('project-deleted', projectId);
    }

    saveState() {
        localStorage.setItem('teamtowers-v3-state', JSON.stringify(this.state));
    }
}

// Inicializar store global
window.store = new Store();
