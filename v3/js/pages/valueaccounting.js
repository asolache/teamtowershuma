// value-accounting.js - Contabilidad de valor
// TeamTowers Humà v3.3 - Estilo global

window.renderValueAccounting = function() {
    try {
        console.log('💰 Renderizando value accounting...');
        
        const state = window.store?.getState?.() || { projects: [], transactions: [] };
        const projects = state.projects || [];
        const transactions = state.transactions || [];
        
        // Calcular distribución por proyecto
        const projectData = projects.map(p => {
            const projectTx = transactions.filter(t => t.project === p.id);
            const uv = projectTx.reduce((sum, t) => sum + (t.uv || 0), 0);
            return {
                id: p.id,
                name: p.name,
                uv: uv,
                transactions: projectTx.length,
                color: p.id === '#kernel' ? '#2563eb' : 
                       p.id === '#paper' ? '#8b5cf6' : 
                       p.id === '#vna-app' ? '#10b981' : 
                       p.id === '#tokenomics' ? '#f59e0b' : 
                       p.id === '#gobernanza' ? '#ec4899' : '#64748b'
            };
        }).filter(p => p.uv > 0);

        const totalUV = projectData.reduce((sum, p) => sum + p.uv, 0);

        return `
            <div class="card">
                <h2>💰 Value Accounting</h2>
                
                <div style="margin-bottom: 30px;">
                    <select id="va-project-select" style="padding: 8px 16px; border-radius: 30px; border: 1px solid #cbd5e1; width: 250px;">
                        <option value="">-- Selecciona un proyecto --</option>
                        ${projects.map(p => `
                            <option value="${p.id}">${p.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <!-- Distribución global -->
                <div style="margin-bottom: 30px;">
                    <h3>📊 Distribución Global</h3>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 16px;">
                        ${projectData.map(p => {
                            const percentage = Math.round(p.uv / totalUV * 100);
                            return `
                                <div style="margin-bottom: 15px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                        <span><strong>${p.id}</strong></span>
                                        <span>${p.uv} UV (${percentage}%)</span>
                                    </div>
                                    <div style="height: 8px; background: #e2e8f0; border-radius: 4px;">
                                        <div style="width: ${percentage}%; height: 100%; background: ${p.color}; border-radius: 4px;"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Detalle por proyecto -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    ${projectData.map(p => `
                        <div class="project-row" data-project="${p.id}" style="background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; cursor: pointer;">
                            <div style="font-weight: bold; font-size: 1.2em; margin-bottom: 10px;">${p.id}</div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>UV Total:</span>
                                <span style="color: #2563eb; font-weight: bold;">${p.uv}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Transacciones:</span>
                                <span>${p.transactions}</span>
                            </div>
                            <div style="margin-top: 10px; font-size: 12px; color: #64748b;">
                                ${Math.round(p.uv / totalUV * 100)}% del total
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Editor de distribución (oculto inicialmente) -->
            <div class="card" id="project-editor" style="display: none;">
                <h3 id="editor-title">Editor de Distribución</h3>
                <div id="editor-content"></div>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn-back" id="save-distribution" style="background: #10b981; color: white;">💾 Guardar cambios</button>
                    <button class="btn-back" id="cancel-editor">Cancelar</button>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('❌ Error en renderValueAccounting:', e);
        return `<div class="loading">Error al cargar value accounting: ${e.message}</div>`;
    }
};

window.setupValueAccountingEvents = function() {
    console.log('💰 Eventos de value accounting configurados');
    
    const select = document.getElementById('va-project-select');
    if (select) {
        select.addEventListener('change', (e) => {
            const projectId = e.target.value;
            if (projectId) {
                loadProjectEditor(projectId);
            } else {
                document.getElementById('project-editor').style.display = 'none';
            }
        });
    }

    document.querySelectorAll('.project-row').forEach(row => {
        row.addEventListener('click', () => {
            const projectId = row.dataset.project;
            loadProjectEditor(projectId);
            const select = document.getElementById('va-project-select');
            if (select) select.value = projectId;
        });
    });

    const cancelBtn = document.getElementById('cancel-editor');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('project-editor').style.display = 'none';
            document.getElementById('va-project-select').value = '';
        });
    }
};

function loadProjectEditor(projectId) {
    const state = window.store?.getState?.() || { transactions: [] };
    const transactions = state.transactions.filter(t => t.project === projectId);
    
    // Calcular distribución por rol
    const roleMap = new Map();
    transactions.forEach(t => {
        const role = t.role;
        const uv = t.uv || 0;
        roleMap.set(role, (roleMap.get(role) || 0) + uv);
    });
    
    const totalUV = transactions.reduce((sum, t) => sum + (t.uv || 0), 0);
    
    let editorHtml = `
        <h4>Proyecto: ${projectId}</h4>
        <p>UV Total: ${totalUV} | Transacciones: ${transactions.length}</p>
        
        <table class="data-table">
            <thead>
                <tr>
                    <th>Rol</th>
                    <th>UV</th>
                    <th>%</th>
                </tr>
            </thead>
            <tbody>
    `;

    roleMap.forEach((uv, role) => {
        const percentage = Math.round(uv / totalUV * 100);
        editorHtml += `
            <tr>
                <td><strong>${role}</strong></td>
                <td style="color: #2563eb;">${uv}</td>
                <td>
                    <input type="number" class="pct-input" value="${percentage}" min="0" max="100" step="0.1" style="width: 80px; padding: 4px;"> %
                </td>
            </tr>
        `;
    });

    editorHtml += `
            </tbody>
        </table>
    `;

    document.getElementById('editor-content').innerHTML = editorHtml;
    document.getElementById('project-editor').style.display = 'block';
    document.getElementById('editor-title').textContent = `Editando ${projectId}`;
}

console.log('✅ Value Accounting cargado globalmente');
