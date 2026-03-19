// v8/js/components/PageHeader.js
import { store } from '../core/store.js';

export const PageHeader = {
    getHtml: (config = {}) => {
        const state = store.getState();
        const user = state.globalUsers.find(u => u.id === state.session.activeUserId);
        const userName = user ? user.name : 'Usuario';
        const userInitials = userName.substring(0, 2).toUpperCase();
        
        // Pings (Notificaciones Usenet)
        let pingCount = 0;
        state.projects.forEach(p => {
            if (p.logs) {
                const unread = p.logs.filter(l => l.mentions && l.mentions.includes(state.session.activeUserId) && (!l.readBy || !l.readBy.includes(state.session.activeUserId)));
                pingCount += unread.length;
            }
        });

        const badgeHtml = pingCount > 0 ? `<div class="ping-badge">${pingCount}</div>` : '';

        const tabsHtml = config.tabs ? `
            <div class="ph-tabs">
                ${config.tabs.map(tab => `
                    <button class="ph-tab ${tab.active ? 'active' : ''}" data-target="${tab.id}">${tab.label}</button>
                `).join('')}
            </div>
        ` : '';

        const magicActionsHtml = config.magicActions ? `
            <div class="ph-magic-menu">
                <button class="ph-btn-magic" id="btnMagicMenu">✨ IA ▾</button>
                <div class="ph-magic-dropdown" id="magicDropdown">
                    ${config.magicActions.map(action => `
                        <div class="ph-magic-item" data-action="${action.id}">
                            <div class="ph-magic-icon">${action.icon}</div>
                            <div class="ph-magic-text"><strong>${action.label}</strong></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : '';

        return `
            <style>
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; position: relative; z-index: 100; width: 100%; flex-wrap: nowrap; gap: 20px;}
                
                .ph-left { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 0; }
                .ph-title { color: white; font-size: 1.8rem; font-weight: 900; margin: 0; letter-spacing: -1px; display:flex; align-items:center; gap:10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .ph-subtitle { font-size: 0.8rem; background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); padding: 4px 10px; border-radius: 8px; font-family: var(--font-mono); font-weight: bold; border: 1px solid rgba(0, 176, 255, 0.3);}
                .ph-tagline { color: var(--text-muted); font-size: 0.9rem; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                
                .ph-right { display: flex; align-items: center; gap: 15px; flex-shrink: 0; }
                
                .ph-tabs { display: flex; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 12px; border: 1px solid var(--glass-border); gap: 5px;}
                .ph-tab { background: transparent; border: none; color: #888; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; font-size: 0.9rem;}
                .ph-tab:hover { color: white; background: rgba(255,255,255,0.05); }
                .ph-tab.active { background: rgba(255,255,255,0.1); color: white; }

                .ph-avatar-container { position: relative; cursor: pointer; display: flex; align-items: center;}
                .ph-avatar { width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); display: flex; justify-content: center; align-items: center; color: white; font-weight: 900; font-size: 1.1rem; border: 2px solid #111; box-shadow: 0 5px 15px rgba(0,0,0,0.5); transition: 0.2s;}
                .ph-avatar:hover { transform: scale(1.05); }
                
                .ping-badge { position: absolute; top: -5px; right: -5px; background: var(--accent-red); color: white; font-size: 0.7rem; font-weight: bold; width: 20px; height: 20px; display: flex; justify-content: center; align-items: center; border-radius: 50%; border: 2px solid var(--bg-dark); box-shadow: 0 0 10px var(--accent-red); animation: pulsePing 2s infinite;}

                .ph-user-menu { position: absolute; top: 60px; right: 0; background: rgba(15,15,20,0.95); border: 1px solid var(--glass-border); border-radius: 16px; width: 220px; padding: 10px; box-shadow: 0 15px 40px rgba(0,0,0,0.8); backdrop-filter: blur(15px); display: none; flex-direction: column; gap: 5px; transform-origin: top right; animation: scaleIn 0.2s ease-out;}
                .ph-user-menu.open { display: flex; }
                .ph-menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 15px; color: #ccc; text-decoration: none; border-radius: 10px; transition: 0.2s; font-size: 0.9rem; font-weight: bold; border: 1px solid transparent; cursor:pointer; background: transparent; width: 100%; box-sizing: border-box; text-align: left;}
                .ph-menu-item:hover { background: rgba(255,255,255,0.05); color: white; border-color: #333; }
                .ph-menu-item.danger:hover { background: rgba(255,82,82,0.1); color: var(--accent-red); border-color: rgba(255,82,82,0.3); }

                /* MAGIC ACTIONS (IA) */
                .ph-magic-menu { position: relative; }
                .ph-btn-magic { background: rgba(224, 64, 251, 0.1); border: 1px solid rgba(224, 64, 251, 0.3); color: var(--accent-purple); padding: 8px 15px; border-radius: 10px; font-weight: 900; cursor: pointer; transition: 0.3s; font-size: 0.9rem;}
                .ph-btn-magic:hover { background: rgba(224, 64, 251, 0.2); box-shadow: 0 0 15px rgba(224, 64, 251, 0.3);}
                .ph-magic-dropdown { position: absolute; top: 50px; right: 0; background: rgba(10,10,15,0.95); border: 1px solid var(--accent-purple); border-radius: 16px; width: 220px; padding: 10px; box-shadow: 0 15px 40px rgba(0,0,0,0.8); backdrop-filter: blur(15px); display: none; flex-direction: column; gap: 5px;}
                .ph-magic-dropdown.open { display: flex; animation: scaleIn 0.2s ease-out;}
                .ph-magic-item { display: flex; align-items: center; gap: 15px; padding: 12px; border-radius: 10px; cursor: pointer; transition: 0.2s; border: 1px solid transparent;}
                .ph-magic-item:hover { background: rgba(224, 64, 251, 0.1); border-color: rgba(224, 64, 251, 0.3); }

                @keyframes pulsePing { 0% { box-shadow: 0 0 0 0 rgba(255,82,82,0.7); } 70% { box-shadow: 0 0 0 10px rgba(255,82,82,0); } 100% { box-shadow: 0 0 0 0 rgba(255,82,82,0); } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                @media (max-width: 1024px) {
                    .page-header { flex-direction: column; gap: 15px; align-items: flex-start; }
                    .ph-right { justify-content: space-between; width: 100%; flex-wrap: wrap;}
                }
            </style>

            <header class="page-header">
                <div class="ph-left">
                    <h1 class="ph-title">${config.title || 'TeamTowers'} ${config.subtitle ? `<span class="ph-subtitle">${config.subtitle}</span>` : ''}</h1>
                    ${config.tagline ? `<p class="ph-tagline">${config.tagline}</p>` : ''}
                </div>
                <div class="ph-right">
                    ${tabsHtml}
                    ${magicActionsHtml}
                    ${config.actionHtml ? config.actionHtml : ''}
                    
                    <div class="ph-avatar-container" id="phAvatarToggle">
                        <div class="ph-avatar">${userInitials}</div>
                        ${badgeHtml}
                        
                        <div class="ph-user-menu" id="phUserMenu">
                            <div style="padding: 10px 15px; border-bottom: 1px dashed #333; margin-bottom: 5px;">
                                <div style="color: white; font-weight: bold;">${userName}</div>
                                <div style="color: #888; font-size: 0.75rem; font-family: monospace;">${state.session.activeUserId}</div>
                            </div>
                            <a href="/v8/profile" data-link class="ph-menu-item">👤 Mi ADN (Perfil)</a>
                            <a href="/v8/settings" data-link class="ph-menu-item">⚙️ Consola Global</a>
                            <button class="ph-menu-item danger" id="btnLogoutAction">🚪 Desconectar Nodo</button>
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    execute: () => {
        // TABS LOGIC
        const tabs = document.querySelectorAll('.ph-tab');
        tabs.forEach(tab => {
            tab.onclick = (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                window.dispatchEvent(new CustomEvent('ph-tab-changed', { detail: { tabId: e.currentTarget.dataset.target } }));
            };
        });

        // USER DROPDOWN LOGIC
        const avatarToggle = document.getElementById('phAvatarToggle');
        const userMenu = document.getElementById('phUserMenu');
        if (avatarToggle && userMenu) {
            avatarToggle.onclick = (e) => {
                if (!e.target.closest('.ph-user-menu')) {
                    userMenu.classList.toggle('open');
                }
            };
        }

        // 🔥 FIX LOGOUT: Asignación directa e inmutable
        const btnLogout = document.getElementById('btnLogoutAction');
        if (btnLogout) {
            btnLogout.onclick = async (e) => {
                e.preventDefault();
                await store.dispatch({ type: 'LOGOUT_USER' });
                localStorage.removeItem('tt_active_project');
                window.location.href = '/v8/'; 
            };
        }

        // MAGIC MENU LOGIC
        const btnMagic = document.getElementById('btnMagicMenu');
        const magicDrop = document.getElementById('magicDropdown');
        if (btnMagic && magicDrop) {
            btnMagic.onclick = () => magicDrop.classList.toggle('open');
        }

        // Global click listener para cerrar menús
        document.onclick = (e) => {
            if (avatarToggle && !avatarToggle.contains(e.target)) {
                userMenu?.classList.remove('open');
            }
            if (btnMagic && !btnMagic.contains(e.target) && !magicDrop?.contains(e.target)) {
                magicDrop?.classList.remove('open');
            }
        };
    }
};
