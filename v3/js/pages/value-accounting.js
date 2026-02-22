// value-accounting.js - DEFINICIÓN GLOBAL
window.renderValueAccounting = function() {
    console.log('💰 Renderizando value accounting...');
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    
    const projectUV = {};
    state.transactions.forEach(t => {
        if (t.project) {
            projectUV[t.project] = (projectUV[t.project] || 0) + (t.uv || 0);
        }
    });
    
    return `
        <div class="card">
            <h2>💰 Value Accounting</h2>
            <div style="display: grid; gap: 15px; margin-top: 20px;">
                ${Object.entries(projectUV).map(([project, uv]) => `
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-weight: bold; font-size: 1.1em;">${project}</div>
                        <div style="font-size: 24px; color: #2563eb; font-weight: bold;">${uv} UV</div>
                    </div>
                `).join('')}
                ${Object.keys(projectUV).length === 0 ? `
                    <div style="text-align: center; color: #64748b; padding: 40px; background: #f8fafc; border-radius: 16px;">
                        No hay transacciones para mostrar
                    </div>
                ` : ''}
            </div>
        </div>
    `;
};

window.setupValueAccountingEvents = function() {
    console.log('💰 Value Accounting eventos listos');
};

console.log('✅ Value Accounting cargado globalmente');
