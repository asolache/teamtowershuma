// v8/js/views/ProfileView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';

export default class ProfileView {
    constructor() {
        document.title = "Mi Perfil | TeamTowers V9";
        this.currentTab = 'identity'; // 'identity' o 'talent'
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);

        if (!user) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/profile')}
                    <main class="workspace" style="display:flex; justify-content:center; align-items:center;">
                        <h2 style="color:white;">Usuario no encontrado en la Matriz.</h2>
                    </main>
                </div>
            `;
        }

        const headerConfig = {
            title: "Identidad & Talento",
            subtitle: user.id,
            tagline: "Gestiona tus coordenadas en la Matriz y tu historial criptográfico de Soulbound Tokens.",
            tabs: [
                { id: 'identity', label: '⚙️ Identidad Criptográfica', active: this.currentTab === 'identity' },
                { id: 'talent', label: '🏅 Árbol de Talento (SBT)', active: this.currentTab === 'talent' }
            ],
            actionHtml: `<div class="status-badge" style="background: rgba(0, 176, 255, 0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">${user.globalRole === 'ecosystem-owner' ? '👑 Master Architect' : '👤 Ciudadano'}</div>`
        };

        // --- PROCESAMIENTO PESTAÑA TALENTO (SBT) ---
        const skillXP = {};
        let totalHours = 0;

        if (user.profile && user.profile.sbt_skills) {
            user.profile.sbt_skills.forEach(record => {
                totalHours += record.exp;
                state.projects.forEach(p => {
                    const flow = p.vna_flows?.find(f => f.id === record.flowId);
                    if (flow && flow.required_skills) {
                        flow.required_skills.forEach(skillId => {
                            if (!skillXP[skillId]) skillXP[skillId] = 0;
                            skillXP[skillId] += record.exp; 
                        });
                    }
                });
            });
        }

        await KB.init();
        const allNodes = await KB.getAllNodes();

        const skillBadges = Object.keys(skillXP).map(skillId => {
            const xp = skillXP[skillId];
            const meme = allNodes.find(m => m.id === skillId) || { title: skillId, category: 'unknown' };
            
            let level = 'Bronce 🥉';
            let nextMilestone = 40;
            let progress = (xp / 40) * 100;
            let color = '#cd7f32';

            if (xp >= 40 && xp < 100) {
                level = 'Plata 🥈';
                nextMilestone = 100;
                progress = ((xp - 40) / 60) * 100;
                color = '#c0c0c0';
            } else if (xp >= 100) {
                level = 'Oro 🥇';
                nextMilestone = xp; 
                progress = 100;
                color = '#ffd700';
            }
            return { ...meme, xp, level, progress, nextMilestone, color };
        }).sort((a, b) => b.xp - a.xp);

        // --- RENDERIZADO BÁSICO ---
        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .profile-workspace { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; }
                
                .tab-content { display: none; animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); padding-bottom: 5rem; width: 100%; box-sizing: border-box;}
                .tab-content.active { display: block; }

                .glass-panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 24px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 15px 40px rgba(0,0,0,0.5); backdrop-filter: blur(15px);}
                
                .profile-header { display: flex; align-items: center; gap: 30px; margin-bottom: 2rem;}
                .avatar-circle { width: 120px; height: 120px; border-radius: 50%; background: #050508; border: 3px solid var(--accent-purple); display: flex; justify-content: center; align-items: center; font-size: 4rem; box-shadow: 0 0 30px rgba(224,64,251,0.3);}
                .profile-info h1 { margin: 0; font-size: 2.5rem; color: white; letter-spacing: -1px; font-weight: 900;}
                .profile-info p { margin: 5px 0 0 0; color: var(--text-muted); font-family: var(--font-mono); font-size: 1.1rem;}
                
                /* Estilos Pestaña 1: Identity Form */
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; font-size: 0.85rem; color: #aaa; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;}
                .tt-input { width: 100%; background: rgba(0,0,0,0.4); border: 1px solid #333; color: white; padding: 14px; border-radius: 12px; font-family: var(--font-main); font-size: 1rem; outline: none; transition: 0.3s; box-sizing: border-box;}
                .tt-input:focus { border-color: var(--accent-purple); background: rgba(0,0,0,0.6);}
                .tt-input:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .btn-save { background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple)); border: none; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(0,176,255,0.2);}
                .btn-save:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(224,64,251,0.4);}

                /* Estilos Pestaña 2: Talent SBT */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 2rem;}
                .stat-box { background: rgba(0,0,0,0.4); border: 1px solid #333; padding: 20px; border-radius: 16px; text-align: center;}
                .stat-value { font-size: 2.5rem; font-weight: 900; color: white; font-family: var(--font-mono); line-height: 1;}
                .stat-label { font-size: 0.8rem; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; margin-top: 10px;}
                .stat-value.highlight { color: var(--accent-green); text-shadow: 0 0 15px rgba(0,230,118,0.3); }

                .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;}
                .skill-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; transition: 0.3s; position: relative; overflow: hidden;}
                .skill-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04);}
                .skill-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;}
                .skill-title { color: white; font-weight: 900; font-size: 1.1rem; line-height: 1.3;}
                .skill-category { font-size: 0.7rem; color: #888; text-transform: uppercase; font-family: var(--font-mono); margin-bottom: 5px; display: block;}
                .skill-badge { font-weight: 900; font-size: 0.85rem; padding: 4px 10px; border-radius: 8px; border: 1px solid; white-space: nowrap;}
                .progress-bg { width: 100%; height: 8px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden; margin-bottom: 8px; border: 1px solid #333;}
                .progress-fill { height: 100%; border-radius: 4px; transition: width 1s ease-out;}
                .progress-text { display: flex; justify-content: space-between; font-size: 0.75rem; color: #aaa; font-family: var(--font-mono);}

                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .profile-workspace { padding: 80px 1rem 2rem 1rem; }
                    .profile-header { flex-direction: column; text-align: center; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/profile')}
                
                <main class="profile-workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div id="view-identity" class="tab-content ${this.currentTab === 'identity' ? 'active' : ''}">
                        <div class="glass-panel">
                            <h2 style="color:white; margin-top:0;">Configuración de Identidad</h2>
                            <p style="color:#aaa; font-size:0.9rem; margin-bottom:2rem;">Actualiza tus datos para el Padrón Global. Tu ID principal no puede ser modificado una vez forjado.</p>
                            
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                                <div class="form-group">
                                    <label>Alias / ID de Matriz</label>
                                    <input type="text" class="tt-input" value="${user.id}" disabled title="El ID principal es inmutable.">
                                </div>
                                <div class="form-group">
                                    <label>Nombre Público</label>
                                    <input type="text" id="inpProfileName" class="tt-input" value="${user.name || ''}" placeholder="Ej. Alvaro Architect">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Dirección Wallet (MetaMask / Web3)</label>
                                <input type="text" id="inpProfileWallet" class="tt-input" value="${user.walletOrSocial || ''}" placeholder="0x..." style="font-family: var(--font-mono);">
                            </div>

                            <div class="form-group">
                                <label>Correo Electrónico de Respaldo</label>
                                <input type="email" id="inpProfileEmail" class="tt-input" value="${user.email || ''}" placeholder="usuario@dominio.com">
                            </div>

                            <div class="form-group" style="margin-top: 2rem;">
                                <label>Ikigai (Declaración de Visión)</label>
                                <textarea id="inpProfileVision" class="tt-input" rows="3" placeholder="¿Qué aportas al ecosistema?">${user.profile?.vision || ''}</textarea>
                            </div>

                            <div style="margin-top: 2rem; display: flex; justify-content: flex-end;">
                                <button id="btnSaveProfile" class="btn-save">💾 Guardar Cambios</button>
                            </div>
                        </div>
                    </div>

                    <div id="view-talent" class="tab-content ${this.currentTab === 'talent' ? 'active' : ''}">
                        <div class="glass-panel">
                            <div class="profile-header">
                                <div class="avatar-circle">🥷</div>
                                <div class="profile-info">
                                    <h1>${user.name}</h1>
                                    <p>${user.id} | ${user.walletOrSocial || 'Wallet No Vinculada'}</p>
                                </div>
                            </div>
                            
                            <div class="stats-grid">
                                <div class="stat-box">
                                    <div class="stat-value highlight">${totalHours}h</div>
                                    <div class="stat-label">PoW (Proof of Work)</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-value" style="color:var(--accent-blue);">${skillBadges.length}</div>
                                    <div class="stat-label">Skills Desbloqueados</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-value" style="color:var(--accent-purple);">${state.projects.filter(p => p.ownerId === user.id || p.usuarios?.find(u=>u.id===user.id)).length}</div>
                                    <div class="stat-label">Ecosistemas Activos</div>
                                </div>
                            </div>
                        </div>

                        <div class="glass-panel" style="border-top: 4px solid var(--accent-orange);">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <h2 style="color: white; margin:0; font-size:1.5rem;">Árbol de Talento (W3C)</h2>
                                <span style="font-size:0.8rem; color:#888;">Validado por @notari_ledger</span>
                            </div>
                            
                            ${skillBadges.length === 0 ? `
                                <div style="text-align:center; padding: 3rem; color: #666; font-style:italic; background: rgba(0,0,0,0.3); border-radius: 16px; border: 1px dashed #333; margin-top: 2rem;">
                                    <span>🌱</span><br><br>
                                    Aún no has validado SOCs en el ecosistema.<br> Completa Work Orders en el Hiperpaper para ganar experiencia y forjar tus primeros Soulbound Tokens.
                                </div>
                            ` : `
                                <div class="skills-grid">
                                    ${skillBadges.map(skill => `
                                        <div class="skill-card">
                                            <div class="skill-header">
                                                <div>
                                                    <span class="skill-category">${(skill.category || 'skill').replace('root_', '')}</span>
                                                    <div class="skill-title">${skill.title}</div>
                                                </div>
                                                <div class="skill-badge" style="color: ${skill.color}; border-color: ${skill.color}; background: ${skill.color}15;">
                                                    ${skill.level}
                                                </div>
                                            </div>
                                            <div style="margin-top: 20px;">
                                                <div class="progress-bg">
                                                    <div class="progress-fill" style="width: ${Math.min(skill.progress, 100)}%; background: ${skill.color}; box-shadow: 0 0 10px ${skill.color}80;"></div>
                                                </div>
                                                <div class="progress-text">
                                                    <span>${skill.xp}h validadas</span>
                                                    <span>Siguiente Hito: ${skill.nextMilestone}h</span>
                                                </div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
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

        // 1. Lógica de Pestañas
        window.addEventListener('ph-tab-changed', (e) => {
            this.currentTab = e.detail.tabId;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById(`view-${this.currentTab}`);
            if(target) target.classList.add('active');
        });

        // 2. Lógica de Guardado de Identidad
        const btnSave = document.getElementById('btnSaveProfile');
        if (btnSave) {
            btnSave.addEventListener('click', async () => {
                const newName = document.getElementById('inpProfileName').value.trim();
                const newWallet = document.getElementById('inpProfileWallet').value.trim();
                const newEmail = document.getElementById('inpProfileEmail').value.trim();
                const newVision = document.getElementById('inpProfileVision').value.trim();

                const state = store.getState();
                const userIndex = state.globalUsers.findIndex(u => u.id === state.session.activeUserId);
                
                if (userIndex !== -1) {
                    // Actualizamos directamente en el estado y disparamos un guardado falso para que el Store lo pille
                    state.globalUsers[userIndex].name = newName;
                    state.globalUsers[userIndex].walletOrSocial = newWallet;
                    state.globalUsers[userIndex].email = newEmail;
                    
                    if (!state.globalUsers[userIndex].profile) state.globalUsers[userIndex].profile = {};
                    state.globalUsers[userIndex].profile.vision = newVision;

                    // Despachamos una acción vacía solo para forzar el guardado y la recarga de listeners
                    await store.dispatch({ type: 'UPDATE_PROFILE_DUMMY' });
                    
                    btnSave.innerText = "✅ Guardado";
                    btnSave.style.background = "var(--accent-green)";
                    setTimeout(() => {
                        btnSave.innerText = "💾 Guardar Cambios";
                        btnSave.style.background = "";
                        window.location.reload(); // Recarga para aplicar nombre en Sidebar/Header
                    }, 1000);
                }
            });
        }
    }
}// v8/js/views/ProfileView.js
import { store } from '../core/store.js';
import { KB } from '../core/kb.js';
import { Sidebar } from '../components/Sidebar.js';
import { PageHeader } from '../components/PageHeader.js';
import { BottomNav } from '../components/BottomNav.js';

export default class ProfileView {
    constructor() {
        document.title = "Mi Perfil | TeamTowers V9";
    }

    async getHtml() {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);

        if (!user) {
            return `
                <div class="app-layout">
                    ${Sidebar.getHtml('/profile')}
                    <main class="workspace" style="display:flex; justify-content:center; align-items:center;">
                        <h2 style="color:white;">Usuario no encontrado en la Matriz.</h2>
                    </main>
                </div>
            `;
        }

        const headerConfig = {
            title: "Identidad & Talento",
            subtitle: user.id,
            tagline: "Tu Soulbound Token (SBT). El historial criptográfico de tu experiencia en el ecosistema.",
            actionHtml: `<div class="status-badge" style="background: rgba(0, 176, 255, 0.1); border: 1px solid var(--accent-blue); color: var(--accent-blue); padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">${user.globalRole === 'ecosystem-owner' ? '👑 Master Architect' : '👤 Ciudadano'}</div>`
        };

        // Procesamiento de Experiencia (XP) SBT
        // user.profile.sbt_skills tiene formato: { flowId: '...', exp: 8, date: ... }
        const skillXP = {};
        let totalHours = 0;

        if (user.profile && user.profile.sbt_skills) {
            user.profile.sbt_skills.forEach(record => {
                totalHours += record.exp;
                
                // Buscamos el flow en todos los proyectos para saber qué skills requería
                state.projects.forEach(p => {
                    const flow = p.vna_flows?.find(f => f.id === record.flowId);
                    if (flow && flow.required_skills) {
                        flow.required_skills.forEach(skillId => {
                            if (!skillXP[skillId]) skillXP[skillId] = 0;
                            // Se suma la experiencia a cada skill validado en el SOP
                            skillXP[skillId] += record.exp; 
                        });
                    }
                });
            });
        }

        // Cargamos la base de datos semántica para saber los nombres de los Skills
        await KB.init();
        const allNodes = await KB.getAllNodes();

        // Mapeo con el Catálogo W3C para obtener nombres y calcular medallas
        const skillBadges = Object.keys(skillXP).map(skillId => {
            const xp = skillXP[skillId];
            const meme = allNodes.find(m => m.id === skillId) || { title: skillId, category: 'unknown' };
            
            let level = 'Bronce 🥉';
            let nextMilestone = 40;
            let progress = (xp / 40) * 100;
            let color = '#cd7f32'; // Bronze

            if (xp >= 40 && xp < 100) {
                level = 'Plata 🥈';
                nextMilestone = 100;
                progress = ((xp - 40) / 60) * 100;
                color = '#c0c0c0'; // Silver
            } else if (xp >= 100) {
                level = 'Oro 🥇';
                nextMilestone = xp; // Maxed out
                progress = 100;
                color = '#ffd700'; // Gold
            }

            return { ...meme, xp, level, progress, nextMilestone, color };
        }).sort((a, b) => b.xp - a.xp); // Ordenar por más experiencia primero

        return `
            <style>
                .app-layout { display: flex; height: 100vh; height: 100dvh; overflow: hidden; background: var(--bg-dark); font-family: var(--font-main); width: 100%;}
                .profile-workspace { display: block; flex: 1; padding: 2rem 3rem; overflow-y: auto; overflow-x: hidden; height: 100%; box-sizing: border-box; }
                
                .glass-panel { background: linear-gradient(145deg, rgba(20,20,25,0.8), rgba(10,10,15,0.9)); border: 1px solid var(--glass-border); border-radius: 24px; padding: 2.5rem; margin-bottom: 2rem; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 15px 40px rgba(0,0,0,0.5); backdrop-filter: blur(15px);}
                
                .profile-header { display: flex; align-items: center; gap: 30px; margin-bottom: 2rem;}
                .avatar-circle { width: 120px; height: 120px; border-radius: 50%; background: #050508; border: 3px solid var(--accent-purple); display: flex; justify-content: center; align-items: center; font-size: 4rem; box-shadow: 0 0 30px rgba(224,64,251,0.3);}
                .profile-info h1 { margin: 0; font-size: 2.5rem; color: white; letter-spacing: -1px; font-weight: 900;}
                .profile-info p { margin: 5px 0 0 0; color: var(--text-muted); font-family: var(--font-mono); font-size: 1.1rem;}
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 2rem;}
                .stat-box { background: rgba(0,0,0,0.4); border: 1px solid #333; padding: 20px; border-radius: 16px; text-align: center;}
                .stat-value { font-size: 2.5rem; font-weight: 900; color: white; font-family: var(--font-mono); line-height: 1;}
                .stat-label { font-size: 0.8rem; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; margin-top: 10px;}
                .stat-value.highlight { color: var(--accent-green); text-shadow: 0 0 15px rgba(0,230,118,0.3); }

                .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;}
                .skill-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 16px; transition: 0.3s; position: relative; overflow: hidden;}
                .skill-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04);}
                
                .skill-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;}
                .skill-title { color: white; font-weight: 900; font-size: 1.1rem; line-height: 1.3;}
                .skill-category { font-size: 0.7rem; color: #888; text-transform: uppercase; font-family: var(--font-mono); margin-bottom: 5px; display: block;}
                .skill-badge { font-weight: 900; font-size: 0.85rem; padding: 4px 10px; border-radius: 8px; border: 1px solid; white-space: nowrap;}
                
                .progress-bg { width: 100%; height: 8px; background: rgba(0,0,0,0.5); border-radius: 4px; overflow: hidden; margin-bottom: 8px; border: 1px solid #333;}
                .progress-fill { height: 100%; border-radius: 4px; transition: width 1s ease-out;}
                .progress-text { display: flex; justify-content: space-between; font-size: 0.75rem; color: #aaa; font-family: var(--font-mono);}

                @media (max-width: 768px) {
                    .profile-workspace { padding: 80px 1rem 2rem 1rem; }
                    .profile-header { flex-direction: column; text-align: center; }
                }
            </style>

            <div class="app-layout">
                ${Sidebar.getHtml('/profile')}
                
                <main class="profile-workspace">
                    ${PageHeader.getHtml(headerConfig)}

                    <div class="glass-panel">
                        <div class="profile-header">
                            <div class="avatar-circle">🥷</div>
                            <div class="profile-info">
                                <h1>${user.name}</h1>
                                <p>${user.id} | ${user.walletOrSocial || 'Wallet No Vinculada'}</p>
                            </div>
                        </div>
                        
                        <div class="stats-grid">
                            <div class="stat-box">
                                <div class="stat-value highlight">${totalHours}h</div>
                                <div class="stat-label">PoW (Proof of Work)</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-value" style="color:var(--accent-blue);">${skillBadges.length}</div>
                                <div class="stat-label">Skills Desbloqueados</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-value" style="color:var(--accent-purple);">${state.projects.filter(p => p.ownerId === user.id || p.usuarios?.find(u=>u.id===user.id)).length}</div>
                                <div class="stat-label">Ecosistemas Activos</div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-panel" style="border-top: 4px solid var(--accent-orange);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h2 style="color: white; margin:0; font-size:1.5rem;">Árbol de Talento (W3C)</h2>
                            <span style="font-size:0.8rem; color:#888;">Validado por @notari_ledger</span>
                        </div>
                        
                        ${skillBadges.length === 0 ? `
                            <div style="text-align:center; padding: 3rem; color: #666; font-style:italic; background: rgba(0,0,0,0.3); border-radius: 16px; border: 1px dashed #333; margin-top: 2rem;">
                                <span>🌱</span><br><br>
                                Aún no has validado SOCs en el ecosistema.<br> Completa Work Orders en el Hiperpaper para ganar experiencia y forjar tus primeros Soulbound Tokens.
                            </div>
                        ` : `
                            <div class="skills-grid">
                                ${skillBadges.map(skill => `
                                    <div class="skill-card">
                                        <div class="skill-header">
                                            <div>
                                                <span class="skill-category">${(skill.category || 'skill').replace('root_', '')}</span>
                                                <div class="skill-title">${skill.title}</div>
                                            </div>
                                            <div class="skill-badge" style="color: ${skill.color}; border-color: ${skill.color}; background: ${skill.color}15;">
                                                ${skill.level}
                                            </div>
                                        </div>
                                        <div style="margin-top: 20px;">
                                            <div class="progress-bg">
                                                <div class="progress-fill" style="width: ${Math.min(skill.progress, 100)}%; background: ${skill.color}; box-shadow: 0 0 10px ${skill.color}80;"></div>
                                            </div>
                                            <div class="progress-text">
                                                <span>${skill.xp}h validadas</span>
                                                <span>Siguiente Hito: ${skill.nextMilestone}h</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </main>
                ${BottomNav.getHtml('/profile')}
            </div>
        `;
    }

    executeViewScript() {
        Sidebar.initListeners();
        PageHeader.execute();
    }
}
