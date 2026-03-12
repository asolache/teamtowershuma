// v5/js/views/ProfileView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class ProfileView {
    constructor() {
        document.title = "Mi Perfil | TeamTowers SOS";
        
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
            { id: '@anxaneta', label: '👑 @anxaneta (Master/Visión)' },
            { id: '@aixecador', label: '🧭 @aixecador (Senior/Táctica)' },
            { id: '@dosos', label: '👁️ @dosos (Mid/Auditoría)' },
            { id: '@baixos', label: '⚙️ @baixos (Junior/Técnico)' },
            { id: '@pinya', label: '🤝 @pinya (Iniciado/Soporte)' }
        ];
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);

        const isOpen = user?.profile?.isOpenToWork || false;
        const statusBtnClass = isOpen ? 'btn-status-open' : 'btn-status-closed';
        const statusBtnText = isOpen ? '🟢 Abierto a Proyectos (Match)' : '🔴 Modo Oculto (Privado)';

        const headerConfig = {
            title: "Identidad",
            subtitle: user?.name || 'Usuario',
            tagline: "Tu ADN Fractal y Reputación P2P (Open Badges).",
            actionHtml: `<button id="btnToggleAvailability" class="${statusBtnClass}">${statusBtnText}</button>`,
            tabs: [
                { id: 'perfil', label: '🧬 Identidad (Ikigai)', active: true },
                { id: 'skills', label: '🏅 Badges & Skills' },
                { id: 'proyectos', label: '🌐 Ecosistemas (Equity)' }
            ]
        };

        return `
            <style>
                /* FIX SCROLL LATERAL & BOTTOM SAFE */
                .app-layout { display: flex; height: 100vh; height: 100dvh; width: 100vw; overflow: hidden; background: var(--bg-dark); }
                .workspace-profile { display: flex; flex-direction: column; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; position: relative; scroll-behavior: smooth; width: 100%; box-sizing: border-box;}
                
                /* FIX TABS MOBILE PARA SIEMPRE */
                .ph-tabs-container { flex-wrap: nowrap !important; overflow-x: auto !important; scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; flex-shrink: 0 !important; margin-bottom: 2rem !important; justify-content: flex-start !important;}
                .ph-tabs-container::-webkit-scrollbar { display: none; }
                .ph-tab-btn { flex: 0 0 auto !important; }

                .tab-content { display: none; flex-direction: column; flex: 1; animation: fadeIn 0.4s ease-out; padding-bottom: 3rem; width: 100%; box-sizing:border-box;}
                .tab-content.active { display: flex; }

                /* BOTONES DE STATUS HEADER */
                .btn-status-closed { background: rgba(255, 82, 82, 0.1); border: 1px solid var(--accent-red); color: var(--accent-red); padding: 10px 20px; border-radius: 12px; font-size: 0.9rem; font-weight: bold; cursor: pointer; transition: all 0.2s;}
                .btn-status-open { background: rgba(0, 230, 118, 0.1); border: 1px solid var(--accent-green); color: var(--accent-green); padding: 10px 20px; border-radius: 12px; font-size: 0.9rem; font-weight: bold; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 15px rgba(0,230,118,0.2);}

                /* =========================================================
                   TAB 1: IDENTIDAD FRACTAL
                   ========================================================= */
                .form-group { margin-bottom: 2rem; width: 100%;}
                .form-group label { display: block; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 10px; font-weight: 900; text-transform: uppercase; letter-spacing:1px;}
                .vision-textarea { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; padding: 15px 20px; border-radius: 12px; font-family: inherit; font-size: 1rem; min-height: 120px; resize: vertical; box-sizing: border-box; transition: 0.3s; box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);}
                .vision-textarea:focus { outline: none; border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0,176,255,0.2), inset 0 2px 5px rgba(0,0,0,0.5);}

                .tag-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
                .tag-checkbox { display: none; }
                .tag-label { background: rgba(255,255,255,0.03); border: 1px solid #333; padding: 12px 15px; border-radius: 10px; color: #aaa; font-size: 0.85rem; font-weight:bold; cursor: pointer; text-align: center; transition: all 0.2s; user-select: none; display: block;}
                .tag-checkbox:checked + .tag-label { background: rgba(0, 176, 255, 0.15); border-color: var(--accent-blue); color: white; box-shadow: 0 5px 15px rgba(0,176,255,0.2); transform: translateY(-2px);}
                .tag-checkbox:checked + .tag-label.guardian-auth { background: rgba(224, 64, 251, 0.15); border-color: var(--accent-purple); box-shadow: 0 5px 15px rgba(224,64,251,0.2);}
                .tag-checkbox:checked + .tag-label.guardian-grow { background: rgba(0, 230, 118, 0.15); border-color: var(--accent-green); box-shadow: 0 5px 15px rgba(0,230,118,0.2);}

                .btn-save-profile { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 15px 30px; border-radius: 12px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: transform 0.3s, box-shadow 0.3s; width: 100%; margin-top: 1rem; text-transform:uppercase; letter-spacing:1px;}
                .btn-save-profile:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(179, 136, 255, 0.4); }

                /* IKIGAI & IA PROMPT */
                .pm-ikigai { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid rgba(224, 64, 251, 0.3); border-radius: 16px; padding: 2rem; margin-top: 3rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5);}
                .pm-section-title { font-size: 1rem; color: var(--accent-purple); text-transform: uppercase; font-weight: 900; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap:wrap; gap:15px;}
                .pm-prompt-text { font-family: var(--font-mono); font-size: 0.95rem; color: #ccc; line-height: 1.6; background: rgba(0,0,0,0.6); padding: 20px; border-radius: 12px; border: 1px dashed #444; word-break: break-word;}
                .verified-badge { font-size: 0.75rem; background: rgba(255, 171, 64, 0.2); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 4px 10px; border-radius: 12px; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 1px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;}

                .btn-mint { background: transparent; border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 900; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 5px;}
                .btn-mint:hover { background: rgba(255, 171, 64, 0.1); transform:translateY(-2px); box-shadow: 0 5px 15px rgba(255,171,64,0.2);}

                /* =========================================================
                   TAB 2: SKILLS Y OPEN BADGES (V12 LMS)
                   ========================================================= */
                .ia-import-box { background: rgba(0,176,255,0.05); border: 1px dashed var(--accent-blue); padding: 2rem; border-radius: 16px; margin-bottom: 3rem; text-align:center;}
                .ia-import-box p { color: #aaa; font-size: 0.9rem; margin-bottom: 1.5rem; line-height:1.5;}
                
                .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; width:100%;}
                
                .skill-card { background: rgba(25,25,30,0.8); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.5rem; transition: transform 0.3s; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);}
                .skill-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.2); box-shadow: 0 10px 20px rgba(0,0,0,0.5);}
                .skill-card.theoretical { border-style: dashed; border-color: #444; background: rgba(0,0,0,0.4); opacity: 0.8;}
                
                .skill-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 12px; gap:10px;}
                .skill-name { color: white; font-weight: 900; font-size: 1.15rem; line-height:1.2;}
                .skill-card.theoretical .skill-name { color: #aaa; }
                
                .skill-level-badge { padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-family: var(--font-mono); font-weight: 900; letter-spacing:0.5px; white-space:nowrap;}
                .level-real { background: rgba(0, 230, 118, 0.15); color: var(--accent-green); border: 1px solid rgba(0,230,118,0.4);}
                .level-theory { background: rgba(255, 255, 255, 0.05); color: #888; border: 1px solid #444;}
                
                .skill-source-list { display: flex; flex-direction: column; gap: 8px;}
                .skill-source { font-size: 0.85rem; color: #888; display: flex; align-items: center; gap: 8px;}
                .skill-link { color: var(--accent-blue); text-decoration: none; border-bottom: 1px dashed transparent; transition: 0.2s; font-weight:bold;}
                .skill-link:hover { border-bottom-color: var(--accent-blue);}

                /* =========================================================
                   TAB 3: PROYECTOS (ESTADÍSTICAS)
                   ========================================================= */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; width:100%;}
                .stat-card { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 20px; text-align: center; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);}
                .stat-value { font-size: 3rem; color: var(--accent-green); font-weight: 900; font-family: var(--font-mono); margin-bottom: 5px; text-shadow: 0 5px 15px rgba(0,0,0,0.5);}
                .stat-label { color: var(--text-muted); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight:bold;}

                .project-row { background: rgba(255,255,255,0.02); display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.05); border-radius:16px; margin-bottom:15px; flex-wrap: wrap; gap: 15px; transition: 0.3s;}
                .project-row:hover { background: rgba(255,255,255,0.04); border-color:#444;}
                .project-name { color: white; font-weight: 900; font-size: 1.2rem; margin-bottom:5px;}
                .project-role { color: var(--accent-blue); font-size: 0.85rem; font-family: var(--font-mono); background: rgba(0, 176, 255, 0.1); padding: 4px 10px; border-radius: 6px; display: inline-block; font-weight:bold;}
                .project-slices { text-align: right; }
                .project-slices .amt { color: var(--accent-green); font-size: 1.4rem; font-weight: 900; font-family: var(--font-mono); }

                /* =========================================================
                   MODALS LUXURY
                   ========================================================= */
                .overlay-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.85); backdrop-filter: blur(15px); z-index: 5000; display: none; justify-content: center; align-items: center;}
                .card-modal { background: var(--bg-dark); border: 1px solid var(--accent-orange); border-radius: 24px; padding: 3rem; width: 100%; max-width: 450px; text-align: center; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8); animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); box-sizing: border-box; max-height: 90vh; overflow-y:auto; border-top: 4px solid currentColor;}
                
                .checkout-price { font-size: 4rem; font-weight: 900; color: white; margin: 1.5rem 0; font-family: var(--font-mono); text-shadow: 0 5px 20px rgba(0,0,0,0.5);}
                .pay-btn { width: 100%; padding: 16px; border-radius: 12px; font-size: 1.1rem; font-weight: 900; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 12px; transition: transform 0.2s;}
                .pay-gpay { background: white; color: #3c4043; }
                .pay-card { background: #635bff; color: white; }

                @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

                /* =========================================================
                   RESPONSIVE MOBILE (FIELD APP - BOTTOM SAFE)
                   ========================================================= */
                @media (max-width: 768px) { 
                    .workspace-profile { padding: 90px 1rem 120px 1rem; } /* 120px BOTTOM SAFE */
                    .btn-status-closed, .btn-status-open { width: 100%; justify-content: center; display: flex; padding: 14px;}
                    .stats-grid { grid-template-columns: 1fr; gap: 1rem;}
                    .pm-section-title { flex-direction: column; align-items: flex-start; gap: 15px; }
                    .btn-mint { width: 100%; justify-content: center; padding: 14px; font-size:1rem;}
                    .card-modal { padding: 2.5rem 1.5rem; width: 95%; margin: 0 auto;}
                    
                    /* Formularios e Inputs Móvil */
                    .ia-import-box { padding: 1.5rem 1rem; }
                    .project-row { flex-direction: column; align-items: flex-start;}
                    .project-slices { text-align: left; width:100%; margin-top: 10px; border-top: 1px dashed #333; padding-top: 10px;}
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/profile')}

                <main class="workspace-profile">
                    
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-perfil" class="tab-content active">
                        <div class="form-group">
                            <label>1. Visión y Propósito</label>
                            <textarea id="inpVision" class="vision-textarea" placeholder="Ej: Desarrollador Full-Stack apasionado por la gobernanza descentralizada. Busco DAOs donde aportar en código y diseño de incentivos..."></textarea>
                        </div>

                        <div class="form-group">
                            <label>2. Afinidad Estructural (Nivel Casteller / Seniority)</label>
                            <div class="tag-grid" id="gridLevels">
                                ${this.levels.map(l => `
                                    <div>
                                        <input type="checkbox" class="tag-checkbox" id="lvl_${l.id}" value="${l.id}">
                                        <label class="tag-label" for="lvl_${l.id}">${l.label}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group" style="margin-top: 3rem;">
                            <label style="color: var(--accent-purple);">3. Autoridad Actual (Arquetipos Demostrados)</label>
                            <div class="tag-grid" id="gridGuardiansAuth">
                                ${this.guardians.map(g => `
                                    <div>
                                        <input type="checkbox" class="tag-checkbox" id="g_auth_${g.id}" value="${g.id}">
                                        <label class="tag-label guardian-auth" for="g_auth_${g.id}">${g.label}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group" style="margin-top: 3rem;">
                            <label style="color: var(--accent-green);">4. Interés de Crecimiento (A dónde vas)</label>
                            <div class="tag-grid" id="gridGuardiansGrowth">
                                ${this.guardians.map(g => `
                                    <div>
                                        <input type="checkbox" class="tag-checkbox" id="g_grow_${g.id}" value="${g.id}">
                                        <label class="tag-label guardian-grow" for="g_grow_${g.id}">${g.label}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <button class="btn-save-profile" id="btnSaveProfile">💾 Guardar Identidad (Local)</button>

                        <div class="pm-ikigai">
                            <div class="pm-section-title">
                                <span style="display:flex; align-items:center; gap:10px;">🧠 AI System Prompt (Ikigai) <span id="badgeMinted" class="verified-badge" style="display:none;">🕸️ Permaweb</span></span>
                                <button class="btn-mint" id="btnOpenMintModal">⚡ Generar Ikigai (IA)</button>
                            </div>
                            <div class="pm-prompt-text" id="aiSystemPrompt">
                                Rellena tu Identidad Fractal y guárdala para generar tu huella semántica orientada al Motor de Matching.
                            </div>
                        </div>
                    </div>

                    <div id="view-skills" class="tab-content">
                        <div class="ia-import-box">
                            <h3 style="color:white; margin-top:0; font-weight:900;">Proyección de Skills Teóricos (IA)</h3>
                            <p>Proporciona un enlace a tu LinkedIn, GitHub o pega tu CV. El Agente IA deducirá tus habilidades y nivel (Pinya a Anxaneta) para que el Ecosistema te reconozca antes de tener Proof of Work.</p>
                            <div style="display:flex; gap:10px; max-width:600px; margin:0 auto; flex-wrap:wrap;">
                                <input type="text" class="form-control" placeholder="URL o texto del CV..." style="flex:2; min-width:200px;">
                                <button class="btn-save-profile" style="flex:1; margin-top:0; padding:12px; font-size:1rem; min-width:180px;">🪄 Proyectar (IA)</button>
                            </div>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:10px; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                            <h3 style="color: white; font-size: 1.3rem; margin:0; font-weight:900;">Tus Open Badges (SBTs)</h3>
                            <div style="font-size:0.8rem; color:#888;">
                                <span style="color:var(--accent-green);">■ Real (PoW)</span> &nbsp;&nbsp; 
                                <span style="color:#666;">■ Teórico (IA)</span>
                            </div>
                        </div>
                        <div class="skills-grid" id="skillsList"></div>
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

                        <h3 style="color: white; font-size: 1.3rem; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 1.5rem; font-weight:900;">Mis Ecosistemas</h3>
                        <div id="projectsList"></div>
                    </div>

                    <div id="checkoutModal" class="overlay-modal">
                        <div class="card-modal" style="color: var(--accent-orange);">
                            <h2 style="color: var(--accent-orange); margin-top: 0; font-size: 2rem; font-weight:900; letter-spacing:-1px;">Soberanía Permaweb</h2>
                            <p style="color: var(--text-muted); font-size: 0.95rem; line-height:1.5;">La IA procesará tu visión y arquetipos para redactar tu Identidad Fractal y sellarla en Arweave.</p>
                            
                            <div class="checkout-price">€1.99</div>
                            <p style="color: #666; font-size: 0.8rem; margin-top:-15px; text-transform:uppercase; font-weight:bold;">Pago único por Minting + IA</p>

                            <div id="paymentButtons" style="margin-top: 2.5rem;">
                                <button class="pay-btn pay-gpay" id="btnGooglePay">Pagar con Google Pay</button>
                                <button class="pay-btn pay-card" id="btnStripePay">💳 Pagar con Tarjeta</button>
                                <button class="btn btn-outline" style="width: 100%; border: none; margin-top: 10px; background:transparent; color:#888; cursor:pointer; padding:12px; font-weight:bold;" id="btnCloseModal">Cancelar</button>
                            </div>

                            <div id="mintingLoader" style="display: none; flex-direction: column; align-items: center; gap: 20px; margin-top: 2rem;">
                                <div style="width: 50px; height: 50px; border: 5px solid rgba(255, 171, 64, 0.2); border-top-color: var(--accent-orange); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                                <p id="loaderStatusMsg" style="color: var(--accent-orange); font-family: var(--font-mono); font-weight: bold; margin:0; font-size:1.1rem;">Invocando Orquestador IA...</p>
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
        PageHeader.execute();

        const state = store.getState();
        this.activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === this.activeUserId);

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

        // TABS LOGIC
        const tabBtns = document.querySelectorAll('.ph-tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                
                const targetId = `view-${btn.dataset.tab}`;
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
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
                        this.dom.btnToggleAvailability.innerText = newStatus ? '🟢 Abierto a Proyectos (Match)' : '🔴 Modo Oculto (Privado)';
                    });
                }
            });
        }

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
                        this.dom.btnSave.style.background = "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))";
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
                        
                        // V12 SKILLS INFER (Reales por Proof of Work)
                        const skillTag = this.inferSkill(rolObj.levelId, entry.description);
                        if (!skillsMap[skillTag]) skillsMap[skillTag] = { realLvl: rolObj.levelId, count: 0, sources: new Map() };
                        
                        skillsMap[skillTag].count++;
                        skillsMap[skillTag].sources.set(p.id, p.nombre);
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
                            <a href="/v5/ledger" data-link style="font-size:0.8rem; color:var(--accent-blue); text-decoration:none; display:inline-block; margin-top:5px; font-weight:bold;" onclick="localStorage.setItem('tt_active_project', '${p.id}')">Ver Ledger &rarr;</a>
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
            pList.innerHTML = `<div style="text-align: center; padding: 4rem; border: 1px dashed #333; border-radius: 16px; color: #888; background:rgba(0,0,0,0.3);">Aún no tienes Slices consolidados.<br>Usa el Kanban para hacer Pull de tareas y ganar equidad.</div>`;
        }

        // RENDER DE SKILLS (Reales vs Teóricos)
        const sList = document.getElementById('skillsList');
        
        // Simulamos un skill Teórico inyectado por IA
        skillsMap['Desarrollo Full-Stack (IA)'] = { realLvl: '@aixecador', count: 0, isTheoretical: true, sources: new Map([['github', 'Análisis de Repositorios P2P']]) };

        const skillsArray = Object.keys(skillsMap).map(skillName => {
            return {
                name: skillName,
                ...skillsMap[skillName]
            };
        }).sort((a, b) => b.count - a.count);
        
        if (skillsArray.length > 0) {
            sList.innerHTML = skillsArray.map(skill => {
                const badgeClass = skill.isTheoretical ? 'level-theory' : 'level-real';
                const cardClass = skill.isTheoretical ? 'theoretical' : '';
                const lvlText = skill.realLvl.replace('@', '').toUpperCase();
                const iconCheck = skill.isTheoretical ? '🤖' : '✅';

                return `
                    <div class="skill-card ${cardClass}">
                        <div class="skill-header">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-level-badge ${badgeClass}">${lvlText}</span>
                        </div>
                        <div class="skill-source-list">
                            ${Array.from(skill.sources.entries()).map(([id, name]) => `
                                <div class="skill-source">
                                    <span>${iconCheck}</span> 
                                    ${skill.isTheoretical ? `<span style="color:#888;">${name}</span>` : `<a href="/v5/ledger" data-link class="skill-link" onclick="localStorage.setItem('tt_active_project', '${id}')">${name} (PoW)</a>`}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `
            }).join('');
        } else {
            sList.innerHTML = `<div style="grid-column:1/-1; color:#888; font-size:1rem; text-align:center; padding:3rem; border:1px dashed #444; border-radius:16px;">Completa entregables en el Kanban para ganar Soulbound Tokens (Skills reales) o usa la IA para proyectar tu conocimiento.</div>`;
        }
    }

    inferSkill(levelId, description) {
        const descLower = description.toLowerCase();
        if (descLower.includes('código') || descLower.includes('api') || descLower.includes('dev') || descLower.includes('software')) return 'Ingeniería de Software';
        if (descLower.includes('diseño') || descLower.includes('ui') || descLower.includes('ux') || descLower.includes('figma')) return 'Diseño de Producto (UI/UX)';
        if (descLower.includes('marketing') || descLower.includes('seo') || descLower.includes('redes')) return 'Growth & Marketing';
        
        if (levelId === '@anxaneta') return 'Estrategia Organizacional';
        if (levelId === '@aixecador') return 'Project Management';
        if (levelId === '@dosos') return 'Auditoría y QA';
        if (levelId === '@baixos') return 'Ejecución Operativa';
        if (levelId === '@pinya') return 'Soporte General';
        
        return 'Contribución Ecosistémica';
    }
}
