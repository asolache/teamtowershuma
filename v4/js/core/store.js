/**
 * TEAMTOWERS SOS v4.0 - KERNEL CENTRAL
 */
export class TTStore {
    constructor() {
        // Ontología de emergencia instantánea para evitar asincronía
        const emergencia = {
            sectores: { 
                marketing: { 
                    "@anxaneta": "Strategy Director", 
                    "@aixecador": "Creative Director", 
                    "@dosos": "Content Curator", 
                    "@baixos": "Graphic Designer", 
                    "@pinya": "Ads Manager" 
                },
                software: { 
                    "@anxaneta": "Product Owner", 
                    "@aixecador": "Architect", 
                    "@dosos": "QA / Tester", 
                    "@baixos": "Developer", 
                    "@pinya": "DevOps" 
                }
            },
            roles: [
                { id: "@anxaneta", multiplier: 3, precio_base_h: 90 },
                { id: "@aixecador", multiplier: 2.5, precio_base_h: 75 },
                { id: "@dosos", multiplier: 2, precio_base_h: 60 },
                { id: "@baixos", multiplier: 1.5, precio_base_h: 45 },
                { id: "@pinya", multiplier: 1, precio_base_h: 30 }
            ]
        };

        this.state = {
            projects: [],
            roles: emergencia.roles,
            ontology: emergencia,
            transactions: []
        };
        this.listeners = [];
        this.init();
    }

    async init() {
        const saved = localStorage.getItem('teamtowers-v4-state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state.projects = parsed.projects || [];
                this.state.transactions = parsed.transactions || [];
                this.state.projects.forEach(p => { if (!p.customRoles) p.customRoles = {}; });
            } catch (e) { console.error("Error en storage:", e); }
        }
        await this.loadOntology();
        window.dispatchEvent(new Event('store-ready'));
    }

    async loadOntology() {
        const paths = ['../data/core-roles.json', './data/core-roles.json', '/v4/data/core-roles.json'];
        for (const path of paths) {
            try {
                const res = await fetch(path);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.sectores) {
                        this.state.ontology = data;
                        this.state.roles = data.roles;
                        return;
                    }
                }
            } catch (e) {}
        }
    }

    dispatch(action) {
        const { type, payload } = action;
        switch (type) {
            case 'ADD_PROJECT':
                const sectorData = this.state.ontology.sectores[payload.sector] || this.state.ontology.sectores['software'];
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
                if (p) p.customRoles[payload.rolId] = payload.newName;
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
    getState() { return JSON.parse(JSON.stringify(this.state)); }
    subscribe(cb) { this.listeners.push(cb); }
    notify() { this.listeners.forEach(cb => cb(this.state)); }
}
export const store = new TTStore();
