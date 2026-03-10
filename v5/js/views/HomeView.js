// v5/js/views/HomeView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class HomeView {
    constructor() {
        document.title = "TeamTowers | Sistema Operativo de Soberanía Organizacional";
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );

        // -------------------------------------------------------------------
        // MODO 1: COMMAND CENTER (Dashboard Privado)
        // -------------------------------------------------------------------
        if (activeUserId && activeUserId !== 'ecosystem-admin' && state.session.role !== 'guest') {
            const user = state.globalUsers.find(u => u.id === activeUserId);
            const userName = user ? user.name : activeUserId;
            
            let totalSlices = 0;
            let totalHours = 0;
            
            userProjects.forEach(p => {
                const harvest = store.calculateHarvest(p.id) || [];
                const userHarvest = harvest.find(h => h.userId === activeUserId);
                if (userHarvest) totalSlices += userHarvest.slices;
                const userLedger = (p.ledger || []).filter(tx => tx.userId === activeUserId);
                totalHours += userLedger.reduce((sum, tx) => sum + (tx.horas || 0), 0);
            });

            return `
                <style>
                    .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                    .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; }
                    .hero-banner { background: linear-gradient(135deg, rgba(0, 176, 255, 0.05) 0%, rgba(224, 64, 251, 0.05) 100%); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 3rem; position: relative; overflow: hidden; margin-bottom: 2.5rem; }
                    .hero-title { font-size: 2.8rem; color: white; margin: 0; letter-spacing: -1px; }
                    .hero-subtitle { color: var(--text-muted); font-size: 1.1rem; max-width: 600px; margin: 1rem 0 2rem 0; }
                    .global-stats { display: flex; gap: 2rem; margin-bottom: 2rem; }
                    .g-stat-val { font-size: 2rem; font-weight: 900; font-family: var(--font-mono); color: white; display: block;}
                    .g-stat-lbl { font-size: 0.8rem; color: var(--accent-blue); text-transform: uppercase; font-weight: bold;}
                    .btn-main { background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration: none; display: inline-block;}
                    .btn-secondary { background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--glass-border); padding: 12px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; text-decoration: none; display: inline-block; margin-left: 10px;}
                    .pillars-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;}
                    .pillar-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 1.5rem; text-decoration: none; border-top: 3px solid transparent;}
                    .val-forca { border-top-color: var(--accent-red); }
                    .val-equilibri { border-top-color: var(--accent-blue); }
                    .val-valor { border-top-color: var(--accent-green); }
                    .val-seny { border-top-color: var(--accent-purple); }
                    .project-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 1.5rem; text-decoration: none; cursor: pointer; transition: 0.2s;}
                    .project-card:hover { border-color: var(--accent-blue); background: rgba(255,255,255,0.05);}
                </style>
                <div class="app-layout">
                    ${Sidebar.getHtml('/')}
                    <main class="workspace">
                        <div class="hero-banner">
                            <h1 class="hero-title">Hola, ${userName}</h1>
                            <p class="hero-subtitle">Tu red está activa. Sigue levantando el Castell.</p>
                            <div class="global-stats">
                                <div class="g-stat">
                                    <span class="g-stat-val" style="color: var(--accent-green);">${Math.round(totalSlices).toLocaleString()}</span>
                                    <span class="g-stat-lbl">Equity Slices</span>
                                </div>
                                <div class="g-stat">
                                    <span class="g-stat-val">${totalHours.toFixed(1)}h</span>
                                    <span class="g-stat-lbl">Deep Work</span>
                                </div>
                            </div>
                            <div>
                                ${state.config.allowUserCreation || state.session.role === 'ecosystem-owner' ? '<a href="/v5/create" data-link class="btn-main">🏗️ Diseñar Organización</a>' : ''}
                                <a href="/v5/network" data-link class="btn-secondary">🌐 Explorar Redes</a>
                            </div>
                        </div>
                        <div class="pillars-grid">
                            <a href="/v5/project" data-link class="pillar-card val-forca"><h3>📋 Força</h3><p style="color:#666; font-size:0.8rem;">Tracción Kanban</p></a>
                            <a href="/v5/map" data-link class="pillar-card val-equilibri"><h3>🕸️ Equilibri</h3><p style="color:#666; font-size:0.8rem;">Mapa VNA</p></a>
                            <a href="/v5/ledger" data-link class="pillar-card val-valor"><h3>⚖️ Valor</h3><p style="color:#666; font-size:0.8rem;">Slicing Pie</p></a>
                            <a href="/v5/team" data-link class="pillar-card val-seny"><h3>🧠 Seny</h3><p style="color:#666; font-size:0.8rem;">La Colla (IA)</p></a>
                        </div>
                        <h2 style="color:white; margin-bottom:1.5rem;">Mis Ecosistemas</h2>
                        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;" id="projectsContainer">
                            ${userProjects.map(p => `
                                <div class="project-card" onclick="window.location.href='/v5/dashboard'">
                                    <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                                        <h3 style="color:white; margin:0;">${p.nombre}</h3>
                                        <span style="font-size:0.7rem; color:var(--accent-blue); font-family:var(--font-mono); border: 1px solid rgba(0,176,255,0.3); padding: 2px 6px; border-radius: 4px;">${p.archetype || 'STARTUP'}</span>
                                    </div>
                                    <div style="color:#666; font-size:0.8rem;">Owner: ${p.ownerId}</div>
                                    ${p.isPrivate ? '<div style="margin-top: 10px; font-size: 0.7rem; color: var(--accent-red); font-weight: bold;">🔒 RED PRIVADA</div>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </main>
                </div>
            `;
        }

        // -------------------------------------------------------------------
        // MODO 2: LANDING PAGE - LOGIN Y GOOGLE AUTH
        // -------------------------------------------------------------------
        return `
            <style>
                .landing-canvas { height: 100vh; width: 100vw; background: #050507; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: var(--font-main); position: relative; overflow: hidden; }
                .grid-bg { position: absolute; width: 200%; height: 200%; background-image: linear-gradient(rgba(0, 176, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 176, 255, 0.05) 1px, transparent 1px); background-size: 50px 50px; transform: perspective(500px) rotateX(60deg); bottom: -50%; left: -50%; animation: gridMove 20s linear infinite; z-index: 0; }
                @keyframes gridMove { from { background-position: 0 0; } to { background-position: 0 1000px; } }
                .content-box { z-index: 10; text-align: center; max-width: 900px; padding: 0 2rem; background: rgba(5, 5, 7, 0.8); backdrop-filter: blur(10px); padding: 3rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);}
                .tagline { color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.9rem; letter-spacing: 5px; text-transform: uppercase; margin-bottom: 1rem; display: block; }
                .main-title { font-size: 4.5rem; color: white; line-height: 0.9; margin-bottom: 2rem; letter-spacing: -3px; font-weight: 800; }
                .main-title span { color: var(--accent-purple); text-shadow: 0 0 30px rgba(224, 64, 251, 0.3); }
                .description { color: #888; font-size: 1.2rem; max-width: 650px; margin: 0 auto 2.5rem auto; line-height: 1.6; }
                
                .auth-container { display: flex; flex-direction: column; align-items: center; gap: 20px;}
                #googleButtonContainer { min-height: 40px; margin-bottom: 10px;}
                
                .manual-boot { margin-top: 2rem; border-top: 1px dashed #333; padding-top: 2rem; width: 100%; max-width: 400px;}
                .login-input { background: rgba(0,0,0,0.8); border: 1px solid #333; color: white; padding: 12px; border-radius: 8px; font-family: var(--font-mono); width: 100%; outline: none; margin-bottom: 10px; text-align: center;}
                .login-input:focus { border-color: var(--accent-blue); }
                .btn-boot { background: transparent; color: #888; border: 1px solid #333; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; transition: 0.2s;}
                .btn-boot:hover { color: white; border-color: var(--accent-blue); background: rgba(0,176,255,0.1); }

                /* TERMINAL OVERLAY */
                .terminal-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(5, 5, 7, 0.98); backdrop-filter: blur(20px); z-index: 1000; display: none;
                    flex-direction: column; align-items: center; justify-content: center;
                    font-family: var(--font-mono); color: var(--accent-green);
                }
                .boot-log { 
                    width: 500px; text-align: left; font-size: 1rem; line-height: 2; 
                    border-left: 3px solid var(--accent-blue); padding-left: 25px;
                    text-shadow: 0 0 8px rgba(0, 230, 118, 0.5); font-weight: bold;
                }
                .cursor { display: inline-block; width: 10px; height: 18px; background: var(--accent-green); animation: blink 0.8s infinite; margin-left: 5px; vertical-align: middle;}
                @keyframes blink { 50% { opacity: 0; } }
                @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>

            <div class="landing-canvas">
                <div class="grid-bg"></div>
                <div class="content-box">
                    <span class="tagline">Soberanía Organizacional</span>
                    <h1 class="main-title">No uses software.<br>Construye tu <span>Exoesqueleto.</span></h1>
                    <p class="description">Bienvenido al SOS v7.2. Identifícate para sincronizar tu Identidad Fractal y acceder al Castell.</p>
                    
                    <div class="auth-container">
                        <div id="googleButtonContainer"></div>
                        <div id="authStatus" style="color: var(--accent-green); font-family: var(--font-mono); font-size: 0.8rem; display: none;">Verificando credenciales...</div>
                        
                        <div class="manual-boot">
                            <p style="font-size: 0.75rem; color: #666; margin-top: 0; text-transform: uppercase;">Boot Manual (Fallback / Testing)</p>
                            <input type="text" id="loginUserId" class="login-input" placeholder="ID de Usuario (Ej: usr_alvaro_001)">
                            <button class="btn-boot" id="triggerBoot">FORZAR ACCESO &rarr;</button>
                        </div>
                    </div>
                </div>

                <div class="terminal-overlay" id="bootTerminal">
                    <div style="font-size: 4rem; margin-bottom: 2rem; text-shadow: 0 0 20px rgba(0,176,255,0.5);">🗼</div>
                    <div class="boot-log" id="logContent"></div>
                    <div style="margin-top: 3rem; font-size: 0.75rem; color: #555; text-shadow: none;">SOS_KERNEL_STABLE // BUILD 2026.03.11</div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        if (state.session.activeUserId && state.session.role !== 'guest') {
            Sidebar.initListeners();
            return;
        }

        // --- GOOGLE SIGN-IN INJECTION ---
        if (!document.getElementById('gsi-script')) {
            const script = document.createElement('script');
            script.id = 'gsi-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            document.head.appendChild(script);
            script.onload = () => this.initGoogleAuth();
        } else {
            this.initGoogleAuth();
        }

        // Fallback Bootloader Manual
        const btn = document.getElementById('triggerBoot');
        const terminal = document.getElementById('bootTerminal');
        const logContent = document.getElementById('logContent');
        const loginInput = document.getElementById('loginUserId');

        if (btn) {
            btn.addEventListener('click', async () => {
                const requestedId = loginInput.value.trim();
                if (!requestedId) return alert("Introduce tu ID");
                
                const exists = store.getState().globalUsers.find(u => u.id === requestedId);
                if (!exists) {
                    alert("ID no encontrado en el sistema. Registrate con Google o entra como usr_alvaro_001.");
                    return;
                }
                
                terminal.style.display = 'flex';
                
                const lines = [
                    `> AUTHENTICATING ENTITY: [${requestedId}]`,
                    "> INITIALIZING KERNEL V7.2...",
                    "> SYNCING VNA PROTOCOLS... <span style='color:var(--accent-blue)'>[OK]</span>",
                    "> LOADING SLICING PIE LEDGER... <span style='color:var(--accent-blue)'>[OK]</span>",
                    "> MOUNTING PERMAWEB REPOSITORY... <span style='color:var(--accent-blue)'>[OK]</span>",
                    "> VERIFYING PRIVACY FIREWALLS... <span style='color:var(--accent-blue)'>[OK]</span>",
                    "> DEPLOYING COGNITIVE EXOSKELETON..."
                ];

                let i = 0;
                const printLine = () => {
                    if (i < lines.length) {
                        logContent.innerHTML += `<div style="margin-bottom: 5px;">${lines[i]}</div>`;
                        i++;
                        setTimeout(printLine, 350); 
                    } else {
                        logContent.innerHTML += `<div style="margin-top:20px; color:white; font-size: 1.2rem;">ACCESS GRANTED <span class="cursor"></span></div>`;
                        
                        setTimeout(async () => {
                            await store.dispatch({ type: 'LOGIN_USER', payload: { userId: requestedId } });
                            window.location.reload();
                        }, 800);
                    }
                };
                setTimeout(printLine, 400);
            });
        }
    }

    initGoogleAuth() {
        // CLIENT ID OFICIAL DE PRODUCCIÓN
        const GOOGLE_CLIENT_ID = "778991708293-c4f7s4l4339ooldpun0eitfdb12gjfdn.apps.googleusercontent.com";

        if (window.google && window.google.accounts) {
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: this.handleGoogleCredentialResponse.bind(this)
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("googleButtonContainer"),
                    { theme: "filled_black", size: "large", shape: "pill", width: 300 }
                );
            } catch (e) {
                console.warn("GSI Error: Si estás en localhost sin SSL, Google Auth puede fallar.", e);
                document.getElementById("googleButtonContainer").innerHTML = `<span style="color:var(--accent-red); font-size:0.8rem;">GSI requiere dominio o HTTPS. Usa el Boot Manual.</span>`;
            }
        }
    }

    async handleGoogleCredentialResponse(response) {
        document.getElementById('authStatus').style.display = 'block';
        document.getElementById('googleButtonContainer').style.display = 'none';

        // Decodificar JWT (Base64)
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        const email = decodedToken.email;
        const name = decodedToken.name;

        const state = store.getState();
        // Verificar si el usuario ya existe por email (walletOrSocial)
        const existingUser = state.globalUsers.find(u => u.walletOrSocial === email);

        if (existingUser) {
            // Login normal
            await store.dispatch({ type: 'LOGIN_USER', payload: { userId: existingUser.id } });
            window.location.reload();
        } else {
            // Redirigir a Onboarding (Sala de Registro)
            sessionStorage.setItem('tt_temp_onboarding_email', email);
            sessionStorage.setItem('tt_temp_onboarding_name', name);
            window.location.href = '/v5/onboarding';
        }
    }
}
