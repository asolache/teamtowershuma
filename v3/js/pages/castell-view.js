// castell-view.js - Visualización radial del mapa de valor casteller
// TeamTowers Humà v3.3 - Estilo global

window.renderCastellView = function(projectId = '#kernel') {
    try {
        console.log(`🏰 Renderizando vista casteller para: ${projectId}`);
        
        const state = window.store?.getState?.() || { projects: [], roles: [], transactions: [] };
        const projects = state.projects || [];
        const roles = state.roles || [];
        const transactions = state.transactions || [];
        
        // Filtrar transacciones por proyecto
        const projectTransactions = transactions.filter(t => t.project === projectId);
        
        // Calcular UV por rol
        const roleUV = {};
        const roleCount = {};
        projectTransactions.forEach(t => {
            roleUV[t.role] = (roleUV[t.role] || 0) + (t.uv || 0);
            roleCount[t.role] = (roleCount[t.role] || 0) + 1;
        });
        
        // Organizar roles por nivel
        const niveles = {
            'cim': [],
            'pom-de-dalt': [],
            'tronc-alt': [],
            'tronc-mig': [],
            'tronc-baix': [],
            'manilles': [],
            'folre': [],
            'pinya': [],
            'dirección': [],
            'base': []
        };
        
        roles.forEach(role => {
            const level = role.level || 'base';
            if (niveles[level]) {
                niveles[level].push({
                    ...role,
                    uv: roleUV[role.id] || 0,
                    count: roleCount[role.id] || 0
                });
            } else {
                niveles.base.push({
                    ...role,
                    uv: roleUV[role.id] || 0,
                    count: roleCount[role.id] || 0
                });
            }
        });
        
        // Calcular totales
        const totalUV = Object.values(roleUV).reduce((a, b) => a + b, 0);
        const totalTx = projectTransactions.length;

        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>🏰 Vista Casteller - ${projectId}</h2>
                    <div style="display: flex; gap: 10px;">
                        <select id="castell-project-select" style="padding: 8px 16px; border-radius: 30px; border: 1px solid #cbd5e1;">
                            ${projects.map(p => `
                                <option value="${p.id}" ${p.id === projectId ? 'selected' : ''}>${p.name}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- Métricas -->
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value" style="color: #f59e0b">${totalUV}</div>
                        <div class="metric-label">UV Totales</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: #8b5cf6">${totalTx}</div>
                        <div class="metric-label">Transacciones</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value" style="color: #10b981">${Object.keys(roleUV).length}</div>
                        <div class="metric-label">Roles Activos</div>
                    </div>
                </div>
                
                <!-- Representación del castell (textual por ahora) -->
                <div style="background: #f8fafc; border-radius: 24px; padding: 30px; margin: 20px 0;">
                    <h3 style="text-align: center; margin-bottom: 20px;">🏗️ Estructura del Castell</h3>
                    
                    <!-- Cima -->
                    <div style="text-align: center; margin-bottom: 10px;">
                        <span style="background: #f59e0b; color: white; padding: 8px 16px; border-radius: 30px; font-weight: bold;">
                            👑 Cima (${niveles.cim.reduce((s, r) => s + r.uv, 0)} UV)
                        </span>
                    </div>
                    
                    <!-- Tronc Alt -->
                    <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 20px 0;">
                        ${niveles['tronc-alt'].map(role => `
                            <div style="background: #3498db; color: white; padding: 8px 16px; border-radius: 30px;">
                                ${role.id}: ${role.uv} UV
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Tronc Mig -->
                    <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 20px 0;">
                        ${niveles['tronc-mig'].map(role => `
                            <div style="background: #2563eb; color: white; padding: 8px 16px; border-radius: 30px;">
                                ${role.id}: ${role.uv} UV
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Tronc Baix -->
                    <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 20px 0;">
                        ${niveles['tronc-baix'].map(role => `
                            <div style="background: #10b981; color: white; padding: 8px 16px; border-radius: 30px;">
                                ${role.id}: ${role.uv} UV
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Base -->
                    <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; margin-top: 20px; padding: 20px; background: #64748b20; border-radius: 50px;">
                        ${niveles.base.map(role => `
                            <div style="background: #64748b; color: white; padding: 6px 12px; border-radius: 30px; font-size: 12px;">
                                ${role.id}: ${role.uv} UV
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Tabla de roles -->
                <div style="margin-top: 30px;">
                    <h3>📊 Detalle por Rol</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Rol</th>
                                <th>Nivel</th>
                                <th>UV</th>
                                <th>Transacciones</th>
                                <th>Multiplicador</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(niveles).flatMap(([level, rolesList]) => 
                                rolesList.map(role => `
                                    <tr>
                                        <td><strong style="color: ${role.color}">${role.id}</strong></td>
                                        <td>${level}</td>
                                        <td style="color: #2563eb; font-weight: bold;">${role.uv}</td>
                                        <td>${role.count}</td>
                                        <td>${role.multiplier}x</td>
                                    </tr>
                                `)
                            ).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('❌ Error en renderCastellView:', e);
        return `
            <div class="card">
                <h2>🏰 Vista Casteller</h2>
                <p style="color: #ef4444;">Error al cargar: ${e.message}</p>
                <pre style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 20px;">${e.stack}</pre>
            </div>
        `;
    }
};

window.setupCastellViewEvents = function() {
    console.log('🏰 Configurando eventos de casteller...');
    
    const select = document.getElementById('castell-project-select');
    if (select) {
        select.addEventListener('change', (e) => {
            const projectId = e.target.value;
            window.router?.navigate('castell', projectId);
        });
    }
};

console.log('✅ Castell View cargado globalmente');
