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
        // MODO 1: COMMAND CENTER (Dashboard Privado si ya hay sesión)
        // -------------------------------------------------------------------
        if (activeUserId !== 'ecosystem-admin' && userProjects.length > 0) {
            const user = state.globalUsers.find(u => u.id === activeUserId);
            const userName = user ? user.name : "Comandante";
            const initial = userName.charAt(0).toUpperCase();
            
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
                            <p class="hero-subtitle">Tu Colla está activa. Sigue levantando el Castell.</p>
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
                            <a href="/v5/create" data-link class="btn-main">🏗️ Diseñar Organización</a>
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
                .description { color: #888; font-size: 1.2rem; max-width: 650px; margin: 0 auto 3.5rem auto; line-height: 1.6; }
                .btn-boot {
                    background: white; color: black; border: none; padding: 22px 50px;
                    border-radius: 4px; font-weight: 900; font-size: 1.2rem; cursor: pointer;
                    font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 2px;
                    transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1); box-shadow: 0 15px 30px rgba(0,0,0,0.5);
                }
                .btn-boot:hover { transform: scale(1.05); background: var(--accent-blue); box-shadow: 0 0 50px rgba(0, 176, 255, 0.4); }

                /* TERMINAL OVERLAY */
                .terminal-overlay {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: #000; z-index: 1000; display: none;
                    flex-direction: column; align-items: center; justify-content: center;
                    font-family: var(--font-mono); color: var(--accent-blue);
                }
                .boot-log { width: 450px; text-align: left; font-size: 0.85rem; line-height: 1.8; border-left: 2px solid #111; padding-left: 20px;}
                .cursor { display: inline-block; width: 8px; height: 15px; background: var(--accent-blue); animation: blink 0.8s infinite; }
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
                    <button class="btn-boot" id="triggerBoot">BOOT SYSTEM v7.0 &rarr;</button>
                </div>

                <div class="terminal-overlay" id="bootTerminal">
                    <div style="font-size: 3rem; margin-bottom: 2rem;">🗼</div>
                    <div class="boot-log" id="logContent"></div>
                    <div style="margin-top: 2rem; font-size: 0.7rem; color: #222;">SOS_KERNEL_STABLE // BUILD 2026.03.10</div>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const container = document.getElementById('projectsContainer');

        // Lógica para el Dashboard si el container existe
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

        // Lógica para el Ritual de Arranque
        const btn = document.getElementById('triggerBoot');
        const terminal = document.getElementById('bootTerminal');
        const logContent = document.getElementById('logContent');

        if (btn) {
            btn.addEventListener('click', () => {
                terminal.style.display = 'flex';
                const lines = [
                    "> INITIALIZING KERNEL V7.0...",
                    "> SYNCING VNA PROTOCOLS... [OK]",
                    "> LOADING SLICING PIE LEDGER... [OK]",
                    "> ESTABLISHING DEEPSEEK HANDSHAKE... [OK]",
                    "> MOUNTING PERMAWEB REPOSITORY... [OK]",
                    "> VERIFYING COLLA PERMISSIONS... [OK]",
                    "> DEPLOYING COGNITIVE EXOSKELETON...",
                    "> WELCOME, MASTER ARCHITECT."
                ];

                let i = 0;
                const printLine = () => {
                    if (i < lines.length) {
                        logContent.innerHTML += `<div>${lines[i]}</div>`;
                        i++;
                        setTimeout(printLine, 450); // Tiempo para leer cada hito
                    } else {
                        logContent.innerHTML += `<div style="margin-top:10px; color:white;">ACCESS GRANTED <span class="cursor"></span></div>`;
                        setTimeout(() => {
                            // Autologin con el Master Architect para la demo
                            store.dispatch({ type: 'LOGIN_USER', payload: { userId: 'usr_alvaro_001' } });
                            window.location.href = '/v5/';
                        }, 1000);
                    }
                };
                setTimeout(printLine, 500);
            });
        }
    }
}
