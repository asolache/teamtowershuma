// /v3/js/pages/project.js
// Vista de detalle de proyecto: incluye pestañas de Información, Roles, Entregables, Transacciones
// v3.5 - Añadida gestión de transacciones y filtros

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

// ----- Pestaña Roles (sin cambios, resumida) -----
function renderRolesTab(projectId) {
    const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
    if (!project) return '<p>Proyecto no encontrado</p>';
    let html = '<div class="roles-panel card"><h3>Roles del proyecto</h3>';
    if (project.roles && project.roles.length > 0) {
        html += '<div class="roles-list">';
        project.roles.forEach(role => {
            const usuarios = role.usuarios_autorizados || [];
            html += `
                <div class="role-card" data-role-id="${role.id}">
                    <div class="role-header">
                        <strong>${role.id}</strong>
                        <span class="role-name">${role.nombre || ''}</span>
                        <button class="edit-users-btn icon-btn" data-role-id="${role.id}" title="Autorizar usuarios">👥</button>
                    </div>
                    <div class="role-users">
                        <strong>Usuarios autorizados:</strong>
                        ${usuarios.length > 0 ? `<ul class="user-list">${usuarios.map(u => `<li>${u}</li>`).join('')}</ul>` : '<p class="no-data">Ningún usuario autorizado</p>'}
                    </div>
                    <div class="role-stats">
                        <small>📦 Entregables: ${role.entregables?.length || 0}</small>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    } else {
        html += '<p class="no-data">No hay roles definidos en este proyecto.</p>';
    }
    html += `<div class="form-actions"><button id="add-role-btn" class="btn-primary">+ Añadir rol</button></div></div>`;
    return html;
}

function setupRolesTab(projectId) {
    document.getElementById('add-role-btn')?.addEventListener('click', () => {
        alert('Funcionalidad de añadir rol (próximamente)');
    });
    document.querySelectorAll('.edit-users-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const roleId = e.target.dataset.roleId;
            showUserAuthorizationForm(projectId, roleId);
        });
    });
}

function showUserAuthorizationForm(projectId, roleId) {
    // ... (código existente, no modificado para transacciones)
}

// ----- Pestaña Entregables (resumida, ya implementada) -----
function renderEntregablesTab(projectId) {
    const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
    if (!project) return '<p>Proyecto no encontrado</p>';
    let html = `
        <div class="entregables-layout">
            <div class="role-sidebar card">
                <h3>Roles del proyecto</h3>
                <ul class="role-list" id="entregables-role-list">
    `;
    if (project.roles && project.roles.length > 0) {
        project.roles.forEach(role => {
            html += `<li class="role-item" data-role-id="${role.id}">${role.id} <small>(${role.entregables?.length || 0} entregables)</small></li>`;
        });
    } else {
        html += '<li class="no-data">No hay roles. Define roles primero.</li>';
    }
    html += `
                </ul>
            </div>
            <div class="entregables-detail card" id="entregables-detail">
                <p class="placeholder">Selecciona un rol para ver sus entregables</p>
            </div>
        </div>
    `;
    return html;
}

function setupEntregablesTab(projectId) {
    document.querySelectorAll('#entregables-role-list .role-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('#entregables-role-list .role-item').forEach(li => li.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const roleId = e.currentTarget.dataset.roleId;
            loadEntregablesForRole(projectId, roleId);
        });
    });
}

function loadEntregablesForRole(projectId, roleId) {
    // ... (código existente, ya con botones de crear transacción)
    // Nota: Aquí se debe integrar el botón "Crear transacción" que llama a showCreateTransactionForm
}

// ----- Pestaña Transacciones (NUEVA) -----
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
                ${renderTransactionList(transacciones)}
            </div>
        </div>
    `;
}

function renderTransactionList(transacciones) {
    if (!transacciones || transacciones.length === 0) {
        return '<p class="no-data">No hay transacciones aún. Crea una desde la pestaña de Entregables.</p>';
    }

    let html = `
        <table class="transacciones-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Creado por</th>
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
        html += `
            <tr class="${estadoClass}">
                <td><code>${tx.id}</code></td>
                <td>${tx.nombre}</td>
                <td>${tx.rol}</td>
                <td>${tx.creado_por}</td>
                <td>${fecha}</td>
                <td>${tx.uv_estimado}</td>
                <td>${tx.uv_real !== null ? tx.uv_real : '—'}</td>
                <td><span class="badge ${estadoClass}">${tx.estado}</span></td>
                <td>
                    ${tx.estado === 'pendiente' ? '<button class="evaluar-btn" data-tx-id="' + tx.id + '">Evaluar</button>' : ''}
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    return html;
}

function setupTransaccionesTab(projectId) {
    console.log('⚙️ Configurando pestaña de transacciones');

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

        if (estado) {
            transacciones = transacciones.filter(tx => tx.estado === estado);
        }
        if (usuario) {
            transacciones = transacciones.filter(tx => tx.creado_por === usuario);
        }
        if (fecha) {
            transacciones = transacciones.filter(tx => tx.fecha.startsWith(fecha));
        }

        document.getElementById('transacciones-lista').innerHTML = renderTransactionList(transacciones);
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

    // Botones de evaluar (para P-026)
    document.querySelectorAll('.evaluar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const txId = e.target.dataset.txId;
            // Aquí se abrirá el formulario de evaluación (futuro)
            alert(`Evaluar transacción ${txId} - funcionalidad en desarrollo`);
        });
    });
}

// ----- Función para crear transacción (desde entregables) -----
window.showCreateTransactionForm = function(projectId, roleId, entregableId) {
    const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
    if (!project) return;
    const role = project.roles.find(r => r.id === roleId);
    if (!role) return;
    const entregable = role.entregables?.find(e => e.id === entregableId);
    if (!entregable) return;

    const destinatariosOptions = entregable.puede_recibirlo || [];
    const usuarioActual = window.usuarioActual || '@masterproject'; // temporal

    // Verificar si el usuario actual está autorizado en este rol
    if (!role.usuarios_autorizados?.includes(usuarioActual)) {
        alert('No estás autorizado para crear transacciones en este rol');
        return;
    }

    let html = `
        <div class="form-container" id="transaction-form-container">
            <h3>➕ Crear transacción para: ${entregable.nombre}</h3>
            <p><strong>Rol:</strong> ${roleId}</p>
            
            <tt-dynamic-form 
                id="transaction-dynamic-form"
                requisitos='${JSON.stringify(entregable.requisitos || [])}'
                submit-label="Crear Transacción"
            ></tt-dynamic-form>
            
            <div class="form-group" style="margin-top: 1rem;">
                <label for="transaction-destinatarios">Recibirán este entregable:</label>
                <select id="transaction-destinatarios" multiple size="4" class="multi-select">
                    ${destinatariosOptions.map(r => `<option value="${r}">${r}</option>`).join('')}
                </select>
                <p class="help-text">Selecciona múltiples con Ctrl/Cmd</p>
            </div>
            
            <div class="form-group">
                <label for="transaction-uv">UV estimado:</label>
                <input type="number" id="transaction-uv" value="${entregable.uv_base}" min="0" step="1">
            </div>
            
            <div class="form-actions">
                <button id="save-transaction-btn" class="btn-primary">💾 Guardar Transacción</button>
                <button id="cancel-transaction-btn" class="btn-secondary">❌ Cancelar</button>
            </div>
        </div>
    `;

    const container = document.getElementById('entregables-detail');
    container.innerHTML = html;

    document.getElementById('save-transaction-btn').addEventListener('click', () => {
        const dynamicForm = document.getElementById('transaction-dynamic-form');
        const formElement = dynamicForm.shadowRoot.querySelector('#dynamic-form');
        const formData = new FormData(formElement);
        const contenido = {};
        for (let [key, value] of formData.entries()) {
            const req = entregable.requisitos?.find(r => r.campo === key);
            if (req && req.tipo === 'lista') {
                contenido[key] = value.split('\n').map(line => line.trim()).filter(line => line);
            } else {
                contenido[key] = value;
            }
        }

        const destinatarios = Array.from(document.getElementById('transaction-destinatarios').selectedOptions).map(opt => opt.value);
        const uvEstimado = parseInt(document.getElementById('transaction-uv').value);

        if (isNaN(uvEstimado) || uvEstimado < 0) {
            alert('UV debe ser un número mayor o igual a 0');
            return;
        }

        const nuevaTransaccion = {
            id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            entregable_id: entregable.id,
            nombre: entregable.nombre,
            creado_por: usuarioActual,
            rol: roleId,
            fecha: new Date().toISOString(),
            contenido: contenido,
            recibido_por: destinatarios,
            uv_estimado: uvEstimado,
            uv_real: null,
            estado: 'pendiente'
        };

        if (window.store && window.store.addTransaction) {
            window.store.addTransaction(projectId, nuevaTransaccion);
            console.log('✅ Transacción creada:', nuevaTransaccion);
            alert('✅ Transacción creada correctamente');
            loadEntregablesForRole(projectId, roleId);
        } else {
            alert('❌ Error al guardar la transacción');
        }
    });

    document.getElementById('cancel-transaction-btn').addEventListener('click', () => {
        loadEntregablesForRole(projectId, roleId);
    });
};

// Exponer función globalmente
window.showCreateTransactionForm = showCreateTransactionForm;

// ----- Funciones auxiliares para usuarios (AJAX) -----
window.buscarUsuarios = function(query) {
    const users = window.store?.getAllUsers() || [];
    return users.filter(u => u.id.includes(query) || u.nombre.includes(query));
};

console.log('✅ project.js cargado con gestión de transacciones');
