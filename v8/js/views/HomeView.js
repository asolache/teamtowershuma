// v8/js/views/HomeView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';

export default class HomeView {
    constructor() {
        document.title = "Matriz Global | TeamTowers V15";
    }

    async getHtml() {
        const state = store.getState();
        const isLogged = !!state.session.activeUserId;

        // ==============================================================
        // 🔒 ESTADO 1: NO LOGUEADO (PANTALLA ZERO-TRUST)
        // ==============================================================
        if (!isLogged) {
            return `
                <style>
                    .zero-trust-layout { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #050508; color: white; font-family: var(--font-mono); }
                    .login-terminal { background: rgba(0, 176, 255, 0.05); border: 1px solid var(--accent-blue); padding: 3rem; border-radius: 16px; box-shadow: 0 0 40px rgba(0, 176, 255, 0.1); width: 100%; max-width: 400px; text-align: center; animation: bootUp 0.5s ease-out;}
                    .login-input { background: #000; border: 1px solid #333; color: var(--accent-green); padding: 15px; font-size: 1.2rem; width: 100%; box-sizing: border-box; text-align: center; border-radius: 8px; margin: 20px 0; font-family: var(--font-mono); outline: none; transition: 0.3s;}
                    .login-input:focus { border-color: var(--accent-green); box-shadow: inset 0 0 10px rgba(0,230,118,0.2);}
                    .btn-login { background: var(--accent-blue); color: black; font-weight: 900; font-family: var(--font-main); padding: 15px; border: none; border-radius: 8px; width: 100%; font-size: 1.1rem; text-transform: uppercase; cursor: pointer; transition: 0.3s;}
                    .btn-login:hover { filter: brightness(1.2); box-shadow: 0 0 20px rgba(0,176,255,0.4); transform: translateY(-2px);}
                    @keyframes bootUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                </style>
                <div class="zero-trust-layout">
                    <div class="login-terminal">
                        <div style="font-size: 4rem; margin-bottom: 1rem; filter: drop-shadow(0 0 10px rgba(0,176,255,0.5));">🗼</div>
                        <h1 style="font-family: var(--font-main); margin: 0 0 5px 0; font-weight: 900; font-size: 1.8rem;">TeamTowers</h1>
                        <p style="color: #888; font-size: 0.85rem; margin: 0; letter-spacing: 2px;">KERNEL V15.5 // ZERO-TRUST</p>
                        
                        <input type="text" id="loginUserId" class="login-input" placeholder="Alias (ej: @alvaro)" value="@alvaro">
                        
                        <button id="btnConnectNode" class="btn-login">Conectar Nodo</button>
                    </div>
                </div>
            `;
        }

        // ==============================================================
        // 🔓 ESTADO 2: LOGUEADO (MATRIZ DE ECOSISTEMAS)
        // ==============================================================
        const headerConfig = {
            title: "Matriz Global",
            subtitle: "Ecosistemas",
            tagline: "Sistemas operativos fractales en ejecución."
        };

        const projectsHtml = state.projects.map(p => `
            <div style="background: rgba(255,255,255,0.02); border: 1px solid #333; padding: 2rem; border-radius: 16px; transition: 0.3s; cursor: pointer;" class="ecosystem-card" data-id="${p.id}">
                <div style="font-size: 2rem; margin-bottom: 15px;">🏰</div>
                <h3 style="color: white; margin: 0 0 10px 0; font-size: 1.2rem;">${p.nombre}</h3>
                <div style="color: #888; font-size: 0.85rem; display: flex; gap: 10px; margin-bottom: 15px;">
                    <span>👥 ${(p.roles || []).length} Roles</span>
                    <span>🛤️ ${(p.vna_flows || []).length} Tuberías</span>
                </div>
                <button style="background: rgba(0,176,255,0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 8px 15px; border-radius: 8px; width: 100%; font-weight: bold; cursor: pointer;">Entrar al Castell</button>
            </div>
        `).join('');

        return `
            <style>
                .app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .workspace-home { flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; scroll-behavior: smooth; box-sizing: border-box;}
                .eco-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 2rem;}
                .ecosystem-card:hover { border-color: var(--accent-blue); background: rgba(0,176,255,0.05); transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,176,255,0.1);}
                .eco-create { border: 1px dashed #555; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; border-radius: 16px; cursor: pointer; transition: 0.3s; color: #888; text-decoration: none;}
                .eco-create:hover { border-color: white; color: white; background: rgba(255,255,255,0.05);}
            </style>
            <div class="app-layout">
                ${Sidebar.getHtml('/')}
                <main class="workspace-home">
                    ${PageHeader.getHtml(headerConfig)}
                    
                    <div class="eco-grid">
                        ${projectsHtml}
                        <a href="/v8/create" data-link class="eco-create">
                            <span style="font-size: 2rem; margin-bottom: 10px;">+</span>
                            <strong>Forjar Nuevo Ecosistema</strong>
                        </a>
                    </div>
                </main>
                ${BottomNav.getHtml('/')}
            </div>
        `;
    }

    executeViewScript() {
        const state = store.getState();
        
        // Lógica si NO estamos logueados (Zero-Trust)
        if (!state.session.activeUserId) {
            const btnConnect = document.getElementById('btnConnectNode');
            const inputId = document.getElementById('loginUserId');
            
            if (btnConnect && inputId) {
                btnConnect.addEventListener('click', async () => {
                    const id = inputId.value.trim();
                    if (!id) return alert("Identificación requerida.");
                    
                    // Conectamos y forzamos recarga dura para montar toda la UI
                    await store.dispatch({ type: 'LOGIN_USER', payload: { userId: id } });
                    window.location.replace('/v8/'); 
                });
            }
            return; // Detenemos la ejecución para que no busque Sidebar ni Headers
        }

        // Lógica si ESTAMOS logueados
        Sidebar.initListeners();
        PageHeader.execute();

        document.querySelectorAll('.ecosystem-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const projId = e.currentTarget.getAttribute('data-id');
                localStorage.setItem('tt_active_project', projId);
                // Redirigir al Dashboard del proyecto usando el router de la SPA
                history.pushState(null, null, '/v8/dashboard');
                window.dispatchEvent(new Event('popstate'));
            });
        });
    }
}
