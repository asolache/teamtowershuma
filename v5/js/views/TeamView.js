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
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; position: relative;}
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

                .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 1.5rem; }
                .panel-title { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px;}
                
                .user-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 1rem; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; transition: all 0.2s; cursor: pointer; position: relative;}
                .user-card:hover { border-color: var(--accent-blue); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 176, 255, 0.1); }
                .avatar { width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 1.2rem; border: 2px solid #333; flex-shrink: 0;}
                .user-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
                .user-name { color: white; font-weight: bold; font-size: 1rem; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 5px;}
                .user-id { color: #666; font-family: var(--font-mono); font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                
                /* BADGE PROJECT OWNER */
                .po-badge { background: rgba(255, 171, 64, 0.1); color: var(--accent-orange); border: 1px solid rgba(255, 171, 64, 0.3); font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;}

                .role-slot { background: rgba(0,0,0,0.3); border: 1px dashed var(--glass-border); border-radius: var(--border-radius-md); padding: 1rem; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; gap: 15px; transition: all 0.3s;}
                .role-slot.assigned { border-style: solid; border-color: rgba(0, 230, 118, 0.3); background: rgba(0, 230, 118, 0.02); }
                .role-meta { display: flex; flex-direction: column; gap: 5px; flex: 1;}
                
                .form-control { background: #050505; border: 1px solid #333; color: white; padding: 8px 12px; border-radius: 6px; font-family: inherit; font-size: 0.9rem; outline: none; width: 100%; transition: border-color 0.2s; }
                .form-control:focus { border-color: var(--accent-blue); }

                .btn-invite { background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; height: 40px; display: flex; align-items: center; justify-content: center;}
                .btn-invite:hover { background: rgba(0, 176, 255, 0.1); }

                .ai-match-badge { font-size: 0.7rem; color: var(--accent-purple); background: rgba(224, 64, 251, 0.1); border: 1px solid rgba(224, 64, 251, 0.3); padding: 4px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; margin-top: 8px; cursor: pointer; transition: all 0.2s; font-family: var(--font-mono);}
                .ai-match-badge:hover { background: rgba(224, 64, 251, 0.2); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(224, 64, 251, 0.2);}

                /* MODAL PERFIL USUARIO */
                .profile-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 2000; }
                .profile-modal { background: #121216; border: 1px solid #333; border-radius: var(--border-radius-lg); width: 500px; max-width: 90%; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8); animation: slideUp 0.3s ease-out;}
                .pm-header { padding: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 20px; align-items: center; position: relative; overflow: hidden;}
                .pm-header::before { content: ''; position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(0, 176, 255, 0.2) 0%, transparent 70%); border-radius: 50%; }
                .pm-avatar { width: 80px; height: 80px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 2.5rem; border: 3px solid #333; z-index: 1; flex-shrink: 0;}
                .pm-info { z-index: 1; overflow: hidden; flex: 1;}
                .pm-name { font-size: 1.5rem; color: white; margin: 0 0 5px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 10px;}
                .pm-id { font-family: var(--font-mono); color: #888; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                
                .pm-body { padding: 2rem; }
                .pm-stats { display: flex; gap: 15px; margin-bottom: 1.5rem; }
                .pm-stat-box { flex: 1; background: rgba(0,0,0,0.5); border: 1px solid #222; padding: 15px; border-radius: 8px; text-align: center; }
                .pm-stat-val { font-size: 1.8rem; font-weight: bold; font-family: var(--font-mono); color: var(--accent-green); margin-bottom: 5px;}
                .pm-stat-label { font-size: 0.7rem; color: #666; text-transform: uppercase; letter-spacing: 1px; }

                .pm-ikigai { background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); border-radius: 8px; padding: 15px; margin-bottom: 1.5rem;}
                .pm-section-title { font-size: 0.8rem; color: var(--accent-purple); text-transform: uppercase; font-weight: bold; margin-bottom: 10px; display: flex; justify-content: space-between;}
                .pm-prompt-text { font-family: var(--font-mono); font-size: 0.85rem; color: #ccc; line-height: 1.4; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 6px; border: 1px dashed #444;}
                
                .pm-footer { padding: 1.5rem 2rem; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;}
                
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 1024px) { .team-grid { grid-template-columns: 1fr; } }
                @media (max-width: 768px) { .app-layout { flex-direction: column; } .workspace { padding: 1rem; } }
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
                            <button class="btn-invite" id="btnManualAdd">⚡ Invitar Nodo (Mock Auth)</button>
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
                                <h2 class="pm-name">
                                    <span id="pmName">Cargando...</span>
                                    <span id="pmPoBadge" class="po-badge" style="display:none;">👑 Owner</span>
                                </h2>
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
                                    <span>🧠 Identidad (Motor Semántico)</span>
                                </div>
                                <div class="pm-prompt-text" id="pmSemanticProfile"></div>
                            </div>

                            <div class="form-group" style="margin-bottom: 0;" id="govContainer">
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

        document.getElementById('btnManualAdd').addEventListener('click', async () => {
            const name = prompt("SIMULADOR DE INVITE:\nIntroduce el nombre del nuevo miembro (Ej: Laura Dev):");
            if (name) {
                const cleanName = name.toLowerCase().replace(/\s+/g, '');
                const mockProfile = {
                    vision: "Perfil autogenerado para pruebas de la Colla.",
                    structural_affinity: ['@baixos', '@dosos'][Math.floor(Math.random()*2)],
                    guardian_authority: ['creator', 'hero', 'sage'][Math.floor(Math.random()*3)],
                    guardian_growth: ['magician', 'caregiver', 'ruler'][Math.floor(Math.random()*3)]
                };
                const newUser = {
                    id: `@${cleanName}_${Math.floor(Math.random()*1000)}`,
                    name: name,
                    walletOrSocial: 'mock_auth_system',
                    globalRole: 'network-user',
                    profile: {
                        structural_affinity: [mockProfile.structural_affinity],
                        guardian_authority: [mockProfile.guardian_authority],
                        guardian_growth: [mockProfile.guardian_growth]
                    }
                };
                await this.handleNewUser(newUser);
            }
        });

        document.getElementById('btnCloseModal').addEventListener('click', () => {
            document.getElementById('userProfileModal').style.display = 'none';
        });
    }

    async handleNewUser(userObj) {
        try {
            await store.dispatch({
                type: 'ADD_USER',
                payload: { projectId: this.activeProjectId, userId: userObj.id, id: userObj.id, name: userObj.name, walletOrSocial: userObj.walletOrSocial, globalRole: userObj.globalRole }
            });
            if (userObj.profile) {
                const currentState = store.getState();
                const uIdx = currentState.globalUsers.findIndex(u => u.id === userObj.id);
                if(uIdx > -1) {
                    currentState.globalUsers[uIdx].profile = userObj.profile;
                    store.state = currentState;
                    localStorage.setItem('tt_sos_state', JSON.stringify(currentState));
                }
            }
            const updatedState = store.getState();
            this.renderUsers(updatedState.projects[updatedState.projects.length - 1], updatedState.globalUsers);
            this.renderRoles(updatedState.projects[updatedState.projects.length - 1], updatedState.globalUsers);
        } catch (e) { console.warn("Aviso:", e.message); }
    }

    renderUsers(project, globalUsers) {
        const container = document.getElementById('usersList');
        const projUsers = project.usuarios || [];
        document.getElementById('userCount').innerText = projUsers.length;
        container.innerHTML = '';

        if (projUsers.length === 0) return;

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
            
            const isPO = project.ownerId === fullUser.id;
            const crownIcon = isPO ? `<span class="po-badge" style="margin-left: 5px;">👑 Owner</span>` : '';

            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <div class="avatar" style="border-color: ${color}; color: ${color};">${initial}</div>
                <div class="user-info">
                    <div class="user-name">${fullUser.name} ${crownIcon}</div>
                    <div class="user-id">${fullUser.id}</div>
                </div>
                <div style="text-align: right; margin-right: 15px; flex-shrink: 0;">${slicesStr}</div>
                <div style="font-size: 1rem; color: var(--text-muted);">&rarr;</div>
            `;

            card.addEventListener('click', () => {
                const state = store.getState();
                const sessionRole = state.session.role;
                const activeUserId = state.session.activeUserId;
                const pOwnerId = project.ownerId;
                
                document.getElementById('pmName').innerText = fullUser.name;
                document.getElementById('pmId').innerText = fullUser.id;
                const avatarEl = document.getElementById('pmAvatar');
                avatarEl.innerText = initial;
                avatarEl.style.borderColor = color;
                avatarEl.style.color = color;
                document.getElementById('pmSlices').innerText = slices.toLocaleString();
                document.getElementById('pmHours').innerText = totalHours.toFixed(1) + 'h';

                // Mostrar u ocultar badge de Project Owner en el Modal
                document.getElementById('pmPoBadge').style.display = pOwnerId === fullUser.id ? 'inline-block' : 'none';

                const promptBox = document.getElementById('pmSemanticProfile');
                if (fullUser.profile) {
                    promptBox.innerHTML = `
                        <span style="color: var(--accent-blue);">Estructura Óptima:</span> [${(fullUser.profile.structural_affinity||[]).join(', ')}]<br>
                        <span style="color: var(--accent-purple);">Autoridad Intangible:</span> [${(fullUser.profile.guardian_authority||[]).join(', ')}]<br>
                        <span style="color: var(--accent-green);">Interés Evolutivo:</span> [${(fullUser.profile.guardian_growth||[]).join(', ')}]
                    `;
                } else {
                    promptBox.innerHTML = '<span style="color: #888;">// Sin Identidad Fractal.</span>';
                }

                // GOBERNANZA V4: Control de Permisos
                const govContainer = document.getElementById('govContainer');
                const isEcosystemOwner = sessionRole === 'ecosystem-owner';
                const isCurrentPO = pOwnerId === activeUserId;
                const canManage = isEcosystemOwner || isCurrentPO;

                if (canManage && fullUser.id !== pOwnerId) {
                    govContainer.innerHTML = `
                        <label style="font-size: 0.75rem; color: #aaa; text-transform:uppercase; margin-bottom: 5px; display:block;">🛡️ Gobernanza de Red</label>
                        <button id="btnPromotePO" class="btn-invite" style="border-color: var(--accent-orange); color: var(--accent-orange); width: 100%;">
                            👑 Ceder Propiedad (Hacer Project Owner)
                        </button>
                    `;
                    // Atar evento de promoción ASÍNCRONO
                    setTimeout(() => {
                        const btnPromo = document.getElementById('btnPromotePO');
                        if(btnPromo) {
                            btnPromo.addEventListener('click', async () => {
                                if(confirm(`¿Estás seguro de ceder el control del Castell a ${fullUser.name}?`)) {
                                    await store.dispatch({ type: 'PROMOTE_TO_PO', payload: { projectId: this.activeProjectId, userId: fullUser.id } });
                                    document.getElementById('userProfileModal').style.display = 'none';
                                    this.executeViewScript(); // Recarga la vista para ver la corona cambiar de sitio
                                }
                            });
                        }
                    }, 50);
                } else {
                    // Vista pasiva
                    govContainer.innerHTML = `
                        <label style="font-size: 0.75rem; color: #aaa; text-transform:uppercase; margin-bottom: 5px; display:block;">🛡️ Rol en la Red</label>
                        <select class="form-control" disabled style="opacity: 0.5;">
                            <option>${fullUser.id === pOwnerId ? 'Project Owner (Líder)' : 'Miembro Estándar (Lectura/Ejecución)'}</option>
                        </select>
                    `;
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

        if (roles.length === 0) return;

        let optionsHtml = `<option value="">-- Silla Vacía --</option>`;
        projUsers.forEach(u => {
            const fullUser = globalUsers.find(g => g.id === u.id);
            if(fullUser) optionsHtml += `<option value="${fullUser.id}">${fullUser.name}</option>`;
        });

        roles.forEach(rol => {
            const assignment = asignaciones.find(a => a.roleId === rol.id);
            const isAssigned = !!assignment;
            
            const slot = document.createElement('div');
            slot.className = `role-slot ${isAssigned ? 'assigned' : ''}`;
            const color = this.getColorForLevel(rol.levelId);
            
            let bestUser = null;
            let bestScore = 0;

            if (!isAssigned) {
                globalUsers.forEach(u => {
                    if (!projUsers.find(pu => pu.id === u.id) || !u.profile) return;
                    let score = 0;
                    if (u.profile.structural_affinity?.includes(rol.levelId)) score += 50; 
                    if (rol.guardian && u.profile.guardian_authority?.includes(rol.guardian)) score += 35; 
                    if (rol.guardian && u.profile.guardian_growth?.includes(rol.guardian)) score += 15; 
                    if (score > bestScore) { bestScore = score; bestUser = u; }
                });
            }

            let suggestionHtml = (!isAssigned && bestUser && bestScore > 0) ? `
                <div class="ai-match-badge" data-roleid="${rol.id}" data-userid="${bestUser.id}">
                    ✨ Sugerencia IA: <strong>${bestUser.name}</strong> (${bestScore}%)
                </div>` : '';

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

            selectEl.addEventListener('change', async (e) => {
                if (e.target.value !== "") {
                    await store.dispatch({ type: 'ASSIGN_USER_ROLE', payload: { projectId: this.activeProjectId, roleId: rol.id, userId: e.target.value } });
                }
                this.executeViewScript();
            });

            const matchBadge = slot.querySelector('.ai-match-badge');
            if (matchBadge) {
                matchBadge.addEventListener('click', async (e) => {
                    await store.dispatch({ type: 'ASSIGN_USER_ROLE', payload: { projectId: this.activeProjectId, roleId: e.currentTarget.dataset.roleid, userId: e.currentTarget.dataset.userid } });
                    this.executeViewScript();
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
