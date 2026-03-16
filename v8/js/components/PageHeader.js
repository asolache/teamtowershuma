// v8/js/components/PageHeader.js
import { store } from '../core/store.js';

export const PageHeader = {
    getHtml: (config) => {
        const state = store.getState();
        const activeUserId = state.session?.activeUserId;
        const activeUser = activeUserId ? state.globalUsers.find(u => u.id === activeUserId) : null;
        
        // Protecciones contra undefined (Zero-Trust rendering)
        const initial = activeUser && activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'A';
        const userName = activeUser && activeUser.name ? activeUser.name : 'Desconocido';
        const roleText = state.session?.role === 'ecosystem-owner' ? '👑 Owner' : '⚔️ Nodo';

        // TABS GENERATOR
        let tabsHtml = '';
        if (config.tabs && config.tabs.length > 0) {
            const tabsList = config.tabs.map(t => `
                <button class="ph-tab-btn ${t.active ? 'active' : ''}" data-tab="${t.id}">
                    ${t.label}
                    ${t.badge ? `<span class="ph-tab-badge">${t.badge}</span>` : ''}
                </button>
            `).join('');
            tabsHtml = `<div class="ph-tabs-container">${tabsList}</div>`;
        }

        // MAGIC ACTIONS GENERATOR
        let magicHtml = '';
        if (config.magicActions && config.magicActions.length > 0) {
            const actionsList = config.magicActions.map(a => `
                <button class="ph-magic-btn" data-action="${a.id}" title="${a.label}">
                    <span class="magic-icon">${a.icon}</span>
                    <span class="magic-label">${a.label}</span>
                    ${a.isAi ? `<span class="magic-tokens">✨ ${a.tokens || 10}</span>` : ''}
                </button>
            `).join('');
            magicHtml = `<div class="ph-magic-container">${actionsList}</div>`;
        }

        return `
            <style>
                .ph-view-header { margin-bottom: 2rem; position: relative; z-index: 1000; padding-right: 65px; min-height: 50px;}
                
                /* AVATAR MENU */
                .ph-user-menu { position: absolute; top: 0; right: 0; z-index: 10000; }
                .ph-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.4rem; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border: 2px solid rgba(255,255,255,0.2); user-select: none; box-shadow: 0 5px 15px rgba(0,0,0,0.5);}
                .ph-avatar:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(179, 136, 255, 0.4); border-color: white;}
                
                /* DROPDOWN MENU */
                .ph-dropdown { position: absolute; top: 65px; right: 0; background: rgba(15,15,20,0.95); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 16px; width: 240px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); display: flex; flex-direction: column; overflow: hidden; opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); z-index: 10000;}
                .ph-dropdown.open { opacity: 1; visibility: visible; transform: translateY(0); }
                
                .ph-drop-header { padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.4); }
                .ph-drop-name { color: white; font-weight: 900; font-size: 1rem; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
                .ph-drop-role { color: var(--accent-orange); font-size: 0.75rem; font-family: var(--font-mono); font-weight: bold;}
                
                .ph-drop-item { padding: 12px 20px; color: #ccc; text-decoration: none; font-size: 0.9rem; font-weight: bold; border-bottom: 1px dashed rgba(255,255,255,0.05); display: flex; align-items: center; gap: 10px; transition: 0.2s; background: transparent; text-align: left; border-left: 2px solid transparent; width: 100%; box-sizing: border-box; cursor: pointer; font-family: inherit;}
                .ph-drop-item:hover { background: rgba(255,255,255,0.03); color: white; border-left-color: var(--accent-blue); padding-left: 25px;}
                .ph-drop-item.danger { color: var(--accent-red); border-bottom: none;}
                .ph-drop-item.danger:hover { border-left-color: var(--accent-red); background: rgba(255, 82, 82, 0.05); color: var(--accent-red);}

                /* TITULOS Y BOTONES */
                .ph-header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 15px; width: 100%;}
                .ph-titles h1 { color: white; font-size: 2.2rem; font-weight: 900; margin: 0 0 5px 0; letter-spacing: -1px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;}
                .ph-subtitle-badge { background: rgba(0, 230, 118, 0.1); border: 1px solid rgba(0, 230, 118, 0.3); color: var(--accent-green); font-size: 0.7rem; padding: 4px 10px; border-radius: 12px; font-family: var(--font-mono); text-transform: uppercase; font-weight: bold; letter-spacing: 1px;}
                .ph-tagline { color: var(--text-muted); font-size: 0.95rem; margin: 0; line-height: 1.5; }
                .ph-actions-area { display: flex; align-items: center; gap: 15px; flex-wrap: wrap; justify-content: flex-start;}
                
                /* MAGIC BUTTONS */
                .ph-magic-container { display: flex; background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); border-radius: 12px; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5); }
                .ph-magic-btn { background: transparent; border: none; color: white; padding: 10px 15px; font-family: var(--font-main); font-size: 0.9rem; font-weight: bold; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; border-right: 1px solid rgba(255,255,255,0.05); }
                .ph-magic-btn:last-child { border-right: none; }
                .ph-magic-btn:hover { background: rgba(224, 64, 251, 0.1); color: var(--accent-purple); }
                .magic-icon { font-size: 1.1rem; }
                .magic-tokens { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 8px; font-size: 0.7rem; font-family: var(--font-mono); color: #ccc; margin-left: 4px;}

                /* TABS */
                .ph-tabs-container { display: flex; gap: 5px; border-bottom: 1px solid var(--glass-border); padding-bottom: 0; margin-bottom: 2rem; overflow-x: auto; scrollbar-width: none; }
                .ph-tabs-container::-webkit-scrollbar { display: none; }
                .ph-tab-btn { background: transparent; border: none; color: #888; font-family: var(--font-main); font-size: 0.95rem; font-weight: 900; padding: 12px 20px; cursor: pointer; transition: all 0.3s; border-bottom: 3px solid transparent; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
                .ph-tab-btn:hover { color: white; }
                .ph-tab-btn.active { color: var(--accent-blue); border-bottom-color: var(--accent-blue); }
                .ph-tab-badge { background: rgba(255,255,255,0.1); color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; font-family: var(--font-mono); }
                .ph-tab-btn.active .ph-tab-badge { background: var(--accent-blue); color: black; }

                @media (max-width: 768px) {
                    .ph-titles h1 { font-size: 1.8rem; }
                    .ph-actions-area { width: 100%; justify-content: space-between;}
                    .ph-magic-container { flex: 1; justify-content: space-between;}
                    .ph-magic-btn { flex: 1; justify-content: center;}
                    .magic-label { display: none; }
                }
            </style>

            <header class="ph-view-header">
                
                <div class="ph-user-menu">
                    <div class="ph-avatar" id="phAvatarBtn" title="Menú del Ecosistema">${initial}</div>
                    
                    <div class="ph-dropdown" id="phDropdownMenu">
                        <div class="ph-drop-header">
                            <div class="ph-drop-name">${userName}</div>
                            <div class="ph-drop-role">${roleText}</div>
                        </div>
                        <a href="/v8/profile" class="ph-drop-item" data-link>👤 Mi Perfil (Ikigai)</a>
                        <a href="/v8/settings" class="ph-drop-item" data-link>⚙️ Configuración (Keys)</a>
                        <a href="/v8/manifesto" class="ph-drop-item" data-link>🏛️ El Manifiesto SOS</a>
                        <a href="/v8/help" class="ph-drop-item" data-link>📖 Centro de Ayuda</a>
                        <a href="/v8/tests" class="ph-drop-item" data-link style="color: var(--accent-green);">🟢 Auditoría Kernel</a>
                        <button class="ph-drop-item danger" id="phBtnLogout">🚪 Desconectar</button>
                    </div>
                </div>

                <div class="ph-header-top">
                    <div class="ph-titles">
                        <h1>
                            ${config.title || 'Sin Título'}
                            ${config.subtitle ? `<span class="ph-subtitle-badge">${config.subtitle}</span>` : ''}
                        </h1>
                        <p class="ph-tagline">${config.tagline || ''}</p>
                    </div>
                    
                    <div class="ph-actions-area">
                        ${config.actionHtml || ''}
                        ${magicHtml}
                    </div>
                </div>
                ${tabsHtml}
            </header>
        `;
    },

    execute: () => {
        // TABS LISTENER
        const tabBtns = document.querySelectorAll('.ph-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                tabBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                window.dispatchEvent(new CustomEvent('ph-tab-changed', { detail: { tabId } }));
            });
        });

        // MAGIC BUTTONS LISTENER
        const magicBtns = document.querySelectorAll('.ph-magic-btn');
        magicBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const actionId = e.currentTarget.dataset.action;
                window.dispatchEvent(new CustomEvent('ph-magic-action', { detail: { actionId } }));
            });
        });

        // DROPDOWN MENU LISTENER
        const avatarBtn = document.getElementById('phAvatarBtn');
        const dropdown = document.getElementById('phDropdownMenu');
        
        if (avatarBtn && dropdown) {
            avatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });
            
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !avatarBtn.contains(e.target)) {
                    dropdown.classList.remove('open');
                }
            });
        }

        // LOGOUT LISTENER (Arreglado el Type y la ID)
        const btnLogout = document.getElementById('phBtnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                if(confirm('¿Suspender sesión del Nodo Humano? Los agentes seguirán procesando en Local.')) {
                    // Despachamos al store la orden correcta
                    store.dispatch({ type: 'LOGOUT_USER' }).then(() => {
                        // Navegamos al index forzando una recarga de estado
                        window.location.href = '/v8/';
                    });
                }
            });
        }
    }
};
