// v5/js/views/ProfileView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ProfileView {
    constructor() {
        document.title = "Mi Perfil & Reputación | TeamTowers";
        
        this.guardians = [
            { id: 'creator', label: '🎨 Creador (Innovación)' },
            { id: 'caregiver', label: '❤️ Cuidador (Soporte)' },
            { id: 'ruler', label: '👑 Gobernante (Estructura)' },
            { id: 'jester', label: '🃏 Bufón (Disrupción)' },
            { id: 'everyman', label: '🤝 Ciudadano (Realismo)' },
            { id: 'lover', label: '🔥 Amante (Pasión)' },
            { id: 'hero', label: '⚔️ Héroe (Ejecución)' },
            { id: 'outlaw', label: '🏴‍☠️ Rebelde (Cambio)' },
            { id: 'magician', label: '✨ Mago (Transformación)' },
            { id: 'innocent', label: '🕊️ Inocente (Ética)' },
            { id: 'explorer', label: '🧭 Explorador (Búsqueda)' },
            { id: 'sage', label: '🦉 Sabio (Verdad)' }
        ];

        this.levels = [
            { id: '@anxaneta', label: '👑 @anxaneta (Visión)' },
            { id: '@aixecador', label: '🧭 @aixecador (Coordinación)' },
            { id: '@dosos', label: '👁️ @dosos (Auditoría/QA)' },
            { id: '@baixos', label: '⚙️ @baixos (Especialista)' },
            { id: '@pinya', label: '🤝 @pinya (Operaciones)' }
        ];
    }

    async getHtml() {
        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                
                .workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; flex-direction: column; }
                
                /* HEADER PERFIL */
                .profile-header { display: flex; align-items: center; justify-content: space-between; gap: 2rem; margin-bottom: 3rem; background: rgba(255,255,255,0.02); padding: 2rem; border-radius: var(--border-radius-lg); border: 1px solid var(--glass-border); position: relative; overflow: hidden;}
                .profile-header::before { content: ''; position: absolute; top: -50px; right: -50px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(0, 176, 255, 0.1) 0%, transparent 70%); border-radius: 50%; z-index: 0; pointer-events: none;}
                
                .profile-basic-info { display: flex; align-items: center; gap: 2rem; z-index: 1;}
                .profile-avatar { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); display: flex; justify-content: center; align-items: center; font-size: 3rem; font-weight: bold; color: white; box-shadow: 0 10px 30px rgba(0, 176, 255, 0.3);}
                .profile-info h1 { margin: 0; font-size: 2.5rem; color: white; letter-spacing: -1px; }
                .profile-info p { margin: 5px 0 0 0; color: var(--text-muted); font-family: var(--font-mono); font-size: 1rem; }
                
                .btn-save-profile { background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; z-index: 1; transition: transform 0.2s, box-shadow 0.2s;}
                .btn-save-profile:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(179, 136, 255, 0.4); }

                /* ESTADÍSTICAS GLOBALES */
                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
                .stat-card { background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: var(--border-radius-md); text-align: center; transition: transform 0.2s; }
                .stat-card:hover { transform: translateY(-5px); border-color: #555; }
                .stat-value { font-size: 2.5rem; color: var(--accent-green); font-weight: 800; font-family: var(--font-mono); margin-bottom: 5px; }
                .stat-label { color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }

                /* SECCIONES: PROYECTOS Y SKILLS */
                .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                
                .section-title { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px;}
                .panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 2rem; }
                
                /* EDITOR DE IDENTIDAD (JOB BOARD 3.0) */
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px; font-weight: bold; text-transform: uppercase;}
                .vision-textarea { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); color: white; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 0.95rem; min-height: 100px; resize: vertical; }
                .vision-textarea:focus { outline: none; border-color: var(--accent-blue); }

                .tag-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
                .tag-checkbox { display: none; }
                .tag-label { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); padding: 8px 12px; border-radius: 6px; color: #ccc; font-size: 0.8rem; cursor: pointer; text-align: center; transition: all 0.2s; user-select: none; display: block;}
                .tag-checkbox:checked + .tag-label { background: rgba(0, 176, 255, 0.15); border-color: var(--accent-blue); color: white; font-weight: bold;}
                .tag-checkbox:checked + .tag-label.guardian-auth { background: rgba(224, 64, 251, 0.15); border-color: var(--accent-purple); }

                /* LISTA DE PROYECTOS */
                .project-row { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 0; border-bottom: 1px solid var(--glass-border); }
                .project-row:last-child { border-bottom: none; }
                .project-name { color: white; font-weight: bold; font-size: 1.1rem; }
                .project-role { color: var(--accent-blue); font-size: 0.8rem; font-family: var(--font-mono); background: rgba(0, 176, 255, 0.1); padding: 4px 8px; border-radius: 4px; margin-top: 5px; display: inline-block;}
                .project-slices { text-align: right; }
                .project-slices .amt { color: var(--accent-green); font-size: 1.2rem; font-weight: bold; font-family: var(--font-mono); }
                
                /* SKILLS Y PROMPT */
                .skills-container { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 2rem;}
                .skill-badge { background: #1a1a24; border: 1px solid #333; color: #ccc; padding: 8px 15px; border-radius: 20px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; }
                .skill-count { background: var(--accent-blue); color: #000; padding: 2px 6px; border-radius: 10px; font-size: 0.7rem; font-weight: bold; }

                .pm-ikigai { background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); border-radius: 8px; padding: 15px; margin-top: 2rem;}
                .pm-section-title { font-size: 0.8rem; color: var(--accent-purple); text-transform: uppercase; font-weight: bold; margin-bottom: 10px; display: flex; justify-content: space-between;}
                .pm-prompt-text { font-family: var(--font-mono); font-size: 0.85rem; color: #ccc; line-height: 1.5; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 6px; border: 1px dashed #444;}

                @media (max-width: 1024px) {
                    .content-grid { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .app-layout { flex-direction: column; }
                    .workspace { padding: 1rem; }
                    .stats-grid { grid-template-columns: 1fr; }
                    .profile-header { flex-direction: column; text-align: center; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/profile')}

                <main class="workspace">
                    <div class="profile-header">
                        <div class="profile-basic-info">
                            <div class="profile-avatar" id="profInitials">?</div>
                            <div class="profile-info">
                                <h1 id="profName">Usuario Desconocido</h1>
                                <p id="profId">@id</p>
                            </div>
                        </div>
                        <button class="btn-save-profile" id="btnSaveProfile">💾 Guardar Identidad</button>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value" id="totSlices">0</div>
                            <div class="stat-label">Slices Acumulados (Total)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="totHours" style="color: var(--accent-blue);">0h</div>
                            <div class="stat-label">Horas de Deep Work (PoW)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="totProjects" style="color: var(--accent-purple);">0</div>
                            <div class="stat-label">Redes Activas</div>
                        </div>
                    </div>

                    <div class="content-grid">
                        <div class="panel">
                            <h3 class="section-title">🧬 Identidad Fractal (Job Board)</h3>
                            
                            <div class="form-group">
                                <label>1. Visión Semántica y Skills (CV Libre)</label>
                                <textarea id="inpVision" class="vision-textarea" placeholder="Ej: Desarrollador Full-Stack apasionado por la gobernanza descentralizada. Busco DAOs donde aportar en código y diseño de incentivos..."></textarea>
                            </div>

                            <div class="form-group">
                                <label>2. Afinidad Estructural (¿Dónde aportas más valor?)</label>
                                <div class="tag-grid" id="gridLevels">
                                    ${this.levels.map(l => `
                                        <div>
                                            <input type="checkbox" class="tag-checkbox" id="lvl_${l.id}" value="${l.id}">
                                            <label class="tag-label" for="lvl_${l.id}">${l.label}</label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="form-group" style="margin-top: 2.5rem;">
                                <label style="color: var(--accent-purple);">3. Los 12 Guardianes: Autoridad Actual</label>
                                <p style="font-size: 0.75rem; color: #888; margin-top: -5px; margin-bottom: 10px;">¿En qué arquetipos eres ya un referente para tu equipo?</p>
                                <div class="tag-grid" id="gridGuardiansAuth">
                                    ${this.guardians.map(g => `
                                        <div>
                                            <input type="checkbox" class="tag-checkbox" id="g_auth_${g.id}" value="${g.id}">
                                            <label class="tag-label guardian-auth" for="g_auth_${g.id}">${g.label}</label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="form-group" style="margin-top: 2rem;">
                                <label style="color: var(--accent-green);">4. Los 12 Guardianes: Interés de Crecimiento</label>
                                <p style="font-size: 0.75rem; color: #888; margin-top: -5px; margin-bottom: 10px;">¿Qué habilidades intangibles quieres desarrollar en tus próximos proyectos?</p>
                                <div class="tag-grid" id="gridGuardiansGrowth">
                                    ${this.guardians.map(g => `
                                        <div>
                                            <input type="checkbox" class="tag-checkbox" id="g_grow_${g.id}" value="${g.id}">
                                            <label class="tag-label" for="g_grow_${g.id}">${g.label}</label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div class="panel" style="margin-bottom: 2rem;">
                                <h3 class="section-title">🌐 Mis Redes de Valor</h3>
                                <div id="projectsList"></div>
                            </div>

                            <div class="panel">
                                <h3 class="section-title">🏅 Skills Verificadas (SBTs)</h3>
                                <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1.5rem;">Habilidades certificadas inmutablemente a través del Ledger de entregables reales.</p>
                                <div class="skills-container" id="skillsList"></div>

                                <div class="pm-ikigai">
                                    <div class="pm-section-title">
                                        <span>🧠 AI System Prompt (Motor de Matching)</span>
                                        <span style="color: rgba(255,255,255,0.3); font-size: 0.6rem;">AUTO-GENERADO</span>
                                    </div>
                                    <div class="pm-prompt-text" id="aiSystemPrompt">
                                        Rellena tu Identidad Fractal y guarda para generar tu huella semántica.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

        this.dom = {
            profName: document.getElementById('profName'),
            profId: document.getElementById('profId'),
            profInitials: document.getElementById('profInitials'),
            inpVision: document.getElementById('inpVision'),
            btnSave: document.getElementById('btnSaveProfile'),
            aiSystemPrompt: document.getElementById('aiSystemPrompt')
        };

        const state = store.getState();
        this.activeUserId = state.session.activeUserId;

        // 1. CARGAR DATOS DEL USUARIO
        const user = state.globalUsers.find(u => u.id === this.activeUserId);
        
        if (user) {
            this.dom.profName.innerText = user.name;
            this.dom.profId.innerText = user.id;
            this.dom.profInitials.innerText = user.name.charAt(0).toUpperCase();
            
            // Cargar Identidad guardada
            if (user.profile) {
                this.dom.inpVision.value = user.profile.vision || '';
                
                (user.profile.structural_affinity || []).forEach(val => {
                    const cb = document.getElementById(`lvl_${val}`);
                    if(cb) cb.checked = true;
                });
                
                (user.profile.guardian_authority || []).forEach(val => {
                    const cb = document.getElementById(`g_auth_${val}`);
                    if(cb) cb.checked = true;
                });

                (user.profile.guardian_growth || []).forEach(val => {
                    const cb = document.getElementById(`g_grow_${val}`);
                    if(cb) cb.checked = true;
                });
            }
        } else {
            this.dom.profName.innerText = "Administrador del Sistema";
            this.dom.profId.innerText = this.activeUserId;
            this.dom.profInitials.innerText = "⚙️";
        }

        // Generar el Prompt Inicial
        this.updateSystemPromptDisplay();

        // 2. EVENTOS DE GUARDADO
        this.dom.btnSave.addEventListener('click', () => this.saveIdentity());

        // 3. ANALIZAR PARTICIPACIÓN EN PROYECTOS (ESTADÍSTICAS Y SBTs)
        this.calculateReputationAndStats(state);
    }

    saveIdentity() {
        if (this.activeUserId === 'ecosystem-admin') {
            return alert("El usuario administrador del sistema no tiene perfil público.");
        }

        // Recolectar datos
        const vision = this.dom.inpVision.value.trim();
        
        const structural_affinity = Array.from(document.querySelectorAll('input[id^="lvl_"]:checked')).map(el => el.value);
        const guardian_authority = Array.from(document.querySelectorAll('input[id^="g_auth_"]:checked')).map(el => el.value);
        const guardian_growth = Array.from(document.querySelectorAll('input[id^="g_grow_"]:checked')).map(el => el.value);

        // Modificamos directamente el estado (ya que no tenemos una acción explícita UPDATE_USER_PROFILE en el reducer base)
        const currentState = store.getState();
        const userIndex = currentState.globalUsers.findIndex(u => u.id === this.activeUserId);
        
        if (userIndex > -1) {
            currentState.globalUsers[userIndex].profile = {
                vision,
                structural_affinity,
                guardian_authority,
                guardian_growth,
                lastUpdated: Date.now()
            };

            // Forzamos el guardado en localStorage
            store.state = currentState;
            localStorage.setItem('tt_sos_state', JSON.stringify(currentState));

            this.updateSystemPromptDisplay();
            
            // Feedback visual
            const originalText = this.dom.btnSave.innerText;
            this.dom.btnSave.innerText = "✅ ¡Identidad Guardada!";
            this.dom.btnSave.style.background = "var(--accent-green)";
            
            setTimeout(() => {
                this.dom.btnSave.innerText = originalText;
                this.dom.btnSave.style.background = "linear-gradient(45deg, var(--accent-blue), var(--accent-purple))";
            }, 2000);
        }
    }

    updateSystemPromptDisplay() {
        const structural_affinity = Array.from(document.querySelectorAll('input[id^="lvl_"]:checked')).map(el => el.value);
        const guardian_authority = Array.from(document.querySelectorAll('input[id^="g_auth_"]:checked')).map(el => el.value);
        const guardian_growth = Array.from(document.querySelectorAll('input[id^="g_grow_"]:checked')).map(el => el.value);

        const authLabels = guardian_authority.map(id => this.guardians.find(g => g.id === id)?.label.split(' ')[1] || id);
        const growthLabels = guardian_growth.map(id => this.guardians.find(g => g.id === id)?.label.split(' ')[1] || id);

        if (structural_affinity.length === 0 && guardian_authority.length === 0) {
            this.dom.aiSystemPrompt.innerHTML = "Rellena tu Identidad Fractal y guarda para generar tu huella semántica.";
            return;
        }

        this.dom.aiSystemPrompt.innerHTML = `
            <span style="color: #888;">/* Target Semántico para Matching IA */</span><br>
            <span style="color: var(--accent-blue);">Niveles Óptimos:</span> [${structural_affinity.join(', ')}]<br>
            <span style="color: var(--accent-purple);">Autoridad Intangible:</span> [${authLabels.join(', ')}]<br>
            <span style="color: var(--accent-green);">Interés Evolutivo:</span> [${growthLabels.join(', ')}]<br>
            <br>
            <span style="color: #888;">// Los Project Owners que busquen estos guardianes en la red verán tu perfil destacado por el orquestador.</span>
        `;
    }

    calculateReputationAndStats(state) {
        let globalSlices = 0;
        let globalHours = 0;
        let activeProjectsCount = 0;
        const projectRowsHtml = [];
        const skillsMap = {};

        state.projects.forEach(p => {
            const userLedgerEntries = (p.ledger || []).filter(entry => entry.userId === this.activeUserId);
            
            if (userLedgerEntries.length > 0) {
                activeProjectsCount++;
                let projectSlices = 0;
                let projectRoles = new Set();

                userLedgerEntries.forEach(entry => {
                    projectSlices += entry.valorCongelado;
                    globalSlices += entry.valorCongelado;
                    globalHours += entry.horas || 0;
                    
                    const rolObj = p.roles.find(r => r.id === entry.roleId);
                    if (rolObj) {
                        projectRoles.add(rolObj.name);
                        const skillTag = this.inferSkill(rolObj.levelId, entry.description);
                        skillsMap[skillTag] = (skillsMap[skillTag] || 0) + 1;
                    }
                });

                projectRowsHtml.push(`
                    <div class="project-row">
                        <div>
                            <div class="project-name">${p.nombre}</div>
                            <div class="project-role">${Array.from(projectRoles).join(', ')}</div>
                        </div>
                        <div class="project-slices">
                            <div class="amt">${Math.round(projectSlices).toLocaleString()} Slices</div>
                        </div>
                    </div>
                `);
            }
        });

        // Pintar Stats
        document.getElementById('totSlices').innerText = Math.round(globalSlices).toLocaleString();
        document.getElementById('totHours').innerText = globalHours.toFixed(1) + 'h';
        document.getElementById('totProjects').innerText = activeProjectsCount;

        // Pintar Proyectos
        const pList = document.getElementById('projectsList');
        if (projectRowsHtml.length > 0) {
            pList.innerHTML = projectRowsHtml.join('');
        } else {
            pList.innerHTML = `<p style="color: var(--text-muted); font-style: italic; padding: 2rem; text-align: center; border: 1px dashed #333; border-radius: 8px;">Aún no tienes Slices consolidados.<br><br>Ve a 'Explorar DAOs', únete a un Castell y haz Pull de tareas para empezar a generar valor.</p>`;
        }

        // Pintar Skills (SBTs)
        const sList = document.getElementById('skillsList');
        const sortedSkills = Object.entries(skillsMap).sort((a, b) => b[1] - a[1]);
        
        if (sortedSkills.length > 0) {
            sList.innerHTML = sortedSkills.map(([skill, count]) => `
                <div class="skill-badge">
                    ${skill} <span class="skill-count">${count}</span>
                </div>
            `).join('');
        } else {
            sList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 0;">Completa entregables (Proof of Work) para ganar badges de reputación.</p>`;
        }
    }

    inferSkill(levelId, description) {
        const descLower = description.toLowerCase();
        if (levelId === '@baixos' && (descLower.includes('código') || descLower.includes('api') || descLower.includes('dev'))) return 'Backend Eng';
        if (levelId === '@baixos') return 'Technical Execution';
        if (levelId === '@anxaneta') return 'Strategy & Leadership';
        if (levelId === '@aixecador') return 'Project Management';
        if (levelId === '@dosos') return 'QA & Auditing';
        if (levelId === '@pinya') return 'Community & Support';
        return 'General Contributor';
    }
}
