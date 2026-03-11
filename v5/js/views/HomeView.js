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
        
        // -------------------------------------------------------------------
        // MODO 1: USER DASHBOARD (Logueado)
        // -------------------------------------------------------------------
        if (activeUserId && activeUserId !== 'ecosystem-admin' && state.session.role !== 'guest') {
            const user = state.globalUsers.find(u => u.id === activeUserId) || { name: activeUserId, profile: {} };
            const userName = user.name;
            
            const userProjects = state.projects.filter(p => 
                state.session.role === 'ecosystem-owner' || 
                p.ownerId === activeUserId || 
                (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
            );

            let totalSlices = 0;
            let totalHours = 0;
            let myTasks = [];
            let opportunities = [];
            
            userProjects.forEach(p => {
                // Cálculo de Stats
                const harvest = store.calculateHarvest(p.id) || [];
                const userHarvest = harvest.find(h => h.userId === activeUserId);
                if (userHarvest) totalSlices += userHarvest.slices;
                
                const userLedger = (p.ledger || []).filter(tx => tx.userId === activeUserId);
                totalHours += userLedger.reduce((sum, tx) => sum + (tx.horas || 0), 0);

                // Extracción de Tareas Personales
                const myRoles = (p.asignaciones || []).filter(a => a.userId === activeUserId).map(a => a.roleId);
                const pendingTxs = (p.transactions || []).filter(tx => myRoles.includes(tx.to) && tx.status !== 'consolidated');
                
                pendingTxs.forEach(tx => {
                    const role = p.roles.find(r => r.id === tx.to);
                    myTasks.push({ project: p.nombre, role: role ? role.name : 'Unknown', task: tx.entregable, hours: tx.horas, type: tx.tipo });
                });

                // Extracción de Oportunidades (Sillas vacías que encajan con su Ikigai)
                const vacantRoles = p.roles.filter(r => !r.isArchived && !(p.asignaciones || []).find(a => a.roleId === r.id));
                vacantRoles.forEach(r => {
                    let score = 0;
                    if (user.profile?.structural_affinity?.includes(r.levelId)) score += 50;
                    if (r.guardian && user.profile?.guardian_authority?.includes(r.guardian)) score += 50;
                    if (score > 0) opportunities.push({ project: p.nombre, role: r.name, level: r.levelId, score });
                });
            });

            const tasksHtml = myTasks.length > 0 
                ? myTasks.map(t => `
                    <div class="list-card">
                        <div style="font-size:0.7rem; color:var(--accent-blue); font-family:var(--font-mono);">${t.project} &rarr; ${t.role}</div>
                        <div style="color:white; font-weight:bold; margin-top:5px;">${t.task} <span style="color:#888; font-weight:normal;">(${t.hours}h)</span></div>
                    </div>`).join('')
                : `<div style="color:#666; padding: 1rem; text-align:center;">No tienes flujos de trabajo pendientes.</div>`;

            const oppHtml = opportunities.length > 0
                ? opportunities.sort((a,b)=>b.score-a.score).slice(0,4).map(o => `
                    <div class="list-card opp-card">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="font-size:0.75rem; color:var(--accent-orange); font-weight:bold;">${o.project}</div>
                            <div style="font-size:0.7rem; background:rgba(0,0,0,0.5); padding:2px 6px; border-radius:4px; color:white;">Match: ${o.score}%</div>
                        </div>
                        <div style="color:white; font-weight:bold; margin-top:5px;">${o.role} <span style="color:#888; font-weight:normal; font-size:0.8rem;">(${o.level})</span></div>
                    </div>`).join('')
                : `<div style="color:#666; padding: 1rem; text-align:center;">No hay vacantes alineadas a tu Ikigai actual.</div>`;

            return `
                <style>
                    .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); }
                    .workspace { flex: 1; padding: 2.5rem 4rem; overflow-y: auto; display: flex; flex-direction: column; }
                    
                    .personal-hero { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1.5rem;}
                    .personal-hero h1 { font-size: 2.5rem; color: white; margin: 0; letter-spacing: -1px; }
                    
                    .global-stats { display: flex; gap: 2rem; background: rgba(255,255,255,0.02); padding: 1rem 2rem; border-radius: var(--border-radius-md); border: 1px solid var(--glass-border);}
                    .g-stat-val { font-size: 1.8rem; font-weight: 900; font-family: var(--font-mono); color: var(--accent-green); display: block;}
                    .g-stat-lbl { font-size: 0.7rem; color: #888; text-transform: uppercase; font-weight: bold;}

                    .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                    .dash-col { display: flex; flex-direction: column; gap: 2rem; }
                    
                    .panel { background: rgba(255,255,255,0.01); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 1.5rem; }
                    .panel-title { color: white; font-size: 1.2rem; margin-top: 0; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px;}
                    
                    .list-card { background: rgba(0,0,0,0.3); border: 1px solid #222; padding: 12px 15px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid var(--accent-blue); transition: 0.2s;}
                    .list-card:hover { background: rgba(0, 176, 255, 0.05); border-color: #444; }
                    .opp-card { border-left-color: var(--accent-orange); cursor: pointer; }
                    .opp-card:hover { background: rgba(255, 171, 64, 0.05); }

                    .ai-service-btn { width: 100%; text-align: left; background: rgba(224, 64, 251, 0.05); border: 1px dashed rgba(224, 64, 251, 0.3); padding: 15px; border-radius: 8px; color: white; cursor: pointer; margin-bottom: 10px; transition: 0.2s;}
                    .ai-service-btn:hover { background: rgba(224, 64, 251, 0.1); border-style: solid; transform: translateX(5px); }
                    .ai-service-btn strong { display: block; color: var(--accent-purple); font-size: 1rem; margin-bottom: 4px;}
                    .ai-service-btn span { font-size: 0.75rem; color: #888;}
                </style>

                <div class="app-layout">
                    ${Sidebar.getHtml('/')}
                    <main class="workspace">
                        <header class="personal-hero">
                            <div>
                                <h1 style="color:var(--accent-blue);">Soberanía Personal</h1>
                                <p style="color:var(--text-muted); margin: 5px 0 0 0;">Bienvenido a tu nodo de control, <strong>${userName}</strong>.</p>
                            </div>
                            <div class="global-stats">
                                <div>
                                    <span class="g-stat-val">${Math.round(totalSlices).toLocaleString()}</span>
                                    <span class="g-stat-lbl">Slices Minados</span>
                                </div>
                                <div>
                                    <span class="g-stat-val" style="color:var(--accent-blue);">${totalHours.toFixed(1)}h</span>
                                    <span class="g-stat-lbl">Horas Aportadas</span>
                                </div>
                            </div>
                        </header>

                        <div class="dash-grid">
                            <div class="dash-col">
                                <div class="panel">
                                    <h2 class="panel-title">📋 Mis Flujos Pendientes</h2>
                                    <div style="max-height: 400px; overflow-y:auto; padding-right:10px;">
                                        ${tasksHtml}
                                    </div>
                                    <a href="/v5/project" data-link style="display:block; text-align:center; color:var(--accent-blue); font-size:0.8rem; margin-top:15px; text-decoration:none; font-weight:bold;">Ir al Kanban del Proyecto &rarr;</a>
                                </div>
                            </div>
                            
                            <div class="dash-col">
                                <div class="panel">
                                    <h2 class="panel-title">🎯 Oportunidades (Match de Ikigai)</h2>
                                    <p style="font-size:0.8rem; color:#888; margin-top:-10px; margin-bottom:15px;">Sillas vacías en la red que encajan con tu ADN fractal.</p>
                                    <div>${oppHtml}</div>
                                </div>

                                <div class="panel" style="border-color: rgba(224, 64, 251, 0.2);">
                                    <h2 class="panel-title" style="color:var(--accent-purple);">🤖 Servicios Cognitivos (IA)</h2>
                                    <button class="ai-service-btn" onclick="alert('Módulo de Resumen de Rendimiento en desarrollo.')">
                                        <strong>🧠 Mi Performance Review</strong>
                                        <span>La IA analiza tus transacciones y te da feedback sobre tu eficiencia.</span>
                                    </button>
                                    <button class="ai-service-btn" onclick="window.location.href='/v5/dashboard'">
                                        <strong>⚖️ Generar Pactos de Socios</strong>
                                        <span>Ve al Dashboard de un proyecto para notarizar la Cap Table.</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            `;
        }

        // -------------------------------------------------------------------
        // MODO 2: LANDING PAGE - WEB3 & LOCAL-FIRST
        // -------------------------------------------------------------------
        return `
            <style>
                .landing-canvas { height: 100vh; width: 100vw; background: #050507; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: var(--font-main); position: relative; overflow: hidden; }
                .grid-bg { position: absolute; width: 200%; height: 200%; background-image: linear-gradient(rgba(0, 176, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 176, 255, 0.05) 1px, transparent 1px); background-size: 50px 50px; transform: perspective(500px) rotateX(60deg); bottom: -50%; left: -50%; animation: gridMove 20s linear infinite; z-index: 0; }
                @keyframes gridMove { from { background-position: 0 0; } to { background-position: 0 1000px; } }
                
                .content-box { z-index: 10; text-align: center; max-width: 900px; padding: 0 2rem; background: rgba(5, 5, 7, 0.8); backdrop-filter: blur(10px); padding: 4rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 30px 60px rgba(0,0,0,0.8);}
                
                .tagline { color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 1.5rem; display: inline-block; background: rgba(0,176,255,0.1); padding: 5px 15px; border-radius: 20px; border: 1px solid rgba(0,176,255,0.2);}
                .main-title { font-size: 4rem; color: white; line-height: 1; margin-bottom: 1.5rem; letter-spacing: -2px; font-weight: 800; }
                .main-title span { color: transparent; background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple)); -webkit-background-clip: text; background-clip: text; }
                .description { color: #aaa; font-size: 1.1rem; max-width: 600px; margin: 0 auto 3rem auto; line-height: 1.6; }
                
                .auth-container { display: flex; flex-direction: column; align-items: center; gap: 15px; width: 100%; max-width: 350px; margin: 0 auto;}
                
                .btn-web3 { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s;}
                .btn-web3:hover { background: rgba(255,255,255,0.1); border-color: white; transform: translateY(-2px);}
                
                #googleButtonContainer { width: 100%; display: flex; justify-content: center;}

                .features-row { display: flex; justify-content: center; gap: 30px; margin-top: 3rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 2rem;}
                .feat { font-size: 0.8rem; color: #666; display: flex; align-items: center; gap: 8px;}
                .feat strong { color: var(--accent-green); }

                /* TERMINAL OVERLAY */
                .terminal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5, 5, 7, 0.98); backdrop-filter: blur(20px); z-index: 2000; display: none; flex-direction: column; align-items: center; justify-content: center; font-family: var(--font-mono); color: var(--accent-green); }
                .boot-log { width: 500px; text-align: left; font-size: 1rem; line-height: 2; border-left: 3px solid var(--accent-blue); padding-left: 25px; text-shadow: 0 0 8px rgba(0, 230, 118, 0.5); font-weight: bold; }
                .cursor { display: inline-block; width: 10px; height: 18px; background: var(--accent-green); animation: blink 0.8s infinite; margin-left: 5px; vertical-align: middle;}
                
                @keyframes blink { 50% { opacity: 0; } }
            </style>

            <div class="landing-canvas">
                <div class="grid-bg"></div>
                <div class="content-box">
                    <span class="tagline">Local-First DAO OS</span>
                    <h1 class="main-title">No uses software.<br>Construye <span>Soberanía.</span></h1>
                    <p class="description">El primer Exoesqueleto Organizacional que fusiona Modelos Dinámicos de Equidad (Slicing Pie), Agentes IA y Bases de Datos Locales para equipos radicales.</p>
                    
                    <div class="auth-container">
                        <button class="btn-web3" id="btnConnectWallet">
                            🦊 Conectar Wallet (Web3)
                        </button>
                        
                        <div style="color:#555; font-size:0.8rem; margin: 5px 0;">— o utiliza el puente Web2 —</div>
                        
                        <div id="googleButtonContainer"></div>
                        <div id="authStatus" style="color: var(--accent-green); font-family: var(--font-mono); font-size: 0.8rem; display: none;">Sincronizando Identidad Fractal...</div>
                    </div>

                    <div class="features-row">
                        <div class="feat"><strong>✓</strong> Datos en Localhost</div>
                        <div class="feat"><strong>✓</strong> Contratos Inmutables</div>
                        <div class="feat"><strong>✓</strong> Orquestador Cognitivo IA</div>
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
            return; // Si está logueado, no cargamos scripts de auth
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

        // --- WEB3 WALLET MOCK CONNECT ---
        const btnWallet = document.getElementById('btnConnectWallet');
        if (btnWallet) {
            btnWallet.addEventListener('click', () => {
                const address = prompt("Fase Beta: Simulador de Conexión Ethers.js\nIntroduce una Wallet Address (Ej: 0x123...):", "0xabc123...");
                if (address) {
                    this.processLoginOrOnboarding({ wallet: address, name: "Crypto User" });
                }
            });
        }
    }

    initGoogleAuth() {
        const GOOGLE_CLIENT_ID = "778991708293-c4f7s4l4339ooldpun0eitfdb12gjfdn.apps.googleusercontent.com";
        if (window.google && window.google.accounts) {
            try {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: this.handleGoogleCredentialResponse.bind(this)
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("googleButtonContainer"),
                    { theme: "outline", size: "large", shape: "rectangular", width: 350 }
                );
            } catch (e) {
                console.warn("GSI Error:", e);
                document.getElementById("googleButtonContainer").innerHTML = 
                    `<button class="btn-web3" onclick="alert('Google Auth requiere HTTPS / Dominio válido.')">⚠️ Forzar Login Dummy</button>`;
            }
        }
    }

    async handleGoogleCredentialResponse(response) {
        document.getElementById('authStatus').style.display = 'block';
        document.getElementById('googleButtonContainer').style.display = 'none';
        document.getElementById('btnConnectWallet').style.display = 'none';

        // Decodificar JWT (Base64)
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decodedToken = JSON.parse(jsonPayload);
        this.processLoginOrOnboarding({ email: decodedToken.email, name: decodedToken.name });
    }

    async processLoginOrOnboarding(credentials) {
        const state = store.getState();
        
        // Buscar si existe el usuario por email O por wallet
        const existingUser = state.globalUsers.find(u => 
            (credentials.email && u.email === credentials.email) || 
            (credentials.wallet && u.wallet === credentials.wallet) ||
            (credentials.email && u.walletOrSocial === credentials.email) // Legacy support
        );

        if (existingUser) {
            // LOGIN SECUENCE (Terminal UI)
            const terminal = document.getElementById('bootTerminal');
            const logContent = document.getElementById('logContent');
            if (terminal) terminal.style.display = 'flex';
            
            const lines = [
                `> AUTHENTICATING ENTITY: [${existingUser.id}]`,
                "> SYNCING VNA PROTOCOLS... <span style='color:var(--accent-blue)'>[OK]</span>",
                "> LOADING SLICING PIE LEDGER... <span style='color:var(--accent-blue)'>[OK]</span>",
                "> DEPLOYING COGNITIVE EXOSKELETON..."
            ];

            let i = 0;
            const printLine = () => {
                if (i < lines.length) {
                    if (logContent) logContent.innerHTML += `<div style="margin-bottom: 5px;">${lines[i]}</div>`;
                    i++;
                    setTimeout(printLine, 300); 
                } else {
                    if (logContent) logContent.innerHTML += `<div style="margin-top:20px; color:white; font-size: 1.2rem;">ACCESS GRANTED <span class="cursor"></span></div>`;
                    setTimeout(async () => {
                        await store.dispatch({ type: 'LOGIN_USER', payload: { userId: existingUser.id } });
                        window.location.reload();
                    }, 600);
                }
            };
            setTimeout(printLine, 200);

        } else {
            // NO EXISTE -> ENVIAR A RECLAMAR EL @ALIAS (Onboarding)
            sessionStorage.setItem('tt_temp_onboarding_email', credentials.email || '');
            sessionStorage.setItem('tt_temp_onboarding_wallet', credentials.wallet || '');
            sessionStorage.setItem('tt_temp_onboarding_name', credentials.name || '');
            
            // Simular un pequeño delay de validación antes de redirigir
            setTimeout(() => {
                window.location.href = '/v5/onboarding';
            }, 1000);
        }
    }
}
