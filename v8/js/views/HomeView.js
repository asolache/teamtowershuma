// v8/js/views/HomeView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class HomeView {
    constructor() {
        document.title = "Centro de Mando | SOS V8";
        this.currentTab = 'redes'; 
    }

    async getHtml() {
        const state = store.getState();
        if (!state.session.activeUserId || state.session.role === 'guest') {
            return this.getLandingHtml();
        }

        const config = state.config;

        const headerConfig = {
            title: config.ecosystemName || "Agentic Network",
            subtitle: "V8 CORE",
            tagline: "Panel de control P2P. Supervisa el flujo de valor entre humanos e IA.",
            tabs: [
                { id: 'redes', label: '🪐 Nodos y Redes', active: this.currentTab === 'redes' },
                { id: 'agentes', label: '🤖 Enjambre IA', active: this.currentTab === 'agentes' }
            ]
        };

        // LÓGICA DE ONBOARDING (Comprobar API Keys)
        const savedProvider = localStorage.getItem('tt_ai_provider') || 'deepseek';
        let apiKey = '';
        if (savedProvider === 'deepseek') apiKey = localStorage.getItem('tt_key_deepseek') || '';
        if (savedProvider === 'openai') apiKey = localStorage.getItem('tt_key_openai') || '';
        if (savedProvider === 'gemini') apiKey = localStorage.getItem('tt_key_gemini') || '';
        
        const hasKey = apiKey.length > 5;
        let onboardingHtml = '';

        if (!hasKey) {
            onboardingHtml = `
                <div style="background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 176, 255, 0.05)); border: 1px dashed var(--accent-purple); padding: 2rem; border-radius: 20px; margin-bottom: 2.5rem; display: flex; flex-direction: column; gap: 15px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                    <div style="display:flex; align-items:center; gap: 15px;">
                        <span style="font-size:2.5rem; filter: drop-shadow(0 0 10px rgba(224, 64, 251, 0.5));">🤖</span>
                        <div>
                            <h3 style="margin:0; color:white; font-size:1.3rem;">¡Bienvenido, Master Architect!</h3>
                            <p style="margin:5px 0 0 0; color:#ccc; font-size:0.95rem; line-height:1.5;">Soy @genesi_ai. Para que el Enjambre pueda orquestar redes, generar código y redactar pactos Slicing Pie, necesitamos conexión a la Matrix.</p>
                        </div>
                    </div>
                    <div style="display:flex; gap:15px; margin-top:10px;">
                        <a href="/v8/settings" data-link style="background:var(--accent-purple); color:white; padding:10px 20px; border-radius:10px; font-weight:bold; text-decoration:none; font-size:0.9rem; transition:0.2s;">🔑 Configurar API Key (LLM)</a>
                        <a href="/v8/help" data-link style="background:transparent; border:1px solid #555; color:white; padding:10px 20px; border-radius:10px; font-weight:bold; text-decoration:none; font-size:0.9rem;">Leer Documentación</a>
                    </div>
                </div>
            `;
        }

        // AGENTES DESDE EL PADRÓN GLOBAL
        const aiAgents = state.globalUsers.filter(u => u.globalRole === 'ai-agent');

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; scroll-behavior: smooth; width: 100%;}
                
                .tab-content { display: none; animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); padding-bottom: 5rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }

                .glass-panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 20px; backdrop-filter: blur(15px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5); box-sizing: border-box;}

                .btn-primary { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 900; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,176,255,0.2); font-size: 0.95rem; text-decoration:none;}
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(224,64,251,0.4); filter: brightness(1.1);}

                .agent-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(224, 64, 251, 0.3); border-radius: 16px; padding: 20px; display: flex; justify-content: space-between; align-items: center; transition:0.3s; margin-bottom:15px;}
                .agent-card:hover { border-color: var(--accent-purple); transform: translateX(5px); background: rgba(224, 64, 251, 0.05);}
                .agent-info { flex: 1; }
                .agent-name { font-weight: 900; color: white; font-size: 1.15rem; display: flex; align-items: center; gap: 8px; margin-bottom: 5px;}
                .agent-id { color: var(--accent-purple); font-family: var(--font-mono); font-size: 0.85rem; font-weight:bold;}
                .agent-vision { color: #aaa; font-size: 0.9rem; line-height: 1.5; margin-top: 8px; font-style:italic;}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .workspace { padding: 90px 1rem 120px 1rem; }
                    .agent-card { flex-direction: column; align-items: flex-start; gap: 15px; }
                    .agent-card > div:last-child { width: 100%; text-align: left !important; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/')}
                
                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-redes" class="tab-content ${this.currentTab === 'redes' ? 'active' : ''}">
                        
                        ${onboardingHtml}

                        <div class="glass-panel" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2.5rem; margin-bottom: 2rem; flex-wrap:wrap; gap:15px;">
                            <div>
                                <h2 style="margin:0; font-size:1.2rem; color:white;">Redes Activas</h2>
                                <p style="color:var(--text-muted); margin:0; font-size:0.9rem;">Ecosistemas bajo tu gobernanza.</p>
                            </div>
                            <a href="/v8/create" data-link class="btn-primary">➕ Inicializar Red</a>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;">
                            ${state.projects.map(p => `
                                <div class="glass-panel" style="padding: 2rem; cursor: pointer; transition: 0.3s;" onclick="localStorage.setItem('tt_active_project', '${p.id}'); window.location.href='/v8/dashboard'">
                                    <h3 style="margin: 0 0 10px 0; font-size: 1.4rem; color: white;">${p.nombre}</h3>
                                    <div style="color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 1.5rem; text-transform:uppercase;">${p.archetype || 'Startup'}</div>
                                    
                                    <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:0.85rem; color:#aaa;">
                                        <span>Nodos: <b style="color:white;">${(p.usuarios||[]).length}</b></span>
                                        <span>Tubos VNA: <b style="color:white;">${(p.vna_flows||[]).length}</b></span>
                                    </div>

                                    <div style="border-top: 1px dashed var(--glass-border); padding-top: 15px; display: flex; justify-content: space-between; font-weight: bold; color: var(--accent-green);">
                                        <span>ENTRAR AL RADAR</span>
                                        <span>→</span>
                                    </div>
                                </div>
                            `).join('') || '<div style="color:var(--text-muted); grid-column: 1/-1; text-align:center; padding:3rem; border:1px dashed #333; border-radius:16px;">No hay redes inicializadas. Crea tu primer Castell.</div>'}
                        </div>
                    </div>

                    <div id="view-agentes" class="tab-content ${this.currentTab === 'agentes' ? 'active' : ''}">
                        <div class="glass-panel" style="padding: 3rem;">
                            <h2 style="color: var(--accent-purple); margin-top:0; font-size:1.8rem; letter-spacing:-1px;">Enjambre IA Desplegado</h2>
                            <p style="color: #aaa; margin-bottom: 2rem; font-size:1.05rem;">Estos son los Agentes Nativos del Ecosistema. Reclútalos en tus redes desde el menú "La Colla" para delegar Work Orders.</p>
                            
                            <div style="display: flex; flex-direction: column;">
                                ${aiAgents.length > 0 ? aiAgents.map(a => `
                                    <div class="agent-card">
                                        <div class="agent-info">
                                            <div class="agent-name">
                                                <span style="color: var(--accent-green); font-size: 0.6rem; text-shadow:0 0 10px var(--accent-green);">🟢 (ONLINE)</span> 
                                                ${a.name}
                                            </div>
                                            <div class="agent-id">${a.id}</div>
                                            <div class="agent-vision">"${a.profile?.vision || 'Operador de IA'}"</div>
                                        </div>
                                        <div style="text-align: right; font-family: var(--font-mono); color: #888; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 10px; border: 1px solid #333;">
                                            <div style="font-size:0.7rem; text-transform:uppercase; margin-bottom:4px;">Afinidad Base:</div>
                                            <span style="color:white; font-weight:bold;">${(a.profile?.structural_affinity || ['@baixos'])[0]}</span>
                                            <div style="margin-top:8px; border-top:1px dashed #444; padding-top:8px;">
                                                Coste API: <span style="color:var(--accent-green); font-weight:bold;">€${a.profile?.apiCostPerHour || 0.15}/h</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('') : '<div style="color:#666;">No hay agentes registrados en la matriz V8. Inicializa el Kernel.</div>'}
                            </div>
                        </div>
                    </div>
                </main>
                
                ${BottomNav.getHtml('/')}
            </div>
        `;
    }

    getLandingHtml() {
        return `
            <div class="app-layout" style="justify-content: center; align-items: center; background: radial-gradient(circle at center, #111116 0%, #050505 100%);">
                <div style="text-align: center;">
                    <img src="/v8/logoteamtowers.png" alt="TeamTowers" style="max-height: 80px; margin-bottom: 2rem; filter: drop-shadow(0 0 20px rgba(255,255,255,0.2));" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div style="display:none; font-size: 5rem; margin-bottom: 1rem; filter: drop-shadow(0 0 20px rgba(0,176,255,0.5));">🗼</div>
                    
                    <h1 style="font-size: 3.5rem; color: white; letter-spacing: -1px; margin-bottom: 0.5rem; font-weight:900;">TeamTowers <span style="color: var(--accent-blue);">V8</span></h1>
                    <p style="color: var(--text-muted); margin-bottom: 3rem; font-family: var(--font-mono); font-size:1.1rem;">Swarm Operating System (LMS & P2P)</p>
                    
                    <button class="btn-primary" onclick="location.reload()" style="margin: 0 auto; padding: 0 40px; height: 55px; font-size:1.1rem; box-shadow: 0 10px 30px rgba(0,176,255,0.3);">CONECTAR NODO AL KERNEL</button>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        if (!store.getState().session.activeUserId || store.getState().session.role === 'guest') return;

        Sidebar.initListeners();
        PageHeader.execute();

        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`view-${this.currentTab}`);
            if(target) target.classList.add('active');
        });
    }
}
