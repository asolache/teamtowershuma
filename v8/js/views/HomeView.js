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
        const totalAgents = state.agents ? state.agents.length : 0;

        const headerConfig = {
            title: config.ecosystemName || "Agentic Network",
            subtitle: "V8 CORE",
            tagline: "Panel de control P2P. Supervisa el flujo de valor entre humanos e IA.",
            tabs: [
                { id: 'redes', label: '🪐 Nodos y Redes', active: this.currentTab === 'redes' },
                { id: 'agentes', label: '🤖 Enjambre IA', active: this.currentTab === 'agentes' }
            ]
        };

        return `
            <div class="app-layout">
                ${Sidebar.getHtml('/')}
                
                <main class="workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-redes" class="tab-content ${this.currentTab === 'redes' ? 'active' : ''}">
                        <div class="glass-panel" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2.5rem;">
                            <div>
                                <h2 style="margin:0; font-size:1.2rem; color:white;">Redes Activas</h2>
                                <p style="color:var(--text-muted); margin:0; font-size:0.9rem;">Ecosistemas bajo tu gobernanza.</p>
                            </div>
                            <button class="btn-primary" onclick="alert('Creador de Redes V8: En desarrollo (Sprint 3)')">➕ Inicializar Red</button>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem;">
                            ${state.projects.map(p => `
                                <div class="glass-panel" style="padding: 2rem; cursor: pointer; transition: 0.3s;" onclick="localStorage.setItem('tt_active_project', '${p.id}'); window.location.href='/v8/dashboard'">
                                    <h3 style="margin: 0 0 10px 0; font-size: 1.4rem; color: white;">${p.nombre}</h3>
                                    <div style="color: var(--accent-blue); font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 1.5rem;">${p.id}</div>
                                    <div style="border-top: 1px dashed var(--glass-border); padding-top: 15px; display: flex; justify-content: space-between; font-weight: bold; color: var(--accent-green);">
                                        <span>ENTRAR AL RADAR</span>
                                        <span>→</span>
                                    </div>
                                </div>
                            `).join('') || '<div style="color:var(--text-muted); grid-column: 1/-1;">No hay redes inicializadas.</div>'}
                        </div>
                    </div>

                    <div id="view-agentes" class="tab-content ${this.currentTab === 'agentes' ? 'active' : ''}">
                        <div class="glass-panel">
                            <h2 style="color: var(--accent-purple);">Enjambre IA Desplegado</h2>
                            <p style="color: #aaa; margin-bottom: 2rem;">Los siguientes agentes están operando de forma autónoma en el background, esperando tus Work Orders en el Kanban.</p>
                            
                            <div style="display: flex; flex-direction: column; gap: 15px;">
                                ${state.agents ? state.agents.map(a => `
                                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); border-radius: 12px; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <div style="font-weight: 900; color: white; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                                                <span style="color: var(--accent-green); font-size: 0.6rem;">🟢 (ONLINE)</span> ${a.id}
                                            </div>
                                            <div style="color: var(--accent-purple); font-family: var(--font-mono); font-size: 0.8rem; margin-top: 5px;">Rol: ${a.role}</div>
                                        </div>
                                        <div style="text-align: right; font-family: var(--font-mono); color: #888;">
                                            FMV: ${a.fmv}€/h
                                        </div>
                                    </div>
                                `).join('') : '<p>No hay agentes registrados en la matriz V8.</p>'}
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
            <div class="app-layout" style="justify-content: center; align-items: center;">
                <div style="text-align: center;">
                    <div style="font-size: 5rem; margin-bottom: 1rem; filter: drop-shadow(0 0 20px rgba(0,176,255,0.5));">🗼</div>
                    <h1 style="font-size: 3rem; color: white; letter-spacing: -1px; margin-bottom: 0.5rem;">TeamTowers <span style="color: var(--accent-blue);">V8</span></h1>
                    <p style="color: var(--text-muted); margin-bottom: 2rem; font-family: var(--font-mono);">Agentic Operating System</p>
                    <button class="btn-primary" onclick="location.reload()" style="margin: 0 auto; padding: 0 40px; height: 50px;">INICIAR SESIÓN (MOCK)</button>
                </div>
            </div>
        `;
    }

    executeViewScript() {
        if (!store.getState().session.activeUserId) return;

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
