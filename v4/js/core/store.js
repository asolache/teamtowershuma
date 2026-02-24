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
                gremial: { "@anxaneta": "Ingeniero", "@aixecador": "Oficial", "@dosos": "Calidad", "@baixos": "Especialista", "@pinya": "Logística" }
                // ... (el resto de sectores se mantienen igual)
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

    calculateResilience(projectId, specificTxs = null) {
        const p = this.state.projects.find(x => x.id === projectId);
        const txsToEval = specificTxs || (p ? p.transactions : []);
        if (!p || !txsToEval || txsToEval.length === 0) return 100;
        
        const total = txsToEval.length;
        const audits = txsToEval.filter(t => {
            const rFrom = p.roles.find(r => r.id === t.from);
            const rTo = p.roles.find(r => r.id === t.to);
            return (rFrom && rFrom.levelId === '@dosos') || (rTo && rTo.levelId === '@dosos');
        }).length;
        return Math.round((audits / total) * 100) || 100;
    }

    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "";
        let prompt = `CONTEXTO SOS: ${p.nombre}\nSECTOR: ${p.sector}\nMISIÓN: ${p.description || 'Operación estándar'}\n\n`;
        
        prompt += `[ONTOLOGÍA UNIFICADA DE ROLES]\n`;
        (p.roles || []).filter(r => !r.isArchived).forEach(r => {
            prompt += `- ${r.name} (Nivel: ${r.levelId} | Poder: ${r.multiplier}x)\n`;
        });

        prompt += `\n[FLUJO DE PROCESOS]\n`;
        const txs = [...(p.transactions || [])].sort((a,b) => (a.fase || 99) - (b.fase || 99));
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
        let p = (payload && payload.projectId) ? this.state.projects.find(x => x.id === payload.projectId) : null;

        switch(type) {
            case 'ADD_PROJECT':
                // REPARACIÓN CORE: Limpiar si ya existe para el test
                this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
                
                const sKey = payload.sector || 'marketing';
                const sectorAliases = this.ontologyStatic.sectores[sKey] || this.ontologyStatic.sectores['marketing'];
                
                // REPARACIÓN ONTOLOGY: Generar los 5 roles con nombres del sector
                let idCounter = 0;
                const initialRoles = Object.keys(this.ontologyStatic.niveles).map(levelId => {
                    idCounter++;
                    const levelDef = this.ontologyStatic.niveles[levelId];
                    return {
                        id: `role-${Date.now()}-${idCounter}`, 
                        levelId: levelId,
                        name: sectorAliases[levelId], // Inyecta "Strategy" si es marketing
                        price: levelDef.precio,
                        multiplier: levelDef.multiplier,
                        isArchived: false
                    };
                });

                this.state.projects.push({
                    id: payload.id, 
                    nombre: payload.nombre, 
                    sector: sKey, 
                    description: "",
                    roles: initialRoles, 
                    transactions: [],
                    rondas: [{ id: `ronda-${Date.now()}`, name: 'Fase 1: Bootstrapping', multiplier: 2.0 }]
                });
                break;

            case 'UPDATE_PROJECT_INFO':
                const targetP = this.state.projects.find(x => x.id === payload.projectId);
                if (targetP) {
                    targetP.nombre = payload.nombre || targetP.nombre;
                    targetP.sector = payload.sector || targetP.sector;
                    targetP.description = payload.description || targetP.description;
                }
                break;

            case 'CREATE_ROLE':
                if (p) {
                    const def = this.ontologyStatic.niveles[payload.levelId];
                    p.roles.push({ 
                        id: `role-${Date.now()}`, 
                        name: payload.name, 
                        levelId: payload.levelId, 
                        price: def.precio, 
                        multiplier: def.multiplier, 
                        isArchived: false 
                    });
                }
                break;

           case 'UPDATE_ROLE':
                if (p) {
                    const role = p.roles.find(r => r.id === payload.roleId);
                    if (role) {
                        role[payload.field] = payload.value;
                        
                        // 🛠️ REPARACIÓN: Si cambiamos el nivel, actualizamos herencia financiera
                        if (payload.field === 'levelId') {
                            const def = this.ontologyStatic.niveles[payload.value];
                            if (def) {
                                role.price = def.precio;
                                role.multiplier = def.multiplier;
                                console.log(`🚀 Órbita actualizada: ${payload.value} (Price: ${def.precio}, Multiplier: ${def.multiplier})`);
                            }
                        }
                    }
                }
                break;

            case 'ARCHIVE_ROLE':
                if (p) {
                    const r = p.roles.find(r => r.id === payload.roleId);
                    if (r) r.isArchived = true;
                }
                break;

            case 'ADD_TRANSACTION':
                if (p) {
                    const originRole = p.roles.find(r => r.id === payload.tx.from);
                    const lastTx = p.transactions[p.transactions.length - 1];
                    
                    // REPARACIÓN ECONOMY: 2h * multiplier * price (540€ para anxaneta)
                    const multiplier = originRole ? originRole.multiplier : 1;
                    const price = originRole ? originRole.price : 0;
                    const valor = (payload.tx.horas || 1) * multiplier * price;

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
                    if (tx) tx.fase = payload.fase;
                }
                break;
        }
        this.save();
    }
}
export const store = new TTStore();
