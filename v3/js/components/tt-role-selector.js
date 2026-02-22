// tt-role-selector.js - Componente para seleccionar roles de la lista casteller
// TeamTowers Humà v3.5

class TTRoleSelector extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.roles = [];
        this.filteredRoles = [];
        this.searchTerm = '';
        this.selectedRoles = [];
    }

    static get observedAttributes() {
        return ['project-id', 'selected'];
    }

    connectedCallback() {
        this.loadRoles();
        this.render();
        this.attachEvents();
    }

    attributeChangedCallback() {
        this.loadRoles();
        this.render();
        this.attachEvents();
    }

    loadRoles() {
        // Cargar todos los roles del store (71 casteller)
        const state = window.store?.getState?.() || { roles: [] };
        this.roles = state.roles || [];
        this.filteredRoles = [...this.roles];
        
        // Cargar roles ya seleccionados del proyecto si existen
        const projectId = this.getAttribute('project-id');
        if (projectId) {
            const project = state.projects?.find(p => p.id === projectId);
            this.selectedRoles = project?.roles || [];
        }
    }

    handleSearch(e) {
        this.searchTerm = e.target.value.toLowerCase();
        this.filteredRoles = this.roles.filter(rol => 
            rol.id.toLowerCase().includes(this.searchTerm) ||
            rol.name.toLowerCase().includes(this.searchTerm) ||
            (rol.level || '').toLowerCase().includes(this.searchTerm)
        );
        this.renderResults();
    }

    handleSelectRole(rol) {
        if (!this.selectedRoles.some(r => r.id === rol.id)) {
            this.selectedRoles.push(rol);
            this.dispatchEvent(new CustomEvent('role-selected', {
                detail: { role: rol, allSelected: this.selectedRoles }
            }));
        }
        this.render();
    }

    handleRemoveRole(roleId) {
        this.selectedRoles = this.selectedRoles.filter(r => r.id !== roleId);
        this.dispatchEvent(new CustomEvent('role-removed', {
            detail: { roleId, allSelected: this.selectedRoles }
        }));
        this.render();
    }

    handleCreateNew() {
        const roleName = prompt("Nombre del nuevo rol (ej: @especialista):");
        if (roleName && roleName.startsWith('@')) {
            const nuevoRol = {
                id: roleName,
                name: roleName.replace('@', ''),
                level: 'personalizado',
                multiplier: 1.0,
                color: '#94a3b8',
                skills: []
            };
            
            // Añadir al store global? O solo al proyecto?
            this.selectedRoles.push(nuevoRol);
            this.dispatchEvent(new CustomEvent('role-created', {
                detail: { role: nuevoRol, allSelected: this.selectedRoles }
            }));
            this.render();
        } else {
            alert('❌ El rol debe empezar con @');
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: system-ui, sans-serif;
                }
                .selector-container {
                    background: white;
                    border-radius: 16px;
                    padding: 20px;
                }
                .search-box {
                    width: 100%;
                    padding: 12px 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 30px;
                    font-size: 14px;
                    margin-bottom: 20px;
                }
                .search-box:focus {
                    outline: none;
                    border-color: #2563eb;
                }
                .roles-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 10px;
                    max-height: 300px;
                    overflow-y: auto;
                    padding: 10px;
                    background: #f8fafc;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }
                .role-card {
                    padding: 10px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .role-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    border-color: #2563eb;
                }
                .role-id {
                    font-weight: bold;
                    color: ${props => props.color || '#2563eb'};
                }
                .role-name {
                    font-size: 12px;
                    color: #64748b;
                }
                .selected-section {
                    margin-top: 20px;
                    border-top: 2px solid #e2e8f0;
                    padding-top: 20px;
                }
                .selected-title {
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .selected-roles {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .selected-role {
                    background: #f1f5f9;
                    padding: 6px 12px;
                    border-radius: 30px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .remove-btn {
                    background: none;
                    border: none;
                    color: #ef4444;
                    cursor: pointer;
                    font-size: 14px;
                }
                .create-btn {
                    width: 100%;
                    padding: 12px;
                    background: #10b981;
                    color: white;
                    border: none;
                    border-radius: 30px;
                    cursor: pointer;
                    font-weight: 600;
                    margin-top: 10px;
                }
                .create-btn:hover {
                    background: #059669;
                }
            </style>

            <div class="selector-container">
                <input 
                    type="text" 
                    class="search-box" 
                    placeholder="🔍 Buscar roles por nombre, ID o nivel..."
                    id="search-input"
                />
                
                <div class="roles-grid" id="roles-grid">
                    ${this.filteredRoles.map(rol => `
                        <div class="role-card" data-role-id="${rol.id}" style="border-left: 4px solid ${rol.color || '#2563eb'};">
                            <div class="role-id">${rol.id}</div>
                            <div class="role-name">${rol.name}</div>
                            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">${rol.level || 'base'}</div>
                        </div>
                    `).join('')}
                </div>

                <button class="create-btn" id="create-role-btn">
                    ➕ Crear nuevo rol personalizado
                </button>

                <div class="selected-section">
                    <div class="selected-title">✅ Roles seleccionados (${this.selectedRoles.length})</div>
                    <div class="selected-roles" id="selected-roles">
                        ${this.selectedRoles.map(rol => `
                            <span class="selected-role" style="border-left: 4px solid ${rol.color || '#2563eb'};">
                                ${rol.id}
                                <button class="remove-btn" data-role-id="${rol.id}">✕</button>
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderResults() {
        const grid = this.shadowRoot.getElementById('roles-grid');
        if (grid) {
            grid.innerHTML = this.filteredRoles.map(rol => `
                <div class="role-card" data-role-id="${rol.id}" style="border-left: 4px solid ${rol.color || '#2563eb'};">
                    <div class="role-id">${rol.id}</div>
                    <div class="role-name">${rol.name}</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 4px;">${rol.level || 'base'}</div>
                </div>
            `).join('');
            
            // Reattached events
            grid.querySelectorAll('.role-card').forEach(card => {
                card.addEventListener('click', () => {
                    const roleId = card.dataset.roleId;
                    const role = this.roles.find(r => r.id === roleId);
                    if (role) this.handleSelectRole(role);
                });
            });
        }
    }

    attachEvents() {
        // Búsqueda
        const searchInput = this.shadowRoot.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Clic en roles
        this.shadowRoot.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', () => {
                const roleId = card.dataset.roleId;
                const role = this.roles.find(r => r.id === roleId);
                if (role) this.handleSelectRole(role);
            });
        });

        // Botón crear nuevo
        const createBtn = this.shadowRoot.getElementById('create-role-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.handleCreateNew());
        }

        // Botones eliminar
        this.shadowRoot.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const roleId = btn.dataset.roleId;
                this.handleRemoveRole(roleId);
            });
        });
    }
}

customElements.define('tt-role-selector', TTRoleSelector);
console.log('✅ TTRoleSelector component loaded');
