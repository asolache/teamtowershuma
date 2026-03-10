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
        if (activeUserId && activeUserId !== 'ecosystem-admin' && state.session.role !== 'guest' && userProjects.length > 0) {
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
                        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;" id="projectsContainer"></div>
                    </main>
                </div>
            `;
        }

        // -------------------------------------------------------------------
        // MODO 2: LANDING PAGE - EL PORTAL AL EXOESQUELETO (No Logueado)
        // -------------------------------------------------------------------
        return `
            <style>
                .landing-canvas {
                    height: 100vh; width: 100vw; background: #050507;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    font-family: var(--font-main); position: relative; overflow: hidden;
                }
                .grid-bg {
                    position: absolute; width: 200%; height: 200%;
                    background-image: linear-gradient(rgba(0, 176, 255, 0.05) 1px, transparent 1px), 
                                      linear-gradient(90deg, rgba(0, 176, 255, 0.05) 1px, transparent 1px);
                    background-size: 50px 50px; transform: perspective(500px) rotateX(60deg);
                    bottom: -50%; left: -50%; animation: gridMove 20s linear infinite; z-index: 0;
                }
                @keyframes gridMove { from { background-position: 0 0; } to { background-position: 0 1000px; } }
                .content-box { z-index: 10; text-align: center; max-width: 900px; padding: 0 2rem; }
                .tagline { color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.9rem; letter-spacing: 5px; text-transform: uppercase; margin-bottom: 1rem; display: block; animation: fadeIn 2s ease-out; }
                .main-title { font-size: 4.5rem; color: white; line-height: 0.9; margin-bottom: 2rem; letter-spacing: -3px; font-weight: 800; animation: slideUp 1s ease-out; }
                .main-title span { color: var(--accent-purple); text-shadow: 0 0 30px rgba(224, 64, 251, 0.3); }
                .description { color: #888; font-size: 1.2rem; max-width: 650px; margin: 0 auto 2.5rem auto; line-height: 1.6; }
                
                .login-box { display: flex; gap: 10px; justify-content: center; margin-bottom: 2rem;}
                .login-input { background: rgba(0,0,0,0.8); border: 1px solid #333; color: white; padding: 15px 20px; border-radius: 8px; font-family: var(--font-mono); font-size: 1rem; width: 250px; outline: none;}
                .login-input:focus { border-color: var(--accent-blue); box-shadow: 0 0 15px rgba(0, 176, 255, 0.2);}

                .btn-boot {
                    background: white; color: black; border: none; padding: 15px 40px;
                    border-radius: 8px; font-weight: 900; font-size: 1.1rem; cursor: pointer;
                    font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 2px;
                    transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1); box-shadow: 0 15px 30px rgba(0,0,0,0.5);
                }
                .btn-boot:hover { transform: scale(1.05); background: var(--accent-blue); box-shadow: 0 0 50px rgba(0, 176, 255, 0.4); }

                /* TERMINAL OVERLAY - MEJORADO PARA LEGIBILIDAD */
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
                    <p class="description">
                        Bienvenido al SOS v7.0. El primer Kernel organizacional que fusiona <b>VNA</b>, <b>Slicing Pie</b> e <b>IA</b> 
                        para transformar el Deep Work en equidad inmutable.
                    </p>
                    
                    <div class="login-box">
                        <input type="text" id="loginUserId" class="login-input" placeholder="ID de Usuario (Ej: Laura)">
                        <button class="btn-boot" id="triggerBoot">BOOT SYSTEM &rarr;</button>
                    </div>
                </div>

                <div class="terminal-overlay" id="bootTerminal">
                    <div style="font-size: 4rem; margin-bottom: 2rem; text-shadow: 0 0 20px rgba(0,176,255,0.5);">🗼</div>
                    <div class="boot-log" id="logContent"></div>
                    <div style="margin-top: 3rem; font-size: 0.75rem; color: #555; text-shadow: none;">SOS_KERNEL_STABLE // BUILD 2026.03.10</div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const container = document.getElementById('projectsContainer');

        // Lógica Dashboard
        if (container) {
            Sidebar.initListeners();
            const userProjects = state.projects.filter(p => 
                state.session.role === 'ecosystem-owner' || 
                p.ownerId === activeUserId || 
                (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
            );
            container.innerHTML = userProjects.map(p => `
                <div class="project-card" onclick="window.location.href='/v5/project'">
                    <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                        <h3 style="color:white; margin:0;">${p.nombre}</h3>
                        <span style="font-size:0.7rem; color:var(--accent-blue); font-family:var(--font-mono);">${p.archetype || 'STARTUP'}</span>
                    </div>
                    <div style="color:#666; font-size:0.8rem;">Owner: ${p.ownerId}</div>
                </div>
            `).join('');
        }

        // Lógica Landing & Boot Sequence
        const btn = document.getElementById('triggerBoot');
        const terminal = document.getElementById('bootTerminal');
        const logContent = document.getElementById('logContent');
        const loginInput = document.getElementById('loginUserId');

        if (btn) {
            btn.addEventListener('click', () => {
                const requestedId = loginInput.value.trim() || 'usr_alvaro_001';
                
                terminal.style.display = 'flex';
                
                const lines = [
                    `> AUTHENTICATING ENTITY: [${requestedId}]`,
                    "> INITIALIZING KERNEL V7.0...",
                    "> SYNCING VNA PROTOCOLS... <span style='color:var(--accent-blue)'>[OK]</span>",
                    "> LOADING SLICING PIE LEDGER... <span style='color:var(--accent-blue)'>[OK]</span>",
                    "> MOUNTING PERMAWEB REPOSITORY... <span style='color:var(--accent-blue)'>[OK]</span>",
                    "> VERIFYING COLLA PERMISSIONS... <span style='color:var(--accent-blue)'>[OK]</span>",
                    "> DEPLOYING COGNITIVE EXOSKELETON..."
                ];

                let i = 0;
                const printLine = () => {
                    if (i < lines.length) {
                        logContent.innerHTML += `<div style="margin-bottom: 5px;">${lines[i]}</div>`;
                        i++;
                        setTimeout(printLine, 350); // Velocidad de lectura perfecta
                    } else {
                        logContent.innerHTML += `<div style="margin-top:20px; color:white; font-size: 1.2rem;">ACCESS GRANTED <span class="cursor"></span></div>`;
                        
                        // ES VITAL USAR ASYNC/AWAIT ANTES DE RECARGAR
                        setTimeout(async () => {
                            await store.dispatch({ type: 'LOGIN_USER', payload: { userId: requestedId } });
                            window.location.reload(); // Recarga limpia
                        }, 800);
                    }
                };
                setTimeout(printLine, 400);
            });
        }
    }
}
