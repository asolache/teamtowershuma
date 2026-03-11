// v5/js/views/ProfileView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class ProfileView {
    constructor() {
        document.title = "Mi Perfil & Reputación | TeamTowers SOS";
        
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
                
                .workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; flex-direction: column; position: relative;}
                
                /* HEADER PERFIL REFINADO (RESPONSIVE) */
                .profile-header { 
                    display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 3rem; 
                    background: rgba(255,255,255,0.02); padding: 2rem; border-radius: var(--border-radius-lg); 
                    border: 1px solid var(--glass-border); position: relative; overflow: hidden;
                }
                .profile-header.minted { border-color: var(--accent-orange); box-shadow: 0 0 30px rgba(255, 171, 64, 0.1); background: linear-gradient(to right, rgba(255, 171, 64, 0.05), rgba(0,0,0,0));}
                .profile-header::before { content: ''; position: absolute; top: -50px; right: -50px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(0, 176, 255, 0.1) 0%, transparent 70%); border-radius: 50%; z-index: 0; pointer-events: none;}
                
                .header-top-row { display: flex; justify-content: space-between; align-items: flex-start; width: 100%; z-index: 1; flex-wrap: wrap; gap: 20px;}
                
                .profile-basic-info { display: flex; align-items: center; gap: 1.5rem; flex: 1; min-width: 300px; overflow: hidden;}
                .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); display: flex; justify-content: center; align-items: center; font-size: 2.5rem; font-weight: bold; color: white; box-shadow: 0 10px 30px rgba(0, 176, 255, 0.3); flex-shrink: 0;}
                .profile-header.minted .profile-avatar { background: linear-gradient(135deg, var(--accent-orange), #ffd740); box-shadow: 0 10px 30px rgba(255, 171, 64, 0.4);}
                
                .profile-info { flex: 1; min-width: 0; } /* min-width 0 es vital para el truncamiento flex */
                .profile-info h1 { margin: 0; font-size: 2.2rem; color: white; letter-spacing: -1px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;}
                .name-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; display: block;}
                .profile-info p { margin: 5px 0 0 0; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                
                .verified-badge { font-size: 0.8rem; background: rgba(255, 171, 64, 0.2); border: 1px solid var(--accent-orange); color: var(--accent-orange); padding: 4px 10px; border-radius: 12px; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 1px; display: flex; align-items: center; gap: 5px; white-space: nowrap;}
                
                .header-actions { display: flex; gap: 10px; z-index: 1; flex-shrink: 0; flex-wrap: wrap;}
                
                .btn-save-profile { background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; white-space: nowrap;}
                .btn-save-profile:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(179, 136, 255, 0.4); }
                
                .btn-mint { background: transparent; color: var(--accent-orange); border: 2px solid var(--accent-orange); padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; white-space: nowrap;}
                .btn-mint:hover { background: rgba(255, 171, 64, 0.1); transform: translateY(-2px); box-shadow: 0 5px 15px rgba(255, 171, 64, 0.2); }

                /* ESTADÍSTICAS GLOBALES */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
                .stat-card { background: var(--bg-panel); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: var(--border-radius-md); text-align: center; transition: transform 0.2s; }
                .stat-card:hover { transform: translateY(-5px); border-color: #555; }
                .stat-value { font-size: 2.5rem; color: var(--accent-green); font-weight: 800; font-family: var(--font-mono); margin-bottom: 5px; }
                .stat-label { color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }

                /* SECCIONES */
                .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                
                .section-title { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px;}
                .panel { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 2rem; }
                
                /* EDITOR DE IDENTIDAD */
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px; font-weight: bold; text-transform: uppercase;}
                .vision-textarea { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); color: white; padding: 15px; border-radius: 8px; font-family: inherit; font-size: 0.95rem; min-height: 100px; resize: vertical; box-sizing: border-box;}
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
                .pm-prompt-text { font-family: var(--font-mono); font-size: 0.85rem; color: #ccc; line-height: 1.5; background: rgba(0,0,0,0.5); padding: 15px; border-radius: 6px; border: 1px dashed #444; word-break: break-word;}

                /* CHECKOUT MODAL */
                .checkout-modal { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 1000; display: none; justify-content: center; align-items: center;}
                .checkout-card { background: #111; border: 1px solid var(--accent-orange); border-radius: 16px; padding: 3rem; width: 100%; max-width: 450px; text-align: center; box-shadow: 0 20px 50px rgba(255, 171, 64, 0.2); animation: slideUp 0.4s ease-out; box-sizing: border-box;}
                .checkout-price { font-size: 3.5rem; font-weight: 900; color: white; margin: 1rem 0; font-family: var(--font-mono);}
                .checkout-features { text-align: left; margin: 2rem 0; padding-left: 20px; color: #aaa; line-height: 1.6; font-size: 0.9rem;}
                
                .pay-btn { width: 100%; padding: 15px; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; transition: transform 0.2s;}
                .pay-btn:hover { transform: scale(1.02); }
                .pay-gpay { background: white; color: #3c4043; }
                .pay-card { background: #635bff; color: white; }

                .minting-loader { display: none; flex-direction: column; align-items: center; gap: 15px; margin-top: 2rem;}
                .spinner { width: 40px; height: 40px; border: 4px solid rgba(255, 171, 64, 0.3); border-top-color: var(--accent-orange); border-radius: 50%; animation: spin 1s linear infinite; }

                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

                @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }
                @media (max-width: 600px) { 
                    .workspace { padding: 1rem; } 
                    .header-top-row { flex-direction: column; }
                    .header-actions { width: 100%; display: grid; grid-template-columns: 1fr; gap: 10px;}
                    .profile-info h1 { font-size: 1.8rem; }
                    .checkout-card { padding: 2rem; width: 90%; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/profile')}

                <main class="workspace">
                    <div class="profile-header" id="profileHeader">
                        <div class="header-top-row">
                            <div class="profile-basic-info">
                                <div class="profile-avatar" id="profInitials">?</div>
                                <div class="profile-info">
                                    <h1>
                                        <span class="name-text" id="profName" title="Usuario Desconocido">Usuario Desconocido</span> 
                                        <span id="badgeMinted" class="verified-badge" style="display:none;">🕸️ Permaweb</span>
                                    </h1>
                                    <p id="profId">@id</p>
                                </div>
                            </div>
                            <div class="header-actions">
                                <button class="btn-mint" id="btnOpenMintModal">💎 Generar Ikigai & Sellar (IA)</button>
                                <button class="btn-save-profile" id="btnSaveProfile">💾 Guardar Local</button>
                            </div>
                        </div>
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
                            <h3 class="section-title">🧬 Identidad Fractal (CV Libre)</h3>
                            
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
                                        <span>🧠 AI System Prompt (Huella Semántica)</span>
                                    </div>
                                    <div class="pm-prompt-text" id="aiSystemPrompt">
                                        El orquestador de Matching generará aquí tu perfil único cuando decidas Acuñar tu Identidad.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="checkoutModal" class="checkout-modal">
                        <div class="checkout-card">
                            <h2 style="color: var(--accent-orange); margin-top: 0; font-size: 1.8rem;">Soberanía Permaweb</h2>
                            <p style="color: var(--text-muted); font-size: 0.9rem;">La IA procesará tu visión y tus arquetipos para redactar tu Identidad Fractal y sellarla en Arweave.</p>
                            
                            <div class="checkout-price">€1.99</div>
                            <p style="color: #666; font-size: 0.75rem; margin-top:-10px;">Pago único por Minting + Invocación IA</p>

                            <ul class="checkout-features">
                                <li>✅ Redacción de Huella Semántica por Inteligencia Artificial.</li>
                                <li>✅ Inyección del Hash en la red descentralizada Arweave.</li>
                                <li>✅ Desbloqueo del Motor de Matching para ser reclutado en DAOs.</li>
                            </ul>

                            <div id="paymentButtons">
                                <button class="pay-btn pay-gpay" id="btnGooglePay">
                                    <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5455 7.63636V10.1818H20.8182C20.5455 11.5455 19.5455 13.3636 17.2727 13.3636C15.3636 13.3636 13.8182 11.8182 13.8182 9.81818C13.8182 7.81818 15.3636 6.27273 17.2727 6.27273C18.3636 6.27273 19.0909 6.72727 19.5455 7.18182L21.4545 5.27273C20.3636 4.18182 18.9091 3.54545 17.2727 3.54545C13.8182 3.54545 11 6.36364 11 9.81818C11 13.2727 13.8182 16.0909 17.2727 16.0909C20.9091 16.0909 23.3636 13.5455 23.3636 9.90909C23.3636 9.36364 23.2727 8.81818 23.1818 8.45455H14.5455V7.63636ZM27.0909 10V12.7273H29.6364V10H32.3636V7.45455H29.6364V4.72727H27.0909V7.45455H24.3636V10H27.0909Z" fill="#3C4043"/><path d="M4.63636 12.8182H7.36364V0.909091H4.63636V12.8182ZM1.81818 12.8182H4.54545V4.72727H1.81818V12.8182Z" fill="#3C4043"/></svg>
                                    Pagar con Google Pay
                                </button>
                                <button class="pay-btn pay-card" id="btnStripePay">💳 Pagar con Tarjeta (Stripe)</button>
                                <button class="btn btn-outline" style="width: 100%; border: none; margin-top: 10px;" id="btnCloseModal">Cancelar</button>
                            </div>

                            <div id="mintingLoader" class="minting-loader">
                                <div class="spinner"></div>
                                <p id="loaderStatusMsg" style="color: var(--accent-orange); font-family: var(--font-mono); font-weight: bold; margin:0;">Invocando Orquestador IA...</p>
                                <p style="color: #666; font-size: 0.75rem;">Generando Ikigai y Sellando Hash en Permaweb.</p>
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
            btnMint: document.getElementById('btnOpenMintModal'),
            aiSystemPrompt: document.getElementById('aiSystemPrompt'),
            
            profileHeader: document.getElementById('profileHeader'),
            badgeMinted: document.getElementById('badgeMinted'),
            checkoutModal: document.getElementById('checkoutModal'),
            btnCloseModal: document.getElementById('btnCloseModal'),
            btnGooglePay: document.getElementById('btnGooglePay'),
            btnStripePay: document.getElementById('btnStripePay'),
            paymentButtons: document.getElementById('paymentButtons'),
            mintingLoader: document.getElementById('mintingLoader'),
            loaderStatusMsg: document.getElementById('loaderStatusMsg')
        };

        const state = store.getState();
        this.activeUserId = state.session.activeUserId;

        const user = state.globalUsers.find(u => u.id === this.activeUserId);
        
        if (user) {
            this.dom.profName.innerText = user.name;
            this.dom.profName.title = user.name; // Truncate fallback
            this.dom.profId.innerText = user.id;
            this.dom.profInitials.innerText = user.name.charAt(0).toUpperCase();
            
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
                    this.applyMintedStyle(user.profile.permawebHash);
                }
                
                // Si ya tiene el perfil redactado por IA (ikigaiSummary), lo mostramos
                if(user.profile.ikigaiSummary) {
                    this.updateSystemPromptDisplay(user.profile.permawebHash, user.profile.ikigaiSummary);
                } else {
                    this.updateSystemPromptDisplay(user.profile.permawebHash);
                }
            }
        } else {
            this.dom.profName.innerText = "Administrador del Sistema";
            this.dom.profId.innerText = this.activeUserId;
            this.dom.profInitials.innerText = "⚙️";
            this.dom.btnMint.style.display = 'none';
        }

        // EVENTOS
        this.dom.btnSave.addEventListener('click', () => this.saveIdentity(false));
        
        this.dom.btnMint.addEventListener('click', () => {
            this.saveIdentity(false); 
            this.dom.checkoutModal.style.display = 'flex';
        });
        
        this.dom.btnCloseModal.addEventListener('click', () => {
            this.dom.checkoutModal.style.display = 'none';
        });

        const simulatePayment = () => this.executeMintingProcess();
        this.dom.btnGooglePay.addEventListener('click', simulatePayment);
        this.dom.btnStripePay.addEventListener('click', simulatePayment);

        this.calculateReputationAndStats(state);
    }

    applyMintedStyle(hash) {
        this.dom.profileHeader.classList.add('minted');
        this.dom.btnMint.style.display = 'none';
        
        const badge = document.getElementById('badgeMinted');
        if(badge) badge.style.display = 'inline-flex';
        
        this.dom.profId.innerHTML = `${this.activeUserId} <span style="color:var(--accent-orange); margin-left:10px; font-size:0.7rem;">HASH: ${hash}</span>`;
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
            
            // Usamos la nueva acción oficial del V8.0 Store
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
                    this.dom.btnSave.innerText = "✅ Guardado";
                    this.dom.btnSave.style.background = "var(--accent-green)";
                    setTimeout(() => {
                        this.dom.btnSave.innerText = originalText;
                        this.dom.btnSave.style.background = "linear-gradient(45deg, var(--accent-blue), var(--accent-purple))";
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
        
        // 1. INVOCAR IA PARA GENERAR IKIGAI SEMÁNTICO
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
                Analiza el siguiente perfil y resume en 2 párrafos la 'Huella Semántica' (Ikigai) de este talento, explicando cómo puede aportar valor a una DAO descentralizada. Tono profesional pero vanguardista.
                
                Datos del talento:
                Visión: "${profile.vision}"
                Niveles Estructurales: ${profile.structural_affinity.join(', ')}
                Arquetipos (Autoridad): ${profile.guardian_authority.join(', ')}
                Arquetipos (Crecimiento): ${profile.guardian_growth.join(', ')}
            `;

            try {
                if (savedProvider === 'openai') {
                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: systemPrompt }] })
                    });
                    const data = await response.json();
                    ikigaiSummary = data.choices[0].message.content;
                } else if (savedProvider === 'deepseek') {
                    const response = await fetch('https://api.deepseek.com/chat/completions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: systemPrompt }] })
                    });
                    const data = await response.json();
                    ikigaiSummary = data.choices[0].message.content;
                } else if (savedProvider === 'gemini') {
                    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
                    });
                    const data = await response.json();
                    ikigaiSummary = data.candidates[0].content.parts[0].text;
                }
            } catch (e) {
                console.warn("Error con IA, generando hash simple sin resumen.", e);
                ikigaiSummary = "Perfil verificado. El agente cognitivo no pudo conectarse para generar el resumen narrativo.";
            }
        } else {
            ikigaiSummary = "Perfil verificado en Permaweb. (Añade API Key en Settings para auto-generar resumen IA).";
        }

        this.dom.loaderStatusMsg.innerText = "Sellando Identidad en Arweave...";

        setTimeout(async () => {
            const mockHash = 'ar://' + Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('');
            
            // Usamos la nueva acción oficial del V8.0 Store
            await store.dispatch({
                type: 'UPDATE_USER_PROFILE',
                payload: {
                    userId: this.activeUserId,
                    profile: { permawebHash: mockHash, ikigaiSummary: ikigaiSummary, mintDate: Date.now() }
                }
            });

            this.dom.checkoutModal.style.display = 'none';
            this.dom.paymentButtons.style.display = 'block';
            this.dom.mintingLoader.style.display = 'none';
            
            this.applyMintedStyle(mockHash);
            this.updateSystemPromptDisplay(mockHash, ikigaiSummary);
            
            alert("🎉 ¡Identidad Acuñada con Éxito en la Permaweb!");
        }, 1500); 
    }

    updateSystemPromptDisplay(hash = null, ikigaiSummary = null) {
        const structural_affinity = Array.from(document.querySelectorAll('input[id^="lvl_"]:checked')).map(el => el.value);
        const guardian_authority = Array.from(document.querySelectorAll('input[id^="g_auth_"]:checked')).map(el => el.value);
        const guardian_growth = Array.from(document.querySelectorAll('input[id^="g_grow_"]:checked')).map(el => el.value);

        const authLabels = guardian_authority.map(id => this.guardians.find(g => g.id === id)?.label.split(' ')[1] || id);
        const growthLabels = guardian_growth.map(id => this.guardians.find(g => g.id === id)?.label.split(' ')[1] || id);

        if (structural_affinity.length === 0 && guardian_authority.length === 0 && !ikigaiSummary) {
            this.dom.aiSystemPrompt.innerHTML = "Rellena tu Identidad Fractal y guarda para generar tu huella semántica.";
            return;
        }

        const hashLine = hash ? `<span style="color: var(--accent-orange); font-weight:bold; margin-bottom: 10px; display:block;">TxID: ${hash}</span>` : '';
        const summaryHtml = ikigaiSummary ? `<div style="color: white; margin-top:10px; border-top: 1px dashed #555; padding-top:10px;">${ikigaiSummary.replace(/\n/g, '<br>')}</div>` : '';

        this.dom.aiSystemPrompt.innerHTML = `
            ${hashLine}
            <span style="color: var(--accent-blue);">Niveles:</span> [${structural_affinity.join(', ')}]<br>
            <span style="color: var(--accent-purple);">Autoridad:</span> [${authLabels.join(', ')}]<br>
            <span style="color: var(--accent-green);">Crecimiento:</span> [${growthLabels.join(', ')}]<br>
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

        document.getElementById('totSlices').innerText = Math.round(globalSlices).toLocaleString();
        document.getElementById('totHours').innerText = globalHours.toFixed(1) + 'h';
        document.getElementById('totProjects').innerText = activeProjectsCount;

        const pList = document.getElementById('projectsList');
        if (projectRowsHtml.length > 0) {
            pList.innerHTML = projectRowsHtml.join('');
        } else {
            pList.innerHTML = `<p style="color: var(--text-muted); font-style: italic; padding: 2rem; text-align: center; border: 1px dashed #333; border-radius: 8px;">Aún no tienes Slices consolidados.<br><br>Ve a 'Explorar DAOs', únete a un Castell y haz Pull de tareas para empezar a generar valor.</p>`;
        }

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
