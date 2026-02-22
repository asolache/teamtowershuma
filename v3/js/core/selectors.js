// selectors.js
window.Selectors = {
    getGlobalMetrics: function() {
        const state = window.store?.getState?.() || { projects: [], transactions: [], users: [], roles: [] };
        return {
            totalUV: state.transactions.reduce((s, t) => s + (t.uv || 0), 0),
            totalTransactions: state.transactions.length,
            totalProjects: state.projects.length,
            totalUsers: state.users.length,
            totalRoles: state.roles.length
        };
    }
};
