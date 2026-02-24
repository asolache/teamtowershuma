/**
 * TEAMTOWERS SOS KERNEL v4.4 - REPARACIÓN TOTAL
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
                marketing: { "@anxaneta": "Strategy", "@aixecador": "Creative", "@dosos": "Content", "@baixos": "Design", "@pinya": "Ads" }
                // ... los demás sectores se mantienen igual
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
        const intangibles = p.transactions.filter(t => t.tipo === 'intangible').length;
        return intangibles > 0 ? 100 : 80;
    }

    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "";
        let prompt = `CONTEXTO SOS: ${p.nombre}\n`;
        const txs = [...(p.transactions || [])].sort((a,b) => (a.fase || 99) - (b.fase || 99));
        txs.forEach(t => {
            const rFrom = p.roles.find(r => r.id === t.from)?.name || 'Desconocido';
            prompt += `Fase ${t.fase || 1}: ${rFrom} entrega ${t.entregable}\n`;
        });
        return prompt;
    }

    dispatch(action) {
        const { type, payload } = action;
        // Referencia rápida al proyecto
        let p = (payload && payload.projectId) ? this.state.projects.find(x => x.id === payload.projectId) : null;

        switch(type) {
            case 'ADD_PROJECT':
                // REPARACIÓN CORE: Asegurar que el sector se guarde correctamente
                const sKey = payload.sector || 'marketing';
                
                // REPARACIÓN ONTOLOGY: Mapeo exacto de nombres por sector
                const initialRoles = Object.keys(this.ontologyStatic.niveles).map(levelId => {
                    const sectorNames = this.ontologyStatic.sectores[sKey] || this.ontologyStatic.sectores['marketing'];
                    const levelData = this.ontologyStatic.niveles[levelId];
                    return {
                        id: `role-${levelId}-${Date.now()}`, 
                        levelId: levelId,
                        name: sectorNames[levelId], // Aquí es donde el test de ONTOLOGY fallaba
                        price: levelData.precio,
                        multiplier: levelData.multiplier,
                        isArchived: false
                    };
                });

                // Limpiar si ya existía para el test y añadir
                this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
                this.state.projects.push({
                    id: payload.id, 
                    nombre: payload.nombre, 
                    sector: sKey, 
                    description: "",
                    roles: initialRoles, 
                    transactions: []
                });
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
                    if (role) role[payload.field] = payload.value;
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
                    
                    // REPARACIÓN ECONOMY: Cálculo de 540€ (2h * 3.0 * 90)
                    // Usamos los valores inyectados en el rol para asegurar consistencia
                    const multiplier = originRole ? originRole.multiplier : 1;
                    const price = originRole ? originRole.price : 0;
                    const horas = payload.tx.horas || 0;
                    const valorCalculado = horas * multiplier * price;

                    const newTx = { 
                        ...payload.tx, 
                        valorCongelado: valorCalculado, 
                        timestamp: Date.now(), 
                        prevHash: lastTx ? lastTx.hash : null, 
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

            case 'UPDATE_PROJECT_INFO':
                // REPARACIÓN DESIGN: p no estaba definido correctamente para este caso
                const proj = this.state.projects.find(x => x.id === payload.projectId);
                if (proj) proj.description = payload.description;
                break;
        }
        this.save();
    }
}

export const store = new TTStore();
