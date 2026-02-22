// /v3/js/core/store.js
// Estado central (SSOT) - v3.5
// Incluye: proyectos, roles, usuarios, transacciones globales y por proyecto

class Store {
    constructor() {
        this.state = {
            projects: [],
            roles: [],
            users: [],
            transactions: [] // Registro global de transacciones
        };
        this.init();
    }

    async init() {
        const saved = localStorage.getItem('teamtowers-v3-state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                // Asegurar estructura
                if (!this.state.transactions) this.state.transactions = [];
                if (!this.state.users) this.state.users = [];
                console.log('✅ Estado cargado desde localStorage');
            } catch (e) {
                console.error('Error parsing state', e);
                await this.loadDefaultData();
            }
        } else {
            await this.loadDefaultData();
        }
        if (window.EventBus) {
            window.EventBus.emit('store-initialized', this.state);
        }
    }

    async loadDefaultData() {
        const coreRoles = await this.loadCoreRoles();
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
        return [
            { id: "@arquitecto", nombre: "Master Architect", multiplier: 2.5, color: "#7c2d12" },
            { id: "@developer", nombre: "Dev Segon", multiplier: 1.5, color: "#3b82f6" },
            { id: "@tester", nombre: "Quality Guardian", multiplier: 1.5, color: "#10b981" },
            { id: "@strategist", nombre: "Lead Strategist", multiplier: 2.0, color: "#f59e0b" },
            { id: "@enxaneta.media", nombre: "Visual Storyteller", multiplier: 1.2, color: "#8b5cf6" }
        ];
    }

    getDefaultUsers() {
        return [
            { id: "@alvaro-solache", nombre: "Álvaro Solache", email: "alvaro@teamtowers.com" },
            { id: "@ia-architect", nombre: "IA Architect", email: "ia.architect@teamtowers.com" },
            { id: "@ia-coder", nombre: "IA Coder", email: "ia.coder@teamtowers.com" },
            { id: "@ia-tester", nombre: "IA Tester", email: "ia.tester@teamtowers.com" },
            { id: "@usuario-1", nombre: "Usuario 1", email: "user1@example.com" },
            { id: "@usuario-2", nombre: "Usuario 2", email: "user2@example.com" },
            { id: "@masterproject", nombre: "Master Project", email: "master@teamtowers.com" },
            { id: "@tester-guardian", nombre: "Tester Guardian", email: "tester@teamtowers.com" },
            { id: "@Mr-Q", nombre: "Mr. Q", email: "q@teamtowers.com" }
        ];
    }

    // ===== Métodos de acceso =====
    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    // ===== Métodos de modificación =====
    addProject(project) {
        if (!window.APP_CONSTANTS?.SECTORES_ID.includes(project.sector)) {
            project.sector = window.APP_CONSTANTS?.SECTOR_DEFAULT || 'tecnologia';
        }
        this.state.projects.push(project);
        this.saveState();
        window.EventBus.emit('project-added', project);
    }

    updateProject(projectId, updatedProject) {
        const index = this.state.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            this.state.projects[index] = updatedProject;
            this.saveState();
            window.EventBus.emit('project-updated', { projectId, project: updatedProject });
            return true;
        }
        return false;
    }

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
        // También eliminar transacciones globales de ese proyecto (opcional)
        this.state.transactions = this.state.transactions.filter(tx => tx.projectId !== projectId);
        this.saveState();
        window.EventBus.emit('project-deleted', projectId);
    }

    // ===== MÉTODOS PARA TRANSACCIONES =====
    /**
     * Añade una transacción a un proyecto y al registro global
     * @param {string} projectId - ID del proyecto
     * @param {object} transaction - Objeto transacción
     */
    addTransaction(projectId, transaction) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) {
            console.error(`Proyecto ${projectId} no encontrado`);
            return false;
        }

        // Asegurar array de transacciones en el proyecto
        if (!project.transacciones) {
            project.transacciones = [];
        }

        // Añadir referencia al proyecto en la transacción
        transaction.projectId = projectId;

        // Añadir a la lista del proyecto
        project.transacciones.push(transaction);

        // Añadir al registro global
        this.state.transactions.push(transaction);

        this.saveState();
        window.EventBus.emit('transaction-added', { projectId, transaction });
        return true;
    }

    /**
     * Obtiene todas las transacciones de un proyecto
     */
    getProjectTransactions(projectId) {
        const project = this.state.projects.find(p => p.id === projectId);
        return project?.transacciones || [];
    }

    /**
     * Obtiene todas las transacciones emitidas por un usuario
     */
    getUserTransactions(userId) {
        return this.state.transactions.filter(tx => tx.creado_por === userId);
    }

    /**
     * Obtiene todas las transacciones (registro público)
     */
    getAllTransactions() {
        return this.state.transactions;
    }

    /**
     * Actualiza el estado de una transacción (para evaluación)
     */
    updateTransaction(projectId, transactionId, updates) {
        // Buscar en el proyecto
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project || !project.transacciones) return false;

        const txIndex = project.transacciones.findIndex(tx => tx.id === transactionId);
        if (txIndex === -1) return false;

        // Actualizar en proyecto
        Object.assign(project.transacciones[txIndex], updates);

        // Actualizar en registro global
        const globalTx = this.state.transactions.find(tx => tx.id === transactionId);
        if (globalTx) {
            Object.assign(globalTx, updates);
        }

        this.saveState();
        window.EventBus.emit('transaction-updated', { projectId, transactionId, updates });
        return true;
    }

    // ===== UTILIDADES =====
    getUserById(userId) {
        return this.state.users.find(u => u.id === userId);
    }

    getAllUsers() {
        return this.state.users;
    }

    saveState() {
        localStorage.setItem('teamtowers-v3-state', JSON.stringify(this.state));
    }
}

window.store = new Store();
