import { store } from '../core/store.js';

export const BottomNav = {
    getHtml: (activePath = '') => {
        const state = store.getState();
        if (window.location.pathname === '/v5/' && !state.session.activeUserId) return '';

        return `
            <nav class="bottom-nav">
                <div class="bn-menu">
                    <a href="/v5/ledger" data-link class="bn-item ${activePath === '/ledger' ? 'active' : ''}">⚖️ Wallet</a>
                    <a href="/v5/focus" data-link class="bn-item ${activePath === '/focus' ? 'active' : ''}">🎯 Focus</a>
                    <a href="/v5/project" data-link class="bn-item ${activePath === '/project' ? 'active' : ''}">📋 Pull</a>
                    <a href="/v5/team" data-link class="bn-item ${activePath === '/team' ? 'active' : ''}">👥 Equipo</a>
                </div>
            </nav>
        `;
    }
};
