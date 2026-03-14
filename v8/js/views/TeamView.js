// v8/js/views/TeamView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

const GEO_DATA = {
    "España": ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Bilbao", "Alicante", "Palma", "Otra..."],
    "México": ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Mérida", "Otra..."],
    "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "Tucumán", "La Plata", "Otra..."],
    "Colombia": ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Otra..."],
    "Chile": ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Otra..."],
    "Perú": ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Otra..."],
    "Estados Unidos": ["Miami", "New York", "San Francisco", "Los Angeles", "Austin", "Otra..."],
    "Otro País...": ["Otra..."]
};

export default class TeamView {
    constructor() {
        document.title = "La Colla | TeamTowers V8";
        this.activeProjectId = null;
        this.currentTab = 'nodos'; // nodos | asignaciones
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );

        let activeProjectId = localStorage.getItem('tt_active_project') || (userProjects.length > 0 ? userProjects[userProjects.length - 1].id : null);
        let project = state.projects.find(p => p.id === activeProjectId);

        if (!project) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/team')}
                    <main class="workspace" style="justify-content:center; align-items:center;">
                        <div class="glass-panel" style="text-align:center; max-width: 500px; margin: 0 auto;">
                             <div style="font-size: 5rem; margin-bottom: 1.5rem; line-height:1;">👥</div>
                             <h2 style="color:white; margin-top:0; font-weight:900; font-size:2rem;">Sin Red Asignada</h2>
                             <p style="color:var(--text-muted); margin-bottom: 2.5rem; font-size:1.1rem;">No tienes un Castell activo para gestionar talento.</p>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/team')}
                </div>
            `;
        }

        let countryOptions = `<option value="">Todos los Países</option>`;
        Object.keys(GEO_DATA).forEach(c => {
            countryOptions += `<option value="${c}">${c}</option>`;
        });

        const isPO = project && (project.ownerId === activeUserId || state.session.role === 'ecosystem-owner');

        const headerConfig = {
            title: "La Colla",
            subtitle: project.nombre,
            tagline: "Gestión de Talento, Agentes IA y Asignación de Nodos.",
            actionHtml: isPO ? `
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <button class="btn-primary" id="btnOpenMarketplace" style="background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);">🔍 Reclutar Nodos & IA</button>
                    <button class="btn-primary" id="btnManualAdd">➕ Nuevo Humano</button>
                </div>
            ` : '',
            tabs: [
                { id: 'nodos', label: '👥 Nodos Activos', active: this.currentTab === 'nodos', badge: project ? (project.usuarios || []).length : '0' },
                { id: 'asignaciones', label: '🪑 Sillas (Roles)', active: this.currentTab === 'asignaciones' }
            ]
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; scroll-behavior: smooth; width: 100%;}
                
                .tab-content { display: none; animation: fadeIn 0.3s ease-out; padding-bottom: 5rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }

                /* GRID & CARDS (LUXURY COMPACT) */
                .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; width: 100%; box-sizing: border-box;}
                
                .user-card { 
                    background: linear-gradient(145deg, rgba(25,25,30,0.8), rgba(15,15,20,0.9));
                    border: 1px solid rgba(255,255,255,0.05); 
                    border-radius: 20px; padding: 1.5rem; 
                    display: flex; align-items: center; gap: 15px; 
                    transition: all 0.3s; cursor: pointer; position: relative; 
                    backdrop-filter: blur(10px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 5px 15px rgba(0,0,0,0.3);
                    box-sizing: border-box; width: 100%;
                }
                .user-card:hover { border-color: var(--accent-blue); transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0, 176, 255, 0.15); }
                .user-card.is-ai { border-color: rgba(224, 64, 251, 0.3); }
                .user-card.is-ai:hover { border-color: var(--accent-purple); box-shadow: 0 10px 25px rgba(224, 64, 251, 0.15); }
                
                .avatar { width: 50px; height: 50px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 900; color: white; font-size: 1.3rem; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0; background: rgba(0,0,0,0.5); position: relative;}
                .avatar-status { position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #111; }
                .status-online { background: var(--accent-green); }
                .status-offline { background: #555; }

                .user-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; min-width: 0;}
                .user-name { color: white; font-weight: 900; font-size: 1.1rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px;}
                .user-id { color: #888; font-family: var(--font-mono); font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .po-badge { background: rgba(255, 171, 64, 0.15); color: var(--accent-orange); border: 1px solid rgba(255, 171, 64, 0.4); font-size: 0.65rem; padding: 3px 8px; border-radius: 6px; font-weight: 900; text-transform: uppercase; white-space: nowrap;}

                /* ASIGNACIÓN DE SILLAS (ROLES) */
                .roles-grid { display: grid; grid-template-columns: 1fr; gap: 1.2rem; max-width: 900px; margin: 0 auto; width: 100%; box-sizing: border-box;}
                .role-slot { 
                    background: linear-gradient(145deg, rgba(20, 20, 25, 0.6), rgba(10,10,15,0.8)); 
                    border: 1px dashed rgba(255,255,255,0.15); 
                    border-radius: 20px; padding: 1.5rem; 
                    display: flex; justify-content: space-between; align-items: center; gap: 20px; 
                    transition: all 0.3s; width: 100%; box-sizing: border-box; flex-wrap: wrap;
                }
                .role-slot.assigned { border-style: solid; border-color: rgba(0, 230, 118, 0.3); background: rgba(0, 230, 118, 0.05); }
                .role-meta { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 250px;}
                
                .ai-match-badge { font-size: 0.75rem; color: var(--accent-purple); background: rgba(224, 64, 251, 0.1); border: 1px solid rgba(224, 64, 251, 0.3); padding: 6px 10px; border-radius: 8px; display: inline-flex; align-items: center; gap: 5px; margin-top: 10px; cursor: pointer; transition: all 0.2s; font-family: var(--font-mono); font-weight: bold;}
                .ai-match-badge:hover { background: rgba(224, 64, 251, 0.2); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(224, 64, 251, 0.2);}

                /* FORMULARIOS Y BOTONES */
                .form-control { background: rgba(0,0,0,0.6); border: 1px solid #444; color: white; padding: 14px 15px; border-radius: 10px; font-family: inherit; font-size: 0.95rem; outline: none; width: 100%; transition: border-color 0.3s; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: inset 0 2px 5px rgba(0,0,0,0.3), 0 0 10px rgba(0,176,255,0.2);}
                .form-control:disabled { opacity: 0.5; cursor: not-allowed; }
                .form-group { margin-bottom: 15px; width: 100%;}
                .form-group label { display: block; font-size: 0.8rem; color: #aaa; text-transform: uppercase; margin-bottom: 6px; font-weight: bold; letter-spacing: 0.5px;}

                .btn-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,176,255,0.2); font-size: 0.95rem;}
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(224,64,251,0.4); filter: brightness(1.1);}
                .btn-outline { background: transparent; border: 1px solid #555; color: white; padding: 12px 24px; border-radius: 12px; font-weight:bold; cursor: pointer; transition: 0.2s; font-size: 0.95rem;}
                .btn-outline:hover { background: rgba(255,255,255,0.05); border-color: white; }

                /* MODAL PERFIL USUARIO */
                .profile-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 5000; }
                .profile-modal { background: var(--bg-dark); border: 1px solid var(--glass-border); border-radius: 24px; width: 500px; max-width: 95%; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.8); animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); border-top: 4px solid var(--accent-blue); box-sizing: border-box;}
                .pm-header { padding: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 20px; align-items: center; position: relative; background: rgba(255,255,255,0.01);}
                .pm-avatar { width: 80px; height: 80px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 900; color: white; font-size: 2.5rem; border: 3px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.5); flex-shrink: 0;}
                .pm-info { z-index: 1; overflow: hidden; flex: 1;}
                .pm-name { font-size: 1.6rem; color: white; margin: 0 0 5px 0; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 10px;}
                .pm-id { font-family: var(--font-mono); color: #888; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                
                .pm-body { padding: 2rem; max-height: 60vh; overflow-y: auto;}
                .pm-stats { display: flex; gap: 15px; margin-bottom: 1.5rem; }
                .pm-stat-box { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; text-align: center; }
                .pm-stat-val { font-size: 1.8rem; font-weight: 900; font-family: var(--font-mono); color: var(--accent-green); margin-bottom: 5px;}
                .pm-stat-label { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;}
                
                .pm-footer { padding: 1.5rem 2rem; background: rgba(0,0,0,0.6); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;}

                /* TOGGLES DE PERMISOS */
                .toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: rgba(0,0,0,0.3); border: 1px solid #333; border-radius: 10px; margin-bottom: 10px; }
                .toggle-label { color: #ccc; font-size: 0.9rem; font-weight: bold; }
                .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #444; transition: .4s; border-radius: 24px; }
                .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: var(--accent-green); }
                input:checked + .slider:before { transform: translateX(20px); }

                /* MODAL AÑADIR USUARIO */
                .modal-content { background: var(--bg-dark); border: 1px solid var(--glass-border); padding: 2.5rem; border-radius: 20px; width: 550px; max-width: 95%; box-shadow: 0 30px 60px rgba(0,0,0,0.9); animation: slideUp 0.3s ease-out; box-sizing: border-box; max-height: 90vh; overflow-y: auto; border-top: 4px solid var(--accent-blue);}

                /* MARKETPLACE SIDE PANEL */
                .marketplace-panel { position: fixed; top: 0; right: 0; width: 450px; max-width: 100vw; height: 100vh; background: rgba(10,10,14,0.98); backdrop-filter: blur(20px); border-left: 1px solid var(--glass-border); transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 4000; box-shadow: -20px 0 50px rgba(0,0,0,0.8); display: flex; flex-direction: column;}
                .marketplace-panel.open { transform: translateX(0); }
                .mk-header { padding: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);}
                .mk-filters { padding: 1.5rem 2rem; background: rgba(0,0,0,0.5); border-bottom: 1px solid rgba(255,255,255,0.05); display: grid; grid-template-columns: 1fr 1fr; gap: 12px;}
                .mk-list { flex: 1; overflow-y: auto; padding: 2rem; display: flex; flex-direction: column; gap: 15px;}
                
                .mk-card { background: linear-gradient(145deg, rgba(30,30,35,0.6), rgba(15,15,20,0.8)); border: 1px solid #333; padding: 1.2rem; border-radius: 16px; display: flex; flex-direction: column; transition: 0.2s;}
                .mk-card:hover { border-color: var(--accent-blue); transform: translateX(-5px);}
                .mk-card.ai-card { border-color: rgba(224, 64, 251, 0.3); }
                .mk-card.ai-card:hover { border-color: var(--accent-purple); box-shadow: 0 10px 25px rgba(224, 64, 251, 0.15); }
                
                .mk-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; width: 100%;}
                .mk-card-info { display: flex; flex-direction: column; gap: 6px; flex: 1;}
                .mk-card-name { color: white; font-weight: 900; font-size: 1.1rem; display:flex; align-items:center; gap:10px;}
                .mk-card-geo { font-size: 0.8rem; color: var(--accent-orange); font-family: var(--font-mono); text-transform: uppercase; font-weight:bold;}
                .mk-card-skills { font-size: 0.75rem; color: #aaa; display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;}
                .mk-card-skills span { background:rgba(255,255,255,0.05); padding:4px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);}
                
                .btn-recruit { background: transparent; border: 1px solid var(--accent-green); color: var(--accent-green); padding: 10px 16px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.2s; width: 100%; margin-top: 15px;}
                .btn-recruit:hover { background: rgba(0, 230, 118, 0.1); transform: scale(1.02);}

                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

                /* MOBILE FIXES */
                @media (max-width: 768px) {
                    .workspace { padding: 90px 1rem 120px 1rem; } 
                    
                    .role-slot { flex-direction: column; align-items: stretch; padding: 1.5rem; gap: 15px;}
                    .role-slot > div:last-child { width: 100% !important; text-align: left !important; }
                    
                    .marketplace-panel { width: 100vw; }
                    .mk-filters { grid-template-columns: 1fr; }
                    .btn-recruit { width: 100%; padding: 12px;}
                    
                    .btn-primary, .btn-outline { width: 100%; margin-bottom: 10px; padding: 14px;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/team')}

                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="tab-nodos" class="tab-content active">
                        <div class="team-grid" id="usersList"></div>
                    </div>

                    <div id="tab-asignaciones" class="tab-content">
                        <div class="roles-grid" id="rolesList"></div>
                    </div>
                </main>

                <aside class="marketplace-panel" id="mkPanel">
                    <div class="mk-header">
                        <div>
                            <h2 style="margin:0; color:white; font-size:1.6rem; font-weight:900; letter-spacing:-0.5px;">Ecosistema Global</h2>
                            <p style="margin:5px 0 0 0; color:#888; font-size:0.85rem;">Recluta talento humano y Agentes IA</p>
                        </div>
                        <button id="btnCloseMarketplace" style="background:none; border:none; color:white; font-size:2rem; cursor:pointer;">&times;</button>
                    </div>
                    <div class="mk-filters">
                        <div class="form-group" style="grid-column: 1 / -1; margin:0;">
                            <input type="text" id="mkSearchName" class="form-control" placeholder="Buscar por nombre o @alias...">
                        </div>
                        <div class="form-group" style="margin:0;">
                            <select id="mkSearchCountry" class="form-control">
                                ${countryOptions}
                            </select>
                        </div>
                        <div class="form-group" style="margin:0;">
                            <input type="text" id="mkSearchCity" class="form-control" placeholder="Ciudad exacta...">
                        </div>
                        <div class="form-group" style="grid-column: 1 / -1; margin:0;">
                            <input type="text" id="mkSearchSkills" class="form-control" placeholder="Filtrar por Skills (Ej: @anxaneta, creator)">
                        </div>
                    </div>
                    <div class="mk-list" id="mkList"></div>
                </aside>

                <div class="modal-overlay" id="addUserModal">
                    <div class="modal-content">
                        <h2 style="color:white; margin-top:0; margin-bottom:1.5rem; font-weight:900; font-size:1.8rem; letter-spacing:-1px;">➕ Nuevo Nodo Externo</h2>
                        <div style="display:flex; gap:15px; flex-wrap:wrap;">
                            <div class="form-group" style="flex:1; min-width: 200px;">
                                <label>Alias Único (@user)</label>
                                <input type="text" id="addUAlias" class="form-control" placeholder="@alias_unico">
                            </div>
                            <div class="form-group" style="flex:2; min-width: 250px;">
                                <label>Nombre Completo</label>
                                <input type="text" id="addUName" class="form-control" placeholder="Ej: Laura Pérez">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Email (Para Invitación y OAuth)</label>
                            <input type="email" id="addUEmail" class="form-control" placeholder="correo@dominio.com">
                        </div>
                        
                        <div style="display:flex; gap:15px; flex-wrap:wrap;">
                            <div class="form-group" style="flex:1; min-width: 200px;">
                                <label>Crypto Wallet (Web3)</label>
                                <input type="text" id="addUWallet" class="form-control" placeholder="0x... o ar...">
                            </div>
                            <div class="form-group" style="flex:1; min-width: 200px;">
                                <label>Red Social (LinkedIn/X)</label>
                                <input type="text" id="addUSocial" class="form-control" placeholder="linkedin.com/in/...">
                            </div>
                        </div>

                        <div style="display:flex; gap:15px; flex-wrap:wrap;">
                            <div class="form-group" style="flex:1; min-width: 150px;">
                                <label>País</label>
                                <select id="addUCountry" class="form-control">
                                    <option value="">Seleccionar...</option>
                                    ${Object.keys(GEO_DATA).map(c => `<option value="${c}">${c}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group" style="flex:1; min-width: 150px;">
                                <label>Ciudad / Población</label>
                                <select id="addUCity" class="form-control" disabled>
                                    <option value="">Primero elige país</option>
                                </select>
                                <input type="text" id="addUCityCustom" class="form-control" placeholder="Escribe tu ciudad..." style="display:none; margin-top:8px;">
                            </div>
                            <div class="form-group" style="width:100px;">
                                <label>C. Postal</label>
                                <input type="text" id="addUZip" class="form-control" placeholder="08001">
                            </div>
                        </div>
                        
                        <div style="display:flex; justify-content:space-between; margin-top:2rem; padding-top: 1.5rem; border-top: 1px dashed #333; gap:15px;">
                            <button class="btn-outline" id="btnCancelAddUser" style="flex:1;">Cancelar</button>
                            <button class="btn-primary" id="btnConfirmAddUser" style="flex:2;">Vincular Perfil</button>
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
                                    <div class="pm-stat-label">Work Orders</div>
                                </div>
                            </div>
                            
                            <div style="background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); border-radius: 16px; padding: 20px; margin-bottom: 1.5rem;">
                                <div style="font-size: 0.8rem; color: var(--accent-purple); text-transform: uppercase; font-weight: 900; margin-bottom: 12px; letter-spacing:1px;">🧠 Identidad Fractal</div>
                                <div style="font-family: var(--font-mono); font-size: 0.85rem; color: #ccc; line-height: 1.6;" id="pmSemanticProfile"></div>
                            </div>

                            <div id="govContainer"></div>
                        </div>
                        <div class="pm-footer">
                            <button class="btn-outline" id="btnCloseProfileModal" style="border:none; color: #888; padding: 10px;">Cerrar Expediente</button>
                            <div style="font-size: 0.85rem; color: var(--accent-green); font-weight:900; font-family:var(--font-mono);" id="pmValidationTag">ID Validado ✓</div>
                        </div>
                    </div>
                </div>

                ${BottomNav.getHtml('/team')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners(); 
        PageHeader.execute();

        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project) return;
        this.activeProjectId = project.id;
        
        // TABS LOGIC V8 EVENT SYNC
        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.currentTab}`);
            if(target) target.classList.add('active');
        });

        this.renderUsers(project, state.globalUsers);
        this.renderRoles(project, state.globalUsers);

        // MARKETPLACE LOGIC
        const mkPanel = document.getElementById('mkPanel');
        
        const btnOpenMarketplace = document.getElementById('btnOpenMarketplace');
        if (btnOpenMarketplace) {
            btnOpenMarketplace.addEventListener('click', () => {
                mkPanel.classList.add('open');
                this.renderMarketplace(store.getState().globalUsers, project.usuarios || []);
            });
        }
        
        document.getElementById('btnCloseMarketplace')?.addEventListener('click', () => {
            mkPanel.classList.remove('open');
        });

        const filterMK = () => this.renderMarketplace(store.getState().globalUsers, store.getState().projects.find(p=>p.id===this.activeProjectId)?.usuarios || []);
        document.getElementById('mkSearchName')?.addEventListener('input', filterMK);
        document.getElementById('mkSearchCountry')?.addEventListener('change', filterMK); 
        document.getElementById('mkSearchCity')?.addEventListener('input', filterMK);
        document.getElementById('mkSearchSkills')?.addEventListener('input', filterMK);

        // ADD USER FORM LOGIC
        const addUserModal = document.getElementById('addUserModal');
        const selCountry = document.getElementById('addUCountry');
        const selCity = document.getElementById('addUCity');
        const inpCityCustom = document.getElementById('addUCityCustom');
        
        if (selCountry && selCity) {
            selCountry.addEventListener('change', (e) => {
                const country = e.target.value;
                selCity.innerHTML = '';
                inpCityCustom.style.display = 'none';
                inpCityCustom.value = '';

                if (!country) {
                    selCity.disabled = true;
                    selCity.innerHTML = '<option value="">Primero elige país</option>';
                    return;
                }

                selCity.disabled = false;
                selCity.innerHTML = '<option value="">Selecciona Ciudad...</option>';
                
                const cities = GEO_DATA[country] || ["Otra..."];
                cities.forEach(city => {
                    selCity.innerHTML += `<option value="${city}">${city}</option>`;
                });
            });

            selCity.addEventListener('change', (e) => {
                if (e.target.value === 'Otra...') {
                    inpCityCustom.style.display = 'block';
                    inpCityCustom.focus();
                } else {
                    inpCityCustom.style.display = 'none';
                    inpCityCustom.value = '';
                }
            });
        }

        const btnManualAdd = document.getElementById('btnManualAdd');
        if (btnManualAdd) {
            btnManualAdd.addEventListener('click', () => addUserModal.style.display = 'flex');
        }

        document.getElementById('btnCancelAddUser')?.addEventListener('click', () => addUserModal.style.display = 'none');

        document.getElementById('btnConfirmAddUser')?.addEventListener('click', async () => {
            let alias = document.getElementById('addUAlias').value.trim();
            const name = document.getElementById('addUName').value.trim();
            const email = document.getElementById('addUEmail').value.trim();
            const wallet = document.getElementById('addUWallet').value.trim();
            const social = document.getElementById('addUSocial').value.trim();
            
            const country = selCountry.value;
            let city = selCity.value;
            if (city === 'Otra...') city = inpCityCustom.value.trim();
            
            const zip = document.getElementById('addUZip').value.trim();

            if (!alias || !name) return alert("El Alias y el Nombre completo son campos obligatorios.");
            if (!alias.startsWith('@')) alias = '@' + alias;

            const mockAffinities = ['@anxaneta', '@aixecador', '@dosos', '@baixos', '@pinya'];
            const mockGuardians = ['creator', 'caregiver', 'ruler', 'jester', 'everyman', 'lover', 'hero', 'outlaw', 'magician', 'innocent', 'explorer', 'sage'];
            
            const newUser = {
                id: alias, name: name, email: email, wallet: wallet, social: social, globalRole: 'network-user',
                profile: {
                    country: country, city: city, zip: zip,
                    structural_affinity: [mockAffinities[Math.floor(Math.random()*mockAffinities.length)]],
                    guardian_authority: [mockGuardians[Math.floor(Math.random()*mockGuardians.length)]]
                }
            };

            await this.handleNewUser(newUser);
            addUserModal.style.display = 'none';
            window.location.reload();
        });

        document.getElementById('btnCloseProfileModal')?.addEventListener('click', () => {
            document.getElementById('userProfileModal').style.display = 'none';
        });
    }

    renderMarketplace(globalUsers, projUsers) {
        const listContainer = document.getElementById('mkList');
        if(!listContainer) return;
        const sName = document.getElementById('mkSearchName').value.toLowerCase();
        const sCountry = document.getElementById('mkSearchCountry').value; 
        const sCity = document.getElementById('mkSearchCity').value.toLowerCase();
        const sSkills = document.getElementById('mkSearchSkills').value.toLowerCase();

        listContainer.innerHTML = '';

        let candidates = globalUsers.filter(gu => !projUsers.find(pu => pu.id === gu.id));

        candidates = candidates.filter(gu => {
            const p = gu.profile || {};
            const nameMatch = gu.name.toLowerCase().includes(sName) || gu.id.toLowerCase().includes(sName);
            const countryMatch = sCountry === "" || p.country === sCountry;
            const cityMatch = sCity === "" || (p.city || '').toLowerCase().includes(sCity);
            
            let skillsMatch = true;
            if (sSkills !== "") {
                const allSkills = [
                    ...(p.structural_affinity || []),
                    ...(p.guardian_authority || []),
                    ...(p.guardian_growth || [])
                ].join(' ').toLowerCase();
                skillsMatch = allSkills.includes(sSkills);
            }

            return nameMatch && countryMatch && cityMatch && skillsMatch;
        });

        if (candidates.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center; padding:2rem; color:#666; font-size:0.9rem;">No se encontró talento que coincida.</div>`;
            return;
        }

        candidates.forEach(gu => {
            const isAi = gu.profile?.isAi || false;
            const geoText = isAi ? '🌐 AGI Node (Vertex / Local)' : (gu.profile?.country ? `📍 ${gu.profile.city || 'Desconocida'}, ${gu.profile.country}` : '🌍 Remoto Global');
            
            let skillsHtml = '';
            if (gu.profile) {
                const arr = [...(gu.profile.structural_affinity || []), ...(gu.profile.guardian_authority || [])];
                skillsHtml = arr.slice(0, 3).map(s => `<span style="${isAi ? 'border-color:var(--accent-purple); color:var(--accent-purple);' : ''}">${s}</span>`).join('');
            }

            // Calculadora de Arbitraje IA
            let economyHtml = '';
            if (isAi) {
                const apiCost = gu.profile.apiCostPerHour || 0.15;
                const fmvAprox = 50; 
                economyHtml = `<div style="font-size:0.75rem; color:var(--accent-green); margin-top:8px; font-family:var(--font-mono); border:1px dashed var(--accent-green); padding:6px; border-radius:6px; text-align:center; background:rgba(0,230,118,0.05);">API Cost: €${apiCost}/h | Ahorro Est: ~€${(fmvAprox - apiCost).toFixed(2)}/h</div>`;
            }

            const card = document.createElement('div');
            card.className = `mk-card ${isAi ? 'ai-card' : ''}`;

            card.innerHTML = `
                <div class="mk-card-top">
                    <div class="mk-card-info">
                        <div class="mk-card-name">
                            <div style="width:32px; height:32px; background:${isAi ? 'var(--accent-purple)' : '#444'}; color:${isAi ? 'black' : 'white'}; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:1rem; flex-shrink:0;">
                                ${isAi ? '🤖' : gu.name.charAt(0).toUpperCase()}
                            </div>
                            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${gu.name}</span> 
                            <span style="font-size:0.75rem; color:${isAi ? 'var(--accent-purple)' : '#666'}; font-family:monospace;">${gu.id}</span>
                        </div>
                        <div class="mk-card-geo">${geoText}</div>
                        ${skillsHtml ? `<div class="mk-card-skills">${skillsHtml}</div>` : ''}
                    </div>
                </div>
                ${economyHtml}
                <button class="btn-recruit" data-id="${gu.id}">+ Reclutar Nodo</button>
            `;

            card.querySelector('.btn-recruit').addEventListener('click', async () => {
                await store.dispatch({
                    type: 'ADD_USER',
                    payload: { projectId: this.activeProjectId, userId: gu.id, id: gu.id, name: gu.name, walletOrSocial: gu.walletOrSocial, globalRole: gu.globalRole }
                });
                
                await store.dispatch({
                    type: 'UPDATE_PROJECT_INFO',
                    payload: {
                        projectId: this.activeProjectId,
                        updates: { usuarios: [{ id: gu.id, permissions: { canCreateWO: isAi, canApprove: false } }] }
                    }
                });

                window.location.reload(); 
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
                    userId: userObj.id, id: userObj.id, name: userObj.name, 
                    email: userObj.email, wallet: userObj.wallet, social: userObj.social, globalRole: userObj.globalRole 
                }
            });
            if (userObj.profile) {
                await store.dispatch({
                    type: 'UPDATE_USER_PROFILE',
                    payload: { userId: userObj.id, profile: userObj.profile }
                });
            }
        } catch (e) { console.warn("Aviso:", e.message); }
    }

    renderUsers(project, globalUsers) {
        const container = document.getElementById('usersList');
        if(!container) return;
        const projUsers = project.usuarios || [];
        container.innerHTML = '';

        if (projUsers.length === 0) return;

        const colors = ['var(--accent-red)', 'var(--accent-blue)', 'var(--accent-purple)', 'var(--accent-green)', 'var(--accent-orange)'];

        projUsers.forEach((u, i) => {
            const fullUser = globalUsers.find(g => g.id === u.id);
            if (!fullUser) return;

            const isAi = fullUser.profile?.isAi || false;
            const initial = isAi ? '🤖' : fullUser.name.charAt(0).toUpperCase();
            const color = isAi ? 'var(--accent-purple)' : colors[i % colors.length];
            const isOnline = fullUser.profile?.isOpenToWork || isAi; // IAs always online

            const harvest = store.calculateHarvest(this.activeProjectId) || [];
            const userHarvest = harvest.find(h => h.userId === fullUser.id);
            const slices = userHarvest ? Math.round(userHarvest.slices) : 0;
            const slicesStr = slices > 0 ? `<span style="color:var(--accent-green); font-weight:bold; font-family:var(--font-mono);">${slices} Slices</span>` : '<span style="color:#666; font-size: 0.8rem;">Sin Slices</span>';

            const userLedger = (project.ledger || []).filter(tx => tx.userId === fullUser.id);
            const totalHours = userLedger.reduce((sum, tx) => sum + (tx.horas || 0), 0);
            
            const isPO = project.ownerId === fullUser.id;
            const crownIcon = isPO ? `<span class="po-badge" style="margin-left: 5px;">👑 Owner</span>` : '';

            const card = document.createElement('div');
            card.className = `user-card ${isAi ? 'is-ai' : ''}`;
            card.innerHTML = `
                <div class="avatar" style="border-color: ${color}; color: ${color};">
                    ${initial}
                    <div class="avatar-status ${isOnline ? 'status-online' : 'status-offline'}"></div>
                </div>
                <div class="user-info">
                    <div class="user-name">${fullUser.name} ${crownIcon}</div>
                    <div class="user-id">${fullUser.id}</div>
                </div>
                <div style="text-align: right; margin-right: 15px; flex-shrink: 0;">${slicesStr}</div>
                <div style="font-size: 1.2rem; color: var(--text-muted);">&rarr;</div>
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
                document.getElementById('pmValidationTag').innerText = isAi ? "🤖 CORE AGENT ✓" : "ID Validado ✓";

                const promptBox = document.getElementById('pmSemanticProfile');
                if (fullUser.profile) {
                    const geo = isAi ? '🌐 AGI Node (Cloud)' : (fullUser.profile.country ? `📍 ${fullUser.profile.city || ''}, ${fullUser.profile.country} ${fullUser.profile.zip || ''}` : '🌍 Ubicación no definida');
                    
                    let contactInfo = '';
                    if (fullUser.wallet) contactInfo += `<br><span style="color:#888;">Wallet:</span> <span style="font-family:monospace; font-size:0.8rem;">${fullUser.wallet}</span>`;
                    if (fullUser.social) contactInfo += `<br><span style="color:#888;">Social:</span> ${fullUser.social}`;

                    // Mostrar las Skills inferidas (SBTs)
                    let skillsHtml = '';
                    if (fullUser.profile.sbt_skills && fullUser.profile.sbt_skills.length > 0) {
                        skillsHtml = `<div style="margin-top:15px; padding-top:15px; border-top:1px dashed rgba(224,64,251,0.3);">
                            <div style="color:var(--accent-purple); font-weight:bold; margin-bottom:10px;">🏅 SKILLS VALIDADOS (SBTs):</div>
                            <div style="display:flex; flex-wrap:wrap; gap:8px;">
                                ${fullUser.profile.sbt_skills.map(s => `<span style="background:rgba(224,64,251,0.1); border:1px solid rgba(224,64,251,0.3); padding:4px 8px; border-radius:6px; font-size:0.75rem;">${s.name} <b style="color:white;">Lvl.${s.level}</b></span>`).join('')}
                            </div>
                        </div>`;
                    }

                    promptBox.innerHTML = `
                        <span style="color: var(--accent-orange); font-weight:bold; display:block; margin-bottom:8px;">${geo}</span>
                        <div style="color: #ccc; margin-bottom:10px; font-style:italic;">"${fullUser.profile.vision || ''}"</div>
                        <span style="color: var(--accent-blue);">Estructura Óptima:</span> [${(fullUser.profile.structural_affinity||[]).join(', ')}]<br>
                        <span style="color: var(--accent-purple);">Autoridad Intangible:</span> [${(fullUser.profile.guardian_authority||[]).join(', ')}]
                        ${contactInfo}
                        ${skillsHtml}
                    `;
                } else {
                    promptBox.innerHTML = '<span style="color: #888;">// Sin Identidad Fractal ni contacto.</span>';
                }

                // GOBERNANZA V8
                const govContainer = document.getElementById('govContainer');
                const isEcosystemOwner = sessionRole === 'ecosystem-owner';
                const isCurrentPO = pOwnerId === activeUserId;
                const canManage = isEcosystemOwner || isCurrentPO;

                if (canManage && fullUser.id !== pOwnerId) {
                    const permissions = u.permissions || { canCreateWO: false, canApprove: false };
                    
                    govContainer.innerHTML = `
                        <div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; margin-bottom: 1.5rem;">
                            <label style="font-size: 0.8rem; color: #aaa; text-transform:uppercase; margin-bottom: 15px; display:block; font-weight:bold;">🛡️ Delegación de Poderes</label>
                            
                            <div class="toggle-row">
                                <span class="toggle-label">Puede generar tareas (Work Orders)</span>
                                <label class="switch">
                                    <input type="checkbox" id="togCreateWO" ${permissions.canCreateWO ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>

                            <button id="btnPromotePO" class="btn-outline" style="border-color: var(--accent-red); color: var(--accent-red); width: 100%; margin-top: 15px; font-weight:bold; ${isAi ? 'display:none;' : ''}">
                                👑 Ceder el Castell (Hacer PO)
                            </button>
                        </div>
                    `;

                    setTimeout(() => {
                        const togCreateWO = document.getElementById('togCreateWO');
                        if(togCreateWO) {
                            togCreateWO.addEventListener('change', async (e) => {
                                const newPerms = { ...permissions, canCreateWO: e.target.checked };
                                await store.dispatch({
                                    type: 'UPDATE_PROJECT_INFO',
                                    payload: {
                                        projectId: this.activeProjectId,
                                        updates: { usuarios: [{ id: fullUser.id, permissions: newPerms }] }
                                    }
                                });
                                u.permissions = newPerms; 
                            });
                        }

                        const btnPromo = document.getElementById('btnPromotePO');
                        if(btnPromo) {
                            btnPromo.addEventListener('click', async () => {
                                if(confirm(`¿Estás seguro de CEDER EL CONTROL TOTAL de la red a ${fullUser.name}? Dejarás de ser el Project Owner.`)) {
                                    await store.dispatch({
                                        type: 'UPDATE_PROJECT_INFO',
                                        payload: { projectId: this.activeProjectId, updates: { ownerId: fullUser.id } }
                                    });
                                    window.location.reload(); 
                                }
                            });
                        }
                    }, 50);

                } else {
                    govContainer.innerHTML = `
                        <div style="background: rgba(0,0,0,0.3); border: 1px dashed #333; border-radius: 12px; padding: 15px; text-align:center;">
                            <label style="font-size: 0.75rem; color: #888; text-transform:uppercase; margin-bottom: 5px; display:block;">🛡️ Rol en la Red</label>
                            <span style="color:white; font-weight:bold; font-family:var(--font-mono);">${fullUser.id === pOwnerId ? '👑 LÍDER DE RED (PO)' : (isAi ? '🤖 AGENTE AUTÓNOMO' : '⚔️ NODO OPERATIVO')}</span>
                        </div>
                    `;
                }

                document.getElementById('userProfileModal').style.display = 'flex';
            });

            container.appendChild(card);
        });
    }

    renderRoles(project, globalUsers) {
        const container = document.getElementById('rolesList');
        if(!container) return;
        const roles = project.roles.filter(r => !r.isArchived);
        const asignaciones = project.asignaciones || []; 
        const projUsers = project.usuarios || [];
        
        container.innerHTML = '';

        if (roles.length === 0) {
            container.innerHTML = `<div style="text-align:center; color:#888; padding:3rem; border:1px dashed #444; border-radius:16px;">No hay sillas instanciadas. Ve al Mapa VNA para diseñar la estructura de la red.</div>`;
            return;
        }

        let optionsHtml = `<option value="">-- Silla Vacía --</option>`;
        projUsers.forEach(u => {
            const fullUser = globalUsers.find(g => g.id === u.id);
            if(fullUser) optionsHtml += `<option value="${fullUser.id}">${fullUser.profile?.isAi ? '🤖 ' : ''}${fullUser.name}</option>`;
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
                    ✨ IA Match: <strong>${bestUser.profile?.isAi ? '🤖' : ''}${bestUser.name}</strong> (${bestScore}%)
                </div>` : '';

            slot.innerHTML = `
                <div class="role-meta">
                    <div style="color: white; font-weight: 900; font-size: 1.2rem; letter-spacing:-0.5px;">${rol.name}</div>
                    <div style="color: ${color}; font-size: 0.8rem; font-family: var(--font-mono); font-weight:bold; letter-spacing:0.5px;">
                        ${rol.levelId} | <span style="color:#aaa;">FMV: ${rol.fmv}€/h</span> | 🛡️ ${rol.guardian || 'Any'}
                    </div>
                </div>
                <div style="width: 45%; text-align: right; min-width: 220px;">
                    <select class="form-control user-select" data-roleid="${rol.id}" style="border-color:${isAssigned ? 'var(--accent-green)' : '#444'}; background:${isAssigned ? 'rgba(0, 230, 118, 0.05)' : 'rgba(0,0,0,0.5)'}; font-weight:bold; color:${isAssigned ? 'var(--accent-green)' : 'white'};">
                        ${optionsHtml}
                    </select>
                    ${suggestionHtml}
                </div>
            `;

            const selectEl = slot.querySelector('.user-select');
            if (isAssigned) selectEl.value = assignment.userId;

            selectEl.addEventListener('change', async (e) => {
                if (e.target.value !== "") {
                    const pInfo = store.getState().projects.find(p => p.id === this.activeProjectId);
                    const newAsignaciones = pInfo.asignaciones.filter(a => a.roleId !== rol.id);
                    newAsignaciones.push({ roleId: rol.id, userId: e.target.value, assignedAt: Date.now() });
                    
                    await store.dispatch({ 
                        type: 'UPDATE_PROJECT_INFO', 
                        payload: { projectId: this.activeProjectId, updates: { asignaciones: newAsignaciones } } 
                    });
                } else {
                    // Desasignar
                    const pInfo = store.getState().projects.find(p => p.id === this.activeProjectId);
                    const newAsignaciones = pInfo.asignaciones.filter(a => a.roleId !== rol.id);
                    await store.dispatch({ 
                        type: 'UPDATE_PROJECT_INFO', 
                        payload: { projectId: this.activeProjectId, updates: { asignaciones: newAsignaciones } } 
                    });
                }
                this.executeViewScript();
            });

            const matchBadge = slot.querySelector('.ai-match-badge');
            if (matchBadge) {
                matchBadge.addEventListener('click', async (e) => {
                    const pInfo = store.getState().projects.find(p => p.id === this.activeProjectId);
                    const rId = e.currentTarget.dataset.roleid;
                    const uId = e.currentTarget.dataset.userid;
                    const newAsignaciones = pInfo.asignaciones.filter(a => a.roleId !== rId);
                    newAsignaciones.push({ roleId: rId, userId: uId, assignedAt: Date.now() });

                    await store.dispatch({ 
                        type: 'UPDATE_PROJECT_INFO', 
                        payload: { projectId: this.activeProjectId, updates: { asignaciones: newAsignaciones } } 
                    });
                    this.executeViewScript();
                });
            }

            container.appendChild(slot);
        });
    }

    getColorForLevel(levelId) {
        const colors = { '@anxaneta': 'var(--accent-red)', '@aixecador': 'var(--accent-orange)', '@dosos': 'var(--accent-purple)', '@baixos': 'var(--accent-blue)', '@pinya': 'var(--accent-green)' };
        return colors[levelId] || '#ffffff';
    }
}
