// v7/js/components/PageHeader.js
import { store } from '../core/store.js';

export const PageHeader = {
    getHtml: (config) => {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);
        const currentPath = window.location.pathname;
        
        const userProjects = state.projects.filter(p => 
            state.session.role === 'ecosystem-owner' || 
            p.ownerId === activeUserId || 
            (p.usuarios && p.usuarios.find(u => u.id === activeUserId))
        );
        
        let activeProjectId = localStorage.getItem('tt_active_project');

        const getArchIcon = (arch) => {
            const icons = { 'startup': '🚀', 'dao': '🤖', 'corp': '🏢', 'corporate': '🏢', 'incubator': '🏭', 'sos': '🆘' };
            return icons[arch] || '🪐';
        };

        const enrichedProjects = userProjects.map(p => {
            const activity = (p.vna_flows?.length || 0) + (p.work_orders?.length || 0) + (p.ledger?.length || 0);
            const tsMatch = p.id.match(/\d+/);
            const timestamp = tsMatch ? parseInt(tsMatch[0]) : 0;
            return { ...p, activity, timestamp, icon: getArchIcon(p.archetype) };
        });

        enrichedProjects.sort((a, b) => b.timestamp - a.timestamp);
        const activeProjects = [...enrichedProjects].filter(p => p.activity > 0).sort((a, b) => b.activity - a.activity).slice(0, 3);
        const activeIds = activeProjects.map(p => p.id);
        const recentProjects = enrichedProjects.filter(p => !activeIds.includes(p.id));

        if (!activeProjectId && enrichedProjects.length > 0) {
            activeProjectId = activeProjects.length > 0 ? activeProjects[0].id : recentProjects[0].id;
        }

        let projectOptionsHtml = '';
        if (activeProjects.length > 0) {
            projectOptionsHtml += `<optgroup label="🔥 MÁS ACTIVAS">`;
            activeProjects.forEach(p => {
                projectOptionsHtml += `<option value="${p.id}" ${p.id === activeProjectId ? 'selected' : ''}>${p.icon} ${p.nombre.toUpperCase()} (${p.activity})</option>`;
            });
            projectOptionsHtml += `</optgroup>`;
        }
        if (recentProjects.length > 0) {
            projectOptionsHtml += `<optgroup label="🆕 RECIENTES / OTRAS">`;
            recentProjects.forEach(p => {
                projectOptionsHtml += `<option value="${p.id}" ${p.id === activeProjectId ? 'selected' : ''}>${p.icon} ${p.nombre.toUpperCase()}</option>`;
            });
            projectOptionsHtml += `</optgroup>`;
        }

        const showAuxLinks = currentPath.endsWith('/v7/') || currentPath.endsWith('/') || !config.tabs;
        const auxLinksHtml = showAuxLinks ? `
            <nav class="ph-utility-nav">
                <a href="/v7/manifesto" data-link class="ph-utility-link">📖 CODEX</a>
                <a href="/v7/help" data-link class="ph-utility-link">❓ AYUDA</a>
            </nav>
        ` : '';

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

        const isPomodoroActive = localStorage.getItem('tt_active_pomodoro_tx');
        const pomodoroAlertHtml = isPomodoroActive 
            ? `<a href="/v7/focus" data-link class="ph-pomodoro-alert" title="Volver al Focus">🍅</a>` 
            : '';

        return `
            <style>
                .ph-global-top-bar { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    padding: 12px 20px; 
                    margin-bottom: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.05); 
                    gap: 15px;
                    background: rgba(10, 10, 15, 0.2);
                }

                .ph-utility-nav { display: flex; gap: 20px; align-items: center; }
                .ph-utility-link { 
                    font-size: 0.65rem; 
                    color: var(--text-muted); 
                    text-decoration: none; 
                    font-weight: 800; 
                    letter-spacing: 1.5px; 
                    transition: all 0.2s ease;
                    padding: 4px 0;
                    border-bottom: 1px solid transparent;
                }
                .ph-utility-link:hover { color: var(--accent-blue); border-bottom-color: var(--accent-blue); }

                .ph-mob-brand { display: none; align-items: center; height: 32px; text-decoration:none; }
                .ph-mob-brand img { height: 100%; width: auto; filter: brightness(0) invert(1); }

                .ph-mob-controls-right { display: flex; align-items: center; justify-content: flex-end; gap: 15px; flex: 1; }

                .ph-mob-project-select { 
                    appearance: none;
                    background: rgba(0, 0, 0, 0.4) no-repeat right 12px top 50% / 10px auto;
                    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2300b0ff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
                    border: 1px solid rgba(0, 176, 255, 0.2); 
                    color: var(--accent-blue); 
                    padding: 8px 35px 8px 15px; 
                    border-radius: 8px; font-family: var(--font-mono); font-size: 0.8rem; font-weight: bold;
                    outline: none; max-width: 220px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; cursor: pointer;
                    transition: all 0.3s ease;
                }
                .ph-mob-project-select:hover { border-color: var(--accent-blue); background-color: rgba(0, 176, 255, 0.05); }

                /* BLINDAJE DEL AVATAR */
                .ph-mob-user { 
                    display: flex; align-items: center; justify-content: center; 
                    width: 35px; height: 35px; background: linear-gradient(135deg, var(--accent-purple), #7c4dff); 
                    color: white; border-radius: 50%; font-weight: 900; text-decoration: none; font-size: 0.9rem; 
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: 0.3s;
                    flex-shrink: 0; /* Previene que el avatar se deforme o aplaste */
                }
                .ph-mob-user:hover { transform: scale(1.05); }
                
                .ph-pomodoro-alert { animation: pulseTomato 1s infinite alternate; filter: drop-shadow(0 0 8px rgba(255, 82, 82, 0.8)); font-size: 1.2rem; cursor: pointer; text-decoration: none;}
                @keyframes pulseTomato { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }

                .ph-view-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; gap: 15px;}
                .ph-view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1.5px; font-weight: 900;}
                .ph-view-header p { color: var(--text-muted); font-size: 1rem; margin-top: 8px; line-height: 1.4; }
                .ph-header-subtitle { color: var(--accent-blue); font-weight: 600; }

                .ph-tabs-container { display: flex; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 12px; border: 1px solid var(--glass-border); gap: 5px; margin-bottom: 2rem; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none;}
                .ph-tabs-container::-webkit-scrollbar { display: none; }
                .ph-tab-btn { flex: 1; padding: 10px 20px; background: transparent; border: none; border-radius: 8px; color: var(--text-muted); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
                .ph-tab-btn.active { background: rgba(255,255,255,0.08); color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }

                /* BLINDAJE MÓVIL */
                @media (max-width: 768px) {
                    .ph-global-top-bar { 
                        position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; 
                        background: rgba(10, 10, 14, 0.95); backdrop-filter: blur(15px); 
                        padding: 10px 15px; box-sizing: border-box; 
                    }
                    .ph-mob-brand { display: flex; }
                    .ph-utility-nav { display: none !important; }
                    
                    /* EL FIX MÁGICO: Empujar el contenido hacia abajo para que la barra flotante no lo tape */
                    .ph-view-header { margin-top: 75px !important; flex-direction: column; align-items: flex-start; }
                    .ph-view-header h1 { font-size: 1.7rem; }
                    .ph-mob-project-select { max-width: 140px; font-size: 0.75rem; padding-right:25px;}
                    
                    /* TABS MOBILE FIX */
                    .ph-tabs-container { justify-content: flex-start; }
                    .ph-tab-btn { flex: 0 0 auto; }
                }
            </style>

            <header class="ph-global-top-bar">
                <a href="/v7/" data-link class="ph-mob-brand">
                    <span style="font-size: 1.5rem; filter: drop-shadow(0 0 10px rgba(0,176,255,0.5));">🗼</span>
                </a>
                
                ${auxLinksHtml}

                <div class="ph-mob-controls-right">
                    ${pomodoroAlertHtml}
                    <select class="ph-mob-project-select" id="phMobProjectSelect" title="Cambiar Red">
                        ${projectOptionsHtml}
                    </select>
                    <a href="/v7/profile" data-link class="ph-mob-user">
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
        const globalSelect = document.getElementById('phMobProjectSelect');
        if (globalSelect) {
            globalSelect.addEventListener('change', (e) => {
                const selectedId = e.target.value;
                localStorage.setItem('tt_active_project', selectedId);
                store.dispatch({
                    type: 'UPDATE_PROJECT_INFO',
                    payload: { projectId: selectedId, updates: { _lastSwitch: Date.now() } }
                }).then(() => {
                    window.location.reload(); 
                });
            });
        }

        // Lógica de Tabs Universal
        const tabBtns = document.querySelectorAll('.ph-tab-btn');
        if (tabBtns.length > 0) {
            tabBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    window.dispatchEvent(new CustomEvent('ph-tab-changed', { detail: { tabId: btn.dataset.tab } }));
                });
            });
        }
    }
};
