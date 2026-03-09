// v5/js/views/HomeView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';

export default class HomeView {
    constructor() {
        document.title = "TeamTowers | El Sistema Operativo para Redes de Valor";
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const activeProject = state.projects[state.projects.length - 1];

        // -------------------------------------------------------------------
        // MODO 1: COMMAND CENTER (Si el usuario está logueado y tiene proyecto)
        // -------------------------------------------------------------------
        if (activeUserId !== 'ecosystem-admin' && activeProject) {
            const user = state.globalUsers.find(u => u.id === activeUserId);
            const userName = user ? user.name : "Comandante";
            const initial = userName.charAt(0).toUpperCase();
            
            // Cálculos rápidos para el dashboard
            const myTxs = activeProject.transactions.filter(tx => tx.userId === activeUserId);
            const inProgress = myTxs.filter(tx => tx.status === 'pinged').length;
            const done = myTxs.filter(tx => tx.status === 'consolidated').length;

            return `
                <style>
                    .app-layout { display: flex; height: 100vh; overflow: hidden; background: #0a0a0c; font-family: 'Segoe UI', sans-serif; }
                    .workspace { flex: 1; padding: 3rem; overflow-y: auto; display: flex; flex-direction: column; }
                    
                    .welcome-banner { background: linear-gradient(135deg, rgba(0, 176, 255, 0.1), rgba(224, 64, 251, 0.1)); border: 1px solid rgba(0, 176, 255, 0.2); border-radius: 16px; padding: 3rem; display: flex; align-items: center; gap: 2rem; margin-bottom: 2rem; position: relative; overflow: hidden;}
                    .welcome-banner::before { content: ''; position: absolute; top: -50px; right: -50px; width: 250px; height: 250px; background: radial-gradient(circle, rgba(0, 176, 255, 0.1) 0%, transparent 70%); border-radius: 50%; z-index: 0; pointer-events: none;}
                    
                    .wb-avatar { width: 80px; height: 80px; border-radius: 50%; background: #00b0ff; color: black; display: flex; justify-content: center; align-items: center; font-size: 2.5rem; font-weight: bold; z-index: 1;}
                    .wb-info { z-index: 1; }
                    .wb-info h1 { margin: 0; font-size: 2.5rem; color: white; letter-spacing: -1px; }
                    .wb-info p { margin: 5px 0 0 0; color: #aaa; font-size: 1.1rem; }

                    .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;}
                    .qa-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; transition: all 0.2s; text-decoration: none; color: white; display: flex; flex-direction: column; gap: 10px;}
                    .qa-card:hover { transform: translateY(-5px); border-color: #00b0ff; background: rgba(0, 176, 255, 0.05);}
                    .qa-icon { font-size: 2rem; }
                    .qa-title { font-size: 1.2rem; font-weight: bold; margin: 0;}
                    .qa-desc { color: #888; font-size: 0.85rem; margin: 0;}

                    @media (max-width: 768px) {
                        .app-layout { flex-direction: column; }
                        .workspace { padding: 1rem; }
                        .welcome-banner { flex-direction: column; text-align: center; padding: 2rem; }
                    }
                </style>

                <div class="app-layout">
                    ${Sidebar.getHtml('/')}
                    
                    <main class="workspace">
                        <div class="welcome-banner">
                            <div class="wb-avatar">${initial}</div>
                            <div class="wb-info">
                                <h1>Hola de nuevo, ${userName}</h1>
                                <p>Conectado al Castell: <strong style="color: white;">${activeProject.nombre}</strong></p>
                            </div>
                        </div>

                        <h2 style="color: white; margin-bottom: 1.5rem; font-size: 1.2rem;">Accesos Rápidos</h2>
                        
                        <div class="quick-actions">
                            <a href="/v5/project" class="qa-card" data-link>
                                <div class="qa-icon">📋</div>
                                <div class="qa-title">Tracción (Kanban)</div>
                                <div class="qa-desc">Tienes ${inProgress} tareas en Deep Work y ${done} completadas.</div>
                            </a>
                            
                            <a href="/v5/map" class="qa-card" data-link>
                                <div class="qa-icon">🕸️</div>
                                <div class="qa-title">Diseñador VNA</div>
                                <div class="qa-desc">Ajusta el flujo de valor y los nodos organizativos.</div>
                            </a>
                            
                            <a href="/v5/focus" class="qa-card" data-link style="border-color: rgba(0, 230, 118, 0.3);">
                                <div class="qa-icon">⏱️</div>
                                <div class="qa-title">Entrar en Focus</div>
                                <div class="qa-desc" style="color: #00e676;">Activa el Pomodoro y reporta horas.</div>
                            </a>
                        </div>
                    </main>
                </div>
            `;
        }

        // -------------------------------------------------------------------
        // MODO 2: LANDING PAGE DE MARKETING (Para usuarios nuevos o desconectados)
        // -------------------------------------------------------------------
        return `
            <style>
                .landing-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 1.5rem 5%; background: rgba(10,10,12,0.8);
                    backdrop-filter: blur(20px); position: fixed; width: 100%; top: 0; left: 0; z-index: 100;
                    border-bottom: 1px solid rgba(255,255,255,0.05); font-family: 'Segoe UI', sans-serif;
                }
                .logo { font-size: 1.5rem; font-weight: 800; display: flex; align-items: center; gap: 10px; color: white; letter-spacing: -0.5px;}
                .logo span { color: #00b0ff; }
                
                .nav-links { display: flex; gap: 2rem; align-items: center; }
                .nav-links a { color: #888; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: color 0.2s; cursor: pointer; }
                .nav-links a:hover { color: white; }
                
                .hero {
                    min-height: 100vh; display: flex; flex-direction: column; justify-content: center;
                    align-items: center; text-align: center; padding: 120px 20px 60px 20px;
                    background: radial-gradient(circle at center top, rgba(0, 176, 255, 0.1) 0%, #0a0a0c 50%);
                    font-family: 'Segoe UI', sans-serif; position: relative; overflow: hidden;
                }
                
                .hero::before {
                    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0);
                    background-size: 40px 40px; pointer-events: none; z-index: 0;
                }

                .tagline {
                    background: rgba(0, 230, 118, 0.1); color: #00e676;
                    padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: bold;
                    border: 1px solid rgba(0, 230, 118, 0.3); margin-bottom: 1.5rem; z-index: 1; letter-spacing: 1px; text-transform: uppercase;
                }
                .hero h1 { font-size: 4.5rem; line-height: 1.1; margin-bottom: 1.5rem; max-width: 900px; color: white; z-index: 1; letter-spacing: -2px;}
                .hero h1 span { background: linear-gradient(45deg, #00b0ff, #e040fb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .hero p { font-size: 1.2rem; color: #888; max-width: 600px; margin-bottom: 3rem; z-index: 1; line-height: 1.6;}
                
                .cta-group { display: flex; gap: 1rem; z-index: 1; }
                .btn-primary { background: #00b0ff; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 10px 25px rgba(0, 176, 255, 0.3);}
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(0, 176, 255, 0.4); }
                .btn-secondary { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 1rem 2rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; text-decoration: none; transition: background 0.2s; }
                .btn-secondary:hover { background: rgba(255,255,255,0.1); }

                .features { padding: 5rem 5%; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; background: #0a0a0c; font-family: 'Segoe UI', sans-serif;}
                .feature-card { padding: 2.5rem; transition: transform 0.3s; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; background: rgba(255,255,255,0.02); }
                .feature-card:hover { transform: translateY(-10px); border-color: #00b0ff; background: rgba(255,255,255,0.03); }
                .feature-icon { font-size: 3rem; margin-bottom: 1.5rem; display: inline-block; padding: 15px; background: rgba(0,0,0,0.5); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);}
                .feature-card h3 { color: white; font-size: 1.4rem; margin-top: 0; margin-bottom: 10px;}
                .feature-card p { color: #888; line-height: 1.6; margin: 0; font-size: 0.95rem;}

                @media (max-width: 768px) {
                    .hero h1 { font-size: 3rem; }
                    .nav-links .hide-on-mobile { display: none; }
                    .cta-group { flex-direction: column; }
                }
            </style>

            <div class="view-container">
                <header class="landing-header">
                    <div class="logo">🗼 <span>TeamTowers</span></div>
                    <nav class="nav-links">
                        <div class="hide-on-mobile" style="display: flex; gap: 2rem;">
                            <a href="/v5/network" data-link>🌐 Explorar DAOs</a>
                            <a href="/v5/team" data-link>🔑 Iniciar Sesión</a>
                        </div>
                        <a href="/v5/create" class="btn btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.9rem;" data-link>Instanciar Red</a>
                    </nav>
                </header>

                <section class="hero">
                    <div class="tagline">Slicing Pie + VNA + Identidad Web3</div>
                    <h1>No uses software.<br>Construye tu <span>Exoesqueleto Cognitivo.</span></h1>
                    <p>El primer Sistema Operativo que conecta Ontologías de Diseño con Contabilidad de Triple Entrada. Convierte el Deep Work en Equidad Inmutable.</p>
                    
                    <div class="cta-group">
                        <a href="/v5/create" class="btn-primary" data-link>Instanciar Proyecto</a>
                        <a href="/v5/network" class="btn-secondary" data-link>Explorar el Ecosistema</a>
                    </div>
                </section>

                <section class="features" id="filosofia">
                    <div class="feature-card">
                        <div class="feature-icon">🕸️</div>
                        <h3>Value Network Analysis (VNA)</h3>
                        <p>Diseña el "Castell" (la estructura de tu equipo) mapeando flujos de valor tangibles e intangibles antes de ejecutar una sola línea de código.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">⏱️</div>
                        <h3>Deep Work Automático</h3>
                        <p>Haz "Pull" de las tareas del mercado teórico a tu estación Pomodoro. Protege tu atención y reporta horas exactas respaldadas por Proof of Work.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">⚖️</div>
                        <h3>Slicing Pie en Tiempo Real</h3>
                        <p>El fin de las discusiones por el capital. El Kernel traduce tu esfuerzo en Slices usando el valor justo de mercado y el riesgo asumido.</p>
                    </div>
                </section>
            </div>
        `;
    }

    executeViewScript() {
        if(Sidebar && Sidebar.initListeners) {
            Sidebar.initListeners(); // Activar Logout si estamos en el modo Command Center
        }
        console.log("🚀 HomeView Iniciado.");
    }
}
