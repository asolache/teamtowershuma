// /v3/js/pages/project.js
// Vista de detalle de proyecto: pestañas Información, Roles, Entregables, Transacciones
// v3.5 - Gestión completa de roles, entregables y transacciones (sin definición de componentes)

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

// ----- Pestaña Info -----
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

// ----- Pestaña Roles (con añadir rol funcional) -----
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
        showAddRoleForm(projectId);
    });
    document.querySelectorAll('.edit-users-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const roleId = e.target.dataset.roleId;
            showUserAuthorizationForm(projectId, roleId);
        });
    });
}

function showAddRoleForm(projectId) {
    const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
    if (!project) return;

    const availableRoles = window.store?.getState?.()?.roles || [];
    const existingRoleIds = project.roles.map(r => r.id);

    let html = `
        <div class="form-container" id="add-role-form-container">
            <h3>➕ Añadir rol al proyecto</h3>
            <form id="add-role-form">
                <div class="form-group">
                    <label for="role-select">Selecciona un rol del catálogo:</label>
                    <select id="role-select" class="filtro-select">
                        <option value="">-- Elige un rol --</option>
                        ${availableRoles
                            .filter(role => !existingRoleIds.includes(role.id))
                            .map(role => `<option value="${role.id}">${role.id} - ${role.nombre || ''}</option>`)
                            .join('')}
                    </select>
                    <p class="help-text">O puedes crear un rol personalizado:</p>
                </div>
                <div class="form-group">
                    <label for="custom-role-id">ID del rol personalizado:</label>
                    <input type="text" id="custom-role-id" placeholder="@mi-rol" pattern="@[a-z0-9-]+" title="Debe empezar con @ y contener minúsculas, números y guiones">
                </div>
                <div class="form-group">
                    <label for="custom-role-name">Nombre del rol (opcional):</label>
                    <input type="text" id="custom-role-name" placeholder="Ej: Mi Rol">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">✅ Añadir rol</button>
                    <button type="button" id="cancel-add-role" class="btn-secondary">❌ Cancelar</button>
                </div>
            </form>
        </div>
    `;

    const container = document.getElementById('tab-content');
    container.innerHTML = html;

    document.getElementById('add-role-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const selectedRoleId = document.getElementById('role-select').value;
        const customRoleId = document.getElementById('custom-role-id').value.trim();
        const customRoleName = document.getElementById('custom-role-name').value.trim();

        let newRoleId, newRoleName;

        if (selectedRoleId) {
            const selectedRole = availableRoles.find(r => r.id === selectedRoleId);
            newRoleId = selectedRole.id;
            newRoleName = selectedRole.nombre || selectedRole.id;
        } else if (customRoleId) {
            if (!customRoleId.startsWith('@')) {
                alert('El ID del rol personalizado debe empezar con @');
                return;
            }
            newRoleId = customRoleId;
            newRoleName = customRoleName || customRoleId;
        } else {
            alert('Debes seleccionar un rol del catálogo o crear uno personalizado');
            return;
        }

        if (project.roles.some(r => r.id === newRoleId)) {
            alert(`El rol ${newRoleId} ya existe en el proyecto`);
            return;
        }

        const newRole = {
            id: newRoleId,
            nombre: newRoleName,
            usuarios_autorizados: [],
            entregables: []
        };

        project.roles.push(newRole);
        window.store.updateProject(projectId, project);
        loadTabContent(projectId, 'roles');
    });

    document.getElementById('cancel-add-role').addEventListener('click', () => {
        loadTabContent(projectId, 'roles');
    });
}

function showUserAuthorizationForm(projectId, roleId) {
    const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
    if (!project) return;
    const role = project.roles.find(r => r.id === roleId);
    if (!role) return;
    const allUsers = window.store?.getAllUsers() || [];
    const currentAuthorized = role.usuarios_autorizados || [];

    let html = `
        <div class="form-container" id="auth-form-container">
            <h3>Autorizar usuarios para ${roleId}</h3>
            <form id="auth-form">
                <div class="users-checkbox-list">
    `;

    allUsers.forEach(user => {
        const checked = currentAuthorized.includes(user.id) ? 'checked' : '';
        html += `
            <div class="user-checkbox-item">
                <label>
                    <input type="checkbox" name="users" value="${user.id}" ${checked}>
                    <strong>${user.id}</strong> - ${user.nombre} (${user.email})
                </label>
            </div>
        `;
    });

    html += `
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">💾 Guardar autorizaciones</button>
                    <button type="button" id="cancel-auth-btn" class="btn-secondary">❌ Cancelar</button>
                </div>
            </form>
        </div>
    `;

    const container = document.getElementById('tab-content');
    container.innerHTML = html;

    document.getElementById('auth-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedUsers = Array.from(document.querySelectorAll('input[name="users"]:checked')).map(cb => cb.value);
        if (window.store.updateRoleUsers) {
            window.store.updateRoleUsers(projectId, roleId, selectedUsers);
        } else {
            const state = window.store.getState();
            const proj = state.projects.find(p => p.id === projectId);
            const r = proj.roles.find(r => r.id === roleId);
            r.usuarios_autorizados = selectedUsers;
            window.store.saveState();
        }
        loadTabContent(projectId, 'roles');
    });

    document.getElementById('cancel-auth-btn').addEventListener('click', () => {
        loadTabContent(projectId, 'roles');
    });
}

// ----- Pestaña Entregables (completa) -----
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
    const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
    if (!project) return;
    const role = project.roles.find(r => r.id === roleId);
    if (!role) return;

    const entregables = role.entregables || [];
    let html = `<h3>Entregables para ${role.id}</h3>`;

    if (entregables.length === 0) {
        html += '<p class="no-data">No hay entregables definidos para este rol.</p>';
    } else {
        html += '<div class="entregables-list">';
        entregables.forEach(ent => {
            const destinatarios = ent.puede_recibirlo || [];
            html += `
                <div class="entregable-card" data-entregable-id="${ent.id}">
                    <div class="entregable-header">
                        <strong>${ent.nombre}</strong> 
                        <span class="uv-badge">${ent.uv_base} UV</span>
                        <div class="actions">
                            <button class="edit-entregable icon-btn" data-entregable-id="${ent.id}" title="Editar">✏️</button>
                            <button class="delete-entregable icon-btn" data-entregable-id="${ent.id}" title="Eliminar">🗑️</button>
                            <button class="create-transaction-btn icon-btn" data-entregable-id="${ent.id}" title="Crear transacción">➕</button>
                        </div>
                    </div>
                    <p class="entregable-desc">${ent.descripcion || ''}</p>
                    <details class="requisitos-details">
                        <summary>📋 Requisitos (${ent.requisitos?.length || 0})</summary>
                        <ul class="requisitos-list">
                            ${(ent.requisitos || []).map(req => `
                                <li><strong>${req.label || req.campo}</strong> (${req.tipo}) ${req.required ? '<span class="required-badge">requerido</span>' : ''}</li>
                            `).join('')}
                        </ul>
                    </details>
                    <p class="destinatarios">
                        <small>📨 Puede recibirlo: ${destinatarios.length ? destinatarios.join(', ') : 'cualquier rol'}</small>
                    </p>
                </div>
            `;
        });
        html += '</div>';
    }

    html += `<button id="add-entregable-btn" class="btn-primary" data-role-id="${roleId}">+ Nuevo entregable</button>`;

    const container = document.getElementById('entregables-detail');
    container.innerHTML = html;

    document.getElementById('add-entregable-btn')?.addEventListener('click', (e) => {
        const roleId = e.target.dataset.roleId;
        showEntregableForm(projectId, roleId);
    });

    document.querySelectorAll('.edit-entregable').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const entregableId = e.target.dataset.entregableId;
            editEntregable(projectId, roleId, entregableId);
        });
    });

    document.querySelectorAll('.delete-entregable').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const entregableId = e.target.dataset.entregableId;
            if (confirm('¿Eliminar este entregable?')) {
                deleteEntregable(projectId, roleId, entregableId);
            }
        });
    });

    document.querySelectorAll('.create-transaction-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const entregableId = e.target.dataset.entregableId;
            showCreateTransactionForm(projectId, roleId, entregableId);
        });
    });
}

// ===== FUNCIONES DE ENTREGABLES (CRUD) =====
function showEntregableForm(projectId, roleId, entregableId = null) {
    const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
    if (!project) return;
    const role = project.roles.find(r => r.id === roleId);
    if (!role) return;
    
    let entregable = null;
    if (entregableId) {
        entregable = role.entregables?.find(e => e.id === entregableId);
    }

    const roleOptions = project.roles.map(r => `<option value="${r.id}">${r.id}</option>`).join('');

    const initialNombre = entregable ? entregable.nombre : '';
    const initialDesc = entregable ? entregable.descripcion : '';
    const initialUv = entregable ? entregable.uv_base : '';
    const initialDestinatarios = entregable ? (entregable.puede_recibirlo || []) : [];

    let html = `
        <div class="form-container" id="entregable-form-container">
            <h3>${entregableId ? 'Editar' : 'Nuevo'} entregable para ${roleId}</h3>
            <form id="entregable-form">
                <div class="form-group">
                    <label for="ent-nombre">Nombre *</label>
                    <input type="text" id="ent-nombre" value="${initialNombre}" required placeholder="Ej: Especificación Técnica">
                </div>
                
                <div class="form-group">
                    <label for="ent-descripcion">Descripción</label>
                    <textarea id="ent-descripcion" rows="2" placeholder="Describe el entregable...">${initialDesc}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="ent-uvbase">UV base *</label>
                    <input type="number" id="ent-uvbase" value="${initialUv}" min="0" step="1" required placeholder="Ej: 600">
                </div>

                <h4>Requisitos del entregable</h4>
                <div id="requisitos-container" class="requisitos-container"></div>
                <button type="button" id="add-requisito-btn" class="btn-secondary">+ Añadir requisito</button>

                <h4>Puede ser recibido por</h4>
                <select id="ent-destinatarios" multiple size="4" class="multi-select">
                    ${roleOptions}
                </select>
                <p class="help-text">Selecciona múltiples con Ctrl/Cmd (o ⌘ en Mac)</p>

                <div class="form-actions">
                    <button type="submit" class="btn-primary">💾 Guardar</button>
                    <button type="button" id="cancel-form-btn" class="btn-secondary">❌ Cancelar</button>
                </div>
            </form>
        </div>
    `;

    const container = document.getElementById('entregables-detail');
    container.innerHTML = html;

    const requisitosContainer = document.getElementById('requisitos-container');
    let requisitos = entregable ? (entregable.requisitos || []) : [];

    function renderRequisitos() {
        requisitosContainer.innerHTML = '';
        if (requisitos.length === 0) {
            requisitosContainer.innerHTML = '<p class="no-data">No hay requisitos definidos. Añade el primero.</p>';
        } else {
            requisitos.forEach((req, index) => {
                const reqHtml = `
                    <div class="requisito-item" data-index="${index}">
                        <input type="text" placeholder="Nombre del campo" value="${req.campo || ''}" class="req-campo" required>
                        <select class="req-tipo">
                            <option value="text" ${req.tipo === 'text' ? 'selected' : ''}>Texto</option>
                            <option value="textarea" ${req.tipo === 'textarea' ? 'selected' : ''}>Área de texto</option>
                            <option value="number" ${req.tipo === 'number' ? 'selected' : ''}>Número</option>
                            <option value="select" ${req.tipo === 'select' ? 'selected' : ''}>Selector</option>
                            <option value="lista" ${req.tipo === 'lista' ? 'selected' : ''}>Lista</option>
                        </select>
                        <input type="text" placeholder="Label" value="${req.label || ''}" class="req-label">
                        <label class="req-required-label">
                            <input type="checkbox" class="req-required" ${req.required ? 'checked' : ''}> Requerido
                        </label>
                        <button type="button" class="remove-requisito icon-btn" data-index="${index}" title="Eliminar requisito">🗑️</button>
                    </div>
                `;
                requisitosContainer.insertAdjacentHTML('beforeend', reqHtml);
            });
        }

        document.querySelectorAll('.remove-requisito').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                requisitos.splice(index, 1);
                renderRequisitos();
            });
        });
    }

    renderRequisitos();

    document.getElementById('add-requisito-btn').addEventListener('click', () => {
        // Recoger valores actuales del DOM
        const items = document.querySelectorAll('.requisito-item');
        const nuevosRequisitos = [];
        items.forEach(item => {
            const campo = item.querySelector('.req-campo')?.value.trim();
            const tipo = item.querySelector('.req-tipo')?.value;
            const label = item.querySelector('.req-label')?.value.trim();
            const required = item.querySelector('.req-required')?.checked || false;
            if (campo) {
                nuevosRequisitos.push({ campo, tipo, label: label || campo, required });
            }
        });
        requisitos = nuevosRequisitos;
        requisitos.push({ campo: '', tipo: 'text', label: '', required: false });
        renderRequisitos();
    });

    const destinatariosSelect = document.getElementById('ent-destinatarios');
    if (initialDestinatarios.length > 0) {
        Array.from(destinatariosSelect.options).forEach(opt => {
            if (initialDestinatarios.includes(opt.value)) {
                opt.selected = true;
            }
        });
    }

    document.getElementById('entregable-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('ent-nombre').value.trim();
        const descripcion = document.getElementById('ent-descripcion').value.trim();
        const uvbase = parseInt(document.getElementById('ent-uvbase').value);
        const destinatarios = Array.from(document.getElementById('ent-destinatarios').selectedOptions).map(opt => opt.value);

        const requisitosActualizados = [];
        document.querySelectorAll('.requisito-item').forEach(item => {
            const campo = item.querySelector('.req-campo')?.value.trim();
            const tipo = item.querySelector('.req-tipo')?.value;
            const label = item.querySelector('.req-label')?.value.trim();
            const required = item.querySelector('.req-required')?.checked || false;
            if (campo) {
                requisitosActualizados.push({ campo, tipo, label: label || campo, required });
            }
        });

        if (!nombre) {
            alert('El nombre es obligatorio');
            return;
        }
        if (isNaN(uvbase) || uvbase < 0) {
            alert('UV base debe ser un número mayor o igual a 0');
            return;
        }

        const newEntregable = {
            id: entregableId || 'ent-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            nombre: nombre,
            descripcion: descripcion,
            uv_base: uvbase,
            requisitos: requisitosActualizados,
            puede_recibirlo: destinatarios
        };

        saveEntregable(projectId, roleId, newEntregable, !!entregableId);
    });

    document.getElementById('cancel-form-btn').addEventListener('click', () => {
        loadEntregablesForRole(projectId, roleId);
    });
}

function saveEntregable(projectId, roleId, entregable, isEdit) {
    const state = window.store?.getState?.();
    if (!state) return;

    const projectIndex = state.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const updatedProject = JSON.parse(JSON.stringify(state.projects[projectIndex]));
    const roleIndex = updatedProject.roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) return;

    if (!updatedProject.roles[roleIndex].entregables) {
        updatedProject.roles[roleIndex].entregables = [];
    }

    if (isEdit) {
        const idx = updatedProject.roles[roleIndex].entregables.findIndex(e => e.id === entregable.id);
        if (idx !== -1) {
            updatedProject.roles[roleIndex].entregables[idx] = entregable;
        }
    } else {
        updatedProject.roles[roleIndex].entregables.push(entregable);
    }

    window.store.updateProject(projectId, updatedProject);
    loadEntregablesForRole(projectId, roleId);
}

function deleteEntregable(projectId, roleId, entregableId) {
    const state = window.store?.getState?.();
    if (!state) return;

    const projectIndex = state.projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;

    const updatedProject = JSON.parse(JSON.stringify(state.projects[projectIndex]));
    const roleIndex = updatedProject.roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) return;

    updatedProject.roles[roleIndex].entregables = updatedProject.roles[roleIndex].entregables.filter(e => e.id !== entregableId);
    window.store.updateProject(projectId, updatedProject);
    loadEntregablesForRole(projectId, roleId);
}

function editEntregable(projectId, roleId, entregableId) {
    showEntregableForm(projectId, roleId, entregableId);
}

// ----- Función para crear transacción (desde entregables) -----
window.showCreateTransactionForm = function(projectId, roleId, entregableId) {
    const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
    if (!project) return;
    const role = project.roles.find(r => r.id === roleId);
    if (!role) return;
    const entregable = role.entregables?.find(e => e.id === entregableId);
    if (!entregable) return;

    const usuarioActual = window.usuarioActual || '@masterproject';

    if (!role.usuarios_autorizados?.includes(usuarioActual)) {
        alert('No estás autorizado para crear transacciones en este rol');
        return;
    }

    const allUsers = window.store?.getAllUsers() || [];
    const rolesDestino = entregable.puede_recibirlo || [];
    let posiblesReceptores = [];
    rolesDestino.forEach(rolDest => {
        const roleDestino = project.roles.find(r => r.id === rolDest);
        if (roleDestino && roleDestino.usuarios_autorizados) {
            roleDestino.usuarios_autorizados.forEach(userId => {
                if (!posiblesReceptores.some(u => u.userId === userId)) {
                    const user = allUsers.find(u => u.id === userId);
                    if (user) {
                        posiblesReceptores.push({
                            userId: user.id,
                            nombre: user.nombre,
                            rolDestino: rolDest
                        });
                    }
                }
            });
        }
    });

    const receptorOptions = posiblesReceptores.map(r => 
        `<option value="${r.userId}" data-rol="${r.rolDestino}">${r.nombre} (${r.userId}) como ${r.rolDestino}</option>`
    ).join('');

    let html = `
        <div class="form-container" id="transaction-form-container">
            <h3>➕ Crear transacción para: ${entregable.nombre}</h3>
            <p><strong>Rol emisor:</strong> ${roleId} (${usuarioActual})</p>
            
            <tt-dynamic-form 
                id="transaction-dynamic-form"
                requisitos='${JSON.stringify(entregable.requisitos || [])}'
                submit-label="Crear Transacción"
            ></tt-dynamic-form>
            
            <div class="form-group" style="margin-top: 1rem;">
                <label for="transaction-receptor">Selecciona el receptor (usuario):</label>
                <select id="transaction-receptor" class="filtro-select" required>
                    <option value="">-- Selecciona un usuario --</option>
                    ${receptorOptions}
                </select>
                <p class="help-text">El usuario que recibirá este entregable</p>
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

    if (!customElements.get('tt-dynamic-form')) {
        console.error('❌ El componente <tt-dynamic-form> no está definido.');
        alert('Error: El formulario dinámico no está disponible.');
        return;
    }

    setTimeout(() => {
        const dynamicForm = document.getElementById('transaction-dynamic-form');
        if (!dynamicForm) {
            console.error('❌ No se encontró el elemento <tt-dynamic-form>');
            return;
        }

        document.getElementById('save-transaction-btn').addEventListener('click', () => {
            const shadow = dynamicForm.shadowRoot;
            if (!shadow) {
                console.error('❌ shadowRoot no disponible');
                return;
            }
            const formElement = shadow.querySelector('#dynamic-form');
            if (!formElement) return;

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

            const receptorSelect = document.getElementById('transaction-receptor');
            const receptorUserId = receptorSelect.value;
            if (!receptorUserId) {
                alert('Debes seleccionar un receptor');
                return;
            }
            const selectedOption = receptorSelect.options[receptorSelect.selectedIndex];
            const rolReceptor = selectedOption.dataset.rol;

            const uvEstimado = parseInt(document.getElementById('transaction-uv').value);
            if (isNaN(uvEstimado) || uvEstimado < 0) {
                alert('UV debe ser >= 0');
                return;
            }

            const nuevaTransaccion = {
                id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
                entregable_id: entregable.id,
                nombre: entregable.nombre,
                creado_por: usuarioActual,
                recibido_por: receptorUserId,
                rol_emisor: roleId,
                rol_receptor: rolReceptor,
                fecha: new Date().toISOString(),
                contenido: contenido,
                uv_estimado: uvEstimado,
                uv_real: null,
                estado: 'pendiente'
            };

            if (window.store?.addTransaction) {
                window.store.addTransaction(projectId, nuevaTransaccion);
                alert('✅ Transacción creada');
                loadEntregablesForRole(projectId, roleId);
            } else {
                alert('❌ Error al guardar');
            }
        });
    }, 100);

    document.getElementById('cancel-transaction-btn').addEventListener('click', () => {
        loadEntregablesForRole(projectId, roleId);
    });
};

// ----- Pestaña Transacciones -----
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
        return '<p class="no-data">No hay transacciones aún.</p>';
    }

    const allUsers = window.store?.getAllUsers() || [];
    const getUserName = (userId) => {
        const user = allUsers.find(u => u.id === userId);
        return user ? `${user.nombre} (${userId})` : userId;
    };

    let html = `
        <table class="transacciones-table">
            <thead>
                <tr>
                    <th>ID</th><th>Entregable</th><th>Emisor</th><th>Rol emisor</th>
                    <th>Receptor</th><th>Rol receptor</th><th>Fecha</th><th>UV est.</th><th>UV real</th><th>Estado</th><th>Acciones</th>
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
                <td>${getUserName(tx.creado_por)}</td>
                <td>${tx.rol_emisor}</td>
                <td>${getUserName(tx.recibido_por)}</td>
                <td>${tx.rol_receptor}</td>
                <td>${fecha}</td>
                <td>${tx.uv_estimado}</td>
                <td>${tx.uv_real !== null ? tx.uv_real : '—'}</td>
                <td><span class="badge ${estadoClass}">${tx.estado}</span></td>
                <td>
                    ${tx.estado === 'pendiente' && (tx.recibido_por === (window.usuarioActual || '@masterproject')) ? 
                        '<button class="evaluar-btn" data-tx-id="' + tx.id + '">Evaluar</button>' : ''}
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
        if (filtroEstado?.value) transacciones = transacciones.filter(tx => tx.estado === filtroEstado.value);
        if (filtroUsuario?.value) transacciones = transacciones.filter(tx => tx.creado_por === filtroUsuario.value || tx.recibido_por === filtroUsuario.value);
        if (filtroFecha?.value) transacciones = transacciones.filter(tx => tx.fecha.startsWith(filtroFecha.value));
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

    document.querySelectorAll('.evaluar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            alert(`Evaluar transacción ${e.target.dataset.txId} - en desarrollo`);
        });
    });
}

console.log('✅ project.js cargado correctamente');
