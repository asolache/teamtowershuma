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
            niveles: {
                "@anxaneta": { multiplier: 3.0, precio: 90 },
                "@aixecador": { multiplier: 2.5, precio: 75 },
                "@dosos": { multiplier: 2.0, precio: 60 },
                "@baixos": { multiplier: 1.5, precio: 45 },
                "@pinya": { multiplier: 1.0, precio: 30 }
            }
        };

        this.state = { projects: [], ontology: this.ontologyStatic };
        this.init();
    }

    init() {
        const saved = localStorage.getItem('teamtowers-v4.4-state');
        if (saved) {
            try { this.state.projects = JSON.parse(saved).projects || []; } 
            catch (e) { console.error("SOS Kernel: Error storage", e); }
        }
    }

    save() {
        localStorage.setItem('teamtowers-v4.4-state', JSON.stringify({ projects: this.state.projects }));
        window.dispatchEvent(new CustomEvent('store-ready')); 
    }

    getState() { return this.state; }

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.transactions || p.transactions.length === 0) return 100;
        
        // Lógica Allee/Audit: ¿Existen flujos revisados por @dosos (Calidad)?
        const audits = p.transactions.filter(t => {
            const rFrom = p.roles.find(r => r.id === t.from);
            const rTo = p.roles.find(r => r.id === t.to);
            return (rFrom && rFrom.levelId === '@dosos') || (rTo && rTo.levelId === '@dosos');
        }).length;
        
        return audits > 0 ? 100 : 80;
    }

    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "Esperando datos...";
        let prompt = `[CONTEXTO SOS]\nPROYECTO: ${p.nombre}\nSECTOR: ${p.sector}\nMISIÓN: ${p.description || 'N/A'}\n\n`;
        prompt += `[ROLES]\n` + p.roles.filter(r => !r.isArchived).map(r => `- ${r.name} (${r.levelId})`).join('\n');
        prompt += `\n\n[FLUJO]\n` + (p.transactions || []).sort((a,b) => (a.fase || 0) - (b.fase || 0)).map(t => `- Fase ${t.fase || 1}: ${t.entregable}`).join('\n');
        return prompt;
    }

    dispatch(action) {
        const { type, payload } = action;
        let p = (payload && payload.projectId) ? this.state.projects.find(x => x.id === payload.projectId) : null;

        switch(type) {
            case 'ADD_PROJECT':
                const sKey = payload.sector || 'marketing';
                const initialRoles = Object.keys(this.ontologyStatic.niveles).map(levelId => ({
                    id: `role-${levelId}-${Date.now()}`, 
                    levelId: levelId,
                    name: this.ontologyStatic.sectores[sKey][levelId],
                    price: this.ontologyStatic.niveles[levelId].precio,
                    multiplier: this.ontologyStatic.niveles[levelId].multiplier,
                    isArchived: false
                }));
                const initialRonda = { id: `ronda-${Date.now()}`, name: 'Fase 1: Bootstrapping', startDate: new Date().toISOString().split('T')[0], endDate: '', multiplier: 1.0 };
                
                this.state.projects.push({
                    id: payload.id, nombre: payload.nombre, sector: sKey, description: "",
                    roles: initialRoles, rondas: [initialRonda], transactions: []
                });
                break;

            case 'UPDATE_PROJECT_INFO':
                const targetP = this.state.projects.find(x => x.id === payload.projectId);
                if (targetP) {
                    targetP.nombre = payload.nombre;
                    targetP.sector = payload.sector;
                    targetP.description = payload.description;
                }
                break;

            case 'CREATE_ROLE':
                if (p) {
                    const def = this.ontologyStatic.niveles[payload.levelId];
                    p.roles.push({ id: `role-${Date.now()}`, name: payload.name, levelId: payload.levelId, price: def.precio, multiplier: def.multiplier, isArchived: false });
                }
                break;

            case 'UPDATE_ROLE':
                if (p) {
                    const role = p.roles.find(r => r.id === payload.roleId);
                    if (role) {
                        if (payload.field === 'name' || payload.field === 'levelId') role[payload.field] = payload.value;
                        else role[payload.field] = parseFloat(payload.value);
                    }
                }
                break;

            case 'ARCHIVE_ROLE':
                if (p) {
                    const r = p.roles.find(r => r.id === payload.roleId);
                    if (r) r.isArchived = true;
                }
                break;

            case 'CREATE_RONDA':
                if (p) {
                    p.rondas.push({ id: `ronda-${Date.now()}`, name: payload.name, startDate: payload.startDate, endDate: payload.endDate, multiplier: parseFloat(payload.multiplier) || 1.0 });
                }
                break;

            case 'UPDATE_RONDA':
                if (p) {
                    const r = p.rondas.find(x => x.id === payload.rondaId);
                    if (r) r[payload.field] = (payload.field === 'multiplier') ? parseFloat(payload.value) : payload.value;
                }
                break;

            case 'DELETE_RONDA':
                if (p) p.rondas = p.rondas.filter(x => x.id !== payload.rondaId);
                break;

            case 'ADD_TRANSACTION':
                if (p) {
                    const originRole = p.roles.find(r => r.id === payload.tx.from);
                    const lastTx = p.transactions[p.transactions.length - 1];
                    
                    // Cálculo de Slicing Pie (Horas * Multiplicador Rol * Precio Rol)
                    const valor = (payload.tx.horas || 1) * (originRole?.multiplier || 1) * (originRole?.price || 1);

                    const newTx = { 
                        ...payload.tx, 
                        valorCongelado: valor, 
                        timestamp: Date.now(), 
                        prevHash: lastTx ? lastTx.hash : "0", 
                        fase: p.transactions.length + 1,
                        hash: "" 
                    };
                    newTx.hash = generateHash(JSON.stringify(newTx));
                    p.transactions.push(newTx);
                }
                break;

            case 'UPDATE_TRANSACTION_PHASE':
                if (p) {
                    const tx = p.transactions.find(t => t.hash === payload.txHash);
                    if (tx) tx.fase = parseInt(payload.fase);
                }
                break;

            case 'IMPORT_DATA':
                if (payload && payload.projects) this.state.projects = payload.projects;
                break;
        }
        this.save();
    }
}
export const store = new TTStore();
