// v5/js/views/TeamView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class TeamView {
    constructor() {
        document.title = "Tripulación & DAO | TeamTowers";
        this.activeProjectId = null;
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', sans-serif; }
                
                /* Workspace */
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; position: relative;}
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: #888; font-size: 0.95rem; margin-top: 5px; }

                .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.5rem; }
                .panel-title { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
                
                .user-card { background: #121216; border: 1px solid #222; border-radius: 12px; padding: 1rem; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; transition: all 0.2s; cursor: pointer; }
                .user-card:hover { border-color: #00b0ff; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 176, 255, 0.1); }
                .avatar { width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 1.2rem; border: 2px solid #333; flex-shrink: 0;}
                .user-info { display: flex; flex-direction: column; flex: 1; }
                .user-name { color: white; font-weight: bold; font-size: 1rem; margin-bottom: 3px; }
                .user-id { color: #666; font-family: monospace; font-size: 0.75rem; }

                .role-slot { background: #0f0f14; border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
                .role-slot.assigned { border-style: solid; border-color: rgba(0, 230, 118, 0.3); background: rgba(0, 230, 118, 0.02); }
                .role-meta { display: flex; flex-direction: column; gap: 5px; width: 50%; }
                
                .form-control { background: #050505; border: 1px solid #333; color: white; padding: 8px 12px; border-radius: 6px; font-family: inherit; font-size: 0.9rem; outline: none; width: 100%; transition: border-color 0.2s; }
                .form-control:focus { border-color: #00b0ff; }

                .btn-invite { background: transparent; border: 1px solid #00b0ff; color: #00b0ff; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; height: 40px;}
                .btn-invite:hover { background: rgba(0, 176, 255, 0.1); }

                /* MODAL PERFIL USUARIO (IKIGAI) */
                .profile-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 2000; }
                .profile-modal { background: #121216; border: 1px solid #333; border-radius: 16px; width: 500px; max-width: 90%; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8); animation: slideUp 0.3s ease-out;}
                .pm-header { padding: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 20px; align-items: center; position: relative; overflow: hidden;}
                .pm-header::before { content: ''; position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(0, 176, 255, 0.2) 0%, transparent 70%); border-radius: 50%; }
                .pm-avatar { width: 80px; height: 80px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 2.5rem; border: 3px solid #333; z-index: 1;}
                .pm-info { z-index: 1; }
                .pm-name { font-size: 1.5rem; color: white; margin: 0 0 5px 0; }
                .pm-id { font-family: monospace; color: #888; font-size: 0.85rem; }
                
                .pm-body { padding: 2rem; }
                .pm-stats { display: flex; gap: 15px; margin-bottom: 2rem; }
                .pm-stat-box { flex: 1; background: rgba(0,0,0,0.5); border: 1px solid #222; padding: 15px; border-radius: 8px; text-align: center; }
                .pm-stat-val { font-size: 1.8rem; font-weight: bold; font-family: monospace; color: #00e676; margin-bottom: 5px;}
                .pm-stat-label { font-size: 0.7rem; color: #666; text-transform: uppercase; letter-spacing: 1px; }

                /* IKIGAI & AI PROMPT SECTION */
                .pm-ikigai { background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); border-radius: 8px; padding: 15px; margin-bottom: 1.5rem;}
                .pm-section-title { font-size: 0.8rem; color: #e040fb; text-transform: uppercase; font-weight: bold; margin-bottom: 10px; display: flex; justify-content: space-between;}
                .pm-prompt-text { font-family: monospace; font-size: 0.85rem; color: #ccc; line-height: 1.4; background: #000; padding: 10px; border-radius: 6px; border: 1px solid #333;}
                
                .pm-footer { padding: 1.5rem 2rem; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;}
                
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .app-layout { flex-direction: column; }
                    .workspace { padding: 1rem; }
                    .team-grid { grid-template-columns: 1fr; }
                    .view-header { flex-direction: column; align-items: flex-start; gap: 15px; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/team')}

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1>👥 Tripulación y Nodos</h1>
                            <p>Identidad real. Asigna personas a los Huecos del Castell y revisa sus perfiles.</p>
                        </div>
                        <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                            <button class="btn-invite" id="btnManualAdd">+ Añadir Manual</button>
                            <div id="googleButtonContainer"></div>
                        </div>
                    </div>

                    <div class="team-grid">
                        <div class="panel">
                            <div class="panel-title">
                                <span>Talent Pool (Nodos Activos)</span>
                                <span class="badge" id="userCount" style="background: #222; color: #888;">0</span>
                            </div>
                            <div id="usersList"></div>
                        </div>

                        <div class="panel">
                            <div class="panel-title"><span>Asignación de Sillas (Roles)</span></div>
                            <div id="rolesList"></div>
                        </div>
                    </div>
                </main>

                <div class="profile-modal-overlay" id="userProfileModal">
                    <div class="profile-modal">
                        <div class="pm-header">
                            <div class="pm-avatar" id="pmAvatar">?</div>
                            <div class="pm-info">
                                <h2 class="pm-name" id="pmName">Cargando...</h2>
                                <div class="pm-id" id="pmId">@id</div>
                            </div>
                        </div>
                        <div class="pm-body">
                            <div class="pm-stats">
                                <div class="pm-stat-box">
                                    <div class="pm-stat-val" id="pmSlices">0</div>
                                    <div class="pm-stat-label">Slices (Equity)</div>
                                </div>
                                <div class="pm-stat-box">
                                    <div class="pm-stat-val" id="pmHours" style="color: #00b0ff;">0h</div>
                                    <div class="pm-stat-label">Horas Auditadas</div>
                                </div>
                            </div>

                            <div class="pm-ikigai">
                                <div class="pm-section-title">
                                    <span>🧠 AI System Prompt (Ikigai)</span>
                                    <span style="color: #666; font-size: 0.6rem;">V2 FEATURE</span>
                                </div>
                                <div class="pm-prompt-text">
                                    <span style="color: #888;">/* Atributos Semánticos del Nodo */</span><br>
                                    <span style="color: #00b0ff;">Skills:</span> [En análisis por Proof of Work]<br>
                                    <span style="color: #00e676;">Motivación:</span> "Aprender y escalar"<br>
                                    <span style="color: #e040fb;">Valores:</span> [Transparencia, Ejecución]<br>
                                    <br>
                                    <span style="color: #888;">// Próximamente: La IA usará este prompt para sugerir a este usuario las tareas óptimas del Kanban basadas en su Ikigai.</span>
                                </div>
                            </div>

                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="font-size: 0.75rem; color: #aaa; text-transform:uppercase; margin-bottom: 5px; display:block;">🛡️ Nivel de Permisos (Gobernanza)</label>
                                <select class="form-control" disabled style="opacity: 0.5;">
                                    <option>Miembro Estándar (Lectura/Ejecución)</option>
                                    <option>Auditor (Aprobación de Kanban)</option>
                                    <option>Project Owner (Modificación de VNA)</option>
                                </select>
                            </div>
                        </div>
                        <div class="pm-footer">
                            <button class="btn-invite" id="btnCloseModal" style="border-color: #333; color: #ccc;">Cerrar Expediente</button>
                            <a href="/v5/profile" class="btn-invite" style="border: none; background: rgba(0, 176, 255, 0.1);" data-link>Ver Ledger Completo &rarr;</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners(); // Inicializar el botón de Logout global

        const state = store.getState();
        let project = state.projects[state.projects.length - 1];
        if (!project) return;
        this.activeProjectId = project.id;

        this.renderUsers(project, state.globalUsers);
        this.renderRoles(project, state.globalUsers);

        // LÓGICA DE ALTA MANUAL
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

        // CERRAR MODAL
        document.getElementById('btnCloseModal').addEventListener('click', () => {
            document.getElementById('userProfileModal').style.display = 'none';
        });

        // GOOGLE AUTH
        if (!document.getElementById('gsi-script')) {
            const script = document.createElement('script');
            script.id = 'gsi-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            document.head.appendChild(script);
            script.onload = () => this.initGoogleAuth();
        } else {
            this.initGoogleAuth();
        }
    }

    initGoogleAuth() {
        const GOOGLE_CLIENT_ID = "778991708293-c4f7s4l4339ooldpun0eitfdb12gjfdn.apps.googleusercontent.com";
        
        if (GOOGLE_CLIENT_ID.includes("PEGAR_AQUI")) {
            document.getElementById('googleButtonContainer').innerHTML = `<div style="color: #ff9100; font-size:0.8rem; font-family:monospace; border: 1px dashed #ff9100; padding: 10px; border-radius: 6px;">[Falta Google Client ID]</div>`;
            return;
        }

        window.handleCredentialResponse = (response) => {
            try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                const newUser = {
                    id: '@' + payload.email.split('@')[0],
                    name: payload.name,
                    walletOrSocial: payload.email
                };
                this.handleNewUser(newUser);
            } catch (error) {
                console.error("Error decodificando el JWT de Google:", error);
            }
        };

        google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: window.handleCredentialResponse });
        google.accounts.id.renderButton(document.getElementById("googleButtonContainer"), { theme: "filled_black", size: "large", shape: "pill", text: "continue_with" });
    }

    handleNewUser(userObj) {
        try {
            store.dispatch({
                type: 'ADD_USER',
                payload: { projectId: this.activeProjectId, userId: userObj.id, id: userObj.id, name: userObj.name, walletOrSocial: userObj.walletOrSocial }
            });
            this.executeViewScript(); 
        } catch (e) {
            console.warn("Aviso:", e.message); 
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
            const fullUser = globalUsers.find(g => g.id === u.id);
            if (!fullUser) return;

            const initial = fullUser.name.charAt(0).toUpperCase();
            const color = colors[i % colors.length];

            // Buscar reputación (Slices acumulados)
            const harvest = store.calculateHarvest(this.activeProjectId) || [];
            const userHarvest = harvest.find(h => h.userId === fullUser.id);
            const slices = userHarvest ? Math.round(userHarvest.slices) : 0;
            const slicesStr = slices > 0 ? `<span style="color:#00e676; font-weight:bold;">${slices} Slices</span>` : '<span style="color:#666;">Sin Slices</span>';

            // Calcular Horas reales del Ledger
            const userLedger = (project.ledger || []).filter(tx => tx.userId === fullUser.id);
            const totalHours = userLedger.reduce((sum, tx) => sum + (tx.horas || 0), 0);

            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <div class="avatar" style="border-color: ${color}; color: ${color};">${initial}</div>
                <div class="user-info">
                    <div class="user-name">${fullUser.name}</div>
                    <div class="user-id">${fullUser.id}</div>
                </div>
                <div style="text-align: right; margin-right: 15px;">
                    ${slicesStr}
                </div>
                <div style="font-size: 0.8rem; color: #888;">&rarr;</div>
            `;

            // EVENTO PARA ABRIR EL EXPEDIENTE DEL USUARIO
            card.addEventListener('click', () => {
                document.getElementById('pmName').innerText = fullUser.name;
                document.getElementById('pmId').innerText = fullUser.id;
                const avatarEl = document.getElementById('pmAvatar');
                avatarEl.innerText = initial;
                avatarEl.style.borderColor = color;
                avatarEl.style.color = color;

                document.getElementById('pmSlices').innerText = slices.toLocaleString();
                document.getElementById('pmHours').innerText = totalHours.toFixed(1) + 'h';

                document.getElementById('userProfileModal').style.display = 'flex';
            });

            container.appendChild(card);
        });
    }

    renderRoles(project, globalUsers) {
        const container = document.getElementById('rolesList');
        const roles = project.roles.filter(r => !r.isArchived);
        const asignaciones = project.asignaciones || [];
        const projUsers = project.usuarios || [];
        container.innerHTML = '';

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

            const selectEl = slot.querySelector('.user-select');
            if (isAssigned) selectEl.value = assignment.userId;

            selectEl.addEventListener('change', (e) => {
                const selectedUserId = e.target.value;
                if (selectedUserId !== "") {
                    store.dispatch({
                        type: 'ASSIGN_USER_ROLE',
                        payload: { projectId: this.activeProjectId, roleId: rol.id, userId: selectedUserId }
                    });
                }
                this.executeViewScript();
            });

            container.appendChild(slot);
        });
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': '#ff5252', '@aixecador': '#ff4081', '@dosos': '#e040fb', '@baixos': '#7c4dff', '@pinya': '#536dfe' };
        return colors[levelId] || '#ffffff';
    }
}
