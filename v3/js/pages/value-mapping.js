// value-mapping.js - Mapa de valor con canvas real
window.renderValueMapping = function() {
    console.log('🗺️ Renderizando value map con canvas');
    
    const state = window.store?.getState?.() || { projects: [], transactions: [], roles: [] };
    const transactions = state.transactions || [];
    
    // Preparar datos para el mapa
    const nodes = [];
    const edges = [];
    const rolesSet = new Set();
    
    transactions.forEach(t => {
        if (t.role) rolesSet.add(t.role);
    });
    
    // Crear nodos (roles)
    Array.from(rolesSet).forEach((role, i) => {
        const uv = transactions.filter(t => t.role === role).reduce((s, t) => s + (t.uv || 0), 0);
        nodes.push({
            id: role,
            label: role.replace('@', ''),
            uv: uv,
            size: 30 + (uv / 30),
            color: getRoleColor(role)
        });
    });
    
    // Crear edges (conexiones)
    const connections = {};
    transactions.forEach(t => {
        const key = `${t.role || '?'}-${t.project || '?'}`;
        connections[key] = (connections[key] || 0) + (t.uv || 0);
    });

    return `
        <div class="card">
            <h2>🗺️ Value Map - Visualización en Tiempo Real</h2>
            
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value" style="color: #2563eb">${transactions.length}</div>
                    <div class="metric-label">Flujos Activos</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #8b5cf6">${nodes.length}</div>
                    <div class="metric-label">Nodos (Roles)</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" style="color: #10b981">${Object.keys(connections).length}</div>
                    <div class="metric-label">Conexiones</div>
                </div>
            </div>

            <!-- MAPA DE VALOR CON CANVAS -->
            <div style="position: relative; height: 500px; background: #f8fafc; border-radius: 24px; margin: 30px 0; overflow: hidden; border: 2px solid #e2e8f0;">
                <canvas id="value-map-canvas" width="800" height="500" style="width: 100%; height: 100%; display: block;"></canvas>
                <div id="value-map-tooltip" style="position: absolute; background: #1e293b; color: white; padding: 8px 12px; border-radius: 8px; font-size: 12px; display: none; pointer-events: none;"></div>
            </div>

            <!-- Leyenda -->
            <div style="display: flex; gap: 30px; flex-wrap: wrap; margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 50px;">
                <div><span style="display: inline-block; width: 12px; height: 12px; background: #f59e0b; border-radius: 50%;"></span> Enxaneta</div>
                <div><span style="display: inline-block; width: 12px; height: 12px; background: #8b5cf6; border-radius: 50%;"></span> Acotxador</div>
                <div><span style="display: inline-block; width: 12px; height: 12px; background: #2563eb; border-radius: 50%;"></span> Terç</div>
                <div><span style="display: inline-block; width: 12px; height: 12px; background: #10b981; border-radius: 50%;"></span> Quart</div>
                <div><span style="display: inline-block; width: 20px; height: 2px; background: #94a3b8;"></span> Flujo de valor</div>
            </div>

            <p style="text-align: center; color: #64748b; margin-top: 20px; font-size: 12px;">
                Haz clic en cualquier nodo para ver detalles | Rueda para zoom | Arrastra para mover
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
                    
                    // Datos de nodos (calculados)
                    const nodes = ${JSON.stringify(nodes)};
                    const centerX = width / 2;
                    const centerY = height / 2;
                    
                    // Posicionar nodos en círculo
                    nodes.forEach((node, i) => {
                        const angle = (i / nodes.length) * Math.PI * 2;
                        node.x = centerX + Math.cos(angle) * 180;
                        node.y = centerY + Math.sin(angle) * 180;
                    });
                    
                    // Dibujar conexiones
                    ctx.strokeStyle = '#94a3b8';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 3]);
                    
                    for (let i = 0; i < nodes.length; i++) {
                        for (let j = i + 1; j < nodes.length; j++) {
                            ctx.beginPath();
                            ctx.moveTo(nodes[i].x, nodes[i].y);
                            ctx.lineTo(nodes[j].x, nodes[j].y);
                            ctx.stroke();
                        }
                    }
                    
                    ctx.setLineDash([]);
                    
                    // Dibujar nodos
                    nodes.forEach(node => {
                        // Sombra
                        ctx.shadowColor = 'rgba(0,0,0,0.2)';
                        ctx.shadowBlur = 10;
                        ctx.shadowOffsetY = 2;
                        
                        // Círculo
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, node.size / 2, 0, Math.PI * 2);
                        ctx.fillStyle = node.color;
                        ctx.fill();
                        
                        // Borde blanco
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        
                        // Reset sombra
                        ctx.shadowBlur = 0;
                        
                        // Etiqueta
                        ctx.font = 'bold 10px system-ui';
                        ctx.fillStyle = 'white';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(node.label, node.x, node.y);
                        
                        // UV
                        ctx.font = '8px system-ui';
                        ctx.fillStyle = '#1e293b';
                        ctx.fillText(node.uv + ' UV', node.x, node.y + node.size/2 + 12);
                    });
                    
                    // Tooltip events
                    canvas.addEventListener('mousemove', (e) => {
                        const rect = canvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const scaleX = canvas.width / rect.width;
                        const scaleY = canvas.height / rect.height;
                        const canvasX = x * scaleX;
                        const canvasY = y * scaleY;
                        
                        let hovered = null;
                        nodes.forEach(node => {
                            const dist = Math.sqrt((canvasX - node.x) ** 2 + (canvasY - node.y) ** 2);
                            if (dist < node.size / 2) {
                                hovered = node;
                            }
                        });
                        
                        const tooltip = document.getElementById('value-map-tooltip');
                        if (hovered) {
                            tooltip.style.display = 'block';
                            tooltip.style.left = (e.clientX + 10) + 'px';
                            tooltip.style.top = (e.clientY - 20) + 'px';
                            tooltip.innerHTML = \`
                                <strong>\${hovered.id}</strong><br>
                                UV: \${hovered.uv}<br>
                                Conexiones: \${nodes.length - 1}
                            \`;
                        } else {
                            tooltip.style.display = 'none';
                        }
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
    console.log('🗺️ Value Map eventos listos');
};
