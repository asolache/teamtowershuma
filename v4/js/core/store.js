/**
 * TEAMTOWERS SOS v4.0 - KERNEL (PROCESADOR VNA)
 */
class TTStore {
    constructor() {
        this.state = {
            projects: [],
            roles: [], 
            users: [],
            transactions: [],
            config: { version: "4.0-sos-core" }
        };
        this.listeners = [];
        this.initPromise = this.init();
    }

    async init() {
        const saved = localStorage.getItem('teamtowers-v4-state');
        if (saved) {
            try { this.state = JSON.parse(saved); } catch (e) { console.error(e); }
        }
        await this.loadCoreRoles();
        if (!this.state.projects) this.state.projects = [];
        if (!this.state.transactions) this.state.transactions = [];
        this.saveState();
        window.dispatchEvent(new Event('store-ready'));
        return this.state;
    }

    async loadCoreRoles() {
        const paths = ['./data/core-roles.json', '../data/core-roles.json'];
        for (const path of paths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const data = await response.json();
                    this.state.roles = data.roles;
                    return;
                }
            } catch (e) {}
        }
        // Fallback si no hay JSON
        this.state.roles = [{ id: "@pinya", multiplier: 1, precio_base_h: 30, fevs_req: {f:1,e:1,v:1,s:1} }];
    }

    dispatch(action) {
        const { type, payload } = action;
        switch (type) {
            case 'ADD_PROJECT':
                if(!this.state.projects.find(p => p.id === payload.id)) {
                    this.state.projects.push({ id: payload.id, nombre: payload.nombre, transactions: [] });
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

    addTransaction(projectId, transaction) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return;

        const rolConfig = this.state.roles.find(r => r.id === transaction.rolId) || this.state.roles[0];
        const liquidacion = (transaction.horas || 1) * (rolConfig.precio_base_h || 30) * (rolConfig.multiplier || 1);

        const newMeme = {
            id: `tx-${Date.now()}`,
            from: transaction.rolId,
            to: transaction.to || "@proyecto",
            concepto: transaction.concepto || "Sin concepto",
            horas: transaction.horas || 1,
            liquidación: liquidacion,
            tipo_flujo: transaction.tipo_flujo || 'tangible', // 'tangible' o 'intangible'
            timestamp: new Date().toISOString()
        };

        project.transactions.push(newMeme);
        this.state.transactions.push(newMeme);
    }

    getState() { return JSON.parse(JSON.stringify(this.state)); }
    saveState() { localStorage.setItem('teamtowers-v4-state', JSON.stringify(this.state)); }
    subscribe(callback) { this.listeners.push(callback); return () => this.listeners = this.listeners.filter(l => l !== callback); }
    notify() { this.listeners.forEach(l => l(this.state)); }
}

export const store = new TTStore();
window.store = store;
