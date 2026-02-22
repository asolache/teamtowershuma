// value-mapping.js - Versión inicial con visualización de flujos
window.renderValueMapping = function() {
    console.log('🗺️ Renderizando value map inicial');
    
    const state = window.store?.getState?.() || { projects: [], transactions: [], roles: [] };
    const transactions = state.transactions || [];
    
    // Calcular flujos entre roles
    const flows = {};
    transactions.forEach(t => {
        const key = `${t.role || '?'} → ${t.project || '?'}`;
        flows[key] = (flows[key] || 0) + (t.uv || 0);
    });

    // Top 5 flujos
    const topFlows = Object.entries(flows)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return `
        <div class="card">
            <h2>🗺️ Value Map - Vista Inicial</h2>
            
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value" style="color: #2563eb">${transactions.length}</div>
                    <div class="metric-label">Total Flujos</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #8b5cf6">${transactions.reduce((s, t) => s + (t.uv || 0), 0)}</div>
                    <div class="metric-label">UV Totales</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #10b981">${new Set(transactions.map(t => t.role)).size}</div>
                    <div class="metric-label">Roles</div>
                </div>
            </div>

            <!-- Visualización simple de flujos -->
            <div style="background: #f8fafc; border-radius: 24px; padding: 30px; margin: 20px 0;">
                <h3 style="margin-bottom: 20px;">🔀 Principales Flujos de Valor</h3>
                <div style="display: grid; gap: 15px;">
                    ${topFlows.map(([flow, uv]) => `
                        <div style="background: white; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 500;">${flow}</span>
                            <span style="color: #2563eb; font-weight: bold;">${uv} UV</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Mapa de nodos simplificado -->
            <div style="position: relative; height: 300px; background: #f1f5f9; border-radius: 16px; margin-top: 30px; padding: 20px;">
                <h4 style="margin-bottom: 15px;">🌐 Red de Valor (simplificada)</h4>
                <div style="display: flex; justify-content: space-around; align-items: center; height: 200px;">
                    <div style="text-align: center;">
                        <div style="width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">M</div>
                        <div style="margin-top: 8px;">@master</div>
                    </div>
                    <div style="font-size: 24px; color: #94a3b8;">→</div>
                    <div style="text-align: center;">
                        <div style="width: 60px; height: 60px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">A</div>
                        <div style="margin-top: 8px;">@arquitecto</div>
                    </div>
                    <div style="font-size: 24px; color: #94a3b8;">→</div>
                    <div style="text-align: center;">
                        <div style="width: 60px; height: 60px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">Q</div>
                        <div style="margin-top: 8px;">@Mr-Q</div>
                    </div>
                </div>
                <p style="text-align: center; color: #64748b; margin-top: 20px; font-size: 12px;">
                    Visualización completa próximamente con D3.js
                </p>
            </div>
        </div>
    `;
};

window.setupValueMappingEvents = function() {
    console.log('🗺️ Value Map eventos listos');
};
