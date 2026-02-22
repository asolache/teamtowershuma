// value-mapping.js - MAPA DE VALOR CON TODOS LOS DATOS
// TeamTowers Humà v3.4

window.renderValueMapping = function(projectId = '#kernel') {
    console.log('🗺️ Renderizando value map completo');
    
    const state = window.store?.getState?.() || { projects: [], transactions: [], roles: [] };
    const projects = state.projects || [];
    const allRoles = state.roles || [];
    
    // Filtrar transacciones del proyecto
    let transactions = state.transactions.filter(t => t && t.project === projectId);
    
    // Si no hay transacciones, crear datos de ejemplo para TODOS los roles
    if (transactions.length === 0) {
        console.log('📊 Creando datos de ejemplo para', projectId);
        transactions = [];
        allRoles.forEach((role, index) => {
            // Cada rol tiene entre 1 y 4 transacciones
            const numTx = Math.floor(Math.random() * 4) + 1;
            for (let i = 0; i < numTx; i++) {
                transactions.push({
                    role: role.id,
                    type: i % 2 === 0 ? '#tangible' : '#intangible',
                    uv: Math.floor(Math.random() * 300) + 100,
                    project: projectId
                });
            }
        });
    }

    // Procesar roles con sus UVs
    const roleMap = new Map();
    transactions.forEach(t => {
        if (!t || !t.role) return;
        
        if (!roleMap.has(t.role)) {
            roleMap.set(t.role, {
                id: t.role,
                tangible: 0,
                intangible: 0,
                count: 0,
                uv: 0,
                color: getRoleColor(t.role)
            });
        }
        
        const role = roleMap.get(t.role);
        const uv = t.uv || 100;
        role.uv += uv;
        role.count++;
        
        if (t.type === '#intangible' || t.type === 'intangible') {
            role.intangible += uv;
        } else {
            role.tangible += uv;
        }
    });

    const roles = Array.from(roleMap.values());
    const totalUV = roles.reduce((s, r) => s + r.uv, 0);
    const totalTangible = roles.reduce((s, r) => s + r.tangible, 0);
    const totalIntangible = roles.reduce((s, r) => s + r.intangible, 0);

    // Generar HTML
    const html = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>🗺️ Value Map - ${projectId}</h2>
                <select id="vm-project-select" style="padding: 8px 16px; border-radius: 30px; border: 1px solid #cbd5e1;">
                    ${projects.map(p => `
                        <option value="${p.id}" ${p.id === projectId ? 'selected' : ''}>${p.name}</option>
                    `).join('')}
                </select>
            </div>

            <!-- MÉTRICAS -->
            <div class="metric-grid">
                <div class="metric-card"><div class="metric-value" style="color: #2563eb">${totalUV}</div><div class="metric-label">UV Totales</div></div>
                <div class="metric-card"><div class="metric-value" style="color: #10b981">${totalTangible}</div><div class="metric-label">Tangibles</div></div>
                <div class="metric-card"><div class="metric-value" style="color: #f59e0b">${totalIntangible}</div><div class="metric-label">Intangibles</div></div>
                <div class="metric-card"><div class="metric-value" style="color: #8b5cf6">${roles.length}</div><div class="metric-label">Roles Activos</div></div>
            </div>

            <!-- MAPA DE VALOR - CANVAS -->
            <div style="position: relative; height: 600px; background: #f8fafc; border-radius: 24px; margin: 30px 0; overflow: hidden; border: 2px solid #e2e8f0;">
                <canvas id="value-map-canvas" width="1000" height="600" style="width: 100%; height: 100%; display: block;"></canvas>
                <div id="vm-tooltip" style="position: absolute; background: #1e293b; color: white; padding: 12px 16px; border-radius: 8px; font-size: 12px; display: none; pointer-events: none; z-index: 1000;"></div>
            </div>

            <!-- LEYENDA -->
            <div style="display: flex; gap: 30px; flex-wrap: wrap; margin: 20px 0; padding: 15px; background: #f1f5f9; border-radius: 50px;">
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #2563eb; border-radius: 4px;"></span> Tangible (código, docs)</div>
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #f59e0b; border-radius: 4px;"></span> Intangible (decisiones)</div>
                <div><span style="display: inline-block; width: 20px; height: 2px; background: #94a3b8;"></span> Flujo de valor</div>
                <div><span style="display: inline-block; width: 20px; height: 20px; background: #f59e0b; border-radius: 50%;"></span> Enxaneta</div>
                <div><span style="display: inline-block; width: 20px; height: 20px; background: #8b5cf6; border-radius: 50%;"></span> Acotxador</div>
                <div><span style="display: inline-block; width: 20px; height: 20px; background: #2563eb; border-radius: 50%;"></span> Terç</div>
            </div>

            <!-- TABLA DE ROLES -->
            <h3 style="margin: 30px 0 15px;">📊 Roles en el proyecto (${roles.length})</h3>
            <div style="max-height: 300px; overflow-y: auto;">
                <table class="data-table">
                    <thead>
                        <tr><th>Rol</th><th>UV Total</th><th>Tangible</th><th>Intangible</th><th>Tx</th></tr>
                    </thead>
                    <tbody>
                        ${roles.slice(0, 20).map(r => `
                            <tr><td><strong style="color: ${r.color}">${r.id}</strong></td><td>${r.uv}</td><td>${r.tangible}</td><td>${r.intangible}</td><td>${r.count}</td></tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <p style="text-align: center; color: #64748b; margin-top: 10px;">Mostrando 20 de ${roles.length} roles</p>
        </div>
    `;

    // Programar dibujo del mapa
    setTimeout(() => drawValueMap(projectId), 300);

    return html;
};

// ============================================
// FUNCIÓN DE DIBUJO DEL MAPA
// ============================================
function drawValueMap(projectId) {
    const canvas = document.getElementById('value-map-canvas');
    if (!canvas) {
        console.error('❌ Canvas no encontrado');
        return;
    }
    
    console.log('🎨 Dibujando mapa con TODOS los roles');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Obtener datos
    const state = window.store?.getState?.() || {};
    const allRoles = state.roles || [];
    const transactions = state.transactions?.filter(t => t && t.project === projectId) || [];
    
    // Calcular UV por rol
    const roleUV = {};
    transactions.forEach(t => {
        if (t.role) roleUV[t.role] = (roleUV[t.role] || 0) + (t.uv || 100);
    });
    
    // Si no hay datos, usar todos los roles con valores aleatorios
    const roles = allRoles.map(role => ({
        id: role.id,
        uv: roleUV[role.id] || Math.floor(Math.random() * 400) + 100,
        color: getRoleColor(role.id)
    }));
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Fondo
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    if (roles.length === 0) {
        ctx.font = '20px system-ui';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('No hay roles para mostrar', width/2, height/2);
        return;
    }
    
    // POSICIONAR NODOS EN CÍRCULO
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    roles.forEach((role, i) => {
        const angle = (i / roles.length) * Math.PI * 2;
        role.x = centerX + Math.cos(angle) * radius;
        role.y = centerY + Math.sin(angle) * radius;
        role.size = 30 + (role.uv / 30);
    });
    
    // DIBUJAR CONEXIONES (simuladas)
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    
    roles.forEach((from, i) => {
        roles.forEach((to, j) => {
            if (i < j && Math.random() > 0.7) { // 30% de conexiones
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            }
        });
    });
    
    // DIBUJAR NODOS
    roles.forEach(role => {
        // Sombra
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 2;
        
        // Círculo
        ctx.beginPath();
        ctx.arc(role.x, role.y, role.size/2, 0, Math.PI * 2);
        ctx.fillStyle = role.color;
        ctx.fill();
        
        // Borde blanco
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Reset sombra
        ctx.shadowBlur = 0;
        
        // Etiqueta
        ctx.font = 'bold 9px system-ui';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(role.id.replace('@', '').substring(0, 8), role.x, role.y - 2);
        
        // UV
        ctx.font = '7px system-ui';
        ctx.fillStyle = '#1e293b';
        ctx.fillText(Math.round(role.uv) + ' UV', role.x, role.y + role.size/2 + 10);
    });
    
    // TOOLTIP
    const tooltip = document.getElementById('vm-tooltip');
    if (tooltip) {
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);
            
            let hovered = null;
            roles.forEach(role => {
                const dist = Math.sqrt((x - role.x) ** 2 + (y - role.y) ** 2);
                if (dist < role.size/2) hovered = role;
            });
            
            if (hovered) {
                tooltip.style.display = 'block';
                tooltip.style.left = (e.clientX + 15) + 'px';
                tooltip.style.top = (e.clientY - 30) + 'px';
                tooltip.innerHTML = `
                    <strong>${hovered.id}</strong><br>
                    UV: ${Math.round(hovered.uv)}<br>
                    ${hovered.color === '#2563eb' ? '🔷 Tangible' : hovered.color === '#f59e0b' ? '💭 Intangible' : ''}
                `;
            } else {
                tooltip.style.display = 'none';
            }
        });
    }
    
    console.log('✅ Mapa dibujado con', roles.length, 'roles');
}

function getRoleColor(roleId) {
    const colors = {
        '@enxaneta': '#f59e0b',
        '@acotxador': '#8b5cf6',
        '@terç': '#2563eb',
        '@quart': '#10b981',
        '@pinya': '#64748b',
        '@segon': '#3b82f6',
        '@cap-de-colles': '#8b0000',
        '@arquitecto': '#8b5cf6',
        '@Mr-Q': '#2563eb',
        '@masterproject': '#f59e0b',
        '@tester-guardian': '#10b981',
        '@super-z': '#ec4899',
        '@economista': '#3b82f6',
        '@ia-coder': '#2563eb',
        '@ia-architect': '#8b5cf6'
    };
    return colors[roleId] || '#6b7280';
}

window.setupValueMappingEvents = function() {
    const select = document.getElementById('vm-project-select');
    if (select) {
        select.addEventListener('change', (e) => {
            window.router?.navigate('value-map', e.target.value);
        });
    }
};
