// value-mapping.js
window.renderValueMapping = function(projectId = '#kernel') {
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    const transactions = state.transactions.filter(t => t.project === projectId);
    const roles = {};
    
    transactions.forEach(t => {
        if (!roles[t.role]) roles[t.role] = { uv: 0, tangible: 0, intangible: 0 };
        roles[t.role].uv += t.uv;
        if (t.type === '#intangible') roles[t.role].intangible += t.uv;
        else roles[t.role].tangible += t.uv;
    });

    return `
        <div class="card">
            <div style="display: flex; justify-content: space-between;">
                <h2>🗺️ Value Map - ${projectId}</h2>
                <select id="vm-project" onchange="window.router?.navigate('value-map', this.value)">
                    ${state.projects.map(p => `
                        <option value="${p.id}" ${p.id === projectId ? 'selected' : ''}>${p.name}</option>
                    `).join('')}
                </select>
            </div>
            <div style="display: flex; gap: 20px; flex-wrap: wrap; margin: 20px 0;">
                ${Object.entries(roles).map(([role, data]) => `
                    <div style="text-align: center; min-width: 80px;">
                        <div style="width: 60px; height: 60px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin: 0 auto;">
                            ${role.replace('@', '').substring(0, 3)}
                        </div>
                        <div style="font-size: 12px;">${data.uv} UV</div>
                        <div style="font-size: 10px; color: #64748b;">T:${data.tangible} I:${data.intangible}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};
