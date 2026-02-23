/**
 * TEAMTOWERS SOS v4.0 - KERNEL ADAPTATIVO
 */
export class TTStore {
    constructor() {
        this.state = {
            projects: [],
            roles: [],
            ontology: null
        };
        this.listeners = [];
        this.initPromise = this.init();
    }

    async init() {
        const saved = localStorage.getItem('teamtowers-v4-state');
        if (saved) {
            try { 
                this.state = JSON.parse(saved); 
            } catch (e) { 
                console.error("Error recuperando estado:", e); 
            }
        }
        await this.loadOntology();
        window.dispatchEvent(new Event('store-ready'));
        return this.state;
    }

    async loadOntology() {
        try {
            const res = await fetch('./data/core-roles.json');
            if (res.ok) {
                this.state.ontology = await res.json();
                this.state.roles = this.state.ontology.roles;
            }
        } catch (e) {
            console.warn("Usando ontología de emergencia...");
            this.state.ontology = { sectores: { software: {} }, roles: [] };
        }
    }

    dispatch(action) {
        const { type, payload } = action;
        switch (type) {
            case 'ADD_PROJECT':
                const sectorData = this.state.ontology.sectores[payload.sector] || {};
                this.state.projects.push({
                    id: payload.id,
                    nombre: payload.nombre,
                    sector: payload.sector,
                    customRoles: { ...sectorData }, // Clonación de nombres por sector
                    transactions: []
                });
                break;

            case 'UPDATE_ROLE_NAME':
                const project = this.state.projects.find(p => p.id === payload.projectId);
                if (project) {
                    project.customRoles[payload.rolId] = payload.newName;
                }
                break;

            case 'ADD_TRANSACTION':
                this.addTransaction(payload.projectId, payload.transaction);
                break;

            case 'RESET_DATABASE':
                localStorage.removeItem('teamtowers-v4-state');
                location.reload();
                break;
        }
        this.saveState();
        this.notify();
    }

    addTransaction(projectId, tx) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return;

        const rolCfg = this.state.roles.find(r => r.id === tx.rolId) || { precio_base_h: 30, multiplier: 1 };
        const liq = (tx.horas || 1) * rolCfg.precio_base_h * rolCfg.multiplier;

        project.transactions.push({
            id: `tx-${Date.now()}`,
            from: tx.rolId,
            to: tx.to || "@proyecto",
            concepto: tx.concepto || "Valor inyectado",
            horas: tx.horas || 1,
            liquidación: liq,
            tipo_flujo: tx.tipo_flujo || 'tangible', // 'tangible' (sólida) o 'intangible' (punteada)
            timestamp: new Date().toISOString()
        });
    }

    saveState() { localStorage.setItem('teamtowers-v4-state', JSON.stringify(this.state)); }
    getState() { return JSON.parse(JSON.stringify(this.state)); }
    subscribe(cb) { this.listeners.push(cb); }
    notify() { this.listeners.forEach(cb => cb(this.state)); }
}

export const store = new TTStore();
