// v8/js/components/PageHeader.js
import { store } from '../core/store.js';

// 🔥 Override Global a prueba de balas para el Logout
window.tt_forceLogout = async () => {
    await store.dispatch({ type: 'LOGOUT_USER' });
    localStorage.removeItem('tt_active_project');
    window.location.href = '/v8/'; 
};

export const PageHeader = {
    getHtml: (config = {}) => {
        const state = store.getState();
        const user = state.globalUsers.find(u => u.id === state.session.activeUserId);
        const userName = user ? user.name : 'Usuario';
        const userInitials = userName.substring(0, 2).toUpperCase();
        
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

        return `
            <style>
                .page-header { 
                    display: flex !important; 
                    flex-direction: row !important; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 2rem; 
                    position: relative; 
                    z-index: 100; 
                    width: 100%; 
                    flex-wrap: nowrap !important; /* 🔥 FIX: Prohíbe terminantemente el salto de línea */
                    gap: 15px;
                }
                
                .ph-left { display: flex; flex-direction: column; gap: 5px; flex: 1 1 auto; min-width: 0; }
                .ph-title { color: white; font-size: 1.8rem; font-weight: 900; margin: 0; letter-spacing: -1px; display: flex; align-items: center; gap: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .ph-subtitle { font-size: 0.8rem; background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); padding: 4px 10px; border-radius: 8px; font-family: var(--font-mono); font-weight: bold; border: 1px solid rgba(0, 176, 255, 0.3);}
                .ph-tagline { color: var(--text-muted); font-size: 0.9rem; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                
                .ph-right { display: flex; align-items: center; gap: 15px; flex-shrink: 0; }
                
                .ph-tabs { display: flex; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 12px; border: 1px solid var(--glass-border); gap: 5px;}
                .ph-tab { background: transparent; border: none; color: #888; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; font-size: 0.9rem;}
                .ph-tab:hover { color: white; background: rgba(255,255,255,0.05); }
                .ph-tab.active { background: rgba(255,255,255,0.1); color: white; }

                .ph-avatar-container { position: relative; cursor: pointer; display: flex; align-items: center;}
                .ph-avatar { width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); display: flex; justify-content: center; align-items: center; color: white; font-weight: 900; font-size: 1.1rem; border: 2px solid #111; box-shadow: 0 5px 15px rgba(0,0,0,0.5); transition: 0.2s;}
                .ph-avatar:hover { transform: scale(1.05); }
                
                .ping-badge { position: absolute; top: -5px; right: -5px; background: var(--accent-red); color: white; font-size: 0.7rem; font-weight: bold; width: 20px; height: 20px; display: flex; justify-content: center; align-items: center; border-radius: 50%; border: 2px solid var(--bg-dark); box-shadow: 0 0 10px var(--accent-red); animation: pulsePing 2s infinite;}

                .ph-user-menu { position: absolute; top: 60px; right: 0; background: rgba(15,15,20,0.98); border: 1px solid var(--glass-border); border-radius: 16px; width: 240px; padding: 10px; box-shadow: 0 15px 40px rgba(0,0,0,0.9); backdrop-filter: blur(20px); display: none; flex-direction: column; gap: 5px; transform-origin: top right; animation: scaleIn 0.2s ease-out;}
                .ph-user-menu.open { display: flex; }
                .ph-menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 15px; color: #ccc; text-decoration: none; border-radius: 10px; transition: 0.2s; font-size: 0.9rem; font-weight: bold; border: 1px solid transparent; cursor: pointer; background: transparent; width: 100%; text-align: left; box-sizing: border-box;}
                .ph-menu-item:hover { background: rgba(255,255,255,0.05); color: white; border-color: #333; }
                .ph-menu-item.danger:hover { background: rgba(255,82,82,0.1); color: var(--accent-red); border-color: rgba(255,82,82,0.3); }

                @keyframes pulsePing { 0% { box-shadow: 0 0 0 0 rgba(255,82,82,0.7); } 70% { box-shadow: 0 0 0 10px rgba(255,82,82,0); } 100% { box-shadow: 0 0 0 0 rgba(255,82,82,0); } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                @media (max-width: 1024px) {
                    /* 🔥 FIX: Reducimos el tamaño del título en móvil pero MANTENEMOS todo en una línea */
                    .page-header { flex-wrap: nowrap !important; }
                    .ph-title { font-size: 1.2rem; }
                    .ph-tagline { display: none; } /* Ocultamos la tagline en móvil para que quepa todo */
                }
            </style>

            <header class="page-header">
                <div class="ph-left">
                    <h1 class="ph-title">${config.title || 'TeamTowers'} ${config.subtitle ? `<span class="ph-subtitle">${config.subtitle}</span>` : ''}</h1>
                    ${config.tagline ? `<p class="ph-tagline">${config.tagline}</p>` : ''}
                </div>
                <div class="ph-right">
                    ${tabsHtml}
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
                            <a href="/v8/agents" data-link class="ph-menu-item">🤖 Padrón Neuronal</a>
                            <a href="/v8/lms" data-link class="ph-menu-item">🧠 La Forja (LMS)</a>
                            <a href="/v8/settings" data-link class="ph-menu-item">⚙️ Consola Global</a>
                            <a href="/v8/tests" data-link class="ph-menu-item">🩺 Boot Diagnostics</a>
                            <div style="border-top: 1px solid #333; margin: 5px 0;"></div>
                            <button class="ph-menu-item danger" onclick="window.tt_forceLogout()">🚪 Desconectar Nodo</button>
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    execute: () => {
        const avatarToggle = document.getElementById('phAvatarToggle');
        const userMenu = document.getElementById('phUserMenu');
        const tabs = document.querySelectorAll('.ph-tab');

        if (avatarToggle && userMenu) {
            avatarToggle.addEventListener('click', (e) => {
                if (!e.target.closest('.ph-user-menu')) {
                    userMenu.classList.toggle('open');
                }
            });
        }

        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                window.dispatchEvent(new CustomEvent('ph-tab-changed', { detail: { tabId: e.currentTarget.dataset.target } }));
            });
        });

        document.addEventListener('click', (e) => {
            if (avatarToggle && !avatarToggle.contains(e.target) && userMenu) {
                userMenu.classList.remove('open');
            }
        });
    }
};
