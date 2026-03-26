// v9/js/views/TeamView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { SkillForgeModal } from '../components/SkillForgeModal.js'; // INYECTAMOS EL CHAT-EVOLVER

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
        this.skillsCache = []; // Cachearemos las skills de KB para pintar los badges rápido
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
            title: "Padrón del Ecosistema",
            subtitle: project.nombre,
            tagline: "Evolución de Agentes, Asignación de Roles y Badges de Skills (A2A).",
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

                /* 🔥 TAXONOMÍA GRID */
                .taxonomy-group { margin-bottom: 3rem; background: rgba(0,0,0,0.2); border-radius: 20px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.02);}
                .taxonomy-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem; padding-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.1);}
                .taxonomy-title { font-size: 1.2rem; font-weight: 900; color: white; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 10px;}
                
                .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.5rem; width: 100%; box-sizing: border-box;}
                
                /* 🔥 USER CARD LUXURY */
                .user-card { 
                    background: linear-gradient(145deg, rgba(25,25,30,0.8), rgba(15,15,20,0.9));
                    border: 1px solid rgba(255,255,255,0.05); 
                    border-radius: 16px; padding: 1.5rem; 
                    display: flex; flex-direction: column; gap: 12px; 
                    transition: all 0.3s; position: relative; 
                    backdrop-filter: blur(10px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 5px 15px rgba(0,0,0,0.3);
                    box-sizing: border-box; width: 100%;
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

                /* 🔥 SKILLS BADGES (ADICCIÓN VISUAL) */
                .uc-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 5px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.05);}
                .universal-skill-badge { background: rgba(0,176,255,0.1); border: 1px solid rgba(0,176,255,0.3); color: var(--accent-blue); padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-family: var(--font-mono); font-weight: bold; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 5px;}
                .universal-skill-badge:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 15px rgba(0,176,255,0.5); transform: translateY(-2px);}
                .universal-skill-badge.core-skill { background: rgba(224,64,251,0.1); border-color: rgba(224,64,251,0.3); color: var(--accent-purple);}
                .universal-skill-badge.core-skill:hover { background: var(--accent-purple); color: black; box-shadow: 0 0 15px rgba(224,64,251,0.5);}
                .empty-skills { color:#666; font-size:0.75rem; font-style:italic;}

                /* ROLES / SILLAS */
                .roles-grid { display: grid; grid-template-columns: 1fr; gap: 1.2rem; max-width: 900px; margin: 0 auto; width: 100%; box-sizing: border-box;}
                .role-slot { background: linear-gradient(145deg, rgba(20, 20, 25, 0.6), rgba(10,10,15,0.8)); border: 1px dashed rgba(255,255,255,0.15); border-radius: 20px; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; gap: 20px; transition: all 0.3s; width: 100%; box-sizing: border-box; flex-wrap: wrap;}
                .role-slot.assigned { border-style: solid; border-color: rgba(0, 230, 118, 0.3); background: rgba(0, 230, 118, 0.05); }
                .role-meta { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 250px;}
                
                /* FORMULARIOS Y BOTONES */
                .form-control { background: rgba(0,0,0,0.6); border: 1px solid #444; color: white; padding: 14px 15px; border-radius: 10px; font-family: inherit; font-size: 0.95rem; outline: none; width: 100%; transition: border-color 0.3s; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .form-control:focus { border-color: var(--accent-blue); box-shadow: inset 0 2px 5px rgba(0,0,0,0.3), 0 0 10px rgba(0,176,255,0.2);}
                .form-group { margin-bottom: 15px; width: 100%;}
                .form-group label { display: block; font-size: 0.8rem; color: #aaa; text-transform: uppercase; margin-bottom: 6px; font-weight: bold; letter-spacing: 0.5px;}

                .btn-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,176,255,0.2); font-size: 0.95rem;}
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(224,64,251,0.4); filter: brightness(1.1);}
                
                /* MODAL OVERLAYS */
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: none; justify-content: center; align-items: center; z-index: 5000; }
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
                .btn-recruit { background: transparent; border: 1px solid var(--accent-green); color: var(--accent-green); padding: 10px 16px; border-radius: 8px; font-weight: 900; cursor: pointer; transition: 0.2s; width: 100%; margin-top: 15px;}
                .btn-recruit:hover { background: rgba(0, 230, 118, 0.1); transform: scale(1.02);}

                @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .workspace { padding: 90px 1rem 120px 1rem; } 
                    .role-slot { flex-direction: column; align-items: stretch; padding: 1.5rem; gap: 15px;}
                    .marketplace-panel { width: 100vw; }
                }
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
                            <input type="text" id="mkSearchName" class="form-control" placeholder="Buscar por alias...">
                        </div>
                    </div>
                    <div class="mk-list" id="mkList"></div>
                </aside>

                <div class="modal-overlay" id="addUserModal">
                    <div class="modal-content">
                        <h2 style="color:white; margin-top:0; margin-bottom:1.5rem; font-weight:900; font-size:1.8rem; letter-spacing:-1px;">➕ Nuevo Nodo Externo</h2>
                        <div style="display:flex; gap:15px; flex-wrap:wrap;">
                            <div class="form-group" style="flex:1;">
                                <label>Alias Único (@user)</label>
                                <input type="text" id="addUAlias" class="form-control" placeholder="@alias_unico">
                            </div>
                            <div class="form-group" style="flex:2;">
                                <label>Nombre Completo</label>
                                <input type="text" id="addUName" class="form-control" placeholder="Ej: Laura Pérez">
                            </div>
                        </div>
                        <div style="display:flex; justify-content:flex-end; margin-top:2rem; padding-top: 1.5rem; border-top: 1px dashed #333; gap:15px;">
                            <button class="btn-outline" id="btnCancelAddUser">Cancelar</button>
                            <button class="btn-primary" id="btnConfirmAddUser">Vincular Perfil</button>
                        </div>
                    </div>
                </div>

                ${BottomNav.getHtml('/team')}
            </div>
        `;
    }

    async executeViewScript() {
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

        // CACHEAR SKILLS PARA LOS BADGES
        await KB.init();
        this.skillsCache = await KB.getAllNodes({ type: 'skill' });

        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.currentTab}`);
            if(target) target.classList.add('active');
        });

        // REFRESH EVENT (Si editas una skill, se repinta la UI)
        window.addEventListener('refresh-lms-data', async () => {
            this.skillsCache = await KB.getAllNodes({ type: 'skill' });
            this.renderTaxonomicUsers(project, store.getState().globalUsers);
        });

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

        // ADD USER FORM LOGIC
        const addUserModal = document.getElementById('addUserModal');
        document.getElementById('btnManualAdd')?.addEventListener('click', () => addUserModal.style.display = 'flex');
        document.getElementById('btnCancelAddUser')?.addEventListener('click', () => addUserModal.style.display = 'none');
        
        document.getElementById('btnConfirmAddUser')?.addEventListener('click', async () => {
            let alias = document.getElementById('addUAlias').value.trim();
            const name = document.getElementById('addUName').value.trim();
            if (!alias || !name) return alert("Alias y Nombre son obligatorios.");
            if (!alias.startsWith('@')) alias = '@' + alias;

            const newUser = {
                id: alias, name: name, globalRole: 'network-user',
                profile: { structural_affinity: ['@baixos'], guardian_authority: ['everyman'] }
            };

            await store.dispatch({ type: 'ADD_USER', payload: { ...newUser, projectId: this.activeProjectId } });
            addUserModal.style.display = 'none';
            window.location.reload();
        });
    }

    // 🔥 RENDERIZADO TAXONÓMICO DE USUARIOS
    renderTaxonomicUsers(project, globalUsers) {
        const container = document.getElementById('usersList');
        if(!container) return;
        const projUsers = project.usuarios || [];
        container.innerHTML = '';

        if (projUsers.length === 0) return;

        // Estructuramos a los usuarios según la Taxonomía
        const categorizedUsers = {
            'core.architecture': [], 'core.economy': [], 'core.cognition': [], 
            'core.execution': [], 'core.culture': [], 'humans': [], 'uncategorized': []
        };

        projUsers.forEach(u => {
            const fullUser = globalUsers.find(g => g.id === u.id);
            if (!fullUser) return;

            if (!fullUser.profile?.isAi) {
                categorizedUsers['humans'].push(fullUser);
            } else {
                // Inferimos la categoría del agente basada en su primera skill
                let cat = 'uncategorized';
                if (fullUser.profile.active_skills && fullUser.profile.active_skills.length > 0) {
                    const primarySkillId = fullUser.profile.active_skills[0];
                    const skillNode = this.skillsCache.find(s => s.id === primarySkillId);
                    if (skillNode && TAXONOMY[skillNode.category]) {
                        cat = skillNode.category;
                    }
                }
                categorizedUsers[cat].push(fullUser);
            }
        });

        // Pintamos cada bloque taxonómico
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
                <div class="team-grid">
                    ${usersInCat.map(user => this.generateUserCardHtml(user, project)).join('')}
                </div>
            `;
            container.appendChild(groupHtml);
        });
    }

    generateUserCardHtml(fullUser, project) {
        const isAi = fullUser.profile?.isAi || false;
        const initial = isAi ? '🤖' : fullUser.name.charAt(0).toUpperCase();
        const color = isAi ? 'var(--accent-purple)' : 'var(--accent-blue)';
        const isOnline = fullUser.profile?.isOpenToWork || isAi;

        const harvest = store.calculateHarvest(this.activeProjectId) || [];
        const userHarvest = harvest.find(h => h.userId === fullUser.id);
        const slices = userHarvest ? Math.round(userHarvest.slices) : 0;
        const isPO = project.ownerId === fullUser.id;
        const crownIcon = isPO ? `<span class="po-badge">👑 PO</span>` : '';

        // Renderizar Badges Clicables de Skills (IdentityForge / A2A)
        let skillsHtml = '<div class="empty-skills">Cerebro vacío.</div>';
        const activeSkillsIds = fullUser.profile?.active_skills || [];
        
        if (activeSkillsIds.length > 0) {
            skillsHtml = activeSkillsIds.map(skillId => {
                const node = this.skillsCache.find(s => s.id === skillId);
                const title = node ? node.title.replace(' (', '<br>(') : skillId; // Break lines for long titles
                const isCore = node && node.keywords && node.keywords.includes('#core_sos');
                return `<span class="universal-skill-badge ${isCore ? 'core-skill' : ''}" data-skill-id="${skillId}">🎒 ${title}</span>`;
            }).join('');
        }

        return `
            <div class="user-card ${isAi ? 'is-ai' : ''}">
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
                <div class="uc-skills">${skillsHtml}</div>
            </div>
        `;
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
