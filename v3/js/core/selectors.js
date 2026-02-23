// /v3/js/core/selectors.js

/**
 * SELECTORS: Lógica de negocio y filtrado de datos del estado global.
 * Implementa el motor de cálculo de Value Network Analysis (VNA).
 */
export const Selectors = {

    /**
     * Calcula las métricas globales para el Dashboard
     */
    getGlobalMetrics: (state) => {
        const projects = state.projects || state.proyectos || [];
        if (!state) return { totalProjects: 0, totalUV: 0, totalUsers: 0 };
        
        const totalUV = projects.reduce((acc, p) => {
            const projectUV = (p.transactions || []).reduce((sum, t) => sum + (t.uv || 0), 0);
            return acc + projectUV;
        }, 0);

        return {
            totalProjects: projects.length,
            totalUV: totalUV,
            totalUsers: state.users?.length || 0
        };
    },

    /**
     * P-023: Índice de Resiliencia VNA
     * Calcula la salud de un proyecto basada en el equilibrio entre valor Tangible e Intangible.
     */
    getProjectResilienceIndex: (state, projectId) => {
        const projects = state.projects || state.proyectos || [];
        const project = projects.find(p => p.id === projectId);
        
        if (!project || !project.transactions || project.transactions.length === 0) {
            return { ratio: 0, status: 'desconocido', intangibles: 0, tangibles: 0 };
        }

        let totalTangible = 0;
        let totalIntangible = 0;

        project.transactions.forEach(t => {
            if (t.tipo_valor === 'intangible') {
                totalIntangible += (t.uv || 0);
            } else {
                totalTangible += (t.uv || 0);
            }
        });

        const totalTotal = totalTangible + totalIntangible;
        const ratio = totalTotal > 0 ? (totalIntangible / totalTotal) : 0;

        // Lógica de Resiliencia
        let status = 'fragil';
        if (ratio >= 0.4 && ratio <= 0.6) {
            status = 'saludable';
        } else if (ratio > 0.6) {
            status = 'robusto';
        }

        return {
            ratio: parseFloat(ratio.toFixed(2)),
            status: status,
            intangiblesCount: project.transactions.filter(t => t.tipo_valor === 'intangible').length,
            totalUV: totalTotal
        };
    }
};

if (typeof window !== 'undefined') {
    window.Selectors = Selectors;
}
