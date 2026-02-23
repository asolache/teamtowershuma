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
        this.ontologyStatic = {
            sectores: { 
                marketing: { "@anxaneta": "Strategy Director", "@aixecador": "Creative Director", "@dosos": "Content Curator", "@baixos": "Graphic Designer", "@pinya": "Ads Manager" },
                Web3: { "@anxaneta": "Lead Architect", "@aixecador": "Smart Contract Dev", "@dosos": "Security Auditor", "@baixos": "DApp Developer", "@pinya": "Validator" },
                gremial: { "@anxaneta": "Ingeniero Jefe", "@aixecador": "Oficial de 1ª", "@dosos": "Verificador de Calidad", "@baixos": "Especialista", "@pinya": "Logística Base" }
            },
            roles: [
                { id: "@anxaneta", multiplier: 3.0, precio_base_h: 90 },
                { id: "@aixecador", multiplier: 2.5, precio_base_h: 75 },
                { id: "@dosos", multiplier: 2.0, precio_base_h: 60 },
                { id: "@baixos", multiplier: 1.5, precio_base_h: 45 },
                { id: "@pinya", multiplier: 1.0, precio_base_h: 30 }
            ]
        };

        this.state = {
            projects: [],
            ontology: this.ontologyStatic,
            roles: this.ontologyStatic.roles
        };
        this.listeners = [];
        this.init();
    }

    init() {
        const saved = localStorage.getItem('teamtowers-v4-state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.state.projects = parsed.projects || [];
            } catch (e) { console.error("SOS: Error storage", e); }
        }
        this.state.ontology = this.ontologyStatic;
        this.state.roles = this.ontologyStatic.roles;
        setTimeout(() => window.dispatchEvent(new Event('store-ready')), 10);
    }

    // --- CÁLCULOS DE SALUD Y ALERTAS ---
    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || p.transactions.length === 0) return 100;
        const totalValue = p.transactions.reduce((acc, t) => acc + (t.liquidación || 0), 0);
        
        const auditValue = p.transactions
            .filter(t => t.rolId === '@dosos' || t.levelId === '@dosos')
            .reduce((acc, t) => acc + (t.liquidación || 0), 0);
            
        return totalValue > 0 ? Math.round((auditValue / totalValue) * 100) : 100;
    }

    getAlerts(projectId) {
        const alerts = [];
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return [];
        
        const hasAudit = p.transactions.some(t => t.rolId === '@dosos' || t.levelId === '@dosos');
        if (p.transactions.length > 0 && !hasAudit) {
            alerts.push({ code: 'RIESGO_DEUDA_TECNICA', level: 'CRITICAL' });
        }
        
        p.transactions.forEach(t => {
            let r = this.state.roles.find(rol => rol.id === t.rolId);
            if (!r && p.dynamicRoles) r = p.dynamicRoles.find(dr => dr.id === t.rolId);
            if (!r) return;
            
            const precioHoraReal = t.liquidación / ((t.horas || 1) * r.multiplier);
            if (precioHoraReal > r.precio_base_h * 1.5) {
                alerts.push({ code: 'DESVIACION_PRECIO', msg: `Sobre-liquidación en ${t.rolId}` });
            }
        });
        
        return alerts;
    }

    // --- INTEGRIDAD DEL LEDGER ---
    verifyLedgerIntegrity(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || p.transactions.length === 0) return true;
        
        for (let i = 1; i < p.transactions.length; i++) {
            if (p.transactions[i].prevHash !== p.transactions[i-1].hash) return false;
        }
        return true;
    }

    // --- COMPILADOR DE SYSTEM PROMPT (BLINDADO Y CON SECUENCIAS POR DEFECTO) ---
    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "Proyecto no encontrado.";

        // 🛡️ BLINDAJE: Si el proyecto es antiguo y no tiene sector, asume 'general'
        const sectorName = p.sector || 'general';

        let prompt = `Estás actuando como un Agente de Inteligencia en el ecosistema SOS.\n`;
        prompt += `Sector de Operación: ${sectorName.toUpperCase()}\n`;
        prompt += `Propósito del Ecosistema: ${p.description || 'No definido.'}\n\n`;
        
        prompt += `[SECUENCIA DE FLUJO DE VALOR]\n`;
        
        // 🛡️ DICCIONARIO POR DEFECTO
        const defaultSeq = { "@anxaneta": 1, "@aixecador": 2, "@dosos": 3, "@baixos": 4, "@pinya": 5 };

        const allRoles = [];
        Object.keys(p.customRoles || {}).forEach(id => allRoles.push({ id, name: p.customRoles[id], seq: p.sequences?.[id] || defaultSeq[id] || 99 }));
        (p.dynamicRoles || []).filter(dr => !dr.isArchived).forEach(dr => allRoles.push({ id: dr.id, name: dr.name, seq: p.sequences?.[dr.id] || 99 }));
        
        allRoles.sort((a, b) => a.seq - b.seq);
        
        allRoles.forEach(r => {
            if (r.seq !== 99) prompt += `- Fase ${r.seq}: ${r.name} (${r.id})\n`;
            else prompt += `- Soporte/Adhoc: ${r.name} (${r.id})\n`;
        });

        prompt += `\nTu misión es analizar el Ledger actual y proponer soluciones para optimizar el flujo de valor.`;
        return prompt;
    }

    dispatch(action) {
        const { type, payload } = action;
        const project = this.state.projects.find(x => x.id === payload.projectId);

        switch (type) {
            case 'ADD_PROJECT':
                this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
                const sectorKey = Object.keys(this.state.ontology.sectores).find(k => k.toLowerCase() === (payload.sector || '').toLowerCase()) || 'marketing';
                this.state.projects.push({
                    id: payload.id, nombre: payload.nombre, sector: sectorKey, description: payload.description || "", 
                    customRoles: { ...this.state.ontology.sectores[sectorKey] }, 
                    dynamicRoles: [], transactions: [], 
                    // 🛡️ ASIGNACIÓN AUTOMÁTICA DE SECUENCIAS EN NUEVOS PROYECTOS
                    sequences: { "@anxaneta": 1, "@
