// value-accounting.js
window.renderValueAccounting = function() {
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    const projectUV = {};
    
    state.transactions.forEach(t => {
        if (t.project) {
            projectUV[t.project] = (projectUV[t.project] || 0) + t.uv;
        }
    });

    return `
        <div class="card">
            <h2>💰 Value Accounting</h2>
            ${Object.entries(projectUV).map(([project, uv]) => `
                <div style="background: #f8fafc; padding: 15px; margin: 10px 0; border-radius: 8px; display: flex; justify-content: space-between;">
                    <span><strong>${project}</strong></span>
                    <span style="color: #2563eb;">${uv} UV</span>
                </div>
            `).join('')}
        </div>
    `;
};
