// v8/js/components/PageHeader.js
import { store } from '../core/store.js';

export const PageHeader = {
    getHtml: (config) => {
        const state = store.getState();
        const user = state.globalUsers.find(u => u.id === state.session.activeUserId);

        let tabsHtml = '';
        if (config.tabs && config.tabs.length > 0) {
            tabsHtml = `
                <div class="ph-tabs-container">
                    ${config.tabs.map(t => `
                        <button class="ph-tab-btn ${t.active ? 'active' : ''}" data-tab="${t.id}">
                            ${t.label}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        return `
            <header class="ph-global-top-bar">
                <div style="font-weight: 900; color: white; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem; filter: drop-shadow(0 0 10px rgba(0,176,255,0.5));">🗼</span>
                    <span class="hide-on-mobile">SOS V8 Core</span>
                </div>
                
                <div style="display: flex; gap: 15px; align-items: center;">
                    <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-blue); background: rgba(0, 176, 255, 0.1); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(0, 176, 255, 0.2);">
                        ${user?.id || '@guest'}
                    </div>
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, var(--accent-purple), #7c4dff); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(224, 64, 251, 0.3); cursor: pointer;">
                        ${user?.name.charAt(0).toUpperCase() || '?'}
                    </div>
                </div>
            </header>

            <div class="ph-view-header">
                <div>
                    <h1 style="font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; font-weight: 900;">
                        ${config.title}
                        ${config.subtitle ? `<span style="color: var(--accent-blue); font-size: 0.5em; margin-left: 10px; vertical-align: middle; border: 1px solid var(--accent-blue); padding: 4px 10px; border-radius: 12px; font-family: var(--font-mono);">${config.subtitle}</span>` : ''}
                    </h1>
                    <p style="color: var(--text-muted); font-size: 1rem; margin-top: 8px;">${config.tagline || ''}</p>
                </div>
                ${config.actionHtml ? `<div style="margin-top: 10px;">${config.actionHtml}</div>` : ''}
            </div>

            ${tabsHtml}
        `;
    },

    execute: () => {
        const tabBtns = document.querySelectorAll('.ph-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                tabBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                window.dispatchEvent(new CustomEvent('ph-tab-changed', { detail: { tabId: e.target.dataset.tab } }));
            });
        });
    }
};
