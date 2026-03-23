// v9/js/components/PageHeader.js
import { store } from '../core/store.js';

export class PageHeader {
    static getHtml(options = {}) {
        const state = store.getState();
        const activeUserId = state.session.activeUserId;
        const user = state.globalUsers.find(u => u.id === activeUserId);
        const initial = user ? user.name.charAt(0).toUpperCase() : '?';

        // Configuración por defecto
        const config = Object.assign({
            title: 'Kernel VNA',
            subtitle: 'Dashboard',
            tagline: '',
            tabs: [],
            actionHtml: '',
            magicActions: [] 
        }, options);

        let tabsHtml = '';
        if (config.tabs && config.tabs.length > 0) {
            tabsHtml = `
                <div class="ph-tabs">
                    ${config.tabs.map(t => `<button class="ph-tab ${t.active ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('')}
                </div>
            `;
        }

        let magicBtnHtml = '';
        if (config.magicActions && config.magicActions.length > 0) {
            magicBtnHtml = `
                <button class="ph-btn-magic" id="btnMagicDropdown">
                    ✨ Acciones IA ▾
                </button>
                <div class="ph-magic-menu" id="magicMenu">
                    ${config.magicActions.map(a => `
                        <div class="ph-magic-item" data-action="${a.id}">
                            <span class="ph-magic-icon">${a.icon}</span>
                            <div class="ph-magic-text">
                                <div class="ph-magic-title">${a.label}</div>
                                <div class="ph-magic-cost">${a.tokens ? `⚡ ${a.tokens} tokens` : '⚙️ Acción de Sistema'}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return `
            <style>
                .page-header { background: linear-gradient(180deg, rgba(20,20,25,0.9), rgba(20,20,25,0.4)); border-bottom: 1px solid var(--glass-border); padding: 2rem 3rem; margin: -2rem -3rem 2rem -3rem; display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 0; z-index: 50; backdrop-filter: blur(10px);}
                
                .ph-top-row { display: flex; justify-content: space-between; align-items: flex-start;}
                
                .ph-title-group { display: flex; flex-direction: column; gap: 5px; }
                .ph-title { font-size: 2.2rem; font-weight: 900; color: white; margin: 0; letter-spacing: -1px; display: flex; align-items: center; gap: 10px;}
                .ph-subtitle { font-size: 1rem; color: var(--accent-blue); font-family: var(--font-mono); font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border: 1px solid rgba(0, 176, 255, 0.3); padding: 2px 8px; border-radius: 6px; background: rgba(0, 176, 255, 0.1);}
                .ph-tagline { font-size: 0.95rem; color: var(--text-muted); font-style: italic; margin-top: 5px;}

                .ph-actions-group { display: flex; align-items: center; gap: 15px; position: relative;}
                
                /* User Menu */
                .ph-user-menu { display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.5); border: 1px solid #333; padding: 5px 15px 5px 5px; border-radius: 30px; cursor: pointer; transition: 0.3s;}
                .ph-user-menu:hover { border-color: var(--accent-blue); background: rgba(0,176,255,0.05);}
                .ph-avatar { width: 35px; height: 35px; border-radius: 50%; background: var(--accent-purple); display: flex; justify-content: center; align-items: center; color: white; font-weight: 900;}
                .ph-user-name { color: white; font-weight: bold; font-size: 0.9rem;}

                .ph-dropdown { position: absolute; top: 110%; right: 0; background: rgba(15,15,20,0.98); border: 1px solid #444; border-radius: 12px; width: 220px; box-shadow: 0 15px 40px rgba(0,0,0,0.8); display: none; flex-direction: column; overflow: hidden; animation: popIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); transform-origin: top right;}
                .ph-dropdown.active { display: flex; }
                .ph-dd-item { padding: 12px 20px; color: #ddd; text-decoration: none; font-size: 0.9rem; border-bottom: 1px solid #222; transition: 0.2s; display: flex; align-items: center; gap: 10px;}
                .ph-dd-item:hover { background: rgba(255,255,255,0.05); color: white; padding-left: 25px;}
                .ph-dd-item:last-child { border-bottom: none; }
                .ph-dd-logout { color: var(--accent-red); font-weight: bold;}
                .ph-dd-logout:hover { background: rgba(255,82,82,0.1); color: var(--accent-red);}

                /* Magic Actions (AI) */
                .ph-btn-magic { background: linear-gradient(135deg, rgba(224, 64, 251, 0.1), rgba(0, 176, 255, 0.1)); border: 1px solid var(--accent-purple); color: white; padding: 8px 16px; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px;}
                .ph-btn-magic:hover { box-shadow: 0 0 15px rgba(224, 64, 251, 0.3); border-color: var(--accent-blue);}
                
                .ph-magic-menu { position: absolute; top: 110%; right: 200px; background: rgba(15,15,20,0.98); border: 1px solid var(--accent-purple); border-radius: 12px; width: 280px; box-shadow: 0 15px 40px rgba(0,0,0,0.8), 0 0 20px rgba(224,64,251,0.2); display: none; flex-direction: column; overflow: hidden; animation: popIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); transform-origin: top right;}
                .ph-magic-menu.active { display: flex; }
                .ph-magic-item { padding: 12px 15px; display: flex; align-items: center; gap: 15px; cursor: pointer; border-bottom: 1px solid #333; transition: 0.2s;}
                .ph-magic-item:hover { background: rgba(224,64,251,0.1); }
                .ph-magic-item:last-child { border-bottom: none; }
                .ph-magic-icon { font-size: 1.5rem; }
                .ph-magic-text { display: flex; flex-direction: column; }
                .ph-magic-title { color: white; font-weight: bold; font-size: 0.9rem;}
                .ph-magic-cost { color: var(--accent-orange); font-size: 0.7rem; font-family: var(--font-mono);}

                /* Tabs */
                .ph-bottom-row { display: flex; gap: 20px; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem; margin-top: 0.5rem;}
                .ph-tabs { display: flex; gap: 10px; }
                .ph-tab { background: transparent; border: none; color: #888; font-size: 0.95rem; font-weight: bold; padding: 8px 16px; cursor: pointer; border-radius: 8px; transition: 0.2s;}
                .ph-tab:hover { color: white; background: rgba(255,255,255,0.05);}
                .ph-tab.active { background: rgba(0, 176, 255, 0.1); color: var(--accent-blue); }

                @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

                @media (max-width: 768px) {
                    .page-header { padding: 1.5rem; margin: -2rem -1rem 2rem -1rem; border-radius: 0 0 20px 20px; position: relative;}
                    .ph-top-row { flex-direction: column; gap: 1rem;}
                    .ph-title { font-size: 1.8rem; }
                    .ph-actions-group { width: 100%; justify-content: space-between; flex-direction: row-reverse;}
                    .ph-magic-menu { right: 0; left: 0; width: 100%; }
                    .ph-bottom-row { overflow-x: auto; padding-bottom: 5px; }
                }
            </style>

            <header class="page-header">
                <div class="ph-top-row">
                    <div class="ph-title-group">
                        <h1 class="ph-title">
                            ${config.title}
                            <span class="ph-subtitle">${config.subtitle}</span>
                        </h1>
                        ${config.tagline ? `<div class="ph-tagline">${config.tagline}</div>` : ''}
                    </div>
                    
                    <div class="ph-actions-group">
                        ${config.actionHtml}
                        ${magicBtnHtml}

                        <div class="ph-user-menu" id="btnUserMenu">
                            <div class="ph-avatar">${initial}</div>
                            <span class="ph-user-name">${user ? user.name : 'Invitado'}</span>
                            <span style="color:#666; font-size:0.8rem;">▼</span>
                        </div>

                        <div class="ph-dropdown" id="userDropdown">
                            <a href="/v9/profile" class="ph-dd-item" data-link>👤 Mi Perfil / SBTs</a>
                            <a href="/v9/pantheon" class="ph-dd-item" data-link>⚙️ Configuración (API Keys)</a>
                            <a href="/v9/team" class="ph-dd-item" data-link>👥 Nodos (Team)</a>
                            <a href="/v9/manifesto" class="ph-dd-item" data-link>📜 Manifiesto VNA</a>
                            <a href="/v9/tests" class="ph-dd-item" data-link>🩺 Diagnóstico de Sistema</a>
                            <a href="#" class="ph-dd-item ph-dd-logout" id="btnLogout">🚪 Desconectar Ecosistema</a>
                        </div>
                    </div>
                </div>
                
                ${tabsHtml ? `<div class="ph-bottom-row">${tabsHtml}</div>` : ''}
            </header>
        `;
    }

    static execute() {
        const btnMenu = document.getElementById('btnUserMenu');
        const dropdown = document.getElementById('userDropdown');
        const btnLogout = document.getElementById('btnLogout');
        
        const btnMagic = document.getElementById('btnMagicDropdown');
        const magicMenu = document.getElementById('magicMenu');

        if (btnMenu && dropdown) {
            btnMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
                if (magicMenu) magicMenu.classList.remove('active');
            });
        }

        if (btnMagic && magicMenu) {
            btnMagic.addEventListener('click', (e) => {
                e.stopPropagation();
                magicMenu.classList.toggle('active');
                if (dropdown) dropdown.classList.remove('active');
            });
        }

        document.addEventListener('click', (e) => {
            if (dropdown && !dropdown.contains(e.target) && !btnMenu.contains(e.target)) {
                dropdown.classList.remove('active');
            }
            if (magicMenu && !magicMenu.contains(e.target) && !btnMagic.contains(e.target)) {
                magicMenu.classList.remove('active');
            }
        });

        if (btnLogout) {
            btnLogout.addEventListener('click', async (e) => {
                e.preventDefault();
                await store.dispatch({ type: 'LOGOUT_USER' });
                // 🔥 REDIRECCIÓN MIGRADA AL LOGIN ZERO-TRUST DE LA V9
                window.location.href = '/v9/';
            });
        }

        const tabs = document.querySelectorAll('.ph-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                const tabId = e.target.dataset.tab;
                window.dispatchEvent(new CustomEvent('ph-tab-changed', { detail: { tabId } }));
            });
        });

        const magicItems = document.querySelectorAll('.ph-magic-item');
        magicItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const actionId = e.currentTarget.dataset.action;
                magicMenu.classList.remove('active');
                window.dispatchEvent(new CustomEvent('ph-magic-action', { detail: { actionId } }));
            });
        });
    }
}
