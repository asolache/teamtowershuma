window.renderValueAccounting = function() {
    const state = window.store.getState();
    const projectUV = {};
    state.transactions.forEach(t => {
        projectUV[t.project] = (projectUV[t.project] || 0) + t.uv;
    });
    
    return `
        <div class="card">
            <h2>💰 Value Accounting</h2>
            <div style="display: grid; gap: 15px;">
                ${Object.entries(projectUV).map(([project, uv]) => `
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
                        <div style="font-weight: bold;">${project}</div>
                        <div style="font-size: 20px; color: #2563eb;">${uv} UV</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};
