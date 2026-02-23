// v4/js/core/store.js
export class TTStore {
    constructor() {
        this.state = { projects: [], roles: [], ontology: null, transactions: [] };
        this.listeners = [];
        this.init();
    }

    async init() {
        const saved = localStorage.getItem('teamtowers-v4-state');
        if (saved) {
            this.state = JSON.parse(saved);
            // BLINDAJE: Asegurar que proyectos viejos tengan el objeto customRoles
            this.state.projects.forEach(p => {
                if (!p.customRoles) p.customRoles = { 
                    "@anxaneta": "Estratega", "@aixecador": "Arquitecto", 
                    "@dosos": "Auditor", "@baixos": "Ejecutor", "@pinya": "Soporte" 
                };
            });
        }
        await this.loadOntology();
        window.dispatchEvent(new Event('store-ready'));
    }

    async loadOntology() {
        // Forzamos rutas absolutas desde la raíz para evitar fallos en subcarpetas
        const paths = ['/v4/data/core-roles.json', './data/core-roles.json', '../data/core-roles.json'];
        for (const path of paths) {
            try {
                const res = await fetch(path);
                if (res.ok) {
                    this.state.ontology = await res.json();
                    this.state.roles = this.state.ontology.roles;
                    console.log("✅ Ontología cargada:", path);
                    return;
                }
            } catch (e) {}
        }
        // FALLBACK CRÍTICO: Si el fetch falla, definimos una ontología mínima aquí
        console.warn("⚠️ Usando ontología interna de emergencia (fetch falló)");
        this.state.ontology = {
            sectores: { 
                software: { "@anxaneta": "PO", "@aixecador": "Arch", "@dosos": "QA", "@baixos": "Dev", "@pinya": "Ops" }
            },
            roles: [
                { id: "@anxaneta", multiplier: 3, precio_base_h: 90 },
                { id: "@aixecador", multiplier: 2.5, precio_base_h: 75 },
                { id: "@dosos", multiplier: 2, precio_base_h: 60 },
                { id: "@baixos", multiplier: 1.5, precio_base_h: 45 },
                { id: "@pinya", multiplier: 1, precio_base_h: 30 }
            ]
        };
        this.state.roles = this.state.ontology.roles;
    }

    dispatch(action) {
        const { type, payload } = action;
        switch (type) {
            case 'ADD_PROJECT':
                const sectorData = (this.state.ontology && this.state.ontology.sectores[payload.sector]) 
                                    ? this.state.ontology.sectores[payload.sector] 
                                    : { "@anxaneta": "Líder", "@aixecador": "Arquitecto", "@dosos": "Vocal", "@baixos": "Base", "@pinya": "Pinya" };
                
                this.state.projects.push({
                    id: payload.id,
                    nombre: payload.nombre,
                    sector: payload.sector,
                    customRoles: { ...sectorData },
                    transactions: []
                });
                break;
                
            case 'UPDATE_ROLE_NAME':
                const p = this.state.projects.find(p => p.id === payload.projectId);
                if (p) {
                    if (!p.customRoles) p.customRoles = {};
                    p.customRoles[payload.rolId] = payload.newName;
                }
                break;
                
            case 'ADD_TRANSACTION':
                this.addTx(payload.projectId, payload.transaction);
                break;

            case 'RESET_DATABASE':
                localStorage.removeItem('teamtowers-v4-state');
                location.reload();
                break;
        }
        this.save();
        this.notify();
    }

    addTx(pId, tx) {
        const p = this.state.projects.find(p => p.id === pId);
        if (!p) return;
        const r = this.state.roles.find(r => r.id === tx.rolId) || { precio_base_h: 30, multiplier: 1 };
        const liq = (tx.horas || 1) * r.precio_base_h * r.multiplier;
        p.transactions.push({ ...tx, liquidación: liq, id: Date.now() });
    }

    save() { localStorage.setItem('teamtowers-v4-state', JSON.stringify(this.state)); }
    getState() { return this.state; }
    subscribe(cb) { this.listeners.push(cb); }
    notify() { this.listeners.forEach(cb => cb(this.state)); }
}
export const store = new TTStore();
