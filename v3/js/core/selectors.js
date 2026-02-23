// v3/js/core/selectors.js

export const Selectors = {
    // ... otros selectores ...

    getProjectResilienceIndex: (state, projectId) => {
        const project = state.projects.find(p => p.id === projectId);
        if (!project || !project.transactions || project.transactions.length === 0) {
            return { ratio: 0, status: 'desconocido', intangibles: 0 };
        }

        const totalUV = project.transactions.reduce((sum, t) => sum + t.uv, 0);
        const intangibleUV = project.transactions
            .filter(t => t.tipo_valor === 'intangible')
            .reduce((sum, t) => sum + t.uv, 0);

        const ratio = totalUV > 0 ? (intangibleUV / totalUV) : 0;

        let status = 'fragil'; // Default
        if (ratio >= 0.4 && ratio <= 0.6) status = 'saludable';
        if (ratio > 0.6) status = 'robusto';

        return {
            ratio: parseFloat(ratio.toFixed(2)),
            status: status,
            intangibles: project.transactions.filter(t => t.tipo_valor === 'intangible').length
        };
    }
};
