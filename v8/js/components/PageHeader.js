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
            <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px;">
                <div>
                    <h1 style="font-size: 2.2rem; color: white; margin: 0; letter-spacing: -1px; font-weight: 900;">
                        ${config.title}
                        ${config.subtitle ? `<span style="color: var(--accent-blue); font-size: 0.5em; margin-left: 10px; vertical-align: middle; border: 1px solid var(--accent-blue); padding: 4px 10px; border-radius: 12px; font-family: var(--font-mono);">${config.subtitle}</span>` : ''}
                    </h1>
                    <p style="color: var(--text-muted); font-size: 1rem; margin-top: 8px;">${config.tagline || ''}</p>
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    ${config.actionHtml || ''}
                    <div style="width: 45px; height: 45px; background: linear-gradient(135deg, var(--accent-purple), #7c4dff); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.2rem; box-shadow: 0 4px 15px rgba(224, 64, 251, 0.3);">
                        ${user?.name.charAt(0).toUpperCase() || '?'}
                    </div>
                </div>
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
