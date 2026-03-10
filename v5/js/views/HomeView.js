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
        
        // Determinar qué proyectos mostrar (Todos si es root, o solo en los que está)
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );

        // -------------------------------------------------------------------
        // MODO 1: COMMAND CENTER (Dashboard Privado)
        // Se activa si el usuario ha interactuado o tiene un proyecto activo
        // -------------------------------------------------------------------
        if (activeUserId !== 'ecosystem-admin' && userProjects.length > 0) {
            const user = state.globalUsers.find(u => u.id === activeUserId);
            const userName = user ? user.name : "Comandante";
            const initial = userName.charAt(0).toUpperCase();
            
            const activeProject = userProjects[userProjects.length - 1]; // Tomamos el más reciente como contexto principal
            
            // Cálculos globales
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
                    .workspace { flex: 1; padding: 2rem 3rem; overflow-y: auto; display: flex; flex-direction: column; position: relative;}
                    
                    /* HERO SECTION PRIVADO */
                    .hero-banner { background: linear-gradient(135deg, rgba(0, 176, 255, 0.05) 0%, rgba(224, 64, 251, 0.05) 100%); border: 1px solid var(--glass-border); border-radius: var(--border-radius-lg); padding: 3rem; position: relative; overflow: hidden; margin-bottom: 2.5rem; display: flex; flex-direction: column; align-items: flex-start;}
                    .hero-banner::after { content: ''; position: absolute; right: -100px; top: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(0, 176, 255, 0.15) 0%, transparent 60%); border-radius: 50%; pointer-events: none;}
                    
                    .hero-title { font-size: 2.8rem; color: white; margin: 0 0 10px 0; letter-spacing: -1px; line-height: 1.1; z-index: 1;}
                    .hero-subtitle { color: var(--text-muted); font-size: 1.1rem; max-width: 600px; line-height: 1.5; margin-bottom: 2rem; z-index: 1;}
                    
                    .hero-actions { display: flex; gap: 15px; z-index: 1;}
                    .btn-main { background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple)); color: white; border: none; padding: 12px 25px; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; text-decoration: none;}
                    .btn-main:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 176, 255, 0.3); color: white;}
                    .btn-secondary { background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--glass-border); padding: 12px 25px; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: all 0.2s; text-decoration: none;}
                    .btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: #555;}

                    /* STATS GLOBALES */
                    .global-stats { display: flex; gap: 2rem; margin-bottom: 3rem; z-index: 1;}
                    .g-stat { display: flex; flex-direction: column; }
                    .g-stat-val { font-size: 2rem; font-weight: 900; font-family: var(--font-mono); color: white;}
                    .g-stat-lbl { font-size: 0.8rem; color: var(--accent-blue); text-transform: uppercase; letter-spacing: 1px; font-weight: bold;}

                    /* PILLARES SOS (INTEGRACIÓN) */
                    .pillars-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 3rem;}
                    .pillar-card { background: var(--bg-panel); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 1.5rem; transition: transform 0.2s; position: relative; overflow: hidden; text-decoration: none;}
                    .pillar-card:hover { transform: translateY(-5px); border-color: #444;}
                    .pillar-icon { font-size: 2rem; margin-bottom: 15px; display: inline-block;}
                    .pillar-title { color: white; font-weight: bold; font-size: 1.1rem; margin-bottom: 5px; font-family: var(--font-mono);}
                    .pillar-desc { color: #888; font-size: 0.85rem; line-height: 1.4; margin:0;}
                    
                    /* DECORADORES DE VALORES CASTELLERS */
                    .val-forca { border-top: 3px solid var(--accent-red); }
                    .val-equilibri { border-top: 3px solid var(--accent-blue); }
                    .val-valor { border-top: 3px solid var(--accent-green); }
                    .val-seny { border-top: 3px solid var(--accent-purple); }

                    /* COLLAS ACTIVAS */
                    .section-title { color: white; font-size: 1.3rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 10px;}
                    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;}
                    
                    .project-card { background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: var(--border-radius-md); padding: 1.5rem; display: flex; flex-direction: column; transition: all 0.2s; cursor: pointer; text-decoration: none;}
                    .project-card:hover { background: rgba(255,255,255,0.05); border-color: var(--accent-blue); }
                    .pc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;}
                    .pc-title { color: white; font-size: 1.2rem; font-weight: bold; margin: 0;}
                    .pc-badge { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); border: 1px solid rgba(0, 176, 255, 0.2); padding: 3px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; font-family: var(--font-mono);}
                    
                    .pc-stats { display: flex; gap: 15px; margin-bottom: 1.5rem; border-top: 1px dashed rgba(255,255,255,0.1); border-bottom: 1px dashed rgba(255,255,255,0.1); padding: 10px 0;}
                    .pc-stat { display: flex; flex-direction: column; gap: 2px;}
                    .pc-stat-val { color: white; font-weight: bold; font-family: var(--font-mono); font-size: 1.1rem;}
                    .pc-stat-lbl { color: #666; font-size: 0.7rem; text-transform: uppercase;}

                    .pc-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;}
                    .pc-role { color: var(--accent-green); font-weight: bold;}
                    .pc-enter { color: var(--text-muted); }
                    .project-card:hover .pc-enter { color: var(--accent-blue); }

                    @media (max-width: 1024px) { .pillars-grid { grid-template-columns: repeat(2, 1fr); } }
                    @media (max-width: 768px) { 
                        .app-layout { flex-direction: column; } 
                        .workspace { padding: 1.5rem; } 
                        .hero-title { font-size: 2rem; }
                        .pillars-grid { grid-template-columns: 1fr; }
                        .hero-actions { flex-direction: column; width: 100%;}
                        .hero-actions a { text-align: center; }
                        .global-stats { flex-direction: column; gap: 10px;}
                    }
                </style>

                <div class="app-layout">
                    ${Sidebar.getHtml('/')}
                    
                    <main class="workspace">
                        <div class="hero-banner">
                            <h1 class="hero-title">Hola de nuevo, ${userName}</h1>
                            <p class="hero-subtitle">Estás operando en el entorno seguro de TeamTowers. Diseña estructuras descentralizadas y convierte el esfuerzo de tu Colla en equidad inmutable.</p>
                            
                            <div class="global-stats">
                                <div class="g-stat">
                                    <span class="g-stat-val">${Math.round(totalSlices).toLocaleString()}</span>
                                    <span class="g-stat-lbl" style="color: var(--accent-green);">Slices Totales (Equity)</span>
                                </div>
                                <div class="g-stat">
                                    <span class="g-stat-val">${totalHours.toFixed(1)}h</span>
                                    <span class="g-stat-lbl">Horas Consolidadas</span>
                                </div>
                            </div>

                            <div class="hero-actions">
                                <a href="/v5/create" data-link class="btn-main">🏗️ Diseñar Organización</a>
                                <a href="/v5/profile" data-link class="btn-secondary">💎 Mi Identidad Fractal</a>
                            </div>
                        </div>

                        <h2 class="section-title">Pilares SOS (Accesos Rápidos)</h2>
                        <div class="pillars-grid">
                            <a href="/v5/project" data-link class="pillar-card val-forca">
                                <div class="pillar-icon">📋</div>
                                <div class="pillar-title">Força (Kanban)</div>
                                <div class="pillar-desc">Tracción fluida. Entra aquí para ejecutar transacciones (Pull) y enviar Pruebas de Trabajo.</div>
                            </a>
                            <a href="/v5/map" data-link class="pillar-card val-equilibri">
                                <div class="pillar-icon">🕸️</div>
                                <div class="pillar-title">Equilibri (VNA)</div>
                                <div class="pillar-desc">Diseño estructural. Todo esfuerzo debe nacer primero de un diseño estratégico.</div>
                            </a>
                            <a href="/v5/ledger" data-link class="pillar-card val-valor">
                                <div class="pillar-icon">⚖️</div>
                                <div class="pillar-title">Valor (Slicing Pie)</div>
                                <div class="pillar-desc">Auditoría. Verifica cómo el esfuerzo de la Colla se traduce matemáticamente en Equity.</div>
                            </a>
                            <a href="/v5/team" data-link class="pillar-card val-seny">
                                <div class="pillar-icon">🧠</div>
                                <div class="pillar-title">Seny (IA & Colla)</div>
                                <div class="pillar-desc">Soberanía de talento. Gestiona tu equipo y deja que el Orquestador cruce perfiles semánticos.</div>
                            </a>
                        </div>

                        <h2 class="section-title">
                            <span>Mis Collas (Ecosistemas Activos)</span>
                            <a href="/v5/network" data-link style="font-size: 0.85rem; color: var(--accent-blue); text-decoration: none; font-weight: normal;">Explorar Red Global &rarr;</a>
                        </h2>
                        
                        <div class="projects-grid" id="projectsContainer">
                            </div>
                    </main>
                </div>
            `;
        }

        // -------------------------------------------------------------------
        // MODO 2: LANDING PAGE (Soberanía Organizacional)
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
                .logo span { color: var(--accent-blue); }
                
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
                    background: rgba(0, 230, 118, 0.1); color: var(--accent-green);
                    padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.85rem; font-weight: bold;
                    border: 1px solid rgba(0, 230, 118, 0.3); margin-bottom: 1.5rem; z-index: 1; letter-spacing: 1px; text-transform: uppercase;
                }
                .hero h1 { font-size: 4.5rem; line-height: 1.1; margin-bottom: 1.5rem; max-width: 900px; color: white; z-index: 1; letter-spacing: -2px;}
                .hero h1 span { background: linear-gradient(45deg, var(--accent-blue), var(--accent-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .hero p { font-size: 1.2rem; color: #888; max-width: 600px; margin-bottom: 3rem; z-index: 1; line-height: 1.6;}
                
                .cta-group { display: flex; gap: 1rem; z-index: 1; }
                .btn-primary { background: var(--accent-blue); color: black; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 10px 25px rgba(0, 176, 255, 0.3);}
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 15px 35px rgba(0, 176, 255, 0.4); }
                .btn-secondary { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 1rem 2rem; border-radius: 8px; font-weight: bold; font-size: 1.1rem; text-decoration: none; transition: background 0.2s; }
                .btn-secondary:hover { background: rgba(255,255,255,0.1); }

                .features { padding: 5rem 5%; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; background: #0a0a0c; font-family: 'Segoe UI', sans-serif;}
                .feature-card { padding: 2.5rem; transition: transform 0.3s; border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; background: rgba(255,255,255,0.02); }
                .feature-card:hover { transform: translateY(-10px); border-color: var(--accent-blue); background: rgba(255,255,255,0.03); }
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
                        <a href="/v5/create" class="btn btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.9rem;" data-link>Diseñar Organización</a>
                    </nav>
                </header>

                <section class="hero">
                    <div class="tagline">Slicing Pie + VNA + Identidad Web3</div>
                    <h1>No uses software.<br>Construye tu <span>Exoesqueleto Cognitivo.</span></h1>
                    <p>El primer Sistema Operativo que conecta Ontologías de Diseño con Contabilidad de Triple Entrada. Convierte el Deep Work en Equidad Inmutable.</p>
                    
                    <div class="cta-group">
                        <a href="/v5/create" class="btn-primary" data-link>Diseñar Organización</a>
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
                        <div class="feature-icon">📋</div>
                        <h3>Tracción (Kanban)</h3>
                        <p>Un sistema de tracción puro. Haz "Pull" de las transacciones teóricas del diseño, ejecuta, y demuestra tu trabajo. Sin micro-management.</p>
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
            Sidebar.initListeners(); 
        }

        // Si estamos en el modo Dashboard, inyectamos la lógica de renderizado de las Collas
        const container = document.getElementById('projectsContainer');
        if (container) {
            const state = store.getState();
            const activeUserId = state.session.activeUserId;
            
            const userProjects = state.projects.filter(p => 
                state.session.role === 'ecosystem-owner' || 
                p.ownerId === activeUserId || 
                (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
            );

            let html = '';
            
            userProjects.forEach(p => {
                const isOwner = p.ownerId === activeUserId;
                const nodeCount = p.roles ? p.roles.filter(r=>!r.isArchived).length : 0;
                const txCount = p.transactions ? p.transactions.length : 0;
                const membersCount = p.usuarios ? p.usuarios.length : 1;

                let miSilla = 'Observador';
                if (isOwner) miSilla = 'Project Owner';
                else {
                    const misAsignaciones = (p.asignaciones || []).filter(a => a.userId === activeUserId);
                    if (misAsignaciones.length > 0) {
                        const rolObj = p.roles.find(r => r.id === misAsignaciones[0].roleId);
                        if (rolObj) miSilla = rolObj.name;
                    }
                }

                html += `
                    <div class="project-card" data-id="${p.id}">
                        <div class="pc-header">
                            <h3 class="pc-title">${p.nombre}</h3>
                            <span class="pc-badge">${p.archetype || 'Startup'}</span>
                        </div>
                        
                        <div class="pc-stats">
                            <div class="pc-stat">
                                <span class="pc-stat-val">${nodeCount}</span>
                                <span class="pc-stat-lbl">Nodos</span>
                            </div>
                            <div class="pc-stat">
                                <span class="pc-stat-val">${txCount}</span>
                                <span class="pc-stat-lbl">Flujos</span>
                            </div>
                            <div class="pc-stat">
                                <span class="pc-stat-val">${membersCount}</span>
                                <span class="pc-stat-lbl">Colla</span>
                            </div>
                        </div>
                        
                        <div class="pc-footer">
                            <div>Silla: <span class="pc-role">${miSilla}</span></div>
                            <div class="pc-enter">Entrar al Ecosistema &rarr;</div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            container.querySelectorAll('.project-card').forEach(card => {
                card.addEventListener('click', () => {
                    const pId = card.dataset.id;
                    const currentState = store.getState();
                    const pIndex = currentState.projects.findIndex(x => x.id === pId);
                    if (pIndex > -1) {
                        const pData = currentState.projects.splice(pIndex, 1)[0];
                        currentState.projects.push(pData);
                        store.state = currentState;
                        localStorage.setItem('tt_sos_state', JSON.stringify(currentState));
                    }
                    window.location.href = '/v5/project'; // Dirigir directo a la tracción (Kanban)
                });
            });
        }
    }
}
