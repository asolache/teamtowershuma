// v8/js/views/ProfileView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js'; 

export default class ProfileView {
    constructor() {
        document.title = "Mi Perfil | TeamTowers V8";
        
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
            { id: '@aixecador', label: '🧭 @aixecador (Táctica)' },
            { id: '@dosos', label: '👁️ @dosos (Auditoría/QA)' },
            { id: '@baixos', label: '⚙️ @baixos (Producción)' },
            { id: '@pinya', label: '🤝 @pinya (Soporte)' }
        ];
        
        this.currentTab = 'perfil';
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);

        if (!user) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/profile')}
                    <main class="workspace" style="display:flex; justify-content:center; align-items:center;">
                        <div style="text-align:center;">
                            <h2>No estás conectado</h2>
                            <a href="/v8/" data-link style="color:var(--accent-blue);">Volver al Home</a>
                        </div>
                    </main>
                    ${BottomNav.getHtml('/profile')}
                </div>
            `;
        }

        const isOpen = user?.profile?.isOpenToWork || false;
        const statusBtnClass = isOpen ? 'btn-status-open' : 'btn-status-closed';
        const statusBtnText = isOpen ? '🟢 Abierto a Flujo' : '🔴 Nodo Oculto';

        const headerConfig = {
            title: "Mi Identidad",
            subtitle: user.id,
            tagline: "Tu ADN Fractal y Reputación Web3 consolidada en Slices.",
            actionHtml: `<button id="btnToggleAvailability" class="${statusBtnClass}">${statusBtnText}</button>`,
            tabs: [
                { id: 'perfil', label: '🧬 ADN Fractal', active: this.currentTab === 'perfil' },
                { id: 'proyectos', label: '🌐 Redes y Slices', active: this.currentTab === 'proyectos' },
                { id: 'skills', label: '🏅 Skills Validados', active: this.currentTab === 'skills' }
            ],
            magicActions: [
                { id: 'ai_ikigai', label: 'Sintetizar Ikigai', icon: '🧠', isAi: true, tokens: 100 }
            ]
        };

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; scroll-behavior: smooth; width: 100%;}
                
                .tab-content { display: none; animation: fadeIn 0.3s ease-out; padding-bottom: 5rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }

                /* STATUS BUTTON */
                .btn-status-closed { background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 8px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; cursor: pointer; transition: all 0.2s;}
                .btn-status-open { background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 8px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 15px rgba(0,230,118,0.2);}

                /* FORMS LUXURY */
                .form-group { margin-bottom: 2rem; width: 100%;}
                .form-group label { display: block; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
                .lux-input { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: white; padding: 14px 20px; border-radius: 12px; font-family: inherit; font-size: 1rem; box-sizing: border-box; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3); transition: 0.3s; outline:none;}
                .lux-input:focus { border-color: var(--accent-blue); box-shadow: inset 0 2px 5px rgba(0,0,0,0.3), 0 0 15px rgba(0,176,255,0.2);}
                .vision-textarea { min-height: 140px; resize: vertical; }

                /* TAG GRIDS */
                .tag-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; width: 100%;}
                .tag-checkbox { display: none; }
                .tag-label { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); padding: 12px 15px; border-radius: 12px; color: #ccc; font-size: 0.85rem; cursor: pointer; text-align: center; transition: all 0.2s; user-select: none; display: block; font-weight: bold;}
                
                .tag-checkbox:checked + .tag-label { background: rgba(0, 176, 255, 0.15); border-color: var(--accent-blue); color: white; box-shadow: 0 5px 15px rgba(0,176,255,0.15);}
                .tag-checkbox:checked + .tag-label.guardian-auth { background: rgba(224, 64, 251, 0.15); border-color: var(--accent-purple); box-shadow: 0 5px 15px rgba(224,64,251,0.15);}
                .tag-checkbox:checked + .tag-label.guardian-growth { background: rgba(0, 230, 118, 0.15); border-color: var(--accent-green); box-shadow: 0 5px 15px rgba(0,230,118,0.15);}

                /* IKIGAI AI BOX */
                .pm-ikigai { background: linear-gradient(145deg, rgba(30,20,35,0.6), rgba(15,10,20,0.8)); border: 1px solid rgba(224, 64, 251, 0.3); border-radius: 16px; padding: 25px; margin-top: 3rem; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5);}
                .pm-section-title { font-size: 0.9rem; color: var(--accent-purple); text-transform: uppercase; font-weight: 900; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; letter-spacing: 1px;}
                .pm-prompt-text { font-family: var(--font-mono); font-size: 0.95rem; color: #ccc; line-height: 1.6; background: rgba(0,0,0,0.6); padding: 20px; border-radius: 12px; border: 1px dashed var(--accent-purple); word-break: break-word;}
                .verified-badge { font-size: 0.75rem; background: rgba(255, 171, 64, 0.1); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 4px 10px; border-radius: 8px; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 1px; display: inline-flex; align-items: center; gap: 5px;}

                .btn-save-profile { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 16px 30px; border-radius: 12px; font-weight: 900; font-size: 1.05rem; cursor: pointer; transition: all 0.3s ease; width: 100%; margin-top: 2rem; box-shadow: 0 5px 20px rgba(0,176,255,0.2);}
                .btn-save-profile:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(224,64,251,0.4); filter: brightness(1.1);}

                /* TAB 2: PROYECTOS Y SLICES */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; width: 100%; box-sizing: border-box;}
                .stat-card { background: linear-gradient(145deg, rgba(25,25,30,0.8), rgba(15,15,20,0.9)); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); backdrop-filter: blur(10px);}
                .stat-value { font-size: 3rem; color: var(--accent-green); font-weight: 900; font-family: var(--font-mono); margin-bottom: 5px; line-height:1; text-shadow: 0 5px 15px rgba(0,230,118,0.2);}
                .stat-label { color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;}

                .project-row { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; margin-bottom: 1rem; background: rgba(255,255,255,0.02); flex-wrap: wrap; gap: 15px;}
                .project-name { color: white; font-weight: 900; font-size: 1.2rem; margin-bottom: 5px;}
                .project-role { color: var(--accent-blue); font-size: 0.8rem; font-family: var(--font-mono); background: rgba(0, 176, 255, 0.1); padding: 4px 10px; border-radius: 6px; display: inline-block; font-weight:bold;}
                .project-slices { text-align: right; }
                .project-slices .amt { color: var(--accent-green); font-size: 1.5rem; font-weight: 900; font-family: var(--font-mono); line-height: 1; margin-bottom: 5px;}

                /* TAB 3: SKILLS (SBTs) */
                .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; width: 100%; box-sizing: border-box;}
                .skill-card { background: linear-gradient(145deg, rgba(25,25,30,0.8), rgba(15,15,20,0.9)); border: 1px solid var(--glass-border); border-radius: 20px; padding: 1.8rem; transition: transform 0.3s, box-shadow 0.3s; backdrop-filter: blur(10px);}
                .skill-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,176,255,0.15); border-color: rgba(0,176,255,0.3);}
                .skill-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 15px; margin-bottom: 15px;}
                .skill-name { color: white; font-weight: 900; font-size: 1.1rem; }
                .skill-count { background: rgba(0, 176, 255, 0.1); border: 1px solid rgba(0, 176, 255, 0.3); color: var(--accent-blue); padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-family: var(--font-mono); font-weight: bold;}
                .skill-source-list { display: flex; flex-direction: column; gap: 10px;}
                .skill-source { font-size: 0.85rem; color: #aaa; display: flex; align-items: center; gap: 8px;}
                .skill-link { color: #888; text-decoration: none; border-bottom: 1px dashed #555; transition: color 0.2s;}
                .skill-link:hover { color: white; border-color: white;}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

                /* MOBILE FIXES */
                @media (max-width: 768px) { 
                    .workspace { padding: 90px 1rem 120px 1rem; } 
                    .btn-status-closed, .btn-status-open { width: 100%; justify-content: center; display: flex;}
                    .stats-grid, .skills-grid { grid-template-columns: 1fr; }
                    .pm-section-title { flex-direction: column; align-items: flex-start; gap: 10px; }
                    .tag-grid { grid-template-columns: 1fr 1fr; }
                    .auth-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/profile')}

                <main class="workspace">
                    
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="tab-perfil" class="tab-content active">
                        
                        <div style="background: rgba(0,0,0,0.3); border: 1px dashed var(--glass-border); padding: 20px; border-radius: 16px; margin-bottom: 2rem;">
                            <div style="color: var(--accent-blue); font-weight:bold; margin-bottom: 15px; font-size: 0.9rem; text-transform:uppercase;">Identificadores Clave (Login)</div>
                            <div class="auth-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                                <div class="form-group" style="margin:0;">
                                    <label>Nombre a mostrar</label>
                                    <input type="text" id="inpName" class="lux-input" value="${user.name}">
                                </div>
                                <div class="form-group" style="margin:0;">
                                    <label>Email de Contacto</label>
                                    <input type="email" id="inpEmail" class="lux-input" value="${user.email || ''}" placeholder="correo@dominio.com">
                                </div>
                                <div class="form-group" style="margin:0; grid-column: 1 / -1;">
                                    <label style="color:var(--accent-purple);">Wallet Web3 / Arweave Address</label>
                                    <input type="text" id="inpWallet" class="lux-input" value="${user.wallet || ''}" placeholder="0x... o ar...">
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>1. Visión y Skills (Ikigai en Bruto)</label>
                            <textarea id="inpVision" class="lux-input vision-textarea" placeholder="Ej: Desarrollador Full-Stack apasionado por la gobernanza. Busco DAOs donde aportar en código y diseño de incentivos..."></textarea>
                        </div>

                        <div class="form-group">
                            <label style="color: var(--accent-blue);">2. Afinidad Estructural (¿Dónde aportas más valor?)</label>
                            <div class="tag-grid" id="gridLevels">
                                ${this.levels.map(l => `
                                    <div>
                                        <input type="checkbox" class="tag-checkbox" id="lvl_${l.id}" value="${l.id}">
                                        <label class="tag-label" for="lvl_${l.id}">${l.label}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label style="color: var(--accent-purple);">3. Autoridad Actual (Arquetipos Pantheon)</label>
                            <div class="tag-grid" id="gridGuardiansAuth">
                                ${this.guardians.map(g => `
                                    <div>
                                        <input type="checkbox" class="tag-checkbox" id="g_auth_${g.id}" value="${g.id}">
                                        <label class="tag-label guardian-auth" for="g_auth_${g.id}">${g.label}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label style="color: var(--accent-green);">4. Interés de Crecimiento</label>
                            <div class="tag-grid" id="gridGuardiansGrowth">
                                ${this.guardians.map(g => `
                                    <div>
                                        <input type="checkbox" class="tag-checkbox" id="g_grow_${g.id}" value="${g.id}">
                                        <label class="tag-label guardian-growth" for="g_grow_${g.id}">${g.label}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <button class="btn-save-profile" id="btnSaveProfile">💾 Sellar Identidad Fractal</button>

                        <div class="pm-ikigai">
                            <div class="pm-section-title">
                                <span style="display:flex; align-items:center; gap:8px;">🧠 Huella Semántica V8 <span id="badgeMinted" class="verified-badge" style="display:none;">🕸️ Permaweb</span></span>
                            </div>
                            <div class="pm-prompt-text" id="aiSystemPrompt">
                                Rellena tu Identidad Fractal y guárdala. Luego, usa el Motor IA del Header para generar tu huella semántica.
                            </div>
                        </div>
                    </div>

                    <div id="tab-proyectos" class="tab-content">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value" id="totSlices">0</div>
                                <div class="stat-label">Slices Acumulados</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="totHours" style="color: var(--accent-blue);">0h</div>
                                <div class="stat-label">Horas Deep Work</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="totProjects" style="color: var(--accent-purple);">0</div>
                                <div class="stat-label">Redes Involucradas</div>
                            </div>
                        </div>

                        <h3 style="color: white; font-size: 1.4rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 15px; margin-bottom: 2rem; font-weight:900; letter-spacing:-0.5px;">Tus Ecosistemas</h3>
                        <div id="projectsList"></div>
                    </div>

                    <div id="tab-skills" class="tab-content">
                        <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2rem; line-height:1.5;">Las habilidades (Soulbound Tokens) se infieren matemáticamente de las tareas <i>(Proof of Work)</i> que has completado y consolidado en el Ledger de cualquier Castell.</p>
                        <div class="skills-grid" id="skillsList"></div>
                    </div>
                </main>

                ${BottomNav.getHtml('/profile')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        const state = store.getState();
        this.activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === this.activeUserId);
        if (!user) return;

        this.dom = {
            inpName: document.getElementById('inpName'),
            inpEmail: document.getElementById('inpEmail'),
            inpWallet: document.getElementById('inpWallet'),
            inpVision: document.getElementById('inpVision'),
            btnSave: document.getElementById('btnSaveProfile'),
            aiSystemPrompt: document.getElementById('aiSystemPrompt'),
            badgeMinted: document.getElementById('badgeMinted'),
            btnToggleAvailability: document.getElementById('btnToggleAvailability')
        };

        // CARGA DE DATOS DE USUARIO
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

            if (user.profile.permawebHash) {
                this.dom.badgeMinted.style.display = 'inline-flex';
            }
            
            this.updateSystemPromptDisplay(user.profile.permawebHash, user.profile.ikigaiSummary);
        }

        // TABS LOGIC V8 EVENT SYNC
        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`tab-${this.currentTab}`);
            if(target) target.classList.add('active');
        });

        // MAGIC ACTION EVENT (IKIGAI GENERATION V8)
        window.addEventListener('ph-magic-action', (e) => {
            if(e.detail.actionId === 'ai_ikigai') {
                this.saveIdentity(true); 
                this.executeMintingProcess();
            }
        });

        // STATUS TOGGLE
        if(this.dom.btnToggleAvailability) {
            this.dom.btnToggleAvailability.addEventListener('click', () => {
                const currentState = store.getState();
                const uIdx = currentState.globalUsers.findIndex(u => u.id === this.activeUserId);
                if (uIdx > -1) {
                    const currentStatus = currentState.globalUsers[uIdx].profile.isOpenToWork || false;
                    const newStatus = !currentStatus;
                    
                    store.dispatch({
                        type: 'UPDATE_USER_PROFILE',
                        payload: { userId: this.activeUserId, profile: { isOpenToWork: newStatus } }
                    }).then(() => {
                        this.dom.btnToggleAvailability.className = newStatus ? 'btn-status-open' : 'btn-status-closed';
                        this.dom.btnToggleAvailability.innerText = newStatus ? '🟢 Abierto a Flujo' : '🔴 Nodo Oculto';
                    });
                }
            });
        }

        // EVENTOS GUARDADO NORMAL
        this.dom.btnSave.addEventListener('click', () => this.saveIdentity(false));

        this.calculateReputationAndStats(state);
    }

    saveIdentity(isMinting = false) {
        const name = this.dom.inpName.value.trim();
        const email = this.dom.inpEmail.value.trim();
        const wallet = this.dom.inpWallet.value.trim();
        const vision = this.dom.inpVision.value.trim();
        const structural_affinity = Array.from(document.querySelectorAll('input[id^="lvl_"]:checked')).map(el => el.value);
        const guardian_authority = Array.from(document.querySelectorAll('input[id^="g_auth_"]:checked')).map(el => el.value);
        const guardian_growth = Array.from(document.querySelectorAll('input[id^="g_grow_"]:checked')).map(el => el.value);

        const currentState = store.getState();
        const userIndex = currentState.globalUsers.findIndex(u => u.id === this.activeUserId);
        
        if (userIndex > -1) {
            // Actualizamos datos básicos en el objeto superior
            currentState.globalUsers[userIndex].name = name;
            currentState.globalUsers[userIndex].email = email;
            currentState.globalUsers[userIndex].wallet = wallet;

            const existingHash = currentState.globalUsers[userIndex].profile?.permawebHash;
            const existingIkigai = currentState.globalUsers[userIndex].profile?.ikigaiSummary;
            
            store.dispatch({
                type: 'UPDATE_USER_PROFILE',
                payload: {
                    userId: this.activeUserId,
                    profile: { vision, structural_affinity, guardian_authority, guardian_growth }
                }
            }).then(() => {
                if(!isMinting) this.updateSystemPromptDisplay(existingHash, existingIkigai);
                
                if (!isMinting) {
                    const originalText = this.dom.btnSave.innerText;
                    this.dom.btnSave.innerText = "✅ Identidad Guardada en Kernel";
                    this.dom.btnSave.style.background = "var(--accent-green)";
                    this.dom.btnSave.style.color = "black";
                    setTimeout(() => {
                        this.dom.btnSave.innerText = originalText;
                        this.dom.btnSave.style.background = "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))";
                        this.dom.btnSave.style.color = "white";
                    }, 2000);
                }
            });
        }
    }

    async executeMintingProcess() {
        const currentState = store.getState();
        const userIndex = currentState.globalUsers.findIndex(u => u.id === this.activeUserId);
        if (userIndex === -1) return;

        const profile = currentState.globalUsers[userIndex].profile;
        
        this.dom.aiSystemPrompt.innerHTML = `<div style="text-align:center; padding:2rem; animation: pulse 1.5s infinite;"><span style="font-size:2rem;">🧠</span><br><br><span style="color:var(--accent-purple); font-weight:bold;">Analizando matriz y sintetizando Ikigai...</span></div>`;
        
        const savedProvider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        let apiKey = '';
        if (savedProvider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek') || '';
        if (savedProvider === 'openai') apiKey = localStorage.getItem('tt_key_openai') || '';
        if (savedProvider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini') || '';

        let ikigaiSummary = "";

        if (apiKey) {
            const systemPrompt = `
                Eres el Motor de Matching Semántico de TeamTowers. 
                Analiza el siguiente perfil y resume en 1 párrafo corto (máximo 40 palabras) la 'Huella Semántica' (Ikigai) de este talento, explicando cómo aporta valor a un Ecosistema. Habla en segunda persona del singular ("Eres un...").
                
                Vision Cruda: "${profile.vision}"
                Niveles: ${profile.structural_affinity.join(', ')}
                Autoridad: ${profile.guardian_authority.join(', ')}
                Crecimiento: ${profile.guardian_growth.join(', ')}
            `;

            try {
                if (savedProvider === 'openai') {
                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: systemPrompt }] })
                    });
                    const data = await response.json(); ikigaiSummary = data.choices[0].message.content;
                } else if (savedProvider === 'deepseek') {
                    const response = await fetch('https://api.deepseek.com/chat/completions', {
                        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: systemPrompt }] })
                    });
                    const data = await response.json(); ikigaiSummary = data.choices[0].message.content;
                } else if (savedProvider === 'gemini') {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
                    });
                    const data = await response.json(); ikigaiSummary = data.candidates[0].content.parts[0].text;
                }
            } catch (e) {
                console.warn("Fallo IA", e);
                ikigaiSummary = "Perfil consolidado. Error al generar el resumen IA automático. Revisa tu clave API en Settings.";
            }
        } else {
            ikigaiSummary = "Perfil verificado localmente. Para generar un Ikigai redactado por IA, debes configurar una clave API en Settings.";
        }

        const mockHash = 'ar://' + Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('');
        
        await store.dispatch({
            type: 'UPDATE_USER_PROFILE',
            payload: { userId: this.activeUserId, profile: { permawebHash: mockHash, ikigaiSummary: ikigaiSummary, mintDate: Date.now() } }
        });

        this.dom.badgeMinted.style.display = 'inline-flex';
        this.updateSystemPromptDisplay(mockHash, ikigaiSummary);
        
        alert("🎉 ¡Identidad Sintetizada con Éxito!");
    }

    updateSystemPromptDisplay(hash = null, ikigaiSummary = null) {
        const structural_affinity = Array.from(document.querySelectorAll('input[id^="lvl_"]:checked')).map(el => el.value);
        const guardian_authority = Array.from(document.querySelectorAll('input[id^="g_auth_"]:checked')).map(el => el.value);
        const guardian_growth = Array.from(document.querySelectorAll('input[id^="g_grow_"]:checked')).map(el => el.value);

        if (structural_affinity.length === 0 && guardian_authority.length === 0 && !ikigaiSummary) {
            this.dom.aiSystemPrompt.innerHTML = "Rellena tu Identidad Fractal y guarda. Luego, usa el Motor IA del Header para generar tu huella semántica.";
            return;
        }

        const hashLine = hash ? `<span style="color: var(--accent-orange); font-size:0.75rem; display:block; margin-bottom:15px; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:10px; word-break: break-all;">ARWEAVE HASH: ${hash}</span>` : '';
        const summaryHtml = ikigaiSummary ? `<div style="color: white; margin-top:15px; font-style:italic; font-size:1.05rem; line-height:1.6;">"${ikigaiSummary.replace(/\n/g, '<br>')}"</div>` : '';

        this.dom.aiSystemPrompt.innerHTML = `
            ${hashLine}
            <div style="display:flex; flex-direction:column; gap:8px;">
                <div><span style="color: var(--accent-blue); font-weight:bold; width:90px; display:inline-block;">ESTRUCTURA:</span> <span style="color:#aaa;">[${structural_affinity.join(', ')}]</span></div>
                <div><span style="color: var(--accent-purple); font-weight:bold; width:90px; display:inline-block;">FUERZA:</span> <span style="color:#aaa;">[${guardian_authority.join(', ')}]</span></div>
                <div><span style="color: var(--accent-green); font-weight:bold; width:90px; display:inline-block;">BÚSQUEDA:</span> <span style="color:#aaa;">[${guardian_growth.join(', ')}]</span></div>
            </div>
            ${summaryHtml}
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
                        
                        if (!skillsMap[skillTag]) skillsMap[skillTag] = new Map();
                        skillsMap[skillTag].set(p.id, p.nombre);
                    }
                });

                projectRowsHtml.push(`
                    <div class="project-row">
                        <div>
                            <div class="project-name">${p.nombre}</div>
                            <div class="project-role">${Array.from(projectRoles).join(', ')}</div>
                        </div>
                        <div class="project-slices">
                            <div class="amt">${Math.round(projectSlices).toLocaleString()} <span style="font-size:0.7rem; color:#888;">Slices</span></div>
                            <a href="/v8/ledger" data-link style="font-size:0.75rem; color:var(--accent-blue); text-decoration:none; font-weight:bold;" onclick="localStorage.setItem('tt_active_project', '${p.id}')">Ir a Wallet &rarr;</a>
                        </div>
                    </div>
                `);
            }
        });

        document.getElementById('totSlices').innerText = Math.round(globalSlices).toLocaleString();
        document.getElementById('totHours').innerText = globalHours.toFixed(1) + 'h';
        document.getElementById('totProjects').innerText = activeProjectsCount;

        const pList = document.getElementById('projectsList');
        if (projectRowsHtml.length > 0) {
            pList.innerHTML = projectRowsHtml.join('');
        } else {
            pList.innerHTML = `<div style="text-align: center; padding: 4rem; border: 1px dashed var(--glass-border); border-radius: 16px; color: #888; background:rgba(0,0,0,0.3);">Aún no tienes Slices consolidados en ninguna red.<br><br>Ve a una red y usa el Kanban para hacer Pull de tareas.</div>`;
        }

        const sList = document.getElementById('skillsList');
        
        const skillsArray = Object.keys(skillsMap).map(skillName => {
            return {
                name: skillName,
                projects: Array.from(skillsMap[skillName].entries()).map(([id, name]) => ({id, name})),
                count: skillsMap[skillName].size
            };
        }).sort((a, b) => b.count - a.count);
        
        if (skillsArray.length > 0) {
            sList.innerHTML = skillsArray.map(skill => `
                <div class="skill-card">
                    <div class="skill-header">
                        <span class="skill-name">${skill.name}</span>
                        <span class="skill-count">Nivel ${skill.count}</span>
                    </div>
                    <div class="skill-source-list">
                        ${skill.projects.map(p => `
                            <div class="skill-source">
                                <span>🏅</span> 
                                <a href="/v8/ledger" data-link class="skill-link" onclick="localStorage.setItem('tt_active_project', '${p.id}')">${p.name}</a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        } else {
            sList.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#888; border: 1px dashed var(--glass-border); border-radius: 16px;">Completa entregables en el Kanban para ganar Soulbound Tokens (Skills comprobados en Ledger).</div>`;
        }
    }

    inferSkill(levelId, description) {
        const descLower = description.toLowerCase();
        if (descLower.includes('código') || descLower.includes('api') || descLower.includes('dev') || descLower.includes('software')) return 'Ingeniería de Software';
        if (descLower.includes('diseño') || descLower.includes('ui') || descLower.includes('ux') || descLower.includes('figma')) return 'Diseño de Producto (UI/UX)';
        if (descLower.includes('marketing') || descLower.includes('seo') || descLower.includes('redes')) return 'Growth & Marketing';
        
        if (levelId === '@anxaneta') return 'Estrategia & Liderazgo';
        if (levelId === '@aixecador') return 'Project Management';
        if (levelId === '@dosos') return 'Auditoría & QA';
        if (levelId === '@baixos') return 'Ejecución Técnica';
        if (levelId === '@pinya') return 'Operaciones & Soporte';
        
        return 'Contribución de Valor General';
    }
}
