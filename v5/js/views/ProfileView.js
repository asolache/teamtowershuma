// v5/js/views/ProfileView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';

export default class ProfileView {
    constructor() {
        document.title = "Mi Perfil & Reputación | TeamTowers SOS";
        this.currentTab = 'perfil'; 
        
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
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);
        
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );

        let activeProjectId = localStorage.getItem('tt_active_project') || (userProjects.length > 0 ? userProjects[userProjects.length - 1].id : null);

        const isOpen = user?.profile?.isOpenToWork || false;
        const statusBtnClass = isOpen ? 'btn-status-open' : 'btn-status-closed';
        const statusBtnText = isOpen ? '🟢 Disponible para Match' : '🔴 No Disponible';

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; position: relative; scroll-behavior: smooth;}
                
                /* =========================================================
                   MOBILE TOP BAR (DRY V8.0)
                   ========================================================= */
                .mobile-top-bar {
                    display: none; justify-content: space-between; align-items: center; padding: 15px 20px;
                    background: rgba(10, 10, 14, 0.95); border-bottom: 1px solid rgba(255,255,255,0.05);
                    backdrop-filter: blur(10px); position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; box-sizing: border-box;
                }
                .mob-brand { display: flex; align-items: center; gap: 10px; color: white; text-decoration: none; font-weight: bold; font-size: 1.2rem;}
                .mob-project-select { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: var(--accent-blue); padding: 5px 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.8rem; outline: none; max-width: 150px; }
                .mob-user { display: flex; align-items: center; justify-content: center; width: 35px; height: 35px; background: var(--accent-purple); color: white; border-radius: 50%; font-weight: bold; text-decoration: none; font-size: 0.9rem; }

                /* =========================================================
                   HEADER PERFIL
                   ========================================================= */
                .view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;}
                .view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;}
                .view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }

                .verified-badge { font-size: 0.7rem; background: rgba(255, 171, 64, 0.2); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 4px 10px; border-radius: 12px; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 1px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;}
                
                .btn-status-closed { background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 8px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; cursor: pointer; transition: all 0.2s;}
                .btn-status-open { background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 8px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; cursor: pointer; transition: all 0.2s;}

                /* =========================================================
                   TABS (Pestañas Segmented Control PREMIUM)
                   ========================================================= */
                .tabs-container { 
                    display: flex; background: rgba(0,0,0,0.5); padding: 6px; border-radius: 12px; 
                    border: 1px solid var(--glass-border); gap: 5px; margin-bottom: 2rem; 
                    overflow-x: auto; white-space: nowrap; scrollbar-width: none;
                }
                .tabs-container::-webkit-scrollbar { display: none; }
                
                .tab-btn { 
                    flex: 1; min-width: max-content; padding: 12px 20px; background: transparent; 
                    border: none; border-radius: 8px; color: var(--text-muted); font-size: 0.95rem; 
                    font-weight: bold; cursor: pointer; transition: all 0.2s; display: flex; 
                    align-items: center; justify-content: center; gap: 8px;
                }
                .tab-btn:hover { color: white; background: rgba(255,255,255,0.03); }
                
                /* Active States por color temático */
                .tab-btn.active { background: rgba(255,255,255,0.08); color: white; box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.3); }
                .tab-btn.active[data-tab="perfil"] { color: var(--accent-blue); }
                .tab-btn.active[data-tab="proyectos"] { color: var(--accent-green); }
                .tab-btn.active[data-tab="skills"] { color: var(--accent-purple); }

                .tab-content { display: none; animation: fadeIn 0.3s ease-out; }
                .tab-content.active { display: block; }

                /* =========================================================
                   TAB 1: IDENTIDAD FRACTAL (PERFIL)
                   ========================================================= */
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px; font-weight: bold; text-transform: uppercase;}
                .vision-textarea { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); color: white; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 0.95rem; min-height: 100px; resize: vertical; box-sizing: border-box;}
                .vision-textarea:focus { outline: none; border-color: var(--accent-blue); }

                .tag-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
                .tag-checkbox { display: none; }
                .tag-label { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); padding: 8px 12px; border-radius: 6px; color: #ccc; font-size: 0.8rem; cursor: pointer; text-align: center; transition: all 0.2s; user-select: none; display: block;}
                .tag-checkbox:checked + .tag-label { background: rgba(0, 176, 255, 0.15); border-color: var(--accent-blue); color: white; font-weight: bold;}
                .tag-checkbox:checked + .tag-label.guardian-auth { background: rgba(224, 64, 251, 0.15); border-color: var(--accent-purple); }

                .pm-ikigai { background: rgba(224, 64, 251, 0.05); border: 1px solid rgba(224, 64, 251, 0.2); border-radius: 8px; padding: 20px; margin-top: 2rem;}
                .pm-section-title { font-size: 0.85rem; color: var(--accent-purple); text-transform: uppercase; font-weight: bold; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;}
                .pm-prompt-text { font-family: var(--font-mono); font-size: 0.9rem; color: #ccc; line-height: 1.6; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 6px; border: 1px dashed #444; word-break: break-word;}

                .btn-save-profile { background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; width: 100%; margin-top: 1rem;}
                .btn-save-profile:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(179, 136, 255, 0.4); }

                .btn-mint { background: transparent; border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 5px;}
                .btn-mint:hover { background: rgba(255, 171, 64, 0.1); }

                /* =========================================================
                   TAB 2: PROYECTOS (ESTADÍSTICAS)
                   ========================================================= */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                .stat-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: var(--border-radius-md); text-align: center; }
                .stat-value { font-size: 2.5rem; color: var(--accent-green); font-weight: 800; font-family: var(--font-mono); margin-bottom: 5px; }
                .stat-label { color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }

                .project-row { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 0; border-bottom: 1px solid var(--glass-border); flex-wrap: wrap; gap: 10px;}
                .project-row:last-child { border-bottom: none; }
                .project-name { color: white; font-weight: bold; font-size: 1.1rem; }
                .project-role { color: var(--accent-blue); font-size: 0.8rem; font-family: var(--font-mono); background: rgba(0, 176, 255, 0.1); padding: 4px 8px; border-radius: 4px; margin-top: 5px; display: inline-block;}
                .project-slices { text-align: right; }
                .project-slices .amt { color: var(--accent-green); font-size: 1.2rem; font-weight: bold; font-family: var(--font-mono); }

                /* =========================================================
                   TAB 3: SKILLS (SBTs)
                   ========================================================= */
                .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
                .skill-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1.5rem; }
                .skill-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px;}
                .skill-name { color: var(--accent-blue); font-weight: bold; font-size: 1.1rem; }
                .skill-count { background: rgba(0, 176, 255, 0.2); color: var(--accent-blue); padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-family: var(--font-mono); font-weight: bold;}
                .skill-source-list { display: flex; flex-direction: column; gap: 8px;}
                .skill-source { font-size: 0.8rem; color: #aaa; display: flex; align-items: center; gap: 5px;}
                .skill-link { color: #888; text-decoration: none; border-bottom: 1px dashed #555; transition: color 0.2s;}
                .skill-link:hover { color: white; border-color: white;}

                /* =========================================================
                   MODAL PERMAWEB
                   ========================================================= */
                .checkout-modal { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 2000; display: none; justify-content: center; align-items: center;}
                .checkout-card { background: #111; border: 1px solid var(--accent-orange); border-radius: 16px; padding: 3rem; width: 100%; max-width: 450px; text-align: center; box-shadow: 0 20px 50px rgba(255, 171, 64, 0.2); box-sizing: border-box;}
                .checkout-price { font-size: 3.5rem; font-weight: 900; color: white; margin: 1rem 0; font-family: var(--font-mono);}
                .pay-btn { width: 100%; padding: 15px; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;}
                .pay-gpay { background: white; color: #3c4043; }
                .pay-card { background: #635bff; color: white; }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

                /* =========================================================
                   RESPONSIVE MOBILE (FIELD APP)
                   ========================================================= */
                @media (max-width: 768px) { 
                    .workspace { padding: 80px 1rem 90px 1rem; } 
                    .mobile-top-bar { display: flex; }
                    
                    .view-header { flex-direction: column; align-items: flex-start; gap: 10px;}
                    .view-header h1 { font-size: 1.6rem; }
                    .header-actions { width: 100%; }
                    .btn-status-closed, .btn-status-open { width: 100%; justify-content: center; display: flex;}

                    /* Asegura que los tabs ocupen todo el ancho en móvil */
                    .tabs-container { width: 100%; }
                    .tab-btn { flex: 1; text-align: center; padding: 10px 5px; font-size: 0.85rem;}
                    
                    .stats-grid { grid-template-columns: 1fr; gap: 1rem;}
                    .pm-section-title { flex-direction: column; align-items: flex-start; gap: 10px; }
                    .btn-mint { width: 100%; justify-content: center; }
                    .checkout-card { padding: 2rem 1.5rem; width: 95%; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/profile')}

                <main class="workspace">
                    <header class="mobile-top-bar">
                        <a href="/v5/" data-link class="mob-brand">🗼</a>
                        <select class="mob-project-select" id="mobProjectSelect">
                            ${userProjects.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('')}
                        </select>
                        <div class="mob-user">${user?.name.charAt(0).toUpperCase() || '?'}</div>
                    </header>

                    <div class="view-header">
                        <div>
                            <h1>Perfil <span style="color:var(--accent-blue); margin-left: 8px;">${user?.name || 'Usuario'}</span> <span style="font-size: 0.45em; color: #888; font-weight:normal; margin-left:5px; font-family:monospace;">(${user?.id || '@id'})</span></h1>
                            <p>Tu Identidad Fractal y Reputación Web3</p>
                        </div>
                        <div class="header-actions">
                            <button id="btnToggleAvailability" class="${statusBtnClass}">${statusBtnText}</button>
                        </div>
                    </div>

                    <div class="tabs-container" id="tabsContainer">
                        <button class="tab-btn active" data-tab="perfil">🧬 Identidad</button>
                        <button class="tab-btn" data-tab="proyectos">🌐 Redes Activas</button>
                        <button class="tab-btn" data-tab="skills">🏅 Skills</button>
                    </div>

                    <div id="view-perfil" class="tab-content active">
                        <div class="form-group">
                            <label>1. Visión y Skills en Bruto</label>
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

                        <div class="form-group" style="margin-top: 2rem;">
                            <label style="color: var(--accent-purple);">3. Autoridad Actual (Tus Arquetipos)</label>
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
                            <label style="color: var(--accent-green);">4. Interés de Crecimiento</label>
                            <div class="tag-grid" id="gridGuardiansGrowth">
                                ${this.guardians.map(g => `
                                    <div>
                                        <input type="checkbox" class="tag-checkbox" id="g_grow_${g.id}" value="${g.id}">
                                        <label class="tag-label" for="g_grow_${g.id}">${g.label}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <button class="btn-save-profile" id="btnSaveProfile">💾 Guardar Identidad Local</button>

                        <div class="pm-ikigai">
                            <div class="pm-section-title">
                                <span style="display:flex; align-items:center; gap:8px;">🧠 AI System Prompt (Ikigai) <span id="badgeMinted" class="verified-badge" style="display:none;">🕸️ Permaweb</span></span>
                                <button class="btn-mint" id="btnOpenMintModal">⚡ Generar Ikigai (IA)</button>
                            </div>
                            <div class="pm-prompt-text" id="aiSystemPrompt">
                                Rellena tu Identidad Fractal y guárdala para generar tu huella semántica orientada al Motor de Matching.
                            </div>
                        </div>
                    </div>

                    <div id="view-proyectos" class="tab-content">
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
                                <div class="stat-label">Redes Activas</div>
                            </div>
                        </div>

                        <h3 style="color: white; font-size: 1.2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px; margin-bottom: 1rem;">Mis Ecosistemas</h3>
                        <div id="projectsList"></div>
                    </div>

                    <div id="view-skills" class="tab-content">
                        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">Las habilidades se infieren inmutablemente de las tareas <i>(Proof of Work)</i> que has completado y consolidado en el Ledger.</p>
                        <div class="skills-grid" id="skillsList"></div>
                    </div>

                    <div id="checkoutModal" class="checkout-modal">
                        <div class="checkout-card">
                            <h2 style="color: var(--accent-orange); margin-top: 0; font-size: 1.8rem;">Soberanía Permaweb</h2>
                            <p style="color: var(--text-muted); font-size: 0.9rem;">La IA procesará tu visión y arquetipos para redactar tu Identidad Fractal y sellarla en Arweave.</p>
                            
                            <div class="checkout-price">€1.99</div>
                            <p style="color: #666; font-size: 0.75rem; margin-top:-10px;">Pago único por Minting + Invocación IA</p>

                            <div id="paymentButtons" style="margin-top: 2rem;">
                                <button class="pay-btn pay-gpay" id="btnGooglePay">Pagar con Google Pay</button>
                                <button class="pay-btn pay-card" id="btnStripePay">💳 Pagar con Tarjeta</button>
                                <button class="btn btn-outline" style="width: 100%; border: none; margin-top: 10px; background:transparent; color:#888; cursor:pointer;" id="btnCloseModal">Cancelar</button>
                            </div>

                            <div id="mintingLoader" style="display: none; flex-direction: column; align-items: center; gap: 15px; margin-top: 2rem;">
                                <div style="width: 40px; height: 40px; border: 4px solid rgba(255, 171, 64, 0.3); border-top-color: var(--accent-orange); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                                <p id="loaderStatusMsg" style="color: var(--accent-orange); font-family: var(--font-mono); font-weight: bold; margin:0;">Invocando Orquestador IA...</p>
                            </div>
                        </div>
                    </div>
                </main>

                ${BottomNav.getHtml('/profile')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();

        const state = store.getState();
        this.activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === this.activeUserId);

        // Mobile Top Bar Logic
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === this.activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === this.activeUserId))
        );
        let activeProjectId = localStorage.getItem('tt_active_project') || (userProjects.length > 0 ? userProjects[userProjects.length - 1].id : null);
        const mobSelect = document.getElementById('mobProjectSelect');
        if (mobSelect && activeProjectId) {
            mobSelect.value = activeProjectId;
            mobSelect.addEventListener('change', (e) => {
                localStorage.setItem('tt_active_project', e.target.value);
                window.location.reload(); 
            });
        }

        this.dom = {
            inpVision: document.getElementById('inpVision'),
            btnSave: document.getElementById('btnSaveProfile'),
            btnMint: document.getElementById('btnOpenMintModal'),
            aiSystemPrompt: document.getElementById('aiSystemPrompt'),
            badgeMinted: document.getElementById('badgeMinted'),
            checkoutModal: document.getElementById('checkoutModal'),
            btnCloseModal: document.getElementById('btnCloseModal'),
            btnGooglePay: document.getElementById('btnGooglePay'),
            btnStripePay: document.getElementById('btnStripePay'),
            paymentButtons: document.getElementById('paymentButtons'),
            mintingLoader: document.getElementById('mintingLoader'),
            loaderStatusMsg: document.getElementById('loaderStatusMsg'),
            btnToggleAvailability: document.getElementById('btnToggleAvailability')
        };

        // CARGA DE DATOS DE USUARIO
        if (user && user.profile) {
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
                this.dom.btnMint.innerText = '⚡ Actualizar Huella (IA)';
            }
            
            this.updateSystemPromptDisplay(user.profile.permawebHash, user.profile.ikigaiSummary);
        }

        // TABS LOGIC (FIXED)
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Quitar clase active a todos los botones
                tabBtns.forEach(b => b.classList.remove('active'));
                // Añadir active al pulsado
                btn.classList.add('active');

                // Ocultar todos los contenidos
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });
                
                // Mostrar el contenido objetivo
                const targetId = `view-${btn.dataset.tab}`;
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.style.display = 'block';
                    // Forzar reflow para que corra la animación CSS
                    void targetContent.offsetWidth; 
                    targetContent.classList.add('active');
                }
            });
        });

        // STATUS TOGGLE (Open To Work)
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
                    this.dom.btnToggleAvailability.innerText = newStatus ? '🟢 Disponible para Match' : '🔴 No Disponible';
                });
            }
        });

        // EVENTOS GUARDADO
        this.dom.btnSave.addEventListener('click', () => this.saveIdentity(false));
        
        this.dom.btnMint.addEventListener('click', () => {
            this.saveIdentity(false); 
            this.dom.checkoutModal.style.display = 'flex';
        });
        
        this.dom.btnCloseModal.addEventListener('click', () => this.dom.checkoutModal.style.display = 'none');
        
        const simulatePayment = () => this.executeMintingProcess();
        this.dom.btnGooglePay.addEventListener('click', simulatePayment);
        this.dom.btnStripePay.addEventListener('click', simulatePayment);

        this.calculateReputationAndStats(state);
    }

    saveIdentity(isMinting = false) {
        if (this.activeUserId === 'ecosystem-admin') return;

        const vision = this.dom.inpVision.value.trim();
        const structural_affinity = Array.from(document.querySelectorAll('input[id^="lvl_"]:checked')).map(el => el.value);
        const guardian_authority = Array.from(document.querySelectorAll('input[id^="g_auth_"]:checked')).map(el => el.value);
        const guardian_growth = Array.from(document.querySelectorAll('input[id^="g_grow_"]:checked')).map(el => el.value);

        const currentState = store.getState();
        const userIndex = currentState.globalUsers.findIndex(u => u.id === this.activeUserId);
        
        if (userIndex > -1) {
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
                    this.dom.btnSave.innerText = "✅ Identidad Guardada";
                    this.dom.btnSave.style.background = "var(--accent-green)";
                    this.dom.btnSave.style.color = "black";
                    setTimeout(() => {
                        this.dom.btnSave.innerText = originalText;
                        this.dom.btnSave.style.background = "linear-gradient(45deg, var(--accent-blue), var(--accent-purple))";
                        this.dom.btnSave.style.color = "white";
                    }, 2000);
                }
            });
        }
    }

    async executeMintingProcess() {
        this.dom.paymentButtons.style.display = 'none';
        this.dom.mintingLoader.style.display = 'flex';
        
        const currentState = store.getState();
        const userIndex = currentState.globalUsers.findIndex(u => u.id === this.activeUserId);
        if (userIndex === -1) return;

        const profile = currentState.globalUsers[userIndex].profile;
        
        this.dom.loaderStatusMsg.innerText = "Generando Huella Semántica con IA...";
        
        const savedProvider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        let apiKey = '';
        if (savedProvider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek') || '';
        if (savedProvider === 'openai') apiKey = localStorage.getItem('tt_key_openai') || '';
        if (savedProvider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini') || '';

        let ikigaiSummary = "";

        if (apiKey) {
            const systemPrompt = `
                Eres el Motor de Matching de TeamTowers. 
                Analiza el siguiente perfil y resume en 1 párrafo conciso la 'Huella Semántica' (Ikigai) de este talento, explicando cómo aporta valor a una DAO.
                
                Vision: "${profile.vision}"
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
                ikigaiSummary = "Perfil verificado. Error al generar el resumen IA automático.";
            }
        } else {
            ikigaiSummary = "Perfil verificado (Sin IA configurada).";
        }

        this.dom.loaderStatusMsg.innerText = "Sellando Identidad en Arweave...";

        setTimeout(async () => {
            const mockHash = 'ar://' + Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('');
            
            await store.dispatch({
                type: 'UPDATE_USER_PROFILE',
                payload: { userId: this.activeUserId, profile: { permawebHash: mockHash, ikigaiSummary: ikigaiSummary, mintDate: Date.now() } }
            });

            this.dom.checkoutModal.style.display = 'none';
            this.dom.paymentButtons.style.display = 'block';
            this.dom.mintingLoader.style.display = 'none';
            
            this.dom.badgeMinted.style.display = 'inline-flex';
            this.dom.btnMint.innerText = '⚡ Actualizar Huella (IA)';
            this.updateSystemPromptDisplay(mockHash, ikigaiSummary);
            
            alert("🎉 ¡Identidad Acuñada con Éxito!");
        }, 1500); 
    }

    updateSystemPromptDisplay(hash = null, ikigaiSummary = null) {
        const structural_affinity = Array.from(document.querySelectorAll('input[id^="lvl_"]:checked')).map(el => el.value);
        const guardian_authority = Array.from(document.querySelectorAll('input[id^="g_auth_"]:checked')).map(el => el.value);
        const guardian_growth = Array.from(document.querySelectorAll('input[id^="g_grow_"]:checked')).map(el => el.value);

        if (structural_affinity.length === 0 && guardian_authority.length === 0 && !ikigaiSummary) {
            this.dom.aiSystemPrompt.innerHTML = "Rellena tu Identidad Fractal y guarda para generar tu huella semántica.";
            return;
        }

        const hashLine = hash ? `<span style="color: var(--accent-orange); font-size:0.75rem; display:block; margin-bottom:10px; border-bottom:1px dashed #444; padding-bottom:5px; word-break: break-all;">TXID: ${hash}</span>` : '';
        const summaryHtml = ikigaiSummary ? `<div style="color: white; margin-top:10px; font-style:italic;">"${ikigaiSummary.replace(/\n/g, '<br>')}"</div>` : '';

        this.dom.aiSystemPrompt.innerHTML = `
            ${hashLine}
            <span style="color: var(--accent-blue);">Estructura:</span> [${structural_affinity.join(', ')}]<br>
            <span style="color: var(--accent-purple);">Fuerza:</span> [${guardian_authority.join(', ')}]<br>
            <span style="color: var(--accent-green);">Búsqueda:</span> [${guardian_growth.join(', ')}]<br>
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
                            <a href="/v5/ledger" data-link style="font-size:0.75rem; color:var(--accent-blue); text-decoration:none;" onclick="localStorage.setItem('tt_active_project', '${p.id}')">Ver Ledger &rarr;</a>
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
            pList.innerHTML = `<div style="text-align: center; padding: 3rem; border: 1px dashed #333; border-radius: 8px; color: #888;">Aún no tienes Slices consolidados.<br>Usa el Kanban para hacer Pull de tareas.</div>`;
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
                                <a href="/v5/ledger" data-link class="skill-link" onclick="localStorage.setItem('tt_active_project', '${p.id}')">${p.name}</a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        } else {
            sList.innerHTML = `<div style="grid-column:1/-1; color:#888; font-size:0.9rem;">Completa entregables en el Kanban para ganar Soulbound Tokens (Skills).</div>`;
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
        
        return 'Contribución General';
    }
}
