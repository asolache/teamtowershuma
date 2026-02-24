// 1. UTILIDADES GLOBALES (Solo una declaración)
const generateHash = (str) => {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; 
    }
    return Math.abs(hash).toString(16) + Date.now().toString(16);
};

const MAX_PROMPT_LENGTH = 4000;

// 2. NÚCLEO DEL SISTEMA
export class TTStore {
    constructor() {
        this.ontologyStatic = {
            sectores: { 
                marketing: { 
                    "@anxaneta": { name: "Strategy", prompt: "Eres el Director de Estrategia..." },
                    "@aixecador": { name: "Creative", prompt: "Eres el Director Creativo..." },
                    "@dosos": { name: "Content", prompt: "Eres el QA / Content Manager..." },
                    "@baixos": { name: "Design", prompt: "Eres el Diseñador Gráfico..." },
                    "@pinya": { name: "Ads", prompt: "Eres el Especialista en Pauta..." }
                },
                web3: { 
                    "@anxaneta": { name: "Lead Arch.", prompt: "Eres el Arquitecto Web3..." },
                    "@aixecador": { name: "Smart Contracts", prompt: "Eres el Lead de Contratos Inteligentes..." },
                    "@dosos": { name: "Auditor", prompt: "Eres el Auditor de Seguridad..." },
                    "@baixos": { name: "DApp Dev", prompt: "Eres el Desarrollador Web3..." },
                    "@pinya": { name: "Validator", prompt: "Eres el Operador de Nodos..." }
                },
                saas: { 
                    "@anxaneta": { name: "Product Owner", prompt: "Eres el Product Owner..." },
                    "@aixecador": { name: "Tech Lead", prompt: "Eres el Tech Lead..." },
                    "@dosos": { name: "QA Tester", prompt: "Eres el QA..." },
                    "@baixos": { name: "Frontend/Backend", prompt: "Eres el Desarrollador..." },
                    "@pinya": { name: "Soporte/DevOps", prompt: "Eres DevOps/Soporte..." }
                },
                legal: { 
                    "@anxaneta": { name: "Socio Director", prompt: "Eres el Socio Director..." },
                    "@aixecador": { name: "Asociado Senior", prompt: "Eres el Asociado Senior..." },
                    "@dosos": { name: "Revisor/Compliance", prompt: "Eres el Auditor de Compliance..." },
                    "@baixos": { name: "Abogado Junior", prompt: "Eres el Abogado Junior..." },
                    "@pinya": { name: "Paralegal", prompt: "Eres el Paralegal..." }
                }
            },
            niveles: {
                "@anxaneta": { multiplier: 3.0, precio: 90 },
                "@aixecador": { multiplier: 2.5, precio: 75 },
                "@dosos": { multiplier: 2.0, precio: 60 },
                "@baixos": { multiplier: 1.5, precio: 45 },
                "@pinya": { multiplier: 1.0, precio: 30 }
            }
        };

        this.orbitPrompts = {
            "@anxaneta": "Misión: Toma de decisiones de alto riesgo y visión estratégica.",
            "@aixecador": "Misión: Traducción de estrategia a táctica y coordinación.",
            "@dosos": "Misión: Fricción necesaria, validación y auditoría.",
            "@baixos": "Misión: Generación de valor directo y ejecución técnica.",
            "@pinya": "Misión: Soporte, infraestructura y mantenimiento."
        };

        this.state = { projects: [], ontology: this.ontologyStatic };
        this.init();
    }

    init() {
        const saved = localStorage.getItem('teamtowers-v4.4-state');
        if (saved) {
            try { 
                const data = JSON.parse(saved);
                this.state.projects = data.projects || []; 
            } catch (e) { 
                console.error("SOS Kernel Init Error:", e); 
                this.state.projects = [];
            }
        }
    }

    save() {
        localStorage.setItem('teamtowers-v4.4-state', JSON.stringify({ projects: this.state.projects }));
        window.dispatchEvent(new CustomEvent('store-ready')); 
    }

    getState() { return this.state; }

    // 🚀 RESTAURADO: Cálculo de Salud/Resiliencia (Evita el TypeError)
    calculateResilience(projectId, specificTxs = null) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return 100;
        const txsToEval = specificTxs || p.transactions || [];
        if (txsToEval.length === 0) return 100;
        
        const total = txsToEval.length;
        const audits = txsToEval.filter(t => {
            const rFrom = p.roles.find(r => r.id === t.from);
            const rTo = p.roles.find(r => r.id === t.to);
            return (rFrom && rFrom.levelId === '@dosos') || (rTo && rTo.levelId === '@dosos');
        }).length;
        return Math.round((audits / total) * 100);
    }

    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "";
        let prompt = `PROYECTO: ${p.nombre}\nSECTOR: ${p.sector}\n\n[ONTOLOGÍA]\n`;
        (p.roles || []).forEach(r => prompt += `- ${r.name} (${r.levelId})\n`);
        return prompt;
    }

    _createProjectInstance(id, nombre, sector, ownerId = 'ecosystem-admin') {
        const sKey = sector || 'web3';
        const sectorData = this.ontologyStatic.sectores[sKey] || this.ontologyStatic.sectores['marketing'];
        const initialRoles = Object.keys(this.ontologyStatic.niveles).map((levelId, idx) => {
            const def = this.ontologyStatic.niveles[levelId];
            return {
                id: `role-${Date.now()}-${idx}`,
                levelId: levelId,
                name: sectorData[levelId]?.name || "Rol Base",
                systemPrompt: sectorData[levelId]?.prompt || this.orbitPrompts[levelId],
                price: def.precio,
                multiplier: def.multiplier,
                isArchived: false
            };
        });
        return {
            id, nombre, sector: sKey, ownerId,
            roles: initialRoles, transactions: [], usuarios: [], ledger: [], asignaciones: []
        };
    }

    dispatch(action) {
        const { type, payload } = action;
        let p = (payload && payload.projectId) ? this.state.projects.find(x => x.id === payload.projectId) : null;

        switch(type) {
            case 'ADD_PROJECT':
                this.state.projects.push(this._createProjectInstance(payload.id, payload.nombre, payload.sector, payload.ownerId));
                break;

            case 'UPDATE_ROLE':
                if (p) {
                    const role = p.roles.find(r => r.id === payload.roleId);
                    if (role) {
                        if (payload.field === 'systemPrompt' && payload.value.length > MAX_PROMPT_LENGTH) return;
                        role[payload.field] = payload.value;
                        if (payload.field === 'levelId') {
                            const def = this.ontologyStatic.niveles[payload.value];
                            if (def) { role.price = def.precio; role.multiplier = def.multiplier; }
                        }
                    }
                }
                break;

            case 'SORT_TRANSACTIONS_BY_GRAVITY':
                if (p) {
                    p.transactions.forEach(tx => {
                        const rF = p.roles.find(r => r.id === tx.from);
                        const rT = p.roles.find(r => r.id === tx.to);
                        if(rF && rT) tx.fase = rF.multiplier > rT.multiplier ? 1 : 3;
                    });
                    p.transactions.sort((a,b) => a.fase - b.fase);
                }
                break;

            case 'IMPORT_BATCH_LEDGER':
                if (!payload.entries) return;
                payload.entries.forEach(entry => {
                    let proj = this.state.projects.find(x => x.id === entry.projectId);
                    if (!proj) {
                        proj = this._createProjectInstance(entry.projectId, "TeamTowers SOS (Importado)", "web3", payload.ownerId);
                        this.state.projects.push(proj);
                    }
                    const role = proj.roles.find(r => r.levelId === entry.levelId) || proj.roles[0];
                    proj.ledger.push({
                        id: `ldg-${Math.random().toString(16)}`,
                        timestamp: entry.timestamp || Date.now(),
                        userId: entry.userId,
                        roleId: role.id,
                        description: entry.description,
                        horas: entry.horas,
                        valorCongelado: entry.horas * role.price * role.multiplier
                    });
                });
                break;

            case 'ADD_TRANSACTION':
                if (p) {
                    const role = p.roles.find(r => r.id === payload.tx.from);
                    const valor = (payload.tx.horas || 1) * (role?.multiplier || 1) * (role?.price || 0);
                    p.transactions.push({ ...payload.tx, valorCongelado: valor, hash: generateHash("tx"), timestamp: Date.now() });
                }
                break;
        }
        this.save();
    }
}

// 3. INSTANCIA ÚNICA
export const store = new TTStore();

// 4. HERRAMIENTA DE DIAGNÓSTICO (Opcional, ayuda a detectar fallos)
window.runSOSDiagnostic = () => {
    console.log("🏥 Validando funciones del Kernel...");
    const check = (n) => typeof store[n] === 'function' ? `✅ ${n}` : `❌ ${n}`;
    ['calculateResilience', 'getState', 'dispatch'].forEach(f => console.log(check(f)));
};
