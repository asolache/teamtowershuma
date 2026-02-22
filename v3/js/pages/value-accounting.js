// value-accounting.js - Página de Value Accounting (CON EVENTOS)
import { store } from '../core/store.js';
import { Selectors } from '../core/selectors.js';

export function renderValueAccounting() {
    const state = store.getState();
    const projects = state.projects;
    const transactions = state.transactions;
    
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
                   p.id === '#vna-app' ? '#10b981' : '#f59e0b'
        };
    }).filter(p => p.uv > 0);

    const totalUV = projectData.reduce((sum, p) => sum + p.uv, 0);
    const pieData = projectData.map(p => ({
        label: p.id,
        value: p.uv,
        color: p.color
    }));

    // Breadcrumb
    const breadcrumbItems = [
        { label: 'Inicio', path: 'dashboard' },
        { label: 'Value Accounting', path: 'value-accounting' }
    ];

    return `
        <div class="card">
            <tt-breadcrumb id="va-breadcrumb" items='${JSON.stringify(breadcrumbItems)}'></tt-breadcrumb>
            <h2>💰 Value Accounting</h2>
            
            <!-- Selector de proyecto -->
            <div style="margin-bottom: 30px;">
                <label for="project-select">Selecciona un proyecto para editar:</label>
                <select id="project-select" class="project-select" style="margin-left: 10px; padding: 8px 16px; border-radius: 8px; border: 1px solid #cbd5e1;">
                    <option value="">-- Selecciona --</option>
                    ${projects.map(p => `<option value="${p.id}">${p.id} - ${p.name}</option>`).join('')}
                </select>
            </div>

            <!-- Distribución global -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px;">
                <div>
                    <h3>Distribución Global</h3>
                    <tt-pie-chart 
                        id="va-pie"
                        data='${JSON.stringify(pieData)}'
                        width="300"
                        height="300">
                    </tt-pie-chart>
                </div>
                <div>
                    <h3>Detalle por Proyecto</h3>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 16px; max-height: 300px; overflow-y: auto;">
                        ${projectData.map(p => `
                            <div class="project-row" data-project="${p.id}" style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: white; border-radius: 8px; cursor: pointer;">
                                <div>
                                    <span style="font-weight: bold;">${p.id}</span>
                                    <span style="color: #64748b; margin-left: 10px;">${p.transactions} tx</span>
                                </div>
                                <div>
                                    <span style="color: #2563eb; font-weight: bold;">${p.uv} UV</span>
                                    <span style="color: #64748b; margin-left: 10px;">${Math.round(p.uv / totalUV * 100)}%</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- Editor de distribución -->
        <div class="card" id="project-editor" style="display: none;">
            <h3 id="editor-title">Editor de Distribución</h3>
            <div id="editor-content"></div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button class="btn-primary" id="save-distribution">💾 Guardar cambios</button>
                <button class="btn-secondary" id="cancel-editor">Cancelar</button>
            </div>
        </div>
    `;
}

export function setupValueAccountingEvents() {
    // Breadcrumb
    const breadcrumb = document.getElementById('va-breadcrumb');
    if (breadcrumb) {
        breadcrumb.addEventListener('breadcrumb-click', (e) => {
            const item = e.detail;
            window.router?.navigate(item.path);
        });
    }

    // Selector de proyecto
    const projectSelect = document.getElementById('project-select');
    if (projectSelect) {
        projectSelect.addEventListener('change', (e) => {
            const projectId = e.target.value;
            if (projectId) {
                loadProjectEditor(projectId);
            } else {
                document.getElementById('project-editor').style.display = 'none';
            }
        });
    }

    // Filas de proyecto click
    document.querySelectorAll('.project-row').forEach(row => {
        row.addEventListener('click', () => {
            const projectId = row.dataset.project;
            loadProjectEditor(projectId);
            document.getElementById('project-select').value = projectId;
        });
    });

    // Cancelar editor
    const cancelBtn = document.getElementById('cancel-editor');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('project-editor').style.display = 'none';
            document.getElementById('project-select').value = '';
        });
    }

    // Guardar distribución
    const saveBtn = document.getElementById('save-distribution');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            console.log('Guardando distribución...');
            // Aquí iría la lógica de guardado
            alert('Distribución guardada (simulado)');
        });
    }

    // Gráfico slice click
    const pie = document.getElementById('va-pie');
    if (pie) {
        pie.addEventListener('slice-click', (e) => {
            const slice = e.detail;
            const projectId = slice.label;
            loadProjectEditor(projectId);
            document.getElementById('project-select').value = projectId;
        });
    }
}

function loadProjectEditor(projectId) {
    const state = store.getState();
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
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr style="background: #f1f5f9;">
                    <th style="padding: 12px; text-align: left;">Rol</th>
                    <th style="padding: 12px; text-align: right;">UV</th>
                    <th style="padding: 12px; text-align: right;">%</th>
                </tr>
            </thead>
            <tbody>
    `;

    roleMap.forEach((uv, role) => {
        const percentage = Math.round(uv / totalUV * 100);
        editorHtml += `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${role}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${uv}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">
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