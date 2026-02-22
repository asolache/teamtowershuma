// /v3/js/core/store.js
// Estado central (SSOT) - v3.5
// Incluye: proyectos, roles, usuarios, transacciones
// Añadido: gestión de usuarios y método updateProject

class Store {
    constructor() {
        this.state = {
            projects: [],      // Lista de proyectos
            roles: [],         // Roles disponibles globalmente (set core o completo)
            users: [],         // Usuarios del sistema
            transactions: []   // Registro de contribuciones
        };
        this.init();
    }

    // Inicialización asíncrona para cargar datos semilla
    async init() {
        const saved = localStorage.getItem('teamtowers-v3-state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                // Asegurar que los usuarios existan (por si la versión anterior no los tenía)
                if (!this.state.users) this.state.users = [];
                console.log('✅ Estado cargado desde localStorage');
            } catch (e) {
                console.error('Error parsing state', e);
                this.loadDefaultData();
            }
        } else {
            await this.loadDefaultData();
        }
        // Emitir evento de inicialización
        if (window.EventBus) {
            window.EventBus.emit('store-initialized', this.state);
        }
    }

    async loadDefaultData() {
        // Cargar roles core (desde JSON o array por defecto)
        const coreRoles = await this.loadCoreRoles();
        // Cargar usuarios por defecto
        const defaultUsers = this.getDefaultUsers();
        
        this.state = {
            projects: [],
            roles: coreRoles,
            users: defaultUsers,
            transactions: [],
            config: { version: "3.5-lean" }
        };
        this.saveState();
        console.log('✅ Estado inicializado con datos por defecto');
    }

    async loadCoreRoles() {
        try {
            const response = await fetch('data/core-roles.json');
            const data = await response.json();
            return data.roles;
        } catch (e) {
            console.warn('No se pudo cargar core-roles.json, usando array por defecto');
            return this.getDefaultRoles();
        }
    }

    getDefaultRoles() {
        // Array de respaldo con los 5 roles core
        return [
            { id: "@arquitecto", nombre: "Master Architect", multiplier: 2.5, color: "#7c2d12" },
            { id: "@developer", nombre: "Dev Segon", multiplier: 1.5, color: "#3b82f6" },
            { id: "@tester", nombre: "Quality Guardian", multiplier: 1.5, color: "#10b981" },
            { id: "@strategist", nombre: "Lead Strategist", multiplier: 2.0, color: "#f59e0b" },
            { id: "@enxaneta.media", nombre: "Visual Storyteller", multiplier: 1.2, color: "#8b5cf6" }
        ];
    }

    getDefaultUsers() {
        // Usuarios de ejemplo para el sistema
        return [
            { id: "@alvaro-solache", nombre: "Álvaro Solache", email: "alvaro@teamtowers.com", avatar: "" },
            { id: "@ia-architect", nombre: "IA Architect", email: "ia.architect@teamtowers.com", avatar: "" },
            { id: "@ia-coder", nombre: "IA Coder", email: "ia.coder@teamtowers.com", avatar: "" },
            { id: "@ia-tester", nombre: "IA Tester", email: "ia.tester@teamtowers.com", avatar: "" },
            { id: "@usuario-1", nombre: "Usuario 1", email: "user1@example.com", avatar: "" },
            { id: "@usuario-2", nombre: "Usuario 2", email: "user2@example.com", avatar: "" },
            { id: "@masterproject", nombre: "Master Project", email: "master@teamtowers.com", avatar: "" },
            { id: "@tester-guardian", nombre: "Tester Guardian", email: "tester@teamtowers.com", avatar: "" },
            { id: "@Mr-Q", nombre: "Mr. Q", email: "q@teamtowers.com", avatar: "" }
        ];
    }

    // ===== Métodos de acceso =====

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
        // Validar sector
        if (!window.APP_CONSTANTS?.SECTORES_ID.includes(project.sector)) {
            project.sector = window.APP_CONSTANTS?.SECTOR_DEFAULT || 'tecnologia';
        }
        this.state.projects.push(project);
        this.saveState();
        window.EventBus.emit('project-added', project);
    }

    /**
     * Actualiza un proyecto completo (reemplaza el objeto)
     */
    updateProject(projectId, updatedProject) {
        const index = this.state.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            this.state.projects[index] = updatedProject;
            this.saveState();
            window.EventBus.emit('project-updated', { projectId, project: updatedProject });
            return true;
        }
        console.warn(`Proyecto ${projectId} no encontrado para actualizar`);
        return false;
    }

    /**
     * Actualiza los usuarios autorizados de un rol en un proyecto
     */
    updateRoleUsers(projectId, roleId, users) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return false;
        
        const role = project.roles.find(r => r.id === roleId);
        if (!role) return false;
        
        role.usuarios_autorizados = users;
        this.saveState();
        window.EventBus.emit('role-users-updated', { projectId, roleId, users });
        return true;
    }

    deleteProject(projectId) {
        this.state.projects = this.state.projects.filter(p => p.id !== projectId);
        this.saveState();
        window.EventBus.emit('project-deleted', projectId);
    }

    saveState() {
        localStorage.setItem('teamtowers-v3-state', JSON.stringify(this.state));
    }

    // ===== Utilidades =====

    getUserById(userId) {
        return this.state.users.find(u => u.id === userId);
    }

    getAllUsers() {
        return this.state.users;
    }
}

// Inicializar store (como es async, necesitamos esperar; en index.js ya manejamos)
window.store = new Store();
