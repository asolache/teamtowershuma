// v5/js/views/ProfileView.js
import { store } from '../core/store.js';
import { Sidebar } from '../components/Sidebar.js';
import { BottomNav } from '../components/BottomNav.js';
import { PageHeader } from '../components/PageHeader.js';

export default class ProfileView {
    constructor() {
        document.title = "Mi Perfil | TeamTowers SOS";
        this.currentTab = 'perfil'; 
        
        this.guardians = [
            { id: 'creator', label: '🎨 Creador (Innovación)' },
            { id: 'caregiver', label: '❤️ Cuidador (Soporte)' },
            { id: 'ruler', label: '👑 Gobernante (Estructura)' },
            { id: 'jester', label: '🃏 Bufón (Disrupción)' },
            { id: 'everyman', label: '🤝 Ciudadano (Realismo)' },
            { id: 'lover', label: '🔥 Amante (Pasión)' },
            { id: 'hero', label: '⚔️ Héroe (Ejecución)' },
            { id: 'outlaw', label: '🏴‍☠️ Rebelde (Cambio)' },
            { id: 'magician', label: '✨ Mago (Transformación)' },
            { id: 'innocent', label: '🕊️ Inocente (Ética)' },
            { id: 'explorer', label: '🧭 Explorador (Búsqueda)' },
            { id: 'sage', label: '🦉 Sabio (Verdad)' }
        ];

        this.levels = [
            { id: '@anxaneta', label: '👑 @anxaneta (Master/Visión)' },
            { id: '@aixecador', label: '🧭 @aixecador (Senior/Táctica)' },
            { id: '@dosos', label: '👁️ @dosos (Mid/Auditoría)' },
            { id: '@baixos', label: '⚙️ @baixos (Junior/Técnico)' },
            { id: '@pinya', label: '🤝 @pinya (Iniciado/Soporte)' }
        ];
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);

        const isOpen = user?.profile?.isOpenToWork || false;
        const statusBtnClass = isOpen ? 'btn-status-open' : 'btn-status-closed';
        const statusBtnText = isOpen ? '🟢 Abierto a Proyectos' : '🔴 Modo Oculto';

        const headerConfig = {
            title: "Identidad",
            subtitle: user?.name || 'Usuario',
            tagline: "Tu ADN Fractal y Reputación P2P (Open Badges).",
            actionHtml: `<button id="btnToggleAvailability" class="${statusBtnClass}">${statusBtnText}</button>`,
            tabs: [
                { id: 'perfil', label: '🧬 Identidad (Ikigai)', active: this.currentTab === 'perfil' },
                { id: 'skills', label: '🏅 Badges & Skills', active: this.currentTab === 'skills' },
                { id: 'proyectos', label: '🌐 Ecosistemas (Equity)', active: this.currentTab === 'proyectos' }
            ]
        };

        return `
            <style>
                /* ESTILOS EXCLUSIVOS DE PROFILE (EL RESTO VIENE DEL MASTER) */
                .workspace-profile { display: flex; flex-direction: column; flex: 1; overflow-y: auto; overflow-x: hidden; position: relative; width: 100%; box-sizing: border-box;}
                
                .tag-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
                .tag-checkbox { display: none; }
                .tag-label { background: rgba(255,255,255,0.03); border: 1px solid #333; padding: 12px 15px; border-radius: 10px; color: #aaa; font-size: 0.85rem; font-weight:bold; cursor: pointer; text-align: center; transition: all 0.2s; display: block;}
                .tag-checkbox:checked + .tag-label { background: rgba(0, 176, 255, 0.15); border-color: var(--accent-blue); color: white; box-shadow: 0 5px 15px rgba(0,176,255,0.2); transform: translateY(-2px);}
                
                .pm-ikigai { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid rgba(224, 64, 251, 0.3); border-radius: 16px; padding: 2rem; margin-top: 3rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5);}
                .pm-prompt-text { font-family: var(--font-mono); font-size: 0.95rem; color: #ccc; line-height: 1.6; background: rgba(0,0,0,0.6); padding: 20px; border-radius: 12px; border: 1px dashed #444; word-break: break-word;}

                .skill-card { background: rgba(25,25,30,0.8); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.5rem; transition: transform 0.3s;}
                .skill-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.2); box-shadow: 0 10px 20px rgba(0,0,0,0.5);}

                .project-row { background: rgba(255,255,255,0.02); display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.05); border-radius:16px; margin-bottom:15px;}
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/profile')}

                <main class="workspace workspace-profile">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-perfil" class="tab-content ${this.currentTab === 'perfil' ? 'active' : ''}">
                        <div class="form-group">
                            <label>1. Visión y Propósito</label>
                            <textarea id="inpVision" class="form-control" style="min-height:120px;" placeholder="¿Qué buscas aportar al ecosistema?"></textarea>
                        </div>

                        <div class="form-group">
                            <label>2. Afinidad Estructural</label>
                            <div class="tag-grid">
                                ${this.levels.map(l => `
                                    <div>
                                        <input type="checkbox" class="tag-checkbox" id="lvl_${l.id}" value="${l.id}">
                                        <label class="tag-label" for="lvl_${l.id}">${l.label}</label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <button class="btn-primary" id="btnSaveProfile" style="width:100%; margin-top:2rem;">💾 Guardar Identidad</button>

                        <div class="pm-ikigai">
                            <h3 style="color:var(--accent-purple); margin-top:0;">🧠 AI System Prompt (Ikigai)</h3>
                            <div class="pm-prompt-text" id="aiSystemPrompt">
                                Define tu identidad arriba para generar tu huella semántica.
                            </div>
                        </div>
                    </div>

                    <div id="view-skills" class="tab-content ${this.currentTab === 'skills' ? 'active' : ''}">
                        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;" id="skillsList">
                            </div>
                    </div>

                    <div id="view-proyectos" class="tab-content ${this.currentTab === 'proyectos' ? 'active' : ''}">
                        <div id="projectsList">
                            </div>
                    </div>

                </main>

                ${BottomNav.getHtml('/profile')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();

        const state = store.getState();
        const user = state.globalUsers.find(u => u.id === state.session.activeUserId);

        // LÓGICA DRY DE PESTAÑAS
        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            // No necesitamos re-renderizar todo el HTML, solo alternar clases si queremos, 
            // pero para esta vista que calcula stats, llamamos a renderizadores específicos:
            if (this.currentTab === 'proyectos') this.renderProjects(state);
            if (this.currentTab === 'skills') this.renderSkills(state);
        });

        if (user && user.profile) {
            document.getElementById('inpVision').value = user.profile.vision || '';
            (user.profile.structural_affinity || []).forEach(val => {
                const cb = document.getElementById(`lvl_${val}`);
                if(cb) cb.checked = true;
            });
            this.updatePromptDisplay(user.profile);
        }

        document.getElementById('btnSaveProfile')?.addEventListener('click', () => {
            const vision = document.getElementById('inpVision').value;
            const structural_affinity = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(el => el.value);
            
            store.dispatch({
                type: 'UPDATE_USER_PROFILE',
                payload: { userId: state.session.activeUserId, profile: { vision, structural_affinity } }
            }).then(() => alert("Identidad Fractal Actualizada."));
        });
    }

    updatePromptDisplay(profile) {
        const display = document.getElementById('aiSystemPrompt');
        if (display) {
            display.innerHTML = `Identidad detectada: <b>${profile.structural_affinity?.join(', ') || 'Sin definir'}</b>. <br>Visión: <i>"${profile.vision || 'No definida'}"</i>`;
        }
    }

    renderSkills(state) {
        const container = document.getElementById('skillsList');
        if (!container) return;
        container.innerHTML = `<div class="skill-card"><h3>Ingeniería de Valor</h3><p>Nivel detectado por PoW.</p></div>`;
    }

    renderProjects(state) {
        const container = document.getElementById('projectsList');
        if (!container) return;
        container.innerHTML = state.projects.map(p => `
            <div class="project-row">
                <span>${p.nombre}</span>
                <span style="color:var(--accent-green)">+${p.ledger?.length || 0} Bloques</span>
            </div>
        `).join('');
    }
}
