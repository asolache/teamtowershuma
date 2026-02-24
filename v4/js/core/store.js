/**
 * TEAMTOWERS SOS v4.3 - KERNEL DE INMUTABILIDAD E INTELIGENCIA
 * He ajustado la función notify() para que lance un evento global cada vez que haya un cambio.
 */

const generateHash = (str) => {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; 
    }
    return Math.abs(hash).toString(16) + Date.now().toString(16);
};

export class TTStore {
    constructor() {
        this.ontologyStatic = {
            sectores: { 
                marketing: { "@anxaneta": "Strategy", "@aixecador": "Creative", "@dosos": "Content", "@baixos": "Design", "@pinya": "Ads" },
                Web3: { "@anxaneta": "Lead Arch.", "@aixecador": "Smart Contracts", "@dosos": "Auditor", "@baixos": "DApp Dev", "@pinya": "Validator" },
                gremial: { "@anxaneta": "Ingeniero", "@aixecador": "Oficial", "@dosos": "Calidad", "@baixos": "Especialista", "@pinya": "Logística" },
                salud: { "@anxaneta": "Director Médico", "@aixecador": "Especialista", "@dosos": "Enfermería", "@baixos": "Técnico", "@pinya": "Admisión" },
                educacion: { "@anxaneta": "Director", "@aixecador": "Profesor", "@dosos": "Pedagogo", "@baixos": "Tutor", "@pinya": "Secretaría" },
                eventos: { "@anxaneta": "Producer", "@aixecador": "Logística", "@dosos": "Stage Manager", "@baixos": "Técnico", "@pinya": "Staff" },
                legal: { "@anxaneta": "Socio", "@aixecador": "Abogado", "@dosos": "Paralegal", "@baixos": "Notaría", "@pinya": "Archivo" },
                finanzas: { "@anxaneta": "CFO", "@aixecador": "Analista", "@dosos": "Controller", "@baixos": "Contable", "@pinya": "Tesorería" },
                retail: { "@anxaneta": "Manager", "@aixecador": "Buyer", "@dosos": "Visual", "@baixos": "Vendedor", "@pinya": "Almacén" },
                turismo: { "@anxaneta": "Director", "@aixecador": "Guía", "@dosos": "Guest Rel.", "@baixos": "Recepción", "@pinya": "Booking" }
            },
            roles: [
                { id: "@anxaneta", multiplier: 3.0, precio_base_h: 90 },
                { id: "@aixecador", multiplier: 2.5, precio_base_h: 75 },
                { id: "@dosos", multiplier: 2.0, precio_base_h: 60 },
                { id: "@baixos", multiplier: 1.5, precio_base_h: 45 },
                { id: "@pinya", multiplier: 1.0, precio_base_h: 30 }
            ]
        };

        this.state = { projects: [], ontology: this.ontologyStatic, roles: this.ontologyStatic.roles };
        this.listeners = [];
        this.init();
    }

    init() {
        const saved = localStorage.getItem('teamtowers-v4-state');
        if (saved) {
            try { this.state.projects = JSON.parse(saved).projects || []; } 
            catch (e) { console.error("SOS: Error storage", e); }
        }
        setTimeout(() => window.dispatchEvent(new CustomEvent('store-ready')), 10);
    }

    save() {
        localStorage.setItem('teamtowers-v4-state', JSON.stringify({ projects: this.state.projects }));
        this.notify();
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
        // 🚀 MAGIA SPA: Avisamos al router de que hay datos nuevos
        window.dispatchEvent(new CustomEvent('store-ready')); 
    }

    getState() { return this.state; }

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.transactions || p.transactions.length === 0) return 100;
        const total = p.transactions.length;
        const audits = p.transactions.filter(t => t.from === '@dosos' || t.to === '@dosos').length;
        return Math.round((audits / total) * 100) || 100;
    }

    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "";
        let prompt = `CONTEXTO SOS: ${p.nombre}\nSECTOR: ${p.sector}\nMISION: ${p.description || 'Operación estándar'}\n\n[MAPA DE VALOR]\n`;
        const defaultSeq = { "@anxaneta": 1, "@aixecador": 2, "@dosos": 3, "@baixos": 4, "@pinya": 5 };
        const list = [
            ...Object.keys(p.customRoles).map(id => ({ id, name: p.customRoles[id], seq: p.sequences?.[id] || defaultSeq[id] })),
            ...(p.dynamicRoles || []).filter(dr => !dr.isArchived).map(dr => ({ id: dr.id, name: dr.name, seq: p.sequences?.[dr.id] || 99 }))
        ];
        list.sort((a,b) => a.seq - b.seq).forEach(r => prompt += `Fase ${r.seq}: ${r.name} (${r.id})\n`);
        return prompt;
    }

    dispatch(action) {
        const { type, payload } = action;
        const p = payload.projectId ? this.state.projects.find(x => x.id === payload.projectId) : null;

        switch(type) {
            case 'ADD_PROJECT':
                this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
                const sKey = payload.sector || 'marketing';
                this.state.projects.push({
                    id: payload.id, nombre: payload.nombre, sector: sKey, description: "",
                    customRoles: { ...this.ontologyStatic.sectores[sKey] }, dynamicRoles: [], transactions: [],
                    sequences: { "@anxaneta": 1, "@aixecador": 2, "@dosos": 3, "@baixos": 4, "@pinya": 5 }
                });
                break;
            case 'UPDATE_PROJECT_INFO':
                if (p) {
                    p.nombre = payload.nombre; p.sector = payload.sector; p.description = payload.description;
                    p.customRoles = { ...this.ontologyStatic.sectores[payload.sector] };
                }
                break;
            case 'CREATE_CUSTOM_ROLE':
                if (p) {
                    if (!p.dynamicRoles) p.dynamicRoles = [];
                    p.dynamicRoles.push({ id: `dyn-${Date.now()}`, name: payload.name, levelId: payload.levelId, area: payload.area || 'Gremio', isArchived: false });
                }
                break;
            case 'UPDATE_ROLE_SEQUENCE':
                if (p) {
                    if (!p.sequences) p.sequences = {};
                    p.sequences[payload.rolId] = parseInt(payload.sequence);
                }
                break;
            case 'ARCHIVE_CUSTOM_ROLE':
                if (p) {
                    const role = p.dynamicRoles.find(r => r.id === payload.rolId);
                    if (role) role.isArchived = true;
                }
                break;
            case 'ADD_TRANSACTION':
                if (p) {
                    const lastTx = p.transactions[p.transactions.length - 1];
                    const newTx = { ...payload.tx, timestamp: Date.now(), prevHash: lastTx ? lastTx.hash : "0", hash: "" };
                    newTx.hash = generateHash(JSON.stringify(newTx));
                    p.transactions.push(newTx);
                }
                break;
        }
        this.save();
    }
}
export const store = new TTStore();
