// 1. UTILIDADES (Criptografía Ligera)
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
                this.state.projects = [];
            }
        }
    }

    save() {
        localStorage.setItem('teamtowers-v4.4-state', JSON.stringify({ projects: this.state.projects }));
        window.dispatchEvent(new CustomEvent('store-ready')); 
    }

    getState() { return this.state; }

    // 🏥 ANALÍTICA: Resiliencia (Fundamental para HomeView)
    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.transactions || p.transactions.length === 0) return 100;
        const total = p.transactions.length;
        const audits = p.transactions.filter(t => {
            const rF = p.roles.find(r => r.id === t.from);
            const rT = p.roles.find(r => r.id === t.to);
            return (rF?.levelId === '@dosos' || rT?.levelId === '@dosos');
        }).length;
        return Math.round((audits / total) * 100);
    }

    // 🧠 INTELIGENCIA: Generador de Contexto para IA (Arregla Test INTEL)
    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "";
        let prompt = `PROYECTO: ${p.nombre}\nMISIÓN: ${p.description || 'Estandar'}\n\n[ONTOLOGÍA DE ROLES]\n`;
        p.roles.forEach(r => prompt += `- ${r.name} (${r.levelId})\n`);
        
        prompt += `\n[FLUJOS Y SECUENCIACIÓN]\n`;
        const sortedTxs = [...p.transactions].sort((a,b) => (a.fase || 99) - (b.fase || 99));
        sortedTxs.forEach(t => {
            prompt += `- Fase ${t.fase || 'N'}: ${t.entregable} (${t.tipo})\n`;
        });
        return prompt;
    }

    // 🏗️ FACTORY: Predictibilidad de IDs (Arregla Test ONTOLOGY)
    _createProjectInstance(id, nombre, sector, ownerId = 'ecosystem-admin') {
        const sKey = sector || 'marketing';
        const sectorData = this.ontologyStatic.sectores[sKey] || this.ontologyStatic.sectores['marketing'];
        
        const initialRoles = Object.keys(this.ontologyStatic.niveles).map((levelId) => {
            const def = this.ontologyStatic.niveles[levelId];
            return {
                id: `role-${id}-${levelId}`, // ID Determinista
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
            description: "", roles: initialRoles, transactions: [], usuarios: [], ledger: [], asignaciones: []
        };
    }

    dispatch(action) {
        const { type, payload } = action;
        let p = (payload && payload.projectId) ? this.state.projects.find(x => x.id === payload.projectId) : null;

        switch(type) {
            case 'ADD_PROJECT':
                this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
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

            case 'UPDATE_PROJECT_INFO':
                if (p) {
                    p.nombre = payload.nombre || p.nombre;
                    p.description = payload.description !== undefined ? payload.description : p.description;
                }
                break;

            case 'CREATE_ROLE':
                if (p) {
                    const def = this.ontologyStatic.niveles[payload.levelId];
                    p.roles.push({
                        id: `role-${Date.now()}`, name: payload.name, levelId: payload.levelId,
                        systemPrompt: this.orbitPrompts[payload.levelId],
                        price: def.precio, multiplier: def.multiplier, isArchived: false
                    });
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
                    const role = p.roles.find(r => r.id === payload.tx.from);
                    const lastTx = p.transactions[p.transactions.length - 1];
                    const valor = (payload.tx.horas || 1) * (role?.multiplier || 1) * (role?.price || 0);
                    
                    p.transactions.push({ 
                        ...payload.tx, 
                        valorCongelado: valor, 
                        fase: p.transactions.length + 1,
                        prevHash: lastTx ? lastTx.hash : "0", // Cadena de seguridad
                        hash: generateHash("tx" + Math.random()), 
                        timestamp: Date.now() 
                    });
                }
                break;

            case 'UPDATE_TRANSACTION_PHASE':
                if (p) {
                    const tx = p.transactions.find(t => t.hash === payload.txHash);
                    if (tx) tx.fase = payload.fase;
                }
                break;

            case 'IMPORT_BATCH_LEDGER':
                if (!payload.entries) return;
                payload.entries.forEach(entry => {
                    let proj = this.state.projects.find(x => x.id === entry.projectId);
                    if (!proj) {
                        proj = this._createProjectInstance(entry.projectId, "Imported SOS", "saas", payload.ownerId);
                        this.state.projects.push(proj);
                    }
                    const role = proj.roles.find(r => r.levelId === entry.levelId) || proj.roles[0];
                    proj.ledger.push({
                        id: `ldg-${Math.random().toString(16)}`, timestamp: entry.timestamp || Date.now(),
                        userId: entry.userId, roleId: role.id, description: entry.description,
                        horas: entry.horas, valorCongelado: entry.horas * role.price * role.multiplier
                    });
                });
                break;
        }
        this.save();
    }
}

export const store = new TTStore();
