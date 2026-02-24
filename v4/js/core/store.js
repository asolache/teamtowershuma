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
        this.listeners = [];
        this.init();
    }

    init() {
        const saved = localStorage.getItem('teamtowers-v4.4-state');
        if (saved) {
            try { this.state.projects = JSON.parse(saved).projects || []; } 
            catch (e) { console.error("SOS: Error storage", e); }
        }
        setTimeout(() => window.dispatchEvent(new CustomEvent('store-ready')), 10);
    }

    save() {
        localStorage.setItem('teamtowers-v4.4-state', JSON.stringify({ projects: this.state.projects }));
        this.notify();
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
        window.dispatchEvent(new CustomEvent('store-ready')); 
    }

    getState() { return this.state; }

    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.transactions || p.transactions.length === 0) return 100;
        const total = p.transactions.length;
        const audits = p.transactions.filter(t => {
            const roleFrom = p.roles.find(r => r.id === t.from);
            const roleTo = p.roles.find(r => r.id === t.to);
            return (roleFrom && roleFrom.levelId === '@dosos') || (roleTo && roleTo.levelId === '@dosos');
        }).length;
        return Math.round((audits / total) * 100) || 100;
    }

    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "";
        let prompt = `CONTEXTO SOS: ${p.nombre}\nSECTOR: ${p.sector}\nMISION: ${p.description || 'Operación estándar'}\n\n`;
        
        prompt += `[ONTOLOGÍA UNIFICADA DE ROLES]\n`;
        (p.roles || []).filter(r => !r.isArchived).forEach(r => {
            prompt += `- ${r.name} (Nivel: ${r.levelId} | Poder: ${r.multiplier}x)\n`;
        });

        prompt += `\n[FLUJO DE PROCESOS]\n`;
        const txs = [...(p.transactions || [])].sort((a,b) => (a.fase || 99) - (b.fase || 99));
        if (txs.length === 0) prompt += "Sin transacciones.\n";
        
        txs.forEach(t => {
            const f = t.fase && t.fase !== 99 ? `Fase ${t.fase}` : 'Flujo Continuo';
            const rFrom = p.roles.find(r => r.id === t.from)?.name || t.from;
            const rTo = p.roles.find(r => r.id === t.to)?.name || t.to;
            prompt += `- ${f}: [${rFrom}] entrega "${t.entregable}" a [${rTo}]\n`;
        });

        return prompt;
    }

    dispatch(action) {
        const { type, payload } = action;
        
        // 🐛 AQUÍ ESTABA EL BUG: He corregido la validación del payload.projectId
        const p = (payload && payload.projectId) ? this.state.projects.find(x => x.id === payload.projectId) : null;

        switch(type) {
            case 'ADD_PROJECT':
                this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
                const sKey = payload.sector || 'marketing';
                
                let idCounter = 0;
                const initialRoles = Object.keys(this.ontologyStatic.sectores[sKey]).map(level => {
                    idCounter++;
                    return {
                        id: `role-${Date.now()}-${idCounter}`, 
                        name: this.ontologyStatic.sectores[sKey][level],
                        levelId: level,
                        price: this.ontologyStatic.niveles[level].precio,
                        multiplier: this.ontologyStatic.niveles[level].multiplier,
                        isArchived: false
                    };
                });

                this.state.projects.push({
                    id: payload.id, nombre: payload.nombre, sector: sKey, description: "",
                    roles: initialRoles, transactions: []
                });
                break;

            case 'UPDATE_PROJECT_INFO':
                if (p) {
                    p.nombre = payload.nombre; p.sector = payload.sector; p.description = payload.description;
                }
                break;

            case 'CREATE_ROLE':
                if (p) {
                    const defaults = this.ontologyStatic.niveles[payload.levelId];
                    p.roles.push({ 
                        id: `role-${Date.now()}`, 
                        name: payload.name, 
                        levelId: payload.levelId, 
                        price: payload.price || defaults.precio, 
                        multiplier: payload.multiplier || defaults.multiplier, 
                        isArchived: false
                    });
                }
                break;

            case 'UPDATE_ROLE':
                if (p) {
                    const role = p.roles.find(r => r.id === payload.roleId);
                    if (role) {
                        if (payload.field === 'name' || payload.field === 'levelId') {
                            role[payload.field] = payload.value;
                        } else {
                            role[payload.field] = parseFloat(payload.value);
                        }
                    }
                }
                break;

            case 'ARCHIVE_ROLE':
                if (p) {
                    const roleToArchive = p.roles.find(r => r.id === payload.roleId);
                    if (roleToArchive) roleToArchive.isArchived = true;
                }
                break;

            case 'ADD_TRANSACTION':
                if (p) {
                    const lastTx = p.transactions[p.transactions.length - 1];
                    const nextFase = p.transactions.length + 1;
                    
                    const originRole = p.roles.find(r => r.id === payload.tx.from);
                    const horasReales = parseFloat(payload.tx.horas) || 1;
                    let valorCalculado = 0;
                    if (originRole) {
                        valorCalculado = horasReales * originRole.multiplier * originRole.price;
                    }

                    const newTx = { 
                        ...payload.tx, 
                        timestamp: Date.now(), 
                        prevHash: lastTx ? lastTx.hash : "0", 
                        hash: "", 
                        fase: nextFase,
                        valorCongelado: valorCalculado
                    };
                    newTx.hash = generateHash(JSON.stringify(newTx));
                    p.transactions.push(newTx);
                }
                break;

            case 'UPDATE_TRANSACTION_PHASE':
                if (p) {
                    const tx = p.transactions.find(t => t.hash === payload.txHash);
                    if (tx) tx.fase = parseInt(payload.fase) || 99;
                }
                break;
        }
        this.save();
    }
}
export const store = new TTStore();
