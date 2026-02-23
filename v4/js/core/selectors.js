/**
 * SELECTORS v4: Motor de Cálculo SOS
 * Implementa el Value Network Analysis (VNA) y métricas de Resiliencia.
 */
export const Selectors = {

    /**
     * Métricas globales para el Dashboard de Radar
     */
    getGlobalMetrics: (state) => {
        if (!state || !state.projects) return { totalProjects: 0, totalUV: 0, totalUsers: 0 };
        
        const totalUV = state.projects.reduce((acc, p) => {
            const projectUV = (p.transactions || []).reduce((sum, t) => sum + (t.uv || 0), 0);
            return acc + projectUV;
        }, 0);

        return {
            totalProjects: state.projects.length,
            totalUV: totalUV,
            totalUsers: state.users?.length || 0
        };
    },

    /**
     * P-023: Índice de Resiliencia VNA (Salud del Castell)
     * Mide el equilibrio entre flujos tangibles e intangibles.
     */
    getProjectResilienceIndex: (state, projectId) => {
        const project = state.projects?.find(p => p.id === projectId);
        
        if (!project || !project.transactions || project.transactions.length === 0) {
            return { ratio: 0, status: 'fragil', reason: 'Sin transacciones' };
        }

        let totalTangible = 0;
        let totalIntangible = 0;

        project.transactions.forEach(t => {
            const valor = t.uv || 0;
            if (t.tipo_valor === 'intangible') {
                totalIntangible += valor;
            } else {
                totalTangible += valor;
            }
        });

        const totalTotal = totalTangible + totalIntangible;
        // Ratio de Intangibilidad (Capital Social / Capital Total)
        const ratio = totalTotal > 0 ? (totalIntangible / totalTotal) : 0;

        /**
         * LÓGICA DE RESILIENCIA TEAMTOWERS:
         * - < 30%: Frágil (Mucho trabajo, poca cohesión/estrategia)
         * - 30% - 60%: Saludable (Equilibrio operativo y estratégico)
         * - > 60%: Robusto (Alta capitalización de conocimiento)
         */
        let status = 'fragil';
        if (ratio >= 0.3 && ratio <= 0.6) status = 'saludable';
        if (ratio > 0.6) status = 'robusto';

        return {
            ratio: parseFloat(ratio.toFixed(2)),
            status: status,
            tangibles: totalTangible,
            intangibles: totalIntangible,
            totalUV: totalTotal
        };
    }
};

// Exportación para compatibilidad global
if (typeof window !== 'undefined') {
    window.Selectors = Selectors;
}
