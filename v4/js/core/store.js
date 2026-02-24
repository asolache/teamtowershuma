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
            // 🚀 BUG FIX: Los 10 sectores definidos en el core para que nunca fallen
            sectores: { 
                marketing: { "@anxaneta": "Strategy", "@aixecador": "Creative", "@dosos": "Content", "@baixos": "Design", "@pinya": "Ads" },
                web3: { "@anxaneta": "Lead Arch.", "@aixecador": "Smart Contracts", "@dosos": "Auditor", "@baixos": "DApp Dev", "@pinya": "Validator" },
                gremial: { "@anxaneta": "Ingeniero", "@aixecador": "Oficial", "@dosos": "Calidad", "@baixos": "Especialista", "@pinya": "Logística" },
                saas: { "@anxaneta": "Product Owner", "@aixecador": "Tech Lead", "@dosos": "QA Tester", "@baixos": "Frontend/Backend", "@pinya": "Soporte/DevOps" },
                legal: { "@anxaneta": "Socio Director", "@aixecador": "Asociado Senior", "@dosos": "Revisor/Compliance", "@baixos": "Abogado Junior", "@pinya": "Paralegal" },
                salud: { "@anxaneta": "Director Médico", "@aixecador": "Jefe de Planta", "@dosos": "Supervisor", "@baixos": "Especialista", "@pinya": "Enfermería/Celador" },
                hosteleria: { "@anxaneta": "Gerente/Chef", "@aixecador": "Maître", "@dosos": "Jefe de Rango", "@baixos": "Cocinero/Camarero", "@pinya": "Ayudante" },
                educacion: { "@anxaneta": "Rector/Director", "@aixecador": "Jefe Estudios", "@dosos": "Coordinador", "@baixos": "Profesor", "@pinya": "Administración" },
                construccion: { "@anxaneta": "Arquitecto", "@aixecador": "Jefe de Obra", "@dosos": "Aparejador (QA)", "@baixos": "Oficial", "@pinya": "Peón" },
                audiovisual: { "@anxaneta": "Productor Ej.", "@aixecador": "Director", "@dosos": "Script/Continuidad", "@baixos": "Cámara/Sonido", "@pinya": "Eléctrico/Auxiliar" }
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
        let prompt = `PROYECTO: ${p.nombre}\nSECTOR: ${p.sector}\nMISIÓN ESTRATÉGICA: ${p.description || 'Operación estándar'}\n\n`;
        
        prompt += `[ONTOLOGÍA UNIFICADA DE ROLES]\n`;
        (p.roles || []).filter(r => !r.isArchived).forEach(r => {
            prompt += `- ${r.name} (Nivel: ${r.levelId} | Poder: ${r.multiplier}x)\n`;
        });

        prompt += `\n[FLUJO DE PROCESOS E INYECCIÓN DE VALOR]\n`;
        const txs = [...(p.transactions || [])].sort((a,b) => (a.fase || 99) - (b.fase || 99));
        
        if (txs.length === 0) {
            prompt += `Aún no hay transacciones definidas en el mapa.\n`;
        } else {
            txs.forEach(t => {
                const f = t.fase && t.fase !== 99 ? `Fase ${t.fase}` : 'Flujo Continuo';
                const rFrom = p.roles.find(r => r.id === t.from)?.name || t.from;
                const rTo = p.roles.find(r => r.id === t.to)?.name || t.to;
                const val = t.valorCongelado || 0;
                prompt += `- ${f}: [${rFrom}] entrega "${t.entregable || 'Ninguno'}" a [${rTo}] | Valor Slicing Pie: ${val}€\n`;
            });
        }

        return prompt;
    }

    dispatch(action) {
        const { type, payload } = action;
        let p = (payload && payload.projectId) ? this.state.projects.find(x => x.id === payload.projectId) : null;

        switch(type) {
            case 'ADD_PROJECT':
                this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
                
                const sKey = payload.sector || 'marketing';
                // Si el sector no existe, hacemos fallback seguro a marketing
                const sectorAliases = this.ontologyStatic.sectores[sKey] || this.ontologyStatic.sectores['marketing'];
                
                let idCounter = 0;
                const initialRoles = Object.keys(this.ontologyStatic.niveles).map(levelId => {
                    idCounter++;
                    const levelDef = this.ontologyStatic.niveles[levelId];
                    return {
                        id: `role-${Date.now()}-${idCounter}`, 
                        levelId: levelId,
                        name: sectorAliases[levelId],
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
                    usuarios: [],     
                    asignaciones: [], 
                    ledger: [],       
                    rondas: [{ id: `ronda-${Date.now()}`, name: 'Fase 1: Bootstrapping', multiplier: 2.0 }]
                });
                break;

            case 'UPDATE_PROJECT_INFO':
                const targetP = this.state.projects.find(x => x.id === payload.projectId);
                if (targetP) {
                    targetP.nombre = payload.nombre || targetP.nombre;
                    targetP.sector = payload.sector || targetP.sector;
                    targetP.description = payload.description !== undefined ? payload.description : targetP.description;
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
                        if (payload.field === 'levelId') {
                            const def = this.ontologyStatic.niveles[payload.value];
                            if (def) {
                                role.price = def.precio;
                                role.multiplier = def.multiplier;
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

            // 👤 MOTOR DE USUARIOS Y CONTABILIDAD (v4.5)
            case 'ADD_USER':
                if (p) {
                    p.usuarios = p.usuarios || [];
                    p.usuarios.push({
                        id: `usr-${Date.now()}`,
                        name: payload.name,
                        alias: payload.alias || '',
                        joinedAt: Date.now()
                    });
                }
                break;

            case 'ASSIGN_USER_ROLE':
                if (p) {
                    p.asignaciones = p.asignaciones || [];
                    const exists = p.asignaciones.find(a => a.userId === payload.userId && a.roleId === payload.roleId);
                    if (!exists) {
                        p.asignaciones.push({ 
                            id: `asg-${Date.now()}`,
                            userId: payload.userId, 
                            roleId: payload.roleId 
                        });
                    }
                }
                break;

            case 'REMOVE_USER_ROLE':
                if (p) {
                    p.asignaciones = p.asignaciones || [];
                    p.asignaciones = p.asignaciones.filter(a => !(a.userId === payload.userId && a.roleId === payload.roleId));
                }
                break;

            case 'ADD_LEDGER_ENTRY':
                if (p) {
                    p.ledger = p.ledger || [];
                    const roleEmisor = p.roles.find(r => r.id === payload.roleId);
                    
                    const multiplier = roleEmisor ? roleEmisor.multiplier : 1;
                    const price = roleEmisor ? roleEmisor.price : 0;
                    const horasInvertidas = parseFloat(payload.horas) || 1;
                    const valorGenerado = horasInvertidas * multiplier * price;

                    p.ledger.push({
                        id: `ldg-${Date.now()}`,
                        timestamp: Date.now(),
                        userId: payload.userId,
                        roleId: payload.roleId,
                        receiverId: payload.receiverId,
                        description: payload.description,
                        horas: horasInvertidas,
                        valorCongelado: valorGenerado
                    });
                }
                break;
        }
        this.save();
    }
}
export const store = new TTStore();
