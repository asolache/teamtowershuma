// =============================================================================
// TEAMTOWERS SOS V10 — TEAM VIEW
// Ruta: ia/dev/js/views/TeamView.js
// Padrón Neuronal · Taxonomía de Nodos · Glass-Box AI
// =============================================================================

import { store }          from '../core/store.js';
import { KB }             from '../core/kb.js';
import { Sidebar }        from '../components/Sidebar.js';
import { BottomNav }      from '../components/BottomNav.js';
import { PageHeader }     from '../components/PageHeader.js';
import { SkillForgeModal } from '../components/SkillForgeModal.js';
import { Orchestrator }   from '../core/Orchestrator.js';

const TAXONOMY = {
    'core.architecture': { icon: '🌌', label: 'Arquitectura & VNA',      color: 'var(--accent-indigo)' },
    'core.economy':      { icon: '⚖️', label: 'Economía & Ledger',       color: 'var(--accent-green)'  },
    'core.cognition':    { icon: '🧠', label: 'Cognición & Ontología',   color: 'var(--accent-purple)' },
    'core.execution':    { icon: '⚡', label: 'Ejecución & Código',      color: 'var(--accent-orange)' },
    'core.culture':      { icon: '🎭', label: 'Cultura & Caos',          color: 'var(--accent-red)'    },
    'humans':            { icon: '👤', label: 'Humanidad (Biológicos)',   color: '#ffffff'              },
    'uncategorized':     { icon: '🧩', label: 'Agentes Custom',          color: '#888888'              }
};

export default class TeamView {

    constructor() {
        document.title      = 'La Colla | TeamTowers V10';
        this.activeProjectId = null;
        this.currentTab      = 'nodos';
        this.skillForgeModal = null;
        this.skillsCache     = [];
        this.activeAgentProfile = null;
    }

    async getHtml() {
        await store.init();
        const state        = store.getState();
        const activeUserId = state.session.activeUserId;

        let activeProjectId = localStorage.getItem('tt_active_project');
        let project = state.projects.find(p => p.id === activeProjectId);
        if (!project && state.projects.length > 0) {
            project = state.projects.find(p => !p.isArchived) || state.projects[0];
        }

        if (!project) return `
            <div class="app-layout">
                ${Sidebar.getHtml('/team')}
                <main class="workspace" style="justify-content:center; align-items:center;">
                    <div class="glass-panel" style="text-align:center;">
                        <h2 style="color:white;">Sin Red Asignada</h2>
                        <a href="/create" data-link class="btn-primary" style="text-decoration:none; margin-top:1.5rem; display:inline-block;">➕ Forjar Ecosistema</a>
                    </div>
                </main>
            </div>`;

        const isPO = project.ownerId === activeUserId || state.session.role === 'ecosystem-owner';

        const headerConfig = {
            title:    'Padrón Neuronal',
            subtitle: project.nombre,
            tagline:  'Evolución de Agentes, Asignación de Roles y Glass-Box AI.',
            actionHtml: isPO ? `
                <button class="btn-primary" id="btnOpenMarketplace"
                        style="background:transparent; border:1px solid var(--accent-indigo); color:var(--accent-indigo);">
                    🔍 Reclutar Agentes
                </button>` : '',
            tabs: [
                { id: 'nodos',       label: `👥 Taxonomía de Nodos (${(project.usuarios || []).length})`, active: this.currentTab === 'nodos'       },
                { id: 'asignaciones', label: '🪑 Sillas (Roles VNA)',                                      active: this.currentTab === 'asignaciones' }
            ]
        };

        return `
        <style>
            .workspace-team { flex:1; padding:2rem 3rem; overflow-y:auto; overflow-x:hidden;
                scroll-behavior:smooth; box-sizing:border-box;
                background:radial-gradient(circle at top left, rgba(224,64,251,0.03) 0%, transparent 40%); }

            .tab-content        { display:none; animation:fadeIn 0.3s ease-out; padding-bottom:5rem; }
            .tab-content.active { display:block; }

            .taxonomy-group  { margin-bottom:2.5rem; background:rgba(0,0,0,0.2); border-radius:18px; padding:1.5rem; border:1px solid rgba(255,255,255,0.02); }
            .taxonomy-header { display:flex; align-items:center; gap:10px; margin-bottom:1.5rem; padding-bottom:10px; border-bottom:1px dashed rgba(255,255,255,0.08); }
            .taxonomy-title  { font-size:1.1rem; font-weight:900; color:white; text-transform:uppercase; letter-spacing:1px; }

            .team-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:1.25rem; width:100%; box-sizing:border-box; }

            .user-card { background:linear-gradient(145deg, rgba(25,25,30,0.8), rgba(15,15,20,0.9)); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:1.5rem; display:flex; flex-direction:column; gap:10px; transition:all 0.3s; cursor:pointer; }
            .user-card:hover  { border-color:var(--accent-indigo); transform:translateY(-4px); box-shadow:0 10px 25px rgba(99,102,241,0.15); }
            .user-card.is-ai  { border-color:rgba(224,64,251,0.2); }
            .user-card.is-ai:hover { border-color:var(--accent-purple); box-shadow:0 10px 25px rgba(224,64,251,0.2); }

            .uc-top { display:flex; align-items:center; gap:12px; justify-content:space-between; }
            .avatar { width:44px; height:44px; border-radius:50%; display:flex; justify-content:center; align-items:center; font-weight:900; color:white; font-size:1.1rem; border:2px solid rgba(255,255,255,0.2); background:rgba(0,0,0,0.5); position:relative; flex-shrink:0; }
            .avatar-status { position:absolute; bottom:-2px; right:-2px; width:11px; height:11px; border-radius:50%; border:2px solid #111; }

            .uc-name  { font-weight:900; color:white; font-size:1rem; }
            .uc-id    { font-family:var(--font-mono); font-size:0.7rem; color:#666; }
            .uc-role  { font-size:0.75rem; color:var(--accent-indigo); background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.2); padding:2px 8px; border-radius:12px; display:inline-block; }
            .uc-engine { font-size:0.72rem; color:#888; font-family:var(--font-mono); }
            .uc-skills { display:flex; flex-wrap:wrap; gap:4px; }
            .skill-badge { font-size:0.65rem; padding:2px 8px; border-radius:4px; background:rgba(0,176,255,0.1); color:var(--accent-blue); border:1px solid rgba(0,176,255,0.2); font-family:var(--font-mono); }

            /* Sillas */
            .silla-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px,1fr)); gap:1.25rem; }
            .silla-card { background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:14px; padding:1.25rem; }
            .silla-vacant { border-style:dashed; border-color:rgba(255,145,0,0.3); }

            /* Modal Perfil Agente */
            .profile-modal-overlay { position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(15px); z-index:5000; display:none; justify-content:center; align-items:flex-start; padding:2rem; overflow-y:auto; }
            .profile-modal-overlay.active { display:flex; }
            .profile-modal-card { background:var(--bg-dark); border:1px solid rgba(224,64,251,0.3); border-radius:24px; width:100%; max-width:700px; margin:auto; box-shadow:0 30px 60px rgba(0,0,0,0.8); border-top:4px solid var(--accent-purple); overflow:hidden; }
            .pm-header  { padding:1.5rem 2rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(0,0,0,0.3); }
            .pm-body    { padding:2rem; overflow-y:auto; max-height:65vh; }
            .pm-footer  { padding:1rem 2rem; border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); }
            .pm-brain-header  { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
            .pm-brain-content { background:rgba(0,0,0,0.5); border:1px solid #333; border-radius:10px; padding:1rem; min-height:80px; font-family:var(--font-mono); font-size:0.82rem; color:#ccc; line-height:1.6; white-space:pre-wrap; }
            .pm-brain-content[contenteditable="true"] { border-color:var(--accent-purple); outline:none; }

            @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
            @media (max-width:768px) { .workspace-team { padding:80px 1rem 120px 1rem; } }
        </style>

        <div class="app-layout">
            ${Sidebar.getHtml('/team')}
            <main class="workspace-team">
                ${PageHeader.getHtml(headerConfig)}

                <div id="tab-nodos" class="tab-content ${this.currentTab === 'nodos' ? 'active' : ''}">
                    <div id="taxonomyContainer"></div>
                </div>

                <div id="tab-asignaciones" class="tab-content ${this.currentTab === 'asignaciones' ? 'active' : ''}">
                    <div class="silla-grid" id="sillasContainer"></div>
                </div>
            </main>

            <!-- Modal: Perfil de Agente/Nodo -->
            <div id="userProfileModal" class="profile-modal-overlay">
                <div class="profile-modal-card">
                    <div class="pm-header">
                        <h2 id="pmTitle" style="margin:0; font-size:1.2rem; color:white; font-weight:900;">Expediente del Nodo</h2>
                        <button id="btnCloseProfileModal" style="background:transparent; border:none; color:#aaa; cursor:pointer; font-size:1.5rem;">✖</button>
                    </div>
                    <div class="pm-body" id="pmBody"></div>
                    <div class="pm-footer">
                        <button id="btnCloseProfileModalFooter" style="background:transparent; border:none; color:#888; cursor:pointer; font-weight:bold;">Cerrar Expediente</button>
                        <div id="pmValidationTag" style="font-size:0.8rem; color:var(--accent-green); font-weight:900; font-family:var(--font-mono);">ID Validado ✓</div>
                    </div>
                </div>
            </div>

            <div id="mount-forge-modal"></div>

            ${BottomNav.getHtml('/team')}
        </div>`;
    }

    async afterRender() {
        Sidebar.initListeners();
        PageHeader.afterRender((tabId) => {
            this.currentTab = tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${tabId}`)?.classList.add('active');
            if (tabId === 'asignaciones') this._renderSillas();
        });

        const state        = store.getState();
        const activeUserId = state.session.activeUserId;
        let project = state.projects.find(p => p.id === (localStorage.getItem('tt_active_project') || ''));
        if (!project) return;
        this.activeProjectId = project.id;

        // SkillForge Modal
        this.skillForgeModal = new SkillForgeModal('mount-forge-modal');
        await this.skillForgeModal.render();

        await KB.init();
        this.skillsCache = await KB.getAllNodes({ type: 'skill' });

        // Render inicial
        this._renderTaxonomicUsers(project, state.globalUsers);

        // Refresh desde evento LMS
        window.addEventListener('refresh-lms-data', async () => {
            this.skillsCache = await KB.getAllNodes({ type: 'skill' });
            const fresh = store.getState();
            const freshProj = fresh.projects.find(p => p.id === this.activeProjectId);
            this._renderTaxonomicUsers(freshProj, fresh.globalUsers);
        });

        // Cerrar modal
        const closeModal = () => {
            document.getElementById('userProfileModal')?.classList.remove('active');
            this.activeAgentProfile = null;
        };
        document.getElementById('btnCloseProfileModal')?.addEventListener('click', closeModal);
        document.getElementById('btnCloseProfileModalFooter')?.addEventListener('click', closeModal);

        // Skill selector en modal
        document.getElementById('pmSkillSelector')?.addEventListener('change', async (e) => {
            const skillId = e.target.value;
            if (!skillId || !this.activeAgentProfile) return;
            e.target.value = '';
            await this._equipSkillToAgent(this.activeAgentProfile, skillId);
        });

        // Guardar prompt agente
        document.getElementById('btnSaveAgentPrompt')?.addEventListener('click', async () => {
            if (!this.activeAgentProfile) return;
            const newContent = document.getElementById('pmSemanticProfile')?.innerText.trim();
            const btn = document.getElementById('btnSaveAgentPrompt');
            btn.innerText = '⏳...';
            await KB.init();
            const promptId   = `prompt_global_${this.activeAgentProfile.id.replace('@', '')}`;
            let promptNode   = await KB.getNode(promptId);
            if (promptNode) { promptNode.content = newContent; await KB.saveNode(promptNode); }
            btn.innerText = '✅ Sellado';
            setTimeout(() => { btn.innerText = '💾 Sellar Cerebro'; }, 2000);
        });
    }

    // ── Render taxonomía de nodos ────────────────────────────────
    _renderTaxonomicUsers(project, globalUsers) {
        const container = document.getElementById('taxonomyContainer');
        if (!container || !project) return;

        const projectUserIds = new Set((project.usuarios || []).map(u => u.id));
        if (project.ownerId) projectUserIds.add(project.ownerId);
        const projectUsers = globalUsers.filter(u => projectUserIds.has(u.id));

        // Clasificar por taxonomía
        const groups = {};
        projectUsers.forEach(u => {
            const cat = u.profile?.isAi
                ? (Object.keys(TAXONOMY).find(k => k !== 'humans' && k !== 'uncategorized' && u.profile?.active_skills?.some(s => s.includes(k.replace('core.', '')))) || 'uncategorized')
                : 'humans';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(u);
        });

        let html = '';
        Object.entries(groups).forEach(([cat, users]) => {
            if (!users.length) return;
            const tx    = TAXONOMY[cat] || TAXONOMY.uncategorized;
            const cards = users.map(u => this._userCardHtml(u, project)).join('');
            html += `
                <div class="taxonomy-group">
                    <div class="taxonomy-header">
                        <span style="font-size:1.4rem;">${tx.icon}</span>
                        <span class="taxonomy-title" style="color:${tx.color};">${tx.label}</span>
                        <span style="color:#555; font-size:0.8rem; font-family:var(--font-mono); margin-left:auto;">${users.length} nodo${users.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="team-grid">${cards}</div>
                </div>`;
        });

        container.innerHTML = html || '<p style="color:#555; text-align:center; padding:3rem; font-style:italic;">No hay nodos asignados a este ecosistema.</p>';

        // Attach click listeners
        container.querySelectorAll('.user-card').forEach(card => {
            card.addEventListener('click', () => {
                const userId = card.dataset.userId;
                const user   = store.getState().globalUsers.find(u => u.id === userId);
                if (user) this._openAgentModal(user, project);
            });
        });
    }

    _userCardHtml(user, project) {
        const isAi      = user.profile?.isAi;
        const initial   = isAi ? '🤖' : user.name?.charAt(0).toUpperCase() || '?';
        const engine    = user.profile?.preferredEngine || 'anthropic';
        const skillIds  = user.profile?.active_skills || [];
        const skillsHtml = skillIds.slice(0, 3).map(sid => {
            const skill = this.skillsCache.find(s => s.id === sid);
            return skill ? `<span class="skill-badge">🎒 ${skill.title}</span>` : '';
        }).join('');
        const statusColor = isAi ? 'var(--accent-purple)' : 'var(--accent-green)';

        return `
        <div class="user-card ${isAi ? 'is-ai' : ''}" data-user-id="${user.id}">
            <div class="uc-top">
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="avatar" style="border-color:${statusColor};">
                        ${initial}
                        <span class="avatar-status" style="background:${statusColor};"></span>
                    </div>
                    <div>
                        <div class="uc-name">${user.name || user.id}</div>
                        <div class="uc-id">${user.id}</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div class="uc-role">${isAi ? 'IA Agent' : user.globalRole || 'network-user'}</div>
                    ${isAi ? `<div class="uc-engine">⚡ ${engine}</div>` : ''}
                </div>
            </div>
            ${skillsHtml ? `<div class="uc-skills">${skillsHtml}</div>` : ''}
        </div>`;
    }

    // ── Render sillas (roles VNA) ─────────────────────────────────
    _renderSillas() {
        const container = document.getElementById('sillasContainer');
        const project   = store.getState().projects.find(p => p.id === this.activeProjectId);
        if (!container || !project) return;

        const state = store.getState();
        container.innerHTML = (project.roles || []).map(role => {
            const asignacion = (project.asignaciones || []).find(a => a.roleId === role.id);
            const assignedUser = asignacion ? state.globalUsers.find(u => u.id === asignacion.userId) : null;
            const isVacant = !assignedUser;

            return `
            <div class="silla-card ${isVacant ? 'silla-vacant' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                    <div>
                        <div style="font-weight:900; color:white; font-size:0.95rem;">${role.name}</div>
                        <div style="font-family:var(--font-mono); font-size:0.7rem; color:#666;">${role.levelId}</div>
                    </div>
                    <span style="font-size:0.7rem; padding:2px 8px; border-radius:10px; font-weight:bold;
                                 background:${isVacant ? 'rgba(255,145,0,0.1)' : 'rgba(0,230,118,0.1)'};
                                 color:${isVacant ? 'var(--accent-orange)' : 'var(--accent-green)'};
                                 border:1px solid ${isVacant ? 'rgba(255,145,0,0.3)' : 'rgba(0,230,118,0.3)'};">
                        ${isVacant ? 'VACANTE' : 'OCUPADO'}
                    </span>
                </div>
                <div style="display:flex; gap:8px; font-family:var(--font-mono); font-size:0.75rem; color:#888; flex-wrap:wrap; margin-bottom:0.75rem;">
                    <span>FMV: ${role.fmv}€/h</span>
                    <span>x${role.multiplier}</span>
                    ${role.guardian ? `<span>🛡️ ${role.guardian}</span>` : ''}
                </div>
                ${assignedUser
                    ? `<div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:8px;">
                           <span>${assignedUser.profile?.isAi ? '🤖' : '👤'}</span>
                           <span style="color:white; font-weight:bold; font-size:0.88rem;">${assignedUser.name}</span>
                       </div>`
                    : `<button style="background:rgba(99,102,241,0.1); border:1px dashed rgba(99,102,241,0.4); color:var(--accent-indigo); padding:8px 14px; border-radius:8px; font-size:0.8rem; font-weight:bold; cursor:pointer; width:100%;">
                           + Asignar Nodo
                       </button>`}
            </div>`;
        }).join('');
    }

    // ── Modal perfil de agente ────────────────────────────────────
    async _openAgentModal(user, project) {
        this.activeAgentProfile = user;
        const modal   = document.getElementById('userProfileModal');
        const pmTitle = document.getElementById('pmTitle');
        const pmBody  = document.getElementById('pmBody');
        if (!modal || !pmBody) return;

        pmTitle.textContent = `${user.profile?.isAi ? '🤖' : '👤'} ${user.name || user.id}`;
        pmBody.innerHTML    = '<div style="text-align:center; padding:2rem; color:#888;">Cargando expediente...</div>';
        modal.classList.add('active');

        await KB.init();
        const promptId   = `prompt_global_${user.id.replace('@', '')}`;
        let promptNode   = await KB.getNode(promptId);
        const isAi       = user.profile?.isAi;

        if (!promptNode && isAi) {
            promptNode = {
                id:       promptId, type: 'prompt_a2a', category: 'meta_prompt',
                targetId: user.id, title: `SOP de ${user.name}`,
                content:  `Eres ${user.id}, agente del Swarm SOS V10. Opera con precisión y Glass-Box.`,
                dependencies: user.profile?.active_skills || [], keywords: ['ai_agent', user.id]
            };
            await KB.saveNode(promptNode);
        }

        const activeSkillIds = user.profile?.active_skills || [];
        const skillsHtml = activeSkillIds.map(sid => {
            const node = this.skillsCache.find(s => s.id === sid);
            if (!node) return '';
            return `
            <div style="background:rgba(0,0,0,0.6); border:1px solid #333; border-radius:10px; margin-bottom:10px; overflow:hidden;">
                <div style="padding:8px 14px; background:rgba(99,102,241,0.05); border-bottom:1px solid rgba(99,102,241,0.2); display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:var(--accent-indigo); font-weight:bold; font-family:var(--font-mono); font-size:0.82rem;">🎒 ${node.title}</span>
                </div>
                <div style="padding:12px 14px; font-family:var(--font-mono); font-size:0.78rem; color:#ccc; white-space:pre-wrap; max-height:120px; overflow-y:auto; line-height:1.5;">${node.content || ''}</div>
            </div>`;
        }).join('') || '<p style="color:#555; font-style:italic; font-size:0.85rem;">Cinturón vacío.</p>';

        // Skill selector options
        const skillOptions = this.skillsCache
            .filter(s => !activeSkillIds.includes(s.id))
            .map(s => `<option value="${s.id}">${s.title}</option>`)
            .join('');

        pmBody.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
            <div>
                <div style="font-size:0.7rem; color:#888; text-transform:uppercase; margin-bottom:4px;">ID</div>
                <div style="font-family:var(--font-mono); color:var(--accent-indigo); font-size:0.9rem;">${user.id}</div>
            </div>
            <div>
                <div style="font-size:0.7rem; color:#888; text-transform:uppercase; margin-bottom:4px;">Motor</div>
                <div style="font-family:var(--font-mono); color:white; font-size:0.9rem;">${user.profile?.preferredEngine || 'anthropic'}</div>
            </div>
        </div>

        ${isAi ? `
        <div style="margin-bottom:1.5rem;">
            <div class="pm-brain-header">
                <span style="font-size:0.75rem; color:var(--accent-purple); font-weight:900; text-transform:uppercase; letter-spacing:1px;">🧠 AGENT.md (System Prompt)</span>
                <button id="btnSaveAgentPrompt" class="btn-primary" style="font-size:0.7rem; padding:5px 12px; display:none;">💾 Sellar Cerebro</button>
            </div>
            <div class="pm-brain-content" id="pmSemanticProfile" contenteditable="false">${promptNode?.content || ''}</div>
        </div>

        <div id="pmSkillEquipperContainer" style="margin-bottom:1.5rem; border-top:1px dashed #333; padding-top:1rem;">
            <label style="color:var(--accent-green); font-size:0.72rem; font-weight:bold; text-transform:uppercase; margin-bottom:6px; display:block;">🎒 Equipar Nueva Skill</label>
            <select id="pmSkillSelector" style="width:100%; background:rgba(0,0,0,0.5); border:1px solid var(--accent-green); color:white; padding:10px; border-radius:8px; font-family:var(--font-main); outline:none; cursor:pointer;">
                <option value="">➕ Selecciona una Skill...</option>
                ${skillOptions}
            </select>
        </div>
        ` : ''}

        <div>
            <div style="font-size:0.75rem; color:#888; text-transform:uppercase; margin-bottom:10px; font-weight:bold; letter-spacing:1px;">🎒 Skills Equipadas</div>
            <div id="pmEquippedSkills">${skillsHtml}</div>
        </div>`;

        if (isAi) {
            const promptBox    = document.getElementById('pmSemanticProfile');
            const btnSavePrompt = document.getElementById('btnSaveAgentPrompt');

            promptBox?.addEventListener('focus', () => { btnSavePrompt.style.display = 'inline-flex'; });
            document.getElementById('pmSkillSelector')?.addEventListener('change', async (e) => {
                const skillId = e.target.value;
                if (!skillId) return;
                e.target.value = '';
                await this._equipSkillToAgent(user, skillId);
            });

            document.getElementById('btnSaveAgentPrompt')?.addEventListener('click', async () => {
                const newContent = promptBox?.innerText.trim();
                const btn = document.getElementById('btnSaveAgentPrompt');
                btn.innerText = '⏳...';
                await KB.init();
                let pn = await KB.getNode(promptId);
                if (pn) { pn.content = newContent; await KB.saveNode(pn); }
                btn.innerText = '✅ Sellado';
            });
        }
    }

    async _equipSkillToAgent(user, skillId) {
        const activeSkills = [...(user.profile?.active_skills || [])];
        if (activeSkills.includes(skillId)) return;
        activeSkills.push(skillId);

        const updatedUser = { ...user, profile: { ...user.profile, active_skills: activeSkills } };
        await store.dispatch({ type: 'UPDATE_USER', payload: updatedUser });

        // Actualizar prompt en KB
        await KB.init();
        const promptId = `prompt_global_${user.id.replace('@', '')}`;
        let promptNode = await KB.getNode(promptId);
        if (promptNode) {
            promptNode.dependencies = activeSkills;
            await KB.saveNode(promptNode);
        }

        // Refrescar skills equipadas en el modal
        const skill = this.skillsCache.find(s => s.id === skillId);
        const equippedDiv = document.getElementById('pmEquippedSkills');
        if (equippedDiv && skill) {
            equippedDiv.insertAdjacentHTML('afterbegin', `
                <div style="background:rgba(0,0,0,0.6); border:1px solid rgba(0,230,118,0.3); border-radius:10px; padding:10px 14px; margin-bottom:8px; animation:fadeIn 0.3s;">
                    <span style="color:var(--accent-green); font-weight:bold; font-family:var(--font-mono); font-size:0.82rem;">🎒 ${skill.title}</span>
                    <span style="color:var(--accent-green); font-size:0.7rem; margin-left:8px;">✅ Equipada</span>
                </div>`);
        }

        this.activeAgentProfile = updatedUser;
        window.dispatchEvent(new CustomEvent('refresh-lms-data'));
    }

    // Alias V9
    executeViewScript() { return this.afterRender(); }
}
