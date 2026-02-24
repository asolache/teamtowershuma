// Manager de Estado - TeamTowers SOS (Basado en Verna Allee & Slicing Pie)
export const state = {
    roles: [],
    flows: [],

    init() {
        const saved = localStorage.getItem('tt-vna-state');
        if (saved) {
            const data = JSON.parse(saved);
            this.roles = data.roles || [];
            this.flows = data.flows || [];
        }
    },

    save() {
        localStorage.setItem('tt-vna-state', JSON.stringify({
            roles: this.roles,
            flows: this.flows
        }));
    },

    getRoles() {
        return this.roles;
    },

    getFlows() {
        return this.flows;
    },

    // +1 Concepto Allee: Los roles como Agentes de Conversión
    addRole(handle, level, icon = '👤') {
        const newRole = {
            id: `role-${Date.now()}`,
            handle, // Ej: @anxaneta, @baixos
            level,  
            icon,
            assets: { tangible: [], intangible: [] }
        };
        this.roles.push(newRole);
        this.save();
        return newRole;
    },

    // +2 Concepto Allee: Distinción técnica entre Tangible e Intangible
    addFlow(fromId, toId, description, type = 'tangible') {
        const newFlow = {
            id: `flow-${Date.now()}`,
            from: fromId,
            to: toId,
            description,
            type, // 'tangible' (contractual) o 'intangible' (conocimiento/confianza)
            timestamp: new Date().toISOString()
        };
        this.flows.push(newFlow);
        this.save();
        return newFlow;
    },

    // +1 Análisis de Intercambio: Ratio de salud de la red
    getNetworkHealth() {
        if (this.flows.length === 0) return { ratio: 0, balance: 'Sin datos' };
        const intangibles = this.flows.filter(f => f.type === 'intangible').length;
        return {
            ratio: (intangibles / this.flows.length * 100).toFixed(1),
            total: this.flows.length,
            balance: intangibles > 0 ? 'Sano' : 'Riesgo de deshumanización'
        };
    }
};

state.init();
