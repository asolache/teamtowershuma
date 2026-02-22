// /v3/js/pages/project.js
// ... (todo el código anterior, pero reemplazar la función setupRolesTab y añadir las funciones necesarias)

// En setupRolesTab, reemplazar el event listener de add-role-btn
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

// Nueva función para mostrar formulario de añadir rol
function showAddRoleForm(projectId) {
    const project = window.store?.getState?.()?.projects.find(p => p.id === projectId);
    if (!project) return;

    // Obtener roles globales disponibles (del store)
    const availableRoles = window.store?.getState?.()?.roles || [];
    
    // También podemos incluir roles personalizados ya existentes en el proyecto para no duplicar
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
            // Usar rol del catálogo
            const selectedRole = availableRoles.find(r => r.id === selectedRoleId);
            newRoleId = selectedRole.id;
            newRoleName = selectedRole.nombre || selectedRole.id;
        } else if (customRoleId) {
            // Usar rol personalizado
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

        // Verificar si ya existe en el proyecto
        if (project.roles.some(r => r.id === newRoleId)) {
            alert(`El rol ${newRoleId} ya existe en el proyecto`);
            return;
        }

        // Crear nuevo rol
        const newRole = {
            id: newRoleId,
            nombre: newRoleName,
            usuarios_autorizados: [],
            entregables: []
        };

        // Añadir al proyecto
        project.roles.push(newRole);
        window.store.updateProject(projectId, project);

        // Volver a la pestaña de roles
        loadTabContent(projectId, 'roles');
    });

    document.getElementById('cancel-add-role').addEventListener('click', () => {
        loadTabContent(projectId, 'roles');
    });
}
