// /v3/js/core/selectors.js
// Cálculos Derivados (FEVS) & ValueEngine v3.5

const Selectors = {
    /**
     * Métricas Globales (Dashboard)
     */
    getGlobalMetrics: function() {
        const state = window.store?.getState?.() || { projects: [], transactions: [], users: [], roles: [] };
        return {
            totalUV: state.transactions.reduce((acc, tx) => acc + (tx.uv_real || tx.uv_estimado || 0), 0),
            totalTransactions: state.transactions.length,
            totalProjects: state.projects.length,
            totalUsers: state.users.length,
            totalRoles: state.roles.length
        };
    },

    /**
     * VNA: Índice de Resiliencia del Proyecto
     * Calcula la proporción de entregables Intangibles vs Tangibles.
     * Ratio óptimo teórico: 0.3 a 0.5 (Dependiendo del sector)
     */
    getProjectResilienceIndex: function(projectId) {
        const state = window.store?.getState?.();
        if (!state) return { ratio: 0, status: 'desconocido' };

        const project = state.projects.find(p => p.id === projectId);
        if (!project || !project.transacciones || project.transacciones.length === 0) {
            return { ratio: 0, status: 'sin_datos' };
        }

        const validTx = project.transacciones.filter(tx => tx.estado === 'completado' || tx.estado === 'validado');
        const tangibles = validTx.filter(tx => tx.tipo_valor === 'tangible').length;
        const intangibles = validTx.filter(tx => tx.tipo_valor === 'intangible').length;

        if (tangibles === 0) return { ratio: intangibles > 0 ? 1 : 0, status: 'red_teorica' };

        const ratio = (intangibles / tangibles).toFixed(2);
        
        let status = 'equilibrada';
        if (ratio < 0.2) status = 'frágil_mecanicista';
        if (ratio > 0.8) status = 'sobrecargada_informal';

        return { ratio: parseFloat(ratio), tangibles, intangibles, status };
    },

    /**
     * ValueEngine: Cálculo del Valor Final (Equilibri)
     * Aplica el multiplicador del rol emisor a la UV base del entregable.
     */
    calculateFinalUV: function(projectId, baseUV, emisorRoleId) {
        const state = window.store?.getState?.();
        if (!state) return baseUV;

        const project = state.projects.find(p => p.id === projectId);
        if (!project) return baseUV;

        const role = project.roles.find(r => r.id === emisorRoleId);
        const multiplier = role ? (role.multiplier || 1.0) : 1.0;

        return Math.round(baseUV * multiplier);
    },

    /**
     * IA Agent Hook: Exporta el proyecto en texto crudo para el LLM.
     */
    exportForVNA_Agent: function(projectId) {
        const state = window.store?.getState?.();
        if (!state) return null;

        const project = state.projects.find(p => p.id === projectId);
        if (!project) return "Proyecto no encontrado.";

        const resiliencia = this.getProjectResilienceIndex(projectId);

        let contextPrompt = `Contexto del Mapa de Valor:\n`;
        contextPrompt += `Proyecto: ${project.nombre} | Sector: ${project.sector || 'N/A'}\n`;
        contextPrompt += `Índice de Resiliencia: ${resiliencia.ratio} (${resiliencia.status})\n\n`;
        
        contextPrompt += `Flujos Activos:\n`;
        (project.transacciones || []).forEach(tx => {
            contextPrompt += `- [${tx.tipo_valor.toUpperCase()}] ${tx.rol_emisor} -> ${tx.rol_receptor}: "${tx.nombre}" (Canal: ${tx.tags?.join(',') || 'N/A'})\n`;
        });

        return contextPrompt;
    }
};

// 1. Exportación ES6 (Arregla el test de run-tests.html)
export { Selectors };

// 2. Fallback Global (Para no romper componentes legacy)
window.Selectors = Selectors;

console.log('✅ selectors.js cargado (ValueEngine & VNA Ready)');
