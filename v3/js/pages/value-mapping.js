// value-mapping.js - Mapa de valor visible con TODOS los roles
// TeamTowers Humà v3.4 - VERSIÓN CON MAPA VISIBLE

window.renderValueMapping = function(projectId = '#kernel') {
    console.log('🗺️ Renderizando value map para proyecto:', projectId);
    
    const state = window.store?.getState?.() || { projects: [], transactions: [] };
    const projects = state.projects || [];
    const allRoles = state.roles || [];
    
    // Filtrar transacciones del proyecto
    let transactions = state.transactions.filter(t => t && t.project === projectId);
    
    // Si no hay transacciones, crear datos de ejemplo para este proyecto
    if (transactions.length === 0) {
        console.log('📊 Creando datos de ejemplo para', projectId);
        transactions = [];
        const rolesParaProyecto = allRoles.slice(0, 15); // Usar primeros 15 roles
        
        rolesParaProyecto.forEach((role, index) => {
            for (let i = 0; i < 3; i++) {
                transactions.push({
                    role: role.id,
                    type: i % 2 === 0 ? '#tangible' : '#intangible',
                    uv: Math.floor(Math.random() * 400) + 100,
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
                uv: 0
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

    return `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap;">
                <h2>🗺️ Value Map - ${projectId}</h2>
                <select id="vm-project-select" style="padding: 8px 16px; border-radius: 30px; border: 1px solid #cbd5e1;">
                    ${projects.map(p => `
                        <option value="${p.id}" ${p.id === projectId ? 'selected' : ''}>${p.name}</option>
                    `).join('')}
                </select>
            </div>

            <!-- Métricas -->
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value" style="color: #2563eb">${totalUV}</div>
                    <div class="metric-label">UV Totales</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #10b981">${totalTangible}</div>
                    <div class="metric-label">Tangibles</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #f59e0b">${totalIntangible}</div>
                    <div class="metric-label">Intangibles</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #8b5cf6">${roles.length}</div>
                    <div class="metric-label">Roles</div>
                </div>
            </div>

            <!-- MAPA DE VALOR - CANVAS -->
            <div style="position: relative; height: 500px; background: #f8fafc; border-radius: 24px; margin: 30px 0; overflow: hidden; border: 2px solid #e2e8f0;">
                <canvas id="value-map-canvas" width="900" height="500" style="width: 100%; height: 100%; display: block;"></canvas>
                <div id="vm-tooltip" style="position: absolute; background: #1e293b; color: white; padding: 12px 16px; border-radius: 8px; font-size: 12px; display: none; pointer-events: none; z-index: 1000;"></div>
            </div>

            <!-- Leyenda -->
            <div style="display: flex; gap: 30px; flex-wrap: wrap; margin: 20px 0; padding: 15px; background: #f1f5f9; border-radius: 50px;">
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #2563eb; border-radius: 4px;"></span> Tangible</div>
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #f59e0b; border-radius: 4px;"></span> Intangible</div>
                <div><span style="display: inline-block; width: 20px; height: 2px; background: #94a3b8;"></span> Flujo</div>
            </div>

            <!-- Tabla de roles -->
            <h3 style="margin: 30px 0 15px;">📊 Roles</h3>
            <table class="data-table">
                <thead>
                    <tr><th>Rol</th><th>UV</th><th>Tangible</th><th>Intangible</th><th>Tx</th></tr>
                </thead>
                <tbody>
                    ${roles.slice(0, 10).map(r => `
                        <tr><td>${r.id}</td><td>${r.uv}</td><td>${r.tangible}</td><td>${r.intangible}</td><td>${r.count}</td></tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

// Eventos
window.setupValueMappingEvents = function() {
    const select = document.getElementById('vm-project-select');
    if (select) {
        select.addEventListener('change', (e) => {
            window.router?.navigate('value-map', e.target.value);
        });
    }
    
    // Dibujar el mapa después de que el DOM esté listo
    setTimeout(() => {
        const canvas = document.getElementById('value-map-canvas');
        if (!canvas) {
            console.error('❌ Canvas no encontrado');
            return;
        }
        
        console.log('🎨 Dibujando mapa de valor...');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Obtener datos actuales
        const state = window.store?.getState?.() || {};
        const projectId = select?.value || '#kernel';
        const transactions = state.transactions?.filter(t => t.project === projectId) || [];
        
        // Extraer roles únicos
        const roles = {};
        transactions.forEach(t => {
            if (t.role) roles[t.role] = (roles[t.role] || 0) + (t.uv || 100);
        });
        
        const roleList = Object.keys(roles);
        if (roleList.length === 0) {
            // Datos de ejemplo para que se vea algo
            const ejemplos = ['@enxaneta', '@acotxador', '@terç', '@quart', '@pinya', '@arquitecto', '@Mr-Q'];
            ejemplos.forEach((r, i) => {
                roles[r] = 300 + i * 50;
            });
        }
        
        const nodes = Object.entries(roles).map(([id, uv]) => ({ id, uv }));
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 150;
        
        // Posicionar nodos en círculo
        nodes.forEach((node, i) => {
            const angle = (i / nodes.length) * Math.PI * 2;
            node.x = centerX + Math.cos(angle) * radius;
            node.y = centerY + Math.sin(angle) * radius;
        });
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Dibujar conexiones
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]);
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (Math.random() > 0.7) { // 30% de conexiones
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }
        
        ctx.setLineDash([]);
        
        // Dibujar nodos
        nodes.forEach(node => {
            const size = 30 + (node.uv / 30);
            
            // Sombra
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 2;
            
            // Círculo
            ctx.beginPath();
            ctx.arc(node.x, node.y, size/2, 0, Math.PI * 2);
            ctx.fillStyle = getRoleColor(node.id);
            ctx.fill();
            
            // Borde
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Reset sombra
            ctx.shadowBlur = 0;
            
            // Etiqueta
            ctx.font = 'bold 10px system-ui';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.id.replace('@', '').substring(0, 8), node.x, node.y);
            
            // UV
            ctx.font = '8px system-ui';
            ctx.fillStyle = '#1e293b';
            ctx.fillText(Math.round(node.uv) + ' UV', node.x, node.y + size/2 + 15);
        });
        
        // Tooltip
        const tooltip = document.getElementById('vm-tooltip');
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);
            
            let hovered = null;
            nodes.forEach(node => {
                const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
                if (dist < 25) hovered = node;
            });
            
            if (hovered && tooltip) {
                tooltip.style.display = 'block';
                tooltip.style.left = (e.clientX + 15) + 'px';
                tooltip.style.top = (e.clientY - 30) + 'px';
                tooltip.innerHTML = `<strong>${hovered.id}</strong><br>UV: ${Math.round(hovered.uv)}`;
            } else if (tooltip) {
                tooltip.style.display = 'none';
            }
        });
        
    }, 300);
};

function getRoleColor(role) {
    const colors = {
        '@enxaneta': '#f59e0b',
        '@acotxador': '#8b5cf6',
        '@terç': '#2563eb',
        '@quart': '#10b981',
        '@pinya': '#64748b',
        '@arquitecto': '#8b5cf6',
        '@Mr-Q': '#2563eb',
        '@masterproject': '#f59e0b'
    };
    return colors[role] || '#3b82f6';
}
