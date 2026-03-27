// v9/js/views/TeamView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';
import { SkillForgeModal } from '../components/SkillForgeModal.js';
import { Orchestrator } from '../core/Orchestrator.js';

const GEO_DATA = { /* ... */ };

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
        this.activeAgentProfile = null; 
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

        if (!project) return `<div class="app-layout">${Sidebar.getHtml('/team')}<main class="workspace" style="justify-content:center; align-items:center;"><div class="glass-panel" style="text-align:center;"><h2 style="color:white;">Sin Red Asignada</h2></div></main></div>`;

        const isPO = project && (project.ownerId === activeUserId || state.session.role === 'ecosystem-owner');

        const headerConfig = {
            title: "Padrón Neuronal",
            subtitle: project.nombre,
            tagline: "Evolución de Agentes, Asignación de Roles y Glass-Box AI.",
            actionHtml: isPO ? `<div style="display: flex; gap: 10px;"><button class="btn-primary" id="btnOpenMarketplace" style="background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue);">🔍 Reclutar Agentes</button></div>` : '',
            tabs: [
                { id: 'nodos', label: '👥 Taxonomía de Nodos', active: this.currentTab === 'nodos', badge: project ? (project.usuarios || []).length : '0' },
                { id: 'asignaciones', label: '🪑 Sillas (Roles VNA)', active: this.currentTab === 'asignaciones' }
            ]
        };

        return `
            <style>
                .taxonomy-group { margin-bottom: 3rem; background: rgba(0,0,0,0.2); border-radius: 20px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.02);}
                .taxonomy-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem; padding-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.1);}
                .taxonomy-title { font-size: 1.2rem; font-weight: 900; color: white; text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 10px;}
                .team-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.5rem; width: 100%; box-sizing: border-box;}
                
                .user-card { background: linear-gradient(145deg, rgba(25,25,30,0.8), rgba(15,15,20,0.9)); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; gap: 12px; transition: all 0.3s; cursor: pointer; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 5px 15px rgba(0,0,0,0.3);}
                .user-card:hover { border-color: var(--accent-blue); transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0, 176, 255, 0.15); }
                .user-card.is-ai { border-color: rgba(224, 64, 251, 0.2); background: linear-gradient(145deg, rgba(30,20,40,0.8), rgba(15,10,20,0.9));}
                .user-card.is-ai:hover { border-color: var(--accent-purple); box-shadow: 0 10px 25px rgba(224, 64, 251, 0.2); }
                
                .uc-top { display: flex; align-items: center; gap: 15px; justify-content: space-between;}
                .avatar { width: 45px; height: 45px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 900; color: white; font-size: 1.2rem; border: 2px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.5); position: relative;}
                .avatar-status { position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #111; }
                .status-online { background: var(--accent-green); box-shadow: 0 0 10px var(--accent-green);}
                
                .user-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; min-width: 0;}
                .user-name { color: white; font-weight: 900; font-size: 1.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px;}
                .user-id { color: #888; font-family: var(--font-mono); font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                
                .uc-roi { text-align: right; background: rgba(0,0,0,0.4); padding: 8px 12px; border-radius: 10px; border: 1px dashed rgba(255,255,255,0.1); display:flex; flex-direction:column; align-items:flex-end; justify-content:center;}
                .uc-roi-val { color: var(--accent-green); font-weight: 900; font-family: var(--font-mono); font-size: 1rem;}
                .uc-roi-lbl { color: #888; font-size: 0.65rem; text-transform: uppercase; font-weight: bold;}

                .uc-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 5px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.05);}
                .universal-skill-badge { background: rgba(0,176,255,0.1); border: 1px solid rgba(0,176,255,0.3); color: var(--accent-blue); padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-family: var(--font-mono); font-weight: bold; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 5px; position:relative; z-index:2;}
                .universal-skill-badge:hover { background: var(--accent-blue); color: black; box-shadow: 0 0 15px rgba(0,176,255,0.5); transform: translateY(-2px);}
                .universal-skill-badge.core-skill { background: rgba(224,64,251,0.1); border-color: rgba(224,64,251,0.3); color: var(--accent-purple);}
                .universal-skill-badge.core-skill:hover { background: var(--accent-purple); color: black; box-shadow: 0 0 15px rgba(224,64,251,0.5);}

                /* MODAL PERFIL USUARIO/AGENTE NEURONAL */
                .pm-header { padding: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; gap: 20px; align-items: center; position: relative; background: rgba(255,255,255,0.01); flex-shrink:0;}
                .pm-avatar { width: 80px; height: 80px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 900; color: white; font-size: 2.5rem; border: 3px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.5); flex-shrink: 0;}
                .pm-info { z-index: 1; overflow: hidden; flex: 1;}
                .pm-name { font-size: 1.6rem; color: white; margin: 0 0 5px 0; font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 10px;}
                .pm-id { font-family: var(--font-mono); color: #888; font-size: 0.9rem;}
                
                .pm-body { padding: 2rem; overflow-y: auto; flex:1;}
                .pm-stats { display: flex; gap: 15px; margin-bottom: 1.5rem; }
                .pm-stat-box { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; text-align: center; }
                .pm-stat-val { font-size: 1.8rem; font-weight: 900; font-family: var(--font-mono); color: var(--accent-green); margin-bottom: 5px;}
                .pm-stat-label { font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;}
                
                .pm-brain-box { background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); border-radius: 16px; padding: 20px; margin-bottom: 1.5rem; transition: 0.3s;}
                .pm-brain-box.synthesizing { border-color: var(--accent-orange); box-shadow: inset 0 0 20px rgba(255,145,0,0.2); }
                .pm-brain-title { font-size: 0.8rem; color: var(--accent-purple); text-transform: uppercase; font-weight: 900; margin-bottom: 12px; letter-spacing:1px; display:flex; justify-content:space-between; align-items:center;}
                .pm-brain-content { font-family: var(--font-mono); font-size: 0.85rem; color: #ccc; line-height: 1.6; white-space: pre-wrap; background:rgba(0,0,0,0.5); padding:15px; border-radius:12px; border:1px solid #333; max-height:200px; overflow-y:auto; outline:none; transition:0.3s;}
                .pm-brain-content:focus { border-color: var(--accent-purple); box-shadow: inset 0 0 10px rgba(224,64,251,0.2); }
                
                .pm-footer { padding: 1.5rem 2rem; background: rgba(0,0,0,0.6); border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; flex-shrink:0;}
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/team')}

                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}
                    <div id="tab-nodos" class="tab-content active"><div id="usersList"></div></div>
                    <div id="tab-asignaciones" class="tab-content"><div class="roles-grid" id="rolesList"></div></div>
                </main>

                <div id="mount-forge-modal"></div> <div class="modal-overlay" id="userProfileModal">
                    <div class="modal-card" style="padding:0; max-width:900px; border-top-color:var(--accent-purple);">
                        <div class="pm-header" id="pmHeaderBox">
                            <div class="pm-avatar" id="pmAvatar">?</div>
                            <div class="pm-info">
                                <h2 class="pm-name"><span id="pmName">Cargando...</span></h2>
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
                            
                            <div class="pm-brain-box" id="pmBrainBox">
                                <div class="pm-brain-title">
                                    <span id="pmBrainStatusText">🧠 AGENT.md (System Prompt Editable)</span>
                                    <button id="btnSaveAgentPrompt" class="btn-primary" style="font-size:0.7rem; padding:6px 12px; height:auto; display:none;">💾 Sellar Cerebro</button>
                                </div>
                                <div class="pm-brain-content" id="pmSemanticProfile" contenteditable="false">Cargando datos de IndexedDB...</div>
                                
                                <div id="pmSkillEquipperContainer" style="display:none; margin-top: 15px; border-top:1px dashed #444; padding-top:15px;">
                                    <label style="color:var(--accent-green); font-size:0.75rem; font-weight:bold; text-transform:uppercase; margin-bottom:8px; display:block;">🎒 Equipar Nueva Skill al Cinturón</label>
                                    <select id="pmSkillSelector" class="form-control" style="border-color:var(--accent-green); font-weight:bold; background:#050508;">
                                        <option value="">➕ Selecciona una Skill de la Taxonomía...</option>
                                    </select>
                                </div>
                            </div>

                            <div id="pmEquippedSkills"></div>
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
        Sidebar.initListeners(); 
        PageHeader.execute();

        const state = store.getState();
        let currentActiveId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === currentActiveId);
        if (!project) return;
        this.activeProjectId = project.id;

        this.skillForgeModal = new SkillForgeModal('mount-forge-modal');
        await this.skillForgeModal.render();

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
            if (this.activeAgentProfile) this.renderAgentModal(this.activeAgentProfile, project);
        });

        this.renderTaxonomicUsers(project, state.globalUsers);

        document.getElementById('btnCloseProfileModal').addEventListener('click', () => {
            document.getElementById('userProfileModal').classList.remove('active');
            this.activeAgentProfile = null;
        });

        const skillSelector = document.getElementById('pmSkillSelector');
        skillSelector.addEventListener('change', async (e) => {
            const skillId = e.target.value;
            if (!skillId || !this.activeAgentProfile) return;
            e.target.value = ''; 
            await this.equipSkillToAgent(this.activeAgentProfile, skillId);
        });

        document.getElementById('btnSaveAgentPrompt').addEventListener('click', async () => {
            if (!this.activeAgentProfile) return;
            const newContent = document.getElementById('pmSemanticProfile').innerText.trim();
            const btn = document.getElementById('btnSaveAgentPrompt');
            btn.innerText = "⏳...";
            
            await KB.init();
            const promptId = `prompt_global_${this.activeAgentProfile.id.replace('@','')}`;
            let promptNode = await KB.getNode(promptId);
            if (promptNode) {
                promptNode.content = newContent;
                await KB.saveNode(promptNode);
            }
            btn.innerText = "✅ Sellado";
            setTimeout(() => btn.innerText = "💾 Sellar Cerebro", 2000);
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
            groupHtml.innerHTML = `<div class="taxonomy-header"><span class="taxonomy-title" style="color: ${taxConfig.color};">${taxConfig.icon} ${taxConfig.label}</span></div><div class="team-grid"></div>`;
            
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
                    <div class="avatar" style="border-color: ${color}; color: ${color};">${initial}<div class="avatar-status ${isOnline ? 'status-online' : 'status-offline'}"></div></div>
                    <div class="user-info">
                        <div class="user-name">${fullUser.name}</div>
                        <div class="user-id">${fullUser.id}</div>
                    </div>
                </div>
                <div class="uc-roi"><div class="uc-roi-val">${slices.toLocaleString()}</div><div class="uc-roi-lbl">Slices</div></div>
            </div>
            <div class="uc-skills" style="position:relative; z-index:2;">${skillsHtml}</div>
        `;

        card.querySelectorAll('.universal-skill-badge').forEach(b => b.addEventListener('click', e => e.stopPropagation()));
        card.addEventListener('click', () => this.renderAgentModal(fullUser, project));

        return card;
    }

    async renderAgentModal(fullUser, project) {
        this.activeAgentProfile = fullUser;
        const isAi = fullUser.profile?.isAi || false;
        const initial = isAi ? '🤖' : (fullUser.name || 'U').charAt(0).toUpperCase();
        const color = isAi ? 'var(--accent-purple)' : 'var(--accent-blue)';
        
        const harvest = store.calculateHarvest(this.activeProjectId) || [];
        const userHarvest = harvest.find(h => h.userId === fullUser.id);
        const slices = userHarvest ? Math.round(userHarvest.slices) : 0;
        const totalHours = (project.ledger || []).filter(tx => tx.userId === fullUser.id).reduce((sum, tx) => sum + (tx.horas || 0), 0);

        document.getElementById('pmName').innerText = fullUser.name || 'Agente';
        document.getElementById('pmId').innerText = fullUser.id;
        document.getElementById('pmAvatar').innerText = initial;
        document.getElementById('pmAvatar').style.borderColor = color;
        document.getElementById('pmAvatar').style.color = color;
        document.getElementById('pmSlices').innerText = slices.toLocaleString();
        document.getElementById('pmHours').innerText = totalHours.toFixed(1) + 'h';
        document.getElementById('pmValidationTag').innerText = isAi ? "🤖 NODO IA VERIFICADO ✓" : "ID Validado ✓";

        const promptBox = document.getElementById('pmSemanticProfile');
        const skillsBox = document.getElementById('pmEquippedSkills');
        const equipperContainer = document.getElementById('pmSkillEquipperContainer');
        const btnSavePrompt = document.getElementById('btnSaveAgentPrompt');
        
        if (isAi) {
            await KB.init();
            const promptId = `prompt_global_${fullUser.id.replace('@','')}`;
            let promptNode = await KB.getNode(promptId);
            
            if (!promptNode) {
                promptNode = {
                    id: promptId, type: 'prompt_a2a', category: 'meta_prompt',
                    projectId: 'global', targetId: fullUser.id,
                    title: `AGENT.md: ${fullUser.name}`,
                    content: `Eres ${fullUser.name}. Tu misión es operar en la matriz y resolver tareas de forma autónoma.`,
                    dependencies: fullUser.profile?.active_skills || [],
                    keywords: ['ai_agent', fullUser.id]
                };
                await KB.saveNode(promptNode);
            }
            
            promptBox.innerText = promptNode.content;
            promptBox.contentEditable = "true";
            btnSavePrompt.style.display = "inline-flex";
            equipperContainer.style.display = "block";

            // Llenar el selector taxonómico
            this.populateSkillSelector(fullUser.profile?.active_skills || []);
            
            const activeSkillsIds = fullUser.profile?.active_skills || [];
            let fullSkillsHtml = '';
            if (activeSkillsIds.length > 0) {
                fullSkillsHtml = activeSkillsIds.map(skillId => {
                    const node = this.skillsCache.find(s => s.id === skillId);
                    if(!node) return '';
                    return `
                        <div style="background: rgba(0,0,0,0.6); border: 1px solid #333; border-radius: 12px; margin-bottom: 12px; overflow: hidden;">
                            <div style="padding: 10px 15px; background: rgba(0,176,255,0.05); border-bottom: 1px solid rgba(0,176,255,0.2); display:flex; justify-content:space-between; align-items:center;">
                                <span style="color:var(--accent-blue); font-weight:bold; font-family:var(--font-mono); font-size:0.85rem;">🎒 ${node.title}</span>
                                <div>
                                    <button class="universal-skill-badge" data-skill-id="${skillId}" style="margin:0; padding:4px 10px; font-size:0.7rem;">Inspeccionar ↗</button>
                                </div>
                            </div>
                            <div style="padding: 15px; font-family: var(--font-mono); font-size: 0.85rem; color: #ccc; white-space: pre-wrap; max-height: 150px; overflow-y: auto; line-height:1.5;">${node.content}</div>
                        </div>
                    `;
                }).join('');
            } else {
                fullSkillsHtml = '<div style="color:#888; font-style:italic; font-size:0.85rem; padding:15px; border:1px dashed #333; border-radius:10px;">Cinturón vacío. Selecciona una arriba para equiparla.</div>';
            }
            
            skillsBox.innerHTML = `<div style="font-size:0.8rem; color:var(--accent-blue); text-transform:uppercase; margin-bottom:10px; font-weight:900; letter-spacing:1px; margin-top:20px;">⚙️ Códice Operativo (SOPs Equipados)</div>${fullSkillsHtml}`;
            
            // Añadir eventos a los botones de "Inspeccionar" en el cinturón
            skillsBox.querySelectorAll('.universal-skill-badge').forEach(badge => {
                badge.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.getElementById('userProfileModal').classList.remove('active');
                    window.dispatchEvent(new CustomEvent('open-forge-modal', { detail: { nodeId: badge.dataset.skillId } }));
                });
            });

        } else {
            promptBox.contentEditable = "false";
            btnSavePrompt.style.display = "none";
            equipperContainer.style.display = "none";
            promptBox.innerHTML = `<span style="color: var(--accent-orange); font-weight:bold;">📍 Nodo Biológico Humano</span>`;
            skillsBox.innerHTML = '';
        }

        document.getElementById('userProfileModal').classList.add('active');
    }

    // 🔥 FILTRADO TAXONÓMICO DINÁMICO (Evita que desaparezcan las Skills Custom)
    populateSkillSelector(equippedIds) {
        const selector = document.getElementById('pmSkillSelector');
        let optionsHtml = `<option value="">➕ Selecciona una Skill de la Red para Equipar...</option>`;
        
        const grouped = {};
        this.skillsCache.forEach(s => {
            if (!equippedIds.includes(s.id)) { 
                const cat = s.category || 'uncategorized';
                if(!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(s);
            }
        });

        // 1. Mostrar categorías Core primero
        Object.keys(TAXONOMY).forEach(cat => {
            if (grouped[cat] && grouped[cat].length > 0) {
                optionsHtml += `<optgroup label="${TAXONOMY[cat].label}">`;
                grouped[cat].forEach(s => optionsHtml += `<option value="${s.id}">${s.title}</option>`);
                optionsHtml += `</optgroup>`;
                delete grouped[cat]; // Borramos para saber qué nos queda
            }
        });

        // 2. Mostrar el resto de categorías (Las que el usuario o la IA hayan inventado)
        Object.keys(grouped).forEach(cat => {
            if (grouped[cat] && grouped[cat].length > 0) {
                const label = cat === 'uncategorized' || cat === 'skill' ? 'Otras Skills' : `Skills: ${cat.toUpperCase()}`;
                optionsHtml += `<optgroup label="${label}">`;
                grouped[cat].forEach(s => optionsHtml += `<option value="${s.id}">${s.title}</option>`);
                optionsHtml += `</optgroup>`;
            }
        });
        
        selector.innerHTML = optionsHtml;
    }

    async equipSkillToAgent(fullUser, newSkillId) {
        const brainBox = document.getElementById('pmBrainBox');
        const statusText = document.getElementById('pmBrainStatusText');
        const promptArea = document.getElementById('pmSemanticProfile');
        
        brainBox.classList.add('synthesizing');
        statusText.innerText = "🤖 Sintetizando Córtex...";

        try {
            await KB.init();
            const skillNode = await KB.getNode(newSkillId);
            if (!skillNode) throw new Error("Skill no encontrada");

            const activeSkills = fullUser.profile.active_skills || [];
            if (!activeSkills.includes(newSkillId)) activeSkills.push(newSkillId);
            
            await store.dispatch({
                type: 'UPDATE_USER',
                payload: { id: fullUser.id, profile: { ...fullUser.profile, active_skills: activeSkills } }
            });

            const promptId = `prompt_global_${fullUser.id.replace('@','')}`;
            let promptNode = await KB.getNode(promptId);
            
            if (promptNode) {
                promptNode.dependencies = activeSkills;
                const currentPrompt = promptNode.content;
                const skillContext = `Herramienta añadida: ${skillNode.title}\nDescripción: ${skillNode.description}\nSOP: ${skillNode.content}`;
                
                try {
                    const newPrompt = await Orchestrator.synthesizeAgentPrompt(currentPrompt, skillContext);
                    promptNode.content = newPrompt;
                    promptArea.innerText = newPrompt;
                } catch(aiError) {
                    promptNode.content = currentPrompt + `\n\n[NUEVA HERRAMIENTA AÑADIDA]:\n${skillNode.title} - Úsala cuando sea necesario.`;
                    promptArea.innerText = promptNode.content;
                }

                await KB.saveNode(promptNode);
            }

            window.dispatchEvent(new CustomEvent('refresh-lms-data'));

        } catch (error) {
            alert("Error al equipar la skill: " + error.message);
        } finally {
            brainBox.classList.remove('synthesizing');
            statusText.innerText = "🧠 AGENT.md (System Prompt Editable)";
        }
    }
}
