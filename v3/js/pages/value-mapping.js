// value-mapping.js - Versión que SIEMPRE se ve
// TeamTowers Humà v3.4

window.renderValueMapping = function(projectId = '#kernel') {
    console.log('🗺️ Renderizando value map');
    
    const state = window.store?.getState?.() || { projects: [] };
    const projects = state.projects || [];

    // Generar HTML con canvas y selector
    const html = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>🗺️ Value Map - Proyecto</h2>
                <select id="vm-project-select" style="padding: 8px 16px; border-radius: 30px; border: 1px solid #cbd5e1;">
                    ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
            </div>

            <!-- MAPA DE VALOR - CANVAS -->
            <div style="position: relative; height: 500px; background: #f8fafc; border-radius: 24px; margin: 30px 0; overflow: hidden; border: 2px solid #e2e8f0;">
                <canvas id="value-map-canvas" width="900" height="500" style="width: 100%; height: 100%; display: block;"></canvas>
            </div>

            <!-- Leyenda simple -->
            <div style="display: flex; gap: 20px; justify-content: center; margin: 20px 0;">
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #f59e0b; border-radius: 4px;"></span> Enxaneta</div>
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #8b5cf6; border-radius: 4px;"></span> Acotxador</div>
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #2563eb; border-radius: 4px;"></span> Terç</div>
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #10b981; border-radius: 4px;"></span> Quart</div>
                <div><span style="display: inline-block; width: 16px; height: 16px; background: #64748b; border-radius: 4px;"></span> Pinya</div>
            </div>
        </div>
    `;

    // Programar dibujo después de que el DOM esté listo
    setTimeout(() => {
        const canvas = document.getElementById('value-map-canvas');
        if (!canvas) {
            console.error('❌ Canvas no encontrado');
            return;
        }
        
        console.log('🎨 Dibujando mapa simple...');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Fondo
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);
        
        // Título
        ctx.font = 'bold 16px system-ui';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.fillText('Mapa de Valor - TeamTowers', width/2, 40);
        
        // Datos de ejemplo - 5 roles principales
        const roles = [
            { id: '@enxaneta', uv: 850, color: '#f59e0b', x: width/2, y: height/2 - 120 },
            { id: '@acotxador', uv: 620, color: '#8b5cf6', x: width/2 - 150, y: height/2 - 40 },
            { id: '@terç', uv: 450, color: '#2563eb', x: width/2 + 150, y: height/2 - 40 },
            { id: '@quart', uv: 320, color: '#10b981', x: width/2 - 100, y: height/2 + 80 },
            { id: '@pinya', uv: 580, color: '#64748b', x: width/2 + 100, y: height/2 + 80 }
        ];
        
        // Dibujar conexiones
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        
        // Conectar enxaneta con todos
        roles.slice(1).forEach(role => {
            ctx.beginPath();
            ctx.moveTo(roles[0].x, roles[0].y);
            ctx.lineTo(role.x, role.y);
            ctx.stroke();
            
            // Flecha
            const angle = Math.atan2(role.y - roles[0].y, role.x - roles[0].x);
            const arrowX = role.x - 30 * Math.cos(angle);
            const arrowY = role.y - 30 * Math.sin(angle);
            
            ctx.beginPath();
            ctx.fillStyle = '#94a3b8';
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(arrowX - 10 * Math.cos(angle - 0.3), arrowY - 10 * Math.sin(angle - 0.3));
            ctx.lineTo(arrowX - 10 * Math.cos(angle + 0.3), arrowY - 10 * Math.sin(angle + 0.3));
            ctx.closePath();
            ctx.fill();
        });
        
        // Dibujar nodos
        roles.forEach(role => {
            // Sombra
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 2;
            
            // Círculo
            ctx.beginPath();
            ctx.arc(role.x, role.y, 35, 0, Math.PI * 2);
            ctx.fillStyle = role.color;
            ctx.fill();
            
            // Borde blanco
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 4;
            ctx.stroke();
            
            // Reset sombra
            ctx.shadowBlur = 0;
            
            // Etiqueta
            ctx.font = 'bold 12px system-ui';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(role.id.replace('@', ''), role.x, role.y - 5);
            
            // UV
            ctx.font = '10px system-ui';
            ctx.fillStyle = '#1e293b';
            ctx.fillText(role.uv + ' UV', role.x, role.y + 20);
        });
        
        console.log('✅ Mapa dibujado correctamente');
        
    }, 200);

    return html;
};

window.setupValueMappingEvents = function() {
    const select = document.getElementById('vm-project-select');
    if (select) {
        select.addEventListener('change', (e) => {
            window.router?.navigate('value-map', e.target.value);
        });
    }
};
