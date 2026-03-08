// v5/js/views/TeamView.js
import { store } from '../core/store.js';

export default class TeamView {
    constructor() {
        document.title = "Tripulación & DAO | TeamTowers";
        this.activeProjectId = null;
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', sans-serif; }
                
                /* Sidebar (Consistente) */
                .sidebar {
                    width: 260px; background: rgba(15, 15, 20, 0.95); border-right: 1px solid rgba(255,255,255,0.05);
                    padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 10px; z-index: 10;
                }
                .project-context-header { 
                    padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1.5rem; 
                }
                .project-context-header h3 { font-size: 1rem; margin: 0 0 5px 0; color: white; }
                .project-context-header p { font-size: 0.7rem; color: #00b0ff; text-transform: uppercase; font-weight: bold; margin: 0;}
                
                .side-link {
                    padding: 0.8rem 1rem; border-radius: 8px; cursor: pointer; color: #888; text-decoration: none;
                    font-size: 0.85rem; display: flex; align-items: center; gap: 10px; transition: all 0.2s;
                }
                .side-link:hover { background: rgba(255,255,255,0.05); color: white; }
                .side-link.active { background: rgba(0, 176, 255, 0.1); color: #00b0ff; font-weight: bold; border-left: 3px solid #00b0ff; }

                /* Workspace */
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; }
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: #888; font-size: 0.95rem; margin-top: 5px; }

                /* GRID 2 COLUMNAS: USUARIOS VS ROLES */
                .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

                /* PANEL: TALENT POOL */
                .panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.5rem; }
                .panel-title { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
                
                .user-card { background: #121216; border: 1px solid #222; border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; transition: border-color 0.2s; }
                .user-card:hover { border-color: #00b0ff; }
                .avatar { width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 1.2rem; border: 2px solid #333; }
                .user-info flex { flex-direction: column; }
                .user-name { color: white; font-weight: bold; font-size: 1rem; margin-bottom: 3px; }
                .user-id { color: #666; font-family: monospace; font-size: 0.75rem; }

                /* PANEL: ASIGNACIÓN DE ROLES */
                .role-slot { background: #0f0f14; border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
                .role-slot.assigned { border-style: solid; border-color: rgba(0, 230, 118, 0.3); background: rgba(0, 230, 118, 0.02); }
                .role-meta { display: flex; flex-direction: column; gap: 5px; width: 50%; }
                
                .form-control { background: #050505; border: 1px solid #333; color: white; padding: 8px 12px; border-radius: 6px; font-family: inherit; font-size: 0.9rem; outline: none; width: 100%; transition: border-color 0.2s; }
                .form-control:focus { border-color: #00b0ff; }

                /* BOTONES GOOGLE Y ACCIÓN */
                .btn-google { background: white; color: #333; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 0.9rem; transition: transform 0.2s; }
                .btn-google:hover { transform: scale(1.02); box-shadow: 0 5px 15px rgba(255,255,255,0.2); }
                .btn-google img { width: 18px; height: 18px; }

                .btn-invite { background: transparent; border: 1px solid #00b0ff; color: #00b0ff; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; }
                .btn-invite:hover { background: rgba(0, 176, 255, 0.1); }
            </style>

            <div class="app-layout">
                <aside class="sidebar">
                    <div style="font-weight: bold; font-family: monospace; color: white; margin-bottom: 2rem; font-size: 1.2rem;">
                        🗼 TeamTowers
                    </div>
                    <div class="project-context-header">
                        <h3 id="projNameSide">Cargando...</h3>
                        <p id="projArchSide">--</p>
                    </div>
                    <a href="/v5/project" class="side-link" data-link>📋 Kanban (Tracción)</a>
                    <a href="/v5/map" class="side-link" data-link>🌐 Mapa VNA (Diseño)</a>
                    <a href="/v5/team" class="side-link active" data-link>👥 Tripulación & DAO</a>
                    <a href="/v5/ledger" class="side-link" data-link>⚖️ Ledger (Equity)</a>
                </aside>

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1>👥 Gestión de Talentos & Nodos</h1>
                            <p>Asigna personas reales a los Huecos del Castell. Soporta Multi-Rol.</p>
                        </div>
                        <div style="display: flex; gap: 15px;">
                            <button class="btn-invite" id="btnManualAdd">+ Invitar Manual</button>
                            <button class="btn-google" id="btnGoogleAuth">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google">
                                Entrar con Google
                            </button>
                        </div>
                    </div>

                    <div class="team-grid">
                        
                        <div class="panel">
                            <div class="panel-title">
                                <span>Talent Pool (Nodos Activos)</span>
                                <span class="badge" id="userCount" style="background: #222; color: #888;">0</span>
                            </div>
                            <div id="usersList">
                                </div>
                        </div>

                        <div class="panel">
                            <div class="panel-title">
                                <span>Asignación de Sillas (Roles)</span>
                            </div>
                            <div id="rolesList">
                                </div>
                        </div>

                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        let project = state.projects[state.projects.length - 1];
        if (!project) return;
        this.activeProjectId = project.id;
        
        document.getElementById('projNameSide').innerText = project.nombre;
        document.getElementById('projArchSide').innerText = `MODO: ${project.archetype.toUpperCase()}`;

        this.renderUsers(project, state.globalUsers);
        this.renderRoles(project, state.globalUsers);

        // LÓGICA DE BOTONES (SIMULACIONES DE ALTA)
        document.getElementById('btnGoogleAuth').addEventListener('click', () => {
            // Aquí iría el SDK real: google.accounts.id.prompt();
            // Por ahora simulamos una respuesta exitosa de Google
            const randomId = Math.floor(Math.random() * 9000) + 1000;
            const mockGoogleUser = {
                id: `@g_user_${randomId}`,
                name: `Google User ${randomId}`,
                walletOrSocial: 'google_auth_token_mock'
            };
            this.handleNewUser(mockGoogleUser);
        });

        document.getElementById('btnManualAdd').addEventListener('click', () => {
            const name = prompt("Introduce el nombre del nuevo miembro:");
            if (name) {
                const newUser = {
                    id: `@${name.toLowerCase().replace(/\s+/g, '')}_${Math.floor(Math.random()*100)}`,
                    name: name,
                    walletOrSocial: 'manual_entry'
                };
                this.handleNewUser(newUser);
            }
        });
    }

    handleNewUser(userObj) {
        try {
            store.dispatch({
                type: 'ADD_USER',
                payload: {
                    projectId: this.activeProjectId,
                    userId: userObj.id,
                    id: userObj.id,
                    name: userObj.name,
                    walletOrSocial: userObj.walletOrSocial
                }
            });
            this.executeViewScript(); // Recargar UI
        } catch (e) {
            alert(e.message);
        }
    }

    renderUsers(project, globalUsers) {
        const container = document.getElementById('usersList');
        const projUsers = project.usuarios || [];
        document.getElementById('userCount').innerText = projUsers.length;
        container.innerHTML = '';

        if (projUsers.length === 0) {
            container.innerHTML = `<p style="color:#666; font-size:0.9rem;">No hay usuarios. Invita a alguien.</p>`;
            return;
        }

        const colors = ['#ff5252', '#00b0ff', '#e040fb', '#00e676', '#ff9100'];

        projUsers.forEach((u, i) => {
            // Rescatamos los datos del usuario del pool global del Kernel
            const fullUser = globalUsers.find(g => g.id === u.id);
            if (!fullUser) return;

            const initial = fullUser.name.charAt(0).toUpperCase();
            const color = colors[i % colors.length];

            // Buscar si ya tiene Slices acumulados (reputación)
            const harvest = store.calculateHarvest(this.activeProjectId) || [];
            const userHarvest = harvest.find(h => h.userId === fullUser.id);
            const slicesStr = userHarvest ? `<span style="color:#00e676; font-weight:bold;">${Math.round(userHarvest.slices)} Slices</span>` : '<span style="color:#666;">Sin Slices</span>';

            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <div class="avatar" style="border-color: ${color}; color: ${color};">${initial}</div>
                <div class="user-info">
                    <div class="user-name">${fullUser.name}</div>
                    <div class="user-id">${fullUser.id}</div>
                </div>
                <div style="margin-left: auto; font-size: 0.8rem; text-align: right;">
                    ${slicesStr}
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderRoles(project, globalUsers) {
        const container = document.getElementById('rolesList');
        const roles = project.roles.filter(r => !r.isArchived);
        const asignaciones = project.asignaciones || [];
        const projUsers = project.usuarios || [];
        container.innerHTML = '';

        // Pre-construir las opciones del desplegable (solo usuarios del proyecto)
        let optionsHtml = `<option value="">-- Silla Vacía --</option>`;
        projUsers.forEach(u => {
            const fullUser = globalUsers.find(g => g.id === u.id);
            if(fullUser) optionsHtml += `<option value="${fullUser.id}">${fullUser.name} (${fullUser.id})</option>`;
        });

        roles.forEach(rol => {
            const assignment = asignaciones.find(a => a.roleId === rol.id);
            const isAssigned = !!assignment;
            
            const slot = document.createElement('div');
            slot.className = `role-slot ${isAssigned ? 'assigned' : ''}`;
            
            const color = this.getColorForLevel(rol.levelId);

            slot.innerHTML = `
                <div class="role-meta">
                    <div style="color: white; font-weight: bold; font-size: 0.95rem;">${rol.name}</div>
                    <div style="color: ${color}; font-size: 0.75rem; font-family: monospace;">${rol.levelId} | FMV: ${rol.fmv}€/h</div>
                </div>
                <div style="width: 45%;">
                    <select class="form-control user-select" data-roleid="${rol.id}">
                        ${optionsHtml}
                    </select>
                </div>
            `;

            // Marcar el select si ya está asignado
            const selectEl = slot.querySelector('.user-select');
            if (isAssigned) selectEl.value = assignment.userId;

            // Escuchar cambios para asignar el usuario
            selectEl.addEventListener('change', (e) => {
                const selectedUserId = e.target.value;
                if (selectedUserId !== "") {
                    store.dispatch({
                        type: 'ASSIGN_USER_ROLE',
                        payload: { projectId: this.activeProjectId, roleId: rol.id, userId: selectedUserId }
                    });
                }
                // (Podríamos añadir lógica para "desasignar", pero para el MVP con esto vale)
                this.executeViewScript(); // Recargar colores y bordes
            });

            container.appendChild(slot);
        });
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' };
        return colors[levelId] || '#ffffff';
    }
}
