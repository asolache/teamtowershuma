// value-mapping.js - Mapa de valor por proyecto con roles y transacciones
// TeamTowers Humà v3.4 - VERSIÓN FINAL

window.renderValueMapping = function(projectId = '#kernel') {
    console.log('🗺️ Renderizando value map para proyecto:', projectId);
    
    const state = window.store?.getState?.() || { projects: [], transactions: [], roles: [] };
    const projects = state.projects || [];
    const transactions = state.transactions || [];
    
    // Filtrar transacciones del proyecto seleccionado
    const projectTransactions = transactions.filter(t => t.project === projectId);
    
    // Obtener roles únicos en este proyecto
    const roles = {};
    projectTransactions.forEach(t => {
        if (!roles[t.role]) {
            roles[t.role] = {
                id: t.role,
                tangible: 0,
                intangible: 0,
                count: 0,
                uv: 0,
                connections: {}
            };
        }
        
        const uv = t.uv || 0;
        roles[t.role].uv += uv;
        roles[t.role].count++;
        
        // Clasificar por tipo
        if (t.type === '#intangible' || t.subtype === '#decisión' || t.subtype === '#mentoria') {
            roles[t.role].intangible += uv;
        } else {
            roles[t.role].tangible += uv;
        }
        
        // Registrar conexiones con otros roles (simulado - en realidad sería de los datos)
        const otherRole = t.role === '@Mr-Q' ? '@arquitecto' : '@Mr-Q';
        roles[t.role].connections[otherRole] = (roles[t.role].connections[otherRole] || 0) + uv;
    });

    const roleList = Object.values(roles);
    const totalUV = projectTransactions.reduce((s, t) => s + (t.uv || 0), 0);
    const totalTangible = projectTransactions.filter(t => t.type !== '#intangible').reduce((s, t) => s + (t.uv || 0), 0);
    const totalIntangible = projectTransactions.filter(t => t.type === '#intangible').reduce((s, t) => s + (t.uv || 0), 0);

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

            <!-- Métricas del proyecto -->
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
                    <div class="metric-value" style="color: #8b5cf6">${roleList.length}</div>
                    <div class="metric-label">Roles</div>
                </div>
            </div>

            <!-- MAPA DE VALOR CON CANVAS -->
            <div style="position: relative; height: 500px; background: #f8fafc; border-radius: 24px; margin: 30px 0; overflow: hidden; border: 2px solid #e2e8f0;">
                <canvas id="value-map-canvas" width="900" height="500" style="width: 100%; height: 100%; display: block;"></canvas>
                <div id="vm-tooltip" style="position: absolute; background: #1e293b; color: white; padding: 12px 16px; border-radius: 8px; font-size: 12px; display: none; pointer-events: none; z-index: 1000;"></div>
            </div>

            <!-- Leyenda -->
            <div style="display: flex; gap: 30px; flex-wrap: wrap; margin: 20px 0; padding: 15px; background: #f1f5f9; border-radius: 50px;">
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #2563eb; border-radius: 4px;"></span> Tangible (código, docs)</div>
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #f59e0b; border-radius: 4px;"></span> Intangible (decisiones, mentorías)</div>
                <div><span style="display: inline-block; width: 20px; height: 2px; background: #94a3b8;"></span> Flujo de valor</div>
                <div><span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #10b981; border-radius: 4px;"></span> Rol seleccionado</div>
            </div>

            <!-- Tabla de roles -->
            <h3 style="margin: 30px 0 15px;">📊 Roles en el proyecto</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Rol</th>
                        <th>UV Total</th>
                        <th>Tangible</th>
                        <th>Intangible</th>
                        <th>Transacciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${roleList.map(role => `
                        <tr class="role-row" data-role="${role.id}" style="cursor: pointer;">
                            <td><strong style="color: ${getRoleColor(role.id)}">${role.id}</strong></td>
                            <td style="color: #2563eb; font-weight: bold;">${role.uv}</td>
                            <td style="color: #10b981;">${role.tangible}</td>
                            <td style="color: #f59e0b;">${role.intangible}</td>
                            <td>${role.count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <p style="text-align: center; color: #64748b; margin-top: 20px; font-size: 12px;">
                Haz clic en cualquier nodo para ver detalles | Los flujos muestran relaciones entre roles
            </p>
        </div>

        <script>
            (function() {
                setTimeout(() => {
                    const canvas = document.getElementById('value-map-canvas');
                    if (!canvas) return;
                    
                    const ctx = canvas.getContext('2d');
                    const width = canvas.width;
                    const height = canvas.height;
                    
                    // Datos de roles para este proyecto
                    const roles = ${JSON.stringify(roleList)};
                    
                    if (roles.length === 0) {
                        ctx.font = '16px system-ui';
                        ctx.fillStyle = '#64748b';
                        ctx.textAlign = 'center';
                        ctx.fillText('No hay datos para este proyecto', width/2, height/2);
                        return;
                    }
                    
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const radius = Math.min(width, height) * 0.3;
                    
                    // Posicionar nodos en círculo
                    roles.forEach((role, i) => {
                        const angle = (i / roles.length) * Math.PI * 2;
                        role.x = centerX + Math.cos(angle) * radius;
                        role.y = centerY + Math.sin(angle) * radius;
                    });
                    
                    // DIBUJAR ARISTAS (flujos entre roles)
                    ctx.strokeStyle = '#94a3b8';
                    ctx.lineWidth = 1;
                    
                    roles.forEach(from => {
                        Object.entries(from.connections || {}).forEach(([toId, value]) => {
                            const to = roles.find(r => r.id === toId);
                            if (to) {
                                // Grosor de línea según valor del flujo
                                ctx.lineWidth = 1 + (value / 200);
                                
                                // Color según tipo (simulado - se puede refinar)
                                ctx.strokeStyle = value > 300 ? '#2563eb' : '#94a3b8';
                                
                                ctx.beginPath();
                                ctx.moveTo(from.x, from.y);
                                ctx.lineTo(to.x, to.y);
                                ctx.stroke();
                                
                                // Flecha en la dirección
                                const angle = Math.atan2(to.y - from.y, to.x - from.x);
                                const arrowX = to.x - Math.cos(angle) * 30;
                                const arrowY = to.y - Math.sin(angle) * 30;
                                
                                ctx.beginPath();
                                ctx.fillStyle = ctx.strokeStyle;
                                ctx.moveTo(arrowX, arrowY);
                                ctx.lineTo(arrowX - 8 * Math.cos(angle - 0.3), arrowY - 8 * Math.sin(angle - 0.3));
                                ctx.lineTo(arrowX - 8 * Math.cos(angle + 0.3), arrowY - 8 * Math.sin(angle + 0.3));
                                ctx.closePath();
                                ctx.fill();
                            }
                        });
                    });
                    
                    // DIBUJAR NODOS
                    roles.forEach(role => {
                        const size = 30 + (role.uv / 30);
                        const tangibleRatio = role.tangible / (role.uv || 1);
                        
                        // Sombra
                        ctx.shadowColor = 'rgba(0,0,0,0.2)';
                        ctx.shadowBlur = 10;
                        ctx.shadowOffsetY = 2;
                        
                        // Círculo base (gris para el fondo)
                        ctx.beginPath();
                        ctx.arc(role.x, role.y, size/2, 0, Math.PI * 2);
                        ctx.fillStyle = '#e2e8f0';
                        ctx.fill();
                        
                        // Sector tangible (azul)
                        ctx.beginPath();
                        ctx.moveTo(role.x, role.y);
                        ctx.arc(role.x, role.y, size/2, 0, Math.PI * 2 * tangibleRatio);
                        ctx.closePath();
                        ctx.fillStyle = '#2563eb';
                        ctx.fill();
                        
                        // Sector intangible (naranja) - el resto
                        if (tangibleRatio < 1) {
                            ctx.beginPath();
                            ctx.moveTo(role.x, role.y);
                            ctx.arc(role.x, role.y, size/2, Math.PI * 2 * tangibleRatio, Math.PI * 2);
                            ctx.closePath();
                            ctx.fillStyle = '#f59e0b';
                            ctx.fill();
                        }
                        
                        // Borde blanco
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
                        ctx.fillText(role.id.replace('@', ''), role.x, role.y);
                        
                        // UV total
                        ctx.font = '8px system-ui';
                        ctx.fillStyle = '#1e293b';
                        ctx.fillText(role.uv + ' UV', role.x, role.y + size/2 + 15);
                    });
                    
                    // TOOLTIP INTERACTIVO
                    const tooltip = document.getElementById('vm-tooltip');
                    
                    canvas.addEventListener('mousemove', (e) => {
                        const rect = canvas.getBoundingClientRect();
                        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                        
                        let hovered = null;
                        roles.forEach(role => {
                            const dist = Math.sqrt((x - role.x) ** 2 + (y - role.y) ** 2);
                            if (dist < 30) {
                                hovered = role;
                            }
                        });
                        
                        if (hovered) {
                            tooltip.style.display = 'block';
                            tooltip.style.left = (e.clientX + 15) + 'px';
                            tooltip.style.top = (e.clientY - 40) + 'px';
                            tooltip.innerHTML = \`
                                <strong>\${hovered.id}</strong><br>
                                <span style="color: #10b981;">🔷 Tangible: \${hovered.tangible} UV</span><br>
                                <span style="color: #f59e0b;">💭 Intangible: \${hovered.intangible} UV</span><br>
                                <span>📊 Total: \${hovered.uv} UV</span><br>
                                <span>📦 Transacciones: \${hovered.count}</span>
                            \`;
                        } else {
                            tooltip.style.display = 'none';
                        }
                    });
                    
                    canvas.addEventListener('click', (e) => {
                        const rect = canvas.getBoundingClientRect();
                        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
                        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
                        
                        roles.forEach(role => {
                            const dist = Math.sqrt((x - role.x) ** 2 + (y - role.y) ** 2);
                            if (dist < 30) {
                                window.router?.navigate('role', role.id);
                            }
                        });
                    });
                    
                }, 200);
            })();
        </script>
    `;
};

function getRoleColor(role) {
    const colors = {
        '@masterproject': '#f59e0b',
        '@arquitecto': '#8b5cf6',
        '@Mr-Q': '#2563eb',
        '@tester-guardian': '#10b981',
        '@super-z': '#ec4899',
        '@economista': '#3b82f6'
    };
    return colors[role] || '#64748b';
}

window.setupValueMappingEvents = function() {
    console.log('🗺️ Configurando eventos de value map');
    
    const select = document.getElementById('vm-project-select');
    if (select) {
        select.addEventListener('change', (e) => {
            window.router?.navigate('value-map', e.target.value);
        });
    }
    
    // Click en filas de roles
    document.querySelectorAll('.role-row').forEach(row => {
        row.addEventListener('click', (e) => {
            const roleId = row.dataset.role;
            if (roleId) {
                window.router?.navigate('role', roleId);
            }
        });
    });
};
