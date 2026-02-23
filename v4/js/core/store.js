/**
 * TEAMTOWERS SOS v4.3 - KERNEL DE INMUTABILIDAD E INTELIGENCIA
 */

// Función de Hashing simple para el Ledger (MVP Triple Entrada)
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
        this.ontologyStatic = { /* ... tu ontología estática actual ... */ 
            sectores: { 
                marketing: { "@anxaneta": "Strategy Director", "@aixecador": "Creative Director", "@dosos": "Content Curator", "@baixos": "Graphic Designer", "@pinya": "Ads Manager" },
                Web3: { "@anxaneta": "Lead Architect", "@aixecador": "Smart Contract Dev", "@dosos": "Security Auditor", "@baixos": "DApp Developer", "@pinya": "Validator" }
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
            try { this.state.projects = JSON.parse(saved).projects || []; } catch (e) {}
        }
        this.state.ontology = this.ontologyStatic;
        this.state.roles = this.ontologyStatic.roles;
        setTimeout(() => window.dispatchEvent(new Event('store-ready')), 10);
    }

    // --- NUEVO: INTEGRIDAD DEL LEDGER ---
    verifyLedgerIntegrity(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || p.transactions.length === 0) return true;
        
        for (let i = 1; i < p.transactions.length; i++) {
            if (p.transactions[i].prevHash !== p.transactions[i-1].hash) return false;
        }
        return true;
    }

    // --- NUEVO: COMPILADOR DE SYSTEM PROMPT ---
    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "Proyecto no encontrado.";

        let prompt = `Estás actuando como un Agente de Inteligencia en el ecosistema SOS.\n`;
        prompt += `Sector de Operación: ${p.sector.toUpperCase()}\n`;
        prompt += `Propósito del Ecosistema: ${p.description || 'No definido.'}\n\n`;
        
        prompt += `[SECUENCIA DE FLUJO DE VALOR]\n`;
        
        // Mapear roles y secuencias
        const allRoles = [];
        Object.keys(p.customRoles).forEach(id => allRoles.push({ id, name: p.customRoles[id], seq: p.sequences?.[id] || 99 }));
        (p.dynamicRoles || []).filter(dr => !dr.isArchived).forEach(dr => allRoles.push({ id: dr.id, name: dr.name, seq: p.sequences?.[dr.id] || 99 }));
        
        allRoles.sort((a, b) => a.seq - b.seq);
        
        allRoles.forEach(r => {
            if (r.seq !== 99) prompt += `- Fase ${r.seq}: ${r.name} (${r.id})\n`;
            else prompt += `- Soporte/Adhoc: ${r.name} (${r.id})\n`;
        });

        prompt += `\nTu misión es analizar el Ledger actual y proponer soluciones para optimizar el flujo de valor.`;
        return prompt;
    }

    // ... (Mantén getAlerts y calculateResilience igual que antes) ...

    dispatch(action) {
        const { type, payload } = action;
        const project = this.state.projects.find(x => x.id === payload.projectId);

        switch (type) {
            case 'ADD_PROJECT':
                this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
                const sectorKey = Object.keys(this.state.ontology.sectores).find(k => k.toLowerCase() === payload.sector.toLowerCase()) || 'marketing';
                this.state.projects.push({
                    id: payload.id, nombre: payload.nombre, sector: sectorKey, description: payload.description || "", 
                    customRoles: { ...this.state.ontology.sectores[sectorKey] }, 
                    dynamicRoles: [], transactions: [], sequences: {} // Nuevo: sequences
                });
                break;

            case 'CREATE_CUSTOM_ROLE':
                if (project) {
                    const master = this.state.roles.find(r => r.id === payload.levelId);
                    project.dynamicRoles.push({
                        id: `custom-${Date.now()}`, levelId: payload.levelId, name: payload.name, area: payload.area,
                        description: payload.description || '', skills: payload.skills || [],
                        multiplier: master.multiplier, precio_base_h: master.precio_base_h,
                        isArchived: false // Nuevo estado por defecto
                    });
                }
                break;

            // --- NUEVO: ARCHIVADO INMUTABLE ---
            case 'ARCHIVE_CUSTOM_ROLE':
                if (project && project.dynamicRoles) {
                    const rol = project.dynamicRoles.find(r => r.id === payload.rolId);
                    if (rol) rol.isArchived = true; // Se oculta en UI, se mantiene en Ledger
                }
                break;

            // --- NUEVO: SECUENCIACIÓN ---
            case 'UPDATE_ROLE_SEQUENCE':
                if (project) {
                    if (!project.sequences) project.sequences = {};
                    project.sequences[payload.rolId] = parseInt(payload.sequence);
                }
                break;

            case 'ADD_TRANSACTION':
                if (!project) return;
                
                let roleData = this.state.roles.find(r => r.id === payload.transaction.rolId);
                if (!roleData && project.dynamicRoles) roleData = project.dynamicRoles.find(dr => dr.id === payload.transaction.rolId);
                if (!roleData) return;

                const horas = payload.transaction.horas || 1;
                const precioBase = payload.transaction.override_price || roleData.precio_base_h;
                const liq = horas * precioBase * roleData.multiplier;

                // Criptografía: Calcular hash encadenado
                const lastTx = project.transactions.length > 0 ? project.transactions[project.transactions.length - 1] : null;
                const prevHash = lastTx ? lastTx.hash : "0000000000000000";
                const dataToHash = `${payload.transaction.rolId}${payload.transaction.toId}${liq}${prevHash}`;
                const newHash = generateHash(dataToHash);

                project.transactions.push({
                    ...payload.transaction,
                    id: Date.now(),
                    liquidación: liq,
                    tipo_flujo: payload.transaction.tipo_flujo || 'tangible',
                    levelId: roleData.levelId || roleData.id,
                    hash: newHash,
                    prevHash: prevHash
                });
                break;

            case 'RESET_DATABASE':
                localStorage.removeItem('teamtowers-v4-state');
                location.reload();
                break;
        }
        this.save();
        this.notify();
    }

    save() { localStorage.setItem('teamtowers-v4-state', JSON.stringify(this.state)); }
    getState() { return JSON.parse(JSON.stringify(this.state)); }
    subscribe(cb) { this.listeners.push(cb); }
    notify() { this.listeners.forEach(cb => cb(this.state)); }
}
export const store = new TTStore();
