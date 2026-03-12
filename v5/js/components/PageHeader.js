// v5/js/components/PageHeader.js
import { store } from '../core/store.js';

export const PageHeader = {
    getHtml: (config) => {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);
        
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );
        
        let activeProjectId = localStorage.getItem('tt_active_project') || (userProjects.length > 0 ? userProjects[userProjects.length - 1].id : null);

        let tabsHtml = '';
        if (config.tabs && config.tabs.length > 0) {
            tabsHtml = `
                <div class="ph-tabs-container" id="phTabsContainer">
                    ${config.tabs.map(t => `
                        <button class="ph-tab-btn ${t.active ? 'active' : ''}" data-tab="${t.id}">
                            ${t.label} ${t.badge ? `<span class="ph-tab-badge" id="badge-${t.id}">${t.badge}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        // LÓGICA DE ALERTA POMODORO (Global para móviles)
        const isPomodoroActive = localStorage.getItem('tt_active_pomodoro_tx');
        const pomodoroAlertHtml = isPomodoroActive 
            ? `<a href="/v5/focus" data-link class="ph-pomodoro-alert" title="Volver al Focus">🍅</a>` 
            : '';

        return `
            <style>
                /* REUSABLE PAGE HEADER STYLES */
                .ph-mobile-top-bar { 
                    display: none; 
                    justify-content: space-between; 
                    align-items: center; 
                    padding: 10px 15px; 
                    background: rgba(10, 10, 14, 0.85); 
                    border-bottom: 1px solid rgba(255,255,255,0.05); 
                    backdrop-filter: blur(15px); 
                    -webkit-backdrop-filter: blur(15px);
                    position: fixed; 
                    top: 0; 
                    left: 0; 
                    width: 100%; 
                    z-index: 1000; 
                    box-sizing: border-box; 
                    gap: 10px;
                }
                
                /* BRAND LOGO MOBILE (MANDALA FIX) */
                .ph-mob-brand { 
                    display: flex; 
                    align-items: center; 
                    justify-content: flex-start; 
                    text-decoration: none; 
                    height: 32px; 
                    flex-shrink: 0;
                }
                .ph-mob-brand img { 
                    height: 100%; 
                    width: auto; 
                    object-fit: contain; 
                    filter: brightness(0) invert(1); 
                    opacity: 0.9; 
                    transform-origin: left center; 
                }

                /* LUXURY MOBILE DROPDOWN */
                .ph-mob-controls-right {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 8px;
                    flex: 1;
                    min-width: 0; /* Permite que los hijos encojan */
                }

                .ph-mob-project-select { 
                    appearance: none;
                    background-color: rgba(255, 255, 255, 0.05);
                    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300b0ff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
                    background-repeat: no-repeat;
                    background-position: right 10px top 50%;
                    background-size: 8px auto;
                    border: 1px solid rgba(0, 176, 255, 0.3); 
                    color: var(--accent-blue); 
                    padding: 6px 25px 6px 12px; 
                    border-radius: 20px; 
                    font-family: var(--font-mono); 
                    font-size: 0.75rem; 
                    font-weight: bold;
                    outline: none; 
                    max-width: 140px; 
                    text-overflow: ellipsis; 
                    white-space: nowrap; 
                    overflow: hidden; 
                    transition: all 0.2s;
                    flex-shrink: 1;
                }
                .ph-mob-project-select:focus {
                    border-color: var(--accent-blue);
                    box-shadow: 0 0 10px rgba(0, 176, 255, 0.2);
                    background-color: rgba(0, 176, 255, 0.05);
                }

                .ph-mob-user { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    width: 32px; 
                    height: 32px; 
                    background: linear-gradient(135deg, var(--accent-purple), #7c4dff); 
                    color: white; 
                    border-radius: 50%; 
                    font-weight: 800; 
                    text-decoration: none; 
                    font-size: 0.9rem; 
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(224, 64, 251, 0.4);
                }

                /* POMODORO ALERT ANIMATION */
                .ph-pomodoro-alert { 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 1.1rem; 
                    text-decoration: none; 
                    animation: pulseTomato 1s infinite alternate; 
                    filter: drop-shadow(0 0 8px rgba(255, 82, 82, 0.8));
                    flex-shrink: 0;
                }
                @keyframes pulseTomato { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }

                .ph-view-header { margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;}
                .ph-view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;}
                .ph-view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }
                .ph-header-subtitle { color: var(--accent-blue); font-weight: 600; font-family: inherit;}

                .ph-tabs-container { display: flex; background: rgba(0,0,0,0.5); padding: 6px; border-radius: 12px; border: 1px solid var(--glass-border); gap: 5px; margin-bottom: 2rem; overflow-x: auto; white-space: nowrap; scrollbar-width: none; flex-shrink: 0;}
                .ph-tabs-container::-webkit-scrollbar { display: none; }
                .ph-tab-btn { flex: 1; min-width: max-content; padding: 12px 20px; background: transparent; border: none; border-radius: 8px; color: var(--text-muted); font-size: 0.95rem; font-weight: bold; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .ph-tab-btn:hover { color: white; background: rgba(255,255,255,0.03); }
                .ph-tab-btn.active { background: rgba(255,255,255,0.08); color: white; box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.3); }
                .ph-tab-badge { background: rgba(255,255,255,0.1); color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; font-family: var(--font-mono); }
                .ph-tab-btn.active .ph-tab-badge { background: rgba(0, 176, 255, 0.2); color: var(--accent-blue); }

                @media (max-width: 768px) {
                    .ph-mobile-top-bar { display: flex; }
                    .ph-view-header { flex-direction: column; align-items: flex-start; gap: 10px;}
                    .ph-view-header h1 { font-size: 1.8rem; }
                    .ph-header-actions { width: 100%; display: flex; flex-direction: column;}
                    
                    .ph-tabs-container { width: 100%; }
                    .ph-tab-btn { flex: 1; text-align: center; padding: 10px 5px; font-size: 0.85rem;}
                }
            </style>

            <header class="ph-mobile-top-bar">
                <a href="/v5/" data-link class="ph-mob-brand">
                    <img src="/v5/logoteamtowers.png" alt="TeamTowers">
                </a>
                
                <div class="ph-mob-controls-right">
                    ${pomodoroAlertHtml}
                    <select class="ph-mob-project-select" id="phMobProjectSelect" title="Cambiar Red">
                        ${userProjects.map(p => `<option value="${p.id}" ${p.id === activeProjectId ? 'selected' : ''}>${p.nombre}</option>`).join('')}
                    </select>
                    <a href="/v5/profile" data-link class="ph-mob-user" title="Mi Perfil">
                        ${user?.name.charAt(0).toUpperCase() || '?'}
                    </a>
                </div>
            </header>

            <div class="ph-view-header">
                <div>
                    <h1>${config.title} ${config.subtitle ? `<span class="ph-header-subtitle">${config.subtitle}</span>` : ''}</h1>
                    ${config.tagline ? `<p>${config.tagline}</p>` : ''}
                </div>
                <div class="ph-header-actions">
                    ${config.actionHtml || ''}
                </div>
            </div>

            ${tabsHtml}
        `;
    },

    execute: () => {
        const mobSelect = document.getElementById('phMobProjectSelect');
        if (mobSelect) {
            mobSelect.addEventListener('change', (e) => {
                localStorage.setItem('tt_active_project', e.target.value);
                window.location.reload(); 
            });
        }
    }
};
