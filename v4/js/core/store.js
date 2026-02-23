/**
 * TEAMTOWERS SOS v4.0 - KERNEL
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
        this.state.projects = this.state.projects || [];
        this.state.transactions = this.state.transactions || [];
        if (!this.state.users?.length) this.state.users = this.getDefaultUsers();
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
        this.state.roles = [{ id: "@pinya", multiplier: 1, precio_base_h: 30, fevs_req: {f:1,e:1,v:1,s:1} }];
    }

    dispatch(action) {
        const { type, payload } = action;
        switch (type) {
            case 'ADD_PROJECT':
                this.state.projects.push({ id: payload.id, nombre: payload.nombre, transactions: [], created_at: new Date().toISOString() });
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
            from: transaction.rolId, // Quién entrega
            to: transaction.to || "@proyecto", // Quién recibe (Flecha)
            rolId: transaction.rolId,
            concepto: transaction.concepto || "Valor inyectado",
            horas: transaction.horas || 1,
            liquidación: liquidacion,
            tipo_valor: transaction.horas > 2 ? 'intangible' : 'tangible',
            categoria: transaction.categoria || '#hacer',
            uv: transaction.uv || 100,
            timestamp: new Date().toISOString()
        };

        project.transactions.push(newMeme);
        this.state.transactions.push(newMeme);
    }

    getState() { return JSON.parse(JSON.stringify(this.state)); }
    saveState() { localStorage.setItem('teamtowers-v4-state', JSON.stringify(this.state)); }
    subscribe(callback) { this.listeners.push(callback); return () => this.listeners = this.listeners.filter(l => l !== callback); }
    notify() { this.listeners.forEach(l => l(this.state)); }
    getDefaultUsers() { return [{ id: "@alvaro", nombre: "Álvaro", fevs: {f:9,e:9,v:9,s:9} }]; }
}

export const store = new TTStore();
window.store = store;
