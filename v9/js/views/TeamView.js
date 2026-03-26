// v9/js/views/TeamView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { SkillForgeModal } from '../components/SkillForgeModal.js'; 

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

// 🌌 TAXONOMÍA UNIVERSAL DEL PANTEÓN V9
const TAXONOMY = {
    'core.architecture': { icon: '🌌', label: 'Arquitectura & VNA', color: 'var(--accent-blue)' },
    'core.economy': { icon: '⚖️', label: 'Economía & Ledger', color: 'var(--accent-green)' },
    'core.cognition': { icon: '🧠', label: 'Cognición & Ontología', color: 'var(--accent-purple)' },
    'core.execution': { icon: '⚡', label: 'Ejecución & Código', color: 'var(--accent-orange)' },
    'core.culture': { icon: '🎭', label: 'Cultura & Caos', color: 'var(--accent-red)' },
    'humans': { icon: '👤', label: 'Humanidad (Nodos Biológicos)', color: '#ffffff' },
    'uncategorized': { icon: '🧩', label: 'Agentes Custom', color: '#888888' }
};

export default class TeamView {
    constructor() {
        document.title = "La Colla | TeamTowers V9";
        this.activeProjectId = null;
        this.currentTab = 'nodos'; 
        this.skillForgeModal = null;
        this.skillsCache = []; 
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
                        <div class="glass-panel" style="text-align:center; max-width: 500px; margin: 0 auto; border:1px solid #333; padding:4rem; border-radius:20px;">
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
        Object.keys(GEO_DATA).forEach(c => { countryOptions += `<option value="${c}">${c}</option>`; });

        const isPO = project && (project.ownerId === activeUserId || state.session.role === 'ecosystem-owner');

        const headerConfig = {
            title: "Padrón Neuronal",
            subtitle: project.nombre,
            tagline: "Evolución de Agentes, Asignación de Roles y Glass-Box AI.",
            actionHtml: isPO ? `
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <button class="btn-primary" id="btnOpenMarketplace" style="background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);">🔍 Reclutar Agentes & Nodos</button>
                    <button class="btn-primary" id="btnManualAdd" style="background:transparent; border:1px dashed #888; color:#ccc;">➕ Humano</button>
                </div>
            ` : '',
            tabs: [
                { id: 'nodos', label: '👥 Taxonomía de Nodos', active: this.currentTab === 'nodos', badge: project ? (project.usuarios || []).length : '0' },
                { id: 'asignaciones', label: '🪑 Sillas (Roles VNA)', active: this.currentTab === 'asignaciones' }
            ]
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; scroll-behavior: smooth; width: 100%;}
                
                .tab-content { display: none; animation: fadeIn 0.3s ease-out; padding-bottom: 5rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }

                .taxonomy-group { margin-bottom: 3rem; background: rgba(0,0,0,0.2); border-radius: 20px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.02);}
                .taxonomy-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem; padding-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.1);}
                .taxonomy-title { font-size: 1.2rem; font-weight: 900; color: white; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 10px;}
                
                .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.5rem; width: 100%; box-sizing: border-box;}
                
                .user-card { 
                    background: linear-gradient(145deg, rgba(25,25,30,0.8), rgba(15,15,20,0.9));
                    border: 1px solid rgba(255,255,255,0.05); 
                    border-radius: 16px; padding: 1.5rem; 
                    display: flex; flex-direction: column; gap: 12px; 
                    transition: all 0.3s; position: relative; 
                    backdrop-filter: blur(10px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 5px 15px rgba(0,0,0,0.3);
                    box-sizing: border-box; width: 100%; cursor: pointer;
                }
                .user-card:hover { border-color: var(--accent-blue); transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0, 176, 255, 0.15); }
                .user-card.is-ai { border-color: rgba(224, 64, 251, 0.2); background: linear-gradient(145deg, rgba(30,20,40,0.8), rgba(15,10,20,0.9));}
                .user-card.is-ai:hover { border-color: var(--accent-purple); box-shadow: 0 10px 25px rgba(224, 64, 251, 0.2); }
                
                .uc-top { display: flex; align-items: center; gap: 15px; justify-content: space-between;}
                
                .avatar { width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 900; color: white; font-size: 1.2rem; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0; background: rgba(0,0,0,0.5); position: relative;}
                .avatar-status { position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #111; }
                .status-online { background: var(--accent-green); box-shadow: 0 0 10px var(--accent-green);}
                .status-offline { background: #555; }

                .user-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; min-width: 0;}
                .user-name { color: white; font-weight: 900; font-size: 1.1rem; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px;}
                .user-id { color: #888; font-family: var(--font-mono); font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .po-badge { background: rgba(255, 171, 64, 0.15); color: var(--accent-orange); border: 1px solid rgba(255, 171, 64, 0.4); font-size: 0.65rem; padding: 2px 6px; border-radius: 6px; font-weight: 900; text-transform: uppercase;}

                .uc-roi { text-align: right; background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 10px; border: 1px dashed rgba(255,255,255,0.1); display:flex; flex-direction:column; align-items:flex-end; justify-content:center;}
                .uc-roi-val { color: var(--accent-green); font-weight: 900; font-family: var(--font-mono); font-size: 1rem;}
                .uc-roi-lbl { color: #888; font-size: 0.65rem; text-transform: uppercase; font-weight: bold;}

                .uc-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 5px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.05);}
                .universal-skill-badge { background: rgba(0,176,255,0.1); border: 1px solid rgba(0,176,255,0.3); color: var(--accent-blue); padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-family: var(--font-mono); font-weight: bold; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 5px; position:relative; z-index:2;}
                .universal-skill-badge:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 15px rgba(0,176,255,0.5); transform: translateY(-2px);}
                .universal-skill-badge.core-skill { background: rgba(224,64,251,0.1); border-color: rgba(224,64,251,0.3); color: var(--accent-purple);}
                .universal-skill-badge.core-skill:hover { background: var(--accent-purple); color: black; box-shadow: 0 0 15px rgba(224,64,251,0.5);}
                .empty-skills { color:#666; font-size:0.75rem; font-style:italic;}

                /* ROLES / SILLAS */
                .roles-grid { display: grid; grid-template-columns: 1fr; gap: 1.2rem; max-width: 900px; margin: 0 auto; width: 100%; box-sizing: border-box;}
                .role-slot { background: linear-gradient(145deg, rgba(20, 20, 25, 0.6), rgba(10,10,15,0.8)); border: 1px dashed rgba(255,255,255,0.15); border-radius: 20px; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 20px; transition: all 0.3s; width: 100%; box-sizing: border-box; flex-wrap: wrap;}
                .role-slot.assigned { border-style: solid; border-color: rgba(0, 230, 118, 0.3); background: rgba(0, 230, 118, 0.05); }
                .role-meta { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 250px;}
                
                .form-control { background: rgba(0,0,0,0.6); border: 1px solid #444; color: white; padding: 14px 15px; border-radius: 10px; font-family: inherit; font-size: 0.95rem; outline: none; width: 100%; transition: border-color 0.3s; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .btn-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,176,255,0.2); font-size: 0.95rem;}
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(224,64,251,0.4); filter: brightness(1.1);}
                
                /* 🔥 MODAL PERFIL USUARIO/AGENTE NEURONAL (EXPANDIDO PARA GLASS-BOX) */
                .profile-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 5000; }
                .profile-modal { background: var(--bg-dark); border: 1px solid var(--glass-border); border-radius: 24px; width: 850px; max-width: 95%; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.8); animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); border-top: 4px solid var(--accent-blue); box-sizing: border-box; max-height: 90vh; display:flex; flex-direction:column;}
                .pm-header { padding: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 20px; align-items: center; position: relative; background: rgba(255,255,255,0.01); flex-shrink:0;}
                .pm-avatar { width: 80px; height: 80px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 900; color: white; font-size: 2.5rem; border: 3px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.5); flex-shrink: 0;}
                .pm-info { z-index: 1; overflow: hidden; flex: 1;}
                .pm-name { font-size: 1.6rem; color: white; margin: 0 0 5px 0; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 10px;}
                .pm-id { font-family: var(--font-mono); color: #888; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                
                .pm-body { padding: 2rem; overflow-y: auto; flex:1;}
                .pm-stats { display: flex; gap: 15px; margin-bottom: 1.5rem; }
                .pm-stat-box { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; text-align: center; }
                .pm-stat-val { font-size: 1.8rem; font-weight: 900; font-family: var(--font-mono); color: var(--accent-green); margin-bottom: 5px;}
                .pm-stat-label { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;}
                
                .pm-brain-box { background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); border-radius: 16px; padding: 20px; margin-bottom: 1.5rem; }
                .pm-brain-title { font-size: 0.8rem; color: var(--accent-purple); text-transform: uppercase; font-weight: 900; margin-bottom: 12px; letter-spacing:1px; display:flex; justify-content:space-between; align-items:center;}
                .pm-brain-content { font-family: var(--font-mono); font-size: 0.85rem; color: #ccc; line-height: 1.6; white-space: pre-wrap; background:rgba(0,0,0,0.5); padding:15px; border-radius:12px; border:1px solid #333; max-height:200px; overflow-y:auto;}
                
                .pm-footer { padding: 1.5rem 2rem; background: rgba(0,0,0,0.6); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; flex-shrink:0;}
                
                .btn-lux-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; color: white; padding: 10px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.3s; text-decoration:none; display:inline-block;}
                .btn-lux-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(224,64,251,0.4); filter: brightness(1.1);}

                /* MARKETPLACE SIDE PANEL */
                .marketplace-panel { position: fixed; top: 0; right: 0; width: 450px; max-width: 100vw; height: 100vh; background: rgba(10,10,14,0.98); backdrop-filter: blur(20px); border-left: 1px solid var(--glass-border); transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 4000; display: flex; flex-direction: column;}
                .marketplace-panel.open { transform: translateX(0); }
                .mk-header { padding: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02);}
                .mk-filters { padding: 1.5rem 2rem; background: rgba(0,0,0,0.5); border-bottom: 1px solid rgba(255,255,255,0.05); display: grid; grid-template-columns: 1fr 1fr; gap: 12px;}
                .mk-list { flex: 1; overflow-y: auto; padding: 2rem; display: flex; flex-direction: column; gap: 15px;}
                .mk-card { background: linear-gradient(145deg, rgba(30,30,35,0.6), rgba(15,15,20,0.8)); border: 1px solid #333; padding: 1.2rem; border-radius: 16px; display: flex; flex-direction: column; transition: 0.2s;}
                .btn-recruit { background: transparent; border: 1px solid var(--accent-green); color: var(--accent-green); padding: 10px 16px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.2s; width: 100%; margin-top: 15px;}
                .btn-recruit:hover { background: rgba(0, 230, 118, 0.1); transform: scale(1.02);}

                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/team')}

                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="tab-nodos" class="tab-content active">
                        <div id="usersList"></div>
                    </div>

                    <div id="tab-asignaciones" class="tab-content">
                        <div class="roles-grid" id="rolesList"></div>
                    </div>
                </main>

                <div id="mount-forge-modal"></div>

                <aside class="marketplace-panel" id="mkPanel">
                    <div class="mk-header">
                        <div>
                            <h2 style="margin:0; color:white; font-size:1.6rem; font-weight:900;">Reclutamiento Global</h2>
                            <p style="margin:5px 0 0 0; color:#888; font-size:0.85rem;">Incorpora talento humano e IA a la red.</p>
                        </div>
                        <button id="btnCloseMarketplace" style="background:none; border:none; color:white; font-size:2rem; cursor:pointer;">&times;</button>
                    </div>
                    <div class="mk-filters">
                        <div class="form-group" style="grid-column: 1 / -1; margin:0;">
                            <input type="text" id="mkSearchName" class="form-control" placeholder="Buscar por nombre o @alias...">
                        </div>
                    </div>
                    <div class="mk-list" id="mkList"></div>
                </aside>

                <div class="profile-modal-overlay" id="userProfileModal">
                    <div class="profile-modal">
                        <div class="pm-header" id="pmHeaderBox">
                            <div class="pm-avatar" id="pmAvatar">?</div>
                            <div class="pm-info">
                                <h2 class="pm-name">
                                    <span id="pmName">Cargando...</span>
                                    <span id="pmPoBadge" class="po-badge" style="display:none; margin-left:10px;">👑 Owner</span>
                                </h2>
                                <div class="pm-id" id="pmId">@id</div>
                            </div>
                        </div>
                        <div class="pm-body">
                            <div class="pm-stats">
                                <div class="pm-stat-box">
                                    <div class="pm-stat-val" id="pmSlices">0</div>
                                    <div class="pm-stat-label">Slices Minados</div>
                                </div>
                                <div class="pm-stat-box">
                                    <div class="pm-stat-val" id="pmHours" style="color: var(--accent-blue);">0h</div>
                                    <div class="pm-stat-label">Esfuerzo Auditado</div>
                                </div>
                            </div>
                            
                            <div class="pm-brain-box">
                                <div class="pm-brain-title">
                                    <span>🧠 AGENT.md (System Prompt)</span>
                                    <a id="btnEditBrain" href="/v9/identity" data-link class="btn-lux-primary" style="font-size:0.7rem; padding:5px 10px;">Forjar Cerebro ↗</a>
                                </div>
                                <div class="pm-brain-content" id="pmSemanticProfile">Cargando datos de IndexedDB...</div>
                            </div>

                            <div id="pmEquippedSkills"></div>
                            
                            <div id="govContainer"></div>
                        </div>
                        <div class="pm-footer">
                            <button id="btnCloseProfileModal" style="background:transparent; border:none; color: #888; cursor:pointer; font-weight:bold; font-size:1rem;">Cerrar Expediente</button>
                            <div style="font-size: 0.85rem; color: var(--accent-green); font-weight:900; font-family:var(--font-mono);" id="pmValidationTag">ID Validado ✓</div>
                        </div>
                    </div>
                </div>

                ${BottomNav.getHtml('/team')}
            </div>
        `;
    }

    async executeViewScript() {
        console.log("🔥 TEAMVIEW V9 CARGADO - TAXONOMÍA ACTIVA Y GLASS-BOX");
        
        Sidebar.initListeners(); 
        PageHeader.execute();

        const state = store.getState();
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project) return;
        this.activeProjectId = project.id;

        // INICIALIZAR CHAT EVOLVER MODAL
        this.skillForgeModal = new SkillForgeModal('mount-forge-modal');
        await this.skillForgeModal.render();

        // CACHEAR SKILLS
        await KB.init();
        this.skillsCache = await KB.getAllNodes({ type: 'skill' });

        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.currentTab}`);
            if(target) target.classList.add('active');
        });

        window.addEventListener('refresh-lms-data', async () => {
            this.skillsCache = await KB.getAllNodes({ type: 'skill' });
            this.renderTaxonomicUsers(project, store.getState().globalUsers);
        });

        // 🔥 RENDERIZAR TABLERO TAXONÓMICO
        this.renderTaxonomicUsers(project, state.globalUsers);
        this.renderRoles(project, state.globalUsers);

        // MARKETPLACE LOGIC
        const mkPanel = document.getElementById('mkPanel');
        document.getElementById('btnOpenMarketplace')?.addEventListener('click', () => {
            mkPanel.classList.add('open');
            this.renderMarketplace(store.getState().globalUsers, project.usuarios || []);
        });
        document.getElementById('btnCloseMarketplace')?.addEventListener('click', () => mkPanel.classList.remove('open'));
        document.getElementById('mkSearchName')?.addEventListener('input', () => this.renderMarketplace(store.getState().globalUsers, store.getState().projects.find(p=>p.id===this.activeProjectId)?.usuarios || []));

        document.getElementById('btnCloseProfileModal')?.addEventListener('click', () => {
            document.getElementById('userProfileModal').style.display = 'none';
        });
    }

    renderTaxonomicUsers(project, globalUsers) {
        const container = document.getElementById('usersList');
        if(!container) return;
        const projUsers = project.usuarios || [];
        container.innerHTML = '';

        if (projUsers.length === 0) return;

        const categorizedUsers = { 'core.architecture': [], 'core.economy': [], 'core.cognition': [], 'core.execution': [], 'core.culture': [], 'humans': [], 'uncategorized': [] };

        projUsers.forEach(u => {
            const fullUser = globalUsers.find(g => g.id === u.id);
            if (!fullUser) return;

            if (!fullUser.profile?.isAi) {
                categorizedUsers['humans'].push(fullUser);
            } else {
                let cat = 'uncategorized';
                if (fullUser.profile.active_skills && fullUser.profile.active_skills.length > 0) {
                    const primarySkillId = fullUser.profile.active_skills[0];
                    const skillNode = this.skillsCache.find(s => s.id === primarySkillId);
                    if (skillNode && TAXONOMY[skillNode.category]) cat = skillNode.category;
                }
                categorizedUsers[cat].push(fullUser);
            }
        });

        Object.keys(TAXONOMY).forEach(catKey => {
            const usersInCat = categorizedUsers[catKey];
            if (usersInCat.length === 0) return;

            const taxConfig = TAXONOMY[catKey];
            
            const groupHtml = document.createElement('div');
            groupHtml.className = 'taxonomy-group';
            groupHtml.innerHTML = `
                <div class="taxonomy-header">
                    <span class="taxonomy-title" style="color: ${taxConfig.color};">${taxConfig.icon} ${taxConfig.label}</span>
                </div>
                <div class="team-grid"></div>
            `;
            
            const grid = groupHtml.querySelector('.team-grid');
            usersInCat.forEach(user => {
                grid.appendChild(this.generateUserCardElement(user, project, taxConfig.color));
            });
            
            container.appendChild(groupHtml);
        });
    }

    generateUserCardElement(fullUser, project, catColor) {
        const isAi = fullUser.profile?.isAi || false;
        const initial = isAi ? '🤖' : (fullUser.name || 'U').charAt(0).toUpperCase();
        const color = isAi ? 'var(--accent-purple)' : catColor;
        const isOnline = fullUser.profile?.isOpenToWork || isAi;

        const harvest = store.calculateHarvest(this.activeProjectId) || [];
        const userHarvest = harvest.find(h => h.userId === fullUser.id);
        const slices = userHarvest ? Math.round(userHarvest.slices) : 0;
        const totalHours = (project.ledger || []).filter(tx => tx.userId === fullUser.id).reduce((sum, tx) => sum + (tx.horas || 0), 0);

        const isPO = project.ownerId === fullUser.id;
        const crownIcon = isPO ? `<span class="po-badge">👑 PO</span>` : '';

        let skillsHtml = '<div class="empty-skills">Cinturón MCP vacío.</div>';
        const activeSkillsIds = fullUser.profile?.active_skills || [];
        
        if (activeSkillsIds.length > 0) {
            skillsHtml = activeSkillsIds.map(skillId => {
                const node = this.skillsCache.find(s => s.id === skillId);
                const title = node ? node.title.replace(' (', '<br>(') : skillId;
                const isCore = node && node.keywords && node.keywords.includes('#core_sos');
                return `<span class="universal-skill-badge ${isCore ? 'core-skill' : ''}" data-skill-id="${skillId}">🎒 ${title}</span>`;
            }).join('');
        }

        const card = document.createElement('div');
        card.className = `user-card ${isAi ? 'is-ai' : ''}`;
        card.innerHTML = `
            <div class="uc-top">
                <div style="display:flex; align-items:center; gap:15px; overflow:hidden;">
                    <div class="avatar" style="border-color: ${color}; color: ${color};">
                        ${initial}
                        <div class="avatar-status ${isOnline ? 'status-online' : 'status-offline'}"></div>
                    </div>
                    <div class="user-info">
                        <div class="user-name">${fullUser.name} ${crownIcon}</div>
                        <div class="user-id">${fullUser.id}</div>
                    </div>
                </div>
                <div class="uc-roi">
                    <div class="uc-roi-val">${slices.toLocaleString()}</div>
                    <div class="uc-roi-lbl">Slices</div>
                </div>
            </div>
            <div class="uc-skills" style="position:relative; z-index:2;">${skillsHtml}</div>
        `;

        // Prevenir que el clic en el badge abra el modal del perfil
        card.querySelectorAll('.universal-skill-badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        // 🔥 LÓGICA DE APERTURA DEL VISOR NEURONAL (CON ROBUSTEZ Y GLASS-BOX)
        card.addEventListener('click', async () => {
            try {
                document.getElementById('pmName').innerText = fullUser.name || 'Agente';
                document.getElementById('pmId').innerText = fullUser.id;
                
                const avatarEl = document.getElementById('pmAvatar');
                avatarEl.innerText = initial;
                avatarEl.style.borderColor = color;
                avatarEl.style.color = color;
                
                document.getElementById('pmSlices').innerText = slices.toLocaleString();
                document.getElementById('pmHours').innerText = totalHours.toFixed(1) + 'h';
                document.getElementById('pmPoBadge').style.display = isPO ? 'inline-block' : 'none';
                document.getElementById('pmValidationTag').innerText = isAi ? "🤖 NODO IA VERIFICADO ✓" : "ID Validado ✓";

                const btnEditBrain = document.getElementById('btnEditBrain');
                if (btnEditBrain) {
                    btnEditBrain.style.display = isAi ? 'inline-block' : 'none';
                    btnEditBrain.onclick = () => {
                        localStorage.setItem('tt_edit_agent_id', fullUser.id);
                        window.location.href = '/v9/identity';
                    };
                }

                const promptBox = document.getElementById('pmSemanticProfile');
                const skillsBox = document.getElementById('pmEquippedSkills');
                
                if (isAi) {
                    await KB.init();
                    const promptNode = await KB.getNode(`prompt_global_${fullUser.id.replace('@','')}`);
                    
                    if (promptNode) {
                        promptBox.innerText = promptNode.content;
                    } else {
                        promptBox.innerHTML = '<span style="color: var(--accent-red);">⚠️ Error Neural: El System Prompt (AGENT.md) no existe en la base de datos.</span>';
                    }
                    
                    // 🔥 GLASS-BOX AI: RENDERIZAR EL CONTENIDO COMPLETO DE CADA SKILL
                    let fullSkillsHtml = '';
                    if (activeSkillsIds.length > 0) {
                        fullSkillsHtml = activeSkillsIds.map(skillId => {
                            const node = this.skillsCache.find(s => s.id === skillId);
                            if(!node) return '';
                            return `
                                <div style="background: rgba(0,0,0,0.6); border: 1px solid #333; border-radius: 12px; margin-bottom: 12px; overflow: hidden;">
                                    <div style="padding: 10px 15px; background: rgba(0,176,255,0.05); border-bottom: 1px solid rgba(0,176,255,0.2); display:flex; justify-content:space-between; align-items:center;">
                                        <span style="color:var(--accent-blue); font-weight:bold; font-family:var(--font-mono); font-size:0.85rem;">🎒 ${node.title}</span>
                                        <button class="universal-skill-badge" data-skill-id="${skillId}" style="margin:0; padding:4px 10px; font-size:0.7rem;">Evolucionar ↗</button>
                                    </div>
                                    <div style="padding: 15px; font-family: var(--font-mono); font-size: 0.85rem; color: #ccc; white-space: pre-wrap; max-height: 250px; overflow-y: auto; line-height:1.5;">${node.content}</div>
                                </div>
                            `;
                        }).join('');
                    } else {
                        fullSkillsHtml = '<div style="color:#888; font-style:italic; font-size:0.85rem; padding:15px; border:1px dashed #333; border-radius:10px;">Cinturón vacío. Este agente solo usa su AGENT.md base.</div>';
                    }
                    
                    skillsBox.innerHTML = `
                        <div style="font-size:0.8rem; color:var(--accent-blue); text-transform:uppercase; margin-bottom:10px; font-weight:900; letter-spacing:1px; margin-top:20px;">⚙️ Códice Operativo (SOPs & SOCs)</div>
                        ${fullSkillsHtml}
                    `;
                    
                    // Asegurar que los badges de "Evolucionar" dentro del modal funcionan
                    skillsBox.querySelectorAll('.universal-skill-badge').forEach(badge => {
                        badge.addEventListener('click', (e) => {
                            e.stopPropagation();
                            document.getElementById('userProfileModal').style.display = 'none';
                            window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: badge.dataset.skillId } }));
                        });
                    });

                } else {
                    const geo = fullUser.profile?.country ? `📍 ${fullUser.profile.city || ''}, ${fullUser.profile.country}` : '🌍 Ubicación no definida';
                    let contactInfo = '';
                    if (fullUser.wallet) contactInfo += `<br><span style="color:#888;">Wallet:</span> <span style="font-family:monospace; font-size:0.8rem;">${fullUser.wallet}</span>`;
                    if (fullUser.social) contactInfo += `<br><span style="color:#888;">Social:</span> ${fullUser.social}`;

                    promptBox.innerHTML = `
                        <span style="color: var(--accent-orange); font-weight:bold; display:block; margin-bottom:8px;">${geo}</span>
                        <span style="color: var(--accent-blue);">Estructura Óptima:</span> [${(fullUser.profile?.structural_affinity||[]).join(', ')}]<br>
                        <span style="color: var(--accent-purple);">Autoridad Intangible:</span> [${(fullUser.profile?.guardian_authority||[]).join(', ')}]
                        ${contactInfo}
                    `;
                    skillsBox.innerHTML = '';
                }

                document.getElementById('userProfileModal').style.display = 'flex';
            } catch (err) {
                console.error("🔥 Error abriendo perfil:", err);
                alert("Fallo leyendo datos de la matriz. Revisa la consola.");
            }
        });

        return card;
    }

    renderMarketplace(globalUsers, projUsers) {
        const listContainer = document.getElementById('mkList');
        if(!listContainer) return;
        const sName = document.getElementById('mkSearchName').value.toLowerCase();
        listContainer.innerHTML = '';

        let candidates = globalUsers.filter(gu => !projUsers.find(pu => pu.id === gu.id));
        candidates = candidates.filter(gu => gu.name.toLowerCase().includes(sName) || gu.id.toLowerCase().includes(sName));

        if (candidates.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center; padding:2rem; color:#666; font-size:0.9rem;">No hay candidatos disponibles.</div>`;
            return;
        }

        candidates.forEach(gu => {
            const isAi = gu.profile?.isAi || false;
            const geoText = isAi ? '🌐 AGI Node (Vertex / Local)' : '🌍 Remoto Global';
            
            const card = document.createElement('div');
            card.className = `mk-card ${isAi ? 'ai-card' : ''}`;
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; width: 100%;">
                    <div style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
                        <div style="color: white; font-weight: 900; font-size: 1.1rem; display:flex; align-items:center; gap:10px;">
                            <div style="width:32px; height:32px; background:${isAi ? 'var(--accent-purple)' : '#444'}; color:${isAi ? 'black' : 'white'}; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:1rem; flex-shrink:0;">
                                ${isAi ? '🤖' : gu.name.charAt(0).toUpperCase()}
                            </div>
                            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${gu.name}</span>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--accent-orange); font-family: var(--font-mono); font-weight:bold;">${geoText}</div>
                    </div>
                </div>
                <button class="btn-recruit" data-id="${gu.id}">+ Reclutar Nodo</button>
            `;

            card.querySelector('.btn-recruit').addEventListener('click', async () => {
                await store.dispatch({
                    type: 'UPDATE_PROJECT_INFO',
                    payload: { projectId: this.activeProjectId, updates: { usuarios: [...projUsers, { id: gu.id, permissions: { canCreateWO: isAi } }] } }
                });
                window.location.reload(); 
            });

            listContainer.appendChild(card);
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
            container.innerHTML = `<div style="text-align:center; color:#888; padding:3rem; border:1px dashed #444; border-radius:16px;">No hay sillas instanciadas. Ve al Mapa VNA.</div>`;
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
            
            slot.innerHTML = `
                <div class="role-meta">
                    <div style="color: white; font-weight: 900; font-size: 1.2rem; letter-spacing:-0.5px;">${rol.name}</div>
                    <div style="color: #888; font-size: 0.8rem; font-family: var(--font-mono); font-weight:bold; letter-spacing:0.5px;">
                        ${rol.levelId} | FMV: ${rol.fmv}€/h | 🛡️ ${rol.guardian || 'Any'}
                    </div>
                </div>
                <div style="width: 45%; text-align: right; min-width: 220px;">
                    <select class="form-control user-select" data-roleid="${rol.id}" style="border-color:${isAssigned ? 'var(--accent-green)' : '#444'}; background:${isAssigned ? 'rgba(0, 230, 118, 0.05)' : 'rgba(0,0,0,0.5)'}; font-weight:bold; color:${isAssigned ? 'var(--accent-green)' : 'white'};">
                        ${optionsHtml}
                    </select>
                </div>
            `;

            const selectEl = slot.querySelector('.user-select');
            if (isAssigned) selectEl.value = assignment.userId;

            selectEl.addEventListener('change', async (e) => {
                const newAsignaciones = project.asignaciones.filter(a => a.roleId !== rol.id);
                if (e.target.value !== "") newAsignaciones.push({ roleId: rol.id, userId: e.target.value, assignedAt: Date.now() });
                
                await store.dispatch({ 
                    type: 'UPDATE_PROJECT_INFO', 
                    payload: { projectId: this.activeProjectId, updates: { asignaciones: newAsignaciones } } 
                });
                this.executeViewScript();
            });

            container.appendChild(slot);
        });
    }
}
