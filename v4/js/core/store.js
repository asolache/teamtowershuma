// 1. UTILIDADES GLOBALES
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
                gremial: { 
                    "@anxaneta": { name: "Ingeniero", prompt: "Eres el Ingeniero..." },
                    "@aixecador": { name: "Oficial", prompt: "Eres el Jefe de Obra/Taller..." },
                    "@dosos": { name: "Calidad", prompt: "Eres el Inspector de Calidad..." },
                    "@baixos": { name: "Especialista", prompt: "Eres el Operario Especialista..." },
                    "@pinya": { name: "Logística", prompt: "Eres el Encargado de Logística..." }
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
                },
                salud: { 
                    "@anxaneta": { name: "Director Médico", prompt: "Eres el Director Médico..." },
                    "@aixecador": { name: "Jefe de Planta", prompt: "Eres el Jefe de Planta..." },
                    "@dosos": { name: "Supervisor", prompt: "Eres el Supervisor..." },
                    "@baixos": { name: "Especialista", prompt: "Eres el Médico Especialista..." },
                    "@pinya": { name: "Enfermería/Celador", prompt: "Eres el Personal de Base..." }
                },
                hosteleria: { 
                    "@anxaneta": { name: "Gerente/Chef", prompt: "Eres el Chef Ejecutivo/Gerente..." },
                    "@aixecador": { name: "Maître", prompt: "Eres el Maître..." },
                    "@dosos": { name: "Jefe de Rango", prompt: "Eres el Jefe de Rango..." },
                    "@baixos": { name: "Cocinero/Camarero", prompt: "Eres el Operativo..." },
                    "@pinya": { name: "Ayudante", prompt: "Eres el Office/Ayudante..." }
                },
                educacion: { 
                    "@anxaneta": { name: "Rector/Director", prompt: "Eres el Director..." },
                    "@aixecador": { name: "Jefe Estudios", prompt: "Eres el Jefe de Estudios..." },
                    "@dosos": { name: "Coordinador", prompt: "Eres el Coordinador..." },
                    "@baixos": { name: "Profesor", prompt: "Eres el Profesor..." },
                    "@pinya": { name: "Administración", prompt: "Eres Conserjería/Admin..." }
                },
                construccion: { 
                    "@anxaneta": { name: "Arquitecto", prompt: "Eres el Arquitecto..." },
                    "@aixecador": { name: "Jefe de Obra", prompt: "Eres el Jefe de Obra..." },
                    "@dosos": { name: "Aparejador (QA)", prompt: "Eres el Aparejador..." },
                    "@baixos": { name: "Oficial", prompt: "Eres el Oficial..." },
                    "@pinya": { name: "Peón", prompt: "Eres el Peón..." }
                },
                audiovisual: { 
                    "@anxaneta": { name: "Productor Ej.", prompt: "Eres el Productor Ejecutivo..." },
                    "@aixecador": { name: "Director", prompt: "Eres el Director..." },
                    "@dosos": { name: "Script/Continuidad", prompt: "Eres Script/QA..." },
                    "@baixos": { name: "Cámara/Sonido", prompt: "Eres Operador Técnico..." },
                    "@pinya": { name: "Eléctrico/Auxiliar", prompt: "Eres Eléctrico/Runner..." }
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

        // 🚀 NUEVO: El estado ahora incluye el nodo 'config'
        this.state = { projects: [], ontology: this.ontologyStatic, config: {} };
        this.init();
    }

    init() {
        const saved = localStorage.getItem('teamtowers-v4.4-state');
        if (saved) {
            try { 
                const data = JSON.parse(saved);
                this.state.projects = data.projects || []; 
                // 🚀 NUEVO: Recuperamos la config si existe, o ponemos valores por defecto
                this.state.config = data.config || { theme: 'dark', ecosystemName: 'TeamTowers Global', globalPrompt: '' };
            } catch (e) { 
                this.state.projects = [];
                this.state.config = { theme: 'dark', ecosystemName: 'TeamTowers Global', globalPrompt: '' };
            }
        } else {
            this.state.config = { theme: 'dark', ecosystemName: 'TeamTowers Global', globalPrompt: '' };
        }
        
        // 🚀 Aplicamos el tema visual al arrancar
        document.documentElement.setAttribute('data-theme', this.state.config.theme);
    }

    save() {
        // 🚀 NUEVO: Guardamos proyectos y config
        localStorage.setItem('teamtowers-v4.4-state', JSON.stringify({ 
            projects: this.state.projects,
            config: this.state.config
        }));
        window.dispatchEvent(new CustomEvent('store-ready')); 
    }

    getState() { return this.state; }

    calculateResilience(projectId, specificTxs = null) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return 100;
        const txsToEval = specificTxs || p.transactions || [];
        if (txsToEval.length === 0) return 100;
        
        const total = txsToEval.length;
        const audits = txsToEval.filter(t => {
            const rF = p.roles.find(r => r.id === t.from);
            const rT = p.roles.find(r => r.id === t.to);
            return (rF?.levelId === '@dosos' || rT?.levelId === '@dosos');
        }).length;
        return Math.round((audits / total) * 100);
    }

    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "";
        let prompt = `PROYECTO: ${p.nombre}\nSECTOR: ${p.sector}\nMISIÓN: ${p.description || 'Estándar'}\n\n[ONTOLOGÍA]\n`;
        (p.roles || []).forEach(r => prompt += `- ${r.name} (${r.levelId})\n`);
        
        prompt += `\n[FLUJOS SECUENCIADOS]\n`;
        const sortedTxs = [...(p.transactions || [])].sort((a,b) => (a.fase || 99) - (b.fase || 99));
        sortedTxs.forEach(t => {
            prompt += `- Fase ${t.fase || 'N'}: ${t.entregable}\n`;
        });
        
        return prompt;
    }
// 🚀 NUEVO: IMPORTADOR DE SESIONES IA (JSON)
    importSessionJSON(projectId, jsonPayload) {
        if (!jsonPayload || !Array.isArray(jsonPayload)) {
            console.error("El payload debe ser un array JSON válido.");
            return;
        }

        jsonPayload.forEach(entry => {
            // Validamos que la entrada tenga lo mínimo necesario
            if (entry.userId && entry.roleId && entry.description && entry.horas) {
                this.dispatch({
                    type: 'ADD_LEDGER_ENTRY',
                    payload: {
                        projectId: projectId,
                        userId: entry.userId,
                        roleId: entry.roleId,
                        receiverId: entry.receiverId || '', 
                        description: `[IA Audit] ${entry.description}`,
                        horas: parseFloat(entry.horas)
                    }
                });
            }
        });
    }
    _createProjectInstance(id, nombre, sector, ownerId = 'ecosystem-admin') {
        const sKey = sector || 'web3';
        const sectorData = this.ontologyStatic.sectores[sKey] || this.ontologyStatic.sectores['marketing'];
        const initialRoles = Object.keys(this.ontologyStatic.niveles).map((levelId) => {
            const def = this.ontologyStatic.niveles[levelId];
            return {
                id: `role-${id}-${levelId.replace('@','')}`, 
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
            isVerified: false,
            description: "",
            roles: initialRoles, transactions: [], usuarios: [], ledger: [], asignaciones: []
        };
    }

    dispatch(action) {
        const { type, payload } = action;
        let p = (payload && payload.projectId) ? this.state.projects.find(x => x.id === payload.projectId) : null;

        switch(type) {
            // 🚀 NUEVO CASO: CONFIGURACIÓN GLOBAL
            case 'UPDATE_GLOBAL_CONFIG':
                this.state.config = { ...this.state.config, ...payload };
                // Cambia el tema visual en caliente
                if (payload.theme) {
                    document.documentElement.setAttribute('data-theme', payload.theme);
                }
                break;

            case 'ADD_PROJECT':
                this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
                this.state.projects.push(this._createProjectInstance(payload.id, payload.nombre, payload.sector, payload.ownerId));
                break;

            case 'VERIFY_PROJECT':
                if (p) p.isVerified = true;
                break;

            case 'ADD_USER':
                if (p) {
                    p.usuarios = p.usuarios || [];
                    const cleanNameId = payload.name.trim().toLowerCase().replace(/\s+/g, '-');
                    const safeId = `usr-${cleanNameId}-${Math.random().toString(36).substr(2, 5)}`;
                    p.usuarios.push({ id: safeId, name: payload.name.trim() });
                }
                break;

            case 'ASSIGN_USER_ROLE':
                if (p) {
                    p.asignaciones = p.asignaciones || [];
                    p.asignaciones = p.asignaciones.filter(a => !(a.userId === payload.userId && a.roleId === payload.roleId));
                    p.asignaciones.push({
                        id: `asg-${Date.now()}`, userId: payload.userId, roleId: payload.roleId
                    });
                }
                break;

            case 'ADD_LEDGER_ENTRY':
                if (p) {
                    p.ledger = p.ledger || [];
                    const role = p.roles.find(r => r.id === payload.roleId);
                    const safeHours = parseFloat(payload.horas) || 0;
                    const rawValue = safeHours * (role?.multiplier || 1) * (role?.price || 0);

                    p.ledger.push({
                        id: `ldg-direct-${Date.now()}`, timestamp: Date.now(),
                        userId: payload.userId, roleId: payload.roleId, receiverId: payload.receiverId,
                        description: payload.description, horas: safeHours,
                        valorCongelado: rawValue, txHashRef: 'direct-entry' 
                    });
                }
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
                    const estimatedHours = parseFloat(payload.tx.horas) || 1;
                    const valor = estimatedHours * (role?.multiplier || 1) * (role?.price || 0);
                    
                    p.transactions.push({ 
                        ...payload.tx, estimatedHours: estimatedHours, realHours: 0, status: 'theoretical',
                        valorCongelado: valor, fase: p.transactions.length + 1,
                        prevHash: lastTx ? lastTx.hash : "0", hash: generateHash("tx" + Math.random()), timestamp: Date.now() 
                    });
                }
                break;

            case 'PING_TRANSACTION':
                if (p) {
                    const tx = p.transactions.find(t => t.hash === payload.txHash);
                    if (tx) { tx.status = 'pinged'; tx.assigneeId = payload.userId; }
                }
                break;

            case 'REPORT_TRANSACTION':
                if (p) {
                    const tx = p.transactions.find(t => t.hash === payload.txHash);
                    if (tx) {
                        tx.status = 'reported'; tx.realHours = payload.realHours;
                        tx.proofLink = payload.proofLink; tx.reportComment = payload.comentario;
                    }
                }
                break;

            case 'APPROVE_TRANSACTION':
                if (p) {
                    const tx = p.transactions.find(t => t.hash === payload.txHash);
                    if (tx && tx.status === 'reported') {
                        tx.status = 'consolidated';
                        const role = p.roles.find(r => r.id === tx.from);
                        tx.valorCongelado = tx.realHours * (role?.multiplier || 1) * (role?.price || 0);
                        p.ledger = p.ledger || [];
                        p.ledger.push({
                            id: `ldg-${Date.now()}`, timestamp: Date.now(),
                            userId: tx.assigneeId, roleId: role.id, receiverId: tx.to,
                            description: `[APROBADO] ${tx.entregable}`, horas: tx.realHours,
                            valorCongelado: tx.valorCongelado, txHashRef: tx.hash
                        });
                    }
                }
                break;

            case 'UPDATE_TRANSACTION_PHASE':
                if (p) {
                    const tx = p.transactions.find(t => t.hash === payload.txHash);
                    if (tx) tx.fase = payload.fase;
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
