/**
 * TEAMTOWERS SOS v4.3 - KERNEL DE INMUTABILIDAD E INTELIGENCIA
 * Versión corregida para evitar SyntaxError en entornos SES/Lockdown
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

    save() {
        localStorage.setItem('teamtowers-v4-state', JSON.stringify({ projects: this.state.projects }));
        this.notify();
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    getState() { return this.state; }

    // --- CÁLCULOS DE SALUD ---
    calculateResilience(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p || !p.transactions || p.transactions.length === 0) return 100;
        const totalValue = p.transactions.reduce((acc, t) => acc + (Number(t.liquidación) || 0), 0);
        const auditValue = p.transactions
            .filter(t => t.rolId === '@dosos')
            .reduce((acc, t) => acc + (Number(t.liquidación) || 0), 0);
        return totalValue > 0 ? Math.round((auditValue / totalValue) * 100) : 100;
    }

    // --- COMPILADOR DE SYSTEM PROMPT ---
    generateSystemPrompt(projectId) {
        const p = this.state.projects.find(x => x.id === projectId);
        if (!p) return "Proyecto no encontrado.";
        const sectorName = p.sector || 'general';
        let prompt = `Estás actuando como un Agente de Inteligencia en el ecosistema SOS.\n`;
        prompt += `Sector: ${sectorName.toUpperCase()}\n`;
        prompt += `Propósito: ${p.description || 'No definido.'}\n\n`;
        prompt += `[SECUENCIA DE FLUJO DE VALOR]\n`;
        
        const defaultSeq = { "@anxaneta": 1, "@aixecador": 2, "@dosos": 3, "@baixos": 4, "@pinya": 5 };
        const allRoles = [];
        Object.keys(p.customRoles || {}).forEach(id => {
            allRoles.push({ id, name: p.customRoles[id], seq: p.sequences?.[id] || defaultSeq[id] || 99 });
        });

        allRoles.sort((a, b) => a.seq - b.seq).forEach(r => {
            prompt += `- Fase ${r.seq}: ${r.name} (${r.id})\n`;
        });

        return prompt;
    }

    dispatch(action) {
        const { type, payload } = action;
        
        if (type === 'ADD_PROJECT') {
            this.state.projects = this.state.projects.filter(x => x.id !== payload.id);
            const sectorKey = payload.sector || 'marketing';
            this.state.projects.push({
                id: payload.id,
                nombre: payload.nombre,
                sector: sectorKey,
                description: payload.description || "",
                customRoles: { ...this.ontologyStatic.sectores[sectorKey] },
                dynamicRoles: [],
                transactions: [],
                sequences: { "@anxaneta": 1, "@aixecador": 2, "@dosos": 3, "@baixos": 4, "@pinya": 5 }
            });
        }

        if (type === 'ADD_TRANSACTION') {
            const p = this.state.projects.find(x => x.id === payload.projectId);
            if (p) {
                const lastTx = p.transactions[p.transactions.length - 1];
                const newTx = {
                    ...payload.tx,
                    timestamp: Date.now(),
                    prevHash: lastTx ? lastTx.hash : "0",
                    hash: ""
                };
                newTx.hash = generateHash(JSON.stringify(newTx));
                p.transactions.push(newTx);
            }
        }

        this.save();
    }
}

// Instancia única exportada
export const store = new TTStore();
