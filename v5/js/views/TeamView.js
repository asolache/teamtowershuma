// v5/js/views/TeamView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class TeamView {
    constructor() {
        document.title = "Equipo | TeamTowers SOS";
        this.activeProjectId = null;
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; position: relative;}
                
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px; border-bottom: 1px solid var(--glass-border); padding-bottom: 1.5rem;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; }
                .view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

                .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 1.5rem; }
                .panel-title { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px;}
                
                /* CARDS DEL PROYECTO */
                .user-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 1rem; display: flex; align-items: center; gap: 15px; margin-bottom: 10px; transition: all 0.2s; cursor: pointer; position: relative;}
                .user-card:hover { border-color: var(--accent-blue); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 176, 255, 0.1); }
                .avatar { width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 1.2rem; border: 2px solid #333; flex-shrink: 0;}
                .user-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
                .user-name { color: white; font-weight: bold; font-size: 1rem; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 5px;}
                .user-id { color: #666; font-family: var(--font-mono); font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .po-badge { background: rgba(255, 171, 64, 0.1); color: var(--accent-orange); border: 1px solid rgba(255, 171, 64, 0.3); font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;}

                /* ASIGNACIÓN DE SILLAS */
                .role-slot { background: rgba(0,0,0,0.3); border: 1px dashed var(--glass-border); border-radius: var(--border-radius-md); padding: 1rem; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; gap: 15px; transition: all 0.3s;}
                .role-slot.assigned { border-style: solid; border-color: rgba(0, 230, 118, 0.3); background: rgba(0, 230, 118, 0.02); }
                .role-meta { display: flex; flex-direction: column; gap: 5px; flex: 1;}
                .form-control { background: #050505; border: 1px solid #333; color: white; padding: 8px 12px; border-radius: 6px; font-family: inherit; font-size: 0.9rem; outline: none; width: 100%; transition: border-color 0.2s; box-sizing: border-box; }
                .form-control:focus { border-color: var(--accent-blue); }
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px; font-weight: bold; }

                .ai-match-badge { font-size: 0.7rem; color: var(--accent-purple); background: rgba(224, 64, 251, 0.1); border: 1px solid rgba(224, 64, 251, 0.3); padding: 4px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px; margin-top: 8px; cursor: pointer; transition: all 0.2s; font-family: var(--font-mono);}
                .ai-match-badge:hover { background: rgba(224, 64, 251, 0.2); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(224, 64, 251, 0.2);}

                /* BOTONES DE ACCIÓN */
                .btn-invite { background: transparent; border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.9rem; transition: background 0.2s; height: 40px; display: flex; align-items: center; justify-content: center;}
                .btn-invite:hover { background: rgba(0, 176, 255, 0.1); }
                .btn-primary { background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple)); border: none; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;}
                .btn-outline { background: transparent; border: 1px solid #333; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
                .btn-outline:hover { background: rgba(255,255,255,0.05); border-color: #666; }

                /* MODAL PERFIL USUARIO */
                .profile-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 3000; }
                .profile-modal { background: #121216; border: 1px solid #333; border-radius: var(--border-radius-lg); width: 500px; max-width: 90%; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8); animation: slideUp 0.3s ease-out;}
                .pm-header { padding: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 20px; align-items: center; position: relative; overflow: hidden;}
                .pm-avatar { width: 80px; height: 80px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; color: white; font-size: 2.5rem; border: 3px solid #333; z-index: 1; flex-shrink: 0;}
                .pm-info { z-index: 1; overflow: hidden; flex: 1;}
                .pm-name { font-size: 1.5rem; color: white; margin: 0 0 5px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 10px;}
                .pm-id { font-family: var(--font-mono); color: #888; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .pm-body { padding: 2rem; }
                .pm-stats { display: flex; gap: 15px; margin-bottom: 1.5rem; }
                .pm-stat-box { flex: 1; background: rgba(0,0,0,0.5); border: 1px solid #222; padding: 15px; border-radius: 8px; text-align: center; }
                .pm-stat-val { font-size: 1.8rem; font-weight: bold; font-family: var(--font-mono); color: var(--accent-green); margin-bottom: 5px;}
                .pm-stat-label { font-size: 0.7rem; color: #666; text-transform: uppercase; letter-spacing: 1px; }
                .pm-footer { padding: 1.5rem 2rem; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;}

                /* MODAL STANDARD (PARA AÑADIR USUARIO) */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: none; justify-content: center; align-items: center; z-index: 4000; }
                .modal-content { background: var(--bg-panel); border: 1px solid #333; padding: 2rem; border-radius: 12px; width: 500px; max-width: 90%; box-shadow: 0 20px 50px rgba(0,0,0,0.8); animation: slideUp 0.3s ease-out; }

                /* SIDE-PANEL: MARKETPLACE DEL ECOSISTEMA */
                .marketplace-panel { position: fixed; top: 0; right: 0; width: 450px; max-width: 100vw; height: 100vh; background: #0a0a0f; border-left: 1px solid var(--glass-border); transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 2000; box-shadow: -15px 0 40px rgba(0,0,0,0.8); display: flex; flex-direction: column;}
                .marketplace-panel.open { transform: translateX(0); }
                .mk-header { padding: 2rem; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);}
                .mk-filters { padding: 1.5rem 2rem; background: #111; border-bottom: 1px solid #222; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;}
                .mk-list { flex: 1; overflow-y: auto; padding: 2rem;}
                
                .mk-card { background: rgba(255,255,255,0.03); border: 1px solid #333; padding: 15px; border-radius: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;}
                .mk-card-info { display: flex; flex-direction: column; gap: 5px;}
                .mk-card-name { color: white; font-weight: bold; font-size: 1.1rem; display:flex; align-items:center; gap:8px;}
                .mk-card-geo { font-size: 0.75rem; color: var(--accent-orange); font-family: var(--font-mono); text-transform: uppercase;}
                .btn-recruit { background: transparent; border: 1px solid var(--accent-green); color: var(--accent-green); padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: 0.2s;}
                .btn-recruit:hover { background: rgba(0, 230, 118, 0.1); }

                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 1024px) { .team-grid { grid-template-columns: 1fr; } }
                @media (max-width: 768px) { .app-layout { flex-direction: column; } .workspace { padding: 1rem; } .marketplace-panel { width: 100vw; } }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/team')}

                <main class="workspace">
                    <div class="view-header">
                        <div>
                            <h1 id="teamTitle">👥 Equipo</h1>
                            <p>Gestión de Talento y Asignación de Roles en este Proyecto.</p>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                            <button class="btn-primary" id="btnOpenMarketplace">🔍 Explorar Red Global</button>
                            <button class="btn-invite" id="btnManualAdd">➕ Añadir Usuario</button>
                        </div>
                    </div>

                    <div class="team-grid">
                        <div class="panel">
                            <div class="panel-title">
                                <span>Nodos en este Proyecto</span>
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

                <aside class="marketplace-panel" id="mkPanel">
                    <div class="mk-header">
                        <div>
                            <h2 style="margin:0; color:white; font-size:1.5rem;">Talento Global</h2>
                            <p style="margin:5px 0 0 0; color:#888; font-size:0.8rem;">Recluta nodos de todo tu Ecosistema</p>
                        </div>
                        <button id="btnCloseMarketplace" style="background:none; border:none; color:white; font-size:2rem; cursor:pointer;">&times;</button>
                    </div>
                    <div class="mk-filters">
                        <input type="text" id="mkSearchName" class="form-control" placeholder="Buscar nombre..." style="grid-column: span 2;">
                        <input type="text" id="mkSearchCountry" class="form-control" placeholder="País...">
                        <input type="text" id="mkSearchCity" class="form-control" placeholder="Ciudad...">
                    </div>
                    <div class="mk-list" id="mkList">
                        </div>
                </aside>

                <div class="modal-overlay" id="addUserModal">
                    <div class="modal-content">
                        <h3 style="color:white; margin-top:0;">➕ Instanciar Nuevo Usuario</h3>
                        <div style="display:flex; gap:10px;">
                            <div class="form-group" style="flex:1;">
                                <label>Alias Único (@user)</label>
                                <input type="text" id="addUAlias" class="form-control" placeholder="@alias_unico">
                            </div>
                            <div class="form-group" style="flex:2;">
                                <label>Nombre Completo</label>
                                <input type="text" id="addUName" class="form-control" placeholder="Ej: Laura Pérez">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Email (Para Invitación y OAuth)</label>
                            <input type="email" id="addUEmail" class="form-control" placeholder="correo@dominio.com">
                        </div>
                        
                        <div style="display:flex; gap:10px;">
                            <div class="form-group" style="flex:1;">
                                <label>Crypto Wallet (Web3)</label>
                                <input type="text" id="addUWallet" class="form-control" placeholder="0x... o ar...">
                            </div>
                            <div class="form-group" style="flex:1;">
                                <label>Red Social (LinkedIn/X)</label>
                                <input type="text" id="addUSocial" class="form-control" placeholder="linkedin.com/in/...">
                            </div>
                        </div>

                        <div style="display:flex; gap:10px;">
                            <div class="form-group" style="flex:1;">
                                <label>País</label>
                                <input type="text" id="addUCountry" class="form-control" placeholder="Ej: España">
                            </div>
                            <div class="form-group" style="flex:1;">
                                <label>Ciudad</label>
                                <input type="text" id="addUCity" class="form-control" placeholder="Ej: Barcelona">
                            </div>
                            <div class="form-group" style="width:80px;">
                                <label>C. Postal</label>
                                <input type="text" id="addUZip" class="form-control" placeholder="08001">
                            </div>
                        </div>
                        
                        <div style="display:flex; justify-content:space-between; margin-top:1.5rem; border-top: 1px solid #333; padding-top: 1.5rem;">
                            <button class="btn-outline" id="btnCancelAddUser">Cancelar</button>
                            <button class="btn-primary" id="btnConfirmAddUser">Registrar Usuario</button>
                        </div>
                    </div>
                </div>

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
                            
                            <div style="background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); border-radius: 8px; padding: 15px; margin-bottom: 1.5rem;">
                                <div style="font-size: 0.8rem; color: var(--accent-purple); text-transform: uppercase; font-weight: bold; margin-bottom: 10px;">🧠 Identidad y Geolocalización</div>
                                <div style="font-family: var(--font-mono); font-size: 0.85rem; color: #ccc; line-height: 1.4; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 6px; border: 1px dashed #444;" id="pmSemanticProfile"></div>
                            </div>

                            <div class="form-group" style="margin-bottom: 0;" id="govContainer"></div>
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
        
        const activeProjectId = localStorage.getItem('tt_active_project') || (state.projects.length > 0 ? state.projects[state.projects.length - 1].id : null);
        let project = state.projects.find(p => p.id === activeProjectId);

        if (!project) return;
        this.activeProjectId = project.id;
        
        // Actualizamos el título de forma dinámica
        document.getElementById('teamTitle').innerText = `👥 Equipo (${project.nombre})`;

        this.renderUsers(project, state.globalUsers);
        this.renderRoles(project, state.globalUsers);

        // -- MÓDULO MARKETPLACE LATERAL --
        const mkPanel = document.getElementById('mkPanel');
        const mkList = document.getElementById('mkList');
        
        document.getElementById('btnOpenMarketplace').addEventListener('click', () => {
            mkPanel.classList.add('open');
            this.renderMarketplace(store.getState().globalUsers, project.usuarios);
        });
        
        document.getElementById('btnCloseMarketplace').addEventListener('click', () => {
            mkPanel.classList.remove('open');
        });

        const filterMK = () => this.renderMarketplace(store.getState().globalUsers, store.getState().projects.find(p=>p.id===this.activeProjectId).usuarios);
        document.getElementById('mkSearchName').addEventListener('input', filterMK);
        document.getElementById('mkSearchCountry').addEventListener('input', filterMK);
        document.getElementById('mkSearchCity').addEventListener('input', filterMK);


        // -- FORMULARIO DRY: ALTA DE USUARIOS --
        const addUserModal = document.getElementById('addUserModal');
        
        document.getElementById('btnManualAdd').addEventListener('click', () => {
            addUserModal.style.display = 'flex';
        });

        document.getElementById('btnCancelAddUser').addEventListener('click', () => {
            addUserModal.style.display = 'none';
        });

        document.getElementById('btnConfirmAddUser').addEventListener('click', async () => {
            let alias = document.getElementById('addUAlias').value.trim();
            const name = document.getElementById('addUName').value.trim();
            const email = document.getElementById('addUEmail').value.trim();
            const wallet = document.getElementById('addUWallet').value.trim();
            const social = document.getElementById('addUSocial').value.trim();
            const country = document.getElementById('addUCountry').value.trim();
            const city = document.getElementById('addUCity').value.trim();
            const zip = document.getElementById('addUZip').value.trim();

            if (!alias || !name) return alert("El Alias y el Nombre completo son campos obligatorios.");
            if (!alias.startsWith('@')) alias = '@' + alias;

            const newUser = {
                id: alias,
                name: name,
                email: email,
                wallet: wallet,
                social: social,
                globalRole: 'network-user',
                profile: {
                    country: country,
                    city: city,
                    zip: zip,
                    structural_affinity: ['@baixos', '@dosos', '@aixecador'][Math.floor(Math.random()*3)],
                    guardian_authority: ['creator', 'hero', 'sage', 'magician'][Math.floor(Math.random()*4)]
                }
            };

            await this.handleNewUser(newUser);
            addUserModal.style.display = 'none';
            
            // Limpiamos el formulario para el siguiente uso
            document.getElementById('addUAlias').value = '';
            document.getElementById('addUName').value = '';
            document.getElementById('addUEmail').value = '';
            document.getElementById('addUWallet').value = '';
            document.getElementById('addUSocial').value = '';
            document.getElementById('addUCountry').value = '';
            document.getElementById('addUCity').value = '';
            document.getElementById('addUZip').value = '';
        });

        document.getElementById('btnCloseModal').addEventListener('click', () => {
            document.getElementById('userProfileModal').style.display = 'none';
        });
    }

    // --- MARKETPLACE GLOBAL ---
    renderMarketplace(globalUsers, projUsers) {
        const listContainer = document.getElementById('mkList');
        const sName = document.getElementById('mkSearchName').value.toLowerCase();
        const sCountry = document.getElementById('mkSearchCountry').value.toLowerCase();
        const sCity = document.getElementById('mkSearchCity').value.toLowerCase();

        listContainer.innerHTML = '';

        let candidates = globalUsers.filter(gu => !projUsers.find(pu => pu.id === gu.id));

        candidates = candidates.filter(gu => {
            const nameMatch = gu.name.toLowerCase().includes(sName);
            const countryMatch = (gu.profile?.country || '').toLowerCase().includes(sCountry);
            const cityMatch = (gu.profile?.city || '').toLowerCase().includes(sCity);
            return nameMatch && countryMatch && cityMatch;
        });

        if (candidates.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center; padding:2rem; color:#666;">No hay candidatos disponibles en el Ecosistema Global que coincidan con la búsqueda.</div>`;
            return;
        }

        candidates.forEach(gu => {
            const geoText = gu.profile?.country ? `📍 ${gu.profile.city || ''}, ${gu.profile.country}` : '🌍 Remoto Global';
            const card = document.createElement('div');
            card.className = 'mk-card';
            card.innerHTML = `
                <div class="mk-card-info">
                    <div class="mk-card-name">
                        <div style="width:24px; height:24px; background:#333; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:0.7rem;">${gu.name.charAt(0)}</div>
                        ${gu.name}
                    </div>
                    <div class="mk-card-geo">${geoText}</div>
                </div>
                <button class="btn-recruit" data-id="${gu.id}" data-name="${gu.name}">+ Reclutar</button>
            `;

            card.querySelector('.btn-recruit').addEventListener('click', async (e) => {
                await store.dispatch({
                    type: 'ADD_USER',
                    payload: { projectId: this.activeProjectId, userId: gu.id, id: gu.id, name: gu.name, globalRole: gu.globalRole }
                });
                this.executeViewScript();
            });

            listContainer.appendChild(card);
        });
    }

    async handleNewUser(userObj) {
        try {
            await store.dispatch({
                type: 'ADD_USER',
                payload: { 
                    projectId: this.activeProjectId, 
                    userId: userObj.id, 
                    id: userObj.id, 
                    name: userObj.name, 
                    email: userObj.email,
                    wallet: userObj.wallet,
                    social: userObj.social,
                    globalRole: userObj.globalRole 
                }
            });
            if (userObj.profile) {
                const currentState = store.getState();
                const uIdx = currentState.globalUsers.findIndex(u => u.id === userObj.id);
                if(uIdx > -1) {
                    currentState.globalUsers[uIdx].profile = userObj.profile;
                    store.saveState(); 
                }
            }
            this.executeViewScript();
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

                document.getElementById('pmPoBadge').style.display = pOwnerId === fullUser.id ? 'inline-block' : 'none';

                const promptBox = document.getElementById('pmSemanticProfile');
                if (fullUser.profile) {
                    const geo = fullUser.profile.country ? `📍 ${fullUser.profile.city || ''}, ${fullUser.profile.country} ${fullUser.profile.zip || ''}` : '🌍 Ubicación no definida';
                    
                    let contactInfo = '';
                    if (fullUser.wallet) contactInfo += `<br><span style="color:#888;">Wallet:</span> ${fullUser.wallet}`;
                    if (fullUser.social) contactInfo += `<br><span style="color:#888;">Social:</span> ${fullUser.social}`;

                    promptBox.innerHTML = `
                        <span style="color: var(--accent-orange); font-weight:bold; display:block; margin-bottom:8px;">${geo}</span>
                        <span style="color: var(--accent-blue);">Estructura Óptima:</span> [${(fullUser.profile.structural_affinity||[]).join(', ')}]<br>
                        <span style="color: var(--accent-purple);">Autoridad Intangible:</span> [${(fullUser.profile.guardian_authority||[]).join(', ')}]
                        ${contactInfo}
                    `;
                } else {
                    promptBox.innerHTML = '<span style="color: #888;">// Sin Identidad Fractal ni contacto.</span>';
                }

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
                    setTimeout(() => {
                        const btnPromo = document.getElementById('btnPromotePO');
                        if(btnPromo) {
                            btnPromo.addEventListener('click', async () => {
                                if(confirm(`¿Estás seguro de ceder el control del Castell a ${fullUser.name}?`)) {
                                    await store.dispatch({ type: 'PROMOTE_TO_PO', payload: { projectId: this.activeProjectId, userId: fullUser.id } });
                                    document.getElementById('userProfileModal').style.display = 'none';
                                    this.executeViewScript(); 
                                }
                            });
                        }
                    }, 50);
                } else {
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
                projUsers.forEach(u_proj => {
                    const u = globalUsers.find(g => g.id === u_proj.id);
                    if (!u || !u.profile) return;
                    let score = 0;
                    if (u.profile.structural_affinity?.includes(rol.levelId)) score += 50; 
                    if (rol.guardian && u.profile.guardian_authority?.includes(rol.guardian)) score += 35; 
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
