// v9/js/views/HomeView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';

export default class HomeView {
    constructor() {
        document.title = "Matriz Global | TeamTowers V9";
    }

    async getHtml() {
        await store.init();
        const state = store.getState();
        const isLogged = !!state.session.activeUserId;

        // ==============================================================
        // 🔒 ESTADO 1: NO LOGUEADO (TERMINAL ZERO-TRUST)
        // ==============================================================
        if (!isLogged) {
            return `
                <style>
                    .zero-trust-layout { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #050508; color: white; font-family: var(--font-mono); position:relative; overflow:hidden;}
                    .bg-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(0, 176, 255, 0.1) 0%, transparent 70%); z-index: 0; pointer-events: none; }
                    .login-terminal { background: rgba(10, 10, 15, 0.9); border: 1px solid rgba(0, 176, 255, 0.3); padding: 4rem 3rem; border-radius: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.8); width: 100%; max-width: 450px; text-align: center; animation: bootUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); z-index: 1; backdrop-filter: blur(10px);}
                    .login-input { background: #000; border: 1px solid #333; color: var(--accent-green); padding: 18px; font-size: 1.3rem; width: 100%; box-sizing: border-box; text-align: center; border-radius: 12px; margin: 25px 0; font-family: var(--font-mono); outline: none; transition: 0.3s; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);}
                    .login-input:focus { border-color: var(--accent-green); box-shadow: 0 0 20px rgba(0,230,118,0.2), inset 0 2px 10px rgba(0,0,0,0.5);}
                    .btn-login { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); color: white; font-weight: 900; font-family: var(--font-main); padding: 18px; border: none; border-radius: 12px; width: 100%; font-size: 1.2rem; text-transform: uppercase; cursor: pointer; transition: 0.3s; letter-spacing: 1px;}
                    .btn-login:hover { filter: brightness(1.2); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,176,255,0.4); }
                    @keyframes bootUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                </style>
                <div class="zero-trust-layout">
                    <div class="bg-glow"></div>
                    <div class="login-terminal">
                        <div style="font-size: 5rem; margin-bottom: 1.5rem; filter: drop-shadow(0 0 20px rgba(0,176,255,0.4));">🗼</div>
                        <h1 style="font-family: var(--font-main); margin: 0 0 10px 0; font-weight: 900; font-size: 2.2rem; letter-spacing: -1px;">TeamTowers</h1>
                        <p style="color: #666; font-size: 0.9rem; margin: 0; letter-spacing: 3px; font-weight: bold;">KERNEL V9 // ACCESO SEGURO</p>
                        <input type="text" id="loginUserId" class="login-input" placeholder="Alias de Nodo" value="@alvaro">
                        <button id="btnConnectNode" class="btn-login">Vincular Córtex</button>
                    </div>
                </div>
            `;
        }

        // ==============================================================
        // 🔓 ESTADO 2: LOGUEADO (MATRIZ FRACTAL)
        // ==============================================================
        const headerConfig = {
            title: "Matriz Global",
            subtitle: "Centro de Control",
            tagline: "Bienvenido, Master Architect. Los ecosistemas operan bajo parámetros nominales."
        };

        const projectsHtml = state.projects.map(p => {
            const hasActivity = p.work_orders?.some(w => w.status !== 'consolidated');
            return `
                <div class="ecosystem-card" data-id="${p.id}">
                    <div class="card-status ${hasActivity ? 'active' : ''}"></div>
                    <div class="card-icon">🏰</div>
                    <h3 class="card-title">${p.nombre}</h3>
                    <div class="card-meta">
                        <div class="meta-item"><span>🪑</span> ${(p.roles || []).length} Roles</div>
                        <div class="meta-item"><span>🛤️</span> ${(p.vna_flows || []).length} Flujos</div>
                    </div>
                    <div class="card-action">Entrar al Ecosistema &rarr;</div>
                </div>
            `;
        }).join('');

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-home { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box; background: radial-gradient(circle at top right, rgba(0,230,118,0.02) 0%, transparent 40%);}
                
                /* HERO SECTION */
                .hero-guide { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 4rem; margin-top: 1rem;}
                .welcome-panel { display: flex; flex-direction: column; justify-content: center; }
                .welcome-panel h2 { font-size: 2.5rem; color: white; margin: 0 0 1rem 0; font-weight: 900; letter-spacing: -1px; }
                .welcome-panel p { color: #aaa; font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; max-width: 500px; }

                /* STEP GUIDES */
                .guide-steps { display: grid; gap: 15px; }
                .step-card { background: rgba(255,255,255,0.02); border: 1px solid #222; padding: 1.5rem; border-radius: 16px; display: flex; gap: 20px; align-items: center; transition: 0.3s; border-left: 4px solid #333;}
                .step-card:hover { border-left-color: var(--accent-blue); background: rgba(255,255,255,0.04); transform: translateX(10px); }
                .step-num { font-size: 1.5rem; font-weight: 900; color: #444; font-family: var(--font-mono); }
                .step-card:hover .step-num { color: var(--accent-blue); }
                .step-info h4 { margin: 0 0 5px 0; color: white; font-size: 1rem; }
                .step-info p { margin: 0; color: #777; font-size: 0.85rem; }

                /* ECOSYSTEM GRID */
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; border-bottom: 1px solid #222; padding-bottom: 1rem; }
                .section-header h3 { color: white; margin: 0; text-transform: uppercase; letter-spacing: 2px; font-size: 0.9rem; font-weight: bold; }
                
                .eco-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
                
                .ecosystem-card { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid #333; padding: 2.5rem 2rem; border-radius: 24px; position: relative; transition: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); cursor: pointer; overflow: hidden;}
                .ecosystem-card:hover { border-color: var(--accent-blue); transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
                
                .card-status { position: absolute; top: 20px; right: 20px; width: 10px; height: 10px; border-radius: 50%; background: #444; }
                .card-status.active { background: var(--accent-green); box-shadow: 0 0 10px var(--accent-green); }
                
                .card-icon { font-size: 2.5rem; margin-bottom: 20px; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.5)); }
                .card-title { color: white; font-size: 1.4rem; font-weight: 900; margin: 0 0 15px 0; }
                
                .card-meta { display: flex; gap: 20px; margin-bottom: 25px; }
                .meta-item { color: #888; font-size: 0.85rem; font-weight: bold; display: flex; align-items: center; gap: 8px; }
                .meta-item span { font-size: 1.1rem; }
                
                .card-action { color: var(--accent-blue); font-weight: 900; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; transition: 0.3s; }
                .ecosystem-card:hover .card-action { letter-spacing: 2px; }

                .eco-create { border: 2px dashed #333; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; border-radius: 24px; cursor: pointer; transition: 0.3s; color: #555; text-decoration: none; min-height: 250px;}
                .eco-create:hover { border-color: var(--accent-green); color: var(--accent-green); background: rgba(0,230,118,0.02); }
                .eco-create .plus-icon { font-size: 3rem; margin-bottom: 10px; }

                @media (max-width: 1024px) { .hero-guide { grid-template-columns: 1fr; } }
                @media (max-width: 768px) { .workspace-home { padding: 90px 1rem 120px 1rem; } }
            </style>
            <div class="app-layout">
                ${Sidebar.getHtml('/')}
                <main class="workspace-home">
                    ${PageHeader.getHtml(headerConfig)}
                    
                    <section class="hero-guide">
                        <div class="welcome-panel">
                            <h2>Domina la Matriz de Sinergias</h2>
                            <p>Bienvenido a TeamTowers V9. El sistema operativo fractal diseñado para orquestar humanos e IAs mediante flujos de valor inmutables.</p>
                            <div style="display:flex; gap:15px;">
                                <a href="/v9/create" data-link class="btn-primary" style="text-decoration:none; padding: 12px 25px;">⚡ Forjar Ecosistema</a>
                                <a href="/v9/lms" data-link class="btn-outline" style="text-decoration:none; padding: 12px 25px; border: 1px solid #444; color:#888;">🧠 Consultar Córtex</a>
                            </div>
                        </div>
                        <div class="guide-steps">
                            <div class="step-card">
                                <div class="step-num">01</div>
                                <div class="step-info">
                                    <h4>Instanciar Red</h4>
                                    <p>Define el arquetipo y usa a @genesi_ai para mapear el flujo VNA.</p>
                                </div>
                            </div>
                            <div class="step-card">
                                <div class="step-num">02</div>
                                <div class="step-info">
                                    <h4>Vincular Nodos</h4>
                                    <p>Asigna el talento adecuado a las sillas estructurales del Castell.</p>
                                </div>
                            </div>
                            <div class="step-card">
                                <div class="step-num">03</div>
                                <div class="step-info">
                                    <h4>Minar Valor</h4>
                                    <p>Ejecuta SOPs y audita SOCs para generar equidad en el Ledger.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="section-header">
                        <h3>Tus Ecosistemas en Ejecución</h3>
                        <div style="color: #444; font-size: 0.8rem; font-weight: bold;">${state.projects.length} REDES DETECTADAS</div>
                    </section>

                    <div class="eco-grid">
                        ${projectsHtml}
                        <a href="/v9/create" data-link class="eco-create">
                            <span class="plus-icon">➕</span>
                            <strong>Forjar Nueva Topología</strong>
                        </a>
                    </div>
                </main>
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        
        // Lógica Zero-Trust
        if (!state.session.activeUserId) {
            const btnConnect = document.getElementById('btnConnectNode');
            const inputId = document.getElementById('loginUserId');
            
            if (btnConnect && inputId) {
                btnConnect.addEventListener('click', async () => {
                    let id = inputId.value.trim();
                    if (!id) return alert("Identificación requerida.");
                    if (!id.startsWith('@')) id = '@' + id; 
                    
                    await store.dispatch({ type: 'LOGIN_USER', payload: { userId: id } });
                    window.location.replace('/v9/'); 
                });
            }
            return; 
        }

        // Lógica Dashboard
        Sidebar.initListeners();
        PageHeader.execute();

        document.querySelectorAll('.ecosystem-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const projId = e.currentTarget.getAttribute('data-id');
                localStorage.setItem('tt_active_project', projId);
                history.pushState(null, null, '/v9/dashboard');
                window.dispatchEvent(new Event('popstate'));
            });
        });
    }
}
