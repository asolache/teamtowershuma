// v8/js/components/PageHeader.js
import { store } from '../core/store.js';

export const PageHeader = {
    getHtml: (config) => {
        const state = store.getState();
        const user = state.globalUsers.find(u => u.id === state.session.activeUserId);

        // 1. Lógica de Pestañas (Botonera vs Select Deluxe)
        let tabsHtml = '';
        if (config.tabs && config.tabs.length > 0) {
            const isManyTabs = config.tabs.length >= 3;
            
            tabsHtml = `
                <div class="ph-tabs-container ${isManyTabs ? 'hide-on-mobile' : ''}">
                    ${config.tabs.map(t => `
                        <button class="ph-tab-btn ${t.active ? 'active' : ''}" data-tab="${t.id}">
                            ${t.label}
                        </button>
                    `).join('')}
                </div>
                ${isManyTabs ? `
                    <div class="ph-mob-tabs-wrapper show-on-mobile">
                        <select class="ph-mob-tabs-select" id="phMobTabsSelect">
                            ${config.tabs.map(t => `
                                <option value="${t.id}" ${t.active ? 'selected' : ''}>${t.label}</option>
                            `).join('')}
                        </select>
                    </div>
                ` : ''}
            `;
        }

        // 2. Lógica Magic Button (Selector Deluxe + IA Token Watcher)
        let magicHtml = '';
        if (config.magicActions && config.magicActions.length > 0) {
            magicHtml = `
                <div class="magic-action-group">
                    <select class="magic-select" id="phMagicSelect">
                        ${config.magicActions.map(a => `
                            <option value="${a.id}" data-isai="${a.isAi}" data-tokens="${a.tokens || 0}">
                                ${a.icon || '⚡'} ${a.label}
                            </option>
                        `).join('')}
                    </select>
                    <button class="btn-magic-exec" id="phMagicBtn">
                        ✨ Ejecutar
                        <span id="magicTokenCounter" class="token-badge" style="display:none;"></span>
                    </button>
                </div>
            `;
        }

        return `
            <style>
                .ph-global-top-bar { 
                    position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; 
                    display: flex; justify-content: space-between; align-items: center; 
                    padding: 12px 20px; background: rgba(10, 10, 14, 0.95); backdrop-filter: blur(20px);
                    border-bottom: 1px solid var(--glass-border);
                }
                .ph-view-header { margin-top: 20px; margin-bottom: 2rem; }
                .ph-title-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
                .ph-badge-startup { background: rgba(0, 230, 118, 0.1); color: var(--accent-green); border: 1px solid rgba(0, 230, 118, 0.3); padding: 4px 12px; border-radius: 20px; font-family: var(--font-mono); font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }

                /* Magic Button Styling */
                .magic-action-group { display: flex; gap: 10px; background: rgba(255,255,255,0.03); padding: 6px; border-radius: 14px; border: 1px solid var(--glass-border); margin-bottom: 1.5rem; max-width: fit-content; }
                .magic-select { appearance: none; background: rgba(0,0,0,0.5); border: 1px solid rgba(224, 64, 251, 0.3); color: white; padding: 10px 15px; border-radius: 10px; font-weight: bold; cursor: pointer; outline: none;}
                .btn-magic-exec { background: linear-gradient(135deg, var(--accent-purple), #7c4dff); color: white; border: none; padding: 0 20px; border-radius: 10px; font-weight: 900; height: 40px; cursor: pointer; display: flex; align-items: center; gap: 10px; }
                .token-badge { background: rgba(0,0,0,0.4); color: var(--accent-green); padding: 2px 6px; border-radius: 6px; font-size: 0.7rem; font-family: var(--font-mono); border: 1px solid rgba(0,230,118,0.2); }

                /* Tabs Styling */
                .ph-tabs-container { display: flex; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 14px; border: 1px solid var(--glass-border); gap: 4px; margin-bottom: 2rem; overflow-x: auto; }
                .ph-tab-btn { flex: 1; background: transparent; border: none; color: var(--text-muted); padding: 10px 20px; border-radius: 10px; font-size: 0.9rem; font-weight: 800; cursor: pointer; white-space: nowrap;}
                .ph-tab-btn.active { background: rgba(255,255,255,0.1); color: white; }
                .ph-mob-tabs-select { width: 100%; background: #111; border: 1px solid var(--accent-purple); color: white; padding: 14px; border-radius: 12px; font-weight: 800; margin-bottom: 2rem; }
                .show-on-mobile { display: none; }

                @media (max-width: 768px) {
                    .ph-title-row { flex-direction: column; align-items: flex-start; gap: 8px; }
                    .magic-action-group { width: 100%; max-width: 100%; flex-direction: column; }
                    .magic-select, .btn-magic-exec { width: 100%; }
                    .hide-on-mobile { display: none !important; }
                    .show-on-mobile { display: block !important; }
                }
            </style>

            <header class="ph-global-top-bar">
                <div style="font-weight: 900; color: white; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">🗼</span>
                    <span class="hide-on-mobile">TEAMTOWERS V8</span>
                </div>
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--accent-purple), #7c4dff); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; box-shadow: 0 4px 15px rgba(224, 64, 251, 0.3);">
                    ${user?.name.charAt(0).toUpperCase() || '?'}
                </div>
            </header>

            <div class="ph-view-header">
                <div class="ph-title-row">
                    <h1 style="font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; font-weight: 900;">${config.title}</h1>
                    ${config.subtitle ? `<span class="ph-badge-startup">${config.subtitle}</span>` : ''}
                </div>
                <p style="color: var(--text-muted); font-size: 1rem; margin-top: 8px;">${config.tagline || ''}</p>
            </div>

            ${magicHtml}
            ${tabsHtml}
        `;
    },

    execute: () => {
        // Lógica de Tabs
        const tabBtns = document.querySelectorAll('.ph-tab-btn');
        const mobSelect = document.getElementById('phMobTabsSelect');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (mobSelect) mobSelect.value = btn.dataset.tab;
                window.dispatchEvent(new CustomEvent('ph-tab-changed', { detail: { tabId: btn.dataset.tab } }));
            });
        });

        if (mobSelect) {
            mobSelect.addEventListener('change', (e) => {
                window.dispatchEvent(new CustomEvent('ph-tab-changed', { detail: { tabId: e.target.value } }));
            });
        }

        // Lógica Magic Button & IA Tokens
        const magicSelect = document.getElementById('phMagicSelect');
        const tokenBadge = document.getElementById('magicTokenCounter');
        
        if (magicSelect && tokenBadge) {
            const updateTokens = () => {
                const opt = magicSelect.options[magicSelect.selectedIndex];
                const isAi = opt.dataset.isai === 'true';
                const tokens = opt.dataset.tokens;
                if (isAi && tokens > 0) {
                    tokenBadge.style.display = 'inline-block';
                    tokenBadge.innerText = `🪙 ${tokens}`;
                } else {
                    tokenBadge.style.display = 'none';
                }
            };
            magicSelect.addEventListener('change', updateTokens);
            updateTokens();

            document.getElementById('phMagicBtn').addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('ph-magic-action', { detail: { actionId: magicSelect.value } }));
            });
        }
    }
};
