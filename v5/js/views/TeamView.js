// v5/js/views/TeamView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class TeamView {
    constructor() {
        document.title = "La Colla & DAO | TeamTowers";
        this.activeProjectId = null;
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                
                /* Workspace */
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; position: relative;}
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

                .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 1.5rem; }
                .panel-title { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px;}
                
                .user-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 1rem; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; transition: all 0.2s; cursor: pointer; }
                .user-card:hover { border-color: var(--accent-blue); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 176, 255, 0.1); }
                .avatar { width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 1.2rem; border: 2px solid #333; flex-shrink: 0;}
                .user-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
                .user-name { color: white; font-weight: bold; font-size: 1rem; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .user-id { color: #666; font-family: var(--font-mono); font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}

                .role-slot { background: rgba(0,0,0,0.3); border: 1px dashed var(--glass-border); border-radius: var(--border-radius-md); padding: 1rem; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; gap: 15px; transition: all 0.3s;}
                .role-slot.assigned { border-style: solid; border-color: rgba(0, 230, 118, 0.3); background: rgba(0, 230, 118, 0.02); }
                .role-meta { display: flex; flex-direction: column; gap: 5px; flex: 1;}
                
                .form-control { background: #050505; border: 1px solid #333; color: white; padding: 8px 12px; border-radius: 6px; font-family: inherit; font-size: 0.9rem; outline: none; width: 100%; transition: border-color 0.2s; }
                .form-control:focus { border-color: var(--accent-blue); }

                .btn-invite { background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; height: 40px; display: flex; align-items: center; justify-content: center;}
                .btn-invite:hover { background: rgba(0, 176, 255, 0.1); }

                /* AI MATCHING BADGE */
                .ai-match-badge { font-size: 0.7rem; color: var(--accent-purple); background: rgba(224, 64, 251, 0.1); border: 1px solid rgba(224, 64, 251, 0.3); padding: 4px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; margin-top: 8px; cursor: pointer; transition: all 0.2s; font-family: var(--font-mono);}
                .ai-match-badge:hover { background: rgba(224, 64, 251, 0.2); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(224, 64, 251, 0.2);}

                /* MODAL PERFIL USUARIO (IKIGAI) */
                .profile-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 2000; }
                .profile-modal { background: #121216; border: 1px solid #333; border-radius: var(--border-radius-lg); width: 500px; max-width: 90%; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8); animation: slideUp 0.3s ease-out;}
                .pm-header { padding: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 20px; align-items: center; position: relative; overflow: hidden;}
                .pm-header::before { content: ''; position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(0, 176, 255, 0.2) 0%, transparent 70%); border-radius: 50%; }
                .pm-avatar { width: 80px; height: 80px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 2.5rem; border: 3px solid #333; z-index: 1; flex-shrink: 0;}
                .pm-info { z-index: 1; overflow: hidden;}
                .pm-name { font-size: 1.5rem; color: white; margin: 0 0 5px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .pm-id { font-family: var(--font-mono); color: #888; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                
                .pm-body { padding: 2rem; }
                .pm-stats { display: flex; gap: 15px; margin-bottom: 2rem; }
                .pm-stat-box { flex: 1; background: rgba(0,0,0,0.5); border: 1px solid #222; padding: 15px; border-radius: 8px; text-align: center; }
                .pm-stat-val { font-size: 1.8rem; font-weight: bold; font-family: var(--font-mono); color: var(--accent-green); margin-bottom: 5px;}
                .pm-stat-label { font-size: 0.7rem; color: #666; text-transform: uppercase; letter-spacing: 1px; }

                .pm-ikigai { background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); border-radius: 8px; padding: 15px; margin-bottom: 1.5rem;}
                .pm-section-title { font-size: 0.8rem; color: var(--accent-purple); text-transform: uppercase; font-weight: bold; margin-bottom: 10px; display: flex; justify-content: space-between;}
                .pm-prompt-text { font-family: var(--font-mono); font-size: 0.85rem; color: #ccc; line-height: 1.4; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 6px; border: 1px dashed #444;}
                
                .pm-footer { padding: 1.5rem 2rem; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;}
                
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 1024px) {
                    .team-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .app-layout { flex-direction: column; }
                    .workspace { padding: 1rem; }
                    .role-slot { flex-direction: column; align-items: stretch;}
                    .role-slot > div:last-child { width: 100% !important; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/team')}

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1>👥 La Colla (Talento & Nodos)</h1>
                            <p>Identidad fractal y asignación mediante Motor de Matching Semántico.</p>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                            <button class="btn-invite" id="btnManualAdd">+ Alta Manual</button>
                            <div id="googleButtonContainer"></div>
                        </div>
                    </div>

                    <div class="team-grid">
                        <div class="panel">
                            <div class="panel-title">
                                <span>La Colla (Red Activa)</span>
                                <span class="badge" id="userCount" style="background: rgba(255,255,255,0.1); padding: 2px 10px; border-radius: 12px; font-size: 0.9rem;">0</span>
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
                                    <div class="pm-stat-val" id="pmHours" style="color: var(--accent-blue);">0h</div>
                                    <div class="pm-stat-label">Horas Auditadas</div>
                                </div>
                            </div>

                            <div class="pm-ikigai">
                                <div class="pm-section-title">
                                    <span>🧠 AI System Prompt (Identidad)</span>
                                    <span style="color: #666; font-size: 0.6rem;">V6.5 FEATURE</span>
                                </div>
                                <div class="pm-prompt-text" id="pmSemanticProfile">
                                    <span style="color: #888;">// El usuario no ha acuñado su Identidad Fractal.</span>
                                </div>
                            </div>

                            <div class="form-group" style="margin-bottom: 0;">
                                <label style="font-size: 0.75rem; color: #aaa; text-transform:uppercase; margin-bottom: 5px; display:block;">🛡️ Permisos (Gobernanza RBAC)</label>
                                <select class="form-control" disabled style="opacity: 0.5;">
                                    <option>Miembro Estándar (Lectura/Ejecución)</option>
                                    <option>Auditor (Aprobación de Kanban)</option>
                                    <option>Project Owner (Modificación de VNA)</option>
                                </select>
                            </div>
                        </div>
                        <div class="pm-footer">
                            <button class="btn-invite" id="btnCloseModal" style="border-color: #333; color: #ccc;">Cerrar Expediente</button>
                            <div style="font-size: 0.8rem; color: var(--accent-green);">ID Verificado ✓</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners(); 

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
                const cleanName = name.toLowerCase().replace(/\s+/g, '');
                const newUser = {
                    id: `@${cleanName}_${Math.floor(Math.random()*1000)}`,
                    name: name,
                    walletOrSocial: 'manual_entry',
                    globalRole: 'network-user'
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
                const cleanName = payload.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
                
                const newUser = {
                    id: `@${cleanName}`,
                    name: payload.name,
                    walletOrSocial: payload.email,
                    globalRole: 'network-user'
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
                payload: { projectId: this.activeProjectId, userId: userObj.id, id: userObj.id, name: userObj.name, walletOrSocial: userObj.walletOrSocial, globalRole: userObj.globalRole }
            });
            const state = store.getState();
            const project = state.projects[state.projects.length - 1];
            this.renderUsers(project, state.globalUsers);
            this.renderRoles(project, state.globalUsers);
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
            container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding: 2rem; border: 1px dashed var(--glass-border); border-radius: 8px;">La Colla está vacía. Invita a nuevos miembros para levantar el Castell.</p>`;
            return;
        }

        const colors = ['var(--accent-red)', 'var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-green)', 'var(--accent-orange)'];

        projUsers.forEach((u, i) => {
            const fullUser = globalUsers.find(g => g.id === u.id);
            if (!fullUser) return;

            const initial = fullUser.name.charAt(0).toUpperCase();
            const color = colors[i % colors.length];

            const harvest = store.calculateHarvest(this.activeProjectId) || [];
            const userHarvest = harvest.find(h => h.userId === fullUser.id);
            const slices = userHarvest ? Math.round(userHarvest.slices) : 0;
            const slicesStr = slices > 0 ? `<span style="color:var(--accent-green); font-weight:bold; font-family:var(--font-mono);">${slices} Slices</span>` : '<span style="color:#666; font-size: 0.8rem;">Sin Slices</span>';

            const userLedger = (project.ledger || []).filter(tx => tx.userId === fullUser.id);
            const totalHours = userLedger.reduce((sum, tx) => sum + (tx.horas || 0), 0);

            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <div class="avatar" style="border-color: ${color}; color: ${color};">${initial}</div>
                <div class="user-info">
                    <div class="user-name" title="${fullUser.name}">${fullUser.name}</div>
                    <div class="user-id" title="${fullUser.id}">${fullUser.id}</div>
                </div>
                <div style="text-align: right; margin-right: 15px; flex-shrink: 0;">
                    ${slicesStr}
                </div>
                <div style="font-size: 1rem; color: var(--text-muted);">&rarr;</div>
            `;

            card.addEventListener('click', () => {
                document.getElementById('pmName').innerText = fullUser.name;
                document.getElementById('pmId').innerText = fullUser.id;
                const avatarEl = document.getElementById('pmAvatar');
                avatarEl.innerText = initial;
                avatarEl.style.borderColor = color;
                avatarEl.style.color = color;

                document.getElementById('pmSlices').innerText = slices.toLocaleString();
                document.getElementById('pmHours').innerText = totalHours.toFixed(1) + 'h';

                const promptBox = document.getElementById('pmSemanticProfile');
                if (fullUser.profile) {
                    promptBox.innerHTML = `
                        <span style="color: var(--accent-blue);">Estructura Óptima:</span> [${(fullUser.profile.structural_affinity||[]).join(', ')}]<br>
                        <span style="color: var(--accent-purple);">Autoridad Intangible:</span> [${(fullUser.profile.guardian_authority||[]).join(', ')}]<br>
                        <span style="color: var(--accent-green);">Interés Evolutivo:</span> [${(fullUser.profile.guardian_growth||[]).join(', ')}]
                    `;
                } else {
                    promptBox.innerHTML = '<span style="color: #888;">// El usuario no ha definido su Identidad Fractal.</span>';
                }

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

        if (roles.length === 0) {
            container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding: 2rem; border: 1px dashed var(--glass-border); border-radius: 8px;">No hay sillas definidas. Diseña el Castell en el Mapa VNA.</p>`;
            return;
        }

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
            
            // MOTOR DE MATCHING SEMÁNTICO (Cálculo de compatibilidad)
            let bestUser = null;
            let bestScore = 0;

            if (!isAssigned) {
                globalUsers.forEach(u => {
                    // Solo analizamos usuarios que ya estén en el proyecto y tengan perfil
                    if (!projUsers.find(pu => pu.id === u.id) || !u.profile) return;
                    
                    let score = 0;
                    if (u.profile.structural_affinity?.includes(rol.levelId)) score += 50; // 50% Match Estructural
                    if (rol.guardian && u.profile.guardian_authority?.includes(rol.guardian)) score += 35; // 35% Match Autoridad
                    if (rol.guardian && u.profile.guardian_growth?.includes(rol.guardian)) score += 15; // 15% Match Interés
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestUser = u;
                    }
                });
            }

            let suggestionHtml = '';
            if (!isAssigned && bestUser && bestScore > 0) {
                suggestionHtml = `
                    <div class="ai-match-badge" data-roleid="${rol.id}" data-userid="${bestUser.id}" title="Basado en Identidad Fractal y 12 Guardianes">
                        ✨ Orquestador sugiere: <strong>${bestUser.name}</strong> (${bestScore}%)
                    </div>
                `;
            }

            slot.innerHTML = `
                <div class="role-meta">
                    <div style="color: white; font-weight: bold; font-size: 0.95rem;">${rol.name}</div>
                    <div style="color: ${color}; font-size: 0.75rem; font-family: var(--font-mono);">
                        ${rol.levelId} | FMV: ${rol.fmv}€/h | 🛡️ ${rol.guardian || 'N/A'}
                    </div>
                </div>
                <div style="width: 45%; text-align: right;">
                    <select class="form-control user-select" data-roleid="${rol.id}">
                        ${optionsHtml}
                    </select>
                    ${suggestionHtml}
                </div>
            `;

            const selectEl = slot.querySelector('.user-select');
            if (isAssigned) selectEl.value = assignment.userId;

            // Escuchar asignación manual
            selectEl.addEventListener('change', (e) => {
                const selectedUserId = e.target.value;
                if (selectedUserId !== "") {
                    store.dispatch({
                        type: 'ASSIGN_USER_ROLE',
                        payload: { projectId: this.activeProjectId, roleId: rol.id, userId: selectedUserId }
                    });
                }
                const updatedState = store.getState();
                const updatedProject = updatedState.projects[updatedState.projects.length - 1];
                this.renderRoles(updatedProject, updatedState.globalUsers);
            });

            // Escuchar clic en la sugerencia del Agente
            const matchBadge = slot.querySelector('.ai-match-badge');
            if (matchBadge) {
                matchBadge.addEventListener('click', (e) => {
                    const rId = e.currentTarget.dataset.roleid;
                    const uId = e.currentTarget.dataset.userid;
                    store.dispatch({
                        type: 'ASSIGN_USER_ROLE',
                        payload: { projectId: this.activeProjectId, roleId: rId, userId: uId }
                    });
                    const updatedState = store.getState();
                    const updatedProject = updatedState.projects[updatedState.projects.length - 1];
                    this.renderRoles(updatedProject, updatedState.globalUsers);
                });
            }

            container.appendChild(slot);
        });
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': '#ff4081', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-indigo)', '@pinya': 'var(--accent-blue)' };
        return colors[levelId] || '#ffffff';
    }
}
