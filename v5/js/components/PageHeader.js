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

        return `
            <style>
                /* REUSABLE PAGE HEADER STYLES (DRY V8.3) */
                .ph-mobile-top-bar { display: none; justify-content: space-between; align-items: center; padding: 15px 20px; background: rgba(10, 10, 14, 0.95); border-bottom: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(10px); position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; box-sizing: border-box; }
                .ph-mob-brand { display: flex; align-items: center; gap: 10px; color: white; text-decoration: none; font-weight: bold; font-size: 1.2rem;}
                .ph-mob-project-select { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: var(--accent-blue); padding: 5px 10px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.8rem; outline: none; max-width: 150px; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;}
                .ph-mob-user { display: flex; align-items: center; justify-content: center; width: 35px; height: 35px; background: var(--accent-purple); color: white; border-radius: 50%; font-weight: bold; text-decoration: none; font-size: 0.9rem; flex-shrink:0;}

                .ph-view-header { margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;}
                .ph-view-header h1 { font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;}
                .ph-view-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 5px; }
                .ph-header-subtitle { color: var(--accent-blue); font-weight: 600; font-family: inherit;}

                .ph-tabs-container { display: flex; background: rgba(0,0,0,0.5); padding: 6px; border-radius: 12px; border: 1px solid var(--glass-border); gap: 5px; margin-bottom: 2rem; overflow-x: auto; white-space: nowrap; scrollbar-width: none; }
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
                <a href="/v5/" data-link class="ph-mob-brand">🗼</a>
                <select class="ph-mob-project-select" id="phMobProjectSelect">
                    ${userProjects.map(p => `<option value="${p.id}" ${p.id === activeProjectId ? 'selected' : ''}>${p.nombre}</option>`).join('')}
                </select>
                <a href="/v5/profile" data-link class="ph-mob-user" title="Mi Perfil">
                    ${user?.name.charAt(0).toUpperCase() || '?'}
                </a>
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
