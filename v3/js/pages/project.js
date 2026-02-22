// /v3/js/pages/project.js
// Vista de detalle de proyecto: pestañas Información, Roles, Entregables, Transacciones
// v3.5 - Gestión completa de roles, entregables y transacciones + Evaluación (P-026)

let currentProjectId = null;

window.renderProjectDetail = function(params) {
    console.log('📄 Renderizando detalle de proyecto', params);

    let projectId;
    if (typeof params === 'string') {
        if (params.includes('?')) {
            const urlParams = new URLSearchParams(params);
            projectId = urlParams.get('id');
        } else {
            projectId = params;
        }
    } else if (params && params.id) {
        projectId = params.id;
    }

    if (!projectId) {
        return `<div class="error">ID de proyecto no proporcionado</div>`;
    }

    currentProjectId = projectId;

    const state = window.store?.getState?.() || { projects: [] };
    const project = state.projects.find(p => p.id === projectId);

    if (!project) {
        return `<div class="error">Proyecto ${projectId} no encontrado</div>`;
    }

    let activeTab = 'info';
    if (typeof params === 'string' && params.includes('tab=')) {
        const tabMatch = params.match(/tab=([^&]+)/);
        if (tabMatch) activeTab = tabMatch[1];
    }

    let html = `
        <div class="project-detail-header">
            <button onclick="window.router?.navigate('projects') || history.back()" class="back-btn">← Volver</button>
            <h2>${project.nombre} <span class="project-id">${project.id}</span></h2>
            <p class="project-sector-badge">🏷️ ${window.APP_CONSTANTS?.SECTORES_MAP[project.sector] || project.sector_nombre || project.sector || 'Sector no especificado'}</p>
            <p class="project-description">${project.descripcion || ''}</p>
        </div>
        <div class="project-tabs">
            <button class="tab-button ${activeTab === 'info' ? 'active' : ''}" data-tab="info" data-project-id="${projectId}">📋 Información</button>
            <button class="tab-button ${activeTab === 'roles' ? 'active' : ''}" data-tab="roles" data-project-id="${projectId}">👥 Roles</button>
            <button class="tab-button ${activeTab === 'entregables' ? 'active' : ''}" data-tab="entregables" data-project-id="${projectId}">📦 Entregables</button>
            <button class="tab-button ${activeTab === 'transacciones' ? 'active' : ''}" data-tab="transacciones" data-project-id="${projectId}">💰 Transacciones</button>
        </div>
        <div id="tab-content" class="tab-content">
            <!-- Se rellena vía JS -->
        </div>
    `;

    setTimeout(() => {
        loadTabContent(projectId, activeTab);
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                const projId = e.target.dataset.projectId;
                if (window.history && window.history.pushState) {
                    const url = new URL(window.location);
                    url.searchParams.set('tab', tab);
                    window.history.pushState({}, '', url);
                }
                loadTabContent(projId, tab);
                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }, 0);

    return html;
};

function loadTabContent(projectId, tab) {
    const container = document.getElementById('tab-content');
    if (!container) return;

    switch (tab) {
        case 'info':
            container.innerHTML = renderInfoTab(projectId);
            break;
        case 'roles':
            container.innerHTML = renderRolesTab(projectId);
            setTimeout(() => setupRolesTab(projectId), 0);
            break;
        case 'entregables':
            container.innerHTML = renderEntregablesTab(projectId);
            setTimeout(() => setupEntregablesTab(projectId), 0);
            break;
        case 'transacciones':
            container.innerHTML = renderTransaccionesTab(projectId);
            setTimeout(() => setupTransaccionesTab(projectId), 0);
            break;
        default:
            container.innerHTML = '<p>Pestaña no válida</p>';
    }
}

// ----- Pestaña Info (sin cambios) -----
function renderInfoTab(projectId) {
    const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
    if (!project) return '<p>Proyecto no encontrado</p>';
    const sectorNombre = window.APP_CONSTANTS?.SECTORES_MAP[project.sector] || project.sector_nombre || project.sector || 'No especificado';
    return `
        <div class="info-panel card">
            <h3>Información general</h3>
            <table class="info-table">
                <tr><th>ID:</th><td><code>${project.id}</code></td></tr>
                <tr><th>Nombre:</th><td>${project.nombre}</td></tr>
                <tr><th>Sector:</th><td><span class="sector-tag">${sectorNombre}</span></td></tr>
                <tr><th>Creado por:</th><td>${project.creado_por || 'desconocido'}</td></tr>
                <tr><th>Fecha creación:</th><td>${project.fecha_creacion ? new Date(project.fecha_creacion).toLocaleString() : 'desconocida'}</td></tr>
                <tr><th>Descripción:</th><td>${project.descripcion || 'Sin descripción'}</td></tr>
                <tr><th>Roles:</th><td>${project.roles?.length || 0}</td></tr>
                <tr><th>Transacciones:</th><td>${project.transacciones?.length || 0}</td></tr>
            </table>
        </div>
    `;
}

// ----- Pestaña Roles (sin cambios, se asume que ya está completa) -----
function renderRolesTab(projectId) {
    // ... (código existente, no se modifica para P-026)
    // Por brevedad, no repito todo, pero debe mantenerse el código que ya tenías.
    // Aquí pondré un marcador, pero en tu archivo real debe estar el código completo.
    return '<div class="card">Roles (código existente)</div>';
}
function setupRolesTab(projectId) { /* ... */ }
function showAddRoleForm(projectId) { /* ... */ }
function showUserAuthorizationForm(projectId, roleId) { /* ... */ }

// ----- Pestaña Entregables (sin cambios) -----
function renderEntregablesTab(projectId) {
    // ... (código existente)
    return '<div class="card">Entregables (código existente)</div>';
}
function setupEntregablesTab(projectId) { /* ... */ }
function loadEntregablesForRole(projectId, roleId) { /* ... */ }
function showEntregableForm(projectId, roleId, entregableId) { /* ... */ }
function saveEntregable(projectId, roleId, entregable, isEdit) { /* ... */ }
function deleteEntregable(projectId, roleId, entregableId) { /* ... */ }
function editEntregable(projectId, roleId, entregableId) { /* ... */ }
window.showCreateTransactionForm = function(projectId, roleId, entregableId) { /* ... */ };

// ===== NUEVO: Función para mostrar formulario de evaluación =====
function showEvaluationForm(projectId, transactionId) {
    const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
    if (!project) return;
    const transaction = project.transacciones?.find(tx => tx.id === transactionId);
    if (!transaction) return;

    const usuarioActual = window.usuarioActual || '@masterproject';

    // Verificar que el usuario actual es el receptor
    if (transaction.recibido_por !== usuarioActual) {
        alert('No eres el receptor de esta transacción');
        return;
    }

    // Valores iniciales
    const uvEstimado = transaction.uv_estimado;
    const uvRealInicial = transaction.uv_real !== null ? transaction.uv_real : '';

    let html = `
        <div class="form-container" id="evaluation-form-container">
            <h3>📝 Evaluar transacción: ${transaction.nombre}</h3>
            <form id="evaluation-form">
                <div class="form-group">
                    <label for="eval-uv-real">UV real *</label>
                    <input type="number" id="eval-uv-real" value="${uvRealInicial}" min="0" step="1" required placeholder="Ej: ${uvEstimado}">
                    <small class="help-text">UV estimado: ${uvEstimado}</small>
                </div>
                <div class="form-group">
                    <label for="eval-comentarios">Comentarios (opcional)</label>
                    <textarea id="eval-comentarios" rows="3" placeholder="Añade comentarios sobre la entrega...">${transaction.evaluacion?.comentarios || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="eval-estado">Estado *</label>
                    <select id="eval-estado" required>
                        <option value="completado" ${transaction.estado === 'completado' ? 'selected' : ''}>✅ Completado</option>
                        <option value="en_revision" ${transaction.estado === 'en_revision' ? 'selected' : ''}>🔄 En revisión</option>
                        <option value="cancelado" ${transaction.estado === 'cancelado' ? 'selected' : ''}>❌ Cancelado</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">💾 Guardar evaluación</button>
                    <button type="button" id="cancel-eval-btn" class="btn-secondary">❌ Cancelar</button>
                </div>
            </form>
        </div>
    `;

    const container = document.getElementById('tab-content');
    container.innerHTML = html;

    document.getElementById('evaluation-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const uvReal = parseInt(document.getElementById('eval-uv-real').value);
        const comentarios = document.getElementById('eval-comentarios').value.trim();
        const nuevoEstado = document.getElementById('eval-estado').value;

        if (isNaN(uvReal) || uvReal < 0) {
            alert('UV real debe ser un número mayor o igual a 0');
            return;
        }

        // Preparar objeto de actualización
        const updates = {
            uv_real: uvReal,
            estado: nuevoEstado,
            evaluacion: {
                fecha: new Date().toISOString(),
                evaluador: usuarioActual,
                comentarios: comentarios
            }
        };

        // Llamar al store para actualizar
        if (window.store && window.store.updateTransaction) {
            window.store.updateTransaction(projectId, transactionId, updates);
            console.log('✅ Transacción evaluada:', updates);
            alert('✅ Evaluación guardada correctamente');
            // Volver a la pestaña de transacciones
            loadTabContent(projectId, 'transacciones');
        } else {
            alert('❌ Error al guardar la evaluación');
        }
    });

    document.getElementById('cancel-eval-btn').addEventListener('click', () => {
        loadTabContent(projectId, 'transacciones');
    });
}

// ----- Pestaña Transacciones (modificada) -----
function renderTransaccionesTab(projectId) {
    const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
    if (!project) return '<p>Proyecto no encontrado</p>';

    const transacciones = project.transacciones || [];
    const users = window.store?.getAllUsers() || [];
    const estados = ['pendiente', 'en_revision', 'completado', 'cancelado'];

    return `
        <div class="card">
            <div class="transacciones-header">
                <h3>💰 Transacciones del proyecto</h3>
                <div class="filtros">
                    <select id="filtro-estado" class="filtro-select">
                        <option value="">Todos los estados</option>
                        ${estados.map(e => `<option value="${e}">${e}</option>`).join('')}
                    </select>
                    <select id="filtro-usuario" class="filtro-select">
                        <option value="">Todos los usuarios</option>
                        ${users.map(u => `<option value="${u.id}">${u.nombre} (${u.id})</option>`).join('')}
                    </select>
                    <input type="date" id="filtro-fecha" class="filtro-date" placeholder="Fecha">
                    <button id="limpiar-filtros" class="btn-secondary">Limpiar</button>
                </div>
            </div>
            
            <div id="transacciones-lista" class="transacciones-lista">
                ${renderTransactionList(transacciones, projectId)}
            </div>
        </div>
    `;
}

function renderTransactionList(transacciones, projectId) {
    if (!transacciones || transacciones.length === 0) {
        return '<p class="no-data">No hay transacciones aún. Crea una desde la pestaña de Entregables.</p>';
    }

    const allUsers = window.store?.getAllUsers() || [];
    const usuarioActual = window.usuarioActual || '@masterproject';
    const getUserName = (userId) => {
        const user = allUsers.find(u => u.id === userId);
        return user ? `${user.nombre} (${userId})` : userId;
    };

    let html = `
        <table class="transacciones-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Entregable</th>
                    <th>Emisor</th>
                    <th>Rol emisor</th>
                    <th>Receptor</th>
                    <th>Rol receptor</th>
                    <th>Fecha</th>
                    <th>UV est.</th>
                    <th>UV real</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    transacciones.forEach(tx => {
        const fecha = new Date(tx.fecha).toLocaleDateString();
        const estadoClass = `estado-${tx.estado}`;
        // Mostrar botón evaluar si está pendiente y el usuario actual es el receptor
        const mostrarEvaluar = (tx.estado === 'pendiente' && tx.recibido_por === usuarioActual);
        html += `
            <tr class="${estadoClass}">
                <td><code>${tx.id}</code></td>
                <td>${tx.nombre}</td>
                <td>${getUserName(tx.creado_por)}</td>
                <td>${tx.rol_emisor}</td>
                <td>${getUserName(tx.recibido_por)}</td>
                <td>${tx.rol_receptor}</td>
                <td>${fecha}</td>
                <td>${tx.uv_estimado}</td>
                <td>${tx.uv_real !== null ? tx.uv_real : '—'}</td>
                <td><span class="badge ${estadoClass}">${tx.estado}</span></td>
                <td>
                    ${mostrarEvaluar ? 
                        `<button class="evaluar-btn" data-tx-id="${tx.id}" data-project-id="${projectId}">Evaluar</button>` : 
                        (tx.estado === 'pendiente' ? '—' : '')}
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    return html;
}

function setupTransaccionesTab(projectId) {
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroUsuario = document.getElementById('filtro-usuario');
    const filtroFecha = document.getElementById('filtro-fecha');
    const limpiarBtn = document.getElementById('limpiar-filtros');

    function aplicarFiltros() {
        const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
        if (!project) return;
        let transacciones = project.transacciones || [];

        const estado = filtroEstado?.value;
        const usuario = filtroUsuario?.value;
        const fecha = filtroFecha?.value;

        if (estado) transacciones = transacciones.filter(tx => tx.estado === estado);
        if (usuario) transacciones = transacciones.filter(tx => tx.creado_por === usuario || tx.recibido_por === usuario);
        if (fecha) transacciones = transacciones.filter(tx => tx.fecha.startsWith(fecha));

        document.getElementById('transacciones-lista').innerHTML = renderTransactionList(transacciones, projectId);
        // Re-adjuntar eventos a los botones de evaluar
        attachEvaluateButtons(projectId);
    }

    filtroEstado?.addEventListener('change', aplicarFiltros);
    filtroUsuario?.addEventListener('change', aplicarFiltros);
    filtroFecha?.addEventListener('input', aplicarFiltros);
    limpiarBtn?.addEventListener('click', () => {
        filtroEstado.value = '';
        filtroUsuario.value = '';
        filtroFecha.value = '';
        aplicarFiltros();
    });

    // Función para adjuntar eventos a los botones de evaluar
    function attachEvaluateButtons(projectId) {
        document.querySelectorAll('.evaluar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const txId = e.target.dataset.txId;
                const projId = e.target.dataset.projectId || projectId;
                showEvaluationForm(projId, txId);
            });
        });
    }

    // Adjuntar inicialmente
    attachEvaluateButtons(projectId);
}

// Nota: Aquí deben ir todas las funciones de roles y entregables que ya tenías.
// Por brevedad no las repito, pero asegúrate de que en tu archivo real estén todas.

console.log('✅ project.js cargado con evaluación de transacciones (P-026)');
