// /v3/js/pages/project.js - VNA & Agile Canvas Edition
console.log('📦 Cargando project.js (VNA Ready)...');

window.renderProjectDetail = function(params) {
    const projectId = params?.id;
    const state = window.store?.getState();
    const project = state?.projects.find(p => p.id === projectId);
    
    if (!project) return `<div class="error">Proyecto no encontrado</div>`;

    // Inyectamos el CSS del Mapa Visual dinámicamente
    const style = `
        <style>
            .vna-canvas { background: #1a1a1a; border-radius: 12px; padding: 20px; min-height: 400px; position: relative; overflow: hidden; border: 1px solid #333; }
            .node-role { background: #2d2d2d; border: 2px solid var(--tt-primary); border-radius: 8px; padding: 10px; width: 140px; text-align: center; position: absolute; z-index: 2; }
            .vna-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px; }
            .stat-box { background: #252525; padding: 10px; border-radius: 8px; border-left: 4px solid var(--tt-accent); }
            .line-tangible { border-top: 2px solid #3b82f6; position: absolute; z-index: 1; }
            .line-intangible { border-top: 2px dashed #10b981; position: absolute; z-index: 1; }
        </style>
    `;

    const html = `
        ${style}
        <div class="project-detail-header">
            <button onclick="window.router.navigate('projects')" class="back-btn">← Volver</button>
            <h2>${project.sector_emoji || '📁'} ${project.nombre}</h2>
        </div>
        
        <div class="project-tabs">
            <button class="tab-button active" data-tab="canvas">🕸️ Mapa de Valor</button>
            <button class="tab-button" data-tab="info">📋 Info</button>
            <button class="tab-button" data-tab="roles">👥 Roles</button>
        </div>
        
        <div id="tab-content" class="tab-content">
            ${renderCanvasTab(project)}
        </div>
    `;

    // Lógica de pestañas
    setTimeout(() => {
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const tab = e.currentTarget.dataset.tab;
                const content = document.getElementById('tab-content');
                if(tab === 'canvas') content.innerHTML = renderCanvasTab(project);
                if(tab === 'info') content.innerHTML = renderInfoTab(project);
                if(tab === 'roles') content.innerHTML = renderRolesTab(project);
            });
        });
    }, 0);

    return html;
};

function renderCanvasTab(project) {
    // Calculamos el índice de resiliencia usando el Selector que creamos
    const resiliencia = window.Selectors?.getProjectResilienceIndex?.(project.id) || { ratio: 0, status: 'N/A' };
    
    return `
        <div class="vna-stats">
            <div class="stat-box"><strong>Ratio Resiliencia:</strong><br>${resiliencia.ratio}</div>
            <div class="stat-box"><strong>Estado:</strong><br>${resiliencia.status.toUpperCase()}</div>
            <div class="stat-box"><strong>Intangibles:</strong><br>${resiliencia.intangibles || 0}</div>
        </div>
        <div class="vna-canvas" id="canvas-container">
            <p style="color: #666; text-align: center; margin-top: 150px;">
                [ Agile Canvas v3.5 ]<br>
                Renderizando nodos de roles para ${project.roles?.length || 0} participantes...
            </p>
            ${(project.roles || []).map((r, i) => `
                <div class="node-role" style="top: ${50 + (i*80)}px; left: ${50 + (i*40)}px; border-color: ${r.color || '#3b82f6'}">
                    <strong>${r.nombre}</strong><br><small>${r.multiplier}x</small>
                </div>
            `).join('')}
        </div>
    `;
}

function renderInfoTab(project) {
    return `<div class="card"><h3>Detalles del Proyecto</h3><pre>${JSON.stringify(project, null, 2)}</pre></div>`;
}

function renderRolesTab(project) {
    return `<div class="card"><h3>Lista de Roles</h3><ul>${project.roles.map(r => `<li>${r.nombre} (${r.multiplier}x)</li>`).join('')}</ul></div>`;
}
